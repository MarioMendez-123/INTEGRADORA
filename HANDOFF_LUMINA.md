# Relevo — Lumina escritorio, Spotify y el resto de la UI

Documento para que **otro chat** siga el trabajo. Cargar también
[`aether_context_docs.md`](./aether_context_docs.md) (obligatorio) y
[`URLS_Y_COMANDOS.md`](./URLS_Y_COMANDOS.md).

**Usuario:** Aprendiendo. Habla en español. Prefiere lo más simple que funcione.
**No commitear** `backend/.env` ni `backend/spotify_token.json`.
**No pegar** Client Secret ni API keys en el chat ni en este archivo.

---

## 1. Dónde estaba la sesión (2026-10-01)

### Hecho y en el disco

| Área | Qué quedó | Archivos |
|---|---|---|
| Celda HMI | Solo cámara + datos. Sin mímico/simulación 3D. Alarmas ISA-18.2 (reconocer). Cuadrícula, PNG, KPIs, tendencia. Tags SIM porque el PLC no existe. | `dashboard/celda.html`, `celda.js`, `style.css` |
| Portada | Pasillo CSS 3D al hacer scroll (habitación). Nav se esconde al bajar. | `dashboard/index.html`, `corridor.js`, `motion.js`, `style.css` |
| Robot (cara) | Cian + halo violeta del sistema. Subtítulos grandes al centro. Reloj más chico. Sigue negra hasta voz. Sin loader. | `dashboard/robot.css`, `robot.html` |
| Video clicker | `?clicker=1`: diapositivas con mando. → avanza, ← atrás (si ya pasaste la demo, salta a cámara). En cámara no sigue hasta confirmar EN VIVO o SIN CÁMARA. Feed real: `GET /perception/stream`. | `aether-video/player/main.tsx` (hay que `npm run player:build` si se toca) |
| Lumina escritorio | Comandos **sin LLM** (regex). Spotify, abrir apps, Edge, carpetas/archivos. Confirmación de voz en lo delicado. Mismo agente: el guion **solo** con «Lumina, iniciar presentación». «Lumina, inicia» = cámara. | `backend/lumina_desktop.py`, `backend/main.py`, `dashboard/robot.js` |

### A medias / bloqueado

1. **OAuth de Spotify no está cerrado.** El usuario dijo «autoriza Spotify», el backend viejo respondía 404 en `/robot/spotify/login`. Se reinició el backend **con** `backend/.venv`. Login ahora es `307` a Spotify. El usuario tiene que pulsar **Agree** en el navegador. Hasta entonces `GET /robot/spotify/status` → `{"authorized":false}`.
2. El Client Secret se pegó en un chat. Pedir que lo **rote** en el dashboard de Spotify cuando pueda.
3. El primer intento de levantar uvicorn usó el Python del sistema (`pythoncore-3.11-64`) y falló (`No module named 'sqlalchemy'`). El que sí corre es `backend/.venv\Scripts\python.exe`.

### Servidor al cierre de la sesión

```
backend/.venv/Scripts/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

desde `backend/`. Callback de Spotify: hilo en `http://127.0.0.1:8888/callback` (URI ya registrada en su app de Spotify).

---

## 2. Decisiones que el usuario ya tomó (no repreguntar)

- Asistente = **Lumina de Aether** (`robot.html`), no un proyecto aparte.
- Música = **Spotify Premium**. App de escritorio instalada aquí; a veces se cierra al apagar la PC → hay que relanzarla (`spotify:`).
- Quiere poder sonar **en el teléfono** si lo pide. El celular tiene que tener Spotify **abierto** y la misma cuenta (Connect). No se puede encender el teléfono a distancia: si no hay device, decirlo con honestidad.
- Palabra: **Lumina**. El show solo con «iniciar presentación».
- Ollama ya está; **no** tool-calling con `llama3.2:1b`. Router de intenciones (lo que hay).
- Abrir **cualquier app** del menú Inicio / Edge / moverse en el navegador = por ahora **abrir URL y buscar**. No clics dentro de la página (Computer Use queda fuera de v1).
- Guardar archivos/carpetas en Escritorio / Documentos / Descargas.
- Confirmación de voz para lo delicado: hoy **cerrar app** y **guardar archivo**. El resto corre directo.

Redirect URI que él registró: `http://127.0.0.1:8888/callback`.
Client ID está en `backend/.env` como `SPOTIFY_CLIENT_ID`. Secret también, **no lo copies aquí**.

---

## 3. Cómo funciona hoy

### Voz → acción

`dashboard/robot.js` → `POST /robot/ask` `{question}`.

`backend/main.py` llama **primero** `handle_desktop(question)`. Si no es comando, precargadas, luego Ollama.

Confirmación: `handle_desktop` deja `PENDING` y responde `{answer, pending: true}`. El siguiente «sí» / «no» (con o sin «Lumina») ejecuta o cancela. El frontend no necesita lógica extra.

### Spotify

