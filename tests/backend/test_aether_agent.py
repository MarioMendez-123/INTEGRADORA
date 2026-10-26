"""Agente del Jetson (aether_agent.py): /health, /status, /stream, envío de observaciones y red local.

Sin cámara, sin YOLO y sin laptop: publicador, motor y transporte son dobles.
"""

import json
import sys
import time
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

import aether_agent  # noqa: E402
from agent_contracts import AgentStatus, ObservationBatch  # noqa: E402
from aether_agent import AgentSettings, create_app  # noqa: E402
from observation_outbox import EventOutbox  # noqa: E402
from perception_pipeline import PerceptionEngine  # noqa: E402
from settings import ConfigError  # noqa: E402


def esperar(condicion, timeout=3.0):
    limite = time.monotonic() + timeout
    while time.monotonic() < limite:
        if condicion():
            return True
        time.sleep(0.01)
    return False


def ajustes(**cambios):
    base = dict(
        agent_id="jetson", laptop_url="http://10.4.5.52:8000", capture="always", detect_mode="sync",
        detect_max_hz=10.0, detect_every_n=1, camera_index=0, camera_options={}, weights="yolov8n.pt",
        yolo_imgsz=None, yolo_device="", yolo_half=False, jpeg_quality=80, outbox_max=100, outbox_batch=50,
        outbox_timeout_s=1.0, outbox_interval_s=0.0,
    )
    base.update(cambios)
    return AgentSettings(**base)


class FakeBox:
    def __init__(self, xyxy, cls, conf):
        self.xyxy, self.cls, self.conf = [np.array(xyxy)], [cls], [conf]


class FakeModel:
    names = {0: "bottle"}

    def __call__(self, frame, verbose=False, **kw):
        return [SimpleNamespace(boxes=[FakeBox([2, 2, 20, 20], 0, 0.9)])]


class FakeAruco:
    def detectMarkers(self, frame):
        return None, None, None


def fake_engine():
    return PerceptionEngine(FakeModel(), lambda crop: [], FakeAruco())


class FakePublisher:
    def __init__(self, camera_index, make_processor, label, **kwargs):
        self.make_processor = make_processor
        self.kwargs = kwargs
        self.processor = None
        self.running = False
        self.fail = None
        self.last_error = None
        self.subs = 0

    def subscribe(self):
        if self.fail:
            raise RuntimeError(self.fail)
        if self.subs == 0:
            self.processor = self.make_processor()
            self.running = True
        self.subs += 1

    def unsubscribe(self):
        self.subs = max(0, self.subs - 1)
        if self.subs == 0:
            self.running = False

    def is_running(self):
        return self.running

    def stats(self):
        return {"open": self.running, "fps_camera": 29.5, "fps_delivery": 25.0, "width": 640, "height": 480}

    def stream_frames(self):
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\nJPEG\r\n"


class LaptopFalsa:
    def __init__(self):
        self.cuerpos = []

    def __call__(self, url, body, timeout):
        self.cuerpos.append((url, json.loads(body)))
        return 200


def montar(**cambios):
    s = ajustes(**cambios)
    laptop = LaptopFalsa()
    box = {}

    def fabrica(**kw):
        box["pub"] = FakePublisher(**kw)
        return box["pub"]

    outbox = EventOutbox(
        url=f"{s.laptop_url}/perception/observations" if s.laptop_url else None,
        build_body=lambda lote: {"v": 1, "source": s.agent_id, "observations": lote},
        send=laptop,
        batch_size=50,
    )
    app = create_app(s, publisher_factory=fabrica, engine_factory=fake_engine, outbox=outbox)
    return app, box, laptop


def test_arranca_la_camara_sola_y_reporta_salud_y_estado():
    app, box, _ = montar()
    with TestClient(app) as c:
        assert c.get("/health").json() == {"status": "ok", "error": None}
        estado = c.get("/status").json()
        AgentStatus.model_validate(estado)  # cumple el contrato
        assert estado["state"] == "running" and estado["role"] == "perception" and estado["agent_id"] == "jetson"
        assert estado["camera"] == {"open": True, "fps_camera": 29.5, "fps_delivery": 25.0, "width": 640, "height": 480}
        assert estado["inference"]["model"] == "yolov8n.pt" and estado["inference"]["mode"] == "sync"
        assert estado["laptop"]["url"] == "http://10.4.5.52:8000"
    assert box["pub"].running is False  # apagado ordenado: se libera la cámara


