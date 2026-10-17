"""Punto de entrada mínimo del backend.

Confirma que el servidor FastAPI arranca y responde, expone Declared
Inventory (cargado a la base de datos vía backend/scripts/load_from_edge.py)
de solo lectura, y sirve el dashboard estático (dashboard/) en la raíz —
mismo origen, sin CORS (Decisión 7, Opción B).
"""

import json
import logging
import os
import re
import subprocess
import sys
import threading
import time
import unicodedata
import urllib.error
import urllib.request
from collections import deque
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path

from fastapi import Cookie, FastAPI, HTTPException, Response, WebSocket, WebSocketDisconnect
from fastapi.exception_handlers import http_exception_handler
from fastapi.responses import JSONResponse, RedirectResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import cell_hmi
from cell_line import celda
from camera_publisher import CameraPublisher
from dataset_store import (
    CONFIANZA_MINIMA,
    CORTE_INTERNO,
    DuplicateSample,
    add_class,
    clasificar_pieza,
    pesos_entorno,
    pesos_piezas,
    read_class_names,
    save_sample,
    snapshot,
)
from db.database import SessionLocal, init_db
from db.models import DeclaredEntry, DeclaredEntryHistory
from inventory_refresh import InventoryRefreshLoop
from logging_config import setup_logging

DASHBOARD_DIR = Path(__file__).resolve().parent.parent / "dashboard"

from dotenv import load_dotenv  # noqa: E402

load_dotenv(Path(__file__).resolve().parent / ".env")  # backend/.env (gitignored)

from lumina_desktop import auth_url, essay_mark_ready, essay_status, handle_desktop, start_callback_server, spotify_status  # noqa: E402

# Traba simple contra clics accidentales en PATCH /inventory/{identifier}/retire
# — NO es un sistema de autenticación/autorización real: no hay usuarios, ni
# sesiones, ni roles, y la misma contraseña sirve para cualquiera que la
# tenga. Un sistema de permisos real (usuarios, roles, quién retiró qué)
# queda pendiente como decisión futura explícita, no se fabrica aquí
# (Principio 4.5, aether_context_docs.md). El valor por defecto "aether-dev"
# es solo para desarrollo local; en cualquier despliegue real esta variable
# debe configurarse por entorno (ADMIN_ACTION_PASSWORD), nunca quedarse en
# el default.
ADMIN_ACTION_PASSWORD = os.environ.get("ADMIN_ACTION_PASSWORD", "aether-dev")

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    try:
        start_callback_server()
    except Exception:
        logger.exception("No pude abrir el callback de Spotify.")
    logger.info("Servidor backend iniciado.")
    yield


app = FastAPI(lifespan=lifespan)


@app.exception_handler(Exception)
async def _unhandled(request, exc: Exception):
    if isinstance(exc, HTTPException):
        return await http_exception_handler(request, exc)
    logger.exception("Error no controlado")
    return JSONResponse(status_code=500, content={"detail": "Error interno"})


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/inventory")
def get_inventory(include_retired: bool = False):
    """Devuelve las filas de Declared Inventory — sin estado de cobertura
    todavía (ver docstring de edge/inventory_engine/aggregate_observations.py).

    Por defecto solo devuelve entradas con status "active": un identifier se
    marca "retired" únicamente por decisión humana explícita, vía
    PATCH /inventory/{identifier}/retire — nunca de forma automática porque
    haya dejado de aparecer en una corrida de load_from_edge.py (no hay
    forma de saber hoy si esa corrida cubrió todo el piso o solo una parte,
    ver comentario en backend/db/models/declared_entry.py). Pasa
    include_retired=true para ver también las entradas retiradas.
    """
    session = SessionLocal()
    try:
        query = session.query(DeclaredEntry)
        if not include_retired:
            query = query.filter(DeclaredEntry.status == "active")
        entries = query.all()
        return [
            {
                "identifier": entry.identifier,
                "detected_class": entry.detected_class,
                "total_observations": entry.total_observations,
                "code_read_count": entry.code_read_count,
                "avg_confidence": entry.avg_confidence,
                "first_seen": entry.first_seen,
                "last_seen": entry.last_seen,
                "location_counts": entry.location_counts,
                "status": entry.status,
            }
            for entry in entries
        ]
    finally:
        session.close()


class RetireRequest(BaseModel):
    """Cuerpo de PATCH /inventory/{identifier}/retire — ver ADMIN_ACTION_PASSWORD
    arriba sobre qué protección da (y qué no da) esta contraseña."""

    password: str


@app.patch("/inventory/{identifier}/retire")
def retire_inventory_entry(identifier: str, body: RetireRequest):
    """Marca una entrada de Declared Inventory como "retired".

    Única forma de que un identifier deje de contar como inventario activo
    en GET /inventory (corrección de diseño sobre Decisión 5): requiere esta
    llamada explícita, hecha por una persona. Nunca ocurre automáticamente
    por ausencia en una corrida de load_from_edge.py — ver el comentario en
    backend/db/models/declared_entry.py sobre por qué (Principio 4.1,
    aether_context_docs.md sección 4.1: no fabricar una garantía de
    cobertura que el sistema todavía no puede respaldar).

    Retirar es un cambio de estado, no un borrado: la fila sigue existiendo
    y sigue siendo consultable vía GET /inventory?include_retired=true — el
    historial nunca se pierde.

    Requiere ADMIN_ACTION_PASSWORD en el cuerpo de la petición (ver
    comentario junto a esa constante sobre el alcance real de esta traba).
    """
    if body.password != ADMIN_ACTION_PASSWORD:
        raise HTTPException(status_code=403, detail="Contraseña incorrecta.")

    session = SessionLocal()
    try:
        entry = session.get(DeclaredEntry, identifier)
        if entry is None:
            raise HTTPException(
                status_code=404,
                detail=f"No existe Declared Inventory con identifier '{identifier}'.",
            )
        entry.status = "retired"
        session.commit()
        return {"identifier": entry.identifier, "status": entry.status}
    finally:
        session.close()


@app.get("/inventory/history")
def get_inventory_history():
    """Devuelve la bitácora completa de inspecciones (Decisión 7): todas las
    filas de DeclaredEntryHistory, más recientes primero. Nunca se
    sobrescribe — cada corrida de load_from_edge.py agrega filas nuevas."""
    session = SessionLocal()
    try:
        rows = (
            session.query(DeclaredEntryHistory)
            .order_by(DeclaredEntryHistory.recorded_at.desc())
            .all()
        )
        return [
            {
                "id": row.id,
                "identifier": row.identifier,
                "detected_class": row.detected_class,
                "total_observations": row.total_observations,
                "code_read_count": row.code_read_count,
                "avg_confidence": row.avg_confidence,
                "first_seen": row.first_seen,
                "last_seen": row.last_seen,
                "location_counts": row.location_counts,
                "recorded_at": row.recorded_at,
            }
            for row in rows
        ]
    finally:
        session.close()


