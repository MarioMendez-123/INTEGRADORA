
window.onerror = function (msg, src, line, col) {
  document.title = String(msg) + " @" + line + ":" + col;
  var bootMiss = document.getElementById("boot");
  if (bootMiss) bootMiss.textContent = String(msg) + " (linea " + line + ")";
};
if (!window.THREE) {
  var bootMiss = document.getElementById("boot");
  if (bootMiss) bootMiss.textContent = "Ábrelo en Chrome o Edge, con internet. Es un solo archivo.";
  throw new Error("sin three");
}
const ASM = [
  ["estructura", "Estructura", "3030, 36 escuadras y bandeja"],
  ["cubiertas", "Cubiertas", "Acrílicos y la caja de la foto"],
  ["traccion", "Tracción", "M0601, rodajas, suspensión, 18 V"],
  ["torre", "Torre", "Husillos, fixtures, empujador, drivers"],
  ["electronica", "Electrónica", "Batería, placa, Jetson, cámara"],
  ["arnes", "Arnés", "Las cinco rutas y sus puntas"]
];

const NOTES = {
  estructura: [
    "4 postes y 3 marcos de perfil 3030. La lista de cortes da ~7.9 m; ya hay 2 m.",
    "36 escuadras PETG, una en cada unión. 80 juegos M6×16: la tuerca entra por la ranura.",
    "Kit M3: sensores, finales de carrera, prisionero del piñón y soportes.",
    "Bandeja lateral: apoyo hacia la estación de descarga. La estación no va en este cuerpo."
  ],
  cubiertas: [
    "Costado izquierdo y derecho: las dos láminas de acrílico negro 60×40 cm × 3 mm.",
    "Tapa y fondo: la caja de la foto. No hay tercera lámina en la cotización.",
    "El frente queda abierto para la torre, la batería y los cables.",
    "El labio naranja de la tapa es PETG, impreso con el mismo rollo de las escuadras."
  ],
  traccion: [
    "M0601 izquierdo FIT1042 y derecho FIT1038. Llanta 102 mm, afuera del costado.",
    "XH rojo en cada motor: 18 V que sale del elevador 250 W.",
    "ZH blanco en cada motor: RS485 (GND, A, B) desde el MAX485.",
    "Resorte (alambre 2 mm, Ø ~20 mm, 70–80 mm) y guía M8 sobre cada motriz. 4 baleros 608ZZ en los pivotes.",
    "4 rodajas twin de nylon 50 mm, espiga, en las esquinas.",
    "Tornillería M8 × 80: 2 pivotes + 2 guías, con tuerca de seguridad y rondana.",
    "El MAX485 está en la placa. Se ve al abrir Electrónica; el cable azul de este apartado llega hasta él."
  ],
  torre: [
    "2 tornillos Acme T8 de 60 cm, tuerca de bronce, en el frente abierto. Carrera útil 45 cm.",
    "2 NEMA 17 17HS4401 abajo, cople D19L25 de 5 a 8 mm, 4 chumaceras KFL08 (2 por tornillo).",
    "2 varillas lisas de 8 mm × 60 cm y 4 SC8UU de la plataforma. Otros 2 SC8UU van en el empujador.",
    "Plataforma, 6 fixtures con 4 postes de 70 mm, y 4 guías en L.",
    "NEMA del empujador, piñón de 20 dientes y cremallera de 30 cm. 2 varillas de 8 mm × 30 cm.",
    "3 finales de carrera NC: home de cada husillo y home del empujador.",
    "2 drivers A4988 en la placa (uno a 1.6 A para los dos NEMA del elevador, otro a 1.0 A para el empujador) y un capacitor de 100 µF en cada uno.",
    "2 embudos de acople en el frente. Las hojas de ArUco no van aquí."
  ],
  electronica: [
    "Batería BR-1224, 12 V 24 Ah, al frente izquierdo. Terminales con ojillo.",
    "Caja gris del frente: portafusible 15 A, portafusible 10 A, relevador T90, dos XT60 y el voltímetro.",
    "KCD1 en la tapa, en la rama de 10 A. Paro LAY37 en la tapa, en serie con la bobina del relevador.",
    "Placa perforada 9×15 cm: ESP32 en header, 2 A4988, 2 capacitores, MAX485, convertidor de nivel, PCF8574, XL4005 a 5 V, borneras KF301 y el divisor 100 kΩ / 20 kΩ.",
    "Jetson Orin Nano sobre la tapa, alimentado con el plug 5.5 × 2.5 mm.",
    "Cámara Logitech USB en el frente de la tapa, lente hacia afuera. Yahboom IMX219 junto al Jetson: está en la cotización y sigue opcional.",
    "4 VL53L0X: dos al frente, uno atrás y uno junto a la pila. Todos arrancan en 0x29; el XSHUT lo maneja el PCF8574.",
    "Opcionales de la cotización, ya sentados en su lugar: QTR-8A bajo el frente, BNO055 en la placa, tira Neopixel y buzzer en el PCF8574."
  ],
  arnes: [
    "Rojo, 14 AWG: batería → XT60 → fusible 15 A → relevador → elevador 250 W.",
    "Naranja, 14 AWG: 18 V del elevador al XH de cada M0601.",
    "Negro: tierra común de batería, motores y placa.",
    "Amarillo: 5 V del XL4005 al ESP32, al plug del Jetson y a la bobina del LAY37.",
    "Azul, 22 AWG: nivel → MAX485 → ZH de cada rueda, más finales de carrera y XSHUT."
  ]
};

