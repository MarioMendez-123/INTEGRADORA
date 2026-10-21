# ActFinal — Aether Industrial Systems — Documento Maestro del Proyecto

> Generado el 2026-09-17. Este documento compila **todo** el contexto del
> proyecto en un solo lugar — identidad, decisiones de arquitectura, stack,
> estructura de carpetas, cada módulo de código, los contratos entre
> módulos, la historia de cómo llegó a su estado actual, cómo correrlo,
> problemas conocidos, y los pendientes reales. No reemplaza a
> `aether_context_docs.md` (que sigue siendo el documento de referencia para
> decisiones de arquitectura y el que se actualiza siguiendo su propio
> proceso de cambio, sección 9 de ese documento) — este es un documento de
> panorama completo, parte por parte, pensado para que cualquiera del
> equipo (o cualquiera que retome el proyecto) entienda TODO sin tener que
> leer commit por commit.

---

## Parte 0 — Qué es Aether, en una frase

Un proyecto integrador de mecatrónica (UTCH Sur, Chihuahua, México, equipo
de 6 personas, ~240 horas de desarrollo) que combina dos sistemas físicos
reales en una sola línea funcional: un **robot móvil autónomo** que
inspecciona inventario, y una **línea de manufactura** (banda transportadora
+ visión + pistón de expulsión) que ensambla/verifica piezas automovilísticas.
No es una demo académica desechable — es un prototipo con ambición de
defendibilidad comercial real, con hardware real (no simulado) donde importa.

---

## Parte 1 — Identidad del proyecto

- **Nombre:** Aether — dos componentes que son un solo alcance obligatorio,
  no fases separadas:
  1. **Aether Inventory**: unidad móvil autónoma de inspección de
     inventario (navegación, percepción, conteo, identificación de
     producto). Llamada también "Lumina" en su interfaz conversacional.
  2. **Aether Manipulation** (línea de manufactura): banda transportadora
     con fixtures → visión de línea decide PASS/FAIL → pistón expulsa el
     scrap solo si falla → Aether Inventory recoge la pieza aceptada.
     Producto de la línea: piezas automovilísticas. (Este componente
     originalmente iba a usar dos brazos robóticos, KUKA KR6 + UR5 — ver
     Parte 8 para la historia completa de ese cambio.)
- **Equipo:** 6 integrantes, sede en Chihuahua, México.
- **Ventana de desarrollo:** ~4 meses, ~2 horas diarias (~240 horas
  totales) — restricción real de planeación, no solo una meta informal.
- **Tipo de proyecto:** proyecto integrador de ingeniería con ambición de
  prototipo comercialmente defendible.
- **Repositorio:** `https://github.com/MarioMendez-123/INTEGRADORA`, rama
  de trabajo actual `feature/robot-lumina-camera-sharing`.
- **Documento de contexto maestro (arquitectura):** `aether_context_docs.md`
  (raíz del repo) — cargar siempre al inicio de una sesión de trabajo sobre
  este repo.

---

## Parte 2 — Los 4 principios no negociables (aplican a TODO el proyecto)

