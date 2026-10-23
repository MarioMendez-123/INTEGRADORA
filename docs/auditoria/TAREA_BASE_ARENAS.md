# TAREA DE ARENA — Arquitectura de Aether (laptop + Jetson + Raspberry Pi 4)

Escribe tu respuesta en ESPAÑOL, directa, sin relleno. Eres un ingeniero que debe dejar a una sola persona (Mario) con una DECISIÓN TOMADA y un plan ejecutable mañana. No eres un asistente que opina: tu respuesta se califica por lo defendible y utilizable que es.

Cada afirmación factual que hagas debe llevar una etiqueta:
- **[CÓDIGO]** leído en el repositorio (ruta y línea).
- **[MEDIDO]** medido por Mario en su hardware (cifra real reportada).
- **[REPORTADO]** lo contó Mario o la bitácora, sin repetirse.
- **[REFERENCIA]** viene de una fuente externa (con URL). Solo es analogía si no es el mismo hardware.
- **[SUPUESTO]** no está confirmado: se usa porque es razonable y seguro.
Si algo no se probó, NO digas que funciona. Un jurado va a evaluar el proyecto y la honestidad cuenta.

El repositorio está en `C:\Users\mende\Downloads\INTEGRADORAAHORASI` (Windows). Puedes LEERLO para verificar cualquier cosa. NO lo modifiques: tu respuesta propone cambios, no los aplica.

---

## 1. Quién y qué

Mario (UTCH Sur, mecatrónica) es el único programador del proyecto integrador **Aether**. Tres equipos:
- **Laptop** (Windows 11): hoy corre TODO el backend (un solo servidor FastAPI/uvicorn, puerto 8000, `backend/main.py`, 1363 líneas), la base de datos, el LLM (Ollama, `llama3.2:1b`) y la lógica de Lumina (asistente con voz).
- **Jetson Orin Nano Super 8 GB** (en un carrito móvil de inventario): cámara USB + YOLO + todas las interfaces.
- **Raspberry Pi 4** (en una celda de manufactura: banda, fijaciones, pistón de scrap): solo la interfaz de la celda, poco consumo, mandar pulsos para detectar scrap y activar el pistón.

## 2. Lo que Mario QUIERE lograr (sus palabras, de su mensaje original)

- «Un sistema con una laptop como punto central (desde ahí se inicia y se controla todo), un Jetson en un carrito móvil de inventario (cámara + YOLO + todas las interfaces, incluida Lumina, mi asistente con voz) y una Raspberry Pi 4 en una celda de manufactura (banda, fijaciones, pistón de scrap; solo su interfaz; poco consumo; mandar pulsos para detectar scrap y activar el pistón).»
- «Todo debe verse FLUIDO. Mi sospecha, NO medida: el video no debe viajar por WiFi entre equipos.»
- «La celda tiene botón de arranque y paro propio y el carrito funciones independientes: la laptop coordina, no reemplaza.»
- «Debe ser mantenible por UNA persona, reproducible por un tercero desde mi repo sin conocer nuestras IPs, y funcionar en redes difíciles (la de la universidad, la de mi casa).»
- «Esto es lo que QUIERO, no cómo hacerlo. Si hay una forma mejor, aunque contradiga lo que ya construimos, dila.»

## 3. RESTRICCIONES DE MARIO (valen más que cualquier elegancia técnica)

