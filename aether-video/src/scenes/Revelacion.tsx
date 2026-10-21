import React from "react";
import { Aperture } from "../components/Aperture";
import { EASE_IN_OUT, prog } from "../lib/anim";
import { C } from "../theme";
import { SceneProps, at } from "./types";

// "Ese es el proceso que permite transformar una imagen en información."
// Primera revelación, SOLO visual: imagen → percepción → datos → información.
const Y = 760;
const X = [480, 800, 1120, 1440];
const BW = 150;
const BH = 100;

export const Revelacion: React.FC<SceneProps> = ({ f, q }) => {
  const c = at(q, "L20");
  const out = prog(f, at(q, "L21"), 22, Infinity, EASE_IN_OUT);
  if (f < c || out >= 1) return null;
  const st = X.map((_, i) => prog(f, c + 8 + i * 12, 16));
  const arrows = X.slice(1).map((_, i) => prog(f, c + 14 + i * 12, 12));
  // Un paquete recorre la transformación en bucle (sostenible si la voz tarda).
  const t0 = c + 60;
  const k = f >= t0 ? ((f - t0) % 96) / 96 : -1;
  const px = X[0] + k * (X[3] - X[0]);
  const s = 1 - 0.45 * out;
  return (
    <g opacity={1 - out} transform={`translate(960,${Y}) scale(${s}) translate(-960,${-Y})`}>
      {arrows.map((p, i) => {
        const x1 = X[i] + BW / 2 + 14;
        const x2 = X[i + 1] - BW / 2 - 14;
        const xe = x1 + (x2 - x1) * p;
        return (
          <g key={i} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1.3} fill="none">
            <line x1={x1} x2={xe} y1={Y} y2={Y} />
            {p >= 1 && <path d={`M${x2 - 7},${Y - 5}L${x2},${Y}L${x2 - 7},${Y + 5}`} />}
          </g>
        );
      })}
      {/* imagen */}
      <g opacity={st[0]}>
        <rect x={X[0] - BW / 2} y={Y - BH / 2} width={BW} height={BH} fill={C.bg} stroke={C.ink} strokeOpacity={0.6} strokeWidth={1.3} />
        <path
          d={`M${X[0] - 55},${Y + 35}V${Y - 35}H${X[0] + 55}V${Y + 35}M${X[0] - 55},${Y}H${X[0] + 55}M${X[0] - 44},${Y}v-22h22v22M${X[0] + 8},${Y}v-16h26v16M${X[0] - 40},${Y + 35}v-24h30v24M${X[0] + 12},${Y + 35}v-18h20v18`}
          fill="none"
          stroke={C.ink}
          strokeOpacity={0.45}
        />
      </g>
      {/* percepción */}
      {st[1] > 0 && (
        <g opacity={st[1]}>
          <Aperture cx={X[1]} cy={Y} R={52} open={0.45} glow={0.85} strokeWidth={1.5} />
        </g>
      )}
      {/* datos */}
      <g opacity={st[2]}>
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={X[2] - 55 + (i % 6) * 22} cy={Y - 33 + Math.floor(i / 6) * 22} r={2.6} fill={C.ink} opacity={Math.min(1, Math.max(0, st[2] * 24 - i)) * 0.75} />
        ))}
      </g>
      {/* información: registros estructurados (sin cifras) */}
      <g opacity={st[3]} stroke={C.ink} strokeWidth={1.3} fill="none">
        <rect x={X[3] - BW / 2} y={Y - BH / 2} width={BW} height={BH} strokeOpacity={0.6} />
        {[0, 1, 2].map((r) => (
          <line key={r} x1={X[3] - BW / 2} x2={X[3] + BW / 2} y1={Y - BH / 2 + 25 * (r + 1)} y2={Y - BH / 2 + 25 * (r + 1)} strokeOpacity={0.35} />
        ))}
        <line x1={X[3] - 30} x2={X[3] - 30} y1={Y - BH / 2} y2={Y + BH / 2} strokeOpacity={0.35} />
        <rect x={X[3] - BW / 2 + 1} y={Y - BH / 2 + 1} width={BW - 2} height={24} fill={C.amberGhost} stroke="none" />
      </g>
      {k >= 0 && <rect x={px - 5} y={Y - 5} width={10} height={10} fill={C.amber} opacity={0.9} />}
    </g>
  );
};
