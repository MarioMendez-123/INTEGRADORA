/**
 * Recorrido 3D de la línea de manufactura (portada, #corridor). La sección
 * es alta y su escenario queda fijo (sticky): el scroll nativo avanza la
 * cámara por un pasillo con las cuatro estaciones a los lados. No se
 * secuestra la rueda; el progreso mostrado persigue al real con inercia.
 *
 * Sin JS o con movimiento reducido no se activa: las estaciones quedan
 * como la fila de tarjetas normal. En pantalla angosta sí corre, con la
 * separación que marca --corridor-gap.
 *
 * El scroll solo pide un frame. La lectura de layout ocurre ahí, una vez;
 * el frame siguiente solo escribe transform y opacidad.
 */
(() => {
  const root = document.getElementById("corridor");
  if (!root) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  root.classList.add("corridor--on");
  const world = root.querySelector(".corridor-world");
  const stations = [...root.querySelectorAll(".line-station")];
  const steps = [...root.querySelectorAll(".corridor-steps li")];
  stations.forEach((s, i) => {
    s.style.setProperty("--i", i);
    s.style.setProperty("--side", i % 2 ? 1 : -1);
  });

  let gapPx = 900;
  let target = 0;
  let shown = 0;
  let last = 0;
  let raf = 0;
  let reading = false;
  let visible = false;
  let paused = document.hidden;
  let at = -1;
  const fade = stations.map(() => -1);

  function readLayout() {
    const r = root.getBoundingClientRect();
    const total = r.height - innerHeight;
    const n = parseFloat(getComputedStyle(root).getPropertyValue("--corridor-gap"));
    gapPx = n > 0 ? n : 900;
    target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    reading = false;
  }

  function write(now) {
    raf = 0;
    if (reading) readLayout();
    const dt = last ? now - last : 16;
    last = now;
    shown += (target - shown) * (1 - Math.exp(-dt / 140));
    if (Math.abs(target - shown) < 0.0008) shown = target;

    const span = Math.max(stations.length - 1, 1);
    const cam = shown * span * gapPx;
    world.style.setProperty("--cam", `${cam.toFixed(1)}px`);

    const nextAt = Math.round(shown * span);
    const windowZ = gapPx * 1.8;
    for (let i = 0; i < stations.length; i++) {
      const d = i * gapPx - cam;
      if (d > windowZ && fade[i] === 0.08) continue;
      const next = d < -gapPx * 0.45 ? 0 : Math.max(0.08, 1 - Math.abs(d) / windowZ);
      const q = Math.round(next * 100) / 100;
      if (q === fade[i]) continue;
      fade[i] = q;
      stations[i].style.setProperty("--fade", q);
    }
    if (nextAt !== at) {
      if (stations[at]) stations[at].classList.remove("is-near");
      if (steps[at]) steps[at].classList.remove("is-on");
      if (stations[nextAt]) stations[nextAt].classList.add("is-near");
      if (steps[nextAt]) steps[nextAt].classList.add("is-on");
      at = nextAt;
    }

    if (shown !== target && visible && !paused) raf = requestAnimationFrame(write);
  }

  function kick() {
    if (!visible || paused || raf) return;
    last = 0;
    raf = requestAnimationFrame(write);
  }

  function askRead() {
    reading = true;
    kick();
  }

  window.addEventListener("scroll", askRead, { passive: true });
  window.addEventListener("resize", askRead);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    askRead();
  }).observe(root);

  if (window.AetherPerf) {
    window.AetherPerf.register("corridor", (state) => {
      paused = state.hidden;
      if (paused) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      askRead();
    });
  }
})();
