# Capítulo 5: Motores, drivers y el ESP32

*Cómo se mueven las ruedas, el elevador y el empujador; qué es un driver, un motor a pasos y un bus RS485; qué pin del ESP32 hace qué en el diseño del carrito y con qué herramienta se programa.*

## El cerebro piensa lento y el músculo reacciona rápido

El robot de Aether lleva dos computadoras con trabajos opuestos. El **Jetson** piensa: ve la cámara, reconoce piezas, decide a dónde ir. Pero Linux, el sistema que corre en el Jetson, no está hecho para responder a un evento en microsegundos: puede "distraerse" un instante con cualquier otro proceso. Mover motores exige lo contrario: pulsos con la separación exacta, contadores leídos a tiempo y frenado inmediato.

Para eso existe el **ESP32**, un **microcontrolador**: un chip que ejecuta **un solo programa**, sin sistema operativo que lo interrumpa, con pines que puede encender, apagar o leer con precisión. Es el "cerebelo" del robot: recibe del Jetson órdenes de alto nivel ("avanza", "sube el elevador") y las convierte en pulsos y señales. El equipo ya tiene un ESP32 en su poder; el diseño de la hoja de armado usa un **ESP32 DevKitC de 38 pines** (tarjeta de desarrollo con chip ESP32, regulador de 3.3 V y puerto micro USB). El modelo exacto de la placa que se tiene: **PENDIENTE (P-07)**.

## Tres tipos de actuadores en un solo robot

| Actuador | Cuántos | Para qué | Cómo se manda |
|---|---|---|---|
| **Motor-rueda M0601** (modelos FIT1042 y FIT1038) | 2 | Mover el carrito | Por un bus **RS485**: el ESP32 manda mensajes y el motor trae su propio driver y encoder |
| **Motor a pasos NEMA 17** (17HS4401) | 3 | 2 husillos del elevador + 1 piñón del empujador | Pulsos **STEP** y **DIR** a un driver **A4988** |
| **Servo MG90S** (180°) | 1 | La uña del empujador | Una señal **PWM** a un pin |

El M0601 y los NEMA 17 son decisiones firmes del equipo (ya cotizados); si ya llegaron o están instalados es **PENDIENTE (P-01)**.

## Motor, PWM y driver: la llave y la tubería

Un **motor de corriente continua** (DC) gira más rápido cuanto más voltaje recibe. Pero un pin del ESP32 solo da 3.3 V y unos pocos miliamperios: no puede alimentar un motor. La solución es un **driver**: un circuito de potencia que **obedece** a una señal chica y **entrega** la corriente grande desde la batería. Es como la llave de una manguera: la mano (la señal) es débil, pero controla un chorro enorme.

¿Cómo se controla la velocidad si solo hay "encendido" o "apagado"? Con **PWM** (*Pulse-Width Modulation*, modulación por ancho de pulso): se enciende y apaga el motor miles de veces por segundo y se cambia la **proporción de tiempo encendido**. 25 % encendido ≈ el motor gira a un cuarto de potencia. Es como pulsar el acelerador de un auto muy rápido: el motor "promedia".

El interior de un driver de motor DC es un **puente H**: cuatro interruptores en forma de H que, combinándose, dejan pasar la corriente en un sentido o en el contrario (adelante o atrás). Una guía vieja del equipo (9 de octubre) usaba para esto un **TB6612FNG**, un chip pequeño de ≈ 1 A por motor; la propia guía avisaba que *"si el robot es de tamaño persona, este driver no se usa"*. Con 40 kg, no es el driver. En el diseño actual **las ruedas traen su propio driver dentro del motor**, así que el ESP32 no maneja corriente de ruedas; solo manda mensajes.

## Las ruedas: órdenes por un bus RS485

El **RS485** es un estándar para comunicar equipos industriales con **dos cables trenzados** (**A** y **B**) a distancias largas y con mucho ruido eléctrico. Varios dispositivos cuelgan del mismo par de cables (un "bus"), cada uno con su **ID**: aquí los dos M0601 son el **ID 1 y el ID 2**.

