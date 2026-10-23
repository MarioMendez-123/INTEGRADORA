"""Pruebas reales de backend/main.py — la API FastAPI de Declared Inventory.

Usan una base de datos SQLite EN MEMORIA, nunca backend/aether.db real. El
truco: backend/main.py no usa `Depends()` para la sesión de SQLAlchemy —
llama a `SessionLocal()` directo dentro de cada ruta (ver el propio
main.py) — así que no hay una dependencia de FastAPI que sobreescribir con
`app.dependency_overrides`. En su lugar, se parchea `db.database.engine` /
`db.database.SessionLocal` ANTES de importar `main`: como main.py hace
`from db.database import SessionLocal`, ese import copia la referencia a la
sesión de prueba en el namespace de main.py en el momento en que se
importa — por eso el parche debe ocurrir primero, y por eso `main` no puede
importarse al tope del archivo (de ahí los `# noqa: E402` de abajo). No se
toca ninguna línea de backend/main.py para lograr esto.
"""

import json
import re
import sys
import urllib.error
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Permite importar db.database, db.models y main sin importar desde dónde se
# corra pytest — mismo patrón que ya usa tests/edge/test_aggregate_observations.py.
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from db import database

# Motor de prueba: SQLite en memoria con StaticPool para que todas las
# sesiones (una por request, como hace cada ruta de main.py) compartan la
# MISMA conexión/base en memoria — sin StaticPool, cada sesión nueva vería
# una base en memoria distinta y vacía.
TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
database.engine = TEST_ENGINE
database.SessionLocal = sessionmaker(bind=TEST_ENGINE, autoflush=False, autocommit=False)

from fastapi.testclient import TestClient

import dataset_store
import main
from db.models import DeclaredEntry, DeclaredEntryHistory


def _make_entry(identifier: str, *, status: str = "active", **overrides) -> DeclaredEntry:
    """DeclaredEntry de prueba con valores por defecto simples — solo se
    sobreescriben los campos que le importan a cada prueba."""
    defaults = {
        "identifier": identifier,
        "detected_class": "bottle",
        "total_observations": 3,
        "code_read_count": 3,
        "avg_confidence": 0.8,
        "first_seen": "2026-01-01T00:00:00+00:00",
        "last_seen": "2026-01-01T00:05:00+00:00",
        "location_counts": {"sin_ubicacion": 3},
        "status": status,
    }
    defaults.update(overrides)
    return DeclaredEntry(**defaults)


def _make_history_row(identifier: str, recorded_at: str, **overrides) -> DeclaredEntryHistory:
    defaults = {
        "identifier": identifier,
        "detected_class": "bottle",
        "total_observations": 3,
        "code_read_count": 3,
        "avg_confidence": 0.8,
        "first_seen": "2026-01-01T00:00:00+00:00",
        "last_seen": "2026-01-01T00:05:00+00:00",
        "location_counts": {"sin_ubicacion": 3},
        "recorded_at": recorded_at,
    }
    defaults.update(overrides)
    return DeclaredEntryHistory(**defaults)


@pytest.fixture()
def client():
    """Esquema limpio en cada prueba: dropea y recrea las tablas sobre el
    mismo engine en memoria, para que ninguna prueba vea datos de otra."""
    database.Base.metadata.drop_all(bind=TEST_ENGINE)
    database.Base.metadata.create_all(bind=TEST_ENGINE)
    with TestClient(main.app) as test_client:
        yield test_client


def _seed(*rows) -> None:
    """Inserta filas directo en la base de prueba, fuera de la API — para
    dejar el estado inicial de cada prueba antes de llamar a un endpoint."""
    session = database.SessionLocal()
    try:
        session.add_all(rows)
        session.commit()
    finally:
        session.close()


def test_health_devuelve_status_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_inventory_devuelve_solo_activas_por_defecto(client):
    _seed(
        _make_entry("activa-1", status="active"),
        _make_entry("retirada-1", status="retired"),
    )

    response = client.get("/inventory")

    assert response.status_code == 200
    identifiers = [entry["identifier"] for entry in response.json()]
    assert identifiers == ["activa-1"]


