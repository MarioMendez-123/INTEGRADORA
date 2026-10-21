import React from "react";
import { ChipGlyph, LensGlyph, SignalGlyph, WheelGlyph, Word } from "../components/primitives";
import { EASE_IN_OUT, MECH, lerp, prog } from "../lib/anim";
import { Key, track } from "../lib/track";
import { keyWord } from "../timeline";
import { C } from "../theme";
import { SceneProps, at } from "./types";

// Núcleo al centro (la apertura, ver Eye) y cuatro ranuras. Cada módulo
// encaja cuando se NOMBRA su sistema: el deslizamiento termina en el fin de
// la palabra, medido en el audio real (timeline.json → keyWordEndMs).
export const MW = 380;
export const MH = 104;
type M = { cue: string; word: string; slot: [number, number]; from: [number, number]; robot: [number, number]; Glyph: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> };
export const MODULES: M[] = [
  { cue: "L22", word: "PERCEPCIÓN", slot: [960, 250], from: [0, -230], robot: [430, 300], Glyph: LensGlyph },
  { cue: "L23", word: "COMPUTACIÓN", slot: [470, 540], from: [-260, 0], robot: [430, 720], Glyph: ChipGlyph },
  { cue: "L24", word: "COMUNICACIÓN", slot: [1450, 540], from: [260, 0], robot: [1490, 330], Glyph: SignalGlyph },
  { cue: "L25", word: "MOVILIDAD", slot: [960, 830], from: [0, 230], robot: [1490, 760], Glyph: WheelGlyph },
];
const SLIDE = 16;

type Pose = { x: number; y: number; alpha: number; s: number; label: number };

export const Arquitectura: React.FC<SceneProps> = ({ f, q }) => {
  const L21 = at(q, "L21");
  if (f < L21) return null;
  const slotsIn = prog(f, L21 + 16, 24);
  const slotsOut = prog(f, at(q, "L27"), 16);
  const end = prog(f, at(q, "L32"), 20);
  if (end >= 1) return null;
  return (
    <g opacity={1 - end}>
      {/* ranuras vacías y rieles al núcleo */}
      {slotsIn > 0 && slotsOut < 1 && (
        <g opacity={slotsIn * (1 - slotsOut)}>
          {MODULES.map((m) => {
            const [x, y] = m.slot;
            const toCore = x === 960 ? [x, y + (y < 540 ? MH / 2 : -MH / 2), x, y < 540 ? 540 - 100 : 540 + 100] : [x + (x < 960 ? MW / 2 : -MW / 2), y, x < 960 ? 960 - 110 : 960 + 110, y];
            return (
              <g key={m.word} fill="none" stroke={C.ink}>
                <rect x={x - MW / 2} y={y - MH / 2} width={MW} height={MH} strokeOpacity={0.22} strokeDasharray="6 7" />
                <line x1={toCore[0]} y1={toCore[1]} x2={toCore[2]} y2={toCore[3]} strokeOpacity={0.2} strokeDasharray="3 6" />
              </g>
            );
          })}
        </g>
      )}
      {MODULES.map((m) => {
        const c = at(q, m.cue);
        const land = c + keyWord(m.cue); // fin de la palabra
        const keys: Key<Pose>[] = [
          { cue: m.cue, dur: 1, to: { x: m.slot[0] + m.from[0], y: m.slot[1] + m.from[1], alpha: 0, s: 1, label: 0 } },
          { cue: m.cue, delay: keyWord(m.cue) - SLIDE, dur: SLIDE, to: { x: m.slot[0], y: m.slot[1], alpha: 1 }, ease: MECH },
          { cue: m.cue, delay: keyWord(m.cue) - 6, dur: 16, to: { label: 1 } },
          // INTEGRACIÓN
          m.cue === "L22" ? { cue: "L26", dur: 20, to: { s: 1.08 } } : { cue: "L26", dur: 20, to: { alpha: 0.22 } },
          { cue: "L27", dur: 32, to: { x: m.robot[0], y: m.robot[1], alpha: 1, s: 0.82 }, ease: EASE_IN_OUT },
          { cue: "L28", delay: 18, dur: 30, to: { x: 960, y: 540, s: 0.18, alpha: 0 }, ease: EASE_IN_OUT },
          // EXPOSITOR: la arquitectura tenue, de fondo.
          { cue: "await", delay: 30, dur: 1, to: { x: m.slot[0], y: m.slot[1], s: 1, label: 1, alpha: 0 } },
          { cue: "await", delay: 31, dur: 70, to: { alpha: 0.11 } },
          { cue: "heard", dur: 10, to: { alpha: 0.24 } },
          { cue: "heard", delay: 14, dur: 36, to: { alpha: 0.12 } },
        ];
        const p = track<Pose>(f, q, { x: m.slot[0], y: m.slot[1], alpha: 0, s: 1, label: 0 }, keys);
        if (p.alpha <= 0.001) return null;
        const lit = Number.isFinite(land) ? 1 - prog(f, land, 40) : 0;
        const connector = prog(f, land - 2, 10);
        return (
          <g key={m.word} opacity={p.alpha}>
            {connector > 0 && lit > 0 && <Connector m={m} lit={lit} />}
            <g transform={`translate(${p.x},${p.y}) scale(${p.s})`}>
              <rect x={-MW / 2} y={-MH / 2} width={MW} height={MH} fill={C.blade} stroke={lit > 0.3 ? C.amber : C.ink} strokeOpacity={lerp(0.7, 1, lit)} strokeWidth={1.6} />
              <m.Glyph x={-MW / 2 + 52} y={0} s={1.35} color={lit > 0.3 ? C.amber : C.ink} />
              <Word x={-MW / 2 + 96} y={9} text={m.word} size={25} weight={500} tracking={0.16} reveal={p.label} anchor="start" />
            </g>
          </g>
        );
      })}
    </g>
  );
};

/** Riel que se enciende en ámbar cuando el módulo encaja. */
const Connector: React.FC<{ m: M; lit: number }> = ({ m, lit }) => {
  const [x, y] = m.slot;
  const pts = x === 960 ? [x, y + (y < 540 ? MH / 2 : -MH / 2), x, y < 540 ? 440 : 640] : [x + (x < 960 ? MW / 2 : -MW / 2), y, x < 960 ? 850 : 1070, y];
  return <line x1={pts[0]} y1={pts[1]} x2={pts[2]} y2={pts[3]} stroke={C.amber} strokeWidth={1.8} opacity={0.85 * lit} />;
};
