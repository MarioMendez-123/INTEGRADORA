"""Carga Declared Inventory desde edge/ a la base de datos del backend.

Lee edge/inventory_engine/declared_inventory_output.json (el resultado de
edge/inventory_engine/aggregate_observations.py) y en cada corrida:

- Hace upsert de cada entrada en `declared_entries` (estado actual): si el
  `identifier` ya existe se actualiza, si no existe se crea.
- Inserta una fila NUEVA por cada entrada en `declared_entry_history`
  (bitácora, Decisión 7) — esa tabla nunca se actualiza ni se sobrescribe,
  solo se le agregan filas, una por entrada por corrida, con `recorded_at`
  como el momento de esta corrida.

Se corre a mano, después de correr aggregate_observations.py en edge/.
"""

import json
import logging
import sys
from datetime import UTC, datetime
from pathlib import Path

# Permite importar backend/logging_config.py y backend/db sin importar desde
# dónde se corra este script (directamente o dentro de backend/).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from db.database import SessionLocal, init_db
from db.models import DeclaredEntry, DeclaredEntryHistory
from logging_config import setup_logging

DECLARED_INVENTORY_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "edge"
    / "inventory_engine"
    / "declared_inventory_output.json"
)


def main() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)

    init_db()

    with DECLARED_INVENTORY_PATH.open(encoding="utf-8") as f:
        entries = json.load(f)

    recorded_at = datetime.now(UTC).isoformat()

    session = SessionLocal()
    try:
        for entry in entries:
            existing = session.get(DeclaredEntry, entry["identifier"])
            if existing is not None:
                existing.detected_class = entry["detected_class"]
                existing.total_observations = entry["total_observations"]
                existing.code_read_count = entry["code_read_count"]
                existing.avg_confidence = entry["avg_confidence"]
                existing.first_seen = entry["first_seen"]
                existing.last_seen = entry["last_seen"]
                existing.location_counts = entry["location_counts"]
                # existing.status NO se toca aquí a propósito: el upsert
                # nunca decide si un registro sigue activo o fue retirado —
                # eso es una decisión humana explícita, vía
                # PATCH /inventory/{identifier}/retire (backend/main.py).
                # Que un identifier no aparezca en esta corrida tampoco
                # cambia su status: sin saber si la corrida fue una
                # cobertura completa del piso (depende de Navegación, que
                # aún no existe), borrar o retirar automáticamente lo
                # ausente arriesgaría descartar inventario real que el
                # robot simplemente no alcanzó a ver esta vez.
            else:
                session.add(DeclaredEntry(**entry))

            session.add(DeclaredEntryHistory(**entry, recorded_at=recorded_at))

        session.commit()
    finally:
        session.close()

    logger.info(
        "Se cargaron/actualizaron %d registros de Declared Inventory (y se "
        "agregaron %d filas nuevas a la bitácora) desde %s.",
        len(entries),
        len(entries),
        DECLARED_INVENTORY_PATH.name,
    )


if __name__ == "__main__":
    main()
