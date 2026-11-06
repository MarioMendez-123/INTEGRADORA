# Conexiones del carrito (guía rev. 3.21)

> Generado de la guía de armado rev. 3.21 (5-nov-2026). No editar a mano: si la guía cambia, se vuelve a generar en la laptop.

## GPIO del ESP32 que usa cada función

| GPIO | Va a | Para qué |
|---|---|---|
| 4 | MAX485 · DE | DE+RE: en 1 el MAX485 habla, en 0 escucha. El ESP32 lo cambia en cada mensaje. |
| 5 | J11 · SIG | Señal PWM del MG90S (cable naranja del servo). |
| 13 | A4988 #1 · ENABLE | ENABLE: en 0 los motores tienen fuerza; en 1 quedan sueltos. Un solo pin para los 3 drivers. |
| 14 | A4988 #3 · DIR | DIR del empujador: adelante o atrás. |
| 15 | J6 · X2 | GPIO 15 apaga y prende el VL53L0X lateral derecho. Al arrancar el programa los 3 se apagan (LOW), al de la pila (sin XSHUT) se le cambia la dirección y luego se prenden uno por uno: este queda en 0x32. GPIO 15 es pin de arranque: el pull-up del propio sensor lo deja en alto, que es su valor normal. |
| 16 | Convertidor · LV1 | Ya a 3.3 V, la respuesta de los motores entra al GPIO 16. |
| 17 | MAX485 · DI | DI = lo que el ESP32 manda a los motores. El MAX485 entiende 3.3 V, va directo. |
| 18 | J4 · FC1 | Final de carrera del elevador izquierdo (contacto NC). INPUT_PULLUP: un cable roto se lee como "presionado" y el motor se detiene. |
| 19 | J4 · FC2 | Final de carrera del elevador derecho (NC). |
| 21 | J5 · SDA | SDA (datos) del bus I²C hacia los VL53L0X. |
| 22 | J5 · SCL | SCL (reloj) del bus I²C. |
| 23 | J4 · FC3 | Final de carrera de home del empujador (NC). |
| 25 | A4988 #1 · STEP | Cada pulso en STEP es un micropaso del elevador. |
| 26 | A4988 #1 · DIR | DIR decide si el elevador sube o baja. |
| 27 | A4988 #3 · STEP | STEP del empujador (su propio driver). |
| 32 | J6 · X0 | GPIO 32 apaga y prende el VL53L0X frontal. Al arrancar el programa los 3 se apagan (LOW), al de la pila (sin XSHUT) se le cambia la dirección y luego se prenden uno por uno: este queda en 0x30. |
| 33 | J6 · X1 | GPIO 33 apaga y prende el VL53L0X lateral izquierdo. Al arrancar el programa los 3 se apagan (LOW), al de la pila (sin XSHUT) se le cambia la dirección y luego se prenden uno por uno: este queda en 0x31. |
| 34 | R 20 kΩ (paro) · pata 1 | Punto medio al GPIO 34 (solo entrada). El programa lo lee con analogReadMilliVolts: si baja de ~1 V es que apretaron el paro → FALLA_PARO (velocidad 0, ENABLE en 1, home perdido). Para salir: soltar el paro, REARME y home. |
| 35 | R 10 kΩ (FC4) · pata 1 | Al GPIO 35. Es solo entrada y no tiene pull-up interno: por eso la 10 kΩ externa. Si se abre (tope o cable roto) lee 1 y el elevador no sube más. |
| 39 | R 20 kΩ · pata 1 | El medio del divisor al GPIO 39 (solo entrada analógica). Voltaje real = analogReadMilliVolts(39) × 6 / 1000 (usa la calibración de fábrica del ADC); revísenlo una vez contra el multímetro. |

## Cables de la placa

