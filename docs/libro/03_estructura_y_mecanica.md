# Capítulo 3: Estructura y mecánica del robot y del carrito

*De qué está hecho el esqueleto, por qué un robot diferencial gira como gira, cómo funcionan la torre y el empujador, y qué dice la hoja de armado 3D (revisión 3.8) pieza por pieza.*

## Un plano que se gira con el mouse

El equipo de Aether documentó el robot de transporte, al que llama "el carrito", en una **hoja de armado interactiva en 3D**: una página web donde se gira el modelo con el mouse y se avanza por etapas. Cada etapa dice qué se hace, por qué, con qué herramientas, cómo comprobar que quedó bien y cuál es el error típico. Su tabla de medidas lleva fecha del **16 de octubre de 2026** (revisión 3.4) y los ajustes posteriores llegan hasta la **revisión 3.8** y la banda del **18 de octubre**. Son unas cincuenta etapas de estructura, electrónica y funcionamiento, más una etapa por cada uno de los 107 cables de la placa electrónica.

Este capítulo y los de hardware que siguen usan esa hoja como **fuente del diseño**, con dos reglas que la propia hoja enseña:

1. **Todo número que su autor dibujó "a criterio" lleva un "~"** y aparece en una lista de *supuestos*. Aquí se marca igual.
2. La hoja cita como fuentes unos documentos del equipo (`CARRITO_CONSTRUCCION_PASO_A_PASO.md`, `GUIA_ARMADO_PRINCIPIANTES.md`, `COSTOS_CARRITO.md`, `PROYECTO_INTEGRADOR_CONTEXTO.md`) que **no están en el repositorio**, de modo que no se puede contrastar cada cifra con su origen.

Entonces, lo que sigue es **el diseño documentado por el equipo**, no la medición de un robot armado. Cuando el libro dice VERIFICADO se refiere a que **se leyó en la hoja**, no a que alguien midió la pieza con un vernier. El responsable del **diseño mecánico, CAD e impresión 3D** es **Isaac** y el del **ensamble mecánico y la electrónica** es **David** (el capítulo 1 presenta a todo el equipo). Si el carrito ya existe físicamente, las cifras se confirman contra el real: **PENDIENTE (P-04)**.

## Qué hace el carrito, en tres frases

La unidad móvil llega a la banda transportadora de la celda y **se acopla** a ella. Va tomando los *fixtures* —las bases que sostienen cada pieza; aquí cada fixture lleva una **ECU**, la computadora de motor de un automóvil, de las marcas Siemens VDO y MaxxECU según el diseño de los fixtures— hasta apilar **6**. Luego viaja a la **estación de descarga** (una mesa inclinada) y, nivel por nivel, un **empujador** los saca por una ventana. Es un robot de **transporte con elevador**, no un brazo: consecuencia de que el proyecto abandonó dos brazos industriales (KUKA y UR5) en favor de banda más pistón (capítulo 1).

## El esqueleto: aluminio 3030, escuadras impresas y tuercas T

La estructura es un marco de **perfil de aluminio 3030**: barras de 30 × 30 mm con una ranura de 8 mm. Se une con **tuercas T de martillo**, tornillos Allen **M6** y **escuadras impresas en 3D**, sin soldar. Números del diseño:

| Concepto | Valor (revisión 3.8) | Estado |
|---|---|---|
| Huella exterior | 0.50 m (largo, hacia el frente) × 0.40 m (ancho) | VERIFICADO en la hoja |
| Postes verticales | 4 barras de 0.95 m | VERIFICADO en la hoja |
| Altura total aproximada | ≈ 1.04 m con rodajas | NO VERIFICADO (~) |
| Largueros y travesaños | 4 de 0.44 m y 7 de 0.34 m (más uno de 198 mm para el empujador) | VERIFICADO en la hoja |
| Cortes de perfil | 19 piezas, ≈ 11.4 m en total | VERIFICADO en la hoja |
| Piezas impresas | 28 escuadras + 16 placas de unión, más soportes, cuna de batería, bandeja y guías | VERIFICADO en la hoja |
| Tuercas T + Allen M6 | 100 juegos | VERIFICADO en la hoja |
| Material, impresora y relleno de las piezas impresas | No dichos (solo el consejo "40 % de relleno y 5 perímetros") | PENDIENTE (P-04) |

Tres hábitos de oficio que enseña la hoja:

