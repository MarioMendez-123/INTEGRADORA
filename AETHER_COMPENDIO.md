# Aether — compendio del proyecto

Fecha de este documento: 2026-10-08. Fuente: el código y los documentos que están en este repositorio, no una versión ideal. Si algo no está implementado, aquí se dice.

No existe un módulo llamado Packet ni un módulo de amplificación de señal. Lo más cercano a “paquete” es `aether_report_package/` (el informe académico) y el payload de los eventos de la línea, que todavía no viaja por la red. Lo más cercano a amplificación es el volumen de Windows y de Spotify que Lumina sube o baja por voz. El resto de este archivo cubre HMI, Modbus, dataset, inventario, Lumina y ElevenLabs.

---

## 1. Objetivo

Aether es un proyecto integrador de 6 personas en Chihuahua, México. Presupuesto real de tiempo: unos 4 meses, unas 2 horas al día, unas 240 horas. No es una demo de un semestre para tirar: el criterio interno es un prototipo que se pueda defender frente a alguien de planta.

Hay dos piezas y las dos son alcance obligatorio:

1. **Aether Inventory.** Una unidad móvil que recorre, ve, cuenta e identifica producto, y deja un inventario declarado con historial.
2. **Línea de manufactura.** Banda transportadora con fixtures que posicionan cada pieza automotriz. Una cámara de línea decide PASS o FAIL. Si FAIL, un pistón expulsa la pieza (scrap). Si PASS, no hay golpe: Aether Inventory recoge la pieza, la transporta y registra el proceso.

El brazo KUKA KR6 y el brazo UR5 salieron del alcance el 2026-09-16. Learning from Demonstration también salió. El pistón no aprende: es un pulso fijo programado en el controlador.

Producto que se vende, en una frase: el robot revisó el anaquel y encontró tantas unidades de tal producto. No se vende el nombre del modelo de redes ni el protocolo.

---

## 2. ¿Es innovador o es tecnología que cualquier empresa puede armar?

Las piezas sueltas no son el diferenciador. YOLO, códigos de barras, ArUco, FastAPI, SQLite, MQTT, Modbus TCP, ElevenLabs, Ollama y una HMI con alarmas los vende cualquier integrador.

Lo que este proyecto se obliga a hacer, y que una demo típica no hace, es el contrato entre lo que se vio y lo que se declara:

- Una observación cruda no es el inventario. El inventario declarado es un agregado, y una inspección parcial nunca pisa en silencio el número anterior.
- Cobertura `COMPLETE` significa que la ruta de inspección terminó. No significa que se vio todo el producto físico.
- Conteo visible detectado no es conteo real de almacén.
- ArUco verifica posición. No es el sistema de navegación.
- Obstáculos: detección reactiva. No “evasión inteligente”.
- PASS de una pieza, hoy, significa “esta clase está en el dataset”. No significa “la pieza no tiene defecto”.
- La celda en pantalla dice `simulado` y lleva marca SIM mientras no haya PLC.
- Lumina no inventa cifras de sensores, no finge que Spotify ya sonó si falló, y no habla una lista de especificaciones fabricadas.

Eso es la defensa del proyecto: una línea que actúa sobre una decisión de visión y un inventario que se niega a mentir sobre lo que no vio, con el lenguaje de planta (PASS, FAIL, scrap, alarma, cobertura) en vez de un chatbot encima de una cámara.

Lo que todavía no está, y por eso no se puede vender como planta cerrada: navegación real, Jetson flasheado, PLC o microcontrolador elegido, Modbus escrito en código, pistón con timing medido, y un criterio de defecto de verdad.

---

## 3. Lumina y el dictado de ElevenLabs

Lumina es el robot móvil de Aether, hablado. Vive en `dashboard/robot.html` y `dashboard/robot.js`. El cerebro de texto está en `backend/main.py`. Las acciones de la computadora están en `backend/lumina_desktop.py`. Hay una copia mínima aparte en `lumina-agent/` que solo conversa; no es la que se usa en el proyecto.

### Cómo se dicta la voz

1. El navegador oye con `webkitSpeechRecognition` (Chrome). La palabra de atención es Lumina. También se acepta la variante “lumia” en el guion.
2. El texto llega a `POST /robot/ask`.
3. El backend resuelve en este orden, y se queda con el primero que aplique: comando de escritorio, respuesta precargada, Ollama local.
4. El texto de la respuesta sale hacia `POST /robot/tts`.
5. El backend llama a ElevenLabs: `POST https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}` con `model_id` fijo `eleven_multilingual_v2` y el campo `text`. No se mandan stability, similarity ni style: valen los defaults de esa voz.
6. La clave y el id de voz viven solo en `backend/.env` (`ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`). Si faltan o ElevenLabs no contesta, el endpoint responde 503 y `robot.js` cae a `speechSynthesis` del navegador.
7. La respuesta es un MP3 (`audio/mpeg`). El frontend lo reproduce. No se usa el archivo `lumina_audio/Lumina_guion_con_pausas.mp3` como voz en vivo.

