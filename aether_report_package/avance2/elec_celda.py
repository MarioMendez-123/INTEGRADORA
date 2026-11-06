"""Esquema eléctrico de la celda (Raspberry Pi 4, relevadores, LOGO!, infrarrojo, electroválvula).
Uso: python elec_celda.py salida.png"""
import sys
import schemdraw
import schemdraw.elements as e
from elec_esp32 import Hoja, RED, ORG, BLK, GRN, BLU, PUR, GRY

schemdraw.use("matplotlib")
schemdraw.config(inches_per_unit=0.3)
h = Hoja()
BRN = "#8B5A2B"


def vdd_pt(p, etq, color=RED, dy=0.8):
    h.wire(p, (p[0], p[1] + dy), color)
    h.d.add(e.Vdd().at((p[0], p[1] + dy)).color(color))
    h.txt(p[0], p[1] + dy + 0.75, etq, 7, color, "center")


def gnd_pt(p, dy=0.6):
    h.wire(p, (p[0], p[1] - dy), BLK)
    h.gnd((p[0], p[1] - dy))


# ================= Raspberry Pi 4 y cámara USB
pi = h.ic(0, 0, 6.0, 6.0, "Raspberry Pi 4 (celda)", {
    "right": [("GPIO9", "p_g9"), ("GPIO8", "p_g8"), ("GND", "p_gn")],
    "left": [("USB", "p_usb")], "top": [("5 V", "p_5v")]})
vdd_pt(pi.p_5v, "+5 V (fuente aparte de la Pi)", ORG, 1.0)
cam = h.ic(0, 0, 3.6, 2.0, None, {"right": [("USB", "c_usb")]}, anchor="c_usb", at=(pi.p_usb[0] - 2.2, pi.p_usb[1]))
h.txt(cam.c_usb[0] - 1.8, cam.c_usb[1] + 1.6, "Cámara USB", 8, BLK, "center")
h.wire(cam.c_usb, pi.p_usb, GRN)
gnd_pt((pi.p_gn[0] + 1.2, pi.p_gn[1]))
h.wire(pi.p_gn, (pi.p_gn[0] + 1.2, pi.p_gn[1]), BLK)

# ================= módulo de dos relevadores (bobinas de 5 V; contactos secos)
rl = h.ic(0, 0, 5.2, 5.4, None, {
    "left": [("GND", "r_g"), ("VCC", "r_v"), ("IN2", "r_in2"), ("IN1", "r_in1")],
    "right": [("NO2", "r_no2"), ("COM2", "r_com2"), ("NO1", "r_no1"), ("COM1", "r_com1")]},
    anchor="r_in1", at=(pi.p_g8[0] + 6.5, pi.p_g8[1]))
h.txt(rl.r_com1[0] - 2.6, rl.r_com1[1] + 2.0, "Módulo de 2 relevadores\n(bobinas de 5 V)", 8, BLK, "center")
h.wire(pi.p_g8, rl.r_in1, BLU)
h.wire(pi.p_g9, rl.r_in2, BLU)
h.txt(pi.p_g8[0] + 0.9, pi.p_g8[1] + 0.35, "GPIO8 → pistón", 6, BLU)
h.txt(pi.p_g9[0] + 0.9, pi.p_g9[1] - 0.4, "GPIO9 → avance de banda", 6, BLU)
gnd_pt((rl.r_g[0] - 1.4, rl.r_g[1]))
h.wire(rl.r_g, (rl.r_g[0] - 1.4, rl.r_g[1]), BLK)
h.wire(rl.r_v, (rl.r_v[0] - 1.4, rl.r_v[1]), ORG)
h.txt(rl.r_v[0] - 1.5, rl.r_v[1] - 0.45, "+5 V", 7, ORG, "right")

# contactos secos: COM de ambos a +24 V
for com in (rl.r_com1, rl.r_com2):
    xc = com[0] + 1.2
    h.wire(com, (xc, com[1]), RED)
vdd_pt((rl.r_com1[0] + 1.2, rl.r_com1[1]), "+24 V", RED, 0.8)
vdd_pt((rl.r_com2[0] + 1.2, rl.r_com2[1]), "", RED, 0.0) if False else None
h.wire((rl.r_com2[0] + 1.2, rl.r_com2[1]), (rl.r_com1[0] + 1.2, rl.r_com1[1]), RED)
h.dot((rl.r_com1[0] + 1.2, rl.r_com1[1]), RED)
h.dot((rl.r_com2[0] + 1.2, rl.r_com2[1]), RED)