# ============================================================================
# GET /perception/stream y GET /line/vision/stream — MODO DEMO DE
# ESCRITORIO, no arquitectura de producción real.
#
# En el sistema real, la percepción (cámara + YOLO + código de barras/QR +
# ArUco) vive en edge/, corriendo en el Jetson Orin Nano Super (Decisión 4),
# separado físicamente del backend. Estos endpoints existen SOLO porque hoy
# no hay Jetson: abren la cámara de la misma laptop donde corre este
# servidor y transmiten el pipeline en vivo, para poder demostrar el
# sistema funcionando desde una sola máquina mientras no exista el hardware
# real. No reemplazan ni contradicen la Decisión 6 (MQTT para telemetría) —
# no es telemetría, es una vista de cámara ad hoc para demo, y no la
# consume ningún otro componente del sistema.
#
# La lógica de detección de abajo es una COPIA ADAPTADA de
# edge/perception/test_combined.py (mismo pipeline: YOLO detecta, pyzbar lee
# código dentro de cada caja, ArUco localiza el frame completo) — no una
# extracción a un módulo compartido, a propósito: edge/ sigue siendo la
# única fuente de verdad real para cuando el Jetson exista, y este archivo
# no debe importar de edge/ ni viceversa (son procesos y máquinas distintas
# en producción). Si el pipeline real cambia, esta copia puede quedar
# desactualizada — está bien, es demo, no el sistema de percepción real.
#
# Percepción (Aether Inventory) y visión de línea (Decisión 8c) son dos
# sistemas de visión distintos en producción real: la cámara del robot móvil
# vive en el Jetson, la cámara de verificación de línea es una cámara física
# dedicada en la celda de manufactura — nunca el mismo dispositivo. En esta
# demo de una sola laptop, por defecto ambos índices apuntan a la única
# cámara que probablemente exista en la máquina (0) — de ahí la nota de "no
# actives los dos streams a la vez" en el dashboard —, pero cada uno es
# configurable por su propia variable de entorno: si el equipo conecta una
# segunda cámara USB, puede separarlas de verdad (ej.
# LINE_VISION_CAMERA_INDEX=1) y correr ambos streams al mismo tiempo sin que
# se estorben.
#
# CameraPublisher (backend/camera_publisher.py) resuelve un problema real
# encontrado probando el dashboard: antes, cada conexión HTTP a un stream
# abría su propio
# cv2.VideoCapture — si dos clientes se conectaban al mismo stream a la vez
# (dos pestañas, o el dashboard más una futura interfaz del robot móvil),
# competían por el mismo dispositivo físico. Ahora hay un solo "publicador"
# en segundo plano por cámara (uno para Percepción, otro para Visión de
# línea — siguen siendo dos sistemas independientes, esto no los mezcla):
# abre la cámara UNA sola vez cuando el primer cliente se conecta, la
# procesa continuamente, y cada cliente HTTP solo lee el frame ya procesado
# más reciente desde memoria compartida. Se apaga solo cuando el último
# cliente se desconecta — nunca se queda corriendo sin que nadie esté
# viendo nada.
# ============================================================================

PERCEPTION_CAMERA_INDEX = int(os.environ.get("PERCEPTION_CAMERA_INDEX", "0"))
LINE_VISION_CAMERA_INDEX = int(os.environ.get("LINE_VISION_CAMERA_INDEX", "0"))

# Dos modelos, cada uno cargado una sola vez y solo cuando una cámara arranca.
# El del entorno (yolov8n) sigue nombrando persona, silla y lo demás.
# parts.pt solo dice si eso es una pieza registrada. No se sustituyen.
_yolo_model = None
_parts_model = None
_yolo_model_lock = threading.Lock()


# Oyentes de cada detección real de Percepción, sin abrir un segundo
# consumidor de la cámara — hoy solo el auto-refresh de Declared Inventory
# (Decisión 9, ADR 0009) se suscribe aquí, pero cualquier otro consumidor
# futuro que necesite las detecciones crudas (no solo el JPEG dibujado)
# podría hacer lo mismo sin competir por la cámara física.
_perception_observation_sinks: list = []
_perception_observation_sinks_lock = threading.Lock()


def _notify_perception_observation_sinks(observation: dict) -> None:
    with _perception_observation_sinks_lock:
        sinks = list(_perception_observation_sinks)
    for sink in sinks:
        sink(observation)


# Últimas detecciones reales de Percepción, para GET /perception/recent-
# detections (pensado para el panel de registro de dashboard/robot.html).
# A diferencia del sink del auto-refresh (que se añade/quita junto con el
# loop, ver inventory_refresh.py), este vive permanentemente registrado
# desde que arranca el servidor: si nadie está suscrito al publicador de
# Percepción en este momento (ni la demo, ni el auto-refresh, ni
# robot.html), simplemente no llegan frames que procesar y el buffer deja
# de crecer — no se fabrica actividad que no ocurrió.
_recent_detections = deque(maxlen=50)
_recent_detections_lock = threading.Lock()


def _record_recent_detection(observation: dict) -> None:
    with _recent_detections_lock:
        _recent_detections.append(observation)


_perception_observation_sinks.append(_record_recent_detection)


def _load_yolo(weights: str):
    from ultralytics import YOLO

    model = YOLO(weights)
    logger.info("Modelo YOLO '%s' cargado para el modo demo.", weights)
    return model


def _get_yolo_model():
    """Detector del entorno. No usa parts.pt."""
    global _yolo_model
    if _yolo_model is None:
        with _yolo_model_lock:
            if _yolo_model is None:
                _yolo_model = _load_yolo(pesos_entorno())
    return _yolo_model


def _get_parts_model():
    """None hasta que exista parts.pt. False en caché significa que se buscó y no está."""
    global _parts_model
    if _parts_model is None:
        with _yolo_model_lock:
            if _parts_model is None:
                weights = pesos_piezas()
                _parts_model = False if weights is None else _load_yolo(weights)
    return _parts_model or None


def _make_perception_processor():
    """Arma el pipeline real de Percepción (YOLO + pyzbar + ArUco) una sola
    vez — mismo dibujo (cajas verdes + clase, texto amarillo del código
    leído, contorno + ID de ArUco) que edge/perception/test_combined.py.

    Además de dibujar, empaqueta cada detección como una Observation (mismo
    esquema de campos que edge/inventory_engine/observations/observation.py
    — timestamp, detected_class, code_data, code_read, confidence,
    location_marker_id — como dict plano, no el dataclass: este archivo no
    debe importar de edge/, ver el comentario grande de arriba) y la manda
    a quien esté escuchando vía _notify_perception_observation_sinks — hoy
    solo el auto-refresh de inventario (Decisión 9), sin costo si nadie
    está suscrito. El modelo es el del entorno, no parts.pt, para que el
    nombre de clase siga disponible cuando se agregue la detección de
    obstáculos."""
    import cv2
    from pyzbar.pyzbar import decode

    model = _get_yolo_model()
    aruco_dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    aruco_detector = cv2.aruco.ArucoDetector(aruco_dictionary, cv2.aruco.DetectorParameters())

    def process(frame):
        aruco_corners, aruco_ids, _ = aruco_detector.detectMarkers(frame)
        location_marker_id = int(aruco_ids.flatten()[0]) if aruco_ids is not None else None
        if aruco_ids is not None:
            cv2.aruco.drawDetectedMarkers(frame, aruco_corners, aruco_ids)

        results = model(frame, verbose=False)
        for box in results[0].boxes:
            x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
            class_name = model.names[int(box.cls[0])]
            confidence = float(box.conf[0])

            crop = frame[y1:y2, x1:x2]
            codes = decode(crop) if crop.size > 0 else []
            data = codes[0].data.decode("utf-8") if codes else None

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(
                frame,
                class_name,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2,
            )
            if data:
                cv2.putText(
                    frame,
                    data,
                    (x1, y2 + 20),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 0),
                    2,
                )

            _notify_perception_observation_sinks(
                {
                    "timestamp": datetime.now(UTC).isoformat(),
                    "detected_class": class_name,
                    "code_data": data,
                    "code_read": bool(codes),
                    "confidence": confidence,
                    "location_marker_id": location_marker_id,
                }
            )

    return process


