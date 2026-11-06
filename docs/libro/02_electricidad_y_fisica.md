# Capítulo 2: Electricidad y física para mecatrónicos

*Voltios, amperios, vatios, tierra común, torque y fricción: lo mínimo que hay que entender para que un robot se mueva sin quemar nada ni lastimar a nadie.*

## Dos frases de un manual que valen cuatro semestres

En la guía de construcción de la celda de manufactura de Aether hay una línea que parece un detalle y es una clase completa de electrónica: *"Un GPIO de la Pi es de 3,3 V: 24 V lo quema."* (Un **GPIO** es un pin de la computadora Raspberry Pi que puede leer o encender una señal; el capítulo 8 lo explica.) Unas líneas más abajo aparece otra: *"Un módulo infrarrojo de 5 V de Arduino no sirve en esta entrada."*

Las dos dicen lo mismo con distinto número: **cada componente eléctrico aguanta un voltaje; si recibe más, se rompe; si recibe menos, no entiende lo que se le dice.** En Aether conviven tres mundos de voltaje: **3.3 V** (los pines de la Raspberry Pi y del microcontrolador ESP32), **5 V** (la alimentación de varias placas) y **24 V** (la parte industrial de la celda). Este capítulo enseña a moverse entre ellos y después añade la mitad mecánica: qué fuerza hace falta para mover un robot de hasta 40 kg.

**Aclaración de método.** Este capítulo es teoría con ejemplos del proyecto. Las cifras que sirven solo para entender (un LED, una rampa) están marcadas como ejemplo; los datos reales del hardware que todavía no están confirmados (peso final, diámetro de llantas) están marcados **PENDIENTE** y no se inventan. Cuando el libro dice **VERIFICADO**, significa que se leyó en el código, en una prueba o en una salida real pegada por el equipo; **MEDIDO**, que es una cifra obtenida con una prueba; **NO VERIFICADO**, que se supone sin comprobar.

## Voltios, amperios y vatios con una manguera

Una manguera de jardín sirve de modelo.

- El **voltaje** (símbolo V, unidad: voltio) es la **presión** del agua: lo que "empuja" a la electricidad por el cable. Una batería de 12 V empuja con 12 unidades de presión.
- La **corriente** (símbolo I, unidad: amperio, A) es **cuánta agua pasa por segundo**. Una corriente grande es una manguera ancha a todo chorro.
- La **potencia** (símbolo P, unidad: vatio, W) es **cuánto trabajo hace** ese chorro: **P = V × I**.

Dos ejemplos del proyecto. La computadora del robot, un **Jetson Orin Nano Super** (capítulo 9), tiene modos de energía de 7 W, 15 W, 25 W y MAXN_SUPER (el máximo); la bitácora de hardware del equipo registra que **hoy corre en el modo de 25 W** (**VERIFICADO**, salida real del comando `nvpmodel`). Y la fuente oficial de una Raspberry Pi 5 de 27 W entrega hasta unos 5.4 amperios a 5 V.

Importa porque **los cables, fusibles, conectores y fuentes se eligen por amperios**, no por voltios: un cable delgado que aguanta 1 A se calienta como resistencia de tostador si recibe 10 A.

## La ley de Ohm y el LED que no se quema

La **ley de Ohm** dice que **V = I × R**, donde R es la **resistencia** (unidad: ohmio, símbolo Ω), algo que se opone al paso de la corriente, como un estrechamiento en la manguera.

Ejemplo clásico, y justo lo que el plan de seguridad de la celda pide hacer antes de conectar una carga real a la Raspberry (capítulo 8): encender un **LED** (diodo emisor de luz, *Light-Emitting Diode*). Un LED es traicionero: casi no se opone a la corriente, así que conectado directo a un pin se "come" toda la que pueda y se quema. Se le pone una resistencia en serie.

> **Cuenta de ejemplo (regla general, no un dato del proyecto):** pin de 3.3 V, LED rojo que consume unos 2.0 V al encender y que se quiere a 10 mA (0.010 A). La resistencia debe "gastar" 3.3 − 2.0 = 1.3 V. R = 1.3 / 0.010 = **130 Ω**. Se usa la comercial más cercana por arriba, 150 Ω, que deja pasar unos 8.7 mA.

Con una fórmula se calculó algo que protege un componente de pocos centavos. La misma lógica, a otra escala, explica por qué entre el pin de una Pi y un motor hay un **driver** o un **relé** (capítulos 5 y 8).

## De la pared a la batería: corriente continua y alterna

Existen dos tipos de electricidad. La **corriente continua** (CC o DC, *Direct Current*) fluye siempre en el mismo sentido: la de las baterías, las fuentes de las computadoras y todo lo que hay dentro del robot y de la parte de control de la celda (12 V de batería, 5 V, 3.3 V, 24 V del tablero). La **corriente alterna** (CA o AC, *Alternating Current*) cambia de sentido muchas veces por segundo: la del enchufe de la pared. **La alterna aparece solo en el enchufe** que alimenta una fuente. Regla general: nadie debe abrir ni cablear nada conectado directo a la pared sin que lo revise la persona del equipo que sabe de eso.

