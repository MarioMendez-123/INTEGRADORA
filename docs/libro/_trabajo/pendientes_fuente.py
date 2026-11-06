# Fuente de la lista de pendientes. Edita PENDIENTES y vuelve a correr este archivo:
#   python docs/libro/_trabajo/pendientes_fuente.py
# Genera 99_pendientes.md, calcula en qué capítulos aparece cada código y avisa si hay códigos sin definir
# o definidos y sin usar.
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

PENDIENTES = {
    "P-01": ("Llegada e instalación de los motores ya decididos: los dos motores-rueda M0601 (FIT1042 y FIT1038) y los tres NEMA 17 de la torre. Modelo y documentación exactos de cada uno.", "David, Isaac"),
    "P-02": ("Peso total real del robot, reparto por llanta (hoy: máximo estimado de 40 kg y unos 17 kg por llanta motriz), altura del centro de gravedad y pendiente máxima del piso.", "David, Isaac"),
    "P-03": ("Diámetro real de las llantas motrices y de las rodajas.", "David, Isaac"),
    "P-04": ("Estado real del armado del carrito y si la hoja de armado (revisión 3.8) es el diseño que se construye; material, impresora y relleno de las piezas impresas.", "Isaac, David"),
    "P-05": ("Modelo y capacidad reales de la batería (la hoja de armado dice BR-1224, 12 V, 24 Ah).", "David"),
    "P-06": ("Paro de emergencia del robot: decisión abierta sobre si el ESP32 debe enterarse de que se pulsó (hoy solo corta el relé); modelo, cableado y ubicación definitivos.", "David, Mario"),
    "P-07": ("Modelo exacto de la placa ESP32 que se tiene en mano (la hoja supone un DevKitC de 38 pines).", "Mario"),
    "P-08": ("Protocolo de mensajes RS485 del motor-rueda M0601, según la hoja técnica del fabricante.", "Mario, David"),
    "P-09": ("Paso real (avance por vuelta) del husillo TR8: define todo el programa del elevador.", "David, Isaac"),
    "P-10": ("Sensores definitivos del robot: si se comprará un lidar y si los VL53L0X (4), el BNO055 y la QTR-8A quedan confirmados.", "Mario, David"),
    "P-11": ("Tamaño impreso, colocación y distancia de lectura de los marcadores ArUco.", "Mario, Isaac"),
    "P-12": ("Detalles físicos del cableado de la celda por GPIO: pines reales, tipo de placa de relevadores (activa en alto o en bajo, aislamiento, diodo, alimentación) y marca y modelo del LOGO.", "Uriel, David, Pedro"),
    "P-13": ("Marca, modelo y tipo (PNP o NPN) de los dos infrarrojos de la celda y sus bornes.", "Uriel, David"),
    "P-14": ("Pistón de scrap: tipo, electroválvula, voltaje de la bobina, presión y tiempos reales de pulso y regreso.", "Pedro"),
    "P-15": ("Banda: motor, velocidad real, altura real de la cinta y si corre sola o la arranca el LOGO.", "Isaac, David, Pedro"),
    "P-16": ("Paro de emergencia físico de la celda y arranque y paro físicos independientes de la pantalla.", "David, Pedro"),
    "P-17": ("Alcance de la HMI de la celda: pantalla propia, quién la opera, qué muestra.", "Emmanuel"),
    "P-18": ("Pruebas de la Raspberry Pi 4 en hardware real: sistema, RAM, versión de OpenCV con el modelo ONNX, CPU y cámara.", "Mario, Uriel"),
    "P-19": ("Alimentación del Jetson dentro del robot y cómo se evita el doble camino de 5 V hacia el ESP32 (convertidor y USB).", "David"),
    "P-20": ("Si el robot (o el Jetson) tendrá micrófono y bocina propios.", "Mario"),
    "P-21": ("Dimensiones y material oficiales de los fixtures y quién los diseña y fabrica.", "Isaac"),
    "P-22": ("Mediciones y umbrales pendientes: FPS del Jetson con buena luz, cámara en su lugar y modo de energía anotado; umbrales numéricos de los criterios de aceptación; pruebas de los tres estados de cobertura.", "Mario"),
    "P-23": ("Contrato de mensajes entre el Jetson y el ESP32: mensajes, latido, tiempo de frenado y qué hace el ESP32 al pulsarse el paro.", "Mario"),
    "P-24": ("Criterio real de PASS/FAIL por defectos de la pieza (hoy solo reconoce piezas registradas).", "Mario"),
    "P-25": ("Arranque automático de la celda al encender la Pi (systemd u otro mecanismo).", "Mario, Uriel"),
    "P-26": ("Diagnósticos abiertos del Jetson: causa de los cortes de SSH, de `snap-confine`, propiedad de `libcusparseLt` y SSH sin contraseña.", "Mario"),
    "P-27": ("Pruebas de voz con el micrófono, la voz y el ruido reales del lugar (verificaciones V5 a V13), y decisión sobre instalar Whisper.", "Mario"),
    "P-28": ("Confirmar que el secreto de la integración de música, que se pegó una vez en un chat, ya fue rotado.", "Mario"),
    "P-29": ("Pasos manuales de Cloudflare: alta del dominio, servidores de nombres, SSL Full (strict), HSTS, encabezados, Bot Fight, límite de peticiones, DMARC y DKIM.", "Mario"),
    "P-30": ("Ejecutar la lista del laboratorio en el router y la PC (sin reenvío de puertos, sin UPnP, firewall solo privado).", "Mario"),
    "P-31": ("Medir el video de presentación y la sincronía en el hardware y la red del escenario, y el reconocimiento de «Lumina» con el micrófono real.", "Mario"),
    "P-32": ("Aceptación formal de la ADR 0012 y publicación (`push`) de la rama `jetson-agente`.", "Mario"),
}


def capitulos_de_cada_codigo():
    usados = {}
    for md in sorted(RAIZ.glob("[0-9][0-9]_*.md")):
        n = int(md.name[:2])
        if n >= 98:
            continue
        etiqueta = {0: "Prólogo", 90: "Apéndice A", 91: "Apéndice B"}.get(n, str(n))
        for code in set(re.findall(r"P-\d{2}", md.read_text(encoding="utf-8"))):
            usados.setdefault(code, []).append((n, etiqueta))
    return {k: ", ".join(e for _, e in sorted(v)) for k, v in usados.items()}


def main():
    usados = capitulos_de_cada_codigo()
    sin_definir = sorted(set(usados) - set(PENDIENTES))
    sin_usar = sorted(set(PENDIENTES) - set(usados))
    filas = ["# Pendientes de confirmar con el equipo", "",
             "*Todo lo que el libro dejó marcado como PENDIENTE (P-01, P-02, …) está aquí, y solo aquí. Cada línea dice qué falta, con quién se confirma y en qué capítulos aparece. Mientras no se confirme, el libro lo trata como «no se sabe».*", "",
             "| Código | Qué falta | Con quién | Capítulos |", "|---|---|---|---|"]
    for code in sorted(PENDIENTES):
        texto, quien = PENDIENTES[code]
        filas.append(f"| **{code}** | {texto} | {quien} | {usados.get(code, '—')} |")
    (RAIZ / "99_pendientes.md").write_text("\n".join(filas) + "\n", encoding="utf-8")
    print(len(PENDIENTES), "pendientes escritos")
    if sin_definir:
        print("USADOS EN EL TEXTO PERO SIN DEFINIR:", sin_definir)
    if sin_usar:
        print("DEFINIDOS PERO SIN USAR EN EL TEXTO:", sin_usar)


if __name__ == "__main__":
    main()
