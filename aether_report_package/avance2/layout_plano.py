"""Layout (planta, a escala) de la celda Aether: banda, estaciones, carrito y mesa de descarga.
Medidas reales: banda 3.09 m, cinta 20.35 cm, fixture 21.3 × 16.5 cm, carrito 50 × 40 cm, mesa 1.40 × 0.30 m.
Las posiciones de las estaciones a lo largo de la banda se dibujan en su orden de diseño; se afinan con la banda armada.
Uso: python layout_plano.py salida.png"""
import sys
import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, FancyArrowPatch, Polygon, Wedge, FancyBboxPatch
from matplotlib.transforms import Affine2D

INK, GRAY, RED, ORG, BLU, GRN, PUR, BRN = "#1B2A41", "#8D9BAB", "#C0392B", "#E07B00", "#1F5FA8", "#2E7D32", "#7B52B5", "#8A5F2C"
plt.rcParams["font.family"] = "DejaVu Sans"
fig, ax = plt.subplots(figsize=(15, 11.2))
ax.set_aspect("equal")
ax.set_xlim(-0.75, 5.55)
ax.set_ylim(-3.0, 2.15)
ax.axis("off")

# --- cuadrícula del piso (cada 0.5 m) y marco de la celda
for gx in np.arange(-0.5, 5.6, 0.5):
    ax.plot([gx, gx], [-3.0, 2.1], color="#E7EAEE", lw=0.6, zorder=0)
for gy in np.arange(-3.0, 2.2, 0.5):
    ax.plot([-0.75, 5.5], [gy, gy], color="#E7EAEE", lw=0.6, zorder=0)
ax.add_patch(Rectangle((-0.7, -2.95), 6.2, 5.0, fc="none", ec="#B8C0CC", lw=1.5, ls=(0, (6, 4)), zorder=1))
ax.text(-0.66, 2.0, "Piso del laboratorio (cuadrícula de 0.5 m)", fontsize=9, color=GRAY, va="top")


def num(x, y, n, color=INK):
    ax.add_patch(Circle((x, y), 0.085, fc=color, ec="white", lw=1.5, zorder=20))
    ax.text(x, y, str(n), color="white", fontsize=11, fontweight="bold", ha="center", va="center", zorder=21)


def cota(x1, y1, x2, y2, txt, off=0.0, ha="center", fs=10, color=INK):
    ax.annotate("", xy=(x1, y1), xytext=(x2, y2), arrowprops=dict(arrowstyle="<->", color=color, lw=1.4), zorder=15)
    xm, ym = (x1 + x2) / 2, (y1 + y2) / 2
    ax.text(xm, ym + off, txt, fontsize=fs, ha=ha, va="center", color=color, fontweight="bold", zorder=16,
            bbox=dict(fc="white", ec="none", pad=1.2))


# ================================================================= 1 · BANDA (eje y = 0, de x = 0 a 3.09 m)
L, FW = 3.09, 0.30
ax.add_patch(Rectangle((0, -FW / 2), L, FW, fc="#C9CFD6", ec=INK, lw=2, zorder=3))                    # bastidor y rieles
ax.add_patch(Rectangle((0.0, -0.10175), L, 0.2035, fc="#3A3F46", ec="#22262B", lw=1.2, zorder=4))     # cinta de 20.35 cm
for k in (1, 2):                                                                                      # uniones de tramos
    ax.plot([k * 1.03, k * 1.03], [-FW / 2, FW / 2], color=INK, lw=1.8, zorder=5)
for x in np.arange(0.12, L - 0.1, 0.30):                                                              # sentido de la cinta
    ax.add_patch(Polygon([[x + 0.1, 0], [x, 0.045], [x, -0.045]], fc="#9AA3AD", ec="none", zorder=5))
ax.add_patch(Rectangle((-0.02, -0.14), 0.07, 0.28, fc="#7C8793", ec=INK, lw=1.5, zorder=6))           # rodillo de Ø85 (extremo abierto)
ax.add_patch(Rectangle((L - 0.015, -0.17), 0.045, 0.34, fc="#5A6370", ec=INK, lw=1.5, zorder=6))      # tapa del extremo cerrado
num(1.55, 0.31, 1)
cota(0, -0.86, L, -0.86, "3.09 m  (3 tramos de 1030 mm, una sola cinta)", off=-0.09)
ax.text(0.0, 0.22, "ENTRA", fontsize=10, fontweight="bold", color=INK, ha="left")
ax.text(2.50, 0.22, "SIGUE ➜", fontsize=10, fontweight="bold", color=INK, ha="left")

