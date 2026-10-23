"""El agente de la Pi solo trae la celda: importarlo no debe cargar el resto del backend."""

import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2] / "backend"


def test_agente_no_arrastra_lumina_base_de_datos_ni_torch():
    codigo = (
        "import sys; sys.path.insert(0, sys.argv[1]); import celda_agent;"
        "malos = [m for m in ('main', 'lumina_desktop', 'sqlalchemy', 'torch', 'ultralytics') if m in sys.modules];"
        "assert not malos, malos"
    )
    r = subprocess.run([sys.executable, "-I", "-c", codigo, str(BACKEND)], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr


def test_agente_sirve_las_rutas_de_la_celda_y_la_pagina():
    sys.path.insert(0, str(BACKEND))
    from fastapi.testclient import TestClient

    import celda_agent

    cliente = TestClient(celda_agent.app)  # sin `with`: no abre la cámara
    estado = cliente.get("/line/cell/status")
    assert estado.status_code == 200 and estado.json()["source"] == "celda"
    assert cliente.get("/health").json()["status"] == "ok"
    assert "celda" in cliente.get("/celda.html").text.lower()
