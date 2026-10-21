// Verificación de niveles de audio (paso 7): voz vs. música en cada frase,
// clímax vs. inicio, silencio final real, loudness integrada de las mezclas.
// Uso: node scripts/levels.mjs → render/verificacion/niveles.json
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { FFMPEG, readWav } from "./wav.mjs";

const tl = JSON.parse(fs.readFileSync("timeline.json", "utf8"));
const T = Object.fromEntries(tl.cues.map((c) => [c.id, c]));
const SR = 48000;
const VOICE_G = 10 ** (6 / 20); // mismas ganancias que scripts/music.mjs
const SFX_G = 10 ** (-2 / 20);

const voice = readWav("audio/voz_lumina_medianas.wav").chans;
const music = readWav("music/aether_music_con_ducking.wav").chans;
const sfx = readWav("sfx/aether_sfx.wav").chans;

/** RMS en dBFS de una señal (suma de canales) en [a, b) segundos, escalada por g. */
function rms(x, a, b, g = 1) {
  const i0 = Math.max(0, Math.round(a * SR));
  const i1 = Math.min(x[0].length, Math.round(b * SR));
  let s = 0;
  for (let i = i0; i < i1; i++) {
    const v = ((x[0][i] + x[1][i]) / 2) * g;
    s += v * v;
  }
  return 10 * Math.log10(s / Math.max(1, i1 - i0) + 1e-12);
}
function peak(x, a, b) {
  let p = 0;
  for (let i = Math.round(a * SR); i < Math.min(x[0].length, Math.round(b * SR)); i++) p = Math.max(p, Math.abs(x[0][i]), Math.abs(x[1][i]));
  return 20 * Math.log10(p + 1e-12);
}
const s = (id) => T[id].atMs / 1000;
const e = (id) => (T[id].atMs + T[id].durMs) / 1000;

// Voz vs. música+efectos por frase.
const perLine = tl.cues
  .filter((c) => /^L\d\d$/.test(c.id))
  .map((c) => {
    const v = rms(voice, s(c.id), e(c.id), VOICE_G);
    const m = rms(music, s(c.id), e(c.id));
    const fx = rms(sfx, s(c.id), e(c.id), SFX_G);
    const bed = 10 * Math.log10(10 ** (m / 10) + 10 ** (fx / 10));
    return { id: c.id, text: c.text, voice_dBFS: +v.toFixed(1), music_sfx_dBFS: +bed.toFixed(1), voice_over_music_dB: +(v - bed).toFixed(1) };
  });
const diffs = perLine.map((l) => l.voice_over_music_dB).sort((a, b) => a - b);

const sections = {
  despertar: rms(music, s("wake"), s("L04")),
  expositor: rms(music, s("await") + 2, s("heard")),
  demo: rms(music, s("camera") + 2, s("C1")),
  climax1: rms(music, e("L28"), e("L28") + 2.4),
  climax_final: rms(music, s("C5") + 0.5, s("silence")),
};

// Loudness integrada (EBU R128 vía loudnorm de ffmpeg, solo medición).
function lufs(file) {
  const r = spawnSync(FFMPEG, ["-hide_banner", "-i", file, "-af", "loudnorm=print_format=json", "-f", "null", "-"]);
  const j = /\{[\s\S]*\}/.exec(r.stderr.toString());
  return j ? JSON.parse(j[0]) : null;
}
const mixes = {};
for (const f of ["audio/mix_escenario.wav", "audio/mix_ensayo.wav", "music/aether_music_sin_ducking.wav"]) {
  const j = lufs(f);
  mixes[f] = j && { integrated_LUFS: Number(j.input_i), true_peak_dBTP: Number(j.input_tp), LRA: Number(j.input_lra) };
}
const escenario = readWav("audio/mix_escenario.wav").chans;
const silence = { from_s: s("silence") + 0.15, to_s: s("card"), peak_dBFS: +peak(escenario, s("silence") + 0.15, s("card")).toFixed(1) };
const tail = { from_s: tl.durationMs / 1000 - 0.5, peak_dBFS: +peak(escenario, tl.durationMs / 1000 - 0.5, tl.durationMs / 1000).toFixed(1) };

const out = {
  note: "RMS en dBFS de la suma mono. Voz = mp3 reales de Lumina colocados en sus medianas (+6 dB en la mezcla). Música = con ducking por sidechain desde esa voz.",
  voice_over_music_dB: { min: diffs[0], median: diffs[Math.floor(diffs.length / 2)], max: diffs[diffs.length - 1] },
  per_line: perLine,
  music_rms_dBFS: Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, +v.toFixed(1)])),
  climax_vs_start_dB: { climax1: +(sections.climax1 - sections.despertar).toFixed(1), climax_final: +(sections.climax_final - sections.despertar).toFixed(1) },
  final_silence: silence,
  end_of_file: tail,
  mixes,
};
fs.mkdirSync("render/verificacion", { recursive: true });
fs.writeFileSync("render/verificacion/niveles.json", JSON.stringify(out, null, 1));
const { per_line, ...summary } = out;
console.log(JSON.stringify(summary, null, 1));
