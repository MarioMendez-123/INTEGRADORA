"""Corre un programa del carrito (un archivo de Python que usa la librería `carrito`).

    python correr_programa.py programas/ejemplo_recta.py --puerto socket://localhost:7701     # simulador
    python correr_programa.py programas/ejemplo_recta.py --puerto /dev/ttyUSB0                # carrito real (pip install pyserial)

Dentro del programa ya existen: `carrito` (el objeto) y, para escribir más corto, avanzar, retroceder, girar,
girar_a, ir_a, acoplar, esperar, decir, distancia, bateria, paro_presionado y fijar_pose. También `math`.
Al terminar (o fallar, o con Ctrl+C) el carrito recibe STOP y frena.
"""
from __future__ import annotations

import argparse
import math
import pathlib
import sys
import time
import traceback

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from carrito import Carrito, ErrorCarrito  # noqa: E402
from mision import Puerto  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description="Corre un programa del carrito Aether")
    ap.add_argument("archivo")
    ap.add_argument("--puerto", required=True, help="/dev/ttyUSB0 (real) o socket://localhost:7701 (simulador)")
    ap.add_argument("--pose", default="0,0,0", help="x,y,grados donde está el carrito al empezar (por omisión, acoplado en la banda)")
    a = ap.parse_args()

    def decir(t):
        print(f"[{time.strftime('%H:%M:%S')}] {t}", flush=True)

    x, y, g = (float(v) for v in a.pose.split(","))
    c = Carrito(Puerto(a.puerto), decir=decir, pose=(x, y, g))
    codigo = pathlib.Path(a.archivo).read_text(encoding="utf-8")
    entorno = {"carrito": c, "math": math, "ErrorCarrito": ErrorCarrito, "__name__": "__programa__"}
    for nombre in ("avanzar", "retroceder", "girar", "girar_a", "ir_a", "acoplar", "esperar", "decir", "distancia",
                   "bateria", "paro_presionado", "fijar_pose"):
        entorno[nombre] = getattr(c, nombre)
    codigo_salida = 0
    try:
        c.listo()
        decir(f"programa {pathlib.Path(a.archivo).name}: empieza")
        exec(compile(codigo, a.archivo, "exec"), entorno)
        decir("programa terminado")
    except ErrorCarrito as e:
        decir(f"FALLA del carrito: {e}")
        codigo_salida = 2
    except KeyboardInterrupt:
        decir("programa interrumpido")
        codigo_salida = 3
    except Exception:
        decir("ERROR en tu programa:\n" + traceback.format_exc(limit=-3))
        codigo_salida = 1
    finally:
        try:
            c.detener()
        except Exception:
            pass
    sys.exit(codigo_salida)


if __name__ == "__main__":
    main()
