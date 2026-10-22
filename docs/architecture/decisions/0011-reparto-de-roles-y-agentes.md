# ADR 0011 — Reparto de roles entre laptop, Jetson y Raspberry Pi 4, y contrato de agentes (BORRADOR)

**Estado:** **BORRADOR. NO está decidida.** Espera la confirmación de Mario (2026-10-21).
Mientras no se acepte, no cambia nada de las ADR 0001 a 0010 ni del documento maestro
(`aether_context_docs.md`), y **no se escribe código** que dependa de ella. Cuando se acepte,
se registra en la sección 9 del documento maestro, con fecha y motivo.

**Qué propone superar (solo si se acepta):** la parte de **ubicación física** de la visión de
línea de las sub-decisiones 8c y 10c ("PC fija" → Raspberry Pi 4), sin borrar esas ADR
(mismo patrón de "superar sin borrar" que la ADR 0010). Las demás decisiones de fase 0 no se tocan.

## Cómo leer este documento

Cada afirmación dice de dónde sale:
- **[código]**: leído en el repositorio.
- **[reportado]**: lo contó Mario de una corrida en su hardware, sin que se haya repetido.
- **[propuesta]**: decisión que se somete a aprobación.
- **[por verificar]**: no está comprobado.

## Contexto

Desde 2026-10-21 se trabaja con hardware real. Lo que ya se sabe:

- **[reportado]** El backend completo (`backend/main.py`) corre en el Jetson, puerto 8001, por
  cable (`192.168.100.19`), y se ve desde el navegador de la laptop.
- **[reportado]** Desde el Jetson, `curl http://192.168.100.14:8000/health` devolvió
  `{"status":"ok"}` (laptop por WiFi, Jetson por cable, misma red). Antes dio timeout porque el
  backend no estaba corriendo en la laptop.
- **[código]** Hoy **un solo proceso** (`backend/main.py`) hace todo: inventario y base de datos,
  streams de cámara, celda, Lumina (LLM, voz, llamadas), dataset y sirve las páginas.
- **[código]** Las páginas usan rutas relativas al mismo servidor: `fetch("/robot/ask")`,
  `fetch("/line/cell/status")`, `/perception/stream`, y un WebSocket a
  `${location.host}/show/ws`. No hay una dirección base configurable.
- **[código]** `PublicGuard` (`backend/public_guard.py`) solo permite CORS desde
  `https://aethermx.online`, `localhost:8000` y `127.0.0.1:8000`, y deja pasar IP privadas en
  modo `auto`.
- **[código]** Lumina depende de la laptop: LLM por `OLLAMA_URL` (por defecto
  `localhost:11434`), llaves de ElevenLabs y Zavu por variables de entorno, y
  `lumina_desktop.py`, que usa `ctypes.windll`, `os.startfile` y rutas de Windows.
- **[código]** `robot.html` usa `SpeechRecognition` del navegador (`robot.js`), y
  `URLS_Y_COMANDOS.md` dice que hay que abrirla en Chrome o Edge.
- **[reportado]** En el Jetson **no abre ningún navegador de los que trae Ubuntu**: Chromium
  (snap 155.0.8059.84) falla con `snap-confine is packaged without necessary permissions … required
  permitted capability cap_dac_override not found`, y Firefox (snap) tampoco abre; el mismo día
  `snap changes` muestra que se instaló y se quitó el snap de Firefox. Kernel 5.15.148-tegra,
  Ubuntu 22.04, L4T 36.4.7. No se modificó `snapd`. Detalle en la bitácora.
- **[código]** `backend/cell_line.py` hace `import gpiod` al cargarse y, si existe, abre las
  líneas 8 y 9 (BCM de Raspberry Pi) de `/dev/gpiochip0`.

## Decisión propuesta [propuesta]

### Reparto de roles

