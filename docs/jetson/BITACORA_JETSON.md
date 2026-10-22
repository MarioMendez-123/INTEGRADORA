# Bitácora de hardware real — Jetson y Raspberry Pi 4

Una entrada por sesión. Cada entrada dice qué se hizo, los comandos, la salida
real, los errores y el estado final, separando lo **verificado con hardware**
de lo que **no**. Si algo no se pudo comprobar, se dice.

---

## Sesión 1 — 2026-10-21 — Preparar el código para Python 3.10 (solo laptop)

**Rama:** `jetson-setup`, creada desde `feature/hardening-cloudflare`.

**Por qué esa rama:** `feature/hardening-cloudflare` no está mergeada a `main`
(23 commits que `main` no tiene, 0 en el otro sentido) y `backend/cell_line.py`
solo existe en ella. Las ramas `feature/robot-lumina-camera-sharing` y
`feature/seguridad-y-alianzas` están por detrás de ella (13 y 8 commits). Salir
de `main` habría dejado fuera la celda, Lumina y el carrito 3D.

**Equipo usado en esta sesión:** la laptop Windows (Python 3.11.9, ruff 0.16.5,
pytest 9.1.1). No se tocó el Jetson ni la Raspberry.

### Qué se hizo

1. Se leyeron los documentos y el código listados en el encargo (ver las
   tensiones documentales que salieron, abajo).
2. Se cambió `from datetime import UTC` por `timezone.utc` en 7 archivos
   (15 líneas), porque `datetime.UTC` solo existe desde Python 3.11 y el Jetson
   trae 3.10. Archivos: `backend/main.py`, `backend/dataset_store.py`,
   `backend/inventory_refresh.py`, `backend/scripts/load_from_edge.py`,
   `edge/perception/capture_headless.py`, `edge/perception/test_combined.py`,
   `edge/perception/train_parts.py`.
3. Se bajó `target-version` de ruff de `py311` a `py310` en
   `backend/pyproject.toml` y `edge/pyproject.toml`, en un commit aparte.

### Comandos y salida real

Línea base (antes de tocar nada), con `backend/.venv` y `edge/.venv`:

```
ruff check <los 7 archivos>              -> Found 9 errors
pytest (en backend/)                     -> 2 failed, 95 passed
pytest (en edge/)                        -> 7 passed
```

Después del cambio de `UTC`, con la configuración vieja (`py311`):

```
ruff check <los 7 archivos>              -> Found 17 errors  (8 nuevos, todos UP017 "Use datetime.UTC alias")
pytest (en backend/)                     -> 2 failed, 95 passed  (idéntico)
pytest (en edge/)                        -> 7 passed
```

Después de bajar el objetivo de ruff a `py310`:

```
ruff en backend/ (4 archivos tocados)    -> Found 6 errors
ruff en edge/    (3 archivos tocados)    -> Found 3 errors      (6 + 3 = 9, igual que la línea base)
```

Sintaxis comprobada para Python 3.10 con `ast.parse(..., feature_version=(3, 10))`
en los 7 archivos: sin errores.

### Estado final

| | Estado |
|---|---|
| Cambio de `UTC` en laptop (Python 3.11) | **Verificado**: mismas pruebas que antes |
| Sintaxis válida para 3.10 | **Verificado** con `ast`, no ejecutando en 3.10 |
| El backend arranca en el Jetson con Python 3.10 | **NO verificado**: el Jetson no se tocó |
| Cualquier cosa de cámara, GPU, YOLO o red | **NO verificado**: sin hardware todavía |

### Deuda aparte (no se arregla en esta sesión)

**Dos pruebas de `/robot/ask` ya fallaban antes de cualquier cambio** de esta
sesión. Fallan igual con y sin el cambio de `UTC`:

- `tests/backend/test_main.py::test_robot_ask_conserva_varias_oraciones_reales_tras_filtrar`
  (línea 302)
- `tests/backend/test_main.py::test_robot_ask_lista_numerada_tambien_se_detecta`
  (línea 378)

Salida real: ambas pasan `status_code == 200` pero el cuerpo no es el esperado.
`response.json()` devuelve un `answer` que empieza con `P…` y termina en
`…e tu perfil.`, y la prueba esperaba otro texto. En el log de la primera aparece
la pregunta `¿Qué puedes hacer?`. Hipótesis **sin comprobar**: la pregunta cae en
una respuesta local de Lumina antes de llegar al modelo simulado de la prueba.
No se investigó más.

