# mcu_backend/

Vacía a propósito, no olvidada. Si la investigación técnica pendiente (ADR
0010, sub-decisión 10b) confirma que el actuador final es un ESP32/STM32
(mismo tipo de controlador de bajo nivel ya usado en la Decisión 4 para el
robot móvil), aquí vive la implementación concreta del Evento A de
`contracts/line_handshake_protocol.md` (serial USB-UART o MQTT hacia el
microcontrolador), nunca la lógica de control del pin/relé del pistón en
sí — esa vive en el firmware del propio microcontrolador (ver `firmware/`).

No fabricar aquí un protocolo serial ni un cliente MQTT antes de confirmar
qué microcontrolador se usa y cómo se conecta.
