import React from "react";
import { Brackets } from "../components/primitives";
import { EASE_IN_OUT, MECH, lerp, prog } from "../lib/anim";
import { track } from "../lib/track";
import { C } from "../theme";
import { SceneProps, at } from "./types";

export const VF = { x: 240, y: 135, w: 1440, h: 810 };

// Anaquel en proyección oblicua (esquema, no una foto): cajas sobre tres niveles.
const D = { dx: 14, dy: -10 };
type Box = { x0: number; x1: number; base: number; h: number };
const BOXES: Box[] = [
  { x0: 600, x1: 720, base: 450, h: 110 },
  { x0: 745, x1: 835, base: 450, h: 76 },
  { x0: 1150, x1: 1320, base: 450, h: 130 },
  { x0: 600, x1: 760, base: 670, h: 140 },
  { x0: 1170, x1: 1310, base: 670, h: 90 },
  { x0: 620, x1: 880, base: 905, h: 150 },
  { x0: 1000, x1: 1110, base: 905, h: 96 },
  { x0: 1160, x1: 1330, base: 905, h: 170 },
];
/** El único objeto sobre el que se cierra la mira. */
export const TARGET: Box = { x0: 900, x1: 1040, base: 670, h: 118 };
export const TARGET_RECT = { x: TARGET.x0 - 12, y: TARGET.base - TARGET.h - 12, w: TARGET.x1 - TARGET.x0 + 24, h: TARGET.h + 24 };

const boxPath = ({ x0, x1, base, h }: Box) => {
  const t = base - h;
  const lx = x0 + (x1 - x0) * 0.25;
  const ly = t + h * 0.45;
  return [
    `M${x0},${base}V${t}H${x1}V${base}Z`,
    `M${x0},${t}L${x0 + D.dx},${t + D.dy}H${x1 + D.dx}L${x1},${t}`,
    `M${x1 + D.dx},${t + D.dy}V${base + D.dy}L${x1},${base}`,
    `M${lx},${ly}H${lx + (x1 - x0) * 0.35}`, // etiqueta del producto
  ].join("");
};
const SHELF = [
  "M560,905V250H1360V905",
  "M560,450H1360M560,670H1360M540,905H1380",
  "M560,250L588,230H1388L1360,250M1388,230V885L1360,905",
].join("");

/** Traza una ruta progresivamente (pathLength normalizado). */
const Drawn: React.FC<{ d: string; p: number; stroke?: string; width?: number; opacity?: number }> = ({ d, p, stroke = C.ink, width = 1.5, opacity = 1 }) =>
  p <= 0 ? null : <path d={d} pathLength={1} strokeDasharray={`${p} 1`} fill="none" stroke={stroke} strokeWidth={width} opacity={opacity} strokeLinejoin="round" />;

