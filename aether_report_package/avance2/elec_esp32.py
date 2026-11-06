"""Esquemas de conexión del ESP32 del carrito (símbolos reales, schemdraw).
Uso: python elec_esp32.py carpeta_salida   ->  elec_esp32_a.png (motores) y elec_esp32_b.png (buses y sensores)"""
import sys
import schemdraw
import schemdraw.elements as e
from schemdraw import Drawing

schemdraw.use("matplotlib")
schemdraw.config(inches_per_unit=0.3)
RED, ORG, BLK, GRN, BLU, PUR, GRY = "#C0392B", "#E07B00", "#222222", "#2E7D32", "#1F5FA8", "#7B52B5", "#6B7685"


class Hoja:
    def __init__(self):
        self.d = Drawing(fontsize=8, lw=1.4)
        self.d.config(unit=1)

    def ic(self, x, y, w, h, nombre, pines, fs=7, spacing=0.9, anchor=None, at=None, lbl_dy=0.35):
        ps = [e.IcPin(name=etq, side=lado, anchorname=anc, pin="", lblsize=fs) for lado, lst in pines.items() for etq, anc in lst]
        blk = e.Ic(pins=ps, size=(w, h), edgepadding=0.15, pinspacing=spacing, plblofst=0.1).theta(0).color(BLK)
        blk = blk.at((x, y)) if anchor is None else blk.anchor(anchor).at(at)
        self.d.add(blk)
        if nombre and anchor is None:
            self.txt(x + w / 2, y + h + 0.6, nombre, fs + 1, BLK, "center")
        return blk

    def wire(self, p, q, color=BLK):
        self.d.add(e.Line().at(p).to(q).color(color))

    def dot(self, p, color=BLK):
        self.d.add(e.Dot().at(p).color(color))

    def gnd(self, p):
        self.d.add(e.Ground().at(p).color(BLK))

    def txt(self, x, y, s, fs=7, color=BLK, ha="left"):
        self.d.add(e.Label().at((x, y)).label(s, fontsize=fs, color=color, halign=ha, valign="center"))

    def net(self, p, nombre, lado, color=BLU, largo=0.9):
        x, y = p
        q = (x - largo, y) if lado == "l" else (x + largo, y)
        self.wire(p, q, color)
        self.dot(q, color)
        self.txt(q[0] + (-0.15 if lado == "l" else 0.15), y, nombre, 7, color, "right" if lado == "l" else "left")

    def a_tierra(self, pt, dy=0.7):
        self.wire(pt, (pt[0], pt[1] - dy))
        self.gnd((pt[0], pt[1] - dy))

    def a_riel(self, pt, etq, color=ORG, dy=0.7):
        self.wire(pt, (pt[0], pt[1] + dy), color)
        self.txt(pt[0], pt[1] + dy + 0.3, etq, 7, color, "center")

    def vdd(self, pt, etq, color=ORG):
        self.wire(pt, (pt[0], pt[1] + 0.6), color)
        self.d.add(e.Vdd().at((pt[0], pt[1] + 0.6)).color(color))
        self.txt(pt[0], pt[1] + 1.35, etq, 7, color, "center")

    def power_esp(self, esp):
        self.a_tierra(esp.b_gnd, 0.9)
        self.wire(esp.b_3v3, (esp.b_3v3[0], esp.b_3v3[1] - 1.0), ORG)
        self.dot((esp.b_3v3[0], esp.b_3v3[1] - 1.0), ORG)
        self.txt(esp.b_3v3[0] - 0.2, esp.b_3v3[1] - 1.5, "3.3 V", 7, ORG, "right")
        self.wire(esp.b_5v, (esp.b_5v[0], esp.b_5v[1] - 1.0), ORG)
        self.dot((esp.b_5v[0], esp.b_5v[1] - 1.0), ORG)
        self.txt(esp.b_5v[0] + 0.2, esp.b_5v[1] - 1.5, "5 V (XL4005)", 7, ORG, "left")


