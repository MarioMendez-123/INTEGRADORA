# Capítulo 21: Seguridad

*Un repositorio público, una red compartida y un robot con relevadores: qué amenazas se consideraron, qué capas existen, qué se admitió que no está resuelto y qué hábitos protegen los secretos.*

## Una contraseña que dejó de estar en el código

El 21 de octubre, al leer el código de la celda con ojos de revisor, se encontró una cuenta **fija** (`admin`/`admin`) escrita dentro de `cell_hmi.py`, con un comentario que la llamaba "cuenta fija de laboratorio". El repositorio es público y el servidor escucha en todas las interfaces: **cualquiera en la red podía iniciar sesión y usar Arranque, Paro y "Borrar histórico"**, y el estado de la celda no pedía sesión. El hallazgo (bitácora, sesión 5) se resolvió así: la contraseña **salió del código** y ahora viene de la variable de entorno `CELDA_HMI_CLAVE`; **sin esa variable nadie inicia sesión** y los botones no responden. Es el ejemplo perfecto de la regla número uno de este capítulo: **en un repositorio público, un secreto en el código es un secreto de todos.**

## El modelo de amenazas, en un párrafo

El documento de la ADR 0012 lo resume sin adornos: el repositorio es público, la red de la universidad es compartida, el backend no tiene usuarios y el WebSocket del *show* no está autenticado. **Cualquier equipo de la subred puede intentar hablarle a los endpoints.** Las defensas ya existentes son: solo aceptar clientes de `AETHER_LAN_CIDRS`, validar cada campo con límites de tamaño, **no ejecutar nada de lo recibido**, exigir `Origin` en los WebSocket de navegador, cerrar `/config` y `/voice` al dominio público, abrir el firewall de Windows solo en perfil Privado y no guardar secretos ni audio. **Y un riesgo aceptado, dicho tal cual:** un atacante dentro de la subred **podría inyectar observaciones falsas o texto a Lumina** porque no hay autenticación; se acepta como riesgo de laboratorio y *"un jurado debe oírlo así"*.

## Siete capas, de la más externa a la más interna

| # | Capa | Dónde está | Estado |
|---|---|---|---|
| 1 | **Dominio público estático**: no hay backend en `aethermx.online` | GitHub Pages | **VERIFICADO** (rutas del laboratorio responden 404) |
| 2 | **Cloudflare** delante del sitio (encabezados, bots, límites) | Panel de Cloudflare | **Pendiente** (capítulo 20, **P-29**) |
| 3 | **Guardia público** (`public_guard.py`): cierra rutas peligrosas y limita a 120 peticiones por minuto | Servidor | **VERIFICADO** en pruebas |
| 4 | **Guardia de red local** (`lan_guard.py`): agentes y voz solo desde `AETHER_LAN_CIDRS` | Servidor | **VERIFICADO** en pruebas |
| 5 | **Validación estricta de contratos** (campos extra prohibidos, tamaños, versiones) | `agent_contracts.py` | **VERIFICADO** en pruebas |
| 6 | **Firewall de Windows** en perfil Privado | Laptop | Regla escrita; **NO verificada** de punta a punta con el Jetson |
| 7 | **Sin `gpiod`**: ningún botón mueve un pin | Código de la celda | **VERIFICADO** (capítulo 7) |

Y, **fuera del software**, la capa que no se puede reemplazar: el **paro de emergencia físico** (capítulo 4), que en el robot es un diseño y en la celda **no está documentado** (**PENDIENTE (P-16)**).

## Lo que el guardia público permite

En modo restringido (petición del dominio público o de una IP no local) solo se permiten **`GET /health`, `GET /inventory` y `GET /inventory/history`**. Todo lo demás responde 403: cámaras (`/perception`), celda (`/line/`), robot (`/robot`), dataset, Spotify, show, voz, configuración y el auto-refresh. Las rutas ocultas (`/.env`, `/.git`, `*.db`, `*.bak`, `*.sqlite`) responden 404. Los encabezados de seguridad se añaden siempre. El modo se elige con `AETHER_PUBLIC_MODE`: `auto` (por defecto), `public` (siempre restringido) o `local` (**solo para el laboratorio; nunca en un servidor alcanzable desde internet**). Un detalle de ingeniería: **no se lee `X-Forwarded-For`**, porque cualquier cliente puede escribir "127.0.0.1" ahí y saltarse el cierre; solo se confía en `CF-Connecting-IP` o `X-Real-IP` si `AETHER_TRUST_PROXY` está activo y un proxy confiable los pisa.

## Secretos: dónde viven y dónde nunca

Reglas verificadas en `.gitignore` y en la documentación:

