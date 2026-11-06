# Capítulo 4: Alimentación, baterías, protecciones y paro de emergencia

*De dónde sale la energía del carrito, por qué se reparte en ramas, qué hace cada fusible, convertidor y relé, y por qué el botón rojo no es software.*

## Un diagrama de bandeja que se lee como un cuento

La hoja de armado del carrito (capítulo 3) cuenta la electrónica de potencia en el orden en que hay que hacerla: primero **se ajustan los voltajes sin conectar nada**, después fusibles y relé y, al final, una **prueba de humo** con la batería pero **sin ESP32 ni motores**. Ese orden es la lección del capítulo: *la electricidad se prueba por capas, de lo que menos cuesta quemar a lo que más.*

**Sobre las fuentes.** Una guía de construcción del 9 de octubre de 2026 describe un robot con una **Raspberry Pi 5** y un driver pequeño llamado TB6612. Esa Pi 5 fue un plan del 30 de septiembre que se descartó; cuando un documento contradice a la **bitácora de hardware del Jetson** (21 de octubre), el libro sigue a la bitácora. La arquitectura eléctrica de este capítulo sale de la **hoja de armado revisión 3.8**, que ya usa el **Jetson Orin Nano Super**. Es el **diseño del equipo**, no la medición de un carrito encendido: **David**, responsable del ensamble y la electrónica, confirma los datos finales de batería, convertidores y cableado (**PENDIENTE: P-05, P-19**).

## Islas de voltaje y un solo cero

| Voltaje | De dónde sale | Qué alimenta |
|---|---|---|
| **12 V** (batería) | Batería de plomo de 12 V y 24 Ah, "BR-1224", de 8.3 kg | Todo lo demás, repartido en dos ramas |
| **18 V** | **Elevador de voltaje de 400 W** (12 → 18 V) | Los dos motores-rueda M0601 |
| **12 V "de pasos"** | La rama principal, ya pasada por el relé | Los 3 drivers **A4988** de los motores a pasos |
| **5 V** | **Reductor XL4005** (12 → 5 V), ajustado a 5.0–5.1 V | ESP32, módulo MAX485, servo de la uña y tira de LEDs |
| **3.3 V** | Regulador del propio ESP32 | Lógica de los A4988, sensores VL53L0X, BNO055, PCF8574 y barra QTR-8A |

Y **un solo cero**: el capítulo 2 explicó la tierra común. En este diseño todas las tierras se unen **en el borne IN− del elevador de voltaje**, adonde llega el negativo de la batería: *"Todas las tierras unidas: batería −, elevador, XL4005, drivers y ESP32"* (palabras de la hoja). Un solo punto evita que las corrientes grandes de los motores viajen por cables delgados de señal.

## Las dos ramas de la batería

Del borne de la batería sale un cable rojo de **14 AWG** (calibre americano; 14 es grueso, para corrientes grandes) a un conector **XT60** (el enchufe amarillo de baterías; hembra del lado de la batería, macho del lado del carrito). Enseguida hay **dos portafusibles**, el corazón de la protección:

**Rama principal: fusible de 15 A → relé → motores.** El fusible alimenta el contacto **COM** de un **módulo de relé T90 de 30 A** de 2 canales. Del contacto **NO** ("normalmente abierto": cierra solo cuando la bobina recibe energía) salen dos ramas: la entrada del elevador de 18 V (ruedas) y la bornera **J1** de la placa (12 V de los drivers de los motores a pasos). El relé es el interruptor general de la **potencia**.

**Rama auxiliar: fusible de 10 A → interruptor KCD1 → lógica.** El otro fusible pasa por un **interruptor KCD1** (el de encendido del robot) y llega al **XL4005**, que reparte: 5 V al ESP32 y accesorios; **12 V** al **Jetson** (cable con plug de 5.5 × 2.5 mm, centro positivo); y 12 V a la **bobina** del relé, pasando por el paro de emergencia. Consecuencia: **apagar el KCD1 también suelta el relé**, porque le quita la energía a la bobina; con el robot "apagado" no queda potencia en las ruedas.

¿Por qué dos fusibles? Cada rama tiene un temperamento distinto:

