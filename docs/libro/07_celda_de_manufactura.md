# Capítulo 7: La celda de manufactura

*Banda, fixtures, cámara, relevadores, un controlador LOGO y un pistón: qué hace cada cosa, qué dice el código y qué quedó de los planes anteriores con PLC.*

## Dos historias de la misma celda

En la documentación de hardware del repositorio hay dos relatos de cómo funciona la celda. La **hoja de conexión** del 5 de octubre cuenta que una Raspberry Pi 4 lee un **PLC** (*Programmable Logic Controller*, el cerebro industrial de los tableros) por **Modbus TCP** y que *"no hay ningún hilo entre el PLC y los GPIO de la Pi"*. El **código** (`backend/cell_line.py`) cuenta otra: la Pi enciende **dos relevadores** con sus propios pines (**GPIO 8** para el pistón y **GPIO 9** hacia la entrada **I4 de un LOGO**, un mini-PLC), y el LOGO mueve la banda.

El equipo resolvió la contradicción: **el hardware real de la celda es por GPIO, con relevadores hacia el LOGO, como dice el código.** La parte de PLC por Modbus de los documentos queda como **plan o documentación vieja** (se resume en una sección de este capítulo). La auditoría del 22 de octubre ya había registrado la discrepancia como cuatro versiones distintas; la decisión la cierra a favor del código. Lo que sigue **PENDIENTE (P-12)** son los detalles físicos que ningún documento confirma: qué pines y qué tipo de placa de relevadores se usan en realidad y qué modelo de LOGO.

## El equipo detrás de la celda

El proyecto lo desarrollan seis personas con áreas separadas. En la celda intervienen:

| Persona | Área | Qué falta confirmar con esa persona |
|---|---|---|
| **Mario** | Todo el software del robot y la visión | — |
| **Isaac** | Diseño mecánico, CAD e impresión 3D (la banda y los fixtures) | Dimensiones oficiales y material de los fixtures (P-21) |
| **Pedro** | El pistón de scrap (la pieza que expulsa lo rechazado) | Tipo de pistón, electroválvula y tiempos reales (P-14) |
| **Uriel** | Comunicación de la Raspberry con el PLC y con la visión | Detalle del cableado y de la comunicación (P-12) |
| **David** | Ensamble mecánico y electrónica | Relevadores, fuente y paro de emergencia (P-16) |
| **Emmanuel** | HMI/GUI (la pantalla de operación) aparte | Alcance de la pantalla de la celda (P-17) |

## La cadena física, de la banda al scrap

La idea, que viene de la **ADR 0010** (un documento corto del equipo que registra una decisión de arquitectura): una **banda transportadora** lleva piezas, cada una sobre un **fixture** (la base que la sostiene en posición). Frente a la **cámara** la pieza se detiene un instante; la **visión** decide si es **PASS** (pieza real registrada) o **FAIL** (no lo es); si es FAIL, un **pistón** la empuja fuera de la banda (*scrap*, desecho); si es PASS, la banda sigue y la recoge el robot.

Lo que dice el código sobre quién hace qué:

- **La Raspberry Pi 4** corre `celda_agent.py`: abre la cámara, corre el modelo de visión, decide y **enciende los dos relevadores** (pistón y banda).
- **El LOGO** (mini-PLC) mueve la banda. El código lo dice así: *"El LOGO, no este archivo, ignora el infrarrojo 5 s al ver I4"*. Es decir: el LOGO tiene un infrarrojo conectado a sí mismo y, cuando la Pi manda el pulso a su entrada **I4**, avanza la banda e **ignora el sensor 5 s** para no volver a detectar la misma pieza. Marca y modelo exactos del LOGO: **PENDIENTE (P-12)**.
- **El pistón** es un cilindro neumático (un émbolo movido con aire comprimido) accionado por una **electroválvula** que abre el aire cuando su **relevador** recibe el pulso de la Pi.

## Qué decide la visión: un PASS que no es lo que parece

Una honestidad que el propio código declara. En `backend/dataset_store.py`, la función `clasificar_pieza` dice: *"PASS significa que el nombre está en clases, no que la pieza esté libre de defectos."* Es decir:

