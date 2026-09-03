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
