from pathlib import Path

root = Path(r"C:\Users\mende\Downloads\INTEGRADORAAHORASI\docs\hardware")
html = (root / "carrito-explode.html").read_text(encoding="utf-8")
three = (root / "_three.min.js").read_text(encoding="utf-8")
old = '<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>'
new = "<script>\n" + three.strip() + "\n</script>"
if old not in html:
    raise SystemExit("no esta el script de three")
html = html.replace(old, new, 1)
(root / "carrito-explode.html").write_text(html, encoding="utf-8", newline="\n")
print("bytes", len(html.encode("utf-8")))
