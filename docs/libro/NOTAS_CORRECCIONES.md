# Notas de correcciones (aparte del libro)

Archivo de trabajo para Mario. No va dentro del PDF. Regla que aplicó este libro: **el código gana a los documentos; la bitácora del Jetson (21 oct) gana a la guía de construcción (9 oct)**. Cada fila dice qué se corrigió y dónde está la fuente. Nada de esto modificó código de producción.

## Actualización final (todo el libro, 24 de octubre de 2026)

Decisiones firmes de Mario aplicadas: el motor de tracción es el M0601 (cotizado en «Costos Carrito 9», rev. 3.12b; el documento no está en el repositorio); el hardware real de la celda es GPIO con relevadores hacia el LOGO (lo de PLC y Modbus es plan o documentación vieja); el ESP32 se programa con PlatformIO; el paro de emergencia sigue como decisión abierta entre David y Mario. El libro piloto se usó solo como molde de estilo, no como fuente de datos.

## Parte B (capítulos 2 a 9)

| # | Tema | Lo que dice un documento | Lo que se usó y por qué |
|---|---|---|---|
| 1 | Cómputo del robot | `docs/hardware/guia-de-construccion.md` (9 oct): robot con Raspberry Pi 5, "la cara y el asistente no necesitan Jetson". ADR 0004: Pi 5 + AI HAT+ como contingencia. `aether_context_docs.md` y `ActFinal.md` aún la listan | **Jetson Orin Nano Super** manda: Mario confirmó (24 oct) que la Pi 5 fue un plan del 30 sep descartado y la bitácora (21 oct) muestra el Jetson corriendo el agente |
| 2 | Pi 4 | Algunos documentos hablan de "Raspberry" sin modelo | Pi 4 es **solo la celda** (visión de línea junto a la banda), no el robot |
| 3 | Hoja de armado del carrito | `dashboard/armado.html` del repo (16 oct, 2 647 líneas) y el archivo `Armado del carrito Aether.html` entregado por Mario (rev. 3.4 a 3.8, 17–18 oct, 3 800 líneas) | Se usó el archivo nuevo. Diferencias que cambian cifras: escuadras 36 → 28 (más 16 placas); fixture de 21 × 18 cm → quilla de 21.3 × 16.5 cm con ECU; empujador con uña "pin" → dedo abatible de 7 mm; rampa de 14 rodillos → mesa inclinada de melamina de 1.4 × 0.3 m a ≈ 15°; se agregó la banda de Isaac (3 tramos de 1030 mm). **Sugerencia (no la hice, es código de producción):** reemplazar `dashboard/armado.html` por la versión nueva |
| 4 | Motores | La hoja (rev. 3.8) nombra 2 × motor-rueda M0601 (FIT1042 izq. y FIT1038 der.), 18 V, RS485 | Mario (24 oct): "los motores aún no están elegidos". Se muestran los dos datos y queda PENDIENTE (P-01) |
| 5 | Peso por rueda | `dashboard/armado.html` (viejo): "~8.7 kg por rueda (aguanta 10)". La rev. 3.8 ya no lo dice | Mario: máximo estimado 40 kg y unos 17 kg por llanta motriz. Se usan los de Mario, como PENDIENTE (P-02) |
| 6 | Paro de emergencia | La guía vieja tenía un segundo circuito del paro hacia el pin GPIO 23 del ESP32 (para que el software se enterara) | La hoja rev. 3.8 solo lleva el paro al relé (107 cables revisados): el software no se entera. Marcado PENDIENTE (P-06) |
| 7 | Driver de motores | Guía vieja: TB6612FNG para motores de < 1 A | La hoja rev. 3.8 usa motor-ruedas con driver propio por RS485 y 3 A4988 para los motores a pasos; la propia guía dice que el TB6612 no sirve para un robot "de tamaño persona" |
| 8 | Quién enciende el pistón | `docs/hardware/datasheet-conexion-celda.md`, guía y ADR 0011 (borrador): PLC por Modbus TCP, "la Pi no energiza el pistón", `celda.html` se abre desde la laptop | **Código** (`backend/cell_line.py`): la Pi enciende dos relevadores por GPIO (8 pistón, 9 banda hacia la entrada I4 de un LOGO); el LOGO mueve la banda; `celda_agent.py` sirve su propia página y video. Lo realmente cableado sigue sin confirmar (P-13) |
| 9 | Criterio PASS/FAIL y `tipo_objeto` | ADR 0010, `contracts/line_handshake_protocol.md` y la hoja de conexión: "hoy solo detecta presencia"; "no existe clasificador de tipo" | **Código** (`backend/dataset_store.py::clasificar_pieza`): ya distingue 3 piezas registradas (`computadora1/2/3`) de otros objetos; `tipo_objeto` = posición en `classes.txt` + 1. Defectos: no existen (P-26) |
| 10 | `sources.plc` | `contracts/rest_api.md` y la hoja hablan de "PLC" | En el código es `salidas.abiertas` (¿se abrió el chip GPIO?). El nombre es heredado; la alarma "Enlace PLC perdido" es esperada sin `gpiod` |
| 11 | Estado `SIN_CONEXION` | Hoja de conexión de la celda | `cell_line.py` solo produce `OPERANDO` y `DETENIDA` |
| 12 | `parts.pt` | Bitácora (21 oct): "`parts.pt` no está en el repo" | En el árbol local sí existen `edge/perception/weights/parts.pt` (14 oct), `parts.onnx` (22 oct) y `parts_report.json` (mAP50 0.995, 15 oct), pero git no los rastrea (`git ls-files` vacío). Para la Pi hay que exportar y copiar el `.onnx` |
| 13 | Libro piloto, capítulo 10 | "Antes de la demostración también debes cambiar la clave débil `CELDA_HMI_CLAVE`" | Hoy no hay clave por defecto: `cell_hmi.py` no tiene contraseña en el código y, sin la variable `CELDA_HMI_CLAVE`, **nadie** inicia sesión. La frase del piloto debe leerse como "definir la clave" |
| 14 | Libro piloto, capítulo 10 | "Quedó definido un plan P1 a P10 de configuración de la Pi" | No lo encontré en el repositorio. Lo más cercano: `COMANDOS_LINUX.md` §7 y `docs/auditoria/DECISION_Y_PLAN_MANANA.md`. Si existe en otro documento, pásalo |
| 15 | `docs/academic/AI_CONTEXT.md` | Se presenta como contexto | Está marcado SUPERADO por `aether_context_docs.md` |
| 16 | Documentos de hoja y repositorio | Bateria "BR-1224" aparece solo en la hoja | Sin segunda fuente: NO VERIFICADO (P-05) |

