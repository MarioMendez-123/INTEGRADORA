# Tópicos MQTT

Estado: **pendiente de definición.**

La Decisión 6 (ver `aether_context_docs.md`, sección 3) establece MQTT como
canal de telemetría, pero el documento fuente no enumera tópicos concretos.
No se fabrica aquí una lista de tópicos sin esa definición — documentar cada
tópico (nombre, payload, productor/consumidor, QoS) cuando se implemente
`edge/comms/mqtt_client/`.

Recordatorio de la Decisión 6: los comandos de parada de seguridad son
**independientes de la conectividad de red** (watchdog de hardware) — no deben
modelarse como un tópico MQTT del que dependa la seguridad del sistema.

Dos usos de MQTT ya decididos que este documento deberá cubrir cuando se
definan los tópicos concretos:

- Eventos de handshake de la línea de manufactura (Decisión 8a), consumidos
  por `edge/manipulation/line_events_listener/` — el detalle de payload/tópico
  depende de la investigación técnica pendiente en
  `contracts/line_handshake_protocol.md`.
- El futuro puente MQTT→WebSocket para monitoreo en vivo del robot (Decisión
  7, Opción C) — evolución obligatoria post-MVP, no implementar todavía.
