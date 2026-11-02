"""ESP32 virtual: lo que tu programa ve a través de sus pines.

Tu firmware (compilado para la PC con el entorno `native`) le pide cosas a este ESP32 por TCP:
escribir y leer pines, mandar bytes por la UART2 hacia el MAX485, leer los VL53L0X y el BNO055.
Cada pedido pasa por el circuito: si el cable no está, el módulo no tiene energía o el pin
está mal, la respuesta es la misma que daría el hardware real (nada, basura o un timeout).

Simplificaciones honestas:
- I²C se simula por pedido completo (init, cambiar dirección, leer distancia), no registro por registro.
- Los bytes de la UART llegan en el instante en que terminan de transmitirse; la respuesta del
  motor llega 0.3 ms después y solo se recibe si en ese momento el MAX485 está escuchando (DE/RE en 0).
"""
from __future__ import annotations

import random
from collections import deque

from .electrico import Circuito
from .m0601 import crc8_maxim

BAUD_M0601 = 115200


def decodificar_tx(d: bytes) -> str:
    """Lo que dice una trama que el ESP32 manda a un motor, en palabras."""
    if len(d) < 10:
        return f"trama incompleta ({len(d)} bytes)"
    ok = "CRC ok" if crc8_maxim(d[:9]) == d[9] else "CRC MAL"
    if d[1] == 0x64:
        rpm = int.from_bytes(d[2:4], "big", signed=True)
        return f"ID {d[0]} · manejar a {rpm} rpm{' con freno' if d[7] == 0xFF else ''} · {ok}"
    if d[1] == 0xA0:
        return f"ID {d[0]} · cambiar a modo {d[9]} (2 = velocidad)"
    if d[1] == 0x74:
        return f"ID {d[0]} · consultar estado · {ok}"
    return f"ID {d[0]} · comando 0x{d[1]:02X} · {ok}"


def decodificar_rx(d: bytes) -> str:
    if len(d) < 10:
        return f"respuesta incompleta ({len(d)} bytes)"
    ok = "CRC ok" if crc8_maxim(d[:9]) == d[9] else "CRC MAL"
    rpm = int.from_bytes(d[4:6], "big", signed=True)
    corr = int.from_bytes(d[2:4], "big") * 8 / 1000
    return f"ID {d[0]} responde · {rpm} rpm · {corr:.2f} A · error {d[8]} · {ok}"


