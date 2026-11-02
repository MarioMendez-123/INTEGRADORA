// Página del simulador: habla con sim/servidor.py por WebSocket y mueve el modelo 3D de la guía.
'use strict';
const $ = id => document.getElementById(id);
const ws = new WebSocket(`ws://${location.host}/`);
const S = { mundo: null, estado: null, pistas: {} };   // pistas: memoria para las revisiones del tutorial
const mandar = obj => ws.readyState === 1 && ws.send(JSON.stringify(obj));
const COLORES = { cRed: '#d33', cBlk: '#222', cPnk: '#f58ac0', cOra: '#f39a2b', cYel: '#f2d43b', cWht: '#eee', cGrn: '#3c9f4a',
  cBlu: '#3b7be0', cBrn: '#8a5a2b', cGry: '#888', cTeal: '#2aa6a0', cPur: '#9056d6', cLbl: '#7fc4f0', cLim: '#a6d63b',
  cOli: '#8a8f3a', cBei: '#d9c49a', cTin: '#c9c9c9', cMag: '#e040fb' };

ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.tipo === 'mundo') { S.mundo = m; pintarCables(); pintarPines(); Modelo.mundo(m); }
  else if (m.tipo === 'estado') { S.estado = m; pintarEstado(m); Modelo.estado(m); Tutorial.revisar(m, S.pistas); }
  else if (m.tipo === 'error') alert(m.texto);
};
ws.onclose = () => { $('hud').innerHTML = '<span class="chip mal">Sin conexión con sim/servidor.py: ¿sigue abierto?</span>'; };

// ------------------------------------------------------------------ pestañas
document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  document.querySelectorAll('nav button').forEach(x => x.setAttribute('aria-selected', x === b));
  document.querySelectorAll('.pestana').forEach(p => p.classList.toggle('activa', p.id === 'p-' + b.dataset.p));
});

// ------------------------------------------------------------------ mandos
$('bKcd1').onclick = () => mandar({ accion: 'kcd1', valor: !S.estado?.electrico.kcd1 });
$('bParo').onclick = () => mandar({ accion: 'paro', valor: !S.estado?.electrico.paro });
$('bEn').onclick = () => mandar({ accion: 'reset_esp32' });
$('bReparar').onclick = () => mandar({ accion: 'reparar' });
$('bQuitar').onclick = () => mandar({ accion: 'quitar_obstaculos' });
const enfrente = d => { const c = S.estado.carrito; return { x: c.x + d * Math.cos(c.th), y: c.y + d * Math.sin(c.th) }; };
$('bPersona').onclick = () => mandar({ accion: 'obstaculo', clase: 'persona', ...enfrente(1.17) });
$('bCajaObs').onclick = () => mandar({ accion: 'obstaculo', clase: 'caja', ...enfrente(1.17) });
document.querySelectorAll('[data-colocar]').forEach(b => b.onclick = () => {
  const [x, y, th] = b.dataset.colocar.split(',').map(Number); mandar({ accion: 'colocar', x, y, th });
});
$('masa').oninput = e => { $('masaV').textContent = e.target.value + ' kg'; mandar({ accion: 'masa', valor: +e.target.value }); };
$('mismoLado').onchange = e => mandar({ accion: 'motor_invertido', valor: e.target.checked });
['FC1', 'FC2', 'FC3', 'FC4'].forEach(k => {
  const b = document.createElement('button'); b.className = 'b'; b.textContent = k; b.id = 'b' + k;
  b.onclick = () => mandar({ accion: 'final', cual: k, valor: !S.estado?.electrico.finales.includes(k) });
  $('finales').appendChild(b);
});
$('usbTexto').onkeydown = e => { if (e.key === 'Enter' && e.target.value) { mandar({ accion: 'usb_enviar', texto: e.target.value }); e.target.value = ''; } };

