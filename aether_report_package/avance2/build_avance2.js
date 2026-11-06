// Genera AETHER_Informe_Integrador_Avance2.docx (node build_avance2.js)
const fs = require("fs");
const path = require("path");
const D = require("../../node_modules/docx");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, PageBreak, TableOfContents, Header, Footer, PageNumber,
  VerticalAlign, SimpleField, PageOrientation, TableLayoutType, LevelFormat,
} = D;

const FONT = "Arial";
const INK = "1B2A41";
const FIG = (f) => path.join(__dirname, "figuras", f);
const CAP = (f) => path.join(__dirname, "capturas", f);
const bom = JSON.parse(fs.readFileSync(path.join(__dirname, "bom_html.json"), "utf8"));

let nFig = 0, nTab = 0;
const FIGS = ["general","celda","carrito","arq","cad1","cad2","cad3","cotas","elecpot","eleccel","cadelec","tiempos","espa","espb","layout","fcelda","ftab","fpist","fest","fban","dash1","appcelda","applumina","dash3","final1"];
const F = Object.fromEntries(FIGS.map((k, i) => [k, i + 1]));

// ---------- texto con marcas: [[pendiente]] = amarillo, **negrita**
function runs(text, o = {}) {
  text = text.replace(/`/g, "");
  const out = [];
  const re = /(\[\[[\s\S]*?\]\]|\*\*[\s\S]*?\*\*)/g;
  let last = 0, m;
  const base = { font: FONT, size: o.size || 22, color: o.color || "000000", bold: o.bold, italics: o.italics };
  const push = (t, extra) => { if (t) out.push(new TextRun({ text: t, ...base, ...extra })); };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("[[")) push(tok.slice(2, -2), { highlight: "yellow" });
    else push(tok.slice(2, -2), { bold: true });
    last = m.index + tok.length;
  }
  push(text.slice(last));
  return out;
}
function lines(text, o) {
  const parts = text.split("\n");
  const r = [];
  parts.forEach((p, i) => { if (i) r.push(new TextRun({ text: "", break: 1 })); r.push(...runs(p, o)); });
  return r;
}
const P = (text, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.JUSTIFIED, spacing: { after: o.after ?? 120, line: 300 },
  indent: o.indent, keepNext: o.keepNext, children: lines(text, o),
});
const BUL = (text) => new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 60, line: 290 }, alignment: AlignmentType.LEFT, children: runs(text) });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun({ text: t, font: FONT })] });
const H1n = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t, font: FONT })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, font: FONT })] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: t, font: FONT })] });
const PB = () => new Paragraph({ children: [new PageBreak()] });

function caption(label, text, above, key) {
  const n = label === "Figura" ? ++nFig : ++nTab;
  if (label === "Figura" && FIGS[n - 1] !== key) throw new Error("orden de figuras: esperaba " + FIGS[n - 1] + " y llegó " + key);
  return new Paragraph({
    style: "Caption", keepNext: above, alignment: AlignmentType.CENTER, spacing: { before: above ? 200 : 80, after: above ? 80 : 240 },
    children: [new TextRun({ text: label + " ", font: FONT, size: 20, bold: true, color: INK }), new SimpleField("SEQ " + label + " \\* ARABIC", String(n)),
      new TextRun({ text: ". " + text, font: FONT, size: 20, color: INK })],
  });
}

// ---------- tablas
const CW = 9360; // ancho útil vertical (twips)
const bd = { style: BorderStyle.SINGLE, size: 4, color: "B8C0CC" };
const borders = { top: bd, bottom: bd, left: bd, right: bd };
function cell(text, w, o = {}) {
  const kids = (Array.isArray(text) ? text : String(text).split("\n\n")).map((t) =>
    new Paragraph({ alignment: o.align || AlignmentType.LEFT, spacing: { after: 40 }, children: lines(String(t), { size: o.size || 18, bold: o.bold, color: o.color }) }));
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 50, bottom: 50, left: 80, right: 80 }, columnSpan: o.span,
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined, children: kids,
  });
}
function table(headers, rows, widths, o = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const hr = new TableRow({ tableHeader: true, cantSplit: true, children: headers.map((h, i) => cell(h, widths[i], { bold: true, fill: INK, color: "FFFFFF", size: o.size || 18, align: AlignmentType.CENTER })) });
  const body = rows.map((r, ri) => new TableRow({
    cantSplit: true,
    children: r.map((c, i) => {
      const spec = typeof c === "object" && !Array.isArray(c) ? c : { t: c };
      return cell(spec.t, widths[i], { size: o.size || 18, fill: spec.fill || (ri % 2 ? "F5F7FA" : undefined), bold: spec.bold, align: spec.align || (o.center && o.center.includes(i) ? AlignmentType.CENTER : AlignmentType.LEFT) });
    }),
  }));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, rows: [hr, ...body] });
}
const T = (title, headers, rows, widths, o) => [caption("Tabla", title, true), table(headers, rows, widths, o), new Paragraph({ spacing: { after: 160 }, children: [] })];

// ---------- imágenes
function pngSize(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
function img(key, file, text, maxW = 600, maxH = 640) {
  const [w, h] = pngSize(file);
  const s = Math.min(maxW / w, maxH / h);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 60 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: Math.round(w * s), height: Math.round(h * s) } })] }),
    caption("Figura", text, false, key),
  ];
}
function imgOpt(key, file, text, placeholder, maxW, maxH) {
  return fs.existsSync(file) ? img(key, file, text, maxW, maxH) : foto(key, text, placeholder);
}
function foto(key, text, que) {
  const b = { style: BorderStyle.DASHED, size: 8, color: "8A93A0" };
  return [
    new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({ height: { value: 3000, rule: "atLeast" }, children: [
      new TableCell({ width: { size: CW, type: WidthType.DXA }, borders: { top: b, bottom: b, left: b, right: b }, verticalAlign: VerticalAlign.CENTER,
        shading: { type: ShadingType.CLEAR, fill: "F7F8FA", color: "auto" },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: runs("[[ESPACIO PARA FOTO O CAPTURA]]", { bold: true })}),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: runs(que, { size: 18, color: "4A5563" }) })] })] })] }),
    caption("Figura", text, false, key),
  ];
}

// ---------- contenido (estructura del formato INTEGRADORA del docente)
const Y = "FFF59D";
const blank = { t: "", fill: Y };
const code = (txt) => txt.split("\n").map((l) => new Paragraph({ spacing: { after: 0, line: 240 }, shading: { type: ShadingType.CLEAR, fill: "F3F5F8", color: "auto" }, children: [new TextRun({ text: l === "" ? " " : l, font: "Consolas", size: 16 })] }));

// ======= PORTADA
const cover = [];
const cp = (t, o = {}) => cover.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: o.after ?? 120, before: o.before ?? 0 }, children: lines(t, o) }));
cp("[[LOGO INSTITUCIONAL — pegar aquí]]", { bold: true, size: 20, after: 200 });
cp("UNIVERSIDAD TECNOLÓGICA DE CHIHUAHUA SUR", { bold: true, size: 30, color: INK });
cp("Ingeniería en Mecatrónica · 10.º cuatrimestre · Grupo 10IME1M", { size: 22, after: 360 });
cp("INFORME INTEGRADOR", { bold: true, size: 40, color: INK, after: 40 });
cp("AVANCE 2", { bold: true, size: 40, color: "C8501E", after: 280 });
cp("AETHER", { bold: true, size: 56, color: INK, after: 40 });
cp("Diseño e implementación de una línea de manufactura automotriz con verificación por visión y gestión trazable de inventario mediante un robot móvil autónomo", { size: 24, after: 360 });
cover.push(table(["Dato", "Información"], [
  ["Título del proyecto", "Diseño e implementación de una línea de manufactura automotriz con verificación por visión y gestión trazable de inventario mediante un robot móvil autónomo"],
  ["Asignatura", "[[nombre de la asignatura — por completar]]"],
  ["Docente", "[[nombre del docente — por completar]]"],
  ["Carrera y grupo", "Ingeniería en Mecatrónica · 10IME1M"],
  ["Integrantes (6)", "Mario Iván Méndez Álvarez\nSadher Isaac Torres Galindo\nPedro José Pallares Muñoz\nDavid Gerardo Garnica Chaparro\nJuan Emmanuel Martínez Aguirre\nUriel Armando Rivero Rivero"],
  ["Periodo escolar", "[[periodo — por completar]]"],
  ["Fecha de entrega", "[[fecha de entrega — por completar]]"],
], [3000, 6360], { size: 20 }));

// ======= ELEMENTOS INICIALES
const init = [];
const ia = (...x) => x.flat().forEach((e) => init.push(e));
ia(H1n("Índice general"));
ia(new TableOfContents("Índice general", { hyperlink: true, headingStyleRange: "1-3" }));
ia(PB());
ia(H1n("Índice de figuras"));
ia(new TableOfContents("Índice de figuras", { hyperlink: true, captionLabelIncludingNumbers: "Figura" }));
ia(H1n("Índice de tablas"));
ia(new TableOfContents("Índice de tablas", { hyperlink: true, captionLabelIncludingNumbers: "Tabla" }));
ia(P("Los tres índices son automáticos de Word (se arman con los estilos de título y con los títulos de figura y de tabla). Para actualizarlos: clic en el índice y tecla F9.", { italics: true, size: 18, color: "4A5563" }));

ia(H1("Introducción"));
ia(P("Aether es el proyecto integrador de un equipo de seis alumnos de Ingeniería en Mecatrónica de la Universidad Tecnológica de Chihuahua Sur. Es una línea de manufactura pequeña que une tres cosas que normalmente se resuelven por separado: la **inspección de piezas con visión artificial**, la **expulsión automática de las piezas malas** y el **transporte de las piezas buenas con un robot móvil**, todo con un registro trazable en un servidor."));
ia(P("El proyecto cumple las tres condiciones del curso: un controlador lógico programable (PLC, aquí el LOGO! de Siemens) maneja la banda de la celda; microcontroladores y computadoras de borde (ESP32, Raspberry Pi 4 y Jetson Orin Nano Super) hacen el control y la visión; y la línea es de manufactura flexible porque las piezas se identifican por código QR y se clasifican por visión, sin programar una trayectoria fija por pieza."));
ia(P("Este documento es el **Avance 2** del informe integrador y sigue la estructura que pidió el docente: elementos iniciales, cuatro capítulos (diagnóstico y propuesta, diseño y desarrollo, administración y dirección, resultados y evaluación), conclusiones, referencias y anexos. Cada afirmación lleva su estado: **VERIFICADO** (se vio en una salida real al preparar este documento), **DISEÑO** (está definido en la hoja de armado o en el código, pero no se ha medido en el equipo físico) o **PENDIENTE**. Los datos que el equipo debe completar están marcados en [[amarillo]]."));
ia(H3("Siglas y términos usados"));
ia(P("Las siglas se explican en el texto la primera vez que aparecen y además se reúnen aquí."));
const glos = [
  ["ADR", "Registro de decisión de arquitectura: documento corto donde el equipo anota qué decidió y por qué."],
  ["API / REST", "Forma en que un programa pide datos a otro por la red; REST es el estilo que usa el servidor del proyecto."],
  ["ArUco", "Marcador cuadrado en blanco y negro que una cámara reconoce para saber su posición."],
  ["AWG", "Calibre estadounidense de cable: a menor número, más grueso."],
  ["BOM", "Lista de materiales (Bill of Materials)."],
  ["CAD", "Diseño asistido por computadora."],
  ["ECU", "Unidad de control electrónico: la pieza automotriz que se inspecciona y se transporta."],
  ["ESP32", "Microcontrolador que mueve los motores y lee los sensores del carrito."],
  ["Fixture", "Soporte con quilla donde viaja cada ECU; es lo que toca la banda y lo que carga el carrito."],
  ["GPIO", "Pin de entrada o salida de uso general de una tarjeta."],
  ["HMI", "Interfaz hombre-máquina: la pantalla con la que el operador ve y controla la celda."],
  ["I²C", "Bus de dos cables para conectar sensores a un microcontrolador."],
  ["IMU", "Unidad de medición inercial: mide giros y aceleraciones (aquí, el BNO055)."],
  ["IR", "Infrarrojo: sensor que detecta si hay una pieza frente a él."],
  ["ISA-95", "Norma que ordena los niveles de una fábrica, desde el sensor hasta la gestión."],
  ["JSON", "Formato de texto para intercambiar datos entre programas."],
  ["LOGO!", "Controlador lógico programable (PLC) pequeño de Siemens; maneja la banda de la celda."],
  ["MAX485 / RS485", "Circuito y estándar de comunicación serial de dos hilos usado para hablar con los motores-rueda."],
  ["mAP50", "Medida de qué tan bien detecta objetos un modelo de visión (1.0 es perfecto)."],
  ["MDF", "Tablero de fibra de madera de densidad media."],
  ["Modbus TCP", "Protocolo industrial por red para leer y escribir registros en un controlador."],
  ["NEMA 17", "Tamaño estándar de motor a pasos (carcasa de 42 mm)."],
  ["NC / NO / COM", "Contacto normalmente cerrado / normalmente abierto / común de un relevador o botón."],
  ["ONNX", "Formato abierto para guardar un modelo de inteligencia artificial y correrlo en distintos equipos."],
  ["PASS / FAIL", "Resultado de la inspección: pieza aprobada / pieza rechazada."],
  ["PETG", "Plástico para impresión 3D, resistente y poco quebradizo."],
  ["PLC", "Controlador lógico programable. En la celda es el LOGO!."],
  ["POST", "Petición HTTP que envía datos a un servidor."],
  ["PWM", "Modulación por ancho de pulso: forma de controlar el ángulo de un servo."],
  ["QR", "Código cuadrado que se lee con cámara; cada fixture lleva uno."],
  ["Scrap", "Pieza rechazada que se expulsa de la línea."],
  ["SQLite", "Base de datos en un solo archivo, usada por el servidor."],
  ["STEP / DIR", "Dos señales con las que un driver mueve un motor a pasos: un pulso por paso y el sentido de giro."],
  ["TR8", "Husillo trapezoidal de 8 mm: convierte el giro del motor en subida y bajada."],
  ["VL53L0X", "Sensor láser de distancia de corto alcance."],
  ["YOLO", "Modelo de inteligencia artificial que detecta objetos en una imagen de una sola pasada."],
];
ia(...T("Siglas y términos", ["Sigla o término", "Significado"], glos, [2200, 7160], { size: 18 }));

// ======= CAPÍTULO 1
const body = [];
const add = (...x) => x.flat().forEach((e) => body.push(e));
add(H1("Capítulo 1. Diagnóstico y propuesta"));
add(H2("1.1 Resumen"));
add(P("Aether es un proyecto integrador que desarrolla una línea de manufactura automotriz: una banda transportadora con fixtures posiciona cada pieza, un sistema de visión confirma si quedó correctamente colocada, un pistón expulsa automáticamente la pieza si es scrap y un robot móvil autónomo, Aether Inventory (el carrito), recolecta y transporta las piezas terminadas mientras mantiene un registro trazable del inventario. La necesidad surge de la dependencia de operadores humanos en líneas pequeñas para trasladar piezas, verificar su ensamble y contar el inventario, lo que produce tiempos muertos, inconsistencia de calidad y errores acumulados."));
add(P("La metodología siguió un orden de decisiones de arquitectura cerradas antes de programar (percepción híbrida YOLO más código de barras o QR, localización por ArUco, esquema de datos crudo frente a declarado), seguido de desarrollo por módulos probados por separado antes de integrarse. Al 24 de octubre de 2026, el software de la celda (visión, juicio PASS/FAIL y accionamiento del pistón y de la banda), el motor de inventario, el servidor y el panel corren y están verificados con pruebas automatizadas; el pistón ya funciona con el LOGO! de la celda según el equipo. El robot móvil está diseñado y documentado en 3D, pero **aún no está construido ni probado** y su firmware no existe. La conclusión principal es que la capa de datos y software es funcional y auditable, mientras que la construcción del robot define la ruta crítica restante."));
add(H2("1.2 Abstract"));
add(P("Aether is an integrator project that develops an automotive manufacturing line: a conveyor with positioning fixtures places each part, a vision system confirms whether it was placed correctly, a piston automatically ejects the part if it is scrap, and an autonomous mobile robot, Aether Inventory, collects and transports finished parts while keeping a traceable inventory record. The need arises from small lines depending on human operators to move parts, verify assembly and count inventory, which produces downtime, inconsistent quality checks and accumulated counting errors.", { italics: true }));
add(P("The methodology closed architecture decisions before implementation (hybrid YOLO plus barcode or QR perception, ArUco-based localization, a raw-versus-declared data schema), followed by module-by-module development tested independently before integration. As of October 24, 2026, the cell software (vision, PASS/FAIL judgment, piston and belt control), the inventory engine, the server and the dashboard run and are verified with automated tests, and the piston already works with the cell PLC (a Siemens LOGO!). The mobile robot is designed and documented in 3D but has not been built or tested yet. The main conclusion is that the data and software layer is functional and auditable, while building the robot defines the remaining critical path.", { italics: true }));
add(H2("1.3 Antecedentes y contexto del proyecto"));
add(P("La necesidad se presenta en un contexto académico: el proyecto se desarrolla como integrador de la carrera de Ingeniería en Mecatrónica de la Universidad Tecnológica de Chihuahua Sur, simulando una línea de manufactura automotriz real. Aether se desarrolla en un contexto de manufactura con presencia significativa en Chihuahua, con demanda constante de líneas que combinen manipulación o transporte automatizado de piezas, verificación de calidad por visión y control de inventario."));
add(P("Actualmente, en líneas de manufactura pequeñas y en entornos académicos equivalentes, la coordinación entre estaciones de trabajo depende de operadores humanos que trasladan piezas entre procesos, verifican visualmente el resultado de cada operación y llevan el conteo de inventario de forma manual. Esta forma de trabajo actual es el punto de partida que el proyecto busca mejorar."));
add(P("El proyecto nació con dos brazos robóticos industriales. El 16 de septiembre de 2026 el equipo cambió el alcance (ADR 0010: registro de decisión de arquitectura) y sustituyó los brazos por una banda transportadora con fixtures y un pistón de expulsión, porque los brazos no cabían en el tiempo y el equipo disponibles. La visión, el inventario, el servidor y el robot móvil se mantuvieron."));
add(H2("1.4 Descripción del proceso o problema"));
add(...T("Descripción del proceso", ["Elemento", "Descripción"], [
  ["Proceso actual", "Un operador traslada la pieza entre estaciones, inspecciona visualmente si el resultado de cada operación es correcto y actualiza el conteo de inventario a mano."],
  ["Entrada", "Piezas automovilísticas (unidades de control electrónico, ECU) sobre su fixture."],
  ["Subsistemas de la propuesta", "Banda transportadora con fixtures (posicionamiento), estación de visión (verificación binaria PASS/FAIL), pistón de expulsión (manejo de scrap) y robot móvil (recolección, transporte y conteo)."],
  ["Salida", "Piezas terminadas, clasificadas y contadas en un inventario trazable."],
  ["Condiciones de operación", "Entorno de laboratorio controlado, iluminación de interior, operación supervisada."],
  ["Restricción principal", "Ventana de desarrollo de aproximadamente 240 horas en 4 meses, con un solo integrante a cargo de todo el software."],
], [2400, 6960]));
add(H2("1.5 Diagnóstico de necesidades"));
add(P("La dependencia del operador humano produce **cuatro problemas recurrentes**, diagnosticados por categoría en la tabla siguiente: personal, método, detección y entorno."));
add(...T("Diagnóstico del problema por categoría", ["N.º", "Categoría", "Hallazgo / riesgo", "Cómo lo atiende Aether"], [
  ["1", "Personal", "La dependencia de operadores humanos para trasladar piezas entre estaciones y para contar inventario introduce variabilidad: el criterio y la velocidad cambian de una persona a otra y a lo largo del turno.", "El robot traslada los fixtures y cada observación queda registrada en el servidor."],
  ["2", "Método", "Sin un protocolo de enlace entre estaciones, cada operación queda aislada y el operador humano se convierte en el mecanismo de coordinación por defecto, lo que genera tiempos muertos entre procesos.", "Un flujo único celda → robot → mesa, con eventos con identificador (event_id) en el servidor."],
  ["3", "Detección", "Con reflejo de luz sobre un marcador ArUco, el detector puede reportar un identificador incorrecto pero válido dentro del diccionario, sin señal de error visible. Hallazgo verificado durante las pruebas del módulo de percepción.", "El juicio PASS/FAIL exige 5 resultados iguales seguidos; el ArUco solo confirma posición."],
  ["4", "Entorno", "La variabilidad de iluminación y la falta de puntos fijos de referencia en un entorno de manufactura no controlado incrementan el riesgo de error en la detección de objetos y en la verificación de posición.", "Marcadores ArUco, embudos de acople y sensores de distancia como respaldo; calibración en la planta (pendiente)."],
], [450, 1100, 4700, 3110], { center: [0] }));
add(P("Antes de fijar la arquitectura se evaluaron y descartaron formalmente varias alternativas, resumidas en la tabla siguiente."));
add(...T("Alternativas de solución evaluadas y descartadas", ["Alternativa descartada", "Decisión tomada", "Razón"], [
  ["Aprendizaje por demostración (LfD) para manipulación de piezas", "Automatización fija de banda, fixtures y pistón", "El alcance académico no requiere generalizar tareas nuevas; un diseño fijo da un comportamiento predecible y verificable."],
  ["ArUco como sistema de navegación completo", "ArUco como capa de verificación de posición; navegación por waypoints y encoders", "Un sistema de navegación basado solo en marcadores es frágil ante oclusiones y errores de lectura."],
  ["SLAM (mapeo y localización simultáneos) para la navegación del robot móvil", "Diferido como característica futura", "Excede el tiempo disponible del proyecto y no es indispensable para el ciclo completo en laboratorio."],
  ["Clasificación visual pura de producto, sin código", "Enfoque híbrido YOLO más código de barras o QR", "Requeriría un dataset de entrenamiento propio por tipo de pieza, esfuerzo no justificado frente al enfoque híbrido."],
  ["Orquestador central para las estaciones de línea", "Protocolo de enlace punto a punto (I/O digital más MQTT)", "Un orquestador central agrega un punto único de falla no justificado para una secuencia fija de estaciones."],
], [2800, 3000, 3560]));
add(H2("1.6 Requerimientos del cliente/usuario y especificaciones"));
add(P("La tabla siguiente convierte la necesidad diagnosticada en requisitos comprobables. El «cliente» es la institución y el docente que evalúan el proyecto y el «usuario» es la persona que opera la línea. Los requisitos que ya cuentan con una prueba real se marcan como verificados; los que dependen de hardware físico pendiente se marcan como pendientes de medición, siguiendo el principio de honestidad del proyecto de no reportar como cumplido lo que no se ha probado."));
add(...T("Requerimientos y especificaciones, con su método de verificación", ["Requisito", "Condición", "Verificación"], [
  ["Detección combinada de objetos", "YOLO detecta y clasifica el objeto en el fotograma", "Verificado: test_combined.py sobre casos de prueba reales (Avance 1)"],
  ["Identificación exacta cuando hay código", "Lectura de código de barras o QR dentro de la caja detectada", "Verificado: 712 Observations de una corrida real, con al menos una identificada por código (Avance 1)"],
  ["Separación de datos crudo y declarado", "Ninguna corrida borra automáticamente una entrada declarada", "Verificado: pruebas automatizadas del backend (el retiro nunca borra la fila)"],
  ["Trazabilidad histórica", "Cada corrida agrega una fila nueva a la bitácora, sin sobrescribir", "Verificado: prueba de orden de /inventory/history (Avance 1)"],
  ["Operación de retiro protegida", "Requiere contraseña válida; rechaza con 403 si es incorrecta", "Verificado: pruebas de contraseña correcta e incorrecta (Avance 1)"],
  ["Juicio PASS/FAIL estable", "5 juicios iguales seguidos tomados cada 0.5 s (≈ 2.5 s por pieza)", "Implementado y probado en código; prueba con la banda real PENDIENTE"],
  ["Expulsión de piezas FAIL", "Pistón activado 1 s tras una espera de 3 s; regreso en 2 s; falla registrada como «fallo_actuacion»", "Implementado en código; el pistón ya funciona con el LOGO! (según el equipo); calibración en banda PENDIENTE"],
  ["Operación de la celda sin la laptop", "Juicio y pistón en la Raspberry Pi 4", "Implementado en código; prueba PENDIENTE"],
  ["Transporte de fixtures", "6 fixtures por carga; entrega a 83 cm; descarga en mesa de 140 × 30 cm", "DISEÑO; robot sin construir"],
  ["Paro de emergencia del robot", "Contacto normalmente cerrado que corta ruedas y motores a pasos; watchdog de 1 s", "DISEÑO; prueba PENDIENTE"],
  ["Precisión de la verificación por visión", "Umbral de precisión mínimo, aún por definir", "Pendiente: depende del documento de criterios de aceptación, en construcción"],
  ["Capacidad de la línea (piezas por minuto)", "Umbral mínimo, aún por definir", "Pendiente: requiere banda transportadora y pistón físicos"],
  ["Carga máxima del robot móvil", "Estimado preliminar: máximo 40 kg totales, hasta 17 kg por llanta motriz", "Pendiente: estimación preliminar; M0601 decidido, sin medir"],
], [2600, 3600, 3160], { size: 17 }));
add(H2("1.7 Planteamiento del problema"));
add(P("Las líneas de manufactura pequeñas, y los entornos académicos que las simulan, dependen de operadores humanos para tres tareas que se repiten en cada ciclo de producción: trasladar las piezas entre estaciones, verificar visualmente si el resultado del proceso es correcto y llevar a mano el conteo del inventario. Cada una de esas tareas se hace con criterio y velocidad que cambian de una persona a otra y a lo largo del turno."));
add(P("Esta dependencia produce tiempos muertos, porque cada estación espera a que alguien le traiga o le retire la pieza; inconsistencia en la verificación de calidad, porque no hay un criterio único y medible; y errores acumulados en los registros de inventario, que se agravan conforme aumenta el volumen de producción. Además, como no existe un enlace definido entre estaciones, el operador se vuelve el mecanismo de coordinación por defecto, y el proceso no puede auditarse: no hay manera de saber qué pieza se rechazó, cuándo ni por qué."));
add(P("Las soluciones comerciales que resuelven este problema por completo suelen superar el presupuesto de una pequeña o mediana empresa, y las soluciones parciales dejan huecos de coordinación que se terminan cubriendo de nuevo con trabajo manual. Por eso hace falta una solución integrada y accesible que inspeccione cada pieza con un criterio uniforme, retire automáticamente la pieza defectuosa, transporte las piezas aprobadas sin intervención humana y deje un registro trazable de todo el proceso."));
add(P("El proyecto plantea resolver estos problemas con una banda transportadora con fixtures y un sistema de visión para el posicionamiento y la verificación de calidad, un pistón que expulsa la pieza si es scrap y un robot móvil autónomo para el transporte y el seguimiento del inventario, comunicados entre sí sin depender de intervención humana en el flujo normal de operación. El problema se delimita a un entorno de laboratorio controlado, con operación supervisada y piezas de una sola familia (unidades de control electrónico)."));
add(H2("1.8 Objetivo general"));
add(P("Desarrollar una línea de manufactura automotriz funcional que integre una banda transportadora con fixtures de posicionamiento, un sistema de visión artificial de verificación, un pistón de expulsión de piezas defectuosas y una unidad móvil de inventario, capaz de ejecutar el ciclo completo de posicionamiento, verificación y transporte de piezas terminadas sin orquestación central, y de mantener un registro trazable del inventario resultante."));
add(H2("1.9 Objetivos específicos"));
add(BUL("Analizar el proceso manual actual de traslado, verificación y conteo de piezas para identificar sus puntos de falla."));
add(BUL("Diseñar un sistema de percepción híbrido capaz de detectar y contar objetos mediante YOLO, e identificarlos de forma exacta mediante lectura de código de barras o QR cuando esté disponible."));
add(BUL("Seleccionar un sistema de localización basado en marcadores ArUco para verificación de posición, sin depender de este sistema para la navegación del robot."));
add(BUL("Controlar la banda transportadora con fixtures de posicionamiento y el pistón de expulsión de piezas defectuosas mediante el control de bajo nivel definido en la arquitectura del proyecto."));
add(BUL("Desarrollar un sistema de visión de línea que confirme de forma binaria si una pieza quedó correctamente colocada."));
add(BUL("Integrar un esquema de datos que distinga entre observaciones crudas de percepción e inventario declarado, preservando la trazabilidad histórica de cada corrida de inspección."));
add(BUL("Probar y validar cada módulo por separado antes de integrarlo mediante un protocolo de enlace punto a punto, sin un orquestador central."));
add(BUL("Evaluar el cumplimiento de los requerimientos de la sección 1.6 conforme el hardware físico esté disponible."));
add(H2("1.10 Justificación"));
add(P("La automatización de líneas de manufactura pequeñas suele encontrarse con una disyuntiva: las soluciones comerciales completas superan el presupuesto de una pequeña o mediana empresa, mientras que las soluciones parciales dejan huecos de coordinación que terminan resolviéndose con intervención manual. Aether explora una tercera vía, con alcance académico: construir cada módulo con tecnología accesible y bien documentada (Python, OpenCV, YOLO, FastAPI, MQTT) e integrar los módulos mediante un protocolo de enlace simple en vez de un orquestador central costoso."));
add(P("El beneficio no está únicamente en la automatización física, que es la parte más visible de una línea de manufactura, sino en la capa de datos que la acompaña: un inventario que distingue entre lo observado y lo declarado, que nunca sobrescribe silenciosamente un resultado anterior con uno parcial y que mantiene una bitácora completa de cada corrida. Esta capa de datos hace que la línea sea auditable, y es una de las contribuciones específicas del proyecto más allá de la automatización convencional."));
add(H2("1.11 Alcances y limitaciones"));
add(P("El alcance obligatorio del proyecto académico es una línea de manufactura completa: la banda transportadora posiciona las piezas sobre sus fixtures, el sistema de visión confirma binariamente si la colocación es correcta, el pistón expulsa la pieza si es scrap y Aether Inventory recoge la pieza terminada, la transporta y lleva el control de todo el proceso. El desarrollo del software se ejecuta bajo una ventana de aproximadamente 240 horas en 4 meses, con un solo integrante a cargo de todo el software y la visión computacional."));
add(P("Como limitación explícita, la primera versión del sistema no necesita resolver el problema general de navegación en cualquier almacén: el entorno inicial es controlado (laboratorio de la universidad), se prioriza una solución funcional y demostrable sobre una solución general, y las características avanzadas (SLAM, múltiples robots, operación en múltiples instalaciones) quedan fuera de este alcance y se documentan como trabajo futuro. Al 24 de octubre de 2026 el robot no está construido ni su firmware escrito, las distancias entre estaciones y todos los tiempos deben calibrarse en la planta, el enlace Modbus TCP entre la Raspberry Pi y el LOGO! es un diseño que no está en el código y no se ha hecho una evaluación formal de riesgos."));
add(H2("1.12 Normatividad y criterios de seguridad aplicables"));
add(P("El proyecto define un principio de seguridad desde su arquitectura de comunicaciones: el comando de parada de seguridad no depende de la conectividad de red, sino de un watchdog (temporizador de vigilancia) implementado en el microcontrolador de bajo nivel, de forma que una falla de comunicación nunca deje al sistema sin capacidad de detenerse. Además se toman como referencia de diseño las normas de la tabla siguiente."));
add(...T("Normas y criterios de seguridad", ["Norma o criterio", "Qué pide, en palabras sencillas", "Cómo se aplica en Aether", "Estado"], [
  ["ISO 12100", "Evaluar los riesgos de una máquina y reducirlos desde el diseño", "Paro de emergencia, protecciones y separación de ramas de energía", "Aplicada en el diseño; evaluación formal PENDIENTE"],
  ["ISO 13849-1", "Que las funciones de seguridad del control sean confiables", "El paro corta la energía por hardware (relevador), sin depender del programa", "Diseño"],
  ["NOM-004-STPS", "Proteger al personal de la maquinaria", "Paro de emergencia accesible y piezas móviles identificadas", "Diseño; verificación PENDIENTE"],
  ["NOM-001-SEDE", "Instalaciones eléctricas seguras", "Fusibles por rama, calibres de cable, 24 V separados de los 5 V", "Diseño"],
  ["ISO 3691-4", "Seguridad de vehículos industriales sin conductor", "Frenado por sensores a menos de 40 cm y velocidad limitada a 0.35 m/s", "Diseño; prueba PENDIENTE"],
  ["ISA-95 / ISA-101 / ISA-18.2", "Niveles de una fábrica, pantallas de operador y manejo de alarmas", "Capas del sistema y alarmas de prioridad en la HMI", "Aplicada parcialmente"],
], [1700, 2800, 3100, 1760]));

// ======= CAPÍTULO 2
add(H1("Capítulo 2. Diseño y desarrollo"));
add(H2("2.1 Metodología / estrategia de desarrollo"));
add(P("El equipo trabaja por módulos: cada módulo (visión, celda, servidor, carrito) se prueba solo antes de integrarse con el siguiente. Las decisiones importantes se registran en ADR y los cambios de alcance siguen un proceso de cambios documentado. Cada afirmación del informe se etiqueta como VERIFICADO, DISEÑO o PENDIENTE para no declarar como hecho lo que no se ha visto funcionar. El calendario del curso fija las fases de la tabla siguiente."));
add(...T("Calendario de fases del curso", ["Fecha", "Fase o entrega"], [
  ["11 de septiembre", "Integración de equipos e idea del proyecto (cumplir con PLC, microcontrolador y manufactura flexible)"],
  ["25 de septiembre", "Definición y diseño conceptual"],
  ["9 de octubre", "Diseño técnico y planeación"],
  ["23 de octubre", "Construcción e integración"],
  ["6 de noviembre", "Pruebas y validación"],
  ["20 de noviembre", "Entrega preliminar: proyecto funcional y documento completo"],
  ["26 de noviembre", "Pre-integradora (presentación en PowerPoint explicada a profesores)"],
  ["27 de noviembre al 2 de diciembre", "Correcciones finales"],
  ["3 de diciembre", "Presentación final de Integradora III (flyer y exposición de máximo 5 minutos)"],
], [3000, 6360]));
add(H2("2.2 Diagrama de flujo general del funcionamiento"));
add(P(`La Figura ${F.general} resume el sistema completo en cinco columnas: **entradas** (lo que se lee), **proceso** (lo que se hace con ello), **control** (quién decide), **actuadores** (lo que se mueve) y **salidas** (lo que se entrega). Cada franja horizontal es una parte del sistema: la celda, el carrito y el software. Los textos se tomaron del código de la celda y de la hoja de armado del carrito.`));
add(...img("general", FIG("flujo_general.png"), "Diagrama de flujo general del sistema: entradas, proceso, control, actuadores y salidas.", 624, 400));
add(P(`La Figura ${F.celda} sigue paso a paso el programa de la celda (archivos cell_line.py y celda_agent.py). Una pieza solo se acepta o se rechaza después de **cinco juicios iguales seguidos**, tomados cada 0.5 segundos, para que un solo cuadro borroso no provoque una expulsión. Si el pistón no puede accionarse, el sistema no finge que lo hizo: registra la falla y levanta una alarma.`));
add(...img("celda", FIG("flujo_celda.png"), "Diagrama de flujo de la celda: inspección, juicio y accionamiento del pistón y de la banda.", 520, 740));
add(P(`La Figura ${F.carrito} describe el ciclo del carrito tal como lo define la hoja de armado (revisión 3.8). Es un **diseño**: el firmware del ESP32 todavía no existe, por lo que ningún paso se ha ejecutado en el carrito físico.`));
add(...img("carrito", FIG("flujo_carrito.png"), "Diagrama de flujo del ciclo del carrito: acople, carga de seis fixtures, viaje y descarga.", 520, 740));
add(H2("2.3 Arquitectura general del proyecto"));
add(P(`La Figura ${F.arq} muestra qué equipo ejecuta cada programa y por dónde se comunican. Todos los equipos están en una red local privada. Solo la síntesis de voz del asistente y el sitio público usan Internet; el sitio público es estático y no tiene acceso a la celda.`));
add(...img("arq", FIG("arquitectura.png"), "Arquitectura de equipos, puertos y protocolos del sistema Aether.", 624, 420));
add(...T("Equipos del sistema y su función", ["Equipo", "Programa que ejecuta", "Función", "Estado"], [
  ["Raspberry Pi 4 (celda)", "Agente de la celda (modelo ONNX)", "Cámara USB, juicio PASS/FAIL, relevadores GPIO 8 y 9, video propio", "Código VERIFICADO en el repositorio; prueba con la banda completa PENDIENTE"],
  ["LOGO! (celda)", "Programa de la banda", "Mueve el motor de la banda con la entrada I4 y el infrarrojo I3", "Funciona con el pistón (según el equipo); programa por documentar"],
  ["Jetson Orin Nano Super (carrito)", "Agente de percepción (puerto 8001)", "Cámara, YOLO, QR, ArUco; envía observaciones", "PyTorch de NVIDIA funciona en el Jetson (bitácora del repositorio)"],
  ["ESP32 (carrito)", "Firmware (PlatformIO)", "Motores a pasos, RS485, sensores, watchdog de 1 s", "PENDIENTE: no existe el firmware"],
  ["Laptop (servidor)", "FastAPI, SQLite, Ollama, voz (Vosk)", "Registro de observaciones, panel web y Lumina", "Código VERIFICADO en el repositorio"],
], [1900, 2100, 3100, 2260]));
add(H2("2.4 Diseño mecánico: CAD, dimensiones, materiales y ensamble"));
add(P(`El carrito se diseñó en 3D y su hoja de armado interactiva (revisión 3.8) reúne 69 componentes con su función, posición y comprobación de montaje. Las Figuras ${F.cad1} a ${F.cad3} son capturas de ese modelo y la Figura ${F.cotas} muestra las cotas principales. La banda entrega los fixtures a 83 cm de altura por una ventana en el panel frontal; el elevador sube la pila por pasos hasta que el fixture superior queda frente a la ventana de descarga.`));
add(...imgOpt("cad1", CAP("cad_armado_limpio.png"), "Carrito armado en el modelo 3D (hoja de armado, revisión 3.8).", "Captura del modelo 3D, carrito armado.", 440, 480));
add(...imgOpt("cad2", CAP("cad_explosionada.png"), "Vista explosionada: cada pieza separada de su posición final.", "Captura del modelo 3D, explosionada.", 440, 480));
add(...imgOpt("cad3", CAP("cad_transparente.png"), "Estructura transparente: la torre del elevador, la batería y la electrónica por dentro.", "Captura del modelo 3D, estructura transparente.", 440, 480));
add(...img("cotas", FIG("carrito_cotas.png"), "Vista lateral del carrito con cotas principales.", 600, 460));
add(...T("Parámetros mecánicos del carrito (hoja de armado rev. 3.8)", ["Parámetro", "Valor", "Estado"], [
  ["Estructura y material", "Perfil de aluminio 3030; marco de 0.50 × 0.40 m y 1.04 m de alto; escuadras y placas impresas en PETG; panel frontal de MDF de 3 mm", "DISEÑO"],
  ["Tracción", "2 motores-rueda M0601 en suspensión con resorte (≈ 85 N por rueda) y 4 rodajas de nylon", "DISEÑO; M0601 decidido y cotizado"],
  ["Elevador", "2 husillos TR8 de 60 cm con 2 NEMA 17; carrera útil de 40.7 a 83.2 cm", "DISEÑO"],
  ["Empujador", "NEMA 17, piñón m1.5 de 20 dientes y cremallera; avance de 25 cm a 80 mm/s", "DISEÑO"],
  ["Uña del fixture", "Microservo MG90S que sube y baja una uña abatible", "DISEÑO"],
  ["Fixture", "21.3 × 16.5 cm de quilla y 6.4 cm de alto; seis por carga, a 7.0 cm de separación", "DISEÑO"],
  ["Batería", "Plomo-ácido 12 V, 24 Ah, 8.3 kg, abajo y al centro, sujeta con correa", "DISEÑO"],
  ["Mesa de descarga", "140 × 30 cm, inclinación ≈ 15°, borde a 83 cm", "DISEÑO"],
], [2300, 5200, 1860]));
add(P("Los planos técnicos de fabricación (cortes del perfil y piezas impresas) están en la hoja de armado; su exportación a plano acotado se lista en el Anexo B."));
add(H2("2.5 Diseño eléctrico: alimentación, protecciones, distribución y diagrama eléctrico"));
add(P(`La Figura ${F.elecpot} es el esquema eléctrico de potencia del carrito, dibujado con símbolos normalizados (batería, fusibles, interruptores, relevador, motores, tierra). La batería alimenta dos ramas con su propio fusible: la de **motores** (F1 de 15 A: ruedas a 18 V y drivers de los motores a pasos a 12 V) pasa por el contacto de un relevador que controla el paro de emergencia, y la **auxiliar** (F2 de 10 A: Jetson, ESP32 y sensores) queda viva aunque se pulse el paro. El paro es de contacto normalmente cerrado y alimenta la bobina del relevador: al pulsarlo, el relevador cae y corta las ruedas y los motores a pasos a la vez. Los valores (fusibles, resistencias del divisor de batería, capacitores de 100 µF) son los de la hoja de armado rev. 3.8.`));
add(P("**Decisión abierta:** hoy el paro no está conectado a ningún pin del ESP32, por lo que el firmware no se entera de que fue pulsado. El equipo debe decidir si agrega esa señal (se propone un pin de solo lectura)."));
add(P(`**Celda.** La Figura ${F.eleccel} muestra la conexión eléctrica de la celda. La fuente de 24 V del tablero alimenta el LOGO!, el infrarrojo y la electroválvula; la Raspberry Pi 4 tiene su propia fuente de 5 V. Ninguna señal de 24 V llega a un GPIO de la Raspberry: sus salidas GPIO 8 y GPIO 9 (3.3 V) activan un módulo de dos relevadores cuyos contactos secos llevan 24 V a la electroválvula del pistón y a la entrada I4 del LOGO!, que hace avanzar la banda. El infrarrojo entra a la entrada I3 del LOGO!. Las marcas y modelos del LOGO!, del infrarrojo y de la fuente se anotan en la lista de materiales.`));
add("L<");
add(...img("elecpot", FIG("elec_potencia.png"), "Esquema eléctrico de potencia y protecciones del carrito.", 880, 620));
add(...img("eleccel", FIG("elec_celda.png"), "Esquema eléctrico de la celda: Raspberry Pi 4, relevadores, LOGO!, infrarrojo y electroválvula.", 880, 560));
add("L>");
add(H2("2.6 Diseño electrónico: sensores, actuadores, controladores, interfaces y comunicación"));
add(...T("Sensores, actuadores y controladores", ["Tipo", "Elemento", "Función", "Interfaz"], [
  ["Controlador", "Raspberry Pi 4", "Visión de la celda y juicio PASS/FAIL", "USB (cámara), GPIO, red"],
  ["Controlador", "LOGO! (PLC)", "Secuencia de la banda; ignora su infrarrojo 5 s tras el pulso I4", "Entradas I3 e I4, salida a motor"],
  ["Controlador", "Jetson Orin Nano Super", "Visión del carrito, ruta y órdenes", "USB al ESP32, red"],
  ["Controlador", "ESP32 DevKitC", "Motores, sensores y watchdog", "STEP/DIR, RS485, I²C, GPIO"],
  ["Sensor", "Cámara USB (celda) y Logitech 1080p (carrito)", "Imagen para YOLO, QR y ArUco", "USB"],
  ["Sensor", "Infrarrojo de presencia de 24 V", "Detecta la pieza en la banda", "Entrada I3 del LOGO!"],
  ["Sensor", "4 × VL53L0X", "Distancia: frenan si algo está a menos de 40 cm", "I²C (con XSHUT por PCF8574)"],
  ["Sensor", "IMU BNO055", "Giro del carrito (corrige la odometría)", "I²C"],
  ["Sensor", "Barra QTR-8A", "Respaldo: seguir una línea en el piso", "Entradas analógicas"],
  ["Sensor", "3 finales de carrera (NC)", "Cero (home) del elevador y del empujador", "GPIO"],
  ["Actuador", "Relevadores GPIO 8 y 9; electroválvula 24 V; pistón", "Expulsar piezas FAIL y avanzar la banda", "GPIO 3.3 V"],
  ["Actuador", "2 motores-rueda M0601", "Mover el carrito", "RS485 (MAX485)"],
  ["Actuador", "3 NEMA 17 con A4988; servo MG90S", "Elevador, empujador y uña", "STEP/DIR y PWM"],
], [1300, 2900, 3200, 1960], { size: 17 }));
add(P(`La Figura ${F.cadelec} muestra la electrónica del carrito con sus cables en el modelo 3D. Las comunicaciones son: USB entre el Jetson y el ESP32; RS485 entre el ESP32 y los motores-rueda; I²C para los sensores; HTTP/JSON por la red local entre los agentes y el servidor; y, como diseño aún no implementado, Modbus TCP entre la Raspberry y el LOGO!.`));
add(...imgOpt("cadelec", CAP("cad_electronica.png"), "Modelo 3D de la electrónica con sus cables (vista «Solo electrónica»).", "Captura del modelo 3D, solo electrónica.", 420, 440));
add(H2("2.7 Diseño y programación del sistema de control"));
add(P("El control está repartido en capas, de la más lenta a la más rápida:"));
add(BUL("**Servidor (laptop):** registra y muestra; no mueve hardware."));
add(BUL("**Jetson Orin Nano Super:** visión (QR, ArUco, YOLO), planeación de la ruta por waypoints (máximo 0.35 m/s y 0.4 m/s²) y órdenes al ESP32 por USB."));
add(BUL("**ESP32:** control de bajo nivel en tiempo real: pasos de los motores (micropaso 1/16, 3200 pulsos por vuelta), odometría con encoders e IMU, finales de carrera y un watchdog de 1 segundo que detiene todo si el Jetson deja de enviar órdenes. Se programará con PlatformIO (PENDIENTE)."));
add(BUL("**Celda:** la Raspberry Pi 4 decide PASS/FAIL y activa dos relevadores; el LOGO! maneja la banda."));
add(...T("Parámetros del ciclo de la celda (valores por defecto del código)", ["Parámetro", "Valor", "Estado"], [
  ["Periodo de análisis de cámara", "0.5 s por cuadro", "VERIFICADO en el código"],
  ["Juicios iguales seguidos antes de actuar", "5 (≈ 2.5 s)", "VERIFICADO en el código"],
  ["Umbral de confianza para PASS", "0.50 (el detector trabaja con 0.25 internamente)", "VERIFICADO en el código del agente"],
  ["Espera antes del pistón (FAIL)", "3 s", "VERIFICADO en el código; calibrar en la banda real"],
  ["Pistón activado (GPIO 8)", "1 s", "VERIFICADO en el código"],
  ["Regreso del pistón", "2 s", "VERIFICADO en el código"],
  ["Pulso de avance de la banda (GPIO 9 → entrada I4 del LOGO!)", "0.5 s", "VERIFICADO en el código"],
  ["El LOGO! ignora su infrarrojo tras el pulso", "5 s", "DISEÑO (programa del LOGO!, por confirmar)"],
], [4300, 2700, 2360]));
add(P(`La Figura ${F.tiempos} muestra el tiempo de una pieza en la celda: aproximadamente 3 segundos si se acepta y 9 si se rechaza (sin contar el tiempo de cada análisis).`));
add(...img("tiempos", FIG("tiempos.png"), "Diagrama de tiempos de la celda para una pieza aprobada y una rechazada.", 624, 260));
add(H2("2.8 Diagrama de conexiones / cableado"));
add(P(`Las Figuras ${F.espa} y ${F.espb} son los esquemas de conexión del ESP32, con cada cable en su color. En la primera (${F.espa}) se ven los tres drivers A4988 con sus motores NEMA 17 (dos mueven el elevador con las mismas señales STEP, DIR y ENABLE y uno el empujador), el servo MG90S de la uña y la tira de LEDs; las redes con nombre (A_STEP12, A_DIR12, A_EN, etc.) unen cada pin del ESP32 con su driver, como en un esquema de Proteus. En la segunda (${F.espb}) se ven el módulo MAX485 con su convertidor de nivel hacia los dos motores-rueda por RS485, los tres finales de carrera normalmente cerrados, la barra QTR-8A, el bus I²C con el expansor PCF8574, la IMU y los cuatro sensores VL53L0X (cuyos pines XSHUT salen del PCF8574 para darles direcciones distintas) y la lectura de la batería por divisor de voltaje. Los pines GPIO 34, 35, 36 y 39 solo leen.`));
add("L<");
add(...img("espa", FIG("elec_esp32_a.png"), "Conexiones del ESP32 (1 de 2): motores a pasos, servo y LEDs.", 880, 600));
add(...img("espb", FIG("elec_esp32_b.png"), "Conexiones del ESP32 (2 de 2): RS485, finales de carrera, QTR-8A, I²C y lectura de batería.", 880, 640));
add("L>");
add(P("La placa perforada de 9 × 15 cm lleva 107 cables en 14 grupos; cada uno tiene color, calibre y largo en la tabla de cables de la hoja de armado. La conexión eléctrica de la celda (infrarrojo → LOGO!, salidas GPIO 8 y 9 → relevadores) está en la Figura " + F.eleccel + "."));
add(H2("2.9 Programas y algoritmos principales"));
add(P("Se explican los cuatro algoritmos más importantes. El código completo está en los Anexos A y F."));
add(H3("2.9.1 Juicio estable de la celda"));
add(P("Cada 0.5 s la cámara entrega un juicio (PASS, FAIL o SIN_PIEZA). El programa cuenta cuántos juicios iguales van seguidos; solo cuando llegan a cinco y no está ocupada, dispara la secuencia una sola vez por pieza y se «desarma» hasta ver SIN_PIEZA, para no repetir la acción sobre la misma pieza. Fragmento (cell_line.py, método ver):"));
add(...code(`def ver(self, juicio):
    with self._lock:
        if juicio == self._ultimo:
            self._racha += 1          # otro juicio igual seguido
        else:
            self._ultimo, self._racha = juicio, 1
        if self._busy or not self._running or self._racha < self.estables:
            return                    # aún no hay 5 iguales
        if juicio == "SIN_PIEZA":
            self._armed = True        # se permite una pieza nueva
            return
        if juicio in ("PASS", "FAIL") and self._armed:
            self._armed, self._busy = False, True   # una sola vez`));
add(H3("2.9.2 Secuencia del pistón y de la banda"));
add(P("Si el juicio es FAIL: espera 3 s a que la pieza llegue al pistón, enciende el GPIO 8 durante 1 s, lo apaga y espera 2 s a que regrese; después pulsa el GPIO 9 durante 0.5 s para que el LOGO! avance la banda. Si es PASS solo se hace el pulso del GPIO 9. Si no hay chip GPIO, el sistema no finge: anota «fallo_actuacion» (FAIL) o «pulso_no_enviado» (PASS). Un paro del operador aborta la secuencia y apaga ambas salidas."));
add(H3("2.9.3 Envío de observaciones en lotes"));
add(P("El agente del Jetson no envía un POST por cada observación: las junta y las manda cada cierto intervalo (variable AETHER_OUTBOX_INTERVAL_S). Cada observación lleva un identificador único (event_id); si el servidor la recibe dos veces, descarta la repetida, de modo que un reintento por falla de red no duplica el inventario."));
add(H3("2.9.4 Navegación y ciclo del carrito (diseño)"));
add(P("El Jetson planea una ruta por waypoints con odometría de los encoders corregida por la IMU; los sensores de distancia frenan si algo aparece a menos de 40 cm; el embudo y el ArUco centran el carrito en cada estación (±5 mm). El ESP32 ejecuta las órdenes y se detiene solo si pasa 1 s sin recibir ninguna. Este algoritmo es diseño: no existe aún el firmware."));

// ---- 2.10 BOM (apaisado)
const sub = (id) => {
  if (["postes","largueros","travesanos","trav_c","columnas","trav_sc","trav_emp","escuadras","placas","tuercas","panel"].includes(id)) return "Estructura";
  if (["rodajas","susp","resortes","m0601"].includes(id)) return "Tracción";
  if (["cuna","bateria","correa"].includes(id)) return "Energía";
  if (["guias","brk_lo","brk_up","nema_elev","cople","kfl","husillo","varilla","sc8uu","tuerca_laton","plataforma","fc","prod","pframe","pframe_r","carro","pinion","nema_emp","servo","horn","pin","fixture"].includes(id)) return "Torre y empujador";
  if (["bandeja","perf","sockets","esp32","a4988","cap100","lvl","max485","pcf","bno","resist","conectores","boost","xl4005","relay","xt60","fuses","kcd1","estop"].includes(id)) return "Electrónica y potencia";
  if (["vl53","qtr","jet_plate","jetson","camera"].includes(id)) return "Navegación y cómputo";
  if (["banda","mesa_inc"].includes(id)) return "Estación";
  return "Herramientas";
};
const bomRows = bom.map((c, i) => [String(i + 1), c.name, c.qty, sub(c.id), blank, blank, blank]);
const bomW = [450, 3300, 1250, 1700, 1300, 1000, 1000, 1000]; // 8 columnas: + fuente
const bomHead = ["N.º", "Componente", "Cantidad", "Subsistema", "Marca / modelo", "Fuente de adquisición", "Costo unitario (MXN)", "Costo total (MXN)"];
const rowsB = (arr) => arr.map((r, i) => [String(i + 1), r[0], r[1], r[2], blank, blank, blank, blank]);
const bomSec = [
  H2("2.10 Lista de materiales, cantidades, marca/modelo, costo y fuente de adquisición"),
  P("La lista incluye **todos los componentes de la hoja de armado del carrito (revisión 3.8)**, los materiales adicionales de la hoja de costos y los de la celda. Las columnas amarillas (marca o modelo, fuente de adquisición y costos) las llena el equipo con sus cotizaciones: la hoja de costos que se tiene (PDF) no conserva las columnas de precio y no se inventó ninguno. Del motor-rueda M0601 se decidió el modelo y ya existe cotización; su precio debe capturarse aquí. Donde la hoja de armado ya nombra el modelo, este aparece en el nombre del componente."),
  ...T("Lista de materiales del carrito y la estación (69 componentes de la hoja de armado)", bomHead, bomRows.map((r) => [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[6]]), bomW, { size: 15, center: [0, 2] }),
];
const extras = [
  ["Cargador inteligente BR-700 (6 A) para plomo-ácido", "1", "Electrónica y potencia"],
  ["Cable de silicona flexible 14 AWG (3 m rojo y 3 m negro)", "6 m", "Electrónica y potencia"],
  ["Tira Neopixel WS2812 5050 (LEDs de estado)", "3", "Electrónica y potencia"],
  ["Fusible automotriz 15 A (uno más de repuesto)", "2", "Electrónica y potencia"],
  ["Fusible automotriz 10 A (uno más de repuesto)", "2", "Electrónica y potencia"],
  ["Faston hembra 1/4 in con forro", "2", "Electrónica y potencia"],
  ["Terminales de ojillo para 12–14 AWG (bornes de la batería)", "1 juego", "Electrónica y potencia"],
  ["Plug DC 5.5 × 2.5 mm con cable (alimentación del Jetson)", "1", "Electrónica y potencia"],
  ["Cámara Yahboom IMX219 8 MP 77° (CSI), planeada para el Jetson", "1", "Navegación y cómputo"],
  ["Marcadores ArUco, embudos de acople e impresos de apoyo", "1 juego", "Navegación y cómputo"],
  ["Perfil 3030 faltante (por definir con el corte final)", "1", "Estructura"],
  ["Escuadras para 3030 impresas en PETG (16 de 36 × 36 × 20 y 12 de otra medida)", "28 (la hoja de costos anota 50)", "Estructura"],
  ["Varilla lisa de 8 mm × 60 cm (segunda guía de la plataforma)", "1", "Torre y empujador"],
];
const tornRows = [
  ["Tuerca T de martillo M6 (drop-in)", "[[confirmar]]", "Sujetan todo al perfil de 8 mm de ranura"],
  ["Tornillo M6 × 12 cabeza Allen", "[[confirmar]]", "Escuadras (56), placas y piezas de 5–6 mm"],
  ["Tornillo M6 × 16 cabeza Allen", "18", "Guías traseras de la pila y piezas de 8 mm"],
  ["Rondana plana M6", "[[confirmar]]", "Bajo cada cabeza Allen M6"],
  ["Tornillo M6 × 20 cabeza Allen", "4", "Bandeja de electrónica"],
  ["Tornillo M6 × 12 cabeza plana avellanada", "12", "Guías delanteras de la pila"],
  ["Tornillo M8 × 40 + tuercas M8 (pivote y precarga) + rondana M8", "2 + 2 + 2 + 12", "Pivote de la suspensión"],
  ["Tornillo M8 × 70 + tuerca T M8", "2", "Ranura del larguero"],
  ["Tornillo M3 × 8", "24", "3 NEMA 17 y separadores de la placa"],
  ["Tornillo M3 × 10", "8", "4 sensores VL53L0X (2 por sensor)"],
  ["Tornillo M3 × 12", "10", "Elevador de voltaje y relevador a la bandeja"],
  ["Tornillo M3 × 20", "10", "Tuercas T8 de los husillos"],
  ["Tuerca hexagonal M3", "32", "Varias uniones"],
  ["Prisionero M3 × 12", "2", "Piñón del empujador"],
  ["Tornillo M4 × 12", "24", "6 rodamientos SC8UU"],
  ["Tornillo M4 × 20 + tuerca", "4", "Placa de la plataforma"],
  ["Tornillo M2.5 × 12 autorroscante", "6", "3 finales de carrera"],
  ["Tornillo M2.5 × 12 cabeza plana avellanada", "8", "3 por M0601 a la placa pivotante y 2 de otra pieza"],
  ["Tornillo M5 × 20 + tuerca y rondana", "8", "Chumaceras KFL08"],
  ["Tornillo M2 × 8 + tuerca", "2", "Barra QTR-8A"],
  ["Tornillería de la cremallera y del soporte", "1 juego", "Cremallera del empujador"],
  ["Separadores M3 de nylon (20) y lubricante", "1 juego", "Montar la placa en la bandeja y lubricar guías"],
  ["Fijador de roscas Loctite azul 243", "1", "Tornillos del M0601 y pivotes"],
];
const celdaRows = [
  ["Raspberry Pi 4", "1", "Cómputo de la celda: cámara, YOLO ONNX, GPIO"],
  ["Cámara USB de la celda", "1", "Imagen para el juicio PASS/FAIL"],
  ["LOGO! (controlador)", "1", "Maneja la banda; entrada I4 (avance) e I3 (infrarrojo)"],
  ["Módulo de 2 relevadores (GPIO 8 y GPIO 9)", "1", "Pistón y avance de la banda; ninguna señal de 24 V llega a un GPIO"],
  ["Electroválvula de 24 V y pistón", "1", "Expulsa las piezas FAIL"],
  ["Sensor infrarrojo de presencia (24 V)", "1", "Entrada I3 del LOGO!"],
  ["Banda transportadora (3 tramos de 1030 mm)", "1", "Cinta de 20.35 cm de ancho"],
  ["Fuente de 24 V y de 5 V del tablero", "[[confirmar]]", "Alimentación separada de LOGO!, sensores y Pi"],
  ["Contenedor de scrap, switch de red y cables", "[[confirmar]]", "Recibe piezas rechazadas; red local"],
];
bomSec.push(...T("Materiales adicionales de la hoja de costos que no figuran como componente de la hoja de armado", bomHead, rowsB(extras), bomW, { size: 15, center: [0, 2] }));
bomSec.push(...T("Tornillería y consumibles (hoja de costos)", bomHead, rowsB(tornRows), bomW, { size: 15, center: [0, 2] }));
bomSec.push(...T("Componentes de la celda de manufactura (por confirmar con el equipo de la celda)", bomHead, rowsB(celdaRows), bomW, { size: 15, center: [0, 2] }));
bomSec.push(P("**Total estimado del proyecto (MXN):** [[por calcular al llenar los costos]]. Este documento no repite precios que no pudo leer en la hoja de costos."));

// ======= parte vertical 2: layout, construcción, pruebas
const part2 = [];
const a2 = (...x) => x.flat().forEach((e) => part2.push(e));
a2(H2("2.11 Distribución física / layout / boceto de maqueta"));
a2(P(`La Figura ${F.layout} es una vista superior. Están dibujados **a escala** la banda (309 cm), el carrito (50 × 40 cm) y la mesa de descarga (140 × 30 cm). La posición de la cámara, el infrarrojo, el pistón, el contenedor de scrap y el tablero a lo largo de la banda es **esquemática** y sus cotas quedan pendientes hasta medir la banda armada.`));
a2(...img("layout", FIG("layout.png"), "Distribución física de la celda, el carrito y la mesa de descarga (vista superior).", 624, 360));
a2(H2("2.12 Procedimiento de construcción, integración y puesta en marcha"));
a2(P("Esta sección separa lo que **ya existe y se vio funcionar**, lo que **existe como diseño** y lo que **falta**. Las fotos las toma el equipo después y se pegan en los recuadros indicados."));
a2(...T("Estado de cada parte", ["Parte", "Estado", "Evidencia"], [
  ["Servidor, base de datos y panel web", "Implementado", "Código en el repositorio y pruebas automáticas; capturas en la sección 4.7"],
  ["Agente de la celda (visión, juicio, GPIO)", "Implementado; prueba completa con la banda PENDIENTE", "Código cell_line.py y celda_agent.py; pruebas de cell_line pasan"],
  ["Pistón con el LOGO! de la celda", "Funciona (informado por el equipo)", "[[foto o video por agregar]]"],
  ["Jetson Orin Nano Super", "Puesto en marcha: PyTorch de NVIDIA funciona", "Bitácora de hardware real del repositorio (21 de octubre de 2026)"],
  ["Asistente de voz Lumina", "Implementado (activación por palabra, texto vía Vosk)", "Código y pruebas"],
  ["Diseño 3D del carrito y hoja de armado", "Terminado (rev. 3.8)", `Figuras ${F.cad1} a ${F.cotas}`],
  ["Construcción física del carrito", "PENDIENTE", "—"],
  ["Firmware del ESP32", "PENDIENTE (se hará con PlatformIO)", "—"],
  ["Enlace Modbus TCP entre la Pi y el LOGO!", "PENDIENTE (diseño del reporte HMI)", "—"],
], [3200, 3200, 2960]));
a2(H3("2.12.1 Celda de manufactura"));
a2(P("El controlador de la celda es el LOGO! y ya funciona con el pistón. Esta subsección la redacta el equipo de la celda: se deja en blanco a propósito para que escriba cómo se construyó, cómo se programó el LOGO!, cómo se conectó el pistón y qué se probó."));
a2(P("[[ESCRIBIR AQUÍ: construcción e implementación del PLC (LOGO!) y del pistón — por el equipo de la celda]]", { bold: true }));
a2(P("[[Cómo se cableó el LOGO! y qué entradas y salidas usa]]\n[[Programa del LOGO! (diagrama de funciones o de escalera)]]\n[[Conexión del pistón, la electroválvula y los relevadores]]\n[[Pruebas realizadas y resultado]]"));
a2(...foto("fcelda", "Vista general de la celda armada.", "Foto de la celda completa (banda, cámara, pistón y tablero)."));
a2(...foto("ftab", "Tablero con el LOGO!, la fuente de 24 V y los relevadores.", "Foto del interior del tablero."));
a2(...foto("fpist", "Pistón de scrap y su electroválvula.", "Foto del pistón montado junto a la banda."));
a2(H3("2.12.2 Carrito (Aether Inventory)"));
a2(P("El carrito está **diseñado, documentado y con la lista de materiales lista**, pero no se ha construido. El orden de armado previsto en la hoja de armado es: marco inferior y superior con postes y largueros; suspensión y motores-rueda; batería y su correa; columnas y torre del elevador; empujador y uña; bandeja de electrónica y cableado; Jetson, sensores y panel frontal. Al empezar el armado, el equipo agrega las fotos de cada etapa."));
a2(...foto("fest", "Perfiles de 3030 cortados y marco armado.", "Foto del avance de la estructura cuando se arme."));
a2(...foto("fban", "Bandeja de electrónica armada en la mesa.", "Foto de la placa perforada con ESP32, drivers y módulos."));
a2(H3("2.12.3 Software: prueba local en la laptop"));
a2(P("El software de la celda se puede probar en la laptop sin la Raspberry Pi ni el pistón: el servidor del repositorio (main.py) ya trae el modo local, en el que la cámara de la laptop alimenta el juicio PASS/FAIL, y el programa de la celda (cell_line.py) sigue la misma secuencia aunque no haya chip GPIO. Para las capturas siguientes se arrancó el servidor local con las salidas GPIO **simuladas** y juicios PASS/FAIL **inyectados** cada 0.5 s (no hay cámara de celda ni banda en esta prueba), y se inició sesión en la pantalla de la celda con una cuenta de prueba local. Los conteos y las últimas piezas de la captura son de esa prueba, no de la banda real. Lumina se capturó en reposo («Dormida»)."));
a2(...imgOpt("dash1", CAP("dash_index.png"), "Portada del panel web (servidor local).", "Captura de la portada del panel (index.html).", 520, 330));
a2(...imgOpt("appcelda", CAP("app_celda_2.png"), "Pantalla de la celda (celda.html) en prueba local: estado «Operando», juicio, producción, últimas piezas y alarmas; GPIO simulado.", "Captura de la página de la celda.", 520, 330));
a2(...imgOpt("applumina", CAP("app_lumina_1.png"), "Lumina, el asistente del robot, en reposo (robot.html).", "Captura de Lumina.", 520, 330));
a2(...imgOpt("dash3", CAP("dash_inventario.png"), "Inventario declarado (inventory.html).", "Captura del inventario.", 520, 330));
a2(H2("2.13 Pruebas preliminares, fallas encontradas y ajustes realizados"));
a2(P("Se separan las pruebas **hechas** de las **por hacer**. Para las segundas se indica qué se mide, cómo y con qué criterio se aprueba; los criterios son una **propuesta** que el equipo puede ajustar."));
a2(...T("Pruebas preliminares", ["N.º", "Qué se prueba", "Cómo", "Criterio de aceptación", "Estado y resultado"], [
  ["1", "Lógica del servidor, los agentes y la celda", "pytest sobre tests/backend (24 de octubre de 2026, laptop con Windows)", "Todas pasan", "VERIFICADO: 285 pasan y 11 fallan, todas con el mismo error de Windows al lanzar un subproceso (WinError 6, parece del entorno de ejecución). test_main.py no se pudo ejecutar porque falta la librería sqlalchemy en ese entorno"],
  ["2", "Puesta en marcha del Jetson", "Importar PyTorch de NVIDIA y abrir la cámara", "Sin errores; cámara con imagen", "HECHA (bitácora del repositorio, 21 de octubre de 2026)"],
  ["3", "Pistón con el LOGO!", "Activar el pistón con la salida de la celda", "El pistón sale y regresa en cada orden", "HECHA según el equipo; [[agregar registro o video]]"],
  ["3a", "Pantalla y secuencia de la celda en la laptop", "Servidor local con GPIO simulado y juicios inyectados (24 de octubre de 2026)", "La pantalla muestra «Operando», cuenta PASS y FAIL y completa la secuencia del pistón", "VERIFICADO a la vista: la pantalla contó 3 PASS y 1 FAIL con el estado «Operando»; sin hardware real (Figura de la sección 2.12.3)"],
  ["4", "Precisión del modelo YOLO", "Conjunto de piezas de validación del dataset", "mAP50 ≥ 0.90", "Reportada en el entrenamiento (0.995); no se repitió en esta revisión"],
  ["5", "Juicio con la banda real", "20 piezas buenas y 20 malas por la banda", "≥ 95 % bien clasificadas y 0 fallos de expulsión", "PENDIENTE"],
  ["6", "Tiempos del ciclo FAIL y PASS", "Cronometrar 10 ciclos", "Cada pieza FAIL expulsada y la banda reanuda sin atascos", "PENDIENTE (calibrar la espera de 3 s)"],
  ["7", "Falla del pistón", "Desconectar el relevador y pasar una pieza FAIL", "El sistema registra «fallo_actuacion» y levanta la alarma", "PENDIENTE"],
  ["8", "Enlace Modbus TCP Pi ↔ LOGO!", "Leer y escribir los registros y esperar el acuse", "Acuse recibido en menos de 1 s", "PENDIENTE (aún sin implementar)"],
  ["9", "Paro de emergencia del carrito", "Pulsar el paro con motores energizados y medir 12 V y 18 V", "0 V en ruedas y drivers; Jetson sigue encendido", "PENDIENTE (carrito sin construir)"],
  ["10", "Tensión de la fuente de 5 V", "Medir con multímetro antes de conectar el ESP32", "5.0 a 5.1 V", "PENDIENTE"],
  ["11", "Elevador de seis niveles", "Subir y bajar con seis fixtures", "Paso de 7.0 cm ± 1 mm y sin atoramiento", "PENDIENTE"],
  ["12", "Acople a la banda", "Acoplar 10 veces con el embudo y el ArUco", "Error ≤ 5 mm en las 10 veces", "PENDIENTE"],
  ["13", "Frenado por obstáculo", "Colocar un obstáculo a menos de 40 cm", "El carrito se detiene antes de tocarlo", "PENDIENTE"],
  ["14", "Ciclo completo celda → carrito → mesa", "Un fixture de la banda a la mesa", "Fixture en la mesa y observación registrada en el servidor", "PENDIENTE"],
], [450, 1900, 2400, 2200, 2410], { center: [0], size: 16 }));
a2(...T("Fallas encontradas y ajustes realizados", ["N.º", "Problema", "Causa", "Ajuste", "Estado"], [
  ["1", "Los brazos robóticos no caben en tiempo y equipo disponibles", "Alcance demasiado grande", "ADR 0010: banda con fixtures y pistón de expulsión (16 de septiembre de 2026)", "Resuelto"],
  ["2", "La Raspberry Pi 5 no es necesaria", "El Jetson cubre el robot", "Se descartó la Pi 5; la celda usa una Pi 4", "Resuelto"],
  ["3", "PyTorch no corría en el Jetson", "Faltaba una librería de NVIDIA (libcusparseLt); numpy 2 y un paquete que arrastraba torch", "Se instaló la librería, se fijó numpy menor que 2 y se quitó el paquete", "Resuelto (bitácora)"],
  ["4", "El código fallaba en Python 3.10 del Jetson", "Se usaba datetime.UTC", "Se cambió a timezone.utc", "Resuelto"],
  ["5", "El video del agente quedaba bloqueado en el panel", "La política de seguridad del navegador (CSP) no incluía el origen del agente", "Se agregó el origen; el mensaje de error distingue «bloqueado por seguridad» de «cámara no disponible»", "Resuelto"],
  ["6", "El audio de la voz de Lumina no sonaba", "La CSP no permitía audio de tipo blob y data", "Se agregó media-src con blob: y data:", "Resuelto"],
  ["7", "Vosk no conoce la palabra «lumina»", "No está en su vocabulario", "Palabra de activación tolerante y emisión por fin de frase", "Resuelto"],
  ["8", "Un POST por cada observación saturaba el servidor", "Envío uno a uno", "Las observaciones se juntan en lotes (AETHER_OUTBOX_INTERVAL_S)", "Resuelto"],
  ["9", "Navegadores del Jetson", "Problema abierto anotado en la bitácora", "Opciones en el ADR 0011", "Abierto"],
  ["10", "El paro de emergencia no avisa al ESP32", "El diseño solo corta el relevador", "Decidir si se agrega un pin de lectura", "Abierto"],
  ["11", "La hoja de costos no conserva las columnas de precio", "Se exportó sin esas columnas", "El equipo captura costos en la lista de materiales", "Pendiente"],
  ["12", "El enlace Modbus TCP del reporte HMI no está en el código", "Solo está en el diseño", "Implementarlo y probarlo antes de declararlo", "Pendiente"],
], [450, 2200, 2200, 3250, 1260], { center: [0], size: 16 }));

// ======= CAPÍTULO 3 (apaisado para el Gantt) + resto
const gsec = [];
const g3 = (...x) => x.flat().forEach((e) => gsec.push(e));
g3(H1("Capítulo 3. Administración y dirección"));
g3(H2("3.1 Plan de trabajo y cronograma / Gantt"));
g3(P("El Gantt tiene dos partes. La primera muestra el **programa del curso** (las fases del calendario del docente, sombreadas en azul). La segunda lista las **actividades del proyecto**: las ya terminadas llevan las fechas reales tomadas del historial del repositorio y se sombrean en verde; las demás se llenan por el equipo (columnas amarillas). Colores de estado: verde terminada, amarillo en proceso, gris pendiente. Las semanas comienzan en lunes."));
const weeks = ["31/08", "07/09", "14/09", "21/09", "28/09", "05/10", "12/10", "19/10", "26/10", "02/11", "09/11", "16/11", "23/11", "30/11"];
const gw = [3100, 1100, 800, 800, ...weeks.map(() => 560)];
const gh = ["Actividad", "Estado", "Inicio", "Fin", ...weeks];
const BLU = "BFD7F2", GRN = "C8E6C9", AMB = "FFE9A8", GRY = "E1E5EA";
const shade = (idxs, color) => weeks.map((_, i) => ({ t: "", fill: idxs.includes(i) ? color : undefined }));
const rg = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const prog = [
  ["Integración de equipos e idea (11/09)", rg(0, 1)], ["Definición y diseño conceptual (25/09)", rg(1, 3)], ["Diseño técnico y planeación (09/10)", rg(3, 5)],
  ["Construcción e integración (23/10)", rg(5, 7)], ["Pruebas y validación (06/11)", rg(7, 9)], ["Entrega preliminar (20/11)", rg(9, 11)],
  ["Pre-integradora (26/11)", [12]], ["Correcciones finales (27/11 al 02/12)", [12, 13]], ["Presentación final (03/12)", [13]],
];
g3(...T("Programa del curso (Gantt programado)", ["Fase", "Estado", "Inicio", "Fin", ...weeks], prog.map((p) => [p[0], { t: "Programada", fill: BLU }, { t: "" }, { t: "" }, ...shade(p[1], BLU)]), gw, { size: 13 }));
const acts = [
  ["Fase 0: arquitectura y decisiones (ADR)", "T", "30/08", "01/09", rg(0, 0)],
  ["Servidor, inventario y panel web", "T", "01/09", "02/09", rg(0, 0)],
  ["Visión: YOLO, ArUco y código", "T", "01/09", "02/09", rg(0, 0)],
  ["Robot Lumina (voz y cara)", "T", "02/09", "17/09", rg(0, 2)],
  ["Cambio de alcance: banda, fixtures y pistón (ADR 0010)", "T", "16/09", "16/09", [2]],
  ["Sitio público y dominio", "T", "16/10", "16/10", [6]],
  ["Puesta en marcha del Jetson Orin Nano Super", "T", "21/10", "21/10", [7]],
  ["Agente de la celda, del Jetson y voz (R0 a R6)", "T", "22/10", "23/10", [7]],
  ["Diseño 3D del carrito y hoja de armado rev. 3.8", "T", null, null, []],
  ["LOGO! y pistón de la celda", "E", null, null, []],
  ["Calibración de tiempos y prueba con la banda", "E", null, null, []],
  ["Compra de materiales del carrito", "E", null, null, []],
  ["Construcción de la estructura del carrito", "P", null, null, []],
  ["Montaje de la torre y del empujador", "P", null, null, []],
  ["Electrónica y cableado del carrito", "P", null, null, []],
  ["Firmware del ESP32 (PlatformIO)", "P", null, null, []],
  ["Enlace Modbus TCP Pi ↔ LOGO!", "P", null, null, []],
  ["Navegación por waypoints y acople", "P", null, null, []],
  ["Pruebas integrales celda → carrito", "P", null, null, []],
  ["Documento completo y presentación", "P", null, null, []],
];
const st = { T: ["Terminada", GRN], E: ["En proceso", AMB], P: ["Pendiente", GRY] };
g3(...T("Actividades del proyecto (Gantt realizado)", gh, acts.map((a) => [a[0], { t: st[a[1]][0], fill: st[a[1]][1], bold: true }, a[2] ? a[2] : blank, a[3] ? a[3] : blank, ...shade(a[4], GRN)]), gw, { size: 13 }));
g3(P("Fuente de las fechas verdes: historial de cambios del repositorio (fechas de los envíos de código). Una fecha de código no equivale a una prueba con hardware: la prueba física de cada actividad está en la sección 2.13.", { italics: true, size: 18 }));

const adm = [];
const a3 = (...x) => x.flat().forEach((e) => adm.push(e));
a3(H2("3.2 Responsabilidades de los integrantes"));
a3(...T("Responsabilidades por área", ["Área", "Responsable", "Qué entrega"], [
  ["Visión y software (Jetson, Pi, servidor)", "[[responsable]]", "Agentes, servidor, panel y modelo YOLO"],
  ["Celda (LOGO!, banda, pistón)", "[[responsable]]", "Celda funcionando y su documentación"],
  ["Diseño mecánico del carrito", "[[responsable]]", "Planos, estructura y torre"],
  ["Electrónica y firmware del carrito", "[[responsable]]", "Tablero, cableado y firmware del ESP32"],
  ["Interfaz y HMI", "[[responsable]]", "Pantallas y alarmas"],
  ["Documentación e informe", "Mario Iván Méndez Álvarez (elabora este documento)", "Informe integrador"],
], [3000, 3200, 3160]));
a3(H2("3.3 Recursos humanos, materiales, herramientas y servicios"));
a3(...T("Recursos del proyecto", ["Tipo", "Recurso", "Estado"], [
  ["Humanos", "Seis integrantes de 10.º cuatrimestre de Mecatrónica y el docente asesor", "Disponibles"],
  ["Materiales", "Los de la lista de materiales (sección 2.10)", "Ver disponibilidad en la lista"],
  ["Herramientas", "Impresión 3D (PETG) para escuadras y piezas; mesa de trabajo; nivel de burbuja; [[otras herramientas: multímetro, soldador, taladro, etc.]]", "[[confirmar]]"],
  ["Servicios de software", "Repositorio privado de Git, Python, PlatformIO, Ollama (modelo local), Vosk (voz local)", "Disponibles"],
  ["Servicios en la nube", "ElevenLabs (voz de Lumina) y GitHub Pages con Cloudflare (sitio público estático)", "Disponibles; costo [[confirmar]]"],
  ["Instalaciones", "Laboratorio de la universidad y espacio de la celda [[confirmar]]", "[[confirmar]]"],
], [1700, 5400, 2260]));
a3(H2("3.4 Presupuesto y control de costos"));
a3(P("La suma se hará con la lista de materiales de la sección 2.10. Resumen por subsistema (se llena cuando existan los costos):"));
a3(...T("Presupuesto por subsistema y costo real", ["Subsistema", "Presupuesto (MXN)", "Costo real (MXN)"], [
  ["Estructura", blank, blank], ["Tracción", blank, blank], ["Energía y electrónica", blank, blank], ["Torre y empujador", blank, blank], ["Navegación y cómputo", blank, blank], ["Celda de manufactura", blank, blank], ["Tornillería y consumibles", blank, blank], [{ t: "TOTAL", bold: true }, blank, blank],
], [4500, 2430, 2430]));
a3(H2("3.5 Gestión de adquisiciones y disponibilidad de recursos"));
a3(...T("Adquisiciones", ["Elemento", "Estado de compra", "Proveedor / cotización", "Fecha prevista"], [
  ["Motores-rueda M0601 (2)", "Modelo decidido y cotizado", "[[proveedor]]", "[[fecha]]"],
  ["Perfil 3030 y tornillería", "[[comprado / pendiente]]", "[[proveedor]]", "[[fecha]]"],
  ["Electrónica (ESP32, drivers, sensores, módulos)", "[[comprado / pendiente]]", "[[proveedor]]", "[[fecha]]"],
  ["Batería y cargador", "[[comprado / pendiente]]", "[[proveedor]]", "[[fecha]]"],
  ["Materiales de la celda (relevadores, electroválvula, infrarrojo)", "[[comprado / pendiente]]", "[[proveedor]]", "[[fecha]]"],
], [3300, 2300, 2000, 1760]));
a3(H2("3.6 Riesgos, contingencias y acciones preventivas y correctivas"));
a3(...T("Riesgos principales", ["Riesgo", "Probabilidad", "Efecto", "Acción preventiva", "Acción correctiva"], [
  ["Retraso en la llegada de materiales del carrito", "Media", "El carrito no se construye a tiempo", "Priorizar la compra de los M0601 y la estructura", "Entregar la celda funcionando y el carrito en simulación 3D"],
  ["Falta del firmware del ESP32", "Alta", "El carrito no se mueve", "Empezar por pruebas individuales de cada motor", "Control manual por comandos desde el Jetson"],
  ["Iluminación variable en la celda", "Media", "Juicios inestables", "Cinco juicios iguales seguidos y luz controlada", "Ajustar el umbral y la cámara"],
  ["Falla del pistón sin aviso", "Baja", "Una pieza mala sigue en la línea", "El código registra «fallo_actuacion» y levanta alarma", "Revisar relevador y aire"],
  ["Peso de la batería (8.3 kg) en un frenazo", "Media", "Daño al carrito", "Correa con hebilla y cuna impresa", "Reducir la velocidad máxima"],
], [2300, 1000, 1700, 2300, 2060], { size: 16 }));
a3(H2("3.7 Control y seguimiento: programado vs. realizado"));
a3(...T("Control de avance contra el calendario", ["Fecha límite", "Fase", "Qué se esperaba", "Qué se logró (24 de octubre de 2026)", "Estado"], [
  ["11/09", "Integración de equipos e idea", "Idea con PLC, microcontrolador y manufactura flexible", "Equipo integrado e idea definida", "Cumplida"],
  ["25/09", "Definición y diseño conceptual", "Arquitectura y diseño conceptual", "Arquitectura y ADR; cambio de alcance el 16/09", "Cumplida"],
  ["09/10", "Diseño técnico y planeación", "Diseño técnico y lista de materiales", "Diseño 3D del carrito (rev. 3.8) y lista de materiales sin costos", "Cumplida en lo técnico; costos pendientes"],
  ["23/10", "Construcción e integración", "Proyecto construido e integrado", "Software de la celda y agentes integrados; carrito sin construir", "Parcial"],
  ["06/11", "Pruebas y validación", "Pruebas con el sistema armado", "—", "Pendiente"],
  ["20/11", "Entrega preliminar", "Proyecto funcional y documento completo", "—", "Pendiente"],
  ["26/11 y 03/12", "Pre-integradora y presentación final", "Presentaciones", "—", "Pendiente"],
], [1100, 2100, 2200, 2700, 1260], { size: 16 }));

// ======= CAPÍTULO 4
const res = [];
const a4 = (...x) => x.flat().forEach((e) => res.push(e));
a4(H1("Capítulo 4. Resultados y evaluación"));
a4(P("Este capítulo reúne los resultados disponibles al 24 de octubre de 2026. Como el carrito aún no está construido, varias secciones tienen la estructura lista y los datos por completar tras las pruebas."));
a4(H2("4.1 Resultados de las pruebas"));
a4(...T("Resultados de las pruebas", ["Prueba", "Resultado medido", "Comentario"], [
  ["Pruebas automáticas del servidor y los agentes", "285 pasan; 11 fallan por WinError 6 (subproceso)", "VERIFICADO el 24/10/2026; test_main.py no se ejecutó (falta sqlalchemy en ese entorno)"],
  ["Puesta en marcha del Jetson", "PyTorch de NVIDIA funciona", "Bitácora del repositorio, 21/10/2026"],
  ["Pistón con el LOGO!", "Funciona (según el equipo)", "[[registro o video]]"],
  ["Juicio con la banda real (20 + 20 piezas)", blank, "PENDIENTE"],
  ["Tiempos del ciclo FAIL y PASS", blank, "PENDIENTE"],
  ["Elevador, acople y navegación del carrito", blank, "PENDIENTE (carrito sin construir)"],
], [3300, 3000, 3060]));
a4(H2("4.2 Pruebas en condiciones normales y, cuando aplique, máximas de operación"));
a4(...T("Pruebas de operación", ["Condición", "Qué se prueba", "Resultado"], [
  ["Normal", "Ciclo completo con una pieza PASS y una FAIL", blank],
  ["Normal", "Transporte de un fixture de la banda a la mesa", blank],
  ["Máxima", "Carga de 6 fixtures en la torre", blank],
  ["Máxima", "Velocidad máxima del carrito (0.35 m/s) con frenado por obstáculo", blank],
  ["Límite", "Batería baja: lectura del divisor de voltaje y comportamiento", blank],
  ["Falla", "Pérdida de red o de la laptop: la celda sigue sola", blank],
], [1700, 5000, 2660]));
a4(H2("4.3 Cumplimiento de objetivos y metas"));
a4(...T("Cumplimiento de objetivos", ["Objetivo específico", "Estado", "Evidencia"], [
  ["Juzgar piezas y accionar el pistón y la banda", "Cumplido en software; prueba completa pendiente", "Código y pruebas automáticas; pistón funciona"],
  ["Diseñar y construir el carrito", "Diseño cumplido; construcción pendiente", `Figuras ${F.cad1} a ${F.cotas}`],
  ["Registrar y mostrar observaciones", "Cumplido", "Servidor y panel; capturas de la sección 4.7"],
  ["Documentar diseño, materiales y pruebas", "En proceso", "Este documento"],
], [3800, 2800, 2760]));
a4(H2("4.4 Impacto técnico, económico o productivo"));
a4(P("**Técnico:** un modelo de integración de visión, PLC, microcontrolador y robot móvil documentado de punta a punta. **Económico:** todo el equipo es accesible para una pequeña empresa; el costo total se estima al llenar la lista de materiales: [[costo total]]. **Productivo:** una pieza se inspecciona en unos 3 segundos si pasa y unos 9 si se rechaza (tiempos de diseño, sin medir en la banda); el impacto productivo real se calcula con las pruebas de la sección 4.2: [[por medir]]."));
a4(H2("4.5 Costo y tiempo real de realización"));
a4(...T("Costo y tiempo: planeado y real", ["Concepto", "Planeado", "Real"], [
  ["Costo total del proyecto (MXN)", blank, blank],
  ["Horas de trabajo del equipo", blank, blank],
  ["Fecha de entrega del proyecto funcional", "20/11/2026 (calendario del curso)", blank],
], [4000, 2800, 2560]));
a4(H2("4.6 Evaluación de factibilidad y cumplimiento normativo"));
a4(P("**Técnica:** el software y la celda son factibles y ya corren; el carrito es factible según el diseño, pero depende de construirlo y escribir su firmware. **Económica:** pendiente de los costos. **Normativa:** los criterios de la sección 1.12 se aplicaron en el diseño; la evaluación formal de riesgos (ISO 12100) y la verificación del paro de emergencia son pendientes."));
a4(H2("4.7 Producto final: fotografías, evidencia de funcionamiento y enlace al video"));
a4(P("Las capturas del software (panel, celda, Lumina e inventario) están en la sección 2.12.3. Aquí va la evidencia física del producto final, que el equipo agrega cuando el sistema esté armado."));
a4(...foto("final1", "Producto final funcionando: celda y carrito.", "Foto del producto final cuando esté armado."));
a4(P("Enlace al video de funcionamiento: [[enlace al video — por completar]]"));

// ======= CONCLUSIONES
const fin = [];
const a5 = (...x) => x.flat().forEach((e) => fin.push(e));
a5(H1("Conclusiones"));
a5(P("El software de la línea y el diseño del carrito están avanzados y documentados con evidencia: la celda juzga y acciona, el servidor registra y el carrito tiene su diseño 3D, su lista de materiales y su diagrama eléctrico y de conexión. Lo más importante que falta es construir el carrito, escribir su firmware y probar el sistema completo con la banda real. Con los costos, fechas y fotos que el equipo debe agregar, el documento queda listo para la entrega preliminar."));
a5(H2("Conclusión individual de cada integrante"));
a5(...T("Conclusiones individuales (cinco renglones por integrante)", ["Integrante", "Conclusión (5 renglones)"], [
  ["Mario Iván Méndez Álvarez", blank],
  ["Sadher Isaac Torres Galindo", blank],
  ["Pedro José Pallares Muñoz", blank],
  ["David Gerardo Garnica Chaparro", blank],
  ["Juan Emmanuel Martínez Aguirre", blank],
  ["Uriel Armando Rivero Rivero", blank],
], [3000, 6360]));
a5(H1("Referencias"));
const refs = [
  "Allegro MicroSystems. (s. f.). A4988: DMOS microstepping driver with translator and overcurrent protection [Hoja de datos].",
  "Bosch Sensortec. (s. f.). BNO055: Intelligent 9-axis absolute orientation sensor [Hoja de datos].",
  "Espressif Systems. (s. f.). ESP32 series datasheet [Hoja de datos].",
  "Garrido-Jurado, S., Muñoz-Salinas, R., Madrid-Cuevas, F. J., & Marín-Jiménez, M. J. (2014). Automatic generation and detection of highly reliable fiducial markers under occlusion. Pattern Recognition, 47(6), 2280–2292.",
  "International Organization for Standardization. (2010). Safety of machinery — General principles for design — Risk assessment and risk reduction (ISO 12100:2010).",
  "International Organization for Standardization. (2023). Safety of machinery — Safety-related parts of control systems — Part 1 (ISO 13849-1).",
  "Modbus Organization. (2012). Modbus application protocol specification V1.1b3.",
  "NVIDIA Corporation. (2024). Jetson Orin Nano Super developer kit [Documentación técnica].",
  "Raspberry Pi Ltd. (s. f.). Raspberry Pi 4 Model B datasheet [Hoja de datos].",
  "Redmon, J., Divvala, S., Girshick, R., & Farhadi, A. (2016). You only look once: Unified, real-time object detection. Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, 779–788.",
  "Secretaría del Trabajo y Previsión Social. (1999). NOM-004-STPS-1999, Sistemas de protección y dispositivos de seguridad en la maquinaria y equipo que se utilice en los centros de trabajo. Diario Oficial de la Federación.",
  "Siemens AG. (s. f.). LOGO! manual [Manual de producto].",
  "STMicroelectronics. (s. f.). VL53L0X: Time-of-flight ranging sensor [Hoja de datos].",
];
refs.forEach((r) => a5(new Paragraph({ spacing: { after: 100, line: 280 }, indent: { left: 540, hanging: 540 }, alignment: AlignmentType.LEFT, children: runs(r) })));
a5(P("Nota: los años «s. f.» deben completarse con la fecha de consulta y el enlace de cada documento antes de la entrega final.", { italics: true, size: 18 }));

// ======= ANEXOS
const anx = [];
const a6 = (...x) => x.flat().forEach((e) => anx.push(e));
a6(H1("Anexos"));
a6(H2("Anexo A. Códigos comentados"));
a6(P("Fragmento comentado del programa de la celda (backend/cell_line.py): la secuencia que se ejecuta cuando hay cinco juicios iguales. Es el código real del repositorio, con comentarios que explican cada paso."));
a6(...code(`def _correr(self, juicio):
    accion = "pulso_no_enviado"
    try:
        if juicio == "FAIL":
            self._esperar(self.espera_piston)            # 3 s: la pieza llega al pistón
            if not self.salidas.poner(self.pin_piston, True):   # GPIO 8 en alto
                accion = "fallo_actuacion"               # no hay chip GPIO: no se finge
                return
            self._esperar(self.piston_encendido)         # 1 s con el pistón afuera
            self.salidas.poner(self.pin_piston, False)   # GPIO 8 en bajo
            self._esperar(self.piston_regreso)           # 2 s para que regrese
        self.salidas.poner(self.pin_banda, True)         # GPIO 9 -> entrada I4 del LOGO!
        self._esperar(self.pulso_banda)                  # pulso de 0.5 s
        self.salidas.poner(self.pin_banda, False)
        accion = "scrap_expulsado" if juicio == "FAIL" else "pieza_aceptada"
    finally:
        self.salidas.apagar()      # pase lo que pase, ambas salidas quedan apagadas
        self._anotar(juicio, accion)   # se registra la pieza y su acción`));
a6(H2("Anexo B. Planos y dibujos técnicos"));
a6(P(`Los planos disponibles son la vista lateral con cotas (Figura ${F.cotas}) y el modelo 3D con vistas armada, explosionada y transparente (Figuras ${F.cad1} a ${F.cad3}). Los planos de fabricación acotados (cortes del perfil 3030 y piezas impresas) se exportan de la hoja de armado: [[agregar planos exportados]].`));
a6(H2("Anexo C. Diagramas adicionales"));
a6(P(`Se incluyen en el cuerpo del documento los diagramas de flujo (Figuras ${F.general} a ${F.carrito}), de arquitectura (Figura ${F.arq}), eléctricos (Figuras ${F.elecpot} y ${F.eleccel}), de conexiones del ESP32 (Figuras ${F.espa} y ${F.espb}) y de tiempos (Figura ${F.tiempos}). Falta agregar el diagrama del programa del LOGO!: [[agregar diagrama]].`));
a6(H2("Anexo D. Fichas técnicas y manuales relevantes"));
a6(...T("Fichas técnicas relevantes", ["Componente", "Documento", "Estado"], [
  ["ESP32 DevKitC", "Hoja de datos de Espressif", "[[agregar copia]]"],
  ["A4988", "Hoja de datos de Allegro", "[[agregar copia]]"],
  ["VL53L0X", "Hoja de datos de STMicroelectronics", "[[agregar copia]]"],
  ["BNO055", "Hoja de datos de Bosch Sensortec", "[[agregar copia]]"],
  ["LOGO!", "Manual de Siemens", "[[agregar copia]]"],
  ["Jetson Orin Nano Super", "Documentación de NVIDIA", "[[agregar copia]]"],
  ["Raspberry Pi 4", "Hoja de datos de Raspberry Pi Ltd", "[[agregar copia]]"],
  ["Motor-rueda M0601", "Ficha del proveedor", "[[agregar copia]]"],
], [2600, 4400, 2360]));
a6(H2("Anexo E. Formatos de pruebas y listas de verificación"));
a6(P("Formato para registrar cada prueba de la sección 2.13. Se imprime una hoja por prueba."));
a6(...T("Formato de registro de pruebas", ["Campo", "Registro"], [
  ["Prueba (número y nombre)", blank], ["Fecha y hora", blank], ["Responsable", blank], ["Equipo y versión de código", blank],
  ["Condiciones (iluminación, piezas, voltaje)", blank], ["Resultado medido", blank], ["Criterio de aceptación", blank], ["Aprobada (sí / no)", blank], ["Observaciones y foto", blank],
], [3400, 5960]));
a6(...T("Lista de verificación antes de energizar el carrito", ["N.º", "Revisión", "Hecho"], [
  ["1", "Polaridad de la batería y de cada fusible revisada", blank], ["2", "Paro de emergencia suelto y relevador cerrado", blank], ["3", "Tensión del reductor de 5 V entre 5.0 y 5.1 V", blank],
  ["4", "Ruedas en el aire para la primera prueba de movimiento", blank], ["5", "Cables sin tensión y sin cruzar con los motores", blank], ["6", "Correa de la batería apretada", blank],
], [600, 6900, 1860], { center: [0] }));
a6(H2("Anexo F. Códigos de programación"));
a6(P("El código completo está en el repositorio privado del equipo. La tabla indica dónde está cada parte; el firmware del ESP32 todavía no existe."));
a6(...T("Mapa del código", ["Ruta", "Contenido"], [
  ["backend/cell_line.py", "Secuencia de la celda: juicio estable, pistón y banda por GPIO"],
  ["backend/celda_agent.py y backend/cell_hmi.py", "Agente de la celda para la Raspberry Pi 4 y datos de la HMI"],
  ["backend/aether_agent.py, agent_*.py y observation_*.py", "Agente del Jetson, contratos y envío de observaciones en lotes"],
  ["backend/main.py, backend/db/", "Servidor FastAPI y base de datos SQLite"],
  ["backend/voice/", "Servicio de voz (micrófono local y Vosk)"],
  ["dashboard/", "Panel web: portada, celda, inventario, Lumina y dataset"],
  ["tests/", "Pruebas automáticas (pytest)"],
  ["firmware/", "Reservada para el ESP32: PENDIENTE (vacía)"],
], [3800, 5560]));
a6(P("Los fragmentos explicados están en la sección 2.9 y en el Anexo A."));

// ---------- documento
const hdr = (t) => new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "B8C0CC", space: 2 } }, children: [new TextRun({ text: t, font: FONT, size: 16, color: "5A6270" })] })] });
const ftr = () => new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Aether · Informe integrador · Avance 2 · Página ", font: FONT, size: 16, color: "5A6270" }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "5A6270" })] })] });
const portrait = { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1300, left: 1440, right: 1440 } } };
const land = { page: { size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1000, bottom: 1000, left: 1080, right: 1080 } } };
const H = { default: hdr("Universidad Tecnológica de Chihuahua Sur · Mecatrónica 10IME1M") };
const FT = { default: ftr() };