- El modelo reconoce **tres piezas registradas**: `computadora1`, `computadora2` y `computadora3` (**VERIFICADO**, archivo `classes.txt`). Son las **ECU** (computadoras de motor) que viajan en los fixtures.
- **PASS** = el modelo vio una de esas tres con **confianza ≥ 0.50** y sin ambigüedad (la segunda candidata queda al menos **0.10** por debajo).
- **FAIL** = el modelo vio algo que **no es una pieza registrada** (o dudó entre dos).
- **SIN_PIEZA** = el modelo no vio nada: no hace nada.

**No hay inspección de defectos todavía.** Una ECU rayada o con un conector roto pasaría como PASS. El criterio real de calidad es una decisión pendiente de diseño: **PENDIENTE (P-24)**. Lo honesto ante un jurado es decir *"la celda distingue piezas registradas de objetos que no lo son"*, no *"la celda inspecciona calidad"*.

Cifras del modelo (**MEDIDO**, `parts_report.json`, entrenamiento del 15 de octubre de 2026): **mAP50 = 0.995**. El **mAP50** es una nota de qué tan bien el modelo localiza y acierta objetos (1.0 es perfecto). Con un dataset tan chico (el repositorio conserva 19 fotos en la bandeja de entrada), esa nota es **optimista**: el modelo no ha visto la variedad de ángulos, luces y fondos del mundo real. La bitácora midió además que el modelo exportado a **ONNX** juzgó **igual que el original en 19 de 19 fotos** (IoU medio 0.994), pero que **no se probó con objetos que no sean pieza**, así que el FAIL real **no está medido** con este modelo.

## Qué pasa con una pieza, segundo a segundo

Los números salen de las variables de entorno **por defecto** de `cell_line.py` (**VERIFICADO** en código; **NO MEDIDO** en una Pi real):

1. **La visión juzga cada 0.5 s** (`LINE_ANALISIS_CADA_S`) un solo cuadro con el modelo ONNX.
2. **Se exigen 5 juicios iguales seguidos** (`LINE_ESTABLES`) antes de actuar. Así un parpadeo de luz no dispara el pistón. Tarda unos 2.5 s más lo que dure cada análisis. La documentación avisa: *"No bajar de 3 sin probar: un FAIL falso dispara el pistón."*
3. **Una pieza dispara una sola vez**: tras actuar, el sistema se "desarma" hasta que ve **SIN_PIEZA**; así la misma pieza no se juzga dos veces.
4. **Si es FAIL:** espera **3 s** (`LINE_PISTON_ESPERA_S`: lo que tarda la pieza en llegar frente al pistón), **enciende el pistón 1 s** (`LINE_PISTON_ON_S`), lo apaga y espera **2 s** a que **regrese** (`LINE_PISTON_REGRESO_S`).
5. **Después, pulso de banda de 0.5 s** (`LINE_BANDA_ON_S`) por el GPIO 9: avanza la banda. En **PASS** este pulso sale **al terminar el análisis**, sin esperar al pistón.
6. Se anota el evento: `scrap_expulsado` (FAIL con todo en orden) o `pieza_aceptada` (PASS con todo en orden).

Un FAIL completo suma, con los valores por defecto: **≈ 2.5 s de estabilización + 3 s + 1 s + 2 s + 0.5 s ≈ 9 s** por pieza (estimación a partir de las constantes; **NO MEDIDA**). Todos esos tiempos se calibran **en la banda real** (**PENDIENTE (P-14, P-15)**); los números del código son puntos de partida, no la verdad.

### Los registros de cada pieza

Cada pieza deja un registro con `resultado` (**PASS** o **FAIL**), `accion` y la hora. Las acciones que escribe el código:

| Acción | Cuándo ocurre |
|---|---|
| `pieza_aceptada` | PASS y el pulso de banda salió |
| `scrap_expulsado` | FAIL, el pistón disparó, regresó y la banda avanzó |
| `fallo_actuacion` | FAIL pero algo falló al actuar (por ejemplo, un pulso no pudo enviarse) |
| `pulso_no_enviado` | PASS pero el pulso de banda no pudo enviarse |

Dos filosofías que enseña la tabla: **no se finge** (si no hay forma de mover el relevador, el registro lo dice) y **un FAIL nunca se reporta como aceptado** (si la visión dijo FAIL y el pistón no actuó, es `fallo_actuacion`).

## Sin `gpiod`, nada se mueve

