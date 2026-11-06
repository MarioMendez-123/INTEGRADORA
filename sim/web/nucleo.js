// Núcleo del simulador en JavaScript: el mismo modelo que sim/nucleo/*.py, para que corra solo en el
// navegador (teléfono incluido). Las pruebas están en sim/pruebas/nucleo_js.test.cjs.
'use strict';
(function (global) {
  const G = 9.81, RPM = 2 * Math.PI / 60;
  // ------------------------------------------------------------------ parámetros (los mueve la pestaña Física/Eléctrico)
  const P = {
    masa: 40, mu: 0.7, normal: 85, crr: 0.03, giroRodajas: 0.6, mRueda: 1.4,
    vBatLlena: 12.9, vBatVacia: 11.8, ahBat: 24, rInterna: 0.02, fus15: 15, fus10: 5, iCC: 6,
    vElev: 18, vXl: 5.05, rpmVacio: 200, parNominal: 0.96, rpmNominal: 115, vMinMotor: 12, kt: 0.75, rFase: 2.15,
    tSinTrama: 0.06, kp: 0.35, ki: 2.5, frenoKd: 1.2, iJetson: 1.2, ruidoVl: 0.02, derivaImu: 0.0,
  };
  const R_RUEDA = 0.051, VIA = 0.259, EJE_X = 0.07, LARGO = 0.5, ANCHO = 0.4;

  // ------------------------------------------------------------------ geometría
  function caja(cx, cy, hx, hy, ang = 0, nombre = '', alto = 1, base = 0) { return { cx, cy, hx, hy, ang, nombre, alto, base }; }
  function ejes(c) { const a = Math.cos(c.ang), s = Math.sin(c.ang); return [[a, s], [-s, a]]; }
  function esquinas(c) { const [[ax, ay], [bx, by]] = ejes(c); return [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([i, j]) => [c.cx + i * c.hx * ax + j * c.hy * bx, c.cy + i * c.hx * ay + j * c.hy * by]); }
  function separacion(a, b) {
    const ca = esquinas(a), cb = esquinas(b); let mejor = null;
    for (const e of [...ejes(a), ...ejes(b)]) {
      const pa = ca.map(([x, y]) => x * e[0] + y * e[1]), pb = cb.map(([x, y]) => x * e[0] + y * e[1]);
      const sol = Math.min(Math.max(...pa), Math.max(...pb)) - Math.max(Math.min(...pa), Math.min(...pb));
      if (sol <= 0) return null;
      if (!mejor || sol < mejor[0]) { const d = (a.cx - b.cx) * e[0] + (a.cy - b.cy) * e[1], s = d >= 0 ? 1 : -1; mejor = [sol, e[0] * s, e[1] * s]; }
    }
    return mejor;
  }
  function rayoCaja(ox, oy, dx, dy, c) {
    const [[ax, ay], [bx, by]] = ejes(c), rx = ox - c.cx, ry = oy - c.cy;
    const o = [rx * ax + ry * ay, rx * bx + ry * by], d = [dx * ax + dy * ay, dx * bx + dy * by];
    let tmin = -Infinity, tmax = Infinity;
    for (const [k, h] of [[0, c.hx], [1, c.hy]]) {
      if (Math.abs(d[k]) < 1e-12) { if (Math.abs(o[k]) > h) return null; continue; }
      const t1 = (-h - o[k]) / d[k], t2 = (h - o[k]) / d[k];
      tmin = Math.max(tmin, Math.min(t1, t2)); tmax = Math.min(tmax, Math.max(t1, t2));
    }
    if (tmax < Math.max(tmin, 0)) return null;
    return tmin >= 0 ? tmin : 0;
  }

  // ------------------------------------------------------------------ mundo (mismo que sim/nucleo/mundo.py)
  const F = 0.18;
  function bocas(abre = 0.24, largo = 0.18, grueso = 0.02) {
    const c = Math.cos(abre), s = Math.sin(abre), x0 = F - 0.18, y0 = 0.20075;
    const cx = x0 - largo / 2 * c + grueso / 2 * s, cy = y0 + largo / 2 * s + grueso / 2 * c;
    return [caja(cx, cy, largo / 2, grueso / 2, -abre, 'boca de la guía izquierda', 0.3), caja(cx, -cy, largo / 2, grueso / 2, abre, 'boca de la guía derecha', 0.3)];
  }
  const ESTACIONES = () => [
    caja(F + 0.03 + 1.545, 0, 1.545, 0.17, 0, 'banda', 0.8215),
    caja(F + 0.015, 0.11, 0.015, 0.02, 0, 'tope izquierdo', 0.3), caja(F + 0.015, -0.11, 0.015, 0.02, 0, 'tope derecho', 0.3),
    caja(F - 0.09, 0.21075, 0.09, 0.01, 0, 'guía en V izquierda', 0.3), caja(F - 0.09, -0.21075, 0.09, 0.01, 0, 'guía en V derecha', 0.3),
    ...bocas(),
    caja(-3.82, 2.33, 0.70, 0.15, 0, 'descarga', 0.83),
    caja(F + 0.105, -0.30, 0.02, 0.02, 0, 'poste ArUco 0', 1.6), caja(-4.60, 2.27, 0.02, 0.02, 0, 'poste ArUco 1', 1.6),
  ];
  const ARUCOS = [{ id: 0, x: F + 0.105 - 0.021, y: -0.30, z: 1.5, yaw: Math.PI, lado: 0.2 }, { id: 1, x: -4.60, y: 2.27 - 0.021, z: 1.5, yaw: -Math.PI / 2, lado: 0.2 }];

  // ------------------------------------------------------------------ física (fisica.py)
  class Carrito {
    constructor() { this.x = this.y = this.th = this.v = this.w = 0; this.izq = { lado: 1, omega: 0, patina: false }; this.der = { lado: -1, omega: 0, patina: false }; this.contactos = []; }
    get inercia() { return P.masa * (LARGO ** 2 + ANCHO ** 2) / 12; }
    get jRueda() { return 0.5 * P.mRueda * R_RUEDA ** 2; }
    caja(x = this.x, y = this.y, th = this.th) { return caja(x - EJE_X * Math.cos(th), y - EJE_X * Math.sin(th), LARGO / 2, ANCHO / 2, th, 'carrito'); }
    aMundo(px, py) { const c = Math.cos(this.th), s = Math.sin(this.th); return [this.x + px * c - py * s, this.y + px * s + py * c]; }
    vSuelo(r) { return this.v - r.lado * this.w * VIA / 2; }
    paso(dt, parI, parD, obst) {
      const lim = P.mu * P.normal, f = [];
      for (const [r, par] of [[this.izq, parI], [this.der, parD]]) {
        const vs = this.vSuelo(r); let fr = par / R_RUEDA;
        if (!r.patina) { if (Math.abs(fr) > lim) r.patina = true; else r.omega = vs / R_RUEDA; }
        if (r.patina) {
          const d = r.omega * R_RUEDA - vs; fr = Math.abs(d) > 1e-4 ? Math.sign(d) * lim : par / R_RUEDA;
          r.omega += (par - fr * R_RUEDA) / this.jRueda * dt;
          if (Math.abs(r.omega * R_RUEDA - vs) < 0.005 && Math.abs(par / R_RUEDA) <= lim) r.patina = false;
        }
        f.push(fr);
      }
      const mEff = P.masa + [this.izq, this.der].filter(r => !r.patina).length * this.jRueda / R_RUEDA ** 2;
      this.v += (f[0] + f[1] - P.crr * P.masa * G * Math.tanh(this.v / 0.02)) / mEff * dt;
      this.w += ((f[1] - f[0]) * VIA / 2 - P.giroRodajas * Math.tanh(this.w / 0.05)) / this.inercia * dt;
      this.th += this.w * dt; this.x += this.v * Math.cos(this.th) * dt; this.y += this.v * Math.sin(this.th) * dt;
      this.contactos = [];
      for (let it = 0; it < 3; it++) {
        let emp = null;
        for (const o of obst) { const s = separacion(this.caja(), o); if (s && (!emp || s[0] > emp[0])) emp = [...s, o.nombre]; }
        if (!emp) break;
        const [prof, nx, ny, nom] = emp; this.contactos.push(nom);
        this.x += nx * (prof + 1e-5); this.y += ny * (prof + 1e-5);
        const hx = Math.cos(this.th), hy = Math.sin(this.th);
        if (this.v * hx * nx + this.v * hy * ny < 0) { const hn = hx * nx + hy * ny; this.v *= 1 - hn * hn; }
        this.w *= 0.5;
      }
      for (const r of [this.izq, this.der]) if (!r.patina) r.omega = this.vSuelo(r) / R_RUEDA;
    }
  }

  // ------------------------------------------------------------------ M0601 (m0601.py)
  function crc8(d, n = d.length) { let c = 0; for (let i = 0; i < n; i++) { c ^= d[i]; for (let k = 0; k < 8; k++) c = (c & 1) ? (c >> 1) ^ 0x8C : c >> 1; } return c; }
  function trama(...b) { const t = b.map(x => x & 255); t.push(crc8(t)); return t; }
  class M0601 {
    constructor(id, nombre) { Object.assign(this, { id, nombre, modo: 2, alimentado: false, voltaje: 0, objetivo: 0, rampa: 0, acc: 0, freno: false, ultima: -1e9, integral: 0, par: 0, omega: 0, angulo: 0, error: 0, tBloq: 0, ok: 0, malas: 0, invertido: false }); }
    corriente() { return this.alimentado ? 0.12 + Math.abs(this.par) / P.kt : 0; }
    corrienteFuente() { if (!this.alimentado) return 0; const i = Math.abs(this.par) / P.kt; return 0.12 + Math.max(0, this.par * this.omega + i * i * P.rFase) / Math.max(this.voltaje, 1); }   // m0601.py: corriente_fuente
    recibir(d, t) {
      if (!this.alimentado || d.length !== 10) return null;
      if (d[0] === 0xAA && d[1] === 0x55 && d[2] === 0x53) { this.id = d[3]; return null; }
      if (d[0] !== this.id) return null;
      if (d[1] === 0xA0) { this.modo = d[9]; return null; }
      if (crc8(d, 9) !== d[9]) { this.malas++; return null; }
      this.ok++;
      if (d[1] === 0x64) {
        let v = (d[2] << 8) | d[3]; if (v & 0x8000) v -= 0x10000;
        this.objetivo = Math.max(-P.rpmVacio, Math.min(P.rpmVacio, v)); this.acc = d[6]; this.freno = d[7] === 0xFF; this.ultima = t;
        if (this.modo !== 2) this.objetivo = 0;
      } else if (d[1] !== 0x74) return null;
      const s = this.invertido ? -1 : 1, rpm = Math.round(s * this.omega / RPM) & 0xFFFF, cor = Math.round(this.corriente() * 125) & 0xFFFF;
      const pos = Math.floor(((this.angulo % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * 32767);
      return trama(this.id, this.modo, cor >> 8, cor, rpm >> 8, rpm, pos >> 8, pos, this.error);
    }
    actualizar(t, dt, omegaRueda) {
      const s = this.invertido ? -1 : 1; this.omega = omegaRueda * s; this.angulo += this.omega * dt;
      this.alimentado = this.voltaje >= P.vMinMotor;
      if (!this.alimentado) { this.par = this.integral = this.error = 0; return 0; }
      const esc = this.voltaje / 18, w0 = P.rpmVacio * RPM * esc, parMax = P.parNominal / (1 - P.rpmNominal / P.rpmVacio) * esc;
      if (t - this.ultima > P.tSinTrama) { this.par = this.integral = this.rampa = this.tBloq = 0; return 0; }
      let par;
      if (this.freno && this.objetivo === 0) par = -P.frenoKd * this.omega;
      else {
        if (!this.acc) this.rampa = this.objetivo; else { const p = dt / (this.acc * 1e-4); this.rampa += Math.max(-p, Math.min(p, this.objetivo - this.rampa)); }
        const e = this.rampa * RPM - this.omega; this.integral = Math.max(-3, Math.min(3, this.integral + e * dt)); par = P.kp * e + P.ki * this.integral;
      }
      const lim = par * this.omega > 0 ? Math.max(0, parMax * (1 - Math.abs(this.omega) / w0)) : parMax;
      par = Math.max(-lim, Math.min(lim, par));
      this.tBloq = Math.abs(par) > 0.8 * parMax && Math.abs(this.omega) < 0.5 ? this.tBloq + dt : 0;
      this.error = this.tBloq > 1 ? 0x08 : 0; this.par = par;
      return par * s;
    }
  }

  // ------------------------------------------------------------------ circuito (electrico.py)
  const EXTRA = {
    'BAT.+': 'Batería · borne +', 'BAT.-': 'Batería · borne −', 'F15.in': 'Fusible 15 A · entrada', 'F15.out': 'Fusible 15 A · salida', 'F10.in': 'Fusible 5 A · entrada', 'F10.out': 'Fusible 5 A · salida',
    'KCD.a': 'KCD1 · pata 1', 'KCD.b': 'KCD1 · pata 2', 'PARO.1': 'Paro (NC) · borne 1', 'PARO.2': 'Paro (NC) · borne 2',
    'RELE.VCC': 'Relé · VCC', 'RELE.GND': 'Relé · GND', 'RELE.COM': 'Relé · COM', 'RELE.NO': 'Relé · NO',
    'ELEV.IN+': 'Elevador · IN+', 'ELEV.IN-': 'Elevador · IN−', 'ELEV.OUT+': 'Elevador · OUT+ (18 V)', 'ELEV.OUT-': 'Elevador · OUT−',
    'XL.IN+': 'XL4005 · IN+', 'XL.IN-': 'XL4005 · IN−', 'XL.OUT+': 'XL4005 · OUT+ (5 V)', 'XL.OUT-': 'XL4005 · OUT−', 'JET.+12': 'Jetson · 12 V', 'JET.GND': 'Jetson · GND',
    'ML.V+': 'M0601 izq. · V+', 'ML.GND': 'M0601 izq. · GND', 'ML.A': 'M0601 izq. · A', 'ML.B': 'M0601 izq. · B', 'MR.V+': 'M0601 der. · V+', 'MR.GND': 'M0601 der. · GND', 'MR.A': 'M0601 der. · A', 'MR.B': 'M0601 der. · B',
    'VM.+': 'Voltímetro · rojo (+)', 'VM.-': 'Voltímetro · negro (−)', 'C18.+': 'Capacitor 1000 µF (18 V) · pata +', 'C18.-': 'Capacitor 1000 µF (18 V) · franja (−)',
  };
  const VL = { VL0: 'VL53L0X frontal', VL1: 'VL53L0X izquierdo', VL2: 'VL53L0X derecho', VLP: 'VL53L0X de la pila' };
  for (const [k, n] of Object.entries(VL)) for (const p of ['VIN', 'GND', 'SDA', 'SCL', ...(k !== 'VLP' ? ['XSHUT'] : [])]) EXTRA[`${k}.${p}`] = `${n} · ${p}`;
  const FIN = { FC1: 'Final 1', FC2: 'Final 2', FC3: 'Final 3', FC4: 'Final 4 (superior)' };
  for (const [k, n] of Object.entries(FIN)) { EXTRA[`${k}.S`] = `${n} · señal (NC)`; EXTRA[`${k}.G`] = `${n} · tierra`; }
  const ARNES = [['BAT.+', 'F15.in', 'Potencia', 'cRed'], ['BAT.+', 'F10.in', 'Potencia', 'cRed'], ['BAT.-', 'ELEV.IN-', 'Potencia', 'cBlk'],
    ['F10.out', 'KCD.a', 'Rama auxiliar', 'cRed'], ['KCD.b', 'XL.IN+', 'Rama auxiliar', 'cRed'], ['XL.IN+', 'JET.+12', 'Rama auxiliar', 'cRed'], ['ELEV.IN-', 'JET.GND', 'Rama auxiliar', 'cBlk'],
    ['XL.IN+', 'PARO.1', 'Paro y relé', 'cRed'], ['PARO.2', 'RELE.VCC', 'Paro y relé', 'cRed'], ['ELEV.IN-', 'RELE.GND', 'Paro y relé', 'cBlk'], ['F15.out', 'RELE.COM', 'Paro y relé', 'cRed'],
    ['RELE.NO', 'ELEV.IN+', 'Rama de motores', 'cRed'], ['RELE.NO', 'J1.+12V', 'Rama de motores', 'cRed'], ['ELEV.IN-', 'J1.GND', 'Rama de motores', 'cBlk'], ['ELEV.IN-', 'XL.IN-', 'Rama auxiliar', 'cBlk'],
    ['XL.OUT+', 'J2.+5V', 'Rama auxiliar', 'cOra'], ['XL.OUT-', 'J2.GND', 'Rama auxiliar', 'cBlk'], ['XL.IN+', 'J2.+12V AUX', 'Rama auxiliar', 'cRed'], ['RELE.VCC', 'J13.PARO', 'Paro y relé', 'cRed'],
    ['ELEV.OUT+', 'ML.V+', 'Motores M0601', 'cRed'], ['ELEV.OUT+', 'MR.V+', 'Motores M0601', 'cRed'], ['ELEV.OUT-', 'ML.GND', 'Motores M0601', 'cBlk'], ['ELEV.OUT-', 'MR.GND', 'Motores M0601', 'cBlk'],
    ['J3.A', 'ML.A', 'Motores M0601', 'cLbl'], ['ML.A', 'MR.A', 'Motores M0601', 'cLbl'], ['J3.B', 'ML.B', 'Motores M0601', 'cLim'], ['ML.B', 'MR.B', 'Motores M0601', 'cLim'], ['J3.GND', 'ML.GND', 'Motores M0601', 'cBlk']];
  for (const k of Object.keys(VL)) ARNES.push(['J5.3V3', `${k}.VIN`, 'Sensores VL53L0X', 'cPnk'], ['J5.GND', `${k}.GND`, 'Sensores VL53L0X', 'cBlk'], ['J5.SDA', `${k}.SDA`, 'Sensores VL53L0X', 'cYel'], ['J5.SCL', `${k}.SCL`, 'Sensores VL53L0X', 'cWht']);
  ARNES.push(['J6.X0', 'VL0.XSHUT', 'Sensores VL53L0X', 'cOli'], ['J6.X1', 'VL1.XSHUT', 'Sensores VL53L0X', 'cOli'], ['J6.X2', 'VL2.XSHUT', 'Sensores VL53L0X', 'cOli']);
  for (const i of [1, 2, 3]) ARNES.push([`J4.FC${i}`, `FC${i}.S`, 'Finales de carrera', 'cBei'], [`J4.GND${i}`, `FC${i}.G`, 'Finales de carrera', 'cBlk']);
  ARNES.push(['J13.FC4', 'FC4.S', 'Finales de carrera', 'cBei'], ['J13.GND4', 'FC4.G', 'Finales de carrera', 'cBlk']);
  ARNES.push(['XL.IN+', 'VM.+', 'Voltímetro', 'cRed'], ['VM.-', 'XL.IN-', 'Voltímetro', 'cBlk'], ['ELEV.OUT+', 'C18.+', 'Capacitor de 18 V', 'cRed'], ['C18.-', 'ELEV.OUT-', 'Capacitor de 18 V', 'cBlk']);   // rev. 3.17d, al final para no mover los h1, h2…
  const UNIDOS = [['E.GND1', 'E.GND2'], ['E.GND1', 'E.GNDL'], ['L.GNDL', 'L.GNDH'], ['XL.IN-', 'XL.OUT-'], ['ELEV.IN-', 'ELEV.OUT-'], ['A1.PGND', 'A1.LGND'], ['A2.PGND', 'A2.LGND'], ['A3.PGND', 'A3.LGND']];
  const RES = { R1: 100e3, R2: 20e3, R3: 100e3, R4: 20e3, R5: 10e3, REN: 10e3 };

  class Circuito {
    constructor(placa) {
      this.nombres = { ...placa.pines, ...EXTRA };
      this.guia = placa.cables.map(c => ({ id: 'p' + c.n, de: c.from, a: c.to, grupo: c.group, color: c.mat, pieza: c.id }))
        .concat(ARNES.map(([de, a, g, col], i) => ({ id: 'h' + (i + 1), de, a, grupo: g, color: col })));
      this.cables = this.guia.map(c => ({ ...c }));
      Object.assign(this, { kcd1: false, paro: false, finales: new Set(), fusOk: { F15: true, F10: true }, danos: {}, salidas: {}, rele: false, ah: 0, iMot: 0, fCc: 1, tSobre: { F15: 0, F10: 0 }, corr: { F15: 0, F10: 0, bat: 0, motores: 0 }, avisos: [], redes: {}, v: {}, n: 0 });
      this.evaluar();
    }
    reiniciar() { this.cables = this.guia.map(c => ({ ...c })); }
    cortar(id) { this.cables = this.cables.filter(c => c.id !== id); this.evaluar(); }
    conectar(de, a) { if (!(de in this.nombres) || !(a in this.nombres) || de === a) throw new Error('pin desconocido'); const id = 'u' + (++this.n); this.cables.push({ id, de, a, grupo: 'Tus cables', color: 'cMag' }); this.evaluar(); return id; }
    reparar() { this.fusOk = { F15: true, F10: true }; this.danos = {}; }
    uniones(sinFus) {
      const p = {}; const r = a => { if (!(a in p)) p[a] = a; while (p[a] !== a) { p[a] = p[p[a]]; a = p[a]; } return a; };
      const u = (a, b) => { const x = r(a), y = r(b); if (x !== y) p[x] = y; };
      for (const k in this.nombres) r(k);
      for (const c of this.cables) u(c.de, c.a);
      for (const [a, b] of UNIDOS) u(a, b);
      for (const f of ['F15', 'F10']) if (this.fusOk[f] && !sinFus) u(f + '.in', f + '.out');
      if (this.kcd1) u('KCD.a', 'KCD.b');
      if (!this.paro) u('PARO.1', 'PARO.2');
      if (this.rele) u('RELE.COM', 'RELE.NO');
      for (const k of Object.keys(FIN)) if (!this.finales.has(k)) u(k + '.S', k + '.G');
      return r;
    }
    red(p) { return this.redes[p] ?? p; }
    volt(p) { const v = this.v[this.red(p)]; return v === undefined ? null : v; }
    dif(a, b) { const x = this.volt(a), y = this.volt(b); return x !== null && y !== null ? x - y : 0; }
    unidos(a, b) { return this.red(a) === this.red(b); }
    moduloOk(n, vcc, gnd, vmin) { return !this.danos[n] && this.dif(vcc, gnd) >= vmin && this.red(gnd) === this.red('BAT.-'); }
    evaluar(dt = 0) {
      this.avisos = [];
      const soc = Math.max(0, 1 - this.ah / P.ahBat), voc = P.vBatVacia + (P.vBatLlena - P.vBatVacia) * soc;
      const vBat = voc - this.corr.bat * P.rInterna;
      let espVivo = false, xlOk = false, elevOk = false;
      for (let it = 0; it < 8; it++) {
        const r0 = this.uniones(true); let quemado = false;
        for (const f of ['F15', 'F10']) if (this.fusOk[f] && r0(f + '.out') === r0('BAT.-')) { this.fusOk[f] = false; this.avisos.push(`Se quemó el fusible ${f === 'F15' ? P.fus15 : P.fus10} A: su salida quedó en corto con la tierra`); quemado = true; }
        const r = this.uniones(false); this.redes = {}; for (const k in this.nombres) this.redes[k] = r(k);
        if (quemado) continue;
        const tierra = this.red('BAT.-'), fijas = { [tierra]: 0 };
        const fijar = (pin, val) => { const n = this.red(pin); if (n in fijas && Math.abs(fijas[n] - val) > 0.3) return false; fijas[n] = val; return true; };
        if (this.red('BAT.+') === tierra) this.danos.BAT = 'Corto directo en la batería: sin fusible de por medio, el cable se quemaría';
        else fijar('BAT.+', vBat);
        const vxl = this.red('XL.IN-') === tierra ? fijas[this.red('XL.IN+')] : undefined;
        xlOk = vxl !== undefined && vxl >= 6.5 && vxl <= 32 && !this.danos.XL;
        if (xlOk && this.red('XL.OUT+') === tierra) { this.avisos.push('El XL4005 tiene la salida en corto: se protege y no entrega nada'); xlOk = false; }
        if (xlOk) fijar('XL.OUT+', P.vXl);
        if (P.vXl > 6.5 && xlOk) this.avisos.push(`El XL4005 está ajustado a ${P.vXl.toFixed(1)} V: la guía pide 5.0–5.1 V`);
        const vel = this.red('ELEV.IN-') === tierra ? fijas[this.red('ELEV.IN+')] : undefined;
        elevOk = vel !== undefined && vel >= 9.5 && vel <= 16 && !this.danos.ELEV;
        if (elevOk && this.red('ELEV.OUT+') !== tierra) fijar('ELEV.OUT+', (vel >= 10.5 ? P.vElev : P.vElev * (vel - 9.5)) * this.fCc);
        const v5 = this.red('E.GND1') === tierra ? fijas[this.red('E.5V')] : undefined;
        if (v5 !== undefined && v5 > 6.5 && !this.danos.ESP32) this.danos.ESP32 = `Le entraron ${v5.toFixed(1)} V por el pin 5V (máximo ~6 V): ESP32 quemado`;
        espVivo = v5 !== undefined && v5 >= 4.3 && v5 <= 6.5 && !this.danos.ESP32;
        if (espVivo && this.red('E.3V3') !== tierra) fijar('E.3V3', 3.3); else if (espVivo) { espVivo = false; this.avisos.push('3V3 del ESP32 en corto con tierra'); }
        if (espVivo) for (const [g, n] of Object.entries(this.salidas)) if (!fijar('E.' + g, 3.3 * n)) this.danos['GPIO' + g] ??= `GPIO ${g} manda ${n} pero su red está fija a otro voltaje: el pin se daña`;
        this.v = this.nodal(fijas);
        const rele = this.dif('RELE.VCC', 'RELE.GND') >= 9;
        if (rele !== this.rele) { this.rele = rele; continue; }
        break;
      }
      Object.assign(this, { espVivo, xlOk, elevOk });
      this.revisar(); this.corrientes(dt, vBat);
    }
    nodal(fijas) {
      const ar = [];
      for (const [n, r] of Object.entries(RES)) { const a = this.red(n + '.a'), b = this.red(n + '.b'); if (a !== b) ar.push([a, b, 1 / r]); }
      for (const k of ['VL0', 'VL1', 'VL2']) ar.push([this.red(k + '.XSHUT'), this.red(k + '.VIN'), 1e-4]);
      const v = { ...fijas }, inc = [...new Set(ar.flatMap(([a, b]) => [a, b]))].filter(n => !(n in fijas));
      inc.forEach(n => (v[n] = 0));
      const con = new Set(Object.keys(fijas)); let cam = true;
      while (cam) { cam = false; for (const [a, b] of ar) if (con.has(a) !== con.has(b)) { con.add(con.has(b) ? a : b); cam = true; } }
      const vec = {}; for (const n of inc) vec[n] = [];
      for (const [a, b, c] of ar) { if (a in vec && con.has(b)) vec[a].push([b, c]); if (b in vec && con.has(a)) vec[b].push([a, c]); }
      for (let i = 0; i < 400; i++) {                       // Gauss-Seidel hasta que deje de cambiar
        let cambio = 0;
        for (const n of inc) {
          const l = vec[n]; if (!con.has(n) || !l.length) continue;
          let s = 0, g = 0; for (const [m, c] of l) { s += c * v[m]; g += c; }
          cambio = Math.max(cambio, Math.abs(s / g - v[n])); v[n] = s / g;
        }
        if (cambio < 1e-7) break;
      }
      const out = {}; for (const n of new Set([...Object.keys(v), ...Object.values(this.redes)])) out[n] = con.has(n) ? v[n] : (n in v ? null : null);
      for (const n in fijas) out[n] = fijas[n];
      return out;
    }
    revisar() {
      for (const k in this.nombres) {
        if (!/^E\.\d+$/.test(k)) continue; const g = +k.slice(2), v = this.volt(k);
        if (v !== null && v > 3.6 && !(g in this.salidas)) { if (v > 6) this.danos.ESP32 ??= `Le entraron ${v.toFixed(1)} V al GPIO ${g}: el ESP32 se quema (máximo 3.6 V)`; else this.danos['GPIO' + g] ??= `${v.toFixed(1)} V en el GPIO ${g} (máximo 3.6 V): pin dañado`; }
      }
      const mods = { MAX485: ['M.VCC', 'M.GND', 7], BNO055: ['B.VIN', 'B.GND', 6] };
      for (const k of Object.keys(VL)) mods[k] = [k + '.VIN', k + '.GND', 6];
      for (const [n, [a, b, vmax]] of Object.entries(mods)) { const d = this.dif(a, b); if (d < -1) this.danos[n] ??= `${n}: polaridad invertida`; else if (d > vmax) this.danos[n] ??= `${n}: le llegan ${d.toFixed(1)} V (máximo ${vmax} V)`; }
      for (const [m, l] of [['ML', 'izquierdo'], ['MR', 'derecho']]) if (this.dif(m + '.V+', m + '.GND') < -1) this.danos[m] ??= `M0601 ${l}: polaridad invertida`;
    }
    corrientes(dt, vBat) {
      let aux = 0;
      if (this.xlOk) aux += P.vXl * ((this.espVivo ? 0.15 : 0) + 0.01) / 0.88 / Math.max(vBat, 1);
      if (this.dif('JET.+12', 'JET.GND') > 9) aux += P.iJetson;
      if (this.rele) aux += 0.07;
      this.fCc = this.iMot > P.iCC ? Math.max(0, this.fCc - 3 * dt) : Math.min(1, this.fCc + 3 * dt);   // electrico.py: límite CC del elevador
      if (this.fCc < 1) this.avisos.push(`El elevador llegó a su límite de ${P.iCC.toFixed(1)} A: bajó el voltaje de las ruedas`);
      const mot = this.elevOk ? P.vElev * this.fCc * this.iMot / 0.9 / Math.max(vBat, 1) : 0;
      this.corr = { F15: this.fusOk.F15 ? mot : 0, F10: this.fusOk.F10 ? aux : 0, motores: this.elevOk ? this.iMot : 0 }; this.corr.bat = this.corr.F15 + this.corr.F10;
      this.ah += this.corr.bat * dt / 3600;
      for (const [f, nom] of [['F15', P.fus15], ['F10', P.fus10]]) {
        const i = this.corr[f]; this.tSobre[f] = i > 2 * nom ? this.tSobre[f] + dt : 0;
        if (this.fusOk[f] && (i > 4 * nom || this.tSobre[f] > 1)) { this.fusOk[f] = false; this.avisos.push(`Se quemó el fusible ${nom} A por sobrecorriente (${i.toFixed(0)} A)`); }
      }
    }
    nivel(g) { if (!this.espVivo || this.danos['GPIO' + g]) return null; const v = this.volt('E.' + g); return v === null ? null : v > 1.6 ? 1 : 0; }
    mv(g) { const v = this.espVivo ? this.volt('E.' + g) : null; return v === null ? 0 : Math.round(Math.max(0, Math.min(3.3, v)) * 1000); }
    estado() {
      const r = p => { const x = this.volt(p); return x === null ? null : +x.toFixed(2); };
      return { kcd1: this.kcd1, paro: this.paro, rele: this.rele, fusibles: { ...this.fusOk }, corrientes: Object.fromEntries(Object.entries(this.corr).map(([k, v]) => [k, +v.toFixed(2)])),
        v: { bateria: r('BAT.+'), xl4005: +this.dif('XL.OUT+', 'XL.OUT-').toFixed(2), elevador: +this.dif('ELEV.OUT+', 'ELEV.OUT-').toFixed(2), esp32_3v3: r('E.3V3'), gpio34: r('E.34'), gpio39: r('E.39'), gpio35: r('E.35') },
        esp32_vivo: this.espVivo, elevador_cc: this.fCc < 1, danos: { ...this.danos }, avisos: [...this.avisos], finales: [...this.finales].sort(), ah: +this.ah.toFixed(4) };
    }
  }

  // ------------------------------------------------------------------ ESP32 virtual (esp32.py)
  class Esp32 {
    constructor(c, motores, sens) { Object.assign(this, { c, motores, sens }); this.reiniciar(); }
    reiniciar() { Object.assign(this, { modos: {}, uart2: null, rx2: [], histRe: [], usbRx: '', usbTx: [], i2c: [21, 22], vlDir: {}, vlVivo: {}, cont: { tx_bus: 0, rx_ok: 0, rx_perdidas: 0 } }); this.c.salidas = {}; }
    get vivo() { return this.c.espVivo && !this.c.danos.ESP32; }
    pinMode(g, m, t) { this.modos[g] = m; if (m !== 'O') delete this.c.salidas[g]; this.c.evaluar(); this.anotarRe(t); }
    digitalWrite(g, n, t) {
      if (this.modos[g] !== 'O' || !this.vivo || [34, 35, 36, 39].includes(g)) return;
      n = n ? 1 : 0; if (this.c.salidas[g] !== n) { this.c.salidas[g] = n; this.c.evaluar(); }   // solo si el pin cambió
      this.anotarRe(t);
    }
    digitalRead(g) { if (!this.vivo) return 0; const n = this.c.nivel(g); if (n === null) return this.modos[g] === 'U' ? 1 : this.modos[g] === 'D' ? 0 : Math.random() < 0.5 ? 0 : 1; return n; }
    analogMv(g) { return this.vivo ? this.c.mv(g) : 0; }
    anotarRe(t) { const v = this.c.volt('M.RE'); this.histRe.push([t, v ?? 3.3]); if (this.histRe.length > 400) this.histRe.splice(0, 200); }
    reEn(t) { let v = 3.3; for (const [ti, vi] of this.histRe) { if (ti <= t) v = vi; else break; } return v; }
    caminoTx() {
      const c = this.c; if (!this.uart2) return 'La UART2 no se inició'; const tx = this.uart2[2];
      if (!c.unidos('E.' + tx, 'M.DI')) return `El GPIO ${tx} (TX) no llega al DI del MAX485`;
      if (!c.moduloOk('MAX485', 'M.VCC', 'M.GND', 4.5)) return 'El MAX485 no tiene 5 V o tierra';
      const de = c.volt('M.DE'); if (de === null || de < 2) return 'DE del MAX485 está en 0: no transmite';
      return null;
    }
    caminoRx() {
      const c = this.c, rx = this.uart2[1];
      if (!c.unidos('M.RO', 'L.HV1') || !c.unidos('L.LV1', 'E.' + rx)) return `RO del MAX485 no llega al GPIO ${rx}`;
      if (!(c.dif('L.HV', 'L.GNDH') >= 4.5 && c.dif('L.LV', 'L.GNDL') >= 3)) return 'El convertidor de nivel no tiene sus dos voltajes';
      return null;
    }
    uart2Begin(b, rx, tx) { this.uart2 = [b, rx, tx]; }
    uart2Write(d, t) {
      if (!this.vivo || !this.uart2) return; const baud = this.uart2[0], fin = t + d.length * 10 / baud;
      const mot = this.caminoTx(); if (mot) { this.c.avisos.push(mot); return; }
      this.cont.tx_bus++;
      if (Math.abs(baud - 115200) / 115200 > 0.03) d = d.map(() => Math.floor(Math.random() * 256));
      for (const [m, p] of [[this.motores[0], 'ML'], [this.motores[1], 'MR']]) {
        const dir = this.c.unidos('M.A', p + '.A') && this.c.unidos('M.B', p + '.B'), cru = this.c.unidos('M.A', p + '.B') && this.c.unidos('M.B', p + '.A');
        if (!dir && !cru) continue;
        const llega = dir ? d : d.map(b => b ^ 255);
        for (let k = 0; k + 10 <= llega.length; k += 10) { const r = m.recibir(llega.slice(k, k + 10), fin); if (r) this.rx2.push([fin + 0.0003 + 10 * 10 / 115200, dir ? r : r.map(b => b ^ 255)]); }
      }
    }
    uart2Read(t) {
      if (!this.vivo || !this.uart2) return []; const out = [];
      while (this.rx2.length && this.rx2[0][0] <= t) {
        const [ll, d] = this.rx2.shift();
        if (this.reEn(ll) > 0.8 || this.caminoRx()) { this.cont.rx_perdidas++; continue; }
        this.cont.rx_ok++; out.push(...(Math.abs(this.uart2[0] - 115200) / 115200 > 0.03 ? d.map(() => Math.floor(Math.random() * 256)) : d));
      }
      return out;
    }
    enBus(sda, scl) { return this.c.unidos('E.' + this.i2c[0], sda) && this.c.unidos('E.' + this.i2c[1], scl); }
    vlDisp() {
      const out = {};
      for (const k of Object.keys(VL)) {
        let vivo = this.c.moduloOk(k, k + '.VIN', k + '.GND', 2.6) && this.c.red(k + '.GND') === this.c.red('E.GND1');
        if (vivo && k !== 'VLP') { const x = this.c.volt(k + '.XSHUT'); vivo = x === null || x > 1; }
        if (!vivo) delete this.vlDir[k]; else if (!this.vlVivo[k]) this.vlDir[k] = 0x29;
        this.vlVivo[k] = vivo;
        if (vivo && this.enBus(k + '.SDA', k + '.SCL')) out[k] = this.vlDir[k];
      }
      return out;
    }
    vlInit(a) { return this.vivo && Object.values(this.vlDisp()).filter(d => d === a).length === 1; }
    vlSetAddress(a, n) { if (!this.vivo) return false; const q = Object.entries(this.vlDisp()).filter(([, d]) => d === a); q.forEach(([k]) => (this.vlDir[k] = n & 0x7F)); return q.length > 0; }
    vlRead(a) { if (!this.vivo) return -1; const q = Object.entries(this.vlDisp()).filter(([, d]) => d === a); return q.length === 1 ? this.sens.mm(q[0][0]) : -1; }
    bnoOk() { return this.vivo && this.c.moduloOk('BNO055', 'B.VIN', 'B.GND', 2.6) && this.enBus('B.SDA', 'B.SCL'); }
  }

  // ------------------------------------------------------------------ sensores y simulación (simulacion.py)
  const VL_MONT = { VL0: [0.1667, 0, 0], VL1: [-0.22, 0.1892, Math.PI / 2], VL2: [-0.22, -0.1892, -Math.PI / 2] };
  class Simulacion {
    constructor(placa) {
      this.t = 0; this.c = new Circuito(placa); this.car = new Carrito(); this.mi = new M0601(1, 'izquierdo'); this.md = new M0601(2, 'derecho');
      this.sens = { mm: k => this.mm(k), euler: () => [((-(this.car.th + this.deriva) * 180 / Math.PI) % 360 + 360) % 360, 0, 0] };
      this.deriva = 0; this.esp = new Esp32(this.c, [this.mi, this.md], this.sens);
      this.est = ESTACIONES(); this.extra = []; this.tc = 0; this.antes = false; this.eventos = [];
    }
    obst() { return this.est.concat(this.extra); }
    colocar(x, y, th) { Object.assign(this.car, { x, y, th, v: 0, w: 0 }); }
    mm(k) {
      if (k === 'VLP') return 150;
      const [px, py, a0] = VL_MONT[k], [ox, oy] = this.car.aMundo(px, py); let m = null;
      for (const da of [-0.2, 0, 0.2]) { const a = this.car.th + a0 + da; for (const c of this.obst()) { if (!(c.base <= 0.1555 && 0.1555 <= c.base + c.alto)) continue; const d = rayoCaja(ox, oy, Math.cos(a), Math.sin(a), c); if (d !== null && (m === null || d < m)) m = d; } }
      if (m === null || m > 1.2) return 8190;
      return Math.max(30, Math.round((m + (Math.random() - 0.5) * 2 * (0.003 + P.ruidoVl * m)) * 1000));
    }
    paso(dt) { const n = Math.max(1, Math.round(dt / 0.001)); for (let i = 0; i < n; i++) this.p(dt / n); }
    p(h) {
      this.t += h; this.tc += h; this.deriva += P.derivaImu * Math.PI / 180 / 60 * h;
      if (this.tc >= 0.01) {
        this.c.iMot = this.mi.corrienteFuente() + this.md.corrienteFuente(); this.c.evaluar(this.tc); this.tc = 0;
        if (this.c.espVivo !== this.antes) { this.eventos.push(this.c.espVivo ? 'encendido' : 'apagado'); if (!this.c.espVivo) this.esp.reiniciar(); this.antes = this.c.espVivo; }
      }
      this.mi.voltaje = this.c.danos.ML ? 0 : Math.max(0, this.c.dif('ML.V+', 'ML.GND'));
      this.md.voltaje = this.c.danos.MR ? 0 : Math.max(0, this.c.dif('MR.V+', 'MR.GND'));
      this.car.paso(h, this.mi.actualizar(this.t, h, this.car.izq.omega), this.md.actualizar(this.t, h, this.car.der.omega), this.obst());
    }
    estado() {
      const c = this.car;
      return { t: +this.t.toFixed(3),
        carrito: { x: c.x, y: c.y, th: c.th, v: c.v, w: c.w, rueda_izq: c.izq.omega, rueda_der: c.der.omega, patina: [c.izq.patina, c.der.patina], contactos: c.contactos },
        motores: [this.mi, this.md].map(m => ({ id: m.id, nombre: m.nombre, v: +m.voltaje.toFixed(1), rpm: +(m.omega / RPM).toFixed(1), objetivo: m.objetivo, freno: m.freno, par: +m.par.toFixed(3), i: +m.corriente().toFixed(2), error: m.error, suelto: this.t - m.ultima > P.tSinTrama, tramas_ok: m.ok, tramas_malas: m.malas })),
        electrico: this.c.estado(), esp32: { vivo: this.esp.vivo, uart2: this.esp.uart2, salidas: { ...this.c.salidas }, bus: { ...this.esp.cont }, vl53: { ...this.esp.vlDir } },
        sensores: { VL0: this.mm('VL0'), VL1: this.mm('VL1'), VL2: this.mm('VL2') } };
    }
  }

  global.AetherSim = { P, Simulacion, crc8, trama, ARUCOS, caja, rayoCaja, R_RUEDA, VIA };
})(typeof window !== 'undefined' ? window : globalThis);
