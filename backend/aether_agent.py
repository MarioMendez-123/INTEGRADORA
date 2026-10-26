"""Agente de percepción del Jetson (o de cualquier equipo con cámara).

Abre la cámara de ESTE equipo, corre la percepción (YOLO + códigos + ArUco) y sirve el video anotado
por /stream. A la laptop solo le manda observaciones en JSON (POST /perception/observations), con
cola local acotada y reintento. El video no pasa por la laptop. Contratos: contracts/agents_api.md.

Arranque, desde backend/ (en el Jetson, dentro del venv):
    python -m uvicorn aether_agent:app --host 0.0.0.0 --port 8001
o con scripts/jetson/iniciar-agente.sh. Variables: docs/variables_entorno.md.

Solo para la red local: sin autenticación, nunca expuesto a internet. No toca GPIO.
"""

import logging
import threading
import uuid
from contextlib import asynccontextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse

from agent_camera import AgentCameraPublisher
from agent_contracts import (
    AgentStatus,
    CameraStatus,
    InferenceStatus,
    LaptopStatus,
    Observation,
)
from camera_publisher import camera_options
from lan_guard import host_is_lan, lan_networks
from logging_config import setup_logging
from observation_outbox import EventOutbox
from perception_pipeline import PerceptionProcessor, build_engine
from process_usage import process_usage
from settings import ConfigError, env_bool, env_choice, env_float, env_int, env_str, env_url

logger = logging.getLogger("aether_agent")

VIGILAR_CADA_S = 5.0


@dataclass(frozen=True)
class AgentSettings:
    agent_id: str
    laptop_url: str
    capture: str
    detect_mode: str
    detect_max_hz: float
    detect_every_n: int
    camera_index: int
    camera_options: dict
    weights: str
    yolo_imgsz: int | None
    yolo_device: str
    yolo_half: bool
    jpeg_quality: int
    outbox_max: int
    outbox_batch: int
    outbox_timeout_s: float
    outbox_interval_s: float = 1.0
    pieces_weights: str | None = None  # parts.pt; con él, `weights` queda como detector de obstáculos
    piece_conf: float = 0.5
    obstacle_conf: float = 0.4

    @classmethod
    def from_env(cls) -> "AgentSettings":
        import re

        from dataset_store import CONFIANZA_MINIMA, pesos_entorno, pesos_piezas

        agent_id = env_str("AETHER_AGENT_ID", "jetson")
        if not re.fullmatch(r"[a-z0-9_-]{1,32}", agent_id):
            raise ConfigError(f"AETHER_AGENT_ID debe ser minúsculas, números, - o _ (máx. 32), no '{agent_id}'.")
        # Valores por defecto de captura para Linux (V4L2 MJPG 640x480); lo que se defina por entorno gana.
        options = {"backend": "v4l2", "fourcc": "MJPG", "width": 640, "height": 480}
        options.update({k: v for k, v in camera_options("PERCEPTION").items() if v is not None})
        imgsz = env_int("AETHER_YOLO_IMGSZ", 0, minimo=0, maximo=2048)
        return cls(
            agent_id=agent_id,
            laptop_url=env_url("AETHER_LAPTOP_URL"),
            capture=env_choice("AETHER_AGENT_CAPTURE", "always", ("always", "on_demand")),
            detect_mode=env_choice("AETHER_DETECT_MODE", "async", ("async", "sync")),
            detect_max_hz=env_float("AETHER_DETECT_MAX_HZ", 10.0, minimo=0.0, maximo=120.0),
            detect_every_n=1,
            camera_index=env_int("PERCEPTION_CAMERA_INDEX", 0, minimo=0, maximo=63),
            camera_options=options,
            weights=pesos_entorno(),
            # parts.pt, si existe: las piezas se identifican por su clase y el modelo general queda para obstáculos.
            pieces_weights=pesos_piezas() if env_bool("AETHER_PIECES", True) else None,
            piece_conf=env_float("AETHER_PIECE_CONF", CONFIANZA_MINIMA, minimo=0.05, maximo=0.99),
            obstacle_conf=env_float("AETHER_OBSTACLE_CONF", 0.4, minimo=0.05, maximo=0.99),
            yolo_imgsz=imgsz or None,
            yolo_device=env_str("AETHER_YOLO_DEVICE"),
            yolo_half=env_bool("AETHER_YOLO_HALF", False),
            jpeg_quality=env_int("AETHER_JPEG_QUALITY", 80, minimo=30, maximo=100),
            outbox_max=env_int("AETHER_OUTBOX_MAX", 1000, minimo=10, maximo=100000),
            outbox_batch=env_int("AETHER_OUTBOX_BATCH", 50, minimo=1, maximo=100),
            outbox_timeout_s=env_float("AETHER_OUTBOX_TIMEOUT_S", 3.0, minimo=0.5, maximo=30.0),
            outbox_interval_s=env_float("AETHER_OUTBOX_INTERVAL_S", 1.0, minimo=0.0, maximo=10.0),
        )


def _clip(text: str | None, limit: int) -> str | None:
    return None if text is None else text[:limit]


