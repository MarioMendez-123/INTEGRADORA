// Diapositivas de Aether: /slides.html?lang=en (inglés, por defecto) o ?lang=es.
// Sin avance automático: flecha o clic avanzan; flecha atrás o clic en el borde izquierdo retroceden.
// Los datos salen del informe integrador (Avance 2). Lo estimado se rotula "estimate" en la propia lámina.
const LANG = new URLSearchParams(location.search).get("lang") === "es" ? "es" : "en";
document.documentElement.lang = LANG;
const T = (en, es) => (LANG === "en" ? en : es);
const IMG = "/assets/slides/";

const fig = (src, cap, cls = "") => `<figure class="a ${cls}" style="--i:2"><div class="frame"><img src="${IMG}${src}" alt="${cap}"></div>${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
const card = (head, text, i, n = "") => `<div class="card a" style="--i:${i}">${n ? `<span class="n">${n}</span>` : ""}<h3>${head}</h3>${text ? `<p>${text}</p>` : ""}</div>`;
const photoCard = (src, head, text, i) => `<div class="card photo a" style="--i:${i}"><img src="${IMG}${src}" alt="${head}"><h3>${head}</h3><p>${text}</p></div>`;

const LOGO = `<svg class="a" viewBox="-14 -14 328 328" width="250" height="250" style="filter:drop-shadow(0 0 26px #5b4fe8)"><polygon points="150,0 280,75 280,225 150,300 20,225 20,75" fill="none" stroke="#8b7fff" stroke-width="7"/>${[[150, 0], [280, 75], [280, 225], [150, 300], [20, 225], [20, 75]].map(([x, y]) => `<line x1="150" y1="150" x2="${x}" y2="${y}" stroke="#5b4fe8" stroke-width="3"/><circle cx="${x}" cy="${y}" r="10" fill="#8b7fff"/>`).join("")}<circle cx="150" cy="150" r="20" fill="#f2f3f8"/></svg>`;

// ── Cronograma: fechas del informe (tablas 19 y 20). Columnas: semanas desde el 31/08. ──
const WEEKS = ["31/08", "07/09", "14/09", "21/09", "28/09", "05/10", "12/10", "19/10", "26/10", "02/11", "09/11", "16/11", "23/11", "30/11"];
const GANTT = [
  [T("Team and idea", "Equipo e idea"), 0, 1, "plan"],
  [T("Concept design", "Diseño conceptual"), 1, 3, "plan"],
  [T("Technical design and planning", "Diseño técnico y planeación"), 3, 5, "plan"],
  [T("Architecture, server, vision", "Arquitectura, servidor, visión"), 0, 0, "done"],
  [T("Lumina: voice and face", "Lumina: voz y cara"), 0, 2, "done"],
  [T("Scope change: belt and piston", "Cambio de alcance: banda y pistón"), 2, 2, "done"],
  [T("LOGO! and cell piston", "LOGO! y pistón de la celda"), 4, 8, "done"],
  [T("Jetson bring-up and agents", "Puesta en marcha del Jetson y agentes"), 7, 7, "done"],
  [T("Timing and belt tests", "Tiempos y pruebas con la banda"), 7, 9, "now"],
  [T("Cart build (final stage) and firmware", "Carrito (etapa final) y firmware"), 7, 10, "now"],
  [T("Testing and validation", "Pruebas y validación"), 7, 9, "plan"],
  [T("Full cell-to-cart tests", "Pruebas integrales celda a carrito"), 10, 11, "next"],
  [T("Preliminary delivery (Nov 20)", "Entrega preliminar (20 nov)"), 9, 11, "plan"],
  [T("Pre-integration review (Nov 26)", "Pre-integradora (26 nov)"), 12, 12, "plan"],
  [T("Final presentation (Dec 3)", "Presentación final (3 dic)"), 13, 13, "plan"],
];
const ganttHtml = () => `<div class="grow a" style="--i:1"><div class="gantt"><span></span>${WEEKS.map((w) => `<span class="w">${w}</span>`).join("")}${GANTT.map(([name, a, b, k]) => `<span class="name">${name}</span><span class="bar g-${k}" style="grid-column:${a + 2}/${b + 3}"></span>${b < 13 ? `<span style="grid-column:${b + 3}/-1"></span>` : ""}`).join("")}</div><div class="legend"><span><i class="g-plan"></i>${T("Course calendar", "Calendario del curso")}</span><span><i class="g-done"></i>${T("Done", "Terminado")}</span><span><i class="g-now"></i>${T("In progress", "En proceso")}</span><span><i class="g-next" style="height:15px"></i>${T("Planned", "Planeado")}</span></div></div>`;

// ── Presupuesto: tabla 23 del informe, costo real en MXN. ──
const COSTS = [
  [T("Navigation and computing", "Navegación y cómputo"), 8917.78],
  [T("Traction", "Tracción"), 3670.0],
  [T("Structure", "Estructura"), 3122.0],
  [T("Tower and pusher", "Torre y empujador"), 1535.0],
  [T("Power and electronics", "Energía y electrónica"), 1458.0],
  [T("Tools, shipping, travel", "Herramientas y envíos"), 927.58],
  [T("Manufacturing cell (belt)", "Celda (banda)"), 578.0],
];
const money = (v) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const costBars = () => `<div class="bars a grow" style="--i:1">${COSTS.map(([k, v]) => `<div class="row"><span>${k}</span><div class="track"><div class="fill" style="width:${(v / 8917.78) * 100}%"></div></div><span class="num">${money(v)}</span></div>`).join("")}</div>`;

// ── Diagramas dibujados aquí para que existan en los dos idiomas. ──
const box = (x, y, w, h, title, sub = "", color = "#8b7fff") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#0d1020" stroke="${color}" stroke-width="2.5"/><text x="${x + w / 2}" y="${y + (sub ? h / 2 - 8 : h / 2 + 10)}" fill="#f2f3f8" font-size="29" font-weight="700" text-anchor="middle">${title}</text>${sub ? sub.split("|").map((s, i) => `<text x="${x + w / 2}" y="${y + h / 2 + 24 + i * 27}" fill="#9aa1b8" font-size="22" text-anchor="middle">${s}</text>`).join("") : ""}`;
const arrow = (x1, y1, x2, y2, label = "", color = "#8b7fff", dy = -12) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" marker-end="url(#ah)"/>${label ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 + dy}" fill="${color}" font-size="22" font-weight="600" text-anchor="middle">${label}</text>` : ""}`;
const svg = (w, h, inner) => `<svg class="dia a" style="--i:1" viewBox="0 0 ${w} ${h}"><defs><marker id="ah" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9z" fill="#8b7fff"/></marker></defs>${inner}</svg>`;

const workflow = () => svg(1700, 640,
  `<g class="lit" data-k="0">`+(box(0, 200, 270, 150, T("Part on belt", "Pieza en banda"), T("fixture holds it|YOLO recognizes it", "el fixture la sujeta|YOLO la reconoce")))+`</g>` +
  `<g class="lit" data-k="1">`+(arrow(270, 275, 345, 275))+(box(345, 200, 300, 150, T("Vision judges", "La visión juzga"), T("5 equal readings|every 0.5 s", "5 lecturas iguales|cada 0.5 s")))+`</g>` +
  `<g class="lit" data-k="2">`+(arrow(645, 240, 790, 110, "", "#3ddc97") + `<text x="690" y="150" fill="#3ddc97" font-size="30" font-weight="800" text-anchor="middle">PASS</text>`)+(box(790, 35, 290, 150, T("Belt advances", "Avanza la banda"), T("LOGO! moves|the motor", "el LOGO! mueve|el motor"), "#3ddc97"))+(arrow(1080, 110, 1160, 110))+(box(1160, 35, 250, 150, T("Cart loads", "El carrito carga"), T("6 fixtures", "6 fixtures"), "#3ddc97"))+(arrow(1410, 110, 1470, 110))+(box(1470, 35, 230, 150, T("Delivers", "Entrega"), T("unload table", "mesa de descarga"), "#3ddc97"))+`</g>` +
  `<g class="lit" data-k="3">`+(arrow(645, 310, 790, 440, "", "#ff5d6c") + `<text x="690" y="425" fill="#ff5d6c" font-size="30" font-weight="800" text-anchor="middle">FAIL</text>`)+(box(790, 365, 290, 150, T("Piston ejects", "El pistón expulsa"), T("part goes|to scrap", "la pieza va|a scrap"), "#ff5d6c"))+`</g>` +
  `<g class="lit" data-k="4">`+(`<rect x="0" y="560" width="1700" height="70" rx="10" fill="#14173a" stroke="#5b4fe8" stroke-width="2"/><text x="850" y="605" fill="#f2f3f8" font-size="29" font-weight="600" text-anchor="middle">${T("Every step is logged on the server: observed data stays separate from declared inventory", "Cada paso queda en el servidor: lo observado se guarda aparte del inventario declarado")}</text>`)+`</g>`);

const network = () => svg(1700, 700,
  `<text x="360" y="32" fill="#9aa1b8" font-size="24" text-anchor="middle" font-family="IBM Plex Mono">${T("MANUFACTURING CELL", "CELDA DE MANUFACTURA")}</text><text x="1340" y="32" fill="#9aa1b8" font-size="24" text-anchor="middle" font-family="IBM Plex Mono">${T("MOBILE ROBOT", "ROBOT MÓVIL")}</text>` +
  box(650, 60, 400, 160, T("Laptop (server)", "Laptop (servidor)"), T("FastAPI, SQLite, dashboard|Lumina: Ollama and Vosk", "FastAPI, SQLite, panel|Lumina: Ollama y Vosk"), "#f2f3f8") +
  box(180, 290, 360, 150, "Raspberry Pi 4", T("USB camera, PASS/FAIL|GPIO 8 and 9", "cámara USB, PASS/FAIL|GPIO 8 y 9")) +
  box(1160, 290, 360, 150, "Jetson Orin Nano Super", T("camera, YOLO, ArUco|port 8001", "cámara, YOLO, ArUco|puerto 8001")) +
  arrow(650, 170, 400, 290) + `<text x="490" y="205" fill="#8b7fff" font-size="22" font-weight="600" text-anchor="end">${T("LAN: part events", "Red local: eventos de pieza")}</text>` +
  arrow(1050, 170, 1300, 290) + `<text x="1210" y="205" fill="#8b7fff" font-size="22" font-weight="600" text-anchor="start">${T("LAN: observations", "Red local: observaciones")}</text>` +
  box(180, 530, 360, 150, "LOGO! (PLC)", T("belt motor, piston valve|IR presence sensor", "motor de banda, válvula|sensor infrarrojo")) +
  box(1160, 530, 360, 150, "ESP32", T("steppers, servo, sensors|1 s safety watchdog", "pasos, servo, sensores|vigilancia de 1 s")) +
  arrow(360, 440, 360, 530, T("relays (isolated)", "relevadores (aislados)"), "#8b7fff", 6).replace('text-anchor="middle">', 'text-anchor="start" dx="16">') +
  arrow(1340, 440, 1340, 530, "USB", "#8b7fff", 6).replace('text-anchor="middle">', 'text-anchor="start" dx="16">') +
  box(690, 545, 320, 120, T("Wheel motors", "Motores de rueda"), T("M0601 over RS485", "M0601 por RS485"), "#5b4fe8") +
  arrow(1160, 605, 1010, 605, "RS485"));


const perceptionDiagram = () => svg(1700, 330,
  box(0, 70, 250, 170, T("Camera", "Cámara"), T("1080p video|on the cart", "video 1080p|en el carrito")) +
  arrow(250, 155, 320, 155) +
  box(320, 70, 270, 170, "YOLO", T("box + class|of each part", "caja y clase|de cada pieza"), "#8b7fff") +
  arrow(590, 155, 660, 155) +
  box(660, 70, 290, 170, T("Code reader", "Lector de código"), T("barcode / QR|inside the box", "código de barras / QR|dentro de la caja"), "#3ddc97") +
  arrow(950, 155, 1020, 155) +
  box(1020, 70, 290, 170, "ArUco", T("checks position|never navigates alone", "verifica la posición|nunca navega solo"), "#e0a64a") +
  arrow(1310, 155, 1380, 155) +
  box(1380, 70, 320, 170, T("Observation", "Observación"), T("class, code, position|unique event_id", "clase, código, posición|event_id único"), "#f2f3f8") +
  `<text x="850" y="300" fill="#9aa1b8" font-size="26" text-anchor="middle">${T("Finding something is not understanding it: each step adds certainty.", "Encontrar algo no es entenderlo: cada paso suma certeza.")}</text>`);

const inventoryDiagram = () => svg(1700, 330,
  box(0, 40, 400, 170, T("Observations", "Observaciones"), T("what the cameras saw|raw, only added", "lo que vieron las cámaras|crudo, solo se agrega")) +
  arrow(400, 125, 560, 125, T("aggregate", "agrupa"), "#8b7fff") +
  box(560, 40, 460, 170, T("Declared inventory", "Inventario declarado"), T("one row per product|never deleted", "una fila por producto|nunca se borra"), "#3ddc97") +
  arrow(1020, 125, 1180, 125, T("coverage", "cobertura"), "#8b7fff") +
  box(1180, 40, 520, 170, T("Coverage state", "Estado de cobertura"), "COMPLETE · PARTIAL · INVALID", "#e0a64a") +
  `<text x="850" y="290" fill="#9aa1b8" font-size="26" text-anchor="middle">${T("A partial run can never silently overwrite what was declared before.", "Una corrida parcial nunca sobrescribe en silencio lo declarado antes.")}</text>`);

const colStack = (...parts) => `<div style="display:flex;flex-direction:column;gap:26px;flex:1;min-height:0;width:100%">${parts.join("")}</div>`;
const cardRow = (n, ...cs) => `<div class="cards c${n} a" style="--i:2;flex:0 0 auto;align-content:start">${cs.join("")}</div>`;
const sideCards = (...cs) => `<style>.sc{align-content:start!important;gap:18px!important}.sc .card{padding:22px 26px!important;gap:8px!important}.sc .card h3{font-size:34px!important}.sc .card p{font-size:24px!important;line-height:1.28!important}</style><div class="cards sc a" style="--i:2;flex:0 0 500px">${cs.join("")}</div>`;
const keyTable = (head, rows, size = 27) => `<table class="a" style="--i:1;font-size:${size}px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="k"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</table>`;

// ── Láminas interactivas de "Cómo funciona": cada paso lo da la flecha o el clicker; los botones son opcionales. ──
const tween = (el, to) => { const from = +el.textContent || 0; for (let i = 1; i <= 12; i++) later(() => { el.textContent = Math.round(from + ((to - from) * i) / 12); }, i * 40); };
const fillBar = (el, ms) => { el.style.transition = "none"; el.style.width = "0"; void el.offsetWidth; el.style.transition = `width ${ms}ms linear`; el.style.width = "100%"; };
const btn = (cls, k, label) => `<button class="btn ${cls}" data-stop data-jump="${k}">${label}</button>`;

// Percepción: el cuadro de la cámara con lo que cada paso le agrega.
const flow5 = () => svg(1700, 170, [
  [T("Camera", "Cámara"), T("1080p video", "video 1080p"), "#8b7fff"],
  ["YOLO", T("box + class", "caja y clase"), "#8b7fff"],
  [T("Code reader", "Lector de código"), T("barcode / QR", "código de barras / QR"), "#3ddc97"],
  ["ArUco", T("checks position", "verifica posición"), "#e0a64a"],
  [T("Observation", "Observación"), T("unique event_id", "event_id único"), "#f2f3f8"],
].map(([t, sub, c], k) => `<g class="lit" data-k="${k}">${k ? arrow(k * 340 - 70, 80, k * 340, 80, "", c) : ""}${box(k * 340, 10, 270, 140, t, sub, c)}</g>`).join(""));

const ARUCO = ["10110", "01001", "11010", "00111", "10101"];
const frameMock = () => `<svg viewBox="0 0 820 400" style="width:100%;height:100%"><rect width="820" height="400" rx="12" fill="#0a0c14" stroke="#262b45" stroke-width="2"/>
  <rect x="0" y="95" width="820" height="210" fill="#161a2c"/><rect x="250" y="120" width="320" height="170" rx="14" fill="#aeb4c6"/><rect x="270" y="135" width="280" height="22" rx="4" fill="#c9cddb"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${290 + i * 9}" y="222" width="${i % 3 === 0 ? 5 : 3}" height="44" fill="#1a1d2b"/>`).join("")}
  <g transform="translate(655 200)"><rect width="110" height="110" fill="#fff"/>${ARUCO.map((r, y) => [...r].map((b, x) => (b === "1" ? `<rect x="${10 + x * 18}" y="${10 + y * 18}" width="18" height="18" fill="#05070a"/>` : "")).join("")).join("")}</g>
  <text x="18" y="34" fill="#9aa1b8" font-size="20" font-family="IBM Plex Mono">${T("CAMERA VIEW · illustration", "VISTA DE LA CÁMARA · ilustración")}</text>
  <g class="lit" data-k="1"><rect x="240" y="110" width="340" height="190" fill="none" stroke="#3ddc97" stroke-width="4"/><rect x="240" y="74" width="250" height="36" fill="#3ddc97"/><text x="252" y="100" fill="#05070a" font-size="23" font-weight="700" font-family="IBM Plex Mono">pieza_buena 0.97</text></g>
  <g class="lit" data-k="2"><rect x="282" y="214" width="122" height="60" fill="none" stroke="#e0a64a" stroke-width="3" stroke-dasharray="8 5"/><rect x="282" y="230" width="122" height="3" fill="#ff5d6c"><animate attributeName="y" values="216;270;216" dur="1.6s" repeatCount="indefinite"/></rect><text x="282" y="326" fill="#e0a64a" font-size="22" font-family="IBM Plex Mono">7501031455</text></g>
  <g class="lit" data-k="3"><rect x="648" y="193" width="124" height="124" fill="none" stroke="#e0a64a" stroke-width="4"/><text x="648" y="345" fill="#e0a64a" font-size="22" font-family="IBM Plex Mono">ID 12 · OK</text></g>
  <g class="lit" data-k="4"><rect x="4" y="4" width="812" height="392" rx="12" fill="none" stroke="#f2f3f8" stroke-width="4"/><text x="410" y="382" fill="#f2f3f8" font-size="22" text-anchor="middle" font-family="IBM Plex Mono">→ ${T("sent to the server", "enviada al servidor")}</text></g></svg>`;

const PERC_CAP = [
  T("The camera on the cart sends <em>1080p video</em>.", "La cámara del carrito manda <em>video 1080p</em>."),
  T("<em>YOLO</em> draws a box and names the class. mAP50 0.98 on our validation photos (a small set).", "<em>YOLO</em> dibuja una caja y nombra la clase. mAP50 0.98 en nuestras fotos de validación (un conjunto pequeño)."),
  T("The <em>code reader</em> reads the barcode or QR: the exact product, no guessing.", "El <em>lector de código</em> lee el código de barras o QR: el producto exacto, sin adivinar."),
  T("<em>ArUco</em> only confirms position. A reflection can return a wrong but valid ID, so it never works alone.", "<em>ArUco</em> solo confirma posición. Un reflejo puede dar un ID equivocado pero válido, por eso nunca se usa solo."),
  T("Everything becomes <em>one observation</em> with a unique event_id: each step adds certainty.", "Todo se vuelve <em>una observación</em> con event_id único: cada paso suma certeza."),
];

// Inventario: lo observado no es lo declarado.
const INV = [
  { obs: 430, dec: 51, st: "—", cls: "", msg: T("Start: <em>51 declared</em> products built from <em>430 observations</em>.", "Inicio: <em>51 productos declarados</em> a partir de <em>430 observaciones</em>.") },
  { obs: 454, dec: 53, st: "COMPLETE", cls: "p-ok", msg: T("<em>Complete</em> run: every product was seen, so the new ones are declared.", "Corrida <em>completa</em>: se vieron todos los productos, así que los nuevos se declaran.") },
  { obs: 463, dec: 53, st: "PARTIAL", cls: "p-go", msg: T("<em>Partial</em> run: observations are saved, but the declared inventory is <em>not overwritten</em>.", "Corrida <em>parcial</em>: las observaciones se guardan, pero el inventario declarado <em>no se sobrescribe</em>.") },
  { obs: 466, dec: 53, st: "INVALID", cls: "p-bad", msg: T("<em>Invalid</em> run: logged for audit, never used to change the inventory.", "Corrida <em>inválida</em>: queda en la bitácora, nunca se usa para cambiar el inventario.") },
];
const invStat = (id, head, v, sub) => `<div class="stat" id="${id}"><h4>${head}</h4><div class="v">${v}</div><div class="s">${sub}</div></div>`;

// Celda: el juicio de 5 lecturas iguales, a velocidad ×3.
const SPD = 3;
const cellSim = () => `<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center">
  <div class="lane"><div class="lab">${T("Camera judgment", "Juicio de la cámara")}<br>${T("every 0.5 s", "cada 0.5 s")}</div><div class="slots">${[0, 1, 2, 3, 4].map((i) => `<div class="slot" id="sl${i}">·</div>`).join("")}</div></div>
  <div class="lane"><div class="lab">${T("Belt (LOGO!)", "Banda (LOGO!)")}</div><div class="seg" id="bseg"><div style="flex:1"><i></i><span>${T("stopped · 0.5 s pulse from GPIO 9 → advances", "detenida · pulso de 0.5 s del GPIO 9 → avanza")}</span></div></div></div>
  <div class="lane"><div class="lab">${T("Piston", "Pistón")}</div><div class="seg" id="pseg"><div style="flex:3"><i></i><span>${T("wait 3 s", "espera 3 s")}</span></div><div style="flex:1"><i></i><span>${T("fire 1 s", "sale 1 s")}</span></div><div style="flex:2"><i></i><span>${T("return 2 s", "regresa 2 s")}</span></div></div></div>
  <div class="verdict" id="vd"></div>
  <div class="btns" style="margin-top:10px">${btn("ok", 1, T("Good part", "Pieza buena"))}${btn("bad", 2, T("Scrap part", "Pieza scrap"))}${btn("warn", 3, T("Blurry frame", "Cuadro borroso"))}<span class="note" style="align-self:center">${T("shown at ×3 speed", "mostrado a velocidad ×3")}</span></div></div>`;
function cellRun(k) {
  const q = (id) => document.getElementById(id);
  const slots = [0, 1, 2, 3, 4].map((i) => q("sl" + i));
  slots.forEach((e) => { e.className = "slot"; e.textContent = "·"; });
  document.querySelectorAll("#pseg i, #bseg i").forEach((i) => { i.style.transition = "none"; i.style.width = "0"; });
  const vd = q("vd");
  vd.className = "verdict";
  if (k === 0) { vd.textContent = T("Press → : a part arrives under the camera.", "Presiona → : llega una pieza bajo la cámara."); return; }
  const seq = ["", "ppppp", "fffff", "ffxff"][k], tick = 500 / SPD;
  vd.textContent = T("Judging…", "Juzgando…");
  [...seq].forEach((c, i) => later(() => { slots[i].className = "slot " + c; slots[i].textContent = c === "p" ? "✓" : c === "f" ? "✗" : "?"; }, tick * (i + 1)));
  const t5 = tick * 5 + 120;
  if (k === 1) later(() => { vd.className = "verdict p"; vd.textContent = T("PASS: 5 equal readings → belt advances", "PASS: 5 lecturas iguales → avanza la banda"); fillBar(q("bseg").firstChild.firstChild, 500 / SPD); }, t5);
  if (k === 2) {
    later(() => {
      vd.className = "verdict f"; vd.textContent = T("FAIL: 5 equal readings → piston ejects the part", "FAIL: 5 lecturas iguales → el pistón expulsa la pieza");
      const s = q("pseg").children;
      fillBar(s[0].firstChild, 3000 / SPD);
      later(() => fillBar(s[1].firstChild, 1000 / SPD), 3000 / SPD);
      later(() => fillBar(s[2].firstChild, 2000 / SPD), 4000 / SPD);
    }, t5);
  }
  if (k === 3) later(() => { vd.className = "verdict x"; vd.textContent = T("The streak broke: no action, it keeps judging", "La racha se rompió: no hace nada, sigue juzgando"); }, t5);
}

// Funcionamiento en 3D: los pasos del capítulo 7 de la guía de armado, reproducidos en el modelo.
const OPS = [
  [T("The whole belt", "La banda completa"), T("Three sections joined by one continuous band, 3.09 m. The cart always arrives at the closed end.", "Tres tramos unidos con una sola cinta, 3.09 m. El carrito siempre llega por el extremo cerrado.")],
  [T("Docking", "Acople"), T("The cart enters slowly (5 cm/s); V-guides center it until its posts hit the stops. The Jetson confirms with ArUco and homes the elevator and pusher.", "El carrito entra despacio (5 cm/s); las guías en V lo centran hasta pegar en los topes. El Jetson confirma con ArUco y hace home del elevador y el empujador.")],
  [T("Inspection and scrap station", "Estación de inspección y scrap"), T("Halfway down the belt the band stops with the fixture under the camera. A rejected part is pushed sideways into the scrap tray.", "A media banda la cinta se detiene con el fixture bajo la cámara. Una pieza rechazada se empuja de lado a la charola de scrap.")],
  [T("PASS: part accepted", "PASS: pieza aceptada"), T("The IR sensor stops the belt; the Pi needs 5 equal judgments, one every 0.5 s. Accepted: green light and a 0.5 s pulse to the LOGO!, which restarts the belt.", "El sensor infrarrojo detiene la cinta; la Pi necesita 5 juicios iguales, uno cada 0.5 s. Aceptada: luz verde y pulso de 0.5 s al LOGO!, que arranca la cinta.")],
  [T("FAIL: part rejected → scrap", "FAIL: pieza rechazada → scrap"), T("Not in the catalog: the Pi waits 3 s, lights the red beacon and fires the valve (GPIO 8) for 1 s. The piston sends the part to the scrap tray.", "No está en el catálogo: la Pi espera 3 s, prende la torreta roja y activa la válvula (GPIO 8) 1 s. El pistón manda la pieza a la charola de scrap.")],
  [T("End guide", "Guía final"), T("In the last 24 cm two printed guides catch the keel even if it is up to 12 mm off, leaving 1 mm per side.", "En los últimos 24 cm dos guías impresas toman la quilla aunque venga corrida hasta 12 mm y la dejan a 1 mm por lado.")],
  [T("Loading with the belt running", "Carga con la cinta corriendo"), T("The fixture rides the belt, drops flat onto the stack, and the pusher pulls it in about 7.6 cm.", "El fixture viaja con la cinta, cae plano a la pila y el empujador lo jala unos 7.6 cm.")],
  [T("Load up to 6, one at a time", "Cargar hasta 6: uno a la vez"), T("One fixture at a time: the PLC releases the next only when the cart reports ready, until the tower holds 6.", "Uno a la vez: el PLC suelta el siguiente solo cuando el carrito avisa listo, hasta que la torre tenga 6.")],
  [T("Trip to the unload station", "Viaje a la estación de descarga"), T("The cart leaves the belt and navigates by waypoints. The ESP32 counts wheel turns and brakes if a sensor sees something under 40 cm.", "El carrito sale de la banda y navega por waypoints. El ESP32 cuenta las vueltas y frena si un sensor ve algo a menos de 40 cm.")],
  [T("Unload: home and rise", "Descarga: home y subir"), T("On arrival the elevator homes, then rises in counted steps until the top fixture sits at the window.", "Al llegar, el elevador hace home y sube por pasos contados hasta que el fixture de arriba queda en la ventana.")],
  [T("The pusher takes out the top one", "El empujador saca el de arriba"), T("The pusher advances 25 cm and returns home; the fixture slides out of the window onto the table.", "El empujador avanza 25 cm y regresa a home; el fixture sale por la ventana a la mesa.")],
  [T("Repeat until the tower is empty", "Repetir hasta vaciar la torre"), T("The platform rises one more level and the pusher removes the next, until the tower is empty. Then the cart returns to the belt.", "La plataforma sube otro nivel y el empujador saca el siguiente, hasta vaciar la torre. Después el carrito regresa a la banda.")],
];
const opSlide = (from, to, sec, by, title) => ({
  sec, by, title, tight: true, op: from, steps: to - from,
  body: () => `<div class="oplist a" style="--i:1">${OPS.slice(from, to + 1).map(([h, p], k) => `<div class="it" data-k="${k}"><h3>${k + 1}. ${h}</h3><p>${p}</p></div>`).join("")}</div>`,
  run: (k) => { lit(k); opStep(from + k); },
});

// ── Las láminas. `by` es quien la presenta. ──
const SLIDES = [
  { by: "Mario", html: () => `<div class="slide title">${LOGO}<div class="word a" style="--i:1">AETHER</div><div class="sub a" style="--i:2">Industrial Systems</div><div class="names a" style="--i:3">Mario Iván Méndez Álvarez · Uriel Armando Rivero Rivero · Juan Emmanuel Martínez Aguirre · Pedro José Pallares Muñoz · David Gerardo Garnica Chaparro · Sadher Isaac Torres Galindo</div></div>` },

  { sec: T("Introduction", "Introducción"), by: "Isaac", title: T("A small manufacturing line that does <em>three jobs</em> usually solved apart", "Una línea de manufactura pequeña que une <em>tres trabajos</em> que suelen ir separados"), body: () => `<div class="cards c3 full">${photoCard("fig31.png", T("Inspect", "Inspecciona"), T("Computer vision checks every part on the belt.", "La visión artificial revisa cada pieza en la banda."), 1)}${photoCard("fig23.png", T("Eject", "Expulsa"), T("A piston removes the part when it is scrap.", "Un pistón retira la pieza cuando es scrap."), 2)}${photoCard("fig05.png", T("Transport", "Transporta"), T("A mobile robot carries good parts and keeps a traceable record.", "Un robot móvil lleva las piezas buenas y deja un registro trazable."), 3)}</div>` },

  { sec: T("Objective", "Objetivo"), by: "Isaac", title: T("Objective", "Objetivo"), body: () => `<div class="big a" style="--i:1">${T("Develop a <em>working automotive manufacturing line</em> that integrates a conveyor with positioning fixtures, a vision check, a scrap-ejecting piston and a mobile inventory unit, running the full cycle of positioning, verification and transport.", "Desarrollar una <em>línea de manufactura automotriz funcional</em> que integre una banda con fixtures de posicionamiento, verificación por visión, un pistón de expulsión de scrap y una unidad móvil de inventario, y que ejecute el ciclo completo de posicionamiento, verificación y transporte.")}</div>` },

  { sec: T("Mission, vision and values", "Misión, visión y valores"), by: "Emmanuel", title: T("What we are here to <em>do</em>", "Para qué <em>estamos aquí</em>"), tight: true, body: () => colStack(
    `<style>.mv .card p{font-size:31px!important;color:#f2f3f8!important}.vals .card{padding:22px 26px!important;gap:8px!important}.vals .card h3{font-size:32px!important}.vals .card p{font-size:23px!important}</style><div class="mv" style="flex:0 0 auto">` + cardRow(2,
      card(T("Mission", "Misión"), T("Build a small manufacturing line that inspects, moves and counts parts on its own, and reports only what it actually saw.", "Construir una línea de manufactura pequeña que inspecciona, mueve y cuenta piezas por sí sola, y reporta solo lo que realmente vio."), 1),
      card(T("Vision", "Visión"), T("Small production lines that automate quality checks, transport and inventory with a system they can understand, test and trust.", "Líneas de producción pequeñas que automatizan la revisión de calidad, el transporte y el inventario con un sistema que pueden entender, probar y en el que pueden confiar."), 2)) + "</div>",
    `<div class="tag a" style="--i:3;margin:6px 0 0">${T("Values", "Valores")}</div>`,
    `<div class="vals" style="flex:0 0 auto">` + cardRow(4,
      card(T("Honesty", "Honestidad"), T("We claim only what we have verified; estimates are labeled as estimates.", "Afirmamos solo lo que verificamos; lo estimado se rotula como estimado."), 4),
      card(T("Safety first", "Seguridad primero"), T("Stopping never depends on the network.", "Detenerse nunca depende de la red."), 5),
      card(T("Tested in parts", "Probado por partes"), T("Each module is tested on its own before it is integrated.", "Cada módulo se prueba por separado antes de integrarse."), 6),
      card(T("Traceability", "Trazabilidad"), T("Every step is logged and nothing is deleted.", "Cada paso queda registrado y nada se borra."), 7)) + "</div>") },

  { sec: T("Abstract", "Resumen"), by: "Uriel", title: T("The project in three steps", "El proyecto en tres pasos"), body: () => `<div class="cards c3">${card(T("Need", "Necesidad"), T("Small lines depend on operators to move parts, verify assembly and count stock: downtime, uneven quality, counting errors.", "Las líneas pequeñas dependen de operadores para mover piezas, verificar y contar: tiempos muertos, calidad desigual y errores de conteo."), 1)}${card(T("Method", "Método"), T("Architecture decisions closed first, then modules built and tested separately before integrating.", "Primero se cerraron las decisiones de arquitectura; luego módulos probados por separado antes de integrarlos."), 2)}${card(T("Result", "Resultado"), T("Cell software, inventory engine, server and dashboard run with automated tests. The cart is in its final build stage; the belt only lacks its camera.", "El software de la celda, el inventario, el servidor y el panel corren con pruebas automáticas. El carrito está en su etapa final de construcción; a la banda solo le falta la cámara."), 3)}</div>` },

  { sec: T("Justification", "Justificación"), by: "David", title: T("Why a <em>third way</em>", "Por qué una <em>tercera vía</em>"), body: () => `<div class="cards c3">${card(T("Complete commercial systems", "Sistemas comerciales completos"), T("Usually exceed the budget of a small or medium company.", "Suelen superar el presupuesto de una pequeña o mediana empresa."), 1)}${card(T("Partial solutions", "Soluciones parciales"), T("Leave coordination gaps that end up being solved by hand.", "Dejan huecos de coordinación que terminan resolviéndose a mano."), 2)}${card("Aether", T("Affordable integration, plus a data layer that never silently overwrites a result.", "Integración accesible, más una capa de datos que nunca sobrescribe un resultado en silencio."), 3)}</div>` },

  { sec: T("Comparison", "Comparativa"), by: "Emmanuel", title: T("Without our system vs. <em>with</em> our system", "Sin nuestro sistema vs. <em>con</em> nuestro sistema"), body: () => `<table class="vs a" style="--i:1"><tr><th></th><th>${T("Without", "Sin")}</th><th>${T("With Aether", "Con Aether")}</th></tr>${[
    [T("Moving parts", "Mover piezas"), T("Operators between stations", "Operadores entre estaciones"), T("Mobile robot", "Robot móvil")],
    [T("Quality check", "Revisión de calidad"), T("Judgment varies by person and shift", "El criterio cambia por persona y turno"), T("Vision: 5 equal readings in a row", "Visión: 5 lecturas iguales seguidas")],
    [T("Scrap", "Scrap"), T("Removed by hand", "Se retira a mano"), T("Ejected by piston", "La expulsa el pistón")],
    [T("Coordination", "Coordinación"), T("The operator is the link: downtime", "El operador es el enlace: tiempos muertos"), T("Direct handshake cell to cart", "Enlace directo celda a carrito")],
    [T("Inventory", "Inventario"), T("Manual count, errors add up", "Conteo manual, errores acumulados"), T("Observed vs. declared, kept apart", "Observado y declarado, por separado")],
    [T("Traceability", "Trazabilidad"), T("Scattered or missing", "Dispersa o inexistente"), T("Full log of every run", "Bitácora completa de cada corrida")],
  ].map(([k, a, b]) => `<tr><td class="k">${k}</td><td>${a}</td><td>${b}</td></tr>`).join("")}</table>` },

  { sec: T("Schedule", "Cronograma"), by: "Isaac", title: T("Activity schedule", "Cronograma de actividades"), tight: true, body: ganttHtml },

  { sec: T("Pricing", "Costos"), by: "David", title: T("What we spent, by subsystem", "Lo que se ha gastado, por subsistema"), body: () => `${costBars()}<div class="cards a" style="--i:2;flex:0 0 480px;align-content:center"><div class="card"><span class="n">${T("PAID SO FAR", "PAGADO")}</span><h3 style="font-size:64px">$20,208</h3><p>MXN</p></div><div class="card"><span class="n">${T("PROJECTED MATERIALS", "MATERIALES PROYECTADOS")}</span><h3>$23,703 – $26,189</h3><p>MXN</p></div></div>` },

  { sec: T("Pricing", "Costos"), by: "David", title: T("Quotation for a final user", "Cotización para un usuario final"), body: () => `<table class="a" style="--i:1"><tr><th>${T("Item", "Concepto")}</th><th>${T("Basis", "Base")}</th><th class="num">MXN</th></tr>
    <tr><td class="k">${T("Materials", "Materiales")}</td><td>${T("Projected purchase list (upper bound)", "Lista de compras proyectada (tope)")}</td><td class="num">26,189</td></tr>
    <tr><td class="k">${T("Labor", "Mano de obra")}</td><td>${T("6 people × 240 h × $75/h (estimate)", "6 personas × 240 h × $75/h (estimado)")}</td><td class="num">108,000</td></tr>
    <tr><td class="k">${T("Build time", "Tiempo de construcción")}</td><td>${T("14 weeks", "14 semanas")}</td><td class="num">—</td></tr>
    <tr><td class="k">${T("Technologies", "Tecnologías")}</td><td>${T("LOGO! PLC, ESP32, Raspberry Pi 4, Jetson Orin Nano, YOLO, FastAPI", "PLC LOGO!, ESP32, Raspberry Pi 4, Jetson Orin Nano, YOLO, FastAPI")}</td><td class="num">—</td></tr>
    <tr class="tot"><td class="k">${T("Final-user price", "Precio al usuario final")}</td><td>${T("Materials + labor + 15% margin (estimate)", "Materiales + mano de obra + 15% de margen (estimado)")}</td><td class="num">≈ 154,000</td></tr></table>` },

  { sec: T("Workflow", "Flujo de trabajo"), by: "Mario · Emmanuel", title: T("General workflow", "Flujo general"), tight: true, steps: 4,
    body: () => colStack(`<div style="flex:1;min-height:0">${workflow()}</div>`, `<div class="stepcap" id="cap"></div>`),
    run: (k) => { lit(k); const t = [
      T("A part arrives on the belt: the <em>fixture</em> holds it and the camera sees it.", "Llega una pieza a la banda: el <em>fixture</em> la sujeta y la cámara la ve."),
      T("The camera judges every 0.5 s; only <em>5 equal readings</em> in a row count.", "La cámara juzga cada 0.5 s; solo cuentan <em>5 lecturas iguales</em> seguidas."),
      T("<em>PASS</em>: the belt advances, the cart loads up to 6 fixtures and delivers them to the unload table.", "<em>PASS</em>: la banda avanza, el carrito carga hasta 6 fixtures y los entrega en la mesa de descarga."),
      T("<em>FAIL</em>: the piston ejects the part and it goes to scrap.", "<em>FAIL</em>: el pistón expulsa la pieza y va a scrap."),
      T("Every step is logged, so nothing happens without a trace.", "Cada paso queda registrado: nada ocurre sin dejar huella."),
    ][k]; document.getElementById("cap").innerHTML = t; } },

  { sec: T("How it works · Perception", "Cómo funciona · Percepción"), by: "Mario · Uriel", title: T("From image to <em>information</em>: perceive, identify, verify", "De imagen a <em>información</em>: percibir, identificar, verificar"), tight: true, steps: 4,
    body: () => colStack(
      `<div style="flex:0 0 auto">${flow5()}</div>`,
      `<div style="flex:1;min-height:0;display:flex;gap:36px"><div style="flex:1.5;min-height:0">${frameMock()}</div><div class="obs" style="flex:1;align-self:stretch;display:flex;flex-direction:column;justify-content:center"><div><span>observation {</span></div><div class="lit" data-k="1">&nbsp;&nbsp;class: <b>"pieza_buena"</b>,</div><div class="lit" data-k="2">&nbsp;&nbsp;code: <b>"7501031455"</b>,</div><div class="lit" data-k="3">&nbsp;&nbsp;aruco: <b>12</b> <span>(position ok)</span>,</div><div class="lit" data-k="4">&nbsp;&nbsp;event_id: <b>"3f9a-…"</b></div><div><span>}</span></div></div></div>`,
      `<div class="stepcap" id="cap"></div>`),
    run: (k) => { lit(k); document.getElementById("cap").innerHTML = PERC_CAP[k]; } },

  { sec: T("How it works · Inventory", "Cómo funciona · Inventario"), by: "Mario", title: T("What was observed is not what is <em>declared</em>", "Lo observado no es lo <em>declarado</em>"), tight: true, steps: 3,
    body: () => colStack(
      `<div class="trio" style="flex:0 0 auto">${invStat("sObs", T("Observations", "Observaciones"), 430, T("what the cameras saw: raw, only added", "lo que vieron las cámaras: crudo, solo se agrega"))}${invStat("sDec", T("Declared inventory", "Inventario declarado"), 51, T("one row per product, never deleted", "una fila por producto, nunca se borra"))}${invStat("sCov", T("Coverage state", "Estado de cobertura"), '<span id="covv" style="font-size:54px">—</span>', T("COMPLETE · PARTIAL · INVALID", "COMPLETE · PARTIAL · INVALID"))}</div>`,
      `<div class="stepcap" id="cap" style="flex:0 0 auto"></div>`,
      `<div class="log" id="log" style="flex:1;min-height:0"></div>`,
      `<div style="flex:0 0 auto;display:flex;flex-direction:column;gap:14px;padding-bottom:30px"><div class="note">${T("Illustration of the rule; the real numbers are on the live dashboard.", "Ilustra la regla; los números reales están en el panel en vivo.")}</div><div class="btns">${btn("ok", 1, T("Complete run", "Corrida completa"))}${btn("warn", 2, T("Partial run", "Corrida parcial"))}${btn("bad", 3, T("Invalid run", "Corrida inválida"))}${btn("", 0, T("Reset", "Reiniciar"))}</div></div>`),
    run: (k) => {
      const d = INV[k], q = (id) => document.getElementById(id);
      tween(q("sObs").querySelector(".v"), d.obs); tween(q("sDec").querySelector(".v"), d.dec);
      const cov = q("covv"); cov.textContent = d.st; cov.style.color = k === 1 ? "var(--ok)" : k === 2 ? "var(--warn)" : k === 3 ? "var(--bad)" : "var(--dim)";
      q("cap").innerHTML = d.msg;
      q("log").innerHTML = INV.slice(1, k + 1).map((r) => `<div class="row"><span class="pill ${r.cls}">${r.st}</span><span>${T("observations", "observaciones")} ${r.obs}, ${T("declared", "declarados")} ${r.dec}</span></div>`).join("");
      if (k > 0) { const s = q(k === 1 ? "sDec" : "sObs"); s.classList.add("flash"); later(() => s.classList.remove("flash"), 900); }
    } },

  { sec: T("How it works · Cell", "Cómo funciona · Celda"), by: "Uriel", title: T("A part is judged only after <em>5 equal readings</em>", "Una pieza se juzga solo tras <em>5 lecturas iguales</em>"), tight: true, steps: 3,
    body: () => colStack(
      cellSim(),
      `<style>.cc .card{padding:20px 24px!important;gap:8px!important}.cc .card h3{font-size:30px!important}.cc .card p{font-size:22px!important}</style><div class="cc" style="flex:0 0 auto;padding-bottom:34px">` + cardRow(4,
        card(T("Every 0.5 s", "Cada 0.5 s"), T("The camera gives one judgment: PASS, FAIL or no part.", "La cámara da un juicio: PASS, FAIL o sin pieza."), 1),
        card(T("5 in a row", "5 seguidas"), T("About 2.5 s, so one blurry frame cannot eject a part.", "Unos 2.5 s: un cuadro borroso no puede expulsar una pieza."), 2),
        card(T("Piston", "Pistón"), T("Waits 3 s, fires 1 s, returns in 2 s. If it cannot fire, it logs the fault.", "Espera 3 s, sale 1 s, regresa en 2 s. Si no puede, registra la falla."), 3),
        card(T("Belt", "Banda"), T("A 0.5 s pulse from GPIO 9 tells the LOGO! to advance.", "Un pulso de 0.5 s del GPIO 9 le dice al LOGO! que avance."), 4)) + "</div>"),
    run: cellRun },

  opSlide(0, 4, T("How it works · The cell in 3D", "Cómo funciona · La celda en 3D"), "Uriel", T("From the belt to the <em>verdict</em>", "De la banda al <em>veredicto</em>")),
  opSlide(5, 11, T("How it works · The cart in 3D", "Cómo funciona · El carrito en 3D"), "Mario · Uriel", T("Load, travel and <em>unload</em>", "Cargar, viajar y <em>descargar</em>")),

  { sec: T("Construction · Stage 1", "Construcción · Etapa 1"), by: "Isaac", title: T("Design first: every part in 3D", "Primero el diseño: cada pieza en 3D"), tight: true, body: () => `${fig("c348_armado.png", T("Assembled cart, 3D build sheet (rev. 3.48)", "Carrito armado, hoja de armado 3D (rev. 3.48)"))}${fig("c348_explosionada.png", T("Exploded view of every part", "Vista explosionada de cada pieza"))}${fig("fig15.png", T("Layout: cell, cart and unload table", "Distribución: celda, carrito y mesa"))}` },

  { sec: T("Construction · Stage 2", "Construcción · Etapa 2"), by: "Emmanuel", title: T("The manufacturing cell, built", "La celda de manufactura, armada"), tight: true, body: () => `${fig("fig21.png", T("General view of the assembled cell", "Vista general de la celda armada"), "fill")}${fig("fig22.png", T("Panel: LOGO!, 24 V supply and relays", "Tablero: LOGO!, fuente de 24 V y relevadores"), "fill")}` },

  { sec: T("Construction · Stage 3", "Construcción · Etapa 3"), by: "Pedro", title: T("Pneumatics: the scrap piston", "Neumática: el pistón de scrap"), tight: true, body: () => `${fig("fig23.png", T("Scrap piston and its solenoid valve", "Pistón de scrap y su electroválvula"), "fill")}${fig("fig16.png", T("LOGO! ladder program", "Programa en escalera del LOGO!"), "paper")}` },

  { sec: T("Construction · Stage 4", "Construcción · Etapa 4"), by: "Uriel", title: T("Vision on the Raspberry Pi", "La visión en la Raspberry Pi"), tight: true, body: () => `${fig("fig30.png", T("Raspberry Pi 4 start-up and first tests", "Arranque de la Raspberry Pi 4 y primeras pruebas"), "fill")}${fig("fig31.png", T("Vision tested with real parts", "Visión probada con piezas reales"), "fill")}` },

  { sec: T("Construction · Stage 5", "Construcción · Etapa 5"), by: "David", title: T("The cart: aluminum frame and elevator tower", "El carrito: estructura de aluminio y torre del elevador"), tight: true, body: () => `${fig("carrito_estructura.jpg", T("Frame with the elevator tower and wheels", "Estructura con la torre del elevador y las ruedas"), "fill")}${fig("carrito_estructura_2.jpg", T("Another angle: columns, plates and lead screws", "Otro ángulo: columnas, placas y husillos"), "fill")}` },

  { sec: T("Construction · Stage 6", "Construcción · Etapa 6"), by: "David", title: T("The cart: drive wheels and suspension", "El carrito: ruedas motrices y suspensión"), tight: true, body: () => `${fig("carrito_rueda_resorte.jpg", T("Drive wheel with its suspension spring, and caster", "Rueda motriz con su resorte de suspensión, y rodaja"), "fill")}${fig("foto_ruedas.jpg", T("Both drive wheels and casters mounted", "Las dos ruedas motrices y las rodajas montadas"), "fill")}` },

  { sec: T("Testing", "Pruebas"), by: "Emmanuel · Pedro", title: T("Every part, <em>tested on its own</em>", "Cada parte, <em>probada por separado</em>"), tight: true, body: () => `<style>.wk{align-content:start!important;gap:22px!important}.wk .card{padding:26px!important;gap:10px!important}.wk .card h3{font-size:38px!important}.wk .card p{font-size:27px!important;line-height:1.3!important}</style><div class="cards c3 wk">${card(T("Belt", "Banda"), T("Raspberry Pi to PLC pulses work: the program and the pulses ran successfully. Only the camera is left to mount.", "Los pulsos de la Raspberry Pi al PLC funcionan: el programa y los pulsos corrieron con éxito. Solo falta montar la cámara."), 1, "1")}${card(T("Piston", "Pistón"), T("The scrap piston fires and returns on every command from the LOGO!.", "El pistón de scrap sale y regresa en cada orden del LOGO!."), 2, "2")}${card(T("Vision", "Visión"), T("PASS/FAIL judgment tested with real parts on the Raspberry Pi.", "El juicio PASS/FAIL se probó con piezas reales en la Raspberry Pi."), 3, "3")}${card(T("Wheels", "Ruedas"), T("The wheel motors were tested on their own with an Arduino and with the ESP32, and worked with both.", "Los motores de rueda se probaron aparte con un Arduino y con el ESP32, y funcionaron con ambos."), 4, "4")}${card(T("Elevator", "Elevador"), T("The elevator and its stepper motors were verified and work correctly.", "El elevador y sus motores a pasos se verificaron y funcionan correctamente."), 5, "5")}${card(T("Electronics", "Electrónica"), T("Every component and connection on the board was checked in one by one, and the step-up regulator that failed was replaced.", "Cada componente y conexión de la tablilla se revisó uno por uno, y se reemplazó el regulador step-up que fallaba."), 6, "6")}</div>` },

  { sec: T("Testing", "Pruebas"), by: "Mario · Uriel", title: T("Automated tests, run on the laptop", "Pruebas automáticas, corridas en la laptop"), tight: true, body: () => colStack(
    cardRow(3,
      card(T("Server, agents, cell, voice", "Servidor, agentes, celda, voz"), `<span style="font-size:64px;font-weight:800;color:#f2f3f8">361 / 363</span><br>${T("tests pass", "pruebas pasan")}`, 1),
      card(T("Cart simulator (Python)", "Simulador del carrito (Python)"), `<span style="font-size:64px;font-weight:800;color:#f2f3f8">29 / 29</span><br>${T("tests pass", "pruebas pasan")}`, 2),
      card(T("Simulator core (JavaScript)", "Núcleo del simulador (JavaScript)"), `<span style="font-size:64px;font-weight:800;color:#f2f3f8">5 / 5</span><br>${T("tests pass", "pruebas pasan")}`, 3)),
    keyTable([T("What is checked", "Qué se comprueba"), T("Result", "Resultado")], [
      [T("Full belt-to-table round trip in the simulator", "Ida y vuelta banda a mesa completa en el simulador"), T("passes", "pasa")],
      [T("A and B wires crossed: the cart must not move", "Cables A y B cruzados: el carrito no debe moverse"), T("passes", "pasa")],
      [T("Emergency stop interrupts the mission and reports it", "El paro interrumpe la misión y lo avisa"), T("passes", "pasa")],
      [T("Two tests of Lumina's free-chat replies", "Dos pruebas de las respuestas libres de Lumina"), T("failing, under review", "fallan, en revisión")],
    ], 26)) },

  { sec: T("Testing", "Pruebas"), by: "Isaac", title: T("What went wrong, and how we <em>fixed it</em>", "Qué falló y cómo lo <em>resolvimos</em>"), tight: true, body: () => keyTable([T("Problem", "Problema"), T("Fix", "Solución")], [
    [T("Robot arms did not fit the time and equipment", "Los brazos robóticos no cabían en tiempo y equipo"), T("Belt with fixtures and an ejection piston (ADR 0010)", "Banda con fixtures y pistón de expulsión (ADR 0010)")],
    [T("PyTorch would not run on the Jetson", "PyTorch no corría en el Jetson"), T("Missing NVIDIA library installed, numpy kept below 2", "Se instaló la librería de NVIDIA y numpy menor que 2")],
    [T("Code failed on the Jetson's Python 3.10", "El código fallaba en el Python 3.10 del Jetson"), T("Replaced datetime.UTC with timezone.utc", "Se cambió datetime.UTC por timezone.utc")],
    [T("Camera video and voice audio blocked in the dashboard", "Video de la cámara y audio de la voz bloqueados en el panel"), T("Browser security policy now allows the agent origin and audio", "La política de seguridad del navegador ya permite el origen del agente y el audio")],
    [T("Speech engine did not know the word “Lumina”", "El motor de voz no conocía la palabra «Lumina»"), T("Tolerant wake word and send on end of phrase", "Palabra de activación tolerante y envío al terminar la frase")],
    [T("One POST per observation saturated the server", "Un POST por observación saturaba el servidor"), T("Observations sent in batches, each with a unique event_id", "Observaciones en lotes, cada una con un event_id único")],
    [T("Cart step-up voltage regulator did not work", "El regulador step-up del carrito no funcionaba"), T("Replaced with a working one", "Se reemplazó por uno que funciona")],
  ], 25) },

  { sec: T("Maintenance", "Mantenimiento"), by: "Pedro", title: T("Keeping the system running", "Cómo se mantiene el sistema"), body: () => `<div class="cards c3">${card(T("Daily", "Diario"), T("Test the emergency stop. Clean camera lenses. Check air pressure and leaks.", "Probar el paro de emergencia. Limpiar lentes. Revisar presión de aire y fugas."), 1)}${card(T("Weekly", "Semanal"), T("Check belt tension, fixtures and wheels. Charge and inspect the battery.", "Revisar tensión de banda, fixtures y ruedas. Cargar e inspeccionar la batería."), 2)}${card(T("Monthly", "Mensual"), T("Tighten terminals and profiles. Check fuses. Back up data and re-validate vision.", "Apretar terminales y perfiles. Revisar fusibles. Respaldar datos y revalidar la visión."), 3)}</div>` },

  { sec: T("Safety and standards", "Seguridad y normas"), by: "Pedro", title: T("Stopping never depends on the network", "Detenerse nunca depende de la red"), tight: true, body: () => `<table class="a" style="--i:1;font-size:27px"><tr><th>${T("Standard", "Norma")}</th><th>${T("How it applies", "Cómo se aplica")}</th></tr>${[
    ["ISO 12100", T("Emergency stop, guards, separated power branches", "Paro de emergencia, protecciones y ramas de energía separadas")],
    ["ISO 13849-1", T("The stop cuts power by hardware relay, not by software", "El paro corta la energía por relevador, no por programa")],
    ["NOM-004-STPS", T("Accessible emergency stop, moving parts identified", "Paro accesible y piezas móviles identificadas")],
    ["NOM-001-SEDE", T("Fuses per branch, wire gauges, 24 V apart from 5 V", "Fusibles por rama, calibres, 24 V separados de 5 V")],
    ["ISO 3691-4", T("Sensor braking under 40 cm, speed limited to 0.35 m/s", "Frenado por sensores a menos de 40 cm y 0.35 m/s máximo")],
    ["ISA-95 / 101 / 18.2", T("Plant layers, operator screens, alarm management", "Niveles de planta, pantallas de operador y alarmas")],
  ].map(([k, v]) => `<tr><td class="k">${k}</td><td>${v}</td></tr>`).join("")}</table>` },

  { sec: T("Interface", "Interfaz"), by: "Mario", title: T("One interface for the whole line", "Una interfaz para toda la línea"), tight: true, body: () => `${fig("fig27.png", T("Cell operator screen", "Pantalla de operador de la celda"))}${fig("fig29.png", T("Declared inventory", "Inventario declarado"))}${fig("fig28.png", T("Lumina, the voice assistant", "Lumina, la asistente de voz"))}` },

  { sec: T("Assistant", "Asistente"), by: "Mario", title: T("Lumina works <em>offline</em>", "Lumina funciona <em>sin internet</em>"), tight: true, body: () => `${fig("fig28.png", T("Lumina, the face of the system", "Lumina, la cara del sistema"), "fill")}${sideCards(
    card(T("Hears", "Escucha"), T("Vosk recognizes speech on the laptop, in Spanish or English; the audio is not saved or sent out.", "Vosk reconoce la voz en la laptop, en español o inglés; el audio no se guarda ni sale."), 1),
    card(T("Speaks", "Habla"), T("ElevenLabs voice when online; Windows voices when there is no internet.", "Voz de ElevenLabs con internet; voces de Windows sin internet."), 2),
    card(T("Answers", "Responde"), T("Commands run without a language model; free questions go to a local model (Ollama).", "Los comandos corren sin modelo de lenguaje; las preguntas libres van a un modelo local (Ollama)."), 3))}` },

  { sec: T("Interconnections", "Interconexiones"), by: "Emmanuel · Mario", title: T("How the devices talk", "Cómo se comunican los equipos"), tight: true, body: network },

  { sec: T("Control · ESP32", "Control · ESP32"), by: "Mario", title: T("The ESP32 obeys, the Jetson <em>decides</em>", "El ESP32 obedece, la Jetson <em>decide</em>"), tight: true, body: () => colStack(
    keyTable([T("Order (Jetson → ESP32)", "Orden (Jetson → ESP32)"), T("What it does", "Qué hace")], [
      ["DRV id dist v heading", T("Drive a straight stretch", "Avanza un tramo recto")],
      ["TRN id heading wmax", T("Turn to a heading", "Gira a un rumbo")],
      ["APR id dist v front_cm", T("Approach and dock at a station", "Se acerca y acopla en una estación")],
      ["MAN vL vR", T("Manual wheel speeds (joystick)", "Velocidades manuales (joystick)")],
      ["STOP · HB", T("Stop · heartbeat", "Paro · latido")],
    ], 25),
    cardRow(3,
      card(T("Reports back", "Reporta"), T("ODO odometry, MOT motors, RNG distances, PWR battery and stop, EVT DONE / BLOCKED / FAULT.", "ODO odometría, MOT motores, RNG distancias, PWR batería y paro, EVT DONE / BLOCKED / FAULT."), 1),
      card(T("Reflex at 40 cm", "Reflejo a 40 cm"), T("Brakes by itself if the front sensor sees something closer.", "Frena solo si el sensor frontal ve algo más cerca."), 2),
      card(T("Watchdog 1 s", "Vigilancia 1 s"), T("Stops everything if the Jetson goes silent for one second. Top speed 0.35 m/s.", "Detiene todo si la Jetson calla un segundo. Velocidad máxima 0.35 m/s."), 3))) },

  { sec: T("Control · Jetson", "Control · Jetson"), by: "Mario", title: T("One mission, from the simulator to the <em>real cart</em>", "Una misión, del simulador al <em>carrito real</em>"), tight: true, body: () => `${fig("sim_mision.png", T("Mission panel: belt to unload table and back, 40 cm reflex active", "Panel de misión: de la banda a la mesa de descarga y de regreso, con el reflejo de 40 cm activo"))}${sideCards(
    card(T("Same program", "El mismo programa"), T("mision.py on the Jetson sends each stretch; the ESP32 executes it and reports when it ends.", "mision.py en la Jetson manda cada tramo; el ESP32 lo ejecuta y avisa cuándo termina."), 1),
    card(T("Same protocol", "El mismo protocolo"), T("The simulator speaks the cart's USB lines, so nothing changes on the real cart.", "El simulador habla las líneas USB del carrito, así que en el real no cambia nada."), 2),
    card(T("Obstacle cases", "Casos de obstáculos"), T("Five cases pass in simulation: a box that stays, a person who leaves or crosses, a person at the dock, a box behind.", "Cinco casos pasan en simulación: una caja que no se quita, una persona que se retira o cruza, una en el acople, una caja detrás."), 3))}` },

  { sec: T("Control · Jetson", "Control · Jetson"), by: "Mario", title: T("Programming the cart in <em>Python</em>", "Programar el carrito en <em>Python</em>"), tight: true, body: () => `${fig("sim_programar.png", T("Program editor: write, save and run against the simulator", "Editor de programas: escribe, guarda y corre contra el simulador"))}${sideCards(
    card(T("Simple functions", "Funciones simples"), T("avanzar, retroceder, girar_a, ir_a, acoplar, distancia, decir.", "avanzar, retroceder, girar_a, ir_a, acoplar, distancia, decir."), 1),
    card(T("One file, two targets", "Un archivo, dos destinos"), T("The same file runs on the simulator and, from the Jetson, on the real cart.", "El mismo archivo corre en el simulador y, desde la Jetson, en el carrito real."), 2),
    card(T("Safety stays in the ESP32", "La seguridad queda en el ESP32"), T("A program cannot turn off the 40 cm reflex or the 1 s watchdog.", "Un programa no puede apagar el reflejo de 40 cm ni la vigilancia de 1 s."), 3))}` },

  { sec: T("Electrical diagrams", "Diagramas eléctricos"), by: "Emmanuel", title: T("Cart: power and emergency stop", "Carrito: potencia y paro de emergencia"), tight: true, body: () => fig(T("elec_potencia_en.png", "elec_potencia_es.png"), "", "paper") },

  { sec: T("Electrical diagrams", "Diagramas eléctricos"), by: "Pedro", title: T("Cart: every ESP32 connection", "Carrito: cada conexión del ESP32"), tight: true, body: () => `${fig("elec_esp32_a.png", T("Stepper drivers, servo and LEDs", "Drivers de motores a pasos, servo y LEDs"), "paper")}${fig("elec_esp32_b.png", T("RS485, limit switches, sensors, I²C and battery", "RS485, finales de carrera, sensores, I²C y batería"), "paper")}` },

  { sec: T("Electrical diagrams", "Diagramas eléctricos"), by: "Uriel", title: T("Cell: Raspberry Pi, relays and LOGO!", "Celda: Raspberry Pi, relevadores y LOGO!"), tight: true, body: () => fig(T("elec_celda_en.png", "fig10.png"), "", "paper") },

  { sec: T("Simulation", "Simulación"), by: "Uriel", title: T("A digital twin of the <em>whole cart</em>", "Un gemelo digital de <em>todo el carrito</em>"), tight: true, body: () => `${fig("sim_resumen.png", T("The simulator runs the same firmware as the ESP32", "El simulador corre el mismo firmware que el ESP32"))}${sideCards(
    card(T("Power", "Energía"), T("Battery, fuses, relay, emergency stop and regulators.", "Batería, fusibles, relevador, paro y reguladores."), 1),
    card(T("Wires", "Cables"), T("The 101 wires of the build guide: cut or cross one and see the damage.", "Los 101 cables de la guía: corta o cruza uno y ve el daño."), 2),
    card(T("Physics", "Física"), T("40 kg, wheel grip, collisions with the belt and the guides.", "40 kg, adherencia de las llantas, choques con la banda y las guías."), 3))}` },

  { sec: T("Simulation", "Simulación"), by: "Uriel", title: T("Down to the wire: the <em>cable inspector</em>", "Hasta el cable: el <em>inspector de cables</em>"), tight: true, body: () => `${fig("sim_cables.png", T("Top view and the 101 wires of the build guide", "Vista de planta y los 101 cables de la guía"))}${sideCards(
    card(T("Live voltage", "Voltaje en vivo"), T("Tap any wire to see the voltage it carries right now.", "Toca cualquier cable para ver el voltaje que lleva ahora."), 1),
    card(T("Connected pins", "Pines unidos"), T("It lists the other pins at the same point and what the wire is for.", "Lista los otros pines en el mismo punto y para qué sirve el cable."), 2),
    card(T("What if it breaks", "Y si se rompe"), T("Cut or cross a wire and see the failure before touching the real cart.", "Corta o cruza un cable y ve la falla antes de tocar el carrito real."), 3))}` },

  { sec: T("Simulation", "Simulación"), by: "Uriel", title: T("What travels on the wires: <em>RS485</em>", "Lo que viaja por los cables: <em>RS485</em>"), tight: true, body: () => `${fig("sim_senales.png", T("Decoded frames to the wheel motors", "Tramas decodificadas hacia los motores de rueda"))}${sideCards(
    card(T("3,164 sent", "3,164 enviadas"), T("In this run the ESP32 sent 3,164 frames and the motors answered 3,160, with 0 lost.", "En esta corrida el ESP32 mandó 3,164 tramas y los motores contestaron 3,160, con 0 perdidas."), 1),
    card(T("Every ~20 ms", "Cada ~20 ms"), T("A 10-byte frame to each motor; without it the wheel is released.", "Una trama de 10 bytes a cada motor; sin ella la rueda se suelta."), 2),
    card(T("CRC checked", "CRC verificado"), T("Each frame is decoded with its check byte and motor ID.", "Cada trama se decodifica con su byte de verificación y el ID del motor."), 3))}` },

  { sec: T("Simulation", "Simulación"), by: "Uriel", title: T("Simulated before it is built", "Simulado antes de construirse"), tight: true, body: () => `<figure class="a" style="--i:1"><div class="frame"><video src="/assets/funcionamiento.mp4" autoplay muted loop playsinline></video></div></figure>` },

  { sec: T("Simulation · live", "Simulación · en vivo"), by: "Uriel", title: T("The simulator, <em>running now</em>", "El simulador, <em>corriendo ahora</em>"), tight: true, live: true,
    body: () => `<div class="note a" style="--i:1">${T("Use the mouse inside the simulator. To continue: phone remote, or click the slide margin and press →.", "Usa el mouse dentro del simulador. Para continuar: control del teléfono, o haz clic en el margen de la lámina y presiona →.")}</div>` },

  { sec: T("Real-time demo", "Demostración en vivo"), by: "Mario", title: T("Live: declared inventory from the server", "En vivo: inventario declarado desde el servidor"), tight: true, body: () => `<figure class="a" style="--i:1"><div class="frame"><iframe class="demo-frame" src="/inventory.html" title="Inventory" tabindex="-1"></iframe></div></figure>` },

  { sec: T("Next steps", "Siguientes pasos"), by: "Isaac", title: T("What is left to <em>close the project</em>", "Lo que falta para <em>cerrar el proyecto</em>"), tight: true, body: () => `<div class="cards c3 wk">${card(T("Belt camera", "Cámara de la banda"), T("Mount it and calibrate the 3 s wait before the piston.", "Montarla y calibrar la espera de 3 s antes del pistón."), 1, "1")}${card(T("Firmware on the real cart", "Firmware en el carrito real"), T("Written and run in the simulator; next, on the real ESP32 with wheels in the air.", "Escrito y probado en el simulador; sigue el ESP32 real con las ruedas en el aire."), 2, "2")}${card(T("Full cell-to-cart cycle", "Ciclo completo celda a carrito"), T("One fixture from the belt to the table, logged on the server.", "Un fixture de la banda a la mesa, registrado en el servidor."), 3, "3")}${card(T("Raspberry–LOGO! link", "Enlace Raspberry–LOGO!"), T("Modbus TCP is designed, not yet implemented.", "Modbus TCP está diseñado, aún sin implementar."), 4, "4")}${card(T("Emergency stop reading", "Lectura del paro"), T("Check on the real cart that the ESP32 sees the stop (GPIO 34).", "Comprobar en el carrito real que el ESP32 ve el paro (GPIO 34)."), 5, "5")}${card(T("Measured performance", "Desempeño medido"), T("Parts per minute, classification accuracy and a formal risk assessment (ISO 12100).", "Piezas por minuto, precisión de clasificación y evaluación formal de riesgos (ISO 12100)."), 6, "6")}</div><style>.wk{align-content:start!important;gap:22px!important}.wk .card{padding:26px!important;gap:10px!important}.wk .card h3{font-size:38px!important}.wk .card p{font-size:27px!important;line-height:1.3!important}</style>` },

  { sec: "", by: T("The team", "El equipo"), end: true, html: () => `<div class="slide title">${LOGO}<div class="word a" style="--i:1;font-size:120px;letter-spacing:0.02em;font-weight:800">${T("Thank you.", "Gracias.")}</div><div class="sub a" style="--i:2">AETHER · Chihuahua, ${T("Mexico", "México")}</div></div><div class="hint">${T("Double click to meet Lumina", "Doble clic para hablar con Lumina")}</div>` },
];

