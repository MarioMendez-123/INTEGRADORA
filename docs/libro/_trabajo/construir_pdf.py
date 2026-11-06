"""Arma el PDF A4 del libro a partir de los .md de docs/libro/.

Uso (desde la raíz del repo):  python docs/libro/_trabajo/construir_pdf.py [salida.pdf]
Requiere: el paquete `markdown`, `pymupdf` y Google Chrome o Edge instalado (se usa su impresión a PDF).
Orden: los archivos NN_*.md por número; el glosario (98) y los pendientes (99) van siempre al final.
"""
import html
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import markdown
import pymupdf

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "Aether_por_dentro_libro.pdf"
NAVEGADORES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]

TITULO = "Aether por dentro"
SUBTITULO = "El libro completo del proyecto"
EDICION = ""
FECHA = "24 de octubre de 2026"

CSS = """
@page { size: A4; margin: 16mm 14mm 18mm 14mm; }
* { box-sizing: border-box; }
body { font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; font-size: 12.6pt; line-height: 1.55; color: #1b1f27; }
h1 { font-size: 24pt; line-height: 1.15; color: #14171f; border-bottom: 3px solid #5b4fe8; padding-bottom: 6px; margin: 0 0 8px; page-break-before: always; }
h1.sin-salto { page-break-before: avoid; }
h2 { font-size: 16pt; color: #3f35b0; margin: 26px 0 6px; page-break-after: avoid; }
h3 { font-size: 13.5pt; color: #14171f; margin: 18px 0 4px; page-break-after: avoid; }
p, li { orphans: 3; widows: 3; }
p em:only-child { color: #5a5f6e; }
code { font-family: "Cascadia Mono", Consolas, monospace; font-size: 10.6pt; background: #f1f2f6; padding: 1px 4px; border-radius: 3px; word-break: break-word; }
pre { background: #14171f; color: #e7e9ee; padding: 10px 12px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; font-size: 10.2pt; line-height: 1.4; page-break-inside: avoid; }
pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
blockquote { margin: 12px 0; padding: 8px 14px; border-left: 4px solid #e8a33d; background: #fdf3e4; color: #4a3a12; page-break-inside: avoid; }
blockquote p { margin: 4px 0; }
table { border-collapse: collapse; width: 100%; font-size: 10.8pt; line-height: 1.4; margin: 10px 0; table-layout: auto; }
thead { display: table-header-group; }
.pend th:nth-child(1), .pend td:nth-child(1) { white-space: nowrap; width: 17mm; }
.pend th:nth-child(3), .pend td:nth-child(3) { width: 31mm; }
.pend th:nth-child(4), .pend td:nth-child(4) { width: 24mm; }
.glos th:nth-child(1), .glos td:nth-child(1) { width: 38mm; }
.glos th:nth-child(3), .glos td:nth-child(3) { white-space: nowrap; width: 17mm; }
td, th { overflow-wrap: anywhere; }
th { background: #14171f; color: #fff; text-align: left; padding: 6px 8px; }
td { border: 1px solid #d8dbe2; padding: 5px 8px; vertical-align: top; }
tr { page-break-inside: avoid; }
tbody tr:nth-child(even) td { background: #f7f8fb; }
.portada { height: 250mm; display: flex; flex-direction: column; justify-content: center; padding: 0 4mm; page-break-after: always; background: #fff; color: #14171f; }
.portada .tit { font-size: 46pt; font-weight: 700; line-height: 1.05; }
.portada .sub { font-size: 21pt; margin-top: 8mm; color: #3a3f4c; }
.portada .ed { margin-top: 30mm; font-size: 14pt; color: #5a5f6e; }
.indice h1 { page-break-before: avoid; }
.indice ol { list-style: none; padding: 0; margin: 0; }
.indice li { display: flex; gap: 6px; padding: 5px 0; border-bottom: 1px dotted #c3c7d1; font-size: 12.5pt; }
.indice li .t { flex: 1; }
.indice li.parte { font-weight: 700; color: #3f35b0; margin-top: 12px; border-bottom: 2px solid #3f35b0; }
.indice li.sub { padding-left: 18px; font-size: 11.2pt; color: #3a3f4c; }
"""


def archivos_del_libro():
    pesos = []
    for p in RAIZ.glob("[0-9][0-9]_*.md"):
        pesos.append((int(p.name[:2]), p))
    pesos.sort()
    cuerpo = [p for n, p in pesos if n < 98]
    final = [p for n, p in pesos if n >= 98]
    return cuerpo + final


def parte_de(etiqueta):
    m = re.match(r"Cap[ií]tulo (\d+):", etiqueta)
    if etiqueta.startswith("Prólogo"):
        return "Parte A · Panorama"
    if m:
        n = int(m.group(1))
        if n <= 1:
            return "Parte A · Panorama"
        if n <= 9:
            return "Parte B · El cuerpo físico"
        if n <= 21:
            return "Parte C · El software"
        return "Parte D · Ingeniería y entrega"
    if etiqueta.startswith("Apéndice"):
        return "Apéndices"
    return "Glosario y pendientes"