## Lo que sí coincidió

Cámara USB del Jetson (046d:0894), JetPack/L4T R36.4.7, Python 3.10.12, CUDA 12.6, modo 25 W, `torch.cuda.is_available() = True`, 29.0 FPS del agente: la bitácora, `SETUP_JETSON.md` y `COMANDOS_LINUX.md` se confirman entre sí.

## Partes A, C y D, apéndices (capítulos 0, 1, 10 a 27)

| # | Tema | Lo que dice un documento | Lo que se usó y por qué |
|---|---|---|---|
| 17 | Contrato de handshake de la línea | `contracts/line_handshake_protocol.md`: Evento A y Evento B por MQTT, interfaz «pendiente» | El código manda eventos de la Pi por HTTP POST (`/line/cell/events`); no hay MQTT. El contrato y la implementación no coinciden todavía |
| 18 | ADR 0006 (MQTT) | «Aceptada» | `edge/comms/mqtt_client/` está vacío: aceptada no es implementada |
| 19 | `contracts/rest_api.md` | `state` puede ser `SIN_CONEXION` | `cell_line.py` solo produce `OPERANDO` y `DETENIDA` |
| 20 | `docs/guia_arranque.md` §6 | «La Pi se prepara… no se activa» y la Pi sin GPIO | Coherente con la decisión: hay código de GPIO pero `gpiod` no se instala hasta medir con LED y multímetro |
| 21 | Direcciones de la red de la universidad | Presentes en `scripts/ver-aether.sh`, `aether-agent.env.example` y la guía | La rama `jetson-agente-limpia` las saca del repositorio; el libro **no** las publica |
| 22 | Cifras de pruebas | 264 pruebas (22 oct) y 346 (23 oct) en documentos | Ejecución real del 24 oct: 345 aprobadas y 2 fallidas (backend) y 7 aprobadas (borde) |
| 23 | `ruff` | El proyecto lo declara como herramienta de calidad | `ruff check backend tests` reporta 243 observaciones hoy (la mayoría de estilo) |
| 24 | Percepción en `main.py` | ADR 0010: visión solo detecta presencia | Ya clasifica piezas registradas con `clasificar_pieza`; defectos no |
| 25 | Cifras de la presentación | `aether-video/VERIFICACION.md` | Medidas en una laptop, no en el escenario (lo dice el propio documento) |
| 26 | Casos de la industria (capítulo 27) | — | Son conocimiento general sin fuente verificada durante la escritura; confirmar antes de citar |
