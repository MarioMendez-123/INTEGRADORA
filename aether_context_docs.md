# AETHER — CONTEXTO DE PROYECTO PARA CLAUDE CODE

> Este documento es el contexto maestro del proyecto. Debe cargarse en Claude Code
> (por ejemplo como `CLAUDE.md` en la raíz del repo, o referenciado al inicio de cada
> sesión) para que cualquier trabajo de implementación sea coherente con las
> decisiones ya tomadas. No reinventar arquitectura ya definida aquí sin pasar por
> el proceso de cambio descrito en la sección 9.

---

## 1. IDENTIDAD DEL PROYECTO

**Nombre:** Aether — proyecto integrador que combina dos componentes que ahora son
**un solo alcance obligatorio**, no fases separadas:

1. **Aether Inventory**: unidad móvil autónoma de inspección de inventario
   (navegación, percepción, conteo, identificación de producto).
2. **Aether Manipulation (línea de manufactura)**: línea de manufactura completa
   y funcional end-to-end con hardware real — **banda transportadora** con
   **fixtures** que sostienen/posicionan cada pieza → sistema de visión de
   línea que decide **PASS/FAIL** → **pistón** que expulsa la pieza (scrap)
   solo si falla la inspección → **Aether Inventory** (recoge la pieza
   aceptada, la transporta y registra todo el proceso). Producto de la
   línea: piezas automovilísticas. Ver Decisión 8/ADR 0010 en la sección 3
   para el detalle completo.

> ⚠️ **Corrección importante de alcance (ver sección 2):** el proyecto académico de
> Mario **exige** integrar manipulación/actuación física real en la línea de
> manufactura, con hardware real, no una simulación. Esto no es una evolución
> futura ni un "nice to have" — es alcance obligatorio del entregable
> académico. La forma concreta de esa actuación cambió el 2026-09-16 (ver
> Decisión 8/ADR 0010, sección 3): de un brazo robótico (KUKA+UR5) a banda
> transportadora + fixtures + pistón de expulsión — el requisito de hardware
> real end-to-end no cambió, solo el mecanismo que lo cumple.

**Equipo:** 6 integrantes, con sede en Chihuahua, México.

**Ventana de desarrollo:** ~4 meses, ~2 horas diarias de dedicación (~240 horas
totales). Esto es una restricción real de planeación, no solo una meta informal —
toda decisión de alcance debe evaluarse contra este presupuesto de tiempo.

**Tipo de proyecto:** proyecto integrador de ingeniería con ambición de prototipo
comercialmente defendible, no una demo académica desechable.

---

## 2. CAMBIO DE ALCANCE: POR QUÉ EL BRAZO YA NO ES "FUTURO"

La arquitectura previa (`AI_CONTEXT.md` original) trataba a Aether Inventory como
un producto de **solo inspección**: robot móvil que recorre, detecta, cuenta y
reporta. El brazo robótico y el sistema de Learning from Demonstration (LfD)
vivían en un documento aparte (`Aether_Robotics_Idea_Base.md` /
`Aether_Robotics_Arquitectura_Ideal.md`) como una línea de interés paralela.

Esto ya no es correcto. El requisito académico exige que ambos sistemas convivan
en una sola línea funcional:

```
UNIDAD MÓVIL (inspección)  →  detecta / cuenta / localiza
        ↓
BRAZO ROBÓTICO (manipulación) → actúa sobre lo que la unidad móvil detectó
```

**Consecuencias arquitectónicas concretas:**

- El **Inventory Engine** (Observations vs. Declared Inventory) ahora es también
  la fuente de verdad que puede disparar o informar acciones de manipulación, no
  solo un reporte pasivo para dashboard.
- Se necesita un **contrato de datos explícito** entre percepción/inventario y
  planeación de manipulación (qué formato de "esto es lo que veo" consume el
  brazo).
