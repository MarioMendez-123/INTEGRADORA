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
  [T("Cart build and firmware", "Construcción del carrito y firmware"), 7, 10, "now"],
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
  box(0, 200, 270, 150, T("Part on belt", "Pieza en banda"), T("fixture holds it|YOLO recognizes it", "el fixture la sujeta|YOLO la reconoce")) +
  arrow(270, 275, 345, 275) +
  box(345, 200, 300, 150, T("Vision judges", "La visión juzga"), T("5 equal readings|every 0.5 s", "5 lecturas iguales|cada 0.5 s")) +
  arrow(645, 240, 790, 110, "", "#3ddc97") + `<text x="690" y="150" fill="#3ddc97" font-size="30" font-weight="800" text-anchor="middle">PASS</text>` +
  arrow(645, 310, 790, 440, "", "#ff5d6c") + `<text x="690" y="425" fill="#ff5d6c" font-size="30" font-weight="800" text-anchor="middle">FAIL</text>` +
  box(790, 35, 290, 150, T("Belt advances", "Avanza la banda"), T("LOGO! moves|the motor", "el LOGO! mueve|el motor"), "#3ddc97") +
  arrow(1080, 110, 1160, 110) +
  box(1160, 35, 250, 150, T("Cart loads", "El carrito carga"), T("6 fixtures", "6 fixtures"), "#3ddc97") +
  arrow(1410, 110, 1470, 110) +
  box(1470, 35, 230, 150, T("Delivers", "Entrega"), T("unload table", "mesa de descarga"), "#3ddc97") +
  box(790, 365, 290, 150, T("Piston ejects", "El pistón expulsa"), T("part goes|to scrap", "la pieza va|a scrap"), "#ff5d6c") +
  `<rect x="0" y="560" width="1700" height="70" rx="10" fill="#14173a" stroke="#5b4fe8" stroke-width="2"/><text x="850" y="605" fill="#f2f3f8" font-size="29" font-weight="600" text-anchor="middle">${T("Every step is logged on the server: observed data stays separate from declared inventory", "Cada paso queda en el servidor: lo observado se guarda aparte del inventario declarado")}</text>`);

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

