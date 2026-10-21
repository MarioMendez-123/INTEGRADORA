# API REST

Estado: **Opción B (Decisión 7 / ADR 0007) implementada.** Los 4 endpoints de
abajo existen y funcionan en `backend/main.py`. La Opción C (estado en vivo
del robot, vía el futuro puente MQTT→WebSocket) sigue sin implementar — ver
sección "Pendiente" al final.

## Endpoints implementados

Todos sin autenticación real salvo donde se indica — mismo origen que
`dashboard/` (StaticFiles servido por el mismo proceso FastAPI), sin CORS.

### `GET /health`
Confirma que el servidor está vivo. Sin parámetros.
```json
{"status": "ok"}
```

### `GET /inventory`
Devuelve el Declared Inventory. Query param opcional `include_retired`
(bool, default `false`): si es `true`, incluye también las entradas con
`status: "retired"`; por defecto solo devuelve las activas.

Respuesta: lista de objetos con `identifier`, `detected_class`,
`total_observations`, `code_read_count`, `avg_confidence`, `first_seen`,
`last_seen`, `location_counts`, `status`.

### `PATCH /inventory/{identifier}/retire`
Cambia el `status` de una entrada a `"retired"` — nunca borra la fila, sigue
consultable con `GET /inventory?include_retired=true`. Requiere `password`
en el body JSON, verificada contra `ADMIN_ACTION_PASSWORD` (variable de
entorno del backend). **No es autenticación real** — sin usuarios, sesiones
ni roles, es una traba simple contra clics accidentales (ver comentario
junto a `ADMIN_ACTION_PASSWORD` en `backend/main.py`).

Body:
```json
{"password": "..."}
```
Respuestas: `200` con `{"identifier": ..., "status": "retired"}` si la
contraseña es correcta; `403` si es incorrecta; `404` si el `identifier` no
existe.

### `GET /line/cell/status`
Estado de la celda para `dashboard/celda.html`. La fuente es `backend/cell_line.py`:
`"source": "celda"`. Cada pieza la decide la cámara. `sources.plc` es true cuando
los GPIO 8 y 9 están abiertos. Campos: `state` (`OPERANDO` | `DETENIDA` | `SIN_CONEXION`),
`reason`, `sources.vision_linea`, `sources.plc`, `counts` (`inspected`, `pass`, `fail`),
`recent` (Evento A/B del handshake), `updated_at`, `running` y `alarms`
(histórico de la HMI: prioridad, causa, acción, activa, reconocida).

### `POST /line/cell/session`

Cuerpo `{"user", "password"}`. Deja la cookie `celda_session`. `401` si la cuenta no existe. `GET` devuelve `{user, role}` o `401`. `DELETE` cierra la sesión.

### `POST /line/cell/run`

Cuerpo `{"on": true|false}`. Exige sesión. Con `on: false` corta los dos pulsos y el estado pasa a `DETENIDA` con motivo «Paro solicitado por el operador». No mueve el pistón por su cuenta. La respuesta es el mismo objeto que `GET /line/cell/status`.

### `POST /line/cell/alarms/ack`

Exige sesión. Marca reconocidas las alarmas abiertas.

### `POST /line/cell/alarms/clear`

Exige la cuenta `admin`. Borra el histórico. `403` con cualquier otro rol.

### `GET /inventory/history`
Devuelve la bitácora completa (Decisión 7): todas las filas de
`declared_entry_history`, más recientes primero. Sin filtros ni paginación
todavía. Cada fila trae los mismos campos que `GET /inventory` más `id` y
`recorded_at` (momento de la corrida de carga que la generó).

## Pendiente (Opción C — ADR 0007)

Estado en vivo del robot (batería, posición, tarea en curso), vía el futuro
puente MQTT→WebSocket. Evolución obligatoria posterior al MVP, no parte de
él — no se fabrican aquí rutas ni payloads hasta que esa evolución se
implemente, para no romper los contratos de la Opción B ya en uso.