Reglas del texto que se manda a dictar, porque si no se oye mal:

- Una o varias oraciones cerradas en español. Lo que queda a media palabra se tira.
- Ollama corre en local, modelo por defecto `llama3.2:1b`, tope `num_predict` 60. URL `http://localhost:11434/api/chat`.
- Si el modelo suelta una lista de viñetas, no se lee: se sustituye por “No tengo esa información con exactitud ahora mismo, pero con gusto hablamos de otra cosa.”
- Si el modelo cita sus propias instrucciones (“honestidad y ternura”, “instrucción”, “estoy aquí para escuchar”), esa oración se quita.
- Lumina no tiene memoria de chats anteriores en el modelo. La memoria de hechos es un archivo aparte, solo cuando se le pide recordar.
- En el Jetson real, conversar y ver con YOLO son modos excluyentes. Un solo cómputo de borde. Modo conversación apaga la cámara. Modo cámara no llama a `/robot/ask`.

Latencia medida en el ensayo de video (`aether-video/VERIFICACION.md`): del clicker a que suena “Dígame, señor.” unos 1808 ms, casi toda de ElevenLabs. Con la voz local de respaldo la mediana fue unos 56 ms.

### Guion de presentación

El show no arranca con “Lumina, inicia”. Eso abre la cámara. El show arranca con “Lumina, iniciar presentación”.

El guion está en `lumina_audio/guion.json` y los mp3 de línea en `lumina_audio/lineas/01.mp3` … `32.mp3`. Mientras corre, el reconocimiento no corta la frase. Hay esperas a oír “Lumina” (antes era un temporizador de 70.3 s que podía hablar encima del expositor). Esos eventos viajan por WebSocket `GET /show/ws` hacia el reproductor de `aether-video` (puerto 5055). El socket solo reenvía texto; no guarda nada y no tiene login.

Frases precargadas, texto exacto, antes de Ollama:

| Si se oye | Lumina dice |
|---|---|
| cómo te llamas / cuál es tu nombre | Soy Lumina, el robot móvil de Aether. Mucho gusto. |
| qué haces / para qué sirves | Detecto productos, leo códigos, y en este equipo también puedo poner Spotify, abrir programas y guardar archivos si me lo pides. |
| qué es aether | Aether es el proyecto completo: yo, más una línea de manufactura que arma piezas automotrices. |
| quién te creó / quién te hizo | Un equipo de 6 estudiantes universitarios muy dedicados, aquí en Chihuahua. |
| tienes sentimientos | Tengo expresiones que muestro con cariño, aunque no sé si eso cuenta como sentir de verdad. |
| cuántos años tienes | Nací hace pocos meses, así que todavía soy bastante nuevo en esto de existir. |
| robot de verdad | Por ahora vivo en una pantalla, pero pronto voy a tener un cuerpo móvil de verdad. |
| puedes moverte | Todavía no — estoy esperando mis motores y ruedas para recorrer un almacén de verdad. |
| qué es yolo | Es el modelo que uso para reconocer objetos con solo verlos, como unos ojos bien entrenados. |
| vas a reemplazar a los humanos | Para nada, solo quiero ayudar a contar cosas aburridas para que ustedes hagan cosas más interesantes. |
| tienes hambre | Un poco, aunque a mí me alimenta la electricidad, no la comida. |
| color favorito | Me gusta el azul violeta, es el color con el que me visto en mi interfaz. |
| eres inteligente | Soy bastante bueno detectando cosas, aunque para conversar todavía tengo mucho que aprender. |
| trabajar en una fábrica | Ese es el plan: ayudar en una línea real donde se arman piezas de auto. |
| te da miedo | Un poco la oscuridad, porque sin luz mis cámaras no ven nada. |
| spotify / reproducir música | Sí. Dime lumina reproduce y la canción, o lumina reproduce en el teléfono. |

Personalidad anclada en el prompt: percepción YOLO, códigos y ArUco ya existen; la banda, los fixtures y el pistón están planeados y todavía no existen físicamente. Si no lo sabe, lo dice. No inventa sensores, motores, cámaras, batería ni medidas.

Voz de respaldo del navegador: se puede forzar un fragmento de nombre con `localStorage.setItem('aether_voice_override', 'jorge')`.

### Lo que Lumina ya hace en la computadora

Todo esto es regex en `parse_intent`, sin tool-calling del modelo de 1B. Si la frase no es comando, intenta n8n (si hay token) y si no, Ollama.

