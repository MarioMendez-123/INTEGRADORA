const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, PageBreak, TableOfContents, Header, Footer, PageNumber,
  VerticalAlign, LevelFormat, convertInchesToTwip, ExternalHyperlink,
} = require("docx");

// ---------- design tokens ----------
const C = {
  ink: "14171F",
  body: "1F2328",
  muted: "5A5F6E",
  violet: "5B4FE8",
  violetDark: "3F35B0",
  green: "1E8E52",
  greenFill: "EAF7F0",
  greenBorder: "34C77B",
  amber: "9C6512",
  amberFill: "FDF3E4",
  amberBorder: "E8A33D",
  steel: "5A5F6E",
  hairline: "D8DBE2",
  white: "FFFFFF",
};

const FONT_HEAD = "IBM Plex Sans";
const FONT_BODY = "IBM Plex Sans";
const FONT_MONO = "IBM Plex Mono";

// Rutas relativas a este archivo — el paquete vive en
// aether_report_package/ dentro del repo real, no en el sandbox donde se
// escribió originalmente (ver README_CLAUDE_CODE.md).
const path = require("path");
const A = (p) => path.join(__dirname, "assets", p);

// ---------- small helpers ----------
function h1(text, num) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 240 },
    border: { bottom: { color: C.violet, space: 8, style: BorderStyle.SINGLE, size: 12 } },
    children: [
      ...(num ? [new TextRun({ text: num + "  ", font: FONT_MONO, color: C.violet, bold: true, size: 26 })] : []),
      new TextRun({ text, font: FONT_HEAD, color: C.ink, bold: true, size: 32 }),
    ],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, font: FONT_HEAD, color: C.violetDark, bold: true, size: 26 })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 260, after: 120 },
    children: [new TextRun({ text, font: FONT_HEAD, color: C.ink, bold: true, size: 22 })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 200, line: 300 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT_BODY, color: C.body, size: 22, italics: !!opts.italics })],
  });
}

// paragraph with mixed runs: array of {text, bold, italics, mono, color}
function pRuns(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: 200, line: 300 },
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    children: runs.map(r => new TextRun({
      text: r.text,
      font: r.mono ? FONT_MONO : FONT_BODY,
      color: r.color || C.body,
      bold: !!r.bold,
      italics: !!r.italics,
      size: r.size || 22,
    })),
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { after: 120, line: 290 },
    alignment: AlignmentType.JUSTIFIED,
    bullet: { level: 0 },
    children: [new TextRun({ text, font: FONT_BODY, color: C.body, size: 22 })],
  });
}

function pendingTag() {
  return new TextRun({ text: "  [PENDIENTE]", font: FONT_MONO, color: C.amber, bold: true, size: 18 });
}

function calloutPending(text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: C.amberBorder },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: C.amberBorder },
      left: { style: BorderStyle.SINGLE, size: 4, color: C.amberBorder },
      right: { style: BorderStyle.SINGLE, size: 4, color: C.amberBorder },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: C.amberFill },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 0, line: 280 },
                children: [
                  new TextRun({ text: "PENDIENTE — ", font: FONT_MONO, color: C.amber, bold: true, size: 20 }),
                  new TextRun({ text, font: FONT_BODY, color: "5C4108", size: 21 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function figure(imgPath, widthPx, heightPx, captionNum, captionText) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new ImageRun({
          data: fs.readFileSync(imgPath),
          transformation: { width: widthPx, height: heightPx },
          type: "png",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({ text: `Figura ${captionNum}. `, font: FONT_MONO, color: C.violetDark, bold: true, size: 19 }),
        new TextRun({ text: captionText, font: FONT_MONO, color: C.muted, size: 19 }),
      ],
    }),
  ];
}

function tableCaption(num, text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 280 },
    children: [
      new TextRun({ text: `Tabla ${num}. `, font: FONT_MONO, color: C.violetDark, bold: true, size: 19 }),
      new TextRun({ text, font: FONT_MONO, color: C.muted, size: 19 }),
    ],
  });
}

// Bloque de código real (ver README_CLAUDE_CODE.md, sección "Fragmentos de
// código real"): fondo oscuro + mono claro, misma lógica visual que el
// dashboard real de Aether (fondo oscuro = contenido técnico verificado).
// No uses fondo blanco con texto negro para código — rompería ese sistema.
function codeBlock(code) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "2A2E37" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "2A2E37" },
      left: { style: BorderStyle.SINGLE, size: 2, color: "2A2E37" },
      right: { style: BorderStyle.SINGLE, size: 2, color: "2A2E37" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: "14171F" },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: code.split("\n").map(
              (line) =>
                new Paragraph({
                  spacing: { after: 0, line: 260 },
                  children: [
                    new TextRun({
                      text: line || " ",
                      font: FONT_MONO,
                      color: "E7E9EE",
                      size: 18,
                    }),
                  ],
                }),
            ),
          }),
        ],
      }),
    ],
  });
}

// Leyenda numerada para codeBlock(), mismo patrón que figure()/tableCaption()
// — "Código N. archivo.py (líneas X-Y) — descripción."
function codeCaption(num, text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 280 },
    children: [
      new TextRun({ text: `Código ${num}. `, font: FONT_MONO, color: C.violetDark, bold: true, size: 19 }),
      new TextRun({ text, font: FONT_MONO, color: C.muted, size: 19 }),
    ],
  });
}

// simple status cell shading
function statusCell(label) {
  const map = {
    "Funcionando": { fill: C.greenFill, color: C.green },
    "Pendiente": { fill: C.amberFill, color: C.amber },
    "Decidido": { fill: "F1EFFF", color: C.violetDark },
  };
  const s = map[label] || { fill: "F2F2F2", color: C.body };
  return new TableCell({
    width: { size: 1700, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: s.fill },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [new Paragraph({
      children: [new TextRun({ text: label, font: FONT_MONO, color: s.color, bold: true, size: 16 })],
    })],
  });
}

function textCell(text, opts = {}) {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: opts.mono ? FONT_MONO : FONT_BODY, bold: !!opts.bold, color: opts.color || C.body, size: opts.size || 20 })],
    })],
  });
}

function headerCell(text) {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: C.ink },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 110, bottom: 110, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: FONT_MONO, color: "FFFFFF", bold: true, size: 18 })],
    })],
  });
}

module.exports = {
  C, FONT_HEAD, FONT_BODY, FONT_MONO, A,
  h1, h2, h3, p, pRuns, bullet, pendingTag, calloutPending, figure, tableCaption,
  codeBlock, codeCaption,
  statusCell, textCell, headerCell,
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, PageBreak, TableOfContents, Header, Footer, PageNumber,
  VerticalAlign, LevelFormat, convertInchesToTwip, ExternalHyperlink,
};
