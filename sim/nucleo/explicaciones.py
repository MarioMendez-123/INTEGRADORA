"""Qué hace cada grupo de cables, en palabras. Sale de la guía de armado rev. 3.21 y del comportamiento del simulador."""
from __future__ import annotations

# clave = empieza el nombre del grupo en placa.json / arnés. (que: qué hace, falla: qué pasa si lo cortas)
GRUPOS = [
    ("Potencia de los drivers", "Llevan los 12 V del relé a los 3 drivers A4988 (los que mueven los motores a pasos del elevador y del empujador). Los capacitores de 100 µF absorben los picos de corriente.",
     "Los motores a pasos se quedan sin fuerza. Los M0601 de las ruedas no se afectan: van por otro camino."),
    ("Lógica de los drivers", "Dan 3.3 V y tierra a la parte lógica de los A4988 para que entiendan las señales del ESP32.", "Los drivers dejan de responder aunque tengan potencia."),
    ("Configuración de cada driver", "Puentes pequeños que fijan cómo da pasos cada A4988 (micropasos) y lo mantienen despierto (RESET con SLEEP).", "El driver pierde su configuración o se queda dormido."),
    ("Señales STEP", "El ESP32 manda un pulso por STEP para cada paso, DIR dice hacia dónde y ENABLE enciende o apaga los drivers.", "El motor a pasos no se mueve, o gira al lado equivocado."),
    ("Bobinas de los motores", "Cada driver manda corriente a las 4 puntas de su motor a pasos a través de una bornera.", "Ese motor pierde una fase: vibra o no gira."),
    ("Alimentación de 5 V", "Reparten los 5 V del XL4005 al ESP32, al MAX485 y al servo. El servo va aparte del ESP32 para que su consumo no reinicie la placa.", "Los módulos que dependan de ese cable se apagan; si es el del ESP32, todo el programa se detiene."),
    ("3.3 V y GND de los módulos", "Dan 3.3 V y tierra a los sensores (BNO055, VL53L0X) y al lado de baja tensión del convertidor de nivel.", "Ese sensor deja de contestar en el bus I²C."),
    ("RS485", "Es el camino de las órdenes a los motores. DI y DE son del ESP32 al MAX485; RO regresa por el convertidor de nivel (5 V a 3.3 V). A y B son el par trenzado que va a los dos M0601.",
     "El ESP32 manda tramas pero los motores no las reciben: las ruedas quedan sueltas. Si cruzas A con B, los bits llegan al revés y tampoco entienden."),
    ("Bus I", "SDA y SCL: dos cables que comparten el BNO055 (rumbo) y los 4 VL53L0X (distancia). Cada sensor responde a su propia dirección.", "Todos los sensores del bus dejan de contestar: sin rumbo ni distancias no se puede navegar."),
    ("XSHUT", "Cada VL53L0X de obstáculos tiene un cable XSHUT para apagarlo. Así el ESP32 los enciende uno por uno y le da a cada uno su dirección (todos nacen en 0x29).", "Dos sensores quedan en la misma dirección y chocan en el bus."),
    ("Finales de carrera", "Interruptores que avisan cuando el elevador o el carro llegan a su tope. Son normalmente cerrados (NC): si el cable se rompe, el ESP32 lo lee como «presionado» y se detiene.", "El ESP32 cree que el tope está presionado y no mueve ese eje."),
    ("Divisor para medir la batería", "Dos resistencias (100 kΩ y 20 kΩ) bajan los 12 V de la batería a ~2 V para que el GPIO 39 del ESP32 los pueda medir sin quemarse.", "El ESP32 no sabe cuánta batería queda."),
    ("Servo", "Mueve la uña que jala el fixture. Lleva 5 V del XL4005 y una señal del GPIO 5.", "La uña no se mueve."),
    ("Lectura del paro", "Del VCC del relé (después del paro) sale un hilo a un divisor 100 kΩ / 20 kΩ y al GPIO 34. Suelto da ~2 V; presionado da 0 V. Así el ESP32 se entera del paro.", "El ESP32 lee 0 V y cree que el paro está presionado (falla segura). Si conectas el relé directo al GPIO 34, 12 V queman el ESP32."),
    ("Final de carrera superior", "El tope de arriba del elevador. Lleva una resistencia pull-up de 10 kΩ porque el GPIO 35 no tiene una interna.", "El GPIO 35 queda flotando y el elevador se detiene o sube de más al azar."),
    # arnés de potencia y sensores (agregado por el simulador con los textos de la guía)
    ("Potencia", "Batería a los dos fusibles (15 A para motores, 5 A para lógica) y tierra común. El fusible va lo más cerca posible de la batería: si algo hace corto, se quema el fusible y no el cable.", "Sin batería, nada tiene energía."),
    ("Rama auxiliar", "Del fusible de 5 A pasa por el interruptor KCD1 y alimenta al XL4005 (5 V), a la Jetson y a la lectura del paro. El KCD1 enciende toda la lógica.", "El ESP32 y la Jetson se apagan."),
    ("Paro y relé", "El paro (contacto normalmente cerrado) alimenta la bobina del relé. Con el paro suelto el relé cierra y pasa la potencia a los motores; al apretarlo, el relé se suelta y corta los motores aunque el programa esté colgado.", "El relé nunca cierra: las ruedas no tienen potencia (también es lo que pasaría con un cable roto: falla segura)."),
    ("Rama de motores", "Del relé a la entrada del elevador de voltaje, que sube los 12 V a 18 V para los M0601.", "Las ruedas se quedan sin 18 V."),
    ("Motores M0601", "18 V y tierra a los dos motores-rueda, y el par A/B del RS485 que los comunica.", "Ese motor no gira o no recibe órdenes."),
    ("Sensores VL53L0X", "3.3 V, tierra, SDA y SCL de cada sensor de distancia, y el cable XSHUT de los tres de obstáculos.", "Ese sensor no contesta: el carrito pierde esa distancia."),
    ("Capacitor del servo", "Capacitor de 100 µF junto a J11: da la corriente de los arranques del MG90S para que no bajen los 5 V del ESP32.", "En esta simulación no cambia nada: no se simulan los picos de corriente ni el servo. En el carrito real, el ESP32 podría reiniciarse cuando arranque el servo."),
    ("Voltímetro", "Muestra el voltaje de la batería a la vista. Se conecta después del KCD1 para que no gaste batería con el carrito apagado.", "Solo se apaga la pantalla: el carrito sigue funcionando."),
    ("Capacitor de 18 V", "Capacitor de 1000 µF / 35 V a la salida del elevador: absorbe la energía que regresan los M0601 al frenar, porque el elevador no puede devolverla a la batería.", "En esta simulación no cambia nada: el frenado no se modela como voltaje. En el carrito real, el riel de 18 V podría subir hacia su máximo de 24 V."),
    ("Tus cables", "Un cable que agregaste tú. El simulador lo conecta de verdad: si une cosas que no deben unirse, verás cortos, fusibles quemados o piezas dañadas.", "Quitarlo regresa el circuito a como estaba."),
]

PINES = {
    "E.34": "GPIO 34 del ESP32: solo entrada, mide el paro.", "E.39": "GPIO 39: solo entrada, mide la batería.", "E.35": "GPIO 35: solo entrada, final de carrera superior.",
    "E.4": "GPIO 4: controla DE/RE del MAX485 (1 = hablar, 0 = escuchar).", "E.17": "GPIO 17 (TX2): sale hacia DI del MAX485.", "E.16": "GPIO 16 (RX2): llega desde RO del MAX485 por el convertidor de nivel.",
    "E.21": "GPIO 21: SDA del bus I²C.", "E.22": "GPIO 22: SCL del bus I²C.", "E.32": "GPIO 32: XSHUT del VL53L0X frontal.", "E.33": "GPIO 33: XSHUT del VL53L0X izquierdo.", "E.15": "GPIO 15: XSHUT del VL53L0X derecho.",
}


def explicacion(grupo: str) -> dict:
    for clave, que, falla in GRUPOS:
        if grupo.startswith(clave):
            return {"que": que, "falla": falla}
    return {"que": "", "falla": ""}
