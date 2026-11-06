# Guía de armado en texto (rev. 3.21)

> Generado de la guía de armado rev. 3.21 (5-nov-2026). No editar a mano: si la guía cambia, se vuelve a generar en la laptop.

Unidades de las medidas: metros, en los ejes de la guía (centro del carrito; `y` hacia arriba desde el piso).

## Medidas

| Nombre | Valor (m) |
|---|---|
| L | 0.5 |
| W | 0.4 |
| PF | 0.03 |
| HT | 1.051 |
| CH | 0.103 |
| TA | 0 |
| H0 | 0.103 |
| DH | 0.013 |
| POST | 0.948 |
| XI | 0.22 |
| ZI | 0.17 |
| XP | 0.235 |
| ZP | 0.185 |
| YB | 0.118 |
| YT | 1.036 |
| COLXF | 0.235 |
| COLXB | 0 |
| COLZC | 0.114 |
| COLZF | 0.131 |
| COLL | 0.888 |
| YSC | 1.036 |
| YEMP | 0.966 |
| WR | 0.051 |
| WW | 0.0503 |
| WX | 0.07 |
| WZ | 0.1295 |
| MOTF | 0.166 |
| CX | 0.218 |
| CZ | 0.1535 |
| CE | 0.039 |
| CR | 0.089 |
| XC | 0.133 |
| COLX0 | 0.023 |
| COLX1 | 0.243 |
| COLZ | 0.0845 |
| FL | 0.2129 |
| FW | 0.165 |
| PITCH | 0.07 |
| ECUZ | 0.1115 |
| BELT | 0.8215 |
| WIN0 | 0.8095 |
| WIN1 | 0.9065 |
| WINZ | 0.12 |
| LOAD0 | 0.8185 |
| UNL0 | 0.8235 |
| LSLO | 0.3835 |
| LSHI | 0.8315 |
| SX | 0.183 |
| SZ | 0.165 |
| RZ | 0.132 |
| GL | 0.018 |
| GLF | 0.008 |
| GT | 0.004 |
| GB | 0.3715 |
| GTB | 0.8965 |
| GTF | 0.8095 |
| PY0 | 0.8275 |
| PY1 | 0.8575 |
| P0 | 0.008 |
| STROKE | 0.25 |
| CLAWY | 0.8915 |
| CLAWZ | -0.02 |
| CLAWU | 0.0095 |
| RODY | 0.8655 |
| RODZ | 0.045 |
| RACKY | 0.8775 |
| PANX | 0.25 |
| PANT | 0.003 |

## Pasos, en orden

### Inventario

#### Estructura, tracción y energía

- **Qué:** Antes de armar, cuenten cada pieza contra la lista de compras y guárdenla en cajas etiquetadas por subsistema: tracción, torre, empujador, electrónica y tornillería.
- **Por qué:** Si falta una pieza a media etapa, se detiene todo. Y lo que se mide al recibir (altura y barrenos de las rodajas, conectores del M0601, resortes) corrige el CAD.
- **Herramienta:** Vernier, flexómetro, báscula de cocina, cajas con etiqueta.
- **Comprobar:** Hay un M0601 izquierdo (FIT1042) y uno derecho (FIT1038), no dos iguales.
- **Error común:** Comprar dos M0601 del mismo lado: una rueda giraría al revés de lo esperado y no embona igual.

#### Torre, empujador y fixtures

- **Qué:** Revisen las piezas de la torre y el empujador. Los husillos de UNIT ya están pedidos: en cuanto lleguen, midan cuánto avanza la tuerca en una vuelta.
- **Por qué:** Solo el husillo de 1 entrada (avance 2 mm) se autobloquea: si se va la energía, la pila no se cae.
- **Herramienta:** Plumón y vernier para la prueba del husillo.
- **Comprobar:** Prueba del husillo: con una vuelta la tuerca avanza 2 mm. Si avanza 8 mm es de 4 entradas: se usa el plan B (Etapa 9).
- **Error común:** Comprar el MG90S de 360°: no se queda en un ángulo. La uña necesita el de 180°.

#### Electrónica

- **Qué:** Cuenten los módulos (ESP32, 3 A4988, MAX485, convertidor, BNO055) y pruébenlos sueltos en el banco de pruebas (Etapa 2B) antes de soldar nada.
- **Por qué:** Un módulo dañado se descubre en la mesa, no con el carrito armado.
- **Herramienta:** Multímetro, protoboards y cables dupont.
- **Comprobar:** Batería cargada con el BR-700, marcando ~12.8 V en reposo.
- **Error común:** Probar un motor conectándolo "a ver qué pasa" a una fuente: nada se conecta hasta la Etapa 11.

### Etapa 6

#### Barra de 6 m + barra de 2 m + piezas cortas

- **Qué:** Ya tienen 1 barra de 6 m (PEI) y la de 2 m. De ahí salen todos los cortes largos: los 4 postes de 948, las 4 columnas de 888, un travesaño de 340 y el de 198. Faltan solo piezas cortas (440 × 4 y 340 × 5): salen de cualquier barra extra de la escuela de 440 mm o más (se cuentan el 16-oct).
- **Por qué:** Primero los largos de la barra de 6 m: si un corte sale mal, todavía queda material para repetirlo. Cada corte se come ~3 mm.
- **Herramienta:** Flexómetro, escuadra, plumón; para cortar: pulidora con disco de 1 mm (siguiente paso).
- **Comprobar:** La punta de cada barra está a escuadra; si no, recorten 5 mm para emparejarla.
- **Error común:** Medir cada pieza desde la anterior y no desde la punta: los errores se suman.

#### Cortar con pulidora y llegar a medida con lima

- **Qué:** Tracen la línea con escuadra en 2 caras. Con la barra sujeta en tornillo de banco o con prensas, corten con la pulidora 2–3 mm más largo que la medida. Esperen a que se enfríe y lleguen a la medida con la lima, revisando con escuadra y vernier. Las piezas iguales (postes, columnas, largueros) se liman prensadas juntas.
- **Por qué:** A mano la pulidora no corta exacto ni a escuadra: el corte largo y la lima lo corrigen. Prensadas juntas, las piezas iguales quedan idénticas.
- **Herramienta:** Pulidora de 4½" con discos de corte de 1 mm (nunca disco con dientes), tornillo de banco o prensas, lentes o careta, guantes, escuadra, vernier, lima plana y media caña.
- **Comprobar:** Largo final ±1 mm, corte a escuadra y una tuerca T entra en la ranura de cada pieza.
- **Error común:** Sostener la barra con la mano mientras cortan, o cortar justo a la medida: la pieza sale corta y ya no tiene arreglo.

#### Las 19 piezas, marcadas y ordenadas

- **Qué:** Marquen cada pieza con su nombre ("poste 1", "larguero arriba") y limpien la viruta de las ranuras con aire o una brocha.
- **Por qué:** Las 19 piezas se ven casi iguales; marcadas, cada una va a su lugar a la primera.
- **Herramienta:** Plumón, brocha o aire.
- **Comprobar:** Los 4 postes miden lo mismo (máximo 1 mm de diferencia); las 4 columnas, los 4 largueros y los travesaños, también.
- **Error común:** Postes de distinto largo: el carrito queda cojo y la torre se tuerce.

### Etapa 7

#### Postes y marco inferior con escuadras

- **Qué:** Paren los 4 postes en las esquinas y unan sus pies con los 2 largueros de 440 mm (lados largos) y los 2 travesaños de 340 mm (frente y atrás), al ras de abajo. En cada unión, 2 escuadras de aluminio por dentro.
- **Por qué:** Los tornillos M6 × 16 se aprietan solo a medias: primero hay que escuadrar.
- **Herramienta:** Llaves Allen, tornillos M6 × 16 y tuercas T de martillo.
- **Comprobar:** Las escuadras asientan planas contra el perfil y los tornillos entran sin forzar.
- **Error común:** Escuadra con las lengüetas fuera de la ranura: no asienta plana y el marco queda chueco. Las 2 lengüetas de cada pata van dentro de la ranura del perfil.

#### Tuercas T de martillo: entran de frente

- **Qué:** Las tuercas T de martillo se meten de frente en la ranura en cualquier momento: entran de lado y, al apretar el tornillo Allen, giran un cuarto de vuelta y se traban. Pongan tornillo, rondana, la pieza, y aprieten.
- **Por qué:** No hay que meterlas antes de cerrar el marco (como las hexagonales) y no giran en la ranura. 100 juegos alcanzan para todo el carrito.
- **Herramienta:** Tuercas T de martillo M6 para perfil 3030 (ranura de 8 mm), tornillos Allen M6 × 16, llave Allen de 5 mm.
- **Comprobar:** Al apretar, la tuerca se traba y el tornillo no gira en falso.
- **Error común:** Apretar sin que la tuerca haya girado: queda de lado y se sale. Den un toque al tornillo antes de apretar.

#### Escuadrar: las 2 diagonales iguales

- **Qué:** Midan las 2 diagonales del rectángulo de abajo con el flexómetro, de esquina exterior a esquina exterior. Si no son iguales (±2 mm), empujen la esquina larga hasta igualarlas y entonces aprieten firme.
- **Por qué:** Un rectángulo con diagonales iguales tiene sus 4 esquinas a escuadra; todo lo de arriba hereda este marco.
- **Herramienta:** Flexómetro y llave Allen.
- **Comprobar:** Diagonales del marco de abajo iguales (±2 mm).
- **Error común:** Apretar todo antes de escuadrar: luego no hay forma de enderezarlo.

#### Travesaño central

- **Qué:** Pongan el travesaño central de 340 mm a la mitad de los largueros, con 1 escuadra en cada lado, por el costado de atrás (por el frente pasan los motores de las ruedas).
- **Por qué:** Ahí se sujetan las placas pivotantes de los 2 motores.
- **Herramienta:** Llaves Allen, flexómetro.
- **Comprobar:** Queda a 250 mm de cada extremo y sus escuadras asientan planas.
- **Error común:** No dejar tuercas en la ranura de abajo del travesaño: ahí se atornillan los soportes del pivote.

#### Rodajas de 4" en las esquinas

- **Qué:** Las 4 rodajas van atornilladas directo bajo las esquinas del marco (así las montaron).
- **Por qué:** La rodaja mide 10.3 cm del piso a la cara de su placa: fija la altura del marco de abajo. Por eso las calzas de la suspensión miden 13 mm.
- **Herramienta:** Llaves Allen y de 13 mm.
- **Comprobar:** Paren la base en un piso plano: las 4 rodajas tocan el piso, giran 360° sin tocar nada y el freno traba.
- **Error común:** Tornillos flojos en la placa: la rodaja se tuerce al girar. Revisen el apriete cada semana.

#### Placas pivotantes de la suspensión

- **Qué:** Armen cada placa pivotante: 2 baleros 608ZZ a presión en sus huecos y el tornillo M8 de pivote atravesando, con rondanas y tuerca de seguridad.
- **Por qué:** La placa deja que la rueda suba y baje con el piso, y el resorte la empuja contra él.
- **Herramienta:** Llaves de 13 mm para M8, prensa para meter los baleros.
- **Comprobar:** La placa gira suave, sin juego.
- **Error común:** Meter el balero a golpes chuecos: se daña y la placa queda con juego.

#### Motores M0601: izquierdo y derecho

- **Qué:** Atornillen cada M0601 a su placa. El izquierdo (FIT1042) va del lado izquierdo viendo el carrito desde atrás hacia el frente, y el derecho (FIT1038) del derecho.
- **Por qué:** Cada uno trae su driver y su encoder; si se cruzan, una rueda gira al revés.
- **Herramienta:** Desarmador o Allen para los barrenos M2.5 del motor.
- **Comprobar:** Las 2 ruedas y las 4 rodajas tocan el piso al mismo tiempo.
- **Error común:** Montar dos del mismo lado: una rueda giraría al revés de lo esperado y no embona igual.