const stage = document.getElementById("stage");
let current = 0;

// ── Música de fondo: empieza al entrar a las diapositivas y se desvanece al salir. ──
// Teclas: + y - ajustan el volumen, M silencia. MUSIC_VOL es el arranque: súbelo o bájalo tras probar en el salón.
const MUSIC_VOL = 0.18;
const music = new Audio("/assets/fondo_tech.wav");
music.loop = true;
music.volume = 0;
let musicTarget = MUSIC_VOL, musicOn = false, fadeTimer = null;

function fadeMusic(to, seconds, done) {
  clearInterval(fadeTimer);
  const from = music.volume, steps = Math.max(1, Math.round(seconds * 20));
  let n = 0;
  fadeTimer = setInterval(() => {
    n += 1;
    music.volume = Math.min(1, Math.max(0, from + ((to - from) * n) / steps));
    if (n >= steps) { clearInterval(fadeTimer); if (done) done(); }
  }, 50);
}
function startMusic() {
  if (musicOn) return;
  musicOn = true;
  music.play().then(() => fadeMusic(musicTarget, 3)).catch((err) => { musicOn = false; console.warn("Aether: la música de fondo no pudo sonar.", err); });
}
function stopMusic() {
  musicOn = false;
  fadeMusic(0, 1.5, () => music.pause());
}
function nudgeMusic(delta) {
  musicTarget = Math.min(1, Math.max(0, musicTarget + delta));
  if (musicOn) fadeMusic(musicTarget, 0.2);
}
// robot.html avisa cuando abre las diapositivas; abiertas solas, arranca con el primer toque.
addEventListener("message", (e) => {
  if (e.origin !== location.origin) return;
  if (e.data?.type === "aether-slides-start") startMusic();
  // Control remoto del teléfono: robot.js reenvía solo las teclas permitidas.
  if (e.data?.type === "aether-remote" && ["ArrowRight", "ArrowLeft", "+", "-", "m"].includes(e.data.key)) dispatchEvent(new KeyboardEvent("keydown", { key: e.data.key }));
});
// Diapositivas abiertas solas (no dentro de Lumina): escuchan al teléfono directamente.
if (window.parent === window && location.protocol.startsWith("http")) {
  const remote = () => {
    const ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/show/ws`);
    ws.onmessage = (m) => { try { const d = JSON.parse(m.data); if (d.type === "key" && ["ArrowRight", "ArrowLeft", "+", "-", "m"].includes(d.key)) dispatchEvent(new KeyboardEvent("keydown", { key: d.key })); } catch {} };
    ws.onclose = () => setTimeout(remote, 2000);
  };
  remote();
}

function fit() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  const tf = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
  stage.style.transform = tf;
  if (opWrap) opWrap.style.transform = tf;
}

// ── Pasos dentro de una lámina: la flecha / el clicker avanzan el paso y, al terminar, la lámina. ──
let sub = 0, timers = [];
const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
const lit = (k) => stage.querySelectorAll("[data-k]").forEach((e) => { const n = +e.dataset.k; e.classList.toggle("on", n <= k); e.classList.toggle("cur", n === k); });
function runSub() {
  const s = SLIDES[current];
  clearTimers();
  stage.querySelectorAll(".dots i").forEach((d, n) => d.classList.toggle("on", n <= sub));
  stage.querySelectorAll("[data-jump]").forEach((b) => { b.onclick = () => jump(+b.dataset.jump); });
  if (s.run) s.run(sub);
}
const jump = (k) => { sub = k; runSub(); };

// ── Recuadro 3D (guía de armado, capítulo Funcionamiento): vive fuera de #stage para no recargarse en cada paso. ──
let opWrap = null, opPending = 0;
function syncOp(s) {
  const kind = s.live ? "live" : s.op !== undefined ? "op" : null;
  if (opWrap && opWrap.dataset.kind !== kind) { opWrap.remove(); opWrap = null; }
  if (kind && !opWrap) {
    opWrap = document.createElement("div");
    opWrap.id = "opwrap";
    opWrap.dataset.kind = kind;
    opWrap.className = kind;
    // "live": el simulador de verdad (puerto 8770 de esta laptop), con el mouse activo dentro de la lámina.
    const src = kind === "live" ? `http://${location.hostname}:8770/` : `/armado48.html?limpio=1&op=1&lang=${LANG}`;
    opWrap.innerHTML = `<iframe title="${kind}" src="${src}"></iframe>`;
    if (kind === "op") opWrap.firstChild.addEventListener("load", () => opStep(opPending));
    document.body.appendChild(opWrap);
    fit();
  }
}
function opStep(n) {
  opPending = n;
  opWrap?.firstChild.contentWindow?.postMessage({ type: "aether-op", step: n }, location.origin);
}

