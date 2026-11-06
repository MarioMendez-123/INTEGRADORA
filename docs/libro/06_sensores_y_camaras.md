# Capítulo 6: Sensores y cámaras

*Cómo "siente" Aether: una cámara que lee códigos, sensores de distancia que frenan antes de chocar, una brújula giratoria, una barra que ve el piso y los interruptores que dicen "ya llegué".*

## Una cámara que mintió sobre su resolución

El 21 de octubre de 2026, durante la preparación del Jetson, apareció algo que le pasa a casi todo el que programa cámaras por primera vez. Al abrir la cámara con `cv2.VideoCapture(0)`, OpenCV (la librería de visión por computadora de Python) entregó un cuadro de **1536 × 2304** píxeles. Pero la cámara USB **no tiene** ese modo; sus modos reales son 640 × 480, 1920 × 1080, etc. Sin que nadie se lo pidiera, OpenCV abrió la cámara por **GStreamer** (un sistema de tuberías de video de Linux), que inventó un cuadro con un formato raro. Al forzar el backend **V4L2** (el controlador estándar de cámaras de Linux), llegó el cuadro correcto de **480 × 640**.

Esto está **VERIFICADO** en la bitácora del equipo y explica que, en la primera prueba del backend en el Jetson, el panel transmitiera a 2304 × 1536 (el cuádruple de píxeles necesarios) y se viera lento. La solución, ya en el repositorio (commit `c9f24cb`): variables de entorno opcionales `PERCEPTION_CAMERA_BACKEND`, `_FOURCC`, `_WIDTH` y `_HEIGHT` (y las equivalentes `LINE_VISION_CAMERA_*` de la celda) para forzar V4L2, MJPG y 640 × 480. Moraleja para cualquier proyecto con cámaras: **nunca asumir qué entrega el sistema; preguntar y medir.**

## La cámara del robot

La **cámara** del diseño es una **Logitech 1080p USB** que Mario (responsable del software del robot y de la visión) ya tiene, montada **arriba, al frente**, mirando hacia la banda. Su trabajo, según la hoja de armado: **leer el QR de cada fixture** (el código viene en el travesaño trasero) y **los ArUco de las estaciones**, y alimentar a YOLO (capítulo 14). En el Jetson, esta cámara aparece así (**VERIFICADO**, salida reportada en la bitácora):

| Dato | Valor |
|---|---|
| Nombre | "1080P Pro Stream" (puerto `usb-3610000.usb-2.3`) |
| Dispositivos | `/dev/video0` (captura) y `/dev/video1` (solo metadatos) |
| Identificador USB | `046d:0894` (en `lsusb` sale como Logitech CrystalCam; es la misma cámara) |
| Formatos | YUYV y MJPG; MJPG de 160 × 90 hasta 1920 × 1080 a 30 FPS |

Comandos para repetir esa revisión, `[Jetson · SSH]`:

```bash
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext
```

El primero lista las cámaras; el segundo, todos los modos que ofrece cada una.

## FPS, exposición y los cuadros que se caen

Un **FPS** (*frames per second*, cuadros por segundo) mide cuántas imágenes entrega la cámara cada segundo. El agente de percepción del Jetson midió **29.0 FPS de cámara y 29.1 de entrega**, a 640 × 480, con una inferencia de YOLO de **68.0 ms** de promedio (**MEDIDO**, reportado por Mario el 23 de octubre).

Antes, en una prueba con **poca luz** y la cámara sin acomodar, la captura bajó a **10 FPS** con Python y a **15.3 FPS** con `v4l2-ctl`. La razón es un clásico: con poca luz, la cámara **alarga el tiempo de exposición** (mira más tiempo cada cuadro para juntar luz) y entrega menos cuadros por segundo. La opción `exposure_dynamic_framerate` permite que la cámara baje los FPS automáticamente si hace falta luz. Al apagarla **solo como prueba**, el promedio subió pero no se estabilizó: no es una medición representativa. **No se fija nada de exposición desde el código**; la medición buena, con luz real y la cámara en su posición final, queda **PENDIENTE (P-22)**.

Mensaje práctico: **la luz es un componente del sistema**, como la batería. Un robot que "anda perfecto en la mesa" y "se ve ciego" en el pasillo oscuro tiene un problema de iluminación, no de software.

## ArUco y códigos: señales que el robot sabe leer

