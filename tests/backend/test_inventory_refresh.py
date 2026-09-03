"""Pruebas reales de InventoryRefreshLoop (backend/inventory_refresh.py) —
el ciclo de vida del auto-refresh de Declared Inventory (Decisión 9, ADR
0009).

No dependen de cámara ni base de datos reales: begin_capture, end_capture,
drain_observations y run_pipeline_step son dobles de prueba inyectados,
mismo patrón que tests/backend/test_camera_publisher.py. Importa
inventory_refresh directamente, nunca main, por la misma razón documentada
ahí: main.py conecta a la base de datos real al importarse.
"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from inventory_refresh import InventoryRefreshLoop

INTERVAL = 0.03  # segundos — corto a propósito para que las pruebas no esperen de más


def _wait_until(predicate, timeout=2.0):
    """Sondea predicate() hasta que sea verdadero o se agote timeout —
    evita sleeps fijos que podrían ser insuficientes (o innecesariamente
    largos) según qué tan cargada esté la máquina de pruebas."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return True
        time.sleep(0.01)
    return False


class FakeCaptureControl:
    """Doble de prueba para begin_capture/end_capture — solo cuenta cuántas
    veces se llamó cada uno, sin tocar cámara ni publicador reales."""

    def __init__(self):
        self.begin_calls = 0
        self.end_calls = 0

    def begin(self):
        self.begin_calls += 1

    def end(self):
        self.end_calls += 1


def _make_loop(drain_observations, run_pipeline_step, capture=None):
    capture = capture or FakeCaptureControl()
    loop = InventoryRefreshLoop(
        begin_capture=capture.begin,
        end_capture=capture.end,
        drain_observations=drain_observations,
        run_pipeline_step=run_pipeline_step,
    )
    return loop, capture


def test_start_activa_captura_y_status_refleja_activo():
    loop, capture = _make_loop(drain_observations=list, run_pipeline_step=lambda obs: None)
    try:
        loop.start(INTERVAL)
        assert capture.begin_calls == 1
        assert loop.status.active is True
        assert loop.status.interval_seconds == INTERVAL
    finally:
        loop.stop()


def test_segundo_start_no_reinicia_la_captura():
    loop, capture = _make_loop(drain_observations=list, run_pipeline_step=lambda obs: None)
    try:
        loop.start(INTERVAL)
        loop.start(INTERVAL)  # ya activo — no debe volver a "abrir la cámara"
        assert capture.begin_calls == 1
    finally:
        loop.stop()


def test_stop_libera_captura_y_status_refleja_inactivo():
    loop, capture = _make_loop(drain_observations=list, run_pipeline_step=lambda obs: None)
    loop.start(INTERVAL)
    loop.stop()
    assert capture.end_calls == 1
    assert loop.status.active is False


def test_ciclo_vacio_no_llama_al_paso_de_pipeline():
    pipeline_calls = []
    loop, _ = _make_loop(
        drain_observations=list,
        run_pipeline_step=lambda obs: pipeline_calls.append(obs),
    )
    try:
        loop.start(INTERVAL)
        assert _wait_until(lambda: loop.status.last_run_at is not None)
        assert pipeline_calls == []
        assert loop.status.last_run_observation_count == 0
    finally:
        loop.stop()


def test_ciclo_con_observaciones_llama_al_pipeline_con_el_lote():
    batch = [{"detected_class": "bottle"}, {"detected_class": "box"}]
    pipeline_calls = []
    # Solo se drena un lote real una vez; los siguientes ciclos ven [] para
    # no reprocesar el mismo lote una y otra vez mientras la prueba espera.
    remaining = [batch]

    def drain():
        return remaining.pop(0) if remaining else []

    loop, _ = _make_loop(
        drain_observations=drain,
        run_pipeline_step=lambda obs: pipeline_calls.append(obs),
    )
    try:
        loop.start(INTERVAL)
        assert _wait_until(lambda: pipeline_calls != [])
        assert pipeline_calls[0] == batch
        assert loop.status.last_run_observation_count == len(batch)
        assert loop.status.last_error is None
    finally:
        loop.stop()


def test_error_en_pipeline_queda_en_status_y_el_loop_sigue_vivo():
    attempts = []

    def run_pipeline_step(obs):
        attempts.append(obs)
        raise RuntimeError("aggregate_observations.py falló (simulado)")

    loop, _ = _make_loop(drain_observations=lambda: [{"x": 1}], run_pipeline_step=run_pipeline_step)
    try:
        loop.start(INTERVAL)
        assert _wait_until(lambda: loop.status.last_error is not None)
        assert "simulado" in loop.status.last_error
        assert loop.status.active is True  # un ciclo fallido no debe tumbar el loop completo

        # Confirma que sigue vivo de verdad: debe seguir intentando en los
        # siguientes ciclos, no quedarse atorado tras el primer error.
        attempts_before = len(attempts)
        assert _wait_until(lambda: len(attempts) > attempts_before)
    finally:
        loop.stop()
