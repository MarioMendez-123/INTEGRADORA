"""Script de verificación MANUAL de la cámara — no es una prueba de pytest.

Abre la cámara por defecto del sistema (índice 0) con OpenCV y muestra el
video en vivo en una ventana, para confirmar que la cámara funciona antes de
integrar YOLO o lectura de códigos de barras/QR. Se corre a mano y se cierra
presionando 'q'; no se ejecuta como parte de la suite automática de pruebas.
"""

import logging
import sys
from pathlib import Path

import cv2

# Permite importar edge/logging_config.py sin importar desde dónde se corra
# este script (directamente o dentro de edge/).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from logging_config import setup_logging

CAMERA_INDEX = 0
WINDOW_NAME = "Aether — verificación de cámara (presiona 'q' para salir)"


def main() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)

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

            cv2.imshow(WINDOW_NAME, frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                logger.info("Tecla 'q' presionada, cerrando.")
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
