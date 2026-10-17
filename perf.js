/**
 * Pausa y baja de calidad compartida por el fondo, el grano, el pasillo
 * y el iframe 3D. No dibuja nada: solo dice cuándo parar y cuándo aligerar.
 */
(() => {
  const tasks = new Map();
  let hidden = document.hidden;
  let quality = 1;
  let slow = 0;
  let last = 0;
  let raf = 0;

  function bakeGrain() {
    const size = 200;
    const tile = document.createElement("canvas");
    tile.width = size;
    tile.height = size;
    const g = tile.getContext("2d", { willReadFrequently: true });
    const pixels = g.createImageData(size, size);
    const data = pixels.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = 100 + ((Math.random() * 120) | 0);
      data[i] = data[i + 1] = data[i + 2] = n;
      data[i + 3] = 255;
    }
    g.putImageData(pixels, 0, 0);
    document.documentElement.style.setProperty("--grain", `url("${tile.toDataURL("image/png")}")`);
  }

  function postFrames() {
    document.querySelectorAll(".explode-frame").forEach((frame) => {
      const win = frame.contentWindow;
      if (!win) return;
      const visible = frame.dataset.aetherVisible !== "0";
      win.postMessage({ type: "aether-pause", paused: hidden || !visible }, location.origin);
    });
  }

  function emit() {
    document.documentElement.classList.toggle("aether-paused", hidden);
    document.documentElement.classList.toggle("aether-quality-low", quality < 1);
    const state = { hidden, quality };
    tasks.forEach((fn) => fn(state));
    postFrames();
  }

  function watch(now) {
    if (!hidden && last) {
      const ms = now - last;
      if (quality === 1) {
        if (ms > 22.2) slow += 1;
        else slow = Math.max(0, slow - 1);
        if (slow >= 30) {
          quality = 0.55;
          slow = 0;
          emit();
        }
      }
    }
    last = now;
    raf = hidden ? 0 : requestAnimationFrame(watch);
  }

  window.AetherPerf = {
    register(id, fn) {
      tasks.set(id, fn);
      fn({ hidden, quality });
      return () => tasks.delete(id);
    },
    get quality() {
      return quality;
    },
    get hidden() {
      return hidden;
    },
  };

  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
    if (hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    } else if (!raf) {
      last = 0;
      raf = requestAnimationFrame(watch);
    }
    emit();
  });

  document.querySelectorAll(".explode-frame").forEach((frame) => {
    frame.dataset.aetherVisible = "0";
    frame.addEventListener("load", emit);
    new IntersectionObserver(([entry]) => {
      frame.dataset.aetherVisible = entry.isIntersecting ? "1" : "0";
      emit();
    }, { rootMargin: "180px" }).observe(frame);
  });

  if (document.querySelector(".veil")) bakeGrain();
  if (!hidden) raf = requestAnimationFrame(watch);
})();