# ================================================================== A: motores a pasos, servo y LEDs
def hoja_a(ruta):
    h = Hoja()
    esp = h.ic(0, 0, 7.2, 9.0, "ESP32 DevKitC (3.3 V)", {
        "left": [("GPIO2", "l_led"), ("GPIO5", "l_pwm")],
        "right": [("GPIO13", "r_en"), ("GPIO14", "r_dir3"), ("GPIO27", "r_step3"), ("GPIO26", "r_dir12"), ("GPIO25", "r_step12")],
        "bottom": [("GND", "b_gnd"), ("3V3", "b_3v3"), ("5V", "b_5v")]})
    h.power_esp(esp)
    NETS = {"r_step12": "A_STEP12", "r_dir12": "A_DIR12", "r_step3": "A_STEP3", "r_dir3": "A_DIR3", "r_en": "A_EN"}
    for anc, nombre in NETS.items():
        h.net(getattr(esp, anc), nombre, "r", BLU, 2.4)

    XA = 18.0
    for k, (y0, nombre, step, dirn) in enumerate([(11.0, "A4988 #1 · elevador (motor izq.)", "A_STEP12", "A_DIR12"),
                                                  (0.5, "A4988 #2 · elevador (motor der.)", "A_STEP12", "A_DIR12"),
                                                  (-10.0, "A4988 #3 · empujador", "A_STEP3", "A_DIR3")]):
        b = h.ic(XA, y0, 5.2, 5.4, nombre, {
            "left": [("MS3", f"ms3{k}"), ("MS2", f"ms2{k}"), ("MS1", f"ms1{k}"), ("EN", f"en{k}"), ("DIR", f"dir{k}"), ("STEP", f"step{k}")],
            "right": [("2B", f"o2b{k}"), ("2A", f"o2a{k}"), ("1A", f"o1a{k}"), ("1B", f"o1b{k}")],
            "top": [("VMOT", f"vm{k}")], "bottom": [("GND", f"g{k}")]})
        g = lambda n: getattr(b, f"{n}{k}")
        h.net(g("step"), step, "l", BLU, 1.6)
        h.net(g("dir"), dirn, "l", BLU, 1.6)
        h.net(g("en"), "A_EN", "l", BLU, 1.6)
        for ms in ("ms1", "ms2", "ms3"):
            p = g(ms)
            h.wire(p, (p[0] - 1.1, p[1]), ORG)
            h.wire((p[0] - 1.1, p[1]), (p[0] - 1.1, p[1] + 0.4), ORG)
            h.d.add(e.Vdd().at((p[0] - 1.1, p[1] + 0.4)).color(ORG))
        h.a_riel(g("vm"), "VMOT 12 V (J1)", RED, 0.8)
        h.a_tierra(g("g"), 0.7)
        # devanados del NEMA 17
        for par, (pa, pb, etq) in enumerate([("o1a", "o1b", "A"), ("o2a", "o2b", "B")]):
            qa, qb = g(pa), g(pb)
            xm = qa[0] + 1.8 + 2.2 * par
            h.wire(qa, (xm, qa[1]), GRN)
            h.wire(qb, (xm, qb[1]), GRN)
            h.d.add(e.Inductor().at((xm, qa[1])).to((xm, qb[1])).color(BLK))
            h.txt(xm + 0.45, (qa[1] + qb[1]) / 2, f"devanado {etq}", 6, BLK)
        h.txt(g("o1a")[0] + 6.2, (g("o1a")[1] + g("o2a")[1]) / 2, "NEMA 17", 8, BLK)
    # pull-up de ENABLE a 3.3 V
    p = (esp.r_en[0] + 2.4, esp.r_en[1])
    h.txt(p[0] + 0.2, p[1] - 0.9, "", 6)
    # resistencia colgando de la red A_EN (junto al ESP)
    xp = esp.r_en[0] + 1.2
    h.dot((xp, esp.r_en[1]), BLU)
    h.d.add(e.Resistor().at((xp, esp.r_en[1])).to((xp, esp.r_en[1] - 2.0)).color(BLK))
    h.d.add(e.Vdd().at((xp, esp.r_en[1] - 2.0)).color(ORG))
    h.txt(xp + 0.35, esp.r_en[1] - 1.0, "R3 10 kΩ\n(motores sueltos\nal arrancar)", 6, BLK)

    # servo y LEDs a la izquierda del ESP32
    sv = h.ic(0, 0, 3.2, 2.8, None, {"right": [("GND", "sv_g"), ("+5 V", "sv_v"), ("PWM", "sv_s")]}, anchor="sv_s", at=(esp.l_pwm[0] - 5.0, esp.l_pwm[1]))
    h.txt(sv.sv_s[0] + 0.8 - 1.6, sv.sv_s[1] + 1.3, "Servo MG90S (uña)", 8, BLK, "center")
    h.wire(esp.l_pwm, sv.sv_s, BLU)
    h.a_riel(sv.sv_v, "+5 V", ORG, 0.0) if False else None
    h.wire(sv.sv_v, (sv.sv_v[0] + 0.9, sv.sv_v[1]), ORG)
    h.txt(sv.sv_v[0] + 1.0, sv.sv_v[1], "+5 V", 7, ORG)
    h.a_tierra(sv.sv_g, 0.7)
    led = h.ic(0, 0, 3.2, 2.8, None, {"right": [("GND", "ld_g"), ("+5 V", "ld_v"), ("DIN", "ld_d")]}, anchor="ld_d", at=(esp.l_led[0] - 8.8, esp.l_led[1] - 3.2))
    h.txt(led.ld_d[0] + 0.8 - 1.6, led.ld_d[1] + 1.3, "Tira WS2812 (opcional)", 8, BLK, "center")
    h.d.add(e.Resistor().at(esp.l_led).to((esp.l_led[0] - 2.4, esp.l_led[1])).color(BLK))
    h.wire((esp.l_led[0] - 2.4, esp.l_led[1]), (esp.l_led[0] - 2.4, led.ld_d[1]), BLU)
    h.wire((esp.l_led[0] - 2.4, led.ld_d[1]), led.ld_d, BLU)
    h.txt(esp.l_led[0] - 1.2, esp.l_led[1] + 0.5, "R4 330 Ω", 7, BLK, "center")
    h.wire(led.ld_v, (led.ld_v[0] + 0.9, led.ld_v[1]), ORG)
    h.txt(led.ld_v[0] + 1.0, led.ld_v[1], "+5 V", 7, ORG)
    h.a_tierra(led.ld_g, 0.7)
    h.d.save(ruta, dpi=260)


