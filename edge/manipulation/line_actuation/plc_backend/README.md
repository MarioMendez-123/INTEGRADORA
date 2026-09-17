# plc_backend/

Vacía a propósito, no olvidada. Si la investigación técnica pendiente (ADR
0010, sub-decisión 10b) confirma que el actuador final es un PLC, aquí vive
la implementación concreta del Evento A de
`contracts/line_handshake_protocol.md` (Modbus TCP o E/S digital hacia el
PLC), nunca la lógica de control de la banda/pistón en sí — esa vive
programada en el propio PLC.

No fabricar aquí un cliente Modbus ni un mapeo de pines antes de confirmar
qué interfaz de E/S expone realmente el PLC disponible.
