"""Diagramas de la celda, dibujados para imprimirse en el Word."""
from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "figuras"
OUT.mkdir(exist_ok=True)

INK = (28, 25, 23)
MUTED = (87, 83, 78)
FAINT = (120, 113, 108)
PAPER = (247, 244, 239)
WHITE = (255, 255, 255)
LINE = (214, 206, 196)
BELT = (92, 83, 72)
BELT_DARK = (62, 56, 48)
PLC = (30, 58, 95)
PLC_SOFT = (232, 239, 248)
PI = (20, 83, 45)
PI_SOFT = (220, 252, 231)
CAM = (49, 46, 129)
CAM_SOFT = (224, 231, 255)
SENS = (194, 65, 12)
SENS_SOFT = (255, 237, 213)
PISTON = (159, 18, 57)
PISTON_SOFT = (255, 228, 230)
ETH = (37, 99, 235)
DANGER = (185, 28, 28)
OK = (22, 101, 52)
WARN_BG = (254, 243, 199)
DANGER_BG = (254, 226, 226)

FB = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 44)
FM = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 32)
FS = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 28)
FX = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 24)
FL = ImageFont.truetype(r"C:\Windows\Fonts\segoeuil.ttf", 26)


def new(w, h):
    im = Image.new("RGB", (w, h), PAPER)
    return im, ImageDraw.Draw(im)


def rr(d, box, r, fill, outline=None, width=3):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def tw(d, text, font):
    b = d.textbbox((0, 0), text, font=font)
    return b[2] - b[0], b[3] - b[1]


def text(d, xy, s, font, fill=INK, anchor="lt"):
    d.text(xy, s, font=font, fill=fill, anchor=anchor)


def center(d, cx, cy, s, font, fill=INK):
    text(d, (cx, cy), s, font, fill, anchor="mm")


def arrow(d, x1, y1, x2, y2, color, w=8, head=18):
    d.line((x1, y1, x2, y2), fill=color, width=w)
    ang = math.atan2(y2 - y1, x2 - x1)
    p1 = (x2 - head * math.cos(ang - 0.4), y2 - head * math.sin(ang - 0.4))
    p2 = (x2 - head * math.cos(ang + 0.4), y2 - head * math.sin(ang + 0.4))
    d.polygon([(x2, y2), p1, p2], fill=color)


def pill(d, cx, cy, s, font, fg, bg, pad_x=16, pad_y=8):
    w, h = tw(d, s, font)
    box = (cx - w / 2 - pad_x, cy - h / 2 - pad_y, cx + w / 2 + pad_x, cy + h / 2 + pad_y)
    rr(d, box, 14, bg)
    center(d, cx, cy, s, font, fg)
    return box


def badge(d, x, y, n, fill):
    d.ellipse((x, y, x + 54, y + 54), fill=fill)
    center(d, x + 27, y + 27, str(n), FB, WHITE)


def save(im, name):
    path = OUT / name
    im.save(path, "PNG")
    print(path, im.size)


def _station_title(d, cx, n, color, title, subtitle):
    badge(d, cx - 27, 28, n, color)
    center(d, cx, 120, title, FM, color)
    center(d, cx, 162, subtitle, FX, MUTED)


