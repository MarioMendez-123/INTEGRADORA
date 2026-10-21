import timeline from "../timeline.json";
import type { Cues } from "./lib/anim";

export const TIMELINE = timeline;
export const FPS = timeline.fps;
export const msToFrames = (ms: number) => Math.round((ms / 1000) * FPS);

export type Cue = (typeof timeline.cues)[number] & { durMs?: number; keyWordEndMs?: number; text?: string };
export const CUES = timeline.cues as Cue[];
export const CUE_BY_ID: Record<string, Cue> = Object.fromEntries(CUES.map((c) => [c.id, c]));

/** Cues del MP4 de referencia: medianas medidas en la Fase 0 (ver timeline.json).
 * Cada frase también tiene su fin (`L07e`), que en vivo llega con line-end. */
export const MEDIAN_CUES: Cues = Object.fromEntries(
  CUES.flatMap((c) => [[c.id, msToFrames(c.atMs)], ...(c.durMs ? [[`${c.id}e`, msToFrames(c.atMs + c.durMs)]] : [])]),
);
export const DURATION_FRAMES = msToFrames(timeline.durationMs);

/** Frames desde el inicio de la frase hasta el fin de su palabra clave. */
export const keyWord = (id: string) => msToFrames(CUE_BY_ID[id]?.keyWordEndMs ?? 0);
