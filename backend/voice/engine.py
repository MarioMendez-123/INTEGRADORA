"""Motores de reconocimiento de voz intercambiables (adaptadores).

Contrato mínimo que usa VoiceCore:
    accept(pcm: bytes) -> str | None   recibe audio PCM 16 kHz, mono, 16 bits. Devuelve texto SOLO si el propio motor
                                       cerró una frase (Vosk la cierra por su detector de silencio acústico); si no, None
    finalize() -> str                  cierra la frase y devuelve el texto final ("" si no hubo nada)
    reset()                            descarta lo acumulado sin devolver texto

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

    def accept(self, pcm: bytes) -> str | None:
        # AcceptWaveform es True cuando Vosk detecta el final de una frase con su modelo acústico, que distingue mejor la
        # voz del ruido que un umbral de energía: con ruido constante el umbral nunca baja y la frase tardaba hasta
        # max_segment_s (20 s) en salir.
        if self._recognizer.AcceptWaveform(pcm):
            return (json.loads(self._recognizer.Result()).get("text") or "").strip() or None
        return None

    def finalize(self) -> str:
        return (json.loads(self._recognizer.FinalResult()).get("text") or "").strip()

    def reset(self) -> None:
        self._recognizer.Reset()


class WhisperEngine:
    """faster-whisper en CPU (int8). Decodifica la frase completa al cerrarla: más preciso, más tardado."""

    name = "whisper"

    def __init__(self, model_name: str, initial_prompt: str | None = None):
        # initial_prompt: texto que "orienta" a Whisper (p. ej. «Lumina.») para que escriba bien un nombre propio.
        # Es OPT-IN (AETHER_VOICE_WHISPER_PROMPT): con ruido o silencio Whisper puede repetir el prompt como si lo
        # hubiera oído, y eso activaría a Lumina sola. Hay que medirlo con comparar_motores.py antes de dejarlo.
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise EngineUnavailable(
                "Falta el paquete 'faster-whisper'. Instálalo: "
                "backend\\.venv\\Scripts\\python.exe -m pip install faster-whisper"
            ) from None
        self._model = WhisperModel(model_name or "base", device="cpu", compute_type="int8")
        self._buffer = bytearray()
        self._initial_prompt = initial_prompt or None

    def accept(self, pcm: bytes) -> None:
        self._buffer.extend(pcm)  # Whisper decodifica la frase completa en finalize(); no cierra frases solo

    def finalize(self) -> str:
        import numpy as np

        if not self._buffer:
            return ""
        audio = np.frombuffer(bytes(self._buffer), dtype=np.int16).astype(np.float32) / 32768.0
        self._buffer.clear()
        segments, _ = self._model.transcribe(
            audio, language="es", beam_size=1, vad_filter=False, initial_prompt=self._initial_prompt
        )
        return " ".join(segment.text.strip() for segment in segments).strip()

    def reset(self) -> None:
        self._buffer.clear()


def create_engine(name: str, model: str, whisper_prompt: str | None = None):
    if name == "vosk":
        return VoskEngine(model)
    if name == "whisper":
        return WhisperEngine(model, initial_prompt=whisper_prompt)
    raise EngineUnavailable(f"Motor de voz desconocido: '{name}' (usa vosk o whisper).")
