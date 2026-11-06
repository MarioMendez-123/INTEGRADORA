<!-- converted from Aether-documento-maestro.docx -->

Aether
Documento maestro de construcción
Un solo archivo para el equipo. Celda, robot, red, pines y programas. 9 de octubre de 2026.
Hay dos máquinas. La celda usa una Raspberry Pi 4 junto a la banda. El robot usa una Raspberry Pi 5 de 8 GB. No comparten cámara ni Modbus. La laptop piensa y muestra la celda. El robot mira parado en un punto.
# 1. Qué se conecta con qué

| Máquina | Placa | IP | Qué hace |
| --- | --- | --- | --- |
| Celda | Pi 4 | 192.168.0.20 | Cámara de la banda y Modbus |
| PLC | El del tablero | 192.168.0.30 | Banda, pistón, IR1 e IR2 |
| Laptop | La del proyecto | 192.168.0.10 | Pantalla de la celda y Ollama |
| Robot | Pi 5 de 8 GB | 192.168.0.40 | Cara, cámara del anaquel, ESP32 |
Un switch. Cable de red a las cuatro. El Wi-Fi no mueve el pistón ni los motores.
Desde la laptop: ping 192.168.0.20, ping 192.168.0.30 y ping 192.168.0.40.
# 2. Comunicaciones

| De | A | Cómo |
| --- | --- | --- |
| Cara, en la Pi 5 | Su propio servidor | http://127.0.0.1:8000/robot.html |
| Pi 5 | Ollama en la laptop | HTTP puerto 11434 |
| Reproductor | Pi 5 | WebSocket puerto 8000, solo eventos |
| Laptop | Pi 4 | HTTP puerto 8080, video y estado |
| Pi 4 | PLC | Modbus TCP puerto 502 |
| Navegador | Inventario | http://192.168.0.40:8000/inventory.html |
Si se cae el Wi-Fi siguen la cara, la cámara y el freno del ESP32. Se pierden la frase de Ollama y la televisión. El pistón depende del cable entre la Pi 4 y el PLC, no de ese Wi-Fi.
# 3. Celda
La fuente de 24 V alimenta el PLC, los infrarrojos y el relé del pistón. La Pi 4 usa su cargador de 5 V, aparte. No hay hilo de 24 V hacia la Pi. No hay hilo entre el PLC y los GPIO.




Cada infrarrojo es de 24 V, salida PNP, tres hilos. Un módulo de 5 V de Arduino no sirve.
| Hilo | A dónde |
| --- | --- |
| Café o marrón | +24 V del tablero |
| Azul | 0 V del tablero, el mismo de las entradas del PLC |
| Negro | Borne de entrada del PLC |
IR1 mira la pieza frente a la cámara. IR2 mira la pieza después del pistón, todavía sobre la banda. Los dos entran al PLC. Antes de conectar la Pi: energizar el sensor, pasar la mano, y ver el LED del sensor y el LED de la entrada.
La salida del PLC va a la bobina del relé de la electroválvula, no directo a una bobina grande. Otra salida arranca la banda solo si la banda no corre ya sola. La cámara USB entra a la Pi 4. La Pi y el PLC entran al switch por Ethernet.
El pulso del pistón lo cronometra el PLC. Primera prueba en vacío: 150 a 300 ms, y se ajusta en la banda. Si se corta la red a media expulsión, el PLC suelta el pulso.
## Modbus, direcciones de prueba
Estas direcciones no son las de tu PLC hasta llenar la columna Real con el manual del modelo que está en el tablero. En la lámina de bornes, I0.0, I0.1 y Q0.0 son el mismo ejemplo.
| Nombre | Quién escribe | Ejemplo | Real |
| --- | --- | --- | --- |
| ir1_en_estacion | PLC, desde IR1 | entrada 0 |  |
| ir2_en_banda | PLC, desde IR2 | entrada 1 |  |
| rechazar | Pi 4, 1 solo si FAIL | bobina 10 |  |
| banda_marcha | Pi 4, botón de pantalla | bobina 11 |  |
| rpi_vivo | Pi 4, 2 veces por segundo | bobina 12 |  |
| plc_vivo | PLC, contador que sube | registro de entrada 0 |  |
| accion | PLC: 0, 1, 2 o 3 | registro 20 |  |
| pieza_id | PLC, sube con IR1 | registro 21 |  |
accion: 1 pieza aceptada, 2 scrap expulsado, 3 fallo de actuación. Si la visión dijo FAIL y el pistón no se confirmó, el PLC escribe 3.
Si la Pi deja de ver subir plc_vivo durante 1 segundo, no deja rechazar en 1. Si el PLC deja de ver rpi_vivo, pone rechazar en 0 y no dispara.
Hoy la visión solo distingue si hay objeto. Eso no es FAIL. rechazar se queda en 0 hasta que exista el criterio de inspección. El video sí se publica, con el letrero PIEZA DETECTADA o SIN PIEZA.
## Cómo se enciende la pantalla
cd backend
$env:CELL_AGENT_URL = "http://192.168.0.20:8080"
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
Abrir http://192.168.0.10:8000/celda.html. Sin esa variable, la página sigue en simulador. No hay que cambiar celda.js.
## Programa de la Pi 4
Guardar este archivo en la Pi 4 como agente_celda.py. Instalar ahí opencv y pymodbus. Correr: python3 agente_celda.py. Escucha en el puerto 8080. Cambiar las direcciones de ejemplo por la columna Real antes de darlo por terminado.
#!/usr/bin/env python3
"""Agente de celda. Corre en el Raspberry. La laptop solo le hace HTTP."""
import json
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import cv2
from pymodbus.client import ModbusTcpClient

