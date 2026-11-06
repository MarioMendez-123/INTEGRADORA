"""Genera los diagramas del Avance 2 (SVG). Uso: python figs.py figuras/"""
import sys
from pathlib import Path

from svglib import INK, Svg

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "figuras")
OUT.mkdir(exist_ok=True)


# --------------------------------------------------------------------------------------------- 1. flujo general
def general():
    s = Svg(1800, 1010)
    colx = [190, 510, 830, 1150, 1470]
    cw = 300
    heads = [("ENTRADAS", "entrada"), ("PROCESO", "proceso"), ("CONTROL", "control"), ("ACTUADORES", "actuador"), ("SALIDAS", "salida")]
    for x, (t, tipo) in zip(colx, heads):
        s.caja(x, 20, cw, 38, t, tipo, bold=True, fs=15, rx=8)
    bandas = [
        ("LÍNEA DE\nMANUFACTURA\n(celda)", 80, 270),
        ("ROBOT DE\nTRANSPORTE\n(carrito)", 420, 330),
        ("SOFTWARE\nY DATOS\n(laptop)", 800, 170),
    ]
    celdas = [
        [
            ("Pieza (ECU) sobre su fixture, en la banda\nInfrarrojo de presencia de 24 V → LOGO!\nImagen de la cámara USB", "entrada"),
            ("La banda lleva la pieza al punto de inspección\nVisión: YOLO (ONNX) cada 0.5 s\n5 juicios iguales seguidos antes de actuar", "proceso"),
            ("Raspberry Pi 4: juicio PASS / FAIL, temporizador y salidas\nLOGO!: secuencia de la banda (ignora su infrarrojo 5 s)", "control"),
            ("Relevador GPIO 8 → electroválvula de 24 V → pistón\nRelevador GPIO 9 → entrada I4 del LOGO! → motor de la banda", "actuador"),
            ("PASS: la pieza sigue hacia el carrito\nFAIL: la pieza es expulsada (scrap)\nEvento de pieza a la laptop", "salida"),
        ],
        [
            ("Fixture que llega por la banda (QR y ArUco)\nVL53L0X ×4 · QTR-8A · IMU BNO055\nEncoders · finales de carrera · paro", "entrada"),
            ("Acople a la banda → carga de hasta 6 fixtures → viaje → descarga en la mesa inclinada", "proceso"),
            ("Jetson Orin Nano Super: visión, ruta por waypoints y órdenes\nESP32: tiempo real, odometría y watchdog de 1 s", "control"),
            ("2 motores-rueda M0601 (RS485)\n2 NEMA 17 del elevador y 1 del empujador (A4988)\nServo MG90S de la uña", "actuador"),
            ("Fixtures ordenados en la mesa de descarga\nObservaciones JSON a la laptop\nEstado del robot", "salida"),
        ],
        [
            ("Observaciones del Jetson y eventos de la Pi\nPreguntas a Lumina (voz o texto)", "entrada"),
            ("Agrupar Observations en Declared Inventory\ny conservar el historial", "proceso"),
            ("Servidor FastAPI: valida contratos, descarta repetidos (event_id) y filtra por red", "control"),
            ("No mueve hardware: solo anota y muestra", "nota"),
            ("Panel web: inventario, historial, celda y Lumina\nBase de datos SQLite", "salida"),
        ],
    ]
    for (etq, y, h), fila in zip(bandas, celdas):
        s.rect(10, y, 1780, h, fill="#FAFBFC", stroke="#C9D1DB", sw=1.5, rx=10)
        s.caja(20, y + 10, 150, h - 20, etq, "inicio", bold=True, fs=15, rx=10)
        for i, (tx, tipo) in enumerate(fila):
            s.caja(colx[i], y + 12, cw, h - 24, tx, tipo, fs=14, dash=(tipo == "nota"), align="middle")
        for i in range(4):
            xa = colx[i] + cw
            ym = y + h / 2
            s.flecha([(xa, ym), (colx[i + 1], ym)])
    # enlaces entre franjas
    s.flecha([(1620, 350), (1620, 372), (340, 372), (340, 432)], "la pieza aceptada en su fixture llega al carrito", lx=420, ly=364, fs=13)
    s.flecha([(1620, 750), (1620, 784), (340, 784), (340, 812)], "observaciones del carrito y eventos de pieza de la celda, en JSON", lx=420, ly=776, fs=13)
    s.flecha([(1750, 350), (1750, 790), (1620, 790)], None, dash=True)
    s.text(1760, 560, "eventos\nde pieza", fs=12, color="#6B7685")
    s.guardar(OUT / "flujo_general.svg")


