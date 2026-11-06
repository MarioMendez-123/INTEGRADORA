// Firmware del ESP32 del carrito Aether: ejecuta las órdenes de la Jetson (DRV, TRN, APR, MAN), hace la
// odometría, cuida los obstáculos y el paro, y reporta por USB. El MISMO archivo compila para:
//   pio run -e esp32dev -t upload   -> el ESP32 real
//   pio run -e native               -> la PC conectada al simulador (necesita gcc)
//
// Protocolo (líneas de texto, 115200 baud):
//   Jetson -> ESP32:  HB | STOP | VMAX v | RES | REARME | DRV id dist v rumbo | TRN id rumbo wmax
//                     APR id dist v frente_cm [esperado_cm] | MAN vIzq vDer
//   ESP32 -> Jetson:  ODO t_ms sIzq sDer rumbo vIzq vDer | MOT rpmIzq rpmDer freno | RNG frente izq der pila
//                     PWR bateria_mV paro_mV | EVT id DONE|BLOCKED mm|CLEAR|FAULT motivo|REARMADO
// (MOT, PWR, MAN y el 5.º parámetro de APR son propuestas nuevas; falta que la Jetson real las adopte.)
#include <Adafruit_BNO055.h>
#include <Arduino.h>
#include <VL53L0X.h>
#include <Wire.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// ------------------------------------------------------------------ pines (guía rev. 3.21; no cambiaron desde la 3.17c)
static const int PIN_DE = 4, PIN_RX = 16, PIN_TX = 17, PIN_PARO = 34, PIN_BAT = 39;
static const int XSHUT[3] = {32, 33, 15};          // frente, izquierdo, derecho

// ------------------------------------------------------------------ constantes (medir en el carrito real)
static const float R_RUEDA = 0.051f, VIA = 0.259f;
static const float RPM_A_RADS = 2.0f * PI / 60.0f;
static const float CICLO_S = 0.02f;                // 50 Hz: los M0601 sueltan la rueda si llegan menos tramas
static const float LATIDO_MAX_S = 1.0f;
static const int MARGEN_ESPERADO_MM = 450;         // las bocas de las guías en V quedan hasta ~40 cm antes de la estación y el sensor las ve
static const int REFLEJO_MM = 400;                 // frena si el sensor frontal ve algo más cerca
static const float TOLERANCIA_DIST = 0.003f;
static const int PARO_MV_PRESIONADO = 1000;

static HardwareSerial bus(2);
static VL53L0X vl[3], pila;
static Adafruit_BNO055 bno(55, 0x28);

// ------------------------------------------------------------------ estado
struct Prim {
  char tipo = 0;                                   // 'D', 'T', 'A', 'M' o 0 si no hay
  int id = 0;
  float dist = 0, v = 0, rumbo = 0, wmax = 0.6f, frente = 0, esperado = 0, s0 = 0, tLento = 0, vL = 0, vR = 0, hasta = 0;
};
static Prim prim;
static float sIzq = 0, sDer = 0, vmax = 0.35f;
static int rpmIzq = 0, rpmDer = 0, objIzq = 0, objDer = 0;
static bool falla = false, bloqueado = false, sensoresOk = false, imuOk = false;
static float tHb = -1e9f, tCiclo = 0, tOdo = 0, tRng = 0, tPwr = 0;
static uint16_t rng[4] = {8190, 8190, 8190, 8190};  // frente, izquierdo, derecho, pila
static int turno = 0;
static char linea[96];
static int nLinea = 0;

static float ahora() { return millis() / 1000.0f; }
static float angDif(float a, float b) { float d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return d; }

static uint8_t crc8maxim(const uint8_t* d, int n) {   // CRC-8/MAXIM: "123456789" da 0xA1
  uint8_t crc = 0;
  for (int i = 0; i < n; i++) {
    crc ^= d[i];
    for (int b = 0; b < 8; b++) crc = (crc & 1) ? (uint8_t)((crc >> 1) ^ 0x8C) : (uint8_t)(crc >> 1);
  }
  return crc;
}

