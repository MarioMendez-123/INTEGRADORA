// Simulador del carrito en el navegador (teléfono o computadora). Corre solo: núcleo (nucleo.js),
// firmware del ESP32 y programa de la Jetson (firmware_ref.js). El modo gemelo se conecta a sim/puente_real.py.
'use strict';
const $ = id => document.getElementById(id);
const { P, Simulacion } = AetherSim;
const { FirmwareEsp32, Jetson, rutaIda, rutaVuelta } = AetherFirmware;
const DEFECTO = { ...P };
let sim, fw, jet, rapidez = 1;
const registro = [];
const ultimas = {};             // última línea de cada tipo que mandó el ESP32 (ODO, RNG, PWR, MOT)

function anotar(t) { registro.push(`${sim ? sim.t.toFixed(1).padStart(6) : ''}  ${t}`); if (registro.length > 400) registro.splice(0, 100); pintarRegistro = true; }
function nuevo() {
  sim = new Simulacion(PLACA); sim.colocar(0, 0, 0);
  fw = new FirmwareEsp32(sim); jet = new Jetson(sim, anotar);
}
nuevo();

// ------------------------------------------------------------------ bucle de simulación
let tPrev = performance.now(), pintarRegistro = false, cuadro = 0;
function bucle(ahora) {
  const dt = Math.min(0.05, (ahora - tPrev) / 1000) * rapidez; tPrev = ahora;
  const n = Math.round(dt / 0.001);
  for (let i = 0; i < n; i++) {
    sim.p(0.001); fw.paso();
    while (sim.esp.usbTx.length) {
      const l = sim.esp.usbTx.shift(); jet.recibir(l);
      const tipo = l.split(' ')[0];
      if (['ODO', 'RNG', 'PWR', 'MOT'].includes(tipo)) ultimas[tipo] = l; else anotar(`ESP32 → ${l}`);
    }
    jet.paso_();
    joystickPaso();
  }
  for (const ev of sim.eventos.splice(0)) anotar(ev === 'encendido' ? 'El ESP32 recibió energía y arrancó su programa' : 'El ESP32 se quedó sin energía');
  dibujarPlano();
  if (vista3d.listo) vista3d.actualizar();
  if (++cuadro % 8 === 0) pintarTodo();
  requestAnimationFrame(bucle);
}

// ------------------------------------------------------------------ pestañas
document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  document.querySelectorAll('nav button').forEach(x => x.setAttribute('aria-selected', x === b));
  document.querySelectorAll('.panel').forEach(p => (p.hidden = p.id !== 'p-' + b.dataset.p));
  pintarTodo();
});

// ------------------------------------------------------------------ manejar
$('bKcd1').onclick = () => { sim.c.kcd1 = !sim.c.kcd1; sim.c.evaluar(); anotar(sim.c.kcd1 ? 'KCD1 encendido' : 'KCD1 apagado'); };
$('bParo').onclick = () => { sim.c.paro = !sim.c.paro; sim.c.evaluar(); anotar(sim.c.paro ? 'Paro PRESIONADO' : 'Paro suelto'); };
$('bIda').onclick = () => { jet.mision('banda → descarga', rutaIda(), [0, 0, 0]); };
$('bVuelta').onclick = () => { jet.mision('descarga → banda', rutaVuelta(), [-3.82, 2.0, Math.PI / 2]); };
$('bDetener').onclick = () => jet.detener();
$('bRearme').onclick = () => { jet.enviar('REARME'); };
$('vmax').oninput = e => { $('vmaxV').textContent = (+e.target.value).toFixed(2) + ' m/s'; jet.enviar('VMAX ' + e.target.value); };
document.querySelectorAll('[data-colocar]').forEach(b => b.onclick = () => { const [x, y, th] = b.dataset.colocar.split(',').map(Number); sim.colocar(x, y, th); jet.pose = [x, y, th]; jet.s = null; });
$('bPersona').onclick = () => { const c = sim.car; sim.extra.push(AetherSim.caja(c.x + 1.2 * Math.cos(c.th), c.y + 1.2 * Math.sin(c.th), 0.15, 0.25, c.th, 'persona', 1.7)); anotar('Pusiste una persona 1.2 m enfrente del carrito'); };
$('bQuitar').onclick = () => { sim.extra = []; };
$('bRapido').onclick = e => { rapidez = rapidez === 1 ? 2 : rapidez === 2 ? 4 : 1; e.target.textContent = `Velocidad ${rapidez}×`; };

