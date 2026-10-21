# Aether — URLs y comandos

Todo corre en esta laptop. Desde **otro equipo de la misma red**, cambia
`localhost` por la IP de esta laptop (la ves con `ipconfig`, "Dirección IPv4")
y permite Python en el firewall de Windows (red privada).

> El puerto **8000** es solo para uno: el backend de Aether **o** `lumina-agent`,
> no los dos a la vez.

---

## 1. Backend de Aether + dashboard — puerto 8000

**Comando** (desde la raíz del proyecto):

```bash
# Git Bash
cd backend
.venv/Scripts/python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

```powershell
# PowerShell
cd backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Páginas

| URL | Qué es |
|---|---|
| http://localhost:8000/ | Dashboard (inicio) |
| http://localhost:8000/inventory.html | Inventario declarado e historial |
| http://localhost:8000/celda.html | Celda de manufactura (estado simulado) |
| http://localhost:8000/robot.html | **Lumina**: cara, voz, cámara y llamadas (abrir en Chrome o Edge) |
| http://localhost:8000/docs | Documentación interactiva de la API (la genera FastAPI) |

### API

| Método | URL | Qué hace | Necesita |
|---|---|---|---|
| GET | http://localhost:8000/health | Revisa que el backend esté vivo | — |
| GET | http://localhost:8000/inventory | Inventario declarado (`?include_retired=true` incluye los retirados) | — |
| GET | http://localhost:8000/inventory/history | Historial del inventario | — |
| PATCH | http://localhost:8000/inventory/{identifier}/retire | Retira una entrada a mano | Contraseña de admin (`ADMIN_ACTION_PASSWORD` en `backend/.env`) |
| POST | http://localhost:8000/inventory/auto-refresh/start | Prende la actualización automática (`{"interval_seconds": 20}`) | — |
| POST | http://localhost:8000/inventory/auto-refresh/stop | La apaga | — |
| GET | http://localhost:8000/inventory/auto-refresh/status | Estado de la actualización automática | — |
| GET | http://localhost:8000/perception/stream | Video de la cámara con detección YOLO | Cámara conectada |
| GET | http://localhost:8000/perception/recent-detections | Últimas detecciones (`?limit=10`) | — |
| GET | http://localhost:8000/line/vision/stream | Video de la cámara de la línea | Cámara conectada |
| POST | http://localhost:8000/robot/ask | Pregunta a Lumina; también Spotify/apps/archivos si la frase es un comando | Ollama si no es comando |
| GET | http://localhost:8000/robot/spotify/login | Abre el navegador para autorizar Spotify (callback en :8888) | `SPOTIFY_*` en `backend/.env` |
| GET | http://localhost:8000/robot/spotify/status | Si hay sesión de Spotify y qué dispositivos ve | Token en `spotify_token.json` |
| POST | http://localhost:8000/robot/tts | Voz de Lumina con ElevenLabs (**gasta créditos**) | `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` en `backend/.env` |
| GET | http://localhost:8000/robot/contacts | Nombres de la agenda de llamadas (sin números) | `backend/contactos.json` |
| POST | http://localhost:8000/robot/call | Llamada de voz con Zavu (**gasta saldo**, máx. 3 cada 10 min) | `ZAVUDEV_API_KEY` en `backend/.env` |
| GET | http://localhost:8000/robot/call/{id} | Estado de una llamada | Zavu |
| WebSocket | ws://localhost:8000/show/ws | Canal de eventos Lumina → video en vivo | — |

**No funciona todavía:** `GET /robot/calendar` responde 503 porque faltan las
credenciales de Google Calendar.

---

## 2. Video en vivo (reproductor sincronizado con Lumina) — puerto 5055

**Comando:**

```bash
cd aether-video
npm run show                  # compila el reproductor y lo sirve
# o, sin recompilar:
node scripts/serve.mjs 5055
```

| URL | Qué es |
|---|---|
| http://localhost:5055/player/ | Reproductor; se conecta al backend de este mismo equipo (:8000). Clicker o clic para armar el audio |
| http://localhost:5055/player/?backend=IP:8000 | Igual, con el backend en otra laptop (ej. `?backend=192.168.1.50:8000`) |
| http://localhost:5055/player/?clicker=1 | **Solo clicker:** diapositivas. `→` avanza, `←` vuelve a cámara. En la demo no sigue hasta confirmar cámara EN VIVO o SIN CÁMARA. El feed sale de `:8000/perception/stream` |
| http://localhost:5055/player/?ensayo=1 | Modo ensayo: simula a Lumina, no necesita backend (también con la tecla `E`) |
| http://localhost:5055/phase0/recognition-test.html | Prueba de reconocimiento de la palabra "Lumina" con el micrófono |
| http://localhost:5055/video/aether_ensayo.mp4 | MP4 de ensayo (con voz de Lumina) |
| http://localhost:5055/video/aether_escenario.mp4 | MP4 de escenario |

