# Capítulo 16: Sistemas distribuidos

*Qué cambia cuando un programa vive repartido en varias máquinas que pueden fallar por separado: entregar al menos una vez, no contar dos veces, juntar mensajes en lotes y decir siempre qué tan seguro es cada dato.*

## Cuando cada máquina puede fallar sola

Un programa en una sola computadora falla entero o no falla. Aether, en cambio, reparte el trabajo entre tres máquinas con **tres formas distintas de fallar**:

| Máquina | Qué puede pasar | Qué ocurre con lo demás |
|---|---|---|
| **Laptop** (servidor) | Se duerme, se reinicia, se apaga el WiFi | Los agentes siguen trabajando y **acumulan** lo que no pueden entregar |
| **Jetson** (agente de percepción) | Se cae la cámara, se cuelga YOLO | El video se pierde, la laptop sigue sirviendo el resto |
| **Raspberry Pi 4** (celda) | Pierde la red, la cámara se desconecta | **La celda sigue decidiendo y actuando por su cuenta** |

Esa independencia es una decisión deliberada (ADR 0012): *"la celda decide y actúa aunque la laptop o la red se caigan."* A cambio, aparecen problemas nuevos que este capítulo explica. En la jerga: un **sistema distribuido** es un conjunto de computadoras que cooperan por red y deben seguir funcionando cuando alguna **falla de forma parcial**.

## Idempotencia: repetir sin dañar

Supóngase que el agente del Jetson manda "vi una `computadora2`" y la laptop **la guarda pero la respuesta se pierde**. El agente no sabe si llegó, así que reintenta. Si la laptop la contara dos veces, el inventario estaría mal. La solución es la **idempotencia**: **una operación que, repetida, produce el mismo efecto que una sola vez**.

En Aether se logra así (**VERIFICADO** en `backend/observation_intake.py` y `observation_outbox.py`, con pruebas):

1. Cada observación lleva un **`event_id`**, un identificador único y **estable** (el reintento lleva el mismo).
2. La laptop guarda los últimos **20 000** `event_id` vistos (`SeenIds`) y, si recibe uno repetido, lo **descarta y lo cuenta** como `duplicates`.
3. La respuesta dice cuántas aceptó y cuántas eran duplicadas: `{"accepted": 3, "duplicates": 1}`.

Un **límite conocido, declarado**: esa memoria vive en la laptop; **si se reinicia**, un reintento muy antiguo podría contarse otra vez (**persistir los `event_id` en disco** queda como mejora).

## El buzón de salida

El agente no manda cada observación en el momento: la mete en un **buzón de salida** (`EventOutbox`), una cola local, y un hilo aparte la entrega. Reglas de la cola (**VERIFICADO** en código y pruebas):

- **Tamaño acotado:** hasta **1000** eventos (`AETHER_OUTBOX_MAX`); si se llena, **se descartan los más viejos** y se cuentan (`dropped_total`). Preferible perder lo antiguo a agotar la memoria.
- **Entrega al menos una vez:** una respuesta 2xx saca el lote de la cola.
- **Reintento con espera creciente** (*backoff exponencial*, de 1 s hasta 30 s) ante errores de red, 5xx, 408 o 429.
- **Descarte de lo inválido:** una respuesta 4xx (salvo 408 y 429) significa que el lote está mal formado; se descarta y se cuenta, porque reintentarlo para siempre **bloquearía la cola**.
- **El video no espera a nadie:** el detector corre aparte; si la laptop no contesta, la cámara y el video siguen.

## Lotes: menos mensajes, mismo dato

El 23 de octubre se detectó un desperdicio. Con detecciones continuas (alrededor de **12 por segundo**), **cada observación despertaba al hilo y salía en su propio POST**. El commit `e8c0710` cambió la política: ahora se **juntan las observaciones del intervalo** (`AETHER_OUTBOX_INTERVAL_S`, **1 s** por defecto; `0` equivale al comportamiento anterior, inmediato) en **un solo envío**, con un tope de **50 por lote** (`AETHER_OUTBOX_BATCH`) y 3 s de espera máxima (`AETHER_OUTBOX_TIMEOUT_S`); un lote lleno sale sin esperar. El retraso máximo de entrega es ese intervalo. **No cambia qué se manda ni el inventario.** No se midió todavía el efecto en el Jetson real.