`cell_line.py` solo mueve un pin si puede importar la librería **`gpiod`** (la que habla con los pines del chip en Linux moderno). Si no la encuentra, `poner()` devuelve `False` sin tocar nada y el código **no finge** que algo se movió. **Hoy esa librería no está instalada** ni en el Jetson (**VERIFICADO**: `python -c "import gpiod"` falla) ni se ha probado en la Pi. Es una protección involuntaria buena: mientras no se instale, ningún botón de la pantalla puede mover un pin.

La bitácora lo verificó leyendo el código y reproduciéndolo con las clases reales en una laptop: **ARRANQUE y PARO solo cambian el interruptor interno** (`running`); PARO además **aborta el ciclo en curso y apaga las salidas**; y el único camino a un pin es la decisión de la cámara tras **cinco juicios iguales**, nunca un botón. La regla escrita en `docs/guia_arranque.md`: *"No instalar `python3-libgpiod` hasta confirmar el cableado."* Como el cableado por GPIO ya está decidido, el siguiente paso es medir con LED y multímetro (capítulo 8) antes de instalarla.

Una trampa de nombres: en el JSON de estado, `sources.plc` **no significa que haya un PLC**: es `salidas.abiertas`, es decir, "¿se abrió el chip GPIO?". Sin `gpiod` siempre es `false`, y por eso la pantalla muestra la alarma **"Enlace PLC perdido"** (la bitácora la marcó como *esperada: no hay PLC*). Es un nombre heredado de la versión PLC del diseño.

## Estados, alarmas y sesión: la pantalla de la celda

La página `celda.html` (que sirve **la propia Pi**, no la laptop) muestra el estado. El **estado** (`state`) puede ser:

- **OPERANDO**: la celda está activa, la cámara viva y hay un ciclo permitido.
- **DETENIDA**: o el operador pulsó **Paro** ("Paro solicitado por el operador") o la cámara no ha juzgado ningún cuadro en los últimos **2 s** ("Cámara apagada").

(Un tercer estado, `SIN_CONEXION`, existe en la hoja de conexión del PLC, pero `cell_line.py` no lo produce.)

`cell_hmi.py` añade **alarmas** al estilo de la norma **ISA-18.2** (la que ordena cómo se muestran y reconocen las alarmas en planta): cada una con **prioridad, causa y acción**, y **viven en el servidor** (sobreviven si se recarga la página). Son tres: "controlador no responde", "visión en FAIL y el pistón no disparó" y "detenida". La **sesión** usa una cuenta única de laboratorio (la norma **IEC 62443** como referencia): quien manda el ciclo debe haber iniciado sesión. **La contraseña no está en el código** (antes era una cuenta fija `admin`/`admin`, ya eliminada); se toma de la variable de entorno `CELDA_HMI_CLAVE`. Sin esa variable *nadie* puede iniciar sesión y Arranque/Paro no responden. Hallazgo real de `iniciar_aether.ps1 -SoloComprobar`: el archivo `backend\.env` de la laptop **todavía no la tenía definida**. El módulo mismo aclara su alcance: *"No es una certificación del sistema. El paro de emergencia no pasa por aquí."*

El alcance final de la pantalla (quién la opera, si lleva monitor propio) es de **Emmanuel**: **PENDIENTE (P-17)**.

## La celda se opera sola

El diseño exige que **la laptop sea el servidor central, pero que la celda tenga su propio arranque y paro y pueda operarse sola.** El código lo respalda:

- `celda_agent.py` arranca **solo la celda** (cámara, visión, pulsos, alarmas y `celda.html`); **no importa** Lumina, la base de datos, `torch` ni `ultralytics`. Una prueba automática lo comprueba.
- Sirve **su propio video** (`/line/vision/stream`) y su **propia página**; el video **no pasa por la laptop**.
- **Decide y actúa aunque la laptop o la red se caigan.** A la laptop solo le manda **eventos** (`POST /line/cell/events`) con un identificador único por pieza, en una **cola con reintento**; allá solo se **anotan**, no accionan nada.
- Los botones **Arranque y Paro** de la pantalla viven en la Pi (cuando hay sesión).

Lo que **no existe** en los documentos: un **arranque o paro físico** (un botón de tablero) independiente de la pantalla, ni el **paro de emergencia físico** de la celda: **PENDIENTE (P-16)**.