#### Resortes y precarga de 85 N

- **Qué:** Monten el tornillo guía M8 de cada resorte, el resorte y su tuerca. Con la base parada en el piso, aprieten la tuerca hasta que el resorte quede 28 mm más corto que su largo libre (de 75 a 47 mm).
- **Por qué:** Esa compresión da ~85 N en la rueda: no patina al arrancar y las rodajas no se levantan. El resorte va en la vertical del eje de la rueda.
- **Herramienta:** Vernier y llaves de 13 mm.
- **Comprobar:** Resortes comprimidos 28 mm, medidos con vernier.
- **Error común:** Demasiada precarga levanta las rodajas y el carrito se mece; muy poca y las ruedas patinan al arrancar.

#### Batería al centro, bien sujeta

- **Qué:** Coloquen la batería al centro y lo más abajo posible, con los bornes hacia donde irá la bandeja. Sujétenla con los topes impresos a los lados y una correa con hebilla alrededor de la batería y del travesaño central, bien tensa. Tapen los bornes con cinta de aislar.
- **Por qué:** 8.3 kg sueltos en un frenazo rompen algo. Abajo y al centro, baja el centro de gravedad.
- **Herramienta:** Correa de nylon con hebilla o cincho de trinquete (~1 m), cinta de aislar.
- **Comprobar:** La batería no se mueve aunque sacudan la base; empujada a mano, la base rueda derecho unos 3 m.
- **Error común:** Conectar algo en esta etapa: los bornes se quedan tapados hasta la Etapa 11.

### Etapa 8

#### Marco superior

- **Qué:** Pongan 2 largueros y 2 travesaños arriba, al ras de la punta de los postes, con 1 escuadra por unión (por abajo), apretada a medias. Las tuercas T entran de frente en cualquier momento.
- **Por qué:** Se cierra el cubo de aluminio; si se tuerce al empujar una esquina de arriba, la torre se va a trabar.
- **Herramienta:** Llaves Allen, tornillos M6 × 16, tuercas T.
- **Comprobar:** Todas las escuadras asientan y los tornillos están a medias, listos para escuadrar.
- **Error común:** Apretar de más el tornillo M6 en una pieza impresa: se raja. Firme, pero sin forzar.

#### Plomo, escuadra y diagonales de arriba

- **Qué:** Con el nivel de burbuja pegado a cada poste revisen que esté vertical en sus 2 caras, y con la escuadra metálica los 90° de cada esquina de arriba. Las diagonales de arriba, iguales (±2 mm). Midan el alto en las 4 esquinas y aprieten firme.
- **Por qué:** Un poste fuera de plomo tuerce la torre y el elevador se traba.
- **Herramienta:** Nivel de burbuja, escuadra metálica, flexómetro.
- **Comprobar:** Al empujar una esquina de arriba con la mano, la estructura no se tuerce visiblemente; mismo alto en las 4 esquinas.
- **Error común:** Si queda floja, agreguen una escuadra más por fuera en las esquinas de arriba; no la armen "así".

#### Columnas de la torre

- **Qué:** Deslicen de lado las 4 columnas de 888 mm entre el marco de abajo y el de arriba: 2 junto a los postes delanteros (a 23.2 cm entre caras: por ahí pasan las ECU, que sobresalen del fixture) y 2 sobre el travesaño central. Arriba, el travesaño superior central; entre las columnas traseras, el travesaño del empujador. Todo con placas de unión impresas, a medias.
- **Por qué:** Las guías, los husillos y el empujador necesitan algo firme a qué atornillarse en toda su altura. Las columnas forman una jaula alrededor de la torre (propuesta: no viene en la lista de cortes original).
- **Herramienta:** Llaves Allen, nivel de burbuja, escuadra metálica, flexómetro.
- **Comprobar:** Las 4 columnas a plomo. Entre las caras interiores de las delanteras hay 23.2 cm y entre las traseras 19.8 cm, en toda la altura.
- **Error común:** Apretar una columna antes de ponerla a plomo: después la torre queda chueca y el elevador se traba.

### Etapa 9

#### Guías en L en las 4 esquinas del fixture

- **Qué:** Atornillen las 4 guías en L a las columnas, en las esquinas de un hueco de 22.0 × 16.9 cm: las traseras con su pestaña a la cara frontal de la columna, las delanteras con su pestaña a la cara interior (tornillo avellanado).
- **Por qué:** Las guías solo tocan los postes de las esquinas del fixture (21.3 × 16.5 cm): ~3.5 mm adelante y atrás y 2 mm por lado. Más adentro no puede haber nada: ahí sobresalen las ECU. Con 2 mm por lado el fixture que entra queda alineado con los largueros del de abajo.
- **Herramienta:** Llaves Allen, tuercas M6, flexómetro.
- **Comprobar:** Las 4 guías a plomo y el hueco medido en arriba y abajo.
- **Error común:** Atornillar las guías sin probar el hueco: si roza, el fixture se atora a media pila.

#### Prueba del hueco con un fixture

- **Qué:** Suban y bajen a mano un fixture por todo el hueco.
- **Por qué:** Si a mano se traba, con motor se va a trabar peor.
- **Herramienta:** Un fixture impreso con sus 2 bastidores y su ECU.
- **Comprobar:** Un fixture sube y baja a mano por el hueco sin rozar.
- **Error común:** Si roza, aflojen la guía y muévanla; no lijen el fixture.

#### NEMA 17 y coples

- **Qué:** Atornillen cada soporte inferior a la cara trasera de la columna delantera y del poste, y los 2 NEMA 17 en sus soportes con el eje hacia arriba. Pongan un cople en cada eje y aprieten su prisionero sobre la parte plana.
- **Por qué:** El eje tiene forma de D: sobre la cara plana el cople no se patina.
- **Herramienta:** Llaves Allen chicas.
- **Comprobar:** El cople no gira sobre el eje aunque lo fuercen con los dedos.
- **Error común:** Prisionero del cople sobre la parte redonda del eje: se patina y la plataforma se desnivela.

#### KFL08 de abajo, husillos y KFL08 de arriba

- **Qué:** Atornillen una KFL08 justo arriba de cada cople, sin apretar sus prisioneros. Pasen cada husillo por su chumacera, métanlo en el cople y pongan la chumacera de arriba. Giren cada husillo con los dedos.
- **Por qué:** Debe girar suave y sin cabecear (que la punta no dibuje un círculo). Si cabecea, motor y chumaceras no están en línea.
- **Herramienta:** Llaves Allen, los dedos.
- **Comprobar:** Los 2 husillos giran sin cabecear.
- **Error común:** Motor y chumaceras desalineados: el motor vibra, se calienta y pierde pasos.

#### Varillas lisas y SC8UU

- **Qué:** Monten las 2 varillas lisas en sus soportes, con 2 SC8UU en cada una.
- **Por qué:** Los husillos suben la plataforma; las varillas la guían para que no se ladee ni gire.
- **Herramienta:** Llaves Allen, trapo y aceite ligero.
- **Comprobar:** Los SC8UU deslizan sin juego por toda la varilla.
- **Error común:** Varillas sucias o secas: límpienlas y pónganles una gota de aceite.

#### Plataforma y recorrido completo

- **Qué:** Atornillen las tuercas de latón y los SC8UU a los brazos de la plataforma. Bajen la plataforma girando los 2 husillos a mano, parejos, hasta que se vea su recorrido completo.
- **Por qué:** La carrera de trabajo va de 39.85 cm (pila llena al cargar) a 82.35 cm (descargar el último).
- **Herramienta:** Los dedos en los coples; grasa ligera o PTFE.
- **Comprobar:** Girando un cople con los dedos, la plataforma recorre toda la carrera sin trabarse.
- **Error común:** Husillos secos: chillan y el motor se queda corto de fuerza.

#### Prisioneros de las KFL08 inferiores

- **Qué:** Ahora sí, aprieten los 2 prisioneros de cada KFL08 inferior contra el husillo.
- **Por qué:** Así el peso de la pila (~22 N por tornillo) se apoya en la chumacera y no en el eje del motor, que solo aguanta ~10 N. El cople flexible no debe cargar peso.
- **Herramienta:** Llave Allen chica.
- **Comprobar:** Prisioneros de las chumaceras de abajo apretados.
- **Error común:** Olvidarlos: el peso queda en el eje del motor y en el cople.

#### Lubricar y nivelar a mano

- **Qué:** Lubricante seco de PTFE o una capa muy delgada de grasa ligera en la rosca. Las varillas y los SC8UU mantienen la plataforma derecha: lo que se iguala es la altura de las 2 tuercas T8. Aflojen los 4 tornillos de la tuerca de un lado, giren solo ese husillo hasta que su brida asiente plana contra el brazo y vuelvan a apretar. Luego midan la altura de la plataforma en sus 4 esquinas.
- **Por qué:** Se hace una vez: después los 2 motores reciben los mismos pasos (STEP, DIR y EN compartidos) y se mueven juntos.
- **Herramienta:** Lubricante seco de PTFE, flexómetro.
- **Comprobar:** Plataforma nivelada: diferencia menor a 1 mm entre esquinas.
- **Error común:** Grasa de más: el husillo apenas se autobloquea y la plataforma se escurre con la vibración.

#### Finales de carrera y prueba de autobloqueo

- **Qué:** Atornillen un final de carrera abajo de cada husillo, para que su palanca se presione cuando la plataforma llegue a 38.35 cm, y el superior de cabeza en el soporte de arriba del lado derecho (tope a 83.15 cm). Luego suban la plataforma a la mitad, pónganle 6 fixtures (~3 kg) y suéltenla.
- **Por qué:** El home de cada lado da el cero del elevador; si uno toca y el otro no, la plataforma está desnivelada y el ESP32 lo reporta.
- **Herramienta:** Desarmador, cables, 6 fixtures o 3 kg de peso.
- **Comprobar:** Con 3 kg encima, la plataforma no baja sola.
- **Error común:** Si baja sola, el husillo es de 4 entradas (8 mm por vuelta): plan B — el paro no le corta la energía al elevador y el programa baja la plataforma con batería baja; o varilla roscada M8 de ferretería.

### Etapa 10

#### Varillas, carro, placa y cremallera

- **Qué:** Atornillen los soportes delanteros de las varillas y del NEMA al travesaño del empujador, y los traseros al travesaño superior trasero. Monten las 2 varillas de 30 cm, horizontales. Atornillen la placa empujadora al carro y el carro a los 2 SC8UU. Unan los 2 tramos de la cremallera con tornillos M3, cuidando que los dientes sigan parejos.
- **Por qué:** La placa debe quedar entre 0.6 y 3.6 cm arriba de la superficie de la banda: así toca el travesaño trasero del fixture de arriba y nunca el de abajo.
- **Herramienta:** Llaves Allen, tornillos M3.
- **Comprobar:** La placa empuja el travesaño trasero del fixture de arriba sin tocar el de abajo.
- **Error común:** Placa muy baja: arrastra el fixture de abajo al descargar.

#### NEMA 17 y piñón

- **Qué:** Pongan el piñón en el eje del NEMA 17 con su prisionero M3 sobre la cara plana. Acerquen el motor a la cremallera hasta que engrane con un poquito de juego.
- **Por qué:** Ni flojo (salta) ni apretado (se traba).
- **Herramienta:** Llave Allen chica.
- **Comprobar:** El piñón engrana con la cremallera sin trabarse en los 30 cm.
- **Error común:** Piñón muy apretado contra la cremallera: el motor pierde pasos y se oye un "tac-tac".

