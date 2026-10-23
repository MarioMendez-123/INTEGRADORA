"""El agente de la Pi solo trae la celda: importarlo no debe cargar el resto del backend."""

import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2] / "backend"


def test_agente_no_arrastra_lumina_base_de_datos_ni_torch():
    codigo = (
        "import sys; sys.path.insert(0, sys.argv[1]); import celda_agent;"
        "malos = [m for m in ('main', 'lumina_desktop', 'sqlalchemy', 'torch', 'ultralytics') if m in sys.modules];"
        "assert not malos, malos"
    )
    r = subprocess.run([sys.executable, "-I", "-c", codigo, str(BACKEND)], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr


def test_agente_sirve_las_rutas_de_la_celda_y_la_pagina():
    sys.path.insert(0, str(BACKEND))
    from fastapi.testclient import TestClient

    import celda_agent

    cliente = TestClient(celda_agent.app)  # sin `with`: no abre la cámara
    estado = cliente.get("/line/cell/status")
    assert estado.status_code == 200 and estado.json()["source"] == "celda"
    assert cliente.get("/health").json()["status"] == "ok"
    assert "celda" in cliente.get("/celda.html").text.lower()


# ---------------------------------------------------------------- mismo patrón que el agente del Jetson (R5)


def test_analisis_periodico_analiza_cada_n_segundos_y_dibuja_siempre():
    sys.path.insert(0, str(BACKEND))
    import numpy as np

    from celda_agent import AnalisisPeriodico

    t = [0.0]
    analizados, dibujados = [], []
    p = AnalisisPeriodico(
        lambda frame: analizados.append(1) or "resultado", lambda frame, r: dibujados.append(r), 0.5, reloj=lambda: t[0]
    )
    frame = np.zeros((4, 4, 3), dtype=np.uint8)
    for _ in range(20):  # 20 cuadros en 1 s (50 ms entre cada uno)
        p(frame)
        t[0] += 0.05
    assert len(analizados) == 2  # uno cada 0.5 s, no uno por cuadro
    assert len(dibujados) == 20  # pero el video lleva el último resultado en todos
    assert p.stats()["ms_last"] is not None


def test_evento_de_pieza_cumple_el_contrato_y_es_estable():
    sys.path.insert(0, str(BACKEND))
    from agent_contracts import CellEvent, CellEventBatch
    from celda_agent import evento_de_pieza

    registro = {"pieza": 12, "resultado": "FAIL", "accion": "scrap_expulsado", "timestamp": "2026-10-23T15:00:00+00:00"}
    evento = evento_de_pieza(registro)
    assert evento == evento_de_pieza(registro)  # el reintento lleva el mismo event_id
    CellEvent.model_validate(evento)
    CellEventBatch.model_validate({"v": 1, "source": "pi", "events": [evento]})
    assert evento_de_pieza({**registro, "pieza": 13})["event_id"] != evento["event_id"]


def test_status_y_stream_siguen_el_contrato_sin_abrir_la_camara():
    sys.path.insert(0, str(BACKEND))
    from fastapi.testclient import TestClient

    import celda_agent
    from agent_contracts import AgentStatus

    cliente = TestClient(celda_agent.app)  # sin `with`: no abre la cámara ni arranca hilos
    estado = cliente.get("/status").json()
    AgentStatus.model_validate(estado)
    assert estado["role"] == "cell" and estado["agent_id"] == "pi" and estado["camera"]["open"] is False
    assert estado["laptop"]["url"] is None  # sin AETHER_LAPTOP_URL no se manda nada
    assert set(cliente.get("/openapi.json").json()["paths"]) >= {"/stream", "/line/vision/stream", "/status", "/health"}


def test_la_celda_solo_acepta_la_red_local(monkeypatch):
    sys.path.insert(0, str(BACKEND))
    from fastapi.testclient import TestClient

    import celda_agent

    cliente = TestClient(celda_agent.app)
    monkeypatch.setattr(celda_agent, "host_is_lan", lambda *a, **k: False)
    assert cliente.get("/line/cell/status").status_code == 403
    assert cliente.get("/health").status_code == 403


def test_eventos_de_la_celda_llegan_a_la_laptop_una_sola_vez():
    """La celda anota una pieza -> el agente la encola -> la laptop real (router) la acepta e ignora el reintento."""
    sys.path.insert(0, str(BACKEND))
    import json

    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    import celda_agent
    from agent_routes import create_router
    from observation_outbox import EventOutbox

    router, _ = create_router(lambda o: None)
    laptop = FastAPI()
    laptop.include_router(router)
    cliente = TestClient(laptop)
    entregas = []

    def enviar(url, cuerpo, timeout):
        entregas.append(cuerpo)
        return cliente.post("/line/cell/events", content=cuerpo).status_code

    salida = EventOutbox(url="http://laptop/line/cell/events", build_body=lambda lote: {"v": 1, "source": "pi", "events": lote}, send=enviar)
    registro = {"pieza": 5, "resultado": "PASS", "accion": "pieza_aceptada", "timestamp": "2026-10-23T15:00:00+00:00"}
    salida.put(celda_agent.evento_de_pieza(registro))
    assert salida.flush_once() is True
    salida.put(celda_agent.evento_de_pieza(registro))  # reintento del mismo evento
    assert salida.flush_once() is True
    recientes = cliente.get("/line/cell/events/recent").json()
    assert len(recientes) == 1 and recientes[0]["pieza"] == 5 and recientes[0]["juicio"] == "PASS"
    assert json.loads(entregas[0])["source"] == "pi"