const pad = { activo: false, x: 0, y: 0, tEnvio: 0 };
const padEl = $('pad');
function padMover(ev) {
  const r = padEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width / 2 - 27;
  let dx = ev.clientX - cx, dy = ev.clientY - cy; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; }
  pad.x = dx / R; pad.y = -dy / R; padEl.firstElementChild.style.transform = `translate(${dx}px, ${dy}px)`;
}
padEl.addEventListener('pointerdown', e => { pad.activo = true; padEl.setPointerCapture(e.pointerId); padMover(e); });
padEl.addEventListener('pointermove', e => pad.activo && padMover(e));
const padSoltar = () => { pad.activo = false; pad.x = pad.y = 0; padEl.firstElementChild.style.transform = ''; };
padEl.addEventListener('pointerup', padSoltar); padEl.addEventListener('pointercancel', padSoltar);
function joystickPaso() {
  if (!pad.activo || sim.t - pad.tEnvio < 0.1) return;
  pad.tEnvio = sim.t;
  const vmax = +$('vmax').value, v = pad.y * vmax, w = -pad.x * 1.2, b = AetherSim.VIA;
  jet.enviar('HB'); jet.enviar(`MAN ${(v - w * b / 2).toFixed(3)} ${(v + w * b / 2).toFixed(3)}`);
}

