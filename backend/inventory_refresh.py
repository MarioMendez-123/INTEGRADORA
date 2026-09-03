"""Loop de auto-refresh de Declared Inventory (Decisión 9, ADR 0009).

Repite cada N segundos el equivalente automático de la tubería manual que ya
existía (captura → agregación → carga), sin fabricar infraestructura de
comunicación nueva: solo un temporizador del lado del servidor. Sigue siendo
una versión reducida y parcial de la Opción C de la Decisión 7 (monitoreo en
vivo) — automatiza únicamente el refresco del inventario ya calculado, no
telemetría del robot.

Genérico y sin acoplarse directamente a CameraPublisher, YOLO ni a rutas de
archivo concretas — recibe como dependencias inyectadas cómo empezar/parar
la captura, cómo drenar las observaciones acumuladas y cómo correr el paso
de agregación+carga, para poder probarse sin cámara ni base de datos reales
(mismo motivo que camera_publisher.py vive separado de main.py).
"""

import logging
import threading
from dataclasses import dataclass
from datetime import UTC, datetime

logger = logging.getLogger(__name__)


@dataclass
class RefreshStatus:
    """Snapshot de estado para GET /inventory/auto-refresh/status — lo que
    el dashboard necesita para etiquetar honestamente el control (ver ADR
    0009: nunca "inventario en tiempo real del piso", solo "captura
    continua de esta cámara")."""

    active: bool
    interval_seconds: float
    last_run_at: str | None
    last_run_observation_count: int | None
    last_error: str | None


class InventoryRefreshLoop:
    """start()/stop() encienden y apagan un hilo en segundo plano que cada
    interval_seconds drena las observaciones acumuladas
    (drain_observations) y, si hay alguna, corre el paso de
    agregación+carga (run_pipeline_step) con ellas.

    begin_capture()/end_capture() se llaman una sola vez, al arrancar y al
    parar el loop completo — no en cada ciclo: mantienen la cámara
    compartida abierta de forma continua mientras el loop esté activo, en
    vez de abrir y cerrar el dispositivo cada N segundos.
    """

    def __init__(self, begin_capture, end_capture, drain_observations, run_pipeline_step):
        self._begin_capture = begin_capture
        self._end_capture = end_capture
        self._drain_observations = drain_observations
        self._run_pipeline_step = run_pipeline_step

        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._interval_seconds = 0.0
        self._last_run_at: str | None = None
        self._last_run_observation_count: int | None = None
        self._last_error: str | None = None

    @property
    def status(self) -> RefreshStatus:
        with self._lock:
            return RefreshStatus(
                active=self._thread is not None,
                interval_seconds=self._interval_seconds,
                last_run_at=self._last_run_at,
                last_run_observation_count=self._last_run_observation_count,
                last_error=self._last_error,
            )

    def start(self, interval_seconds: float) -> None:
        with self._lock:
            if self._thread is not None:
                return  # ya activo — un segundo start() no reinicia el intervalo a media marcha
            self._interval_seconds = interval_seconds
            self._last_error = None
            self._stop_event.clear()
            self._begin_capture()
            self._thread = threading.Thread(
                target=self._run,
                name="inventory-refresh-loop",
                daemon=True,
            )
            self._thread.start()
        logger.info("Auto-refresh de inventario iniciado (cada %.0fs).", interval_seconds)

    def stop(self) -> None:
        # Mismo cuidado que CameraPublisher.unsubscribe(): el lock se
        # suelta ANTES de esperar el hilo (join), y nunca se intenta unir
        # un hilo a sí mismo.
        thread_to_join = None
        with self._lock:
            if self._thread is None:
                return
            self._stop_event.set()
            thread_to_join = self._thread
            self._thread = None

        if thread_to_join is not threading.current_thread():
            thread_to_join.join(timeout=5)

        self._end_capture()
        logger.info("Auto-refresh de inventario detenido.")

    def _run(self) -> None:
        # wait(timeout=...) devuelve True si stop() ya puso la bandera —
        # así el hilo despierta de inmediato al detenerlo, en vez de
        # esperar hasta el final del intervalo en curso.
        while not self._stop_event.wait(timeout=self._interval_seconds):
            self._run_cycle()

    def _run_cycle(self) -> None:
        observations = self._drain_observations()
        if not observations:
            logger.info("Auto-refresh: sin detecciones nuevas en esta ventana, se omite el ciclo.")
            with self._lock:
                self._last_run_at = datetime.now(UTC).isoformat()
                self._last_run_observation_count = 0
            return

        try:
            self._run_pipeline_step(observations)
        except Exception as exc:  # se registra y se reintenta en el próximo ciclo
            logger.exception("Auto-refresh: falló un ciclo de agregación/carga.")
            with self._lock:
                self._last_error = str(exc)
            return

        with self._lock:
            self._last_run_at = datetime.now(UTC).isoformat()
            self._last_run_observation_count = len(observations)
            self._last_error = None
        logger.info("Auto-refresh: %d observaciones procesadas.", len(observations))
