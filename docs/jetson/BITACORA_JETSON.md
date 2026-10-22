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
