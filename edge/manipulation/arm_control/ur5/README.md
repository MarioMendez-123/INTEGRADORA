# ur5/

Por ADR 0008 (sub-decisión 8b), la trayectoria de ensamble se programa
directamente en el controlador del UR5 usando URScript/PolyScope — no vive en
este repositorio como código de planeación, y no hay Learning from
Demonstration (ver sección 4.2 del contexto maestro: nunca describir esto como
"aprendizaje").

Lo que sí vive aquí: el disparo externo simple (I/O digital o puente MQTT→I/O,
ver `contracts/line_handshake_protocol.md`) que arranca la trayectoria ya
programada en el controlador, y cualquier script/documentación de esa
integración. Nada de este directorio controla la trayectoria en sí.