Pide confirmación de voz (sí / no) antes de: cerrar, guardar, mover, olvidar, copiar al portapapeles, apagar o reiniciar, y llamar una herramienta de n8n.

| kind | Qué hace |
|---|---|
| stop | Para lo que esté en curso |
| confirm_yes / confirm_no | Ejecuta o cancela lo pendiente |
| help | Dice qué puede hacer |
| spotify_login | Abre el permiso de Spotify |
| spotify_play / spotify_resume | Busca canción o playlist y la manda a la PC o al teléfono |
| spotify_pause / next / prev / vol | Control de reproducción y volumen de Spotify |
| now_playing | Qué está sonando |
| open_app / close_app | Abre o cierra un programa de la lista blanca |
| open_url / search | Edge: URL o búsqueda. No hace clic dentro de la página |
| open_dir / open_path | Escritorio, Documentos, Descargas, el repo, o una ruta |
| mkdir / mkfile | Carpeta o archivo de texto en esas carpetas |
| read_file | Lee txt, y texto de docx/xlsx |
| move | Mueve un archivo a escritorio, documentos o descargas |
| compare | Compara dos archivos |
| clip_read / clip_write | Portapapeles |
| shot | Captura de pantalla |
| show_image | Muestra una imagen |
| holo | Abre proyección: aether, metano, agua o placa; puede descomponer |
| essay / essay_status | Redacta un ensayo o reporte APA con plantilla UTech y lo deja en Word |
| timer | Temporizador local |
| clock | Hora o fecha |
| zone | Hora en una ciudad |
| calc / convert | Cuenta y convierte unidades |
| wiki | Consulta breve |
| weather vía morning / pulse / status | Resumen de máquina, batería, clima en el parte de mañana |
| watch | Avisa si la batería baja de un porcentaje |
| lock | Bloquea la sesión de Windows |
| power / abort_power | Apagar o reiniciar, con confirmación; se puede abortar |
| win_vol | Volumen o mute de Windows |
| media | Pausa, siguiente o anterior del medio del sistema |
| git | Estado de git |
| remember / recall / forget | Memoria local de hechos (`lumina_memory.json`) |
| actions / undo | Bitácora de acciones y deshacer la última |
| rest / work | Modos de descanso y trabajo |
| at | Recordatorio a una hora |
| n8n_call | Herramienta del MCP de n8n (`N8N_MCP_TOKEN`, URL por defecto `maario.app.n8n.cloud`) |

Lista blanca de apps en `backend/allowlist.json`: Edge, Spotify, Bloc de notas, calculadora, explorador, Cursor, Chrome, Discord, Word, Excel, WhatsApp, configuración. Carpetas extra: el repo. No sale de Escritorio, Documentos y Descargas. No borra fuera del perfil, no manda correo, no compra, no apaga Windows sin un sí.

Llamadas: `POST /robot/call` por Zavu. Agenda en `backend/contactos.json` (fuera de git). “Lumina, llama a nombre” o “Lumina, llámame” con `LUMINA_CALL_TO`. El texto de la llamada es fijo: “Te llama Lumina, el robot del proyecto Aether.” `GET /robot/call/{message_id}` consulta el estado. `GET /robot/contacts` devuelve nombres, no números.

Calendario: `GET /robot/calendar` responde 503 si faltan credenciales y 501 si existen, porque el OAuth de Google no está escrito.

Spotify: Premium, OAuth en `http://127.0.0.1:8888/callback`. Login por `GET /spotify/login` o por voz. Token en `spotify_token.json`. Si el teléfono no tiene Spotify abierto en la misma cuenta, Lumina lo dice; no enciende el celular a distancia. El secret se filtró en un chat: hay que rotarlo.

Ensayo: plantilla `backend/plantilla_utech.docx`. `GET /robot/essay` y `POST /robot/essay/ready` para pegar en Word cuando el documento está listo.

Proyección: `dashboard/holo.html`.

`lumina-agent/` es el mismo personaje reducido: `POST /lumina/ask`, cara en el navegador, sin cámara, sin Zavu, sin ElevenLabs, sin Spotify. Si se levanta en el puerto 8000 choca con el backend de Aether.

### Lo que Lumina va a hacer y todavía no

- Cuerpo con motores y ruedas. Hoy lo dice en voz alta: vive en una pantalla.
- Ver y hablar a la vez en el Jetson. Hoy es excluyente a propósito.
- Google Calendar.
- Clics dentro de una página web. Quedó fuera de la v1.
- Navegación de almacén. No existe el módulo.

---

## 4. Inventario: qué se guarda y qué puede usar el dashboard

Dos capas. No son lo mismo.

**Observation** (crudo, en el borde, `edge/inventory_engine/observations/observation.py`): timestamp, clase detectada, dato del código, si el código se leyó, confianza, id del primer marcador ArUco o null.

