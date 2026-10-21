#!/bin/sh
# Hojas de contacto 3×2 (640×360 c/u) de los fotogramas en render/stills/<prefijo>*.png
FF=node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe
prefix=${1:-AetherEnsayo}
ls -1 render/stills/$prefix-*.png | sort -t- -k2 > /tmp/stills.txt 2>/dev/null || true