- Mañana (2026-10-23) Mario se conecta al Jetson con la decisión tomada. **Cualquier cosa que no se pueda tener funcionando en un día queda fuera, o va como fase posterior claramente separada.**
- **NO quiere cambios que compliquen el arranque del servidor.** Hoy ya hay un procedimiento para arrancarlo y para lo que se muestra en el Jetson. Los únicos cambios aceptables al arranque son los que lo SIMPLIFIQUEN: un solo script, un solo comando, un acceso directo o un solo botón. **Nada de agregar brokers, orquestadores, contenedores ni frameworks nuevos si no se pagan solos en simplicidad.**
- Complejidad mínima: mantenible por UNA persona, pocas piezas distintas, optimizado de verdad pero sin sobreingeniería.
- Si la decisión final es «se queda así como está», lo que hay que hacer es MEJORAR LA GUÍA para arrancar más rápido y sin errores (y arreglar los problemas de red y de firewall que ya se vieron), no inventar arquitectura.
- Fluidez sigue siendo prioridad: no mandar video por WiFi si se puede evitar, pero sin romper la restricción anterior.
- El proyecto se muestra a un jurado: la honestidad cuenta. No afirmar que algo funciona si no se probó.
- **Regla fija de seguridad:** sin `gpiod` de Python, sin GPIO activo y sin cargas reales hasta que el equipo de Mario confirme qué está cableado. No se instala nada en los equipos como parte de esta decisión.
- Mario NO puede medir nada antes de decidir. No pidas mediciones ni le hagas preguntas: usa los hechos de abajo y los SUPUESTOS.

Orden de prioridad que se deduce del mensaje de Mario (de mayor a menor): (1) las restricciones duras de arriba (un día, arranque simple, sin piezas nuevas pesadas, seguridad, honestidad); (2) simplicidad para una persona; (3) fluidez/latencia; (4) tolerancia a caídas de red/equipo; (5) reproducibilidad por un tercero; (6) uso de recursos de la Pi y el Jetson.

---

## 4. HECHOS COMPROBADOS

### 4.1 Jetson Orin Nano Super 8 GB [MEDIDO / REPORTADO por Mario]
- Hostname `mario-desktop`, usuario `mario`. JetPack 6 / L4T R36 rev 4.7, Ubuntu 22.04, Python 3.10.12, aarch64, CUDA 12.6, cuDNN 9.3, TensorRT 10.3. Modo de energía 25 W (ID 1); MAXN_SUPER es el ID 2 y no se ha usado.
- Entorno `~/aether/backend/.venv` (con `--system-site-packages`): torch 2.5.0a0+872d972e41.nv24.08 (rueda de NVIDIA), torchvision 0.20.0a0+afc54f7, ultralytics 8.4.183 (`--no-deps`), numpy 1.26.4, OpenCV 4.8.0 del sistema (GStreamer 1.20.3). La GPU funciona. **YOLO ≈ 46 ms por inferencia con PyTorch (sin TensorRT), una sola inferencia, no son FPS sostenidos ni sirven para umbrales.**
- Cámara USB (UVC), V4L2 640x480 funciona. **No medido:** FPS con buena luz (las pruebas fueron con poca luz), exposición, efecto de las variables `*_CAMERA_BACKEND/FOURCC/WIDTH/HEIGHT` dentro del servidor con cámara real. Sin forzar V4L2, OpenCV abre por GStreamer y entrega 2304x1536.
- El backend completo corrió una vez en el Jetson (puerto 8001) como PRUEBA: `/health` ok, `/line/cell/status` ok; arranca partes de Lumina que no tienen sentido en el Jetson; Spotify avisó que el puerto 8888 estaba ocupado. Ya no corre. [REPORTADO]
- Navegadores: Chromium y Firefox como snap **no abren** (`snap-confine` roto, causa raíz sin diagnosticar). Funciona Firefox 158.0.1 del PPA de Mozilla (.deb). No hay Chrome. Firefox abre el dashboard del backend de la laptop pero **va lento por TigerVNC** (~87 % de un núcleo; renderizado por software por VNC; NO medido con monitor HDMI). [REPORTADO]
- Voz: `dashboard/robot.js` usa `SpeechRecognition`/`webkitSpeechRecognition` (línea 94). Firefox no la trae activada, así que **en el Jetson Lumina no oye** [CÓDIGO]. Se desconoce si el Jetson tendrá micrófono o bocinas.
- TigerVNC muestra el escritorio pero no copia/pega bien; los comandos se corren por SSH. Aplicaciones gráficas por SSH fallan (`DISPLAY` vacío). Procesos largos van en `tmux` (sesión `trabajo`) porque el SSH se cae. `sleep/suspend/hibernate` están enmascarados.
- Herramientas de sistema `gpiod` 1.6.3 y `libgpiod2` instaladas, el usuario está en el grupo `gpio`; `python -c "import gpiod"` falla (no instalado a propósito).
- Scripts del Jetson para el monitor: `~/modo-con-monitor.sh` y `~/modo-sin-monitor.sh` (cambian `/etc/X11/xorg.conf`).
- SSH con `~/.ssh/config` (hosts `jetson-uni`, `jetson-usb`). SSH sin contraseña: pendiente.