def vista():
    im, d = new(1800, 1240)
    # La banda queda debajo de las cuatro estaciones. El pistón empuja
    # hacia el cajón, no hacia el IR2.
    rr(d, (40, 620, 1760, 740), 18, BELT)
    d.rectangle((60, 648, 1740, 712), fill=BELT_DARK)
    center(d, 120, 680, "ENTRA", FS, (230, 224, 214))
    arrow(d, 190, 680, 250, 680, (230, 224, 214), 6, 12)
    center(d, 1680, 680, "SIGUE", FS, (230, 224, 214))

    def pieza(x, color):
        rr(d, (x, 662, x + 50, 698), 6, color, WHITE, 2)

    pieza(300, (250, 204, 120))
    pieza(620, (250, 204, 120))
    pieza(1500, (134, 180, 120))

    _station_title(d, 250, 1, SENS, "Infrarrojo 1", "pieza en la estación")
    rr(d, (190, 250, 310, 330), 12, SENS)
    center(d, 250, 290, "IR1", FM, WHITE)
    d.line((250, 330, 250, 620), fill=SENS, width=8)
    d.line((180, 560, 330, 560), fill=(251, 191, 36), width=6)

    _station_title(d, 700, 2, CAM, "Cámara + Raspberry", "unidas por USB")
    rr(d, (470, 240, 640, 360), 16, CAM)
    d.ellipse((515, 260, 595, 340), outline=WHITE, width=6)
    d.ellipse((543, 288, 567, 312), fill=WHITE)
    rr(d, (760, 240, 1080, 390), 16, PI_SOFT, PI, 4)
    center(d, 920, 290, "Raspberry", FM, PI)
    center(d, 920, 340, "visión de línea", FX, PI)
    d.line((640, 300, 760, 300), fill=INK, width=8)
    pill(d, 700, 250, "USB", FX, WHITE, INK, 8, 3)
    d.line((555, 360, 555, 580), fill=CAM, width=3)

    _station_title(d, 1240, 3, PISTON, "Pistón", "empuja fuera de la banda")
    rr(d, (1100, 230, 1380, 320), 12, PISTON)
    center(d, 1240, 275, "PISTÓN", FM, WHITE)
    d.line((1240, 320, 1240, 600), fill=PISTON, width=12)
    d.polygon([(1210, 600), (1270, 600), (1240, 650)], fill=PISTON)
    arrow(d, 1240, 745, 1240, 778, BELT_DARK, 6, 12)
    rr(d, (1080, 780, 1400, 900), 14, (214, 206, 196), BELT_DARK, 3)
    center(d, 1240, 840, "CAJÓN DE SCRAP", FM, INK)

    _station_title(d, 1600, 4, SENS, "Infrarrojo 2", "¿la pieza siguió?")
    rr(d, (1540, 250, 1660, 330), 12, SENS)
    center(d, 1600, 290, "IR2", FM, WHITE)
    d.line((1600, 330, 1600, 620), fill=SENS, width=8)
    d.line((1520, 560, 1680, 560), fill=(251, 191, 36), width=6)

    rr(d, (40, 940, 1760, 1180), 20, WHITE, LINE, 3)
    text(d, (70, 965), "TABLERO", FM, PLC)
    text(d, (250, 972), "IR1, IR2 y el pistón se atornillan aquí. El Raspberry no.", FX, MUTED)
    rr(d, (70, 1030, 700, 1150), 16, PLC_SOFT, PLC, 4)
    center(d, 385, 1090, "PLC   ·   dueño de la banda y del pistón", FS, PLC)
    labels = [("I0.0", "IR1", SENS), ("I0.1", "IR2", SENS), ("Q0.0", "Pistón", PISTON), ("Q0.1", "Banda", BELT)]
    for i, (term, name, col) in enumerate(labels):
        x = 740 + i * 250
        rr(d, (x, 1030, x + 230, 1150), 12, WHITE, col, 4)
        center(d, x + 115, 1072, term, FM, col)
        center(d, x + 115, 1115, name, FX, INK)
    save(im, "01-vista.png")


def _box(d, box, border, fill, title, sub):
    x1, y1, x2, y2 = box
    rr(d, box, 18, fill, border, 5)
    center(d, (x1 + x2) / 2, (y1 + y2) / 2 - 24, title, FB, border)
    center(d, (x1 + x2) / 2, (y1 + y2) / 2 + 28, sub, FX, INK)


