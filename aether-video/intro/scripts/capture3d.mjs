// Captura tomas del modelo 3D del carrito (sim/generado/carrito_3d.html ?sim) como secuencias JPEG.
import { chromium } from "playwright-core";
import fs from "fs"; import path from "path"; import { pathToFileURL } from "url";
const html = path.resolve("../sim/generado/carrito_3d.html");
const out = path.resolve("intro/public/cart");
const only = process.argv[2];
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: false, args: ["--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.log("pageerror", e.message));
await page.goto(pathToFileURL(html).href + "?sim#armado");
await page.waitForFunction(() => window.__aether && document.body.classList.contains("ready"), null, { timeout: 90000 });
await page.waitForTimeout(2500);
await page.evaluate(() => {
  window.requestAnimationFrame = () => 0;                         // paro el bucle: yo dirijo cada cuadro
  const A = window.__aether, { scene } = A;
  scene.traverse(o => { if (o.type === "GridHelper") { const c = o.geometry.attributes.color; for (let i = 0; i < c.count; i++) c.setXYZ(i, 0.55, 0.5, 1); c.needsUpdate = true; o.material.opacity = 0.35; } });
  document.documentElement.style.setProperty("--scene", "#05070a"); document.documentElement.style.setProperty("--floor", "#07090e");
  document.querySelectorAll(".labels, .tag, .dim").forEach(e => e.remove());
  A.controls.enabled = false; A.ui.labels = false; A.ui.dims = false;
  window.__shot = (cam, tgt, explode, fov) => {
    A.ui.explodeAmt = explode; A.camera.position.set(...cam); A.controls.target.set(...tgt);
    if (fov) { A.camera.fov = fov; A.camera.updateProjectionMatrix(); }
    A.camera.lookAt(...tgt); A.applyAt(A.ui.T, 0.016); A.renderer.render(A.scene, A.camera); return A.renderer.domElement.toDataURL("image/jpeg", 0.9);
  };
});
const e = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const L = (a, b, t) => a + (b - a) * t;
const C = [0.16, 0.52, 0];
const SHOTS = {
  orbita: { n: 150, f: t => { const a = L(0.5, 2.1, t); return [[C[0] + Math.cos(a) * 2.7, L(0.7, 1.15, t), Math.sin(a) * 2.7], C, 0, 34]; } },
  macro: { n: 90, f: t => [[L(-0.5, 1.1, t), 0.75, 1.15], [L(0.0, 0.5, t), 0.62, 0], 0, 26] },
  explode: { n: 120, f: t => { const k = e(Math.min(1, t * 1.15)); return [[C[0] + L(1.9, 3.3, t), L(1.0, 1.6, t), L(1.9, 2.9, t)], [C[0], L(0.5, 0.65, t), 0], k, 36]; } },
  cenital: { n: 90, f: t => [[C[0] + L(0.3, 2.0, e(t)), L(3.4, 1.4, e(t)), L(0.3, 1.7, e(t))], C, 0, 36] },
};
for (const [name, s] of Object.entries(SHOTS)) {
  if (only && only !== name) continue;
  const dir = path.join(out, name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < s.n; i++) {
    const [cam, tgt, ex, fov] = s.f(i / (s.n - 1));
    const d = await page.evaluate(a => window.__shot(...a), [cam, tgt, ex, fov]);
    fs.writeFileSync(path.join(dir, String(i).padStart(4, "0") + ".jpg"), Buffer.from(d.split(",")[1], "base64"));
  }
  console.log("ok", name, s.n);
}
await browser.close();
