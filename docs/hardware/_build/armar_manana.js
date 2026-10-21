const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Footer,
  AlignmentType, PageNumber, BorderStyle, PageBreak,
} = require("docx");

const FIG = path.join(__dirname, "figuras");
const OUT = path.join(__dirname, "..", "Manana-montaje.docx");
const INK = "1C1917";
const NAVY = "1E3A5F";

function run(text, o = {}) {
  return new TextRun({
    text,
    font: o.font || "Calibri",
    size: o.size || 24,
    bold: !!o.bold,
    color: o.color || INK,
  });
}
function p(text, o = {}) {
  return new Paragraph({
    spacing: { before: o.before ?? 0, after: o.after ?? 80 },
    children: [run(text, o)],
  });
}
function fig(file, pxH) {
  const h = Math.round(700 * (pxH / 1800));
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data: fs.readFileSync(path.join(FIG, file)),
        transformation: { width: 700, height: h },
        altText: { title: file, description: file, name: file },
      }),
    ],
  });
}
function code(line) {
  return new Paragraph({
    spacing: { after: 40 },
    border: { bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
    children: [run(line, { font: "Consolas", size: 20, color: NAVY })],
  });
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 640, bottom: 640, left: 680, right: 680 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                run("Montaje de mañana    ", { size: 16, color: "A8A29E" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "A8A29E" }),
              ],
            }),
          ],
        }),
      },
      children: [
        p("Montaje de mañana", { bold: true, size: 40, color: NAVY, after: 40 }),
        p("Raspberry, sensores y sistema de visión. Solo lo que el programa abre de verdad.", { size: 22, color: "57534E", after: 80 }),
        fig("07-manana-camaras.png", 1180),
        p("En la Raspberry, antes de culpar al cable, confirma el número:", { size: 22 }),
        code("ls /dev/video*"),
        p("Si sale video0, el programa ya apunta ahí. Si sale video1, ese día la variable vale 1.", { size: 22 }),
        code("cd backend"),
        code(".venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000"),
        p("Desde la laptop: http://IP-DE-ESA-RASPBERRY:8000/line/vision/stream", { size: 22, after: 40 }),

        new Paragraph({ children: [new PageBreak()] }),
        p("Sensores", { bold: true, size: 36, color: NAVY, before: 0, after: 40 }),
        fig("08-manana-sensores.png", 980),
        p("IR1 se coloca antes de la cámara. IR2, después del pistón. Ninguno se atornilla al cabezal de la Raspberry: el código no tiene ese pin. Los números I0.0 de la hoja anterior eran un ejemplo, no están programados.", { size: 22 }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(OUT, buf.length);
});
