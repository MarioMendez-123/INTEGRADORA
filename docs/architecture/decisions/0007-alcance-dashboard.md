# ADR 0007 — Alcance mínimo del dashboard defendible comercialmente

**Estado:** Aceptada

## Contexto

El dashboard es el único componente que un cliente potencial (o evaluador
académico) ve directamente. El riesgo principal es mostrar un número de
inventario sin comunicar qué tan confiable es — romper el principio de
honestidad de producto (sección 4.1 de `aether_context_docs.md`).

Restricción dura: 6 personas, ~240 horas totales para todo el proyecto, no
solo el dashboard.

## Alternativas evaluadas

| Opción | Descripción | Tiempo estimado | Veredicto |
|---|---|---|---|
| A — Inventario Declarado | Solo lectura: producto, cantidad, estado de cobertura (`COMPLETE`/`PARTIAL`/`INVALID`), fecha de última inspección. Vía REST, sin tiempo real. | ~15–20 h | Insuficiente por sí sola — honesta pero no comunica que hay un robot real detrás. |
| B — A + Historial y Trazabilidad | Agrega vista de historial por ubicación: cuándo se inspeccionó, qué estado tuvo cada vez, bitácora simple de inspecciones. | +25–35 h sobre A | **Seleccionada.** |
| C — B + Monitoreo en vivo del robot | Agrega estado en tiempo real (batería, posición, tarea en curso) vía puente MQTT→WebSocket. | +20–30 h sobre B | No entra al MVP, pero se registra como futuro necesario (ver abajo). |

## Decisión

**Opción B — Inventario Declarado + Historial y Trazabilidad** es el alcance
mínimo defendible comercialmente para el MVP.

## Justificación

Lo que convence a un cliente escéptico no es ver al robot moverse en vivo,
sino poder auditar cómo se llegó a un número de inventario: cuándo se
inspeccionó, con qué estado de cobertura, y con qué frecuencia. Eso es
exactamente lo que agrega la Opción B sobre la A. El monitoreo en vivo
(Opción C) tiene el mayor "factor sorpresa" pero también el mayor riesgo de
consumir presupuesto de tiempo en un componente de infraestructura (puente
MQTT→WebSocket) que hoy no existe, sin ser indispensable para la
defendibilidad comercial del MVP.

## Estado de la Opción C — futuro necesario, no opcional

A diferencia de otras características diferidas en este proyecto (SLAM,
clasificación visual pura de SKU), el monitoreo en vivo del robot no se
registra como "nice to have" descartable. Se marca explícitamente como
evolución obligatoria posterior al MVP: el roadmap comercial del producto la
requiere, solo que no entra en la ventana de 240 horas del entregable
académico actual.

Implicación de diseño concreta: la arquitectura de comunicaciones (Decisión 6)
y el backend deben construirse de forma que agregar el puente MQTT→WebSocket
más adelante no requiera rediseñar el flujo de datos ya implementado en la
Opción B.

## Implicaciones técnicas

- Vive en `dashboard/`, consumiendo `backend/api/` vía REST.
- La consulta de historial requiere una nueva ruta en `backend/api/` que lea
  Observations agrupadas por ubicación, no solo el último Declared Inventory
  (ver Decisión 5).
- El estado de cobertura (`COMPLETE`/`PARTIAL`/`INVALID`) debe mostrarse
  siempre con su explicación visible en la UI — no basta con el badge, para no
  romper el principio de honestidad de producto (`COMPLETE` no implica
  visibilidad física garantizada del 100% del inventario real).
- `backend/api/` debe diseñarse dejando claro en `contracts/rest_api.md` qué
  endpoints son de la Opción B (implementar ahora) vs. cuáles se anticipan para
  la Opción C (documentar el contrato, no implementar todavía) — así el puente
  MQTT→WebSocket futuro no obliga a romper contratos ya en uso.
