# Capítulo 13: Python, FastAPI y la configuración

*Por qué casi todo el software de Aether está escrito en Python, cómo un archivo de funciones se vuelve un servidor web, qué es un contrato entre programas y por qué una variable mal escrita debe tumbar el arranque.*

## Una librería de más que tumbó el arranque

La bitácora de la sesión 4 del Jetson (21 de octubre de 2026) registra algo muy aleccionador: un paquete llamado `ultralytics-thop`, que nadie había pedido directamente, **arrastraba un `torch` de PyPI** (sin soporte de la GPU de NVIDIA) al instalar los requisitos, y con el orden previsto habría pisado el `torch` bueno. Se detectó simulando la instalación antes de ejecutarla. La anécdota resume el capítulo: **el software moderno es una pirámide de dependencias**, y casi todo problema de un entorno Python se resuelve entendiendo *quién instala qué*.

## Por qué Python manda aquí

**Python** es un lenguaje de programación legible y con librerías para casi todo lo que Aether necesita: visión por computadora (OpenCV, `ultralytics`), servidores web (FastAPI), bases de datos (SQLAlchemy) y reconocimiento de voz (Vosk). El equipo lo eligió por una razón práctica: **un solo programador (Mario) debe poder mantener toda la capa de software**, y Python minimiza el código por función. Su costo: es más lento que un lenguaje compilado, por eso la parte de tiempo real (motores) vive en un microcontrolador aparte (capítulo 5).

El proyecto tiene tres grandes zonas de código:

| Carpeta | Qué contiene |
|---|---|
| `backend/` | El servidor de la laptop, los agentes del Jetson y de la Pi, el servicio de voz, la base de datos |
| `edge/` | Percepción e inventario "de borde": los scripts originales de cámara, YOLO, códigos, ArUco y el motor de agregación |
| `dashboard/` | El panel web en HTML, CSS y JavaScript (capítulos 11 y 19) |

(Además: `firmware/` está vacío por ahora, `contracts/` guarda los contratos de comunicación, `tests/` las pruebas y `scripts/` las herramientas.)

## El entorno virtual: una caja de herramientas por proyecto

Si todas las librerías se instalaran en el mismo lugar del sistema, dos proyectos que pidieran versiones distintas de la misma librería chocarían. El **entorno virtual** (**venv**) es una carpeta aislada con su propio Python y sus propias librerías. Aether tiene dos en la laptop (`edge/.venv` y `backend/.venv`) y uno por equipo en el Jetson y la Pi. Para ejecutar con el entorno correcto no hace falta "activarlo": se llama al Python que vive dentro, `[Laptop · PowerShell]`:

```powershell
backend\.venv\Scripts\python.exe -m pytest tests\backend -q
```

(El 24 de octubre ese comando dio **345 pruebas aprobadas y 2 fallidas**; capítulo 22.) El **archivo de requisitos** (`requirements.txt`) lista lo que cada entorno instala, y el proyecto lo parte a propósito:

| Archivo | Para quién |
|---|---|
| `backend/requirements.txt` | La laptop: `fastapi`, `uvicorn`, `sqlalchemy`, `opencv-contrib-python`, `ultralytics`, `pyzbar`, `python-dotenv` |
| `backend/requirements-dev.txt` | Solo desarrollo: `ruff` (revisor de estilo), `pytest` (pruebas), `httpx` (lo necesita el cliente de pruebas) |
| `backend/requirements-voice.txt` | Solo la laptop con micrófono: `sounddevice`, `vosk` |
| `backend/requirements-jetson.txt` | El Jetson: sin OpenCV ni `torch` (vienen del sistema y de NVIDIA), con `numpy<2` |
| `backend/requirements-pi.txt` | La Pi 4: `fastapi` y `uvicorn`; OpenCV y NumPy salen de `apt` |

Es una muestra de disciplina: **"No se instala driver de PostgreSQL todavía porque esa decisión no está cerrada"** (comentario del propio archivo). Es el principio de *no fabricar dependencias* hecho práctica.

## FastAPI: convertir funciones en direcciones web

**FastAPI** es una librería que convierte funciones de Python en **endpoints** (direcciones del servidor que responden a peticiones). Cada función lleva un "decorador" que dice el verbo y la ruta. Ejemplo real de `backend/main.py`:

```python
@app.get("/health")
def health():
    return {"status": "ok"}
```

Con eso, `GET /health` responde `{"status": "ok"}`. FastAPI usa **tipos** para validar datos automáticamente: si una ruta espera un cuerpo con un campo `password` de tipo texto y llega otra cosa, responde `422` sin que el programador escriba la validación. El servidor central de Aether tiene más de **25 rutas** (inventario, historial, cámaras, celda, Lumina, llamadas, texto a voz, dataset…); `GET /docs` muestra la lista interactiva.

## Uvicorn: el motor que mantiene abierta la puerta

FastAPI **define** qué hacer; **Uvicorn** es el programa que **escucha** el puerto y le pasa cada petición. Por eso se arranca así, `[Laptop · PowerShell]`, desde `backend/`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

`main:app` significa "el objeto `app` del archivo `main.py`". `--host 0.0.0.0` acepta conexiones de otros equipos; `--port 8000` es el puerto. (El script `iniciar_aether.ps1` hace todo esto con comprobaciones, capítulo 12.)