# electroválvula 24 V (relevador 1)
xv = rl.r_no1[0] + 2.0
h.wire(rl.r_no1, (xv, rl.r_no1[1]), BLK)
h.d.add(e.Inductor().at((xv, rl.r_no1[1])).to((xv + 3.0, rl.r_no1[1])).color(BLK))
h.txt(xv + 1.8, rl.r_no1[1] + 0.9, "Electroválvula 24 V\n→ pistón de scrap", 7, BLK, "center")
h.wire((xv + 3.0, rl.r_no1[1]), (xv + 3.6, rl.r_no1[1]), BLK)
gnd_pt((xv + 3.6, rl.r_no1[1]))

# ================= LOGO! (PLC de la celda)
lg = h.ic(0, 0, 6.4, 6.4, None, {
    "left": [("I4", "i4"), ("I3", "i3")],
    "right": [("Q1", "q1")],
    "top": [("L+", "lp")], "bottom": [("M", "lm")]},
    anchor="i4", at=(rl.r_no2[0] + 8.2, rl.r_no2[1]))
h.txt(lg.lp[0], lg.lp[1] + 2.4, "LOGO! (PLC de la celda)", 8, BLK, "center")
vdd_pt(lg.lp, "+24 V", RED, 0.8)
gnd_pt(lg.lm, 0.7)
# NO2 -> I4: pulso de avance
h.wire(rl.r_no2, lg.i4, BLK)
h.txt(rl.r_no2[0] + 1.5, rl.r_no2[1] - 0.5, "pulso de avance (0.5 s) → I4", 6, GRY)
# motor de la banda en Q1
h.wire(lg.q1, (lg.q1[0] + 2.0, lg.q1[1]), BLK)
h.d.add(e.Motor().at((lg.q1[0] + 2.0, lg.q1[1])).to((lg.q1[0] + 2.0, lg.q1[1] - 3.0)).color(BLK))
h.gnd((lg.q1[0] + 2.0, lg.q1[1] - 3.0))
h.txt(lg.q1[0] + 2.6, lg.q1[1] - 1.5, "Motor de la banda\n(tensión por confirmar)", 7, BLK)

# ================= infrarrojo de presencia (3 hilos) -> I3
ir = h.ic(0, 0, 4.4, 3.6, None, {"right": [("CAFÉ (+24 V)", "ir_c"), ("AZUL (0 V)", "ir_b"), ("NEGRO (salida)", "ir_o")][::-1]},
          anchor="ir_o", at=(lg.i3[0] - 7.4, lg.i3[1] + 5.5))
h.txt(ir.ir_o[0] - 2.2, ir.ir_o[1] + 4.2, "Infrarrojo de presencia (24 V)", 8, BLK, "center")
xl = lg.i3[0] - 1.1
h.wire(ir.ir_o, (xl, ir.ir_o[1]), BLK)
h.wire((xl, ir.ir_o[1]), (xl, lg.i3[1]), BLK)
h.wire((xl, lg.i3[1]), lg.i3, BLK)
h.txt(xl + 0.2, lg.i3[1] + 0.5, "I3", 6, GRY)
vdd_pt((ir.ir_c[0] + 1.2, ir.ir_c[1]), "+24 V", RED, 0.7)
h.wire(ir.ir_c, (ir.ir_c[0] + 1.2, ir.ir_c[1]), BRN)
h.wire(ir.ir_b, (ir.ir_b[0] + 1.2, ir.ir_b[1]), BLU)
gnd_pt((ir.ir_b[0] + 1.2, ir.ir_b[1]), 0.5)

# ================= fuente de 24 V del tablero
ps = (rl.r_in1[0] - 1.0, rl.r_com1[1] + 6.0)
h.d.add(e.SourceV().at((ps[0], ps[1])).to((ps[0], ps[1] + 3.0)).color(RED))
h.txt(ps[0] - 0.5, ps[1] + 1.5, "Fuente 24 V\ndel tablero", 8, BLK, "right")
vdd_pt((ps[0], ps[1] + 3.0), "+24 V", RED, 0.7)
gnd_pt(ps, 0.7)
h.txt(ps[0] + 0.4, ps[1] - 0.9, "0 V", 7)

# ================= red y nota
yred = pi.p_g9[1] - 6.0
h.d.add(e.Line().at((pi.p_g8[0] + 1.0, yred)).to((lg.i4[0] - 1.0, yred)).color(PUR).linestyle("--"))
h.txt((pi.p_g8[0] + lg.i4[0]) / 2, yred - 0.7, "Ethernet · Modbus TCP: DISEÑO del reporte HMI (aún no está en el código)", 7, PUR, "center")
h.txt((pi.p_g8[0] + lg.i4[0]) / 2, yred - 2.2, "Ninguna señal de 24 V llega a un GPIO de la Raspberry Pi: los relevadores aíslan la lógica de 3.3 V de la de 24 V.", 8, BLK, "center")
h.d.save(sys.argv[1] if len(sys.argv) > 1 else "celda.png", dpi=260)
print("ok")
