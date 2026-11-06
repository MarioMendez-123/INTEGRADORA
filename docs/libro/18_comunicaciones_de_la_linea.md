# Capítulo 18: Todos los idiomas de Aether

*REST, WebSocket, MQTT, Modbus, GPIO, RS485, I²C y USB serie: qué se habla entre cada par de piezas, cuáles ya existen y cuáles son todavía plan.*

## Doce piezas, ocho idiomas

Una de las confusiones más comunes al conocer Aether es creer que "todo se comunica por MQTT" o "todo por la web". En realidad hay **ocho idiomas distintos**, cada uno elegido para un tramo, y algunos de ellos solo existen en el papel. Este capítulo los ordena. Antes, una definición útil: un **protocolo** es el acuerdo de cómo se manda y se interpreta un mensaje entre dos programas o dispositivos.

## El cuadro completo

| Tramo | Protocolo | Cuerpo del mensaje | Estado |
|---|---|---|---|
| Navegador ↔ laptop | **HTTP / REST** (JSON) | Peticiones del panel y de Lumina | **VERIFICADO**, corre |
| Página ↔ laptop (voz, eventos del show) | **WebSocket** (JSON) | Texto reconocido, estados, eventos | **VERIFICADO** en pruebas |
| Jetson → laptop | **HTTP POST** de observaciones (JSON, con `event_id`) | Lotes de hasta 100 observaciones | Probado con dobles; Jetson real: el agente funcionó, la entrega reportó `laptop.reachable` verdadero |
| Pi 4 → laptop | **HTTP POST** de eventos de pieza | Eventos con `event_id` | Probado con dobles |
| Jetson ↔ ESP32 | **USB serie** (texto con latido) | Órdenes de movimiento y lecturas | **Diseño**; contrato sin escribir (capítulo 5) |
| ESP32 ↔ ruedas M0601 | **RS485** (half-duplex) | Mensajes del fabricante | **Diseño**; protocolo del motor pendiente |
| ESP32 ↔ sensores | **I²C** y señales digitales | Distancias, giro, finales de carrera | **Diseño** |
| Pi 4 → relevadores → LOGO / pistón | **GPIO** (nivel eléctrico) | Pulsos de 0.5 a 1 s | Código escrito; **sin `gpiod` instalado, no se mueve** |
| Robot → laptop (telemetría) | **MQTT** | Batería, estado, posición | **Decidido, sin implementar** |
| Celda ↔ PLC | **Modbus TCP** | Registros de un PLC | **Plan viejo**, no es lo que corre |

## HTTP/REST: el idioma del panel

**REST** es un estilo de uso de HTTP donde cada **recurso** (inventario, celda, historial) tiene una dirección y los verbos (`GET`, `POST`, `PATCH`, `DELETE`) expresan la acción. Aether usa REST para todo lo que el panel muestra o pide (capítulo 11). Está en `contracts/rest_api.md`. Su estado, escrito en ese documento: *"Opción B (Decisión 7 / ADR 0007) implementada"*; el estado en vivo del robot (Opción C) **sigue sin implementar**.

## Los agentes por HTTP: datos chicos con un identificador

Los dos agentes (el del Jetson y el de la Pi) hablan con la laptop por **HTTP POST con JSON**, y la razón de no usar MQTT todavía es de **simplicidad**: ya existe un servidor HTTP, con validación (capítulo 13), idempotencia (capítulo 16) y pruebas. El contrato (`contracts/agents_api.md`) está **versionado**: todo mensaje lleva `"v": 1`.

## WebSocket: cuando el servidor también habla

Dos canales en vivo (capítulo 11): `/voice/ws` (el servicio de voz manda texto, las páginas mandan "estoy hablando") y `/show/ws` (relevo de eventos del show de presentación). Ninguno lleva audio.

## MQTT: decidido, todavía sin escribir

**MQTT** (*Message Queuing Telemetry Transport*) es un protocolo ligero de **publicar y suscribirse**: un programa **publica** un mensaje en un **tópico** (un nombre como `aether/robot/bateria`) y todos los que se **suscribieron** a él lo reciben, a través de un servidor intermedio llamado **broker**. Se usa mucho en dispositivos industriales y robots porque es pequeño y tolera redes lentas.

La **Decisión 6** (ADR 0006) establece MQTT para la **telemetría** del robot, pero **hoy no hay ni una línea de código MQTT**: `edge/comms/mqtt_client/__init__.py` está **vacío** (**VERIFICADO**) y `contracts/mqtt_topics.md` dice textualmente *"pendiente de definición"*: no se fabrican tópicos antes de que exista la interfaz real. Dos usos de MQTT están decididos para el futuro: los eventos de handshake de la línea (para el escucha `line_events_listener`, también vacío) y la telemetría del robot (batería, posición, tarea en curso), que sería la **Opción C** del panel.

