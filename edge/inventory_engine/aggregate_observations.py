"""Primer paso de agregación: Observations crudas → resumen legible.

Lee edge/perception/observations_output.json (Observations crudas generadas
por edge/perception/test_combined.py) y las agrupa en DeclaredEntry: por
`code_data` exacto cuando existe, o por `"unidentified:" + detected_class`
cuando no se leyó ningún código. El resultado se guarda como JSON en
edge/inventory_engine/declared_inventory_output.json.

Este es el primer paso de agregación hacia Declared Inventory (Decisión 5,
aether_context_docs.md sección 3), pero todavía NO asigna estado de
cobertura (PARTIAL/COMPLETE/INVALID) — ese estado depende de saber qué
recorrido hizo el robot, y eso lo determina el módulo de Navegación, que
todavía no existe. No se fabrica aquí para no simular una garantía que el
sistema aún no puede respaldar (principio 4.1, honestidad de producto).

Se corre a mano: no necesita cámara, solo el JSON de Observations ya
generado.
"""

import json
import logging
import sys
from collections import Counter
from dataclasses import asdict
from pathlib import Path

# Permite importar edge/logging_config.py e inventory_engine sin importar
# desde dónde se corra este script (directamente o dentro de edge/).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from inventory_engine.declared_inventory.declared_entry import DeclaredEntry
from logging_config import setup_logging

OBSERVATIONS_PATH = (
    Path(__file__).resolve().parent.parent / "perception" / "observations_output.json"
)
OUTPUT_PATH = Path(__file__).resolve().parent / "declared_inventory_output.json"


def _group_key(observation: dict) -> str:
    """Clave de agrupación: code_data exacto, o "unidentified:" + clase."""
    if observation["code_data"] is not None:
        return observation["code_data"]
    return f"unidentified:{observation['detected_class']}"


def _location_key(observation: dict) -> str:
    """Clave de ubicación: location_marker_id como string, o "sin_ubicacion"."""
    if observation["location_marker_id"] is not None:
        return str(observation["location_marker_id"])
    return "sin_ubicacion"


def aggregate(observations: list[dict]) -> list[DeclaredEntry]:
    """Agrupa Observations crudas en DeclaredEntry — función pura.

    No lee ni escribe archivos: recibe una lista de Observations (como
    dicts, con las mismas claves que produce edge/perception/test_combined.py)
    y regresa la lista de DeclaredEntry resultante, ordenada por identifier.
    """
    groups: dict[str, list[dict]] = {}
    for observation in observations:
        groups.setdefault(_group_key(observation), []).append(observation)

    entries = []
    for identifier, group in sorted(groups.items()):
        class_counts = Counter(o["detected_class"] for o in group)
        most_common_class = class_counts.most_common(1)[0][0]
        timestamps = sorted(o["timestamp"] for o in group)
        location_counts = Counter(_location_key(o) for o in group)

        entries.append(
            DeclaredEntry(
                identifier=identifier,
                detected_class=most_common_class,
                total_observations=len(group),
                code_read_count=sum(1 for o in group if o["code_read"]),
                avg_confidence=sum(o["confidence"] for o in group) / len(group),
                first_seen=timestamps[0],
                last_seen=timestamps[-1],
                location_counts=dict(location_counts),
            )
        )

    return entries


def main() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)

    with OBSERVATIONS_PATH.open(encoding="utf-8") as f:
        observations = json.load(f)

    entries = aggregate(observations)

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump([asdict(entry) for entry in entries], f, indent=2)

    logger.info(
        "Se generaron %d grupos únicos a partir de %d Observations totales.",
        len(entries),
        len(observations),
    )


if __name__ == "__main__":
    main()