#### Prueba a mano: 25 cm de carrera

- **Qué:** Giren el piñón con los dedos: el carro debe recorrer 25 cm sin trabarse y la placa debe asomarse por la ventana al final.
- **Por qué:** Con 25 cm el fixture sale completo hacia la estación de descarga.
- **Herramienta:** Los dedos.
- **Comprobar:** El carro recorre los 25 cm a mano sin trabarse.
- **Error común:** Si a mano se traba, con el motor se traba peor: revisen varillas paralelas y la unión de la cremallera.

#### La uña: MG90S y dedo abatible

- **Qué:** Atornillen el MG90S a la pared de su soporte con sus 2 tornillos, con la flecha hacia el frente. Pongan su brazo y atornillen a él el dedo de la uña (2 × M2, los que trae el servo). Al frente, un M3 × 12 pasa por la oreja del soporte y se rosca en el dedo: es su perno.
- **Por qué:** El jalón del fixture va a lo largo del eje: lo aguantan el perno y la oreja, no los engranes del servo. Los ángulos exactos de "arriba" y "abajo" se ajustan con el programa en la Etapa 12.
- **Herramienta:** Desarmador fino, Allen de 2.5 mm.
- **Comprobar:** El dedo gira de acostado (hacia la derecha) a colgado sin rozar el soporte ni el carro.
- **Error común:** Ajustar el brazo a la fuerza con la mano: se rompen los engranes del servo.

#### Prueba a mano de la uña

- **Qué:** Con la plataforma a la altura de carga (81.85 cm), pongan un fixture como si la banda lo hubiera dejado: ~6 cm salido por la ventana. Adelanten el carro hasta que la uña quede sobre el hueco entre el travesaño trasero y la ECU, bájenla (gira 90° y cuelga con la punta a 2 cm de la quilla) y jalen el carro hacia atrás. El fixture se desliza sobre los largueros del de abajo (o sobre la plataforma) sin cabecear.
- **Por qué:** La cinta deja de apoyar 6 cm antes de la tapa de la banda: el fixture cae a la pila con ~6 cm afuera y la uña jala los ~7.6 cm que faltan.
- **Herramienta:** Los dedos y un fixture de prueba.
- **Comprobar:** Jalado a mano, el fixture queda centrado en la torre (holgura de ~3.5 mm atrás y adelante).
- **Error común:** La uña cae sobre el travesaño o sobre la ECU: recalibren la posición de espera del empujador (la zona libre mide 16 mm).

### Etapa 11

#### Placa principal en la mesa

- **Qué:** Dibujen primero en papel dónde va cada cosa. Suelden tira header hembra para el ESP32 y cada módulo, borneras KF301 en las orillas, las resistencias y un capacitor de 100 µF junto a cada A4988 (pata larga al +). Hagan clic en cualquier pieza para ver a dónde va cada pin.
- **Por qué:** Con headers, un driver quemado se cambia en segundos. Todo se arma fuera del carrito, donde es fácil medir.
- **Herramienta:** Cautín de 40–60 W, soldadura 60/40, flux, thermofit, multímetro.
- **Comprobar:** Todas las tierras unidas: hay continuidad entre batería − y GND del ESP32.
- **Error común:** Puentes de soldadura entre pines vecinos: revísenlos con lupa y con la prueba de continuidad.

#### Cableado de la placa (103 cables)

- **Qué:** Hagan las conexiones del mapa de pines con cable 22 AWG. En el modo súper explicativo se ve cable por cable; aquí, todos de un jalón. Código de colores: rojo 12 V · naranja 5 V · rosa 3.3 V · negro GND · verde STEP · azul DIR · café ENABLE · gris y turquesa bobinas · amarillo SDA · blanco SCL · morado RS485.
- **Por qué:** Con un color por función, cualquier error se ve a simple vista y se puede revisar con la tabla de cables.
- **Herramienta:** Cautín, cable 22 AWG de colores, pelacables, multímetro.
- **Comprobar:** Cada cable de la tabla pita en continuidad de punta a punta y no pita con los pines vecinos.
- **Error común:** Contar mal los pines del ESP32: cuenten desde el USB y marquen con plumón.

#### Ajustar voltajes antes de conectar nada

- **Qué:** Conecten 12 V a cada módulo y, sin nada a la salida, giren su potenciómetro hasta leer 5.0–5.1 V en el XL4005 y 18.0 V en el elevador; luego, con el multímetro en 10 A entre OUT+ y OUT− del elevador, la perilla de corriente (CC) a ~6 A (si no se sienten seguros, déjenla como venía). Ajusten el Vref de los 3 A4988 sin motor conectado.
- **Por qué:** La mayoría de las piezas se queman por un voltaje equivocado. Marquen cada módulo con su voltaje en cinta.
- **Herramienta:** Multímetro y desarmador fino (de plástico para el Vref).
- **Comprobar:** XL4005 en 5.0–5.1 V y elevador en 18.0 V, medidos.
- **Error común:** Conectar o desconectar un motor a pasos con el driver encendido: quema el A4988.

#### Fusibles, relé y prueba de humo

- **Qué:** Del lado de la batería, XT60 hembra; del lado del carrito, el macho a 2 portafusibles: 15 A para motores y drivers (por el relé), 5 A para Jetson y lógica (con el KCD1). El relé se alimenta pasando por el contacto NC del paro. Prueba de humo sin ESP32 ni motores.
- **Por qué:** Si alguien aprieta el paro, el relé se suelta y corta motores y drivers aunque el programa esté colgado.
- **Herramienta:** Cautín, XT60, terminales de ojillo, multímetro.
- **Comprobar:** El paro corta el relé y deja 0 V en la rama de motores; nada se calienta en 2 minutos.
- **Error común:** Conectar al revés (+ con −): quema el ESP32 o el módulo al instante. Midan antes de conectar.

### Etapa 13

#### La bandeja al carrito

- **Qué:** Con el XT60 desconectado, atornillen la bandeja y sobre ella la placa, el elevador, el relé y el XL4005 con separadores M3. Pongan portafusibles, KCD1 y paro donde se alcancen desde afuera.
- **Por qué:** Lo que ya funcionó en la mesa solo se pasa al carrito; cualquier falla nueva es del montaje.
- **Herramienta:** Separadores M3, desarmador, cinchos.
- **Comprobar:** Con el XT60 desconectado, el multímetro en continuidad entre + y − no pita (no hay corto).
- **Error común:** Dejar la placa tocando el aluminio: un corto en cuanto el carrito vibra.

#### Sensores: 4 VL53L0X

- **Qué:** Monten 3 VL53L0X de obstáculos a ~20 cm del piso (frente y los 2 lados) y 1 arriba de la torre mirando hacia abajo, sobre la esquina trasera de un costado.
- **Por qué:** Los 3 de abajo frenan el carrito sin esperar al Jetson; el de arriba confirma que hay un fixture en la pila.
- **Herramienta:** Desarmador, tornillos M2, soportes impresos.
- **Comprobar:** Los 4 VL53L0X responden en 0x30–0x33 y miden bien a 10, 30 y 60 cm.
- **Error común:** Cables de señal pegados a los de potencia: los VL53L0X y el RS485 fallan "al azar".

#### Jetson, cámara y paro de emergencia

- **Qué:** Atornillen el Jetson arriba. Antes de enchufarle el plug, midan con el multímetro que el centro sea el +. Conecten la cámara y el USB al ESP32.
- **Por qué:** El paro queda al alcance de la mano en cualquier momento del ciclo.
- **Herramienta:** Multímetro, desarmador.
- **Comprobar:** El paro detiene ruedas, elevador y empujador al instante y la plataforma se queda donde estaba.
- **Error común:** Plug del Jetson con la polaridad al revés: se daña el Jetson. Midan siempre antes.

#### Cableado por colores

- **Qué:** Potencia (14 AWG) por un lado y señal (22 AWG) por otro, un cincho cada ~10 cm. Cada NEMA a su bornera (J7, J8, J9), finales de carrera como NC a J4 (el superior a J13), un hilo del VCC del relé a J13 PARO y cada cable etiquetado en sus dos puntas.
- **Por qué:** Un cable flojo o rozando algo que se mueve es la falla más común el día de la demo.
- **Herramienta:** Cinchos, etiquetas, multímetro.
- **Comprobar:** Ningún cable roza la plataforma, el empujador ni las ruedas en todo su recorrido.
- **Error común:** Cable del servo sin curva floja: se jala en los 25 cm de recorrido.

### Etapa 16

#### Panel frontal de MDF con la ventana

- **Qué:** Corten el MDF con caladora a la medida del frente. Marquen la ventana, barrenen sus 4 esquinas y córtenla; lijen y pinten. Se atornilla con tuercas T. En la guía este paso va al final (Etapa 16), porque estorba para trabajar.
- **Por qué:** Debajo de la ventana, la pared frontal es el tope que retiene los fixtures de abajo: solo sale el de arriba.
- **Herramienta:** Caladora, taladro, lija, pintura en aerosol.
- **Comprobar:** Las pruebas finales se hacen con el panel puesto.
- **Error común:** Probar siempre sin el panel: con el panel puesto algo puede rozar.

### Funcionamiento

#### La banda completa: 3 tramos y una sola cinta

- **Qué:** Su modelo de SolidWorks es un tercio de la banda: aquí son 3 tramos de 1030 mm pegados (3.09 m) con una sola cinta de 20.35 cm que abraza el rodillo de Ø85 de la punta lejana y los 2 de Ø50 del extremo cerrado. El carrito siempre llega por el extremo cerrado.
- **Por qué:** Es una sola cinta: se detiene para la inspección y vuelve a correr para traer el fixture, sin esperar al carrito. Por eso va un fixture a la vez y el PLC suelta el siguiente solo cuando el carrito avisa "listo" (ver "Cargar hasta 6").
- **Herramienta:** —
- **Comprobar:** Midan la velocidad real (marca en la cinta y cronómetro en 1 m) y la altura de la cinta: aquí se supuso 0.20 m/s; la cinta está a 82.15 cm (medida).
- **Error común:** Poner un fixture sin el carrito acoplado: llega a la punta y se cae al piso (83 cm). El extremo cerrado no tiene tope donde pasa la cinta.

#### Acople en la banda

- **Qué:** El carrito llega por waypoints y entra despacio (5 cm/s): las guías en V atornilladas a la banda toman sus postes delanteros y lo centran, y avanza hasta que el panel pega en los 2 topes (el M0601 se frena y lo reporta). El Jetson confirma con el ArUco. Hace home del elevador y del empujador y deja la plataforma a 81.85 cm: 3 mm debajo de la cinta. Hasta entonces avisa "listo" y se pone el primer fixture en la punta lejana.
- **Por qué:** Después de la inspección la cinta corre hasta la punta: un fixture soltado antes de tiempo llega sin carrito y se cae. Por eso el PLC espera el "listo".
- **Herramienta:** Programa del ESP32 y del Jetson (Etapa 14).
- **Comprobar:** La ventana queda frente a la banda, centrada (±5 mm) y a menos de 1 cm de la tapa.
- **Error común:** Carrito separado de la tapa: el hueco sin apoyo crece y el frente del fixture cae más de 3 mm al entrar.

#### Carga con la cinta corriendo