1. **Honestidad de producto (4.1).** El producto vende lo que el cliente
   realmente compra ("el robot revisó el Anaquel 4 y encontró 23 unidades
   del producto X"), nunca detalles de implementación técnica disfrazados
   de capacidad. Nunca sobre-prometer capacidades no verificadas.
2. **Terminología precisa (4.2)**, obligatoria en código, comentarios,
   nombres de variables/endpoints y UI:
   - "Conteo visible detectado" ≠ "conteo real de inventario".
   - ArUco = **localización/verificación**, nunca "sistema de navegación".
   - "Detección reactiva de obstáculos", nunca "evasión inteligente".
   - "Cobertura completa" = finalización procedimental, **no** garantía de
     ver todo el inventario real.
   - El actuador de la línea (pistón vía PLC/ESP32/STM32) es **lógica
     programada de punto fijo**, nunca "aprendió la tarea" / "learning" —
     no hay Learning from Demonstration en el alcance.
3. **Verificación aritmética (4.3).** Cifras del equipo (cotizaciones,
   mediciones, tiempos) se verifican y las discrepancias se señalan
   explícitamente, nunca se aceptan en silencio.
4. **No fabricar dependencias/campos/estructuras especulativas (4.5).** No
   se agrega nada "por si acaso" antes de que exista una decisión explícita
   que lo requiera. Ejemplos ya aplicados: no se instaló driver de
   PostgreSQL, `inventory_to_manipulation.schema.json` sigue vacío, los
   backends de `line_actuation/` (PLC/MCU) siguen sin código.

Adicional: **módulos independientes y probables (4.4)** — no se implementa
toda la arquitectura de golpe, cada módulo debe poder probarse solo antes de
integrarse.

---

## Parte 3 — Las decisiones arquitectónicas (ADRs 1-10)

Todas viven en `docs/architecture/decisions/`. Fase 0 (decisiones 1-8) está
cerrada; después se agregaron la 9 y la 10 (que supersede a la 8).

| # | Decisión | Resolución (resumen) | Estado |
|---|---|---|---|
| 1 | Percepción | YOLO (detección/conteo) + código de barras/QR como MVP. Clasificación visual pura de SKU: futuro. | Cerrada |
| 2 | Localización | ArUco para **verificación de posición** — no es navegación. | Cerrada |
| 3 | Navegación | Waypoints + odometría por encoders + **detección reactiva de obstáculos**. | Cerrada (no implementada todavía en código — ver Parte 6) |
| 4 | Hardware de cómputo | **Jetson Orin Nano Super 8GB** (principal) / Raspberry Pi 5 + AI HAT+ (contingencia). Bajo nivel: ESP32 o STM32 (motores, watchdog, PWM). | Cerrada |
| 5 | Esquema de datos | **Observations** (crudo) vs. **Declared Inventory** (declarado). Estados de cobertura `PARTIAL`/`COMPLETE`/`INVALID`. Nunca sobrescribir silenciosamente. | Cerrada, parcialmente implementada (ver Parte 6) |
| 6 | Comunicaciones | MQTT (telemetría) + REST (dashboard). Parada de seguridad **independiente de red** (watchdog de hardware). | Cerrada |
| 7 | Alcance del dashboard | Opción B — Inventario Declarado + Historial. Monitoreo en vivo (Opción C, MQTT→WebSocket): diferido, no descartado. | Cerrada, Opción B implementada |
| 8 | Integración de manipulación | **SUPERADA por la 10** — originalmente KUKA KR6 + UR5. | Histórica |
| 9 | Auto-refresh de Declared Inventory | Loop automático backend (captura+agregación+carga cada N segundos), iniciable/detenible desde el dashboard. | Adoptada 2026-09-02, implementada |
| 10 | Integración de manipulación (revisada) | **Banda transportadora + fixtures + pistón**, supersede a la 8. Ver Parte 8 completa. | Adoptada 2026-09-16 |

---

## Parte 4 — Stack tecnológico completo

### Hardware
- **Cómputo de borde (robot móvil):** NVIDIA Jetson Orin Nano Super 8GB
  (67 TOPS) / Raspberry Pi 5 + AI HAT+ (contingencia, 26 TOPS).
- **Cómputo de visión de línea:** PC/laptop de escritorio normal, fija
  cerca de la celda física — no un dispositivo embebido, separada del
  Jetson (un microcontrolador no tiene GPU para YOLO).
- **Control de bajo nivel (robot móvil):** ESP32 o STM32.
- **Línea de manufactura:** banda transportadora + fixtures + pistón de
  expulsión de scrap. Actuador final (PLC vs. ESP32/STM32): **pendiente de
  definir con hardware en mano**.
- Cámaras RGB para percepción y para visión de línea; marcadores ArUco;
  lectores de código de barras/QR.

### Software — Percepción e inventario
Python, OpenCV (con módulo ArUco), YOLO (`ultralytics`), NumPy, PyTorch.

### Software — Manipulación / LfD
**Descartado.** El actuador de la línea se controla por programación nativa
de punto fijo (PLC o ESP32/STM32), nunca por trayectorias aprendidas.
Evaluado y descartado formalmente (registro, no olvido): MediaPipe, SAM2,
Behavior Cloning, DMPs, ROS2, MoveIt, PyBullet/Gazebo.

### Backend / datos / comunicación
FastAPI (REST), MQTT (telemetría, aún sin tópicos concretos definidos),
SQLite (desarrollo) / PostgreSQL (candidato a escalar, no decidido), Docker.

### Dashboard
HTML/CSS/JS **vanilla**, sin build tools ni npm — servido estático por el
mismo proceso FastAPI (`StaticFiles`, mismo origen, sin CORS). Fuentes
Google Fonts (Big Shoulders Display, IBM Plex Sans, IBM Plex Mono).

### Otros
Git / GitHub.

---

## Parte 5 — Estructura de carpetas, completa, tal como existe hoy

```
INTEGRADORAAHORASI/
├── ActFinal.md                      # este documento
├── aether_context_docs.md           # documento maestro de arquitectura
├── CLAUDE.md                        # referencia a aether_context_docs.md para Claude Code
├── baseline_aether.md               # guion audiovisual del video promocional
├── Aether_Final.mp4                 # video promocional final (entregable)
├── Aether_Logo_Reveal.mp4           # clip del logo, extraído aparte
│
├── docs/
│   ├── CHANGELOG.md                 # registro de cambios de arquitectura para el equipo
│   ├── TODO.md                      # pendientes reales, bloqueados/no bloqueados por hardware
│   ├── architecture/
│   │   ├── decisions/               # ADRs 0001-0010 (0008 superada por 0010)
│   │   └── diagrams/                # vacío (.gitkeep)
│   ├── academic/
│   │   ├── AI_CONTEXT.md            # SUPERADO — registro histórico
│   │   └── arquitectura_ideal.md    # stack de LfD evaluado y descartado
│   └── quotations/                  # cotizaciones de hardware
│
├── firmware/                        # ESP32/STM32, robot móvil — SOLO .gitkeep, sin código aún
│   ├── motor_control/
│   ├── safety_watchdog/
│   └── pwm_drivers/
│
├── edge/                            # software que corre en el Jetson (robot móvil)
│   ├── perception/                  # IMPLEMENTADO — ver Parte 6
│   ├── navigation/                  # SOLO .gitkeep — no implementado (Decisión 3)
│   ├── inventory_engine/            # IMPLEMENTADO — ver Parte 6
│   ├── manipulation/                # línea de manufactura, ver Parte 8
│   │   ├── line_actuation/          # reemplaza a arm_control/ — plc_backend/mcu_backend, solo README
│   │   ├── line_vision/             # SOLO .gitkeep (la demo real vive en backend/main.py)
│   │   └── line_events_listener/    # SOLO .gitkeep — listener MQTT aún no implementado
│   └── comms/                       # SOLO .gitkeep — mqtt_client/safety_independent_stop
│
├── backend/                         # API FastAPI — ver Parte 7
│   ├── main.py
│   ├── camera_publisher.py
│   ├── requirements.txt / requirements-dev.txt
│   └── .venv/ (Python 3.11)
│
├── contracts/                       # contratos de datos entre módulos — ver Parte 9
│   ├── inventory_to_manipulation.schema.json  # vacío a propósito, no requerido para el MVP
│   ├── line_handshake_protocol.md
│   ├── mqtt_topics.md               # pendiente de definición
│   └── rest_api.md                  # desactualizado respecto al código real, ver Parte 7
│
├── dashboard/                       # 3 interfaces, servidas estáticas — ver Parte 10
│   ├── index.html / app.js / portada.js / camera-stream.js / style.css
│   ├── inventory.html
│   ├── robot.html / robot.css / robot.js
│   ├── line-vision.js
│   └── node-field.js                # fondo animado compartido por las 3 páginas
│
├── hardware/
│   ├── bom/                         # bill of materials — vacío (.gitkeep)
│   └── wiring/                      # vacío (.gitkeep)
│
├── tests/
│   ├── backend/                     # 4 archivos de test reales (pytest)
│   ├── edge/                        # 2 archivos de test reales (pytest)
│   └── manipulation/                # vacío (.gitkeep) — nada que probar todavía
│
├── aether_report_package/           # generador del informe académico (docx/PDF) — ver Parte 12
│
└── scripts/                         # setup/despliegue — no explorado en detalle en este documento
```

**Nota de honestidad sobre esta estructura:** varias carpetas (`firmware/`,
`hardware/`, `edge/navigation/`, `edge/comms/`, `edge/manipulation/line_vision/`,
`edge/manipulation/line_events_listener/`, `tests/manipulation/`) existen
**vacías a propósito** — es andamiaje reservado por decisión explícita, no
código real. No leer la presencia de la carpeta como "está implementado".

---

## Parte 6 — `edge/` en detalle: qué está implementado de verdad

### `edge/perception/` — IMPLEMENTADO, probado en la máquina de desarrollo
Pipeline real: YOLO (`ultralytics`) detecta y cuenta, `pyzbar` intenta leer
un código de barras/QR dentro de cada caja delimitadora, ArUco
(`cv2.aruco`) localiza el frame. Archivos reales:
- `capture_headless.py` — captura sin interfaz gráfica (para correr desde
  un script, ej. refresh automático), guarda `observations_output.json`.
- `test_combined.py` — misma lógica, interactivo con ventana de video.
- `test_camera.py`, `test_yolo.py`, `test_aruco.py`, `test_barcode.py`,
  `test_detection_rate.py` — pruebas manuales individuales por componente.
- `generate_aruco_markers.py` — genera las imágenes de marcador
  (`aruco_markers/`, gitignored, regenerable).
- `yolov8n.pt` — pesos del modelo (gitignored, se descarga solo).

**Todos los scripts usan `cv2.VideoCapture(CAMERA_INDEX)` con índice fijo
(0)** — funciona tal cual con una cámara USB estándar; si la cámara final
del Jetson es CSI (cinta plana), hace falta un pipeline GStreamer en su
lugar (pendiente de hardware, ver `docs/TODO.md`).

**Entorno:** `edge/.venv` (Python 3.11), `edge/requirements.txt` instala
`numpy`, `opencv-contrib-python`, `ultralytics`, `pyzbar`, `paho-mqtt`;
`torch` se instala aparte apuntando al índice CPU de PyTorch (build de
desarrollo, distinta de la que necesitará el Jetson real vía JetPack).

### `edge/inventory_engine/` — IMPLEMENTADO parcialmente
- `observations/observation.py` — dataclass `Observation` (registro crudo).
- `declared_inventory/declared_entry.py` — dataclass `DeclaredEntry`
  (resumen agregado). **No incluye estado de cobertura todavía** — depende
  de Navegación, que no existe.
- `coverage_states.py` — define el enum `CoverageState` (`PARTIAL` /
  `COMPLETE` / `INVALID`) como **contrato**, sin lógica de negocio que lo
  asigne todavía.
- `aggregate_observations.py` — primer paso real de agregación: lee
  `observations_output.json`, agrupa por `code_data` (o
  `"unidentified:" + detected_class`), escribe
  `declared_inventory_output.json`. Se corre a mano, no necesita cámara.

**Honestidad importante:** el campo `status` que devuelve `GET /inventory`
(`"active"`/`"retired"`) **no es** el estado de cobertura
(`PARTIAL`/`COMPLETE`/`INVALID`) — son dos cosas distintas. El estado de
cobertura formal sigue sin implementarse en ningún punto del pipeline real
todavía; `inventory.html` lo dice explícitamente en su propio texto.

### `edge/navigation/`, `edge/comms/` — NO implementados
Solo `__init__.py` + `.gitkeep` por subcarpeta. Reservados por Decisión 3 y
6 respectivamente, sin código todavía.

### `edge/manipulation/` — ver Parte 8 completa (el cambio de arquitectura).

---

## Parte 7 — `backend/main.py` en detalle

FastAPI, un solo archivo (948 líneas), Python 3.11, venv en `backend/.venv`.
Sirve `dashboard/` como estático en la raíz (`StaticFiles(..., html=True)`,
mismo origen, sin CORS, sin caché explícita del lado del servidor).

### Los 11 endpoints reales (verificado directo en el código, no en
`contracts/rest_api.md`, que solo documenta 4 y está desactualizado):