- **Las longitudes cuadran con aritmética.** 0.50 − 2 × 0.030 = 0.44; la hoja marca con una palomita (✓) cada cuenta comprobada.
- **El marco se escuadra con las diagonales.** En un rectángulo bien armado las dos diagonales miden igual: aquí √(0.5² + 0.4²) = 0.64 m. La hoja pide igualarlas **a ±2 mm** *antes* de apretar los tornillos, porque "todo lo de arriba hereda este marco".
- **Las tuercas T entran de frente.** Se meten de lado en la ranura y al apretar giran un cuarto de vuelta y se traban. Error típico anotado: apretar sin que hayan girado y se salen.

## Robot diferencial: girar sin volante

El robot es **diferencial**: **dos motores y una llanta por motor**, sin volante. Cómo se mueve (**conocimiento general**):

- Las dos llantas giran igual → avanza recto.
- La izquierda más rápido que la derecha → gira a la derecha, y al revés.
- Una avanza y la otra retrocede a igual velocidad → **gira sobre su propio eje**.

Con solo dos llantas el robot se caería hacia adelante o atrás, así que el diseño añade **4 rodajas** (ruedas locas) "twin" de 50 mm en las esquinas, que solo siguen la dirección que marcan las llantas motrices. Cada rodaja mide **9 cm de alto con su espiga**; ese número fija la altura de todo el marco sobre el piso.

### El motor de tracción: M0601

El equipo decidió y cotizó como motor de tracción el **M0601** (dato firme, según el documento de costos del equipo "Costos Carrito 9", revisión 3.12b, que no está en el repositorio). Es un **motor-rueda**: una rueda de **Ø 102 mm** (ancho ≈ 45 mm) con el motor dentro. La hoja distingue el modelo **izquierdo (FIT1042)** del **derecho (FIT1038)**, espejos uno del otro, y advierte el error clásico: *"Montar dos del mismo lado: una rueda giraría al revés"*. Cada uno trae **su propio driver y su propio encoder** (el capítulo 5 explica qué significa) y se maneja por un bus **RS485**. Funciona a **18 V**.

Lo que **sigue PENDIENTE (P-01)** es lo que ningún documento confirma: si los M0601 y los motores NEMA 17 de la torre (también incluidos en la cotización) **ya llegaron o están instalados**.

Un problema de ingeniería real que la hoja resuelve con un número: con un diámetro de 102 mm la llanta sube hasta 10.2 cm, pero el marco queda a 9 cm del piso, **así que la llanta chocaría con el perfil central**. Por eso el eje de las ruedas se corre **7 cm hacia adelante** del travesaño central (que se pone "por el costado de atrás": *por el frente pasan los motores de las ruedas*). Un error así se descubre dibujando; descubrirlo con el aluminio cortado cuesta dinero.

## Suspensión: 85 newtons que mantienen la llanta pegada al piso

Cada llanta motriz va en una **placa pivotante**: dos baleros **608ZZ** a presión y un tornillo **M8** de pivote, con un **resorte** que la empuja contra el piso. La hoja da la receta exacta: resorte de **75 mm libres**, comprimido **28 mm** (a 47 mm), constante de unos **3 N/mm**, lo que da **≈ 85 N** sobre cada rueda (unos 8.7 kg-fuerza).

Con dos llantas motrices y cuatro rodajas, una irregularidad del piso puede dejar una llanta **sin contacto**; sin contacto no hay tracción y el robot se desvía. El resorte garantiza una fuerza mínima. El balance, escrito por la hoja como error típico: *"Demasiada precarga levanta las rodajas y el carrito se mece; muy poca y las ruedas patinan al arrancar."* Se ajusta **midiendo con vernier** en el robot real: es el tipo de calibración que nunca sale igual en el mundo físico que en el papel.

## Peso y reparto: la cuenta que decide todo

Las estimaciones de partida del equipo (**PENDIENTES de confirmar, P-02**) son un robot de **hasta 40 kg** con unos **17 kg sobre cada llanta motriz**. Con la resta, 40 − 17 − 17 = **6 kg** para las rodajas: casi todo el peso va sobre las llantas que empujan, lo que da agarre (capítulo 2) y obliga a que las rodajas no se levanten.

La **batería** del diseño es una **BR-1224 de 12 V, 24 Ah y 8.3 kg**, de ≈ 16.6 × 17.5 × 12.5 cm (medidas "típicas", marcadas con ~), colocada **al centro y lo más abajo posible**, sujeta con topes impresos y una **correa con hebilla** alrededor del travesaño central. La razón, en palabras de la hoja: *"8.3 kg sueltos en un frenazo rompen algo. Abajo y al centro, baja el centro de gravedad."* Modelo y capacidad reales de la batería: **PENDIENTE (P-05)**.

## Centro de gravedad: el enemigo de las torres altas