- **Qué:** El fixture viaja con la cinta. Cuando su centro pasa la cresta del rodillo, el frente baja los 3 mm a la pila y queda apoyado en la cresta y en su esquina. La cinta lo sigue empujando hasta que la cola deja la cresta y cae plano, ~6 cm afuera de la ventana. La uña baja, el empujador lo jala ~7.6 cm, afloja, sube la uña, regresa a home y la plataforma baja un nivel. Todo eso con la cinta corriendo.
- **Por qué:** Apoyado en la cresta y en su esquina, sobre la cinta queda siempre ≥ 50 % del peso: si la cinta agarra más que el PETG sobre PETG, lo saca completo. Si se atora antes, la uña lo alcanza igual (llega hasta la cresta).
- **Herramienta:** —
- **Comprobar:** Prueben con un fixture real: si sale completo, cae a ~6 cm de la ventana; si se queda antes, anoten dónde. El VL53L0X confirma y la cámara reconoce la ECU (YOLO).
- **Error común:** Pila más de 3 mm abajo de la cinta: el frente cae más y puede atorarse con el chaflán contra el borde.

#### Cargar hasta 6: uno a la vez

- **Qué:** El ciclo se repite con la cinta corriendo: cada fixture cae a la misma altura y la pila baja 7.0 cm. El siguiente se pone en la punta lejana cuando el anterior ya cayó: un ciclo completo tarda ~15 s y a 0.20 m/s eso son ~3.0 m de cinta. Va uno a la vez: el PLC lo suelta (y lo detiene en la inspección) cuando el carrito avisa "listo".
- **Por qué:** Si el siguiente llega mientras la plataforma baja, no hay pila a 3 mm de la cinta: se cae dentro de la torre y se atora. Como la cinta no se detiene durante la carga, se evita con la regla de un fixture a la vez y el "listo" del carrito.
- **Herramienta:** —
- **Comprobar:** Quien pone los fixtures espera el aviso de "listo" del carrito (en la interfaz) antes de poner el siguiente.
- **Error común:** Poner 2 o 3 seguidos "para ganar tiempo": el segundo llega con la plataforma bajando.

#### Viaje a la estación de descarga

- **Qué:** El carrito sale de la banda y navega por waypoints. El ESP32 cuenta las vueltas de los M0601 a 50 Hz para la odometría y frena solo si un VL53L0X ve algo a menos de 40 cm. En la banda, las guías en V y los topes lo centran otra vez.
- **Por qué:** Con 6 fixtures el pico de par sigue dentro del límite de los motores.
- **Herramienta:** —
- **Comprobar:** Llega a la banda con menos de ±5 cm de error de lado: es lo que toman las guías en V.
- **Error común:** Desconectar el USB del Jetson y que siga andando: el watchdog debe detener las ruedas en menos de 1 s.

#### Descarga: home y subir al nivel de la ventana

- **Qué:** Al llegar, el elevador hace home (así se corrige si la plataforma se escurrió al rodar). Luego sube, por pasos contados, hasta que el fixture de arriba quede en la ventana: su base 2 mm sobre la banda y 1.4 cm sobre el borde.
- **Por qué:** El borde de la ventana queda a la altura del fixture de abajo: ese topa con la pared frontal y no se arrastra.
- **Herramienta:** —
- **Comprobar:** El VL53L0X confirma que el fixture está en la ventana.
- **Error común:** Plataforma a mala altura o placa muy baja: se arrastra el de abajo.

#### El empujador saca el de arriba

- **Qué:** El empujador avanza 25 cm y regresa a home. El fixture sale por la ventana a la orilla de la mesa (~2 mm abajo de su base) y se desliza solo hasta el tope o hasta el fixture anterior.
- **Por qué:** Al deslizarse deja libre la entrada para el siguiente; en una mesa plana el empujador tendría que arrastrar toda la fila y no le alcanza la fuerza.
- **Herramienta:** —
- **Comprobar:** El VL53L0X confirma que la ventana quedó vacía; n = n − 1.
- **Error común:** Mesa con poca inclinación: el fixture se queda frente a la ventana y el siguiente choca con él. Suban la cuña (melamina ~12–15°, MDF crudo ~20°).

#### Repetir hasta vaciar la torre

- **Qué:** La plataforma sube otro nivel y el empujador saca el siguiente, hasta que la torre queda vacía. Después, el carrito regresa a la banda.
- **Por qué:** Cada fixture se identificó al entrar (YOLO reconoce su ECU), así que el orden inverso no importa para el inventario.
- **Herramienta:** —
- **Comprobar:** Caben los 6 fixtures en la mesa sin encimarse y la entrada queda libre después de cada uno.
- **Error común:** Orilla de la mesa más alta que la base del fixture: el empujador lo empuja contra un escalón. Debe quedar ~2 mm abajo, nunca arriba.

## Componentes

### Poste de perfil 3030 · 948 mm

- **Cantidad:** 4
- **Función:** Las 4 esquinas del carrito: sostienen el marco de arriba y le dan la altura (tope a ~1.05 m).
- **Montaje:** Parados en las esquinas, unidos a los marcos con escuadras de aluminio y tornillos Allen M6 × 16 con tuerca T. Se aprietan a medias, se escuadra y luego se aprietan firme.
- **Comprobar:** Los 4 miden lo mismo (±1 mm) y quedan a plomo en sus 2 caras.
- **Error común:** Postes de distinto largo: el carrito queda cojo y la torre se tuerce.
- **Datos:** Perfil 3030, ranura de 8 mm; Salen de la barra de 6 m

### Larguero · 440 mm

- **Cantidad:** 4
- **Función:** Lados largos (500 mm por fuera) de los marcos de abajo y de arriba.
- **Montaje:** Entre los postes, al ras de abajo (marco inferior) o de la punta (marco superior), con escuadras de aluminio.
- **Comprobar:** Diagonales del marco iguales (±2 mm).
- **Error común:** Medir desde la pieza anterior y no desde la punta: los errores se suman.
- **Datos:** Faltan: salen de las barras extra de la escuela

### Travesaño de marco · 340 mm

- **Cantidad:** 4
- **Función:** Frente y atrás de los marcos (400 mm por fuera).
- **Montaje:** Entre los postes, con escuadras de aluminio.
- **Comprobar:** Escuadras planas contra el perfil.
- **Error común:** Apretar antes de escuadrar.

### Travesaño central · 340 mm

- **Cantidad:** 1
- **Función:** De aquí cuelgan las placas pivotantes de los motores, y sobre él se paran las columnas traseras de la torre.
- **Montaje:** A la mitad de los largueros de abajo (250 mm de cada punta), 1 escuadra por lado, por el costado de atrás.
- **Comprobar:** A 250 mm de cada extremo.
- **Error común:** Olvidar las tuercas T de la ranura de abajo: ahí van los soportes del pivote.

### Columna de la torre · 888 mm

- **Cantidad:** 4
- **Función:** Jaula de la torre: a ellas se atornillan las guías de la pila, los soportes del elevador y el empujador.
- **Montaje:** Entre el marco de abajo y el de arriba: 2 junto a los postes delanteros (a ±13.1 cm del centro: por ahí pasan las ECU) y 2 sobre el travesaño central. Escuadras de aluminio y placas de unión impresas.
- **Comprobar:** A plomo; entre caras interiores: 23.2 cm las delanteras y 19.8 cm las traseras, en toda la altura.
- **Error común:** Columnas fuera de plomo: el fixture roza y se atora a media pila.
- **Datos:** Propuesta rev. 3.4 (delanteras abiertas para las ECU); 2 de la barra de 6 m, 2 de la de 2 m

### Travesaño superior central · 340 mm

- **Cantidad:** 1
- **Función:** Sostiene arriba las columnas traseras.
- **Montaje:** Entre los largueros superiores, a la mitad.
- **Comprobar:** Firme y nivelado.

### Travesaño del empujador · 198 mm

- **Cantidad:** 1
- **Función:** De aquí cuelgan las varillas del empujador y su NEMA 17.
- **Montaje:** Entre las 2 columnas traseras, a ~95 cm.
- **Comprobar:** Paralelo al piso.

### Escuadras de aluminio para 3030

- **Cantidad:** 24
- **Función:** Unen los perfiles a 90°.
- **Montaje:** Por dentro de cada unión, con tornillos M6 × 12 y tuercas T de martillo; las lengüetas de cada pata dentro de la ranura.
- **Comprobar:** Asientan planas y el tornillo entra al centro de la ranura.
- **Error común:** Las lengüetas fuera de la ranura: la escuadra queda chueca.
- **Datos:** dibujada con el STEP del equipo: 35 × 35 × 29 mm · la compra revisada era de 28 × 28 × 28

### Placas de unión impresas

- **Cantidad:** 12
- **Función:** Unen columnas y travesaños de la torre donde las caras quedan al mismo plano (ahí una escuadra no tiene dónde ir).
- **Montaje:** Planas sobre las caras al mismo plano, 2 tornillos M6 × 12 por perfil con tuerca T (la de arriba de las columnas traseras une 3 perfiles: 6 tornillos). Las del lado izquierdo son las mismas volteadas.
- **Comprobar:** Los tornillos entran derecho a la tuerca: si hay que forzarlos, la tuerca no está bajo el barreno.

### Tuerca T de martillo + Allen M6

- **Cantidad:** 100 juegos
- **Función:** Sujetan todo al perfil: escuadras, soportes, bandeja, panel.
- **Montaje:** Entran de frente en la ranura (aun con el marco armado); al apretar el tornillo giran 90° y se traban.
- **Comprobar:** La tuerca se traba y el tornillo no gira en falso.
- **Error común:** Apretar sin que la tuerca haya girado: queda de lado y se sale.
- **Datos:** Para perfil 3030, ranura de 8 mm; Tornillos M6 × 16 (70) y M6 × 20 (30)

### Panel frontal MDF 3 mm

- **Cantidad:** 1
- **Función:** Tope de la pila: debajo de la ventana retiene los fixtures de abajo; solo sale el de arriba.
- **Montaje:** Atornillado a los postes delanteros con tuercas T. Ventana de 24 × 9.7 cm con borde inferior a 80.95 cm.
- **Comprobar:** El fixture de arriba sale y el de abajo topa.
- **Error común:** Ventana más baja: se arrastra el de abajo.

### Calzas de los soportes delanteros del empujador

- **Cantidad:** 2
- **Función:** Bajan 19.5 mm los soportes delanteros: el travesaño del empujador lo fija la placa impresa y quedó 19.5 mm alto respecto a la cinta.
- **Montaje:** Entre el travesaño del empujador y cada soporte: la derecha con 2 tornillos M6 × 35 (z 18 y 40) y la izquierda con 1 (z −30), cada uno con rondana bajo la cabeza y tuerca T de martillo en la ranura de abajo del travesaño.
- **Comprobar:** Las varillas del empujador quedan a 86.55 cm del piso.
- **Error común:** Olvidarlas: la placa de empuje queda 19.5 mm alta y la uña no alcanza el travesaño del fixture.
- **Datos:** PETG · 19.5 mm de alto · 30 mm de ancho (el del perfil); Derecha 44 mm de largo (~22 cm³), izquierda 36 mm (~15 cm³); Barrenos Ø6.6 con boss Ø14; ventanas pasantes; Se imprimen acostadas, sin soportes: 3 paredes, 25 % de relleno

### Rodaja Unicame 4" con freno

- **Cantidad:** 4
- **Función:** Las 4 esquinas ruedan libres; las 2 ruedas motrices empujan.
- **Montaje:** Placa de la rodaja atornillada directo bajo la esquina del marco (rev. 3.18: sin placa adaptadora).
- **Comprobar:** Las 4 tocan el piso, giran 360° sin tocar nada y el freno traba.
- **Error común:** Tornillos flojos: la rodaja se tuerce al girar.
- **Datos:** rueda de poliuretano 100 × 31 mm · doble balero · placa 93 × 64; altura de montaje 10.3 cm (medida) SUPUESTA (medirla) · radio de giro ~89 mm

### Placa pivotante de la suspensión

