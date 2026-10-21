// Genera timeline.json (fuente de verdad del video) desde phase0/lumina_timing.json.
// Tiempos de Lumina = medianas por frase del perfil "none". Lo que no depende de
// Lumina (expositor, clicker, tarjeta final) va marcado source:"diseño".
// Uso: node scripts/build-timeline.mjs
import fs from "node:fs";

const T = JSON.parse(fs.readFileSync("phase0/lumina_timing.json", "utf8"));
const P = T.profiles.none;
const L = P.per_line;
const med = (s) => s.median;

const ACTS = [
  { id: "despertar", energy: [0.1, 0.2] },
  { id: "observacion", energy: [0.2, 0.35] },
  { id: "problema", energy: [0.35, 0.25] },
  { id: "solucion", energy: [0.25, 0.45] },
  { id: "revelacion", energy: [0.45, 0.55] },
  { id: "arquitectura", energy: [0.55, 0.7] },
  { id: "integracion", energy: [0.7, 0.85] },
  { id: "pregunta", energy: [0.85, 0.15] },
  { id: "expositor", energy: [0.1, 0.15] },
  { id: "interaccion", energy: [0.15, 0.3] },
  { id: "demo", energy: [0.3, 0.5] },
  { id: "evolucion", energy: [0.5, 0.75] },
  { id: "cierre", energy: [0.75, 0] },
];
const actOfLine = (i) =>
  i < 4 ? "despertar" : i < 9 ? "observacion" : i < 14 ? "problema" : i < 20 ? "solucion" : i < 21 ? "revelacion" : i < 26 ? "arquitectura" : i < 29 ? "integracion" : i < 30 ? "pregunta" : "interaccion";

// Fin de la palabra clave dentro de la frase (pausa de la coma, silencedetect
// sobre los mp3 reales de phase0/raw/none/run-03-mp3, 1 muestra): el módulo
// encaja cuando se nombra el sistema, no al inicio de la frase.
const KEY_WORD_END_MS = { 22: 1411, 23: 1445, 24: 1491, 25: 1271 };

const cues = [];
const add = (c) => (cues.push(c), c);
const MEASURED = "medido: mediana por frase, perfil sin límite (phase0/lumina_timing.json)";

let t = 2000;
add({ id: "wake", act: "despertar", trigger: { type: "lumina", event: "wake" }, atMs: t, source: "diseño: 2 s de negro antes del encendido" });
t += 4000;
add({ id: "start", act: "despertar", trigger: { type: "lumina", event: "script-start" }, atMs: t, source: "diseño: el expositor dice «Iniciar presentación» (tiempo humano, no medible)" });

let prevEnd = null;
for (let i = 1; i <= 32; i++) {
  const line = L[i - 1];
  let at;
  if (i === 1) at = t + med(line.latency_ms);
  else if (i === 30) {
    const heard = cues.find((c) => c.id === "heard");
    at = heard.atMs + med(line.latency_ms);
  } else at = prevEnd + med(line.gap_before_ms);
  const c = add({
    id: `L${String(i).padStart(2, "0")}`,
    act: actOfLine(i),
    trigger: { type: "lumina", event: "line-start", i },
    text: line.text,
    atMs: Math.round(at),
    durMs: med(line.dur_ms),
    ...(KEY_WORD_END_MS[i] ? { keyWordEndMs: KEY_WORD_END_MS[i] } : {}),
    source: MEASURED,
  });
  prevEnd = c.atMs + c.durMs;
  if (i === 29) {
    add({ id: "await", act: "expositor", trigger: { type: "lumina", event: "await-lumina" }, atMs: prevEnd, source: "medido: robot.js emite await-lumina al terminar la frase 29" });
    add({ id: "heard", act: "interaccion", trigger: { type: "lumina", event: "heard-lumina" }, atMs: prevEnd + 58000, source: "diseño: bloque del expositor ~58 s (brief); en vivo lo decide el expositor" });
  }
}
const camera = add({ id: "camera", act: "demo", trigger: { type: "lumina", event: "camera-on" }, atMs: prevEnd, source: "medido: robot.js activa la cámara al terminar la frase 32" });

