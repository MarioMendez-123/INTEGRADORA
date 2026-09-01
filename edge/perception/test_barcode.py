"""Script de verificación MANUAL de lectura de códigos de barras/QR — no es
una prueba de pytest.

Abre la cámara por defecto del sistema (índice 0) con OpenCV, igual que
test_camera.py y test_yolo.py, y en cada frame usa pyzbar para detectar y
decodificar códigos de barras/QR. Cuando encuentra uno, dibuja un recuadro
alrededor y muestra el texto decodificado sobre el video en vivo. Sirve para
confirmar que la lectura de códigos funciona antes de combinarla con YOLO en
el pipeline de conteo/verificación. Se corre a mano y se cierra presionando
'q'; no se ejecuta como parte de la suite automática de pruebas.

Por separado de YOLO por ahora — se combinan en un paso posterior.
"""

import logging
import sys
from pathlib import Path

import cv2
from pyzbar.pyzbar import decode

# Permite importar edge/logging_config.py sin importar desde dónde se corra
# este script (directamente o dentro de edge/).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from logging_config import setup_logging

CAMERA_INDEX = 0
WINDOW_NAME = "Aether — verificación de códigos (presiona 'q' para salir)"


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

    # Códigos ya reportados en el log, para no saturarlo con el mismo código
    # mientras sigue visible en frames consecutivos.
    seen_codes: set[str] = set()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.error("No se pudo leer un frame de la cámara.")
                break

            for barcode in decode(frame):
                x, y, w, h = barcode.rect
                data = barcode.data.decode("utf-8")

                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(
                    frame,
                    data,
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2,
                )

                if data not in seen_codes:
                    seen_codes.add(data)
                    logger.info("Código detectado (%s): %s", barcode.type, data)

            cv2.imshow(WINDOW_NAME, frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                logger.info("Tecla 'q' presionada, cerrando.")
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
