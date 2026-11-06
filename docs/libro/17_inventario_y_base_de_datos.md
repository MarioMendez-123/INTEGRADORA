# Capítulo 17: Del recuadro al inventario

*Cómo miles de detecciones sueltas se convierten en una tabla de inventario con historial, por qué una base de datos y no un archivo, y qué promete (y qué no) el estado de cobertura.*

## Setecientas doce detecciones, diecinueve filas

En una corrida real de prueba registrada en el informe integrador de septiembre, **712 observaciones** crudas se agruparon en **19 entradas** de inventario. La cifra ilustra el trabajo de este capítulo: la cámara y YOLO producen una avalancha de registros ("vi una caja a las 15:04:05", "vi otra a las 15:04:05.1", …) y alguien debe convertirla en algo que un humano pueda leer: "hay 19 cosas distintas, de estas clases, vistas tantas veces". Esa conversión es el **motor de inventario** (*Inventory Engine*).

## Detectar no es contar

Una detección dice "en este cuadro hay una caja". Contar exige saber **si es la misma caja** que en el cuadro anterior. Aether lo resuelve a su manera: **no pretende contar objetos físicos, sino agrupar observaciones por identidad cuando existe**. La regla de agrupación (`edge/inventory_engine/aggregate_observations.py`, función pura `aggregate()`):

- Si la observación **tiene un código de barras/QR legible**, la clave de grupo es **ese código exacto**.
- Si **no**, la clave es `unidentified:` seguido de la **clase detectada**.

Por cada grupo se calcula la clase más frecuente, el total de observaciones, cuántas tenían código, la **confianza promedio**, la primera y la última vez vista y el conteo por **ubicación** (el identificador del ArUco visible, o `sin_ubicacion`). Seis pruebas automáticas verifican esta función. La función es **pura**: no lee ni escribe archivos, así que se prueba sin cámara.

Y una advertencia de terminología, obligatoria en el proyecto: **"conteo visible detectado" no es "conteo real de inventario"**. Si el robot no pasó por un estante, el sistema no sabe si ahí hay productos.

## Dos niveles de datos: Observations y Declared Inventory

La Decisión 5 separa dos niveles:

| Nivel | Qué es | Dónde vive |
|---|---|---|
| **Observation** | El registro crudo de una detección individual | `backend/agent_contracts.py` (contrato), cola en memoria y archivos JSON |
| **Declared Inventory** (inventario declarado) | El resumen agrupado: lo que el sistema "declara" saber | Tabla `declared_entries` de la base de datos |

Más una tercera tabla, **`declared_entry_history`**, que es la **bitácora de inspecciones**: cada corrida de carga **agrega** una fila por entrada y **nunca actualiza ni borra** las anteriores (así un cliente puede auditar cómo se llegó a un número). La opción B del alcance del panel (ADR 0007) se justifica así: *"lo que convence a un cliente escéptico no es ver al robot moverse en vivo, sino poder auditar cómo se llegó a un número"*.

## La ruta del dato, paso a paso

La **tubería manual** original son tres pasos, que se corrían a mano y en orden:

1. **Captura** (`edge/perception/test_combined.py`): abre la cámara, detecta, y al terminar vuelca las observaciones a `observations_output.json`.
2. **Agregación** (`edge/inventory_engine/aggregate_observations.py`): produce `declared_inventory_output.json`.
3. **Carga** (`backend/scripts/load_from_edge.py`): hace un **upsert** (actualiza si existe, crea si no) en `declared_entries` e inserta filas nuevas en `declared_entry_history`.

Desde el 2 de septiembre existe una versión automática (**ADR 0009**, Decisión 9): un **bucle de auto-refresh** que, cada N segundos (15 a 30, configurable), toma las observaciones acumuladas, las agrega y las carga, sin intervención humana. Se activa con `POST /inventory/auto-refresh/start` y se detiene con `/stop`; `GET /inventory/auto-refresh/status` dice si está activo, la hora y cuántas observaciones procesó la última corrida y el último error. Si en una ventana no hubo detecciones, **se omite el ciclo** (no inventa actividad). El panel refleja los cambios con **polling** simple (consultas repetidas), sin WebSockets.

El auto-refresh es una **versión reducida** del monitoreo en vivo y el panel lo dice con honestidad: es la vista de *esta cámara fija*, no "inventario en tiempo real del piso". Con los agentes, cada observación del Jetson llega a la laptop por `POST /perception/observations` (capítulo 16) y alimenta los mismos oyentes.

