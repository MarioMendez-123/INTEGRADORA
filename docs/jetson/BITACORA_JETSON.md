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

---

## Sesión 4 — 2026-10-21 — `libcusparseLt` instalada y corrección de `requirements-jetson.txt`

**Quién ejecutó qué:** Mario corrió los comandos en el Jetson y reportó el resultado.
Claude revisó las dependencias en la laptop.

### `libcusparseLt 0.6.2.3` en el Jetson (reportado por Mario)

| Comprobación | Resultado reportado |
|---|---|
| Descarga | 12 869 440 bytes; sha256 `b081a82a…79811`, igual al calculado en la laptop |
| `file` de la librería | ELF 64-bit LSB shared object, ARM aarch64 |
| Copia | a `/usr/local/cuda/lib64` (`libcusparseLt.so` → `.so.0` → `.so.0.6.2.3`) y `ldconfig` |
| `ldconfig -p` | lista `libcusparseLt.so.0` en `/usr/local/cuda/targets/aarch64-linux/lib/` |
| `ctypes.CDLL('libcusparseLt.so.0')` | imprime "carga OK" |

**Solo se probó que la librería se carga, no que PyTorch funcione con ella.**

**No confirmado** (Mario dejó vacíos esos campos al reportar): que la cabecera
`cusparseLt.h` esté en `/usr/local/cuda/include`, y que `git pull` en el Jetson haya
quedado en `7a93a88`. Se vuelven a comprobar en el primer bloque de comandos de la
sesión.

### Hallazgo: `ultralytics-thop` arrastraba `torch`

Con `pip install --dry-run --report` para Linux aarch64, Python 3.10, `cp310`
(resolvedor real de pip, contra PyPI), `requirements-jetson.txt` traía `torch`
2.14.1 de PyPI, sin el soporte de GPU de NVIDIA, a través de `ultralytics-thop`.
Con el orden previsto (requisitos primero, PyTorch de NVIDIA después) habría
pisado esa instalación. **Corregido:** `ultralytics-thop` salió del archivo y se
instala aparte con `pip install --no-deps ultralytics ultralytics-thop`.

Resultado tras la corrección (verificado con el mismo `--dry-run`): 43 paquetes,
**ninguno `torch`, `torchvision` ni `opencv`**, y `numpy` 1.26.4 (menor que 2). Se
cuela `nvidia-ml-py`, que son los enlaces de Python de NVML, no el entorno de CUDA.

Limitación: pip evaluó los marcadores de entorno del equipo donde corrió (Windows),
así que no muestra dependencias que solo aplican en Linux (por ejemplo `uvloop`, que
trae `uvicorn[standard]`). Ninguna de esas es `torch` ni `opencv`; la lista real
puede diferir un poco. Aparte, el venv usa `--system-site-packages`: `numpy` del
sistema podría quedar sombreado por el de 1.26.4 del venv, así que se comprueba
`import cv2` después de instalar.

### Decisiones

- La IP `192.168.100.19`, `mario@mario-desktop` y `mario-desktop.local` se dejan en
  la documentación (decisión de Mario).

### Estado final

| | Estado |
|---|---|
| `libcusparseLt 0.6.2.3` instalada y carga | **Reportado por Mario** |
| Cabecera `cusparseLt.h` y `git pull` a `7a93a88` | **NO confirmado** |
| `requirements-jetson.txt` sin `torch`, `numpy` 2 ni `opencv-python` | **Verificado** con `pip --dry-run` (con la limitación de arriba) |
| Venv, instalación de requisitos, PyTorch | **Pendiente** |
| PyTorch funciona con esta `libcusparseLt` | **NO verificado** |

### Bloque 1 en el Jetson: pull, cabecera y venv (reportado por Mario)

Salida pegada por Mario (corrida dentro de `tmux`, copia en `~/bloque1.txt` del Jetson):

| Comprobación | Resultado |
|---|---|
| `git pull` | Fast-forward `c0c9924..7a93a88`, 6 archivos nuevos; `git log --oneline -1` → `7a93a88` |
| `/usr/local/cuda/include/cusparseLt.h` | existe, 16 823 bytes |
| `backend/requirements-jetson.txt` | existe, 1 372 bytes (**versión anterior a la corrección de `ultralytics-thop`**; la corregida está en `81cc730`, subido después) |
| Venv `~/aether/backend/.venv` (`--system-site-packages`) | creado; `python` en `.venv/bin/python`, Python 3.10.12; `pip` 22.0.2 desde el propio venv |
| `import gpiod` | `ModuleNotFoundError: No module named 'gpiod'` (como debe ser) |
| `cv2` y `numpy` | `4.8.0` y `1.21.5` (los del sistema) |
| `import torch` | `ModuleNotFoundError: No module named 'torch'` (como debe ser) |