### Potencia de los drivers (12 V)

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 1 | J1 · +12V | A4988 #3 · VMOT | rojo | Lleva los 12 V del relé (rama de motores) al primer driver. Los otros dos se alimentan en cadena. |
| 2 | A4988 #3 · VMOT | A4988 #2 · VMOT | rojo | Cadena de 12 V: del VMOT del #3 al VMOT del #2. |
| 3 | A4988 #2 · VMOT | A4988 #1 · VMOT | rojo | Cadena de 12 V: del VMOT del #2 al VMOT del #1. |
| 4 | J1 · GND | A4988 #3 · GND (junto a VMOT) | negro | Tierra de potencia del primer driver; regresa a la batería por J1. |
| 5 | A4988 #3 · GND (junto a VMOT) | A4988 #2 · GND (junto a VMOT) | negro | Cadena de tierra de potencia. |
| 6 | A4988 #2 · GND (junto a VMOT) | A4988 #1 · GND (junto a VMOT) | negro | Cadena de tierra de potencia. |
| 7 | 100 µF #1 · pata + (larga) | A4988 #1 · VMOT | rojo | Pata larga (+) del capacitor al VMOT del A4988 #1. Absorbe el pico de voltaje al arrancar el motor; sin él el driver se puede quemar. |
| 8 | 100 µF #1 · pata − (franja) | A4988 #1 · GND (junto a VMOT) | negro | Pata de la franja (−) a la tierra de potencia del #1. Al revés, el capacitor se infla o revienta. |
| 9 | 100 µF #2 · pata + (larga) | A4988 #2 · VMOT | rojo | Pata larga (+) del capacitor al VMOT del A4988 #2. Absorbe el pico de voltaje al arrancar el motor; sin él el driver se puede quemar. |
| 10 | 100 µF #2 · pata − (franja) | A4988 #2 · GND (junto a VMOT) | negro | Pata de la franja (−) a la tierra de potencia del #2. Al revés, el capacitor se infla o revienta. |
| 11 | 100 µF #3 · pata + (larga) | A4988 #3 · VMOT | rojo | Pata larga (+) del capacitor al VMOT del A4988 #3. Absorbe el pico de voltaje al arrancar el motor; sin él el driver se puede quemar. |
| 12 | 100 µF #3 · pata − (franja) | A4988 #3 · GND (junto a VMOT) | negro | Pata de la franja (−) a la tierra de potencia del #3. Al revés, el capacitor se infla o revienta. |

### Lógica de los drivers (3.3 V y GND)

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 13 | ESP32 · 3V3 | A4988 #3 · VDD | rosa | VDD es la alimentación de la lógica del driver: 3.3 V del ESP32, nunca 5 V (con 5 V no entiende las señales de 3.3 V). |
| 14 | A4988 #3 · VDD | A4988 #2 · VDD | rosa | Cadena de 3.3 V entre drivers, por debajo de los zócalos. |
| 15 | A4988 #2 · VDD | A4988 #1 · VDD | rosa | Cadena de 3.3 V entre drivers. |
| 16 | ESP32 · GND | A4988 #1 · GND (junto a VDD) | negro | Tierra de la lógica: une el GND del ESP32 con el de los drivers. Sin tierra común las señales no llegan. |
| 17 | A4988 #1 · GND (junto a VDD) | A4988 #2 · GND (junto a VDD) | negro | Cadena de tierra de lógica. |
| 18 | A4988 #2 · GND (junto a VDD) | A4988 #3 · GND (junto a VDD) | negro | Cadena de tierra de lógica. |

### Configuración de cada driver

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 19 | A4988 #1 · MS1 | A4988 #1 · MS3 | alambre desnudo | Puente de alambre desnudo que toca MS1, MS2 y MS3 del #1 (los 3 pines seguidos). |
| 20 | A4988 #1 · MS3 | A4988 #1 · VDD | rosa | MS1–MS3 a 3.3 V = micropaso 1/16: el motor se mueve más suave y silencioso. Por eso 3200 pasos = 1 vuelta. |
| 21 | A4988 #1 · RESET | A4988 #1 · SLEEP | alambre desnudo | RESET y SLEEP del #1 puenteados: así el driver nunca se duerme ni se queda en reset. |
| 22 | A4988 #2 · MS1 | A4988 #2 · MS3 | alambre desnudo | Puente de alambre desnudo que toca MS1, MS2 y MS3 del #2 (los 3 pines seguidos). |
| 23 | A4988 #2 · MS3 | A4988 #2 · VDD | rosa | MS1–MS3 a 3.3 V = micropaso 1/16: el motor se mueve más suave y silencioso. Por eso 3200 pasos = 1 vuelta. |
| 24 | A4988 #2 · RESET | A4988 #2 · SLEEP | alambre desnudo | RESET y SLEEP del #2 puenteados: así el driver nunca se duerme ni se queda en reset. |
| 25 | A4988 #3 · MS1 | A4988 #3 · MS3 | alambre desnudo | Puente de alambre desnudo que toca MS1, MS2 y MS3 del #3 (los 3 pines seguidos). |
| 26 | A4988 #3 · MS3 | A4988 #3 · VDD | rosa | MS1–MS3 a 3.3 V = micropaso 1/16: el motor se mueve más suave y silencioso. Por eso 3200 pasos = 1 vuelta. |
| 27 | A4988 #3 · RESET | A4988 #3 · SLEEP | alambre desnudo | RESET y SLEEP del #3 puenteados: así el driver nunca se duerme ni se queda en reset. |

