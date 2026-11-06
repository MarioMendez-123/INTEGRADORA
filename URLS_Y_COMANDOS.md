# Aether — URLs y comandos

**Resumen rápido**

| Quiero… | Hago esto |
|---|---|
| Arrancar todo en la laptop (PowerShell, en la raíz) | `.\iniciar_aether.ps1` (`-Ingles` para la voz en inglés, `-SoloComprobar` para solo revisar) |
| Dar la presentación | Abrir http://127.0.0.1:8000/robot.html?intro=1&voz=servicio&lang=es (o `lang=en`) y dar clic o flecha |
| Ver solo las diapositivas | http://127.0.0.1:8000/slides.html?lang=en (o `lang=es`) |
| Hablar con Lumina en modo normal | http://127.0.0.1:8000/robot.html ; lista completa de comandos en la [sección 7](#7-lumina-todo-lo-que-puede-hacer) |
| Ver el panel | http://127.0.0.1:8000/ |
| Usar el simulador | `backend\.venv\Scripts\python.exe sim\servidor.py` y abrir http://localhost:8770/ |
| Jetson y Raspberry Pi | `COMANDOS_LINUX.md` y `docs/guia_arranque.md` (resumen en la [sección 8](#8-jetson-y-raspberry-pi)) |

| Puerto | Qué corre |
|---|---|
| 8000 | Backend, panel, Lumina y presentación (en la Pi, `celda_agent`) |
| 8001 | Agente de percepción del Jetson |
| 8770 | Simulador del carrito (7700, 7701 y otros: sus pines; ver `sim/README.md`) |
| 8771 | Simulador en el teléfono, servido desde la Jetson (`sim/README.md`) |
| 5055 | Reproductor del pitch anterior |
| 3000 | Remotion Studio |
| 8888 | Callback de Spotify |
| 11434 | Ollama |

> **Atajo (rama `jetson-agente`):** `.\iniciar_aether.ps1` hace las comprobaciones y arranca el servidor (y la voz). Guía:
> `docs/guia_arranque.md`. Lo de abajo sigue vigente como respaldo manual.

Todo corre en esta laptop. Desde **otro equipo de la misma red**, cambia
`localhost` por la IP de esta laptop (la ves con `ipconfig`, "Dirección IPv4")
y permite Python en el firewall de Windows (red privada).

> El puerto **8000** es solo para uno: el backend de Aether **o** `lumina-agent`,
> no los dos a la vez.

---

## 0. Presentación final, sin internet — puerto 8000

Pantalla negra → clic o flecha → intro → Lumina saluda → comandos de voz → proyección 3D → flecha → diapositivas.

**Arrancar** (PowerShell, en la raíz del proyecto):

```powershell
.\iniciar_aether.ps1            # presentación en español
.\iniciar_aether.ps1 -Ingles    # presentación en inglés (cambia el reconocedor de voz)
```

**Abrir en Edge sin barras** (modo kiosko; para salir, `Alt+F4`). En lugar de kiosko también puedes abrir la URL y pulsar `F11`.

```powershell
Start-Process msedge -ArgumentList '--kiosk "http://127.0.0.1:8000/robot.html?intro=1&voz=servicio&lang=es" --edge-kiosk-type=fullscreen --user-data-dir=C:\aether-voz\edge-show'
```

| URL | Qué es |
|---|---|
| http://127.0.0.1:8000/robot.html?intro=1&voz=servicio&lang=es | **Presentación completa en español** |
| http://127.0.0.1:8000/robot.html?intro=1&voz=servicio&lang=en | **Presentación completa en inglés** (arranca con `-Ingles`) |
| http://127.0.0.1:8000/slides.html?lang=en | Solo las diapositivas, en inglés |
| http://127.0.0.1:8000/slides.html?lang=es | Solo las diapositivas, en español |
| http://127.0.0.1:8000/armado.html?limpio=1&pose=armada | Solo la proyección 3D del carrito, sin controles |
| http://127.0.0.1:8000/assets/intro.mp4 | Solo el video de inicio |

**Guion de voz.** La flecha del clicker es el respaldo: lanza el siguiente paso sin hablar.

| Paso | Español | Inglés | Lumina responde |
|---|---|---|---|
| Al terminar el video | (solo) | (solo) | «Hola, soy Lumina, el robot del proyecto Aether.» / «Hello, I'm Lumina, the robot of the Aether project.» |
| 1 | «Hola Lumina, ¿cómo estás?» | "Hello Lumina, how are you?" | «Muy bien y listo para trabajar.» / "Very well and ready to work." |
| 2 | «Lumina, enséñanos quién eres» | "Lumina, show us who you are" | Carrito armado |
| 3 | «Lumina, muéstranos tu interior» | "Lumina, show us your interior" | Carrito capa por capa |
| Flecha | — | — | Pasa a las diapositivas |

**Teclas.** Avanzar: `→`, `↓`, `AvPág`, `Espacio`, `Enter`. En las diapositivas, retroceder: `←`, `↑`, `RePág` o clic en el borde izquierdo. Doble clic en la última lámina: vuelve Lumina.

**Música de fondo.** Empieza sola al entrar a las diapositivas, con entrada suave, y se desvanece al volver a Lumina. Teclas: `+` sube, `-` baja, `M` silencia o reactiva. Es una pista original generada por código, sin derechos de terceros.

**PDF para el equipo:** `docs/presentacion/Aether_Presentacion_EN.pdf` y `Aether_Presentacion_ES.pdf`. **Reparto y tiempos:** `docs/REPARTO_presentacion.md`.

**Si cambias algo:**

| Qué | Dónde |
|---|---|
| Volumen inicial de la música | `MUSIC_VOL` en `dashboard/slides.js` |
| La música en sí | `aether-video/intro/scripts/musica_fondo.py` genera un WAV; conviértelo a `dashboard/assets/fondo.m4a` con `npx remotion ffmpeg -y -i fondo.wav -c:a aac -b:a 128k -f mp4 ..\dashboard\assets\fondo.m4a`. O reemplaza ese archivo por otra canción |
| Textos de las diapositivas | `dashboard/slides.js` |
| Quién presenta cada lámina y tiempos | `dashboard/slides.js` y `docs/REPARTO_presentacion.md` |
| Lo que dice Lumina en este flujo | `INTRO` en `dashboard/robot.js` |
| Código del modelo 3D | `dashboard/armado.src.js`, y luego `cd aether-video && npm run armado:build` |
| Video de inicio | Renderiza y copia `aether-video/intro/out/Aether_Intro_v3.mp4` a `dashboard/assets/intro.mp4` |

**Sin internet:** usa Vosk (`C:\aether-voz\vosk-model-small-es-0.42` y `vosk-model-small-en-us-0.15`) y las voces de Windows. Si ElevenLabs está activo, cada frase que Lumina diga con esa voz se guarda en `backend/tts_cache/` y luego suena igual sin red.

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
| http://localhost:8000/celda.html | Celda de manufactura; pide usuario y contraseña (los pulsos solo salen si hay GPIO; sin GPIO la pieza queda como «pulso no enviado») |
| http://localhost:8000/dataset.html | Dataset de imágenes |
| http://localhost:8000/robot.html | **Lumina**: cara, voz, cámara y llamadas (abrir en Chrome o Edge) |
| http://localhost:8000/armado.html | Guía de armado del carrito en 3D (con panel y controles) |
| http://localhost:8000/holo.html | Proyecciones de Aether, agua, metano y placa. **Sale en blanco:** la CSP bloquea su JavaScript incrustado |
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
| WebSocket | ws://localhost:8000/voice/ws?role=listener | Texto del micrófono de la laptop hacia las páginas de Lumina (solo red local) | Servicio de voz (`python -m voice.service`) |
| POST | http://localhost:8000/perception/observations | Observaciones que manda el agente del Jetson (solo red local, idempotente) | `contracts/agents_api.md` |
| POST | http://localhost:8000/line/cell/events | Eventos de pieza que manda la Pi (solo se anotan) | `contracts/agents_api.md` |
| GET | http://localhost:8000/config/agents | Direcciones del video de los agentes, para las páginas | — |
| GET | http://localhost:8000/line/cell/status | Estado de la celda | — |
| GET | http://localhost:8000/line/cell/events/recent | Últimos eventos de pieza | — |
| POST | http://localhost:8000/line/cell/session | Iniciar sesión en la HMI (`DELETE` la cierra) | `CELDA_HMI_CLAVE` |
| POST | http://localhost:8000/line/cell/run | Arranque y paro de la celda | Sesión de la HMI |
| POST | http://localhost:8000/line/cell/alarms/ack | Reconocer alarmas (`/clear` las limpia) | Sesión de la HMI |
| GET | http://localhost:8000/dataset | Datos del dataset (`POST /dataset/classes` y `/dataset/samples` agregan) | — |
| GET | http://localhost:8000/robot/essay | Estado del ensayo que Lumina está escribiendo | — |

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
npm run dev                                                 # video del pitch anterior
npx remotion studio intro/index.ts --public-dir=intro/public   # video de inicio de la presentación
```

**URL:** http://localhost:3000 (si el 3000 está ocupado, Remotion usa el
siguiente libre y lo dice en la terminal).

Composiciones: `Aether` (escenario), `AetherEnsayo`, `DemoOverlay`,
`LlamadaLumina` (pantalla de llamada). En el video de inicio: `AetherIntro`.

Renderizar el video de inicio (unos 6 minutos):

```bash
cd aether-video
npx remotion render intro/index.ts AetherIntro intro/out/Aether_Intro_v3.mp4 --public-dir=intro/public --codec=h264 --crf=17
```

Volver a capturar sus tomas 3D (abre Chrome; no lo cierres): `node intro/scripts/capture_v3.mjs`.

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

## 6. Simulador del carrito — puerto 8770

**Comando** (desde la raíz; el modelo se prepara una vez, ver `sim/README.md`):

```powershell
backend\.venv\Scripts\python.exe sim\servidor.py
```

| URL | Qué es |
|---|---|
| http://localhost:8770/ | Simulador en 3D con física, en la PC (solo escucha en esta laptop) |
| http://localhost:8770/web/movil.html | Versión del simulador para teléfono |
| http://localhost:8770/status | Estado del simulador en JSON |

---

## 7. Lumina: todo lo que puede hacer

Abre http://localhost:8000/robot.html en Chrome o Edge. Empieza en negro: di **«Lumina»** para encenderla, o usa el botón oculto de la esquina superior izquierda (arranca el guion a los 10 s). Di «Lumina» antes de cada orden. Si la voz falla, en la ventana del servicio de voz: `w` despierta a Lumina sin hablar, `p` pausa y suelta el micrófono, `q` sale.

**Si no hay internet** solo fallan las filas marcadas con 🌐. Lo marcado con 🔒 pide confirmación: contesta «sí» o «no».

Estas frases son ejemplos: 70 de las de abajo se comprobaron contra el reconocedor de comandos el 5 nov. Lo que no es un comando se contesta con respuestas fijas o con Ollama.

### La cara, la cámara y el pitch

| Dices | Qué hace |
|---|---|
| «Lumina, inicia» (o enciende, arranca, activa, prende) | Modo cámara: enseña lo que ve, con detección |
| «Lumina, detente» (o apaga, termina) | Sale del modo cámara |
| «Lumina, iniciar presentación» | Corre el guion del pitch anterior |
| «Lumina, presentación» | Modo presentación: sostiene la cara feliz (repetirlo lo apaga) |
| «Lumina, feliz» (confundida, sorprendida, pensando, triste, error, neutral, inactiva) | Cambia la expresión |

### Llamadas 🌐 (Zavu; gastan saldo, máximo 3 cada 10 min)

| Dices | Qué hace |
|---|---|
| «Lumina, llámame» | Te llama |
| «Lumina, llama a Pedro» | Llama a un contacto de `backend/contactos.json` |
| «Lumina, llama a Pedro y dile que ya voy» | Llama y da el mensaje |

### Música 🌐 (Spotify Premium; la cuenta debe estar autorizada)

| Dices | Qué hace |
|---|---|
| «Lumina, autoriza Spotify» | Abre el permiso de Spotify |
| «Lumina, reproduce Thunderstruck de AC/DC» | Busca y reproduce |
| «Lumina, pon Thunderstruck en el teléfono» | Reproduce en el celular (con Spotify abierto) |
| «Lumina, reproduce» | Reanuda |
| «Lumina, pausa», «siguiente», «anterior» | Controla la canción |
| «Lumina, sube el volumen de Spotify» (o baja) | Volumen de Spotify |
| «Lumina, qué está sonando» | Dice la canción |
| «Lumina, un tekno bien insano» | Pone «Do You Wanna» de KRAZKA |

### Programas e internet

| Dices | Qué hace |
|---|---|
| «Lumina, abre calculadora» (Edge, Word, Excel, Spotify, Discord, Cursor, y lo que esté en el menú Inicio) | Abre el programa |
| «Lumina, cierra notepad» 🔒 | Cierra el programa |
| 🌐 «Lumina, abre github.com» | Abre esa dirección |
| 🌐 «Lumina, busca robots industriales» | Busca en Edge |
| 🌐 «Lumina, abre YouTube gatos», «abre Gmail», «abre mapas Chihuahua», «abre Google Docs» | Abre el sitio |
| 🌐 «Lumina, investiga robots» | Resume de Wikipedia |
| «Lumina, pausa el video» (o siguiente, anterior + «el video») | Teclas de media del sistema |

### Archivos y carpetas (solo escritorio, documentos y descargas)

| Dices | Qué hace |
|---|---|
| «Lumina, abre descargas» (documentos, escritorio, el repositorio) | Abre la carpeta |
| «Lumina, crea una carpeta pruebas» | Crea la carpeta |
| «Lumina, guarda una nota que diga hola» 🔒 | Guarda un archivo |
| «Lumina, lee el archivo notas.txt» | Lee texto, Word o Excel (no PDF) |
| «Lumina, mueve notas.txt a escritorio» 🔒 | Mueve el archivo |
| «Lumina, compara a.txt con b.txt» | Compara dos archivos |
| «Lumina, deshaz lo último», «qué hiciste» | Deshace o cuenta lo hecho |

### Tiempo, cuentas y equipo

| Dices | Qué hace |
|---|---|
| «Lumina, pon un temporizador de 5 minutos», «avísame a las 20:30» | Temporizador y aviso |
| «Lumina, qué hora es», «qué fecha es», «qué hora es en Tokio» | Hora y fecha |
| «Lumina, cuánto es 12 por 8», «convierte 5 kilometros a millas» | Cuentas y unidades |
| «Lumina, buenos días» | Parte de la mañana |
| «Lumina, batería», «estado del equipo», «avísame si la batería baja de 30» | Estado de la laptop |
| «Lumina, modo descanso», «modo trabajo», «pulso» | Modos y reporte de estado |
| «Lumina, sube el volumen» (o baja), «silencio» | Volumen de Windows |
| «Lumina, captura de pantalla», «qué copié», «copia esto hola» 🔒 | Pantalla y portapapeles |
| «Lumina, bloquea la pantalla» | Bloquea |
| «Lumina, apaga la computadora», «reinicia el equipo» 🔒, «cancela el apagado» | Apagado |
| «Lumina, estado del repo» | Estado de git |

### Memoria, proyecciones y ensayos

| Dices | Qué hace |
|---|---|
| «Lumina, recuerda que el examen es el lunes», «qué recuerdas», «olvida el examen» 🔒 | Memoria |
| «Lumina, enséñanos quién eres» | Abre el carrito armado en Edge |
| «Lumina, muéstranos tu interior» | Abre el carrito por capas en Edge |
| «Lumina, proyecta el robot», «descompón el robot» | Guía de armado en 3D, entera o separada |
| «Lumina, proyecta Aether» (agua, metano, la placa) | Abre `holo.html`. **Hoy sale en blanco** |
| «Lumina, pon la imagen plano.png» | Muestra una imagen |
| 🌐 «Lumina, quiero un ensayo sobre robots» (puede decir el tipo: argumentativo, expositivo…) | Escribe en Google Docs en APA con portada |
| «Lumina, cómo va el ensayo» | Avance del ensayo |
| «Lumina, qué puedes hacer» | Lo resume en voz alta |
| «Lumina, detente» | Detiene lo que esté haciendo |

### Preguntas con respuesta fija (instantáneas, sin Ollama)

Con «Lumina» y una de estas frases: cómo estás · cómo te llamas · qué haces o para qué sirves · qué es Aether · quién te creó · tienes sentimientos · cuántos años tienes · eres un robot de verdad · puedes moverte · qué es YOLO · vas a reemplazar a los humanos · tienes hambre · color favorito · eres inteligente · trabajar en una fábrica · te da miedo · Spotify o poner música. Cualquier otra pregunta va a Ollama, que debe estar corriendo; tarda unos 20 s.

### Durante la presentación (`?intro=1`)

Solo atiende el guion de la sección 0 y, en español, preguntas sueltas que incluyan «Lumina». En inglés entiende únicamente el guion. Mientras corren el video y las diapositivas no escucha. La proyección sale dentro de la página, no en Edge, y no consulta n8n.

### Lo que no hace

No manda correos, no compra y no borra fuera de tu perfil. No hace clic dentro de páginas web. Con n8n configurado, puede lanzar sus flujos 🌐 🔒 cuando la frase coincide, salvo en la presentación.

---

## 8. Jetson y Raspberry Pi

Detalle y estado de verificación en `COMANDOS_LINUX.md` y `docs/guia_arranque.md`.

```bash
ssh mario@192.168.100.19                                # entrar al Jetson desde la laptop
bash ~/aether/scripts/jetson/iniciar-agente.sh          # arrancar el agente de percepción (:8001)
python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15   # medirlo
bash ~/aether/scripts/ver-aether.sh robot.html          # ver la página de la laptop (dentro de VNC)
bash ~/aether/scripts/jetson/detener-agente.sh          # detenerlo
cd ~/aether/backend && ~/celda-venv/bin/python -m uvicorn celda_agent:app --host 0.0.0.0 --port 8000   # la celda, en la Pi
```

Desde la laptop, `.\iniciar_aether.ps1 -Jetson` también arranca el agente por SSH.

| URL | Qué es |
|---|---|
| http://192.168.100.19:8001/status | Estado del agente del Jetson |
| http://192.168.100.19:8001/stream | Video del agente del Jetson |
| http://IP-DE-LA-PI:8000/celda.html | Pantalla de la celda, en la Pi |
| http://IP-DE-LA-PI:8000/health | Salud de la celda |

---

## Apagar lo que arrancó el script

Cierra la ventana de PowerShell del servicio de voz. Para los demás, busca el proceso por puerto y deténlo:

```powershell
foreach ($p in 8000,8770,5055,3000) { Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force } }
```

---

## Comandos sin URL

| Qué | Comando |
|---|---|
| Comprobar que todo está listo, sin arrancar nada | `.\iniciar_aether.ps1 -SoloComprobar` |
| Probar la presentación de punta a punta (con el servidor arriba) | `cd aether-video && node intro/scripts/e2e_show.mjs 8000 C:\ruta\capturas es flecha` |
| Capturar todas las diapositivas | `cd aether-video && node intro/scripts/slides_shots.mjs 8000 C:\ruta\capturas en` |
| Volver a generar el PDF de las diapositivas, tras cambiarlas (con el servidor arriba; `en` o `es`) | `cd aether-video && node intro/scripts/slides_pdf.mjs 8000 ../docs/presentacion en` |
| Recompilar el modelo 3D (`armado.src.js`) | `cd aether-video && npm run armado:build` |
| Pruebas del backend | `backend/.venv/Scripts/python -m pytest tests/backend -q` (desde la raíz) |
| Pruebas de sincronía del video | `cd aether-video && npm test` |
| Pruebas de lumina-agent | `cd lumina-agent && python -m pytest test_lumina.py -q` |
| Renderizar los MP4 | `cd aether-video && npm run render` |
| Recompilar la pantalla de llamada | `cd aether-video && npm run call:build` |
| Recompilar las escenas del dashboard (wordmark de portada + banda de celda) | `cd aether-video && npm run web:build` |

---

## Estado de verificación (5 nov 2026)

Probado con los servidores prendidos, en esta laptop:

- ✅ **Responden 200:** todas las páginas de la sección 0 y `/`, `/inventory.html`, `/celda.html`, `/dataset.html`, `/robot.html`, `/armado.html`, `/docs`, `/health`, `/inventory`, `/inventory/history`, `/inventory/auto-refresh/status`, `/perception/recent-detections`, `/robot/contacts`, `/robot/spotify/status`, `/config/agents`. También las URL de `:5055`, `http://localhost:8770/`, `/web/movil.html`, `/status`, `:3000` y `:11434`.
- ✅ **Presentación completa:** en Chrome, con las conexiones externas bloqueadas, en español por voz simulada y en inglés y español con la flecha. La música arranca al entrar a las diapositivas, y el doble clic final detiene la música y vuelve a Lumina.
- ⚠️ **La música no se ha oído:** se midieron volumen y frecuencias, y se comprobó que suena en el navegador con el sonido silenciado. Falta ajustar `MUSIC_VOL` en el salón.
- ✅ **Reconocedor:** Vosk entendió los comandos en los dos idiomas con voz sintética de Windows.
- ⚠️ **Sin probar:** el micrófono real, Edge en modo kiosko y el WiFi realmente apagado. `/perception/stream` y `/line/vision/stream` no responden en 6 s sin cámara.
- ⚠️ `holo.html` responde 200 pero sale en blanco: la CSP bloquea su JavaScript incrustado.
- ❌ **No funciona:** `/robot/calendar` (503, faltan credenciales de Google). `/robot/tts` responde 503: ElevenLabs rechaza la cuenta por un pago pendiente y Lumina usa la voz de Windows.

IP de esta laptop en la red el 5 nov: `192.168.100.14` (cámbiala si te conectas a otra red; revísala con `ipconfig`).

## Estado de verificación anterior (30 sep 2026)

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