# --------------------------------------------------------------------------------------------- 3. ciclo del carrito
def carrito():
    s = Svg(1300, 1890)
    cx, bw = 470, 360
    x0 = cx - bw / 2

    def c(y, h, texto, tipo="proceso", **kw):
        s.caja(x0, y, bw, h, texto, tipo, **kw)

    c(30, 56, "INICIO · carrito encendido (KCD1), paro suelto y relé cerrado", "inicio", bold=True, rx=28)
    c(120, 70, "Navegar a la banda por waypoints (máx. 0.35 m/s y 0.4 m/s²); los VL53L0X frenan si algo está a < 40 cm", "control", fs=13)
    c(224, 62, "Acople: el embudo centra el frente y el ArUco confirma la posición (±5 mm)", "entrada", fs=13)
    c(320, 70, "Home del elevador y del empujador (finales de carrera); plataforma a 82.7 cm, 3 mm bajo la cinta", "proceso", fs=13)
    c(424, 52, "Avisar «listo»; se coloca un fixture en la punta lejana de la banda", "proceso", fs=13)
    c(510, 66, "El fixture viaja con la cinta, baja a la pila y cae plano ≈ 6 cm afuera de la ventana; la cámara lee su QR", "entrada", fs=13)
    c(610, 86, "La uña baja → el empujador jala ≈ 7.7 cm → la uña sube → el empujador regresa a home → la plataforma baja 7 cm", "actuador", fs=13)
    for a, b in [(86, 120), (190, 224), (286, 320), (390, 424), (476, 510), (576, 610)]:
        s.flecha([(cx, a), (cx, b)])
    s.flecha([(cx, 696), (cx, 735)])
    s.rombo(cx, 800, 340, 120, "¿La pila ya tiene 6 fixtures?")
    s.flecha([(300, 800), (110, 800), (110, 450), (x0, 450)], "No: esperar el siguiente", lx=122, ly=788)
    s.flecha([(cx, 860), (cx, 905)], "Sí", lx=cx + 8, ly=890)
    c(905, 62, "Viaje a la estación de descarga: waypoints, odometría con encoders e IMU", "control", fs=13)
    c(1000, 60, "El embudo y el ArUco centran el carrito; home del elevador", "entrada", fs=13)
    c(1094, 72, "El elevador sube por pasos contados hasta que el fixture de arriba queda en la ventana (el VL53L0X lo confirma)", "actuador", fs=13)
    c(1200, 72, "El empujador avanza 25 cm: el fixture sale a la mesa inclinada (≈ 15°) y resbala hasta el tope", "actuador", fs=13)
    for a, b in [(967, 1000), (1060, 1094), (1166, 1200)]:
        s.flecha([(cx, a), (cx, b)])
    s.flecha([(cx, 1272), (cx, 1310)])
    s.rombo(cx, 1375, 340, 120, "¿Quedan fixtures en la torre?")
    s.flecha([(640, 1375), (870, 1375), (870, 1130), (x0 + bw, 1130)], "Sí: subir un nivel", lx=700, ly=1363)
    s.flecha([(cx, 1435), (cx, 1480)], "No", lx=cx + 8, ly=1470)
    c(1480, 62, "Registrar las observaciones (JSON) en la laptop y regresar a la banda", "salida", fs=13)
    s.flecha([(cx, 1542), (cx, 1590)])
    c(1590, 54, "FIN del ciclo · el paro corta el relé en cualquier momento", "inicio", bold=True, rx=27, fs=13)
    s.flecha([(x0 + bw, 1617), (1000, 1617), (1000, 155), (x0 + bw, 155)], "otro ciclo", lx=1005, ly=900, dash=True)
    s.caja(760, 1680, 480, 150, "Estado: diseño documentado en la hoja de armado (revisión 3.8). El firmware del ESP32 y la prueba con el carrito armado están pendientes; los tiempos son los de la hoja (≈ 7 s por nivel y ≈ 18 s por fixture).", "nota", fs=13, dash=True, titulo="Nota")
    s.guardar(OUT / "flujo_carrito.svg")


