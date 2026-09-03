# ADR 0009 — Auto-refresh de Declared Inventory

**Estado:** Aceptada

## Contexto

Declared Inventory (Decisión 5) se actualiza hoy mediante una tubería manual
de tres pasos que alguien tiene que correr a mano, en orden: captura de
cámara (`edge/perception/`), agregación (`edge/inventory_engine/`) y carga al
backend (`backend/scripts/load_from_edge.py`). Sin una persona corriendo esa
tubería, el dashboard puede mostrar una "última actualización" de días de
antigüedad aunque el sistema esté funcionando — no es una falla, es el
comportamiento documentado de la Opción B (Decisión 7), pero genera una
pregunta legítima y recurrente: ¿por qué el inventario "no se actualiza
solo"?

La Decisión 7 ya identificó esta necesidad y la registró explícitamente como
"Opción C — Monitoreo en vivo del robot", pero la marcó fuera del MVP por
alcance y presupuesto de horas: esa opción incluye telemetría completa del
robot (batería, posición, tarea en curso) vía un puente MQTT→WebSocket que
todavía no existe. Construir esa opción completa ahora seguiría sin ser
viable con el presupuesto de ~240 horas del proyecto.

Sin embargo, una porción mucho más pequeña de esa necesidad — que el
inventario ya calculado se refresque solo, sin tocar la telemetría del
robot ni requerir WebSockets — sí es alcanzable ahora, y además se volvió
técnicamente viable por un cambio reciente: `CameraPublisher`
(`backend/camera_publisher.py`) ya resuelve la contención de cámara entre
clientes concurrentes. Antes de esa arquitectura, un loop de captura
continua en segundo plano habría competido por el mismo dispositivo físico
con el botón de demo interactiva de Percepción (`GET /perception/stream`);
ahora ambos pueden suscribirse a la misma cámara al mismo tiempo sin abrir
dos veces el dispositivo.

## Decisión

Se adopta un **auto-refresh de Declared Inventory**: un loop en segundo
plano, en el backend, que cada N segundos (configurable, default 15-30s)
repite el equivalente automático de la tubería manual — captura un tramo de
video real de la cámara de Percepción, agrega las Observations resultantes y
las carga a `declared_entries` / `declared_entry_history` — sin intervención
humana. El dashboard refleja los cambios por *polling* simple del propio
navegador sobre `GET /inventory` y `GET /inventory/history`, ya existentes;
no se introduce WebSockets ni ningún canal de push nuevo. El loop es
iniciable y detenible desde el propio dashboard, nunca arranca solo al
levantar el servidor.

Esta decisión es explícitamente una **versión reducida y parcial** de la
Opción C de la Decisión 7, no su implementación completa: automatiza
únicamente el refresco del inventario ya calculado, reusando la tubería que
ya existía con un temporizador en vez de una persona. La telemetría en vivo
del robot (batería, posición, tarea en curso) — el resto del alcance de la
Opción C — sigue diferida sin cambios; esta decisión no la resuelve ni la
adelanta.

## Justificación

El costo de esta versión reducida es bajo porque no construye
infraestructura nueva de comunicación: reutiliza los mismos tres pasos ya
implementados y probados (percepción, agregación, carga) y el mismo
transporte REST ya expuesto por el backend (Decisión 6) — solo agrega un
temporizador del lado del servidor y un `setInterval` del lado del cliente.
No hay puente MQTT→WebSocket que diseñar, que era precisamente el costo alto
que la Decisión 7 identificó para la Opción C completa.

El riesgo que sí existe — sugerir sin querer que esto es "inventario en
tiempo real de todo el piso" — se contiene por diseño, no por accidente: la
UI debe etiquetar explícitamente esta función como captura continua de una
cámara fija en modo demo, nunca como cobertura real del piso completo
(Principio 4.1, honestidad de producto). El estado de cobertura
(`PARTIAL`/`COMPLETE`/`INVALID`, Decisión 5) sigue sin implementarse — eso
depende del módulo de Navegación, que sigue sin existir — y esta decisión no
lo fabrica ni lo simula.

## Implicaciones técnicas

- El loop vive en `backend/` (cruza a `edge/` solo para invocar sus scripts,
  igual que ya hacía `scripts/refresh_inventory.py` corrido a mano) — no
  introduce un tercer entorno virtual ni mezcla las dependencias de `edge/`
  y `backend/` (ver la separación de venvs documentada en la estructura de
  carpetas).
- Reutiliza `CameraPublisher` para la captura: se suscribe al publicador de
  Percepción ya existente en vez de abrir un tercer consumidor de la cámara
  física, exactamente el problema que esa clase existe para resolver.
- No agrega columnas ni tablas nuevas a `backend/db/models/`: escribe en
  `declared_entries` y `declared_entry_history` con el mismo esquema y la
  misma disciplina de "nunca borrar, nunca sobrescribir el historial" que ya
  aplica a `backend/scripts/load_from_edge.py` (Decisión 5, Principio 4.1).
- El dashboard indica el estado del loop (activo/inactivo) de forma visible
  y explícita como "captura continua de esta cámara", nunca como
  "inventario en tiempo real del piso completo" — mismo vocabulario
  disciplinado que ya exige la sección 4.2 de `aether_context_docs.md` para
  "conteo visible detectado" vs. "conteo real de inventario".
- No cambia `contracts/rest_api.md`: sigue usando `GET /inventory` y
  `GET /inventory/history` tal como están documentados para la Opción B: no
  se anticipan aquí endpoints de la Opción C completa (esos siguen
  documentados, no implementados, como ya establecía la Decisión 7).
- Si en el futuro se retoma la Opción C completa (telemetría en vivo del
  robot), esa es una decisión aparte, con su propia ADR — esta no la
  sustituye ni le resta alcance.
