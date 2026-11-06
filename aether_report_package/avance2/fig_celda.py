from svglib import Svg


def build(ruta):
    s = Svg(1240, 1830)
    cx, bw = 470, 340
    x0 = cx - bw / 2

    def c(y, h, texto, tipo="proceso", **kw):
        s.caja(x0, y, bw, h, texto, tipo, **kw)

    c(40, 54, "INICIO · celda energizada, cámara abierta y modelo ONNX cargado", "inicio", bold=True, rx=27)
    c(130, 58, "El operador inicia sesión en la HMI y pulsa ARRANQUE (pide confirmación)", "proceso")
    c(222, 52, "La cámara USB captura un cuadro cada 0.5 s", "entrada")
    c(308, 58, "YOLO (modelo ONNX en la Raspberry Pi 4) detecta objetos; umbral interno de confianza 0.25", "control")
    c(400, 70, "Juicio del cuadro: PASS si hay una pieza registrada con confianza ≥ 0.50 y sin ambigüedad; FAIL si no lo es; SIN_PIEZA si no hay nada", "control", fs=13)
    for a, b in [(94, 130), (188, 222), (274, 308), (366, 400)]:
        s.flecha([(cx, a), (cx, b)])
    s.flecha([(cx, 470), (cx, 505)])

    # ¿5 juicios iguales?
    s.rombo(cx, 560, 330, 110, "¿5 juicios iguales seguidos?")
    s.flecha([(305, 560), (170, 560), (170, 248), (x0, 248)], "No", lx=178, ly=548)
    s.flecha([(cx, 615), (cx, 650)], "Sí", lx=cx + 8, ly=640)

    # ¿SIN_PIEZA?
    s.rombo(cx, 705, 330, 110, "¿El juicio es SIN_PIEZA?")
    s.caja(700, 680, 280, 50, "Rearmar: permitir una pieza nueva", "proceso", fs=13)
    s.flecha([(635, 705), (700, 705)], "Sí", lx=648, ly=694)
    s.flecha([(840, 680), (840, 248), (x0 + bw, 248)])
    s.flecha([(cx, 760), (cx, 795)], "No", lx=cx + 8, ly=785)

    # ¿FAIL?
    s.rombo(cx, 850, 330, 110, "¿El juicio es FAIL?")
    # PASS (izquierda)
    s.flecha([(305, 850), (230, 850), (230, 925)], "No (PASS)", lx=236, ly=838)
    s.caja(100, 925, 260, 118, "GPIO 9: pulso de 0.5 s → relevador → entrada I4 del LOGO!; la banda avanza (el LOGO! ignora su infrarrojo 5 s)", "actuador", fs=13)
    s.flecha([(230, 1043), (230, 1090)])
    s.caja(100, 1090, 260, 70, "Anotar acción: pieza_aceptada (la pieza sigue hacia el carrito)", "salida", fs=13)
    # FAIL (derecha)
    s.flecha([(635, 850), (880, 850), (880, 925)], "Sí (FAIL)", lx=760, ly=838)
    fx, fw = 740, 280
    s.caja(fx, 925, fw, 52, "Esperar 3 s: la pieza llega frente al pistón", "proceso", fs=13)
    s.flecha([(fx + fw / 2, 977), (fx + fw / 2, 1010)])
    s.caja(fx, 1010, fw, 92, "GPIO 8 en alto 1 s: relevador → electroválvula de 24 V → el pistón expulsa la pieza", "actuador", fs=13)
    s.flecha([(fx + fw / 2, 1102), (fx + fw / 2, 1135)])
    s.caja(fx, 1135, fw, 66, "GPIO 8 en bajo; esperar 2 s a que el pistón regrese", "proceso", fs=13)
    s.flecha([(fx + fw / 2, 1201), (fx + fw / 2, 1234)])
    s.caja(fx, 1234, fw, 82, "GPIO 9: pulso de 0.5 s → I4 del LOGO!; la banda avanza", "actuador", fs=13)
    s.flecha([(fx + fw / 2, 1316), (fx + fw / 2, 1349)])
    s.caja(fx, 1349, fw, 56, "Anotar acción: scrap_expulsado", "salida", fs=13)

    # unión
    s.flecha([(230, 1160), (230, 1455), (x0, 1455)])
    s.flecha([(fx + fw / 2, 1405), (fx + fw / 2, 1455), (x0 + bw, 1455)])
    c(1415, 80, "Registrar el evento (pieza, juicio, acción, hora) con event_id; actualizar contadores y alarmas de la HMI; enviar POST /line/cell/events a la laptop", "salida", fs=13)
    s.flecha([(cx, 1495), (cx, 1535)])
    s.rombo(cx, 1590, 330, 110, "¿El operador pulsó PARO?")
    s.flecha([(305, 1590), (40, 1590), (40, 248), (x0, 248)], "No", lx=48, ly=1578)
    s.flecha([(cx, 1645), (cx, 1690)], "Sí", lx=cx + 8, ly=1678)
    c(1690, 54, "FIN · set_running(False) aborta el ciclo y apaga GPIO 8 y GPIO 9", "inicio", bold=True, rx=27, fs=13)

    # notas
    s.caja(700, 1480, 480, 112, "Sin la librería gpiod o sin relevador, nada se mueve: PASS queda como pulso_no_enviado y FAIL como fallo_actuacion; la HMI levanta la alarma de prioridad 1 «FAIL sin expulsar».", "alerta", fs=13, dash=True, titulo="Salvaguarda")
    s.caja(700, 1612, 480, 150, "Diseño del reporte HMI (Unidad III): la Pi escribe Vision_Resultado y Vision_Secuencia por Modbus TCP, espera el acuse Plc_AckSecuencia del LOGO! y solo entonces pulsa el avance. No forma parte del código del repositorio al 24 de octubre de 2026.", "nota", fs=13, dash=True, titulo="Nota de diseño (por confirmar)")
    s.guardar(ruta)


if __name__ == "__main__":
    import sys
    build(sys.argv[1])
