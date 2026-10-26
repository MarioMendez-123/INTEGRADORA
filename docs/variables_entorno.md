# Variables de entorno (tabla única)

Dónde se definen: en la **laptop**, en `backend/.env` (se carga solo y no se versiona; lo leen el servidor y el
servicio de voz). En el **Jetson**, en `~/.aether-agent.env` (plantilla: `scripts/jetson/aether-agent.env.example`). En
la **Pi**, en el entorno de `celda_agent`. **Nunca pongas secretos en el repositorio ni en el chat.**

Todas las variables nuevas se validan **al arrancar**: un valor mal escrito detiene el programa con un mensaje que
nombra la variable y dice qué se esperaba (`backend/settings.py`). Todas son opcionales salvo donde se indica, y sin
definirlas el comportamiento es el de siempre.

## Servidor de la laptop (`backend/main.py`)

| Variable | Tipo | Defecto | Si falta | Si es inválida |
|---|---|---|---|---|
| `AETHER_PERCEPTION_AGENT_URL` | URL `http(s)://host:puerto`; el host puede ser **IP o nombre** (`http://10.4.5.103:8001` o `http://mario-desktop.local:8001`) | vacía | Las páginas usan la cámara de la laptop (modo demo). El auto-refresh abre la cámara local | El servidor **no arranca** (mensaje con el nombre) |
| `AETHER_LINE_AGENT_URL` | URL | vacía | `celda.html` usa la cámara local | Igual |
| `AETHER_LAN_CIDRS` | Redes separadas por coma (`10.4.5.0/24,192.168.55.0/24`) | rangos privados y loopback | Se aceptan agentes y voz desde cualquier red privada | El servidor no arranca |
| `CELDA_HMI_CLAVE` | Texto (**secreto**) | — | Nadie inicia sesión: Arranque/Paro de la celda no responden | — |
| `CELDA_HMI_USUARIO` | Texto | `admin` | — | — |
| `ADMIN_ACTION_PASSWORD` | Texto (**secreto**) | `aether-dev` | Se usa el valor por defecto (solo para desarrollo) | — |
| `AETHER_PUBLIC_MODE` | `auto`/`public`/`local` | `auto` | Restringe lo que llega del dominio público | — |
| `OLLAMA_URL`, `OLLAMA_MODEL` | URL / texto | `http://localhost:11434/api/chat`, `llama3.2:1b` | Lumina usa Ollama local | — |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ZAVUDEV_API_KEY` | **secretos** | — | Esas funciones responden 503 | — |

## Agente de percepción (`backend/aether_agent.py`, Jetson)

| Variable | Tipo | Defecto | Notas |
|---|---|---|---|
| `AETHER_LAPTOP_URL` | URL (IP o nombre) | vacía | Sin ella el agente **no manda observaciones** (solo sirve el video) |
| `AETHER_AGENT_ID` | `[a-z0-9_-]{1,32}` | `jetson` | Va en cada observación como `source` |
| `AETHER_AGENT_CAPTURE` | `always`/`on_demand` | `always` | `on_demand`: la cámara solo se abre si alguien mira el video |
| `PERCEPTION_CAMERA_INDEX` | 0–63 | `0` | |
| `PERCEPTION_CAMERA_BACKEND/FOURCC/WIDTH/HEIGHT` | texto/entero | `v4l2`/`MJPG`/`640`/`480` | Defecto de Linux; **en Windows hay que poner `PERCEPTION_CAMERA_BACKEND=dshow`** |
| `AETHER_DETECT_MODE` | `async`/`sync` | `async` | `async`: el video no espera a YOLO |
| `AETHER_DETECT_MAX_HZ` | 0–120 | `10` | Máximo de inferencias por segundo (0 = sin tope). **Valor de diseño, no medido** |
| `YOLO_WEIGHTS` | ruta | `yolov8n.pt` | Misma variable que ya usaba el resto del backend |
| `AETHER_YOLO_IMGSZ` | 0–2048 | `0` (el del modelo) | |
| `AETHER_PIECES` | bool | `1` | Con `parts.pt` presente (`edge/perception/weights/parts.pt`), el agente corre DOS modelos: `parts.pt` identifica las piezas por su clase (sin código QR) y el detector general queda como detector de obstáculos (no entra al inventario; sale en `/status` → `obstacles`). `0` o sin `parts.pt`: un solo modelo, como antes (el log lo avisa) |
| `AETHER_PIECE_CONF` | 0.05–0.99 | `0.5` | Confianza mínima para aceptar una pieza. **Valor de arranque, no medido** |
| `AETHER_OBSTACLE_CONF` | 0.05–0.99 | `0.4` | Confianza mínima para contar un obstáculo. **No medido** |
| `AETHER_YOLO_DEVICE` | texto | vacío (automático) | p. ej. `0` para la GPU |
| `AETHER_YOLO_HALF` | bool | `0` | FP16 de PyTorch. **No se ha medido en el Jetson**; TensorRT no está implementado |
| `AETHER_JPEG_QUALITY` | 30–100 | `80` | |
| `AETHER_OUTBOX_MAX` | 10–100000 | `1000` | Cola local de observaciones; al llenarse se descartan las más viejas |
| `AETHER_OUTBOX_BATCH` / `AETHER_OUTBOX_TIMEOUT_S` | 1–100 / 0.5–30 | `50` / `3` | |
| `AETHER_OUTBOX_INTERVAL_S` | 0–10 | `1` | Junta las observaciones de ese tiempo en un solo envío (antes salía casi un POST por observación). Retraso máximo de entrega = este valor; `0` = enviar de inmediato |

## Celda de la Pi (`backend/celda_agent.py`)

| Variable | Defecto | Notas |
|---|---|---|
| `LINE_ANALISIS_CADA_S` | `0.5` (0.1–1.0) | Pausa entre análisis del modelo |
| `LINE_ESTABLES` | `5` | Análisis seguidos iguales antes de actuar. No bajar de 3 sin probar |
| `LINE_MODEL`, `LINE_IMGSZ`, `LINE_CV_THREADS` | `parts.onnx`, `320`, `3` | |
| `AETHER_LAPTOP_URL` | vacía | Sin ella no se mandan eventos de pieza |
| `AETHER_AGENT_ID` | `pi` | |
| `AETHER_CELL_STREAM_FPS` | `10` (1–30) | Cuadros por segundo del video de la celda |
| `LINE_VISION_CAMERA_*` | `0`, `v4l2`, `MJPG`, `640x480` | |
| `LINE_GPIO_PISTON`, `LINE_GPIO_BANDA` | `8`, `9` | **No se activan**: `gpiod` no está instalado hasta confirmar el cableado |
| `LINE_RELES_ACTIVO_BAJO` | `0` | `1` si la placa de relevadores enciende con el pin en bajo. Sin probar en la Pi |

## Servicio de voz de la laptop (`python -m voice.service`, desde `backend/`)

| Variable | Tipo | Defecto | Notas |
|---|---|---|---|
| `AETHER_VOICE_MODEL` | ruta (Vosk) o nombre (Whisper) | — | **Obligatoria con Vosk**: carpeta de `vosk-model-small-es` |
| `AETHER_VOICE_ENGINE` | `vosk`/`whisper` | `vosk` | `whisper` exige `pip install faster-whisper` |
| `AETHER_VOICE_SERVER` | `ws://…/voice/ws` | `ws://127.0.0.1:8000/voice/ws` | |
| `AETHER_VOICE_DEVICE` | número o nombre | micrófono por defecto | Lista: `backend\.venv\Scripts\python.exe -m sounddevice` |
| `AETHER_VOICE_START` | `on`/`off` | `on` | `off`: arranca pausado, sin abrir el micrófono |
| `AETHER_VOICE_VAD_THRESHOLD` | 1–20000 | `500` | Se calibra con `scripts/probar_voz.py --mic 8` |
| `AETHER_VOICE_ECHO_TAIL_S` | 0–10 | `0.8` | Silencio tras hablar Lumina (anti-eco) |
| `AETHER_VOICE_LOG_TEXT` | bool | `0` | `1` escribe el texto en `backend/logs/voice.log`; **el audio nunca se escribe** |
| `AETHER_VOICE_NOTIFY` | bool | `1` | Notificación de Windows al activar/pausar/apagar |
| `AETHER_VOICE_WAKE_FUZZY` | bool | `1` | Si la frase EMPIEZA con algo que suena a «Lumina» («lubina», «nómina», «luz mina», «lumínica»…), se reescribe como «lumina» antes de mandarla a las páginas. El modelo de Vosk no tiene «lumina» en su vocabulario. Riesgo de falsos positivos medido en `docs/auditoria/PALABRA_CLAVE.md`; `0` lo apaga |
| `AETHER_VOICE_WHISPER_PROMPT` | texto | vacío | Solo con `AETHER_VOICE_ENGINE=whisper`. Orienta a Whisper (p. ej. `Lumina.`). **Opt-in y sin medir**: con ruido o silencio Whisper puede escribir el prompt como si lo hubiera oído |