- El stack de LfD (MediaPipe, SAM2, DMPs, Behavior Cloning, ROS2, MoveIt,
  PyBullet/Gazebo) deja de ser "interés futuro" y pasa a ser **stack candidato
  real** para el módulo de manipulación, sujeto a la misma disciplina de
  decisión por fases que el resto del proyecto.
- La estructura de carpetas debe tener un espacio de primera clase para
  manipulación, no un subdirectorio improvisado después.

**Esto NO significa** que el brazo se implemente primero, ni que deba estar
funcional en el MVP inicial. Significa que el diseño de carpetas, esquemas de
datos y contratos de comunicación deben poder acomodarlo sin refactor mayor
cuando llegue su fase de implementación.

> **Actualización:** la Decisión 8 (sección 3) ya resolvió el alcance concreto:
> línea de manufactura KUKA KR6 + UR5 + Aether Inventory, con trayectorias
> pre-programadas (sin LfD) y orquestación por handshake + registro pasivo vía
> MQTT. El módulo de manipulación **sí** se implementa como parte del
> entregable, no queda solo como andamiaje reservado.

> **Actualización 2026-09-16:** Mario eliminó el brazo KUKA KR6 y el brazo UR5
> del alcance (ver ADR 0010, que supersede a la ADR 0008 anterior). La lectura
> de fondo de esta sección 2 — que la manipulación/actuación física es alcance
> obligatorio, de primera clase, no un andamiaje reservado — sigue vigente sin
> cambios; lo que cambió es el mecanismo concreto: ya no es un brazo con
> trayectorias, es banda transportadora + fixtures + pistón de expulsión de
> scrap, disparado por la decisión PASS/FAIL de Visión de línea. El stack de
> LfD sigue descartado sin cambios (nunca aplicó tampoco al UR5, ver sección 5).

---

## 3. DECISIONES ARQUITECTÓNICAS DE FASE 0 (ESTADO ACTUAL)

### Confirmadas (1–8) — Fase 0 cerrada

| # | Decisión | Resolución |
|---|----------|------------|
| 1 | Percepción | Híbrido: detección/conteo basado en YOLO + identificación por código de barras/QR como MVP. Clasificación visual pura de SKU queda reservada para evolución futura. |
| 2 | Localización | Marcadores ArUco para **verificación de posición** — no es un sistema de navegación. Conceptualmente distinto del sistema de navegación por waypoints/odometría. |
| 3 | Navegación | Navegación por waypoints con odometría basada en encoders + **detección reactiva de obstáculos** (no "evasión inteligente"). |
| 4 | Hardware de cómputo | **NVIDIA Jetson Orin Nano Super 8GB** como cómputo de borde principal (67 TOPS, GPU Ampere). Contingencia: Raspberry Pi 5 + AI HAT+ (26 TOPS). Control de bajo nivel: ESP32 o STM32 (motores, watchdog de seguridad, PWM por hardware). |
| 5 | Esquema de datos | Separación en dos niveles: **Observations** (crudo) vs. **Declared Inventory** (declarado). Tres estados formales de cobertura: `PARTIAL`, `COMPLETE`, `INVALID`. Las inspecciones parciales **nunca** sobrescriben silenciosamente el inventario declarado previo. |
| 6 | Comunicaciones | MQTT para telemetría; REST para consumo del dashboard. Los comandos de parada de seguridad son **independientes de la conectividad de red**, vía watchdog de hardware. |
| 7 | Alcance mínimo del dashboard | **Opción B — Inventario Declarado + Historial y Trazabilidad.** Solo lectura vía REST: producto, cantidad, estado de cobertura, fecha de última inspección, más historial por ubicación (bitácora de inspecciones). El estado de cobertura debe mostrarse siempre con su explicación visible en la UI. Monitoreo en vivo (MQTT→WebSocket) queda **fuera del MVP pero registrado como evolución obligatoria**, no descartable — ver ADR 0007. |
| 8 | Integración de manipulación — línea de manufactura completa | **Revisada 2026-09-16, ver ADR 0010 (supersede ADR 0008).** Banda transportadora + fixtures (posicionan cada pieza) + **Aether Inventory**, hardware real, producto: piezas automovilísticas. Ya no hay brazos robóticos ni trayectorias programadas en el alcance. Visión de línea decide **PASS/FAIL**; si `FAIL`, se dispara un **pistón** que expulsa la pieza (scrap) — si `PASS`, no hay actuación. Orquestación: un solo punto de decisión (Visión) + listener MQTT que registra cada resultado como Observation (sin orquestador central, igual que antes). Control del actuador: programación nativa del controlador final (PLC o ESP32/STM32, **pendiente de definir con hardware en mano**) + disparo externo simple. Visión de línea: mismo stack ya establecido (OpenCV/YOLO ligero); a la fecha solo implementa detección de presencia, el criterio real de PASS/FAIL sigue pendiente de implementación. Ver ADR 0010 (con sub-decisiones 10a, 10b, 10c) para el detalle completo. |