def cables():
    im, d = new(1800, 1320)
    _box(d, (40, 40, 400, 220), CAM, CAM_SOFT, "Cámara", "se enchufa al Pi")
    _box(d, (520, 40, 1100, 250), PI, PI_SOFT, "Raspberry", "un solo puerto de red")
    _box(d, (1280, 40, 1760, 220), (68, 64, 60), (245, 245, 244), "Laptop", "la pantalla")

    arrow(d, 400, 130, 515, 130, INK, 8, 16)
    pill(d, 458, 90, "USB", FX, WHITE, INK, 10, 4)
    text(d, (40, 280), "El Raspberry usa su cargador de 5 V.", FX, PI)

    # Switch al centro. Tres cables, uno por máquina.
    rr(d, (620, 430, 1000, 620), 18, WHITE, ETH, 5)
    center(d, 810, 495, "SWITCH", FB, ETH)
    center(d, 810, 555, "un cable por máquina", FX, MUTED)

    arrow(d, 810, 250, 810, 425, ETH, 8, 16)
    pill(d, 980, 330, "Ethernet", FX, WHITE, ETH, 12, 5)
    arrow(d, 1400, 220, 1400, 500, ETH, 8, 16)
    d.line((1400, 500, 1000, 500), fill=ETH, width=8)
    pill(d, 1280, 450, "Ethernet", FX, WHITE, ETH, 12, 5)

    _box(d, (560, 760, 1100, 1040), PLC, PLC_SOFT, "PLC", "sensores y pistón")
    arrow(d, 810, 620, 810, 755, ETH, 8, 16)
    pill(d, 980, 690, "Ethernet · Modbus", FX, WHITE, ETH, 12, 5)

    _box(d, (40, 760, 400, 940), SENS, SENS_SOFT, "IR1", "pieza en estación")
    _box(d, (40, 1000, 400, 1180), SENS, SENS_SOFT, "IR2", "después del pistón")
    arrow(d, 400, 850, 555, 850, SENS, 8, 16)
    pill(d, 478, 800, "24 V", FX, WHITE, SENS, 10, 4)
    d.line((400, 1090, 480, 1090), fill=SENS, width=8)
    d.line((480, 1090, 480, 960), fill=SENS, width=8)
    arrow(d, 480, 960, 555, 920, SENS, 8, 16)

    _box(d, (1280, 820, 1760, 1040), PISTON, PISTON_SOFT, "Pistón", "electroválvula")
    arrow(d, 1100, 900, 1275, 900, PISTON, 8, 16)
    pill(d, 1188, 850, "salida", FX, WHITE, PISTON, 10, 4)

    rr(d, (1280, 1080, 1760, 1280), 16, WHITE, LINE, 3)
    text(d, (1310, 1095), "Color del cable", FM, INK)
    for i, (col, label) in enumerate(
        [(INK, "Negro     cable USB"), (ETH, "Azul     cable de red"), (SENS, "Naranja     sensor, 24 V"), (PISTON, "Rojo     cable del pistón")]
    ):
        y = 1155 + i * 30
        d.rectangle((1310, y, 1342, y + 16), fill=col)
        text(d, (1356, y - 6), label, FX, INK)
    save(im, "02-cables.png")


def bornes():
    im, d = new(1800, 1080)
    # sensor
    rr(d, (60, 80, 520, 520), 20, WHITE, SENS, 5)
    text(d, (90, 110), "Sensor infrarrojo", FM, SENS)
    text(d, (90, 160), "3 hilos. Leer la etiqueta.", FX, MUTED)
    rr(d, (150, 240, 430, 400), 24, SENS)
    center(d, 290, 320, "IR", FB, WHITE)
    # wires out the bottom
    colors = [((180, 90, 40), "Marrón", "+24 V"), ((37, 99, 235), "Azul", "0 V"), ((28, 25, 23), "Negro", "Señal")]
    for i, (col, name, sig) in enumerate(colors):
        x = 170 + i * 90
        d.line((x, 400, x, 470), fill=col, width=8)
        text(d, (x - 40, 480), name, FX, col)

    # plc terminals
    rr(d, (620, 80, 1740, 700), 20, WHITE, PLC, 5)
    text(d, (660, 110), "Bornera del PLC", FM, PLC)
    text(d, (660, 160), "Misma fuente de 24 V que las entradas", FX, MUTED)

    terms = [
        ("+24 V", "Marrón de IR1 y de IR2", (180, 90, 40)),
        ("0 V", "Azul de IR1, de IR2, y común del PLC", ETH),
        ("I0.0", "Negro del IR1  ·  pieza en estación", SENS),
        ("I0.1", "Negro del IR2  ·  pieza siguió en la banda", SENS),
        ("Q0.0", "Hacia el relé del pistón", PISTON),
    ]
    for i, (term, desc, col) in enumerate(terms):
        y = 230 + i * 88
        d.rectangle((680, y, 760, y + 56), fill=(30, 41, 59))
        # screw
        d.ellipse((692, y + 12, 724, y + 44), outline=(212, 175, 55), width=3)
        center(d, 860, y + 28, term, FM, col)
        text(d, (1040, y + 8), desc, FX, INK)

    # prohibido
    rr(d, (60, 760, 1740, 1020), 20, DANGER_BG, DANGER, 5)
    text(d, (100, 800), "Esto no se hace", FB, DANGER)
    text(d, (100, 870), "No conectar el negro del sensor, ni el +24 V, a un pin del Raspberry.", FS, INK)
    text(d, (100, 920), "El Raspberry solo llega al PLC por el cable de red. Su alimentación es el cargador de 5 V.", FS, INK)

    save(im, "03-bornes.png")