| Método y ruta | Qué hace |
|---|---|
| `GET /health` | `{"status": "ok"}` |
| `GET /inventory` | Declared Inventory activo (o todo con `include_retired=true`) |
| `PATCH /inventory/{identifier}/retire` | Marca una entrada como retirada, requiere `password` (`ADMIN_ACTION_PASSWORD`, no es auth real) |
| `GET /inventory/history` | Bitácora completa, más reciente primero |
| `POST /inventory/auto-refresh/start` | Arranca el loop de Decisión 9 |
| `POST /inventory/auto-refresh/stop` | Lo detiene |
| `GET /inventory/auto-refresh/status` | Estado del loop |
| `GET /perception/stream` | MJPEG de la cámara de Percepción (modo demo de escritorio) |
| `GET /perception/recent-detections` | Detecciones recientes para el panel de `robot.html` |
| `GET /line/vision/stream` | MJPEG de Visión de línea — **hoy solo hace detección de presencia** ("PIEZA DETECTADA"/"SIN PIEZA"), no el criterio real PASS/FAIL (ver Parte 8) |
| `POST /robot/ask` | Lumina conversa vía Ollama (`llama3.2:1b` local) |

### `LUMINA_SYSTEM_PROMPT`
Texto exacto que ancla al modelo conversacional de Lumina a hechos reales
del proyecto (percepción YOLO/códigos/ArUco, Declared Inventory, y que la
línea de banda+fixtures+pistón es hardware **planeado, no construido**) —
pide honestidad explícita ("nunca inventes") para todo lo demás. Ya no
menciona KUKA/UR5 (corregido en el cambio de arquitectura, Parte 8).

