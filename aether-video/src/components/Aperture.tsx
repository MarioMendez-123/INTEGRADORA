import React, { useId } from "react";
import { C } from "../theme";
import { lerp } from "../lib/anim";

type Pt = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
export const hexPoints = (cx: number, cy: number, r: number, rotDeg = 0): Pt[] =>
  Array.from({ length: 6 }, (_, k) => [cx + r * Math.cos(rad(60 * k + rotDeg)), cy + r * Math.sin(rad(60 * k + rotDeg))]);
export const toPath = (pts: Pt[], close = true) => `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("L")}${close ? "Z" : ""}`;

/** Intersección del rayo p + t·d con el hexágono exterior: punto y segmento. */
function hitOuter(p: Pt, d: Pt, outer: Pt[]): { x: Pt; seg: number } {
  let best = { t: Infinity, x: p, seg: 0 };
  for (let j = 0; j < 6; j++) {
    const a = outer[j];
    const b = outer[(j + 1) % 6];
    const e: Pt = [b[0] - a[0], b[1] - a[1]];
    const den = d[0] * e[1] - d[1] * e[0];
    if (Math.abs(den) < 1e-9) continue;
    const w: Pt = [a[0] - p[0], a[1] - p[1]];
    const t = (w[0] * e[1] - w[1] * e[0]) / den;
    const s = (w[0] * d[1] - w[1] * d[0]) / den;
    if (t > 1e-6 && s >= -1e-6 && s <= 1 + 1e-6 && t < best.t) best = { t, x: [p[0] + t * d[0], p[1] + t * d[1]], seg: j };
  }
  return { x: best.x, seg: best.seg };
}

/** Hojas de un diafragma hexagonal: cada hoja es la región entre el borde del
 * hueco (prolongado hasta el marco) y el borde vecino — como un iris real. */
export function irisBlades(cx: number, cy: number, R: number, open: number, twistDeg: number): { blades: string[]; hole: Pt[] } {
  const h = lerp(R * 0.035, R * 0.9, open);
  const phi = lerp(twistDeg, 0, open);
  const outer = hexPoints(cx, cy, R);
  const hole = hexPoints(cx, cy, h, phi);
  const rays = hole.map((hk, k) => {
    const prev = hole[(k + 5) % 6];
    const d: Pt = [hk[0] - prev[0], hk[1] - prev[1]];
    const len = Math.hypot(d[0], d[1]) || 1;
    return hitOuter(hk, [d[0] / len, d[1] / len], outer);
  });
  const blades = hole.map((_, k) => {
    const k1 = (k + 1) % 6;
    const pts: Pt[] = [hole[k], hole[k1], rays[k1].x];
    for (let m = rays[k1].seg, guard = 0; m !== rays[k].seg && guard < 6; m = (m + 5) % 6, guard++) pts.push(outer[m]);
    pts.push(rays[k].x);
    return toPath(pts);
  });
  return { blades, hole };
}

type Props = {
  cx: number;
  cy: number;
  R: number;
  /** 0 = cerrado (solo el punto ámbar), 1 = abierto. */
  open: number;
  /** Rotación extra de las hojas cerradas (grados). */
  twist?: number;
  /** 0..1 — cuánto del marco hexagonal está dibujado (encendido). */
  frameDraw?: number;
  bladesAlpha?: number;
  /** 0..1 — intensidad del núcleo ámbar. */
  glow?: number;
  frameAlpha?: number;
  strokeWidth?: number;
};

export const Aperture: React.FC<Props> = ({ cx, cy, R, open, twist = -34, frameDraw = 1, bladesAlpha = 1, glow = 1, frameAlpha = 1, strokeWidth = 2 }) => {
  const id = useId().replace(/:/g, "");
  const { blades, hole } = irisBlades(cx, cy, R, open, twist);
  const outer = hexPoints(cx, cy, R);
  const quarter = 1.5 * R; // largo de cada trazo del encendido
  const coreR = lerp(R * 0.05, R * 0.2, Math.min(1, open * 2.5));
  return (
    <g>
      <defs>
        <radialGradient id={`core${id}`}>
          <stop offset="0%" stopColor={C.amber} stopOpacity={0.9 * glow} />
          <stop offset="35%" stopColor={C.amber} stopOpacity={0.28 * glow} />
          <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`hole${id}`}>
          <path d={toPath(bladesAlpha > 0 ? hole : outer)} />
        </clipPath>
      </defs>
      {/* núcleo: se ve a través del hueco */}
      <circle cx={cx} cy={cy} r={R * lerp(0.6, 0.9, open)} fill={`url(#core${id})`} opacity={glow * lerp(1, 0.35, open)} clipPath={`url(#hole${id})`} />
      <circle cx={cx} cy={cy} r={coreR} fill="none" stroke={C.amber} strokeWidth={1.5} opacity={glow * 0.9} clipPath={`url(#hole${id})`} />
      <circle cx={cx} cy={cy} r={Math.max(2.5, R * 0.028)} fill={C.amber} opacity={glow} />
      {bladesAlpha > 0 && (
        <g opacity={bladesAlpha}>
          {blades.map((d, k) => (
            <path key={k} d={d} fill={C.blade} stroke={C.ink} strokeOpacity={0.42} strokeWidth={1.1} strokeLinejoin="round" />
          ))}
        </g>
      )}
      {frameDraw >= 1 ? (
        <path d={toPath(outer)} fill="none" stroke={C.ink} strokeWidth={strokeWidth} strokeLinejoin="round" opacity={frameAlpha} />
      ) : (
        // Encendido: desde los vértices izquierdo y derecho (donde llega la
        // línea de luz) cuatro trazos cierran el hexágono arriba y abajo.
        frameHalves(outer).map((pts, k) => (
          <path
            key={k}
            d={toPath(pts, false)}
            fill="none"
            stroke={C.ink}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            opacity={frameAlpha}
            strokeDasharray={`${quarter * frameDraw} ${quarter}`}
          />
        ))
      )}
    </g>
  );
};

const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
// Vértices: 0 derecha, 1-2 abajo, 3 izquierda, 4-5 arriba.
const frameHalves = (o: Pt[]): Pt[][] => [
  [o[0], o[5], mid(o[5], o[4])],
  [o[3], o[4], mid(o[4], o[5])],
  [o[0], o[1], mid(o[1], o[2])],
  [o[3], o[2], mid(o[2], o[1])],
];
