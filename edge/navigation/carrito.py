"""Librería para programar el carrito Aether desde la Jetson (o desde el simulador).

Un programa del carrito es un archivo de Python que usa estas funciones; el mismo archivo corre con el
simulador y con el carrito real (solo cambia el puerto de `correr_programa.py`). Cada movimiento espera a
que el ESP32 avise que terminó, y levanta `ErrorCarrito` si algo falla (paro, atasco, sin latido).

Sistema de coordenadas (el de la guía de navegación): origen en el eje de las ruedas con el carrito
acoplado en la banda; x hacia la banda; y a la izquierda; ángulos en grados, 0° = mirando a la banda,
positivo = giro a la izquierda.

Protocolo con el ESP32 (líneas de texto por USB, 115200 baud):
  Jetson -> ESP32: HB | STOP | VMAX v | RES | REARME | DRV id dist v rumbo | TRN id rumbo wmax
                   APR id dist v frente_cm esperado_cm | MAN vIzq vDer
  ESP32 -> Jetson: ODO t_ms sIzq sDer rumbo vIzq vDer | MOT .. | RNG frente izq der pila | PWR bat_mV paro_mV
                   EVT id DONE | BLOCKED mm | CLEAR | FAULT motivo
"""
from __future__ import annotations

import math
import time

LATIDO_S = 0.2


class ErrorCarrito(RuntimeError):
    """El ESP32 avisó una falla o no contestó."""


def _ang(a):
    while a > 180:
        a -= 360
    while a <= -180:
        a += 360
    return a


