// Controlador de sincronización del reproductor en vivo. Lógica pura: no toca
// DOM, audio ni red — recibe eventos y decide qué cue se dispara y cuándo.
// Lo prueba player/controller.test.mjs (node player/controller.test.mjs).
//
// Reglas (brief, SINCRONIZACIÓN):
//  1. Cada cue se dispara con el evento REAL de Lumina (line-start, etc.).
//  2. Watchdog: si el siguiente evento no llega en (p95 medido + margen), el
//     cue se dispara igual con la duración mediana y queda registrado. Si
//     Lumina YA pidió la frase (line-request), está viva: se espera hasta la
//     latencia MÁXIMA medida + margen. Ambos plazos se estiran si en esta
//     función Lumina viene lenta (1.5× la mayor latencia reciente).
//  3. Latido: robot.js publica `alive` cada segundo. Si el latido se corta
//     3 s, el enlace está caído: piloto automático al ritmo MEDIANO medido,
//     anclado al instante en que cada cue DEBIÓ ocurrir (el cue se retrofecha,
//     así el video no arrastra el retraso de la detección). Vuelve un evento
//     real → sale del piloto automático.
//  4. Si llega un evento más adelante en la secuencia, los cues intermedios se
//     disparan en ese momento (recuperación) — nunca se queda atorado.
//  5. El bloque del expositor (await → heard), el arranque (wake → start) y
//     los cues del clicker NO tienen watchdog: los decide una persona. El
//     clicker en la espera de "Lumina" avisa a Lumina y, si en 2.5 s no llega
//     la confirmación (enlace caído), avanza el video por su cuenta.

/** Secuencia completa de cues en orden (incluye el fin de cada frase, `L07e`). */
export function sequenceOf(timeline) {
  const seq = [];
  for (const c of timeline.cues) {
    seq.push(c.id);
    if (c.durMs) seq.push(`${c.id}e`);
  }
  return seq;
}