// los marcadores "L<" y "L>" abren y cierran una sección apaisada (diagramas eléctricos grandes)
function secc(items) {
  const out = [];
  let cur = [], apaisada = false;
  const cierra = () => { if (cur.length) out.push({ properties: apaisada ? land : portrait, headers: H, footers: FT, children: cur }); cur = []; };
  for (const it of items) {
    if (it === "L<") { cierra(); apaisada = true; } else if (it === "L>") { cierra(); apaisada = false; } else cur.push(it);
  }
  cierra();
  return out;
}

const doc = new Document({
  creator: "Equipo Aether", title: "Aether — Informe integrador, Avance 2", description: "Avance 2 del informe integrador",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 32, bold: true, color: INK }, paragraph: { spacing: { before: 120, after: 240 }, outlineLevel: 0, keepNext: true } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 26, bold: true, color: "2F6DB5" }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2, keepNext: true } },
      { id: "Caption", name: "Caption", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 20, color: INK } },
    ],
  },
  numbering: { config: [{ reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [
    { properties: { ...portrait, titlePage: true }, children: cover },
    ...secc([...init, ...body]),
    { properties: land, headers: H, footers: FT, children: bomSec },
    { properties: portrait, headers: H, footers: FT, children: part2 },
    { properties: land, headers: H, footers: FT, children: gsec },
    { properties: portrait, headers: H, footers: FT, children: [...adm, ...res, ...fin, ...anx] },
  ],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(path.join(__dirname, "AETHER_Informe_Integrador_Avance2.docx"), b); console.log("ok", nFig, "figuras", nTab, "tablas", b.length); });
