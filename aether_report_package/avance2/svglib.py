"""Mini librería para dibujar diagramas en SVG con un estilo uniforme (se convierten a PNG con render_svgs.cjs)."""
from xml.sax.saxutils import escape

FONT = "Arial, Helvetica, sans-serif"
INK = "#1B2A41"
PAL = {
    "entrada": ("#E3EEF9", "#2F6DB5"),
    "proceso": ("#EEF0F3", "#6B7685"),
    "control": ("#DDF2EF", "#1E8E7E"),
    "actuador": ("#FBE6DD", "#C8501E"),
    "salida": ("#EBE3F6", "#7B52B5"),
    "decision": ("#FFF4D6", "#B98A00"),
    "inicio": ("#1B2A41", "#1B2A41"),
    "nota": ("#FFFFFF", "#8A93A0"),
    "alerta": ("#FDECEC", "#C0392B"),
    "ok": ("#E6F4EA", "#2E7D32"),
}


def wrap(texto, ancho_px, fs):
    """Parte el texto en líneas que quepan en ancho_px (Arial promedio ≈ 0.53 × fs por carácter)."""
    cpl = max(4, int(ancho_px / (fs * 0.53)))
    lineas = []
    for parrafo in texto.split("\n"):
        actual = ""
        for palabra in parrafo.split(" "):
            prueba = (actual + " " + palabra).strip()
            if len(prueba) <= cpl:
                actual = prueba
            else:
                if actual:
                    lineas.append(actual)
                actual = palabra
        lineas.append(actual)
    return lineas


class Svg:
    def __init__(self, w, h, titulo=None):
        self.w, self.h = w, h
        self.items = []
        self.defs = (
            '<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
            f'<path d="M0,0 L10,5 L0,10 z" fill="{INK}"/></marker>'
            '<marker id="ard" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
            '<path d="M0,0 L10,5 L0,10 z" fill="#6B7685"/></marker>'
        )
        if titulo:
            self.text(w / 2, 30, titulo, fs=22, bold=True, anchor="middle")

    # ---- primitivas
    def raw(self, s):
        self.items.append(s)

    def text(self, x, y, texto, fs=14, bold=False, anchor="start", color=INK, italic=False):
        lineas = texto.split("\n")
        for i, l in enumerate(lineas):
            self.items.append(
                f'<text x="{x}" y="{y + i * fs * 1.25}" font-family="{FONT}" font-size="{fs}" '
                f'font-weight="{"700" if bold else "400"}" font-style="{"italic" if italic else "normal"}" '
                f'text-anchor="{anchor}" fill="{color}">{escape(l)}</text>'
            )

    def caja(self, x, y, w, h, texto, tipo="proceso", fs=14, bold=False, rx=10, dash=False, titulo=None, align="middle"):
        fill, stroke = PAL[tipo]
        tcolor = "#FFFFFF" if tipo == "inicio" else INK
        d = ' stroke-dasharray="7 5"' if dash else ""
        self.items.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="2"{d}/>'
        )
        lineas = wrap(texto, w - 16, fs)
        total = len(lineas) * fs * 1.25 + (fs * 1.35 if titulo else 0)
        y0 = y + (h - total) / 2 + fs * 0.95
        if titulo:
            self.text(x + w / 2, y0, titulo, fs=fs, bold=True, anchor="middle", color=stroke if tipo != "inicio" else "#FFFFFF")
            y0 += fs * 1.35
        for i, l in enumerate(lineas):
            ax = x + w / 2 if align == "middle" else x + 10
            self.items.append(
                f'<text x="{ax}" y="{y0 + i * fs * 1.25}" font-family="{FONT}" font-size="{fs}" '
                f'font-weight="{"700" if bold else "400"}" text-anchor="{align}" fill="{tcolor}">{escape(l)}</text>'
            )

    def rombo(self, cx, cy, w, h, texto, fs=13):
        fill, stroke = PAL["decision"]
        pts = f"{cx},{cy - h / 2} {cx + w / 2},{cy} {cx},{cy + h / 2} {cx - w / 2},{cy}"
        self.items.append(f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
        lineas = wrap(texto, w * 0.62, fs)
        y0 = cy - (len(lineas) * fs * 1.2) / 2 + fs * 0.9
        for i, l in enumerate(lineas):
            self.items.append(
                f'<text x="{cx}" y="{y0 + i * fs * 1.2}" font-family="{FONT}" font-size="{fs}" text-anchor="middle" fill="{INK}">{escape(l)}</text>'
            )

    def flecha(self, puntos, etiqueta=None, dash=False, lx=None, ly=None, fs=12, bold=True, color=None):
        pts = " ".join(f"{x},{y}" for x, y in puntos)
        d = ' stroke-dasharray="6 5"' if dash else ""
        c = color or ("#6B7685" if dash else INK)
        mk = "ard" if dash else "ar"
        self.items.append(f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="2"{d} marker-end="url(#{mk})"/>')
        if etiqueta:
            mx = lx if lx is not None else (puntos[0][0] + puntos[-1][0]) / 2 + 6
            my = ly if ly is not None else (puntos[0][1] + puntos[-1][1]) / 2 - 4
            self.text(mx, my, etiqueta, fs=fs, bold=bold, color=c)

    def linea(self, x1, y1, x2, y2, color="#6B7685", w=2, dash=False):
        d = ' stroke-dasharray="6 5"' if dash else ""
        self.items.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{w}"{d}/>')

    def rect(self, x, y, w, h, fill="none", stroke="#6B7685", sw=2, rx=0, dash=False):
        d = ' stroke-dasharray="8 6"' if dash else ""
        self.items.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def guardar(self, ruta):
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">'
            f'<defs>{self.defs}</defs><rect width="100%" height="100%" fill="#FFFFFF"/>' + "".join(self.items) + "</svg>"
        )
        with open(ruta, "w", encoding="utf-8") as f:
            f.write(svg)
