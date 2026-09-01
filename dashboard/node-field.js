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

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

// Campo de nodos: cada uno tiene profundidad (z) -> simula navegar por un
// espacio 3D. Colores tomados de los tokens del sistema (--node-a/--node-b),
// duplicados aquí como valores RGB porque Canvas 2D no lee custom
// properties de CSS directamente.
const NODE_A = [76, 124, 224]; // var(--node-a)
const NODE_B = [156, 107, 224]; // var(--node-b)

const COUNT = isLowDensity ? 55 : 130;
// Escalas de opacidad aplicadas sobre los mismos valores base que usa la
// densidad normal — menos nodos Y más tenues, no solo menos cantidad.
const LINE_ALPHA_SCALE = isLowDensity ? 0.45 : 1;
const DOT_ALPHA_SCALE = isLowDensity ? 0.55 : 1;

const nodes = [];
for (let i = 0; i < COUNT; i++) {
  nodes.push({
    x: (Math.random() - 0.5) * 2400,
    y: (Math.random() - 0.5) * 1600,
    z: Math.random() * 1000 + 60,
    r: Math.random() * 1.6 + 0.6,
  });
}

if (!prefersReducedMotion) {
  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX / w - 0.5;
    targetY = e.clientY / h - 0.5;
  });
}

function lerpColor(t) {
  // t: 0 (cerca) -> 1 (lejos)
  const c = NODE_A.map((v, i) => Math.round(v + (NODE_B[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function project(ts) {
  if (!prefersReducedMotion) {
    mouseX += (targetX - mouseX) * 0.04;
    mouseY += (targetY - mouseY) * 0.04;
  }

  const cx = w / 2;
  const cy = h / 2;
  const drift = prefersReducedMotion ? 0 : ts * 0.00002;

  return nodes.map((n) => {
    const depth = n.z;
    const parX = n.x + mouseX * depth * 0.25 + Math.sin(drift + n.z) * 6;
    const parY = n.y + mouseY * depth * 0.25 + Math.cos(drift + n.z) * 6;
    const scale = 500 / (500 + depth);
    return {
      sx: cx + parX * scale,
      sy: cy + parY * scale,
      r: n.r * scale * 2.4,
      t: Math.min(depth / 1000, 1),
    };
  });
}

// Brillo del campo: multiplicadores base compartidos por las dos pantallas.
// LINE_ALPHA_SCALE/DOT_ALPHA_SCALE (arriba) siguen aplicando sobre estos
// mismos valores para mantener inventory.html proporcionalmente más tenue
// — subir el brillo aquí sube las dos pantallas a la vez, sin romper esa
// relación.
const LINE_ALPHA_BASE = 0.34; // antes 0.18
const DOT_FALLOFF = 0.35; // antes 0.55 — nodos lejanos ya no se apagan tanto
const GLOW_BLUR = isLowDensity ? 4 : 8; // halo por nodo (canvas shadowBlur)

function renderFrame(ts) {
  ctx.clearRect(0, 0, w, h);
  const projected = project(ts || 0);

  ctx.lineWidth = 0.8;
  for (let i = 0; i < projected.length; i++) {
    for (let j = i + 1; j < projected.length; j++) {
      const p1 = projected[i];
      const p2 = projected[j];
      const dx = p1.sx - p2.sx;
      const dy = p1.sy - p2.sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        const alpha = (1 - dist / 110) * LINE_ALPHA_BASE * LINE_ALPHA_SCALE;
        ctx.strokeStyle = `rgba(130,155,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }
    }
  }

  projected.forEach((p) => {
    const color = lerpColor(p.t);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = GLOW_BLUR;
    ctx.globalAlpha = (1 - p.t * DOT_FALLOFF) * DOT_ALPHA_SCALE;
    ctx.arc(p.sx, p.sy, Math.max(p.r, 0.6), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  ctx.shadowBlur = 0; // no debe filtrarse a nada dibujado después de este frame
}

if (prefersReducedMotion) {
  // Un solo cuadro estático — el campo sigue siendo visible como fondo,
  // pero sin animación continua ni parallax de mouse.
  renderFrame(0);
} else {
  function loop(ts) {
    renderFrame(ts);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