// ------------------------------------------------------------------ parámetros físicos y eléctricos
const FISICA = [
  ['masa', 'Masa total del carrito', 20, 60, 1, 'kg', v => v.toFixed(0), 'Con la torre llena pesa más: arranca y frena más lento.'],
  ['mu', 'Agarre de las llantas (μ)', 0.15, 1.0, 0.05, '', v => v.toFixed(2), '0.2 = piso mojado o pulido, 0.7 = hule en concreto. Con poco agarre las ruedas patinan.'],
  ['normal', 'Fuerza del resorte en cada rueda motriz', 30, 140, 5, 'N', v => v.toFixed(0), 'La guía da ~85 N (resorte comprimido 28 mm). Menos fuerza = menos agarre.'],
  ['crr', 'Resistencia a rodar', 0.005, 0.1, 0.005, '', v => v.toFixed(3), 'Rodajas duras en piso liso ≈ 0.02; alfombra o rodajas con freno puesto, más.'],
  ['giroRodajas', 'Freno de las rodajas al girar', 0, 3, 0.1, 'N·m', v => v.toFixed(1), 'Lo que cuesta que las rodajas se orienten cuando el carrito gira en su lugar.'],
  ['derivaImu', 'Deriva del BNO055', 0, 3, 0.1, '°/min', v => v.toFixed(1), 'Cuánto se desvía el rumbo con el tiempo. Con deriva, las rectas largas se tuercen.'],
  ['ruidoVl', 'Ruido de los VL53L0X', 0, 0.08, 0.005, '', v => (v * 100).toFixed(1) + ' %', 'Error de la distancia medida, como porcentaje de la distancia.'],
];
const ELECTRICO = [
  ['carga', 'Carga de la batería', 0, 100, 1, '%', v => v.toFixed(0) + ' %', 'BR-1224 de plomo: 12.9 V llena, ~11.8 V vacía. Con poca carga el elevador no llega a 18 V.'],
  ['rInterna', 'Resistencia interna de la batería', 0.005, 0.2, 0.005, 'Ω', v => (v * 1000).toFixed(0) + ' mΩ', 'Hace que el voltaje caiga cuando los motores jalan corriente. Una batería vieja tiene más.'],
  ['vXl', 'Ajuste del XL4005', 4.0, 8.0, 0.05, 'V', v => v.toFixed(2) + ' V', 'La guía pide 5.0–5.1 V. Por debajo de 4.3 V el ESP32 se reinicia; arriba de 6.5 V se quema.'],
  ['vElev', 'Ajuste del elevador (ruedas)', 12, 24, 0.5, 'V', v => v.toFixed(1) + ' V', 'La guía pide 18.0 V. Con menos voltaje los M0601 giran más lento; abajo de 12 V no arrancan.'],
  ['fus15', 'Fusible de la rama de motores', 3, 20, 1, 'A', v => v.toFixed(0) + ' A', 'La guía usa 15 A. Uno chico se quema al arrancar con carga.'],
  ['fus10', 'Fusible de la lógica y la Jetson', 2, 15, 1, 'A', v => v.toFixed(0) + ' A', 'La guía usa 10 A.'],
  ['iJetson', 'Consumo de la Jetson', 0.3, 2.5, 0.1, 'A', v => v.toFixed(1) + ' A', 'A 12 V. En modo de 25 W con YOLO jala más.'],
  ['rpmVacio', 'M0601: rpm en vacío a 18 V', 120, 260, 5, 'rpm', v => v.toFixed(0), 'Hoja: 200 rpm.'],
  ['parNominal', 'M0601: par nominal', 0.4, 1.6, 0.02, 'N·m', v => v.toFixed(2), 'Hoja: 0.96 N·m a 115 rpm.'],
  ['tSinTrama', 'M0601: tiempo sin tramas antes de soltar la rueda', 0.02, 0.3, 0.01, 's', v => (v * 1000).toFixed(0) + ' ms', 'Supuesto (falta medirlo). El ESP32 manda cada 20 ms.'],
];
function panelParametros(el, lista, titulo) {
  el.innerHTML = `<p>${titulo}</p>` + lista.map(([k, n, min, max, paso, , fmt, ayuda]) => `<div class="par"><label for="pr-${k}">${n}</label><output id="o-${k}"></output>
    <input type="range" id="pr-${k}" min="${min}" max="${max}" step="${paso}"><small>${ayuda}</small></div>`).join('') +
    `<div class="fila" style="margin-top:12px"><button class="b" type="button" data-defecto>Volver a los valores de la guía</button></div>`;
  for (const [k, , , , , , fmt] of lista) {
    const inp = $('pr-' + k), out = $('o-' + k);
    const leer = () => (k === 'carga' ? 100 * (1 - sim.c.ah / P.ahBat) : P[k]);
    inp.value = leer(); out.textContent = fmt(+inp.value);
    inp.oninput = () => { const v = +inp.value; if (k === 'carga') sim.c.ah = (1 - v / 100) * P.ahBat; else P[k] = v; out.textContent = fmt(v); sim.c.evaluar(); };
  }
  el.querySelector('[data-defecto]').onclick = () => { for (const [k] of lista) { if (k === 'carga') sim.c.ah = 0; else P[k] = DEFECTO[k]; } panelParametros(el, lista, titulo); sim.c.evaluar(); };
}
panelParametros($('p-fisica'), FISICA, 'Mueve un valor y mira cómo cambia el manejo. Lo que dice "guía" sale de la guía de armado; lo demás es estimado hasta medir el carrito.');
panelParametros($('p-electrico'), ELECTRICO, 'Voltajes, protecciones y motores. Mira el efecto en la pestaña Medidas y en el registro.');

