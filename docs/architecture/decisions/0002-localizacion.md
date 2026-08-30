# ADR 0002 — Localización

**Estado:** Aceptada (Fase 0)

## Decisión

Marcadores ArUco para **verificación de posición**. Esto es conceptualmente
distinto del sistema de navegación por waypoints/odometría (ver ADR 0003).

## Contexto

Ver `aether_context_docs.md`, sección 3 (Decisión 2).

## Notas de terminología (sección 4.2)

ArUco es una capa de **localización/verificación**. Nunca llamarlo "sistema de
navegación" en código, comentarios, endpoints ni UI.

> Opciones evaluadas, ventajas/desventajas e impacto en tiempo/costo no están
> documentados en el contexto fuente. Agregar aquí si el equipo los formaliza.