// ------------------------------------------------------------------ cables
function pintarPines() {
  $('listaPines').innerHTML = Object.entries(S.mundo.pines).map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
}
function pintarCables() {
  const m = S.mundo, actuales = new Set(m.cables.map(c => c.id));
  if (!S.guia) S.guia = Object.fromEntries(m.cables.map(c => [c.id, c]));
  const todos = [...m.cables];
  // los cables de la guía que ya no están se muestran tachados, para poder volver a ponerlos
  for (const id of m.cables_guia) if (!actuales.has(id)) todos.push({ ...(S.guia?.[id] || { id, de: '?', a: '?', grupo: 'Cortados', color: 'cTin' }), cortado: true });
  const grupos = {};
  for (const c of todos) (grupos[c.grupo] ||= []).push(c);
  $('listaCables').innerHTML = Object.entries(grupos).map(([g, cs]) => `<details class="grupo" ${cs.some(c => c.cortado) || g === 'Tus cables' ? 'open' : ''}>
    <summary>${g} (${cs.length})</summary>${cs.map(c => `<div class="cable ${c.cortado ? 'cortado' : ''}"><i style="background:${COLORES[c.color] || '#999'}"></i>
    <span><b>${m.pines[c.de] || c.de}</b> → ${m.pines[c.a] || c.a} <span class="tenue">${c.id}</span></span>
    ${c.cortado ? `<button class="b" data-volver="${c.id}">Volver a poner</button>` : `<button class="b" data-cortar="${c.id}">Cortar</button>`}</div>`).join('')}</details>`).join('');
  $('listaCables').querySelectorAll('[data-cortar]').forEach(b => b.onclick = () => mandar({ accion: 'cortar', id: b.dataset.cortar }));
  $('listaCables').querySelectorAll('[data-volver]').forEach(b => b.onclick = () => { const c = S.guia[b.dataset.volver]; mandar({ accion: 'conectar', de: c.de, a: c.a }); });
}
$('bConectar').onclick = () => mandar({ accion: 'conectar', de: $('cDe').value.trim(), a: $('cA').value.trim() });
$('bGuia').onclick = () => mandar({ accion: 'reiniciar_cableado' });

