const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer,
  AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType,
  BorderStyle, PageNumber, ShadingType, VerticalAlign, LevelFormat, PageBreak,
} = require("docx");

const ROOT = path.join(__dirname, "..");
const FIG = path.join(ROOT, "figuras");
const FIG_CELDA = path.join(__dirname, "figuras");
const OUT = path.join(ROOT, "Aether-documento-maestro.docx");
const NAVY = "1E3A5F";
const INK = "1C1917";
const MUTED = "57534E";
const PAGE_W = 10800;
const thin = { style: BorderStyle.SINGLE, size: 8, color: "D6CEC4" };
const borders = { top: thin, bottom: thin, left: thin, right: thin };

function run(text, o = {}) {
  return new TextRun({
    text,
    font: o.font || "Calibri",
    size: o.size || 22,
    bold: !!o.bold,
    color: o.color || INK,
    italics: !!o.italics,
  });
}

function p(text, o = {}) {
  return new Paragraph({
    spacing: { before: o.before ?? 0, after: o.after ?? 140, line: 276 },
    children: [run(text, o)],
  });
}

function h(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 4 } },
    children: [run(text, { bold: true, size: 32, color: NAVY })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [run(text, { bold: true, size: 26, color: NAVY })],
  });
}

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function fig(file, alt, dir = FIG) {
  const data = fs.readFileSync(path.join(dir, file));
  const { w, h: ih } = pngSize(data);
  const width = 680;
  const height = Math.round(width * ih / w);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 160 },
    children: [
      new ImageRun({
        type: "png",
        data,
        transformation: { width, height },
        altText: { title: alt, description: alt, name: file },
      }),
    ],
  });
}

function cell(text, width, o = {}) {
  const lines = Array.isArray(text) ? text : [text];
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { type: ShadingType.CLEAR, fill: o.fill || "FFFFFF" },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: lines.map(
      (line, i) =>
        new Paragraph({
          spacing: { before: 0, after: i === lines.length - 1 ? 0 : 30 },
          children: [run(line, { bold: o.bold, size: o.size || 18, color: o.color || INK })],
        }),
    ),
  });
}

function headerRow(labels, widths, fill = "1E3A5F") {
  return new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: labels.map((t, i) => cell(t, widths[i], { bold: true, fill, color: "FFFFFF", size: 18 })),
  });
}

function table(rows, widths) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: widths,
    rows,
  });
}

function dataRows(items, widths) {
  return items.map(
    (cols, r) =>
      new TableRow({
        cantSplit: true,
        children: cols.map((t, i) => cell(t, widths[i], { fill: r % 2 ? "F7F4EF" : "FFFFFF" })),
      }),
  );
}

function code(text) {
  return text.replace(/\r/g, "").split("\n").map(
    (line) =>
      new Paragraph({
        spacing: { before: 0, after: 0, line: 240 },
        children: [run(line.length ? line : " ", { font: "Consolas", size: 16 })],
      }),
  );
}

function pythonBlock(file, index) {
  const text = fs.readFileSync(file, "utf8");
  const blocks = [...text.matchAll(/```python\n([\s\S]*?)```/g)].map((m) => m[1].replace(/\s+$/, ""));
  return blocks[index];
}