El ESP32 habla en 3.3 V, pero el chip **MAX485** que traduce a RS485 trabaja a 5 V, así que el diseño añade un **convertidor de nivel** (un traductor 3.3 ↔ 5 V). Cableado exacto, según la hoja:

| Señal | Pin del ESP32 | Qué hace |
|---|---|---|
| **DI** del MAX485 | GPIO 17 | Lo que el ESP32 **manda** a los motores |
| **DE + RE** (unidos) | GPIO 4 | En 1, el MAX485 **habla**; en 0, **escucha**. El ESP32 lo cambia en cada mensaje |
| **RO** del MAX485 | GPIO 16 (pasando por el convertidor de nivel) | Lo que **contestan** los motores; sale a 5 V y se baja a 3.3 V antes de entrar |

Es un bus **half-duplex**: no se puede hablar y escuchar a la vez, por eso DE y RE van puenteados a un solo pin. Dos reglas de la hoja: **trenzar A con B** y **si los motores no contestan, invertir A y B** (síntoma típico de un RS485 recién armado).

**Lo que no se sabe:** el **protocolo** de mensajes del M0601 (qué bytes significan "gira a tal velocidad") **no está en el repositorio**. Hay que leer la hoja técnica del fabricante: **PENDIENTE (P-08)**. Sin eso no se puede escribir el programa de las ruedas.

## Odometría: saber cuánto avanzó el robot

La hoja dice que *"el ESP32 cuenta las vueltas de los M0601 a 50 Hz para la odometría"*. La **odometría** es estimar la posición del robot sumando cuánto giró cada rueda, como el cuentakilómetros de un auto. Una **vuelta** de rueda de Ø 102 mm avanza π × 0.102 ≈ **0.32 m**. Con las dos ruedas separadas **0.285 m** (±0.1425 m del centro, según la tabla de medidas), la cinemática diferencial (**conocimiento general**) es:

- Velocidad hacia adelante del robot: **v = (v_der + v_izq) / 2**
- Giro: **ω = (v_der − v_izq) / 0.285**

El viaje, según la hoja, se limita a **0.35 m/s y 0.4 m/s²**. La odometría **se acumula con error** (las ruedas patinan un poco), por eso el diseño la corrige con el **ArUco** que la cámara ve al llegar a cada estación (capítulo 14) y con una **IMU** (capítulo 6). Los **encoders** (sensores que cuentan cuánto giró el eje) vienen dentro de los M0601.

## Motores a pasos: el motor que sabe contar

Un **motor a pasos** (NEMA 17 es solo su tamaño de brida: 42 × 42 mm) avanza un ángulo fijo por cada pulso. El 17HS4401 da **200 pasos por vuelta**. Para que gire más suave y silencioso, el driver **A4988** subdivide cada paso en **micropasos**; el diseño pone los pines MS1, MS2 y MS3 a 3.3 V, que activan el **micropaso 1/16**: **200 × 16 = 3200 pulsos por vuelta**. La hoja lo resume: *"Por eso 3200 pasos = 1 vuelta."*

El A4988 recibe tres señales por motor:

- **STEP**: cada pulso es un micropaso.
- **DIR**: el nivel (alto o bajo) decide el sentido.
- **ENABLE**: en 0 el motor tiene fuerza (retiene); en 1 queda suelto.

### Cuentas con las piezas del carrito

Con la hoja se calcula el tamaño de cada movimiento (**ejemplos de cuenta**, con micropaso 1/16):

