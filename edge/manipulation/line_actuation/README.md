# line_actuation/

Reemplaza a `arm_control/` (eliminada — ver ADR 0010, que supersede a la ADR
0008). Ya no hay brazos robóticos que controlar; lo que este módulo dispara
es el **pistón** que expulsa el scrap de la banda transportadora cuando la
Visión de línea decide `FAIL` (ver `contracts/line_handshake_protocol.md`).

Igual que `arm_control/` antes, este directorio **nunca** implementa la
lógica de control de bajo nivel del actuador — solo el disparo externo
simple (Evento A del protocolo) hacia el controlador real (PLC o
ESP32/STM32).

La elección entre PLC y ESP32/STM32 sigue **pendiente de definir con
hardware en mano** (ADR 0010, sub-decisión 10b) — por eso este directorio se
subdivide por tipo de backend, no por implementación concreta todavía:

- `plc_backend/` — si el actuador final resulta ser el PLC (Modbus TCP o
  E/S digital).
- `mcu_backend/` — si el actuador final resulta ser un ESP32/STM32 (serial
  o MQTT).

No fabricar código de ninguno de los dos backends, ni una interfaz común,
antes de que esa decisión se confirme con hardware real — ver Principio 4.5
de `aether_context_docs.md`.