## Tierra común: el cable que nadie dibuja

Este tema es el que más confunde. La guía de construcción lo resume en una frase: *"Los 0 V de la batería de motores y el GND de la Pi se unen en un solo punto."*

**GND** (*ground*, "tierra" o referencia de 0 V) es el punto contra el que se miden todos los voltajes. Un voltaje no existe solo: siempre es una **diferencia entre dos puntos**. Cuando una placa le manda a otra una señal de "3.3 V", realmente dice "estoy 3.3 V por encima de mi referencia". Si las dos placas no comparten referencia, cada una tiene su propia idea de dónde está el cero y la señal llega como ruido.

Por eso el ESP32, los drivers de motores y las demás placas **comparten GND**. Y por eso importa *dónde* se unen: **en un solo punto**. Si los negativos se unen en varios lugares al azar, las corrientes grandes de los motores pueden meterse por los cables delgados de señal y producir fallas raras e intermitentes, de las que "solo pasan los jueves".

## Niveles lógicos: 3.3 V, 5 V y 24 V no se entienden entre sí

Una señal digital es un cable que está "alto" (casi el voltaje de la placa) o "bajo" (casi 0 V). Eso se llama **nivel lógico**.

| Dispositivo | Nivel de sus pines | Qué pasa si recibe más |
|---|---|---|
| Raspberry Pi (GPIO) | 3.3 V | Más de 3.3 V puede dañar el pin o el chip |
| ESP32 | 3.3 V | Igual; aunque se alimente por USB a 5 V, sus pines son de 3.3 V |
| Sensores industriales de la celda | 24 V | No se conectan a pines de la Pi |
| Módulos "de Arduino" de 5 V | 5 V | No sirven en una entrada de 24 V ni deben entrar a un pin de 3.3 V |

(La tabla combina lo que dicen la guía de construcción y la hoja de conexión de la celda con la regla general de cada familia de placas.)

La solución industrial es el **aislamiento**: un **relé** (interruptor mecánico que se cierra con una bobina) o un **optoacoplador** (un LED y un fototransistor dentro de un chip, que pasa la señal con luz y no con cobre). Así el mundo de 3.3 V *manda* sin *tocar* el de 24 V. Esa es la razón de que, en la celda, la Raspberry no se cablee directo a los sensores ni al pistón y haya un relevador de por medio (capítulo 7).

## PNP y NPN: el problema de los tres hilos

Los **infrarrojos industriales** de la celda tienen tres hilos: **marrón** (+24 V), **azul** (0 V) y **negro** (la señal). Pero el hilo negro puede comportarse de dos maneras:

- **PNP**: al detectar, su salida **entrega** +24 V.
- **NPN**: al detectar, su salida **conecta a 0 V**.

La entrada del controlador (un PLC o un LOGO, capítulo 7) debe ser del tipo compatible. Si no coinciden, **el LED de la entrada nunca se enciende aunque el sensor sí detecte**, y no hay manera de arreglarlo con programa. La hoja de conexión lo dice así: *"Eso no se arregla en Python."* Moraleja de ingeniero: **antes de escribir una línea de código, se comprueba con la mano y con el LED que la entrada ve al sensor.** Marca, modelo y tipo de los infrarrojos reales: **PENDIENTE (P-13)**.

## Fusibles: el eslabón que se sacrifica a propósito

Un **fusible** es un hilito calibrado que se funde cuando pasa más corriente de la permitida y corta el circuito. Es barato y existe para que lo que se queme sea él y no el motor, la batería o el cable. Regla general: se elige **más grande que la corriente normal del circuito y más chico que lo que aguantan los cables y componentes**. En el diseño del carrito (capítulo 3) hay dos ramas con fusible, de 15 A y 10 A; el capítulo 4 las explica.

## De la electricidad al movimiento: fuerza, torque y rodar

Un robot es la electricidad convertida en empuje.

- **Fuerza** (F, unidad: **newton**, N): lo que empuja o jala. El **peso** es la fuerza con que la Tierra jala una masa: **peso = masa × g**, con g ≈ 9.81 m/s². Un robot de 40 kg pesa unos **392 N**.
- **Torque** o **par** (τ, unidad: **newton-metro**, N·m): la fuerza que hace *girar*. Es la fuerza por la distancia al eje, **τ = F × r**: lo que se siente al apretar una tuerca con una llave larga; la misma fuerza con una llave más larga da más torque.
- **Fricción de rodamiento**: lo que frena a una llanta que rueda. Se aproxima como **F = coeficiente × peso**. Para caucho sobre piso liso, un coeficiente típico (regla general) va de 0.02 a 0.05.
- **Tracción**: la fuerza máxima que la llanta puede transmitir al piso **sin patinar**: **coeficiente de agarre × peso que carga esa llanta**. Para caucho sobre piso liso, del orden de 0.5 a 0.8 (regla general).
- **Pendiente**: subir una rampa de ángulo α añade una fuerza en contra de **peso × sen(α)**.

