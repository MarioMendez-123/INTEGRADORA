# ADR 0012 — Cámara en su equipo, micrófono de la laptop y arranque simple (PROPUESTA)

**Estado:** **Propuesta, implementada en la rama `jetson-agente`, NO probada en hardware.** Mario la acepta o
la rechaza; mientras no la acepte no cambia las ADR 0001 a 0010. Concreta y, donde se indica, **reemplaza** partes
del borrador ADR 0011 (que sigue sin decidirse). Cuando se acepte, se registra en la sección 9 del documento
maestro (`aether_context_docs.md`).

**Origen:** la decisión previa «dejarlo como está, reforzado» (`docs/auditoria/DECISION_Y_PLAN_MANANA.md`) dejaba
la cámara del Jetson para una «etapa 2». Mario la rechazó: ver la cámara del Jetson en la página **es** el objetivo.

## Contexto (hechos; etiquetas como en `docs/auditoria/TAREA_BASE_ARENAS.md`)

- **[CÓDIGO]** Hoy `backend/main.py` abre la cámara del proceso donde corre; con el servidor en la laptop, la página
  ve la cámara de la laptop. La percepción (YOLO + pyzbar + ArUco) está dentro de `main.py` y sus observaciones
  viajan por funciones del mismo proceso (`_perception_observation_sinks`).
- **[CÓDIGO]** `public_guard.py` pone `img-src 'self'` a todas las respuestas: un `<img>` a otro equipo se bloquea.
- **[CÓDIGO]** `robot.js` usa `SpeechRecognition` del navegador; Firefox (el único navegador que corre en el Jetson)
  no la trae [REPORTADO]. `/show/ws` ya existe y es un relevo sin autenticar.
- **[MEDIDO]** Jetson: YOLO ≈ 46 ms por inferencia (una sola, PyTorch); cámara USB V4L2 640x480 MJPG funciona. FPS
  sostenidos, luz y Firefox con HDMI: **no medidos**.

## Decisión

1. **Un agente en el Jetson** (`backend/aether_agent.py`, FastAPI, puerto 8001) abre la cámara del Jetson, corre la
   percepción y sirve el video anotado (`/stream`). El **video no sale del Jetson** hacia la laptop.
2. **El agente envía a la laptop solo observaciones JSON** (`POST /perception/observations`), con `event_id` estable,
   entrega al menos una vez con cola local acotada y reintento con backoff; la laptop es idempotente.
3. **Las páginas leen una dirección base** (`GET /config/agents`). Sin agente configurado usan la cámara local,
   como hoy. Si quien pregunta es el mismo equipo que el agente, la URL sale con `127.0.0.1`: el video queda local.
4. **La CSP se amplía lo mínimo**: `img-src` suma solo los orígenes de los agentes configurados.
5. **Servicio de voz de la laptop** (`backend/voice/`, proceso aparte): micrófono → detección de voz → reconocedor
   local en español → **solo texto final** por WebSocket (`/voice/ws`) hacia las páginas de Lumina. No necesita ninguna
   página abierta en la laptop. Aviso persistente en la consola de PowerShell y notificación de Windows al arrancar y
   detenerse. Interruptor de privacidad y anti-eco.
6. **Arranque:** `iniciar_aether.ps1` (laptop: comprobaciones + servidor + servicio de voz) y
   `scripts/jetson/iniciar-agente.sh` (Jetson, en `tmux`; se puede lanzar por SSH desde la laptop).
7. **La Pi sigue el mismo patrón** (RF-09): `celda_agent.py` sirve su video, expone `/status` y manda eventos con
   `event_id` a la laptop. **Sin GPIO**: no se instala `gpiod` ni se acciona nada.

Los contratos exactos están en `contracts/agents_api.md`; las variables en `docs/variables_entorno.md`.

### Percepción desacoplada para apuntar a ≥ 30 FPS de video (objetivo de diseño, NO medido)

`AgentCameraPublisher` (`backend/agent_camera.py`) lee la cámara en un hilo propio al ritmo que entregue el
hardware y deja solo el cuadro más reciente (descarta los viejos: no se acumulan). Otro hilo anota y codifica a JPEG.
La detección corre en un tercer hilo (`AsyncDetector`) sobre el último cuadro libre; el video se dibuja con las cajas
del **último resultado**. Así un YOLO de ~46 ms no frena el video. `/status` reporta por separado FPS de cámara, FPS
de entrega y tiempo de inferencia. TensorRT FP16 **no** se implementa: no se puede sostener ni documentar sin
medir en el Jetson; queda la opción `AETHER_YOLO_HALF` (FP16 de PyTorch, apagada por defecto).

### Motor de voz: Vosk por defecto, adaptador intercambiable

