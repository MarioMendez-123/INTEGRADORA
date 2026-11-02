"""Firmware de referencia del ESP32 en Python, para el simulador de PC cuando no hay compilador de C++.

Hace lo mismo que firmware/motor_control/src/main.cpp (mismo protocolo, mismos tramos y mismas
protecciones), pero corre dentro del simulador y le habla al ESP32 virtual directamente.
Cuando instales gcc, usa el C++ (--firmware ...): es el que va al carrito real.
"""
from __future__ import annotations

import math

from nucleo.m0601 import trama

RPM = 2 * math.pi / 60
R, VIA = 0.051, 0.259
DE, PARO, BAT = 4, 34, 39
XSHUT = (32, 33, 15)
CICLO, LATIDO_MAX, REFLEJO_MM = 0.02, 1.0, 400
MARGEN_MM = 450      # la boca de las guías en V queda hasta ~40 cm antes de la estación y el sensor la ve


def ang_dif(a, b):
    d = a - b
    while d > 180:
        d -= 360
    while d < -180:
        d += 360
    return d


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


class FirmwareRef:
    def __init__(self, sim, salir):
        self.sim, self.e, self.salir = sim, sim.esp32, salir     # salir(bytes): lo que sale por el USB
        self.arrancado = False

    def usb(self, texto: str):
        self.salir((texto + "\n").encode())

    # ---------------------------------------------------------------- arranque
    def setup(self):
        e, t = self.e, self.sim.t
        e.pin_mode(DE, "O", t)
        e.digital_write(DE, 0, t)
        e.uart2_begin(115200, 16, 17)
        for ident in (1, 2):
            self.enviar(bytes([ident, 0xA0, 0, 0, 0, 0, 0, 0, 0, 2]))
        for g in XSHUT:
            e.pin_mode(g, "O", t)
            e.digital_write(g, 0, t)
        e.i2c_begin(21, 22)
        ok = e.vl_init(0x29) and e.vl_set_address(0x29, 0x33)
        for i, g in enumerate(XSHUT):
            e.digital_write(g, 1, t)
            ok = e.vl_init(0x29) and e.vl_set_address(0x29, 0x30 + i) and ok
        self.sensores_ok, self.imu_ok = ok, e.bno_ok()
        self.prim, self.falla, self.bloqueado = None, False, False
        self.s_izq = self.s_der = 0.0
        self.rpm_izq = self.rpm_der = 0
        self.vmax = 0.35
        self.t_hb = -1e9
        self.t_ciclo = self.t_odo = self.t_rng = self.t_pwr = t
        self.linea = ""
        self.rng = [8190] * 4
        self.turno = 0
        self.arrancado = True
        self.usb(f"ESP32 listo: sensores {'ok' if ok else 'CON FALLA'}, IMU {'ok' if self.imu_ok else 'CON FALLA'}")

    def enviar(self, t10: bytes):
        e, t = self.e, self.sim.t
        e.digital_write(DE, 1, t)
        e.uart2_write(t10, t)
        e.digital_write(DE, 0, t + 10 * 10 / 115200 + 0.0001)

    def rumbo(self):
        if not self.imu_ok or not self.e.bno_ok():
            return None
        return ang_dif(-self.e.bno_euler()[0], 0)

    # ---------------------------------------------------------------- ciclo de 20 ms (se llama cada 1 ms)
    def paso(self):
        e, t = self.e, self.sim.t
        if not e.vivo:
            self.arrancado = False
            return
        if not self.arrancado:
            return self.setup()
        self.leer_usb()
        if t - self.t_ciclo < CICLO:
            return
        dt, self.t_ciclo = t - self.t_ciclo, t
        rx = e.uart2_read(t)
        for k in range(0, len(rx) - 9, 10):
            r = rx[k:k + 10]
            from nucleo.m0601 import crc8_maxim
            if crc8_maxim(r[:9]) != r[9]:
                continue
            v = int.from_bytes(r[4:6], "big", signed=True)
            if r[0] == 1:
                self.rpm_izq = v
            elif r[0] == 2:
                self.rpm_der = v
        self.s_izq += self.rpm_izq * RPM * R * dt
        self.s_der += self.rpm_der * RPM * R * dt
        # sensores: frontal cada ciclo, uno de los otros en turno
        d = e.vl_read(0x30)
        self.rng[0] = 8190 if d < 0 else d
        self.turno = (self.turno + 1) % 3
        k = (1, 2, 3)[self.turno]
        d = e.vl_read(0x30 + k)
        self.rng[k] = 8190 if d < 0 else d
        # paro y latido
        paro = e.analog_mv(PARO) < 1000
        if paro and not self.falla:
            self.falla = True
            self.terminar("FAULT paro")
        if self.prim and self.prim["t"] != "M" and t - self.t_hb > LATIDO_MAX:
            self.terminar("FAULT sin_latido")
        vl = vr = 0.0
        frenar = True
        if self.prim and not self.falla:
            vl, vr, frenar = self.control(dt)
        k = 1 / (R * RPM)
        self.obj_l = 0 if frenar else round(vl * k)
        self.obj_r = 0 if frenar else round(vr * k)
        fl = 0xFF if frenar else 0
        self.enviar(trama(1, 0x64, self.obj_l >> 8, self.obj_l, 0, 0, 0, fl, 0))
        self.enviar(trama(2, 0x64, self.obj_r >> 8, self.obj_r, 0, 0, 0, fl, 0))
        if t - self.t_odo >= 0.1:
            self.t_odo = t
            th = self.rumbo()
            self.usb(f"ODO {int(t * 1000)} {self.s_izq:.4f} {self.s_der:.4f} {'nan' if th is None else f'{th:.2f}'} "
                     f"{self.rpm_izq * RPM * R:.3f} {self.rpm_der * RPM * R:.3f}")
            self.usb(f"MOT {self.obj_l} {self.obj_r} {1 if frenar else 0}")
        if t - self.t_rng >= 0.2:
            self.t_rng = t
            self.usb("RNG " + " ".join(map(str, self.rng)))
        if t - self.t_pwr >= 0.5:
            self.t_pwr = t
            self.usb(f"PWR {e.analog_mv(BAT) * 6} {e.analog_mv(PARO)}")

    # ---------------------------------------------------------------- USB
    def leer_usb(self):
        datos = self.e.usb_read()
        if not datos:
            return
        self.linea += datos.decode(errors="replace")
        *lineas, self.linea = self.linea.split("\n")
        for ln in lineas:
            if ln.strip():
                self.orden(ln.split())

    def orden(self, p):
        self.t_hb = self.sim.t
        n = []
        try:
            n = [float(x) for x in p[1:]]
        except ValueError:
            return
        c = p[0]
        s = (self.s_izq + self.s_der) / 2
        if c == "HB":
            return
        if c == "STOP":
            return self.terminar("DONE stop")
        if c == "VMAX" and n:
            self.vmax = n[0]
            return
        if c == "RES":
            self.s_izq = self.s_der = 0.0
            return
        if c == "REARME":
            if self.e.analog_mv(PARO) > 1500:
                self.falla = False
                self.usb("EVT 0 REARMADO")
            else:
                self.usb("EVT 0 FAULT paro_presionado")
            return
        if self.falla:
            if n:
                self.usb(f"EVT {int(n[0])} FAULT falla_paro")
            return
        if c == "DRV" and len(n) >= 4:
            self.prim = dict(t="D", id=int(n[0]), dist=n[1], v=n[2], rumbo=n[3], s0=s, lento=0.0)
        elif c == "TRN" and len(n) >= 2:
            self.prim = dict(t="T", id=int(n[0]), rumbo=n[1], wmax=n[2] if len(n) > 2 else 0.6)
        elif c == "APR" and len(n) >= 4:
            self.prim = dict(t="A", id=int(n[0]), dist=n[1], v=n[2], frente=n[3], esperado=n[4] if len(n) > 4 else 0, s0=s, lento=0.0)
        elif c == "MAN" and len(n) >= 2:
            self.prim = dict(t="M", vl=n[0], vr=n[1], hasta=self.sim.t + 0.3)
        else:
            return
        self.bloqueado = False

    def terminar(self, evento):
        if self.prim and "id" in self.prim:
            self.usb(f"EVT {self.prim['id']} {evento}")
        elif evento.startswith("FAULT"):
            self.usb(f"EVT 0 {evento}")
        self.prim = None

    # ---------------------------------------------------------------- control
    def control(self, dt):
        p, t = self.prim, self.sim.t
        s = (self.s_izq + self.s_der) / 2
        real = abs((self.rpm_izq + self.rpm_der) / 2 * RPM * R)
        if p["t"] == "M":
            if t > p["hasta"]:
                self.prim = None
                return 0, 0, True
            if p["vl"] + p["vr"] > 0 and self.rng[0] < REFLEJO_MM:
                return 0, 0, True
            return clamp(p["vl"], -self.vmax, self.vmax), clamp(p["vr"], -self.vmax, self.vmax), False
        th = self.rumbo()
        if th is None:
            self.terminar("FAULT sin_imu")
            return 0, 0, True
        if p["t"] == "T":
            err = ang_dif(p["rumbo"], th)
            if abs(err) < 0.6:
                self.terminar("DONE")
                return 0, 0, True
            w = clamp(0.04 * err, -p["wmax"], p["wmax"])
            wf = math.copysign(max(abs(w), 0.08), w if w else 1)
            return -wf * VIA / 2, wf * VIA / 2, False
        hecho = abs(s - p["s0"])
        resto = abs(p["dist"]) - hecho
        sig = -1 if p["dist"] < 0 else 1
        f = self.rng[0]
        if p["t"] == "D":
            if resto <= 0.003:
                self.terminar("DONE")
                return 0, 0, True
            if sig > 0:
                if f < REFLEJO_MM:
                    if not self.bloqueado:
                        self.usb(f"EVT {p['id']} BLOCKED {f}")
                    self.bloqueado = True
                elif self.bloqueado and f > 500:
                    self.bloqueado = False
                    self.usb(f"EVT {p['id']} CLEAR")
                if self.bloqueado:
                    return 0, 0, True
            p["lento"] = p["lento"] + dt if real < 0.01 else 0.0     # sin sensor trasero: detecta que está atascado
            if p["lento"] > 1.5:
                self.terminar("FAULT atascado")
                return 0, 0, True
            v = sig * min(p["v"], self.vmax, math.sqrt(2 * 0.3 * resto) + 0.02)
            w = clamp(0.05 * ang_dif(p["rumbo"], th), -0.5, 0.5)
            return v - w * VIA / 2, v + w * VIA / 2, False
        if resto <= 0 or (p["frente"] > 0 and f <= p["frente"] * 10):
            self.terminar("DONE")
            return 0, 0, True
        if p["esperado"] > 0:
            esp = (p["esperado"] - hecho * 100) * 10
            if f < esp - MARGEN_MM:
                if not self.bloqueado:
                    self.usb(f"EVT {p['id']} BLOCKED {f}")
                self.bloqueado = True
            elif self.bloqueado and f > esp - MARGEN_MM + 100:
                self.bloqueado = False
                self.usb(f"EVT {p['id']} CLEAR")
            if self.bloqueado:
                return 0, 0, True
        p["lento"] = p["lento"] + dt if real < 0.01 and hecho > 0.02 else 0.0
        if p["lento"] > 0.4:
            self.terminar("DONE topes")
            return 0, 0, True
        return p["v"], p["v"], False
