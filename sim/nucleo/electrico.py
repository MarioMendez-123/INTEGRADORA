"""Circuito del carrito: cables editables, fuentes, interruptores, resistencias y daños.

Qué simula (en corriente directa, en estado estable cada paso):
- Qué pin queda unido a qué (cables, interruptores cerrados, fusibles sanos, contacto del relé).
- Voltaje de cada red: batería, XL4005 (5 V), elevador (18 V), regulador de 3.3 V del ESP32,
  salidas del ESP32, divisores de resistencias (análisis nodal).
- Cortos: queman el fusible que los alimenta; un corto directo en la batería se marca como falla grave.
- Daños: más de 3.6 V en un GPIO, polaridad invertida o sobrevoltaje en un módulo.
- Corrientes aproximadas por rama para los fusibles y la caída de voltaje de la batería.

Qué NO simula: transitorios, ruido, caída en los cables, el calentamiento real, el detalle
interno de cada módulo. Los consumos de la Jetson y la lógica son estimados.
"""
from __future__ import annotations

import json
import pathlib

DATOS = pathlib.Path(__file__).resolve().parent.parent / "datos"

# ------------------------------------------------------------------ piezas fuera de la placa
PINES_EXTRA = {
    "BAT.+": "Batería · borne +", "BAT.-": "Batería · borne −",
    "F15.in": "Fusible 15 A (motores) · entrada", "F15.out": "Fusible 15 A (motores) · salida",
    "F10.in": "Fusible 10 A (lógica) · entrada", "F10.out": "Fusible 10 A (lógica) · salida",
    "KCD.a": "Interruptor KCD1 · pata 1", "KCD.b": "Interruptor KCD1 · pata 2",
    "PARO.1": "Paro LAY37 (NC) · borne 1", "PARO.2": "Paro LAY37 (NC) · borne 2",
    "RELE.VCC": "Relé T90 · VCC", "RELE.GND": "Relé T90 · GND", "RELE.COM": "Relé T90 · COM", "RELE.NO": "Relé T90 · NO",
    "ELEV.IN+": "Elevador 400 W · IN+", "ELEV.IN-": "Elevador 400 W · IN−", "ELEV.OUT+": "Elevador 400 W · OUT+ (18 V)", "ELEV.OUT-": "Elevador 400 W · OUT−",
    "XL.IN+": "XL4005 · IN+", "XL.IN-": "XL4005 · IN−", "XL.OUT+": "XL4005 · OUT+ (5 V)", "XL.OUT-": "XL4005 · OUT−",
    "JET.+12": "Jetson · 12 V", "JET.GND": "Jetson · GND",
    "ML.V+": "M0601 izquierdo · V+", "ML.GND": "M0601 izquierdo · GND", "ML.A": "M0601 izquierdo · A", "ML.B": "M0601 izquierdo · B",
    "MR.V+": "M0601 derecho · V+", "MR.GND": "M0601 derecho · GND", "MR.A": "M0601 derecho · A", "MR.B": "M0601 derecho · B",
}
SENSORES_VL = {"VL0": "VL53L0X frontal", "VL1": "VL53L0X izquierdo", "VL2": "VL53L0X derecho", "VLP": "VL53L0X de la pila"}
for k, n in SENSORES_VL.items():
    for p in ("VIN", "GND", "SDA", "SCL") + (("XSHUT",) if k != "VLP" else ()):
        PINES_EXTRA[f"{k}.{p}"] = f"{n} · {p}"
FINALES = {"FC1": "Final de carrera 1 (home izq.)", "FC2": "Final de carrera 2 (home der.)", "FC3": "Final de carrera 3 (carro)", "FC4": "Final de carrera 4 (superior)"}
for k, n in FINALES.items():
    PINES_EXTRA[f"{k}.S"] = f"{n} · señal (NC)"
    PINES_EXTRA[f"{k}.G"] = f"{n} · tierra"

