// Motor de música y efectos de AETHER — Web Audio nativo (corre en el navegador,
// en OfflineAudioContext para renderizar o en AudioContext en vivo).
//
// La partitura se divide en:
//  - CAMAS por sección (bucleables): lo que suena mientras no pasa nada. En vivo
//    se cambian con crossfade cuando llega el cue que abre la sección.
//  - GOLPES musicales anclados a un cue (se disparan con el evento real).
//  - EFECTOS funcionales (SFX) anclados a un cue.
// El MP4 usa exactamente lo mismo, colocado en las medianas medidas.
//
// Motivo principal: La – Mi – Re (quinta que abre, paso que baja). Re menor.

export const BPM = 90;
export const BEAT = 60 / BPM;
export const BAR = 4 * BEAT;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
// Notas MIDI
const N = { D1: 26, A1: 33, D2: 38, E2: 40, F2: 41, G2: 43, A2: 45, Bb2: 46, C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, A3: 57, Bb3: 58, C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, Bb4: 70, C5: 72, D5: 74, E5: 76, F5: 77, A5: 81 };
export const MOTIF = [N.A3, N.E4, N.D4];

// PRNG determinista: el mismo render siempre suena igual.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- rig
const STEMS = ["pad", "bass", "pulse", "piano", "perc", "tex", "sfx"];

export function createRig(ctx, { stems = null, master = true, seed = 7, origin = 0 } = {}) {
  const sr = ctx.sampleRate;
  // Ventana de render: el tiempo absoluto t suena en t - origin del contexto.
  const until = origin + ctx.length / sr;
  WINDOW = [origin, until];
  const out = ctx.createGain();
  if (master) {
    // Pegamento suave + techo: nada de bombeo, solo contención de picos.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 2.5;
    comp.knee.value = 8;
    comp.attack.value = 0.02;
    comp.release.value = 0.3;
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -2;
    lim.ratio.value = 20;
    lim.knee.value = 0;
    lim.attack.value = 0.002;
    lim.release.value = 0.1;
    out.connect(comp).connect(lim).connect(ctx.destination);
  } else out.connect(ctx.destination);

  const R = rng(seed);
  const noise = ctx.createBuffer(2, sr * 2, sr);
  for (let c = 0; c < 2; c++) {
    const d = noise.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1;
  }
  const ir = (seconds, bright) => {
    const len = Math.floor(sr * seconds);
    const b = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const k = bright * (1 - 0.85 * t); // se oscurece con el tiempo
        lp += k * (R() * 2 - 1 - lp);
        d[i] = lp * Math.pow(1 - t, 2.2) * (i < sr * 0.012 ? i / (sr * 0.012) : 1);
      }
    }
    return b;
  };
  const verb = (seconds, bright, level) => {
    const cv = ctx.createConvolver();
    cv.buffer = ir(seconds, bright);
    const g = ctx.createGain();
    g.gain.value = level;
    cv.connect(g).connect(out);
    return cv;
  };
  const hall = verb(4.8, 0.32, 0.9);
  const room = verb(1.3, 0.5, 0.7);
  // Delay estéreo (corchea con puntillo) para pulsos y piano.
  const delayL = ctx.createDelay(2);
  const delayR = ctx.createDelay(2);
  delayL.delayTime.value = BEAT * 0.75;
  delayR.delayTime.value = BEAT * 1.5;
  const fb = ctx.createGain();
  fb.gain.value = 0.32;
  const dlp = ctx.createBiquadFilter();
  dlp.type = "lowpass";
  dlp.frequency.value = 2600;
  const delayIn = ctx.createGain();
  const merge = ctx.createChannelMerger(2);
  delayIn.connect(delayL);
  delayIn.connect(delayR);
  delayL.connect(dlp);
  dlp.connect(fb).connect(delayL);
  delayL.connect(merge, 0, 0);
  delayR.connect(merge, 0, 1);
  const dOut = ctx.createGain();
  dOut.gain.value = 0.35;
  merge.connect(dOut).connect(out);
  dOut.connect(hall);

  const buses = {};
  for (const name of STEMS) {
    const g = ctx.createGain();
    g.gain.value = stems && !stems.includes(name) ? 0 : 1;
    g.connect(out);
    const toHall = ctx.createGain();
    const toRoom = ctx.createGain();
    const toDelay = ctx.createGain();
    toHall.gain.value = g.gain.value;
    toRoom.gain.value = g.gain.value;
    toDelay.gain.value = g.gain.value;
    toHall.connect(hall);
    toRoom.connect(room);
    toDelay.connect(delayIn);
    buses[name] = { dry: g, hall: toHall, room: toRoom, delay: toDelay, on: g.gain.value > 0 };
  }
  return { ctx, sr, out, noise, buses, R, origin, until };
}

// Conecta una fuente a un bus con envíos.
function send(r, node, bus, { hall = 0, room = 0, delay = 0, pan = 0 } = {}) {
  const b = r.buses[bus];
  let src = node;
  if (pan) {
    const p = r.ctx.createStereoPanner();
    p.pan.value = pan;
    node.connect(p);
    src = p;
  }
  src.connect(b.dry);
  const tap = (amt, dest) => {
    if (!amt) return;
    const g = r.ctx.createGain();
    g.gain.value = amt;
    src.connect(g).connect(dest);
  };
  tap(hall, b.hall);
  tap(room, b.room);
  tap(delay, b.delay);
}
const active = (r, bus) => r.buses[bus].on;
/** Evento corto: tiempo en el contexto, o null si cae fuera de la ventana. */
const W = (r, t) => (t < r.origin || t > r.until ? null : t - r.origin);
// Desafinación determinista por nota (igual en todas las ventanas).
const jitter = (m, t0, k) => (((Math.sin(m * 12.9898 + t0 * 78.233 + k * 37.719) * 43758.5453) % 1) + 1) % 1 * 3 - 1.5;