| Equipo | Hace | NO hace |
|---|---|---|
| **Laptop** (Windows) | Backend central y **único punto de mando**; base de datos (inventario, historial); LLM (Ollama) y lógica de Lumina, incluidos los comandos de escritorio de Windows, la voz y las llamadas; guarda todas las llaves | No abre las cámaras de los equipos de campo |
| **Jetson Orin Nano** | Cámara del robot; **percepción** (YOLO + pyzbar + ArUco para verificar posición) como agente; las **interfaces** del robot (ver "Dónde se sirven las páginas") | La visión de línea; Remotion, Node o el informe; MQTT, Modbus o Docker; ninguna llave de servicios |
| **Raspberry Pi 4** | Cámara de la celda; **visión de línea** como agente (un cuadro por pieza, en CPU); la **interfaz de la celda** y nada más | No controla el pistón; no lee los infrarrojos por GPIO; no usa `pymodbus` ni `gpiod` mientras no se confirme el cableado; no lleva el LLM ni Lumina |

### Contrato de agente (reutiliza lo que ya existe)

Cada agente es un servicio pequeño que abre **su** cámara y expone:

| Ruta | Qué hace | Se parece a lo que ya hay en `main.py` |
|---|---|---|
| `POST /start` | Abre la cámara y arranca el pipeline | `POST /inventory/auto-refresh/start` |
| `POST /stop` | Detiene y libera la cámara | `POST /inventory/auto-refresh/stop` |
| `GET /status` | Activo, FPS, último error, última observación | `GET /inventory/auto-refresh/status` |
| `GET /stream` | MJPEG con detecciones dibujadas | `GET /perception/stream` y `GET /line/vision/stream` |

- Variables en el backend de la laptop: `JETSON_AGENT_URL` y `PI_AGENT_URL`. El backend
  **reenvía** por las rutas que las páginas ya usan (`/perception/stream`, `/line/vision/stream`,
  `/line/cell/status`, `/line/cell/run`), así que las páginas no necesitan cambiar. Si una
  variable no está definida, se mantiene el modo demo con la cámara de la laptop, igual que hoy.
- **`CELL_AGENT_URL` (:8080) se retira como concepto.** Aparece solo en documentos
  (`datasheet-conexion-celda.md`, `guia-de-construccion.md`, `AETHER_COMPENDIO.md`); **[código]**
  `main.py` nunca la consumió. Un solo concepto: `PI_AGENT_URL`.
- Cada equipo tiene **un solo proceso dueño de su cámara**. El patrón `CameraPublisher` (un
  publicador, varios clientes) se conserva dentro de cada agente.
- Opciones de captura opcionales por variable de entorno (`*_CAMERA_BACKEND`, `_FOURCC`,
  `_WIDTH`, `_HEIGHT`), ya en el repositorio (commit `c9f24cb`), para forzar V4L2 en Linux.
- **Sin autenticación en los agentes:** solo para la red local de trabajo, **nunca expuestos a
  internet**. Queda escrito aquí y en `contracts/rest_api.md` cuando se acepte.

### Cómo llegan las Observations al inventario [propuesta, por decidir]

Hoy el auto-refresh del inventario recoge las detecciones dentro del mismo proceso
(`_perception_observation_sinks`) y corre dos scripts por subproceso. Con la percepción en el
Jetson hace falta que la laptop obtenga las `Observation` (`timestamp`, `detected_class`,
`code_data`, `code_read`, `confidence`, `location_marker_id`). Se propone que la **laptop las
pida** al agente (por ejemplo `GET /observations?desde=…`), porque la laptop es el único punto de
mando. La alternativa, que el Jetson las envíe a la laptop, se descarta por ahora. **Hay que
confirmarlo**, y esto no existe en el código hoy.

## Dónde se sirven las páginas: la decisión que necesito de Mario [por decidir]

La frase "el Jetson con todas las interfaces y la Pi solo con la interfaz de la celda" admite
dos lecturas, y cambian el trabajo:

