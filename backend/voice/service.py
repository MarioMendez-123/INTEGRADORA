"""Servicio de voz de la laptop. Desde backend/:   python -m voice.service

Micrófono -> detección de voz -> reconocedor local en español -> SOLO el texto final, por WebSocket, al servidor,
que lo reenvía a las páginas de Lumina. No necesita ninguna página abierta en la laptop. El audio no se guarda en
disco, no se escribe en logs y no sale de este proceso.

Teclas en esta consola:  p = pausar/reanudar (pausar SUELTA el micrófono)   w = despertar a Lumina sin hablar   q = salir
Variables: docs/variables_entorno.md (AETHER_VOICE_*).
"""

import logging
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from urllib.parse import urlparse

from settings import ConfigError, env_bool, env_choice, env_float, env_str
from voice.audio import MicUnavailable, SoundDeviceSource
from voice.console import KeyReader, StatusLine, enable_ansi, render_header, render_status
from voice.core import ACTIVE, OFF, PAUSED, EnergyVad, VoiceCore
from voice.engine import EngineUnavailable, create_engine
from voice.hublink import HubLink
from voice.notify import notify_windows
from voice.wake import normalizar_activacion

logger = logging.getLogger("voice")

DEFAULT_SERVER = "ws://127.0.0.1:8000/voice/ws"


@dataclass(frozen=True)
class VoiceSettings:
    server: str
    engine: str
    model: str
    device: str
    start_active: bool
    echo_tail_s: float
    vad_threshold: float
    log_text: bool
    notify: bool
    wake_fuzzy: bool = True
    whisper_prompt: str = ""

    @classmethod
    def from_env(cls) -> "VoiceSettings":
        server = env_str("AETHER_VOICE_SERVER", DEFAULT_SERVER)
        parsed = urlparse(server)
        if parsed.scheme not in {"ws", "wss"} or not parsed.hostname:
            raise ConfigError(f"AETHER_VOICE_SERVER debe ser como {DEFAULT_SERVER}, no '{server}'.")
        engine = env_choice("AETHER_VOICE_ENGINE", "vosk", ("vosk", "whisper"))
        model = env_str("AETHER_VOICE_MODEL")
        if engine == "vosk" and not model:
            raise ConfigError(
                "AETHER_VOICE_MODEL debe apuntar a la carpeta del modelo de Vosk en español "
                "(vosk-model-small-es). Ver docs/guia_arranque.md, sección 1.4."
            )
        return cls(
            server=server,
            engine=engine,
            model=model,
            device=env_str("AETHER_VOICE_DEVICE"),
            start_active=env_choice("AETHER_VOICE_START", "on", ("on", "off")) == "on",
            echo_tail_s=env_float("AETHER_VOICE_ECHO_TAIL_S", 0.8, minimo=0.0, maximo=10.0),
            vad_threshold=env_float("AETHER_VOICE_VAD_THRESHOLD", 500.0, minimo=1.0, maximo=20000.0),
            log_text=env_bool("AETHER_VOICE_LOG_TEXT", False),
            notify=env_bool("AETHER_VOICE_NOTIFY", True),
            wake_fuzzy=env_bool("AETHER_VOICE_WAKE_FUZZY", True),
            whisper_prompt=env_str("AETHER_VOICE_WHISPER_PROMPT"),
        )