// ── Las láminas. `by` es quien la presenta. ──
const SLIDES = [
  { by: "Mario", html: () => `<div class="slide title">${LOGO}<div class="word a" style="--i:1">AETHER</div><div class="sub a" style="--i:2">Industrial Systems</div><div class="names a" style="--i:3">Mario Iván Méndez Álvarez · Uriel Armando Rivero Rivero · Juan Emmanuel Martínez Aguirre · Pedro José Pallares Muñoz · David Gerardo Garnica Chaparro · Sadher Isaac Torres Galindo</div></div>` },

  { sec: T("Introduction", "Introducción"), by: "Isaac", title: T("A small manufacturing line that does <em>three jobs</em> usually solved apart", "Una línea de manufactura pequeña que une <em>tres trabajos</em> que suelen ir separados"), body: () => `<div class="cards c3 full">${photoCard("fig31.png", T("Inspect", "Inspecciona"), T("Computer vision checks every part on the belt.", "La visión artificial revisa cada pieza en la banda."), 1)}${photoCard("fig23.png", T("Eject", "Expulsa"), T("A piston removes the part when it is scrap.", "Un pistón retira la pieza cuando es scrap."), 2)}${photoCard("fig05.png", T("Transport", "Transporta"), T("A mobile robot carries good parts and keeps a traceable record.", "Un robot móvil lleva las piezas buenas y deja un registro trazable."), 3)}</div>` },

  { sec: T("Objective", "Objetivo"), by: "Isaac", title: T("Objective", "Objetivo"), body: () => `<div class="big a" style="--i:1">${T("Develop a <em>working automotive manufacturing line</em> that integrates a conveyor with positioning fixtures, a vision check, a scrap-ejecting piston and a mobile inventory unit, running the full cycle of positioning, verification and transport.", "Desarrollar una <em>línea de manufactura automotriz funcional</em> que integre una banda con fixtures de posicionamiento, verificación por visión, un pistón de expulsión de scrap y una unidad móvil de inventario, y que ejecute el ciclo completo de posicionamiento, verificación y transporte.")}</div>` },

  { sec: T("Abstract", "Resumen"), by: "Uriel", title: T("The project in three steps", "El proyecto en tres pasos"), body: () => `<div class="cards c3">${card(T("Need", "Necesidad"), T("Small lines depend on operators to move parts, verify assembly and count stock: downtime, uneven quality, counting errors.", "Las líneas pequeñas dependen de operadores para mover piezas, verificar y contar: tiempos muertos, calidad desigual y errores de conteo."), 1)}${card(T("Method", "Método"), T("Architecture decisions closed first, then modules built and tested separately before integrating.", "Primero se cerraron las decisiones de arquitectura; luego módulos probados por separado antes de integrarlos."), 2)}${card(T("Result", "Resultado"), T("Cell software, inventory engine, server and dashboard run with automated tests. The robot is the remaining critical path.", "El software de la celda, el inventario, el servidor y el panel corren con pruebas automáticas. El robot es la ruta crítica restante."), 3)}</div>` },

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

  { sec: T("Workflow", "Flujo de trabajo"), by: "Mario", title: T("General workflow", "Flujo general"), tight: true, body: workflow },

  { sec: T("Construction · Stage 1", "Construcción · Etapa 1"), by: "Isaac", title: T("Design first: every part in 3D", "Primero el diseño: cada pieza en 3D"), tight: true, body: () => `${fig("fig05.png", T("Assembled cart, 3D build sheet", "Carrito armado, hoja de armado 3D"))}${fig("fig06.png", T("Exploded view of every part", "Vista explosionada de cada pieza"))}${fig("fig15.png", T("Layout: cell, cart and unload table", "Distribución: celda, carrito y mesa"))}` },

  { sec: T("Construction · Stage 2", "Construcción · Etapa 2"), by: "Emmanuel", title: T("The manufacturing cell, built", "La celda de manufactura, armada"), tight: true, body: () => `${fig("fig21.png", T("General view of the assembled cell", "Vista general de la celda armada"), "fill")}${fig("fig22.png", T("Panel: LOGO!, 24 V supply and relays", "Tablero: LOGO!, fuente de 24 V y relevadores"), "fill")}` },

  { sec: T("Construction · Stage 3", "Construcción · Etapa 3"), by: "Pedro", title: T("Pneumatics: the scrap piston", "Neumática: el pistón de scrap"), tight: true, body: () => `${fig("fig23.png", T("Scrap piston and its solenoid valve", "Pistón de scrap y su electroválvula"), "fill")}${fig("fig16.png", T("LOGO! ladder program", "Programa en escalera del LOGO!"), "paper")}` },

  { sec: T("Construction · Stage 4", "Construcción · Etapa 4"), by: "Uriel", title: T("Vision on the Raspberry Pi", "La visión en la Raspberry Pi"), tight: true, body: () => `${fig("fig30.png", T("Raspberry Pi 4 start-up and first tests", "Arranque de la Raspberry Pi 4 y primeras pruebas"), "fill")}${fig("fig31.png", T("Vision tested with real parts", "Visión probada con piezas reales"), "fill")}` },

  { sec: T("Construction · Stage 5", "Construcción · Etapa 5"), by: "David", title: T("The autonomous cart", "El carrito autónomo"), tight: true, body: () => `${fig("fig07.png", T("Structure: elevator tower, battery and electronics", "Estructura: torre del elevador, batería y electrónica"))}${fig("fig11.png", T("Electronics and wiring model", "Modelo de la electrónica y su cableado"))}` },

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

  { sec: T("Interconnections", "Interconexiones"), by: "Mario", title: T("How the devices talk", "Cómo se comunican los equipos"), tight: true, body: network },

  { sec: T("Electrical diagrams", "Diagramas eléctricos"), by: "Emmanuel", title: T("Cart: power and emergency stop", "Carrito: potencia y paro de emergencia"), tight: true, body: () => fig(T("elec_potencia_en.png", "elec_potencia_es.png"), "", "paper") },

  { sec: T("Electrical diagrams", "Diagramas eléctricos"), by: "Uriel", title: T("Cell: Raspberry Pi, relays and LOGO!", "Celda: Raspberry Pi, relevadores y LOGO!"), tight: true, body: () => fig(T("elec_celda_en.png", "fig10.png"), "", "paper") },

  { sec: T("Simulation", "Simulación"), by: "Uriel", title: T("Simulated before it is built", "Simulado antes de construirse"), tight: true, body: () => `<figure class="a" style="--i:1"><div class="frame"><video src="/assets/funcionamiento.mp4" autoplay muted loop playsinline></video></div></figure>` },

  { sec: T("Real-time demo", "Demostración en vivo"), by: "Mario", title: T("Live: declared inventory from the server", "En vivo: inventario declarado desde el servidor"), tight: true, body: () => `<figure class="a" style="--i:1"><div class="frame"><iframe class="demo-frame" src="/inventory.html" title="Inventory" tabindex="-1"></iframe></div></figure>` },

  { sec: "", by: T("The team", "El equipo"), end: true, html: () => `<div class="slide title">${LOGO}<div class="word a" style="--i:1;font-size:120px;letter-spacing:0.02em;font-weight:800">${T("Thank you.", "Gracias.")}</div><div class="sub a" style="--i:2">AETHER · Chihuahua, ${T("Mexico", "México")}</div></div><div class="hint">${T("Double click to meet Lumina", "Doble clic para hablar con Lumina")}</div>` },
];

