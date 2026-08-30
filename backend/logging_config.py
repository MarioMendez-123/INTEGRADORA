"""Configuración estándar de logging para backend/.

Usa únicamente el módulo `logging` de la librería estándar de Python — no se
introduce ninguna librería externa nueva (principio 4.5, no fabricar
dependencias especulativas).
"""

import logging
from pathlib import Path

_LOG_DIR = Path(__file__).resolve().parent / "logs"
_LOG_FILE = _LOG_DIR / "backend.log"

_configured = False


def setup_logging() -> None:
    """Configura el logging del proceso una sola vez.

    Escribe simultáneamente a consola (para ver en vivo) y a
    `logs/backend.log` (para revisar después), con nivel mínimo INFO para no
    generar ruido excesivo con mensajes DEBUG.
    """
    global _configured
    if _configured:
        return

    _LOG_DIR.mkdir(parents=True, exist_ok=True)

    formatter = logging.Formatter(
        fmt="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    file_handler = logging.FileHandler(_LOG_FILE, encoding="utf-8")
    file_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    _configured = True


if __name__ == "__main__":
    setup_logging()
    logger = logging.getLogger(__name__)
    logger.info("prueba de logging funcionando")