**Declared Inventory** (agregado, SQLite `backend/aether.db`):

Tabla `declared_entries`, una fila por identificador:

- identifier (llave)
- detected_class
- total_observations
- code_read_count
- avg_confidence
- first_seen, last_seen
- location_counts (JSON: id de ArUco o `sin_ubicacion`)
- status: `active` o `retired`

Tabla `declared_entry_history`: los mismos campos de negocio más `recorded_at`. Cada corrida de carga agrega filas. No borra el pasado.

El retiro solo lo hace una persona: `PATCH /inventory/{identifier}/retire` con contraseña `ADMIN_ACTION_PASSWORD`. Una corrida que no vuelve a ver un producto no lo retira. No hay navegación, así que no se sabe si esa corrida vio todo el piso.

Estados de cobertura `PARTIAL`, `COMPLETE`, `INVALID` existen como enum en `edge/inventory_engine/coverage_states.py` y no tienen lógica que los consuma. La API no los expone. La UI no puede mostrar cobertura todavía.

Cadena que sí corre:

1. `edge/perception/capture_headless.py` o `test_combined.py` escribe observaciones (YOLO + código dentro de la caja + ArUco).
2. `edge/inventory_engine/aggregate_observations.py` las agrega.
3. `backend/scripts/load_from_edge.py` hace upsert y append de historial.
4. `scripts/refresh_inventory.py` encadena los tres, con el venv de edge y el de backend.
5. `backend/inventory_refresh.py` repite eso cada N segundos (típico 15–30). Se prende y se apaga desde el dashboard. No arranca solo con el servidor. Es la misma cámara de demo, no el piso completo.

Pantalla: `dashboard/inventory.html` + `app.js`. Solo lectura salvo el retiro y el auto-refresh. Polling a `GET /inventory` y `GET /inventory/history`. Sin WebSocket de inventario.

---

## 5. Dataset de piezas

Carpeta: `edge/perception/parts/`. En git solo está `classes.txt`. Fotos, etiquetas y pesos están ignorados.

Clases versionadas hoy:

- computadora1
- computadora2
- computadora3

Nombre válido: minúsculas, empieza con letra, números y `_`, hasta 64 caracteres. Ejemplo del propio código: `tornillo_m6`.

Carpetas que crea el alta: `images/` y `labels/` en `train`, `val`, `inbox`. Una de cada cinco fotos de la bandeja cae en validación según el hash del nombre, así la misma foto no cambia de conjunto.

API:

- `GET /dataset` — conteo real: clases, train, val, total, share, última fecha, totales de imágenes etiquetadas y sin etiqueta, 12 recientes, modelo activo, mAP50 y fecha de entrenamiento si el peso activo es `parts.pt`.
- `POST /dataset/classes` — agrega una clase.
- `POST /dataset/samples` — foto en base64 más cajas YOLO normalizadas (nombre, x, y, w, h). Rechaza un duplicado casi igual (media de diferencia bajo 6.0).

Pesos, misma regla en `dataset_store.py` y en `edge/perception/model_weights.py`:

- `YOLO_WEIGHTS` en el entorno gana.
- Si existe `edge/perception/weights/parts.pt`, la línea de piezas lo usa.
- Si no, `yolov8n.pt`.
- El detector del entorno (persona, silla, lo demás) no debe ser `parts.pt`, porque esas clases tapan el resto.

Entrenar no es un endpoint. Se corre a mano: `python edge/perception/train_parts.py`. Publica `parts.pt` solo si el mAP50 mejora. El reporte queda en `weights/parts_report.json`. La UI de `dashboard/dataset.html` dice ese comando; no entrena sola.

Clasificación `clasificar_pieza` (umbrales de arranque, no medidos en las tres piezas):

- Corte interno 0.25. Confianza mínima 0.50. Margen de ambigüedad 0.10.
- Sin `parts.pt`: no clasifica. La línea se queda en presencia. No inventa un PASS.
- Sin detecciones: SIN PIEZA.
- Clase desconocida, o dos clases demasiado cerca: NO ES PIEZA REAL, FAIL, `tipo_objeto` null.
- Clase conocida y clara: PIEZA REAL, PASS, `tipo_objeto` = posición en `classes.txt` empezando en 1, más confianza y nombre.

Eso no inspecciona defecto. El criterio de calidad de verdad sigue en `docs/TODO.md` como trabajo abierto.

---

## 6. HMI de la celda, Modbus y el pistón

Pantalla: `dashboard/celda.html` + `celda.js`. Cada segundo lee `GET /line/cell/status`.