// ------------------------------------------------------------------ fallas de cableado
const FALLAS = [
  ['aSuelto', 'Cable A del RS485 suelto', 'El ESP32 manda tramas pero el motor izquierdo no las recibe: queda suelto.', c => c.cortar('h24')],
  ['abCruzados', 'A y B cruzados', 'Los bits llegan al revés: ningún motor entiende nada.', c => { c.cortar('h24'); c.cortar('h26'); c.conectar('J3.A', 'ML.B'); c.conectar('J3.B', 'ML.A'); }],
  ['deSuelto', 'DE del MAX485 sin conectar', 'El MAX485 nunca transmite: el bus queda callado.', c => c.cortar('p69')],
  ['maxSinTierra', 'MAX485 sin tierra (cables 59 y 60)', 'El módulo queda sin referencia y no funciona.', c => { c.cortar('p59'); c.cortar('p60'); }],
  ['sdaSuelto', 'SDA del I²C suelto', 'Los VL53L0X y el BNO055 no contestan: el ESP32 avisa y no se puede navegar.', c => c.cortar('p75')],
  ['paroRoto', 'Cable del paro roto', 'Con un paro NC, un cable roto se ve como "presionado": el relé nunca cierra. Es la idea de usar NC.', c => c.cortar('h9')],
  ['sinDivisor', 'Paro sin divisor: 12 V al GPIO 34', 'El error que advierte la guía: el ESP32 se quema.', c => { c.cortar('h19'); c.conectar('RELE.VCC', 'E.34'); }],
  ['cortoMotores', 'Corto en la rama de motores', 'Se quema el fusible de 15 A; la lógica sigue viva por el de 10 A.', c => c.conectar('F15.out', 'J1.GND')],
  ['tierraBat', 'Tierra de la batería floja', 'Todo se apaga.', c => c.cortar('h3')],
  ['mismoLado', 'Dos M0601 del mismo lado', 'Error de compra que advierte la guía: una rueda gira al revés y el carrito gira en su lugar.', null],
];
const activas = new Set();
function aplicarFallas() {
  sim.c.reiniciar();
  for (const [k, , , f] of FALLAS) if (activas.has(k) && f) f(sim.c);
  sim.md.invertido = activas.has('mismoLado');
  sim.c.evaluar();
}
$('p-fallas').innerHTML = '<p>Activa una falla y mira qué pasa. Son errores reales de armado; cada una cambia los cables del circuito simulado.</p>' +
  FALLAS.map(([k, n, ayuda]) => `<label class="falla"><input type="checkbox" id="f-${k}"><span>${n}</span><small>${ayuda}</small></label>`).join('') +
  '<div class="fila" style="margin-top:12px"><button class="b" type="button" id="bReparar">Quitar fallas y cambiar piezas dañadas</button></div>';
for (const [k, n] of FALLAS) $('f-' + k).onchange = e => { e.target.checked ? activas.add(k) : activas.delete(k); aplicarFallas(); anotar(`${e.target.checked ? 'Falla activada' : 'Falla quitada'}: ${n}`); };
$('bReparar').onclick = () => { activas.clear(); FALLAS.forEach(([k]) => ($('f-' + k).checked = false)); sim.c.reparar(); aplicarFallas(); anotar('Cableado de la guía, fusibles nuevos y piezas cambiadas'); };

