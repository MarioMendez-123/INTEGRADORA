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
   y funcional end-to-end con hardware real — **KUKA KR6** (coloca piezas en la
   banda transportadora) → **UR5** (ensambla mediante trayectorias
   pre-programadas, sin Learning from Demonstration) → sistema de visión de
   confirmación binaria → **Aether Inventory** (recoge la pieza terminada, la
   transporta y registra todo el proceso). Producto de la línea: piezas
   automovilísticas. Ver Decisión 8 en la sección 3 para el detalle completo.

> ⚠️ **Corrección importante de alcance (ver sección 2):** el proyecto académico de
> Mario **exige** integrar un brazo robótico. Esto no es una evolución futura ni un
> "nice to have" — es alcance obligatorio del entregable académico. Cualquier
> arquitectura, cronograma o estructura de carpetas debe reflejar esto desde el
> día uno, aunque la implementación del brazo llegue en una fase posterior del
> desarrollo.

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
| 8 | Integración de manipulación — línea de manufactura completa | **KUKA KR6 + UR5 + Aether Inventory**, hardware real, producto: piezas automovilísticas. Trayectorias del UR5 **pre-programadas por waypoints, sin Learning from Demonstration** — nunca describir como "aprendizaje"/"learning". Orquestación: handshake punto a punto entre estaciones + listener MQTT que registra cada evento como Observation (sin orquestador central). Control de cada brazo: programación nativa del fabricante (KRL / URScript-PolyScope) + disparo externo simple por I/O. Visión de línea: confirmación binaria con el mismo stack ya establecido (OpenCV/YOLO ligero). Ver ADR 0008 (con sub-decisiones 8a, 8b, 8c) para el detalle completo. |

> **Estado del documento:** las 8 decisiones de Fase 0 están cerradas. Cualquier
> cambio futuro a estas decisiones debe seguir el proceso de cambio de la
> sección 9 antes de modificarse aquí.

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
- El movimiento del UR5 es **programación de trayectorias fijas por
  waypoints** en el controlador nativo del fabricante — nunca describirlo como
  "el robot aprendió la tarea" ni como "learning" en código, comentarios,
  documentación o frente al evaluador. No hay Learning from Demonstration en
  el alcance decidido (ver Decisión 8 / ADR 0008).

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
- Cómputo de borde: NVIDIA Jetson Orin Nano Super 8GB (principal) / Raspberry Pi 5 + AI HAT+ (contingencia)
- Control de bajo nivel: ESP32 o STM32
- Línea de manufactura (Decisión 8): **KUKA KR6** (colocación) + **UR5**
  (ensamble, trayectorias pre-programadas) — hardware real, sin simulación.
  Puente MQTT→I/O para disparo entre estaciones: **pendiente de investigación
  técnica** (confirmar interfaz de E/S expuesta por cada controlador y si
  requiere hardware adicional no cotizado).
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
No forma parte del alcance. El UR5 se controla por programación nativa del
fabricante (URScript/PolyScope), no por planeación de trayectorias aprendida.
Se deja constancia de que este stack fue evaluado y descartado, no olvidado:
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
│   ├── manipulation/                # Línea de manufactura (Decisión 8)
│   │   ├── arm_control/
│   │   │   ├── kuka_kr6/            # disparo I/O — trayectorias viven en el controlador KRL
│   │   │   └── ur5/                 # disparo I/O — trayectorias viven en el controlador URScript/PolyScope
│   │   ├── line_vision/             # confirmación binaria (8c) — separado de edge/perception
│   │   ├── line_events_listener/    # listener MQTT → Observation (8a, handshake descentralizado)
│   │   ├── task_planning/           # FUERA DE ALCANCE del MVP — ver README.md en la carpeta
│   │   └── lfd/                     # FUERA DE ALCANCE del MVP — ver README.md en la carpeta
│   │       ├── pose_estimation/
│   │       ├── segmentation/
│   │       └── demonstration_capture/
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
│   ├── line_handshake_protocol.md   # NUEVO (8a/8b) — señal de disparo entre estaciones y formato del evento registrado como Observation
│   ├── mqtt_topics.md
│   └── rest_api.md                  # debe distinguir endpoints Opción B (implementar ya) vs Opción C (documentar, no implementar)
│
├── dashboard/                       # Opción B (Decisión 7): inventario declarado + historial/trazabilidad, solo REST
│
├── simulation/                      # PyBullet / Gazebo — sin uso actual (LfD descartado); se conserva por si se retoma
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

- `edge/manipulation/` existe desde el día uno; con la Decisión 8 cerrada, ya
  tiene subestructura real (arm_control por robot, line_vision,
  line_events_listener) en vez de placeholders genéricos.
- `task_planning/` y `lfd/` se mantienen como carpetas (no se borran) pero
  **fuera de alcance del MVP** por decisión explícita — cada una lleva un
  `README.md` que lo explica, para que no se lean como "olvidadas".
- `contracts/` sigue materializando la disciplina de no filtrar suposiciones no
  verificadas hacia una acción física: con la Decisión 8, el contrato activo es
  `line_handshake_protocol.md` (registro de eventos de la línea como
  Observation); `inventory_to_manipulation.schema.json` queda sin uso porque
  Aether Inventory no dirige a los brazos, solo registra — se conserva por si
  una evolución futura lo requiere.
- `docs/architecture/decisions/` lleva una ADR por cada decisión de Fase 0 (1 a
  8, con 8a/8b/8c como sub-decisiones dentro de la ADR 0008). Fase 0 ya está
  cerrada — ver sección 3.

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
  detalle — la decisión 8 sigue abierta; construir el andamiaje (carpetas,
  contratos) está bien, implementar lógica de negocio específica del brazo
  antes de cerrar la decisión no lo está.
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

Las decisiones 7 y 8 (con sus sub-decisiones 8a/8b/8c) ya están cerradas — ver
sección 3 y las ADRs 0007/0008. Pasos pendientes actuales:

1. Investigación técnica (no arquitectónica) del puente MQTT→I/O: confirmar la
   interfaz de E/S real que exponen el KUKA KR6 y el UR5 disponibles, y si
   requiere hardware adicional no cotizado (ver ADR 0008).
2. Documentar `contracts/line_handshake_protocol.md` con el detalle real una
   vez resuelto el punto 1 (hoy solo tiene el principio decidido, sin la
   interfaz concreta).
3. Definir y documentar en `contracts/rest_api.md` los endpoints concretos de
   la Opción B del dashboard (inventario declarado + historial), distinguiendo
   los que se anticipan para la Opción C (monitoreo en vivo) sin implementarlos
   todavía.
4. Repositorio ya inicializado con la estructura de carpetas de la sección 6
   (andamiaje + `.gitkeep`/`README.md` donde aplica).
5. Primer módulo a implementar: definir junto con el equipo cuál de
   `edge/perception`, `edge/navigation` o `backend/inventory_engine` arranca
   primero, respetando el principio de módulos independientes y probables. La
   línea de manufactura (Decisión 8) tiene el riesgo de integración física más
   alto del proyecto (ver ADR 0008) — monitorear activamente durante la
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
