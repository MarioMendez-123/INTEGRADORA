const fs = require("fs");
const B = require("./build.js");
const {
  C, A, h1, h2, h3, p, pRuns, bullet, pendingTag, calloutPending, figure, tableCaption,
  statusCell, textCell, headerCell,
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, PageBreak, TableOfContents, Header, Footer, PageNumber,
  VerticalAlign, FONT_MONO, FONT_BODY, FONT_HEAD,
} = B;

const PAGE_W = 12240, PAGE_H = 15840; // US Letter DXA

// ============ COVER SECTION (full-bleed image, no margins) ============
const coverSection = {
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  },
  children: [
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new ImageRun({
          data: fs.readFileSync(A("cover_full.png")),
          transformation: { width: 816, height: 1056 },
          type: "png",
        }),
      ],
    }),
  ],
};

// ============ shared header/footer for body pages ============
const bodyHeader = new Header({
  children: [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { color: C.hairline, space: 4, style: BorderStyle.SINGLE, size: 4 } },
      children: [
        new TextRun({ text: "AETHER", font: FONT_MONO, color: C.violetDark, bold: true, size: 16 }),
        new TextRun({ text: "  ·  INFORME DE PROYECTO INTEGRADOR", font: FONT_MONO, color: C.muted, size: 16 }),
      ],
    }),
  ],
});

const bodyFooter = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { color: C.hairline, space: 4, style: BorderStyle.SINGLE, size: 4 } },
      children: [
        new TextRun({ text: "Página ", font: FONT_MONO, color: C.muted, size: 16 }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT_MONO, color: C.muted, size: 16 }),
        new TextRun({ text: " de ", font: FONT_MONO, color: C.muted, size: 16 }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_MONO, color: C.muted, size: 16 }),
      ],
    }),
  ],
});

function tocLine(text, pageNum, opts = {}) {
  const { PositionalTab, PositionalTabAlignment, PositionalTabLeader, TabStopType } = require("docx");
  return new Paragraph({
    spacing: { after: opts.sub ? 100 : 160 },
    indent: opts.sub ? { left: 400 } : undefined,
    children: [
      new TextRun({ text, font: FONT_BODY, size: opts.sub ? 20 : 22, bold: !opts.sub, color: opts.sub ? C.body : C.ink }),
      new TextRun({
        children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, leader: PositionalTabLeader.DOT, relativeTo: "margin" })],
      }),
      new TextRun({ text: String(pageNum), font: FONT_MONO, size: opts.sub ? 20 : 22, bold: !opts.sub, color: C.violetDark }),
    ],
  });
}

const bodyPageProps = {
  page: {
    size: { width: PAGE_W, height: PAGE_H },
    margin: { top: 1440, bottom: 1440, left: 1620, right: 1440 },
  },
};