- **Empujador:** piñón de módulo 1.5 y 20 dientes, Ø 30 mm → avanza π × 30 ≈ **94.2 mm por vuelta**. Una carrera de **250 mm** son 250 / 94.2 ≈ 2.65 vueltas ≈ **8 490 pulsos**. La hoja dice que la cremallera se mueve a **80 mm/s**: eso son 80 / 94.2 × 3200 ≈ **2 700 pulsos por segundo**, y la carrera completa dura ≈ 3 s.
- **Elevador:** un nivel son **70 mm**. Con un husillo de paso **P** mm (lo que avanza por vuelta), son 70 / P vueltas y 70 / P × 3200 pulsos. Si P = 8 mm: **28 000 pulsos**; si P = 2 mm: **112 000 pulsos**. La diferencia es enorme, por eso la hoja dice *"medir el avance al recibirlos"*. **El paso real del husillo TR8 es PENDIENTE (P-09)** y cambia todo el programa del elevador.

Los **dos motores del elevador** comparten STEP, DIR y ENABLE: un mismo pulso llega a ambos drivers, así que giran **exactamente igual**. Funciona mientras ninguno pierda pasos; no hay sensor que compare los dos. La única corrección son los **finales de carrera**.

## El mapa de pines del ESP32 (diseño, revisión 3.8)

Este es el "guion" que deberá respetar el programa del ESP32, leído del cableado de la placa cable por cable. **No está probado en hardware**: es diseño.

| Pin (GPIO) | Función | Va a |
|---|---|---|
| 25 | STEP del elevador | A4988 #1 y #2 |
| 26 | DIR del elevador | A4988 #1 y #2 |
| 27 | STEP del empujador | A4988 #3 |
| 14 | DIR del empujador | A4988 #3 |
| 13 | ENABLE (de los 3 drivers) | A4988 #1, #2 y #3, con resistencia de 10 kΩ a 3.3 V |
| 17 / 4 / 16 | RS485: DI / DE+RE / RO | MAX485 |
| 21 / 22 | I²C: SDA / SCL | VL53L0X, PCF8574, BNO055 (capítulo 6) |
| 18 / 19 / 23 | Finales de carrera 1, 2 y 3 | Elevador izquierdo, elevador derecho, home del empujador |
| 32, 33, 34, 35, 36 | Salidas S3 a S7 de la barra QTR-8A | Barra de línea (capítulo 6) |
| 39 | Voltaje de la batería | Divisor 100 kΩ / 20 kΩ (capítulo 4) |
| 5 | PWM del servo | MG90S de la uña |
| 2 | Datos de la tira WS2812 (opcional) | Resistencia de 330 Ω a la tira de LEDs |

Detalles de ingeniería que esa tabla esconde:

- **La resistencia de 10 kΩ en ENABLE.** Al encender el ESP32, sus pines tardan unos instantes en "tomar posición". Con ENABLE atado a 3.3 V, los motores **quedan sueltos** durante el arranque; así *"no hay movimientos raros al encender"* (palabras de la hoja).
- **Finales de carrera NC con pull-up.** Si el cable se rompe, el pin lee igual que "presionado" y el motor se detiene en lugar de chocar: la misma idea de falla segura del paro de emergencia.
- **Pines solo de entrada.** En el ESP32, los GPIO 34, 35, 36 y 39 **solo pueden leer**; por eso se asignan a la barra y a la batería (**conocimiento general** del ESP32).
- **Pines con trampa al arrancar.** Algunos pines (como el 2 y el 5) afectan cómo arranca el chip; la hoja anota que los LEDs van sin convertidor de nivel *"si no, el ESP32 no se deja programar"*. Conviene dejar esas líneas desconectadas al subir un programa (alerta general, no medida).

## El perro guardián y el contrato con el Jetson

Entre el Jetson y el ESP32 va un **cable USB de datos** (*"los de solo carga no sirven"*, advierte la hoja). Por ahí viaja el **contrato**: qué mensajes se mandan y cómo. Ese contrato **no está escrito** para este hardware. Existe de ejemplo el de la guía vieja (del diseño con el TB6612): líneas de texto terminadas en salto de línea, `H` como **latido**, `M <izq> <der>` para velocidades de −100 a 100 y `S` para frenar; el ESP32 frenaba solo si pasaban **300 ms sin latido**. Es una buena plantilla, pero con otros motores, otro bus y otra lógica habrá que escribir el contrato nuevo. La hoja pide un watchdog de **1 s**. Queda por definir (**PENDIENTE (P-23)**): qué mensajes existen para ruedas, elevador, empujador, uña y lecturas; cada cuánto manda el Jetson el latido y a los cuántos milisegundos frena el ESP32; y qué hace el ESP32 cuando se pulsa el paro (capítulo 4, **P-06**).