| | **A. Cada equipo sirve su(s) página(s)** | **B. La laptop sirve todas; cada equipo abre la que le toca** |
|---|---|---|
| Idea | El Jetson y la Pi corren un servidor web local con sus páginas y reenvían a la laptop lo central (`/robot/*`, `/inventory*`) | El navegador del Jetson abre `http://<laptop>:8000/robot.html` y el de la Pi abre `celda.html` |
| Cambia las páginas | No, si se usa un proxy inverso en cada equipo; sí, si se agrega una dirección base y CORS | No |
| Voz de Lumina (`SpeechRecognition`) | Funciona con `http://localhost:…` **[por verificar]** | Chrome suele bloquear el micrófono en `http://192.168.x.x`, que no es un origen seguro **[por verificar]** |
| Si la laptop se apaga | Las páginas cargan, pero sin datos ni Lumina | Los equipos se quedan sin página |
| Trabajo | Mayor: proxy (incluye WebSocket) o cambios en las páginas | Menor: solo URLs de arranque |

**Recomendación:** empezar por **B** y pasar a **A** solo si la voz de Lumina no funciona desde
otro origen. La prueba de "otro origen" ya no necesita el Jetson: abrir
`http://192.168.100.14:8000/robot.html` en el Chrome de la **laptop** usando esa IP (y no
`localhost`) basta para ver si el navegador permite el micrófono desde un origen que no es seguro.
Y como el Jetson hoy **no tiene navegador que funcione**, la lectura **B** también depende de la
sección siguiente.

## Cómo mostrar las interfaces en el Jetson sin depender de snaps [propuesta, por decidir]