function env(g, t0, t1, { a = 0.01, r = 0.3, peak = 1, curve = "lin" } = {}) {
  if (t0 < 0) {
    // Nota que empezó antes de la ventana: entra ya en su nivel.
    g.gain.setValueAtTime(Math.min(1, -t0 / a) * peak, 0);
    if (-t0 < a) g.gain.linearRampToValueAtTime(peak, t0 + a);
    g.gain.setValueAtTime(peak, Math.max(0, t0 + a, t1));
    g.gain.setTargetAtTime(0, Math.max(0, t0 + a, t1), r / 4);
    return;
  }
  g.gain.setValueAtTime(0, t0);
  if (curve === "exp") g.gain.setTargetAtTime(peak, t0, a / 3);
  else g.gain.linearRampToValueAtTime(peak, t0 + a);
  g.gain.setValueAtTime(peak, Math.max(t0 + a, t1));
  g.gain.setTargetAtTime(0, Math.max(t0 + a, t1), r / 4);
}

// ---------------------------------------------------------------- instrumentos
/** Pad analógico: 3 sierras desafinadas por nota → pasa-bajos que se abre. */
export function pad(r, notes, t0, t1, { gain = 0.05, cut = 600, cutEnd = cut, a = 3, rel = 4, q = 0.7, hall = 0.45, spread = 0.6 } = {}) {
  if (!active(r, "pad")) return;
  if (t1 + rel * 1.5 < r.origin || t0 > r.until) return;
  const { ctx } = r;
  const c0 = t0 - r.origin;
  const c1 = t1 - r.origin;
  const cutAt = (c) => cut + (cutEnd - cut) * Math.min(1, Math.max(0, (c - c0) / Math.max(1e-6, c1 - c0)));
  notes.forEach((m, i) => {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.Q.value = q;
    f.frequency.setValueAtTime(cutAt(Math.max(0, c0)), Math.max(0, c0));
    if (c1 > 0) f.frequency.linearRampToValueAtTime(cutEnd, c1);
    const g = ctx.createGain();
    env(g, c0, c1, { a, r: rel, peak: gain / Math.sqrt(notes.length) });
    [-9, 0, 8].forEach((det, k) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = hz(m);
      o.detune.value = det + jitter(m, t0, k);
      o.connect(f);
      o.start(Math.max(0, c0));
      o.stop(Math.max(0, c1 + rel * 1.5));
    });
    f.connect(g);
    send(r, g, "pad", { hall, pan: (i / Math.max(1, notes.length - 1) - 0.5) * spread });
  });
}

/** Bajo suave: seno + triángulo una octava arriba, filtrado. */
export function bass(r, m, t, dur, { gain = 0.16, cut = 220 } = {}) {
  if (!active(r, "bass")) return;
  t = W(r, t);
  if (t == null) return;
  const { ctx } = r;
  const g = ctx.createGain();
  env(g, t, t + dur, { a: 0.015, r: 0.25, peak: gain });
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = cut;
  for (const [type, mul, lvl] of [
    ["sine", 1, 1],
    ["triangle", 2, 0.25],
  ]) {
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    og.gain.value = lvl;
    o.type = type;
    o.frequency.value = hz(m) * mul;
    o.connect(og).connect(f);
    o.start(t);
    o.stop(t + dur + 0.5);
  }
  f.connect(g);
  send(r, g, "bass", { room: 0.05 });
}

/** Pulso analógico: sierra con envolvente de filtro (el "latido" de máquina). */
export function pluck(r, m, t, { gain = 0.05, cut = 2200, decay = 0.14, dur = 0.2, delay = 0.25, hall = 0.15, pan = 0, type = "sawtooth" } = {}) {
  if (!active(r, "pulse")) return;
  t = W(r, t);
  if (t == null) return;
  const { ctx } = r;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = hz(m);
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = 2.2;
  f.frequency.setValueAtTime(cut, t);
  f.frequency.exponentialRampToValueAtTime(180, t + decay * 2.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.004);
  g.gain.setTargetAtTime(0, t + 0.004, dur / 3);
  o.connect(f).connect(g);
  o.start(t);
  o.stop(t + dur * 3);
  send(r, g, "pulse", { delay, hall, pan });
}

