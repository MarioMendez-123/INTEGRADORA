# Plan de implementación del carrito

Las etapas van en orden; no saltes una sin decírselo a Mario. **PUERTA** = detente hasta que Mario confirme por escrito.
Nada de esto se ha probado con el carrito real. Los comandos parten de `~/aether`.

## El sistema en un minuto

- **Jetson:** decide y lleva la ruta (`edge/navigation/`), cámara y YOLO (`backend/aether_agent.py`, puerto 8001).
- **ESP32:** ejecuta. Motores M0601 por RS485, odometría a 50 Hz, VL53L0X, BNO055, paro y reflejo a 40 cm. Se habla con la Jetson
  por USB con líneas de texto a 115200. El protocolo está arriba de `firmware/motor_control/src/main.cpp`.
- **Laptop:** servidor, inventario, Lumina y simulador (`sim/`, mismo protocolo). Su IP cambia con la red: 10.4.5.52 (WiFi
  Mecatrónica), 192.168.100.14 (casa), 192.168.55.100 (USB-C).
- **Energía (rev. 3.21):** batería 12 V → fusible 15 A → relé (bobina por el paro NC) → elevador a 18 V (ruedas, con perilla CC a
  ~6 A y capacitor de 1000 µF) y 12 V a los A4988. Batería → **fusible 5 A** → KCD1 → XL4005 a 5 V, Jetson y voltímetro.

## Qué existe y qué falta

| Parte | Estado |
|---|---|
| Firmware de ruedas: DRV, TRN, APR, MAN, HB, STOP, VMAX, RES, REARME, ODO, MOT, RNG, PWR, EVT | Escrito; compila para `esp32dev`; **nunca ha corrido en un ESP32 real** |
| Trama M0601 | Sale de la guía del DDSM115; **falta compararla byte por byte con la hoja del M0601** |
| `carrito.py`, `mision.py`, `correr_programa.py` | Probados solo contra el simulador |
| Agente de visión (`/status`, `/stream`) | Reportado corriendo en la Jetson en una prueba del 23-oct |
| Modelo de piezas | `modelo/parts.pt`, solo clase `pieza_scrap` |
| **Torre: elevador, empujador, uña, finales de carrera** | **NO existe en el firmware.** La carga y descarga de `mision.py` son una pausa |
| **Posición con ArUco** | **NO existe en el carrito real.** El agente solo da el ID |
| **Aviso "listo" a la banda y voz de Lumina** | **NO existe.** `decir()` solo imprime |
| Clase de pieza buena | Pendiente de Mario |

## Etapa 0: preparar la Jetson (sin energía en motores)

1. Corre el diagnóstico. Comprueba rama, commit y que no haya cambios locales.
2. Pregunta a Mario una sola vez y anota en `ESTADO.md`:
   - ¿Qué está armado y cableado? (ruedas, placa, sensores, torre, bandeja)
   - ¿Ya está aplicada la rev. 3.21? (fusible de **5 A**, capacitor de 1000 µF, capacitor de 100 µF en J11, voltímetro)
   - ¿Ya cargó firmware al ESP32? ¿Ya asignó los ID 1 y 2 a los M0601?
   - ¿Tiene multímetro con escala de 10 A? ¿Dónde se puede levantar el carrito con seguridad?
3. Entorno, sin instalar nada aún: `backend/.venv` (`docs/jetson/SETUP_JETSON.md` trae el armado completo, sección 6), `torch.cuda`,
   `import serial`, `groups`. Si falta `pyserial`: `backend/.venv/bin/pip install pyserial`. Si no está en `dialout`:
   `sudo usermod -aG dialout mario` y cerrar sesión.
4. Modelo: `bash jetson_implementacion/herramientas/instalar_modelo.sh`. Debe imprimir `['pieza_scrap']`.
5. Prueba sin hardware del código de navegación: `backend/.venv/bin/python -m pytest sim/pruebas -q` (si falta `pytest`, avísale
   antes de instalarlo). En la laptop dio 25 pasan.

**Listo cuando:** diagnóstico sin faltantes, estado físico anotado, modelo instalado y pruebas corridas.

## Etapa 1: revisión eléctrica sin motores