### Señales STEP, DIR y ENABLE

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 28 | ESP32 · GPIO 25 | A4988 #1 · STEP | verde | Cada pulso en STEP es un micropaso del elevador. |
| 29 | A4988 #1 · STEP | A4988 #2 · STEP | verde | Los 2 drivers del elevador comparten STEP: los 2 motores dan exactamente los mismos pasos. |
| 30 | ESP32 · GPIO 26 | A4988 #1 · DIR | azul | DIR decide si el elevador sube o baja. |
| 31 | A4988 #1 · DIR | A4988 #2 · DIR | azul | DIR compartido: los 2 husillos giran hacia el mismo lado. |
| 32 | ESP32 · GPIO 27 | A4988 #3 · STEP | verde | STEP del empujador (su propio driver). |
| 33 | ESP32 · GPIO 14 | A4988 #3 · DIR | azul | DIR del empujador: adelante o atrás. |
| 34 | ESP32 · GPIO 13 | A4988 #1 · ENABLE | café | ENABLE: en 0 los motores tienen fuerza; en 1 quedan sueltos. Un solo pin para los 3 drivers. |
| 35 | A4988 #1 · ENABLE | A4988 #2 · ENABLE | café | Cadena de ENABLE. |
| 36 | A4988 #2 · ENABLE | A4988 #3 · ENABLE | café | Cadena de ENABLE. |
| 37 | A4988 #3 · ENABLE | R 10 kΩ · pata 1 | café | La resistencia de 10 kΩ deja ENABLE en 1 (motores sueltos) mientras el ESP32 arranca: no hay movimientos raros al encender. |
| 38 | R 10 kΩ · pata 2 | ESP32 · 3V3 | rosa | La otra pata de la 10 kΩ va a 3.3 V. |

### Bobinas de los motores a sus borneras

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 39 | A4988 #1 · 1A | J7 · 1A | gris | Salida 1A del A4988 #1 a la bornera J7 (elevador izquierdo). Bobina A: 1A y 1B. |
| 40 | A4988 #1 · 1B | J7 · 1B | gris | Salida 1B del A4988 #1 a la bornera J7 (elevador izquierdo). Bobina A: 1A y 1B. |
| 41 | A4988 #1 · 2A | J7 · 2A | turquesa | Salida 2A del A4988 #1 a la bornera J7 (elevador izquierdo). Bobina B: 2A y 2B. |
| 42 | A4988 #1 · 2B | J7 · 2B | turquesa | Salida 2B del A4988 #1 a la bornera J7 (elevador izquierdo). Bobina B: 2A y 2B. |
| 43 | A4988 #2 · 1A | J8 · 1A | gris | Salida 1A del A4988 #2 a la bornera J8 (elevador derecho). Bobina A: 1A y 1B. |
| 44 | A4988 #2 · 1B | J8 · 1B | gris | Salida 1B del A4988 #2 a la bornera J8 (elevador derecho). Bobina A: 1A y 1B. |
| 45 | A4988 #2 · 2A | J8 · 2A | turquesa | Salida 2A del A4988 #2 a la bornera J8 (elevador derecho). Bobina B: 2A y 2B. |
| 46 | A4988 #2 · 2B | J8 · 2B | turquesa | Salida 2B del A4988 #2 a la bornera J8 (elevador derecho). Bobina B: 2A y 2B. |
| 47 | A4988 #3 · 1A | J9 · 1A | gris | Salida 1A del A4988 #3 a la bornera J9 (empujador). Bobina A: 1A y 1B. |
| 48 | A4988 #3 · 1B | J9 · 1B | gris | Salida 1B del A4988 #3 a la bornera J9 (empujador). Bobina A: 1A y 1B. |
| 49 | A4988 #3 · 2A | J9 · 2A | turquesa | Salida 2A del A4988 #3 a la bornera J9 (empujador). Bobina B: 2A y 2B. |
| 50 | A4988 #3 · 2B | J9 · 2B | turquesa | Salida 2B del A4988 #3 a la bornera J9 (empujador). Bobina B: 2A y 2B. |

### Alimentación de 5 V

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 51 | J2 · +5V | ESP32 · 5V | naranja | El ESP32 se alimenta por su pin 5V desde el XL4005 (no por la computadora). |
| 52 | J2 · +5V | Convertidor · HV | naranja | HV es el lado de 5 V del convertidor de nivel. |
| 53 | Convertidor · HV | MAX485 · VCC | naranja | El MAX485 trabaja a 5 V. |
| 54 | J2 · GND | ESP32 · GND | negro | Tierra del XL4005 al ESP32. |
| 55 | J2 · +5V | J11 · +5V | naranja | 5 V del servo: del XL4005, nunca del ESP32 (al moverse jala corriente y reinicia la placa). |
| 56 | J2 · GND | J11 · GND | negro | Tierra del servo. |