# --- 2 · carga de fixtures (se ponen uno a la vez en la punta lejana)
def fixture(x, y, rot=0, color="#F4C06A", z=7):
    r = Rectangle((-0.1065, -0.0825), 0.213, 0.165, fc=color, ec="#6B4B16", lw=1.1, zorder=z)
    r.set_transform(Affine2D().rotate_deg(rot).translate(x, y) + ax.transData)
    ax.add_patch(r)
    k = Rectangle((-0.1065, -0.014), 0.213, 0.028, fc="#B58638", ec="none", zorder=z + 1)             # quilla
    k.set_transform(Affine2D().rotate_deg(rot).translate(x, y) + ax.transData)
    ax.add_patch(k)


fixture(0.20, 0)
fixture(0.80, 0)
fixture(1.45, 0, color="#F4A582")        # una pieza FAIL rumbo al pistón
fixture(2.55, 0, color="#9AD19A")
num(0.20, -0.22, 2)
ax.text(0.20, -0.62, "carga de\nfixtures", fontsize=9, ha="center", va="top", color=INK)

# --- 3 · IR1 (pieza en la estación) y 7 · IR2 (¿la pieza siguió?)
def ir(x, nombre, n):
    ax.add_patch(Rectangle((x - 0.035, 0.22), 0.07, 0.07, fc=ORG, ec=INK, lw=1.3, zorder=9))
    ax.add_patch(Rectangle((x - 0.035, -0.29), 0.07, 0.07, fc=ORG, ec=INK, lw=1.3, zorder=9))
    ax.plot([x, x], [0.22, -0.22], color=RED, lw=1.6, ls=(0, (3, 2)), zorder=8)
    num(x, 0.43, n, ORG)
    ax.text(x, 0.55, nombre, fontsize=9, ha="center", color=ORG, fontweight="bold")


ir(0.62, "IR1", 3)
ir(2.28, "IR2", 7)

# --- 4 · cámara USB sobre un pórtico + Raspberry Pi 4
xc = 1.10
for yy in (0.24, -0.24):
    ax.add_patch(Rectangle((xc - 0.03, yy - 0.025), 0.06, 0.05, fc="#5A6370", ec=INK, lw=1.2, zorder=9))
ax.add_patch(Rectangle((xc - 0.012, -0.24), 0.024, 0.48, fc="#8D9BAB", ec=INK, lw=1.0, zorder=9))    # travesaño del pórtico
ax.add_patch(Circle((xc, 0), 0.052, fc=BLU, ec=INK, lw=1.5, zorder=10))
ax.add_patch(Circle((xc, 0), 0.02, fc="white", ec="none", zorder=11))
ax.add_patch(Polygon([[xc, 0], [xc + 0.20, 0.15], [xc + 0.20, -0.15]], fc="#BFD8F2", ec=BLU, alpha=0.55, lw=1, zorder=6))  # campo de visión
ax.add_patch(FancyBboxPatch((xc - 0.20, 0.50), 0.40, 0.24, boxstyle="round,pad=0.01", fc="#DDF2EF", ec="#1E8E7E", lw=1.6, zorder=9))
ax.text(xc, 0.62, "Raspberry\nPi 4", fontsize=8, ha="center", va="center", color="#115E54", fontweight="bold", zorder=10)
ax.plot([xc, xc], [0.52, 0.0], color=INK, lw=1.4, ls=(0, (1.5, 1.5)), zorder=9)                     # cable USB
num(xc + 0.28, 0.40, 4, BLU)