class VoiceService:
    """Une el núcleo, el micrófono, el enlace y la consola. step() hace una vuelta; run() repite hasta salir."""

    def __init__(self, settings: VoiceSettings, engine, source, link, console=None, keys=None, notify=notify_windows,
                 clock=time.monotonic, wall_clock=datetime.now):
        self.settings = settings
        self._source = source
        self._link = link
        self._console = console or StatusLine()
        self._keys = keys or KeyReader()
        self._notify = notify
        self._wall = wall_clock
        self._quit = False
        self.core = VoiceCore(
            engine,
            EnergyVad(settings.vad_threshold),
            on_transcript=self._on_transcript,
            on_state=self._on_state,
            clock=clock,
            echo_tail_s=settings.echo_tail_s,
            initial_state=ACTIVE if settings.start_active else PAUSED,
        )
        link.on_speaking = self.core.set_speaking
        link.on_connect = self.publish_state

    # ------------------------------------------------------------------ eventos

    def _on_transcript(self, text: str) -> None:
        if self.settings.wake_fuzzy:
            corregido = normalizar_activacion(text)
            if corregido != text:
                logger.info("Palabra de activación corregida (voice/wake.py)")  # sin el texto: puede ser una frase privada
                text = corregido
        self._link.send({"v": 1, "type": "transcript", "text": text[:500], "t": datetime.now(timezone.utc).isoformat()})
        logger.info("Frase enviada (%d caracteres)%s", len(text), f": {text}" if self.settings.log_text else "")

    def _on_state(self, state: str) -> None:
        if state == ACTIVE:
            self._open_mic()
        else:
            self._source.stop()
        self.publish_state()
        self._notify("Aether · micrófono", {"active": "ACTIVO", "paused": "PAUSADO", "off": "APAGADO"}[state],
                     self.settings.notify)

    def _open_mic(self) -> None:
        try:
            self._source.start()
        except MicUnavailable as exc:
            self._console.message(f"ERROR: {exc}")
            logger.error("%s", exc)
            self.core.state = PAUSED  # no fingir que escucha

    def publish_state(self) -> None:
        self._link.send({"v": 1, "type": "status", "state": self.core.state, "t": datetime.now(timezone.utc).isoformat()})

    # ------------------------------------------------------------------ ciclo

    def start(self) -> None:
        self._console.message(render_header(self.settings.engine, self.settings.server, self._wall()))
        if self.core.state == ACTIVE:
            self._open_mic()
        self.publish_state()
        self._notify("Aether · micrófono", {"active": "ACTIVO", "paused": "PAUSADO", "off": "APAGADO"}[self.core.state],
                     self.settings.notify)

    def step(self) -> bool:
        """Una vuelta. False cuando hay que salir."""
        key = self._keys.poll()
        if key == "q":
            self._quit = True
        elif key == "p":
            self.core.set_state(PAUSED if self.core.state == ACTIVE else ACTIVE)
        elif key == "w" and self.core.state == ACTIVE:
            # Despertar sin hablar: con ruido el reconocedor puede no entender «Lumina»; esto manda la palabra de
            # activación como si se hubiera dicho. Es solo texto, igual que lo que reconoce el micrófono.
            self._on_transcript("lumina")
        block = self._source.read() if self.core.state == ACTIVE else None
        if block is not None:
            self.core.feed(block)
        elif self.core.state != ACTIVE:
            time.sleep(0.05)
        detail = "" if self._link.connected else "sin conexión con el servidor"
        if self.core.speaking:
            detail = "Lumina habla: no escucho"
        self._console.show(render_status(self.core.state, self._wall(), detail))
        return not self._quit

    def stop(self) -> None:
        self.core.state = OFF
        self._source.stop()
        self.publish_state()
        time.sleep(0.3)  # deja salir el último estado antes de cerrar el enlace
        self._notify("Aether · micrófono", "APAGADO", self.settings.notify)
        self._console.message(render_status(OFF, self._wall()))

    def run(self) -> None:
        self.start()
        try:
            while self.step():
                pass
        except KeyboardInterrupt:
            pass
        finally:
            self.stop()


def _setup_logging() -> None:
    from pathlib import Path

    log_dir = Path(__file__).resolve().parent.parent / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s", "%Y-%m-%d %H:%M:%S")
    file_handler = logging.FileHandler(log_dir / "voice.log", encoding="utf-8")
    file_handler.setFormatter(formatter)
    console = logging.StreamHandler()
    console.setLevel(logging.WARNING)  # la consola es del estado; solo avisos y errores
    console.setFormatter(formatter)
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(file_handler)
    root.addHandler(console)


def _load_env() -> None:
    """Comparte backend/.env con el servidor (AETHER_VOICE_* viven ahí). Si no hay python-dotenv, solo el entorno."""
    try:
        from pathlib import Path

        from dotenv import load_dotenv

        load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    except ImportError:
        pass


def main() -> int:
    _load_env()
    _setup_logging()
    enable_ansi()
    try:
        settings = VoiceSettings.from_env()
        engine = create_engine(settings.engine, settings.model, whisper_prompt=settings.whisper_prompt or None)
        source = SoundDeviceSource(settings.device or None)
    except (ConfigError, EngineUnavailable, MicUnavailable) as exc:
        print(f"No puedo arrancar el servicio de voz: {exc}")
        return 2
    link = HubLink(f"{settings.server}?role=service")
    service = VoiceService(settings, engine, source, link)
    link.start()
    try:
        service.run()
    finally:
        link.stop()
    return 0


if __name__ == "__main__":
    sys.exit(main())