// ------------------------------------------------------------------ medidas y HUD
const f2 = (v, u, d = 2) => v === null || v === undefined ? '<span class="tenue">—</span>' : `${(+v).toFixed(d)} ${u}`;
function pintarTodo() {
  const e = sim.estado(), el = e.electrico, v = el.v;
  $('bKcd1').classList.toggle('on', el.kcd1); $('bKcd1').textContent = el.kcd1 ? 'Apagar (KCD1)' : 'Encender (KCD1)';
  $('bParo').classList.toggle('on', el.paro); $('bParo').textContent = el.paro ? 'Soltar el paro' : 'Paro de emergencia';
  const chips = [[`${f2(v.bateria, 'V', 1)}`, ''], [`5 V: ${f2(v.xl4005, 'V')}`, v.xl4005 > 4.8 ? 'ok' : ''], [`Ruedas: ${f2(v.elevador, 'V', 1)}`, v.elevador > 17 ? 'ok' : ''],
    [e.esp32.vivo ? 'ESP32 vivo' : 'ESP32 apagado', e.esp32.vivo ? 'ok' : 'av'], [`${e.carrito.v.toFixed(2)} m/s`, '']];
  if (!el.fusibles.F15 || !el.fusibles.F10) chips.push(['Fusible quemado', 'mal']);
  if (Object.keys(el.danos).length) chips.push(['Pieza dañada', 'mal']);
  if (fw.falla) chips.push(['FALLA_PARO: rearmar', 'mal']);
  if (gem.ws && gem.ws.readyState === 1) chips.push(['Gemelo conectado', 'ok']);
  $('hud').innerHTML = chips.map(([t, c]) => `<span class="chip ${c}">${t}</span>`).join('');
  if (!$('p-medidas').hidden) {
    const danos = Object.values(el.danos).map(t => `<li class="mal">${t}</li>`).join('') + el.avisos.map(t => `<li>${t}</li>`).join('');
    $('p-medidas').innerHTML = (danos ? `<div class="alerta"><ul>${danos}</ul></div>` : '') +
      `<div class="dos"><div class="dato"><b>Batería</b><span>${f2(v.bateria, 'V')}</span></div><div class="dato"><b>Corriente</b><span>${el.corrientes.bat.toFixed(2)} A</span></div>
      <div class="dato"><b>XL4005</b><span>${f2(v.xl4005, 'V')}</span></div><div class="dato"><b>Elevador</b><span>${f2(v.elevador, 'V')}</span></div>
      <div class="dato"><b>GPIO 34 (paro)</b><span>${f2(v.gpio34, 'V')}</span></div><div class="dato"><b>3V3 ESP32</b><span>${f2(v.esp32_3v3, 'V')}</span></div></div>
      <h2>Protecciones</h2><table><tr><td>Fusible motores (${P.fus15} A)</td><td class="n">${el.fusibles.F15 ? el.corrientes.F15.toFixed(2) + ' A' : '<span class="mal">QUEMADO</span>'}</td></tr>
      <tr><td>Fusible lógica (${P.fus10} A)</td><td class="n">${el.fusibles.F10 ? el.corrientes.F10.toFixed(2) + ' A' : '<span class="mal">QUEMADO</span>'}</td></tr>
      <tr><td>Relé</td><td class="n">${el.rele ? 'cerrado' : 'abierto'}</td></tr><tr><td>Usado de la batería</td><td class="n">${(el.ah * 1000).toFixed(0)} mAh</td></tr></table>
      <h2>Motores M0601</h2><table>${e.motores.map(m => `<tr><td>${m.nombre}</td><td class="n">${m.rpm} rpm (pide ${m.objetivo})</td><td class="n">${m.i} A</td><td class="n">${m.suelto ? '<span class="tenue">libre</span>' : m.freno ? 'frena' : 'maneja'}${m.error ? ' <span class="mal">bloqueo</span>' : ''}</td></tr>`).join('')}</table>
      <h2>Bus RS485 y sensores</h2><table><tr><td>Tramas enviadas / respuestas / perdidas</td><td class="n">${e.esp32.bus.tx_bus} / ${e.esp32.bus.rx_ok} / ${e.esp32.bus.rx_perdidas}</td></tr>
      ${['VL0', 'VL1', 'VL2'].map((k, i) => `<tr><td>VL53L0X ${['frontal', 'izquierdo', 'derecho'][i]}</td><td class="n">${e.sensores[k] >= 8190 ? 'nada a < 1.2 m' : e.sensores[k] + ' mm'}</td></tr>`).join('')}
      <tr><td>Posición (x, y, rumbo)</td><td class="n">${e.carrito.x.toFixed(3)}, ${e.carrito.y.toFixed(3)} m, ${(e.carrito.th * 180 / Math.PI).toFixed(1)}°</td></tr>
      <tr><td>Patinan las llantas</td><td class="n">${e.carrito.patina.some(Boolean) ? '<span class="mal">sí</span>' : 'no'}</td></tr></table>`;
  }
  if (!$('p-registro').hidden && pintarRegistro) { $('registro').textContent = registro.slice(-200).reverse().join('\n'); pintarRegistro = false; }
  if (!$('p-gemelo').hidden) pintarGemelo();
}

