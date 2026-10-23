"""Rutas de la laptop para agentes y voz (agent_routes.py, voice_hub.py), red local y configuración.

Se monta solo el router en una app mínima: no se importa main.py (conecta a la base real).
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

import agent_config  # noqa: E402
import agent_routes  # noqa: E402
import public_guard  # noqa: E402
from agent_routes import create_router  # noqa: E402
from lan_guard import host_is_lan, origin_matches_host  # noqa: E402


def obs(n, **cambios):
    base = dict(
        v=1,
        event_id=f"evento{n:06d}",
        timestamp="2026-10-23T15:00:01+00:00",
        source="jetson",
        detected_class="bottle",
        code_data=None,
        code_read=False,
        confidence=0.9,
        location_marker_id=None,
    )
    base.update(cambios)
    return base


def lote(*observaciones, source="jetson"):
    return {"v": 1, "source": source, "observations": list(observaciones)}


@pytest.fixture()
def cliente():
    recibidas = []
    router, servicios = create_router(recibidas.append)
    app = FastAPI()
    app.include_router(router)
    c = TestClient(app)
    c.recibidas = recibidas
    c.servicios = servicios
    return c


# ------------------------------------------------------------------ observaciones


def test_observaciones_validas_llegan_con_las_claves_de_siempre(cliente):
    r = cliente.post("/perception/observations", json=lote(obs(1), obs(2, code_data="QR-1", code_read=True)))
    assert r.status_code == 200 and r.json() == {"accepted": 2, "duplicates": 0}
    assert set(cliente.recibidas[0]) == {
        "timestamp", "detected_class", "code_data", "code_read", "confidence", "location_marker_id"
    }
    assert cliente.recibidas[1]["code_data"] == "QR-1"


def test_el_reintento_no_duplica(cliente):
    cliente.post("/perception/observations", json=lote(obs(1), obs(2)))
    r = cliente.post("/perception/observations", json=lote(obs(2), obs(3)))
    assert r.json() == {"accepted": 1, "duplicates": 1}
    assert len(cliente.recibidas) == 3


def test_lote_invalido_da_422_sin_eco_del_contenido(cliente):
    r = cliente.post("/perception/observations", json=lote(obs(1, confidence=7)))
    assert r.status_code == 422 and "7" not in r.text
    assert cliente.recibidas == []
    assert cliente.post("/perception/observations", content=b"no json").status_code == 422
    assert cliente.post("/perception/observations", json={"v": 1, "source": "jetson", "observations": []}).status_code == 422


def test_cuerpo_demasiado_grande_da_413(cliente):
    grande = json.dumps(lote(obs(1, code_data="x" * 200))) + " " * (70 * 1024)
    assert cliente.post("/perception/observations", content=grande.encode()).status_code == 413
    assert cliente.recibidas == []


def test_fuera_de_la_red_local_da_403(cliente, monkeypatch):
    monkeypatch.setattr(agent_routes, "request_is_lan", lambda *a, **k: False)
    assert cliente.post("/perception/observations", json=lote(obs(1))).status_code == 403
    assert cliente.get("/config/agents").status_code == 403
    assert cliente.recibidas == []


# ------------------------------------------------------------------ celda


def test_eventos_de_celda_se_anotan_una_sola_vez(cliente):
    evento = dict(v=1, event_id="pieza0000001", timestamp="2026-10-23T15:00:00+00:00", pieza=12, juicio="FAIL", accion="expulsada")
    cuerpo = {"v": 1, "source": "pi", "events": [evento]}
    assert cliente.post("/line/cell/events", json=cuerpo).json() == {"accepted": 1, "duplicates": 0}
    assert cliente.post("/line/cell/events", json=cuerpo).json() == {"accepted": 0, "duplicates": 1}
    recientes = cliente.get("/line/cell/events/recent").json()
    assert len(recientes) == 1 and recientes[0]["pieza"] == 12 and recientes[0]["source"] == "pi"
    malo = {"v": 1, "source": "pi", "events": [{**evento, "juicio": "QUIZA"}]}
    assert cliente.post("/line/cell/events", json=malo).status_code == 422


# ------------------------------------------------------------------ configuración y CSP


def test_config_sin_agentes_deja_todo_en_null(cliente, monkeypatch):
    monkeypatch.delenv("AETHER_PERCEPTION_AGENT_URL", raising=False)
    monkeypatch.delenv("AETHER_LINE_AGENT_URL", raising=False)
    assert cliente.get("/config/agents").json() == {
        "v": 1, "perception": {"stream_url": None}, "line_vision": {"stream_url": None}
    }


def test_config_con_agente_da_la_url_real_a_otros_equipos(cliente, monkeypatch):
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "http://10.4.5.103:8001")
    assert cliente.get("/config/agents").json()["perception"]["stream_url"] == "http://10.4.5.103:8001/stream"


def test_stream_url_del_mismo_equipo_sale_por_loopback():
    assert agent_config.stream_url_for("http://10.4.5.103:8001", "10.4.5.103") == "http://127.0.0.1:8001/stream"
    assert agent_config.stream_url_for("http://10.4.5.103:8001", "10.4.5.52") == "http://10.4.5.103:8001/stream"
    assert agent_config.stream_url_for("", "10.4.5.52") is None


def test_csp_se_amplia_solo_en_img_y_solo_con_agentes(monkeypatch):
    monkeypatch.delenv("AETHER_PERCEPTION_AGENT_URL", raising=False)
    monkeypatch.delenv("AETHER_LINE_AGENT_URL", raising=False)
    assert public_guard.csp_value() == public_guard.CSP
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "http://10.4.5.103:8001")
    csp = public_guard.csp_value()
    assert "img-src 'self' data: blob: http://10.4.5.103:8001 http://127.0.0.1:8001 http://localhost:8001;" in csp
    assert csp.replace(" http://10.4.5.103:8001 http://127.0.0.1:8001 http://localhost:8001", "") == public_guard.CSP
    assert "connect-src 'self' https://fonts" in csp  # connect-src NO se toca


def test_csp_con_url_invalida_no_tumba_las_respuestas(monkeypatch):
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "esto no es una url")
    assert public_guard.csp_value() == public_guard.CSP


def test_voz_y_config_estan_cerradas_al_dominio_publico():
    assert public_guard._blocked("GET", "/voice/ws") and public_guard._blocked("GET", "/config/agents")


# ------------------------------------------------------------------ red local


def test_host_is_lan():
    assert host_is_lan("10.4.5.103") and host_is_lan("192.168.55.100") and host_is_lan("127.0.0.1")
    assert host_is_lan("::1") and host_is_lan("testclient") and host_is_lan("::ffff:10.4.5.1")
    assert not host_is_lan("8.8.8.8") and not host_is_lan("2001:4860:4860::8888") and not host_is_lan("")
    assert not host_is_lan("evil.example.com")


def test_red_local_configurable(monkeypatch):
    monkeypatch.setenv("AETHER_LAN_CIDRS", "10.4.5.0/24")
    assert host_is_lan("10.4.5.7") and not host_is_lan("10.4.6.7") and not host_is_lan("192.168.1.5")


def test_origin_debe_coincidir_con_el_host():
    assert origin_matches_host(None, "10.4.5.52:8000")
    assert origin_matches_host("http://10.4.5.52:8000", "10.4.5.52:8000")
    assert not origin_matches_host("http://evil.example", "10.4.5.52:8000")


# ------------------------------------------------------------------ canal de voz


def transcript(texto="hola lumina"):
    return json.dumps({"v": 1, "type": "transcript", "text": texto, "t": datetime.now(timezone.utc).isoformat()})


def status(estado):
    return json.dumps({"v": 1, "type": "status", "state": estado, "t": datetime.now(timezone.utc).isoformat()})


def speaking(valor):
    return json.dumps({"v": 1, "type": "speaking", "value": valor})


def test_voz_el_texto_del_servicio_llega_a_las_paginas(cliente):
    with cliente.websocket_connect("/voice/ws?role=listener") as pagina, cliente.websocket_connect("/voice/ws?role=service") as servicio:
        servicio.send_text(transcript("abre el inventario"))
        assert json.loads(pagina.receive_text())["text"] == "abre el inventario"


def test_voz_anti_eco_la_pagina_avisa_al_servicio(cliente):
    with cliente.websocket_connect("/voice/ws?role=listener") as pagina, cliente.websocket_connect("/voice/ws?role=service") as servicio:
        pagina.send_text(speaking(True))
        assert json.loads(servicio.receive_text()) == {"v": 1, "type": "speaking", "value": True}
        pagina.send_text(speaking(False))
        assert json.loads(servicio.receive_text())["value"] is False


def test_voz_quien_llega_despues_recibe_el_ultimo_estado(cliente):
    with cliente.websocket_connect("/voice/ws?role=service") as servicio:
        servicio.send_text(status("active"))
        with cliente.websocket_connect("/voice/ws?role=listener") as pagina:
            assert json.loads(pagina.receive_text())["state"] == "active"
    # al caerse el servicio, las páginas lo saben
    with cliente.websocket_connect("/voice/ws?role=listener") as pagina:
        assert json.loads(pagina.receive_text())["state"] == "off"


def test_voz_servicio_nuevo_reemplaza_al_anterior(cliente):
    with cliente.websocket_connect("/voice/ws?role=service") as viejo:
        with cliente.websocket_connect("/voice/ws?role=service"):
            with pytest.raises(WebSocketDisconnect):
                viejo.receive_text()
    assert cliente.servicios["hub"].counts()["service"] == 0


def test_voz_mensajes_invalidos_dan_error_y_al_quinto_se_cierra(cliente):
    with cliente.websocket_connect("/voice/ws?role=listener") as pagina:
        pagina.send_text(transcript())  # una página no puede mandar texto
        assert json.loads(pagina.receive_text())["type"] == "error"
        for _ in range(4):
            pagina.send_text("basura")
            if _ < 3:
                assert json.loads(pagina.receive_text())["type"] == "error"
        with pytest.raises(WebSocketDisconnect):
            for _ in range(3):
                pagina.receive_text()


def test_voz_rol_desconocido_y_origin_ajeno_se_rechazan(cliente):
    with pytest.raises(WebSocketDisconnect):
        with cliente.websocket_connect("/voice/ws?role=admin"):
            pass
    with pytest.raises(WebSocketDisconnect):
        with cliente.websocket_connect("/voice/ws?role=listener", headers={"origin": "http://evil.example"}):
            pass


def test_voz_fuera_de_la_red_local_se_rechaza(cliente, monkeypatch):
    import voice_hub

    monkeypatch.setattr(voice_hub, "host_is_lan", lambda *a, **k: False)
    with pytest.raises(WebSocketDisconnect):
        with cliente.websocket_connect("/voice/ws?role=listener"):
            pass


def test_voz_tope_de_conexiones(cliente):
    import contextlib

    with contextlib.ExitStack() as pila:
        for _ in range(8):
            pila.enter_context(cliente.websocket_connect("/voice/ws?role=listener"))
        with pytest.raises(WebSocketDisconnect):
            with cliente.websocket_connect("/voice/ws?role=listener"):
                pass


# ------------------------------------------------------------------ el agente escrito como NOMBRE (mario-desktop.local)


def test_agente_como_nombre_en_la_config_y_en_la_csp(cliente, monkeypatch):
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "http://mario-desktop.local:8001")
    monkeypatch.setattr(agent_config, "_resolve", lambda host: frozenset({"10.4.5.103"}))
    assert cliente.get("/config/agents").json()["perception"]["stream_url"] == "http://mario-desktop.local:8001/stream"
    csp = public_guard.csp_value()
    assert "http://mario-desktop.local:8001" in csp and "http://127.0.0.1:8001" in csp


def test_nombre_que_apunta_a_este_mismo_equipo_sale_por_loopback(monkeypatch):
    monkeypatch.setattr(agent_config, "_resolve", lambda host: frozenset({"10.4.5.103", "fe80::1"}))
    base = "http://mario-desktop.local:8001"
    assert agent_config.stream_url_for(base, "10.4.5.103") == "http://127.0.0.1:8001/stream"
    assert agent_config.stream_url_for(base, "10.4.5.52") == "http://mario-desktop.local:8001/stream"
    monkeypatch.setattr(agent_config, "_resolve", lambda host: frozenset())  # el nombre no resuelve
    assert agent_config.stream_url_for(base, "10.4.5.103") == "http://mario-desktop.local:8001/stream"


def test_resolucion_de_nombres_se_recuerda_tambien_cuando_falla(monkeypatch):
    llamadas = []

    def getaddrinfo(host, port, **kw):
        llamadas.append(host)
        raise OSError("no resuelve")

    agent_config._RESOLVED.clear()
    monkeypatch.setattr(agent_config.socket, "getaddrinfo", getaddrinfo)
    for _ in range(3):
        assert agent_config._resolve("no-existe.local") == frozenset()
    assert llamadas == ["no-existe.local"]  # una sola espera de red, no una por petición
    agent_config._RESOLVED.clear()