Hoy ese status lo fabrica `backend/cell_simulator.py`. Siempre trae `"source": "simulado"`. Guion determinista: cuenta inspeccionadas, PASS y FAIL (fallan los múltiplos de 9 o de 13), estado de celda, razón, y si “visión” y “PLC” están vivos en el teatro. Los eventos recientes usan las mismas tres acciones del contrato: `scrap_expulsado`, `pieza_aceptada`, `fallo_actuacion`.

La HMI no alimenta esos números con el stream de visión. El video de línea es otro botón (`/line/vision/stream`). Los KPI de la celda y la cámara no están unidos.

Sesión, solo para mandar el ciclo, no para ver:

- Cuenta de laboratorio: usuario `admin`, contraseña `admin`, rol `admin`. Cookie `celda_session`, 8 horas, firma HMAC. El secreto se genera al arrancar el proceso.
- `POST /line/cell/session`, `GET`, `DELETE`.
- `POST /line/cell/run` con `{on: true|false}` arranca o para el guion.
- Alarmas en memoria del servidor (sobreviven a recargar, se pierden al reiniciar el backend). Estilo ISA-18.2: prioridad, causa, acción. Tope 30.
- Enlace PLC: espera 2 segundos antes de alarmar “Enlace PLC perdido”.
- Celda detenida levanta alarma con la razón.
- `POST /line/cell/alarms/ack` reconoce. `POST /line/cell/alarms/clear` solo el rol admin.
- El paro de emergencia no pasa por esta página. Eso es watchdog de hardware, independiente de la red. No está construido.

IEC 62443 se cita solo como disciplina de esta pantalla (quien manda el ciclo inició sesión). No es una certificación.

### Cómo se va a cablear cuando exista el PLC

Documento operativo: `docs/hardware/datasheet-conexion-celda.md` (2026-10-05). Figuras y manuales en `docs/hardware/` (`Conexion-de-la-celda.pdf`, `Manana-montaje.pdf`).

Roles:

- Cámara USB a un Raspberry Pi junto a la banda. No al PLC. No es el Jetson del robot.
- El Pi ve, lee al PLC si la pieza está en estación, y escribe el bit `rechazar` solo en FAIL. Publica video y estado. No energiza el pistón. No lee los infrarrojos por cable.
- El PLC es dueño de la banda, del pistón y de los sensores. El pulso del pistón se calibra ahí (punto de partida vacío: 150–300 ms).
- La laptop en el puerto 8000 muestra `celda.html`. Con `CELL_AGENT_URL` haría de puente HTTP al Pi en el puerto 8080. Ese agente no está en este repo: el datasheet trae un ejemplo con `pymodbus`, no un programa desplegado.
- El Jetson no es la estación de la celda.

Sensores:

- IR1, antes de la cámara: pieza quieta en el fixture. Un flanco es permiso de un frame. Entra al PLC.
- IR2, después del pistón: confirma el efecto. La tabla de verdad distingue pieza aceptada, scrap expulsado y fallo de actuación. Si no se pidió rechazo y IR2 no ve la pieza, se para y se alarma. No se inventa un PASS.

Mapa Modbus de ejemplo. La columna real está vacía hasta comprar el PLC:

| Señal | Ejemplo | Quién escribe |
|---|---|---|
| ir1_en_estacion | DI 0 | PLC |
| ir2_en_banda | DI 1 | PLC |
| rechazar | coil 10 | Pi |
| banda_marcha | coil 11 | Pi, si la banda no corre sola |
| rpi_vivo | coil 12 | Pi, latido de al menos 2 Hz |
| plc_vivo | input register 0 | PLC, contador |
| accion | holding 20 | 0, 1, 2 o 3 |
| pieza_id | holding 21 | PLC |

Red sugerida: laptop `192.168.0.10:8000`, Pi `192.168.0.20:8080`, PLC `192.168.0.30:502` Modbus TCP. Modbus por cable. Wi-Fi solo para mirar la página. Sin latido del PLC en menos de 1 s la UI pasa a `SIN_CONEXION` y el Pi no deja `rechazar` en 1. Sin latido del Pi, el PLC pone `rechazar` en 0 y no dispara el pistón.

Hay una tensión sin cerrar: la ADR 0010 pone la visión de línea en una PC fija, y el datasheet la pone en el Raspberry. Las dos están escritas. La hoja de cableado es la guía más nueva para conectar. La elección PLC contra ESP32/STM32 sigue abierta en la ADR hasta tener el aparato en la mano. Por eso `edge/manipulation/line_actuation/plc_backend/` y `mcu_backend/` son README vacíos. No hay `import pymodbus` en el código del producto.

`paho-mqtt` está en `edge/requirements.txt` y ningún `.py` lo importa. `contracts/mqtt_topics.md` dice pendiente de definición. No se inventan tópicos.

Contrato de la línea (`contracts/line_handshake_protocol.md`):