### 3.3 V y GND de los módulos

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 57 | ESP32 · 3V3 | Convertidor · LV | rosa | LV es el lado de 3.3 V del convertidor. |
| 58 | ESP32 · GND | Convertidor · GND | negro | Tierra del convertidor (sus 2 GND están unidos por dentro). |
| 59 | Convertidor · GND | MAX485 · GND | negro | Tierra del MAX485. |
| 60 | MAX485 · GND | J3 · GND | negro | La tierra viaja junto con A y B hasta los motores (pin 1 de su conector de señal). |
| 61 | ESP32 · 3V3 | J5 · 3V3 | rosa | 3.3 V para los 4 VL53L0X. |
| 62 | ESP32 · GND | J5 · GND | negro | Tierra de los sensores I²C. |
| 63 | J5 · 3V3 | BNO055 · VCC | rosa | 3.3 V para la IMU (su VCC acepta 3.3–6 V; a 3.3 V su SDA/SCL quedan a 3.3 V, como el ESP32). |
| 64 | J5 · GND | BNO055 · GND | negro | Tierra de la IMU. |
| 65 | J5 · GND | J4 · GND1 | negro | Tierra del final de carrera 1 (su COM). |
| 66 | J4 · GND1 | J4 · GND2 | negro | Tierra del final de carrera 2. |
| 67 | J4 · GND2 | J4 · GND3 | negro | Tierra del final de carrera 3. |

### RS485 (MAX485 y convertidor de nivel)

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 68 | ESP32 · GPIO 17 | MAX485 · DI | morado | DI = lo que el ESP32 manda a los motores. El MAX485 entiende 3.3 V, va directo. |
| 69 | ESP32 · GPIO 4 | MAX485 · DE | morado | DE+RE: en 1 el MAX485 habla, en 0 escucha. El ESP32 lo cambia en cada mensaje. |
| 70 | MAX485 · DE | MAX485 · RE | alambre desnudo | DE y RE puenteados: un solo pin decide si habla o escucha. |
| 71 | MAX485 · RO | Convertidor · HV1 | morado | RO = lo que contestan los motores, sale a 5 V: pasa por el convertidor antes de llegar al ESP32. |
| 72 | Convertidor · LV1 | ESP32 · GPIO 16 | morado | Ya a 3.3 V, la respuesta de los motores entra al GPIO 16. |
| 73 | MAX485 · A | J3 · A | celeste | Línea A del bus RS485 hacia los 2 motores. |
| 74 | MAX485 · B | J3 · B | verde limón | Línea B del bus. Si los motores no contestan, se invierten A y B. |

### Bus I²C (SDA y SCL)

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 75 | ESP32 · GPIO 21 | J5 · SDA | amarillo | SDA (datos) del bus I²C hacia los VL53L0X. |
| 76 | ESP32 · GPIO 22 | J5 · SCL | blanco | SCL (reloj) del bus I²C. |
| 77 | J5 · SDA | BNO055 · SDA | amarillo | La BNO055 también va al bus I²C (dirección 0x28). |
| 78 | J5 · SCL | BNO055 · SCL | blanco | Reloj de la BNO055. |

### XSHUT de los VL53L0X (directo del ESP32)

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 79 | ESP32 · GPIO 32 | J6 · X0 | verde olivo | GPIO 32 apaga y prende el VL53L0X frontal. Al arrancar el programa los 3 se apagan (LOW), al de la pila (sin XSHUT) se le cambia la dirección y luego se prenden uno por uno: este queda en 0x30. |
| 80 | ESP32 · GPIO 33 | J6 · X1 | verde olivo | GPIO 33 apaga y prende el VL53L0X lateral izquierdo. Al arrancar el programa los 3 se apagan (LOW), al de la pila (sin XSHUT) se le cambia la dirección y luego se prenden uno por uno: este queda en 0x31. |
| 81 | ESP32 · GPIO 15 | J6 · X2 | verde olivo | GPIO 15 apaga y prende el VL53L0X lateral derecho. Al arrancar el programa los 3 se apagan (LOW), al de la pila (sin XSHUT) se le cambia la dirección y luego se prenden uno por uno: este queda en 0x32. GPIO 15 es pin de arranque: el pull-up del propio sensor lo deja en alto, que es su valor normal. |

### Finales de carrera

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 82 | ESP32 · GPIO 18 | J4 · FC1 | beige | Final de carrera del elevador izquierdo (contacto NC). INPUT_PULLUP: un cable roto se lee como "presionado" y el motor se detiene. |
| 83 | ESP32 · GPIO 19 | J4 · FC2 | beige | Final de carrera del elevador derecho (NC). |
| 84 | ESP32 · GPIO 23 | J4 · FC3 | beige | Final de carrera de home del empujador (NC). |

