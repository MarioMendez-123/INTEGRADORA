/**
 * Aether — modelo isométrico de la unidad móvil (Aether Inventory).
 *
 * DISEÑO CONCEPTUAL BETA: proporciones y piezas ilustrativas, no el modelo
 * mecánico final (hardware/bom/ sigue vacío). Cada capa corresponde a una
 * decisión real de ADR — cámara (Decisiones 1/2), Jetson (ADR 0004),
 * ESP32/STM32 (ADR 0004 + Decisión 6), batería (sin definir en el BOM),
 * chasis con motores/encoders (Decisión 3) — pero su forma es solo
 * ilustrativa.
 *
 * Lo usan dos vistas con el mismo concepto de "vista explosionada":
 * loader.js (en bucle, dentro del anillo de carga) y explode.js (sección
 * #robot de la portada, guiada por scroll). Se genera desde cajas en
 * coordenadas de mundo (x, y, z) con proyección isométrica, en vez de SVG
 * dibujado a mano, para que las dos vistas compartan una sola geometría.
 *
 * Sin dependencias y síncrono a propósito: loader.js lo necesita antes de
 * que cargue cualquier otra cosa de la página.
 */
window.AetherRobot = (() => {
  const C = Math.cos(Math.PI / 6);
  const proj = ([x, y, z]) => [(x - y) * C, (x + y) / 2 - z];
  const pts = (list) => list.map((p) => proj(p).map((n) => n.toFixed(1)).join(",")).join(" ");
  const poly = (cls, list) => `<polygon class="${cls}" points="${pts(list)}"/>`;

  // Caja sólida: solo las tres caras visibles desde el punto de vista
  // isométrico (arriba, frente-izquierda en y máx., frente-derecha en x máx.).
  function box(x, y, z, w, d, h, cls = "") {
    const t = z + h;
    const X = x + w;
    const Y = y + d;
    return (
      poly(`rb-face rb-right ${cls}`, [[X, y, z], [X, Y, z], [X, Y, t], [X, y, t]]) +
      poly(`rb-face rb-left ${cls}`, [[x, Y, z], [X, Y, z], [X, Y, t], [x, Y, t]]) +
      poly(`rb-face rb-top ${cls}`, [[x, y, t], [X, y, t], [X, Y, t], [x, Y, t]])
    );
  }

  // Círculo (o polígono regular de n lados) en el plano perpendicular a `axis`.
  function ring(cls, [cx, cy, cz], r, axis, n = 28, rot = 0) {
    const list = [];
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2;
      const u = Math.cos(a) * r;
      const v = Math.sin(a) * r;
      if (axis === "x") list.push([cx, cy + u, cz + v]);
      else if (axis === "y") list.push([cx + u, cy, cz + v]);
      else list.push([cx + u, cy + v, cz]);
    }
    return poly(cls, list);
  }

  // Rueda con eje paralelo a y, del lado visible del chasis (y = 84 → 92).
  const wheel = (x) =>
    ring("rb-face rb-wheel", [x, 86, 10], 12, "y") +
    ring("rb-face rb-wheel", [x, 92, 10], 12, "y") +
    ring("rb-face rb-hub", [x, 92, 10], 4.5, "y", 16);

  let fins = "";
  for (let i = 0; i < 7; i++) fins += box(30 + i * 7, 22, 44, 3, 40, 10);

  // dz = desplazamiento vertical de cada capa con la vista totalmente
  // explosionada (unidades de mundo). Orden = orden de pintado: de abajo
  // hacia arriba, así una capa superior tapa correctamente a la de abajo.
  const PARTS = [
    { id: "chassis", dz: 0, svg: box(0, 0, 4, 120, 84, 16) + wheel(26) + wheel(94) },
    { id: "battery", dz: 18, svg: box(12, 10, 20, 96, 64, 12) + box(86, 16, 32, 12, 8, 3, "rb-term") },
    {
      id: "control",
      dz: 44,
      svg:
        box(16, 14, 33, 88, 56, 3) +
        box(28, 24, 36, 22, 16, 4) +
        box(64, 40, 36, 12, 12, 3) +
        box(92, 20, 36, 5, 5, 2, "rb-led"),
    },
    { id: "compute", dz: 70, svg: box(20, 16, 40, 80, 52, 4) + fins },
    {
      id: "shell",
      dz: 124,
      svg:
        box(0, 0, 20, 120, 84, 40) +
        ring("rb-mark", [38, 42, 60], 15, "z", 6, Math.PI / 6) +
        ring("rb-mark-dot", [38, 42, 60], 2.4, "z", 12) +
        poly("rb-strip", [[120, 12, 50], [120, 72, 50], [120, 72, 52.5], [120, 12, 52.5]]),
    },
    {
      id: "camera",
      dz: 164,
      svg:
        box(92, 38, 60, 8, 8, 36) +
        box(80, 30, 96, 30, 24, 16) +
        ring("rb-lens", [110, 42, 104], 6, "x") +
        ring("rb-lens-core", [110, 42, 104], 2.6, "x", 16),
    },
  ];

  return {
    PARTS,
    markup: () =>
      PARTS.map(
        (p, k) => `<g class="rb-part" data-part="${p.id}" style="--dz:${p.dz};--k:${k}">${p.svg}</g>`,
      ).join(""),
    // Encuadre que contiene al robot armado (explode = 0) o separado hasta
    // `explode` veces su desplazamiento total, más margen arriba para la
    // etiqueta de la mira de explode.js.
    viewBox: (explode = 1, top = 12) => `-86 ${-66 - 164 * explode - top} 202 ${174 + 164 * explode + top}`,
  };
})();