ARNES = [  # (de, a, grupo, color) — de la guía rev. 3.17c (textos de los pasos de potencia)
    ("BAT.+", "F15.in", "Potencia", "cRed"), ("BAT.+", "F10.in", "Potencia", "cRed"),
    ("BAT.-", "ELEV.IN-", "Potencia", "cBlk"),
    ("F10.out", "KCD.a", "Rama auxiliar", "cRed"), ("KCD.b", "XL.IN+", "Rama auxiliar", "cRed"),
    ("XL.IN+", "JET.+12", "Rama auxiliar", "cRed"), ("ELEV.IN-", "JET.GND", "Rama auxiliar", "cBlk"),
    ("XL.IN+", "PARO.1", "Paro y relé", "cRed"), ("PARO.2", "RELE.VCC", "Paro y relé", "cRed"),
    ("ELEV.IN-", "RELE.GND", "Paro y relé", "cBlk"), ("F15.out", "RELE.COM", "Paro y relé", "cRed"),
    ("RELE.NO", "ELEV.IN+", "Rama de motores", "cRed"), ("RELE.NO", "J1.+12V", "Rama de motores", "cRed"),
    ("ELEV.IN-", "J1.GND", "Rama de motores", "cBlk"), ("ELEV.IN-", "XL.IN-", "Rama auxiliar", "cBlk"),
    ("XL.OUT+", "J2.+5V", "Rama auxiliar", "cOra"), ("XL.OUT-", "J2.GND", "Rama auxiliar", "cBlk"),
    ("XL.IN+", "J2.+12V AUX", "Rama auxiliar", "cRed"), ("RELE.VCC", "J13.PARO", "Paro y relé", "cRed"),
    ("ELEV.OUT+", "ML.V+", "Motores M0601", "cRed"), ("ELEV.OUT+", "MR.V+", "Motores M0601", "cRed"),
    ("ELEV.OUT-", "ML.GND", "Motores M0601", "cBlk"), ("ELEV.OUT-", "MR.GND", "Motores M0601", "cBlk"),
    ("J3.A", "ML.A", "Motores M0601", "cLbl"), ("ML.A", "MR.A", "Motores M0601", "cLbl"),
    ("J3.B", "ML.B", "Motores M0601", "cLim"), ("ML.B", "MR.B", "Motores M0601", "cLim"),
    ("J3.GND", "ML.GND", "Motores M0601", "cBlk"),
]
for k in SENSORES_VL:
    ARNES += [("J5.3V3", f"{k}.VIN", "Sensores VL53L0X", "cPnk"), ("J5.GND", f"{k}.GND", "Sensores VL53L0X", "cBlk"),
              ("J5.SDA", f"{k}.SDA", "Sensores VL53L0X", "cYel"), ("J5.SCL", f"{k}.SCL", "Sensores VL53L0X", "cWht")]
ARNES += [("J6.X0", "VL0.XSHUT", "Sensores VL53L0X", "cOli"), ("J6.X1", "VL1.XSHUT", "Sensores VL53L0X", "cOli"),
          ("J6.X2", "VL2.XSHUT", "Sensores VL53L0X", "cOli")]
for i in (1, 2, 3):
    ARNES += [(f"J4.FC{i}", f"FC{i}.S", "Finales de carrera", "cBei"), (f"J4.GND{i}", f"FC{i}.G", "Finales de carrera", "cBlk")]
ARNES += [("J13.FC4", "FC4.S", "Finales de carrera", "cBei"), ("J13.GND4", "FC4.G", "Finales de carrera", "cBlk")]

UNIDOS_POR_DENTRO = [  # pines que el propio módulo ya une
    ("E.GND1", "E.GND2"), ("E.GND1", "E.GNDL"), ("L.GNDL", "L.GNDH"), ("XL.IN-", "XL.OUT-"),
    ("ELEV.IN-", "ELEV.OUT-"), ("A1.PGND", "A1.LGND"), ("A2.PGND", "A2.LGND"), ("A3.PGND", "A3.LGND"),
]
RESISTENCIAS = {"R1": 100e3, "R2": 20e3, "R3": 100e3, "R4": 20e3, "R5": 10e3, "REN": 10e3}
GPIO_SOLO_ENTRADA = {34, 35, 36, 39}


