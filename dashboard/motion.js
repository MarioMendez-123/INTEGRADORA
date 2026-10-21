/**
 * Aether — movimiento compartido de index.html e inventory.html.
 *
 * - Entradas al hacer scroll: todo [data-reveal] aparece al entrar al
 *   viewport, escalonado 60ms dentro del mismo lote (tope: 8 pasos). Variante
 *   data-reveal="soft" (inventory.html): corta y de 8px, para una
 *   herramienta que se abre muchas veces al día. Variante
 *   data-reveal="title": el título sube desde una máscara (clip-path).
 *   Los elementos .reticle además "fijan la mira": sus cuatro esquinas
 *   llegan desde afuera, como YOLO fijando una detección — la firma visual
 *   del sistema (ver .interface-design/system.md).
 * - Nav de la portada: material translúcido (blur) en cuanto hay scroll, y
 *   el link de la sección visible queda marcado (aria-current).
 * - AetherMotion.countUp: cifras reales que ruedan hasta su valor la
 *   primera vez que llegan. Solo anima hacia el número que devolvió la API;
 *   nunca muestra un valor que no vino de ahí más que de paso.
 *
 * Las animaciones usan WAAPI (element.animate) y no transiciones CSS a
 * propósito: así no pisan el `transition` propio de cada componente (hover
 * y :active de .btn/.module-card siguen intactos después de la entrada).
 *
 * Todo arranca cuando AetherLoader.ready se resuelve (loader.js), no
 * antes: lo que ya está en pantalla bajo el loader entra al desvanecerse
 * este. Con prefers-reduced-motion no hay entradas ni contadores — todo
 * aparece en su estado final (loader.js tampoco pone .has-motion).
 */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ready = window.AetherLoader ? window.AetherLoader.ready : Promise.resolve();
  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)"; // mismo valor que --ease-out

  // ---------- nav: material translúcido + sección actual (wayfinding) ----------
  // Se observan TODAS las secciones con id (no solo las que tienen link):
  // entrar a una sin link, como #percepcion o el hero, limpia la marca en
  // vez de dejar marcada la anterior. El footer (#equipo) es más bajo que
  // la franja central y nunca la cruzaría: al llegar al fondo de la página
  // se marca el último link.
  const nav = document.querySelector(".site-nav--fixed");
  const links = [...document.querySelectorAll('.navlinks a[href^="#"]')];
  const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
  let currentId = null;
  let atBottom = false;

  function markCurrent() {
    links.forEach((a) => a.removeAttribute("aria-current"));
    const link = atBottom ? links[links.length - 1] : byId.get(currentId);
    if (link) link.setAttribute("aria-current", "location");
  }

  if (nav) {
    let queued = false;
    let lastY = window.scrollY;
    // Se retira al bajar (no tapa la presentación) y vuelve al subir, al
    // acercar el puntero al borde superior o al llegar con Tab.
    const show = () => nav.classList.remove("is-hidden");
    window.addEventListener("pointermove", (e) => {
      if (e.clientY < 72) show();
    }, { passive: true });
    nav.addEventListener("focusin", show);
    const update = () => {
      queued = false;
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 24);
      if (y < 120 || y < lastY - 6) show();
      else if (y > lastY + 6 && !nav.contains(document.activeElement)) nav.classList.add("is-hidden");
      if (Math.abs(y - lastY) > 6) lastY = y;
      const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (bottom !== atBottom) {
        atBottom = bottom;
        markCurrent();
      }
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!queued) {
          queued = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  }

  if (links.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          currentId = entry.target.id || null;
          markCurrent();
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    document.querySelectorAll(".hero, section[id], footer[id]").forEach((el) => spy.observe(el));
  }

  // ---------- entradas al hacer scroll ----------
  const VARIANTS = {
    default: [
      { opacity: 0, translate: "0 24px" },
      { opacity: 1, translate: "0 0" },
    ],
    title: [
      { opacity: 0, translate: "0 0.4em", clipPath: "inset(0 0 100% 0)" },
      { opacity: 1, translate: "0 0", clipPath: "inset(0 0 -20% 0)" },
    ],
    // Herramienta de datos (inventory.html): se visita decenas de veces al
    // día — entrada corta y casi imperceptible, no de presentación.
    soft: [
      { opacity: 0, translate: "0 8px" },
      { opacity: 1, translate: "0 0" },
    ],
  };
  const DURATION = { soft: 420 };
  const CORNER_FROM = { tl: "-8px -8px", tr: "8px -8px", bl: "-8px 8px", br: "8px 8px" };

  function lockOn(el, delay) {
    el.querySelectorAll(":scope > .reticle-corner").forEach((corner) => {
      const pos = (corner.className.match(/reticle-corner--(tl|tr|bl|br)/) || [])[1];
      if (!pos) return;
      corner.animate(
        [
          { translate: CORNER_FROM[pos], opacity: 0 },
          { translate: "0 0", opacity: 1 },
        ],
        { duration: 560, delay, easing: EASE, fill: "backwards" },
      );
    });
  }

  function reveal(el, delay) {
    el.classList.add("is-revealed"); // quita el opacity:0 inicial de style.css
    el.animate(VARIANTS[el.dataset.reveal] || VARIANTS.default, {
      duration: DURATION[el.dataset.reveal] || 900,
      delay,
      easing: EASE,
      fill: "backwards",
    });
    if (el.classList.contains("reticle")) lockOn(el, delay + 200);
  }

  const targets = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-revealed"));
  } else {
    ready.then(() => {
      const io = new IntersectionObserver(
        (entries) => {
          let i = 0;
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            reveal(entry.target, Math.min(i++, 8) * 60);
          });
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      targets.forEach((el) => io.observe(el));
    });
  }

  // ---------- puntero: luz global + inclinación 3D 1:1 ----------
  // body.tool (inventario y dataset) es una herramienta: el puntero no
  // mueve la luz ni inclina los paneles.
  if (
    !reduce &&
    !document.body.classList.contains("tool") &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    const root = document.documentElement;
    window.addEventListener(
      "pointermove",
      (e) => {
        root.style.setProperty("--sx", `${e.clientX}px`);
        root.style.setProperty("--sy", `${e.clientY}px`);
      },
      { passive: true },
    );

    document.querySelectorAll(".module-card--active, .panel, .camera-placeholder, .bay").forEach((card) => {
      card.classList.add("can-tilt");
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add("is-tilting");
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
        card.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
        card.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
        card.style.setProperty("--tz", "8px");
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--tz", "0px");
      });
      card.addEventListener("pointerdown", () => card.style.setProperty("--tz", "2px"));
    });

    if (document.querySelector(".hero")) {
      const rail = document.createElement("div");
      rail.className = "scroll-rail";
      rail.setAttribute("aria-hidden", "true");
      document.body.appendChild(rail);
      const paint = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        rail.style.setProperty("--p", max > 0 ? String(window.scrollY / max) : "0");
      };
      paint();
      window.addEventListener("scroll", paint, { passive: true });
      window.addEventListener("resize", paint);
    }
  }

  // ---------- cifras que ruedan hasta su valor real ----------
  // animate=false escribe directo. La última cifra pedida siempre gana: si
  // llega un valor nuevo (polling) mientras una animación vieja corre, esa
  // animación se detiene sola en vez de pisarlo con un número viejo.
  function countUp(el, to, format = String, animate = true) {
    el.dataset.countTo = String(to);
    const set = (n) => {
      el.textContent = format(n);
    };
    if (!animate || reduce || !Number.isFinite(to) || to === 0) {
      set(to);
      return;
    }
    set(0);
    ready.then(() => {
      const start = performance.now();
      const COUNT_MS = 900;
      const step = (now) => {
        if (el.dataset.countTo !== String(to)) return;
        const k = Math.min((now - start) / COUNT_MS, 1);
        set(Math.round(to * (1 - Math.pow(1 - k, 4)))); // ease-out cuártico
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  window.AetherMotion = { countUp };
})();