# --------------------------------------------------------------------------------------------- 4. arquitectura
def arquitectura():
    s = Svg(1800, 1100)
    # laptop
    s.rect(500, 60, 560, 560, fill="#F6F8FB", stroke="#2F6DB5", sw=2.5, rx=14)
    s.text(780, 92, "LAPTOP (Windows) · servidor central", fs=17, bold=True, anchor="middle", color="#2F6DB5")
    s.caja(530, 115, 500, 62, "Servidor FastAPI · puerto 8000: API REST, contratos, guardias de red, archivos del panel", "control", fs=14)
    s.caja(530, 195, 240, 62, "Base de datos SQLite\n(aether.db)", "proceso", fs=14)
    s.caja(790, 195, 240, 62, "Ollama · puerto 11434\n(modelo de Lumina)", "proceso", fs=14)
    s.caja(530, 275, 240, 66, "Servicio de voz: micrófono local + Vosk (solo texto)", "entrada", fs=14)
    s.caja(790, 275, 240, 66, "Navegador: panel web, celda, Lumina, dataset", "salida", fs=14)
    s.caja(530, 360, 500, 56, "Motor de inventario: Observations → Declared Inventory + historial", "proceso", fs=14)
    s.caja(530, 435, 500, 70, "Puertos: 8000 servidor · 11434 Ollama · 5055 video de presentación · 8888 callback de música (solo 127.0.0.1)", "nota", fs=13, dash=True)
    s.caja(530, 525, 500, 70, "Red local privada (cable y WiFi) · firewall de Windows solo en perfil Privado", "nota", fs=13, dash=True)
    # robot
    s.rect(1180, 40, 590, 520, fill="#F7F3FB", stroke="#7B52B5", sw=2.5, rx=14)
    s.text(1475, 72, "ROBOT CARRITO", fs=17, bold=True, anchor="middle", color="#7B52B5")
    s.caja(1210, 95, 530, 110, "Jetson Orin Nano Super · agente de percepción (puerto 8001): cámara USB, YOLO, QR, ArUco; sirve su propio video MJPEG", "control", fs=14)
    s.caja(1210, 250, 530, 62, "ESP32 DevKitC · control de bajo nivel y watchdog de 1 s", "control", fs=14)
    s.caja(1210, 360, 250, 90, "RS485 (MAX485) → 2 motores-rueda M0601", "actuador", fs=13)
    s.caja(1490, 360, 250, 90, "STEP / DIR → 3 A4988 → 3 NEMA 17 + servo MG90S", "actuador", fs=13)
    s.caja(1210, 470, 530, 70, "I²C: VL53L0X ×4 · BNO055 · PCF8574 · finales de carrera · QTR-8A · batería", "entrada", fs=13)
    s.flecha([(1475, 205), (1475, 250)], "USB serie", lx=1485, ly=233, fs=12)
    s.flecha([(1335, 312), (1335, 360)])
    s.flecha([(1615, 312), (1615, 360)])
    s.flecha([(1475, 470), (1475, 312)], None)
    # celda
    s.rect(500, 700, 1270, 360, fill="#FDF6F2", stroke="#C8501E", sw=2.5, rx=14)
    s.text(1135, 732, "CELDA DE MANUFACTURA", fs=17, bold=True, anchor="middle", color="#C8501E")
    s.caja(530, 760, 360, 130, "Raspberry Pi 4 · agente de la celda (puerto 8000): cámara USB, YOLO ONNX, juicio PASS/FAIL, celda.html y su propio video", "control", fs=14)
    s.caja(960, 760, 230, 56, "Relevador GPIO 8", "actuador", fs=14)
    s.caja(960, 834, 230, 56, "Relevador GPIO 9", "actuador", fs=14)
    s.caja(1260, 760, 230, 56, "Electroválvula 24 V → pistón de scrap", "actuador", fs=13)
    s.caja(1260, 834, 230, 56, "LOGO! (entrada I4) → motor de la banda", "actuador", fs=13)
    s.caja(1540, 834, 200, 56, "Infrarrojo de la banda → LOGO!", "entrada", fs=13)
    s.flecha([(890, 788), (960, 788)])
    s.flecha([(890, 862), (960, 862)])
    s.flecha([(1190, 788), (1260, 788)])
    s.flecha([(1190, 862), (1260, 862)])
    s.flecha([(1540, 862), (1490, 862)])
    s.flecha([(710, 890), (710, 940), (1375, 940), (1375, 890)], "Modbus TCP (diseño de la Unidad III, por confirmar)", dash=True, lx=760, ly=930, fs=12)
    s.caja(530, 965, 1200, 70, "Fuente de 24 V del tablero (LOGO!, infrarrojo, electroválvula) separada de la fuente de 5 V de la Pi: ninguna señal de 24 V llega a un GPIO", "nota", fs=13, dash=True)
    # nube
    s.rect(20, 80, 400, 340, fill="#FAFAFA", stroke="#6B7685", sw=2, rx=14)
    s.text(220, 112, "INTERNET", fs=17, bold=True, anchor="middle", color="#6B7685")
    s.caja(45, 135, 350, 66, "ElevenLabs: síntesis de la voz de Lumina (HTTPS)", "proceso", fs=14)
    s.caja(45, 225, 350, 76, "GitHub Pages + Cloudflare: sitio público estático aethermx.online (sin backend)", "proceso", fs=14)
    s.caja(45, 325, 350, 70, "Servicio de mensajería para llamadas de Lumina (lista local de contactos)", "proceso", fs=13)
    s.flecha([(500, 165), (395, 165)], "HTTPS", lx=420, ly=155, fs=12)
    # enlaces
    s.flecha([(1210, 150), (1060, 150)], "POST observaciones\nJSON con event_id", lx=1066, ly=118, fs=12)
    s.flecha([(680, 760), (680, 620)], "POST eventos de pieza", lx=500, ly=690, fs=12)
    s.flecha([(1010, 340), (1010, 380), (1060, 380), (1210, 380)], None, dash=True)
    s.text(1090, 400, "el video de cada cámara\nse ve en su propio equipo", fs=12, color="#6B7685")
    s.guardar(OUT / "arquitectura.svg")