- **Cantidad:** 2
- **Función:** Deja que la rueda suba y baje con el piso; el resorte la empuja contra él.
- **Montaje:** Pieza impresa: 2 baleros 608ZZ a presión en la maza con una rondana M8 entre ellos, perno M8 × 45 con la tuerca metida por abajo en el soporte, que va al travesaño central con 1 M6. El M0601 se atornilla a la placa en la mesa (3 × M2.5 × 12 de cabeza plana avellanada, al ras: una cabeza Allen roza el resorte) antes de montarla: después ya no se alcanza el tornillo de abajo.
- **Comprobar:** Gira suave, sin juego.
- **Error común:** Meter los baleros a golpes chuecos.

### Resorte de compresión

- **Cantidad:** 2
- **Función:** Da ~85 N de fuerza a cada rueda: no patina al arrancar y las rodajas no se levantan.
- **Montaje:** En el tornillo guía M8, en la vertical del eje. Se precarga 28 mm (de 75 a 47 mm) con la base en el piso.
- **Comprobar:** Comprimido 28 mm.
- **Error común:** Demasiada precarga: levanta las rodajas.
- **Datos:** Alambre 2 mm · Ø20 · k ≈ 3 N/mm

### Motor-rueda M0601

- **Cantidad:** 2
- **Función:** Las 2 ruedas motrices: cada una trae su driver y encoder; se manejan por RS485 desde el ESP32.
- **Montaje:** Atornillado a su placa pivotante (M2.5). Potencia: 18 V del elevador de voltaje (pin 1 +, pin 2 −). Señal: pin 1 GND, pin 2 A, pin 3 B del bus RS485 (J3).
- **Comprobar:** Responde a su ID por RS485 con la rueda en el aire.
- **Error común:** Montar 2 del mismo lado.
- **Datos:** Rueda Ø102 mm · 10 kg por rueda
- **:** ID 1 en el bus RS485. Cable de potencia: cab_18_L; señal: cab_485_L.
- **:** ID 2 en el bus RS485. Cable de potencia: cab_18_R; señal: cab_485_R.

### Cuna impresa de la batería

- **Cantidad:** 1
- **Función:** Asiento de la batería sobre el marco inferior; deja libres las muescas de las columnas traseras.
- **Montaje:** Sobre los largueros y el travesaño central.
- **Comprobar:** La batería no se mueve.

### Batería BR-1224 (12 V, 24 Ah)

- **Cantidad:** 1
- **Función:** Energía de todo el carrito (~8.3 kg, abajo y al centro).
- **Montaje:** Al centro, bornes hacia la bandeja. Borne + → XT60 → fusibles; borne − → tierra común (IN− del elevador).
- **Comprobar:** ~12.8 V en reposo.
- **Error común:** Tocar los 2 bornes con algo metálico: un corto de 24 Ah derrite cables.

### Correa con hebilla (o cincho de trinquete)

- **Cantidad:** 1
- **Función:** Sujeta la batería: 8.3 kg sueltos en un frenazo rompen algo.
- **Montaje:** Alrededor de la batería y del travesaño central, pasando por la cuna; topes impresos a los lados. Bien tensa.
- **Comprobar:** La batería no se mueve aunque sacudan la base.
- **Error común:** Dejarla floja.
- **Datos:** Decidido 15-oct en lugar de varilla roscada

### Guía en L impresa

- **Cantidad:** 4
- **Función:** Guían la pila tocando los postes de las 4 esquinas del fixture: hueco de 22.0 × 16.9 cm (3.5 mm adelante y atrás, 2 mm por lado). Más adentro no pueden ir: ahí sobresalen las ECU.
- **Montaje:** Traseras: pestaña a la cara frontal de las columnas traseras. Delanteras: pestaña hasta la cara interior de las columnas delanteras (tornillo avellanado). Ala lateral de 8 mm.
- **Comprobar:** Un fixture sube y baja a mano sin rozar.
- **Error común:** No probar el hueco antes de apretar.
- **:** Llega a ~90 cm.
- **:** Llega a ~90 cm.
- **:** Termina en el borde de la ventana (80.95 cm).
- **:** Termina en el borde de la ventana (80.95 cm).

### Soporte inferior (NEMA + KFL08)

- **Cantidad:** 2
- **Función:** Carga el NEMA, la chumacera de abajo, la varilla y el final de carrera, todo alineado.
- **Montaje:** A la cara trasera de la columna delantera y al poste, con tuercas T.
- **Comprobar:** No se mueve.

### Soporte superior (KFL08)

- **Cantidad:** 2
- **Función:** Sostiene la chumacera de arriba y la punta de la varilla. Desde la rev. 3.17c trae la pestaña del final de carrera superior (los 2 lados; solo el derecho lo lleva).
- **Montaje:** A la columna delantera y al poste, arriba.
- **Comprobar:** El husillo no cabecea.

### NEMA 17 del elevador (17HS4401)

- **Cantidad:** 2
- **Función:** Gira el husillo de su lado. Los 2 reciben los mismos pasos (STEP, DIR y ENABLE compartidos), cada uno con su propio A4988 a 1.0 A.
- **Montaje:** En el soporte inferior, eje hacia arriba, 4 tornillos M3 × 8. Su cable va a la bornera de su driver.
- **Comprobar:** 3200 pasos = 1 vuelta.
- **Error común:** Conectar o desconectar con el driver prendido.
- **:** Cable → J7 → A4988 #1. Bobina A a 1A/1B, bobina B a 2A/2B.
- **:** Cable → J8 → A4988 #2.

### Cople flexible 5 → 8 mm

- **Cantidad:** 2
- **Función:** Une el eje del NEMA (5 mm) con el husillo (8 mm) y absorbe pequeñas desalineaciones.
- **Montaje:** Prisionero sobre la cara plana del eje del motor.
- **Comprobar:** No patina.
- **Error común:** Prisionero en la parte redonda.

### Chumacera KFL08

- **Cantidad:** 4
- **Función:** Sostienen los husillos.
- **Montaje:** 2 por husillo, atornilladas a los soportes.
- **Comprobar:** El husillo gira suave.
- **:** Con sus prisioneros apretados: carga el peso de la pila (~22 N), no el motor.
- **:** Prisioneros apretados: carga el peso.
- **:** Solo guía.
- **:** Solo guía.

### Husillo TR8 · 60 cm

- **Cantidad:** 2
- **Función:** Suben y bajan la plataforma. Si son de 1 entrada (2 mm por vuelta) se autobloquean: sin energía, la pila no se cae.
- **Montaje:** Del cople, por las 2 KFL08; la tuerca de latón va en el brazo de la plataforma. Lubricante seco de PTFE.
- **Comprobar:** Al recibirlo: una vuelta de la tuerca = 2 mm.
- **Error común:** Si avanza 8 mm (4 entradas): plan B — el paro no corta el elevador y el programa baja la plataforma con batería baja; o varilla roscada M8.
- **Datos:** UNIT · avance por medir

### Varilla lisa 8 mm × 60 cm

- **Cantidad:** 2
- **Función:** Guían la plataforma para que no se ladee ni gire.
- **Montaje:** En los soportes de abajo y arriba, con 2 SC8UU cada una.
- **Comprobar:** Los SC8UU deslizan sin juego.
- **Error común:** Varillas sucias o secas.

### Rodamiento lineal SC8UU

- **Cantidad:** 6
- **Función:** Deslizan sobre las varillas de 8 mm.
- **Montaje:** Atornillados con M4 × 12 a los brazos de la plataforma (4) y al carro del empujador (2).
- **Comprobar:** Sin juego.

### Tuerca T8 de latón

- **Cantidad:** 2
- **Función:** Convierte el giro del husillo en subida/bajada de la plataforma.
- **Montaje:** En cada brazo de la plataforma, 4 tornillos M3 × 16.
- **Comprobar:** Sin juego.

### Plataforma impresa 21.3 × 16.5 cm

- **Cantidad:** 1
- **Función:** Carga la pila de fixtures: de 39.85 cm (llena, al cargar) a 82.35 cm (último, al descargar).
- **Montaje:** Sus 2 brazos llevan la tuerca de latón y los SC8UU.
- **Comprobar:** Recorre toda la carrera a mano sin trabarse.
- **Error común:** Husillos secos.

### Final de carrera (contacto NC)

- **Cantidad:** 4
- **Función:** Dan el cero (home) del elevador de cada lado y del empujador; el cuarto es el tope de arriba del elevador.
- **Montaje:** COM → GND y NC → su GPIO (INPUT_PULLUP), por la bornera J4. NO sin conectar. Si un cable se rompe, se lee como "presionado" y el motor se detiene.
- **Comprobar:** Suelto lee 0, presionado lee 1, sin cable lee 1.
- **Error común:** Usar el contacto NO.
- **:** J4 FC1 → GPIO 18. Home a 38.35 cm: el brazo pisa la rueda 1.5 mm.
- **:** J4 FC2 → GPIO 19.
- **:** Gira sobre su bisagra cuando el brazo la pisa.
- **:** Gira sobre su bisagra cuando el brazo la pisa.
- **:** La sube 1.5–2 mm la rampa del travesaño del carro.
- **:** J13 FC4 → GPIO 35 con pull-up externo de 10 kΩ. De cabeza en la pestaña del soporte superior; abre a 83.15 cm.
- **:** La pisa la cara de arriba del brazo de la plataforma.

### Varilla 8 mm × 30 cm (empujador)

- **Cantidad:** 2
- **Función:** Guían el carro del empujador.
- **Montaje:** Horizontales, del soporte delantero (travesaño del empujador) al trasero.
- **Comprobar:** Paralelas.

### Soportes delanteros del empujador

- **Cantidad:** 1 juego
- **Función:** Cuelgan del travesaño del empujador: sostienen las varillas y el NEMA.
- **Montaje:** Con tuercas T al travesaño del empujador.
- **Comprobar:** Firmes.

### Soporte trasero y final de home

- **Cantidad:** 1
- **Función:** Sostiene atrás las varillas y lleva el final de carrera de home del empujador.
- **Montaje:** Colgado del travesaño superior trasero. Su final de carrera: J4 FC3 → GPIO 23 (NC).
- **Comprobar:** El carro toca el final en home.

### Carro, placa 15 × 3 cm y cremallera

- **Cantidad:** 1
- **Función:** La placa empuja la barra trasera del fixture de arriba (0.6–3.6 cm sobre la banda); la cremallera de 30 cm lo mueve 25 cm.
- **Montaje:** Carro sobre 2 SC8UU; los 2 tramos de cremallera unidos con M3.
- **Comprobar:** Recorre 25 cm a mano.
- **Error común:** Placa muy baja: arrastra el de abajo.

### Piñón m1.5 · 20 dientes

- **Cantidad:** 1
- **Función:** Mueve la cremallera: 80 mm/s.
- **Montaje:** En el eje del NEMA, prisionero M3 sobre la cara plana; engranado con un poquito de juego.
- **Comprobar:** Engrana en los 30 cm.
- **Error común:** Muy apretado: pierde pasos.

### NEMA 17 del empujador

- **Cantidad:** 1
- **Función:** Mueve el piñón del empujador.
- **Montaje:** Colgado del travesaño del empujador. Su cable va a J9 → A4988 #3 (STEP GPIO 27, DIR GPIO 14).
- **Comprobar:** Mueve el carro 25 cm.
- **Error común:** Conectarlo con el driver prendido.

### Microservo MG90S (180°)

- **Cantidad:** 1
- **Función:** Sube y baja la uña que jala el fixture desde la banda.
- **Montaje:** En el carro. Café → GND, rojo → 5 V del XL4005, naranja → GPIO 5 (por J11). Curva floja de ~30 cm en su cable.
- **Comprobar:** Se mueve a 0°, 90° y 180° sin brazo.
- **Error común:** Alimentarlo del ESP32: se reinicia.

### Brazo del servo

