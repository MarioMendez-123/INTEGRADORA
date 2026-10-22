# Aether — comandos para Linux (Jetson Orin Nano y Raspberry Pi 4)

Equivalente de `URLS_Y_COMANDOS.md` para los equipos Linux. Aquel archivo sigue siendo la referencia
para la laptop Windows. Los pasos de instalación con las versiones exactas están en
`docs/jetson/SETUP_JETSON.md`; aquí van los comandos del día a día.

Cada bloque dice si está **verificado** (Mario lo corrió y reportó el resultado) o **sin verificar**.

> **Todo se controla desde la laptop.** Ni el Jetson ni la Raspberry se operan por su cuenta. Los
> agentes no llevan autenticación: solo para la red local de trabajo, **nunca expuestos a internet**.
> La cuenta `admin`/`admin` de la celda es de laboratorio: no dejarla expuesta en la red de la universidad.

## Datos del Jetson

| Dato | Valor | Estado |
|---|---|---|
| Usuario / host | `mario@mario-desktop` | reportado |
| IP (cable Ethernet, WiFi apagado) | `192.168.100.19` | reportado |
| Laptop | `192.168.100.14` (WiFi) | reportado |
| Repo | `~/aether`, rama `jetson-setup` | reportado |
| Sesión de `tmux` | `trabajo` | reportado |
| Python / OpenCV | 3.10.12 / 4.8.0 del sistema (`cv2.aruco.ArucoDetector` disponible) | reportado |
| Cámara | USB (UVC), `/dev/video0` es la de captura | reportado |
| Modo de energía | 25W (ID 1); MAXN_SUPER es el ID 2 y no se ha usado | reportado |

**Mantén el WiFi apagado en el Jetson mientras uses el cable** (`nmcli radio wifi off`). Con WiFi y
cable activos a la vez hubo desconexiones de SSH; la causa no está diagnosticada.

## 1. Conexión y código

```bash
# Desde la laptop (PowerShell). Usa la IP, no *.local.
ssh mario@192.168.100.19
```

```bash
# En el Jetson: procesos largos dentro de tmux, para que un corte de SSH no los mate
tmux new -s trabajo            # crear;   Ctrl+B y luego D  = soltarla sin detener nada
tmux attach -t trabajo         # volver
tmux ls                        # ver sesiones
```

```bash
# Traer cambios de la rama
cd ~/aether && git pull && git log --oneline -1
```

**Sin verificar:** SSH sin contraseña y la entrada `Host jetson` en `~/.ssh/config`.
Aplicaciones gráficas **no** se lanzan por SSH (`DISPLAY` vacío): se usa la sesión del escritorio.

## 2. Revisar el sistema (solo lectura; verificado)

```bash
cat /etc/nv_tegra_release          # L4T R36, REVISION 4.7
python3 --version                  # 3.10.12
python3 -c "import cv2; print(cv2.__version__, hasattr(cv2.aruco,'ArucoDetector'))"   # 4.8.0 True
free -h; df -h /
sudo nvpmodel -q                   # modo de energía actual (pide sudo)
```

## 3. Cámara

```bash
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext
udevadm info -q property -n /dev/video0 | grep -E "ID_V4L_CAPABILITIES|ID_VENDOR_ID|ID_MODEL_ID|ID_MODEL="
```

`/dev/video0` es la de captura; `/dev/video1` son metadatos. **OpenCV sin backend abre por GStreamer y
entrega un frame que no es un modo real (1536x2304); con `cv2.CAP_V4L2` entrega 480x640.**

```bash
# Verificado (Mario): forzar V4L2 en una prueba de OpenCV
python3 - <<'EOF'
import cv2
for etiqueta, args in (("por defecto", (0,)), ("V4L2 explícito", (0, cv2.CAP_V4L2))):
    c = cv2.VideoCapture(*args); ok, f = c.read()
    print(etiqueta, "backend:", c.getBackendName(), "frame:", f.shape if ok else None); c.release()
EOF
```

**Control de exposición:** `v4l2-ctl -d /dev/video0 -c exposure_dynamic_framerate=0` se usó **solo como
prueba**, no persiste y se devolvió a `1` antes de apagar. Para restaurarlo:
`v4l2-ctl -d /dev/video0 -c exposure_dynamic_framerate=1`. **No se fija nada de exposición desde el
código.** Las mediciones de FPS hechas con poca luz y la cámara sin acomodar **no son representativas**.

