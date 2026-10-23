# Contratos de los agentes de campo y del canal de voz (versión 1)

Estado: **implementado en la rama `jetson-agente`; NO probado en hardware real.** Los modelos están en
`backend/agent_contracts.py` (pydantic) y es la única fuente de verdad: si este documento y el código
difieren, manda el código. Todos los mensajes llevan `"v": 1`; un receptor rechaza versiones que no conoce.

Alcance de seguridad: estos endpoints no llevan autenticación. Solo son para la red local configurada
(`AETHER_LAN_CIDRS`), nunca expuestos a internet. Ver la ADR 0012, sección «Modelo de amenazas».

## 1. Agente de campo (Jetson: percepción, puerto 8001; Pi: celda, puerto 8000)

### `GET /health`
```json
{"status": "ok", "error": null}
```
`status` es `"ok"` o `"error"`. Si es `"error"`, `error` trae el motivo en texto.

### `GET /status`
```json
{
  "v": 1,
  "agent_id": "jetson",
  "role": "perception",
  "state": "running",
  "started_at": "2026-10-23T15:00:00+00:00",
  "error": null,
  "camera": {"open": true, "fps_camera": 29.8, "fps_delivery": 27.1, "width": 640, "height": 480},
  "inference": {"model": "yolov8n.pt", "mode": "async", "ms_last": 46.0, "ms_avg": 48.2, "every_n_frames": null},
  "laptop": {"url": "http://10.4.5.52:8000", "reachable": true, "outbox_len": 0,
             "sent_total": 120, "dropped_total": 0, "last_error": null},
  "resources": {"rss_mb": 1480.2, "cpu_pct": 142.0}
}
```
- `state`: `starting` | `running` | `error` | `stopped`.
- `fps_camera`: cuadros por segundo que entrega el hardware (lectura de la cámara). `fps_delivery`: cuadros por
  segundo que salen ya anotados por `/stream`. `ms_last`/`ms_avg`: tiempo de inferencia. Los tres son
  independientes a propósito. Cualquiera puede ser `null` mientras no haya datos. **Ninguna cifra se afirma
  sin haberla leído de este endpoint en el equipo real.**
- `laptop`: estado del envío de observaciones (`url` es `null` si no hay laptop configurada).
- `resources`: memoria (RSS, solo en Linux) y CPU del propio proceso desde la última consulta (100 % = un núcleo).
  Es lo que permite comparar con el presupuesto de `docs/variables_entorno.md`.

### `GET /stream`
MJPEG (`multipart/x-mixed-replace; boundary=frame`), video anotado. **El video no pasa por la laptop.**
`503` con el motivo si la cámara no abre.

## 2. Observación

```json
{
  "v": 1,
  "event_id": "3f2a9c1e5b7d4e6f8a0b1c2d3e4f5a6b",
  "timestamp": "2026-10-23T15:00:01.123456+00:00",
  "source": "jetson",
  "detected_class": "bottle",
  "code_data": null,
  "code_read": false,
  "confidence": 0.87,
  "location_marker_id": 4
}
```
- `event_id`: 8 a 64 caracteres `[A-Za-z0-9_-]`, **estable por evento** (un reintento lleva el mismo). La laptop lo
  usa para ser idempotente.
- `timestamp`: UTC con zona (`+00:00`). `source`: equipo de origen, `[a-z0-9_-]` hasta 32.
- `detected_class` ≤ 64, `code_data` ≤ 256, `confidence` en [0, 1], `location_marker_id` entero ≥ 0 o `null`.
- Es el mismo esquema de campos que `edge/inventory_engine/observations/observation.py`, más `v`, `event_id` y
  `source`.

## 3. Entrega de observaciones (agente → laptop)

### `POST /perception/observations` (laptop, puerto 8000)
```json
{"v": 1, "source": "jetson", "observations": [ <Observation>, ... ]}
```
Máximo 100 observaciones y 64 KB por petición. Respuesta `200`:
```json
{"accepted": 3, "duplicates": 1}
```
- Entrega **al menos una vez**: el agente reintenta hasta recibir `200`. La laptop descarta los `event_id` ya
  vistos (memoria acotada de los últimos 20 000) y cuenta `duplicates`.
- Errores: `403` si el cliente no está en la red local configurada, `413` si pasa de 64 KB, `422` si no valida.
- Límite conocido: el registro de duplicados vive en memoria; si la laptop se reinicia, un reintento antiguo
  puede contarse otra vez.

## 4. Configuración que leen las páginas

### `GET /config/agents` (laptop)
```json
{"v": 1, "perception": {"stream_url": "http://127.0.0.1:8001/stream"}, "line_vision": {"stream_url": null}}
```
- `stream_url` es `null` si no hay agente configurado: la página usa la cámara local como siempre.
- **Sustitución por equipo:** si quien pregunta es el mismo equipo que el agente (misma IP), la URL se devuelve
  con `127.0.0.1`, para que el video no salga de ese equipo. Si pregunta otro equipo, lleva la IP real del agente.
- `/config/*` está cerrado para el dominio público (no debe filtrar IP internas).

## 5. Canal de voz (WebSocket `/voice/ws`, laptop)

Conexión: `ws://<laptop>:8000/voice/ws?role=service` (servicio de voz) o `?role=listener` (página de Lumina).
Un navegador solo conecta si su `Origin` tiene el mismo host que el servidor. Máximo 8 conexiones, 2 KB por mensaje.

| Dirección | Mensaje | Campos |
|---|---|---|
| servicio → páginas | `{"v":1,"type":"transcript","text":"…","t":"<UTC ISO>"}` | `text` 1 a 500 caracteres, solo texto final |
| servicio → páginas | `{"v":1,"type":"status","state":"active"\|"paused"\|"off","t":"<UTC ISO>"}` | estado del micrófono |
| página → servicio | `{"v":1,"type":"speaking","value":true\|false}` | Lumina empieza o deja de hablar |

El hub guarda el último `status` y el último `speaking` y los entrega al que se conecta después. **Nunca viaja
audio**: solo texto y estados.

## 6. Estado y eventos de la celda (Pi → laptop)

Mismo patrón: la Pi sirve su video y su `celda.html`; la laptop solo recibe datos.
- `GET /status` con `role: "cell"` (campos de la sección 1; `inference` describe el detector ONNX).
- `POST /line/cell/events` (laptop): `{"v":1,"source":"pi","events":[{"v":1,"event_id":"…","timestamp":"…","pieza":12,"juicio":"FAIL","accion":"expulsada"}]}`.
  Mismas reglas de idempotencia, tamaño y red local. Solo se anotan: **no activa nada** ni cambia GPIO.
- `GET /line/cell/events/recent?limit=20` (laptop): los últimos eventos anotados, más recientes primero (solo red local).
- La Pi sirve el video en `GET /stream` (contrato) y en `GET /line/vision/stream` (la ruta que ya usa `celda.html`).
- `event_id` de la celda: `<AETHER_AGENT_ID>-<sello de 8 hex del arranque>-<número de pieza>`; el sello evita que la
  numeración de piezas, que reinicia con el proceso, repita un ID.
