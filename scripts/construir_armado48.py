"""Convierte la guía de armado nueva (index.html + data/*.js, rev. 3.4x) en la página que Lumina proyecta: dashboard/armado48.html.

Uso:  backend\\.venv\\Scripts\\python.exe scripts\\construir_armado48.py <carpeta-de-la-guia>
      cd aether-video && npm run armado48:build        (empaqueta armado48.src.js en dashboard/armado48.js)

Por qué no se usa tal cual: (1) el servidor no permite JavaScript incrustado ni import maps (CSP), así que el módulo va en
un archivo y se empaqueta con esbuild contra el Three.js local; (2) sin internet no hay Google Fonts; (3) Lumina necesita
?limpio=1 (solo el modelo) y las funciones showAssembled() / revealInterior(), que la guía no trae.
La página vieja (armado.html) se queda para la portada.
"""
import re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DASH = ROOT / "dashboard"

ADAPTADOR = r'''
// ============================================================ LUMINA (dashboard): lo que la guía no trae
const LIMPIO = document.documentElement.classList.contains('limpio');
const marca = (id, v) => { const el = $(id); if (el) el.checked = v; };
function showAssembled() {
  setModeKey('x');                                   // "Carrito armado": un solo paso, el carrito terminado
  ui.playing = false; ui.explode = false; ui.transp = false; ui.labels = false; ui.dims = false;
  ['tExplode', 'tTransp', 'tLabels', 'tDims'].forEach((id) => marca(id, false));
  partsDirty = true;
  ui.userCam = false;
  const c = MD.STEPS[0].cam;
  flyTo(LIMPIO ? { ...c, r: c.r * 0.72 } : c, false);       // en la proyección el carrito llena más la pantalla
  $('vEtapa').textContent = 'Lumina';
  $('vTitle').textContent = 'Así estoy armada';
}
// Capítulo "Funcionamiento" (12 pasos animados): las diapositivas piden un paso por postMessage y se reproduce completo.
const OPMODE = new URLSearchParams(location.search).get('op') === '1';
if (OPMODE) document.documentElement.classList.add('op');
function showOp(k) {
  if (MD.key !== 'r') setModeKey('r', false);
  const ops = MD.STEPS.filter((s) => MD.CHAPTERS[s.ch].key === 'op');
  const st = ops[Math.max(0, Math.min(ops.length - 1, k))];
  ['tLabels', 'tDims', 'tExplode', 'tTransp'].forEach((id) => marca(id, false));
  ui.labels = false; ui.dims = false; ui.explode = false; ui.transp = false; ui.endX = true; partsDirty = true;
  ui.stopAt = null; ui.userCam = false;
  goStep(st.i);
}
addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.type === 'aether-op') showOp(e.data.step | 0); });
let revealTimers = [];
function revealInterior() {
  revealTimers.forEach(clearTimeout);
  showAssembled();
  flyTo(MD.STEPS[0].cam, false);                       // desarmado ocupa más: se aleja la cámara
  $('vEtapa').textContent = 'Interior';
  $('vTitle').textContent = 'La estructura se vuelve transparente';
  revealTimers = [
    setTimeout(() => { ui.transp = true; marca('tTransp', true); partsDirty = true; }, 900),
    setTimeout(() => { ui.explode = true; marca('tExplode', true); partsDirty = true; $('vTitle').textContent = 'Capa por capa'; }, 3300),
  ];
}
'''


def main(carpeta: str):
    src = Path(carpeta)
    s = (src / "index.html").read_text(encoding="utf-8")
    i_script = s.index("<script")
    cabeza = s[:i_script]

    # datos: <script src="data/xxx.js"></script> en orden
    datos = re.findall(r'<script src="data/([A-Za-z0-9_.-]+)"></script>', s)
    assert datos, "no encontré los scripts de datos"
    (DASH / "armado48-data").mkdir(exist_ok=True)
    for nombre in datos:
        shutil.copy2(src / "data" / nombre, DASH / "armado48-data" / nombre)

    # módulo
    m = re.search(r'<script type="module">(.*?)</script>', s, flags=re.S)
    assert m, "no encontré el módulo"
    codigo = m.group(1)
    assert codigo.count("window.__aether = {") == 1
    codigo = codigo.replace("window.__aether = {", ADAPTADOR + "\nwindow.__aether = { showAssembled, revealInterior,", 1)
    codigo += r'''
// ?limpio=1: sin cotas ni etiquetas, el piso se pierde en la oscuridad y arranca en el carrito armado.
if (LIMPIO) { ui.labels = false; ui.dims = false; scene.fog.near = OPMODE ? 14 : 2.5; scene.fog.far = OPMODE ? 40 : 6; }
if (OPMODE) showOp(0);
else if (LIMPIO || new URLSearchParams(location.search).get('pose') === 'armada') showAssembled();
'''
    (DASH / "armado48.src.js").write_text(
        "// Generado por scripts/construir_armado48.py desde la guía de armado. Tras editarlo: cd aether-video && npm run armado48:build\n"
        + codigo.strip() + "\n", encoding="utf-8")

    # html: sin Google Fonts, con las fuentes locales y la clase "limpio" antes de pintar
    cabeza = re.sub(r'<link rel="preconnect"[^>]*>\s*', "", cabeza)
    cabeza = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', '<link rel="stylesheet" href="/vendor/fonts/fonts.css">', cabeza)
    assert "googleapis" not in cabeza and "gstatic" not in cabeza
    cabeza = cabeza.replace("<head>", '<head><script src="/armado-head.js"></script>', 1)
    limpio_css = (
        "<style>\n/* ?limpio=1: la proyección de la presentación. Solo el modelo, sin controles ni panel de la guía. */\n"
        "html.limpio[data-theme] { --scene: #05070a; --floor: #07090e; }\n"
        "html.limpio #panel, html.limpio #controls, html.limpio #hint, html.limpio #endCard, html.limpio .vbar, html.limpio #insp { display: none !important; }\n"
        "html.limpio #view { position: fixed; inset: 0; cursor: none; }\nhtml.op #vHead { display: none !important; }\n</style>\n")
    scripts_datos = "".join(f'<script src="/armado48-data/{n}"></script>\n' for n in datos)
    html = cabeza + limpio_css + scripts_datos + '<script type="module" src="/armado48.js"></script>\n</body></html>\n'
    (DASH / "armado48.html").write_text(html, encoding="utf-8")
    print(f"armado48.html ({len(html) // 1024} KB), armado48.src.js ({len(codigo) // 1024} KB) y {len(datos)} archivos de datos")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
