# kuka_kr6/

Por ADR 0008 (sub-decisión 8b), la trayectoria de colocación de piezas se
programa directamente en el controlador del KUKA KR6 usando KRL — no vive en
este repositorio como código de planeación.

Lo que sí vive aquí: el disparo externo simple (I/O digital o puente MQTT→I/O,
ver `contracts/line_handshake_protocol.md`) que arranca la trayectoria ya
programada en el controlador, y cualquier script/documentación de esa
integración. Nada de este directorio controla la trayectoria en sí.
