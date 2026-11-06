// Sintetiza los efectos de sonido del intro (WAV mono 44.1 kHz, 16 bit) sin dependencias.
import fs from "fs"; import path from "path";
const SR = 44100, out = path.resolve("intro/public/sfx"); fs.mkdirSync(out, { recursive: true });
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const wav = (name, f) => {
  const n = Math.floor(f.dur * SR), d = new Int16Array(n); let pk = 0; const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) { raw[i] = f.fn(i / SR, i); pk = Math.max(pk, Math.abs(raw[i])); }
  for (let i = 0; i < n; i++) d[i] = Math.max(-32767, Math.min(32767, (raw[i] / (pk || 1)) * 0.92 * 32767));
  const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + n * 2, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(n * 2, 40);
  fs.writeFileSync(path.join(out, name + ".wav"), Buffer.concat([h, Buffer.from(d.buffer)])); console.log(name, f.dur + "s");
};
// filtro de variable de estado (paso banda / paso bajo)
const svf = () => { let lo = 0, bp = 0; return (x, fc, q, mode) => { const f = 2 * Math.sin(Math.PI * Math.min(fc, 18000) / SR); lo += f * bp; const hi = x - lo - q * bp; bp += f * hi; return mode === "lp" ? lo : bp; }; };
const env = (t, a, r, dur) => Math.min(1, t / a) * Math.pow(Math.max(0, 1 - t / dur), r);
{ let ph = 0; const lp = svf(); wav("impact", { dur: 1.6, fn: t => { const fr = 38 + 90 * Math.exp(-t * 14); ph += 2 * Math.PI * fr / SR; return Math.sin(ph) * Math.exp(-t * 2.6) * 1.2 + lp(rnd(), 600 * Math.exp(-t * 6) + 80, 0.8, "lp") * Math.exp(-t * 9) * 1.4 + (t < 0.004 ? rnd() : 0); } }); }
{ const b = svf(); wav("whoosh", { dur: 0.9, fn: t => b(rnd(), 300 + 6500 * Math.pow(t / 0.9, 1.6), 0.35, "bp") * Math.sin(Math.PI * Math.pow(t / 0.9, 0.55)) * 2.4 }); }
{ const b = svf(); wav("whoosh_rev", { dur: 0.9, fn: t => b(rnd(), 7000 - 6500 * Math.pow(t / 0.9, 0.7), 0.35, "bp") * Math.sin(Math.PI * Math.pow(t / 0.9, 0.9)) * 2.4 }); }
{ let ph = 0; const b = svf(); wav("riser", { dur: 2.2, fn: t => { const u = t / 2.2; ph += 2 * Math.PI * (120 + 1500 * u * u) / SR; return (b(rnd(), 400 + 9000 * u * u, 0.5, "bp") * 1.8 + Math.sin(ph) * 0.5 + Math.sin(ph * 1.5) * 0.25) * Math.pow(u, 1.6); } }); }
{ let ph = 0; const lp = svf(); wav("hit", { dur: 0.5, fn: t => { ph += 2 * Math.PI * (60 + 140 * Math.exp(-t * 30)) / SR; return Math.sin(ph) * Math.exp(-t * 9) + lp(rnd(), 5000, 0.9, "lp") * Math.exp(-t * 28) * 0.9; } }); }
{ let hold = 0, ph = 0; wav("glitch", { dur: 0.32, fn: (t, i) => { if (i % Math.floor(SR * (0.004 + 0.012 * Math.abs(Math.sin(t * 90)))) === 0) hold = Math.round(rnd() * 4) / 4; ph += 2 * Math.PI * (200 + 1800 * Math.abs(Math.sin(t * 37))) / SR; return (Math.sign(Math.sin(ph)) * 0.5 + hold) * (Math.floor(t * 55) % 2 ? 1 : 0.2) * env(t, 0.002, 1.5, 0.32); } }); }
{ wav("shimmer", { dur: 1.4, fn: t => { let v = 0; [0, 4, 7, 12, 16, 19, 24].forEach((st, k) => { const s0 = k * 0.07; if (t > s0) v += Math.sin(2 * Math.PI * 523.25 * Math.pow(2, st / 12) * (t - s0)) * Math.exp(-(t - s0) * 3.2) * 0.5; }); return v; } }); }
{ wav("blip", { dur: 0.12, fn: t => Math.sin(2 * Math.PI * (1400 + 600 * Math.floor(t * 60 % 2)) * t) * env(t, 0.002, 2, 0.12) }); }