- **Cantidad:** 1
- **Función:** Une la flecha del servo con el dedo de la uña (2 tornillos M2).
- **Montaje:** Se aprieta después de calibrar los ángulos en la Etapa 12.
- **Error común:** Girarlo a mano con fuerza.

### Uña abatible (dedo impreso de 7 mm)

- **Cantidad:** 1
- **Función:** Gira 90° en el plano de la placa: acostada libra el fixture; colgada cae detrás del travesaño trasero (zona libre de 16 mm entre el travesaño y la ECU) y lo jala ~10 cm.
- **Montaje:** Atornillada al brazo del MG90S (2 × M2); al frente gira en un perno M3 × 12 que pasa por la oreja del soporte. Su cara trasera queda 9.5 mm adelante de la placa. El jalón va a lo largo del eje: no carga los engranes del servo.
- **Comprobar:** Colgada, la punta queda a ~2 cm de la quilla; acostada, a 896 mm (arriba del travesaño del fixture).
- **Error común:** Usar el brazo del servo como eje sin el perno: el jalón dobla la flecha del servo.

### Fixture con ECU (quilla + 2 bastidores)

- **Cantidad:** 6
- **Función:** Lo que el carrito transporta. Piso con quilla de 16.5 cm (lo único que toca la cinta: pasa entre las pestañas de la banda) y asiento para su ECU; 2 bastidores laterales removibles (2 postes + larguero arriba): el fixture que entra se desliza sobre los largueros del de abajo y el siguiente se apila en ellos. Travesaño trasero para el empujador y la uña. v4.1: ventana bajo la ECU, chaflanes para que no se atore y pernos Ø4 para los bastidores; sin QR (YOLO reconoce la ECU). v4.2: los barrenos de los bastidores llevan 3 costillas de apriete: quedan firmes sin pegamento y se quitan a mano.
- **Montaje:** Entran por la ventana a 81.85 cm; la pila baja 7.0 cm por cada uno. Para poner la ECU se quitan los bastidores (entran a presión en 4 pernos gracias a las costillas de la v4.2; no se pegan).
- **Comprobar:** Los 2 bastidores puestos antes de cargarlo.
- **Error común:** Cargarlo sin bastidores: el siguiente se va de frente sobre la ECU.

### Bandeja de electrónica

- **Cantidad:** 1
- **Función:** Lleva la placa y los módulos de potencia; se arma en la mesa y se pasa entera al carrito.
- **Montaje:** Detrás de la batería, sobre el travesaño trasero. Todo con separadores M3: nada toca el aluminio.
- **Comprobar:** Sin continuidad entre la placa y el aluminio.

### Placa perforada 9 × 15 cm

- **Cantidad:** 1
- **Función:** Placa principal: aquí va todo lo del ESP32 y sus módulos.
- **Montaje:** Con separadores M3 sobre la bandeja. Los cables van soldados pin a pin (lista de cables).
- **Comprobar:** Sin puentes de soldadura.
- **Datos:** Acomodo propuesto: ver Supuestos

### Tiras header hembra (zócalos)

- **Cantidad:** ~120 pines
- **Función:** Los módulos se enchufan en ellos: un driver quemado se cambia en segundos, sin desoldar.
- **Montaje:** Suelden cada tira con el módulo puesto (así quedan alineadas) y luego quítenlo. ESP32: 2 × 19 · cada A4988: 2 × 8 · MAX485: 2 × 4 · convertidor: 2 × 6 · BNO055: 2 × 5.
- **Comprobar:** Cada módulo entra derecho y sin forzar.
- **Error común:** Soldarlas sin el módulo puesto: quedan chuecas y no entra.

### ESP32 DevKitC (38 pines)

- **Cantidad:** 1
- **Función:** El cerebro de bajo nivel: mueve los 3 motores a pasos, habla con los M0601 por RS485, lee sensores y finales, y obedece al Jetson por USB (watchdog de 1 s).
- **Montaje:** En sus 2 tiras de 19 pines, con el USB hacia la orilla izquierda de la placa. Se alimenta por su pin 5V desde el XL4005. 3V3 alimenta la lógica de los drivers, los sensores y la IMU.
- **Comprobar:** Programa un "blink" con todo conectado: si no sube, revisen que nada jale GPIO 2 ni GPIO 12.
- **Error común:** Alimentar el servo desde su pin 5V: se reinicia.
- **Datos:** GPIO 34–39: solo entrada; No usar GPIO 6–11 (memoria); GPIO 2 y 12 libres: son de arranque; XSHUT: GPIO 32, 33 y 15; GPIO 34: lectura del paro (divisor); GPIO 35: final superior (pull-up 10 kΩ externo)

### Driver A4988

- **Cantidad:** 3
- **Función:** Cada uno mueve un NEMA 17: recibe pulsos (STEP) y sentido (DIR) del ESP32 y le da 1.0 A a las bobinas.
- **Montaje:** En su zócalo de 2 × 8, con disipador. VMOT a 12 V con su 100 µF, VDD a 3.3 V, MS1–MS3 a VDD (1/16), RESET y SLEEP puenteados. Vref 0.80 V (R100) o 0.54 V (R068).
- **Comprobar:** Vref ajustado; 3200 pasos = 1 vuelta.
- **Error común:** Conectar o desconectar el motor con el driver prendido: se quema.
- **:** Elevador izquierdo. Comparte STEP (GPIO 25), DIR (GPIO 26) y ENABLE con el otro driver del elevador: los 2 motores dan los mismos pasos.
- **:** Elevador derecho. Comparte STEP (GPIO 25), DIR (GPIO 26) y ENABLE con el otro driver del elevador: los 2 motores dan los mismos pasos.
- **:** Mueve el empujador. Tiene su propio STEP (GPIO 27) y DIR (GPIO 14).

### Capacitor 100 µF del servo (J11)

- **Cantidad:** 1
- **Función:** Rev. 3.17d: amortigua los picos de corriente del MG90S para que no bajen los 5 V del ESP32. Es uno de los 3 de 100 µF que sobraron.
- **Montaje:** Al final, después del cable 101: parado arriba de J11 (hacia J2), con la pata − (franja) en línea con J11 GND y la + hacia la orilla. Por abajo, cada pata doblada hasta su pin de J11 (cables 102 y 103).
- **Comprobar:** Sin el servo y con 5 V: 5.0 V en J11 y sin corto entre +5V y GND.
- **Error común:** Invertirlo: se infla o revienta.
- **Datos:** 100 µF, 25 V o más (los comprados son de 100 V)

### Capacitor 1000 µF / 35 V (salida de 18 V)

- **Cantidad:** 1
- **Función:** Rev. 3.17d: el elevador de voltaje no puede regresar energía a la batería; si los M0601 regeneran al frenar, este capacitor la absorbe y el riel de 18 V no sube hacia los 24 V máximos.
- **Montaje:** En la bornera de salida del elevador de voltaje, junto con los cables de los motores: pata larga a OUT+, franja a OUT−.
- **Comprobar:** Prueba de banco: frenar desde 0.35 m/s con el multímetro en MAX sobre el riel: menos de 22 V.
- **Error común:** Invertirlo o usar uno de 25 V: revienta.
- **Datos:** 1000 µF, 35 V o más

### Voltímetro 3030N (7–55 V)

- **Cantidad:** 1
- **Función:** Muestra el voltaje de la batería a la vista. Ya estaba comprado; desde la rev. 3.17d sí se conecta (cable C24).
- **Montaje:** Rojo a XL4005 IN+ (después del KCD1, para que no gaste batería con el carrito apagado) y negro a GND. Se dibuja en la bandeja; pueden ponerlo donde se vea.
- **Comprobar:** Marca lo mismo que el multímetro en la batería (±0.2 V) y se apaga con el KCD1.
- **Error común:** Conectarlo antes del KCD1: descarga la batería con el carrito apagado.
- **Datos:** 7–55 V, 2 o 3 hilos (si trae 3, el amarillo de medición también a IN+)

### Capacitor electrolítico 100 µF

- **Cantidad:** 3
- **Función:** Uno por A4988, entre VMOT y GND: absorbe el pico de voltaje al arrancar el motor.
- **Montaje:** Parado en la orilla de atrás, entre las borneras de los motores, lo más cerca posible de su driver. Pata larga (+) a VMOT; la franja (−) a GND.
- **Comprobar:** La franja hacia GND.
- **Error común:** Invertirlo: se infla o revienta.
- **Datos:** 25 V o más

### Convertidor de nivel 3.3 ↔ 5 V (4 canales)

- **Cantidad:** 1
- **Función:** Baja a 3.3 V la respuesta de los motores (RO del MAX485, 5 V) antes de que llegue al GPIO 16.
- **Montaje:** En su zócalo de 2 × 6. HV a 5 V, LV a 3.3 V, GND a GND. Se usa solo el canal 1 (HV1 ← RO, LV1 → GPIO 16).
- **Comprobar:** Con el multímetro, LV1 nunca pasa de 3.3 V.
- **Error común:** Invertir HV y LV.

### Módulo MAX485 (RS485)

- **Cantidad:** 1
- **Función:** Traduce el serial del ESP32 al bus RS485 por donde hablan los 2 motores M0601.
- **Montaje:** En su zócalo. VCC 5 V, DI ← GPIO 17, DE y RE puenteados ← GPIO 4, RO → convertidor → GPIO 16. A y B a la bornera J3.
- **Comprobar:** Cada motor contesta a su ID.
- **Error común:** Si no contestan, inviertan A y B.

### IMU BNO055 + BMP280 (UNIT DevLab)

- **Cantidad:** 1
- **Función:** Mide el giro del carrito: corrige la odometría de las ruedas (aprobada por Mario).
- **Montaje:** Con 2 headers macho de 5 en sus zócalos, plana y con la flecha X hacia el frente del carrito. VCC a 3.3 V (no a 5 V: sus SDA/SCL salen al voltaje de VCC), GND, SDA y SCL al bus. El puente SB1 abierto = 0x28 (cerrado sería 0x29 y chocaría con los VL53L0X al arrancar). Los demás pines sin conectar; si no aparece en 0x28, unan PS0 y PS1 a GND. Usen el modo IMU (sin magnetómetro): los motores y la batería lo confunden.
- **Comprobar:** El escáner I²C la encuentra en 0x28 (y al BMP280 en 0x76 o 0x77) y al girar el carrito 90° marca ~90°.
- **Error común:** Montarla floja o chueca: el ángulo sale torcido.

### Resistencias y capacitor de 100 nF

- **Cantidad:** 5 + 2
- **Función:** Cada una hace algo distinto: pull-up de ENABLE, divisor para medir la batería, divisor para leer el paro y pull-up del final superior.
- **Montaje:** Acostadas sobre la placa, pegadas a la superficie. Las resistencias no tienen polaridad. Lean las bandas de color o mídanlas antes de soldar.
- **Comprobar:** Cada una mide su valor antes de soldarla.
- **Error común:** Confundir la de 100 kΩ con la de 10 kΩ: la medición de la batería sale mal.

### Borneras KF301 y header del servo

- **Cantidad:** 11
- **Función:** Todo lo que entra o sale de la placa va atornillado: se desconecta sin soldar.
- **Montaje:** En las orillas, con la entrada de los cables hacia afuera. Etiqueten cada una en la placa con plumón.
- **Comprobar:** Jalen suave cada cable: no se sale.
- **Error común:** No etiquetarlas.
- **:** Llega del relé (NO) por el cable tc3 y regresa por tc9.
- **:** Llega del XL4005 (tc5, tc6, tc7).
- **:** Salen los cables RS485 a los 2 M0601.
- **:** Llegan los 3 finales de carrera (2 hilos cada uno).
- **:** Sale el bus I²C a los 4 VL53L0X.
- **:** Salen los 3 XSHUT de los VL53L0X de obstáculos (GPIO 32, 33 y 15); el de la pila no lleva.
- **:** Llega el cable del NEMA del elevador izquierdo.
- **:** Llega el cable del NEMA del elevador derecho.
- **:** Llega el cable del NEMA del empujador.
- **:** Se enchufa el conector del servo (café a GND).
- **:** Llegan el final superior (FC4 y GND4, cable C22) y el VCC del relé para leer el paro (PARO, cable C23).