/** Piano procesado: parciales inarmónicos + martillo, oscurecido y lejano. */
export function piano(r, m, t, { vel = 0.5, dur = 5, hall = 0.55, delay = 0.18, pan = 0, cut = 3800 } = {}) {
  if (!active(r, "piano")) return;
  t = W(r, t);
  if (t == null) return;
  const { ctx } = r;
  const f0 = hz(m);
  const B = 0.00035;
  const sum = ctx.createGain();
  for (let n = 1; n <= 8; n++) {
    const f = n * f0 * Math.sqrt(1 + B * n * n);
    if (f > 9000) break;
    const o = ctx.createOscillator();
    o.frequency.value = f;
    const g = ctx.createGain();
    const amp = (vel * 0.09) / Math.pow(n, 1.15);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.003);
    g.gain.setTargetAtTime(0, t + 0.003, dur / (2.2 + n * 0.9));
    o.connect(g).connect(sum);
    o.start(t);
    o.stop(t + dur * 1.5);
  }
  // martillo
  const h = ctx.createBufferSource();
  h.buffer = r.noise;
  const hb = ctx.createBiquadFilter();
  hb.type = "bandpass";
  hb.frequency.value = 2400;
  hb.Q.value = 1.2;
  const hg = ctx.createGain();
  hg.gain.setValueAtTime(vel * 0.03, t);
  hg.gain.setTargetAtTime(0, t, 0.006);
  h.connect(hb).connect(hg).connect(sum);
  h.start(t, r.R());
  h.stop(t + 0.08);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = cut;
  sum.connect(lp);
  send(r, lp, "piano", { hall, delay, pan });
}

/** Campana de vidrio (parciales de campana), para acentos del motivo. */
export function bell(r, m, t, { gain = 0.04, dur = 4, hall = 0.6, pan = 0 } = {}) {
  if (!active(r, "piano")) return;
  t = W(r, t);
  if (t == null) return;
  const { ctx } = r;
  const sum = ctx.createGain();
  [
    [1, 1, 1],
    [2.0, 0.35, 0.6],
    [2.76, 0.28, 0.45],
    [4.07, 0.12, 0.3],
    [5.4, 0.08, 0.2],
  ].forEach(([ratio, amp, dk]) => {
    const o = ctx.createOscillator();
    o.frequency.value = hz(m) * ratio;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain * amp, t + 0.002);
    g.gain.setTargetAtTime(0, t + 0.002, (dur * dk) / 3);
    o.connect(g).connect(sum);
    o.start(t);
    o.stop(t + dur * 1.3);
  });
  send(r, sum, "piano", { hall, pan });
}

/** Sub: seno grave con entrada lenta (presencia). */
export function sub(r, m, t0, t1, { gain = 0.12, a = 1.5, rel = 2 } = {}) {
  if (!active(r, "bass")) return;
  if (t1 + rel * 1.5 < r.origin || t0 > r.until) return;
  const { ctx } = r;
  const c0 = t0 - r.origin;
  const c1 = t1 - r.origin;
  const o = ctx.createOscillator();
  o.frequency.value = hz(m);
  const g = ctx.createGain();
  env(g, c0, c1, { a, r: rel, peak: gain });
  o.connect(g);
  o.start(Math.max(0, c0));
  o.stop(Math.max(0, c1 + rel * 1.5));
  send(r, g, "bass", {});
}

export function kick(r, t, gain = 0.25) {
  if (!active(r, "perc")) return;
  t = W(r, t);
  if (t == null) return;
  const { ctx } = r;
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(115, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.003);
  g.gain.setTargetAtTime(0, t + 0.003, 0.09);
  o.connect(g);
  o.start(t);
  o.stop(t + 0.6);
  send(r, g, "perc", { room: 0.1 });
}

/** Tic metálico corto (hi-hat mecánico, reloj, relé). */
export function tick(r, t, { gain = 0.03, freq = 7000, q = 1.5, dur = 0.012, bus = "perc", pan = 0, room = 0.15 } = {}) {
  if (!active(r, bus)) return;
  t = W(r, t);
  if (t == null) return;
  const { ctx } = r;
  const s = ctx.createBufferSource();
  s.buffer = r.noise;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.setTargetAtTime(0, t, dur / 2);
  s.connect(f).connect(g);
  s.start(t, r.R() * 1.5);
  s.stop(t + dur * 8);
  send(r, g, bus, { room, pan });
}

/** Golpe mecánico sordo (inserción, cierre de mira). */
export function thunk(r, t, { gain = 0.18, freq = 95, bus = "sfx" } = {}) {
  if (!active(r, bus)) return;
  t = W(r, t);
  if (t == null) return;
  const { ctx } = r;
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.09);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.002);
  g.gain.setTargetAtTime(0, t + 0.002, 0.04);
  o.connect(g);
  o.start(t);
  o.stop(t + 0.4);
  send(r, g, bus, { room: 0.2 });
  tick(r, t, { gain: gain * 0.35, freq: 3200, q: 3, dur: 0.006, bus });
}

/** Ráfaga de aire filtrada (línea de luz, apertura, transmisión). */
export function whoosh(r, t, dur, { gain = 0.05, from = 300, to = 3500, q = 2.5, bus = "sfx", hall = 0.3, pan = 0 } = {}) {
  if (!active(r, bus)) return;
  t = W(r, t);
  if (t == null) return;
  const { ctx } = r;
  const s = ctx.createBufferSource();
  s.buffer = r.noise;
  s.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.7);
  g.gain.linearRampToValueAtTime(0, t + dur);
  s.connect(f).connect(g);
  s.start(t, r.R());
  s.stop(t + dur + 0.05);
  send(r, g, bus, { hall, pan });
}

/** Textura digital: granos de ruido filtrado. Con `period`, el patrón se
 * repite exacto cada periodo (camas bucleables sin costura). */