# ================================================================== B: RS485, finales de carrera, QTR, I2C y batería
def hoja_b(ruta):
    h = Hoja()
    esp = h.ic(0, 0, 7.2, 15.5, "ESP32 DevKitC (3.3 V)", {
        "right": [("GPIO22", "r_scl"), ("GPIO21", "r_sda"), ("GPIO36", "r_q5"), ("GPIO35", "r_q4"), ("GPIO34", "r_q3"), ("GPIO33", "r_q2"), ("GPIO32", "r_q1"),
                  ("GPIO23", "r_fce"), ("GPIO19", "r_fcd"), ("GPIO18", "r_fci"), ("GPIO16", "r_ro"), ("GPIO4", "r_de"), ("GPIO17", "r_di")],
        "bottom": [("GND", "b_gnd"), ("3V3", "b_3v3"), ("5V", "b_5v"), ("GPIO39", "b_vbat")],
        "top": [("USB", "t_usb")]})
    h.power_esp(esp)
    h.txt(esp.t_usb[0], esp.t_usb[1] + 1.4, "micro-USB ↔ Jetson (serie)", 7, GRY, "center")

    # RS485
    mx = h.ic(0, 0, 4.4, 4.0, None, {"left": [("RO", "m_ro"), ("DE/RE", "m_de"), ("DI", "m_di")], "right": [("B", "m_b"), ("A", "m_a")], "top": [("VCC", "m_vcc")], "bottom": [("GND", "m_g")]},
              anchor="m_di", at=(esp.r_di[0] + 13.0, esp.r_di[1]))
    h.txt(mx.m_vcc[0], mx.m_vcc[1] + 1.8, "MAX485", 8, BLK, "center")
    h.wire(esp.r_di, mx.m_di, BLU)
    h.wire(esp.r_de, mx.m_de, BLU)
    ls = h.ic(0, 0, 2.2, 1.2, "", {"left": [("LV", "ls_l")], "right": [("HV", "ls_h")]}, anchor="ls_l", at=(esp.r_ro[0] + 4.5, esp.r_ro[1]))
    h.txt(esp.r_ro[0] + 5.6, esp.r_ro[1] - 0.95, "convertidor 5 V → 3.3 V", 6, GRY, "center")
    h.wire(esp.r_ro, ls.ls_l, BLU)
    h.wire(ls.ls_h, mx.m_ro, BLU)
    h.a_riel(mx.m_vcc, "+5 V", ORG, 0.6)
    h.a_tierra(mx.m_g, 0.7)
    m1 = h.ic(0, 0, 3.6, 2.4, None, {"left": [("B", "c1_b"), ("A", "c1_a")]}, anchor="c1_a", at=(mx.m_a[0] + 5.0, mx.m_a[1]))
    m2 = h.ic(0, 0, 3.6, 2.4, None, {"left": [("B", "c2_b"), ("A", "c2_a")]}, anchor="c2_a", at=(mx.m_a[0] + 5.0, mx.m_a[1] + 4.8))
    h.txt(m1.c1_a[0] + 1.9, m1.c1_a[1] + 2.0, "M0601 #1 (ID 1)", 8, BLK, "center")
    h.txt(m2.c2_a[0] + 1.9, m2.c2_a[1] + 2.0, "M0601 #2 (ID 2)", 8, BLK, "center")
    h.wire(mx.m_a, m1.c1_a, GRN)
    h.wire(mx.m_b, m1.c1_b, GRN)
    xa, xb = mx.m_a[0] + 2.2, mx.m_a[0] + 3.1
    h.dot((xa, mx.m_a[1]), GRN); h.wire((xa, mx.m_a[1]), (xa, m2.c2_a[1]), GRN); h.wire((xa, m2.c2_a[1]), m2.c2_a, GRN)
    h.dot((xb, mx.m_b[1]), GRN); h.wire((xb, mx.m_b[1]), (xb, m2.c2_b[1]), GRN); h.wire((xb, m2.c2_b[1]), m2.c2_b, GRN)
    h.txt(m1.c1_a[0] + 4.0, m1.c1_a[1], "18 V · driver y\nencoder propios", 7, GRY)

    # finales de carrera NC
    for anc, nombre in (("r_fci", "FC1 elev. izq."), ("r_fcd", "FC2 elev. der."), ("r_fce", "FC3 home empuj.")):
        p = getattr(esp, anc)
        h.wire(p, (p[0] + 2.0, p[1]), PUR)
        h.d.add(e.Switch(nc=True).at((p[0] + 2.0, p[1])).to((p[0] + 5.0, p[1])).color(BLK))
        h.wire((p[0] + 5.0, p[1]), (p[0] + 5.8, p[1]))
        h.wire((p[0] + 5.8, p[1]), (p[0] + 5.8, p[1] - 0.45))
        h.gnd((p[0] + 5.8, p[1] - 0.45))
        h.txt(p[0] + 6.5, p[1], nombre + " (NC)", 7)

    # QTR-8A
    qt = h.ic(0, 0, 3.6, 5.2, None, {"left": [("S7", "q_s7"), ("S6", "q_s6"), ("S5", "q_s5"), ("S4", "q_s4"), ("S3", "q_s3")], "bottom": [("VCC", "q_v"), ("GND", "q_g")]},
              anchor="q_s3", at=(esp.r_q1[0] + 7.5, esp.r_q1[1]))
    h.txt(qt.q_v[0] + 0.8, qt.q_v[1] - 2.2, "Barra QTR-8A (respaldo)", 8, BLK, "center")
    for a, b in [("r_q1", "q_s3"), ("r_q2", "q_s4"), ("r_q3", "q_s5"), ("r_q4", "q_s6"), ("r_q5", "q_s7")]:
        h.wire(getattr(esp, a), getattr(qt, b), BLU)
    h.wire(qt.q_v, (qt.q_v[0], qt.q_v[1] - 0.7), ORG)
    h.txt(qt.q_v[0], qt.q_v[1] - 1.0, "3.3 V", 7, ORG, "center")
    h.a_tierra(qt.q_g, 0.7)

    # I²C
    h.net(esp.r_sda, "SDA", "r", BLU, 2.0)
    h.net(esp.r_scl, "SCL", "r", BLU, 2.0)
    xi = esp.r_sda[0] + 15.5
    pcf = h.ic(0, 0, 4.4, 5.4, None, {"left": [("SCL", "p_scl"), ("SDA", "p_sda")], "right": [("P3", "p3"), ("P2", "p2"), ("P1", "p1"), ("P0", "p0")], "top": [("VCC", "p_v")], "bottom": [("GND", "p_g")]},
               anchor="p_sda", at=(xi, esp.r_sda[1]))
    vl = h.ic(0, 0, 5.6, 5.4, None, {"left": [("XSHUT4", "x4"), ("XSHUT3", "x3"), ("XSHUT2", "x2"), ("XSHUT1", "x1"), ("SCL", "v_scl"), ("SDA", "v_sda")], "top": [("VCC", "v_v")], "bottom": [("GND", "v_g")]},
              anchor="x4", at=(pcf.p3[0] + 6.0, pcf.p3[1]))
    bno = h.ic(0, 0, 4.4, 4.0, None, {"left": [("SCL", "b_scl"), ("SDA", "b_sda")], "top": [("VCC", "b_v")], "bottom": [("GND", "b_g")]},
               anchor="b_sda", at=(xi, pcf.p_g[1] - 7.5))
    h.txt(pcf.p_v[0], pcf.p_v[1] + 1.9, "PCF8574 (0x20)", 8, BLK, "center")
    h.txt(vl.v_v[0], vl.v_v[1] + 1.9, "4 × VL53L0X (0x30–0x33)", 8, BLK, "center")
    h.txt(bno.b_v[0], bno.b_v[1] + 1.9, "IMU BNO055 (0x28)", 8, BLK, "center")
    for blk, s, a in ((pcf, "p_scl", "p_sda"), (bno, "b_scl", "b_sda"), (vl, "v_scl", "v_sda")):
        h.net(getattr(blk, s), "SCL", "l", BLU, 1.4)
        h.net(getattr(blk, a), "SDA", "l", BLU, 1.4)
    for blk, v, g in ((pcf, "p_v", "p_g"), (bno, "b_v", "b_g"), (vl, "v_v", "v_g")):
        h.a_riel(getattr(blk, v), "3.3 V", ORG, 0.6)
        h.a_tierra(getattr(blk, g), 0.7)
    for i in range(4):
        h.wire(getattr(pcf, f"p{3 - i}"), getattr(vl, f"x{4 - i}"), GRN)
    h.txt(pcf.p3[0] + 0.7, pcf.p3[1] + 0.55, "XSHUT: una dirección distinta por sensor", 6, GRN)

    # divisor de batería hacia GPIO39
    vb = esp.b_vbat
    h.wire(vb, (vb[0], vb[1] - 1.3), BLU)
    h.dot((vb[0], vb[1] - 1.3), BLU)
    h.d.add(e.Resistor().at((vb[0], vb[1] - 1.3)).to((vb[0], vb[1] - 3.5)).color(BLK))
    h.txt(vb[0] + 0.35, vb[1] - 2.4, "R6 20 kΩ", 7)
    h.gnd((vb[0], vb[1] - 3.5))
    h.d.add(e.Resistor().at((vb[0], vb[1] - 1.3)).to((vb[0] + 2.8, vb[1] - 1.3)).color(BLK))
    h.txt(vb[0] + 1.4, vb[1] - 0.8, "R5 100 kΩ", 7, BLK, "center")
    h.wire((vb[0] + 2.8, vb[1] - 1.3), (vb[0] + 2.8, vb[1] - 0.7), RED)
    h.d.add(e.Vdd().at((vb[0] + 2.8, vb[1] - 0.7)).color(RED))
    h.txt(vb[0] + 3.2, vb[1] - 0.5, "12 V (batería)", 7, RED)
    h.d.save(ruta, dpi=260)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    hoja_a(out + "/elec_esp32_a.png")
    hoja_b(out + "/elec_esp32_b.png")
    print("ok")