def test_la_camara_no_abre_pero_el_agente_sigue_y_lo_dice():
    app, box, _ = montar()
    with TestClient(app) as c:
        box["pub"].fail = "No se pudo abrir la cámara (índice 0)."
        box["pub"].unsubscribe()
        # simula el arranque fallido: el vigilante lo reintentaría; aquí solo se comprueba la lectura del estado
        app.state.holder["error"] = "No se pudo abrir la cámara (índice 0)."
        assert c.get("/health").json()["status"] == "error"
        estado = c.get("/status").json()
        assert estado["state"] == "error" and "cámara" in estado["error"]


def test_capture_on_demand_no_abre_la_camara_al_arrancar():
    app, box, _ = montar(capture="on_demand")
    with TestClient(app) as c:
        assert box["pub"].running is False
        assert c.get("/status").json()["state"] == "stopped"
        r = c.get("/stream")
        assert r.status_code == 200 and b"JPEG" in r.content


def test_stream_da_503_con_el_motivo_si_no_abre():
    app, box, _ = montar(capture="on_demand")
    with TestClient(app) as c:
        box["pub"].fail = "No se pudo abrir la cámara."
        r = c.get("/stream")
        assert r.status_code == 503 and "cámara" in r.json()["detail"]


def test_las_observaciones_salen_con_id_estable_y_llegan_a_la_laptop():
    app, box, laptop = montar()
    with TestClient(app):
        box["pub"].processor(np.zeros((40, 40, 3), dtype=np.uint8))  # un cuadro con una botella
        outbox = app.state.outbox
        assert len(outbox) == 1
        assert outbox.flush_once() is True
    url, cuerpo = laptop.cuerpos[0]
    assert url == "http://10.4.5.52:8000/perception/observations"
    lote = ObservationBatch.model_validate(cuerpo)  # la laptop lo aceptaría tal cual
    assert lote.source == "jetson" and lote.observations[0].detected_class == "bottle"
    assert len(lote.observations[0].event_id) == 32


def test_sin_laptop_configurada_no_se_encola_nada():
    app, box, _ = montar(laptop_url="")
    with TestClient(app) as c:
        box["pub"].processor(np.zeros((40, 40, 3), dtype=np.uint8))
        assert len(app.state.outbox) == 0
        assert c.get("/status").json()["laptop"]["url"] is None


def test_solo_red_local(monkeypatch):
    app, _, _ = montar()
    with TestClient(app) as c:
        monkeypatch.setattr(aether_agent, "host_is_lan", lambda *a, **k: False)
        assert c.get("/health").status_code == 403
        assert c.get("/stream").status_code == 403


# ------------------------------------------------------------------ configuración


def test_configuracion_por_defecto(monkeypatch):
    for nombre in ("AETHER_AGENT_ID", "AETHER_LAPTOP_URL", "AETHER_AGENT_CAPTURE", "AETHER_DETECT_MODE", "PERCEPTION_CAMERA_BACKEND"):
        monkeypatch.delenv(nombre, raising=False)
    s = AgentSettings.from_env()
    assert s.agent_id == "jetson" and s.laptop_url == "" and s.capture == "always" and s.detect_mode == "async"
    assert s.camera_options == {"backend": "v4l2", "fourcc": "MJPG", "width": 640, "height": 480}
    assert s.yolo_half is False and s.detect_max_hz == 10.0


@pytest.mark.parametrize(
    "nombre, valor, pista",
    [
        ("AETHER_AGENT_ID", "Jetson Nano", "AETHER_AGENT_ID"),
        ("AETHER_LAPTOP_URL", "10.4.5.52:8000", "AETHER_LAPTOP_URL"),
        ("AETHER_AGENT_CAPTURE", "siempre", "AETHER_AGENT_CAPTURE"),
        ("AETHER_DETECT_MAX_HZ", "-3", "AETHER_DETECT_MAX_HZ"),
        ("AETHER_JPEG_QUALITY", "alta", "AETHER_JPEG_QUALITY"),
    ],
)
def test_configuracion_invalida_falla_al_arrancar_con_el_nombre(monkeypatch, nombre, valor, pista):
    monkeypatch.setenv(nombre, valor)
    with pytest.raises(ConfigError, match=pista):
        AgentSettings.from_env()