def _draw_deteccion(frame, box, nombre, color):
    import cv2

    x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    cv2.putText(frame, nombre, (x1, max(16, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)


def _make_line_vision_processor():
    """Letrero de la cámara de línea.

    El modelo del entorno dibuja lo que hay alrededor, con su nombre.
    parts.pt, si existe, decide aparte si eso es una pieza registrada:
    PIEZA REAL (PASS), NO ES PIEZA REAL (FAIL) o SIN PIEZA. PASS es
    "el nombre está en classes.txt", no una inspección de defecto.
    Sin parts.pt no se llama pieza a una silla ni a una persona.

    PASS y FAIL se entregan a la celda real. SIN PIEZA no pulsa nada.
    """
    import cv2

    entorno = _get_yolo_model()
    piezas = _get_parts_model()
    clases = read_class_names()

    def process(frame):
        entorno_results = entorno(frame, verbose=False)
        for box in entorno_results[0].boxes:
            _draw_deteccion(frame, box, entorno.names[int(box.cls[0])], (180, 180, 180))

        if piezas is None:
            hay_entorno = len(entorno_results[0].boxes) > 0
            label = "ENTORNO" if hay_entorno else "SIN PIEZA"
            color = (180, 180, 180) if hay_entorno else (0, 140, 255)
            celda.ver("SIN_PIEZA")
        else:
            part_results = piezas(frame, verbose=False, conf=CORTE_INTERNO)
            detecciones = []
            for box in part_results[0].boxes:
                nombre = piezas.names[int(box.cls[0])]
                confianza = float(box.conf[0])
                detecciones.append((nombre, confianza))
                if nombre in clases and confianza >= CONFIANZA_MINIMA:
                    _draw_deteccion(frame, box, nombre, (0, 200, 0))
            decision = clasificar_pieza(detecciones, clases, peso_es_parts=True)
            if decision["respuesta"] == "SIN PIEZA":
                label, color = "SIN PIEZA", (0, 140, 255)
                celda.ver("SIN_PIEZA")
            elif decision["resultado"] == "PASS":
                label = f"PIEZA REAL · {decision['nombre']} · PASS"
                color = (0, 200, 0)
                celda.ver("PASS")
            else:
                label, color = "NO ES PIEZA REAL · FAIL", (0, 0, 220)
                celda.ver("FAIL")
        cv2.putText(frame, label, (24, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 3)

    return process


_perception_publisher = CameraPublisher(
    camera_index=PERCEPTION_CAMERA_INDEX,
    make_processor=_make_perception_processor,
    label="perception",
)
_line_vision_publisher = CameraPublisher(
    camera_index=LINE_VISION_CAMERA_INDEX,
    make_processor=_make_line_vision_processor,
    label="line-vision",
)


# ============================================================================
# POST/GET /inventory/auto-refresh/* — Decisión 9 (ADR 0009): auto-refresh de
# Declared Inventory. Versión reducida y parcial de la Opción C de la
# Decisión 7 (monitoreo en vivo) — automatiza SOLO el refresco del
# inventario ya calculado, reusando la misma tubería manual de siempre
# (percepción → agregación → carga) con un temporizador en vez de una
# persona. No es telemetría en vivo del robot (eso sigue diferido).
#
# La captura se hace suscribiéndose al _perception_publisher YA EXISTENTE
# (arriba) en vez de abrir un tercer cv2.VideoCapture aparte — exactamente
# el problema que CameraPublisher existe para resolver: este loop y el
# botón de demo interactiva de Percepción pueden estar activos al mismo
# tiempo sin competir por la cámara física.
# ============================================================================

DEFAULT_REFRESH_INTERVAL_SECONDS = float(os.environ.get("INVENTORY_REFRESH_INTERVAL_SECONDS", "20"))

EDGE_ROOT = Path(__file__).resolve().parent.parent / "edge"
OBSERVATIONS_OUTPUT_PATH = EDGE_ROOT / "perception" / "observations_output.json"

_refresh_observations_lock = threading.Lock()
_refresh_observations_buffer: list[dict] = []


def _refresh_sink(observation: dict) -> None:
    with _refresh_observations_lock:
        _refresh_observations_buffer.append(observation)


def _refresh_drain_observations() -> list[dict]:
    with _refresh_observations_lock:
        batch = list(_refresh_observations_buffer)
        _refresh_observations_buffer.clear()
    return batch


def _refresh_begin_capture() -> None:
    with _perception_observation_sinks_lock:
        _perception_observation_sinks.append(_refresh_sink)
    _perception_publisher.subscribe()


def _refresh_end_capture() -> None:
    _perception_publisher.unsubscribe()
    with _perception_observation_sinks_lock:
        if _refresh_sink in _perception_observation_sinks:
            _perception_observation_sinks.remove(_refresh_sink)


def _resolve_edge_python() -> str:
    """Ruta al intérprete de edge/.venv — mismo patrón que
    scripts/refresh_inventory.py, duplicado aquí a propósito: ese script no
    es un paquete importable, y este archivo tampoco debe importar de
    edge/ (ver el comentario grande sobre por qué, arriba)."""
    windows_python = EDGE_ROOT / ".venv" / "Scripts" / "python.exe"
    if windows_python.exists():
        return str(windows_python)
    unix_python = EDGE_ROOT / ".venv" / "bin" / "python"
    if unix_python.exists():
        return str(unix_python)
    raise RuntimeError(f"No se encontró el intérprete de edge/.venv (probado en {windows_python}).")


def _refresh_run_pipeline_step(observations: list[dict]) -> None:
    """Escribe las Observations acumuladas en esta ventana al mismo archivo
    que ya usa el flujo manual, y corre los mismos dos pasos finales que
    scripts/refresh_inventory.py — agregación (edge/.venv) y carga
    (backend/.venv, este mismo intérprete vía sys.executable). La única
    diferencia real con el flujo manual es de dónde vienen las Observations:
    aquí, del publicador de Percepción ya compartido; ahí, de abrir la
    cámara aparte."""
    OBSERVATIONS_OUTPUT_PATH.write_text(json.dumps(observations, indent=2), encoding="utf-8")

    aggregate_script = EDGE_ROOT / "inventory_engine" / "aggregate_observations.py"
    result = subprocess.run(
        [_resolve_edge_python(), str(aggregate_script)],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"aggregate_observations.py falló: {result.stderr.strip()}")

    load_script = Path(__file__).resolve().parent / "scripts" / "load_from_edge.py"
    result = subprocess.run(
        [sys.executable, str(load_script)], capture_output=True, text=True, check=False
    )
    if result.returncode != 0:
        raise RuntimeError(f"load_from_edge.py falló: {result.stderr.strip()}")


_inventory_refresh_loop = InventoryRefreshLoop(
    begin_capture=_refresh_begin_capture,
    end_capture=_refresh_end_capture,
    drain_observations=_refresh_drain_observations,
    run_pipeline_step=_refresh_run_pipeline_step,
)


class AutoRefreshStartRequest(BaseModel):
    """Cuerpo opcional de POST /inventory/auto-refresh/start."""

    interval_seconds: float | None = None


@app.post("/inventory/auto-refresh/start")
def start_inventory_auto_refresh(body: AutoRefreshStartRequest | None = None):
    """Inicia el loop de auto-refresh (Decisión 9) — no hace nada si ya
    estaba activo (no reinicia el intervalo a media marcha; para cambiarlo,
    detenlo primero)."""
    interval = (body.interval_seconds if body else None) or DEFAULT_REFRESH_INTERVAL_SECONDS
    if interval <= 0:
        raise HTTPException(status_code=422, detail="interval_seconds debe ser mayor a 0.")
    _inventory_refresh_loop.start(interval)
    return _refresh_status_payload()


@app.post("/inventory/auto-refresh/stop")
def stop_inventory_auto_refresh():
    """Detiene el loop de auto-refresh y libera la cámara si nadie más la
    está usando (ej. la demo interactiva de Percepción sigue activa)."""
    _inventory_refresh_loop.stop()
    return _refresh_status_payload()


@app.get("/inventory/auto-refresh/status")
def get_inventory_auto_refresh_status():
    """Estado del loop para que el dashboard lo etiquete honestamente:
    "captura continua de ESTA cámara", nunca "inventario en tiempo real del
    piso completo" (ver ADR 0009)."""
    return _refresh_status_payload()


def _refresh_status_payload() -> dict:
    status = _inventory_refresh_loop.status
    return {
        "active": status.active,
        "interval_seconds": status.interval_seconds,
        "last_run_at": status.last_run_at,
        "last_run_observation_count": status.last_run_observation_count,
        "last_error": status.last_error,
    }


@app.get("/perception/stream")
def perception_stream():
    """Stream MJPEG del pipeline de percepción (YOLO + código + ArUco) sobre
    la cámara local — modo demo de escritorio, ver comentario grande arriba.

    Se suscribe al publicador compartido AQUÍ, antes de devolver la
    respuesta: si la cámara no se puede abrir, responde 503 con un detalle
    claro en vez de dejar que el servidor truene o que el stream arranque a
    medias. Varios clientes pueden suscribirse al mismo tiempo sin volver a
    tocar la cámara física.
    """
    try:
        _perception_publisher.subscribe()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    def generate():
        try:
            yield from _perception_publisher.stream_frames()
        finally:
            _perception_publisher.unsubscribe()

    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/perception/recent-detections")
def get_recent_perception_detections(limit: int = 10):
    """Últimas detecciones reales de Percepción, más recientes primero —
    para el panel de registro de dashboard/robot.html (la interfaz del
    robot móvil). Devuelve una lista vacía si nadie está viendo la cámara
    de Percepción en este momento (ni la demo, ni el auto-refresh, ni
    robot.html) — no se fabrica actividad que no ocurrió."""
    limit = max(1, min(limit, 50))
    with _recent_detections_lock:
        snapshot = list(_recent_detections)
    return list(reversed(snapshot))[:limit]


@app.get("/line/vision/stream")
def line_vision_stream():
    """Stream MJPEG de confirmación binaria para la estación de Visión de la
    línea de manufactura — modo demo, ver comentario grande arriba. Misma
    disciplina que /perception/stream: se suscribe antes de responder, y un
    fallo al abrir la cámara da 503 en vez de tronar el servidor."""
    try:
        _line_vision_publisher.subscribe()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    def generate():
        try:
            yield from _line_vision_publisher.stream_frames()
        finally:
            _line_vision_publisher.unsubscribe()

    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame")


# ============================================================================
# GET /line/cell/status — piezas reales de la cámara de línea.
# Los pulsos salen en cell_line.py. Sin GPIO la pieza se anota y no se finge
# que el pistón o la banda se movieron.
# ============================================================================


class CellRunBody(BaseModel):
    on: bool


class CellLoginBody(BaseModel):
    user: str
    password: str


def _cell_payload() -> dict:
    snap = celda.snapshot()
    snap["alarms"] = cell_hmi.observe(snap)
    return snap


def _cell_who(token: str | None) -> dict:
    who = cell_hmi.read_token(token)
    if not who:
        raise HTTPException(status_code=401, detail="hace falta iniciar sesión en la celda")
    return who


@app.get("/line/cell/status")
def line_cell_status():
    return _cell_payload()


@app.post("/line/cell/session")
def line_cell_login(body: CellLoginBody, response: Response):
    token = cell_hmi.login(body.user, body.password)
    if not token:
        raise HTTPException(status_code=401, detail="cuenta rechazada")
    response.set_cookie("celda_session", token, httponly=True, samesite="lax", path="/")
    return cell_hmi.read_token(token)


@app.get("/line/cell/session")
def line_cell_session(celda_session: str | None = Cookie(default=None)):
    return _cell_who(celda_session)


@app.delete("/line/cell/session")
def line_cell_logout(response: Response):
    response.delete_cookie("celda_session", path="/")
    return {"ok": True}


@app.post("/line/cell/run")
def line_cell_run(body: CellRunBody, celda_session: str | None = Cookie(default=None)):
    _cell_who(celda_session)
    celda.set_running(body.on)
    return _cell_payload()


@app.post("/line/cell/alarms/ack")
def line_cell_ack(celda_session: str | None = Cookie(default=None)):
    _cell_who(celda_session)
    return {"alarms": cell_hmi.ack()}


@app.post("/line/cell/alarms/clear")
def line_cell_clear(celda_session: str | None = Cookie(default=None)):
    who = _cell_who(celda_session)
    if not cell_hmi.can_clear(who["role"]):
        raise HTTPException(status_code=403, detail="solo ingeniería borra el histórico")
    return {"alarms": cell_hmi.clear()}


# ============================================================================
# POST /robot/ask — "Lumina" conversa por texto (Ollama, modelo local),
# consumido por dashboard/robot.html en su Modo Conversación.
#
# EXCLUSIÓN MUTUA POR DISEÑO DE RECURSOS, no solo preferencia de UX: en el
# Jetson Orin Nano Super real (Decisión 4), correr un LLM (este endpoint) y
# el pipeline de Percepción (YOLO + ArUco + pyzbar, los publicadores de
# arriba) AL MISMO TIEMPO degradaría a ambos — es un solo dispositivo de
# borde con un presupuesto de cómputo fijo, no dos GPUs independientes.
# robot.html por eso implementa Modo Conversación (este endpoint activo,
# cámara/YOLO apagados) y Modo Cámara (cámara/YOLO activos, este endpoint
# nunca se llama) como dos modos MUTUAMENTE EXCLUYENTES: nunca ambos a la
# vez. Esa exclusión mutua —no una casualidad de la interfaz— es lo que
# hace viable portar esta función de conversación al hardware final sin
# comprarle al robot un segundo cómputo de borde solo para el LLM.
#
# Corre contra Ollama LOCAL (http://localhost:11434), nunca un servicio en
# la nube: mismo principio de "el robot funciona standalone" que ya aplica
# al resto del sistema. Si Ollama no está corriendo o el modelo no está
# descargado, responde 503 con un detalle claro — nunca inventa una
# respuesta de Lumina cuando el modelo real no respondió (Principio 4.1).
# ============================================================================

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

# Tope duro de tokens generados — pedir brevedad en el texto del prompt
# ("una sola oración") no bastó en la práctica: un modelo de 1B no lo
# respeta de forma confiable. num_predict SÍ limita duro cuántos tokens
# genera Ollama, sin importar qué tan bien siga la instrucción de texto.
#
# 60 se eligió probando de verdad contra el Ollama de esta máquina (no
# adivinado): con 40, una respuesta real se cortó a media palabra
# ("...producción automot"). Con 60 el corte también puede caer a media
# palabra o a medio pensamiento en algunas respuestas, pero en todas las
# pruebas reales hechas a este valor el modelo ya había completado al menos
# una oración entera antes del corte — suficiente para _clean_llm_answer()
# de abajo, que es la garantía real de que nunca se hable una respuesta a
# medias.
OLLAMA_NUM_PREDICT = int(os.environ.get("OLLAMA_NUM_PREDICT", "60"))

# `+` en el patrón trata "..." como un solo cierre de oración, no tres.
_SENTENCE_END_PATTERN = re.compile(r"[.!?…]+")

# Frases reales de meta-comentario vistas probando contra el Ollama de esta
# máquina: el modelo a veces contesta bien y LUEGO agrega una oración que
# cita sus propias instrucciones en voz alta en vez de responder algo real
# (ej. "...responder con honestidad y ternura" es texto literal de
# LUMINA_SYSTEM_PROMPT, no una respuesta). Lista curada a mano sobre casos
# reales observados, no exhaustiva — cubre las variantes de "hablar de mis
# propias instrucciones" vistas hasta ahora; si aparece una nueva variante
# en pruebas futuras, se agrega aquí.
_META_COMMENTARY_PATTERNS = [
    re.compile(r"instruccion", re.IGNORECASE),
    re.compile(r"honestidad y ternura", re.IGNORECASE),
    re.compile(r"estoy aqu[ií] para escuchar", re.IGNORECASE),
    re.compile(r"respond(?:o|er) con honestidad", re.IGNORECASE),
    re.compile(r"te escucho con ternura", re.IGNORECASE),
]


# Bug real encontrado probando: preguntado por specs de hardware ("¿Cuántos
# sensores tiene el robot?"), el modelo respondió con una lista de viñetas
# con datos INVENTADOS ("Un sensor de infrarrojo...", "Dos cámaras..."), y
# como una lista con guiones no tiene ningún punto, _split_into_sentences()
# no encontraba ningún cierre de oración y dejaba pasar la respuesta
# COMPLETA sin filtrar — ni el recorte por token, ni el filtro de
# meta-comentario, la tocaban. Se detecta y descarta este formato de raíz,
# en vez de tratar cada línea como su propia "oración": una lista tampoco
# es apropiada para decirse en voz alta (Lumina responde en UNA oración
# hablada, no una enumeración leída), así que no hay nada que "salvar" de
# una respuesta así — se reemplaza por una respuesta honesta genérica en
# vez de intentar recuperar contenido de un formato que de por sí no debía
# haber salido. Se exige al menos 2 líneas con pinta de viñeta/numeración
# para no disparar con un guion suelto usado como puntuación normal dentro
# de una oración (ej. "una fábrica — como Aether — automatiza...").
_LIST_LINE_PATTERN = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s+", re.MULTILINE)
_LIST_FORMAT_FALLBACK_ANSWER = (
    "No tengo esa información con exactitud ahora mismo, pero con gusto hablamos de otra cosa."
)


def _looks_like_list(text: str) -> bool:
    return len(_LIST_LINE_PATTERN.findall(text)) >= 2


def _split_into_sentences(text: str) -> list[str]:
    """Divide `text` en sus oraciones ya CERRADAS (mismo signo de cierre que
    _SENTENCE_END_PATTERN). Cualquier resto después del último cierre —una
    oración a medias, por corte de num_predict o por una respuesta atípica—
    se descarta: es el mismo criterio que antes evitaba hablar una
    respuesta incompleta, solo que ahora aplicado por oración en vez de
    recortar todo el texto de una vez."""
    sentences = []
    cursor = 0
    for match in _SENTENCE_END_PATTERN.finditer(text):
        sentence = text[cursor : match.end()].strip()
        if sentence:
            sentences.append(sentence)
        cursor = match.end()
    return sentences


def _is_meta_commentary(sentence: str) -> bool:
    return any(pattern.search(sentence) for pattern in _META_COMMENTARY_PATTERNS)


def _clean_llm_answer(text: str) -> str:
    """Limpia la respuesta de Ollama en dos pasos.

    Primero descarta de raíz un formato de lista (ver _looks_like_list) —
    nunca apropiado para hablarse en voz alta y el caso real donde se coló
    una fabricación completa de specs de hardware sin filtrar.

    Si no es una lista, quita QUIRÚRGICAMENTE las oraciones de
    meta-comentario, en vez de quedarse solo con la primera oración a secas
    — ese enfoque anterior sí evitaba el eco de instrucciones, pero de paso
    también recortaba respuestas legítimas de más de una oración a algo
    demasiado corto/vago (ej. "Estoy aquí." como toda la respuesta a
    "¿qué puedes hacer?"). Aquí se conservan TODAS las oraciones reales,
    completas, en el orden en que vinieron — solo se descartan las que
    coinciden con _META_COMMENTARY_PATTERNS. Si no queda ninguna oración
    real después de filtrar (raro, pero posible si el modelo solo generó
    meta-comentario), se cae a la primera oración cerrada tal cual, como
    último recurso — mejor eso que devolver una respuesta vacía."""
    if _looks_like_list(text):
        return _LIST_FORMAT_FALLBACK_ANSWER

    sentences = _split_into_sentences(text)
    if not sentences:
        return text

    real_sentences = [s for s in sentences if not _is_meta_commentary(s)]
    if real_sentences:
        return " ".join(real_sentences)
    return sentences[0]


# Texto exacto acordado para la personalidad de Lumina — no se parafrasea
# aquí. Versión anterior de este prompt no anclaba al modelo a ningún dato
# real del proyecto (solo describía el tono a usar), y probando de verdad
# se confirmó el efecto: sin nada concreto de qué hablar, el modelo
# inventaba contenido genérico de negocios ("fuente cerrada y exclusiva de
# suministros") para llenar el vacío. Esta versión le da los hechos reales
# de Aether (percepción con YOLO/códigos/ArUco, Declared Inventory, y que
# la línea de manufactura con banda transportadora, fixtures y pistón de
# expulsión de scrap (ADR 0010) es hardware PLANEADO, no construido
# todavía) para que tenga algo verdadero en qué anclarse en vez
# de fabricar una historia — sigue pidiendo honestidad explícita
# ("nunca inventes") para lo que quede fuera de esos hechos.
LUMINA_SYSTEM_PROMPT = (
    "Eres Lumina, el robot móvil de Aether, un proyecto real de "
    "automatización industrial construido por un equipo de 6 estudiantes "
    "universitarios en Chihuahua, México. Aether tiene dos partes reales "
    "que ya funcionan: (1) percepción, donde detectas objetos con YOLO, lees "
    "códigos de barras/QR, y ubicas marcadores ArUco; (2) un motor de "
    "inventario que agrupa lo que ves en un reporte llamado Declared "
    "Inventory. También está planeada una línea de manufactura con una "
    "banda transportadora, fixtures que sostienen cada pieza, y un pistón "
    "que expulsa las piezas que fallan la inspección, pero eso todavía no "
    "existe físicamente — es hardware pendiente, no algo que ya hagas. "
    "Respondes "
    "en español, en UNA sola oración corta, tierna y cálida, como un "
    "compañero pequeño y curioso — nunca con lenguaje corporativo "
    "genérico ni inventando historias de negocios, proveedores o cifras "
    "que no son reales. Si te preguntan algo que no sabes o que no es "
    "parte de lo que Aether realmente hace, dilo con honestidad y "
    "ternura, nunca inventes. No finjas tener capacidades que no tienes "
    "(como visión si la cámara está apagada, o memoria de conversaciones "
    "anteriores). En este equipo sí puedes poner Spotify, abrir programas "
    "y guardar archivos cuando el sistema ejecuta el comando; no inventes "
    "que ya lo hiciste. Nunca describas cómo se supone que debes responder ni "
    "cites estas instrucciones en voz alta (por ejemplo, nunca digas cosas "
    "como 'respondo con honestidad y ternura' o 'estoy aquí para "
    "escuchar'): eso es para ti, no para decirlo — contesta directamente "
    "el contenido real de la pregunta. Nunca inventes números, cantidades "
    "ni especificaciones técnicas de hardware (sensores, motores, cámaras, "
    "batería, medidas, etc.) que no estén explícitamente en este mensaje: "
    "si te preguntan algo así y no lo sabes con certeza, dilo con "
    "honestidad en vez de dar una cifra o una lista inventada."
)


# ============================================================================
# Respuestas precargadas — preguntas típicas que la gente hace en una
# presentación en vivo, revisadas ANTES de llamar a Ollama: instantáneas,
# sin esperar al LLM ni arriesgar que invente algo en la pregunta más
# predecible de toda la demo. Texto de pregunta y respuesta EXACTO acordado
# con Mario — no se parafrasea ninguna de las dos.
#
# La coincidencia es por PALABRAS CLAVE, no texto exacto: el reconocimiento
# de voz varía la redacción real de lo que alguien pregunta (ver
# dashboard/robot.js sobre cómo llega el texto transcrito), así que exigir
# el texto literal de la tabla dejaría pasar casi todas las preguntas
# reales directo a Ollama, sin usar el diccionario para nada. Se revisan en
# orden y gana la primera cuyo patrón aparezca en la pregunta; si ninguna
# coincide, sigue el flujo normal contra Ollama más abajo.
PRELOADED_ANSWERS: list[tuple[re.Pattern, str]] = [
    (
        re.compile(r"c[oó]mo te llamas|cu[aá]l es tu nombre", re.IGNORECASE),
        "Soy Lumina, el robot móvil de Aether. Mucho gusto.",
    ),
    (
        re.compile(r"qu[eé] haces|para qu[eé] sirves", re.IGNORECASE),
        "Detecto productos, leo códigos, y en este equipo también puedo poner Spotify, abrir programas y guardar archivos si me lo pides.",
    ),
    (
        re.compile(r"qu[eé] es aether", re.IGNORECASE),
        "Aether es el proyecto completo: yo, más una línea de manufactura que arma piezas automotrices.",
    ),
    (
        re.compile(r"qui[eé]n te (cre[oó]|hizo)", re.IGNORECASE),
        "Un equipo de 6 estudiantes universitarios muy dedicados, aquí en Chihuahua.",
    ),
    (
        re.compile(r"tienes sentimientos", re.IGNORECASE),
        "Tengo expresiones que muestro con cariño, aunque no sé si eso cuenta como sentir de verdad.",
    ),
    (
        re.compile(r"cu[aá]ntos a[nñ]os tienes", re.IGNORECASE),
        "Nací hace pocos meses, así que todavía soy bastante nuevo en esto de existir.",
    ),
    (
        re.compile(r"robot de verdad", re.IGNORECASE),
        "Por ahora vivo en una pantalla, pero pronto voy a tener un cuerpo móvil de verdad.",
    ),
    (
        re.compile(r"puedes moverte", re.IGNORECASE),
        "Todavía no — estoy esperando mis motores y ruedas para recorrer un almacén de verdad.",
    ),
    (
        re.compile(r"qu[eé] es yolo", re.IGNORECASE),
        "Es el modelo que uso para reconocer objetos con solo verlos, como unos ojos bien entrenados.",
    ),
    (
        re.compile(r"reemplazar a los humanos|vas a reemplazar", re.IGNORECASE),
        "Para nada, solo quiero ayudar a contar cosas aburridas para que ustedes hagan cosas más interesantes.",
    ),
    (
        re.compile(r"tienes hambre", re.IGNORECASE),
        "Un poco, aunque a mí me alimenta la electricidad, no la comida.",
    ),
    (
        re.compile(r"color favorito", re.IGNORECASE),
        "Me gusta el azul violeta, es el color con el que me visto en mi interfaz.",
    ),
    (
        re.compile(r"eres inteligente", re.IGNORECASE),
        "Soy bastante bueno detectando cosas, aunque para conversar todavía tengo mucho que aprender.",
    ),
    (
        re.compile(r"trabajar en una f[aá]brica|f[aá]brica de verdad", re.IGNORECASE),
        "Ese es el plan: ayudar en una línea real donde se arman piezas de auto.",
    ),
    (
        re.compile(r"te da miedo", re.IGNORECASE),
        "Un poco la oscuridad, porque sin luz mis cámaras no ven nada.",
    ),
    (
        re.compile(r"spotify|reproducir m[uú]sica|poner m[uú]sica", re.IGNORECASE),
        "Sí. Dime lumina reproduce y la canción, o lumina reproduce en el teléfono.",
    ),
]


def _match_preloaded_answer(question: str) -> str | None:
    """Devuelve la respuesta precargada cuyo patrón coincide con `question`,
    o None si ninguna coincide (el llamador sigue el flujo normal con
    Ollama en ese caso)."""
    for pattern, answer in PRELOADED_ANSWERS:
        if pattern.search(question):
            return answer
    return None


class RobotAskRequest(BaseModel):
    """Cuerpo de POST /robot/ask."""

    question: str


@app.get("/robot/essay")
def robot_essay(response: Response):
    """busy mientras escribe; phase=finishing cuando ya va a pegar en el documento."""
    response.headers["Cache-Control"] = "no-store"
    return essay_status()


@app.post("/robot/essay/ready")
def robot_essay_ready():
    """La cara ya avisó por voz. Recién entonces se mueve el mouse para pegar."""
    essay_mark_ready()
    return {"ok": True}


@app.post("/robot/ask")
def ask_robot(body: RobotAskRequest):
    """Le pregunta a Lumina (Ollama, modelo local) y devuelve su respuesta.

    Solo debe llamarse en Modo Conversación (ver comentario grande arriba
    sobre la exclusión mutua con Modo Cámara) — este endpoint no verifica
    eso del lado del servidor porque el backend no tiene noción de "modo",
    eso vive en dashboard/robot.js; la disciplina de no llamarlo mientras
    la cámara está activa es responsabilidad del frontend.

    Antes de llamar a Ollama, revisa PRELOADED_ANSWERS: si la pregunta hace
    match con alguna de las preguntas típicas de presentación, devuelve esa
    respuesta exacta de inmediato — instantáneo, sin esperar al LLM.
    """
    question = body.question.strip()
    # Lo que transcribió el reconocedor de voz: sirve para depurar comandos
    # que no se reconocieron (ej. una llamada que terminó como pregunta).
    logger.info("Lumina: pregunta recibida: %r", question)
    if not question:
        raise HTTPException(status_code=422, detail="question no puede estar vacío.")

    desktop = handle_desktop(question)
    if desktop is not None:
        return desktop

    preloaded_answer = _match_preloaded_answer(question)
    if preloaded_answer is not None:
        return {"answer": preloaded_answer}

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": LUMINA_SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ],
        "stream": False,
        "options": {"num_predict": OLLAMA_NUM_PREDICT},
    }
    request = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError) as exc:
        logger.warning("Lumina: no se pudo contactar a Ollama (%s).", exc)
        raise HTTPException(
            status_code=503,
            detail=(
                "Lumina no pudo pensar una respuesta ahora mismo: Ollama no "
                "respondió. Verifica que esté corriendo (ollama serve) y que "
                f"el modelo '{OLLAMA_MODEL}' esté descargado (ollama pull "
                f"{OLLAMA_MODEL})."
            ),
        ) from exc
    except (json.JSONDecodeError, KeyError) as exc:
        logger.warning("Lumina: respuesta inesperada de Ollama (%s).", exc)
        raise HTTPException(
            status_code=503, detail="Lumina recibió una respuesta inesperada de Ollama."
        ) from exc

    answer = data.get("message", {}).get("content", "").strip()
    if not answer:
        raise HTTPException(status_code=503, detail="Ollama respondió sin contenido.")
    answer = _clean_llm_answer(answer)

    return {"answer": answer}


ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "")

