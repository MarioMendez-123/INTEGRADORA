"""Pruebas reales de la lógica de agregación (edge/inventory_engine/
aggregate_observations.py): agrupar Observations, calcular promedios,
decidir identificador. Es la lógica de cálculo más importante del proyecto
hasta ahora, así que se prueba con datos de ejemplo inventados aquí — no con
el archivo real de Observations generado por la cámara.
"""

import sys
from pathlib import Path

import pytest

# Permite importar edge/inventory_engine sin instalarlo como paquete: agrega
# edge/ a sys.path, igual que hacen los propios scripts de edge/ entre sí.
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "edge"))

from inventory_engine.aggregate_observations import aggregate


def _observation(
    *,
    detected_class: str,
    code_data: str | None = None,
    code_read: bool = False,
    confidence: float = 0.5,
    timestamp: str = "2026-01-01T00:00:00+00:00",
    location_marker_id: int | None = None,
) -> dict:
    """Construye una Observation de prueba con valores por defecto simples."""
    return {
        "timestamp": timestamp,
        "detected_class": detected_class,
        "code_data": code_data,
        "code_read": code_read,
        "confidence": confidence,
        "location_marker_id": location_marker_id,
    }


def test_agrupa_observations_con_mismo_code_data():
    observations = [
        _observation(
            detected_class="bottle", code_data="7501518489842", code_read=True
        ),
        _observation(
            detected_class="bottle", code_data="7501518489842", code_read=True
        ),
    ]

    entries = aggregate(observations)

    assert len(entries) == 1
    assert entries[0].identifier == "7501518489842"
    assert entries[0].total_observations == 2


def test_observation_sin_code_data_genera_identifier_unidentified():
    observations = [_observation(detected_class="chair", code_data=None)]

    entries = aggregate(observations)

    assert len(entries) == 1
    assert entries[0].identifier == "unidentified:chair"


def test_avg_confidence_es_el_promedio_correcto():
    observations = [
        _observation(detected_class="bottle", code_data="abc", confidence=0.2),
        _observation(detected_class="bottle", code_data="abc", confidence=0.4),
        _observation(detected_class="bottle", code_data="abc", confidence=0.9),
    ]
    expected_avg = (0.2 + 0.4 + 0.9) / 3

    entries = aggregate(observations)

    assert entries[0].avg_confidence == pytest.approx(expected_avg)


def test_first_seen_y_last_seen_correctos_con_observations_desordenadas():
    observations = [
        _observation(
            detected_class="bottle",
            code_data="xyz",
            timestamp="2026-01-01T10:00:00+00:00",
        ),
        _observation(
            detected_class="bottle",
            code_data="xyz",
            timestamp="2026-01-01T08:00:00+00:00",
        ),
        _observation(
            detected_class="bottle",
            code_data="xyz",
            timestamp="2026-01-01T12:00:00+00:00",
        ),
    ]

    entries = aggregate(observations)

    assert entries[0].first_seen == "2026-01-01T08:00:00+00:00"
    assert entries[0].last_seen == "2026-01-01T12:00:00+00:00"


def test_code_read_count_solo_cuenta_observations_con_code_read_true():
    observations = [
        _observation(detected_class="bottle", code_data="qqq", code_read=True),
        _observation(detected_class="bottle", code_data="qqq", code_read=False),
        _observation(detected_class="bottle", code_data="qqq", code_read=True),
    ]

    entries = aggregate(observations)

    assert entries[0].total_observations == 3
    assert entries[0].code_read_count == 2


def test_location_counts_agrupa_por_marker_id_y_sin_ubicacion():
    observations = [
        _observation(detected_class="bottle", code_data="loc1", location_marker_id=3),
        _observation(
            detected_class="bottle", code_data="loc1", location_marker_id=None
        ),
        _observation(detected_class="bottle", code_data="loc1", location_marker_id=3),
    ]

    entries = aggregate(observations)

    assert entries[0].location_counts == {"3": 2, "sin_ubicacion": 1}
