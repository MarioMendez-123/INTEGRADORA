# Capítulo 22: Pruebas y calidad

*Qué prueba el proyecto, qué no puede probar sin hardware, qué hacer cuando dos archivos de prueba se llaman igual y cuánto aporta cada tipo de comprobación.*

## Un error de colección que enseñó más que una prueba

El 24 de octubre de 2026, al preparar este libro, se intentó correr **todas** las pruebas del repositorio con un solo comando. Falló antes de ejecutar ninguna: *"import file mismatch: imported module 'test_setup' has this `__file__` attribute: `tests\backend\test_setup.py` which is not the same as the test file we want to collect: `tests\edge\test_setup.py`"*. Hay **dos archivos con el mismo nombre** (`test_setup.py`) en carpetas distintas, y **pytest** (la herramienta de pruebas) los confunde cuando se corren juntos sin paquetes. La solución del proyecto es sencilla y ya está en la práctica: **se corre cada conjunto por separado**, con **su propio entorno virtual**, porque la parte del servidor y la de borde tienen dependencias distintas.

## Qué es una prueba automática y qué aporta

Una **prueba automática** es un programa que ejecuta otra parte del código y comprueba que haga lo esperado, **sin que nadie lo mire**. Su valor es triple: avisan **en segundos** si un cambio rompe algo, documentan **lo que el código promete** y permiten **cambiar con confianza**. Un principio del proyecto (módulos independientes y probables) hace que casi todo se pueda comprobar sin cámara, sin red y sin hardware.

## Cómo se ejecutan, `[Laptop · PowerShell]`

Desde la raíz del repositorio:

```powershell
backend\.venv\Scripts\python.exe -m pytest tests\backend -q
edge\.venv\Scripts\python.exe -m pytest tests\edge -q
```

Resultados de la ejecución real del **24 de octubre de 2026** (**MEDIDO**):

| Conjunto | Resultado | Tiempo |
|---|---|---|
| `tests/backend` | **345 aprobadas, 2 fallidas** | 34.9 s |
| `tests/edge` | **7 aprobadas** | 0.04 s |

Las **dos fallidas** son de Lumina (`test_robot_ask_conserva_varias_oraciones_reales_tras_filtrar` y `test_robot_ask_lista_numerada_tambien_se_detecta`, en `tests/backend/test_main.py`). **Ya fallaban antes de los cambios recientes** y no se tocaron: son una deuda conocida y declarada, no un hallazgo nuevo. (Se corrobora que el resultado es el mismo que el registrado en la bitácora del 22 de octubre: "264 pruebas, 262 pasan", y el de la palabra de activación: "346 pruebas, 344 pasan"; las cifras crecen con los cambios.)

## Qué prueba cada archivo

La suite tiene **347 pruebas** del servidor repartidas en 24 archivos. Los cinco más grandes, para ver el reparto:

| Archivo | Pruebas | Qué cubre |
|---|---|---|
| `test_voice_wake.py` | 58 | La regla tolerante de "Lumina": formas observadas, frases que **no** deben activar, falsos positivos conocidos a la vista, tecla `w` |
| `test_main.py` | 51 | Las rutas del servidor: inventario, retiro, historial, guardia público, CSP, Lumina |
| `test_voice_service.py` | 27 | El servicio de voz, con un servidor y un WebSocket reales |
| `test_agent_routes.py` | 26 | Las rutas de los agentes: 403 fuera de red, 413 por tamaño, 422 por contrato, origen ajeno, tope de conexiones |
| `test_agent_contracts.py` | 23 | Los modelos de datos y sus límites |

Otros archivos con propósito claro: `test_observation_outbox.py` (reintento, cola acotada, laptop que se cae y vuelve), `test_cell_line.py` y `test_celda_agent.py` (los pulsos, con relevadores falsos; que el agente de la celda **no importe** `main`, Lumina, `torch` ni `ultralytics`), `test_dataset_store.py`, `test_settings.py` (variables de entorno inválidas), `test_scripts_arranque.py` y `test_scripts_voz.py`, y `test_dashboard_js.py`, que ejecuta con **Node** (el motor de JavaScript) las pruebas del código del panel en `tests/dashboard/`: el puente de voz de `robot.js`, la reconexión y los tres guiones de video (agente configurado, sin configurar, esquema peligroso, versión desconocida).

## Dobles y relojes falsos: cómo probar sin hardware

Casi toda la lógica del proyecto está escrita para recibir sus dependencias **por parámetro**: la cámara, el modelo, el reloj, la función de envío por red, los pines. En las pruebas se pasan **dobles** (versiones falsas):

