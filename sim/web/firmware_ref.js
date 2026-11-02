// Firmware de referencia del ESP32 y programa de la Jetson, escritos en JavaScript para que el carrito
// virtual "corra solo" en el teléfono. Siguen el diseño de la guía de navegación (protocolo DRV/TRN/APR,
// latido de 1 s, paro por GPIO 34, reflejo del VL53L0X frontal, ArUco a 1.5 m). Pasan por el ESP32 virtual:
// si el cableado está mal, fallan igual que el real.
'use strict';
(function (global) {
  const { trama } = global.AetherSim;
  const RPM = 2 * Math.PI / 60, R = 0.051, B = 0.259, DE = 4, PARO = 34, XSHUT = [32, 33, 15];
  const angDif = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return d; };

  // ================================================================== ESP32
  class FirmwareEsp32 {
    constructor(sim) { this.sim = sim; this.e = sim.esp; this.arrancado = false; }
    get t() { return this.sim.t; }
    usb(texto) { this.e.usbTx.push(texto); }
    setup() {
      const e = this.e, t = this.t;
      e.pinMode(DE, 'O', t); e.digitalWrite(DE, 0, t); e.uart2Begin(115200, 16, 17);
      for (const id of [1, 2]) this.enviar([id, 0xA0, 0, 0, 0, 0, 0, 0, 0, 2]);
      XSHUT.forEach(g => { e.pinMode(g, 'O', t); e.digitalWrite(g, 0, t); });
      e.i2c = [21, 22];
      this.sensoresOk = e.vlInit(0x29) && e.vlSetAddress(0x29, 0x33);
      XSHUT.forEach((g, i) => { e.digitalWrite(g, 1, t); this.sensoresOk = e.vlInit(0x29) && e.vlSetAddress(0x29, 0x30 + i) && this.sensoresOk; });
      this.imuOk = e.bnoOk();
      Object.assign(this, { arrancado: true, ultimo: t, hb: -1e9, sL: 0, sR: 0, rpmL: 0, rpmR: 0, prim: null, falla: false, linea: '', tOdo: 0, tRng: 0, tPwr: 0, vmax: 0.35, bloqueado: false, tBloq: 0, frenteMm: 8190 });
      this.usb(`ESP32 listo: sensores ${this.sensoresOk ? 'ok' : 'CON FALLA'}, IMU ${this.imuOk ? 'ok' : 'CON FALLA'}`);
    }
    enviar(t10) {
      const e = this.e, t = this.t;
      e.digitalWrite(DE, 1, t); e.uart2Write(t10, t); e.digitalWrite(DE, 0, t + 10 * 10 / 115200 + 0.0001);
    }
    rumbo() {                           // en grados del mapa (antihorario); el BNO055 crece en sentido horario
      if (!this.imuOk || !this.e.bnoOk()) return null;
      return -this.sim.sens.euler()[0];
    }
    paso() {                            // se llama cada 1 ms del simulador; trabaja a 50 Hz
      if (!this.e.vivo) { this.arrancado = false; return; }
      if (!this.arrancado) { this.setup(); return; }
      if (this.t - this.ultimo < 0.02) return;
      const dt = this.t - this.ultimo; this.ultimo = this.t;
      // respuestas de los motores (de la vuelta anterior)
      const rx = this.e.uart2Read(this.t);
      for (let k = 0; k + 10 <= rx.length; k += 10) {
        const r = rx.slice(k, k + 10); if (global.AetherSim.crc8(r, 9) !== r[9]) continue;
        let v = (r[4] << 8) | r[5]; if (v & 0x8000) v -= 0x10000;
        if (r[0] === 1) this.rpmL = v; else if (r[0] === 2) this.rpmR = v;
      }
      this.sL += this.rpmL * RPM * R * dt; this.sR += this.rpmR * RPM * R * dt;
      this.leerUsb();
      const paro = this.e.analogMv(PARO) < 1000;
      if (paro && !this.falla) { this.falla = true; this.terminar('FAULT paro'); }
      if (this.prim && this.t - this.hb > 1.0) this.terminar('FAULT sin_latido');
      let [vL, vR, frenar] = [0, 0, true];
      if (this.prim && !this.falla) [vL, vR, frenar] = this.control(dt);
      const rpm = v => Math.round(v / (R * RPM));
      this.objL = frenar ? 0 : rpm(vL); this.objR = frenar ? 0 : rpm(vR);
      this.enviar(trama(1, 0x64, this.objL >> 8, this.objL, 0, 0, 0, frenar ? 0xFF : 0, 0));
      this.enviar(trama(2, 0x64, this.objR >> 8, this.objR, 0, 0, 0, frenar ? 0xFF : 0, 0));
      if (this.t - this.tOdo >= 0.1) { this.tOdo = this.t; const th = this.rumbo(); this.usb(`ODO ${Math.round(this.t * 1000)} ${this.sL.toFixed(4)} ${this.sR.toFixed(4)} ${th === null ? 'nan' : th.toFixed(2)} ${(this.rpmL * RPM * R).toFixed(3)} ${(this.rpmR * RPM * R).toFixed(3)}`); this.usb(`MOT ${this.objL} ${this.objR} ${frenar ? 1 : 0}`); }
      if (this.t - this.tRng >= 0.2) { this.tRng = this.t; this.usb(`RNG ${this.e.vlRead(0x30)} ${this.e.vlRead(0x31)} ${this.e.vlRead(0x32)} ${this.e.vlRead(0x33)}`); }
      if (this.t - this.tPwr >= 0.5) { this.tPwr = this.t; this.usb(`PWR ${Math.round(this.e.analogMv(39) * 6)} ${this.e.analogMv(PARO)}`); }
    }
    leerUsb() {
      this.linea += this.e.usbRx; this.e.usbRx = '';
      let i; while ((i = this.linea.indexOf('\n')) >= 0) { const l = this.linea.slice(0, i).trim(); this.linea = this.linea.slice(i + 1); if (l) this.orden(l.split(/\s+/)); }
    }
    orden(p) {
      this.hb = this.t;
      const n = p.slice(1).map(Number);
      if (p[0] === 'HB') return;
      if (p[0] === 'STOP') return this.terminar('DONE stop');
      if (p[0] === 'VMAX') { this.vmax = n[0]; return; }
      if (p[0] === 'RES') { this.sL = this.sR = 0; return; }
      if (p[0] === 'REARME') { if (this.e.analogMv(PARO) > 1500) { this.falla = false; this.usb('EVT 0 REARMADO'); } else this.usb('EVT 0 FAULT paro_presionado'); return; }
      if (this.falla) { this.usb(`EVT ${n[0]} FAULT falla_paro`); return; }
      const s0 = (this.sL + this.sR) / 2;
      if (p[0] === 'DRV') this.prim = { tipo: 'DRV', id: n[0], dist: n[1], v: n[2], rumbo: n[3], s0 };
      else if (p[0] === 'TRN') this.prim = { tipo: 'TRN', id: n[0], rumbo: n[1], wmax: n[2] || 0.6 };
      else if (p[0] === 'APR') this.prim = { tipo: 'APR', id: n[0], dist: n[1], v: n[2], frente: n[3], s0, tLento: 0 };
      else if (p[0] === 'MAN') this.prim = { tipo: 'MAN', id: 0, vL: n[0], vR: n[1], hasta: this.t + 0.3 };   // joystick: dura 0.3 s si no se repite
    }
    terminar(evento) { if (this.prim) this.usb(`EVT ${this.prim.id} ${evento}`); else if (evento.startsWith('FAULT')) this.usb(`EVT 0 ${evento}`); this.prim = null; }
    control(dt) {
      const p = this.prim, th = this.rumbo(), s = (this.sL + this.sR) / 2;
      if (p.tipo === 'MAN') {
        if (this.t > p.hasta) { this.prim = null; return [0, 0, true]; }
        const f = this.e.vlRead(0x30), adelante = p.vL + p.vR > 0;
        if (adelante && f > 0 && f < 400) return [0, 0, true];          // el reflejo también cuida el manejo a mano
        return [Math.max(-this.vmax, Math.min(this.vmax, p.vL)), Math.max(-this.vmax, Math.min(this.vmax, p.vR)), false];
      }
      if (th === null) { this.terminar('FAULT sin_imu'); return [0, 0, true]; }
      if (p.tipo === 'TRN') {
        const err = angDif(p.rumbo, th);
        if (Math.abs(err) < 0.6) { this.terminar('DONE'); return [0, 0, true]; }
        const w = Math.max(-p.wmax, Math.min(p.wmax, 0.04 * err)) || 0;
        const wf = Math.sign(w) * Math.max(Math.abs(w), 0.08);
        return [-wf * B / 2, wf * B / 2, false];
      }
      const hecho = Math.abs(s - p.s0), resto = Math.abs(p.dist) - hecho, sig = Math.sign(p.dist) || 1;
      if (p.tipo === 'DRV') {
        if (resto <= 0.003) { this.terminar('DONE'); return [0, 0, true]; }
        if (sig > 0) {                               // reflejo del VL53L0X frontal (solo hacia adelante)
          const f = this.e.vlRead(0x30);
          if (f > 0 && f < 400) { if (!this.bloqueado) this.usb(`EVT ${p.id} BLOCKED ${f}`); this.bloqueado = true; return [0, 0, true]; }
          if (this.bloqueado && f > 500) { this.bloqueado = false; this.usb(`EVT ${p.id} CLEAR`); }
          if (this.bloqueado) return [0, 0, true];
        }
        const v = sig * Math.min(p.v, this.vmax, Math.sqrt(2 * 0.3 * resto) + 0.02);
        const w = Math.max(-0.5, Math.min(0.5, 0.05 * angDif(p.rumbo, th)));
        return [v - w * B / 2, v + w * B / 2, false];
      }
      // APR: avanza recto hasta la distancia, hasta que el frontal mida "frente" cm o hasta que los topes lo detengan
      const f = this.e.vlRead(0x30);
      if (resto <= 0 || (p.frente > 0 && f > 0 && f <= p.frente * 10)) { this.terminar('DONE'); return [0, 0, true]; }
      const real = Math.abs((this.rpmL + this.rpmR) / 2 * RPM * R);
      p.tLento = real < 0.01 && hecho > 0.02 ? p.tLento + dt : 0;
      if (p.tLento > 0.4) { this.terminar('DOCKED topes'); return [0, 0, true]; }
      return [p.v, p.v, false];
    }
  }

  // ================================================================== Jetson (planeador de la ruta en L)
  const H = 2.18, X_DESC = -3.82;
  function rutaIda() {
    return [['voz', 'Atención, voy a retroceder'], ['espera', 2], ['DRV', -0.60, 0.10, 0], ['TRN', 180, 0.6], ['IR', X_DESC, 0, 180, 0.35], ['TRN', 90, 0.6], ['LEER', 1],
      ['APUNTA', X_DESC, H - 0.18], ['APR', 1.70, 0.15, 30], ['APR', 0.40, 0.05, 0], ['FIJA', X_DESC, H - 0.18, 90]];
  }
  function rutaVuelta() {
    return [['voz', 'Atención, voy a retroceder'], ['espera', 2], ['DRV', -0.60, 0.10, 90], ['TRN', -90, 0.6], ['IR', X_DESC, 0, -90, 0.35], ['TRN', 0, 0.6], ['IR', -2.0, 0, 0, 0.35], ['LEER', 0],
      ['APUNTA', 0, 0], ['APR', 1.70, 0.15, 30], ['APR', 0.40, 0.05, 0], ['FIJA', 0, 0, 0]];
  }
  class Jetson {
    constructor(sim, alSalir) { Object.assign(this, { sim, alSalir, cola: [], paso: null, id: 0, pose: [0, 0, 0], s: null, tHb: 0, lineas: '', log: [], camino: '' }); }
    enviar(l) { if (this.sim.esp.vivo) this.sim.esp.usbRx += l + '\n'; }
    decir(t) { this.log.push(`[Jetson] ${t}`); this.alSalir?.(t); }
    mision(nombre, pasos, pose) { this.cola = pasos.slice(); this.paso = null; this.pose = pose.slice(); this.s = null; this.decir(`empieza: ${nombre}`); this.siguiente(); }
    detener() { this.cola = []; this.paso = null; this.enviar('STOP'); this.decir('misión detenida'); }
    recibir(l) {
      const p = l.split(' ');
      if (p[0] === 'ODO' && p[3] !== 'nan') {
        const s = (+p[2] + +p[3]) / 2, th = +p[4] * Math.PI / 180;
        if (this.s === null) this.s = s;
        const ds = s - this.s; this.s = s;
        this.pose[0] += ds * Math.cos(th); this.pose[1] += ds * Math.sin(th); this.pose[2] = th + this.offTh;
      } else if (p[0] === 'EVT' && this.paso && +p[1] === this.id) {
        if (p[2] === 'DONE' || p[2] === 'DOCKED') this.siguiente();
        else if (p[2] === 'FAULT') { this.decir(`falla del ESP32: ${p.slice(3).join(' ')}. Necesito ayuda`); this.cola = []; this.paso = null; }
        else if (p[2] === 'BLOCKED') this.decir(`algo enfrente a ${p[3]} mm: espero`);
      }
    }
    offTh = 0;
    siguiente() {
      const p = this.cola.shift(); this.paso = p || null; if (!p) { this.decir('misión terminada'); return; }
      const [x, y] = this.pose, n = ++this.id;
      switch (p[0]) {
        case 'voz': this.decir(`Lumina: "${p[1]}"`); return this.siguiente();
        case 'espera': this.tEspera = this.sim.t + p[1]; return;
        case 'DRV': this.enviar(`DRV ${n} ${p[1]} ${p[2]} ${p[3]}`); return;
        case 'TRN': this.enviar(`TRN ${n} ${p[1]} ${p[2]}`); return;
        case 'IR': { const d = Math.hypot(p[1] - x, p[2] - y); this.enviar(`DRV ${n} ${d.toFixed(3)} ${p[4]} ${p[3]}`); return; }
        case 'APR': this.enviar(`APR ${n} ${p[1]} ${p[2]} ${p[3]}`); return;
        case 'APUNTA': { const rumbo = Math.atan2(p[2] - y, p[1] - x) * 180 / Math.PI; this.enviar(`TRN ${n} ${rumbo.toFixed(2)} 0.4`); return; }
        case 'LEER': this.leerAruco(p[1]); return this.siguiente();
        case 'FIJA': this.pose = [p[1], p[2], p[3] * Math.PI / 180]; this.decir('acoplado: la posición se reinicia en la estación'); return this.siguiente();
      }
    }
    leerAruco(id) {   // lo que vería el lector de ArUco: solo si el marcador entra completo en la imagen de la C920
      const a = global.AetherSim.ARUCOS.find(m => m.id === id), c = this.sim.car;
      const cx = c.x + 0.143 * Math.cos(c.th), cy = c.y + 0.143 * Math.sin(c.th);
      const dx = a.x - cx, dy = a.y - cy, d = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) - c.th;
      const lat = Math.abs(Math.atan2(Math.sin(ang), Math.cos(ang))) * 180 / Math.PI;
      const arriba = Math.atan2(a.z + a.lado / 2 - 1.066, d) * 180 / Math.PI + 6;
      const px = 914 * a.lado / d;
      if (lat > 33 || arriba > 21.6 || px < 40) { this.decir(`no veo el ArUco ${id} (a ${d.toFixed(2)} m, ${lat.toFixed(0)}° de lado, ${px.toFixed(0)} px): sigo con la odometría`); return; }
      const err = Math.hypot(this.pose[0] - c.x, this.pose[1] - c.y);
      this.pose = [c.x + (Math.random() - 0.5) * 0.02, c.y + (Math.random() - 0.5) * 0.02, this.pose[2]];
      this.decir(`ArUco ${id} a ${d.toFixed(2)} m (${px.toFixed(0)} px): corrijo la posición ${(err * 100).toFixed(1)} cm`);
    }
    paso_() {
      if (this.sim.t - this.tHb > 0.2 && (this.paso || this.cola.length)) { this.tHb = this.sim.t; this.enviar('HB'); }
      if (this.paso && this.paso[0] === 'espera' && this.sim.t >= this.tEspera) this.siguiente();
    }
  }

  global.AetherFirmware = { FirmwareEsp32, Jetson, rutaIda, rutaVuelta };
})(typeof window !== 'undefined' ? window : globalThis);
