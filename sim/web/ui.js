// Interfaz explicativa: resumen en palabras, modo dual, cables con inspector, señales y visión.
// Se apoya en sim.js (S, ws, mandar, COLORES) y en lo que manda sim/servidor.py.
'use strict';
(() => {
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const num = (v, d = 2) => v === null || v === undefined ? '—' : (+v).toFixed(d);
  const poner = (el, html) => { if (el && el._h !== html) { el._h = html; el.innerHTML = html; } };
  const activa = id => $('p-' + id).classList.contains('activa');

  // ------------------------------------------------------------------ avisos
  const estilo = document.createElement('style');
  estilo.textContent = '.toast{position:fixed;right:24px;bottom:24px;max-width:420px;z-index:50;background:#181824;border:1px solid rgba(255,107,129,.5);color:#ececf4;padding:12px 16px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.5);font:14px/1.5 Inter,system-ui,sans-serif}';
  document.head.appendChild(estilo);
  window.avisar = texto => {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = texto; document.body.appendChild(t); setTimeout(() => t.remove(), 7000);
  };

  // ------------------------------------------------------------------ mensajes
  const antes = ws.onmessage;
  let previo = null, tasa = 0;
  ws.onmessage = ev => {
    antes(ev);
    const m = JSON.parse(ev.data);
    if (m.tipo === 'estado') estado(m); else if (m.tipo === 'mundo') mundo(); else if (m.tipo === 'cable') inspector(m);
  };
  document.querySelectorAll('nav button').forEach(b => b.addEventListener('click', () => mandar({ accion: 'ver_cables', valor: b.dataset.p === 'cables' })));

  function estado(e) {
    if (previo && e.t > previo.t + 0.2) { tasa = (e.esp32.bus.tx_bus - previo.esp32.bus.tx_bus) / (e.t - previo.t); previo = e; } else if (!previo) previo = e;
    $('modoPill').textContent = e.modo === 'dual' ? 'Simulación + ESP32 real' : 'Solo simulación';
    $('modoPill').classList.toggle('dual', e.modo === 'dual');
    if (activa('resumen')) { modoCard(e); poner($('narrador'), narrar(e).map(([t, c]) => `<li class="${c}"><span>${t}</span></li>`).join('')); poner($('cadena'), cadena(e)); vision(e); }
    if (activa('senales')) senales(e);
    if (activa('cables') && e.cables_v) for (const [id, v] of Object.entries(e.cables_v)) { const s = filas.get(id); if (s) { s.textContent = etiquetaV(v, s.dataset.g); s.classList.toggle('hot', v !== null && v > 0.3); } }
  }
  function mundo() { /* los textos fijos ya están en la página; lo dinámico se arma en estado() */ }

  // ------------------------------------------------------------------ modo: solo simulación o simulación + ESP32 real
  function modoCard(e) {
    const r = e.real, disp = S.mundo?.real_disponible, dual = e.modo === 'dual';
    let h = `<h3>Modo de funcionamiento</h3>
      <div class="fila" style="margin-top:10px"><button class="b grande ${dual ? '' : 'on'}" data-modo="sim">Solo simulación</button>
      <button class="b grande ${dual ? 'on' : ''}" data-modo="dual" ${disp ? '' : 'disabled style="opacity:.45;cursor:not-allowed"'}>Simulación + ESP32 real</button></div>`;
    if (!dual) h += `<p>Todo corre aquí: el ESP32 es virtual y los programas hablan con él. No necesitas ningún aparato conectado.</p>`;
    else h += `<p>Las órdenes llegan a <b>los dos ESP32 a la vez</b>: el simulado y el de verdad (${esc(r.puerto)}). Los programas ven las lecturas del real. Abajo se compara lo que hizo cada uno.</p>`;
    if (!disp) h += `<div class="callout aviso"><b class="t">Modo dual no disponible</b><p>Conecta el ESP32 por USB y abre el servidor así:</p><pre><code>backend\\.venv\\Scripts\\python.exe sim\\servidor.py --esp32 COM5</code></pre><p>Usa <code>--esp32 auto</code> si no sabes el puerto. Necesita <code>pyserial</code> (<code>pip install pyserial</code>).</p></div>`;
    if (dual) {
      const vivo = r.hace_s !== null && r.hace_s < 2;
      h += `<div class="datos"><div class="dato"><b>ESP32 real</b><span class="${vivo ? 'ok' : 'mal'}">${vivo ? 'mandando datos' : 'sin datos'}</span></div>
        <div class="dato"><b>Diferencia de posición</b><span>${r.dif_cm === undefined ? '—' : r.dif_cm + ' cm'}</span></div>
        <div class="dato"><b>Diferencia de rumbo</b><span>${r.dif_grados === undefined ? '—' : r.dif_grados + '°'}</span></div>
        <div class="dato"><b>Batería real / sim.</b><span>${num(r.bat_v)} / ${num(e.electrico.v.bateria)} V</span></div>
        <div class="dato"><b>Paro real</b><span>${r.paro_mv === null ? '—' : r.paro_mv < 1000 ? 'presionado' : 'suelto'}</span></div>
        <div class="dato"><b>Frente real / sim.</b><span>${r.frente_mm ?? '—'} / ${e.sensores.VL0 >= 8190 ? '—' : e.sensores.VL0} mm</span></div></div>
        <p style="margin-top:10px">Si las diferencias crecen, el modelo no se parece al carrito: ajusta masa, agarre y fricción hasta que coincidan. <button class="b chico" data-alinear>Alinear origen</button></p>`;
    }
    poner($('modoCard'), h);
    $('modoCard').querySelectorAll('[data-modo]').forEach(b => b.onclick = () => mandar({ accion: 'modo', valor: b.dataset.modo }));
    const al = $('modoCard').querySelector('[data-alinear]'); if (al) al.onclick = () => mandar({ accion: 'alinear' });
  }

  // ------------------------------------------------------------------ narrador: lo que pasa, en palabras
  function narrar(e) {
    const el = e.electrico, v = el.v, L = [], add = (t, c = 'info') => L.push([t, c]);
    if (!el.kcd1) add('El interruptor <b>KCD1</b> está apagado: la batería no alimenta nada. Enciéndelo en <b>Manejar</b>.', 'aviso');
    else add(`<b>KCD1 encendido.</b> El XL4005 baja la batería (${num(v.bateria, 1)} V) a ${num(v.xl4005)} V y con eso se encienden el ESP32 y la Jetson.`, 'ok');
    if (el.kcd1) {
      if (el.paro) add('El <b>paro está presionado</b>: el relé se soltó y las ruedas no tienen 18 V. El ESP32 lo sabe porque su pin 34 lee 0 V.', 'aviso');
      else if (el.rele) add(`Paro suelto y <b>relé cerrado</b>: el elevador de voltaje entrega ${num(v.elevador, 1)} V a los motores.`, 'ok');
      else add('El paro está suelto pero el <b>relé no cerró</b>: revisa los cables del paro y del relé.', 'mal');
    }
    if (el.kcd1 && !e.esp32.vivo) add('El <b>ESP32 no se enciende</b>: no le llegan entre 4.3 y 6.5 V por el pin 5V. Mira Medidas y Cables.', 'mal');
    if (e.esp32.vivo) {
      const fw = e.firmware.conectado ? 'compilado en C++' : e.firmware.referencia ? 'de referencia en Python' : 'ninguno';
      if (tasa > 20) add(`El ESP32 corre su firmware (${fw}) y manda <b>${Math.round(tasa)} tramas por segundo</b> a los motores. Cada motor necesita al menos 50; si bajan, la rueda se suelta.`, 'ok');
      else add(`El ESP32 está encendido (firmware ${fw}) pero <b>no está mandando tramas</b> a los motores.`, e.firmware.conectado || e.firmware.referencia ? 'aviso' : 'info');
      for (const m of e.motores) {
        if (m.v < 12) { if (el.kcd1) add(`El motor ${m.nombre} no tiene voltaje (${m.v} V): no puede girar.`, 'aviso'); continue; }
        if (Math.abs(m.rpm) > 1 || m.objetivo) add(`Motor ${m.nombre}: gira a <b>${m.rpm} rpm</b> (le pidieron ${m.objetivo})${m.suelto ? ', pero está <b>suelto</b>: no recibe órdenes y rueda por inercia' : ''}${m.error ? ', <b>bloqueado</b>' : ''}.`, m.suelto || m.error ? 'aviso' : 'ok');
      }
    }
    const c = e.carrito;
    if (Math.abs(c.v) > 0.01) add(`El carrito va a <b>${num(c.v)} m/s</b>${c.patina.some(Boolean) ? ' y las llantas están <b>patinando</b>' : ''}.`, c.patina.some(Boolean) ? 'aviso' : 'info');
    if (c.contactos.length) add(`Está tocando: ${c.contactos.join(', ')}.`, 'info');
    if (e.esp32.vivo && e.sensores.VL0 < 400) add(`El sensor frontal ve algo a <b>${e.sensores.VL0} mm</b>: el ESP32 frena (reflejo de 40 cm).`, 'aviso');
    const vi = e.vision, o = vi.obstacles;
    if (o.count) add(`La cámara ve ${o.classes.map(k => k === 'person' ? 'una persona' : 'una caja').join(' y ')} ocupando ${o.max_area_pct} % de la imagen (más porcentaje = más cerca).`, 'info');
    if (vi.arucos.length) add(`La cámara lee el ArUco ${vi.arucos.map(a => `${a.id} (a ${a.distancia_m} m, ${a.px} px)`).join(', ')}.`, 'ok');
    if (e.mision) add('El programa de la Jetson (<code>mision.py</code>) está mandando órdenes de movimiento.', 'info');
    else if (e.prog.corriendo) add('Tu programa se está ejecutando y manda órdenes por el USB.', 'info');
    for (const t of Object.values(el.danos)) add(t, 'mal');
    for (const t of el.avisos) add(t, 'aviso');
    if (!el.fusibles.F15 || !el.fusibles.F10) add('Hay un <b>fusible quemado</b>. Cámbialo con «Cambiar fusibles y piezas dañadas» en Manejar.', 'mal');
    if (e.modo === 'dual' && e.real.dif_cm !== undefined) add(`ESP32 real y simulado difieren <b>${e.real.dif_cm} cm</b> en posición y ${e.real.dif_grados}° en rumbo.`, e.real.dif_cm > 10 ? 'aviso' : 'ok');
    return L;
  }

  // ------------------------------------------------------------------ cadena de energía
  function cadena(e) {
    const el = e.electrico, v = el.v;
    const n = (titulo, valor, estadoNodo) => `<div class="nodo ${estadoNodo}"><b>${titulo}</b><span>${valor}</span></div>`, f = '<span class="flecha">→</span>';
    const sano = ok => ok ? 'on' : '';
    return `${n('Batería', num(v.bateria, 1) + ' V', 'on')}${f}${n('Fusible 5 A', el.fusibles.F10 ? num(el.corrientes.F10) + ' A' : 'quemado', el.fusibles.F10 ? sano(el.kcd1) : 'mal')}${f}${n('KCD1', el.kcd1 ? 'on' : 'off', sano(el.kcd1))}${f}${n('XL4005', num(v.xl4005) + ' V', sano(v.xl4005 > 4.8))}${f}${n('ESP32', e.esp32.vivo ? 'vivo' : 'apagado', sano(e.esp32.vivo))}
      <div style="flex-basis:100%;height:0"></div>
      ${n('Batería', num(v.bateria, 1) + ' V', 'on')}${f}${n('Fusible 15 A', el.fusibles.F15 ? num(el.corrientes.F15) + ' A' : 'quemado', el.fusibles.F15 ? sano(el.rele) : 'mal')}${f}${n('Paro y relé', el.rele ? 'cerrado' : 'abierto', sano(el.rele))}${f}${n('Elevador', num(v.elevador, 1) + ' V', sano(v.elevador > 17))}${f}${n('M0601 ×2', e.motores.map(m => m.rpm).join(' / ') + ' rpm', sano(e.motores.some(m => m.v > 12)))}`;
  }

  // ------------------------------------------------------------------ visión
  function vision(e) {
    const vi = e.vision, o = vi.obstacles;
    let h = '<h3>Obstáculos (YOLO general)</h3>';
    h += o.count ? vi.detalle.map(d => `<div class="det"><span>${d.clase === 'person' ? 'person (persona)' : 'box (caja)'}${d.recortado ? ' <small>cortada por el borde</small>' : ''}</span><span>${d.area_pct} % · ${d.rumbo_deg}°</span></div><div class="barra-v"><i style="width:${Math.min(100, d.area_pct)}%"></i></div>`).join('') : '<p class="tenue" style="margin:6px 0 14px">No ve ningún obstáculo.</p>';
    h += '<h3 style="margin-top:16px">Marcadores ArUco</h3>';
    h += vi.arucos.length ? vi.arucos.map(a => `<div class="det"><span>ArUco ${a.id}${a.completo ? '' : ' <small>parcial</small>'}</span><span>${a.distancia_m} m · ${a.rumbo_deg}° · ${a.px} px</span></div>`).join('') : '<p class="tenue" style="margin:6px 0 0">No ve ninguno: están fuera del cuadro o se ven más chicos que 40 px.</p>';
    h += '<div class="callout" style="margin-bottom:0"><b class="t">Qué es real y qué no</b><p>Una cámara sola <b>no mide distancia</b>: el porcentaje del cuadro es un indicio. El agente del Jetson publica hoy los obstáculos así. La <b>posición de los ArUco</b> y el <b>detalle por objeto</b> son del simulador: el agente real todavía solo detecta el ID del marcador.</p></div>';
    poner($('visionCard'), h);
  }

  // ------------------------------------------------------------------ señales: bus, analizador, I²C
  function senales(e) {
    const b = e.esp32.bus;
    poner($('busContadores'), `<div class="dato"><b>Tramas enviadas</b><span>${b.tx_bus}</span></div><div class="dato"><b>Respuestas</b><span class="ok">${b.rx_ok}</span></div><div class="dato"><b>Perdidas</b><span class="${b.rx_perdidas ? 'mal' : ''}">${b.rx_perdidas}</span></div><div class="dato"><b>Por segundo</b><span>${Math.round(tasa)}</span></div>`);
    poner($('tramas'), e.tramas.length ? e.tramas.slice().reverse().slice(0, 14).map(t => `<div class="trama ${t.ok ? '' : 'mal'}"><span class="d ${t.dir}">${t.dir.toUpperCase()}</span><span class="tenue">${t.t.toFixed(2)} s</span><span>${esc(t.texto)}</span><span class="h">${t.hex}</span></div>`).join('') : '<p class="tenue" style="margin:0">Todavía no hay tramas: enciende el ESP32 y mueve algo.</p>');
    const vl = e.esp32.vl53, s = e.sensores, filasI = [['VL53L0X frontal', 'VL0'], ['VL53L0X izquierdo', 'VL1'], ['VL53L0X derecho', 'VL2']].map(([n, k]) => `<div class="det"><span>${n}</span><span>${vl[k] === undefined ? 'sin encender' : '0x' + vl[k].toString(16)} · ${s[k] >= 8190 ? 'nada a &lt; 1.2 m' : s[k] + ' mm'}</span></div>`).join('');
    poner($('i2c'), filasI + `<div class="det"><span>VL53L0X de la pila</span><span>${vl.VLP === undefined ? 'sin encender' : '0x' + vl.VLP.toString(16)}</span></div><div class="det"><span>BNO055 (rumbo)</span><span>${num(((-e.carrito.th * 180 / Math.PI) % 360 + 360) % 360, 1)}°</span></div>`);
    analizador(e.senales);
  }
  function analizador(sn) {
    const cv = $('analizador'), g = cv.getContext('2d'), W = cv.width, H = cv.height, izq = 150, t1 = sn.t, t0 = t1 - 4, px = t => izq + (t - t0) / 4 * (W - izq - 10);
    g.clearRect(0, 0, W, H); g.font = '500 20px Inter, sans-serif';
    const carriles = [['DE · GPIO 4', '4', '#8b7bff'], ['TX · GPIO 17', 'tx', '#ff7eb6'], ['XSHUT frente · 32', '32', '#5ad8ff'], ['XSHUT izq. · 33', '33', '#5ad8ff'], ['XSHUT der. · 15', '15', '#5ad8ff']];
    const alto = H / carriles.length;
    carriles.forEach(([nombre, clave, color], i) => {
      const y0 = i * alto + alto - 12, y1 = i * alto + 12;
      g.fillStyle = '#66667f'; g.fillText(nombre, 8, i * alto + alto / 2 + 7);
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(izq, y0); g.lineTo(W - 10, y0); g.stroke();
      g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 2; g.beginPath();
      if (clave === 'tx') { for (const t of sn.tx) { const x = px(t); g.moveTo(x, y0); g.lineTo(x, y1); } g.lineWidth = 1; g.stroke(); return; }
      const tr = sn.pines[clave] || [], ahora = sn.pines_ahora[clave];
      let val = tr.length ? 1 - tr[0][1] : (ahora ?? 0);
      let x = izq; g.moveTo(x, val ? y1 : y0);
      for (const [t, v2] of tr) { const xt = px(t); g.lineTo(xt, val ? y1 : y0); val = v2; g.lineTo(xt, val ? y1 : y0); }
      g.lineTo(W - 10, val ? y1 : y0); g.stroke();
    });
  }

  // ------------------------------------------------------------------ cables: lista viva e inspector
  const esDatos = g => /^(RS485|Bus I)/.test(g || '');
  const etiquetaV = (v, g) => v === null ? (esDatos(g) ? 'señal de datos' : 'al aire') : v.toFixed(2) + ' V';
  const filas = new Map();
  let sel = null, filtro = '';
  window.pintarCables = function () {
    const m = S.mundo; if (!m) return;
    const actuales = new Set(m.cables.map(c => c.id));
    if (!S.guia) S.guia = Object.fromEntries(m.cables.map(c => [c.id, c]));
    const todos = [...m.cables];
    for (const id of m.cables_guia) if (!actuales.has(id)) todos.push({ ...(S.guia[id] || { id, de: '?', a: '?', grupo: 'Cortados', color: 'cTin' }), cortado: true });
    const q = filtro.trim().toLowerCase(), grupos = {};
    for (const c of todos) {
      const txt = `${m.pines[c.de] || c.de} ${m.pines[c.a] || c.a} ${c.de} ${c.a} ${c.grupo}`.toLowerCase();
      if (!q || txt.includes(q)) (grupos[c.grupo] ||= []).push(c);
    }
    filas.clear();
    $('listaCables').innerHTML = Object.entries(grupos).map(([g, cs]) => `<details class="grupo" ${q || cs.some(c => c.cortado) || g === 'Tus cables' ? 'open' : ''}><summary>${esc(g)}<small>${cs.length}</small></summary>${cs.map(c => `
      <div class="cable ${c.cortado ? 'cortado' : ''} ${c.id === sel ? 'sel' : ''}" data-id="${c.id}"><i style="background:${COLORES[c.color] || '#999'}"></i>
      <span>${esc(m.pines[c.de] || c.de)} <span class="tenue">→</span> ${esc(m.pines[c.a] || c.a)}</span>
      ${c.cortado ? `<button class="b chico" data-volver="${c.id}">Poner</button>` : `<span class="vv" data-v="${c.id}" data-g="${esc(c.grupo)}">—</span>`}</div>`).join('')}</details>`).join('') || '<p class="tenue">Ningún cable coincide.</p>';
    $('listaCables').querySelectorAll('.cable').forEach(r => { const v = r.querySelector('[data-v]'); if (v) filas.set(r.dataset.id, v); r.onclick = ev => { if (ev.target.closest('[data-volver]')) return; elegir(r.dataset.id); }; });
    $('listaCables').querySelectorAll('[data-volver]').forEach(b => b.onclick = () => { const c = S.guia[b.dataset.volver]; mandar({ accion: 'conectar', de: c.de, a: c.a }); });
  };
  $('cFiltro').oninput = e => { filtro = e.target.value; window.pintarCables(); };
  function elegir(id) { sel = id; document.querySelectorAll('.cable').forEach(r => r.classList.toggle('sel', r.dataset.id === id)); mandar({ accion: 'inspeccionar', id }); }
  setInterval(() => { if (sel && activa('cables')) mandar({ accion: 'inspeccionar', id: sel }); }, 500);
  function inspector(c) {
    if (c.id !== sel) return;
    const v = c.v === null ? `<span class="tenue" style="font-size:15px">${etiquetaV(null, c.grupo)}</span>` : `${c.v.toFixed(2)} V`;
    $('inspector').innerHTML = `<div class="card"><div class="fila" style="justify-content:space-between;margin:0"><div><small>${esc(c.grupo)}</small><h3>${esc(c.nombre_de)} → ${esc(c.nombre_a)}</h3></div><div class="v">${v}</div></div>
      ${c.corriente_aprox !== null ? `<p style="margin:4px 0 0"><small>Corriente aproximada de este tramo: ${c.corriente_aprox} A (estimada del grupo, no medida por cable)</small></p>` : ''}
      ${c.pin_de || c.pin_a ? `<p style="margin:8px 0 0">${esc(c.pin_de)} ${esc(c.pin_a)}</p>` : ''}
      <small style="display:block;margin-top:8px">Unido eléctricamente a ${c.n_en_el_mismo_punto} pines:</small><div class="pins">${c.en_el_mismo_punto.slice(0, 14).map(p => `<span class="pin">${esc(p)}</span>`).join('')}${c.n_en_el_mismo_punto > 14 ? `<span class="pin">+${c.n_en_el_mismo_punto - 14}</span>` : ''}</div>
      ${c.que ? `<p><b>Para qué sirve.</b> ${esc(c.que)}</p>` : ''}${c.falla ? `<p><b>Si lo cortas.</b> ${esc(c.falla)}</p>` : ''}
      <div class="fila" style="margin:0"><button class="b rojo chico" id="inspCortar">Cortar este cable</button></div></div>`;
    $('inspCortar').onclick = () => { mandar({ accion: 'cortar', id: c.id }); sel = null; $('inspector').innerHTML = '<div class="card"><p class="tenue" style="margin:0">Cable cortado. Míralo tachado en la lista y mira qué pasó en Resumen.</p></div>'; };
  }
})();