### Divisor para medir la batería

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 85 | J2 · +12V AUX | R 100 kΩ · pata 1 | rojo | 12 V de la rama auxiliar (siempre encendida) a la resistencia de 100 kΩ. Nunca 12 V directo a un GPIO. |
| 86 | R 100 kΩ · pata 2 | R 20 kΩ · pata 1 | alambre desnudo | Une la 100 kΩ con la 20 kΩ: ese punto es el "medio" del divisor (14.4 V → 2.4 V). |
| 87 | R 20 kΩ · pata 1 | C 100 nF · pata 1 | alambre desnudo | El capacitor de 100 nF va del medio del divisor a GND, en paralelo con la 20 kΩ: quita el ruido de la lectura. |
| 88 | R 20 kΩ · pata 2 | C 100 nF · pata 2 | negro | La otra pata del capacitor, a la tierra del divisor. |
| 89 | R 20 kΩ · pata 2 | ESP32 · GND | negro | La 20 kΩ va a GND. |
| 90 | R 20 kΩ · pata 1 | ESP32 · GPIO 39 | verde olivo | El medio del divisor al GPIO 39 (solo entrada analógica). Voltaje real = analogReadMilliVolts(39) × 6 / 1000 (usa la calibración de fábrica del ADC); revísenlo una vez contra el multímetro. |

### Servo de la uña

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 91 | ESP32 · GPIO 5 | J11 · SIG | magenta | Señal PWM del MG90S (cable naranja del servo). |

### Lectura del paro (GPIO 34)

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 92 | J13 · PARO | R 100 kΩ (paro) · pata 1 | rojo | Llega el VCC del relé, después del paro (cable C23). Con el paro suelto hay 12–14.4 V; apretado, 0 V. Va a la 100 kΩ, nunca directo al GPIO. |
| 93 | R 100 kΩ (paro) · pata 2 | R 20 kΩ (paro) · pata 1 | alambre desnudo | Une la 100 kΩ con la 20 kΩ: el punto medio del divisor del paro (14.4 V → 2.4 V), igual que el de la batería. |
| 94 | R 20 kΩ (paro) · pata 1 | C 100 nF (paro) · pata 1 | alambre desnudo | El 100 nF va del punto medio a GND, en paralelo con la 20 kΩ: filtra el ruido de los motores. |
| 95 | R 20 kΩ (paro) · pata 2 | C 100 nF (paro) · pata 2 | negro | La otra pata del capacitor, a la tierra del divisor. |
| 96 | R 20 kΩ (paro) · pata 2 | R 20 kΩ · pata 2 | negro | La 20 kΩ del paro va a la misma tierra que el divisor de la batería. |
| 97 | R 20 kΩ (paro) · pata 1 | ESP32 · GPIO 34 | verde olivo | Punto medio al GPIO 34 (solo entrada). El programa lo lee con analogReadMilliVolts: si baja de ~1 V es que apretaron el paro → FALLA_PARO (velocidad 0, ENABLE en 1, home perdido). Para salir: soltar el paro, REARME y home. |

### Final de carrera superior (GPIO 35)

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 98 | J13 · FC4 | R 10 kΩ (FC4) · pata 1 | beige | NC del final superior (cable C22). Con la plataforma abajo de 83.0 cm está cerrado y el GPIO lee 0. |
| 99 | R 10 kΩ (FC4) · pata 1 | ESP32 · GPIO 35 | beige | Al GPIO 35. Es solo entrada y no tiene pull-up interno: por eso la 10 kΩ externa. Si se abre (tope o cable roto) lee 1 y el elevador no sube más. |
| 100 | R 10 kΩ (FC4) · pata 2 | R 10 kΩ · pata 2 | rosa | La otra pata de la 10 kΩ a 3.3 V (la misma pata de 3.3 V de la resistencia de ENABLE). |
| 101 | J13 · GND4 | J4 · GND3 | negro | COM del final superior a GND: se toma de la tierra de J4. |

### Capacitor del servo (rev. 3.17d)

| # | De | A | Color | Para qué |
|---|---|---|---|---|
| 102 | C 100 µF del servo · pata − (franja) | J11 · GND | alambre desnudo | Pata de la franja (−) del capacitor a GND del servo. Va por abajo con la misma pata del capacitor doblada: no hace falta otro cable. |
| 103 | C 100 µF del servo · pata + (larga) | J11 · +5V | alambre desnudo | Pata larga (+) a +5V del servo, también por abajo. El capacitor da la corriente de los arranques del MG90S y así no baja el voltaje del ESP32. |

## Arnés (cables fuera de la placa)

### Fusible 15 A → relé COM