const X = 240, Z = 200, Y0 = 110, YM = 420, Y1 = 730;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd7d1c6);
const camera = new THREE.PerspectiveCamera(38, 1, 1, 8000);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById("view").prepend(renderer.domElement);
var boot = document.getElementById("boot");
if (boot) boot.remove();
scene.add(new THREE.HemisphereLight(0xfff8ee, 0xb7b0a4, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 1.25);
sun.position.set(420, 980, 460);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 100;
sun.shadow.camera.far = 2400;
sun.shadow.camera.left = sun.shadow.camera.bottom = -800;
sun.shadow.camera.right = sun.shadow.camera.top = 800;
scene.add(sun);
const floor = new THREE.Mesh(new THREE.CircleGeometry(1200, 64), new THREE.MeshStandardMaterial({ color: 0xcfc6b8, roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const grid = new THREE.GridHelper(1700, 17, 0xb3aa9e, 0xc4bbaf);
grid.position.y = 0.5;
scene.add(grid);

const mats = {};
const items = [];
function M(asm, key, hex, opt) {
  const id = asm + ":" + key;
  if (!mats[id]) {
    opt = opt || {};
    mats[id] = new THREE.MeshStandardMaterial({
      color: hex,
      metalness: opt.metal ?? 0.12,
      roughness: opt.rough ?? 0.48
    });
    mats[id].userData = { asm: asm };
  }
  return mats[id];
}
function makeLabel(text) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 80;
  const g = c.getContext("2d");
  g.fillStyle = "#f6f3ec";
  g.fillRect(0, 0, 640, 80);
  g.strokeStyle = "#1b1b1b";
  g.lineWidth = 4;
  g.strokeRect(2, 2, 636, 76);
  g.fillStyle = "#1b1b1b";
  g.font = "bold 34px sans-serif";
  g.fillText(text, 14, 52);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
  s.scale.set(188, 24, 1);
  s.visible = false;
  scene.add(s);
  return s;
}
function makeGuide() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6), 3));
  const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: 0x1a1a1a, dashSize: 16, gapSize: 8 }));
  line.visible = false;
  scene.add(line);
  return line;
}
function begin(asm, name, x, y, z, ex, ey, ez) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  scene.add(g);
  items.push({
    asm: asm, name: name, g: g,
    home: new THREE.Vector3(x, y, z),
    exp: new THREE.Vector3(ex, ey, ez),
    guide: makeGuide(),
    label: makeLabel(name)
  });
  return g;
}
function box(g, asm, key, hex, w, h, d, x, y, z, opt) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(asm, key, hex, opt));
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  g.add(m);
  return m;
}
function cyl(g, asm, key, hex, r, h, x, y, z, axis, opt) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 22), M(asm, key, hex, opt));
  if (axis === "x") m.rotation.z = Math.PI / 2;
  if (axis === "z") m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  m.castShadow = true;
  g.add(m);
  return m;
}
function rail(g, asm, len, axis, x, y, z) {
  const d = axis === "x" ? [len, 30, 30] : axis === "y" ? [30, len, 30] : [30, 30, len];
  box(g, asm, "alum", 0xd8dee6, d[0], d[1], d[2], x, y, z, { metal: 0.9, rough: 0.22 });
  if (axis === "x") box(g, asm, "slot", 0x8e959c, len - 4, 3, 8, x, y + 15, z, { metal: 0.45, rough: 0.45 });
  if (axis === "y") box(g, asm, "slot", 0x8e959c, 3, len - 4, 8, x + 15, y, z, { metal: 0.45, rough: 0.45 });
  if (axis === "z") box(g, asm, "slot", 0x8e959c, 8, 3, len - 4, x, y + 15, z, { metal: 0.45, rough: 0.45 });
}

