r"""Prepara el modelo 3D del carrito para el simulador a partir de tu guía de armado.

Uso (laptop, PowerShell, dentro de la carpeta del repo):
    python sim/preparar_modelo.py "C:\Users\mende\Downloads\Armado del carrito Aether (1).html"

Copia la guía a sim/generado/carrito_3d.html con dos cambios pequeños:
1. deja a la vista la librería 3D (window.__THREE) para que el simulador agregue cosas a la escena;
2. con ?sim en la dirección, oculta los menús de la guía y deja solo la vista 3D.
Todo lo demás (piezas, medidas, cables, mallas de los STEP) queda igual que en tu guía.
Cuando haya una revisión nueva de la guía, vuelve a correr este script.
"""
import pathlib
import sys

AQUI = pathlib.Path(__file__).resolve().parent
POR_OMISION = pathlib.Path.home() / "Downloads" / "Armado del carrito Aether (1).html"
ANCLA_IMPORT = "import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';"
ANCLA_FINAL = "window.__aether = {"
MODO_SIM = """
if (new URLSearchParams(location.search).has('sim')) {
  const st = document.createElement('style');
  st.textContent = 'body.sim>*:not(#view){display:none!important} body.sim #view{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important} body.sim #view>:not(canvas){display:none!important}';
  document.head.appendChild(st);
  document.body.classList.add('sim');
  document.body.prepend(viewEl);
  const raiz = document.documentElement.style;                      // piso y fondo negros con rejilla de neón (estilo del simulador)
  raiz.setProperty('--scene', '#03050a'); raiz.setProperty('--floor', '#050911'); raiz.setProperty('--dim', '#14f1ff');
  readTheme();
  { const col = grid.geometry.attributes.color; for (let i = 0; i < col.count; i++) col.setXYZ(i, 0.08, 0.95, 1); col.needsUpdate = true; } grid.material.opacity = 0.3; grid.scale.set(3, 1, 3); grid.position.y = 0.004;
  resize();
}
"""


def main():
    origen = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else POR_OMISION
    html = origen.read_text(encoding="utf-8")
    if ANCLA_IMPORT not in html or ANCLA_FINAL not in html:
        sys.exit("No reconozco esta guía: cambió su código. Avísale a Claude para ajustar el script.")
    html = html.replace(ANCLA_IMPORT, ANCLA_IMPORT + "\nwindow.__THREE = THREE;", 1)
    i = html.rfind(ANCLA_FINAL)
    html = html[:i] + MODO_SIM + html[i:]
    destino = AQUI / "generado" / "carrito_3d.html"
    destino.parent.mkdir(exist_ok=True)
    destino.write_text(html, encoding="utf-8")
    print(f"Listo: {destino} ({destino.stat().st_size / 1e6:.1f} MB) desde {origen.name}")


if __name__ == "__main__":
    main()
