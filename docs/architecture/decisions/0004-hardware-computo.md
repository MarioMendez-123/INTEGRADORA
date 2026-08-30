# ADR 0004 — Hardware de cómputo

**Estado:** Aceptada (Fase 0)

## Decisión

- Cómputo de borde principal: **NVIDIA Jetson Orin Nano Super 8GB** (67 TOPS,
  GPU Ampere).
- Contingencia: Raspberry Pi 5 + AI HAT+ (26 TOPS).
- Control de bajo nivel: ESP32 o STM32 (motores, watchdog de seguridad, PWM
  por hardware).

## Contexto

Ver `aether_context_docs.md`, sección 3 (Decisión 4) y sección 5 (hardware).

> Opciones evaluadas, ventajas/desventajas e impacto en tiempo/costo no están
> documentados en el contexto fuente. Agregar aquí si el equipo los formaliza.
