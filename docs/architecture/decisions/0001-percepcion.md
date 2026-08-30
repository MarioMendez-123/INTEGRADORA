# ADR 0001 — Percepción

**Estado:** Aceptada (Fase 0)

## Decisión

Enfoque híbrido: detección/conteo basado en YOLO + identificación por código de
barras/QR como MVP. La clasificación visual pura de SKU queda reservada para
una evolución futura.

## Contexto

Ver `aether_context_docs.md`, sección 3 (Decisión 1) y sección 5 (stack de
percepción: Python, OpenCV, YOLO, NumPy, PyTorch).

## Notas de terminología (sección 4.2)

"Conteo visible detectado" ≠ "conteo real de inventario". No usar estos
términos como sinónimos en código, endpoints ni UI.

> Opciones evaluadas, ventajas/desventajas e impacto en tiempo/costo no están
> documentados en el contexto fuente. Agregar aquí si el equipo los formaliza.
