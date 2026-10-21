import React from "react";
import { loopNoise, prog } from "../lib/anim";
import { C } from "../theme";
import { SceneProps, at } from "./types";

// Ver ≠ comprender. Desde la caja de detección (borde derecho en x=606, y=540)
// crece una cadena de nodos VACÍOS: identidad, ubicación, confiabilidad.
// Nada se llena aquí: son las preguntas sin respuesta.
const Y = 540;
const NODES = [
  { cx: 1110, cue: "L11" }, // ¿qué es?
  { cx: 1370, cue: "L12" }, // ¿dónde está?
  { cx: 1630, cue: "L13" }, // ¿es confiable?
];
const HALF = 70;

const Link: React.FC<{ x1: number; x2: number; p: number; broken?: boolean; f: number }> = ({ x1, x2, p, broken, f }) => {
  if (p <= 0) return null;
  const x = x1 + (x2 - x1) * p;
  if (!broken) return <line x1={x1} x2={x} y1={Y} y2={Y} stroke={C.ink} strokeOpacity={0.55} strokeWidth={1.4} />;
  const mid = (x1 + x2) / 2;
  const gap = 16 + 6 * loopNoise("gap", f, 60);
  return (
    <g stroke={C.ink} strokeOpacity={0.55} strokeWidth={1.4}>
      <line x1={x1} x2={Math.min(x, mid - gap)} y1={Y} y2={Y} />
      {x > mid + gap && <line x1={mid + gap} x2={x} y1={Y + 2 * loopNoise("tilt", f, 40)} y2={Y} />}
    </g>
  );
};

export const Problema: React.FC<SceneProps> = ({ f, q }) => {
  const out = prog(f, at(q, "L14"), 22);
  if (f < at(q, "L10") || out >= 1) return null;
  const a = 1 - out;
  const link0 = prog(f, at(q, "L10") + 8, 18);
  const nodeP = NODES.map((n) => prog(f, at(q, n.cue), 16));
  const flick = (seed: string, period = 45) => 0.5 + 0.5 * loopNoise(seed, f, period);

  return (
    <g opacity={a}>
      <Link x1={606} x2={NODES[0].cx - HALF} p={link0} f={f} />
      <Link x1={NODES[0].cx + HALF} x2={NODES[1].cx - HALF} p={prog(f, at(q, "L12") - 2, 12)} f={f} />
      <Link x1={NODES[1].cx + HALF} x2={NODES[2].cx - HALF} p={prog(f, at(q, "L13") - 2, 12)} broken f={f} />
      {NODES.map((n, i) => {
        const p = nodeP[i];
        if (p <= 0) return null;
        const x = n.cx - HALF;
        return (
          <g key={i} opacity={p} transform={`translate(${n.cx},${Y}) scale(${0.9 + 0.1 * p}) translate(${-n.cx},${-Y})`}>
            <rect x={x} y={Y - HALF} width={2 * HALF} height={2 * HALF} fill={C.bg} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1.3} strokeDasharray={i === 2 ? "5 6" : undefined} />
            {i === 0 && (
              // Identidad desconocida: barras de código sin resolver.
              <g stroke={C.ink} strokeOpacity={0.18 + 0.2 * flick("id")}>
                {[-36, -24, -15, -3, 8, 20, 33].map((dx, k) => (
                  <line key={k} x1={n.cx + dx} x2={n.cx + dx} y1={Y - 28} y2={Y + 28} strokeWidth={k % 3 === 0 ? 4 : 1.6} strokeDasharray="4 5" />
                ))}
              </g>
            )}
            {i === 1 && (
              // Ubicación incierta: la marca no se asienta en la rejilla.
              <g>
                <g stroke={C.ink} strokeOpacity={0.22}>
                  {[-40, -20, 0, 20, 40].map((dx) => (
                    <line key={dx} x1={n.cx + dx * 0.6} x2={n.cx + dx} y1={Y - 20} y2={Y + 40} />
                  ))}
                  {[-20, 0, 20, 40].map((dy) => (
                    <line key={dy} x1={n.cx - 44} x2={n.cx + 44} y1={Y + dy} y2={Y + dy} />
                  ))}
                </g>
                <ellipse cx={n.cx} cy={Y + 12} rx={34 + 4 * flick("ell", 60)} ry={13} fill="none" stroke={C.amber} strokeOpacity={0.5} strokeDasharray="3 4" />
                <circle cx={n.cx + 16 * loopNoise("px", f, 90)} cy={Y + 12 + 5 * loopNoise("py", f, 90)} r={4} fill={C.amber} opacity={0.8} />
              </g>
            )}
            {i === 2 && (
              // Confiabilidad sin verificar: marca vacía, sin comprobación.
              <g fill="none" stroke={C.ink} strokeOpacity={0.3 + 0.15 * flick("rel")}>
                <rect x={n.cx - 30} y={Y - 30} width={60} height={60} strokeWidth={1.4} />
                <rect x={n.cx - 18} y={Y - 18} width={36} height={36} strokeDasharray="4 4" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