- Calibre: 14 AWG
- De Fusible 15 A · salida a Relé · COM; color rojo
- Por qué: La rama principal (motores) entra al contacto COM del relé.

### Relé NO → elevador IN+

- Calibre: 14 AWG
- De Relé · NO a Elevador · IN+; color rojo
- Por qué: Con el relé cerrado, los 12 V llegan al elevador que da los 18 V de las ruedas.

### Relé NO → J1 (12 V de los drivers)

- Calibre: 18 AWG
- De Relé · NO a J1 · +12V; color rojo
- Por qué: Del mismo contacto NO salen los 12 V de los A4988: el paro también los corta.

### Fusible 5 A → XL4005 IN+ (rama auxiliar)

- Calibre: 18 AWG
- De Fusible 5 A · salida a XL4005 · IN+ (12 V aux); color rojo
- Por qué: Rama auxiliar: lógica, Jetson y relé. En la Etapa 13 se le intercala el interruptor KCD1.

### XL4005 IN+ → J2 (12 V para medir)

- Calibre: 22 AWG
- De XL4005 · IN+ (12 V aux) a J2 · +12V AUX; color rojo
- Por qué: Solo para el divisor que mide la batería; casi no lleva corriente.

### XL4005 OUT+ → J2 (+5 V)

- Calibre: 20 AWG
- De XL4005 · OUT+ (5 V) a J2 · +5V; color naranja
- Por qué: 5 V para el ESP32, el MAX485 y el servo. Ajusten antes el XL4005 a 5.0–5.1 V.

### XL4005 OUT− → J2 (GND)

- Calibre: 20 AWG
- De XL4005 · OUT− a J2 · GND; color negro
- Por qué: Tierra de la lógica.

### Elevador IN− → XL4005 IN− (GND común)

- Calibre: 14 AWG
- De Elevador · IN− a XL4005 · IN−; color negro
- Por qué: Todas las tierras unidas: batería −, elevador, XL4005, drivers y ESP32.

### Elevador IN− → J1 (GND de los drivers)

- Calibre: 18 AWG
- De Elevador · IN− a J1 · GND; color negro
- Por qué: Regreso de la corriente de los 3 motores a pasos.

### XL4005 IN− → relé GND

- Calibre: 22 AWG
- De XL4005 · IN− a Relé · GND; color negro
- Por qué: Tierra de la bobina del módulo relé.

### C24 · XL4005 IN+ → voltímetro (+)

- Calibre: 22 AWG
- De XL4005 · IN+ (12 V aux) a Voltímetro · rojo (+); color rojo
- Por qué: Rev. 3.17d: el voltímetro toma el voltaje después del KCD1, así se apaga con el carrito y no gasta batería.

### C24 · voltímetro (−) → XL4005 IN−

- Calibre: 22 AWG
- De Voltímetro · negro (−) a XL4005 · IN−; color negro
- Por qué: Tierra del voltímetro.

### Puente IN → VCC del relé

- Calibre: alambre
- De Relé · IN a Relé · VCC (bobina); color alambre desnudo
- Por qué: La entrada IN se deja fija en el nivel que activa el relé (con el jumper en H, a VCC). Así el relé solo depende del paro.

### Batería + → XT60 → fusibles

- Calibre: 14 AWG
- Puntas: Batería · borne + ↔ Fusibles 15 A y 5 A · entradas
- rojo: Borne + (terminal de ojillo) → XT60 hembra; del macho, a la entrada de los 2 portafusibles
- Por qué: El fusible va lo más cerca posible de la batería: si algo hace corto, se quema el fusible y no el cable.

### Batería − → GND común

- Calibre: 14 AWG
- Puntas: Batería · borne − ↔ Elevador · IN− (punto de tierra común)
- negro: Borne − → XT60 → IN− del elevador, de donde salen las demás tierras
- Por qué: Todas las tierras se unen en un solo punto.

### KCD1 en la rama auxiliar

- Calibre: 18 AWG
- Puntas: Fusible 5 A · salida ↔ Interruptor KCD1 → XL4005 · IN+
- rojo: Fusible 5 A → una pata del KCD1
- rojo: Otra pata del KCD1 → IN+ del XL4005 (y de ahí Jetson, paro y medición)
- Por qué: El KCD1 prende y apaga toda la lógica y el Jetson.

### Elevador → M0601 izquierdo (18 V)

- Calibre: 16–18 AWG
- Puntas: Elevador · OUT+ / OUT− ↔ M0601 izquierdo · conector de potencia
- naranja (+18 V): OUT+ → pin 1 del conector de potencia
- negro: OUT− → pin 2
- Por qué: Las ruedas trabajan a 18 V. Midan 18.0 V sin carga antes de conectar.

### RS485 → M0601 izquierdo

