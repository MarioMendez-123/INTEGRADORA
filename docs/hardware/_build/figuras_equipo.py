"""Láminas para el equipo. Mismo estilo que figuras.py. Salen en docs/hardware/figuras/."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import figuras as f

OUT = Path(__file__).resolve().parents[1] / "figuras"
OUT.mkdir(exist_ok=True)


def save(im, name):
    path = OUT / name
    im.save(path, "PNG")
    print(path, im.size)


def sistema():
    im, d = f.new(2000, 1200)
    f.center(d, 1000, 50, "Aether — qué se conecta con qué", f.FB, f.INK)
    f.center(d, 1000, 100, "Dos máquinas. Un switch. El robot no habla Modbus.", f.FS, f.MUTED)

    f._box(d, (60, 180, 620, 980), f.PI, f.PI_SOFT, "", "")
    f.text(d, (90, 200), "CELDA", f.FB, f.PI)
    f.text(d, (90, 270), "Pi 4    192.168.0.20", f.FM, f.INK)
    f.text(d, (90, 330), "Cámara USB de la banda", f.FS, f.INK)
    f.text(d, (90, 380), "Agente HTTP  puerto 8080", f.FS, f.INK)
    f.text(d, (90, 460), "PLC    192.168.0.30", f.FM, f.PLC)
    f.text(d, (90, 520), "Modbus TCP  puerto 502", f.FS, f.INK)
    f.text(d, (90, 570), "IR1 e IR2 a 24 V", f.FS, f.SENS)
    f.text(d, (90, 620), "Pistón y banda", f.FS, f.PISTON)
    f.text(d, (90, 720), "La Pi 4 no toca 24 V.", f.FS, f.DANGER)
    f.text(d, (90, 780), "Los infrarrojos no van", f.FS, f.DANGER)
    f.text(d, (90, 830), "a los GPIO.", f.FS, f.DANGER)

    f._box(d, (700, 180, 1300, 980), (68, 64, 60), (245, 245, 244), "", "")
    f.text(d, (730, 200), "LAPTOP", f.FB, f.INK)
    f.text(d, (730, 270), "192.168.0.10", f.FM, f.INK)
    f.text(d, (730, 360), "Puerto 8000", f.FS, f.INK)
    f.text(d, (730, 410), "celda.html", f.FS, f.MUTED)
    f.text(d, (730, 490), "Puerto 11434", f.FS, f.INK)
    f.text(d, (730, 540), "Ollama, el asistente", f.FS, f.MUTED)
    f.text(d, (730, 620), "Puerto 5055", f.FS, f.INK)
    f.text(d, (730, 670), "Reproductor del video", f.FS, f.MUTED)
    f.text(d, (730, 780), "No corre la cámara", f.FS, f.INK)
    f.text(d, (730, 830), "del robot.", f.FS, f.INK)

    f._box(d, (1380, 180, 1940, 980), f.CAM, f.CAM_SOFT, "", "")
    f.text(d, (1410, 200), "ROBOT", f.FB, f.CAM)
    f.text(d, (1410, 270), "Pi 5    192.168.0.40", f.FM, f.INK)
    f.text(d, (1410, 340), "Cara en Chromium", f.FS, f.INK)
    f.text(d, (1410, 390), "Cámara USB  índice 0", f.FS, f.INK)
    f.text(d, (1410, 440), "Servidor  puerto 8000", f.FS, f.INK)
    f.text(d, (1410, 520), "ESP32 por serial", f.FS, f.INK)
    f.text(d, (1410, 570), "Motores y paro", f.FS, f.MUTED)
    f.text(d, (1410, 650), "Lidar por USB,", f.FS, f.INK)
    f.text(d, (1410, 700), "cuando se compre.", f.FS, f.MUTED)
    f.text(d, (1410, 780), "La cámara del anaquel", f.FS, f.INK)
    f.text(d, (1410, 830), "no va a la laptop.", f.FS, f.INK)
    save(im, "01-sistema.png")


def celda_electrico():
    im, d = f.new(2000, 1300)
    f.center(d, 1000, 48, "Celda — dos alimentaciones que no se tocan", f.FB, f.INK)

    f.rr(d, (40, 110, 980, 1180), 20, f.SENS_SOFT, f.SENS, 6)
    f.text(d, (70, 130), "24 V del tablero", f.FB, f.SENS)
    f.text(d, (70, 200), "Fuente 24 V", f.FM, f.INK)
    f.text(d, (70, 260), "Café del IR  →  +24 V", f.FS, f.INK)
    f.text(d, (70, 310), "Azul del IR  →  0 V", f.FS, f.INK)
    f.text(d, (70, 360), "Negro del IR  →  entrada del PLC", f.FS, f.INK)
    f.text(d, (70, 440), "IR1  pieza frente a la cámara", f.FS, f.SENS)
    f.text(d, (70, 490), "IR2  pieza después del pistón", f.FS, f.SENS)
    f.text(d, (70, 580), "PLC", f.FM, f.PLC)
    f.text(d, (70, 640), "Salida  →  relé  →  pistón", f.FS, f.INK)
    f.text(d, (70, 690), "Salida  →  marcha de la banda", f.FS, f.INK)
    f.text(d, (70, 770), "El PLC cronometra el pulso.", f.FS, f.INK)
    f.text(d, (70, 820), "Partida en vacío: 150 a 300 ms.", f.FS, f.MUTED)
    f.rr(d, (70, 920, 900, 1100), 16, f.DANGER_BG, f.DANGER, 4)
    f.text(d, (100, 950), "Un sensor de 5 V no entra aquí.", f.FS, f.DANGER)
    f.text(d, (100, 1010), "24 V nunca llega a la Raspberry.", f.FS, f.DANGER)

    f.rr(d, (1060, 110, 1960, 1180), 20, f.PI_SOFT, f.PI, 6)
    f.text(d, (1090, 130), "5 V de la Pi 4", f.FB, f.PI)
    f.text(d, (1090, 210), "Fuente propia de 5 V", f.FM, f.INK)
    f.text(d, (1090, 280), "Cámara  →  USB de la Pi", f.FS, f.INK)
    f.text(d, (1090, 360), "Pi 4  →  switch  →  PLC", f.FS, f.ETH)
    f.text(d, (1090, 420), "Solo Ethernet. Puerto 502.", f.FS, f.INK)
    f.text(d, (1090, 500), "Pi 4    192.168.0.20 : 8080", f.FS, f.INK)
    f.text(d, (1090, 560), "PLC     192.168.0.30 : 502", f.FS, f.INK)
    f.text(d, (1090, 680), "No hay GPIO entre", f.FM, f.DANGER)
    f.text(d, (1090, 740), "la Pi y el PLC.", f.FM, f.DANGER)
    f.text(d, (1090, 860), "Direcciones Modbus de prueba", f.FS, f.INK)
    f.text(d, (1090, 920), "IR1 entrada 0    IR2 entrada 1", f.FX, f.MUTED)
    f.text(d, (1090, 970), "rechazar bobina 10", f.FX, f.MUTED)
    f.text(d, (1090, 1020), "banda 11    vivo Pi 12", f.FX, f.MUTED)
    f.text(d, (1090, 1070), "accion reg. 20    pieza reg. 21", f.FX, f.MUTED)
    f.text(d, (1090, 1130), "La columna Real se llena con el PLC comprado.", f.FX, f.DANGER)
    save(im, "02-celda-electrico.png")


def robot_alimentacion():
    im, d = f.new(2000, 1200)
    f.center(d, 1000, 48, "Robot — tres fuentes", f.FB, f.INK)
    f.center(d, 1000, 100, "El positivo de la batería no entra a la Pi", f.FS, f.DANGER)

    f._box(d, (40, 180, 620, 620), f.PI, f.PI_SOFT, "27 W", "USB-C  5 V")
    f.text(d, (70, 660), "Alimenta la Pi 5.", f.FS, f.INK)
    f.text(d, (70, 720), "Un USB de la Pi alimenta", f.FS, f.INK)
    f.text(d, (70, 770), "el ESP32.", f.FS, f.INK)
    f.text(d, (70, 850), "No alimenta motores.", f.FS, f.DANGER)

    f._box(d, (700, 180, 1300, 620), f.SENS, f.SENS_SOFT, "Batería", "de los motores")
    f.text(d, (730, 660), "Fusible, luego el paro.", f.FS, f.INK)
    f.text(d, (730, 720), "Polo 1 del botón, normalmente", f.FS, f.INK)
    f.text(d, (730, 770), "cerrado, corta el positivo", f.FS, f.INK)
    f.text(d, (730, 820), "antes del driver.", f.FS, f.INK)
    f.text(d, (730, 900), "TB6612 solo si cada motor", f.FS, f.DANGER)
    f.text(d, (730, 950), "es de menos de 1 A.", f.FS, f.DANGER)

    f._box(d, (1380, 180, 1960, 620), f.CAM, f.CAM_SOFT, "Pantalla", "su fuente")
    f.text(d, (1410, 660), "micro HDMI del kit", f.FS, f.INK)
    f.text(d, (1410, 720), "a la pantalla.", f.FS, f.INK)
    f.text(d, (1410, 800), "La pantalla no se cuelga", f.FS, f.INK)
    f.text(d, (1410, 850), "del USB de la Pi.", f.FS, f.INK)

    f.rr(d, (40, 1020, 1960, 1140), 16, f.WARN_BG, f.SENS, 4)
    f.text(d, (70, 1055), "Los negativos se unen: batería, GND del driver, GND del ESP32 y pin 6 de la Pi. Un solo punto.", f.FS, f.INK)
    save(im, "03-robot-alimentacion.png")


def robot_cableado():
    im, d = f.new(2200, 1500)
    f.center(d, 1100, 46, "Robot — hilos de señal", f.FB, f.INK)
    f.center(d, 1100, 100, "ESP32-WROOM. No usar un módulo WROVER: los GPIO 16 y 17 ahí están ocupados.", f.FS, f.DANGER)

    f.rr(d, (40, 160, 700, 720), 18, f.PI_SOFT, f.PI, 5)
    f.text(d, (70, 185), "Pi 5", f.FB, f.PI)
    rows = [
        "Pin 8   GPIO 14 TX  →  ESP32 GPIO 16 RX",
        "Pin 10  GPIO 15 RX  ←  ESP32 GPIO 17 TX",
        "Pin 6   GND         —  GND del ESP32",
        "",
        "USB azul  cámara, índice 0",
        "USB       lidar, cuando exista",
        "USB       ESP32, en la primera prueba",
    ]
    y = 270
    for line in rows:
        f.text(d, (70, y), line, f.FX, f.INK)
        y += 52

    f.rr(d, (760, 160, 1440, 980), 18, f.WHITE, f.INK, 5)
    f.text(d, (790, 185), "ESP32  →  TB6612", f.FB, f.INK)
    pairs = [
        "GPIO 25   PWMA    velocidad izquierda",
        "GPIO 26   AIN1    sentido izquierdo",
        "GPIO 27   AIN2    sentido izquierdo",
        "GPIO 32   PWMB    velocidad derecha",
        "GPIO 33   BIN1    sentido derecho",
        "GPIO 18   BIN2    sentido derecho",
        "GPIO 19   STBY    alto = puente activo",
        "GPIO 23   paro    pullup, normalmente a GND",
        "3,3 V     VCC del TB6612",
        "GND       GND del TB6612",
    ]
    y = 270
    for line in pairs:
        f.text(d, (790, y), line, f.FX, f.INK)
        y += 64

    f.rr(d, (1500, 160, 2160, 980), 18, f.SENS_SOFT, f.SENS, 5)
    f.text(d, (1530, 185), "Encoders  3,3 V", f.FB, f.SENS)
    enc = [
        "Izq A   GPIO 34",
        "Izq B   GPIO 35",
        "Der A   GPIO 36",
        "Der B   GPIO 39",
        "VCC     3,3 V",
        "GND     GND",
        "",
        "Esos pines son solo entrada.",
        "Si el encoder no trae",
        "resistencia, 10 kΩ a 3,3 V.",
    ]
    y = 270
    for line in enc:
        f.text(d, (1530, y), line, f.FX, f.INK)
        y += 58

    f.rr(d, (40, 1060, 2160, 1420), 18, f.DANGER_BG, f.DANGER, 4)
    f.text(d, (70, 1090), "Paro de dos circuitos, normalmente cerrado", f.FM, f.DANGER)
    f.text(d, (70, 1170), "Circuito 1: en serie con el positivo de la batería, antes del driver. Corta la fuerza.", f.FS, f.INK)
    f.text(d, (70, 1240), "Circuito 2: GPIO 23 del ESP32 a GND. Botón suelto = pin en bajo. Pulsado = pin en alto.", f.FS, f.INK)
    f.text(d, (70, 1320), "VM del TB6612 aguanta unos 15 V y 1 A por motor. Más corriente: no usar esta lámina.", f.FS, f.DANGER)
    save(im, "04-robot-cableado.png")


def comunicaciones():
    im, d = f.new(2000, 1100)
    f.center(d, 1000, 48, "Quién llama a quién", f.FB, f.INK)

    items = [
        (160, "Cara del robot", "abre 127.0.0.1:8000", "en la propia Pi 5"),
        (560, "Pi 5  →  laptop", "HTTP  :11434", "la frase, Ollama contesta"),
        (960, "Laptop  →  Pi 5", "WebSocket  :8000", "eventos del guion, no video"),
        (1360, "Laptop  →  Pi 4", "HTTP  :8080", "video y estado de la celda"),
        (1760, "Pi 4  →  PLC", "Modbus  :502", "solo la celda"),
    ]
    for x, title, port, sub in items:
        f.rr(d, (x - 160, 180, x + 160, 520), 18, f.WHITE, f.ETH, 5)
        f.center(d, x, 250, title, f.FX, f.ETH)
        f.center(d, x, 340, port, f.FM, f.INK)
        f.center(d, x, 430, sub, f.FX, f.MUTED)

    f.rr(d, (80, 640, 1920, 1000), 18, f.PI_SOFT, f.PI, 4)
    f.text(d, (120, 680), "Si se cae el Wi-Fi", f.FB, f.PI)
    f.text(d, (120, 770), "Siguen la cara, la cámara, el conteo en la Pi y el freno del ESP32.", f.FS, f.INK)
    f.text(d, (120, 840), "Se pierden la frase de Ollama y el acople con la televisión.", f.FS, f.INK)
    f.text(d, (120, 910), "El pistón no depende de ese Wi-Fi. Depende del cable entre la Pi 4 y el PLC.", f.FS, f.INK)
    save(im, "05-comunicaciones.png")


if __name__ == "__main__":
    sistema()
    celda_electrico()
    robot_alimentacion()
    robot_cableado()
    comunicaciones()
