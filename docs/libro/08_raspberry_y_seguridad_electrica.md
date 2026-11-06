# Capítulo 8: La Raspberry Pi 4 y la seguridad eléctrica del GPIO

*Para qué sirve la Pi de la celda, cómo se instala sin torch, por qué un pin puede disparar el pistón al encender y qué se mide antes de dejar que el código toque algo real.*

## Una computadora del tamaño de una tarjeta, con pines que tocan el mundo

La **Raspberry Pi** es una computadora completa en una placa del tamaño de una tarjeta: procesador tipo móvil (ARM), memoria, puertos USB y de red, ranura para tarjeta **microSD** (donde vive el sistema) y, en un costado, **40 pines** llamados **GPIO** (*General Purpose Input/Output*, entrada y salida de propósito general) con los que puede leer un botón o encender un relevador. Corre **Linux**: el sistema oficial se llama *Raspberry Pi OS* y su versión actual se basa en **Debian 12 "Bookworm"**.

En Aether aparecen **dos modelos** y conviene separarlos:

| Raspberry | Papel | Estado |
|---|---|---|
| **Raspberry Pi 4** | Computadora de la **celda de manufactura**, junto a la banda: cámara de línea, visión, relevadores y la página `celda.html` | **Vigente**, pero **sin probar** en el hardware real (**PENDIENTE (P-18)**) |
| **Raspberry Pi 5** con AI HAT+ | Se pensó para el robot (plan del 30 de septiembre) | **Descartada**; la guía del 9 de octubre que la describe quedó vieja |

El cerebro del robot es el **Jetson** (capítulo 9), no una Pi. Los conceptos eléctricos básicos (voltaje, corriente, niveles lógicos) están en el capítulo 2; este capítulo añade lo que el código y la hoja de conexión de la celda dan.

## Instalar la celda en la Pi: sin torch, sin ultralytics

El agente de la celda (`backend/celda_agent.py`) está pensado para que la Pi **no** cargue Lumina (el asistente del proyecto, capítulo 15), ni la base de datos, ni `torch` ni `ultralytics`: son pesadísimos. El modelo de visión corre en **ONNX** (un formato neutral de modelos) con `cv2.dnn`, un módulo de OpenCV. El archivo `backend/requirements-pi.txt` lo dice con todas sus letras:

> Se instala en un venv con `--system-site-packages`: OpenCV y NumPy salen de `apt` (`python3-opencv`, `python3-numpy`), **no de pip**. Prohibido en la Pi: `opencv-python`, `opencv-contrib-python`, `torch` y `ultralytics`. Requiere Python ≥ 3.10 (Raspberry Pi OS Bookworm trae 3.11).

¿Por qué `--system-site-packages`? Un **venv** (entorno virtual de Python) normalmente es una caja aislada; esa opción le permite **ver** los paquetes instalados por `apt`. Así la Pi usa el OpenCV compilado para ella (rápido) y pip solo instala `fastapi` y `uvicorn`.

### Pasos (copiados de `COMANDOS_LINUX.md`, sección 7; **ninguno corrido todavía en la Pi**)

**Una vez, en la laptop** (el modelo se exporta allí porque la Pi no tiene torch), `[Laptop · PowerShell]`, desde la raíz del proyecto:

```powershell
edge\.venv\Scripts\python.exe -m pip install onnx
$env:YOLO_AUTOINSTALL = "False"
edge\.venv\Scripts\python.exe -c "from ultralytics import YOLO; YOLO('edge/perception/weights/parts.pt').export(format='onnx', imgsz=320, opset=12)"
```

Luego se copia el archivo a la Pi (`<usuario>` y `<ip-pi>` son los de esa Pi y **no están en el repositorio**), `[Laptop · PowerShell]`:

```powershell
ssh <usuario>@<ip-pi> "mkdir -p ~/aether/edge/perception/weights"
scp edge\perception\weights\parts.onnx <usuario>@<ip-pi>:~/aether/edge/perception/weights/
```

**Una vez, en la Pi**, `[Pi 4 · SSH]`:

```bash
sudo apt install -y git python3-venv python3-opencv python3-numpy
git clone --depth 1 --filter=blob:none --sparse <url-del-repo> ~/aether && cd ~/aether
git sparse-checkout set backend dashboard edge/perception/parts
python3 -m venv --system-site-packages ~/celda-venv
~/celda-venv/bin/pip install -r backend/requirements-pi.txt
```

El `git sparse-checkout` baja **solo las carpetas necesarias** (`backend`, `dashboard` y las clases del modelo), no todo el repositorio.

**Arrancar** (dentro de `tmux`, un programa que mantiene la sesión viva aunque se cierre la ventana de SSH), `[Pi 4 · SSH]`:

```bash
cd ~/aether/backend && ~/celda-venv/bin/python -m uvicorn celda_agent:app --host 0.0.0.0 --port 8000
curl -s localhost:8000/health   # esperado: {"status":"ok","error":null}
```

Después, desde la laptop, en el navegador: `http://<ip-pi>:8000/celda.html`. Si `health` falla, el campo `"error"` dice por qué.

### Una incógnita técnica real

El modelo ONNX se probó con **OpenCV 5.0** en una laptop. **Bookworm trae OpenCV 4.6.** Si `cv2.dnn` de esa versión no sabe leer el ONNX (por un operador que cambió entre versiones), la celda no arranca. La bitácora lo marcó como **NO VERIFICADO**, y la primera prueba en la Pi debe incluir `top` (para ver CPU) y `curl /line/cell/status` con una pieza delante. Sistema, RAM y cámara exactos de esa Pi 4: **PENDIENTE (P-18)**.

## Los 40 pines: dos formas de contarlos

Una confusión clásica del GPIO: **cada pin tiene dos números**.

- El **número físico**: la posición en el conector, del 1 al 40.
- El **número BCM** (por el chip de Broadcom): el nombre "lógico" del GPIO, el que usa el software.

`cell_line.py` usa números **BCM**: **GPIO 8** para el pistón y **GPIO 9** para la banda. En el conector físico corresponden (**regla general; verificar en el diagrama oficial `pinout.xyz` antes de cablear**) a los pines **24 y 21**. Los números se pueden cambiar con las variables `LINE_GPIO_PISTON` y `LINE_GPIO_BANDA`. Un riesgo derivado, señalado por la bitácora: esos números son **BCM de Raspberry Pi**; en el **Jetson** serían **otras líneas** del chip, así que **jamás** debe instalarse `gpiod` en el Jetson (los scripts de arranque del agente se niegan a seguir si lo detectan).

## El estado del pin al encender: la trampa que no se ve en el código

Esta es la lección más valiosa del capítulo y es **regla general** (no medida en la Pi del proyecto): al **encender** una Raspberry, **antes** de que corra el programa, los pines no están "apagados": cada uno tiene una resistencia interna que lo **jala** hacia 3.3 V (*pull-up*) o hacia 0 V (*pull-down*). Según la documentación del chip, los **GPIO 0 a 8 arrancan con pull-up** (nivel alto) y los GPIO 9 a 27 con pull-down (nivel bajo). Aplicado a la celda:

- **GPIO 8 (pistón)** arrancaría en **alto**.
- **GPIO 9 (banda)** arrancaría en **bajo**.

¿Qué hace una placa de relevadores con un pin en alto? Depende de **cómo esté hecha**: muchas placas baratas son **"activas en bajo"** (el relevador se enciende cuando el pin está en **bajo**), otras **"activas en alto"**. Con una placa activa en alto, **el pistón se dispararía solo al encender la Pi**. Qué tipo de placa se usa y cómo está alimentada su bobina **no está escrito en ningún lado**: **PENDIENTE (P-12)**. Por eso la regla de seguridad exige medir **el estado de los pines al arrancar con un LED o un multímetro, sin carga conectada**, antes de conectar el pistón real.

## Qué hay entre un pin y el pistón

Un pin de 3.3 V no puede mover una electroválvula de 24 V. La cadena segura es:

1. **Pin GPIO (3.3 V, pocos miliamperios)** →
2. **Módulo de relevadores** (idealmente con entrada aislada por **optoacoplador**, que separa eléctricamente el mundo de la Pi del de 24 V) →
3. **Contacto del relevador** (aguanta los 24 V y la corriente) →
4. **Electroválvula del pistón**, con su **diodo de protección** en paralelo con la bobina si es de corriente continua. Ese diodo (*flyback*) absorbe el pico de voltaje que genera una bobina al apagarse; sin él, ese pico puede dañar el contacto del relevador.

La Pi se alimenta con **su propia fuente de 5 V** (la oficial es de 5 V y 3 A por USB-C), separada de los 24 V. Una Pi con poca energía muestra un aviso de **bajo voltaje** y puede comportarse raro.

## Lista antes de energizar algo real

Basada en el plan de seguridad del proyecto y en la regla del repositorio:

1. **Sin cargas.** Pi encendida, pines libres. Con multímetro, medir el voltaje de los GPIO 8 y 9 **al encender** y anotar los valores.
2. **Un LED con resistencia** (capítulo 2) en lugar del relevador. Verificar que parpadea cuando el código lo pide y que **no** parpadea al arrancar.
3. **Probar `cell_line.py`** con `gpiod` instalado pero **sin carga real**: ¿qué hace al detectar `FAIL`?
4. **Relevador sin pistón.** Escuchar el clic y medir su contacto.
5. **Solo entonces** el pistón, con aire a presión baja y **sin pieza**.
6. **Paro de emergencia físico** cableado **antes** de cualquier actuador real (**PENDIENTE (P-16)**).
7. **Instalar `python3-libgpiod`** (`sudo apt install python3-libgpiod` y el usuario en el grupo `gpio`) **solo después** de los pasos anteriores.

## Arrancar la celda sola, sin abrir una ventana

La celda debe poder operarse sola; eso implica que, al darle corriente a la Pi, el agente tendría que **arrancar solo**. Hoy se arranca a mano dentro de `tmux`. La opción de **systemd** (el sistema de Linux para servicios que arrancan solos) se descartó para el Jetson en la ADR 0012 *("otra pieza que mantener")* y se anotó como posible mejora cuando el agente resulte estable. Para la celda, que se espera que funcione sin supervisión, vale la pena reconsiderarlo: **PENDIENTE (P-25)**. Mientras tanto, el agente reabre la cámara solo si se cae y no necesita que alguien abra el video.

## La Raspberry Pi 5 de la guía vieja

Para que no confunda cuando aparezca en los documentos: la guía del 9 de octubre describe una **Pi 5** (8 GB) con fuente de 27 W, una pantalla HDMI, un ESP32 conectado por serial UART (activando `dtparam=uart0=on` en `/boot/firmware/config.txt`) y un navegador mostrando la cara de Lumina. Todo eso **corresponde al plan descartado**. No es necesario para el robot, que usa el Jetson y el ESP32 por USB. El **problema del navegador del Jetson** (capítulo 9) es justamente la contraparte de esa decisión.

## La Pi en el mundo industrial

En planta, una **Raspberry Pi** se usa para prototipos, visión y supervisión; los productos serios emplean **versiones industriales** (con caja, riel DIN y alimentación de 24 V, como las que venden fabricantes de computadoras de borde) y **nunca** como única barrera de seguridad: eso se deja a **relevadores de seguridad** y **PLC certificados**. Decir esto ante un jurado, con estas palabras, demuestra criterio.

## Preguntas de repaso: Raspberry y GPIO

1. ¿Por qué la Pi no lleva `torch` ni `ultralytics`, y qué usa en su lugar?
2. ¿Qué diferencia hay entre el número físico y el número BCM de un pin?
3. ¿Qué podría pasar al encender la Pi si la placa de relevadores es "activa en alto" y GPIO 8 arranca en alto?
4. ¿Para qué sirve el diodo en paralelo con la bobina de una electroválvula?
5. Escribir, en orden, los cuatro primeros pasos de la lista "antes de energizar algo real".
6. ¿Qué parte de `COMANDOS_LINUX.md`, sección 7, ya se corrió en la Pi y cuál no?