> **Estado del documento:** las 8 decisiones de Fase 0 están cerradas. Cualquier
> cambio futuro a estas decisiones debe seguir el proceso de cambio de la
> sección 9 antes de modificarse aquí.

### Decisiones posteriores a Fase 0

| # | Decisión | Resolución |
|---|----------|------------|
| 9 | Auto-refresh de Declared Inventory | **Adoptada el 2026-09-02.** Loop automático en el backend: captura + agregación + carga cada N segundos (configurable, default 15-30s), que refresca `declared_entries` y `declared_entry_history` sin intervención manual. El dashboard refleja los cambios por polling simple sobre `GET /inventory` / `GET /inventory/history` ya existentes — sin WebSockets todavía. Iniciable/detenible desde el propio dashboard. |

> **Decisión 9 es una versión reducida y parcial de la Opción C de la
> Decisión 7** (monitoreo en vivo), que quedó explícitamente diferida como
> "evolución obligatoria posterior al MVP" — no una implementación completa
> de esa opción. La diferencia es de alcance, no solo de grado: esto
> automatiza únicamente el refresco del **inventario ya calculado**
> (Declared Inventory), reusando la misma tubería manual de siempre
> (percepción → agregación → carga) con un temporizador en vez de una
> persona. La Opción C completa — telemetría en vivo del robot (batería,
> posición, tarea en curso) — sigue diferida sin cambios; la Decisión 9 no
> la resuelve ni la reemplaza.
>
> Esta decisión se vuelve viable ahora porque `CameraPublisher`
> (`backend/camera_publisher.py`) ya resuelve la contención de cámara entre
> clientes: antes, un loop de captura continua en segundo plano habría
> competido por el mismo dispositivo físico con el botón de demo
> interactiva de Percepción (`GET /perception/stream`). Con el publicador
> compartido, ambos pueden suscribirse a la misma cámara al mismo tiempo
> sin abrir dos veces el dispositivo.
>
> **Lo que NO cambia:** la interfaz sigue dejando explícito que esto es la
> vista de ESTA cámara fija en modo demo, no cobertura real del piso
> completo. La nota de honestidad sobre cobertura y el módulo de
> Navegación (`inventory.html`, y la terminología precisa de la sección
> 4.2) se mantiene sin modificarse: el estado de cobertura (`PARTIAL` /
> `COMPLETE` / `INVALID`) sigue sin implementarse, y "capturar
> automáticamente" no implica "ver todo el inventario real" — solo implica
> que la persona ya no tiene que correr el comando a mano.

---

## 4. PRINCIPIOS NO NEGOCIABLES (aplican a TODO el proyecto)

### 4.1 Honestidad de producto
El producto vende lo que el cliente realmente compra: *"el robot revisó el
Anaquel 4 y encontró 23 unidades del producto X"*, no detalles de implementación
técnica. Esta disciplina aplica a documentación, lenguaje comercial, APIs y
dashboards. Nunca sobre-prometer capacidades no verificadas.