def secuencia():
    im, d = new(1800, 980)
    steps = [
        (SENS, "1", "Llega la pieza", "IR1 cambia.\nEl PLC avisa\nque hay pieza."),
        (CAM, "2", "Una foto", "El Raspberry\ntoma un frame\nde la cámara."),
        (PLC, "3", "El juicio", "Solo si es FAIL\nescribe el bit\nRECHAZAR."),
        (PISTON, "4", "El pistón", "El PLC da el\npulso. El Pi\nno lo energiza."),
        (OK, "5", "IR2 confirma", "Si siguió en la\nbanda, o si el\npistón la sacó."),
    ]
    for i, (col, n, title, body) in enumerate(steps):
        x = 40 + i * 352
        rr(d, (x, 40, x + 330, 560), 18, WHITE, col, 5)
        d.ellipse((x + 24, 64, x + 100, 140), fill=col)
        center(d, x + 62, 102, n, FB, WHITE)
        text(d, (x + 120, 78), title, FM, col)
        yy = 200
        for line in body.split("\n"):
            text(d, (x + 28, yy), line, FS, INK)
            yy += 48
        if i < 4:
            arrow(d, x + 330, 280, x + 352, 280, FAINT, 6, 14)

    # cuatro casos
    text(d, (40, 600), "Lo que IR2 le dice al PLC", FM, INK)
    cases = [
        (OK, PI_SOFT, "PASS", "IR2 sí la ve", "Pieza aceptada", "Sigue en la banda"),
        (PISTON, PISTON_SOFT, "FAIL", "IR2 ya no la ve", "Scrap expulsado", "El pistón la sacó"),
        (DANGER, DANGER_BG, "FAIL", "IR2 sí la ve", "Fallo de actuación", "Se pidió sacar y siguió"),
        ((146, 64, 14), WARN_BG, "PASS", "IR2 no la ve", "Parar y alarmar", "Se perdió sin orden"),
    ]
    for i, (col, bg, res, ir, accion, note) in enumerate(cases):
        x = 40 + i * 440
        rr(d, (x, 670, x + 420, 940), 16, bg, col, 4)
        text(d, (x + 20, 695), res, FM, col)
        text(d, (x + 20, 750), ir, FS, INK)
        text(d, (x + 20, 810), accion, FM, INK)
        text(d, (x + 20, 865), note, FX, MUTED)
    save(im, "04-secuencia.png")