def md_a_html(texto):
    return markdown.markdown(texto, extensions=["tables", "fenced_code", "sane_lists"])


def construir_html(paginas=None):
    paginas = paginas or {}
    partes_html, entradas = [], []
    for i, ruta in enumerate(archivos_del_libro()):
        texto = ruta.read_text(encoding="utf-8")
        cuerpo = md_a_html(texto)
        if '<th>Código</th>' in cuerpo:
            cuerpo = cuerpo.replace('<table>', '<table class="pend">', 1)
        if '<th>Término</th>' in cuerpo:
            cuerpo = cuerpo.replace('<table>', '<table class="glos">', 1)
        ids = {}
        def poner_id(m):
            nivel, resto = m.group(1), m.group(2)
            etiqueta = re.sub(r"<[^>]+>", "", resto)
            clave = f"s{i}_{len(ids)}"
            ids[clave] = (nivel, html.unescape(etiqueta))
            return f'<h{nivel} id="{clave}">{resto}</h{nivel}>'
        cuerpo = re.sub(r"<h([12])>(.*?)</h\1>", poner_id, cuerpo)
        for clave, (nivel, etiqueta) in ids.items():
            entradas.append((clave, int(nivel), etiqueta))
        partes_html.append(f'<section>{cuerpo}</section>')

    filas = []
    parte_actual = None
    for clave, nivel, etiqueta in entradas:
        if nivel == 1:
            parte = parte_de(etiqueta)
            if parte and parte != parte_actual:
                filas.append(f'<li class="parte"><span class="t">{html.escape(parte)}</span></li>')
                parte_actual = parte
            clase = "t"
            pg = paginas.get(etiqueta, "")
            filas.append(f'<li><span class="{clase}"><a href="#{clave}" style="color:inherit;text-decoration:none">{html.escape(etiqueta)}</a></span><span>{pg}</span></li>')
    indice = '<div class="indice"><h1 class="sin-salto">Índice</h1><ol>' + "".join(filas) + "</ol></div>"
    portada = (
        '<div class="portada">'
        f'<div class="tit">{TITULO}</div><div class="sub">{SUBTITULO}</div>'
        f'<div class="ed">{FECHA}</div></div>'
    )
    return f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{TITULO}</title><style>{CSS}</style></head><body>{portada}{indice}{"".join(partes_html)}</body></html>', entradas


def imprimir(html_texto, destino):
    navegador = next((n for n in NAVEGADORES if Path(n).exists()), None)
    if not navegador:
        raise SystemExit("No encontré Chrome ni Edge para imprimir el PDF.")
    with tempfile.TemporaryDirectory() as d:
        ruta = Path(d) / "libro.html"
        ruta.write_text(html_texto, encoding="utf-8")
        perfil = Path(d) / "perfil"
        subprocess.run(
            [navegador, "--headless=new", "--disable-gpu", f"--user-data-dir={perfil}", "--no-pdf-header-footer",
             f"--print-to-pdf={destino}", ruta.as_uri()],
            check=True, timeout=240, capture_output=True,
        )


def paginas_de_capitulos(pdf, entradas):
    doc = pymupdf.open(pdf)
    resultado = {}
    textos = [" ".join(pg.get_text().split()) for pg in doc]
    titulos = [e for _, nivel, e in entradas if nivel == 1]
    # las páginas del índice mencionan muchos títulos a la vez; se descartan
    es_indice = {n for n, t in enumerate(textos) if sum(1 for e in titulos if e[:40] in t) >= 4}
    for etiqueta in titulos:
        for n in range(1, len(textos)):
            if n in es_indice:
                continue
            if etiqueta[:40] in textos[n]:
                resultado[etiqueta] = n + 1
                break
    doc.close()
    return resultado


def sellar(pdf, entradas, paginas):
    doc = pymupdf.open(pdf)
    toc = [[1, e, paginas[e]] for _, n, e in entradas if n == 1 and e in paginas]
    for n, pg in enumerate(doc, start=1):
        if n == 1:
            continue
        r = pg.rect
        pg.insert_text((r.width / 2 - 6, r.height - 22), str(n), fontsize=9, color=(0.35, 0.37, 0.43))
    if toc:
        doc.set_toc(toc)
    doc.save(str(pdf) + ".tmp")
    doc.close()
    Path(str(pdf) + ".tmp").replace(pdf)


def main():
    html1, entradas = construir_html()
    imprimir(html1, SALIDA)
    paginas = paginas_de_capitulos(SALIDA, entradas)
    html2, entradas = construir_html(paginas)
    imprimir(html2, SALIDA)
    paginas = paginas_de_capitulos(SALIDA, entradas)
    sellar(SALIDA, entradas, paginas)
    print("PDF:", SALIDA, "·", pymupdf.open(SALIDA).page_count, "páginas")


if __name__ == "__main__":
    main()