// ------------------------------------------------------------------ medidas, HUD y monitor
const f2 = (v, u = '', d = 2) => v === null || v === undefined ? '<span class="tenue">al aire</span>' : `${(+v).toFixed(d)}${u}`;
function pintarEstado(e) {
  const el = e.electrico, v = el.v;
  $('bKcd1').textContent = el.kcd1 ? 'KCD1 encendido' : 'KCD1 apagado';
  $('bKcd1').classList.toggle('on', el.kcd1); $('bKcd1').setAttribute('aria-pressed', el.kcd1);
  $('bParo').textContent = el.paro ? 'Paro PRESIONADO' : 'Paro suelto';
  $('bParo').classList.toggle('on', el.paro); $('bParo').setAttribute('aria-pressed', el.paro);
  ['FC1', 'FC2', 'FC3', 'FC4'].forEach(k => $('b' + k).classList.toggle('on', el.finales.includes(k)));
  const chips = [
    [f2(v.bateria, ' V', 1), ''], [`5 V ${f2(v.xl4005, '', 2)}`, v.xl4005 > 4.8 ? 'ok' : ''], [`18 V ${f2(v.elevador, '', 1)}`, v.elevador > 17 ? 'ok' : ''],
    [el.rele ? 'relé on' : 'relé off', el.rele ? 'ok' : ''], [e.esp32.vivo ? 'esp32 on' : 'esp32 off', e.esp32.vivo ? 'ok' : 'aviso'],
    [e.firmware.conectado ? 'firmware C++' : e.firmware.referencia ? 'firmware ref.' : 'sin firmware', e.firmware.conectado || e.firmware.referencia ? 'ok' : 'aviso'],
    [`${e.carrito.v.toFixed(2)} m/s`, ''],
  ];
  if (!el.fusibles.F15 || !el.fusibles.F10) chips.push(['fusible quemado', 'mal']);
  if (Object.keys(el.danos).length) chips.push(['pieza dañada', 'mal']);
  $('hud').innerHTML = chips.map(([t, c]) => `<span class="chip ${c}">${t}</span>`).join('');
  const dato = (n, val) => `<div class="dato"><b>${n}</b><span>${val}</span></div>`;
  const mot = e.motores.map(m => dato(`${m.nombre === 'izquierdo' ? 'izq' : 'der'} · ${m.suelto ? 'libre' : m.freno ? 'frena' : 'maneja'}${m.error ? ' · BLOQUEO' : ''}`, `${m.rpm} <small>/ ${m.objetivo} rpm · ${m.i} A</small>`)).join('');
  const danos = Object.values(el.danos).map(t => `<li class="mal">${t}</li>`).join('') + el.avisos.map(t => `<li>${t}</li>`).join('');
  const vl = e.sensores, dir = e.esp32.vl53, mm = k => vl[k] >= 8190 ? '—' : vl[k] + ' mm';
  const f15 = el.fusibles.F15 ? f2(el.corrientes.F15, ' A') : '<span class="mal">quemado</span>', f10 = el.fusibles.F10 ? f2(el.corrientes.F10, ' A') : '<span class="mal">quemado</span>';
  $('p-medidas').innerHTML = `${danos ? `<div class="alerta"><ul>${danos}</ul></div>` : ''}
    <h2>Voltajes</h2><div class="datos">${dato('batería', f2(v.bateria, ' V'))}${dato('XL4005', f2(v.xl4005, ' V'))}${dato('ruedas', f2(v.elevador, ' V'))}${dato('3V3', f2(v.esp32_3v3, ' V'))}${dato('GPIO 34 paro', f2(v.gpio34, ' V'))}${dato('GPIO 39 bat.', f2(v.gpio39, ' V'))}</div>
    <h2>Corriente</h2><div class="datos">${dato('fusible 15 A', f15)}${dato('fusible 10 A', f10)}${dato('batería usada', (el.ah * 1000).toFixed(1) + ' mAh')}</div>
    <h2>Motores M0601</h2><div class="datos">${mot}</div>
    <h2>Sensores</h2><div class="datos">${dato('frente', mm('VL0'))}${dato('izquierda', mm('VL1'))}${dato('derecha', mm('VL2'))}${dato('rumbo', (e.carrito.th * 180 / Math.PI).toFixed(1) + '°')}</div>
    <h2>Carrito</h2><div class="datos">${dato('x, y', e.carrito.x.toFixed(2) + ', ' + e.carrito.y.toFixed(2))}${dato('velocidad', e.carrito.v.toFixed(2) + ' m/s')}${dato('toca', e.carrito.contactos.join(', ') || '—')}${dato('patinan', e.carrito.patina.some(Boolean) ? '<span class="mal">sí</span>' : 'no')}</div>
    <details><summary>Bus RS485</summary><div class="datos">${dato('UART2', e.esp32.uart2 ? e.esp32.uart2[0] + ' baud' : 'sin iniciar')}${dato('enviadas', e.esp32.bus.tx_bus)}${dato('recibidas', e.esp32.bus.rx_ok)}${dato('perdidas', e.esp32.bus.rx_perdidas)}${dato('direcciones I²C', Object.values(dir).map(d => '0x' + d.toString(16)).join(' ') || '—')}</div></details>`;
  const mon = $('monitor'), abajo = mon.scrollTop + mon.clientHeight >= mon.scrollHeight - 20;
  mon.textContent = e.monitor.join('\n');
  if (abajo) mon.scrollTop = mon.scrollHeight;
}

