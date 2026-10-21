import { Easing } from "remotion";
import { noise2D } from "@remotion/noise";

// Todo se ancla a cues (frame en que ocurrió el evento real), nunca a segundos
// fijos. Un cue que todavía no ocurre vale Infinity.
export type Cues = Record<string, number>;

export const EASE = Easing.bezier(0.23, 1, 0.32, 1); // --ease-out del dashboard
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const MECH = Easing.bezier(0.2, 1.35, 0.4, 1); // inserción mecánica con rebote mínimo

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const fired = (f: number) => Number.isFinite(f);

/** Progreso 0..1 de una animación que empieza en `start` y dura `dur` frames.
 * Si el siguiente cue (`next`) llega antes de que termine, el resto se comprime
 * para acabar 6 frames después de él — sin saltos, desde el punto donde iba.
 * Si llega tarde, la animación ya terminó y el estado se sostiene. */
export function prog(frame: number, start: number, dur: number, next = Infinity, ease = EASE): number {
  if (!fired(start) || frame < start) return 0;
  const nat = (f: number) => ease(clamp01((f - start) / dur));
  if (!fired(next) || next >= start + dur || frame < next) return nat(frame);
  const p0 = nat(next);
  return p0 + (1 - p0) * EASE(clamp01((frame - next) / 6));
}

/** Respiración 0..1 periódica — mantiene vivo un estado sostenido. */
export const breath = (frame: number, period = 120, phase = 0) => 0.5 - 0.5 * Math.cos((2 * Math.PI * (frame + phase)) / period);

/** Ruido orgánico pero periódico (muestreo circular): se puede sostener sin saltos. */
export const loopNoise = (seed: string, frame: number, period = 240, r = 0.6) => {
  const a = (2 * Math.PI * frame) / period;
  return noise2D(seed, Math.cos(a) * r, Math.sin(a) * r);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frames transcurridos desde un cue (-Infinity si no ha ocurrido). */
export const since = (frame: number, cue: number) => (fired(cue) ? frame - cue : -Infinity);

/** Visibilidad de un acto: entra en `start`, sale cuando empieza el siguiente. */
export function actAlpha(frame: number, start: number, end: number, fadeIn = 15, fadeOut = 15): number {
  if (!fired(start) || frame < start) return 0;
  const a = clamp01((frame - start) / fadeIn);
  if (!fired(end) || frame < end) return EASE(a);
  return EASE(a) * (1 - EASE(clamp01((frame - end) / fadeOut)));
}