| Qué | Dónde vive | En Git |
|---|---|---|
| Claves (ElevenLabs, mensajería, celda, Spotify) | `backend/.env` | **No** (ignorado) |
| Token de Spotify | `backend/spotify_token.json` | **No** |
| Agenda de contactos para llamadas | `backend/contactos.json` | **No** |
| Registro de acciones de Lumina | `backend/lumina_actions.jsonl` | **No** |
| Base de datos | `backend/aether.db` | **No** |
| Grabaciones de voz de pruebas | `pruebas_voz/` | **No** |
| Pesos de modelos y fotos del dataset | `edge/perception/weights/`, `parts/images/` | **No** |
| Configuración del agente del Jetson | `~/.aether-agent.env` | Fuera del repositorio (hay plantilla sin secretos) |

La regla práctica del equipo (documentada en `COMANDOS_LINUX.md`): **revisar `git diff --stat` antes de cada `push`**, y **nunca** pegar claves en el chat ni en la documentación. Dos hechos honestos: (1) la contraseña de acción administrativa (`ADMIN_ACTION_PASSWORD`) tiene un **valor por defecto de desarrollo** en el código, que debe sustituirse por entorno en cualquier uso real; (2) en una sesión previa, un secreto de la integración de música se pegó una vez en un chat y se recomendó **rotarlo** (cambiarlo por uno nuevo): que ya se haya rotado **no está confirmado**: **PENDIENTE (P-28)**. La palabra clave de esa lección: **un secreto expuesto una vez debe tratarse como expuesto para siempre y rotarse.**

El equipo además mantiene una rama de limpieza (`jetson-agente-limpia`) en la que, por ejemplo, **la dirección IP de la universidad se saca del repositorio** y se guarda en un archivo local del Jetson (`~/.aether-host`). Es el mismo criterio: lo que describe un lugar real no tiene por qué ser público.

## El laboratorio no sale a internet

El documento `docs/security/laboratorio.md` es una lista de ocho comprobaciones **que nadie ha ejecutado todavía en el router** (se dice así en el propio archivo):

1. No debe haber **reenvío de puertos** hacia el 8000 (API), el 1883 y 8883 (MQTT) ni el de la cámara.
2. **UPnP apagado** (deja que un programa abra un puerto sin avisar).
3. El permiso de Python en el **firewall de Windows**, si existe, **solo para red privada**.
4. Comprobar con `netstat -ano | findstr :8000` dónde escucha el API: la dirección local no debe ser una IP pública.
5. El broker MQTT, si corre, escucha en `127.0.0.1`.
6. **Prueba con datos móviles**: desde el celular (sin WiFi) abrir `http://<IP pública>:8000/health` **debe fallar**.
7. `AETHER_PUBLIC_MODE=local` solo en la PC del laboratorio.
8. `AETHER_TRUST_PROXY` sin definir mientras no haya un proxy que pise las cabeceras.

Su estado: **PENDIENTE (P-30)** (revisar y ejecutar la lista).

## Dos cuentas de seguridad que conviene no confundir

El proyecto distingue la **seguridad de información** (que nadie lea ni cambie datos) de la **seguridad funcional** (que una máquina no lastime a nadie). Los guardias y la CSP pertenecen a la primera; el paro de emergencia, el watchdog y el hecho de que **el software de la celda no pueda mover pines sin `gpiod`** pertenecen a la segunda. El error clásico es creer que una contraseña es una protección contra un movimiento peligroso: **no lo es**. El propio `cell_hmi.py` lo avisa: *"No es una certificación del sistema. El paro de emergencia no pasa por aquí."*

## Qué hacen las empresas

Las organizaciones aplican **defensa en profundidad** (varias capas, ninguna imprescindible), **mínimos privilegios** (cada programa solo puede lo que necesita), **gestores de secretos** (en lugar de archivos `.env`), **auditorías** periódicas y **segmentación** de redes industriales (IT/OT). Para plantas se aplican normas como **IEC 62443** (ciberseguridad de sistemas de control industriales). Aether es un **prototipo de laboratorio** que adopta las ideas con medios mínimos y declara con claridad lo que no cubre.

## Preguntas de repaso: seguridad

1. ¿Qué pasaba con la cuenta de la celda antes del 21 de octubre y cómo se corrigió?
2. ¿Qué tres rutas permite el guardia público y qué responde a todo lo demás?
3. ¿Por qué no se confía en `X-Forwarded-For`?
4. ¿Qué archivos con secretos o datos personales están excluidos de Git?
5. ¿Qué riesgo acepta el equipo explícitamente y cómo lo diría a un jurado?
6. ¿Por qué una contraseña no es una protección contra un movimiento peligroso?
