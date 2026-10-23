"""Enlace del servicio de voz con el servidor (WebSocket /voice/ws?role=service).

Un solo hilo manda lo pendiente y escucha {speaking}. Si se cae, reconecta con espera creciente (1 s a 15 s).
Los mensajes que esperaron demasiado (más de max_age_s) se tiran: un texto de hace un minuto ya no sirve.
"""

import json
import logging
import threading
import time
from collections import deque

logger = logging.getLogger(__name__)


class _Conexion:
    """websockets reciente exige usar connect() como administrador de contexto; versiones anteriores también
    lo aceptan. Se entra y se sale a mano para poder cerrar desde el hilo del enlace."""

    def __init__(self, manager):
        self._manager = manager
        self._ws = manager.__enter__()

    def send(self, raw) -> None:
        self._ws.send(raw)

    def recv(self, timeout=None):
        return self._ws.recv(timeout=timeout)

    def close(self) -> None:
        self._manager.__exit__(None, None, None)


def default_connect(url: str):
    from websockets.sync.client import connect

    return _Conexion(connect(url, open_timeout=3, max_size=4096))


class HubLink:
    def __init__(self, url: str, on_speaking=lambda value: None, on_connect=lambda: None, connect=default_connect,
                 max_age_s: float = 10.0, clock=time.monotonic):
        self._url = url
        self.on_speaking = on_speaking  # se pueden reasignar después de construir (el servicio lo hace)
        self.on_connect = on_connect
        self._connect = connect
        self._max_age = max_age_s
        self._clock = clock
        self._pending: deque = deque(maxlen=20)
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self.connected = False
        self.last_error: str | None = None
        self.sent_total = 0
        self.dropped_total = 0

    def start(self) -> None:
        if self._thread is None:
            self._thread = threading.Thread(target=self._run, name="voice-link", daemon=True)
            self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout=3)
            self._thread = None

    def send(self, message: dict) -> None:
        with self._lock:
            if len(self._pending) == self._pending.maxlen:
                self.dropped_total += 1
            self._pending.append((self._clock(), json.dumps(message, ensure_ascii=False)))

    def _drain(self, ws) -> None:
        while True:
            with self._lock:
                if not self._pending:
                    return
                queued_at, raw = self._pending.popleft()
            if self._clock() - queued_at > self._max_age:
                self.dropped_total += 1
                continue
            ws.send(raw)
            self.sent_total += 1

    def _run(self) -> None:
        failures = 0
        while not self._stop.is_set():
            try:
                ws = self._connect(self._url)
            except Exception as exc:
                failures += 1
                self.connected = False
                self.last_error = f"{type(exc).__name__}: {exc}"
                if self._stop.wait(min(15.0, 2 ** min(failures - 1, 4))):
                    return
                continue
            failures = 0
            self.connected, self.last_error = True, None
            logger.info("Enlace de voz conectado con el servidor.")
            try:
                self.on_connect()
                while not self._stop.is_set():
                    self._drain(ws)
                    try:
                        raw = ws.recv(timeout=0.2)
                    except TimeoutError:
                        continue
                    self._handle(raw)
            except Exception as exc:
                self.last_error = f"{type(exc).__name__}: {exc}"
                logger.warning("Enlace de voz caído (%s); reconecto.", self.last_error)
            finally:
                self.connected = False
                try:
                    ws.close()
                except Exception:
                    pass

    def _handle(self, raw) -> None:
        try:
            data = json.loads(raw)
        except (TypeError, ValueError):
            return
        if isinstance(data, dict) and data.get("v") == 1 and data.get("type") == "speaking" and isinstance(data.get("value"), bool):
            self.on_speaking(data["value"])
