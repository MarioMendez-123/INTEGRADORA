# Capítulo 9: El Jetson Orin Nano Super

*El cerebro del robot, explicado desde cero: qué es, cómo se le instaló PyTorch con GPU, qué problemas reales dio entre el 21 y el 23 de octubre y cómo se diagnosticó cada uno.*

## Una computadora con una tarjeta gráfica pegada

El **Jetson Orin Nano Super** (de la empresa NVIDIA) es una computadora del tamaño de una cartera que lleva, en el mismo chip, un procesador y una **GPU** (*Graphics Processing Unit*, unidad de procesamiento gráfico). Una GPU es un chip con **miles de núcleos pequeños** que hacen la misma operación a la vez; sirve para pintar videojuegos y, por la misma razón, para multiplicar las enormes tablas de números de las redes neuronales. Es la pieza que permite que **YOLO** (el modelo que detecta objetos, capítulo 14) corra con el robot en movimiento, sin depender de internet.

Datos del Jetson del equipo (todos **reportados por Mario**, responsable del software del robot, con salidas reales; fuente: `docs/jetson/SETUP_JETSON.md`):

| Dato | Valor |
|---|---|
| Equipo | Jetson Orin Nano Super 8 GB, nombre de máquina `mario-desktop`, usuario `mario` |
| Sistema | Ubuntu 22.04, kernel `5.15.148-tegra`, arquitectura `aarch64` (ARM de 64 bits) |
| Jetson Linux | L4T R36 revisión 4.7 (lo que el equipo llama "JetPack 6") |
| Python | 3.10.12 |
| CUDA / cuDNN / TensorRT | 12.6 / 9.3 / 10.3 |
| OpenCV del sistema | 4.8.0 (con GStreamer 1.20.3) |
| Memoria | 7.4 GiB de RAM, 3.7 GiB de swap, disco de 47 GB (≈ 23 GB libres) |
| Modo de energía | **25 W** (ID 1). Existen 7 W, 15 W, 25 W y `MAXN_SUPER` (el máximo, **no usado**) |

Siglas, para que no queden como magia:

- **CUDA**: el lenguaje y las herramientas con que los programas "hablan" con la GPU de NVIDIA.
- **cuDNN**: una biblioteca de operaciones de redes neuronales optimizadas sobre CUDA.
- **TensorRT**: un "compilador" que reorganiza un modelo para que corra más rápido en el Jetson. **No se usa todavía**: la decisión de adoptarlo se dejó para después de medir (ADR 0012).
- **JetPack / L4T** (*Linux for Tegra*): el paquete de sistema operativo y controladores de NVIDIA para Jetson.

**Por qué se anota el modo de energía en toda medición:** el mismo Jetson rinde distinto a 7 W que a 25 W. Una cifra de FPS sin su modo es una cifra que nadie puede comparar. La bitácora lo exige: *"toda medición de FPS debe anotar el modo de `nvpmodel`"*.

## Qué hace el Jetson en Aether y qué no

Según la ADR 0012 (**propuesta implementada en la rama `jetson-agente`, aún no aceptada formalmente por Mario**; **PENDIENTE (P-32)**), el Jetson ejecuta un **agente**: un programa (`backend/aether_agent.py`, puerto 8001) que **abre la cámara del Jetson**, corre YOLO + lectura de códigos + ArUco, **sirve el video anotado** y manda a la laptop **solo observaciones en JSON**, cada una con un identificador único. El **video nunca viaja por WiFi**: lo que viaja son datos chicos. La **laptop** sigue siendo el servidor central (base de datos, Lumina). Esa filosofía, *mover datos chicos y no datos grandes*, es la del capítulo 1. El Jetson **no** ejecuta la voz de Lumina (el micrófono es el de la laptop) ni mueve motores directamente: eso lo hace el **ESP32** (capítulo 5), al que le manda órdenes por **USB**.

## La bitácora como cuento policíaco

Entre el 21 y el 23 de octubre el equipo preparó el Jetson y, en cada paso, apareció un problema real. Es la mejor escuela de diagnóstico del proyecto.

### Caso 1: el SSH que se cortaba solo (21 de octubre)