export function grains(r, t0, t1, { gain = 0.012, density = 6, lo = 1800, hi = 6000, bus = "tex", period = 0 } = {}) {
  if (!active(r, bus)) return;
  const { ctx } = r;
  const span = period || t1 - t0;
  const G = rng(Math.floor(span * 1000) + Math.floor(lo));
  const pattern = Array.from({ length: Math.floor(span * density) }, () => ({ at: G() * span, f: lo + G() * (hi - lo), d: 0.03 + G() * 0.09, a: 0.4 + G(), off: G() * 1.5, pan: G() * 1.4 - 0.7 }));
  for (let base = t0; base < t1; base += span) {
    for (const p of pattern) {
      const abs = base + p.at;
      if (abs >= t1) continue;
      const t = W(r, abs);
      if (t == null) continue;
      const s = ctx.createBufferSource();
      s.buffer = r.noise;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = p.f;
      f.Q.value = 8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * p.a, t + p.d / 2);
      g.gain.linearRampToValueAtTime(0, t + p.d);
      s.connect(f).connect(g);
      s.start(t, p.off);
      s.stop(t + p.d + 0.02);
      send(r, g, bus, { hall: 0.3, pan: p.pan });
    }
  }
}

// ---------------------------------------------------------------- camas
// Cada cama es bucleable con periodo `loop` (compases) y energía de su acto.
// bed(r, t0, t1): llena [t0, t1) con material estable (sin depender de cues).
let WINDOW = [0, Infinity];
const every = (t0, t1, step, fn) => {
  const k0 = Math.max(0, Math.floor((WINDOW[0] - t0) / step) - 1);
  for (let k = k0; t0 + k * step < Math.min(t1, WINDOW[1]) - 1e-6; k++) fn(t0 + k * step, k);
};
const Dm = [N.D2, N.A2, N.D3, N.F3];

