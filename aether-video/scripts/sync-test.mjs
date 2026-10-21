// Prueba de sincronía (pasos 5 y 6 de VERIFICACIÓN) con el reproductor REAL en
// Chrome: se le inyectan los eventos de Lumina con tiempos muestreados de la
// distribución medida (player/samples.json) y se mide, por cue, cuándo el frame
// del cue ya está en pantalla contra cuándo empieza la voz.
//
// error = (frame en pantalla − llegada del evento) + relevo WS − inicio de voz tras 'playing'
// (relevo y silencio inicial: medianas medidas en la Fase 0; ver lumina_timing.json).
//
// Uso: node scripts/sync-test.mjs [escenario ...]   (requiere npm run player:build)
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import { planLumina } from "../player/sim.mjs";

const timeline = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
const samples = JSON.parse(fs.readFileSync("player/samples.json", "utf8"));
const timing = JSON.parse(fs.readFileSync("phase0/lumina_timing.json", "utf8"));
const RELAY = timing.show_channel_relay.sent_to_received_ms.median;
const ONSET = timing.voice_onset_in_mp3.lead_silence_ms.median;
const TARGET = timeline.sync.targetMs;

const SCENARIOS = {
  none: { profile: "none" },
  none_b: { profile: "none", seed: 7 },
  slow4g: { profile: "slow4g" },
  "3g": { profile: "3g" },
  lat1000: { profile: "lat1000" },
  offline_voz_local: { profile: "offline" },
  voz_muy_tardia: { profile: "none", extraDelayMs: 3000 },
  eventos_perdidos: { profile: "none", dropProb: 0.1, seed: 3 },
  red_local_caida: { profile: "none", lanDownAtMs: 90000 },
  expositor_largo: { profile: "none", expositorMs: 150000, closing: true },
};
const pick = process.argv.slice(2);
const list = pick.length ? pick : Object.keys(SCENARIOS);

const server = spawn(process.execPath, ["scripts/serve.mjs", "5055"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
});
// Fusiona con resultados previos (se puede repetir un escenario suelto).
const prevFile = "render/verificacion/sincronia.json";
const results = fs.existsSync(prevFile) ? JSON.parse(fs.readFileSync(prevFile, "utf8")).results ?? {} : {};
const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const h = (s.length - 1) * p;
  return Math.round(s[Math.floor(h)] + (s[Math.ceil(h)] - s[Math.floor(h)]) * (h - Math.floor(h)));
};

for (const name of list) {
  const sc = SCENARIOS[name];
  const plan = planLumina({ timeline, samples, expositorMs: 8000, seed: 1, ...sc });
  const full = planLumina({ timeline, samples, expositorMs: 8000, seed: 1, ...sc, dropProb: 0, lanDownAtMs: Infinity }); // referencia: cuándo habla de verdad
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://localhost:5055/player/?backend=127.0.0.1:9&feed=0");
  await page.click("button");
  await page.waitForFunction(() => window.__aether && document.querySelectorAll("button").length === 0, null, { timeout: 120000 });
  const wallStart = Date.now();
  const t0 = await page.evaluate((p) => {
    const start = performance.now();
    window.__inj = [];
    for (const e of p) setTimeout(() => {
      window.__inj.push({ ...e, t: performance.now() });
      window.__aether.api.lumina({ from: "lumina", ...e });
    }, e.at);
    return start;
  }, plan);
  const endAt = full[full.length - 1].at;
  if (sc.lanDownAtMs) {
    const awaitAt = full.find((e) => e.type === "heard-lumina").at;
    await page.waitForTimeout(Math.max(0, awaitAt - (Date.now() - wallStart)));
    await page.keyboard.press("ArrowRight"); // el expositor usa el clicker
  }
  await page.waitForTimeout(Math.max(0, endAt + 6000 - (Date.now() - wallStart)));
  // No cerrar antes de que el video termine su propia secuencia (en piloto automático puede ir detrás).
  await page.waitForFunction(() => window.__aether.q.camera != null, null, { timeout: 30000 }).catch(() => {});
  if (sc.closing) {
    for (let k = 0; k < 7; k++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(1500);
    }
    await page.waitForTimeout(11000);
  }
  const data = await page.evaluate(() => ({ log: window.__aether.log, shown: { ...window.__aether.shown }, origin: performance.timeOrigin, inj: window.__inj }));
  await page.close();

  // Por cada frase: error contra el inicio REAL de la voz (plan completo).
  const rows = [];
  for (let i = 1; i <= 32; i++) {
    const id = `L${String(i).padStart(2, "0")}`;
    const ref = full.find((e) => e.type === "line-start" && e.i === i);
    const shownAt = data.shown[id] != null ? data.shown[id] - data.origin : null;
    const fired = data.log.find((l) => l.type === "cue" && l.id === id);
    if (!ref || shownAt == null) {
      rows.push({ id, source: fired?.source ?? "nunca", errorMs: null });
      continue;
    }
    const voiceAt = t0 + ref.at + RELAY + ONSET;
    rows.push({ id, source: fired.source, errorMs: Math.round(shownAt - voiceAt) });
  }
  const ok = rows.filter((r) => r.errorMs != null).map((r) => r.errorMs);
  const abs = ok.map(Math.abs);
  const watchdog = data.log.filter((l) => l.type === "watchdog").map((l) => l.id);
  results[name] = {
    scenario: sc,
    events_injected: plan.length,
    errors_js: errors,
    sync: { n: ok.length, median_ms: pct(ok, 0.5), p95_abs_ms: pct(abs, 0.95), max_abs_ms: Math.max(...abs) },
    meets_target: pct(abs, 0.5) <= TARGET.median && pct(abs, 0.95) <= TARGET.p95,
    watchdog_fired: watchdog,
    cues_out_of_target: rows.filter((r) => r.errorMs == null || Math.abs(r.errorMs) > TARGET.p95),
    closing: sc.closing ? ["C1", "SEE", "UNDERSTAND", "DECIDE", "C3", "C4", "C5", "silence", "card"].map((id) => ({ id, fired: data.log.find((l) => l.type === "cue" && l.id === id)?.source ?? null })) : undefined,
    log_tail: data.log.filter((l) => l.type !== "event").slice(-30).map((l) => ({ t: Math.round(l.t), type: l.type, id: l.id, source: l.source, backdateMs: l.backdateMs })),
    per_line: rows,
  };
  const r = results[name];
  console.log(`${name.padEnd(18)} mediana ${r.sync.median_ms} ms · p95|e| ${r.sync.p95_abs_ms} ms · máx ${r.sync.max_abs_ms} ms · watchdog ${watchdog.length} · fuera ${r.cues_out_of_target.length} · js ${errors.length}`);
  fs.mkdirSync("render/verificacion", { recursive: true });
  fs.writeFileSync("render/verificacion/sincronia.json", JSON.stringify({ relayMs: RELAY, voiceOnsetMs: ONSET, targetMs: TARGET, results }, null, 1));
}
await browser.close();
server.kill();