**Síntoma:** las sesiones de **SSH** (la conexión remota de terminal) se cortaban con `Connection reset` mientras el Jetson tenía **WiFi y cable Ethernet a la vez** en la misma red.
**Hipótesis (sin comprobar):** con dos interfaces en la misma subred, el equipo tiene **dos IP** (`.18` y `.19`) y la ruta o el nombre `mario-desktop.local` pueden "saltar" de una a otra a mitad de sesión.
**Qué se hizo:** se apagó el WiFi (`nmcli radio wifi off`) y se dejó solo el cable. Para sobrevivir a cortes de todos modos se usa **`tmux`**, un programa que mantiene vivas las ventanas de terminal aunque se caiga la conexión.
**Estado:** la causa **no está diagnosticada** y la estabilidad con solo el cable **no está verificada** en uso largo (**PENDIENTE (P-26)**).

### Caso 2: una librería que PyTorch pedía y NVIDIA no explicaba (21 de octubre)

**Síntoma:** al planear la instalación de PyTorch de NVIDIA, la documentación mencionaba `libcusparseLt.so.0` y un script que **no cubre CUDA 12.6**.
**Qué se hizo:** en vez de adivinar, se buscó el archivo oficial para Jetson (`linux-aarch64`, versión **0.6.2.3**; la 0.7.0 exige CUDA 12.8). Se descargó, se **comprobó su huella** (SHA-256 igual a la calculada en la laptop), se verificó que era un binario ARM de 64 bits y se copió a `/usr/local/cuda/lib64`. Prueba: `ctypes.CDLL('libcusparseLt.so.0')` imprime "carga OK".
**Límite honesto:** solo se probó que **se carga**, no que PyTorch funcione con ella (eso vino en el caso 4).
**Nota de seguridad:** `cp -a` conserva el dueño del archivo (`mario`) y una librería del sistema que un usuario común puede reescribir es un riesgo; se propuso `sudo chown root:root` (estado: **NO verificado** que se aplicara; **P-26**).

### Caso 3: una dependencia que arrastraba el torch equivocado (21 de octubre)

**Síntoma:** al simular la instalación de `requirements-jetson.txt`, `pip` traía `torch` 2.14.1 **de PyPI**, que **no** tiene soporte de GPU de NVIDIA, a través de un paquete llamado `ultralytics-thop`.
**Por qué importa:** habría **pisado** el torch bueno.
**Corrección:** se sacó `ultralytics-thop` del archivo de requisitos y se instaló aparte con `pip install --no-deps` (sin dependencias). Resultado verificado con `pip --dry-run`: 43 paquetes, **ninguno** `torch`, `torchvision` ni `opencv`, y `numpy` 1.26.4 (menor que 2).
**Regla que sale de ahí:** **al instalar algo con `pip` sobre un entorno delicado, se simula primero (`--dry-run`) y se mira qué quiere cambiar.**

### Caso 4: PyTorch con GPU funciona (21 de octubre)

Se instalaron las "ruedas" (*wheels*, paquetes precompilados) de NVIDIA: `torch 2.5.0a0+872d972e41.nv24.08` y `torchvision 0.20.0a0+afc54f7`. Resultados **reportados**:

| Prueba | Resultado |
|---|---|
| `torch.cuda.is_available()` | `True` |
| Dispositivo | Orin |
| `torch.version.cuda` | 12.6 |
| Multiplicación de matrices 512×512 en GPU | resultado finito (correcto) |
| ¿`pip` cambió el torch por el de PyPI? | No: conserva el sufijo `nv` |

Y una detección con YOLOv8n sobre una imagen de archivo (`device=0`): detectó `bus`, 4 `person` y `stop sign` en **46 ms** (modo 25 W). **Límite:** una sola medición con imagen estática; no son FPS y no sirve para los umbrales de aceptación.

Dos detalles de oficio que ahorran tardes:

- `YOLO_AUTOINSTALL=False` es obligatorio: sin él, `ultralytics` intenta instalar `opencv-python` al no ver los metadatos de pip del OpenCV del sistema, y rompe el entorno.
- Si aparece `Uninstalling torch` o `Collecting torch==…` durante una instalación, se **cancela con `Ctrl+C`** antes de que diga `Successfully installed`.

