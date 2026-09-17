# ADR 0010 — Línea de manufactura: banda transportadora + fixtures + pistón de expulsión (supersede ADR 0008)

**Estado:** Aceptada — supersede ADR 0008 en su totalidad.

## Contexto

Decisión de Mario (2026-09-16): se eliminan el brazo KUKA KR6 y el brazo UR5
del alcance del proyecto. La línea física pasa a ser:

```
[Banda transportadora]  →  fixtures sostienen/posicionan cada pieza (elemento
                            mecánico, no sensor)
        ↓
[Visión de línea]  →  evalúa la pieza: PASS o FAIL
        ↓ (solo si FAIL)
[Pistón]  →  expulsa la pieza (scrap) de la banda
```

La visión de línea (Decisión 8c original) no cambia de concepto — sigue
siendo el mismo stack YOLO/OpenCV en una PC fija cerca de la celda, separada
del Jetson del robot móvil — pero se deja constancia honesta de que, a la
fecha de esta ADR, la implementación real
(`backend/main.py::_make_line_vision_processor`) solo hace detección de
presencia binaria ("PIEZA DETECTADA" / "SIN PIEZA"), no una clasificación
pass/fail de ensamble ni una clasificación por tipo de objeto. Ambas quedan
como trabajo de implementación pendiente (ver 10c), no como capacidad ya
resuelta por esta decisión de arquitectura.

## 10a — Modelo de orquestación entre visión y actuador

**Decisión:** Ya no hay estaciones físicas independientes que se disparen
entre sí en secuencia, como en el modelo KUKA→UR5→visión→Inventory de la ADR
0008. Hay un solo punto de decisión (Visión de línea) que dispara una única
acción condicional (el pistón, solo cuando el resultado es FAIL). En
paralelo, `edge/manipulation/line_events_listener/` sigue sin cambio de rol:
escucha por MQTT y registra cada resultado (PASS o FAIL, y si el pistón
disparó de verdad) como una `Observation`, sin agregar lógica de control
nueva — mismo principio que la sub-decisión 8a.

**Justificación.** Con un solo actuador binario (dispara / no dispara) ya no
existe la necesidad de un protocolo de handshake punto-a-punto entre
múltiples controladores — el modelo se simplifica a un evento y una
reacción condicional, reduciendo superficie de fallas de sincronización
frente al modelo de tres robots coordinados.

## 10b — Cómo se controla el actuador físico (pistón, y la banda si aplica)

**Decisión:** Programación nativa del controlador final (PLC o
microcontrolador ESP32/STM32, ver Decisión 4) + disparo externo simple desde
la PC de Visión de línea — mismo principio que la sub-decisión 8b tenía para
los brazos: este repositorio nunca controla la lógica de control de bajo
nivel del actuador, solo le manda una señal simple.

**La elección entre PLC y ESP32/STM32 queda pendiente de definir con
hardware en mano** — no se fabrica aquí una decisión que dependa de qué
interfaz de E/S expone realmente el equipo disponible, siguiendo el mismo
tratamiento que la ADR 0008 original le dio al I/O real de KUKA/UR5. La
interfaz de software (`edge/manipulation/line_actuation/`) debe ser la misma
sin importar cuál se elija; el detalle específico de cada backend
(Modbus/E-S digital para PLC, o serial/MQTT para ESP32/STM32) queda aislado
en una capa delgada.

También queda pendiente de definir con hardware en mano si el software
necesita controlar el arranque/paro de la banda, o si la banda corre de
forma continua e independiente y el software solo controla el pistón.

## 10c — Visión de línea

**Decisión:** Se mantiene el mismo stack y la misma ubicación física que la
sub-decisión 8c (OpenCV/YOLO ligero, PC de escritorio fija cerca de la
celda, separada del Jetson del robot móvil) — no se introduce tecnología de
visión nueva.

**Corrección de honestidad respecto a la ADR 0008 original.** A la fecha de
esta ADR, `backend/main.py::_make_line_vision_processor` solo implementa
detección de presencia binaria, no un criterio real de pass/fail de
ensamble, y no clasifica el objeto por tipo (1/2/3). Ambas capacidades
quedan como trabajo de implementación pendiente — no fabricar en
documentación ni en el system prompt de Lumina (`backend/main.py`) la
afirmación de que ya existen.

## Implicaciones técnicas

`edge/manipulation/arm_control/` (con sus subcarpetas `kuka_kr6/` y `ur5/`)
se elimina del repositorio — no se conserva como placeholder, siguiendo el
mismo precedente que `simulation/` (PyBullet/Gazebo), que ADR 0008 ya había
retirado por completo al descartar formalmente el stack de LfD. Por el
mismo criterio, `edge/manipulation/lfd/` y `edge/manipulation/task_planning/`
también se eliminan: con el brazo eliminado por completo, ya no queda ni un
brazo del cual planificar tareas ni del cual aprender por demostración.

Reemplazo:

```
edge/manipulation/
├── line_actuation/                # reemplaza a arm_control/
│   ├── README.md                  # explica el reemplazo + referencia a esta ADR
│   ├── plc_backend/                # implementación si el actuador final resulta ser el PLC
│   │   └── README.md
│   └── mcu_backend/                # implementación si el actuador final resulta ser ESP32/STM32
│       └── README.md
├── line_vision/                    # sin cambios (10c)
└── line_events_listener/           # sin cambios de rol (10a)
```

`contracts/line_handshake_protocol.md` se reescribe con el nuevo protocolo
de dos eventos (Visión de línea → Actuador; Actuador → listener MQTT).
`contracts/inventory_to_manipulation.schema.json` se mantiene vacío/sin uso,
solo se actualiza el comentario que hacía referencia a "los brazos".

## Riesgo de proyecto (no de arquitectura de software)

Menor que en ADR 0008: ya no hay tres robots industriales físicos
coordinados con timing crítico entre estaciones — solo una banda continua,
un punto de inspección por visión y un pistón de expulsión. El riesgo de
integración física restante (timing del pulso del pistón respecto a la
velocidad real de la banda, y la interfaz de E/S real del PLC o del
microcontrolador que se termine usando) sigue sin resolverse por esta
decisión de arquitectura — es investigación técnica pendiente, no una
decisión arquitectónica abierta.
