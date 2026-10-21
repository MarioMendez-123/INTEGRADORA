import React from "react";
import { AbsoluteFill } from "remotion";
import type { Cues } from "./lib/anim";
import { CUES, FPS } from "./timeline";
import { C, F } from "./theme";

const tc = (frame: number) => {
  const f = Math.floor(frame);
  const s = Math.floor(f / FPS);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f % FPS)}`;
};

/** Capa de la versión de ENSAYO: timecode, cue en curso y la frase que se
 * dice (Aether o expositor). Nunca va en la versión de escenario. */
export const Rehearsal: React.FC<{ f: number; q: Cues }> = ({ f, q }) => {
  const fired = CUES.filter((c) => (q[c.id] ?? Infinity) <= f);
  const last = fired[fired.length - 1];
  const spoken = [...fired].reverse().find((c) => c.text && f <= q[c.id] + Math.round((((c as { durMs?: number }).durMs ?? 2500) / 1000) * FPS) + 20);
  const who = spoken && ("speaker" in spoken && spoken.speaker === "expositor" ? "EXPOSITOR" : "AETHER");
  return (
    <AbsoluteFill style={{ fontFamily: F.mono, color: C.ink, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 28, left: 32, fontSize: 26, letterSpacing: "0.04em", opacity: 0.9 }}>
        {tc(f)} <span style={{ color: C.amber }}>· {last ? last.id : "—"}</span> <span style={{ opacity: 0.6 }}>· {last ? last.act : ""}</span>
      </div>
      <div style={{ position: "absolute", top: 30, right: 32, fontSize: 18, letterSpacing: "0.12em", color: C.amber }}>ENSAYO · NO PROYECTAR</div>
      {spoken && (
        <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, textAlign: "center" }}>
          <span style={{ background: "rgba(0,0,0,0.72)", padding: "10px 22px", fontSize: 30, lineHeight: 1.5 }}>
            <span style={{ color: who === "AETHER" ? C.amber : C.inkDim }}>{who} › </span>
            {spoken.text}
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
