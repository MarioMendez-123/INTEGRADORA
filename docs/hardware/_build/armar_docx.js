const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer,
  AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle,
  PageNumber, ShadingType, VerticalAlign, LevelFormat, PageBreak,
} = require("docx");

const FIG = path.join(__dirname, "figuras");
const OUT = path.join(__dirname, "..", "Conexion-de-la-celda.docx");
const NAVY = "1E3A5F";
const INK = "1C1917";
const MUTED = "57534E";
const PAGE_W = 10800;

const thin = { style: BorderStyle.SINGLE, size: 8, color: "D6CEC4" };
const borders = { top: thin, bottom: thin, left: thin, right: thin };
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: none, bottom: none, left: none, right: none };

function run(text, o = {}) {
  return new TextRun({
    text,
    font: o.font || "Calibri",
    size: o.size || 24,
    bold: !!o.bold,
    color: o.color || INK,
    italics: !!o.italics,
  });
}

function p(text, o = {}) {
  return new Paragraph({
    spacing: { before: o.before ?? 0, after: o.after ?? 120, line: 276 },
    children: [run(text, o)],
  });
}

function h(text) {
  return new Paragraph({
    spacing: { before: 0, after: 140 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: NAVY, space: 6 } },
    children: [run(text, { bold: true, size: 36, color: NAVY })],
  });
}

function fig(file, pxW, pxH, alt) {
  const hPx = Math.round(700 * (pxH / pxW));
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data: fs.readFileSync(path.join(FIG, file)),
        transformation: { width: 700, height: hPx },
        altText: { title: alt, description: alt, name: file },
      }),
    ],
  });
}

function cell(text, width, o = {}) {
  const lines = Array.isArray(text) ? text : [text];
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: o.borders || borders,
    shading: { type: ShadingType.CLEAR, fill: o.fill || "FFFFFF" },
    margins: { top: 70, bottom: 70, left: 90, right: 90 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: o.span,
    children: lines.map(
      (line, i) =>
        new Paragraph({
          spacing: { before: 0, after: i === lines.length - 1 ? 0 : 40 },
          children: [run(line, { bold: o.bold, size: o.size || 20, color: o.color || INK })],
        }),
    ),
  });
}

function row(cells) {
  return new TableRow({ cantSplit: true, children: cells });
}

function table(rows, widths) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: widths,
    rows,
  });
}