Observación: el `numpy` del sistema es 1.21.5. `matplotlib`, que está en la lista,
pide numpy 1.23 o superior, así que `pip` instalará un `numpy` 1.26.x dentro del
venv que tapará al del sistema. `cv2` 4.8.0 se compiló contra un `numpy` más viejo;
dentro de la serie 1.x suele funcionar, pero **no verificado**: se comprueba
`import cv2` y una operación con arreglos justo después de instalar.

Todavía **no** se instaló nada con `pip` en el venv.

### Bloque 2 en el Jetson: instalación de `requirements-jetson.txt` (reportado por Mario)

`git pull` previo: Fast-forward `7a93a88..76e975c`, 3 archivos, 67 inserciones y 3
borrados; `git log --oneline -1` → `76e975c`; líneas activas con `thop`: 0.

| Comprobación | Resultado reportado |
|---|---|
| `pip install -r requirements-jetson.txt` | "Successfully installed", **26 paquetes** (entre ellos fastapi 0.159.1, uvicorn 0.54.0, sqlalchemy 2.0.55, pydantic 2.14.1, polars 2.0.0, pyzbar 0.1.9, psutil 7.2.2, uvloop 0.23.0) |
| Líneas con `error` o `building wheel` en el log | 0 |
| `pip list` filtrado | solo `numpy 1.21.5`; sin torch, torchvision, opencv, ultralytics ni gpiod |
| `numpy` | 1.21.5, del **sistema** (`/usr/lib/python3/dist-packages`) |
| `cv2` | 4.8.0 (`/usr/lib/python3.10/dist-packages/cv2`); `cvtColor` OK `(4, 4) uint8`; `aruco` True |
| `pyzbar`, imports del backend | OK |

**Corrección de una predicción de Claude:** se había dicho que el venv traería un
`numpy` 1.26.4. **Fue incorrecto**: pip dio por satisfecho `numpy<2` con el 1.21.5 del
sistema (el venv usa `--system-site-packages`). Por la misma razón se instalaron 26
paquetes y no los 43 de la simulación: el resto ya los traía el sistema. Esa
simulación se hizo con un entorno vacío y por eso sobreestimó.

**Hallazgo:** `ultralytics` (última versión en PyPI al 2026-10-21: 8.4.183) pide
`numpy>=1.23.0`, y el del sistema es 1.21.5, así que no alcanza. El torch de NVIDIA
`2.5.0a0 nv24.08` (rueda de 807 MB) y torchvision `0.20.0a0+afc54f7` no piden versión de
`numpy`; torch declara `filelock`, `typing-extensions>=4.8.0`, `networkx`, `jinja2`,
`fsspec` y `sympy==1.13.1`. Metadatos leídos con peticiones parciales, sin bajar las
ruedas. Corrección: `requirements-jetson.txt` ahora pide `numpy>=1.23,<2`, que instala un
1.26.x dentro del venv sin tocar el del sistema (commit local, **sin subir**).

**No verificado:** que `cv2` 4.8.0, compilado con el `numpy` viejo, importe con el 1.26.x
del venv; se comprueba justo después de subir `numpy`.

### Bloque 2b y 3 en el Jetson: `numpy` nuevo y PyTorch de NVIDIA (reportado por Mario)

Primero se subió `numpy` dentro del venv (`pip install "numpy>=1.23,<2"`) y después se
instalaron torch y torchvision con las ruedas de NVIDIA y de Ultralytics.

| Comprobación | Resultado reportado |
|---|---|
| Versiones | `torch 2.5.0a0+872d972e41.nv24.08`, `torchvision 0.20.0a0+afc54f7`, `numpy 1.26.4` |
| `torch.cuda.is_available()` | `True`; dispositivo Orin; `torch.version.cuda` = 12.6 |
| Operación en GPU | matmul 512x512, resultado finito: OK |
| ¿pip cambió torch por el de PyPI? | No: conserva el sufijo `nv` |
| Avisos "Can't uninstall" de `numpy`, `mpmath`, `sympy` | son paquetes del **sistema** (pip no los toca desde el venv); según Mario no afectan |
| `pip check` | solo marca `pynacl` sin `cffi` (paquete del sistema, irrelevante) |

**Hallazgo (Mario):** la rueda `jp/v61` funcionó en **L4T 36.4.7 con CUDA 12.6** en este
equipo. Mario la describe como una rueda para CUDA 12.4; **no verifiqué con qué versión de
CUDA se compiló** y la salida reportada de `torch.version.cuda` dice 12.6, así que esa
mención del 12.4 no se confirmó.