## 4. Entorno de Python

Instalación completa en `docs/jetson/SETUP_JETSON.md`. Para entrar al entorno:

```bash
cd ~/aether/backend && source .venv/bin/activate && export YOLO_AUTOINSTALL=False
pip list 2>/dev/null | grep -iE "^(torch|torchvision|numpy|opencv|ultralytics|gpiod)"
python -c "import torch; print(torch.__version__, torch.cuda.is_available())"
```

Debe verse `torch` con el sufijo `nv`, `numpy` 1.26.x, `ultralytics`, y **ningún** `opencv`. Si pip cambia
`torch` por una versión sin sufijo, es la de CPU: parar y avisar.

## 5. Prueba de YOLO con una imagen de archivo (verificado)

```bash
mkdir -p ~/yolo-prueba && cd ~/yolo-prueba
source ~/aether/backend/.venv/bin/activate && export YOLO_AUTOINSTALL=False
wget -q -O bus.jpg https://ultralytics.com/images/bus.jpg
wget -q -O yolov8n.pt https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
python - <<'EOF'
from ultralytics import YOLO
m = YOLO("yolov8n.pt"); r = m.predict("bus.jpg", device=0, imgsz=640, verbose=False)
print(sorted((m.names[int(c)], round(float(p), 2)) for c, p in zip(r[0].boxes.cls, r[0].boxes.conf)))
EOF
```

Resultado reportado: `bus`, 4 `person` y `stop sign`. Una inferencia, 46 ms en modo 25W: **no son FPS ni
sirven para umbrales**.

## 6. Backend completo en el Jetson (solo como prueba; ya no es la arquitectura)

El backend irá en la laptop (ADR 0011, en borrador). Si se vuelve a probar en el Jetson:

```bash
# Antes: python -c "import gpiod" DEBE fallar con ModuleNotFoundError. Si imprime algo, no arrancar.
tmux new -s trabajo
cd ~/aether/backend && source .venv/bin/activate
export YOLO_AUTOINSTALL=False
LINE_VISION_CAMERA_BACKEND=v4l2 LINE_VISION_CAMERA_FOURCC=MJPG LINE_VISION_CAMERA_WIDTH=640 LINE_VISION_CAMERA_HEIGHT=480 \
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

```bash
curl -s http://localhost:8001/health            # {"status":"ok"}
curl -s http://localhost:8001/line/cell/status  # "plc": false en "sources"
```

No abrir Percepción y Visión de línea a la vez: usan la misma `/dev/video0`. Detener: `Ctrl+C` dentro de la
sesión, y `tmux kill-session -t trabajo` si ya no se necesita.

## Precauciones

- **No instalar `gpiod` de Python** ni activar nada de GPIO hasta que el equipo confirme qué está
  cableado en la celda. Las herramientas de sistema `gpiod` 1.6.3 y `libgpiod2` sí están instaladas, y el
  usuario está en el grupo `gpio`. `backend/cell_line.py` usa números BCM de Raspberry Pi (8 y 9), que en el
  Jetson serían otras líneas del SoC.
- **No** correr `sudo apt upgrade`. Un hilo del foro de NVIDIA reporta, para L4T 36.4.7, un error de memoria
  CUDA después de actualizar paquetes de Ubuntu (no comprobado en este equipo). Antes de cualquier `sudo`,
  saber qué hará, y simular con `-s` cuando se pueda.
- **No** tocar `snapd` ni los permisos de `snap-confine`, y **no** usar `--no-sandbox` en los navegadores.
- **No** instalar `opencv-python` ni `opencv-contrib-python` por pip, y mantener `numpy<2`.
- Los snap no corren en este Jetson (`snap-confine`, ver `SETUP_JETSON.md`). El navegador que funciona es
  Firefox `.deb` del PPA de Mozilla.
- Salidas importantes: `| tee ~/archivo.txt` para no perderlas.
- Repo público: **nunca** subir `.env`, tokens, `aether.db`, pesos (`.pt`, `.engine`), fotos del dataset,
  contactos ni llaves. Revisar `git diff --stat` antes de cada push.