export function createController({ timeline, now, setTimer, clearTimer, onCue, onLog = (_entry) => {}, onWake = () => {} }) {
  const seq = sequenceOf(timeline);
  const byId = Object.fromEntries(timeline.cues.map((c) => [c.id, c]));
  const guionPause = timeline.pausesMs; // pausesMs[i-1] = pausa diseñada tras la frase i
  const lat = timeline.sync.latencyMs;
  const MARGIN = 1500;
  const LINK_TIMEOUT = 3000;
  const CLICKER_LOCAL = 2500;
  const HUMAN_NEXT = new Set(["start", "heard", "C1", "SEE", "UNDERSTAND", "DECIDE", "C3", "C4", "C5"]);
  const clickerIds = timeline.cues.filter((c) => c.trigger.type === "clicker").map((c) => c.id);

  const fired = new Map(); // id → { t: cuándo se disparó, at: instante que representa, source }
  const recentLatency = [];
  let held = false;
  let timer = null;
  let pendingRequest = null; // { i, t } último line-request
  let autopilot = false;
  let heartbeat = false; // ¿esta versión de robot.js manda latido?
  let linkTimer = null;

  const log = (type, data) => onLog({ t: now(), type, ...data });
  const idx = (id) => seq.indexOf(id);
  const lineNo = (id) => (/^L(\d\d)e?$/.test(id) ? Number(id.slice(1, 3)) : null);
  const lineId = (n) => `L${String(n).padStart(2, "0")}`;

  /** `at`: instante que el cue representa (si ya pasó, la vista lo retrofecha). */
  function fire(id, source, extra = {}, at = null) {
    if (!seq.includes(id)) return log("unknown", { id, source });
    if (fired.has(id)) {
      const first = fired.get(id);
      return log("duplicate", { id, source, lateByMs: Math.round(now() - first.t), firstSource: first.source });
    }
    // Recuperación: todo lo anterior que falte se dispara ahora mismo.
    for (let k = 0; k < idx(id); k++) {
      const prev = seq[k];
      if (!fired.has(prev)) {
        fired.set(prev, { t: now(), at: now(), source: "catch-up" });
        log("cue", { id: prev, source: "catch-up", because: id });
        onCue(prev, "catch-up", 0);
      }
    }
    const effective = Math.min(now(), at ?? now());
    fired.set(id, { t: now(), at: effective, source });
    log("cue", { id, source, ...extra, ...(effective < now() ? { backdateMs: Math.round(now() - effective) } : {}) });
    onCue(id, source, now() - effective);
    // Cues derivados (silencio y tarjeta tras «This is Aether.»).
    if (id === "C5") {
      for (const c of timeline.cues.filter((x) => x.trigger.type === "after" && x.trigger.cue === "C5")) {
        setTimer(() => fire(c.id, "after"), c.trigger.ms);
      }
    }
    arm();
  }

  const nextPending = () => seq.find((id) => !fired.has(id));

  /** Programa el watchdog para el siguiente cue esperado (si le toca). */
  function arm() {
    if (timer) clearTimer(timer);
    timer = null;
    if (held) return;
    const next = nextPending();
    if (!next || HUMAN_NEXT.has(next) || byId[next]?.trigger.type === "after") return;
    const prevId = seq[idx(next) - 1];
    const prev = fired.get(prevId);
    if (!prev) return;
    const n = lineNo(next);
    const isEnd = next.endsWith("e");
    // Pausa que robot.js espera DESPUÉS de la frase anterior (n-1): pausesMs[n-2].
    const pause = n && !isEnd && prevId.endsWith("e") ? guionPause[n - 2] ?? 0 : 0;
    const requested = n && !isEnd && pendingRequest?.i === n;
    let due;
    let at = null;
    if (autopilot) {
      // Ritmo mediano medido, anclado a cuándo DEBIÓ ocurrir cada cue.
      if (n && isEnd) at = prev.at + byId[lineId(n)].durMs;
      else if (n) at = (requested ? pendingRequest.t : prev.at + pause) + lat.median;
      else at = prev.at; // await / camera: robot.js los emite al terminar la frase
      due = at;
    } else {
      const slow = recentLatency.length ? 1.5 * Math.max(...recentLatency.slice(-5)) : 0;
      if (n && isEnd) due = prev.t + byId[lineId(n)].durMs * 1.3 + 1000;
      else if (requested) due = pendingRequest.t + Math.max(lat.max, slow) + MARGIN;
      else if (n) due = prev.t + pause + Math.max(lat.p95, slow) + MARGIN;
      else due = prev.t + 2000;
    }
    timer = setTimer(() => {
      timer = null;
      log("watchdog", { id: next, autopilot });
      autopilot = true;
      fire(next, "watchdog", {}, at);
    }, Math.max(0, due - now()));
  }

  function alive(t) {
    if (autopilot) {
      autopilot = false;
      log("autopilot-off", {});
    }
    if (!heartbeat) return;
    if (linkTimer) clearTimer(linkTimer);
    linkTimer = setTimer(() => {
      linkTimer = null;
      log("link-down", { lastSeenMs: Math.round(now() - t) });
      if (!autopilot) {
        autopilot = true;
        arm();
      }
    }, LINK_TIMEOUT);
  }

  /** Evento crudo de Lumina (tal como lo publica robot.js). */
  function luminaEvent(ev) {
    const t = now();
    if (ev.type === "alive") heartbeat = true;
    const wasAuto = autopilot;
    alive(t);
    const i = ev.i != null ? String(ev.i).padStart(2, "0") : null;
    switch (ev.type) {
      case "alive":
        return wasAuto ? arm() : undefined;
      case "wake":
        return fire("wake", "lumina");
      case "script-start":
        return fire("start", "lumina");
      case "line-request":
        pendingRequest = { i: ev.i, t };
        log("request", { i: ev.i });
        return arm();
      case "line-start":
        if (pendingRequest && pendingRequest.i === ev.i) {
          recentLatency.push(t - pendingRequest.t);
          pendingRequest = null;
        }
        return fire(`L${i}`, "lumina");
      case "line-end":
        return fire(`L${i}e`, "lumina");
      case "await-lumina":
        return fire("await", "lumina");
      case "heard-lumina":
        return fire("heard", "lumina", { via: ev.source });
      case "camera-on":
        return fire("camera", "lumina");
      default:
        return log("ignored", { event: ev.type });
    }
  }

  /** Botón del clicker: respaldo de "Lumina" durante la espera; después, avanza el cierre. */
  function clicker() {
    const next = nextPending();
    if (next === "heard") {
      log("clicker", { action: "wake-fallback" });
      onWake(); // robot.js lo trata como si hubiera oído "Lumina"
      // Si Lumina no confirma (enlace caído), el video sigue por su cuenta.
      setTimer(() => {
        if (!fired.has("heard")) fire("heard", "clicker-local");
      }, CLICKER_LOCAL);
      return;
    }
    if (clickerIds.includes(next)) return fire(next, "clicker");
    log("clicker", { action: "ignored", next });
  }

  return {
    luminaEvent,
    clicker,
    cue: (id) => fire(id, "manual"),
    hold: () => {
      held = true;
      arm();
      log("hold", {});
    },
    resume: () => {
      held = false;
      log("resume", {});
      arm();
    },
    get fired() {
      return fired;
    },
    get next() {
      return nextPending();
    },
    get held() {
      return held;
    },
  };
}
