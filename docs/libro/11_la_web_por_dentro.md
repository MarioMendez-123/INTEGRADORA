# Capítulo 11: La web por dentro

*Cómo conversan el navegador y el servidor, por qué un video se puede mandar como una foto interminable y qué es la política de seguridad que bloqueó dos veces lo que el equipo quería mostrar.*

## Dos veces el navegador dijo que no

El 23 de octubre de 2026, en la primera prueba real del agente del Jetson, todo funcionaba: la cámara entregaba 29 cuadros por segundo, el servicio respondía y `/stream` daba código 200. Pero la página **no mostraba el video**. Horas después ocurrió algo parecido con el **sonido** de Lumina: el servidor devolvía el audio, y el navegador se negaba a reproducirlo.

En ambos casos el responsable fue el mismo guardia, una **política de seguridad de contenido** (*Content Security Policy*, **CSP**), y el diagnóstico siguió el mismo método: separar **qué responde el servidor** de **qué permite el navegador**. Este capítulo enseña las piezas para entender esos casos y muchos otros.

## Pedir y contestar: así habla la web

La web funciona con un diálogo muy simple. El **navegador** (cliente) manda una **petición** (*request*) a un servidor: "dame `/inventory`". El servidor contesta con una **respuesta** (*response*) que lleva un **código de estado** y un cuerpo. El protocolo se llama **HTTP** (*HyperText Transfer Protocol*). Las peticiones tienen un **verbo**:

| Verbo | Significa | Ejemplo en Aether |
|---|---|---|
| `GET` | "Dame algo" | `GET /inventory` devuelve el inventario |
| `POST` | "Toma estos datos y haz algo" | `POST /robot/ask` manda una pregunta a Lumina |
| `PATCH` | "Cambia una parte de algo que ya existe" | `PATCH /inventory/{identifier}/retire` retira una entrada |
| `DELETE` | "Borra" | `DELETE /line/cell/session` cierra la sesión de la celda |

Los **códigos de estado** que aparecen en el proyecto, y qué dicen:

| Código | Significado | Dónde aparece |
|---|---|---|
| **200** | Todo bien | `GET /health` |
| **403** | Prohibido | Contraseña incorrecta para retirar inventario; ruta cerrada al público |
| **404** | No existe | Un `identifier` que no está en el inventario; rutas ocultas como `/.env` |
| **422** | Datos inválidos | Una pregunta vacía a Lumina; un mensaje de agente que no cumple el contrato |
| **429** | Demasiadas peticiones | Más de 120 peticiones por minuto desde un cliente fuera de la red local |
| **503** | Servicio no disponible | Ollama no responde; ElevenLabs no está configurado |

El servidor de Aether está hecho con **FastAPI** (capítulo 13), que además genera gratis una página de documentación interactiva en `/docs`.

## Cookies: cómo el servidor reconoce a alguien

HTTP no recuerda a nadie entre una petición y la siguiente. Para "recordar" que alguien ya inició sesión se usa una **cookie**: un texto pequeño que el servidor entrega y el navegador devuelve en cada petición siguiente. En Aether la usa la celda: `POST /line/cell/session` entrega la cookie `celda_session`, y los botones de Arranque y Paro **exigen** esa cookie. Se crea con dos protecciones: `httponly` (el JavaScript de la página no puede leerla, así un script malicioso no la roba) y `samesite="lax"` (el navegador no la manda en peticiones iniciadas por otro sitio). La contraseña no está en el código; viene de `CELDA_HMI_CLAVE` (capítulo 7).

## Una llamada que se queda abierta: los WebSocket

Con HTTP normal, el servidor solo habla cuando le preguntan. Para cosas que ocurren en vivo (alguien dijo una frase; Lumina empezó a hablar) existe el **WebSocket**: una conexión que se abre una vez y por la que **ambos lados pueden mandarse mensajes cuando quieran**. Aether tiene dos:

- `/voice/ws`: el servicio de voz de la laptop manda **texto** reconocido y las páginas de Lumina mandan "estoy hablando" (anti-eco). **Nunca viaja audio.** Hay dos papeles: *service* (solo uno a la vez) y *listener* (las páginas; el servidor admite hasta 8 conexiones en total).
- `/show/ws`: un relevo de eventos entre Lumina y el video de presentación, que corren en equipos distintos. Reenvía cada mensaje a todos los demás conectados, sin interpretarlo.

