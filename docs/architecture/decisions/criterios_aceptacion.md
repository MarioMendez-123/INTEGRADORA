# Criterios de Aceptación del MVP — Aether

**Documento:** `docs/mvp_acceptance_criteria.md`
**Estado:** Estructura cerrada. Umbrales numéricos **pendientes de definir con
datos reales** de pruebas tempranas (ver sección "Umbrales pendientes" al
final).

Cada criterio es una condición verificable (sí/no), no una aspiración. El MVP
se considera terminado cuando todos los criterios de las secciones 1–8 se
cumplen, y ninguno de los puntos de la sección 9 (fuera de alcance) se ha
colado por la puerta de atrás.

---

## 1. Percepción (Aether Inventory)

- [ ] El sistema detecta objetos en el campo de visión de la cámara usando
      YOLO, con una tasa de detección mínima de **`[PENDIENTE]`%** sobre un
      set de prueba fijo (ej. 20 productos conocidos, en condiciones de luz
      del laboratorio).
- [ ] El sistema lee códigos de barras/QR de al menos **`[PENDIENTE]`%** de
      los productos con el código visible y sin obstrucción.
- [ ] Cuando YOLO detecta un objeto pero no logra leer su código, el sistema
      registra la detección igual (no la descarta), consistente con la
      Decisión 1.

## 2. Localización (ArUco)

- [ ] El robot detecta e identifica correctamente marcadores ArUco colocados
      en puntos conocidos, con error de posición reportado menor a
      **`[PENDIENTE]` cm**.
- [ ] Cada `Observation` registrada incluye una localización verificada por
      ArUco, no solo una estimación por odometría sola.

## 3. Navegación

- [ ] El robot completa una ruta de waypoints predefinida sin intervención
      manual, en un recorrido de prueba fijo (ej. 3–5 puntos en el
      laboratorio).
- [ ] Ante un obstáculo colocado deliberadamente en la ruta, el robot se
      detiene o reacciona (no lo ignora ni colisiona) — verificable con al
      menos 3 pruebas repetidas.
- [ ] El error acumulado de odometría en el recorrido de prueba se mantiene
      dentro de **`[PENDIENTE]` cm/metro recorrido**.

## 4. Hardware

- [ ] El Jetson Orin Nano corre el pipeline de percepción (YOLO + lectura de
      código) en tiempo real suficiente para no bloquear la navegación —
      umbral concreto: **`[PENDIENTE]`** (definir como FPS mínimo o ms
      máximo por frame).
- [ ] El watchdog de seguridad en el ESP32/STM32 detiene los motores
      correctamente al perder comunicación con el Jetson, verificado
      desconectando el Jetson deliberadamente durante una prueba.

## 5. Esquema de datos

- [ ] Una inspección completa del recorrido de prueba genera un registro con
      estado `COMPLETE`.
- [ ] Una inspección interrumpida a la mitad genera un registro con estado
      `PARTIAL`, y **no sobrescribe** el `Declared Inventory` previo —
      verificable comparando el inventario antes y después de la inspección
      interrumpida.
- [ ] Existe al menos un caso de prueba donde una inspección se marca
      `INVALID` (ej. forzando un error de sensor) y se confirma que no se
      usa para actualizar inventario.

## 6. Comunicaciones

- [ ] La telemetría del robot (batería, estado, posición) llega vía MQTT y
      es consultable.
- [ ] El dashboard consume datos vía REST y refleja correctamente el estado
      del `Declared Inventory`.
- [ ] La parada de seguridad funciona **con la red desconectada** — prueba
      explícita: desconectar WiFi/red del robot y confirmar que el comando
      de parada de emergencia sigue funcionando.

## 7. Dashboard (Opción B)

- [ ] Muestra, por ubicación: producto, cantidad declarada, estado de
      cobertura (con explicación visible de qué significa cada estado), y
      fecha/hora de última inspección.
- [ ] Muestra historial/bitácora de inspecciones por ubicación (mínimo:
      fecha, estado de cobertura de cada inspección pasada).
- [ ] Ningún número de inventario se muestra sin su estado de cobertura
      asociado — verificación de que no existe una vista que rompa el
      principio de honestidad de producto.

## 8. Línea de manufactura (KUKA + UR5 + Aether Inventory)

- [ ] El KUKA KR6 coloca una pieza en la banda transportadora mediante su
      trayectoria pre-programada, disparado por la señal externa definida
      en `contracts/line_handshake_protocol.md`.
- [ ] El UR5 ejecuta su trayectoria de ensamble al recibir el handshake del
      KUKA.
- [ ] El sistema de visión de línea emite una confirmación binaria (pieza
      ensamblada correctamente sí/no) tras el ensamble del UR5.
- [ ] Aether Inventory recoge y transporta la pieza terminada tras recibir
      la confirmación positiva de visión.
- [ ] Cada evento de la secuencia (KUKA→UR5→visión→Aether Inventory) queda
      registrado como `Observation` vía el listener MQTT — verificable
      revisando el historial tras una corrida completa.
- [ ] Existe al menos una corrida completa **end-to-end** grabada en video o
      log, desde que el KUKA coloca la primera pieza hasta que Aether
      Inventory la transporta a destino.

## 9. Fuera de alcance del MVP (criterio negativo)

Igual de importante que lo anterior — define qué **no** se requiere, para que
el alcance no se difumine durante la implementación:

- [ ] No se requiere Learning from Demonstration funcional — las
      trayectorias del UR5 son pre-programadas (ver ADR 0008).
- [ ] No se requiere monitoreo en vivo del robot en el dashboard (Opción C —
      registrada como futuro necesario, no como parte del MVP; ver ADR
      0007).
- [ ] No se requiere que el sistema opere fuera del entorno controlado del
      laboratorio.
- [ ] No se requiere clasificación visual pura de SKU (sin código de
      barras).

---

## Umbrales pendientes

Los siguientes valores quedan **explícitamente sin definir** hasta contar con
datos de pruebas tempranas del equipo. No se fabrican números aquí para no
fijar una meta arbitraria que luego resulte irreal o, al revés, demasiado
laxa para ser comercialmente defendible.

| Ubicación | Umbral pendiente |
|---|---|
| Sección 1 | Tasa mínima de detección YOLO (%) |
| Sección 1 | Tasa mínima de lectura de código de barras/QR (%) |
| Sección 2 | Error máximo de posición por ArUco (cm) |
| Sección 3 | Error acumulado máximo de odometría (cm/metro recorrido) |
| Sección 4 | Umbral de tiempo real del pipeline de percepción (FPS o ms/frame) |

**Proceso para cerrarlos:** una vez que el equipo tenga las primeras
corridas de prueba de percepción y navegación, estos valores se llenan con el
dato medido (o un margen razonable sobre él) y este documento se actualiza —
siguiendo el mismo proceso de cambio de `AETHER_PROJECT_CONTEXT.md` sección
9 si el ajuste llega a afectar alguna decisión de arquitectura ya cerrada
(por ejemplo, si el Jetson no alcanza el umbral de tiempo real y eso obliga a
reconsiderar la Decisión 4 de hardware).

---

## Referencias

- `AETHER_PROJECT_CONTEXT.md` — contexto general y estructura de carpetas.
- `docs/architecture.md` — las 8 decisiones arquitectónicas de Fase 0.
- `docs/architecture/decisions/0007-alcance-dashboard.md`
- `docs/architecture/decisions/0008-integracion-manipulacion.md`
- `contracts/line_handshake_protocol.md`