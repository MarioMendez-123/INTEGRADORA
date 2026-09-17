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
import urllib.error
import urllib.request
from collections import deque
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from camera_publisher import CameraPublisher
from db.database import SessionLocal, init_db
from db.models import DeclaredEntry, DeclaredEntryHistory
from inventory_refresh import InventoryRefreshLoop
from logging_config import setup_logging

DASHBOARD_DIR = Path(__file__).resolve().parent.parent / "dashboard"

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
    logger.info("Servidor backend iniciado.")
    yield


app = FastAPI(lifespan=lifespan)


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
YOLO_MODEL_NAME = "yolov8n.pt"

# Modelo cargado una sola vez, perezosamente (solo cuando algún publicador
# arranca por primera vez) — nunca al arrancar el servidor, para no pagar el
# costo de cargar YOLO en un backend que a lo mejor nadie usa para demo.
# Compartido entre los dos publicadores: no tiene sentido cargar el mismo
# modelo dos veces. _yolo_model_lock evita una carrera si Percepción y
# Visión de línea arrancan por primera vez casi al mismo tiempo, cada una
# en el hilo de su propia petición HTTP.
_yolo_model = None
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


def _get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        with _yolo_model_lock:
            if _yolo_model is None:  # doble check: otro hilo pudo ganar la carrera
                from ultralytics import YOLO

                _yolo_model = YOLO(YOLO_MODEL_NAME)
                logger.info("Modelo YOLO '%s' cargado para el modo demo.", YOLO_MODEL_NAME)
    return _yolo_model


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
    está suscrito."""
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


def _make_line_vision_processor():
    """Arma la confirmación binaria de Visión de línea una sola vez — mucho
    más simple que Percepción: no lee código de barras ni ArUco, solo dice
    si hay o no algún objeto detectado en el frame ("PIEZA DETECTADA" /
    "SIN PIEZA").

    Esto es solo detección de presencia para la demo del dashboard, NO el
    criterio real de PASS/FAIL de la ADR 0010 (sub-decisión 10c) — ese
    criterio todavía no está definido ni implementado. Cuando exista, el
    punto de emisión del Evento A de contracts/line_handshake_protocol.md
    (resultado PASS/FAIL hacia el actuador del pistón) va aquí dentro de
    process(), no en otro módulo — no fabricar esa emisión antes de que el
    criterio real de inspección esté decidido."""
    import cv2

    model = _get_yolo_model()

    def process(frame):
        results = model(frame, verbose=False)
        piece_detected = len(results[0].boxes) > 0
        label = "PIEZA DETECTADA" if piece_detected else "SIN PIEZA"
        color = (0, 200, 0) if piece_detected else (0, 140, 255)  # BGR
        cv2.putText(frame, label, (24, 48), cv2.FONT_HERSHEY_SIMPLEX, 1.1, color, 3)

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
    "anteriores). Nunca describas cómo se supone que debes responder ni "
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
        "Detecto productos con mis ojos digitales, leo sus códigos, y ayudo a saber qué hay en el inventario.",
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
    if not question:
        raise HTTPException(status_code=422, detail="question no puede estar vacío.")

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


# Montado al final, después de las rutas de arriba: FastAPI/Starlette
# resuelve rutas en el orden en que se declaran, así que /health,
# /inventory e /inventory/history se emparejan primero y este mount en "/"
# solo atrapa lo que no coincidió con ninguna ruta explícita (los archivos
# de dashboard/, con index.html servido en la raíz gracias a html=True).
app.mount("/", StaticFiles(directory=DASHBOARD_DIR, html=True), name="dashboard")