def test_inventory_include_retired_incluye_tambien_las_retiradas(client):
    _seed(
        _make_entry("activa-1", status="active"),
        _make_entry("retirada-1", status="retired"),
    )

    response = client.get("/inventory", params={"include_retired": "true"})

    assert response.status_code == 200
    identifiers = {entry["identifier"] for entry in response.json()}
    assert identifiers == {"activa-1", "retirada-1"}


def test_retire_con_password_correcta_cambia_status_y_responde_200(client):
    _seed(_make_entry("producto-1", status="active"))

    response = client.patch(
        "/inventory/producto-1/retire",
        json={"password": main.ADMIN_ACTION_PASSWORD},
    )

    assert response.status_code == 200
    assert response.json() == {"identifier": "producto-1", "status": "retired"}

    session = database.SessionLocal()
    try:
        entry = session.get(DeclaredEntry, "producto-1")
        assert entry.status == "retired"
    finally:
        session.close()


def test_retire_con_password_incorrecta_responde_403_y_no_cambia_status(client):
    _seed(_make_entry("producto-1", status="active"))

    response = client.patch(
        "/inventory/producto-1/retire",
        json={"password": main.ADMIN_ACTION_PASSWORD + "-incorrecta"},
    )

    assert response.status_code == 403

    session = database.SessionLocal()
    try:
        entry = session.get(DeclaredEntry, "producto-1")
        assert entry.status == "active"
    finally:
        session.close()


def test_retire_identifier_inexistente_responde_404(client):
    response = client.patch(
        "/inventory/no-existe/retire",
        json={"password": main.ADMIN_ACTION_PASSWORD},
    )

    assert response.status_code == 404


def test_producto_retirado_sigue_apareciendo_con_include_retired(client):
    _seed(_make_entry("producto-1", status="active"))

    retire_response = client.patch(
        "/inventory/producto-1/retire",
        json={"password": main.ADMIN_ACTION_PASSWORD},
    )
    assert retire_response.status_code == 200

    active_only = client.get("/inventory")
    assert [e["identifier"] for e in active_only.json()] == []

    with_retired = client.get("/inventory", params={"include_retired": "true"})
    entries = with_retired.json()
    assert len(entries) == 1
    assert entries[0]["identifier"] == "producto-1"
    assert entries[0]["status"] == "retired"


def test_history_ordenado_por_recorded_at_descendente(client):
    _seed(
        _make_history_row("producto-1", "2026-01-01T08:00:00+00:00"),
        _make_history_row("producto-1", "2026-01-03T08:00:00+00:00"),
        _make_history_row("producto-1", "2026-01-02T08:00:00+00:00"),
    )

    response = client.get("/inventory/history")

    assert response.status_code == 200
    recorded_ats = [row["recorded_at"] for row in response.json()]
    assert recorded_ats == [
        "2026-01-03T08:00:00+00:00",
        "2026-01-02T08:00:00+00:00",
        "2026-01-01T08:00:00+00:00",
    ]


def test_recent_detections_vacio_si_nadie_esta_viendo_percepcion(client):
    # Sin cámara ni publicador de por medio: si nadie está suscrito a
    # Percepción en este proceso, el buffer nunca creció — lista vacía, no
    # un error, y sin fabricar actividad que no ocurrió.
    response = client.get("/perception/recent-detections")

    assert response.status_code == 200
    assert response.json() == []


def _observation_batch(n: int, **overrides) -> dict:
    observation = {
        "v": 1,
        "event_id": f"jetson-evento-{n:04d}",
        "timestamp": "2026-10-23T15:00:01+00:00",
        "source": "jetson",
        "detected_class": "bottle",
        "code_data": "QR-9",
        "code_read": True,
        "confidence": 0.9,
        "location_marker_id": 3,
    }
    observation.update(overrides)
    return {"v": 1, "source": "jetson", "observations": [observation]}