PLC_HOST = "192.168.0.30"
# Direcciones de ejemplo. Sustituir por la columna "real" de esta hoja.
IR1 = 0
COIL_RECHAZAR, COIL_BANDA, COIL_VIVO = 10, 11, 12
REG_VIVO, REG_ACCION, REG_PIEZA = 0, 20, 21
ACCION = {1: "pieza_aceptada", 2: "scrap_expulsado", 3: "fallo_actuacion"}

lock = threading.Lock()
estado = {
"source": "celda",
"running": False,
"state": "SIN_CONEXION",
"reason": "Arrancando",
"sources": {"vision_linea": False, "plc": False},
"counts": {"inspected": 0, "pass": 0, "fail": 0},
"recent": [],
"updated_at": None,
}
ultimo_jpeg = None


def ahora():
return datetime.now(timezone.utc).isoformat()


def lazo():
global ultimo_jpeg
plc = ModbusTcpClient(PLC_HOST, port=502, timeout=0.4)
cam = cv2.VideoCapture(0)
latido_anterior = None
latido_cambio = None
ultima_pieza = None
pieza_en_cero = set()

while True:
if not plc.connect():
with lock:
estado["sources"] = {"vision_linea": cam.isOpened(), "plc": False}
estado["state"] = "SIN_CONEXION"
estado["reason"] = "El PLC no responde"
estado["updated_at"] = ahora()
time.sleep(0.5)
continue

plc.write_coil(COIL_VIVO, True)
latido = plc.read_input_registers(REG_VIVO, count=1)
if latido.isError():
time.sleep(0.2)
continue
valor = latido.registers[0]
if valor != latido_anterior:
latido_anterior = valor
latido_cambio = time.monotonic()
elif latido_cambio and time.monotonic() - latido_cambio > 1:
plc.write_coil(COIL_RECHAZAR, False)
with lock:
estado["sources"] = {"vision_linea": cam.isOpened(), "plc": False}
estado["state"] = "SIN_CONEXION"
estado["reason"] = "El PLC no late"
estado["updated_at"] = ahora()
time.sleep(0.2)
continue

ir1 = plc.read_discrete_inputs(IR1, count=1)
pieza = plc.read_holding_registers(REG_PIEZA, count=1)
accion_reg = plc.read_holding_registers(REG_ACCION, count=1)
if ir1.isError() or pieza.isError() or accion_reg.isError():
time.sleep(0.2)
continue

# El criterio PASS/FAIL no existe todavía: no se pide expulsar.
# Cuando exista, esta línea pasa a True solo si ESA pieza es FAIL.
plc.write_coil(COIL_RECHAZAR, False)

pid = pieza.registers[0]
if ir1.bits[0] and cam.isOpened():
ok_frame, frame = cam.read()
if ok_frame:
cv2.putText(
frame, "PIEZA DETECTADA", (24, 48),
cv2.FONT_HERSHEY_SIMPLEX, 1.1, (0, 200, 0), 3,
)
ultimo_jpeg = cv2.imencode(".jpg", frame)[1].tobytes()

codigo = accion_reg.registers[0]
if codigo == 0:
pieza_en_cero.add(pid)
elif pid in pieza_en_cero and pid != ultima_pieza and codigo in ACCION:
accion = ACCION[codigo]
resultado = "PASS" if accion == "pieza_aceptada" else "FAIL"
with lock:
estado["counts"]["inspected"] += 1
estado["counts"]["fail" if resultado == "FAIL" else "pass"] += 1
estado["recent"].insert(0, {
"pieza": pid,
"resultado": resultado,
"accion": accion,
"timestamp": ahora(),
})
del estado["recent"][8:]
ultima_pieza = pid
pieza_en_cero.discard(pid)

