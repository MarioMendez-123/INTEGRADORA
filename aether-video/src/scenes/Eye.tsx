import React from "react";
import { Aperture } from "../components/Aperture";
import { Word } from "../components/primitives";
import { EASE_IN_OUT, breath, prog } from "../lib/anim";
import { track } from "../lib/track";
import { C } from "../theme";
import { SceneProps, at, bump } from "./types";

// La apertura: identidad visual que atraviesa todo el video. Un solo elemento
// persistente; cada cue real lo lleva a una nueva pose desde donde iba.
type Pose = { cx: number; cy: number; R: number; open: number; glow: number; alpha: number; frameDraw: number; blades: number; twist: number; frameAlpha: number };
const INIT: Pose = { cx: 960, cy: 540, R: 150, open: 1, glow: 0, alpha: 1, frameDraw: 0, blades: 0, twist: -34, frameAlpha: 1 };
const HIDE = { alpha: 0 };

export const Eye: React.FC<SceneProps> = ({ f, q }) => {
  const p = track<Pose>(f, q, INIT, [
    // DESPERTAR: la línea de luz llega (28 f), el hexágono se cierra, las hojas entran.
    { cue: "wake", delay: 26, dur: 40, to: { frameDraw: 1 } },
    { cue: "wake", delay: 62, dur: 42, to: { open: 0, blades: 1, glow: 0.55 }, ease: EASE_IN_OUT },
    { cue: "start", dur: 40, to: { glow: 0.75 } },
    { cue: "L03", dur: 36, to: { open: 0.1 } },
    // OBSERVACIÓN: "Yo observo." — el ojo se abre y se vuelve el visor.
    { cue: "L04", dur: 22, to: { open: 1, glow: 0.5 }, ease: EASE_IN_OUT },
    { cue: "L04", delay: 18, dur: 30, to: { open: 1, R: 640, frameAlpha: 0, blades: 0, glow: 0 }, ease: EASE_IN_OUT },
    { cue: "L04", delay: 48, dur: 4, to: HIDE },
    // ARQUITECTURA: vuelve como núcleo.
    { cue: "L21", dur: 1, to: { R: 60, open: 0.15, blades: 1, frameAlpha: 1, glow: 0.8, alpha: 0 } },
    { cue: "L21", delay: 12, dur: 26, to: { R: 90, alpha: 1 } },
    { cue: "L26", dur: 20, to: { alpha: 0.35, glow: 0.35 } },
    { cue: "L27", dur: 16, to: HIDE },
    { cue: "L28", delay: 24, dur: 30, to: { alpha: 1, R: 120, open: 0.28, glow: 1 } },
    { cue: "L28e", dur: 24, to: { open: 0.5 } },
    // PREGUNTA: todo se retira al núcleo; se cierra.
    { cue: "L29", dur: 40, to: { open: 0, R: 80, glow: 0.75 }, ease: EASE_IN_OUT },
    // INTERACCIÓN
    { cue: "L30", dur: 24, to: { open: 0.22 } },
    { cue: "L31", dur: 60, to: { open: 0.32, twist: -70 }, ease: EASE_IN_OUT },
    { cue: "L32", dur: 20, to: { open: 1, glow: 0.5 }, ease: EASE_IN_OUT },
    { cue: "L32", delay: 14, dur: 32, to: { open: 1, R: 820, frameAlpha: 0, blades: 0, glow: 0 }, ease: EASE_IN_OUT },
    { cue: "L32", delay: 46, dur: 4, to: HIDE },
    // EVOLUCIÓN: vuelve a la izquierda, observando.
    { cue: "C1", dur: 1, to: { cx: 330, R: 60, open: 0.4, blades: 1, frameAlpha: 1, glow: 0.8, twist: -34, alpha: 0 } },
    { cue: "C1", delay: 14, dur: 26, to: { R: 110, alpha: 1 } },
    { cue: "C3", dur: 20, to: HIDE },
    // CIERRE: las marcas forman el hexágono; el ojo aparece debajo y se abre con luz.
    { cue: "C4", delay: 40, dur: 1, to: { cx: 960, R: 170, open: 1, blades: 0, glow: 0.35, frameAlpha: 1 } },
    { cue: "C4", delay: 44, dur: 16, to: { alpha: 1 } },
    { cue: "C5", dur: 14, to: { open: 0, blades: 1 }, ease: EASE_IN_OUT },
    { cue: "C5", delay: 16, dur: 40, to: { open: 0.62, glow: 1 }, ease: EASE_IN_OUT },
    { cue: "silence", dur: 6, to: HIDE },
    // TARJETA
    { cue: "card", dur: 1, to: { cy: 420, R: 44, open: 0, blades: 1, glow: 0.9 } },
    { cue: "card", delay: 6, dur: 24, to: { alpha: 1 } },
    { cue: "card", delay: 150, dur: 45, to: HIDE },
  ]);
  if (p.alpha <= 0.001) return <LightLine f={f} wake={at(q, "wake")} />;

  const b = breath(f, 120);
  const pulse = 0.35 * bump(f, at(q, "L01"), 26) + 0.55 * bump(f, at(q, "heard"), 30) + 0.2 * bump(f, at(q, "L02"), 26);
  const heard = at(q, "heard");
  const ripple = prog(f, heard, 42);
  return (
    <g opacity={p.alpha}>
      <LightLine f={f} wake={at(q, "wake")} />
      {ripple > 0 && ripple < 1 && <circle cx={p.cx} cy={p.cy} r={p.R + ripple * 200} fill="none" stroke={C.amber} strokeWidth={1.5} opacity={0.6 * (1 - ripple)} />}
      <Aperture
        cx={p.cx}
        cy={p.cy}
        R={p.R + 1.5 * b}
        open={p.open}
        twist={p.twist}
        frameDraw={p.frameDraw}
        bladesAlpha={p.blades}
        glow={Math.min(1, p.glow * (0.88 + 0.12 * b) + pulse)}
        frameAlpha={p.frameAlpha}
      />
      <Wordmark f={f} q={q} cx={p.cx} cy={p.cy + 250} />
    </g>
  );
};

/** DESPERTAR: una línea de luz horizontal se cierra desde los bordes hasta los
 * vértices laterales de la apertura. */
const LightLine: React.FC<{ f: number; wake: number }> = ({ f, wake }) => {
  const head = prog(f, wake, 28, Infinity, EASE_IN_OUT);
  const tail = prog(f, wake + 12, 30, Infinity, EASE_IN_OUT);
  if (head <= 0 || tail >= 1) return null;
  const L = 810; // vértice izquierdo del hexágono (960 - 150)
  const segs = [
    [tail * L, head * L],
    [1920 - head * L, 1920 - tail * L],
  ];
  return (
    <g>
      {segs.map(([a, b], i) => (
        <g key={i}>
          <line x1={a} x2={b} y1={540} y2={540} stroke={C.amber} strokeWidth={7} opacity={0.12} />
          <line x1={a} x2={b} y1={540} y2={540} stroke={C.ink} strokeWidth={1.6} />
        </g>
      ))}
    </g>
  );
};

/** "Mi nombre es Aether." — la marca aparece bajo la apertura y se retira al observar. */
const Wordmark: React.FC<SceneProps & { cx: number; cy: number }> = ({ f, q, cx, cy }) => {
  const inP = prog(f, at(q, "L02") + 6, 34);
  const out = prog(f, at(q, "L04"), 14);
  const a = inP * (1 - out);
  if (a <= 0) return null;
  return <Word x={cx} y={cy} text="AETHER" size={40} weight={300} tracking={0.9 - 0.3 * inP} reveal={inP} opacity={a} />;
};