# --------------------------------------------------------------------------------------------- 5. layout
def layout():
    s = Svg(1850, 940)
    k = 4.0  # px por cm
    ox, oy = 90, 330  # origen: extremo cerrado de la banda
    bx0 = ox + 220
    belt_len, belt_w = 309, 26
    # banda
    s.rect(bx0, oy, belt_len * k, belt_w * k, fill="#E5E8EC", stroke="#6B7685", sw=2.5, rx=4)
    s.text(bx0 + belt_len * k / 2, oy + belt_w * k / 2 + 6, "BANDA TRANSPORTADORA · 3 tramos de 1030 mm = 309 cm · cinta de 20.35 cm", fs=15, bold=True, anchor="middle", color="#4A5563")
    # carrito
    cw_, cl_ = 40 * k, 50 * k
    cyc = oy + belt_w * k / 2
    s.rect(bx0 - cl_ - 8, cyc - cw_ / 2, cl_, cw_, fill="#EBE3F6", stroke="#7B52B5", sw=2.5, rx=6)
    s.text(bx0 - cl_ / 2 - 8, cyc - 8, "CARRITO", fs=15, bold=True, anchor="middle", color="#7B52B5")
    s.text(bx0 - cl_ / 2 - 8, cyc + 14, "50 × 40 cm", fs=13, anchor="middle")
    s.rect(bx0 - 14, cyc - 12 * k, 6, 24 * k, fill="#7B52B5", stroke="#7B52B5")
    s.text(bx0 - cl_ / 2 - 8, cyc + 36, "ventana de 24 cm a 83 cm", fs=12, anchor="middle", color="#7B52B5")
    # estaciones (esquemáticas)
    xcam = bx0 + 175 * k
    s.caja(xcam - 70, oy - 175, 140, 62, "Cámara USB + soporte (Pi 4)", "entrada", fs=13)
    s.flecha([(xcam, oy - 113), (xcam, oy - 6)])
    s.caja(xcam + 90, oy - 175, 120, 62, "Infrarrojo de presencia", "entrada", fs=13)
    s.flecha([(xcam + 150, oy - 113), (xcam + 150, oy - 6)])
    xp = bx0 + 105 * k
    s.caja(xp - 60, oy + belt_w * k + 40, 120, 60, "Pistón de scrap + electroválvula", "actuador", fs=13)
    s.flecha([(xp, oy + belt_w * k + 40), (xp, oy + belt_w * k + 4)])
    s.caja(xp + 90, oy + belt_w * k + 80, 130, 54, "Contenedor de scrap", "salida", fs=13)
    s.flecha([(xp + 60, oy + belt_w * k + 70), (xp + 90, oy + belt_w * k + 100)], dash=True)
    s.caja(bx0 + 240 * k - 10, oy + belt_w * k + 50, 230, 100, "Tablero: LOGO!, fuente de 24 V, relevadores y paro de emergencia de la celda (por confirmar)", "control", fs=13)
    s.caja(bx0 + 150 * k, oy - 255, 190, 60, "Raspberry Pi 4 (celda)", "control", fs=13)
    s.flecha([(xcam - 10, oy - 195), (xcam - 10, oy - 175)], dash=True)
    # carga de fixtures
    xe = bx0 + belt_len * k
    s.flecha([(xe + 70, cyc), (xe - 4, cyc)])
    s.caja(xe + 10, cyc - 140, 150, 60, "Carga de fixtures (se coloca uno a la vez)", "proceso", fs=13)
    s.flecha([(xe + 85, cyc - 80), (xe + 85, cyc - 30)], dash=True)
    # laptop
    s.caja(bx0 + 20 * k, oy - 255, 240, 100, "Laptop (servidor) + switch de red · 192.168.0.x en la celda", "control", fs=13)
    # mesa de descarga
    mw, mh = 140 * k, 30 * k
    mx, my = 60, 660
    s.rect(mx, my, mw, mh, fill="#F3E9DC", stroke="#B7834A", sw=2.5, rx=4)
    s.text(mx + mw / 2, my + 50, "MESA INCLINADA DE DESCARGA · 140 × 30 cm · ≈ 15°", fs=14, bold=True, anchor="middle", color="#8A5F2C")
    s.text(mx + mw / 2, my + 72, "borde a 83 cm · recibe los 6 fixtures", fs=12, anchor="middle")
    s.flecha([(bx0 - cl_ / 2 - 8, cyc + cw_ / 2 + 4), (bx0 - cl_ / 2 - 8, my - 6)], dash=True)
    s.text(bx0 - cl_ / 2 + 14, 560, "ruta por waypoints\n(distancia por definir)", fs=12, color="#6B7685")
    # cotas
    def cota_h(x1, x2, y, txt):
        s.linea(x1, y, x2, y, "#1B2A41", 1.5)
        s.linea(x1, y - 7, x1, y + 7, "#1B2A41", 1.5)
        s.linea(x2, y - 7, x2, y + 7, "#1B2A41", 1.5)
        s.text((x1 + x2) / 2, y - 8, txt, fs=13, bold=True, anchor="middle")
    cota_h(bx0, bx0 + belt_len * k, oy + belt_w * k + 190, "309 cm")
    cota_h(mx, mx + mw, my + mh + 28, "140 cm")
    # escala
    s.linea(1300, 900, 1300 + 100 * k, 900, "#1B2A41", 3)
    s.text(1300, 890, "Escala: 100 cm", fs=13, bold=True)
    s.caja(990, 690, 600, 150, "Notas · Están a escala la banda (309 cm), el carrito (50 × 40 cm) y la mesa (140 × 30 cm). La posición de la cámara, el infrarrojo, el pistón, el contenedor y el tablero a lo largo de la banda es esquemática; sus cotas están PENDIENTES (las confirma Isaac con la banda armada). La distancia entre la banda y la mesa se define con la ruta del carrito.", "nota", fs=12, dash=True, align="start")
    s.text(925, 40, "Vista superior de la distribución física", fs=20, bold=True, anchor="middle")
    s.text(925, 66, "El carrito se acopla al extremo cerrado de la banda; la pieza avanza de derecha a izquierda", fs=14, anchor="middle", color="#4A5563")
    s.guardar(OUT / "layout.svg")


