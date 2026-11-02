"""Misión de carga y descarga del carrito: banda -> descarga -> banda.

La Jetson lleva la ruta y la posición; el ESP32 ejecuta cada tramo (DRV, TRN, APR) y reporta (ODO, EVT).
El mismo programa sirve con el carrito real y con el simulador; solo cambia el puerto:

    python mision.py --puerto /dev/ttyUSB0 --ruta ciclo            # carrito real, desde la Jetson
    python mision.py --puerto socket://localhost:7701 --ruta ciclo # simulador de la laptop

Rutas: ida (banda -> descarga), vuelta (descarga -> banda), ciclo (las dos, con pausa de carga y de descarga).
Medidas decididas el 1 nov 2026: descarga a 4 m de la banda (al centro) y a 90° a la izquierda; ArUco a 1.5 m.

Lo que NO hace todavía:
- La torre (elevador, empujador, servo) no está en el firmware: la carga y la descarga son una pausa.
- No corrige la posición con ArUco (falta pasarle la imagen de la cámara): usa solo la odometría.
- Lumina: el aviso se imprime; falta conectarlo a la voz.
"""
from __future__ import annotations

import argparse
import math
import socket
import sys
import time

X_DESC, Y_ACOPLE = -3.82, 2.0                     # eje de las ruedas acoplado en la descarga
LIMITE_AYUDA_S = 20.0                             # tiempo bloqueado antes de pedir ayuda


# ------------------------------------------------------------------ transporte
class Puerto:
    """Un puerto serie real o un socket del simulador, con la misma interfaz."""

    def __init__(self, url: str, baud: int = 115200):
        self._buf = b""
        if url.startswith("socket://"):
            host, _, port = url[len("socket://"):].partition(":")
            self.s = socket.create_connection((host or "127.0.0.1", int(port)), timeout=5)
            self.s.settimeout(0.05)
            self.leer = self._leer_socket
            self.escribir = self.s.sendall
        else:
            import serial                         # pip install pyserial (solo hace falta con el carrito real)
            self.p = serial.Serial(url, baud, timeout=0.05)
            self.leer = lambda: self.p.read(4096)
            self.escribir = self.p.write

    def _leer_socket(self) -> bytes:
        try:
            return self.s.recv(4096)
        except socket.timeout:
            return b""

    def lineas(self):
        self._buf += self.leer()
        *lineas, self._buf = self._buf.split(b"\n")
        return [x.decode(errors="replace").strip() for x in lineas if x.strip()]


# ------------------------------------------------------------------ rutas (tramos)
def ruta_ida(pausa_carga: float):
    return [("voz", "Atención, voy a retroceder"), ("espera", 2.0), ("DRV", -0.60, 0.10, 0.0), ("TRN", 180.0),
            ("IR", X_DESC, 0.0, 180.0, 0.35), ("TRN", 90.0), ("APR", 1.70, 0.15, 30, 200), ("APR", 0.40, 0.05, 0, 30),
            ("FIJA", X_DESC, Y_ACOPLE, 90.0), ("nota", "acoplado en la descarga")]


def ruta_vuelta():
    return [("voz", "Atención, voy a retroceder"), ("espera", 2.0), ("DRV", -0.60, 0.10, 90.0), ("TRN", -90.0),
            ("IR", X_DESC, 0.0, -90.0, 0.35), ("TRN", 0.0), ("IR", -2.0, 0.0, 0.0, 0.35), ("APR", 1.70, 0.15, 30, 200),
            ("APR", 0.40, 0.05, 0, 30), ("FIJA", 0.0, 0.0, 0.0), ("nota", "acoplado en la banda")]