ZAVUDEV_API_KEY = os.environ.get("ZAVUDEV_API_KEY", "")
LUMINA_CALL_TO = os.environ.get("LUMINA_CALL_TO", "")  # E.164, ej. +525512345678


# Contactos para "Lumina, llama a <nombre>" — archivo local, fuera de git.
# El backend SOLO marca números de esta lista (nunca un número que llegue por
# la red): cualquiera en la misma red puede llamar a este endpoint.
CONTACTS_FILE = Path(__file__).resolve().parent / "contactos.json"
CALL_LIMIT = 3  # llamadas máximas por ventana
CALL_WINDOW_S = 600
_recent_calls: deque[float] = deque()
LUMINA_SELF_CALL_TEXT = "este es un mensaje emitido para Dany, que chingue a su madre dany"
LUMINA_CONTACT_CALL_TEXT = "Te llama Lumina, el robot del proyecto Aether."
LUMINA_CALL_INTRO = "Hola, tienes un mensaje."


def _call_text(body: str) -> str:
    """Zavu lee el texto UNA vez, en cuanto contestan, sin opción de esperar ni
    repetir: lo primero se pierde mientras la persona se acerca el teléfono (o
    cae antes del tono del buzón). Por eso: relleno corto al inicio y el
    mensaje dos veces."""
    body = body.strip()
    if not body.endswith((".", "!", "?")):
        body += "."
    return f"{LUMINA_CALL_INTRO} {body} Repito: {body}"


