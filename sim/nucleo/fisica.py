"""Física plana del carrito: tracción diferencial, adherencia de las llantas y choques.

Ejes del mapa (los mismos de la guía de navegación): origen en el punto medio del eje de las
ruedas con el carrito acoplado en la banda; x hacia la banda; y a la izquierda; th en rad
(0 = mirando a la banda, positivo = giro a la izquierda).

De la guía de armado: huella 0.50 × 0.40 m, eje de las ruedas 7 cm delante del centro,
vía 0.259 m (2 × 0.1295), rueda Ø0.102, resorte de la suspensión ~85 N por rueda motriz.
Estimaciones (no medidas): masa 40 kg, inercia de giro, μ = 0.7, resistencia a rodar y
fricción de las rodajas al girar. Se ajustan con las pruebas 3 y 6 de la guía.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

G = 9.81
R_RUEDA = 0.051
VIA = 0.259
EJE_DELANTE_DEL_CENTRO = 0.07
LARGO, ANCHO = 0.50, 0.40


@dataclass
class Caja:
    """Rectángulo orientado: centro (cx, cy), medio largo hx (en su eje), medio ancho hy, ángulo."""
    cx: float
    cy: float
    hx: float
    hy: float
    ang: float = 0.0
    nombre: str = ""
    alto: float = 1.0          # alto desde el piso, para los sensores de distancia
    base: float = 0.0          # altura de la cara de abajo

    def ejes(self):
        c, s = math.cos(self.ang), math.sin(self.ang)
        return (c, s), (-s, c)

    def esquinas(self):
        (ax, ay), (bx, by) = self.ejes()
        return [(self.cx + sx * self.hx * ax + sy * self.hy * bx, self.cy + sx * self.hx * ay + sy * self.hy * by)
                for sx, sy in ((1, 1), (1, -1), (-1, -1), (-1, 1))]


def separacion(a: Caja, b: Caja):
    """SAT. Devuelve (profundidad, nx, ny) con n apuntando de b hacia a, o None si no se tocan."""
    ca, cb = a.esquinas(), b.esquinas()
    mejor = None
    for eje in (*a.ejes(), *b.ejes()):
        pa = [x * eje[0] + y * eje[1] for x, y in ca]
        pb = [x * eje[0] + y * eje[1] for x, y in cb]
        solape = min(max(pa), max(pb)) - max(min(pa), min(pb))
        if solape <= 0:
            return None
        if mejor is None or solape < mejor[0]:
            d = (a.cx - b.cx) * eje[0] + (a.cy - b.cy) * eje[1]
            s = 1 if d >= 0 else -1
            mejor = (solape, eje[0] * s, eje[1] * s)
    return mejor


def rayo_caja(ox, oy, dx, dy, caja: Caja) -> float | None:
    """Distancia desde (ox, oy) en la dirección unitaria (dx, dy) hasta la caja, o None."""
    (ax, ay), (bx, by) = caja.ejes()
    rx, ry = ox - caja.cx, oy - caja.cy
    o = (rx * ax + ry * ay, rx * bx + ry * by)
    d = (dx * ax + dy * ay, dx * bx + dy * by)
    tmin, tmax = -math.inf, math.inf
    for k, h in ((0, caja.hx), (1, caja.hy)):
        if abs(d[k]) < 1e-12:
            if abs(o[k]) > h:
                return None
            continue
        t1, t2 = (-h - o[k]) / d[k], (h - o[k]) / d[k]
        tmin, tmax = max(tmin, min(t1, t2)), min(tmax, max(t1, t2))
    if tmax < max(tmin, 0):
        return None
    return tmin if tmin >= 0 else 0.0


class Rueda:
    def __init__(self, lado: int):
        self.lado = lado                 # +1 izquierda, -1 derecha
        self.omega = 0.0                 # rad/s, + = hacia adelante
        self.patina = False
        self.fuerza = 0.0


class Carrito:
    def __init__(self, masa=40.0, inercia=None, mu=0.7, normal_rueda=85.0, crr=0.03, giro_rodajas=0.6):
        self.x = self.y = self.th = 0.0
        self.v = 0.0        # m/s hacia adelante
        self.w = 0.0        # rad/s
        self.masa = masa
        self.inercia = inercia if inercia is not None else masa * (LARGO ** 2 + ANCHO ** 2) / 12
        self.mu, self.normal = mu, normal_rueda
        self.crr, self.giro_rodajas = crr, giro_rodajas
        self.j_rueda = 0.5 * 1.4 * R_RUEDA ** 2      # rueda-motor de ~1.4 kg (supuesto)
        self.izq, self.der = Rueda(+1), Rueda(-1)
        self.contactos: list[str] = []

    def caja(self, x=None, y=None, th=None) -> Caja:
        x = self.x if x is None else x
        y = self.y if y is None else y
        th = self.th if th is None else th
        return Caja(x - EJE_DELANTE_DEL_CENTRO * math.cos(th), y - EJE_DELANTE_DEL_CENTRO * math.sin(th),
                    LARGO / 2, ANCHO / 2, th, "carrito")

    def a_mundo(self, px, py):
        """Punto en ejes del carrito (desde el eje de las ruedas) a ejes del mapa."""
        c, s = math.cos(self.th), math.sin(self.th)
        return self.x + px * c - py * s, self.y + px * s + py * c

    def velocidad_suelo(self, rueda: Rueda) -> float:
        return self.v - rueda.lado * self.w * VIA / 2

    def paso(self, dt: float, par_izq: float, par_der: float, obstaculos: list[Caja]):
        lim = self.mu * self.normal
        fuerzas = []
        for rueda, par in ((self.izq, par_izq), (self.der, par_der)):
            vs = self.velocidad_suelo(rueda)
            if not rueda.patina:
                f = par / R_RUEDA
                if abs(f) > lim:
                    rueda.patina = True
                else:
                    rueda.omega = vs / R_RUEDA
            if rueda.patina:
                desliz = rueda.omega * R_RUEDA - vs
                f = math.copysign(lim, desliz) if abs(desliz) > 1e-4 else par / R_RUEDA
                rueda.omega += (par - f * R_RUEDA) / self.j_rueda * dt
                if abs(rueda.omega * R_RUEDA - vs) < 0.005 and abs(par / R_RUEDA) <= lim:
                    rueda.patina = False
            rueda.fuerza = f
            fuerzas.append(f)
        fi, fd = fuerzas
        m_eff = self.masa + sum(self.j_rueda / R_RUEDA ** 2 for r in (self.izq, self.der) if not r.patina)
        rodar = self.crr * self.masa * G * math.tanh(self.v / 0.02)
        rodajas = self.giro_rodajas * math.tanh(self.w / 0.05)
        self.v += (fi + fd - rodar) / m_eff * dt
        self.w += ((fd - fi) * VIA / 2 - rodajas) / self.inercia * dt
        # integrar y resolver choques
        self.th += self.w * dt
        self.x += self.v * math.cos(self.th) * dt
        self.y += self.v * math.sin(self.th) * dt
        self.contactos = []
        for _ in range(3):
            empuje = None
            for ob in obstaculos:
                s = separacion(self.caja(), ob)
                if s and (empuje is None or s[0] > empuje[0]):
                    empuje = (*s, ob.nombre)
            if not empuje:
                break
            prof, nx, ny, nombre = empuje
            self.contactos.append(nombre)
            self.x += nx * (prof + 1e-5)
            self.y += ny * (prof + 1e-5)
            hx, hy = math.cos(self.th), math.sin(self.th)
            hacia = (self.v * hx) * nx + (self.v * hy) * ny
            if hacia < 0:                         # se mueve hacia el obstáculo: pierde esa parte
                hn = hx * nx + hy * ny
                self.v *= 1 - hn * hn
            self.w *= 0.5
        for rueda in (self.izq, self.der):
            if not rueda.patina:
                rueda.omega = self.velocidad_suelo(rueda) / R_RUEDA