// Estructura
[[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s, i) {
  const g = begin("estructura", "Poste 3030", s[0] * X, 420, s[1] * Z, s[0] * 150, 30, s[1] * 150);
  rail(g, "estructura", 640, "y", 0, 0, 0);
});
const bottom = begin("estructura", "Marco inferior", 0, Y0, 0, 0, -160, 0);
rail(bottom, "estructura", 480, "x", 0, 0, -Z);
rail(bottom, "estructura", 480, "x", 0, 0, Z);
rail(bottom, "estructura", 400, "z", -X, 0, 0);
rail(bottom, "estructura", 400, "z", X, 0, 0);
const mid = begin("estructura", "Marco medio", 0, YM, 0, 0, 0, 200);
rail(mid, "estructura", 480, "x", 0, 0, -Z);
rail(mid, "estructura", 480, "x", 0, 0, Z);
rail(mid, "estructura", 400, "z", -X, 0, 0);
rail(mid, "estructura", 400, "z", X, 0, 0);
const top = begin("estructura", "Marco superior", 0, Y1, 0, 0, 180, 0);
rail(top, "estructura", 480, "x", 0, 0, -Z);
rail(top, "estructura", 480, "x", 0, 0, Z);
rail(top, "estructura", 400, "z", -X, 0, 0);
rail(top, "estructura", 400, "z", X, 0, 0);
const shelf = begin("estructura", "Bandeja lateral", 360, 490, 0, 200, 0, 0);
rail(shelf, "estructura", 200, "x", 0, 0, -80);
rail(shelf, "estructura", 200, "x", 0, 0, 80);
rail(shelf, "estructura", 160, "z", 90, 0, 0);
box(shelf, "estructura", "deck", 0xb7bdc4, 180, 6, 160, 0, 18, 0, { metal: 0.4, rough: 0.4 });
const brackets = begin("estructura", "Escuadras PETG x36", 0, 0, 0, 0, 110, 0);
const spots = [];
[Y0, YM, Y1].forEach(function (y) {
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { spots.push([s[0] * X, y, s[1] * Z, 50]); });
  [[0, Z], [0, -Z], [X, 0], [-X, 0]].forEach(function (p) { spots.push([p[0], y, p[1], 26]); });
});
[[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) {
  spots.push([s[0] * X, (Y0 + YM) / 2, s[1] * Z, 26]);
  spots.push([s[0] * X, (YM + Y1) / 2, s[1] * Z, 26]);
});
[[360, 480, 80], [360, 480, -80], [450, 480, 0], [X, YM, 0]].forEach(function (p) { spots.push([p[0], p[1], p[2], 32]); });
spots.forEach(function (p) {
  box(brackets, "estructura", "orange", 0xff6a00, p[3], p[3], p[3], p[0], p[1], p[2], { rough: 0.42 });
});

// Cubiertas
const leftP = begin("cubiertas", "Acrilico izquierdo", -X + 12, 420, 0, -180, 0, 0);
box(leftP, "cubiertas", "panel", 0x121417, 6, 580, 350, 0, 0, 0, { rough: 0.3, metal: 0.12 });
const rightP = begin("cubiertas", "Acrilico derecho", X - 12, 420, 0, 180, 0, 0);
box(rightP, "cubiertas", "panel", 0x121417, 6, 580, 350, 0, 0, 0, { rough: 0.3, metal: 0.12 });
const backP = begin("cubiertas", "Fondo de la foto", 0, 420, -Z + 14, 0, 0, -180);
box(backP, "cubiertas", "back", 0x121417, 430, 580, 6, 0, 0, 0, { rough: 0.3, metal: 0.12 });
const lid = begin("cubiertas", "Tapa de la foto", 0, Y1 + 26, -10, 0, 160, 0);
box(lid, "cubiertas", "top", 0x121417, 450, 8, 340, 0, 0, 0, { rough: 0.3, metal: 0.12 });
box(lid, "cubiertas", "lip", 0xff6a00, 450, 10, 12, 0, 10, 168, { rough: 0.45 });

// Tracción
function caster(name, x, z, ex, ez) {
  const g = begin("traccion", name, x, 48, z, ex, -90, ez);
  box(g, "traccion", "plate", 0xdedee4, 40, 6, 32, 0, 48, 0, { metal: 0.55, rough: 0.4 });
  cyl(g, "traccion", "stem", 0x8d939a, 6, 26, 0, 30, 0, "y", { metal: 0.6 });
  box(g, "traccion", "fork", 0xc8cdd2, 10, 30, 36, 0, 8, 0, { metal: 0.45 });
  [-12, 12].forEach(function (dz) {
    cyl(g, "traccion", "rubber", 0x141414, 25, 12, 0, -8, dz, "z", { rough: 0.9, metal: 0 });
  });
}
caster("Rodaja del. izq.", -190, 150, -80, 80);
caster("Rodaja del. der.", 190, 150, 80, 80);
caster("Rodaja tras. der.", 190, -150, 80, -80);
caster("Rodaja tras. izq.", -190, -150, -80, -80);