export const BEDS = {
  // 10–20 %: presencia sin revelar.
  despertar: { loop: 4, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A2, N.D3], t0, t1, { gain: 0.05, cut: 320, cutEnd: 520, a: 4 });
    sub(r, N.D2, t0, t1, { gain: 0.05, a: 3 });
  } },
  // 20–35 %: el visor se abre; pulso mecánico discreto.
  observacion: { loop: 4, bed: (r, t0, t1) => {
    pad(r, Dm, t0, t1, { gain: 0.055, cut: 650, cutEnd: 900, a: 2 });
    every(t0, t1, BEAT, (t, k) => bass(r, N.D2, t, BEAT * 0.8, { gain: k % 4 === 0 ? 0.1 : 0.06 }));
    every(t0, t1, BEAT / 2, (t, k) => tick(r, t, { gain: k % 2 ? 0.008 : 0.014, freq: 5200 }));
    grains(r, t0, t1, { gain: 0.006, density: 3, period: BAR * 4 });
  } },
  // 35 %: detectar — el pulso sigue, la armonía se tensa (sus2).
  problema: { loop: 4, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A2, N.D3, N.E3], t0, t1, { gain: 0.05, cut: 700, cutEnd: 640, a: 1.5 });
    every(t0, t1, BEAT, (t, k) => bass(r, N.D2, t, BEAT * 0.7, { gain: k % 4 === 0 ? 0.09 : 0.05 }));
    every(t0, t1, BEAT / 2, (t, k) => tick(r, t, { gain: k % 2 ? 0.007 : 0.012, freq: 5200 }));
  } },
  // 25 %: "detectar no significa saber qué es" — se vacía: solo un hilo.
  vacio: { loop: 4, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A4], t0, t1, { gain: 0.035, cut: 420, cutEnd: 380, a: 0.8, rel: 3 });
  } },
  // 25–45 %: el proceso — pulso firme, arpegio.
  proceso: { loop: 2, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A2, N.D3, N.F3, N.A3], t0, t1, { gain: 0.055, cut: 900, cutEnd: 1300, a: 1.2 });
    every(t0, t1, BAR, (t) => kick(r, t, 0.16));
    every(t0, t1, BEAT / 2, (t, k) => bass(r, N.D2, t, BEAT * 0.4, { gain: k % 2 ? 0.05 : 0.08 }));
    const arp = [N.D3, N.A3, N.D4, N.F4];
    every(t0, t1, BEAT / 2, (t, k) => pluck(r, arp[k % 4], t, { gain: 0.022, cut: 1600, pan: k % 2 ? 0.3 : -0.3 }));
  } },
  // 45–55 %: revelación — la armonía se abre (Fa mayor).
  revelacion: { loop: 2, bed: (r, t0, t1) => {
    pad(r, [N.F2, N.C3, N.F3, N.A3, N.C4], t0, t1, { gain: 0.06, cut: 1300, cutEnd: 2000, a: 0.8 });
    every(t0, t1, BEAT * 2, (t) => kick(r, t, 0.16));
    every(t0, t1, BEAT / 2, (t, k) => bass(r, N.F2, t, BEAT * 0.4, { gain: k % 2 ? 0.05 : 0.08 }));
    const arp = [N.F3, N.C4, N.F4, N.A4];
    every(t0, t1, BEAT / 2, (t, k) => pluck(r, arp[k % 4], t, { gain: 0.024, cut: 2000, pan: k % 2 ? 0.35 : -0.35 }));
  } },
  // 55–70 %: arquitectura — motor en semicorcheas; los acordes llegan con cada módulo (golpes).
  arquitectura: { loop: 2, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A2], t0, t1, { gain: 0.045, cut: 600, cutEnd: 800, a: 0.8 });
    every(t0, t1, BEAT * 2, (t) => kick(r, t, 0.18));
    every(t0, t1, BEAT / 2, (t, k) => bass(r, N.D2, t, BEAT * 0.4, { gain: k % 2 ? 0.05 : 0.09 }));
    const arp = [N.D3, N.A3, N.C4, N.D4, N.A3, N.E4, N.D4, N.A3];
    every(t0, t1, BEAT / 4, (t, k) => pluck(r, arp[k % 8], t, { gain: 0.018, cut: 1800, decay: 0.08, dur: 0.12, pan: (k % 4) / 3 - 0.5 }));
    every(t0, t1, BEAT / 2, (t, k) => tick(r, t, { gain: k % 2 ? 0.01 : 0.016, freq: 6500 }));
  } },
  // 70–85 %: integración — construye hacia el clímax (Si♭ → Do).
  integracion: { loop: 2, bed: (r, t0, t1) => {
    pad(r, [N.Bb2, N.F3, N.Bb3, N.D4], t0, t1, { gain: 0.065, cut: 900, cutEnd: 2200, a: 0.6 });
    every(t0, t1, BEAT, (t) => kick(r, t, 0.2));
    every(t0, t1, BEAT / 2, (t, k) => bass(r, N.Bb2 - 12, t, BEAT * 0.4, { gain: k % 2 ? 0.06 : 0.1 }));
    const arp = [N.Bb3, N.F4, N.D4, N.F4];
    every(t0, t1, BEAT / 4, (t, k) => pluck(r, arp[k % 4], t, { gain: 0.02, cut: 2400, decay: 0.08, dur: 0.12, pan: k % 2 ? 0.4 : -0.4 }));
    every(t0, t1, BEAT / 2, (t, k) => tick(r, t, { gain: k % 2 ? 0.012 : 0.02, freq: 7000 }));
  } },
  // 85→15 %: descenso — el filtro se cierra, queda el núcleo.
  descenso: { loop: 4, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A2, N.D3], t0, t1, { gain: 0.045, cut: 900, cutEnd: 300, a: 0.3, rel: 5 });
  } },
  // 10–15 %: bajo el expositor. Casi inmóvil; el motivo lejano cada 8 compases.
  expositor: { loop: 8, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A2], t0, t1, { gain: 0.032, cut: 380, cutEnd: 380, a: 2 });
    pad(r, [N.A3, N.E4], t0, t1, { gain: 0.012, cut: 700, cutEnd: 700, a: 3, hall: 0.8 });
    every(t0, t1, BAR * 8, (t) => MOTIF.forEach((m, i) => piano(r, m + 12, t + BAR * 2 + i * BEAT * 1.5, { vel: 0.12, hall: 0.9, cut: 2200 })));
  } },
  // 15–30 %: el núcleo responde y se prepara para ver.
  interaccion: { loop: 2, bed: (r, t0, t1) => {
    pad(r, [N.D3, N.A3, N.E4], t0, t1, { gain: 0.04, cut: 700, cutEnd: 1200, a: 1 });
    every(t0, t1, BEAT, (t, k) => pluck(r, [N.D3, N.A3][k % 2], t, { gain: 0.012, cut: 1200 }));
  } },
  // 30–50 %, 90 BPM: la demo — groove contenido.
  demo: { loop: 4, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A2, N.D3, N.F3, N.E4], t0, t1, { gain: 0.045, cut: 900, cutEnd: 1100, a: 1 });
    every(t0, t1, BEAT * 2, (t) => kick(r, t, 0.2));
    every(t0, t1, BEAT / 4, (t, k) => tick(r, t, { gain: [0.016, 0.006, 0.01, 0.006][k % 4], freq: 7500 }));
    every(t0, t1, BEAT * 4, (t) => tick(r, t + BEAT, { gain: 0.03, freq: 2400, q: 1, dur: 0.05 })); // clap sordo
    const line = [N.D2, N.D2, N.F2, N.D2, N.G2, N.D2, N.F2, N.E2];
    every(t0, t1, BEAT / 2, (t, k) => bass(r, line[k % 8], t, BEAT * 0.42, { gain: 0.09, cut: 260 }));
    every(t0, t1, BEAT / 2, (t, k) => pluck(r, [N.D4, N.A3, N.F4, N.A3][k % 4], t, { gain: 0.014, cut: 1400, pan: k % 2 ? 0.4 : -0.4 }));
  } },
  // crecimiento: la visión.
  evolucion: { loop: 2, bed: (r, t0, t1) => {
    pad(r, [N.D3, N.A3, N.C4, N.E4], t0, t1, { gain: 0.06, cut: 1000, cutEnd: 2600, a: 0.8 });
    every(t0, t1, BEAT, (t) => kick(r, t, 0.18));
    every(t0, t1, BEAT / 4, (t, k) => pluck(r, [N.D4, N.A4, N.E4, N.A4][k % 4], t, { gain: 0.016, cut: 2600, decay: 0.07, dur: 0.1, pan: k % 2 ? 0.45 : -0.45 }));
  } },
  // cierre: lecho sostenido bajo las marcas y la convergencia.
  cierre: { loop: 2, bed: (r, t0, t1) => {
    pad(r, [N.D2, N.A2, N.D3, N.E3, N.A3], t0, t1, { gain: 0.05, cut: 1200, cutEnd: 1800, a: 0.6 });
  } },
};

