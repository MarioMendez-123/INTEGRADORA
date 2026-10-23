"""Relevo del canal de voz (laptop): el servicio de voz manda texto, las páginas de Lumina lo reciben.

Roles: "service" (el proceso de voz de la laptop; solo uno a la vez, el nuevo reemplaza al viejo) y
"listener" (páginas de Lumina que no tienen reconocimiento de voz propio). El servicio manda
{transcript, status}; las páginas mandan {speaking} (anti-eco). Nunca viaja audio. El hub no interpreta
el texto: valida, reenvía y guarda el último status y el último speaking para quien se conecte después.
Contratos: contracts/agents_api.md, sección 5.
"""

import logging
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect

from agent_contracts import VoiceMessageError, VoiceSpeaking, VoiceStatus, parse_voice_message
from lan_guard import host_is_lan, lan_networks, origin_matches_host

logger = logging.getLogger(__name__)

MAX_CLIENTS = 8
MAX_BAD_MESSAGES = 5


class VoiceHub:
    def __init__(self):
        self._clients: dict[WebSocket, str] = {}
        self.last_status: VoiceStatus | None = None
        self.last_speaking = VoiceSpeaking(type="speaking", value=False)

    def counts(self) -> dict:
        roles = list(self._clients.values())
        return {"service": roles.count("service"), "listener": roles.count("listener")}

    async def _broadcast(self, role: str, text: str) -> None:
        for client, client_role in list(self._clients.items()):
            if client_role != role:
                continue
            try:
                await client.send_text(text)
            except Exception:
                self._clients.pop(client, None)

    async def handle(self, ws: WebSocket) -> None:
        role = ws.query_params.get("role")
        host = ws.client.host if ws.client else ""
        if role not in {"service", "listener"}:
            await ws.close(code=1008)
            return
        if not host_is_lan(host, lan_networks()):
            logger.warning("Voz: conexión rechazada, fuera de la red local (%s).", host)
            await ws.close(code=1008)
            return
        if not origin_matches_host(ws.headers.get("origin"), ws.headers.get("host")):
            logger.warning("Voz: conexión rechazada, Origin distinto del servidor.")
            await ws.close(code=1008)
            return
        if len(self._clients) >= MAX_CLIENTS:
            await ws.close(code=1013)
            return

        await ws.accept()
        if role == "service":  # un solo servicio: el nuevo reemplaza al anterior
            for old, old_role in list(self._clients.items()):
                if old_role == "service":
                    self._clients.pop(old, None)
                    try:
                        await old.close(code=1000)
                    except Exception:
                        pass
        self._clients[ws] = role
        if role == "listener" and self.last_status is not None:
            await ws.send_text(self.last_status.model_dump_json())
        if role == "service" and self.last_speaking.value:
            await ws.send_text(self.last_speaking.model_dump_json())

        bad = 0
        try:
            while True:
                raw = await ws.receive_text()
                try:
                    message = parse_voice_message(raw, role)
                except VoiceMessageError as exc:
                    bad += 1
                    await ws.send_text('{"type":"error","detail":"%s"}' % str(exc).replace('"', "'")[:80])
                    if bad >= MAX_BAD_MESSAGES:
                        await ws.close(code=1008)
                        return
                    continue
                if role == "service":
                    if message.type == "status":
                        self.last_status = message
                    await self._broadcast("listener", message.model_dump_json())
                else:
                    self.last_speaking = message
                    await self._broadcast("service", message.model_dump_json())
        except WebSocketDisconnect:
            pass
        finally:
            was_registered = self._clients.pop(ws, None) is not None
            if role == "service" and was_registered:
                off = VoiceStatus(type="status", state="off", t=datetime.now(timezone.utc))
                self.last_status = off
                await self._broadcast("listener", off.model_dump_json())