// Manda una trama al M0601 y lee su respuesta. Devuelve false si no contesta o llega corrupta.
static bool intercambiar(uint8_t id, int16_t rpm, bool frenar, int& rpmLeido) {
  uint8_t t[10] = {id, 0x64, (uint8_t)(rpm >> 8), (uint8_t)rpm, 0, 0, 0, (uint8_t)(frenar ? 0xFF : 0x00), 0, 0};
  t[9] = crc8maxim(t, 9);
  while (bus.available()) bus.read();
  digitalWrite(PIN_DE, HIGH);                      // el MAX485 habla
  bus.write(t, 10);
  bus.flush();
  digitalWrite(PIN_DE, LOW);                       // y escucha
  uint8_t r[10];
  int n = 0;
  unsigned long t0 = millis();
  while (n < 10 && millis() - t0 < 6) {
    if (bus.available()) r[n++] = (uint8_t)bus.read(); else delayMicroseconds(100);
  }
  if (n < 10 || r[0] != id || crc8maxim(r, 9) != r[9]) return false;
  rpmLeido = (int16_t)((r[4] << 8) | r[5]);        // respuesta: ID modo iH iL vH vL pH pL err CRC
  return true;
}

static void modoVelocidad(uint8_t id) {
  uint8_t t[10] = {id, 0xA0, 0, 0, 0, 0, 0, 0, 0, 0x02};   // sin CRC: el byte 9 es el modo
  digitalWrite(PIN_DE, HIGH);
  bus.write(t, 10);
  bus.flush();
  digitalWrite(PIN_DE, LOW);
}

static uint16_t leerVl(VL53L0X& s) {
  uint16_t d = s.readRangeContinuousMillimeters();
  return (s.timeoutOccurred() || d > 8190) ? 8190 : d;
}

static bool leerRumbo(float& th) {                 // el BNO055 crece en sentido horario; el mapa, antihorario
  sensors_event_t ev;
  if (!imuOk || !bno.getEvent(&ev)) return false;
  th = angDif(-ev.orientation.x, 0);
  return true;
}

static void terminar(const char* evento) {
  if (prim.tipo) Serial.printf("EVT %d %s\n", prim.id, evento);
  else if (strncmp(evento, "FAULT", 5) == 0) Serial.printf("EVT 0 %s\n", evento);
  prim.tipo = 0;
}

// ------------------------------------------------------------------ órdenes de la Jetson
static void orden(char* l) {
  tHb = ahora();                                   // cualquier línea cuenta como latido
  float a, b, c, d, e;
  int id;
  float s = (sIzq + sDer) / 2;
  if (strncmp(l, "HB", 2) == 0) return;
  if (strncmp(l, "STOP", 4) == 0) { terminar("DONE stop"); return; }
  if (sscanf(l, "VMAX %f", &a) == 1) { vmax = a; return; }
  if (strcmp(l, "RES") == 0) { sIzq = sDer = 0; return; }
  if (strncmp(l, "REARME", 6) == 0) {
    if (analogReadMilliVolts(PIN_PARO) > 1500) { falla = false; Serial.println("EVT 0 REARMADO"); }
    else Serial.println("EVT 0 FAULT paro_presionado");
    return;
  }
  if (falla) { if (sscanf(l, "%*s %d", &id) == 1) Serial.printf("EVT %d FAULT falla_paro\n", id); return; }
  Prim p;
  if (sscanf(l, "DRV %d %f %f %f", &id, &a, &b, &c) == 4) { p.tipo = 'D'; p.id = id; p.dist = a; p.v = b; p.rumbo = c; p.s0 = s; }
  else if (strncmp(l, "TRN", 3) == 0) {
    b = 0.6f;
    if (sscanf(l, "TRN %d %f %f", &id, &a, &b) < 2) return;
    p.tipo = 'T'; p.id = id; p.rumbo = a; p.wmax = b;
  }
  else if (sscanf(l, "APR %d %f %f %f %f", &id, &a, &b, &c, &d) >= 4) {
    e = 0; sscanf(l, "APR %d %f %f %f %f", &id, &a, &b, &c, &e);
    p.tipo = 'A'; p.id = id; p.dist = a; p.v = b; p.frente = c; p.esperado = e; p.s0 = s;
  } else if (sscanf(l, "MAN %f %f", &a, &b) == 2) { p.tipo = 'M'; p.vL = a; p.vR = b; p.hasta = ahora() + 0.3f; }
  else return;
  bloqueado = false;
  prim = p;
}