**Límite de la prueba:** solo se probó **una operación simple de GPU**. **NO** se probó con
YOLO, ni con memoria bajo carga, ni durante periodos largos. El hilo del foro de NVIDIA
sobre L4T 36.4.7 y los errores de memoria de CUDA (ver sesión 2) sigue sin comprobarse en
condiciones de carga.

Contexto de la prueba de la cámara: las medidas de FPS y exposición siguen pendientes de
repetir con buena luz y la cámara en su posición final (ver nota anterior).

### Siguiente

1. `ultralytics` con `--no-deps` y `YOLO_AUTOINSTALL=False`. Verificado en el código de
   `ultralytics` (8.4.137): `AUTOINSTALL = env_bool("YOLO_AUTOINSTALL", True)` y la
   instalación automática solo corre `if install and AUTOINSTALL`. Sin esa variable
   intentaría instalar `opencv-python` al no verlo con metadatos de pip (el `cv2` del
   sistema no los trae).
2. Probar YOLO con una imagen de archivo, en el Jetson, sin cámara.
3. Arrancar el backend en el Jetson (puerto 8001).

---

## Sesión 5 — 2026-10-21 — Backend en el Jetson y qué puede mover físicamente la celda

**Quién ejecutó qué:** Mario corrió el backend y las pruebas en el Jetson y reportó el
resultado. Claude leyó el código de `backend/cell_line.py`, `backend/cell_hmi.py` y
`backend/main.py` y repitió la lógica en la laptop con las **clases reales**, sin `gpiod`.

### Backend en el Jetson (reportado por Mario)

`uvicorn` corre en el puerto 8001 por cable (`192.168.100.19`) y se ve desde el navegador
de la laptop.

| Comprobación | Resultado reportado |
|---|---|
| `/health` | ok |
| `/line/cell/status` | `source: "celda"`, `running: true`, `state: "DETENIDA"`, `reason: "Cámara apagada"`, `sources: {vision_linea: false, plc: false}` |
| `/inventory` | `[]` |
| Dashboard, visión de línea | transmite, pero con resolución **2304x1536**: no estaban definidas las variables de V4L2. Coincide con el cuadro de 1536x2304 de la prueba de OpenCV por defecto |
| Panel de la celda | alarma "Enlace PLC perdido" (esperada: no hay PLC), "Salidas: Sin pines", sesión `admin`/`admin` abierta |
| No se usó | `/line/cell/run` ni la percepción |

Siguiente de Mario: reiniciar con `LINE_VISION_CAMERA_BACKEND=v4l2`, `FOURCC=MJPG`,
`WIDTH=640`, `HEIGHT=480` (y lo mismo con `PERCEPTION_`) y pasar el log. **Pendiente.**

### Qué significan los estados (leído en `cell_line.py`)

- **`running`** es un interruptor interno de "ciclos permitidos". Arranca en `True` al iniciar
  el servidor (`self._running = True`). No dice que algo se esté moviendo.