### 4.2 Red [MEDIDO / REPORTADO por Mario]
- WiFi «Mecatronica» de la universidad: laptop `10.4.5.52`, Jetson `10.4.5.103`: SE VEN, con una regla de firewall de Windows para TCP 8000 en perfil **Privado**. Los `python.exe` de Windows tenían reglas solo para perfil Público.
- Por cable en la universidad el Jetson cae en `10.4.7.x` (otra subred que la laptop `10.4.5.x`) y da «Connection refused»/timeouts. El ping puede estar bloqueado aunque SSH funcione.
- USB-C (RNDIS) `192.168.55.1`/`192.168.55.100`: confiable pero ocupa el cable.
- Red de casa `192.168.100.x` (laptop `.14`, Jetson `.19`, perfil Public de Windows): funcionó sin regla nueva.
- Con WiFi y cable activos a la vez en la misma red hubo desconexiones de SSH (causa sin diagnosticar).
- Sin diagnosticar: caídas de SSH, «Connection refused» por cable, `snap-confine` roto.

### 4.3 Procedimiento de arranque de HOY [CÓDIGO: URLS_Y_COMANDOS.md, COMANDOS_LINUX.md]
- Laptop (desde `backend/`): `.venv/Scripts/python -m uvicorn main:app --host 0.0.0.0 --port 8000`. Hay que permitir Python en el firewall de Windows (red privada) y buscar a mano la IP con `ipconfig`. El puerto 8000 también lo quiere `lumina-agent/server.py` (no pueden correr a la vez).
- Páginas (`dashboard/`): `index.html`, `inventory.html`, `celda.html`, `robot.html` (Lumina; «abrir en Chrome o Edge»), `dataset.html`, entre otras. El Jetson abre en Firefox `http://<IP de la laptop>:8000/...`.
- No hay descubrimiento de máquinas ni systemd propio; los servicios largos se lanzan a mano en `tmux`.