**Por qué hay que resolverlo.** Ubuntu 22.04 entrega Chromium y Firefox solo como snap, y los
snap no arrancan en este Jetson. Dos fuentes externas describen un problema con el mismo mensaje:
desde `snapd` 2.70 los snap dependen de capacidades de archivo guardadas en la imagen SquashFS, y
el kernel de Jetson no trae `CONFIG_SQUASHFS_XATTR` ni AppArmor
([JetsonHacks](https://jetsonhacks.com/2025/07/12/why-chromium-suddenly-broke-on-jetson-orin-and-how-to-bring-it-back/),
[hilo del foro de NVIDIA](https://forums.developer.nvidia.com/t/jetpack6-2-2-snap-issue-is-back/359806)).
**[por verificar]** que sea la causa en este equipo: ese hilo trata JetPack 6.2.2 (L4T r36.5) y no
menciona 36.4.7. Los comandos de solo lectura para comprobarlo están en la bitácora. `DISPLAY`
vacío (el comando se corrió por SSH) es un problema aparte, porque una aplicación gráfica necesita
la sesión del escritorio; el error de `snap-confine` aparece antes y no depende de eso.

**La voz es un riesgo aparte.** `robot.html` usa `SpeechRecognition` del navegador. Fuentes de
terceros indican que Chrome manda el audio a servidores de Google, que Chromium y otros
navegadores basados en él suelen no traerlo funcionando porque no incluyen las claves de Google, y
que Firefox lo trae desactivado por defecto. **[por verificar en este equipo]**. Consecuencia:
aunque se logre un navegador en el Jetson, la voz de Lumina podría no funcionar ahí, y no se asume
que sí.

| # | Opción | Toca el Jetson | Voz de Lumina | Costo y riesgo |
|---|---|---|---|---|
| 1 | **Pantalla fuera del Jetson**: las páginas se abren en el Chrome de la laptop (o de cualquier equipo con Chrome); el Jetson solo corre el agente y la cámara | No | Funciona en Chrome de escritorio **[por verificar]** | El Jetson no muestra nada propio; depende de la laptop |
| 2 | Chromium por **Flatpak** (Flathub, `org.chromium.Chromium`), sin snap | Sí, con `sudo` (instalar Flatpak y reiniciar) | Probablemente sin voz **[por verificar]** | Agrega Flatpak y un repositorio de terceros; el sandbox pide funciones del kernel **[por verificar]** |
| 3 | Chromium `.deb` del PPA comunitario `ppa:xtradeb/apps` (arm64) | Sí, con `sudo` | Igual que 2 | Repositorio de terceros no oficial |
| 4 | Firefox `.deb` del repositorio de Mozilla | Sí, con `sudo` | Sin voz | **[por verificar]** que haya paquete para arm64 |
| 5 | **Arreglar snap**: reinstalar `snapd` (según el foro, temporal), bajar o fijar su versión, o reconstruir el kernel con AppArmor y `SQUASHFS_XATTR` (lo que indica el personal de NVIDIA) | Sí, delicado | n/a | Alto costo; reconstruir el kernel es un proyecto aparte. **No recomendada** |
| 6 | **Voz fuera del navegador** (reconocimiento en la laptop o en el Jetson) y una pantalla ligera | Código nuevo | Resuelve la voz | Decisión futura, no ahora |

**Recomendación:** la opción **1** por ahora. No toca el Jetson, desbloquea el resto del trabajo y
sirve para probar `robot.html` y la voz con el Chrome de la laptop. Solo si hace falta una pantalla
propia en el Jetson se evalúan las opciones 2 o 3, probadas primero en un entorno desechable.
**No se toca `snapd`.** La opción 6 se decide cuando se sepa si la voz del navegador alcanza.

## Consecuencias

- **Red [reportado]:** hay que fijar o reservar las direcciones IP (laptop por WiFi, Jetson por
  cable) y abrir el puerto 8000 en el firewall de Windows. Usar IP y no `*.local`: con WiFi y
  cable activos a la vez se vieron desconexiones de SSH.
- **Un punto único de falla:** si la laptop se apaga, los equipos pierden páginas, LLM e
  inventario. Cada agente debe seguir cerrando su cámara y reportando su `/status` sin depender
  de la laptop.
- **Relojes [por verificar]:** las `Observation` llevan la hora del equipo que las generó. Hace
  falta sincronizar la hora (NTP) en el Jetson y la Pi para que el historial no se desordene.
- **Llaves:** ElevenLabs, Zavu y Google se quedan solo en la laptop. Los agentes no guardan
  ninguna.
- **Celda y GPIO:** `cell_line.py` y `cell_hmi.py` pertenecen donde está el cableado, que es la
  Pi. **Esta ADR no decide** si la celda usa GPIO directo o PLC por Modbus: eso depende de lo que
  confirme el equipo (hoy el código dice GPIO y LOGO, y la hoja de conexión dice PLC por
  Modbus). Hasta entonces, ningún equipo instala `gpiod`. Pasar `cell_line.py` a la Pi implica
  partir `main.py`, que hoy es un solo archivo.
- **Credenciales de la HMI:** `cell_hmi.py` trae la cuenta fija `admin`/`admin` en el código y el
  repositorio es público. Hay que sacarla a una variable de entorno **antes** de conectar
  cableado real. No es parte de esta ADR, pero se deja constancia.
- **Terminología (documento maestro 4.2):** ArUco verifica posición, no navega; la visión de
  línea hoy confirma presencia o clase, no calidad. **[código]** `PASS` significa "el nombre está
  en `classes.txt`", no una inspección de defectos.

## Alternativas consideradas

1. **Backend completo en cada equipo**, como se probó en el Jetson el 2026-10-21 [reportado].
   Se descarta como arquitectura: la lógica de escritorio de Lumina es solo Windows, la base de
   datos y el LLM se duplicarían y las llaves tendrían que repartirse.
2. **Agentes mínimos y laptop central** (esta propuesta).
3. **Agentes con su propia interfaz y proxy** (lectura A): más trabajo, útil solo si la voz o
   la operación sin laptop lo exigen.

## Lo que esta ADR NO decide

- El actuador final del pistón (PLC o microcontrolador), ni la interfaz de disparo.
- El criterio real de PASS/FAIL de ensamble.
- Docker, MQTT o Modbus: siguen fuera.
- Cómo se asegura el acceso (más allá de "solo red local").

## Plan por fases, si se acepta [propuesta]

0. Conciliar la documentación vieja (lista de abajo), sin tocar código.
1. Agente del Jetson (percepción) con el contrato de arriba y reenvío en la laptop.
2. Obtención de `Observation` desde la laptop.
3. Agente de la Pi (visión de línea y su interfaz), **sin GPIO**.
4. Medir FPS reales en ambos equipos (alimenta los umbrales `[PENDIENTE]` de
   `criterios_aceptacion.md`).

Cada fase termina con una prueba en el hardware y se anota en `docs/jetson/BITACORA_JETSON.md`.

## Preguntas abiertas para Mario

1. ¿"Interfaces" son las **páginas** y se sirven como en la lectura **B** (recomendada) o **A**?
2. ¿El Jetson tendrá pantalla, micrófono y bocina propios? Hoy no abre ningún navegador. ¿Qué
   opción de la sección de navegadores prefieres, y funciona la voz de Lumina desde otro origen
   (prueba con el Chrome de la laptop)?
3. ¿La Pi tiene pantalla propia para la interfaz de la celda, o se opera desde otro equipo?
4. ¿Las `Observation` las **pide la laptop** (propuesta) o las envía el Jetson?
5. ¿Dónde viven `cell_line.py` y `cell_hmi.py`: en la Pi (propuesta, sin GPIO por ahora) o en la
   laptop?
6. ¿Qué está cableado de verdad en la celda: relevadores por GPIO hacia un LOGO, o un PLC por
   Modbus? (la confirmación con el equipo sigue pendiente).

## Deuda documental que este borrador propone reconciliar (sin editar nada todavía)

| Documento | Qué dice hoy | Qué pasa |
|---|---|---|
| `aether_context_docs.md` líneas 110 y 208 | Contingencia "Raspberry Pi 5 + AI HAT+" | Dato desactualizado: la Pi real es la 4, sin acelerador |
| `aether_context_docs.md` línea 209; ADR 0010 líneas 19-20 y 69-72; ADR 0008 (8c) | Visión de línea en una "PC fija" | La visión de línea corre en la Pi 4 |
| `0004-hardware-computo.md` línea 9 | Contingencia Pi 5 + AI HAT+ | Igual que arriba |
| `contracts/rest_api.md` líneas 46-47 | `sources.plc` es true cuando los GPIO 8 y 9 están abiertos | Contradice la hoja de conexión (PLC por Modbus); falta confirmar lo cableado |
| `contracts/rest_api.md` | No documenta los agentes ni `POST /line/cell/session` y similares con su comportamiento actual | Agregar cuando se acepte |
| `docs/hardware/datasheet-conexion-celda.md`, `guia-de-construccion.md`, `AETHER_COMPENDIO.md:278`, `docs/hardware/_build/armar_*.js` | `CELL_AGENT_URL` (:8080), `pymodbus`, "la Pi no usa GPIO" | El código no consume `CELL_AGENT_URL`, y `cell_line.py` sí maneja GPIO y un LOGO |
| `URLS_Y_COMANDOS.md` | La celda es "estado simulado"; no menciona el Jetson ni la Pi | Falta; ahora hay `COMANDOS_LINUX.md` |
| `criterios_aceptacion.md` §8; `contracts/line_handshake_protocol.md` | La visión de línea solo detecta presencia | **[código]** ya clasifica por nombre con `parts.pt` (PASS si está en `classes.txt`) |
| `backend/README.md`, `edge/README.md` | "Python 3.11" | El Jetson trae 3.10; el código ya corre en 3.10 |
| `dashboard/celda.html` | Marca fija "SIM" (por la hoja de conexión) | **[por verificar]** no se abrió ese archivo |