# --------------------------------------------------------------------------------------------- 6. vista lateral con cotas
def carrito_cotas():
    s = Svg(1400, 940)
    k = 7.0  # px/cm
    gx, gy = 420, 880  # piso (x del eje trasero del carrito, y del piso)

    def Y(cm):
        return gy - cm * k

    # piso
    s.linea(150, gy, 1250, gy, "#1B2A41", 3)
    W = 50 * k
    x_l, x_r = gx, gx + W
    # marco
    s.rect(x_l, Y(104), W, 95 * k, fill="#F6F8FB", stroke="#8D9BAB", sw=3)
    for fy in (9.5, 103.5):
        s.rect(x_l, Y(fy) - 3, W, 6, fill="#8D9BAB", stroke="#8D9BAB")
    # torre: columnas y plataforma
    s.rect(x_r - 8 * k, Y(101), 4, 91 * k, fill="#F07F1E", stroke="#F07F1E")
    s.rect(x_r - 28 * k, Y(101), 4, 91 * k, fill="#F07F1E", stroke="#F07F1E")
    plat_cm = [40.7, 47.7, 54.7, 61.7, 68.7, 75.7]
    for i, p in enumerate(plat_cm):
        s.rect(x_r - 27 * k, Y(p + 6.4), 19 * k, 6.4 * k, fill="#D1EFEA", stroke="#0D9488", sw=1.5)
        s.text(x_r - 17.5 * k, Y(p + 3.2) + 5, f"fixture {i + 1}", fs=11, anchor="middle")
    # banda y ventana
    s.rect(x_r + 5, Y(83), 120, 6, fill="#6B7685", stroke="#6B7685")
    s.text(x_r + 135, Y(83) + 5, "banda a 83 cm", fs=13, bold=True)
    s.rect(x_r - 4, Y(91.5), 8, 9.7 * k, fill="#FFE9A8", stroke="#B98A00", sw=2)
    s.text(x_r + 135, Y(91.5) - 6, "ventana: 81.8 a 91.5 cm", fs=13)
    # ruedas y rodajas
    s.rect(x_l + 25 * k - 14, Y(10.2), 28, 10.2 * k, fill="#2F6DB5", stroke="#1B2A41", sw=2, rx=14)
    s.text(x_l + 25 * k, Y(10.2) - 8, "rueda Ø 10.2", fs=12, anchor="middle")
    for xr in (x_l + 4 * k, x_r - 4 * k):
        s.rect(xr - 6, Y(9), 12, 9 * k, fill="#C5CBD3", stroke="#6B7685", sw=2)
    # batería
    s.rect(x_l + 15 * k, Y(9.5 + 12.5), 17 * k, 12.5 * k, fill="#2B3138", stroke="#1B2A41")
    s.text(x_l + 23.5 * k, Y(9.5 + 6), "batería", fs=12, anchor="middle", color="#FFFFFF")
    # electrónica: Jetson y paro
    s.rect(x_l + 3 * k, Y(104 + 4), 16 * k, 4 * k, fill="#C9A66B", stroke="#8A5F2C")
    s.text(x_l + 11 * k, Y(104 + 6), "Jetson", fs=12, anchor="middle")
    s.rect(x_l - 14, Y(105), 14, 14, fill="#C0392B", stroke="#7A1F18")
    s.text(x_l - 20, Y(105) - 4, "paro", fs=12, anchor="end")
    s.rect(x_l + 3 * k, Y(9.5 + 14), 10 * k, 4.5 * k, fill="#C8E6C9", stroke="#2E7D32")
    s.text(x_l + 8 * k, Y(9.5 + 14) - 5, "bandeja", fs=12, anchor="middle")
    # cotas verticales
    def cota_v(x, y1, y2, txt, lado=1):
        s.linea(x, y1, x, y2, "#1B2A41", 1.5)
        s.linea(x - 6, y1, x + 6, y1, "#1B2A41", 1.5)
        s.linea(x - 6, y2, x + 6, y2, "#1B2A41", 1.5)
        s.text(x + lado * 12, (y1 + y2) / 2 + 5, txt, fs=13, bold=True, anchor="start" if lado > 0 else "end")

    cota_v(x_l - 90, gy, Y(104), "104 cm (altura total)", -1)
    cota_v(x_r + 330, gy, Y(83), "83 cm", 1)
    cota_v(x_r + 400, Y(40.7), Y(83.2), "carrera útil\n40.7 a 83.2 cm", 1)
    s.linea(x_l, gy + 28, x_r, gy + 28, "#1B2A41", 1.5)
    s.text((x_l + x_r) / 2, gy + 48, "50 cm (huella en el sentido de avance)", fs=13, bold=True, anchor="middle")
    s.text(700, 40, "Vista lateral del carrito con cotas principales", fs=20, bold=True, anchor="middle")
    s.text(700, 66, "Torre con 6 niveles de 7.0 cm (fixture de 21.3 × 16.5 cm de quilla y 6.4 cm de alto, según la hoja de armado rev. 3.8)", fs=13, anchor="middle", color="#4A5563")
    s.caja(1000, 110, 370, 170, "Ejes: x hacia la banda (frente), y hacia arriba, z a la derecha. Rodajas de 9 cm de alto fijan la altura del marco. El eje de las ruedas queda 7 cm adelante del travesaño central para que la llanta de Ø 10.2 cm no choque con el perfil.", "nota", fs=12, dash=True, align="start")
    s.guardar(OUT / "carrito_cotas.svg")


