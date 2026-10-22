# Configuración del Jetson Orin Nano Super para Aether

Pasos reproducibles que **sí funcionaron** el 2026-10-21, con las versiones exactas que se usaron.
Es un documento vivo: se actualiza cuando algo cambia o se verifica.

**Cómo leerlo.** Todo lo de este documento sale de salidas reales que Mario pegó durante el día;
quien lo redactó (Claude) no ejecutó nada en el Jetson. Cada bloque dice su estado:

- **[reportado]**: lo corrió Mario y reportó el resultado.
- **[no verificado]**: no se comprobó, o falta el resultado.
- **[sin registrar]**: se hizo, pero no se pegó el comando exacto, así que no se inventa aquí.

Lo que no funcionó, y el porqué, está en `docs/jetson/BITACORA_JETSON.md`.

> **Alcance.** Este documento deja un Jetson listo para correr **YOLO con GPU** y probar su cámara.
> **No** deja el agente de percepción funcionando: esa pieza no está escrita (depende del ADR 0011,
> hoy en borrador). Tampoco cubre la conexión de VS Code por Remote-SSH, que sigue pendiente.

## 1. Equipo y versiones

| Componente | Versión | Estado |
|---|---|---|
| Equipo | Jetson Orin Nano Super 8 GB; hostname `mario-desktop`, usuario `mario` | [reportado] |
| Jetson Linux | L4T R36 revisión 4.7 (GCID 42132812, 2025-09-18) | [reportado] |
| Sistema | Ubuntu 22.04, kernel `5.15.148-tegra`, aarch64 | [reportado] |
| Python | 3.10.12 | [reportado] |
| CUDA / cuDNN / TensorRT | 12.6 / 9.3 / 10.3 | [reportado] |
| Metapaquete `nvidia-jetpack` | **no instalado** (candidato 6.2.1+b38); los componentes están sueltos | [reportado] |
| RAM / swap / disco | 7.4 GiB / 3.7 GiB / 47 GB (`/dev/mmcblk0p1`), unos 23 GB libres | [reportado] |
| Modo de energía | 25W (ID 1). MAXN_SUPER es el ID 2 y **no** se ha usado | [reportado] |
| `libcusparseLt` | 0.6.2.3 (`linux-aarch64`) | [reportado] |
| PyTorch | `2.5.0a0+872d972e41.nv24.08` (rueda NVIDIA `jp/v61`) | [reportado] |
| torchvision | `0.20.0a0+afc54f7` | [reportado] |
| numpy (venv / sistema) | 1.26.4 / 1.21.5 | [reportado] |
| OpenCV (sistema) | 4.8.0, con GStreamer 1.20.3 | [reportado] |
| ultralytics / ultralytics-thop | 8.4.183 / 2.2.3 | [reportado] |
| Backend: fastapi, uvicorn, sqlalchemy, pydantic | 0.159.1, 0.54.0, 2.0.55, 2.14.1 | [reportado] |
| Otros: polars, pyzbar, psutil, uvloop | 2.0.0, 0.1.9, 7.2.2, 0.23.0 | [reportado] |
| Firefox (PPA de Mozilla, `.deb`) | 158.0.1~mt1 | [reportado] |
| Chromium (snap) | 155.0.8059.84 instalado, **no abre** | [reportado] |
| `snapd` | paquete `.deb` 2.67.1 y snap 2.77.1 | [reportado] |

Una nota sobre la rueda de PyTorch: Mario la describe como compilada para CUDA 12.4, pero
`torch.version.cuda` reporta 12.6 en este equipo. No se verificó con qué CUDA se compiló.

## 2. Red y acceso [reportado]

- El Jetson va **solo por cable** Ethernet (`192.168.100.19`). El WiFi se apagó con
  `nmcli radio wifi off`: con WiFi y cable activos a la vez en la misma red (`.18` y `.19`) el SSH se
  cortaba con `Connection reset`. La causa de los cortes **no está diagnosticada** y la estabilidad
  con solo el cable **no está verificada** en uso prolongado.
- `sleep`, `suspend` y `hibernate` quedaron enmascarados (`masked`). **[sin registrar]** el comando exacto.
- Los procesos largos se corren dentro de `tmux` (sesión `trabajo`).
- La laptop (`192.168.100.14`, por WiFi) y el Jetson se ven: desde el Jetson,
  `curl http://192.168.100.14:8000/health` devolvió `{"status":"ok"}`.
