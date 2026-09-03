"""Captura headless del pipeline combinado de percepción — alternativa sin
interfaz gráfica a test_combined.py, pensada para correrse sin supervisión
(ej. desde scripts/refresh_inventory.py) en vez de depender de que alguien
presione 'q' en una ventana de OpenCV.

Mismo pipeline real que test_combined.py (Decisiones 1 y 2, sección 3 de
aether_context_docs.md): YOLO detecta y cuenta, pyzbar intenta leer un
código dentro de cada caja delimitadora, ArUco localiza el frame completo.
Corre durante --seconds (por defecto 15) en vez de hasta una tecla, y al
terminar escribe las mismas Observations acumuladas al mismo
observations_output.json que ya consume
edge/inventory_engine/aggregate_observations.py — mismo formato, mismo
archivo de salida, para que ese script no tenga que distinguir de cuál de
los dos escenarios (interactivo o headless) vino la captura.

No reemplaza a test_combined.py: ese sigue siendo la herramienta de
verificación manual e interactiva del equipo (con ventana de video en
vivo). Este es el modo no interactivo, para refrescar el inventario sin
que alguien se quede viendo la pantalla.
"""

import argparse
import json
import logging
import sys
import time
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path

import cv2
from pyzbar.pyzbar import decode
from ultralytics import YOLO

# Permite importar edge/logging_config.py e inventory_engine sin importar
# desde dónde se corra este script (mismo patrón que test_combined.py).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from inventory_engine.observations.observation import Observation
from logging_config import setup_logging

CAMERA_INDEX = 0
MODEL_NAME = "yolov8n.pt"
ARUCO_DICTIONARY = cv2.aruco.DICT_4X4_50
OUTPUT_PATH = Path(__file__).resolve().parent / "observations_output.json"
DEFAULT_DURATION_SECONDS = 15.0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--seconds",
        type=float,
        default=DEFAULT_DURATION_SECONDS,
        help=f"Duración de la captura en segundos (default: {DEFAULT_DURATION_SECONDS:.0f}).",
    )
    args = parser.parse_args()

    setup_logging()
    logger = logging.getLogger(__name__)

    model = YOLO(MODEL_NAME)
    logger.info("Modelo YOLO '%s' cargado correctamente.", MODEL_NAME)

    aruco_dictionary = cv2.aruco.getPredefinedDictionary(ARUCO_DICTIONARY)
    aruco_detector = cv2.aruco.ArucoDetector(aruco_dictionary, cv2.aruco.DetectorParameters())

    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        logger.error(
            "No se pudo abrir la cámara (índice %d). Verifica que esté "
            "conectada y no esté en uso por otra aplicación (ej. el "
            "dashboard, si tiene un stream activo).",
            CAMERA_INDEX,
        )
        sys.exit(1)

    logger.info(
        "Cámara (índice %d) abierta correctamente. Capturando %.0f segundos...",
        CAMERA_INDEX,
        args.seconds,
    )

    # Misma deduplicación de log que test_combined.py: un INFO por código,
    # clase sin código o marcador ArUco nuevo — no en cada fotograma.
    seen_codes: set[str] = set()
    seen_unidentified_classes: set[str] = set()
    seen_aruco_ids: set[int] = set()

    observations: list[Observation] = []
    frames_read = 0
    start = time.monotonic()

    try:
        while time.monotonic() - start < args.seconds:
            ret, frame = cap.read()
            if not ret:
                logger.warning("No se pudo leer un frame de la cámara.")
                continue
            frames_read += 1

            aruco_corners, aruco_ids, _ = aruco_detector.detectMarkers(frame)
            location_marker_id = int(aruco_ids.flatten()[0]) if aruco_ids is not None else None
            if aruco_ids is not None:
                for marker_id in aruco_ids.flatten():
                    marker_id = int(marker_id)
                    if marker_id not in seen_aruco_ids:
                        seen_aruco_ids.add(marker_id)
                        logger.info("Marcador ArUco detectado: ID %d.", marker_id)

            results = model(frame, verbose=False)

            for box in results[0].boxes:
                x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
                class_name = model.names[int(box.cls[0])]
                confidence = float(box.conf[0])

                # Recorte de la caja delimitadora: pyzbar solo busca código
                # dentro de la región de este objeto, no en el frame entero.
                crop = frame[y1:y2, x1:x2]
                codes = decode(crop) if crop.size > 0 else []
                data = codes[0].data.decode("utf-8") if codes else None

                if codes:
                    if data not in seen_codes:
                        seen_codes.add(data)
                        logger.info("Detección YOLO '%s' con código leído: %s", class_name, data)
                elif class_name not in seen_unidentified_classes:
                    seen_unidentified_classes.add(class_name)
                    logger.info(
                        "Detección YOLO '%s' sin código legible dentro de la caja.",
                        class_name,
                    )

                observations.append(
                    Observation(
                        timestamp=datetime.now(UTC).isoformat(),
                        detected_class=class_name,
                        code_data=data,
                        code_read=bool(codes),
                        confidence=confidence,
                        location_marker_id=location_marker_id,
                    )
                )
    finally:
        cap.release()

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump([asdict(obs) for obs in observations], f, indent=2)

    logger.info(
        "Captura terminada: %d fotogramas leídos, %d Observations guardadas en %s",
        frames_read,
        len(observations),
        OUTPUT_PATH,
    )


if __name__ == "__main__":
    main()