def pantalla():
    im, d = new(1800, 1100)
    # marco de la pagina
    rr(d, (40, 40, 1760, 1060), 16, WHITE, LINE, 3)
    rr(d, (40, 40, 1760, 120), 16, PLC)
    d.rectangle((40, 80, 1760, 120), fill=PLC)
    text(d, (70, 62), "Celda  ·  la pantalla que ya existe", FM, WHITE)
    text(d, (1280, 68), "celda.html", FX, (191, 219, 254))

    # camara
    rr(d, (70, 160, 980, 760), 12, (23, 23, 23))
    center(d, 525, 420, "VIDEO DE LA CÁMARA", FM, WHITE)
    center(d, 525, 480, "viene del Raspberry", FS, (212, 212, 216))
    pill(d, 525, 560, "Iniciar cámara", FX, INK, WHITE, 16, 8)
    text(d, (90, 700), "Fuente:  /line/vision/stream", FX, (212, 212, 216))

    # juicio
    rr(d, (1020, 160, 1720, 400), 12, PI_SOFT, OK, 4)
    text(d, (1050, 185), "Juicio  ·  última pieza", FX, MUTED)
    text(d, (1050, 250), "PASS", FB, OK)
    text(d, (1280, 270), "Pieza #12", FS, INK)
    text(d, (1050, 340), "Sigue en la banda", FX, MUTED)

    # kpis
    kpis = [("Inspeccionadas", "12"), ("PASS", "10"), ("FAIL", "2"), ("Enlace PLC", "OK")]
    for i, (k, v) in enumerate(kpis):
        x = 1020 + (i % 2) * 350
        y = 430 + (i // 2) * 150
        col = OK if k == "PASS" else PISTON if k == "FAIL" else PLC
        rr(d, (x, y, x + 330, y + 130), 12, WHITE, LINE, 3)
        text(d, (x + 16, y + 16), k, FX, MUTED)
        text(d, (x + 16, y + 58), v, FB, col)

    # flechas de origen
    rr(d, (70, 800, 1720, 1020), 12, PLC_SOFT, PLC, 3)
    text(d, (100, 830), "De dónde sale cada cosa", FM, PLC)
    text(d, (100, 900), "El video y los números los pide la laptop. La página no cambia de dirección.", FS, INK)
    text(d, (100, 955), "Video  →  /line/vision/stream          Números, PASS/FAIL y enlace PLC  →  /line/cell/status", FS, INK)

    save(im, "05-pantalla.png")


def red():
    im, d = new(1800, 860)
    rr(d, (680, 280, 1120, 500), 20, WHITE, ETH, 5)
    center(d, 900, 360, "SWITCH", FB, ETH)
    center(d, 900, 430, "tres cables", FS, MUTED)
    nodes = [
        (60, 40, "Laptop", "192.168.0.10", "puerto 8000", (68, 64, 60), 300, 250),
        (1320, 40, "Raspberry", "192.168.0.20", "puerto 8080", PI, 1500, 250),
        (690, 540, "PLC", "192.168.0.30", "Modbus, puerto 502", PLC, 900, 540),
    ]
    for x, y, name, ip, port, col, ax, ay in nodes:
        rr(d, (x, y, x + 420, y + 210), 18, WHITE, col, 5)
        center(d, x + 210, y + 55, name, FM, col)
        center(d, x + 210, y + 115, ip, FB, INK)
        center(d, x + 210, y + 170, port, FX, MUTED)
    arrow(d, 480, 200, 700, 340, ETH, 8, 16)
    arrow(d, 1320, 200, 1100, 340, ETH, 8, 16)
    arrow(d, 900, 540, 900, 500, ETH, 8, 16)
    center(d, 900, 810, "Nadie se enchufa directo a otra máquina. Si el laboratorio ya tiene otras IP, se usan esas.", FX, MUTED)
    save(im, "06-red.png")


def _pi_card(d, x, y, w, h, title, sub, color, soft):
    rr(d, (x, y, x + w, y + h), 18, soft, color, 5)
    text(d, (x + 28, y + 24), title, FM, color)
    text(d, (x + 28, y + 70), sub, FX, MUTED)


def manana():
    im, d = new(1800, 1180)
    text(d, (40, 20), "Lo que el programa abre. Nada más.", FB, INK)

    _pi_card(d, 40, 100, 840, 620, "Raspberry del sistema de visión", "cámara de la celda", CAM, CAM_SOFT)
    rr(d, (70, 220, 280, 340), 14, CAM)
    center(d, 175, 280, "CÁMARA", FM, WHITE)
    d.line((280, 280, 400, 280), fill=INK, width=8)
    pill(d, 340, 240, "USB", FX, WHITE, INK, 8, 3)
    rr(d, (400, 210, 840, 400), 14, WHITE, PI, 4)
    text(d, (430, 230), "El programa abre este número", FX, MUTED)
    text(d, (430, 275), "cámara  0", FB, PI)
    text(d, (430, 340), "LINE_VISION_CAMERA_INDEX", FX, INK)
    text(d, (430, 375), "en la Raspberry:  /dev/video0", FX, MUTED)

    rr(d, (70, 440, 840, 680), 14, WHITE, ETH, 4)
    text(d, (100, 465), "Red", FM, ETH)
    text(d, (100, 520), "Puerto  8000", FB, INK)
    text(d, (100, 590), "/line/vision/stream", FS, ETH)
    text(d, (100, 635), "La pantalla pide esa ruta. No otra.", FX, MUTED)

    _pi_card(d, 920, 100, 840, 620, "Segunda Raspberry, si se monta", "percepción del robot. Otra máquina.", PI, PI_SOFT)
    rr(d, (950, 220, 1160, 340), 14, PI)
    center(d, 1055, 280, "SU CÁMARA", FM, WHITE)
    d.line((1160, 280, 1280, 280), fill=INK, width=8)
    rr(d, (1280, 210, 1720, 400), 14, WHITE, PI, 4)
    text(d, (1310, 230), "En ESA Raspberry también es", FX, MUTED)
    text(d, (1310, 275), "cámara  0", FB, PI)
    text(d, (1310, 340), "PERCEPTION_CAMERA_INDEX", FX, INK)
    text(d, (1310, 375), "/dev/video0   de esa máquina", FX, MUTED)
    rr(d, (950, 440, 1720, 680), 14, WHITE, ETH, 4)
    text(d, (980, 465), "Red", FM, ETH)
    text(d, (980, 520), "Puerto  8000   en esa Raspberry", FB, INK)
    text(d, (980, 590), "/perception/stream", FS, ETH)
    text(d, (980, 635), "No se enchufa la cámara de la celda aquí.", FX, MUTED)

    rr(d, (40, 760, 1760, 920), 16, WARN_BG, (146, 64, 14), 4)
    text(d, (70, 790), "Si las dos cámaras van en la misma Raspberry", FM, (146, 64, 14))
    text(d, (70, 850), "No las dejes en 0. La de la celda queda en  LINE_VISION_CAMERA_INDEX=1", FS, INK)

    rr(d, (40, 960, 1760, 1140), 16, DANGER_BG, DANGER, 4)
    text(d, (70, 990), "Los pines GPIO no se usan", FM, DANGER)
    text(d, (70, 1050), "main.py no lee ningún pin. Mañana el cabezal de 40 pines se queda sin cables.", FS, INK)
    save(im, "07-manana-camaras.png")

    im, d = new(1800, 980)
    text(d, (40, 20), "Sensores: se montan. El programa no los lee.", FB, INK)

    rr(d, (40, 110, 1760, 250), 16, BELT)
    center(d, 280, 180, "IR1", FB, WHITE)
    center(d, 900, 180, "cámara", FB, WHITE)
    center(d, 1500, 180, "IR2", FB, WHITE)
    text(d, (160, 210), "antes de la cámara", FX, (230, 224, 214))
    text(d, (1360, 210), "después del pistón", FX, (230, 224, 214))

    # cables que se cortan
    d.line((280, 250, 280, 420), fill=SENS, width=8)
    d.line((1500, 250, 1500, 420), fill=SENS, width=8)
    d.line((280, 420, 900, 420), fill=SENS, width=8)
    d.line((1500, 420, 900, 420), fill=SENS, width=8)
    rr(d, (620, 360, 1180, 500), 16, DANGER_BG, DANGER, 5)
    center(d, 900, 415, "AQUÍ SE CORTA", FM, DANGER)
    center(d, 900, 460, "no hay borne en el código", FX, DANGER)

    rows = [
        ("Cámara de la celda", "Sí", "número 0, USB, /dev/video0"),
        ("Cámara del robot", "Sí, en la otra Raspberry", "número 0 de esa máquina"),
        ("Puerto de la pantalla", "Sí", "8000"),
        ("Infrarrojo 1 y 2", "No", "ningún pin, ningún registro"),
        ("Pistón y PLC", "No", "plc_backend está vacío"),
        ("Números de la celda", "No", "siguen simulados"),
    ]
    y = 540
    for name, estado, detalle in rows:
        col = OK if estado.startswith("Sí") else DANGER
        bg = PI_SOFT if estado.startswith("Sí") else DANGER_BG
        rr(d, (40, y, 1760, y + 64), 10, bg, col, 3)
        text(d, (60, y + 16), name, FS, INK)
        text(d, (620, y + 16), estado, FS, col)
        text(d, (1100, y + 16), detalle, FS, INK)
        y += 72
    save(im, "08-manana-sensores.png")


if __name__ == "__main__":
    vista()
    cables()
    bornes()
    secuencia()
    pantalla()
    red()
    manana()
