// Logo de Aether dibujado con caracteres ASCII (hexágono de nodos + wordmark en bloques).
export type Cell = { ch: string; col: number; row: number; key: number; kind: "edge" | "spoke" | "node" | "word" | "sub"; shade: number };
export const COLS = 130, ROWS = 34;
const HC = 54, HR = 34;                       // celdas que ocupa el hexágono
const V: [number, number][] = [[150, 0], [280, 75], [280, 225], [150, 300], [20, 225], [20, 75]];
const CEN: [number, number] = [150, 150];
const dseg = (p: [number, number], a: [number, number], b: [number, number]) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
};
export const buildAscii = (): Cell[] => {
  const cells: Cell[] = [];
  const ux = 260 / HC, uy = 300 / HR;
  for (let r = 0; r < HR; r++) for (let c = 0; c < HC; c++) {
    const p: [number, number] = [20 + (c + 0.5) * ux, (r + 0.5) * uy];
    let ch = "", kind: Cell["kind"] = "edge";
    if (V.some(v => Math.hypot(p[0] - v[0], (p[1] - v[1]) * 0.9) < 11) || Math.hypot(p[0] - CEN[0], p[1] - CEN[1]) < 15) { ch = "@"; kind = "node"; }
    else {
      let best = 1e9, bi = 0;
      for (let i = 0; i < 6; i++) { const d = dseg(p, V[i], V[(i + 1) % 6]); if (d < best) { best = d; bi = i; } }
      if (best < 3.6) { ch = ["\\", "|", "/", "\\", "|", "/"][bi]; kind = "edge"; }
      else { let sb = 1e9, si = 0; for (let i = 0; i < 6; i++) { const d = dseg(p, CEN, V[i]); if (d < sb) { sb = d; si = i; } } if (sb < 2.0) { ch = si === 0 || si === 3 ? ":" : "."; kind = "spoke"; } }
    }
    if (ch) cells.push({ ch, col: c, row: r, key: r / HR * 0.72 + hash(r * 200 + c) * 0.18 + (kind === "spoke" ? 0.06 : 0), kind, shade: (c / HC + r / HR) / 2 });
  }
  // wordmark: 6 letras, cada píxel = 2 columnas
  const word = "AETHER"; let ox = 60; const oy = 10;
  for (const L of word) {
    FONT[L].forEach((line, r) => [...line].forEach((b, c) => { if (b === "1") for (let k = 0; k < 2; k++) cells.push({ ch: "#", col: ox + c * 2 + k, row: oy + r, key: 0.3 + (ox - 60) / 70 * 0.45 + hash(ox + r * 31 + c) * 0.18, kind: "word", shade: 0 }); }));
    ox += 12;
  }
  [..."I N D U S T R I A L   S Y S T E M S"].forEach((ch, i) => { if (ch !== " ") cells.push({ ch, col: 60 + i, row: 21, key: 0.78 + hash(i) * 0.15, kind: "sub", shade: 0 }); });
  return cells;
};
