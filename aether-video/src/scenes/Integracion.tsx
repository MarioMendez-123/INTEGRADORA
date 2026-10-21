import React from "react";
import { Word } from "../components/primitives";
import { EASE_IN_OUT, prog } from "../lib/anim";
import { C } from "../theme";
import { SceneProps, at } from "./types";

// "No soy solamente un robot." — esquema ILUSTRATIVO de la unidad móvil (no
// una foto: assets/aether_robot.png no existe todavía). Cada sistema señala
// su lugar físico con una línea guía.
const ROBOT = [
  "M792,600H1128Q1140,600 1140,612V698Q1140,710 1128,710H792Q780,710 780,698V612Q780,600 792,600Z",
  "M880,600V402",
  "M835,358H925V402H835Z",
  "M1100,600V505",
  "M1088,500A16,16 0 0 1 1112,500M1080,490A28,28 0 0 1 1120,490",
  "M700,768H1220",
].join("");
const WHEELS = [
  [850, 720],
  [1070, 720],
];
const LEADERS = [
  "M586,300H700L835,372", // percepción → cámara
  "M586,720H690L800,654", // computación → cómputo
  "M1334,330H1230L1106,500", // comunicación → antena
  "M1334,760H1230L1116,724", // movilidad → rueda
];

export const Integracion: React.FC<SceneProps> = ({ f, q }) => {
  const L27 = at(q, "L27");
  if (f < L27) return null;
  const draw = prog(f, L27 + 4, 36, Infinity, EASE_IN_OUT);
  const leaders = prog(f, L27 + 26, 20);
  const robotOut = prog(f, at(q, "L28") + 14, 24);
  // "Soy la integración…" → AETHER; al terminar la frase, la información sale del núcleo (clímax).
  const mark = prog(f, at(q, "L28") + 34, 30);
  const rows = prog(f, at(q, "L28e"), 20);
  const back = prog(f, at(q, "L29"), 30, Infinity, EASE_IN_OUT);
  const bloom = prog(f, at(q, "L28e"), 10) * (1 - prog(f, at(q, "L28e") + 10, 70));
  if (back >= 1) return null;
  return (
    <g>
      {robotOut < 1 && (
        <g opacity={1 - robotOut}>
          <path d={ROBOT} pathLength={1} strokeDasharray={`${draw} 1`} fill="none" stroke={C.ink} strokeOpacity={0.75} strokeWidth={1.6} strokeLinejoin="round" />
          <rect x={800} y={626} width={150} height={56} fill="none" stroke={C.ink} strokeOpacity={0.45 * draw} strokeDasharray="4 5" />
          <circle cx={912} cy={380} r={11} fill="none" stroke={C.amber} strokeOpacity={draw} strokeWidth={1.6} />
          {WHEELS.map(([x, y]) => (
            <g key={x} fill={C.bg} stroke={C.ink} strokeOpacity={0.75 * draw} strokeWidth={1.6}>
              <circle cx={x} cy={y} r={46} />
              <circle cx={x} cy={y} r={12} />
            </g>
          ))}
          {LEADERS.map((d, i) => (
            <path key={i} d={d} pathLength={1} strokeDasharray={`${leaders} 1`} fill="none" stroke={C.amber} strokeOpacity={0.65} strokeWidth={1.3} />
          ))}
        </g>
      )}
      {bloom > 0 && <circle cx={960} cy={540} r={520} fill="url(#bloom)" opacity={0.55 * bloom} />}
      {rows > 0 && (
        <g stroke={C.ink} strokeWidth={1.4} opacity={1 - back}>
          {[-44, 0, 44].map((dy, i) => {
            const p = Math.min(1, Math.max(0, rows * 1.4 - i * 0.18)) * (1 - back);
            return (
              <g key={dy} strokeOpacity={0.55}>
                <line x1={830} x2={830 - 380 * p} y1={540 + dy} y2={540 + dy} />
                <line x1={1090} x2={1090 + 380 * p} y1={540 + dy} y2={540 + dy} />
                {[0.35, 0.7].map((t) => (
                  <g key={t} opacity={p >= t ? 1 : 0}>
                    <line x1={830 - 380 * t} x2={830 - 380 * t} y1={540 + dy - 10} y2={540 + dy + 10} />
                    <line x1={1090 + 380 * t} x2={1090 + 380 * t} y1={540 + dy - 10} y2={540 + dy + 10} />
                  </g>
                ))}
              </g>
            );
          })}
        </g>
      )}
      {mark > 0 && <Word x={960} y={790} text="AETHER" size={76} weight={300} tracking={0.55} reveal={mark} opacity={1 - back} />}
    </g>
  );
};