Un **ArUco** es un cuadrado blanco y negro con un patrón único, parecido a un código QR pero más simple, diseñado para que una cámara calcule **dónde está y hacia dónde mira**. Aether lo usa para **verificar su posición** al llegar a la banda y a la estación de descarga (el robot navega por **waypoints**, puntos de ruta, y el ArUco corrige el error acumulado). Los **códigos de barras y QR** se leen con la librería `pyzbar` y sirven para identificar cada fixture. El tamaño impreso de los marcadores y la distancia a la que deben leerse **no están en ningún documento**: **PENDIENTE (P-11)**.

Un hallazgo del propio proyecto, documentado en el informe integrador: el ArUco **puede dar un identificador incorrecto pero válido cuando hay reflejos de luz**, sin señal de error visible (capítulo 14).

## El bus I²C: seis dispositivos, dos cables

Varios sensores del diseño comparten un **bus I²C** (*Inter-Integrated Circuit*): **dos cables** (**SDA** para datos y **SCL** para el reloj) por donde el ESP32 habla con muchos dispositivos, cada uno con una **dirección** única. Es como un grupo de mensajería donde cada persona tiene su nombre. En el diseño, los pines son el **GPIO 21 (SDA)** y el **GPIO 22 (SCL)** del ESP32, y las direcciones son:

| Dispositivo | Dirección I²C | Qué hace |
|---|---|---|
| **PCF8574** (expansor de pines) | `0x20` | Da 4 salidas extra para el truco de los VL53L0X |
| **BNO055** (IMU) | `0x28` | Mide el giro del robot |
| **VL53L0X** frontal | `0x30` | Distancia al frente |
| **VL53L0X** lateral izquierdo | `0x31` | Distancia a la izquierda |
| **VL53L0X** lateral derecho | `0x32` | Distancia a la derecha |
| **VL53L0X** de la pila | `0x33` | ¿Hay un fixture arriba de la torre? |

La hoja pide una comprobación con un **escáner I²C** (un programita que pregunta a todas las direcciones quién contesta): *"El escáner I²C lo encuentra en 0x20"*, etc. Si el escáner no ve un dispositivo, el problema es de cableado, no de programa.

## VL53L0X: medir distancias con un rayo de luz

El **VL53L0X** es un sensor de **tiempo de vuelo** (*Time-of-Flight*, ToF): manda un pulso de luz infrarroja, espera a que rebote en un objeto y, con el **tiempo** que tardó, calcula la distancia (la luz viaja a 300 000 km/s, así que hace falta un reloj muy rápido). El diseño pone **cuatro**:

- **Tres de obstáculos** a unos **15 cm del piso**: uno al frente y uno a cada lado. Si ven algo a **menos de 40 cm**, **frenan el carrito sin esperar al Jetson**: es una capa de seguridad **reactiva** (decide el ESP32 al instante, sin mandar nada por USB).
- **Uno arriba de la torre**, mirando hacia abajo, que **confirma que hay un fixture** en la pila (presencia, con ±25 mm).

Un problema típico: **los cuatro sensores vienen con la misma dirección de fábrica**, así que en el mismo bus chocarían. La solución del diseño: cada sensor tiene un pin **XSHUT** (apagado). Al arrancar, el ESP32 los apaga a todos mediante el **PCF8574** (salidas P0 a P3), los **prende uno por uno** y a cada uno le cambia la dirección a `0x30`, `0x31`, `0x32` y `0x33`.

La hoja pide verificar *"Mide bien a 10, 30 y 60 cm"* con una regla. Una advertencia práctica: **los cables de señal pegados a los de potencia hacen que los VL53L0X y el RS485 fallen "al azar"**. El alcance máximo y la precisión son datos del fabricante (**conocimiento general**: del orden de un par de metros); no están medidos en el proyecto.

## BNO055: una brújula de giro (sin brújula)

El **BNO055** es una **IMU** (*Inertial Measurement Unit*, unidad de medición inercial): un chip con **acelerómetro** (mide aceleraciones), **giroscopio** (mide cuánto gira) y, en su modo completo, **magnetómetro** (mide el campo magnético, como una brújula). En el diseño sirve para **corregir la odometría** de las ruedas: las ruedas pueden patinar y "creerse" que giraron 90° cuando giraron 85°; el giroscopio no se deja engañar.