const ESP32 = String.raw`#include <Arduino.h>

static const int PWMA = 25, AIN1 = 26, AIN2 = 27;
static const int PWMB = 32, BIN1 = 33, BIN2 = 18, STBY = 19;
static const int ESTOP = 23;
static const int ENC_LA = 34, ENC_LB = 35, ENC_RA = 36, ENC_RB = 39;

static volatile long ticksL = 0, ticksR = 0;
static char linea[32];
static uint8_t n = 0;
static uint32_t ultimoH = 0;

static void IRAM_ATTR isrL() { ticksL += (digitalRead(ENC_LB) ? 1 : -1); }
static void IRAM_ATTR isrR() { ticksR += (digitalRead(ENC_RB) ? 1 : -1); }

static void puente(int pwm, int in1, int in2, int vel) {
  vel = constrain(vel, -100, 100);
  bool adelante = vel >= 0;
  digitalWrite(in1, adelante);
  digitalWrite(in2, !adelante);
  ledcWrite(pwm, map(abs(vel), 0, 100, 0, 255));
}

static void frenar() {
  digitalWrite(STBY, LOW);
  puente(PWMA, AIN1, AIN2, 0);
  puente(PWMB, BIN1, BIN2, 0);
}

static void aplicar(int izq, int der) {
  if (digitalRead(ESTOP)) { frenar(); return; }
  digitalWrite(STBY, HIGH);
  puente(PWMA, AIN1, AIN2, izq);
  puente(PWMB, BIN1, BIN2, der);
}

void setup() {
  Serial.begin(115200);
  pinMode(AIN1, OUTPUT); pinMode(AIN2, OUTPUT);
  pinMode(BIN1, OUTPUT); pinMode(BIN2, OUTPUT);
  pinMode(STBY, OUTPUT);
  pinMode(ESTOP, INPUT_PULLUP);
  ledcAttach(PWMA, 20000, 8);
  ledcAttach(PWMB, 20000, 8);
  pinMode(ENC_LA, INPUT); pinMode(ENC_LB, INPUT);
  pinMode(ENC_RA, INPUT); pinMode(ENC_RB, INPUT);
  attachInterrupt(ENC_LA, isrL, RISING);
  attachInterrupt(ENC_RA, isrR, RISING);
  frenar();
  ultimoH = millis();
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      linea[n] = 0;
      n = 0;
      if (linea[0] == 'H') ultimoH = millis();
      else if (linea[0] == 'S') frenar();
      else if (linea[0] == 'M') {
        int izq = 0, der = 0;
        sscanf(linea + 1, "%d %d", &izq, &der);
        ultimoH = millis();
        aplicar(izq, der);
      }
    } else if (n < sizeof(linea) - 1 && c != '\r') linea[n++] = c;
  }
  if (digitalRead(ESTOP) || millis() - ultimoH > 300) frenar();
  static uint32_t impresion = 0;
  if (millis() - impresion > 200) {
    impresion = millis();
    Serial.println(digitalRead(ESTOP) ? "estop" : "ok");
  }
}`;

const W4 = [2700, 2700, 2700, 2700];
const W3 = [3600, 3600, 3600];
const W2 = [3600, 7200];