// ------------------------------------------------------------------ modelo 3D (la guía de armado, dentro del iframe)
const Modelo = (() => {
  let A, T, rig, extra, rayos, camC920, listo = false, ultimo = null, recorrido = 0, tPrev = 0, seguir = true, verCamara = true;
  const guia = (x, y) => [x + 0.07, -y];                 // del mapa (eje de las ruedas) a los ejes de la guía (centro del carrito)
  function forzar(obj, visible) { if (obj) Object.defineProperty(obj, 'visible', { get: () => visible, set: () => {}, configurable: true }); }
  function preparar() {
    const w = $('modelo').contentWindow;
    if (!w || !w.__aether || !w.__THREE) return false;
    A = w.__aether; T = w.__THREE;
    A.ui.playing = false; A.ui.labels = false; A.ui.dims = false;
    A.seek(A.TOTAL() - 0.01, false); A.finishCam();
    for (const [id, p] of A.PARTS) {
      if (/^(inv_|waste)/.test(id) || id === 'st_ramp' || id === 'mesa' || p.fixIndex !== undefined) forzar(p.group, false);   // los 6 fixtures de la guía quedan a un lado del carrito, en su pose final
      if (id === 'st_belt' || id === 'st_dock' || id === 'st_stripes') forzar(p.group, true);
    }
    rig = new T.Group(); A.scene.add(rig); rig.add(A.cartRoot);
    extra = new T.Group(); A.scene.add(extra);
    rayos = new T.Group(); A.cartRoot.add(rayos);
    camC920 = new T.PerspectiveCamera(43.3, 16 / 9, 0.05, 30);       // C920 en 16:9, ~43° vertical (se confirma al calibrar)
    camC920.position.set(0.245, 1.066, 0);     // frente del lente (la pieza de la guía está en x 0.213)
    camC920.rotation.order = 'YXZ'; camC920.rotation.set(-6 * Math.PI / 180, -Math.PI / 2, 0);   // mira a +x, 6° hacia abajo
    camC920.layers.mask = A.camera.layers.mask;              // la guía dibuja sus piezas en varias capas
    A.cartRoot.add(camC920);
    const r = A.renderer, render = r.render.bind(r);
    r.render = (scene, cam) => {
      render(scene, cam);
      if (!verCamara || cam === camC920) return;
      const tam = r.getSize(new T.Vector2()), ancho = Math.min(400, tam.x * 0.36), alto = ancho * 9 / 16;
      const mc = $('camMarco'); if (mc) { mc.hidden = false; mc.style.width = ancho + 'px'; mc.style.height = alto + 'px'; }
      r.setScissorTest(true); r.setScissor(tam.x - ancho - 12, 12, ancho, alto); r.setViewport(tam.x - ancho - 12, 12, ancho, alto);
      render(scene, camC920);
      r.setScissorTest(false); r.setViewport(0, 0, tam.x, tam.y);
    };
    A.camera.position.set(-1.6, 1.6, 1.4); A.controls.target.set(0, 0.5, 0);
    listo = true;
    if (S.mundo) mundo(S.mundo);
    return true;
  }
  function caja(c, color, opac = 1) {
    const [gx, gz] = guia(c.cx, c.cy);
    const m = new T.Mesh(new T.BoxGeometry(c.hx * 2, c.alto, c.hy * 2), new T.MeshStandardMaterial({ color, transparent: opac < 1, opacity: opac, roughness: 0.8 }));
    m.position.set(gx, c.base + c.alto / 2, gz); m.rotation.y = c.ang;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function mundo(m) {
    if (!listo) return;
    extra.clear();
    for (const c of m.cajas) {
      if (c.nombre === 'descarga') {                        // ejemplo de descarga: mesa inclinada de 1.4 × 0.3 m a ~15°
        const g = caja(c, 0x8a6f4d); extra.add(g);
      } else if (c.nombre.startsWith('poste')) extra.add(caja(c, 0xb8bec6));
      else if (c.nombre === 'persona') extra.add(caja(c, 0xd9893b));
      else if (c.nombre === 'caja') extra.add(caja(c, 0xb08850));
    }
    const carga = new T.TextureLoader();
    for (const a of m.arucos) {
      const tex = carga.load(`/web/aruco_${a.id}.png`); tex.colorSpace = T.SRGBColorSpace;
      const lado = a.lado * 320 / 240;                          // la imagen trae el margen blanco
      const p = new T.Mesh(new T.PlaneGeometry(lado, lado), new T.MeshBasicMaterial({ map: tex }));
      const [gx, gz] = guia(a.x, a.y);
      p.position.set(gx, a.z, gz); p.rotation.y = a.yaw + Math.PI / 2;
      extra.add(p);
    }
    // cables cortados de la placa: se ocultan en el modelo
    const hay = new Set(m.cables.map(c => c.id));
    for (const id of m.cables_guia) {
      const pieza = S.guia?.[id]?.pieza; const p = pieza && A.PARTS.get(pieza);
      if (p) forzar(p.group, hay.has(id));
    }
  }
  function estado(e) { ultimo = e; }
  function dibujar() {
    requestAnimationFrame(dibujar);
    if (!listo && !preparar()) return;
    if (!ultimo) return;
    const c = ultimo.carrito, now = performance.now() / 1000;
    if (tPrev) recorrido += c.v * Math.min(0.1, now - tPrev);
    tPrev = now;
    const th = c.th, [cx, cz] = guia(c.x - 0.07 * Math.cos(th), c.y - 0.07 * Math.sin(th));
    A.setMech({ cart: { x: recorrido, z: 0 } });
    rig.rotation.y = th;
    rig.position.set(cx - recorrido * Math.cos(th), 0, cz + recorrido * Math.sin(th));
    // rayos de los VL53L0X
    rayos.clear();
    const mont = { VL0: [0.2367, 0, 0], VL1: [-0.15, -0.1892, Math.PI / 2], VL2: [-0.15, 0.1892, -Math.PI / 2] };
    for (const [k, [x, z, a]] of Object.entries(mont)) {
      const d = ultimo.sensores[k]; if (!ultimo.esp32.vivo) continue;
      const L = d >= 8190 ? 1.2 : d / 1000, col = d < 400 ? 0xef6b5e : 0x6e9cff;
      const g = new T.BufferGeometry().setFromPoints([new T.Vector3(x, 0.1885, z), new T.Vector3(x + L * Math.cos(a), 0.1885, z - L * Math.sin(a))]);
      rayos.add(new T.Line(g, new T.LineBasicMaterial({ color: col })));
    }
    if (seguir) {
      const objetivo = new T.Vector3(cx, 0.5, cz), mov = objetivo.clone().sub(A.controls.target);
      A.controls.target.add(mov); A.camera.position.add(mov);
    }
  }
  $('modelo').addEventListener('load', () => setTimeout(() => {
    if (!$('modelo').contentWindow.__aether && !$('modelo').contentDocument?.getElementById('view')) $('sin-modelo').style.display = 'grid';
  }, 4000));
  $('bSeguir').onclick = e => { seguir = !seguir; e.target.classList.toggle('on', seguir); e.target.setAttribute('aria-pressed', seguir); };
  $('bSeguir').classList.add('on');
  $('bArriba').onclick = () => { if (!listo) return; const t = A.controls.target; A.camera.position.set(t.x + 0.01, 7, t.z); };
  $('bCamara').onclick = e => { $('camMarco').hidden = verCamara; verCamara = !verCamara; e.target.classList.toggle('on', verCamara); e.target.setAttribute('aria-pressed', verCamara); };
  requestAnimationFrame(dibujar);
  return { mundo, estado };
})();

// ------------------------------------------------------------------ misión, joystick y casos
$('mIda').onclick = () => mandar({ accion: 'mision', ruta: 'ida' });
$('mVuelta').onclick = () => mandar({ accion: 'mision', ruta: 'vuelta' });
$('mCiclo').onclick = () => mandar({ accion: 'mision', ruta: 'ciclo' });
$('mDetener').onclick = () => mandar({ accion: 'detener_mision' });
$('vmax').oninput = e => { $('vmaxV').textContent = (+e.target.value).toFixed(2) + ' m/s'; mandar({ accion: 'usb_enviar', texto: 'VMAX ' + e.target.value }); };
const pad = { x: 0, y: 0, activo: false, teclas: new Set() }, padEl = $('pad');
function padMover(ev) {
  const r = padEl.getBoundingClientRect(), R = r.width / 2 - 29;
  let dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2); const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; }
  pad.x = dx / R; pad.y = -dy / R; padEl.firstElementChild.style.transform = `translate(${dx}px, ${dy}px)`;
}
padEl.addEventListener('pointerdown', e => { pad.activo = true; padEl.setPointerCapture(e.pointerId); padMover(e); });
padEl.addEventListener('pointermove', e => pad.activo && padMover(e));
const padSoltar = () => { pad.activo = false; pad.x = pad.y = 0; padEl.firstElementChild.style.transform = ''; };
padEl.addEventListener('pointerup', padSoltar); padEl.addEventListener('pointercancel', padSoltar);
addEventListener('keydown', e => { if (e.target.tagName !== 'INPUT' && e.key.startsWith('Arrow')) { pad.teclas.add(e.key); e.preventDefault(); } });
addEventListener('keyup', e => pad.teclas.delete(e.key));
setInterval(() => {                                   // 10 veces por segundo, como un control remoto
  const t = pad.teclas; let x = pad.x, y = pad.y;
  if (t.size) { x = (t.has('ArrowRight') ? 1 : 0) - (t.has('ArrowLeft') ? 1 : 0); y = (t.has('ArrowUp') ? 1 : 0) - (t.has('ArrowDown') ? 1 : 0); }
  if (!pad.activo && !t.size) { if (pad.enviado) { pad.enviado = false; } return; }
  const vmax = +$('vmax').value, v = y * vmax, w = -x * 1.2, b = 0.259;
  pad.enviado = true; mandar({ accion: 'usb_enviar', texto: `MAN ${(v - w * b / 2).toFixed(3)} ${(v + w * b / 2).toFixed(3)}` });
}, 100);
let casosPintados = false;
function pintarCasos() {
  if (casosPintados || !S.mundo?.casos) return; casosPintados = true;
  $('casos').innerHTML = S.mundo.casos.map(c => `<div class="caso" id="caso-${c.id}"><div class="caso-cab"><h3>${c.nombre}</h3><button class="b chico" data-caso="${c.id}">Probar</button></div>
    <details><summary>qué pasa</summary><p>${c.descripcion}</p><p class="tenue">${c.esperado}</p></details></div>`).join('');
  document.querySelectorAll('[data-caso]').forEach(b => b.onclick = () => mandar({ accion: 'caso', nombre: b.dataset.caso }));
}
const _antes = ws.onmessage;
ws.onmessage = ev => {
  _antes(ev); const m = JSON.parse(ev.data);
  if (m.tipo === 'mundo') pintarCasos();
  if (m.tipo === 'estado') {
    $('mEstado').textContent = m.mision ? 'Programa de la Jetson corriendo…' : 'Programa de la Jetson detenido.';
    document.querySelectorAll('.caso').forEach(c => c.classList.toggle('activo', c.id === 'caso-' + m.caso));
  }
};
// ------------------------------------------------------------------ programar
const PLANTILLA = `# Programa del carrito. Empieza acoplado en la banda, mirando a la banda.
retroceder(0.60)          # avisa por Lumina y retrocede despacio
girar_a(180)
avanzar(1.0)
decir(f"batería {carrito.bateria()} V")
`;
$('pCodigo').value = PLANTILLA;
$('pCodigo').addEventListener('keydown', e => {                // la tecla Tab escribe 4 espacios en vez de saltar de campo
  if (e.key === 'Tab') { e.preventDefault(); const t = e.target, i = t.selectionStart; t.setRangeText('    ', i, t.selectionEnd, 'end'); }
});
const nombreValido = () => /^[A-Za-z0-9_-]{1,40}$/.test($('pNombre').value) ? $('pNombre').value : null;
function guardarProg() {
  const n = nombreValido(); if (!n) { $('pEstado').textContent = 'El nombre solo puede tener letras, números, guion y guion bajo.'; return false; }
  mandar({ accion: 'prog_guardar', nombre: n, codigo: $('pCodigo').value }); return true;
}
$('pGuardar').onclick = () => { if (guardarProg()) $('pEstado').textContent = 'Guardado en edge/navigation/programas/' + $('pNombre').value + '.py'; };
$('pEjecutar').onclick = () => { if (guardarProg()) mandar({ accion: 'prog_ejecutar', nombre: $('pNombre').value }); };
$('pDetener').onclick = () => mandar({ accion: 'prog_detener' });
$('pAbrir').onclick = () => { if ($('pLista').value) mandar({ accion: 'prog_leer', nombre: $('pLista').value }); };
$('pActualizar').onclick = () => mandar({ accion: 'prog_listar' });
const _antes2 = ws.onmessage;
ws.onmessage = ev => {
  _antes2(ev); const m = JSON.parse(ev.data);
  if (m.tipo === 'programas') { $('pLista').innerHTML = m.lista.map(n => `<option>${n}</option>`).join(''); if (m.guardado) $('pLista').value = m.guardado; }
  else if (m.tipo === 'programa') { $('pCodigo').value = m.codigo; $('pNombre').value = m.nombre; $('pEstado').textContent = 'Abierto: ' + m.nombre; }
  else if (m.tipo === 'estado') {
    $('pEstado').dataset.corriendo = m.prog.corriendo; $('pDetener').classList.toggle('on', m.prog.corriendo);
    const sal = $('pSalida'), abajo = sal.scrollTop + sal.clientHeight >= sal.scrollHeight - 20;
    if (m.prog.salida.length) { sal.textContent = m.prog.salida.join(String.fromCharCode(10)); if (abajo) sal.scrollTop = sal.scrollHeight; }
  }
};
Tutorial.pintar($('p-tutorial'), mandar);