static void leerUsb() {
  while (Serial.available()) {
    int c = Serial.read();
    if (c == '\n') { linea[nLinea] = 0; if (nLinea) orden(linea); nLinea = 0; }
    else if (c != '\r' && nLinea < (int)sizeof(linea) - 1) linea[nLinea++] = (char)c;
  }
}

// ------------------------------------------------------------------ control: velocidades de rueda (m/s) o freno
static void control(float dt, float& vL, float& vR, bool& frenar) {
  vL = vR = 0; frenar = true;
  float s = (sIzq + sDer) / 2, th;
  float real = fabsf((rpmIzq + rpmDer) / 2.0f * RPM_A_RADS * R_RUEDA);
  if (prim.tipo == 'M') {                          // joystick
    if (ahora() > prim.hasta) { prim.tipo = 0; return; }
    bool adelante = prim.vL + prim.vR > 0;
    if (adelante && rng[0] < REFLEJO_MM) return;   // el reflejo también cuida el manejo a mano
    vL = constrain(prim.vL, -vmax, vmax); vR = constrain(prim.vR, -vmax, vmax); frenar = false;
    return;
  }
  if (!leerRumbo(th)) { terminar("FAULT sin_imu"); return; }
  if (prim.tipo == 'T') {
    float err = angDif(prim.rumbo, th);
    if (fabsf(err) < 0.6f) { terminar("DONE"); return; }
    float w = constrain(0.04f * err, -prim.wmax, prim.wmax);
    float wf = (w < 0 ? -1.0f : 1.0f) * fmaxf(fabsf(w), 0.08f);
    vL = -wf * VIA / 2; vR = wf * VIA / 2; frenar = false;
    return;
  }
  float hecho = fabsf(s - prim.s0), resto = fabsf(prim.dist) - hecho, sig = prim.dist < 0 ? -1.0f : 1.0f;
  if (prim.tipo == 'D') {
    if (resto <= TOLERANCIA_DIST) { terminar("DONE"); return; }
    if (sig > 0) {                                 // reflejo del VL53L0X frontal (solo hacia adelante)
      if (rng[0] < REFLEJO_MM) { if (!bloqueado) Serial.printf("EVT %d BLOCKED %d\n", prim.id, rng[0]); bloqueado = true; }
      else if (bloqueado && rng[0] > 500) { bloqueado = false; Serial.printf("EVT %d CLEAR\n", prim.id); }
      if (bloqueado) return;
    }
    // sin sensor trasero: si manda velocidad y la rueda no avanza, algo la detiene (atascado)
    prim.tLento = (real < 0.01f) ? prim.tLento + dt : 0;
    if (prim.tLento > 1.5f) { terminar("FAULT atascado"); return; }
    float v = sig * fminf(fminf(prim.v, vmax), sqrtf(2 * 0.3f * resto) + 0.02f);
    float w = constrain(0.05f * angDif(prim.rumbo, th), -0.5f, 0.5f);
    vL = v - w * VIA / 2; vR = v + w * VIA / 2; frenar = false;
    return;
  }
  // 'A': acople recto hasta la distancia, hasta que el frontal mida "frente" cm, o hasta los topes
  uint16_t f = rng[0];
  if (resto <= 0 || (prim.frente > 0 && f <= prim.frente * 10)) { terminar("DONE"); return; }
  if (prim.esperado > 0) {                         // algo más cerca de lo que debería estar la estación
    float espMm = (prim.esperado - hecho * 100) * 10;
    if (f < espMm - MARGEN_ESPERADO_MM) { if (!bloqueado) Serial.printf("EVT %d BLOCKED %d\n", prim.id, f); bloqueado = true; }
    else if (bloqueado && f > espMm - MARGEN_ESPERADO_MM + 100) { bloqueado = false; Serial.printf("EVT %d CLEAR\n", prim.id); }
    if (bloqueado) return;
  }
  prim.tLento = (real < 0.01f && hecho > 0.02f) ? prim.tLento + dt : 0;
  if (prim.tLento > 0.4f) { terminar("DONE topes"); return; }
  vL = vR = prim.v; frenar = false;
}

