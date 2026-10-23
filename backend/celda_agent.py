"""Agente de la celda de manufactura para la Raspberry Pi 4.

Corre SOLO la celda: cámara, visión de línea, pulsos del pistón y la banda
(cell_line.py), alarmas (cell_hmi.py) y la página celda.html. No importa
main.py, así que no arrastra Lumina, la base de datos, torch ni ultralytics.

Arranque, desde backend/:
    python -m uvicorn celda_agent:app --host 0.0.0.0 --port 8000
La página queda en http://<ip-de-la-pi>:8000/celda.html

A diferencia del modo demo de main.py, la cámara se abre al arrancar y la celda
opera sin que nadie tenga el video abierto. Sin red sigue funcionando: la
decisión y los pulsos no dependen de la laptop. Sin autenticación más allá de
la cuenta de laboratorio de cell_hmi.py: solo red local, nunca expuesta.

Para que la Pi no se trabe, la visión analiza UN frame cada LINE_ANALISIS_CADA_S
segundos (el resto del tiempo solo vacía el búfer de la cámara) con un solo
modelo ONNX (line_model.py), en vez de analizar cada frame con dos modelos.

Variables de entorno (todas opcionales):
    LINE_ANALISIS_CADA_S  pausa entre análisis, 0.1 a 1.0 (def. 0.5)
    LINE_ESTABLES         análisis seguidos iguales antes de actuar (def. 5, en cell_line.py)
    LINE_MODEL            ruta del .onnx (def. edge/perception/weights/parts.onnx)
    LINE_IMGSZ            tamaño de exportación del modelo (def. 320)
    LINE_CV_THREADS       hilos de OpenCV (def. 3, deja un núcleo libre)
    CELDA_HMI_CLAVE       contraseña de la cuenta de la HMI (sin ella nadie inicia sesión)
    CELDA_HMI_USUARIO     usuario de esa cuenta (def. admin)
    LINE_VISION_CAMERA_*  INDEX / BACKEND / FOURCC / WIDTH / HEIGHT (def. 0, v4l2, MJPG, 640x480)
"""

import logging
import os
import threading
from contextlib import asynccontextmanager

import cv2
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

from camera_publisher import CameraPublisher, camera_options
from cell_line import celda
from cell_routes import router as cell_router
import cell_hmi
from dataset_store import (
    CONFIANZA_MINIMA,
    CORTE_INTERNO,
    REPO_ROOT,
    clasificar_pieza,
    default_weights_file,
    read_class_names,
)
from line_model import DetectorOnnx

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("celda_agent")

cv2.setNumThreads(int(os.environ.get("LINE_CV_THREADS", "3")))

# cell_line.py da la cámara por apagada si pasan VISION_VIVA_S (2 s) sin análisis:
# la pausa no puede acercarse a eso.
ANALISIS_CADA_S = min(max(float(os.environ.get("LINE_ANALISIS_CADA_S", "0.5")), 0.1), 1.0)
MODELO = os.environ.get("LINE_MODEL") or str(default_weights_file().with_suffix(".onnx"))
IMGSZ = int(os.environ.get("LINE_IMGSZ", "320"))
VIGILAR_CADA_S = 5.0

_opciones_camara = {"backend": "v4l2", "fourcc": "MJPG", "width": 640, "height": 480}
_opciones_camara.update({k: v for k, v in camera_options("LINE_VISION").items() if v is not None})


def _crear_procesador():
    """Un detector, cargado una sola vez. PASS es "el nombre está en classes.txt",
    no una inspección de defecto (mismo criterio que main.py)."""
    clases = read_class_names()
    detector = DetectorOnnx(MODELO, clases, imgsz=IMGSZ, corte=CORTE_INTERNO)

    def process(frame):
        detecciones = detector(frame)
        for nombre, confianza, (x1, y1, x2, y2) in detecciones:
            if nombre in clases and confianza >= CONFIANZA_MINIMA:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 200, 0), 2)
                cv2.putText(frame, nombre, (x1, max(16, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 0), 2)
        decision = clasificar_pieza([(n, c) for n, c, _ in detecciones], clases, peso_es_parts=True)
        if decision["respuesta"] == "SIN PIEZA":
            label, color, juicio = "SIN PIEZA", (0, 140, 255), "SIN_PIEZA"
        elif decision["resultado"] == "PASS":
            label, color, juicio = f"PIEZA REAL · {decision['nombre']} · PASS", (0, 200, 0), "PASS"
        else:
            label, color, juicio = "NO ES PIEZA REAL · FAIL", (0, 0, 220), "FAIL"
        celda.ver(juicio)
        cv2.putText(frame, label, (24, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 3)

    return process


publicador = CameraPublisher(
    camera_index=int(os.environ.get("LINE_VISION_CAMERA_INDEX", "0")),
    make_processor=_crear_procesador,
    label="line-vision",
    min_interval=ANALISIS_CADA_S,
    **_opciones_camara,
)

_parar = threading.Event()
_error_arranque: str | None = None


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
    try:
        publicador.subscribe()  # este suscriptor nunca se va: la celda opera sin video abierto
    except Exception as exc:
        # La página sigue sirviéndose: muestra "Cámara apagada" y /health dice por qué.
        _error_arranque = str(exc)
        logger.exception("La visión de la celda no arrancó.")
    threading.Thread(target=_vigilar, name="vigilar-camara", daemon=True).start()
    if not cell_hmi.clave_configurada():
        logger.warning("CELDA_HMI_CLAVE no está definida: nadie puede iniciar sesión, así que Arranque y Paro no responden.")
    logger.info(
        "Celda lista: un análisis cada %.2f s, modelo %s, %s",
        ANALISIS_CADA_S,
        MODELO,
        "GPIO abiertos" if celda.salidas.abiertas else "sin GPIO: los pulsos NO se envían",
    )
    yield
    _parar.set()
    celda.set_running(False)  # apaga los dos relevadores
    publicador.unsubscribe()


app = FastAPI(lifespan=lifespan)
app.include_router(cell_router)


@app.get("/health")
def health():
    return {"status": "ok" if _error_arranque is None else "error", "error": _error_arranque}


@app.get("/line/vision/stream")
def line_vision_stream():
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


# Al final: las rutas de arriba se emparejan primero (mismo orden que main.py).
app.mount("/", StaticFiles(directory=REPO_ROOT / "dashboard", html=True), name="dashboard")
