"""Percepción reutilizable: YOLO + lectura de códigos + ArUco, sin base de datos ni edge/.

Se extrajo de backend/main.py para que la misma lógica sirva a la laptop (modo demo, igual que
antes) y al agente del Jetson (backend/aether_agent.py). Tres piezas intercambiables:

- PerceptionEngine: analiza un cuadro (analyze) y lo dibuja (draw). No sabe de HTTP ni de hilos.
- AsyncDetector: corre una función lenta en su propio hilo sobre el cuadro más reciente, para que
  un YOLO de decenas de milisegundos no frene el video.
- make_perception_processor: arma el "procesador" que recibe CameraPublisher, en modo "sync"
  (analiza cada cuadro, comportamiento histórico de la laptop) o "async" (video fluido, cajas del
  último resultado).

Las dependencias pesadas (cv2, pyzbar, el modelo) llegan por parámetro o se importan al construir,
así las pruebas usan dobles sin cámara ni YOLO.
"""

import logging
import threading
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class FpsMeter:
    """Cuadros por segundo en una ventana deslizante (segundos reales, reloj monotónico)."""

    def __init__(self, window_s: float = 2.0, clock=time.monotonic):
        self._window = window_s
        self._clock = clock
        self._stamps: deque[float] = deque()
        self._lock = threading.Lock()

    def tick(self) -> None:
        now = self._clock()
        with self._lock:
            self._stamps.append(now)
            self._trim(now)

    def rate(self) -> float | None:
        now = self._clock()
        with self._lock:
            self._trim(now)
            if len(self._stamps) < 2:
                return None
            span = self._stamps[-1] - self._stamps[0]
            return round((len(self._stamps) - 1) / span, 1) if span > 0 else None

    def _trim(self, now: float) -> None:
        while self._stamps and now - self._stamps[0] > self._window:
            self._stamps.popleft()


@dataclass
class Detection:
    box: tuple[int, int, int, int]
    class_name: str
    confidence: float
    code_data: str | None = None
    code_read: bool = False
    # "object": un solo modelo, como siempre. Con dos modelos: "piece" (pieza registrada, la identidad es la
    # clase, sin código) u "obstacle" (detector general, solo apoyo para esquivar; NO es inventario).
    kind: str = "object"


@dataclass
class PerceptionResult:
    detections: list[Detection] = field(default_factory=list)
    frame_area: int = 0
    marker_corners: object = None
    marker_ids: object = None
    location_marker_id: int | None = None