// ------------------------------------------------------------------ arranque
void setup() {
  Serial.begin(115200);
  pinMode(PIN_DE, OUTPUT);
  digitalWrite(PIN_DE, LOW);
  bus.begin(115200, SERIAL_8N1, PIN_RX, PIN_TX);
  pinMode(PIN_PARO, INPUT);
  delay(300);
  modoVelocidad(1);
  modoVelocidad(2);
  Wire.begin(21, 22);
  for (int i = 0; i < 3; i++) { pinMode(XSHUT[i], OUTPUT); digitalWrite(XSHUT[i], LOW); }   // apaga los 3 de obstáculos
  delay(10);
  sensoresOk = pila.init();
  if (sensoresOk) { pila.setAddress(0x33); pila.setTimeout(50); pila.setMeasurementTimingBudget(20000); pila.startContinuous(); }
  for (int i = 0; i < 3; i++) {                    // enciende uno por uno y dale su dirección
    digitalWrite(XSHUT[i], HIGH);
    delay(10);
    bool ok = vl[i].init();
    sensoresOk = sensoresOk && ok;
    if (ok) { vl[i].setAddress(0x30 + i); vl[i].setTimeout(50); vl[i].setMeasurementTimingBudget(20000); vl[i].startContinuous(); }
  }
  imuOk = bno.begin(OPERATION_MODE_IMUPLUS);
  Serial.printf("ESP32 listo: sensores %s, IMU %s\n", sensoresOk ? "ok" : "CON FALLA", imuOk ? "ok" : "CON FALLA");
}

void loop() {
  leerUsb();
  float t = ahora();
  if (t - tCiclo < CICLO_S) { delay(1); return; }
  float dt = t - tCiclo;
  if (dt > 0.1f) dt = CICLO_S;                     // primer ciclo o pausa larga
  tCiclo = t;

  // sensores: el frontal en cada ciclo y uno de los otros en turno (la lectura continua no bloquea)
  rng[0] = leerVl(vl[0]);
  turno = (turno + 1) % 3;
  if (turno == 0) rng[1] = leerVl(vl[1]); else if (turno == 1) rng[2] = leerVl(vl[2]); else rng[3] = leerVl(pila);

  // paro y latido
  bool paro = analogReadMilliVolts(PIN_PARO) < PARO_MV_PRESIONADO;
  if (paro && !falla) { falla = true; terminar("FAULT paro"); }
  if (prim.tipo && prim.tipo != 'M' && t - tHb > LATIDO_MAX_S) terminar("FAULT sin_latido");

  float vL = 0, vR = 0;
  bool frenar = true;
  if (prim.tipo && !falla) control(dt, vL, vR, frenar);
  objIzq = frenar ? 0 : (int)lroundf(vL / (R_RUEDA * RPM_A_RADS));
  objDer = frenar ? 0 : (int)lroundf(vR / (R_RUEDA * RPM_A_RADS));
  int r;
  if (intercambiar(1, objIzq, frenar, r)) rpmIzq = r;
  if (intercambiar(2, objDer, frenar, r)) rpmDer = r;
  sIzq += rpmIzq * RPM_A_RADS * R_RUEDA * dt;
  sDer += rpmDer * RPM_A_RADS * R_RUEDA * dt;

  if (t - tOdo >= 0.1f) {
    tOdo = t;
    float th;
    char thTxt[16];
    if (leerRumbo(th)) snprintf(thTxt, sizeof thTxt, "%.2f", th); else snprintf(thTxt, sizeof thTxt, "nan");
    Serial.printf("ODO %lu %.4f %.4f %s %.3f %.3f\n", (unsigned long)millis(), sIzq, sDer, thTxt, rpmIzq * RPM_A_RADS * R_RUEDA, rpmDer * RPM_A_RADS * R_RUEDA);
    Serial.printf("MOT %d %d %d\n", objIzq, objDer, frenar ? 1 : 0);
  }
  if (t - tRng >= 0.2f) { tRng = t; Serial.printf("RNG %u %u %u %u\n", rng[0], rng[1], rng[2], rng[3]); }
  if (t - tPwr >= 0.5f) { tPwr = t; Serial.printf("PWR %lu %lu\n", (unsigned long)(analogReadMilliVolts(PIN_BAT) * 6UL), (unsigned long)analogReadMilliVolts(PIN_PARO)); }
}
