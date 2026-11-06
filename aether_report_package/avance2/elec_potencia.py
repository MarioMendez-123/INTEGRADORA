"""Esquema eléctrico de potencia del carrito (símbolos normalizados con schemdraw).
Uso: python elec_potencia.py salida.png"""
import sys
import schemdraw
import schemdraw.elements as e
from schemdraw import Drawing

schemdraw.use("matplotlib")
schemdraw.config(inches_per_unit=0.3)
RED, ORG, BLK, GRN, BLU = "#C0392B", "#E07B00", "#222222", "#2E7D32", "#1F5FA8"

d = Drawing(fontsize=9, lw=1.6)
d.config(unit=1)


def ic(x, y, w, h, nombre, pines, fs=8):
    """Bloque tipo circuito integrado; (x, y) = esquina inferior izquierda. Lista de pines de abajo hacia arriba."""
    ps = [e.IcPin(name=etq, side=lado, anchorname=anc, pin="", lblsize=fs) for lado, lst in pines.items() for etq, anc in lst]
    blk = e.Ic(pins=ps, size=(w, h), edgepadding=0.15, pinspacing=0.9, plblofst=0.1).at((x, y)).theta(0).color(BLK)
    d.add(blk)
    if nombre:
        d.add(e.Label().at((x + w / 2, y + h + 0.3)).label(nombre, fontsize=fs, halign="center"))
    return blk


def gnd(p):
    d.add(e.Ground().at(p).color(BLK))


def wire(p, q, color=RED):
    d.add(e.Line().at(p).to(q).color(color))


def txt(x, y, s, fs=8, color=BLK, ha="left"):
    d.add(e.Label().at((x, y)).label(s, fontsize=fs, color=color, halign=ha))


def a_tierra(pt):
    wire(pt, (pt[0], pt[1] - 0.7), BLK)
    gnd((pt[0], pt[1] - 0.7))


# ================= batería + XT60
d.add(e.Battery().at((0, 0)).to((0, 3)).color(RED))
txt(-0.4, 1.5, "Batería plomo-ácido BR-1224\n12 V · 24 Ah · 8.3 kg", ha="right")
txt(0.25, 0.1, "−", 11)
txt(0.25, 2.7, "+", 11, RED)
gnd((0, 0))
wire((0, 3), (1.2, 3))
d.add(e.Dot(open=True).at((1.2, 3)))
d.add(e.Dot(open=True).at((1.8, 3)))
txt(1.5, 3.25, "XT60", 7, ha="center")
wire((1.8, 3), (3, 3))
d.add(e.Dot().at((3, 3)).color(RED))
txt(3.1, 3.2, "12 V", 8, RED)

# ================= RAMA DE MOTORES: F1 15 A y contacto de K1
wire((3, 3), (3, 7))
d.add(e.Fuse().at((3, 7)).to((6, 7)).color(RED))
txt(4.5, 7.35, "F1 · 15 A", 8, ha="center")
wire((6, 7), (7, 7))
d.add(e.Switch(action=None).at((7, 7)).to((10, 7)).color(BLK))
txt(8.0, 7.9, "K1 · relevador T90 30 A\ncontacto COM → NO", 8, ha="center")
wire((10, 7), (11, 7))
d.add(e.Dot().at((11, 7)).color(RED))
txt(11.2, 7.15, "12 V motores", 8, RED)