def test_la_app_real_se_construye_sin_abrir_la_camara():
    # El módulo se importó arriba con el entorno por defecto: la app existe y no abrió ningún dispositivo.
    assert aether_agent.app.title == "Aether agent"
    assert aether_agent.app.state.publisher.is_running() is False


# ------------------------------------------------------------------ de punta a punta (sin cámara ni YOLO reales)


def test_punta_a_punta_agente_real_con_camara_falsa_y_script_de_medicion(capsys):
    """Agente real (AgentCameraPublisher + uvicorn en un puerto libre) con cv2.VideoCapture falso y un motor falso.
    Comprueba /health, /status y que /stream entrega JPEG de verdad medidos por scripts/probar_agente.py."""
    import importlib.util
    import socket
    import threading
    from unittest.mock import patch

    import uvicorn

    from agent_camera import AgentCameraPublisher

    class Camara:
        def __init__(self, *_a, **_k):
            self.cerrada = False

        def isOpened(self):
            return True

        def set(self, *_a):
            return True

        def get(self, *_a):
            return 0

        def read(self):
            time.sleep(1 / 60)  # ~60 cuadros por segundo de "hardware"
            return (False, None) if self.cerrada else (True, np.full((48, 64, 3), 90, dtype=np.uint8))

        def release(self):
            self.cerrada = True

    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        puerto = s.getsockname()[1]

    ajuste = ajustes(laptop_url="", capture="always", detect_mode="async", camera_options={})
    app = create_app(ajuste, publisher_factory=AgentCameraPublisher, engine_factory=fake_engine)
    servidor = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", port=puerto, log_level="warning"))
    hilo = threading.Thread(target=servidor.run, daemon=True)
    with patch("cv2.VideoCapture", Camara):
        hilo.start()
        try:
            assert esperar(lambda: servidor.started, timeout=10)
            ruta = Path(__file__).resolve().parents[2] / "scripts" / "probar_agente.py"
            spec = importlib.util.spec_from_file_location("probar_agente", ruta)
            modulo = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(modulo)
            assert esperar(lambda: modulo.get_json(f"http://127.0.0.1:{puerto}/status")["camera"]["open"], timeout=10)
            sys.argv = ["probar_agente", f"http://127.0.0.1:{puerto}", "--segundos", "2"]
            codigo = modulo.main()
            salida = capsys.readouterr().out
        finally:
            servidor.should_exit = True
            hilo.join(timeout=10)
    assert codigo == 0, salida
    assert "FPS recibidos aquí" in salida and "VEREDICTO" in salida
    import re

    cuadros = int(re.search(r"\((\d+) cuadros en", salida).group(1))
    assert cuadros >= 20  # ~60 FPS de cámara falsa durante 2 s: llegan muchos JPEG reales


def test_status_trae_los_obstaculos_y_el_modelo_doble():
    class Piezas(FakeModel):
        names = {0: "computadora3"}

    def doble():
        return PerceptionEngine(FakeModel(), lambda crop: [], FakeAruco(), pieces_model=Piezas())

    s = ajustes(pieces_weights="parts.pt")
    outbox = EventOutbox(url=None, build_body=lambda lote: lote)
    app = create_app(s, publisher_factory=FakePublisher, engine_factory=doble, outbox=outbox)
    with TestClient(app) as c:
        app.state.publisher.processor(np.zeros((60, 80, 3), np.uint8))  # modo sync: analiza este cuadro
        estado = c.get("/status").json()
    AgentStatus.model_validate(estado)
    assert estado["inference"]["model"] == "parts.pt + yolov8n.pt"
    assert estado["obstacles"] == {"count": 1, "classes": ["bottle"], "max_area_pct": 6.8}  # 18x18 de 80x60