- `observation_outbox.py` recibe `send(url, payload, timeout)`; las pruebas le pasan una función que simula caídas.
- `voice/core.py` recibe un **reloj** inyectable: las pruebas "avanzan el tiempo a mano" sin esperar de verdad.
- `cell_line.py` recibe una función de espera y una clase de salidas: las pruebas usan **relevadores falsos**.

El resultado es que una lógica compleja (reintentos, anti-eco, temporizadores del pistón) se prueba **en milisegundos y sin riesgo**.

## Una prueba que falla antes de la corrección

El equipo aplica una regla valiosa: **las pruebas de un error deben fallar con el código viejo y pasar con el nuevo.** Se aplicó al video bloqueado por la CSP del 23 de octubre ("Las pruebas nuevas fallan con el código anterior y pasan con el nuevo"). Una prueba que nunca pudo fallar no demuestra nada.

## Pruebas de extremo a extremo y revisión estática

Algunas pruebas levantan **un servidor real** (`uvicorn`) y un **WebSocket real**: es el caso del servicio de voz con una página simulada y del agente del Jetson con una cámara falsa. Otras son **revisiones estáticas**: por ejemplo, una prueba lee el código del servicio de voz y comprueba que **no contenga** ninguna llamada a abrir archivos de audio (`open(`, `wave`, `soundfile`), de modo que la promesa "el audio nunca se guarda" se verifica **en el texto del programa**.

## Lo que ninguna prueba automática puede decir

El documento de trazabilidad (`docs/auditoria/TRAZABILIDAD.md`) tiene una columna honesta para cada requisito: **COMPROBADO** (hay prueba que pasó o salida real) contra **NO COMPROBADO** (depende de hardware o voz reales). Ejemplos: **el micrófono real, Vosk con español real, el aviso de Windows, el firewall Privado, Firefox con monitor HDMI, el Jetson a 30 FPS, la Pi real**. Para esos casos existen **13 verificaciones manuales (V1 a V13)** con comando, salida esperada y qué hacer si falla: FPS del agente (V1), página que muestra la cámara del Jetson (V2), observaciones que llegan (V3), firewall (V4), micrófono (V5), latencia del reconocedor (V6), voz de punta a punta (V7), aviso y privacidad (V8 y V9), eco (V10), Firefox con HDMI (V11), "Lumina" con la voz real (V12) y Whisper contra Vosk (V13). **La mayoría sigue sin ejecutarse**; la primera prueba del agente en el Jetson (23 de octubre) cubrió una parte de V1 y V2. Pendientes: **P-27** (las de voz) y **P-22** (las de medición del Jetson).

## Calidad del código: ruff

**`ruff`** es una herramienta que revisa estilo y errores comunes del código Python. El proyecto la usa con `line-length = 100` y `target-version = py310`, y la bajó a Python 3.10 porque el Jetson trae esa versión (el cambio de `datetime.UTC` por `timezone.utc` también salió de ahí). Al correrla el 24 de octubre con la configuración que encuentra la laptop, `ruff check backend tests` reportó **243 observaciones**: **111** de una regla sobre el alias de banderas de expresiones regulares, **46** `noqa` sin efecto, **15** importaciones sin ordenar y **14** `except` genéricos, entre otras; **178** son corregibles automáticamente. Ninguna es un error de funcionamiento (las pruebas pasan), pero es **deuda de limpieza**, y no se ha limpiado todavía.

## Una nota sobre tiempos y hábitos

El proyecto sigue una regla de trabajo que conviene copiar: **cada cambio de comportamiento viene con su prueba, o con la explicación de por qué no se puede probar**; **cada medición dice con qué hardware y en qué modo se hizo**; y los informes distinguen siempre lo que se comprobó con dobles de lo que se vio en el equipo real.

## Cómo lo hace una empresa

Las empresas ejecutan las pruebas **automáticamente en cada cambio** (**integración continua**, con servicios como GitHub Actions), añaden **pruebas de integración** con hardware real en un banco ("hardware-in-the-loop"), miden la **cobertura** (qué porcentaje del código recorren las pruebas) y bloquean un cambio que rompa la suite. Aether no tiene integración continua configurada ni medición de cobertura: **NO VERIFICADO** que existan (no se encontraron en el repositorio).

## Preguntas de repaso: pruebas

1. ¿Por qué falló la colección de pruebas cuando se corrieron juntas las del servidor y las de borde?
2. ¿Qué significa que una lógica reciba su reloj "por parámetro" y qué ventaja da?
3. Explicar con un ejemplo qué es una prueba de revisión estática.
4. ¿Por qué se dice que una prueba de un error debe fallar con el código viejo?
5. Citar tres cosas que ninguna prueba automática puede decir y quién las comprueba.
6. ¿Qué dos pruebas fallan hoy y por qué no se han corregido?
