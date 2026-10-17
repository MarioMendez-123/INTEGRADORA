/**
 * Recorrido 3D de la línea de manufactura (portada, #corridor). La sección
 * es alta y su escenario queda fijo (sticky): el scroll nativo avanza la
 * cámara por un pasillo con las cuatro estaciones a los lados. No se
 * secuestra la rueda; el progreso mostrado persigue al real con inercia.
 *
 * Sin JS o con movimiento reducido no se activa: las estaciones quedan
 * como la fila de tarjetas normal. En pantalla angosta sí corre, con la
 * separación que marca --corridor-gap.
 */
(() => {
  const root = document.getElementById("corridor");
  if (!root) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  root.classList.add("corridor--on");
  const world = root.querySelector(".corridor-world");
  const stations = [...root.querySelectorAll(".line-station")];
  const steps = [...root.querySelectorAll(".corridor-steps li")];
  const gap = () => {
    const n = parseFloat(getComputedStyle(root).getPropertyValue("--corridor-gap"));
    return n > 0 ? n : 900;
  };
  stations.forEach((s, i) => {
    s.style.setProperty("--i", i);
    s.style.setProperty("--side", i % 2 ? 1 : -1);
  });

  let shown = 0;
  let last = 0;
  let raf = 0;

  function frame(now) {
    const r = root.getBoundingClientRect();
    const total = r.height - innerHeight;
    const target = Math.min(1, Math.max(0, -r.top / total));
    const dt = last ? now - last : 16;
    last = now;
    shown += (target - shown) * (1 - Math.exp(-dt / 140));

    const step = gap();
    const cam = shown * (stations.length - 1) * step;
    world.style.setProperty("--cam", `${cam.toFixed(1)}px`);
    const at = Math.round(shown * (stations.length - 1));
    stations.forEach((s, i) => {
      const d = i * step - cam;
      s.style.opacity = d < -step * 0.45 ? 0 : Math.max(0.08, 1 - Math.abs(d) / (step * 1.8)).toFixed(2);
      s.classList.toggle("is-near", i === at);
    });
    steps.forEach((li, i) => li.classList.toggle("is-on", i === at));
    raf = requestAnimationFrame(frame);
  }

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!entry.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }).observe(root);
})();