## Qué es una base de datos y por qué no basta un archivo

Un archivo de texto sirve para un dato; no para consultar, actualizar y conservar historial **sin que dos procesos se pisen**. Una **base de datos** ofrece **tablas** (filas y columnas), **consultas** (SQL), **transacciones** (un conjunto de cambios que ocurre completo o no ocurre) y **claves** (una columna que identifica cada fila de forma única). Aether usa **SQLite** (una base de datos en **un solo archivo**, `backend/aether.db`, que viene con Python y no necesita servidor) mediante **SQLAlchemy**, una librería que permite describir las tablas como clases de Python (`DeclaredEntry`, `DeclaredEntryHistory`). La decisión de pasar a **PostgreSQL** está marcada como "candidato a escalar", y por el principio de no fabricar dependencias **no se instaló su driver**. El archivo `aether.db` **no se sube a Git**.

## Retirar no es borrar

Una entrada de inventario solo puede dejar de contar como activa por **una decisión humana explícita**: `PATCH /inventory/{identifier}/retire`, que cambia su `status` de `active` a `retired` (nunca borra la fila; sigue consultable con `?include_retired=true`). Nunca ocurre sola por no aparecer en una corrida: **no hay forma de saber hoy si esa corrida cubrió todo el piso**, y retirar automáticamente sería fabricar una garantía que el sistema no puede dar.

La acción exige una contraseña (`ADMIN_ACTION_PASSWORD`, configurada por entorno; el repositorio tiene un valor por defecto solo para desarrollo) y el código mismo aclara que **no es autenticación real**: no hay usuarios, sesiones ni roles; es una "traba contra clics accidentales". Un sistema de permisos real queda como decisión futura explícita.

## Confianza del dato: qué se le puede prometer al usuario

El esquema define **tres estados formales de cobertura** de una inspección (`edge/inventory_engine/coverage_states.py`): `PARTIAL` (parcial), `COMPLETE` (completa) e `INVALID` (inválida), con la regla de que **una inspección parcial nunca sobrescribe silenciosamente el inventario declarado previo**. **Pero los estados no se asignan todavía**: dependen del módulo de **navegación**, que decide qué recorrido hizo el robot, y ese módulo no existe. El código lo declara con claridad: *"no se fabrica aquí para no simular una garantía que el sistema aún no puede respaldar"*. Y aun cuando se asignen, **`COMPLETE` significa que el procedimiento terminó, no que se vio todo el inventario real**. Los criterios de aceptación del MVP incluyen probar estos casos (completa, interrumpida e inválida); aún **no se han ejecutado** (**PENDIENTE: P-22**, junto con los umbrales de aceptación).

## Lumina y el inventario

El asistente conoce el inventario solo de forma limitada: su mensaje de sistema le dice que la percepción y el motor de inventario "ya funcionan" y que la línea de manufactura todavía no existe físicamente, y que **nunca debe inventar cifras**. Las preguntas típicas de una presentación tienen respuestas fijas precargadas (capítulo 15).

## Escala: cuántas observaciones son demasiadas

Una cámara a 10 detecciones por segundo produce 36 000 registros por hora; en una semana, millones. SQLite aguanta cifras así en un prototipo, pero una base real necesitaría **índices**, **limpieza periódica** de observaciones crudas ya agregadas y, a mayor escala, un servidor de base de datos. Esto **no se ha medido** en el proyecto; la cola del agente está acotada a 1 000 eventos y el panel de detecciones recientes, a 50, para evitar el crecimiento sin límite.

## Sistemas de inventario industriales

En una bodega real, el inventario se gestiona con un **WMS** (*Warehouse Management System*) conectado a **códigos de barras, RFID** y lectores en puertas, y los robots de inventario (por ejemplo, robots que escanean estantes de tiendas) entregan **reportes con tiempo y confianza**, no "verdades". El diseño de Aether —observaciones crudas, inventario declarado con confianza y bitácora auditable— sigue ese mismo principio.

## Preguntas de repaso: inventario y datos

1. ¿Cómo agrupa `aggregate()` las observaciones y qué clave usa cuando no hay código?
2. ¿Qué diferencia hay entre `declared_entries` y `declared_entry_history`?
3. ¿Por qué retirar una entrada no la borra, y por qué nunca ocurre automáticamente?
4. ¿Qué dicen los tres estados de cobertura y por qué todavía no se asignan?
5. ¿Qué es un upsert y dónde se usa?
6. ¿Por qué `COMPLETE` no significa "se vio todo el inventario real"?