/** Secciones de cama: qué cue abre cada una. */
export const SECTIONS = [
  ["wake", "despertar"],
  ["L04", "observacion"],
  ["L09", "problema"],
  ["L11", "vacio"],
  ["L14", "proceso"],
  ["L20", "revelacion"],
  ["L21", "arquitectura"],
  ["L26", "integracion"],
  ["L29", "descenso"],
  ["await", "expositor"],
  ["heard", "interaccion"],
  ["camera", "demo"],
  ["C1", "evolucion"],
  ["C3", "cierre"],
  ["silence", null],
];

/** Automatización del fader de la música por sección (dB), igual en el MP4 y
 * en vivo. La energía del brief (10–20 % al despertar, 70–85 % en el clímax…)
 * se logra aquí; los clímax (0 dB) caen solo cuando nadie habla.
 * [cue, dB, rampa s, retraso s desde el cue]. Ajustado con scripts/levels.mjs
 * (voz ≥ +10 dB sobre la música en cada frase). */
export const FADER = [
  ["wake", -9, 1],
  ["L04", -7, 1],
  ["L09", -6, 1],
  ["L11", -4, 0.6],
  ["L14", -13, 0.2],
  ["L14e", -9, 0.8],
  ["L19", -12, 0.1],
  ["L19e", -9, 0.6],
  ["L20", -5, 1],
  ["L21", -6, 1],
  ["L26", -5, 1],
  ["L27", -7, 0.5],
  ["L28e", 0, 0.3],
  ["L28e", -9, 1, 1.6], // el descenso empieza antes de "¿Quieren ver cómo funciono?"
  ["L29", -9, 0.5],
  ["await", -6, 3],
  ["heard", -5, 1],
  ["camera", -8, 1],
  ["C1", -4, 1],
  ["C3", -2, 1],
  ["C5", 0, 0.4],
];
/** Fundido final del audio junto con el fundido a negro de la tarjeta. */
export const END_FADE = { cue: "card", after: 5.0, dur: 1.5 };

