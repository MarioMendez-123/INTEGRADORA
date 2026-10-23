// Prueba de camera-stream.js y line-vision.js (dirección base del video) en Node, con un DOM SIMULADO: no es un navegador real.
// Uso:  node tests/dashboard/probar_streams_js.js dashboard      (sale con código 1 si algo falla)
const fs = require('fs'), vm = require('vm'), path = require('path');
const carpeta = process.argv[2] || 'dashboard';

class Elemento {
  constructor() { this.src = ''; this.hidden = false; this.textContent = ''; this.handlers = {}; this.classList = { add() {}, remove() {}, toggle() {} }; this.style = {}; }
  addEventListener(ev, fn) { (this.handlers[ev] ||= []).push(fn); }
  removeAttribute(n) { if (n === 'src') this.src = ''; }
  requestFullscreen() {}
}

function montar(archivo, ids, respuestaConfig, retrasoMs = 0) {
  const elementos = {};
  const fetches = [];
  const ctx = {
    console, setTimeout, clearTimeout, URLSearchParams, Promise, Date, JSON, Math, RegExp,
    document: {
      getElementById: (id) => (elementos[id] ||= new Elemento()),
      addEventListener() {}, fullscreenElement: null, exitFullscreen() {},
    },
    fetch: (u) => {
      fetches.push(String(u));
      return new Promise((resolver, rechazar) => setTimeout(() => (respuestaConfig === 'error' ? rechazar(new Error('sin red')) : resolver({ ok: true, json: async () => respuestaConfig })), retrasoMs));
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(carpeta, archivo), 'utf8'), ctx, { filename: archivo });
  return { elementos, fetches };
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (c, m) => { if (!c) throw new Error(m); };

const casos = [
  ['camera-stream.js', 'camera-start', 'camera-stream', 'perception', '/perception/stream'],
  ['line-vision.js', 'line-vision-start', 'line-vision-stream', 'line_vision', '/line/vision/stream'],
];

(async () => {
  for (const [archivo, idBoton, idImg, clave, rutaLocal] of casos) {
    const escenarios = [
      ['sin respuesta de /config/agents -> cámara local de siempre', 'error', 0, `${rutaLocal}?retry=0`],
      ['agente configurado -> el video sale del agente', { v: 1, [clave]: { stream_url: 'http://127.0.0.1:8001/stream' } }, 0, 'http://127.0.0.1:8001/stream?retry=0'],
      ['agente sin configurar (null) -> local', { v: 1, [clave]: { stream_url: null } }, 0, `${rutaLocal}?retry=0`],
      ['esquema peligroso (javascript:) -> se ignora', { v: 1, [clave]: { stream_url: 'javascript:alert(1)' } }, 0, `${rutaLocal}?retry=0`],
      ['versión desconocida del contrato -> se ignora', { v: 2, [clave]: { stream_url: 'http://127.0.0.1:8001/stream' } }, 0, `${rutaLocal}?retry=0`],
      ['la configuración tarda: el clic espera a que llegue', { v: 1, [clave]: { stream_url: 'http://10.4.5.103:8001/stream' } }, 150, 'http://10.4.5.103:8001/stream?retry=0'],
    ];
    for (const [nombre, config, retraso, esperado] of escenarios) {
      try {
        const { elementos, fetches } = montar(archivo, null, config, retraso);
        ok(fetches.includes('/config/agents'), 'no pidió /config/agents');
        elementos[idBoton].handlers.click[0]();
        await esperar(retraso + 50);
        ok(elementos[idImg].src === esperado, `src=${JSON.stringify(elementos[idImg].src)} esperado=${esperado}`);
        console.log(`✔ ${archivo}: ${nombre}`);
      } catch (e) {
        console.log(`✘ ${archivo}: ${nombre}: ${e.message}`);
        process.exitCode = 1;
      }
    }
  }
  process.exit(process.exitCode || 0);
})();