## Presupuesto de recursos (RNF-02) — **valores de DISEÑO, no medidos**

| Proceso | Presupuesto de diseño | Cómo se comprueba |
|---|---|---|
| Agente del Jetson | ≤ 200 % de CPU (dos núcleos) y ≤ 2 GB de RAM en promedio, con 640x480 | `GET /status` → `resources` y `scripts/probar_agente.py` en el Jetson |
| Servicio de voz (Vosk pequeño) | ≤ 25 % de un núcleo en reposo, ≤ 500 MB de RAM | `scripts/probar_voz.py --wav` (CPU y memoria) y el Administrador de tareas |
| Celda de la Pi | Ver la bitácora: la limitación de análisis bajó el CPU de 381 % a 18 % **en la laptop** | Medir en la Pi (`top`) |
| Red entre equipos | Solo JSON y texto; el video no sale del equipo de la cámara | `GET /status` → `laptop.sent_total` y el monitor de red |

**Medido hasta ahora (solo en la laptop de Mario, con la cámara web, YOLO en CPU y sin Jetson):** el agente entregó
30.0 FPS recibidos (300 cuadros en 10 s) con cámara a 30.0 FPS; inferencia 47–156 ms; CPU del agente 314–419 % de un
núcleo (YOLO en CPU de la laptop, **no representa al Jetson con GPU**). No se detectó ningún objeto en esa prueba, así
que no llegaron observaciones; el envío se probó con dobles.

## Direcciones escritas como nombre (`mario-desktop.local`) en vez de IP

Todas las variables `*_URL` aceptan un nombre de host además de una IP. La **aceptación** está probada
(`tests/backend/test_settings.py`, `test_agent_routes.py`); que el nombre **se resuelva** depende de la red y **no está
verificado**: `.local` usa mDNS (multicast), que Windows resuelve y Ubuntu con `avahi` publica, pero muchas redes de
universidad lo bloquean y ya hubo cortes con `.local` en este proyecto. Prueba antes en la laptop:
`PS> [System.Net.Dns]::GetHostAddresses('mario-desktop.local')` (hoy, con el Jetson apagado, dio «No such host is known»).
Si no resuelve, usa la IP. El servidor recuerda 60 s lo que resuelve un nombre; si el nombre no resuelve, el video se
pide igual por el nombre (en vez de por `127.0.0.1`), que dentro del Jetson tampoco sale a la red.

