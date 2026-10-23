"""Mide un agente de campo (aether_agent.py o celda_agent.py) desde cualquier equipo. Solo biblioteca estándar.

    python scripts/probar_agente.py http://10.4.5.103:8001 --segundos 15

Hace tres cosas y escribe SOLO lo que leyó:
  1. GET /health y /status del agente (FPS de cámara, FPS de entrega, tiempo de inferencia, cola hacia la laptop).
  2. Abre /stream durante N segundos y cuenta los cuadros que de verdad llegaron a ESTE equipo.
  3. Compara con el objetivo de diseño (30 FPS de video). El objetivo NO es una garantía: si el número sale
     menor, es el resultado, no un error del script. Con poca luz la cámara baja sola sus FPS.

Código de salida: 0 si el agente responde y entrega video; 1 si no responde o no entrega cuadros.
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.request

OBJETIVO_FPS = 30.0


def get_json(url: str, timeout: float = 5.0) -> dict:
    with urllib.request.urlopen(url, timeout=timeout) as respuesta:  # noqa: S310 (URL que escribe la persona)
        return json.loads(respuesta.read())


def contar_cuadros(url: str, segundos: float) -> tuple[int, float]:
    """Cuadros JPEG completos recibidos por /stream y segundos reales que duró la lectura."""
    cuadros, inicio, buffer = 0, time.monotonic(), b""
    with urllib.request.urlopen(url, timeout=10) as respuesta:  # noqa: S310
        while time.monotonic() - inicio < segundos:
            trozo = respuesta.read(16384)
            if not trozo:
                break
            buffer += trozo
            cuadros += buffer.count(b"\xff\xd8")  # inicio de cada JPEG
            buffer = buffer[-4:]  # lo justo para no contar dos veces un marcador partido
    return cuadros, time.monotonic() - inicio


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("base", help="dirección del agente, p. ej. http://10.4.5.103:8001")
    parser.add_argument("--segundos", type=float, default=15.0)
    args = parser.parse_args()
    base = args.base.rstrip("/")
    try:
        salud = get_json(f"{base}/health")
        print(f"/health  -> {salud}")
        inicial = get_json(f"{base}/status")
    except (urllib.error.URLError, OSError, ValueError) as exc:
        print(f"NO RESPONDE: {exc}\n  Comprueba que el agente corre, la IP, el puerto y el firewall.")
        return 1

    print(f"\nLeyendo /stream durante {args.segundos:.0f} s ...")
    try:
        cuadros, duracion = contar_cuadros(f"{base}/stream", args.segundos)
    except (urllib.error.URLError, OSError) as exc:
        print(f"/stream FALLÓ: {exc}")
        return 1
    fps_recibidos = cuadros / duracion if duracion else 0.0
    final = get_json(f"{base}/status")

    camara, inferencia, laptop = final["camera"], final["inference"], final["laptop"]
    print("\n=== Resultado (lo medido, nada más) ===")
    print(f"estado del agente      : {final['state']}  (error: {final['error']})")
    print(f"FPS de la cámara       : {camara['fps_camera']}   <- lo que entrega el hardware")
    print(f"FPS de entrega (agente): {camara['fps_delivery']}   <- cuadros anotados que salen por /stream")
    print(f"FPS recibidos aquí     : {fps_recibidos:.1f}   ({cuadros} cuadros en {duracion:.1f} s)")
    print(f"inferencia             : última {inferencia['ms_last']} ms, promedio {inferencia['ms_avg']} ms ({inferencia['mode']})")
    print(f"resolución             : {camara['width']}x{camara['height']}")
    print(f"hacia la laptop        : {laptop['url']}  alcanzable={laptop['reachable']}  cola={laptop['outbox_len']}  "
          f"enviadas={laptop['sent_total']}  descartadas={laptop['dropped_total']}  error={laptop['last_error']}")
    if final.get("resources"):
        print(f"recursos del agente    : RSS {final['resources']['rss_mb']} MB, CPU {final['resources']['cpu_pct']} %")

    if cuadros == 0:
        print("\nVEREDICTO: NO entrega video.")
        return 1
    if fps_recibidos >= OBJETIVO_FPS:
        print(f"\nVEREDICTO: {fps_recibidos:.1f} FPS recibidos, alcanza el objetivo de diseño ({OBJETIVO_FPS:.0f}).")
    else:
        print(
            f"\nVEREDICTO: {fps_recibidos:.1f} FPS recibidos, por DEBAJO del objetivo de diseño ({OBJETIVO_FPS:.0f}). "
            "Mira primero 'FPS de la cámara': si ya es bajo, la cámara (poca luz, exposición) es el límite."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
