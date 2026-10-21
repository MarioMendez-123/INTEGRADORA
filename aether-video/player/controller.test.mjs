// Prueba del controlador con reloj simulado. Uso: node player/controller.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import { createController, sequenceOf } from "./controller.mjs";

const timeline = JSON.parse(fs.readFileSync(new URL("../timeline.json", import.meta.url), "utf8"));

function harness() {
  let t = 0;
  let timers = [];
  const cues = [];
  const logs = [];
  let wakes = 0;
  const c = createController({
    timeline,
    now: () => t,
    setTimer: (fn, ms) => {
      const h = { at: t + ms, fn };
      timers.push(h);
      return h;
    },
    clearTimer: (h) => (timers = timers.filter((x) => x !== h)),
    onCue: (id, source, backdateMs) => cues.push({ id, source, t, backdateMs }),
    onLog: (l) => logs.push(l),
    onWake: () => wakes++,
  });
  const advance = (ms) => {
    const end = t + ms;
    for (;;) {
      timers.sort((a, b) => a.at - b.at);
      const h = timers[0];
      if (!h || h.at > end) break;
      timers.shift();
      t = h.at;
      h.fn();
    }
    t = end;
  };
  return { c, cues, logs, advance, wakes: () => wakes, at: () => t };
}

// 1. Flujo normal: cada evento real dispara su cue, sin watchdog.
{
  const h = harness();
  h.c.luminaEvent({ type: "wake" });
  h.advance(4000);
  h.c.luminaEvent({ type: "script-start" });
  h.c.luminaEvent({ type: "line-request", i: 1 });
  h.advance(1500);
  h.c.luminaEvent({ type: "line-start", i: 1 });
  h.advance(1200);
  h.c.luminaEvent({ type: "line-end", i: 1 });
  assert.deepEqual(h.cues.map((x) => x.id), ["wake", "start", "L01", "L01e"]);
  assert.ok(h.cues.every((x) => x.source === "lumina"));
}

// 2. Watchdog: el inicio de la frase 2 nunca llega → se dispara tras p95+margen y queda registrado.
{
  const h = harness();
  for (const ev of [{ type: "wake" }, { type: "script-start" }, { type: "line-start", i: 1 }, { type: "line-end", i: 1 }]) h.c.luminaEvent(ev);
  const expected = timeline.pausesMs[0] + timeline.sync.latencyMs.p95 + 1500;
  h.advance(expected - 10);
  assert.ok(!h.c.fired.has("L02"), "no debe dispararse antes del plazo");
  h.advance(20);
  assert.equal(h.c.fired.get("L02").source, "watchdog");
  assert.ok(h.logs.some((l) => l.type === "watchdog" && l.id === "L02"));
  // El evento real que llega tarde se ignora y se registra.
  h.c.luminaEvent({ type: "line-start", i: 2 });
  assert.ok(h.logs.some((l) => l.type === "duplicate" && l.id === "L02"));
}

// 3. Recuperación: llega la frase 5 sin que llegaran la 3 y la 4.
{
  const h = harness();
  for (const ev of [{ type: "wake" }, { type: "script-start" }, { type: "line-start", i: 1 }, { type: "line-end", i: 1 }, { type: "line-start", i: 2 }, { type: "line-end", i: 2 }]) h.c.luminaEvent(ev);
  h.c.luminaEvent({ type: "line-start", i: 5 });
  const ids = h.cues.map((x) => x.id);
  assert.deepEqual(ids.slice(-5), ["L03", "L03e", "L04", "L04e", "L05"]);
  assert.ok(["L03", "L03e", "L04", "L04e"].every((id) => h.c.fired.get(id).source === "catch-up"));
  assert.equal(h.c.fired.get("L05").source, "lumina");
}

// 4. Bloque del expositor: sin watchdog; el clicker manda "wake" a Lumina.
{
  const h = harness();
  const seq = sequenceOf(timeline);
  for (const id of seq.slice(0, seq.indexOf("await") + 1)) h.c.cue(id);
  h.advance(10 * 60 * 1000);
  assert.ok(!h.c.fired.has("heard"), "el expositor puede tardar lo que sea");
  h.c.clicker();
  assert.equal(h.wakes(), 1);
  h.c.luminaEvent({ type: "heard-lumina", source: "clicker" });
  assert.equal(h.c.fired.get("heard").source, "lumina");
}

// 5. Latencia lenta observada → el watchdog espera más (no se adelanta en 3G).
{
  const h = harness();
  for (const ev of [{ type: "wake" }, { type: "script-start" }]) h.c.luminaEvent(ev);
  h.c.luminaEvent({ type: "line-request", i: 1 });
  h.advance(6000); // latencia real de 6 s, observada
  h.c.luminaEvent({ type: "line-start", i: 1 });
  h.advance(1000);
  h.c.luminaEvent({ type: "line-end", i: 1 });
  h.c.luminaEvent({ type: "line-request", i: 2 });
  h.advance(timeline.sync.latencyMs.p95 + 1500 + 500);
  assert.ok(!h.c.fired.has("L02"), "con 6 s observados, 4.2 s no basta para declararla caída");
  h.advance(6000);
  assert.equal(h.c.fired.get("L02").source, "watchdog");
}

// 6. hold() suspende el watchdog; resume() lo rearma.
{
  const h = harness();
  for (const ev of [{ type: "wake" }, { type: "script-start" }, { type: "line-start", i: 1 }, { type: "line-end", i: 1 }]) h.c.luminaEvent(ev);
  h.c.hold();
  h.advance(60000);
  assert.ok(!h.c.fired.has("L02"));
  h.c.resume();
  h.advance(10000);
  assert.equal(h.c.fired.get("L02").source, "watchdog");
}

