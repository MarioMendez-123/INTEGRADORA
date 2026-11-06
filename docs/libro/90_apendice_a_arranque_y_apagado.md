# Apéndice A: Hoja de arranque y apagado

*El orden exacto para encender, comprobar y apagar el sistema, máquina por máquina. Cada comando dice dónde se ejecuta. Lo que viene de documentos del equipo y no se ha corrido en el hardware real queda marcado.*

> **Estado de esta hoja.** Los pasos de la laptop vienen de `docs/guia_arranque.md` e `iniciar_aether.ps1`. Los del Jetson, de `COMANDOS_LINUX.md` y los scripts `.sh`; los del agente se corrieron una vez en el Jetson (prueba reportada el 23 de octubre). Los de la **Pi 4** y del **carrito** **no se han corrido** en hardware real. El prefijo de cada comando indica la máquina: `[Laptop · PowerShell]`, `[Jetson · SSH]`, `[Pi 4 · SSH]`.

## Antes de empezar, una sola vez

1. **Clave de la celda** en `backend\.env` de la laptop: `CELDA_HMI_CLAVE=<clave>` (sin ella, Arranque y Paro no responden; la clave no se pega en el chat ni en el repositorio).
2. **Regla de firewall** en perfil **Privado** (`[Laptop · PowerShell, como administrador]`), ver capítulo 10.
3. **Direcciones de los agentes** en `backend\.env` (por ejemplo `AETHER_PERCEPTION_AGENT_URL=http://<ip-jetson>:8001`).
4. **Voz** (opcional): instalar `requirements-voice.txt`, descargar el modelo de Vosk y calibrar con `probar_voz.py` (capítulo 15).
5. **Energía de la laptop**: "Nunca" suspender mientras esté conectada.

## Arranque, en este orden

### 1. La laptop (el servidor central)

`[Laptop · PowerShell]`, desde la raíz del repositorio:

```powershell
.\iniciar_aether.ps1
```

Hace las comprobaciones, imprime las IP de la laptop y arranca el servidor en esa ventana; si la voz está lista, la abre en **su propia ventana**. Opciones: `-SoloComprobar` (no arranca nada), `-SinVoz`, `-Jetson` (arranca también el agente por SSH). Respaldo manual:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. El agente del Jetson

`[Jetson · SSH]`, la primera vez copiar la configuración y editar la IP de la laptop (`AETHER_LAPTOP_URL`):

```bash
cp ~/aether/scripts/jetson/aether-agent.env.example ~/.aether-agent.env && nano ~/.aether-agent.env
```

Cada vez:

```bash
bash ~/aether/scripts/jetson/iniciar-agente.sh
```

Salida esperada: `Agente en marcha (tmux 'agente'...)` y `{"status":"ok","error":null}`. Si dice que **`gpiod` está instalado, no se sigue**.

### 3. La celda en la Raspberry Pi 4 (sin probar en hardware real)

`[Pi 4 · SSH]`, dentro de `tmux`:

```bash
cd ~/aether/backend && ~/celda-venv/bin/python -m uvicorn celda_agent:app --host 0.0.0.0 --port 8000
```

La página: `http://<ip-pi>:8000/celda.html`. Mientras `python3-libgpiod` **no** esté instalado, las piezas se anotan y **nada se mueve** (capítulos 7 y 8).

### 4. El carrito (diseño; sin armar según el repositorio)

Orden de la hoja de armado: **conectar el XT60** y **encender el KCD1** (lógica y Jetson); el **relé** cierra solo si el **paro** está suelto. Antes de cualquier movimiento, **ruedas en el aire** y comprobar el paro (capítulo 4). **No hay firmware del ESP32 todavía**: este paso es de diseño.

## Comprobar que todo vive

| Qué | Comando | Esperado |
|---|---|---|
| Laptop | `[Jetson · SSH]` `curl -s -m 3 http://<ip-laptop>:8000/health` | `{"status":"ok"}` |
| Agente | `[Jetson · SSH]` `curl -s localhost:8001/health` | `{"status":"ok","error":null}` |
| Estado del agente | `[Jetson · SSH]` `curl -s localhost:8001/status` | `camera.fps_camera`, `laptop.reachable: true` |
| Medición de 15 s | `[Jetson · SSH]` `python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15` | FPS de cámara y entrega, ms de inferencia, CPU y RAM |
| Celda | `[Pi 4 · SSH]` `curl -s localhost:8000/health` | `{"status":"ok","error":null}` |
| Todo, desde la laptop | `[Laptop · PowerShell]` `.\iniciar_aether.ps1 -SoloComprobar` | "Todo en orden" (o la lista de lo que falta) |

Ver la página de Lumina dentro del Jetson (en una terminal de la sesión **VNC**): `bash ~/aether/scripts/ver-aether.sh robot.html`.

## Operación diaria de la voz

En la ventana del servicio de voz: **`p`** pausa y reanuda (pausar **suelta** el micrófono), **`w`** despierta a Lumina sin hablar y **`q`** sale. Para arrancar pausado: `AETHER_VOICE_START=off`.

## Guardar y apagar sin perder nada

En orden inverso al arranque:

1. **Carrito** (diseño): pulsar el paro, **apagar el KCD1** y **desconectar el XT60**.
2. **Pi 4**: detener `celda_agent` (`Ctrl+C` dentro de `tmux`) y apagar con `sudo shutdown now`, `[Pi 4 · SSH]`. Un apagado limpio evita corromper la tarjeta microSD (regla general).
3. **Jetson**: `[Jetson · SSH]` `bash ~/aether/scripts/jetson/detener-agente.sh` y después `sudo shutdown now`.
4. **Laptop**: en la ventana de voz, `q`; en la del servidor, `Ctrl+C`.
5. **Registro**: anotar en la bitácora lo que se hizo y se vio, con la salida pegada.
6. **Git**: `[Laptop · PowerShell]` `git status --short` y `git diff --stat` antes de cualquier `push`; **nunca** subir `.env`, tokens, `aether.db`, pesos de modelos ni fotos del dataset.

## Qué se pierde al reiniciar

Las sesiones de `tmux` y los procesos de los agentes; **no** los archivos, los entornos virtuales ni las librerías. Hay que volver a lanzar `iniciar-agente.sh` en el Jetson y el agente de la celda en la Pi. La base de datos (`backend/aether.db`) vive en la laptop y se conserva.

## Si algo no conecta

Seguir el orden del capítulo 10 (`iniciar_aether.ps1 -SoloComprobar` → `curl` a la laptop → `curl` al agente → `probar_agente.py`) y el catálogo del capítulo 25.