Detalle de oficio: la hoja pide el **modo IMU, sin magnetómetro**, *"porque los motores y la batería lo confunden"*: los imanes y las corrientes grandes alteran el campo magnético alrededor del robot. Comprobación del diseño: *"al girar el carrito 90° marca ~90°"*. Y una nota de compra: el módulo adquirido trae sus 8 pines en una sola fila, distinto del modelo de Adafruit dibujado en la hoja; hay que leer la serigrafía del módulo real antes de soldar.

## QTR-8A: una barra que ve el piso (de respaldo)

La **QTR-8A** es una barra con **8 sensores infrarrojos** que miran el piso y devuelven un valor **analógico** (un voltaje entre 0 y 3.3 V) según qué tan oscura sea la superficie: cinta negra sobre piso claro, por ejemplo. Va **debajo del frente, a 3–5 mm del piso**, alimentada a **3.3 V (nunca 5 V)**, y usa solo **5 de los 8** (las del centro: salidas 3 a 7, GPIO 32 a 36). Es un **plan B**: *"seguir una línea en el piso si la navegación por waypoints falla"*.

## Finales de carrera: "ya llegué" con un clic

Los **tres finales de carrera** son interruptores mecánicos que el carro pisa al llegar al límite. Dan el **cero** (*home*): el programa mueve el motor hasta que el interruptor se activa y a partir de ahí **cuenta pasos**. Van como **contacto normalmente cerrado (NC)** con **pull-up** (una resistencia que "tira" el pin hacia 3.3 V): *"un cable roto se lee como 'presionado' y el motor se detiene"*. Es la misma idea de **falla segura** del capítulo 4.

## Los infrarrojos de la celda

La celda tiene **dos infrarrojos industriales** (uno en la estación de visión y otro después del pistón), de los que habla el capítulo 7. Aquí solo conviene recordar la idea central del capítulo 2: **PNP o NPN**, y **24 V, no 5 V**.

## Lo que no existe en el diseño

- **Lidar:** una guía vieja contemplaba un lidar 2D por USB ("cuando se compre") y reconocía que *"no existe todavía el programa de ruta"*. **La hoja de armado revisión 3.8 no lo incluye.** Hoy la prevención de choques usa los tres VL53L0X y la navegación es por waypoints con ArUco. Si se comprará un lidar y qué sensores quedan definitivos: **PENDIENTE (P-10)**.
- **Micrófono y bocina del robot:** el micrófono de Lumina (la cara y voz del robot, capítulo 15) es el de la laptop. Si el robot tendrá micrófono propio **no se sabe**: **PENDIENTE (P-20)**.
- **Medición de corriente de la batería:** solo existe el divisor de voltaje del capítulo 4.

## Calibración: el mundo físico no es ideal

Todos los sensores de este capítulo tienen un **error propio**: el VL53L0X lee unos milímetros de más o de menos según el color del objeto; el giroscopio "se desvía" lentamente; la cámara cambia con la luz; las ruedas patinan. Por eso casi cada comprobación de la hoja termina en una medición con regla o multímetro: *"Mide bien a 10, 30 y 60 cm"*, *"marca ~90°"*, *"5.0–5.1 V sin carga"*. **Un buen programa deja perillas para ajustar** (desfases, ganancias, umbrales) en vez de asumir que el sensor es perfecto.

## Capas de sensado en robots comerciales

Los robots móviles comerciales combinan **capas**: una **capa reactiva rápida** (sensores de distancia y bumpers que frenan al instante), una **capa de navegación** (mapas, **lidar**, odometría y cámara) y una **capa de seguridad certificada**. El diseño de Aether sigue esa lógica a escala de laboratorio: VL53L0X (reactiva), cámara + ArUco + odometría (navegación) y el paro físico (seguridad). Los productos comerciales añaden **lidar de seguridad certificado** con zonas de frenado configurables.

## Preguntas de repaso: sensores y cámaras

1. ¿Por qué una cámara entrega menos FPS con poca luz y qué cambia al poner una lámpara?
2. ¿Qué es una dirección I²C y por qué los cuatro VL53L0X necesitan el truco del XSHUT?
3. ¿Qué ventaja tiene que el ESP32 frene el robot al ver algo a menos de 40 cm, en lugar de que lo decida el Jetson?
4. ¿Por qué se usa el BNO055 en modo IMU (sin magnetómetro) en un robot con motores y batería?
5. ¿Qué valor lee un final de carrera normalmente cerrado si se rompe su cable?
6. ¿Qué dato falta hoy para que el ArUco sirva de verdad: tamaño impreso, distancia o iluminación?