// 7. Cierre: clicker en orden; silencio y tarjeta derivados de C5.
{
  const h = harness();
  const seq = sequenceOf(timeline);
  for (const id of seq.slice(0, seq.indexOf("camera") + 1)) h.c.cue(id);
  for (let k = 0; k < 7; k++) h.c.clicker();
  assert.equal(h.c.fired.get("C5").source, "clicker");
  h.advance(10000);
  assert.equal(h.c.fired.get("silence").source, "after");
  assert.equal(h.c.fired.get("card").source, "after");
  assert.equal(h.c.fired.get("card").t - h.c.fired.get("C5").t, 3200);
}

// 8. Pedido visto y el inicio no llega: se espera la latencia MÁXIMA medida, no el p95.
{
  const h = harness();
  for (const ev of [{ type: "wake" }, { type: "script-start" }, { type: "line-start", i: 1 }, { type: "line-end", i: 1 }]) h.c.luminaEvent(ev);
  h.c.luminaEvent({ type: "line-request", i: 2 });
  h.advance(timeline.sync.latencyMs.max + 1500 - 50);
  assert.ok(!h.c.fired.has("L02"), "un pico real de ElevenLabs no debe adelantar el cue");
  h.advance(100);
  assert.equal(h.c.fired.get("L02").source, "watchdog");
}

// 9. Enlace caído: tras el primer watchdog, el video sigue al ritmo MEDIANO medido.
{
  const h = harness();
  for (const ev of [{ type: "wake" }, { type: "script-start" }, { type: "line-start", i: 1 }, { type: "line-end", i: 1 }]) h.c.luminaEvent(ev);
  h.advance(60000);
  const L = (id) => h.c.fired.get(id);
  assert.equal(L("L02").source, "watchdog");
  const gapEnd = L("L02e").t - L("L02").t;
  assert.equal(gapEnd, timeline.cues.find((c) => c.id === "L02").durMs, "fin de frase a la duración mediana");
  const gapNext = L("L03").t - L("L02e").t;
  assert.equal(gapNext, timeline.pausesMs[1] + timeline.sync.latencyMs.median, "siguiente frase a pausa + latencia mediana");
  // Vuelve un evento real → deja el piloto automático.
  h.c.luminaEvent({ type: "line-start", i: 20 });
  assert.ok(h.logs.some((l) => l.type === "autopilot-off"));
}

// 10. Latido: el enlace se cae justo después de un pedido → piloto automático
//     retrofechado al instante esperado (no arrastra los 3 s de detección).
{
  const h = harness();
  const beat = (ms) => {
    for (let k = 0; k < ms / 1000; k++) {
      h.c.luminaEvent({ type: "alive" });
      h.advance(1000);
    }
  };
  for (const ev of [{ type: "wake" }, { type: "script-start" }]) h.c.luminaEvent(ev);
  for (let i = 1; i <= 4; i++) {
    h.c.luminaEvent({ type: "line-request", i });
    beat(1000);
    h.c.luminaEvent({ type: "line-start", i });
    beat(2000);
    h.c.luminaEvent({ type: "line-end", i });
  }
  const req = h.at();
  h.c.luminaEvent({ type: "line-request", i: 5 });
  h.advance(3000); // se corta el latido
  assert.ok(h.logs.some((l) => l.type === "link-down"));
  const L05 = h.c.fired.get("L05");
  assert.equal(L05.source, "watchdog");
  assert.equal(L05.at, req + timeline.sync.latencyMs.median, "anclado a pedido + latencia mediana");
  assert.ok(h.cues.find((c) => c.id === "L05").backdateMs > 1000, "la vista lo retrofecha");
  h.advance(20000);
  assert.equal(h.c.fired.get("L05e").at, L05.at + timeline.cues.find((c) => c.id === "L05").durMs);
}

// 11. Clicker en la espera de "Lumina" con el enlace caído: el video avanza solo a los 2.5 s.
{
  const h = harness();
  const seq = sequenceOf(timeline);
  for (const id of seq.slice(0, seq.indexOf("await") + 1)) h.c.cue(id);
  h.c.clicker();
  assert.equal(h.wakes(), 1);
  h.advance(2400);
  assert.ok(!h.c.fired.has("heard"));
  h.advance(200);
  assert.equal(h.c.fired.get("heard").source, "clicker-local");
}

// 12. La pausa que cuenta es la que sigue a la frase ANTERIOR (L06 → 800 ms → L07).
{
  const h = harness();
  const seq = sequenceOf(timeline);
  for (const id of seq.slice(0, seq.indexOf("L06e") + 1)) h.c.cue(id);
  const expected = timeline.pausesMs[5] + timeline.sync.latencyMs.p95 + 1500;
  assert.equal(timeline.pausesMs[5], 800);
  h.advance(expected - 10);
  assert.ok(!h.c.fired.has("L07"));
  h.advance(20);
  assert.equal(h.c.fired.get("L07").source, "watchdog");
  // En piloto automático, tras L31 ("En un momento.", pausa 800 ms) llega L32, no 52 s después.
  const g = harness();
  for (const id of seq.slice(0, seq.indexOf("L31e") + 1)) g.c.cue(id);
  g.advance(60000);
  assert.ok(g.c.fired.get("L32"), "L32 debe dispararse");
  assert.ok(g.c.fired.get("L32").at - g.c.fired.get("L31e").at < 10000);
}

console.log("controller: 12 pruebas OK");