Un principio de seguridad atraviesa esta decisión: **los comandos de parada de seguridad no dependen de la red**; se resuelven con un watchdog de hardware y un paro físico, **nunca** con un tópico del que dependa la seguridad (capítulo 4).

## El protocolo de handshake de la línea: el contrato que quedó a medias

`contracts/line_handshake_protocol.md` describe, tras el cambio a banda y pistón (ADR 0010), un diálogo mínimo de **dos eventos**:

- **Evento A** (visión → actuador): `resultado` (`PASS` o `FAIL`), hora, `tipo_objeto` (1, 2 o 3 o nulo) y confianza.
- **Evento B** (actuador → escucha): lo que **realmente ocurrió**: `scrap_expulsado`, `pieza_aceptada` o `fallo_actuacion` (nunca reportar aceptada cuando la visión dijo FAIL y el pistón no actuó), con referencia al evento A.

El documento dice que el **medio** de enviar el Evento A (Modbus, E/S digital o serial) quedaba pendiente de investigación técnica. **Hoy** el equipo resolvió esa duda por **GPIO + relevadores** (capítulo 7) y los eventos que el código manda a la laptop son **HTTP POST** de la Pi (`pieza`, `juicio`, `accion`); el MQTT del Evento B **no existe**. En otras palabras, el contrato de papel y la implementación real **no coinciden aún**, y esa diferencia es la misma que se anotó en las correcciones (el contrato menciona "tipo_objeto" como inexistente cuando el código ya lo calcula).

## Modbus TCP: el plan con PLC

Si la celda se reconstruyera alrededor de un **PLC**, la comunicación sería por **Modbus TCP**: el PLC expone **registros** (como casillas numeradas) que otro equipo lee y escribe por Ethernet. La hoja de conexión del 5 de octubre definió un mapa de señales (`rechazar`, `banda_marcha`, latidos `rpi_vivo` y `plc_vivo`, `accion`, `pieza_id`) con direcciones de ejemplo y una columna "Real" que nunca se llenó. Es documentación vieja; la carpeta `plc_backend/` está vacía a propósito. Se conserva porque el **diseño de latidos cruzados** (cada lado vigila que el otro siga vivo, y si deja de verlo, pasa a un estado seguro) es una buena práctica general que Aether aplica en otros tramos con el *watchdog* del ESP32.

## GPIO, RS485, I²C y USB serie

Los cuatro idiomas del cuerpo físico están explicados en capítulos anteriores: **GPIO** (capítulo 8), **RS485** (5), **I²C** (6) y **USB serie** (5). Un vistazo comparativo de sus rasgos:

| Idioma | Cables | Distancia típica | Velocidad (orden de magnitud, regla general) | Dónde |
|---|---|---|---|---|
| GPIO | 1 por señal | Centímetros | Un cambio de nivel | Pi → relevadores |
| I²C | 2 (SDA, SCL) para muchos dispositivos | Decenas de centímetros | Cientos de kbit/s | ESP32 ↔ sensores |
| USB serie | 1 cable USB | Pocos metros | Cientos de kbit/s a Mbit/s | Jetson ↔ ESP32 |
| RS485 | 2 trenzados | Cientos de metros | Hasta Mbit/s | ESP32 ↔ M0601 |
| Ethernet / WiFi | Red | Edificio | De 10 Mbit/s a Gbit/s | Entre equipos |

## Qué dice la industria

En automatización industrial conviven **buses de campo** (Modbus, PROFIBUS, CAN, EtherCAT) para sensores y actuadores, y **protocolos de planta** (OPC UA, MQTT) para subir datos a sistemas de supervisión. La arquitectura típica separa **control en tiempo real** (cerca de la máquina) de **supervisión** (en red). Aether imita esa separación: GPIO, RS485 e I²C cerca del hardware; HTTP y WebSocket en la capa de supervisión; MQTT reservado para la telemetría.

## Preguntas de repaso: protocolos

1. ¿Qué diferencia hay entre una petición REST y un mensaje MQTT?
2. ¿Por qué los agentes mandan sus datos por HTTP POST y no por MQTT, hoy?
3. ¿Qué dos mensajes define el contrato de handshake de la línea y por qué difiere del código actual?
4. ¿Qué cuatro protocolos se usan "cerca del hardware" y cuáles de ellos son diseño todavía?
5. ¿Qué es un latido cruzado y qué función cumple en Modbus y en el ESP32?
6. ¿Por qué la parada de seguridad no puede depender de MQTT?
