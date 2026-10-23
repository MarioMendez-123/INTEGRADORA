// Prueba de robot.js (puente de voz y dirección del video) en Node, con un DOM SIMULADO: no es un navegador real.
// Uso:  node tests/dashboard/probar_robot_voz.js dashboard/robot.js     (sale con código 1 si algo falla)
const fs = require('fs'), vm = require('vm');
const codigo = fs.readFileSync(process.argv[2], 'utf8');

function crear({ search, conReconocimiento }) {
  const registro = { sockets: [], logs: [], fetches: [], reconocimientoIniciado: 0 };
  const stub = () => new Proxy(function () {}, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : k === 'length' ? 0 : stub()),
    apply: () => stub(), construct: () => stub(), set: () => true,
  });
  class WS {
    constructor(url) { this.url = url; this.readyState = 0; this.enviados = []; registro.sockets.push(this); }
    send(m) { this.enviados.push(m); }
    close() {}
    abrir() { this.readyState = 1; if (this.onopen) this.onopen(); }
    recibir(obj) { if (this.onmessage) this.onmessage({ data: JSON.stringify(obj) }); }
  }
  WS.OPEN = 1;
  class Reconocimiento {
    constructor() { this.start = () => { registro.reconocimientoIniciado++; }; this.stop = () => {}; }
    addEventListener() {}
  }
  const doc = stub();
  const ctx = {
    console: { log: (...a) => registro.logs.push(a.join(' ')), warn: (...a) => registro.logs.push('WARN ' + a.join(' ')), error: (...a) => registro.logs.push('ERROR ' + a.join(' ')) },
    document: doc, WebSocket: WS, URLSearchParams, setTimeout, clearTimeout, setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: () => 0, cancelAnimationFrame: () => {}, performance: { now: () => Date.now() },
    fetch: (u) => { registro.fetches.push(String(u)); return Promise.reject(new Error('sin red en la prueba')); },
    Audio: function () { return stub(); }, SpeechSynthesisUtterance: function () { return stub(); },
    navigator: { permissions: { query: () => Promise.reject(new Error('x')) }, mediaDevices: undefined },
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    Date, Math, JSON, Promise, Error, RegExp, Map, Set, Array, Object, String, Number, Boolean, parseInt, parseFloat, isNaN,
    location: { search, protocol: 'http:', host: 'laptop:8000', hostname: 'laptop', href: 'http://laptop:8000/robot.html' },
    speechSynthesis: { cancel() {}, speak() {}, getVoices: () => [], addEventListener() {} },
    prefersReducedMotion: false, addEventListener() {}, removeEventListener() {}, localStorage: { getItem: () => null, setItem() {} },
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  if (conReconocimiento) ctx.SpeechRecognition = Reconocimiento;
  vm.createContext(ctx);
  return { ctx, registro };
}

async function caso(nombre, opciones, comprobar) {
  const { ctx, registro } = crear(opciones);
  try { vm.runInContext(codigo, ctx, { filename: 'robot.js' }); }
  catch (e) { console.log(`✘ ${nombre}: robot.js lanzó ${e.message}`); process.exitCode = 1; return; }
  try { await comprobar(ctx, registro); console.log(`✔ ${nombre}`); }
  catch (e) { console.log(`✘ ${nombre}: ${e.message}`); process.exitCode = 1; }
}
const ok = (c, m) => { if (!c) throw new Error(m); };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await caso('sin reconocimiento del navegador: se conecta al canal de voz como oyente', { search: '', conReconocimiento: false }, async (ctx, r) => {
    const voz = r.sockets.filter((s) => s.url.includes('/voice/ws'));
    ok(voz.length === 1, `sockets de voz: ${voz.length}`);
    ok(voz[0].url === 'ws://laptop:8000/voice/ws?role=listener', 'url ' + voz[0].url);
    voz[0].abrir();
    voz[0].recibir({ v: 1, type: 'status', state: 'active', t: 'x' });
    ok(vm.runInContext('voiceAvailable', ctx) === true, 'status active debe marcar la voz disponible');
    voz[0].recibir({ v: 1, type: 'transcript', text: 'Hola Mundo', t: 'x' });
    await esperar(900);
    ok(r.logs.some((l) => l.includes('escuchado') && l.includes('hola mundo')), 'el texto no llegó a queueVoiceFragment: ' + JSON.stringify(r.logs.slice(-4)));
    vm.runInContext('notifyBridgeSpeaking(true)', ctx);
    ok(voz[0].enviados.length === 1 && JSON.parse(voz[0].enviados[0]).type === 'speaking' && JSON.parse(voz[0].enviados[0]).value === true, 'no avisó speaking');
    voz[0].recibir({ v: 2, type: 'transcript', text: 'ignorada', t: 'x' });
    voz[0].recibir('basura');
    await esperar(900);
    ok(!r.logs.some((l) => l.includes('ignorada')), 'aceptó una versión desconocida');
    voz[0].recibir({ v: 1, type: 'status', state: 'off', t: 'x' });
    ok(vm.runInContext('voiceAvailable', ctx) === false, 'status off debe marcarla no disponible');
  });

  await caso('con reconocimiento del navegador (Chrome): NO usa el canal de voz y arranca el reconocimiento de siempre', { search: '', conReconocimiento: true }, async (ctx, r) => {
    ok(r.sockets.filter((s) => s.url.includes('/voice/ws')).length === 0, 'abrió el canal de voz sin necesitarlo');
    ok(r.reconocimientoIniciado >= 1, 'no arrancó el reconocimiento del navegador');
    vm.runInContext('notifyBridgeSpeaking(true)', ctx); // sin puente no debe fallar ni enviar
  });

  await caso('con ?voz=servicio en Chrome: usa el canal y NO arranca el reconocimiento del navegador', { search: '?voz=servicio', conReconocimiento: true }, async (ctx, r) => {
    ok(r.sockets.filter((s) => s.url.includes('/voice/ws')).length === 1, 'no abrió el canal de voz');
    ok(r.reconocimientoIniciado === 0, 'arrancó los dos orígenes de voz a la vez');
    ok(vm.runInContext('voiceAvailable', ctx) === false, 'no debe marcarse disponible hasta que el servicio lo diga');
  });

  await caso('el puente reconecta si el socket se cae', { search: '', conReconocimiento: false }, async (ctx, r) => {
    const antes = r.sockets.filter((s) => s.url.includes('/voice/ws'));
    antes[0].onclose();
    await esperar(2300);
    ok(r.sockets.filter((s) => s.url.includes('/voice/ws')).length === 2, 'no reconectó');
  });

  await caso('la cámara usa /perception/stream mientras /config/agents no diga otra cosa', { search: '', conReconocimiento: true }, async (ctx, r) => {
    ok(r.fetches.some((u) => u.includes('/config/agents')), 'no pidió /config/agents');
    ok(vm.runInContext('cameraUrl', ctx) === '/perception/stream', 'cameraUrl cambió sin configuración');
  });
  process.exit(process.exitCode || 0);
})();
