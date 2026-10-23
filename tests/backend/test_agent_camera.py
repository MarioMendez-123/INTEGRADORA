"""AgentCameraPublisher: lectura al ritmo de la cámara, procesado aparte, cuadros viejos descartados."""

import sys
import time
from pathlib import Path
from unittest.mock import patch

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from agent_camera import AgentCameraPublisher  # noqa: E402


def esperar(condicion, timeout=5.0):
    limite = time.monotonic() + timeout
    while time.monotonic() < limite:
        if condicion():
            return True
        time.sleep(0.01)
    return False


class FakeCapture:
    """Cámara de ~100 cuadros por segundo; cada cuadro lleva su número en el primer píxel."""

    instancias = []
    fail_after = None

    def __init__(self, *_a, **_k):
        self.released = False
        self.n = 0
        self.fail_after = FakeCapture.fail_after
        FakeCapture.instancias.append(self)

    def isOpened(self):
        return True

    def set(self, *_a):
        return True

    def get(self, *_a):
        return 0

    def read(self):
        if self.released:
            return False, None
        time.sleep(0.01)
        self.n += 1
        if self.fail_after is not None and self.n > self.fail_after:
            return False, None
        frame = np.zeros((48, 64, 3), dtype=np.uint8)
        frame[0, 0, 0] = self.n % 250
        return True, frame

    def release(self):
        self.released = True


class Procesador:
    def __init__(self, delay=0.0):
        self.delay = delay
        self.vistos = []
        self.cerrado = False

    def __call__(self, frame):
        self.vistos.append(int(frame[0, 0, 0]))
        if self.delay:
            time.sleep(self.delay)

    def close(self):
        self.cerrado = True


def nuevo(proc, **kw):
    FakeCapture.instancias.clear()
    FakeCapture.fail_after = kw.pop("fail_after", None)
    return AgentCameraPublisher(camera_index=0, make_processor=lambda: proc, label="t", **kw)


def test_procesado_lento_no_baja_los_fps_de_la_camara_y_descarta_cuadros():
    proc = Procesador(delay=0.1)  # ~10 por segundo de entrega; la cámara da ~100
    pub = nuevo(proc)
    with patch("cv2.VideoCapture", FakeCapture):
        pub.subscribe()
        try:
            assert esperar(lambda: len(proc.vistos) >= 5)
            stats = pub.stats()
            assert stats["open"] is True
            assert stats["fps_camera"] is not None
            assert stats["fps_camera"] > 3 * (stats["fps_delivery"] or 1)
            assert stats["width"] == 64 and stats["height"] == 48
            leidos = FakeCapture.instancias[0].n
            assert leidos > 2 * len(proc.vistos)  # los cuadros viejos se descartaron, no se acumularon
        finally:
            pub.unsubscribe()
    assert FakeCapture.instancias[0].released is True
    assert proc.cerrado is True


def test_entrega_siempre_el_cuadro_mas_reciente():
    proc = Procesador(delay=0.05)
    pub = nuevo(proc)
    with patch("cv2.VideoCapture", FakeCapture):
        pub.subscribe()
        try:
            assert esperar(lambda: len(proc.vistos) >= 6)
        finally:
            pub.unsubscribe()
    saltos = [b - a for a, b in zip(proc.vistos, proc.vistos[1:]) if b > a]
    assert saltos and max(saltos) > 1  # nunca va "atrasado": salta a lo más nuevo


def test_stream_entrega_jpeg_validos():
    pub = nuevo(Procesador(), jpeg_quality=70)
    with patch("cv2.VideoCapture", FakeCapture):
        pub.subscribe()
        try:
            parte = next(pub.stream_frames())
            assert parte.startswith(b"--frame\r\nContent-Type: image/jpeg\r\n\r\n\xff\xd8")
        finally:
            pub.unsubscribe()


def test_si_la_camara_deja_de_entregar_el_hilo_termina_y_se_ve():
    pub = nuevo(Procesador(), fail_after=5)
    with patch("cv2.VideoCapture", FakeCapture):
        pub.subscribe()
        try:
            assert esperar(lambda: not pub.is_running())
            assert "No se pudo leer" in pub.last_error
            assert FakeCapture.instancias[0].released is True
        finally:
            pub.unsubscribe()


def test_si_el_procesado_falla_se_registra_y_se_libera_la_camara():
    class Roto(Procesador):
        def __call__(self, frame):
            raise RuntimeError("boom")

    pub = nuevo(Roto())
    with patch("cv2.VideoCapture", FakeCapture):
        pub.subscribe()
        try:
            assert esperar(lambda: not pub.is_running())
            assert "boom" in pub.last_error
            assert FakeCapture.instancias[0].released is True
        finally:
            pub.unsubscribe()