class Esp32Virtual:
    def __init__(self, circuito: Circuito, motores, sensores):
        self.c = circuito
        self.motores = motores          # lista de M0601 en el bus
        self.sensores = sensores
        self.rng = random.Random(7)
        self.reiniciar()

    def reiniciar(self):
        self.modos: dict[int, str] = {}
        self.c.salidas_esp32.clear()
        self.uart2 = None               # (baud, rx, tx)
        self.rx2: deque[tuple[float, bytes, bool]] = deque()   # (t llegada, bytes, legible)
        self.hist_re: list[tuple[float, float]] = []           # (t, voltaje en RE)
        self.usb_rx = bytearray()
        self.usb_tx: deque[bytes] = deque(maxlen=2000)
        self.i2c = (21, 22)
        self.vl_dir: dict[str, int] = {}                       # dirección actual de cada VL53L0X
        self.vl_vivo: dict[str, bool] = {}
        self.bus_log: deque = deque(maxlen=80)                  # tramas del bus RS485, ya explicadas
        self.tx_tiempos: deque = deque(maxlen=600)
        self.hist_pines: dict[int, deque] = {}
        self.contador = {"tx_bus": 0, "rx_ok": 0, "rx_perdidas": 0}

    @property
    def vivo(self) -> bool:
        return self.c.esp_vivo and "ESP32" not in self.c.danos

    # ---------------------------------------------------------------- pines
    def pin_mode(self, g: int, modo: str, t: float):
        self.modos[g] = modo
        if modo != "O":
            self.c.salidas_esp32.pop(g, None)
        self.c.evaluar(rapido=True)
        self._anotar_re(t)

    def digital_write(self, g: int, nivel: int, t: float):
        if self.modos.get(g) != "O" or not self.vivo:
            return
        if g in (34, 35, 36, 39):
            return                       # solo entrada: el pin no puede manejar nada
        nivel = 1 if nivel else 0
        if self.c.salidas_esp32.get(g) != nivel:      # solo se recalcula el circuito si el pin cambió
            self.c.salidas_esp32[g] = nivel
            self.hist_pines.setdefault(g, deque(maxlen=300)).append((t, nivel))
            self.c.evaluar(rapido=True)
        self._anotar_re(t)

    def digital_read(self, g: int) -> int:
        if not self.vivo:
            return 0
        n = self.c.nivel_gpio(g)
        if n is None:
            modo = self.modos.get(g)
            if modo == "U" and g not in (34, 35, 36, 39):
                return 1
            if modo == "D" and g not in (34, 35, 36, 39):
                return 0
            return self.rng.randint(0, 1)          # pin al aire: lee lo que sea
        return n

    def analog_mv(self, g: int) -> int:
        return self.c.milivolts(g) if self.vivo else 0

    def _anotar_re(self, t: float):
        v = self.c.volt("M.RE")
        self.hist_re.append((t, v if v is not None else 3.3))   # RE al aire: el MAX485 no escucha bien
        if len(self.hist_re) > 400:
            del self.hist_re[:200]

    def _re_en(self, t: float) -> float:
        v = 3.3
        for ti, vi in self.hist_re:
            if ti <= t:
                v = vi
            else:
                break
        return v

    # ---------------------------------------------------------------- UART2 ↔ MAX485 ↔ bus RS485
    def uart2_begin(self, baud: int, rx: int, tx: int):
        self.uart2 = (baud, rx, tx)
        self.c.salidas_esp32[tx] = 1                 # una UART en reposo mantiene su línea TX en alto
        self.c.evaluar(rapido=True)

    def _camino_tx(self) -> str | None:
        c = self.c
        if not self.uart2:
            return "La UART2 no se inició (falta Serial2.begin)"
        _, _, tx = self.uart2
        if not c.unidos(f"E.{tx}", "M.DI"):
            return f"El GPIO {tx} (TX) no llega al DI del MAX485"
        if not c.modulo_ok("MAX485", "M.VCC", "M.GND", 4.5):
            return "El MAX485 no tiene 5 V o tierra"
        v_de = c.volt("M.DE")
        if v_de is None or v_de < 2.0:
            return "DE del MAX485 está en 0: el MAX485 no transmite"
        return None

    def _camino_rx(self) -> str | None:
        c = self.c
        _, rx, _ = self.uart2
        if not c.unidos("M.RO", "L.HV1") or not c.unidos("L.LV1", f"E.{rx}"):
            return f"RO del MAX485 no llega al GPIO {rx} a través del convertidor de nivel"
        if not (c.dif("L.HV", "L.GNDH") >= 4.5 and c.dif("L.LV", "L.GNDL") >= 3.0):
            return "El convertidor de nivel no tiene sus dos voltajes (HV 5 V y LV 3.3 V)"
        return None

    def uart2_write(self, datos: bytes, t: float):
        if not self.vivo or not self.uart2:
            return
        baud = self.uart2[0]
        fin = t + len(datos) * 10 / baud
        motivo = self._camino_tx()
        if motivo:
            self.c.avisos.append(motivo)
            self.bus_log.append({"t": round(t, 3), "dir": "tx", "hex": datos.hex(" "), "texto": motivo, "ok": False})
            return
        self.contador["tx_bus"] += 1
        self.tx_tiempos.append(t)
        if abs(baud - BAUD_M0601) / BAUD_M0601 > 0.03:
            datos = bytes(self.rng.randint(0, 255) for _ in datos)   # velocidad equivocada: el motor lee basura
        llegaron = []
        for m, pref in zip(self.motores, ("ML", "MR")):
            directo = self.c.unidos("M.A", f"{pref}.A") and self.c.unidos("M.B", f"{pref}.B")
            cruzado = self.c.unidos("M.A", f"{pref}.B") and self.c.unidos("M.B", f"{pref}.A")
            if not (directo or cruzado):
                continue
            llegaron.append(m.id)
            llega = datos if directo else bytes(b ^ 0xFF for b in datos)    # A y B al revés: bits invertidos
            for k in range(0, len(llega) - 9, 10):
                resp = m.recibir(llega[k:k + 10], fin)
                if resp is not None:
                    vuelve = resp if directo else bytes(b ^ 0xFF for b in resp)
                    self.rx2.append((fin + 0.0003 + len(resp) * 10 / BAUD_M0601, vuelve, True))
        quien = "llegó a los motores " + ", ".join(map(str, llegaron)) if llegaron else "no llegó a ningún motor (cable A/B suelto)"
        self.bus_log.append({"t": round(t, 3), "dir": "tx", "hex": datos.hex(" "), "texto": decodificar_tx(datos) + " · " + quien, "ok": bool(llegaron)})

    def uart2_read(self, t: float) -> bytes:
        if not self.vivo or not self.uart2:
            return b""
        out = bytearray()
        while self.rx2 and self.rx2[0][0] <= t:
            llegada, datos, _ = self.rx2.popleft()
            if self._re_en(llegada) > 0.8 or self._camino_rx():
                self.contador["rx_perdidas"] += 1          # el MAX485 estaba transmitiendo o no hay camino
                self.bus_log.append({"t": round(llegada, 3), "dir": "rx", "hex": datos.hex(" "), "texto": "respuesta PERDIDA: " + (self._camino_rx() or "el MAX485 seguía en modo transmitir (DE/RE en alto)"), "ok": False})
                continue
            self.bus_log.append({"t": round(llegada, 3), "dir": "rx", "hex": datos.hex(" "), "texto": decodificar_rx(datos), "ok": True})
            baud = self.uart2[0]
            if abs(baud - BAUD_M0601) / BAUD_M0601 > 0.03:
                datos = bytes(self.rng.randint(0, 255) for _ in datos)
            self.contador["rx_ok"] += 1
            out += datos
        return bytes(out)

    # ---------------------------------------------------------------- USB (hacia la Jetson)
    def usb_write(self, datos: bytes):
        if self.vivo:
            self.usb_tx.append(datos)

    def usb_read(self) -> bytes:
        if not self.vivo:
            return b""
        d, self.usb_rx = bytes(self.usb_rx), bytearray()
        return d

    # ---------------------------------------------------------------- I²C
    def i2c_begin(self, sda: int, scl: int):
        self.i2c = (sda, scl)

    def _en_bus(self, sda_pin: str, scl_pin: str) -> bool:
        sda, scl = self.i2c
        return self.c.unidos(f"E.{sda}", sda_pin) and self.c.unidos(f"E.{scl}", scl_pin)

    def _vl_disponibles(self) -> dict[str, int]:
        """Sensores encendidos y en el bus, con su dirección actual. Si se apagan, vuelven a 0x29."""
        out = {}
        for k in ("VL0", "VL1", "VL2", "VLP"):
            vivo = self.c.modulo_ok(k, f"{k}.VIN", f"{k}.GND", 2.6) and self.c.red(f"{k}.GND") == self.c.red("E.GND1")
            if vivo and k != "VLP":
                x = self.c.volt(f"{k}.XSHUT")
                vivo = x is None or x > 1.0
            if not vivo:
                self.vl_dir.pop(k, None)
            elif not self.vl_vivo.get(k):
                self.vl_dir[k] = 0x29
            self.vl_vivo[k] = vivo
            if vivo and self._en_bus(f"{k}.SDA", f"{k}.SCL"):
                out[k] = self.vl_dir[k]
        return out

    def vl_init(self, direccion: int) -> bool:
        if not self.vivo:
            return False
        quienes = [k for k, d in self._vl_disponibles().items() if d == direccion]
        return len(quienes) == 1              # dos en la misma dirección: el bus da basura

    def vl_set_address(self, vieja: int, nueva: int) -> bool:
        if not self.vivo:
            return False
        quienes = [k for k, d in self._vl_disponibles().items() if d == vieja]
        for k in quienes:
            self.vl_dir[k] = nueva & 0x7F
        return len(quienes) >= 1

    def vl_read(self, direccion: int) -> int:
        if not self.vivo:
            return -1
        quienes = [k for k, d in self._vl_disponibles().items() if d == direccion]
        if len(quienes) != 1:
            return -1                          # timeout (Pololu devuelve 65535)
        return self.sensores.distancia_mm(quienes[0])

    def bno_ok(self) -> bool:
        return (self.vivo and self.c.modulo_ok("BNO055", "B.VIN", "B.GND", 2.6)
                and self._en_bus("B.SDA", "B.SCL"))

    def bno_euler(self):
        return self.sensores.euler() if self.bno_ok() else None