Otros parámetros del reproductor: `feed=0` (sin cámara), `lead=<ms>`
(adelanta los cues), `fps=30` (si el equipo es lento).

Teclas del reproductor: `→` / `AvPág` / `Espacio` / `Enter` = clicker (también arma el video) ·
`←` / `RePág` = atrás (modo clicker) · `H` pausa/reanuda el watchdog · `E` panel de ensayo · `F` pantalla completa.

---

## 3. Remotion Studio (editar el video) — puerto 3000

**Comando:**

```bash
cd aether-video
npm run dev
```

**URL:** http://localhost:3000 (si el 3000 está ocupado, Remotion usa el
siguiente libre y lo dice en la terminal).

Composiciones: `Aether` (escenario), `AetherEnsayo`, `DemoOverlay`,
`LlamadaLumina` (pantalla de llamada).

---

## 4. Lumina sola (`lumina-agent`) — puerto 8000

Lumina separada de Aether. **Apaga antes el backend de Aether**, porque usa el
mismo puerto.

**Comando:**

```bash
cd lumina-agent
pip install -r requirements.txt   # solo la primera vez
python server.py
```

| URL | Qué es |
|---|---|
| http://localhost:8000/ | Lumina independiente (Chrome o Edge) |
| POST http://localhost:8000/lumina/ask | Pregunta a Lumina (`{"question": "..."}`) |

Solo escucha en `localhost` (no desde otros equipos). Necesita Ollama
(sección 5).

---

## 5. Ollama (el "cerebro" de Lumina) — puerto 11434

**Comando** (una terminal aparte):

```bash
ollama pull llama3.2:1b   # solo la primera vez
ollama serve
```

**URL:** http://localhost:11434 — la usan `POST /robot/ask` (sección 1) y
`POST /lumina/ask` (sección 4).

---

## Comandos sin URL

| Qué | Comando |
|---|---|
| Pruebas del backend | `backend/.venv/Scripts/python -m pytest tests/backend -q` (desde la raíz) |
| Pruebas de sincronía del video | `cd aether-video && npm test` |
| Pruebas de lumina-agent | `cd lumina-agent && python -m pytest test_lumina.py -q` |
| Renderizar los MP4 | `cd aether-video && npm run render` |
| Recompilar la pantalla de llamada | `cd aether-video && npm run call:build` |
| Recompilar las escenas del dashboard (wordmark de portada + banda de celda) | `cd aether-video && npm run web:build` |

---

## Estado de verificación (30 sep 2026)

Probado abriendo cada URL con los servidores prendidos:

- ✅ **Backend :8000:** `/`, `/inventory.html`, `/robot.html`, `/docs`,
  `/health`, `/inventory`, `/inventory/history`, `/inventory/auto-refresh/status`,
  `/perception/recent-detections`, `/robot/contacts` respondieron 200.
  `/robot/ask` contestó con Ollama (~20 s). `/show/ws` reenvió un mensaje de
  prueba. `/robot/call` y `/robot/call/{id}` se usaron con una llamada real.
- ✅ **Reproductor :5055:** `/player/`, `/player/?clicker=1`, `/player/?ensayo=1`,
  `/phase0/recognition-test.html` y los dos MP4 respondieron.
- ✅ **Remotion Studio :3000:** arrancó y respondió en ~20 s.
- ✅ **lumina-agent:** la página y `/lumina/ask` respondieron (probado en el
  puerto 8001 para no chocar con el backend).
- ✅ **Ollama :11434:** corriendo, con `llama3.2:1b` instalado.
- ⚠️ **No probado hoy:** `/perception/stream` y `/line/vision/stream`
  (necesitan la cámara), `/robot/tts` (gasta créditos de ElevenLabs; sí se usó
  en la corrida de extremo a extremo), `PATCH …/retire` y
  `auto-refresh/start|stop` (modifican datos).
- ❌ **No funciona:** `/robot/calendar` (503, faltan credenciales de Google).

IP de esta laptop en la red el 30 sep: `192.168.101.101` (puede cambiar si te
conectas a otra red; revísala con `ipconfig`).
