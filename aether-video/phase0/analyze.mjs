// Fase 0.4/0.7 — agrega phase0/raw/<perfil>/run-*.json en phase0/lumina_timing.json
// y phase0/REPORT.md. Uso: node phase0/analyze.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const RAW = path.resolve("phase0/raw");
const FFMPEG = path.resolve("node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe");
const FFPROBE = path.resolve("node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe");
const guion = JSON.parse(fs.readFileSync("../lumina_audio/guion.json", "utf8"));
const LINES = guion.filter((g) => g.speaker === "aether");

// Percentil con interpolación lineal (tipo 7). Con n pequeño, p95 ≈ máximo.
const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const h = (s.length - 1) * p;
  return s[Math.floor(h)] + (s[Math.ceil(h)] - s[Math.floor(h)]) * (h - Math.floor(h));
};
const stats = (xs) => {
  xs = xs.filter((x) => x != null && Number.isFinite(x));
  if (!xs.length) return null;
  const r = (x) => Math.round(x);
  return { n: xs.length, min: r(Math.min(...xs)), median: r(pct(xs, 0.5)), p95: r(pct(xs, 0.95)), max: r(Math.max(...xs)) };
};

const ffDuration = (f) => Number(execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString()) * 1000;
// Silencio inicial/final: dónde empieza y termina la voz dentro del mp3 real.
const silencedetectLog = (f) =>
  spawnSync(FFMPEG, ["-hide_banner", "-i", f, "-af", "silencedetect=n=-40dB:d=0.05", "-f", "null", "-"]).stderr.toString();
function silenceEdges(f) {
  const r = silencedetectLog(f);
  const starts = [...r.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]) * 1000);
  const ends = [...r.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]) * 1000);
  const dur = ffDuration(f);
  const lead = starts.length && starts[0] < 1 ? ends[0] : 0; // silencio desde 0
  const lastStart = starts.length ? starts[starts.length - 1] : null;
  const trail = lastStart != null && (ends.length < starts.length || ends[ends.length - 1] >= dur - 5) ? dur - lastStart : 0;
  return { dur, lead, trail };
}

function parseRun(file) {
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  const ev = r.events;
  const click = ev.find((e) => e.type === "click");
  const lines = LINES.map((L, i) => {
    const mine = ev.filter((e) => e.text === L.text);
    const req = mine.find((e) => e.type === "tts_req" || e.type === "synth_req");
    const playing = mine.filter((e) => e.type === "audio_playing");
    const start = playing[0] || mine.find((e) => e.type === "synth_start");
    const end = mine.find((e) => e.type === "audio_ended" || e.type === "synth_end");
    const synth = mine.find((e) => e.type === "synth_req");
    const body = mine.find((e) => e.type === "tts_body");
    const resp = mine.find((e) => e.type === "tts_resp");
    return {
      i: i + 1,
      text: L.text,
      pause_scripted_ms: Math.round((L.pause || 0) * 1000),
      engine: synth ? `speechSynthesis · ${synth.voice}` : "ElevenLabs (/robot/tts)",
      req: req?.t,
      resp_ms: resp && req ? resp.t - req.t : null,
      body_ms: body && req ? body.t - req.t : null,
      latency_ms: start && req ? start.t - req.t : null,
      start: start?.t,
      end: end?.t,
      dur_ms: start && end ? end.t - start.t : null,
      rebuffer_events: Math.max(0, playing.length - 1),
      bytes: body?.bytes ?? null,
    };
  });
  lines.forEach((l, k) => {
    const prev = lines[k - 1];
    // Antes de "Dígame, señor." (frase 30) el hueco no es una pausa de Lumina:
    // era un temporizador de 70.3 s (flujo viejo) y ahora es la espera de "Lumina".
    if (l.i === 30) {
      l.gap_ms = null;
      l.gap_minus_pause_ms = null;
      return;
    }
    l.gap_ms = prev && prev.end != null && l.start != null ? l.start - prev.end : null;
    l.gap_minus_pause_ms = l.gap_ms != null ? l.gap_ms - prev.pause_scripted_ms : null;
  });
  const first = lines[0], last = lines[lines.length - 1];
  const dispatched = ev.find((e) => e.type === "lumina_dispatched");
  return {
    file: path.relative(RAW, file),
    run: r.run,
    cold: r.cold,
    status: r.status,
    wallStart: r.wallStart,
    chromeVersion: r.chromeVersion,
    conditions: r.conditions,
    userAgent: r.meta.userAgent,
    click_to_first_audio_ms: click && first.start ? first.start - click.t : null,
    script_start_to_first_audio_ms: first.latency_ms,
    total_click_to_last_end_ms: click && last.end ? last.end - click.t : null,
    total_first_start_to_last_end_ms: first.start && last.end ? last.end - first.start : null,
    flow: dispatched ? "espera Lumina (robot.js nuevo)" : "temporizador 70.3 s (robot.js original)",
    lumina_dispatch_to_line30_start_ms: dispatched && lines[29].start ? lines[29].start - dispatched.t : null,
    first_start_to_line29_end_ms: first.start && lines[28].end ? lines[28].end - first.start : null,
    line30_start_to_last_end_ms: lines[29].start && last.end ? last.end - lines[29].start : null,
    lines,
  };
}