## Contratos: cuando dos programas deben ponerse de acuerdo

Un **contrato** es un acuerdo escrito sobre qué datos se mandan y con qué forma. Aether tiene varios (`contracts/`), y el más importante es el de los **agentes** (`contracts/agents_api.md`): lo que el Jetson manda a la laptop. Su fuente de verdad es un archivo de Python (`backend/agent_contracts.py`) con **modelos pydantic** (la librería de validación de FastAPI). Un ejemplo, resumido, del modelo `Observation`:

| Campo | Tipo y regla |
|---|---|
| `v` | Siempre `1` (versión del contrato) |
| `event_id` | Texto de 8 a 64 caracteres (letras, números, `_`, `-`): la identidad única del evento |
| `timestamp` | Fecha con **zona horaria** obligatoria (UTC) |
| `source` | Quién la manda: letras minúsculas, números, `_`, `-` (hasta 32) |
| `detected_class` | Qué se vio (1 a 64 caracteres) |
| `code_data` / `code_read` | El código leído (o ninguno) y si se leyó |
| `confidence` | Número entre 0 y 1 |
| `location_marker_id` | El ArUco visible, o ninguno |

Reglas estrictas del contrato: **se prohíben campos extra** (`extra="forbid"`), un lote admite **hasta 100** observaciones, el cuerpo de una petición no puede pasar de **64 KiB** (si no, `413`), y **todo mensaje lleva la versión** para poder evolucionar sin romper. Ninguna petición ejecuta código: solo se validan y se guardan datos (capítulo 16).

## Configuración centralizada: el archivo settings

Casi todo en Aether se configura con **variables de entorno** (capítulo 12), y `backend/settings.py` es la única puerta de entrada para leerlas. Sus funciones (`env_bool`, `env_int`, `env_float`, `env_choice`, `env_url`, `env_cidrs`) **validan al arrancar** y, si algo está mal, lanzan un `ConfigError` que **nombra la variable y dice qué se esperaba**: *"AETHER_DETECT_MAX_HZ debe ser a lo más 120, no 500"*. El servidor además se niega a arrancar si una dirección de agente es inválida (`lifespan` en `main.py`). Beneficio: la falla ocurre en el segundo cero, con un mensaje claro, y no a mitad de una demostración.

La **tabla única** de variables está en `docs/variables_entorno.md`. Una selección de las más importantes:

| Variable | Defecto | Para qué |
|---|---|---|
| `AETHER_PERCEPTION_AGENT_URL` | vacía | Dirección del agente del Jetson; sin ella las páginas usan la cámara de la laptop |
| `AETHER_LAN_CIDRS` | rangos privados | Redes de las que se aceptan agentes y voz |
| `AETHER_DETECT_MAX_HZ` | `10` | Máximo de inferencias por segundo del agente (valor de diseño, no medido) |
| `AETHER_OUTBOX_INTERVAL_S` | `1` | Cada cuánto se juntan y mandan las observaciones |
| `AETHER_VOICE_VAD_THRESHOLD` | `500` | Umbral de energía de la voz |
| `CELDA_HMI_CLAVE` | — | **Secreto**: contraseña de la celda |
| `ADMIN_ACTION_PASSWORD` | `aether-dev` | **Secreto** de desarrollo para retirar inventario |

## Pruebas automáticas: un guardia que revisa por uno

Una **prueba automática** es un programa que ejecuta otra parte del código y comprueba que haga lo esperado. Aether usa **pytest**. Un patrón del proyecto: las pruebas **no necesitan cámara ni red**, porque las dependencias pesadas (la cámara, el modelo, el reloj) se pasan **por parámetro** y las pruebas usan **dobles** (versiones falsas). El capítulo 22 las detalla.

## Qué leer primero cuando uno se pierde en el código

Un recorrido sugerido para entender el servidor:

1. `backend/main.py`: la lista de rutas y qué hace cada una (el principio del archivo explica que es el "punto de entrada mínimo").
2. `backend/agent_contracts.py` y `contracts/agents_api.md`: lo que los agentes pueden mandar.
3. `backend/cell_line.py` y `backend/celda_agent.py`: la celda (capítulo 7).
4. `backend/perception_pipeline.py`: cómo se analiza un cuadro (capítulo 14).
5. `backend/voice/`: el servicio de voz (capítulo 15).
6. `docs/variables_entorno.md` y `docs/guia_arranque.md`: cómo se configura y se arranca todo.

## Hacia dónde crece Python en un producto real

En productos mayores se agregan **tipado estático** (`mypy`), **empaquetado** del proyecto, **contenedores** (Docker) para reproducir el entorno exacto, y servidores de producción con varios procesos. Aether ya usa tipos de FastAPI y `ruff` (con `line-length = 100` y `target-version = py310`, para correr en Python 3.10 del Jetson), y deja Docker como evolución (capítulo 26).

## Preguntas de repaso: Python y servidores

1. ¿Qué es un entorno virtual y por qué la Pi usa `--system-site-packages`?
2. ¿Qué hace el decorador `@app.get("/health")`?
3. ¿Cuál es la diferencia entre FastAPI y Uvicorn?
4. ¿Qué pasa si una observación llega con un campo extra no previsto, y por qué es buena idea?
5. ¿Por qué una variable de entorno mal escrita debe detener el arranque?
6. ¿Qué cinco archivos conviene leer primero para entender el servidor?