**Avisos previos de ruff** en los 7 archivos tocados (9, ya estaban): imports
sin ordenar en `main.py`, `capture_headless.py` y `test_combined.py`; `F811`
(`Response` redefinido) y un `BLE001` en `backend/main.py`; `RUF100` por dos
`noqa` innecesarios; `RUF059` en `capture_headless.py`. En todo `backend/` y
`edge/` hay más de cien hallazgos previos de ruff.

**Pendiente menor:** `tests/backend/test_cell_simulator.py` todavía importa
`UTC` de `datetime`. Solo afecta si esa prueba se corre con Python 3.10.

### Tensiones documentales detectadas (deuda de reconciliación)

No se editó ningún documento. Se listarán en la ADR 0011 (supersede lo
desactualizado) y en una tarea de reconciliación:

- La visión de línea aparece en una "PC fija" (ADR 0010 y
  `aether_context_docs.md` §5) y en la Raspberry Pi 4 (hoja de conexión de la
  celda, 2026-10-05).
- Referencias a Raspberry Pi 5 y AI HAT+ (`aether_context_docs.md` §3 y §5,
  `0004-hardware-computo.md`).
- La hoja de la celda describe un PLC por Modbus; `backend/cell_line.py` maneja
  relevadores por GPIO 8 y 9 hacia un LOGO. `contracts/rest_api.md` define
  `sources.plc` como "GPIO abiertos". **Pendiente:** confirmar con el equipo qué
  está físicamente cableado antes de tocar GPIO.
- `CELL_AGENT_URL` (:8080) está solo en documentos; `backend/main.py` no la
  consume.
- `URLS_Y_COMANDOS.md` sigue diciendo que la celda es "estado simulado".

### Pendiente de datos para la siguiente sesión

- Salida de `cat /etc/nv_tegra_release` en el Jetson (para elegir el PyTorch
  exacto de NVIDIA).
- Si la cámara del robot es USB o CSI (`ls /dev/video*`,
  `v4l2-ctl --list-devices`).
- Usuario del Jetson (`whoami`), solo para la parte de SSH.
- En la Raspberry: no instalar `gpiod` y comprobar `sources.plc: false` en
  `/line/cell/status` antes de cualquier prueba.

---

## Sesión 2 — 2026-10-21 — Jetson: reconocimiento del sistema y la cámara (solo lectura)

**Quién ejecutó qué:** Mario corrió los comandos en `mario@mario-desktop` y pegó
las salidas; Claude trabajó en la laptop y solo analizó lo pegado. Claude no
ejecutó nada en el Jetson. Todo lo marcado "reportado" viene de esas salidas
pegadas y no se volvió a comprobar.

### Problema de conexión: desconexiones de SSH

Las sesiones SSH se cortaban mientras el Jetson tenía **WiFi y cable Ethernet
activos a la vez en la misma red**. Mario dejó solo el cable (`192.168.100.19`)
y apagó el WiFi.

- Causa **no diagnosticada**. Hipótesis sin comprobar: con dos interfaces en la
  misma subred el equipo tiene dos IP, y la ruta o el nombre `mario-desktop.local`
  pueden saltar de una a otra a mitad de sesión.
- Estabilidad después del cambio: **no verificada en uso prolongado**.
- Mitigación para lo largo: `tmux` en el Jetson (ver `COMANDOS_LINUX.md`), para
  que un corte de SSH no mate el backend.

### Repo en el Jetson

Clonado en `~/aether`, rama `jetson-setup`, commit `c0c9924` (reportado por
Mario). Comando usado: `git clone --branch jetson-setup --single-branch
https://github.com/MarioMendez-123/INTEGRADORA.git aether`.

### Estado del sistema (reportado)

| Dato | Valor |
|---|---|
| JetPack / L4T | JetPack 6, L4T R36 REVISION 4.7 (GCID 42132812, 2025-09-18) |
| SO / arquitectura | Ubuntu 22.04, aarch64 |
| Python | 3.10.12 |
| OpenCV (sistema) | 4.8.0; `hasattr(cv2.aruco, 'ArucoDetector')` = True |
| PyTorch | **No instalado** (`ModuleNotFoundError`) |
| RAM | 7.4 GiB totales, 6.0 libres; swap 3.7 GiB |
| Disco | `/dev/mmcblk0p1`, 47 G, 23 G libres |
| Energía | Modo actual 25W (ID 1). Disponibles: 0 = 15W, 1 = 25W, 2 = MAXN_SUPER, 3 = 7W |
| Usuario | `mario`; grupos: adm cdrom sudo audio dip video plugdev render i2c lpadmin gdm sambashare weston-launch **gpio** |