### 4.4 Código del repositorio [CÓDIGO]
- `backend/main.py`: un solo proceso con inventario/BD (`/inventory`, líneas 102-183), auto-refresh de inventario (593-613), `GET /perception/stream` (632), `GET /perception/recent-detections` (657), `GET /line/vision/stream` (670), Lumina (`/robot/ask` 985, `/robot/tts` 1227, llamadas 1128), WebSocket `/show/ws` (1259), dataset (1301), rutas de la celda con `app.include_router(cell_router)` (86), `PublicGuard` (1356) y las páginas con `app.mount("/", StaticFiles(...))` (1363). Los comentarios llaman «modo demo de escritorio» a los streams de cámara.
- **Los streams de `main.py` solo abren cámaras del PROCESO donde corre** (`CameraPublisher` con `cv2.VideoCapture(índice)`, `backend/camera_publisher.py`). Con el backend en la laptop, `/perception/stream` y `/line/vision/stream` muestran la cámara de la LAPTOP, no la del Jetson ni la de la Pi.
- `dashboard/celda.js` usa solo rutas RELATIVAS: `fetch("/line/cell/status")` (126), `/line/cell/run` (147), `/line/cell/alarms/ack` (172), `/line/cell/alarms/clear` (182), `/line/cell/session` (195, 211, 229); `celda.html:95-99` tiene un `<img id="line-vision-stream">` cuyo `src` lo pone `dashboard/line-vision.js` (`START_URL = "/line/vision/stream"`, línea 29; asigna `streamImg.src` en la línea 68). `robot.js` usa `fetch("/robot/ask")`, `/robot/tts`, `/perception/recent-detections` y un WebSocket a `${location.host}/show/ws` (línea 1031). No hay dirección base configurable.
- **CSP y CORS** (`backend/public_guard.py`): la cabecera `Content-Security-Policy` se agrega a TODAS las respuestas, restringidas o no (`security_headers`, líneas 150-163): incluye `default-src 'self'`, **`img-src 'self' data: blob:`** y **`connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com`** (líneas 45-56). Por tanto una página servida por la laptop NO puede cargar un `<img>` ni hacer `fetch` a otro origen (por ejemplo `http://<jetson>:8001/...`) sin cambiar esa política. CORS solo se concede a `https://aethermx.online`, `https://www.aethermx.online`, `http://localhost:8000` y `http://127.0.0.1:8000` (líneas 28-31). `Permissions-Policy` permite `camera=(self), microphone=(self)` solo si la petición NO está en modo restringido. `PublicGuard` bloquea por IP/host (no por identidad) `/perception`, `/line/`, `/robot`, `/dataset`, `/spotify`, `/show`, `/inventory/auto-refresh` a clientes del dominio público o IP no privada (líneas 33-43). Un `<img src>` cross-origin NO necesita CORS en el navegador (solo lo bloquea la CSP); un `fetch` cross-origin sí necesita CORS y `connect-src`.
- `backend/cell_line.py` (control de la celda, **real**): GPIO 8 (BCM) = relevador del pistón (solo si el juicio es FAIL; espera `LINE_PISTON_ESPERA_S`=3 s, enciende `LINE_PISTON_ON_S`=1 s, apaga y espera `LINE_PISTON_REGRESO_S`=2 s). GPIO 9 = relevador hacia la entrada **I4 del LOGO** (el LOGO mueve la banda y ignora el infrarrojo 5 s al ver I4). Se cambian con `LINE_GPIO_PISTON`/`LINE_GPIO_BANDA` (líneas 259-260). Sin `/dev/gpiochip0` o sin `import gpiod` los pulsos NO se fingen: la pieza queda como pulso no enviado. Se exigen `ESTABLES`=5 juicios seguidos iguales (configurable con `LINE_ESTABLES`) antes de actuar.
- `docs/hardware/datasheet-conexion-celda.md` (documento posiblemente viejo; el código manda): dice PLC con Modbus TCP :502, la Pi «no energiza el pistón», «no hay ningún hilo entre el PLC y los GPIO», y que el navegador abre la laptop, no la Pi (líneas 27, 65, 74, 82). **El ADR 0011 (BORRADOR, no decidido)** propone agentes por equipo, `PI_AGENT_URL`/`JETSON_AGENT_URL`, que la laptop reenvíe, y dice que la Pi «no controla el pistón» ni usa `gpiod`. ADR 0006 (aceptada) dice MQTT para telemetría pero no hay ni una línea de código MQTT (`edge/comms/mqtt_client/__init__.py` tiene 0 líneas; `contracts/mqtt_topics.md` dice «pendiente de definición»). Qué está cableado de verdad (GPIO directo + LOGO, o PLC por Modbus) **NO está confirmado**.
- `backend/celda_agent.py` (escrito esta semana, **nunca corrido en la Pi**): programa de la celda para la Pi (cámara + visión + pulsos + alarmas + sirve `celda.html`); NO carga Lumina, BD, torch ni ultralytics. Analiza un cuadro cada `LINE_ANALISIS_CADA_S` (0.5 s) con un solo modelo ONNX a 320 (`backend/line_model.py`, `cv2.dnn`). No reporta a la laptop (no existe esa comunicación).
- `cell_hmi.py`: cuenta de laboratorio; la contraseña ya no está en el código sino en la variable `CELDA_HMI_CLAVE`.
- La limitación de análisis redujo el CPU del procesamiento de la celda **en la laptop** de 381 % a 18 % de un núcleo [MEDIDO en la laptop, no en la Pi]. El modelo ONNX da la misma decisión PASS/FAIL que el original en 19 de 19 fotos del dataset [MEDIDO, solo imágenes del dataset de entrenamiento, ninguna negativa].
- `PASS` significa «el nombre está en `classes.txt`», no una inspección de defectos. Un FAIL falso dispara el pistón.
- Un comentario en `main.py` explica que correr el LLM (`/robot/ask`) y la percepción (YOLO) en el MISMO Jetson degradaría a ambos (exclusión mutua por recursos). El LLM está en la laptop.
- `lumina_desktop.py` (2639 líneas) usa APIs propias de Windows según el ADR 0011:39 [no re-verificado].
- Mensajes entre equipos: HOY no existe ninguno en el código (ni HTTP cliente, ni MQTT, ni WebSocket entre equipos).