## Quién manda: el modelo cliente-servidor

La **laptop es el servidor**: tiene la base de datos, sirve las páginas, aloja a Lumina y **acepta datos**. Los agentes son **clientes** que le **empujan** observaciones. Un detalle de diseño: la laptop **solo recibe y anota** los eventos de la celda; **nunca les manda órdenes de actuación** (el contrato lo dice: *"Solo se anotan: no activa nada ni cambia GPIO"*). Así, un fallo o un ataque en la laptop no puede mover el pistón.

## Seguridad en la red local

Los endpoints de los agentes **no llevan autenticación** (contraseña o llave): están protegidos solo por ser **red local** (`AETHER_LAN_CIDRS`) y porque el guardia del dominio público los cierra. La ADR 0012 lo trata como **riesgo aceptado y documentado** (un equipo de la subred podría inyectar observaciones o texto falsos). Las defensas que sí existen (**VERIFICADAS** por pruebas): solo acepta clientes de la red local (403 fuera), valida el formato y rechaza campos extra (422), limita el tamaño (413), exige que el origen de un WebSocket de navegador coincida con el servidor, y limita a 8 las conexiones de voz. Si el proyecto saliera del laboratorio, la **autenticación de los agentes** sería la primera mejora.

## Cuatro niveles de diagnóstico

Para saber *qué* falla en un sistema repartido, conviene preguntar de lo general a lo particular. El equipo lo formalizó para los agentes:

1. **¿El servidor está vivo?** `GET /health` → `{"status":"ok"}`.
2. **¿El agente está vivo?** `GET /health` del agente (`localhost:8001`) → incluye `"error"` con el motivo si falla.
3. **¿Qué está haciendo?** `GET /status`: cámara (FPS), inferencia (ms), `laptop.reachable`, `outbox_len`, `sent_total`, `dropped_total`, `last_error`, y recursos (memoria y CPU del proceso).
4. **¿Qué mide una prueba controlada?** `scripts/probar_agente.py` (15 s de medición).

El `/status` es riguroso a propósito: **`fps_camera`** (lo que entrega el hardware), **`fps_delivery`** (lo que sale anotado) y los milisegundos de inferencia son **independientes**; así se ve si el cuello de botella es la cámara (poca luz) o el procesamiento. Y el contrato añade una regla de honestidad: *"Ninguna cifra se afirma sin haberla leído de este endpoint en el equipo real."*

## Estados honestos: lo que se vio, lo que se supuso y lo que se midió

Los documentos del proyecto separan tres tipos de afirmaciones, el mismo método del libro:

- **Comprobado en pruebas con dobles** (software correcto sobre datos falsos).
- **Reportado** (Mario lo corrió en el equipo real y lo contó).
- **No verificado** (diseño o suposición).

Un ejemplo literal: la prueba de humo del agente en laptop midió **30.0 FPS** pero con **0 observaciones**, así que el envío de datos se verificó con dobles y se declaró **no verificado con detecciones reales**.

## Cuándo esto se vuelve crítico

Todo lo anterior es "criterioso" en un prototipo; en una planta industrial se vuelve **obligatorio**: mensajes confirmados (*acknowledgements*), colas persistentes en disco (las empresas usan brokers como MQTT, RabbitMQ o Kafka), relojes sincronizados, supervisión central y *health checks* automáticos. Aether usa los mismos conceptos con piezas simples; el uso de **MQTT** para telemetría está decidido (Decisión 6) pero **sin implementar** (capítulo 18).

## Preguntas de repaso: sistemas repartidos

1. ¿Qué es la idempotencia y qué campo la hace posible en las observaciones?
2. ¿Por qué el buzón de salida descarta los eventos **más viejos** cuando se llena?
3. ¿Qué hace el agente ante una respuesta 5xx y qué ante una 4xx, y por qué?
4. ¿Qué problema resolvió el cambio a lotes del 23 de octubre y qué cifra lo disparó?
5. ¿Por qué la laptop nunca manda órdenes de actuación a la celda?
6. Explicar la diferencia entre `fps_camera` y `fps_delivery`.