function hubMotor(name, x, ex) {
  const g = begin("traccion", name, x, 51, 0, ex, -40, 0);
  cyl(g, "traccion", "rubber", 0x141414, 51, 40, 0, 0, 0, "x", { rough: 0.9, metal: 0 });
  cyl(g, "traccion", "hub", 0xe7ebf0, 24, 50, 0, 0, 0, "x", { metal: 0.86, rough: 0.22 });
  box(g, "traccion", "xh", 0xc0392b, 16, 10, 12, ex > 0 ? -6 : 6, 30, 34);
  box(g, "traccion", "zh", 0xf7f7f7, 18, 8, 12, ex > 0 ? -6 : 6, 30, -34);
  box(g, "traccion", "pivot", 0xc5ccd3, 36, 8, 50, ex > 0 ? -10 : 10, 46, 0, { metal: 0.5 });
  cyl(g, "traccion", "b608", 0xd5d8de, 8, 7, ex > 0 ? -10 : 10, 54, 16, "x", { metal: 0.75, rough: 0.3 });
  cyl(g, "traccion", "b608b", 0xd5d8de, 8, 7, ex > 0 ? -10 : 10, 54, -16, "x", { metal: 0.75, rough: 0.3 });
}
hubMotor("M0601 FIT1042", -278, -150);
hubMotor("M0601 FIT1038", 278, 150);
[-278, 278].forEach(function (x) {
  const g = begin("traccion", x < 0 ? "Resorte izquierdo" : "Resorte derecho", x, 130, 36, x < 0 ? -120 : 120, 40, 0);
  const pts = [];
  for (let i = 0; i <= 36; i++) {
    const a = (i / 36) * Math.PI * 9;
    pts.push(new THREE.Vector3(Math.cos(a) * 8, -40 + (i / 36) * 70, Math.sin(a) * 8));
  }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 50, 1.3, 6, false), M("traccion", "spring", 0xb7c0c8, { metal: 0.7, rough: 0.32 })));
  cyl(g, "traccion", "m8", 0xe4e7ec, 3.5, 78, 16, -6, 0, "y", { metal: 0.8, rough: 0.28 });
});
const boost = begin("traccion", "Elevador 250 W", 70, 168, -145, 0, 40, -170);
box(boost, "traccion", "boost", 0x1e6b45, 70, 26, 46, 0, 0, 0, { rough: 0.45 });
cyl(boost, "traccion", "coil", 0x222222, 10, 16, 0, 20, 0, "y");
box(boost, "traccion", "pot", 0x1a1a1a, 8, 8, 8, 22, 16, 10);

