// Captura las tomas con letras 3D reales. Uso: node intro/scripts/capture_v3.mjs [toma] [--prueba]
import { chromium } from "playwright-core";
import fs from "fs"; import path from "path"; import { pathToFileURL } from "url";
const BEAT = 0.48;
const only = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;
const prueba = process.argv.includes("--prueba");            // solo unos cuadros, sin desenfoque
const out = path.resolve("intro/public/cart3");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: false, args: ["--ignore-gpu-blocklist", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.log("pageerror", e.message));
page.on("console", m => { if (m.type() === "error") console.log("console", m.text().slice(0, 300)); });
await page.goto(pathToFileURL(path.resolve("../sim/generado/carrito_3d.html")).href + "?sim#armado");
await page.waitForFunction(() => window.__aether && document.body.classList.contains("ready"), null, { timeout: 90000 });
await page.waitForTimeout(2000);
await page.addScriptTag({ path: path.resolve("intro/scripts/stage3d.browser.js") });
const font = fs.readFileSync("intro/assets/Inter-ExtraBold.ttf").toString("base64");
const names = await page.evaluate(([f, b]) => window.__initStage(f, b), [font, BEAT]);
console.log("tomas", names.join(" "));
for (const name of names) {
  if (only && only !== name) continue;
  const n = await page.evaluate(k => window.__begin(k), name);
  const dir = path.join(out, name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const t0 = Date.now();
  const idx = prueba ? [0.15, 0.4, 0.6, 0.8, 0.97].map(p => Math.floor(p * (n - 1))) : Array.from({ length: n }, (_, i) => i);
  for (const i of idx) {
    const d = await page.evaluate(([k, s]) => window.__frame(k, s), [i, prueba ? 1 : 5]);
    fs.writeFileSync(path.join(dir, String(i).padStart(4, "0") + ".jpg"), Buffer.from(d.split(",")[1], "base64"));
  }
  console.log("ok", name, idx.length + "/" + n, ((Date.now() - t0) / 1000).toFixed(0) + "s");
}
await browser.close();
