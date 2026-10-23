"""Mide el servicio de voz con TU micrófono y TU laptop. Lo corres tú: nada de esto está medido todavía.

    # 1) Calibrar el umbral de detección de voz (8 s: 4 en silencio, 4 hablando):
    backend\\.venv\\Scripts\\python.exe scripts\\probar_voz.py --mic 8

    # 2) Medir latencia, consumo y errores del reconocedor con una grabación tuya (WAV mono, 16 kHz, 16 bits):
    backend\\.venv\\Scripts\\python.exe scripts\\probar_voz.py --wav frase.wav --esperado "abre el inventario"

Usa las mismas variables que el servicio (AETHER_VOICE_ENGINE, AETHER_VOICE_MODEL, AETHER_VOICE_DEVICE). Escribe
solo lo que midió. No guarda audio: con --mic solo calcula niveles y los descarta.
"""

import argparse
import os
import statistics
import sys
import time
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from voice.audio import BLOCK_SAMPLES, MicUnavailable, SoundDeviceSource  # noqa: E402
from voice.core import EnergyVad  # noqa: E402
from voice.engine import EngineUnavailable, SAMPLE_RATE, create_engine  # noqa: E402


def rss_mb() -> float | None:
    """Memoria residente del proceso (MB). Sin dependencias: ctypes en Windows, resource en Linux. None si no se pudo
    leer (NO 0: un cero se confundiría con una medición)."""
    try:
        if sys.platform == "win32":
            import ctypes
            from ctypes import wintypes

            class Contadores(ctypes.Structure):
                _fields_ = [("cb", wintypes.DWORD), ("PageFaultCount", wintypes.DWORD),
                            ("PeakWorkingSetSize", ctypes.c_size_t), ("WorkingSetSize", ctypes.c_size_t),
                            ("QuotaPeakPagedPoolUsage", ctypes.c_size_t), ("QuotaPagedPoolUsage", ctypes.c_size_t),
                            ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t), ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                            ("PagefileUsage", ctypes.c_size_t), ("PeakPagefileUsage", ctypes.c_size_t)]

            kernel32, psapi = ctypes.WinDLL("kernel32"), ctypes.WinDLL("psapi")
            kernel32.GetCurrentProcess.restype = wintypes.HANDLE  # sin esto el pseudo-handle -1 se trunca a 32 bits y la llamada falla
            psapi.GetProcessMemoryInfo.argtypes = [wintypes.HANDLE, ctypes.POINTER(Contadores), wintypes.DWORD]
            psapi.GetProcessMemoryInfo.restype = wintypes.BOOL
            c = Contadores()
            c.cb = ctypes.sizeof(c)
            if not psapi.GetProcessMemoryInfo(kernel32.GetCurrentProcess(), ctypes.byref(c), c.cb):
                return None
            return round(c.WorkingSetSize / 1_048_576, 1)
        import resource

        return round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024, 1)
    except Exception:
        return None


def calibrar(segundos: float) -> int:
    fuente = SoundDeviceSource(os.environ.get("AETHER_VOICE_DEVICE") or None)
    mitad = segundos / 2
    niveles = {"silencio": [], "voz": []}
    try:
        fuente.start()
    except MicUnavailable as exc:
        print(exc)
        return 2
    try:
        for fase, texto in (("silencio", "NO hables"), ("voz", "HABLA con normalidad")):
            print(f"\n>>> {texto} durante {mitad:.0f} s ...")
            fin = time.monotonic() + mitad
            while time.monotonic() < fin:
                bloque = fuente.read()
                if bloque:
                    niveles[fase].append(EnergyVad.rms(bloque))
    finally:
        fuente.stop()
    if not niveles["silencio"] or not niveles["voz"]:
        print("No llegó audio. Revisa el permiso de micrófono de Windows y AETHER_VOICE_DEVICE.")
        return 2
    s, v = sorted(niveles["silencio"]), sorted(niveles["voz"])
    p95_silencio, p25_voz = s[int(0.95 * (len(s) - 1))], v[int(0.25 * (len(v) - 1))]
    print("\n=== Niveles (RMS en escala 0-32768) ===")
    print(f"silencio: mediana {statistics.median(s):.0f}, p95 {p95_silencio:.0f}, máximo {s[-1]:.0f}")
    print(f"voz     : mediana {statistics.median(v):.0f}, p25 {p25_voz:.0f}, máximo {v[-1]:.0f}")
    if p25_voz <= p95_silencio:
        print("\nLa voz no se separa del ruido de fondo: acerca el micrófono o baja el ruido. No sugiero umbral.")
        return 1
    print(f"\nUmbral sugerido: AETHER_VOICE_VAD_THRESHOLD={int((p95_silencio + p25_voz) / 2)}  (valor por defecto: 500)")
    return 0