# --------------------------------------------------------------------------------------------- 7. eléctrico
def electrico():
    s = Svg(1800, 1060)
    s.text(900, 36, "Diagrama de potencia y protecciones del carrito (diseño, hoja de armado rev. 3.8)", fs=20, bold=True, anchor="middle")
    R, G = "#C0392B", "#2B3138"
    s.caja(30, 440, 190, 110, "Batería de plomo-ácido 12 V · 24 Ah · 8.3 kg (BR-1224)", "proceso", fs=14, bold=True)
    s.caja(260, 470, 110, 50, "XT60", "proceso", fs=14, bold=True)
    s.flecha([(220, 495), (260, 495)], color=R)
    # ramas
    s.flecha([(370, 495), (430, 495), (430, 270), (470, 270)], color=R)
    s.flecha([(430, 495), (430, 790), (470, 790)], color=R)
    s.text(380, 470, "14 AWG", fs=12, anchor="start", color=R)
    # principal
    s.caja(470, 240, 160, 60, "Fusible 15 A\n(rama de motores)", "actuador", fs=14)
    s.caja(680, 240, 190, 60, "Relé T90 30 A\nCOM → NO", "control", fs=14, bold=True)
    s.flecha([(630, 270), (680, 270)], color=R)
    s.caja(930, 120, 230, 66, "Elevador de voltaje 400 W\n12 V → 18 V", "control", fs=14)
    s.caja(1220, 120, 260, 66, "2 × motor-rueda M0601\n(18 V, driver propio, RS485)", "actuador", fs=14)
    s.flecha([(870, 255), (900, 255), (900, 153), (930, 153)], color=R)
    s.flecha([(1160, 153), (1220, 153)], color="#E07B00")
    s.caja(930, 300, 230, 66, "Bornera J1 (12 V)\n3 × A4988 + 100 µF", "control", fs=14)
    s.caja(1220, 300, 260, 66, "3 × NEMA 17\n(elevador ×2 y empujador ×1)", "actuador", fs=14)
    s.flecha([(870, 285), (900, 285), (900, 333), (930, 333)], color=R)
    s.flecha([(1160, 333), (1220, 333)], color=R)
    # auxiliar
    s.caja(470, 760, 160, 60, "Fusible 10 A\n(rama auxiliar)", "actuador", fs=14)
    s.caja(680, 760, 150, 60, "Interruptor KCD1\n(encendido)", "control", fs=14)
    s.flecha([(630, 790), (680, 790)], color=R)
    s.caja(890, 740, 230, 100, "Reductor XL4005\n12 V → 5 V (ajustado a 5.0–5.1 V)", "control", fs=14)
    s.flecha([(830, 790), (890, 790)], color=R)
    s.caja(1190, 640, 250, 60, "ESP32 · MAX485 · servo MG90S · LEDs (5 V)", "entrada", fs=14)
    s.flecha([(1120, 770), (1155, 770), (1155, 670), (1190, 670)], color="#E07B00")
    s.caja(1190, 730, 250, 60, "Jetson Orin Nano Super\n(12 V por plug 5.5 × 2.5)", "entrada", fs=14)
    s.flecha([(1120, 790), (1190, 760)], color=R)
    s.caja(1190, 820, 250, 60, "Divisor 100 kΩ / 20 kΩ → GPIO 39\n(lectura de batería)", "entrada", fs=13)
    s.flecha([(1120, 810), (1155, 810), (1155, 850), (1190, 850)], color=R)
    # paro
    s.caja(930, 500, 250, 76, "Paro de emergencia LAY37\ncontacto normalmente cerrado", "alerta", fs=14, bold=True)
    s.flecha([(830, 760), (830, 705), (1055, 705), (1055, 576)], color=R, dash=False)
    s.flecha([(930, 538), (775, 538), (775, 300)], "VCC de la bobina del relé", lx=800, ly=528, color="#C0392B", dash=True, fs=12)
    # tierra
    s.caja(1500, 440, 260, 110, "Tierra común (negativo de la batería) unida en un solo punto: borne IN− del elevador de voltaje", "nota", fs=13, dash=True, titulo="GND")
    s.caja(60, 880, 760, 130, "Funcionamiento del paro: al pulsarlo se abre el contacto NC, la bobina del relé queda sin energía y el relé cae solo: se cortan a la vez los 18 V de las ruedas y los 12 V de los drivers de los motores a pasos. La rama auxiliar (Jetson y lógica) sigue viva. Hoy el paro no va a ningún pin del ESP32 (decisión abierta).", "nota", fs=13, dash=True, align="start")
    s.caja(1500, 640, 270, 240, "Leyenda · rojo: 12 V · naranja: 18 V y 5 V · línea punteada: señal de control del paro · calibres de la hoja: 14 AWG batería y rama de motores, 16–18 AWG hacia las ruedas, 22 AWG señal.", "nota", fs=12, dash=True, align="start")
    s.guardar(OUT / "electrico.svg")


