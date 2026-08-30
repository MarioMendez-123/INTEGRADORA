# API REST

Estado: **endpoints concretos pendientes de definición**; el alcance ya está
cerrado (Decisión 7 / ADR 0007).

La Decisión 6 establece REST/FastAPI como canal de consumo del dashboard. La
Decisión 7 cerró el alcance mínimo del dashboard en Opción B (Inventario
Declarado + Historial y Trazabilidad). Este documento debe distinguir
explícitamente dos grupos de endpoints al definirlos:

- **Opción B — implementar ahora:** lectura del Declared Inventory
  (producto, cantidad, estado de cobertura, fecha de última inspección) y
  lectura de historial/trazabilidad por ubicación (Observations agrupadas,
  ver Decisión 5).
- **Opción C — documentar el contrato, no implementar todavía:** estado en
  vivo del robot (batería, posición, tarea en curso), que llegará vía el
  futuro puente MQTT→WebSocket (evolución obligatoria post-MVP, ver ADR 0007).

No se fabrican aquí rutas/métodos/payloads concretos todavía — documentar cada
endpoint (método, ruta, payload, modelo de datos) cuando se implemente
`backend/api/`, respetando la distinción B vs. C de arriba para que agregar C
después no rompa contratos de B ya en uso.