### Elevador de voltaje 400 W (12 → 18 V)

- **Cantidad:** 1
- **Función:** Da los 18 V de las ruedas M0601.
- **Montaje:** En la bandeja con separadores M3. IN+ ← relé NO (tc2), IN− = tierra común. OUT+/OUT− → conectores de potencia de los 2 M0601.
- **Comprobar:** 18.0 V sin carga, corriente al máximo.
- **Error común:** Conectar los motores antes de ajustarlo.

### Reductor XL4005 (12 → 5 V)

- **Cantidad:** 1
- **Función:** Da 5 V a la lógica: ESP32, MAX485 y servo.
- **Montaje:** IN+ ← rama auxiliar (fusible 5 A y KCD1). OUT+/OUT− → J2.
- **Comprobar:** 5.0–5.1 V sin carga.
- **Error común:** Conectar el ESP32 sin ajustarlo: puede salir a 12 V.

### Módulo relé T90 30 A

- **Cantidad:** 1 (2 canales, se usa 1)
- **Función:** Corta la rama de motores (ruedas y drivers) cuando se aprieta el paro.
- **Montaje:** COM ← fusible 15 A; NO → elevador y J1. La bobina se alimenta por el contacto NC del paro; IN fijo en el nivel que lo activa.
- **Comprobar:** Paro apretado: el NO queda en 0 V.
- **Error común:** Controlarlo con un GPIO: si el programa se cuelga, el paro no sirve.

### Conector XT60 (hembra + macho)

- **Cantidad:** 1 par
- **Función:** Desconecta la batería de todo el carrito sin herramientas.
- **Montaje:** Hembra en los cables de la batería (sus contactos quedan cubiertos); macho del lado del carrito, a los fusibles y a la tierra común.
- **Comprobar:** Rojo con +, negro con −. El chaflán del cuerpo solo deja conectarlo en una posición.
- **Error común:** Poner la hembra del lado del carrito: al desconectar, los pines del macho de la batería quedan expuestos.

### Portafusibles 15 A y 5 A

- **Cantidad:** 2
- **Función:** 15 A: rama de motores. 5 A: rama auxiliar (Jetson, lógica, relé).
- **Montaje:** Lo más cerca posible de la batería, después del XT60.
- **Comprobar:** Continuidad a través de cada fusible.
- **Error común:** Poner un fusible más grande "para que no se queme".

### Interruptor KCD1

- **Cantidad:** 1
- **Función:** Prende y apaga la lógica y el Jetson (rama auxiliar).
- **Montaje:** En el costado de atrás, accesible desde afuera. En serie entre el fusible de 5 A y el XL4005.
- **Comprobar:** Apagado: 0 V en J2.

### Paro de emergencia LAY37 (NC)

- **Cantidad:** 1
- **Función:** Corta la energía de la bobina del relé: se detienen ruedas, elevador y empujador aunque el programa esté colgado.
- **Montaje:** Arriba, en una esquina de atrás. Contacto NC en serie con el VCC del relé. Del VCC del relé sale además un hilo a J13 PARO: el ESP32 lo lee por el GPIO 34 (divisor) para saber que lo apretaron.
- **Comprobar:** Al apretarlo, todo se detiene, la plataforma no baja y el monitor serie dice FALLA_PARO. Al soltarlo nada se mueve hasta REARME + home.
- **Error común:** Usar el contacto NO.

### Sensor de distancia VL53L0X

- **Cantidad:** 4
- **Función:** Los 3 de abajo frenan el carrito si hay algo a menos de 40 cm; el de arriba confirma que hay un fixture en la pila.
- **Montaje:** VIN 3.3 V, GND, SDA, SCL al bus (J5). Los 3 de obstáculos llevan su XSHUT a J6 (GPIO 32, 33 y 15); el de la pila no lleva XSHUT. GPIO1 sin conectar. Al arrancar se apagan los 3, al de la pila se le da 0x33 y luego se prenden uno por uno: 0x30–0x32.
- **Comprobar:** Mide bien a 10, 30 y 60 cm.
- **Error común:** Cables de señal pegados a los de potencia.

### Placa del Jetson (MDF)

- **Cantidad:** 1
- **Función:** Base del Jetson en el marco superior.
- **Montaje:** Atornillada al marco superior trasero.
- **Comprobar:** Firme.

### Jetson Orin Nano Super

- **Cantidad:** 1
- **Función:** Visión (YOLO y ArUco) y navegación; manda órdenes al ESP32 por USB (Mario).
- **Montaje:** Sobre su placa, con separadores. 12 V de la rama auxiliar por plug 5.5 × 2.5 mm (centro +). USB de datos al ESP32.
- **Comprobar:** Centro del plug = + antes de conectar.
- **Error común:** Polaridad al revés: se daña.

### Cámara Logitech C920

- **Cantidad:** 1
- **Función:** Reconoce la ECU de cada fixture (YOLO) y lee los ArUco de las estaciones.
- **Montaje:** Su pie de clip va acostado en una repisa impresa sobre el perfil de arriba al frente (2 × M6), sujeto con 2 cinchos y, si su rosca cae en la ranura, un tornillo 1/4"-20. Por USB al Jetson.
- **Comprobar:** Ve los 2 ArUco desde donde se detiene el carrito.

### Banda transportadora (estación de carga)

- **Cantidad:** 1
- **Función:** Entrega los fixtures al carrito por la ventana, a 83 cm. 3 tramos de 1030 mm con una sola cinta de 20.35 cm que se detiene en la inspección y corre durante la carga; extremo cerrado (2 rodillos de Ø50) hacia el carrito.
- **Montaje:** Guías de 3 mm colgadas de los rieles (2 mm por lado de la quilla), acople atornillado abajo del extremo cerrado y ArUco.
- **Comprobar:** El carrito queda centrado (±5 mm) y a menos de 1 cm de la tapa.
- **Error común:** Poner un fixture sin el carrito acoplado: se cae por la punta.

### Acople a la banda (rev. 3.14)

- **Cantidad:** 1 juego
- **Función:** Centra y frena el carrito en la banda: las guías en V toman la cara de afuera de los 2 postes delanteros (0.75 mm de juego por lado) y el panel pega en 2 topes a 3 mm de la tapa.
- **Montaje:** 2 travesaños 3030 de 510 mm atornillados a las pestañas de abajo del bastidor (4 M6 cada uno), 2 rieles 3030 de 386 mm por fuera con 2 escuadras de aluminio por unión, guías de entrada impresas arriba de los rieles (3 M6 en barrenos ranurados) y topes impresos en la cara del travesaño de enfrente.
- **Comprobar:** Con el carrito pegado a los topes, una hoja de papel entra apenas entre cada poste y su guía (0.5–1 mm) y la ventana queda centrada con la cinta.
- **Error común:** Ajustar las guías apretadas contra los postes: el carrito se atora y no llega a los topes.

### Mesa inclinada de descarga

- **Cantidad:** 1
- **Función:** Recibe los 6 fixtures: cada uno se desliza solo hasta el tope y deja libre la entrada.
- **Montaje:** Tabla de melamina de ~1.4 m × 30 cm con el borde de entrada a 83 cm (2 mm abajo de la base del fixture), bisagra en la entrada y cuña atrás para el ángulo (~12–15° melamina, ~20° MDF). Guías laterales y tope acolchado.
- **Comprobar:** Un fixture puesto en la orilla se desliza solo hasta el tope.
- **Error común:** Orilla más alta que la base del fixture: escalón.

### Mesa de trabajo

- **Función:** Aquí se arma y se prueba la electrónica antes de pasarla al carrito.

### Nivel de burbuja

- **Cantidad:** 1
- **Función:** Revisar que postes y columnas queden verticales.

### Sobra de perfil

- **Función:** Lo que queda de cada barra después de los cortes.

## Supuestos y decisiones de la guía

