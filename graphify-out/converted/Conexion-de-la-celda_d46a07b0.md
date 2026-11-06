<!-- converted from Conexion-de-la-celda.docx -->

Hoja de conexión
Raspberry, cámara, dos infrarrojos, PLC y la pantalla que ya existe.
En una frase
La cámara se enchufa al Raspberry. Ese Raspberry es el ojo de la celda.
Los dos infrarrojos y el pistón se cablean al PLC. El PLC mueve la banda y el pistón.
La laptop no recibe sensores. Sigue mostrando la misma pantalla de la celda.
Hoy la cámara solo dice si hay una pieza o no. Eso no es una pieza mala. El pistón no se dispara desde la cámara hasta que exista el criterio de inspección.
Dónde va cada cosa, sobre la banda
De izquierda a derecha: entra la pieza, la ve el primer infrarrojo, la mira la cámara, el pistón puede empujarla al cajón, y el segundo infrarrojo dice si siguió en la banda.


Cómo van los cables
El Raspberry tiene un solo puerto de red. La laptop, el Raspberry y el PLC entran los tres al switch. No se enchufan una máquina a la otra.


Cómo se conecta un infrarrojo
Son sensores de 24 V, de tres hilos. El color se confirma en la etiqueta del que se compró. Primero se prueba el LED, con el Raspberry apagado.


| Si la etiqueta dice PNP y la entrada del PLC no prende, no se arregla en el programa. Se revisa que el sensor y la entrada sean del mismo tipo. Un módulo infrarrojo de 5 V, de los de prototipo, no se atornilla a una entrada de 24 V. |
| --- |

Qué pasa cuando llega una pieza
El PLC lleva el reloj. El Raspberry lleva el ojo. El pistón solo se mueve si el Raspberry escribió RECHAZAR, y hoy eso se queda en cero.


La pantalla no se vuelve a hacer
Quien opera la celda abre la misma página de siempre. El video y los números salen de las dos direcciones que esa página ya pide.

La palabra SIM que se ve hoy en esa página está escrita fija. No se apaga sola. Se quita cuando los números ya vengan del PLC.

Las tres direcciones de red
Son las del banco de prueba. Si en el laboratorio ya hay otras, se anotan en la última hoja y se usan esas.


Orden para empezar
Se sigue este orden. No se salta al programa si el LED del infrarrojo todavía no prende.
- Anota marca y modelo del PLC, de cada infrarrojo (si dice PNP o NPN) y de la cámara.
- Cablea IR1 e IR2 solo al PLC. Pasa la mano: tiene que prender el LED del sensor y el LED de la entrada. Todavía sin Raspberry.
- Programa en el PLC las entradas, el pulso del pistón y la confirmación de IR2. Prueba el pistón con un botón del propio PLC, en vacío.
- Pon las tres máquinas en el switch. Desde la laptop, haz ping al Raspberry y al PLC.
- Enchufa la cámara al USB del Raspberry. Abre en el navegador de la laptop la dirección del video del Raspberry. Tiene que verse la imagen antes de tocar la pantalla de la celda.
- Abre el estado que publica el Raspberry. El enlace al PLC tiene que decir que está vivo.
- Arranca la pantalla de siempre (celda.html) con la dirección del Raspberry configurada. Iniciar cámara muestra el video del Pi. Enlace PLC pasa a OK.
- Una pieza de prueba sin pedir expulsión: IR1 cuenta, IR2 la ve, la pantalla dice pieza aceptada.
- Una pieza con el botón de prueba del PLC, no con la cámara: la pantalla dice scrap expulsado. Si la pieza no sale, dice fallo de actuación.
- Desconecta el cable de red del PLC. En un par de segundos la pantalla dice SIN CONEXIÓN y el pistón no se queda accionado.

| No se hace No llevar los infrarrojos a los pines del Raspberry. No meter 24 V al Raspberry. No tratar “hay una pieza en la imagen” como pieza mala. No cambiar la dirección que pide la pantalla. |
| --- |

Para llenar a mano, antes de darlo por conectado
Las direcciones I0.0 y Q0.0 de los dibujos son un ejemplo. Las de verdad son las del PLC que está en el tablero. Hasta llenar esta tabla, el enlace no está terminado.
| Dato | Valor |
| --- | --- |
| Marca y modelo del PLC |  |
| IR1: marca, PNP o NPN, borne |  |
| IR2: marca, PNP o NPN, borne |  |
| Salida del pistón y si lleva relé |  |
| La banda ya corre sola, o la arranca el PLC |  |
| IP de la laptop |  |
| IP del Raspberry |  |
| IP del PLC |  |
| Duración del pulso del pistón, medida en la banda |  |

Anexo  ·  para quien escribe el programa
Si el trabajo es cablear, aquí se puede parar. Lo que sigue es el acuerdo entre el Raspberry y la pantalla.
El Raspberry publica dos cosas, y la laptop las reenvía por las direcciones que la página ya conoce:
Video del Raspberry:   http://192.168.0.20:8080/vision/stream
Estado del Raspberry:   http://192.168.0.20:8080/cell/snapshot
La pantalla sigue pidiendo /line/vision/stream y /line/cell/status a la laptop. Esas dos no se cambian.
El bit RECHAZAR se queda en 0. Se cambia a 1 únicamente cuando el criterio de inspección diga que esa pieza es FAIL. Ver una pieza en la foto no cuenta.
Cuando el PLC suma una pieza nueva, pone el resultado en 0. Después, cuando IR2 ya resolvió, escribe 1 (aceptada), 2 (scrap) o 3 (el pistón no la sacó). Si no pone ese 0, la pieza nueva hereda el resultado de la anterior.
En la laptop, en la misma ventana donde se arranca la pantalla:
| $env:CELL_AGENT_URL = "http://192.168.0.20:8080" .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 |
| --- |

Sin esa variable, la pantalla sigue con los números de demostración, como hasta ahora. El inventario y el robot no dependen del Raspberry.