function show(i, toEnd = false) {
  clearTimers();
  current = Math.max(0, Math.min(SLIDES.length - 1, i));
  const s = SLIDES[current];
  const inner = s.html
    ? s.html()
    : `<div class="slide">${s.sec ? `<div class="tag a">${s.sec}</div>` : ""}<h1 class="a" style="--i:0${s.tight ? ";margin-bottom:26px;font-size:60px" : ""}">${s.title}</h1><div class="body">${s.body()}</div></div>`;
  const dots = s.steps ? `<span class="dots">${Array.from({ length: s.steps + 1 }, () => "<i></i>").join("")}</span>` : "";
  stage.innerHTML = `${inner}<div class="foot"><span><b>${s.by}</b></span>${dots}<span>${current + 1} / ${SLIDES.length}</span></div>`;
  syncOp(s);
  sub = s.steps && toEnd ? s.steps : 0;
  if (s.steps) runSub();
}

// Sin redibujar si no cambia de lámina: al borrar lo que está bajo el cursor, el doble clic del final se perdía.
const go = (i, toEnd = false) => { if (i >= 0 && i < SLIDES.length && i !== current) show(i, toEnd); };
const next = () => { const s = SLIDES[current]; if (s.steps && sub < s.steps) { sub += 1; runSub(); } else go(current + 1); };
const prev = () => { const s = SLIDES[current]; if (s.steps && sub > 0) { sub -= 1; runSub(); } else go(current - 1, true); };

addEventListener("keydown", (e) => {
  if (e.key === "+") return nudgeMusic(0.04);
  if (e.key === "-") return nudgeMusic(-0.04);
  if (e.key === "m" || e.key === "M") { nudgeMusic(musicTarget > 0 ? -musicTarget : MUSIC_VOL); return; }
  startMusic();
  if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); next(); }
  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
});
// Clic avanza; el 15 % izquierdo de la pantalla retrocede.
addEventListener("click", (e) => { startMusic(); if (e.target.closest?.("[data-stop]")) return; return e.clientX < innerWidth * 0.15 ? prev() : next(); });
// Solo en la última lámina: un doble clic en otra no hace nada más que avanzar.
addEventListener("dblclick", () => {
  if (!SLIDES[current].end) return;
  stopMusic();
  if (window.parent !== window) window.parent.postMessage({ type: "aether-slides-end" }, location.origin);
  else location.href = `/robot.html?lang=${LANG}`;
});
if (/netlify\.app$/.test(location.hostname)) for (let i = SLIDES.length - 1; i >= 0; i--) if (SLIDES[i].live) SLIDES.splice(i, 1);
addEventListener("resize", fit);
fit();
show(0);