- Evento A, visión hacia el actuador: `resultado` PASS o FAIL, timestamp, `tipo_objeto` 1, 2, 3 o null, confianza 0 a 1.
- Evento B, actuador hacia la bitácora: `accion` (`scrap_expulsado`, `pieza_aceptada`, `fallo_actuacion`), timestamp, `resultado_origen`.
- El listener MQTT que guardaría eso como Observation no existe (`edge/manipulation/line_events_listener/` no está).
- `contracts/inventory_to_manipulation.schema.json` está vacío a propósito. Inventory no ordena al pistón. Solo registra.

Visión de línea hoy (`GET /line/vision/stream`, `_make_line_vision_processor`): presencia, y si hay `parts.pt` el clasificador de arriba. No emite el Evento A al actuador.

---

## 7. Percepción y navegación

Stack que sí corre en la laptop, pensado para el Jetson:

- YOLO (`ultralytics`), por defecto `yolov8n.pt`.
- Código de barras y QR con `pyzbar`, dentro de la caja de la detección.
- ArUco `DICT_4X4_50`. Generador: `edge/perception/generate_aruco_markers.py`.
- OpenCV, una sola cámara compartida por `backend/camera_publisher.py` para que el stream y el auto-refresh no peleen el dispositivo.

Scripts de prueba en `edge/perception/`: `test_camera.py`, `test_yolo.py`, `test_barcode.py`, `test_aruco.py`, `test_combined.py`, `test_detection_rate.py`. El pipeline de referencia es `test_combined.py`.

`GET /perception/stream` es la demo en el backend. Es una copia de esa lógica dentro de `main.py`, no un import de `edge/`. `GET /perception/recent-detections` devuelve el buffer (límite 1 a 50).

Navegación por waypoints, odometría de encoders y obstáculos reactivos: decisión cerrada (ADR 0003), carpeta no creada, código cero.

Cómputo previsto: NVIDIA Jetson Orin Nano Super 8 GB en el robot. Contingencia: Raspberry Pi 5 con AI HAT+. Bajo nivel de motores: ESP32 o STM32, con watchdog que corte aunque no haya red. Nada de eso está flasheado en este repo. No existe la carpeta `firmware/`.

---

## 8. Tecnologías y en qué carpeta viven

| Tecnología | Dónde |
|---|---|
| Python 3.11, dos venv | `backend/.venv`, `edge/.venv` |
| FastAPI, Uvicorn | `backend/main.py`; copia mínima en `lumina-agent/` |
| SQLAlchemy, SQLite | `backend/db/`. PostgreSQL es candidato, el driver no se instala hasta que se decida |
| OpenCV, Ultralytics, pyzbar, NumPy | `edge/perception/`, y la demo dentro de `backend/main.py` |
| PyTorch | vía Ultralytics, cuando se entrena |
| Ollama | `/robot/ask` y el ensayo |
| ElevenLabs multilingual v2 | `/robot/tts` |
| Zavu | `/robot/call` |
| Spotify Web API, OAuth en el puerto 8888 | `lumina_desktop.py` |
| n8n MCP | `lumina_desktop.py`, solo si hay token |
| Web Speech API | `dashboard/robot.js`, respaldo y micrófono |
| WebSocket | `/show/ws` |
| HTML, CSS, JS sin bundler | `dashboard/` |
| Remotion, React, TypeScript | `aether-video/` |
| Node y librería `docx` | `aether_report_package/` y el `package.json` de la raíz |
| MQTT (librería declarada) | `edge/requirements.txt`. Sin cliente |
| Modbus TCP | solo el datasheet y las figuras. Sin cliente en el producto |
| Docker | decidido en el contexto maestro. No hay Dockerfile |

Puertos de trabajo: backend y dashboard 8000, video 5055, Ollama 11434, callback Spotify 8888. Tabla viva en `URLS_Y_COMANDOS.md`.

---

## 9. API que ya responde