# --- 5 · pistón de expulsión + 6 · cajón de scrap
xp = 1.72
ax.add_patch(Rectangle((xp - 0.05, 0.27), 0.10, 0.22, fc="#C8501E", ec=INK, lw=1.5, zorder=9))       # cilindro
ax.add_patch(Rectangle((xp - 0.015, 0.12), 0.03, 0.15, fc="#6B7685", ec=INK, lw=1.0, zorder=9))      # vástago
ax.add_patch(Rectangle((xp - 0.08, 0.09), 0.16, 0.03, fc="#C8501E", ec=INK, lw=1.0, zorder=9))       # cabezal
ax.annotate("", xy=(xp, -0.50), xytext=(xp, 0.10), arrowprops=dict(arrowstyle="-|>", color=RED, lw=2.2), zorder=8)
num(xp + 0.20, 0.45, 5, "#C8501E")
ax.add_patch(Polygon([[xp - 0.17, -0.15], [xp + 0.17, -0.15], [xp + 0.22, -0.38], [xp - 0.22, -0.38]], fc="#D6CFC6", ec=INK, lw=1.3, zorder=5))  # canaleta
ax.add_patch(Rectangle((xp - 0.24, -0.78), 0.48, 0.38, fc="#D6CFC6", ec=INK, lw=1.8, zorder=6))
ax.text(xp, -0.60, "Cajón\nde scrap", fontsize=8.5, ha="center", va="center", color=INK, fontweight="bold", zorder=7)
num(xp + 0.38, -0.52, 6, BRN)

# ================================================================= 8 · TABLERO y 9 · LAPTOP
ax.add_patch(Rectangle((1.30, 1.00), 0.85, 0.55, fc="#E6EEF8", ec=BLU, lw=2, zorder=3))
ax.text(1.725, 1.40, "Tablero", fontsize=10, fontweight="bold", ha="center", color=BLU)
for i, (t, c) in enumerate([("LOGO!", BLU), ("24 V", RED), ("relés", ORG)]):
    ax.add_patch(Rectangle((1.36 + i * 0.27, 1.08), 0.24, 0.20, fc="white", ec=c, lw=1.4, zorder=4))
    ax.text(1.48 + i * 0.27, 1.18, t, fontsize=7.5, ha="center", va="center", color=c, fontweight="bold", zorder=5)
num(2.30, 1.42, 8, BLU)
for x, y in [(0.62, 0.30), (2.28, 0.30), (xp - 0.05, 0.49)]:                                         # cables del tablero a IR1, IR2 y pistón
    ax.plot([x, x, 1.65 if x < 1.7 else 1.95], [y, 0.85, 0.85], color=ORG, lw=1.3, zorder=2)
    ax.plot([1.65 if x < 1.7 else 1.95, 1.65 if x < 1.7 else 1.95], [0.85, 1.0], color=ORG, lw=1.3, zorder=2)
ax.add_patch(Rectangle((2.55, 1.05), 0.60, 0.40, fc="#EEF0F3", ec=GRAY, lw=1.6, zorder=3))
ax.add_patch(Rectangle((2.62, 1.12), 0.46, 0.26, fc="#CBD5E1", ec=GRAY, lw=1, zorder=4))
ax.text(2.85, 1.25, "Laptop", fontsize=8.5, ha="center", va="center", color=INK, fontweight="bold", zorder=5)
ax.add_patch(Rectangle((3.25, 1.12), 0.30, 0.18, fc="#EEF0F3", ec=GRAY, lw=1.4, zorder=3))
ax.text(3.40, 1.21, "switch", fontsize=7.5, ha="center", va="center", color=INK, zorder=4)
ax.plot([3.15, 3.25], [1.25, 1.21], color=GRN, lw=1.4)
ax.plot([3.40, 3.40, 2.20], [1.12, 0.95, 0.95], color=GRN, lw=1.2, ls=(0, (4, 2)), zorder=2)
ax.text(2.75, 0.97, "red local", fontsize=8, color=GRN, ha="center", va="bottom")
num(2.85, 1.58, 9, GRAY)