// Torre
function screwAsm(name, x, ex) {
  const g = begin("torre", name, x, 500, 78, ex, 0, 70);
  cyl(g, "torre", "screw", 0xff6a00, 4, 470, 0, 0, 0, "y", { metal: 0.35, rough: 0.4 });
  for (let y = -210; y <= 210; y += 26) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(6, 0.9, 5, 12), M("torre", "thread", 0xd45510, { rough: 0.45 }));
    t.rotation.x = Math.PI / 2;
    t.position.y = y;
    g.add(t);
  }
  box(g, "torre", "nema", 0x1a1a1a, 42, 48, 42, 0, -280, 0, { metal: 0.3, rough: 0.4 });
  cyl(g, "torre", "shaft", 0xe8eaec, 2.5, 18, 0, -246, 0, "y", { metal: 0.85, rough: 0.25 });
  box(g, "torre", "cople", 0x1c1c1c, 20, 24, 20, 0, -230, 0);
  box(g, "torre", "kfl", 0xd0d5db, 30, 14, 22, 0, -200, 0, { metal: 0.55 });
  box(g, "torre", "kfl2", 0xd0d5db, 30, 14, 22, 0, 230, 0, { metal: 0.55 });
  cyl(g, "torre", "nut", 0xc6a15a, 11, 16, 0, -160, 0, "y", { metal: 0.65, rough: 0.32 });
}
screwAsm("Husillo T8 izq.", -72, -170);
screwAsm("Husillo T8 der.", 72, 170);
[-128, 128].forEach(function (x) {
  const g = begin("torre", x < 0 ? "Varilla izq. 60 cm" : "Varilla der. 60 cm", x, 500, 78, x < 0 ? -150 : 150, 0, 40);
  cyl(g, "torre", "rod", 0xeef0f2, 4, 470, 0, 0, 0, "y", { metal: 0.88, rough: 0.18 });
  box(g, "torre", "sc8", 0xe7e0d4, 30, 24, 26, 0, -150, 0, { rough: 0.6 });
  box(g, "torre", "sc8b", 0xe7e0d4, 30, 24, 26, 0, -120, 0, { rough: 0.6 });
});
const plat = begin("torre", "Plataforma", 0, 340, 70, 0, -70, 40);
box(plat, "torre", "plat", 0xe7dcc8, 240, 8, 180, 0, 0, 0, { rough: 0.65 });
const pile = begin("torre", "6 fixtures", 0, 520, 40, 0, 70, 190);
for (let i = 0; i < 6; i++) {
  const y = -150 + i * 62;
  box(pile, "torre", "tray", 0xf3eadc, 150, 8, 100, 0, y, 0, { rough: 0.62 });
  [[52, 32], [-52, 32], [52, -32], [-52, -32]].forEach(function (p) {
    cyl(pile, "torre", "post", 0xe2d3bc, 4, 54, p[0], y + 30, p[1], "y", { rough: 0.6 });
  });
}
const guides = begin("torre", "4 guias en L", 0, 520, 55, -190, 0, 0);
[[-96, -70], [-96, 70], [96, -70], [96, 70]].forEach(function (p) {
  box(guides, "torre", "guide", 0xf0e6d6, 12, 360, 12, p[0], 0, p[1], { rough: 0.6 });
});
const push = begin("torre", "Empujador", 0, 360, 150, 0, 30, 180);
box(push, "torre", "nema", 0x1a1a1a, 48, 42, 42, -130, 0, 0, { metal: 0.3, rough: 0.4 });
cyl(push, "torre", "pinion", 0xe7dcc8, 15, 14, -90, 8, 0, "y", { rough: 0.55 });
box(push, "torre", "rack", 0xe2d3bc, 200, 14, 14, 20, 0, 0, { rough: 0.6 });
cyl(push, "torre", "prod", 0xeef0f2, 4, 180, 10, -16, 28, "x", { metal: 0.85, rough: 0.2 });
cyl(push, "torre", "prod2", 0xeef0f2, 4, 180, 10, -16, -28, "x", { metal: 0.85, rough: 0.2 });
box(push, "torre", "sc8p", 0xe7e0d4, 26, 20, 22, 40, -10, 28, { rough: 0.6 });
box(push, "torre", "sc8q", 0xe7e0d4, 26, 20, 22, 40, -10, -28, { rough: 0.6 });
const limits = begin("torre", "3 finales NC", 0, 250, 90, 0, -80, 130);
box(limits, "torre", "limit", 0x111111, 20, 12, 10, -72, 0, 0);
box(limits, "torre", "limitb", 0x111111, 20, 12, 10, 72, 0, 0);
box(limits, "torre", "limitc", 0x111111, 20, 12, 10, -130, 110, 50);
const funnels = begin("torre", "Embudos de acople", 0, 200, 230, 0, -40, 90);
[-80, 80].forEach(function (x) {
  const f = new THREE.Mesh(new THREE.ConeGeometry(24, 40, 16, 1, true), M("torre", "funnel", 0xff6a00, { rough: 0.5 }));
  f.rotation.x = Math.PI / 2;
  f.position.set(x, 0, 0);
  funnels.add(f);
});
const drv = begin("torre", "2 A4988 y capacitores", 130, 268, -78, 160, 140, -40);
box(drv, "torre", "a4988", 0x8e2f2f, 22, 10, 16, -16, 0, 0);
box(drv, "torre", "a4988b", 0x8e2f2f, 22, 10, 16, 16, 0, 0);
box(drv, "torre", "sink", 0x222222, 14, 6, 10, -16, 8, 0, { metal: 0.4 });
box(drv, "torre", "sinkb", 0x222222, 14, 6, 10, 16, 8, 0, { metal: 0.4 });
cyl(drv, "torre", "cap", 0x1d4e89, 5, 12, -16, 6, 16, "y");
cyl(drv, "torre", "capb", 0x1d4e89, 5, 12, 16, 6, 16, "y");