function callout(title, body, fill) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [PAGE_W],
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: PAGE_W, type: WidthType.DXA },
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, fill },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({ spacing: { after: 60 }, children: [run(title, { bold: true, size: 22 })] }),
              new Paragraph({ children: [run(body, { size: 22 })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

const steps = [
  "Anota marca y modelo del PLC, de cada infrarrojo (si dice PNP o NPN) y de la cámara.",
  "Cablea IR1 e IR2 solo al PLC. Pasa la mano: tiene que prender el LED del sensor y el LED de la entrada. Todavía sin Raspberry.",
  "Programa en el PLC las entradas, el pulso del pistón y la confirmación de IR2. Prueba el pistón con un botón del propio PLC, en vacío.",
  "Pon las tres máquinas en el switch. Desde la laptop, haz ping al Raspberry y al PLC.",
  "Enchufa la cámara al USB del Raspberry. Abre en el navegador de la laptop la dirección del video del Raspberry. Tiene que verse la imagen antes de tocar la pantalla de la celda.",
  "Abre el estado que publica el Raspberry. El enlace al PLC tiene que decir que está vivo.",
  "Arranca la pantalla de siempre (celda.html) con la dirección del Raspberry configurada. Iniciar cámara muestra el video del Pi. Enlace PLC pasa a OK.",
  "Una pieza de prueba sin pedir expulsión: IR1 cuenta, IR2 la ve, la pantalla dice pieza aceptada.",
  "Una pieza con el botón de prueba del PLC, no con la cámara: la pantalla dice scrap expulsado. Si la pieza no sale, dice fallo de actuación.",
  "Desconecta el cable de red del PLC. En un par de segundos la pantalla dice SIN CONEXIÓN y el pistón no se queda accionado.",
];

const doc = new Document({
  styles: { default: { document: { styles: [] } } },
  numbering: {
    config: [
      {
        reference: "pasos",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 440, hanging: 360 } },
              run: { font: "Calibri", size: 24 },
            },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              spacing: { after: 80 },
              children: [
                run("Aether  ·  Celda de manufactura", { size: 18, color: MUTED }),
                run("          Cómo conectar el equipo", { size: 18, color: "A8A29E" }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                run("Hoja para quien conecta la celda    ", { size: 16, color: "A8A29E" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "A8A29E" }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          spacing: { before: 0, after: 80 },
          children: [run("Hoja de conexión", { bold: true, size: 48, color: NAVY })],
        }),
        p("Raspberry, cámara, dos infrarrojos, PLC y la pantalla que ya existe.", { size: 26, color: MUTED, after: 200 }),

        h("En una frase"),
        p("La cámara se enchufa al Raspberry. Ese Raspberry es el ojo de la celda."),
        p("Los dos infrarrojos y el pistón se cablean al PLC. El PLC mueve la banda y el pistón."),
        p("La laptop no recibe sensores. Sigue mostrando la misma pantalla de la celda."),
        p("Hoy la cámara solo dice si hay una pieza o no. Eso no es una pieza mala. El pistón no se dispara desde la cámara hasta que exista el criterio de inspección.", { after: 220 }),

        h("Dónde va cada cosa, sobre la banda"),
        p("De izquierda a derecha: entra la pieza, la ve el primer infrarrojo, la mira la cámara, el pistón puede empujarla al cajón, y el segundo infrarrojo dice si siguió en la banda.", { after: 80 }),
        fig("01-vista.png", 1800, 1240, "Vista de la banda con IR1, cámara, Raspberry, pistón, cajón de scrap e IR2, y la bornera del PLC"),

        pb(),
        h("Cómo van los cables"),
        p("El Raspberry tiene un solo puerto de red. La laptop, el Raspberry y el PLC entran los tres al switch. No se enchufan una máquina a la otra.", { after: 80 }),
        fig("02-cables.png", 1800, 1320, "Diagrama de cables: cámara por USB al Raspberry, los tres equipos al switch, infrarrojos y pistón al PLC"),

        pb(),
        h("Cómo se conecta un infrarrojo"),
        p("Son sensores de 24 V, de tres hilos. El color se confirma en la etiqueta del que se compró. Primero se prueba el LED, con el Raspberry apagado.", { after: 80 }),
        fig("03-bornes.png", 1800, 1080, "Tres hilos del infrarrojo a la bornera del PLC, y la prohibición de llevar 24 V al Raspberry"),
        new Paragraph({ spacing: { before: 160 } }),
        callout(
          "Si la etiqueta dice PNP y la entrada del PLC no prende, no se arregla en el programa. Se revisa que el sensor y la entrada sean del mismo tipo.",
          "Un módulo infrarrojo de 5 V, de los de prototipo, no se atornilla a una entrada de 24 V.",
          "FEF3C7",
        ),

        pb(),
        h("Qué pasa cuando llega una pieza"),
        p("El PLC lleva el reloj. El Raspberry lleva el ojo. El pistón solo se mueve si el Raspberry escribió RECHAZAR, y hoy eso se queda en cero.", { after: 80 }),
        fig("04-secuencia.png", 1800, 980, "Cinco pasos de una pieza y los cuatro resultados según IR2"),

        pb(),
        h("La pantalla no se vuelve a hacer"),
        p("Quien opera la celda abre la misma página de siempre. El video y los números salen de las dos direcciones que esa página ya pide.", { after: 80 }),
        fig("05-pantalla.png", 1800, 1100, "La pantalla de la celda: video, juicio PASS, contadores y enlace PLC"),
        p("La palabra SIM que se ve hoy en esa página está escrita fija. No se apaga sola. Se quita cuando los números ya vengan del PLC.", { italics: true, color: MUTED }),

        pb(),
        h("Las tres direcciones de red"),
        p("Son las del banco de prueba. Si en el laboratorio ya hay otras, se anotan en la última hoja y se usan esas.", { after: 80 }),
        fig("06-red.png", 1800, 860, "Laptop, Raspberry y PLC conectados a un switch, con sus direcciones IP"),

        pb(),
        h("Orden para empezar"),
        p("Se sigue este orden. No se salta al programa si el LED del infrarrojo todavía no prende.", { after: 80 }),
        ...steps.map(
          (s) =>
            new Paragraph({
              numbering: { reference: "pasos", level: 0 },
              spacing: { before: 60, after: 60, line: 276 },
              children: [run(s, { size: 22 })],
            }),
        ),
        new Paragraph({ spacing: { before: 200 } }),
        callout(
          "No se hace",
          "No llevar los infrarrojos a los pines del Raspberry. No meter 24 V al Raspberry. No tratar “hay una pieza en la imagen” como pieza mala. No cambiar la dirección que pide la pantalla.",
          "FEE2E2",
        ),

        pb(),
        h("Para llenar a mano, antes de darlo por conectado"),
        p("Las direcciones I0.0 y Q0.0 de los dibujos son un ejemplo. Las de verdad son las del PLC que está en el tablero. Hasta llenar esta tabla, el enlace no está terminado.", { after: 140 }),
        table(
          [
            row([
              cell("Dato", 4200, { bold: true, fill: "E8EFF8", color: NAVY }),
              cell("Valor", 6600, { bold: true, fill: "E8EFF8", color: NAVY }),
            ]),
            ...[
              "Marca y modelo del PLC",
              "IR1: marca, PNP o NPN, borne",
              "IR2: marca, PNP o NPN, borne",
              "Salida del pistón y si lleva relé",
              "La banda ya corre sola, o la arranca el PLC",
              "IP de la laptop",
              "IP del Raspberry",
              "IP del PLC",
              "Duración del pulso del pistón, medida en la banda",
            ].map((label) =>
              row([
                cell(label, 4200, { size: 21 }),
                cell(" ", 6600, { fill: "F7F4EF", size: 21 }),
              ]),
            ),
          ],
          [4200, 6600],
        ),

        pb(),
        h("Anexo  ·  para quien escribe el programa"),
        p("Si el trabajo es cablear, aquí se puede parar. Lo que sigue es el acuerdo entre el Raspberry y la pantalla."),
        p("El Raspberry publica dos cosas, y la laptop las reenvía por las direcciones que la página ya conoce:"),
        p("Video del Raspberry:   http://192.168.0.20:8080/vision/stream", { bold: true, color: NAVY }),
        p("Estado del Raspberry:   http://192.168.0.20:8080/cell/snapshot", { bold: true, color: NAVY }),
        p("La pantalla sigue pidiendo /line/vision/stream y /line/cell/status a la laptop. Esas dos no se cambian.", { after: 160 }),
        p("El bit RECHAZAR se queda en 0. Se cambia a 1 únicamente cuando el criterio de inspección diga que esa pieza es FAIL. Ver una pieza en la foto no cuenta.", { after: 160 }),
        p("Cuando el PLC suma una pieza nueva, pone el resultado en 0. Después, cuando IR2 ya resolvió, escribe 1 (aceptada), 2 (scrap) o 3 (el pistón no la sacó). Si no pone ese 0, la pieza nueva hereda el resultado de la anterior.", { after: 160 }),
        p("En la laptop, en la misma ventana donde se arranca la pantalla:", { after: 80 }),
        new Table({
          width: { size: PAGE_W, type: WidthType.DXA },
          columnWidths: [PAGE_W],
          rows: [
            row([
              new TableCell({
                width: { size: PAGE_W, type: WidthType.DXA },
                borders,
                shading: { type: ShadingType.CLEAR, fill: "F5F5F4" },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  "$env:CELL_AGENT_URL = \"http://192.168.0.20:8080\"",
                  ".\\.venv\\Scripts\\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000",
                ].map(
                  (line) =>
                    new Paragraph({
                      spacing: { after: 40 },
                      children: [run(line, { font: "Consolas", size: 18, color: INK })],
                    }),
                ),
              }),
            ]),
          ],
        }),
        new Paragraph({ spacing: { before: 160 } }),
        p("Sin esa variable, la pantalla sigue con los números de demostración, como hasta ahora. El inventario y el robot no dependen del Raspberry.", { color: MUTED }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(OUT, buf.length);
});
