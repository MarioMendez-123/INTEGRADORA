// Corrida REAL de extremo a extremo: robot.html (robot.js real, voz real de
// ElevenLabs) + reproductor real, conectados por el relevo real del backend.
// Mide, por frase, cuándo el cue ya está en pantalla contra cuándo empieza la
// voz real (evento 'playing' + silencio inicial de ESE mp3). Gasta ~1,144
// caracteres de ElevenLabs.
//
// Uso: node scripts/e2e-real.mjs [host:puerto] [--voz-local]   (requiere backend y npm run player:build)
//   --voz-local: bloquea /robot/tts → Lumina usa su respaldo speechSynthesis (0 créditos).
import { chromium } from "playwright-core";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { instrument } from "../phase0/instrument.mjs";
import { FFMPEG } from "./wav.mjs";

const BACKEND = process.argv.slice(2).find((a) => !a.startsWith("--")) || "127.0.0.1:8000";
const LOCAL_VOICE = process.argv.includes("--voz-local");
const timeline = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
const TARGET = timeline.sync.targetMs;
const LINES = timeline.cues.filter((c) => /^L\d\d$/.test(c.id));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  const h = (s.length - 1) * p;
  return Math.round(s[Math.floor(h)] + (s[Math.ceil(h)] - s[Math.floor(h)]) * (h - Math.floor(h)));
};

const server = spawn(process.execPath, ["scripts/serve.mjs", "5055"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--mute-audio", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"],
});

// --- Equipo del video
const video = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const vp = await video.newPage({ viewport: { width: 960, height: 540 } });
const vErrors = [];
vp.on("pageerror", (e) => vErrors.push(String(e)));
await vp.goto(`http://localhost:5055/player/?backend=${BACKEND}&feed=0`);
await vp.click("button");
await vp.waitForFunction(() => window.__aether && document.querySelectorAll("button").length === 0, null, { timeout: 120000 });
log("video armado");

// --- Pantalla del robot (cámara/YOLO bloqueados: no caben en 4 GB junto con todo lo demás)
const robot = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await robot.addInitScript(instrument);
await robot.route("**/perception/**", (r) => r.abort());
if (LOCAL_VOICE) await robot.route("**/robot/tts", (r) => r.abort());
const rp = await robot.newPage();
const rErrors = [];
rp.on("pageerror", (e) => rErrors.push(String(e)));
await rp.goto(`http://${BACKEND}/robot.html`);
await rp.waitForTimeout(2000);
await rp.click("#boot-hidden-btn", { force: true });
log("robot: botón oculto (10 s + encendido)");

const ended = (text, timeout) =>
  rp.waitForFunction((q) => window.__lm.some((e) => e.text === q && (e.type === "audio_ended" || e.type === "synth_end")), text, { timeout, polling: 200 });
await ended("¿Quieren ver cómo funciono?", 10 * 60 * 1000);
log("robot: terminó «¿Quieren ver cómo funciono?» — el expositor habla 5 s");
await rp.waitForTimeout(5000);
// Diagnóstico: estado de ambos lados justo antes del clicker.
const before = {
  video: await vp.evaluate(() => ({ cues: Object.keys(window.__aether.q).length, await: "await" in window.__aether.q, last: window.__aether.log.slice(-3).map((l) => l.type + ":" + (l.id ?? "")) })),
  robot: await rp.evaluate(() => ({ ws: showSocket && showSocket.readyState, waiting: typeof luminaWaitResolve === "function" })),
};
log("antes del clicker:", JSON.stringify(before));
const pressWall = Date.now();
await vp.keyboard.press("ArrowRight"); // clicker → {type:"wake"} por el relevo → robot.js
log("clicker: respaldo de «Lumina» enviado");
await vp.waitForFunction(() => "heard" in window.__aether.q, null, { timeout: 15000 }).then(
  () => log("video: heard recibido"),
  () => log("video: heard NO llegó en 15 s"),
);
log("robot sigue esperando:", await rp.evaluate(() => typeof luminaWaitResolve === "function"));
await ended("Esto es lo que soy capaz de ver ahora mismo.", 5 * 60 * 1000);
await vp.waitForTimeout(3000);
for (let k = 0; k < 7; k++) {
  await vp.keyboard.press("ArrowRight");
  await vp.waitForTimeout(1500);
}
await vp.waitForTimeout(12000);
log("cierre por clicker terminado");