# ------------------------------------------------------------------ misión
class Mision:
    def __init__(self, puerto: Puerto, pose, decir=print):
        self.p, self.pose, self.decir = puerto, list(pose), decir
        self.cola: list = []
        self.paso = None
        self.id = 0
        self.s_prev = None
        self.t_hb = 0.0
        self.t_espera = 0.0
        self.t_bloq = None
        self.avisado = False
        self.falla = None

    def enviar(self, linea: str):
        self.p.escribir((linea + "\n").encode())

    def cargar(self, pasos):
        self.cola += pasos

    def siguiente(self):
        if not self.cola:
            self.paso = None
            return
        self.paso = self.cola.pop(0)
        x, y, th = self.pose
        self.id += 1
        n, t = self.id, self.paso[0]
        a = self.paso
        if t == "voz":
            self.decir(f'Lumina: "{a[1]}"')
            return self.siguiente()
        if t == "nota":
            self.decir(a[1])
            return self.siguiente()
        if t == "pausa":
            self.decir(a[1])
            self.t_espera = time.monotonic() + a[2]
            self.paso = ("espera",)
        elif t == "espera":
            self.t_espera = time.monotonic() + a[1]
        elif t == "DRV":
            self.enviar(f"DRV {n} {a[1]} {a[2]} {a[3]}")
        elif t == "TRN":
            self.enviar(f"TRN {n} {a[1]} 0.6")
        elif t == "IR":                           # recta hasta el punto (x, y) sosteniendo el rumbo
            self.enviar(f"DRV {n} {math.hypot(a[1] - x, a[2] - y):.3f} {a[4]} {a[3]}")
        elif t == "APR":
            self.enviar(f"APR {n} {a[1]} {a[2]} {a[3]} {a[4]}")
        elif t == "FIJA":                         # al acoplar en una estación la posición se reinicia
            self.pose = [a[1], a[2], math.radians(a[3])]
            self.s_prev = None
            return self.siguiente()

    def odometria(self, p):
        s, th = (float(p[2]) + float(p[3])) / 2, math.radians(float(p[4]))
        if self.s_prev is not None:
            ds = s - self.s_prev
            self.pose[0] += ds * math.cos(th)
            self.pose[1] += ds * math.sin(th)
        self.s_prev, self.pose[2] = s, th

    def recibir(self, linea: str):
        p = linea.split()
        if not p:
            return
        if p[0] == "ODO" and len(p) >= 6 and p[4] != "nan":
            return self.odometria(p)
        if p[0] != "EVT" or len(p) < 3:
            return
        if p[2] == "REARMADO":
            return self.decir("paro rearmado")
        if self.paso is None or int(p[1]) not in (self.id, 0):
            return
        ev = p[2]
        if ev == "DONE":
            self.t_bloq = None
            self.siguiente()
        elif ev == "FAULT":
            self.falla = " ".join(p[3:])
            self.decir(f"falla del ESP32: {self.falla}. Necesito ayuda: abandono la misión")
            self.cola, self.paso = [], None
        elif ev == "BLOCKED":
            self.t_bloq = time.monotonic()
            self.avisado = False
            self.decir(f"algo enfrente a {p[3]} mm: espero a que se quite")
        elif ev == "CLEAR":
            self.t_bloq = None
            self.decir("camino libre: sigo")

    def paso_tiempo(self):
        ahora = time.monotonic()
        if (self.paso or self.cola) and ahora - self.t_hb > 0.2:
            self.t_hb = ahora
            self.enviar("HB")
        if self.paso and self.paso[0] == "espera" and ahora >= self.t_espera:
            self.siguiente()
        if self.t_bloq and not self.avisado and ahora - self.t_bloq > LIMITE_AYUDA_S:
            self.avisado = True
            self.decir(f"Lumina: \"Necesito ayuda: llevo {LIMITE_AYUDA_S:.0f} s con algo en el camino\"")

    def correr(self, limite_s: float = 600):
        self.siguiente()
        t0 = time.monotonic()
        while (self.paso or self.cola) and time.monotonic() - t0 < limite_s:
            for linea in self.p.lineas():
                self.recibir(linea)
            self.paso_tiempo()
        self.decir("misión terminada" if not self.falla else f"misión abandonada: {self.falla}")
        return self.falla is None


def main():
    ap = argparse.ArgumentParser(description="Misión de carga y descarga del carrito Aether")
    ap.add_argument("--puerto", required=True, help="/dev/ttyUSB0 (real) o socket://localhost:7701 (simulador)")
    ap.add_argument("--ruta", choices=["ida", "vuelta", "ciclo"], default="ciclo")
    ap.add_argument("--pausa-carga", type=float, default=3.0, help="segundos de pausa en la banda (la torre aún no está en el firmware)")
    ap.add_argument("--pausa-descarga", type=float, default=3.0)
    a = ap.parse_args()

    def decir(t):
        print(f"[Jetson {time.strftime('%H:%M:%S')}] {t}", flush=True)

    p = Puerto(a.puerto)
    if a.ruta == "vuelta":
        m = Mision(p, [X_DESC, Y_ACOPLE, math.pi / 2], decir)
        m.cargar(ruta_vuelta())
    else:
        m = Mision(p, [0.0, 0.0, 0.0], decir)
        if a.ruta == "ciclo":
            m.cargar([("pausa", f"carga en la banda ({a.pausa_carga:.0f} s; la torre aún no está en el firmware)", a.pausa_carga)])
        m.cargar(ruta_ida(a.pausa_carga))
        if a.ruta == "ciclo":
            m.cargar([("pausa", f"descarga ({a.pausa_descarga:.0f} s; la torre aún no está en el firmware)", a.pausa_descarga)] + ruta_vuelta())
    sys.exit(0 if m.correr() else 1)


if __name__ == "__main__":
    main()
