"""Agente de la celda de manufactura para la Raspberry Pi 4.

Corre SOLO la celda: cámara, visión de línea, pulsos del pistón y la banda (cell_line.py), alarmas (cell_hmi.py)
y la página celda.html. No importa main.py, así que no arrastra Lumina, la base de datos, torch ni ultralytics.

Mismo patrón que el agente del Jetson (aether_agent.py, contracts/agents_api.md):
  - el VIDEO se sirve aquí (/stream, y /line/vision/stream para celda.html) y no pasa por la laptop;
  - a la laptop solo le llegan datos: /status (consultable) y los eventos de pieza, con event_id, por
    POST {AETHER_LAPTOP_URL}/line/cell/events (cola local acotada con reintento);
  - la celda decide y actúa aunque la laptop o la red se caigan.
SIN GPIO: este archivo no instala ni activa gpiod; los pulsos siguen dependiendo de cell_line.py y de que el
equipo confirme el cableado. Los eventos que se mandan a la laptop solo se ANOTAN allá: no accionan nada.

Arranque, desde backend/:
    python -m uvicorn celda_agent:app --host 0.0.0.0 --port 8000
La página queda en http://<ip-de-la-pi>:8000/celda.html

La cámara se abre al arrancar y la celda opera sin que nadie tenga el video abierto. Para que la Pi no se trabe,
la visión analiza UN frame cada LINE_ANALISIS_CADA_S segundos con un solo modelo ONNX (line_model.py); el video se
entrega aparte, a AETHER_CELL_STREAM_FPS, con el último resultado dibujado. Sin autenticación más allá de la cuenta
de cell_hmi.py (CELDA_HMI_CLAVE): solo red local (AETHER_LAN_CIDRS), nunca expuesto a internet.

Variables de entorno (todas opcionales; tabla en docs/variables_entorno.md):
    LINE_ANALISIS_CADA_S  pausa entre análisis, 0.1 a 1.0 (def. 0.5)
    LINE_ESTABLES         análisis seguidos iguales antes de actuar (def. 5, en cell_line.py)
    LINE_MODEL            ruta del .onnx (def. edge/perception/weights/parts.onnx)
    LINE_IMGSZ            tamaño de exportación del modelo (def. 320)
    LINE_CV_THREADS       hilos de OpenCV (def. 3, deja un núcleo libre)
    AETHER_LAPTOP_URL     servidor al que mandar los eventos (def. ninguno: no se manda nada)
    AETHER_AGENT_ID       nombre de este equipo en los eventos (def. pi)
    AETHER_CELL_STREAM_FPS  cuadros por segundo del video (def. 10, 1 a 30)
    CELDA_HMI_CLAVE / CELDA_HMI_USUARIO   cuenta de la HMI (sin clave nadie inicia sesión)
    LINE_VISION_CAMERA_*  INDEX / BACKEND / FOURCC / WIDTH / HEIGHT (def. 0, v4l2, MJPG, 640x480)
"""

import logging
import os
import re
import threading
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

import cv2
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

import cell_hmi
from agent_camera import AgentCameraPublisher
from agent_contracts import AgentStatus, CameraStatus, InferenceStatus, LaptopStatus
from camera_publisher import camera_options
from cell_line import celda
from cell_routes import router as cell_router
from dataset_store import (
    CONFIANZA_MINIMA,
    CORTE_INTERNO,
    REPO_ROOT,
    clasificar_pieza,
    default_weights_file,
    read_class_names,
)
from lan_guard import host_is_lan, lan_networks
from line_model import DetectorOnnx
from observation_outbox import EventOutbox
from process_usage import process_usage
from settings import ConfigError, env_float, env_int, env_str, env_url

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("celda_agent")

cv2.setNumThreads(int(os.environ.get("LINE_CV_THREADS", "3")))

# cell_line.py da la cámara por apagada si pasan VISION_VIVA_S (2 s) sin análisis:
# la pausa no puede acercarse a eso.
ANALISIS_CADA_S = min(max(float(os.environ.get("LINE_ANALISIS_CADA_S", "0.5")), 0.1), 1.0)
MODELO = os.environ.get("LINE_MODEL") or str(default_weights_file().with_suffix(".onnx"))
IMGSZ = int(os.environ.get("LINE_IMGSZ", "320"))
VIGILAR_CADA_S = 5.0
PUBLICAR_EVENTOS_CADA_S = 1.0