# --------------------------------------------------------------------------------------------- 8. ESP32
def esp32():
    s = Svg(1800, 1080)
    s.text(900, 36, "Conexiones del ESP32 (mapa de pines de diseño, revisión 3.8)", fs=20, bold=True, anchor="middle")
    s.caja(740, 330, 320, 330, "ESP32 DevKitC\n38 pines\n3.3 V lógico\n\nalimentado a 5 V por el reductor XL4005", "control", fs=16, bold=True)

    def spoke(xs, ys, w, h, txt, tipo, xe, ye, etq, lado):
        s.caja(xs, ys, w, h + 22, txt + chr(10) + etq, tipo, fs=13)
        s.flecha([(xe, ye), (xs + (w if lado == "l" else 0), ys + (h + 22) / 2)])

    # izquierda (actuadores)
    spoke(60, 110, 360, 90, "A4988 #1 y #2 · elevador (2 × NEMA 17)\nSTEP y DIR compartidos", "actuador", 740, 380, "GPIO 25 STEP · GPIO 26 DIR", "l")
    spoke(60, 240, 360, 90, "A4988 #3 · empujador (NEMA 17)", "actuador", 740, 420, "GPIO 27 STEP · GPIO 14 DIR", "l")
    spoke(60, 370, 360, 80, "ENABLE de los 3 drivers\nresistencia de 10 kΩ a 3.3 V", "actuador", 740, 460, "GPIO 13", "l")
    spoke(60, 490, 360, 90, "Servo MG90S de la uña\n(5 V del XL4005)", "actuador", 740, 500, "GPIO 5 · PWM", "l")
    spoke(60, 610, 360, 80, "Tira WS2812 (opcional) con resistencia de 330 Ω", "actuador", 740, 540, "GPIO 2", "l")
    # derecha (RS485 e I2C)
    spoke(1380, 110, 360, 90, "MAX485 → bus RS485 (A, B)\n2 motores-rueda M0601 (ID 1 y 2)", "actuador", 1060, 380, "GPIO 17 DI · GPIO 4 DE+RE · GPIO 16 RO", "r")
    spoke(1380, 240, 360, 100, "Bus I²C: PCF8574 (0x20) · BNO055 (0x28) · VL53L0X ×4 (0x30 a 0x33; XSHUT por el PCF8574)", "entrada", 1060, 430, "GPIO 21 SDA · GPIO 22 SCL", "r")
    spoke(1380, 370, 360, 80, "Finales de carrera NC ×3 (elevador I, elevador D, home del empujador)", "entrada", 1060, 480, "GPIO 18 · 19 · 23", "r")
    spoke(1380, 480, 360, 80, "Barra QTR-8A (respaldo): salidas S3 a S7, a 3.3 V", "entrada", 1060, 530, "GPIO 32 · 33 · 34 · 35 · 36", "r")
    spoke(1380, 590, 360, 80, "Divisor de voltaje de la batería (100 kΩ y 20 kΩ)", "entrada", 1060, 580, "GPIO 39 · ADC", "r")
    # abajo USB
    s.caja(740, 840, 320, 90, "Jetson Orin Nano Super\nórdenes y lecturas por cable USB de datos", "control", fs=14)
    s.flecha([(900, 840), (900, 660)], "micro USB (serie)", lx=910, ly=770, fs=13)
    s.flecha([(900, 660), (900, 840)])
    s.caja(60, 790, 560, 220, "Notas de diseño · GPIO 34, 35, 36 y 39 solo leen. El ENABLE atado a 3.3 V deja los motores sueltos mientras el ESP32 arranca. Los finales de carrera NC con pull-up leen «presionado» si el cable se rompe y detienen el motor. Micropaso 1/16 (3200 pulsos por vuelta). Aún no existe el firmware: el programa se hará con PlatformIO.", "nota", fs=13, dash=True, align="start")
    s.caja(1160, 790, 580, 220, "Cableado de la placa perforada de 9 × 15 cm: 107 cables en 14 grupos (potencia de los drivers, lógica, configuración, STEP/DIR/EN, motores, 5 V, 3.3 V y GND, RS485, I²C, XSHUT, finales, QTR, batería, servo y LEDs); cada cable tiene color, calibre y largo en la tabla de cables de la hoja de armado.", "nota", fs=13, dash=True, align="start")
    s.guardar(OUT / "esp32.svg")


