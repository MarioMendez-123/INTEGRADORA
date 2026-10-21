import type { Cues } from "../lib/anim";

export type SceneProps = { f: number; q: Cues };
/** Frame del cue, o Infinity si todavía no ocurre. */
export const at = (q: Cues, id: string) => q[id] ?? Infinity;
/** Golpe 0→1→0 de `dur` frames a partir de un cue (acentos puntuales). */
export const bump = (f: number, start: number, dur = 24) => {
  const d = f - start;
  return Number.isFinite(start) && d >= 0 && d < dur ? Math.sin((Math.PI * d) / dur) : 0;
};