| Método | Ruta | Qué es |
|---|---|---|
| GET | `/health` | ok |
| GET | `/inventory` | inventario declarado. Query `include_retired` |
| PATCH | `/inventory/{id}/retire` | retira, con contraseña |
| GET | `/inventory/history` | bitácora, lo más nuevo primero |
| POST | `/inventory/auto-refresh/start` | loop. Body opcional `interval_seconds` |
| POST | `/inventory/auto-refresh/stop` | lo detiene |
| GET | `/inventory/auto-refresh/status` | activo, intervalo, última corrida, error |
| GET | `/perception/stream` | MJPEG YOLO + código + ArUco |
| GET | `/perception/recent-detections` | buffer |
| GET | `/line/vision/stream` | MJPEG de línea |
| GET | `/line/cell/status` | celda simulada más alarmas |
| POST, GET, DELETE | `/line/cell/session` | login de la HMI |
| POST | `/line/cell/run` | arranca o para el guion |
| POST | `/line/cell/alarms/ack` | reconoce |
| POST | `/line/cell/alarms/clear` | borra histórico, solo admin |
| POST | `/robot/ask` | Lumina |
| POST | `/robot/tts` | MP3 ElevenLabs |
| GET | `/robot/contacts` | nombres |
| POST | `/robot/call` | Zavu |
| GET | `/robot/call/{message_id}` | estado de la llamada |
| GET | `/robot/calendar` | 503 o 501 |
| GET | `/robot/essay` | estado del ensayo |
| POST | `/robot/essay/ready` | listo para pegar |
| GET | `/robot/spotify/status` | si hay sesión |
| GET | `/spotify/login` y `/robot/spotify/login` | OAuth |
| GET | `/dataset` | snapshot |
| POST | `/dataset/classes` | alta de clase |
| POST | `/dataset/samples` | foto y cajas |
| WS | `/show/ws` | relevo del video |

El dashboard se sirve en `/` desde la carpeta `dashboard/`. Las rutas de API ganan.

---

## 10. Decisiones cerradas y qué tan cierto es cada una en código

| ADR | Decisión | En el repo hoy |
|---|---|---|
| 0001 | YOLO + código. SKU solo visual queda para después | Parcial. Corre en demo. Umbrales de aceptación sin número |
| 0002 | ArUco verifica, no navega | Parcial. El detector existe. El error en centímetros no está medido |
| 0003 | Waypoints, encoders, obstáculo reactivo | Decidido. Sin código |
| 0004 | Jetson principal, Pi 5 de contingencia, MCU de motores y watchdog | Decidido. Sin hardware en el repo |
| 0005 | Observations contra Declared Inventory, tres coberturas | Inventario sí. Cobertura no |
| 0006 | MQTT telemetría, REST al dashboard, paro fuera de la red | REST sí. MQTT y watchdog no |
| 0007 | Dashboard opción B: inventario e historial. Opción C (telemetría viva) después, obligatoria | Opción B sí. Opción C no |
| 0008 | KUKA + UR5 | Histórica. La sustituye la 0010 |
| 0009 | Auto-refresh del inventario por polling | Sí, con la etiqueta de una sola cámara |
| 0010 | Banda, fixtures, visión, pistón en FAIL, registro pasivo | Arquitectura sí. Actuador, transporte y PASS de defecto no |

Criterios de aceptación (`docs/architecture/decisions/criterios_aceptacion.md`): la estructura está. Los porcentajes y los centímetros siguen `[PENDIENTE]`. La sección 8 de la línea no se puede marcar hasta PASS/FAIL real y una corrida con hardware. La sección 9 prohíbe colar LfD, la opción C, salir del laboratorio, o vender clasificación visual pura de SKU.

Cambiar una decisión de estas pasa por la sección 9 de `aether_context_docs.md`: fecha, motivo, ADR, y carpetas si hace falta.

---

## 11. Lo que ya hace, de punta a punta, en la laptop

- Backend y dashboard en el mismo origen, puerto 8000.
- Inventario manual, por script, o en loop, con historial y retiro.
- Stream de percepción y stream de línea.
- Dataset: alta de clases y fotos; entrenamiento aparte por consola.
- Lumina: oír, contestar, dictar con ElevenLabs o con la voz del navegador, actuar en el escritorio, llamar por Zavu, correr el guion contra el video.
- HMI de celda coherente con los nombres de los eventos, marcada como simulación.
- Pruebas: `tests/backend/` (API, dataset, refresh, cámara, HMI, simulador, escritorio) y `tests/edge/test_aggregate_observations.py`.
- Video de presentación en Remotion, sincronizado, con mediciones de fase 0 en `aether-video/phase0/`.
- Informe académico generable en `aether_report_package/` (`AETHER_Informe_Integrador`).

---

## 12. Cambios por hacer

Lista viva: `docs/TODO.md`. Nada de esto está tachado.

Se puede avanzar sin el PLC:

- Criterio real de PASS/FAIL en `_make_line_vision_processor`. Hoy es presencia, más identidad de clase si hay `parts.pt`.
- Clasificador de tipo 1, 2 y 3 con las tres piezas o sus fotos. Las clases actuales son `computadora1`, `computadora2`, `computadora3`, no tres refacciones de auto medidas.

Bloqueado por hardware:

- Cámara del robot: USB o CSI. CSI obliga a dejar `cv2.VideoCapture(0)` por GStreamer.
- PLC o ESP32/STM32.
- Interfaz real: Modbus, serial o un bit, y si hace falta relé no cotizado.
- Escribir `plc_backend/` o `mcu_backend/` después de esa elección. No antes.
- Nombre de tópico MQTT y payload final de los eventos A y B.
- Si el software arranca la banda o la banda corre sola.
- Timing del pistón contra la velocidad real.
- Flashear JetPack y comprobar que `edge/perception` corre igual ahí.