def test_observacion_del_agente_llega_a_recent_detections_y_es_idempotente(client):
    # RF-03: lo que manda el agente del Jetson alimenta el mismo panel que antes alimentaba la cámara local.
    antes = len(client.get("/perception/recent-detections?limit=50").json())
    assert client.post("/perception/observations", json=_observation_batch(1)).json() == {"accepted": 1, "duplicates": 0}
    assert client.post("/perception/observations", json=_observation_batch(1)).json() == {"accepted": 0, "duplicates": 1}
    recientes = client.get("/perception/recent-detections?limit=50").json()
    assert len(recientes) == antes + 1
    assert recientes[0]["code_data"] == "QR-9" and recientes[0]["location_marker_id"] == 3
    assert "event_id" not in recientes[0]  # las claves de siempre; nada nuevo se filtra al inventario


def test_auto_refresh_con_agente_no_abre_la_camara_de_la_laptop(monkeypatch):
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "http://10.4.5.103:8001")
    with patch.object(main._perception_publisher, "subscribe") as subscribe, patch.object(
        main._perception_publisher, "unsubscribe"
    ) as unsubscribe:
        main._refresh_begin_capture()
        main._refresh_end_capture()
    subscribe.assert_not_called()
    unsubscribe.assert_not_called()
    assert main._refresh_sink not in main._perception_observation_sinks


def test_auto_refresh_sin_agente_sigue_usando_la_camara_local(monkeypatch):
    monkeypatch.delenv("AETHER_PERCEPTION_AGENT_URL", raising=False)
    with patch.object(main._perception_publisher, "subscribe") as subscribe, patch.object(
        main._perception_publisher, "unsubscribe"
    ) as unsubscribe:
        main._refresh_begin_capture()
        main._refresh_end_capture()
    subscribe.assert_called_once()
    unsubscribe.assert_called_once()


def test_config_agents_sin_agente_deja_la_camara_local(client, monkeypatch):
    monkeypatch.delenv("AETHER_PERCEPTION_AGENT_URL", raising=False)
    monkeypatch.delenv("AETHER_LINE_AGENT_URL", raising=False)
    assert client.get("/config/agents").json()["perception"]["stream_url"] is None


def test_csp_de_main_se_amplia_con_el_agente(client, monkeypatch):
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "http://10.4.5.103:8001")
    assert "http://10.4.5.103:8001" in client.get("/health").headers["content-security-policy"]
    monkeypatch.delenv("AETHER_PERCEPTION_AGENT_URL")
    assert "10.4.5.103" not in client.get("/health").headers["content-security-policy"]


def _img_src(politica: str) -> set:
    return set(re.search(r"img-src ([^;\"]*)", politica).group(1).split())


def _meta_csp(html: str):
    m = re.search(r'<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)"', html, re.S | re.I)
    return m.group(1) if m else None


@pytest.mark.parametrize("configurado", ["http://mario-desktop.local:8001", "http://10.4.5.103:8001"])
@pytest.mark.parametrize("ip_cliente", ["10.4.5.103", "10.4.5.110"])  # el mismo equipo del agente / otro equipo
def test_el_origen_que_entrega_config_agents_esta_en_el_img_src_del_encabezado_y_del_meta(monkeypatch, configurado, ip_cliente):
    """Reproduce el fallo visto en el Jetson: index.html trae su PROPIO <meta> de CSP y el navegador aplica la
    política más estricta de las dos. El origen que /config/agents entrega debe estar en el img-src de AMBAS."""
    import agent_config

    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", configurado)
    monkeypatch.setattr(agent_config, "_resolve", lambda host: frozenset({"10.4.5.103"}))
    c = TestClient(main.app, client=(ip_cliente, 50000))

    url = c.get("/config/agents").json()["perception"]["stream_url"]
    origen = url.rsplit("/stream", 1)[0]
    esperado = "http://127.0.0.1:8001" if ip_cliente == "10.4.5.103" else configurado
    assert origen == esperado

    solo_estos = {"'self'", "data:", "blob:", configurado, "http://127.0.0.1:8001"}
    for ruta in ("/", "/index.html", "/celda.html", "/robot.html"):
        respuesta = c.get(ruta)
        en_encabezado = _img_src(respuesta.headers["content-security-policy"])
        assert origen in en_encabezado, f"{ruta}: {origen} no está en el encabezado {en_encabezado}"
        assert en_encabezado == solo_estos  # exactamente esos orígenes: sin comodines ni extras
        meta = _meta_csp(respuesta.text)
        if ruta in ("/", "/index.html"):
            assert meta is not None, "index.html debe seguir trayendo su <meta> de CSP"
        if meta is not None:
            assert origen in _img_src(meta), f"{ruta}: {origen} no está en el img-src del <meta>"
            assert _img_src(meta) == solo_estos


