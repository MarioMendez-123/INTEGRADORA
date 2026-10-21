// Simulador de Lumina: emite los mismos eventos que dashboard/robot.js con
// tiempos sacados de las mediciones reales (player/samples.json, Fase 0).
// Lo usan el modo de ensayo del reproductor y las pruebas de sincronía.

/** Semilla → número 0..1 (repetible). */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Plan de eventos con su tiempo (ms desde el encendido). Opciones:
 *  profile: perfil de red medido · extraDelayMs: retraso añadido a cada
 *  pedido (control deslizante) · dropProb: probabilidad de perder un evento ·
 *  lanDownAtMs: a partir de ese instante se cae el enlace (no llega nada, ni el latido) ·
 *  expositorMs: cuánto habla el expositor antes de "Lumina". */
export function planLumina({ timeline, samples, profile = "none", extraDelayMs = 0, dropProb = 0, lanDownAtMs = Infinity, expositorMs = 58000, startDelayMs = 4000, seed = 1 }) {
  const R = rng(seed);
  const pick = (xs) => xs[Math.floor(R() * xs.length)];
  const lat = samples.profiles[profile].latencyMs;
  const events = [];
  let t = 0;
  const push = (type, extra = {}) => events.push({ at: Math.round(t), type, ...extra });
  push("wake");
  t += startDelayMs;
  push("script-start");
  for (let i = 1; i <= 32; i++) {
    if (i === 30) {
      t += expositorMs;
      push("heard-lumina", { source: "voz" });
    }
    push("line-request", { i });
    t += pick(lat) + extraDelayMs;
    push("line-start", { i });
    t += pick(samples.durByLine[i]);
    push("line-end", { i });
    if (i === 29) push("await-lumina");
    else if (i === 32) push("camera-on");
    else t += timeline.pausesMs[i - 1];
  }
  // Latido de robot.js: un "alive" por segundo mientras la página vive.
  for (let a = 1000; a <= t + 5000; a += 1000) events.push({ at: a, type: "alive" });
  events.sort((x, y) => x.at - y.at);
  return events.filter((e) => {
    if (e.at >= lanDownAtMs) return false;
    return !(dropProb > 0 && e.type !== "wake" && e.type !== "alive" && R() < dropProb);
  });
}