def create_app(settings: AgentSettings, publisher_factory=None, engine_factory=None, outbox: EventOutbox | None = None):
    """publisher_factory / engine_factory / outbox se inyectan en las pruebas; en producción salen de settings."""
    setup_logging()
    holder: dict = {"processor": None, "error": None, "usage": {}}
    started_at = datetime.now(timezone.utc)
    stop_watch = threading.Event()

    if outbox is None:
        outbox = EventOutbox(
            url=f"{settings.laptop_url}/perception/observations" if settings.laptop_url else None,
            build_body=lambda batch: {"v": 1, "source": settings.agent_id, "observations": batch},
            max_size=settings.outbox_max,
            batch_size=settings.outbox_batch,
            timeout_s=settings.outbox_timeout_s,
            flush_interval_s=settings.outbox_interval_s,
        )

    def emit(observation: dict) -> None:
        try:
            complete = Observation(
                event_id=uuid.uuid4().hex,
                source=settings.agent_id,
                timestamp=observation["timestamp"],
                detected_class=(observation["detected_class"] or "?")[:64],
                code_data=_clip(observation["code_data"], 256),
                code_read=observation["code_read"],
                confidence=min(1.0, max(0.0, observation["confidence"])),
                location_marker_id=observation["location_marker_id"],
            )
        except Exception:
            logger.exception("Observación propia inválida; se descarta.")
            return
        outbox.put(complete.model_dump(mode="json"))

    def make_processor():
        predict = {}
        if settings.yolo_imgsz:
            predict["imgsz"] = settings.yolo_imgsz
        if settings.yolo_device:
            predict["device"] = settings.yolo_device
        if settings.yolo_half:
            predict["half"] = True
        engine = engine_factory() if engine_factory is not None else build_engine(
            settings.weights, predict, settings.pieces_weights, settings.piece_conf, settings.obstacle_conf
        )
        processor = PerceptionProcessor(engine, emit, mode=settings.detect_mode, max_hz=settings.detect_max_hz)
        holder["processor"] = processor
        return processor

    publisher = (publisher_factory or AgentCameraPublisher)(
        camera_index=settings.camera_index,
        make_processor=make_processor,
        label="perception-agent",
        jpeg_quality=settings.jpeg_quality,
        **settings.camera_options,
    )

    def watch() -> None:
        """Si la cámara USB se cae el publicador se detiene solo; aquí se reabre."""
        while not stop_watch.wait(VIGILAR_CADA_S):
            if settings.capture != "always" or publisher.is_running():
                continue
            logger.warning("La cámara dejó de entregar cuadros; reintentando.")
            try:
                publisher.unsubscribe()
                publisher.subscribe()
                holder["error"] = None
            except Exception as exc:
                holder["error"] = str(exc)
                logger.error("No reabrió la cámara: %s", exc)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        outbox.start()
        if settings.capture == "always":
            try:
                publisher.subscribe()  # este suscriptor no se va: observa aunque nadie mire el video
            except Exception as exc:
                holder["error"] = str(exc)
                logger.exception("La cámara no abrió; el agente sigue y reintenta.")
        threading.Thread(target=watch, name="vigilar-camara", daemon=True).start()
        logger.info(
            "Agente '%s' listo: captura=%s, detección=%s, laptop=%s, piezas=%s.",
            settings.agent_id, settings.capture, settings.detect_mode, settings.laptop_url or "(sin laptop)",
            Path(settings.pieces_weights).name if settings.pieces_weights else "NO (sin parts.pt: solo detector general, las piezas no se identifican)",
        )
        yield
        stop_watch.set()
        publisher.unsubscribe()
        outbox.stop()

    app = FastAPI(lifespan=lifespan, title="Aether agent")

    @app.middleware("http")
    async def solo_red_local(request: Request, call_next):
        host = request.client.host if request.client else ""
        if not host_is_lan(host, lan_networks()):
            return JSONResponse(status_code=403, content={"detail": "Solo red local."})
        return await call_next(request)

    @app.get("/health")
    def health():
        return {"status": "error" if holder["error"] else "ok", "error": holder["error"]}

    @app.get("/status")
    def status():
        stats = publisher.stats() if hasattr(publisher, "stats") else {"open": publisher.is_running()}
        proc = holder["processor"].stats() if holder["processor"] is not None else {}
        running = bool(stats.get("open"))
        error = holder["error"] or getattr(publisher, "last_error", None) or proc.get("last_error")
        state = "error" if (error and not running) else "running" if running else ("stopped" if settings.capture == "on_demand" else "starting")
        return AgentStatus(
            agent_id=settings.agent_id,
            role="perception",
            state=state,
            started_at=started_at,
            error=error,
            camera=CameraStatus(**{k: stats.get(k) for k in ("open", "fps_camera", "fps_delivery", "width", "height")}),
            inference=InferenceStatus(
                model=Path(settings.weights).name
                if settings.pieces_weights is None
                else f"{Path(settings.pieces_weights).name} + {Path(settings.weights).name}",
                mode=settings.detect_mode,
                ms_last=proc.get("ms_last"),
                ms_avg=proc.get("ms_avg"),
                every_n_frames=settings.detect_every_n if settings.detect_mode == "sync" else None,
            ),
            laptop=LaptopStatus(
                url=settings.laptop_url or None,
                reachable=outbox.reachable,
                outbox_len=len(outbox),
                sent_total=outbox.sent_total,
                dropped_total=outbox.dropped_total,
                last_error=outbox.last_error,
            ),
            resources=process_usage(holder["usage"]),
            obstacles=proc.get("obstacles"),
        ).model_dump(mode="json")

    @app.get("/stream")
    def stream():
        try:
            publisher.subscribe()
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

        def generate():
            try:
                yield from publisher.stream_frames()
            finally:
                publisher.unsubscribe()

        return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame")

    app.state.holder = holder
    app.state.outbox = outbox
    app.state.publisher = publisher
    return app


def _app_from_env():
    try:
        return create_app(AgentSettings.from_env())
    except ConfigError as exc:
        raise SystemExit(f"Configuración inválida: {exc}") from exc


app = _app_from_env()
