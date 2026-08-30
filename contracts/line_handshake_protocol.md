# Protocolo de handshake de la línea de manufactura

Estado: **principio decidido (ADR 0008, sub-decisiones 8a/8b), interfaz
concreta pendiente de investigación técnica.**

## Lo decidido

- Sin orquestador central. Cada estación dispara a la siguiente directamente
  ("terminé, tu turno"): `KUKA KR6 → UR5 → sistema de visión de línea →
  Aether Inventory`.
- El disparo es una señal externa simple (I/O digital o puente MQTT→I/O) hacia
  el controlador nativo de cada estación — nunca control de trayectoria desde
  este repositorio (ver `edge/manipulation/arm_control/kuka_kr6/README.md` y
  `.../ur5/README.md`).
- En paralelo, `edge/manipulation/line_events_listener/` escucha esos eventos
  vía MQTT y registra cada uno como una `Observation` (mismo esquema de la
  Decisión 5), dando la trazabilidad que el dashboard necesita (Decisión 7) —
  sin agregar lógica de control nueva.

## Lo pendiente (no es una decisión de arquitectura, es investigación técnica)

- Qué interfaz de E/S exponen realmente el KUKA KR6 y el UR5 disponibles para
  el equipo.
- Si se necesita hardware adicional (p. ej. un módulo de I/O industrial) no
  contemplado en la cotización actual, para el puente MQTT→I/O.
- El formato exacto del evento de línea (tópico MQTT, payload) que
  `line_events_listener/` traduce a `Observation` — depende de la interfaz de
  E/S real que se confirme arriba.

No fabricar aquí nombres de tópicos, payloads ni pines de I/O antes de resolver
lo anterior — ver ADR 0008, sección "Riesgo de proyecto".