# ================================================================= 10 · CARRITO (acoplado) y 11 · embudo + ArUco
def carrito(cx, cy, ang, color="#EBE3F6", ec=PUR, z=12, ghost=False, embudo=True):
    """Carrito 50 (largo) × 40 cm con ruedas motrices, rodajas y torre; la ventana está en el lado -x local."""
    T = Affine2D().rotate_deg(ang).translate(cx, cy) + ax.transData
    alpha = 0.55 if ghost else 1.0
    parts = [
        Rectangle((-0.25, -0.20), 0.50, 0.40, fc=color, ec=ec, lw=2.2, zorder=z, alpha=alpha),                         # marco
        Rectangle((-0.115, -0.0825), 0.213, 0.165, fc="none", ec=ec, lw=1.2, ls=(0, (3, 2)), zorder=z + 1),           # torre (huella del fixture)
        Rectangle((-0.06, -0.215), 0.12, 0.045, fc="#1B2A41", ec="none", zorder=z + 1),                                # rueda motriz M0601
        Rectangle((-0.06, 0.17), 0.12, 0.045, fc="#1B2A41", ec="none", zorder=z + 1),
        Rectangle((-0.262, -0.20), 0.025, 0.40, fc=ec, ec="none", zorder=z + 2),                                       # panel con la ventana
    ]
    for p in parts:
        p.set_transform(T)
        ax.add_patch(p)
    for dx, dy in [(-0.21, -0.17), (-0.21, 0.17), (0.21, -0.17), (0.21, 0.17)]:                                       # rodajas
        c = Circle((0, 0), 0.025, fc="#C5CBD3", ec="#4A5563", lw=1, zorder=z + 1)
        c.set_transform(Affine2D().translate(dx, dy) + T)
        ax.add_patch(c)
    # embudo de acople (trapecio) y marcador ArUco en el frente
    emb = Polygon([[-0.262, -0.12], [-0.262, 0.12], [-0.36, 0.20], [-0.36, -0.20]], fc="#FFE9A8", ec="#B98A00", lw=1.4, zorder=z - 1, alpha=alpha)
    emb.set_transform(T)
    if embudo:
        ax.add_patch(emb)
    ar = Rectangle((-0.30, 0.205), 0.045, 0.045, fc="black", ec="white", lw=1, zorder=z + 2)
    ar.set_transform(T)
    ax.add_patch(ar)
    fl = FancyArrowPatch((-0.05, 0), (-0.20, 0), arrowstyle="-|>", mutation_scale=14, color=PUR, lw=2, zorder=z + 3)
    fl.set_transform(T)
    ax.add_patch(fl)


carrito(L + 0.25, 0, 0)                                                                                # acoplado al extremo cerrado
num(L + 0.30, 0.34, 10, PUR)
num(L - 0.12, 0.30, 11, "#B98A00")
ax.text(L + 0.25, -0.30, "Carrito 50 × 40 cm", fontsize=9, ha="center", color=PUR, fontweight="bold")

# ================================================================= 12 · MESA INCLINADA (1.40 × 0.30, 15°) y 13 · RUTA
xm, ym0 = 4.30, -0.95                                      # eje de la mesa en x = 4.30; su borde alto en y = -0.95
carrito(xm, ym0 + 0.25, 90, color="#F4EEFB", embudo=False)             # el carrito mira hacia la mesa (-y)
ax.add_patch(Rectangle((xm - 0.15, ym0 - 1.40), 0.30, 1.40, fc="#F3E9DC", ec=BRN, lw=2, zorder=3))
for i in range(1, 14):                                       # rayado de la pendiente
    ax.plot([xm - 0.15, xm + 0.15], [ym0 - i * 0.1, ym0 - i * 0.1], color="#D9C3A4", lw=0.8, zorder=4)
ax.add_patch(Rectangle((xm - 0.15, ym0 - 1.40), 0.30, 0.04, fc="#7C5A2B", ec="none", zorder=5))      # tope acolchado
for k in range(3):                                           # fixtures ya descargados
    r = Rectangle((-0.0825, -0.1065), 0.165, 0.213, fc="#F4C06A", ec="#6B4B16", lw=1.1, zorder=6)
    r.set_transform(Affine2D().translate(xm, ym0 - 1.18 + k * 0.217) + ax.transData)
    ax.add_patch(r)