| Criterio | Vosk (modelo pequeño es) | faster-whisper (tiny/base, int8, CPU) |
|---|---|---|
| Precisión esperada en español | Aceptable en voz clara; peor con ruido y sin puntuación [REFERENCIA débil: sinologic.net/?p=21859] | Mejor en general [REFERENCIA: NVIDIA whisper_trt compara variantes] |
| Latencia | Transmisión continua: resultado final al cortar el silencio | Por segmentos: hay que cortar la frase antes de decodificar |
| CPU/RAM | Baja | Mayor, crece con el modelo |
| Descarga | ≈ decenas de MB (**tamaño aproximado, no verificado**) | ≈ decenas a cientos de MB según modelo (**no verificado**) |
| Instalación en Windows | `pip install vosk` (rueda disponible) + modelo | `pip install faster-whisper` + descarga del modelo |

**Elección:** Vosk por defecto, porque es la más ligera y de transmisión continua, y el criterio de Mario es
complejidad mínima. **Nada de esto está medido**: `scripts/probar_voz.py` mide latencia y consumo con tu micrófono
y decide con datos. El motor es un adaptador (`backend/voice/engine.py`); cambiar a faster-whisper es una variable.

## Alternativas descartadas

- **Dejarlo como está / etapa 2 para la cámara:** rechazada por Mario (no cumple el objetivo).
- **Video Jetson → laptop → página:** rechazada: es exactamente lo que se quiere evitar (video por WiFi).
- **WebRTC / RTSP / DeepStream:** más piezas y reportes de fallas en JetPack 6.2.1 [REFERENCIA]; MJPEG local basta.
- **MQTT, ROS 2, Docker, Tailscale, app nativa:** fuera de alcance por instrucción de Mario.
- **Voz dentro del servidor `uvicorn`:** descartada: un reconocedor consume CPU y bloquearía el servidor.
- **`systemd` en el Jetson ahora:** descartado: `tmux` ya es el procedimiento y agregar `systemd` es otra pieza que
  mantener. Se reconsidera cuando el agente se pruebe estable.
- **Persistir los `event_id` en disco en la laptop:** descartado por ahora (un reinicio puede contar una observación
  repetida dos veces; se documenta).

## Modelo de amenazas (un párrafo)

El repositorio es público, la red de la universidad es compartida y el backend no tiene usuarios (contraseña de admin
por defecto `aether-dev`; `/show/ws` sin autenticar). Cualquier equipo de la subred puede intentar hablarle a los
endpoints nuevos. Por eso: solo aceptan clientes de `AETHER_LAN_CIDRS` (por defecto rangos privados), validan cada
campo con límites de tamaño y no ejecutan nada de lo recibido; el WebSocket de voz exige `Origin` del mismo host para
navegadores; `/config` y `/voice` están cerrados al dominio público; el firewall de Windows abre el 8000 **solo en
perfil Privado**; no hay secretos en el repositorio ni audio en disco o logs. Aun así un atacante en la subred
podría inyectar observaciones falsas o texto a Lumina: **no hay autenticación**, y se acepta como riesgo de
laboratorio. Un jurado debe oírlo así.

## Supuestos y qué cambia si fallan

| Supuesto | Si falla |
|---|---|
| El Jetson y la laptop están en la misma subred (WiFi «Mecatronica» o USB-C) | El agente no entrega observaciones (se acumulan en la cola acotada y se descartan las más viejas); la página igual ve el video si el navegador del Jetson llega al agente por `127.0.0.1` |
| La cámara del Jetson entrega ≥ 30 FPS con luz | `fps_camera` lo dirá; con poca luz la cámara baja sola sus FPS (`exposure_dynamic_framerate`) y el video también |
| Vosk reconoce suficientemente bien el español de Mario | Cambiar `AETHER_VOICE_ENGINE=whisper` tras instalar `faster-whisper` |
| El micrófono de la laptop sirve a la distancia de uso | Ajustar `AETHER_VOICE_VAD_THRESHOLD` o usar otro dispositivo (`AETHER_VOICE_DEVICE`) |
| Firefox en el Jetson aguanta MJPEG a 640x480 | Medir con HDMI; si no, ver el video desde otro equipo (no cambia el diseño) |
| El eco de Lumina se evita con pausa + `speaking` | Subir `AETHER_VOICE_ECHO_TAIL_S`; con audífonos desaparece |

## Riesgos principales (probabilidad / impacto / mitigación)

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Windows suspende la red o la laptop | Media | Alto | Plan de energía en «nunca suspender» mientras corra el servidor (documentado) |
| La red de la universidad bloquea el tráfico entre equipos | Media | Alto | USB-C RNDIS como respaldo (`192.168.55.x`) |
| Eco: Lumina se oye a sí misma | Media | Medio | Pausa por `speaking` + cola `ECHO_TAIL`; audífonos |
| El reconocedor consume demasiado CPU en la laptop | Baja/Media | Medio | Motor ligero por defecto; `probar_voz.py` mide antes de confiar |
| FPS limitados por la cámara con poca luz | Alta | Medio | Se reporta por separado; no es culpa del agente |
| Firefox lento en el Jetson | Media | Medio | Medir con HDMI; el diseño no depende de ello |
| Observación falsa inyectada por un equipo de la subred | Baja | Medio | Solo red local; sin autenticación (aceptado y documentado) |

## Lo que esta ADR NO decide

GPIO, cableado de la celda, Lumina Desktop/Spotify/llamadas, la lógica del inventario, `systemd`, TensorRT.
