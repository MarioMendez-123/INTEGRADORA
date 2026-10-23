"""Aviso persistente en la consola de PowerShell mientras el micrófono esté activo, y teclas de control.

El estado se pinta en UNA línea que se reescribe (ACTIVO / PAUSADO / APAGADO, con hora), nunca con colores
que dependan de que el terminal los soporte para entenderse. Solo biblioteca estándar.
"""

import sys
from datetime import datetime

LABELS = {"active": "MICRÓFONO ACTIVO", "paused": "MICRÓFONO PAUSADO", "off": "MICRÓFONO APAGADO"}
HELP = "[p] pausar/reanudar   [w] despertar a Lumina   [q] salir"


def render_status(state: str, now: datetime, detail: str = "") -> str:
    label = LABELS.get(state, state.upper())
    marca = {"active": "●", "paused": "‖", "off": "○"}.get(state, "?")
    texto = f"{marca} {label} · {now:%H:%M:%S}"
    if detail:
        texto += f" · {detail}"
    return f"{texto} · {HELP}"


def render_header(engine_name: str, server: str, now: datetime) -> str:
    return "\n".join(
        [
            "=" * 64,
            f" Servicio de voz de Aether · {now:%Y-%m-%d %H:%M:%S}",
            f" Motor: {engine_name}   Servidor: {server}",
            " Solo viaja TEXTO. El audio no se guarda ni sale de esta laptop.",
            "=" * 64,
        ]
    )


def enable_ansi() -> None:
    """Windows 10+ necesita pedir el modo de secuencias de escape para poder reescribir la línea."""
    if sys.platform != "win32":
        return
    try:
        import ctypes

        kernel = ctypes.windll.kernel32
        handle = kernel.GetStdHandle(-11)
        mode = ctypes.c_uint32()
        if kernel.GetConsoleMode(handle, ctypes.byref(mode)):
            kernel.SetConsoleMode(handle, mode.value | 0x0004)
    except Exception:
        pass


class StatusLine:
    def __init__(self, stream=None):
        self._stream = stream or sys.stdout
        self._last = ""

    def show(self, text: str) -> None:
        if text == self._last:
            return
        self._last = text
        try:
            self._stream.write("\r\x1b[2K" + text)
            self._stream.flush()
        except (OSError, ValueError, UnicodeEncodeError):
            pass

    def message(self, text: str) -> None:
        """Una línea normal (por ejemplo un error) sin pisar el estado; el estado se repinta después."""
        try:
            self._stream.write("\r\x1b[2K" + text + "\n")
            self._stream.flush()
        except (OSError, ValueError, UnicodeEncodeError):
            pass
        self._last = ""


class KeyReader:
    """Lee teclas sin bloquear (msvcrt en Windows). En otros sistemas, o sin consola, no hay teclas."""

    def __init__(self):
        try:
            import msvcrt

            self._msvcrt = msvcrt if sys.stdin and sys.stdin.isatty() else None
        except ImportError:
            self._msvcrt = None

    def poll(self) -> str | None:
        if self._msvcrt is None or not self._msvcrt.kbhit():
            return None
        try:
            return self._msvcrt.getwch().lower()
        except OSError:
            return None