## La Pi 4 corre la visión con un truco para no ahogarse

Una Pi 4 es mucho más modesta que una laptop. Para no saturarla, `celda_agent.py` hace tres cosas, medidas en una **laptop** (no en la Pi):

- Un **solo modelo** en lugar de dos.
- **Un análisis cada 0.5 s** en vez de cada cuadro.
- El modelo corre en **ONNX** con `cv2.dnn` de OpenCV, sin `torch` (que pesa mucho).

Resultado (**MEDIDO en la laptop**, 8 s con cámara, sin nadie viendo el video): el pipeline anterior de `main.py` gastaba **381 % de un núcleo** con unos 6 análisis por segundo; el agente nuevo, **18 %** con 2 análisis por segundo. **Falta medirlo en la Pi real**: **PENDIENTE (P-18)**. Un hallazgo curioso: con DirectShow (Windows) `cap.grab()` no espera al siguiente cuadro y daba 1.5 millones de vueltas por segundo ocupando un núcleo entero; con `read()` sí espera.

## El plan con PLC y Modbus (documentación vieja)

La hoja de conexión del 5 de octubre y la guía describen un mapa de **señales Modbus** (`rechazar`, `banda_marcha`, `rpi_vivo`, `plc_vivo`, `accion`, `pieza_id`) con direcciones de ejemplo y una columna "Real" **vacía**. **Modbus TCP** es un protocolo industrial para leer y escribir registros de un PLC por Ethernet (puerto 502). La carpeta `edge/manipulation/line_actuation/plc_backend/` está vacía a propósito y el código **no consume** la variable `CELL_AGENT_URL` de ese plan. Es decir, el mapa de Modbus fue un **plan** para una versión con PLC, no lo que corre. Queda de referencia por si algún día la celda cambia a un PLC.

## Documentos viejos contra código

| Tema | Documento viejo | Código real (gana) |
|---|---|---|
| Quién enciende el pistón | PLC por Modbus; la Pi no lo energiza | La Pi, por GPIO 8 y un relevador |
| Quién mueve la banda | PLC | El LOGO, avisado por GPIO 9 → entrada I4 |
| Criterio PASS/FAIL | "Hoy solo detecta presencia" (ADR 0010, hoja de conexión) | Ya distingue piezas registradas de otros objetos (`clasificar_pieza`); defectos: no |
| `tipo_objeto` (1, 2 o 3) | "No existe" (ADR 0010) | Existe: es la posición de la clase en `classes.txt` + 1 |
| Dónde se ve `celda.html` | La laptop | La propia Pi |

## Probar la celda sin riesgo

1. En una laptop, **sin `gpiod`**: la celda corre completa, la pieza se juzga y se anota como `pulso_no_enviado` o `fallo_actuacion`. **Nada se mueve.**
2. Correr las pruebas, `[Laptop · PowerShell]`, desde la raíz del proyecto: `backend\.venv\Scripts\python.exe -m pytest tests\backend\test_cell_line.py tests\backend\test_celda_agent.py -q`. (Esos archivos de pruebas existen; las pruebas de `cell_line` usan una espera falsa y relevadores falsos.)
3. Para la Pi, **primero** LED y multímetro (capítulo 8), **después** instalar `python3-libgpiod`.

## Celdas de inspección en planta

Las celdas industriales de inspección usan **PLC certificados** para la lógica de seguridad y movimiento, y una **PC o cámara inteligente** para la visión; se comunican por **Modbus, PROFINET o EtherNet/IP**, y el **paro de emergencia es un relevador de seguridad** cableado, nunca una pantalla. La celda de Aether sigue ese principio: la visión corre en la Pi y la potencia se maneja con relevadores y un LOGO.

## Preguntas de repaso: la celda

1. ¿Por qué `PASS` en esta celda no significa "sin defectos"? ¿Qué se le diría a un jurado?
2. ¿Qué evita que un parpadeo de luz dispare el pistón?
3. Con los valores por defecto, ¿cuánto dura un FAIL completo y qué parte se afina con la banda real?
4. ¿Por qué `sources.plc` es `false` aunque no haya ningún PLC, y qué alarma provoca?
5. ¿Qué diferencia hay entre el botón "Paro" de la pantalla y un paro de emergencia?
6. ¿Qué papel cumple cada una de las seis personas del equipo en la celda?
