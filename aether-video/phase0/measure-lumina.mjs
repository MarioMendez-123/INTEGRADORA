// Fase 0 — mide a Lumina (dashboard/robot.js) tal cual corre, sin modificarla.
// Instrumenta desde fuera (addInitScript): fetch("/robot/tts"), el <audio> que
// reproduce la respuesta y speechSynthesis (respaldo). Todo con performance.now().
//
// Uso: node phase0/measure-lumina.mjs <perfil> <corridas> [lane]
// Perfiles: none fast4g slow4g 3g lat300 lat1000 offline
// Requiere el backend corriendo en http://127.0.0.1:8000 (sirve robot.html y /robot/tts).
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { instrument } from "./instrument.mjs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = "http://127.0.0.1:8000/robot.html";
const LAST_LINE = "Esto es lo que soy capaz de ver ahora mismo.";

// Valores de los presets de Chrome DevTools (NetworkManager.ts), bytes/s y ms.
const PROFILES = {
  none: null,
  fast4g: { latency: 165, downloadThroughput: 1_012_500, uploadThroughput: 168_750 },
  slow4g: { latency: 562.5, downloadThroughput: 180_000, uploadThroughput: 84_375 },
  "3g": { latency: 2000, downloadThroughput: 50_000, uploadThroughput: 50_000 },
  lat300: { latency: 300, downloadThroughput: -1, uploadThroughput: -1 },
  lat1000: { latency: 1000, downloadThroughput: -1, uploadThroughput: -1 },
  offline: { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 },
};

const [profile = "none", runsArg = "1", lane = "0"] = process.argv.slice(2);
if (!(profile in PROFILES)) throw new Error(`perfil desconocido: ${profile}`);
const RUNS = Number(runsArg);
const outDir = path.resolve("phase0/raw", profile);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    "--mute-audio",
    // En el escenario la página está en primer plano; en headless no hay
    // ventana visible, así que se evita que Chrome la trate como de fondo.
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
  ],
});
const chromeVersion = browser.version();

let context = null;
for (let run = 1; run <= RUNS; run++) {
  const cold = run % 2 === 1; // impares: contexto nuevo (caché fría); pares: mismo contexto (caché caliente)
  if (cold) {
    if (context) await context.close();
    context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(instrument);
    // La cámara/YOLO se activa DESPUÉS de la última frase medida; se bloquea
    // para que su carga de CPU no contamine la corrida siguiente.
    await context.route("**/perception/**", (r) => r.abort());
  }
  const page = context.pages()[0] || (await context.newPage());
  const consoleLog = [];
  page.on("console", (m) => consoleLog.push(`${m.type()}: ${m.text()}`));
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  if (PROFILES[profile]) {
    await cdp.send("Network.emulateNetworkConditions", { offline: false, ...PROFILES[profile] });
  }

  const wallStart = new Date().toISOString();
  await page.click("#boot-hidden-btn", { force: true });
  let status = "ok";
  // robot.js espera a oír "Lumina" tras "¿Quieren ver cómo funciono?". Aquí se
  // despacha por la misma función que usa el reconocimiento de voz tras su
  // debounce (handleVoiceCommand), 3 s después — la latencia del
  // reconocimiento en sí se mide aparte (phase0/recognition-test.html).
  const QUESTION = "¿Quieren ver cómo funciono?";
  page
    .waitForFunction((q) => window.__lm.some((e) => e.text === q && e.type === "audio_ended"), QUESTION, { timeout: 10 * 60 * 1000, polling: 200 })
    .then(() => page.waitForTimeout(3000))
    .then(() =>
      page.evaluate(() => {
        if (typeof handleVoiceCommand !== "function" || typeof waitForLumina !== "function") return;
        window.__lm.push({ t: performance.now(), type: "lumina_dispatched" });
        handleVoiceCommand("lumina");
      }),
    )
    .catch(() => {});
  try {
    await page.waitForFunction(
      (last) =>
        window.__lm.some(
          (e) =>
            e.text === last &&
            ["audio_ended", "audio_error", "synth_end", "synth_error", "tts_err"].includes(e.type),
        ) || window.__lm.filter((e) => e.type === "synth_error" || e.type === "audio_error").length > 40,
      LAST_LINE,
      { timeout: 12 * 60 * 1000, polling: 500 },
    );
  } catch (err) {
    status = `timeout: ${err.message.split("\n")[0]}`;
  }
  const events = await page.evaluate(() => window.__lm);
  const mp3s = await page.evaluate(() => window.__mp3 || []);
  const mp3Dir = path.join(outDir, `run-${String(run).padStart(2, "0")}-mp3`);
  fs.mkdirSync(mp3Dir, { recursive: true });
  mp3s.forEach((m, k) => fs.writeFileSync(path.join(mp3Dir, `${String(k + 1).padStart(2, "0")}.mp3`), Buffer.from(m.b64, "base64")));
  const meta = await page.evaluate(() => ({
    ...window.__lmMeta,
    userAgent: navigator.userAgent,
    hardwareConcurrency: navigator.hardwareConcurrency,
  }));
  const record = { profile, run, cold, lane, status, wallStart, chromeVersion, conditions: PROFILES[profile], meta, events, console: consoleLog };
  fs.writeFileSync(path.join(outDir, `run-${String(run).padStart(2, "0")}.json`), JSON.stringify(record, null, 1));
  const n = events.filter((e) => e.type === "audio_playing" || e.type === "synth_start").length;
  console.log(`[${profile}] corrida ${run}/${RUNS} (${cold ? "fría" : "caliente"}) — ${status}, frases con audio: ${n}`);
  await cdp.detach();
  page.removeAllListeners("console");
  await page.goto("about:blank"); // corta audio/timers pendientes antes de la siguiente corrida
}
await context?.close();
await browser.close();
