"""Modelos (pydantic) de los contratos entre agentes y laptop, y del canal de voz.

Fuente de verdad de contracts/agents_api.md. Todo mensaje lleva "v": 1 y se rechaza lo que
no encaje: campos extra, textos largos, versiones desconocidas. Nadie ejecuta nada de lo recibido.
"""

from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator

CONTRACT_VERSION = 1
EVENT_ID_PATTERN = r"^[A-Za-z0-9_-]{8,64}$"
SOURCE_PATTERN = r"^[a-z0-9_-]{1,32}$"
MAX_BATCH = 100
MAX_BODY_BYTES = 64 * 1024
MAX_VOICE_TEXT = 500
MAX_VOICE_MESSAGE_BYTES = 2048


class _Estricto(BaseModel):
    model_config = ConfigDict(extra="forbid")


def _utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        raise ValueError("el sello de tiempo debe llevar zona horaria (UTC)")
    return value.astimezone(timezone.utc)


# --------------------------------------------------------------------------- observaciones


class Observation(_Estricto):
    v: Literal[1] = 1
    event_id: str = Field(pattern=EVENT_ID_PATTERN)
    timestamp: datetime
    source: str = Field(pattern=SOURCE_PATTERN)
    detected_class: str = Field(min_length=1, max_length=64)
    code_data: str | None = Field(default=None, max_length=256)
    code_read: bool
    confidence: float = Field(ge=0.0, le=1.0)
    location_marker_id: int | None = Field(default=None, ge=0)

    _normaliza_tiempo = field_validator("timestamp")(_utc)

    def legacy(self) -> dict:
        """Las claves exactas que ya consumen los sinks y edge/inventory_engine."""
        return {
            "timestamp": self.timestamp.isoformat(),
            "detected_class": self.detected_class,
            "code_data": self.code_data,
            "code_read": self.code_read,
            "confidence": self.confidence,
            "location_marker_id": self.location_marker_id,
        }


class ObservationBatch(_Estricto):
    v: Literal[1] = 1
    source: str = Field(pattern=SOURCE_PATTERN)
    observations: list[Observation] = Field(min_length=1, max_length=MAX_BATCH)

    @model_validator(mode="after")
    def _mismo_origen(self):
        if any(o.source != self.source for o in self.observations):
            raise ValueError("todas las observaciones deben traer el mismo source que el lote")
        return self


class BatchResult(_Estricto):
    accepted: int
    duplicates: int


# --------------------------------------------------------------------------- celda


class CellEvent(_Estricto):
    v: Literal[1] = 1
    event_id: str = Field(pattern=EVENT_ID_PATTERN)
    timestamp: datetime
    pieza: int = Field(ge=0)
    juicio: Literal["PASS", "FAIL", "SIN_PIEZA"]
    accion: str = Field(min_length=1, max_length=64)

    _normaliza_tiempo = field_validator("timestamp")(_utc)


class CellEventBatch(_Estricto):
    v: Literal[1] = 1
    source: str = Field(pattern=SOURCE_PATTERN)
    events: list[CellEvent] = Field(min_length=1, max_length=MAX_BATCH)


# --------------------------------------------------------------------------- /status


class CameraStatus(_Estricto):
    open: bool
    fps_camera: float | None = None
    fps_delivery: float | None = None
    width: int | None = None
    height: int | None = None


class InferenceStatus(_Estricto):
    model: str
    mode: Literal["async", "sync"]
    ms_last: float | None = None
    ms_avg: float | None = None
    every_n_frames: int | None = None


class ObstacleStatus(_Estricto):
    """Apoyo para esquivar (detector general de YOLO). NO es inventario y NO sustituye a los sensores."""

    count: int = Field(ge=0)
    classes: list[str] = Field(default_factory=list, max_length=80)
    max_area_pct: float = Field(ge=0.0, le=100.0)


class LaptopStatus(_Estricto):
    url: str | None = None
    reachable: bool | None = None
    outbox_len: int = 0
    sent_total: int = 0
    dropped_total: int = 0
    last_error: str | None = None


class ResourceStatus(_Estricto):
    rss_mb: float | None = None
    cpu_pct: float | None = None


class AgentStatus(_Estricto):
    v: Literal[1] = 1
    agent_id: str
    role: Literal["perception", "cell"]
    state: Literal["starting", "running", "error", "stopped"]
    started_at: datetime
    error: str | None = None
    camera: CameraStatus
    inference: InferenceStatus
    laptop: LaptopStatus
    resources: ResourceStatus = ResourceStatus()
    obstacles: ObstacleStatus | None = None  # solo si el agente corre piezas + obstáculos


# --------------------------------------------------------------------------- /config/agents


class StreamConfig(_Estricto):
    stream_url: str | None = None


class AgentsConfig(_Estricto):
    v: Literal[1] = 1
    perception: StreamConfig = StreamConfig()
    line_vision: StreamConfig = StreamConfig()


# --------------------------------------------------------------------------- voz


class VoiceTranscript(_Estricto):
    v: Literal[1] = 1
    type: Literal["transcript"]
    text: str = Field(min_length=1, max_length=MAX_VOICE_TEXT)
    t: datetime

    _normaliza_tiempo = field_validator("t")(_utc)


class VoiceStatus(_Estricto):
    v: Literal[1] = 1
    type: Literal["status"]
    state: Literal["active", "paused", "off"]
    t: datetime

    _normaliza_tiempo = field_validator("t")(_utc)


class VoiceSpeaking(_Estricto):
    v: Literal[1] = 1
    type: Literal["speaking"]
    value: bool


# Quién puede mandar qué por el canal de voz.
VOICE_SENDS = {"service": {"transcript": VoiceTranscript, "status": VoiceStatus}, "listener": {"speaking": VoiceSpeaking}}


class VoiceMessageError(ValueError):
    """Mensaje de voz que no se acepta (tamaño, JSON, tipo o campos)."""


def parse_voice_message(raw: str, role: str):
    if len(raw.encode("utf-8", errors="replace")) > MAX_VOICE_MESSAGE_BYTES:
        raise VoiceMessageError("mensaje demasiado grande")
    import json

    try:
        data = json.loads(raw)
    except ValueError:
        raise VoiceMessageError("no es JSON") from None
    if not isinstance(data, dict):
        raise VoiceMessageError("debe ser un objeto JSON")
    modelo = VOICE_SENDS.get(role, {}).get(data.get("type"))
    if modelo is None:
        raise VoiceMessageError(f"el rol '{role}' no puede mandar el tipo '{data.get('type')}'")
    try:
        return modelo.model_validate(data)
    except ValidationError as exc:
        raise VoiceMessageError(f"campos inválidos: {exc.errors()[0]['loc']}") from None