- Calibre: 22 AWG trenzado
- Puntas: J3 (A, B, GND) ↔ M0601 izquierdo · conector de señal
- celeste: J3 A → pin 2 (A)
- verde limón: J3 B → pin 3 (B)
- negro: J3 GND → pin 1 (GND)
- Por qué: Los 2 motores cuelgan del mismo bus: cada uno tiene su ID (1 y 2). Trencen A con B.

### Elevador → M0601 derecho (18 V)

- Calibre: 16–18 AWG
- Puntas: Elevador · OUT+ / OUT− ↔ M0601 derecho · conector de potencia
- naranja (+18 V): OUT+ → pin 1 del conector de potencia
- negro: OUT− → pin 2
- Por qué: Las ruedas trabajan a 18 V. Midan 18.0 V sin carga antes de conectar.

### RS485 → M0601 derecho

- Calibre: 22 AWG trenzado
- Puntas: J3 (A, B, GND) ↔ M0601 derecho · conector de señal
- celeste: J3 A → pin 2 (A)
- verde limón: J3 B → pin 3 (B)
- negro: J3 GND → pin 1 (GND)
- Por qué: Los 2 motores cuelgan del mismo bus: cada uno tiene su ID (1 y 2). Trencen A con B.

### NEMA del elevador izquierdo → J7

- Calibre: cable del motor (1 m)
- Puntas: NEMA 17 del elevador izquierdo ↔ J7 (2B, 2A, 1A, 1B)
- bobina A (p. ej. negro y verde): → J7 1A y 1B
- bobina B (p. ej. rojo y azul): → J7 2A y 2B
- Por qué: Busquen las bobinas con el multímetro: los 2 cables con ~1.5 Ω entre sí son una bobina. Si el motor gira al revés, volteen solo una bobina. Nunca se conecta con el driver prendido.

### NEMA del elevador derecho → J8

- Calibre: cable del motor (1 m)
- Puntas: NEMA 17 del elevador derecho ↔ J8 (2B, 2A, 1A, 1B)
- bobina A (p. ej. negro y verde): → J8 1A y 1B
- bobina B (p. ej. rojo y azul): → J8 2A y 2B
- Por qué: Busquen las bobinas con el multímetro: los 2 cables con ~1.5 Ω entre sí son una bobina. Si el motor gira al revés, volteen solo una bobina. Nunca se conecta con el driver prendido.

### NEMA del empujador → J9

- Calibre: cable del motor (1 m)
- Puntas: NEMA 17 del empujador ↔ J9 (2B, 2A, 1A, 1B)
- bobina A (p. ej. negro y verde): → J9 1A y 1B
- bobina B (p. ej. rojo y azul): → J9 2A y 2B
- Por qué: Busquen las bobinas con el multímetro: los 2 cables con ~1.5 Ω entre sí son una bobina. Si el motor gira al revés, volteen solo una bobina. Nunca se conecta con el driver prendido.

### Final de carrera izquierdo → J4

- Calibre: 22 AWG (2 hilos)
- Puntas: Final de carrera del elevador izquierdo ↔ J4 FC1 y GND
- beige: NC del final → J4 FC1
- negro: COM del final → J4 GND de al lado
- —: NO: nada
- Por qué: Siempre NC: si el cable se rompe, el ESP32 lo ve como "presionado" y se detiene en lugar de chocar.

### Final de carrera derecho → J4

- Calibre: 22 AWG (2 hilos)
- Puntas: Final de carrera del elevador derecho ↔ J4 FC2 y GND
- beige: NC del final → J4 FC2
- negro: COM del final → J4 GND de al lado
- —: NO: nada
- Por qué: Siempre NC: si el cable se rompe, el ESP32 lo ve como "presionado" y se detiene en lugar de chocar.

### Final de home del empujador → J4

- Calibre: 22 AWG (2 hilos)
- Puntas: Final de carrera de home del empujador ↔ J4 FC3 y GND
- beige: NC del final → J4 FC3
- negro: COM del final → J4 GND de al lado
- —: NO: nada
- Por qué: Siempre NC: si el cable se rompe, el ESP32 lo ve como "presionado" y se detiene en lugar de chocar.

### Servo de la uña → J11 (curva floja de ~30 cm)

- Calibre: cable del servo + extensión
- Puntas: MG90S ↔ J11 (GND, +5V, SIG)
- café: J11 GND
- rojo: J11 +5V
- naranja: J11 SIG (GPIO 5)
- Por qué: El carro se mueve 25 cm: el cable necesita una curva floja de ~30 cm o se jala.

### VL53L0X de la pila → J5

