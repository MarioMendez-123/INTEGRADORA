"""Contratos entre agentes y laptop (agent_contracts.py): lo que valida y lo que rechaza."""

import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest
from pydantic import ValidationError

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from agent_contracts import (  # noqa: E402
    MAX_BATCH,
    CellEvent,
    Observation,
    ObservationBatch,
    VoiceMessageError,
    parse_voice_message,
)


def obs(**cambios):
    base = dict(
        event_id="a" * 32,
        timestamp="2026-10-23T15:00:01.123456+00:00",
        source="jetson",
        detected_class="bottle",
        code_data=None,
        code_read=False,
        confidence=0.87,
        location_marker_id=4,
    )
    base.update(cambios)
    return base


def test_observacion_valida_y_legacy_conserva_las_claves_de_siempre():
    o = Observation(**obs())
    assert o.timestamp.tzinfo is not None
    assert set(o.legacy()) == {"timestamp", "detected_class", "code_data", "code_read", "confidence", "location_marker_id"}
    assert o.legacy()["location_marker_id"] == 4


@pytest.mark.parametrize(
    "cambio",
    [
        {"event_id": "corto"},
        {"event_id": "con espacios " * 3},
        {"source": "Jetson"},
        {"confidence": 1.5},
        {"confidence": -0.1},
        {"detected_class": ""},
        {"detected_class": "x" * 65},
        {"code_data": "x" * 257},
        {"location_marker_id": -1},
        {"timestamp": "2026-10-23T15:00:01"},  # sin zona horaria
        {"v": 2},
        {"extra": 1},
    ],
)
def test_observacion_invalida_se_rechaza(cambio):
    with pytest.raises(ValidationError):
        Observation(**obs(**cambio))


def test_lote_limites_y_mismo_origen():
    ObservationBatch(source="jetson", observations=[obs(event_id=f"id{n:08d}") for n in range(MAX_BATCH)])
    with pytest.raises(ValidationError):
        ObservationBatch(source="jetson", observations=[obs(event_id=f"id{n:08d}") for n in range(MAX_BATCH + 1)])
    with pytest.raises(ValidationError):
        ObservationBatch(source="jetson", observations=[])
    with pytest.raises(ValidationError, match="mismo source"):
        ObservationBatch(source="jetson", observations=[obs(source="pi")])


def test_evento_de_celda():
    CellEvent(event_id="e" * 16, timestamp=datetime.now(timezone.utc), pieza=3, juicio="FAIL", accion="expulsada")
    with pytest.raises(ValidationError):
        CellEvent(event_id="e" * 16, timestamp=datetime.now(timezone.utc), pieza=3, juicio="TAL VEZ", accion="x")


def test_voz_roles_y_tipos():
    t = parse_voice_message('{"v":1,"type":"transcript","text":"hola lumina","t":"2026-10-23T15:00:00+00:00"}', "service")
    assert t.text == "hola lumina"
    s = parse_voice_message('{"v":1,"type":"speaking","value":true}', "listener")
    assert s.value is True
    # una página no puede mandar texto; el servicio no puede mandar speaking
    with pytest.raises(VoiceMessageError):
        parse_voice_message('{"v":1,"type":"transcript","text":"x","t":"2026-10-23T15:00:00+00:00"}', "listener")
    with pytest.raises(VoiceMessageError):
        parse_voice_message('{"v":1,"type":"speaking","value":true}', "service")


@pytest.mark.parametrize(
    "raw",
    [
        "no es json",
        "[]",
        '{"v":1,"type":"transcript","text":"","t":"2026-10-23T15:00:00+00:00"}',
        '{"v":1,"type":"transcript","text":"' + "a" * 501 + '","t":"2026-10-23T15:00:00+00:00"}',
        '{"v":1,"type":"transcript","text":"hola","t":"2026-10-23T15:00:00+00:00","extra":1}',
        '{"v":2,"type":"transcript","text":"hola","t":"2026-10-23T15:00:00+00:00"}',
        '{"v":1,"type":"transcript","text":"' + "a" * 3000 + '","t":"2026-10-23T15:00:00+00:00"}',
    ],
)
def test_voz_mensajes_invalidos(raw):
    with pytest.raises(VoiceMessageError):
        parse_voice_message(raw, "service")
