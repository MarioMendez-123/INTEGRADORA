"""Une todo: circuito, motores, física, sensores y ESP32 virtual, paso a paso en tiempo simulado."""
from __future__ import annotations

import math
import random

from . import mundo, vision
from .electrico import Circuito
from .esp32 import Esp32Virtual
from .fisica import Carrito, rayo_caja
from .m0601 import M0601

# Montaje de los sensores, en ejes del carrito (desde el eje de las ruedas), de la guía de armado
VL_MONTAJE = {  # x, y, ángulo
    "VL0": (0.1667, 0.0, 0.0),
    "VL1": (-0.22, 0.1892, math.pi / 2),
    "VL2": (-0.22, -0.1892, -math.pi / 2),
}
VL_ALTURA = 0.1555        # rev. 3.18: el marco de abajo bajó 3.3 cm
VL_ALCANCE = 1.2          # m, modo por omisión del VL53L0X en interiores (aprox.)
VL_FUERA = 8190           # lo que lee el Pololu cuando no hay nada


class Sensores:
    def __init__(self, sim: "Simulacion"):
        self.sim = sim
        self.rng = random.Random(3)
        self.deriva = 0.0

    def distancia_mm(self, sensor: str) -> int:
        if sensor == "VLP":
            return 150                         # la torre todavía no se simula: pila fija
        car = self.sim.carrito
        px, py, ang = VL_MONTAJE[sensor]
        ox, oy = car.a_mundo(px, py)
        mejor = None
        for d_ang in (-0.2, 0.0, 0.2):        # cono de ~25°
            a = car.th + ang + d_ang
            dx, dy = math.cos(a), math.sin(a)
            for caja in self.sim.obstaculos():
                if not (caja.base <= VL_ALTURA <= caja.base + caja.alto):
                    continue
                d = rayo_caja(ox, oy, dx, dy, caja)
                if d is not None and (mejor is None or d < mejor):
                    mejor = d
        if mejor is None or mejor > VL_ALCANCE:
            return VL_FUERA
        ruido = self.rng.gauss(0, 0.003 + 0.02 * mejor)
        return max(30, int((mejor + ruido) * 1000))

    def euler(self):
        """Rumbo como el BNO055: 0–360°, crece girando a la derecha (horario visto desde arriba)."""
        rumbo = (-math.degrees(self.sim.carrito.th + self.deriva)) % 360
        return round(rumbo + self.rng.gauss(0, 0.05), 3), 0.0, 0.0


class Simulacion:
    def __init__(self):
        self.t = 0.0
        self.circuito = Circuito()
        self.carrito = Carrito()
        self.motor_izq = M0601(1, "izquierdo")
        self.motor_der = M0601(2, "derecho")
        self.sensores = Sensores(self)
        self.esp32 = Esp32Virtual(self.circuito, [self.motor_izq, self.motor_der], self.sensores)
        self.estaciones = mundo.estaciones()
        self.extra = []                         # obstáculos que pone el usuario
        self._t_circuito = 0.0
        self.esp_estaba_vivo = False
        self.eventos: list[str] = []
        self.gancho = None                      # función que se llama cada 1 ms (firmware de referencia)

    def vision(self) -> dict:
        return vision.deteccion(self.carrito, self.obstaculos(), mundo.ARUCOS)

    def obstaculos(self):
        return self.estaciones + self.extra

    def colocar(self, x: float, y: float, th: float):
        c = self.carrito
        c.x, c.y, c.th, c.v, c.w = x, y, th, 0.0, 0.0

    def paso(self, dt: float):
        """Avanza dt segundos en pasos de 1 ms."""
        n = max(1, round(dt / 0.001))
        h = dt / n
        for _ in range(n):
            self._paso(h)

    def _paso(self, h: float):
        self.t += h
        c = self.circuito
        self._t_circuito += h
        if self._t_circuito >= 0.01:            # el circuito se reevalúa cada 10 ms (y en cada cambio de pin)
            c.i_motores = self.motor_izq.corriente_fuente() + self.motor_der.corriente_fuente()
            c.evaluar(self._t_circuito)
            self._t_circuito = 0.0
            if c.esp_vivo != self.esp_estaba_vivo:
                self.eventos.append("esp32_encendido" if c.esp_vivo else "esp32_apagado")
                if not c.esp_vivo:
                    self.esp32.reiniciar()
                self.esp_estaba_vivo = c.esp_vivo
        self.motor_izq.voltaje = max(0.0, c.dif("ML.V+", "ML.GND")) if "ML" not in c.danos else 0.0
        self.motor_der.voltaje = max(0.0, c.dif("MR.V+", "MR.GND")) if "MR" not in c.danos else 0.0
        car = self.carrito
        par_i = self.motor_izq.actualizar(self.t, h, car.izq.omega)
        par_d = self.motor_der.actualizar(self.t, h, car.der.omega)
        car.paso(h, par_i, par_d, self.obstaculos())
        if self.gancho:
            self.gancho()

    def estado(self) -> dict:
        car = self.carrito
        return {
            "t": round(self.t, 3),
            "carrito": {"x": round(car.x, 4), "y": round(car.y, 4), "th": round(car.th, 5), "v": round(car.v, 4), "w": round(car.w, 4),
                        "rueda_izq": round(car.izq.omega, 3), "rueda_der": round(car.der.omega, 3),
                        "patina": [car.izq.patina, car.der.patina], "contactos": car.contactos},
            "motores": [{"id": m.id, "nombre": m.nombre, "v": round(m.voltaje, 1), "rpm": round(m.omega * 60 / (2 * math.pi), 1),
                         "objetivo": m.objetivo_rpm, "freno": m.freno, "par": round(m.par, 3), "i": round(m.corriente(), 2),
                         "error": m.error, "suelto": self.t - m.ultima_trama > 0.06, "tramas_ok": m.tramas_ok, "tramas_malas": m.tramas_malas}
                        for m in (self.motor_izq, self.motor_der)],
            "electrico": self.circuito.estado(),
            "esp32": {"vivo": self.esp32.vivo, "uart2": self.esp32.uart2, "salidas": self.circuito.salidas_esp32,
                      "bus": self.esp32.contador, "vl53": dict(self.esp32.vl_dir)},
            "sensores": {k: self.sensores.distancia_mm(k) for k in VL_MONTAJE},
        }