### `CameraPublisher` (`backend/camera_publisher.py`)
Resuelve la contención de cámara entre múltiples clientes (ej. dos pestañas
del dashboard) suscribiéndose una sola vez al dispositivo físico y
repartiendo los frames — antes cada stream abría su propia captura y
competían por el mismo dispositivo.

### Cómo correrlo
```bash
cd backend
source .venv/Scripts/activate   # Git Bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Dashboard completo en `http://127.0.0.1:8000`.

---

## Parte 8 — El cambio de arquitectura: de brazos robóticos a banda+pistón

### Cómo era antes (ADR 0008, ahora histórica)
KUKA KR6 (coloca la pieza) → UR5 (ensambla, trayectorias pre-programadas,
sin Learning from Demonstration) → visión de línea (confirmación binaria) →
Aether Inventory (recoge). Orquestación: handshake punto a punto entre
estaciones + listener MQTT registrando cada evento como `Observation`.

### Por qué cambió
Decisión de Mario (2026-09-16): se eliminan ambos brazos robóticos del
alcance. Nuevo flujo físico: banda transportadora + fixtures (posicionan
cada pieza) + pistón que expulsa el scrap. Simplifica bastante la
integración física (ya no hay tres robots industriales coordinados con
timing crítico entre ellos) y sigue cumpliendo el mismo requisito
académico: manipulación con hardware real.