La bitácora anota con honestidad dos dudas: la rueda se describió como compilada para CUDA 12.4 pero el sistema dice 12.6 (**no se verificó con qué CUDA se compiló**), y un hilo de foro de NVIDIA reporta, en L4T 36.4.7, el error "unable to allocate CUDA0 buffer" tras actualizar paquetes de Ubuntu; por eso **no se hizo `apt upgrade`** y no se probó YOLO bajo carga larga: **NO VERIFICADO**.

### Caso 5: una cámara con una resolución que no existe (21 de octubre)

Ya descrito en el capítulo 6: OpenCV por GStreamer entregaba 1536 × 2304. Solución: forzar V4L2 con variables de entorno. Estado: falta pegar el log que confirma 640 × 480 con esas variables.

### Caso 6: el backend corre en el Jetson… pero no debía (21 de octubre)

Como **prueba**, se corrió el backend completo en el puerto 8001. Funcionó: `/health`, `/line/cell/status` e `/inventory` respondieron. Pero no era la arquitectura prevista (el backend debe vivir en la laptop) y arrancó partes de Lumina que no tienen sentido en el Jetson. Resultado útil: se leyó el código y se comprobó que **ningún botón de la celda puede mover un pin** mientras `gpiod` no esté instalado (capítulo 7).

### Caso 7: ningún navegador abría (21 de octubre)

**Síntoma:** los navegadores instalados como **snap** (paquetes autocontenidos de Ubuntu; por ejemplo Chromium) fallaban con `snap-confine ... required permitted capability cap_dac_override not found`.
**Hipótesis de fuentes externas:** una versión nueva de `snapd` en un kernel sin ciertas opciones. Hay **dos `snapd`** (el `.deb` 2.67.1 y el snap 2.77.1). La causa raíz **no está diagnosticada**.
**Solución parcial:** se instaló Firefox desde el **PPA de Mozilla** (repositorio oficial) como `.deb`, versión `158.0.1~mt1`, con `--allow-downgrades`. **Abre** el panel de la laptop, pero **va lento por VNC** (un escritorio remoto; ≈ 87 % de un núcleo en `firefox`): se interpreta como renderizado por software a través de VNC; **no está medido con un monitor HDMI**.
**Efecto en Lumina:** `robot.html` usa `SpeechRecognition` del navegador, que no está activo en Firefox; **por eso la voz de Lumina quedó en la laptop** (ADR 0012, capítulo 15).

### Caso 8: la cámara que el navegador no mostraba (23 de octubre)

El agente del Jetson funcionó: **29.0 FPS** de cámara, **29.1** de entrega a 640 × 480, inferencia **68.0 ms** de promedio, `laptop.reachable` verdadero y `/stream` con respuesta 200 en `127.0.0.1:8001`. Pero la página **no mostró el video**: Firefox bloqueó la imagen por la **política de seguridad (CSP)**. La causa y la corrección están en el capítulo 11; aquí queda como ejemplo de que **el agente puede estar perfecto y la pantalla vacía**, y de que hay que diagnosticar por capas.

### Caso 9: el audio de Lumina bloqueado (23 de octubre)

Otro bloqueo del mismo tipo, esta vez con el **audio** (`media-src`). Capítulo 11.

## La regla de seguridad del Jetson: nunca `gpiod`

El usuario del Jetson pertenece al grupo `gpio`. `cell_line.py` hace `import gpiod` al cargarse y, **si existe**, configuraría como **salidas** las líneas 8 y 9 de `/dev/gpiochip0`: números **BCM de Raspberry Pi**, que en el **chip del Jetson** corresponden a **otras líneas**. Por eso:

- **No** se instala `gpiod` de Python en el Jetson (**VERIFICADO**: `python -c "import gpiod"` falla; sí están las herramientas del sistema `gpiod` 1.6.3 y `libgpiod2`).
- El script de arranque del agente **se niega a seguir** si lo detecta.
- Antes de arrancar cualquier backend se comprueba, `[Jetson · SSH]`, dentro del entorno virtual:

```bash
python -c "import gpiod"      # DEBE fallar con ModuleNotFoundError
```