// ---------------------------------------------------------------- golpes (música)
// Cada uno recibe el instante real del cue (t) y, si aplica, datos del cue.
export const STINGERS = {
  wake: (r, t) => sub(r, N.D1, t, t + 3, { gain: 0.14, a: 1.2, rel: 3 }),
  L01: (r, t) => bell(r, N.A4, t + 0.05, { gain: 0.03 }),
  L02: (r, t) => MOTIF.forEach((m, i) => bell(r, m + 12, t + 0.3 + i * 0.42, { gain: 0.022 })),
  L04: (r, t) => pad(r, [N.D3, N.A3, N.E4], t, t + 1.2, { gain: 0.05, cut: 1400, a: 0.4, rel: 2 }),
  L07: (r, t) => bell(r, N.D5, t + 0.35, { gain: 0.025 }),
  L10: (r, t) => bell(r, N.A4, t + 0.3, { gain: 0.02 }),
  L12: (r, t) => pad(r, [N.Bb3, N.A4], t, t + 2.5, { gain: 0.018, cut: 900, a: 0.8, rel: 2 }),
  L13: (r, t) => pad(r, [N.Bb2, N.E4], t, t + 3, { gain: 0.018, cut: 700, a: 1, rel: 2.5 }),
  L14: (r, t) => {
    MOTIF.forEach((m, i) => piano(r, m, t + i * BEAT, { vel: 0.5 }));
    kick(r, t, 0.2);
  },
  // Un golpe distinto por verbo.
  L15: (r, t) => {
    piano(r, N.D3, t, { vel: 0.28 });
    piano(r, N.A3, t, { vel: 0.2 });
    sub(r, N.D2, t, t + 0.8, { gain: 0.04, a: 0.05, rel: 1.5 });
  },
  L16: (r, t) => [N.D4, N.F4, N.A4].forEach((m, i) => pluck(r, m, t + i * 0.07, { gain: 0.025, cut: 3000, delay: 0.3 })),
  L17: (r, t) => {
    bell(r, N.A4, t, { gain: 0.02 });
    bell(r, N.D5, t + 0.2, { gain: 0.018 });
  },
  L18: (r, t) => pluck(r, N.E5, t, { gain: 0.03, cut: 4000, delay: 0.6, type: "triangle", dur: 0.4 }),
  L19: (r, t) => {
    kick(r, t, 0.11);
    pad(r, [N.D3, N.F3, N.A3, N.C4], t, t + 1.5, { gain: 0.025, cut: 1800, a: 0.05, rel: 2.5 });
  },
  L20: (r, t) => MOTIF.forEach((m, i) => piano(r, m + 12, t + 0.2 + i * BEAT, { vel: 0.45 })),
  // Cada módulo trae su acorde: Rem – Si♭ – Fa – Do.
  L22: (r, t, d) => modChord(r, t + d, [N.D3, N.F3, N.A3, N.D4], N.D2),
  L23: (r, t, d) => modChord(r, t + d, [N.D3, N.F3, N.Bb3, N.D4], N.Bb2 - 12),
  L24: (r, t, d) => modChord(r, t + d, [N.C3, N.F3, N.A3, N.C4], N.F2),
  L25: (r, t, d) => modChord(r, t + d, [N.C3, N.E3, N.G3, N.C4], N.C3 - 12),
  // Primer clímax: cuando TERMINA "Soy la integración…" (nadie habla).
  L28e: (r, t) => {
    pad(r, [N.D2, N.A2, N.D3, N.E3, N.F3, N.A3, N.D4], t, t + 3.2, { gain: 0.11, cut: 3200, cutEnd: 1400, a: 0.08, rel: 4 });
    sub(r, N.D1, t, t + 2.5, { gain: 0.16, a: 0.05, rel: 2 });
    kick(r, t, 0.32);
    MOTIF.forEach((m, i) => piano(r, m + 12, t + 0.15 + i * BEAT * 0.75, { vel: 0.7 }));
  },
  // Aire que sube hacia el clímax: anclado al INICIO de la frase 28 y termina
  // en su fin esperado (d = duración mediana medida).
  L28: (r, t, d) => whoosh(r, t + Math.max(0, d - 1.25), 1.25, { gain: 0.05, from: 400, to: 5000, bus: "tex" }),
  L29: (r, t) => {
    piano(r, N.A3, t + 0.3, { vel: 0.35 });
    piano(r, N.E4, t + 0.3 + BEAT * 1.5, { vel: 0.28 }); // pregunta: queda sin resolver
  },
  heard: (r, t) => sub(r, N.A1 + 12, t, t + 0.6, { gain: 0.06, a: 0.08, rel: 1.2 }),
  L32: (r, t) => {
    pad(r, [N.D3, N.A3, N.D4, N.E4], t + 0.2, t + 2.2, { gain: 0.05, cut: 800, cutEnd: 2600, a: 1.8, rel: 1 });
    whoosh(r, t + 0.4, 1.4, { gain: 0.03, from: 300, to: 3000, bus: "tex" });
  },
  C1: (r, t) => pad(r, [N.D3, N.A3, N.E4], t, t + 1.5, { gain: 0.04, cut: 1200, a: 0.6, rel: 2 }),
  SEE: (r, t) => pluck(r, N.A4, t, { gain: 0.06, cut: 3200, delay: 0.4, type: "triangle", dur: 0.6 }),
  UNDERSTAND: (r, t) => pluck(r, N.E5, t, { gain: 0.06, cut: 3600, delay: 0.4, type: "triangle", dur: 0.6 }),
  DECIDE: (r, t) => {
    pluck(r, N.D5, t, { gain: 0.065, cut: 4000, delay: 0.45, type: "triangle", dur: 0.8 });
    sub(r, N.D2, t, t + 1, { gain: 0.07, a: 0.05, rel: 1.5 });
  },
  // "no es hacer más": muchas notas sin orden.
  C3: (r, t) => {
    const G = rng(33);
    const pool = [N.D4, N.E4, N.F4, N.G4, N.A4, N.Bb4, N.C5, N.D5, N.E5, N.F5];
    for (let i = 0; i < 46; i++) pluck(r, pool[Math.floor(G() * pool.length)], t + G() * 3.3, { gain: 0.012 + G() * 0.012, cut: 2000 + G() * 3000, dur: 0.08, delay: 0.1, pan: G() * 1.6 - 0.8 });
  },
  // "hacerlo mejor": convergen en una sola nota, en tiempo.
  C4: (r, t) => {
    every(t + 0.3, t + 2.1, BEAT / 4, (tt, k) => pluck(r, N.D4 + (k % 2 ? 12 : 0), tt, { gain: 0.014 + k * 0.001, cut: 2600, dur: 0.1, delay: 0.2 }));
    bell(r, N.D5, t + 2.1, { gain: 0.04, dur: 4 });
  },
  // Clímax final contenido; se corta en 'silence'.
  C5: (r, t) => {
    pad(r, [N.D2, N.A2, N.D3, N.E3, N.A3, N.D4, N.E4], t + 0.4, t + 2.3, { gain: 0.1, cut: 900, cutEnd: 3400, a: 0.9, rel: 0.6 });
    sub(r, N.D1, t + 0.4, t + 2.3, { gain: 0.15, a: 0.6, rel: 0.4 });
    MOTIF.forEach((m, i) => piano(r, m + 12, t + 0.5 + i * BEAT * 0.6, { vel: 0.7, dur: 3 }));
    kick(r, t + 0.5, 0.3);
  },
  card: (r, t) => {
    piano(r, N.D2 + 12, t + 0.35, { vel: 0.4, dur: 7, hall: 0.8 });
    bell(r, N.A5, t + 0.4, { gain: 0.018, dur: 6 });
  },
};
function modChord(r, t, notes, low) {
  pad(r, notes, t, t + 2.4, { gain: 0.03, cut: 1600, cutEnd: 900, a: 0.03, rel: 3 });
  bass(r, low, t, 2.4, { gain: 0.07 });
}

