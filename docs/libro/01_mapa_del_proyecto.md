# Capítulo 1: El mapa de Aether

*Qué es el proyecto, quién lo hace, qué máquinas lo componen y por qué el video nunca viaja por el WiFi.*

## Qué es Aether, en una frase y en un párrafo

**Aether** es un sistema que junta dos cosas en un solo alcance: **Aether Inventory**, un robot móvil que recorre un espacio, mira productos y convierte lo que ve en información de inventario; y **una línea de manufactura**, una **celda** con banda transportadora donde una cámara decide si una pieza automotriz es una pieza registrada (PASS) o no (FAIL) y un pistón expulsa lo rechazado. El producto de la línea son **piezas automovilísticas**; las que se usan en las pruebas son tres modelos de **ECU** (*Engine Control Unit*, la computadora de motor de un coche).

El proyecto nació el **30 de julio de 2026** como proyecto integrador de ingeniería, con una ambición de **prototipo comercialmente defendible**: no una demostración desechable. La ventana de desarrollo es de unos **4 meses** con aproximadamente **2 horas diarias** de dedicación por persona, unas **240 horas** totales, según los documentos de contexto; toda decisión de alcance se mide contra ese presupuesto de tiempo. El requisito académico es **integrar manipulación y actuación física real, con hardware real**, en la línea de manufactura: no basta una simulación.

## El equipo: seis personas, seis áreas

| Persona | Área |
|---|---|
| **Mario** | Todo el software del robot y la visión por computadora; es además quien lleva este repositorio |
| **Isaac** | Diseño mecánico, CAD (diseño asistido por computadora) e impresión 3D; diseñó la banda transportadora y trabaja los fixtures |
| **Pedro** | El **pistón de scrap**: el mecanismo que expulsa las piezas rechazadas |
| **Uriel** | La comunicación de la Raspberry Pi con el controlador de la celda y con la visión |
| **David** | Ensamble mecánico y electrónica del robot y de la celda |
| **Emmanuel** | La **HMI/GUI** (*Human-Machine Interface*, pantalla de operación) aparte |

Cuando en un capítulo de hardware falta un dato que pertenece al área de una de estas personas, el libro **no lo inventa**: lo marca **PENDIENTE** y nombra a quien debe confirmarlo.

## El problema que Aether resuelve

El diagnóstico del equipo (informe integrador, capítulo 2) se resume en cuatro causas. **Personal:** depender de personas para trasladar piezas entre estaciones y contar inventario introduce variabilidad. **Método:** sin un protocolo de enlace entre estaciones, el operador humano se vuelve el mecanismo de coordinación por defecto y aparecen tiempos muertos. **Detección:** con reflejos de luz, un marcador de posición puede leerse como otro identificador válido sin dar señal de error. **Entorno:** la iluminación variable y la falta de puntos de referencia fijos aumentan el error de detección.

El mensaje comercial que se defiende es concreto: *"el robot revisó el Anaquel 4 y encontró 23 unidades del producto X"*, no detalles de implementación. El proyecto se obliga a **no prometer más de lo que ha verificado** (el principio de honestidad de producto, más abajo).

## El mapa de máquinas

Aether no corre en una sola computadora. Estas son las piezas, quién corre qué y por qué puerto habla (los **puertos** son las "puertas" numeradas de una computadora por donde entran las conexiones; el capítulo 10 los explica):

| Máquina | Qué corre | Puerto | Qué le llega o qué manda |
|---|---|---|---|
| **Laptop** (Windows) | El **servidor central**: base de datos, panel web, asistente Lumina (modelo de lenguaje local Ollama), servicio de voz con el micrófono | 8000 (servidor), 11434 (Ollama) | Páginas y datos JSON; texto de voz |
| **Jetson Orin Nano Super** (en el robot) | **Agente de percepción**: cámara, YOLO, lectura de códigos y ArUco, video anotado | 8001 | Manda a la laptop solo observaciones JSON; sirve su video a la página |
| **ESP32** (en el robot) | Control de bajo nivel: ruedas, elevador, empujador, uña, sensores cercanos y watchdog | USB al Jetson | Recibe órdenes del Jetson por USB |
| **Raspberry Pi 4** (en la celda) | **Agente de la celda**: cámara de línea, visión, relevadores, `celda.html` | 8000 | Manda a la laptop eventos de pieza; sirve su propio video y su pantalla |
| **LOGO** (en la celda) | Mini controlador lógico que mueve la banda | Entrada I4 desde un relevador | Recibe un pulso de la Pi |
| **Robot carrito** | Estructura, ruedas, torre elevadora (capítulos 3 y 4) | — | — |