class _Uniones:
    def __init__(self):
        self.p = {}

    def raiz(self, a):
        self.p.setdefault(a, a)
        while self.p[a] != a:
            self.p[a] = self.p[self.p[a]]
            a = self.p[a]
        return a

    def unir(self, a, b):
        ra, rb = self.raiz(a), self.raiz(b)
        if ra != rb:
            self.p[ra] = rb


class Circuito:
    def __init__(self):
        placa = json.loads((DATOS / "placa.json").read_text(encoding="utf-8"))
        self.nombres = {k: v["name"] for k, v in placa["pines"].items()} | PINES_EXTRA
        self.cables_guia = [{"id": f"p{c['n']}", "de": c["from"], "a": c["to"], "grupo": c["group"], "color": c["mat"], "pieza": c["id"]}
                            for c in placa["cables"]]
        self.cables_guia += [{"id": f"h{i + 1}", "de": a, "a": b, "grupo": g, "color": col}
                             for i, (a, b, g, col) in enumerate(ARNES)]
        self._cache_mapa = {}
        self._gpios = [(k, int(k[2:])) for k in self.nombres if k.startswith("E.") and k[2:].isdigit()]
        self.reiniciar_cableado()
        # estado de los mandos
        self.kcd1 = False
        self.paro_presionado = False
        self.finales_presionados: set[str] = set()
        self.fusible_ok = {"F15": True, "F10": True}
        self.danos: dict[str, str] = {}
        self.salidas_esp32: dict[int, int] = {}        # gpio -> 0/1 que el firmware manda
        self.rele_cerrado = False
        self.v_bat_circuito_abierto = 12.9
        self.r_interna = 0.02
        self.ah_usados = 0.0
        self.i_motores = 0.0                            # A a 18 V (lo pone la simulación)
        self._t_sobre = {"F15": 0.0, "F10": 0.0}
        self.corrientes = {"F15": 0.0, "F10": 0.0, "bat": 0.0}
        self.redes: dict[str, str] = {}
        self.v: dict[str, float | None] = {}
        self.avisos: list[str] = []
        self.evaluar()

    # ------------------------------------------------------------ edición de cables
    def reiniciar_cableado(self):
        self.cables = [dict(c) for c in self.cables_guia]
        self._cache_mapa = {}

    def cortar(self, ident: str):
        self.cables = [c for c in self.cables if c["id"] != ident]
        self._cache_mapa = {}
        self.evaluar()

    def conectar(self, de: str, a: str, ident: str | None = None) -> str:
        if de not in self.nombres or a not in self.nombres or de == a:
            raise ValueError("pin desconocido")
        ident = ident or f"u{len(self.cables) + 1}_{abs(hash((de, a))) % 9999}"
        self.cables.append({"id": ident, "de": de, "a": a, "grupo": "Tus cables", "color": "cMag"})
        self._cache_mapa = {}
        self.evaluar()
        return ident

    def reparar(self):
        """Cambia los fusibles quemados y las piezas dañadas, como en la vida real (con refacciones)."""
        self.fusible_ok = {"F15": True, "F10": True}
        self.danos.clear()

    # ------------------------------------------------------------ evaluación
    def _mapa(self, sin_fusibles: bool) -> dict:
        """pin -> representante de su punto eléctrico. Se guarda mientras no cambie nada que una o separe pines
        (cables, KCD1, paro, relé, fusibles, finales de carrera): así no se recalcula en cada cambio de un pin."""
        clave = (sin_fusibles, self.kcd1, self.paro_presionado, self.rele_cerrado, self.fusible_ok["F15"], self.fusible_ok["F10"],
                 tuple(sorted(self.finales_presionados)))
        mapa = self._cache_mapa.get(clave)
        if mapa is None:
            if len(self._cache_mapa) > 48:
                self._cache_mapa = {}
            u = self._uniones(sin_fusibles)
            mapa = self._cache_mapa[clave] = {k: u.raiz(k) for k in self.nombres}
        return mapa

    def _uniones(self, sin_fusibles: bool = False):
        u = _Uniones()
        for k in self.nombres:
            u.raiz(k)
        for c in self.cables:
            u.unir(c["de"], c["a"])
        for a, b in UNIDOS_POR_DENTRO:
            u.unir(a, b)
        for f in ("F15", "F10"):
            if self.fusible_ok[f] and not sin_fusibles:
                u.unir(f"{f}.in", f"{f}.out")
        if self.kcd1:
            u.unir("KCD.a", "KCD.b")
        if not self.paro_presionado:
            u.unir("PARO.1", "PARO.2")
        if self.rele_cerrado:
            u.unir("RELE.COM", "RELE.NO")
        for k in FINALES:
            if k not in self.finales_presionados:
                u.unir(f"{k}.S", f"{k}.G")
        return u

    def red(self, pin: str) -> str:
        return self.redes.get(pin, pin)

    def volt(self, pin: str) -> float | None:
        return self.v.get(self.red(pin))

    def dif(self, mas: str, menos: str) -> float:
        a, b = self.volt(mas), self.volt(menos)
        return (a or 0.0) - (b or 0.0) if a is not None and b is not None else 0.0

    def evaluar(self, dt: float = 0.0, rapido: bool = False):
        """rapido=True: solo recalcula voltajes (lo que pasa al cambiar un pin); daños y corrientes se revisan en el ciclo de 10 ms."""
        self.avisos = []
        v_bat = self.v_bat_circuito_abierto - self.corrientes["bat"] * self.r_interna
        for _ in range(8):
            # un fusible se quema si, quitándolo, su salida queda unida a la tierra
            m0 = self._mapa(True)
            quemado = False
            for f in ("F15", "F10"):
                if self.fusible_ok[f] and m0[f"{f}.out"] == m0["BAT.-"]:
                    self.fusible_ok[f] = False
                    self.avisos.append(f"Se quemó el fusible {f[1:]} A: su salida quedó en corto con la tierra")
                    quemado = True
            self.redes = self._mapa(False)
            tierra = self.red("BAT.-")
            fijas: dict[str, float] = {tierra: 0.0}
            choque = None

            def fijar(pin, valor, quien):
                nonlocal choque
                r = self.red(pin)
                if r in fijas and abs(fijas[r] - valor) > 0.3:
                    choque = choque or (pin, quien, r)
                    return False
                fijas[r] = valor
                return True

            if self.red("BAT.+") == tierra:
                self.danos["BAT"] = "Corto directo en la batería: sin fusible de por medio el cable se quemaría"
                fijas = {tierra: 0.0}
            else:
                fijar("BAT.+", v_bat, "batería")
            if quemado:
                continue
            # convertidores y reguladores (dependen de lo que ya está fijo)
            v_xl_in = fijas.get(self.red("XL.IN+")) if self.red("XL.IN-") == tierra else None
            xl_ok = v_xl_in is not None and 6.5 <= v_xl_in <= 32 and "XL" not in self.danos
            if xl_ok and self.red("XL.OUT+") == tierra:
                self.avisos.append("El XL4005 tiene la salida en corto: se protege y no entrega nada")
                xl_ok = False
            if xl_ok:
                fijar("XL.OUT+", 5.05, "XL4005")
            v_el_in = fijas.get(self.red("ELEV.IN+")) if self.red("ELEV.IN-") == tierra else None
            elev_ok = v_el_in is not None and 9.5 <= v_el_in <= 16 and "ELEV" not in self.danos
            if elev_ok and self.red("ELEV.OUT+") != tierra:
                fijar("ELEV.OUT+", 18.0 if v_el_in >= 10.5 else 18.0 * (v_el_in - 9.5), "elevador")
            v5 = fijas.get(self.red("E.5V")) if self.red("E.GND1") == tierra else None
            esp_vivo = v5 is not None and 4.3 <= v5 <= 6.5 and "ESP32" not in self.danos
            if v5 is not None and v5 > 6.5 and "ESP32" not in self.danos:
                self.danos["ESP32"] = f"Le entraron {v5:.1f} V por el pin 5V (máximo ~6 V): ESP32 quemado"
            if esp_vivo and self.red("E.3V3") != tierra:
                fijar("E.3V3", 3.3, "regulador del ESP32")
            elif esp_vivo:
                esp_vivo = False
                self.avisos.append("3V3 del ESP32 en corto con tierra: el regulador se apaga")
            if esp_vivo:
                for g, nivel in self.salidas_esp32.items():
                    if not fijar(f"E.{g}", 3.3 * nivel, f"GPIO {g}"):
                        self.danos.setdefault(f"GPIO{g}", f"GPIO {g} manda {nivel} pero su red está fija a otro voltaje: el pin se daña")
            if choque:
                pin, quien, _ = choque
                self.avisos.append(f"Choque de voltajes en {self.nombres.get(pin, pin)} ({quien})")
            # análisis nodal de las resistencias
            self.v = self._nodal(fijas)
            rele = self.dif("RELE.VCC", "RELE.GND") >= 9.0
            if rele != self.rele_cerrado:
                self.rele_cerrado = rele
                continue
            break
        self.esp_vivo = esp_vivo
        self.xl_ok, self.elev_ok = xl_ok, elev_ok
        if not rapido:
            self._revisar_danos()
            self._corrientes(dt, v_bat)

    def _nodal(self, fijas: dict[str, float]) -> dict[str, float | None]:
        aristas = []
        for nombre, r in RESISTENCIAS.items():
            a, b = self.red(f"{nombre}.a"), self.red(f"{nombre}.b")
            if a != b:
                aristas.append((a, b, 1 / r))
        # pull-up del propio módulo en XSHUT (Pololu): 10 kΩ a VIN
        for k in ("VL0", "VL1", "VL2"):
            aristas.append((self.red(f"{k}.XSHUT"), self.red(f"{k}.VIN"), 1e-4))
        incognitas = sorted({n for a, b, _ in aristas for n in (a, b)} - fijas.keys())
        v = dict(fijas)
        for n in incognitas:
            v[n] = 0.0
        conectada = set(fijas)
        cambio = True
        while cambio:                    # nodos que tienen camino resistivo a una red fija
            cambio = False
            for a, b, _ in aristas:
                if (a in conectada) != (b in conectada):
                    conectada.add(a if b in conectada else b)
                    cambio = True
        vecinos = {n: [] for n in incognitas}
        for a, b, c in aristas:
            if a in vecinos and b in conectada:
                vecinos[a].append((b, c))
            if b in vecinos and a in conectada:
                vecinos[b].append((a, c))
        for _ in range(400):             # Gauss-Seidel (redes pequeñas), hasta que deje de cambiar
            cambio = 0.0
            for n in incognitas:
                lst = vecinos[n]
                if n not in conectada or not lst:
                    continue
                g = sum(c for _, c in lst)
                nuevo = sum(c * v[m] for m, c in lst) / g
                cambio = max(cambio, abs(nuevo - v[n]))
                v[n] = nuevo
            if cambio < 1e-7:
                break
        return {n: (v[n] if n in conectada else None) for n in set(v) | set(self.redes.values())}

    def _revisar_danos(self):
        if not self.esp_vivo and "ESP32" not in self.danos:
            pass
        for k, g in self._gpios:
            v = self.volt(k)
            if v is not None and v > 3.6 and g not in self.salidas_esp32:
                if v > 6:
                    self.danos.setdefault("ESP32", f"Le entraron {v:.1f} V al GPIO {g}: el ESP32 se quema (máximo 3.6 V)")
                else:
                    self.danos.setdefault(f"GPIO{g}", f"{v:.1f} V en el GPIO {g} (máximo 3.6 V): pin dañado")
        modulos = {"MAX485": ("M.VCC", "M.GND", 7.0), "BNO055": ("B.VIN", "B.GND", 6.0)}
        for k in SENSORES_VL:
            modulos[k] = (f"{k}.VIN", f"{k}.GND", 6.0)
        for nombre, (vcc, gnd, vmax) in modulos.items():
            d = self.dif(vcc, gnd)
            if d < -1:
                self.danos.setdefault(nombre, f"{nombre}: polaridad invertida")
            elif d > vmax:
                self.danos.setdefault(nombre, f"{nombre}: le llegan {d:.1f} V (máximo {vmax:.0f} V)")
        for m, lado in (("ML", "izquierdo"), ("MR", "derecho")):
            if self.dif(f"{m}.V+", f"{m}.GND") < -1:
                self.danos.setdefault(m, f"M0601 {lado}: polaridad invertida")

    def _corrientes(self, dt: float, v_bat: float):
        aux = 0.0
        if self.xl_ok:
            carga_5v = (0.15 if self.esp_vivo else 0.0) + (0.01 if self.modulo_ok("MAX485", "M.VCC", "M.GND", 4.5) else 0.0)
            aux += 5.05 * carga_5v / 0.88 / max(v_bat, 1)
        if self.dif("JET.+12", "JET.GND") > 9:
            aux += 1.2                                   # Jetson en 25 W con carga ligera (estimado)
        if self.rele_cerrado:
            aux += 0.07                                  # bobina del relé
        mot = 18.0 * self.i_motores / 0.9 / max(v_bat, 1) if self.elev_ok else 0.0
        self.corrientes = {"F15": mot if self.fusible_ok["F15"] else 0.0, "F10": aux if self.fusible_ok["F10"] else 0.0}
        self.corrientes["bat"] = self.corrientes["F15"] + self.corrientes["F10"]
        self.ah_usados += self.corrientes["bat"] * dt / 3600
        for f, nominal in (("F15", 15.0), ("F10", 10.0)):
            i = self.corrientes[f]
            if i > 2 * nominal:
                self._t_sobre[f] += dt
            else:
                self._t_sobre[f] = 0.0
            if self.fusible_ok[f] and (i > 4 * nominal or self._t_sobre[f] > 1.0):
                self.fusible_ok[f] = False
                self.avisos.append(f"Se quemó el fusible {nominal:.0f} A por sobrecorriente ({i:.0f} A)")

    # ------------------------------------------------------------ consultas para los demás módulos
    def modulo_ok(self, nombre: str, vcc: str, gnd: str, vmin: float) -> bool:
        return nombre not in self.danos and self.dif(vcc, gnd) >= vmin and self.red(gnd) == self.red("BAT.-")

    def unidos(self, a: str, b: str) -> bool:
        return self.red(a) == self.red(b)

    def nivel_gpio(self, g: int) -> int | None:
        """Lo que lee digitalRead: 1, 0 o None si el pin está al aire."""
        if not self.esp_vivo or f"GPIO{g}" in self.danos:
            return None
        v = self.volt(f"E.{g}")
        if v is None:
            return None
        return 1 if v > 1.6 else 0

    def milivolts(self, g: int) -> int:
        v = self.volt(f"E.{g}") if self.esp_vivo else None
        return int(max(0.0, min(3.3, v)) * 1000) if v is not None else 0

    def estado(self) -> dict:
        def r(p):
            x = self.volt(p)
            return None if x is None else round(x, 2)
        return {
            "kcd1": self.kcd1, "paro": self.paro_presionado, "rele": self.rele_cerrado,
            "fusibles": self.fusible_ok, "corrientes": {k: round(v, 2) for k, v in self.corrientes.items()},
            "v": {"bateria": r("BAT.+"), "xl4005": round(self.dif("XL.OUT+", "XL.OUT-"), 2), "elevador": round(self.dif("ELEV.OUT+", "ELEV.OUT-"), 2),
                  "esp32_3v3": r("E.3V3"), "gpio34": r("E.34"), "gpio39": r("E.39"), "gpio35": r("E.35")},
            "esp32_vivo": self.esp_vivo, "danos": dict(self.danos), "avisos": list(self.avisos),
            "finales": sorted(self.finales_presionados), "ah": round(self.ah_usados, 4),
        }
