import React from "react";
import { hexPoints, toPath } from "../components/Aperture";
import { BarcodeGlyph, LensGlyph, LocateGlyph, RecordGlyph, VerifyGlyph, Word } from "../components/primitives";
import { EASE_IN_OUT, breath, lerp, prog } from "../lib/anim";
import { track } from "../lib/track";
import { C } from "../theme";
import { SceneProps, at } from "./types";

const Y = 540;
const STEPS = [
  { x: 240, cue: "L15", word: "PERCIBIR", Glyph: LensGlyph },
  { x: 600, cue: "L16", word: "IDENTIFICAR", Glyph: BarcodeGlyph },
  { x: 960, cue: "L17", word: "VERIFICAR", Glyph: VerifyGlyph },
  { x: 1320, cue: "L18", word: "LOCALIZAR", Glyph: LocateGlyph },
  { x: 1680, cue: "L19", word: "REGISTRAR", Glyph: RecordGlyph },
];
const R = 46;

export const Proceso: React.FC<SceneProps> = ({ f, q }) => {
  const L14 = at(q, "L14");
  const g = track(f, q, { dy: 0, s: 1, alpha: 1 }, [
    { cue: "L20", dur: 32, to: { dy: -170, s: 0.8 }, ease: EASE_IN_OUT },
    { cue: "L21", dur: 20, to: { alpha: 0 } },
  ]);
  if (f < L14 || g.alpha <= 0.001) return null;
  // "Por eso, mi proceso no termina…" — la línea de la cadena se vuelve el eje.
  const axis = prog(f, L14 + 8, 34, Infinity, EASE_IN_OUT);
  const slots = prog(f, L14 + 30, 20);
  const done = prog(f, at(q, "L19e"), 20);
  return (
    <g opacity={g.alpha} transform={`translate(960,${Y + g.dy}) scale(${g.s}) translate(-960,${-Y})`}>
      <line x1={240} x2={240 + 1440 * axis} y1={Y} y2={Y} stroke={C.ink} strokeOpacity={0.35 + 0.25 * done} strokeWidth={1.5} />
      {STEPS.map((s, i) => {
        const c = at(q, s.cue);
        const hex = prog(f, c, 12);
        const glyph = prog(f, c + 3, 10);
        const word = prog(f, c + 1, 14);
        const hot = hex > 0 ? 1 - prog(f, c + 22, 34) : 0; // ámbar al nombrarse, luego blanco
        const ring = prog(f, c, 18);
        return (
          <g key={s.word}>
            {hex <= 0 && <circle cx={s.x} cy={Y} r={4} fill={C.bg} stroke={C.ink} strokeOpacity={0.45 * slots} />}
            {hex > 0 && (
              <g>
                {ring < 1 && <path d={toPath(hexPoints(s.x, Y, R + ring * 34))} fill="none" stroke={C.amber} strokeWidth={1.4} opacity={0.7 * (1 - ring)} />}
                <path
                  d={toPath(hexPoints(s.x, Y, R * lerp(0.86, 1, hex)))}
                  pathLength={1}
                  strokeDasharray={`${hex} 1`}
                  fill={C.bg}
                  stroke={hot > 0.02 ? C.amber : C.ink}
                  strokeOpacity={lerp(0.75, 1, hot)}
                  strokeWidth={1.8}
                />
                <s.Glyph x={s.x} y={Y} s={1.25} opacity={glyph} color={hot > 0.5 ? C.amber : C.ink} />
                <Word x={s.x} y={Y + R + 58} text={s.word} size={27} weight={500} tracking={0.24} reveal={word} color={C.ink} opacity={lerp(0.85, 1, hot)} />
              </g>
            )}
          </g>
        );
      })}
      {/* Tras REGISTRAR: un pulso recorre el proceso completo. */}
      {done > 0 && done < 1 && <circle cx={240 + 1440 * done} cy={Y} r={4} fill={C.amber} opacity={Math.sin(Math.PI * done)} />}
      {g.dy !== 0 && <circle cx={240 + ((f % 90) / 90) * 1440} cy={Y} r={2.5} fill={C.amber} opacity={0.35 * breath(f, 90)} />}
    </g>
  );
};