// Electrónica
const bat = begin("electronica", "Bateria BR-1224", -155, 195, 35, -50, 0, 140);
box(bat, "electronica", "bat", 0x1a1a1a, 150, 140, 100, 0, 0, 0, { rough: 0.72 });
box(bat, "electronica", "term", 0xd4b25a, 16, 10, 16, -78, 60, 20, { metal: 0.75 });
box(bat, "electronica", "termb", 0xd4b25a, 16, 10, 16, -78, 60, -24, { metal: 0.75 });
const pbox = begin("electronica", "Caja de potencia", 55, 155, 145, 40, 0, 170);
box(pbox, "electronica", "box", 0x8d939a, 110, 48, 72, 0, 0, 0, { metal: 0.35, rough: 0.45 });
cyl(pbox, "electronica", "redbtn", 0xc0392b, 9, 12, -22, 28, 18, "y");
cyl(pbox, "electronica", "bluebtn", 0x2f6fd0, 9, 12, 16, 28, 18, "y");
box(pbox, "electronica", "fuse15", 0xd6a31e, 28, 12, 14, -28, 8, 30, { rough: 0.4 });
box(pbox, "electronica", "fuse10", 0xc0392b, 28, 12, 14, 8, 8, 30, { rough: 0.4 });
box(pbox, "electronica", "relay", 0x1d4e86, 40, 16, 26, 36, 6, -8, { rough: 0.4 });
box(pbox, "electronica", "xt", 0xf0c14a, 18, 12, 14, -46, 4, -8, { rough: 0.4 });
box(pbox, "electronica", "xtb", 0xf0c14a, 18, 12, 14, -46, 4, 16, { rough: 0.4 });
box(pbox, "electronica", "volt", 0x111111, 34, 16, 8, 10, 10, 38);
const board = begin("electronica", "Placa 9 x 15 cm", 10, 255, -70, -20, 30, -160);
box(board, "electronica", "board", 0xd7c49a, 145, 3, 90, 0, 0, 0, { rough: 0.65 });
box(board, "electronica", "kf", 0x1e6b45, 120, 8, 10, 0, 6, 40);
const esp = begin("electronica", "ESP32 38 pines", -20, 270, -88, -80, 150, -30);
box(esp, "electronica", "hdr", 0x222222, 58, 6, 18, 0, -4, 0);
box(esp, "electronica", "esp", 0x111111, 52, 8, 28, 0, 2, 0, { rough: 0.45 });
box(esp, "electronica", "usb", 0xc0c4ca, 10, 6, 8, -28, 2, 0, { metal: 0.5 });
const xl = begin("electronica", "XL4005 a 5 V", 55, 266, -48, 40, 140, -20);
box(xl, "electronica", "xl", 0x1e6b45, 42, 8, 20, 0, 0, 0);
const max485 = begin("electronica", "MAX485", 90, 264, -95, 70, 150, -70);
box(max485, "electronica", "max", 0x1d4e86, 20, 6, 16, 0, 0, 0);
const shifter = begin("electronica", "Nivel 4 canales", 90, 264, -70, 110, 120, -10);
box(shifter, "electronica", "shifter", 0x163a28, 22, 6, 14, 0, 0, 0);
const pcf = begin("electronica", "PCF8574", 55, 264, -100, 20, 170, -80);
box(pcf, "electronica", "pcf", 0x1d4e86, 30, 6, 16, 0, 0, 0);
const bno = begin("electronica", "BNO055 opcional", -55, 264, -55, -140, 130, 20);
box(bno, "electronica", "bno", 0x163a28, 26, 6, 20, 0, 0, 0);
const div = begin("electronica", "Divisor 100k / 20k", 20, 262, -40, -20, 120, 40);
cyl(div, "electronica", "r100", 0xc0392b, 2, 8, -6, 0, 0, "x");
cyl(div, "electronica", "r20", 0xd6a31e, 2, 8, 6, 0, 0, "x");
const estop = begin("electronica", "Paro LAY37", -140, Y1 + 42, 150, -40, 90, 50);
cyl(estop, "electronica", "ering", 0xf0c14a, 22, 6, 0, -8, 0, "y");
cyl(estop, "electronica", "estop", 0xc0392b, 16, 18, 0, 4, 0, "y");
const rocker = begin("electronica", "Interruptor KCD1", -90, Y1 + 40, 150, 30, 90, 50);
box(rocker, "electronica", "sw", 0x111111, 22, 12, 14, 0, 0, 0);
box(rocker, "electronica", "key", 0xc0392b, 10, 4, 8, 0, 8, 0);
const jet = begin("electronica", "Jetson Orin Nano", 10, Y1 + 48, -50, 0, 130, -80);
box(jet, "electronica", "jet", 0x143326, 103, 14, 90, 0, 0, 0, { rough: 0.45 });
box(jet, "electronica", "sink", 0x2a2e32, 48, 16, 48, 0, 16, 0, { metal: 0.45, rough: 0.4 });
cyl(jet, "electronica", "fan", 0x111111, 16, 6, 0, 26, 0, "y");
box(jet, "electronica", "plug", 0x222222, 14, 8, 14, 58, 0, 20);
const yah = begin("electronica", "Yahboom IMX219 opc.", 70, Y1 + 40, -20, 80, 100, 20);
box(yah, "electronica", "yah", 0x1a1a1a, 28, 8, 28, 0, 0, 0);
cyl(yah, "electronica", "ylens", 0x22262c, 6, 10, 0, 8, 8, "z");
const cam = begin("electronica", "Logitech USB", 100, Y1 + 46, 168, 40, 80, 70);
box(cam, "electronica", "cam", 0x1c1c1c, 86, 32, 36, 0, 0, 0, { rough: 0.4 });
cyl(cam, "electronica", "ring", 0xc5c9ce, 12, 8, 0, 0, 20, "z", { metal: 0.7, rough: 0.25 });
cyl(cam, "electronica", "lens", 0x142033, 8, 6, 0, 0, 26, "z", { metal: 0.4, rough: 0.15 });
const neo = begin("electronica", "Neopixel opcional", 0, Y1 + 44, 175, 0, 70, 40);
box(neo, "electronica", "neo", 0x222222, 120, 6, 8, 0, 0, 0);
box(neo, "electronica", "led", 0x2f6fd0, 8, 4, 6, -40, 4, 0);
box(neo, "electronica", "ledb", 0xc0392b, 8, 4, 6, 0, 4, 0);
box(neo, "electronica", "ledc", 0x1e6b45, 8, 4, 6, 40, 4, 0);
const buzz = begin("electronica", "Buzzer opcional", -50, 270, -40, -90, 110, 30);
cyl(buzz, "electronica", "buzz", 0x111111, 8, 8, 0, 0, 0, "y");
const qtr = begin("electronica", "QTR-8A opcional", 0, 78, 175, 0, -70, 80);
box(qtr, "electronica", "qtr", 0x163a28, 76, 6, 14, 0, 0, 0);
for (let i = -3; i <= 3; i++) cyl(qtr, "electronica", "ir", 0x111111, 2.2, 4, i * 9, -4, 0, "y");
[[150, 175, 0, "VL53 frontal der."], [-150, 175, 0, "VL53 frontal izq."], [0, 175, -175, "VL53 trasero"], [0, 640, 40, "VL53 de la pila"]].forEach(function (p, i) {
  const g = begin("electronica", p[3], p[0], p[1], p[2], (i - 1.5) * 40, 80, i === 3 ? 0 : 50);
  box(g, "electronica", "tof", 0x1e6b45, 24, 6, 14, 0, 0, 0);
  cyl(g, "electronica", "eye", 0x111111, 3, 4, 0, 0, 8, "z");
});