const profiles = {};
for (const prof of fs.readdirSync(RAW)) {
  const dir = path.join(RAW, prof);
  if (!fs.statSync(dir).isDirectory()) continue;
  const files = fs.readdirSync(dir).filter((f) => /^(run|pilot)-\d+\.json$/.test(f)).sort();
  if (!files.length) continue;
  const runs = files.map((f) => parseRun(path.join(dir, f)));
  const all = runs.flatMap((r) => r.lines);
  const perLine = LINES.map((L, i) => {
    const ls = runs.map((r) => r.lines[i]);
    return {
      i: i + 1,
      text: L.text,
      pause_scripted_ms: Math.round((L.pause || 0) * 1000),
      latency_ms: stats(ls.map((l) => l.latency_ms)),
      dur_ms: stats(ls.map((l) => l.dur_ms)),
      gap_before_ms: stats(ls.map((l) => l.gap_ms)),
    };
  });
  profiles[prof] = {
    runs: runs.length,
    engine: [...new Set(all.map((l) => l.engine))],
    conditions: runs[0].conditions,
    command_to_first_audio: {
      script_start_to_first_audio_ms: stats(runs.map((r) => r.script_start_to_first_audio_ms)),
      hidden_button_click_to_first_audio_ms: stats(runs.map((r) => r.click_to_first_audio_ms)),
    },
    pooled: {
      latency_req_to_audio_ms: stats(all.map((l) => l.latency_ms)),
      tts_response_headers_ms: stats(all.map((l) => l.resp_ms)),
      gap_minus_scripted_pause_ms: stats(all.map((l) => l.gap_minus_pause_ms)),
      rebuffer_events_total: all.reduce((s, l) => s + l.rebuffer_events, 0),
    },
    total: {
      note: "click_to_last / first_audio_to_last incluyen el bloque del expositor (temporizador de 70.3 s en el flujo viejo) — para el video usar los dos tramos separados.",
      click_to_last_line_end_ms: stats(runs.map((r) => r.total_click_to_last_end_ms)),
      first_audio_to_last_line_end_ms: stats(runs.map((r) => r.total_first_start_to_last_end_ms)),
      first_audio_to_question_end_ms: stats(runs.map((r) => r.first_start_to_line29_end_ms)),
      line30_start_to_last_end_ms: stats(runs.map((r) => r.line30_start_to_last_end_ms)),
    },
    interaction: {
      lumina_dispatch_to_digame_audio_ms: stats(runs.map((r) => r.lumina_dispatch_to_line30_start_ms)),
      note: "Desde que robot.js despacha «lumina» (después del debounce de 600 ms del reconocimiento) hasta que suena «Dígame, señor.». Falta sumar la latencia del reconocimiento (phase0/recognition-test.html).",
    },
    per_line: perLine,
    raw_runs: runs.map(({ lines, ...rest }) => rest),
  };
}

