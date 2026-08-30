# ADR 0005 — Esquema de datos

**Estado:** Aceptada (Fase 0)

## Decisión

Separación en dos niveles:

- **Observations** (crudo)
- **Declared Inventory** (declarado)

Tres estados formales de cobertura: `PARTIAL`, `COMPLETE`, `INVALID` (ver
`edge/inventory_engine/coverage_states.py`). Las inspecciones `PARTIAL` nunca
sobrescriben silenciosamente el Declared Inventory previo.

## Contexto

Ver `aether_context_docs.md`, sección 3 (Decisión 5) y sección 2 (el Inventory
Engine es ahora también fuente de verdad para informar/disparar acciones de
manipulación, no solo un reporte pasivo).

## Notas de terminología (sección 4.2)

"Cobertura completa" = finalización procedimental de la inspección, **no**
garantía de visibilidad física de todo el inventario. `COMPLETE` no implica
"vimos todo el producto real".

> Opciones evaluadas, ventajas/desventajas e impacto en tiempo/costo no están
> documentados en el contexto fuente. Agregar aquí si el equipo los formaliza.