- **SSH sin contraseña: pendiente** (se entra con contraseña). Ver el apartado 10.
- TigerVNC muestra el escritorio, pero no copia ni pega bien y no detecta las mayúsculas; por eso
  los comandos se corren por SSH. Aplicaciones gráficas por SSH fallan con `DISPLAY` vacío.

## 3. Paquetes del sistema [reportado]

Se instalaron **solo** estos, con simulación previa. **No** se corrió `apt upgrade`:

```bash
sudo apt-get install -s python3-pip python3-venv     # simulación: salió limpia, solo paquetes de Python
sudo apt-get install -y python3-pip python3-venv
```

Efecto: 8 paquetes de `python3.10` pasaron a `3.10.12-1~22.04.18`; la versión sigue siendo 3.10.12.

Un hilo del foro de NVIDIA reporta, en L4T 36.4.7, un error de memoria CUDA después de actualizar
paquetes de Ubuntu. **No está comprobado en este equipo**; por eso no se hace `apt upgrade`.

## 4. `libcusparseLt` 0.6.2.3 [reportado]

PyTorch de NVIDIA posterior a 24.06 necesita `libcusparseLt.so.0`. El script que cita la
documentación de NVIDIA **no cubre CUDA 12.6**, así que se usa el archivo oficial para Jetson
(`linux-aarch64`), versión elegida con las notas de versión de NVIDIA (v0.6.2 trae soporte para Orin;
v0.7.0 exige CUDA 12.8 o superior).

```bash
mkdir -p ~/cusparselt && cd ~/cusparselt
wget https://developer.download.nvidia.com/compute/cusparselt/redist/libcusparse_lt/linux-aarch64/libcusparse_lt-linux-aarch64-0.6.2.3-archive.tar.xz
ls -l *.tar.xz && sha256sum *.tar.xz
tar -xf libcusparse_lt-linux-aarch64-0.6.2.3-archive.tar.xz
file libcusparse_lt-linux-aarch64-0.6.2.3-archive/lib/libcusparseLt.so.0.6.2.3
sudo cp -a libcusparse_lt-linux-aarch64-0.6.2.3-archive/include/cusparseLt.h /usr/local/cuda/include/
sudo cp -a libcusparse_lt-linux-aarch64-0.6.2.3-archive/lib/libcusparseLt.so* /usr/local/cuda/lib64/
sudo ldconfig
python3 -c "import ctypes; ctypes.CDLL('libcusparseLt.so.0'); print('carga OK')"
```

Resultados reportados: 12 869 440 bytes; sha256
`b081a82a884754fd7ab1f53aa9cd1a943d782b87268c3657991c287af3179811`; `file` dice
`ELF 64-bit LSB shared object, ARM aarch64`; `ldconfig -p` la lista; `carga OK`; la cabecera está en
`/usr/local/cuda/include/cusparseLt.h` (16 823 bytes).

**Pendiente: la propiedad de los archivos [no verificado].** `tar` extrajo como usuario `mario` y
`cp -a` **conserva el dueño**, así que los archivos pueden haber quedado como `mario:mario` dentro de
una carpeta del sistema. Una librería que carga cualquier proceso y que un usuario común puede
reescribir es un riesgo. Es un descuido de las instrucciones originales, que no lo advertían. Se
comprueba y se corrige así:

```bash
ls -l /usr/local/cuda/lib64/libcusparseLt.so* /usr/local/cuda/include/cusparseLt.h
# Si el dueño no es root (con sudo): cambia el dueño de esos 4 archivos a root. No borra nada.
sudo chown -h root:root /usr/local/cuda/lib64/libcusparseLt.so* /usr/local/cuda/include/cusparseLt.h
```

Para deshacer la instalación completa:
`sudo rm /usr/local/cuda/lib64/libcusparseLt.so* /usr/local/cuda/include/cusparseLt.h && sudo ldconfig`.

**Límite:** solo se probó que la librería **se carga**, no que PyTorch funcione con ella más allá de
la prueba del apartado 6.

## 5. Repositorio [reportado]

```bash
git clone --branch jetson-setup --single-branch https://github.com/MarioMendez-123/INTEGRADORA.git ~/aether
```

El repositorio es **público a propósito**. El Jetson quedó en `76e975c`; la rama remota va más
adelante (ver el apartado 10). Para actualizar: `cd ~/aether && git pull`.