const R = await rp.evaluate(() => ({ lm: window.__lm, origin: performance.timeOrigin, mp3: window.__mp3 || [], ua: navigator.userAgent }));
const V = await vp.evaluate(() => ({ log: window.__aether.log, shown: { ...window.__aether.shown }, origin: performance.timeOrigin }));
await browser.close();
server.kill();

// --- Silencio inicial de cada mp3 real de esta corrida.
const mp3Dir = LOCAL_VOICE ? "render/e2e-mp3" : "phase0/raw/e2e";
fs.mkdirSync(mp3Dir, { recursive: true });
const leadOf = {};
R.mp3.forEach((m, k) => {
  const f = path.join(mp3Dir, `${String(k + 1).padStart(2, "0")}.mp3`);
  fs.writeFileSync(f, Buffer.from(m.b64, "base64"));
  const err = spawnSync(FFMPEG, ["-hide_banner", "-i", f, "-af", "silencedetect=n=-40dB:d=0.05", "-f", "null", "-"]).stderr.toString();
  const s0 = /silence_start: (-?[\d.]+)/.exec(err);
  const e0 = /silence_end: ([\d.]+)/.exec(err);
  leadOf[m.text] = s0 && Number(s0[1]) <= 0.001 && e0 ? Number(e0[1]) * 1000 : 0;
});

// --- Error por frase: frame del cue en pantalla − inicio real de la voz.
const rows = LINES.map((c) => {
  const playing = R.lm.find((e) => e.text === c.text && (e.type === "audio_playing" || e.type === "synth_start"));
  const shown = V.shown[c.id];
  const cue = V.log.find((l) => l.type === "cue" && l.id === c.id);
  if (!playing || shown == null) return { id: c.id, text: c.text, source: cue?.source ?? "nunca", errorMs: null };
  const voiceWall = R.origin + playing.t + (leadOf[c.text] ?? 0);
  return { id: c.id, text: c.text, source: cue.source, leadMs: Math.round(leadOf[c.text] ?? 0), errorMs: Math.round(shown - voiceWall) };
});
const errs = rows.filter((r) => r.errorMs != null).map((r) => r.errorMs);
const abs = errs.map(Math.abs);
const relay = V.log.filter((l) => l.type === "event" && typeof l.relayMs === "number").map((l) => l.relayMs);
const clickerT = V.log.find((l) => l.type === "clicker")?.t;
const heard = V.log.find((l) => l.type === "cue" && l.id === "heard");
const l30 = R.lm.find((e) => e.text === "Dígame, señor." && e.type === "audio_playing");
const out = {
  when: new Date().toISOString(),
  where: "misma laptop (robot y video en contextos separados de Chrome headless), backend real en " + BACKEND,
  voice: LOCAL_VOICE ? "respaldo speechSynthesis (Microsoft Raul)" : "ElevenLabs (real)",
  before_clicker: before,
  robot_user_agent: R.ua,
  sync: { n: errs.length, median_ms: pct(errs, 0.5), p95_abs_ms: pct(abs, 0.95), max_abs_ms: Math.max(...abs), target: TARGET },
  meets_target: pct(abs, 0.5) <= TARGET.median && pct(abs, 0.95) <= TARGET.p95,
  relay_ms: relay.length ? { n: relay.length, median: pct(relay, 0.5), p95: pct(relay, 0.95), max: Math.max(...relay) } : null,
  clicker_to_heard_ms: clickerT != null && heard ? Math.round(heard.t - clickerT) : null,
  heard_via: heard?.via ?? heard?.source,
  clicker_press_to_digame_audio_ms: l30 ? Math.round(R.origin + l30.t - pressWall) : null,
  watchdog: V.log.filter((l) => l.type === "watchdog").map((l) => l.id),
  duplicates: V.log.filter((l) => l.type === "duplicate").length,
  closing: ["C1", "SEE", "UNDERSTAND", "DECIDE", "C3", "C4", "C5", "silence", "card"].map((id) => ({ id, source: V.log.find((l) => l.type === "cue" && l.id === id)?.source ?? null })),
  errors_js: { video: vErrors, robot: rErrors },
  per_line: rows,
};
fs.mkdirSync("render/verificacion", { recursive: true });
fs.writeFileSync(`render/verificacion/e2e_real${LOCAL_VOICE ? "_voz_local" : ""}.json`, JSON.stringify(out, null, 1));
const { per_line, ...summary } = out;
console.log(JSON.stringify(summary, null, 1));