### Cómo es ahora (ADR 0010, supersede a la 0008)
```
Banda + fixtures posicionan la pieza
        ↓
Visión de línea decide: PASS o FAIL
        ↓ (solo si FAIL)
Pistón expulsa la pieza (scrap)
        ↓ (si PASS, sin acción del pistón)
Aether Inventory recoge la pieza aceptada
```

**Sub-decisiones:**
- **10a (orquestación):** un solo punto de decisión (Visión), no
  handshake entre múltiples estaciones. `line_events_listener/` sigue sin
  cambio de rol: registra cada resultado como `Observation`.
- **10b (control del actuador):** programación nativa del controlador
  final + disparo externo simple — **la elección entre PLC y ESP32/STM32
  sigue pendiente de hardware en mano.** `edge/manipulation/line_actuation/`
  reemplaza a `arm_control/`, subdividido en `plc_backend/`/`mcu_backend/`
  (ambos solo con README, sin código, hasta confirmar la elección).
- **10c (visión de línea):** mismo stack (OpenCV/YOLO). **Corrección de
  honestidad explícita:** a la fecha, `_make_line_vision_processor` en
  `backend/main.py` SOLO hace detección de presencia binaria — el criterio
  real de PASS/FAIL de inspección, y la clasificación por tipo de objeto
  (1/2/3), **no existen todavía**. Esto queda como trabajo pendiente (ver
  `docs/TODO.md`), no como capacidad ya resuelta.

### Nuevo protocolo de handshake (`contracts/line_handshake_protocol.md`)
Dos eventos:
- **Evento A (Visión → Actuador):** `resultado` (`PASS`/`FAIL`),
  `timestamp`, `tipo_objeto` (`1`/`2`/`3`/`null`, reservado sin
  implementar), `confianza`.
- **Evento B (Actuador → `line_events_listener`, MQTT):** `accion`
  (`"scrap_expulsado"` / `"pieza_aceptada"` / **`"fallo_actuacion"`** — este
  tercer valor se agregó tras un code review, para el caso "Visión decidió
  FAIL pero el pistón no llegó a dispararse", que el enum original de 2
  valores no podía representar sin mentir), `timestamp`, `resultado_origen`.

### Qué se eliminó del repo (mismo criterio que ya se usó con `simulation/`
cuando se descartó formalmente el stack de LfD — no se dejan placeholders
de algo formalmente descartado)
- `edge/manipulation/arm_control/{kuka_kr6,ur5}/`
- `edge/manipulation/lfd/`
- `edge/manipulation/task_planning/`

### Qué se creó
- `edge/manipulation/line_actuation/{plc_backend,mcu_backend}/` (solo
  README, sin lógica — Principio 4.5).
- `docs/architecture/decisions/0010-linea-banda-piston.md`.

