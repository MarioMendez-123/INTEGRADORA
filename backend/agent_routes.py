"""Rutas de la laptop para los agentes y el canal de voz (se montan en main.py con include_router).

- POST /perception/observations   observaciones del agente del Jetson (idempotente, solo red local)
- POST /line/cell/events          eventos de la celda de la Pi (se anotan; no accionan nada)
- GET  /line/cell/events/recent   los últimos eventos anotados
- GET  /config/agents             direcciones base de los agentes, para las páginas
- WS   /voice/ws                  relevo del servicio de voz hacia las páginas de Lumina

Nada de esto toca GPIO ni la lógica del inventario: solo entrega datos validados a quien ya los consumía.
"""

import logging

from fastapi import APIRouter, HTTPException, Request, WebSocket
from pydantic import ValidationError

from agent_config import agents_config
from agent_contracts import MAX_BODY_BYTES, BatchResult, CellEventBatch, ObservationBatch
from lan_guard import request_is_lan
from observation_intake import CellEventIntake, ObservationIntake
from voice_hub import VoiceHub

logger = logging.getLogger(__name__)


async def _body_limited(request: Request) -> bytes:
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail="Petición demasiado grande.")
    chunks, total = [], 0
    async for chunk in request.stream():
        total += len(chunk)
        if total > MAX_BODY_BYTES:
            raise HTTPException(status_code=413, detail="Petición demasiado grande.")
        chunks.append(chunk)
    return b"".join(chunks)


def _require_lan(request: Request) -> None:
    headers = {k.lower(): v for k, v in request.headers.items()}
    if not request_is_lan(request.scope, headers):
        raise HTTPException(status_code=403, detail="Solo red local.")


def create_router(notify_observation) -> tuple[APIRouter, dict]:
    """notify_observation(dict) recibe cada observación NUEVA con las claves de siempre."""
    router = APIRouter()
    observations = ObservationIntake(notify_observation)
    cell_events = CellEventIntake()
    hub = VoiceHub()

    @router.post("/perception/observations")
    async def receive_observations(request: Request) -> BatchResult:
        _require_lan(request)
        raw = await _body_limited(request)
        try:
            batch = ObservationBatch.model_validate_json(raw)
        except ValidationError as exc:
            raise HTTPException(status_code=422, detail=f"Lote inválido ({exc.error_count()} errores).") from None
        accepted, duplicates = observations.accept(batch)
        return BatchResult(accepted=accepted, duplicates=duplicates)

    @router.post("/line/cell/events")
    async def receive_cell_events(request: Request) -> BatchResult:
        _require_lan(request)
        raw = await _body_limited(request)
        try:
            batch = CellEventBatch.model_validate_json(raw)
        except ValidationError as exc:
            raise HTTPException(status_code=422, detail=f"Lote inválido ({exc.error_count()} errores).") from None
        accepted, duplicates = cell_events.accept(batch)
        return BatchResult(accepted=accepted, duplicates=duplicates)

    @router.get("/line/cell/events/recent")
    def recent_cell_events(request: Request, limit: int = 20):
        _require_lan(request)
        return cell_events.recent(max(1, min(limit, 100)))

    @router.get("/config/agents")
    def config_agents(request: Request):
        _require_lan(request)
        host = request.client.host if request.client else ""
        return agents_config(host).model_dump(mode="json")

    @router.websocket("/voice/ws")
    async def voice_ws(ws: WebSocket):
        await hub.handle(ws)

    return router, {"observations": observations, "cell_events": cell_events, "hub": hub}
