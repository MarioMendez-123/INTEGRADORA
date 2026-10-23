"""Núcleo del servicio de voz: detección de voz, segmentación, pausa y anti-eco. Sin micrófono, sin red.

Recibe bloques de audio (feed) y avisa con callbacks (on_transcript, on_state). Todo el reloj es
inyectable, así que las pruebas avanzan el tiempo a mano. El audio nunca se guarda: solo hay un anillo
corto en memoria (pre_roll_s) para no cortar el principio de la frase.
"""

import threading
import time
from collections import deque

import numpy as np

from voice.engine import BYTES_PER_SECOND

ACTIVE, PAUSED, OFF = "active", "paused", "off"


class EnergyVad:
    """Voz = energía (RMS en escala int16) por encima del umbral. Simple a propósito; se afina con
    AETHER_VOICE_VAD_THRESHOLD y scripts/probar_voz.py --mic."""

    def __init__(self, threshold: float = 500.0):
        self.threshold = threshold

    @staticmethod
    def rms(pcm: bytes) -> float:
        samples = np.frombuffer(pcm, dtype=np.int16)
        if samples.size == 0:
            return 0.0
        return float(np.sqrt(np.mean(samples.astype(np.float64) ** 2)))

    def is_voice(self, pcm: bytes) -> bool:
        return self.rms(pcm) >= self.threshold


class VoiceCore:
    def __init__(self, engine, vad, on_transcript, on_state=lambda state: None, clock=time.monotonic,
                 hangover_s: float = 0.8, pre_roll_s: float = 0.3, echo_tail_s: float = 0.8,
                 max_segment_s: float = 20.0, initial_state: str = ACTIVE):
        self._engine = engine
        self._vad = vad
        self._on_transcript = on_transcript
        self._on_state = on_state
        self._clock = clock
        self._hangover = hangover_s
        self._pre_roll_bytes = int(pre_roll_s * BYTES_PER_SECOND)
        self._echo_tail = echo_tail_s
        self._max_segment_bytes = int(max_segment_s * BYTES_PER_SECOND)
        self._lock = threading.Lock()
        self._pre_roll: deque[bytes] = deque()
        self._pre_roll_size = 0
        self._in_speech = False
        self._segment_bytes = 0
        self._last_voice = 0.0
        self._echo_until = 0.0
        self.speaking = False
        self.state = initial_state
        self.discarded_segments = 0
        self.transcripts = 0

    # ------------------------------------------------------------------ estado

    def set_state(self, state: str) -> None:
        with self._lock:
            if state == self.state:
                return
            self.state = state
            self._drop_segment()
        self._on_state(state)

    def set_speaking(self, value: bool) -> None:
        """Lumina empieza o deja de hablar. Al empezar se tira lo que se estuviera reconociendo."""
        with self._lock:
            if value == self.speaking:
                return
            self.speaking = value
            if value:
                self._drop_segment()
            else:
                self._echo_until = self._clock() + self._echo_tail

    # ------------------------------------------------------------------ audio

    def feed(self, pcm: bytes) -> None:
        text = None
        with self._lock:
            if self.state != ACTIVE:
                return
            now = self._clock()
            if self.speaking or now < self._echo_until:
                self._drop_segment()  # lo que se oiga ahora es la propia voz de Lumina
                return
            if self._vad.is_voice(pcm):
                if not self._in_speech:
                    self._in_speech = True
                    for block in self._pre_roll:
                        self._engine.accept(block)
                        self._segment_bytes += len(block)
                    self._pre_roll.clear()
                    self._pre_roll_size = 0
                self._last_voice = now
                self._engine.accept(pcm)
                self._segment_bytes += len(pcm)
            elif self._in_speech:
                self._engine.accept(pcm)
                self._segment_bytes += len(pcm)
            else:
                self._remember(pcm)
            if self._in_speech and (now - self._last_voice >= self._hangover or self._segment_bytes >= self._max_segment_bytes):
                text = self._close_segment()
        if text and not self.speaking and self.state == ACTIVE:  # si Lumina empezó a hablar mientras se decodificaba, se tira
            self.transcripts += 1
            self._on_transcript(text)
        elif text:
            self.discarded_segments += 1

    # ------------------------------------------------------------------ internos (con el candado tomado)

    def _remember(self, pcm: bytes) -> None:
        self._pre_roll.append(pcm)
        self._pre_roll_size += len(pcm)
        while self._pre_roll_size > self._pre_roll_bytes and len(self._pre_roll) > 1:
            self._pre_roll_size -= len(self._pre_roll.popleft())

    def _close_segment(self) -> str:
        self._in_speech = False
        self._segment_bytes = 0
        return self._engine.finalize()

    def _drop_segment(self) -> None:
        if self._in_speech:
            self.discarded_segments += 1
            self._engine.reset()
        self._in_speech = False
        self._segment_bytes = 0
        self._pre_roll.clear()
        self._pre_roll_size = 0
