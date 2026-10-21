"""Rearma el dictado en escalera y lo deja listo para ElevenLabs.

Solo texto. No llama a la red.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "AETHER_DICTADO.txt"

INTRO = """
Aether es el sistema que mira una planta, decide, y recuerda sin afirmar lo que no vio.

Empieza por el problema, porque si no se entiende el problema, la tecnología no tiene por qué. Una cámara puede detectar un objeto. Detectar no significa saber qué es. Saber qué es no significa saber dónde está. Y saber dónde está no significa que ese número se pueda declarar como inventario. Si esa escalera se rompe, la planta compra una mentira. Aether existe para subirla completa. Primero el ojo. Después la memoria. Después la decisión física en la línea. Después la voz que puede decirlo.

Este dictado recorre el sistema completo, al ocho de octubre de dos mil veintiséis. Dice lo que el repositorio tiene de verdad. Si algo no está hecho, se dice en el peldaño que le toca.

Lo construye un equipo de seis personas, en Chihuahua, México. El tiempo real es de unos cuatro meses, unas dos horas al día, unas doscientas cuarenta horas. No es una demo para tirar al acabar el semestre. El criterio interno es un prototipo que se pueda defender frente a alguien de planta.

Hay dos piezas, y las dos son obligatorias, porque una sin la otra no cierra el proceso.

La primera se llama Aether Inventory. Es la unidad móvil. Recorre, ve, cuenta e identifica producto, y deja un inventario declarado, con historial. Existe para poder decir, con honestidad, el robot revisó el anaquel y encontró tantas unidades de tal producto.

La segunda es la línea de manufactura. Existe porque ver no basta. Hay que decidir, sobre hardware real, si la pieza sigue o si sale. Una banda transportadora, con fixtures que posicionan cada pieza automotriz. Una cámara de línea decide si pasa o si falla. Si falla, un pistón expulsa la pieza. Eso es scrap. Si pasa, no hay golpe. Aether Inventory recoge la pieza aceptada, la transporta, y registra el proceso.

El brazo Kuka KR seis y el brazo UR cinco salieron del alcance el dieciséis de septiembre de dos mil veintiséis. El aprendizaje por demostración también salió. El pistón no aprende. Es un pulso fijo, programado en el controlador. Se dice ahora, al principio, para que nadie confunda más adelante un pulso con inteligencia.

Lo que se vende es el resultado de la inspección. No se vende el nombre del modelo ni el nombre del protocolo.