// 0.7 + inicio real de la voz: mp3 capturados de /robot/tts (perfil none) vs. lumina_audio/lineas.
const captured = [];
for (const d of fs.readdirSync(path.join(RAW, "none")).filter((f) => f.endsWith("-mp3"))) {
  const dir = path.join(RAW, "none", d);
  for (const f of fs.readdirSync(dir).sort()) captured.push({ run: d, idx: Number(f.slice(0, 2)), ...silenceEdges(path.join(dir, f)) });
}
const refDir = "../lumina_audio/lineas";
const reference = LINES.map((L, i) => {
  const f = path.join(refDir, `${String(i + 1).padStart(2, "0")}.mp3`);
  const s = silenceEdges(f);
  return { i: i + 1, ref_file_ms: Math.round(s.dur), ref_speech_ms: Math.round(s.dur - s.lead - s.trail) };
});
const liveFmt = captured.length
  ? execFileSync(FFPROBE, ["-v", "error", "-show_entries", "stream=codec_name,sample_rate,channels,bit_rate", "-of", "compact", path.join(RAW, "none", fs.readdirSync(path.join(RAW, "none")).find((f) => f.endsWith("-mp3")), "01.mp3")]).toString().trim()
  : null;
const refFmt = execFileSync(FFPROBE, ["-v", "error", "-show_entries", "stream=codec_name,sample_rate,channels,bit_rate", "-of", "compact", path.join(refDir, "01.mp3")]).toString().trim();
const byIdx = (i) => captured.filter((c) => c.idx === i);
const comparison = reference.map((r) => {
  const live = byIdx(r.i);
  return {
    ...r,
    live_speech_ms: stats(live.map((c) => c.dur - c.lead - c.trail)),
    live_file_ms: stats(live.map((c) => c.dur)),
  };
});
const refTotal = ffDuration("../lumina_audio/Lumina_guion_con_pausas.mp3");

const wsFile = path.join(RAW, "ws-events-run03.jsonl");
const wsEvents = fs.existsSync(wsFile) ? fs.readFileSync(wsFile, "utf8").trim().split(/\r?\n/).map((l) => JSON.parse(l)) : [];
const out = {
  generated: new Date().toISOString(),
  what: "Tiempos reales de Lumina (dashboard/robot.js) medidos en el navegador con performance.now(). Ver phase0/REPORT.md.",
  how_voice_is_generated:
    "speak(text) → POST /robot/tts (backend/main.py) → ElevenLabs text-to-speech (eleven_multilingual_v2, sin streaming, sin caché) → blob mp3 → new Audio(url).play(). Si el fetch o play() fallan → speechSynthesis del navegador (voz elegida por pickBestSpanishVoice). Cada frase se pide DESPUÉS de que termina la anterior + su pausa (sin prefetch). NO reproduce Lumina_guion_con_pausas.mp3.",
  events_exposed_by_robot_js: "Ninguno hacia afuera (sin CustomEvent/BroadcastChannel/WebSocket). Internos: audio.onplaying/onended (ElevenLabs), utterance.onstart/onend/onboundary (respaldo), console.log de cada transcripción y del guion.",
  measured_where: {
    machine: process.env.MEASURE_MACHINE || null,
    os: process.env.MEASURE_OS || null,
    browser: Object.values(profiles)[0]?.raw_runs[0]?.userAgent,
    chrome_version: Object.values(profiles)[0]?.raw_runs[0]?.chromeVersion,
    mode: "Chrome real (no Chromium) vía playwright-core, headless, --mute-audio; backend local 127.0.0.1:8000; la limitación de red de DevTools solo afecta el tramo navegador↔backend, NO el tramo backend↔ElevenLabs (internet real de esta máquina).",
    internet: process.env.MEASURE_NET || null,
    stage_hardware_measured: false,
  },
  percentiles: "Interpolación lineal (tipo 7). n pequeño → p95 ≈ máximo; los 'pooled' juntan todas las frases de todas las corridas del perfil.",
  profiles,
  show_channel_relay: {
    note: "robot.js → WebSocket → backend /show/ws → otro cliente, misma máquina (sin desfase de reloj). En el escenario suma la red local entre equipos.",
    sent_to_received_ms: stats(wsEvents.map((e) => e.receivedAt - e.sentAt)),
    events: wsEvents.length,
  },
  voice_onset_in_mp3: {
    note: "Silencio al inicio del mp3 real de ElevenLabs = retraso entre el evento 'playing' y la primera sílaba.",
    lead_silence_ms: stats(captured.map((c) => c.lead)),
    trail_silence_ms: stats(captured.map((c) => c.trail)),
  },
  reference_vs_live: {
    reference_file: "lumina_audio/Lumina_guion_con_pausas.mp3",
    reference_total_ms: Math.round(refTotal),
    reference_format: refFmt,
    live_format: liveFmt,
    per_line: comparison,
  },
};
fs.writeFileSync("phase0/lumina_timing.json", JSON.stringify(out, null, 1));

