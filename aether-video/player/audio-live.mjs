// Audio del reproductor en vivo: camas en bucle (cambian con crossfade al
// llegar el cue de su sección), golpes musicales y efectos por cue, fader por
// sección (misma tabla FADER que el MP4) y ducking con los eventos de voz.
//
// Honestidad sobre el ducking: la voz sale por OTRO equipo (el robot), así que
// aquí no hay señal de audio para un sidechain real; se atenúa con los eventos
// line-start/line-end, que marcan cuándo Lumina está hablando. El ducking por
// sidechain sobre la señal de voz es el del MP4 (scripts/music.mjs).
import { END_FADE, FADER } from "../audio/engine.js";

const DUCK_DB = -11;
const BED_IN = 1.2;
const BED_OUT = 1.6;
const db = (x) => 10 ** (x / 20);

export async function createLiveAudio({ base, sections, stingers, sfx, onProgress = (_fraction) => {} }) {
  const ctx = new AudioContext({ latencyHint: "interactive" });
  // música: gate (silencio/tarjeta) → fader de sección → ducking → volumen → master
  const master = ctx.createGain();
  master.connect(ctx.destination);
  const musicVol = ctx.createGain();
  const duck = ctx.createGain();
  const fader = ctx.createGain();
  const musicGate = ctx.createGain();
  musicGate.connect(fader).connect(duck).connect(musicVol).connect(master);
  fader.gain.value = db(FADER[0][1]);
  const sfxVol = ctx.createGain();
  const sfxGate = ctx.createGain();
  sfxGate.connect(sfxVol).connect(master);

  const buffers = {};
  const files = [
    ...[...new Set(sections.map(([, name]) => name).filter(Boolean))].map((n) => [`bed:${n}`, `${base}/music/live/bed_${n}.wav`]),
    ...stingers.map((id) => [`st:${id}`, `${base}/music/live/st_${id}.wav`]),
    ...sfx.map((id) => [`sfx:${id}`, `${base}/sfx/live/${id}.wav`]),
  ];
  let done = 0;
  await Promise.all(
    files.map(async ([key, url]) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`no se pudo cargar ${url}`);
      buffers[key] = await ctx.decodeAudioData(await res.arrayBuffer());
      onProgress(++done / files.length);
    }),
  );

  let bed = null;
  const play = (buf, dest, loop = false) => {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    const g = ctx.createGain();
    src.connect(g).connect(dest);
    src.start();
    return { src, g };
  };
  const sectionOf = Object.fromEntries(sections);
  const faderOf = {};
  for (const [id, d, ramp, delay = 0] of FADER) (faderOf[id] ||= []).push({ g: db(d), ramp, delay });
  const ramp = (param, to, seconds) => {
    const now = ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(to, now + seconds);
  };

  return {
    ctx,
    /** Lo que suena al dispararse un cue. */
    cue(id) {
      const now = ctx.currentTime;
      for (const p of faderOf[id] || []) {
        if (p.delay) setTimeout(() => ramp(fader.gain, p.g, p.ramp), p.delay * 1000);
        else ramp(fader.gain, p.g, p.ramp);
      }
      if (id in sectionOf) {
        if (bed) {
          ramp(bed.g.gain, 0, BED_OUT);
          bed.src.stop(now + BED_OUT + 0.05);
          bed = null;
        }
        const name = sectionOf[id];
        if (!name) {
          ramp(musicGate.gain, 0, 0.12); // silencio real antes de la tarjeta
          ramp(sfxGate.gain, 0, 0.12);
        } else {
          bed = play(buffers[`bed:${name}`], musicGate, true);
          bed.g.gain.setValueAtTime(0, now);
          bed.g.gain.linearRampToValueAtTime(1, now + BED_IN);
        }
      }
      if (id === END_FADE.cue) {
        ramp(musicGate.gain, 1, 0.01);
        master.gain.setValueAtTime(master.gain.value, now + END_FADE.after);
        master.gain.linearRampToValueAtTime(0, now + END_FADE.after + END_FADE.dur);
      }
      if (buffers[`st:${id}`]) play(buffers[`st:${id}`], musicGate);
      if (buffers[`sfx:${id}`]) play(buffers[`sfx:${id}`], sfxGate);
    },
    duckOn: () => duck.gain.setTargetAtTime(db(DUCK_DB), ctx.currentTime, 0.04),
    duckOff: () => duck.gain.setTargetAtTime(1, ctx.currentTime, 0.15),
    /** Volúmenes del operador (0..1.5), independientes de la automatización. */
    setVolumes({ music = 1, sfx: s = 1 }) {
      musicVol.gain.value = music;
      sfxVol.gain.value = s;
    },
  };
}