También abierto, de los documentos de arquitectura y del relevo de Lumina:

- Cobertura PARTIAL / COMPLETE / INVALID en la carga y en la UI.
- Opción C: batería, posición y tarea del robot por MQTT hacia WebSocket.
- `contracts/mqtt_topics.md` y `contracts/rest_api.md` al día con la opción C solo documentada.
- `edge/comms/`, `edge/navigation/`, `firmware/`: no existen.
- Google Calendar.
- Cerrar Spotify en una prueba real (autorizar, reproducir, teléfono, pausa, siguiente) y rotar el secret.
- Umbrales numéricos de los criterios de aceptación, después de corridas reales.
- Reconciliar PC fija contra Raspberry para la visión de línea.
- MP4 de ensayo (`aether_ensayo.mp4`) no está en el repo. Se renderiza solo si se pide.
- No hay Docker aunque el contexto maestro lo nombra.

Hitos ya escritos en `docs/CHANGELOG.md`:

- 2026-09-16: se eliminan KUKA, UR5, `arm_control/`, `lfd/`, `task_planning/`. Entra la banda y el pistón.
- 2026-09-30: loader del dashboard, sección de pieza por pieza, movimiento, arreglo del botón de visión de línea que chocaba con el script de la cámara.

Relevo de UI del 2026-10-01: `HANDOFF_LUMINA.md`. Decisiones que no hay que reabrir: Lumina es la de `robot.html`, música es Spotify Premium, el show solo con “iniciar presentación”, sin tool-calling del modelo chico, sin clics dentro del navegador.

---

## 13. Mapa de carpetas

Producto:

| Carpeta | Qué hay |
|---|---|
| `backend/` | API, SQLite, simulador de celda, HMI de alarmas, Lumina, dataset, publicador de cámara, refresh |
| `dashboard/` | `index.html` portada, `inventory.html`, `celda.html`, `robot.html`, `dataset.html`, `holo.html`, y los JS de cada una (cámara, línea, pasillo 3D, modelo, llamada, movimiento) |
| `edge/perception/` | YOLO, códigos, ArUco, entrenamiento, `parts/classes.txt` |
| `edge/inventory_engine/` | Observation, agregado, estados de cobertura sin uso |
| `edge/manipulation/line_actuation/` | README. `plc_backend/` y `mcu_backend/` vacíos |
| `contracts/` | REST, handshake, MQTT pendiente, schema vacío |
| `docs/architecture/decisions/` | ADR 0001 a 0010 y criterios |
| `docs/academic/` | `AI_CONTEXT.md` superado, y la arquitectura ideal vieja del brazo |
| `docs/hardware/` | Datasheet, PDF de conexión y de montaje, figuras |
| `scripts/` | `refresh_inventory.py` |
| `tests/` | backend y edge |
| `lumina-agent/` | Lumina sola, sin el resto de Aether |
| `lumina_audio/` | Guion y mp3 de las 32 líneas |
| `aether-video/` | Presentación Remotion, reproductor, mediciones de latencia |
| `aether_report_package/` | Informe ACA en docx/pdf |
| `.interface-design/` | Tokens de la UI |

Raíz que importa: `aether_context_docs.md` (contexto maestro), `CLAUDE.md` (puntero), `URLS_Y_COMANDOS.md`, `HANDOFF_LUMINA.md`, `ActFinal.md`, `baseline_aether.md`, `docs/TODO.md`, `docs/CHANGELOG.md`, videos `Aether_Final.mp4`, `Aether_Preview.mp4`, `Aether_Logo_Reveal.mp4`.

No son el producto: `.claude/skills/` y `.agents/skills/` (animaciones, diseño, Zavu, Vercel, y el resto de habilidades de las herramientas). No corren en la planta.

No existen, y no hay que inventarlas hasta que una decisión las pida: `firmware/`, `hardware/` en la raíz (el hardware documentado está en `docs/hardware/`), `edge/navigation/`, `edge/comms/mqtt_client/`, `edge/manipulation/line_events_listener/`, `simulation/`.

---

## 14. Cómo no mentir con este proyecto

- El simulador no es la celda.
- Presencia de una pieza no es pieza mala, y no dispara el pistón.
- PASS de clase no es pieza buena de calidad.
- Auto-refresh no es cobertura de almacén.
- Lumina en la laptop no es el robot móvil terminado.
- Modbus está diseñado en una hoja. No está programado.
- El diferenciador es la trazabilidad honesta más la actuación física de una línea simple. Las librerías, por separado, las tiene cualquiera.
