"""Compara motores de voz (Vosk, faster-whisper tiny/base/small…) con el MISMO audio, en TU laptop. Lo corres tú.

    # 1) Graba tus frases en tu ruido real:   scripts\\grabar_pruebas.py --carpeta pruebas_voz
    # 2) Compara (cada motor que no esté instalado se salta y lo dice):
    backend\\.venv\\Scripts\\python.exe scripts\\comparar_motores.py --carpeta pruebas_voz --motores vosk whisper:tiny whisper:base whisper:small

    # Con ruido de fondo SIMULADO encima de tus grabaciones (relación voz/ruido en dB; negativo = ruido más fuerte).
    # Acepta varias; `--ruido murmullo` (por defecto) mezcla otras frases habladas, `--ruido blanco` es ruido plano:
    ... --snr 10 5 0
    # La voz sola a un nivel absoluto (RMS en escala 0-32768), para saber si el nivel bajo del micrófono importa:
    ... --nivel 1000

La carpeta tiene archivos .wav mono, 16 kHz, 16 bits. Los que se llaman wake_*.wav DEBEN activar a Lumina; los
nowake_*.wav NO deben activarla. (`scripts\\voz_sintetica.ps1` genera un juego con la voz de Windows para probar el
script, pero eso mide la voz sintética, no la tuya.)

Por cada motor imprime: carga (s), memoria (MB), factor de tiempo real, latencia al cerrar la frase, CPU, y cuántas
veces se detectó la palabra de activación con la regla EXACTA de robot.js y con la regla TOLERANTE de voice/wake.py,
más los falsos positivos en las frases que no debían activar. Todo es lo medido en la corrida; nada está estimado.
Variables: las de siempre (AETHER_VOICE_MODEL para Vosk). `--prompt` prueba el prompt inicial de Whisper (opt-in).
"""

import argparse
import os
import re
import statistics
import sys
import time
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from probar_voz import rss_mb  # noqa: E402
from voice.engine import BYTES_PER_SECOND, SAMPLE_RATE, EngineUnavailable, create_engine  # noqa: E402
from voice.wake import normalizar_activacion  # noqa: E402

# La misma expresión que dashboard/robot.js (LUMINA_PATTERN).
REGLA_EXACTA = re.compile(r"\b(lumina|ilumina|luminia|lumia)\b", re.IGNORECASE)
BLOQUE = 3200  # 100 ms


def leer(ruta: Path) -> np.ndarray:
    with wave.open(str(ruta), "rb") as w:
        if (w.getframerate(), w.getnchannels(), w.getsampwidth()) != (SAMPLE_RATE, 1, 2):
            raise ValueError(f"{ruta.name}: debe ser mono, 16000 Hz, 16 bits")
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64)


def con_ruido(clips: dict, nombre: str, snr_db: float, rng, tipo: str = "murmullo") -> np.ndarray:
    """Mezcla la frase con ruido a la relación pedida: «murmullo» (otras frases habladas, gente hablando) o «blanco»."""
    x = clips[nombre]
    otros = [k for k in clips if k != nombre] or [nombre]
    if tipo == "blanco":
        ruido = rng.normal(0, 1, len(x))
    else:
        ruido = np.zeros(len(x))
        for k in rng.choice(otros, min(3, len(otros)), replace=False):
            y = clips[k]
            ruido += np.tile(y, int(np.ceil(len(x) / len(y))) + 1)[: len(x)]
    rms_x, rms_r = np.sqrt(np.mean(x**2)), max(np.sqrt(np.mean(ruido**2)), 1e-9)
    return np.clip(x + ruido * (rms_x / 10 ** (snr_db / 20) / rms_r), -32768, 32767)


def motor(nombre: str, prompt: str | None):
    if nombre == "vosk":
        return create_engine("vosk", os.environ.get("AETHER_VOICE_MODEL", ""))
    if nombre.startswith("whisper"):
        _, _, modelo = nombre.partition(":")
        return create_engine("whisper", modelo or "base", whisper_prompt=prompt)
    raise EngineUnavailable(f"motor desconocido: {nombre} (usa vosk o whisper:tiny|base|small…)")