// Expositor en vivo → clicker. Separaciones solo para el MP4 de referencia.
const CLICKS = [
  ["C1", "evolucion", "But we don't want it to end there.", 30000, "diseño: 30 s de demo (pausa de robot.js tras la frase 32)"],
  ["SEE", "evolucion", "We want it to see,", 3200],
  ["UNDERSTAND", "evolucion", "understand,", 800],
  ["DECIDE", "evolucion", "and decide.", 900],
  ["C3", "cierre", "Because the future of automation is not to do more.", 3000],
  ["C4", "cierre", "It is to learn to do it better.", 3600],
  ["C5", "cierre", "This is Aether.", 3200],
];
let at = camera.atMs, n = 0;
for (const [id, act, text, dt, source] of CLICKS) {
  at += dt;
  add({ id, act, trigger: { type: "clicker", n: ++n }, text, atMs: at, speaker: "expositor", source: source || "diseño: lo dispara el clicker del expositor" });
}
const c5 = at;
add({ id: "silence", act: "cierre", trigger: { type: "after", cue: "C5", ms: 2400 }, atMs: c5 + 2400, source: "diseño: clímax final 2.4 s tras «This is Aether.»" });
add({ id: "card", act: "cierre", trigger: { type: "after", cue: "C5", ms: 3200 }, atMs: c5 + 3200, source: "diseño: 0.8 s de silencio, luego tarjeta" });
const end = add({ id: "end", act: "cierre", trigger: { type: "after", cue: "C5", ms: 9700 }, atMs: c5 + 9700, source: "diseño: tarjeta 5 s + fundido a negro 1.5 s" });

// Actos: empiezan en su primer cue.
const acts = ACTS.map((a) => ({ ...a, startCue: cues.find((c) => c.act === a.id).id }));

const lat = P.pooled.latency_req_to_audio_ms;
// Pausa que robot.js espera entre el fin de la frase i y el pedido de la
// i+1 (pausa de la línea + pausas de las líneas del expositor intermedias).
// Frase 29: 0 — ahora robot.js espera a oír "Lumina" (no un temporizador).
const guion = JSON.parse(fs.readFileSync("../lumina_audio/guion.json", "utf8"));
const pausesMs = [];
{
  let acc = null;
  for (const g of guion) {
    if (g.speaker === "aether") {
      if (acc != null) pausesMs.push(acc);
      acc = Math.round((g.pause || 0) * 1000);
    } else if (g.speaker === "expositor" && acc != null) acc += Math.round((g.pause || 0) * 1000);
  }
  pausesMs.push(acc);
  pausesMs[28] = 0;
}

const timeline = {
  version: 1,
  fps: 30,
  width: 1920,
  height: 1080,
  maxDurationMs: 330000,
  durationMs: end.atMs,
  measured: {
    from: "phase0/lumina_timing.json",
    profile: "none",
    runs: P.runs,
    note: "Tiempos de frases = mediana por frase (no mediana de la suma). En vivo, cada cue se dispara con el evento real; estos tiempos solo calibran el MP4 y el modo de ensayo.",
  },
  sync: {
    voiceOnsetAfterPlayingMs: T.voice_onset_in_mp3.lead_silence_ms.median,
    relayMs: { median: T.show_channel_relay.sent_to_received_ms.median, p95: T.show_channel_relay.sent_to_received_ms.p95 },
    latencyMs: { median: lat.median, p95: lat.p95, max: lat.max },
    watchdog: {
      withoutRequestMs: `pausa del guion + ${lat.p95 + 1500}`,
      afterRequestMs: lat.max + 1500,
      note: "Sin line-request (enlace caído): pausa + p95 medido + 1.5 s. Con line-request (Lumina viva, audio en camino): latencia máxima medida + 1.5 s. Ambos se estiran 1.5× la mayor latencia reciente. Si vence, el video avanza con la duración mediana y lo registra.",
    },
    targetMs: { median: 250, p95: 500 },
  },
  pausesMs,
  acts,
  cues,
};
fs.writeFileSync("timeline.json", JSON.stringify(timeline, null, 1));
console.log(`duración ${(end.atMs / 1000).toFixed(1)} s (${Math.floor(end.atMs / 60000)}:${String(Math.round((end.atMs % 60000) / 1000)).padStart(2, "0")}), ${cues.length} cues`);
for (const a of acts) console.log(a.id.padEnd(13), (cues.find((c) => c.id === a.startCue).atMs / 1000).toFixed(1));