**Para la Fase C:** toda medición de FPS debe anotar el modo de `nvpmodel`
(hoy 25W, no MAXN_SUPER). No se cambió el modo.

**GPIO:** el usuario está en el grupo `gpio`. `backend/cell_line.py` hace
`import gpiod` al cargarse y, si el módulo existe, configura como salidas los
GPIO 8 y 9 de `/dev/gpiochip0`. En el Jetson **no** se instala `gpiod`, y antes
de arrancar el backend se comprueba que `python3 -c "import gpiod"` falle. No
se toca nada de GPIO hasta que el equipo confirme qué está cableado en la celda.

### Cámara (reportado)

- Una sola cámara USB (UVC): "1080P Pro Stream", bus `usb-3610000.usb-2.3`, en
  `/dev/video0` y `/dev/video1`. Permisos `crw-rw----+ root video`; el usuario
  está en `video`.
- `lsusb` la muestra como Logitech CrystalCam (046d:0894).
- Formatos de `/dev/video0`: YUYV y MJPG. YUYV listado: 640x480, 320x180,
  176x144, 160x120 y 160x90, hasta 30 fps. **El listado quedó cortado**: no se
  vieron las resoluciones de MJPG.
- `/dev/media0` es el controlador CSI de la placa (Tegra Video Input Device),
  no una cámara. No hay cámara CSI conectada.

**No confirmado todavía:** que `/dev/video1` sea solo metadatos; que "1080P Pro
Stream" y la CrystalCam sean el mismo dispositivo; que el driver sea
`uvcvideo`; qué backend elige `cv2.VideoCapture(0)` por defecto (V4L2 o
GStreamer); las resoluciones de MJPG. Los comandos para confirmarlo están en
`COMANDOS_LINUX.md`, sección Cámara.

### PyTorch: lo que se encontró (nada instalado)

Verificado desde la laptop el 2026-10-21 con `curl -I`: estas URLs **existen**
(HTTP 200). Eso solo prueba que el archivo está publicado, no que funcione en
este Jetson.

- NVIDIA: `https://developer.download.nvidia.com/compute/redist/jp/v61/pytorch/torch-2.5.0a0+872d972e41.nv24.08.17622132-cp310-cp310-linux_aarch64.whl`
- Ultralytics (assets): `torch-2.5.0a0+872d972e41.nv24.08-cp310-cp310-linux_aarch64.whl`,
  `torchvision-0.20.0a0+afc54f7-cp310-cp310-linux_aarch64.whl`,
  `torch-2.10.0-cp310-cp310-linux_aarch64.whl`,
  `torchvision-0.25.0-cp310-cp310-linux_aarch64.whl`, todas bajo
  `https://github.com/ultralytics/assets/releases/download/v0.0.0/`.

**No verificado:**

- La página de instalación de NVIDIA para Jetson no lista ruedas de JetPack 6
  (solo ejemplos de JetPack 5); la rueda `v61` salió de un hilo del foro, donde
  un usuario la reporta funcionando en JetPack 6.2.2 con CUDA 12.6.
- Cuál JetPack corresponde a L4T 36.4.7: las fuentes se contradicen. La versión
  real sale de `apt-cache policy nvidia-jetpack` en el equipo.
- Un hilo del foro de NVIDIA reporta, en L4T 36.4.7, el error "unable to
  allocate CUDA0 buffer" tras actualizar paquetes de Ubuntu. Es un resumen del
  hilo, no documentación oficial, y no se comprobó en este equipo. Si
  `torch.cuda.is_available()` falla o hay errores de memoria CUDA, esta es la
  primera pista.
- `libcusparseLt` (necesaria para torch 24.06 o posterior según NVIDIA): no se
  sabe si ya está en el sistema.

### Archivos nuevos de esta sesión

- `backend/requirements-jetson.txt`: dependencias del backend para el Jetson,
  sin opencv ni torch, con `numpy<2`. Armada con los imports del backend y las
  dependencias declaradas por ultralytics 8.4.137. **Sin instalar todavía.**
- `COMANDOS_LINUX.md`: comandos de SSH, arranque con `tmux` y verificación.

### Estado final

| | Estado |
|---|---|
| Sistema, versiones, RAM, disco, modos de energía | **Reportado por Mario** (salidas reales) |
| Hay una cámara USB UVC y ninguna CSI | **Reportado**, falta confirmar driver y nodo de captura |
| Repo clonado en el Jetson | **Reportado** |
| SSH estable con solo el cable | **NO verificado** (pocas horas de uso) |
| PyTorch con CUDA | **NO instalado** |
| El backend arranca en el Jetson | **NO verificado** |
| La cámara abre con OpenCV | **NO verificado** |
| `requirements-jetson.txt` instala sin conflictos | **NO verificado** |