class PerceptionEngine:
    """YOLO + pyzbar dentro de cada caja + ArUco sobre el cuadro completo.

    model: algo llamable como ultralytics.YOLO (devuelve resultados con .boxes) con .names.
    decode: función de pyzbar (recorte -> lista de códigos).
    aruco_detector: cv2.aruco.ArucoDetector (o doble).
    predict_kwargs: imgsz, device, half... que se pasan tal cual al modelo.
    pieces_model: segundo modelo (parts.pt). Si se da, `model` pasa a ser el detector general de OBSTÁCULOS y las
    piezas se identifican solo por su clase. Las observaciones (inventario) llevan solo las piezas; los obstáculos
    se dibujan y se resumen en obstacles(), no se mandan a la laptop.
    """

    def __init__(self, model, decode, aruco_detector, predict_kwargs: dict | None = None,
                 pieces_model=None, piece_conf: float = 0.5, obstacle_conf: float = 0.4):
        self._model = model
        self._decode = decode
        self._aruco = aruco_detector
        self._predict_kwargs = predict_kwargs or {}
        self._pieces = pieces_model
        self._piece_conf = piece_conf
        self._obstacle_conf = obstacle_conf
        self.has_obstacles = pieces_model is not None

    def analyze(self, frame) -> PerceptionResult:
        corners, ids, _ = self._aruco.detectMarkers(frame)
        marker = int(ids.flatten()[0]) if ids is not None else None
        result = PerceptionResult(marker_corners=corners, marker_ids=ids, location_marker_id=marker)

        result.frame_area = int(frame.shape[0] * frame.shape[1])

        results = self._model(frame, verbose=False, **self._predict_kwargs)
        for box in results[0].boxes:
            x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
            conf = float(box.conf[0])
            if self._pieces is not None:
                if conf >= self._obstacle_conf:
                    result.detections.append(Detection((x1, y1, x2, y2), self._model.names[int(box.cls[0])], conf, kind="obstacle"))
                continue
            crop = frame[y1:y2, x1:x2]
            codes = self._decode(crop) if crop.size > 0 else []
            data = codes[0].data.decode("utf-8") if codes else None
            result.detections.append(
                Detection(
                    box=(x1, y1, x2, y2),
                    class_name=self._model.names[int(box.cls[0])],
                    confidence=conf,
                    code_data=data,
                    code_read=bool(codes),
                )
            )
        if self._pieces is not None:
            for box in self._pieces(frame, verbose=False, **self._predict_kwargs)[0].boxes:
                conf = float(box.conf[0])
                if conf >= self._piece_conf:
                    x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
                    result.detections.append(Detection((x1, y1, x2, y2), self._pieces.names[int(box.cls[0])], conf, kind="piece"))
        return result

    def draw(self, frame, result: PerceptionResult) -> None:
        import cv2

        if result.marker_ids is not None:
            cv2.aruco.drawDetectedMarkers(frame, result.marker_corners, result.marker_ids)
        for det in result.detections:
            x1, y1, x2, y2 = det.box
            color = (0, 140, 255) if det.kind == "obstacle" else (0, 255, 0)  # BGR: naranja para obstáculos
            texto = f"OBSTACULO {det.class_name}" if det.kind == "obstacle" else det.class_name
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, texto, (x1, max(16, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            if det.code_data:
                cv2.putText(frame, det.code_data, (x1, y2 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

    @staticmethod
    def observations(result: PerceptionResult, now: datetime | None = None) -> list[dict]:
        """Las observaciones con las mismas claves de siempre (edge/inventory_engine las consume así)."""
        stamp = (now or datetime.now(timezone.utc)).isoformat()
        return [
            {
                "timestamp": stamp,
                "detected_class": d.class_name,
                "code_data": d.code_data,
                "code_read": d.code_read,
                "confidence": d.confidence,
                "location_marker_id": result.location_marker_id,
            }
            for d in result.detections
            if d.kind != "obstacle"
        ]

    @staticmethod
    def obstacles(result: PerceptionResult | None) -> dict | None:
        """Resumen de los obstáculos del último análisis. None si aún no hay análisis.
        max_area_pct es lo que ocupa el más grande en el cuadro: una cámara sola NO mide distancia, es un indicio de cercanía."""
        if result is None:
            return None
        cajas = [d for d in result.detections if d.kind == "obstacle"]
        area = max(((d.box[2] - d.box[0]) * (d.box[3] - d.box[1]) for d in cajas), default=0)
        return {
            "count": len(cajas),
            "classes": sorted({d.class_name for d in cajas}),
            "max_area_pct": round(100.0 * area / result.frame_area, 1) if result.frame_area else 0.0,
        }


class AsyncDetector:
    """Ejecuta detect(frame) en un hilo, siempre sobre el cuadro más reciente que llegó.

    submit() nunca bloquea: si el hilo sigue ocupado, el cuadro se descarta (no se acumulan).
    max_hz limita la frecuencia de detección (0 = lo más rápido que dé). Una excepción en detect
    se registra y se cuenta; el hilo sigue vivo.
    """

    def __init__(self, detect, on_result=None, max_hz: float = 0.0, name: str = "detector", clock=time.monotonic):
        self._detect = detect
        self._on_result = on_result
        self._min_period = 1.0 / max_hz if max_hz > 0 else 0.0
        self._clock = clock
        self._lock = threading.Lock()
        self._wake = threading.Event()
        self._stop = threading.Event()
        self._pending = None
        self._latest = None
        self.ms_last: float | None = None
        self.ms_avg: float | None = None
        self.errors = 0
        self.last_error: str | None = None
        self._thread = threading.Thread(target=self._run, name=name, daemon=True)
        self._thread.start()

    def submit(self, frame) -> bool:
        with self._lock:
            if self._pending is not None:
                return False
            self._pending = frame.copy()
        self._wake.set()
        return True

    def latest(self):
        with self._lock:
            return self._latest

    def close(self) -> None:
        self._stop.set()
        self._wake.set()
        self._thread.join(timeout=2)

    def _run(self) -> None:
        last_start = 0.0
        while not self._stop.is_set():
            self._wake.wait(timeout=0.5)
            self._wake.clear()
            with self._lock:
                frame, self._pending = self._pending, None
            if frame is None:
                continue
            wait = self._min_period - (self._clock() - last_start)
            if wait > 0 and self._stop.wait(wait):
                break
            last_start = self._clock()
            try:
                result = self._detect(frame)
            except Exception as exc:  # no se traga: queda contado y visible en /status
                self.errors += 1
                self.last_error = f"{type(exc).__name__}: {exc}"
                logger.exception("La detección falló; sigo con el siguiente cuadro.")
                continue
            ms = (self._clock() - last_start) * 1000.0
            self.ms_last = round(ms, 1)
            self.ms_avg = round(ms if self.ms_avg is None else 0.8 * self.ms_avg + 0.2 * ms, 1)
            with self._lock:
                self._latest = result
            if self._on_result is not None:
                try:
                    self._on_result(result)
                except Exception:
                    logger.exception("on_result falló.")


class PerceptionProcessor:
    """Lo que recibe CameraPublisher como make_processor(): se llama una vez por cuadro."""

    def __init__(self, engine: PerceptionEngine, emit, mode: str = "sync", max_hz: float = 0.0):
        if mode not in {"sync", "async"}:
            raise ValueError(f"mode debe ser 'sync' o 'async', no '{mode}'")
        self.engine = engine
        self.mode = mode
        self._emit = emit
        self._detector = None
        self._last_sync_ms: float | None = None
        self._last_sync_result = None
        if mode == "async":
            self._detector = AsyncDetector(engine.analyze, on_result=self._publish, max_hz=max_hz, name="perception-detector")

    def _publish(self, result: PerceptionResult) -> None:
        for observation in self.engine.observations(result):
            self._emit(observation)

    def __call__(self, frame) -> None:
        if self._detector is None:
            t0 = time.monotonic()
            result = self.engine.analyze(frame)
            self._last_sync_ms = round((time.monotonic() - t0) * 1000.0, 1)
            self._last_sync_result = result
            self.engine.draw(frame, result)
            self._publish(result)
            return
        self._detector.submit(frame)
        result = self._detector.latest()
        if result is not None:
            self.engine.draw(frame, result)

    def stats(self) -> dict:
        has = getattr(self.engine, "has_obstacles", False)
        if self._detector is not None:
            return {"mode": "async", "ms_last": self._detector.ms_last, "ms_avg": self._detector.ms_avg,
                    "errors": self._detector.errors, "last_error": self._detector.last_error,
                    "obstacles": self.engine.obstacles(self._detector.latest()) if has else None}
        return {"mode": "sync", "ms_last": self._last_sync_ms, "ms_avg": self._last_sync_ms, "errors": 0, "last_error": None,
                "obstacles": self.engine.obstacles(self._last_sync_result) if has else None}

    def close(self) -> None:
        if self._detector is not None:
            self._detector.close()


def engine_for(model, predict_kwargs: dict | None = None, **dual) -> PerceptionEngine:
    """Arma pyzbar y ArUco reales alrededor de un modelo YOLO ya cargado. `dual`: pieces_model, piece_conf, obstacle_conf."""
    import cv2

    try:
        from pyzbar.pyzbar import decode
    except (ImportError, OSError) as exc:  # sin la biblioteca zbar del sistema no hay lectura de códigos, pero sí video y YOLO
        logger.warning("pyzbar no está disponible (%s): se detecta y se dibuja, pero no se leen códigos.", exc)

        def decode(crop):
            return []

    dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    detector = cv2.aruco.ArucoDetector(dictionary, cv2.aruco.DetectorParameters())
    return PerceptionEngine(model, decode, detector, predict_kwargs, **dual)


def build_engine(weights: str, predict_kwargs: dict | None = None, pieces_weights: str | None = None,
                 piece_conf: float = 0.5, obstacle_conf: float = 0.4) -> PerceptionEngine:
    """Carga YOLO y arma el motor. Solo se llama en el equipo que tiene cámara.
    Con pieces_weights (parts.pt) hay dos modelos: el general para obstáculos y parts.pt para las piezas."""
    from ultralytics import YOLO

    model = YOLO(weights)
    logger.info("Modelo YOLO '%s' cargado.", weights)
    if pieces_weights is None:
        return engine_for(model, predict_kwargs)
    pieces = YOLO(pieces_weights)
    logger.info("Modelo de piezas '%s' cargado; '%s' queda como detector de obstáculos.", pieces_weights, weights)
    return engine_for(model, predict_kwargs, pieces_model=pieces, piece_conf=piece_conf, obstacle_conf=obstacle_conf)