def test_sin_agente_index_y_la_csp_son_identicos_a_los_de_antes(monkeypatch):
    monkeypatch.delenv("AETHER_PERCEPTION_AGENT_URL", raising=False)
    monkeypatch.delenv("AETHER_LINE_AGENT_URL", raising=False)
    c = TestClient(main.app)
    original = (main.DASHBOARD_DIR / "index.html").read_text(encoding="utf-8")
    respuesta = c.get("/")
    assert respuesta.text == original
    assert respuesta.headers["content-security-policy"] == __import__("public_guard").CSP
    assert _img_src(_meta_csp(respuesta.text)) == {"'self'", "data:", "blob:"}


def test_index_con_agente_invalido_se_sirve_sin_cambios(monkeypatch):
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "esto no es una url")
    respuesta = TestClient(main.app).get("/")
    assert respuesta.status_code == 200
    assert respuesta.text == (main.DASHBOARD_DIR / "index.html").read_text(encoding="utf-8")


def test_la_lista_de_origenes_se_lee_en_cada_peticion_no_al_importar(monkeypatch):
    c = TestClient(main.app)
    monkeypatch.delenv("AETHER_PERCEPTION_AGENT_URL", raising=False)
    assert "10.4.5.103" not in c.get("/").headers["content-security-policy"]
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "http://10.4.5.103:8001")
    assert "http://10.4.5.103:8001" in c.get("/").headers["content-security-policy"]
    monkeypatch.setenv("AETHER_PERCEPTION_AGENT_URL", "http://10.4.5.104:8002")
    assert "10.4.5.103" not in c.get("/").headers["content-security-policy"]
    assert "http://10.4.5.104:8002" in _meta_csp(c.get("/").text)


def _fake_ollama_response(content: str) -> MagicMock:
    """Doble de prueba para el objeto que devuelve urllib.request.urlopen
    (un context manager con .read()) — evita depender de un Ollama real
    corriendo durante las pruebas."""
    body = json.dumps({"message": {"content": content}}).encode("utf-8")
    cm = MagicMock()
    cm.__enter__.return_value.read.return_value = body
    return cm


def test_robot_ask_devuelve_la_respuesta_de_ollama(client):
    with patch("main.urllib.request.urlopen", return_value=_fake_ollama_response("¡Hola!")):
        response = client.post("/robot/ask", json={"question": "Cuéntame algo sobre el proyecto."})

    assert response.status_code == 200
    assert response.json() == {"answer": "¡Hola!"}


def test_robot_ask_rechaza_pregunta_vacia(client):
    response = client.post("/robot/ask", json={"question": "   "})

    assert response.status_code == 422


def test_robot_ask_responde_503_si_ollama_no_contesta(client):
    with patch(
        "main.urllib.request.urlopen",
        side_effect=urllib.error.URLError("conexión rechazada"),
    ):
        response = client.post("/robot/ask", json={"question": "¿Cuánto inventario hay?"})

    assert response.status_code == 503
    assert "Ollama" in response.json()["detail"]