// ------------------------------------------------------------------ vista de planta
const cv = $('plano'), ctx = cv.getContext('2d'), rastro = [];
let todo = false;
$('bTodo').onclick = e => { todo = !todo; e.target.textContent = todo ? 'Seguir al carrito' : 'Ver todo'; };
function color(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function dibujarPlano() {
  if (!cv.offsetParent && cv.hidden) return;
  const w = cv.clientWidth, h = cv.clientHeight, dpr = devicePixelRatio || 1;
  if (cv.width !== w * dpr || cv.height !== h * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const c = sim.car;
  const esc = todo ? Math.min(w / 6.2, h / 4.2) : Math.min(w, h) / 3.2;
  const cx = todo ? -1.9 : c.x, cy = todo ? 0.9 : c.y;
  const T = (x, y) => [w / 2 - (y - cy) * esc, h / 2 - (x - cx) * esc];   // mapa: x hacia arriba de la pantalla, y hacia la izquierda
  const linea = (pts, cerrar) => { ctx.beginPath(); pts.forEach(([x, y], i) => { const [a, b] = T(x, y); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); if (cerrar) ctx.closePath(); };
  ctx.strokeStyle = color('--grid'); ctx.lineWidth = 1;
  for (let g = -8; g <= 8; g += 0.5) { linea([[g, -6], [g, 6]]); ctx.stroke(); linea([[-8, g], [8, g]]); ctx.stroke(); }
  const esquinas = k => { const a = Math.cos(k.ang), s = Math.sin(k.ang); return [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([i, j]) => [k.cx + i * k.hx * a - j * k.hy * s, k.cy + i * k.hx * s + j * k.hy * a]); };
  for (const k of sim.obst()) {
    linea(esquinas(k), true);
    ctx.fillStyle = k.nombre === 'persona' ? '#d9893b' : k.nombre.startsWith('poste') ? color('--accent') : color('--line');
    ctx.fill();
  }
  ctx.fillStyle = color('--ink2'); ctx.font = '600 12px Barlow, sans-serif';
  const et = (t, x, y) => { const [a, b] = T(x, y); ctx.fillText(t, a, b); };
  et('Banda', 1.2, -0.05); et('Descarga', -3.6, 2.6); et('ArUco 0', 0.45, -0.25); et('ArUco 1', -4.5, 2.1);
  rastro.push([c.x, c.y]); if (rastro.length > 2500) rastro.shift();
  if (rastro.length > 1) { linea(rastro.filter((_, i) => i % 3 === 0)); ctx.strokeStyle = color('--accent'); ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1; }
  if (gem.real) { linea(esquinas(sim.car.caja(...gem.real)), true); ctx.setLineDash([5, 4]); ctx.strokeStyle = color('--warn'); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; }
  linea(esquinas(c.caja()), true); ctx.fillStyle = color('--accent'); ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
  const [fx, fy] = c.aMundo(0.18, 0); linea([[c.x, c.y], [fx, fy]]); ctx.strokeStyle = color('--accent-ink'); ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 1;
  if (sim.esp.vivo) for (const [k, [px, py, a]] of Object.entries({ VL0: [0.1667, 0, 0], VL1: [-0.22, 0.1892, Math.PI / 2], VL2: [-0.22, -0.1892, -Math.PI / 2] })) {
    const d = sim.mm(k), L = d >= 8190 ? 1.2 : d / 1000, [ox, oy] = c.aMundo(px, py);
    linea([[ox, oy], [ox + L * Math.cos(c.th + a), oy + L * Math.sin(c.th + a)]]); ctx.strokeStyle = d < 400 ? color('--crit') : color('--ok'); ctx.stroke();
  }
}

// ------------------------------------------------------------------ vista 3D (el modelo de la guía de armado)
const vista3d = { listo: false, recorrido: 0 };
$('bVista').onclick = () => {
  const tres = !$('tres').hidden;
  $('tres').hidden = tres; $('plano').hidden = !tres; $('bVista').textContent = tres ? 'Ver en 3D' : 'Ver planta';
  if (!tres && !$('tres').src) { $('tres').src = 'generado/carrito_3d.html?sim'; esperar3d(); }
};
function esperar3d(intento = 0) {
  let w; try { w = $('tres').contentWindow; } catch (e) { w = null; }
  if (w && w.__aether && w.__THREE) return montar3d(w);
  if (intento > 120) { anotar('El modelo 3D no cargó aquí (en el teléfono puede ser muy pesado o estar bloqueado): sigue con la vista de planta'); $('bVista').click(); return; }
  setTimeout(() => esperar3d(intento + 1), 500);
}
function montar3d(w) {
  const A = w.__aether, T = w.__THREE, guia = (x, y) => [x + 0.07, -y];
  A.ui.playing = false; A.ui.labels = false; A.ui.dims = false; A.seek(A.TOTAL() - 0.01, false); A.finishCam();
  const forzar = (o, vis) => o && Object.defineProperty(o, 'visible', { get: () => vis, set: () => {}, configurable: true });
  for (const [id, p] of A.PARTS) { if (/^(inv_|waste)/.test(id) || id === 'st_ramp' || id === 'mesa' || p.fixIndex !== undefined) forzar(p.group, false); if (['st_belt', 'st_dock', 'st_stripes'].includes(id)) forzar(p.group, true); }
  const rig = new T.Group(); A.scene.add(rig); rig.add(A.cartRoot);
  const extra = new T.Group(); A.scene.add(extra);
  for (const k of sim.est) { if (!/descarga|poste/.test(k.nombre)) continue; const [gx, gz] = guia(k.cx, k.cy);
    const m = new T.Mesh(new T.BoxGeometry(k.hx * 2, k.alto, k.hy * 2), new T.MeshStandardMaterial({ color: k.nombre === 'descarga' ? 0x8a6f4d : 0xb8bec6 })); m.position.set(gx, k.alto / 2, gz); extra.add(m); }
  const carga = new T.TextureLoader();
  for (const a of AetherSim.ARUCOS) { const tex = carga.load(`aruco_${a.id}.png`); const p = new T.Mesh(new T.PlaneGeometry(a.lado * 4 / 3, a.lado * 4 / 3), new T.MeshBasicMaterial({ map: tex })); const [gx, gz] = guia(a.x, a.y); p.position.set(gx, a.z, gz); p.rotation.y = a.yaw + Math.PI / 2; extra.add(p); }
  A.camera.position.set(-1.6, 1.6, 1.4);
  let tPrev = performance.now();
  vista3d.actualizar = () => {
    const c = sim.car, ahora = performance.now(); vista3d.recorrido += c.v * Math.min(0.1, (ahora - tPrev) / 1000) * rapidez; tPrev = ahora;
    const s = vista3d.recorrido, [cx, cz] = guia(c.x - 0.07 * Math.cos(c.th), c.y - 0.07 * Math.sin(c.th));
    A.setMech({ cart: { x: s, z: 0 } }); rig.rotation.y = c.th; rig.position.set(cx - s * Math.cos(c.th), 0, cz + s * Math.sin(c.th));
    const obj = new T.Vector3(cx, 0.5, cz), mov = obj.sub(A.controls.target); A.controls.target.add(mov); A.camera.position.add(mov);
  };
  vista3d.listo = true; anotar('Modelo 3D de la guía cargado');
}

// ------------------------------------------------------------------ gemelo: junto al carrito real
const gem = { ws: null, real: null, s: null, ultimo: {}, vbat: null, paroMv: null, ordenes: 0, desde: 0 };
const local = location.protocol === 'http:' || location.hostname === 'localhost';
$('gUrl').value = local ? `ws://${location.host}/gemelo` : 'ws://IP-DE-LA-JETSON:8771/gemelo';
$('gAviso').textContent = local ? 'Estás en la página que sirve el puente: solo pulsa Conectar.' :
  'Desde la app de Claude no se puede abrir una conexión al carrito (la app lo bloquea por seguridad). Para el gemelo, abre en el navegador del teléfono http://IP-DE-LA-JETSON:8771, con el teléfono en la misma red Wi-Fi que el carrito.';
$('gConectar').onclick = () => {
  if (gem.ws) { gem.ws.close(); return; }
  let ws; try { ws = new WebSocket($('gUrl').value.trim()); } catch (e) { anotar('Dirección inválida: ' + e.message); return; }
  gem.ws = ws; $('gConectar').textContent = 'Conectando…';
  ws.onopen = () => { $('gConectar').textContent = 'Desconectar'; anotar('Gemelo conectado al puente del carrito real'); gem.desde = sim.t; };
  ws.onclose = () => { gem.ws = null; gem.real = null; $('gConectar').textContent = 'Conectar'; anotar('Gemelo desconectado'); };
  ws.onerror = () => anotar('No pude conectar con el puente. ¿Está corriendo sim/puente_real.py en la Jetson y estás en la misma red?');
  ws.onmessage = ev => { try { realLinea(JSON.parse(ev.data)); } catch (e) {} };
};
function realLinea({ de, linea }) {
  const p = linea.trim().split(/\s+/);
  if (de === 'jetson') {
    gem.ordenes++;
    if ($('gEspejo').checked) sim.esp.usbRx += linea.trim() + '\n';     // el simulado recibe la misma orden
    if (p[0] !== 'HB') anotar(`Jetson real → ${linea.trim()}`);
    return;
  }
  gem.ultimo[p[0]] = linea;
  if (p[0] === 'ODO' && p[4] !== 'nan') {
    const s = (+p[2] + +p[3]) / 2, th = +p[4] * Math.PI / 180;
    if (!gem.real) { gem.real = [sim.car.x, sim.car.y, th]; gem.s = s; }
    const ds = s - gem.s; gem.s = s; gem.real = [gem.real[0] + ds * Math.cos(th), gem.real[1] + ds * Math.sin(th), th];
  } else if (p[0] === 'PWR') {
    gem.vbat = +p[1] / 1000; gem.paroMv = +p[2];
    if ($('gParo').checked) { const paro = gem.paroMv < 1000; if (paro !== sim.c.paro) { sim.c.paro = paro; sim.c.evaluar(); anotar(paro ? 'Pulsaron el paro del carrito real' : 'Soltaron el paro del carrito real'); } }
  } else if (p[0] !== 'RNG' && p[0] !== 'MOT') anotar(`ESP32 real → ${linea.trim()}`);
}
function pintarGemelo() {
  if (!gem.ws) { $('gDatos').innerHTML = ''; return; }
  const c = sim.car, r = gem.real, e = sim.estado();
  const d = r ? Math.hypot(r[0] - c.x, r[1] - c.y) : null, dth = r ? ((r[2] - c.th) * 180 / Math.PI + 540) % 360 - 180 : null;
  $('gDatos').innerHTML = `<h2>Real contra simulado</h2><div class="dos">
    <div class="dato"><b>Diferencia de posición</b><span>${d === null ? '—' : (d * 100).toFixed(1) + ' cm'}</span></div>
    <div class="dato"><b>Diferencia de rumbo</b><span>${dth === null ? '—' : dth.toFixed(1) + '°'}</span></div>
    <div class="dato"><b>Batería real</b><span>${gem.vbat === null ? '—' : gem.vbat.toFixed(2) + ' V'}</span></div>
    <div class="dato"><b>Batería simulada</b><span>${f2(e.electrico.v.bateria, 'V')}</span></div></div>
    <p class="tenue" style="margin-top:8px">El contorno punteado naranja es el carrito real (de su odometría). Si se separan, ajusta Física (masa, agarre, rodar) hasta que coincidan: así se calibra el modelo. Órdenes recibidas de la Jetson real: ${gem.ordenes}.</p>
    <table>${['ODO', 'RNG', 'PWR', 'MOT'].map(k => `<tr><td>${k}</td><td class="n">${(gem.ultimo[k] || '—').split(' ').slice(1).join(' ')}</td></tr>`).join('')}</table>`;
}

aplicarFallas();
requestAnimationFrame(bucle);
