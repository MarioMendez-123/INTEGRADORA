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

function montar(archivo, ids, respuestaConfig, retrasoMs = 0, rapido = false) {
  const elementos = {};
  const fetches = [];
  const escuchas = {};
  const ctx = {
    console, setTimeout: rapido ? (fn) => { fn(); return 1; } : setTimeout, clearTimeout, URLSearchParams, Promise, Date, JSON, Math, RegExp, URL,
    location: { href: 'http://laptop:8000/', origin: 'http://laptop:8000' },
    document: {
      getElementById: (id) => (elementos[id] ||= new Elemento()),
      addEventListener: (ev, fn) => { (escuchas[ev] ||= []).push(fn); }, fullscreenElement: null, exitFullscreen() {},
    },
    fetch: (u) => {
      fetches.push(String(u));
      return new Promise((resolver, rechazar) => setTimeout(() => (respuestaConfig === 'error' ? rechazar(new Error('sin red')) : resolver({ ok: true, json: async () => respuestaConfig })), retrasoMs));
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(carpeta, 'stream-errors.js'), 'utf8'), ctx, { filename: 'stream-errors.js' });
  vm.runInContext(fs.readFileSync(path.join(carpeta, archivo), 'utf8'), ctx, { filename: archivo });
  const violacion = (blockedURI, violatedDirective = "img-src 'self' data: blob:") =>
    (escuchas.securitypolicyviolation || []).forEach((fn) => fn({ blockedURI, violatedDirective }));
  return { elementos, fetches, violacion };
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (c, m) => { if (!c) throw new Error(m); };

const casos = [
  ['camera-stream.js', 'camera-start', 'camera-stream', 'perception', '/perception/stream', 'camera-placeholder-text'],
  ['line-vision.js', 'line-vision-start', 'line-vision-stream', 'line_vision', '/line/vision/stream', 'line-vision-placeholder-text'],
];

(async () => {
  for (const [archivo, idBoton, idImg, clave, rutaLocal, idTexto] of casos) {
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

    const agente = { v: 1, [clave]: { stream_url: 'http://127.0.0.1:8001/stream' } };
    const errores = [
      ['CSP bloquea el origen del agente -> mensaje de bloqueo inmediato, sin reintentos', agente, (m) => {
        m.violacion('http://127.0.0.1:8001/stream');
        m.elementos[idImg].handlers.error[0]();
        const t = m.elementos[idTexto].textContent;
        ok(t.includes('política de seguridad') && t.includes('NO por la cámara') && t.includes('http://127.0.0.1:8001'), 'texto: ' + t);
        ok(!t.includes('/health'), 'un bloqueo no debe mandar a revisar /health');
        ok(m.elementos[idImg].src === '', 'debe detener el video, no reintentar');
      }],
      ['agente que no responde (sin bloqueo) -> dice agente y /health, no CSP', agente, (m) => {
        for (let i = 0; i < 4; i++) m.elementos[idImg].handlers.error[0]();
        const t = m.elementos[idTexto].textContent;
        ok(t.includes('el agente no responde') && t.includes('http://127.0.0.1:8001/health'), 'texto: ' + t);
        ok(!t.includes('política de seguridad'), 'no debe hablar de CSP');
      }],
      ['cámara local que falla -> el texto de siempre', 'error', (m) => {
        for (let i = 0; i < 4; i++) m.elementos[idImg].handlers.error[0]();
        const t = m.elementos[idTexto].textContent;
        ok(t.startsWith('No se pudo conectar con la cámara después de varios intentos'), 'texto: ' + t);
        ok(!t.includes('política de seguridad') && !t.includes('/health'), 'texto: ' + t);
      }],
      ['un bloqueo de OTRO origen no explica el fallo del agente', agente, (m) => {
        m.violacion('http://10.9.9.9:1/imagen.png');
        for (let i = 0; i < 4; i++) m.elementos[idImg].handlers.error[0]();
        const t = m.elementos[idTexto].textContent;
        ok(t.includes('el agente no responde') && !t.includes('política de seguridad'), 'texto: ' + t);
      }],
      ['una violación de otra directiva (script-src) no cuenta', agente, (m) => {
        m.violacion('http://127.0.0.1:8001/stream', "script-src 'self'");
        for (let i = 0; i < 4; i++) m.elementos[idImg].handlers.error[0]();
        ok(!m.elementos[idTexto].textContent.includes('política de seguridad'), 'tomó script-src como img-src');
      }],
    ];
    for (const [nombre, config, comprobar] of errores) {
      try {
        const m = montar(archivo, null, config, 0, true);
        m.elementos[idBoton].handlers.click[0]();
        await esperar(30);
        comprobar(m);
        console.log(`✔ ${archivo}: ${nombre}`);
      } catch (e) {
        console.log(`✘ ${archivo}: ${nombre}: ${e.message}`);
        process.exitCode = 1;
      }
    }
  }
  process.exit(process.exitCode || 0);
})();