### Qué NO se tocó y sigue igual
- `edge/perception/` (percepción del robot móvil) — sistema completamente
  independiente, nunca se mezcló con esto.
- El resto del backend (Inventory Engine, endpoints de inventario).

---

## Parte 9 — Los contratos (`contracts/`)

| Archivo | Estado |
|---|---|
| `line_handshake_protocol.md` | Principio decidido (ADR 0010, 10a/10b), interfaz de transporte concreta (Modbus vs. serial/MQTT) pendiente de hardware. |
| `inventory_to_manipulation.schema.json` | Vacío a propósito — Aether Inventory no dirige al actuador, solo registra. Se conserva por si una evolución futura lo requiere. |
| `mqtt_topics.md` | **Pendiente de definición** — no se fabrican nombres de tópicos sin implementar `edge/comms/mqtt_client/` primero. |
| `rest_api.md` | Documenta 4 endpoints (los de Declared Inventory, Opción B/ADR 0007) — **desactualizado**: el código real (`backend/main.py`) ya tiene 11 endpoints (percepción, visión de línea, Lumina, auto-refresh). Ver Parte 7 para la lista real. |

---

## Parte 10 — El dashboard: las 3 interfaces

Todas comparten `style.css` (tokens de color/tipografía/espaciado) y
`node-field.js` (el fondo animado de campo de nodos, canvas `#field`).

### `index.html` — Portada
Landing con las 8 (ahora efectivamente 9, con la 10 reemplazando a la 8)
decisiones de arquitectura en una tabla, demo en vivo de Percepción
(`camera-stream.js`, botón explícito, nunca autoarranca), sección "Línea de
manufactura" (`line-vision.js`) con las 4 estaciones del flujo banda→visión→
pistón→inventory, y conteo real de Declared Inventory en la portada
(`portada.js`, vía `GET /inventory`, nunca un número fijo escrito a mano).

### `inventory.html` — Declared Inventory
Tabla de inventario declarado + historial (`app.js`), con una nota de
honestidad explícita en el propio HTML: el estado de cobertura todavía no
está disponible (depende de Navegación). Permite retirar entradas
(`PATCH /inventory/{id}/retire`, protegido por contraseña simple).

### `robot.html` — Lumina (la interfaz que más se tocó en las últimas
sesiones)
Interfaz de presentación/campo para el robot móvil — pantalla completa,
pocos elementos, pensada para verse desde lejos. Dos modos mutuamente
excluyentes (por presupuesto de cómputo del Jetson, nunca simultáneos):
- **Modo Conversación** (default): Lumina conversa por voz con un LLM
  local (Ollama, `POST /robot/ask`); cámara y YOLO apagados.
- **Modo Cámara** (al oír "Lumina, inicia"): muestra `/perception/stream`;
  mientras esté activo, nunca se manda nada al LLM.

**Voz:** Web Speech API nativa del navegador (`SpeechRecognition`), palabra
clave **"Lumina"** (no "Aether" — confusión fonética real con "Twitter").
Solo funciona en navegadores **Chromium** (Chrome, Edge) — Firefox/Safari no
la soportan. Diagnóstico completo en consola del navegador, no en pantalla
(salvo el indicador de texto nuevo, ver abajo).

**Rediseño visual "OLED sci-fi" (2026-09-16/17):**
- Paleta neón cian/azul (`#00f3ff`/`#0066ff`), escopeada solo a esta
  página vía override de `--accent` en `.robot-body` (no afecta a
  `index.html`/`inventory.html`).
- Ojos: cápsula/visor en vez de círculo estático (`capsulePath()`),
  pupila reducida.
- Glow de dos tonos (cian + azul profundo) en ojos/boca.
- Idle: respiración continua (escala+brillo) + parallax de mouse sutil.
- Escuchando: 2 anillos de onda concéntrica adicionales, con retraso
  escalonado, sobre el glow que ya existía.
- Pensando: los ojos pasan a un arco tipo spinner que gira
  (`eyePath('arc')` + `.face-eye--spin`).
- Hablando: la boca ya tenía animación reactiva a voz muy sofisticada
  (3 "bandas" proceduales + empuje real en cada `onboundary` de
  `SpeechSynthesisUtterance` — **no es un analizador de espectro real**,
  el navegador no expone esa señal para `speechSynthesis`, ver comentario
  extenso en `robot.js`); se le agregó reacción sutil de los ojos
  (`scaleX`) a la energía de voz.
