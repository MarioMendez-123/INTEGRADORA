import React from "react";
import { Brackets } from "../components/primitives";
import { EASE_IN_OUT, breath, lerp, prog } from "../lib/anim";
import { C } from "../theme";
import { SceneProps, at } from "./types";

/** Región del feed real de la cámara: 1440×810 centrada. El interior queda
 * vacío a propósito — aquí NO se simula ninguna detección. */
export const DEMO = { x: 240, y: 135, w: 1440, h: 810 };

export const DemoFrame: React.FC<{ alpha?: number; live?: number }> = ({ alpha = 1, live = 1 }) => (
  <g opacity={alpha}>
    <rect x={DEMO.x} y={DEMO.y} width={DEMO.w} height={DEMO.h} fill="none" stroke={C.ink} strokeOpacity={0.16} strokeWidth={1.2} />
    <Brackets {...DEMO} x={DEMO.x - 14} y={DEMO.y - 14} w={DEMO.w + 28} h={DEMO.h + 28} len={64} width={2.2} />
    <circle cx={DEMO.x + DEMO.w - 30} cy={DEMO.y - 40} r={5} fill={C.amber} opacity={live} />
  </g>
);

export const Demo: React.FC<SceneProps> = ({ f, q }) => {
  const L31 = at(q, "L31");
  if (f < L31) return null;
  const hint = prog(f, L31, 40) * (1 - prog(f, at(q, "L32") + 20, 10));
  const grow = prog(f, at(q, "L32") + 14, 30, Infinity, EASE_IN_OUT);
  const shrink = prog(f, at(q, "C1"), 26, Infinity, EASE_IN_OUT);
  if (shrink >= 1) return null;
  const t = grow * (1 - shrink);
  const cx = lerp(shrink > 0 ? 330 : 960, 960, t);
  const w = lerp(260, DEMO.w, t);
  const h = lerp(226, DEMO.h, t);
  const live = f >= at(q, "camera") ? 0.35 + 0.65 * breath(f, 60) : 0;
  return (
    <g>
      {hint > 0 && <rect x={DEMO.x} y={DEMO.y} width={DEMO.w} height={DEMO.h} fill="none" stroke={C.ink} strokeOpacity={0.07 * hint} strokeDasharray="8 10" />}
      {t > 0 && (
        <g transform={`translate(${cx},540) scale(${w / DEMO.w},${h / DEMO.h}) translate(-960,-540)`}>
          <DemoFrame alpha={Math.min(1, t * 1.5)} live={live * (1 - shrink)} />
        </g>
      )}
    </g>
  );
};
