# ADR 0008 — Línea de manufactura completa (KUKA + UR5 + Aether Inventory)

> **SUPERADA por ADR 0010 (2026-09-16) — registro histórico, no arquitectura
> vigente.** Mario decidió eliminar el brazo KUKA KR6 y el brazo UR5 del
> alcance del proyecto. La línea física pasa a ser banda transportadora +
> fixtures + pistón de expulsión de scrap — ver
> `docs/architecture/decisions/0010-linea-banda-piston.md` para la decisión
> vigente. Este documento se conserva sin modificar como registro de cómo se
> decidió originalmente la integración de manipulación, siguiendo el mismo
> patrón usado con `docs/academic/AI_CONTEXT.md`.

**Estado:** Aceptada (histórica — ver banner de superación arriba)

## Contexto

El requisito académico exige un proceso de manufactura completo, funcional
end-to-end, con hardware real. La línea consta de tres estaciones físicas:

```
[KUKA KR6]  →  coloca piezas en la banda transportadora
      ↓
[UR5]  →  ensambla las piezas mediante trayectorias pre-programadas
      ↓
[Sistema de visión de la línea]  →  confirmación binaria: pieza ensamblada correctamente sí/no
      ↓
[Aether Inventory]  →  recoge la pieza terminada, la transporta, y registra todo el proceso
```

Producto de la línea: piezas automovilísticas. Los tres robots/estaciones son
hardware real, no simulado.

> ⚠️ **Corrección de terminología obligatoria.** El movimiento del UR5 se
> implementa mediante trayectorias pre-programadas por waypoints, sin Learning
> from Demonstration (sin MediaPipe, sin DMPs, sin captura de demostración
> humana). Esto nunca debe describirse como "el robot aprendió la tarea" ni
> como "learning" en documentación, código, comentarios o frente al profesor —
> es programación de trayectorias fijas en el controlador nativo del
> fabricante. Esta distinción sigue el mismo principio de honestidad de
> producto que ya aplica a "conteo visible detectado" y a "detección reactiva
> de obstáculos" (ver sección 4.2 de `aether_context_docs.md`).

## 8a — Modelo de orquestación entre las tres estaciones

**Decisión:** Opción C — Híbrido (handshake punto a punto + registro pasivo).
Cada estación se dispara a sí misma mediante una señal directa a la siguiente
("terminé, tu turno"), sin un orquestador central que controle a los tres
robots. En paralelo, un listener MQTT registra cada evento de la línea como
una Observation, reutilizando el esquema de datos ya definido en la Decisión 5
— sin agregar lógica de control nueva, solo trazabilidad.

**Justificación.** Un orquestador central (Opción B, descartada) significaría
construir el "cerebro" que controla en tiempo real tres robots industriales
físicos — riesgo de integración desproporcionado frente al presupuesto de
horas. El handshake descentralizado puro (Opción A, descartada) no
alimentaría el historial/trazabilidad ya prometido en el dashboard (Decisión
7). La Opción C da trazabilidad completa sin asumir el rol de controlador
central de la célula de manufactura.

## 8b — Cómo se controla cada brazo

**Decisión:** Opción A — Programación nativa del fabricante + disparo externo
simple. Las trayectorias se programan directamente en el controlador de cada
robot (KRL en el KUKA, URScript/PolyScope en el UR5). Aether Inventory (o el
listener de 8a) no controla las trayectorias — solo manda una señal de
arranque simple vía I/O digital o un puente MQTT→I/O hacia cada controlador.

**Justificación.** Es coherente con la decisión explícita de no usar
ROS2/MoveIt (ya descartado junto con el stack de LfD, ver Decisión 8 general y
sección 5). Es también la forma estándar en que se programan estos robots en
piso de producción real, lo cual refuerza la defendibilidad
comercial/académica del proyecto: así se hace en la industria, no es una
simplificación artificial para la escuela.

## 8c — Sistema de visión de verificación final

**Decisión.** Confirmación binaria (pieza ensamblada correctamente: sí/no),
usando el mismo stack de percepción ya establecido para Aether Inventory
(OpenCV / YOLO ligero), en lugar de introducir una tecnología de visión nueva
solo para esta estación.

**Justificación.** Consistente con el principio ya establecido en
`AI_CONTEXT.md`: no introducir tecnologías únicamente porque son populares o
distintas. Reutilizar el stack ya conocido reduce curva de aprendizaje y
riesgo, y mantiene la promesa de "confirmación simple", no clasificación
compleja.

> **Aclaración de hardware de cómputo.** La visión de línea NO corre en un
> dispositivo embebido tipo Jetson — corre en una PC/laptop de escritorio
> normal, colocada en un punto fijo cerca de la celda física, separada del
> Jetson que va montado en el robot móvil (ese sí lleva la cámara de
> Percepción con YOLO + código + ArUco, Decisión 4). Razón: un
> microcontrolador (ESP32/STM32) no tiene GPU y no puede correr YOLO; una PC
> de escritorio normal sí, y es más barata que un segundo Jetson dedicado
> solo para una estación fija que no se mueve.

## Implicaciones técnicas

`edge/manipulation/arm_control/` se subdivide por robot, ya que cada uno usa
su propio lenguaje/controlador nativo:

```
edge/manipulation/
├── arm_control/
│   ├── kuka_kr6/          # programación nativa KRL + disparo I/O
│   └── ur5/                # programación nativa URScript/PolyScope + disparo I/O
├── line_vision/            # visión de verificación final (OpenCV/YOLO ligero) — separada de edge/perception, que es exclusiva de Aether Inventory
└── line_events_listener/   # listener MQTT que registra cada handshake como Observation (sub-decisión 8a)
```

`task_planning/` y `lfd/` (previstos originalmente en `edge/manipulation/`) no
se implementan bajo esta decisión — se eliminan del alcance del MVP académico.
Se dejan como carpetas vacías con un `README.md` explicando que están fuera de
alcance por decisión explícita, no olvidadas.

Nuevo contrato en `contracts/`: `line_handshake_protocol.md` — documenta la
señal exacta (I/O digital o MQTT→I/O) que dispara cada estación y el formato
del evento que el listener registra como Observation.

El puente MQTT→I/O (necesario para 8b) es un componente nuevo que hoy no
existe en ningún módulo ya decidido. Queda pendiente de investigación técnica
del equipo (no es una decisión de arquitectura por resolver aquí, sino una
tarea de implementación): confirmar qué interfaz de E/S exponen el KUKA KR6 y
el UR5 disponibles, y si requiere hardware adicional (ej. un módulo de I/O
industrial) no contemplado en la cotización actual.

## Riesgo de proyecto (no de arquitectura de software)

Operar tres robots físicos reales en secuencia — con tiempos de ciclo, espacio
físico compartido y seguridad entre estaciones — es integración real de
planta, no solo software. Con trayectorias fijas (sin LfD) el riesgo de
software baja considerablemente, pero el riesgo de integración física y
sincronización de timing entre KUKA → UR5 → visión → Aether Inventory sigue
siendo alto para el presupuesto de ~240 horas / 6 personas. Este riesgo debe
monitorearse activamente durante la implementación, no se resuelve con esta
decisión de arquitectura.