- Login HTTP: `GET /spotify/login` o `GET /robot/spotify/login` → redirect a accounts.spotify.com.
- Login por voz: «Lumina, autoriza Spotify» abre el navegador.
- Al arrancar el backend, `start_callback_server()` escucha `:8888`.
- Token: `backend/spotify_token.json` (gitignored).
- Play: busca track o playlist, transfiere al device PC o Smartphone, lanza la app de escritorio si no hay devices de PC.

### Clicker del video

`http://localhost:5055/player/?clicker=1`

Tras editar `aether-video/player/main.tsx`:

```
cd aether-video
npm run player:build
```

El estático de `:5055` lee `player/dist/player.js` en cada request.

### Honestidad (no negociable)

- Datos de celda simulados llevan **SIM**.
- Lumina no finge que ya reprodujo si Spotify falló.
- El modo escritorio **no** es «Aether Inventory inteligente». En el show no se vende como eso.
- Cámara del robot / percepción: si no hay dispositivo, 503 u OBS virtual. No inventar detecciones.

---

## 4. Mejoras planeadas (prioridad)

Hacerlas en este orden, lo más corto que funcione.

### P0 — Cerrar Spotify

1. Usuario acepta el permiso. Comprobar `GET /robot/spotify/status` → `authorized: true` y lista de devices.
2. Probar: «reproduce [canción]», «en el teléfono», pausa, siguiente.
3. Si el callback 8888 está ocupado, el log avisa; no pelear el puerto.
4. Rotar el secret de Spotify (se filtró en chat).

### P1 — Escritorio usable de verdad

- Relanzar Spotify al arrancar Windows o al primer «reproduce» (ya se intenta `spotify:`; endurecer espera/reintento).
- Lista blanca opcional de apps si «cualquier app» se vuelve peligroso; hoy busca `.lnk` del menú Inicio + alias (`edge`, `cursor`, `calc`…).
- Edge: pestaña nueva, URL, búsqueda Bing. **No** Playwright/CDP en v1.
- Archivos: crear carpeta en escritorio (sin confirm); guardar/cerrar **con** confirm. No salir de Desktop/Documents/Downloads. Nada de `..`.
- «Lumina, iniciar presentación» desde conversación ya arranca el guion; no romper eso.

### P2 — Asistente general (lo que pidió, sin inflarlo)

Router de intenciones, no un agente que ejecute shell libre.

Siguientes herramientas, cada una con confirmación si es delicada:

- Temporizador / alarma local.
- Abrir carpeta del repo o un path que él liste.
- Pegar/dictar texto a un `.txt` en Escritorio.
- Volumen y mute de Windows (además del de Spotify).
- Un `backend/allowlist.json` (gitignored o curado) con apps y carpetas permitidas.

**No hacer en v1:** control por capturas de pantalla, keylogger, borrar fuera del perfil, enviar correo, compras, apagar Windows sin confirm explícita.

### P3 — UI que ya se tocó y sigue abierta

- Verificar el pasillo 3D de la portada a mitad y al final del scroll (el screenshot a veces caché/loader).
- Cámara del robot: no hay cámara física; no fingir stream. El player clicker ya obliga a confirmar EN VIVO o SIN CÁMARA.
- MP4 de ensayo (`aether_ensayo.mp4`) **no está** en el repo. Renderizar solo si lo pide (`npm run render` en `aether-video`, tarda).
- `.interface-design/system.md`: celda sin mímico, corridor, cara cian — mantenerlo al día si se cambia otra vez la UI.
- No abrir `robot.html` en el navegador de Cursor: la voz de Lumina sale de esa pestaña.

---

## 5. Archivos que importan

```
backend/lumina_desktop.py      # intenciones + Spotify + apps + archivos
backend/main.py                # handle_desktop en /robot/ask; /spotify/login; lifespan callback
backend/.env                   # SPOTIFY_CLIENT_ID / SECRET / REDIRECT_URI (no git)
backend/spotify_token.json    # se crea al autorizar (no git)
dashboard/robot.js             # iniciar presentación ≠ inicia cámara
tests/backend/test_lumina_desktop.py
aether-video/player/main.tsx   # modo ?clicker=1
dashboard/celda.html, celda.js
dashboard/corridor.js, index.html
```

Pruebas de intenciones (sin red):

```
backend/.venv/Scripts/python.exe -m pytest tests/backend/test_lumina_desktop.py -q
```

---

## 6. Comandos útiles

```
# Backend (el que funciona)
cd backend
.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000

# Autorizar Spotify
http://127.0.0.1:8000/spotify/login
http://127.0.0.1:8000/robot/spotify/status

# Lumina
http://127.0.0.1:8000/robot.html

# Video solo clicker
cd aether-video
npm run show
http://localhost:5055/player/?clicker=1
```

---

## 7. Restricciones de producto (repaso corto)

- «conteo visible detectado» ≠ conteo real.
- ArUco = verificación, no navegación.
- «detección reactiva de obstáculos», no evasión inteligente.
- El pistón no «aprende».
- `robot.html` negro hasta voz; sin loader.
- Respetar `prefers-reduced-motion` (el corridor ya se apaga).
- No reinventar arquitectura de Fase 0 sin el proceso de la sección 9 de `aether_context_docs.md`.