try:
    AGENT_ID = env_str("AETHER_AGENT_ID", "pi")
    if not re.fullmatch(r"[a-z0-9_-]{1,32}", AGENT_ID):
        raise ConfigError(f"AETHER_AGENT_ID debe ser minúsculas, números, - o _ (máx. 32), no '{AGENT_ID}'.")
    LAPTOP_URL = env_url("AETHER_LAPTOP_URL")
    STREAM_FPS = env_float("AETHER_CELL_STREAM_FPS", 10.0, minimo=1.0, maximo=30.0)
    JPEG_QUALITY = env_int("AETHER_JPEG_QUALITY", 75, minimo=30, maximo=100)
except ConfigError as exc:
    raise SystemExit(f"Configuración inválida: {exc}") from exc

_opciones_camara = {"backend": "v4l2", "fourcc": "MJPG", "width": 640, "height": 480}
_opciones_camara.update({k: v for k, v in camera_options("LINE_VISION").items() if v is not None})


class AnalisisPeriodico:
    """Analiza un cuadro cada `cada_s` segundos y, en los demás, solo dibuja el último resultado.

    Así el video sale fluido sin que la Pi corra el modelo en cada cuadro. analizar(frame) devuelve lo que
    dibujar(frame, resultado) necesita; la pausa se cuenta desde que TERMINA el análisis anterior, así que
    si la Pi se atrasa no se acumula trabajo."""

    def __init__(self, analizar, dibujar, cada_s: float, reloj=time.monotonic):
        self._analizar, self._dibujar, self._cada_s, self._reloj = analizar, dibujar, cada_s, reloj
        self._resultado = None
        self._fin = None
        self.ms_last: float | None = None
        self.ms_avg: float | None = None
        self.analisis = 0

    def __call__(self, frame) -> None:
        if self._fin is None or self._reloj() - self._fin >= self._cada_s:
            t0 = self._reloj()
            self._resultado = self._analizar(frame)
            self._fin = self._reloj()
            ms = (self._fin - t0) * 1000.0
            self.ms_last = round(ms, 1)
            self.ms_avg = round(ms if self.ms_avg is None else 0.8 * self.ms_avg + 0.2 * ms, 1)
            self.analisis += 1
        if self._resultado is not None:
            self._dibujar(frame, self._resultado)

    def stats(self) -> dict:
        return {"ms_last": self.ms_last, "ms_avg": self.ms_avg}


_procesador: AnalisisPeriodico | None = None