class Carrito:
    def __init__(self, puerto, decir=print, pose=(0.0, 0.0, 0.0), limite_ayuda_s=20.0):
        """`puerto` tiene escribir(bytes) y lineas() -> list[str] (ver mision.Puerto). `pose` = (x, y, grados)."""
        self.p, self._decir = puerto, decir
        self.x, self.y, self.th = pose[0], pose[1], pose[2]        # th en grados
        self.limite_ayuda_s = limite_ayuda_s
        self._s_prev = None
        self._t_hb = 0.0
        self._id = 0
        self._rng = [8190, 8190, 8190, 8190]
        self._pwr = (None, None)
        self._odo = False
        self._bloq = None
        self._avisado = False
        self._ev = {}

    # ------------------------------------------------------------------ conversación con el ESP32
    def _enviar(self, linea: str):
        self.p.escribir((linea + "\n").encode())

    def _bombear(self):
        """Lee lo que mandó el ESP32, actualiza la pose y los sensores y manda el latido."""
        ahora = time.monotonic()
        if ahora - self._t_hb > LATIDO_S:
            self._t_hb = ahora
            self._enviar("HB")
        for ln in self.p.lineas():
            t = ln.split()
            if not t:
                continue
            if t[0] == "ODO" and len(t) >= 6 and t[4] != "nan":
                s, th = (float(t[2]) + float(t[3])) / 2, float(t[4])
                if self._s_prev is not None:
                    ds = s - self._s_prev
                    self.x += ds * math.cos(math.radians(th))
                    self.y += ds * math.sin(math.radians(th))
                self._s_prev, self.th, self._odo = s, th, True
            elif t[0] == "RNG" and len(t) >= 5:
                self._rng = [int(v) for v in t[1:5]]
            elif t[0] == "PWR" and len(t) >= 3:
                self._pwr = (int(t[1]), int(t[2]))
            elif t[0] == "EVT" and len(t) >= 3:
                self._ev[int(t[1])] = t[2:]
        if self._bloq and not self._avisado and ahora - self._bloq > self.limite_ayuda_s:
            self._avisado = True
            self.decir(f"Necesito ayuda: llevo {self.limite_ayuda_s:.0f} s con algo en el camino")

    def _ejecutar(self, orden: str, tiempo_max: float = 300.0):
        """Manda una orden con id y espera su evento final."""
        self._id += 1
        n = self._id
        self._enviar(orden.replace("{id}", str(n)))
        t0 = time.monotonic()
        self._bloq, self._avisado = None, False
        while time.monotonic() - t0 < tiempo_max:
            self._bombear()
            for clave in (n, 0):
                ev = self._ev.pop(clave, None)
                if not ev:
                    continue
                if ev[0] in ("DONE", "DOCKED"):
                    self._bloq = None
                    return
                if ev[0] == "BLOCKED":
                    self._bloq, self._avisado = time.monotonic(), False
                    self._decir(f"algo enfrente a {ev[1]} mm: espero a que se quite")
                elif ev[0] == "CLEAR":
                    self._bloq = None
                    self._decir("camino libre: sigo")
                elif ev[0] == "FAULT":
                    raise ErrorCarrito(" ".join(ev[1:]))
        raise ErrorCarrito("el ESP32 no terminó el movimiento a tiempo")

    def listo(self, espera_s: float = 5.0):
        """Espera la primera lectura del ESP32 (odometría y rumbo). Lo llama el corredor al arrancar."""
        t0 = time.monotonic()
        while not self._odo:
            if time.monotonic() - t0 > espera_s:
                raise ErrorCarrito("el ESP32 no contesta: ¿está encendido (KCD1) y conectado al puerto?")
            self._bombear()

    # ------------------------------------------------------------------ movimientos
    def avanzar(self, metros: float, v: float = 0.35, rumbo: float | None = None):
        """Recta de `metros` (negativo = reversa), sosteniendo el rumbo actual o el dado. Frena a 40 cm de un obstáculo."""
        self._ejecutar(f"DRV {{id}} {metros:.3f} {v} {self.th if rumbo is None else rumbo:.2f}")

    def retroceder(self, metros: float, v: float = 0.10, avisar: bool = True):
        """Reversa lenta. No hay sensor atrás: por seguridad Lumina avisa y espera 2 s antes de moverse."""
        if avisar:
            self.decir("Atención, voy a retroceder")
            self.esperar(2.0)
        self.avanzar(-abs(metros), v)

    def girar_a(self, grados: float, wmax: float = 0.6):
        """Gira en su lugar hasta mirar a `grados` (absoluto en el mapa)."""
        self._ejecutar(f"TRN {{id}} {_ang(grados):.2f} {wmax}")

    def girar(self, grados: float):
        """Gira `grados` a partir de donde está (positivo = izquierda)."""
        self.girar_a(self.th + grados)

    def ir_a(self, x: float, y: float, v: float = 0.35):
        """Gira hacia el punto (x, y) y avanza en recta hasta él."""
        dx, dy = x - self.x, y - self.y
        if math.hypot(dx, dy) < 0.02:
            return
        self.girar_a(math.degrees(math.atan2(dy, dx)))
        self.avanzar(math.hypot(dx, dy), v)

    def acoplar(self, distancia: float = 2.0):
        """Entra recto a una estación: rápido (0.15 m/s) y los últimos 40 cm a 5 cm/s hasta los topes."""
        self._ejecutar(f"APR {{id}} {distancia - 0.3:.2f} 0.15 30 {distancia * 100:.0f}")
        self._ejecutar("APR {id} 0.40 0.05 0 30")

    def esperar(self, segundos: float):
        t0 = time.monotonic()
        while time.monotonic() - t0 < segundos:
            self._bombear()

    # ------------------------------------------------------------------ lectura y utilidades
    def distancia(self, lado: str = "frente") -> int:
        """Distancia en mm del VL53L0X (8190 = nada a menos de 1.2 m). lado: frente, izquierda, derecha, pila."""
        self._bombear()
        return self._rng[{"frente": 0, "izquierda": 1, "derecha": 2, "pila": 3}[lado]]

    def bateria(self):
        """Voltaje de la batería en V (None si el ESP32 todavía no lo ha reportado)."""
        self._bombear()
        return None if self._pwr[0] is None else self._pwr[0] / 1000

    def paro_presionado(self) -> bool:
        self._bombear()
        return self._pwr[1] is not None and self._pwr[1] < 1000

    def pose(self):
        self._bombear()
        return self.x, self.y, self.th

    def fijar_pose(self, x: float, y: float, grados: float):
        """Dile al carrito dónde está (por ejemplo al acoplar en una estación)."""
        self.x, self.y, self.th = x, y, grados

    def velocidad_maxima(self, v: float):
        self._enviar(f"VMAX {v}")

    def rearmar(self):
        self._enviar("REARME")
        self.esperar(0.5)

    def detener(self):
        self._enviar("STOP")

    def decir(self, texto: str):
        """Lo que Lumina diría en voz alta (por ahora solo se imprime)."""
        self._decir(f'Lumina: "{texto}"')