// Arnés. El grupo vive en el punto medio; al abrirlo se aparta y la línea marca ese punto.
function wire(name, hex, key, pts, ex, ey, ez) {
  const mid = pts[Math.floor(pts.length / 2)];
  const g = begin("arnes", name, mid[0], mid[1], mid[2], ex, ey, ez);
  const curve = new THREE.CatmullRomCurve3(pts.map(function (p) {
    return new THREE.Vector3(p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]);
  }));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 4.2, 7, false), M("arnes", key, hex, { rough: 0.4 })));
}
wire("12 V hasta el elevador", 0xd23a2e, "p12", [[-233, 255, 55], [-200, 170, 150], [20, 160, 175], [70, 175, 140], [70, 175, -145]], 0, 80, 200);
wire("18 V al M0601 izq.", 0xe07a1f, "p18", [[70, 160, -145], [-40, 120, -160], [-278, 90, 34]], -80, -20, 160);
wire("18 V al M0601 der.", 0xe07a1f, "p18b", [[70, 160, -145], [160, 120, -160], [278, 90, 34]], 80, -20, 160);
wire("Tierra comun", 0x1a1a1a, "gnd", [[-233, 255, 11], [-180, 120, 20], [10, 140, 40], [278, 70, -20], [-278, 70, -20]], 0, -50, 180);
wire("5 V, Jetson y paro", 0xe2b43a, "p5", [[55, 270, -48], [-210, 300, 160], [-210, Y1, 150], [-140, Y1 + 30, 150], [68, Y1 + 40, -30]], -40, 40, 140);
wire("RS485 y senales", 0x2f6fd0, "rs", [[90, 264, -95], [-210, 240, -90], [-278, 85, -34], [278, 85, -34], [-72, 250, 90], [0, 640, 40]], 0, 20, 210);