- **`state`** se calcula aparte: si `running` es falso → `DETENIDA` ("Paro solicitado por el
  operador"); si no, y la cámara de línea no ha juzgado ningún cuadro en los últimos 2 s
  (`VISION_VIVA_S`) → `DETENIDA` ("Cámara apagada"); si no → `OPERANDO`.
- **`source: "celda"`** solo indica que los datos salen de `cell_line.py` y no del
  simulador. **No prueba que haya hardware conectado.**
- **`sources.plc`** en realidad es `salidas.abiertas`: si el chip GPIO se abrió. Con `gpiod`
  ausente es siempre `false`.

### ¿Pueden ARRANQUE o PARO mover algo físico? (lectura del código)

- **Ninguno de los dos mueve nada por sí mismo.** `POST /line/cell/run` solo llama
  `celda.set_running(on)`. ARRANQUE cambia el interruptor; PARO lo apaga, cancela el ciclo en
  curso y pide `salidas.apagar()`.
- **El único camino a un pin** es `celda.ver(juicio)` → `_correr()` → `salidas.poner(...)`,
  disparado por la **cámara** de visión de línea (5 cuadros estables de PASS o FAIL) y no por
  un botón.
- **Todo pin pasa por `Salidas.poner()`**, que sin `gpiod` devuelve `False` sin tocar nada
  (`Salidas._abrir()` sale en el `ImportError` y `abiertas` queda en `False`).
- **Verificado en la laptop** (Windows, sin `gpiod`, clases reales): `running` arranca en
  `True`; el `snapshot` sin cámara da `True / DETENIDA / "Cámara apagada" / plc false`,
  idéntico a lo reportado en el Jetson; `poner()` sobre los dos pines devuelve `False`; tras PARO
  `running=False`, tras ARRANQUE `running=True` (y sigue `DETENIDA` por la cámara); un ciclo FAIL
  termina como `fallo_actuacion` y uno PASS como `pulso_no_enviado`.
- **En el Jetson solo se comprobó** que `import gpiod` falla dentro del venv.

**Botones del panel de la celda, con el código actual y `gpiod` ausente:** todos son seguros
en el sentido físico (ninguno puede mover un relé ni energizar un pin). ARRANQUE y PARO solo
cambian el interruptor; "Reconocer alarmas" y cerrar sesión no tocan nada; "Borrar histórico"
(solo `admin`) no mueve nada pero **borra** el registro de alarmas. Esta seguridad depende de
que `gpiod` siga ausente; antes de cada arranque del backend se comprueba
`python -c "import gpiod"` (debe fallar).

**No verificado:** que ningún otro proceso del Jetson toque los pines; el comportamiento con
`gpiod` instalado.

### Hallazgos a atender antes de conectar cableado real

1. **Credenciales `admin`/`admin` escritas en el código** (`cell_hmi.py`: `_USERS`, con un
   comentario que la llama "cuenta fija de laboratorio"). El repo es público y el backend
   escucha en `0.0.0.0`: cualquiera en la red puede iniciar sesión y usar ARRANQUE, PARO y
   "Borrar histórico". `GET /line/cell/status` no pide sesión. Sin variable de entorno para
   cambiarla.
2. **Sin interruptor para impedir abrir GPIO.** La única protección es que `gpiod` no esté
   instalado. `cell_line.py` abre las líneas 8 y 9 de `/dev/gpiochip0` **al importarse**, y
   esos números son **BCM de Raspberry Pi**: en el Jetson serían otras líneas del SoC. No
   instalar `gpiod` en el Jetson.
3. **Los contadores cuentan decisiones aunque no se actúe.** Sin `gpiod`, un FAIL sube
   `inspected` y `fail` con acción `fallo_actuacion`, y un PASS sube `inspected` con
   `pulso_no_enviado`. Hoy no pasa porque sin `parts.pt` la cámara siempre juzga
   `SIN_PIEZA` (`parts.pt` no está en el repo), pero si se copia, el panel contaría piezas sin
   que nada físico ocurra.
4. **Las dos cámaras usan `/dev/video0`** (mismo índice por defecto). Percepción y visión de
   línea no deben abrirse a la vez.

Nada de esto se cambió. Los arreglos (credenciales por variable de entorno, un interruptor
para no abrir GPIO) quedan como propuesta, a decidir por Mario.

### Estado final

| | Estado |
|---|---|
| El backend corre en el Jetson, `/health`, `/line/cell/status`, `/inventory` | **Reportado por Mario** |
| La resolución sube a 2304x1536 sin variables de V4L2 | **Reportado por Mario** |
| Qué significa `running: true` con `DETENIDA` y `source: "celda"` | **Leído en el código y reproducido en la laptop** |
| Ningún botón mueve algo físico con `gpiod` ausente | **Leído en el código y reproducido en la laptop**; en el Jetson solo se verificó `import gpiod` |
| Cámara forzada a V4L2, MJPG 640x480 | **Pendiente** (esperando el log) |
| SSH sin contraseña y arranque remoto con tmux | **Pendiente** |

### Jetson alcanza el backend de la laptop, y borrador de ADR 0011 (2026-10-21)

- **Reportado por Mario:** desde el Jetson, `curl http://192.168.100.14:8000/health` devolvió
  `{"status":"ok"}` (laptop por WiFi, Jetson por cable, misma red `192.168.100.x`). Antes dio
  timeout porque el backend no estaba corriendo en la laptop.
- **Borrador de ADR 0011** (`docs/architecture/decisions/0011-reparto-de-roles-y-agentes.md`):
  reparto de roles (laptop: backend, base de datos, LLM y lógica de Lumina; Jetson: cámara,
  YOLO e interfaces; Pi 4: interfaz de la celda, su cámara y su visión), contrato de agentes
  reutilizando lo que ya existe en `main.py`, y lista de deuda documental. **Estado: borrador,
  NO decidido. No se escribió código.**
- **Hallazgo que condiciona el reparto (leído en el código):** todas las páginas usan rutas
  relativas al mismo servidor, y `PublicGuard` solo permite CORS desde `localhost:8000` y los
  dominios públicos. `robot.html` usa `SpeechRecognition` del navegador, que puede no funcionar
  desde `http://192.168.x.x` (origen no seguro): **por verificar** abriendo
  `http://192.168.100.14:8000/robot.html` en el navegador del Jetson.
