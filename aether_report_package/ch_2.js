const B = require("./build.js");
const {
  C, h1, h2, h3, p, pRuns, bullet, tableCaption, statusCell, textCell, headerCell,
  Table, TableRow, TableCell, WidthType, Paragraph, PageBreak,
} = B;

const decisionRows = [
  ["1", "Percepción", "Híbrido: detección/conteo por YOLO + identificación por código de barras/QR. Clasificación visual pura de SKU, diferida."],
  ["2", "Localización", "Marcadores ArUco para verificación de posición — nunca un sistema de navegación."],
  ["3", "Navegación", "Waypoints con odometría por encoders + detección reactiva de obstáculos (no \"evasión inteligente\")."],
  ["4", "Hardware de cómputo", "Jetson Orin Nano Super 8GB (principal) / Raspberry Pi 5 + AI HAT+ (contingencia). Control de bajo nivel: ESP32 o STM32."],
  ["5", "Esquema de datos", "Observations (crudo) vs. Declared Inventory (declarado); estados PARTIAL / COMPLETE / INVALID."],
  ["6", "Comunicaciones", "MQTT para telemetría, REST para el dashboard. Parada de seguridad independiente de la conectividad de red."],
  ["7", "Alcance del dashboard", "Opción B: Inventario Declarado + Historial y Trazabilidad, solo lectura. Monitoreo en vivo, evolución obligatoria posterior al MVP."],
  ["8", "Línea de manufactura", "KUKA → UR5 → visión → Aether Inventory, handshake punto a punto (8a), programación nativa por fabricante (8b), visión binaria con el stack ya establecido (8c)."],
];

function decisionsTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [700, 2400, 6180],
    rows: [
      new TableRow({ tableHeader: true, children: [headerCell("№"), headerCell("DECISIÓN"), headerCell("RESOLUCIÓN")] }),
      ...decisionRows.map(([n, name, res]) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({ width: { size: 700, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: n, bold: true, font: "IBM Plex Mono", size: 19, color: C.violetDark })] })] }),
          new TableCell({ width: { size: 2400, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: name, bold: true, font: "IBM Plex Sans", size: 18, color: C.ink })] })] }),
          new TableCell({ width: { size: 6180, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: res, font: "IBM Plex Sans", size: 18, color: C.body })] })] }),
        ],
      })),
    ],
  });
}

const compRows = [
  ["Robot móvil Aether Inventory", "Recorre el entorno, detecta productos y transporta piezas terminadas a su ubicación de almacenamiento. Lleva montada la cámara de percepción.", "Pendiente"],
  ["Brazo KUKA KR6", "Primera estación de la línea. Coloca piezas automovilísticas sobre la banda transportadora mediante programación nativa en KRL.", "Pendiente"],
  ["Brazo UR5", "Segunda estación. Ensambla las piezas colocadas por el KUKA mediante trayectorias pre-programadas, sin aprendizaje por demostración.", "Pendiente"],
  ["Sistema de visión de línea", "Confirma de forma binaria si el ensamble se completó correctamente, con el mismo stack de percepción del robot móvil.", "Decidido"],
  ["Cómputo de borde — Jetson Orin Nano Super", "Ejecuta el pipeline de percepción del robot móvil. Contingencia definida: Raspberry Pi 5 con AI HAT+.", "Pendiente"],
  ["Control de bajo nivel — ESP32 / STM32", "Motores, PWM por hardware y watchdog de seguridad. No ejecuta percepción: no cuenta con GPU.", "Pendiente"],
  ["Percepción híbrida", "YOLO + código de barras/QR + ArUco, corriendo sobre cámara de laptop en modo demo.", "Funcionando"],
  ["Inventory Engine", "Agrupa observaciones crudas en inventario declarado, con historial trazable.", "Funcionando"],
  ["Backend (FastAPI) y base de datos", "Expone el inventario declarado, su historial y una operación de retiro protegida, respaldado por SQLite.", "Funcionando"],
  ["Dashboard", "Interfaz web del inventario declarado y su bitácora, servida como archivos estáticos por el backend.", "Funcionando"],
];

function componentTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2700, 4780, 1700],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [headerCell("COMPONENTE"), headerCell("FUNCIÓN"), headerCell("ESTADO")],
      }),
      ...compRows.map(([n, d, s]) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({ width: { size: 2700, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: n, bold: true, font: "IBM Plex Sans", size: 18, color: C.ink })] })] }),
          new TableCell({ width: { size: 4780, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: d, font: "IBM Plex Sans", size: 18, color: C.body })] })] }),
          statusCell(s),
        ],
      })),
    ],
  });
}

const diagRows = [
  ["Personal", "La dependencia de operadores humanos para trasladar piezas entre estaciones y para contar inventario introduce variabilidad: el criterio y la velocidad cambian de una persona a otra y a lo largo del turno."],
  ["Método", "Sin un protocolo de enlace entre estaciones, cada operación queda aislada y el operador humano se convierte en el mecanismo de coordinación por defecto, lo que genera tiempos muertos entre procesos."],
  ["Detección", "Con reflejo de luz sobre un marcador ArUco, el detector puede reportar un identificador incorrecto pero válido dentro del diccionario, sin señal de error visible — hallazgo verificado durante las pruebas del módulo de percepción."],
  ["Entorno", "La variabilidad de iluminación y la falta de puntos fijos de referencia en un entorno de manufactura no controlado incrementan el riesgo de error en la detección de objetos y en la verificación de posición."],
];

function diagTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2200, 7500],
    rows: [
      new TableRow({ tableHeader: true, children: [headerCell("CATEGORÍA"), headerCell("HALLAZGO / RIESGO")] }),
      ...diagRows.map(([cat, txt]) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({ width: { size: 2200, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: cat, bold: true, font: "IBM Plex Sans", size: 19, color: C.violetDark })] })] }),
          new TableCell({ width: { size: 7500, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: txt, font: "IBM Plex Sans", size: 19, color: C.body })] })] }),
        ],
      })),
    ],
  });
}

const altRows = [
  ["Aprendizaje por demostración (LfD) para programar los brazos", "Programación nativa de fabricante con trayectorias pre-programadas", "El alcance académico no requiere generalizar tareas nuevas; la programación nativa da un comportamiento predecible y verificable, indispensable en una línea real."],
  ["ArUco como sistema de navegación completo", "ArUco como capa de verificación de posición; navegación por waypoints y encoders", "Un sistema de navegación basado solo en marcadores es frágil ante oclusiones y errores de lectura."],
  ["SLAM para la navegación del robot móvil", "Diferido como característica futura", "Excede el tiempo disponible del proyecto (~240 horas en 4 meses) y no es indispensable para el ciclo completo en laboratorio."],
  ["Clasificación visual pura de producto, sin código", "Diferida; se usa el enfoque híbrido YOLO + código de barras/QR", "Requeriría un dataset de entrenamiento propio por tipo de pieza, esfuerzo no justificado frente al enfoque híbrido."],
  ["Orquestador central para las 4 estaciones", "Protocolo de enlace punto a punto (I/O digital + MQTT)", "Un orquestador central agrega un punto único de falla no justificado para una secuencia fija de 4 estaciones."],
];

function altTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2800, 2800, 3600],
    rows: [
      new TableRow({ tableHeader: true, children: [headerCell("ALTERNATIVA DESCARTADA"), headerCell("DECISIÓN TOMADA"), headerCell("RAZÓN")] }),
      ...altRows.map(([a, d, r]) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: a, font: "IBM Plex Sans", size: 18, color: C.body })] })] }),
          new TableCell({ width: { size: 2800, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: d, font: "IBM Plex Sans", size: 18, bold: true, color: C.green })] })] }),
          new TableCell({ width: { size: 3600, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: r, font: "IBM Plex Sans", size: 18, color: C.body })] })] }),
        ],
      })),
    ],
  });
}

const capitulo2 = [
  h1("CAPÍTULO 2. DISEÑO DEL PROYECTO", "2"),

  h2("2.1 Marco de decisiones de Fase 0"),
  p("Antes de escribir la primera línea de implementación, el equipo cerró una etapa de decisiones de arquitectura llamada Fase 0: qué enfoque de percepción usar, cómo localizar al robot, cómo comunicar los módulos entre sí, y así sucesivamente. Cada una de estas decisiones se documenta como un ADR (Architecture Decision Record) numerado, archivado en docs/architecture/decisions/ del repositorio — un documento corto por decisión, con su contexto, la opción elegida y la justificación de por qué se descartaron las demás."),
  p("Las ocho decisiones de Fase 0 están cerradas y se citan por número en el resto de este reporte (\"Decisión 3\", \"ADR 0008\"); la Tabla 1 las resume para que esas referencias tengan un punto de consulta único."),
  decisionsTable(),
  tableCaption("1", "Decisiones arquitectónicas de Fase 0 (ADR 0001 a ADR 0008)."),
  p("Dos principios de trabajo, también citados por número más adelante, aplican a todo el proyecto sin excepción (aether_context_docs.md, sección 4): el Principio 4.1, Honestidad de producto — \"el producto vende lo que el cliente realmente compra... nunca sobre-prometer capacidades no verificadas\" —, y el Principio 4.5, No fabricar dependencias, campos o estructuras especulativas — \"no agregar librerías, campos de esquema, endpoints, o cualquier otro elemento técnico 'por si acaso' antes de que exista una decisión explícita que lo requiera\". Ambos son la razón detrás de casi todos los avisos [PENDIENTE] y calloutPending de este documento: no se fabrica ninguna garantía ni ningún dato que el sistema todavía no pueda respaldar con hardware real."),

  h2("2.2 Componentes del sistema"),
  p("La Tabla 2 resume los componentes que integran Aether, su función dentro del sistema y su estado real de implementación al momento de este reporte."),
  componentTable(),
  tableCaption("2", "Componentes del sistema y estado de implementación."),

  h2("2.3 Diagnóstico"),
  p("El diagnóstico del problema se organiza en cuatro categorías: personal, método, detección y entorno, resumidas en la Tabla 3."),
  diagTable(),
  tableCaption("3", "Diagnóstico del problema por categoría."),
  p("Los hallazgos de la categoría de detección tienen una implicación directa para la instalación física de los marcadores reales: la mitigación considerada — exigir consistencia de lectura en varios fotogramas, o usar marcadores impresos mate en vez de pantallas — queda pendiente de aplicarse una vez que se defina la iluminación del entorno de manufactura real."),

  h2("2.4 Alternativas de solución"),
  p("Antes de fijar la arquitectura del proyecto se evaluaron y descartaron formalmente varias alternativas, documentadas como decisiones de la Fase 0 del proyecto y resumidas en la Tabla 4."),
  altTable(),
  tableCaption("4", "Alternativas de solución evaluadas y descartadas en Fase 0."),

  new Paragraph({ children: [new PageBreak()] }),
];

module.exports = { capitulo2 };
