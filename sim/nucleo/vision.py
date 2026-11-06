"""Cámara C920 virtual y lo que "vería" el sistema de visión del Jetson.

El agente real (backend/aether_agent.py, GET /status) publica hoy solo:
  obstacles = {count, classes, max_area_pct}    # clases del YOLO general y cuánto del cuadro ocupa el más grande
Una cámara sola no mide distancia: el porcentaje de área es un indicio de cercanía.
Este módulo devuelve ese mismo formato, y además `arucos` y `detalle`, que son EXTRAS del simulador:
el agente real todavía no calcula la posición de los ArUco (solo detecta el ID) ni da detalle por objeto.

Geometría de la cámara (guía de armado rev. 3.21 y hoja de la C920): a 0.18 m delante del eje de las
ruedas, a 1.077 m del piso, inclinada 6° hacia abajo, 70.4° × 43.3° de campo (16:9), 1280 × 720 px.
Las clases de los obstáculos simulados son "person" y "box"; en el YOLO real salen nombres de COCO.
"""
from __future__ import annotations

import math

CAM_X, CAM_Z, TILT = 0.18, 1.077, 6.0
FOV_H, FOV_V = 70.4, 43.3
FOCAL_PX = 914.0                  # a 1280 × 720
PX_MINIMO = 40                    # tamaño mínimo para creerle a un ArUco (compuerta de la guía de navegación)
V_MIN, V_MAX = -TILT - FOV_V / 2, -TILT + FOV_V / 2


def _ang(a):
    while a > math.pi:
        a -= 2 * math.pi
    while a < -math.pi:
        a += 2 * math.pi
    return a


def _solape(a0, a1, b0, b1):
    return max(0.0, min(a1, b1) - max(a0, b0))


def deteccion(carrito, obstaculos, arucos) -> dict:
    cx, cy = carrito.a_mundo(CAM_X, 0.0)
    detalle = []
    for o in obstaculos:
        if o.nombre not in ("persona", "caja"):
            continue
        d = math.hypot(o.cx - cx, o.cy - cy)
        if d < 0.05:
            continue
        angulos = [math.degrees(_ang(math.atan2(y - cy, x - cx) - carrito.th)) for x, y in o.esquinas()]
        if max(angulos) - min(angulos) > 180:                           # cruza el ángulo ±180°
            continue
        h0, h1 = min(angulos), max(angulos)
        v0 = math.degrees(math.atan2(o.base - CAM_Z, d))
        v1 = math.degrees(math.atan2(o.base + o.alto - CAM_Z, d))
        ancho = _solape(h0, h1, -FOV_H / 2, FOV_H / 2)
        alto = _solape(v0, v1, V_MIN, V_MAX)
        if ancho <= 0 or alto <= 0:
            continue
        detalle.append({"clase": "person" if o.nombre == "persona" else "box", "area_pct": round(100 * ancho * alto / (FOV_H * FOV_V), 1),
                        "rumbo_deg": round((h0 + h1) / 2, 1), "distancia_real_m": round(d, 2),
                        "recortado": ancho < h1 - h0 - 0.01 or alto < v1 - v0 - 0.01})
    obst = {"count": len(detalle), "classes": sorted({x["clase"] for x in detalle}),
            "max_area_pct": max((x["area_pct"] for x in detalle), default=0.0)}
    vistos = []
    for a in arucos:
        dx, dy = a["x"] - cx, a["y"] - cy
        d = math.hypot(dx, dy)
        rumbo = math.degrees(_ang(math.atan2(dy, dx) - carrito.th))
        vert = math.degrees(math.atan2(a["z"] - CAM_Z, d))
        de_frente = (-dx * math.cos(a["yaw"]) - dy * math.sin(a["yaw"])) / max(d, 1e-6)   # 1 = el marcador mira directo a la cámara
        px = FOCAL_PX * a["lado"] / max(math.hypot(d, a["z"] - CAM_Z), 1e-6)
        mitad = math.degrees(math.atan2(a["lado"] / 2, d))
        completo = abs(rumbo) + mitad <= FOV_H / 2 and V_MIN <= vert - mitad and vert + mitad <= V_MAX
        if de_frente > 0.3 and abs(rumbo) <= FOV_H / 2 and V_MIN <= vert <= V_MAX and px >= PX_MINIMO:
            vistos.append({"id": a["id"], "distancia_m": round(d, 2), "rumbo_deg": round(rumbo, 1), "px": round(px), "completo": completo})
    return {"camera": {"open": True, "width": 1280, "height": 720, "simulada": True}, "obstacles": obst,
            "arucos": vistos, "detalle": detalle}