## Decisión: el ESP32 se programa con PlatformIO

El equipo decidió programar el ESP32 con **PlatformIO**. Es una extensión de **Visual Studio Code** (el editor de código) que compila y sube programas a microcontroladores, usa las mismas librerías del ecosistema **Arduino** y fija las versiones de cada librería dentro del proyecto. Las razones técnicas que respaldan la decisión (**conocimiento general**):

- Existen librerías ya hechas para los componentes del diseño: motores a pasos con aceleración, sensores **VL53L0X**, la IMU **BNO055** y el expansor **PCF8574**.
- El proyecto vive dentro del mismo repositorio de Git, con versiones de librerías reproducibles; con un editor básico de Arduino cada persona podría compilar con versiones distintas.
- Las alternativas se descartaron por costo de aprendizaje o de control: **ESP-IDF** (kit oficial en C, mayor control pero curva alta para una persona con tiempo limitado) y **MicroPython** (más lento y con temporización crítica de pulsos más difícil).

Un archivo de configuración de PlatformIO es de este estilo (**ejemplo genérico; no existe todavía en el repositorio**):

```ini
; platformio.ini  (ejemplo genérico)
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
    ; aquí van las librerías con su versión fija
```

Comandos típicos de PlatformIO, ejecutados en `[Laptop · terminal integrada de VS Code, dentro de la carpeta del proyecto del firmware]` (**no probados para este proyecto**):

```bash
pio run                  # compila
pio run -t upload        # compila y sube al ESP32 conectado por USB
pio device monitor       # abre el monitor serie
```

Si el ESP32 no se deja programar, la causa más común es un cable USB de solo carga o un pin con trampa de arranque (sección anterior).

## Probar sin riesgo

Una guía vieja del equipo lo dejó bien dicho y sigue valiendo: *"Las ruedas no se prueban en el suelo hasta que S y el botón de paro las hayan detenido en el aire."* Secuencia segura que se desprende de la hoja:

1. **Con el robot levantado**, ruedas sin tocar el piso.
2. Prueba de humo de la electrónica de potencia (capítulo 4).
3. Ajustar el **Vref** de cada A4988 **sin motor conectado**.
4. Mover el empujador **a mano** su recorrido de 25 cm y revisar que no roce cables.
5. Primero lógica (USB), después potencia, después movimiento. Un cambio a la vez.

## Controladores de movimiento en la industria

En robots comerciales, el nivel bajo (motores, encoders, seguridad) lo ejecuta un **controlador de movimiento** dedicado y el nivel alto (percepción, planificación) corre en una computadora distinta; se comunican por **CAN bus**, **EtherCAT** o **RS485/Modbus**. Aether usa la misma idea con piezas de laboratorio: ESP32 como controlador de movimiento y RS485 para las ruedas. Y la **seguridad** (paro) siempre se cablea aparte del software.

## Preguntas de repaso: motores y microcontrolador

1. ¿Por qué un ESP32 maneja mejor los pulsos de un motor a pasos que el Jetson?
2. ¿Qué diferencia hay entre STEP, DIR y ENABLE en un A4988?
3. Con 3200 micropasos por vuelta y un piñón que avanza 94.2 mm por vuelta, ¿cuántos pulsos necesita el empujador para recorrer 250 mm?
4. ¿Por qué DE y RE van unidos en el MAX485 y qué significa "half-duplex"?
5. ¿Para qué sirve la resistencia de 10 kΩ en el pin ENABLE al encender el robot?
6. Si el paso real del husillo resulta ser de 2 mm y no de 8 mm, ¿qué parte del programa del elevador cambia y por cuánto?