def palabras_erradas(esperado: str, obtenido: str) -> float:
    ref, hip = esperado.lower().split(), obtenido.lower().split()
    previo = list(range(len(hip) + 1))
    for i, r in enumerate(ref, 1):
        actual = [i]
        for j, h in enumerate(hip, 1):
            actual.append(min(previo[j] + 1, actual[-1] + 1, previo[j - 1] + (r != h)))
        previo = actual
    return previo[-1] / max(1, len(ref))


def medir_wav(ruta: str, esperado: str | None) -> int:
    try:
        motor = create_engine(os.environ.get("AETHER_VOICE_ENGINE", "vosk"), os.environ.get("AETHER_VOICE_MODEL", ""))
    except EngineUnavailable as exc:
        print(exc)
        return 2
    with wave.open(ruta, "rb") as wav:
        if (wav.getframerate(), wav.getnchannels(), wav.getsampwidth()) != (SAMPLE_RATE, 1, 2):
            print(f"El WAV debe ser mono, {SAMPLE_RATE} Hz, 16 bits (este: {wav.getframerate()} Hz, "
                  f"{wav.getnchannels()} canal(es), {8 * wav.getsampwidth()} bits).")
            return 2
        datos = wav.readframes(wav.getnframes())
    duracion = len(datos) / (2 * SAMPLE_RATE)
    paso = BLOCK_SAMPLES * 2
    t0, cpu0 = time.perf_counter(), time.process_time()
    for i in range(0, len(datos), paso):
        motor.accept(datos[i : i + paso])
    t_audio = time.perf_counter()
    texto = motor.finalize()
    t_fin = time.perf_counter()
    cpu = time.process_time() - cpu0
    print("\n=== Resultado (lo medido) ===")
    print(f"motor                    : {motor.name}")
    print(f"audio                    : {duracion:.1f} s")
    print(f"tiempo de proceso total  : {t_fin - t0:.2f} s   (factor de tiempo real {(t_fin - t0) / duracion:.2f}; <1 = más rápido que el audio)")
    print(f"latencia al cerrar frase : {(t_fin - t_audio) * 1000:.0f} ms   <- lo que esperas tras dejar de hablar")
    print(f"CPU del proceso          : {cpu:.2f} s de CPU ({100 * cpu / duracion:.0f} % de un núcleo sobre la duración del audio)")
    print(f"memoria del proceso      : {rss_mb()} MB")
    print(f"texto reconocido         : {texto!r}")
    if esperado:
        print(f"palabras erradas (WER)   : {100 * palabras_erradas(esperado, texto):.0f} %  (esperado: {esperado!r})")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    grupo = parser.add_mutually_exclusive_group(required=True)
    grupo.add_argument("--mic", type=float, metavar="SEGUNDOS", help="calibrar el umbral con el micrófono")
    grupo.add_argument("--wav", metavar="ARCHIVO", help="medir el reconocedor con una grabación")
    parser.add_argument("--esperado", help="texto correcto, para calcular el porcentaje de palabras erradas")
    args = parser.parse_args()
    return calibrar(args.mic) if args.mic else medir_wav(args.wav, args.esperado)


if __name__ == "__main__":
    sys.exit(main())