export const Observacion: React.FC<SceneProps> = ({ f, q }) => {
  const L04 = at(q, "L04");
  // El visor completo se reduce a la izquierda en PROBLEMA y desaparece en SOLUCIÓN.
  const g = track(f, q, { s: 1, tx: 0, ty: 0, alpha: 0, dim: 0 }, [
    { cue: "L04", delay: 12, dur: 20, to: { alpha: 1 } },
    { cue: "L09", dur: 34, to: { s: 0.5, tx: -400, ty: -35, dim: 1 }, ease: EASE_IN_OUT },
    { cue: "L14", dur: 22, to: { alpha: 0 } },
  ]);
  if (g.alpha <= 0.001) return null;

  const open = prog(f, L04 + 10, 26, Infinity, EASE_IN_OUT);
  const br = {
    x: lerp(810, VF.x, open),
    y: lerp(410, VF.y, open),
    w: lerp(300, VF.w, open),
    h: lerp(260, VF.h, open),
  };
  const ruler = prog(f, at(q, "L05"), 44);
  const drawShelf = prog(f, at(q, "L06"), 34);
  const drawBoxes = prog(f, at(q, "L06") + 14, 40);
  const lock = prog(f, at(q, "L07"), 18, at(q, "L08"), MECH);
  const processing = prog(f, at(q, "L08"), 12) * (1 - prog(f, at(q, "L10"), 12));
  const detected = prog(f, at(q, "L10"), 14);
  const scanY = VF.y + ((f % 150) / 150) * VF.h;
  const tr = TARGET_RECT;
  const lockRect = { x: lerp(VF.x + 60, tr.x, lock), y: lerp(VF.y + 60, tr.y, lock), w: lerp(VF.w - 120, tr.w, lock), h: lerp(VF.h - 120, tr.h, lock) };

  return (
    <g opacity={g.alpha} transform={`translate(${960 + g.tx},${540 + g.ty}) scale(${g.s}) translate(-960,-540)`}>
      <rect x={VF.x} y={VF.y} width={VF.w} height={VF.h} fill="none" stroke={C.ink} strokeOpacity={0.1 * open} strokeWidth={1.2 / g.s} />
      <Brackets {...br} len={70} width={2.2 / g.s} />
      {open >= 1 && <line x1={VF.x + 1} x2={VF.x + VF.w - 1} y1={scanY} y2={scanY} stroke={C.ink} strokeOpacity={0.07 * (1 - g.dim)} />}
      <path d={`M954,540H966M960,534V546`} stroke={C.ink} strokeOpacity={0.3 * open * (1 - g.dim)} />
      {/* reglas del visor */}
      <g stroke={C.ink} strokeOpacity={0.28 * (1 - g.dim)}>
        {Array.from({ length: 37 }, (_, i) => VF.x + i * 40)
          .filter((x) => (x - VF.x) / VF.w <= ruler)
          .map((x, i) => (
            <line key={i} x1={x} x2={x} y1={VF.y + 10} y2={VF.y + (i % 5 === 0 ? 24 : 16)} />
          ))}
        {Array.from({ length: 21 }, (_, i) => VF.y + i * 40)
          .filter((y) => (y - VF.y) / VF.h <= ruler)
          .map((y, i) => (
            <line key={i} x1={VF.x + 10} x2={VF.x + (i % 5 === 0 ? 24 : 16)} y1={y} y2={y} />
          ))}
      </g>
      {/* "Una imagen aparece." */}
      <g opacity={lerp(1, 0.28, g.dim)}>
        <Drawn d={SHELF} p={drawShelf} opacity={0.6} />
        {BOXES.map((b, i) => (
          <Drawn key={i} d={boxPath(b)} p={Math.min(1, Math.max(0, drawBoxes * 1.6 - i * 0.08))} opacity={0.55} width={1.3} />
        ))}
      </g>
      <Drawn d={boxPath(TARGET)} p={Math.min(1, Math.max(0, drawBoxes * 1.6 - 0.3))} opacity={lerp(0.55, 0.95, lock)} width={1.4} />
      {/* "Encuentro algo." — la mira se cierra sobre UN objeto */}
      {lock > 0 && (
        <g opacity={1 - detected}>
          <Brackets {...lockRect} len={26} color={C.amber} width={2.4 / g.s} />
          <circle cx={tr.x + tr.w / 2} cy={tr.y + tr.h / 2} r={3.5} fill={C.amber} opacity={lock} />
        </g>
      )}
      {/* "Intento identificarlo." — procesamiento sobre el contorno */}
      {processing > 0 && (
        <g opacity={processing}>
          <rect x={tr.x + 6} y={tr.y + 6} width={tr.w - 12} height={tr.h - 12} fill="none" stroke={C.amber} strokeWidth={1.3} strokeDasharray="6 10" strokeDashoffset={-(f % 16) * 1.0} opacity={0.8} />
          <line x1={tr.x + 8 + ((f % 40) / 40) * (tr.w - 16)} x2={tr.x + 8 + ((f % 40) / 40) * (tr.w - 16)} y1={tr.y + 8} y2={tr.y + tr.h - 8} stroke={C.amber} strokeWidth={1.2} opacity={0.55} />
        </g>
      )}
      {/* PROBLEMA: "Una cámara puede detectar un objeto." — caja de detección */}
      {detected > 0 && (
        <path d={`M${tr.x},${tr.y}H${tr.x + tr.w}V${tr.y + tr.h}H${tr.x}Z`} pathLength={1} strokeDasharray={`${detected} 1`} fill="none" stroke={C.amber} strokeWidth={2.4 / g.s} />
      )}
    </g>
  );
};