def test_robot_ask_quita_solo_la_oracion_de_metacomentario(client):
    # Bug real visto probando: el modelo contesta bien y LUEGO agrega una
    # oración que cita sus propias instrucciones en voz alta ("...responder
    # con honestidad y ternura", texto literal del propio system prompt).
    # Debe quitarse SOLO esa oración, conservando la respuesta real.
    con_relleno = (
        "Aether es un sistema de inspección de inventario. "
        "Estoy aquí para escuchar y responder con honestidad y ternura."
    )
    with patch("main.urllib.request.urlopen", return_value=_fake_ollama_response(con_relleno)):
        response = client.post("/robot/ask", json={"question": "Cuéntame algo sobre el proyecto."})

    assert response.status_code == 200
    assert response.json() == {"answer": "Aether es un sistema de inspección de inventario."}


def test_robot_ask_conserva_varias_oraciones_reales_tras_filtrar(client):
    # El filtrado es por oración, no "quédate solo con la primera": si el
    # modelo da una respuesta legítima de más de una oración, ambas deben
    # sobrevivir mientras ninguna sea meta-comentario — evita el efecto
    # secundario de la versión anterior (recortar a una sola oración volvía
    # respuestas reales demasiado cortas/vagas, ej. "Estoy aquí." como toda
    # la respuesta a "¿qué puedes hacer?").
    con_dos_oraciones_reales = (
        "Detecto objetos con YOLO y leo códigos de barras. "
        "También ubico marcadores ArUco. "
        "Estoy aquí para escuchar y responder con honestidad y ternura."
    )
    with patch(
        "main.urllib.request.urlopen", return_value=_fake_ollama_response(con_dos_oraciones_reales)
    ):
        response = client.post("/robot/ask", json={"question": "¿Qué puedes hacer?"})

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Detecto objetos con YOLO y leo códigos de barras. También ubico marcadores ArUco."
    }


def test_robot_ask_si_todo_es_metacomentario_cae_a_la_primera_oracion(client):
    # Caso raro pero posible: todas las oraciones que Ollama generó
    # coinciden con los patrones de meta-comentario. En vez de devolver una
    # respuesta vacía, se usa la primera oración cerrada tal cual, como
    # último recurso.
    todo_metacomentario = "Sigo mis instrucciones con cuidado. Respondo con honestidad y ternura."
    with patch(
        "main.urllib.request.urlopen", return_value=_fake_ollama_response(todo_metacomentario)
    ):
        response = client.post("/robot/ask", json={"question": "Cuéntame algo sobre el proyecto."})

    assert response.status_code == 200
    assert response.json() == {"answer": "Sigo mis instrucciones con cuidado."}


def test_robot_ask_descarta_la_oracion_incompleta_del_final(client):
    # num_predict limita tokens, no oraciones: Ollama puede cortar a media
    # palabra ("...producción automot", visto de verdad probando). La
    # oración incompleta del final se descarta, quedándose con las
    # oraciones anteriores que sí cerraron.
    cortado = "Aether es un sistema de inspección de inventario. Además, ayuda con la produ"
    with patch("main.urllib.request.urlopen", return_value=_fake_ollama_response(cortado)):
        response = client.post("/robot/ask", json={"question": "Cuéntame algo sobre el proyecto."})

    assert response.status_code == 200
    assert response.json() == {"answer": "Aether es un sistema de inspección de inventario."}


def test_robot_ask_sin_puntuacion_de_cierre_devuelve_el_texto_tal_cual(client):
    # Si Ollama no llegó a cerrar ni una sola oración (num_predict
    # demasiado bajo, o una respuesta atípica), no hay nada que recortar —
    # es más honesto devolver el fragmento incompleto que inventar cómo
    # debería terminar, o devolver una respuesta vacía.
    sin_puntuacion = "Aether es un sistema de inspección de inventario y produ"
    with patch("main.urllib.request.urlopen", return_value=_fake_ollama_response(sin_puntuacion)):
        response = client.post("/robot/ask", json={"question": "Cuéntame algo sobre el proyecto."})

    assert response.status_code == 200
    assert response.json() == {"answer": sin_puntuacion}