def _crear_procesador():
    """Un detector, cargado una sola vez. PASS es "el nombre está en classes.txt",
    no una inspección de defecto (mismo criterio que main.py)."""
    global _procesador
    clases = read_class_names()
    detector = DetectorOnnx(MODELO, clases, imgsz=IMGSZ, corte=CORTE_INTERNO)

    def analizar(frame):
        detecciones = detector(frame)
        decision = clasificar_pieza([(n, c) for n, c, _ in detecciones], clases, peso_es_parts=True)
        if decision["respuesta"] == "SIN PIEZA":
            label, color, juicio = "SIN PIEZA", (0, 140, 255), "SIN_PIEZA"
        elif decision["resultado"] == "PASS":
            label, color, juicio = f"PIEZA REAL · {decision['nombre']} · PASS", (0, 200, 0), "PASS"
        else:
            label, color, juicio = "NO ES PIEZA REAL · FAIL", (0, 0, 220), "FAIL"
        celda.ver(juicio)  # una sola vez por análisis, igual que antes
        cajas = [(n, box) for n, c, box in detecciones if n in clases and c >= CONFIANZA_MINIMA]
        return cajas, label, color

    def dibujar(frame, resultado):
        cajas, label, color = resultado
        for nombre, (x1, y1, x2, y2) in cajas:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 200, 0), 2)
            cv2.putText(frame, nombre, (x1, max(16, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 0), 2)
        cv2.putText(frame, label, (24, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 3)

    _procesador = AnalisisPeriodico(analizar, dibujar, ANALISIS_CADA_S)
    return _procesador


publicador = AgentCameraPublisher(
    camera_index=int(os.environ.get("LINE_VISION_CAMERA_INDEX", "0")),
    make_processor=_crear_procesador,
    label="line-vision",
    jpeg_quality=JPEG_QUALITY,
    max_fps=STREAM_FPS,
    **_opciones_camara,
)

# ---------------------------------------------------------------- eventos hacia la laptop

_ARRANQUE = uuid.uuid4().hex[:8]  # la numeración de piezas reinicia con el proceso: el id lleva este sello
eventos = EventOutbox(
    url=f"{LAPTOP_URL}/line/cell/events" if LAPTOP_URL else None,
    build_body=lambda lote: {"v": 1, "source": AGENT_ID, "events": lote},
)


def evento_de_pieza(registro: dict) -> dict:
    """Un registro de celda.snapshot()["recent"] -> CellEvent del contrato (contracts/agents_api.md, sección 6)."""
    return {
        "v": 1,
        "event_id": f"{AGENT_ID}-{_ARRANQUE}-{registro['pieza']}",
        "timestamp": registro["timestamp"],
        "pieza": registro["pieza"],
        "juicio": registro["resultado"],
        "accion": registro["accion"],
    }


def _publicar_eventos():
    """Revisa cada segundo si la celda anotó piezas nuevas y las encola. No toca la celda: solo lee."""
    ultima = 0
    while not _parar.wait(PUBLICAR_EVENTOS_CADA_S):
        for registro in reversed(celda.snapshot()["recent"]):
            if registro["pieza"] > ultima:
                eventos.put(evento_de_pieza(registro))
                ultima = registro["pieza"]


# ---------------------------------------------------------------- ciclo de vida

_parar = threading.Event()
_error_arranque: str | None = None
_inicio = datetime.now(timezone.utc)
_uso: dict = {}


def _vigilar():
    """Si la cámara USB se cae, el publicador se detiene solo y la celda se queda
    ciega hasta reiniciar el proceso. Aquí se reabre."""
    global _error_arranque
    while not _parar.wait(VIGILAR_CADA_S):
        if publicador.is_running():
            continue
        logger.warning("La cámara de la celda dejó de entregar frames; reintentando.")
        try:
            publicador.unsubscribe()
            publicador.subscribe()
            _error_arranque = None
        except Exception as exc:  # sigue reintentando: puede ser un cable flojo
            logger.error("No reabrió la cámara: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _error_arranque
    eventos.start()
    try:
        publicador.subscribe()  # este suscriptor nunca se va: la celda opera sin video abierto
    except Exception as exc:
        # La página sigue sirviéndose: muestra "Cámara apagada" y /health dice por qué.
        _error_arranque = str(exc)
        logger.exception("La visión de la celda no arrancó.")
    threading.Thread(target=_vigilar, name="vigilar-camara", daemon=True).start()
    threading.Thread(target=_publicar_eventos, name="publicar-eventos", daemon=True).start()
    if not cell_hmi.clave_configurada():
        logger.warning("CELDA_HMI_CLAVE no está definida: nadie puede iniciar sesión, así que Arranque y Paro no responden.")
    logger.info(
        "Celda lista: un análisis cada %.2f s, video a %.0f FPS, modelo %s, %s, laptop %s",
        ANALISIS_CADA_S,
        STREAM_FPS,
        MODELO,
        "GPIO abiertos" if celda.salidas.abiertas else "sin GPIO: los pulsos NO se envían",
        LAPTOP_URL or "(ninguna)",
    )
    yield
    _parar.set()
    celda.set_running(False)  # apaga los dos relevadores
    publicador.unsubscribe()
    eventos.stop()


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def solo_red_local(request: Request, call_next):
    host = request.client.host if request.client else ""
    if not host_is_lan(host, lan_networks()):
        return JSONResponse(status_code=403, content={"detail": "Solo red local."})
    return await call_next(request)


app.include_router(cell_router)


@app.get("/health")
def health():
    return {"status": "ok" if _error_arranque is None else "error", "error": _error_arranque}


@app.get("/status")
def status():
    stats = publicador.stats()
    proc = _procesador.stats() if _procesador is not None else {}
    error = _error_arranque or publicador.last_error
    abierta = bool(stats["open"])
    return AgentStatus(
        agent_id=AGENT_ID,
        role="cell",
        state="error" if (error and not abierta) else "running" if abierta else "starting",
        started_at=_inicio,
        error=error,
        camera=CameraStatus(**{k: stats[k] for k in ("open", "fps_camera", "fps_delivery", "width", "height")}),
        inference=InferenceStatus(model=Path(MODELO).name, mode="sync", ms_last=proc.get("ms_last"), ms_avg=proc.get("ms_avg")),
        laptop=LaptopStatus(
            url=LAPTOP_URL or None,
            reachable=eventos.reachable,
            outbox_len=len(eventos),
            sent_total=eventos.sent_total,
            dropped_total=eventos.dropped_total,
            last_error=eventos.last_error,
        ),
        resources=process_usage(_uso),
    ).model_dump(mode="json")


def _stream():
    try:
        publicador.subscribe()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    def generate():
        try:
            yield from publicador.stream_frames()
        finally:
            publicador.unsubscribe()

    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/line/vision/stream")  # la ruta que ya usa celda.html
def line_vision_stream():
    return _stream()


@app.get("/stream")  # la ruta del contrato de agentes (contracts/agents_api.md)
def stream():
    return _stream()


# Al final: las rutas de arriba se emparejan primero (mismo orden que main.py).
app.mount("/", StaticFiles(directory=REPO_ROOT / "dashboard", html=True), name="dashboard")
