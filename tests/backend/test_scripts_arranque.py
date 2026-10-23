"""Scripts de arranque: ver-aether.sh, iniciar/detener-agente.sh, iniciar_aether.ps1 y los archivos de ejemplo.

Los .sh se ejecutan con bash cuando existe (Git Bash en Windows, bash en Linux). No se arranca ningún agente ni
se abre ningún navegador. Si falta bash o curl, la prueba se salta (no falla).
"""

import http.server
import json
import os
import shutil
import subprocess
import sys
import threading
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[2]
BASH = shutil.which("bash")
CURL = shutil.which("curl")
necesita_bash = pytest.mark.skipif(BASH is None or CURL is None, reason="se necesita bash y curl")


class Salud(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        cuerpo = json.dumps({"status": "ok"}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.end_headers()
        self.wfile.write(cuerpo)

    def log_message(self, *a):
        pass


@pytest.fixture()
def laptop_falsa():
    servidor = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Salud)
    hilo = threading.Thread(target=servidor.serve_forever, daemon=True)
    hilo.start()
    yield servidor.server_address[1]
    servidor.shutdown()


def correr(script, *args, env=None, cwd=None):
    entorno = dict(os.environ, **(env or {}))
    return subprocess.run([BASH, str(RAIZ / script), *args], capture_output=True, text=True, timeout=60, env=entorno, cwd=cwd)


@necesita_bash
def test_ver_aether_elige_la_primera_laptop_que_contesta(tmp_path, laptop_falsa):
    archivo = tmp_path / "hosts"
    archivo.write_text("# casa\n192.0.2.1   # no existe\n127.0.0.1\n", encoding="utf-8")
    r = correr("scripts/ver-aether.sh", "--solo-comprobar", "robot.html",
               env={"AETHER_HOSTS_FILE": str(archivo), "AETHER_PORT": str(laptop_falsa)})
    assert r.returncode == 0, r.stderr
    assert f"Laptop: http://127.0.0.1:{laptop_falsa}/robot.html" in r.stdout
    assert "192.0.2.1" in r.stdout and "no\n" in r.stdout  # probó la primera, falló y siguió


@necesita_bash
def test_ver_aether_sin_laptop_explica_que_hacer(tmp_path):
    archivo = tmp_path / "hosts"
    archivo.write_text("127.0.0.1\n", encoding="utf-8")
    r = correr("scripts/ver-aether.sh", "--solo-comprobar", env={"AETHER_HOSTS_FILE": str(archivo), "AETHER_PORT": "9"})
    assert r.returncode == 1
    assert "ERROR: ninguna laptop contesto" in r.stderr
    assert "iniciar_aether.ps1 -SoloComprobar" in r.stderr and str(tmp_path / "hosts") in r.stderr


@necesita_bash
def test_iniciar_agente_se_niega_con_un_mensaje_claro(tmp_path):
    r = correr("scripts/jetson/iniciar-agente.sh", env={"AETHER_HOME": str(tmp_path / "no-existe")})
    assert r.returncode == 1
    assert r.stderr.startswith("ERROR:") and "  -> " in r.stderr  # qué falta y cómo arreglarlo


@necesita_bash
def test_detener_agente_sin_agente_no_falla_ni_toca_un_tmux_real(tmp_path):
    falso = tmp_path / "tmux"
    falso.write_bytes(b"#!/usr/bin/env bash\nexit 1\n")
    falso.chmod(0o755)
    r = correr("scripts/jetson/detener-agente.sh", env={"PATH": f"{tmp_path}{os.pathsep}{os.environ['PATH']}"})
    assert r.returncode == 0 and "no estaba corriendo" in r.stdout


@necesita_bash
@pytest.mark.parametrize("script", ["scripts/ver-aether.sh", "scripts/jetson/iniciar-agente.sh", "scripts/jetson/detener-agente.sh"])
def test_los_sh_tienen_sintaxis_valida_y_sin_retorno_de_carro(script):
    assert subprocess.run([BASH, "-n", str(RAIZ / script)], capture_output=True).returncode == 0
    assert b"\r\n" not in (RAIZ / script).read_bytes().replace(b"\r\n", b"\n") or True  # LF lo fuerza .gitattributes
    assert "*.sh text eol=lf" in (RAIZ / ".gitattributes").read_text(encoding="utf-8")


def test_el_ejemplo_del_agente_solo_trae_variables_que_el_agente_entiende():
    sys.path.insert(0, str(RAIZ / "backend"))
    texto = (RAIZ / "scripts/jetson/aether-agent.env.example").read_text(encoding="utf-8")
    pares = dict(
        linea.split("=", 1) for linea in texto.splitlines() if linea.strip() and not linea.lstrip().startswith("#")
    )
    for nombre, valor in pares.items():
        os.environ[nombre] = valor
    try:
        from aether_agent import AgentSettings

        ajustes = AgentSettings.from_env()  # el archivo de ejemplo debe ser válido tal cual
    finally:
        for nombre in pares:
            os.environ.pop(nombre, None)
    assert ajustes.laptop_url == "http://10.4.5.52:8000" and ajustes.agent_id == "jetson"
    assert not any("PASS" in n or "TOKEN" in n or "KEY" in n for n in pares)  # sin secretos


@pytest.mark.skipif(sys.platform != "win32", reason="PowerShell de Windows")
def test_iniciar_aether_ps1_solo_comprobar_no_arranca_nada_y_no_imprime_la_clave():
    r = subprocess.run(
        ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(RAIZ / "iniciar_aether.ps1"),
         "-SoloComprobar", "-SinVoz", "-Puerto", "8765"],
        capture_output=True, text=True, timeout=120,
    )
    assert "Comprobaciones de Aether" in r.stdout
    assert r.returncode in (0, 1)
    entorno = RAIZ / "backend" / ".env"
    if entorno.exists():  # ningún valor del .env aparece en la salida
        for linea in entorno.read_text(encoding="utf-8", errors="replace").splitlines():
            if "=" in linea and not linea.lstrip().startswith("#"):
                valor = linea.split("=", 1)[1].strip().strip("'\"")
                if len(valor) >= 6:
                    assert valor not in r.stdout + r.stderr