(El "robot móvil" y el "carrito" son la misma máquina: el robot de transporte con elevador. El capítulo 3 lo describe.)

## Mover datos chicos, no datos grandes

La decisión de arquitectura más importante del último mes se resume en una frase: **cada cámara se procesa y se muestra en su propio equipo; por la red solo viajan datos pequeños.** Un video de 640 × 480 a 30 cuadros por segundo son decenas de megabits por segundo; una **observación** ("vi una `computadora2`, con 0.87 de confianza, a las 15:04:05") son unos cientos de bytes. Por eso:

- El **Jetson** abre su cámara, corre YOLO y **sirve su video anotado él mismo**. A la laptop solo le manda JSON.
- La **Pi 4** hace lo mismo con la cámara de la celda.
- La **laptop** sigue siendo el servidor central: guarda el inventario, sirve las páginas, aloja a Lumina.
- La página se abre en el navegador de cada equipo, y la página lee del servidor **la dirección del video**; si quien mira es el mismo equipo de la cámara, la dirección sale como `127.0.0.1` y el video no sale de ese equipo.

Esa decisión está documentada en la **ADR 0012** (una *ADR*, *Architecture Decision Record*, es un documento corto que registra una decisión de arquitectura, sus alternativas y su estado). **Estado:** propuesta implementada en la rama `jetson-agente` de Git; **todavía no está aceptada formalmente** por Mario (**PENDIENTE (P-32)**), y se probó en laptop y, parcialmente, en el Jetson (capítulo 9).

## Las decisiones de arquitectura, una por una

| # | Decisión | Qué resolvió |
|---|---|---|
| 1 | Percepción | Enfoque híbrido: **YOLO** (detección y conteo) + código de barras/QR (identificación). Clasificar un producto solo con la imagen queda como evolución futura |
| 2 | Localización | **ArUco** como verificación de posición; no es un sistema de navegación |
| 3 | Navegación | Waypoints con odometría por encoders más **detección reactiva de obstáculos** (no "evasión inteligente") |
| 4 | Cómputo | **Jetson Orin Nano Super** en el robot; ESP32 para el bajo nivel. (La contingencia con Raspberry Pi 5 se descartó el 30 de septiembre) |
| 5 | Esquema de datos | Dos niveles: **Observations** (crudo) y **Declared Inventory** (declarado) con tres estados de cobertura |
| 6 | Comunicaciones | MQTT para telemetría (aún sin implementar), REST para el panel; el paro de seguridad no depende de la red |
| 7 | Alcance del panel | Inventario declarado más historial y trazabilidad (Opción B) |
| 8 → 10 | Línea de manufactura | Primero dos brazos industriales (KUKA y UR5); el **16 de septiembre** se reemplazaron por **banda + fixtures + pistón** (ADR 0010) |
| 9 | Auto-refresh | El inventario se refresca solo cada cierto tiempo (versión reducida del monitoreo en vivo) |
| 11 | Reparto de roles | Borrador no decidido |
| 12 | Agentes de cámara y voz local | La decisión de "datos chicos" (arriba) |

El cambio de la línea merece una frase aparte: el equipo **eliminó los dos brazos robóticos** porque la coordinación de tres robots con tiempos críticos era demasiado riesgosa para el presupuesto de horas y la banda más pistón **sigue cumpliendo el requisito de hardware real**. Las secciones de los capítulos 2, 3 y 4 del informe integrador de septiembre que aún mencionan los brazos están superadas por este libro.

## Principios no negociables

El proyecto fijó cinco reglas de conducta técnica que explican muchas decisiones:

1. **Honestidad de producto.** Nunca prometer capacidades no verificadas, ni en documentación ni en la interfaz.
2. **Terminología precisa.** "Conteo visible detectado" **no** es "conteo real de inventario". ArUco **no** es navegación. "Cobertura completa" significa que el procedimiento terminó, no que se vio todo. El actuador de la línea es lógica programada de punto fijo, **no** "aprendizaje".
3. **Verificación aritmética.** Las cifras que entrega alguien (cotizaciones, mediciones) se verifican y se señalan las discrepancias.
4. **Módulos independientes y probables.** Cada módulo se puede probar antes de integrarlo.
5. **No fabricar dependencias.** No se instala una librería, un campo ni un endpoint "por si acaso".

## Qué existe de verdad (a 24 de octubre de 2026)

| Pieza | Estado |
|---|---|
| Percepción híbrida (YOLO + QR + ArUco) en laptop | **VERIFICADO**, corre; pruebas automáticas |
| Agente del Jetson | Corrió en el Jetson real: 29.0 FPS (**MEDIDO**, reportado) |
| Servidor, base de datos, panel, historial | **VERIFICADO** |
| Lumina (cara, voz, asistente local) | **VERIFICADO** en laptop |
| Servicio de voz (Vosk) | Probado con audio simulado; micrófono real **NO VERIFICADO** |
| Celda en la Pi 4 | Construida y probada en laptop; Pi real **NO VERIFICADO** |
| Carrito (estructura, torre, electrónica) | Diseño detallado; armado **NO VERIFICADO** |
| ESP32 (firmware) | No existe todavía |
| MQTT | Sin implementar |
| Paro de emergencia físico (robot y celda) | Diseño del robot; celda sin documentar |
| Suite de pruebas | **MEDIDO** hoy: 345 pasan, 2 fallan (las mismas dos de Lumina de siempre) |

La última fila es una cifra de ejecución real: el 24 de octubre se corrió la suite de pruebas del servidor y dio **345 pruebas aprobadas y 2 fallidas** en 34.9 s; las dos fallidas son de Lumina (`test_robot_ask_conserva_varias_oraciones_reales_tras_filtrar` y `test_robot_ask_lista_numerada_tambien_se_detecta`), ya fallaban antes de los cambios recientes y no se tocaron. Las pruebas de la parte de borde del repositorio (`tests/edge`) dieron **7 aprobadas**.

## La historia en una línea de tiempo

| Fecha (2026) | Qué pasó |
|---|---|
| 30 jul | Arranca el proyecto |
| 30 ago | Estructura inicial: arquitectura, ADR, entornos virtuales |
| 1–2 sep | Percepción combinada, motor de inventario, API, panel y robot Lumina; primer informe integrador |
| 16 sep | Cambio de la línea: banda + fixtures + pistón (ADR 0010) |
| 30 sep | Loader global y vista por capas del robot en el panel |
| 8 oct | Documentación de punta a punta |
| 16–17 oct | Sitio público, dominio `aethermx.online` y endurecimiento de seguridad |
| 21 oct | Celda, Lumina de escritorio y carrito 3D al repositorio; primeras sesiones en el Jetson |
| 22 oct | ADR 0012 e implementación de agentes, voz y arranque |
| 23 oct | Primera prueba real del agente en el Jetson; correcciones de CSP; palabra de activación |

## Cómo se conectan los capítulos

El capítulo 2 enseña la electricidad necesaria; el 3 y el 4 describen el cuerpo del robot y su energía; el 5 y el 6, sus músculos y sentidos; el 7 y el 8, la celda y la Raspberry Pi; el 9, el Jetson. A partir del capítulo 10 el libro sube a la capa de software: redes, web, Linux, Python, visión, voz, datos y seguridad. La Parte D cierra con calidad, documentación, presentación, diagnóstico y futuro.

## Preguntas de repaso: visión de conjunto

1. ¿Cuál es la diferencia entre el robot móvil y la celda, y qué tienen en común?
2. ¿Por qué el video de cada cámara no viaja por la red hasta la laptop?
3. ¿Qué cambió el 16 de septiembre y por qué?
4. Explicar la diferencia entre "conteo visible detectado" y "conteo real de inventario".
5. Nombrar tres piezas que **todavía no están probadas en hardware real**.
6. ¿Quién del equipo confirmaría un dato sobre el pistón? ¿Y sobre la comunicación de la Raspberry?