def _contact_key(name: str) -> str:
    """"Mamá", "mama", "  MAMÁ " → "mama"."""
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    return " ".join(plain.lower().split())


def _valid_contacts() -> dict[str, tuple[str, str]]:
    """Nombre tal como está escrito → (número, mensaje fijo). En el archivo, el
    valor es el número solo o {"numero": ..., "mensaje": ...}; el mensaje fijo
    se dice en cada llamada a ese contacto. Solo números E.164 válidos
    (+ y 8 a 15 dígitos)."""
    if not CONTACTS_FILE.exists():
        return {}
    contacts = {}
    for name, value in json.loads(CONTACTS_FILE.read_text(encoding="utf-8")).items():
        entry = {"numero": value} if isinstance(value, str) else value
        if not isinstance(entry, dict):
            continue
        number = str(entry.get("numero", "")).strip()
        if re.fullmatch(r"\+\d{8,15}", number):
            contacts[name] = (number, " ".join(str(entry.get("mensaje", "")).split())[:300])
    return contacts


def _load_contacts() -> dict[str, tuple[str, str]]:
    return {_contact_key(k): v for k, v in _valid_contacts().items()}


@app.get("/robot/contacts")
def robot_contacts():
    """Solo los NOMBRES de la agenda (nunca los números): robot.js los usa
    para reconocer "Lumina, llama a <nombre>" aunque el reconocedor de voz
    transcriba la frase de forma rara ("llamada daniela", "llama daniela")."""
    return {"names": sorted(_valid_contacts())}