- La de **motores** es potente y brusca: fusible grande para que los arranques normales no lo fundan.
- La **auxiliar** es delicada y sensible a caídas de voltaje: fusible más chico que se funde ante un corto antes de que se caliente un cable fino.
- Si se funde el de motores, el robot se detiene **pero el Jetson sigue vivo y puede reportar qué pasó**. Con un solo fusible se perderían las dos cosas a la vez.

Regla de la hoja sobre dónde colocarlo: *"El fusible va lo más cerca posible de la batería: si algo hace corto, se quema el fusible y no el cable."*

## Leer la etiqueta de una batería

Una batería dice tres cosas:

- **12 V**: voltaje nominal.
- **24 Ah** (amperios-hora): capacidad. En teoría, 24 A durante 1 hora o 1 A durante 24 horas.
- **Energía** = 12 × 24 = **288 Wh** (vatios-hora).

Si solo estuviera conectado el Jetson trabajando a 25 W (su modo actual, **VERIFICADO** en la bitácora), 288 Wh darían unas **11 horas** en el mejor caso teórico (**cuenta de ejemplo**, no medida). Los motores, las pérdidas de los convertidores y la regla general de no descargar una batería de plomo a fondo recortan eso mucho. **La autonomía real se mide con el robot completo trabajando.**

## Ajustar voltajes antes de conectar nada

La hoja lo dice con claridad: *"La mayoría de las piezas se queman por un voltaje equivocado. Marquen cada módulo con su voltaje en cinta."* Receta de la Etapa 11:

1. Con el módulo conectado a 12 V y **sin nada en la salida**, se gira su potenciómetro (un tornillito) con un desarmador de plástico hasta leer con el multímetro **5.0–5.1 V** en el XL4005 y **18.0 V** en el elevador.
2. Se ajusta el **Vref** de cada driver A4988 **sin motor conectado**: **0.80 V** (si la resistencia de sentido es R100) o **0.54 V** (si es R068), lo que limita cada motor a **1.0 A**. El **Vref** es un voltaje de referencia dentro del driver que fija cuánta corriente máxima deja pasar al motor: demasiado alto y el motor se calienta; demasiado bajo y se salta pasos.
3. Se anotan los valores (la hoja deja renglones para eso).

Dos reglas de seguridad que la hoja repite: **nunca conectar ni desconectar un motor a pasos con el driver encendido** (quema el A4988) y **medir antes de enchufar el plug del Jetson** que el centro sea el positivo (la polaridad al revés lo daña).

## La prueba de humo

Antes de montar módulos delicados, la hoja pide una **prueba de humo** (se llama así porque, si algo está mal, sale humo): conectar la batería con el XT60 y el KCD1 encendido, **sin ESP32 y sin motores**. Se miden **5 V** en la placa y **12 V** antes del relé; el relé hace *clic*; se aprieta el paro y debe soltar, dejando el contacto NO en **0 V**. Se esperan 2 minutos y se tocan los módulos: *"Ninguna pieza caliente ni con olor."* Si algo falla, se quema un fusible o un regulador de unos pocos pesos, no el ESP32 ni los drivers. Antes de todo eso, con el XT60 **desconectado**, el multímetro en continuidad entre + y − **no debe pitar** (no hay corto).

## El paro de emergencia: por qué el botón rojo no es un programa

El código de Aether ya tiene un botón "Paro" en la pantalla de la celda. El propio archivo (`backend/cell_hmi.py`) aclara en su comentario inicial que *"El paro de emergencia no pasa por aquí"*. Es deliberado: **un botón de pantalla es software**, y el software puede estar colgado, sin red o mal escrito justo cuando más se necesita. Un **paro de emergencia** (*e-stop*) real es un **interruptor físico que corta la energía de lo peligroso, sin depender de que nada funcione**.

El diseño del carrito lo resuelve así:

1. **Botón LAY37 con contacto normalmente cerrado (NC).** Mientras está suelto deja pasar corriente; al pulsarlo, **abre** el circuito. Si un cable se rompe, también se abre: **falla hacia lo seguro**. Un contacto normalmente abierto haría lo contrario y un cable roto dejaría el paro sin efecto sin avisar.
2. **El paro no corta la potencia directamente: alimenta la bobina del relé.** El cable `12 V aux → contacto NC del paro → VCC del relé` hace que el relé **solo esté cerrado mientras el paro esté suelto**. Al pulsarlo, la bobina se queda sin energía, el relé **cae solo** y corta **a la vez** el elevador de 18 V (ruedas) y los 12 V de los drivers de los motores a pasos (elevador de plataforma y empujador). Frase de la hoja: *"aunque el programa esté colgado"*.
3. **La rama auxiliar sigue viva**: el Jetson y la lógica **no se apagan** al pulsar el paro. El robot se detiene pero sigue "pensando" y puede reportar lo ocurrido.
4. **Dónde queda:** *"arriba, en una esquina de atrás"* del carrito, **al alcance de la mano** en cualquier momento del ciclo. Un botón al que hay que rodear el robot para llegar no es un paro.
5. **Prueba que pide la hoja:** *"El paro detiene ruedas, elevador y empujador al instante y la plataforma se queda donde estaba."*

### Una decisión de diseño que sigue abierta

El cableado completo de la placa (107 cables) se leyó para este libro: **el paro solo va al relé; no hay cable del paro hacia un pin del ESP32.** Eso significa que, **hoy, el software no se entera de que se pulsó el paro**: el ESP32 podría seguir mandando órdenes de movimiento a motores sin energía. Mientras el paro está pulsado no es peligroso, pero **al soltarlo los motores recuperan potencia y podrían moverse de golpe** si el programa conserva la última orden. Es una decisión **abierta entre David y Mario** (responsable del software del robot): ¿se agrega una entrada para que el software detecte el paro y frene antes de que se suelte? **PENDIENTE (P-06).** (La guía vieja del 9 de octubre sí traía un segundo circuito del paro hacia un pin del ESP32; la hoja nueva no lo trae.)

### El perro guardián: la segunda red

La hoja dice, del cable USB entre el Jetson y el ESP32: *"Si se desconecta, el watchdog detiene las ruedas en 1 s."* Un **watchdog** ("perro guardián") es un temporizador que obliga a detener el robot si el programa principal deja de mandar su "latido" a tiempo: protege contra que el cerebro se cuelgue. Ojo: **el programa del ESP32 para este diseño todavía no existe en el repositorio** (`firmware/` solo contiene archivos `.gitkeep`, vacíos que sirven para que git conserve la carpeta). El watchdog es un diseño, no una función que ya corra. El capítulo 5 lo desarrolla.

## Medir la batería sin freír un pin

Para que el robot sepa cuánta batería le queda, la hoja usa un **divisor de voltaje**: una resistencia de **100 kΩ** y una de **20 kΩ** en serie, con un capacitor de **100 nF** para limpiar el ruido. Con 14.4 V (batería llena) el punto medio tiene 14.4 × 20 / (100 + 20) = **2.4 V**, un valor seguro para un pin de 3.3 V. Ese punto va al **GPIO 39** del ESP32 (solo entrada analógica). La fórmula de la hoja: **voltaje real ≈ lectura / 4095 × 3.3 × 6**. Regla general: **nunca conectar 12 V directo a un pin de 3.3 V**; se usa un divisor.

## Dos caminos de 5 V hacia el mismo ESP32

La hoja alimenta el ESP32 por su pin de **5 V desde el XL4005**, *"no por la computadora"*, y a la vez lo conecta por **micro USB al Jetson** para datos. Regla general: cuando una placa recibe 5 V por dos caminos a la vez, las fuentes pueden "pelearse" salvo que haya un diodo o que el cable USB no lleve la línea de alimentación. Cómo se evita aquí no está documentado: **PENDIENTE (P-19)**.

## Cables: por qué el grueso importa