### 4.2 Terminología precisa (obligatoria en código, comentarios, nombres de
variables/endpoints, y UI)

- "Conteo visible detectado" ≠ "conteo real de inventario" — nunca usar estos
  términos como sinónimos en código ni en UI.
- ArUco = capa de **localización/verificación**, nunca llamarlo "sistema de
  navegación".
- "Detección reactiva de obstáculos", nunca "evasión inteligente".
- "Cobertura completa" = finalización procedimental de la inspección, **no**
  garantía de visibilidad física de todo el inventario. El estado `COMPLETE`
  no implica "vimos todo el producto real".
- El control del actuador de la línea (pistón de expulsión, vía PLC o
  ESP32/STM32) es **lógica de control programada de punto fijo** — nunca
  describirlo como "el sistema aprendió la tarea" ni como "learning" en
  código, comentarios, documentación o frente al evaluador. No hay Learning
  from Demonstration en el alcance decidido (ver Decisión 8 / ADR 0010; ya no
  aplica al UR5, que se eliminó del alcance — ver ADR 0008, superada).

### 4.3 Verificación aritmética y de cifras
Cuando el equipo provea cifras (cotizaciones, mediciones, tiempos), verificar y
señalar discrepancias explícitamente en lugar de aceptarlas en silencio.

### 4.4 Módulos independientes y probables
No implementar toda la arquitectura simultáneamente. Cada módulo debe poder
probarse antes de integrarse con los demás (principio ya establecido en
`AI_CONTEXT.md` original — se mantiene).

### 4.5 No fabricar dependencias, campos o estructuras especulativas
No agregar librerías, campos de esquema, endpoints, o cualquier otro elemento
técnico "por si acaso" antes de que exista una decisión explícita que lo
requiera. Ejemplos ya aplicados en el proyecto:
- No instalar el driver de PostgreSQL mientras esa decisión siga como
  "candidato a escalar".
- No llenar `inventory_to_manipulation.schema.json` con campos antes de que
  una decisión lo requiera.

Si una necesidad futura es previsible pero no está decidida, se documenta como
nota o comentario, nunca se implementa por adelantado.

---

## 5. STACK TECNOLÓGICO CONSOLIDADO

### Hardware
- Cómputo de borde: NVIDIA Jetson Orin Nano Super 8GB (principal) / Raspberry Pi 5 + AI HAT+ (contingencia) — va montado en el robot móvil, corre Percepción (YOLO + código + ArUco)
- Cómputo de visión de línea (Decisión 8c): PC/laptop de escritorio normal, en un punto fijo cerca de la celda de manufactura — **no** un dispositivo embebido, y separada del Jetson del robot móvil. Un microcontrolador (ESP32/STM32) no tiene GPU para correr YOLO; una PC de escritorio sí, y es más barata que un segundo Jetson dedicado a una estación que no se mueve.
- Control de bajo nivel: ESP32 o STM32
- Línea de manufactura (Decisión 8, revisada — ver ADR 0010): **banda
  transportadora** + **fixtures** (posicionan cada pieza) + **pistón** de
  expulsión de scrap — hardware real, sin simulación. Ya no hay brazos
  robóticos en el alcance (KUKA KR6 y UR5 eliminados, 2026-09-16). Actuador
  final del pistón: **PLC o ESP32/STM32, pendiente de definir con hardware en
  mano**. Interfaz de disparo desde Visión de línea hacia ese actuador:
  **pendiente de investigación técnica** (confirmar interfaz de E/S real
  disponible y si requiere hardware adicional no cotizado).
- Cámaras RGB (+ profundidad si aplica) para percepción de Aether Inventory y
  para el sistema de visión de confirmación de la línea (Decisión 8c)
- Marcadores ArUco, lectores de código de barras/QR

### Software — Percepción e inventario
- Python, OpenCV, YOLO, NumPy
- PyTorch (u otro framework compatible con los modelos seleccionados)
- El sistema de visión de la línea de manufactura (confirmación binaria,
  Decisión 8c) reutiliza este mismo stack — no se introduce tecnología nueva
  solo para esa estación.

