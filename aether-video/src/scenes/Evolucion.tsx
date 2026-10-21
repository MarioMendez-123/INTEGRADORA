import React from "react";
import { hexPoints, toPath } from "../components/Aperture";
import { Word } from "../components/primitives";
import { EASE_IN_OUT, prog } from "../lib/anim";
import { C } from "../theme";
import { SceneProps, at } from "./types";

// SEE → UNDERSTAND → DECIDE: la evolución que BUSCAMOS, no una capacidad
// actual. Por eso: letra en trazo abierto, nodos punteados, eje que se
// pierde hacia adelante y la etiqueta "visualización conceptual" (Labels).
const Y = 540;
const WORDS = [
  { id: "SEE", x: 720 },
  { id: "UNDERSTAND", x: 1140 },
  { id: "DECIDE", x: 1560 },
];

export const Evolucion: React.FC<SceneProps> = ({ f, q }) => {
  const C1 = at(q, "C1");
  if (f < C1) return null;
  const out = prog(f, at(q, "C3"), 20);
  if (out >= 1) return null;
  const axis = prog(f, C1 + 22, 36, Infinity, EASE_IN_OUT);
  const xEnd = 440 + (1880 - 440) * axis;
  return (
    <g opacity={1 - out}>
      <defs>
        <linearGradient id="evoFade" x1="440" x2="1880" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.ink} stopOpacity={0.5} />
          <stop offset="0.72" stopColor={C.ink} stopOpacity={0.35} />
          <stop offset="1" stopColor={C.ink} stopOpacity={0} />
        </linearGradient>
      </defs>
      <line x1={440} x2={xEnd} y1={Y} y2={Y} stroke="url(#evoFade)" strokeWidth={1.4} strokeDasharray="10 8" />
      {WORDS.map((w) => {
        const c = at(q, w.id);
        const p = prog(f, c, 14);
        const ring = prog(f, c, 20);
        if (p <= 0) return null;
        return (
          <g key={w.id}>
            {ring < 1 && <path d={toPath(hexPoints(w.x, Y, 12 + 30 * ring))} fill="none" stroke={C.amber} opacity={0.6 * (1 - ring)} />}
            <path d={toPath(hexPoints(w.x, Y, 12))} fill={C.bg} stroke={C.amber} strokeWidth={1.4} strokeDasharray="3 3" opacity={p} />
            <Word x={w.x} y={Y - 44} text={w.id} size={50} weight={300} tracking={0.16} reveal={p} outline color={C.ink} />
          </g>
        );
      })}
    </g>
  );
};
