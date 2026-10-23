#!/usr/bin/env bash
# Inicia el agente de percepcion del Jetson dentro de tmux (sesion "agente"). Se puede repetir sin miedo:
# si ya corre, lo dice y no hace nada. Tambien se lanza desde la laptop:  .\iniciar_aether.ps1 -Jetson
#
#   mario@mario-desktop:~$ bash ~/aether/scripts/jetson/iniciar-agente.sh
#
# No instala nada y no usa sudo. Si algo falta, dice que y como arreglarlo.
set -u

RAIZ="${AETHER_HOME:-$HOME/aether}"
ENV_FILE="${AETHER_AGENT_ENV:-$HOME/.aether-agent.env}"
SESION="agente"
PUERTO="${AETHER_AGENT_PORT:-8001}"

fail() { echo "ERROR: $1" >&2; echo "  -> $2" >&2; exit 1; }

command -v tmux >/dev/null 2>&1 || fail "tmux no esta instalado" "sudo apt install tmux"
PY="$RAIZ/backend/.venv/bin/python"
[ -x "$PY" ] || fail "no existe $PY" "arma el entorno con docs/jetson/SETUP_JETSON.md, seccion 6"
ls /dev/video0 >/dev/null 2>&1 || fail "no hay camara en /dev/video0" "revisa el cable USB y: v4l2-ctl --list-devices"
if "$PY" -c "import gpiod" >/dev/null 2>&1; then
  fail "el gpiod de Python esta instalado en este entorno" "regla de seguridad: no se corre el agente hasta que el equipo confirme el cableado de la celda"
fi
[ -f "$ENV_FILE" ] || fail "falta $ENV_FILE" "cp $RAIZ/scripts/jetson/aether-agent.env.example $ENV_FILE   y edita AETHER_LAPTOP_URL"

if tmux has-session -t "$SESION" 2>/dev/null; then
  echo "El agente ya corre (tmux '$SESION'). Estado: curl -s localhost:$PUERTO/status"
  exit 0
fi

tmux new-session -d -s "$SESION" \
  "cd '$RAIZ/backend' && set -a && . '$ENV_FILE' && set +a && export YOLO_AUTOINSTALL=False && '$PY' -m uvicorn aether_agent:app --host 0.0.0.0 --port $PUERTO 2>&1 | tee -a \"\$HOME/aether-agente.log\"; echo; echo 'El agente se detuvo. Enter para cerrar.'; read _"

for _ in $(seq 1 40); do
  sleep 1
  curl -s -m 2 "localhost:$PUERTO/health" 2>/dev/null | grep -q '"status"' && break
done

if ! curl -s -m 3 "localhost:$PUERTO/health" | grep -q '"status"'; then
  echo "ERROR: el agente no contesto en $PUERTO. Ultimas lineas:" >&2
  tmux capture-pane -p -t "$SESION" 2>/dev/null | tail -15 >&2
  exit 1
fi
echo "Agente en marcha (tmux '$SESION'; log en ~/aether-agente.log)."
curl -s -m 3 "localhost:$PUERTO/health"; echo
echo "Medir:   python3 ~/aether/scripts/probar_agente.py http://localhost:$PUERTO --segundos 15"
echo "Detener: bash ~/aether/scripts/jetson/detener-agente.sh"
