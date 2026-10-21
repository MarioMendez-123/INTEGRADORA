// Renderiza toda la música y los efectos (audio/engine.js en OfflineAudioContext
// de Chrome), la pista de voz real de Lumina en sus medianas, el ducking por
// sidechain y las mezclas. Uso: node scripts/music.mjs [--skip-live]
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";
import { decode, readWav, writeWav } from "./wav.mjs";
import { END_FADE, FADER } from "../audio/engine.js";

const SR = 48000;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const timeline = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
const DUR = timeline.durationMs / 1000;

// Cues en segundos (+ fin de cada frase como `L07e`).
const T = {};
const KW = {};
for (const c of timeline.cues) {
  T[c.id] = c.atMs / 1000;
  if (c.durMs) T[`${c.id}e`] = (c.atMs + c.durMs) / 1000;
  if (c.keyWordEndMs) KW[c.id] = c.keyWordEndMs / 1000;
}
KW.L28 = timeline.cues.find((c) => c.id === "L28").durMs / 1000;

const bundle = await build({ entryPoints: ["audio/engine.js"], bundle: true, format: "iife", globalName: "AetherAudio", write: false, logLevel: "warning" });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setContent("<!doctype html><title>render</title>");
await page.addScriptTag({ content: bundle.outputFiles[0].text });
await page.evaluate(() => {
  window.renderJob = async (job) => {
    const A = window.AetherAudio;
    const ctx = new OfflineAudioContext(2, Math.ceil(job.seconds * job.sr), job.sr);
    const r = A.createRig(ctx, { stems: job.stems, master: job.master, origin: job.origin ?? 0 });
    if (job.kind === "arrange") {
      A.arrange(r, job.T, { kw: job.kw, ...job.opts });
      if (job.silence != null) A.silenceAt(r, job.silence);
    } else if (job.kind === "bed") A.BEDS[job.name].bed(r, 0, job.seconds);
    else if (job.kind === "stinger") A.STINGERS[job.name](r, job.at, job.d ?? 0);
    else if (job.kind === "sfx") A.SFX[job.name](r, job.at, job.d ?? 0);
    const buf = await ctx.startRendering();
    window.__ch = [buf.getChannelData(0), buf.getChannelData(1)];
    return buf.length;
  };
  window.pull = (start, n) => {
    const [L, R] = window.__ch;
    const end = Math.min(L.length, start + n);
    const out = new Float32Array((end - start) * 2);
    for (let i = start, o = 0; i < end; i++) {
      out[o++] = L[i];
      out[o++] = R[i];
    }
    const bytes = new Uint8Array(out.buffer);
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  window.AetherAudioInfo = () => ({ beds: Object.fromEntries(Object.entries(window.AetherAudio.BEDS).map(([k, v]) => [k, v.loop])), stingers: Object.keys(window.AetherAudio.STINGERS), sfx: Object.keys(window.AetherAudio.SFX), BAR: window.AetherAudio.BAR });
});

async function render(job) {
  const n = await page.evaluate((j) => window.renderJob(j), { sr: SR, master: true, stems: null, ...job });
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const CH = SR * 4;
  for (let s = 0; s < n; s += CH) {
    const f = new Float32Array(Buffer.from(await page.evaluate(([a, b]) => window.pull(a, b), [s, CH]), "base64").buffer.slice(0));
    for (let i = 0; i < f.length / 2; i++) {
      L[s + i] = f[2 * i];
      R[s + i] = f[2 * i + 1];
    }
  }
  return [L, R];
}
const addInto = (dst, src, at = 0, g = 1) => {
  const o = Math.round(at * SR);
  for (let c = 0; c < 2; c++) for (let i = 0; i < src[c].length && o + i < dst[c].length; i++) if (o + i >= 0) dst[c][o + i] += src[c][i] * g;
};
const peak = (x) => x.reduce((m, ch) => ch.reduce((mm, v) => Math.max(mm, Math.abs(v)), m), 0);
const dB = (x) => 20 * Math.log10(Math.max(1e-9, x));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const info = await page.evaluate(() => window.AetherAudioInfo());

/** El arreglo completo se renderiza por ventanas de WIN s (con PRE s de
 * pre-roll para colas y reverb) unidas con crossfade de potencia constante:
 * un solo OfflineAudioContext de 4+ minutos satura una máquina de 4 GB. */
const WIN = 20;
const PRE = 6;
const XF = 0.25;
async function renderWindowed(job, seconds) {
  const n = Math.ceil(seconds * SR);
  const out = [new Float32Array(n), new Float32Array(n)];
  for (let w0 = 0; w0 < seconds; w0 += WIN) {
    const w1 = Math.min(seconds, w0 + WIN);
    const origin = Math.max(0, w0 - PRE);
    const x = await render({ ...job, origin, seconds: w1 + XF - origin });
    const first = w0 === 0;
    const last = w1 >= seconds;
    const s0 = Math.round((w0 - origin) * SR);
    for (let i = s0; i < x[0].length; i++) {
      const t = origin + i / SR;
      const o = Math.round(t * SR);
      if (o >= n) break;
      let g = 1;
      if (!first && t < w0 + XF) g *= Math.sin((Math.PI / 2) * ((t - w0) / XF));
      if (!last && t >= w1) g *= Math.cos((Math.PI / 2) * Math.min(1, (t - w1) / XF));
      out[0][o] += x[0][i] * g;
      out[1][o] += x[1][i] * g;
    }
    log(`  ventana ${w0}-${w1} s`);
  }
  return out;
}
const SECONDS = DUR + 1;

/** Curva del fader por sección (tabla FADER de engine.js) + fundido final.
 * Cada punto arranca desde donde iba la curva y llega a su nivel en `ramp` s. */
export function faderCurve(T, fader = FADER, endFade = END_FADE) {
  const pts = fader.filter(([id]) => T[id] != null).map(([id, db, ramp, delay = 0]) => ({ t: T[id] + delay, g: 10 ** (db / 20), ramp })).sort((x, y) => x.t - y.t);
  const start = [pts[0].g];
  for (let j = 1; j < pts.length; j++) {
    const p = pts[j - 1];
    start[j] = start[j - 1] + (p.g - start[j - 1]) * Math.min(1, (pts[j].t - p.t) / p.ramp);
  }
  const endA = T[endFade.cue] + endFade.after;
  return (t) => {
    let j = -1;
    while (j + 1 < pts.length && t >= pts[j + 1].t) j++;
    let g = j < 0 ? pts[0].g : start[j] + (pts[j].g - start[j]) * Math.min(1, (t - pts[j].t) / pts[j].ramp);
    if (t >= endA) g *= Math.max(0, 1 - (t - endA) / endFade.dur);
    return g;
  };
}
// Lineal: aplicarlo a la mezcla o a cada stem da lo mismo.
function applyFader(x) {
  const curve = faderCurve(T);
  const step = 64; // la curva cambia lento: se evalúa cada 64 muestras
  for (let i = 0; i < x[0].length; i += step) {
    const g = curve(i / SR);
    for (let k = i; k < Math.min(i + step, x[0].length); k++) {
      x[0][k] *= g;
      x[1][k] *= g;
    }
  }
  return x;
}

// ---- 1. Música completa SIN ducking (C) — el silencio final es real ---------
const arrangeJob = (opts, extra = {}) => ({ kind: "arrange", T, kw: KW, opts: { end: T.silence, ...opts }, silence: T.silence, ...extra });
const cardJob = (extra = {}) => ({ kind: "stinger", name: "card", at: T.card, origin: T.card - 0.5, seconds: 8.5, ...extra });
const withCard = (x, card) => (addInto(x, card, T.card - 0.5), x);
log("música completa…");
const REMIX = process.argv.includes("--remix"); // solo fader + ducking + mezclas, desde render/cache
const cache = (name, x) => (writeWav(`render/cache/${name}.wav`, x, SR, 32), x);
const cached = (name) => readWav(`render/cache/${name}.wav`).chans;
const music = REMIX ? cached("music_raw") : cache("music_raw", withCard(await renderWindowed(arrangeJob({ sfx: false }), SECONDS), await render(cardJob())));
applyFader(music);
log(`  pico ${dB(peak(music)).toFixed(1)} dBFS`);
writeWav("music/aether_music_sin_ducking.wav", music, SR);

// ---- 2. Stems (sin compresión maestra: suman linealmente) -------------------
for (const stem of ["pad", "bass", "pulse", "piano", "perc", "tex"]) {
  log(`stem ${stem}…`);
  const s = REMIX ? cached(`stem_${stem}_raw`) : cache(`stem_${stem}_raw`, withCard(await renderWindowed(arrangeJob({ sfx: false }, { stems: [stem], master: false }), SECONDS), await render(cardJob({ stems: [stem], master: false }))));
  applyFader(s);
  writeWav(`music/stems/${stem}.wav`, s, SR);
}

// ---- 3. Efectos en sus medianas --------------------------------------------
log("efectos…");
const sfx = REMIX ? cached("sfx_raw") : cache("sfx_raw", await renderWindowed(arrangeJob({ beds: false, stingers: false, sfx: true }, { stems: ["sfx"], silence: null }), SECONDS));
writeWav("sfx/aether_sfx.wav", sfx, SR);

// ---- 4. Segmentos para el vivo ----------------------------------------------
if (!process.argv.includes("--skip-live") && !process.argv.includes("--remix")) {
  for (const [name, bars] of Object.entries(info.beds)) {
    const P = bars * info.BAR;
    log(`cama ${name} (${bars} compases)…`);
    const x = await render({ kind: "bed", name, seconds: P * 3 });
    // Periodo central: el material ya está estable y su cola envuelve el bucle.
    const a = Math.round(P * SR);
    const b = Math.round(2 * P * SR);
    writeWav(`music/live/bed_${name}.wav`, [x[0].slice(a, b), x[1].slice(a, b)], SR);
  }
  for (const id of info.stingers) {
    const d = KW[id] ?? 0;
    const x = await render({ kind: "stinger", name: id, at: 0.02, d, seconds: d + 8 });
    writeWav(`music/live/st_${id}.wav`, x, SR);
  }
  for (const id of info.sfx) {
    const d = KW[id] ?? 0;
    const x = await render({ kind: "sfx", name: id, at: 0.02, d, seconds: d + 5, stems: ["sfx"] });
    writeWav(`sfx/live/${id}.wav`, x, SR);
  }
  log("segmentos en vivo listos");
}
await browser.close();

// ---- 5. Voz real de Lumina (mp3 capturados de /robot/tts) en sus medianas ----
log("voz…");
const voice = [new Float32Array(music[0].length), new Float32Array(music[0].length)];
const mp3Dir = "phase0/raw/none/run-03-mp3";
for (let i = 1; i <= 32; i++) {
  const id = `L${String(i).padStart(2, "0")}`;
  const w = decode(`${mp3Dir}/${String(i).padStart(2, "0")}.mp3`, SR);
  addInto(voice, w.chans, T[id]);
}
writeWav("audio/voz_lumina_medianas.wav", voice, SR);

// ---- 6. Ducking por sidechain desde la voz -----------------------------------
// Seguidor de envolvente (ataque 12 ms, liberación 450 ms) sobre la voz; la
// música baja hasta DUCK_DB mientras la voz supera el umbral.
const DUCK_DB = -11;
const THRESH = 10 ** (-42 / 20);
function sidechain(target, key) {
  const n = target[0].length;
  const out = [new Float32Array(n), new Float32Array(n)];
  const aA = Math.exp(-1 / (0.012 * SR));
  const aR = Math.exp(-1 / (0.45 * SR));
  let e = 0;
  let g = 1;
  const floor = 10 ** (DUCK_DB / 20);
  const gA = Math.exp(-1 / (0.03 * SR));
  const gR = Math.exp(-1 / (0.5 * SR));
  for (let i = 0; i < n; i++) {
    const k = Math.max(Math.abs(key[0][i]), Math.abs(key[1][i]));
    e = k > e ? aA * e + (1 - aA) * k : aR * e + (1 - aR) * k;
    const want = e > THRESH ? floor : 1;
    g = want < g ? gA * g + (1 - gA) * want : gR * g + (1 - gR) * want;
    out[0][i] = target[0][i] * g;
    out[1][i] = target[1][i] * g;
  }
  return out;
}
log("ducking…");
const ducked = sidechain(music, voice);
writeWav("music/aether_music_con_ducking.wav", ducked, SR);

// ---- 7. Mezclas ---------------------------------------------------------------
// Prioridad: voz > (expositor en vivo) > música > efectos.
const VOICE_G = 10 ** (6 / 20); // voz real: pico -8.1 dBFS, RMS activo -25 → +6 dB
const SFX_G = 10 ** (-2 / 20);
const mix = (withVoice) => {
  const m = [new Float32Array(ducked[0].length), new Float32Array(ducked[0].length)];
  addInto(m, ducked);
  addInto(m, sfx, 0, SFX_G);
  if (withVoice) addInto(m, voice, 0, VOICE_G);
  const p = peak(m);
  const g = p > 0.89 ? 0.89 / p : 1; // techo -1 dBFS
  for (const ch of m) for (let i = 0; i < ch.length; i++) ch[i] *= g;
  return m;
};
writeWav("audio/mix_escenario.wav", mix(false), SR);
writeWav("audio/mix_ensayo.wav", mix(true), SR);
log("listo");
