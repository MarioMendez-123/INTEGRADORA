"""Dicta AETHER_DICTADO.txt con ElevenLabs y junta un solo mp3."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXTO = ROOT / "AETHER_DICTADO.txt"
SALIDA = ROOT / "AETHER_NARRACION.mp3"
TROZOS = ROOT / "AETHER_NARRACION_trozos"
LIMITE = 8000


def entorno() -> dict[str, str]:
    datos: dict[str, str] = {}
    for linea in (ROOT / "backend" / ".env").read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#") or "=" not in linea:
            continue
        clave, valor = linea.split("=", 1)
        datos[clave.strip()] = valor.strip().strip('"').strip("'")
    return datos


def trocear(texto: str, limite: int) -> list[str]:
    partes: list[str] = []
    actual: list[str] = []
    cuenta = 0
    for parrafo in texto.split("\n\n"):
        parrafo = parrafo.strip()
        if not parrafo:
            continue
        extra = len(parrafo) + 2
        if actual and cuenta + extra > limite:
            partes.append("\n\n".join(actual))
            actual, cuenta = [], 0
        if len(parrafo) > limite:
            if actual:
                partes.append("\n\n".join(actual))
                actual, cuenta = [], 0
            frases = parrafo.replace(". ", ".\n").split("\n")
            buf: list[str] = []
            n = 0
            for frase in frases:
                if buf and n + len(frase) + 1 > limite:
                    partes.append(" ".join(buf))
                    buf, n = [], 0
                buf.append(frase)
                n += len(frase) + 1
            if buf:
                partes.append(" ".join(buf))
            continue
        actual.append(parrafo)
        cuenta += extra
    if actual:
        partes.append("\n\n".join(actual))
    return partes


def pedir(texto: str, clave: str, voz: str) -> bytes:
    cuerpo = json.dumps({"text": texto, "model_id": "eleven_multilingual_v2"}).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voz}?output_format=mp3_44100_128",
        data=cuerpo,
        headers={
            "xi-api-key": clave,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        return resp.read()


def juntar(archivos: list[Path], destino: Path) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        lista = TROZOS / "lista.txt"
        lista.write_text(
            "".join(f"file '{archivo.resolve().as_posix()}'\n" for archivo in archivos),
            encoding="utf-8",
        )
        subprocess.run(
            [ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", str(destino)],
            check=True,
            capture_output=True,
        )
        return
    with destino.open("wb") as salida:
        for archivo in archivos:
            salida.write(archivo.read_bytes())


def main() -> None:
    env = entorno()
    clave = env.get("ELEVENLABS_API_KEY", "")
    voz = env.get("ELEVENLABS_VOICE_ID", "")
    print(f"clave {'si' if clave else 'no'} voz {'si' if voz else 'no'}", flush=True)
    if not clave or not voz:
        raise SystemExit("Faltan ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID en backend/.env")

    texto = TEXTO.read_text(encoding="utf-8").strip()
    partes = trocear(texto, LIMITE)
    print(f"trozos {len(partes)} caracteres {len(texto)}", flush=True)
    TROZOS.mkdir(exist_ok=True)
    archivos: list[Path] = []
    for i, parte in enumerate(partes, start=1):
        destino = TROZOS / f"{i:02d}.mp3"
        if destino.is_file() and destino.stat().st_size > 1000:
            print(f"ya estaba {i} bytes {destino.stat().st_size}", flush=True)
            archivos.append(destino)
            continue
        for intento in range(4):
            try:
                audio = pedir(parte, clave, voz)
                break
            except urllib.error.HTTPError as exc:
                detalle = exc.read().decode("utf-8", "replace")[:300]
                print(f"error {i} intento {intento} status {exc.code} {detalle}", flush=True)
                if exc.code == 429:
                    time.sleep(20 * (intento + 1))
                    continue
                raise
        else:
            raise SystemExit(f"no se pudo dictar el trozo {i}")
        destino.write_bytes(audio)
        print(f"listo {i} de {len(partes)} bytes {len(audio)}", flush=True)
        archivos.append(destino)
        time.sleep(0.4)
    juntar(archivos, SALIDA)
    print(f"LISTO {SALIDA} bytes {SALIDA.stat().st_size}", flush=True)


if __name__ == "__main__":
    main()
