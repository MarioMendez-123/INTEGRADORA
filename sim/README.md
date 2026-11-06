# Simulador del carrito Aether

Es el carrito de la guía de armado (rev. 3.21), ya armado y cableado, en 3D y con física. El mismo firmware que va al ESP32 real
se compila para la PC y maneja el carrito virtual: si el programa, el cableado o la energía están mal, falla igual que el real.

## Arrancar (laptop, PowerShell, en la carpeta del repo)

```powershell
python sim\preparar_modelo.py "C:\Users\mende\Downloads\Armado del carrito Aether (1).html"   # una vez por revisión de la guía
backend\.venv\Scripts\python.exe sim\servidor.py
```

Abre http://localhost:8770 en Chrome. El tutorial de la derecha va paso a paso y se marca solo.

Con tu firmware compilado para la PC (`pio run -e native` en `firmware\motor_control`, necesita gcc):

```powershell
backend\.venv\Scripts\python.exe sim\servidor.py --firmware firmware\motor_control\.pio\build\native\program.exe
```

## Qué simula y qué no

| Simula | Cómo |
|---|---|
| Energía | Batería, fusibles de 15 A y 5 A, KCD1, paro NC, relé, XL4005 (5 V), elevador (18 V, con su límite de corriente de ~6 A), regulador de 3.3 V |
| Cables | Los 103 de la placa (sacados de la guía) más el arnés; se cortan, se agregan y se cruzan |
| Daños | Cortos que queman fusibles, más de 3.6 V en un GPIO, polaridad invertida, sobrevoltaje en módulos |
| M0601 | Tramas de 10 bytes con CRC-8/MAXIM, IDs, modo, 50 Hz o rueda libre, freno, curva par-velocidad, bloqueo |
| RS485 | MAX485 con DE/RE, convertidor de nivel, A/B, velocidad en baud |
| Física | 40 kg, adherencia de las llantas (85 N por rueda motriz), rodar, choques con banda, topes y guías en V |
| Sensores | 4 VL53L0X (direcciones I²C y XSHUT), BNO055, paro (GPIO 34), batería (GPIO 39), finales de carrera |
| Cámara | Vista de la C920 a 1.08 m y 6° hacia abajo (solo se ve; todavía no se le pasa a Python) |

No simula todavía: la torre (elevador, empujador, servo, A4988), el detalle registro por registro del I²C,
ruido eléctrico y transitorios. Los capacitores de 100 µF y 1000 µF están conectados, pero no hacen nada aquí: el simulador no modela picos ni el voltaje que sube al frenar. Esa parte se comprueba con la prueba de banco de la guía.
Los valores del motor y de la fricción son estimados: se ajustan cuando midan el carrito real. La constante de par (0.75 N·m/A) y la resistencia (2.15 Ω) son de la hoja del DDSM115, que la guía dice que es el mismo motor.

## Puertos (solo en esta computadora)

- 8770: la página.
- 7700: los pines del ESP32 virtual (ahí se conecta el firmware de la PC).
- 7701: el USB del ESP32 hacia la Jetson (`serial.serial_for_url("socket://localhost:7701")`).

## Pruebas

```powershell
backend\.venv\Scripts\python.exe -m pytest sim\pruebas -q
```

## En el teléfono (corre solo) y como gemelo del carrito real

`sim/web/movil.html` es el mismo simulador pero escrito en JavaScript (`nucleo.js`, `firmware_ref.js`): corre entero en el
navegador, sin la laptop. Trae un firmware de referencia del ESP32 y el programa de la Jetson para la ruta en L, joystick,
deslizadores de física y electricidad, fallas de cableado de un toque, medidas y registro.

**Gemelo**: en la Jetson, con el ESP32 real conectado por USB:

```bash
pip install pyserial websockets          # una vez, dentro del venv
python3 sim/puente_real.py --serie /dev/ttyUSB0
```

Tu programa de navegación abre `socket://localhost:7701` (igual que con el simulador). En el teléfono, en la misma Wi-Fi,
abre `http://IP-DE-LA-JETSON:8771`, pestaña **Gemelo**, **Conectar**. El simulado recibe las mismas órdenes que el real
y la página compara posición, rumbo y batería. La página solo lee: no puede mandarle nada al carrito real.

Líneas que el gemelo entiende (las del diseño de la guía de navegación; **MAN, MOT y PWR son propuestas nuevas** para el gemelo):

| Dirección | Línea |
|---|---|
| Jetson → ESP32 | `HB`, `DRV id dist v rumbo`, `TRN id rumbo wmax`, `APR id dist v frente_cm`, `MAN vIzq vDer`, `STOP`, `VMAX v`, `RES`, `REARME` |
| ESP32 → Jetson | `ODO t_ms sIzq sDer rumbo vIzq vDer`, `MOT rpmIzq rpmDer freno`, `RNG frente izq der pila`, `PWR bateria_mV paro_mV`, `EVT id DONE/BLOCKED/FAULT …` |

