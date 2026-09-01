"""Script de verificación MANUAL de detección YOLO — no es una prueba de pytest.

Abre la cámara por defecto del sistema (índice 0) con OpenCV, igual que
test_camera.py, y corre detección de objetos con el modelo preentrenado
YOLOv8n (ultralytics) sobre cada frame, dibujando las cajas de detección
sobre el video en vivo. Sirve para confirmar que el modelo carga y detecta
correctamente antes de integrarlo al pipeline de conteo/verificación. Se
corre a mano y se cierra presionando 'q'; no se ejecuta como parte de la
suite automática de pruebas.

La primera ejecución descarga automáticamente los pesos de yolov8n.
"""

import logging
import sys
from pathlib import Path

import cv2
from ultralytics import YOLO

# Permite importar edge/logging_config.py sin importar desde dónde se corra
# este script (directamente o dentro de edge/).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from logging_config import setup_logging

CAMERA_INDEX = 0
MODEL_NAME = "yolov8n.pt"
WINDOW_NAME = "Aether — verificación de YOLO (presiona 'q' para salir)"


def main() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)

    model = YOLO(MODEL_NAME)
    logger.info("Modelo YOLO '%s' cargado correctamente.", MODEL_NAME)

    cap = cv2.VideoCapture(CAMERA_INDEX)

    if not cap.isOpened():
        logger.error(
            "No se pudo abrir la cámara (índice %d). Verifica que esté "
            "conectada y no esté en uso por otra aplicación.",
            CAMERA_INDEX,
        )
        return

    logger.info("Cámara (índice %d) abierta correctamente.", CAMERA_INDEX)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.error("No se pudo leer un frame de la cámara.")
                break

            results = model(frame, verbose=False)
            annotated_frame = results[0].plot()

            cv2.imshow(WINDOW_NAME, annotated_frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                logger.info("Tecla 'q' presionada, cerrando.")
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
