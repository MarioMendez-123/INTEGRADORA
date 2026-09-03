"""Refresca Declared Inventory de punta a punta: captura real de cámara
(edge/perception/), la agrega en Declared Inventory (edge/inventory_engine/)
y la carga al backend (backend/aether.db) — los mismos tres pasos que el
equipo corría a mano por separado, encadenados en un solo comando:

    1. edge/perception/capture_headless.py   (captura real, sin ventana)
    2. edge/inventory_engine/aggregate_observations.py
    3. backend/scripts/load_from_edge.py

Este script cruza edge/ y backend/, cada uno con su propio entorno virtual
(ver la sección "estructura de carpetas" del informe, o edge/README.md y
backend/README.md, sobre por qué están separados: distinto hardware de
destino en producción real). Por eso vive aquí, en scripts/ — la carpeta
reservada para utilidades que tocan todo el monorepo, no una sola parte
(ver aether_context_docs.md, sección 6) — y por eso invoca el intérprete
de CADA venv por separado en subprocesos, en vez de importar los módulos
de edge/ y backend/ directamente en este mismo proceso: importarlos aquí
mezclaría sus dependencias, justo lo que esos dos venvs separados evitan.

No cambia ninguna decisión de arquitectura (Decisión 7 sigue sin
monitoreo en vivo): sigue siendo una actualización manual, disparada por
una persona — solo que ahora es un comando en vez de tres.

Uso:
    python scripts/refresh_inventory.py [--seconds 15]
"""

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EDGE_PYTHON = ROOT / "edge" / ".venv" / "Scripts" / "python.exe"
BACKEND_PYTHON = ROOT / "backend" / ".venv" / "Scripts" / "python.exe"


def _venv_python(preferred: Path) -> str:
    """Ruta al intérprete de un venv — Scripts/ (Windows) o bin/ (Mac/Linux,
    por si algún día edge/ o backend/ también se desarrollan ahí)."""
    if preferred.exists():
        return str(preferred)
    unix_path = preferred.parent.parent / "bin" / preferred.stem
    if unix_path.exists():
        return str(unix_path)
    print(f"ERROR: no se encontró el intérprete de entorno virtual en {preferred} ni en {unix_path}.")
    print(f"¿Corriste 'pip install -r requirements.txt' dentro de {preferred.parent.parent}?")
    sys.exit(1)


def run_step(python_exe: str, script: Path, *extra_args: str) -> None:
    print(f"\n=== {script.relative_to(ROOT)} ===")
    result = subprocess.run([python_exe, str(script), *extra_args])
    if result.returncode != 0:
        print(f"ERROR: {script.name} terminó con código {result.returncode}. Deteniendo la cadena.")
        sys.exit(result.returncode)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--seconds",
        type=float,
        default=15,
        help="Duración de la captura de cámara en segundos (default: 15).",
    )
    args = parser.parse_args()

    edge_python = _venv_python(EDGE_PYTHON)
    backend_python = _venv_python(BACKEND_PYTHON)

    run_step(
        edge_python,
        ROOT / "edge" / "perception" / "capture_headless.py",
        "--seconds",
        str(args.seconds),
    )
    run_step(edge_python, ROOT / "edge" / "inventory_engine" / "aggregate_observations.py")
    run_step(backend_python, ROOT / "backend" / "scripts" / "load_from_edge.py")

    print("\nListo — Declared Inventory actualizado. Refresca http://127.0.0.1:8000/inventory.html para verlo.")


if __name__ == "__main__":
    main()
