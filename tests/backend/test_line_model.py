"""Decodificador del detector ONNX de la Pi (backend/line_model.py), sin modelo real.

Se sustituye la red por una salida inventada con la forma de YOLOv8
(cajas candidatas x [cx, cy, w, h, puntaje por clase]) para comprobar la parte
que escribimos nosotros: deshacer el relleno del lienzo, escoger clase y
quitar cajas repetidas. La equivalencia con ultralytics sobre fotos reales se
midió aparte (ver docs/jetson/BITACORA_JETSON.md).
"""

import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from line_model import DetectorOnnx  # noqa: E402


def detector(salida):
    d = DetectorOnnx.__new__(DetectorOnnx)  # sin leer un .onnx
    d.nombres = ["uno", "dos", "tres"]
    d.imgsz = 320
    d.corte = 0.25
    d.iou = 0.45
    d._forward = lambda lienzo: salida
    return d


def test_caja_vuelve_a_coordenadas_del_frame_y_se_quita_la_repetida():
    # Frame 640x480 -> escala 0.5 -> 320x240, 40 px de relleno arriba y abajo.
    # Pieza "dos" en el frame real: x 100..300, y 100..260 (200x160).
    # En el lienzo: x 50..150, y 90..170 (+40 de relleno ya incluido): cx=100, cy=130, w=100, h=80.
    salida = np.array(
        [
            [100, 130, 100, 80, 0.0, 0.9, 0.0],  # la pieza
            [101, 131, 100, 80, 0.0, 0.8, 0.0],  # casi la misma caja: la quita el NMS
            [250, 200, 20, 20, 0.1, 0.1, 0.1],   # por debajo del corte
        ],
        dtype=np.float32,
    )
    frame = np.zeros((480, 640, 3), np.uint8)

    resultado = detector(salida)(frame)

    assert len(resultado) == 1
    nombre, confianza, (x1, y1, x2, y2) = resultado[0]
    assert nombre == "dos" and abs(confianza - 0.9) < 1e-6
    assert (abs(x1 - 100) <= 1, abs(y1 - 100) <= 1, abs(x2 - 300) <= 1, abs(y2 - 260) <= 1) == (True,) * 4


def test_sin_nada_sobre_el_corte_devuelve_lista_vacia():
    salida = np.full((5, 7), 0.05, dtype=np.float32)
    assert detector(salida)(np.zeros((480, 640, 3), np.uint8)) == []
