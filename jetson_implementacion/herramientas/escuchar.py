"""Etapa 3: escucha al ESP32 y revisa sus lecturas. No manda ninguna orden, así que no puede mover nada.

    backend/.venv/bin/python jetson_implementacion/herramientas/escuchar.py --puerto /dev/ttyUSB0 --segundos 20

También sirve contra el simulador: --puerto socket://localhost:7701
"""
from __future__ import annotations

import argparse
import pathlib
import sys
import time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "edge" / "navigation"))
from mision import Puerto  # noqa: E402

BAT_MV = (11500, 13800)            # plomo-ácido de 12 V, en reposo
PARO_SUELTO_MV = 1500              # main.cpp: arriba de esto, REARME acepta
PARO_PRESIONADO_MV = 1000          # main.cpp: PARO_MV_PRESIONADO
VL_MAX_MM = 8190                   # el sensor no ve nada


def revisar(lineas: list[str]) -> list[str]:
    """Convierte lo escuchado en avisos. Lista vacía = todo normal; un paro presionado se reporta como dato."""
    avisos = []
    for tipo in ("ODO", "RNG", "PWR"):
        if not any(x.startswith(tipo + " ") for x in lineas):
            avisos.append(f"No llegó ninguna línea {tipo}.")
    if any("CON FALLA" in x for x in lineas):
        avisos.append("El ESP32 reportó CON FALLA al arrancar: revisa el bus I²C (VL53L0X y BNO055).")
    odo = [x.split() for x in lineas if x.startswith("ODO ")]
    if odo and all(c[4] == "nan" for c in odo if len(c) > 4):
        avisos.append("El rumbo llega como nan: el BNO055 no contesta.")
    rng = [x.split() for x in lineas if x.startswith("RNG ")]
    for i, nombre in enumerate(("frontal", "izquierdo", "derecho", "pila")):
        if rng and all(len(c) > i + 1 and int(c[i + 1]) >= VL_MAX_MM for c in rng):
            avisos.append(f"El VL53L0X {nombre} siempre marca {VL_MAX_MM}: no ve nada o no contesta.")
    pwr = [x.split() for x in lineas if x.startswith("PWR ")]
    if pwr:
        bat, paro = int(pwr[-1][1]), int(pwr[-1][2])
        if not BAT_MV[0] <= bat <= BAT_MV[1]:
            avisos.append(f"Batería en {bat / 1000:.2f} V, fuera de {BAT_MV[0] / 1000}-{BAT_MV[1] / 1000} V.")
        if PARO_PRESIONADO_MV <= paro <= PARO_SUELTO_MV:
            avisos.append(f"Lectura del paro dudosa: {paro} mV (suelto ~2100, presionado ~0).")
    return avisos


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--puerto", required=True)
    ap.add_argument("--segundos", type=float, default=20)
    args = ap.parse_args()

    puerto = Puerto(args.puerto)
    escuchado: list[str] = []
    fin = time.monotonic() + args.segundos
    ultimo: dict[str, str] = {}
    t_impresion = 0.0
    while time.monotonic() < fin:
        for linea in puerto.lineas():
            escuchado.append(linea)
            tipo = linea.split(" ", 1)[0]
            if tipo in ("ODO", "RNG", "PWR", "MOT"):
                ultimo[tipo] = linea
            else:
                print(linea, flush=True)              # arranque y eventos, tal cual
        if time.monotonic() - t_impresion >= 1.0 and ultimo:
            t_impresion = time.monotonic()
            print(" | ".join(ultimo[k] for k in ("ODO", "RNG", "PWR") if k in ultimo), flush=True)

    print(f"\n{len(escuchado)} líneas en {args.segundos:g} s.")
    avisos = revisar(escuchado)
    for aviso in avisos:
        print("AVISO:", aviso)
    if not avisos:
        print("Todas las lecturas se ven normales. Comprueba con Mario el rumbo, las distancias y el paro.")
    return 1 if avisos else 0


if __name__ == "__main__":
    raise SystemExit(main())