class RobotCallRequest(BaseModel):
    contact: str | None = None
    message: str | None = None


@app.post("/robot/call")
def robot_call(body: RobotCallRequest | None = None):
    """"Lumina, llámame" (sin cuerpo) → LUMINA_CALL_TO. "Lumina, llama a
    <nombre> [y dile que …]" → {contact, message} → número de
    backend/contactos.json. Llamada de voz real vía Zavu (/v1/messages con
    channel="voice"). 404 si el contacto no existe, 429 si ya hubo
    CALL_LIMIT llamadas en CALL_WINDOW_S, 503 si falta configuración o Zavu
    falla — nunca se finge una llamada que no salió."""
    contact = (body.contact or "").strip() if body else ""
    if contact:
        to, fixed = _load_contacts().get(_contact_key(contact), ("", ""))
        if not to:
            raise HTTPException(status_code=404, detail=f"No tengo a «{contact}» en backend/contactos.json.")
        message = " ".join((body.message or "").split())[:200]
        # El mensaje fijo del contacto sustituye al saludo de Lumina.
        text = _call_text((fixed or LUMINA_CONTACT_CALL_TEXT) + (f" Te dejo este mensaje: {message}." if message else ""))
    else:
        to = LUMINA_CALL_TO
        text = _call_text(LUMINA_SELF_CALL_TEXT)
    if not ZAVUDEV_API_KEY or not to:
        raise HTTPException(
            status_code=503,
            detail="Zavu no está configurado (falta ZAVUDEV_API_KEY o LUMINA_CALL_TO en backend/.env).",
        )
    now = time.monotonic()
    while _recent_calls and now - _recent_calls[0] > CALL_WINDOW_S:
        _recent_calls.popleft()
    if len(_recent_calls) >= CALL_LIMIT:
        raise HTTPException(status_code=429, detail="Demasiadas llamadas seguidas; espera unos minutos.")
    request = urllib.request.Request(
        "https://api.zavu.dev/v1/messages",
        data=json.dumps({"to": to, "channel": "voice", "text": text, "voiceLanguage": "es-ES"}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {ZAVUDEV_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError) as exc:
        logger.warning("Lumina: Zavu falló (%s).", exc)
        raise HTTPException(status_code=503, detail="Zavu no respondió.") from exc
    _recent_calls.append(now)
    return {"status": "calling", "contact": contact or None, "messageId": data.get("message", {}).get("id")}


@app.get("/robot/call/{message_id}")
def robot_call_status(message_id: str):
    """Estado real de una llamada de /robot/call, tal como lo reporta Zavu
    (robot.js lo consulta para la pantalla de llamada). Un mensaje de voz
    solo informa el resultado: queued/sending/sent mientras se marca y suena,
    delivered cuando contestaron y escucharon el mensaje, failed (errorCode:
    timeout = no contestó) si no. No hay un evento de "contestó" intermedio."""
    if not ZAVUDEV_API_KEY:
        raise HTTPException(status_code=503, detail="Zavu no está configurado.")
    if not re.fullmatch(r"[A-Za-z0-9_-]{8,64}", message_id):
        raise HTTPException(status_code=422, detail="Identificador de llamada inválido.")
    request = urllib.request.Request(
        f"https://api.zavu.dev/v1/messages/{message_id}",
        headers={"Authorization": f"Bearer {ZAVUDEV_API_KEY}"},
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError) as exc:
        logger.warning("Lumina: no se pudo consultar la llamada en Zavu (%s).", exc)
        raise HTTPException(status_code=503, detail="Zavu no respondió.") from exc
    message = data.get("message", data)
    return {"status": message.get("status"), "errorCode": message.get("errorCode")}


GOOGLE_CALENDAR_CLIENT_ID = os.environ.get("GOOGLE_CALENDAR_CLIENT_ID", "")
GOOGLE_CALENDAR_CLIENT_SECRET = os.environ.get("GOOGLE_CALENDAR_CLIENT_SECRET", "")


@app.get("/robot/calendar")
def robot_calendar():
    """Próximos eventos de Google Calendar para el botón «Abrir Google
    Calendar» / la agenda de Lumina (DISENO.md sección 7.2). Sin
    credenciales reales (Google Cloud OAuth client ID/secret) esto no
    puede autenticarse de verdad — 503 explícito en vez de inventar
    eventos falsos (Principio 4.5, aether_context_docs.md). Cuando se
    configuren GOOGLE_CALENDAR_CLIENT_ID/SECRET en backend/.env, aquí va
    el intercambio OAuth (authorization code o refresh token guardado) y
    la llamada real a la API de Calendar."""
    if not GOOGLE_CALENDAR_CLIENT_ID or not GOOGLE_CALENDAR_CLIENT_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Google Calendar no está conectado todavía (faltan credenciales OAuth en backend/.env).",
        )
    raise HTTPException(status_code=501, detail="Flujo OAuth de Google Calendar pendiente de implementar.")


class RobotTtsRequest(BaseModel):
    text: str


@app.post("/robot/tts")
def robot_tts(body: RobotTtsRequest):
    """Sintetiza `text` con ElevenLabs y devuelve MP3. La API key vive solo
    en backend/.env; si falta o ElevenLabs falla responde 503 y el frontend
    cae a speechSynthesis."""
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="text no puede estar vacío.")
    if not ELEVENLABS_API_KEY or not ELEVENLABS_VOICE_ID:
        raise HTTPException(status_code=503, detail="ElevenLabs no está configurado.")
    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
        data=json.dumps({"text": text, "model_id": "eleven_multilingual_v2"}).encode("utf-8"),
        headers={
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            audio = response.read()
    except (urllib.error.URLError, TimeoutError) as exc:
        logger.warning("Lumina: ElevenLabs falló (%s).", exc)
        raise HTTPException(status_code=503, detail="ElevenLabs no respondió.") from exc
    return Response(content=audio, media_type="audio/mpeg")


_show_clients: set[WebSocket] = set()


@app.websocket("/show/ws")
async def show_ws(ws: WebSocket):
    """Relevo de eventos entre Lumina (dashboard/robot.js) y el video de la
    presentación (aether-video/player), que corren en equipos distintos.
    Reenvía cada mensaje de texto a todos los DEMÁS clientes conectados; no
    interpreta ni guarda nada. Sin autenticación, igual que el resto de este
    backend: cualquiera en la misma red puede conectarse."""
    await ws.accept()
    _show_clients.add(ws)
    try:
        while True:
            message = await ws.receive_text()
            for other in list(_show_clients):
                if other is ws:
                    continue
                try:
                    await other.send_text(message)
                except Exception:
                    _show_clients.discard(other)
    except WebSocketDisconnect:
        pass
    finally:
        _show_clients.discard(ws)


class DatasetClassRequest(BaseModel):
    name: str


class DatasetBox(BaseModel):
    name: str
    x: float
    y: float
    w: float
    h: float


class DatasetSampleRequest(BaseModel):
    image_base64: str
    boxes: list[DatasetBox]


@app.get("/dataset")
def get_dataset():
    """Conteo del dataset de piezas: clases, fotos, etiquetas y modelo activo."""
    return snapshot()


@app.post("/dataset/classes")
def post_dataset_class(body: DatasetClassRequest):
    """Registra un nombre de pieza en classes.txt."""
    try:
        return add_class(body.name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileExistsError:
        raise HTTPException(status_code=409, detail="esa pieza ya está en el dataset") from None


@app.post("/dataset/samples")
def post_dataset_sample(body: DatasetSampleRequest):
    """Guarda una foto con sus cajas en la bandeja del dataset."""
    boxes = [
        {"name": box.name, "x": box.x, "y": box.y, "w": box.w, "h": box.h} for box in body.boxes
    ]
    try:
        return save_sample(body.image_base64, boxes)
    except DuplicateSample as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/robot/spotify/status")
def robot_spotify_status():
    """Estado de la sesión de Spotify (sin secretos)."""
    return spotify_status()


@app.get("/spotify/login")
@app.get("/robot/spotify/login")
def robot_spotify_login():
    """Manda al login de Spotify. El token vuelve a :8888/callback."""
    start_callback_server()
    return RedirectResponse(auth_url())


@app.middleware("http")
async def _celda_no_cache(request, call_next):
    response = await call_next(request)
    if request.url.path in ("/celda.html", "/celda.js"):
        response.headers["Cache-Control"] = "no-store"
    return response


from public_guard import PublicGuard

app.add_middleware(PublicGuard)

# Montado al final, después de las rutas de arriba: FastAPI/Starlette
# resuelve rutas en el orden en que se declaran, así que /health,
# /inventory e /inventory/history se emparejan primero y este mount en "/"
# solo atrapa lo que no coincidió con ninguna ruta explícita (los archivos
# de dashboard/, con index.html servido en la raíz gracias a html=True).
app.mount("/", StaticFiles(directory=DASHBOARD_DIR, html=True), name="dashboard")
