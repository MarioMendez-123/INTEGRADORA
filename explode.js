/**
 * Aether — vista explosionada de la unidad móvil, guiada por scroll
 * (sección #robot de la portada). Scroll NATIVO: no se secuestra la rueda
 * ni el touch. La sección es alta y su contenido queda fijo (sticky)
 * mientras el progreso del scroll desarma el robot capa por capa, al
 * estilo de las páginas de producto de Apple.
 *
 * Suavizado: el progreso mostrado persigue al progreso real con un
 * amortiguamiento exponencial (independiente de los FPS), así la vista se
 * siente con inercia aunque la rueda del mouse avance a saltos, y siempre
 * parte del valor que hay en pantalla — se puede invertir a medio camino.
 *
 * El modelo es el diseño conceptual beta de robot-model.js; cada etapa
 * muestra el estado REAL de su decisión (ver el HTML de #robot), nunca
 * presenta como terminado algo que está pendiente de hardware.
 *
 * Con prefers-reduced-motion: sin sticky ni scrub — el robot se muestra
 * ya separado, en un solo cuadro estático, y las etapas como lista normal.
 */
(() => {
  const section = document.getElementById("robot");
  if (!section || !window.AetherRobot) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = section.querySelector(".explode-svg");
  const stages = [...section.querySelectorAll(".explode-stage")];
  const railSteps = [...section.querySelectorAll(".explode-rail-step")];
  const railFills = railSteps.map((b) => b.querySelector(".explode-rail-fill"));

  svg.setAttribute("viewBox", window.AetherRobot.viewBox(1, 22));
  svg.innerHTML = `${window.AetherRobot.markup()}
    <g class="rb-reticle" aria-hidden="true">
      <path class="rb-reticle-corners" />
      <text class="rb-reticle-label"></text>
    </g>`;
  const parts = {};
  svg.querySelectorAll(".rb-part").forEach((g) => (parts[g.dataset.part] = g));
  const reticlePath = svg.querySelector(".rb-reticle-corners");
  const reticleLabel = svg.querySelector(".rb-reticle-label");

  // ---------- guion ----------
  // Cada etapa separa una capa de la pila, de arriba hacia abajo. Ventanas
  // expresadas como fracción del recorrido total de la sección.
  const smooth = (a, b, p) => {
    const t = Math.min(Math.max((p - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  };
  function offsets(p) {
    const shell = 124 * smooth(0.25, 0.35, p);
    return {
      chassis: 0,
      battery: 18 * smooth(0.64, 0.74, p),
      control: 44 * smooth(0.5, 0.6, p),
      compute: 70 * smooth(0.37, 0.47, p),
      shell,
      camera: shell + 40 * smooth(0.09, 0.21, p), // el mástil viaja con la carcasa
    };
  }
  // Inicio de cada etapa (0 = introducción) y la pieza que enfoca.
  const STAGE_START = [0, 0.07, 0.3, 0.48, 0.62, 0.77];
  const STAGE_PART = [null, "camera", "compute", "control", "battery", "chassis"];
  const STAGE_LABEL = ["AETHER INVENTORY · BETA", "01 PERCEPCIÓN", "02 CÓMPUTO", "03 CONTROL", "04 ENERGÍA", "05 TRACCIÓN"];
  const stageAt = (p) => STAGE_START.reduce((s, start, i) => (p >= start ? i : s), 0);

  // Cajas de cada pieza armada (sin desplazamiento), para la mira.
  const boxes = {};
  Object.entries(parts).forEach(([id, g]) => (boxes[id] = g.getBBox()));
  const all = Object.values(boxes).reduce((u, b) => ({
    x: Math.min(u.x, b.x),
    y: Math.min(u.y, b.y),
    x2: Math.max(u.x2, b.x + b.width),
    y2: Math.max(u.y2, b.y + b.height),
  }), { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity });
  const WHOLE = { x: all.x, y: all.y, width: all.x2 - all.x, height: all.y2 - all.y };

  function targetRect(stage, off) {
    const id = STAGE_PART[stage];
    if (!id) return WHOLE;
    const b = boxes[id];
    return { x: b.x, y: b.y - off[id], width: b.width, height: b.height };
  }

  // ---------- render ----------
  let activeStage = -1;
  const rect = { ...WHOLE };
  const PAD = 7;
  const ARM = 9;

  function drawReticle() {
    const x1 = rect.x - PAD;
    const y1 = rect.y - PAD;
    const x2 = rect.x + rect.width + PAD;
    const y2 = rect.y + rect.height + PAD;
    reticlePath.setAttribute(
      "d",
      `M${x1} ${y1 + ARM}V${y1}H${x1 + ARM}M${x2 - ARM} ${y1}H${x2}V${y1 + ARM}` +
        `M${x2} ${y2 - ARM}V${y2}H${x2 - ARM}M${x1 + ARM} ${y2}H${x1}V${y2 - ARM}`,
    );
    reticleLabel.setAttribute("x", String(x1));
    reticleLabel.setAttribute("y", String(y1 - 6));
  }

  function setStage(stage) {
    if (stage === activeStage) return;
    activeStage = stage;
    stages.forEach((el, i) => el.classList.toggle("is-active", i === stage));
    railSteps.forEach((b, i) => {
      if (i + 1 === stage) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    Object.entries(parts).forEach(([id, g]) => g.classList.toggle("is-active", id === STAGE_PART[stage]));
    svg.classList.toggle("rb--staged", stage > 0);
    reticleLabel.textContent = STAGE_LABEL[stage];
  }

  // Devuelve true mientras la mira siga acercándose a su destino.
  function render(p, k) {
    const off = offsets(p);
    Object.entries(parts).forEach(([id, g]) => {
      g.style.translate = `0 ${(-off[id]).toFixed(2)}px`;
    });
    const stage = stageAt(p);
    setStage(stage);
    railFills.forEach((fill, i) => {
      const start = STAGE_START[i + 1];
      const end = STAGE_START[i + 2] ?? 0.95;
      fill.style.transform = `scaleX(${Math.min(Math.max((p - start) / (end - start), 0), 1)})`;
    });
    const t = targetRect(stage, off);
    let moving = false;
    ["x", "y", "width", "height"].forEach((key) => {
      rect[key] += (t[key] - rect[key]) * k;
      if (Math.abs(t[key] - rect[key]) > 0.05) moving = true;
      else rect[key] = t[key];
    });
    drawReticle();
    return moving;
  }

  if (reduce) {
    section.classList.add("explode--static");
    render(0.95, 1);
    svg.classList.remove("rb--staged");
    return;
  }

  section.classList.add("explode--scrub");

  const range = () => Math.max(1, section.offsetHeight - window.innerHeight);
  const targetP = () => Math.min(Math.max(-section.getBoundingClientRect().top / range(), 0), 1);

  let current = targetP();
  let running = false;
  let last = 0;

  function frame(now) {
    const dt = Math.min(now - last, 64);
    last = now;
    const target = targetP();
    const k = 1 - Math.pow(0.85, dt / 16.7); // ~15% por cuadro a 60 fps
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.0005) current = target;
    const reticleMoving = render(current, k);
    if (current !== target || reticleMoving) requestAnimationFrame(frame);
    else running = false;
  }

  function kick() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  render(current, 1);

  // Saltar a una etapa desde el riel: scroll nativo suave hasta el centro
  // de su ventana — el suavizado de arriba hace el resto.
  const STAGE_CENTER = [0.03, 0.17, 0.4, 0.55, 0.69, 0.86];
  railSteps.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const top = window.scrollY + section.getBoundingClientRect().top + STAGE_CENTER[i + 1] * range();
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();