with lock:
estado["sources"] = {"vision_linea": cam.isOpened(), "plc": True}
if estado["running"]:
estado["state"] = "OPERANDO"
estado["reason"] = None
else:
estado["state"] = "DETENIDA"
estado["reason"] = "Paro solicitado por el operador"
estado["updated_at"] = ahora()
time.sleep(0.2)


class Handler(BaseHTTPRequestHandler):
def log_message(self, fmt, *args):
return

def _json(self, code, body):
raw = json.dumps(body).encode()
self.send_response(code)
self.send_header("Content-Type", "application/json")
self.send_header("Content-Length", str(len(raw)))
self.end_headers()
self.wfile.write(raw)

def do_GET(self):
if self.path.startswith("/cell/snapshot"):
with lock:
self._json(200, dict(estado))
return
if self.path.startswith("/vision/stream"):
self.send_response(200)
self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
self.end_headers()
borde = b"--frame\r\nContent-Type: image/jpeg\r\n\r\n"
while True:
jpg = ultimo_jpeg
if jpg is None:
time.sleep(0.05)
continue
try:
self.wfile.write(borde + jpg + b"\r\n")
self.wfile.flush()
except (BrokenPipeError, ConnectionResetError):
break
time.sleep(0.05)
return
self._json(404, {"error": "no"})

def do_POST(self):
if not self.path.startswith("/cell/run"):
self._json(404, {"error": "no"})
return
n = int(self.headers.get("Content-Length", "0"))
on = bool(json.loads(self.rfile.read(n) or b"{}").get("on"))
plc = ModbusTcpClient(PLC_HOST, port=502, timeout=0.4)
if not plc.connect():
self._json(503, {"error": "plc"})
return
plc.write_coil(COIL_BANDA, on)
plc.close()
with lock:
estado["running"] = on
self._json(200, dict(estado))


if __name__ == "__main__":
threading.Thread(target=lazo, daemon=True).start()
ThreadingHTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
## Orden, sin saltos
1. Anotar marca del PLC, de cada infrarrojo (PNP o NPN) y de la cámara. Llenar la columna Real.
2. Cablear IR1 e IR2 solo al PLC. Probar los LED con la mano.
3. Programar en el PLC el mapa, el latido y el pulso. Probar el pistón con el botón del PLC, en vacío.
4. Ping a 192.168.0.20 y a 192.168.0.30.
5. Cámara en la Pi 4. Abrir http://192.168.0.20:8080/vision/stream. Tiene que verse el video.
6. Abrir http://192.168.0.20:8080/cell/snapshot. sources.plc en true cuando el PLC conteste.
7. Levantar el backend con CELL_AGENT_URL. En celda.html el video es el de la Pi 4.
8. Una pieza con rechazar en 0: la pantalla muestra pieza aceptada solo cuando el PLC lo escriba.
9. Desconectar el Ethernet del PLC: en menos de dos segundos la pantalla dice SIN_CONEXION y el pistón no sigue accionado.
# 4. Robot
Compra: kit Raspberry Pi 5 de 8 GB con fuente oficial de 27 W, disipador activo, microSD y cable micro HDMI. El disipador activo va sobre el procesador. No se monta además el ventilador de la tapa.

Tres fuentes. El positivo de la batería de motores no entra a la Pi. Los negativos se unen en un solo punto: batería, GND del driver, GND del ESP32 y pin 6 de la Pi.
Paro de emergencia, botón de dos circuitos, normalmente cerrado. Un circuito va en serie con el positivo de la batería, antes del driver. El otro va del GPIO 23 del ESP32 a GND. Botón suelto: el pin lee bajo. Pulsado: el pullup lee alto y el programa frena. El corte de la batería funciona aunque el programa esté colgado.