**PUERTA 1.** Mario, con multímetro, sin ESP32 ni motores conectados, y dictándote cada lectura. Guíalo con
`referencia/conexiones_3.21.md` y la Etapa 11 de `referencia/guia_armado_3.21.md`:

- Fusibles: **15 A** motores, **5 A** lógica. Sin corto entre + y GND de cada rama, antes de energizar.
- XL4005 en **5.0–5.1 V** sin carga; elevador en **18.0 V** sin carga. La perilla CC a ~6 A, o como venía si no se sienten seguros.
- Vref de cada A4988: **0.80 V** (R100) o **0.54 V** (R068), según su resistencia.
- Capacitor de 1000 µF: pata larga a OUT+, franja a OUT−, de 35 V o más. Capacitor de 100 µF en J11 con la franja a GND.
- Voltímetro después del KCD1: se apaga con él y marca lo mismo que el multímetro (±0.2 V).
- Paro: apretado, el NO del relé queda en 0 V.
- Plug de la Jetson: **centro +**, medido antes de conectar.
- Cable USB Jetson ↔ ESP32: de datos, con **VBUS cortado y aislado**. El ESP32 se alimenta solo del XL4005, así que el KCD1 debe
  estar encendido para programarlo.

**Listo cuando:** cada valor está anotado en la bitácora tal como lo dictó Mario.

## Etapa 2: cargar el firmware

**PUERTA 2.** Carrito levantado, paro presionado.

Revisa primero con Mario que nada jale los GPIO 2 y 12, porque impiden programar. Hay dos caminos; ofrece el 1 y usa el 2 si falla:

1. Desde la Jetson (**NO COMPROBADO** en aarch64):
   ```bash
   python3 -m venv ~/.pio-venv && ~/.pio-venv/bin/pip install platformio
   cd ~/aether/firmware/motor_control && ~/.pio-venv/bin/pio run -e esp32dev -t upload --upload-port /dev/ttyUSB0
   ```
2. Desde la laptop (compilar sí se comprobó ahí), en `firmware\motor_control`: `pio run -e esp32dev -t upload`.

**Listo cuando:** al reiniciar se lee `ESP32 listo: sensores ok, IMU ok`. Si dice `CON FALLA`, sigue a la Etapa 3 para ver cuál.

## Etapa 3: solo escuchar

No manda ninguna orden. Carrito levantado:

```bash
backend/.venv/bin/python jetson_implementacion/herramientas/escuchar.py --puerto /dev/ttyUSB0 --segundos 20
```

Comprueba con Mario: el rumbo cambia al girar el carrito a mano; los 3 VL53L0X miden (pon la mano a 10, 30 y 60 cm); batería
~12–13 V; `paro_mV` ~2100 suelto y ~0 presionado.

Si no llegan `ODO`, revisa puerto, baudios y si el ESP32 está energizado, no el código.

## Etapa 4: M0601 con ruedas en el aire

**PUERTA 4.** Carrito levantado, ruedas sin tocar nada, paro en la mano de Mario.

1. Consigue la hoja del M0601 con Mario y compárala con la trama de `sim/nucleo/m0601.py`. La guía dice que es igual a la del
   DDSM115; nadie lo ha verificado. Si difiere, para y propón el cambio.
2. ID: el comando `AA 55 53 ID` se manda **con un solo motor en el bus**. Izquierdo = 1, derecho = 2. El firmware no lo asigna; escribe una
   herramienta pequeña que mande esa trama, y comprueba con una trama de consulta (`74`).
3. `avanzar(0.3)` a baja velocidad, usando `edge/navigation/programas/ejemplo_recta.py` como base.
4. Comprueba: cada rueda gira hacia adelante. **Si una gira al revés**, puede ser el error de compra de dos motores del mismo lado:
   dile a Mario, no lo arregles por software sin preguntar.
5. Prueba de seguridad, en este orden: el paro detiene todo y `REARME` solo funciona con el paro suelto; al desconectar el USB, las
   ruedas se detienen en **menos de 1 s**.

## Etapa 5: medir lo que el simulador solo estima

Anota todo en `docs/jetson/BITACORA_JETSON.md`, sesión nueva, con la salida real pegada.

