// WAV mínimo (PCM 16 bits con dither TPDF / float 32) y decodificación vía el ffmpeg de Remotion.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

export const FFMPEG = path.resolve("node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe");

export function writeWav(file, chans, sr, bits = 16) {
  const n = chans[0].length;
  const nc = chans.length;
  const bps = bits / 8;
  const buf = Buffer.alloc(44 + n * nc * bps);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * nc * bps, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(bits === 32 ? 3 : 1, 20);
  buf.writeUInt16LE(nc, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * nc * bps, 28);
  buf.writeUInt16LE(nc * bps, 32);
  buf.writeUInt16LE(bits, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * nc * bps, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nc; c++) {
      const x = chans[c][i];
      if (bits === 32) buf.writeFloatLE(x, o);
      else {
        const d = (Math.random() - Math.random()) / 32768; // TPDF
        buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round((x + d) * 32767))), o);
      }
      o += bps;
    }
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}

export function readWav(file) {
  const b = fs.readFileSync(file);
  let p = 12;
  let fmt = null;
  while (p < b.length) {
    const id = b.toString("ascii", p, p + 4);
    const size = b.readUInt32LE(p + 4);
    if (id === "fmt ") fmt = { format: b.readUInt16LE(p + 8), nc: b.readUInt16LE(p + 10), sr: b.readUInt32LE(p + 12), bits: b.readUInt16LE(p + 22) };
    if (id === "data") {
      const bps = fmt.bits / 8;
      const n = Math.floor(size / (bps * fmt.nc));
      const chans = Array.from({ length: fmt.nc }, () => new Float32Array(n));
      let o = p + 8;
      for (let i = 0; i < n; i++)
        for (let c = 0; c < fmt.nc; c++, o += bps) chans[c][i] = fmt.format === 3 ? b.readFloatLE(o) : b.readInt16LE(o) / 32768;
      return { sr: fmt.sr, chans };
    }
    p += 8 + size + (size % 2);
  }
  throw new Error(`sin datos: ${file}`);
}

/** Decodifica cualquier audio a PCM estéreo 48 kHz. */
export function decode(file, sr = 48000) {
  const tmp = path.join(os.tmpdir(), `aether-dec-${process.pid}-${path.basename(file)}.wav`);
  execFileSync(FFMPEG, ["-y", "-v", "error", "-i", file, "-ac", "2", "-ar", String(sr), "-c:a", "pcm_s16le", tmp]);
  const w = readWav(tmp);
  fs.unlinkSync(tmp);
  return w;
}