Ambos validan el origen: el WebSocket de un navegador debe venir del mismo servidor al que se conecta (`origin_matches_host`), y el canal de voz solo acepta clientes de la red local.

## Video por la web: el truco del JPEG interminable

Mostrar una cámara en una página web se puede hacer sin tecnologías de video complicadas. Aether usa un truco clásico llamado **MJPEG por HTTP**: el servidor responde con el tipo de contenido `multipart/x-mixed-replace; boundary=frame` y **va mandando una foto JPEG tras otra** por la misma respuesta, que nunca termina. El navegador reemplaza la imagen cada vez que llega una nueva. En la página, basta con una etiqueta `<img src="/stream">`. Se ve en `backend/main.py`, `backend/celda_agent.py` y el agente del Jetson.

Ventajas: es simple y funciona en cualquier navegador sin código extra. Inconvenientes: gasta más ancho de banda que un video comprimido real (por eso el video **no viaja por la red hacia la laptop**; capítulo 1) y un `<img>` que falla da solo un evento `error` genérico, sin decir por qué, lo que complicó el diagnóstico de esta semana.

## El guardia del navegador: la política CSP

Una **CSP** es una lista que la página (o el servidor) le entrega al navegador diciendo **desde dónde puede cargar qué**: imágenes de aquí, scripts de allá, audio de otro lado. Si algo intenta cargarse desde un lugar no autorizado, el navegador **lo bloquea** y lo anota en la consola. Protege contra scripts maliciosos inyectados en la página.

La CSP de Aether (en `backend/public_guard.py`) es estricta. Entre sus directivas:

| Directiva | Valor | Para qué |
|---|---|---|
| `default-src` | `'self'` | Por defecto, solo del mismo servidor |
| `script-src` | `'self'` y `https://cdn.jsdelivr.net` | Scripts propios y de esa red de distribución |
| `img-src` | `'self' data: blob:` (más los agentes configurados) | Imágenes, y el video de los agentes |
| `media-src` | `'self' blob: data:` | Audio y video |
| `frame-ancestors`, `form-action` | `'self'`, `'none'` | Nadie puede incrustar la página ni mandar formularios a otro lado |

**Hay dos lugares donde una CSP puede vivir, y el navegador las aplica a la vez.** Una es el **encabezado** de la respuesta HTTP; la otra es una etiqueta `<meta http-equiv="Content-Security-Policy">` dentro del HTML. Cuando las dos existen, **gana la más estricta** de cada directiva. Ese detalle explica los dos casos de la semana.

### Caso 1: el video del agente (23 de octubre)

El servidor sí había incluido el origen del agente (`http://mario-desktop.local:8001` y `http://127.0.0.1:8001`) en el **encabezado**. Pero `dashboard/index.html` tiene su **propia** etiqueta `<meta>` con `img-src 'self' data: blob:`, y el navegador aplicó las dos: ganó la más estricta y bloqueó la imagen. `celda.html` y `robot.html` no tienen ese `<meta>`, por eso solo fallaba `index.html`.

**Corrección** (en `backend/agent_config.py`, función `extend_meta_csp`): el servidor entrega `index.html` con la **misma lista exacta de orígenes** dentro de su `<meta>`. Sin agente configurado el archivo sale idéntico. Además se quitó `localhost` de la lista, porque el servidor nunca lo entrega. Las pruebas nuevas **fallan con el código anterior y pasan con el nuevo**. (**NO verificado** en un navegador real: falta repetir la prueba en el Jetson con `Ctrl+F5`.)

### Caso 2: el audio de Lumina (23 de octubre)

Firefox bloqueó `blob:` (los MP3 de ElevenLabs que reproduce `robot.js`) y `data:audio/mp3` (un MP3 mudo del reproductor de video empaquetado). Causa: `media-src 'self'` estaba en el encabezado (`backend/public_guard.py`) y en el `<meta>` de `index.html`. El `fetch("/robot/tts")` **no falló**: el servidor devolvió audio y la CSP impidió reproducirlo; el error posterior de "ElevenLabs no disponible" fue una consecuencia, no la causa. **Corrección:** `media-src 'self' blob: data:` en los dos sitios, sin tocar `script-src`, `connect-src` ni `img-src`. Una prueba verifica que encabezado y `<meta>` coinciden y que ni `blob:` ni `data:` aparecen en `script-src` ni en `connect-src`. (**NO verificado** en un navegador real, ni que la clave de ElevenLabs sea válida y tenga créditos.)

