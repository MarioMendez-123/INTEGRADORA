# Protocolo de handshake de la línea de manufactura

Estado: **principio decidido (ADR 0010, sub-decisiones 10a/10b), interfaz
concreta pendiente de investigación técnica.**

> Reemplaza la versión anterior de este documento (handshake entre KUKA KR6 →
> UR5 → visión → Aether Inventory, ver ADR 0008 — superada por ADR 0010).

## Lo decidido

- Un solo punto de decisión: la **Visión de línea** evalúa cada pieza que la
  banda/fixture posiciona frente a la cámara y determina `PASS` o `FAIL`.
- Una única acción condicional: si el resultado es `FAIL`, se dispara el
  **pistón** que expulsa la pieza (scrap) de la banda. Si es `PASS`, no se
  manda ninguna señal de actuación — la pieza sigue su curso en la banda.
- El disparo es una señal externa simple (I/O digital, Modbus, o
  serial/MQTT según el controlador final — ver "Lo pendiente") desde la PC
  de Visión de línea hacia el controlador del actuador (PLC o
  ESP32/STM32) — nunca lógica de control de bajo nivel desde este
  repositorio (ver `edge/manipulation/line_actuation/README.md`).
- En paralelo, `edge/manipulation/line_events_listener/` escucha por MQTT y
  registra cada resultado como una `Observation` (mismo esquema de la
  Decisión 5) — sin agregar lógica de control nueva, solo trazabilidad.

## Evento A — Visión de línea → Actuador

| Campo | Tipo | Notas |
|---|---|---|
| `resultado` | `"PASS"` \| `"FAIL"` | Obligatorio. El criterio real detrás de este valor todavía no está implementado en `backend/main.py::_make_line_vision_processor` (hoy solo hace detección de presencia) — ver ADR 0010, sub-decisión 10c. |
| `timestamp` | ISO 8601 | Mismo formato que `Observation` en `edge/inventory_engine`. |
| `tipo_objeto` | `1` \| `2` \| `3` \| `null` | Reservado para cuando exista un clasificador de tipo de objeto. Hoy no existe — se manda `null` hasta que se implemente y se registre esa evolución en `aether_context_docs.md` sección 9. |
| `confianza` | float 0–1 | Confianza del modelo YOLO en el frame que originó la decisión. |

## Evento B — Actuador → `line_events_listener` (MQTT)

| Campo | Tipo | Notas |
|---|---|---|
| `accion` | `"scrap_expulsado"` \| `"pieza_aceptada"` \| `"fallo_actuacion"` | Lo que realmente ocurrió físicamente, no solo lo que Visión decidió. `fallo_actuacion`: Visión decidió `FAIL` pero el pistón no llegó a dispararse (o no se pudo confirmar que disparó) — nunca reportar `pieza_aceptada` en este caso, sería falso: Visión sí decidió `FAIL`, solo que la actuación física no se cumplió. No asumir que el Evento A siempre se cumple físicamente. |
| `timestamp` | ISO 8601 | |
| `resultado_origen` | referencia al Evento A correspondiente | Da trazabilidad end-to-end (Visión decidió X → Actuador hizo Y). |

## Lo pendiente (no es una decisión de arquitectura, es investigación técnica)

- Si el actuador final es un PLC o un microcontrolador ESP32/STM32 (ver ADR
  0010, sub-decisión 10b) — condiciona si el Evento A viaja por Modbus
  TCP/E-S digital (PLC) o por serial/MQTT (MCU).
- Qué interfaz de E/S expone realmente el PLC o el MCU disponible para el
  equipo.
- Si se necesita hardware adicional (p. ej. un relé o módulo de E/S) no
  contemplado en la cotización actual.
- Si el software necesita controlar arranque/paro de la banda, o si la banda
  corre de forma continua e independiente del software.
- El nombre exacto de tópico MQTT y el formato exacto del payload que
  `line_events_listener/` traduce a `Observation` — depende de la interfaz
  de E/S real que se confirme arriba.

No fabricar aquí nombres de tópicos, payloads adicionales ni pines de I/O
antes de resolver lo anterior — ver ADR 0010, sección "Riesgo de proyecto".