## 6. Entorno de Python

### 6.1 Venv y requisitos [reportado]

```bash
cd ~/aether/backend
python3 -m venv --system-site-packages .venv     # ve el cv2 4.8.0 del sistema
source .venv/bin/activate
python -c "import gpiod"                         # DEBE fallar: ModuleNotFoundError
pip install -r requirements-jetson.txt           # 26 paquetes instalados, 0 errores
pip install "numpy>=1.23,<2"                     # ultralytics pide >=1.23; el del sistema es 1.21.5
```

`pip check` solo marcó `pynacl` sin `cffi` (paquete del sistema, irrelevante). `requirements-jetson.txt`
**no** incluye `torch`, `opencv` ni `ultralytics-thop` a propósito: este último declara `torch` y pip
lo bajaría de PyPI (versión sin GPU de NVIDIA).

### 6.2 PyTorch y torchvision de NVIDIA [reportado]

```bash
pip install --no-cache-dir "https://developer.download.nvidia.com/compute/redist/jp/v61/pytorch/torch-2.5.0a0+872d972e41.nv24.08.17622132-cp310-cp310-linux_aarch64.whl"
pip install --no-deps --no-cache-dir "https://github.com/ultralytics/assets/releases/download/v0.0.0/torchvision-0.20.0a0+afc54f7-cp310-cp310-linux_aarch64.whl"
```

La rueda de torch pesa 807 MB. Resultado: `torch 2.5.0a0+872d972e41.nv24.08`,
`torchvision 0.20.0a0+afc54f7`, `numpy 1.26.4`; `torch.cuda.is_available()` es `True`, dispositivo
`Orin`, `torch.version.cuda` 12.6, y una multiplicación 512x512 en GPU da un resultado finito. Los
avisos "Can't uninstall" de `numpy`, `mpmath` y `sympy` son de paquetes del sistema y no afectan.

**Si pip intenta cambiar `torch`** (verás `Uninstalling torch` o `Collecting torch==…`): pulsa
`Ctrl+C` antes de `Successfully installed`, revisa `pip list | grep -i torch` y, si ya lo cambió,
reinstala el de NVIDIA con `pip install --force-reinstall --no-deps --no-cache-dir <la URL de arriba>`.
Por eso `torchvision` va con `--no-deps`.

### 6.3 ultralytics [reportado]

```bash
export YOLO_AUTOINSTALL=False
pip install --no-deps ultralytics ultralytics-thop
```

`YOLO_AUTOINSTALL=False` es necesario: sin él, `ultralytics` intentaría instalar `opencv-python` al no
ver el `cv2` del sistema (que no trae metadatos de pip). Verificado en el código de `ultralytics`:
la instalación automática solo corre `if install and AUTOINSTALL`.

### 6.4 Prueba de YOLO con una imagen de archivo [reportado]

Con `device=0`, YOLOv8n sobre `bus.jpg` detectó `bus`, 4 `person` y `stop sign`. Una inferencia tardó
**46 ms en modo 25W**. **Es una sola medición con una imagen estática**: no son FPS y **no sirve
para los umbrales** de `criterios_aceptacion.md`.

## 7. Cámara (USB, UVC) [reportado]

| Dato | Valor |
|---|---|
| Nombre | "1080P Pro Stream" (`usb-3610000.usb-2.3`) |
| `/dev/video0` | captura |
| `/dev/video1` | metadatos |
| Vendor : modelo | `046d:0894` (en `lsusb` sale como Logitech CrystalCam: es la **misma** cámara) |
| Formatos | YUYV y MJPG; MJPG de 160x90 a 1920x1080, hasta 30 fps |

**Hallazgo clave:** `cv2.VideoCapture(0)` **sin backend** abre por **GStreamer** y entrega un frame
`(1536, 2304, 3)`, que no es un modo real de la cámara. Con `cv2.CAP_V4L2` entrega `(480, 640, 3)`.

Por eso el repositorio trae, desde el commit `c9f24cb`, variables de entorno opcionales para forzar
V4L2: `PERCEPTION_CAMERA_BACKEND`, `_FOURCC`, `_WIDTH`, `_HEIGHT` y las equivalentes
`LINE_VISION_CAMERA_*`. Sin definirlas, la cámara se abre como siempre.

**[no verificado]** El efecto de esas variables con la cámara real: se reinició el backend con
`BACKEND=v4l2`, `FOURCC=MJPG`, `WIDTH=640`, `HEIGHT=480`, pero no se pegó si el video pasó a 640x480
ni la línea de registro con el backend real.