def correr(nombre: str, clips: dict, audio: dict, prompt: str | None) -> dict | None:
    rss0, t0 = rss_mb(), time.perf_counter()
    try:
        eng = motor(nombre, prompt)
    except EngineUnavailable as exc:
        print(f"\n[{nombre}] SE SALTA: {exc}")
        return None
    carga = time.perf_counter() - t0
    filas = []
    for clip, pcm in audio.items():
        datos = np.clip(pcm, -32768, 32767).astype(np.int16).tobytes()
        t1, c1 = time.perf_counter(), time.process_time()
        for i in range(0, len(datos), BLOQUE):
            eng.accept(datos[i : i + BLOQUE])
        t2 = time.perf_counter()
        texto = eng.finalize()
        t3, c3 = time.perf_counter(), time.process_time()
        dur = len(datos) / BYTES_PER_SECOND
        debia = clip.startswith("wake")
        filas.append({
            "clip": clip, "debia": debia, "texto": texto, "dur": dur, "total": t3 - t1, "cierre": t3 - t2, "cpu": c3 - c1,
            "exacta": bool(REGLA_EXACTA.search(texto)), "tolerante": bool(REGLA_EXACTA.search(normalizar_activacion(texto))),
        })
    return {"nombre": nombre, "carga": carga, "rss": None if rss0 is None or rss_mb() is None else rss_mb() - rss0, "filas": filas}


def resumen(r: dict) -> None:
    f = r["filas"]
    wake, nowake = [x for x in f if x["debia"]], [x for x in f if not x["debia"]]
    dur, total, cpu = sum(x["dur"] for x in f), sum(x["total"] for x in f), sum(x["cpu"] for x in f)
    cierres = sorted(x["cierre"] for x in f)
    p95 = cierres[int(0.95 * (len(cierres) - 1))] * 1000
    print(f"\n=== {r['nombre']} ({len(wake)} frases con Lumina, {len(nowake)} sin ella) ===")
    memoria = "no se pudo leer" if r["rss"] is None else f"{r['rss']:.0f} MB"
    print(f"carga del modelo       : {r['carga']:.1f} s   memoria añadida: {memoria}")
    print(f"factor de tiempo real  : {total / dur:.2f}   (<1 = más rápido que el audio)")
    print(f"latencia al cerrar     : mediana {statistics.median(cierres) * 1000:.0f} ms, p95 {p95:.0f} ms")
    print(f"CPU                    : {100 * cpu / dur:.0f} % de un núcleo sobre la duración del audio")
    if wake:
        print(f"activa (regla exacta)  : {sum(x['exacta'] for x in wake)}/{len(wake)}")
        print(f"activa (regla tolerante): {sum(x['tolerante'] for x in wake)}/{len(wake)}")
    if nowake:
        print(f"FALSOS (exacta)        : {sum(x['exacta'] for x in nowake)}/{len(nowake)}")
        print(f"FALSOS (tolerante)     : {sum(x['tolerante'] for x in nowake)}/{len(nowake)}")
    print("lo que escribió en las frases con Lumina:")
    for x in wake[:12]:
        print(f"   {x['clip']:>16}: {x['texto']!r}  exacta={x['exacta']} tolerante={x['tolerante']}")
    falsos = [x for x in nowake if x["tolerante"]]
    for x in falsos[:6]:
        print(f"   FALSO {x['clip']:>10}: {x['texto']!r}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--carpeta", required=True)
    parser.add_argument("--motores", nargs="+", default=["vosk"])
    parser.add_argument("--snr", type=float, nargs="+", default=None, help="ruido simulado encima (dB); negativo = más ruido que voz")
    parser.add_argument("--ruido", choices=["murmullo", "blanco"], default="murmullo")
    parser.add_argument("--nivel", type=float, default=None, help="deja la voz sola a este RMS (escala 0-32768)")
    parser.add_argument("--prompt", default=None, help="prompt inicial de Whisper (p. ej. 'Lumina.')")
    parser.add_argument("--semilla", type=int, default=7)
    args = parser.parse_args()
    clips = {p.stem: leer(p) for p in sorted(Path(args.carpeta).glob("*.wav"))}
    if not clips:
        print(f"No hay .wav en {args.carpeta}")
        return 2
    rng = np.random.default_rng(args.semilla)
    print(f"{len(clips)} clips, {sum(len(v) for v in clips.values()) / SAMPLE_RATE:.0f} s de audio")
    condiciones = [("sin ruido", None)] if args.snr is None else [(f"ruido {args.ruido} a {s:+.0f} dB", s) for s in args.snr]
    for etiqueta, snr in condiciones:
        if args.nivel is not None:
            audio = {k: v * (args.nivel / max(np.sqrt(np.mean(v**2)), 1e-9)) for k, v in clips.items()}
            etiqueta += f", voz a RMS {args.nivel:.0f}"
        elif snr is not None:
            audio = {k: con_ruido(clips, k, snr, rng, args.ruido) for k in clips}
        else:
            audio = dict(clips)
        print(f"\n################ {etiqueta} ################")
        for nombre in args.motores:
            r = correr(nombre, clips, audio, args.prompt)
            if r:
                resumen(r)
    return 0


if __name__ == "__main__":
    sys.exit(main())
