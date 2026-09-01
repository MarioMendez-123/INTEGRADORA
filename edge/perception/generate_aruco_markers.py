"""Genera imágenes PNG de marcadores ArUco para probar la localización.

No es una prueba de pytest: es un script de utilidad que se corre una vez
(o cuando se necesiten marcadores nuevos) para producir las imágenes que
luego se imprimen o se muestran en pantalla, y así probar
edge/perception/test_aruco.py.

ArUco aquí es VERIFICACIÓN DE POSICIÓN (Decisión 2, aether_context_docs.md
sección 3) — nunca debe describirse como sistema de navegación.
"""

import logging
import sys
from pathlib import Path

import cv2

# Permite importar edge/logging_config.py sin importar desde dónde se corra
# este script (directamente o dentro de edge/).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from logging_config import setup_logging

ARUCO_DICTIONARY = cv2.aruco.DICT_4X4_50
MARKER_IDS = range(4)
MARKER_SIZE_PX = 400
OUTPUT_DIR = Path(__file__).resolve().parent / "aruco_markers"


def main() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    dictionary = cv2.aruco.getPredefinedDictionary(ARUCO_DICTIONARY)

    for marker_id in MARKER_IDS:
        marker_image = cv2.aruco.generateImageMarker(dictionary, marker_id, MARKER_SIZE_PX)
        output_path = OUTPUT_DIR / f"aruco_{marker_id}.png"
        cv2.imwrite(str(output_path), marker_image)
        logger.info("Marcador ArUco ID %d generado en %s.", marker_id, output_path)


if __name__ == "__main__":
    main()
