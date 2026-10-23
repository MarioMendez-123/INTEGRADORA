#!/usr/bin/env bash
# Detiene el agente de percepcion del Jetson (cierra la sesion tmux "agente"; libera la camara).
if tmux has-session -t agente 2>/dev/null; then
  tmux send-keys -t agente C-c
  sleep 2
  tmux kill-session -t agente 2>/dev/null
  echo "Agente detenido."
else
  echo "El agente no estaba corriendo."
fi