### Cómo se mejoró el diagnóstico

Como un `<img>` que no carga solo dispara `error`, el equipo escribió `dashboard/stream-errors.js`: escucha el evento `securitypolicyviolation`, que el navegador lanza **antes** del error cuando el bloqueo es por CSP, y ofrece mensajes distintos: *"Bloqueado por la política de seguridad (CSP) de esta página, NO por la cámara"* contra *"No se pudo cargar el video… el agente no responde"*. Es un ejemplo de buena ingeniería: **hacer que el error diga la causa real.**

## Un clic que Firefox exige antes de sonar

Los navegadores crean el contexto de audio "suspendido" hasta el primer gesto del usuario (un clic o una tecla): es la política de *autoplay*, no un defecto. El comentario de `dashboard/robot.js` lo dice así. Por eso el reproductor de video y la pantalla de Lumina piden un primer clic o la tecla de un control remoto para "armar" el audio.

## Un servidor que se cierra solo al llegar de internet

El dominio público (`aethermx.online`) y la red local no deben tener los mismos permisos. `backend/public_guard.py` es un **guardia** que, cuando la petición viene del dominio público o de una IP no local, **solo permite** `GET /health`, `GET /inventory` y `GET /inventory/history`. Todo lo demás (cámaras, celda, robot, dataset, Spotify, voz, configuración y cualquier método que modifique) responde **403**. Además aplica un límite de **120 peticiones por minuto** por IP, oculta rutas peligrosas (`/.env`, `/.git`, `*.db`, `*.bak`) con un 404, y añade encabezados de seguridad (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, la CSP). El modo se controla con `AETHER_PUBLIC_MODE` (`auto`, `public` o `local`). El capítulo 21 completa la historia.

## Dónde está cada cosa en los archivos

El panel web (`dashboard/`) se sirve **desde el mismo proceso** del servidor, en el mismo origen: no hay CORS entre página y API (decisión 7, opción B). Cada página y su guion:

| Página | Para qué | Guion principal |
|---|---|---|
| `index.html` | Portada del proyecto, módulos, arquitectura | `portada.js`, `motion.js`, `loader.js`, `node-field.js` |
| `inventory.html` | Inventario declarado e historial | `app.js` |
| `celda.html` | Pantalla de la celda de manufactura | `celda.js`, `line-vision.js` |
| `robot.html` | Lumina: cara, voz, cámara y llamadas | `robot.js` (unas 2 600 líneas), `camera-stream.js`, `call-screen.js` |
| `dataset.html` | Fotos y etiquetas de piezas para entrenar el modelo | `dataset.js` |
| `armado.html`, `holo.html` | Hoja de armado 3D y vista holográfica del carrito | Código propio dentro de la página |

## Investigar desde el navegador

Las **herramientas de desarrollador** (tecla `F12`) son el mejor microscopio de una página: la pestaña **Red** muestra cada petición con su código; la **Consola**, los errores y los bloqueos de CSP. Un recorrido útil para un video que no aparece: abrir `F12`, recargar con `Ctrl+F5` (ignora la caché), filtrar la pestaña Red por la ruta `/stream`, mirar el código y, si es 200 pero no hay imagen, buscar en la Consola un mensaje de *Content Security Policy*.

## Paneles de planta: la misma web a gran escala

Los paneles de supervisión industrial (**SCADA** y **HMI**) modernos son, en esencia, aplicaciones web conectadas por WebSocket a controladores, con **alarmas** priorizadas (norma ISA-18.2) y **roles** de usuario. La celda de Aether sigue esa receta en pequeño; lo que no tiene todavía es autenticación por usuarios y roles reales (hay una sola cuenta de laboratorio).

## Preguntas de repaso: web y navegador

1. ¿Qué diferencia hay entre un `GET` y un `POST`, y por qué `GET /inventory` no puede modificar nada?
2. ¿Qué dos protecciones lleva la cookie `celda_session`?
3. ¿Por qué el video de la cámara no viaja como un archivo de video normal sino como una "foto interminable"?
4. Explicar por qué el video del agente se bloqueó aunque el encabezado de la CSP lo permitía.
5. ¿Qué significa que `fetch("/robot/tts")` no falló y aun así el audio no sonó?
6. ¿Qué códigos devuelve el guardia público ante una cámara, una ruta oculta y un exceso de peticiones?