// ---------------------------------------------------------------- efectos (SFX)
// Funcionales: sincronizados con lo que se VE (retrasos = frames de la animación / 30).
export const SFX = {
  wake: (r, t) => {
    whoosh(r, t, 0.95, { gain: 0.035, from: 1800, to: 6000, q: 6, hall: 0.2 }); // la línea de luz converge
    tick(r, t + 0.93, { gain: 0.05, freq: 4200, q: 4, bus: "sfx" });
    // las hojas del iris entran (wake + 62 f)
    for (let i = 0; i < 6; i++) tick(r, t + 2.07 + i * 0.09, { gain: 0.02, freq: 3000 + i * 250, q: 5, dur: 0.006, bus: "sfx", pan: i / 5 - 0.5 });
  },
  L04: (r, t) => {
    for (let i = 0; i < 6; i++) tick(r, t + i * 0.05, { gain: 0.02, freq: 2600 + i * 300, q: 5, dur: 0.006, bus: "sfx", pan: 0.5 - i / 5 });
    whoosh(r, t + 0.5, 1.0, { gain: 0.02, from: 500, to: 2500 });
  },
  L07: (r, t) => {
    tick(r, t + 0.36, { gain: 0.05, freq: 3800, q: 6, dur: 0.008, bus: "sfx" });
    thunk(r, t + 0.44, { gain: 0.08, freq: 140 });
  },
  L08: (r, t) => grains(r, t + 0.1, t + 1.8, { gain: 0.012, density: 18, lo: 3000, hi: 8000, bus: "sfx" }),
  L10: (r, t) => tick(r, t + 0.45, { gain: 0.04, freq: 2600, q: 4, dur: 0.01, bus: "sfx" }),
  L11: (r, t) => thunk(r, t + 0.1, { gain: 0.06, freq: 80 }),
  L12: (r, t) => thunk(r, t + 0.1, { gain: 0.06, freq: 80 }),
  L13: (r, t) => {
    thunk(r, t + 0.1, { gain: 0.06, freq: 80 });
    grains(r, t + 0.35, t + 0.6, { gain: 0.02, density: 60, lo: 900, hi: 2500, bus: "sfx" }); // el enlace roto
  },
  L20: (r, t) => [2, 2.6, 3.2].forEach((dt) => tick(r, t + dt, { gain: 0.018, freq: 5200, q: 8, dur: 0.02, bus: "sfx" })),
  L22: (r, t, d) => thunk(r, t + d, { gain: 0.16 }),
  L23: (r, t, d) => thunk(r, t + d, { gain: 0.16 }),
  L24: (r, t, d) => thunk(r, t + d, { gain: 0.16 }),
  L25: (r, t, d) => thunk(r, t + d, { gain: 0.16 }),
  heard: (r, t) => {
    tick(r, t, { gain: 0.035, freq: 3000, q: 5, dur: 0.008, bus: "sfx" });
    whoosh(r, t, 0.6, { gain: 0.012, from: 700, to: 1500 });
  },
  L32: (r, t) => {
    for (let i = 0; i < 6; i++) tick(r, t + i * 0.05, { gain: 0.022, freq: 2600 + i * 300, q: 5, dur: 0.006, bus: "sfx", pan: 0.5 - i / 5 });
    whoosh(r, t + 0.45, 1.1, { gain: 0.03, from: 400, to: 3200 });
  },
  camera: (r, t) => whoosh(r, t, 0.5, { gain: 0.015, from: 4000, to: 1500, q: 4 }),
  C1: (r, t) => {
    for (let i = 0; i < 6; i++) tick(r, t + 0.5 + i * 0.05, { gain: 0.018, freq: 4200 - i * 300, q: 5, dur: 0.006, bus: "sfx" });
  },
  C3: (r, t) => grains(r, t, t + 1.5, { gain: 0.016, density: 80, lo: 2500, hi: 9000, bus: "sfx" }),
  C4: (r, t) => {
    every(t + 0.9, t + 2.1, 0.08, (tt, k) => tick(r, tt, { gain: 0.006 + k * 0.001, freq: 5000, q: 6, dur: 0.005, bus: "sfx" }));
    thunk(r, t + 2.15, { gain: 0.1, freq: 120 });
  },
  C5: (r, t) => {
    for (let i = 0; i < 6; i++) tick(r, t + i * 0.04, { gain: 0.03, freq: 3000 + i * 200, q: 5, dur: 0.006, bus: "sfx" });
  },
};

// ---------------------------------------------------------------- arreglo
/** Arreglo completo sobre cues en segundos (T[id]). Las camas se enciman
 * `xf` s en cada cambio; los golpes y efectos caen en su cue. `kw[id]` =
 * segundos hasta la palabra clave de la frase (inserciones de módulos). */
export function arrange(r, T, { kw = {}, beds = true, stingers = true, sfx = true, xf = 1.2, end = null } = {}) {
  if (beds) {
    const secs = SECTIONS.filter(([id]) => T[id] != null).sort((a, b) => T[a[0]] - T[b[0]]);
    secs.forEach(([id, name], i) => {
      if (!name) return;
      const t0 = T[id];
      const t1 = i + 1 < secs.length ? T[secs[i + 1][0]] : end ?? t0 + 10;
      BEDS[name].bed(r, Math.max(0, t0 - 0.05), t1 + xf * 0.5);
    });
  }
  for (const [id, fn] of Object.entries(stingers ? STINGERS : {})) if (T[id] != null) fn(r, T[id], kw[id] ?? 0);
  for (const [id, fn] of Object.entries(sfx ? SFX : {})) if (T[id] != null) fn(r, T[id], kw[id] ?? 0);
}

/** Silencio real al final: todo se apaga en 'silence' (120 ms). */
export function silenceAt(r, t) {
  const c = t - r.origin;
  if (c + 0.12 <= 0) return void (r.out.gain.value = 0);
  if (t > r.until) return;
  r.out.gain.setValueAtTime(1, Math.max(0, c));
  r.out.gain.linearRampToValueAtTime(0, c + 0.12);
}
