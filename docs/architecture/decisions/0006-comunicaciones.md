# ADR 0006 — Comunicaciones

**Estado:** Aceptada (Fase 0)

## Decisión

- MQTT para telemetría.
- REST para consumo del dashboard.
- Los comandos de parada de seguridad son **independientes de la conectividad
  de red**, vía watchdog de hardware.

## Contexto

Ver `aether_context_docs.md`, sección 3 (Decisión 6). Ver también
`contracts/mqtt_topics.md` y `contracts/rest_api.md` (pendientes de contenido
concreto).

> Opciones evaluadas, ventajas/desventajas e impacto en tiempo/costo no están
> documentados en el contexto fuente. Agregar aquí si el equipo los formaliza.
