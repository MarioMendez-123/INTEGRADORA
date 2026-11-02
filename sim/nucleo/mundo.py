"""El piso: banda, estación de descarga, postes de los ArUco y obstáculos.

Ejes del mapa: origen en el eje de las ruedas con el carrito acoplado en la banda, x hacia la
banda, y a la izquierda. Medidas de la guía de armado (banda de 3 tramos de 1030 mm que sale
hacia +x desde el acople; carrito acoplado con el frente en x = +0.18) y de lo decidido el
1 nov: descarga a 4 m (de la banda a su centro) y a 90° a la izquierda, cara a 2.18 m del
camino; ArUco de 20 cm a 1.5 m. La mesa inclinada es solo un ejemplo de descarga.
"""
from __future__ import annotations

import math

from .fisica import Caja

FRENTE_ACOPLADO = 0.18          # x del frente del carrito acoplado en la banda


def bocas_en_v(f: float, abre: float = 0.24, largo: float = 0.18, grueso: float = 0.02) -> list[Caja]:
    """Tramos abiertos de las guías: empiezan donde acaba el tramo recto, sin escalón."""
    c, s = math.cos(abre), math.sin(abre)
    x0, y0 = f - 0.18, 0.20075                     # esquina interior donde empieza el tramo recto
    cx = x0 - largo / 2 * c + grueso / 2 * s
    cy = y0 + largo / 2 * s + grueso / 2 * c
    return [Caja(cx, cy, largo / 2, grueso / 2, -abre, "boca de la guía izquierda", alto=0.30),
            Caja(cx, -cy, largo / 2, grueso / 2, abre, "boca de la guía derecha", alto=0.30)]


def estaciones() -> list[Caja]:
    f = FRENTE_ACOPLADO
    cajas = [
        Caja(f + 0.03 + 1.545, 0.0, 1.545, 0.17, 0, "banda", alto=0.83),
        Caja(f + 0.015, 0.11, 0.015, 0.02, 0, "tope izquierdo", alto=0.30),
        Caja(f + 0.015, -0.11, 0.015, 0.02, 0, "tope derecho", alto=0.30),
        # guías en V a los lados del carrito acoplado: tramo recto (±0.75 mm de juego) y boca abierta
        Caja(f - 0.09, 0.20075 + 0.01, 0.09, 0.01, 0, "guía en V izquierda", alto=0.30),
        Caja(f - 0.09, -0.20075 - 0.01, 0.09, 0.01, 0, "guía en V derecha", alto=0.30),
        *bocas_en_v(f),
        # estación de descarga (ejemplo: mesa inclinada de 1.4 × 0.3 m) con la cara en y = 2.18
        Caja(-3.82, 2.18 + 0.15, 0.70, 0.15, 0, "descarga", alto=0.83),
        # postes de los ArUco (4 × 4 cm, hasta 1.6 m)
        Caja(f + 0.105, -0.30, 0.02, 0.02, 0, "poste ArUco 0", alto=1.6),   # donde la guía pone su poste
        Caja(-4.60, 2.18 + 0.09, 0.02, 0.02, 0, "poste ArUco 1", alto=1.6),
    ]
    return cajas


ARUCOS = [  # id, x, y, altura del centro, hacia dónde mira (rad), lado del cuadro negro (m)
    {"id": 0, "x": FRENTE_ACOPLADO + 0.105 - 0.021, "y": -0.30, "z": 1.5, "yaw": 3.14159, "lado": 0.20},
    {"id": 1, "x": -4.60, "y": 2.18 + 0.09 - 0.021, "z": 1.5, "yaw": -1.5708, "lado": 0.20},
]


def obstaculo_persona(x: float, y: float) -> Caja:
    return Caja(x, y, 0.15, 0.25, 0, "persona", alto=1.7)


def obstaculo_caja(x: float, y: float) -> Caja:
    return Caja(x, y, 0.20, 0.20, 0, "caja", alto=0.40)