def test_robot_ask_lista_con_guiones_se_reemplaza_por_respuesta_honesta(client):
    # Bug real: preguntado "¿Cuántos sensores tiene el robot?", el modelo
    # respondió con una lista de viñetas con datos de hardware INVENTADOS
    # (infrarrojo, dos cámaras, sensor de movimiento — nada de eso está en
    # LUMINA_SYSTEM_PROMPT). Como la lista no tiene ningún punto,
    # _split_into_sentences() no encontraba ningún cierre y la dejaba pasar
    # completa sin filtrar. Ahora se detecta el formato de lista y se
    # reemplaza por una respuesta honesta genérica, sin importar qué tan
    # convincente sea el contenido inventado.
    lista_inventada = (
        "Mis sensores son 5, con las siguientes características:\n\n"
        "- Un sensor de infrarrojo de alto rendimiento\n"
        "- Dos cámaras de visión frontal y trasera\n"
        "- Un sensor de movimiento"
    )
    with patch("main.urllib.request.urlopen", return_value=_fake_ollama_response(lista_inventada)):
        response = client.post("/robot/ask", json={"question": "¿Cuántos sensores tiene el robot?"})

    assert response.status_code == 200
    assert response.json() == {"answer": main._LIST_FORMAT_FALLBACK_ANSWER}


def test_robot_ask_lista_numerada_tambien_se_detecta(client):
    # El mismo problema puede venir numerado ("1.", "2)") en vez de con
    # guiones — se detecta igual.
    lista_numerada = "Estas son mis capacidades:\n1. Detectar objetos\n2. Leer códigos de barras"
    with patch("main.urllib.request.urlopen", return_value=_fake_ollama_response(lista_numerada)):
        response = client.post("/robot/ask", json={"question": "¿Qué puedes hacer?"})

    assert response.status_code == 200
    assert response.json() == {"answer": main._LIST_FORMAT_FALLBACK_ANSWER}


def test_robot_ask_pregunta_precargada_como_te_llamas_no_llama_a_ollama(client):
    # Redacción distinta a la de la tabla original ("¿Cómo te llamas?") —
    # confirma que el match es por palabra clave, no texto exacto, como
    # llegaría de verdad desde el reconocimiento de voz.
    with patch("main.urllib.request.urlopen") as mock_urlopen:
        response = client.post("/robot/ask", json={"question": "oye, ¿cuál es tu nombre?"})

    assert response.status_code == 200
    assert response.json() == {"answer": "Soy Lumina, el robot móvil de Aether. Mucho gusto."}
    mock_urlopen.assert_not_called()


def test_robot_ask_pregunta_precargada_que_es_aether_con_relleno(client):
    with patch("main.urllib.request.urlopen") as mock_urlopen:
        response = client.post("/robot/ask", json={"question": "y dime, ¿qué es Aether exactamente?"})

    assert response.status_code == 200
    assert response.json() == {
        "answer": "Aether es el proyecto completo: yo, más una línea de manufactura que arma piezas automotrices."
    }
    mock_urlopen.assert_not_called()


def test_robot_ask_pregunta_precargada_tienes_hambre_con_relleno_de_voz(client):
    with patch("main.urllib.request.urlopen") as mock_urlopen:
        response = client.post("/robot/ask", json={"question": "oye lumina tienes hambre o no"})

    assert response.status_code == 200
    assert response.json() == {"answer": "Un poco, aunque a mí me alimenta la electricidad, no la comida."}
    mock_urlopen.assert_not_called()


def test_robot_ask_pregunta_fuera_de_la_lista_sigue_yendo_a_ollama(client):
    with patch(
        "main.urllib.request.urlopen", return_value=_fake_ollama_response("Respuesta real de Ollama.")
    ) as mock_urlopen:
        response = client.post("/robot/ask", json={"question": "¿Qué opinas del clima de hoy?"})

    assert response.status_code == 200
    assert response.json() == {"answer": "Respuesta real de Ollama."}
    mock_urlopen.assert_called_once()


