"""Pruebas del JavaScript del dashboard con Node y un DOM SIMULADO (no un navegador real).

Cubren: el puente de voz de robot.js (oyente, texto, anti-eco, reconexión, Chrome sin cambios) y la dirección base del
video en camera-stream.js, line-vision.js y robot.js (agente configurado, sin configurar, esquema peligroso, versión
desconocida). Se saltan si no hay Node.
"""

import shutil
import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[2]
NODE = shutil.which("node")


@pytest.mark.skipif(NODE is None, reason="se necesita Node")
@pytest.mark.parametrize(
    "script, argumento",
    [("tests/dashboard/probar_robot_voz.js", "dashboard/robot.js"), ("tests/dashboard/probar_streams_js.js", "dashboard")],
)
def test_javascript_del_dashboard(script, argumento):
    r = subprocess.run([NODE, str(RAIZ / script), argumento], capture_output=True, text=True, timeout=90, cwd=RAIZ, encoding="utf-8")
    assert r.returncode == 0, r.stdout + r.stderr
    assert "✘" not in r.stdout and r.stdout.count("✔") >= 5
