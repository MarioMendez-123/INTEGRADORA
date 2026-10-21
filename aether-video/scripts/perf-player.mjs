// Fluidez del reproductor en vivo: cuadros por segundo y cuadros lentos por escena.
// Salta de escena en escena con api.cue() y mide 5 s de requestAnimationFrame en cada una.
// Uso: node scripts/perf-player.mjs [etiqueta]   (requiere npm run player:build)
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";

const label = process.argv[2] || "medicion";
const SCENES = [
  ["despertar", "L02"],
  ["observacion", "L08"],
  ["problema", "L13"],
  ["proceso", "L19"],
  ["revelacion", "L20"],
  ["arquitectura", "L25"],
  ["integracion", "L28e"],
  ["expositor", "await"],
  ["demo", "camera"],
  ["evolucion", "DECIDE"],
  ["cierre_marcas", "C3"],
  ["cierre_forma", "C4"],
];

const server = spawn(process.execPath, ["scripts/serve.mjs", "5056"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--mute-audio"] });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await page.goto("http://localhost:5056/player/?backend=127.0.0.1:9&feed=0");
await page.click("button");
await page.waitForFunction(() => window.__aether && document.querySelectorAll("button").length === 0, null, { timeout: 120000 });

const rows = [];
for (const [name, cue] of SCENES) {
  await page.evaluate((c) => window.__aether.api.cue(c), cue);
  await page.waitForTimeout(1500); // que arranque la animación de entrada
  const r = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const d = [];
        let last = performance.now();
        const end = last + 5000;
        const tick = (t) => {
          d.push(t - last);
          last = t;
          if (t < end) requestAnimationFrame(tick);
          else resolve(d);
        };
        requestAnimationFrame(tick);
      }),
  );
  const s = [...r].sort((a, b) => a - b);
  const fps = r.length / 5;
  const slow = r.filter((x) => x > 50).length; // perdió al menos un cuadro de 30 fps
  rows.push({ scene: name, fps: +fps.toFixed(1), p95_ms: +s[Math.floor(s.length * 0.95)].toFixed(1), max_ms: +s[s.length - 1].toFixed(1), slow_frames: slow });
  console.log(`${name.padEnd(14)} ${fps.toFixed(1).padStart(5)} fps · p95 ${s[Math.floor(s.length * 0.95)].toFixed(1)} ms · máx ${s[s.length - 1].toFixed(0)} ms · lentos ${slow}`);
}
await browser.close();
server.kill();
fs.mkdirSync("render/verificacion", { recursive: true });
fs.writeFileSync(`render/verificacion/fluidez_${label}.json`, JSON.stringify(rows, null, 1));