## Pi 5 a ESP32
Las dos placas son de 3,3 V. Se cruzan TX y RX. Placa ESP32-WROOM. Un módulo WROVER tiene los GPIO 16 y 17 ocupados: no usarlo.
| Pi 5, pin físico | Señal | ESP32 |
| --- | --- | --- |
| 8 | GPIO 14, TX | GPIO 16, RX2 |
| 10 | GPIO 15, RX | GPIO 17, TX2 |
| 6 | GND | GND |
En /boot/firmware/config.txt agregar dtparam=uart0=on y reiniciar. El puerto tiene que ser /dev/ttyAMA0. Si no aparece, ls /dev/ttyAMA* y usar el que salga. La primera prueba puede ser el cable USB: /dev/ttyACM0 o /dev/ttyUSB0.
Cámara USB en un puerto azul de la Pi 5. Es la única cámara de esa placa. El programa la abre como índice 0. El lidar, cuando se compre, va a otro USB de la Pi, no al ESP32. La pantalla usa el micro HDMI del kit y su propia fuente.
## TB6612, solo motores de menos de 1 A
Si la etiqueta del motor dice más de 1 A, o el robot es grande, este driver no se usa. VM aguanta unos 15 V. VCC del TB6612 sale del 3,3 V del ESP32, no de la batería.
| TB6612 | ESP32 | Función |
| --- | --- | --- |
| PWMA | GPIO 25 | Velocidad izquierda |
| AIN1 | GPIO 26 | Sentido izquierdo |
| AIN2 | GPIO 27 | Sentido izquierdo |
| PWMB | GPIO 32 | Velocidad derecha |
| BIN1 | GPIO 33 | Sentido derecho |
| BIN2 | GPIO 18 | Sentido derecho |
| STBY | GPIO 19 | Alto = puente activo |
| VCC | 3,3 V | Lógica |
| GND | GND | Común |
| VM | Polo 1 del paro | Batería, ya fusionada |
| AO1 AO2 | Motor izquierdo |  |
| BO1 BO2 | Motor derecho |  |
## Encoders, a 3,3 V
| Encoder | ESP32 |
| --- | --- |
| Izquierdo A | GPIO 34 |
| Izquierdo B | GPIO 35 |
| Derecho A | GPIO 36 |
| Derecho B | GPIO 39 |
| VCC | 3,3 V del ESP32 |
| GND | GND |
Esos cuatro pines son solo entrada. Si el encoder no trae resistencia, poner 10 kΩ de la señal a 3,3 V. No alimentar el encoder a 5 V.
## Líneas que entiende el ESP32
| Línea | Efecto |
| --- | --- |
| H | Latido. Sin esto, a los 300 ms los motores frenan |
| M 40 40 | Velocidad izquierda y derecha, de -100 a 100 |
| S | Freno inmediato |
Responde estop si el botón está pulsado, u ok si no. Arduino IDE, placa ESP32 Dev Module, monitor a 115200. ledcAttach es del core 3.x. Si no compila, actualizar el core. No reescribir el programa a ciegas.
#include <Arduino.h>

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
}
Prueba con las ruedas en el aire. Si el puerto no es ttyACM0, usar el que liste el sistema.
import time, serial
ser = serial.Serial("/dev/ttyACM0", 115200, timeout=0.2)
time.sleep(2)
ser.write(b"M 30 30\n")
time.sleep(1)
ser.write(b"S\n")
print(ser.readline())
# 5. Pi 5 y laptop
En la Pi 5, Raspberry Pi OS de 64 bits. Clonar el repositorio. Dentro de backend:
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
En backend/.env de la Pi:
OLLAMA_URL=http://192.168.0.10:11434/api/chat
OLLAMA_MODEL=llama3.2:1b
Chromium a pantalla completa abre http://127.0.0.1:8000/robot.html. La cámara no sale de la Pi.
YOLO no se deja en PyTorch en esta placa. En una máquina con el entorno, una vez: yolo export model=yolov8n.pt format=ncnn. Copiar la carpeta a la Pi y medir los cuadros por segundo con la cámara, los códigos y ArUco. Ese número todavía no está medido. La cara en reposo no corre YOLO.
En la laptop, antes de ollama serve:
$env:OLLAMA_HOST = "0.0.0.0:11434"
ollama serve
Abrir el puerto 11434 en el firewall, red privada. Desde la Pi: curl http://192.168.0.10:11434/api/tags. Tiene que listar llama3.2:1b. Si no está, ollama pull llama3.2:1b en la laptop.
Reproductor, en la laptop, dentro de aether-video: npm run show. En el navegador:
http://127.0.0.1:5055/player/?backend=192.168.0.40:8000
Por ese canal van line-start y alive, no el video del anaquel. Si el Wi-Fi va justo, agregar &feed=0.
Spotify pide SPOTIFY_* en backend/.env y abrir una vez /robot/spotify/login. Las llamadas piden ZAVUDEV_API_KEY y backend/contactos.json. ElevenLabs pide ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID. El calendario responde 503: faltan las credenciales de Google.
# 6. Qué sí ve el robot, y qué no está hecho
| Situación | Quién | Estado |
| --- | --- | --- |
| Frase, Spotify, llamada | Laptop, desde la Pi | Ya está en el servidor |
| Agenda | Laptop | Responde 503, faltan credenciales |
| Producto en el anaquel | Cámara, robot parado | YOLO ya corre en la laptop; en la Pi hay que medirlo |
| Estufa, puerta, luz | Cámara en ese punto | El cableado sirve. El programa de ruta no existe |
| Choque en el camino | Lidar y encoders | El USB del lidar se puede dejar. El programa no existe |
| Caída de una persona | Cámara fija del cuarto | El robot no está mirando siempre |
| PASS o FAIL de la pieza | Visión de la celda | Presencia no es FAIL. rechazar queda en 0 |
El recorrido es una lista de puntos. Llega, se para, mira y sigue. Desde un punto solo se ve lo que queda frente a la cámara.