### 4.5 Pendientes conocidos
No existe agente del Jetson; la `celda_agent` no sabe reportar a la laptop; ADR 0011 en borrador; contradicciones documentales; la Pi no está configurada (SO, RAM, pantalla, SSH desconocidos); `git`: nada de esta semana está subido.

---

## 5. EVIDENCIA EXTERNA (REFERENCIAS consultadas el 2026-10-22; solo se leyeron los fragmentos de búsqueda, no las páginas completas; ninguna cifra es de este hardware salvo que se diga)

- **Navegador y voz.** SpeechRecognition: Chrome/Edge/Safari/Opera sí, Firefox no; el audio se manda a un servidor y exige estar en línea (https://wiki.mozilla.org/Web_Speech_API_-_Speech_Recognition ; https://twilio.com/blog/speech-recognition-browser-web-speech-api). STT local: en Orin Nano, faster-whisper tiny.en transcribió 20 s de audio en 0.85 s (https://github.com/NVIDIA-AI-IOT/whisper_trt); una imagen Docker reporta ~3 s para 20 s con el modelo small y avisa que las ruedas de PyPI para aarch64 son solo CPU (https://hub.docker.com/r/cbinckly/speaches); Vosk es ligero y con streaming pero menos preciso (fuente tipo guía, débil: https://www.sinologic.net/?p=21859). Chromium en kiosko en Pi 4: una guía lo califica «mixto» para páginas con mucho video (https://rebeccamdeprey.com/blog/raspberry-pi-kiosk-mode); un usuario de Grafana vio la RAM subir de ~20 % a 90-95 % en uno o dos días hasta caer la pestaña (https://dietpi.com/forum/t/firefox-crashes-on-a-kiosk-raspberry-pi/20808). NO se encontró ninguna medición Qt/Tauri contra navegador mostrando video en Pi 4.
- **Windows como host.** En Modern Standby Windows limita la red en suspensión con batería; existe el ajuste «Network connectivity in Standby» (https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/modern-standby-network-connectivity). No se encontró guía de servicio de Windows para uvicorn.
- **Mensajería.** Estudio sobre TurtleBot 4: CycloneDDS mejor en Ethernet, Zenoh mejor en WiFi y 4G, MQTT comparado (https://arxiv.org/abs/2309.07496); no cubre mantenimiento por una persona. ROS 2 Humble en Pi 4 de 2 GB corriendo SLAM y Nav2: 770 MB de RAM y los cuatro núcleos muy cargados (https://forum.dexterindustries.com/t/ros-2-gopigo3-robot-humble-dave-doing-navigation/9538); frustraciones con ROS 2 para aficionados (https://discourse.ros.org/t/frustrations-with-state-of-hobby-ros-2-robotics/35900/11).
- **Video.** Anecdótico (OctoPrint): WebRTC ~450 ms con cámara USB y <200 ms con cámara de Pi; mjpg-streamer ~300 ms; WebRTC 720p ~20 % de CPU y ~85 MB (https://community.octoprint.org/t/low-latency-h264-streaming-support-w-webrtc/36996/37). Frigate: una cámara que entrega MJPEG en vez de H.264 usa bastante más CPU (https://git.laurivan.com/Mirrors/blakeblackshear.frigate/commit/5e71d95cb101cf5b6a532435e7353bca4aa4a2d0). jetson-utils ofrece salida WebRTC/RTSP con codificación por hardware vía GStreamer (https://github.com/DableUTeeF/jetson-inference/blob/master/docs/webrtc-server.md, copia no oficial); hay un reporte de caída de WebRTC en JetPack 6.2.1 (https://forums.developer.nvidia.com/t/nano-llm-studio-openvla-jetson-ai-lab-webrtc-crash-sinkpad-should-not-be-nullptr-on-jetson-orin-jetpack-6-2-r36-4-4/346570) y RTSP nativo en la rama dev (https://forums.developer.nvidia.com/t/jetson-utils-videosource-and-rtsp-with-low-latency-on-nano-is-it-possible/154042).
- **Modelos.** Orin Nano, yolov8n TensorRT FP16 ≈100 FPS solo inferencia, sin captura ni dibujo y sin versión de JetPack (https://github.com/Qengineering/YoloV8-TensorRT-Jetson_Nano); yolov5s ≈111.7 consultas/s FP16 en DeepStream 7.1 / TensorRT 10.3 (https://forums.developer.nvidia.com/t/yolov5s-model-performance-testing-benchmark/329949); repositorio con FP32/FP16/INT8 en Orin Nano 8 GB con JetPack 6.2.2, cifras no leídas (https://github.com/hokwangchoi/jetson-orin-nano-benchmarks). Pi 4: Q-engineering mantiene YOLOv8 con ncnn (tabla de FPS no leída: https://github.com/Qengineering/YoloV8-ncnn-Raspberry-Pi-4); un tutorial con OpenCV + ONNX en Pi 4 reporta ~0.9 s por inferencia, tamaño de imagen poco claro (https://towardsdatascience.com/?p=115322).
- **LLM.** Advantech estima ~17-20 tokens/s para Llama 3.2 1B y 10-12 para 3B con Ollama en Jetson, sin decir qué tarjeta (https://catalog.advantech.com/en-int/containers/llm-ollama-on-nvidia-jetson); Jetson AI Lab: 28.14 tokens/s para Llama 3.1 8B con vLLM W4A16 (https://www.jetson-ai-lab.com/models/llama3-1-8b); un blog avisa que Ollama puede quedar en CPU en Jetson (https://www.toptechboy.com/). No hay medición de llama3.2:1b en un Orin Nano 8 GB.
- **Red.** mDNS/.local es multicast y no cruza redes ni túneles (fuente débil: https://cdn.jsdelivr.net/npm/@dongtran/openclaw@2026.2.14/docs/gateway/bonjour.md); Tailscale ofrece MagicDNS y DNS dividido, y avisa que la protección de DNS rebinding de un router puede romper nombres internos (https://tailscale.com/docs/reference/faq/dns-rebinding ; ejemplo: https://caseyliss.com/2024/10/15/tailscale-example). Tailscale necesita salida a internet para el plano de control (conocimiento general, no verificado en las fuentes) y no se sabe si la red de la universidad permite túneles.
- **Arranque.** systemd con `Type=notify`, `WatchdogSec` y `Restart=` reinicia servicios colgados (https://oneuptime.com/blog/post/2026-03-02-how-to-configure-systemd-watchdog-for-service-health-checks-on-ubuntu/markdown ; https://medo64.com/posts/systemd-watchdog-for-any-service). No hay guía específica de Jetson.
- **Seguridad de la celda.** Guías y foros coinciden en que el paro de emergencia debe ser un circuito cableado independiente del PLC y del software (https://industrialmonitordirect.com/blogs/knowledgebase/plc-e-stop-design-kill-outputs-or-control-power ; https://control.com/forums/threads/44767); un fabricante de visión/códigos de barras describe un rechazador cuyo rechazo se CONFIRMA con un sensor y, si no se confirma, para la línea, con relevador de seguridad de contactos redundantes (https://jhfoster.com/sensorsintegration/wp-content/uploads/sites/4/2022/07/fail-to-safe-barcode-and-machine-vision-systems-definitions-and-tests-041720.k.pdf); patentes de rechazo en línea con relevadores de seguridad que se desenergizan si el rechazo no se detecta (https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10657775). Son fuentes secundarias; las normas (ISO 13849, IEC 60204-1) no se leyeron. Festo documenta su estación de clasificación MPS con desviador (https://www.festo.com/net/supportportal/files/10142/mps.pdf); una tesis usó una Pi 4 como núcleo de una estación de visión MPS (https://dspace.ups.edu.ec/handle/123456789/25477?locale=en).
- **Mensajes perdidos.** Patrón: entrega al-menos-una-vez con ID estable por evento y receptor idempotente (restricción UNIQUE) (https://oneuptime.com/blog/post/2026-07-22-transactional-outbox-duplicate-events/markdown); la fuente trata servicios con BD, no dispositivos de borde.

### Riesgo concreto NO probado (del código)
`cell_line.py` solo apaga los relevadores si el proceso cierra limpio (`celda.set_running(False)`). Si el proceso muere de golpe, no se sabe en qué nivel quedan las líneas GPIO 8 y 9, ni cómo arrancan los pines al encender la Pi. Latencia de decisión de la celda: ~5 análisis × 0.5 s = 2.5 s más lo que dure cada análisis, más 3 s de espera del pistón si es FAIL; se ignora la velocidad de la banda.

### Contradicciones entre las suposiciones de Mario
(a) «Solo la laptop arranca servidores» vs «la celda funciona aunque se caiga la red» y «la celda tiene su propio arranque y paro». (b) «El video no debe viajar por WiFi» vs «las interfaces son páginas servidas desde la laptop», sabiendo que con el código de hoy una página servida por la laptop pide el video a la laptop. (c) «Reproducible sin conocer nuestras IPs» vs variables de URL y reglas de firewall escritas a mano. (d) «El Jetson muestra todo, incluida Lumina, y es dueño de su YOLO» vs la nota de exclusión mutua de `main.py` para LLM + YOLO en el mismo Jetson. (e) «Mantenible por UNA persona» vs tres equipos y varias tecnologías. (f) «La Pi manda los pulsos» vs la hoja de conexión del repositorio.

---

## 6. SUPUESTOS (úsalos; puedes agregar otros, cada uno con «qué cambia si falla»)

| # | SUPUESTO (más razonable Y SEGURO) | Qué decisión cambiaría si es falso |
|---|---|---|
| S1 | El cableado de la celda NO está confirmado: ninguna salida GPIO se activa; `gpiod` de Python no se instala; la celda queda en modo «ver y anotar». | Si hay GPIO directo confirmado, se podría activar la salida en la Pi tras una prueba sin carga. Si es PLC/Modbus, los pulsos GPIO no se usan y la Pi solo escribiría un bit por Modbus. |
| S2 | La Pi 4 tiene 2 GB de RAM o más, sin acelerador (Coral/Hailo), y mañana NO se tocará (sin SO/SSH confirmados). Nada del plan de mañana depende de la Pi. | Con ≥4 GB y SSH listo, el agente de la celda podría probarse mañana. |
| S3 | La Pi NO tiene pantalla propia: su interfaz se ve desde otro equipo (laptop o Jetson) en un navegador. | Con pantalla propia, la Pi necesita su propio navegador/kiosko y cambia el costo de RAM. |
| S4 | El Jetson NO tiene micrófono ni bocina propios mañana; la voz de Lumina (entrada y salida) sigue en la laptop con Chrome. | Con micrófono en el Jetson, habría que elegir STT local (p. ej. Vosk o faster-whisper) o un puente de micrófono. |
| S5 | Mañana el Jetson se maneja por SSH (y VNC solo para ver el escritorio), con posibilidad de monitor HDMI pero sin garantía. | Con monitor HDMI estable, la fluidez de Firefox probablemente mejora y la app nativa pierde ventaja relativa. |
| S6 | La velocidad de la banda es desconocida: `LINE_ESTABLES` y `LINE_ANALISIS_CADA_S` no se afinan; los valores por defecto (5 y 0.5 s) son un punto de partida, no un valor medido. | Si la banda es rápida, la latencia de decisión de 2.5 s o más puede no alcanzar. |
| S7 | Mañana el Jetson y la laptop pueden quedar en subredes distintas si usan cable en la universidad; la ruta fiable es el WiFi «Mecatronica» en la misma subred (con la regla de firewall para TCP 8000 en perfil Privado) o USB-C RNDIS como respaldo. | Si la red cambia o bloquea, se pierde la conexión y hay que usar USB-C. |
| S8 | La laptop sigue siendo Windows 11 con `backend/.venv` y Chrome; no se cambia de sistema operativo ni se usa WSL/Docker. | — |
| S9 | En el Jetson solo hay Firefox 158 (PPA); no se instalará otro navegador con `sudo` salvo que sea indispensable (snap está roto y no se toca `snapd`). | Con un Chromium `.deb` funcional, la voz en el navegador del Jetson podría volver a considerarse. |
| S10 | No existe agente de percepción del Jetson. Cualquier agente nuevo es código sin probar en hardware; el backend completo corrió una vez en el Jetson (:8001) como prueba y arrancó partes de Lumina que no tienen sentido allí. | Si un agente mínimo ya funcionara, la opción de cada equipo con su video local costaría menos. |
| S11 | «Mañana» es una jornada de trabajo de Mario con acceso al Jetson, la laptop y su red. La Pi no está asegurada. | — |
| S12 | El jurado verá una demostración con la laptop como centro; lo no probado se declara como no probado. | — |
| S13 | El LLM (Ollama llama3.2:1b) se queda en la laptop. | Si se moviera al Jetson, chocaría con la exclusión mutua LLM + YOLO. |

---

## 7. CANDIDATAS (obligatorias en tu análisis)

Tu respuesta debe evaluar, con los hechos de arriba, AL MENOS estas opciones y compararlas de forma honesta contra las restricciones de la sección 3:
- **A. «Dejarlo prácticamente como está»**: servidor único en la laptop; el Jetson y la Pi solo muestran páginas servidas por la laptop; ajustes mínimos (guía de arranque, red, firewall).
- **B. Aplicación nativa en vez de navegador** en el Jetson (y/o la Pi) que habla con el servidor de la laptop.
- **C. La que tú propondrías como mejor** (puede ser una variante intermedia, p. ej. un `<img>` que apunta directo al equipo dueño de la cámara; o cualquier otra que respete la sección 3). Si la mejor es A o B, di cuál.
Puedes añadir más candidatas. No hay respuesta «correcta» predefinida.

Una nota para razonar bien (no es una instrucción de decisión): la vía de que una página servida por la laptop cargue un `<img src="http://<equipo>:<puerto>/stream">` directamente desde el equipo dueño de la cámara es técnicamente posible sin CORS en el navegador, pero ver los hechos de la CSP en la sección 4.4; los `fetch` entre orígenes sí necesitan CORS y `connect-src`.

## 8. LA PREGUNTA ESPECÍFICA DE ESTA ARENA

(Se añade abajo.)
