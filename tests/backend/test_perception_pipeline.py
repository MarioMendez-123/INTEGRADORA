"""Percepción reutilizable (perception_pipeline.py): medidor de FPS, detector asíncrono, motor y procesador.

Todo con dobles: sin cámara, sin YOLO, sin pyzbar. cv2 real solo para dibujar sobre un arreglo de numpy.
"""

import sys
import threading
import time
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from perception_pipeline import (  # noqa: E402
    AsyncDetector,
    FpsMeter,
    PerceptionEngine,
    PerceptionProcessor,
    PerceptionResult,
)


def esperar(condicion, timeout=3.0):
    limite = time.monotonic() + timeout
    while time.monotonic() < limite:
        if condicion():
            return True
        time.sleep(0.01)
    return False


class Reloj:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


def test_fps_meter_cuenta_en_la_ventana():
    reloj = Reloj()
    meter = FpsMeter(window_s=2.0, clock=reloj)
    assert meter.rate() is None
    for _ in range(31):  # 30 intervalos de 1/30 s = 1 s
        meter.tick()
        reloj.t += 1 / 30
    assert meter.rate() == pytest.approx(30.0, abs=0.2)
    reloj.t += 10  # nadie manda cuadros: la tasa vuelve a desconocida
    assert meter.rate() is None


class FakeBox:
    def __init__(self, xyxy, cls, conf):
        self.xyxy = [np.array(xyxy)]
        self.cls = [cls]
        self.conf = [conf]


class FakeModel:
    names = {0: "bottle", 1: "cup"}

    def __init__(self, boxes=(), delay=0.0):
        self._boxes = list(boxes)
        self.delay = delay
        self.calls = []

    def __call__(self, frame, verbose=False, **kwargs):
        self.calls.append(kwargs)
        if self.delay:
            time.sleep(self.delay)
        return [SimpleNamespace(boxes=self._boxes)]


class FakeAruco:
    def __init__(self, ids=None):
        self.ids = ids

    def detectMarkers(self, frame):
        if self.ids is None:
            return None, None, None
        return [np.zeros((1, 4, 2), dtype=np.float32)], np.array([[self.ids]]), None


def no_decode(crop):
    return []


def un_codigo(crop):
    return [SimpleNamespace(data=b"QR-123")]


def engine(boxes, decode=no_decode, aruco=None, kwargs=None, delay=0.0):
    return PerceptionEngine(FakeModel(boxes, delay), decode, aruco or FakeAruco(), kwargs)


FRAME = np.zeros((120, 160, 3), dtype=np.uint8)


def test_motor_analiza_codigo_y_marcador():
    e = engine([FakeBox([10, 10, 60, 60], 0, 0.9)], decode=un_codigo, aruco=FakeAruco(ids=7))
    r = e.analyze(FRAME)
    assert r.location_marker_id == 7
    assert r.detections[0].class_name == "bottle"
    assert r.detections[0].code_data == "QR-123" and r.detections[0].code_read is True
    obs = e.observations(r)
    assert set(obs[0]) == {"timestamp", "detected_class", "code_data", "code_read", "confidence", "location_marker_id"}
    assert obs[0]["location_marker_id"] == 7


def test_motor_sin_marcador_ni_codigo():
    r = engine([FakeBox([0, 0, 20, 20], 1, 0.5)]).analyze(FRAME)
    assert r.location_marker_id is None
    assert r.detections[0].code_data is None and r.detections[0].code_read is False


def test_motor_pasa_los_parametros_al_modelo():
    e = engine([], kwargs={"imgsz": 320, "half": True})
    e.analyze(FRAME)
    assert e._model.calls == [{"imgsz": 320, "half": True}]


def test_motor_dibuja_sin_romper_el_cuadro():
    e = engine([FakeBox([10, 10, 60, 60], 0, 0.9)], decode=un_codigo)
    frame = FRAME.copy()
    e.draw(frame, e.analyze(frame))
    assert frame.any()  # se dibujó algo (caja verde y texto)


def test_procesador_sync_analiza_cada_cuadro_y_emite():
    emitidas = []
    p = PerceptionProcessor(engine([FakeBox([10, 10, 60, 60], 0, 0.9)]), emitidas.append, mode="sync")
    p(FRAME.copy())
    p(FRAME.copy())
    assert len(emitidas) == 2 and emitidas[0]["detected_class"] == "bottle"
    assert p.stats()["mode"] == "sync" and p.stats()["ms_last"] is not None


def test_procesador_modo_invalido():
    with pytest.raises(ValueError):
        PerceptionProcessor(engine([]), lambda o: None, mode="raro")


def test_asincrono_no_frena_el_video_y_dibuja_el_ultimo_resultado():
    """El modelo tarda 120 ms por cuadro; 20 cuadros deben procesarse mucho más rápido que 20 × 120 ms."""
    emitidas = []
    p = PerceptionProcessor(engine([FakeBox([10, 10, 60, 60], 0, 0.9)], delay=0.12), emitidas.append, mode="async")
    try:
        t0 = time.monotonic()
        for _ in range(20):
            p(FRAME.copy())
        assert time.monotonic() - t0 < 1.0  # el video no espera al detector
        assert esperar(lambda: len(emitidas) >= 1)
        final = FRAME.copy()
        p(final)
        assert esperar(lambda: p.stats()["ms_last"] is not None)
        p(final)
        assert final.any()  # con resultado disponible, se dibujan sus cajas
        assert len(emitidas) < 20  # y se descartaron cuadros en vez de acumularlos
    finally:
        p.close()


def test_detector_descarta_si_esta_ocupado_y_cuenta_errores():
    gate = threading.Event()
    vistos = []

    def detect(frame):
        vistos.append(int(frame[0, 0, 0]))
        gate.wait(2)
        if frame[0, 0, 0] == 99:
            raise RuntimeError("falla de prueba")
        return "ok"

    d = AsyncDetector(detect, name="t")
    try:
        f = np.zeros((4, 4, 3), dtype=np.uint8)
        assert d.submit(f) is True
        assert esperar(lambda: vistos == [0])
        assert d.submit(f) is True   # queda pendiente (el hilo está ocupado con el anterior)
        assert d.submit(f) is False  # ya hay uno pendiente: se descarta
        gate.set()
        assert esperar(lambda: d.latest() == "ok")
        f2 = f.copy()
        f2[0, 0, 0] = 99
        assert esperar(lambda: d.submit(f2))
        assert esperar(lambda: d.errors == 1)
        assert "falla de prueba" in d.last_error
        assert d.latest() == "ok"  # el último bueno se conserva
    finally:
        d.close()


def test_detector_respeta_max_hz():
    llamadas = []
    d = AsyncDetector(lambda f: llamadas.append(time.monotonic()), max_hz=20.0, name="t")  # 50 ms entre inicios
    try:
        f = np.zeros((2, 2, 3), dtype=np.uint8)
        fin = time.monotonic() + 0.6
        while time.monotonic() < fin:
            d.submit(f)
            time.sleep(0.005)
        assert 8 <= len(llamadas) <= 16  # ≈ 12 a 20 Hz con holgura; sin límite serían ~100
    finally:
        d.close()