## Arrancar el agente del Jetson

Rutas y nombres vienen de `COMANDOS_LINUX.md`, sección 8 (**construido y probado solo en la laptop; los scripts `.sh` no se han corrido en el Jetson**, salvo la prueba reportada del 23 de octubre).

```bash
# Una vez: configuración (editar AETHER_LAPTOP_URL con la IP de la laptop)  [Jetson · SSH]
cp ~/aether/scripts/jetson/aether-agent.env.example ~/.aether-agent.env && nano ~/.aether-agent.env

# Arrancar el agente dentro de tmux (sesión "agente")                      [Jetson · SSH]
bash ~/aether/scripts/jetson/iniciar-agente.sh

# Medir: FPS de cámara y de entrega, ms de inferencia, CPU y RAM            [Jetson · SSH]
python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15

# Detener                                                                  [Jetson · SSH]
bash ~/aether/scripts/jetson/detener-agente.sh
```

`iniciar-agente.sh` hace varias comprobaciones antes de arrancar (que exista `tmux`, el entorno virtual, `/dev/video0`, el archivo de configuración, y que `gpiod` **no** esté), dice **qué falta y cómo arreglarlo**, y se puede repetir sin miedo: si el agente ya corre, lo dice y no hace nada. El log queda en `~/aether-agente.log`. Para ver la página de la laptop **dentro del Jetson** (por VNC): `bash ~/aether/scripts/ver-aether.sh robot.html`.

## Las dos direcciones de la red del laboratorio

Según la bitácora, la red de esos días fue `192.168.100.x`: el Jetson por cable en `192.168.100.19` y la laptop por WiFi en `192.168.100.14`. El Jetson alcanzó el backend de la laptop (`curl http://192.168.100.14:8000/health` devolvió `{"status":"ok"}`); antes dio *timeout* simplemente porque el backend no estaba corriendo. Esas direcciones **cambian con la red**, por eso `agent_config.py` admite **nombres** (`mario-desktop.local`) y los compara con las IP a las que apuntan (con una caché de 60 s). Que el nombre se resuelva depende de la red y **no está verificado**.

## Qué falta medir

La cifra que más falta es la de **FPS con buena luz, la cámara en su lugar y el modo de energía anotado** (**PENDIENTE (P-22)**): el objetivo de **≥ 30 FPS** es de diseño y la prueba de la laptop (30.0 FPS con webcam y YOLO en CPU) no dice nada del Jetson. Tampoco se ha probado el modo `MAXN_SUPER`, ni TensorRT (se decidirá con datos), ni cómo se alimentará el Jetson dentro del robot (capítulo 4, **P-19**). Los diagnósticos abiertos (cortes de SSH, `snap-confine`, propiedad de `libcusparseLt`) están en la lista de pendientes del final del libro (**P-26**), junto con la duda de si el robot tendrá micrófono (**P-20**).

## Jetson en productos reales

La línea **Jetson** de NVIDIA es la plataforma típica de robots autónomos pequeños, cámaras inteligentes y drones: percepción en el borde (*edge*), sin nube, con consumo de unos pocos vatios. En producción se usan **imágenes de sistema ya empaquetadas**, contenedores (Docker) para reproducir el entorno y **TensorRT** para exprimir el rendimiento. Aether sigue el camino del laboratorio (venv + archivo de requisitos), más fácil de entender, con una tabla de versiones reportadas como la de arriba, y deja Docker y TensorRT como pasos de madurez.

## Preguntas de repaso: el Jetson

1. ¿Qué dos cosas distintas protegen `YOLO_AUTOINSTALL=False` y el `--no-deps` al instalar `ultralytics`?
2. ¿Por qué el torch de PyPI y el torch de NVIDIA no son lo mismo aunque se llamen igual?
3. Si `torch.cuda.is_available()` devolviera `False`, ¿qué tres cosas se revisarían primero según la bitácora?
4. ¿Por qué una cifra de FPS necesita decir en qué modo de energía se midió?
5. ¿Por qué el agente puede funcionar bien y aun así no verse el video en la página?
6. ¿Por qué nunca debe instalarse `gpiod` en el Jetson?