// ============ FRONT MATTER SECTION ============
const frontMatter = {
  properties: { ...bodyPageProps, titlePage: false },
  headers: { default: bodyHeader },
  footers: { default: bodyFooter },
  children: [
    // Profesor encargado
    new Paragraph({
      spacing: { before: 200, after: 400 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Profesor encargado del proyecto: ", font: FONT_BODY, bold: true, size: 22, color: C.ink }),
        new TextRun({ text: "Jesús Fernando Rivera Soto", font: FONT_BODY, size: 22, color: C.ink }),
      ],
    }),
    pRuns([{ text: "Nombre asumido a partir del formato de estadías previo del mismo equipo (SPECTRABOT); confirmar antes de entrega.", italics: true, color: C.amber, size: 18 }], { alignment: AlignmentType.CENTER }),

    new Paragraph({ children: [new PageBreak()] }),

    // ABSTRACT
    h1("ABSTRACT"),
    pRuns([{ text: "Problem Statement", bold: true, italics: true }]),
    p("Aether is an academic integrator project that builds a complete automotive manufacturing line combining two industrial robotic arms, a binary vision verification system and an autonomous mobile inventory unit. A KUKA KR6 places automotive parts on a conveyor, a UR5 assembles them through pre-programmed trajectories, a vision system confirms the assembly outcome and a mobile robot, Aether Inventory, collects and transports finished parts while keeping a traceable record of inventory."),
    p("The system combines hybrid perception (YOLO detection with barcode and QR identification), ArUco-based position verification, edge computing on an NVIDIA Jetson Orin Nano Super and a peer-to-peer handshake protocol between stations instead of a central orchestrator. At the time of this report the perception pipeline, inventory engine, backend and dashboard run on real hardware, while robotic manipulation, autonomous navigation and the physical manufacturing line remain pending the arrival of the robotic arms and the mobile robot chassis."),
    p("The project follows a strict honesty principle throughout its data schema and its documentation: no capability or measurement is reported unless it has been verified against real hardware."),

    new Paragraph({ children: [new PageBreak()] }),

    // INDICE GENERAL - static, page numbers verified against the rendered layout
    h1("ÍNDICE GENERAL"),
    tocLine("ABSTRACT", 3),
    tocLine("ÍNDICE GENERAL", 4),
    tocLine("ÍNDICE DE FIGURAS, TABLAS Y FRAGMENTOS DE CÓDIGO", 6),
    tocLine("INTRODUCCIÓN", 8),
    tocLine("CAPÍTULO 1. LA IDEA DEL PROYECTO", 9),
    tocLine("1.1 Contexto", 9, { sub: true }),
    tocLine("1.2 Antecedentes del problema", 9, { sub: true }),
    tocLine("1.3 Objetivo del proyecto", 9, { sub: true }),
    tocLine("CAPÍTULO 2. DISEÑO DEL PROYECTO", 12),
    tocLine("2.1 Marco de decisiones de Fase 0", 12, { sub: true }),
    tocLine("2.2 Componentes del sistema", 13, { sub: true }),
    tocLine("2.3 Diagnóstico", 14, { sub: true }),
    tocLine("2.4 Alternativas de solución", 14, { sub: true }),
    tocLine("CAPÍTULO 3. EJECUCIÓN DEL TRABAJO", 16),
    tocLine("3.1 Enfoque de ejecución", 16, { sub: true }),
    tocLine("3.2 Diseño mecánico y CAD", 16, { sub: true }),
    tocLine("3.3 Diagramas eléctricos", 16, { sub: true }),
    tocLine("3.4 Diagramas neumáticos", 16, { sub: true }),
    tocLine("3.5 Planos técnicos y diseño 3D", 17, { sub: true }),
    tocLine("3.6 Ensamblaje y construcción del robot móvil Aether Inventory", 17, { sub: true }),
    tocLine("3.7 Montaje de la celda de manufactura completa", 17, { sub: true }),
    tocLine("3.8 Cómputo de borde — Jetson Orin Nano Super", 17, { sub: true }),
    tocLine("3.9 Arquitectura general de software", 18, { sub: true }),
    tocLine("3.10 Estructura de carpetas", 19, { sub: true }),
    tocLine("3.11 Percepción", 25, { sub: true }),
    tocLine("3.12 Localización", 26, { sub: true }),
    tocLine("3.13 Navegación", 27, { sub: true }),
    tocLine("3.14 Inventory Engine", 27, { sub: true }),
    tocLine("3.15 Backend y comunicaciones", 28, { sub: true }),
    tocLine("3.16 Dashboard", 30, { sub: true }),
    tocLine("3.17 Línea de manufactura (protocolo y software)", 32, { sub: true }),
    tocLine("3.18 Alcance futuro del proyecto", 34, { sub: true }),
    tocLine("CAPÍTULO 4. ENTORNO VIRTUAL / FÍSICO Y MANTENIMIENTO", 36),
    tocLine("4.1 Entorno de desarrollo actual", 36, { sub: true }),
    tocLine("4.2 Entorno físico planeado", 36, { sub: true }),
    tocLine("4.3 Mantenimiento", 36, { sub: true }),
    tocLine("4.4 Manual de seguridad", 37, { sub: true }),
    tocLine("CONCLUSIONES Y RECOMENDACIONES", 38),
    tocLine("REFERENCIAS", 39),

    new Paragraph({ children: [new PageBreak()] }),

    // INDICE DE FIGURAS, TABLAS Y CODIGO (manual, we control the list)
    h1("ÍNDICE DE FIGURAS, TABLAS Y FRAGMENTOS DE CÓDIGO"),
    pRuns([{ text: "Figura 1. ", bold: true, mono: true, color: C.violetDark }, { text: "Arquitectura general del sistema Aether, de sensores a dashboard.", mono: true, color: C.muted }]),
    pRuns([{ text: "Figura 2. ", bold: true, mono: true, color: C.violetDark }, { text: "Portada real del dashboard (index.html), corrida local del 1 de septiembre de 2026.", mono: true, color: C.muted }]),
    pRuns([{ text: "Figura 3. ", bold: true, mono: true, color: C.violetDark }, { text: "Franja de módulos de la portada, con conteo de Declared Inventory en vivo.", mono: true, color: C.muted }]),
    pRuns([{ text: "Figura 4. ", bold: true, mono: true, color: C.violetDark }, { text: "Tabla de Declared Inventory (inventory.html) con datos reales.", mono: true, color: C.muted }]),
    pRuns([{ text: "Figura 5. ", bold: true, mono: true, color: C.violetDark }, { text: "Panel de bitácora de inspecciones, una corrida expandida.", mono: true, color: C.muted }]),
    pRuns([{ text: "Figura 6. ", bold: true, mono: true, color: C.violetDark }, { text: "Línea de manufactura — enlace punto a punto entre estaciones (diagrama).", mono: true, color: C.muted }]),
    pRuns([{ text: "Figura 7. ", bold: true, mono: true, color: C.violetDark }, { text: "Sección Línea de manufactura de la portada — estaciones pendientes y Visión con estado real.", mono: true, color: C.muted }]),
    pRuns([{ text: "Tabla 1. ", bold: true, mono: true, color: C.violetDark }, { text: "Decisiones arquitectónicas de Fase 0 (ADR 0001 a ADR 0008).", mono: true, color: C.muted }]),
    pRuns([{ text: "Tabla 2. ", bold: true, mono: true, color: C.violetDark }, { text: "Componentes del sistema y estado de implementación.", mono: true, color: C.muted }]),
    pRuns([{ text: "Tabla 3. ", bold: true, mono: true, color: C.violetDark }, { text: "Diagnóstico del problema por categoría.", mono: true, color: C.muted }]),
    pRuns([{ text: "Tabla 4. ", bold: true, mono: true, color: C.violetDark }, { text: "Alternativas de solución evaluadas y descartadas en Fase 0.", mono: true, color: C.muted }]),
    pRuns([{ text: "Tabla 5. ", bold: true, mono: true, color: C.violetDark }, { text: "Endpoints reales del backend (FastAPI).", mono: true, color: C.muted }]),
    pRuns([{ text: "Código 1. ", bold: true, mono: true, color: C.violetDark }, { text: "Árbol real del repositorio, generado al momento de este reporte.", mono: true, color: C.muted }]),
    pRuns([{ text: "Código 2. ", bold: true, mono: true, color: C.violetDark }, { text: "test_combined.py — bucle real de detección combinada (YOLO + código + ArUco).", mono: true, color: C.muted }]),
    pRuns([{ text: "Código 3. ", bold: true, mono: true, color: C.violetDark }, { text: "aggregate_observations.py — función aggregate() completa.", mono: true, color: C.muted }]),
    pRuns([{ text: "Código 4. ", bold: true, mono: true, color: C.violetDark }, { text: "backend/main.py — endpoint retire_inventory_entry().", mono: true, color: C.muted }]),
    pRuns([{ text: "Código 5. ", bold: true, mono: true, color: C.violetDark }, { text: "dashboard/app.js — función renderDelta().", mono: true, color: C.muted }]),
    pRuns([{ text: "Código 6. ", bold: true, mono: true, color: C.violetDark }, { text: "backend/main.py — confirmación binaria de la estación de Visión.", mono: true, color: C.muted }]),

    new Paragraph({ children: [new PageBreak()] }),
  ],
};

module.exports = { coverSection, frontMatter, bodyHeader, bodyFooter, bodyPageProps, PAGE_W, PAGE_H };