| Medida | Cómo | Se usa en |
|---|---|---|
| Corriente al arrancar | Multímetro en 10 A a la salida del elevador. El simulador estima ~2.5 A de pico con datos del DDSM115; el límite es ~6 A. | Decidir si hace falta suavizar la aceleración |
| Riel de 18 V al frenar | Multímetro en MAX, frenando desde 0.35 m/s: **menos de 22 V** | Capacitor de 1000 µF |
| Consumo de la lógica | Con la Jetson en carga con YOLO. Debe quedar bien abajo de 5 A; anota el arranque | Fusible de 5 A |
| 5 V con el servo moviéndose | Multímetro en J11: el ESP32 no debe reiniciarse | Capacitor de 100 µF |
| Diámetro de rueda y vía | Rodar una distancia conocida y dar una vuelta medida | `R_RUEDA`, `VIA` en `main.cpp` |
| Deriva del rumbo | Carrito quieto 5 min | Decidir si hace falta corregir |

Si un valor cambia constantes, propón el cambio y aplícalo también en `sim/firmware_ref.py` y `sim/web/firmware_ref.js`.

## Etapa 6: en el piso

**PUERTA 6.** Solo con autorización escrita de Mario, área despejada, paro en su mano y sin carga en la torre.

En orden, cada uno con su reporte: recta de 1 m; distancia de frenado con el paro; giros de 90°; prueba del cuadrado (error
final); reflejo a 40 cm con una caja; caja detrás al retroceder (debe marcar atascado); reversa de 0.6 m.

## Etapa 7: acople y ruta

**PUERTA 7.** Empieza a 5 cm/s frente a la banda, sin fixtures.

1. `acoplar()` en las guías en V hasta los topes. Comprobar: ventana centrada (±5 mm) y a menos de 1 cm de la tapa.
2. `mision.py --ruta ida` y `--ruta vuelta`, luego `--ruta ciclo`. Llegada a la banda con menos de ±5 cm de error lateral.
3. `edge/navigation/programas/ejemplo_ciclo.py` como base para los programas de Mario. Guárdalos en esa carpeta: él los abre en la
   pestaña *Programar* del simulador.

Límite conocido: el chequeo del acople deja sin vigilar los últimos ~45 cm, porque el sensor ve las bocas de las guías en V.

## Etapa 8: la torre (código nuevo, lo más grande)

No escribas código hasta que Mario apruebe la propuesta. Propón por escrito las órdenes y eventos nuevos; por ejemplo: home, mover
elevador a una altura, mover empujador, uña arriba/abajo, y el estado de los finales. Una vez aprobada, agrégala al firmware y a las
copias del simulador.

**Datos de la guía** (ver `referencia/`; lo marcado con ~ es de diseño y se mide):

| Eje | Pines | Conversión |
|---|---|---|
| Elevador (2 NEMA, STEP y DIR compartidos) | STEP 25, DIR 26 | 1/16 = 3200 pasos/vuelta. Husillo TR8 de 1 entrada: **2 mm/vuelta, a verificar** ("una vuelta de la tuerca = 2 mm") → 1600 pasos/mm |
| Empujador | STEP 27, DIR 14 | Piñón m1.5 de 20 dientes: 94.25 mm/vuelta → ~34 pasos/mm; 80 mm/s; carrera 25 cm |
| ENABLE, los 3 drivers | GPIO 13 | 0 = fuerza, 1 = sueltos. Pull-up de 10 kΩ: sueltos al arrancar |
| Uña (MG90S) | PWM en GPIO 5 | 5 V del XL4005. Ángulos de acostada y colgada: medirlos |
| Final home izq / der / carro | GPIO 18 / 19 / 23 | NC, `INPUT_PULLUP`. Suelto lee 0; presionado o sin cable lee 1 |
| Final superior | GPIO 35 | NC, con pull-up externo de 10 kΩ (solo entrada). Abre a 83.15 cm |
| VL53L0X de la pila | I²C 0x33 | Confirma que hay fixture |

| Altura | Valor |
|---|---|
| Cinta | 82.15 cm |
| Home del elevador (la plataforma pisa el final) | 38.35 cm |
| Plataforma para cargar (3 mm bajo la cinta) | 81.85 cm |
| Nivel de la pila | 7.0 cm por fixture; 6 fixtures |

**Reglas de seguridad que el código debe cumplir:**

