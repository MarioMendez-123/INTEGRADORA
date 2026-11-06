// Pruebas del núcleo en JavaScript y del firmware de referencia (node --test sim/pruebas).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function cargar() {
  const ctx = { console, Math, Object, Array, Set, Map, JSON, Number, String, Error, Infinity };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  const web = path.join(__dirname, '..', 'web');
  for (const f of ['placa_datos.js', 'nucleo.js', 'firmware_ref.js']) vm.runInContext(fs.readFileSync(path.join(web, f), 'utf8') + (f === 'placa_datos.js' ? '\nglobalThis.PLACA = PLACA;' : ''), ctx);
  return ctx;
}

function mundo() {
  const g = cargar(), sim = new g.AetherSim.Simulacion(g.PLACA);
  const fw = new g.AetherFirmware.FirmwareEsp32(sim), log = [];
  const jet = new g.AetherFirmware.Jetson(sim, t => log.push(t));
  const correr = seg => {
    for (let i = 0; i < seg * 1000; i++) {
      sim.p(0.001); fw.paso();
      while (sim.esp.usbTx.length) { const l = sim.esp.usbTx.shift(); jet.recibir(l); if (!/^(ODO|MOT|RNG|PWR)/.test(l)) log.push(l); }
      jet.paso_();
    }
  };
  return { g, sim, fw, jet, log, correr };
}

test('energía como en la guía', () => {
  const { sim } = mundo();
  sim.c.kcd1 = true; sim.c.evaluar();
  const e = sim.c.estado();
  assert.strictEqual(e.v.xl4005, 5.05); assert.strictEqual(e.v.elevador, 18); assert.ok(e.esp32_vivo);
  assert.ok(e.v.gpio34 > 2.0 && e.v.gpio34 < 2.4, e.v.gpio34);
});

test('conexiones de la guía 3.21', () => {
  const { g, sim } = mundo();
  assert.strictEqual(g.PLACA.cables.length, 103);
  sim.c.kcd1 = true; sim.c.evaluar();
  assert.strictEqual(sim.c.estado().v.elevador, 18); assert.ok(sim.c.dif('VM.+', 'VM.-') > 12);
  sim.c.conectar('F10.out', 'BAT.-');
  assert.ok(!sim.c.fusOk.F10 && sim.c.avisos.some(a => a.includes('fusible 5 A')), sim.c.avisos.join());
});

test('ruta en L: banda → descarga → banda, acoplando en las dos', () => {
  const { g, sim, jet, log, correr } = mundo();
  sim.c.kcd1 = true; correr(1.0);
  assert.ok(log.some(l => /ESP32 listo: sensores ok, IMU ok/.test(l)), log.join('\n'));
  jet.mision('ida', g.AetherFirmware.rutaIda(), [0, 0, 0]);
  correr(80);
  assert.ok(log.some(l => /misión terminada/.test(l)), log.join('\n'));
  const c = sim.car;
  assert.ok(Math.abs(c.x - -3.82) < 0.05 && Math.abs(c.y - 2.0) < 0.03, `descarga: ${c.x.toFixed(3)}, ${c.y.toFixed(3)}`);
  log.length = 0;
  jet.mision('vuelta', g.AetherFirmware.rutaVuelta(), [-3.82, 2.0, Math.PI / 2]);
  correr(80);
  assert.ok(log.some(l => /misión terminada/.test(l)), log.join('\n'));
  assert.ok(Math.abs(c.x) < 0.01 && Math.abs(c.y) < 0.005, `banda: ${c.x.toFixed(3)}, ${c.y.toFixed(3)}`);
});

test('con A y B cruzados el carrito no se mueve', () => {
  const { g, sim, jet, correr } = mundo();
  for (const id of ['h24', 'h26']) sim.c.cortar(id);
  sim.c.conectar('J3.A', 'ML.B'); sim.c.conectar('J3.B', 'ML.A');
  sim.c.kcd1 = true; correr(1.0);
  jet.mision('ida', g.AetherFirmware.rutaIda(), [0, 0, 0]);
  correr(8);
  assert.ok(Math.hypot(sim.car.x, sim.car.y) < 0.005);
});

test('el paro detiene la misión y avisa', () => {
  const { g, sim, jet, log, correr } = mundo();
  sim.c.kcd1 = true; correr(1.0);
  jet.mision('ida', g.AetherFirmware.rutaIda(), [0, 0, 0]);
  correr(5); sim.c.paro = true; sim.c.evaluar(); correr(2);
  assert.ok(log.some(l => /FAULT paro/.test(l)), log.join('\n'));
  assert.ok(Math.abs(sim.car.v) < 0.02);
});