La narración sube un peldaño cada vez, y cada peldaño usa el anterior. Primero, por qué juntar herramientas no alcanza. Después, el ojo. Después, la memoria del inventario. Después, el dataset con el que el ojo aprende las piezas de esta planta. Después, la línea que actúa, primero como idea y simulación, y luego como cable. Después, la voz, que es Lumina. Después, las pantallas. Después, cómo se enciende y cómo se llama cada servicio. Al final, qué falta, qué archivo se toca, y qué sí se puede afirmar.
""".strip()

# Índice 0 es la parte uno original. El cuerpo se reemplaza por INTRO.
# El resto se reordena. La frase puente abre el peldaño y dice por qué sigue.
PASOS = [
    ("Peldaño uno. Por qué no basta juntar tecnologías.",
     "Ya se dijo qué es Aether y por qué las dos piezas van juntas. El siguiente peldaño explica por qué eso no se resuelve comprando las mismas herramientas que usa cualquier integrador.",
     1),
    ("Peldaño dos. El ojo, y con qué mira.",
     "El contrato ya está dicho. Ahora sube el ojo, porque sin una observación cruda no hay nada honesto que declarar.",
     8),
    ("Peldaño tres. El ojo, cuadro por cuadro.",
     "Las herramientas del ojo ya están nombradas. Este peldaño baja al cuadro. Qué se busca primero, qué campo sale, y qué todavía no es inventario.",
     15),
    ("Peldaño cuatro. La memoria. Qué guarda el inventario.",
     "El ojo ya entregó una observación. Este peldaño la convierte en memoria. Una observación no se vende. Se agrega, y solo entonces se declara.",
     5),
    ("Peldaño cinco. Cómo varias observaciones se vuelven una fila.",
     "La tabla ya está dicha. Ahora la regla exacta. Qué texto se vuelve la llave, qué clase gana, y por qué una ausencia no borra el producto.",
     16),
    ("Peldaño seis. El dataset. Cómo el ojo aprende estas piezas.",
     "La memoria ya sabe agrupar lo que el modelo general ve. Este peldaño enseña al ojo los nombres de esta planta, para que una pieza registrada no se confunda con una silla o con una persona.",
     6),
    ("Peldaño siete. La línea. De la idea a la pantalla.",
     "El ojo ya puede nombrar una pieza. Este peldaño es la decisión física. La banda, el pistón, y la pantalla que hoy todavía simula esa decisión.",
     7),
    ("Peldaño ocho. El letrero de la cámara, el entrenamiento, y el reloj simulado.",
     "La línea ya está contada como arquitectura. Ahora se dice qué dibuja la cámara hoy, cómo se entrena el peso, y cómo el simulador finge el reloj sin tocar el pistón.",
     17),
    ("Peldaño nueve. La celda de verdad. Cable por cable.",
     "La simulación ya se oyó. Este peldaño es el mismo ciclo, pero en cobre y en aire. Qué cable va a qué equipo, y en qué orden vive y muere una pieza.",
     24),
    ("Peldaño diez. La voz. Por qué Lumina dicta.",
     "La planta ya puede ver, recordar y decidir. Este peldaño es la voz. Lumina existe para decir ese resultado, no para inventar una fábrica que no está.",
     2),
    ("Peldaño once. Lo que Lumina contesta de memoria.",
     "Ya se dijo cómo sale el audio. Ahora las frases que no pasan por el modelo, porque en una presentación no se puede esperar a que invente.",
     3),
    ("Peldaño doce. Lo que Lumina hace en la computadora.",
     "Ya se sabe qué contesta. Este peldaño es lo que hace con las manos de la máquina. Música, archivos, y lo que pide un sí antes de tocar.",
     4),
    ("Peldaño trece. Las frases exactas.",
     "Las acciones ya están. Ahora las palabras que las disparan, para que quien oiga esto pueda hablarle sin adivinar.",
     23),
    ("Peldaño catorce. Las pantallas y el video.",
     "La voz ya tiene cuerpo en la página del robot. Este peldaño recorre el resto de las pantallas, en el orden en que un operador las encontraría.",
     18),
    ("Peldaño quince. Lo que la laptop ya hace junta.",
     "Cada pantalla ya se nombró. Este peldaño las junta. Qué recorre de verdad, hoy, de punta a punta, en esta máquina.",
     11),
    ("Peldaño dieciséis. Las decisiones, y qué tan ciertas son en el código.",
     "Ya se vio qué corre. Este peldaño vuelve a las decisiones de arquitectura y dice, una por una, si el código las cumple o solo las promete.",
     10),
    ("Peldaño diecisiete. Cómo se enciende.",
     "Las decisiones ya están medidas contra el código. Ahora la escalera práctica. En qué orden se prenden los procesos para que todo lo anterior exista en la laptop.",
     20),
    ("Peldaño dieciocho. Los servicios, en corto.",
     "El servidor ya está prendido. Este peldaño enumera lo que responde, antes del detalle para reconstruirlo.",
     9),
    ("Peldaño diecinueve. Los servicios, dichos para reconstruirlos.",
     "La lista corta ya se oyó. Ahora cada ruta, con su método y su cuerpo, para poder llamarla sin abrir el código.",
     21),
    ("Peldaño veinte. Variables, archivos secretos, y la llamada.",
     "Las rutas ya se pueden llamar. Este peldaño dice qué vive fuera del código, qué no se sube, y cómo se arma el texto de una llamada.",
     22),
    ("Peldaño veintiuno. Las carpetas.",
     "Ya se puede encender y llamar. Este peldaño pone cada capacidad en su carpeta, para saber dónde vive.",
     13),
    ("Peldaño veintidós. Qué archivo se cambia para cambiar cada cosa.",
     "Las carpetas ya están. Este peldaño es el mapa de edición. Un comportamiento, un archivo.",
     25),
    ("Peldaño veintitrés. Lo que falta hacer.",
     "Ya se sabe qué tocar de lo que existe. Este peldaño es lo que todavía no tiene archivo, o lo bloquea el hardware.",
     12),
    ("Peldaño veinticuatro. Cómo no mentir con este proyecto.",
     "Lo que falta ya se dijo. Este peldaño fija las frases que no se pueden vender, aunque la demo se vea completa.",
     14),
    ("Peldaño veinticinco. Qué se revisó, y qué no se lee línea por línea.",
     "La regla de honestidad ya está. Este peldaño cierra el alcance del dictado. Qué carpetas se recorrieron, y qué no se pronuncia palabra por palabra.",
     19),
    ("Peldaño veintiséis. Qué ya se puede afirmar, y qué hay que medir.",
     "Último peldaño. Con todo lo anterior, qué puede repetir una persona, y qué nadie debe afirmar porque el repositorio no lo respalda.",
     26),
]


def cuerpos(texto: str) -> list[str]:
    trozos = texto.split("\n\nParte ")
    salida = []
    primero = trozos[0].split("\n\n", 1)[1]
    salida.append(primero.strip())
    for trozo in trozos[1:]:
        salida.append(trozo.split("\n\n", 1)[1].strip())
    if len(salida) != 27:
        raise SystemExit(f"se esperaban 27 partes, hay {len(salida)}")
    return salida


def limpiar_cierre_de_alcance(cuerpo: str) -> str:
    corte = "El límite de aquel corte era ese."
    if corte in cuerpo:
        cuerpo = cuerpo.split(corte)[0].rstrip()
    nota = (
        "No hay un módulo llamado Packet, ni un módulo de amplificación de señal. "
        "Eso se dice aquí, al cierre, para no tapar el principio. "
        "Lo más cercano a un paquete es el informe académico. "
        "Lo más cercano a subir el volumen es la voz, cuando Lumina sube o baja el audio de Windows o de Spotify."
    )
    return cuerpo + "\n\n" + nota


def main() -> None:
    partes = cuerpos(SRC.read_text(encoding="utf-8"))
    bloques = [INTRO]
    for titulo, puente, indice in PASOS:
        cuerpo = partes[indice]
        if indice == 19:
            cuerpo = limpiar_cierre_de_alcance(cuerpo)
        bloques.append(f"{titulo}\n\n{puente}\n\n{cuerpo}")
    texto = "\n\n".join(bloques).strip() + "\n"
    SRC.write_text(texto, encoding="utf-8")
    print(f"caracteres {len(texto)}")


if __name__ == "__main__":
    main()
