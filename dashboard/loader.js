/**
 * Aether — pantalla de carga global (Fase 3.5). Un solo componente: cada
 * página lo monta con dos <script> síncronos al inicio del <body>
 * (robot-model.js y este archivo), antes que cualquier otro contenido, para
 * que se vea desde el primer cuadro. No depende de nada más: solo SVG + CSS
 * (estilos en style.css, sección LOADER).
 *
 * El anillo refleja carga REAL, nunca un temporizador: cada tarea que
 * termina suma una fracción. Tareas propias: DOM listo, fuentes y el evento
 * load (hojas de estilo, scripts, imágenes). Cada página agrega las suyas
 * con AetherLoader.track(promesa) — ej. portada.js envuelve su GET
 * /inventory, app.js su primera carga de inventario + bitácora.
 *
 * Tiempos: mínimo MIN_MS (para que no destelle) y máximo MAX_MS. Si se
 * alcanza el máximo con tareas pendientes, la página se muestra igual —SIN
 * completar el anillo, porque no terminó— y lo pendiente se ve con
 * skeletons (.skeleton en style.css) hasta que llegue.
 *
 * Con prefers-reduced-motion: logo y anillo estáticos, robot armado y sin
 * bucle; el anillo sigue reflejando el progreso real, solo que sin
 * transición.
 *
 * NO se monta en robot.html a propósito: esa pantalla debe quedar negra y
 * sin nada de Aether visible hasta la activación por voz (ver su
 * comentario de cabecera y .boot-screen en robot.css).
 *
 * Los tiempos se ajustan por página en el propio <script>:
 * data-min-ms / data-max-ms. La celda de manufactura (celda.html) usa
 * mínimo 0 y máximo 1000, y llama AetherLoader.done() en cuanto pinta el
 * primer estado: un operador que recarga durante un fallo no puede
 * quedarse viendo una animación.
 *
 * Expone window.AetherLoader = { track, done, ready } — `ready` es una
 * promesa que se resuelve cuando el loader empieza a desvanecerse
 * (motion.js la usa para arrancar las entradas de la página en ese
 * momento); `done()` lo quita ya, aunque queden tareas pendientes.
 */
(() => {
  const config = document.currentScript?.dataset ?? {};
  const MIN_MS = Number(config.minMs ?? 800);
  const MAX_MS = Number(config.maxMs ?? 3000);
  const HOLD_MS = 240; // pausa con el anillo completo antes de desvanecer
  const html = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let resolveReady;
  const ready = new Promise((r) => (resolveReady = r));

  const root = document.createElement("div");
  root.className = "loader";
  root.setAttribute("role", "progressbar");
  root.setAttribute("aria-label", "Cargando Aether");
  root.setAttribute("aria-valuemin", "0");
  root.setAttribute("aria-valuemax", "100");
  root.setAttribute("aria-valuenow", "0");
  root.innerHTML = `
    <div class="loader-ring">
      <svg class="loader-ring-svg" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="loader-track" cx="60" cy="60" r="56" />
        <circle class="loader-progress" cx="60" cy="60" r="56" pathLength="100" />
      </svg>
      <svg class="loader-robot rb" viewBox="${window.AetherRobot.viewBox(0.5, 0)}" aria-hidden="true">
        ${window.AetherRobot.markup()}
      </svg>
    </div>
    <div class="loader-brand" aria-hidden="true">
      <svg class="loader-mark" viewBox="-6 -6 132 132">
        <polygon class="loader-mark-hex" pathLength="100" points="60,0 112,30 112,90 60,120 8,90 8,30" />
        <path class="loader-mark-spokes" d="M60 60V0M60 60L112 30M60 60L112 90M60 60V120M60 60L8 90M60 60L8 30" />
        <circle class="loader-mark-core" cx="60" cy="60" r="9" />
      </svg>
      <span class="loader-word">AETHER</span>
    </div>
    <span class="loader-pct">Cargando · 0%</span>`;
  document.body.prepend(root);
  // Recién aquí, con el loader ya montado: .has-motion oculta el contenido
  // hasta html.is-ready, y si algo arriba hubiera fallado nadie lo
  // devolvería — la página se quedaría invisible.
  if (!reduce) html.classList.add("has-motion");

  const progressEl = root.querySelector(".loader-progress");
  const pctEl = root.querySelector(".loader-pct");
  const parts = root.querySelectorAll(".rb-part");

  let total = 0;
  let done = 0;
  let shown = 0; // nunca retrocede aunque se registren tareas nuevas
  let finished = false;

  function render() {
    const pct = total ? Math.round((done / total) * 100) : 0;
    shown = Math.max(shown, pct);
    progressEl.style.strokeDashoffset = String(100 - shown);
    pctEl.textContent = `Cargando · ${shown}%`;
    root.setAttribute("aria-valuenow", String(shown));
    if (total && done === total) {
      const wait = Math.max(0, MIN_MS - HOLD_MS - performance.now());
      setTimeout(() => done === total && finish(true), wait);
    }
  }

  function track(promise) {
    total++;
    const settle = () => {
      done++;
      render();
    };
    Promise.resolve(promise).then(settle, settle);
    render();
    return promise;
  }

  // Detiene el bucle del robot desde su posición ACTUAL en pantalla (no
  // desde 0): lee el translate que la animación tiene en este cuadro, lo
  // fija inline y desde ahí transiciona a armado. Cortar la animación sin
  // esto haría que las piezas saltaran de golpe.
  function settleRobot() {
    parts.forEach((part) => {
      const current = getComputedStyle(part).translate;
      part.style.animation = "none";
      part.style.translate = current === "none" ? "0 0" : current;
    });
    root.getBoundingClientRect(); // fuerza el estilo anterior antes de transicionar
    parts.forEach((part) => {
      part.style.transition = "translate 300ms var(--ease-out)";
      part.style.translate = "0 0";
    });
  }

  function finish(complete, hold = complete) {
    if (finished) return;
    finished = true;
    if (complete) {
      shown = 100;
      progressEl.style.strokeDashoffset = "0";
      pctEl.textContent = "Listo";
      root.setAttribute("aria-valuenow", "100");
    }
    if (!reduce) settleRobot();
    setTimeout(
      () => {
        html.classList.add("is-ready");
        root.classList.add("loader--out");
        resolveReady();
        document.dispatchEvent(new Event("aether:ready"));
        setTimeout(() => root.remove(), 700);
      },
      hold && !reduce ? HOLD_MS : 0,
    );
  }

  const domReady = new Promise((r) => {
    if (document.readyState !== "loading") r();
    else document.addEventListener("DOMContentLoaded", r, { once: true });
  });
  track(domReady);
  // Las fuentes se piden al hacer layout, así que document.fonts.ready
  // antes del DOM listo se resolvería "vacío" — se encadena después.
  if (document.fonts) track(domReady.then(() => document.fonts.ready));
  track(
    new Promise((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", r, { once: true });
    }),
  );

  // Tope duro: pase lo que pase con la red, la página se muestra aquí.
  setTimeout(() => finish(false), Math.max(0, MAX_MS - performance.now()));

  // Sin pausa: quien llama done() ya tiene lo que la persona necesita ver.
  const release = () => finish(total > 0 && done === total, false);
  window.AetherLoader = { track, done: release, ready };
})();
