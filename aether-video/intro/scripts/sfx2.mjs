// Efectos adicionales del intro (WAV mono 44.1 kHz). Complementa intro/scripts/sfx.mjs.
import fs from "fs"; import path from "path";
const SR = 44100, out = path.resolve("intro/public/sfx");
let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const wav = (name, dur, fn) => {
  const n = Math.floor(dur * SR), raw = new Float32Array(n), d = new Int16Array(n); let pk = 0;
  for (let i = 0; i < n; i++) { raw[i] = fn(i / SR, i); pk = Math.max(pk, Math.abs(raw[i])); }
  for (let i = 0; i < n; i++) d[i] = (raw[i] / (pk || 1)) * 0.92 * 32767;
  const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + n * 2, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(n * 2, 40);
  fs.writeFileSync(path.join(out, name + ".wav"), Buffer.concat([h, Buffer.from(d.buffer)])); console.log(name, dur + "s");
};
const svf = () => { let lo = 0, bp = 0; return (x, fc, q, mode) => { const f = 2 * Math.sin(Math.PI * Math.min(fc, 16000) / SR); lo += f * bp; const hi = x - lo - q * bp; bp += f * hi; return mode === "lp" ? lo : mode === "hp" ? hi : bp; }; };
const ring = (t, fs_, dec) => fs_.reduce((a, f, i) => a + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * dec * (1 + i * 0.5)) / (i + 1), 0);

// Letra metálica que aterriza en el piso
{ let ph = 0; wav("thunk", 0.35, t => { ph += 2 * Math.PI * (70 + 150 * Math.exp(-t * 40)) / SR; return Math.sin(ph) * Math.exp(-t * 16) * 1.3 + ring(t, [420, 690, 1130], 26) * 0.35 + (t < 0.003 ? rnd() * 0.8 : 0); }); }
// Paso a toda velocidad junto a la cámara (pico a 0.35 s)
{ const b = svf(), l = svf(); wav("flyby", 0.9, t => { const u = t / 0.9, fc = u < 0.39 ? 700 + 2600 * (u / 0.39) ** 2 : 3300 - 2700 * ((u - 0.39) / 0.61) ** 0.7, a = u < 0.39 ? (u / 0.39) ** 2 : ((1 - u) / 0.61) ** 1.6; return (b(rnd(), fc, 0.4, "bp") * 2.2 + l(rnd(), 180, 0.7, "lp") * 1.4) * a; }); }
// Pistón neumático: siseo + golpe metálico
{ const h = svf(); wav("piston", 0.7, t => h(rnd(), 5200, 0.6, "hp") * Math.exp(-t * 7) * 0.5 * Math.min(1, t * 200) + (t > 0.04 ? ring(t - 0.04, [240, 610, 980, 1730], 11) * 0.9 : 0) + (t > 0.04 && t < 0.055 ? rnd() * 0.9 : 0)); }
// Servomotor: el carrito se despieza / la banda avanza
{ let ph = 0; const b = svf(); wav("servo", 1.5, t => { const u = t / 1.5, fr = 150 + 330 * Math.sin(Math.min(1, u * 1.1) * Math.PI / 2) + 6 * Math.sin(t * 48); ph += fr / SR; const saw = 2 * (ph % 1) - 1; return b(saw + rnd() * 0.08, fr * 3.2, 0.5, "bp") * Math.min(1, t * 12) * Math.min(1, (1 - u) * 5); }); }
// Escáner que barre la pantalla
{ let ph = 0; wav("scan", 1.45, t => { const u = t / 1.45; ph += 2 * Math.PI * (500 + 1900 * u) / SR; return Math.sin(ph) * (0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 16)) * Math.min(1, t * 20) * Math.min(1, (1 - u) * 8); }); }
// Tecleo de datos
{ const h = svf(); wav("tick", 0.03, t => h(rnd(), 4200, 0.7, "bp") * Math.exp(-t * 170)); }
// Zumbido que crece hasta el golpe
{ let a = 0, c = 0; const l = svf(), n = svf(); wav("drone", 7.7, t => { const u = t / 7.7; a += 55 / SR; c += 82.7 / SR; const saw = (2 * (a % 1) - 1) + (2 * (c % 1) - 1) * 0.7; return (l(saw, 120 + 1300 * u * u, 0.6, "lp") * 0.9 + n(rnd(), 500 + 5000 * u * u * u, 0.6, "bp") * 0.55 * u) * (0.15 + 0.85 * u ** 1.5) * Math.min(1, (7.7 - t) * 40); }); }