Pruebas del núcleo en JavaScript: `node --test sim/pruebas/nucleo_js.test.cjs` (incluye la ruta en L de ida y vuelta).

## Programa de carga y descarga, joystick y casos de obstáculos

- `firmware/motor_control/src/main.cpp`: el programa del ESP32 (DRV, TRN, APR, MAN, odometría, reflejo a 40 cm, paro, latido,
  detección de atasco). Compila para el ESP32 real (`pio run -e esp32dev`, comprobado) y para la PC (`-e native`, necesita gcc;
  **no se ha corrido todavía**).
- `edge/navigation/mision.py`: el programa de la Jetson. `--ruta ida|vuelta|ciclo`. Con el simulador usa
  `--puerto socket://localhost:7701`; con el carrito real, `--puerto /dev/ttyUSB0` (ahí sí necesita pyserial).
- `sim/firmware_ref.py`: el mismo comportamiento del ESP32 escrito en Python. El simulador lo usa solo cuando no le das
  `--firmware`, para que todo funcione sin compilador. Es una copia: si cambias `main.cpp`, cámbialo también aquí.
- Página, pestaña **Misión**: botones de la misión, joystick (mouse, dedo o flechas del teclado) y 5 casos de obstáculos.

Casos de obstáculos (los 5 pasan en simulación): caja que no se quita (frena a ~40 cm, a los 20 s pide ayuda), persona que se
retira (espera y sigue), persona que cruza (frena y sigue), persona en el acople (el ESP32 ve algo antes de donde debería
estar la estación y frena), caja detrás al retroceder (sin sensor trasero: atascado a los 1.5 s).
Pruebas: `python -m pytest sim/pruebas -q` (incluye `test_mision.py`, ~45 s).

Límites que conviene saber: el reflejo solo mira al frente (a los lados y atrás no hay reflejo); el chequeo del acople deja
sin vigilar los últimos ~45 cm antes de la estación, porque ahí el sensor ve las bocas de las guías en V.

## Programar el carrito (pestaña Programar)

Editor de programas en Python para el carrito, con la librería `edge/navigation/carrito.py` (`avanzar`, `retroceder`, `girar_a`,
`ir_a`, `acoplar`, `distancia`, `decir`…; lista completa y reglas de seguridad en `edge/navigation/programas/LEEME.md`).
*Guardar y ejecutar* guarda el archivo en `edge/navigation/programas/` y lo corre contra el simulador; el mismo archivo corre
en la Jetson con `python3 edge/navigation/correr_programa.py <archivo> --puerto /dev/ttyUSB0` (ahí hace falta `pip install pyserial`).
Para compartir programas con la sesión de Claude de la Jetson se usa git (los programas están en el repo).
Pruebas: `sim/pruebas/test_carrito.py`.

Corrección: los 6 fixtures de la guía ya no aparecen pegados al lado del carrito (estaban en su pose final de la animación).

## Dos modos: solo simulación o simulación + ESP32 real

- **Solo simulación** (por omisión): el ESP32 es virtual; no necesitas ningún aparato.
- **Simulación + ESP32 real**: conecta el ESP32 por USB y abre el servidor con `--esp32 COM5` (o `--esp32 auto`; `socket://host:puerto`
  también sirve). Necesita `pyserial` (`pip install pyserial`). En la pestaña *Resumen* cambias de modo. Las órdenes (de programas,
  joystick y misión) llegan al ESP32 simulado **y** al real; los programas ven las lecturas del real. La página compara posición,
  rumbo y batería de los dos. Probado con un ESP32 "real" de mentira por socket; **no con un ESP32 de verdad**.

## Ver cable por cable

*Cables*: lista de los cables de la guía con su voltaje en vivo; al tocar uno, un inspector dice qué voltaje lleva, qué otros pines
están en el mismo punto, para qué sirve y qué pasa si lo cortas. *Señales*: tramas del RS485 decodificadas (TX/RX, CRC, a qué motor
llegaron), un analizador lógico de DE, TX y los XSHUT, y las direcciones I²C. La corriente por cable es una estimación por grupo, no
una medición. Las señales de datos (RS485, I²C) muestran "señal de datos" en vez de un voltaje: no se simulan como voltaje.

## Visión

`vision()` en los programas lee `GET /status` (simulador: `http://localhost:8770/status`; carrito real: el agente del Jetson en
`http://localhost:8001/status`). Mismo formato de obstáculos en los dos. Los ArUco con posición y el detalle por objeto son
**solo del simulador**: el agente real todavía no los calcula.
