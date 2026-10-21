import { EASE, fired, lerp, prog } from "./anim";
import type { Cues } from "./anim";

/** Pista de un elemento persistente: cada llave se activa con un cue real
 * (más un retraso opcional) y lleva el estado, desde donde iba en ese
 * momento, hacia `to`. Si un cue llega antes de que termine la anterior,
 * parte desde el punto exacto en que iba (sin saltos). Si llega tarde, el
 * último estado se sostiene. */
export type Key<T> = { cue: string; delay?: number; dur: number; to: Partial<T>; ease?: (t: number) => number };

export function track<T extends Record<string, number>>(f: number, q: Cues, init: T, keys: Key<T>[]): T {
  const active = keys
    .map((k) => ({ k, at: (q[k.cue] ?? Infinity) + (k.delay ?? 0) }))
    .filter(({ at }) => fired(at) && at <= f)
    .sort((a, b) => a.at - b.at);
  let cur: T = init;
  for (let i = 0; i < active.length; i++) {
    const { k, at } = active[i];
    const until = i + 1 < active.length ? active[i + 1].at : f;
    const p = prog(until, at, k.dur, Infinity, k.ease ?? EASE);
    const next = { ...cur } as Record<string, number>;
    for (const key of Object.keys(k.to)) next[key] = lerp(cur[key], k.to[key] as number, p);
    cur = next as T;
  }
  return cur;
}