### Siguiente

1. Comprobaciones de solo lectura: `gpiod`, versión exacta de JetPack,
   librerías CUDA, nodo y formatos de la cámara.
2. Instalar torch y torchvision de NVIDIA, verificar `torch.cuda.is_available()`.
3. Probar la cámara con `CAP_V4L2` y arrancar el backend en el puerto 8001.

---

## Sesión 3 — 2026-10-21 — Paquetes base, cámara y `libcusparseLt` (sin instalar PyTorch todavía)

**Quién ejecutó qué:** Mario corrió los comandos en el Jetson, dentro de `tmux`, y
reportó el resultado. Claude, en la laptop, investigó en la documentación de
NVIDIA, preparó un cambio de código y revisó `requirements-jetson.txt`. Lo marcado
"reportado" viene de lo que contó Mario; el detalle de las salidas no se pegó en
el chat y por eso aquí no se transcribe.

### Instalado en el Jetson (reportado)

`sudo apt-get install -s` salió limpio (solo paquetes de Python, nada de NVIDIA) y
después Mario instaló `python3-pip` y `python3-venv`.

| Comprobación | Resultado reportado |
|---|---|
| Python | 3.10.12, sin cambio de versión (solo parches de Ubuntu) |
| pip | 22.0.2, de `/usr/lib/python3/dist-packages` |
| `python3 -m venv --system-site-packages` | crea bien un entorno de prueba |
| `/etc/nv_tegra_release` | sigue en R36 REVISION 4.7 |
| `/usr/local` | sigue con `cuda-12.6`; nada de GPU se movió |

### Cámara (reportado, sin detalle pegado)

Mario reporta la cámara como verificada. Hallazgo: **sin backend explícito,
OpenCV abre la cámara por GStreamer y entrega un frame de 1536x2304, que no es un
modo real de la cámara** (la cámara ofrece 640x480 y menores en YUYV). Esto es
exactamente lo que `CameraPublisher` hace hoy, porque llama
`cv2.VideoCapture(índice)` sin backend. No se registran aquí los formatos MJPG, los
FPS ni el nodo de captura porque no se pegaron las salidas; si se quieren dejar
en la bitácora, hay que pegarlas.

### Cambio de código propuesto, sin comitear (espera aprobación de Mario)

Variables de entorno opcionales para forzar V4L2 y un modo real de la cámara:
`PERCEPTION_CAMERA_BACKEND` / `_FOURCC` / `_WIDTH` / `_HEIGHT` y las equivalentes
`LINE_VISION_CAMERA_*`. Sin definirlas, la cámara se abre exactamente como antes
(`cv2.VideoCapture(índice)`, sin ninguna llamada a `set()`), así que Windows no cambia.
Archivos: `backend/camera_publisher.py`, `backend/main.py`,
`tests/backend/test_camera_publisher.py`.

Verificado en la laptop (Python 3.11.9):

| Chequeo | Antes | Después |
|---|---|---|
| `pytest` backend | 2 fallan, 95 pasan | 2 fallan, 100 pasan (5 pruebas nuevas, las mismas 2 fallas de `/robot/ask`) |
| `pytest` `test_camera_publisher.py` | 4 pasan | 9 pasan |
| `pytest` edge | 7 pasan | 7 pasan |
| `ruff` | `main.py`: 6 avisos previos | los mismos 6; `camera_publisher.py` limpio |

No verificado: que el cambio funcione con la cámara real del Jetson.

### `libcusparseLt` para CUDA 12.6: investigación (no instalada)

PyTorch de NVIDIA posterior a 24.06 necesita `libcusparseLt.so.0`.

- **El script que cita la documentación de NVIDIA no sirve para CUDA 12.6.** Su
  contenido (commit `5c6af2b` de `pytorch/pytorch`, `install_cusparselt.sh`) solo
  tiene ramas para CUDA 12.1 a 12.4 (versión 0.5.2.1, arquitectura `sbsa`) y 11.8.
  Con `CUDA_VERSION=12.6` no entra a ninguna rama y falla.
- **Notas de versión oficiales** (docs.nvidia.com/cuda/cusparselt/release_notes.html):
  v0.6.2 "Introduced Orin support (SM 8.7)"; v0.7.0 "requires CUDA 12.8 or above";
  v0.8.x compatible con CUDA 12.9 y 13.0; v0.9.0 "Support for the Jetson platform
  has been discontinued". Por eso, con CUDA 12.6 en Orin, solo sirven 0.6.2.3 o
  0.6.3.2.