const stage = document.getElementById("stage");
let current = 0;

// ── Música de fondo: empieza al entrar a las diapositivas y se desvanece al salir. ──
// Teclas: + y - ajustan el volumen, M silencia. MUSIC_VOL es el arranque: súbelo o bájalo tras probar en el salón.
const MUSIC_VOL = 0.18;
const music = new Audio("/assets/fondo.m4a");
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
addEventListener("message", (e) => { if (e.origin === location.origin && e.data?.type === "aether-slides-start") startMusic(); });

function fit() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}

function show(i) {
  current = Math.max(0, Math.min(SLIDES.length - 1, i));
  const s = SLIDES[current];
  const inner = s.html
    ? s.html()
    : `<div class="slide">${s.sec ? `<div class="tag a">${s.sec}</div>` : ""}<h1 class="a" style="--i:0${s.tight ? ";margin-bottom:26px;font-size:60px" : ""}">${s.title}</h1><div class="body">${s.body()}</div></div>`;
  stage.innerHTML = `${inner}<div class="foot"><span><b>${s.by}</b></span><span>${current + 1} / ${SLIDES.length}</span></div>`;
}

// Sin redibujar si no cambia de lámina: al borrar lo que está bajo el cursor, el doble clic del final se perdía.
const go = (i) => { if (i >= 0 && i < SLIDES.length && i !== current) show(i); };
const next = () => go(current + 1);
const prev = () => go(current - 1);

addEventListener("keydown", (e) => {
  if (e.key === "+") return nudgeMusic(0.04);
  if (e.key === "-") return nudgeMusic(-0.04);
  if (e.key === "m" || e.key === "M") { nudgeMusic(musicTarget > 0 ? -musicTarget : MUSIC_VOL); return; }
  startMusic();
  if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); next(); }
  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
});
// Clic avanza; el 15 % izquierdo de la pantalla retrocede.
addEventListener("click", (e) => { startMusic(); return e.clientX < innerWidth * 0.15 ? prev() : next(); });
// Solo en la última lámina: un doble clic en otra no hace nada más que avanzar.
addEventListener("dblclick", () => {
  if (!SLIDES[current].end) return;
  stopMusic();
  if (window.parent !== window) window.parent.postMessage({ type: "aether-slides-end" }, location.origin);
  else location.href = `/robot.html?lang=${LANG}`;
});
addEventListener("resize", fit);
fit();
show(0);
