"""Entrada de audio: micrófono real (sounddevice) o fuente simulada para pruebas.

El micrófono se abre SOLO mientras el estado es "active" y se cierra del todo al pausar: pausar no es
silenciar, es soltar el dispositivo. Las fuentes entregan bloques PCM 16 kHz, mono, 16 bits.
"""

import logging
import queue

from voice.engine import SAMPLE_RATE

logger = logging.getLogger(__name__)

BLOCK_SAMPLES = 1600  # 100 ms


class MicUnavailable(RuntimeError):
    """No hay micrófono o falta el paquete. El mensaje dice qué hacer."""


class SoundDeviceSource:
    def __init__(self, device: str | None = None):
        try:
            import sounddevice
        except ImportError:
            raise MicUnavailable(
                "Falta el paquete 'sounddevice'. Instálalo: "
                "backend\\.venv\\Scripts\\python.exe -m pip install -r backend\\requirements-voice.txt"
            ) from None
        self._sd = sounddevice
        self._device = int(device) if device and device.isdigit() else (device or None)
        self._stream = None
        self._queue: queue.Queue[bytes] = queue.Queue(maxsize=50)
        self.overflows = 0

    def start(self) -> None:
        if self._stream is not None:
            return

        def callback(indata, frames, time_info, status):
            try:
                self._queue.put_nowait(bytes(indata))
            except queue.Full:  # el procesado va atrás: se descarta audio viejo, no se acumula
                self.overflows += 1

        try:
            self._stream = self._sd.RawInputStream(
                samplerate=SAMPLE_RATE, channels=1, dtype="int16", blocksize=BLOCK_SAMPLES,
                device=self._device, callback=callback,
            )
            self._stream.start()
        except Exception as exc:
            self._stream = None
            raise MicUnavailable(
                f"No pude abrir el micrófono ({type(exc).__name__}: {exc}). Revisa el permiso de micrófono de "
                "Windows y, si hace falta, define AETHER_VOICE_DEVICE con el número que muestra "
                "python -m sounddevice."
            ) from exc

    def stop(self) -> None:
        stream, self._stream = self._stream, None
        if stream is not None:
            try:
                stream.stop()
                stream.close()
            except Exception:
                logger.exception("No se pudo cerrar el micrófono limpiamente.")
        while not self._queue.empty():  # lo capturado no se conserva
            try:
                self._queue.get_nowait()
            except queue.Empty:
                break

    def read(self, timeout: float = 0.2) -> bytes | None:
        try:
            return self._queue.get(timeout=timeout)
        except queue.Empty:
            return None


class ListSource:
    """Fuente simulada: entrega los bloques dados, uno por llamada a read(). Solo para pruebas."""

    def __init__(self, blocks):
        self._blocks = list(blocks)
        self.started = False
        self.start_count = 0

    def start(self) -> None:
        self.started = True
        self.start_count += 1

    def stop(self) -> None:
        self.started = False

    def read(self, timeout: float = 0.2) -> bytes | None:
        if not self.started or not self._blocks:
            return None
        return self._blocks.pop(0)
