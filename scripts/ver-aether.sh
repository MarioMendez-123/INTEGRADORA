#!/usr/bin/env bash
# Abre Firefox en la primera laptop que conteste. Para el Jetson: ejecutalo en un terminal DENTRO de la sesion VNC
# (por SSH no hay pantalla y Firefox no abre).
#
#   mario@mario-desktop:~$ bash ~/aether/scripts/ver-aether.sh [pagina]        # ej. robot.html
#   mario@mario-desktop:~$ bash ~/aether/scripts/ver-aether.sh --solo-comprobar
#
# Las IPs candidatas salen de ~/.aether-host (una por linea; # para comentarios). Sin ese archivo se prueban las
# que ya se usaron: universidad (WiFi), casa y USB-C. Un tercero edita ~/.aether-host con SUS direcciones.
set -u
PUERTO="${AETHER_PORT:-8000}"
ARCHIVO="${AETHER_HOSTS_FILE:-$HOME/.aether-host}"
SOLO=0; PAGINA=""
for a in "$@"; do case "$a" in --solo-comprobar) SOLO=1 ;; *) PAGINA="$a" ;; esac; done

if [ -f "$ARCHIVO" ]; then
  CANDIDATAS=$(sed 's/#.*//' "$ARCHIVO" | tr -s ' \t\r' '\n' | grep -v '^$')
else
  CANDIDATAS=$'10.4.5.52\n192.168.100.14\n192.168.55.100'
fi

ENCONTRADA=""
for ip in $CANDIDATAS; do
  printf 'Probando %s:%s ... ' "$ip" "$PUERTO"
  if curl -s -m 2 "http://$ip:$PUERTO/health" 2>/dev/null | grep -q '"status": *"ok"'; then
    echo "responde"; ENCONTRADA="$ip"; break
  fi
  echo "no"
done

if [ -z "$ENCONTRADA" ]; then
  echo "ERROR: ninguna laptop contesto." >&2
  echo "  -> En la laptop: .\iniciar_aether.ps1 -SoloComprobar  (firewall, perfil de red, puerto)." >&2
  echo "  -> Si estas en otra red, agrega la IP de la laptop a $ARCHIVO" >&2
  exit 1
fi

URL="http://$ENCONTRADA:$PUERTO/$PAGINA"
echo "Laptop: $URL"
[ "$SOLO" = 1 ] && exit 0
command -v firefox >/dev/null 2>&1 || { echo "ERROR: no hay firefox en PATH" >&2; exit 1; }
[ -n "${DISPLAY:-}" ] || { echo "ERROR: no hay pantalla (DISPLAY vacio). Ejecutalo en un terminal dentro de la sesion VNC." >&2; exit 1; }
exec firefox "$URL"
