"""Qué pesos de YOLO cargar.

Misma regla que backend/dataset_store.py (el backend no importa edge/):

- YOLO_WEIGHTS en el entorno gana siempre.
- Si existe weights/parts.pt, se usa.
- Si no, yolov8n.pt.
"""

from __future__ import annotations

import os
from pathlib import Path

WEIGHTS_FILE = Path(__file__).resolve().parent / "weights" / "parts.pt"
FALLBACK_WEIGHTS = "yolov8n.pt"


def resolve_yolo_weights() -> str:
    override = os.environ.get("YOLO_WEIGHTS")
    if override:
        return override
    if WEIGHTS_FILE.is_file():
        return str(WEIGHTS_FILE)
    return FALLBACK_WEIGHTS