### Pruebas de FPS: NO representativas

Se hicieron con **poca luz, en un cuarto oscuro y con la cámara sin acomodar**:

| Prueba | Resultado |
|---|---|
| Captura con Python, 3 s | 10 fps |
| `v4l2-ctl --stream-mmap`, `exposure_dynamic_framerate=1` (`exposure_time_absolute=666`) | 15.3 fps |
| Igual, con `exposure_dynamic_framerate=0` | el promedio acumulado subió de 17 a 25.3 y seguía subiendo (no se estabilizó) |

`exposure_dynamic_framerate` se apagó **solo como prueba**, no se guardó en ningún archivo y se
devolvió a `1` antes de apagar el Jetson. **No se fija nada de exposición desde el código.** FPS,
exposición y calidad de imagen quedan **pendientes de repetir con buena luz, la cámara en su lugar y
anotando el modo de energía** de cada medición.

## 8. Backend de prueba en el Jetson [reportado]

Se corrió el backend completo (`uvicorn`, puerto 8001) **solo como prueba**, y ya está detenido. No es
la arquitectura prevista (ver el ADR 0011): el backend irá en la laptop.

- `/health` ok; `/line/cell/status` con `source: "celda"`, `running: true`, `state: "DETENIDA"`,
  `reason: "Cámara apagada"`, `sources: {vision_linea: false, plc: false}`; `/inventory` vacío.
- Sin las variables de V4L2 el video salió a 2304x1536.
- Spotify avisó que el puerto 8888 estaba ocupado (había otro `uvicorn` vivo). El backend completo
  arranca partes de Lumina que no tienen sentido en el Jetson.
- No se usó `/line/cell/run`, ni ARRANQUE o PARO, ni la percepción.
- **Seguridad física:** `python -c "import gpiod"` falla, así que ningún botón puede mover un pin.
  Están las **herramientas de sistema** `gpiod` 1.6.3 y `libgpiod2`, y el usuario está en el grupo
  `gpio`. **No se instala `gpiod` de Python** hasta que el equipo confirme qué está cableado.

## 9. Navegador [reportado]

- Los snap **no corren**: `snap-confine` falla con `packaged without necessary permissions; required
  permitted capability cap_dac_override not found`. La causa raíz **no está diagnosticada**; las fuentes
  externas la atribuyen a `snapd` 2.70 o superior en un kernel sin `CONFIG_SQUASHFS_XATTR` ni AppArmor,
  y aquí hay dos `snapd` (el `.deb` 2.67.1 y el snap 2.77.1). No se reinstaló `snapd` ni se tocaron permisos.
- El PPA de Mozilla ya estaba en `apt` y ofrece Firefox `158.0.1~mt1` (`.deb`, prioridad 1001). Se instaló
  con `--allow-downgrades` porque el paquete de relleno `1:1snap1` tiene una versión mayor. **[sin
  registrar]** el comando exacto.
- Firefox abre el dashboard del backend de la laptop, pero **va lento por VNC**: `firefox` usa ~87 % de un
  núcleo y `gnome-shell` 25 %, con el 70 % de la CPU libre; la página responde 200 en 0.08 s. Se interpreta
  como renderizado por software a través de VNC; **no está medido con un monitor HDMI**.
- **Voz de Lumina:** Firefox no trae `SpeechRecognition` activado y `robot.html` no tiene campo de texto, así
  que sin voz no hay cómo hablarle. Tampoco se sabe si el Jetson tendrá micrófono.

## 10. Pendiente y no verificado

- Propiedad `root:root` de los archivos de `libcusparseLt` (apartado 4).
- Efecto de las variables de V4L2 con la cámara real (apartado 7).
- FPS, exposición y calidad con buena luz y la cámara en su lugar; también en MAXN_SUPER, con el modo
  anotado en cada medición.
- SSH sin contraseña de la laptop al Jetson (con `~/.ssh/config`) y Remote-SSH de VS Code.
- `git pull` en el Jetson: la rama remota (`origin/jetson-setup`) está en `fb33786` y el Jetson en `76e975c`.
- Causa de los cortes de SSH y de que `snap-confine` falle.
- Rendimiento del navegador con monitor HDMI y alternativas de voz.
- El agente de percepción: no existe todavía (ADR 0011).