- Indicador de texto discreto (`ESCUCHANDO...`/`PENSANDO...`/`HABLANDO...`)
  en monospace, solo visible en esos 3 estados.
- **Sin Framer Motion ni React** — vanilla CSS animations + SVG +
  `requestAnimationFrame`, consistente con que este dashboard no tiene
  build tools.

**Bug real encontrado y corregido en este rediseño:** el commit del
rediseño declaró `const prefersReducedMotion` en `robot.js`, pero
`node-field.js` (que se carga antes, en el mismo scope global al ser ambos
scripts clásicos) ya la declaraba — `SyntaxError` de redeclaración que
tumbaba la carga de **todo** `robot.js`, incluida la inicialización del
micrófono. Corregido reutilizando la constante global existente en vez de
redeclararla (commit `2c3b230`).

---

## Parte 11 — El sistema de expresiones de Lumina (`robot.js`), a fondo

10 expresiones declarativas (`EXPRESSIONS`): `inactivo`, `neutral`,
`feliz`, `confundido`, `sorprendido`, `pensando`, `triste`, `error`,
`escuchando`, `activando`. Cada una es una fila declarativa (forma de
ojo/ceja/boca, si hay pupila, color de acento, animaciones especiales) —
`setFaceExpression(name)` es la única función que necesitaría llamar un
futuro modelo de IA que decida la expresión (no implementado, gancho
preparado, Principio 4.5).

Ya existían (no se tocaron en el rediseño): parpadeo con timing aleatorio
real (2.5-6s, 15% de probabilidad de parpadeo doble), deriva de mirada
ocasional en reposo prolongado, easing manual (`current += delta*factor`)
para parpadeo/pupilas/glow en vez de transiciones CSS fijas, y sonidos
generados en vivo con osciladores Web Audio (sin archivos de audio).

`conversationSubState` (`"listening"` / `"thinking"` / `"speaking"`) ya
existía como el modelo de estados real de la conversación — el nuevo
indicador de texto (Parte 10) se enganchó a esa misma variable en vez de
inventar un estado nuevo.

---

## Parte 12 — El video promocional (`aether_report_package/` y videos)

- `Aether_Final.mp4` — video final (6s intro negra + video principal +
  logo reveal como outro), construido en DaVinci Resolve.
- `Aether_Logo_Reveal.mp4` — el clip del logo, exportado aparte.
- `baseline_aether.md` — guion audiovisual con timecodes, sincronizado con
  `speechSynthesis`.
- `aether_report_package/` — generador del informe académico integrador
  (docx/PDF). **Desactualizado respecto a la arquitectura actual**: sus
  capítulos (`ch_2.js`, `ch_3.js`, etc.) y el diagrama
  `assets/diagram_manufacturing_line.svg` todavía describen la línea con
  KUKA/UR5, no banda+pistón — pendiente de regenerar si se requiere para
  la entrega académica (no se tocó en el cambio de arquitectura porque es
  un entregable ya generado, no arquitectura viva).

---

## Parte 13 — Pendientes reales (resumen — ver `docs/TODO.md` para el detalle completo)

**No bloqueado — se puede avanzar en software puro:**
- Criterio real de PASS/FAIL en Visión de línea.
- Clasificador de tipo de objeto (1/2/3) — depende de tener las 3 piezas
  reales de muestra, no del PLC/pistón.

**Bloqueado por hardware:**
- Tipo de cámara del robot móvil (USB vs. CSI).
- PLC vs. ESP32/STM32 para el actuador de línea, y su interfaz de E/S real.
- Implementación de `plc_backend/`/`mcu_backend/`.
- Tópico MQTT/payload final del handshake.
- Control de arranque/paro de la banda.
- Pruebas de timing del pistón.
- Flasheo y verificación de JetPack en el Jetson real.

---

## Parte 14 — Problemas conocidos / troubleshooting

- **El navegador cachea `robot.js`/`robot.css` agresivamente** tras cada
  cambio — el servidor no manda `Cache-Control` explícito. Solución: F12 →
  Network → "Disable cache" y recargar, o "Vaciar caché y volver a cargar
  de forma forzada" (clic derecho sobre ↻ con DevTools abierto), o probar
  en ventana de incógnito/InPrivate. (Pendiente de decidir si se agrega
  cache-busting automático — ofrecido, no implementado todavía.)