# --- elevador de voltaje 400 W -> 2 motores-rueda
b = ic(13.5, 8.2, 3.4, 1.8, "Elevador de voltaje 400 W · 12 → 18 V", {"left": [("IN−", "inm"), ("IN+", "inp")], "right": [("OUT−", "outm"), ("OUT+", "outp")]})
wire((11, 7), (11, b.inp[1]))
wire((11, b.inp[1]), b.inp)
a_tierra((b.inm[0] - 0.4, b.inm[1]))
wire(b.inm, (b.inm[0] - 0.4, b.inm[1]), BLK)
a_tierra((b.outm[0] + 0.4, b.outm[1]))
wire(b.outm, (b.outm[0] + 0.4, b.outm[1]), BLK)
y18 = b.outp[1]
wire(b.outp, (19.0, y18), ORG)
d.add(e.Dot().at((19.0, y18)).color(ORG))
txt(19.1, y18 + 0.2, "18 V", 8, ORG)
wire((19.0, y18), (19.0, 8.2), ORG)
d.add(e.Motor().at((19.0, 8.2)).to((19.0, 5.6)).color(BLK))
gnd((19.0, 5.6))
txt(19.45, 6.9, "M1 · M0601\nizq.", 8)
wire((19.0, y18), (23.8, y18), ORG)
wire((23.8, y18), (23.8, 8.2), ORG)
d.add(e.Motor().at((23.8, 8.2)).to((23.8, 5.6)).color(BLK))
gnd((23.8, 5.6))
txt(24.25, 6.9, "M2 · M0601 der.", 8)
txt(12.0, 11.1, "Cada motor-rueda trae su driver y su encoder; las órdenes llegan por RS485.", 7)

# --- drivers de pasos (12 V) + condensador 100 µF por driver
a = ic(14.2, 1.2, 3.0, 3.0, "3 × A4988 (micropaso 1/16)", {"left": [("GND", "g1"), ("VMOT", "vm")], "right": [("2A/2B", "m2"), ("1A/1B", "m1")]})
yv = a.vm[1]
wire((11, 7), (11, yv))
d.add(e.Dot().at((11, yv)).color(RED))
txt(10.7, yv + 0.3, "J1 · VMOT 12 V", 8, RED, "right")
wire((11, yv), a.vm)
d.add(e.Dot().at((12.5, yv)).color(RED))
d.add(e.Capacitor().at((12.5, yv)).to((12.5, yv - 1.9)).color(BLK))
gnd((12.5, yv - 1.9))
txt(11.8, yv - 1.2, "C1–C3: 100 µF\n(uno por driver)", 7, BLK, "right")
a_tierra((a.g1[0] - 0.5, a.g1[1]))
wire(a.g1, (a.g1[0] - 0.5, a.g1[1]), BLK)
xm = a.m1[0] + 1.2
wire(a.m1, (xm, a.m1[1]), GRN)
wire(a.m2, (xm, a.m2[1]), GRN)
d.add(e.Motor().at((xm, a.m1[1])).to((xm, a.m2[1])).color(BLK))
txt(xm + 0.6, (a.m1[1] + a.m2[1]) / 2 - 0.2, "NEMA 17 × 3 (elevador ×2,\nempujador ×1)", 8)

# ================= RAMA AUXILIAR: F2 10 A, KCD1, reductor, Jetson
wire((3, 3), (3, -3))
d.add(e.Dot().at((3, 0)).color(RED))
d.add(e.Fuse().at((3, -3)).to((6, -3)).color(RED))
txt(4.5, -2.65, "F2 · 10 A", 8, ha="center")
d.add(e.Switch(action=None).at((6, -3)).to((9, -3)).color(BLK))
txt(7.5, -2.4, "S2 · KCD1 (encendido)", 8, ha="center")
wire((9, -3), (10, -3))
d.add(e.Dot().at((10, -3)).color(RED))
txt(8.6, -3.7, "12 V aux.", 8, RED)

# divisor de batería 100 k / 20 k
wire((3, 0), (1.5, 0))
d.add(e.Resistor().at((1.5, 0)).to((1.5, -2.2)).color(BLK))
txt(1.75, -1.1, "R1 100 kΩ", 7)
wire((1.5, -2.2), (1.5, -2.5))
d.add(e.Dot().at((1.5, -2.5)))
wire((1.5, -2.5), (-1.4, -2.5), BLU)
d.add(e.Dot(open=True).at((-1.4, -2.5)))
txt(-1.5, -2.2, "→ GPIO 39 (lectura de batería)", 7, BLU, "right")
d.add(e.Resistor().at((1.5, -2.5)).to((1.5, -4.7)).color(BLK))
txt(1.75, -3.6, "R2 20 kΩ", 7)
gnd((1.5, -4.7))