### Software — Manipulación / LfD: **descartado (Decisión 8)**
No forma parte del alcance. El actuador de la línea (pistón, vía PLC o
ESP32/STM32 — ver ADR 0010) se controla por programación nativa de punto
fijo, no por planeación de trayectorias aprendida — esto ya no aplica al UR5
específicamente (eliminado del alcance, 2026-09-16), pero el principio de
"sin LfD" se mantiene sin cambios para cualquier actuador de la línea. Se
deja constancia de que este stack fue evaluado y descartado, no olvidado:
- ~~MediaPipe (captura de esqueleto/manos)~~
- ~~SAM2 (segmentación)~~
- ~~Behavior Cloning, DMPs (Dynamic Movement Primitives)~~
- ~~ROS2, MoveIt (planeación de trayectorias)~~
- ~~PyBullet / Gazebo (simulación)~~

### Backend / datos / comunicación
- FastAPI (REST para dashboard)
- MQTT (telemetría)
- SQLite (desarrollo) / PostgreSQL (candidato a escalar)
- Docker

### Otros
- Git / GitHub

---

## 6. ESTRUCTURA DE CARPETAS PROPUESTA

Monorepo. Diseñado para que el módulo de manipulación tenga espacio de primera
clase desde el inicio, sin forzar su implementación temprana.

```
aether/
├── AETHER_PROJECT_CONTEXT.md        # este documento (o CLAUDE.md)
├── docs/
│   ├── architecture/
│   │   ├── decisions/               # ADRs, una por decisión (0001-percepcion.md, ...)
│   │   └── diagrams/
│   ├── quotations/                  # cotizaciones de hardware (Excel/PDF)
│   └── academic/                    # entregables académicos, documentos originales
│       ├── Aether_Robotics_Idea_Base.md
│       └── Aether_Robotics_Arquitectura_Ideal.md
│
├── firmware/                        # ESP32 / STM32 — control de bajo nivel
│   ├── motor_control/
│   ├── safety_watchdog/
│   └── pwm_drivers/
│
├── edge/                            # Software que corre en el Jetson Orin Nano
│   ├── perception/                  # EXCLUSIVO de Aether Inventory
│   │   ├── yolo_detection/
│   │   ├── barcode_qr/
│   │   └── aruco_localization/      # SOLO localización/verificación, no navegación
│   ├── navigation/
│   │   ├── waypoints/
│   │   ├── odometry/
│   │   └── obstacle_detection/      # reactiva, no "evasión inteligente"
│   ├── inventory_engine/
│   │   ├── observations/            # capa cruda
│   │   ├── declared_inventory/      # capa declarada
│   │   └── coverage_states.py       # PARTIAL / COMPLETE / INVALID
│   ├── manipulation/                # Línea de manufactura (Decisión 8, revisada — ADR 0010)
│   │   ├── line_actuation/          # reemplaza a arm_control/ (KUKA/UR5 eliminados, 2026-09-16)
│   │   │   ├── plc_backend/         # si el actuador final es el PLC — pendiente de hardware
│   │   │   └── mcu_backend/         # si el actuador final es ESP32/STM32 — pendiente de hardware
│   │   ├── line_vision/             # confirmación binaria (10c) — separado de edge/perception
│   │   └── line_events_listener/    # listener MQTT → Observation (10a, un solo punto de decisión)
│   └── comms/
│       ├── mqtt_client/
│       └── safety_independent_stop/  # independiente de red, vía watchdog
│
├── backend/                         # API + base de datos
│   ├── api/                         # FastAPI, consumido por dashboard vía REST
│   ├── db/
│   │   ├── models/                  # Observations, DeclaredInventory, CoverageState
│   │   └── migrations/
│   └── services/
│
├── contracts/                       # Contratos de datos entre módulos (crítico)
│   ├── inventory_to_manipulation.schema.json  # no requerido para el MVP de la línea (Decisión 8); se conserva por si una evolución futura lo requiere
│   ├── line_handshake_protocol.md   # (10a/10b) — Visión decide PASS/FAIL, dispara el pistón solo si FAIL, formato del evento registrado como Observation
│   ├── mqtt_topics.md
│   └── rest_api.md                  # debe distinguir endpoints Opción B (implementar ya) vs Opción C (documentar, no implementar)
│
├── dashboard/                       # Opción B (Decisión 7): inventario declarado + historial/trazabilidad, solo REST
│
├── hardware/
│   ├── bom/                         # bill of materials, cotizaciones por subsistema
│   └── wiring/
│
├── scripts/                         # setup, despliegue, utilidades
│
└── tests/
    ├── edge/
    ├── backend/
    └── manipulation/
```