- **Archivos oficiales para Jetson** (`.../redist/libcusparse_lt/linux-aarch64/`,
  distinto de `linux-sbsa`): `0.6.2.3` (12 869 440 bytes) y `0.6.3.2` (19 000 276
  bytes), ambos HTTP 200 desde la laptop. Se descargó el `0.6.2.3` y se comprobó
  que contiene `lib/libcusparseLt.so.0`, `.so.0.6.2.3`, `.so` e
  `include/cusparseLt.h`, y que el `.so` es **ELF 64-bit, ARM aarch64**.
  sha256 del `.tar.xz` descargado, solo como referencia para comparar (NVIDIA no
  publica uno): `b081a82a884754fd7ab1f53aa9cd1a943d782b87268c3657991c287af3179811`.
- **Elegida:** `0.6.2.3`. **Respaldo:** `0.6.3.2`.
- **No encontré** una instrucción oficial literal para JetPack 6 con CUDA 12.6; la
  página de descargas de NVIDIA no mostró comandos. El procedimiento (extraer y
  copiar a `/usr/local/cuda`) es el mismo del script oficial, con el archivo elegido
  por las notas de versión. **No verificado** que PyTorch cargue con esta versión.

### `requirements-jetson.txt` y `gpiod`

Verificado: el archivo no menciona `gpiod` ni nada de GPIO, y revisando el árbol
completo de dependencias de sus 14 entradas (58 paquetes, con los metadatos de la
laptop) ninguna dependencia lleva `gpio` en el nombre. Limitaciones: 11 paquetes
sin metadatos en la laptop no se pudieron expandir (dependencias de torch y
marcadores condicionales que no aplican al Jetson), y el árbol en Linux aarch64
podría diferir un poco. Aparte: un venv con `--system-site-packages` **sí ve** un
`gpiod` instalado en el Python del sistema; por eso se comprueba aparte con
`python -c "import gpiod"` dentro del venv.

### Aviso de coordinación

El Jetson clonó `jetson-setup` en `c0c9924`. `requirements-jetson.txt` y
`COMANDOS_LINUX.md` están en `700c3d1`, que **no se ha subido**. Hasta el push (o
un `scp`), el Jetson no tiene esos archivos.

### Estado final

| | Estado |
|---|---|
| `python3-pip` y `python3-venv` instalados, sistema sin cambios de NVIDIA | **Reportado por Mario** |
| La cámara abre por GStreamer con un frame de 1536x2304 si no se fuerza V4L2 | **Reportado por Mario** |
| Cambio de `CameraPublisher` con variables de entorno | **Probado en laptop** con doble de `cv2`; **NO** con la cámara real; **sin comitear** |
| Elección de `libcusparseLt 0.6.2.3` | Basada en notas oficiales y binario ELF aarch64; **NO instalada ni probada** |
| `requirements-jetson.txt` sin dependencias de GPIO | **Verificado** con el árbol de dependencias (con las limitaciones de arriba) |
| PyTorch con CUDA | **NO instalado** |
| El backend arranca en el Jetson | **NO verificado** |

### Siguiente

1. Instalar `libcusparseLt` y verificar que `libcusparseLt.so.0` carga.
2. Aprobar y comitear el cambio de `CameraPublisher`; subir la rama al Jetson.
3. Crear el venv, instalar `requirements-jetson.txt`, y solo entonces torch y torchvision.

### Pendiente de repetir: FPS, exposición y calidad de imagen (nota de Mario)

Las pruebas de cámara de la sesión 3 se hicieron en un **cuarto oscuro** y con la
**cámara sin acomodar** en su posición final. Por eso los ~15 fps que se vieron y
la exposición **no son representativos**: con poca luz muchas cámaras USB bajan
los FPS al alargar la exposición automática.

- **Pendiente de repetir** con buena luz y la cámara en su posición final: FPS,
  exposición y calidad de imagen. Hasta entonces, ninguno de esos tres datos se
  usa para los umbrales `[PENDIENTE]` de `criterios_aceptacion.md`.
- **Decisión:** el cambio de `CameraPublisher` NO incluye control de exposición ni
  de framerate dinámico (`exposure_dynamic_framerate`). Se decidirá, si hace falta,
  después de repetir las mediciones con buena luz.
- Al repetir, anotar también el modo de energía (`nvpmodel`), la resolución y el
  formato (YUYV o MJPG) usados.
