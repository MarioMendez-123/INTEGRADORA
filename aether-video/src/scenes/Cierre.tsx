import React from "react";
import { random } from "remotion";
import { hexPoints } from "../components/Aperture";
import { Word } from "../components/primitives";
import { EASE_IN_OUT, loopNoise, prog } from "../lib/anim";
import { C, F } from "../theme";
import { SceneProps, at } from "./types";

// "…no es hacer más." = muchas marcas sin orden.
// "Es aprender a hacerlo mejor." = convergen en UNA forma precisa (el hexágono
// de la apertura). "This is Aether." = clímax → silencio → tarjeta.
const N = 120;
const PER_EDGE = N / 6;
const HEX = hexPoints(960, 540, 170);
const MARKS = Array.from({ length: N }, (_, i) => {
  const e = Math.floor(i / PER_EDGE);
  const t = ((i % PER_EDGE) + 0.5) / PER_EDGE;
  const [a, b] = [HEX[e], HEX[(e + 1) % 6]];
  return {
    x0: 120 + random(`x${i}`) * 1680,
    y0: 90 + random(`y${i}`) * 900,
    a0: random(`a${i}`) * 180,
    l0: 14 + random(`l${i}`) * 30,
    x1: a[0] + (b[0] - a[0]) * t,
    y1: a[1] + (b[1] - a[1]) * t,
    a1: ((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 180) % 180,
    order: random(`o${i}`),
  };
});
const lerpAngle = (a: number, b: number, t: number) => {
  let d = ((b - a + 270) % 180) - 90; // camino corto (una línea es simétrica a 180°)
  if (d < -90) d += 180;
  return a + d * t;
};

/** Las 120 marcas como pocos <path> agrupados por opacidad (pasos de 0.05):
 * 120 elementos animados por separado trababan esta escena en vivo. */
function marksPaths(f: number, C3: number, C4: number): [number, string][] {
  const groups = new Map<number, string[]>();
  MARKS.forEach((m, i) => {
    const show = prog(f, C3 + m.order * 40, 6);
    if (show <= 0) return;
    const t = prog(f, C4 + m.order * 26, 34, Infinity, EASE_IN_OUT);
    const jx = 6 * loopNoise(`jx${i}`, f, 120) * (1 - t);
    const jy = 6 * loopNoise(`jy${i}`, f, 120) * (1 - t);
    const x = m.x0 + (m.x1 - m.x0) * t + jx;
    const y = m.y0 + (m.y1 - m.y0) * t + jy;
    const ang = (lerpAngle(m.a0, m.a1, t) * Math.PI) / 180;
    const l = (m.l0 + (6.2 - m.l0) * t) / 2;
    const dx = Math.cos(ang) * l;
    const dy = Math.sin(ang) * l;
    const op = Math.round((0.35 + 0.45 * t) * show * 20) / 20;
    if (op <= 0) return;
    const seg = `M${(x - dx).toFixed(1)},${(y - dy).toFixed(1)}L${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`;
    (groups.get(op) ?? groups.set(op, []).get(op)!).push(seg);
  });
  return [...groups].map(([op, segs]) => [op, segs.join("")]);
}

export const Cierre: React.FC<SceneProps> = ({ f, q }) => {
  const C3 = at(q, "C3");
  const C4 = at(q, "C4");
  const C5 = at(q, "C5");
  const silence = at(q, "silence");
  const card = at(q, "card");
  const marksOut = prog(f, C4 + 58, 14);
  const bloom = prog(f, C5 + 16, 30) * (1 - prog(f, silence, 6));
  const cardIn = prog(f, card + 10, 28);
  const cardOut = prog(f, card + 150, 45, Infinity, EASE_IN_OUT);
  return (
    <g>
      {f >= C3 && marksOut < 1 && (
        <g stroke={C.ink} strokeLinecap="round" opacity={1 - marksOut} strokeWidth={1.6} fill="none">
          {marksPaths(f, C3, C4).map(([op, d]) => (
            <path key={op} d={d} strokeOpacity={op} />
          ))}
        </g>
      )}
      {bloom > 0 && <circle cx={960} cy={540} r={620} fill="url(#bloom)" opacity={0.7 * bloom} />}
      {cardIn > 0 && cardOut < 1 && (
        <g opacity={cardIn * (1 - cardOut)}>
          <Word x={960} y={600} text="AETHER" size={92} weight={300} tracking={0.5} reveal={cardIn} />
          <text x={960} y={664} textAnchor="middle" fontFamily={F.sans} fontSize={30} fontWeight={400} letterSpacing="0.06em" fill={C.inkDim}>
            Sistema autónomo de inventario
          </text>
        </g>
      )}
    </g>
  );
};
