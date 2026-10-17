/**
 * Aether — campo de nodos 3D, fondo fijo compartido por dashboard/index.html
 * e inventory.html. Puramente decorativo (representa "espacio de
 * percepción", no datos reales) — a diferencia de portada.js/app.js, este
 * archivo nunca toca la API.
 *
 * Densidad: <canvas id="field" data-density="low"> reduce el número de
 * nodos y la opacidad de nodos/líneas — se usa en inventory.html, la
 * pantalla con más texto y datos reales sobre el fondo, para no competir
 * con la legibilidad de la tabla. La portada usa la densidad normal
 * (data-density ausente o distinto de "low").
 *
 * El brillo de cada punto se hornea una vez en un sprite. Cada frame solo
 * lo estampa. Las líneas se buscan por celdas y se trazan en lotes.
 * El bucle va a ~30 fps y se detiene si la pestaña o el canvas no se ven.
 */

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
let w, h, dpr;
let mouseX = 0,
  mouseY = 0,
  targetX = 0,
  targetY = 0;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isLowDensity = canvas.dataset.density === "low";
const trackPointer = !prefersReducedMotion && !document.body.classList.contains("tool");

const NODE_A = [46, 230, 255]; // var(--node-a)
const NODE_B = [192, 132, 252]; // var(--node-b)
const LINE_ALPHA_SCALE = isLowDensity ? 0.45 : 1;
const DOT_ALPHA_SCALE = isLowDensity ? 0.55 : 1;
const LINE_ALPHA_BASE = 0.55;
const DOT_FALLOFF = 0.22;
const GLOW_BLUR = isLowDensity ? 8 : 16;
const LINK = 110;
const LINK2 = LINK * LINK;
const CELL = LINK;
const LINE_BUCKETS = 5;
const FRAME_MS = 1000 / 30;
const DESKTOP_COUNT = isLowDensity ? 55 : 130;
const MOBILE_COUNT = isLowDensity ? 32 : 66;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

const nodes = [];
for (let i = 0; i < DESKTOP_COUNT; i++) {
  nodes.push({
    x: (Math.random() - 0.5) * 2400,
    y: (Math.random() - 0.5) * 1600,
    z: Math.random() * 1000 + 60,
    r: Math.random() * 1.6 + 0.6,
  });
}

function lerpRgb(t) {
  return NODE_A.map((v, i) => Math.round(v + (NODE_B[i] - v) * t));
}

const SPRITE_N = 8;
const SPRITE = 64;
const sprites = [];
for (let s = 0; s < SPRITE_N; s++) {
  const tile = document.createElement("canvas");
  tile.width = SPRITE;
  tile.height = SPRITE;
  const g = tile.getContext("2d");
  const [r, gv, b] = lerpRgb(s / (SPRITE_N - 1));
  const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, `rgba(${r},${gv},${b},1)`);
  glow.addColorStop(0.22, `rgba(${r},${gv},${b},0.55)`);
  glow.addColorStop(0.55, `rgba(${r},${gv},${b},0.16)`);
  glow.addColorStop(1, `rgba(${r},${gv},${b},0)`);
  g.fillStyle = glow;
  g.fillRect(0, 0, SPRITE, SPRITE);
  sprites.push(tile);
}

if (trackPointer) {
  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX / w - 0.5;
    targetY = e.clientY / h - 0.5;
  });
}

const projected = [];
function activeCount() {
  const mobile = w < 800;
  const cap = mobile ? MOBILE_COUNT : DESKTOP_COUNT;
  const q = window.AetherPerf ? window.AetherPerf.quality : 1;
  return Math.max(24, Math.round(cap * q));
}

