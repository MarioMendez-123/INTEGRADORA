#!/usr/bin/env bash
# Abre Claude Code en el repo con el encargo del paquete; Mario no tiene que escribir nada.
set -u
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ" || exit 1
command -v claude >/dev/null 2>&1 || { echo "No encuentro el comando claude en esta terminal." >&2; exit 1; }
exec claude "Empieza. Sigue jetson_implementacion/CLAUDE.md."