// UI
const asms = document.getElementById("asms");
const piece = document.getElementById("piece");
let selected = null;
let explodeT = 0;
ASM.forEach(function (a) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "asm";
  b.dataset.id = a[0];
  b.innerHTML = a[1] + "<small>" + a[2] + "</small>";
  b.addEventListener("click", function () { select(a[0]); });
  asms.appendChild(b);
});
function showList(id) {
  piece.innerHTML = "";
  const rows = id ? NOTES[id] : ["Elige un apartado para ver la lista y los puntos de montaje."];
  rows.forEach(function (text) {
    const li = document.createElement("li");
    if (!id) li.className = "muted";
    li.textContent = text;
    piece.appendChild(li);
  });
  document.getElementById("piece-title").textContent = id ? "Dónde va cada pieza" : "Piezas de este apartado";
}
function select(id) {
  selected = selected === id ? null : id;
  explodeT = selected ? 1 : 0;
  document.getElementById("exp").value = String(explodeT * 100);
  document.querySelectorAll("button.asm").forEach(function (b) { b.classList.toggle("on", b.dataset.id === selected); });
  const row = ASM.filter(function (a) { return a[0] === selected; })[0];
  document.getElementById("hint-title").textContent = row ? row[1] : "Cuerpo armado.";
  document.getElementById("hint-text").textContent = row
    ? "Solo este apartado está abierto. La línea punteada regresa cada pieza a su tornillo."
    : "Elige un apartado. Solo ese se abre, y cada pieza queda unida con una línea a su lugar.";
  showList(selected);
  apply();
}
function apply() {
  items.forEach(function (it) {
    const open = selected === it.asm;
    const t = open ? explodeT : 0;
    it.g.position.copy(it.home).addScaledVector(it.exp, t);
    const show = open && t > 0.05;
    it.label.visible = show;
    it.guide.visible = show;
    if (!show) return;
    const pos = it.guide.geometry.attributes.position;
    pos.setXYZ(0, it.home.x, it.home.y, it.home.z);
    pos.setXYZ(1, it.g.position.x, it.g.position.y, it.g.position.z);
    pos.needsUpdate = true;
    it.guide.computeLineDistances();
    it.label.position.set(it.g.position.x, it.g.position.y + 36, it.g.position.z);
  });
  Object.keys(mats).forEach(function (k) {
    const m = mats[k];
    const on = !selected || m.userData.asm === selected;
    m.opacity = on ? 1 : 0.07;
    m.transparent = !on;
    m.depthWrite = on;
  });
}
const exp = document.getElementById("exp");
exp.addEventListener("input", function () {
  if (!selected) {
    exp.value = "0";
    document.getElementById("hint-text").textContent = "Primero elige un apartado, a la derecha.";
    return;
  }
  explodeT = Number(exp.value) / 100;
  apply();
});
document.getElementById("btn-fit").addEventListener("click", function () { if (selected) select(selected); });
document.getElementById("btn-exp").addEventListener("click", function () {
  if (!selected) {
    document.getElementById("hint-text").textContent = "Primero elige un apartado, a la derecha.";
    return;
  }
  exp.value = "100";
  explodeT = 1;
  apply();
});

const target = new THREE.Vector3(30, 390, 30);
let yaw = 0.48, pitch = 0.28, dist = 1750;
let dragging = false, lx = 0, ly = 0;
const el = renderer.domElement;
el.addEventListener("pointerdown", function (e) { dragging = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); });
el.addEventListener("pointerup", function () { dragging = false; });
el.addEventListener("pointermove", function (e) {
  if (!dragging) return;
  yaw -= (e.clientX - lx) * 0.005;
  pitch = Math.max(0.12, Math.min(1.15, pitch + (e.clientY - ly) * 0.005));
  lx = e.clientX; ly = e.clientY;
});
el.addEventListener("wheel", function (e) {
  e.preventDefault();
  dist = Math.max(700, Math.min(3200, dist * (e.deltaY > 0 ? 1.08 : 0.92)));
}, { passive: false });
function frame() {
  const cp = Math.cos(pitch);
  camera.position.set(target.x + dist * cp * Math.sin(yaw), target.y + dist * Math.sin(pitch), target.z + dist * cp * Math.cos(yaw));
  camera.lookAt(target);
}
function resize() {
  const w = document.getElementById("view").clientWidth;
  const h = document.getElementById("view").clientHeight;
  if (w < 2 || h < 2) return false;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  return true;
}
let fitted = false;
function fitView() {
  if (!resize()) return;
  const box = new THREE.Box3();
  items.forEach(function (it) {
    if (it.asm === "arnes") return;
    box.expandByObject(it.g);
  });
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  target.set(center.x, center.y, center.z);
  const v = camera.fov * Math.PI / 180;
  const hf = 2 * Math.atan(Math.tan(v / 2) * camera.aspect);
  dist = 1.28 * Math.max((size.y / 2) / Math.tan(v / 2), (size.x / 2) / Math.tan(hf / 2));
  fitted = true;
}
window.addEventListener("resize", function () { if (fitted) resize(); else fitView(); });
apply();
(function loop() {
  if (!fitted) fitView();
  frame();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
})();
