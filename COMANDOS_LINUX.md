# Aether — comandos para Linux (Jetson Orin Nano y Raspberry Pi 4)

Equivalente de `URLS_Y_COMANDOS.md` para los equipos Linux. Aquel archivo
sigue siendo la referencia para la laptop Windows.

Cada bloque dice si está **verificado** (alguien lo corrió y vio la salida) o
**sin verificar**. Las versiones exactas que funcionaron quedan en
`docs/jetson/SETUP_JETSON.md`, no aquí.

> **Todo se controla desde la laptop.** Ni el Jetson ni la Raspberry se
> operan por su cuenta. Los agentes (puertos 8001 y 8002) no llevan
> autenticación: solo para la red local de trabajo, nunca expuestos a internet.

## Datos del Jetson

| Dato | Valor | Estado |
|---|---|---|
| Usuario / host | `mario@mario-desktop` | reportado por Mario |
| IP (cable Ethernet) | `192.168.100.19` | reportado por Mario |
| Repo | `~/aether`, rama `jetson-setup` | reportado por Mario |
| Python | 3.10.12 (sistema) | verificado por Mario |
| OpenCV | 4.8.0 del sistema, con `cv2.aruco.ArucoDetector` | verificado por Mario |
| Cámara | USB (UVC), `/dev/video0` | parcial, ver sección Cámara |

**Mantén WiFi apagado en el Jetson mientras uses el cable.** Con WiFi y cable
activos a la vez en la misma red hubo desconexiones de SSH (ver la bitácora).

## 1. Conexión y código

```bash
# Desde la laptop (PowerShell). Si .local no resuelve, usa la IP.
ssh mario@192.168.100.19
```

```bash
# En el Jetson: traer cambios de la rama
cd ~/aether
git pull
git log --oneline -1
```

Sin verificar: llave SSH sin contraseña y entrada `Host jetson` en
`~/.ssh/config` (Fase 0, pasos 7 a 11, todavía pendientes).

## 2. Revisar el sistema (solo lectura)

```bash
cat /etc/nv_tegra_release          # L4T R36, REVISION 4.7 en este equipo
python3 --version                  # 3.10.12
python3 -c "import cv2; print(cv2.__version__, hasattr(cv2.aruco,'ArucoDetector'))"   # 4.8.0 True
free -h; df -h /
sudo nvpmodel -q                   # modo de energía actual (pide sudo)
```

## 3. Cámara (solo lectura)

```bash
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext
udevadm info -q property -n /dev/video0 | grep -E "ID_V4L_CAPABILITIES|ID_VENDOR_ID|ID_MODEL_ID|ID_MODEL="
udevadm info -q property -n /dev/video1 | grep -E "ID_V4L_CAPABILITIES"
```

Una cámara que captura imagen muestra `:capture:` en `ID_V4L_CAPABILITIES`.

## 4. Entorno de Python (sin verificar)

```bash
cd ~/aether/backend
python3 -m venv --system-site-packages .venv      # si falla: falta python3-venv (apt)
source .venv/bin/activate
pip install -r requirements-jetson.txt
# torch y torchvision de NVIDIA: pasos en docs/jetson/SETUP_JETSON.md (pendiente)
pip install --no-deps ultralytics
pip list 2>/dev/null | grep -iE "^(torch|torchvision|numpy|opencv|ultralytics)"
```

Debe verse `numpy` 1.x y **ningún** `opencv-python`. `torch` debe conservar el
sufijo de NVIDIA (por ejemplo `...nv24.08`). Si pip lo cambia por una versión
sin sufijo, es el torch de CPU: parar y avisar.

## 5. Arrancar y detener el backend (sin verificar)

Antes del primer arranque: `python3 -c "import gpiod"` **debe fallar** con
`ModuleNotFoundError`. `backend/cell_line.py` hace `import gpiod` al cargarse
y, si existe, configura como salidas los GPIO 8 y 9 de `/dev/gpiochip0`. No
instalar `gpiod` ni arrancar el backend si ese import funciona.

```bash
# En el Jetson
tmux new -s aether                  # sesión que sobrevive si se cae el SSH
cd ~/aether/backend
source .venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8001
# Soltar la sesión sin detener nada:  Ctrl+B, luego D
```

```bash
tmux attach -t aether               # volver a la sesión
tmux ls                             # ver sesiones activas
# Detener: dentro de la sesión Ctrl+C, y luego:
tmux kill-session -t aether
```

## 6. Verificar que responde (sin verificar)

```bash
curl -s http://localhost:8001/health            # {"status":"ok"}
curl -s http://localhost:8001/line/cell/status  # "plc": false en "sources"
```

Desde el navegador de la laptop: `http://192.168.100.19:8001/perception/stream`.
La cámara solo se abre cuando alguien abre ese stream.

## Precauciones

- No instalar `opencv-python` ni `opencv-contrib-python` por pip en el Jetson.
- Mantener `numpy<2`.
- No instalar `gpiod` ni tocar GPIO hasta que el equipo confirme qué está
  cableado en la celda.
- Un hilo del foro de NVIDIA reporta, para L4T 36.4.7, el error "unable to
  allocate CUDA0 buffer" después de actualizar paquetes de Ubuntu. No está
  verificado en este equipo; por prudencia, no correr `sudo apt upgrade` sin
  avisar antes.