def test_robot_ask_un_guion_suelto_no_se_confunde_con_una_lista(client):
    # Un guion usado como puntuación normal (no al inicio de una línea) no
    # debe disparar el filtro de listas — se exige al menos 2 líneas con
    # pinta real de viñeta/numeración, no solo la presencia de "-" en algún
    # lado del texto.
    con_guion_normal = "Aether - un proyecto real de automatización - ya funciona hoy."
    with patch("main.urllib.request.urlopen", return_value=_fake_ollama_response(con_guion_normal)):
        response = client.post("/robot/ask", json={"question": "Cuéntame algo sobre el proyecto."})

    assert response.status_code == 200
    assert response.json() == {"answer": con_guion_normal}


# --- /robot/call: "Lumina, llámame" y "Lumina, llama a <contacto>" -------------


def _fake_zavu_response() -> MagicMock:
    response = MagicMock()
    response.__enter__.return_value.read.return_value = json.dumps({"message": {"id": "msg_1"}}).encode("utf-8")
    return response


@pytest.fixture()
def zavu(monkeypatch, tmp_path):
    """Zavu configurado con una agenda de prueba; nunca sale a la red."""
    contacts = tmp_path / "contactos.json"
    contacts.write_text(
        json.dumps(
            {
                "Mamá": "+525512345678",
                "invalido": "123",
                "Ivonne": {"numero": "+525511112222", "mensaje": "Mario te manda saludos."},
            }
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(main, "CONTACTS_FILE", contacts)
    monkeypatch.setattr(main, "ZAVUDEV_API_KEY", "zavu-test")
    monkeypatch.setattr(main, "LUMINA_CALL_TO", "+525500000000")
    main._recent_calls.clear()
    with patch("main.urllib.request.urlopen", return_value=_fake_zavu_response()) as urlopen:
        yield urlopen


def _sent_payload(urlopen) -> dict:
    return json.loads(urlopen.call_args.args[0].data.decode("utf-8"))


def test_robot_call_contacto_llama_a_su_numero_con_texto_neutro_y_el_mensaje(client, zavu):
    response = client.post("/robot/call", json={"contact": "mama", "message": "ya voy"})

    assert response.status_code == 200
    payload = _sent_payload(zavu)
    assert payload["to"] == "+525512345678"
    assert payload["channel"] == "voice"
    body = f"{main.LUMINA_CONTACT_CALL_TEXT} Te dejo este mensaje: ya voy."
    assert payload["text"] == f"{main.LUMINA_CALL_INTRO} {body} Repito: {body}"


def test_robot_call_contacto_con_mensaje_fijo_lo_dice_en_vez_del_saludo(client, zavu):
    response = client.post("/robot/call", json={"contact": "ivonne", "message": "ya llegué"})

    assert response.status_code == 200
    payload = _sent_payload(zavu)
    assert payload["to"] == "+525511112222"
    body = "Mario te manda saludos. Te dejo este mensaje: ya llegué."
    assert payload["text"] == f"{main.LUMINA_CALL_INTRO} {body} Repito: {body}"


def test_robot_call_contacto_desconocido_responde_404_y_no_llama(client, zavu):
    response = client.post("/robot/call", json={"contact": "tío"})

    assert response.status_code == 404
    zavu.assert_not_called()


def test_robot_call_ignora_numeros_invalidos_en_la_agenda(client, zavu):
    response = client.post("/robot/call", json={"contact": "invalido"})

    assert response.status_code == 404
    zavu.assert_not_called()


def test_robot_call_sin_contacto_llama_a_LUMINA_CALL_TO(client, zavu):
    response = client.post("/robot/call")

    assert response.status_code == 200
    assert _sent_payload(zavu)["to"] == "+525500000000"


def test_robot_call_limita_las_llamadas_seguidas(client, zavu):
    for _ in range(main.CALL_LIMIT):
        assert client.post("/robot/call", json={"contact": "Mamá"}).status_code == 200

    response = client.post("/robot/call", json={"contact": "Mamá"})

    assert response.status_code == 429
    assert zavu.call_count == main.CALL_LIMIT


def test_robot_call_status_devuelve_el_estado_de_zavu(client, zavu):
    zavu.return_value.__enter__.return_value.read.return_value = json.dumps(
        {"message": {"id": "msg_1", "status": "failed", "errorCode": "timeout"}}
    ).encode("utf-8")

    response = client.get("/robot/call/msg_1234567")

    assert response.status_code == 200
    assert response.json() == {"status": "failed", "errorCode": "timeout"}
    assert zavu.call_args.args[0].full_url.endswith("/v1/messages/msg_1234567")


def test_robot_call_status_rechaza_identificadores_raros(client, zavu):
    response = client.get("/robot/call/..%2Fsenders")

    assert response.status_code in (404, 422)
    zavu.assert_not_called()


def test_robot_contacts_devuelve_solo_nombres_validos_sin_numeros(client, zavu):
    response = client.get("/robot/contacts")

    assert response.status_code == 200
    assert response.json() == {"names": ["Ivonne", "Mamá"]}
    assert "+52" not in response.text


def test_dataset_vacio_y_alta_de_pieza(client, tmp_path, monkeypatch):
    monkeypatch.setattr(dataset_store, "parts_root", lambda: tmp_path)
    monkeypatch.setattr(dataset_store, "default_weights_file", lambda: tmp_path / "missing.pt")
    monkeypatch.delenv("YOLO_WEIGHTS", raising=False)

    empty = client.get("/dataset")
    assert empty.status_code == 200
    assert empty.json()["totals"] == {"pieces": 0, "images": 0, "labeled": 0, "unlabeled": 0}
    assert empty.json()["model"]["active"] == "yolov8n.pt"

    created = client.post("/dataset/classes", json={"name": "bracket_a"})
    assert created.status_code == 200
    assert created.json()["classes"][0]["name"] == "bracket_a"
    assert created.json()["classes"][0]["total"] == 0

    duplicate = client.post("/dataset/classes", json={"name": "bracket_a"})
    assert duplicate.status_code == 409

    invalid = client.post("/dataset/classes", json={"name": "Bracket A"})
    assert invalid.status_code == 400


def test_laboratorio_sigue_pidiendo_la_celda(client, monkeypatch):
    monkeypatch.setenv("AETHER_PUBLIC_MODE", "auto")
    response = client.post("/line/cell/run", json={"on": False})
    assert response.status_code == 401
    assert response.headers["permissions-policy"] == "camera=(self), microphone=(self), geolocation=()"


def test_dominio_publico_cierra_camara_y_piston(client, monkeypatch):
    monkeypatch.setenv("AETHER_PUBLIC_MODE", "auto")
    response = client.get("/perception/stream", headers={"Host": "aethermx.online"})
    assert response.status_code == 403
    assert response.json()["detail"] == "No disponible"
    piston = client.post(
        "/line/cell/run",
        json={"on": True},
        headers={"Host": "www.aethermx.online"},
    )
    assert piston.status_code == 403
    inventory = client.get("/inventory", headers={"Host": "aethermx.online"})
    assert inventory.status_code == 200
    assert inventory.json() == []
    assert inventory.headers["permissions-policy"] == "camera=(), microphone=(), geolocation=()"


def test_archivos_ocultos_responden_404(client):
    assert client.get("/.env").status_code == 404
    assert client.get("/.git/config").status_code == 404


def test_forzar_publico_por_entorno(client, monkeypatch):
    monkeypatch.setenv("AETHER_PUBLIC_MODE", "public")
    assert client.get("/line/vision/stream").status_code == 403
    monkeypatch.setenv("AETHER_PUBLIC_MODE", "local")
    assert client.post("/line/cell/run", json={"on": False}).status_code == 401