- Calibre: 22 AWG (4 hilos)
- Puntas: VL53L0X de la pila ↔ J5 (3V3, GND, SDA, SCL)
- rosa: VIN → J5 3V3
- negro: GND → J5 GND
- amarillo: SDA → J5 SDA
- blanco: SCL → J5 SCL
- —: XSHUT: sin conectar (este sensor no se apaga)
- —: GPIO1: nada
- Por qué: Es el cable I²C más largo (~1 m): lejos de los cables de motores y de potencia. No lleva XSHUT: al arrancar es el único prendido y es el primero al que se le cambia la dirección (0x33).

### VL53L0X frontal → J5 y J6

- Calibre: 22 AWG (5 hilos)
- Puntas: VL53L0X frontal ↔ J5 (bus en común) y J6 X0
- rosa: VIN → J5 3V3
- negro: GND → J5 GND
- amarillo: SDA → J5 SDA
- blanco: SCL → J5 SCL
- verde olivo: XSHUT → J6 X0 (GPIO 32)
- —: GPIO1: nada
- Por qué: Los 4 sensores comparten SDA y SCL (en J5 van varios hilos por terminal); los 3 de obstáculos tienen su propio XSHUT, directo a un GPIO del ESP32.

### VL53L0X lateral izquierdo → J5 y J6

- Calibre: 22 AWG (5 hilos)
- Puntas: VL53L0X lateral izquierdo ↔ J5 (bus en común) y J6 X1
- rosa: VIN → J5 3V3
- negro: GND → J5 GND
- amarillo: SDA → J5 SDA
- blanco: SCL → J5 SCL
- verde olivo: XSHUT → J6 X1 (GPIO 33)
- —: GPIO1: nada
- Por qué: Los 4 sensores comparten SDA y SCL (en J5 van varios hilos por terminal); los 3 de obstáculos tienen su propio XSHUT, directo a un GPIO del ESP32.

### VL53L0X lateral derecho → J5 y J6

- Calibre: 22 AWG (5 hilos)
- Puntas: VL53L0X lateral derecho ↔ J5 (bus en común) y J6 X2
- rosa: VIN → J5 3V3
- negro: GND → J5 GND
- amarillo: SDA → J5 SDA
- blanco: SCL → J5 SCL
- verde olivo: XSHUT → J6 X2 (GPIO 15)
- —: GPIO1: nada
- Por qué: Los 4 sensores comparten SDA y SCL (en J5 van varios hilos por terminal); los 3 de obstáculos tienen su propio XSHUT, directo a un GPIO del ESP32.

### Rama auxiliar → Jetson (12 V)

- Calibre: 18 AWG + plug 5.5 × 2.5 mm
- Puntas: XL4005 · IN+ (12 V después del KCD1) ↔ Jetson · plug de alimentación
- rojo: +12 V → centro del plug
- negro: GND → exterior del plug
- Por qué: Midan con el multímetro que el centro del plug sea + antes de conectarlo.

### Paro (NC) → VCC del relé

- Calibre: 20–22 AWG (2 hilos)
- Puntas: 12 V aux → paro LAY37 (contacto NC) ↔ Relé · VCC
- rojo: 12 V aux → una terminal NC del paro
- rojo: Otra terminal NC → VCC del módulo relé
- Por qué: Al apretar el paro, el relé se queda sin energía y corta motores y drivers, aunque el programa esté colgado.

### USB Jetson ↔ ESP32

- Calibre: micro USB de datos
- Puntas: Jetson · puerto USB ↔ ESP32 · micro USB
- —: Cable de datos (los de solo carga no sirven)
- rojo (VBUS): Cortado y aislado con termofit: el ESP32 se alimenta solo del XL4005; así los 5 V del Jetson y los del XL4005 no se pelean
- Por qué: Por aquí el Jetson manda las órdenes y el ESP32 reporta. Si se desconecta, el watchdog detiene las ruedas en 1 s.

### Final de carrera superior → J13

- Calibre: 22 AWG (2 hilos)
- Puntas: Final de carrera superior (tope, lado derecho) ↔ J13 FC4 y GND4
- beige: NC del final → J13 FC4 (GPIO 35)
- negro: COM del final → J13 GND4
- —: NO: nada
- Por qué: Siempre NC: si el cable se rompe, el ESP32 lo ve como "presionado" y se detiene en lugar de chocar.

### VCC del relé → J13 PARO (lectura del paro)

- Calibre: 22 AWG
- Puntas: Relé · VCC (después del paro) ↔ J13 · PARO
- rojo: VCC del relé → J13 PARO (de ahí al divisor 100 k / 20 k y al GPIO 34)
- Por qué: El ESP32 se entera de que apretaron el paro: deja la velocidad en 0, suelta los motores y pide REARME y home antes de moverse otra vez. El corte de energía lo sigue haciendo el relé, no el programa.