**Notas de diseño de esta estructura:**

- `edge/manipulation/` existe desde el día uno; con la Decisión 8 revisada
  (ADR 0010), tiene subestructura real (`line_actuation/` por tipo de
  backend, `line_vision`, `line_events_listener`) en vez de placeholders
  genéricos.
- `arm_control/` (con `kuka_kr6/` y `ur5/`), `task_planning/` y `lfd/` se
  **eliminaron** el 2026-09-16 (no se mantienen como placeholders): con el
  brazo robótico fuera del alcance, no queda ni un brazo del cual disparar
  trayectorias, planificar tareas, ni aprender por demostración. Mismo
  criterio que ya se usó con `simulation/` (ver más abajo).
- `contracts/` sigue materializando la disciplina de no filtrar suposiciones no
  verificadas hacia una acción física: con la Decisión 8/ADR 0010, el
  contrato activo es `line_handshake_protocol.md` (Visión decide PASS/FAIL,
  dispara el pistón solo si FAIL, registro de eventos como Observation);
  `inventory_to_manipulation.schema.json` queda sin uso porque Aether
  Inventory no dirige al actuador, solo registra — se conserva por si una
  evolución futura lo requiere.
- `docs/architecture/decisions/` lleva una ADR por cada decisión de Fase 0 (1 a
  8, con 8a/8b/8c como sub-decisiones dentro de la ADR 0008), más la ADR 0010
  que supersede a la 0008 (10a/10b/10c) sin borrarla — mismo patrón de
  "superar sin borrar" que `docs/academic/AI_CONTEXT.md`. Fase 0 ya está
  cerrada — ver sección 3.
- `simulation/` (PyBullet/Gazebo) se eliminó de esta estructura: estaba
  reservada para el stack de LfD, que ADR 0008 evaluó y descartó
  formalmente. Sin ninguna decisión activa que la reclame, se quitó en vez
  de mantenerla vacía indefinidamente "por si se retoma".

---

## 7. REGLAS PARA CLAUDE CODE EN ESTE PROYECTO

Claude debe actuar como arquitecto de software, asistente de programación, tutor
técnico, revisor de código y apoyo de depuración.

Claude **no debe**:
- Inventar archivos o módulos que no existan.
- Asumir que una dependencia está instalada sin verificarlo.
- Modificar múltiples módulos sin necesidad clara.
- Introducir tecnologías solo porque son populares.
- Ocultar errores o afirmar que algo funciona sin haberlo comprobado.
- Implementar el módulo de manipulación como si ya estuviera decidido en
  detalle — la elección de actuador final (PLC vs. ESP32/STM32, ver ADR
  0010) sigue pendiente de hardware en mano; construir el andamiaje
  (carpetas, contratos) está bien, implementar lógica de negocio específica
  de uno u otro backend antes de confirmar esa elección no lo está.
- Diluir la terminología de la sección 4.2 en nombres de variables, endpoints,
  mensajes de UI o documentación generada.

