"""Arma deploy_netlify/: la presentación (video, Lumina, diapositivas, 3D) como sitio estático, sin servidor.

Uso:  backend\\.venv\\Scripts\\python.exe scripts\\build_netlify.py
No toca dashboard/: copia lo que necesita y parchea SOLO la copia. No copia backend/.env ni nada del servidor.
"""
import hashlib, json, re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DASH, OUT = ROOT / "dashboard", ROOT / "deploy_netlify"
URL = "/robot.html?intro=1&voz=servicio&lang=es"

# Frases que Lumina dice solas en el guion (ES). El audio ya existe en backend/tts_cache (mismo hash que usa el servidor).
FRASES = ["Hola, soy Lumina, el robot del proyecto Aether.", "Muy bien y listo para trabajar.",
          "Soy el carrito. Así estoy armada.", "Te muestro el interior, capa por capa."]

COPIAR = ["robot.css", "robot.js", "style.css", "perf.js", "node-field.js", "call-screen.js", "stream-errors.js",
          "slides.html", "slides.css", "slides.js", "armado48.html", "armado48.js", "armado48-data", "armado-head.js", "vendor"]
ASSETS = ["intro.mp4", "fondo_tech.wav", "funcionamiento.mp4", "slides"]


def voice_id() -> str:
    for line in (ROOT / "backend" / ".env").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\s*ELEVENLABS_VOICE_ID\s*=\s*(.+)", line)
        if m:
            return m.group(1).strip().strip("\"'")
    sys.exit("Falta ELEVENLABS_VOICE_ID en backend/.env (solo se usa para calcular el nombre de los audios).")


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for name in COPIAR:
        src = DASH / name
        (shutil.copytree if src.is_dir() else shutil.copy2)(src, OUT / name)
    (OUT / "assets").mkdir()
    for name in ASSETS:
        src = DASH / "assets" / name
        (shutil.copytree if src.is_dir() else shutil.copy2)(src, OUT / "assets" / name)

    # Audio de Lumina: solo lo que ya está sintetizado. Nada se genera aquí (cada síntesis nueva gasta créditos).
    vid, tts_map = voice_id(), {}
    (OUT / "tts").mkdir()
    for frase in FRASES:
        h = hashlib.sha1(f"{vid}|{frase}".encode("utf-8")).hexdigest()
        mp3 = ROOT / "backend" / "tts_cache" / f"{h}.mp3"
        if not mp3.exists():
            sys.exit(f"No hay audio guardado para: {frase!r}. No lo genero para no gastar créditos.")
        shutil.copy2(mp3, OUT / "tts" / f"{h}.mp3")
        tts_map[frase] = f"/tts/{h}.mp3"

    # La pantalla de llamadas (Remotion) necesita Zavu y descarga fuentes de Google: aquí no se usa, queda vacía.
    (OUT / "call-screen.js").write_text("/* llamadas: no disponibles en la demostración estática */\n", encoding="utf-8")

    shim = (ROOT / "scripts" / "netlify_demo" / "demo-estatico.js").read_text(encoding="utf-8")
    (OUT / "demo-estatico.js").write_text(shim.replace("__TTS_MAP__", json.dumps(tts_map, ensure_ascii=False)), encoding="utf-8")

    # robot.html: el simulador debe cargar antes que cualquier otro script.
    html = (DASH / "robot.html").read_text(encoding="utf-8")
    assert '<script src="/perf.js"></script>' in html
    html = html.replace('<script src="/perf.js"></script>', '<script src="/demo-estatico.js"></script>\n    <script src="/perf.js"></script>', 1)
    html = html.replace("<head>", '<head>\n    <meta name="robots" content="noindex, nofollow" />\n    <link rel="icon" href="data:," />', 1)
    (OUT / "robot.html").write_text(html, encoding="utf-8")

    # Teléfonos: el navegador solo permite reproducir el video si el gesto termina (pointerup/click), no al empezar (pointerdown).
    robot = (OUT / "robot.js").read_text(encoding="utf-8")
    for viejo, nuevo in (('removeEventListener("pointerdown", start);', 'removeEventListener("pointerup", start);'),
                         ('addEventListener("pointerdown", start);', 'addEventListener("pointerup", start);')):
        assert robot.count(viejo) == 1, viejo
        robot = robot.replace(viejo, nuevo)
    (OUT / "robot.js").write_text(robot, encoding="utf-8")

    # slides.js: la lámina "En vivo" pedía el servidor (/inventory.html). Aquí va una captura, rotulada como tal.
    js = (OUT / "slides.js").read_text(encoding="utf-8")
    live = re.search(r'  \{ sec: T\("Real-time demo".*\n', js)
    assert live, "no encontré la lámina de demostración en vivo"
    captura = ('  { sec: T("Interface", "Interfaz"), by: "Mario", title: T("The declared inventory, from the server", "El inventario declarado, desde el servidor"), tight: true, '
               'body: () => fig("web_inventario.png", T("Screenshot of the dashboard (inventory.html)", "Captura del panel (inventory.html)")) },\n')
    (OUT / "slides.js").write_text(js.replace(live.group(0), captura, 1), encoding="utf-8")

    # iPhone: "click" no llega a window desde elementos sin acción y "dblclick" no existe, así que las diapositivas no avanzaban.
    # Se usa pointerup (funciona con mouse y dedo) y el doble toque de la última lámina hace de doble clic.
    js = (OUT / "slides.js").read_text(encoding="utf-8")
    parches = [
        ('addEventListener("click", (e) => { startMusic(); if (e.target.closest?.("[data-stop]")) return; return e.clientX < innerWidth * 0.15 ? prev() : next(); });',
         'let lastUp = 0, lastOnEnd = false;\n'
         'addEventListener("pointerup", (e) => {\n'
         '  startMusic();\n'
         '  if (e.target.closest?.("[data-stop]")) return;\n'
         '  const now = Date.now(), onEnd = !!SLIDES[current].end;\n'
         '  if (onEnd && lastOnEnd && now - lastUp < 500) { lastUp = 0; lastOnEnd = false; return finale(); }\n'
         '  lastUp = now; lastOnEnd = onEnd;\n'
         '  return e.clientX < innerWidth * 0.15 ? prev() : next();\n'
         '});'),
        ('addEventListener("dblclick", () => {\n  if (!SLIDES[current].end) return;',
         'const finale = () => {\n  if (!SLIDES[current].end) return;'),
        ('  else location.href = `/robot.html?lang=${LANG}`;\n});\naddEventListener("resize", fit);',
         '  else location.href = `/robot.html?lang=${LANG}`;\n};\naddEventListener("dblclick", finale);\naddEventListener("resize", fit);'),
    ]
    for viejo, nuevo in parches:
        assert js.count(viejo) == 1, viejo[:50]
        js = js.replace(viejo, nuevo)
    (OUT / "slides.js").write_text(js, encoding="utf-8")
    # iPhone/WebKit: un marco con opacity:0 y pointer-events:none igual recibe los toques, y las diapositivas ocultas
    # avanzaban solas. Con visibility:hidden no reciben nada (y siguen cargando por debajo).
    (OUT / "robot.css").write_text((OUT / "robot.css").read_text(encoding="utf-8") +
        "\n.holo-frame { visibility: hidden; }\n.holo-frame.holo-frame--on { visibility: visible; }\n", encoding="utf-8")
    for css in ("slides.css", "robot.css"):
        f = OUT / css
        f.write_text(f.read_text(encoding="utf-8") + "\nhtml, body { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }\n", encoding="utf-8")

    # La raíz lleva directo a la presentación; el sitio no se indexa.
    (OUT / "index.html").write_text(
        f'<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Aether</title>'
        f'<meta http-equiv="refresh" content="0;url={URL}"><a href="{URL}">Aether</a>', encoding="utf-8")
    (OUT / "_headers").write_text("/*\n  X-Robots-Tag: noindex, nofollow\n  Referrer-Policy: no-referrer\n/assets/*\n  Cache-Control: public, max-age=3600\n", encoding="utf-8")

    total = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
    print(f"{OUT} listo: {sum(1 for f in OUT.rglob('*') if f.is_file())} archivos, {total / 1e6:.0f} MB")


if __name__ == "__main__":
    main()
