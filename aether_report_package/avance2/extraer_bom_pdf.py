"""Reconstruye las filas visibles de la hoja de costos (PDF) a bom_pdf.json.
El PDF solo conserva las columnas Subsistema, Componente, Especificación y Cantidad (las de precio
quedaron fuera de la página impresa), así que aquí no hay ningún precio."""
import collections
import json
import sys
from pathlib import Path

import pymupdf

PDF = Path(sys.argv[1])
SALIDA = Path(sys.argv[2])
SUBS = {"Electrónica", "Estructura", "Navegación", "Tornillería", "Tracción", "Torre", "Estación"}

pagina = pymupdf.open(PDF)[0]
palabras = [w for w in pagina.get_text("words") if w[1] > 110]
lineas = collections.defaultdict(list)
for x0, y0, x1, y1, t, *_ in palabras:
    lineas[round(y0 / 3)].append((x0, t))

filas = []
for clave in sorted(lineas):
    ws = sorted(lineas[clave])
    primero = ws[0]
    if primero[0] < 120 and primero[1] in SUBS:
        filas.append({"sub": primero[1], "comp": [], "spec": [], "qty": ""})
    if not filas:
        continue
    f = filas[-1]
    for x, t in ws:
        if x < 120:
            if t not in SUBS and t not in ("de", "la"):
                f["sub"] += " " + t
        elif x < 249:
            f["comp"].append(t)
        elif x < 378:
            pass  # segunda copia (superpuesta) del nombre del componente
        elif x < 528:
            f["spec"].append(t)
        else:
            f["qty"] = t

salida = []
for f in filas:
    salida.append({"sub": f["sub"], "comp": " ".join(f["comp"]), "spec": " ".join(f["spec"]), "qty": f["qty"]})
SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(salida), "filas")
for s in salida:
    print(s["sub"], "|", s["comp"], "|", s["spec"][:60], "|", s["qty"])