**Antes de cambios estructurales importantes**, Claude debe:
1. Explicar qué se quiere cambiar.
2. Explicar por qué.
3. Identificar los archivos/módulos afectados.
4. Explicar posibles consecuencias.
5. Esperar confirmación cuando el cambio sea arquitectónicamente significativo.

---

## 8. PRÓXIMOS PASOS

Las decisiones 7 y 8 (con sus sub-decisiones, 8a/8b/8c originalmente, ahora
10a/10b/10c) ya están cerradas — ver sección 3 y las ADRs 0007/0010 (0010
supersede a 0008). Pasos pendientes actuales:

1. Investigación técnica (no arquitectónica) del actuador final: confirmar si
   es un PLC o un ESP32/STM32, qué interfaz de E/S/comunicación expone
   realmente el disponible, y si requiere hardware adicional no cotizado (ver
   ADR 0010).
2. Documentar `contracts/line_handshake_protocol.md` con el detalle real una
   vez resuelto el punto 1 (hoy solo tiene el principio decidido y el formato
   de los dos eventos, sin la interfaz de transporte concreta).
3. Implementar el criterio real de PASS/FAIL en Visión de línea
   (`backend/main.py::_make_line_vision_processor` hoy solo hace detección de
   presencia) y, si se decide, el clasificador de tipo de objeto (1/2/3) —
   ver ADR 0010, sub-decisión 10c.
4. Definir y documentar en `contracts/rest_api.md` los endpoints concretos de
   la Opción B del dashboard (inventario declarado + historial), distinguiendo
   los que se anticipan para la Opción C (monitoreo en vivo) sin implementarlos
   todavía.
5. Repositorio ya inicializado con la estructura de carpetas de la sección 6
   (andamiaje + `.gitkeep`/`README.md` donde aplica).
6. Primer módulo a implementar: definir junto con el equipo cuál de
   `edge/perception`, `edge/navigation` o `backend/inventory_engine` arranca
   primero, respetando el principio de módulos independientes y probables. La
   línea de manufactura (Decisión 8/ADR 0010) tiene el riesgo de integración
   física más alto del proyecto, aunque menor que en la ADR 0008 original (ya
   no hay tres robots coordinados) — monitorear activamente durante la
   implementación; no es algo que esta decisión de arquitectura resuelva por sí
   sola.

---

## 9. PROCESO DE CAMBIO SOBRE ESTE DOCUMENTO

Este documento refleja el estado de decisiones a la fecha de su generación.
Cualquier actualización de alcance (como la del brazo robótico en la sección 2)
debe:
1. Registrarse aquí con fecha y motivo.
2. Reflejarse en la ADR correspondiente dentro de `docs/architecture/decisions/`.
3. Propagarse a la estructura de carpetas si aplica, siguiendo el proceso de la
   sección 7.

### Registro de cambios

- **2026-09-16 — Eliminación del brazo robótico (KUKA KR6 + UR5).** Motivo:
  decisión de Mario de reemplazar la manipulación por actuación con banda
  transportadora + fixtures + pistón de expulsión de scrap, disparado por la
  decisión PASS/FAIL de Visión de línea. Reflejado en la ADR 0010
  (`docs/architecture/decisions/0010-linea-banda-piston.md`), que supersede a
  la ADR 0008 sin borrarla (mismo patrón que `docs/academic/AI_CONTEXT.md`).
  Propagado a: secciones 1, 2, 3, 4.2, 5, 6, 7 y 8 de este documento;
  `contracts/line_handshake_protocol.md`; `contracts/inventory_to_manipulation.schema.json`;
  `docs/architecture/decisions/criterios_aceptacion.md` sección 8;
  `backend/main.py` (`LUMINA_SYSTEM_PROMPT`); `dashboard/index.html` (sección
  "Línea de manufactura"); eliminación de
  `edge/manipulation/arm_control/{kuka_kr6,ur5}/`, `edge/manipulation/lfd/` y
  `edge/manipulation/task_planning/`; creación de
  `edge/manipulation/line_actuation/{plc_backend,mcu_backend}/`.
