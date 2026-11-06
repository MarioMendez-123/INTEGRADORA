// Tutorial paso a paso: cada paso dice qué hacer y el simulador revisa solo si ya lo lograste.
'use strict';
const Tutorial = (() => {
  const PIO = '& "$env:USERPROFILE\\.platformio\\penv\\Scripts\\pio.exe"';
  const C = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const bloque = (titulo, codigo) => `<div class="tenue" style="margin-top:6px">${titulo}<button class="b copiar" data-copiar>Copiar</button></div><pre><code>${C(codigo)}</code></pre>`;

  const CODIGO_M0601 = `#include <Arduino.h>
// Una rueda a 30 rpm, con 50 tramas por segundo (si dejan de llegar, el M0601 suelta la rueda).
HardwareSerial bus(2);
const int PIN_RX = 16, PIN_TX = 17, PIN_DE = 4;   // MAX485: DI←17, RO→(convertidor)→16, DE=RE←4

uint8_t crc8maxim(const uint8_t* d, int n) {       // CRC-8/MAXIM: "123456789" da 0xA1
  uint8_t crc = 0;
  for (int i = 0; i < n; i++) {
    crc ^= d[i];
    for (int b = 0; b < 8; b++) crc = (crc & 1) ? (crc >> 1) ^ 0x8C : crc >> 1;
  }
  return crc;
}

void enviar(const uint8_t* t) {
  digitalWrite(PIN_DE, HIGH);    // el MAX485 habla
  bus.write(t, 10);
  bus.flush();                   // espera a que salga el último byte
  digitalWrite(PIN_DE, LOW);     // y escucha la respuesta
}

void modoVelocidad(uint8_t id) {
  uint8_t t[10] = {id, 0xA0, 0, 0, 0, 0, 0, 0, 0, 0x02};   // sin CRC: el byte 9 es el modo
  enviar(t);
}

void velocidad(uint8_t id, int16_t rpm, bool frenar) {
  uint8_t t[10] = {id, 0x64, (uint8_t)(rpm >> 8), (uint8_t)rpm, 0, 0, 0, (uint8_t)(frenar ? 0xFF : 0), 0, 0};
  t[9] = crc8maxim(t, 9);
  enviar(t);
}

int leerRpm() {                  // respuesta: ID modo iH iL vH vL pH pL err CRC
  uint8_t r[10]; int n = 0; unsigned long t0 = millis();
  while (n < 10 && millis() - t0 < 5) if (bus.available()) r[n++] = bus.read();
  if (n < 10 || crc8maxim(r, 9) != r[9]) return 9999;
  return (int16_t)((r[4] << 8) | r[5]);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_DE, OUTPUT);
  digitalWrite(PIN_DE, LOW);
  bus.begin(115200, SERIAL_8N1, PIN_RX, PIN_TX);
  delay(300);
  modoVelocidad(1);
  modoVelocidad(2);
}

unsigned long ultimo = 0, impreso = 0;
void loop() {
  if (millis() - ultimo >= 20) {                   // 50 Hz
    ultimo = millis();
    velocidad(1, 30, false);
    int rpm = leerRpm();
    velocidad(2, 0, false);
    leerRpm();
    if (millis() - impreso > 500) { impreso = millis(); Serial.printf("rueda izquierda: %d rpm\\n", rpm); }
  }
}`;

  const CODIGO_RECTA = `// Reemplaza el loop() del paso anterior: recta de 1 m a ~0.2 m/s y alto con freno.
// Distancia = lo que giran las ruedas (rpm medidas × tiempo). Es odometría sencilla: el paso 4
// de la guía de navegación la hace con la posición del encoder, que es más exacta.
const float DIAMETRO = 0.102;                      // m (medir la rueda real)
const int RPM_RECTA = 37;                          // 0.2 m/s ≈ 37 rpm
float recorrido = 0;
unsigned long ultimo = 0, impreso = 0;
bool listo = false;

void loop() {
  if (millis() - ultimo < 20) return;
  float dt = (millis() - ultimo) / 1000.0;
  ultimo = millis();
  bool frenar = listo;
  velocidad(1, frenar ? 0 : RPM_RECTA, frenar);
  int ri = leerRpm();
  velocidad(2, frenar ? 0 : RPM_RECTA, frenar);
  int rd = leerRpm();
  if (ri != 9999 && rd != 9999) recorrido += (ri + rd) / 2.0 / 60.0 * PI * DIAMETRO * dt;
  if (recorrido >= 1.0 && !listo) { listo = true; Serial.printf("llegué: %.3f m\\n", recorrido); }
  if (millis() - impreso > 500) { impreso = millis(); Serial.printf("recorrido %.3f m\\n", recorrido); }
}`;

  const CODIGO_VL53 = `#include <Arduino.h>
#include <Wire.h>
#include <VL53L0X.h>
// Los 4 VL53L0X nacen todos en la dirección 0x29: hay que darles una a cada uno.
// Los 3 de obstáculos tienen XSHUT (apagado) en los GPIO 32, 33 y 15; el de la pila no.
VL53L0X pila, sensor[3];
const int XSHUT[3] = {32, 33, 15};

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  for (int i = 0; i < 3; i++) { pinMode(XSHUT[i], OUTPUT); digitalWrite(XSHUT[i], LOW); }  // apaga los 3
  delay(10);
  if (!pila.init()) Serial.println("la pila no responde en 0x29");
  pila.setAddress(0x33);                             // primero el que no tiene XSHUT
  for (int i = 0; i < 3; i++) {
    digitalWrite(XSHUT[i], HIGH);                    // enciende uno
    delay(10);
    if (!sensor[i].init()) Serial.printf("el sensor %d no responde\\n", i);
    sensor[i].setAddress(0x30 + i);                  // y cámbiale la dirección antes del siguiente
    sensor[i].setTimeout(50);
    sensor[i].startContinuous();
  }
}

void loop() {
  Serial.printf("frente %u  izq %u  der %u mm\\n", sensor[0].readRangeContinuousMillimeters(),
                sensor[1].readRangeContinuousMillimeters(), sensor[2].readRangeContinuousMillimeters());
  delay(200);
}`;

  const CODIGO_JETSON = `# hola_jetson.py — corre en la laptop. En la Jetson real solo cambia la dirección del puerto.
import serial   # pip install pyserial

puerto = serial.serial_for_url("socket://localhost:7701", timeout=0.2)   # Jetson real: serial.Serial("/dev/ttyUSB0", 115200)
for _ in range(5):
    puerto.write(b"HB\\n")
    print(puerto.readline().decode(errors="replace").strip())`;

  const CODIGO_ECO = `// En el loop() del ESP32: contesta lo que le llegue por USB desde la Jetson.
  while (Serial.available()) {
    static char linea[64]; static int n = 0;
    char c = Serial.read();
    if (c == '\\n') { linea[n] = 0; Serial.printf("recibí: %s\\n", linea); n = 0; }
    else if (n < 63) linea[n++] = c;
  }`;

  const PASOS = [
    { t: 'Conoce el simulador', manual: true, h: `
      <p>Este es tu carrito tal como está en la guía de armado rev. 3.21, ya armado y cableado. Empieza acoplado en la banda (enfrente de él). A 4 m hacia atrás y a la izquierda está la estación de descarga: una mesa inclinada de ejemplo. Los ArUco van a 1.5 m; el cuadrito que ves a media altura junto a la banda es el ArUco viejo de la guía, a 0.45 m.</p>
      <ol><li>Gira la vista arrastrando con el mouse; acerca con la rueda.</li>
      <li>Abajo a la derecha está lo que ve la cámara C920 del carrito.</li>
      <li>Revisa las pestañas: <b>Mandos</b> (energía y botones), <b>Medidas</b> (el multímetro), <b>Cables</b> (los 103 de la placa y el arnés) y <b>Monitor</b> (lo que imprime tu programa).</li></ol>
      <p>Las líneas azules que salen de abajo del carrito son los VL53L0X; se ponen rojas si algo está a menos de 40 cm.</p>` },
    { t: 'Enciende la lógica con el KCD1', h: `
      <p>En <b>Mandos</b> pulsa <b>KCD1</b>. La corriente sale de la batería, pasa por el fusible de 5 A y el KCD1, y llega al XL4005, que da 5 V al ESP32, al MAX485 y al servo. También le llega a la Jetson.</p>
      <p>Debes ver en <b>Medidas</b>: XL4005 ≈ 5.05 V y 3V3 del ESP32 = 3.3 V.</p>`,
      ok: e => e.electrico.kcd1 && e.esp32.vivo && Math.abs(e.electrico.v.xl4005 - 5.05) < 0.1 },
    { t: 'El paro alimenta el relé: 18 V a las ruedas', h: `
      <p>Con el paro suelto, sus contactos (NC) alimentan la bobina del relé. El relé cierra y deja pasar los 12 V del fusible de 15 A al elevador, que da los 18 V de los M0601.</p>
      <p>Debes ver: relé cerrado y elevador en 18 V.</p>`,
      ok: e => e.electrico.rele && e.electrico.v.elevador > 17 },
    { t: 'Prueba el paro y lo que lee el GPIO 34', h: `
      <p>Pulsa <b>Paro</b>. El relé se suelta y los 18 V caen a 0, aunque el programa esté colgado. El GPIO 34 pasa de ~2.15 V a 0 V: así se entera el ESP32 (divisor de 100 kΩ y 20 kΩ). Suelta el paro.</p>
      <p>La guía pide medir 2.0–2.4 V en el GPIO 34 con el paro suelto antes de conectarlo. Aquí lo ves en <b>Medidas</b>.</p>`,
      ok: (e, p) => { if (e.electrico.paro && e.electrico.v.elevador < 1 && e.electrico.v.gpio34 < 0.5) p.paro = true; return p.paro && !e.electrico.paro && e.electrico.v.gpio34 > 2.0 && e.electrico.v.gpio34 < 2.4; } },
    { t: 'Haz un corto a propósito (y cambia el fusible)', h: `
      <p>En <b>Cables</b>, agrega un cable de <code>F15.out</code> a <code>J1.GND</code>: es un corto en la rama de motores. El fusible de 15 A se quema y protege el cable. La lógica sigue viva porque va por el de 10 A.</p>
      <ol><li>Mira en <b>Medidas</b> que el fusible de 15 A dice QUEMADO y los motores quedan sin 18 V.</li>
      <li>Corta tu cable (aparece en el grupo "Tus cables") y en <b>Mandos</b> pulsa <b>Cambiar fusibles y piezas dañadas</b>.</li></ol>
      <p>Otra cosa que puedes probar, como advierte la guía: conectar <code>RELE.VCC</code> directo a <code>E.34</code>, sin el divisor. El ESP32 se quema.</p>`,
      ok: (e, p) => { if (!e.electrico.fusibles.F15) p.quemado = true; return p.quemado && e.electrico.fusibles.F15 && e.electrico.fusibles.F10; } },
    { t: 'Compila tu primer programa para el simulador', h: `
      <p>El ESP32 virtual no hace nada hasta que le cargas un programa, igual que el real. Tu programa está en <code>firmware/motor_control/src/main.cpp</code> y se compila de dos formas: para el ESP32 de verdad y para la PC conectada al simulador.</p>
      <p><b>Una sola vez:</b> el entorno de la PC necesita un compilador de C++ (gcc). En PowerShell:</p>
      ${bloque('Instalar gcc (WinLibs) — PowerShell', 'winget install -e --id BrechtSanders.WinLibs.POSIX.UCRT')}
      <p>Cierra y abre PowerShell y comprueba con <code>gcc --version</code>. Si winget no lo encuentra, corre <code>winget search winlibs</code> y usa el id que salga.</p>
      <p><b>Compilar</b> (PowerShell, en la carpeta del repo):</p>
      ${bloque('Compilar para el simulador', `cd firmware\\motor_control\n${PIO} run -e native\ncd ..\\..`)}
      <p><b>Reinicia el simulador con tu programa</b>: cierra la ventana donde corre (Ctrl+C) y ábrelo así:</p>
      ${bloque('Simulador con tu firmware', 'backend\\.venv\\Scripts\\python.exe sim\\servidor.py --firmware firmware\\motor_control\\.pio\\build\\native\\program.exe')}
      <p>Recarga esta página y enciende el KCD1. En <b>Monitor</b> debe salir "hola, soy el ESP32 del carrito" y el estado del paro cada segundo. Pulsa el paro y mira cómo cambia.</p>
      <p>Para el carrito real es el mismo código: <code>${C(PIO)} run -e esp32dev -t upload</code>.</p>`,
      ok: e => e.firmware.conectado && e.monitor.some(l => /hola/i.test(l)) },
    { t: 'Haz girar una rueda a 30 rpm', h: `
      <p>Los M0601 hablan RS485: tramas de 10 bytes a 115200 baud con un CRC al final. El ESP32 las manda por la UART2 al MAX485, que las pone en los cables A y B.</p>
      <ol><li>Pon el carrito <b>En medio del piso</b> (Mandos), para que no choque.</li>
      <li>Copia este programa en <code>src/main.cpp</code>, compila (<code>pio run -e native</code>) y pulsa <b>Botón EN</b> para que el ESP32 lo cargue.</li></ol>
      ${bloque('src/main.cpp', CODIGO_M0601)}
      <p>Debes ver: la rueda izquierda a ~30 rpm y el carrito girando sobre la rueda derecha (que está frenada en 0). En <b>Medidas</b>, las tramas ok suben 50 por segundo.</p>`,
      ok: (e, p) => { const m = e.motores[0]; if (Math.abs(m.rpm - 30) < 4 && !m.suelto) p.t30 = (p.t30 || e.t); else p.t30 = 0; return p.t30 && e.t - p.t30 > 2; } },
    { t: 'Rueda libre contra freno', h: `
      <p>Si el ESP32 deja de mandar tramas (por ejemplo, se cuelga), el M0601 <b>suelta la rueda</b>: no frena, sigue rodando hasta que la fricción la para. Pruébalo: con la rueda girando, pulsa el paro o pon un <code>delay(3000)</code> en el loop.</p>
      <p>Para frenar de verdad hay que mandar velocidad 0 con el byte de freno en <code>0xFF</code>: <code>velocidad(1, 0, true)</code>. Por eso el watchdog de la guía de navegación manda freno activo en vez de solo callarse.</p>`,
      ok: e => e.motores.some(m => m.freno) },
    { t: 'Una recta de 1 metro', h: `
      <p>Pon el carrito <b>En medio del piso</b>. Las dos ruedas a la misma velocidad hacen una recta. Para saber cuánto avanzó, suma lo que giran las ruedas.</p>
      ${bloque('Cambia el loop() del paso anterior', CODIGO_RECTA)}
      <p>Debes ver "llegué" cerca de 1.000 m y que el carrito se detiene. Mira en <b>Medidas</b> cuánto se movió de verdad: la diferencia es el error de la odometría, el mismo que corrige la prueba del cuadrado de la guía de navegación.</p>`,
      ok: (e, p) => {
        const c = e.carrito;
        if (Math.abs(c.v) > 0.02 && !p.x0) { p.x0 = [c.x - c.v * 0.05 * Math.cos(c.th), c.y - c.v * 0.05 * Math.sin(c.th)]; }
        if (p.x0 && Math.abs(c.v) < 0.003) { const d = Math.hypot(c.x - p.x0[0], c.y - p.x0[1]); p.x0 = null; if (d > 0.95 && d < 1.05) p.recta = true; }
        return p.recta;
      } },
    { t: 'Los cuatro VL53L0X, cada uno en su dirección', h: `
      <p>Los cuatro sensores nacen en la misma dirección I²C (0x29) y chocan en el bus. La solución de la guía: apagar los 3 de obstáculos con XSHUT (GPIO 32, 33 y 15), cambiar primero el de la pila a 0x33 y luego encender uno por uno.</p>
      ${bloque('src/main.cpp (programa aparte para probar los sensores)', CODIGO_VL53)}
      <p>Pon una <b>Persona 1 m enfrente</b> y mira cómo cambia la distancia del frontal en el Monitor.</p>`,
      ok: e => { const d = Object.values(e.esp32.vl53).sort().join(); return d === '48,49,50,51'; } },
    { t: 'Rompe el bus RS485 y encuentra la falla', h: `
      <p>Vuelve a cargar el programa de la rueda (paso 7). Con la rueda girando, en <b>Cables</b> corta <code>h24</code> (A del MAX485 al motor izquierdo).</p>
      <p>Debes ver: la rueda queda libre y las tramas ok dejan de subir, aunque el ESP32 sigue mandando (los envíos al bus siguen subiendo). Ese es el síntoma real de un cable del bus suelto. Después prueba a cruzar A con B y a dejar DE siempre en alto: cada falla tiene su síntoma en <b>Medidas</b>.</p>
      <p>Vuelve a poner el cable con <b>Volver a poner</b>.</p>`,
      ok: (e, p) => { const sin = !S.mundo?.cables.some(c => c.id === 'h24'); if (sin && e.motores[0].suelto && e.esp32.bus.tx_bus > (p.tx || 0)) p.roto = true; p.tx = e.esp32.bus.tx_bus; return p.roto && !sin; } },
    { t: 'La Jetson le habla al ESP32 por USB', h: `
      <p>El USB del ESP32 hacia la Jetson es el puerto 7701 del simulador. Tu código de Python de la Jetson se conecta igual que a un puerto serie de verdad.</p>
      ${bloque('En el ESP32 (agrega al loop)', CODIGO_ECO)}
      ${bloque('En la laptop (PowerShell): instala pyserial una vez', 'backend\\.venv\\Scripts\\python.exe -m pip install pyserial')}
      ${bloque('hola_jetson.py', CODIGO_JETSON)}
      <p>Debes ver "recibí: HB" en el Monitor y en la terminal de Python. Con esto ya puedes construir el protocolo de la guía de navegación (DRV, TRN, APR, ODO, EVT) y probar la ruta en L completa aquí antes de tocar el carrito.</p>`,
      ok: e => e.monitor.some(l => /recib[ií]: ?HB/.test(l)) },
  ];

  let raiz, hechos = new Set();
  try { hechos = new Set(JSON.parse(localStorage.getItem('aether.sim.pasos') || '[]')); } catch (e) {}
  const pistas = PASOS.map(() => ({}));
  function guardar() { try { localStorage.setItem('aether.sim.pasos', JSON.stringify([...hechos])); } catch (e) {} }

  function pintar(el) {
    raiz = el;
    el.innerHTML = `<div class="barra" aria-hidden="true"><i id="progreso" style="width:0"></i></div><p id="progresoT" class="tenue" style="margin-top:4px"></p>` +
      PASOS.map((p, i) => `<details class="paso" id="paso${i}" ${i === 0 ? 'open' : ''}><summary><span class="num">${i + 1}</span><span>${p.t}</span><span class="estado">pendiente</span></summary>
      <div class="cuerpo">${p.h}${p.manual ? `<button class="b" data-manual="${i}">Listo, ya lo recorrí</button>` : ''}</div></details>`).join('');
    el.querySelectorAll('[data-copiar]').forEach(b => b.onclick = () => {
      navigator.clipboard.writeText(b.parentElement.nextElementSibling.textContent); b.textContent = 'Copiado'; setTimeout(() => (b.textContent = 'Copiar'), 1200);
    });
    el.querySelectorAll('[data-manual]').forEach(b => b.onclick = () => { hechos.add(+b.dataset.manual); guardar(); actualizar(); });
    actualizar();
  }
  function actualizar() {
    PASOS.forEach((p, i) => {
      const d = raiz.querySelector('#paso' + i); const h = hechos.has(i);
      d.classList.toggle('hecho', h); d.querySelector('.estado').textContent = h ? '✓ logrado' : 'pendiente';
    });
    raiz.querySelector('#progreso').style.width = (hechos.size / PASOS.length * 100) + '%';
    raiz.querySelector('#progresoT').textContent = `${hechos.size} de ${PASOS.length} pasos logrados`;
  }
  function revisar(e) {
    if (!raiz) return;
    let cambio = false;
    PASOS.forEach((p, i) => {
      if (hechos.has(i) || !p.ok) return;
      try { if (p.ok(e, pistas[i])) { hechos.add(i); cambio = true; const sig = raiz.querySelector('#paso' + (i + 1)); if (sig) sig.open = true; } } catch (err) {}
    });
    if (cambio) { guardar(); actualizar(); }
  }
  return { pintar, revisar };
})();
