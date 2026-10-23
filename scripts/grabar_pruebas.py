"""Graba TUS frases de prueba, en TU ruido, para medir motores de voz con datos reales. Lo corres tú.

    backend\\.venv\\Scripts\\python.exe scripts\\grabar_pruebas.py --carpeta pruebas_voz --rondas 3

AVISO DE PRIVACIDAD: el servicio de voz nunca guarda audio; ESTE script sí, a propósito, y solo en la carpeta que le
indiques, para poder comparar motores con grabaciones reales. La carpeta `pruebas_voz/` está en .gitignore. Bórrala
cuando termines. Graba 16 kHz, mono, 16 bits, el formato que usan el servicio y `comparar_motores.py`.

Para cada frase te la muestra, cuenta 3-2-1 y graba 4 segundos. Los archivos se llaman wake_NN.wav (la frase empieza con
«Lumina», debe activar) o nowake_NN.wav (no debe activar), y junto a cada uno queda un .txt con lo que debías decir.
Hazlo en el lugar y a la distancia reales (con el ruido de la universidad): esa es la prueba que importa.
"""

import argparse
import sys
import time
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from voice.audio import MicUnavailable, SoundDeviceSource  # noqa: E402
from voice.engine import SAMPLE_RATE  # noqa: E402

FRASES_WAKE = [
    "Lumina",
    "Lumina, inicia",
    "Lumina, detente",
    "Lumina, ¿qué puedes hacer?",
    "Lumina, enséñanos quién eres",
    "Lumina, llama a Pedro",
    "Lumina, abre el inventario",
    "Hola Lumina, ¿cómo estás?",
]
FRASES_NOWAKE = [
    "abre el inventario",
    "enséñanos la celda de manufactura",
    "necesito una lámina de acero",
    "la nómina de este mes ya está lista",
    "hay una mina de carbón cerca",
    "enciende la cámara por favor",
    "¿cuántas piezas hay en el inventario?",
    "buenas tardes profesor",
]
SEGUNDOS = 4.0


def grabar(fuente, segundos: float) -> bytes:
    bloques, fin = [], time.monotonic() + segundos
    while time.monotonic() < fin:
        bloque = fuente.read()
        if bloque:
            bloques.append(bloque)
    return b"".join(bloques)


def guardar(ruta: Path, pcm: bytes) -> None:
    with wave.open(str(ruta), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--carpeta", default="pruebas_voz")
    parser.add_argument("--rondas", type=int, default=2, help="cuántas veces repetir cada frase")
    parser.add_argument("--dispositivo", default=None, help="número o nombre del micrófono (python -m sounddevice)")
    args = parser.parse_args()
    carpeta = Path(args.carpeta)
    carpeta.mkdir(parents=True, exist_ok=True)
    try:
        fuente = SoundDeviceSource(args.dispositivo)
        fuente.start()
    except MicUnavailable as exc:
        print(exc)
        return 2
    n_wake = n_nowake = 0
    try:
        print(f"Guardando en {carpeta.resolve()} (ENTRA a disco: bórrala al terminar).\n")
        for ronda in range(args.rondas):
            for tipo, frases in (("wake", FRASES_WAKE), ("nowake", FRASES_NOWAKE)):
                for frase in frases:
                    print(f"\n[{tipo}] Di: «{frase}»")
                    for cuenta in (3, 2, 1):
                        print(f"  {cuenta}...", end="\r", flush=True)
                        time.sleep(1)
                    print("  GRABANDO")
                    pcm = grabar(fuente, SEGUNDOS)
                    if tipo == "wake":
                        n_wake += 1
                        nombre = f"wake_{n_wake:02d}"
                    else:
                        n_nowake += 1
                        nombre = f"nowake_{n_nowake:02d}"
                    guardar(carpeta / f"{nombre}.wav", pcm)
                    (carpeta / f"{nombre}.txt").write_text(frase, encoding="utf-8")
    except KeyboardInterrupt:
        print("\nInterrumpido: lo grabado hasta aquí queda guardado.")
    finally:
        fuente.stop()
    print(f"\nListo: {n_wake} frases con «Lumina» y {n_nowake} sin ella en {carpeta}.")
    print("Siguiente:  backend\\.venv\\Scripts\\python.exe scripts\\comparar_motores.py --carpeta", carpeta)
    return 0


if __name__ == "__main__":
    sys.exit(main())
