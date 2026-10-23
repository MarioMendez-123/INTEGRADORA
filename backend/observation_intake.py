"""Recepción idempotente de observaciones y eventos de la celda (lado laptop).

Entrega al menos una vez desde el agente + descarte por event_id aquí = efecto de "una sola vez" mientras
la laptop no se reinicie. La memoria de event_id es acotada (los últimos max_seen); es un límite conocido
(contracts/agents_api.md, sección 3).
"""

import threading
from collections import OrderedDict


class SeenIds:
    def __init__(self, max_seen: int = 20000):
        self._max = max_seen
        self._ids: OrderedDict[str, None] = OrderedDict()
        self._lock = threading.Lock()

    def add_if_new(self, event_id: str) -> bool:
        with self._lock:
            if event_id in self._ids:
                self._ids.move_to_end(event_id)
                return False
            self._ids[event_id] = None
            if len(self._ids) > self._max:
                self._ids.popitem(last=False)
            return True


class ObservationIntake:
    """accept(lote) -> (aceptadas, duplicadas). Llama a notify(dict_legacy) por cada observación nueva."""

    def __init__(self, notify, max_seen: int = 20000):
        self._notify = notify
        self._seen = SeenIds(max_seen)

    def accept(self, batch) -> tuple[int, int]:
        accepted = duplicates = 0
        for observation in batch.observations:
            if not self._seen.add_if_new(observation.event_id):
                duplicates += 1
                continue
            self._notify(observation.legacy())
            accepted += 1
        return accepted, duplicates


class CellEventIntake:
    """Eventos de la celda de la Pi: se anotan (acotado) y se pueden leer. No accionan nada."""

    def __init__(self, keep: int = 200, max_seen: int = 20000):
        from collections import deque

        self._events = deque(maxlen=keep)
        self._seen = SeenIds(max_seen)
        self._lock = threading.Lock()

    def accept(self, batch) -> tuple[int, int]:
        accepted = duplicates = 0
        for event in batch.events:
            if not self._seen.add_if_new(event.event_id):
                duplicates += 1
                continue
            with self._lock:
                self._events.append({"source": batch.source, **event.model_dump(mode="json")})
            accepted += 1
        return accepted, duplicates

    def recent(self, limit: int = 20) -> list[dict]:
        with self._lock:
            return list(self._events)[-limit:][::-1]