const children = [
  p("Aether", { bold: true, size: 48, color: NAVY, before: 0, after: 40 }),
  p("Documento maestro de construcción", { bold: true, size: 36, after: 80 }),
  p("Un solo archivo para el equipo. Celda, robot, red, pines y programas. 9 de octubre de 2026."),
  p("Hay dos máquinas. La celda usa una Raspberry Pi 4 junto a la banda. El robot usa una Raspberry Pi 5 de 8 GB. No comparten cámara ni Modbus. La laptop piensa y muestra la celda. El robot mira parado en un punto."),

  h("1. Qué se conecta con qué"),
  fig("01-sistema.png", "Sistema completo"),
  table(
    [
      headerRow(["Máquina", "Placa", "IP", "Qué hace"], W4),
      ...dataRows(
        [
          ["Celda", "Pi 4", "192.168.0.20", "Cámara de la banda y Modbus"],
          ["PLC", "El del tablero", "192.168.0.30", "Banda, pistón, IR1 e IR2"],
          ["Laptop", "La del proyecto", "192.168.0.10", "Pantalla de la celda y Ollama"],
          ["Robot", "Pi 5 de 8 GB", "192.168.0.40", "Cara, cámara del anaquel, ESP32"],
        ],
        W4,
      ),
    ],
    W4,
  ),
  p("Un switch. Cable de red a las cuatro. El Wi-Fi no mueve el pistón ni los motores.", { before: 160 }),
  p("Desde la laptop: ping 192.168.0.20, ping 192.168.0.30 y ping 192.168.0.40.", { font: "Consolas", size: 20 }),

  h("2. Comunicaciones"),
  fig("05-comunicaciones.png", "Quién llama a quién"),
  table(
    [
      headerRow(["De", "A", "Cómo"], W3),
      ...dataRows(
        [
          ["Cara, en la Pi 5", "Su propio servidor", "http://127.0.0.1:8000/robot.html"],
          ["Pi 5", "Ollama en la laptop", "HTTP puerto 11434"],
          ["Reproductor", "Pi 5", "WebSocket puerto 8000, solo eventos"],
          ["Laptop", "Pi 4", "HTTP puerto 8080, video y estado"],
          ["Pi 4", "PLC", "Modbus TCP puerto 502"],
          ["Navegador", "Inventario", "http://192.168.0.40:8000/inventory.html"],
        ],
        W3,
      ),
    ],
    W3,
  ),
  p("Si se cae el Wi-Fi siguen la cara, la cámara y el freno del ESP32. Se pierden la frase de Ollama y la televisión. El pistón depende del cable entre la Pi 4 y el PLC, no de ese Wi-Fi.", { before: 160 }),

  h("3. Celda"),
  p("La fuente de 24 V alimenta el PLC, los infrarrojos y el relé del pistón. La Pi 4 usa su cargador de 5 V, aparte. No hay hilo de 24 V hacia la Pi. No hay hilo entre el PLC y los GPIO."),
  fig("02-celda-electrico.png", "Alimentación de la celda"),
  fig("01-vista.png", "Vista de la banda", FIG_CELDA),
  fig("02-cables.png", "Cables de la celda", FIG_CELDA),
  fig("03-bornes.png", "Bornes del infrarrojo", FIG_CELDA),
  p("Cada infrarrojo es de 24 V, salida PNP, tres hilos. Un módulo de 5 V de Arduino no sirve.", { before: 80 }),
  table(
    [
      headerRow(["Hilo", "A dónde"], W2),
      ...dataRows(
        [
          ["Café o marrón", "+24 V del tablero"],
          ["Azul", "0 V del tablero, el mismo de las entradas del PLC"],
          ["Negro", "Borne de entrada del PLC"],
        ],
        W2,
      ),
    ],
    W2,
  ),
  p("IR1 mira la pieza frente a la cámara. IR2 mira la pieza después del pistón, todavía sobre la banda. Los dos entran al PLC. Antes de conectar la Pi: energizar el sensor, pasar la mano, y ver el LED del sensor y el LED de la entrada.", { before: 160 }),
  p("La salida del PLC va a la bobina del relé de la electroválvula, no directo a una bobina grande. Otra salida arranca la banda solo si la banda no corre ya sola. La cámara USB entra a la Pi 4. La Pi y el PLC entran al switch por Ethernet."),
  p("El pulso del pistón lo cronometra el PLC. Primera prueba en vacío: 150 a 300 ms, y se ajusta en la banda. Si se corta la red a media expulsión, el PLC suelta el pulso."),
  h2("Modbus, direcciones de prueba"),
  p("Estas direcciones no son las de tu PLC hasta llenar la columna Real con el manual del modelo que está en el tablero. En la lámina de bornes, I0.0, I0.1 y Q0.0 son el mismo ejemplo."),
  table(
    [
      headerRow(["Nombre", "Quién escribe", "Ejemplo", "Real"], W4),
      ...dataRows(
        [
          ["ir1_en_estacion", "PLC, desde IR1", "entrada 0", ""],
          ["ir2_en_banda", "PLC, desde IR2", "entrada 1", ""],
          ["rechazar", "Pi 4, 1 solo si FAIL", "bobina 10", ""],
          ["banda_marcha", "Pi 4, botón de pantalla", "bobina 11", ""],
          ["rpi_vivo", "Pi 4, 2 veces por segundo", "bobina 12", ""],
          ["plc_vivo", "PLC, contador que sube", "registro de entrada 0", ""],
          ["accion", "PLC: 0, 1, 2 o 3", "registro 20", ""],
          ["pieza_id", "PLC, sube con IR1", "registro 21", ""],
        ],
        W4,
      ),
    ],
    W4,
  ),
  p("accion: 1 pieza aceptada, 2 scrap expulsado, 3 fallo de actuación. Si la visión dijo FAIL y el pistón no se confirmó, el PLC escribe 3.", { before: 160 }),
  p("Si la Pi deja de ver subir plc_vivo durante 1 segundo, no deja rechazar en 1. Si el PLC deja de ver rpi_vivo, pone rechazar en 0 y no dispara."),
  p("Hoy la visión solo distingue si hay objeto. Eso no es FAIL. rechazar se queda en 0 hasta que exista el criterio de inspección. El video sí se publica, con el letrero PIEZA DETECTADA o SIN PIEZA."),
  h2("Cómo se enciende la pantalla"),
  ...code(`cd backend
$env:CELL_AGENT_URL = "http://192.168.0.20:8080"
.\\.venv\\Scripts\\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000`),
  p("Abrir http://192.168.0.10:8000/celda.html. Sin esa variable, la página sigue en simulador. No hay que cambiar celda.js.", { before: 140 }),
  h2("Programa de la Pi 4"),
  p("Guardar este archivo en la Pi 4 como agente_celda.py. Instalar ahí opencv y pymodbus. Correr: python3 agente_celda.py. Escucha en el puerto 8080. Cambiar las direcciones de ejemplo por la columna Real antes de darlo por terminado."),
  ...code(pythonBlock(path.join(ROOT, "datasheet-conexion-celda.md"), 0)),
  h2("Orden, sin saltos"),
  ...[
    "Anotar marca del PLC, de cada infrarrojo (PNP o NPN) y de la cámara. Llenar la columna Real.",
    "Cablear IR1 e IR2 solo al PLC. Probar los LED con la mano.",
    "Programar en el PLC el mapa, el latido y el pulso. Probar el pistón con el botón del PLC, en vacío.",
    "Ping a 192.168.0.20 y a 192.168.0.30.",
    "Cámara en la Pi 4. Abrir http://192.168.0.20:8080/vision/stream. Tiene que verse el video.",
    "Abrir http://192.168.0.20:8080/cell/snapshot. sources.plc en true cuando el PLC conteste.",
    "Levantar el backend con CELL_AGENT_URL. En celda.html el video es el de la Pi 4.",
    "Una pieza con rechazar en 0: la pantalla muestra pieza aceptada solo cuando el PLC lo escriba.",
    "Desconectar el Ethernet del PLC: en menos de dos segundos la pantalla dice SIN_CONEXION y el pistón no sigue accionado.",
  ].map(
    (text, i) =>
      new Paragraph({
        spacing: { after: 80 },
        children: [run(`${i + 1}. ${text}`)],
      }),
  ),

  h("4. Robot"),
  p("Compra: kit Raspberry Pi 5 de 8 GB con fuente oficial de 27 W, disipador activo, microSD y cable micro HDMI. El disipador activo va sobre el procesador. No se monta además el ventilador de la tapa."),
  fig("03-robot-alimentacion.png", "Tres fuentes del robot"),
  p("Tres fuentes. El positivo de la batería de motores no entra a la Pi. Los negativos se unen en un solo punto: batería, GND del driver, GND del ESP32 y pin 6 de la Pi."),
  p("Paro de emergencia, botón de dos circuitos, normalmente cerrado. Un circuito va en serie con el positivo de la batería, antes del driver. El otro va del GPIO 23 del ESP32 a GND. Botón suelto: el pin lee bajo. Pulsado: el pullup lee alto y el programa frena. El corte de la batería funciona aunque el programa esté colgado."),
  fig("04-robot-cableado.png", "Hilos de señal del robot"),
  h2("Pi 5 a ESP32"),
  p("Las dos placas son de 3,3 V. Se cruzan TX y RX. Placa ESP32-WROOM. Un módulo WROVER tiene los GPIO 16 y 17 ocupados: no usarlo."),
  table(
    [
      headerRow(["Pi 5, pin físico", "Señal", "ESP32"], W3),
      ...dataRows(
        [
          ["8", "GPIO 14, TX", "GPIO 16, RX2"],
          ["10", "GPIO 15, RX", "GPIO 17, TX2"],
          ["6", "GND", "GND"],
        ],
        W3,
      ),
    ],
    W3,
  ),
  p("En /boot/firmware/config.txt agregar dtparam=uart0=on y reiniciar. El puerto tiene que ser /dev/ttyAMA0. Si no aparece, ls /dev/ttyAMA* y usar el que salga. La primera prueba puede ser el cable USB: /dev/ttyACM0 o /dev/ttyUSB0.", { before: 160 }),
  p("Cámara USB en un puerto azul de la Pi 5. Es la única cámara de esa placa. El programa la abre como índice 0. El lidar, cuando se compre, va a otro USB de la Pi, no al ESP32. La pantalla usa el micro HDMI del kit y su propia fuente."),
  h2("TB6612, solo motores de menos de 1 A"),
  p("Si la etiqueta del motor dice más de 1 A, o el robot es grande, este driver no se usa. VM aguanta unos 15 V. VCC del TB6612 sale del 3,3 V del ESP32, no de la batería."),
  table(
    [
      headerRow(["TB6612", "ESP32", "Función"], W3),
      ...dataRows(
        [
          ["PWMA", "GPIO 25", "Velocidad izquierda"],
          ["AIN1", "GPIO 26", "Sentido izquierdo"],
          ["AIN2", "GPIO 27", "Sentido izquierdo"],
          ["PWMB", "GPIO 32", "Velocidad derecha"],
          ["BIN1", "GPIO 33", "Sentido derecho"],
          ["BIN2", "GPIO 18", "Sentido derecho"],
          ["STBY", "GPIO 19", "Alto = puente activo"],
          ["VCC", "3,3 V", "Lógica"],
          ["GND", "GND", "Común"],
          ["VM", "Polo 1 del paro", "Batería, ya fusionada"],
          ["AO1 AO2", "Motor izquierdo", ""],
          ["BO1 BO2", "Motor derecho", ""],
        ],
        W3,
      ),
    ],
    W3,
  ),
  h2("Encoders, a 3,3 V"),
  table(
    [
      headerRow(["Encoder", "ESP32"], W2),
      ...dataRows(
        [
          ["Izquierdo A", "GPIO 34"],
          ["Izquierdo B", "GPIO 35"],
          ["Derecho A", "GPIO 36"],
          ["Derecho B", "GPIO 39"],
          ["VCC", "3,3 V del ESP32"],
          ["GND", "GND"],
        ],
        W2,
      ),
    ],
    W2,
  ),
  p("Esos cuatro pines son solo entrada. Si el encoder no trae resistencia, poner 10 kΩ de la señal a 3,3 V. No alimentar el encoder a 5 V.", { before: 160 }),
  h2("Líneas que entiende el ESP32"),
  table(
    [
      headerRow(["Línea", "Efecto"], W2),
      ...dataRows(
        [
          ["H", "Latido. Sin esto, a los 300 ms los motores frenan"],
          ["M 40 40", "Velocidad izquierda y derecha, de -100 a 100"],
          ["S", "Freno inmediato"],
        ],
        W2,
      ),
    ],
    W2,
  ),
  p("Responde estop si el botón está pulsado, u ok si no. Arduino IDE, placa ESP32 Dev Module, monitor a 115200. ledcAttach es del core 3.x. Si no compila, actualizar el core. No reescribir el programa a ciegas.", { before: 160 }),
  ...code(ESP32),
  p("Prueba con las ruedas en el aire. Si el puerto no es ttyACM0, usar el que liste el sistema.", { before: 160 }),
  ...code(`import time, serial
ser = serial.Serial("/dev/ttyACM0", 115200, timeout=0.2)
time.sleep(2)
ser.write(b"M 30 30\\n")
time.sleep(1)
ser.write(b"S\\n")
print(ser.readline())`),

  h("5. Pi 5 y laptop"),
  p("En la Pi 5, Raspberry Pi OS de 64 bits. Clonar el repositorio. Dentro de backend:"),
  ...code(`python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000`),
  p("En backend/.env de la Pi:", { before: 140 }),
  ...code(`OLLAMA_URL=http://192.168.0.10:11434/api/chat
OLLAMA_MODEL=llama3.2:1b`),
  p("Chromium a pantalla completa abre http://127.0.0.1:8000/robot.html. La cámara no sale de la Pi.", { before: 140 }),
  p("YOLO no se deja en PyTorch en esta placa. En una máquina con el entorno, una vez: yolo export model=yolov8n.pt format=ncnn. Copiar la carpeta a la Pi y medir los cuadros por segundo con la cámara, los códigos y ArUco. Ese número todavía no está medido. La cara en reposo no corre YOLO."),
  p("En la laptop, antes de ollama serve:"),
  ...code(`$env:OLLAMA_HOST = "0.0.0.0:11434"
ollama serve`),
  p("Abrir el puerto 11434 en el firewall, red privada. Desde la Pi: curl http://192.168.0.10:11434/api/tags. Tiene que listar llama3.2:1b. Si no está, ollama pull llama3.2:1b en la laptop.", { before: 140 }),
  p("Reproductor, en la laptop, dentro de aether-video: npm run show. En el navegador:"),
  ...code("http://127.0.0.1:5055/player/?backend=192.168.0.40:8000"),
  p("Por ese canal van line-start y alive, no el video del anaquel. Si el Wi-Fi va justo, agregar &feed=0.", { before: 140 }),
  p("Spotify pide SPOTIFY_* en backend/.env y abrir una vez /robot/spotify/login. Las llamadas piden ZAVUDEV_API_KEY y backend/contactos.json. ElevenLabs pide ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID. El calendario responde 503: faltan las credenciales de Google."),

  h("6. Qué sí ve el robot, y qué no está hecho"),
  table(
    [
      headerRow(["Situación", "Quién", "Estado"], W3),
      ...dataRows(
        [
          ["Frase, Spotify, llamada", "Laptop, desde la Pi", "Ya está en el servidor"],
          ["Agenda", "Laptop", "Responde 503, faltan credenciales"],
          ["Producto en el anaquel", "Cámara, robot parado", "YOLO ya corre en la laptop; en la Pi hay que medirlo"],
          ["Estufa, puerta, luz", "Cámara en ese punto", "El cableado sirve. El programa de ruta no existe"],
          ["Choque en el camino", "Lidar y encoders", "El USB del lidar se puede dejar. El programa no existe"],
          ["Caída de una persona", "Cámara fija del cuarto", "El robot no está mirando siempre"],
          ["PASS o FAIL de la pieza", "Visión de la celda", "Presencia no es FAIL. rechazar queda en 0"],
        ],
        W3,
      ),
    ],
    W3,
  ),
  p("El recorrido es una lista de puntos. Llega, se para, mira y sigue. Desde un punto solo se ve lo que queda frente a la cámara.", { before: 160 }),
];

const doc = new Document({
  styles: {
    default: { document: { styles: [] } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickStyle: true, paragraph: { spacing: { before: 280, after: 160 } }, run: { font: "Calibri", size: 32, bold: true, color: NAVY } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickStyle: true, paragraph: { spacing: { before: 200, after: 100 } }, run: { font: "Calibri", size: 26, bold: true, color: NAVY } },
    ],
  },
  numbering: {
    config: [
      {
        reference: "pasos",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 440, hanging: 360 } } } }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 720, bottom: 780, left: 720, right: 720 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [run("Aether  ·  Documento maestro de construcción", { size: 18, color: MUTED })],
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
                run("Página ", { size: 18, color: MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: MUTED }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(OUT, buf.length);
});
