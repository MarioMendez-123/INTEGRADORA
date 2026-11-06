"""Extrae el catálogo de componentes (comp(...)) de la hoja de armado HTML a bom_html.json."""
import json
import re
import sys
from pathlib import Path

HTML = Path(sys.argv[1])
SALIDA = Path(sys.argv[2])
CAMPO = r":\s*'((?:[^'\\]|\\.)*)'"

filas = []
for linea in HTML.read_text(encoding="utf-8").split("\n"):
    m = re.search(r"comp\('([^']+)',\s*\{(.*)", linea)
    if not m:
        continue
    cuerpo = m.group(2)

    def campo(nombre):
        r = re.search(nombre + CAMPO, cuerpo)
        return r.group(1).replace("\\'", "'") if r else ""

    filas.append({"id": m.group(1), "name": campo("name"), "qty": campo("qty"), "fn": campo("fn"),
                  "mount": campo("mount"), "check": campo("check")})

SALIDA.write_text(json.dumps(filas, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(filas), "componentes")
for f in filas:
    print(f["id"], "|", f["name"], "|", f["qty"], "|", f["fn"][:70])