// ---------- REPORT.md ----------
const f = (s) => (s ? `${s.min} / ${s.median} / ${s.p95} / ${s.max}` : "—");
let md = `# Fase 0 — tiempos reales de Lumina\n\nGenerado ${out.generated}. Formato de cada celda: **mín / mediana / p95 / máx** en ms (n = muestras).\n\n`;
md += fs.readFileSync("phase0/report-intro.md", "utf8").replace("{{DONDE}}", Object.entries(out.measured_where).map(([k, v]) => `- **${k}**: ${v}`).join("\n"));
md += `## Resumen por perfil de red\n\n| perfil | corridas | motor de voz | inicio guion → 1er audio | latencia por frase (pedido→audio, todas) | hueco real − pausa diseñada | total 1er audio → fin última frase | re-buffer |\n|---|---|---|---|---|---|---|---|\n`;
for (const [p, v] of Object.entries(profiles)) {
  md += `| ${p} | ${v.runs} | ${v.engine.join("; ")} | ${f(v.command_to_first_audio.script_start_to_first_audio_ms)} | ${f(v.pooled.latency_req_to_audio_ms)} (n=${v.pooled.latency_req_to_audio_ms?.n}) | ${f(v.pooled.gap_minus_scripted_pause_ms)} | ${f(v.total.first_audio_to_last_line_end_ms)} | ${v.pooled.rebuffer_events_total} |\n`;
}
const base = profiles.none;
md += `\n## Por frase — perfil sin límite (${base.runs} corridas)\n\n| # | frase | pausa diseñada | hueco real antes (mediana) | duración (mín/med/máx) | latencia (med) |\n|---|---|---|---|---|---|\n`;
for (const l of base.per_line) {
  md += `| ${l.i} | ${l.text} | ${l.pause_scripted_ms} | ${l.gap_before_ms?.median ?? "—"} | ${l.dur_ms ? `${l.dur_ms.min} / ${l.dur_ms.median} / ${l.dur_ms.max}` : "—"} | ${l.latency_ms?.median ?? "—"} |\n`;
}
md += `\n## 0.7 — referencia vs. voz real\n\n**Difieren: Lumina no reproduce el mp3 de referencia; genera cada frase con ElevenLabs en el momento** (cada corrida produce audio distinto). El formato de la referencia (24 kHz / 48 kbps mono) coincide con el de Microsoft Edge TTS, pero su origen no está registrado en el repo. Referencia:${refFmt}, total ${Math.round(refTotal)} ms. Voz real capturada: ${liveFmt}.\n\n| # | frase | voz en referencia (ms) | voz real mediana (ms) | diferencia |\n|---|---|---|---|---|\n`;
for (const c of comparison) {
  const live = c.live_speech_ms?.median;
  md += `| ${c.i} | ${LINES[c.i - 1].text} | ${c.ref_speech_ms} | ${live ?? "—"} | ${live != null ? live - c.ref_speech_ms : "—"} |\n`;
}
fs.writeFileSync("phase0/REPORT.md", md);
console.log(md.split("\n").slice(0, 12).join("\n"));

// Muestras crudas para el simulador del reproductor (modo ensayo y pruebas de
// sincronía): latencias por perfil y duraciones por frase (la duración no
// depende de la red; se excluye offline porque es otra voz).
const samples = { profiles: {}, durByLine: {} };
for (const [p, v] of Object.entries(profiles)) {
  const runs = v.raw_runs.map((r) => parseRun(path.join(RAW, r.file)));
  samples.profiles[p] = { engine: v.engine, latencyMs: runs.flatMap((r) => r.lines.map((l) => l.latency_ms)).filter((x) => x != null).map(Math.round) };
  if (p === "offline") continue;
  for (const r of runs) for (const l of r.lines) if (l.dur_ms != null) (samples.durByLine[l.i] ||= []).push(Math.round(l.dur_ms));
}
fs.writeFileSync("player/samples.json", JSON.stringify(samples));
console.log(`samples: ${Object.keys(samples.profiles).join(", ")}`);
