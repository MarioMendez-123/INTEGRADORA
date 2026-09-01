"""Script de verificación MANUAL de localización con marcadores ArUco — no
es una prueba de pytest.

Abre la cámara por defecto del sistema (índice 0) con OpenCV, igual que
test_camera.py, test_yolo.py y test_barcode.py, y en cada frame detecta
marcadores ArUco (diccionario DICT_4X4_50 — los mismos IDs que genera
generate_aruco_markers.py) con cv2.aruco. Dibuja el contorno detectado y el
ID sobre el video en vivo.

ArUco aquí es VERIFICACIÓN DE POSICIÓN (Decisión 2, aether_context_docs.md
sección 3): un marcador detectado confirma que el robot está en un punto
conocido, nada más. Esto NUNCA debe describirse ni tratarse como un sistema
de navegación — la navegación por waypoints con odometría (Decisión 3) es un
módulo aparte, que todavía no existe.

Se corre a mano y se cierra presionando 'q'; no se ejecuta como parte de la
suite automática de pruebas.
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
ARUCO_DICTIONARY = cv2.aruco.DICT_4X4_50
WINDOW_NAME = "Aether — verificación de localización ArUco (presiona 'q' para salir)"


def main() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)

    dictionary = cv2.aruco.getPredefinedDictionary(ARUCO_DICTIONARY)
    detector = cv2.aruco.ArucoDetector(dictionary, cv2.aruco.DetectorParameters())

    cap = cv2.VideoCapture(CAMERA_INDEX)

    if not cap.isOpened():
        logger.error(
            "No se pudo abrir la cámara (índice %d). Verifica que esté "
            "conectada y no esté en uso por otra aplicación.",
            CAMERA_INDEX,
        )
        return

    logger.info("Cámara (índice %d) abierta correctamente.", CAMERA_INDEX)

    # Deduplicación de log, misma disciplina que test_barcode.py: solo se
    # registra un INFO la primera vez que aparece cada ID en esta ejecución.
    seen_ids: set[int] = set()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.error("No se pudo leer un frame de la cámara.")
                break

            corners, ids, _ = detector.detectMarkers(frame)

            if ids is not None:
                cv2.aruco.drawDetectedMarkers(frame, corners, ids)

                for marker_id in ids.flatten():
                    marker_id = int(marker_id)
                    if marker_id not in seen_ids:
                        seen_ids.add(marker_id)
                        logger.info("Marcador ArUco detectado: ID %d.", marker_id)

            cv2.imshow(WINDOW_NAME, frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                logger.info("Tecla 'q' presionada, cerrando.")
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