- **El micrófono de `robot.html` no se activa:** casi siempre es (en este
  orden de probabilidad) caché del navegador con una versión rota/vieja de
  `robot.js`, navegador no-Chromium (Firefox/Safari no soportan
  `SpeechRecognition`), o permiso de micrófono bloqueado para el origen.
  Nunca la URL: `http://127.0.0.1:8000` ya es un contexto seguro válido.
- **`SyntaxError: Identifier '...' has already been declared`** en
  `robot.js`: revisar que ningún nombre de variable top-level choque con
  `node-field.js` (comparten scope global, ambos scripts clásicos sin
  `type="module"`) — ya pasó una vez con `prefersReducedMotion` (Parte 10).
- **El servidor debe reiniciarse** para que cambios en código Python
  (`backend/main.py`, ej. `LUMINA_SYSTEM_PROMPT`) tomen efecto — los
  archivos del `dashboard/` (HTML/CSS/JS) se sirven en vivo desde disco en
  cada request, sin necesitar reinicio.

---

## Parte 15 — Cómo correr todo el proyecto desde cero

```bash
# Backend (dashboard + API + Lumina)
cd backend
source .venv/Scripts/activate      # Git Bash; o .venv\Scripts\Activate.ps1 en PowerShell
python -m uvicorn main:app --host 127.0.0.1 --port 8000
# → http://127.0.0.1:8000 (portada), /inventory.html, /robot.html
```
```bash
# Percepción del robot móvil (pruebas manuales, aparte del backend)
cd edge
source .venv/Scripts/activate
python perception/test_combined.py     # interactivo, con ventana de video
python perception/capture_headless.py  # sin interfaz, guarda Observations
```
Para limpiar un puerto ocupado: `netstat -ano | grep :8000` para encontrar
el PID, luego `taskkill //PID <PID> //F` (Git Bash) o
`Stop-Process -Id <PID> -Force` (PowerShell).

---

## Parte 16 — Historial de commits relevantes (rama `feature/robot-lumina-camera-sharing`)

```
2c3b230  Fix: quita el const prefersReducedMotion duplicado en robot.js
0e6cf47  Rediseño OLED sci-fi de la interfaz de Lumina (robot.html/css/js)
14ca6d9  Robot Lumina (cara/voz/cámara), changelog y TODO de banda+pistón, video final
9b15e2e  Corrige hallazgos de code review sobre a486eff (tagline y enum de accion)
a486eff  Reemplaza arquitectura de brazos robóticos (KUKA+UR5) por banda+fixtures+pistón (ADR 0010, supersede ADR 0008)
7d89940  Informe: paquete generador del informe integrador (docx/PDF) y capturas reales
2612d48  Edge: script manual de tasa de deteccion YOLO y lectura de codigo
ce34e1a  Robot movil Lumina: interfaz completa (cara, voz, Ollama) + endpoints backend
73e1bd0  Backend+Dashboard: camara compartida (CameraPublisher) y auto-refresh de inventario
a4e6e60  Docs: criterios de aceptacion del MVP
e55416a  Dashboard: identidad visual completa con campo de nodos animado
59bc740  Edge: pipeline combinado de percepcion (YOLO+ArUco+codigo) e Inventory Engine
a23540c  Backend: API de Declared Inventory con retirar por contrasena
9cc985e  Limpieza: archiva docs superados, elimina simulation/ huerfana, corrige rest_api.md y .gitignore
9323add  Estructura inicial de Aether: arquitectura, ADRs, entornos virtuales, logging
```

---

## Parte 17 — Glosario de términos exactos (para nunca romper honestidad de producto)

| Nunca decir | Decir en su lugar |
|---|---|
| "El robot aprendió la tarea" / "learning" | "Trayectorias/lógica programada de punto fijo" |
| "Sistema de navegación" (para ArUco) | "Localización/verificación de posición" |
| "Evasión inteligente de obstáculos" | "Detección reactiva de obstáculos" |
| "Conteo real de inventario" (para lo visible) | "Conteo visible detectado" |
| "Cobertura completa = vimos todo" | "Cobertura completa = la inspección terminó procedimentalmente" |
| "Análisis de audio en tiempo real" (boca de Lumina) | "Simulación procedural sincronizada a eventos reales de habla" |
| "KUKA"/"UR5"/brazo robótico (como algo vigente) | "Banda transportadora + fixtures + pistón" (ver Parte 8) |

---

*Fin de ActFinal.md — si algo de este proyecto cambia después de esta
fecha, este documento debe actualizarse junto con ese cambio, igual que
`aether_context_docs.md` y `docs/CHANGELOG.md`.*
