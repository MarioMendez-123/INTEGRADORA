"""Cola local acotada de eventos con reintento y backoff (entrega al menos una vez).

El agente mete aquí cada observación (o evento) ya con su event_id; un hilo las manda por lotes a la
laptop. Si la laptop no contesta, los eventos esperan en una cola de tamaño fijo: al llenarse se
descartan los MÁS VIEJOS (y se cuentan en dropped_total) para no crecer sin límite. El reintento
manda el mismo event_id, así que la laptop puede ignorar repetidos.

El transporte es una función inyectable send(url, payload_bytes, timeout) para probar sin red.
Solo biblioteca estándar.
"""

import json
import logging
import threading
import time
import urllib.error
import urllib.request
from collections import deque

logger = logging.getLogger(__name__)


def http_post_json(url: str, body: bytes, timeout: float) -> int:
    request = urllib.request.Request(url, data=body, method="POST", headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310 (URL de la configuración)
            response.read()
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code


class EventOutbox:
    """build_body(lote) -> dict serializable; se manda a url por POST.

    Una respuesta 2xx saca el lote de la cola. 4xx (salvo 408/429) significa que el lote es inválido: se
    descarta y se cuenta, porque reintentarlo para siempre bloquearía la cola. 5xx, 408, 429 o error de red
    se reintentan con backoff exponencial (de 1 s hasta 30 s).
    """

    def __init__(self, url: str | None, build_body, max_size: int = 1000, batch_size: int = 50,
                 timeout_s: float = 3.0, send=http_post_json, sleep=time.sleep, backoff_max_s: float = 30.0):
        self.url = url
        self._build_body = build_body
        self._queue: deque = deque()
        self._max = max_size
        self._batch = batch_size
        self._timeout = timeout_s
        self._send = send
        self._sleep = sleep
        self._backoff_max = backoff_max_s
        self._lock = threading.Lock()
        self._wake = threading.Event()
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self.sent_total = 0
        self.dropped_total = 0
        self.reachable: bool | None = None
        self.last_error: str | None = None
        self._failures = 0

    def __len__(self) -> int:
        with self._lock:
            return len(self._queue)

    def put(self, event) -> None:
        if not self.url:
            return
        with self._lock:
            if len(self._queue) >= self._max:
                self._queue.popleft()
                self.dropped_total += 1
            self._queue.append(event)
        self._wake.set()

    def start(self) -> None:
        if self.url and self._thread is None:
            self._stop.clear()
            self._thread = threading.Thread(target=self._run, name="outbox", daemon=True)
            self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        self._wake.set()
        if self._thread is not None:
            self._thread.join(timeout=5)
            self._thread = None

    def flush_once(self) -> bool:
        """Intenta mandar un lote. True si no hay nada pendiente o se entregó; False si falló."""
        with self._lock:
            batch = list(self._queue)[: self._batch]
        if not batch:
            return True
        body = json.dumps(self._build_body(batch)).encode("utf-8")
        try:
            status = self._send(self.url, body, self._timeout)
        except Exception as exc:
            self._fail(f"{type(exc).__name__}: {exc}")
            return False
        if 200 <= status < 300:
            self._remove(len(batch))
            self.sent_total += len(batch)
            self.reachable, self.last_error, self._failures = True, None, 0
            return True
        if 400 <= status < 500 and status not in (408, 429):
            self._remove(len(batch))
            self.dropped_total += len(batch)
            self.reachable = True
            self.last_error = f"la laptop rechazó el lote (HTTP {status}); se descartó"
            logger.error("Outbox: %s", self.last_error)
            return True
        self._fail(f"HTTP {status}")
        return False

    def _remove(self, n: int) -> None:
        with self._lock:
            for _ in range(min(n, len(self._queue))):
                self._queue.popleft()

    def _fail(self, reason: str) -> None:
        self._failures += 1
        self.reachable = False
        self.last_error = reason
        logger.warning("Outbox: no se pudo entregar (%s); reintento con espera.", reason)

    def _run(self) -> None:
        while not self._stop.is_set():
            if not len(self):
                self._wake.wait(timeout=1.0)
                self._wake.clear()
                continue
            if self.flush_once():
                continue
            delay = min(self._backoff_max, 2 ** min(self._failures - 1, 5))
            if self._stop.wait(delay):
                break
