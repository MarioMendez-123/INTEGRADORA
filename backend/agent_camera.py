"""Publicador de cámara del agente: lectura y entrega desacopladas.

CameraPublisher (camera_publisher.py) lee, procesa y codifica en una sola vuelta, así que un
procesado lento baja los FPS de lo que la cámara sí entrega. Aquí un hilo lee la cámara al ritmo
del hardware y deja solo el cuadro más reciente (los viejos se descartan, nunca se acumulan), y
otro hilo lo anota, lo codifica a JPEG y lo publica. Así se pueden medir por separado FPS de
cámara y FPS de entrega.

Reutiliza de CameraPublisher todo lo demás (suscripción, apertura de la cámara, stream_frames).
CameraPublisher no se modifica: la laptop sigue usando el comportamiento de siempre.
"""

import logging
import threading

from camera_publisher import CameraPublisher
from perception_pipeline import FpsMeter

logger = logging.getLogger(__name__)


class AgentCameraPublisher(CameraPublisher):
    def __init__(self, *args, jpeg_quality: int = 80, **kwargs):
        super().__init__(*args, **kwargs)
        self._jpeg_quality = jpeg_quality
        self.read_meter = FpsMeter()
        self.delivery_meter = FpsMeter()
        self.frame_size: tuple[int, int] | None = None
        self.last_error: str | None = None

    def stats(self) -> dict:
        width, height = self.frame_size or (None, None)
        return {
            "open": self.is_running(),
            "fps_camera": self.read_meter.rate(),
            "fps_delivery": self.delivery_meter.rate(),
            "width": width,
            "height": height,
        }

    def _run(self, cap, processor) -> None:
        import cv2

        self.last_error = None
        slot = {"frame": None, "seq": 0}
        cond = threading.Condition()
        reader_done = threading.Event()
        local_stop = threading.Event()

        def reader() -> None:
            try:
                while not self._stop_event.is_set() and not local_stop.is_set():
                    ok, frame = cap.read()
                    if not ok:
                        self.last_error = "No se pudo leer un cuadro de la cámara."
                        logger.warning("Publicador '%s': %s Cerrando.", self._label, self.last_error)
                        break
                    self.read_meter.tick()
                    with cond:
                        slot["frame"] = frame
                        slot["seq"] += 1
                        cond.notify()
            except Exception as exc:
                self.last_error = f"{type(exc).__name__}: {exc}"
                logger.exception("Publicador '%s': falló la lectura de la cámara.", self._label)
            finally:
                reader_done.set()
                with cond:
                    cond.notify_all()

        reader_thread = threading.Thread(target=reader, name=f"camera-reader-{self._label}", daemon=True)
        reader_thread.start()
        seen = 0
        params = [int(cv2.IMWRITE_JPEG_QUALITY), self._jpeg_quality]
        try:
            while not self._stop_event.is_set():
                with cond:
                    while slot["seq"] == seen and not reader_done.is_set() and not self._stop_event.is_set():
                        cond.wait(timeout=0.5)
                    if slot["seq"] == seen:
                        if reader_done.is_set():
                            break
                        continue
                    frame, seen = slot["frame"], slot["seq"]

                processor(frame)
                ok, buffer = cv2.imencode(".jpg", frame, params)
                if not ok:
                    continue
                self.frame_size = (int(frame.shape[1]), int(frame.shape[0]))
                with self._condition:
                    self._latest_jpeg = buffer.tobytes()
                    self._condition.notify_all()
                self.delivery_meter.tick()
        except Exception as exc:
            self.last_error = f"{type(exc).__name__}: {exc}"
            logger.exception("Publicador '%s': falló el procesado; cerrando.", self._label)
        finally:
            local_stop.set()
            reader_thread.join(timeout=2)
            cap.release()
            close = getattr(processor, "close", None)
            if close is not None:
                try:
                    close()
                except Exception:
                    logger.exception("Publicador '%s': no se pudo cerrar el procesador.", self._label)