ax.annotate("", xy=(xm + 0.26, ym0 - 1.25), xytext=(xm + 0.26, ym0 - 0.1), arrowprops=dict(arrowstyle="-|>", color=BRN, lw=1.8), zorder=8)
ax.text(xm + 0.31, ym0 - 0.70, "pendiente\n≈ 15°", fontsize=9, color=BRN, va="center")
ax.text(xm - 0.20, ym0 - 0.30, "borde\na 83 cm", fontsize=8.5, color=BRN, ha="right", va="center")
num(xm + 0.36, ym0 - 1.35, 12, BRN)
cota(xm - 0.38, ym0, xm - 0.38, ym0 - 1.40, "1.40 m", off=0.0)

# ruta del carrito: del acople a la mesa (waypoints)
wp = [(L + 0.25, 0), (4.30, 0.0), (4.30, ym0 + 0.25)]
ax.plot([w[0] for w in wp], [w[1] for w in wp], color=PUR, lw=2.4, ls=(0, (6, 4)), zorder=11)
ax.annotate("", xy=wp[-1], xytext=wp[-2], arrowprops=dict(arrowstyle="-|>", color=PUR, lw=2.4), zorder=11)
for i, w in enumerate(wp):
    ax.add_patch(Circle(w, 0.035, fc="white", ec=PUR, lw=2, zorder=13))
    ax.text(w[0] + (-0.30 if i == 2 else 0.07), w[1] + (-0.20 if i == 0 else 0.10), f"WP{i + 1}", fontsize=8.5, color=PUR, fontweight="bold", zorder=14)
num(3.88, 0.24, 13, PUR)
carrito(L + 0.25, 0, 0, ghost=False)
# marcadores ArUco de las dos estaciones
for x, y, rot in [(L - 0.02, 0.24, 0), (xm + 0.22, ym0 + 0.0, 0)]:
    ax.add_patch(Rectangle((x - 0.03, y - 0.03), 0.06, 0.06, fc="black", ec="white", lw=1.2, zorder=14))

# ================================================================= escala y orientación
ax.plot([0, 1], [-2.75, -2.75], color=INK, lw=4, zorder=15, solid_capstyle="butt")
for xx in (0, 0.5, 1):
    ax.plot([xx, xx], [-2.80, -2.70], color=INK, lw=2, zorder=15)
ax.text(0.5, -2.90, "1 m", fontsize=11, fontweight="bold", ha="center", color=INK)
ax.text(2.45, -2.75, "Plano a escala: banda, carrito y mesa con sus medidas reales.", fontsize=9, color=GRAY, ha="left", va="center")
ax.set_title("Layout de la celda Aether (vista superior)", fontsize=17, fontweight="bold", color=INK, pad=12)

# ================================================================= leyenda
items = [(1, INK, "Banda transportadora, 3 tramos"), (2, INK, "Carga de fixtures (punta abierta)"), (3, ORG, "Infrarrojo 1: pieza en estación"),
         (4, BLU, "Cámara USB + Raspberry Pi 4"), (5, "#C8501E", "Pistón de expulsión + electroválvula"), (6, BRN, "Cajón de scrap"),
         (7, ORG, "Infrarrojo 2: ¿la pieza siguió?"), (8, BLU, "Tablero: LOGO!, 24 V y relevadores"), (9, GRAY, "Laptop (servidor) y switch"),
         (10, PUR, "Carrito acoplado a la banda"), (11, "#B98A00", "Embudo + marcador ArUco de acople"), (12, BRN, "Mesa inclinada de descarga"),
         (13, PUR, "Ruta del carrito por waypoints (WP)")]
ax.add_patch(Rectangle((-0.62, -2.62), 3.0, 1.55, fc="white", ec="#B8C0CC", lw=1.2, zorder=2))
for i, (n, c, t) in enumerate(items):
    col, row = divmod(i, 7)
    x0 = -0.55 + col * 1.55
    y0 = -1.20 - row * 0.2
    ax.add_patch(Circle((x0 + 0.07, y0), 0.065, fc=c, ec="white", lw=1, zorder=20))
    ax.text(x0 + 0.07, y0, str(n), color="white", fontsize=8.5, fontweight="bold", ha="center", va="center", zorder=21)
    ax.text(x0 + 0.20, y0, t, fontsize=8.6, va="center", color=INK, zorder=21)

fig.savefig(sys.argv[1] if len(sys.argv) > 1 else "layout_plano.png", dpi=170, bbox_inches="tight", facecolor="white")
print("ok")