# --------------------------------------------------------------------------------------------- 9. tiempos
def tiempos():
    s = Svg(1900, 600)
    s.text(800, 34, "Secuencia temporal de una pieza en la celda (valores por defecto del código)", fs=20, bold=True, anchor="middle")
    x0, k = 250, 140  # px por segundo
    # eje
    for t in range(0, 10):
        x = x0 + t * k
        s.linea(x, 70, x, 520, "#E1E5EA", 1)
        s.text(x, 545, f"{t} s", fs=13, anchor="middle", color="#4A5563")

    def pulso(x1, x2, y, color, txt=None):
        s.rect(x0 + x1 * k, y, (x2 - x1) * k, 36, fill=color, stroke="#1B2A41", sw=1.5, rx=3)
        if txt:
            s.text(x0 + (x1 + x2) / 2 * k, y + 24, txt, fs=13, bold=True, anchor="middle")

    # FAIL
    s.text(20, 112, "FAIL · cámara", fs=14, bold=True)
    pulso(0, 2.5, 90, "#DDF2EF", "5 juicios (≈ 2.5 s)")
    pulso(2.5, 5.5, 90, "#EEF0F3", "espera 3 s")
    pulso(5.5, 6.5, 90, "#FBE6DD", "pistón")
    pulso(6.5, 8.5, 90, "#EEF0F3", "regreso 2 s")
    pulso(8.5, 9.0, 90, "#FBE6DD")
    s.text(20, 172, "FAIL · GPIO 8", fs=14, bold=True)
    s.linea(x0, 195, x0 + 5.5 * k, 195, "#1B2A41", 3)
    s.linea(x0 + 5.5 * k, 195, x0 + 5.5 * k, 165, "#1B2A41", 3)
    s.linea(x0 + 5.5 * k, 165, x0 + 6.5 * k, 165, "#C8501E", 5)
    s.linea(x0 + 6.5 * k, 165, x0 + 6.5 * k, 195, "#1B2A41", 3)
    s.linea(x0 + 6.5 * k, 195, x0 + 9.5 * k, 195, "#1B2A41", 3)
    s.text(x0 + 6 * k, 156, "1 s en alto", fs=12, anchor="middle", color="#C8501E", bold=True)
    s.text(20, 252, "FAIL · GPIO 9", fs=14, bold=True)
    s.linea(x0, 275, x0 + 8.5 * k, 275, "#1B2A41", 3)
    s.linea(x0 + 8.5 * k, 275, x0 + 8.5 * k, 245, "#1B2A41", 3)
    s.linea(x0 + 8.5 * k, 245, x0 + 9.0 * k, 245, "#C8501E", 5)
    s.linea(x0 + 9.0 * k, 245, x0 + 9.0 * k, 275, "#1B2A41", 3)
    s.linea(x0 + 9.0 * k, 275, x0 + 9.5 * k, 275, "#1B2A41", 3)
    s.text(x0 + 8.75 * k, 236, "0.5 s", fs=12, anchor="middle", color="#C8501E", bold=True)
    s.text(x0 + 4.5 * k, 320, "≈ 9 s por pieza FAIL", fs=14, bold=True)
    # PASS
    s.text(20, 372, "PASS · cámara", fs=14, bold=True)
    pulso(0, 2.5, 350, "#DDF2EF", "5 juicios (≈ 2.5 s)")
    pulso(2.5, 3.0, 350, "#FBE6DD")
    s.text(20, 432, "PASS · GPIO 9", fs=14, bold=True)
    s.linea(x0, 455, x0 + 2.5 * k, 455, "#1B2A41", 3)
    s.linea(x0 + 2.5 * k, 455, x0 + 2.5 * k, 425, "#1B2A41", 3)
    s.linea(x0 + 2.5 * k, 425, x0 + 3.0 * k, 425, "#C8501E", 5)
    s.linea(x0 + 3.0 * k, 425, x0 + 3.0 * k, 455, "#1B2A41", 3)
    s.linea(x0 + 3.0 * k, 455, x0 + 9.5 * k, 455, "#1B2A41", 3)
    s.text(x0 + 3.2 * k, 470, "≈ 3 s por pieza PASS", fs=14, bold=True)
    s.caja(250, 560, 1250, 30, "Los 2.5 s de estabilización suponen 5 análisis de 0.5 s sin contar el tiempo de cada análisis; todos los tiempos se calibran en la banda real (pendiente).", "nota", fs=12, dash=True)
    s.guardar(OUT / "tiempos.svg")


if __name__ == "__main__":
    general()
    carrito()
    arquitectura()
    layout()
    carrito_cotas()
    electrico()
    esp32()
    tiempos()
    print("svg listos")
