"""Pruebas reales de CameraPublisher (backend/camera_publisher.py) — el
ciclo de vida y el conteo de clientes de la cámara compartida entre
streams.

No dependen de una cámara real: cv2.VideoCapture se reemplaza en
sys.modules por un doble de prueba (FakeCapture) que "abre" siempre y
entrega frames sintéticos, para poder probar la lógica de
suscripción/desuscripción sin hardware.

Importa camera_publisher directamente, NUNCA main — main.py conecta a la
base de datos real (backend/db/) al importarse, y tests/backend/test_main.py
depende de parchar esa base ANTES de que algo más importe main.py por
primera vez (ver su propio docstring). Importar aquí un módulo que no
toca la base evita competir por esa carrera de importación entre archivos
de prueba, sin importar el orden en que pytest los recolecte.
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from camera_publisher import CameraPublisher  # noqa: E402


class FakeCapture:
    """Doble de cv2.VideoCapture: siempre "abierta", entrega un frame
    sintético en cada read() y registra si se liberó — lo que le importa a
    estas pruebas no es el contenido del frame, sino cuándo se abre y se
    libera la cámara."""

    def __init__(self, *_args, **_kwargs):
        self.released = False

    def isOpened(self):
        return True

    def read(self):
        return True, np.zeros((4, 4, 3), dtype="uint8")

    def release(self):
        self.released = True


@pytest.fixture()
def fake_cv2():
    """Parcha el módulo cv2 completo (CameraPublisher hace `import cv2`
    dentro de sus métodos, no al importar backend/main.py — mismo patrón
    perezoso que el resto del archivo) para que VideoCapture devuelva
    FakeCapture y no se necesite hardware ni el paquete opencv real."""
    captures: list[FakeCapture] = []

    def video_capture_factory(*args, **kwargs):
        cap = FakeCapture(*args, **kwargs)
        captures.append(cap)
        return cap

    fake_module = MagicMock()
    fake_module.VideoCapture.side_effect = video_capture_factory
    fake_module.imencode.return_value = (True, np.array([1, 2, 3], dtype="uint8"))

    with patch.dict(sys.modules, {"cv2": fake_module}):
        yield captures


def _noop_processor():
    """make_processor de prueba: no dibuja nada sobre el frame — estas
    pruebas verifican el ciclo de vida del publicador, no el pipeline de
    detección (eso ya lo cubren edge/perception/test_*.py)."""
    return lambda frame: None


def test_segundo_cliente_no_vuelve_a_abrir_la_camara(fake_cv2):
    publisher = CameraPublisher(camera_index=0, make_processor=_noop_processor, label="test")

    publisher.subscribe()
    publisher.subscribe()

    assert len(fake_cv2) == 1  # un solo cv2.VideoCapture(...) real, para dos clientes
    publisher.unsubscribe()
    publisher.unsubscribe()


def test_camara_se_libera_solo_cuando_se_va_el_ultimo_cliente(fake_cv2):
    publisher = CameraPublisher(camera_index=0, make_processor=_noop_processor, label="test")

    publisher.subscribe()
    publisher.subscribe()
    cap = fake_cv2[0]

    publisher.unsubscribe()
    assert not cap.released, "todavía queda un cliente conectado"

    publisher.unsubscribe()
    assert cap.released, "el último cliente se fue: la cámara debe liberarse"


def test_subscribe_lanza_runtimeerror_si_la_camara_no_abre():
    closed_cap = MagicMock()
    closed_cap.isOpened.return_value = False

    fake_module = MagicMock()
    fake_module.VideoCapture.return_value = closed_cap

    with patch.dict(sys.modules, {"cv2": fake_module}):
        publisher = CameraPublisher(camera_index=0, make_processor=_noop_processor, label="test")
        with pytest.raises(RuntimeError, match="No se pudo abrir la cámara"):
            publisher.subscribe()

    # Un intento fallido no debe dejar el contador de clientes inconsistente
    # (ej. atorado en un estado donde nunca más se pueda reintentar).
    assert publisher._subscriber_count == 0


def test_stream_frames_entrega_multipart_jpeg(fake_cv2):
    publisher = CameraPublisher(camera_index=0, make_processor=_noop_processor, label="test")
    publisher.subscribe()
    try:
        chunk = next(publisher.stream_frames())
        assert chunk.startswith(b"--frame\r\nContent-Type: image/jpeg\r\n\r\n")
        assert chunk.endswith(b"\r\n")
    finally:
        publisher.unsubscribe()


def _cv2_de_prueba():
    """cv2 de mentira cuya cámara abre siempre y recuerda cada llamada a
    set() — para probar CÓMO se abre la cámara (backend, FOURCC, tamaño)."""
    cap = MagicMock()
    cap.isOpened.return_value = True
    cap.read.return_value = (True, np.zeros((4, 4, 3), dtype="uint8"))
    cap.get.return_value = 640
    cap.getBackendName.return_value = "V4L2"

    fake_module = MagicMock()
    fake_module.VideoCapture.return_value = cap
    fake_module.imencode.return_value = (True, np.array([1, 2, 3], dtype="uint8"))
    fake_module.CAP_V4L2 = 200
    fake_module.CAP_PROP_FOURCC = 6
    fake_module.CAP_PROP_FRAME_WIDTH = 3
    fake_module.CAP_PROP_FRAME_HEIGHT = 4
    fake_module.VideoWriter_fourcc.side_effect = lambda *letras: "".join(letras)
    return fake_module, cap


def test_sin_opciones_la_camara_se_abre_como_siempre():
    """Windows no debe cambiar: sin backend/FOURCC/tamaño, solo
    cv2.VideoCapture(índice) y ninguna llamada a set()."""
    fake_module, cap = _cv2_de_prueba()
    with patch.dict(sys.modules, {"cv2": fake_module}):
        publisher = CameraPublisher(camera_index=0, make_processor=_noop_processor, label="test")
        publisher.subscribe()
        publisher.unsubscribe()

    llamada = fake_module.VideoCapture.call_args_list[0]
    assert llamada.args == (0,)
    assert llamada.kwargs == {}
    cap.set.assert_not_called()


def test_backend_v4l2_se_pasa_a_videocapture():
    fake_module, _cap = _cv2_de_prueba()
    with patch.dict(sys.modules, {"cv2": fake_module}):
        publisher = CameraPublisher(
            camera_index=0, make_processor=_noop_processor, label="test", backend="v4l2"
        )
        publisher.subscribe()
        publisher.unsubscribe()

    assert fake_module.VideoCapture.call_args_list[0].args == (0, 200)


def test_fourcc_se_fija_antes_que_el_tamano():
    fake_module, cap = _cv2_de_prueba()
    with patch.dict(sys.modules, {"cv2": fake_module}):
        publisher = CameraPublisher(
            camera_index=0,
            make_processor=_noop_processor,
            label="test",
            backend="v4l2",
            fourcc="MJPG",
            width=640,
            height=480,
        )
        publisher.subscribe()
        publisher.unsubscribe()

    assert [c.args for c in cap.set.call_args_list] == [(6, "MJPG"), (3, 640), (4, 480)]


def test_backend_desconocido_da_error_claro_y_no_deja_clientes_colgados():
    fake_module, _cap = _cv2_de_prueba()
    del fake_module.CAP_NOPE  # el MagicMock inventaría el atributo; así no existe
    with patch.dict(sys.modules, {"cv2": fake_module}):
        publisher = CameraPublisher(
            camera_index=0, make_processor=_noop_processor, label="test", backend="nope"
        )
        with pytest.raises(RuntimeError, match="Backend de cámara desconocido"):
            publisher.subscribe()

    assert publisher._subscriber_count == 0


def test_fourcc_con_longitud_distinta_de_cuatro_se_rechaza_al_construir():
    with pytest.raises(ValueError, match="4 caracteres"):
        CameraPublisher(camera_index=0, make_processor=_noop_processor, label="test", fourcc="MJP")