### Un ejemplo con los números de partida del robot

Las estimaciones del equipo (todas **PENDIENTES de confirmar**, **P-02**): peso total máximo **40 kg** y unos **17 kg sobre cada llanta motriz**. El robot es **diferencial**: dos motores y una llanta por motor (capítulo 3). La velocidad máxima de 0.35 m/s y la aceleración de 0.4 m/s² salen de la hoja de armado del carrito. El diámetro real de la llanta es **PENDIENTE (P-03)**; para poder hacer la cuenta se usa el de la hoja de armado, 102 mm (radio 0.051 m), **solo como ejemplo**.

> **Cuenta de ejemplo con datos estimados (no son datos confirmados):**
>
> - Peso: 40 × 9.81 ≈ **392 N**.
> - Fricción de rodamiento con coeficiente 0.03 (supuesto): 0.03 × 392 ≈ **11.8 N**.
> - Aceleración a 0.4 m/s²: 40 × 0.4 = **16 N**.
> - Fuerza total en piso plano: 11.8 + 16 ≈ **27.8 N** entre las dos llantas, o **~13.9 N por llanta**.
> - Torque por llanta con radio 0.051 m: 13.9 × 0.051 ≈ **0.7 N·m**.
> - Rampa de **5°** (supuesto): 392 × sen(5°) ≈ **34 N** extra. Total ≈ 62 N, ~31 N por llanta, torque ≈ **1.6 N·m** por llanta.
> - ¿Patina? Cada llanta carga 17 kg (≈ 167 N). Con agarre 0.6: 0.6 × 167 ≈ **100 N** disponibles por llanta; los 31 N necesarios caben bien.
> - Potencia mecánica al acelerar a 0.35 m/s en piso plano: 27.8 N × 0.35 m/s ≈ **10 W**, sin pérdidas del motor ni de la transmisión. A velocidad constante, solo la fricción: 11.8 × 0.35 ≈ 4 W.

Dos lecciones valen más que los números. **Primera:** la rampa pesa más que todo lo demás; por eso la pendiente más inclinada del lugar donde trabajará el robot es *la* pregunta que dimensiona el motor. **Segunda:** la cuenta del torque se hace antes de comprar motores, no después, y el motor elegido debe entregarlo **con holgura**, normalmente con un margen de seguridad del doble (regla general). El motor de tracción de Aether ya está decidido (el M0601, capítulo 3); esta cuenta sirve para comprobar que su torque alcanza.

## Medir sin miedo: el multímetro

El **multímetro** convierte "creo que" en "mido que". Tres usos:

1. **Continuidad** (modo con símbolo de bocina): comprueba que dos puntos están unidos por cable. La hoja de armado pide, antes de conectar la batería, mirar continuidad entre el positivo y el negativo: **si pita, hay un corto** y no se conecta nada.
2. **Voltaje** (V con una raya recta, para continua): se mide **en paralelo**, con las puntas en los dos puntos que se quieren comparar. Es el modo más seguro.
3. **Corriente** (A): se mide **en serie**, **abriendo el circuito** y metiendo el multímetro como parte del cable. Es el modo peligroso: usado mal funde el fusible del aparato (o algo peor). Conviene aprender primero a medir voltaje.

## Cómo lo resuelve un tablero industrial

El estándar de facto para sensores y controladores de un tablero industrial es **24 V de corriente continua**: es lo bastante alto para que el ruido eléctrico no confunda las señales en cables largos y lo bastante bajo para ser menos peligroso que la pared. Los robots móviles de almacén (**AGV**, vehículos guiados automáticamente, y **AMR**, robots móviles autónomos) suelen usar baterías de 24 V o 48 V, y su paro de emergencia es **cableado**, no un botón de pantalla. Aether aplica el mismo principio a escala de laboratorio.

## Preguntas de repaso: electricidad y fuerzas

1. Un sensor PNP de 24 V se conecta por error a un pin de 3.3 V de la Raspberry. ¿Qué pasa, y qué pieza intermedia debió ir en medio?
2. Si el ESP32 y el driver de motores no comparten GND, ¿por qué la señal "alto" de uno puede no ser entendida por el otro?
3. Con los datos de ejemplo del capítulo, ¿por qué una rampa cambia más la elección del motor que acelerar más rápido en piso plano?
4. Un fusible de 15 A en un circuito de 12 V: ¿cuántos vatios deja pasar como máximo antes de fundirse?
5. ¿Qué dato falta hoy para dimensionar con seguridad el motor del robot, y quién del equipo tiene que confirmarlo?