La hoja especifica calibres: **14 AWG** para la batería y la rama de motores, **16–18 AWG** hacia los motores-rueda, **18–20 AWG** para drivers y lógica, **22 AWG** para señal. Error que anota: *"Cable de potencia delgado (22 AWG) en la rama de 15 A: se calienta y se derrite."* Otra regla: **potencia por un lado y señal por otro**, con un cincho cada ~10 cm, porque *"Cables de señal pegados a los de potencia: los VL53L0X y el RS485 fallan 'al azar'."*

## La celda: 24 V y 5 V separados

La **celda de manufactura** (capítulo 7) tiene su propio mundo eléctrico, según la hoja de conexión y la guía:

- Una **fuente de 24 V del tablero** alimenta el controlador, los dos infrarrojos y la bobina del relé del pistón.
- La **Raspberry Pi 4** se alimenta con **su propia fuente de 5 V**, aparte. *"No hay hilo de 24 V hacia la Pi."*
- La Pi **no energiza** el pistón: comanda un **relevador** que sí lo hace.

El mismo principio: **cada voltaje en su isla; entre islas se comunica por relé o por red, nunca por cobre directo.** El **paro de emergencia físico de la celda** no aparece en ningún documento del repositorio: **PENDIENTE (P-16)**.

## Una lista de errores que queman cosas

Recopilados de la hoja y de la guía:

- Meter 24 V a un pin de la Pi: *"24 V lo quema."*
- Conectar un motor directo a un pin: un pin entrega unos pocos miliamperios; un motor puede pedir varios amperios.
- Conectar o desconectar un motor a pasos con el driver encendido: quema el A4988.
- Olvidar el capacitor de **100 µF** junto a cada A4988, que amortigua los picos. Con la polaridad al revés *"se infla o revienta"*.
- Poner **VDD del driver a 5 V** en vez de 3.3 V: no entiende las señales de 3.3 V del ESP32.
- Alimentar la barra QTR-8A a **5 V** cuando sus salidas van a pines de 3.3 V: *"mandaría 5 V a pines que aguantan 3.6 V."*
- Alimentar el servo desde el ESP32 en lugar del XL4005: *"al moverse jala corriente y reinicia la placa."*
- Conectar la batería **al revés** (+ con −): *"quema el ESP32 o el módulo al instante."*
- Montar un módulo **al revés** en su zócalo.
- Dejar la placa tocando el aluminio: *"un corto en cuanto el carrito vibra."* (Por eso la bandeja va con separadores M3.)

## Normas: qué existe, sin fingir que se cumple

Para máquinas, el paro de emergencia está regulado por normas internacionales: en general **IEC 60204-1** (equipo eléctrico de máquinas) e **ISO 13850** (función de paro de emergencia) (**conocimiento general**, no verificado en el proyecto). Aether es un **prototipo de laboratorio** y no está certificado; lo honesto ante un jurado es decir: *"seguimos los principios (contacto NC, corte de potencia independiente del software), no tenemos certificación."* El propio `cell_hmi.py` usa la misma humildad: su cuenta de pantalla *"no es una certificación del sistema"*.

## Seguridad de robots comerciales

En un robot de almacén comercial, el paro de emergencia está **homologado**, hay botones en varios lados, la batería va en una caja con protección contra corto y sobretemperatura, y la potencia (24 V o 48 V) se corta con un **contactor de seguridad** que no depende del cerebro. La lógica es la misma que la del relé gobernado por el paro de Aether, a otra escala y con papeles firmados.

## Preguntas de repaso: energía y protecciones

1. ¿Por qué el contacto del paro es "normalmente cerrado" y no "normalmente abierto"?
2. Si el Jetson se cuelga con las ruedas a toda velocidad, ¿qué corta la potencia primero: el programa o el relé del paro? Y si se pulsa el paro, ¿el Jetson se apaga?
3. Una batería de 12 V y 24 Ah: ¿cuántos vatios-hora guarda y por qué la autonomía real será menor?
4. ¿Por qué hay un fusible de 15 A y otro de 10 A, y por qué el de 10 A pasa por un interruptor?
5. En un divisor de 100 kΩ y 20 kΩ, ¿qué voltaje llega al pin con 12.6 V de batería?
6. ¿Qué podría pasar al soltar el paro si el ESP32 no se enteró de que fue pulsado, y qué decisión de diseño queda abierta?
