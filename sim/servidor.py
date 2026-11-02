"""Servidor del simulador del carrito Aether.

Uso (laptop, PowerShell, en la carpeta del repo):
    backend\\.venv\\Scripts\\python.exe sim\\servidor.py
    backend\\.venv\\Scripts\\python.exe sim\\servidor.py --firmware firmware\\motor_control\\.pio\\build\\native\\program.exe

Abre http://localhost:8770 en Chrome.

Puertos (solo en esta computadora):
  8770  página del simulador (HTTP + WebSocket)
  7700  pines del ESP32 virtual: aquí se conecta tu firmware compilado para la PC (entorno native)
  7701  el cable USB del ESP32 hacia la Jetson: tu código de Python abre "socket://localhost:7701"

El simulador corre en tiempo real. Con --firmware, el programa arranca cuando el ESP32 recibe
energía y se detiene cuando la pierde (como en el carrito real: sin energía no corre nada).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import math
import mimetypes
import os
import pathlib
import re
import subprocess
import sys
import time

from websockets.asyncio.server import serve
from websockets.datastructures import Headers
from websockets.http11 import Response

AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))

from firmware_ref import FirmwareRef  # noqa: E402
from nucleo import mundo  # noqa: E402
from nucleo.explicaciones import PINES, explicacion  # noqa: E402
from nucleo.simulacion import Simulacion  # noqa: E402

RAIZ = AQUI.parent
NL = bytes([10])
SERVIDOR = None                    # el Servidor en marcha (lo usan las rutas HTTP /status y /vision.json)
PROGRAMAS = RAIZ / "edge" / "navigation" / "programas"
NOMBRE_PROGRAMA = re.compile(r"^[A-Za-z0-9_\-]{1,40}$")
LINEAS_SILENCIOSAS = ("ODO", "MOT", "RNG", "PWR")      # llegan muchas por segundo: se guardan, no se listan

CASOS = {
    "caja_fija": ("Caja que no se quita", "Una caja queda en la recta de ida.",
                  "El ESP32 frena a ~40 cm sin chocar. La Jetson espera y a los 20 s dice «Necesito ayuda»."),
    "persona_se_retira": ("Persona en el camino que se retira", "Una persona está parada en la recta y se va 8 s después de que el carrito se detiene.",
                          "Frena, espera, y cuando se quita (más de 50 cm libres) sigue solo."),
    "persona_cruza": ("Persona que cruza despacio", "Una persona cruza la recta caminando cuando el carrito ya va a 0.35 m/s.",
                      "Frena mientras está enfrente y reanuda en cuanto pasa."),
    "persona_acople": ("Persona en el acople de la descarga", "Una persona se para entre el carrito y la estación durante el acople lento.",
                       "El reflejo de 40 cm no aplica al acoplar; el ESP32 sabe a qué distancia debe ver la estación y frena si ve algo antes."),
    "caja_atras": ("Caja detrás al retroceder (sin sensor trasero)", "Una caja queda detrás del carrito en la reversa de salida de la banda.",
                   "No hay sensor atrás: choca despacio (0.10 m/s), las ruedas no avanzan y a los 1.5 s el ESP32 avisa «atascado»; la Jetson abandona la misión."),
}

ESTATICOS = {"/": AQUI / "web" / "index.html"}


class Servidor:
    def __init__(self, firmware: str | None, ref: bool = False):
        self.sim = Simulacion()
        self.sim.colocar(0.0, 0.0, 0.0)          # empieza acoplado en la banda
        self.t0 = time.monotonic()
        self.navegadores = set()
        self.usb_clientes: set[asyncio.StreamWriter] = set()
        self.firmware = firmware
        self.proceso: subprocess.Popen | None = None
        self.hal_conectado = False
        self.monitor: list[str] = []
        self._cambio_mundo = True
        self.ref = FirmwareRef(self.sim, self._salida_usb) if ref else None
        if self.ref:
            self.sim.gancho = self.ref.paso
        self.mision: asyncio.subprocess.Process | None = None
        self.caso = None
        self.caso_id = None
        self._espera = None
        self.prog: asyncio.subprocess.Process | None = None
        self.salida_prog: list[str] = []
        self.modo = "sim"                    # "sim" = solo simulación; "dual" = simulación + ESP32 real a la vez
        self.real = None                     # puerto serie del ESP32 real (pyserial)
        self.puerto_real = ""
        self.real_info = {"lineas": 0, "ultimo": 0.0, "bat_v": None, "paro_mv": None, "frente_mm": None, "pose": None, "s_prev": None}
        self._resto_real = ""
        self.ver_cables = False

    # ------------------------------------------------------------ tiempo real
    def ahora(self) -> float:
        return time.monotonic() - self.t0

    def avanzar(self):
        dt = self.ahora() - self.sim.t
        if dt > 0.04:                              # si la PC no alcanza, el simulador va un poco más lento que el tiempo real, sin saltos
            self.t0 += dt - 0.04
            dt = 0.04
        if dt >= 0.001:
            self.sim.paso(dt)
        for ev in self.sim.eventos:
            self._evento(ev)
        self.sim.eventos.clear()
        self._agenda()

    def _evento(self, ev: str):
        self._monitor(f"[simulador] {'ESP32 encendido' if ev == 'esp32_encendido' else 'ESP32 sin energía'}")
        if ev == "esp32_encendido":
            self.arrancar_firmware()
        else:
            self.detener_firmware()

    def _orden(self, datos: bytes):
        """Una orden para el ESP32 (de un programa, del joystick o de la misión). En modo dual llega a los dos: al simulado y al real."""
        if self.sim.esp32.vivo:
            self.sim.esp32.usb_rx += datos
        if self.modo == "dual" and self.real is not None:
            try:
                self.real.write(datos)
            except Exception as ex:
                self._monitor(f"[ESP32 real] no pude escribir en el puerto: {ex}")

    def _salida_usb(self, datos: bytes):
        """Lo que el ESP32 SIMULADO manda por USB. Los programas solo lo ven en modo 'sim'; en modo dual ven el del ESP32 real."""
        self._monitor_usb(datos, "sim")
        if self.modo == "sim":
            for w in list(self.usb_clientes):
                w.write(datos)

    # ------------------------------------------------------------ ESP32 real (modo dual)
    def abrir_real(self, puerto: str):
        try:
            import serial
        except ImportError:
            sys.path.insert(0, str(pathlib.Path.home() / ".platformio" / "penv" / "Lib" / "site-packages"))   # PlatformIO ya trae pyserial
            try:
                import serial
            except ImportError:
                raise RuntimeError("Falta pyserial. Instálalo con:  backend\\.venv\\Scripts\\python.exe -m pip install pyserial")
        if puerto == "auto":
            from serial.tools import list_ports
            cand = [q for q in list_ports.comports() if any(k in (q.description or "").upper() for k in ("CP210", "CH340", "USB SERIAL", "UART"))]
            if not cand:
                raise RuntimeError("No encontré el ESP32 en ningún puerto USB (revisa que el cable sea de datos).")
            puerto = cand[0].device
        self.real = serial.serial_for_url(puerto, baudrate=115200, timeout=0.05)
        self.puerto_real = puerto

    async def leer_real(self):
        bucle = asyncio.get_running_loop()
        while self.real is not None:
            try:
                datos = await bucle.run_in_executor(None, self.real.read, 4096)
            except Exception as ex:
                self._monitor(f"[ESP32 real] se perdió el puerto: {ex}")
                self.real = None
                self.modo = "sim"
                return
            if datos:
                self._entra_real(datos)

    def _entra_real(self, datos: bytes):
        """Líneas del ESP32 real: se leen para comparar con el simulado y, en modo dual, se las pasan a los programas."""
        if self.modo == "dual":
            for w in list(self.usb_clientes):
                w.write(datos)
        texto = self._resto_real + datos.decode(errors="replace")
        *lineas, self._resto_real = texto.split(chr(10))
        info = self.real_info
        for ln in lineas:
            ln = ln.strip()
            t = ln.split()
            if not t:
                continue
            info["lineas"] += 1
            info["ultimo"] = time.monotonic()
            try:
                if t[0] == "ODO" and len(t) >= 6 and t[4] != "nan":
                    suma, th = (float(t[2]) + float(t[3])) / 2, float(t[4])
                    if info["pose"] is None:
                        c = self.sim.carrito
                        info["pose"] = [c.x, c.y, th]
                    elif info["s_prev"] is not None:
                        ds = suma - info["s_prev"]
                        info["pose"][0] += ds * math.cos(math.radians(th))
                        info["pose"][1] += ds * math.sin(math.radians(th))
                    info["s_prev"] = suma
                    info["pose"][2] = th
                elif t[0] == "PWR" and len(t) >= 3:
                    info["bat_v"], info["paro_mv"] = int(t[1]) / 1000, int(t[2])
                elif t[0] == "RNG" and len(t) >= 2:
                    info["frente_mm"] = int(t[1])
            except ValueError:
                pass
            if t[0] not in LINEAS_SILENCIOSAS:
                self._monitor("[ESP32 real] " + ln)

    def cambiar_modo(self, modo: str):
        if modo not in ("sim", "dual"):
            raise ValueError("modo desconocido")
        if modo == "dual" and self.real is None:
            raise ValueError("No hay un ESP32 real conectado. Abre el servidor con:  --esp32 COM5  (o --esp32 auto) y recarga.")
        self.modo = modo
        self.alinear()
        self._monitor("[simulador] Modo: " + ("simulación + ESP32 real a la vez" if modo == "dual" else "solo simulación"))

    def alinear(self):
        """Pone el origen del carrito real donde está el simulado, para comparar posiciones."""
        self.real_info["pose"] = None
        self.real_info["s_prev"] = None

    def _monitor(self, texto: str):
        self.monitor.append(texto)
        del self.monitor[:-300]

    # ------------------------------------------------------------ firmware nativo
    def arrancar_firmware(self):
        if not self.firmware or self.proceso:
            return
        ruta = pathlib.Path(self.firmware)
        if not ruta.exists():
            self._monitor(f"[simulador] No encuentro el firmware {ruta}. ¿Ya compilaste con: pio run -e native?")
            return
        self.proceso = subprocess.Popen([str(ruta)], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        self._monitor(f"[simulador] Arranqué tu firmware: {ruta.name}")

    def detener_firmware(self):
        if self.proceso:
            self.proceso.kill()
            self.proceso = None
        self.sim.esp32.reiniciar()

    # ------------------------------------------------------------ misión de la Jetson (edge/navigation/mision.py)
    async def _lanzar_mision(self, ruta: str):
        self.detener_mision()
        self.detener_programa()
        script = RAIZ / "edge" / "navigation" / "mision.py"
        self.mision = await asyncio.create_subprocess_exec(
            sys.executable, str(script), "--puerto", "socket://127.0.0.1:7701", "--ruta", ruta, "--pausa-carga", "2", "--pausa-descarga", "2",
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT, env={**os.environ, "PYTHONIOENCODING": "utf-8"})
        self._monitor(f"[simulador] Arranqué el programa de la Jetson (mision.py, ruta {ruta})")
        proc = self.mision
        while linea := await proc.stdout.readline():
            self._monitor(linea.decode(errors="replace").rstrip())
        await proc.wait()
        if self.mision is proc:
            self.mision = None

    def detener_mision(self):
        if self.mision and self.mision.returncode is None:
            self.mision.kill()
            self._monitor("[simulador] Detuve el programa de la Jetson")
        self.mision = None
        self._orden(b"STOP" + NL)

    # ------------------------------------------------------------ programas del usuario (edge/navigation/programas)
    def lista_programas(self) -> list[str]:
        PROGRAMAS.mkdir(parents=True, exist_ok=True)
        return sorted(p.stem for p in PROGRAMAS.glob("*.py"))

    def _ruta_programa(self, nombre: str) -> pathlib.Path:
        if not NOMBRE_PROGRAMA.match(nombre or ""):
            raise ValueError("Nombre inválido: usa letras, números, guion y guion bajo (máximo 40)")
        return PROGRAMAS / f"{nombre}.py"

    def guardar_programa(self, nombre: str, codigo: str):
        ruta = self._ruta_programa(nombre)
        if len(codigo) > 200_000:
            raise ValueError("El programa es demasiado grande")
        PROGRAMAS.mkdir(parents=True, exist_ok=True)
        ruta.write_text(codigo.replace(chr(13) + chr(10), chr(10)), encoding="utf-8")

    def leer_programa(self, nombre: str) -> str:
        return self._ruta_programa(nombre).read_text(encoding="utf-8")

    async def _correr_programa(self, nombre: str):
        ruta = self._ruta_programa(nombre)
        self.detener_programa()
        self.detener_mision()
        self.salida_prog = [f"▶ {nombre}.py"]
        script = RAIZ / "edge" / "navigation" / "correr_programa.py"
        proc = self.prog = await asyncio.create_subprocess_exec(
            sys.executable, str(script), str(ruta), "--puerto", "socket://127.0.0.1:7701",
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
            env={**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUNBUFFERED": "1"})
        while linea := await proc.stdout.readline():
            self.salida_prog.append(linea.decode(errors="replace").rstrip())
            del self.salida_prog[:-300]
        codigo = await proc.wait()
        self.salida_prog.append(f"■ terminó con código {codigo}" + ("" if codigo == 0 else " (algo falló: mira arriba)"))
        if self.prog is proc:
            self.prog = None

    def detener_programa(self):
        if self.prog and self.prog.returncode is None:
            self.prog.kill()
            self.salida_prog.append("■ detenido por ti")
            self._orden(b"STOP" + NL)
        self.prog = None

    # ------------------------------------------------------------ casos de obstáculos
    def _poner(self, clase: str, x: float, y: float):
        o = (mundo.obstaculo_persona if clase == "persona" else mundo.obstaculo_caja)(x, y)
        self.sim.extra.append(o)
        self._cambio_mundo = True
        return o

    def _quitar(self, o):
        if o in self.sim.extra:
            self.sim.extra.remove(o)
            self._cambio_mundo = True

    def _caso_caja_fija(self):
        self._poner("caja", -2.4, 0.0)
        return
        yield

    def _caso_persona_se_retira(self):
        p = self._poner("persona", -2.4, 0.0)
        yield ("hasta", lambda: self.sim.carrito.x < -1.0 and self.sim.sensores.distancia_mm("VL0") < 400 and abs(self.sim.carrito.v) < 0.02)
        yield ("seg", 8)
        self._quitar(p)

    def _caso_persona_cruza(self):
        p = self._poner("persona", -2.7, -1.0)
        yield ("hasta", lambda: self.sim.carrito.x < -1.5 and self.sim.carrito.v > 0.2)
        while p.cy < 1.0:
            p.cy += 0.5 * 0.05
            self._cambio_mundo = True
            yield ("seg", 0.05)
        self._quitar(p)

    def _caso_persona_acople(self):
        yield ("hasta", lambda: self.sim.carrito.y > 0.6 and math.sin(self.sim.carrito.th) > 0.98)
        p = self._poner("persona", -3.82, 1.75)
        yield ("seg", 10)
        self._quitar(p)

    def _caso_caja_atras(self):
        self._poner("caja", -0.95, 0.0)
        return
        yield

    def iniciar_caso(self, nombre: str):
        if nombre not in CASOS:
            raise KeyError(f"caso desconocido: {nombre}")
        self.detener_mision()
        c = self.sim.circuito
        c.kcd1, c.paro_presionado = True, False
        self.sim.extra.clear()
        self.sim.colocar(0.0, 0.0, 0.0)
        self.caso_id, self._espera = nombre, None
        self.caso = getattr(self, f"_caso_{nombre}")()
        self._monitor(f"[simulador] Caso: {CASOS[nombre][0]}")
        self._cambio_mundo = True
        asyncio.ensure_future(self._lanzar_mision("ida"))

    def _agenda(self):
        if not self.caso:
            return
        if self._espera:
            tipo, v = self._espera
            if (tipo == "seg" and self.sim.t < v) or (tipo == "hasta" and not v()):
                return
        try:
            y = next(self.caso)
        except StopIteration:
            self.caso = self._espera = None
            return
        self._espera = ("seg", self.sim.t + y[1]) if y[0] == "seg" else y

    # ------------------------------------------------------------ pines (puerto 7700)
    async def hal(self, lector: asyncio.StreamReader, escritor: asyncio.StreamWriter):
        self.hal_conectado = True
        self._monitor("[simulador] Tu firmware se conectó a los pines del ESP32")
        try:
            while linea := await lector.readline():
                self.avanzar()
                resp = self.atender_hal(linea.decode(errors="replace").split())
                if resp is not None:
                    escritor.write((resp + "\n").encode())
                    await escritor.drain()
        except ConnectionError:
            pass
        finally:
            self.hal_conectado = False
            self._monitor("[simulador] Tu firmware se desconectó")

    def atender_hal(self, p: list[str]) -> str | None:
        if not p:
            return None
        e, t, cmd = self.sim.esp32, self.sim.t, p[0]
        try:
            if cmd == "HOLA":
                return "OK"
            if cmd == "PM":
                e.pin_mode(int(p[1]), p[2], t)
            elif cmd == "DW":
                e.digital_write(int(p[1]), int(p[2]), t)
            elif cmd == "DR?":
                return str(e.digital_read(int(p[1])))
            elif cmd == "AR?":
                return str(e.analog_mv(int(p[1])))
            elif cmd == "U2":
                e.uart2_begin(int(p[1]), int(p[2]), int(p[3]))
            elif cmd == "U2W":
                e.uart2_write(bytes.fromhex(p[1]), t)
            elif cmd == "U2R?":
                d = e.uart2_read(t)
                return d.hex() if d else "-"
            elif cmd == "U0W":
                datos = bytes.fromhex(p[1])
                self._salida_usb(datos)
            elif cmd == "U0R?":
                d = e.usb_read()
                return d.hex() if d else "-"
            elif cmd == "IB":
                e.i2c_begin(int(p[1]), int(p[2]))
            elif cmd == "VI?":
                return "1" if e.vl_init(int(p[1])) else "0"
            elif cmd == "VA?":
                return "1" if e.vl_set_address(int(p[1]), int(p[2])) else "0"
            elif cmd == "VR?":
                return str(e.vl_read(int(p[1])))
            elif cmd == "BI?":
                return "1" if e.bno_ok() else "0"
            elif cmd == "BE?":
                v = e.bno_euler()
                return "-" if v is None else " ".join(f"{x:.3f}" for x in v)
            else:
                return "ERR comando desconocido" if cmd.endswith("?") else None
        except (IndexError, ValueError) as ex:
            return f"ERR {ex}" if cmd.endswith("?") else None
        return None

    _linea_usb = ""

    def _monitor_usb(self, datos: bytes, origen: str = "sim"):
        self._linea_usb += datos.decode(errors="replace")
        *lineas, self._linea_usb = self._linea_usb.split(chr(10))
        for ln in lineas:
            ln = ln.rstrip(chr(13))
            if ln.split(" ")[0] in LINEAS_SILENCIOSAS:
                continue
            self._monitor(("[sim] " if self.modo == "dual" else "") + ln)

    # ------------------------------------------------------------ USB hacia la Jetson (puerto 7701)
    async def usb(self, lector: asyncio.StreamReader, escritor: asyncio.StreamWriter):
        self.usb_clientes.add(escritor)
        self._monitor("[simulador] Algo se conectó al USB del ESP32 (puerto 7701)")
        try:
            while datos := await lector.read(4096):
                self._orden(datos)
        except ConnectionError:
            pass
        finally:
            self.usb_clientes.discard(escritor)

    # ------------------------------------------------------------ navegador
    def mundo_json(self) -> dict:
        c = self.sim.circuito
        return {"tipo": "mundo",
                "cajas": [vars(k) for k in self.sim.obstaculos()],
                "arucos": mundo.ARUCOS,
                "pines": c.nombres,
                "cables": c.cables, "cables_guia": [x["id"] for x in c.cables_guia],
                "casos": [{"id": k, "nombre": v[0], "descripcion": v[1], "esperado": v[2]} for k, v in CASOS.items()],
                "explicaciones": {g: explicacion(g) for g in {x["grupo"] for x in c.cables} | {"Tus cables"}},
                "pines_info": PINES, "real_disponible": self.real is not None, "puerto_real": self.puerto_real}

    def estado_json(self) -> dict:
        e = self.sim.estado()
        e["tipo"] = "estado"
        e["firmware"] = {"configurado": bool(self.firmware), "corriendo": bool(self.proceso and self.proceso.poll() is None),
                         "conectado": self.hal_conectado}
        e["monitor"] = self.monitor[-60:]
        e["mision"] = bool(self.mision and self.mision.returncode is None)
        e["caso"] = self.caso_id
        e["prog"] = {"corriendo": bool(self.prog and self.prog.returncode is None), "salida": self.salida_prog[-120:]}
        e["firmware"]["referencia"] = bool(self.ref)
        e["modo"] = self.modo
        r, car = self.real_info, self.sim.carrito
        real = {"disponible": self.real is not None, "puerto": self.puerto_real, "lineas": r["lineas"], "bat_v": r["bat_v"],
                "paro_mv": r["paro_mv"], "frente_mm": r["frente_mm"], "pose": r["pose"],
                "hace_s": round(time.monotonic() - r["ultimo"], 1) if r["ultimo"] else None}
        if r["pose"]:
            real["dif_cm"] = round(math.hypot(r["pose"][0] - car.x, r["pose"][1] - car.y) * 100, 1)
            real["dif_grados"] = round((math.degrees(car.th) - r["pose"][2] + 540) % 360 - 180, 1)
        e["real"] = real
        esp = self.sim.esp32
        e["tramas"] = list(esp.bus_log)[-24:]
        t = self.sim.t
        e["senales"] = {"t": round(t, 3), "tx": [round(x, 4) for x in esp.tx_tiempos if t - x < 4],
                        "pines": {str(g): [[round(a, 4), b] for a, b in h if t - a < 4] for g, h in esp.hist_pines.items() if g in (4, 32, 33, 15)},
                        "pines_ahora": {str(g): esp.c.salidas_esp32.get(g) for g in (4, 32, 33, 15)}}
        e["vision"] = self.sim.vision()
        if self.ver_cables:
            circ = self.sim.circuito
            e["cables_v"] = {k["id"]: (None if circ.volt(k["de"]) is None else round(circ.volt(k["de"]), 2)) for k in circ.cables}
        return e

    def info_cable(self, ident: str) -> dict:
        """Todo lo que se sabe de un cable ahora mismo: a qué une, qué voltaje lleva, qué más está en su mismo punto y para qué sirve."""
        circ = self.sim.circuito
        k = next((x for x in circ.cables if x["id"] == ident), None)
        if k is None:
            raise KeyError("ese cable ya no existe")
        v = circ.volt(k["de"])
        red = circ.redes.get(k["de"])
        miembros = sorted(circ.nombres.get(n, n) for n, r in circ.redes.items() if r == red)
        grupo = k["grupo"]
        corr = circ.corrientes
        aprox = {"Potencia": corr["bat"], "Rama de motores": corr["F15"], "Motores M0601": corr["F15"], "Rama auxiliar": corr["F10"]}.get(grupo)
        return {"tipo": "cable", "id": ident, "de": k["de"], "a": k["a"], "nombre_de": circ.nombres.get(k["de"], k["de"]), "nombre_a": circ.nombres.get(k["a"], k["a"]),
                "grupo": grupo, "color": k["color"], "v": None if v is None else round(v, 3), "en_el_mismo_punto": miembros[:40], "n_en_el_mismo_punto": len(miembros),
                "corriente_aprox": None if aprox is None else round(aprox, 2), **explicacion(grupo),
                "pin_de": PINES.get(k["de"], ""), "pin_a": PINES.get(k["a"], "")}

    def accion(self, m: dict):
        a, c, sim = m.get("accion"), self.sim.circuito, self.sim
        if a == "kcd1":
            c.kcd1 = bool(m["valor"])
        elif a == "paro":
            c.paro_presionado = bool(m["valor"])
        elif a == "final":
            (c.finales_presionados.add if m["valor"] else c.finales_presionados.discard)(m["cual"])
        elif a == "cortar":
            c.cortar(m["id"])
            self._cambio_mundo = True
        elif a == "conectar":
            c.conectar(m["de"], m["a"])
            self._cambio_mundo = True
        elif a == "reiniciar_cableado":
            c.reiniciar_cableado()
            self._cambio_mundo = True
        elif a == "reparar":
            c.reparar()
        elif a == "colocar":
            sim.colocar(float(m["x"]), float(m["y"]), float(m["th"]))
        elif a == "obstaculo":
            f = mundo.obstaculo_persona if m.get("clase") == "persona" else mundo.obstaculo_caja
            sim.extra.append(f(float(m["x"]), float(m["y"])))
            self._cambio_mundo = True
        elif a == "quitar_obstaculos":
            sim.extra.clear()
            self._cambio_mundo = True
        elif a == "masa":
            sim.carrito.masa = float(m["valor"])
        elif a == "motor_invertido":
            sim.motor_der.invertido = bool(m["valor"])
        elif a == "reset_esp32":
            self.detener_firmware()
            if c.esp_vivo:
                self._monitor("[simulador] Botón EN: reinicio del ESP32")
                self.arrancar_firmware()
        elif a == "mision":
            asyncio.ensure_future(self._lanzar_mision(m["ruta"]))
        elif a == "detener_mision":
            self.detener_mision()
        elif a == "prog_guardar":
            self.guardar_programa(m["nombre"], m["codigo"])
        elif a == "prog_ejecutar":
            asyncio.ensure_future(self._correr_programa(m["nombre"]))
        elif a == "prog_detener":
            self.detener_programa()
        elif a == "caso":
            self.iniciar_caso(m["nombre"])
        elif a == "usb_enviar":
            self._orden((m["texto"] + chr(10)).encode())
        elif a == "modo":
            self.cambiar_modo(m["valor"])
        elif a == "alinear":
            self.alinear()
        elif a == "ver_cables":
            self.ver_cables = bool(m["valor"])
        c.evaluar()

    async def navegador(self, ws):
        self.navegadores.add(ws)
        try:
            await ws.send(json.dumps(self.mundo_json()))
            await ws.send(json.dumps({"tipo": "programas", "lista": self.lista_programas()}))
            async for texto in ws:
                try:
                    m = json.loads(texto)
                    if m.get("accion") == "prog_leer":
                        await ws.send(json.dumps({"tipo": "programa", "nombre": m["nombre"], "codigo": self.leer_programa(m["nombre"])}))
                        continue
                    if m.get("accion") == "inspeccionar":
                        await ws.send(json.dumps(self.info_cable(m["id"])))
                        continue
                    if m.get("accion") == "prog_listar":
                        await ws.send(json.dumps({"tipo": "programas", "lista": self.lista_programas()}))
                        continue
                    self.accion(m)
                    if m.get("accion") == "prog_guardar":
                        await ws.send(json.dumps({"tipo": "programas", "lista": self.lista_programas(), "guardado": m["nombre"]}))
                except (KeyError, ValueError, TypeError, OSError) as ex:
                    await ws.send(json.dumps({"tipo": "error", "texto": str(ex)}))
        finally:
            self.navegadores.discard(ws)

    async def ciclo(self):
        ultimo = 0.0
        while True:
            self.avanzar()
            ahora = time.monotonic()
            if ahora - ultimo >= 0.033 and self.navegadores:  # 30 estados por segundo, medidos en tiempo real
                ultimo = ahora
                if self._cambio_mundo:
                    msg = json.dumps(self.mundo_json())
                    for ws in list(self.navegadores):
                        await ws.send(msg)
                    self._cambio_mundo = False
                msg = json.dumps(self.estado_json())
                for ws in list(self.navegadores):
                    try:
                        await ws.send(msg)
                    except Exception:
                        self.navegadores.discard(ws)
            await asyncio.sleep(0.002)


def archivo_estatico(conexion, peticion):
    ruta = peticion.path.split("?")[0]
    if peticion.headers.get("Upgrade", "").lower() == "websocket":
        return None
    if ruta in ("/status", "/vision.json") and SERVIDOR is not None:
        cuerpo = json.dumps(SERVIDOR.sim.vision()).encode()
        return Response(200, "OK", Headers({"Content-Type": "application/json", "Cache-Control": "no-store"}), cuerpo)
    archivo = ESTATICOS.get(ruta) or (AQUI / ruta.lstrip("/")).resolve()
    if not str(archivo).startswith(str(AQUI)) or not archivo.is_file() or not (
            str(archivo).startswith(str(AQUI / "web")) or str(archivo).startswith(str(AQUI / "generado"))):
        return Response(404, "Not Found", Headers({"Content-Type": "text/plain"}), b"No existe")
    tipo = mimetypes.guess_type(archivo.name)[0] or "application/octet-stream"
    if tipo.startswith("text/") or tipo in ("application/javascript",):
        tipo += "; charset=utf-8"
    return Response(200, "OK", Headers({"Content-Type": tipo, "Cache-Control": "no-store"}), archivo.read_bytes())


async def main():
    if sys.platform == "win32":                      # sin esto Windows duerme de 15 en 15 ms y el simulador va a tirones
        import ctypes
        ctypes.windll.winmm.timeBeginPeriod(1)
    ap = argparse.ArgumentParser(description="Simulador del carrito Aether")
    ap.add_argument("--firmware", help="ruta al programa compilado con el entorno native")
    ap.add_argument("--puerto", type=int, default=8770)
    ap.add_argument("--esp32", help="puerto del ESP32 real (COM5, /dev/ttyUSB0, socket://host:puerto o auto): activa el modo simulación + ESP32 real")
    ap.add_argument("--sin-firmware", action="store_true", help="no correr ningún firmware (solo el circuito y la física)")
    args = ap.parse_args()
    s = Servidor(args.firmware, ref=not args.firmware and not args.sin_firmware)
    global SERVIDOR
    SERVIDOR = s
    if args.esp32:
        try:
            s.abrir_real(args.esp32)
            print(f"ESP32 real conectado en {s.puerto_real}: ya puedes usar el modo simulación + ESP32 real")
        except Exception as ex:
            print(f"No pude abrir el ESP32 real ({ex}). Sigo solo con la simulación.")
    async with serve(s.navegador, "127.0.0.1", args.puerto, process_request=archivo_estatico, max_size=2 ** 22):
        await asyncio.start_server(s.hal, "127.0.0.1", 7700)
        await asyncio.start_server(s.usb, "127.0.0.1", 7701)
        print(f"Simulador listo: abre http://localhost:{args.puerto} en Chrome  (pines: 7700, USB: 7701)")
        print("Firmware:", args.firmware or ("ninguno" if args.sin_firmware else "de referencia en Python (sin compilador de C++)"))
        if s.real is not None:
            asyncio.ensure_future(s.leer_real())
        await s.ciclo()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