function project(ts, count, dt) {
  if (trackPointer) {
    const k = 1 - Math.exp(-(dt || 16) / 400);
    mouseX += (targetX - mouseX) * k;
    mouseY += (targetY - mouseY) * k;
  }

  const cx = w / 2;
  const cy = h / 2;
  const drift = prefersReducedMotion ? 0 : ts * 0.00002;
  projected.length = count;

  for (let i = 0; i < count; i++) {
    const n = nodes[i];
    const depth = n.z;
    const parX = n.x + mouseX * depth * 0.45 + Math.sin(drift + n.z) * 6;
    const parY = n.y + mouseY * depth * 0.45 + Math.cos(drift + n.z) * 6;
    const scale = 500 / (500 + depth);
    let p = projected[i];
    if (!p) projected[i] = p = {};
    p.sx = cx + parX * scale;
    p.sy = cy + parY * scale;
    p.r = n.r * scale * 2.4;
    p.t = Math.min(depth / 1000, 1);
  }
}

const grid = new Map();
const segments = Array.from({ length: LINE_BUCKETS }, () => []);

function renderFrame(ts, dt) {
  const count = Math.min(activeCount(), nodes.length);
  ctx.clearRect(0, 0, w, h);
  project(ts || 0, count, dt);

  grid.clear();
  for (let i = 0; i < count; i++) {
    const p = projected[i];
    const key = (Math.floor(p.sx / CELL) + 4096) * 8192 + Math.floor(p.sy / CELL);
    let cell = grid.get(key);
    if (!cell) grid.set(key, (cell = []));
    cell.push(i);
  }

  for (let b = 0; b < LINE_BUCKETS; b++) segments[b].length = 0;
  for (let i = 0; i < count; i++) {
    const p1 = projected[i];
    const ix = Math.floor(p1.sx / CELL);
    const iy = Math.floor(p1.sy / CELL);
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cell = grid.get((ix + ox + 4096) * 8192 + (iy + oy));
        if (!cell) continue;
        for (let k = 0; k < cell.length; k++) {
          const j = cell[k];
          if (j <= i) continue;
          const p2 = projected[j];
          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const dist2 = dx * dx + dy * dy;
          if (dist2 >= LINK2) continue;
          const near = 1 - Math.sqrt(dist2) / LINK;
          const bucket = Math.min(LINE_BUCKETS - 1, (near * LINE_BUCKETS) | 0);
          segments[bucket].push(p1.sx, p1.sy, p2.sx, p2.sy);
        }
      }
    }
  }

  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgb(46,230,255)";
  for (let b = 0; b < LINE_BUCKETS; b++) {
    const seg = segments[b];
    if (seg.length === 0) continue;
    ctx.globalAlpha = ((b + 0.5) / LINE_BUCKETS) * LINE_ALPHA_BASE * LINE_ALPHA_SCALE;
    ctx.beginPath();
    for (let i = 0; i < seg.length; i += 4) {
      ctx.moveTo(seg[i], seg[i + 1]);
      ctx.lineTo(seg[i + 2], seg[i + 3]);
    }
    ctx.stroke();
  }

  const lastSprite = sprites.length - 1;
  for (let i = 0; i < count; i++) {
    const p = projected[i];
    const sprite = sprites[(p.t * lastSprite) | 0];
    const size = Math.max(p.r, 0.6) * 2 + GLOW_BLUR * 2;
    ctx.globalAlpha = (1 - p.t * DOT_FALLOFF) * DOT_ALPHA_SCALE;
    ctx.drawImage(sprite, p.sx - size / 2, p.sy - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}

if (prefersReducedMotion) {
  renderFrame(0, 16);
  window.addEventListener("resize", () => renderFrame(0, 16));
} else {
  let raf = 0;
  let lastTs = 0;
  let acc = 0;
  let onScreen = true;
  let pageHidden = document.hidden;

  function running() {
    return onScreen && !pageHidden;
  }

  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function loop(ts) {
    raf = 0;
    if (!running()) return;
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;
    acc += dt;
    if (acc >= FRAME_MS) {
      const step = acc;
      acc = 0;
      renderFrame(ts, step);
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (raf || !running()) return;
    lastTs = 0;
    acc = FRAME_MS;
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener("visibilitychange", () => {
    pageHidden = document.hidden;
    if (pageHidden) stop();
    else start();
  });

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) start();
    else stop();
  }).observe(canvas);

  if (window.AetherPerf) {
    window.AetherPerf.register("field", (state) => {
      pageHidden = state.hidden;
      if (pageHidden) stop();
      else start();
    });
  }

  start();
}
