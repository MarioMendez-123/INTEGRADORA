"""Cola de observaciones: entrega al menos una vez, reintento con backoff, cola acotada."""

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from observation_outbox import EventOutbox  # noqa: E402


def esperar(condicion, timeout=5.0):
    limite = time.monotonic() + timeout
    while time.monotonic() < limite:
        if condicion():
            return True
        time.sleep(0.01)
    return False


class Laptop:
    """Doble de la laptop: contesta lo que se le pida y recuerda lo que recibió."""

    def __init__(self, respuestas):
        self.respuestas = list(respuestas)
        self.recibido = []

    def __call__(self, url, body, timeout):
        self.recibido.append(json.loads(body))
        r = self.respuestas.pop(0) if self.respuestas else 200
        if isinstance(r, Exception):
            raise r
        return r


def outbox(laptop, **kw):
    return EventOutbox(
        url="http://laptop/x", build_body=lambda lote: {"events": lote}, send=laptop, backoff_max_s=0.05, **kw
    )


def ev(n):
    return {"event_id": f"evento{n:04d}"}


def test_entrega_en_lotes_y_vacia_la_cola():
    laptop = Laptop([])
    o = outbox(laptop, batch_size=2)
    for n in range(5):
        o.put(ev(n))
    while len(o):
        assert o.flush_once() is True
    assert [len(c["events"]) for c in laptop.recibido] == [2, 2, 1]
    assert o.sent_total == 5 and o.reachable is True and o.last_error is None


def test_reintenta_con_el_mismo_event_id_hasta_que_la_laptop_contesta():
    laptop = Laptop([ConnectionError("sin ruta"), 503, 200])
    o = outbox(laptop)
    o.put(ev(1))
    o.start()
    try:
        assert esperar(lambda: o.sent_total == 1)
    finally:
        o.stop()
    ids = [c["events"][0]["event_id"] for c in laptop.recibido]
    assert ids == ["evento0001"] * 3  # el reintento lleva el mismo id: la laptop puede ignorar repetidos
    assert o.reachable is True and len(o) == 0


def test_error_de_red_deja_la_razon_visible():
    o = outbox(Laptop([ConnectionError("sin ruta")]))
    o.put(ev(1))
    assert o.flush_once() is False
    assert o.reachable is False and "ConnectionError" in o.last_error and len(o) == 1


def test_cola_acotada_descarta_lo_mas_viejo_y_conserva_los_ultimos():
    laptop = Laptop([])
    o = outbox(laptop, max_size=3, batch_size=10)
    for n in range(5):
        o.put(ev(n))
    assert len(o) == 3 and o.dropped_total == 2
    o.flush_once()
    assert [e["event_id"] for e in laptop.recibido[0]["events"]] == ["evento0002", "evento0003", "evento0004"]


def test_lote_rechazado_con_4xx_se_descarta_para_no_bloquear_la_cola():
    laptop = Laptop([422, 200])
    o = outbox(laptop, batch_size=1)
    o.put(ev(1))
    o.put(ev(2))
    assert o.flush_once() is True  # el primero se descarta
    assert o.dropped_total == 1 and "422" in o.last_error
    assert o.flush_once() is True
    assert o.sent_total == 1


def test_408_429_y_5xx_se_reintentan():
    for codigo in (408, 429, 500):
        o = outbox(Laptop([codigo]))
        o.put(ev(1))
        assert o.flush_once() is False and len(o) == 1


def test_sin_url_no_guarda_nada():
    o = EventOutbox(url=None, build_body=lambda b: b)
    o.put(ev(1))
    assert len(o) == 0
    o.start()  # no arranca hilo y no falla
    o.stop()


def test_la_laptop_se_cae_y_vuelve_sin_perder_lo_encolado():
    laptop = Laptop([ConnectionError("x")] * 4)
    o = outbox(laptop, batch_size=10)
    for n in range(4):
        o.put(ev(n))
    o.start()
    try:
        assert esperar(lambda: o.sent_total == 4, timeout=8)
    finally:
        o.stop()
    assert o.dropped_total == 0


def test_el_intervalo_junta_las_observaciones_en_pocos_posts():
    """Detecciones continuas (una cada ~20 ms): sin intervalo salía casi un POST por observación; con intervalo se juntan."""
    def correr(intervalo):
        laptop = Laptop([])
        o = EventOutbox(url="http://laptop/x", build_body=lambda lote: {"events": lote}, send=laptop,
                        batch_size=50, flush_interval_s=intervalo)
        o.start()
        try:
            for n in range(30):
                o.put(ev(n))
                time.sleep(0.02)
            assert esperar(lambda: o.sent_total == 30, timeout=6)
        finally:
            o.stop()
        return len(laptop.recibido)

    sin_intervalo, con_intervalo = correr(0.0), correr(0.3)
    assert con_intervalo <= 4, con_intervalo       # ~0.6 s de detecciones en 2 o 3 lotes
    assert sin_intervalo >= 3 * con_intervalo, (sin_intervalo, con_intervalo)  # y antes eran muchos más


def test_un_lote_lleno_sale_sin_esperar_el_intervalo():
    laptop = Laptop([])
    o = EventOutbox(url="http://laptop/x", build_body=lambda lote: {"events": lote}, send=laptop, batch_size=5, flush_interval_s=5.0)
    for n in range(5):
        o.put(ev(n))
    o.start()
    try:
        assert esperar(lambda: o.sent_total == 5, timeout=2)  # no espera los 5 s
    finally:
        o.stop()
