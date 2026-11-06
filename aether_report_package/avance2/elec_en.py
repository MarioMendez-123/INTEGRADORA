"""Genera los esquemas eléctricos de las diapositivas: el de potencia en español e inglés y el de la celda en inglés.

Uso, desde la raíz (necesita schemdraw): python aether_report_package/avance2/elec_en.py
Traduce las etiquetas sobre una copia temporal; los esquemas originales (elec_*.py) siguen en español.
"""
import pathlib
import runpy
import sys

A = pathlib.Path(__file__).resolve().parent
OUT = A.parents[1] / "dashboard" / "assets" / "slides"
D = {
    "Elevador de voltaje 400 W": "Boost converter 400 W", "perilla CC": "CC knob", "Reductor XL4005": "Buck XL4005", "ajustado a 5.0–5.1 V": "set to 5.0–5.1 V",
    "lectura de batería": "battery reading", "lectura del paro": "stop reading", "voltímetro": "voltmeter", "en J11": "at J11", "12 V motores": "12 V motors", "micropaso": "microstep",
    "Al pulsar S1 se abre el contacto, la bobina pierde energía y K1 cae:": "Pressing S1 opens the contact, the coil loses power and K1 drops:",
    "se cortan a la vez las ruedas (18 V) y los drivers de pasos (12 V);": "wheels (18 V) and stepper drivers (12 V) are cut together;",
    "la rama auxiliar (Jetson y lógica) queda viva.": "the auxiliary branch (Jetson and logic) stays on.",
    "Batería plomo-ácido": "Lead-acid battery", "uno por driver": "one per driver",
    "Cada motor-rueda trae su driver y su encoder; las órdenes llegan por RS485.": "Each wheel motor has its own driver and encoder; commands arrive over RS485.",
    "Circuito de mando de K1 (paro de emergencia)": "K1 control circuit (emergency stop)", "Convertidor de nivel": "Level shifter", "ESP32 DevKitC y módulo MAX485": "ESP32 DevKitC and MAX485 module",
    "K1 · bobina": "K1 · coil", "K1 · relevador T90 30 A": "K1 · T90 30 A relay", "contacto COM": "contact COM", "izq.": "left", "M0601 der.": "M0601 right",
    "elevador ×2,": "lift ×2,", "empujador ×1": "pusher ×1", "S1 · paro LAY37 (contacto NC)": "S1 · LAY37 stop (NC contact)", "S2 · KCD1 (encendido)": "S2 · KCD1 (power)", "Servo MG90S (uña)": "Servo MG90S (claw)",
    "fuente aparte de la Pi": "separate from the Pi supply", "AZUL (0 V)": "BLUE (0 V)", "CAFÉ (+24 V)": "BROWN (+24 V)", "Cámara USB": "USB camera", "Electroválvula 24 V": "24 V solenoid valve", "pistón de scrap": "scrap piston",
    "Ethernet · Modbus TCP: DISEÑO del reporte HMI (aún no está en el código)": "Ethernet · Modbus TCP: HMI report design (not in the code yet)", "Fuente 24 V": "24 V supply", "del tablero": "from the panel", "GPIO8 → pistón": "GPIO8 → piston", "GPIO9 → avance de banda": "GPIO9 → belt advance",
    "Infrarrojo de presencia (24 V)": "IR presence sensor (24 V)", "PLC de la celda": "cell PLC", "Módulo de 2 relevadores": "2-relay module", "bobinas de 5 V": "5 V coils", "Motor de la banda": "Belt motor", "tensión por confirmar": "voltage to confirm", "NEGRO (salida)": "BLACK (output)", "pulso de avance": "advance pulse", "Raspberry Pi 4 (celda)": "Raspberry Pi 4 (cell)",
    "Ninguna señal de 24 V llega a un GPIO de la Raspberry Pi: los relevadores aíslan la lógica de 3.3 V de la de 24 V.": "No 24 V signal reaches a Raspberry Pi GPIO: the relays isolate the 3.3 V logic from the 24 V side.",
}


def correr(script, salida):
    sys.argv = [str(script), str(salida)]
    runpy.run_path(str(script), run_name="__main__")


correr(A / "elec_potencia.py", OUT / "elec_potencia_es.png")
for nombre, salida in (("elec_potencia.py", "elec_potencia_en.png"), ("elec_celda.py", "elec_celda_en.png")):
    s = (A / nombre).read_text(encoding="utf8")
    for k in sorted(D, key=len, reverse=True):
        s = s.replace(k, D[k])
    tmp = OUT / ("_" + nombre)
    tmp.write_text(s, encoding="utf8")
    try:
        correr(tmp, OUT / salida)
    finally:
        tmp.unlink()
    print("ok", salida)
