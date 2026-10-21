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
 * El modelo es el carrito 3D de armado.html (el de Lumina), embebido.
 * El progreso de este scroll solo se le manda. Las ventanas con las que
 * cada grupo se separa están en armado.html (applyEmbed) y siguen los
 * mismos tramos de antes: panel, electrónica, mecanismo, batería, tracción.
 *
 * Con prefers-reduced-motion: sin sticky ni scrub — el robot se muestra
 * ya separado, en un solo cuadro estático, y las etapas como lista normal.
 */
(() => {
  const section = document.getElementById("robot");
  const frameEl = section && section.querySelector(".explode-frame");
  if (!section || !frameEl) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stages = [...section.querySelectorAll(".explode-stage")];
  const railSteps = [...section.querySelectorAll(".explode-rail-step")];
  const railFills = railSteps.map((b) => b.querySelector(".explode-rail-fill"));

  // Inicio de cada etapa (0 = introducción). El carrito aplica estas mismas
  // fracciones en armado.html (applyEmbed).
  const STAGE_START = [0, 0.07, 0.3, 0.48, 0.62, 0.77];
  const stageAt = (p) => STAGE_START.reduce((s, start, i) => (p >= start ? i : s), 0);

  let activeStage = -1;
  let shown = 0;

  function setStage(stage) {
    if (stage === activeStage) return;
    activeStage = stage;
    stages.forEach((el, i) => el.classList.toggle("is-active", i === stage));
    railSteps.forEach((b, i) => {
      if (i + 1 === stage) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
  }

  function render(p) {
    shown = p;
    setStage(stageAt(p));
    railFills.forEach((fill, i) => {
      const start = STAGE_START[i + 1];
      const end = STAGE_START[i + 2] ?? 0.95;
      fill.style.transform = `scaleX(${Math.min(Math.max((p - start) / (end - start), 0), 1)})`;
    });
    const win = frameEl.contentWindow;
    if (win) win.postMessage({ type: "aether-explode", p }, location.origin);
    return false;
  }

  frameEl.addEventListener("load", () => render(shown));

  if (reduce) {
    section.classList.add("explode--static");
    render(0.95);
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
    render(current);
    if (current !== target) requestAnimationFrame(frame);
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
