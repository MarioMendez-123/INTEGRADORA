#!/usr/bin/env bash
# Copia el modelo del paquete a donde lo busca el agente. Si ya hay otro distinto, lo deja como parts.pt.anterior.
set -eu
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ORIGEN="$RAIZ/jetson_implementacion/modelo"
DESTINO="$RAIZ/edge/perception/weights"
PY="$RAIZ/backend/.venv/bin/python"

mkdir -p "$DESTINO"
if [ -f "$DESTINO/parts.pt" ] && ! cmp -s "$ORIGEN/parts.pt" "$DESTINO/parts.pt"; then
  cp "$DESTINO/parts.pt" "$DESTINO/parts.pt.anterior"
  echo "Había otro modelo: quedó en $DESTINO/parts.pt.anterior"
fi
cp "$ORIGEN/parts.pt" "$ORIGEN/parts_report.json" "$DESTINO/"
echo "Instalado en $DESTINO"
YOLO_AUTOINSTALL=False "$PY" -c "from ultralytics import YOLO; print(list(YOLO('$DESTINO/parts.pt').names.values()))"