- **Medidas reales (rev. 3.18, 4–5 nov):** Rodajas montadas directo, sin placa adaptadora: del piso a la cara de abajo del marco hay 10.3 cm. Postes de 948 mm (sin recortar) → marco de arriba a 105.1 cm; columnas de 889 limadas a 888. Calzas de la suspensión de 13 mm. La cinta real está a 82.15 cm (el diseño la tenía a 83.0): todo lo que trabaja con ella (elevador, plataforma, guías, empujador y uña) se monta 8.5 mm más abajo que en la versión anterior; la cámara, el VL53 de la pila y el Jetson suben 11 mm con el marco de arriba.
- **Travesaño del empujador y calzas:** Las placas de unión impresas fijan el travesaño del empujador 70 mm abajo del travesaño superior central, que se apoya en las columnas: queda a 96.6 cm (eje), 19.5 mm más arriba que en el diseño respecto a la cinta. Los soportes delanteros del empujador (aún sin imprimir) se cuelgan con una calza impresa de 19.5 mm (calza_empujador.py: perímetro de 3.5 mm, bosses de Ø14 en los barrenos Ø6.6 y ventanas pasantes) y tornillos M6 × 35 con rondana: entran 8.4 mm en la ranura. El travesaño de arriba de atrás, del que cuelga el soporte trasero, se atornilla 19.5 mm abajo de la punta de los postes (cara de arriba a 103.15 cm); el paro baja con él.
- **Rodajas Unicame de 4" (rev. 3.15):** Unicame no publica CAD: se dibujó una genérica con la rueda (100 × 31 mm) y la placa (93 × 64, ranuras de 12 × 8.5) de una equivalente. Supuestos: barrenos a 45 × 73 mm, avance de 39 mm y radio de giro de 89 mm. El eje de giro va a ±21.8 cm (x) y ±15.35 cm (z): así la rueda libra las motrices por ~8 mm al girar. Girando, la rueda sale hasta 5.7 cm adelante y 4.3 cm al costado de la huella; acoplado, la de adelante alcanza la pata de la banda (x 30.1 cm) si da la vuelta completa ahí.
- **Ruedas M0601:** Del STEP oficial del Waveshare DDSM115 (es el mismo motor): Ø101 × 65.5 mm, 765 g. Se atornilla por la cara del buje: 3 × M2.5 a 120° en un círculo de Ø15.2, roscas de 7.5 mm (Waveshare dice 6 mm útiles). La placa pivotante necesita esos 3 barrenos y paso para el cable, que sale por una ranura de 6.5 mm en esa misma cara. El eje queda ~7 cm adelante del travesaño central.
- **Suspensión:** Placa pivotante y soporte del pivote ya son piezas impresas con barrenos (prints_rev311.py): maza con 2 × 608ZZ, 3 × M2.5 del M0601 en Ø15.2, paso del cable hacia arriba. La pestaña del resorte bajó 2.5 mm para librar la cabeza del M2.5 de abajo; el resorte se calza con 2.5 mm de rondanas M8. El asiento del resorte bajo el larguero sigue a criterio.
- **Batería:** Medidas ~16.6 × 17.5 × 12.5 cm (típicas de 12 V 24 Ah). Cuna impresa, topes a los lados y correa con hebilla alrededor del travesaño central (decidido 15-oct).
- **Columnas de la torre (propuesta):** Los documentos no dicen a qué se atornillan las guías, los husillos ni el empujador. Se agregan 4 columnas de 888 mm (2 junto a los postes delanteros y 2 sobre el travesaño central), un travesaño superior central de 340 mm y un travesaño de 198 mm para el empujador.
- **Perfil (15-oct):** 19 cortes (~11.4 m): la barra de 6 m de PEI da 948 × 4 + 888 × 2 + 340 (sobran ~335 mm) y la de 2 m da 888 × 2 + 198 (sobran ~105 mm). Las 9 piezas cortas (440 × 4 y 340 × 5) se dibujan "de las barras extra de la escuela", que se cuentan el 16-oct.
- **Tornillería:** Tuercas T de martillo + Allen M6 en todas las uniones (se dibujan algunas por ranura, no las 100). Escuadras: 2 por unión en la base y 1 en el marco superior.
- **Ventana:** Las columnas delanteras quedan detrás del panel y se abren a z ±0.131 (rev. 3.4): entre ellas hay 23.2 cm y lo más ancho de las ECU llega a 11.15 cm del centro (22.3 cm) (conector de la Siemens VDO). Las traseras se quedan donde estaban: las ECU no llegan hasta ahí.
- **Escuadras y placas:** Las 24 escuadras son de aluminio (rev. 3.15): se dibujan con el STEP que mandó Isaac (35 × 35 × 29 mm, 4 mm de grueso, ranura de 7.5 mm en cada pata y 2 lengüetas que entran en la ranura del perfil). La compra que se revisó era de 28 × 28 × 28: confirmen cuál llegó. Las 12 placas de unión de la torre siguen impresas (2 tornillos por perfil, centrados en la ranura).
- **Husillos y varillas:** Cerca del frente (x ≈ 18 cm desde el centro), husillo a 16.5 cm y varilla a 12.8 cm del eje. El avance de los husillos de UNIT está por medir: se dibujan como de 1 entrada.
- **Modelos 3D de los componentes (16-oct):** ESP32, A4988, MAX485, convertidor de nivel, XL4005, VL53L0X, NEMA 17, MG90S, KFL08, SC8UU, cople, tuerca T8, tuerca T, finales de carrera, paro LAY37, XT60, KCD1, Jetson y el perfil 3030 salen de los STEP que juntó el equipo (17-oct: los 5 últimos exportados de SolidWorks, sin colores: se pintaron a mano), simplificados para que la página cargue rápido. La BNO055 de UNIT no tiene STEP: se dibujó de su hoja de medidas. El cople es el STEP 5 × 8 que bajó el equipo (18-oct). Elevador, relé y portafusibles se quedan como cajas (decisión del equipo); la batería espera medidas; la rodaja de 4" es genérica (Unicame no publica CAD) y la escuadra de aluminio sale del STEP del equipo (27-oct).
- **Paro y finales de carrera (rev. 3.7):** El cuerpo real del LAY37 no cabía sobre el travesaño trasero: su soporte ahora sale por detrás, con un rebaje que deja 2.5 mm donde abraza el cuello (midan el suyo). Los finales de carrera van atornillados con 2 × M2.5 a una pestaña: el del elevador lo pisa el brazo de la plataforma al bajar a 38.35 cm y el de home lo pisa el travesaño del carro (2 mm).
- **Piezas impresas con barrenos (rev. 3.5):** Soportes del elevador, plataforma, empujador, carro, soportes de los sensores, del KCD1, bandeja, escuadras, placas y guías ya traen los barrenos de sus componentes reales (NEMA 31 mm, KFL08 36 mm, SC8UU 24 × 18, VL53L0X 20 mm, XL4005, MG90S). Cambios para que todo entre: placas para atornillar los SC8UU de la plataforma, soporte del MG90S en el carro, travesaño del carro 5 mm más arriba (apoya en los SC8UU), NEMA del elevador 2.5 mm más arriba (cara contra la repisa) y soportes del KCD1 y del VL53 de la pila alargados hasta el perfil.
- **Modelos que no coinciden con la placa:** El ESP32 del STEP tiene sus filas a 26 mm y los pines a 2.5 mm (el real: 25.4 y 2.54). El convertidor de nivel del STEP tiene sus 2 filas a 10 mm y en la placa se dejaron a 12.7 mm: midan el suyo antes de soldar los zócalos.
- **Guías en L:** Tocan los postes del fixture en las 4 esquinas (cara a z ±84.5 mm, 2 mm por lado). El ala del frente/fondo mide 18 mm; el ala lateral mide 8 mm (lo largo del poste), porque más adentro van la ECU y el piso del fixture. Se atornillan a las columnas con una pestaña. Las traseras llegan a 89.65 cm; las delanteras terminan en el borde de la ventana (80.95 cm).
- **Plataforma:** 21.3 × 16.5 cm (la quilla del fixture), 12 mm de grueso, con 2 brazos laterales de 35 mm de ancho que salen entre las guías.
- **Empujador:** Varillas a 86.55 cm y cremallera a 87.75 cm, centradas detrás de la torre. En home, la cola de la cremallera y las varillas asoman ~4 cm por atrás del carrito: revisarlo en el CAD.
- **Uña (rev. 3.8):** Dedo impreso de 7 mm que gira 90° sobre un eje a lo largo del empuje (MG90S acostado + perno M3 al frente). Acostado queda a 896–948 mm: libra el travesaño del fixture aun cuando éste se vuelca en la mesa (≤ 890) y cabe bajo la ventana (915). Colgado, su punta queda a 850 mm, 14 mm dentro del travesaño. Los barrenos de su brazo (10 y 14 mm del eje) son supuestos: midan los del brazo que les llegó.
- **Descarga (rev. 3.8):** El fixture se empuja plano; cuando su centro pasa la orilla de la mesa se vuelca sobre ella y resbala. Se supuso el centro de masa al centro del fixture.
- **Banda transportadora (18-oct):** Bastidor, rodillos y cinta salen del STEP de Isaac; su modelo es 1/3 de la banda, así que se pegan 3 tramos de 1030 mm (3.09 m) con una sola cinta. A los 2 tramos extra se les quitó la tapa del extremo cerrado para que pase la cinta de regreso. Las patas no vienen en el STEP: se dibujan con perfil 3030.
- **Altura de la cinta:** Medida el 4-nov: borde de los labios a 82.8 cm, cinta 6.5 mm abajo (82.15 cm), abertura entre labios 22.3 cm, cinta de 20.35 cm, bastidor de 32.05 × 15.4 cm. De la cresta del rodillo a la cara de afuera de la tapa hay 57 mm (el STEP trae 60): la caída se simuló con la medida (caida_real.py): queda 6.0 cm afuera, la uña jala 7.6 cm y el centro de masa queda 33–36 mm adentro de la orilla de la pila; aguanta aunque el carrito acople hasta ~20 mm más lejos de la tapa (sigue con ≥ 13 mm). La primera pata está a 52 cm de la tapa. Guarda y motor del lado derecho (viendo la banda desde el carrito), de la hoja 1; la placa de montaje (690 × 127 × 6) no se dibuja porque no se sabe dónde va.
- **Velocidad de la cinta:** 0.20 m/s, supuesta. Es una sola cinta: se detiene mientras la cámara inspecciona el fixture y vuelve a correr para llevarlo al carrito; la carga se hace con la cinta corriendo. Va un fixture a la vez: el PLC suelta el siguiente solo cuando el carrito avisa LISTO.
- **Punto donde la banda deja el fixture:** La cinta deja de apoyar en la cresta del rodillo de Ø50, 57 mm antes de la tapa (medido). Si la cinta agarra más que el PETG sobre PETG, empuja el fixture hasta que su cola deja la cresta: cae con ~6 cm afuera de la ventana. Se mide con la banda real.
- **Guías de la banda:** Tiras de 3 mm a 2 mm de la quilla, colgadas de los rieles con soportes impresos cada ~0.5 m (propuesta): la banda real no trae guías y entre los rieles hay 21.6 cm.
- **Fixture:** v4.1 (3-nov, fixture_v4.py), dibujado con las mallas que se imprimen: piso con quilla de 16.5 cm que se abre a 18.4 cm, ventana bajo la ECU, travesaño de la uña y 2 bastidores iguales (el segundo girado 180°) que se clavan en 4 pernos Ø4; desde la v4.2 cada barreno trae 3 costillas de apriete (se escoge el apriete con una probeta; no se pegan porque se quitan para poner la ECU). Sin QR: la ECU se reconoce con YOLO. Las ECU son cajas con sus medidas reales (Siemens VDO y MaxxECU alternadas).
- **Placa principal (propuesta):** Los documentos dan el mapa de pines, no el acomodo. Aquí se propone uno en la placa de 9 × 15 cm: A4988 atrás, ESP32 al centro con el USB a la izquierda, convertidor y MAX485 al frente, BNO055 abajo, borneras en las orillas. Las rutas de los 103 cables, sus colores y largos (~) salen de ese acomodo: si cambian el acomodo, cambian los largos, no las conexiones.
- **Borneras:** J1–J9, J11 y J13 son nombres de esta animación (no están en la guía). Escríbanlos en la placa con plumón para que coincidan. Desde la rev. 3.17 ya no hay J10 (QTR-8A) ni J12 (LEDs).
- **Electrónica rev. 3.17 (27-oct):** Decisión del equipo: sin barra QTR-8A, sin LEDs WS2812 y sin expansor PCF8574. Los XSHUT de los 3 VL53L0X de obstáculos van directo al ESP32 (GPIO 32, 33 y 15) por la bornera J6; el de la pila no lleva XSHUT: al arrancar se apagan los otros 3 y a él se le cambia la dirección primero. La placa queda con 91 cables (lista en CONEXIONES_ESP32_AETHER.md).
- **Electrónica rev. 3.17c (1-nov):** Decisión del equipo: el ESP32 sí lee el paro. Del VCC del relé (después del paro) sale un hilo a J13 PARO → divisor 100 kΩ / 20 kΩ + 100 nF → GPIO 34; si lee ~0 V entra a FALLA_PARO (velocidad 0, ENABLE en 1, home perdido) y solo sale con REARME + home. Se agrega un final de carrera superior NC (el de repuesto) en el soporte superior derecho: J13 FC4 → GPIO 35 con pull-up externo de 10 kΩ, abre a 83.15 cm. La placa queda con 103 cables (102 y 103: el capacitor del servo, rev. 3.17d). Los paneles laterales de MDF son un extra: no se dibujan.
- **Cables de la bandeja y del carrito:** Calibres de la guía (14 AWG potencia, 22 AWG señal); los de 18 AWG para drivers y lógica son sugeridos. Las rutas por el carrito son aproximadas.
- **BNO055:** Se dibuja el modelo de Adafruit (6 pines de un lado y 4 del otro) sobre la fila de 8 pines del de UNIT, que es el que compraron. El orden de los pines cambia según el fabricante (se dibujan VIN, GND, SDA, SCL primero): lean la serigrafía del módulo real.
- **Jetson y cámara:** Jetson (10.3 × 9.1 × 3.5 cm, del STEP de NVIDIA) sobre una placa en el marco superior trasero, puertos hacia atrás; cámara C920 (STEP de Logitech) arriba al frente en una repisa impresa, mirando a la banda ~6° hacia abajo.
- **XL4005:** Con sus medidas reales: 44 × 21 mm (antes se dibujaba de 27 × 54).
- **Sensores:** VL53L0X de obstáculos a ~20 cm del piso en el frente y los costados; el de la pila colgado del larguero superior, a ~96 cm.
- **Estación de descarga:** Mesa inclinada de melamina de 1.4 × 0.3 m a 15°, con bisagra, cuña, guías y tope de hule espuma dibujados a criterio.
- **Tiempos:** La animación va más rápida que el carrito real (un nivel real tarda 7 s; cargar un fixture ~18 s).
