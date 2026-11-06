#!/usr/bin/env bash
# Foto de cómo está la Jetson. Solo lee: no instala, no mueve nada y no abre el puerto del ESP32.
set -u
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PY="$RAIZ/backend/.venv/bin/python"
cd "$RAIZ" || exit 1

t() { printf '\n== %s\n' "$1"; }
ok() { printf 'OK     %s\n' "$1"; }
falta() { printf 'FALTA  %s\n' "$1"; }

t "Equipo"
echo "$(whoami)@$(hostname) | $(uname -m) | $(date '+%F %T')"
[ -f /etc/nv_tegra_release ] && head -1 /etc/nv_tegra_release
command -v nvpmodel >/dev/null 2>&1 && nvpmodel -q 2>/dev/null | head -2
df -h "$RAIZ" | tail -1

t "Repositorio"
echo "rama $(git branch --show-current), commit $(git log --oneline -1)"
if [ -n "$(git status --porcelain)" ]; then falta "hay cambios sin guardar:"; git status --short | head -15; else ok "sin cambios locales"; fi
git fetch -q origin jetson-agente 2>/dev/null && echo "contra GitHub (locales / remotos): $(git rev-list --left-right --count HEAD...FETCH_HEAD 2>/dev/null)" || echo "sin conexión a GitHub"

t "Python"
if [ -x "$PY" ]; then
  ok "$("$PY" --version) en backend/.venv"
  for m in serial cv2 numpy torch ultralytics pytest; do
    if v="$("$PY" -c "import $m; print(getattr($m, '__version__', 'sin versión'))" 2>/dev/null)"; then ok "$m $v"; else falta "$m"; fi
  done
  "$PY" -c "import torch; print('torch.cuda:', torch.cuda.is_available())" 2>/dev/null
  if "$PY" -c "import gpiod" >/dev/null 2>&1; then echo "PELIGRO: gpiod de Python está instalado. Detente y avisa a Mario."; else ok "gpiod ausente, como debe ser"; fi
else
  falta "backend/.venv (docs/jetson/SETUP_JETSON.md, sección 6)"
fi

t "ESP32 y cámara"
if ls /dev/ttyUSB* /dev/ttyACM* >/dev/null 2>&1; then ok "puerto: $(ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null | tr '\n' ' ')"; else falta "ningún puerto serie (¿ESP32 conectado y con energía?)"; fi
if id -nG | grep -qw dialout; then ok "usuario en dialout"; else falta "usuario en dialout: sudo usermod -aG dialout $(whoami) y cerrar sesión"; fi
if ls /dev/video0 >/dev/null 2>&1; then ok "cámara en /dev/video0"; else falta "cámara en /dev/video0"; fi

t "Modelo de piezas"
if [ -f edge/perception/weights/parts.pt ]; then
  ok "edge/perception/weights/parts.pt instalado"
  cat edge/perception/weights/parts_report.json 2>/dev/null
else
  falta "modelo: bash jetson_implementacion/herramientas/instalar_modelo.sh"
fi
echo "classes.txt: $(grep -v '^#' edge/perception/parts/classes.txt | tr -d '\r' | tr '\n' ' ')"

t "Agente de visión"
if tmux has-session -t agente 2>/dev/null; then ok "corre en tmux 'agente'"; else echo "no corre (es normal antes de la Etapa 9)"; fi
curl -s -m 2 localhost:8001/health 2>/dev/null && echo
[ -f "$HOME/.aether-agent.env" ] && grep -E '^AETHER_LAPTOP_URL=' "$HOME/.aether-agent.env"

t "Etapa según ESTADO.md"
grep -m1 'Etapa actual' jetson_implementacion/ESTADO.md
exit 0
