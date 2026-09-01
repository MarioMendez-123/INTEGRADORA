"""Pipeline combinado de percepción — YOLO + código de barras/QR + ArUco.

A diferencia de test_camera.py, test_yolo.py, test_barcode.py y
test_aruco.py (verificación manual aislada de una sola pieza), este script
es el pipeline combinado real de percepción según las Decisiones 1 y 2
(aether_context_docs.md, sección 3): detección/conteo con YOLO,
identificación de producto por código de barras/QR leído dentro de cada
caja delimitadora, y ubicación por marcador ArUco visible en el frame.

Abre la cámara por defecto del sistema (índice 0) con OpenCV. En cada frame:
corre YOLOv8n (ultralytics) y, por cada objeto detectado, recorta la región
de su caja delimitadora y dentro de ese recorte intenta leer un código de
barras/QR con pyzbar; además corre detección ArUco (mismo diccionario
DICT_4X4_50 que test_aruco.py) sobre el frame completo. Dibuja siempre la
caja de YOLO con su clase — con o sin código legible, la detección nunca se
descarta solo por no poder leer un código dentro de ella (explícito en la
Decisión 1: el conteo/detección es independiente de la identificación) — y
dibuja también el contorno + ID de cualquier marcador ArUco visible, para
ver en vivo qué ubicación está "activa". Se corre a mano y se cierra
presionando 'q'; no se ejecuta como parte de la suite automática de pruebas.

ArUco aquí es VERIFICACIÓN DE POSICIÓN (Decisión 2) — nunca navegación.

Además, por cada detección de YOLO en cada frame (sin deduplicar — cada una
es un registro real de ese instante, a diferencia del log deduplicado de
arriba) crea una Observation y la acumula en memoria. El `location_marker_id`
de cada Observation es el ID del primer marcador ArUco detectado en ese
mismo frame, o None si no había ninguno visible — si hay más de uno visible
no se fabrica lógica de prioridad todavía. Al presionar 'q', antes de
liberar la cámara, vuelca todas las Observations acumuladas como JSON a
observations_output.json — es un archivo de salida de prueba local, no se
sube al repositorio (ver .gitignore).
"""

import json
import logging
import sys
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path

import cv2
from pyzbar.pyzbar import decode
from ultralytics import YOLO

# Permite importar edge/logging_config.py e inventory_engine sin importar
# desde dónde se corra este script (directamente o dentro de edge/).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from inventory_engine.observations.observation import Observation
from logging_config import setup_logging

CAMERA_INDEX = 0
MODEL_NAME = "yolov8n.pt"
ARUCO_DICTIONARY = cv2.aruco.DICT_4X4_50
WINDOW_NAME = "Aether — pipeline combinado (presiona 'q' para salir)"
OUTPUT_PATH = Path(__file__).resolve().parent / "observations_output.json"


def main() -> None:
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
            "conectada y no esté en uso por otra aplicación.",
            CAMERA_INDEX,
        )
        return

    logger.info("Cámara (índice %d) abierta correctamente.", CAMERA_INDEX)

    # Deduplicación de log, misma lógica que test_barcode.py: solo se
    # registra un INFO la primera vez que aparece cada código, o cada clase
    # detectada sin código legible, en esta ejecución — no en cada frame.
    seen_codes: set[str] = set()
    seen_unidentified_classes: set[str] = set()

    # Misma deduplicación, aquí para IDs de marcador ArUco (patrón de
    # test_aruco.py): solo un INFO la primera vez que aparece cada ID en
    # esta ejecución — no en cada frame.
    seen_aruco_ids: set[int] = set()

    # Registro crudo, sin deduplicar: una Observation por cada detección de
    # YOLO en cada frame (Decisión 5, aether_context_docs.md sección 3).
    observations: list[Observation] = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.error("No se pudo leer un frame de la cámara.")
                break

            # Detección ArUco sobre el frame completo (no por caja de YOLO):
            # verificación de posición (Decisión 2), nunca navegación. Si
            # hay más de un marcador visible se usa el primero detectado,
            # sin lógica de prioridad todavía.
            aruco_corners, aruco_ids, _ = aruco_detector.detectMarkers(frame)
            location_marker_id = int(aruco_ids.flatten()[0]) if aruco_ids is not None else None
            if aruco_ids is not None:
                cv2.aruco.drawDetectedMarkers(frame, aruco_corners, aruco_ids)

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

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(
                    frame,
                    class_name,
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2,
                )

                if codes:
                    cv2.putText(
                        frame,
                        data,
                        (x1, y2 + 20),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (255, 255, 0),
                        2,
                    )
                    if data not in seen_codes:
                        seen_codes.add(data)
                        logger.info("Detección YOLO '%s' con código leído: %s", class_name, data)
                else:
                    if class_name not in seen_unidentified_classes:
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

            cv2.imshow(WINDOW_NAME, frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                logger.info("Tecla 'q' presionada, cerrando.")

                with OUTPUT_PATH.open("w", encoding="utf-8") as f:
                    json.dump([asdict(obs) for obs in observations], f, indent=2)
                logger.info("Se guardaron %d Observations en %s", len(observations), OUTPUT_PATH)

                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
