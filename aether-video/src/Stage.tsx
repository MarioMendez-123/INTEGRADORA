import React from "react";
import { AbsoluteFill } from "remotion";
import { prog } from "./lib/anim";
import type { Cues } from "./lib/anim";
import { Arquitectura } from "./scenes/Arquitectura";
import { Cierre } from "./scenes/Cierre";
import { Demo } from "./scenes/Demo";
import { Evolucion } from "./scenes/Evolucion";
import { Eye } from "./scenes/Eye";
import { Integracion } from "./scenes/Integracion";
import { Labels } from "./scenes/Labels";
import { Observacion } from "./scenes/Observacion";
import { Problema } from "./scenes/Problema";
import { Proceso } from "./scenes/Proceso";
import { Revelacion } from "./scenes/Revelacion";
import { at } from "./scenes/types";
import { C, H, W } from "./theme";

/** Escenario completo. `f` = frame actual; `q` = frame de cada cue (Infinity
 * si todavía no ocurre). Lo usan igual el MP4 (medianas) y el reproductor en
 * vivo (eventos reales de Lumina). */
export const Stage: React.FC<{ f: number; q: Cues }> = ({ f, q }) => {
  const grid = 0.05 * prog(f, at(q, "wake") + 60, 90) * (1 - prog(f, at(q, "silence"), 6));
  const props = { f, q };
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <pattern id="grid" width={60} height={60} patternUnits="userSpaceOnUse" x={0} y={0}>
            <path d="M60,0H0V60" fill="none" stroke={C.ink} strokeWidth={1} />
          </pattern>
          <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor={C.bgDeep} stopOpacity={0} />
            <stop offset="100%" stopColor={C.bgDeep} stopOpacity={0.85} />
          </radialGradient>
          <radialGradient id="bloom">
            <stop offset="0%" stopColor={C.amber} stopOpacity={0.55} />
            <stop offset="40%" stopColor={C.amber} stopOpacity={0.12} />
            <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
          </radialGradient>
        </defs>
        {grid > 0 && <rect width={W} height={H} fill="url(#grid)" opacity={grid} />}
        <Observacion {...props} />
        <Problema {...props} />
        <Proceso {...props} />
        <Revelacion {...props} />
        <Integracion {...props} />
        <Arquitectura {...props} />
        <Demo {...props} />
        <Evolucion {...props} />
        <Cierre {...props} />
        <Eye {...props} />
        <Labels {...props} />
        <rect width={W} height={H} fill="url(#vignette)" pointerEvents="none" />
      </svg>
    </AbsoluteFill>
  );
};
