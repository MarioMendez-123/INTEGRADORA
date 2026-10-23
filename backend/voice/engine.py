"""Motores de reconocimiento de voz intercambiables (adaptadores).

Contrato mínimo que usa VoiceCore:
    accept(pcm: bytes)  recibe audio PCM 16 kHz, mono, 16 bits
    finalize() -> str   cierra la frase y devuelve el texto final ("" si no hubo nada)
    reset()             descarta lo acumulado sin devolver texto

Los paquetes pesados (vosk, faster-whisper) se importan al construir el motor: si faltan, el mensaje dice
exactamente qué instalar. Nada de esto se ha medido: scripts/probar_voz.py mide latencia y consumo.
"""

import json
from pathlib import Path

SAMPLE_RATE = 16000
BYTES_PER_SECOND = SAMPLE_RATE * 2


class EngineUnavailable(RuntimeError):
    """El motor no se puede usar (paquete o modelo ausente). El mensaje dice qué hacer."""


class VoskEngine:
    name = "vosk"

    def __init__(self, model_path: str):
        try:
            import vosk
        except ImportError:
            raise EngineUnavailable(
                "Falta el paquete 'vosk'. Instálalo en el entorno del backend: "
                "backend\\.venv\\Scripts\\python.exe -m pip install -r backend\\requirements-voice.txt"
            ) from None
        if not model_path or not Path(model_path).is_dir():
            raise EngineUnavailable(
                f"No encuentro el modelo de Vosk en '{model_path}'. Descarga un modelo pequeño en español "
                "(vosk-model-small-es) de https://alphacephei.com/vosk/models, descomprímelo y apunta "
                "AETHER_VOICE_MODEL a su carpeta."
            )
        vosk.SetLogLevel(-1)
        self._recognizer = vosk.KaldiRecognizer(vosk.Model(str(model_path)), SAMPLE_RATE)

    def accept(self, pcm: bytes) -> None:
        self._recognizer.AcceptWaveform(pcm)

    def finalize(self) -> str:
        return (json.loads(self._recognizer.FinalResult()).get("text") or "").strip()

    def reset(self) -> None:
        self._recognizer.Reset()


class WhisperEngine:
    """faster-whisper en CPU (int8). Decodifica la frase completa al cerrarla: más preciso, más tardado."""

    name = "whisper"

    def __init__(self, model_name: str):
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise EngineUnavailable(
                "Falta el paquete 'faster-whisper'. Instálalo: "
                "backend\\.venv\\Scripts\\python.exe -m pip install faster-whisper"
            ) from None
        self._model = WhisperModel(model_name or "base", device="cpu", compute_type="int8")
        self._buffer = bytearray()

    def accept(self, pcm: bytes) -> None:
        self._buffer.extend(pcm)

    def finalize(self) -> str:
        import numpy as np

        if not self._buffer:
            return ""
        audio = np.frombuffer(bytes(self._buffer), dtype=np.int16).astype(np.float32) / 32768.0
        self._buffer.clear()
        segments, _ = self._model.transcribe(audio, language="es", beam_size=1, vad_filter=False)
        return " ".join(segment.text.strip() for segment in segments).strip()

    def reset(self) -> None:
        self._buffer.clear()


def create_engine(name: str, model: str):
    if name == "vosk":
        return VoskEngine(model)
    if name == "whisper":
        return WhisperEngine(model)
    raise EngineUnavailable(f"Motor de voz desconocido: '{name}' (usa vosk o whisper).")