El carrito mide poco más de 1 m y carga hasta 6 fixtures arriba. El **centro de gravedad** es el punto donde parece concentrarse todo el peso. Cuanto más alto está, más fácil es volcar al frenar, girar o tomar una pendiente. Regla general: un robot alto y angosto necesita su peso pesado abajo y centrado, y la **torre cargada** sube ese centro justo cuando el robot viaja a la estación de descarga. La altura real del centro de gravedad no existe como dato; calcularla con cifras inventadas es lo que el proyecto evita: **PENDIENTE (P-02)**.

## La torre: un elevador que no se cae solo

La plataforma sube y baja con un **elevador de husillo**:

- **Dos husillos TR8** de 60 cm (tornillos de potencia de 8 mm: al girar suben o bajan una tuerca) y **dos varillas lisas de 8 mm** con **6 baleros lineales SC8UU** que guían la plataforma.
- Los mueven **dos motores a pasos NEMA 17 (modelo 17HS4401)** mediante **coples flexibles de 5 a 8 mm**, apoyados en **4 chumaceras KFL08**. Un **motor a pasos** avanza un "paso" fijo por cada pulso, así que "sabe" cuánto giró sin sensor de posición. El husillo tiene **autobloqueo**: sostiene la carga sin gastar corriente (la hoja incluye una etapa de prueba).
- **Tres finales de carrera** (interruptores de límite): dos del elevador (uno al fondo, 39.2 cm) y uno de *home* del empujador. Van como contacto **normalmente cerrado** para que un cable roto se lea como "presionado" y el motor se detenga (idea del capítulo 4).
- Recorrido útil: plataforma de **40.7 a 83.2 cm** del piso, con **6 niveles de 7.0 cm**: 0.407 + 6 × 0.070 = 0.827 m, justo la altura de la banda (83 cm) menos 3 mm.

La medida más importante, que la hoja revisa con palomitas: la **columna de la torre** tiene un hueco de **22.0 × 19.0 cm** y la **quilla** del fixture mide **21.3 × 16.5 cm**; las ECU sobresalen hasta ±11.15 cm del centro. La holgura entre fixture y guías es de **2 a 5 mm por lado**: lo mínimo para que entre sin atorarse ni bailar.

## El empujador: cremallera, piñón y una uña con servo

Para **meter** el fixture a la pila y para **sacarlo** en la descarga, el carro lleva un **empujador**: una **cremallera** (barra dentada, 2 tramos de 15 cm = 30 cm) movida por un **piñón** (módulo 1.5, 20 dientes, Ø 30 mm) acoplado a un **tercer NEMA 17**. Recorre **25 cm** (su "home" es la posición 0.8 cm). Una **uña** —un dedo impreso de 7 mm que gira 90° sobre un eje, movido por un **microservo MG90S de 180°** (el de 360° no sirve)— engancha la ranura del fixture para **jalarlo ~7.7 cm** hacia dentro desde la banda.

## La carga en la banda: una cinta que no espera

Este es el truco de diseño más fino y la hoja lo explica bien. La **cinta de la banda no se detiene**; el carrito no puede pedirle que pare. Entonces:

1. El carrito llega por **waypoints** (puntos de ruta), un "embudo" lo centra y la **cámara** lee un **ArUco** para confirmar su posición (capítulo 6).
2. Hace *home* del elevador y del empujador y deja la plataforma 3 mm **debajo** de la cinta (a 82.7 cm).
3. El fixture viaja sobre la cinta; cuando su centro pasa la **cresta del rodillo** (de Ø 50 mm en el extremo), su frente baja a la pila, la cinta lo sigue empujando hasta que la cola suelta la cresta y cae plano **≈ 6 cm afuera de la ventana**.
4. La uña baja, el empujador lo jala, sube la uña, regresa a home y la plataforma **baja un nivel (7 cm)**.
5. Se repite **uno a la vez** hasta 6. Un ciclo completo tarda ≈ 15 a 18 s; con la cinta a **0.20 m/s (supuesta)**, eso exige unos 3 m de separación entre fixtures. Por eso quien pone los fixtures espera el aviso "listo" del carrito.

Honestidad de la propia hoja: la velocidad real de la cinta y el punto exacto donde cae el fixture **se miden con la banda real**; el valor "6 cm" depende de que la cinta agarre menos que el PETG sobre PETG (supuesto).

## La banda de Isaac y la mesa de descarga

La banda sale del archivo **STEP de SolidWorks** de Isaac (un formato de intercambio de modelos 3D): su modelo es un **tercio** de la banda real, así que el diseño pega **3 tramos de 1030 mm (3.09 m)** con **una sola cinta de 20.35 cm** de ancho. Las patas no vienen en el STEP y se dibujan con perfil 3030. Datos que importan:

- **Altura de la cinta: 83.0 cm** (supuesta; en el STEP la cinta queda **8.5 mm debajo del borde de los rieles**, así que si los rieles están a 83 cm la cinta está a 82.15 cm y "hay que subir la banda o bajar 8.5 mm la altura de carga").
- Guías laterales de 3 mm a 2 mm de la quilla, colgadas de los rieles cada ~0.5 m (**propuesta**: la banda real no trae guías y entre rieles hay 21.6 cm).
- **Mesa de descarga:** una **mesa inclinada de melamina de 1.4 × 0.3 m a ≈ 15°**, con bisagra, cuña, guías y tope de hule espuma (dibujados a criterio). Al empujar el fixture por la ventana, cuando su centro pasa la orilla de la mesa **se vuelca y resbala solo**; en una mesa plana el empujador tendría que arrastrar toda la fila y no le alcanzaría la fuerza.

Datos reales de la banda (motor, velocidad, altura de la cinta): **PENDIENTE (P-15)**.

## La cara de enfrente: ventana de MDF

El frente del carrito lleva un **panel de MDF de 3 mm** con una **ventana de 24 × 9.7 cm** (borde inferior a 81.8 cm, 1.2 cm bajo la banda). El panel es además el **tope** de la pila. Las columnas delanteras están separadas **23.2 cm** (a z ±0.131) para que pasen las ECU; las traseras quedan más juntas.

## Qué fija la hoja y qué falta confirmar

| Tema | Hoja de armado (rev. 3.8) | Estado |
|---|---|---|
| Motor de tracción | 2 × M0601 (FIT1042 izquierdo, FIT1038 derecho), 18 V, RS485 | Decisión firme del equipo; llegada e instalación PENDIENTE (P-01) |
| Motores de la torre | 3 × NEMA 17 (17HS4401) con drivers A4988 | Decisión firme; llegada e instalación PENDIENTE (P-01) |
| Peso total y por llanta | No lo da (batería 8.3 kg) | Estimado del equipo: 40 kg y ~17 kg por llanta; PENDIENTE (P-02) |
| Cómputo | Jetson Orin Nano Super, "ya comprado" | VERIFICADO (bitácora del Jetson) |
| Cámara | Logitech 1080p, "ya la tiene" Mario | VERIFICADO (la cámara aparece en el Jetson) |
| Microcontrolador | ESP32 DevKitC de 38 pines | El equipo ya tiene un ESP32; modelo exacto PENDIENTE (P-07) |
| Armado físico | Etapas de armado y 107 cables | PENDIENTE (P-04): no hay evidencia de que ya esté armado |

## Probar la mecánica antes de energizar

La hoja termina cada etapa con una **comprobación física**. Cuatro que cualquier mecatrónico entiende:

1. *"Las 2 ruedas y las 4 rodajas tocan el piso al mismo tiempo."* Si una no toca, el robot cojea.
2. *"Diagonales del marco de abajo iguales (±2 mm)."* Sin eso, el robot no anda derecho.
3. *"La batería no se mueve aunque sacudan la base; empujada a mano, la base rueda derecho unos 3 m."*
4. *"Resortes comprimidos 28 mm, medidos con vernier."*

**No hay evidencia en el repositorio de que el carrito ya esté armado.** Las pruebas anteriores son las que la hoja prescribe, no las que alguien reportó haber hecho.

## El mismo esquema en los almacenes reales

Los robots de almacén que mueven estantes o cajas (los **AGV** y **AMR** ya definidos) usan casi la misma receta: tracción diferencial, ruedas locas de apoyo, batería baja para bajar el centro de gravedad y un mecanismo elevador. Lo que cambia es la certificación: los industriales llevan sensores de seguridad homologados y paros de emergencia certificados. El capítulo 27 revisa casos reales.

## Preguntas de repaso: mecánica del carrito

1. Una llanta izquierda a 0.3 m/s y la derecha a 0.1 m/s: ¿hacia dónde gira el robot?
2. ¿Por qué la hoja mueve el eje de las ruedas 7 cm hacia adelante del travesaño central?
3. Con 40 kg y 17 kg por llanta motriz, ¿cuántos kilos quedan para las rodajas, y por qué eso es bueno y malo a la vez?
4. ¿Qué se comprueba con las dos diagonales de un marco rectangular y a qué tolerancia?
5. ¿Por qué la cinta no se detiene durante la carga y qué consecuencia tiene para quien coloca los fixtures?
6. ¿Qué dato falta para saber si el carrito ya existe físicamente?