- Si lee un final como presionado, ese eje se detiene. Un cable roto se lee igual: es a propósito.
- Paro (`PARO_MV_PRESIONADO`): `FALLA_PARO`, velocidad 0, ENABLE en 1, home perdido. Solo sale con `REARME` + home. La plataforma no debe caer.
- Sin home válido, el elevador y el empujador no se mueven, salvo el propio home.
- Generar pulsos sin frenar las tramas de 50 Hz a los M0601: el ciclo espera hasta 6 ms por motor. Usa un timer o una tarea aparte, y comprueba
  que los M0601 no suelten la rueda.

**Secuencias:**

- **Carga, con la cinta corriendo:** acoplar → home de elevador y empujador → plataforma a 81.85 cm → avisar "listo" → el fixture cae ~6 cm afuera de la
  ventana → bajar uña → empujador jala ~7.6 cm → aflojar → subir uña → empujador a home → plataforma baja 7.0 cm → "listo" para el siguiente. Un
  fixture a la vez, ~15 s por ciclo. El VL53L0X de la pila confirma.
- **Descarga:** acoplar → home del elevador → subir por pasos hasta que la base del fixture de arriba quede 2 mm sobre la banda → empujador avanza 25 cm
  y regresa → confirmar ventana vacía → subir un nivel → repetir → volver a la banda.

**Orden de pruebas (PUERTA 8 en cada una, motor por motor):** ENABLE sin movimiento → home del empujador, lento y con una mano en el paro → carrera de 25 cm
→ uña sin fixture → home del elevador, comprobando con Mario que los 2 husillos van parejos → subir y bajar sin carga → un fixture vacío → uno con ECU → 6.

**Conectar y desconectar NEMA solo con el driver apagado.**

Al terminar, cambia la pausa de `mision.py` por la secuencia real.

## Etapa 9: visión

1. `cp scripts/jetson/aether-agent.env.example ~/.aether-agent.env` y pon `AETHER_LAPTOP_URL` con la IP de la laptop en esa red.
2. `bash scripts/jetson/iniciar-agente.sh`, y `python3 scripts/probar_agente.py http://localhost:8001 --segundos 15`. Anota el modo de `nvpmodel` junto a los FPS.
3. Repite FPS, exposición y calidad con buena luz y la cámara en su lugar: las pruebas de octubre fueron en un cuarto oscuro y no valen.
4. `/status` en el carrito real: comprueba `vision()` y `hay_persona()` con `ejemplo_vision.py`.
5. **Nuevo, a proponer:** calcular la posición de cada ArUco en el agente (calibrar la C920, `cv2.aruco`). Hoy los programas no deben depender de `arucos`.
   La cámara está a 1.077 m del piso. Sirve para confirmar el acople.
6. Reconocimiento de la pieza: hoy solo `pieza_scrap`. Comprueba que un fixture del dataset salga como `pieza_scrap` y que los obstáculos no lleguen al inventario.
   Mide también cuánto marca cosas que no son pieza (banda vacía, manos, el carrito): en imágenes de archivo marcó 4 de 14, todas renders 3D del carrito.
   **No esperes PASS** hasta que Mario entrene la clase buena.

## Etapa 10: unir la línea

A proponer con Mario, porque no está diseñado: cómo llega el aviso "listo" del carrito a la banda; `decir()` hacia la voz de Lumina en la laptop; y el conteo de
fixtures hacia el inventario. Los contratos actuales están en `contracts/agents_api.md`.

Prueba final: ciclo completo con 6 fixtures, banda → descarga → banda.

## Cuando Mario entregue el dataset bueno

1. En la laptop agrega la clase (por ejemplo `pieza_buena`) en `/dataset.html`, debajo de `pieza_scrap`. Una clase sin "scrap" en el nombre da PASS.
   Agrega también fotos sin pieza, sin etiqueta (banda vacía, manos, el carrito): sin ellas el modelo tiende a marcar cualquier cosa.
2. `python train_parts.py` en `edge/perception`. Como cambian las clases, parte de `yolov8n.pt` y se publica aunque el mAP baje.
3. Vuelve a copiar `parts.pt` a este paquete y a la Jetson. Para la Pi, reexporta el ONNX con `imgsz=320`.