# reductor XL4005
bk = ic(12.5, -2.6, 3.4, 1.8, "Reductor XL4005 · 12 → 5 V (ajustado a 5.0–5.1 V)", {"left": [("IN−", "bim"), ("IN+", "bin")], "right": [("OUT−", "bom"), ("OUT+", "bop")]})
wire((10, -3), (10, bk.bin[1]))
wire((10, bk.bin[1]), bk.bin)
a_tierra((bk.bim[0] - 0.4, bk.bim[1]))
wire(bk.bim, (bk.bim[0] - 0.4, bk.bim[1]), BLK)
a_tierra((bk.bom[0] + 0.4, bk.bom[1]))
wire(bk.bom, (bk.bom[0] + 0.4, bk.bom[1]), BLK)
y5 = bk.bop[1]
wire(bk.bop, (18.0, y5), ORG)
d.add(e.Dot().at((18.0, y5)).color(ORG))
txt(18.1, y5 + 0.2, "5 V", 8, ORG)
cargas = [("ESP32 DevKitC y módulo MAX485", -4.0), ("Servo MG90S (uña)", -6.9), ("LEDs de estado WS2812", -9.8), ("Convertidor de nivel 3.3 ↔ 5 V", -12.7)]
wire((18.0, y5), (18.0, cargas[-1][1]), ORG)
for i, (nom, y) in enumerate(cargas):
    d.add(e.Dot().at((18.0, y)).color(ORG))
    wire((18.0, y), (19.0, y), ORG)
    ic(19.0, y - 0.45, 1.6, 0.9, None, {"left": [("+5 V", f"l{i}")]}, fs=7)
    txt(20.8, y - 0.05, nom, 8)
    a_tierra((19.8, y - 0.45))

# Jetson
wire((10, -3), (10, -6.2))
d.add(e.Dot().at((10, -3)).color(RED))
wire((10, -6.2), (11, -6.2))
d.add(e.Dot(open=True).at((11, -6.2)))
d.add(e.Dot(open=True).at((11.5, -6.2)))
txt(11.25, -5.9, "plug 5.5 × 2.5", 7, ha="center")
j = ic(13.6, -7.2, 2.4, 2.0, "Jetson Orin Nano Super (12 V)", {"left": [("DC IN", "jin")]})
wire((11.5, -6.2), j.jin)
a_tierra((14.8, -7.2))

# ================= circuito de mando de la bobina de K1 (paro de emergencia)
txt(0.0, -7.0, "Circuito de mando de K1 (paro de emergencia)", 9)
d.add(e.Dot().at((0, -8.6)).color(RED))
txt(-0.1, -8.05, "12 V aux.", 8, RED)
wire((0, -8.6), (1.2, -8.6))
d.add(e.Switch(nc=True).at((1.2, -8.6)).to((4.2, -8.6)).color(BLK))
txt(2.7, -7.55, "S1 · paro LAY37 (contacto NC)", 8, ha="center")
wire((4.2, -8.6), (5.0, -8.6))
d.add(e.Inductor().at((5.0, -8.6)).to((8.5, -8.6)).color(BLK))
txt(6.75, -8.0, "K1 · bobina", 8, ha="center")
wire((8.5, -8.6), (9.2, -8.6))
gnd((9.2, -8.6))
txt(0.0, -10.4, "Al pulsar S1 se abre el contacto, la bobina pierde energía y K1 cae:\nse cortan a la vez las ruedas (18 V) y los drivers de pasos (12 V);\nla rama auxiliar (Jetson y lógica) queda viva.", 8)

d.save(sys.argv[1] if len(sys.argv) > 1 else "potencia.png", dpi=260)
print("ok")
