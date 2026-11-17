// Generado por scripts/construir_armado48.py desde la guía de armado. Tras editarlo: cd aether-video && npm run armado48:build
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
/* =====================================================================
   TABLA DE MEDIDAS Y POSICIONES — carrito Aether, rev. 3.4 (16-oct)
   Unidades: metros. Ejes: x → frente (hacia la banda), y → arriba,
   z → derecha del carrito (viéndolo desde atrás hacia el frente).
   Origen: centro de la huella, sobre el piso.
   Fuentes: [G] CARRITO_CONSTRUCCION_PASO_A_PASO.md · [A] GUIA_ARMADO_PRINCIPIANTES.md
            [C] COSTOS_CARRITO.md · [X] PROYECTO_INTEGRADOR_CONTEXTO.md §3c
   "~" = aproximada (no está en los documentos) → aparece en el panel Supuestos.
   ---------------------------------------------------------------------
   ESTRUCTURA
   Huella exterior ......... 0.500 (x) × 0.400 (z) .................. [G P8][A E4]
   Perfil 3030 ............. 0.030 × 0.030, ranura 8 mm ............. [G P8][memoria]
   Postes .................. 4 × 0.904 (rev. 3.15; antes 0.950) .............................. [G P8]
   Largueros (eje x) ....... 4 × 0.440 = 0.500 − 2·0.030 ✓ ........... [G P8]
   Travesaños (eje z) ...... 7 × 0.340 = 0.400 − 2·0.030 ✓ ........... [G P8]
     4 de marcos + 1 central inferior + 2 de la torre
   Barras de 2 m ........... 950+950 (sobra ~95) ×2, 440×4 (~228),
                             340×5 (~285), 340×2 (~1.3 m); corte ~3 mm  [G P8][A E6]
   Rodaja Unicame 4" ....... altura de montaje 0.128 (supuesta) + adaptadora 0.008 ~
   Base del marco inferior . y = 0.090 (alto de la rodaja) ........... [G P8.1]
   Tope del marco superior . y = 0.136 + 0.904 = 1.040 (guía: ~1.03) . ~
   Diagonal 500 × 400 ...... √(0.5²+0.4²) = 0.640 (calculada) ........ [A E7]
   Escuadras impresas ...... 28 (rev. 3.8: al frente, la columna de la torre ocupa el lugar
                             de la escuadra del travesaño, arriba y abajo) ............... ~
   Columnas de la torre .... 4 × 0.844 (0.166 → 1.010): delanteras x 0.220–0.250,
                             traseras x −0.015–0.015 (sobre el travesaño central),
                             z ±0.099–0.129; entre caras 0.198 > fixture 0.180 ✓ ~
   Travesaño sup. central .. 0.340 entre largueros superiores, x = 0 ~
   Travesaño del empujador . 0.198 entre columnas traseras, y 0.940–0.970 ~
   Barras de 2 m (propuesta) 7: 950+950 ×2, 890+890 ×2, 440×4, 340×5+198, 340 ~
   TRACCIÓN
   M0601 ................... rueda Ø0.102, ancho ~0.045 ............... [G P3] ~
   Eje de las ruedas ....... x = +0.070, z = ±0.1425 (rueda no toca el
                             travesaño central: tope 0.102 > 0.090) .... ~
   Suspensión .............. pivote M8 + 2×608ZZ, resorte libre 0.075,
                             comprimido 0.028 → 0.047, 85 N, k≈3 N/mm .. [G P3][A E7]
   Batería BR-1224 ......... ~0.166 × 0.175 × 0.125, 8.3 kg, al centro  [G P5] ~
   TORRE (columna pegada al frente)
   Hueco ................... 0.220 (x) × 0.190 (z), centro XC = 0.133 . [G P4]
                             x 0.023…0.243, z ±0.095; holgura 5 mm ✓
   Fixture (16-oct) ........ quilla 0.213 × 0.165, alto 0.070 con sus 2 bastidores
                             (postes + larguero); las ECU sobresalen hasta z ±0.1115
                             (conector de la Siemens VDO) arriba de 13.5 mm ...... [FIXTURE_ECU_QUILLA]
                             hueco 0.220 (x) entre guías; guías a z ±0.0845 en las esquinas
   Nivel ................... 0.070 .................................. [G P1]
   Banda (superficie) ...... 0.830 (medir) ............................ [G P0]
   Ventana ................. 0.240 (z) × 0.097 (y); borde inf. 0.818 ✓
                             (0.830 − 0.012), borde sup. 0.915 ......... [G P4]
   Plataforma (cara sup.) .. carga: 0.827 − n·0.070 → 0.827…0.407 ✓
                             descarga: 0.832 − (n−1)·0.070 → 0.832…0.482 ✓
                             final de carrera inf. 0.392, tope sup. 0.840 [G P4][A E9]
   Husillos TR8 ............ 2 × 0.600, y 0.300…0.900, x 0.183, z ±0.165 ~ (posición)
   KFL08 ................... inferior 0.318…0.336, superior 0.866…0.884
                             útil = 0.866 − 0.336 = 0.530 ≈ 0.527 ✓ .... [G P4]
   NEMA 17 elevador ........ 0.042 × 0.042 × 0.040 (cuerpo ~) y 0.235…0.275
   Varillas 8 mm ........... 2 × 0.600, x 0.183, z ±0.128 ............. ~ (posición)
   Guías en L .............. alas 0.018 × 0.004 ~; traseras 0.380…0.905,
                             delanteras 0.380…0.818 (borde de la ventana) [A E9]
   EMPUJADOR
   Placa ................... 0.150 (z) × 0.030 (y), y 0.836…0.866
                             (0.6 a 3.6 cm sobre la banda ✓) ........... [G P4][A E10]
   Carrera ................. 0.250; home p0 = 0.008 (cara de la placa) . [G P4]
   Uña ..................... dedo abatible de 7 mm en el MG90S (eje a lo largo de x en y 0.900,
                             z −0.020); cara trasera 9.5 mm adelante de la placa; punta a 0.850 ~
   Zona de la uña .......... 0.016–0.017 (x) entre travesaño trasero y ECU [FIXTURE_ECU_QUILLA]
   Banda deja el fixture ... ~0.063 afuera de la ventana; jala ~0.077 (STEP de la banda, 18-oct) ~
   Cremallera .............. 0.300 (2 × 0.150), piñón m1.5 z20 Ø0.030 .. [G P4]
   Varillas empujador ...... 2 × 0.300, y 0.874, z ±0.045 .............. ~ (posición)
   ESTACIONES
   Mesa inclinada .......... 1.40 m × 0.30, ~15°, borde a 0.830 (2 mm bajo 0.832) [A E15]
   COMPROBACIONES HECHAS (ver también la función checkGeometry al final)
   ✓ ruedas (Ø102) y rodajas (13.6 cm con la adaptadora) tocan el piso a la vez (calzas de 46 mm en la suspensión).
   ✓ ventana a la altura de la banda: borde inferior 1.2 cm abajo.
   ✓ plataforma de 40.7 a 82.35 cm; finales de carrera 39.2 / 84.0.
   ✓ columna 22.0 × 19.0 cm; fixture 21 × 18 cm.
   ✓ alto de la pila llena: 0.407 + 6·0.070 = 0.827 = tope bajo la banda.
   ===================================================================== */

const D = {
  // estructura
  L: 0.50, W: 0.40, PF: 0.030, HT: 1.051,              // rev. 3.18: rodajas de 103 mm + postes de 948 (sin recortar) → marco de arriba a 1.051
  // rev. 3.15: rodajas Unicame de 4" de placa. CH = altura de montaje (piso → cara de su placa): SUPUESTA, medirla.
  CH: 0.103, TA: 0, get H0() { return this.CH + this.TA; }, get DH() { return this.H0 - 0.090; },   // TA = placa adaptadora; DH = cuánto subió el marco de abajo
  get POST() { return this.HT - this.H0; },
  XI: 0.22, ZI: 0.17,                                // caras interiores de los postes
  XP: 0.235, ZP: 0.185,                              // ejes de los perfiles perimetrales
  get YB() { return this.H0 + 0.015; }, get YT() { return this.HT - 0.015; },   // ejes de marcos inferior y superior
  COLXF: 0.235, COLXB: 0, COLZC: 0.114, COLZF: 0.131, get COLL() { return this.HT - 2 * this.PF - this.H0; },  // columnas (traseras a ±0.114, delanteras a ±0.131: pasan las ECU)
  get YSC() { return this.HT - 0.015; }, get YEMP() { return this.YSC - 0.070; },   // rev. 3.18: el central se apoya en las columnas; el del empujador lo fija la placa impresa 70 mm abajo
  // tracción
  WR: 0.051, WW: 0.0503, WX: 0.070, WZ: 0.1295, MOTF: 0.166,   // M0601 (STEP del DDSM115): llanta Ø101 × 50.3 centrada a 36.5 mm de la cara de montaje (MOTF = cara de la placa)
  CX: 0.218, CZ: 0.1535, CE: 0.039, CR: 0.089,       // eje de giro de las rodajas de 4", avance y radio de giro (~): la rueda libra las motrices por 8 mm
  BAT: { l: 0.166, w: 0.175, h: 0.125 },             // rev. 3.48b: BR-1224 acostada (166 × 175 × 125, tamaño estándar de 12 V 24 Ah; aún no se compra)
  // torre
  XC: 0.133, COLX0: 0.023, COLX1: 0.243, COLZ: 0.0845,              // COLZ = cara de las guías: 2 mm por lado contra los postes (±0.0825)
  FL: 0.2129, FW: 0.165, PITCH: 0.070, ECUZ: 0.1115,                 // fixture: largo, ancho de la quilla; lo más ancho de las ECU
  BELT: 0.830, WIN0: 0.818, WIN1: 0.915, WINZ: 0.120,
  LOAD0: 0.827, UNL0: 0.832, LSLO: 0.392, LSHI: 0.840,
  SX: 0.183, SZ: 0.165, RZ: 0.132,                   // husillo y varilla (~)
  GL: 0.018, GLF: 0.008, GT: 0.004, GB: 0.380, GTB: 0.905, GTF: 0.818,
  // empujador
  PY0: 0.836, PY1: 0.866, P0: 0.008, STROKE: 0.250,
  CLAWY: 0.900, CLAWZ: -0.020, CLAWU: 0.0095,          // eje de la uña abatible (x a lo largo) y cara trasera del dedo respecto a la placa
  RODY: 0.874, RODZ: 0.045, RACKY: 0.886,
  // panel
  PANX: 0.250, PANT: 0.003,
};
D.LEVEL = n => D.LOAD0 - n * D.PITCH;          // cara de la plataforma al cargar con n en la pila
D.UNLV = n => D.UNL0 - (n - 1) * D.PITCH;      // al descargar con n en la pila

// Colores por subsistema (leyenda)
const SUBS = {
  est:  { name: 'Estructura',       color: 0x8d9bab, accent: 0x50657e },
  trac: { name: 'Tracción',         color: 0x2f6fdf, accent: 0x2f6fdf },
  torre:{ name: 'Torre y elevador', color: 0xf07f1e, accent: 0xf07f1e },
  emp:  { name: 'Empujador y uña',  color: 0x8b5cf6, accent: 0x8b5cf6 },
  elec: { name: 'Electrónica',      color: 0x16a34a, accent: 0x16a34a },
  fix:  { name: 'Fixtures',         color: 0x0d9488, accent: 0x0d9488 },
  sta:  { name: 'Estaciones',       color: 0xb7834a, accent: 0xb7834a },
};

// Supuestos (panel final). Todo lo que no sale de los documentos.
const SUPUESTOS = [
  ['Batería (rev. 3.48b)', 'Aún no se compra: se dibuja la BR-1224 con el tamaño estándar de 12 V 24 Ah (166 × 175 × 125 mm), acostada en la cuna original de la rev. 3.6. Al comprarla, medir con vernier y dónde quedan los bornes.'],
  ['Estación de inspección y scrap (rev. 3.48, 16-nov)', 'Propuesta de Claude, sin medir: a 1.545 m de la tapa; cilindro Ø20 × 100 doble efecto (el real puede ser otro con la misma carrera); C270 a 45 cm de la cinta; charola representativa. El scrap sale a la izquierda viendo venir las piezas. Con 100 mm el fixture sale por inercia (lo probó el equipo); la trayectoria dibujada es aproximada.'],
  ['Medidas reales (rev. 3.18, 4–5 nov)', 'Rodajas montadas directo, sin placa adaptadora: del piso a la cara de abajo del marco hay 10.3 cm. Postes de 948 mm (sin recortar) → marco de arriba a 105.1 cm; columnas de 889 limadas a 888. Calzas de la suspensión de 13 mm. La cinta real está a 82.15 cm (el diseño la tenía a 83.0): todo lo que trabaja con ella (elevador, plataforma, guías, empujador y uña) se monta 8.5 mm más abajo que en la versión anterior; la cámara, el VL53 de la pila y el Jetson suben 11 mm con el marco de arriba.'],
  ['Travesaño del empujador y calzas', 'Las placas de unión impresas fijan el travesaño del empujador 70 mm abajo del travesaño superior central, que se apoya en las columnas: queda a 96.6 cm (eje), 19.5 mm más arriba que en el diseño respecto a la cinta. Los soportes delanteros del empujador (aún sin imprimir) se cuelgan con una calza impresa de 19.5 mm (calza_empujador.py: perímetro de 3.5 mm, bosses de Ø14 en los barrenos Ø6.6 y ventanas pasantes) y tornillos M6 × 35 con rondana: entran 8.4 mm en la ranura. El travesaño de arriba de atrás, del que cuelga el soporte trasero, se atornilla 19.5 mm abajo de la punta de los postes (cara de arriba a 103.15 cm); el paro baja con él.'],
  ['Rodajas Unicame de 4" (rev. 3.15)', 'Unicame no publica CAD: se dibujó una genérica con la rueda (100 × 31 mm) y la placa (93 × 64, ranuras de 12 × 8.5) de una equivalente. Supuestos: barrenos a 45 × 73 mm, avance de 39 mm y radio de giro de 89 mm. El eje de giro va a ±21.8 cm (x) y ±15.35 cm (z): así la rueda libra las motrices por ~8 mm al girar. Girando, la rueda sale hasta 5.7 cm adelante y 4.3 cm al costado de la huella; acoplado, la de adelante alcanza la pata de la banda (x 30.1 cm) si da la vuelta completa ahí.'],
  ['Ruedas M0601', 'Del STEP oficial del Waveshare DDSM115 (es el mismo motor): Ø101 × 65.5 mm, 765 g. Se atornilla por la cara del buje: 3 × M2.5 a 120° en un círculo de Ø15.2, roscas de 7.5 mm (Waveshare dice 6 mm útiles). La placa pivotante necesita esos 3 barrenos y paso para el cable, que sale por una ranura de 6.5 mm en esa misma cara. El eje queda ~7 cm adelante del travesaño central.'],
  ['Suspensión', 'Placa pivotante y soporte del pivote ya son piezas impresas con barrenos (prints_rev311.py): maza con 2 × 608ZZ, 3 × M2.5 del M0601 en Ø15.2, paso del cable hacia arriba. La pestaña del resorte bajó 2.5 mm para librar la cabeza del M2.5 de abajo; el resorte se calza con 2.5 mm de rondanas M8. El asiento del resorte bajo el larguero sigue a criterio.'],
  ['Batería', 'Medidas ~16.6 × 17.5 × 12.5 cm (típicas de 12 V 24 Ah). Cuna impresa, topes a los lados y correa con hebilla alrededor del travesaño central (decidido 15-oct).'],
  ['Columnas de la torre (propuesta)', 'Los documentos no dicen a qué se atornillan las guías, los husillos ni el empujador. Se agregan 4 columnas de 888 mm (2 junto a los postes delanteros y 2 sobre el travesaño central), un travesaño superior central de 340 mm y un travesaño de 198 mm para el empujador.'],
  ['Perfil (15-oct)', '19 cortes (~11.4 m): la barra de 6 m de PEI da 948 × 4 + 888 × 2 + 340 (sobran ~335 mm) y la de 2 m da 888 × 2 + 198 (sobran ~105 mm). Las 9 piezas cortas (440 × 4 y 340 × 5) se dibujan "de las barras extra de la escuela", que se cuentan el 16-oct.'],
  ['Tornillería', 'Tuercas T de martillo + Allen M6 en todas las uniones (se dibujan algunas por ranura, no las 100). Escuadras: 2 por unión en la base y 1 en el marco superior.'],
  ['Sin panel frontal (rev. 3.38)', 'El equipo no compra el MDF. El frente queda abierto: el tope de la pila lo hacen las guías en L delanteras, que llegan a 80.95 cm (borde de abajo de la ventana) y traslapan 2–4 cm a cada fixture por lado; al acoplarse, los postes pegan en los topes del acople y el carrito queda 3 mm más adentro que con el panel.'],
  ['Ventana', 'Las columnas delanteras quedan detrás de la ventana y se abren a z ±0.131 (rev. 3.4): entre ellas hay 23.2 cm y lo más ancho de las ECU llega a 11.15 cm del centro (22.3 cm) (conector de la Siemens VDO). Las traseras se quedan donde estaban: las ECU no llegan hasta ahí.'],
  ['Escuadras y placas', 'Las 24 escuadras son de aluminio (rev. 3.15): se dibujan con el STEP que mandó Isaac (35 × 35 × 29 mm, 4 mm de grueso, ranura de 7.5 mm en cada pata y 2 lengüetas que entran en la ranura del perfil). La compra que se revisó era de 28 × 28 × 28: confirmen cuál llegó. Las 12 placas de unión de la torre siguen impresas (2 tornillos por perfil, centrados en la ranura).'],
  ['Husillos y varillas', 'Cerca del frente (x ≈ 18 cm desde el centro), husillo a 16.5 cm y varilla a 12.8 cm del eje. El avance de los husillos de UNIT está por medir: se dibujan como de 1 entrada.'],
  ['Modelos 3D de los componentes (16-oct)', 'ESP32, A4988, MAX485, convertidor de nivel, XL4005, VL53L0X, NEMA 17, MG90S, KFL08, SC8UU, cople, tuerca T8, tuerca T, finales de carrera, paro LAY37, XT60, KCD1, Jetson y el perfil 3030 salen de los STEP que juntó el equipo (17-oct: los 5 últimos exportados de SolidWorks, sin colores: se pintaron a mano), simplificados para que la página cargue rápido. La BNO055 de UNIT no tiene STEP: se dibujó de su hoja de medidas. El cople es el STEP 5 × 8 que bajó el equipo (18-oct). Elevador, relé y portafusibles se quedan como cajas (decisión del equipo); la batería espera medidas; la rodaja de 4" es genérica (Unicame no publica CAD) y la escuadra de aluminio sale del STEP del equipo (27-oct).'],
  ['Paro y finales de carrera (rev. 3.7)', 'El cuerpo real del LAY37 no cabía sobre el travesaño trasero: su soporte ahora sale por detrás, con un rebaje que deja 2.5 mm donde abraza el cuello (midan el suyo). Los finales de carrera van atornillados con 2 × M2.5 a una pestaña: el del elevador lo pisa el brazo de la plataforma al bajar a 38.35 cm y el de home lo pisa el travesaño del carro (2 mm).'],
  ['Piezas impresas con barrenos (rev. 3.5)', 'Soportes del elevador, plataforma, empujador, carro, soportes de los sensores, del KCD1, bandeja, escuadras, placas y guías ya traen los barrenos de sus componentes reales (NEMA 31 mm, KFL08 36 mm, SC8UU 24 × 18, VL53L0X 20 mm, XL4005, MG90S). Cambios para que todo entre: placas para atornillar los SC8UU de la plataforma, soporte del MG90S en el carro, travesaño del carro 5 mm más arriba (apoya en los SC8UU), NEMA del elevador 2.5 mm más arriba (cara contra la repisa) y soportes del KCD1 y del VL53 de la pila alargados hasta el perfil.'],
  ['Modelos que no coinciden con la placa', 'El ESP32 del STEP tiene sus filas a 26 mm y los pines a 2.5 mm (el real: 25.4 y 2.54). El convertidor de nivel del STEP tiene sus 2 filas a 10 mm y en la placa se dejaron a 12.7 mm: midan el suyo antes de soldar los zócalos.'],
  ['Guías en L', 'Tocan los postes del fixture en las 4 esquinas (cara a z ±84.5 mm, 2 mm por lado). El ala del frente/fondo mide 18 mm; el ala lateral mide 8 mm (lo largo del poste), porque más adentro van la ECU y el piso del fixture. Se atornillan a las columnas con una pestaña. Las traseras llegan a 89.65 cm; las delanteras terminan en el borde de la ventana (80.95 cm).'],
  ['Plataforma', '21.3 × 16.5 cm (la quilla del fixture), 12 mm de grueso, con 2 brazos laterales de 35 mm de ancho que salen entre las guías.'],
  ['Empujador', 'Varillas a 86.55 cm y cremallera a 87.75 cm, centradas detrás de la torre. En home, la cola de la cremallera y las varillas asoman ~4 cm por atrás del carrito: revisarlo en el CAD.'],
  ['Uña (rev. 3.8)', 'Dedo impreso de 7 mm que gira 90° sobre un eje a lo largo del empuje (MG90S acostado + perno M3 al frente). Acostado queda a 896–948 mm: libra el travesaño del fixture aun cuando éste se vuelca en la mesa (≤ 890) y cabe bajo la ventana (915). Colgado, su punta queda a 850 mm, 14 mm dentro del travesaño. Los barrenos de su brazo (10 y 14 mm del eje) son supuestos: midan los del brazo que les llegó.'],
  ['Descarga (rev. 3.8)', 'El fixture se empuja plano; cuando su centro pasa la orilla de la mesa se vuelca sobre ella y resbala. Se supuso el centro de masa al centro del fixture.'],
  ['Banda transportadora (18-oct)', 'Bastidor, rodillos y cinta salen del STEP de Isaac; su modelo es 1/3 de la banda, así que se pegan 3 tramos de 1030 mm (3.09 m) con una sola cinta. A los 2 tramos extra se les quitó la tapa del extremo cerrado para que pase la cinta de regreso. Las patas no vienen en el STEP: se dibujan con perfil 3030.'],
  ['Altura de la cinta', 'Medida el 4-nov: borde de los labios a 82.8 cm, cinta 6.5 mm abajo (82.15 cm), abertura entre labios 22.3 cm, cinta de 20.35 cm, bastidor de 32.05 × 15.4 cm. De la cresta del rodillo a la cara de afuera de la tapa hay 57 mm (el STEP trae 60): la caída se simuló con la medida (caida_real.py): queda 6.0 cm afuera, la uña jala 7.6 cm y el centro de masa queda 33–36 mm adentro de la orilla de la pila; aguanta aunque el carrito acople hasta ~20 mm más lejos de la tapa (sigue con ≥ 13 mm). La primera pata está a 52 cm de la tapa. Guarda y motor del lado derecho (viendo la banda desde el carrito), de la hoja 1; la placa de montaje (690 × 127 × 6) no se dibuja porque no se sabe dónde va.'],
  ['Velocidad de la cinta', '0.20 m/s, supuesta. Es una sola cinta: se detiene mientras la cámara inspecciona el fixture y vuelve a correr para llevarlo al carrito; la carga se hace con la cinta corriendo. Va un fixture a la vez: el PLC suelta el siguiente solo cuando el carrito avisa LISTO.'],
  ['Punto donde la banda deja el fixture', 'La cinta deja de apoyar en la cresta del rodillo de Ø50, 57 mm antes de la tapa (medido). Si la cinta agarra más que el PETG sobre PETG, empuja el fixture hasta que su cola deja la cresta: cae con ~6 cm afuera de la ventana. Se mide con la banda real.'],
  ['Guías de la banda', 'Tiras de 3 mm a 2 mm de la quilla, colgadas de los rieles con soportes impresos cada ~0.5 m (propuesta): la banda real no trae guías y entre los rieles hay 21.6 cm.'],
  ['Fixture', 'v4.1 (3-nov, fixture_v4.py), dibujado con las mallas que se imprimen: piso con quilla de 16.5 cm que se abre a 18.4 cm, ventana bajo la ECU, travesaño de la uña y 2 bastidores iguales (el segundo girado 180°) que se clavan en 4 pernos Ø4; desde la v4.2 cada barreno trae 3 costillas de apriete (se escoge el apriete con una probeta; no se pegan porque se quitan para poner la ECU). Sin QR: la ECU se reconoce con YOLO. Las ECU son cajas con sus medidas reales (Siemens VDO y MaxxECU alternadas).'],
  ['Hilos y conectores (rev. 3.32, 10-nov)', 'Cada cable se dibuja con sus hilos reales, del color de la lista de conexiones, y con el conector de cada pieza: clavija JST-PH de 6 pines en los NEMA (negro, verde, rojo, azul), ZH1.5 de 4 y XH2.54 de 2 en los M0601, cinta del MG90S con su conector JR y Dupont de 3 en J11, Dupont hembra en los VL53L0X, finales soldados a C y NC con termofit, punteras en todas las borneras, plug 5.5 × 2.5 y USB en el Jetson, micro USB en el ESP32 y faston en la batería. Supuestos: la coleta del M0601 sale por el centro del eje (no está en su hoja de datos); en los finales de carrera, cuál pata es C y cuál NC (vean las letras del switch); el lado de los conectores en el Jetson. Los hilos se dibujan del grueso que cabe en los carriles del arnés (0.7–1.2 mm), un poco más delgados que los reales.'],
  ['Arnés (rev. 3.31, 10-nov)', 'Las rutas de los cables son una propuesta de acomodo, revisada contra la forma real de las piezas: ninguno atraviesa nada en ninguna posición del elevador ni del empujador, ni se encima con otro. Lado derecho (poste trasero derecho): paro, 12 V del Jetson, final de home, VL53L0X de la pila y final superior. Lado izquierdo: servo, NEMA del empujador y USB. El cable del servo va cinchado a la cremallera y cuelga en un lazo por detrás del carro: en home ese lazo asoma ~3 cm por atrás, igual que las varillas. La bandeja dibujada es la de la rev. 3.6: con la de la rev. 3.30 (porta-placa) los cinchos del frente van en sus ranuras. Largos: midan con un cordón antes de cortar.'],
  ['Placa principal (propuesta)', 'Los documentos dan el mapa de pines, no el acomodo. Aquí se propone uno en la placa de 9 × 15 cm: A4988 atrás, ESP32 al centro con el USB a la izquierda, convertidor y MAX485 al frente, BNO055 abajo, borneras en las orillas. Las rutas de los 103 cables, sus colores y largos (~) salen de ese acomodo: si cambian el acomodo, cambian los largos, no las conexiones.'],
  ['Borneras', 'J1–J9, J11 y J13 son nombres de esta animación (no están en la guía). Escríbanlos en la placa con plumón para que coincidan. Desde la rev. 3.17 ya no hay J10 (QTR-8A) ni J12 (LEDs).'],
  ['Electrónica rev. 3.17 (27-oct)', 'Decisión del equipo: sin barra QTR-8A, sin LEDs WS2812 y sin expansor PCF8574. Los XSHUT de los 3 VL53L0X de obstáculos van directo al ESP32 (GPIO 32, 33 y 15) por la bornera J6; el de la pila no lleva XSHUT: al arrancar se apagan los otros 3 y a él se le cambia la dirección primero. La placa queda con 91 cables (lista en CONEXIONES_ESP32_AETHER.md).'],
  ['Electrónica rev. 3.17c (1-nov)', 'Decisión del equipo: el ESP32 sí lee el paro. Del VCC del relé (después del paro) sale un hilo a J13 PARO → divisor 100 kΩ / 20 kΩ + 100 nF → GPIO 34; si lee ~0 V entra a FALLA_PARO (velocidad 0, ENABLE en 1, home perdido) y solo sale con REARME + home. Se agrega un final de carrera superior NC (el de repuesto) en el soporte superior derecho: J13 FC4 → GPIO 35 con pull-up externo de 10 kΩ, abre a 83.15 cm. La placa queda con 103 cables (102 y 103: el capacitor del servo, rev. 3.17d). Los paneles laterales de MDF son un extra: no se dibujan.'],
  ['Cables de la bandeja y del carrito', 'Calibres de la guía (14 AWG potencia, 22 AWG señal); los de 18 AWG para drivers y lógica son sugeridos. Las rutas por el carrito son aproximadas.'],
  ['BNO055', 'Se dibuja el modelo de Adafruit (6 pines de un lado y 4 del otro) sobre la fila de 8 pines del de UNIT, que es el que compraron. El orden de los pines cambia según el fabricante (se dibujan VIN, GND, SDA, SCL primero): lean la serigrafía del módulo real.'],
  ['Jetson y cámara', 'Jetson (10.3 × 9.1 × 3.5 cm, del STEP de NVIDIA) sobre una base impresa atornillada al travesaño superior central, con soporte trasero (rev. 3.37b: sin MDF), puertos hacia atrás; cámara C920 (STEP de Logitech) arriba al frente en una repisa impresa, mirando a la banda ~6° hacia abajo.'],
  ['XL4005', 'Con sus medidas reales: 44 × 21 mm (antes se dibujaba de 27 × 54).'],
  ['Sensores', 'VL53L0X de obstáculos a ~20 cm del piso en el frente y los costados; el de la pila colgado del larguero superior, a ~96 cm.'],
  ['Estación de descarga', 'Mesa inclinada de melamina de 1.4 × 0.3 m a 15°, con bisagra, cuña, guías y tope de hule espuma dibujados a criterio.'],
  ['Tiempos', 'La animación va más rápida que el carrito real (un nivel real tarda 7 s; cargar un fixture ~18 s).'],
];

// ============================================================ MALLAS DE LOS STEP (generado por stepcheck/pack.py; mm, marco del STEP)
const STP = window.__AE_STP;   // data/stp1.js
const PSEC = {"outer":[[14.4,4.1],[14.4,4.7],[15.0,4.7],[15.0,13.0],[14.848,13.765],[14.414,14.414],[13.765,14.848],[13.0,15.0],[4.7,15.0],[4.7,14.4],[4.1,14.4],[4.1,13.188],[8.35,13.188],[8.35,10.188],[4.412,6.25],[-4.412,6.25],[-8.35,10.188],[-8.35,13.188],[-4.1,13.188],[-4.1,14.4],[-4.704,14.4],[-4.704,15.0],[-13.0,15.0],[-13.765,14.848],[-14.414,14.414],[-14.848,13.765],[-15.0,13.0],[-15.0,4.7],[-14.4,4.7],[-14.4,4.1],[-13.188,4.1],[-13.188,8.35],[-10.188,8.35],[-6.25,4.412],[-6.25,-4.412],[-10.188,-8.35],[-13.188,-8.35],[-13.188,-4.1],[-14.4,-4.1],[-14.4,-4.7],[-15.0,-4.7],[-15.0,-13.0],[-14.848,-13.765],[-14.414,-14.414],[-13.765,-14.848],[-13.0,-15.0],[-4.704,-15.0],[-4.704,-14.4],[-4.1,-14.4],[-4.1,-13.188],[-8.35,-13.188],[-8.35,-10.188],[-4.412,-6.25],[4.412,-6.25],[8.35,-10.188],[8.35,-13.188],[4.1,-13.188],[4.1,-14.4],[4.7,-14.4],[4.7,-15.0],[13.0,-15.0],[13.765,-14.848],[14.414,-14.414],[14.848,-13.765],[15.0,-13.0],[15.0,-4.7],[14.4,-4.7],[14.4,-4.1],[13.188,-4.1],[13.188,-8.35],[10.188,-8.35],[6.25,-4.412],[6.25,4.412],[10.188,8.35],[13.188,8.35],[13.188,4.1]],"inner":[[[13.73,12.73],[13.73,10.1],[13.584,9.746],[13.23,9.6],[10.1,9.6],[9.746,9.746],[9.6,10.1],[9.6,13.23],[9.746,13.584],[10.1,13.73],[12.73,13.73],[13.23,13.596],[13.596,13.23]],[[-13.73,-12.73],[-13.73,-10.1],[-13.584,-9.746],[-13.23,-9.6],[-10.1,-9.6],[-9.746,-9.746],[-9.6,-10.1],[-9.6,-13.23],[-9.746,-13.584],[-10.1,-13.73],[-12.73,-13.73],[-13.23,-13.596],[-13.596,-13.23]],[[-9.6,13.23],[-9.6,10.1],[-9.746,9.746],[-10.1,9.6],[-13.23,9.6],[-13.584,9.746],[-13.73,10.1],[-13.73,12.73],[-13.596,13.23],[-13.23,13.596],[-12.73,13.73],[-10.1,13.73],[-9.746,13.584]],[[9.6,-13.23],[9.6,-10.1],[9.746,-9.746],[10.1,-9.6],[13.23,-9.6],[13.584,-9.746],[13.73,-10.1],[13.73,-12.73],[13.596,-13.23],[13.23,-13.596],[12.73,-13.73],[10.1,-13.73],[9.746,-13.584]],[[3.111,4.525],[4.525,3.111],[3.189,1.775],[3.533,0.917],[3.65,0.0],[3.533,-0.917],[3.189,-1.775],[4.525,-3.111],[3.111,-4.525],[1.775,-3.189],[0.917,-3.533],[-0.0,-3.65],[-0.917,-3.533],[-1.775,-3.189],[-3.111,-4.525],[-4.525,-3.111],[-3.189,-1.775],[-3.533,-0.917],[-3.65,-0.0],[-3.533,0.917],[-3.189,1.775],[-4.525,3.111],[-3.111,4.525],[-1.775,3.189],[-0.917,3.533],[-0.0,3.65],[0.917,3.533],[1.775,3.189]]]};

// ============================================================ PIEZAS IMPRESAS CON BARRENOS (generado por holes/pack_prints.py; mm, coordenadas del carrito)
for (const o of window.__AE_STP2) Object.assign(STP, o);   // data/stp2.js









// ============================================================ ESCENA
const $ = id => document.getElementById(id);
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = v => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const seg = (t, a, b) => clamp01((t - a) / (b - a));            // 0→1 entre a y b
const segE = (t, a, b) => ease(seg(t, a, b));

const viewEl = $('view');
const isPhone = () => matchMedia('(max-width: 820px)').matches;
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isPhone() ? 1.75 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
viewEl.appendChild(renderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = 'labels';
viewEl.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 40);
camera.position.set(1.6, 1.3, 1.6);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.target.set(0, 0.5, 0);
controls.maxDistance = 9; controls.minDistance = 0.03;
controls.maxPolarAngle = Math.PI; // giro completo: se puede ver por debajo (el piso solo se dibuja por arriba)

scene.add(new THREE.HemisphereLight(0xffffff, 0x8f99a6, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(2.0, 3.4, 1.4);
sun.castShadow = true;
sun.shadow.mapSize.set(isPhone() ? 1024 : 2048, isPhone() ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 0.5, far: 8 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.01; sun.shadow.radius = 4;
scene.add(sun); scene.add(sun.target);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.7); fill.position.set(-2.2, 1.4, -1.6); scene.add(fill);

const floorMat = new THREE.MeshStandardMaterial({ color: 0xd9dee4, roughness: 0.95 });
const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 48), floorMat);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(6, 60, 0x000000, 0x000000);
grid.material.transparent = true; grid.material.opacity = 0.06; grid.position.y = 0.0005; scene.add(grid);

const cartRoot = new THREE.Group(); scene.add(cartRoot);     // todo lo que viaja con el carrito
const worldRoot = new THREE.Group(); scene.add(worldRoot);   // estaciones, inventario, barras

// Colores del tema (el lienzo sigue el tema claro/oscuro de la página)
const theme = { bg: new THREE.Color(), dim: new THREE.Color(), dimLine: '#000' };
function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  theme.bg.set(cs.getPropertyValue('--scene').trim() || '#e6eaef');
  floorMat.color.set(cs.getPropertyValue('--floor').trim() || '#d9dee4');
  theme.dim.copy(theme.bg);
  theme.dimLine = cs.getPropertyValue('--dim').trim() || '#123';
  scene.background = theme.bg.clone();
  scene.fog = new THREE.Fog(theme.bg, 6, 14);
  for (const d of DIMS) d.mat.color.set(theme.dimLine);
  partsDirty = true;
}

// ============================================================ MATERIALES
const MAT = {
  alu:    { c: 0xb4bec9, m: 0.55, r: 0.38 },
  steel:  { c: 0xd8dde3, m: 0.85, r: 0.22 },
  dark:   { c: 0x2a2e33, m: 0.25, r: 0.55 },
  black:  { c: 0x1a1c1f, m: 0.10, r: 0.70 },
  brass:  { c: 0xc9a227, m: 0.75, r: 0.32 },
  rubber: { c: 0x232528, m: 0.00, r: 0.92 },
  nylon:  { c: 0xece8dc, m: 0.00, r: 0.60 },
  ecu:    { c: 0xb9c0c8, m: 0.70, r: 0.35 },
  pcb:    { c: 0x1f6f43, m: 0.10, r: 0.60 },
  pcbB:   { c: 0x1d3f8a, m: 0.10, r: 0.60 },
  pcbP:   { c: 0x5b2a86, m: 0.10, r: 0.60 },
  perf:   { c: 0xc8a165, m: 0.05, r: 0.80 },
  mdf:    { c: 0xc59a6d, m: 0.00, r: 0.85 },
  wood:   { c: 0xb58450, m: 0.00, r: 0.80 },
  bat:    { c: 0x30353b, m: 0.10, r: 0.60 },
  red:    { c: 0xd62828, m: 0.10, r: 0.45 },
  yellow: { c: 0xf2c418, m: 0.05, r: 0.50 },
  orange: { c: 0xf97316, m: 0.05, r: 0.50 },
  blue:   { c: 0x2563eb, m: 0.05, r: 0.50 },
  white:  { c: 0xf4f4f2, m: 0.00, r: 0.60 },
  green:  { c: 0x22c55e, m: 0.00, r: 0.50 },
  belt:   { c: 0x24272b, m: 0.00, r: 0.90 },
  glass:  { c: 0x111418, m: 0.30, r: 0.15 },
  cRed:   { c: 0xdc2626, m: 0.0, r: 0.5 }, cOra: { c: 0xf97316, m: 0.0, r: 0.5 },
  cBlk:   { c: 0x1f2328, m: 0.0, r: 0.6 }, cBlu: { c: 0x3b82f6, m: 0.0, r: 0.5 },
  cYel:   { c: 0xeab308, m: 0.0, r: 0.5 }, cGrn: { c: 0x16a34a, m: 0.0, r: 0.5 },
  cWht:   { c: 0xe5e7eb, m: 0.0, r: 0.5 }, cPur: { c: 0xa855f7, m: 0.0, r: 0.5 },
  // colores de los cables de la placa (código sugerido)
  cPnk:   { c: 0xf472b6, m: 0.0, r: 0.5 }, cBrn: { c: 0x92400e, m: 0.0, r: 0.5 },
  cGry:   { c: 0x8b9199, m: 0.0, r: 0.5 }, cTeal: { c: 0x14b8a6, m: 0.0, r: 0.5 },
  cLbl:   { c: 0x7dd3fc, m: 0.0, r: 0.5 }, cLim: { c: 0xa3e635, m: 0.0, r: 0.5 },
  cOli:   { c: 0x6b7a1e, m: 0.0, r: 0.5 }, cMag: { c: 0xdb2777, m: 0.0, r: 0.5 },
  cBei:   { c: 0xd6c3a0, m: 0.0, r: 0.5 }, cTin: { c: 0xcfd4da, m: 0.9, r: 0.25 },
  // resistencias (cuerpo y bandas de color)
  rBody:  { c: 0xd9c8a5, m: 0.0, r: 0.6 }, rBlu: { c: 0x5b8fd6, m: 0.0, r: 0.6 },
  bBrn:   { c: 0x7a3e12, m: 0.0, r: 0.5 }, bBlk: { c: 0x111111, m: 0.0, r: 0.5 }, bYel: { c: 0xf2c418, m: 0.0, r: 0.5 },
  bRed:   { c: 0xd62828, m: 0.0, r: 0.5 }, bOra: { c: 0xf97316, m: 0.0, r: 0.5 }, bGold: { c: 0xc9a227, m: 0.8, r: 0.3 },
  capE:   { c: 0x1e40af, m: 0.1, r: 0.45 }, capC: { c: 0xd4a017, m: 0.0, r: 0.6 },
  foam:   { c: 0x3a3f46, m: 0.0, r: 0.95 }, strap: { c: 0x1f2937, m: 0.0, r: 0.8 },
  socket: { c: 0x15171a, m: 0.05, r: 0.6 }, gold: { c: 0xd9b54a, m: 0.9, r: 0.25 },
  term:   { c: 0x2f7d4f, m: 0.05, r: 0.55 }, melam: { c: 0xf1efe8, m: 0.0, r: 0.4 },
};
function matSpec(key, sub) {
  if (key[0] === '#') {                                                  // color tomado del STEP
    const c = new THREE.Color(key), hsl = {}; c.getHSL(hsl);
    const metal = hsl.s < 0.18 && hsl.l > 0.5;                           // grises claros: metal
    return { c: parseInt(key.slice(1), 16), m: metal ? 0.6 : 0.08, r: metal ? 0.35 : 0.55 };
  }
  if (key === 'P') return { c: SUBS[sub].color, m: 0.05, r: 0.55 };        // pieza impresa / color del subsistema
  if (key === 'Pd') return { c: SUBS[sub].accent, m: 0.05, r: 0.55 };
  return MAT[key];
}

// ============================================================ PIEZAS
// Cada pieza se modela en coordenadas del carrito; el builder la centra en su pivote
// y une las primitivas por material (pocas llamadas de dibujo → fluido en celular).
const PARTS = new Map();
let partsDirty = true;
const PROFILE_SHAPE = (() => {                                      // sección real del 3030 ranura 8 (STEP del proveedor)
  const m = p => new THREE.Vector2(p[0] / 1000, p[1] / 1000);
  const s = new THREE.Shape(PSEC.outer.map(m));
  for (const w of PSEC.inner) s.holes.push(new THREE.Path(w.map(m)));
  return s;
})();
const GEO_CACHE = new Map();
const PICK_MAT = new THREE.MeshBasicMaterial({ visible: false });
function cachedGeo(key, make) { if (!GEO_CACHE.has(key)) GEO_CACHE.set(key, make()); return GEO_CACHE.get(key); }

// ---------- mallas de los STEP (01b_meshes.js): se decodifican una vez y se reusan
const STP_GEO = new Map();
function stpGeos(key) {
  if (STP_GEO.has(key)) return STP_GEO.get(key);
  const d = STP[key], b = d.b, S = [b[3] - b[0], b[4] - b[1], b[5] - b[2]];
  const bin = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;
  const out = d.g.map(([c, pb, ib, bits]) => {
    const q = new Uint16Array(bin(pb)), p = new Float32Array(q.length);
    for (let i = 0; i < q.length; i++) { const k = i % 3; p[i] = b[k] + q[i] / 65535 * S[k]; }
    let g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setIndex(new THREE.BufferAttribute(bits === 16 ? new Uint16Array(bin(ib)) : new Uint32Array(bin(ib)), 1));
    g = toCreasedNormals(g, 0.6);
    return { c, g };
  });
  STP_GEO.set(key, out);
  return out;
}
// Ejes: map = a dónde va cada eje del STEP en el carrito, p. ej. ['x', '-z', 'y'].
function stpBasis(map) {
  const v = a => { const s = a[0] === '-' ? -1 : 1, k = a.slice(-1); return V3(k === 'x' ? s : 0, k === 'y' ? s : 0, k === 'z' ? s : 0); };
  const m = new THREE.Matrix4().makeBasis(v(map[0]), v(map[1]), v(map[2]));
  if (m.determinant() < 0) throw new Error('stp: ejes en espejo ' + map);
  return m;
}

// rev. 3.15: pieza impresa ya en coordenadas del carrito con una parte en el marco de abajo: los vértices bajo lift[0] (mm) suben lift[1] (m)
const LIFT_GEO = new Map();
function liftGeo(key, c, g, [cut, dy, dyUp = 0]) {
  const k = key + c + cut + dy + '/' + dyUp;
  if (!LIFT_GEO.has(k)) {
    const h = g.clone(), p = h.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + (p.getY(i) < cut ? dy : dyUp) * 1000);
    p.needsUpdate = true; h.computeBoundingBox(); LIFT_GEO.set(k, h);
  }
  return LIFT_GEO.get(k);
}
// rev. 3.15: el marco de abajo subió D.DH (rodajas de 4"). Lo eléctrico que va sobre él sube igual; los cables que van de ahí a la
// torre o a los motores se estiran (sube solo el tramo de abajo). Suspensión y ruedas se quedan (calzas bajo el marco).
const LIFT_KEEP = /^(cast_|susp_|spring_|mot_|fx\d)/;
const liftW = y => clamp01((y - 0.070) / 0.020) * (1 - clamp01((y - 0.200) / 0.035));
function liftPart(id, sub, b, opt) {
  if (!D.DH || opt.world || opt.abs || sub !== 'elec' || LIFT_KEEP.test(id)) return;
  let y0 = Infinity, y1 = -Infinity;
  for (const it of b.items) {
    if (it.tube) { for (const p of it.tube.points) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); } continue; }
    if (!it.geo.boundingBox) it.geo.computeBoundingBox();
    const bx = it.geo.boundingBox.clone().applyMatrix4(it.m); y0 = Math.min(y0, bx.min.y); y1 = Math.max(y1, bx.max.y);
  }
  for (const c of b.checks) { y0 = Math.min(y0, c.min.y); y1 = Math.max(y1, c.max.y); }
  const tubes = b.items.some(it => it.tube);
  const full = (y0 >= 0.085 && y1 < (tubes ? 0.20 : 0.30)) || /^(cab_batN?|bat|bat_hold|bat_cradle)$/.test(id);   // rev. 3.36: la batería parada pasa de 0.30
  if (!full && (!tubes || y1 < 0.085)) return;
  const T = new THREE.Matrix4().makeTranslation(0, D.DH, 0);
  for (const it of b.items) {
    if (!it.tube) { if (full) it.m.premultiply(T); continue; }
    const { points, r, segs, closed } = it.tube;
    const pts = points.map(p => { const a = Array.isArray(p) ? p : [p.x, p.y, p.z]; return [a[0], a[1] + D.DH * (full ? 1 : liftW(a[1])), a[2]]; });
    it.tube.points = pts;
    it.geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => V3(...p)), closed, 'catmullrom', 0.2), segs, r, 6, closed);
  }
  if (full) for (const c of b.checks) c.translate(V3(0, D.DH, 0));
}

class Builder {
  constructor(sub) { this.sub = sub; this.items = []; this.checks = []; }
  add(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const m = new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V3(sx, sy, sz));
    this.items.push({ geo, mat, m }); return this;
  }
  box(w, h, d, x, y, z, mat = 'P', rx = 0, ry = 0, rz = 0) {
    return this.add(cachedGeo('box', () => new THREE.BoxGeometry(1, 1, 1)), mat, x, y, z, rx, ry, rz, w, h, d);
  }
  // caja por esquinas (x0..x1, y0..y1, z0..z1)
  bb(x0, x1, y0, y1, z0, z1, mat = 'P') { return this.box(x1 - x0, y1 - y0, z1 - z0, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, mat); }
  cyl(r, h, x, y, z, axis = 'y', mat = 'P', segs = 20, r2 = r) {
    const g = cachedGeo(`cyl${segs}_${(r2 / r).toFixed(3)}`, () => new THREE.CylinderGeometry(r2 / r, 1, 1, segs));
    const rx = axis === 'z' ? Math.PI / 2 : 0, rz = axis === 'x' ? -Math.PI / 2 : 0;
    return this.add(g, mat, x, y, z, rx, 0, rz, r, h, r);
  }
  // Malla de un STEP. o.map: ejes; o.at: [x,y,z] (m); o.al: por eje 'o' (origen del STEP ahí), 'c' (centro), 'min', 'max';
  // o.col: { '#color del STEP': material } para cambiar colores; o.skip: colores que no se dibujan.
  stp(key, o) {
    const R = stpBasis(o.map || ['x', 'y', 'z']), s = 0.001, b = STP[key].b, al = o.al || ['o', 'o', 'o'];
    const box = new THREE.Box3(V3(b[0], b[1], b[2]).multiplyScalar(s), V3(b[3], b[4], b[5]).multiplyScalar(s)).applyMatrix4(R);
    const t = V3();
    for (const [i, k] of ['x', 'y', 'z'].entries()) {
      const a = al[i], at = o.at[i];
      t[k] = a === 'o' ? at : a === 'c' ? at - (box.min[k] + box.max[k]) / 2 : a === 'min' ? at - box.min[k] : at - box.max[k];
    }
    return this.stpAt(key, R, t, o);
  }
  // Igual que stp, con la rotación R (Matrix4) y la traslación t (m) ya calculadas
  stpAt(key, R, t, o = {}) {
    const s = 0.001, e = new THREE.Euler().setFromRotationMatrix(R);
    for (const { c, g } of stpGeos(key)) {
      if (o.skip && o.skip.includes(c)) continue;
      this.add(o.lift ? liftGeo(key, c, g, o.lift) : g, (o.col && o.col[c]) || c, t.x, t.y, t.z, e.x, e.y, e.z, s, s, s);
      this.items[this.items.length - 1].stp = true;
    }
    const M = R.clone().scale(V3(s, s, s)).setPosition(t), k = STP[key].k;   // para los choques: una caja por sólido
    for (let i = 0; i < k.length; i += 6) { const dy = !o.lift ? 0 : k[i + 4] < o.lift[0] ? o.lift[1] * 1000 : (o.lift[2] || 0) * 1000; this.checks.push(new THREE.Box3(V3(k[i], k[i + 1] + dy, k[i + 2]), V3(k[i + 3], k[i + 4] + dy, k[i + 5])).applyMatrix4(M)); }
    return this;
  }
  // Pieza impresa con sus barrenos (holes/prints.py), ya en coordenadas del carrito
  // rev. 3.16: Allen M6 + tuerca T de martillo (STEP) en la ranura. P en la cara del perfil, ax = hacia afuera de la cara, al = a lo largo del perfil
  fastener(P, ax, al) {
    this.stpAt('tnut', new THREE.Matrix4().makeBasis(al, ax, al.clone().cross(ax)), P.clone().addScaledVector(ax, -0.0015));
    const k = Math.abs(ax.x) > 0.5 ? 'x' : Math.abs(ax.y) > 0.5 ? 'y' : 'z', H = P.clone().addScaledVector(ax, 0.007);
    return this.cyl(0.005, 0.006, H.x, H.y, H.z, k, 'dark', 14);
  }
  prt(key, o = {}) { return this.stpAt('prt_' + key, new THREE.Matrix4(), V3(), Object.assign({ col: { '#000001': 'P', '#000002': 'Pd' } }, o)); }
  hex(r, h, x, y, z, axis = 'y', mat = 'steel') { return this.cyl(r, h, x, y, z, axis, mat, 6); }
  tube(points, r, mat, segs = 48, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => V3(...p)), closed, 'catmullrom', 0.2);
    this.add(new THREE.TubeGeometry(curve, segs, r, 6, closed), mat);
    this.items[this.items.length - 1].tube = { points, r, segs, closed };   // para subirlo con el marco (rev. 3.15)
    return this;
  }
  // perfil 3030 de largo L, eje 'x' | 'y' | 'z', centrado en (x,y,z)
  profile(L, axis, x, y, z) {
    const g = cachedGeo('pf' + L, () => { const e = new THREE.ExtrudeGeometry(PROFILE_SHAPE, { depth: L, bevelEnabled: false, curveSegments: 6 }); e.translate(0, 0, -L / 2); return e; });
    const r = axis === 'x' ? [0, Math.PI / 2, 0] : axis === 'y' ? [Math.PI / 2, 0, 0] : [0, 0, 0];
    return this.add(g, 'alu', x, y, z, ...r);
  }
  // escuadra en L (patas a y b, ancho w, grueso t); orientada con dos vectores unitarios
  bracket(x, y, z, ua, ub, w = 0.02, a = 0.036, t = 0.006, mat = 'Pd') {
    // ua: dirección de la pata 1 (desde la esquina), ub: pata 2; ancho en ua×ub
    const A = V3(...ua), B = V3(...ub), N = A.clone().cross(B).normalize();
    if (a === 0.036 && t === 0.006 && (w === 0.02 || w === 0.014))         // rev. 3.15: escuadra de aluminio (STEP que mandó Isaac: 35 × 35 × 29, 4 mm, ranura de 7.5 mm por pata)
      return this.stpAt('esc_al', new THREE.Matrix4().makeBasis(A, B, N), V3(x, y, z), { col: { '#000003': 'alu' } });
    const put = (len, dir, other) => {
      const c = V3(x, y, z).addScaledVector(dir, len / 2).addScaledVector(other, t / 2);
      const m = new THREE.Matrix4().makeBasis(dir, other, dir.clone().cross(other));
      const q = new THREE.Quaternion().setFromRotationMatrix(m);
      const e = new THREE.Euler().setFromQuaternion(q);
      this.box(len, t, w, c.x, c.y, c.z, mat, e.x, e.y, e.z);
    };
    put(a, A, B); put(a, B, A);
    const g = V3(x, y, z).addScaledVector(A, 0.014).addScaledVector(B, 0.014);   // cartela
    const m = new THREE.Matrix4().makeBasis(A.clone().add(B).normalize(), N, A.clone().sub(B).normalize());
    const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromRotationMatrix(m));
    this.box(0.022, 0.004, 0.004, g.x, g.y, g.z, mat, e.x, e.y, e.z);
    return this;
  }
}

// rev. 3.18 (5-nov): la cinta real está a 821.5 mm y el diseño la tenía a 830. Lo que trabaja con ella (torre, elevador, empujador, uña,
// guías) se dibuja con las medidas del diseño y aquí baja 8.5 mm. Lo que va sobre el marco de arriba sube con él (1.040 → 1.051).
const SHIFT_ID = { camera: 0.011, vl_pile: 0.011, st_dock: 0, calza_empF: 0, st_ac_calza: 0, st_ac_b80: 0, st_ac_brazo: 0, st_ac_guia: 0, st_ac_b12: 0 };   // el paro va con el travesaño de arriba de atrás (−8.5)
function shiftOf(id, sub, opt = {}) { if (id in SHIFT_ID) return SHIFT_ID[id]; return !opt.world && (sub === 'torre' || sub === 'emp' || id === 'estop') ? -0.0085 : 0; }
function shiftItems(b, dy) {
  if (!dy) return;
  const T = new THREE.Matrix4().makeTranslation(0, dy, 0);
  for (const it of b.items) {
    if (!it.tube) { it.m.premultiply(T); continue; }
    const { points, r, segs, closed } = it.tube;
    it.tube.points = points.map(p => { const a = Array.isArray(p) ? p : [p.x, p.y, p.z]; return [a[0], a[1] + dy, a[2]]; });
    it.geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(it.tube.points.map(p => V3(...p)), closed, 'catmullrom', 0.2), segs, r, 6, closed);
  }
  for (const c of b.checks) c.translate(V3(0, dy, 0));
}
function addPart(id, sub, name, build, opt = {}) {
  const b = new Builder(sub); build(b); liftPart(id, sub, b, opt);
  const dyS = shiftOf(id, sub, opt); shiftItems(b, dyS);
  const prims = b.items.filter(it => !(it.geo.type === 'TubeGeometry') && !it.stp).map(it => { if (!it.geo.boundingBox) it.geo.computeBoundingBox(); return it.geo.boundingBox.clone().applyMatrix4(it.m); }).concat(b.checks);
  const groups = new Map();
  for (const it of b.items) {
    const key = it.mat;
    if (!groups.has(key)) groups.set(key, []);
    let g = it.geo.index ? it.geo.toNonIndexed() : it.geo.clone();
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(it.m); groups.get(key).push(g);
  }
  const merged = [];
  const box = new THREE.Box3();
  for (const [k, arr] of groups) { const g = mergeGeometries(arr, false); g.computeBoundingBox(); box.union(g.boundingBox); merged.push([k, g]); arr.forEach(a => a.dispose()); }
  const pivot = opt.pivot ? V3(...opt.pivot).add(V3(0, dyS, 0)) : box.getCenter(V3());
  const group = new THREE.Group(); group.name = id; group.userData.pid = id;
  const mats = [];
  const size = box.getSize(V3()); const big = Math.max(size.x, size.y, size.z) > 0.025;
  for (const [k, g] of merged) {
    g.translate(-pivot.x, -pivot.y, -pivot.z);
    const s = matSpec(k, sub);
    const mat = new THREE.MeshStandardMaterial({ color: s.c, metalness: s.m, roughness: s.r, flatShading: false });
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = opt.shadow ?? big; mesh.receiveShadow = true;
    group.add(mesh); mats.push({ mat, base: new THREE.Color(s.c) });
  }
  group.position.copy(pivot);
  let haloMesh = null;
  if (opt.pickR) {                                 // cable delgado: tubo invisible más grueso para poder hacerle clic
    const pickSrc = opt.pickPath ? [{ geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(opt.pickPath.map(q => V3(...q)), false, 'catmullrom', 0.2), opt.pickPath.length, opt.pickHR || 0.001, 3, false) }] : b.items;
    for (const it of pickSrc) if (it.geo.type === 'TubeGeometry') {
      const g = new THREE.TubeGeometry(it.geo.parameters.path, Math.max(12, it.geo.parameters.tubularSegments >> 1), opt.pickR, 5, false);
      g.translate(-pivot.x, -pivot.y, -pivot.z);
      const pm = new THREE.Mesh(g, PICK_MAT); pm.userData.proxy = true; group.add(pm);
      // halo naranja alrededor del cable del paso (se ve en tema claro y oscuro, aunque el cable sea negro)
      const hr = Math.max(0.0011, it.geo.parameters.radius * 2.6);
      const hg = new THREE.TubeGeometry(it.geo.parameters.path, it.geo.parameters.tubularSegments, hr, 8, false).toNonIndexed();
      hg.translate(-pivot.x, -pivot.y, -pivot.z);
      const hm = new THREE.Mesh(hg, new THREE.MeshBasicMaterial({ color: 0xff8a00, transparent: true, opacity: 0.55, depthTest: false, depthWrite: false }));
      hm.userData.proxy = true; hm.renderOrder = 39; hm.visible = false; group.add(hm); haloMesh = hm;
    }
  }
  (opt.world ? worldRoot : cartRoot).add(group);
  const p = {
    id, sub, name, group, mats, home: pivot.clone(), homeQ: new THREE.Quaternion(),
    explode: opt.explode ? V3(...opt.explode) : null, from: opt.from ? V3(...opt.from) : null,
    mount: opt.mount || null, track: [], mode: '', localBox: box.clone().translate(pivot.clone().negate()),
    items: b.items, halo: haloMesh, nest: opt.nest || [], world: !!opt.world, noCheck: !!opt.noCheck, only: opt.only || null, prims,
  };
  PARTS.set(id, p);
  return p;
}

// Explosión por defecto: hacia afuera del centro del carrito y un poco hacia arriba
function defaultExplode(p) {
  const c = p.home, dir = V3(c.x, 0, c.z);
  if (dir.length() < 0.02) dir.set(0, 0, 0);
  dir.normalize().multiplyScalar(0.28);
  dir.y = 0.12 + Math.max(0, c.y - 0.5) * 0.15;
  return dir;
}

// ============================================================ ESTADO VISUAL
function setMode(p, mode, pulse = 0, ghost = 0, xray = false) {
  // ghost: 0 = normal; 0 < ghost < 1 = transparente (aislado por clic o por el paso de cableado)
  const transp = !ghost && ui.transp && p.sub === 'est' && curTrack(p).length && mode !== 'hidden';
  const op = ghost || (transp ? 0.13 : (p.alpha || 1));   // rev. 3.48: p.alpha (cono de visión)
  const key = mode + '|' + op + (xray ? 'X' : '') + (mode === 'new' || mode === 'hot' ? pulse.toFixed(2) : '') + (partsDirty ? Math.random() : '');
  if (p.mode === key) return;
  p.mode = key;
  p.group.visible = mode !== 'hidden';
  if (mode === 'hidden') return;
  const acc = new THREE.Color(SUBS[p.sub].accent);
  for (const { mat, base } of p.mats) {
    mat.color.copy(base);
    mat.emissive.setRGB(0, 0, 0);
    if (ghost) mat.color.lerp(theme.dim, 0.35);
    else {
      if (mode === 'old') mat.color.lerp(theme.dim, 0.55);
      if (mode === 'new') mat.emissive.copy(acc).multiplyScalar(0.10 + 0.22 * pulse);
      if (mode === 'focus') mat.emissive.copy(acc).multiplyScalar(0.16);
      if (mode === 'hot') mat.emissive.copy(base).multiplyScalar(0.25 + 0.5 * pulse).add(new THREE.Color(0.05, 0.05, 0.05).multiplyScalar(pulse));
      if (mode === 'pick') mat.emissive.setRGB(0.15, 0.55, 1).multiplyScalar(0.22);
    }
    if ((mat.opacity !== op) || (mat.transparent !== (op < 1)) || mat.depthTest === xray) {
      mat.opacity = op; mat.transparent = op < 1 || xray; mat.depthWrite = op === 1 && !xray; mat.depthTest = !xray; mat.needsUpdate = true;
    }
  }
  // rayos X: el cable del paso se dibuja encima de todo (aunque pase por debajo de un módulo o la cámara esté abajo)
  for (const m of p.group.children) if (!m.userData.proxy) m.renderOrder = xray ? 40 : 0;
  for (const m of p.group.children) if (!m.userData.proxy) m.castShadow = op === 1 && (m.userData.shadow ?? (m.userData.shadow = m.castShadow));
}

// ============================================================ ETIQUETAS 3D
function makeLabel(title, sub, cls = '') {
  const el = document.createElement('div');
  el.className = 'tag3d ' + cls;
  el.innerHTML = `<span class="tag-dot"></span><span class="tag-box"><b></b>${sub ? '<small></small>' : ''}</span>`;
  el.querySelector('b').textContent = title;
  if (sub) el.querySelector('small').textContent = sub;
  const o = new CSS2DObject(el); o.visible = false;      // se agrega a la escena solo mientras se ve (miles de etiquetas en total)
  return o;
}

// ============================================================ COTAS
const DIMS = [];
const ARROW = new THREE.ConeGeometry(0.0055, 0.016, 10);
function makeDim(a, b, off, text, opt = {}) {
  const A = V3(...a), B = V3(...b), O = V3(...(off || [0, 0, 0]));
  const A2 = A.clone().add(O), B2 = B.clone().add(O);
  const mat = new THREE.LineBasicMaterial({ color: theme.dimLine, depthTest: false, transparent: true });
  const g = new THREE.Group();
  const lines = [A2, B2];
  if (O.length() > 1e-4) {
    const ext = O.clone().normalize().multiplyScalar(0.012);
    lines.push(A, A2.clone().add(ext), B, B2.clone().add(ext));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(lines);
  const ls = new THREE.LineSegments(geo, mat); ls.renderOrder = 10; g.add(ls);
  const dir = B2.clone().sub(A2).normalize();
  const amat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true });
  for (const [P, s] of [[A2, -1], [B2, 1]]) {
    const c = new THREE.Mesh(ARROW, amat);
    c.position.copy(P).addScaledVector(dir, -s * 0.008);
    c.quaternion.setFromUnitVectors(V3(0, 1, 0), dir.clone().multiplyScalar(s));
    c.renderOrder = 11; g.add(c);
  }
  const el = document.createElement('div'); el.className = 'dim3d' + (opt.cls ? ' ' + opt.cls : ''); el.textContent = text;
  const lab = new CSS2DObject(el); lab.position.copy(A2).lerp(B2, opt.labAt ?? 0.5); g.add(lab);
  g.visible = false;
  const d = { g, mat, amat, lab, mount: opt.mount || null, t: opt.t ?? 0.8, grow: !!opt.grow, A2, B2, geo, lines };
  DIMS.push(d);
  return d;
}

// ============================================================ CÁMARA
const camTween = { active: false, t: 0, dur: 1.1, p0: V3(), t0: V3(), p1: V3(), t1: V3() };
function fitDistance(r) {
  const vf = THREE.MathUtils.degToRad(camera.fov);
  const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  return r / Math.sin(Math.min(vf, hf) / 2);
}
function camGoal(c, cartM) {
  const t = V3(...c.t), d = V3(...c.d).normalize();
  if (c.follow && cartM) t.applyMatrix4(cartM);
  return { target: t, pos: t.clone().addScaledVector(d, fitDistance(c.r)) };
}
function flyTo(c, instant = false, cartM = null) {
  const g = camGoal(c, cartM);
  if (instant) { camera.position.copy(g.pos); controls.target.copy(g.target); camTween.active = false; return; }
  Object.assign(camTween, { active: true, t: 0 });
  camTween.p0.copy(camera.position); camTween.t0.copy(controls.target);
  camTween.p1.copy(g.pos); camTween.t1.copy(g.target);
}
controls.addEventListener('start', () => { camTween.active = false; ui.userCam = true; });

// ============================================================ ESTRUCTURA (perfil 3030)
const PF = [];   // { id, L, axis, pos:[x,y,z], name }
{
  const { XP, ZP, YB, H0, POST } = D, YT = D.YT, yP = H0 + POST / 2;
  const add = (id, L, axis, pos, name) => PF.push({ id, L, axis, pos, name });
  add('post_FL', D.POST, 'y', [XP, yP, -ZP], 'Poste delantero izq.');
  add('post_FR', D.POST, 'y', [XP, yP, ZP], 'Poste delantero der.');
  add('post_BL', D.POST, 'y', [-XP, yP, -ZP], 'Poste trasero izq.');
  add('post_BR', D.POST, 'y', [-XP, yP, ZP], 'Poste trasero der.');
  add('larg_bL', 0.44, 'x', [0, YB, -ZP], 'Larguero inferior izq.');
  add('larg_bR', 0.44, 'x', [0, YB, ZP], 'Larguero inferior der.');
  add('larg_tL', 0.44, 'x', [0, YT, -ZP], 'Larguero superior izq.');
  add('larg_tR', 0.44, 'x', [0, YT, ZP], 'Larguero superior der.');
  add('trav_bF', 0.34, 'z', [XP, YB, 0], 'Travesaño inferior delantero');
  add('trav_bB', 0.34, 'z', [-XP, YB, 0], 'Travesaño inferior trasero');
  add('trav_tF', 0.34, 'z', [XP, YT, 0], 'Travesaño superior delantero');
  add('trav_tB', 0.34, 'z', [-XP, YT - 0.0195, 0], 'Travesaño superior trasero');   // rev. 3.18: 19.5 mm abajo de la punta de los postes
  add('trav_c', 0.34, 'z', [0, YB, 0], 'Travesaño central (motores)');
  const yC = H0 + D.PF + D.COLL / 2;
  add('col_FL', D.COLL, 'y', [D.COLXF, yC, -D.COLZF], 'Columna delantera izq.');
  add('col_FR', D.COLL, 'y', [D.COLXF, yC, D.COLZF], 'Columna delantera der.');
  add('col_BL', D.COLL, 'y', [D.COLXB, yC, -D.COLZC], 'Columna trasera izq.');
  add('col_BR', D.COLL, 'y', [D.COLXB, yC, D.COLZC], 'Columna trasera der.');
  add('trav_sc', 0.34, 'z', [0, D.YSC, 0], 'Travesaño superior central');
  add('trav_emp', 0.198, 'z', [0, D.YEMP, 0], 'Travesaño del empujador');
  for (const f of PF) addPart(f.id, 'est', f.name, b => b.profile(f.L, f.axis, ...f.pos), { pivot: f.pos });
}

// Acomodo del perfil (Etapa 6, 15-oct): 1 barra de 6 m (PEI) + la barra de 2 m; las piezas cortas salen de las barras extra de la escuela
const BARS = [
  { ids: ['post_FL', 'post_FR', 'post_BL', 'post_BR', 'col_FL', 'col_FR', 'trav_sc'], len: 6.0, waste: 0.335, note: 'Postes cortados a 948 y columnas a 889 (limar 1 mm: 888)' },
  { ids: ['col_BL', 'col_BR', 'trav_emp'], len: 2.0, waste: 0.105, note: 'Columnas traseras 888 + travesaño del empujador 198' },
  { ids: ['larg_bL', 'larg_bR', 'larg_tL', 'larg_tR', 'trav_bF', 'trav_bB', 'trav_tF', 'trav_tB', 'trav_c'], len: 0, waste: 0, note: 'Faltan: 440 × 4 + 340 × 5 de las barras extra de la escuela (se cuentan el 16-oct)' },
];
const BAR_X0 = -3.0, BAR_Z0 = 0.62, BAR_DZ = 0.4;
const Q_ALONG_X = { x: new THREE.Quaternion(), y: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), z: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)) };
const PF_BY = id => PF.find(f => f.id === id);
function barPose(id, gap) {      // pieza acostada sobre el piso, alineada en su barra (las cortas, separadas: vienen de otras barras)
  for (let k = 0; k < BARS.length; k++) {
    let x = BAR_X0; const b = BARS[k];
    for (const pid of b.ids) {
      const f = PF_BY(pid);
      if (pid === id) return { pos: V3(x + f.L / 2, 0.0151, BAR_Z0 + k * BAR_DZ), q: Q_ALONG_X[f.axis].clone() };
      x += f.L + (b.len ? gap : 0.06);
    }
  }
}
function sortedPose(id) {         // acomodadas por tipo, listas para armar
  const f = PF_BY(id), q = Q_ALONG_X[f.axis].clone();
  const K = o => o.startsWith('post') ? 0 : o.startsWith('col') ? 1 : o.startsWith('larg') ? 2 : 3;
  const kind = K(id);
  const list = PF.filter(o => K(o.id) === kind);
  const i = list.indexOf(f);
  const xc = [-0.50, -0.50, 0.28, 0.86][kind], z0 = [0.62, 0.86, 0.62, 0.62][kind];
  return { pos: V3(xc, 0.0151, z0 + i * 0.05), q };
}
// sobras de cada barra (solo en la Etapa 6)
BARS.forEach((b, k) => {
  if (!b.waste) return;
  const used = b.ids.reduce((a, id) => a + PF_BY(id).L + 0.003, 0);
  const x = BAR_X0 + used + b.waste / 2;
  addPart('waste' + k, 'est', 'Sobra', bb => {
    bb.add(cachedGeo('pfw' + k, () => { const e = new THREE.ExtrudeGeometry(PROFILE_SHAPE, { depth: b.waste, bevelEnabled: false, curveSegments: 6 }); e.translate(0, 0, -b.waste / 2); return e; }),
      'alu', x, 0.0151, BAR_Z0 + k * BAR_DZ, 0, Math.PI / 2, 0);
  }, { world: true, noCheck: true });
});

const ESC_FAST = {};   // rev. 3.16: tornillos de las escuadras del marco de abajo y del de arriba
// ============================================================ ESCUADRAS
{
  const { XI, ZI, H0, PF: T } = D, yTop = D.H0 + T, yBotT = D.HT - T;
  const bot = [], top = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    // marco inferior: arriba del larguero y del travesaño contra el poste + 2 por dentro de la esquina
    bot.push([sx * XI, yTop, sz * D.ZP, [-sx, 0, 0], [0, 1, 0]]);
    if (sx < 0) bot.push([sx * D.XP, yTop, sz * ZI, [0, 0, -sz], [0, 1, 0]]);   // al frente no: ahí se para la columna de la torre (rev. 3.8)
    bot.push([sx * XI, H0 + 0.015, sz * ZI, [-sx, 0, 0], [0, 0, -sz]]);   // rev. 3.13: 1 de 20 mm centrada en la ranura (las 2 de 14 mm tenían los barrenos 7 mm fuera)
    top.push([sx * XI, yBotT, sz * D.ZP, [-sx, 0, 0], [0, -1, 0]]);
    if (sx < 0) top.push([sx * D.XP, yBotT - 0.0195, sz * ZI, [0, 0, -sz], [0, -1, 0]]);   // rev. 3.18: con el travesaño de atrás   // al frente la columna llega hasta este travesaño
  }
  const cen = [];
  for (const s of [-1, 1]) {
    // travesaño central con el larguero: 1 escuadra por el costado de atrás (la de arriba, con la pata parada, no agarraba nada; por el frente choca con el motor)
    cen.push([-0.015, H0 + 0.015, s * ZI, [-1, 0, 0], [0, 0, -s], 0.014]);
  }
  const tow = [];
  for (const s of [-1, 1]) {
    tow.push([D.COLXF, yTop, s * (D.COLZF - 0.015), [0, 0, -s], [0, 1, 0]]);             // columna delantera: escuadra por dentro, abajo
    tow.push([D.COLXF, yBotT, s * (D.COLZF - 0.015), [0, 0, -s], [0, -1, 0]]);            // y arriba
    tow.push([-0.015, D.YT, s * ZI, [-1, 0, 0], [0, 0, -s], 0.014]);           // travesaño superior central con el larguero: por el costado (la pata colgando no agarraba nada)
  }
  const fastOf = e => { const C = V3(e[0], e[1], e[2]), A = V3(...e[3]), B = V3(...e[4]); return [[C.clone().addScaledVector(A, 0.0179), B, A], [C.clone().addScaledVector(B, 0.0179), A, B]]; };   // rev. 3.16: 1 M6 al centro de la ranura de cada pata
  const mk = (id, name, list, own) => addPart(id, 'est', name, b => { for (const e of list) { b.bracket(e[0], e[1], e[2], e[3], e[4], e[5] || 0.02); if (own) for (const f of fastOf(e)) b.fastener(...f); } }, { nest: ['*pf'] });
  ESC_FAST.bot = bot.flatMap(fastOf); ESC_FAST.top = top.flatMap(fastOf);
  mk('esc_b', 'Escuadras de aluminio del marco inferior (10)', bot);
  mk('esc_c', 'Escuadras de aluminio del travesaño central (2)', cen, true);
  mk('esc_t', 'Escuadras de aluminio del marco superior (6)', top);
  mk('esc_tw', 'Escuadras de aluminio de la torre (6)', tow, true);
  // placas de unión planas (impresas): columna con el travesaño, en caras que quedan al mismo plano
  addPart('placas', 'est', 'Placas de unión de la torre (12)', b => {
    b.prt('placas', { lift: [500, D.DH, D.HT - 1.040] });
    for (const k of ['pl_esq_R', 'pl_esq_L']) b.add(meshG(k), 'Pd', 0, D.HT - 1.040, 0, 0, 0, 0, 0.001, 0.001, 0.001);   // rev. 3.34: amarran el travesaño de arriba del frente con los largueros                                     // las 12 placas con sus barrenos M6 (rev. 3.15: las de abajo suben con el marco)
    // rev. 3.13: barrenos centrados en la ranura, 2 tornillos por perfil (prints.py → PLACAS)
    for (const [x, y, z] of [[0.2135, 0.105, 0.103], [0.2135, 0.105, 0.124], [0.2135, 0.137, 0.131], [0.2135, 0.16, 0.131], [0.2135, 1.025, 0.108], [0.2135, 1.025, 0.154], [0.2135, 0.972, 0.131], [0.2135, 0.997, 0.131], [0.0215, 0.105, 0.086], [0.0215, 0.105, 0.114], [0.0215, 0.137, 0.114], [0.0215, 0.16, 0.114], [0.0215, 0.955, 0.068], [0.0215, 0.955, 0.088], [0.0215, 0.962, 0.114], [0.0215, 0.992, 0.114], [0.0215, 1.025, 0.075], [0.0215, 1.025, 0.114], [-0.0215, 0.105, 0.086], [-0.0215, 0.105, 0.114], [-0.0215, 0.137, 0.114], [-0.0215, 0.16, 0.114], [-0.0215, 0.955, 0.068], [-0.0215, 0.955, 0.088], [-0.0215, 0.962, 0.114], [-0.0215, 0.992, 0.114], [-0.0215, 1.025, 0.075], [-0.0215, 1.025, 0.114], [0.2135, 0.105, -0.103], [0.2135, 0.105, -0.124], [0.2135, 0.137, -0.131], [0.2135, 0.16, -0.131], [0.2135, 1.025, -0.108], [0.2135, 1.025, -0.154], [0.2135, 0.972, -0.131], [0.2135, 0.997, -0.131], [0.0215, 0.105, -0.086], [0.0215, 0.105, -0.114], [0.0215, 0.137, -0.114], [0.0215, 0.16, -0.114], [0.0215, 0.955, -0.068], [0.0215, 0.955, -0.088], [0.0215, 0.962, -0.114], [0.0215, 0.992, -0.114], [0.0215, 1.025, -0.075], [0.0215, 1.025, -0.114], [-0.0215, 0.105, -0.086], [-0.0215, 0.105, -0.114], [-0.0215, 0.137, -0.114], [-0.0215, 0.16, -0.114], [-0.0215, 0.955, -0.068], [-0.0215, 0.955, -0.088], [-0.0215, 0.962, -0.114], [-0.0215, 0.992, -0.114], [-0.0215, 1.025, -0.075], [-0.0215, 1.025, -0.114]]) b.cyl(0.005, 0.003, x, y < 0.5 ? y + D.DH : y + D.HT - 1.040, z, 'x', 'steel', 10);
  }, { nest: ['*pf'] });
}

// ============================================================ TUERCAS T DE MARTILLO (drop-in) EN LA RANURA
function nutsPart(id, name, axis, fixed, positions, slotY, from) {
  return addPart(id, 'est', name, b => {
    for (const u of positions) {
      const p = axis === 'x' ? [u, slotY, fixed] : [fixed, slotY, u];
      // tuerca T de martillo (STEP), con el cuello hacia la boca de la ranura, y el tornillo Allen asomando
      const top = slotY > 0.5, map = axis === 'x' ? (top ? ['x', '-y', '-z'] : ['x', 'y', 'z']) : (top ? ['z', '-y', 'x'] : ['z', 'y', '-x']);
      b.stp('tnut', { map, at: [p[0], slotY + (top ? -0.003 : 0.003), p[2]] });
      b.cyl(0.0042, 0.0042, p[0], slotY + 0.0042, p[2], 'y', 'dark', 10);
    }
  }, { from, nest: ['*pf'], noCheck: true });
}
// rev. 3.16: solo las tuercas que sujetan algo: 1 Allen M6 + tuerca T por pata de escuadra (antes, filas sueltas en las ranuras que no sujetaban nada)
{
  const q = (L, fx, fz) => L.filter(([P]) => fx(P.x) && fz(P.z)), pos = v => v >= 0, neg = v => v < 0;
  const part = (id, L) => addPart(id, 'est', 'Tornillos M6 + tuercas T de las escuadras', b => { for (const f of L) b.fastener(...f); }, { from: [0, 0.12, 0], nest: ['*pf'], noCheck: true });
  for (const [k, L] of [['b', ESC_FAST.bot], ['t', ESC_FAST.top]]) { part('nut_' + k + 'F', q(L, pos, neg)); part('nut_' + k + 'R', q(L, pos, pos)); part('nut_' + k + 'L', q(L, neg, neg)); part('nut_' + k + 'B', q(L, neg, pos)); }
}

// ============================================================ RODAJAS (rev. 3.15: Unicame de 4" con freno, de placa)
// Unicame no publica CAD: modelo genérico (rodaja4.py) con la rueda 100 × 31 y la placa 93 × 64 de una equivalente; altura de montaje,
// barrenos (45 × 73), avance (39) y radio de giro (89) supuestos. La placa no cae en la ranura del perfil: va sobre una adaptadora impresa.
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  const id = 'cast_' + (sx > 0 ? 'F' : 'B') + (sz < 0 ? 'L' : 'R');
  const x = sx * D.CX, z = sz * D.CZ;
  const xs = (a, c) => [Math.min(sx * a, sx * c), Math.max(sx * a, sx * c)], zs = (a, c) => [Math.min(sz * a, sz * c), Math.max(sz * a, sz * c)];
  addPart(id, 'trac', 'Rodaja Unicame 4" con freno', b => {
    const n0 = b.items.length, c0 = b.checks.length;
    b.stp('rodaja4', { map: ['x', 'y', 'z'], at: [x, 0, z] });                     // la rueda queda atrás del eje de giro (avanzando)
    { let ym = 0; const nw = b.items.slice(n0); for (const it of nw) { it.geo.computeBoundingBox(); ym = Math.max(ym, it.geo.boundingBox.clone().applyMatrix4(it.m).max.y); }
      const f = D.CH / ym, S = new THREE.Matrix4().makeScale(1, f, 1); for (const it of nw) it.m.premultiply(S);
      for (const c of b.checks.slice(c0)) { c.min.y *= f; c.max.y *= f; } }   // rev. 3.18: rodaja real de 103 mm (piso → cara de la placa)
    // rev. 3.18: sin placa adaptadora; la placa de la rodaja va directo bajo el marco
  }, { nest: ['*pf'] });
}

// ============================================================ SUSPENSIÓN Y MOTORES M0601
for (const s of [-1, 1]) {
  const side = s < 0 ? 'L' : 'R', zp = s * 0.170;
  const zz = (a, c) => [Math.min(s * a, s * c), Math.max(s * a, s * c)];
  addPart('susp_sop_' + side, 'trac', 'Soporte del pivote y su calza', b => {        // rev. 3.26: pieza aparte para armarla por pasos
    b.prt('susp_' + side, { skip: ['#000001'] });                                    // solo el soporte impreso (material Pd de prints_rev311.py)
    b.hex(0.0075, 0.0065, 0, 0.068, s * 0.1535, 'z', 'steel');                       // tuerca M8 metida por abajo en el soporte
    if (D.DH > 0.001) b.bb(-0.015, 0.015, 0.090, D.H0, ...zz(0.128, 0.170), 'Pd');  // calza de 13 mm bajo el travesaño central
  }, { nest: ['*pf', 'susp_' + side, 'susp_piv_' + side] });
  addPart('susp_' + side, 'trac', 'Placa pivotante', b => {
    b.prt('susp_' + side, { skip: ['#000002'] });     // placa (maza de 2 × 608ZZ, 3 × M2.5 del M0601, paso del cable, pestaña)
    for (const zb of [0.1695, 0.1781]) b.cyl(0.011, 0.007, 0, 0.068, s * zb, 'z', 'steel', 18);   // 2 × 608ZZ con rondana entre ellos
    for (const [dx, dy] of [[0, -0.0076], [-0.00658, 0.0038], [0.00658, 0.0038]]) b.cyl(0.0025, 0.4e-3, D.WX + dx, D.WR + dy, s * 0.1738, 'z', 'steel', 10);   // 3 × M2.5 × 12 de cabeza plana, al ras
  }, { nest: ['*pf', 'mot_' + side, 'spring_' + side, 'susp_sop_' + side, 'susp_piv_' + side, 'susp_guia_' + side] });
  addPart('susp_piv_' + side, 'trac', 'Perno de pivote M8 × 40', b => {
    b.cyl(0.004, 0.040, 0, 0.068, s * 0.1632, 'z', 'steel', 10);
    b.hex(0.0075, 0.0055, 0, 0.068, s * 0.18595, 'z', 'steel');
    for (const zw of [0.1824, 0.1652]) b.cyl(0.008, 0.0016, 0, 0.068, s * zw, 'z', 'steel', 18);   // rondanas M8: afuera y entre placa y soporte
  }, { nest: ['susp_' + side, 'susp_sop_' + side] });
  addPart('susp_guia_' + side, 'trac', 'Calza del resorte y tornillo guía M8', b => {
    b.hex(0.0075, 0.006, D.WX, 0.0315, s * 0.185, 'y', 'steel');                    // tuerca de precarga
    b.cyl(0.0115, 0.0095, D.WX, 0.04525, s * 0.185, 'y', 'Pd', 24); b.cyl(0.0087, 0.004, D.WX, 0.052, s * 0.185, 'y', 'Pd', 24);   // rev. 3.35: asiento de abajo (9.5 mm + resalte)
    b.cyl(0.0115, 0.002, D.WX, 0.089, s * 0.185, 'y', 'Pd', 24); b.cyl(0.0087, 0.004, D.WX, 0.086, s * 0.185, 'y', 'Pd', 24);       // asiento de arriba (2 mm + resalte)
    b.cyl(0.004, D.H0 + 0.006 - 0.026, D.WX, (0.026 + D.H0 + 0.006) / 2, s * 0.185, 'y', 'steel', 10);   // tornillo guía M8 × 90 (entra 6 mm en la ranura del larguero)
    if (D.DH > 0.001) b.bb(D.WX - 0.015, D.WX + 0.015, 0.090, D.H0, ...zz(0.170, 0.200), 'Pd');   // calza de 13 mm del asiento del resorte
  }, { nest: ['*pf', 'susp_' + side, 'spring_' + side] });
  const coil = [];
  for (let i = 0; i <= 260; i++) { const a = i / 260 * Math.PI * 2 * 11.5; coil.push([D.WX + 0.01008 * Math.cos(a), 0.051 + i / 260 * 0.036, s * 0.185 + 0.01008 * Math.sin(a)]); }   // rev. 3.35: XCOM076, 12 vueltas, instalado en 38 mm
  addPart('spring_' + side, 'trac', 'Resorte XCOM076 (Ø22.2, alambre 2.03, 76 mm libre)', b => b.tube(coil, 0.001015, 'steel', 360), { pivot: [D.WX, 0.050, s * 0.185], mount: 'spring', nest: ['susp_' + side, 'susp_guia_' + side], shadow: false });
  addPart('mot_' + side, 'trac', s < 0 ? 'M0601 izquierdo' : 'M0601 derecho', b => {
    // STEP oficial del Waveshare DDSM115 (es el mismo motor que el M0601). Su eje es la y del STEP; la cara de montaje
    // (buje Ø19 con 3 × M2.5 a 120° en Ø15.2, 7.5 mm de profundidad) está en y = +10 mm y se apoya en la placa pivotante.
    // Se gira para que la ranura del cable quede hacia arriba en los 2 lados.
    b.stpAt('m0601', stpBasis(s > 0 ? ['x', 'z', '-y'] : ['-x', '-z', '-y']), V3(D.WX, D.WR, s * (D.MOTF - 0.010)),
      { col: { '#000011': '#59606a', '#000012': 'rubber', '#000013': '#2b2f35', '#000014': 'steel' } });
  }, { pivot: [D.WX, D.WR, s * D.WZ], mount: 'wheel', nest: ['susp_' + side] });
}

// ============================================================ BATERÍA
{
  const { l, w, h } = D.BAT, y0 = 0.126;
  addPart('bat_cradle', 'elec', 'Cuna de la batería', b => {
    b.prt('cradle');                                                           // rev. 3.48b: regresa la cuna acostada de la rev. 3.6 (190 × 194 en escalera sobre el travesaño central, topes y ranuras de la correa)
  }, { nest: ['*pf'] });
  addPart('bat', 'elec', 'Batería BR-1224 (12 V 24 Ah, 16.6 × 17.5 × 12.5 cm)', b => {
    b.bb(-l / 2, l / 2, y0, y0 + h, -w / 2, w / 2, 'bat');
    b.bb(-l / 2 + 0.004, l / 2 - 0.004, y0 + h, y0 + h + 0.003, -w / 2 + 0.004, w / 2 - 0.004, 'dark');
    b.bb(-l / 2 - 0.0005, -l / 2, y0 + 0.03, y0 + 0.07, -0.06, 0.06, 'green');
    for (const [z, m] of [[0.055, 'red'], [-0.055, 'black']]) {        // rev. 3.32: lengüeta faston de 6.3 mm sobre su base (la batería trae faston)
      b.cyl(0.0055, 0.004, -0.060, y0 + h + 0.005, z, 'y', m, 14);              // rev. 3.48b: bornes arriba, hacia atrás (la bandeja)
      b.bb(-0.060 - 0.00315, -0.060 + 0.00315, y0 + h + 0.007, y0 + h + 0.0155, z - 0.0004, z + 0.0004, 'steel');
    }
  });
  addPart('bat_hold', 'elec', 'Correa con hebilla', b => {
    const yt = y0 + h, x1 = l / 2 + 0.0015, t = 0.0015, wz = 0.0125;
    b.bb(-x1, x1, yt, yt + t, -wz, wz, 'strap');                                   // arriba
    for (const s of [-1, 1]) {
      b.bb(Math.min(s * (x1 - t), s * x1), Math.max(s * (x1 - t), s * x1), 0.118, yt + t, -wz, wz, 'strap');   // costados (pasan por la cuna)
      const xa = s * x1, xb = s * 0.017, ya = 0.118, yb = 0.0875;
      const len = Math.hypot(xa - xb, ya - yb), ang = Math.atan2(ya - yb, xa - xb);
      b.box(len, t, 2 * wz, (xa + xb) / 2, (ya + yb) / 2, 0, 'strap', 0, 0, ang);   // baja en diagonal al travesaño central
    }
    b.bb(-0.018, 0.018, 0.086, 0.0875, -wz, wz, 'strap');                           // por debajo del travesaño central
    b.bb(0.020, 0.048, yt + t, yt + t + 0.008, -0.016, 0.016, 'black');             // hebilla
  }, { nest: ['bat_cradle', 'bat', '*pf'], noCheck: true });
}

// tornillos de las guías: 3 tramos (caben en la cama), 2 por tramo
const guideYs = (y0, y1, e) => { const L = (y1 - y0) / 3, o = []; for (let i = 0; i < 3; i++) o.push(y0 + i * L + e, y0 + (i + 1) * L - e); return o; };
// ============================================================ TORRE: GUÍAS (rev. 3.4: tocan los postes del fixture en las esquinas)
{
  const { COLX0, COLX1, COLZ, GL, GLF, GT, GB } = D;
  for (const front of [false, true]) for (const s of [-1, 1]) {
    const id = 'guide_' + (front ? 'F' : 'B') + (s < 0 ? 'L' : 'R');
    const top = front ? D.GTF : D.GTB;
    const gl = GLF;                                                         // ala lateral de 8 mm: solo toca el poste (más adentro va la ECU y el piso se abre)
    const xp = front ? [COLX1, COLX1 + GT] : [COLX0 - GT, COLX0];          // ala en el plano frontal/trasero
    const xs = front ? [COLX1 - gl, COLX1] : [COLX0, COLX0 + gl];           // ala en el plano lateral
    const zc = (a, c) => [Math.min(s * a, s * c), Math.max(s * a, s * c)];
    addPart(id, 'torre', 'Guía en L', b => {
      b.prt(id);                                                               // guía con sus barrenos M6 (holes/prints.py)
      if (!front) {                                                            // pestaña atornillada a la cara frontal de la columna trasera
        for (const y of guideYs(GB, top, 0.035)) b.cyl(0.005, 0.003, COLX0 + 0.0015, y, s * 0.114, 'x', 'steel', 10);
      } else {                                                                 // pestaña hasta la cara interior de la columna delantera (z ±0.114)
        const zi = D.COLZF - 0.015;
        for (const y of guideYs(GB, top, 0.030)) b.cyl(0.0045, 0.0012, COLX1 - 0.008, y, s * (zi - 0.0034), 'z', 'steel', 10);   // cabeza avellanada, dentro del avellanado
      }
    }, { nest: front ? ['col_F' + (s < 0 ? 'L' : 'R')] : ['col_B' + (s < 0 ? 'L' : 'R')] });
  }
}

// Palanca del final de carrera DM1 (rev. 3.41; antes, el de rueda): pieza aparte que gira sobre su bisagra cuando la pisan.
// kind 'E': la pisa el brazo de la plataforma; 'U': la cara de arriba del brazo; 'P': el travesaño del carro (rampa de 3 mm).
function lswLever(id, name, sub, o, kind, nest) {
  const p = addPart(id, sub, name, b => b.stp('dm1_lever', o), { mount: 'lsw', nest });
  const R = stpBasis(o.map || ['x', 'y', 'z']), t = V3(...o.at).add(V3(0, shiftOf(id, sub), 0)), mm = v => V3(...v).multiplyScalar(0.001).applyMatrix4(R).add(t);
  const tip = mm([9.55, 15.440000000000001, 15.1]);                                                     // cara de arriba de la punta de la palanca (FP 10.4)
  p.lsw = { kind, axis: V3(0, 0, 1).applyMatrix4(R).normalize(), piv: mm([-3.25, 12.44, 15.1]), rx: tip.x, y0: tip.y, ux: V3(1, 0, 0).applyMatrix4(R).x, arm: 0.01315, dmax: 0.0025 };
  // puntos de la punta (x, y del carrito) para calcular cuánto gira la palanca al pisarla
  p.lsw.pts = [];
  for (const it of p.items) { const pos = it.geo.attributes.position, v = V3(); for (let i = 0; i < pos.count; i += 1) { v.fromBufferAttribute(pos, i).applyMatrix4(it.m); if (Math.abs(v.x - tip.x) < 0.002 && Math.abs(v.y - tip.y) < 0.002) p.lsw.pts.push([v.x, v.y]); } }
  return p;
}
// ============================================================ ELEVADOR (2 lados)
// rev. 3.8: 1.5 mm más arriba → en home (plataforma a 38.35 cm) el brazo pisa la rueda 1.5 mm (lo que necesita para hacer clic)
const LSW_E = { R: { map: ['x', 'y', 'z'], at: [0.17545, 0.36666, 0.165] }, L: { map: ['-x', 'y', '-z'], at: [0.19055, 0.36666, -0.165] } };
for (const s of [-1, 1]) {
  const side = s < 0 ? 'L' : 'R', zs = s * D.SZ, zr = s * D.RZ, x = D.SX;
  const zr2 = (a, b) => [Math.min(s * a, s * b), Math.max(s * a, s * b)];
  addPart('brk_lo_' + side, 'torre', 'Soporte inferior (NEMA + KFL08)', b => {
    b.prt('brk_lo_' + side);                                                // repisas del NEMA (Ø22.4 + 4 × M3) y de la KFL08 (2 × M5), varilla Ø8
    for (const y of [0.250, 0.296]) for (const zz of [0.131, 0.185]) b.cyl(0.005, 0.003, 0.2125, y, s * zz, 'x', 'steel', 10);   // a columna y poste
  }, { nest: ['*pf', 'nema_' + side, 'rod_' + side, 'lsw_' + side, 'screw_' + side] });
  addPart('nema_' + side, 'torre', 'NEMA 17 del elevador', b => {
    b.stp('nema', { map: s > 0 ? ['x', '-z', 'y'] : ['-x', 'z', 'y'], at: [x, 0.2375, zs] });   // cara contra la repisa; conector hacia afuera
  }, { nest: ['brk_lo_' + side, 'cople_' + side] });
  addPart('cople_' + side, 'torre', 'Cople flexible 5 → 8 mm', b => {
    b.stp('cople', { at: [x, 0.2995, zs] });
  }, { nest: ['nema_' + side, 'screw_' + side] });
  addPart('kflLo_' + side, 'torre', 'KFL08 inferior', b => {
    b.stp('kfl08', { map: ['z', 'y', '-x'], at: [x, 0.318, zs] });
  }, { nest: ['screw_' + side, 'brk_lo_' + side] });
  addPart('screw_' + side, 'torre', 'Husillo TR8 de 60 cm', b => {
    b.cyl(0.004, 0.600, x, 0.600, zs, 'y', 'steel', 14);
    b.bb(x + 0.0032, x + 0.0046, 0.302, 0.898, zs - 0.0008, zs + 0.0008, 'black');   // franja para ver el giro
  }, { pivot: [x, 0.6, zs], mount: 'screw', nest: ['*', 'plat'] });
  addPart('rod_' + side, 'torre', 'Varilla lisa 8 mm × 60 cm', b => b.cyl(0.004, 0.600, x, 0.600, zr, 'y', 'steel', 14),
    { nest: ['brk_lo_' + side, 'brk_up_' + side, 'sc_' + side] });
  addPart('kflUp_' + side, 'torre', 'KFL08 superior', b => {
    b.stp('kfl08', { map: ['z', '-y', 'x'], at: [x, 0.884, zs] });          // de cabeza: la brida arriba, contra el soporte
  }, { nest: ['screw_' + side, 'brk_up_' + side] });
  addPart('brk_up_' + side, 'torre', 'Soporte superior (KFL08)', b => {
    b.prt('brk_up_' + side);
    for (const y of [0.900, 0.940]) for (const zz of [0.131, 0.185]) b.cyl(0.005, 0.003, 0.2125, y, s * zz, 'x', 'steel', 10);
  }, { nest: ['*pf', 'rod_' + side, 'screw_' + side, 'kflUp_' + side] });
  addPart('lsw_' + side, 'torre', 'Final de carrera inferior', b => {
    // rev. 3.41: DM1 sobre su adaptador impreso (atornillado a la pestaña del soporte); el brazo de la plataforma pisa la palanca al bajar
    b.stp('dm1', LSW_E[side]);
  }, { nest: ['brk_lo_' + side] });
  lswLever('lswlev_' + side, 'Palanca del final de carrera', 'torre', LSW_E[side], 'E', ['lsw_' + side]);
  PARTS.get('lsw_' + side).companions = ['lswlev_' + side];
  // en la plataforma (se mueven con ella)
  const T = D.LOAD0;
  addPart('nutsc_' + side, 'torre', 'Tuerca de latón', b => {
    b.stp('t8nut', { map: ['x', '-y', '-z'], at: [x, T - 0.012, zs] });        // brida contra el brazo, cuello hacia abajo
  }, { mount: 'plat', nest: ['screw_' + side, 'plat'] });
  addPart('sc_' + side, 'torre', 'SC8UU ×2', b => {
    for (const yc of [T + 0.015, T - 0.027])                                 // cara de montaje (4 barrenos) hacia −x
      b.stp('sc8uu', { map: ['z', '-x', '-y'], at: [x + 0.011, yc, zr] });
  }, { mount: 'plat', nest: ['rod_' + side, 'plat'] });
}
// rev. 3.17c: final de carrera superior (solo derecho), de cabeza en la pestaña del soporte superior.
// La cara de arriba del brazo toca la rueda a 83.0 cm y lo abre a 83.15 cm (tope); el trabajo máximo es 82.35 cm.
const LSW_U = { map: ['-x', '-y', 'z'], at: [0.19055, 0.85334, 0.165] };
addPart('lswUp', 'torre', 'Final de carrera superior (tope)', b => b.stp('dm1', LSW_U), { nest: ['brk_up_R'] });
lswLever('lswlevUp', 'Palanca del final superior', 'torre', LSW_U, 'U', ['lswUp']);
PARTS.get('lswUp').companions = ['lswlevUp'];
// plataforma con 2 brazos y nervaduras
addPart('plat', 'torre', 'Plataforma', b => {
  b.prt('plat');                                    // con pasos de varilla y husillo, 4 × M3 de cada tuerca T8 y placas de los SC8UU (4 × M4 c/u)
}, { mount: 'plat', nest: ['nutsc_L', 'nutsc_R', 'sc_L', 'sc_R', 'screw_L', 'screw_R', 'rod_L', 'rod_R'] });

// ============================================================ EMPUJADOR
const PP = D.P0;     // modelado en home
addPart('prod_L', 'emp', 'Varilla 8 mm × 30 cm', b => b.cyl(0.004, 0.300, -0.134, D.RODY, -D.RODZ, 'x', 'steel', 12), { nest: ['pframe', 'pframe_r', 'sled'] });
addPart('prod_R', 'emp', 'Varilla 8 mm × 30 cm', b => b.cyl(0.004, 0.300, -0.134, D.RODY, D.RODZ, 'x', 'steel', 12), { nest: ['pframe', 'pframe_r', 'sled'] });
addPart('pframe', 'emp', 'Soportes delanteros y del NEMA', b => {
  b.prt('pframe');                                  // varillas Ø8, NEMA (Ø22.4 + 4 × M3) y 2 × M6 al travesaño
}, { nest: ['pnema', 'prod_L', 'prod_R', '*pf'] });
const LSW_P = { map: ['x', '-y', '-z'], at: [-0.28005, 0.90384, 0.075] };
addPart('pframe_r', 'emp', 'Soporte trasero y final de carrera', b => {
  b.prt('pframe_r');
  // final de carrera de home (rev. 3.41: DM1 en su adaptador): palanca hacia abajo; la rampa del travesaño del carro la sube al llegar a home
  b.stp('dm1', LSW_P);
}, { nest: ['*pf', 'prod_L', 'prod_R'] });
lswLever('lswlev_P', 'Palanca del final de home', 'emp', LSW_P, 'P', ['pframe_r']);
PARTS.get('pframe_r').companions = ['lswlev_P'];
addPart('sled', 'emp', 'Carro, placa y cremallera', b => {
  b.prt('sled');                                     // placa de empuje, soporte del MG90S con la oreja del perno, cremallera m1.5 en 2 tramos, travesaño con 2 × 4 M4
  for (const s of [-1, 1])                                                   // SC8UU: varilla a lo largo de x, cara de montaje arriba
    b.stp('sc8uu', { map: ['z', 'y', '-x'], at: [PP - 0.268, D.RODY - 0.011, s * D.RODZ] });
  // rev. 3.41: perno impreso de la cremallera (rev. 3.38) en lugar de la varilla roscada M3: Ø3 × 127 con cabeza y tapón pegado
  b.cyl(0.0015, 0.127, PP - 0.268, 0.889, 0.0015, 'z', 'P', 12);
  b.bb(PP - 0.268 - 0.00325, PP - 0.268 + 0.00325, 0.889 - 0.0013, 0.889 + 0.004, -0.064, -0.062, 'P');
  b.bb(PP - 0.268 - 0.00325, PP - 0.268 + 0.00325, 0.889 - 0.00325, 0.889 + 0.00325, 0.062, 0.0662, 'P');
}, { mount: 'push', nest: ['prod_L', 'prod_R', 'pin', 'servo'] });
addPart('pinion', 'emp', 'Piñón m1.5 · 20 dientes', b => {
  b.prt('pinion');                                   // involuta 20°, flecha D de 5 mm con prisionero M3 (holes/prints.py)
}, { pivot: [-0.017, 0.913, 0], mount: 'pinion', nest: ['pnema'] });   // la flecha del NEMA entra en el piñón
addPart('pnema', 'emp', 'NEMA 17 del empujador', b => {
  b.stp('nema', { map: ['y', 'x', '-z'], at: [-0.017, 0.913, 0.0475] });    // cara contra la placa, flecha hacia −z (al piñón), conector hacia atrás
}, { nest: ['pframe', 'pinion'] });
// Uña abatible (rev. 3.8): el MG90S acostado con la flecha hacia el frente; el dedo gira en el plano y–z.
const CLAW_AT = [PP + 0.0073, D.CLAWY, D.CLAWZ];
addPart('servo', 'emp', 'Microservo MG90S', b => {
  b.stp('mg90s', { map: ['-y', '-z', 'x'], at: CLAW_AT });                    // orejas contra la pared del soporte; cable hacia abajo
}, { mount: 'push', nest: ['sled'] });
addPart('horn', 'emp', 'Brazo del servo', b => {
  b.stp('mg90s_horn', { map: ['-y', '-z', 'x'], at: CLAW_AT });               // el brazo que trae el MG90S, con su tornillo
}, { pivot: [CLAW_AT[0], D.CLAWY, D.CLAWZ], mount: 'horn', nest: ['servo', 'pin'] });
addPart('pin', 'emp', 'Uña (dedo abatible)', b => {
  b.prt('una');                                      // atornillada al brazo con 2 × M2; al frente gira en un perno M3 en la oreja del soporte
  b.cyl(0.0028, 0.0025, PP + 0.02225, D.CLAWY, D.CLAWZ, 'x', 'steel', 14);     // cabeza del perno M3 (por fuera de la oreja)
}, { pivot: [CLAW_AT[0], D.CLAWY, D.CLAWZ], mount: 'pin', nest: ['sled', 'horn'] });   // el perno pasa por la oreja del soporte

// rev. 3.21: mallas de las piezas impresas sacadas de CadQuery (calza_empujador.py, fixture_v4.py)
const MESH = window.__AE_MESH;   // data/mesh.js
function meshG(k) {                                  // rev. 3.36: como meshGeo, pero usable desde cualquier parte del módulo
  const C = window.__AE_MG || (window.__AE_MG = new Map()); if (C.has(k)) return C.get(k);
  const m = window.__AE_MESH[k], b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;
  const q = new Int16Array(b64(m.p)), p = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) p[i] = q[i] / 100 + m.o[i % 3];
  let g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  g.setIndex(new THREE.BufferAttribute(m.i32 ? new Uint32Array(b64(m.i)) : new Uint16Array(b64(m.i)), 1));
  g = g.toNonIndexed(); g.computeVertexNormals(); g.computeBoundingBox(); C.set(k, g); return g;
}
const meshGeo = k => cachedGeo('mesh_' + k, () => {
  const m = MESH[k], b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;
  const q = new Int16Array(b64(m.p)), p = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) p[i] = q[i] / 100 + m.o[i % 3];
  let g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  g.setIndex(new THREE.BufferAttribute(m.i32 ? new Uint32Array(b64(m.i)) : new Uint16Array(b64(m.i)), 1));
  g = g.toNonIndexed(); g.computeVertexNormals(); g.computeBoundingBox(); return g;
});
// rev. 3.18: calzas impresas de 19.5 mm entre el travesaño del empujador y sus soportes delanteros (aún sin imprimir): el travesaño
// lo fija la placa impresa y queda 19.5 mm más arriba que en el diseño respecto a la cinta.
{
  const pts = []; let ymax = -1;
  for (const it of PARTS.get('pframe').items) { const pos = it.geo.attributes.position, v = V3(); for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(it.m); pts.push(v.clone()); ymax = Math.max(ymax, v.y); } }
  const top = pts.filter(v => v.y > ymax - 0.0005);
  addPart('calza_empF', 'emp', 'Calzas de 19.5 mm de los soportes delanteros', b => {
    for (const sg of [-1, 1]) {
      const g = top.filter(v => (v.z >= 0 ? 1 : -1) === sg); if (!g.length) continue;
      const xs = g.map(v => v.x), zs = g.map(v => v.z);       // la huella de prints.py tiene x ±15 y z hasta ±50 mm: de ahí sale el corrimiento
      const ox = Math.max(...xs) - 0.015, oz = sg > 0 ? Math.max(...zs) - 0.076 : Math.min(...zs) + 0.050;   // rev. 3.25: la pestaña derecha llega a z 76
      b.add(meshGeo(sg > 0 ? 'calza_der' : 'calza_izq'), 'P', ox, ymax - 0.940, oz, 0, 0, 0, 0.001, 0.001, 0.001);
    }
  }, { nest: ['pframe', '*pf'] });
  PARTS.get('pframe').companions = ['calza_empF'];
}
for (const k of ['BELT', 'WIN0', 'WIN1', 'LOAD0', 'UNL0', 'LSLO', 'LSHI', 'GB', 'GTB', 'GTF', 'PY0', 'PY1', 'CLAWY', 'RODY', 'RACKY']) D[k] = +(D[k] - 0.0085).toFixed(4);

// ============================================================ FIXTURES (6) — origen en el centro de la base
function qrTexture(n) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#111';
  let s = n * 9301 + 49297; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if (i < 2 && j < 2 || i > 5 && j < 2 || i < 2 && j > 5 || r() > 0.55) g.fillRect(4 + i * 7, 4 + j * 7, 7, 7);
  g.fillStyle = '#0d9488'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.fillText(String(n), 32, 41);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const FIXTURES = [];
// Fixture del 16-oct (FIXTURE_ECU_QUILLA.md), en mm desde el centro de la base; las ECU con cajas de sus medidas reales
const FXM = (b, x0, x1, y0, y1, z0, z1, c) => b.bb(x0 / 1000, x1 / 1000, y0 / 1000, y1 / 1000, z0 / 1000, z1 / 1000, c);
const FXH = 106.45;
function fixtureBody(b, maxx) {                                               // v4.1 (3-nov): mallas de fixture_v4.py, mismo origen
  b.add(meshGeo(maxx ? 'piso_maxx' : 'piso_siemens'), 'P', 0, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001);
  b.add(meshGeo('bastidor'), 'Pd', 0, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001);
  b.add(meshGeo('bastidor'), 'Pd', 0, 0, 0, 0, Math.PI, 0, 0.001, 0.001, 0.001);
}
function ecuBMW(b, c) {                                                      // Siemens VDO: centro en x 6.45, z 1; fondo a 10 mm
  const X = 6.45, Z = 1;
  FXM(b, X - 77.85, X + 77.85, 10, 14.9, Z - 77.85, Z + 77.85, c);
  FXM(b, X - 90.47, X + 90.47, 14.9, 20.9, Z - 85.71, Z + 85.71, c);
  FXM(b, X - 75, X + 75, 20.9, 50, Z - 78, Z + 72, c);
  FXM(b, X - 60, X + 60, 50, 65.7, Z - 38, Z + 67, c);
  FXM(b, X - 77.26, X + 77.26, 16, 50, Z - 112.52, Z - 85.71, 'black');      // conector hacia un costado
}
function ecuMaxx(b, c) {                                                     // MaxxECU girada 90°: conectores hacia +x; fondo a 13.5 mm
  FXM(b, -82.05, 74.12, 13.5, 21.5, -84.5, 84.5, c);
  FXM(b, -82.05, 74.12, 21.5, 42.1, -76, 76, c);
  FXM(b, 28.6, 74.12, 42.1, 52.5, -70, 76, c);
  FXM(b, 74.12, 96.87, 20, 47.5, -75, 61, 'black');
  for (const ex of [-57.05, 49.12]) for (const s of [-1, 1]) FXM(b, ex - 6, ex + 6, 13.5, 21.5, ...(s < 0 ? [-96.5, -84.5] : [84.5, 96.5]), c);
}
for (let i = 0; i < 6; i++) {
  const p = addPart('fx' + i, 'fix', `Fixture ${i + 1} con ${i % 2 ? 'MaxxECU' : 'Siemens VDO'}`, b => {
    fixtureBody(b, i % 2);
    if (i % 2) ecuMaxx(b, 'dark'); else ecuBMW(b, 'ecu');
  }, { pivot: [0, 0, 0], mount: 'fx' });
  p.fixIndex = i; FIXTURES.push(p);
}

// ============================================================ ELECTRÓNICA: BANDEJA (se arma en la mesa, Etapa 11)
const TRAY = { x0: -0.245, x1: -0.112, z: 0.13, y: 0.132 };
const TY = TRAY.y + 0.006;   // altura de los separadores M3
addPart('tray', 'elec', 'Bandeja de electrónica', b => {
  b.prt('tray');                                                                            // rev. 3.36: solo el trozo B (elevador y relé); el A es el porta-placa
  b.add(meshG('tray_a335'), 'P', 0, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001);                  // rev. 3.30b: trozo A con porta-placa (ganchos atrás, broches al frente, 28 mm bajo la placa)
  b.add(meshG('tray_calza'), 'Pd', 0, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001);                // rev. 3.37: calza-escuadra (pata en la cara del frente del travesaño, 2 M6 más)
  for (const [x, z] of [[-0.1231, -0.110], [-0.1391, -0.080]]) b.cyl(0.0025, 0.006, x, TRAY.y + 0.003, z, 'y', 'white', 8);   // separadores del XL4005
}, { nest: ['*pf', 'bat_cradle'] });

// ============================================================ PLACA PRINCIPAL (placa perforada 9 × 15 cm)
// Coordenadas de la placa en mm: u = desde la orilla trasera (hacia el frente del carrito, eje x),
// v = desde la orilla izquierda (hacia la derecha, eje z). Acomodo propuesto: ver Supuestos.
const BRD = { x0: -0.242, z0: -0.125, y: TY + 0.0016 + 0.022, U: 90, V: 150 };   // rev. 3.36: en el porta-placa, 28 mm sobre la bandeja (antes 6 mm de separadores)
const bx = u => BRD.x0 + u / 1000, bz = v => BRD.z0 + v / 1000;
const SOCK = 0.0085, MOD0 = BRD.y + 0.011;          // alto del header hembra · cara inferior de los módulos
const PIN = {};                                      // clave → { part, name, where, u, v, pos }
function pin(key, part, name, u, v, where) { PIN[key] = { key, part, name, where, u, v, pos: V3(bx(u), BRD.y, bz(v)) }; }
const COLOR_NAME = { cRed: 'rojo', cBlk: 'negro', cOra: 'naranja', cPnk: 'rosa', cGrn: 'verde', cBlu: 'azul', cBrn: 'café', cGry: 'gris', cTeal: 'turquesa',
  cYel: 'amarillo', cWht: 'blanco', cPur: 'morado', cLbl: 'celeste', cLim: 'verde limón', cOli: 'verde olivo', cMag: 'magenta', cBei: 'beige', cTin: 'alambre desnudo' };

// ---------- mapa de pines
const ESP_L = ['3V3', 'EN', '36', '39', '34', '35', '32', '33', '25', '26', '27', '14', '12', 'GND', '13', 'SD2', 'SD3', 'CMD', '5V'];
const ESP_R = ['GND', '23', '22', 'TX', 'RX', '21', 'GND', '19', '18', '5', '17', '16', '4', '0', '2', '15', 'SD1', 'SD0', 'CLK'];
const espV = k => 53.3 - 2.54 * k;
const gpioName = n => /^\d+$/.test(n) ? 'GPIO ' + n : n;
ESP_L.forEach((n, k) => pin(n === 'GND' ? 'E.GNDL' : 'E.' + n, 'esp32', 'ESP32 · ' + gpioName(n), 31.3, espV(k), `fila del lado de los A4988, pin ${19 - k} contando desde el USB`));
ESP_R.forEach((n, k) => pin(n === 'GND' ? (k === 0 ? 'E.GND1' : 'E.GND2') : 'E.' + n, 'esp32', 'ESP32 · ' + gpioName(n), 56.7, espV(k), `fila del lado del MAX485, pin ${19 - k} contando desde el USB`));
const DRV = [{ id: 'drv1', n: 1, vc: 14, mot: 'J7', who: 'elevador izquierdo' }, { id: 'drv2', n: 2, vc: 42, mot: 'J8', who: 'elevador derecho' }, { id: 'drv3', n: 3, vc: 70, mot: 'J9', who: 'empujador' }];
const A_POW = ['VMOT', 'PGND', '2B', '2A', '1A', '1B', 'VDD', 'LGND'], A_LOG = ['EN', 'MS1', 'MS2', 'MS3', 'RST', 'SLP', 'STEP', 'DIR'];
const A_NICE = { PGND: 'GND (junto a VMOT)', LGND: 'GND (junto a VDD)', RST: 'RESET', SLP: 'SLEEP', EN: 'ENABLE' };
for (const d of DRV) {
  A_POW.forEach((n, k) => pin(`A${d.n}.${n}`, d.id, `A4988 #${d.n} · ${A_NICE[n] || n}`, 12, d.vc + 8.89 - 2.54 * k, `fila de potencia (VMOT … GND), pin ${k + 1} desde VMOT`));
  A_LOG.forEach((n, k) => pin(`A${d.n}.${n}`, d.id, `A4988 #${d.n} · ${A_NICE[n] || n}`, 24.7, d.vc + 8.89 - 2.54 * k, `fila de lógica (ENABLE … DIR), pin ${k + 1} desde ENABLE`));
  pin(`C${d.n}.+`, 'cap' + d.n, `100 µF #${d.n} · pata + (larga)`, 4.6, d.vc + 12.75, 'pata larga, del lado contrario a la franja');
  pin(`C${d.n}.-`, 'cap' + d.n, `100 µF #${d.n} · pata − (franja)`, 4.6, d.vc + 15.25, 'pata corta, del lado de la franja');
  ['2B', '2A', '1A', '1B'].forEach((n, j) => pin(`${d.mot}.${n}`, d.mot, `${d.mot} · ${n}`, 4.6, d.vc + 7.62 - 5.08 * j, `bornera del motor del ${d.who}, terminal ${j + 1} (${n})`));
}
['LV1', 'LV2', 'LV', 'GND', 'LV3', 'LV4'].forEach((n, k) => pin('L.' + (n === 'GND' ? 'GNDL' : n), 'lvl', 'Convertidor · ' + n, 63.6 + 2.54 * k, 5.3, 'fila LV (lado de 3.3 V)'));
['HV1', 'HV2', 'HV', 'GND', 'HV3', 'HV4'].forEach((n, k) => pin('L.' + (n === 'GND' ? 'GNDH' : n), 'lvl', 'Convertidor · ' + n, 63.6 + 2.54 * k, 18.0, 'fila HV (lado de 5 V)'));
['RO', 'RE', 'DE', 'DI'].forEach((n, k) => pin('M.' + n, 'max485', 'MAX485 · ' + n, 65.2 + 2.54 * k, 40, 'header de señales (RO RE DE DI)'));
['VCC', 'B', 'A', 'GND'].forEach((n, k) => pin('M.' + n, 'max485', 'MAX485 · ' + n, 65.2 + 2.54 * k, 80, 'header del bus (VCC B A GND)'));
// BNO055 + BMP280 de UNIT DevLab: 2 filas de 5 a 15.24 mm (hoja de medidas de UNIT). Fila de configuración en v = 120, fila de I²C en v = 135.24
['PS0', 'PS1', 'BOOT', 'GND', 'VIN'].forEach((n, k) => pin('B.' + n, 'bno', 'BNO055 · ' + (n === 'VIN' ? 'VCC' : n), 35.1 + 2.54 * k, 120, 'fila VCC · GND · BOOT · PS1 · PS0 (la del LED de encendido)'));
['SDA', 'SCL', 'INT', 'RST', 'BLIND'].forEach((n, k) => pin('B.' + n, 'bno', 'BNO055 · ' + (n === 'BLIND' ? 'BL-IND' : n), 35.1 + 2.54 * k, 135.24, 'fila BL-IND · RST · INT · SCL · SDA'));
const PASS = [
  { id: 'r_en', key: 'REN', name: 'R 10 kΩ', a: [33, 62], b: [43.16, 62], bands: ['bBrn', 'bBlk', 'bOra'] },
  { id: 'r_div1', key: 'R1', name: 'R 100 kΩ', a: [33, 67], b: [43.16, 67], bands: ['bBrn', 'bBlk', 'bYel'] },
  { id: 'r_div2', key: 'R2', name: 'R 20 kΩ', a: [45.7, 67], b: [55.86, 67], bands: ['bRed', 'bBlk', 'bOra'] },
  { id: 'c_div', key: 'CD', name: 'C 100 nF', a: [45.7, 72], b: [50.78, 72], cer: true },
  { id: 'r_fc4', key: 'R5', name: 'R 10 kΩ (FC4)', a: [33, 77], b: [43.16, 77], bands: ['bBrn', 'bBlk', 'bOra'] },
  { id: 'r_paro1', key: 'R3', name: 'R 100 kΩ (paro)', a: [33, 82], b: [43.16, 82], bands: ['bBrn', 'bBlk', 'bYel'] },
  { id: 'r_paro2', key: 'R4', name: 'R 20 kΩ (paro)', a: [45.7, 82], b: [55.86, 82], bands: ['bRed', 'bBlk', 'bOra'] },
  { id: 'c_paro', key: 'C2', name: 'C 100 nF (paro)', a: [45.7, 87], b: [50.78, 87], cer: true },
];
for (const r of PASS) { pin(r.key + '.a', r.id, `${r.name} · pata 1`, ...r.a, 'una pata'); pin(r.key + '.b', r.id, `${r.name} · pata 2`, ...r.b, 'la otra pata'); }
const TERMS = [   // borneras KF301 y headers: [id, u, v0, [nombres], nombre]
  ['J1', 4.6, 133.5, ['+12V', 'GND'], 'J1 · 12 V de motores'],
  ['J2', 85.4, 4.5, ['+5V', 'GND', '+12V AUX'], 'J2 · lógica (5 V) y medición'],
  ['J5', 85.4, 48.5, ['3V3', 'GND', 'SDA', 'SCL'], 'J5 · I²C de los VL53L0X'],
  ['J4', 85.4, 69.5, ['FC1', 'GND1', 'FC2', 'GND2', 'FC3', 'GND3'], 'J4 · finales de carrera'],
  ['J3', 85.4, 101.5, ['A', 'B', 'GND'], 'J3 · RS485 a los M0601'],
  ['J6', 85.4, 117.5, ['X0', 'X1', 'X2'], 'J6 · XSHUT de 3 VL53L0X'],
  ['J13', 85.4, 133.5, ['FC4', 'GND4', 'PARO'], 'J13 · final superior y lectura del paro'],
];
for (const [id, u, v0, ns, nm] of TERMS) ns.forEach((n, j) => pin(`${id}.${n}`, id, `${id} · ${n}`, u, v0 + 5.08 * j, `${nm}, terminal ${j + 1}`));
['GND', '+5V', 'SIG'].forEach((n, j) => pin('J11.' + n, 'J11', 'J11 · ' + n, 85.4, 37.5 + 2.54 * j, `header macho del servo, pin ${j + 1} (${['café', 'rojo', 'naranja'][j]} del servo)`));
pin('C11.-', 'cap_srv', 'C 100 µF del servo · pata − (franja)', 85.4, 31.0, 'la pata de la franja, en línea con J11 GND');   // rev. 3.24
pin('C11.+', 'cap_srv', 'C 100 µF del servo · pata + (larga)', 87.94, 31.0, 'la pata larga, del lado de la orilla');

// ---------- piezas de la placa
const BOARD_IDS = [];
const bPart = (id, name, fn, opt = {}) => { BOARD_IDS.push(id); return addPart(id, 'elec', name, fn, { noCheck: true, ...opt }); };
const perf = bPart('perf', 'Placa perforada 9 × 15 cm', b => b.bb(bx(0), bx(90), BRD.y - 0.0016, BRD.y, bz(0), bz(150), 'perf'));
{ // barrenos de la placa (textura)
  const c = document.createElement('canvas'); c.width = 360; c.height = 600; const g = c.getContext('2d');
  g.fillStyle = '#c8a165'; g.fillRect(0, 0, 360, 600);
  for (let i = 0; i < 35; i++) for (let j = 0; j < 59; j++) { const x = (1.3 + i * 2.54) * 4, y = (1.0 + j * 2.54) * 4; g.fillStyle = '#b07a3a'; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); g.fillStyle = '#5b3d1c'; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  perf.mats[0].mat.map = t; perf.mats[0].base.set(0xffffff); perf.mats[0].mat.needsUpdate = true;
}
// Patita que atraviesa la placa: punta abajo y su gota de soldadura en el cobre de abajo
function solderAt(b, x, z) {
  const yb = BRD.y - 0.0016;
  b.cyl(0.00042, 0.0007, x, yb - 0.00035, z, 'y', 'cTin', 8, 0.00085);
  b.bb(x - 0.00025, x + 0.00025, yb - 0.0019, yb - 0.0006, z - 0.00025, z + 0.00025, 'cTin');
}
const solderPins = (b, keys) => { for (const k of keys) solderAt(b, PIN[k].pos.x, PIN[k].pos.z); };
const pinsOfParts = (...parts) => Object.keys(PIN).filter(k => parts.includes(PIN[k].part));
const row = (b, u0, v0, u1, v1, h = SOCK, mat = 'socket') => b.bb(bx(Math.min(u0, u1) - 1.27), bx(Math.max(u0, u1) + 1.27), BRD.y, BRD.y + h, bz(Math.min(v0, v1) - 1.27), bz(Math.max(v0, v1) + 1.27), mat);
bPart('sockets', 'Tiras header hembra (zócalos)', b => {
  row(b, 31.3, espV(18), 31.3, espV(0)); row(b, 56.7, espV(18), 56.7, espV(0));
  for (const d of DRV) { row(b, 12, d.vc - 8.89, 12, d.vc + 8.89); row(b, 24.7, d.vc - 8.89, 24.7, d.vc + 8.89); }
  row(b, 65.2, 40, 72.82, 40); row(b, 65.2, 80, 72.82, 80);
  row(b, 63.6, 5.3, 76.3, 5.3); row(b, 63.6, 18, 76.3, 18);
  row(b, 35.1, 120, 52.88, 120);
  const keys = pinsOfParts('esp32', 'drv1', 'drv2', 'drv3', 'lvl', 'max485', 'bno');
  for (const k of keys) { const { x, z } = PIN[k].pos; b.bb(x - 0.0005, x + 0.0005, BRD.y + SOCK, BRD.y + SOCK + 0.0001, z - 0.0005, z + 0.0005, 'black'); }   // boca de cada contacto
  solderPins(b, keys);
});
const modBox = (b, u0, u1, v0, v1, mat, h = 0.0016, y = MOD0) => b.bb(bx(u0), bx(u1), y, y + h, bz(v0), bz(v1), mat);
// Módulos con su STEP: la cara de abajo de su placa queda en MOD0 y sus pines bajan a los zócalos.
bPart('esp32', 'ESP32 DevKitC (38 pines)', b => {
  b.stp('esp32', { map: ['x', '-y', '-z'], at: [bx(44), MOD0 + 0.0016, bz((espV(0) + espV(18)) / 2)], skip: ['#fbfaf5', '#e8ad23'] });   // USB hacia v = 0 · rev. 3.29: de cabeza, tiras soldadas del lado de los componentes
  for (const u of [31.3, 56.7]) b.bb(bx(u - 1.27), bx(u + 1.27), BRD.y + SOCK, MOD0, bz(espV(18) - 1.27), bz(espV(0) + 1.27), 'black');
});
for (const d of DRV) {
  bPart(d.id, `A4988 #${d.n} (${d.who})`, b => {
    // STEP de Pololu: filas a 12.5 mm, pines largos hacia abajo (al zócalo), chip arriba
    b.stp('a4988', { map: ['z', '-y', 'x'], at: [bx(18.35) + 0.02443, MOD0 - 0.0083, bz(d.vc)] });
    const cu = 20.17, cv = d.vc + 1.16, hy = MOD0 + 0.002;                                    // disipador pegado sobre el chip
    modBox(b, cu - 4.5, cu + 4.5, cv - 4.5, cv + 4.5, 'alu', 0.0015, hy);
    for (let k = 0; k < 4; k++) modBox(b, cu - 4.5, cu + 4.5, cv - 4 + k * 2.6, cv - 3.2 + k * 2.6, 'alu', 0.004, hy + 0.0015);
  });
  bPart('cap' + d.n, `Capacitor 100 µF #${d.n}`, b => {
    const x = bx(4.6), z = bz(d.vc + 14);
    b.cyl(0.00315, 0.011, x, BRD.y + 0.0065, z, 'y', 'capE', 16);
    b.bb(x - 0.0006, x + 0.0006, BRD.y + 0.001, BRD.y + 0.012, z + 0.0026, z + 0.0033, 'white');   // franja (−)
    b.cyl(0.0029, 0.0004, x, BRD.y + 0.0122, z, 'y', 'steel', 16);
    for (const k of [`C${d.n}.+`, `C${d.n}.-`]) { const P = PIN[k].pos; b.bb(P.x - 0.0003, P.x + 0.0003, BRD.y, BRD.y + 0.0012, P.z - 0.0003, P.z + 0.0003, 'steel'); }   // patas
    solderPins(b, [`C${d.n}.+`, `C${d.n}.-`]);
  });
  bPart(d.mot, `${d.mot} · motor ${d.who}`, b => term(b, 4.6, d.vc - 7.62, 4, -1));
}
function term(b, u, v0, n, out) {          // bornera KF301 de n terminales a lo largo de v; out = lado de la entrada del cable (±u)
  b.bb(bx(u - 3.8), bx(u + 3.8), BRD.y, BRD.y + 0.010, bz(v0 - 2.54), bz(v0 + 5.08 * (n - 1) + 2.54), 'term');
  for (let j = 0; j < n; j++) {
    b.cyl(0.0016, 0.0008, bx(u), BRD.y + 0.0104, bz(v0 + 5.08 * j), 'y', 'steel', 10);
    b.bb(bx(out > 0 ? u + 3.8 : u - 3.9), bx(out > 0 ? u + 3.9 : u - 3.8), BRD.y + 0.002, BRD.y + 0.006, bz(v0 + 5.08 * j - 1.5), bz(v0 + 5.08 * j + 1.5), 'black');
    solderAt(b, bx(u), bz(v0 + 5.08 * j));
  }
}
bPart('J1', 'J1 · 12 V de motores', b => term(b, 4.6, 133.5, 2, -1));
for (const [id, u, v0, ns, nm] of TERMS.slice(1)) bPart(id, nm, b => term(b, u, v0, ns.length, 1));
bPart('J11', 'J11 · servo (header macho)', b => {
  b.bb(bx(84.1), bx(86.7), BRD.y, BRD.y + 0.0025, bz(36.2), bz(43.9), 'black');
  for (let j = 0; j < 3; j++) b.bb(bx(85.1), bx(85.7), BRD.y + 0.0025, BRD.y + 0.0085, bz(37.2 + 2.54 * j), bz(37.8 + 2.54 * j), 'gold');
  solderPins(b, ['J11.GND', 'J11.+5V', 'J11.SIG']);
});
bPart('cap_srv', 'Capacitor 100 µF del servo (J11)', b => {      // rev. 3.24: uno de los 3 de repuesto
  const A = PIN['C11.-'].pos, B = PIN['C11.+'].pos, x = (A.x + B.x) / 2, z = (A.z + B.z) / 2, s = Math.sign(A.x - B.x);
  b.cyl(0.00315, 0.011, x, BRD.y + 0.0065, z, 'y', 'capE', 16);
  b.bb(Math.min(x + s * 0.0026, x + s * 0.0033), Math.max(x + s * 0.0026, x + s * 0.0033), BRD.y + 0.001, BRD.y + 0.012, z - 0.0006, z + 0.0006, 'white');   // franja (−) del lado de GND
  b.cyl(0.0029, 0.0004, x, BRD.y + 0.0122, z, 'y', 'steel', 16);
  for (const P of [A, B]) b.bb(P.x - 0.0003, P.x + 0.0003, BRD.y, BRD.y + 0.0012, P.z - 0.0003, P.z + 0.0003, 'steel');
  solderPins(b, ['C11.-', 'C11.+']);
});
bPart('max485', 'Módulo MAX485 (RS485)', b => {
  const x0 = bx(69.01) - 0.00038, z0 = bz(60), y0 = MOD0 + 0.000765;        // pines a lo largo de u; header del bus hacia +v
  // rev. 3.29: de cabeza (girado 180° sobre su eje largo), tiras soldadas del lado de los componentes; sin los pines del STEP
  const xf = bx(69.01) + 0.00038, yf = MOD0 + 0.00083;
  b.stp('max485', { map: ['z', '-x', '-y'], at: [xf, yf, z0], skip: ['#9aa3ad'] });
  b.bb(xf - 0.0044, xf + 0.0045, yf - 0.0097, yf - 0.0028, z0 + 0.0108, z0 + 0.0156, 'blue');   // bornera A/B, ahora hacia la placa (sin usar)
  for (const v of [40, 80]) b.bb(bx(65.2 - 1.27), bx(72.82 + 1.27), BRD.y + SOCK, MOD0, bz(v - 1.27), bz(v + 1.27), 'black');
});
bPart('lvl', 'Convertidor de nivel 3.3 ↔ 5 V', b => {
  b.stp('lvl', { map: ['z', '-x', '-y'], at: [bx(69.95), MOD0 + 0.0015, bz(11.65)], skip: ['#a0a0a0', '#1a1a1a'] });   // filas LV y HV a lo largo de u · rev. 3.29: de cabeza
  for (const v of [5.3, 18.0]) b.bb(bx(63.6 - 1.27), bx(76.3 + 1.27), BRD.y + SOCK, MOD0, bz(v - 1.27), bz(v + 1.27), 'black');
});
bPart('bno', 'IMU BNO055', b => {
  // UNIT DevLab UE0091 (BNO055 + BMP280), dibujada de su hoja de medidas: 27.94 × 17.78 mm, 2 headers macho de 5 en sus zócalos
  b.stpAt('bno', new THREE.Matrix4(), V3(bx(35.1), MOD0, bz(120)));
});
for (const r of PASS) {
  bPart(r.id, r.name, b => {
    const A = PIN[r.key + '.a'].pos, B = PIN[r.key + '.b'].pos, mid = A.clone().lerp(B, 0.5), y = BRD.y + 0.0016;
    const ax = Math.abs(A.x - B.x) > Math.abs(A.z - B.z) ? 'x' : 'z';
    for (const P of [A, B]) { b.cyl(0.0003, 0.0018, P.x, BRD.y + 0.0009, P.z, 'y', 'steel', 6); solderAt(b, P.x, P.z); }
    if (r.cer) {                                                       // capacitor cerámico "104"
      b.tube([[A.x, BRD.y + 0.0018, A.z], [mid.x, BRD.y + 0.0030, mid.z], [B.x, BRD.y + 0.0018, B.z]], 0.0003, 'steel', 10);
      b.cyl(0.0022, 0.0016, mid.x, BRD.y + 0.0042, mid.z, 'z', 'capC', 16);
      return;
    }
    b.tube([[A.x, BRD.y + 0.0018, A.z], [A.x, y, A.z], [B.x, y, B.z], [B.x, BRD.y + 0.0018, B.z]], 0.0003, 'steel', 12);
    b.cyl(0.0012, 0.0064, mid.x, y, mid.z, ax, 'rBody', 14);
    r.bands.concat(['bGold']).forEach((m, k) => {
      const off = (-0.0022 + k * 0.0012) * (k === 3 ? 1.25 : 1);
      b.cyl(0.00125, 0.0006, mid.x + (ax === 'x' ? off : 0), y, mid.z + (ax === 'z' ? off : 0), ax, m, 14);
    });
  });
}

// ---------- cables de la placa (uno por uno; ruta en "L" sobre la placa)
const WIRES = [];
function route(pts) {                    // pts en [u, v] → polilínea en ángulos rectos (primero u, luego v)
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = out[out.length - 1], c = pts[i];
    if (Math.abs(a[0] - c[0]) > 0.01 && Math.abs(a[1] - c[1]) > 0.01) out.push([c[0], a[1]]);
    out.push(c);
  }
  return out;
}
function W(group, from, to, mat, via = [], opt = {}) {
  const A = PIN[from], B = PIN[to];
  if (!A || !B) { console.warn('Pin desconocido', from, to); return; }
  const n = WIRES.length + 1, id = 'w' + String(n).padStart(3, '0');
  const bridge = !!opt.bridge, h = bridge ? 0.0009 : 0.0010 + (n % 4) * 0.0005;
  const poly = route([[A.u, A.v], ...via, [B.u, B.v]]);
  // esquinas redondeadas y puntas que bajan al pin
  const P = [V3(bx(A.u), BRD.y + 0.0002, bz(A.v))];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], prev = poly[i - 1], next = poly[i + 1];
    const c = V3(bx(p[0]), BRD.y + h, bz(p[1]));
    if (prev && next) {
      const r = 0.0012, d1 = c.clone().sub(V3(bx(prev[0]), BRD.y + h, bz(prev[1]))), d2 = V3(bx(next[0]), BRD.y + h, bz(next[1])).sub(c);
      const r1 = Math.min(r, d1.length() / 2), r2 = Math.min(r, d2.length() / 2);
      P.push(c.clone().addScaledVector(d1.normalize(), -r1), c.clone().addScaledVector(d1, -r1 * 0.3).addScaledVector(d2.clone().normalize(), r2 * 0.3), c.clone().addScaledVector(d2.normalize(), r2));
    } else P.push(c);
  }
  P.push(V3(bx(B.u), BRD.y + 0.0002, bz(B.v)));
  const pts = P.filter((p, i) => i === 0 || p.distanceTo(P[i - 1]) > 1e-5).map(p => p.toArray());
  let len = 0; for (let i = 1; i < pts.length; i++) len += V3(...pts[i]).distanceTo(V3(...pts[i - 1]));
  const name = `${A.name} → ${B.name}`;
  const p = bPart(id, `Cable ${n}: ${A.name} → ${B.name}`, b => b.tube(pts, bridge ? 0.00035 : 0.00048, mat, Math.max(24, pts.length * 8)), { shadow: false, pickR: 0.0016 });
  p.wire = n;
  WIRES.push({ n, id, group, from, to, mat, color: COLOR_NAME[mat], len: Math.round(len * 1000) + (bridge ? 0 : 20), bridge, why: opt.why || '', short: name });
  return p;
}
// --- 1. Potencia de los drivers (12 V)
const G1 = 'Potencia de los drivers (12 V)';
W(G1, 'J1.+12V', 'A3.VMOT', 'cRed', [[9, 133.5], [9, 78.89]], { why: 'Lleva los 12 V del relé (rama de motores) al primer driver. Los otros dos se alimentan en cadena.' });
W(G1, 'A3.VMOT', 'A2.VMOT', 'cRed', [[9, 78.89], [9, 50.89]], { why: 'Cadena de 12 V: del VMOT del #3 al VMOT del #2.' });
W(G1, 'A2.VMOT', 'A1.VMOT', 'cRed', [[9, 50.89], [9, 22.89]], { why: 'Cadena de 12 V: del VMOT del #2 al VMOT del #1.' });
W(G1, 'J1.GND', 'A3.PGND', 'cBlk', [[9.7, 138.58], [9.7, 76.35]], { why: 'Tierra de potencia del primer driver; regresa a la batería por J1.' });
W(G1, 'A3.PGND', 'A2.PGND', 'cBlk', [[9.7, 76.35], [9.7, 48.35]], { why: 'Cadena de tierra de potencia.' });
W(G1, 'A2.PGND', 'A1.PGND', 'cBlk', [[9.7, 48.35], [9.7, 20.35]], { why: 'Cadena de tierra de potencia.' });
for (const d of DRV) {
  W(G1, `C${d.n}.+`, `A${d.n}.VMOT`, 'cRed', [], { why: `Pata larga (+) del capacitor al VMOT del A4988 #${d.n}. Absorbe el pico de voltaje al arrancar el motor; sin él el driver se puede quemar.` });
  W(G1, `C${d.n}.-`, `A${d.n}.PGND`, 'cBlk', [[10.5, d.vc + 15.25], [10.5, d.vc + 6.35]], { why: `Pata de la franja (−) a la tierra de potencia del #${d.n}. Al revés, el capacitor se infla o revienta.` });
}
// --- 2. Lógica de los drivers
const G2 = 'Lógica de los drivers (3.3 V y GND)';
W(G2, 'E.3V3', 'A3.VDD', 'cPnk', [[31.3, 62.38], [15.5, 62.38]], { why: 'VDD es la alimentación de la lógica del driver: 3.3 V del ESP32, nunca 5 V (con 5 V no entiende las señales de 3.3 V).' });
W(G2, 'A3.VDD', 'A2.VDD', 'cPnk', [[15.5, 63.65], [15.5, 35.65]], { why: 'Cadena de 3.3 V entre drivers, por debajo de los zócalos.' });
W(G2, 'A2.VDD', 'A1.VDD', 'cPnk', [[15.5, 35.65], [15.5, 7.65]], { why: 'Cadena de 3.3 V entre drivers.' });
W(G2, 'E.GNDL', 'A1.LGND', 'cBlk', [[29.5, 20.28], [29.5, 2.6], [12, 2.6]], { why: 'Tierra de la lógica: une el GND del ESP32 con el de los drivers. Sin tierra común las señales no llegan.' });
W(G2, 'A1.LGND', 'A2.LGND', 'cBlk', [[16.5, 5.11], [16.5, 33.11]], { why: 'Cadena de tierra de lógica.' });
W(G2, 'A2.LGND', 'A3.LGND', 'cBlk', [[16.5, 33.11], [16.5, 61.11]], { why: 'Cadena de tierra de lógica.' });
// --- 3. Configuración de cada driver
const G3 = 'Configuración de cada driver';
for (const d of DRV) {
  W(G3, `A${d.n}.MS1`, `A${d.n}.MS3`, 'cTin', [], { bridge: true, why: `Puente de alambre desnudo que toca MS1, MS2 y MS3 del #${d.n} (los 3 pines seguidos).` });
  W(G3, `A${d.n}.MS3`, `A${d.n}.VDD`, 'cPnk', [[20, d.vc + 1.27], [20, d.vc - 6.35]], { why: `MS1–MS3 a 3.3 V = micropaso 1/16: el motor se mueve más suave y silencioso. Por eso 3200 pasos = 1 vuelta.` });
  W(G3, `A${d.n}.RST`, `A${d.n}.SLP`, 'cTin', [], { bridge: true, why: `RESET y SLEEP del #${d.n} puenteados: así el driver nunca se duerme ni se queda en reset.` });
}
// --- 4. Señales STEP, DIR y EN
const G4 = 'Señales STEP, DIR y ENABLE';
W(G4, 'E.25', 'A1.STEP', 'cGrn', [[28.4, 32.98], [28.4, 7.65]], { why: 'Cada pulso en STEP es un micropaso del elevador.' });
W(G4, 'A1.STEP', 'A2.STEP', 'cGrn', [[26.3, 7.65], [26.3, 35.65]], { why: 'Los 2 drivers del elevador comparten STEP: los 2 motores dan exactamente los mismos pasos.' });
W(G4, 'E.26', 'A1.DIR', 'cBlu', [[28.95, 30.44], [28.95, 5.11]], { why: 'DIR decide si el elevador sube o baja.' });
W(G4, 'A1.DIR', 'A2.DIR', 'cBlu', [[26.85, 5.11], [26.85, 33.11]], { why: 'DIR compartido: los 2 husillos giran hacia el mismo lado.' });
W(G4, 'E.27', 'A3.STEP', 'cGrn', [[27.85, 27.9], [27.85, 63.65]], { why: 'STEP del empujador (su propio driver).' });
W(G4, 'E.14', 'A3.DIR', 'cBlu', [[27.3, 25.36], [27.3, 61.11]], { why: 'DIR del empujador: adelante o atrás.' });
W(G4, 'E.13', 'A1.EN', 'cBrn', [[30.0, 17.74], [30.0, 22.89]], { why: 'ENABLE: en 0 los motores tienen fuerza; en 1 quedan sueltos. Un solo pin para los 3 drivers.' });
W(G4, 'A1.EN', 'A2.EN', 'cBrn', [[26.0, 22.89], [26.0, 50.89]], { why: 'Cadena de ENABLE.' });
W(G4, 'A2.EN', 'A3.EN', 'cBrn', [[26.0, 50.89], [26.0, 78.89]], { why: 'Cadena de ENABLE.' });
W(G4, 'A3.EN', 'REN.a', 'cBrn', [[29.0, 78.89], [29.0, 62]], { why: 'La resistencia de 10 kΩ deja ENABLE en 1 (motores sueltos) mientras el ESP32 arranca: no hay movimientos raros al encender.' });
W(G4, 'REN.b', 'E.3V3', 'cPnk', [[43.16, 58.4], [31.3, 58.4]], { why: 'La otra pata de la 10 kΩ va a 3.3 V.' });
// --- 5. Motores a sus borneras
const G5 = 'Bobinas de los motores a sus borneras';
for (const d of DRV) for (const c of ['1A', '1B', '2A', '2B']) W(G5, `A${d.n}.${c}`, `${d.mot}.${c}`, c[0] === '1' ? 'cGry' : 'cTeal', [], { why: `Salida ${c} del A4988 #${d.n} a la bornera ${d.mot} (${d.who}). ${c[0] === '1' ? 'Bobina A: 1A y 1B.' : 'Bobina B: 2A y 2B.'}` });
// --- 6. 5 V
const G6 = 'Alimentación de 5 V';
W(G6, 'J2.+5V', 'E.5V', 'cOra', [[80, 2.2], [33, 2.2], [31.3, 2.2]], { why: 'El ESP32 se alimenta por su pin 5V desde el XL4005 (no por la computadora).' });
W(G6, 'J2.+5V', 'L.HV', 'cOra', [[80.5, 4.5], [80.5, 12], [68.68, 12]], { why: 'HV es el lado de 5 V del convertidor de nivel.' });
W(G6, 'L.HV', 'M.VCC', 'cOra', [[68.68, 21], [61.2, 21], [61.2, 80]], { why: 'El MAX485 trabaja a 5 V.' });
W(G6, 'J2.GND', 'E.GND2', 'cBlk', [[80, 9.58], [80, 36], [58.6, 36], [56.7, 36]], { why: 'Tierra del XL4005 al ESP32.' });
W(G6, 'J2.+5V', 'J11.+5V', 'cOra', [[81.2, 4.5], [81.2, 40.04]], { why: '5 V del servo: del XL4005, nunca del ESP32 (al moverse jala corriente y reinicia la placa).' });
W(G6, 'J2.GND', 'J11.GND', 'cBlk', [[80.6, 9.58], [80.6, 37.5]], { why: 'Tierra del servo.' });
// --- 7. 3.3 V y GND de los módulos
const G7 = '3.3 V y GND de los módulos';
W(G7, 'E.3V3', 'L.LV', 'cPnk', [[31.3, 58.5], [60.4, 58.5], [60.4, 8.5], [68.68, 8.5]], { why: 'LV es el lado de 3.3 V del convertidor.' });
W(G7, 'E.GND2', 'L.GNDL', 'cBlk', [[59.3, 38.06], [59.3, 10], [71.22, 10]], { why: 'Tierra del convertidor (sus 2 GND están unidos por dentro).' });
W(G7, 'L.GNDL', 'M.GND', 'cBlk', [[71.22, 9], [78.6, 9], [78.6, 80]], { why: 'Tierra del MAX485.' });
W(G7, 'M.GND', 'J3.GND', 'cBlk', [[72.82, 84], [81.8, 84], [81.8, 111.66]], { why: 'La tierra viaja junto con A y B hasta los motores (pin 1 de su conector de señal).' });
W(G7, 'E.3V3', 'J5.3V3', 'cPnk', [[31.3, 57.6], [81, 57.6], [81, 48.5]], { why: '3.3 V para los 4 VL53L0X.' });
W(G7, 'E.GND1', 'J5.GND', 'cBlk', [[56.7, 53.3], [85.4, 53.3]], { why: 'Tierra de los sensores I²C.' });
W(G7, 'J5.3V3', 'B.VIN', 'cPnk', [[81.4, 48.5], [81.4, 89.2], [45.26, 89.2]], { why: '3.3 V para la IMU (su VCC acepta 3.3–6 V; a 3.3 V su SDA/SCL quedan a 3.3 V, como el ESP32).' });
W(G7, 'J5.GND', 'B.GND', 'cBlk', [[80.9, 53.58], [80.9, 88.6], [42.72, 88.6]], { why: 'Tierra de la IMU.' });
W(G7, 'J5.GND', 'J4.GND1', 'cBlk', [[82.3, 53.58], [82.3, 74.58]], { why: 'Tierra del final de carrera 1 (su COM).' });
W(G7, 'J4.GND1', 'J4.GND2', 'cBlk', [[82.3, 74.58], [82.3, 84.74]], { why: 'Tierra del final de carrera 2.' });
W(G7, 'J4.GND2', 'J4.GND3', 'cBlk', [[82.3, 84.74], [82.3, 94.9]], { why: 'Tierra del final de carrera 3.' });
// --- 8. RS485
const G8 = 'RS485 (MAX485 y convertidor de nivel)';
W(G8, 'E.17', 'M.DI', 'cPur', [[58.3, 27.9], [58.3, 36.6], [72.82, 36.6]], { why: 'DI = lo que el ESP32 manda a los motores. El MAX485 entiende 3.3 V, va directo.' });
W(G8, 'E.4', 'M.DE', 'cPur', [[58.4, 22.82], [58.4, 37.2], [70.28, 37.2]], { why: 'DE+RE: en 1 el MAX485 habla, en 0 escucha. El ESP32 lo cambia en cada mensaje.' });
W(G8, 'M.DE', 'M.RE', 'cTin', [], { bridge: true, why: 'DE y RE puenteados: un solo pin decide si habla o escucha.' });
W(G8, 'M.RO', 'L.HV1', 'cPur', [[65.2, 24], [63.6, 24]], { why: 'RO = lo que contestan los motores, sale a 5 V: pasa por el convertidor antes de llegar al ESP32.' });
W(G8, 'L.LV1', 'E.16', 'cPur', [[59.0, 5.3], [59.0, 25.36]], { why: 'Ya a 3.3 V, la respuesta de los motores entra al GPIO 16.' });
W(G8, 'M.A', 'J3.A', 'cLbl', [[70.28, 85.2], [79.6, 85.2], [79.6, 101.5]], { why: 'Línea A del bus RS485 hacia los 2 motores.' });
W(G8, 'M.B', 'J3.B', 'cLim', [[67.74, 85.8], [79.0, 85.8], [79.0, 106.58]], { why: 'Línea B del bus. Si los motores no contestan, se invierten A y B.' });
// --- 9. I²C
const G9 = 'Bus I²C (SDA y SCL)';
W(G9, 'E.21', 'J5.SDA', 'cYel', [[59.6, 40.6], [59.6, 58.66]], { why: 'SDA (datos) del bus I²C hacia los VL53L0X.' });
W(G9, 'E.22', 'J5.SCL', 'cWht', [[60.1, 48.22], [60.1, 63.74]], { why: 'SCL (reloj) del bus I²C.' });
W(G9, 'J5.SDA', 'B.SDA', 'cYel', [[80.2, 58.66], [80.2, 88.0], [57.0, 88.0], [57.0, 138.5], [35.1, 138.5]], { why: 'La BNO055 también va al bus I²C (dirección 0x28).' });
W(G9, 'J5.SCL', 'B.SCL', 'cWht', [[79.7, 63.74], [79.7, 87.4], [57.6, 87.4], [57.6, 139.1], [37.64, 139.1]], { why: 'Reloj de la BNO055.' });
// --- 10. XSHUT
const G10 = 'XSHUT de los VL53L0X (directo del ESP32)';
[['E.32', 'X0', 'frontal', '0x30', [[29.5, 38.06], [29.5, 112.0], [81.6, 112.0], [81.6, 117.5]]],
 ['E.33', 'X1', 'lateral izquierdo', '0x31', [[28.95, 35.52], [28.95, 113.0], [81.1, 113.0], [81.1, 122.58]]],
 ['E.15', 'X2', 'lateral derecho', '0x32', [[61.85, 15.2], [61.85, 114.0], [80.6, 114.0], [80.6, 127.66]]]].forEach(([e, x, who, a, via]) =>
  W(G10, e, 'J6.' + x, 'cOli', via, { why: `${PIN[e].name.replace('ESP32 · ', '')} apaga y prende el VL53L0X ${who}. Al arrancar el programa los 3 se apagan (LOW), al de la pila (sin XSHUT) se le cambia la dirección y luego se prenden uno por uno: este queda en ${a}.${e === 'E.15' ? ' GPIO 15 es pin de arranque: el pull-up del propio sensor lo deja en alto, que es su valor normal.' : ''}` }));
// --- 11. Finales de carrera
const G11 = 'Finales de carrera';
W(G11, 'E.18', 'J4.FC1', 'cBei', [[60.6, 32.98], [60.6, 69.5]], { why: 'Final de carrera del elevador izquierdo (contacto NC). INPUT_PULLUP: un cable roto se lee como "presionado" y el motor se detiene.' });
W(G11, 'E.19', 'J4.FC2', 'cBei', [[61.1, 35.52], [61.1, 76.5], [83.0, 76.5], [83.0, 79.66]], { why: 'Final de carrera del elevador derecho (NC).' });
W(G11, 'E.23', 'J4.FC3', 'cBei', [[61.6, 50.76], [61.6, 86.5], [78.2, 86.5], [78.2, 89.82]], { why: 'Final de carrera de home del empujador (NC).' });
// --- 13. Divisor de batería
const G13 = 'Divisor para medir la batería';
W(G13, 'J2.+12V AUX', 'R1.a', 'cRed', [[79.8, 14.66], [79.8, 64.6], [31.6, 64.6], [31.6, 67]], { why: '12 V de la rama auxiliar (siempre encendida) a la resistencia de 100 kΩ. Nunca 12 V directo a un GPIO.' });
W(G13, 'R1.b', 'R2.a', 'cTin', [], { bridge: true, why: 'Une la 100 kΩ con la 20 kΩ: ese punto es el "medio" del divisor (14.4 V → 2.4 V).' });
W(G13, 'R2.a', 'CD.a', 'cTin', [], { bridge: true, why: 'El capacitor de 100 nF va del medio del divisor a GND, en paralelo con la 20 kΩ: quita el ruido de la lectura.' });
W(G13, 'R2.b', 'CD.b', 'cBlk', [], { why: 'La otra pata del capacitor, a la tierra del divisor.' });
W(G13, 'R2.b', 'E.GND1', 'cBlk', [[56.7, 67]], { why: 'La 20 kΩ va a GND.' });
W(G13, 'R2.a', 'E.39', 'cOli', [[45.7, 65.2], [29.2, 65.2], [29.2, 45.68]], { why: 'El medio del divisor al GPIO 39 (solo entrada analógica). Voltaje real = analogReadMilliVolts(39) × 6 / 1000 (usa la calibración de fábrica del ADC); revísenlo una vez contra el multímetro.' });
// --- 14. Servo
const G14 = 'Servo de la uña';
W(G14, 'E.5', 'J11.SIG', 'cMag', [[80.0, 30.44], [80.0, 42.58]], { why: 'Señal PWM del MG90S (cable naranja del servo).' });
// --- 15. Lectura del paro (rev. 3.17c)
const G15 = 'Lectura del paro (GPIO 34)';
W(G15, 'J13.PARO', 'R3.a', 'cRed', [[82.6, 143.66], [82.6, 92], [31.8, 92], [31.8, 82]], { why: 'Llega el VCC del relé, después del paro (cable C23). Con el paro suelto hay 12–14.4 V; apretado, 0 V. Va a la 100 kΩ, nunca directo al GPIO.' });
W(G15, 'R3.b', 'R4.a', 'cTin', [], { bridge: true, why: 'Une la 100 kΩ con la 20 kΩ: el punto medio del divisor del paro (14.4 V → 2.4 V), igual que el de la batería.' });
W(G15, 'R4.a', 'C2.a', 'cTin', [], { bridge: true, why: 'El 100 nF va del punto medio a GND, en paralelo con la 20 kΩ: filtra el ruido de los motores.' });
W(G15, 'R4.b', 'C2.b', 'cBlk', [], { why: 'La otra pata del capacitor, a la tierra del divisor.' });
W(G15, 'R4.b', 'R2.b', 'cBlk', [], { why: 'La 20 kΩ del paro va a la misma tierra que el divisor de la batería.' });
W(G15, 'R4.a', 'E.34', 'cOli', [[45.7, 79.5], [28.4, 79.5], [28.4, 43.14]], { why: 'Punto medio al GPIO 34 (solo entrada). El programa lo lee con analogReadMilliVolts: si baja de ~1 V es que apretaron el paro → FALLA_PARO (velocidad 0, ENABLE en 1, home perdido). Para salir: soltar el paro, REARME y home.' });
// --- 16. Final de carrera superior (rev. 3.17c)
const G16 = 'Final de carrera superior (GPIO 35)';
W(G16, 'J13.FC4', 'R5.a', 'cBei', [[83.2, 133.5], [83.2, 93.2], [32.4, 93.2], [32.4, 77]], { why: 'NC del final superior (cable C22). Con la plataforma abajo de 83.0 cm está cerrado y el GPIO lee 0.' });
W(G16, 'R5.a', 'E.35', 'cBei', [[33, 75], [27.8, 75], [27.8, 40.6]], { why: 'Al GPIO 35. Es solo entrada y no tiene pull-up interno: por eso la 10 kΩ externa. Si se abre (tope o cable roto) lee 1 y el elevador no sube más.' });
W(G16, 'R5.b', 'REN.b', 'cPnk', [[44.4, 77], [44.4, 62]], { why: 'La otra pata de la 10 kΩ a 3.3 V (la misma pata de 3.3 V de la resistencia de ENABLE).' });
W(G16, 'J13.GND4', 'J4.GND3', 'cBlk', [[84.0, 138.58], [84.0, 94.9]], { why: 'COM del final superior a GND: se toma de la tierra de J4.' });
const G17 = 'Capacitor del servo (rev. 3.17d)';
W(G17, 'C11.-', 'J11.GND', 'cTin', [], { bridge: true, why: 'Pata de la franja (−) del capacitor a GND del servo. Va por abajo con la misma pata del capacitor doblada: no hace falta otro cable.' });
W(G17, 'C11.+', 'J11.+5V', 'cTin', [[87.94, 40.04]], { bridge: true, why: 'Pata larga (+) a +5V del servo, también por abajo. El capacitor da la corriente de los arranques del MG90S y así no baja el voltaje del ESP32.' });

// ============================================================ MÓDULOS DE POTENCIA EN LA BANDEJA
const TP = {};   // terminales de los módulos de potencia (coordenadas del carrito)
const tp = (k, name, x, y, z) => { TP[k] = { name, pos: V3(x, y, z) }; };
addPart('boost', 'elec', 'Elevador de voltaje 400 W', b => {
  b.bb(-0.242, -0.182, TY, TY + 0.0016, 0.035, 0.125, 'pcbB');
  b.bb(-0.222, -0.188, TY + 0.0016, TY + 0.026, 0.045, 0.060, 'alu');
  b.bb(-0.222, -0.188, TY + 0.0016, TY + 0.026, 0.100, 0.115, 'alu');
  b.cyl(0.009, 0.020, -0.226, TY + 0.0116, 0.080, 'y', 'dark', 14);
  b.cyl(0.009, 0.020, -0.200, TY + 0.0116, 0.080, 'y', 'dark', 14);
  b.cyl(0.003, 0.010, -0.188, TY + 0.0066, 0.120, 'y', 'blue', 8);
  for (const z of [0.042, 0.118]) b.bb(-0.241, -0.225, TY + 0.0016, TY + 0.0116, z - 0.005, z + 0.005, 'blue');
}, { nest: ['tray'] });
tp('B.IN+', 'Elevador · IN+', -0.237, TY + 0.012, 0.042); tp('B.IN-', 'Elevador · IN−', -0.229, TY + 0.012, 0.042);
tp('B.OUT+', 'Elevador · OUT+ (18 V)', -0.237, TY + 0.012, 0.118); tp('B.OUT-', 'Elevador · OUT−', -0.229, TY + 0.012, 0.118);
addPart('xl4005', 'elec', 'Reductor XL4005', b => {
  b.stp('xl4005', { map: ['z', 'x', 'y'], al: ['c', 'min', 'c'], at: [-0.1315, TY, -0.095] });   // 44 × 21 mm, largo en z
}, { nest: ['tray'] });
tp('X.OUT+', 'XL4005 · OUT+ (5 V)', -0.139, TY + 0.003, -0.1155); tp('X.OUT-', 'XL4005 · OUT−', -0.124, TY + 0.003, -0.1155);
tp('X.IN+', 'XL4005 · IN+ (12 V aux)', -0.139, TY + 0.003, -0.0745); tp('X.IN-', 'XL4005 · IN−', -0.124, TY + 0.003, -0.0745);
addPart('relay', 'elec', 'Módulo relé T90 30 A', b => {
  b.bb(-0.175, -0.118, TY, TY + 0.0016, 0.035, 0.085, 'pcb');
  b.bb(-0.170, -0.142, TY + 0.0016, TY + 0.0266, 0.040, 0.060, 'blue');
  b.bb(-0.170, -0.142, TY + 0.0016, TY + 0.0266, 0.062, 0.082, 'blue');
  b.bb(-0.136, -0.122, TY + 0.0016, TY + 0.0116, 0.040, 0.080, 'green');
  b.bb(-0.175, -0.171, TY + 0.0016, TY + 0.0076, 0.042, 0.063, 'black');
}, { nest: ['tray'] });
tp('R.COM', 'Relé · COM', -0.129, TY + 0.012, 0.047); tp('R.NO', 'Relé · NO', -0.129, TY + 0.012, 0.060); tp('R.NC', 'Relé · NC', -0.129, TY + 0.012, 0.073);
tp('R.VCC', 'Relé · VCC (bobina)', -0.173, TY + 0.008, 0.045); tp('R.GND', 'Relé · GND', -0.173, TY + 0.008, 0.050); tp('R.IN', 'Relé · IN', -0.173, TY + 0.008, 0.055);
addPart('fuses', 'elec', 'Fusibles 15 A y 5 A', b => {
  for (const [z, m] of [[0.098, 'cBlu'], [0.115, 'cRed']]) {
    b.bb(-0.165, -0.125, TRAY.y, TRAY.y + 0.012, z - 0.007, z + 0.007, 'black');
    b.bb(-0.150, -0.140, TRAY.y + 0.012, TRAY.y + 0.020, z - 0.003, z + 0.003, m);
  }
}, { nest: ['tray'] });
tp('F15.in', 'Fusible 15 A · entrada', -0.165, TRAY.y + 0.006, 0.098); tp('F15.out', 'Fusible 15 A · salida', -0.125, TRAY.y + 0.006, 0.098);
tp('F10.in', 'Fusible 5 A · entrada', -0.165, TRAY.y + 0.006, 0.115); tp('F10.out', 'Fusible 5 A · salida', -0.125, TRAY.y + 0.006, 0.115);
addPart('cap_bus', 'elec', 'Capacitor 1000 µF / 35 V (18 V)', b => {      // rev. 3.24: acostado sobre el elevador, patas a su bornera de salida
  b.cyl(0.005, 0.017, -0.2135, TY + 0.0066, 0.1205, 'x', 'capE', 18);
  b.bb(-0.222, -0.205, TY + 0.0112, TY + 0.0118, 0.1185, 0.1225, 'white');                    // franja (−)
  b.tube([[-0.222, TY + 0.0066, 0.1185], [-0.229, TY + 0.0066, 0.1185], [-0.229, TY + 0.012, 0.118]], 0.0003, 'steel', 8);
  b.tube([[-0.222, TY + 0.0066, 0.1225], [-0.237, TY + 0.0066, 0.1225], [-0.237, TY + 0.012, 0.118]], 0.0003, 'steel', 8);
}, { nest: ['tray'], noCheck: true });
addPart('voltm', 'elec', 'Voltímetro 3030N', b => {                     // rev. 3.24: ya comprado; medidas supuestas (~30 × 15 × 10 mm)
  b.bb(-0.146, -0.131, TY, TY + 0.010, -0.062, -0.032, 'black');
  b.bb(-0.1445, -0.1325, TY + 0.010, TY + 0.0104, -0.059, -0.035, 'red');
}, { nest: ['tray'] });
tp('V.+', 'Voltímetro · rojo (+)', -0.1385, TY + 0.005, -0.063); tp('V.-', 'Voltímetro · negro (−)', -0.1365, TY + 0.005, -0.063);
const endPart = k => PIN[k] ? PIN[k].part : ({ B: 'boost', X: 'xl4005', R: 'relay', F: 'fuses', V: 'voltm' })[k.split(/[.\d]/)[0]];
const endP = k => (PIN[k] ? { name: PIN[k].name, pos: PIN[k].pos.clone().setY(PIN[k].pos.y + 0.006) } : TP[k]);

// ---------- cables de potencia de la bandeja (Etapa 11 E)
// rev. 3.31: arnés. Rutas de todos los cables en coordenadas reales del carrito (gen.py → harn.json), cinchos y lazo del servo.
const HARN = window.__AE_HARN;   // data/harn.js
// Cable del servo (parte que se mueve): del servo corre pegado al costado de la cremallera hasta la cola del carro y de ahí
// cuelga en un lazo hasta el ancla fija en la columna del soporte trasero. El largo del lazo no cambia; el carro avanza m.push.
// rev. 3.32: cajas y cilindros orientados (conectores, punteras, termofit) y tubos de hilo que no generan su propio halo
Builder.prototype.obox = function (c, u, v, d, mat) {
  const U = V3(...u), Vv = V3(...v), W3 = U.clone().cross(Vv);
  const m = new THREE.Matrix4().makeBasis(U.multiplyScalar(d[0]), Vv.multiplyScalar(d[1]), W3.multiplyScalar(d[2])).setPosition(V3(...c));
  this.items.push({ geo: cachedGeo('box', () => new THREE.BoxGeometry(1, 1, 1)), mat, m }); return this;
};
Builder.prototype.ocyl = function (a, b, r, mat, r1 = r, segs = 14) {
  const A = V3(...a), B = V3(...b), ax = B.clone().sub(A), L = ax.length();
  const q = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), ax.clone().normalize());
  const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, V3(r, L, r));
  this.items.push({ geo: cachedGeo(`cyl${segs}_${(r1 / r).toFixed(3)}`, () => new THREE.CylinderGeometry(r1 / r, 1, 1, segs)), mat, m }); return this;
};
function wireGeo(pts, r) {
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => V3(...p)), false, 'catmullrom', 0.15), Math.max(8, Math.round(pts.length * 1.6)), r, 5, false);
  g.type = 'WireGeometry'; return g;
}
function harnBuild(b, HC) {
  for (const [mat, r, pts] of HC.w) b.items.push({ geo: wireGeo(pts, r), mat, m: new THREE.Matrix4() });
  for (const k of HC.k) {
    if (k[0] === 'b') b.obox(k[1], k[2], k[3], k[4], k[5]);
    else if (k[0] === 'c') b.ocyl(k[1], k[2], k[3], k[4], k[5]);
    else b.items.push({ geo: wireGeo(k[1], k[2]), mat: k[3], m: new THREE.Matrix4() });
  }
}
// cinta de 3 hilos del servo: la línea del centro del lazo y su ancho a lo largo de x (transporte paralelo desde el ancla)
function DYN_RIB(sp, m) {
  const C = DYN_LOOP(sp, m).map(q => V3(...q)), n = C.length, T = [];
  for (let i = 0; i < n; i++) T.push(C[Math.min(n - 1, i + 1)].clone().sub(C[Math.max(0, i - 1)]).normalize());
  const N = new Array(n); const v = V3(1, 0, 0);
  for (let i = n - 1; i >= 0; i--) { v.addScaledVector(T[i], -v.dot(T[i])).normalize(); N[i] = v.clone(); }
  return sp.w.map((w, k) => C.map((p, i) => p.clone().addScaledVector(N[i], (k - 1) * 2.08 * w[1]).toArray()));
}
function DYN_LOOP(sp, m) {
  const d = m.push - 0.008, S = [sp.S0[0] + d, sp.S0[1], sp.S0[2]], M = [sp.M0[0] + d, sp.M0[1], sp.M0[2]], F = sp.F, N = 36;
  const run = [S, [S[0] - 0.008, sp.M0[1], sp.S0[2] + 0.004], [S[0] - 0.020, sp.M0[1], sp.M0[2]]];
  for (let x = S[0] - 0.035; x > M[0] + 0.004; x -= 0.015) run.push([x, sp.M0[1], sp.M0[2]]);
  const par = h => { const o = []; for (let i = 0; i <= N; i++) { const u = i / N; o.push([M[0] + (F[0] - M[0]) * u, M[1] + (F[1] - M[1]) * u - 4 * h * u * (1 - u), M[2] + (F[2] - M[2]) * u]); } return o; };
  const len = p => { let t = 0; for (let i = 1; i < p.length; i++) t += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]); return t; };
  let lo = 0, hi = 0.3; for (let k = 0; k < 30; k++) { const mid = (lo + hi) / 2; if (len(par(mid)) < sp.L) lo = mid; else hi = mid; }
  return run.concat(par(lo));
}
function dynLoop(p, m) {                           // vuelve a hacer los 3 hilos cuando el carro se movió
  const k = m.push.toFixed(4); if (p._k === k) return; p._k = k;
  const path = new THREE.CatmullRomCurve3(DYN_LOOP(HARN.servo, m).map(q => V3(...q)), false, 'catmullrom', 0.2), r = HARN.servo.r;
  const geo = DYN_RIB(HARN.servo, m).map((pts, i) => () => wireGeo(pts, HARN.servo.w[i][1]));
  geo.push(() => new THREE.TubeGeometry(path, 45, 0.004, 5, false), () => new THREE.TubeGeometry(path, 90, Math.max(0.0011, r * 2.6), 8, false).toNonIndexed());
  p.group.children.forEach((ch, i) => { if (ch.isMesh && geo[i]) { ch.geometry.dispose(); ch.geometry = geo[i](); } });
}
const CABLES = [];
function cabT(id, name, from, to, mat, r, gauge, why, lift = 0.012) {
  const A = endP(from), B = endP(to);
  const mid = A.pos.clone().lerp(B.pos, 0.5); mid.y = Math.max(A.pos.y, B.pos.y) + lift;
  const HC = HARN.c[id]; if (HC) r = HC.r;
  const pts = HC ? HC.p : [A.pos, A.pos.clone().setY(A.pos.y + lift * 0.6), mid, B.pos.clone().setY(B.pos.y + lift * 0.6), B.pos].map(p => p.toArray());
  const W = HC && HC.w;
  const p = addPart(id, 'elec', name, b => W ? harnBuild(b, HC) : b.tube(pts, r, mat, HC ? pts.length : 32), { noCheck: true, shadow: false, pickR: 0.0035, abs: !!HC, pickPath: W ? HC.p : null, pickHR: r });
  CABLES.push({ id, name, from, to, fromName: A.name, toName: B.name, mat, color: COLOR_NAME[mat], gauge, why, tray: true });
  return p;
}
cabT('tc1', 'Fusible 15 A → relé COM', 'F15.out', 'R.COM', 'cRed', 0.0016, '14 AWG', 'La rama principal (motores) entra al contacto COM del relé.');
cabT('tc2', 'Relé NO → elevador IN+', 'R.NO', 'B.IN+', 'cRed', 0.0016, '14 AWG', 'Con el relé cerrado, los 12 V llegan al elevador que da los 18 V de las ruedas.');
cabT('tc3', 'Relé NO → J1 (12 V de los drivers)', 'R.NO', 'J1.+12V', 'cRed', 0.0012, '18 AWG', 'Del mismo contacto NO salen los 12 V de los A4988: el paro también los corta.');
cabT('tc5', 'XL4005 IN+ → J2 (12 V para medir)', 'X.IN+', 'J2.+12V AUX', 'cRed', 0.0008, '22 AWG', 'Solo para el divisor que mide la batería; casi no lleva corriente.', 0.008);
cabT('tc6', 'XL4005 OUT+ → J2 (+5 V)', 'X.OUT+', 'J2.+5V', 'cOra', 0.0010, '20 AWG', '5 V para el ESP32, el MAX485 y el servo. Ajusten antes el XL4005 a 5.0–5.1 V.', 0.008);
cabT('tc7', 'XL4005 OUT− → J2 (GND)', 'X.OUT-', 'J2.GND', 'cBlk', 0.0010, '20 AWG', 'Tierra de la lógica.', 0.008);
cabT('tc8', 'Elevador IN− → XL4005 IN− (GND común)', 'B.IN-', 'X.IN-', 'cBlk', 0.0014, '14 AWG', 'Todas las tierras unidas: batería −, elevador, XL4005, drivers y ESP32.');
cabT('tc9', 'Elevador IN− → J1 (GND de los drivers)', 'B.IN-', 'J1.GND', 'cBlk', 0.0012, '18 AWG', 'Regreso de la corriente de los 3 motores a pasos.');
cabT('tc10', 'XL4005 IN− → relé GND', 'X.IN-', 'R.GND', 'cBlk', 0.0008, '22 AWG', 'Tierra de la bobina del módulo relé.');
cabT('tc12', 'C24 · XL4005 IN+ → voltímetro (+)', 'X.IN+', 'V.+', 'cRed', 0.0007, '22 AWG', 'Rev. 3.17d: el voltímetro toma el voltaje después del KCD1, así se apaga con el carrito y no gasta batería.', 0.006);
cabT('tc13', 'C24 · voltímetro (−) → XL4005 IN−', 'V.-', 'X.IN-', 'cBlk', 0.0007, '22 AWG', 'Tierra del voltímetro.', 0.006);
cabT('tc11', 'Puente IN → VCC del relé', 'R.IN', 'R.VCC', 'cTin', 0.0005, 'alambre', 'La entrada IN se deja fija en el nivel que activa el relé (con el jumper en H, a VCC). Así el relé solo depende del paro.', 0.004);
tp('R.CI', 'Relé · COM de la entrada (terminal negativa)', -0.173, TY + 0.008, 0.060);
cabT('tc14', 'P12 · puente COM → GND del relé', 'R.CI', 'R.GND', 'cTin', 0.0006, 'alambre', 'Rev. 3.29: en el relé T90 de 12 V, COM es la terminal negativa de la entrada. Sin este puente la entrada no tiene regreso y el relé no cierra. Antes de ponerlo: COM no debe tener continuidad con DC+.', 0.004);
cabT('tc15', 'Puente entre las entradas de los 2 fusibles', 'F15.in', 'F10.in', 'cRed', 0.0012, '14 AWG', 'El positivo de la batería llega a los 2 portafusibles: 15 A (motores) y 5 A (lógica).', 0.004);
const TRAYCAB_IDS = CABLES.map(c => c.id);

// ============================================================ EN EL CARRITO (Etapa 13)
addPart('kcd1', 'elec', 'Interruptor KCD1', b => {
  b.prt('kcd1');                                                                            // recorte de 19 × 12.9 mm con pared de 2 mm para las pestañas
  b.stp('kcd1', { map: ['z', '-x', '-y'], al: ['o', 'c', 'c'], at: [-0.2495, 0.147, 0.080], col: { '#9aa3ad': 'black' } });   // la ceja apoya en la cara de afuera
  b.bb(-0.2636, -0.2626, 0.1425, 0.1515, 0.0745, 0.0855, 'red');                                    // marca roja del balancín
}, { nest: ['*pf'] });
addPart('estop', 'elec', 'Paro de emergencia LAY37', b => {
  b.prt('estop_b');                                                         // rev. 3.7: sale por detrás del travesaño (el cuerpo real no cabía encima)
  b.stp('estop', { at: [-0.276, 1.0025, 0.120] });                          // cuello de 2.5 mm en el rebaje de la placa; collarín arriba
}, { nest: ['*pf'] });
function vl53(b, x, y, z, nx, nz) {     // placa del sensor (STEP) mirando hacia (nx, 0, nz) o hacia abajo; su cara de atrás en el plano dado
  const col = { '#00ff00': 'pcbB' };
  if (nx === 0 && nz === 0) return b.stp('vl53', { map: ['z', '-y', 'x'], al: ['c', 'max', 'c'], at: [x, y, z], col });
  if (nx) return b.stp('vl53', { map: ['z', 'x', 'y'], al: [nx > 0 ? 'min' : 'max', 'c', 'c'], at: [x, y, z], col });
  return b.stp('vl53', nz > 0 ? { map: ['x', 'z', '-y'], al: ['c', 'c', 'min'], at: [x, y, z], col } : { map: ['x', '-z', 'y'], al: ['c', 'c', 'max'], at: [x, y, z], col });
}
addPart('vl_front', 'elec', 'VL53L0X frontal', b => {
  b.prt('vl_front');                                // 2 × M3 del sensor, ventana para el header y M6 al perfil
  vl53(b, 0.244, 0.150, 0, 1, 0);
}, { nest: ['*pf'] });
for (const s of [-1, 1]) {
  addPart('vl_side' + (s < 0 ? 'L' : 'R'), 'elec', 'VL53L0X lateral ' + (s < 0 ? 'izquierdo' : 'derecho'), b => {
    const z = (a, c) => [Math.min(s * a, s * c), Math.max(s * a, s * c)];
    b.prt('vl_side' + (s < 0 ? 'L' : 'R'));
    vl53(b, -0.150, 0.150, s * 0.200, 0, s);
  }, { nest: ['*pf'] });
}
addPart('vl_pile', 'elec', 'VL53L0X de la pila', b => {
  b.prt('vl_pile');                                 // cuelga del larguero de arriba con un M6
  vl53(b, 0.040, 0.955, 0.078, 0, 0);
}, { nest: ['*pf'] });
addPart('jet_plate', 'elec', 'Base impresa del Jetson', b => { b.add(meshG('jet_base'), 'P', 0, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001); b.add(meshG('jet_sop'), 'Pd', 0, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001); }, { nest: ['*pf'] });   // rev. 3.37b: impresa (sin MDF) + soporte trasero; 4 M6 al travesaño superior central
addPart('jetson', 'elec', 'Jetson Orin Nano Super', b => {
  b.stp('jetson', { map: ['z', 'x', 'y'], al: ['c', 'min', 'c'], at: [-0.150, D.HT + 0.006, -0.005] });   // puertos hacia atrás (−x)
}, { nest: ['jet_plate'] });
addPart('camera', 'elec', 'Cámara Logitech C920', b => {
  b.prt('cam_sup');                                 // repisa sobre el perfil de arriba al frente: 2 × M6, paredes, 2 cinchos y ranura 1/4"
  // STEP de Logitech (cuerpo, cristal y pie de clip), ya acomodado en coordenadas del carrito: pie plano sobre la repisa,
  // frente de la cámara en x = 254 mm mirando a +x (~6° hacia abajo, el ángulo con que viene el STEP)
  b.stpAt('c920', new THREE.Matrix4(), V3(), { col: { '#000021': '#1d1f22', '#000022': 'glass', '#000023': '#2a2c30' } });
}, { nest: ['*pf'] });

// ---------- cables del carrito (rev. 3.31: rutas reales del arnés en HARN; los puntos que siguen son las rutas viejas, ya sin uso)
function cablePart(id, name, mat, r, pts, info) {
  const HC = HARN.c[id]; if (HC) { pts = HC.p; r = HC.r; }
  const W = HC && HC.w;
  const p = addPart(id, 'elec', name, b => W ? harnBuild(b, HC) : b.tube(pts, r, mat, HC ? pts.length : Math.max(24, pts.length * 10)), { noCheck: true, shadow: false, pickR: 0.004, abs: !!HC, pickPath: W ? HC.p : null, pickHR: r });
  if (info) CABLES.push({ id, name, mat, color: COLOR_NAME[mat], ...info });
  return p;
}
const P3 = k => { const e = endP(k); return e.pos.toArray(); };
const yBat = 0.126 + D.BAT.h;
// XT60 acoplado sobre la orilla trasera de la batería: hembra del lado de la batería (+x), macho hacia la bandeja
const XT = { y: yBat + 0.030, zp: 0.00365, xf: -0.0725, xm: -0.1072 };
addPart('xt60', 'elec', 'Conector XT60 (hembra + macho)', b => {
  b.stp('xt60f', { map: ['x', 'y', 'z'], at: [-0.085, XT.y, 0.00145] });
  b.stp('xt60m', { map: ['-x', '-y', 'z'], at: [-0.0947, XT.y, 0.00145] });
}, { nest: ['bat', 'bat_hold'] });
cablePart('cab_bat', 'Batería + → XT60 → fusibles', 'cRed', 0.0022, [[-0.060, yBat + 0.014, 0.055], [-0.062, XT.y, 0.024], [-0.068, XT.y, XT.zp], [XT.xf, XT.y, XT.zp], [XT.xm, XT.y, XT.zp], [-0.114, XT.y, XT.zp], [-0.128, yBat, 0.060], [-0.150, TRAY.y + 0.02, 0.104], P3('F15.in')],
  { gauge: '14 AWG', ends: ['Batería · borne +', 'Fusibles 15 A y 5 A · entradas'], cond: [['rojo', 'Borne + (terminal de ojillo) → XT60 hembra; del macho, a la entrada de los 2 portafusibles']], why: 'El fusible va lo más cerca posible de la batería: si algo hace corto, se quema el fusible y no el cable.' });
cablePart('cab_batN', 'Batería − → GND común', 'cBlk', 0.0022, [[-0.060, yBat + 0.014, -0.055], [-0.062, XT.y, -0.024], [-0.068, XT.y, -XT.zp], [XT.xf, XT.y, -XT.zp], [XT.xm, XT.y, -XT.zp], [-0.114, XT.y, -XT.zp], [-0.150, yBat - 0.02, -0.020], [-0.215, TY + 0.03, 0.030], P3('B.IN-')],
  { gauge: '14 AWG', ends: ['Batería · borne −', 'Elevador · IN− (punto de tierra común)'], cond: [['negro', 'Borne − → XT60 → IN− del elevador, de donde salen las demás tierras']], why: 'Todas las tierras se unen en un solo punto.' });
cablePart('cab_kcd', 'KCD1 en la rama auxiliar', 'cRed', 0.0012, [P3('F10.out'), [-0.150, TRAY.y + 0.03, 0.118], [-0.240, 0.160, 0.110], [-0.252, 0.150, 0.080], [-0.240, 0.140, 0.050], [-0.170, TRAY.y + 0.03, -0.020], P3('X.IN+')],
  { gauge: '18 AWG', ends: ['Fusible 5 A · salida', 'Interruptor KCD1 → XL4005 · IN+'], cond: [['rojo', 'Fusible 5 A → una pata del KCD1'], ['rojo', 'Otra pata del KCD1 → IN+ del XL4005 (y de ahí Jetson, paro y medición)']], why: 'El KCD1 prende y apaga toda la lógica y el Jetson.' });
for (const s of [-1, 1]) {
  const side = s < 0 ? 'L' : 'R', lado = s < 0 ? 'izquierdo' : 'derecho';
  cablePart('cab_18_' + side, `Elevador → M0601 ${lado} (18 V)`, 'cOra', 0.0018, [P3('B.OUT+'), [-0.200, TRAY.y + 0.03, 0.128], [-0.105, 0.124, s * 0.135], [-0.02, 0.123, s * 0.150], [0.05, 0.112, s * 0.158], [0.068, 0.088, s * 0.159], [0.068, 0.0615, s * 0.161]],
    { gauge: '16–18 AWG', ends: ['Elevador · OUT+ / OUT−', `M0601 ${lado} · conector de potencia`], cond: [['naranja (+18 V)', 'OUT+ → pin 1 del conector de potencia'], ['negro', 'OUT− → pin 2']], why: 'Las ruedas trabajan a 18 V. Midan 18.0 V sin carga antes de conectar.' });
  cablePart('cab_485_' + side, `RS485 → M0601 ${lado}`, 'cLbl', 0.0011, [P3('J3.A'), [-0.150, 0.150, s * 0.110], [-0.03, 0.132, s * 0.140], [0.055, 0.110, s * 0.158], [0.072, 0.088, s * 0.159], [0.072, 0.0615, s * 0.161]],
    { gauge: '22 AWG trenzado', ends: ['J3 (A, B, GND)', `M0601 ${lado} · conector de señal`], cond: [['celeste', 'J3 A → pin 2 (A)'], ['verde limón', 'J3 B → pin 3 (B)'], ['negro', 'J3 GND → pin 1 (GND)']], why: 'Los 2 motores cuelgan del mismo bus: cada uno tiene su ID (1 y 2). Trencen A con B.' });
}
const motCab = (id, name, pts, j, who) => cablePart(id, name, 'cBlu', 0.0012, pts,
  { gauge: 'cable del motor (1 m)', ends: [`NEMA 17 ${who}`, `${j} (2B, 2A, 1A, 1B)`], cond: [['bobina A (p. ej. negro y verde)', `→ ${j} 1A y 1B`], ['bobina B (p. ej. rojo y azul)', `→ ${j} 2A y 2B`]],
    why: 'Busquen las bobinas con el multímetro: los 2 cables con ~1.5 Ω entre sí son una bobina. Si el motor gira al revés, volteen solo una bobina. Nunca se conecta con el driver prendido.' });
motCab('cab_nema_L', 'NEMA del elevador izquierdo → J7', [[0.183, 0.243, -0.188], [0.160, 0.215, -0.195], [0.0, 0.180, -0.150], [-0.150, 0.160, -0.120], [-0.250, TY + 0.02, -0.110], P3('J7.1A')], 'J7', 'del elevador izquierdo');
motCab('cab_nema_R', 'NEMA del elevador derecho → J8', [[0.183, 0.243, 0.188], [0.160, 0.215, 0.195], [0.0, 0.180, 0.150], [-0.150, 0.160, 0.060], [-0.250, TY + 0.02, -0.080], P3('J8.1A')], 'J8', 'del elevador derecho');
motCab('cab_pnema', 'NEMA del empujador → J9', [[-0.040, 0.913, 0.040], [-0.120, 0.95, 0.090], [-0.214, 0.90, 0.140], [-0.214, 0.40, 0.155], [-0.240, 0.20, 0.090], [-0.250, TY + 0.02, -0.050], P3('J9.1A')], 'J9', 'del empujador');
const fcCab = (id, name, pts, fc, who) => cablePart(id, name, 'cBei', 0.0010, pts,
  { gauge: '22 AWG (2 hilos)', ends: [`Final de carrera ${who}`, `J4 ${fc} y GND`], cond: [['beige', `NC del final → J4 ${fc}`], ['negro', 'COM del final → J4 GND de al lado'], ['—', 'NO: nada']], why: 'Siempre NC: si el cable se rompe, el ESP32 lo ve como "presionado" y se detiene en lugar de chocar.' });
fcCab('cab_lsw_L', 'Final de carrera izquierdo → J4', [[0.183, 0.355, -0.196], [0.195, 0.330, -0.198], [0.120, 0.230, -0.180], [-0.100, 0.170, -0.120], [-0.110, TY + 0.02, -0.070], P3('J4.FC1')], 'FC1', 'del elevador izquierdo');
fcCab('cab_lsw_R', 'Final de carrera derecho → J4', [[0.183, 0.355, 0.196], [0.195, 0.330, 0.198], [0.120, 0.230, 0.180], [-0.100, 0.170, 0.090], [-0.110, TY + 0.02, -0.030], P3('J4.FC2')], 'FC2', 'del elevador derecho');
fcCab('cab_lsw_P', 'Final de home del empujador → J4', [[-0.281, 0.885, 0.072], [-0.270, 0.95, 0.120], [-0.236, 0.90, 0.150], [-0.236, 0.40, 0.150], [-0.120, 0.20, 0.080], [-0.110, TY + 0.02, -0.025], P3('J4.FC3')], 'FC3', 'de home del empujador');
cablePart('cab_servo', 'Servo de la uña → J11 (tramo fijo)', 'cOra', 0.0011, [[-0.0165, 0.884, -0.020], [-0.030, 0.890, -0.030], [-0.050, 0.955, -0.040], [-0.120, 0.975, -0.070], [-0.180, 0.930, -0.090], [-0.214, 0.880, -0.120], [-0.214, 0.40, -0.150], [-0.150, 0.20, -0.120], [-0.110, TY + 0.02, -0.085], P3('J11.SIG')],
  { gauge: 'cable del servo + extensión', ends: ['MG90S', 'J11 (GND, +5V, SIG)'], cond: [['café', 'J11 GND'], ['rojo', 'J11 +5V'], ['naranja', 'J11 SIG (GPIO 5)']], why: 'El carro se mueve 25 cm: el cable necesita una curva floja de ~30 cm o se jala.' });
cablePart('cab_i2c', 'VL53L0X de la pila → J5', 'cYel', 0.0010, [[0.040, 0.958, 0.090], [0.040, 0.990, 0.150], [-0.050, 1.000, 0.160], [-0.214, 0.95, 0.160], [-0.214, 0.40, 0.160], [-0.120, 0.20, 0.100], [-0.110, TY + 0.02, -0.030], P3('J5.SDA')],
  { gauge: '22 AWG (4 hilos)', ends: ['VL53L0X de la pila', 'J5 (3V3, GND, SDA, SCL)'], cond: [['rosa', 'VIN → J5 3V3'], ['negro', 'GND → J5 GND'], ['amarillo', 'SDA → J5 SDA'], ['blanco', 'SCL → J5 SCL'], ['—', 'XSHUT: sin conectar (este sensor no se apaga)'], ['—', 'GPIO1: nada']], why: 'Es el cable I²C más largo (~1 m): lejos de los cables de motores y de potencia. No lleva XSHUT: al arrancar es el único prendido y es el primero al que se le cambia la dirección (0x33).' });
addPart('cab_servo_loop', 'elec', 'Servo de la uña: tramo que viaja con el carro', b => { DYN_RIB(HARN.servo, { push: 0.008 }).forEach((pts, i) => b.items.push({ geo: wireGeo(pts, HARN.servo.w[i][1]), mat: HARN.servo.w[i][0], m: new THREE.Matrix4() })); },
  { noCheck: true, shadow: false, pickR: 0.004, abs: true, mount: 'sloop', pivot: [0, 0, 0], pickPath: DYN_LOOP(HARN.servo, { push: 0.008 }), pickHR: 0.001 });
CABLES.push({ id: 'cab_servo_loop', name: 'Servo de la uña: tramo que viaja con el carro', mat: 'cOra', color: COLOR_NAME['cOra'], gauge: 'cable del servo + extensión', ends: ['MG90S (en el carro)', 'Ancla en la columna del soporte trasero'],
  cond: [['café', 'GND'], ['rojo', '+5 V'], ['naranja', 'señal']], why: 'El carro avanza 25 cm. El cable va cinchado al costado de la cremallera hasta la cola del carro y de ahí cuelga en un lazo de ~28 cm hasta la columna izquierda del soporte trasero: el lazo se abre y se cierra sin jalar el servo ni tocar la pila.' });
const vlCab = (id, name, who, xs, pts) => cablePart(id, name, 'cYel', 0.0010, pts,
  { gauge: '22 AWG (5 hilos)', ends: [`VL53L0X ${who}`, `J5 (bus en común) y J6 ${xs}`], cond: [['rosa', 'VIN → J5 3V3'], ['negro', 'GND → J5 GND'], ['amarillo', 'SDA → J5 SDA'], ['blanco', 'SCL → J5 SCL'], ['verde olivo', `XSHUT → J6 ${xs} (GPIO ${{ X0: 32, X1: 33, X2: 15 }[xs]})`], ['—', 'GPIO1: nada']],
    why: 'Los 4 sensores comparten SDA y SCL (en J5 van varios hilos por terminal); los 3 de obstáculos tienen su propio XSHUT, directo a un GPIO del ESP32.' });
vlCab('cab_i2cF', 'VL53L0X frontal → J5 y J6', 'frontal', 'X0', [[0.240, 0.150, 0.004], [0.200, 0.135, 0.010], [0.0, 0.130, 0.060], [-0.090, 0.140, 0.020], [-0.110, TY + 0.02, -0.040], P3('J6.X0')]);
vlCab('cab_i2cL', 'VL53L0X lateral izquierdo → J5 y J6', 'lateral izquierdo', 'X1', [[-0.150, 0.150, -0.198], [-0.150, 0.170, -0.175], [-0.120, 0.165, -0.120], [-0.110, TY + 0.025, -0.060], P3('J6.X1')]);
vlCab('cab_i2cR', 'VL53L0X lateral derecho → J5 y J6', 'lateral derecho', 'X2', [[-0.150, 0.150, 0.198], [-0.150, 0.170, 0.175], [-0.120, 0.165, 0.080], [-0.110, TY + 0.025, -0.010], P3('J6.X2')]);
cablePart('cab_jet', 'Rama auxiliar → Jetson (12 V)', 'cRed', 0.0016, [P3('X.IN+'), [-0.200, TRAY.y + 0.03, -0.040], [-0.238, 0.20, 0.150], [-0.238, 0.80, 0.150], [-0.205, 1.03, 0.130], [-0.200, D.HT + 0.012, 0.010]],
  { gauge: '18 AWG + plug 5.5 × 2.5 mm', ends: ['XL4005 · IN+ (12 V después del KCD1)', 'Jetson · plug de alimentación'], cond: [['rojo', '+12 V → centro del plug'], ['negro', 'GND → exterior del plug']], why: 'Midan con el multímetro que el centro del plug sea + antes de conectarlo.' });
cablePart('cab_stop', 'Paro (NC) → VCC del relé', 'cRed', 0.0011, [P3('X.IN+'), [-0.200, TRAY.y + 0.03, 0.020], [-0.236, 0.40, 0.156], [-0.236, 1.00, 0.150], [-0.262, 0.992, 0.128], [-0.276, 1.0025, 0.120], [-0.262, 0.992, 0.112], [-0.236, 1.00, 0.140], [-0.236, 0.40, 0.140], [-0.200, TRAY.y + 0.03, 0.045], TP['R.VCC'].pos.toArray()],
  { gauge: '20–22 AWG (2 hilos)', ends: ['12 V aux → paro LAY37 (contacto NC)', 'Relé · VCC'], cond: [['rojo', '12 V aux → una terminal NC del paro'], ['rojo', 'Otra terminal NC → VCC del módulo relé']], why: 'Al apretar el paro, el relé se queda sin energía y corta motores y drivers, aunque el programa esté colgado.' });
cablePart('cab_usb', 'USB Jetson ↔ ESP32', 'cWht', 0.0014, [[-0.198, D.HT + 0.011, -0.030], [-0.232, 1.00, -0.150], [-0.232, 0.40, -0.156], [-0.230, 0.20, -0.135], [bx(44.5), BRD.y + 0.012, bz(-6)], [bx(44.5), MOD0 + 0.003, bz(1)]],
  { gauge: 'micro USB de datos', ends: ['Jetson · puerto USB', 'ESP32 · micro USB'], cond: [['—', 'Cable de datos (los de solo carga no sirven)'], ['rojo (VBUS)', 'Cortado y aislado con termofit: el ESP32 se alimenta solo del XL4005; así los 5 V del Jetson y los del XL4005 no se pelean']], why: 'Por aquí el Jetson manda las órdenes y el ESP32 reporta. Si se desconecta, el watchdog detiene las ruedas en 1 s.' });
fcCab('cab_lsw_U', 'Final de carrera superior → J13', [[0.190, 0.850, 0.196], [0.205, 0.850, 0.199], [0.205, 0.330, 0.199], [0.120, 0.230, 0.180], [-0.100, 0.170, 0.090], [-0.110, TY + 0.02, 0.0], P3('J13.FC4')], 'FC4', 'superior (tope)');
{ const c = CABLES.find(c => c.id === 'cab_lsw_U'); if (c) { c.ends = ['Final de carrera superior (tope, lado derecho)', 'J13 FC4 y GND4']; c.cond = [['beige', 'NC del final → J13 FC4 (GPIO 35)'], ['negro', 'COM del final → J13 GND4'], ['—', 'NO: nada']]; } }
cablePart('cab_paro', 'VCC del relé → J13 PARO (lectura del paro)', 'cRed', 0.0010, [TP['R.VCC'].pos.toArray(), [-0.190, TRAY.y + 0.03, 0.040], [-0.150, TY + 0.02, 0.022], P3('J13.PARO')],
  { gauge: '22 AWG', ends: ['Relé · VCC (después del paro)', 'J13 · PARO'], cond: [['rojo', 'VCC del relé → J13 PARO (de ahí al divisor 100 k / 20 k y al GPIO 34)']], why: 'El ESP32 se entera de que apretaron el paro: deja la velocidad en 0, suelta los motores y pide REARME y home antes de moverse otra vez. El corte de energía lo sigue haciendo el relé, no el programa.' });
cablePart('cab_i2cbus', 'Empalme del bus I²C → J5', 'cYel', 0.0010, [[-0.121, 0.174, -0.069], [-0.153, 0.157, -0.069]],
  { gauge: '22 AWG (4 hilos) + termofit de 8 mm', ends: ['Empalme en estrella de los 4 VL53L0X (bajo el termofit grande)', 'J5 (3V3, GND, SDA, SCL), un hilo por borne'],
    cond: [['rosa', '3V3 de los 4 sensores → J5 3V3'], ['negro', 'GND de los 4 → J5 GND'], ['amarillo', 'SDA de los 4 → J5 SDA'], ['blanco', 'SCL de los 4 → J5 SCL']],
    why: 'Los 4 VL53L0X comparten el bus. En vez de meter 4 hilos delgados en cada borne de J5 (no aprietan bien y uno se sale), los hilos iguales se tuercen, se sueldan y se cubren con termofit; de cada empalme sale un solo hilo a J5. Cada empalme lleva su termofit chico y los 4 van juntos bajo uno grande.' });
// rev. 3.32: cómo se conecta cada cable en la realidad (conector de cada componente)
{
  const U = {
    cab_nema_L: { gauge: 'cable de fábrica del 17HS4401 (1 m): clavija JST-PH de 6 pines, 4 hilos', ends: ['NEMA 17 del elevador izquierdo · clavija blanca JST-PH (pines 1, 3, 4, 6)', 'J7 · punteras (2B, 2A, 1A, 1B)'] },
    cab_nema_R: { gauge: 'cable de fábrica del 17HS4401 (1 m): clavija JST-PH de 6 pines, 4 hilos', ends: ['NEMA 17 del elevador derecho · clavija blanca JST-PH (pines 1, 3, 4, 6)', 'J8 · punteras (2B, 2A, 1A, 1B)'] },
    cab_pnema: { gauge: 'cable de fábrica (1 m) + extensión de ~60 cm: clavija JST-PH de 6 pines, 4 hilos', ends: ['NEMA 17 del empujador · clavija blanca JST-PH', 'J9 · punteras (2B, 2A, 1A, 1B)'] },
    cab_485_L: { gauge: 'cable ZH1.5 de 4 pines (15 cm) + 26 AWG', ends: ['M0601 izquierdo · coleta del motor con conector ZH1.5 de 4 pines (señal)', 'J3 · punteras dobles (comparte A, B y GND con el motor derecho)'] },
    cab_485_R: { gauge: 'cable ZH1.5 de 4 pines (15 cm) + 26 AWG', ends: ['M0601 derecho · coleta del motor con conector ZH1.5 de 4 pines (señal)', 'J3 · punteras dobles (comparte A, B y GND con el motor izquierdo)'] },
    cab_18_L: { gauge: 'cable XH2.54 de 2 pines (20 cm) + 18 AWG', ends: ['Elevador · OUT+ / OUT− (punteras dobles con el motor derecho)', 'M0601 izquierdo · conector XH2.54 de 2 pines (potencia)'] },
    cab_18_R: { gauge: 'cable XH2.54 de 2 pines (20 cm) + 18 AWG', ends: ['Elevador · OUT+ / OUT− (punteras dobles con el motor izquierdo)', 'M0601 derecho · conector XH2.54 de 2 pines (potencia)'] },
    cab_servo: { gauge: 'cinta del MG90S (café, rojo, naranja) + extensión con conector JR', ends: ['Conector JR del servo + extensión, en el ancla del soporte trasero', 'J11 · carcasa Dupont de 3 en el header (GND, +5V, SIG)'] },
    cab_i2c: { gauge: '26 AWG (4 hilos)', ends: ['VL53L0X de la pila · hilos soldados a sus pads (arriba está su soporte y a un lado la placa de unión: no cabe header)', 'Empalme del bus I²C junto a J5'] },
    cab_i2cF: { gauge: '26 AWG (5 hilos) con Dupont hembra', ends: ['VL53L0X frontal · 5 carcasas Dupont en el header recto (pasan por la ventana del soporte)', 'XSHUT → J6 X0 (puntera) · VIN, GND, SDA, SCL → empalme del bus'] },
    cab_i2cL: { gauge: '26 AWG (5 hilos) con Dupont hembra', ends: ['VL53L0X lateral izquierdo · Dupont en header a 90°, por fuera de la placa', 'XSHUT → J6 X1 (puntera) · VIN, GND, SDA, SCL → empalme del bus'] },
    cab_i2cR: { gauge: '26 AWG (5 hilos) con Dupont hembra', ends: ['VL53L0X lateral derecho · Dupont en header a 90°, por fuera de la placa', 'XSHUT → J6 X2 (puntera) · VIN, GND, SDA, SCL → empalme del bus'] },
    cab_lsw_L: { ends: ['Final de carrera izquierdo · patas C y NC soldadas, con termofit', 'J4 FC1 y GND1 (punteras)'] },
    cab_lsw_R: { ends: ['Final de carrera derecho · patas C y NC soldadas, con termofit', 'J4 FC2 y GND2 (punteras)'] },
    cab_lsw_P: { ends: ['Final de home del empujador · patas C y NC soldadas, con termofit', 'J4 FC3 y GND3 (punteras)'] },
    cab_lsw_U: { ends: ['Final de carrera superior · patas C y NC soldadas, con termofit', 'J13 FC4 y GND4 (punteras)'] },
    cab_stop: { gauge: '20–22 AWG (2 hilos rojos)', ends: ['XL4005 IN+ (soldado) → borne de abajo del bloque NC del paro (puntera)', 'Otro borne del bloque NC → VCC del relé (puntera doble con el cable de J13 PARO)'] },
    cab_jet: { gauge: '18 AWG rojo y negro, trenzados, con plug 5.5 × 2.5 mm', ends: ['XL4005 · IN+ (rojo) e IN− (negro), soldados', 'Jetson · plug de alimentación 5.5 × 2.5 mm'], cond: [['rojo', 'IN+ del XL4005 (12 V después del KCD1) → centro del plug'], ['negro', 'IN− del XL4005 → exterior del plug']] },
    cab_usb: { ends: ['Jetson · USB-A', 'ESP32 · micro USB (el ESP32 va de cabeza: el conector queda abajo, en la orilla de la placa)'] },
    cab_bat: { ends: ['Batería · lengüeta + (faston hembra con forro azul)', 'Portafusibles en línea de 15 A y 5 A · entra por su capuchón'] },
    cab_batN: { ends: ['Batería · lengüeta − (faston hembra con forro azul)', 'Elevador · IN− (puntera triple: batería, XL4005 y J1)'] },
    cab_kcd: { ends: ['Portafusibles de 5 A · salida', 'KCD1 (2 patas soldadas, con termofit) → pad IN+ del XL4005'], cond: [['rojo', 'Salida del portafusibles de 5 A → pata 1 del KCD1'], ['rojo', 'Pata 2 del KCD1 → pad IN+ del XL4005']] },
  };
  const WHY = {
    cab_lsw_L: 'En el dibujo, C es la pata de la orilla del lado de la bisagra y NC la de en medio: guíense por las letras grabadas en el switch. ', cab_lsw_R: 'C y NC: guíense por las letras grabadas en el switch. ', cab_lsw_P: 'C y NC: guíense por las letras grabadas en el switch. ', cab_lsw_U: 'C y NC: guíense por las letras grabadas en el switch. ',
    cab_kcd: 'Las patas del KCD1 quedan a ~1 mm del capacitor grande del elevador: los hilos se sueldan y salen hacia arriba, con termofit; un faston recto no cabe. ',
    cab_pnema: 'El cable de fábrica mide 1 m y la ruta ~1.5 m: lleva una extensión de 4 hilos (empalme soldado con termofit). ',
    cab_servo: 'El cable del MG90S mide ~25 cm: la unión JR con la extensión queda fija en el ancla, no en el lazo que se mueve. ',
  };
  for (const [id, u] of Object.entries(U)) { const c = CABLES.find(c => c.id === id); if (c) Object.assign(c, u); }
  for (const [id, w] of Object.entries(WHY)) { const c = CABLES.find(c => c.id === id); if (c) c.why = w + (c.why || ''); }
}
addPart('zt_all', 'elec', 'Cinchos (corbatas) del arnés', b => {
  for (const t of HARN.ties) { b.tube(t, 0.00055, 'black', 28, true); const [x, y, z] = t[1]; b.bb(x - 0.0016, x + 0.0016, y - 0.0016, y + 0.0016, z - 0.0021, z + 0.0021, 'black'); }
}, { noCheck: true, shadow: false, abs: true });
const CARTCAB_IDS = CABLES.filter(c => !c.tray).map(c => c.id);


// ============================================================ ESTACIÓN DE CARGA (banda)
const DOCK = D.PANX + 0.003;                 // 0.253: cara de la tapa con el carrito acoplado (rev. 3.38: sin panel, los postes pegan en los topes a 3 mm)
const SLOPE = 15 * Math.PI / 180;            // mesa inclinada: ~12–15° con melamina (se ajusta con la cuña)
function funnelAndAruco(b, label) {   // rev. 3.14: sin embudo en el piso; solo el poste del ArUco
  b.bb(0.345, 0.365, 0, 0.50, 0.29, 0.31, 'alu');
}
// Acople a la banda (rev. 3.14, acople.py): 2 travesaños 3030 bajo el bastidor + 2 rieles 3030 por fuera, guías de entrada
// impresas (V de 50 mm → canal recto con 0.75 mm de juego por lado contra la cara de afuera de los postes delanteros) y 2 topes
// impresos donde pegan los postes delanteros del carrito (rev. 3.38: sin panel; 3 mm de la tapa).
function dockKit(b) {
  return;   // rev. 3.39: el acople se dibuja con las 5 piezas st_ac_* (se arman en el capítulo E15)
  // rev. 3.33 (11-nov): acople con 2 brazos de 3030 sobrante (443 der., 370 izq.) atornillados al costado del bastidor con una calza
  // impresa (2 × M6 × 80), y encima de cada brazo una guía impresa: V de 50 mm, canal con 0.75 mm de juego y tope a 3 mm de la tapa.
  let DX = 0.256; try { DX = DOCK; } catch (e) {}
  try {
  Object.assign(MESH, {"acG_der":{"o":[-76.0,732.0,237.0],"p":"sB1Q+zvysB1Q+/wIBN5Q+/wIBN5Q+5/ypP5Q+5/yAABQ+9fxhBxQ+9fxhBxQ+5zmeB5Q+5zmeB5Q+zvy0O5Q+2AEZe9Q+zsE1+9Q+9YDDvBQ+0cD++9Q+68CpO9Q+zACHe9Q++kBg+5Q++kB/O1Q+zACpe1Q+68Cku1Q+0cDye1Q+9YDO+5Q+zsEQAZQ+2AE1QZQ+zsERwdQ+9YDfgdQ+0cDawdQ+68CFAdQ+zACjQZQ++kB8wVQ++kBbAVQ+zACFQVQ+68CAgVQ+0cDOQVQ+9YDqwVQ+zsE1BdQ+2AEaRhQ+zsE2xhQ+9YDEhlQ+0cD/xhQ+68CqBhQ+zACIRhQ++kBhxdQ++kBABdQ+zACqRZQ+68ClhZQ+0cDzRZQ+9YDPxdQ+zsEsB1Q+zvysB1Q+/wIsB0IBzvysB0IB/wIsB0IBzvyeB4IBzvysB1Q+zvyeB5Q+zvyXOBw/vwI0O5w/vwIXOAIB/wIBN4IB/wIBN5Q+/wIsB1Q+/wIsB0IB/wIWBsIB/wIWBtw/vwImAhw/vwImAgIB/wIQAYIB/wIQAZw/vwIKPFw/vwIKPEIB/wI0O4IB/wIeB5Q+5zmeB5Q+zvyeB4IB5zmeB4IBzvyBN5Q+/wIBN5Q+5/yBN4IB/wIBN4IB2oEBN5w/moEBN5w/p/yhBxQ+5zmhBwIB5zmeB5Q+5zmeB4IB5zmBN5w/p/ypP5w/p/yBN5Q+5/ypP5Q+5/yhBxQ+5zmhBxQ+9fxhBwIB5zmhBwIB9fxevBw/sP6pP5w/p/yevAIB8P6AAAIB9fxAABQ+9fxpP5Q+5/yAABQ+9fxhBxQ+9fxAAAIB9fxhBwIB9fx0O5Q+2AE0O5w/mAE0O5w/mAEZe9w/jsE1+9w/tYDDvBw/kcD++9w/q8CpO9w/jACHe9w/ukBg+5w/ukB/O1w/jACpe1w/q8Cku1w/kcDye1w/tYDO+5w/jsE0O5Q+2AEZe9Q+zsE1+9Q+9YDDvBQ+0cD++9Q+68CpO9Q+zACHe9Q++kBg+5Q++kB/O1Q+zACpe1Q+68Cku1Q+0cDye1Q+9YDO+5Q+zsEQAZQ+2AEQAZw/mAEQAZw/mAE1QZw/jsERwdw/tYDfgdw/kcDawdw/q8CFAdw/jACjQZw/ukB8wVw/ukBbAVw/jACFQVw/q8CAgVw/kcDOQVw/tYDqwVw/jsEQAZQ+2AE1QZQ+zsERwdQ+9YDfgdQ+0cDawdQ+68CFAdQ+zACjQZQ++kB8wVQ++kBbAVQ+zACFQVQ+68CAgVQ+0cDOQVQ+9YDqwVQ+zsE1Bdw/mAEaRhw/jsE2xhw/tYDEhlw/kcD/xhw/q8CqBhw/jACIRhw/ukBhxdw/ukBABdw/jACqRZw/q8ClhZw/kcDzRZw/tYDPxdw/jsE1Bdw/mAE1BdQ+2AEaRhQ+zsE2xhQ+9YDEhlQ+0cD/xhQ+68CqBhQ+zACIRhQ++kBhxdQ++kBABdQ+zACqRZQ+68ClhZQ+0cDzRZQ+9YDPxdQ+zsE1BdQ+2AE0O4IB/P9XOAIB1oGXOAIB/wIBN4IB/wIBN4IB2oErt8IB2oE0O4IB7j70O4IB8P6evAIB8P6AAAIB9fxhBwIB9fxhBwIB5zmeB4IB5zmeB4IBzvysB0IBzvysB0IB/wIWBsIB/wIWBsIBy/0mAgIBy/0mAgIB/wIQAYIB/wIQAYIB18FOQcIByYFAggIB4cEcQgIB6ADcQgIB6ACAggIB7kBOQcIBxoBQAYIB+EAQAYIBy/0nP8IBy/0KPEIB5b8KPEIB/wI0O4IB/wI0O4IB18Fye8IByYFkvAIB4cEAfEIB6ADAfEIB6ACkvAIB7kBye8IBxoB0O4IB+EAXOBw/vwIXOBw/loG0O5w/vwI0O5w/l8Fye9w/iYFkvBw/ocEAfFw/qADAfFw/qACkvBw/rkBye9w/hoB0O5w/uEA0O5w/vP90O5w/mAEZe9w/jsE1+9w/tYDDvBw/kcD++9w/q8CpO9w/jACHe9w/ukBg+5w/ukB/O1w/jACpe1w/q8Cku1w/kcDye1w/tYDO+5w/jsEXOBw/vwIXOAIB/wIXOBw/loGXOAIB1oGWBtw/vwIWBsIB/wIWBtw/i/0WBsIBy/0WBtw/vwIWBtw/i/0mAhw/i/0mAhw/vwI1Bdw/mAEaRhw/jsE2xhw/tYDEhlw/kcD/xhw/q8CqBhw/jACIRhw/ukBhxdw/ukBABdw/jACqRZw/q8ClhZw/kcDzRZw/tYDPxdw/jsEmAhw/vwImAgIB/wImAhw/i/0mAgIBy/0QAZw/vwIQAYIB/wIQAZw/l8FQAYIB18FKPFw/vwIKPFw/pb8QAZw/vwIQAZw/l8FOQdw/iYFAghw/ocEcQhw/qADcQhw/qACAghw/rkBOQdw/hoBQAZw/uEAQAZw/i/0nP9w/i/0QAZw/mAE1QZw/jsERwdw/tYDfgdw/kcDawdw/q8CFAdw/jACjQZw/ukB8wVw/ukBbAVw/jACFQVw/q8CAgVw/kcDOQVw/tYDqwVw/jsEKPFw/vwIKPEIB/wIKPFw/pb8KPEIB5b80O5w/vwI0O4IB/wI0O5w/l8F0O4IB18FBN5w/moEBN4IB2oErt9w/moErt8IB2oEBN5w/p/ypP5w/p/yBN5w/moErt9w/moE0O5w/rj70O5w/sP6evBw/sP60O5w/sP60O4IB8P6evBw/sP6evAIB8P60O5w/vP9XOBw/loG0O4IB/P9XOAIB1oG0O4IB/P90O4IB+EA0O5w/uEA0O5w/vP90O4IB18Fye8IByYFkvAIB4cEAfEIB6ADAfEIB6ACkvAIB7kBye8IBxoB0O4IB+EA0O5w/l8Fye9w/iYFkvBw/ocEAfFw/qADAfFw/qACkvBw/rkBye9w/hoB0O5w/uEAnP9w/i/0KPFw/pb8nP8IBy/0KPEIB5b8QAZw/i/0nP9w/i/0QAYIBy/0nP8IBy/0QAYIBy/0QAYIB+EAQAZw/uEAQAZw/i/0QAYIB18FOQcIByYFAggIB4cEcQgIB6ADcQgIB6ACAggIB7kBOQcIBxoBQAYIB+EAQAZw/l8FOQdw/iYFAghw/ocEcQhw/qADcQhw/qACAghw/rkBOQdw/hoBQAZw/uEAWBtw/i/0mAhw/i/0WBsIBy/0mAgIBy/00O5w/rj70O5w/sP60O4IB8P60O4IB7j7rt9w/moE0O5w/rj7rt8IB2oE0O4IB7j7","i":"FgACABUAFAAVAAIACgACABYAEwAUAAIAAwATAAIAEgATAAMAEQASAAMAIgAMAA0AIwALAAwAIwAMACIAIQAiAA0AFwAKAAsAFwALACMAIAANAA4AIAAhAA0ABAAOAA8ABAAPABAABAAQABEABAAeAB8ABAAfACAABAARAAMABAAgAA4ABQAcAB0ABQAdAB4ABQAeAAQALwAYABkAMAAYAC8ALgAvABkALgAZABoALQAaABsALQAbABwALQAuABoAAQAYADAAAQAXABgAAQAkACUAAQAwACQALAAtABwAJgABACUAJwABACYAKAABACcABgAsABwABgAqACsABgArACwABgAcAAUAAAAqAAYAAAApACoACQAAAAYACAAGAAcACAAJAAYAAAABACgAAAAoACkAAQACAAoAAQAKABcAMgAxADMAMgAzADQANgA1ADcANgA3ADgAPAA9ADkAOwA8ADkAOgA5AD0ARgA6AD0ARwBIADoARwA6AEYARQBGAD0AQwBEAEUAQwBFAEIAPgBFAD0APgBCAEUAQQBCAD4APwBAAEEAPwBBAD4ASQBLAEwASgBJAEwAUQBNAE8AUQBPAFAATgBRAFIATgBNAFEAVgBTAFQAVgBVAFMAWgBZAFcAWABaAFcAXABdAFsAXABeAF0AYABfAGEAYABhAGIAYwBkAGAAYwBgAGIAaABlAGcAZgBlAGgAbAB4AGsAbAB5AHgAbQB6AHkAbQB7AHoAbQB5AGwAbgB7AG0AbwB8AHsAbwB7AG4AcAB9AHwAcAB8AG8AcQB+AH0AcQB/AH4AcQB9AHAAcgB/AHEAcwCAAH8AcwB/AHIAdACBAIAAdACAAHMAdQCCAIEAdQCDAIIAdQCBAHQAdgCDAHUAdwCEAIMAdwCDAHYAagBpAIQAagCEAHcAiACUAIcAiACVAJQAiQCWAJUAiQCXAJYAiQCVAIgAigCXAIkAiwCYAJcAiwCXAIoAjACZAJgAjACYAIsAjQCaAJkAjQCbAJoAjQCZAIwAjgCbAI0AjwCcAJsAjwCbAI4AkACdAJwAkACcAI8AkQCeAJ0AkQCfAJ4AkQCdAJAAkgCfAJEAkwCgAJ8AkwCfAJIAhgCFAKAAhgCgAJMAogCvAKEAogCwAK8AowCxALAAowCyALEAowCwAKIApACyAKMApQCzALIApQCyAKQApgC0ALMApgCzAKUApwC1ALQApwC2ALUApwC0AKYAqAC2AKcAqQC3ALYAqQC2AKgAqgC4ALcAqgC3AKkAqwC5ALgAqwC6ALkAqwC4AKoArAC6AKsArQC7ALoArQC6AKwArgC8ALsArgC7AK0AvgDAAL8AvgDBAMAAwgDBAL4A4ADeAN0A4ADfAN4A4QDgAN0A4gDhAN0AvQDmAOUAwwDCAL0A3ADkAOMA3ADlAOQA3AC9AOUA3ADDAL0AxQDEAMMAxQDDANwA0wDRANAA0wDSANEA1ADTANAA1QDUANAA2wDFANwAxgDFANsA2gDGANsAzwDGANoAzwDYANcAzwDZANgAzwDaANkAzgDNAMwAxwDPAM4AywDHAM4AygDHAMsAyQDIAMcAyQDHAMoAvQDCAL4AxgDPAMcAywDOAMwAzwDVANAAzwDWANUAzwDXANYA3ADiAN0A3ADjAOIA+wDxAPIA/ADyAOgA/AD7APIA+gDxAPsA/QD8AOgA+QDwAPEA+QDxAPoA/gDoAOcA/gD9AOgA+ADwAPkA7wDwAPgA9wDvAPgA7gD3APYA7gDvAPcA6gD/AP4A6gDzAP8A7QD2APUA7QDuAPYA6wD0APMA6wDzAOoA7AD1APQA7ADtAPUA7AD0AOsA6QD+AOcA6QDqAP4AAgEDAQEBAAECAQEBBAEHAQYBBAEFAQcBFAEJAQoBFQEKAQsBFQEUAQoBEwEJARQBFgEVAQsBEgEJARMBFwEWAQsBEQEJARIBGAEXAQsBEAEJAREBCAENAQwBCAEOAQ0BCAEPAQ4BCAEMARgBCAEYAQsBCAEJAQ8BDwEJARABGQEbARwBGQEcARoBHwEeASABHQEeAR8BKwEsAS0BNgErAS0BNwEtASIBNwE2AS0BNQErATYBOAEiASEBOAE3ASIBNAEqASsBNAErATUBOQE4ASEBMwEqATQBKQEqATMBMgEpATMBKAEyATEBKAEpATIBJAE6ATkBJAEuAToBJwExATABJwEoATEBJQEvAS4BJQEuASQBJgEwAS8BJgEvASUBJgEnATABIwE5ASEBIwEkATkBPAE9AT4BOwE9ATwBQQFAAUIBPwFAAUEBRgFDAUQBRgFFAUMBSgFHAUkBTAFHAUoBSwFMAUoBSAFMAU0BSAFHAUwBUQFOAU8BUQFQAU4BUwFSAVQBUwFUAVUBWAFXAVYBWAFWAVkBWwFiAVoBWwFjAWIBXAFkAWMBXAFjAVsBXQFlAWQBXQFkAVwBXgFmAWUBXgFnAWYBXgFlAV0BXwFnAV4BYAFoAWcBYAFnAV8BYQFpAWgBYQFoAWABawFqAWwBawFsAW0BbwFuAXABbwFwAXEBdAFzAXIBdAFyAXUBdwF+AXYBdwF/AX4BeAGAAX8BeAF/AXcBeQGBAYABeQGAAXgBegGCAYEBegGDAYIBegGBAXkBewGDAXoBfAGEAYMBfAGDAXsBfQGFAYQBfQGEAXwBhwGGAYgBhwGIAYkBigGMAYsBigGNAYwBkQGOAZABjwGOAZEB","i32":false,"n":340},"acG_izq":{"o":[-76.0,732.0,-237.0],"p":"sB1Q+8UNsB1Q+wT3BN5Q+wT3BN5Q+2ENpP5Q+2ENAABQ+ykOhBxQ+ykOhBxQ+2QZeB5Q+2QZeB5Q+8UN0O5Q+6D7Ze9Q+8X71+9Q+yr8DvBQ+7n8++9Q+1H9pO9Q+9D9He9Q+xf+g+5Q+xf+/O1Q+9D9pe1Q+1H9ku1Q+7n8ye1Q+yr8O+5Q+8X7QAZQ+6D71QZQ+8X7RwdQ+yr8fgdQ+7n8awdQ+1H9FAdQ+9D9jQZQ+xf+8wVQ+xf+bAVQ+9D9FQVQ+1H9AgVQ+7n8OQVQ+yr8qwVQ+8X71BdQ+6D7aRhQ+8X72xhQ+yr8EhlQ+7n8/xhQ+1H9qBhQ+9D9IRhQ+xf+hxdQ+xf+ABdQ+9D9qRZQ+1H9lhZQ+7n8zRZQ+yr8PxdQ+8X7sB1Q+8UNsB1Q+wT3sB0IB8UNsB0IBwT3sB0IB8UNeB4IB8UNsB1Q+8UNeB5Q+8UNXOBw/gT30O5w/gT3XOAIBwT3BN4IBwT3BN5Q+wT3sB1Q+wT3sB0IBwT3WBsIBwT3WBtw/gT3mAhw/gT3mAgIBwT3QAYIBwT3QAZw/gT3KPFw/gT3KPEIBwT30O4IBwT3eB5Q+2QZeB5Q+8UNeB4IB2QZeB4IB8UNBN5Q+wT3BN5Q+2ENBN4IBwT3BN4IB5b7BN5w/pb7BN5w/mENhBxQ+2QZhBwIB2QZeB5Q+2QZeB4IB2QZBN5w/mENpP5w/mENBN5Q+2ENpP5Q+2ENhBxQ+2QZhBxQ+ykOhBwIB2QZhBwIBykOevBw/j0FpP5w/mENevAIBz0FAAAIBykOAABQ+ykOpP5Q+2ENAABQ+ykOhBxQ+ykOAAAIBykOhBwIBykO0O5Q+6D70O5w/qD70O5w/qD7Ze9w/sX71+9w/ir8DvBw/rn8++9w/lH9pO9w/tD9He9w/hf+g+5w/hf+/O1w/tD9pe1w/lH9ku1w/rn8ye1w/ir8O+5w/sX70O5Q+6D7Ze9Q+8X71+9Q+yr8DvBQ+7n8++9Q+1H9pO9Q+9D9He9Q+xf+g+5Q+xf+/O1Q+9D9pe1Q+1H9ku1Q+7n8ye1Q+yr8O+5Q+8X7QAZQ+6D7QAZw/qD7QAZw/qD71QZw/sX7Rwdw/ir8fgdw/rn8awdw/lH9FAdw/tD9jQZw/hf+8wVw/hf+bAVw/tD9FQVw/lH9AgVw/rn8OQVw/ir8qwVw/sX7QAZQ+6D71QZQ+8X7RwdQ+yr8fgdQ+7n8awdQ+1H9FAdQ+9D9jQZQ+xf+8wVQ+xf+bAVQ+9D9FQVQ+1H9AgVQ+7n8OQVQ+yr8qwVQ+8X71Bdw/qD7aRhw/sX72xhw/ir8Ehlw/rn8/xhw/lH9qBhw/tD9IRhw/hf+hxdw/hf+ABdw/tD9qRZw/lH9lhZw/rn8zRZw/ir8Pxdw/sX71Bdw/qD71BdQ+6D7aRhQ+8X72xhQ+yr8EhlQ+7n8/xhQ+1H9qBhQ+9D9IRhQ+xf+hxdQ+xf+ABdQ+9D9qRZQ+1H9lhZQ+7n8zRZQ+yr8PxdQ+8X71BdQ+6D70O4IBw0CXOAIB6b5XOAIBwT3BN4IBwT3BN4IB5b7rt8IB5b70O4IB0gE0O4IBz0FevAIBz0FAAAIBykOhBwIBykOhBwIB2QZeB4IB2QZeB4IB8UNsB0IB8UNsB0IBwT3WBsIBwT3WBsIB9ELmAgIB9ELmAgIBwT3QAYIBwT3QAYIB6H6OQcIB9r6AggIB3n7cQgIB2D8cQgIB2D9AggIB0f+OQcIB+b+QAYIBx//QAYIB9ELnP8IB9ELKPEIB2oDKPEIBwT30O4IBwT30O4IB6H6ye8IB9r6kvAIB3n7AfEIB2D8AfEIB2D9kvAIB0f+ye8IB+b+0O4IBx//XOBw/gT3XOBw/qb50O5w/gT30O5w/qH6ye9w/tr6kvBw/nn7AfFw/mD8AfFw/mD9kvBw/kf+ye9w/ub+0O5w/h//0O5w/g0C0O5w/qD7Ze9w/sX71+9w/ir8DvBw/rn8++9w/lH9pO9w/tD9He9w/hf+g+5w/hf+/O1w/tD9pe1w/lH9ku1w/rn8ye1w/ir8O+5w/sX7XOBw/gT3XOAIBwT3XOBw/qb5XOAIB6b5WBtw/gT3WBsIBwT3WBtw/tELWBsIB9ELWBtw/gT3WBtw/tELmAhw/tELmAhw/gT31Bdw/qD7aRhw/sX72xhw/ir8Ehlw/rn8/xhw/lH9qBhw/tD9IRhw/hf+hxdw/hf+ABdw/tD9qRZw/lH9lhZw/rn8zRZw/ir8Pxdw/sX7mAhw/gT3mAgIBwT3mAhw/tELmAgIB9ELQAZw/gT3QAYIBwT3QAZw/qH6QAYIB6H6KPFw/gT3KPFw/moDQAZw/gT3QAZw/qH6OQdw/tr6Aghw/nn7cQhw/mD8cQhw/mD9Aghw/kf+OQdw/ub+QAZw/h//QAZw/tELnP9w/tELQAZw/qD71QZw/sX7Rwdw/ir8fgdw/rn8awdw/lH9FAdw/tD9jQZw/hf+8wVw/hf+bAVw/tD9FQVw/lH9AgVw/rn8OQVw/ir8qwVw/sX7KPFw/gT3KPEIBwT3KPFw/moDKPEIB2oD0O5w/gT30O4IBwT30O5w/qH60O4IB6H6BN5w/pb7BN4IB5b7rt9w/pb7rt8IB5b7BN5w/mENpP5w/mENBN5w/pb7rt9w/pb70O5w/kgE0O5w/j0FevBw/j0F0O5w/j0F0O4IBz0FevBw/j0FevAIBz0F0O5w/g0CXOBw/qb50O4IBw0CXOAIB6b50O4IBw0C0O4IBx//0O5w/h//0O5w/g0C0O4IB6H6ye8IB9r6kvAIB3n7AfEIB2D8AfEIB2D9kvAIB0f+ye8IB+b+0O4IBx//0O5w/qH6ye9w/tr6kvBw/nn7AfFw/mD8AfFw/mD9kvBw/kf+ye9w/ub+0O5w/h//nP9w/tELKPFw/moDnP8IB9ELKPEIB2oDQAZw/tELnP9w/tELQAYIB9ELnP8IB9ELQAYIB9ELQAYIBx//QAZw/h//QAZw/tELQAYIB6H6OQcIB9r6AggIB3n7cQgIB2D8cQgIB2D9AggIB0f+OQcIB+b+QAYIBx//QAZw/qH6OQdw/tr6Aghw/nn7cQhw/mD8cQhw/mD9Aghw/kf+OQdw/ub+QAZw/h//WBtw/tELmAhw/tELWBsIB9ELmAgIB9EL0O5w/kgE0O5w/j0F0O4IBz0F0O4IB0gErt9w/pb70O5w/kgErt8IB5b70O4IB0gE","i":"FgAVAAIAFAACABUACgAWAAIAEwACABQAAwACABMAEgADABMAEQADABIAIwALAAoAIwAMAAsAIwAiAAwAIQANAAwAIQAMACIAFwAjAAoAIAAOAA0AIAANACEABAAPAA4ABAAQAA8ABAARABAABAAfAB4ABAAgAB8ABAADABEABAAOACAABQAdABwABQAeAB0ABQAEAB4ALwAZABgAMAAvABgALgAZAC8ALgAaABkALQAbABoALQAaAC4AAQAwABgAAQAYABcAAQAlACQAAQAkADAALAAbAC0ALAAcABsAJgAlAAEAJwAmAAEAKAAnAAEABgAcACwABgArACoABgAsACsABgAFABwAAAAGACoAAAAqACkACQAGAAAACAAHAAYACAAGAAkAAAAoAAEAAAApACgAAQAKAAIAAQAXAAoAMgAzADEAMgA0ADMANgA3ADUANgA4ADcAPAA5AD0AOwA5ADwAOgA9ADkARgA9ADoARwA6AEgARwBGADoARQA9AEYAQwBFAEQAQwBCAEUAPgA9AEUAPgBFAEIAQQA+AEIAPwBBAEAAPwA+AEEASQBMAEsASgBMAEkAUQBPAE0AUQBQAE8ATgBSAFEATgBRAE0AVgBUAFMAVgBTAFUAWgBXAFkAWABXAFoAXABbAF0AXABdAF4AYABhAF8AYABiAGEAYwBgAGQAYwBiAGAAaABnAGUAZgBoAGUAbABrAHgAbAB4AHkAbQB5AHoAbQB6AHsAbQBsAHkAbgBtAHsAbwB7AHwAbwBuAHsAcAB8AH0AcABvAHwAcQB9AH4AcQB+AH8AcQBwAH0AcgBxAH8AcwB/AIAAcwByAH8AdACAAIEAdABzAIAAdQCBAIIAdQCCAIMAdQB0AIEAdgB1AIMAdwCDAIQAdwB2AIMAagCEAGkAagB3AIQAiACHAJQAiACUAJUAiQCVAJYAiQCWAJcAiQCIAJUAigCJAJcAiwCXAJgAiwCKAJcAjACYAJkAjACLAJgAjQCZAJoAjQCaAJsAjQCMAJkAjgCNAJsAjwCbAJwAjwCOAJsAkACcAJ0AkACPAJwAkQCdAJ4AkQCeAJ8AkQCQAJ0AkgCRAJ8AkwCfAKAAkwCSAJ8AhgCgAIUAhgCTAKAAogChAK8AogCvALAAowCwALEAowCxALIAowCiALAApACjALIApQCyALMApQCkALIApgCzALQApgClALMApwC0ALUApwC1ALYApwCmALQAqACnALYAqQC2ALcAqQCoALYAqgC3ALgAqgCpALcAqwC4ALkAqwC5ALoAqwCqALgArACrALoArQC6ALsArQCsALoArgC7ALwArgCtALsAvgC/AMAAvgDAAMEAwgC+AMEA4ADdAN4A4ADeAN8A4QDdAOAA4gDdAOEAvQDlAOYAwwC9AMIA3ADjAOQA3ADkAOUA3ADlAL0A3AC9AMMAxQDDAMQAxQDcAMMA0wDQANEA0wDRANIA1ADQANMA1QDQANQA2wDcAMUAxgDbAMUA2gDbAMYAzwDaAMYAzwDXANgAzwDYANkAzwDZANoAzgDMAM0AxwDOAM8AywDOAMcAygDLAMcAyQDHAMgAyQDKAMcAvQC+AMIAxgDHAM8AywDMAM4AzwDQANUAzwDVANYAzwDWANcA3ADdAOIA3ADiAOMA+wDyAPEA/ADoAPIA/ADyAPsA+gD7APEA/QDoAPwA+QDxAPAA+QD6APEA/gDnAOgA/gDoAP0A+AD5APAA7wD4APAA9wD4AO8A7gD2APcA7gD3AO8A6gD+AP8A6gD/APMA7QD1APYA7QD2AO4A6wDzAPQA6wDqAPMA7AD0APUA7AD1AO0A7ADrAPQA6QDnAP4A6QD+AOoAAgEBAQMBAAEBAQIBBAEGAQcBBAEHAQUBFAEKAQkBFQELAQoBFQEKARQBEwEUAQkBFgELARUBEgETAQkBFwELARYBEQESAQkBGAELARcBEAERAQkBCAEMAQ0BCAENAQ4BCAEOAQ8BCAEYAQwBCAELARgBCAEPAQkBDwEQAQkBGQEcARsBGQEaARwBHwEgAR4BHQEfAR4BKwEtASwBNgEtASsBNwEiAS0BNwEtATYBNQE2ASsBOAEhASIBOAEiATcBNAErASoBNAE1ASsBOQEhATgBMwE0ASoBKQEzASoBMgEzASkBKAExATIBKAEyASkBJAE5AToBJAE6AS4BJwEwATEBJwExASgBJQEuAS8BJQEkAS4BJgEvATABJgElAS8BJgEwAScBIwEhATkBIwE5ASQBPAE+AT0BOwE8AT0BQQFCAUABPwFBAUABRgFEAUMBRgFDAUUBSgFJAUcBTAFKAUcBSwFKAUwBSAFNAUwBSAFMAUcBUQFPAU4BUQFOAVABUwFUAVIBUwFVAVQBWAFWAVcBWAFZAVYBWwFaAWIBWwFiAWMBXAFjAWQBXAFbAWMBXQFkAWUBXQFcAWQBXgFlAWYBXgFmAWcBXgFdAWUBXwFeAWcBYAFnAWgBYAFfAWcBYQFoAWkBYQFgAWgBawFsAWoBawFtAWwBbwFwAW4BbwFxAXABdAFyAXMBdAF1AXIBdwF2AX4BdwF+AX8BeAF/AYABeAF3AX8BeQGAAYEBeQF4AYABegGBAYIBegGCAYMBegF5AYEBewF6AYMBfAGDAYQBfAF7AYMBfQGEAYUBfQF8AYQBhwGIAYYBhwGJAYgBigGLAYwBigGMAY0BkQGQAY4BjwGRAY4B","i32":false,"n":340},"acC_der":{"o":[180.0,705.0,199.0],"p":"eOwk+t3weOwk+hwMeOzcBd3weOzcBRwMeOx8ARwMeOx8ARYNeOyE/hYNeOyE/hwMeOwk+t3wiBMk+t3weOwk+hwMiBMk+hwMPPYk+mwHWvYk+gUIsfYk+ocIM/ck+t4IzPck+vwIPPYk+o31zPck+v3zM/ck+hv0sfYk+nL0WvYk+vT0NAgk+v3zxAkk+o31pgkk+vT0Twkk+nL0zQgk+hv0xAkk+mwHNAgk+vwIzQgk+t4ITwkk+ocIpgkk+gUIeOwk+t3weOzcBd3wiBMk+t3wiBPcBd3wlPMAAN3wb/OVAN3wCvMHAd3we/I+Ad3w4/ErAd3wZPHUAN3wHfFNAN3wHfGz/93wZPEs/93w4/HV/t3we/LC/t3wCvP5/t3wb/Nr/93w7A4AAN3wxw6VAN3wYg4HAd3w0w0+Ad3wOw0rAd3wvAzUAN3wdQxNAN3wdQyz/93wvAws/93wOw3V/t3w0w3C/t3wYg75/t3wxw5r/93weOzcBd3wiBPcBd3weOzcBRwMiBPcBRwMPPbcBWwHWvbcBQUIsfbcBYcIM/fcBd4IzPfcBfwIPPbcBY31zPfcBf3zM/fcBRv0sfbcBXL0WvbcBfT0NAjcBf3zxAncBY31pgncBfT0TwncBXL0zQjcBRv0xAncBWwHNAjcBfwIzQjcBd4ITwncBYcIpgncBQUIeOx8ARwMeOzcBRwMiBN8ARwMiBPcBRwMeOx8ARwMiBN8ARwMeOx8ARYNiBN8ARYNeOyE/hYNeOx8ARYNiBOE/hYNiBN8ARYNlPMAABYNb/OVABYNCvMHARYNe/I+ARYN4/ErARYNZPHUABYNHfFNABYNHfGz/xYNZPEs/xYN4/HV/hYNe/LC/hYNCvP5/hYNb/Nr/xYN7A4AABYNxw6VABYNYg4HARYN0w0+ARYNOw0rARYNvAzUABYNdQxNABYNdQyz/xYNvAws/xYNOw3V/hYN0w3C/hYNYg75/hYNxw5r/xYNeOyE/hwMiBOE/hwMeOyE/hYNiBOE/hYNeOwk+hwMeOyE/hwMiBMk+hwMiBOE/hwMiBMk+t3wiBMk+hwMiBPcBd3wiBPcBRwMiBN8ARwMiBN8ARYNiBOE/hYNiBOE/hwMPPYk+mwHPPbcBWwHWvYk+gUIsfYk+ocIM/ck+t4IzPck+vwIzPfcBfwIWvbcBQUIsfbcBYcIM/fcBd4IzPfcBfwINAjcBfwIzPck+vwINAgk+vwIxAkk+mwHxAncBWwHNAgk+vwIzQgk+t4ITwkk+ocIpgkk+gUINAjcBfwIzQjcBd4ITwncBYcIpgncBQUIxAkk+mwHxAkk+o31xAncBY31xAncBWwHxAkk+o31xAncBY31pgkk+vT0Twkk+nL0zQgk+hv0NAgk+v3zNAjcBf3zpgncBfT0TwncBXL0zQjcBRv0zPfcBf3zNAjcBf3zzPck+v3zNAgk+v3zPPYk+o31PPbcBY31zPck+v3zM/ck+hv0sfYk+nL0WvYk+vT0zPfcBf3zM/fcBRv0sfbcBXL0WvbcBfT0PPYk+mwHPPYk+o31PPbcBY31PPbcBWwHlPMAABYNb/OVABYNCvMHARYNe/I+ARYN4/ErARYNZPHUABYNHfFNABYNHfGz/xYNZPEs/xYN4/HV/hYNe/LC/hYNCvP5/hYNb/Nr/xYNlPMAABYNlPMAAN3wb/OVAN3wCvMHAd3we/I+Ad3w4/ErAd3wZPHUAN3wHfFNAN3wHfGz/93wZPEs/93w4/HV/t3we/LC/t3wCvP5/t3wb/Nr/93wlPMAAN3w7A4AABYNxw6VABYNYg4HARYN0w0+ARYNOw0rARYNvAzUABYNdQxNABYNdQyz/xYNvAws/xYNOw3V/hYN0w3C/hYNYg75/hYNxw5r/xYN7A4AABYN7A4AAN3wxw6VAN3wYg4HAd3w0w0+Ad3wOw0rAd3wvAzUAN3wdQxNAN3wdQyz/93wvAws/93wOw3V/t3w0w3C/t3wYg75/t3wxw5r/93w7A4AAN3w","i":"BAADAAIABwACAAAABwAFAAQABwAEAAIABgAFAAcAAQAHAAAAFQAIABQAEwAUAAgAEQAIABUAEgATAAgADAAKAAgADAAIABEADQAKAAwADgAKAA0ADwAKAA4AEAAKAA8ACQAXABgACQAYABkACQAZABoACQAaABYAGwAXAAkACwAcAB0ACwAdAB4ACwAeAB8ACwAfABsACwAbAAkACQASAAgACQAWABIACgAcAAsACgAQABwALQAgACwAKwAsACAALgAgAC0ALwAgAC4AIQApACoAIQAqACsAIQArACAAKAApACEAJwAoACEAJgAnACEAOQAvADAAOgAvADkAOAAwACQAOAA5ADAANwAkACUANwA4ACQANgAlACYANgA3ACUAIgA6ADsAIgA7ADwAIgAgAC8AIgAvADoAPQAiADwANQA2ACYAMQAiAD0AIwAxADIAIwAyADMAIwAzADQAIwA0ADUAIwAiADEAIwA1ACEANQAmACEASwBKAD4ASQA+AEoARwBLAD4ASAA+AEkAQgA+AEAAQgBHAD4AQwBCAEAARABDAEAARQBEAEAARgBFAEAAPwBOAE0APwBPAE4APwBQAE8APwBMAFAAUQA/AE0AQQBTAFIAQQBUAFMAQQBVAFQAQQBRAFUAQQA/AFEAPwA+AEgAPwBIAEwAQABBAFIAQABSAEYAWQBXAFYAWQBWAFgAXQBbAFoAXQBaAFwAawBqAF4AaQBeAGoAbABrAF4AaABfAF4AaABeAGkAZwBfAGgAZgBfAGcAZQBfAGYAdwBuAG0AeABtAGwAeAB3AG0AdgBiAG4AdgBuAHcAeQB4AGwAdQBjAGIAdQBiAHYAdABkAGMAdABjAHUAYAB6AHkAYAB7AHoAYABvAHsAYABsAF4AYAB5AGwAYQBwAG8AYQBxAHAAYQByAHEAYQBvAGAAYQBfAGUAYQBlAHIAcgBlAHMAcwBlAGQAcwBkAHQAfwB8AH0AfwB+AHwAgwCBAIAAgwCAAIIAiACGAIcAiwCEAIYAiwCIAIkAiwCGAIgAigCLAIkAhQCEAIsAjQCOAIwAkwCPAI4AkwCOAI0AlACPAJMAlQCQAI8AlQCRAJAAlQCPAJQAkgCRAJUAlwCYAJYAlwCZAJgAmwCaAJ8AowCbAJ8AogCeAJ0AogCfAJ4AogCjAJ8AoQCdAJwAoQCiAJ0AoAChAJwApACmAKUApACnAKYAqQCqAKgArwCrAKoArwCqAKkAsACrAK8AsQCsAKsAsQCtAKwAsQCrALAArgCtALEAswCyALQAswC0ALUAtwC2ALsAvwC3ALsAvgC6ALkAvgC7ALoAvgC/ALsAvQC5ALgAvQC+ALkAvAC9ALgAwADBAMIAwADCAMMAxQDSAMQAxQDTANIAxQDUANMAxgDUAMUAxwDVANQAxwDUAMYAyADWANUAyADVAMcAyQDXANYAyQDWAMgAygDYANcAygDXAMkAywDZANgAywDaANkAywDYAMoAzADaAMsAzQDbANoAzQDcANsAzQDaAMwAzgDdANwAzgDcAM0AzwDdAM4A0ADeAN0A0ADdAM8A0QDfAN4A0QDeANAA4QDuAOAA4QDvAO4A4QDwAO8A4gDwAOEA4wDxAPAA4wDwAOIA5ADyAPEA5ADxAOMA5QDzAPIA5QDyAOQA5gD0APMA5gDzAOUA5wD1APQA5wD2APUA5wD0AOYA6AD2AOcA6QD3APYA6QD4APcA6QD2AOgA6gD5APgA6gD4AOkA6wD5AOoA7AD6APkA7AD5AOsA7QD7APoA7QD6AOwA","i32":false,"n":224},"acC_izq":{"o":[107.0,705.0,-199.0],"p":"eOwk+iMPeOwk+uTzeOzcBSMPeOzcBeTzeOx8AeTzeOx8AeryeOyE/uryeOyE/uTzeOwk+iMPiBMk+iMPeOwk+uTziBMk+uTzPPYk+pT4WvYk+vv3sfYk+nn3M/ck+iL3zPck+gT3PPYk+nMKzPck+gMMM/ck+uULsfYk+o4LWvYk+gwLNAgk+gMMxAkk+nMKpgkk+gwLTwkk+o4LzQgk+uULxAkk+pT4NAgk+gT3zQgk+iL3Twkk+nn3pgkk+vv3eOwk+iMPeOzcBSMPiBMk+iMPiBPcBSMPlPMAACMPb/OVACMPCvMHASMPe/I+ASMP4/ErASMPZPHUACMPHfFNACMPHfGz/yMPZPEs/yMP4/HV/iMPe/LC/iMPCvP5/iMPb/Nr/yMP7A4AACMPxw6VACMPYg4HASMP0w0+ASMPOw0rASMPvAzUACMPdQxNACMPdQyz/yMPvAws/yMPOw3V/iMP0w3C/iMPYg75/iMPxw5r/yMPeOzcBSMPiBPcBSMPeOzcBeTziBPcBeTzPPbcBZT4WvbcBfv3sfbcBXn3M/fcBSL3zPfcBQT3PPbcBXMKzPfcBQMMM/fcBeULsfbcBY4LWvbcBQwLNAjcBQMMxAncBXMKpgncBQwLTwncBY4LzQjcBeULxAncBZT4NAjcBQT3zQjcBSL3TwncBXn3pgncBfv3eOx8AeTzeOzcBeTziBN8AeTziBPcBeTzeOx8AeTziBN8AeTzeOx8AeryiBN8AeryeOyE/uryeOx8AeryiBOE/uryiBN8AerylPMAAOryb/OVAOryCvMHAerye/I+Aery4/ErAeryZPHUAOryHfFNAOryHfGz/+ryZPEs/+ry4/HV/urye/LC/uryCvP5/uryb/Nr/+ry7A4AAOryxw6VAOryYg4HAery0w0+AeryOw0rAeryvAzUAOrydQxNAOrydQyz/+ryvAws/+ryOw3V/ury0w3C/uryYg75/uryxw5r/+ryeOyE/uTziBOE/uTzeOyE/uryiBOE/uryeOwk+uTzeOyE/uTziBMk+uTziBOE/uTziBMk+iMPiBMk+uTziBPcBSMPiBPcBeTziBN8AeTziBN8AeryiBOE/uryiBOE/uTzPPYk+pT4PPbcBZT4WvYk+vv3sfYk+nn3M/ck+iL3zPck+gT3zPfcBQT3WvbcBfv3sfbcBXn3M/fcBSL3zPfcBQT3NAjcBQT3zPck+gT3NAgk+gT3xAkk+pT4xAncBZT4NAgk+gT3zQgk+iL3Twkk+nn3pgkk+vv3NAjcBQT3zQjcBSL3TwncBXn3pgncBfv3xAkk+pT4xAkk+nMKxAncBXMKxAncBZT4xAkk+nMKxAncBXMKpgkk+gwLTwkk+o4LzQgk+uULNAgk+gMMNAjcBQMMpgncBQwLTwncBY4LzQjcBeULzPfcBQMMNAjcBQMMzPck+gMMNAgk+gMMPPYk+nMKPPbcBXMKzPck+gMMM/ck+uULsfYk+o4LWvYk+gwLzPfcBQMMM/fcBeULsfbcBY4LWvbcBQwLPPYk+pT4PPYk+nMKPPbcBXMKPPbcBZT4lPMAAOryb/OVAOryCvMHAerye/I+Aery4/ErAeryZPHUAOryHfFNAOryHfGz/+ryZPEs/+ry4/HV/urye/LC/uryCvP5/uryb/Nr/+rylPMAAOrylPMAACMPb/OVACMPCvMHASMPe/I+ASMP4/ErASMPZPHUACMPHfFNACMPHfGz/yMPZPEs/yMP4/HV/iMPe/LC/iMPCvP5/iMPb/Nr/yMPlPMAACMP7A4AAOryxw6VAOryYg4HAery0w0+AeryOw0rAeryvAzUAOrydQxNAOrydQyz/+ryvAws/+ryOw3V/ury0w3C/uryYg75/uryxw5r/+ry7A4AAOry7A4AACMPxw6VACMPYg4HASMP0w0+ASMPOw0rASMPvAzUACMPdQxNACMPdQyz/yMPvAws/yMPOw3V/iMP0w3C/iMPYg75/iMPxw5r/yMP7A4AACMP","i":"BAACAAMABwAAAAIABwAEAAUABwACAAQABgAHAAUAAQAAAAcAFQAUAAgAEwAIABQAEQAVAAgAEgAIABMADAAIAAoADAARAAgADQAMAAoADgANAAoADwAOAAoAEAAPAAoACQAYABcACQAZABgACQAaABkACQAWABoAGwAJABcACwAdABwACwAeAB0ACwAfAB4ACwAbAB8ACwAJABsACQAIABIACQASABYACgALABwACgAcABAALQAsACAAKwAgACwALgAtACAAKgAgACsALwAuACAAIQAqACkAIQAgACoAKAAhACkAJwAhACgAJgAhACcAOQAwAC8AOgA5AC8AOAAkADAAOAAwADkANwAlACQANwAkADgANgAmACUANgAlADcAIgA7ADoAIgA8ADsAIgAvACAAIgA6AC8APQA8ACIANQAmADYAMQA9ACIAIwAyADEAIwAzADIAIwA0ADMAIwA1ADQAIwAxACIAIwAhADUANQAhACYASwA+AEoASQBKAD4ARwA+AEsASABJAD4AQgBAAD4AQgA+AEcAQwBAAEIARABAAEMARQBAAEQARgBAAEUAPwBNAE4APwBOAE8APwBPAFAAPwBQAEwAUQBNAD8AQQBSAFMAQQBTAFQAQQBUAFUAQQBVAFEAQQBRAD8APwBIAD4APwBMAEgAQABSAEEAQABGAFIAWQBWAFcAWQBYAFYAXQBaAFsAXQBcAFoAawBeAGoAaQBeAF8AaQBqAF4AbABeAGsAaABpAF8AZwBoAF8AZgBnAF8AZQBmAF8AdwBtAG4AeABsAG0AeABtAHcAdgBuAGIAdgB3AG4AeQBsAHgAdQBiAGMAdQB2AGIAdABjAGQAdAB1AGMAYAB5AHoAYAB6AHsAYAB7AG8AYABeAGwAYABsAHkAYQBvAHAAYQBwAHEAYQBxAHIAYQBgAG8AYQBlAF8AYQByAGUAcgBzAGUAcwBkAGUAcwB0AGQAfwB9AHwAfwB8AH4AgwCAAIEAgwCCAIAAiACHAIYAiwCGAIQAiwCJAIgAiwCIAIYAigCJAIsAhQCLAIQAjQCMAI4AkwCOAI8AkwCNAI4AlACTAI8AlQCPAJAAlQCQAJEAlQCUAI8AkgCVAJEAlwCWAJgAlwCYAJkAmwCfAJoAowCfAJsAogCdAJ4AogCeAJ8AogCfAKMAoQCcAJ0AoQCdAKIAoACcAKEApAClAKYApACmAKcAqQCoAKoArwCqAKsArwCpAKoAsACvAKsAsQCrAKwAsQCsAK0AsQCwAKsArgCxAK0AswC0ALIAswC1ALQAtwC7ALYAvwC7ALcAvgC5ALoAvgC6ALsAvgC7AL8AvQC4ALkAvQC5AL4AvAC4AL0AwADCAMEAwADDAMIAxQDEANIAxQDSANMAxQDTANQAxgDFANQAxwDUANUAxwDGANQAyADVANYAyADHANUAyQDWANcAyQDIANYAygDXANgAygDJANcAywDYANkAywDZANoAywDKANgAzADLANoAzQDaANsAzQDbANwAzQDMANoAzgDcAN0AzgDNANwAzwDOAN0A0ADdAN4A0ADPAN0A0QDeAN8A0QDQAN4A4QDgAO4A4QDuAO8A4QDvAPAA4gDhAPAA4wDwAPEA4wDiAPAA5ADxAPIA5ADjAPEA5QDyAPMA5QDkAPIA5gDzAPQA5gDlAPMA5wD0APUA5wD1APYA5wDmAPQA6ADnAPYA6QD2APcA6QD3APgA6QDoAPYA6gD4APkA6gDpAPgA6wDqAPkA7AD5APoA7ADrAPkA7QD6APsA7QDsAPoA","i32":false,"n":224}});
  for (const k of ['acG_der', 'acG_izq']) b.add(meshGeo(k), 'P', DX, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001);
  for (const k of ['acC_der', 'acC_izq']) b.add(meshGeo(k), 'Pd', DX, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001);
  } catch (e) { console.warn('acople rev. 3.33: mallas', e); }
  b.bb(DX - 0.203, DX + 0.240, 0.690, 0.720, 0.230, 0.260, 'alu');
  b.bb(DX - 0.203, DX + 0.167, 0.690, 0.720, -0.260, -0.230, 'alu');
  for (const [x, s] of [[145.0, 1], [215.0, 1], [72.0, -1], [142.0, -1]]) b.cyl(0.003, 0.080, DX + x / 1000, 0.705, s * 0.194, 'z', 'steel', 10);
  return;   // rev. 3.18: el acople de 3030 se descartó (va solo impreso, por rediseñar) y chocaba con la guarda: no se dibuja
  const y = 0.6534 + 0.015;
  for (const x of [0.281, 0.461]) b.profile(0.51, 'z', x, y, 0);
  for (const s of [-1, 1]) b.profile(0.386, 'x', 0.283, y, s * 0.270);
  b.stpAt('prt_dock', new THREE.Matrix4(), V3(), { col: { '#000001': 'P' } });
}
function arucoMesh(parent, x, y, z) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#000'; g.fillRect(6, 6, 52, 52); g.fillStyle = '#fff';
  [[1, 1], [3, 1], [2, 2], [4, 2], [1, 3], [3, 4], [2, 4], [4, 4]].forEach(([i, j]) => g.fillRect(6 + i * 8.7, 6 + j * 8.7, 8.7, 8.7));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.10), new THREE.MeshBasicMaterial({ map: t }));
  m.position.set(x, y, z); m.rotation.y = -Math.PI / 2; parent.add(m);
}
// ---------- Banda real (STEP de Isaac, 17-oct): el modelo es 1/3 de la banda → 3 tramos de 1030 mm con una sola
// cinta continua. Extremo cerrado (tapa + 2 rodillos de Ø50) hacia el carrito; rodillo de Ø85 en la punta lejana.
// En el STEP: x = ancho, y = arriba, z = largo (z = −515 es la cara de la tapa). Se gira para que el largo vaya en +x.
const BND = {
  SEG: 1.030, N: 3, ZC: -0.515,              // largo de un tramo y cara de la tapa (STEP, m)
  YTOP: 0.14663,                             // cara de la cinta sobre el rodillo de Ø50 de arriba (STEP)
  V: 0.20,                                   // velocidad de la cinta (supuesta: cronometrarla)
  get LEN() { return this.SEG * this.N; },   // 3.09 m
};
// rev. 3.48: estación de inspección y scrap (centro del 2.º tramo). z > 0 = derecha viendo venir las piezas; el scrap sale a −z (izquierda).
const RJ = { X: DOCK + 1.545, GAP: 0.32, Z0: 0.115, ST: 0.100, YC: 0.034, YCAM: 0.45, XM: 0.17, ZM: 0.215, TRAY0: -0.168, TRAY1: -0.420, TRAYY: -0.025, SLOPE: 6 * Math.PI / 180 };
const trayY = z => D.BELT + RJ.TRAYY - Math.max(0, RJ.TRAY0 - z) * Math.tan(RJ.SLOPE);   // cara de arriba del hule espuma de la charola
const bndX = zs => DOCK + (zs - BND.ZC);     // z del STEP (m, primer tramo) → x
const bndY = ys => D.BELT + (ys - BND.YTOP); // y del STEP (m) → y (la cinta queda en D.BELT)
const BND_R = stpBasis(['-z', 'y', 'x']);
const BELT_XA = bndX(-0.458);                // cresta del rodillo de Ø50 de arriba: ahí deja de apoyar la cinta (0.313; rev. 3.22: medida, 57 mm de la tapa; el STEP trae 60)
const GF = { X0: BELT_XA + 0.010, XT: BELT_XA + 0.130, X1: BELT_XA + 0.250, ZT: 0.0835, ZE: 0.0945, W: 0.006, ARM: [BELT_XA + 0.035, BELT_XA + 0.225] };   // rev. 3.48c: guía final
const gfZ = x => x <= GF.XT ? GF.ZT : GF.ZT + (GF.ZE - GF.ZT) * (x - GF.XT) / (GF.X1 - GF.XT);   // cara interior de la guía final (m)
const BELT_XF = bndX(0.4345 + 2 * BND.SEG);  // cresta del rodillo de Ø85, en la punta lejana (3.266)
const BELT_X1 = DOCK + BND.LEN;              // punta lejana del bastidor (3.346)
const BND_RS = [[BELT_XA, bndY(0.12013), 0.025, 0.214], [BELT_XA, bndY(0.06213), 0.025, 0.214], [BELT_XF, bndY(0.10213), 0.0425, 0.212]];  // rodillos: x, y, r, largo
function hull2(pts) {                        // envolvente convexa (cadena monótona)
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  lo.pop(); up.pop(); return lo.concat(up);
}
function beltLoopGeo() {                     // cinta de 1.5 mm × 203.5 mm que abraza los 3 rodillos (sobre la cama, el de Ø85 se toma 0.5 mm más grande)
  const ring = dr => hull2(BND_RS.flatMap(([x, y, r], k) => Array.from({ length: 56 }, (_, i) => { const a = 2 * Math.PI * i / 56, R = r + (k === 2 ? 0.0005 : 0) + dr; return [x + R * Math.cos(a), y + R * Math.sin(a)]; })));
  const s = new THREE.Shape(ring(0.0015).map(([x, y]) => new THREE.Vector2(x, y)));
  s.holes.push(new THREE.Path(ring(0).map(([x, y]) => new THREE.Vector2(x, y))));
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.2035, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -0.2035 / 2);
  return g;
}
const stBelt = addPart('st_belt', 'sta', 'Banda transportadora (3 tramos)', b => {
  for (let k = 0; k < BND.N; k++) b.stpAt(k ? 'bnd_frameN' : 'bnd_frame0', BND_R, V3(DOCK - BND.ZC + k * BND.SEG, D.BELT - BND.YTOP, 0), { col: { '#9aa3ad': 'alu' } });
  b.add(beltLoopGeo(), 'belt');
  for (const [x, y, r, L] of BND_RS) b.cyl(r, L, x, y, 0, 'z', 'steel', 32);
  // patas (supuestas: no vienen en el STEP): perfil 3030 bajo cada unión de tramos, hasta el piso
  const yLeg = D.BELT - BND.YTOP;
  for (const x of [DOCK + 0.535, DOCK + BND.SEG, DOCK + 2 * BND.SEG, BELT_X1 - 0.06]) for (const s of [-1, 1]) {   // rev. 3.18: la primera pata, a 52 cm de la tapa (medida)
    b.profile(yLeg, 'y', x, yLeg / 2, s * 0.135);
    b.bb(x - 0.035, x + 0.035, 0, 0.008, s * 0.135 - 0.035, s * 0.135 + 0.035, 'dark');
  }
  // guías bajas (3 mm) que centran la quilla, colgadas de los rieles cada ~0.5 m (propuesta): no tocan la cinta
  for (const s of [-1, 1]) {
    const zz = (a, c) => [Math.min(s * a, s * c), Math.max(s * a, s * c)];
    const gap = s < 0 ? [[GF.X1 + 0.002, RJ.X - RJ.GAP / 2], [RJ.X + RJ.GAP / 2, BELT_XF - 0.03]] : [[GF.X1 + 0.002, BELT_XF - 0.03]];   // rev. 3.48c: antes de GF.X1 va la guía final   // rev. 3.48: hueco en la estación de scrap
    for (const [g0, g1] of gap) b.bb(g0, g1, D.BELT + 0.0005, D.BELT + 0.0035, ...zz(D.FW / 2 + 0.002, D.FW / 2 + 0.008), 'P');
    for (let x = BELT_XA + 0.06; x < BELT_XF - 0.05; x += 0.48) {
      if (s < 0 && Math.abs(x - RJ.X) < RJ.GAP / 2 + 0.01) continue;
      if (x < GF.X1 + 0.02) continue;                                                           // rev. 3.48c: ahí va la guía final
      b.bb(x - 0.01, x + 0.01, D.BELT + 0.001, D.BELT + 0.0055, ...zz(D.FW / 2 + 0.002, 0.108), 'P');      // brazo: pasa 1.5 mm debajo del piso del fixture (que se abre a ±89 mm arriba de 7 mm)
      b.bb(x - 0.01, x + 0.01, D.BELT + 0.0055, D.BELT + 0.0115, ...zz(0.100, 0.108), 'P');                // sube por fuera de las orejas de la MaxxECU
      b.bb(x - 0.01, x + 0.01, bndY(0.15513), D.BELT + 0.0115, ...zz(0.106, 0.135), 'P');                 // se apoya y se atornilla sobre el riel
    }
  }
  // rev. 3.18 (hoja 1, 4-nov): guarda de la transmisión (294 × 100, sale 66 mm al hueco entre bandas) y motorreductor Baldor
  // Ø85 × 178 bajo el bastidor, eje a 613 mm del piso y a 62.5 mm de la tapa; del lado +z (derecha viendo la banda desde el carrito)
  b.bb(DOCK + 0.0025, DOCK + 0.1025, 0.532, 0.826, 0.16025, 0.22625, 'melam');
  b.cyl(0.0425, 0.178, DOCK + 0.0625, 0.613, 0.16025 - 0.089, 'z', 'dark', 28);
  funnelAndAruco(b);
}, { world: true, noCheck: true });
arucoMesh(stBelt.group, 0.344 - stBelt.home.x, 0.45 - stBelt.home.y, 0.30 - stBelt.home.z);
addPart('st_dock', 'sta', 'Acople a la banda (rev. 3.33: brazos de 3030 y guías impresas)', b => dockKit(b), { world: true, noCheck: true });
// rev. 3.39: acople optimizado, en 5 piezas que se arman en la estación (capítulo E15). Coordenadas de la banda en mm: x = DOCK + X/1000.
const AC39 = { B80: [[145.0, 1], [215.0, 1], [72.0, -1], [142.0, -1]], B12: [[-95.0, 1], [-70.0, 1], [-35.0, 1], [-13.0, 1], [-95.0, -1], [-70.0, -1], [-35.0, -1], [-13.0, -1]], BEB: [] };   // rev. 3.46: los 4 de cada guía, verticales desde arriba
addPart('st_ac_calza', 'sta', 'Calzas impresas de los brazos (2)', b => { for (const k of ['ac39_calza_der', 'ac39_calza_izq']) b.add(meshG(k), 'P', DOCK, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001); }, { world: true });
addPart('st_ac_b80', 'sta', 'Tornillos M6 × 80 cabeza hexagonal de los brazos (4)', b => { for (const [x, s] of AC39.B80) { b.cyl(0.003, 0.080, DOCK + x / 1000, 0.705, s * 0.194, 'z', 'steel', 10); b.cyl(0.005, 0.006, DOCK + x / 1000, 0.705, s * 0.151, 'z', 'steel', 6); } }, { world: true });
addPart('st_ac_brazo', 'sta', 'Brazos del acople: 3030 de 443 (der.) y 370 (izq.)', b => { b.bb(DOCK - 0.120, DOCK + 0.323, 0.690, 0.720, 0.230, 0.260, 'alu'); b.bb(DOCK - 0.120, DOCK + 0.250, 0.690, 0.720, -0.260, -0.230, 'alu'); }, { world: true });
addPart('st_ac_guia', 'sta', 'Guías impresas en V con tope (der. e izq.)', b => { for (const k of ['ac39_guia_der', 'ac39_guia_izq']) b.add(meshG(k), 'P', DOCK, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001); }, { world: true });
addPart('st_ac_b12', 'sta', 'Tornillos M6 × 16 + rondana de las guías (8: 4 por guía, desde arriba a la ranura de arriba del brazo)', b => { for (const [x, s] of AC39.B12) { b.cyl(0.003, 0.016, DOCK + x / 1000, 0.718, s * 0.245, 'y', 'steel', 10); b.cyl(0.006, 0.0016, DOCK + x / 1000, 0.7268, s * 0.245, 'y', 'steel', 16); b.cyl(0.005, 0.006, DOCK + x / 1000, 0.7306, s * 0.245, 'y', 'steel', 16); } }, { world: true });
for (const k of ['st_ac_calza', 'st_ac_b80', 'st_ac_brazo', 'st_ac_guia', 'st_ac_b12']) PARTS.get(k).stAsm = 'belt';
addPart('st_stripes', 'sta', 'Banda en movimiento', b => {
  for (let x = BELT_XA + 0.10; x < BELT_XF - 0.02; x += 0.09) b.bb(x, x + 0.006, D.BELT, D.BELT + 0.0006, -0.098, 0.098, 'dark');
}, { world: true, noCheck: true, mount: 'belt', shadow: false });


// rev. 3.48c: guía final impresa (2 piezas en espejo), atornillada al riel con 2 autorroscantes #8 × 1/2" cada una
addPart('st_gfin', 'sta', 'Guía final impresa de la banda (2 piezas: centran la quilla antes del carrito)', b => {
  const B = D.BELT;
  for (const s of [-1, 1]) {
    const N = 12;
    for (let i = 0; i < N; i++) {                                                                // tira de 6 × 3 mm: garganta recta y V que abre
      const xa = GF.X0 + (GF.X1 - GF.X0) * i / N, xb = GF.X0 + (GF.X1 - GF.X0) * (i + 1) / N, zm = gfZ((xa + xb) / 2), ang = Math.atan2(gfZ(xb) - gfZ(xa), xb - xa);
      b.box((xb - xa) / Math.cos(ang) + 0.0004, 0.003, GF.W, (xa + xb) / 2, B + 0.002, s * (zm + GF.W / 2), 'Pd', 0, -s * ang, 0);
    }
    b.box(0.004, 0.003, 0.004, GF.X1 - 0.002, B + 0.002, s * (GF.ZE + 0.003), 'Pd');              // remate
    for (const x of GF.ARM) {
      const z0 = gfZ(x) + 0.002, zz = (a, c) => [Math.min(s * a, s * c), Math.max(s * a, s * c)];
      b.bb(x - 0.010, x + 0.010, B + 0.0005, B + 0.0055, ...zz(z0, 0.108), 'Pd');                 // brazo: 1.5 mm bajo el piso del fixture
      b.bb(x - 0.010, x + 0.010, B + 0.0055, B + 0.0115, ...zz(0.100, 0.108), 'Pd');              // sube por fuera de las orejas de la MaxxECU
      b.bb(x - 0.010, x + 0.010, bndY(0.15513), B + 0.0115, ...zz(0.106, 0.135), 'Pd');           // asiento sobre el riel
      b.cyl(0.0042, 0.0025, x, B + 0.01275, s * 0.1225, 'y', 'steel', 14);                         // cabeza del autorroscante #8
    }
  }
}, { world: true, noCheck: true });
// ============================================================ rev. 3.48: ESTACIÓN DE INSPECCIÓN Y SCRAP
{
const X = RJ.X, B = D.BELT, YC = B + RJ.YC, FZ = 0.16025;          // FZ = cara de afuera de los canales C
addPart('st_vis_mast', 'sta', 'Mástil impreso de la cámara (3 tramos 40 × 40, varilla M8 adentro) y brazo en L', b => {
  const x = X + RJ.XM, z = RJ.ZM, y0 = B - 0.075, y1 = B + RJ.YCAM + 0.045;
  b.bb(x - 0.045, x + 0.045, B - 0.110, B + 0.004, FZ, FZ + 0.008, 'P');                       // brida contra el canal C: 2 M6 a la lámina
  b.bb(x - 0.030, x + 0.030, B - 0.090, B - 0.060, FZ + 0.008, z + 0.030, 'P');                // mensula: recibe el mástil
  const L = (y1 - y0) / 3;
  for (let k = 0; k < 3; k++) { b.bb(x - 0.020, x + 0.020, y0 + k * L + 0.001, y0 + (k + 1) * L - 0.001, z - 0.020, z + 0.020, 'P');
    if (k) b.bb(x - 0.022, x + 0.022, y0 + k * L - 0.004, y0 + k * L + 0.004, z - 0.022, z + 0.022, 'Pd'); }   // unión machihembrada
  b.cyl(0.004, 0.012, x, y1 + 0.004, z, 'y', 'steel', 10);                                       // punta de la varilla M8 + tuerca
  b.cyl(0.0075, 0.006, x, y1 + 0.003, z, 'y', 'steel', 6);
  const ya = y1 - 0.025;                                                                          // brazo en L: hacia el centro de la banda y luego sobre la estación
  b.bb(x - 0.015, x + 0.015, ya, y1, -0.012, z + 0.022, 'P');
  b.bb(X + 0.06, x + 0.015, ya, y1, -0.015, 0.015, 'P');
}, { world: true, noCheck: true });
addPart('st_vis_hood', 'sta', 'Guarda impresa de la cámara (240 × 220 × 80, tira LED adentro)', b => {
  const y0 = B + RJ.YCAM - 0.050, y1 = B + RJ.YCAM + 0.030, w = 0.003, ax = 0.120, az = 0.110;
  b.bb(X - ax, X + ax, y1 - w, y1, -az, az, 'P');
  b.bb(X - ax, X - ax + w, y0, y1, -az, az, 'P'); b.bb(X + ax - w, X + ax, y0, y1, -az, az, 'P');
  b.bb(X - ax, X + ax, y0, y1, -az, -az + w, 'P'); b.bb(X - ax, X + ax, y0, y1, az - w, az, 'P');
  b.bb(X + 0.06, X + 0.12, y1, B + RJ.YCAM + 0.045 - 0.025, -0.015, 0.015, 'P');                // pie al brazo
  for (const s of [-1, 1]) b.bb(X - 0.10, X + 0.10, y1 - 0.010, y1 - 0.004, s * (az - w - 0.006), s * (az - w), 'white');   // tira LED 12 V blanca (2 × 20 cm)
}, { world: true, noCheck: true });
addPart('st_vis_cam', 'sta', 'Cámara Logitech C270 (USB) apuntando hacia abajo', b => {
  const y = B + RJ.YCAM;
  b.bb(X - 0.036, X + 0.036, y + 0.002, y + 0.024, -0.016, 0.016, 'black');
  b.cyl(0.010, 0.004, X, y, 0, 'y', 'glass', 20); b.cyl(0.0035, 0.003, X + 0.022, y + 0.0005, 0, 'y', 'dark', 10);
}, { world: true, noCheck: true });
addPart('st_vis_lamp', 'sta', 'Torreta PASS/FAIL (verde y roja, 24 V)', b => {
  const x = X + RJ.XM, z = RJ.ZM, y = B + RJ.YCAM + 0.060;
  b.cyl(0.012, 0.010, x, y, z, 'y', 'dark', 16); b.cyl(0.011, 0.022, x, y + 0.016, z, 'y', 'glass', 16); b.cyl(0.011, 0.022, x, y + 0.039, z, 'y', 'glass', 16);
}, { world: true, noCheck: true });
const lampY = B + RJ.YCAM + 0.060;
addPart('st_vis_lampG', 'sta', 'Torreta: verde encendida (PASS)', b => b.cyl(0.0125, 0.023, X + RJ.XM, lampY + 0.016, RJ.ZM, 'y', 'green', 16), { world: true, noCheck: true, mount: 'lampG', shadow: false });
addPart('st_vis_lampR', 'sta', 'Torreta: roja encendida (FAIL)', b => b.cyl(0.0125, 0.023, X + RJ.XM, lampY + 0.039, RJ.ZM, 'y', 'red', 16), { world: true, noCheck: true, mount: 'lampR', shadow: false });
// cono de visión (lo que ve la C270: ~0.34 × 0.19 m a la altura de la ECU)
const vc = addPart('st_vis_cone', 'sta', 'Campo de visión de la cámara', b => {
  const ya = B + RJ.YCAM - 0.002, yb = B + 0.075, ax = 0.170, az = 0.095;
  const v = [X, ya, 0, X - ax, yb, -az, X + ax, yb, -az, X + ax, yb, az, X - ax, yb, az];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 1, 3, 2, 1, 4, 3]); g.computeVertexNormals();
  b.add(g, 'cYel');
}, { world: true, noCheck: true, mount: 'vcone', shadow: false });
vc.mats.forEach(o => { o.mat.side = THREE.DoubleSide; }); vc.alpha = 0.22;
// ---- scrap
addPart('st_rej_sup', 'sta', 'Silla impresa del cilindro (con buje de la varilla antigiro)', b => {
  b.bb(X - 0.050, X + 0.050, B - 0.105, B + 0.004, FZ, FZ + 0.008, 'P');                       // brida contra el canal C: 2 M6
  b.bb(X - 0.035, X + 0.035, B + 0.0075, B + 0.0155, 0.150, 0.345, 'P');                        // repisa sobre el canal
  b.bb(X - 0.030, X + 0.080, B + 0.0155, YC + 0.022, 0.148, 0.160, 'P');                        // placa de la nariz (tuerca M22 × 1.5) y buje Ø8
  b.bb(X - 0.020, X + 0.020, B + 0.0155, YC - 0.012, 0.300, 0.318, 'P');                        // cuna trasera (cincho)
  for (const s of [-1, 1]) b.bb(X + s * 0.035 - 0.003, X + s * 0.035 + 0.003, B - 0.060, B + 0.0155, FZ + 0.008, 0.230, 'Pd');   // cartelas
  b.cyl(0.006, 0.012, X + 0.060, YC, 0.154, 'z', 'nylon', 16);                                  // buje
  for (const dx of [-0.030, 0.030]) b.cyl(0.0055, 0.004, X + dx, B - 0.075, FZ + 0.010, 'z', 'steel', 6);   // cabezas M6
}, { world: true, noCheck: true });
addPart('st_rej_cyl', 'sta', 'Cilindro neumático doble efecto Ø20 × 100 (ISO 6432, émbolo magnético) + 2 reed', b => {
  b.cyl(0.0115, 0.165, X, YC, 0.2475, 'z', 'alu', 24);                                          // camisa
  b.cyl(0.0125, 0.025, X, YC, 0.1525, 'z', 'steel', 24); b.cyl(0.0125, 0.020, X, YC, 0.340, 'z', 'steel', 24);   // tapas
  b.cyl(0.011, 0.008, X, YC, 0.144, 'z', 'steel', 24);                                          // rosca de la nariz
  b.cyl(0.0165, 0.007, X, YC, 0.1635, 'z', 'steel', 6);                                         // tuerca M22 × 1.5 (aprieta contra la silla)
  for (const z of [0.158, 0.336]) { b.cyl(0.004, 0.012, X, YC + 0.016, z, 'y', 'brass', 10); }   // conexiones de 4 mm
  for (const z of [0.185, 0.315]) b.bb(X - 0.016, X - 0.010, YC - 0.003, YC + 0.003, z - 0.012, z + 0.012, 'red');   // reed: retraído (atrás) y extendido
}, { world: true, noCheck: true });
addPart('st_rej_rod', 'sta', 'Vástago, placa de empuje impresa (230 × 20) y varilla antigiro Ø8', b => {
  const z0 = RJ.Z0;
  b.cyl(0.004, 0.150, X, YC, z0 + 0.008 + 0.075, 'z', 'steel', 16);                              // vástago Ø8
  b.cyl(0.004, 0.170, X + 0.060, YC, z0 + 0.008 + 0.085, 'z', 'steel', 16);                       // varilla antigiro
  b.bb(X - 0.115, X + 0.115, B + 0.024, B + 0.044, z0, z0 + 0.008, 'Pd');                        // placa: pega en los 2 postes (x ±102)
  b.bb(X - 0.015, X + 0.075, B + 0.024, B + 0.044, z0 + 0.008, z0 + 0.020, 'Pd');                // maza del vástago y de la varilla
  b.cyl(0.0075, 0.006, X, YC, z0 + 0.023, 'z', 'steel', 6);                                      // contratuerca M8
}, { world: true, noCheck: true, mount: 'rej' });
addPart('st_rej_valve', 'sta', 'Electroválvula 5/2 monoestable 24 V + 2 reguladores de flujo', b => {
  const z = FZ + 0.040, y = B - 0.075;
  b.bb(X - 0.150, X - 0.060, y - 0.008, y + 0.008, FZ + 0.008, FZ + 0.012, 'P');                // placa impresa a la brida
  b.bb(X - 0.140, X - 0.070, y - 0.011, y + 0.011, FZ + 0.012, FZ + 0.034, 'dark');            // cuerpo
  b.bb(X - 0.068, X - 0.040, y - 0.010, y + 0.010, FZ + 0.014, FZ + 0.032, 'black');           // bobina
  for (const dx of [-0.125, -0.105, -0.085]) b.cyl(0.004, 0.012, X + dx, y + 0.016, FZ + 0.023, 'y', 'brass', 10);
  for (const dx of [-0.115, -0.095]) b.cyl(0.005, 0.014, X + dx, y - 0.018, FZ + 0.023, 'y', 'dark', 10);   // silenciadores con regulador
  b.tube([[X - 0.105, y + 0.022, FZ + 0.023], [X - 0.100, B - 0.020, FZ + 0.040], [X - 0.010, B + 0.010, 0.170], [X, YC + 0.022, 0.158]], 0.002, 'blue', 32);
  b.tube([[X - 0.085, y + 0.022, FZ + 0.023], [X - 0.060, B - 0.030, 0.230], [X - 0.010, B + 0.012, 0.330], [X, YC + 0.022, 0.336]], 0.002, 'blue', 32);
  b.tube([[X - 0.125, y + 0.022, FZ + 0.023], [X - 0.140, B - 0.030, FZ + 0.060], [X - 0.300, B - 0.040, FZ + 0.050]], 0.002, 'blue', 24);   // alimentación 6 bar del compresor
}, { world: true, noCheck: true });
addPart('st_rej_ir', 'sta', 'Sensor E18-D80NK de la estación (I3 del LOGO!) en soporte impreso', b => {
  const x = X - 0.095, y = B + 0.016;
  b.bb(x - 0.020, x + 0.020, B - 0.060, B + 0.004, FZ, FZ + 0.006, 'P');
  b.bb(x - 0.020, x + 0.020, B + 0.004, B + 0.030, FZ - 0.004, FZ + 0.006, 'P');
  b.cyl(0.009, 0.045, x, y, FZ + 0.020, 'z', 'dark', 20); b.cyl(0.0115, 0.004, x, y, FZ + 0.004, 'z', 'steel', 6);
}, { world: true, noCheck: true });
addPart('st_rej_ramp', 'sta', 'Rampa impresa de salida sobre el labio (lado izquierdo, en el hueco)', b => {
  const x0 = X - RJ.GAP / 2 + 0.01, x1 = X + RJ.GAP / 2 - 0.01;
  b.box(x1 - x0, 0.003, 0.014, X, B + 0.004, -0.108, 'P', 0.35, 0, 0);                          // lengüeta: sube del borde de la cinta al labio
  b.bb(x0, x1, B + 0.0065, B + 0.009, -0.165, -0.112, 'P');                                     // cubre el canal
  b.box(x1 - x0, 0.003, 0.020, X, B - 0.002, -0.172, 'P', -0.6, 0, 0);                           // labio de caída a la charola
}, { world: true, noCheck: true });
addPart('st_rej_tray', 'sta', 'Charola de scrap (representativa) con hule espuma', b => {
  const zc = (RJ.TRAY0 + RJ.TRAY1) / 2, L = RJ.TRAY0 - RJ.TRAY1, yc = trayY(zc), a = RJ.SLOPE;
  b.box(0.45, 0.004, L / Math.cos(a), X, yc - 0.008, zc, 'Pd', -a, 0, 0);                        // piso
  b.box(0.44, 0.006, L / Math.cos(a) - 0.01, X, yc - 0.003, zc, 'foam', -a, 0, 0);               // hule espuma (amortigua la caída)
  for (const s of [-1, 1]) b.box(0.004, 0.030, L / Math.cos(a), X + s * 0.225, yc + 0.007, zc, 'Pd', -a, 0, 0);   // costados
  b.bb(X - 0.225, X + 0.225, trayY(RJ.TRAY1) - 0.010, trayY(RJ.TRAY1) + 0.040, RJ.TRAY1 - 0.004, RJ.TRAY1, 'Pd');   // tope del fondo
  for (const s of [-1, 1]) {                                                                    // 2 ménsulas al canal C (lado −z)
    const xm = X + s * 0.15;
    b.bb(xm - 0.020, xm + 0.020, B - 0.110, B - 0.020, -FZ - 0.008, -FZ, 'P');
    b.box(0.010, 0.012, 0.20, xm, trayY(-0.26) - 0.025, -0.26, 'P', -a, 0, 0);
    b.box(0.010, 0.090, 0.012, xm, B - 0.080, -FZ - 0.014, 'P', 0.55, 0, 0);
  }
}, { world: true, noCheck: true });
}
// ============================================================ ESTACIÓN DE DESCARGA (mesa inclinada, sin rodillos)
const RAMP = { x0: DOCK, y0: D.BELT, len: 1.40, r: 0 };
const rampPos = s => V3(RAMP.x0 + s * Math.cos(SLOPE), RAMP.y0 - s * Math.sin(SLOPE), 0);   // superficie de la tabla
const stRamp = addPart('st_ramp', 'sta', 'Mesa inclinada de descarga', b => {
  const qz = -SLOPE, mid = rampPos(RAMP.len / 2), T = 0.016;
  const at = (s, dy) => { const p = rampPos(s); return [p.x + Math.sin(SLOPE) * dy, p.y + Math.cos(SLOPE) * dy]; };
  const [mx, my] = at(RAMP.len / 2, -T / 2);
  b.box(RAMP.len, T, 0.30, mx, my, 0, 'melam', 0, 0, qz);                                     // tabla de melamina 1.4 m × 30 cm
  for (const s of [-1, 1]) {                                                                   // guías bajas (3 mm) que guían la quilla, 2–3 mm por lado
    const [gx, gy] = at(RAMP.len / 2, 0.0015);
    b.box(RAMP.len, 0.003, 0.006, gx, gy, s * (D.FW / 2 + 0.0055), 'wood', 0, 0, qz);
  }
  const [ex, ey] = at(RAMP.len - 0.012, 0.03);
  b.box(0.024, 0.06, 0.20, ex, ey, 0, 'foam', 0, 0, qz);                                       // tope acolchado (hule espuma)
  // caballete de entrada con la bisagra (fija el borde a 83 cm) y apoyo trasero con cuña
  const p0 = rampPos(0.03);
  for (const s of [-1, 1]) b.bb(p0.x - 0.02, p0.x + 0.02, 0, p0.y - T - 0.006, s * 0.12 - 0.02, s * 0.12 + 0.02, 'wood');
  b.bb(p0.x - 0.025, p0.x + 0.025, p0.y - T - 0.006, p0.y - T, -0.14, 0.14, 'wood');
  b.cyl(0.004, 0.24, p0.x, p0.y - T - 0.001, 0, 'z', 'steel', 10);                               // bisagra
  const p1 = rampPos(1.20);
  for (const s of [-1, 1]) b.bb(p1.x - 0.02, p1.x + 0.02, 0, p1.y - T - 0.035, s * 0.12 - 0.02, s * 0.12 + 0.02, 'wood');
  b.bb(p1.x - 0.03, p1.x + 0.03, p1.y - T - 0.035, p1.y - T - 0.029, -0.14, 0.14, 'wood');
  b.box(0.10, 0.03, 0.10, p1.x, p1.y - T - 0.017, 0, 'P', 0, 0, -0.30);                          // cuña para ajustar el ángulo
  funnelAndAruco(b);
}, { world: true, noCheck: true });
arucoMesh(stRamp.group, 0.344 - stRamp.home.x, 0.45 - stRamp.home.y, 0.30 - stRamp.home.z);
// pose de un fixture sobre la rampa (s = distancia del centro desde la orilla)
function rampFixturePose(s) {
  const p = rampPos(s);
  return { pos: V3(p.x, p.y, 0), rz: -SLOPE };
}

// ============================================================ MESA DE TRABAJO (Etapa 11)
const TABLE_OFF = V3(0.10, 0.596 - D.DH, 0.80);   // rev. 3.15: la placa subió D.DH con la bandeja; en la mesa se queda igual
addPart('mesa', 'sta', 'Mesa de trabajo', b => {
  b.bb(-0.36, 0.20, 0.700, 0.726, 0.55, 1.05, 'wood');
  for (const x of [-0.33, 0.17]) for (const z of [0.58, 1.02]) b.bb(x - 0.02, x + 0.02, 0, 0.70, z - 0.02, z + 0.02, 'wood');
}, { world: true, noCheck: true });

// ============================================================ TORNILLERÍA (rev. 3.19): cada tornillo de las piezas impresas
// Sale de los barrenos de prints.py, prints_rev311.py y newplates (gen_fast.py), ya en las coordenadas de la rev. 3.18.
SUBS.tor = { name: 'Tornillería', color: 0x3b4048, accent: 0x3b4048 };
const FAST = window.__AE_FAST;   // data/fast.js
const SCR = { M2: [1.0, 1.9, 1.5], M25: [1.25, 2.3, 1.8], M3: [1.5, 2.75, 3.0], M4: [2.0, 3.5, 4.0], M5: [2.5, 4.25, 5.0], M6: [3.0, 5.0, 6.0], M8: [4.0, 6.5, 8.0] };  // r, r de cabeza, alto de cabeza (mm)
const NUTS = { M2: [2.3, 1.6], M25: [2.9, 2.0], M3: [3.2, 2.4], M4: [4.0, 3.2], M5: [4.6, 4.0], M6: [5.8, 5.0], M8: [7.5, 6.5] };                     // r, alto (mm)
const AXV = { x: V3(1, 0, 0), y: V3(0, 1, 0), z: V3(0, 0, 1) };
function drawScrew(b, f) {
  const [r, hr, hh] = SCR[f.m].map(v => v / 1000), d = AXV[f.ax].clone().multiplyScalar(f.dir), A = V3(...f.at), L = f.L / 1000, C = (p, k) => p.clone().addScaledVector(d, k);
  const cyl = (rb, rt, h, c, mat, segs) => { const [r0, r1] = f.dir > 0 ? [rb, rt] : [rt, rb]; b.cyl(r0, h, c.x, c.y, c.z, f.ax, mat, segs, r1); };   // rb del lado de la cabeza
  const tw = f.wash ? 0.0012 : 0;
  if (f.wash) cyl(r * 2.1, r * 2.1, tw, C(A, -tw / 2), 'steel', 16);
  if (f.head === 'flat') cyl(hr, r, hr - r, C(A, (hr - r) / 2), 'dark', 16);
  else if (f.head === 'allen') cyl(hr, hr, hh, C(A, -tw - hh / 2), 'dark', 16);
  else if (f.head === 'pan') cyl(hr, hr, hh * 0.6, C(A, -tw - hh * 0.3), 'dark', 16);
  cyl(r * 0.92, r * 0.92, L, C(A, L / 2), f.head === 'set' ? 'dark' : 'steel', 12);
  if (!f.nut) return;
  const n = f.nut[1] / 1000;
  if (f.nut[0] === 'hex') { const [rn, hn] = NUTS[f.m].map(v => v / 1000); cyl(rn, rn, hn, C(A, n + hn / 2), 'steel', 6); }
  else if (f.nut[0] === 'sep') { const ls = f.nut[2] / 1000; cyl(0.0025, 0.0025, ls, C(A, n + ls / 2), 'melam', 12); }
  else { const ax = d.clone().negate(), al = AXV[f.nut[2]], P = C(A, n); b.stpAt('tnut', new THREE.Matrix4().makeBasis(al, ax, al.clone().cross(ax)), P.clone().addScaledVector(ax, -0.0015)); }
}
for (const g of FAST) {
  SHIFT_ID[g.id] = 0;
  addPart(g.id, 'tor', g.title, b => { for (const f of g.items) drawScrew(b, f); }, Object.assign({ nest: ['*'], noCheck: true }, g.mount ? { mount: g.mount } : {}, g.pivot ? { pivot: g.pivot } : {}));
}

// ============================================================ INVENTARIO (capítulo 0)
const INV = [];       // { id, zone, name, qty, anchor: V3 }
function cloneForInv(pid) {
  const src = PARTS.get(pid).group;
  const g = src.clone(true);
  const mats = [];
  g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.castShadow = true; if (o.material.emissive) mats.push({ mat: o.material, base: o.material.color.clone() }); } });
  return { g, mats };
}
function addInv(id, zone, name, qty, entries, sub) {
  const group = new THREE.Group(); group.name = id; worldRoot.add(group);
  const mats = [];
  let top = V3(0, 0, 0), n = 0, maxH = 0;
  for (const e of entries) {
    const [pid, x, z, rx = 0, ry = 0, rz = 0, dy = 0] = e;
    const { g, mats: m } = cloneForInv(pid);
    g.position.set(0, 0, 0); g.quaternion.setFromEuler(new THREE.Euler(rx, ry, rz));
    g.updateMatrixWorld(true);
    const bx = new THREE.Box3().setFromObject(g);
    g.position.set(x - (bx.min.x + bx.max.x) / 2, -bx.min.y + dy, z - (bx.min.z + bx.max.z) / 2);
    group.add(g); mats.push(...m);
    top.add(V3(x, 0, z)); n++; maxH = Math.max(maxH, bx.max.y - bx.min.y + dy);
  }
  top.divideScalar(n); top.y = maxH + 0.015;
  const p = { id, sub: sub || PARTS.get(entries[0][0]).sub, name, group, mats, home: V3(), homeQ: new THREE.Quaternion(), explode: V3(0, 0.15, 0),
    from: V3(0, 0.25, 0), mount: null, track: [], mode: '', localBox: new THREE.Box3(), nest: [], world: true, noCheck: true, only: null, inv: zone };
  PARTS.set(id, p);
  INV.push({ id, zone, name, qty, anchor: top });
}
// Rejilla de 4 columnas × 4 filas por zona (celdas de 30 cm), vista desde arriba
const ZX = { A: -1.32, B: 0, C: 1.32 };
const cell = (zone, col, row) => [ZX[zone] + (col - 1.5) * 0.30, (row - 1.5) * 0.30];
const at = (zone, col, row, dx = 0, dz = 0) => { const [x, z] = cell(zone, col, row); return [x + dx, z + dz]; };
const RZ90 = [0, 0, Math.PI / 2], RY90 = [0, Math.PI / 2, 0];
const E = (pid, xz, r = [0, 0, 0]) => [pid, xz[0], xz[1], ...r];
// Zona A: estructura, tracción y energía
addInv('inv_post', 'A', 'Postes 948 mm', '×4', [E('post_FL', at('A', 1.5, 0, 0, -0.03), RZ90), E('post_FR', at('A', 1.5, 0, 0, 0.03), RZ90)]);
addInv('inv_col', 'A', 'Columnas de la torre 888 mm', '×4 (propuesta)', [E('col_FL', at('A', 1.5, 0, 0, 0.09), RZ90), E('col_FR', at('A', 1.5, 0, 0, 0.14), RZ90)]);
addInv('inv_pf', 'A', 'Largueros 440 · travesaños 340', '×4 · ×6 (+1 de 198)', [E('larg_bL', at('A', 0.5, 1, 0, -0.05)), E('trav_bF', at('A', 0.5, 1, 0, 0.04), RY90)]);
addInv('inv_esc', 'A', 'Escuadras de aluminio y placas impresas', '×24 escuadras + 12 placas', [E('esc_c', at('A', 2, 1))]);
addInv('inv_nut', 'A', 'Tuercas T de martillo + Allen M6', '100 juegos', [E('nut_bF', at('A', 3, 1))]);
addInv('inv_cast', 'A', 'Rodaja Unicame 4" con freno + placa adaptadora', '×4', [E('cast_FL', at('A', 0, 2, -0.06, -0.07)), E('cast_FR', at('A', 0, 2, 0.06, -0.07)), E('cast_BL', at('A', 0, 2, -0.06, 0.07)), E('cast_BR', at('A', 0, 2, 0.06, 0.07))]);
addInv('inv_mot', 'A', 'Motor-rueda M0601', 'izq. FIT1042 · der. FIT1038', [E('mot_L', at('A', 1, 2, -0.05)), E('mot_R', at('A', 1, 2, 0.05))]);
addInv('inv_susp', 'A', 'Placas pivotantes y resortes', 'M8 · 608ZZ · k ≈ 3 N/mm', [E('susp_L', at('A', 2, 2, -0.03)), E('spring_R', at('A', 2, 2, 0.08))]);
addInv('inv_bat', 'A', 'Batería BR-1224', '12 V · 24 Ah · 8.3 kg', [E('bat', at('A', 3, 2))], 'elec');
addInv('inv_bat2', 'A', 'Correa con hebilla', '+ cuna y topes impresos', [E('bat_hold', at('A', 1.5, 3))], 'elec');
// Zona B: torre, empujador y fixtures
addInv('inv_screw', 'B', 'Husillos TR8 60 cm + varillas 8 mm', '×2 · medir el avance al recibirlos', [E('screw_L', at('B', 0.5, 0, 0, -0.05), RZ90), E('screw_R', at('B', 0.5, 0, 0, -0.015), RZ90), E('rod_L', at('B', 0.5, 0, 0, 0.03), RZ90), E('rod_R', at('B', 0.5, 0, 0, 0.065), RZ90)]);
addInv('inv_guide', 'B', 'Guías en L impresas', '×4 · ~50 cm', [E('guide_BL', at('B', 2.5, 0, 0, -0.03), RZ90), E('guide_BR', at('B', 2.5, 0, 0, 0.04), RZ90)]);
addInv('inv_nema', 'B', 'NEMA 17 17HS4401', '×3', [E('nema_L', at('B', 0, 1, -0.05)), E('nema_R', at('B', 0, 1, 0.01)), E('pnema', at('B', 0, 1, 0.07))]);
addInv('inv_kfl', 'B', 'KFL08 ×4 · cople ×2', '5 → 8 mm', [E('kflLo_L', at('B', 1, 1, -0.04, -0.03)), E('kflLo_R', at('B', 1, 1, 0.04, -0.03)), E('kflUp_L', at('B', 1, 1, -0.04, 0.04)), E('kflUp_R', at('B', 1, 1, 0.04, 0.04)), E('cople_L', at('B', 1, 1, 0.10, 0))]);
addInv('inv_sc', 'B', 'SC8UU', '×6 · varillas 8 mm', [E('sc_L', at('B', 2, 1))]);
addInv('inv_lsw', 'B', 'Final de carrera', '×4', [E('lsw_L', at('B', 3, 1, -0.03)), E('lsw_R', at('B', 3, 1, 0.03))]);
addInv('inv_plat', 'B', 'Plataforma impresa', '21 × 18 cm, 2 brazos', [E('plat', at('B', 0, 2, 0.02))]);
addInv('inv_sled', 'B', 'Carro, placa 15 × 3 y cremallera', '2 tramos de 15 cm', [E('sled', at('B', 1.5, 2, 0.02))]);
addInv('inv_pin', 'B', 'Piñón m1.5 z20 · MG90S · pin', 'servo de 180°', [E('pinion', at('B', 3, 2, -0.05)), E('servo', at('B', 3, 2, 0.03)), E('pin', at('B', 3, 2, 0.08))]);
addInv('inv_fx', 'B', 'Fixtures con quilla y bastidores', '×6 · nivel de 7.0 cm', [E('fx0', at('B', 1, 3, -0.04)), E('fx1', at('B', 2, 3, 0.04))]);
// Zona C: electrónica
addInv('inv_perf', 'C', 'Placa perforada 9 × 15', 'headers, borneras, R y C', [E('perf', at('C', 0, 3, 0.0)), E('J4', at('C', 0, 3, 0.07)), E('J6', at('C', 0, 3, -0.07))]);
addInv('inv_mods', 'C', 'ESP32 · 3 A4988 · MAX485', 'convertidor · BNO055', [E('esp32', at('C', 0, 0, -0.03, -0.02)), E('drv1', at('C', 0, 0, 0.03, -0.06)), E('drv2', at('C', 0, 0, 0.06, -0.06)), E('drv3', at('C', 0, 0, 0.09, -0.06)),
  E('max485', at('C', 0, 0, 0.05, 0.03)), E('lvl', at('C', 0, 0, -0.08, -0.06)), E('bno', at('C', 0, 0, -0.06, 0.06))]);
addInv('inv_boost', 'C', 'Elevador 400 W', '12 → 18 V', [E('boost', at('C', 1, 0, 0.05))]);
addInv('inv_xl', 'C', 'Reductor XL4005', '12 → 5 V', [E('xl4005', at('C', 2, 0))]);
addInv('inv_relay', 'C', 'Relé T90 30 A', '2 canales', [E('relay', at('C', 3, 0))]);
addInv('inv_fuse', 'C', 'Fusibles y portafusibles', '15 A · 5 A', [E('fuses', at('C', 0, 1, 0.03))]);
addInv('inv_stop', 'C', 'KCD1 y paro LAY37', 'encendido · paro NC', [E('kcd1', at('C', 1, 1, -0.05)), E('estop', at('C', 1, 1, 0.04))]);
addInv('inv_vl', 'C', 'VL53L0X', '×4 · 3 obstáculos + 1 pila', [E('vl_front', at('C', 2, 1, -0.03)), E('vl_pile', at('C', 2, 1, 0.04))]);
addInv('inv_jet', 'C', 'Jetson Orin Nano Super', 'ya comprado', [E('jetson', at('C', 0, 2, 0.05))]);
addInv('inv_cam', 'C', 'Cámara Logitech C920', 'ya la tiene Mario', [E('camera', at('C', 1, 2, 0.03))]);
addInv('inv_tray', 'C', 'Bandeja impresa', 'porta-placa + calza-escuadra', [E('tray', at('C', 2.5, 2, 0.06))]);

// ============================================================ CAPÍTULOS Y PASOS (2 modos: rápido y súper explicativo)
const ids = pre => [...PARTS.keys()].filter(k => k.startsWith(pre));
const invZone = z => INV.filter(i => i.zone === z);
const PF_IDS = PF.map(f => f.id);
const onTable = id => { const p = PARTS.get(id); return { pos: p.home.clone().add(TABLE_OFF), q: new THREE.Quaternion() }; };
const CH_BASE = [
  { key: 'inv', n: '0', name: 'Inventario' }, { key: 'perfil', n: 'E6', name: 'Perfil' }, { key: 'base', n: 'E7', name: 'Base' }, { key: 'estr', n: 'E8', name: 'Estructura' },
  { key: 'elev', n: 'E9', name: 'Elevador' }, { key: 'emp', n: 'E10', name: 'Empujador y uña' }];
const CH_OP = { key: 'op', n: '▶', name: 'Funcionamiento' };

// ---------- mecánica: carga y descarga (funciones puras del tiempo)
const RSTOP = i => 1.40 - 0.026 - D.FL / 2 - i * (D.FL + 0.004);           // dónde se detiene el i-ésimo en la mesa inclinada (antes del tope acolchado)
const CLAW_BACK = D.CLAWU - 0.005;                                        // con la uña abajo, cara trasera del fixture = placa + 4.5 mm (travesaño de 5 mm)
function pileSet(m, list, top) { list.forEach((fi, k) => { m.fx[fi] = { x: D.XC, y: top + k * D.PITCH, z: 0, rz: 0 }; }); }
// Carga con la banda real (18-oct): durante la carga la cinta corre (solo se detiene en la inspección, antes). El fixture viaja a BND.V hasta que su centro pasa la cresta
// del rodillo de Ø50 (BELT_XA); ahí el frente baja los 3 mm a la pila y queda apoyado en 2 puntos: la cresta (atrás) y
// la esquina del frente (adelante). Sobre la cresta sigue ≥ 50 % del peso, así que la cinta lo sigue empujando
// (si μ cinta > μ PETG) hasta que su cola deja la cresta y cae plano: queda ~6 cm afuera. La uña jala el resto.
const LD = {
  dy: D.BELT - D.LOAD0,                                                   // 3 mm: tope de la pila abajo de la cinta
  CLAWV: 0.025,                                                           // la uña jala a 25 mm/s
  DROP: 0.12,                                                             // s que tarda la cola en bajar los 3 mm
};
LD.TH1 = Math.asin(LD.dy / D.FL);                                          // inclinación cuando la cola está en la cresta
LD.RLAND = BELT_XA - D.FL * Math.cos(LD.TH1);                               // frente del fixture al caer (0.103)
LD.XLAND = LD.RLAND + D.FL / 2;                                            // su centro (0.209)
const PW = LD.RLAND - 0.002;                                              // espera del empujador: la placa 2 mm detrás del fixture → la uña cae 2.5 mm delante de su travesaño
LD.PULLEND = D.XC - D.FL / 2 - CLAW_BACK;
LD.TP = (PW - LD.PULLEND) / LD.CLAWV;                                     // 3.2 s jalando
LD.T = { a: 1.0 }; LD.T.b = LD.T.a + LD.TP; LD.T.c = LD.T.b + 0.3; LD.T.d = LD.T.c + 0.7; LD.T.e = LD.T.d + 0.8; LD.T.f = LD.T.e + 7.0;   // tiempos desde que cae (s reales)
LD.PREP = 2.2;                                                            // el empujador va a la espera antes de que llegue
LD.TC = LD.PREP + LD.T.f;                                                  // ciclo mínimo entre 2 fixtures (~15 s)
function fxOnBelt(tr, x0) {                       // pose del fixture puesto con su centro en x0 (tr = 0) hasta que queda plano en la pila
  const d = BND.V * tr - (x0 - BELT_XA), h = D.FL / 2;                      // cuánto pasó su centro de la cresta
  if (d <= 0) return { x: x0 - BND.V * tr, y: D.BELT, rz: 0 };               // todo sobre la cinta (el frente puede ir volado)
  if (d < h) {                                                              // apoyado en la cresta y en la esquina del frente
    const u = h + d, th = Math.asin(LD.dy / u), xf = BELT_XA - u * Math.cos(th);
    return { x: xf + h * Math.cos(th), y: D.LOAD0 + h * Math.sin(th), rz: th };
  }
  const th = LD.TH1 * (1 - clamp01((d - h) / (BND.V * LD.DROP)));          // la cola deja la cresta y baja los 3 mm
  return { x: LD.RLAND + h * Math.cos(th), y: D.LOAD0 + h * Math.sin(th), rz: th };
}
const tLand = x0 => (x0 - LD.XLAND) / BND.V + LD.DROP;                      // s desde que se pone en x0 hasta que queda plano
function loadMech(m, tp, n) {                     // empujador, uña y plataforma; tp = s desde que el fixture cayó a la pila de n
  const T = LD.T, plat0 = D.LEVEL(n), plat1 = D.LEVEL(n + 1);
  let p = lerp(D.P0, PW, segE(tp, -LD.PREP, -LD.PREP + 1.2));
  if (tp > T.a) p = lerp(PW, LD.PULLEND, seg(tp, T.a, T.b));
  if (tp > T.b) p = lerp(LD.PULLEND, LD.PULLEND + 0.002, seg(tp, T.b, T.c));
  if (tp > T.d) p = lerp(LD.PULLEND + 0.002, D.P0, segE(tp, T.d, T.e));
  m.push = p;
  m.pin = segE(tp, 0.3, T.a) * (1 - segE(tp, T.c, T.d));
  m.plat = lerp(plat0, plat1, seg(tp, T.e, T.f));                          // 7.0 cm a 10 mm/s
}
function loadCycle(m, tr, n, fi, x0) {            // carga del fixture fi (puesto en la cinta con su centro en x0) sobre una pila de n; tr en s reales
  const tl = tLand(x0);
  loadMech(m, tr - tl, n);
  if (tr < tl) { const f = fxOnBelt(tr, x0); m.fx[fi] = { x: f.x, y: f.y, z: 0, rz: f.rz }; return; }
  const r = Math.min(LD.RLAND, Math.max(D.XC - D.FL / 2, m.push + CLAW_BACK));
  m.fx[fi] = { x: r + D.FL / 2, y: m.plat + n * D.PITCH, z: 0, rz: 0 };
}
// Descarga física (rev. 3.8): el fixture se empuja plano sobre la plataforma (0.832); cuando su centro de masa pasa la
// orilla de la mesa (DOCK, 0.830) se vuelca sobre ella (0.25 s) y resbala por la mesa hasta su lugar. Si la placa lo
// alcanza mientras sigue atrás de la orilla, lo empuja por su cara trasera (nunca lo atraviesa).
const UNL_TIP = 0.25;                                 // s que tarda en volcarse sobre la orilla
function fixtureOnSlope(s) {                          // origen del fixture (centro de la base) a s de la orilla, sobre la mesa
  const p = rampPos(s); return { x: p.x, y: p.y, rz: -SLOPE };
}
function sPushedBy(px, th = SLOPE, dy = 0) {         // s mínimo (a lo largo de la base inclinada th, desde la orilla) para que la cara trasera libre la placa en x = px
  const h = D.FL / 2, c = Math.cos(th), sn = Math.sin(th), E = rampPos(0);
  const X = s => { const v0 = Math.max(0, (D.PY0 - E.y - dy - (h - s) * sn) / c); return E.x + (s - h) * c + v0 * sn; };
  let lo = -h, hi = h * 3;
  if (X(lo) >= px) return lo;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (X(mid) >= px) hi = mid; else lo = mid; }
  return hi;
}
function unloadCycle(m, t, n, fi, slot, k = 1) {      // saca el de arriba (fi) de una pila de n; slot = lugar en la rampa
  const T = x => x * k;
  const lvl = D.UNLV(n);
  m.plat = lvl;
  const pushAt = tt => tt > T(3.4) ? lerp(D.P0 + D.STROKE, D.P0, segE(tt, T(3.6), T(5.0))) : lerp(D.P0, D.P0 + D.STROKE, segE(tt, T(0.3), T(3.4)));
  const p = pushAt(t);
  m.push = p;
  const h = D.FL / 2, E = rampPos(0), r0 = D.XC - h, base = lvl + (n - 1) * D.PITCH;
  // instante en que el centro de masa llega a la orilla (la placa va en x = E.x − h)
  let a = T(0.3), b = T(3.4);
  for (let i = 0; i < 40; i++) { const mid = (a + b) / 2; if (pushAt(mid) >= E.x - h) b = mid; else a = mid; }
  const tTip = b;
  if (t <= tTip) { m.fx[fi] = { x: Math.max(r0, p) + h, y: base, z: 0, rz: 0 }; return; }
  const sEnd = RSTOP(slot);
  if (t <= tTip + UNL_TIP) {                           // se vuelca sobre la orilla (y baja los 2 mm de la plataforma a la orilla) mientras la placa lo sigue empujando
    const u = segE(t, tTip, tTip + UNL_TIP), th = SLOPE * u, dy = (base - E.y) * (1 - u);
    const sv = Math.max(0, sPushedBy(p, th, dy));
    m.fx[fi] = { x: E.x + sv * Math.cos(th), y: E.y + dy - sv * Math.sin(th), z: 0, rz: -th };
    return;
  }
  const sFree = lerp(0, sEnd, segE(t, tTip + UNL_TIP, tTip + UNL_TIP + T(2.0)));
  const sPush = sPushedBy(pushAt(Math.min(t, T(3.4))));        // lo más lejos que lo dejó la placa
  const pose = fixtureOnSlope(Math.min(sEnd, Math.max(sFree, sPush)));
  m.fx[fi] = { x: pose.x, y: pose.y, z: 0, rz: pose.rz };
}
function rampSet(m, list) { list.forEach((fi, slot) => { const p = rampFixturePose(RSTOP(slot)); m.fx[fi] = { x: p.pos.x, y: p.pos.y, z: 0, rz: p.rz }; }); }

// rev. 3.15: la placa, sus pines y las terminales de la bandeja subieron D.DH con la bandeja.
// rev. 3.17: fuera de defineSteps (se llama una vez por modo y los pines subían D.DH cada vez: los círculos de las puntas quedaban arriba)
for (const k in PIN) PIN[k].pos.y += D.DH;
for (const k in TP) TP[k].pos.y += D.DH;
BRD.y += D.DH;
function defineSteps(DET) {
const STEPS = [];
const CHAPTERS = DET
  ? [...CH_BASE, { key: 'placa', n: 'E11', name: 'Placa' }, { key: 'cables', n: 'E11', name: 'Cable por cable' }, { key: 'pot', n: 'E11', name: 'Potencia' }, { key: 'carro', n: 'E13', name: 'Al carrito' }, { key: 'acople', n: 'E15', name: 'Acople a la banda' }, CH_OP]
  : [...CH_BASE, { key: 'elec', n: 'E11·13', name: 'Electrónica' }, { key: 'acople', n: 'E15', name: 'Acople a la banda' }, CH_OP];
function S(o) {
  if (o.cam && o.cam.t && !o.cam.fit && D.DH) { const t = o.cam.t; o = Object.assign({}, o, { cam: Object.assign({}, o.cam, { t: [t[0], t[1] + D.DH * liftW(t[1]), t[2]] }) }); }   // cámaras escritas a mano junto al marco de abajo
  const st = Object.assign({ dur: 8, add: [], labels: [], dims: [], dimOld: true, addStart: 0.3, stagger: 0.45, addDur: 1.3 }, o);
  st.chKey = st.ch; st.ch = CHAPTERS.findIndex(c => c.key === st.ch);
  if (st.ch < 0) console.warn('Capítulo desconocido', st.chKey);
  STEPS.push(st);
}
// ====================================================== CAPÍTULO 0 — INVENTARIO
const INV_TXT = {
  A: ['Estructura, tracción y energía', {
    que: 'Antes de armar, cuenten cada pieza contra la lista de compras y guárdenla en cajas etiquetadas por subsistema: tracción, torre, empujador, electrónica y tornillería.',
    porque: 'Si falta una pieza a media etapa, se detiene todo. Y lo que se mide al recibir (altura y barrenos de las rodajas, conectores del M0601, resortes) corrige el CAD.',
    herr: 'Vernier, flexómetro, báscula de cocina, cajas con etiqueta.',
    check: 'Hay un M0601 izquierdo (FIT1042) y uno derecho (FIT1038), no dos iguales.',
    error: 'Comprar dos M0601 del mismo lado: una rueda giraría al revés de lo esperado y no embona igual.' }],
  B: ['Torre, empujador y fixtures', {
    que: 'Revisen las piezas de la torre y el empujador. Los husillos de UNIT ya están pedidos: en cuanto lleguen, midan cuánto avanza la tuerca en una vuelta.',
    porque: 'Solo el husillo de 1 entrada (avance 2 mm) se autobloquea: si se va la energía, la pila no se cae.',
    herr: 'Plumón y vernier para la prueba del husillo.',
    check: 'Prueba del husillo: con una vuelta la tuerca avanza 2 mm. Si avanza 8 mm es de 4 entradas: se usa el plan B (Etapa 9).',
    error: 'Comprar el MG90S de 360°: no se queda en un ángulo. La uña necesita el de 180°.' }],
  C: ['Electrónica', {
    que: 'Cuenten los módulos (ESP32, 3 A4988, MAX485, convertidor, BNO055) y pruébenlos sueltos en el banco de pruebas (Etapa 2B) antes de soldar nada.',
    porque: 'Un módulo dañado se descubre en la mesa, no con el carrito armado.',
    herr: 'Multímetro, protoboards y cables dupont.',
    check: 'Batería cargada con el BR-700, marcando ~12.8 V en reposo.',
    error: 'Probar un motor conectándolo "a ver qué pasa" a una fuente: nada se conecta hasta la Etapa 11.' }],
};
const INV_CAM = { A: { t: [ZX.A, 0.0, 0.02], d: [0.0, 1, 0.42], r: 0.66 }, B: { t: [ZX.B, 0.0, 0.02], d: [0.0, 1, 0.42], r: 0.66 }, C: { t: [ZX.C, 0.0, 0.02], d: [0.0, 1, 0.42], r: 0.66 } };
for (const z of ['A', 'B', 'C']) {
  const items = invZone(z);
  S({ ch: 'inv', et: 'Inventario', title: INV_TXT[z][0], txt: INV_TXT[z][1], dur: 11, cam: INV_CAM[z], inv: z,
    add: z === 'A' ? INV.map(i => i.id) : [], addStart: 0.1, stagger: 0.05, addDur: 0.8,
    labels: items.map((it, k) => ({ at: it.anchor.toArray(), t: it.name, s: it.qty, when: 0.6 + k * 0.15, cls: 'inv' })) });
}

// ====================================================== CAPÍTULO 1 — ETAPA 6 — PERFIL
S({ ch: 'perfil', et: 'Etapa 6', title: 'Barra de 6 m + barra de 2 m + piezas cortas', dur: 9,
  cam: { t: [0.0, 0.0, BAR_Z0 + BAR_DZ], d: [0.0, 1.0, 0.75], r: 3.1 },
  add: [{ ids: PF_IDS, pose: id => barPose(id, 0.003), from: [0, 0.35, 0] }, 'waste0', 'waste1'], stagger: 0.12,
  show: ['waste0', 'waste1'],
  labels: BARS.map((b, k) => ({ at: [[-0.2, -2.0, 0.7][k], 0.03, BAR_Z0 + k * BAR_DZ], t: ['Barra 1 · 6 m (PEI)', 'Barra 2 · 2 m (ya la tienen)', 'Faltan · piezas cortas'][k], s: b.note.replace(/^[^·]*· /, ''), when: 1.2 + k * 0.5, cls: 'inv' + (k === 2 ? ' hot' : '') })),
  dims: [{ a: [BAR_X0, 0.03, BAR_Z0 - 0.02], b: [BAR_X0 + 6.0, 0.03, BAR_Z0 - 0.02], off: [0, 0, -0.16], text: '6000 mm', when: 1.5 }],
  txt: { que: 'Ya tienen 1 barra de 6 m (PEI) y la de 2 m. De ahí salen todos los cortes largos: los 4 postes de 948, las 4 columnas de 888, un travesaño de 340 y el de 198. Faltan solo piezas cortas (440 × 4 y 340 × 5): salen de cualquier barra extra de la escuela de 440 mm o más (se cuentan el 16-oct).',
    porque: 'Primero los largos de la barra de 6 m: si un corte sale mal, todavía queda material para repetirlo. Cada corte se come ~3 mm.',
    herr: 'Flexómetro, escuadra, plumón; para cortar: pulidora con disco de 1 mm (siguiente paso).',
    check: 'La punta de cada barra está a escuadra; si no, recorten 5 mm para emparejarla.',
    error: 'Medir cada pieza desde la anterior y no desde la punta: los errores se suman.' } });
S({ ch: 'perfil', et: 'Etapa 6', title: 'Cortar con pulidora y llegar a medida con lima', dur: 9,
  cam: { t: [-1.6, 0.0, BAR_Z0 + BAR_DZ], d: [0.0, 1.0, 0.45], r: 1.3 },
  add: [{ ids: PF_IDS, pose: id => barPose(id, 0.06) }], stagger: 0.05,
  show: ['waste0', 'waste1'], focus: PF_IDS,
  labels: [{ p: 'post_FL', o: [0, 0.03, 0], t: 'Poste · 948 mm', s: 'corten 2–3 mm más largo · lima hasta ±1 mm', when: 1.6 }, { p: 'col_FL', o: [0, 0.03, 0], t: 'Columna · 888 mm', s: 'las 4 iguales: límenlas prensadas juntas', when: 2.2 },
    { p: 'trav_sc', o: [0, 0.03, 0], t: 'Travesaño · 340 mm', when: 2.8 }],
  txt: { que: 'Tracen la línea con escuadra en 2 caras. Con la barra sujeta en tornillo de banco o con prensas, corten con la pulidora 2–3 mm más largo que la medida. Esperen a que se enfríe y lleguen a la medida con la lima, revisando con escuadra y vernier. Las piezas iguales (postes, columnas, largueros) se liman prensadas juntas.',
    porque: 'A mano la pulidora no corta exacto ni a escuadra: el corte largo y la lima lo corrigen. Prensadas juntas, las piezas iguales quedan idénticas.',
    herr: 'Pulidora de 4½" con discos de corte de 1 mm (nunca disco con dientes), tornillo de banco o prensas, lentes o careta, guantes, escuadra, vernier, lima plana y media caña.',
    check: 'Largo final ±1 mm, corte a escuadra y una tuerca T entra en la ranura de cada pieza.',
    error: 'Sostener la barra con la mano mientras cortan, o cortar justo a la medida: la pieza sale corta y ya no tiene arreglo.' } });
S({ ch: 'perfil', et: 'Etapa 6', title: 'Las 19 piezas, marcadas y ordenadas', dur: 8,
  cam: { t: [0.15, 0.0, 0.78], d: [0.25, 1.0, 0.8], r: 0.95 },
  add: [{ ids: PF_IDS, pose: id => sortedPose(id) }], stagger: 0.04,
  labels: [{ at: [-0.50, 0.04, 0.62 + 0.075], t: '4 × 948 mm', s: 'postes', when: 1.8 }, { at: [-0.50, 0.04, 0.86 + 0.075], t: '4 × 888 mm', s: 'columnas de la torre (propuesta)', when: 2.0 },
    { at: [0.28, 0.04, 0.62 + 0.075], t: '4 × 440 mm', s: 'largueros de los marcos', when: 2.2 },
    { at: [0.86, 0.04, 0.62 + 0.15], t: '6 × 340 + 1 × 198 mm', s: 'marcos, central, superior central y empujador', when: 2.4 }],
  txt: { que: 'Marquen cada pieza con su nombre ("poste 1", "larguero arriba") y limpien la viruta de las ranuras con aire o una brocha.',
    porque: 'Las 19 piezas se ven casi iguales; marcadas, cada una va a su lugar a la primera.',
    herr: 'Plumón, brocha o aire.',
    check: 'Los 4 postes miden lo mismo (máximo 1 mm de diferencia); las 4 columnas, los 4 largueros y los travesaños, también.',
    error: 'Postes de distinto largo: el carrito queda cojo y la torre se tuerce.' } });

// ====================================================== CAPÍTULO 2 — ETAPA 7 — BASE
const yTopB = D.H0 + D.PF;
S({ ch: 'base', et: 'Etapa 7', title: 'Postes y marco inferior con escuadras', dur: 9,
  cam: { t: [0, 0.48, 0], d: [0.9, 0.5, 1.05], r: 0.72 },
  add: [['larg_bL', 'larg_bR', 'trav_bF', 'trav_bB'], ['post_FL', 'post_FR', 'post_BL', 'post_BR'], 'esc_b'], stagger: 1.8, addDur: 1.6,
  labels: [{ p: 'larg_bL', o: [-0.1, 0.03, 0], t: 'Larguero 440 mm', when: 1.2 }, { p: 'trav_bF', o: [0, 0.03, 0.08], t: 'Travesaño 340 mm', when: 1.5 },
    { p: 'post_FR', o: [0.02, 0.36, 0.02], t: 'Poste 948 mm', s: 'en cada esquina', when: 2.6 }, { p: 'esc_b', o: [0.2, 0.06, 0.2], t: 'Escuadras de aluminio', s: 'por dentro de la unión · M6 + tuerca T', when: 4.4 }],
  dims: [{ a: [D.L / 2, 0.02, D.W / 2 + 0.002], b: [-D.L / 2, 0.02, D.W / 2 + 0.002], off: [0, 0, 0.07], text: '500 mm', when: 5.0 },
    { a: [D.L / 2 + 0.002, 0.02, -D.W / 2], b: [D.L / 2 + 0.002, 0.02, D.W / 2], off: [0.07, 0, 0], text: '400 mm (frente)', when: 5.3 },
    { a: [D.XP + 0.016, D.H0, D.ZP + 0.016], b: [D.XP + 0.016, D.HT, D.ZP + 0.016], off: [0.05, 0, 0.05], text: '948 mm', when: 3.0 }],
  txt: { que: 'Paren los 4 postes en las esquinas y unan sus pies con los 2 largueros de 440 mm (lados largos) y los 2 travesaños de 340 mm (frente y atrás), al ras de abajo. En cada unión, 2 escuadras de aluminio por dentro.',
    porque: 'Los tornillos M6 × 16 se aprietan solo a medias: primero hay que escuadrar.',
    herr: 'Llaves Allen, tornillos M6 × 16 y tuercas T de martillo.',
    check: 'Las escuadras asientan planas contra el perfil y los tornillos entran sin forzar.',
    error: 'Escuadra con las lengüetas fuera de la ranura: no asienta plana y el marco queda chueco. Las 2 lengüetas de cada pata van dentro de la ranura del perfil.' } });
S({ ch: 'base', et: 'Etapa 7', title: 'Tuercas T de martillo: entran de frente', dur: 8,
  cam: { t: [0.12, 0.10, 0.10], d: [0.85, 0.9, 1.0], r: 0.24 },
  add: [['nut_bL', 'nut_bR', 'nut_bF', 'nut_bB']], addStart: 0.4, addDur: 1.8,
  labels: [{ p: 'nut_bR', o: [0.03, 0.03, 0.03], t: 'Tuerca T de martillo M6', s: 'entra de frente en la ranura, aun con el marco armado', when: 2.2 },
    { p: 'nut_bF', o: [0.03, 0.03, -0.03], t: 'Al apretar el Allen gira 90° y se traba', s: 'tornillo + rondana + pieza', when: 3.4 }],
  txt: { que: 'Las tuercas T de martillo se meten de frente en la ranura en cualquier momento: entran de lado y, al apretar el tornillo Allen, giran un cuarto de vuelta y se traban. Pongan tornillo, rondana, la pieza, y aprieten.',
    porque: 'No hay que meterlas antes de cerrar el marco (como las hexagonales) y no giran en la ranura. 100 juegos alcanzan para todo el carrito.',
    herr: 'Tuercas T de martillo M6 para perfil 3030 (ranura de 8 mm), tornillos Allen M6 × 16, llave Allen de 5 mm.',
    check: 'Al apretar, la tuerca se traba y el tornillo no gira en falso.',
    error: 'Apretar sin que la tuerca haya girado: queda de lado y se sale. Den un toque al tornillo antes de apretar.' } });
const diagY = yTopB + 0.003;
S({ ch: 'base', et: 'Etapa 7', title: 'Escuadrar: las 2 diagonales iguales', dur: 8,
  cam: { t: [0, 0.10, 0], d: [0.32, 1, 0.42], r: 0.42 },
  dims: [{ a: [D.L / 2, diagY, -D.W / 2], b: [-D.L / 2, diagY, D.W / 2], text: '≈ 640 mm', when: 0.6, grow: [0.6, 2.4], cls: 'hot', labAt: 0.25 },
    { a: [D.L / 2, diagY + 0.004, D.W / 2], b: [-D.L / 2, diagY + 0.004, -D.W / 2], text: '≈ 640 mm (±2 mm)', when: 2.8, grow: [2.8, 4.6], cls: 'hot', labAt: 0.75 }],
  labels: [{ at: [0, diagY + 0.02, 0], t: 'Diagonales iguales = esquinas a 90°', s: '√(500² + 400²) ≈ 640 mm', when: 5.0 }],
  txt: { que: 'Midan las 2 diagonales del rectángulo de abajo con el flexómetro, de esquina exterior a esquina exterior. Si no son iguales (±2 mm), empujen la esquina larga hasta igualarlas y entonces aprieten firme.',
    porque: 'Un rectángulo con diagonales iguales tiene sus 4 esquinas a escuadra; todo lo de arriba hereda este marco.',
    herr: 'Flexómetro y llave Allen.',
    check: 'Diagonales del marco de abajo iguales (±2 mm).',
    error: 'Apretar todo antes de escuadrar: luego no hay forma de enderezarlo.' } });
S({ ch: 'base', et: 'Etapa 7', title: 'Travesaño central', dur: 7,
  cam: { t: [0, 0.10, 0], d: [0.5, 0.9, 0.9], r: 0.40 },
  add: ['trav_c', 'esc_c'], stagger: 1.6,
  labels: [{ p: 'trav_c', o: [0, 0.03, 0.06], t: 'Travesaño central 340 mm', s: 'de aquí cuelgan las placas de los motores', when: 1.6 }],
  dims: [{ a: [D.L / 2, yTopB, D.ZP + 0.02], b: [0, yTopB, D.ZP + 0.02], off: [0, 0.03, 0.03], text: '250 mm', when: 2.0 }],
  txt: { que: 'Pongan el travesaño central de 340 mm a la mitad de los largueros, con 1 escuadra en cada lado, por el costado de atrás (por el frente pasan los motores de las ruedas).',
    porque: 'Ahí se sujetan las placas pivotantes de los 2 motores.',
    herr: 'Llaves Allen, flexómetro.',
    check: 'Queda a 250 mm de cada extremo y sus escuadras asientan planas.',
    error: 'No dejar tuercas en la ranura de abajo del travesaño: ahí se atornillan los soportes del pivote.' } });
S({ ch: 'base', et: 'Etapa 7', title: 'Rodajas de 4" en las esquinas', dur: 9,
  cam: { t: [0.05, 0.07, 0.05], d: [1, 0.3, 0.75], r: 0.40 },
  add: [['cast_FL', 'cast_FR', 'cast_BL', 'cast_BR']], addStart: 0.3,
  labels: [{ p: 'cast_FR', o: [0.03, 0.03, 0.04], t: 'Rodaja Unicame 4" con freno', s: 'poliuretano · doble balero · ~6 kg de carga c/u', when: 2.0 },
    { p: 'cast_FR', o: [-0.02, 0.07, -0.05], t: 'Placa de la rodaja', s: 'directo bajo el marco (ya montadas)', when: 3.2 }],
  dims: [{ a: [D.CX + 0.05, 0, D.CZ + 0.05], b: [D.CX + 0.05, D.H0, D.CZ + 0.05], off: [0.04, 0, 0.03], text: '10.3 cm', when: 2.4 },
    { a: [D.CX, 0.003, D.CZ], b: [D.CX - D.CR, 0.003, D.CZ], off: [0, 0, 0.11], text: 'radio de giro ~89 mm', when: 4.2, labAt: 0.35 }],
  txt: { que: 'Las 4 rodajas van atornilladas directo bajo las esquinas del marco (así las montaron).',
    porque: 'La rodaja mide 10.3 cm del piso a la cara de su placa: fija la altura del marco de abajo. Por eso las calzas de la suspensión miden 13 mm.',
    herr: 'Llaves Allen y de 13 mm.',
    check: 'Paren la base en un piso plano: las 4 rodajas tocan el piso, giran 360° sin tocar nada y el freno traba.',
    error: 'Tornillos flojos en la placa: la rodaja se tuerce al girar. Revisen el apriete cada semana.' } });
if (DET) {                                                                         // rev. 3.26: la suspensión por partes
  const CAMS = { t: [0.02, 0.06, -0.17], d: [0.5, 0.35, -1], r: 0.15 };
  S({ ch: 'base', et: 'Etapa 7', title: 'Calzas y soportes del pivote', dur: 8, cam: CAMS,
    add: ['susp_sop_L', 'susp_sop_R'], stagger: 1.2,
    labels: [{ p: 'susp_sop_L', o: [0, -0.03, -0.03], t: 'Soporte del pivote', s: 'M6 × 30 por el hueco de abajo', when: 1.6 },
      { p: 'susp_sop_L', o: [0, 0.03, -0.05], t: 'Calza de 13 mm', s: 'entre el soporte y el travesaño central', when: 3.0 }],
    txt: { que: 'Metan el M6 × 30 por abajo del soporte, en el hueco de Ø11 (la cabeza queda adentro). Pongan encima la calza de 13 mm y enrosquen la tuerca T de martillo 2–3 vueltas en la punta que sale. Metan la tuerca T de lado en la ranura de abajo del travesaño central y aprieten con una Allen larga de 5 mm por el hueco: la tuerca gira 90° y se traba. La tuerca M8 entra después, por la ranura que abre abajo del soporte.',
      porque: 'El marco quedó 13 mm más alto que el diseño (rodajas de 103 mm): la calza baja el pivote a la altura con la que la rueda toca el piso con su precarga.',
      herr: 'Llave Allen de 5 mm.', check: 'Los 2 soportes quedan derechos, alineados con el largo del carrito, y no giran con la mano.',
      error: 'Apretar sin que la tuerca T haya girado dentro de la ranura: no agarra y el soporte queda flojo. Antes de apretar del todo, jalen el soporte: debe quedar trabado.' } });
  S({ ch: 'base', et: 'Etapa 7', title: 'Baleros 608ZZ en las placas pivotantes', dur: 8, cam: { t: [0.02, 0.06, -0.18], d: [0.3, 0.3, -1], r: 0.13 },
    add: ['susp_L', 'susp_R'], stagger: 1.4,
    labels: [{ p: 'susp_L', o: [-0.03, 0.03, -0.02], t: '2 × 608ZZ a presión', s: 'con una rondana M8 entre los anillos de adentro', when: 1.8 },
      { p: 'susp_L', o: [0.07, -0.025, -0.02], t: 'Pestaña del resorte', when: 3.2 }],
    txt: { que: 'Metan a presión los 2 baleros 608ZZ en la maza de cada placa pivotante, uno por cada lado, con una rondana M8 entre sus anillos de adentro. Presenten la placa contra su soporte.',
      porque: 'Los baleros dejan que la placa (y la rueda) suba y baje con el piso sin juego.',
      herr: 'Prensa de banco o un tornillo largo con rondanas para jalarlos derechos.', check: 'Los 2 baleros quedan al ras y giran suave.',
      error: 'Meterlos a golpes o chuecos: se dañan y la placa queda con juego.' } });
  S({ ch: 'base', et: 'Etapa 7', title: 'Perno de pivote M8 × 40', dur: 8, cam: { t: [0, 0.07, -0.17], d: [0.25, 0.3, -1], r: 0.11 },
    add: ['susp_piv_L', 'susp_piv_R'], stagger: 1.2,
    labels: [{ p: 'susp_piv_L', o: [0, 0.03, -0.03], t: 'Perno M8 × 40', s: 'rondana afuera y rondana entre placa y soporte', when: 1.6 }],
    txt: { que: 'Pasen el perno M8 × 40 por afuera: rondana, placa (por los 2 baleros), otra rondana y soporte, hasta la tuerca M8 que ya está adentro. Pongan Loctite azul y aprieten solo hasta quitar el juego.',
      porque: 'Es el eje sobre el que sube y baja la rueda.',
      herr: 'Llaves de 13 mm, Loctite azul.', check: 'La placa gira libre con la mano y no tiene juego de lado.',
      error: 'Apretar de más: frena la placa y la rueda ya no sigue el piso.' } });
}
else S({ ch: 'base', et: 'Etapa 7', title: 'Placas pivotantes de la suspensión', dur: 8,
  cam: { t: [0.03, 0.06, -0.16], d: [0.55, 0.32, -1], r: 0.18 },
  add: ['susp_sop_L', 'susp_sop_R', 'susp_L', 'susp_R', 'susp_piv_L', 'susp_piv_R'], stagger: 0.5,
  labels: [{ p: 'susp_L', o: [-0.06, 0.015, -0.01], t: 'Pivote: tornillo M8 + 2 × 608ZZ', s: 'tuerca de seguridad', when: 2.0 },
    { p: 'susp_L', o: [0.07, -0.02, -0.025], t: 'Tornillo guía M8 y tuerca de precarga', when: 3.0 }],
  txt: { que: 'Armen cada placa pivotante: 2 baleros 608ZZ a presión en sus huecos y el tornillo M8 de pivote atravesando, con rondanas y tuerca de seguridad.',
    porque: 'La placa deja que la rueda suba y baje con el piso, y el resorte la empuja contra él.',
    herr: 'Llaves de 13 mm para M8, prensa para meter los baleros.',
    check: 'La placa gira suave, sin juego.',
    error: 'Meter el balero a golpes chuecos: se daña y la placa queda con juego.' } });
if (!DET) S({ ch: 'base', et: 'Etapa 7', title: 'Motores M0601: izquierdo y derecho', dur: 8,
  cam: { t: [0.02, 0.07, 0], d: [-1, 0.42, 0.18], r: 0.34 },
  add: ['mot_L', 'mot_R'], stagger: 1.6,
  labels: [{ p: 'mot_L', o: [0, 0.07, -0.02], t: 'M0601 izquierdo · FIT1042', s: 'rueda Ø101 × 65.5 mm · 18 V · RS485', when: 1.8 },
    { p: 'mot_R', o: [0, 0.07, 0.02], t: 'M0601 derecho · FIT1038', s: '~8.7 kg por rueda (aguanta 10)', when: 3.4 }],
  dims: [{ a: [D.WX, 0, -D.WZ - 0.03], b: [D.WX, 0.101, -D.WZ - 0.03], off: [0, 0, -0.03], text: 'Ø 101 mm', when: 4.0 }],
  txt: { que: 'Atornillen cada M0601 a su placa. El izquierdo (FIT1042) va del lado izquierdo viendo el carrito desde atrás hacia el frente, y el derecho (FIT1038) del derecho.',
    porque: 'Cada uno trae su driver y su encoder; si se cruzan, una rueda gira al revés.',
    herr: 'Desarmador o Allen para los barrenos M2.5 del motor.',
    check: 'Las 2 ruedas y las 4 rodajas tocan el piso al mismo tiempo.',
    error: 'Montar dos del mismo lado: una rueda giraría al revés de lo esperado y no embona igual.' } });
else for (const [id, lado, fit, o] of [['mot_L', 'izquierdo', 'FIT1042', -0.02], ['mot_R', 'derecho', 'FIT1038', 0.02]]) S({ ch: 'base', et: 'Etapa 7', title: `Motor M0601 ${lado} (${fit})`, dur: 8,
  cam: { t: [0.02, 0.07, 0], d: [-1, 0.42, o * 9], r: 0.30 }, add: [id],
  labels: [{ p: id, o: [0, 0.07, o], t: `M0601 ${lado} · ${fit}`, s: 'rueda 102 mm · 18 V · RS485', when: 1.6 }],
  dims: [{ a: [D.WX, 0, (o < 0 ? -1 : 1) * (D.WZ + 0.03)], b: [D.WX, 0.101, (o < 0 ? -1 : 1) * (D.WZ + 0.03)], off: [0, 0, o * 1.5], text: 'Ø 101 mm', when: 3.0 }],
  txt: { que: `Atornillen el M0601 ${lado} (${fit}) a su placa pivotante. Va del lado ${lado} viendo el carrito desde atrás hacia el frente. Sus 2 conectores (potencia y señal RS485) hacia adentro del carrito.`,
    porque: 'Cada uno trae su driver y su encoder; los 2 modelos son espejo uno del otro. Si se cruzan, una rueda gira al revés.',
    herr: 'Desarmador o Allen para los barrenos M2.5 del motor.',
    check: o < 0 ? 'La rueda gira libre y la placa pivotante sube y baja con ella.' : 'Las 2 ruedas y las 4 rodajas tocan el piso al mismo tiempo.',
    error: 'Montar dos del mismo lado: una rueda giraría al revés de lo esperado y no embona igual.' } });
if (DET) S({ ch: 'base', et: 'Etapa 7', title: 'Calza del resorte y tornillo guía M8', dur: 8,
  cam: { t: [D.WX, 0.06, 0.18], d: [0.55, 0.22, 1], r: 0.12 },
  add: ['susp_guia_L', 'susp_guia_R'], stagger: 1.2,
  labels: [{ p: 'susp_guia_R', o: [0.03, -0.02, 0.02], t: 'Tornillo guía M8 × 90', s: 'tuerca T M8 en la ranura de abajo del larguero', when: 1.6 },
    { p: 'susp_guia_R', o: [0.03, 0.035, 0.02], t: 'Calza de 13 mm', s: 'bajo el larguero, en la vertical de la rueda', when: 3.0 }],
  txt: { que: 'Presenten la calza de 13 mm bajo cada larguero, en la vertical del eje de la rueda. Metan la tuerca T M8 en la ranura de abajo del larguero y enrosquen el tornillo guía M8 × 90 desde abajo: atraviesa la pestaña de la placa pivotante y la calza. Dejen puestas la tuerca de precarga y las rondanas sin apretar.',
    porque: 'El tornillo guía centra el resorte y con su tuerca se ajusta la precarga.',
    herr: 'Llave de 13 mm.', check: 'La placa pivotante sube y baja libre a lo largo del tornillo guía.',
    error: 'Apretar la tuerca de precarga antes de poner el resorte: ya no entra.' } });
S({ ch: 'base', et: 'Etapa 7', title: 'Resortes y precarga de 85 N', dur: 9,
  cam: { t: [D.WX, 0.06, 0.18], d: [0.55, 0.22, 1], r: 0.12 },
  add: DET ? ['spring_L', 'spring_R'] : ['susp_guia_L', 'susp_guia_R', 'spring_L', 'spring_R'], stagger: 0.3,
  mech: (t, m) => { m.spring = lerp(0.075 / 0.047, 1, segE(t, 2.6, 5.4)); },
  labels: [{ p: 'spring_R', o: [0.03, 0.035, 0.01], t: 'Resorte de compresión', s: 'alambre 2 mm · Ø20 · k ≈ 3 N/mm · ~9 espiras', when: 1.4 },
    { p: 'susp_R', o: [0.07, -0.028, 0.02], t: 'Tuerca de precarga', s: 'se aprieta con la base parada en el piso', when: 3.0 }],
  dims: [{ a: [D.WX + 0.012, 0.043, 0.198], b: [D.WX + 0.012, 0.090, 0.198], off: [0.02, 0, 0.01], text: '75 → 47 mm (−28 mm ≈ 85 N)', when: 5.4 }],
  txt: { que: 'Monten el tornillo guía M8 de cada resorte, el resorte y su tuerca. Con la base parada en el piso, aprieten la tuerca hasta que el resorte quede 28 mm más corto que su largo libre (de 75 a 47 mm).',
    porque: 'Esa compresión da ~85 N en la rueda: no patina al arrancar y las rodajas no se levantan. El resorte va en la vertical del eje de la rueda.',
    herr: 'Vernier y llaves de 13 mm.',
    check: 'Resortes comprimidos 28 mm, medidos con vernier.',
    error: 'Demasiada precarga levanta las rodajas y el carrito se mece; muy poca y las ruedas patinan al arrancar.' } });
S({ ch: 'base', et: 'Etapa 7', title: 'Batería al centro, bien sujeta', dur: 8,
  cam: { t: [0, 0.18, 0], d: [0.75, 0.85, 0.9], r: 0.42 },
  add: ['bat_cradle', 'bat', 'bat_hold'], stagger: 1.4,
  labels: [{ p: 'bat', o: [0.02, 0.09, 0.03], t: 'Batería BR-1224', s: '12 V · 24 Ah · 8.3 kg · bornes hacia atrás', when: 2.0 },
    { p: 'bat_hold', o: [0.04, 0.02, 0.0], t: 'Correa con hebilla (o cincho de trinquete)', s: 'alrededor de la batería y del travesaño central · topes impresos a los lados', when: 3.6 }],
  txt: { que: 'Coloquen la batería al centro y lo más abajo posible, con los bornes hacia donde irá la bandeja. Sujétenla con los topes impresos a los lados y una correa con hebilla alrededor de la batería y del travesaño central, bien tensa. Tapen los bornes con cinta de aislar.',
    porque: '8.3 kg sueltos en un frenazo rompen algo. Abajo y al centro, baja el centro de gravedad.',
    herr: 'Correa de nylon con hebilla o cincho de trinquete (~1 m), cinta de aislar.',
    check: 'La batería no se mueve aunque sacudan la base; empujada a mano, la base rueda derecho unos 3 m.',
    error: 'Conectar algo en esta etapa: los bornes se quedan tapados hasta la Etapa 11.' } });

// ====================================================== CAPÍTULO 3 — ETAPA 8 — ESTRUCTURA
S({ ch: 'estr', et: 'Etapa 8', title: 'Marco superior', dur: 9,
  cam: { t: [0, 0.6, 0], d: [0.9, 0.62, 1.05], r: 0.78 },
  add: [['larg_tL', 'larg_tR', 'trav_tF', 'trav_tB'], ['nut_tL', 'nut_tR', 'nut_tF', 'nut_tB'], 'esc_t'], stagger: 1.7, addDur: 1.5,
  labels: [{ p: 'larg_tR', o: [0, 0.04, 0.02], t: 'Marco superior al ras de la punta', s: '2 × 440 mm + 2 × 340 mm', when: 1.6 },
    { p: 'nut_tF', o: [0.02, -0.03, 0.15], t: 'Tuercas T de martillo', s: 'entran de frente cuando se necesiten', when: 3.4 }],
  dims: [{ a: [D.XP + 0.016, 0, D.ZP + 0.016], b: [D.XP + 0.016, D.HT, D.ZP + 0.016], off: [0.07, 0, 0.07], text: '≈ 1.05 m', when: 4.0 }],
  txt: { que: 'Pongan 2 largueros y 2 travesaños arriba, al ras de la punta de los postes, con 1 escuadra por unión (por abajo), apretada a medias. Las tuercas T entran de frente en cualquier momento.',
    porque: 'Se cierra el cubo de aluminio; si se tuerce al empujar una esquina de arriba, la torre se va a trabar.',
    herr: 'Llaves Allen, tornillos M6 × 16, tuercas T.',
    check: 'Todas las escuadras asientan y los tornillos están a medias, listos para escuadrar.',
    error: 'Apretar de más el tornillo M6 en una pieza impresa: se raja. Firme, pero sin forzar.' } });
S({ ch: 'estr', et: 'Etapa 8', title: 'Plomo, escuadra y diagonales de arriba', dur: 8,
  cam: { t: [0.05, 0.55, 0.05], d: [1, 0.55, 0.85], r: 0.75 },
  show: ['tool_level'],
  dims: [{ a: [D.L / 2, D.HT + 0.004, -D.W / 2], b: [-D.L / 2, D.HT + 0.004, D.W / 2], text: '≈ 640 mm', when: 2.2, grow: [2.2, 3.6], cls: 'hot', labAt: 0.25 },
    { a: [D.L / 2, D.HT + 0.008, D.W / 2], b: [-D.L / 2, D.HT + 0.008, -D.W / 2], text: '≈ 640 mm', when: 3.8, grow: [3.8, 5.2], cls: 'hot', labAt: 0.75 }],
  labels: [{ p: 'tool_level', o: [0.03, 0.1, 0.02], t: 'Nivel de burbuja en 2 caras', s: 'cada poste vertical', when: 0.8 }],
  txt: { que: 'Con el nivel de burbuja pegado a cada poste revisen que esté vertical en sus 2 caras, y con la escuadra metálica los 90° de cada esquina de arriba. Las diagonales de arriba, iguales (±2 mm). Midan el alto en las 4 esquinas y aprieten firme.',
    porque: 'Un poste fuera de plomo tuerce la torre y el elevador se traba.',
    herr: 'Nivel de burbuja, escuadra metálica, flexómetro.',
    check: 'Al empujar una esquina de arriba con la mano, la estructura no se tuerce visiblemente; mismo alto en las 4 esquinas.',
    error: 'Si queda floja, agreguen una escuadra más por fuera en las esquinas de arriba; no la armen "así".' } });
S({ ch: 'estr', et: 'Etapa 8', title: 'Columnas de la torre', dur: 11,
  cam: { t: [0.10, 0.56, 0.0], d: [1, 0.42, 0.75], r: 0.68 },
  add: [['col_FL', 'col_FR'], ['col_BL', 'col_BR'], ['trav_sc', 'trav_emp'], ['esc_tw', 'placas']], stagger: 1.7, addDur: 1.6,
  labels: [{ p: 'col_FR', o: [0.02, 0.30, 0.03], t: 'Columnas delanteras · 888 mm', s: 'guías delanteras y soportes del elevador', when: 1.6, until: 5.0 },
    { p: 'col_BR', o: [0.0, 0.22, 0.03], t: 'Columnas traseras · 888 mm', s: 'sobre el travesaño central: guías traseras y empujador', when: 3.2, until: 7.0 },
    { p: 'trav_sc', o: [0, 0.03, 0.12], t: 'Travesaño superior central · 340 mm', when: 4.8 },
    { p: 'trav_emp', o: [0, -0.02, 0.05], t: 'Travesaño del empujador · 198 mm', s: 'de aquí cuelgan las varillas y el NEMA', when: 5.2 },
    { p: 'placas', o: [0.22, -0.40, 0.11], t: 'Placas de unión impresas', s: 'atornilladas a tuercas en las ranuras', when: 7.0 }],
  dims: [{ a: [D.COLXF + 0.016, D.H0 + D.PF, D.COLZC], b: [D.COLXF + 0.016, D.HT - D.PF, D.COLZC], off: [0.06, 0, 0], text: '888 mm', when: 2.4 },
    { a: [D.COLXF - 0.015, 0.70, -(D.COLZF - 0.015)], b: [D.COLXF - 0.015, 0.70, D.COLZF - 0.015], off: [0, 0, 0], text: '23.2 cm (ECU: 22.3)', when: 3.0 }],
  txt: { que: 'Deslicen de lado las 4 columnas de 888 mm entre el marco de abajo y el de arriba: 2 junto a los postes delanteros (a 23.2 cm entre caras: por ahí pasan las ECU, que sobresalen del fixture) y 2 sobre el travesaño central. Arriba, el travesaño superior central; entre las columnas traseras, el travesaño del empujador. Todo con placas de unión impresas, a medias.',
    porque: 'Las guías, los husillos y el empujador necesitan algo firme a qué atornillarse en toda su altura. Las columnas forman una jaula alrededor de la torre (propuesta: no viene en la lista de cortes original).',
    herr: 'Llaves Allen, nivel de burbuja, escuadra metálica, flexómetro.',
    check: 'Las 4 columnas a plomo. Entre las caras interiores de las delanteras hay 23.2 cm y entre las traseras 19.8 cm, en toda la altura.',
    error: 'Apretar una columna antes de ponerla a plomo: después la torre queda chueca y el elevador se traba.' } });

// ====================================================== CAPÍTULO 4 — ETAPA 9 — ELEVADOR
const camTower = r => ({ t: [0.15, 0.6, 0.02], d: [0.85, 0.42, 1], r });
S({ ch: 'elev', et: 'Etapa 9', title: 'Guías en L en las 4 esquinas del fixture', dur: 8,
  cam: { t: [0.133, 0.62, 0], d: [0.55, 0.85, 1], r: 0.44 },
  add: [['guide_BL', 'guide_BR'], ['guide_FL', 'guide_FR']], stagger: 1.4,
  labels: [{ p: 'guide_BR', o: [0, 0.27, 0.02], t: 'Guías traseras', s: 'siguen hasta ~90 cm', when: 2.4 }, { p: 'guide_FR', o: [0, 0.23, 0.02], t: 'Guías delanteras', s: 'terminan en el borde de la ventana (80.95 cm)', when: 2.9 }],
  dims: [{ a: [D.COLX0, D.GTF, -D.COLZ - 0.004], b: [D.COLX1, D.GTF, -D.COLZ - 0.004], off: [0, 0, -0.05], text: '220 mm', when: 3.4 },
    { a: [D.COLX1 + 0.004, D.GTF, -D.COLZ], b: [D.COLX1 + 0.004, D.GTF, D.COLZ], off: [0.05, 0, 0], text: '169 mm', when: 3.7 }],
  txt: { que: 'Atornillen las 4 guías en L a las columnas, en las esquinas de un hueco de 22.0 × 16.9 cm: las traseras con su pestaña a la cara frontal de la columna, las delanteras con su pestaña a la cara interior (tornillo avellanado).',
    porque: 'Las guías solo tocan los postes de las esquinas del fixture (21.3 × 16.5 cm): ~3.5 mm adelante y atrás y 2 mm por lado. Más adentro no puede haber nada: ahí sobresalen las ECU. Con 2 mm por lado el fixture que entra queda alineado con los largueros del de abajo.',
    herr: 'Llaves Allen, tuercas M6, flexómetro.',
    check: 'Las 4 guías a plomo y el hueco medido en arriba y abajo.',
    error: 'Atornillar las guías sin probar el hueco: si roza, el fixture se atora a media pila.' } });
S({ ch: 'elev', et: 'Etapa 9', title: 'Prueba del hueco con un fixture', dur: 8,
  cam: { t: [0.133, 0.6, 0], d: [0.6, 0.45, 1], r: 0.42 },
  mech: (t, m) => { const y = 0.82 - 0.40 * Math.sin(Math.PI * seg(t, 0.6, 7.2)); m.fx[0] = { x: D.XC, y, z: 0, rz: 0 }; },
  focus: ['fx0'],
  labels: [{ p: 'fx0', o: [0, 0.09, 0], t: 'Fixture de prueba', s: 'postes de 21.3 × 16.5 cm entre guías de 22.0 × 16.9', when: 0.8 }],
  txt: { que: 'Suban y bajen a mano un fixture por todo el hueco.',
    porque: 'Si a mano se traba, con motor se va a trabar peor.',
    herr: 'Un fixture impreso con sus 2 bastidores y su ECU.',
    check: 'Un fixture sube y baja a mano por el hueco sin rozar.',
    error: 'Si roza, aflojen la guía y muévanla; no lijen el fixture.' } });
if (!DET) S({ ch: 'elev', et: 'Etapa 9', title: 'NEMA 17 y coples', dur: 8,
  cam: { t: [0.183, 0.28, 0.05], d: [0.35, 0.45, 1], r: 0.22 },
  add: [['brk_lo_L', 'brk_lo_R'], ['nema_L', 'nema_R'], ['cople_L', 'cople_R']], stagger: 1.5,
  labels: [{ p: 'nema_R', o: [0.03, -0.01, 0.03], t: 'NEMA 17 · eje hacia arriba', s: 'un A4988 por motor (1.0 A)', when: 2.2 },
    { p: 'cople_R', o: [0.02, 0.01, 0.02], t: 'Cople flexible 5 → 8 mm', s: 'prisionero sobre la cara plana del eje', when: 3.8 }],
  txt: { que: 'Atornillen cada soporte inferior a la cara trasera de la columna delantera y del poste, y los 2 NEMA 17 en sus soportes con el eje hacia arriba. Pongan un cople en cada eje y aprieten su prisionero sobre la parte plana.',
    porque: 'El eje tiene forma de D: sobre la cara plana el cople no se patina.',
    herr: 'Llaves Allen chicas.',
    check: 'El cople no gira sobre el eje aunque lo fuercen con los dedos.',
    error: 'Prisionero del cople sobre la parte redonda del eje: se patina y la plataforma se desnivela.' } });
else {
  S({ ch: 'elev', et: 'Etapa 9', title: 'Soportes inferiores (NEMA + KFL08)', dur: 7,
    cam: { t: [0.183, 0.28, 0.05], d: [0.35, 0.45, 1], r: 0.30 }, add: [['brk_lo_L', 'brk_lo_R']],
    labels: [{ p: 'brk_lo_R', o: [0.03, 0.03, 0.03], t: 'Soporte inferior impreso', s: 'a la cara trasera de la columna delantera y al poste', when: 1.6 }],
    txt: { que: 'Atornillen cada soporte inferior a la cara trasera de la columna delantera y al poste, con tuercas T.', porque: 'Este soporte carga el NEMA, la chumacera de abajo, la varilla y el final de carrera: todo queda alineado.', herr: 'Llaves Allen, tornillos M6 × 20, tuercas T.', check: 'El soporte no se mueve al empujarlo con la mano.', error: 'Apretar sin escuadrar: el husillo queda inclinado y cabecea.' } });
  for (const [id, lado, o] of [['nema_L', 'izquierdo', -1], ['nema_R', 'derecho', 1]]) S({ ch: 'elev', et: 'Etapa 9', title: `NEMA 17 del elevador ${lado}`, dur: 7,
    cam: { t: [0.183, 0.26, o * 0.16], d: [0.35, 0.45, o], r: 0.12 }, add: [id],
    labels: [{ p: id, o: [0.03, -0.01, o * 0.03], t: `NEMA 17 ${lado} · eje hacia arriba`, s: `su cable va a ${o < 0 ? 'J7 (A4988 #1)' : 'J8 (A4988 #2)'}`, when: 1.6 }],
    txt: { que: `Atornillen el NEMA 17 ${lado} al soporte con 4 tornillos M3 × 8, el eje hacia arriba y el conector hacia afuera.`, porque: 'Cada motor del elevador tiene su propio A4988 a 1.0 A; los 2 drivers reciben los mismos pasos.', herr: 'Llave Allen o desarmador, 4 tornillos M3 × 8.', check: 'El motor queda firme y el eje gira libre con los dedos.', error: 'Tornillos M3 demasiado largos: tocan la bobina por dentro del motor.' } });
  S({ ch: 'elev', et: 'Etapa 9', title: 'Coples flexibles 5 → 8 mm', dur: 7,
    cam: { t: [0.183, 0.29, 0.05], d: [0.35, 0.45, 1], r: 0.20 }, add: [['cople_L', 'cople_R']],
    labels: [{ p: 'cople_R', o: [0.02, 0.01, 0.02], t: 'Cople flexible 5 → 8 mm', s: 'prisionero sobre la cara plana del eje', when: 1.6 }],
    txt: { que: 'Pongan un cople en cada eje y aprieten su prisionero sobre la parte plana.', porque: 'El eje tiene forma de D: sobre la cara plana el cople no se patina.', herr: 'Llaves Allen chicas.', check: 'El cople no gira sobre el eje aunque lo fuercen con los dedos.', error: 'Prisionero del cople sobre la parte redonda del eje: se patina y la plataforma se desnivela.' } });
}
S({ ch: 'elev', et: 'Etapa 9', title: 'KFL08 de abajo, husillos y KFL08 de arriba', dur: 10,
  cam: { t: [0.183, 0.6, 0.12], d: [0.55, 0.18, 1], r: 0.42 },
  add: [['kflLo_L', 'kflLo_R'], { ids: ['screw_L', 'screw_R', 'nutsc_L', 'nutsc_R'], from: [0, 0.75, 0] }, ['brk_up_L', 'brk_up_R', 'kflUp_L', 'kflUp_R']], stagger: 1.8, addDur: 1.6, plat: 0.70,
  mech: (t, m) => { m.plat = 0.70; m.screwX = 18 * seg(t, 6.5, 9.5); },
  labels: [{ p: 'kflLo_R', o: [0.03, 0.0, 0.02], t: 'KFL08 inferior', s: 'prisioneros todavía sin apretar', when: 1.4 },
    { p: 'screw_R', o: [0.0, 0.05, 0.02], t: 'Husillo TR8 · 60 cm (UNIT)', s: 'midan el avance: 2 mm por vuelta = se autobloquea', when: 3.2 },
    { p: 'kflUp_R', o: [0.02, 0.02, 0.02], t: 'KFL08 superior', s: 'solo guía', when: 5.2 }],
  dims: [{ a: [D.SX, 0.336, D.SZ + 0.03], b: [D.SX, 0.866, D.SZ + 0.03], off: [0, 0, 0.05], text: '≈ 52.7 cm útiles', when: 6.0 }],
  txt: { que: 'Atornillen una KFL08 justo arriba de cada cople, sin apretar sus prisioneros. Pasen cada husillo por su chumacera, métanlo en el cople y pongan la chumacera de arriba. Giren cada husillo con los dedos.',
    porque: 'Debe girar suave y sin cabecear (que la punta no dibuje un círculo). Si cabecea, motor y chumaceras no están en línea.',
    herr: 'Llaves Allen, los dedos.',
    check: 'Los 2 husillos giran sin cabecear.',
    error: 'Motor y chumaceras desalineados: el motor vibra, se calienta y pierde pasos.' } });
S({ ch: 'elev', et: 'Etapa 9', title: 'Varillas lisas y SC8UU', dur: 7,
  cam: { t: [0.183, 0.6, 0.1], d: [0.6, 0.2, 1], r: 0.40 },
  add: [{ ids: ['rod_L', 'rod_R'], from: [0, 0.75, 0] }, ['sc_L', 'sc_R']], stagger: 1.6,
  mech: (t, m) => { m.plat = 0.70; },
  labels: [{ p: 'rod_R', o: [0, 0.12, 0.02], t: 'Varilla lisa 8 mm × 60 cm', when: 1.6 }, { p: 'sc_R', o: [0.02, 0.03, 0.02], t: 'SC8UU', s: '2 por varilla', when: 3.0 }],
  txt: { que: 'Monten las 2 varillas lisas en sus soportes, con 2 SC8UU en cada una.',
    porque: 'Los husillos suben la plataforma; las varillas la guían para que no se ladee ni gire.',
    herr: 'Llaves Allen, trapo y aceite ligero.',
    check: 'Los SC8UU deslizan sin juego por toda la varilla.',
    error: 'Varillas sucias o secas: límpienlas y pónganles una gota de aceite.' } });
S({ ch: 'elev', et: 'Etapa 9', title: 'Plataforma y recorrido completo', dur: 10,
  cam: camTower(0.52),
  add: ['plat'], addStart: 0.3,
  mech: (t, m) => { m.plat = 0.70 - 0.30 * Math.sin(Math.PI * seg(t, 2.2, 9.0)); },
  labels: [{ p: 'plat', o: [0, 0.03, 0], t: 'Plataforma 21.3 × 16.5 cm', s: 'del tamaño de la quilla · 2 brazos con tuerca de latón y SC8UU', when: 1.4 }],
  dims: [{ a: [D.COLX0 - 0.01, D.LEVEL(6), -0.12], b: [D.COLX0 - 0.01, D.UNL0, -0.12], off: [-0.04, 0, 0], text: '39.85 → 82.35 cm', when: 2.2 }],
  txt: { que: 'Atornillen las tuercas de latón y los SC8UU a los brazos de la plataforma. Bajen la plataforma girando los 2 husillos a mano, parejos, hasta que se vea su recorrido completo.',
    porque: 'La carrera de trabajo va de 39.85 cm (pila llena al cargar) a 82.35 cm (descargar el último).',
    herr: 'Los dedos en los coples; grasa ligera o PTFE.',
    check: 'Girando un cople con los dedos, la plataforma recorre toda la carrera sin trabarse.',
    error: 'Husillos secos: chillan y el motor se queda corto de fuerza.' } });
S({ ch: 'elev', et: 'Etapa 9', title: 'Prisioneros de las KFL08 inferiores', dur: 8,
  cam: { t: [D.SX, 0.33, D.SZ], d: [0.65, 0.32, 1], r: 0.10 },
  focus: ['kflLo_L', 'kflLo_R'],
  mech: (t, m) => { m.plat = 0.60; },
  labels: [{ p: 'kflLo_R', o: [0.0, 0.012, 0.0], t: 'KFL08 inferior · prisioneros apretados', s: 'carga ~22 N por husillo', when: 0.6, cls: 'hot' },
    { p: 'nema_R', o: [0.03, 0.0, 0.0], t: 'Eje del NEMA 17', s: 'aguanta ~10 N axiales: no carga peso', when: 2.4 }],
  dims: [{ a: [D.SX - 0.016, 0.45, D.SZ], b: [D.SX - 0.016, 0.34, D.SZ], text: 'peso de la pila', when: 1.0, arrow: true, cls: 'hot' }],
  txt: { que: 'Ahora sí, aprieten los 2 prisioneros de cada KFL08 inferior contra el husillo.',
    porque: 'Así el peso de la pila (~22 N por tornillo) se apoya en la chumacera y no en el eje del motor, que solo aguanta ~10 N. El cople flexible no debe cargar peso.',
    herr: 'Llave Allen chica.',
    check: 'Prisioneros de las chumaceras de abajo apretados.',
    error: 'Olvidarlos: el peso queda en el eje del motor y en el cople.' } });
S({ ch: 'elev', et: 'Etapa 9', title: 'Lubricar y nivelar a mano', dur: 9,
  cam: { t: [D.XC, 0.62, 0], d: [0.15, 0.35, 1], r: 0.30 },
  mech: (t, m) => { m.plat = 0.62; const k = 1 - segE(t, 2.2, 6.5); m.tilt = 0; m.screwL = 30 * segE(t, 2.2, 6.5); },
  labels: [{ p: 'screw_L', o: [0, 0.05, -0.02], t: 'Giren solo este husillo', s: 'motor desconectado y su tuerca T8 floja', when: 1.8 }],
  dims: [{ a: [D.XC, 0.62, -0.09], b: [D.XC, 0.62, 0.09], off: [0, 0.03, 0], text: 'diferencia < 1 mm', when: 6.8, mount: 'plat' }],
  txt: { que: 'Lubricante seco de PTFE o una capa muy delgada de grasa ligera en la rosca. Las varillas y los SC8UU mantienen la plataforma derecha: lo que se iguala es la altura de las 2 tuercas T8. Aflojen los 4 tornillos de la tuerca de un lado, giren solo ese husillo hasta que su brida asiente plana contra el brazo y vuelvan a apretar. Luego midan la altura de la plataforma en sus 4 esquinas.',
    porque: 'Se hace una vez: después los 2 motores reciben los mismos pasos (STEP, DIR y EN compartidos) y se mueven juntos.',
    herr: 'Lubricante seco de PTFE, flexómetro.',
    check: 'Plataforma nivelada: diferencia menor a 1 mm entre esquinas.',
    error: 'Grasa de más: el husillo apenas se autobloquea y la plataforma se escurre con la vibración.' } });
if (DET) for (const [id, lado, o, gp] of [['lsw_L', 'izquierdo', -1, 18], ['lsw_R', 'derecho', 1, 19]]) S({ ch: 'elev', et: 'Etapa 9', title: `Final de carrera ${lado}`, dur: 7,
  cam: { t: [D.SX, 0.36, o * 0.19], d: [0.5, 0.4, o], r: 0.10 }, add: [id], mech: (t, m) => { m.plat = 0.62; },
  labels: [{ p: id, o: [0.02, 0.01, o * 0.03], t: `Final de carrera ${lado}`, s: `contacto NC · va a J4 → GPIO ${gp}`, when: 1.4 }],
  txt: { que: `Atornillen el DM1 a su adaptador impreso (2 M2 × 10 autorroscantes, la bisagra de la palanca contra la ceja) y el adaptador a la pestaña del soporte inferior ${lado} con 2 M2.5 flojos, palanca hacia arriba. Bajen la plataforma a mano a 38.35 cm, deslicen el adaptador en sus ranuras hasta que haga clic, 0.5 mm más, y aprieten.`, porque: 'Es el home de ese lado: el cero del elevador. Las ranuras del adaptador (±2.5 mm) absorben la tolerancia del DM1.', herr: 'Desarmador chico, 2 M2.5 × 12 y 2 M2 × 10 autorroscantes.', check: 'Con el multímetro en continuidad entre COM y NC: pita suelto y deja de pitar al presionar la palanca.', error: 'Usar el contacto NO: si el cable se rompe, el ESP32 nunca se entera y el motor choca.' } });
if (DET) S({ ch: 'elev', et: 'Etapa 9', title: 'Final de carrera superior (tope)', dur: 8,
  cam: { t: [0.19, 0.842, 0.185], d: [0.35, -0.55, 1], r: 0.085 }, add: ['lswUp'], mech: (t, m) => { m.plat = t < 3 ? 0.80 : lerp(0.80, 0.840, segE(t, 3.0, 5.5)); },
  labels: [{ p: 'lswUp', o: [0.02, -0.01, 0.03], t: 'Final superior (NC)', s: 'J13 → GPIO 35 · abre a 83.15 cm', when: 1.4 }],
  txt: { que: 'Atornillen el cuarto DM1 a su adaptador y el adaptador de cabeza en la pestaña del soporte superior derecho (2 M2.5 flojos), con la palanca hacia abajo. Suban la plataforma a mano a 83.15 cm, deslicen el adaptador hasta el clic, 0.5 mm más, y aprieten.',
    porque: 'Es el tope: si el conteo de pasos se pierde y la plataforma sigue subiendo, el ESP32 la detiene antes de que el brazo choque con la chumacera de arriba. Arriba de 82.35 cm el programa ya no la manda.',
    herr: 'Desarmador chico, 2 M2.5 × 12 y 2 M2 × 10 autorroscantes.', check: 'Suban la plataforma a mano (motor sin energía) hasta 83.15 cm: pita en COM–NC antes y deja de pitar en el tope. Entre brazo y chumacera quedan ~7 mm.',
    error: 'Ponerlo con la palanca hacia arriba: el brazo nunca la toca y no hay tope.' } });
S({ ch: 'elev', et: 'Etapa 9', title: DET ? 'Prueba de autobloqueo' : 'Finales de carrera y prueba de autobloqueo', dur: 10,
  cam: camTower(0.55),
  add: DET ? [] : [['lsw_L', 'lsw_R', 'lswUp']],
  mech: (t, m) => {
    m.plat = t < 4 ? lerp(0.62, D.LSLO, segE(t, 1.4, 3.6)) : lerp(D.LSLO, 0.45, segE(t, 4.0, 5.5));
    if (t > 5.8) { const n = Math.min(6, Math.floor((t - 5.8) / 0.35) + 1); pileSet(m, [...Array(n).keys()], m.plat); }
  },
  labels: [{ p: 'lsw_R', o: [0.02, 0.01, 0.03], t: 'Final de carrera (NC)', s: 'home: plataforma a 38.35 cm', when: 2.4 },
    { at: [D.XC, 0.92, 0.12], t: 'Con ~3 kg y sin energía: no baja', s: 'husillo de 1 entrada (autoblocante)', when: 7.5, cls: 'hot' }],
  dims: [{ a: [D.COLX0 - 0.01, 0, -0.12], b: [D.COLX0 - 0.01, D.LSLO, -0.12], off: [-0.05, 0, 0], text: '38.35 cm', when: 3.4 }],
  txt: { que: 'Atornillen un final de carrera abajo de cada husillo, para que su palanca se presione cuando la plataforma llegue a 38.35 cm, y el superior de cabeza en el soporte de arriba del lado derecho (tope a 83.15 cm). Luego suban la plataforma a la mitad, pónganle 6 fixtures (~3 kg) y suéltenla.',
    porque: 'El home de cada lado da el cero del elevador; si uno toca y el otro no, la plataforma está desnivelada y el ESP32 lo reporta.',
    herr: 'Desarmador, cables, 6 fixtures o 3 kg de peso.',
    check: 'Con 3 kg encima, la plataforma no baja sola.',
    error: 'Si baja sola, el husillo es de 4 entradas (8 mm por vuelta): plan B — el paro no le corta la energía al elevador y el programa baja la plataforma con batería baja; o varilla roscada M8 de ferretería.' } });

// ====================================================== CAPÍTULO 5 — ETAPA 10 — EMPUJADOR Y UÑA
const camPush = r => ({ t: [0.0, 0.88, 0.0], d: [0.55, 0.65, 1], r });
S({ ch: 'emp', et: 'Etapa 10', title: 'Varillas, carro, placa y cremallera', dur: 9,
  cam: { t: [-0.06, 0.86, 0.0], d: [0.3, 0.45, 1], r: 0.30 },
  add: [['pframe', 'pframe_r'], ['prod_L', 'prod_R'], 'sled'], stagger: 1.6,
  labels: [{ p: 'prod_R', o: [-0.08, 0.0, 0.0], t: 'Varillas 8 mm × 30 cm', s: 'horizontales, atrás → ventana', when: 2.2 },
    { p: 'pframe', o: [0.0, 0.03, 0.06], t: 'Soportes colgados del travesaño del empujador', when: 1.4 },
    { at: [0.004, D.PY1, 0.075], t: 'Placa empujadora 15 × 3 cm', s: 'empuja el fixture, nunca la ECU', when: 4.0 },
    { at: [-0.20, 0.898, 0.0], t: 'Cremallera 30 cm', s: '2 tramos de 15 cm unidos con M3', when: 4.6 }],
  dims: [{ a: [0.012, D.BELT, 0.08], b: [0.012, D.PY0, 0.08], off: [0, 0, 0.03], text: '0.6 cm', when: 5.0, labAt: 0.5 }, { a: [0.012, D.BELT, 0.08], b: [0.012, D.PY1, 0.08], off: [0, 0, 0.075], text: '3.6 cm sobre la banda', when: 5.3 }],
  txt: { que: 'Atornillen los soportes delanteros de las varillas y del NEMA al travesaño del empujador, y los traseros al travesaño superior trasero. Monten las 2 varillas de 30 cm, horizontales. Atornillen la placa empujadora al carro y el carro a los 2 SC8UU. Unan los 2 tramos de la cremallera con tornillos M3, cuidando que los dientes sigan parejos.',
    porque: 'La placa debe quedar entre 0.6 y 3.6 cm arriba de la superficie de la banda: así toca el travesaño trasero del fixture de arriba y nunca el de abajo.',
    herr: 'Llaves Allen, tornillos M3.',
    check: 'La placa empuja el travesaño trasero del fixture de arriba sin tocar el de abajo.',
    error: 'Placa muy baja: arrastra el fixture de abajo al descargar.' } });
if (!DET) S({ ch: 'emp', et: 'Etapa 10', title: 'NEMA 17 y piñón', dur: 8,
  cam: { t: [-0.017, 0.905, 0.02], d: [0.35, 0.35, 1], r: 0.12 },
  add: ['pnema', 'pinion'], stagger: 1.6,
  labels: [{ p: 'pinion', o: [0, 0.03, 0.0], t: 'Piñón m1.5 · 20 dientes · Ø30', s: 'prisionero M3 sobre la cara plana', when: 2.0 }],
  txt: { que: 'Pongan el piñón en el eje del NEMA 17 con su prisionero M3 sobre la cara plana. Acerquen el motor a la cremallera hasta que engrane con un poquito de juego.',
    porque: 'Ni flojo (salta) ni apretado (se traba).',
    herr: 'Llave Allen chica.',
    check: 'El piñón engrana con la cremallera sin trabarse en los 30 cm.',
    error: 'Piñón muy apretado contra la cremallera: el motor pierde pasos y se oye un "tac-tac".' } });
else {
  S({ ch: 'emp', et: 'Etapa 10', title: 'NEMA 17 del empujador', dur: 7, cam: { t: [-0.017, 0.91, 0.03], d: [0.35, 0.45, 1], r: 0.12 }, add: ['pnema'],
    labels: [{ p: 'pnema', o: [0, 0.03, 0.02], t: 'NEMA 17 del empujador', s: 'su cable va a J9 (A4988 #3)', when: 1.4 }],
    txt: { que: 'Atornillen el NEMA 17 del empujador a su soporte, colgado del travesaño del empujador, con el eje hacia el centro.', porque: 'El piñón en su eje mueve la cremallera: 80 mm/s.', herr: 'Llave Allen, 4 tornillos M3 × 8.', check: 'El motor queda firme y paralelo a la cremallera.', error: 'Motor ladeado: el piñón engrana solo de un lado y salta.' } });
  S({ ch: 'emp', et: 'Etapa 10', title: 'Piñón m1.5 de 20 dientes', dur: 7, cam: { t: [-0.017, 0.905, 0.02], d: [0.35, 0.35, 1], r: 0.10 }, add: ['pinion'],
    labels: [{ p: 'pinion', o: [0, 0.03, 0.0], t: 'Piñón m1.5 · 20 dientes · Ø30', s: 'prisionero M3 sobre la cara plana', when: 1.6 }],
    txt: { que: 'Pongan el piñón en el eje del NEMA 17 con su prisionero M3 sobre la cara plana. Acerquen el motor a la cremallera hasta que engrane con un poquito de juego.', porque: 'Ni flojo (salta) ni apretado (se traba).', herr: 'Llave Allen chica.', check: 'El piñón engrana con la cremallera sin trabarse en los 30 cm.', error: 'Piñón muy apretado contra la cremallera: el motor pierde pasos y se oye un "tac-tac".' } });
}
S({ ch: 'emp', et: 'Etapa 10', title: 'Prueba a mano: 25 cm de carrera', dur: 9,
  cam: { t: [0.1, 0.86, 0.0], d: [0.45, 0.6, 1], r: 0.38 },
  mech: (t, m) => { m.push = D.P0 + D.STROKE * Math.sin(Math.PI * seg(t, 1.0, 8.0)); },
  labels: [{ p: 'pframe_r', o: [0.0, -0.12, 0.08], t: 'Final de carrera (home)', s: 'atrás', when: 1.0 }],
  dims: [{ a: [D.P0, D.PY0, -0.11], b: [D.P0 + D.STROKE, D.PY0, -0.11], off: [0, -0.02, 0], text: '250 mm', when: 3.0 }],
  txt: { que: 'Giren el piñón con los dedos: el carro debe recorrer 25 cm sin trabarse y la placa debe asomarse por la ventana al final.',
    porque: 'Con 25 cm el fixture sale completo hacia la estación de descarga.',
    herr: 'Los dedos.',
    check: 'El carro recorre los 25 cm a mano sin trabarse.',
    error: 'Si a mano se traba, con el motor se traba peor: revisen varillas paralelas y la unión de la cremallera.' } });
if (!DET) S({ ch: 'emp', et: 'Etapa 10', title: 'La uña: MG90S y dedo abatible', dur: 8,
  cam: { t: [0.03, 0.88, -0.01], d: [0.4, 0.45, -1], r: 0.10 },
  add: ['servo', 'horn', 'pin'], stagger: 1.2,
  mech: (t, m) => { m.pin = Math.sin(Math.PI * seg(t, 4.5, 7.5)); },
  labels: [{ p: 'servo', o: [0, 0.02, -0.01], t: 'MG90S de 180°', s: 'GPIO 5 · 5 V del XL4005', when: 1.6 }, { p: 'pin', o: [0.0, 0.03, 0], t: 'Uña abatible', s: 'gira 90°: de acostada a colgada detrás del travesaño', when: 3.0 }],
  txt: { que: 'Atornillen el MG90S a la pared de su soporte con sus 2 tornillos, con la flecha hacia el frente. Pongan su brazo y atornillen a él el dedo de la uña (2 × M2, los que trae el servo). Al frente, un M3 × 12 pasa por la oreja del soporte y se rosca en el dedo: es su perno.',
    porque: 'El jalón del fixture va a lo largo del eje: lo aguantan el perno y la oreja, no los engranes del servo. Los ángulos exactos de "arriba" y "abajo" se ajustan con el programa en la Etapa 12.',
    herr: 'Desarmador fino, Allen de 2.5 mm.',
    check: 'El dedo gira de acostado (hacia la derecha) a colgado sin rozar el soporte ni el carro.',
    error: 'Ajustar el brazo a la fuerza con la mano: se rompen los engranes del servo.' } });
else {
  S({ ch: 'emp', et: 'Etapa 10', title: 'Microservo MG90S (180°)', dur: 7, cam: { t: [0.02, 0.89, -0.02], d: [0.4, 0.45, -1], r: 0.08 }, add: ['servo'],
    labels: [{ p: 'servo', o: [0, 0.02, -0.01], t: 'MG90S de 180°', s: 'su cable va a J11 · GPIO 5 · 5 V del XL4005', when: 1.4 }],
    txt: { que: 'Atornillen el MG90S a la pared de su soporte en el carro (2 tornillos en sus orejas), acostado y con la flecha hacia el frente.', porque: 'El servo baja y sube la uña; el de 360° no se queda en un ángulo.', herr: 'Desarmador fino, los tornillos que trae el servo.', check: 'El servo queda firme y su cable sale hacia atrás, por abajo.', error: 'Comprar el de 360°: gira sin parar.' } });
  S({ ch: 'emp', et: 'Etapa 10', title: 'Brazo del servo y uña abatible', dur: 8, cam: { t: [0.03, 0.88, -0.01], d: [0.4, 0.45, -1], r: 0.10 }, add: ['horn', 'pin'], stagger: 1.2,
    mech: (t, m) => { m.pin = Math.sin(Math.PI * seg(t, 4.0, 7.5)); },
    labels: [{ p: 'pin', o: [0.0, 0.03, 0], t: 'Uña abatible (7 mm)', s: 'atornillada al brazo; perno M3 al frente', when: 2.4 }],
    txt: { que: 'Pongan el brazo del servo y atornillen a él el dedo de la uña con 2 tornillos M2 (los que trae el servo; si los barrenos del brazo no coinciden, barrénenlo con broca de 1.5 mm). Al frente, un M3 × 12 pasa por la oreja del soporte y se rosca en el dedo: es su perno.', porque: 'El jalón va a lo largo del eje: lo aguanta el perno, no los engranes. Los ángulos exactos de "arriba" y "abajo" se ajustan con el programa en la Etapa 12.', herr: 'Desarmador fino, Allen de 2.5 mm.', check: 'El dedo gira de acostado a colgado sin rozar el soporte ni el carro.', error: 'Ajustar el brazo a la fuerza con la mano: se rompen los engranes del servo.' } });
}
S({ ch: 'emp', et: 'Etapa 10', title: 'Prueba a mano de la uña', dur: 12,
  cam: { t: [0.16, 0.86, 0.0], d: [0.22, 0.42, 1], r: 0.27 },
  mech: (t, m) => { m.fx = Array(6).fill(null); loadMech(m, Math.min(LD.T.e, Math.max(-LD.PREP, (t - 2.6) * 0.95)), 0); m.plat = D.LOAD0; const r = Math.min(LD.RLAND, Math.max(D.XC - D.FL / 2, m.push + CLAW_BACK)); m.fx[0] = { x: r + D.FL / 2, y: D.LOAD0, z: 0, rz: 0 }; },
  focus: ['pin', 'fx0'],
  labels: [{ p: 'pin', o: [0.0, 0.035, 0.0], t: 'La uña baja detrás del travesaño', s: 'zona libre de 16 mm entre el travesaño y la ECU', when: 3.9 },
    { at: [0.26, 0.95, 0.10], t: 'El fixture queda centrado', s: '~3.5 mm libres atrás y adelante', when: 9.6 }],
  dims: [{ a: [D.PANX + 0.003, D.BELT + 0.075, 0.095], b: [LD.RLAND + D.FL, D.BELT + 0.075, 0.095], off: [0, 0.02, 0], text: '~6 cm afuera', when: 1.0 },
    { a: [D.XC - D.FL / 2, D.BELT + 0.075, -0.095], b: [LD.RLAND, D.BELT + 0.075, -0.095], off: [0, 0.02, 0], text: 'jala ~7.6 cm', when: 4.6 }],
  txt: { que: 'Con la plataforma a la altura de carga (81.85 cm), pongan un fixture como si la banda lo hubiera dejado: ~6 cm salido por la ventana. Adelanten el carro hasta que la uña quede sobre el hueco entre el travesaño trasero y la ECU, bájenla (gira 90° y cuelga con la punta a 2 cm de la quilla) y jalen el carro hacia atrás. El fixture se desliza sobre los largueros del de abajo (o sobre la plataforma) sin cabecear.',
    porque: 'La cinta deja de apoyar 6 cm antes de la tapa de la banda: el fixture cae a la pila con ~6 cm afuera y la uña jala los ~7.6 cm que faltan.',
    herr: 'Los dedos y un fixture de prueba.',
    check: 'Jalado a mano, el fixture queda centrado en la torre (holgura de ~3.5 mm atrás y adelante).',
    error: 'La uña cae sobre el travesaño o sobre la ECU: recalibren la posición de espera del empujador (la zona libre mide 16 mm).' } });

// ====================================================== ELECTRÓNICA (Etapas 11 y 13)
const isWire = id => /^w\d{3}$/.test(id);
const MODS = BOARD_IDS.filter(id => !isWire(id));
const WIRE_GROUPS = [...new Set(WIRES.map(w => w.group))];
const camTable = r => ({ t: [-0.1785 + TABLE_OFF.x, 0.735, TABLE_OFF.z - 0.01], d: [0.3, 1, 0.62], r });
const tAt = (u, v, dy = 0.004) => [bx(u) + TABLE_OFF.x, BRD.y + TABLE_OFF.y + dy, bz(v) + TABLE_OFF.z];
const COLOR_CODE = 'Código de colores: rojo 12 V · naranja 5 V · rosa 3.3 V · negro GND · verde STEP · azul DIR · café ENABLE · gris y turquesa bobinas · amarillo SDA · blanco SCL · morado RS485.';
const W_ERR = {
  [G1]: 'Invertir el capacitor (la franja es el −): se infla o revienta al conectar la batería.',
  [G2]: 'Conectar VDD a 5 V: el driver ya no entiende los 3.3 V del ESP32 y el motor no se mueve.',
  [G3]: 'Que el puente toque un pin de más (por ejemplo RESET con MS3): revísenlo con lupa.',
  [G4]: 'Contar mal los pines del ESP32: cuenten desde el USB y marquen el pin con plumón antes de soldar.',
  [G5]: 'Mezclar las bobinas (1A con 2A): el motor vibra y no gira.',
  [G6]: 'Alimentar el servo desde el pin 5V del ESP32 o desde el USB: el ESP32 se reinicia cuando el servo se mueve.',
  [G7]: 'Olvidar una tierra: el módulo "funciona a ratos". Todas las GND van unidas.',
  [G8]: 'Conectar RO directo al GPIO 16: el MAX485 manda 5 V y daña el ESP32 con el tiempo.',
  [G9]: 'Cruzar SDA con SCL: el escáner I²C no encuentra nada.',
  [G10]: 'Dejar un XSHUT sin conectar: ese sensor se queda prendido junto con el de la pila, los 2 en 0x29, y chocan al cambiarles la dirección.',
  [G11]: 'Usar el contacto NO del final: un cable roto se ve como "no presionado" y el motor choca.',
  [G13]: 'Conectar 12 V directo al GPIO 39: se quema el ESP32 al instante.',
  [G15]: 'Llevar el VCC del relé directo al GPIO 34 sin el divisor: entran 12 V y se quema el ESP32. Midan 2.0–2.4 V en el GPIO con el paro suelto antes de conectarlo.',
  [G17]: 'Invertirlo (franja a +5V): se infla o revienta al conectar. Y que la pata + toque el pin SIG de al lado.',
  [G16]: 'Olvidar la 10 kΩ: el GPIO 35 no tiene pull-up interno, queda "flotando" y el elevador se detiene o sube de más al azar.',
  [G14]: 'Mover la señal del servo a GPIO 2 o 12 "porque están libres": son pines de arranque y el ESP32 deja de programarse o de arrancar.',
};
function boxOf(ids, off) {
  const B = new THREE.Box3();
  for (const id of ids) { const p = PARTS.get(id); if (p) B.union(p.localBox.clone().translate(p.home)); }
  if (off) B.translate(off);
  return B;
}
function camFit(ids, off, d = [0.3, 1, 0.62], minR = 0.035, k = 0.62) {
  const B = boxOf(ids, off), c = B.getCenter(V3()), s = B.getSize(V3());
  return { t: c.toArray(), d, r: Math.max(minR, s.length() * k), fit: true };
}
function compStep(ch, et, id, extra = {}) {            // un componente, un paso (texto del catálogo)
  const c = compOf(id), inst = instOf(id), table = MODS.includes(id) || ['boost', 'xl4005', 'relay', 'fuses', 'cap_bus', 'voltm'].includes(id);
  const sh = c.short ?? c.name, nm = inst && c.inst.length > 1 ? (sh ? `${sh} · ${inst.name}` : inst.name) : (inst && inst.title) || c.name;
  S({ ch, et, title: extra.title || nm, dur: extra.dur || 8, comp: id,
    show: table ? ['mesa'] : [], cam: extra.cam || camFit([id], table ? TABLE_OFF : null, extra.d || (table ? [0.3, 1, 0.62] : [0.9, 0.55, 1]), extra.minR || 0.035),
    add: [table ? { ids: [id], pose: onTable } : id], addStart: 0.3, addDur: 1.4,
    labels: [{ p: id, o: extra.lo || [0, 0.012, 0], t: nm, s: (inst && inst.tag) || c.tag || '', when: 1.0 }],
    txt: { que: (inst && inst.mount) || c.mount, porque: (inst && inst.fn) || c.fn, herr: c.herr || '—', check: (inst && inst.check) || c.check || '—', error: (inst && inst.err) || c.err || '—' },
    ...extra.more });
}

if (!DET) {
  // ---------------- modo rápido: como antes, con la placa completa
  S({ ch: 'elec', et: 'Etapa 11', title: 'Placa principal en la mesa', dur: 10, cam: camTable(0.16),
    show: ['mesa'], add: [{ ids: ['tray'], pose: onTable }, { ids: MODS, pose: onTable }], stagger: 1.2,
    labels: [{ p: 'esp32', o: [0.0, 0.016, 0.0], t: 'ESP32 de cabeza en su tira hembra', when: 2.2 }, { p: 'drv2', o: [0, 0.016, 0], t: '3 A4988 · 100 µF c/u', s: 'VDD a 3.3 V', when: 2.8 },
      { p: 'max485', o: [0.0, 0.014, 0.0], t: 'MAX485 y convertidor', when: 3.4 }, { p: 'bno', o: [0, 0.014, 0], t: 'IMU BNO055', when: 3.8 }, { p: 'J4', o: [0.0, 0.014, 0.0], t: 'Borneras KF301 en las orillas', when: 4.2 },
      { p: 'r_div1', o: [0, 0.012, 0], t: 'Divisor de batería y 10 kΩ', when: 4.6 }, { p: 'r_paro1', o: [0, 0.012, 0], t: 'Divisor del paro y 10 kΩ del FC4', when: 5.2 }],
    txt: { que: 'Dibujen primero en papel dónde va cada cosa. Antes de meter cada módulo, comparen la serigrafía del módulo con el pin que marca la animación en cada barreno: el ESP32, el MAX485 y el convertidor van de cabeza, con sus tiras de pines soldadas del lado de los componentes (rev. 3.29); los A4988 y la BNO055 van normales. Suelden tira header hembra para el ESP32 y cada módulo, borneras KF301 en las orillas, las resistencias y un capacitor de 100 µF junto a cada A4988 (pata larga al +). Hagan clic en cualquier pieza para ver a dónde va cada pin.',
      porque: 'Con headers, un driver quemado se cambia en segundos. Todo se arma fuera del carrito, donde es fácil medir.',
      herr: 'Cautín de 40–60 W, soldadura 60/40, flux, thermofit, multímetro.',
      check: 'Todas las tierras unidas: hay continuidad entre batería − y GND del ESP32.',
      error: 'Puentes de soldadura entre pines vecinos: revísenlos con lupa y con la prueba de continuidad.' } });
  S({ ch: 'elec', et: 'Etapa 11', title: `Cableado de la placa (${WIRES.length} cables)`, dur: 14, cam: camFit(['perf'], TABLE_OFF, [0.3, 1, 0.62], 0.06, 0.5), dimOld: false,
    show: ['mesa'], add: WIRE_GROUPS.map(g => ({ ids: WIRES.filter(w => w.group === g).map(w => w.id), pose: onTable, lag: 0.03 })), addStart: 0.4, stagger: 0.7, addDur: 1.0,
    labels: [{ p: 'w001', o: [0.0, 0.01, 0.0], t: 'Rojo 12 V · negro GND', s: 'a los 3 A4988 y sus 100 µF', when: 1.2, until: 6 }, { p: 'w031', o: [0, 0.01, 0], t: 'STEP, DIR y ENABLE', s: 'del ESP32 a los drivers', when: 3.4, until: 8 },
      { at: tAt(70, 60, 0.012), t: 'RS485 · I²C · finales', when: 6.5 }, { at: tAt(70, 118, 0.012), t: 'XSHUT → J6 · I²C → IMU', when: 8.5 }],
    txt: { que: `Hagan las conexiones del mapa de pines con cable 22 AWG. En el modo súper explicativo se ve cable por cable; aquí, todos de un jalón. ${COLOR_CODE}`,
      porque: 'Con un color por función, cualquier error se ve a simple vista y se puede revisar con la tabla de cables.',
      herr: 'Cautín, cable 22 AWG de colores, pelacables, multímetro.',
      check: 'Cada cable de la tabla pita en continuidad de punta a punta y no pita con los pines vecinos.',
      error: 'Contar mal los pines del ESP32: cuenten desde el USB y marquen con plumón.' } });
  S({ ch: 'elec', et: 'Etapa 11', title: 'Ajustar voltajes antes de conectar nada', dur: 9, cam: camTable(0.17),
    show: ['mesa'], add: [{ ids: ['boost', 'xl4005', 'cap_bus'], pose: onTable }],
    labels: [{ p: 'boost', o: [0, 0.035, 0], t: 'Elevador 400 W → 18.0 V', s: 'sin carga · corriente al máximo', when: 1.8, cls: 'hot' },
      { p: 'xl4005', o: [0, 0.02, 0], t: 'XL4005 → 5.0–5.1 V', when: 2.6, cls: 'hot' },
      { p: 'drv2', o: [0, 0.02, 0], t: 'Vref de cada A4988', s: '0.80 V con R100 · 0.54 V con R068 → 1.0 A', when: 3.4, cls: 'hot' }],
    txt: { que: 'Conecten 12 V a cada módulo y, sin nada a la salida, giren su potenciómetro hasta leer 5.0–5.1 V en el XL4005 y 18.0 V en el elevador; luego, con el multímetro en 10 A entre OUT+ y OUT− del elevador, la perilla de corriente (CC) a ~6 A (si no se sienten seguros, déjenla como venía). Ajusten el Vref de los 3 A4988 sin motor conectado.',
      porque: 'La mayoría de las piezas se queman por un voltaje equivocado. Marquen cada módulo con su voltaje en cinta.',
      herr: 'Multímetro y desarmador fino (de plástico para el Vref).',
      check: 'XL4005 en 5.0–5.1 V y elevador en 18.0 V, medidos.',
      error: 'Conectar o desconectar un motor a pasos con el driver encendido: quema el A4988.' } });
  S({ ch: 'elec', et: 'Etapa 11', title: 'Fusibles, relé y prueba de humo', dur: 10, cam: camTable(0.17),
    show: ['mesa'], add: [{ ids: ['relay', 'fuses', 'voltm'], pose: onTable }, { ids: TRAYCAB_IDS, pose: onTable, lag: 0.12 }], stagger: 1.6,
    labels: [{ p: 'fuses', o: [0, 0.02, -0.01], t: 'Fusible 15 A · rama principal', s: '5 A · rama auxiliar (Jetson y lógica)', when: 1.6 },
      { p: 'relay', o: [0, 0.035, 0], t: 'Relé T90 30 A', s: 'el paro (NC) le corta la alimentación', when: 2.4 },
      { p: 'tc2', o: [0, 0.02, 0.0], t: 'Rojo 12 V · Naranja 5 V · Negro GND', s: '14 AWG en la rama de motores', when: 3.8 }],
    txt: { que: 'Del lado de la batería, XT60 hembra; del lado del carrito, el macho a 2 portafusibles: 15 A para motores y drivers (por el relé), 5 A para Jetson y lógica (con el KCD1). El relé se alimenta pasando por el contacto NC del paro. Prueba de humo sin ESP32 ni motores.',
      porque: 'Si alguien aprieta el paro, el relé se suelta y corta motores y drivers aunque el programa esté colgado.',
      herr: 'Cautín, XT60, terminales de ojillo, multímetro.',
      check: 'El paro corta el relé y deja 0 V en la rama de motores; nada se calienta en 2 minutos.',
      error: 'Conectar al revés (+ con −): quema el ESP32 o el módulo al instante. Midan antes de conectar.' } });
} else {
  // ---------------- modo súper explicativo: componente por componente
  S({ ch: 'placa', et: 'Etapa 11 · Placa', title: 'Plano en papel y placa perforada', dur: 10, cam: camTable(0.15),
    show: ['mesa'], add: [{ ids: ['tray'], pose: onTable }, { ids: ['perf'], pose: onTable }], stagger: 1.2,
    labels: [{ at: tAt(18, 42), t: 'Drivers A4988', s: 'del lado de atrás', when: 2.0 }, { at: tAt(44, 30), t: 'ESP32', s: 'USB hacia la orilla izquierda', when: 2.4 },
      { at: tAt(70, 40), t: 'Convertidor y MAX485', when: 2.8 }, { at: tAt(44, 130), t: 'IMU BNO055', when: 3.6 },
      { at: tAt(44, 67), t: 'Resistencias', when: 4.0 }, { at: tAt(4.6, 60), t: 'Borneras de motores', s: 'orilla de atrás', when: 4.4 }, { at: tAt(85.4, 75), t: 'Borneras de sensores', s: 'orilla del frente', when: 4.8 }],
    txt: { que: 'Dibujen en papel, a tamaño real, dónde va cada módulo y cada bornera, igual que en esta vista. Marquen con plumón la esquina de la placa que va hacia el frente del carrito.',
      porque: 'Con el plano, cada cable de la lista tiene su lugar fijo y nadie suelda "donde quepa".',
      herr: 'Placa perforada de 9 × 15 cm, papel, plumón, regla.',
      check: 'En el plano caben todos los módulos sin encimarse y las borneras quedan en las orillas.',
      error: 'Empezar a soldar sin plano: al final no caben las borneras.' } });
  compStep('placa', 'Etapa 11 · Placa', 'sockets', { minR: 0.09 });
  compStep('placa', 'Etapa 11 · Placa', 'esp32', { minR: 0.06 });
  for (const d of DRV) compStep('placa', 'Etapa 11 · Placa', d.id, { minR: 0.04 });
  for (const d of DRV) compStep('placa', 'Etapa 11 · Placa', 'cap' + d.n, { minR: 0.035 });
  for (const id of ['lvl', 'max485', 'bno', 'r_en', 'r_div1', 'r_div2', 'c_div', 'r_fc4', 'r_paro1', 'r_paro2', 'c_paro']) compStep('placa', 'Etapa 11 · Placa', id, { minR: 0.04 });
  S({ ch: 'placa', et: 'Etapa 11 · Placa', title: 'Borneras de atrás: motores y 12 V', dur: 9, cam: camFit(['J7', 'J9', 'J1'], TABLE_OFF, [0.3, 1, 0.62], 0.05),
    show: ['mesa'], add: [{ ids: ['J7', 'J8', 'J9', 'J1'], pose: onTable, lag: 0.5 }], addDur: 1.0,
    labels: ['J7', 'J8', 'J9', 'J1'].map((id, k) => ({ p: id, o: [-0.006, 0.012, 0], t: PARTS.get(id).name, when: 1.0 + k * 0.5 })),
    txt: { que: 'Suelden las borneras KF301 en la orilla de atrás con la entrada de los cables hacia afuera: J7, J8 y J9 (4 terminales, una por motor a pasos) y J1 (2 terminales, 12 V de motores).',
      porque: 'Todo lo que entra o sale de la placa va atornillado: si algo falla, se desconecta sin soldar.', herr: 'Cautín, borneras KF301 de 2 y 3 terminales (se enchufan entre sí para hacer 4 o 6).',
      check: 'Las borneras quedan derechas y al ras de la placa.', error: 'Soldarlas con la entrada hacia adentro: luego no entra el desarmador.' } });
  S({ ch: 'placa', et: 'Etapa 11 · Placa', title: 'Borneras del frente y header del servo', dur: 9, cam: camFit(['J2', 'J13'], TABLE_OFF, [0.3, 1, 0.62], 0.05),
    show: ['mesa'], add: [{ ids: ['J2', 'J11', 'J5', 'J4', 'J3', 'J6', 'J13'], pose: onTable, lag: 0.45 }], addDur: 1.0,
    labels: ['J2', 'J11', 'J5', 'J4', 'J3', 'J6', 'J13'].map((id, k) => ({ p: id, o: [0.006, 0.012, 0], t: PARTS.get(id).name, when: 1.0 + k * 0.45, cls: 'right' })),
    txt: { que: 'En la orilla del frente: J2 (5 V, GND y 12 V para medir), J11 (header macho de 3 pines para el servo), J5 (I²C), J4 (3 finales de carrera, 2 terminales cada uno), J3 (RS485), J6 (3 XSHUT) y J13 (final superior y lectura del paro).',
      porque: 'Quedan del lado de donde llegan sus cables: alimentación por la derecha, sensores y motores de las ruedas por el frente.', herr: 'Cautín, borneras KF301, 1 tira header macho.',
      check: 'Cada bornera tiene su etiqueta escrita en la placa con plumón.', error: 'No etiquetarlas: en la Etapa 13 nadie sabe cuál es cuál.' } });

  // ---------------- cableado: cable por cable
  S({ ch: 'cables', et: 'Etapa 11 · Cableado', title: `Antes de cablear: ${WIRES.length} cables, uno por uno`, dur: 9, cam: camTable(0.14), warn: true,
    show: ['mesa'],
    labels: [{ at: tAt(44, 30, 0.016), t: 'Quiten los módulos de sus zócalos', s: 'el calor del cautín los daña', when: 1.0, cls: 'hot' }, { at: tAt(70, 120, 0.016), t: 'Cable 22 AWG de colores', s: 'pelen 3 mm de cada punta', when: 2.0 }],
    txt: { que: `Con todo desconectado (sin batería), quiten los módulos de sus zócalos. Cada paso que sigue es UN cable: de qué pin sale, a qué pin llega, de qué color y cuánto mide. ${COLOR_CODE}`,
      porque: 'Un cable a la vez, revisado con el multímetro antes de pasar al siguiente: así un error se encuentra en segundos y no al final.',
      herr: 'Cautín de 40–60 W, soldadura 60/40, flux, cable 22 AWG de colores, pelacables, pinzas de punta, multímetro, lupa.',
      check: 'Lista impresa de los cables (botón "Tabla de cables") para ir tachando.',
      error: 'Soldar varios cables "de memoria" y revisar al final: si algo falla, no se sabe cuál fue.' } });
  let capSrvDone = false;
  for (const w of WIRES) {
    if (w.group === G17 && !capSrvDone) { capSrvDone = true; compStep('cables', 'Etapa 11 · Al final (rev. 3.17d)', 'cap_srv', { minR: 0.035 }); }
    const A = PIN[w.from], B = PIN[w.to];
    const pa = A.pos.clone().add(TABLE_OFF), pb = B.pos.clone().add(TABLE_OFF), mid = pa.clone().lerp(pb, 0.5);
    const r = Math.max(0.028, pa.distanceTo(pb) * 0.62 + 0.012);
    const cm = Math.max(2, Math.round(w.len / 10));
    S({ ch: 'cables', et: `Cableado · ${w.group}`, title: `Cable ${w.n}: ${w.short}`, dur: 6, wire: w, warn: true, dimOld: false,
      cam: { t: mid.toArray(), d: [0.3, 1, 0.62], r }, show: ['mesa'],
      add: [{ ids: [w.id], pose: onTable }], addStart: 0.25, addDur: 1.2,
      iso: { hi: [w.id], keep: [A.part, B.part], soft: ['perf', 'tray', 'mesa', 'sockets'] },
      ends: [pa.toArray(), pb.toArray()],
      labels: [{ at: [pa.x, pa.y + 0.002, pa.z], t: A.name, s: A.where, when: 0.2, cls: 'pin' }, { at: [pb.x, pb.y + 0.002, pb.z], t: B.name, s: B.where, when: 0.5, cls: 'pin right' }],
      txt: { que: w.bridge ? `Con alambre desnudo (sirve una pata cortada de resistencia) unan ${A.name} con ${B.name}, por el lado de la soldadura.`
          : `Corten ~${cm} cm de cable 22 AWG ${w.color} y pelen 3 mm de cada punta. Una punta va a ${A.name} (${A.where}); la otra, a ${B.name} (${B.where}).`,
        porque: w.why, herr: w.bridge ? 'Cautín, soldadura y una pata de resistencia sobrante.' : `Cautín, soldadura, cable 22 AWG ${w.color}, pelacables.`,
        check: `Multímetro en continuidad: pita entre ${A.name} y ${B.name}, y no pita entre ese pin y los de al lado.`,
        error: W_ERR[w.group] } });
  }
  S({ ch: 'cables', et: 'Etapa 11 · Cableado', title: 'Revisión con el multímetro y módulos a su zócalo', dur: 9, cam: camTable(0.15), focus: WIRES.map(w => w.id),
    show: ['mesa'],
    labels: [{ p: 'esp32', o: [0, 0.016, 0], t: 'Ahora sí: módulos a sus zócalos', s: 'cuidando la orientación (pin 1 con pin 1)', when: 1.2 }],
    txt: { que: 'Con la tabla de cables, revisen cada uno en continuidad y busquen cortos entre 12 V, 5 V, 3.3 V y GND (no debe pitar ninguno). Luego monten cada módulo en su zócalo.',
      porque: 'Un corto entre 12 V y 3.3 V quema todo al conectar la batería; se encuentra en 2 minutos con el multímetro.',
      herr: 'Multímetro en continuidad, lupa, la tabla de cables.', check: 'Ningún corto entre rieles; cada cable de la tabla, marcado como revisado.', error: 'Montar un módulo al revés en su zócalo: revisen que 3V3 del ESP32 quede del lado de los A4988.' } });

  // ---------------- potencia en la mesa
  compStep('pot', 'Etapa 11 · Potencia', 'boost', { minR: 0.07 });
  compStep('pot', 'Etapa 11 · Potencia', 'xl4005', { minR: 0.05 });
  S({ ch: 'pot', et: 'Etapa 11 · Potencia', title: 'Vref de los 3 A4988 (1.0 A)', dur: 8, cam: camFit(['drv1', 'drv3'], TABLE_OFF, [0.3, 1, 0.62], 0.05), show: ['mesa'], focus: ['drv1', 'drv2', 'drv3'],
    labels: DRV.map((d, k) => ({ p: d.id, o: [0.004, 0.014, 0], t: `A4988 #${d.n} · Vref`, s: '0.80 V con R100 · 0.54 V con R068', when: 1.0 + k * 0.6, cls: 'hot' })),
    txt: { que: 'Con 3.3 V en VDD y 12 V en VMOT, y sin motor conectado: punta negra en GND, roja en el potenciómetro metálico del driver. Giren despacio hasta 0.80 V (R100) o 0.54 V (R068). Péguenles su disipador.',
      porque: 'Así cada motor recibe 1.0 A: fuerza suficiente sin que se calienten.', herr: 'Multímetro, desarmador de plástico.', check: 'Los 3 anotados: elevador ___ V, ___ V; empujador ___ V.',
      error: 'Conectar o desconectar un motor con el driver encendido: quema el A4988.' } });
  compStep('pot', 'Etapa 11 · Potencia', 'fuses', { minR: 0.05 });
  compStep('pot', 'Etapa 11 · Potencia', 'relay', { minR: 0.05 });
  compStep('pot', 'Etapa 11 · Potencia (rev. 3.17d)', 'cap_bus', { minR: 0.04 });
  compStep('pot', 'Etapa 11 · Potencia (rev. 3.17d)', 'voltm', { minR: 0.04 });
  for (const c of CABLES.filter(c => c.tray)) {
    const keep = [endPart(c.from), endPart(c.to)];
    S({ ch: 'pot', et: 'Etapa 11 · Potencia', title: `${c.name}`, dur: 7, cable: c, warn: true, dimOld: false,
      cam: camFit([c.id, ...keep], TABLE_OFF, [0.3, 1, 0.62], 0.05, 0.55), show: ['mesa'],
      add: [{ ids: [c.id], pose: onTable }], addStart: 0.5, addDur: 1.8,
      iso: { hi: [c.id], keep, soft: ['perf', 'tray', 'mesa'] },
      labels: [{ p: keep[0], o: [0, 0.03, 0], t: c.fromName, when: 0.3, cls: 'pin' }, { p: keep[1], o: [0, 0.03, 0.0], t: c.toName, when: 0.6, cls: 'pin right' }],
      txt: { que: `Cable ${c.gauge} ${c.color}: de ${c.fromName} a ${c.toName}. ${c.gauge.includes('14') ? 'Con terminal de ojillo o estañado en las borneras de tornillo.' : 'Pelen 5 mm y aprieten bien el tornillo de la bornera.'}`,
        porque: c.why, herr: `Cable ${c.gauge}, pelacables, desarmador, multímetro.`, check: 'Jalen suave el cable: no se sale de la bornera.', error: 'Cable de potencia delgado (22 AWG) en la rama de 15 A: se calienta y se derrite.' } });
  }
  S({ ch: 'pot', et: 'Etapa 11 · Potencia', title: 'Prueba de humo', dur: 9, cam: camTable(0.17), show: ['mesa'], focus: ['relay', 'fuses', 'boost', 'xl4005'],
    labels: [{ p: 'relay', o: [0, 0.035, 0], t: 'El relé hace "clic"', s: 'aprieten el paro: suelta', when: 1.5, cls: 'hot' }, { p: 'xl4005', o: [0, 0.02, 0], t: '5 V en la placa', when: 2.4 }],
    txt: { que: 'Sin ESP32 ni motores: conecten el XT60 y prendan el KCD1. Midan 5 V en la placa y 12 V antes del relé; el relé hace clic. Aprieten el paro: el relé suelta y el NO queda en 0 V. Toquen los módulos a los 2 minutos.',
      porque: 'Si algo está mal conectado, se descubre sin arriesgar el ESP32 ni los drivers.', herr: 'Multímetro, batería cargada.', check: 'Ninguna pieza caliente ni con olor; los voltajes correctos.',
      error: 'Hacer la prueba con los módulos puestos: un error los quema todos juntos.' } });
}

// ---------------- al carrito (Etapa 13)
const TRAY_IDS = ['tray', ...BOARD_IDS, 'boost', 'xl4005', 'cap_bus', 'relay', 'fuses', 'voltm', ...TRAYCAB_IDS];
const ELEC_CH = DET ? 'carro' : 'elec', ELEC_ET = DET ? 'Etapa 13 · Al carrito' : 'Etapa 13';
S({ ch: ELEC_CH, et: ELEC_ET, title: 'La bandeja al carrito', dur: 9,
  cam: { t: [-0.16, 0.25, 0.1], d: [-0.85, 0.75, 0.75], r: 0.42 },
  add: [{ ids: TRAY_IDS, pose: 'home', lag: 0 }, ...(DET ? [] : ['kcd1'])], stagger: 2.8, addDur: 2.4,
  labels: [{ p: 'tray', o: [0, 0.05, 0], t: 'Bandeja con porta-placa', s: 'la placa entra a presión: ganchos atrás y broches al frente', when: 3.0 }, ...(DET ? [] : [{ p: 'kcd1', o: [-0.01, 0.03, 0.02], t: 'Interruptor KCD1', s: 'accesible desde afuera', when: 4.0 }])],
  txt: { que: 'Con el XT60 desconectado, atornillen la bandeja y sobre ella la placa, el elevador, el relé y el XL4005 con separadores M3. Pongan portafusibles, KCD1 y paro donde se alcancen desde afuera.',
    porque: 'Lo que ya funcionó en la mesa solo se pasa al carrito; cualquier falla nueva es del montaje.',
    herr: 'Separadores M3, desarmador, cinchos.',
    check: 'Con el XT60 desconectado, el multímetro en continuidad entre + y − no pita (no hay corto).',
    error: 'Dejar la placa tocando el aluminio: un corto en cuanto el carrito vibra.' } });
if (!DET) {
  S({ ch: 'elec', et: 'Etapa 13', title: 'Sensores: 4 VL53L0X', dur: 9,
    cam: { t: [0.05, 0.50, 0.02], d: [1, 0.32, 0.85], r: 0.74 },
    add: ['vl_front', ['vl_sideL', 'vl_sideR'], 'vl_pile'], stagger: 1.2,
    mech: (t, m) => { m.cones = t > 1.0; },
    labels: [{ p: 'vl_front', o: [0.02, 0.03, 0], t: 'VL53L0X frontal', s: '~20 cm del piso · frena a < 40 cm', when: 1.2 },
      { p: 'vl_sideR', o: [0, 0.03, 0.02], t: 'VL53L0X lateral (×2)', when: 2.4 }, { p: 'vl_pile', o: [0, 0.03, 0], t: 'VL53L0X de la pila', s: 'detecta presencia (±25 mm) · sin XSHUT', when: 3.6 }],
    txt: { que: 'Monten 3 VL53L0X de obstáculos a ~20 cm del piso (frente y los 2 lados) y 1 arriba de la torre mirando hacia abajo, sobre la esquina trasera de un costado.',
      porque: 'Los 3 de abajo frenan el carrito sin esperar al Jetson; el de arriba confirma que hay un fixture en la pila.',
      herr: 'Desarmador, tornillos M2, soportes impresos.',
      check: 'Los 4 VL53L0X responden en 0x30–0x33 y miden bien a 10, 30 y 60 cm.',
      error: 'Cables de señal pegados a los de potencia: los VL53L0X y el RS485 fallan "al azar".' } });
  S({ ch: 'elec', et: 'Etapa 13', title: 'Jetson, cámara y paro de emergencia', dur: 8,
    cam: { t: [-0.04, 1.02, 0.02], d: [-0.5, 0.9, 0.8], r: 0.36 },
    add: [['jet_plate'], ['jetson'], ['camera', 'estop']], stagger: 1.2,
    labels: [{ p: 'jetson', o: [0, 0.04, 0], t: 'Jetson Orin Nano Super', s: 'plug 5.5 × 2.5 mm · centro = +', when: 2.0 }, { p: 'estop', o: [0, 0.05, 0], t: 'Paro LAY37', s: 'arriba, en una esquina de atrás', when: 3.2 },
      { p: 'camera', o: [0, 0.04, 0], t: 'Cámara', s: 'YOLO (ECU) y ArUco', when: 3.8 }],
    txt: { que: 'Atornillen el Jetson arriba. Antes de enchufarle el plug, midan con el multímetro que el centro sea el +. Conecten la cámara y el USB al ESP32.',
      porque: 'El paro queda al alcance de la mano en cualquier momento del ciclo.',
      herr: 'Multímetro, desarmador.',
      check: 'El paro detiene ruedas, elevador y empujador al instante y la plataforma se queda donde estaba.',
      error: 'Plug del Jetson con la polaridad al revés: se daña el Jetson. Midan siempre antes.' } });
  const C = id => CABLES.filter(c => !c.tray).map(c => c.id).filter(x => x.startsWith(id));
  S({ ch: 'elec', et: 'Etapa 13', title: 'Cableado por colores', dur: 11,
    cam: { t: [-0.02, 0.46, 0.02], d: [0.85, 0.45, 1], r: 0.66 },
    add: [['xt60', ...C('cab_bat'), 'cab_kcd'], [...C('cab_18'), ...C('cab_485')], [...C('cab_nema'), 'cab_pnema', ...C('cab_lsw')], ['cab_servo', 'cab_servo_loop', ...C('cab_i2c')], ['cab_jet', 'cab_stop', 'cab_paro', 'cab_usb'], ['zt_all']], stagger: 1.0, addDur: 1.0,
    labels: [{ p: 'cab_18_R', o: [0, 0.02, 0], t: 'Naranja 18 V → M0601', s: 'rojo 12 V · negro GND', when: 2.0 }, { p: 'cab_485_L', o: [0, 0.03, 0], t: 'Celeste: RS485', when: 2.6 },
      { p: 'cab_nema_R', o: [0.03, 0.03, 0], t: 'Azul: motores a pasos', when: 3.4 }, { p: 'cab_i2c', o: [0, 0.05, 0], t: 'Amarillo: I²C', when: 4.2 },
      { p: 'cab_servo_loop', o: [0.02, 0.02, 0], t: 'Servo: lazo que viaja con el carro', when: 5.0 }, { p: 'zt_all', o: [0, 0.02, 0], t: 'Cinchos cada 15–20 cm', when: 6.4 }, { p: 'cab_usb', o: [0.0, 0.03, 0], t: 'Beige: finales · blanco: USB', when: 5.6 }, { p: 'cab_i2cbus', o: [0.03, 0.03, 0], t: 'Empalme del bus I²C', when: 4.6 }],
    txt: { que: 'Los cables van en mazos. Abajo: acostados sobre los 2 largueros, del frente hacia la bandeja. Arriba → abajo: por la cara del frente de los 2 postes traseros. Todos llegan al frente de la bandeja en un solo mazo y de ahí cada uno sube a su bornera. Un cincho cada 15–20 cm, alrededor del perfil. Cada NEMA a su bornera (J7, J8, J9), finales de carrera como NC a J4 (el superior a J13), un hilo del VCC del relé a J13 PARO y cada cable etiquetado en sus dos puntas.',
      porque: 'Un cable flojo o rozando algo que se mueve es la falla más común el día de la demo.',
      herr: 'Cinchos, etiquetas, multímetro.',
      check: 'Ningún cable roza la plataforma, el empujador ni las ruedas en todo su recorrido.',
      error: 'Cable del servo sin curva floja: se jala en los 25 cm de recorrido.' } });
} else {
  compStep('carro', ELEC_ET, 'kcd1', { d: [-1, 0.5, 0.6], minR: 0.10 });
  compStep('carro', ELEC_ET, 'vl_front', { d: [1, 0.4, 0.6], minR: 0.12, more: { mech: (t, m) => { m.cones = t > 1.5; } } });
  compStep('carro', ELEC_ET, 'vl_sideL', { d: [0.3, 0.4, -1], minR: 0.12 });
  compStep('carro', ELEC_ET, 'vl_sideR', { d: [0.3, 0.4, 1], minR: 0.12 });
  compStep('carro', ELEC_ET, 'vl_pile', { d: [0.25, -0.15, 1], minR: 0.16 });
  compStep('carro', ELEC_ET, 'jet_plate', { d: [-0.5, 0.9, 0.8], minR: 0.25 });
  compStep('carro', ELEC_ET, 'jetson', { d: [-0.5, 0.9, 0.8], minR: 0.14 });
  compStep('carro', ELEC_ET, 'camera', { d: [1, 0.5, 0.7], minR: 0.12 });
  compStep('carro', ELEC_ET, 'estop', { d: [-0.6, 0.9, 0.8], minR: 0.12 });
  const cart = CABLES.filter(c => !c.tray);
  cart.forEach((c, k) => {
    const keep = CAB_PARTS[c.id] || [];
    S({ ch: 'carro', et: 'Etapa 13 · Cables del carrito', title: `Cable ${k + 1} de ${cart.length}: ${c.name}`, dur: 8, cable: c, warn: true, dimOld: false,
      cam: camFit([c.id, ...keep], null, [0.85, 0.6, 1], 0.12, 0.6),
      add: [c.id], addStart: 0.5, addDur: 2.2,
      iso: { hi: [c.id], keep, soft: ['tray', 'perf', 'bat'] },
      labels: [{ p: keep[0] || c.id, o: [0, 0.03, 0], t: c.ends[0], when: 0.4, cls: 'pin' }, { p: keep[1] || c.id, o: [0, 0.03, 0], t: c.ends[1], when: 0.8, cls: 'pin right' }],
      txt: { que: `Cable ${c.gauge}, de ${c.ends[0]} a ${c.ends[1]}. Hilo por hilo: ${c.cond.map(([col, txt]) => `${col}: ${txt}`).join(' · ')}.`,
        porque: c.why, herr: 'Pelacables, desarmador, cinchos, etiquetas, multímetro.',
        check: 'Etiquetado en las 2 puntas, sujeto con cincho cada ~10 cm y lejos de lo que se mueve.',
        error: 'Conectarlo con la batería conectada: siempre con el XT60 suelto.' } });
  });
  S({ ch: 'carro', et: ELEC_ET, title: 'Revisión: nada roza en todo el recorrido', dur: 9, cam: { t: [-0.02, 0.46, 0.02], d: [0.85, 0.45, 1], r: 0.66 }, focus: cart.map(c => c.id),
    mech: (t, m) => { m.plat = 0.62 - 0.2 * Math.sin(Math.PI * seg(t, 1.0, 8.0)); m.push = D.P0 + D.STROKE * Math.sin(Math.PI * seg(t, 1.0, 8.0)); },
    labels: [{ p: 'cab_servo', o: [0.02, 0.02, 0], t: 'Servo: curva floja de ~30 cm', when: 2.0 }],
    txt: { que: 'Muevan a mano el elevador y el empujador por todo su recorrido y vean cada cable. Amarren con cinchos los que se acerquen a algo que se mueve.',
      porque: 'Un cable flojo o rozando algo que se mueve es la falla más común el día de la demo.', herr: 'Cinchos, etiquetas.',
      check: 'Ningún cable roza la plataforma, el empujador ni las ruedas.', error: 'Cable del servo sin curva floja: se jala en los 25 cm de recorrido.' } });
}


// ====================================================== CAPÍTULO E15 — ACOPLE A LA BANDA (rev. 3.39)
{
  const ACM = (x = -1.1) => (t, m) => { m.station = 'belt'; m.cart.x = x; m.cart.z = 0; m.plat = D.LOAD0; m.push = D.P0; m.pin = 0; m.fx = Array(6).fill(null); };
  const ACCAM = { t: [DOCK + 0.02, 0.70, 0.0], d: [0.8, 0.55, 0.9], r: 0.85 };
  const zfV = X => 201.5 + Math.max(0, 50 * (-76 - X) / 87);                  // cara de la V (mm de la banda)
  S({ ch: 'acople', et: 'Etapa 15', title: 'Calzas y brazos al costado de la banda', dur: 11, cam: ACCAM, mech: ACM(),
    add: [{ ids: ['st_ac_calza'], from: [0, 0, 0] }, { ids: ['st_ac_brazo'], from: [0, 0.25, 0] }, { ids: ['st_ac_b80'], from: [0, 0, 0] }], addStart: 0.6, stagger: 2.2, addDur: 1.4,
    labels: [{ at: [DOCK + 0.18, 0.705, 0.20], t: 'Calza impresa (hueca)', s: '69.75 mm: aleja el brazo de la guarda', when: 1.2 },
      { at: [DOCK - 0.10, 0.705, 0.245], t: 'Brazo derecho: 3030 de 443', s: 'sin cortar · detrás de la guarda', when: 3.4 },
      { at: [DOCK - 0.10, 0.705, -0.245], t: 'Brazo izquierdo: 3030 de 370', s: 'sin cortar', when: 3.8 },
      { at: [DOCK + 0.145, 0.705, 0.17], t: '2 M6 × 80 hex. por lado', s: 'cabeza dentro del canal (llave de 10) · tuerca T en el brazo', when: 5.6 }],
    dims: [{ a: [DOCK + 0.26, 0, 0.275], b: [DOCK + 0.26, 0.705, 0.275], off: [0, 0, 0.03], text: '705 mm (centro del brazo)', when: 2.0 },
      { a: [DOCK, 0.735, 0.27], b: [DOCK + 0.145, 0.735, 0.27], off: [0, 0.02, 0], text: '145', when: 6.4 },
      { a: [DOCK, 0.765, 0.27], b: [DOCK + 0.215, 0.765, 0.27], off: [0, 0.02, 0], text: '215 mm de la tapa', when: 6.8 },
      { a: [DOCK, 0.735, -0.27], b: [DOCK + 0.142, 0.735, -0.27], off: [0, 0.02, 0], text: '72 y 142 (izq.)', when: 7.4 },
      { a: [DOCK - 0.120, 0.725, 0.262], b: [DOCK, 0.725, 0.262], off: [0, 0.02, 0.02], text: '120 mm hacia el carrito', when: 8.2 }],
    txt: { que: 'Barrenen 4 barrenos de 6.5 mm en la cara de afuera de los canales de la banda, a 705 mm del piso: a 145 y 215 mm de la tapa del lado derecho (motor y guarda) y a 72 y 142 del izquierdo. Usen la calza como plantilla. Luego calza contra el costado (su lengüeta hacia afuera), y 2 M6 × 80 de cabeza hexagonal con rondana por lado, desde dentro del canal, pasando la calza; en la punta enrosquen 2 vueltas una tuerca T de martillo con su lado largo a lo largo de la ranura. Acerquen el brazo: las tuercas y la lengüeta de la calza entran en su ranura (la lengüeta está cortada junto a cada tornillo para que la tuerca asiente). Con el brazo horizontal, aprieten con la llave de 10: la tuerca gira 90° y se tranca contra el labio.',
      porque: 'Así no se corta perfil: se usan el 443 y el 370 que sobraron. La calza aleja el brazo 69.75 mm del bastidor para librar la guarda (queda a 3.75 mm) y la banda de al lado (31.6 mm).',
      herr: 'Taladro y broca de 6.5 mm, llave de 10 (mejor de matraca), flexómetro, nivel.',
      check: 'Los 2 brazos quedan horizontales (nivel), a la misma altura y salen solo 120 mm hacia el carrito (no más: detrás de la V).',
      error: 'Dejar el brazo más salido hacia el carrito: un poste que llega corrido más de 3 cm pega en su punta antes de entrar a la V. Y barrenar sin revisar adentro del canal (ejes, chumaceras, sensores).' } });
  S({ ch: 'acople', et: 'Etapa 15', title: 'Guías en V con tope encima de los brazos', dur: 10, cam: { t: [DOCK - 0.12, 0.735, 0.20], d: [0.55, 0.85, 0.9], r: 0.50 }, mech: ACM(),
    add: [{ ids: ['st_ac_guia'], from: [0, 0.2, 0] }, { ids: ['st_ac_b12'], from: [0, 0.08, 0] }], addStart: 0.6, stagger: 2.0, addDur: 1.3,
    labels: [{ at: [DOCK - 0.15, 0.75, 0.24], t: 'V de 50 mm por lado', s: 'captura el error de llegada de ±5 cm', when: 1.6, until: 3.6 },
      { at: [DOCK - 0.04, 0.75, 0.2035], t: 'Canal recto', s: '1.5 mm de juego por lado del poste', when: 3.6, until: 5.4 },
      { at: [DOCK - 0.0005, 0.75, 0.186], t: 'Tope de 90 mm de alto', s: 'pegan los postes delanteros (3 mm de la tapa)', when: 5.4, until: 7.4 },
      { at: [DOCK - 0.085, 0.727, 0.245], t: '4 M6 × 16 por guía', s: 'todos desde arriba, a la ranura de arriba del brazo', when: 7.4 }],
    dims: [{ a: [DOCK - 0.003, 0.757, 0.15], b: [DOCK, 0.757, 0.15], off: [0, 0.02, 0], text: '3 mm', when: 5.6 },
      { a: [DOCK - 0.163, 0.752, 0.2008], b: [DOCK - 0.163, 0.752, 0.2508], off: [-0.02, 0.01, 0], text: '50 mm', when: 2.0 }],
    txt: { que: 'Pongan cada guía sobre su brazo, con la placa sobre la cara de arriba y el bloque del tope recargado en la cara de adentro del brazo: antes de bajarla pasen los 4 M6 × 16 con rondana por la placa y enrosquen abajo una tuerca T de martillo 2 vueltas en cada uno, alineada a lo largo del brazo. Bájenla en vertical: las tuercas caen en la ranura de arriba. Antes de apretar, empújenla contra el costado del brazo (la brida del bloque del tope pegada a él: eso deja el canal a 1.5 mm del poste) y córranla hasta que el tope quede a 3 mm de la tapa. Aprieten en cruz desde arriba: cada tuerca gira 90° y se tranca.',
      porque: 'Las guías centran el frente del carrito y el tope lo detiene siempre en el mismo lugar: la ventana queda frente a la cinta sin depender de la navegación.',
      herr: 'Llave Allen de 5 mm (o dado de 10 si usan tornillos de cabeza en T con tuerca de brida de 16 mm o más), flexómetro.',
      check: 'Entre las caras de adentro de los 2 canales hay 403 mm (los postes miden 400 por fuera) y los topes quedan a 3 mm de la tapa.',
      error: 'Apretar las guías contra los postes: el carrito se atora y no llega a los topes.' } });
  S({ ch: 'acople', et: 'Etapa 15', title: 'Prueba a mano: entrar corrido 4.5 cm', dur: 9, cam: { t: [DOCK - 0.10, 0.70, 0.0], d: [0.75, 0.8, 0.9], r: 0.85 },
    mech: (t, m) => { ACM()(t, m); m.cart.x = lerp(-0.62, 0, segE(t, 0.4, 6.8)); const X = (m.cart.x + 0.250 - DOCK) * 1000; m.cart.z = Math.min(0.045, (zfV(X) - 201.5) / 1000); },
    labels: [{ at: [DOCK - 0.30, 0.95, 0.25], t: 'Llega 4.5 cm corrido', s: 'la V toma el poste delantero', when: 1.0, until: 4.5 },
      { at: [DOCK - 0.02, 0.95, 0.2], t: 'Centrado y en el tope', s: '±1.5 mm, 3 mm de la tapa', when: 6.9 }],
    txt: { que: 'Con el carrito sin motores (o con los M0601 sueltos), empújenlo a mano hacia la banda entrando corrido 5 cm, primero de un lado y luego del otro. La V debe llevar el poste delantero al canal recto y el carrito tiene que llegar a los 2 topes.',
      porque: 'Es la prueba de que la V captura el error de navegación de Mario (±5 cm) antes de programar nada.',
      herr: 'Flexómetro.',
      check: 'Entrando corrido de cualquier lado, termina centrado (±1 mm) y pegado a los 2 topes, sin atorarse ni brincar.',
      error: 'Entrar rápido: la V gira el carrito (tracción diferencial) en vez de recorrerlo de lado. Mario entra a 5 cm/s.' } });
}

// ====================================================== CAPÍTULO 7 — FUNCIONAMIENTO
const OP = { keepFx: true, dimOld: false };
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'La banda completa: 3 tramos y una sola cinta', dur: 10,
  cam: { t: [1.6, 0.62, 0.0], d: [0.12, 0.42, 1], r: 1.8 },
  mech: (t, m) => { m.station = 'belt'; m.cart.x = -1.1; m.plat = D.LOAD0; m.fx = Array(6).fill(null); },
  labels: [{ at: [DOCK + 0.01, D.BELT - 0.07, -0.16], t: 'Extremo cerrado', s: 'tapa + 2 rodillos de Ø50 · aquí llega el carrito', when: 1.0 },
    { at: [BELT_XF, D.BELT + 0.01, -0.12], t: 'Rodillo de Ø85', s: 'extremo abierto · aquí se ponen los fixtures', when: 2.0, cls: 'right' },
    { at: [DOCK + BND.SEG, D.BELT - 0.15, 0.17], t: 'Unión de tramos', s: 'la cinta no se corta', when: 3.0 }],
  dims: [{ a: [DOCK, D.BELT - BND.YTOP, 0.17], b: [BELT_X1, D.BELT - BND.YTOP, 0.17], off: [0, -0.05, 0.03], text: '3.09 m (3 × 1030 mm)', when: 1.5 },
    { a: [DOCK - 0.02, 0, -0.16], b: [DOCK - 0.02, D.BELT, -0.16], off: [0, 0, -0.05], text: '82.15 cm (cinta)', when: 2.5 },
    { a: [BELT_XA, D.BELT + 0.03, 0], b: [BELT_XF, D.BELT + 0.03, 0], off: [0, 0.03, 0], text: '2.95 m de cinta útil: ~15 s de viaje', when: 5.0, labAt: 0.62 }],
  txt: { que: 'Su modelo de SolidWorks es un tercio de la banda: aquí son 3 tramos de 1030 mm pegados (3.09 m) con una sola cinta de 20.35 cm que abraza el rodillo de Ø85 de la punta lejana y los 2 de Ø50 del extremo cerrado. El carrito siempre llega por el extremo cerrado.',
    porque: 'Es una sola cinta: se detiene para la inspección y vuelve a correr para traer el fixture, sin esperar al carrito. Por eso va un fixture a la vez y el PLC suelta el siguiente solo cuando el carrito avisa "listo" (ver "Cargar hasta 6").',
    herr: '—',
    check: 'Midan la velocidad real (marca en la cinta y cronómetro en 1 m) y la altura de la cinta: aquí se supuso 0.20 m/s; la cinta está a 82.15 cm (medida).',
    error: 'Poner un fixture sin el carrito acoplado: llega a la punta y se cae al piso (83 cm). El extremo cerrado no tiene tope donde pasa la cinta.' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Acople en la banda', dur: 9,
  cam: { t: [0.25, 0.55, 0.0], d: [0.75, 0.6, 1], r: 0.95 },
  mech: (t, m) => { m.station = 'belt'; m.cart.x = lerp(-1.1, 0, segE(t, 0.3, 4.5)); m.plat = D.LOAD0; m.fx = Array(6).fill(null); },
  labels: [{ at: [0.15, 0.72, 0.30], t: 'Guías de entrada en V', s: 'centran los postes delanteros (±1.5 mm)', when: 4.0 }, { at: [0.26, 0.64, -0.20], t: 'Topes', s: 'los postes pegan a 3 mm de la tapa', when: 4.6 }, { at: [0.35, 0.52, 0.30], t: 'ArUco', s: 'el Jetson verifica la posición', when: 5.2 },
    { at: [0.6, D.BELT + 0.02, 0.1], t: 'Guías de 3 mm colgadas de los rieles', s: '2 mm por lado de la quilla (propuesta)', when: 5.8 },
    { at: [BELT_XA, D.BELT + 0.02, -0.1], t: 'Aquí deja de apoyar la cinta', s: '6 cm antes de la tapa', when: 6.6 }],
  dims: [{ a: [D.PANX + 0.003, D.BELT + 0.004, -0.06], b: [BELT_XA, D.BELT + 0.004, -0.06], off: [0, 0.04, 0], text: '6.3 cm sin apoyo', when: 6.8 }],
  txt: { que: 'El carrito llega por waypoints y entra despacio (5 cm/s): las guías en V atornilladas a la banda toman sus postes delanteros y lo centran, y avanza hasta que sus postes delanteros pegan en los 2 topes (el M0601 se frena y lo reporta). El Jetson confirma con el ArUco. Hace home del elevador y del empujador y deja la plataforma a 81.85 cm: 3 mm debajo de la cinta. Hasta entonces avisa "listo" y se pone el primer fixture en la punta lejana.',
    porque: 'Después de la inspección la cinta corre hasta la punta: un fixture soltado antes de tiempo llega sin carrito y se cae. Por eso el PLC espera el "listo".',
    herr: 'Programa del ESP32 y del Jetson (Etapa 14).',
    check: 'La ventana queda frente a la banda, centrada (±5 mm) y a menos de 1 cm de la tapa.',
    error: 'Carrito separado de la tapa: el hueco sin apoyo crece y el frente del fixture cae más de 3 mm al entrar.' } });
// rev. 3.48: estación de inspección y scrap (centro del 2.º tramo, a 1.545 m de la tapa)
const RJCAM = { t: [RJ.X - 0.02, D.BELT + 0.12, -0.10], d: [-0.45, 0.6, 0.85], r: 0.5 };
const rjFix = (m, x) => { m.fx = Array(6).fill(null); m.fx[0] = { x, y: D.BELT, z: 0, rz: 0 }; };
const KF = (t, ks) => {                     // interpolación por tramos de [t, z, y, rx]
  if (t <= ks[0][0]) return ks[0].slice(1);
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const a = ks[i - 1], b = ks[i], u = ease((t - a[0]) / (b[0] - a[0])); return [1, 2, 3].map(j => lerp(a[j], b[j], u)); }
  return ks[ks.length - 1].slice(1);
};
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Estación de inspección y scrap', dur: 10,
  cam: { t: [RJ.X - 0.02, D.BELT + 0.15, -0.05], d: [-0.5, 0.55, 0.85], r: 0.62 },
  mech: (t, m) => { m.station = 'belt'; m.fx = Array(6).fill(null); m.beltS = 0; m.vis = segE(t, 6.0, 6.6); m.rej = 0; m.lamp = t > 7.6 ? (t < 8.8 ? 1 : 2) : 0; },
  labels: [{ at: [RJ.X, D.BELT + RJ.YCAM + 0.04, 0.0], t: 'Cámara Logitech C270 (USB)', s: 'a ~37 cm de la ECU · Raspberry Pi 4 + YOLO', when: 0.6, until: 2.8 },
    { at: [RJ.X - 0.12, D.BELT + RJ.YCAM - 0.01, -0.11], t: 'Guarda impresa con tira LED', s: 'luz propia: el stand no cambia la imagen', when: 1.4, until: 3.2 },
    { at: [RJ.X + RJ.XM, D.BELT + 0.20, RJ.ZM], t: 'Mástil impreso 40 × 40', s: '3 tramos · varilla roscada M8 adentro', when: 2.2, until: 4.2 },
    { at: [RJ.X, D.BELT + 0.04, 0.26], t: 'Cilindro doble efecto Ø20 × 100', s: 'silla impresa · reed adelante y atrás', when: 3.0, until: 5.4 },
    { at: [RJ.X - 0.13, D.BELT - 0.075, 0.20], t: 'Válvula 5/2 monoestable 24 V', s: 'sin energía, el vástago regresa', when: 3.8, until: 6.0 },
    { at: [RJ.X - 0.095, D.BELT + 0.02, 0.19], t: 'Sensor E18-D80NK', s: 'I3 del LOGO!: detiene la banda', when: 4.6, until: 6.8 },
    { at: [RJ.X, trayY(-0.30) + 0.02, -0.30], t: 'Charola de scrap', s: 'lado izquierdo viendo venir las piezas', when: 5.2 },
    { at: [RJ.X + 0.12, D.BELT + 0.01, -0.13], t: 'Hueco en la guía + rampa', s: 'la quilla no choca con el labio', when: 5.8 },
    { at: [RJ.X + RJ.XM, D.BELT + RJ.YCAM + 0.12, RJ.ZM], t: 'Torreta', s: 'verde = PASS · roja = FAIL', when: 7.6 }],
  dims: [{ a: [RJ.X - 0.13, D.BELT, 0.115], b: [RJ.X - 0.13, D.BELT, 0.015], off: [0, 0.06, 0], text: 'carrera 100 mm', when: 3.3 },
    { a: [RJ.X + 0.135, D.BELT, 0.0], b: [RJ.X + 0.135, D.BELT + RJ.YCAM, 0.0], off: [0.03, 0, 0], text: '45 cm sobre la cinta', when: 1.0 }],
  txt: { que: 'A media banda (a 1.55 m de la tapa) la cinta se detiene con el fixture bajo la cámara. Si la Raspberry Pi lo rechaza, el cilindro lo empuja de lado: cruza el labio por el hueco de la guía y cae a la charola, a la izquierda viendo venir las piezas.',
    porque: 'Inspeccionar y rechazar en el mismo punto evita rastrear la pieza entre 2 estaciones. Todo lo nuevo es impreso salvo la cámara, el cilindro, la válvula y la varilla M8.',
    herr: 'Taladro con broca de 6.5 mm (barrenos al canal C), llave Allen de 5, llave de 22 para la tuerca de la nariz.',
    check: 'Con aire a 4–6 bar y la válvula a mano, la placa sale y regresa sin rozar la cinta ni los labios.',
    error: 'Poner la placa más baja de 22 mm: pega con la ceja de la Siemens y las orejas de la MaxxECU.' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Inspección: pieza aceptada (PASS)', dur: 11,
  cam: RJCAM,
  mech: (t, m) => {
    m.station = 'belt'; m.rej = 0;
    const tb = t < 3 ? t : t < 6.5 ? 3 : t - 3.5;                                   // la cinta se detiene de 3 a 6.5 s
    m.beltS = 50 + tb; rjFix(m, RJ.X + 0.6 - BND.V * tb);
    m.vis = segE(t, 3.1, 3.4) * (1 - segE(t, 5.9, 6.2)); m.lamp = t > 4.6 && t < 8.0 ? 1 : 0;
  },
  labels: [{ at: [RJ.X - 0.095, D.BELT + 0.05, 0.19], t: 'El E18-D80NK lo ve', s: 'el LOGO! detiene la cinta', when: 2.7, until: 4.4 },
    { p: 'fx0', o: [0.0, 0.16, 0], t: 'Una imagen cada 0.5 s', s: '5 juicios iguales seguidos', when: 3.4, until: 4.6 },
    { p: 'fx0', o: [0.0, 0.16, 0], t: 'PASS: clase conocida', s: 'pieza_aceptada · torreta verde', when: 4.6, until: 6.6 },
    { p: 'fx0', o: [0.0, 0.10, 0], t: 'Pulso de 0.5 s a la I4', s: 'la cinta arranca y lo lleva al carrito', when: 6.0 }],
  txt: { que: 'El sensor E18-D80NK ve el fixture y el LOGO! detiene la cinta. La Pi analiza una imagen cada 0.5 s y necesita 5 juicios iguales. Si la clase está en su catálogo (computadora1/2), registra pieza_aceptada, prende la torreta verde y manda un pulso de 0.5 s a la I4 del LOGO!, que arranca la cinta.',
    porque: 'PASS significa "es una pieza válida del catálogo", no "sin defecto": así lo programó Mario y así se explica en el stand.',
    herr: 'Programa celda_agent.py (Mario) y LOGO! (Uriel).',
    check: 'Con la cinta parada, el fixture queda bajo el centro de la cámara (±1 cm). Si se pasa, recorran el sensor hacia atrás lo que avance (10 pruebas).',
    error: 'Luz del stand directa sobre la ECU: cambia la imagen contra el dataset. La guarda y su tira LED la tapan; graben el dataset con la guarda puesta.' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Inspección: pieza rechazada → scrap', dur: 12,
  cam: RJCAM,
  mech: (t, m) => {
    m.station = 'belt';
    const tb = t < 3 ? t : t < 9.5 ? 3 : t - 6.5;                                   // parada de 3 a 9.5 s (pulso a los 9 s)
    m.beltS = 80 + tb;
    m.vis = segE(t, 3.1, 3.4) * (1 - segE(t, 5.9, 6.2)); m.lamp = t > 4.6 && t < 9.5 ? 2 : 0;
    m.rej = t < 7.0 ? seg(t, 6.0, 6.25) : 1 - segE(t, 7.0, 7.6);                    // sale en ~0.25 s, 1 s afuera, regresa
    m.fx = Array(6).fill(null);
    if (t < 6.25) { const f = RJ.Z0 - m.rej * RJ.ST; m.fx[0] = { x: RJ.X + 0.6 - BND.V * Math.min(t, 3), y: D.BELT, z: Math.min(0, f - 0.092), rz: 0 }; return; }
    const [z, y, rx] = KF(t, [[6.25, -0.077, D.BELT, 0], [6.38, -0.120, D.BELT + 0.009, 0], [6.52, -0.200, D.BELT + 0.006, -0.18],
      [6.75, -0.262, trayY(-0.262), -RJ.SLOPE], [7.4, RJ.TRAY1 + 0.098, trayY(RJ.TRAY1 + 0.098), -RJ.SLOPE]]);
    m.fx[0] = { x: RJ.X, y, z, rz: 0, rx };
  },
  labels: [{ p: 'fx0', o: [0.0, 0.16, 0], t: 'Una imagen cada 0.5 s', s: '5 juicios iguales seguidos', when: 3.4, until: 4.6 },
    { p: 'fx0', o: [0.0, 0.16, 0], t: 'FAIL: no es una pieza válida', s: 'espera 3 s · torreta roja', when: 4.6, until: 6.0 },
    { at: [RJ.X, D.BELT + 0.07, 0.24], t: 'GPIO 8 → relevador → válvula', s: 'sale en ~0.25 s y empuja los 2 postes', when: 6.0, until: 7.0 },
    { p: 'fx0', o: [0.0, 0.10, 0], t: 'Sale despedido a la charola', s: 'scrap_expulsado', when: 6.6, until: 9.0 },
    { at: [RJ.X, D.BELT + 0.07, 0.24], t: 'Regresa: el reed de atrás confirma', s: 'si no llega: fallo_actuacion y la banda no arranca', when: 7.4, until: 9.0 },
    { at: [RJ.X + 0.3, D.BELT + 0.10, 0.0], t: 'Pulso de 0.5 s a la I4', s: 'la cinta sigue con el siguiente', when: 9.0 }],
  dims: [{ a: [RJ.X - 0.13, D.BELT + 0.05, 0.115], b: [RJ.X - 0.13, D.BELT + 0.05, 0.015], off: [0, 0.03, 0], text: '100 mm', when: 6.1, until: 7.6 }],
  txt: { que: 'Si la clase no está en el catálogo, la Pi espera 3 s, prende la torreta roja y por el GPIO 8 activa la válvula 1 s. El cilindro sale en ~0.25 s; con 100 mm de carrera la placa deja el fixture a medio salir, pero va tan rápido que el fixture sigue de largo, sube la rampa sobre el labio y cae al hule espuma de la charola. La válvula se suelta, el vástago regresa, se esperan 2 s y la Pi manda el pulso de 0.5 s a la I4.',
    porque: 'Con 100 mm el empujón no basta para sacarlo quieto: lo saca la inercia (así lo probó el equipo). Por eso del lado izquierdo no puede haber nada en ~30 cm: solo la rampa y la charola.',
    herr: 'Reguladores de flujo en los escapes de la válvula para ajustar la velocidad.',
    check: 'En 10 disparos el fixture cae siempre dentro de la charola. Si se queda en la rampa, abran el regulador de salida o suban la presión; si sale volando, ciérrenlo.',
    error: 'Que el paro de emergencia no corte los 24 V de la válvula: el cilindro podría dispararse con la banda en paro.' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Guía final: centra la quilla antes del carrito', dur: 10,
  cam: { t: [BELT_XA + 0.20, D.BELT + 0.03, 0.0], d: [0.35, 1.0, 0.45], r: 0.24 },
  mech: (t, m) => {
    m.station = 'belt'; m.fx = Array(6).fill(null); m.beltS = 300 + 0.5 * t;                   // cámara lenta × 0.5
    const x = Math.max(BELT_XA + 0.03, BELT_XA + 0.62 - BND.V * 0.5 * t), z0 = 0.010;                                      // llega corrido 10 mm hacia la derecha
    let lim = 1;                                                                                  // lo que la guía deja moverse a la quilla (165 de largo)
    for (let k = 0; k <= 16; k++) { const xq = x - 0.0825 + 0.165 * k / 16; if (xq >= GF.X0 && xq <= GF.X1) lim = Math.min(lim, gfZ(xq) - 0.0825); }
    m.fx[0] = { x, y: D.BELT, z: Math.min(z0, lim), rz: 0 };
  },
  focus: ['st_gfin'],
  labels: [{ p: 'fx0', o: [0.0, 0.09, 0.0], t: 'Llega corrido 10 mm', s: 'cámara lenta × 0.5', when: 0.4, until: 3.2 },
    { at: [GF.X1 - 0.03, D.BELT + 0.01, GF.ZE + 0.02], t: 'Entrada en V', s: 'abre a ±94.5 mm: toma ±12 mm', when: 1.0, until: 6.0 },
    { at: [GF.X0 + 0.05, D.BELT + 0.01, -GF.ZT - 0.03], t: 'Garganta: 1 mm por lado', s: 'solo toca la quilla, nunca la ECU', when: 3.5 },
    { at: [GF.ARM[0], D.BELT + 0.02, 0.13], t: 'Autorroscante #8 × 1/2"', s: '2 por pieza, al riel', when: 5.0 }],
  dims: [{ a: [GF.X0, D.BELT + 0.006, 0.13], b: [GF.X1, D.BELT + 0.006, 0.13], off: [0, 0.01, 0], text: '24 cm', when: 1.5 }],
  txt: { que: 'En los últimos 24 cm antes del rodillo van 2 guías impresas atornilladas al riel. Su entrada en V toma la quilla aunque venga corrida hasta 12 mm, y la garganta la deja a 1 mm por lado justo antes de que el fixture pase al carrito.',
    porque: 'Entre lo más ancho de las ECU (223 mm) y las columnas delanteras (232) quedan 4.5 mm por lado, lo mismo que suma el error de la banda (±3) y del acople (±1.5). Con la garganta, la banda aporta ~±1 mm: quedan ~2 mm de margen por lado. Una placa al frente del carrito no sirve para esto: no puede tocar la ECU y estorbaría la descarga.',
    herr: 'Taladro con broca de 1/8", desarmador de cruz.',
    check: 'Un fixture puesto a mano corrido 1 cm entra a la garganta sin trabarse y sale centrado (±1 mm).',
    error: 'Apretar la garganta a menos de 1 mm por lado: la quilla se frena y la cinta patina bajo ella.' } });
const XFAR = BELT_XF - 0.05 - D.FL / 2;                                     // donde se pone cada fixture (punta lejana)
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Carga con la cinta corriendo', dur: 17,
  cam: { t: [0.24, 0.84, 0.0], d: [0.3, 0.42, 1], r: 0.42 },
  mech: (t, m) => { m.station = 'belt'; m.fx = Array(6).fill(null); loadCycle(m, t, 0, 0, BELT_XA + 0.60); },
  focus: ['pin', 'plat', 'sled'],
  labels: [{ p: 'fx0', o: [0.06, 0.09, 0], t: 'Pasa la cresta y se inclina 1.6°', s: 'el frente baja 3 mm a la pila; la cinta lo sigue empujando', when: 2.8, until: 3.65 },
    { p: 'fx0', o: [0.06, 0.09, 0], t: 'Cae completo: ~6 cm afuera', s: 'la cinta sigue corriendo', when: 3.65, until: 4.9 },
    { p: 'pin', o: [0.0, 0.04, 0.0], t: 'La uña baja detrás del travesaño', s: 'y el empujador jala ~7.6 cm a 25 mm/s', when: 5.0, until: 9.6 },
    { p: 'plat', o: [-0.04, -0.03, -0.1], t: 'Baja un nivel: 7.0 cm', s: '10 mm/s · 7 s', when: 10.0 }],
  dims: [{ a: [D.PANX + 0.003, D.BELT + 0.075, 0.095], b: [BELT_XA, D.BELT + 0.075, 0.095], off: [0, 0.02, 0], text: '~6 cm afuera', when: 3.8, until: 5.2 },
    { a: [D.XC - D.FL / 2, D.BELT + 0.075, -0.095], b: [LD.RLAND, D.BELT + 0.075, -0.095], off: [0, 0.02, 0], text: 'jala ~7.6 cm', when: 5.4, until: 9.0 }],
  txt: { que: 'El fixture viaja con la cinta. Cuando su centro pasa la cresta del rodillo, el frente baja los 3 mm a la pila y queda apoyado en la cresta y en su esquina. La cinta lo sigue empujando hasta que la cola deja la cresta y cae plano, ~6 cm afuera de la ventana. La uña baja, el empujador lo jala ~7.6 cm, afloja, sube la uña, regresa a home y la plataforma baja un nivel. Todo eso con la cinta corriendo.',
    porque: 'Apoyado en la cresta y en su esquina, sobre la cinta queda siempre ≥ 50 % del peso: si la cinta agarra más que el PETG sobre PETG, lo saca completo. Si se atora antes, la uña lo alcanza igual (llega hasta la cresta).',
    herr: '—',
    check: 'Prueben con un fixture real: si sale completo, cae a ~6 cm de la ventana; si se queda antes, anoten dónde. El VL53L0X confirma y la cámara reconoce la ECU (YOLO).',
    error: 'Pila más de 3 mm abajo de la cinta: el frente cae más y puede atorarse con el chaflán contra el borde.' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Cargar hasta 6: uno a la vez', dur: 24,
  cam: { t: [1.6, 0.72, 0.0], d: [0.22, 0.42, 1], r: 1.75 },
  mech: (t, m) => {
    m.station = 'belt'; m.fx = Array(6).fill(null);
    const tr = t * 4, per = LD.TC, tl = tLand(XFAR);
    const j = Math.min(5, Math.max(1, 1 + Math.floor((tr - (tl - LD.PREP)) / per)));   // ciclo activo (fixture j sobre una pila de j)
    loadCycle(m, tr - (j - 1) * per, j, j, XFAR);
    pileSet(m, [...Array(j).keys()], m.plat);
    for (let k = j + 1; k <= 5; k++) { const tk = tr - (k - 1) * per; if (tk >= 0) { const f = fxOnBelt(tk, XFAR); m.fx[k] = { x: f.x, y: f.y, z: 0, rz: f.rz }; } }
  },
  tsc: 4,
  labels: [{ at: [XFAR, D.BELT + 0.12, 0.0], t: 'Se pone el siguiente', s: 'cuando el anterior ya cayó a la pila', when: 3.0, until: 9.0 },
    { at: [1.6, 1.05, 0.0], t: 'Tiempo × 4', s: `un fixture cada ~${Math.round(LD.TC)} s`, when: 0.5 },
    { p: 'plat', o: [0.0, -0.03, -0.13], t: 'Pila llena: plataforma a 39.85 cm', s: '6 × 7.0 cm', when: 22.4 }],
  dims: [{ a: [LD.XLAND, D.BELT + 0.1, 0.0], b: [XFAR, D.BELT + 0.1, 0.0], off: [0, 0.03, 0], text: `≥ ${(BND.V * LD.TC).toFixed(1)} m entre fixtures (${Math.round(LD.TC)} s × ${BND.V.toFixed(2)} m/s)`, when: 1.0 }],
  txt: { que: `El ciclo se repite con la cinta corriendo: cada fixture cae a la misma altura y la pila baja 7.0 cm. El siguiente se pone en la punta lejana cuando el anterior ya cayó: un ciclo completo tarda ~${Math.round(LD.TC)} s y a ${BND.V.toFixed(2)} m/s eso son ~${(BND.V * LD.TC).toFixed(1)} m de cinta. Va uno a la vez: el PLC lo suelta (y lo detiene en la inspección) cuando el carrito avisa "listo".`,
    porque: 'Si el siguiente llega mientras la plataforma baja, no hay pila a 3 mm de la cinta: se cae dentro de la torre y se atora. Como la cinta no se detiene durante la carga, se evita con la regla de un fixture a la vez y el "listo" del carrito.',
    herr: '—',
    check: 'Quien pone los fixtures espera el aviso de "listo" del carrito (en la interfaz) antes de poner el siguiente.',
    error: 'Poner 2 o 3 seguidos "para ganar tiempo": el segundo llega con la plataforma bajando.' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Viaje a la estación de descarga', dur: 11,
  cam: { t: [-0.35, 0.45, 0.0], d: [0.45, 0.55, 1.15], r: 1.15 },
  mech: (t, m) => {
    m.fx = Array(6).fill(null); m.plat = D.LEVEL(6); pileSet(m, [0, 1, 2, 3, 4, 5], m.plat); m.cones = true;
    if (t < 4.5) { m.station = 'belt'; m.cart.x = lerp(0, -1.4, segE(t, 0.4, 4.4)); }
    else { m.station = 'ramp'; m.cart.x = lerp(-1.4, 0, segE(t, 5.0, 10.0)); }
  },
  labels: [{ at: [-0.6, 0.95, 0.2], t: '0.35 m/s máx · 0.4 m/s²', s: 'waypoints + odometría', when: 1.2, until: 5.0 }, { at: [-0.9, 0.25, 0.3], t: 'Detección reactiva de obstáculos', s: '3 VL53L0X: frena a < 40 cm', when: 2.0, until: 5.0 },
    { at: [0.5, 0.95, 0.2], t: 'Estación de descarga', s: 'mesa inclinada · borde a 83 cm', when: 6.0 }],
  txt: { que: 'El carrito sale de la banda y navega por waypoints. El ESP32 cuenta las vueltas de los M0601 a 50 Hz para la odometría y frena solo si un VL53L0X ve algo a menos de 40 cm. En la banda, las guías en V y los topes lo centran otra vez.',
    porque: 'Con 6 fixtures el pico de par sigue dentro del límite de los motores.',
    herr: '—',
    check: 'Llega a la banda con menos de ±5 cm de error de lado: es lo que toman las guías en V.',
    error: 'Desconectar el USB del Jetson y que siga andando: el watchdog debe detener las ruedas en menos de 1 s.' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Descarga: home y subir al nivel de la ventana', dur: 9,
  cam: { t: [0.18, 0.72, 0.0], d: [0.75, 0.4, 1], r: 0.42 },
  mech: (t, m) => {
    m.station = 'ramp'; m.fx = Array(6).fill(null);
    m.plat = t < 3 ? lerp(D.LEVEL(6), D.LSLO, segE(t, 0.5, 2.5)) : lerp(D.LSLO, D.UNLV(6), segE(t, 3.2, 7.5));
    pileSet(m, [0, 1, 2, 3, 4, 5], m.plat);
  },
  labels: [{ p: 'lsw_R', o: [0.03, 0.0, 0.03], t: 'Home al llegar', s: '1.7 cm hasta el final de carrera (~2 s)', when: 1.6, until: 6.0 },
    { p: 'fx5', o: [0.02, 0.08, 0], t: 'El de arriba queda en la ventana', s: 'base 2 mm sobre la banda', when: 7.6 }],
  dims: [{ a: [D.PANX + 0.01, D.WIN0, -0.12], b: [D.PANX + 0.01, D.UNL0, -0.12], off: [0.03, 0, 0], text: '1.4 cm', when: 7.8 }],
  txt: { que: 'Al llegar, el elevador hace home (así se corrige si la plataforma se escurrió al rodar). Luego sube, por pasos contados, hasta que el fixture de arriba quede en la ventana: su base 2 mm sobre la banda y 1.4 cm sobre el borde.',
    porque: 'El borde de la ventana queda a la altura del fixture de abajo: ese topa con la pared frontal y no se arrastra.',
    herr: '—',
    check: 'El VL53L0X confirma que el fixture está en la ventana.',
    error: 'Plataforma a mala altura o placa muy baja: se arrastra el de abajo.' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'El empujador saca el de arriba', dur: 9,
  cam: { t: [0.62, 0.72, 0.0], d: [0.5, 0.55, 1], r: 0.78 },
  mech: (t, m) => { m.station = 'ramp'; m.fx = Array(6).fill(null); pileSet(m, [0, 1, 2, 3, 4], D.UNLV(6)); unloadCycle(m, t, 6, 5, 0, 1.4); },
  focus: ['sled', 'fx5'],
  labels: [{ p: 'sled', o: [0.13, 0.0, 0.08], t: 'Empujador: 25 cm a 80 mm/s', when: 1.0, until: 5.2 }, { p: 'fx5', o: [0, 0.09, 0], t: 'Se desliza por la mesa inclinada', s: '1.4 m · ~15° · tope acolchado', when: 5.4 }],
  txt: { que: 'El empujador avanza 25 cm y regresa a home. El fixture sale por la ventana a la orilla de la mesa (~2 mm abajo de su base) y se desliza solo hasta el tope o hasta el fixture anterior.',
    porque: 'Al deslizarse deja libre la entrada para el siguiente; en una mesa plana el empujador tendría que arrastrar toda la fila y no le alcanza la fuerza.',
    herr: '—',
    check: 'El VL53L0X confirma que la ventana quedó vacía; n = n − 1.',
    error: 'Mesa con poca inclinación: el fixture se queda frente a la ventana y el siguiente choca con él. Suban la cuña (melamina ~12–15°, MDF crudo ~20°).' } });
S({ ...OP, ch: 'op', et: 'Funcionamiento', title: 'Repetir hasta vaciar la torre', dur: 16,
  cam: { t: [0.75, 0.62, 0.0], d: [0.45, 0.6, 1], r: 0.95 },
  mech: (t, m) => {
    m.station = 'ramp'; m.fx = Array(6).fill(null);
    const per = 3.0, k = per / 6.4, lift = 0.7;
    const j = Math.min(5, 1 + Math.floor(t / (per + lift)));       // 1..5 → fixture 5 − j
    const tl = t - (j - 1) * (per + lift);
    const done = t >= 5 * (per + lift);
    const nLeft = done ? 0 : 6 - j;                                   // en la pila antes de este ciclo
    rampSet(m, [5, 4, 3, 2, 1, 0].slice(0, done ? 6 : j));
    if (!done) {
      if (tl < lift) { m.plat = lerp(D.UNLV(nLeft + 1), D.UNLV(nLeft), segE(tl, 0, lift)); pileSet(m, [...Array(nLeft).keys()], m.plat); m.push = D.P0; }
      else { pileSet(m, [...Array(nLeft - 1).keys()], D.UNLV(nLeft)); unloadCycle(m, tl - lift, nLeft, nLeft - 1, j, k); }
    } else { m.plat = D.UNLV(1); m.push = D.P0; }
  },
  labels: [{ at: [0.9, 0.95, 0.15], t: 'Los 6 caben en la mesa', s: 'sin encimarse', when: 15.0 }, { p: 'plat', o: [0, 0.03, -0.12], t: 'Torre vacía: n = 0', when: 15.4 }],
  txt: { que: 'La plataforma sube otro nivel y el empujador saca el siguiente, hasta que la torre queda vacía. Después, el carrito regresa a la banda.',
    porque: 'Cada fixture se identificó al entrar (YOLO reconoce su ECU), así que el orden inverso no importa para el inventario.',
    herr: '—',
    check: 'Caben los 6 fixtures en la mesa sin encimarse y la entrada queda libre después de cada uno.',
    error: 'Orilla de la mesa más alta que la base del fixture: el empujador lo empuja contra un escalón. Debe quedar ~2 mm abajo, nunca arriba.' } });

// rev. 3.20: tornillo por tornillo también aquí: después del paso donde ya están todas las piezas de un grupo, un paso con sus tornillos
if (DET) {
  const ids = e => typeof e === 'string' ? [e] : Array.isArray(e) ? e : e.ids;
  const firstAdd = id => STEPS.findIndex(st => st.add.some(e => ids(e).includes(id)));
  const DIRS = { pl: [0.9, 0.5, 0.8], susp: [0.35, 0.25, 1], elev: [0.9, 0.35, 0.8], plat: [0.9, 0.6, 0.6], emp: [0.35, 0.55, 1], sens: [-0.8, 0.5, 0.7] };
  const CTXF = PF.map(f => f.id), ins = [];
  FAST.forEach((g, n) => {
    const own = (Array.isArray(g.owner) ? g.owner : [g.owner]).filter(id => PARTS.has(id));
    const k = Math.max(-1, ...own.map(firstAdd));
    if (k >= 0) ins.push({ k, n, g, own });
  });
  ins.sort((a, b) => b.k - a.k || b.n - a.n);           // de atrás hacia adelante, para no mover los índices
  for (const { k, g, own } of ins) {
    const base = STEPS[k];
    STEPS.splice(k + 1, 0, { ch: base.ch, chKey: base.chKey, et: base.et, title: 'Tornillos: ' + g.title, dur: 7, add: [g.id], labels: [{ at: g.items[0].at, t: screwKinds(g.items), s: g.title, when: 1.3 }],
      dims: [], dimOld: true, addStart: 0.3, stagger: 0.45, addDur: 1.0, focus: [], cam: camFit([g.id], null, DIRS[g.ch], 0.09, 0.85),
      iso: { hi: [g.id], keep: own, soft: CTXF },
      txt: { que: g.txt.que, porque: g.txt.porque || 'Cada tornillo entra al centro de su barreno; las tuercas T, al centro de la ranura.', herr: g.txt.herr, check: g.txt.check, error: g.txt.error } });
  }
}
return { STEPS, CHAPTERS };
}

// ============================================================ MODO: SOLO LA PLACA (armado súper detallado, un solo apartado)
// Reusa los mismos pasos de los capítulos "Placa", "Cable por cable" y "Potencia" del modo súper
// explicativo (misma redacción, cámaras y checks), pero los junta en un único apartado, sin el resto
// del armado del carrito (ni inventario, ni estructura, ni "al carrito").
// rev. 3.19: modo «Tornillo por tornillo»: un paso por grupo de tornillos, con la pieza que sujetan resaltada
function screwKinds(items) {
  const k = new Map();
  for (const f of items) {
    const m = f.m === 'M25' ? 'M2.5' : f.m, L = f.L > 100 ? `varilla ${Math.round(f.L / 10)} cm` : `${m} × ${f.L}`;
    const h = f.head === 'flat' ? ' cabeza plana' : f.head === 'set' && f.L <= 100 ? ' (prisionero)' : f.head === 'pan' ? (f.m === 'M25' || f.m === 'M2' ? ' autorroscante' : '') : '';
    const n = !f.nut ? '' : f.nut[0] === 'tnut' ? ' + tuerca T' : f.nut[0] === 'sep' ? ' + separador' : ' + tuerca';
    const key = (f.L > 100 ? L : L + h) + n; k.set(key, (k.get(key) || 0) + 1);
  }
  return [...k].map(([t, c]) => `${c} × ${t}`).join(' · ');
}
function defineScrews() {
  const camFit = (ids, off, d, minR = 0.035, k = 0.62) => { const B = new THREE.Box3(); for (const id of ids) { const p = PARTS.get(id); if (p) B.union(p.localBox.clone().translate(p.home)); }
    const c = B.getCenter(V3()), sz = B.getSize(V3()); return { t: c.toArray(), d, r: Math.max(minR, sz.length() * k), fit: true }; };
  const CHAPTERS = [{ key: 'pl', n: 'T1', name: 'Placas y escuadras' }, { key: 'susp', n: 'T2', name: 'Suspensión' }, { key: 'elev', n: 'T3', name: 'Elevador' },
    { key: 'plat', n: 'T4', name: 'Plataforma y guías' }, { key: 'emp', n: 'T5', name: 'Empujador y uña' }, { key: 'sens', n: 'T6', name: 'Sensores y soportes' }];
  const STEPS = [], CTX = PF.map(f => f.id), ESC = ['esc_b', 'esc_c', 'esc_t', 'esc_tw'].filter(k => PARTS.has(k)), NUTS_ESC = [...PARTS.keys()].filter(k => /^nut_[bt]/.test(k));
  const push = o => STEPS.push(Object.assign({ dur: 7, add: [], labels: [], dims: [], dimOld: true, addStart: 0.3, stagger: 0.6, addDur: 1.0, focus: [] }, o));
  const DIR = { pl: [0.9, 0.5, 0.8], susp: [0.35, 0.25, 1], elev: [0.9, 0.35, 0.8], plat: [0.9, 0.6, 0.6], emp: [0.35, 0.55, 1], sens: [-0.8, 0.5, 0.7] };
  push({ ch: 0, et: 'Tornillo por tornillo', title: 'La estructura de perfil', dur: 5, cam: camFit(CTX, null, [1, 0.6, 0.9], 0.3, 0.55), add: [CTX, ESC], addStart: 0.1, stagger: 0.4, addDur: 0.8,
    txt: { que: 'En este modo cada paso pone un grupo de tornillos, resaltado sobre la pieza que sujeta. Las medidas de cada tornillo están en la etiqueta y en «Qué se hace».', porque: 'Los tornillos de cada pieza salen de los barrenos del CAD de las piezas impresas (rev. 3.19), ya con las alturas reales de la rev. 3.18.', herr: 'Llaves Allen de 1.5, 2, 2.5, 3, 4 y 5 mm, llaves de 5.5, 7, 8 y 13 mm.', check: 'Antes de apretar nada, presenten la pieza con todos sus tornillos puestos a mano.', error: 'Apretar el primer tornillo hasta el fondo: los demás ya no entran al centro del barreno.' } });
  push({ ch: 0, et: 'Placas y escuadras', title: 'Tornillos de las escuadras', dur: 6, cam: camFit([...CTX], null, [1, 0.6, 0.9], 0.3, 0.55), add: [NUTS_ESC], addStart: 0.2, stagger: 0.2,
    iso: { hi: NUTS_ESC, keep: ESC, soft: CTX },
    txt: { que: 'Cada pata de cada escuadra de aluminio lleva 1 tornillo con su tuerca T de martillo (el kit de 20 trae los suyos: M6 × 16 de cabeza en T + tuerca de brida).', porque: 'Las lengüetas de la escuadra entran en la ranura y el tornillo la cierra contra el perfil.', herr: 'Llave Allen de 5 mm.', check: 'Midan las diagonales de cada marco antes de apretar firme: iguales con ±2 mm.', error: 'Lengüetas fuera de la ranura: la escuadra queda chueca.' } });
  const seen = new Set([...CTX, ...ESC]);
  const ORD = FAST.slice().sort((a, b) => CHAPTERS.findIndex(c => c.key === a.ch) - CHAPTERS.findIndex(c => c.key === b.ch));
  for (const g of ORD) {
    const ch = CHAPTERS.findIndex(c => c.key === g.ch), own = (Array.isArray(g.owner) ? g.owner : [g.owner]).filter(id => PARTS.has(id));
    const nw = own.filter(id => !seen.has(id)); nw.forEach(id => seen.add(id));
    const kinds = screwKinds(g.items), f0 = g.items[0].at;
    push({ ch, et: CHAPTERS[ch].name, title: g.title, cam: camFit([g.id], null, DIR[g.ch], 0.09, 0.85),
      add: nw.length ? [nw, g.id] : [g.id], stagger: 1.0, iso: { hi: [g.id], keep: own, soft: CTX },
      labels: [{ at: f0, t: kinds, s: g.title, when: 1.3 + (nw.length ? 1 : 0) }],
      txt: { que: g.txt.que, porque: g.txt.porque || 'Cada tornillo entra al centro de su barreno; las tuercas T, al centro de la ranura.', herr: g.txt.herr, check: g.txt.check, error: g.txt.error } });
  }
  return { STEPS, CHAPTERS };
}
function defineElecBoard() {
  const { STEPS: ALL, CHAPTERS: CHD } = defineSteps(true);
  const KEEP = new Set(['placa', 'cables', 'pot']);
  const CHAPTERS = [{ key: 'placa', n: 'E11', name: 'Armado de la placa' }];
  const STEPS = ALL.filter(s => KEEP.has(CHD[s.ch].key));
  STEPS.forEach(s => { s.ch = 0; });
  return { STEPS, CHAPTERS };
}

// ============================================================ MODOS DE EXPLORACIÓN (sin animación: clic en las piezas)
const EXPLORE_EXTRA = ['mot_L', 'mot_R', 'nema_L', 'nema_R', 'pnema', 'servo', 'lsw_L', 'lsw_R', 'lswUp', 'pframe_r'];
const ELEC_SKIP = new Set(['tray', 'jet_plate', 'bat_cradle', 'bat_hold']);
function exploreIds(kind) {
  const all = [...PARTS.values()].filter(p => !p.world && !p.inv && p.fixIndex === undefined && p.id !== 'tool_level').map(p => p.id);
  if (kind === 'x') return all;
  return all.filter(id => { const p = PARTS.get(id); return (p.sub === 'elec' && !ELEC_SKIP.has(id)) || EXPLORE_EXTRA.includes(id); });
}
function defineExplore(kind) {
  const X = kind === 'x';
  const CHAPTERS = [{ key: X ? 'armado' : 'electro', n: X ? 'Todo' : '⚡', name: X ? 'Carrito armado' : 'Solo lo que lleva cables' }];
  const ids = exploreIds(kind);
  const st = { ch: 0, chKey: CHAPTERS[0].key, et: X ? 'Carrito armado' : 'Solo electrónica', title: X ? 'El carrito terminado' : 'Componentes con cables', dur: 1, explore: kind,
    add: [{ ids, pose: 'home', lag: 0 }], addStart: 0, addDur: 0.001, stagger: 0, labels: [], dims: [], dimOld: false,
    cam: X ? { t: [0, 0.55, 0], d: [0.9, 0.55, 1], r: 0.78 } : { t: [-0.02, 0.5, 0], d: [0.9, 0.5, 1], r: 0.72 },
    txt: { que: X ? 'El carrito completo, sin estaciones. Hagan clic en cualquier pieza (o en la lista de abajo) para ver qué es, cuántas hay, cómo se monta y qué cables tiene conectados. Arrastren para girar; "Explosionada" separa las piezas.'
        : 'Solo los componentes que llevan cables y los cables mismos, sin estructura. Clic en un componente para ver sus conexiones pin por pin y sus cables; clic en un cable para ver de dónde sale y a dónde llega.',
      porque: X ? 'Sirve para ubicar cada pieza en el carrito real y repasar su función antes de la demo.' : 'Sin el aluminio estorbando se ve el recorrido de cada cable de punta a punta.',
      herr: '—', check: 'Clic en un espacio vacío o en "Ver todo" para quitar la selección.', error: 'Las rutas de los cables son aproximadas: en el carrito real van amarradas al perfil con cinchos.' } };
  return { STEPS: [st], CHAPTERS };
}

// ============================================================ CATÁLOGO DE COMPONENTES (clic en una pieza)
// Cada componente: nombre, cantidad, función, cómo se monta o conecta, datos y sus instancias.
// Si la instancia tiene pines (PIN), la tabla de conexiones sale sola de la lista de cables (WIRES).
const COMP = {};
const PART_COMP = new Map();
function comp(key, o) { COMP[key] = { key, specs: [], ...o }; }
const I = (ids, name, o = {}) => ({ ids: Array.isArray(ids) ? ids : [ids], name, ...o });

// ---------- estructura
comp('postes', { name: 'Poste de perfil 3030 · 948 mm', qty: '4', fn: 'Las 4 esquinas del carrito: sostienen el marco de arriba y le dan la altura (tope a ~1.05 m).',
  mount: 'Parados en las esquinas, unidos a los marcos con escuadras de aluminio y tornillos Allen M6 × 16 con tuerca T. Se aprietan a medias, se escuadra y luego se aprietan firme.',
  herr: 'Llaves Allen, escuadra, nivel de burbuja.', check: 'Los 4 miden lo mismo (±1 mm) y quedan a plomo en sus 2 caras.', err: 'Postes de distinto largo: el carrito queda cojo y la torre se tuerce.',
  specs: ['Perfil 3030, ranura de 8 mm', 'Salen de la barra de 6 m'],
  inst: [I('post_FL', 'Delantero izquierdo'), I('post_FR', 'Delantero derecho'), I('post_BL', 'Trasero izquierdo'), I('post_BR', 'Trasero derecho')] });
comp('largueros', { name: 'Larguero · 440 mm', qty: '4', fn: 'Lados largos (500 mm por fuera) de los marcos de abajo y de arriba.',
  mount: 'Entre los postes, al ras de abajo (marco inferior) o de la punta (marco superior), con escuadras de aluminio.', herr: 'Llaves Allen.',
  check: 'Diagonales del marco iguales (±2 mm).', err: 'Medir desde la pieza anterior y no desde la punta: los errores se suman.', specs: ['Faltan: salen de las barras extra de la escuela'],
  inst: [I('larg_bL', 'Inferior izquierdo'), I('larg_bR', 'Inferior derecho'), I('larg_tL', 'Superior izquierdo'), I('larg_tR', 'Superior derecho')] });
comp('travesanos', { name: 'Travesaño de marco · 340 mm', qty: '4', fn: 'Frente y atrás de los marcos (400 mm por fuera).', mount: 'Entre los postes, con escuadras de aluminio.',
  herr: 'Llaves Allen.', check: 'Escuadras planas contra el perfil.', err: 'Apretar antes de escuadrar.',
  inst: [I('trav_bF', 'Inferior delantero'), I('trav_bB', 'Inferior trasero'), I('trav_tF', 'Superior delantero'), I('trav_tB', 'Superior trasero')] });
comp('trav_c', { name: 'Travesaño central · 340 mm', qty: '1', fn: 'De aquí cuelgan las placas pivotantes de los motores, y sobre él se paran las columnas traseras de la torre.',
  mount: 'A la mitad de los largueros de abajo (250 mm de cada punta), 1 escuadra por lado, por el costado de atrás.', herr: 'Llaves Allen, flexómetro.', check: 'A 250 mm de cada extremo.', err: 'Olvidar las tuercas T de la ranura de abajo: ahí van los soportes del pivote.',
  inst: [I('trav_c', 'Travesaño central')] });
comp('columnas', { name: 'Columna de la torre · 888 mm', qty: '4', fn: 'Jaula de la torre: a ellas se atornillan las guías de la pila, los soportes del elevador y el empujador.',
  mount: 'Entre el marco de abajo y el de arriba: 2 junto a los postes delanteros (a ±13.1 cm del centro: por ahí pasan las ECU) y 2 sobre el travesaño central. Escuadras de aluminio y placas de unión impresas.', herr: 'Llaves Allen, nivel, flexómetro.',
  check: 'A plomo; entre caras interiores: 23.2 cm las delanteras y 19.8 cm las traseras, en toda la altura.', err: 'Columnas fuera de plomo: el fixture roza y se atora a media pila.', specs: ['Propuesta rev. 3.4 (delanteras abiertas para las ECU)', '2 de la barra de 6 m, 2 de la de 2 m'],
  inst: [I('col_FL', 'Delantera izquierda'), I('col_FR', 'Delantera derecha'), I('col_BL', 'Trasera izquierda'), I('col_BR', 'Trasera derecha')] });
comp('trav_sc', { name: 'Travesaño superior central · 340 mm', qty: '1', fn: 'Sostiene arriba las columnas traseras.', mount: 'Entre los largueros superiores, a la mitad.', herr: 'Llaves Allen.', check: 'Firme y nivelado.', err: '—', inst: [I('trav_sc', 'Superior central')] });
comp('trav_emp', { name: 'Travesaño del empujador · 198 mm', qty: '1', fn: 'De aquí cuelgan las varillas del empujador y su NEMA 17.', mount: 'Entre las 2 columnas traseras, a ~95 cm.', herr: 'Llaves Allen.', check: 'Paralelo al piso.', err: '—', inst: [I('trav_emp', 'Travesaño del empujador')] });
comp('escuadras', { name: 'Escuadras de aluminio para 3030', qty: '24', fn: 'Unen los perfiles a 90°.', mount: 'Por dentro de cada unión, con tornillos M6 × 12 y tuercas T de martillo; las lengüetas de cada pata dentro de la ranura.',
  herr: 'Llaves Allen.', check: 'Asientan planas y el tornillo entra al centro de la ranura.', err: 'Las lengüetas fuera de la ranura: la escuadra queda chueca.', specs: ['dibujada con el STEP del equipo: 35 × 35 × 29 mm · la compra revisada era de 28 × 28 × 28'],
  inst: [I('esc_b', 'Marco inferior (10)'), I('esc_c', 'Travesaño central (2)'), I('esc_t', 'Marco superior (6)'), I('esc_tw', 'Torre (6)')] });
comp('placas', { name: 'Placas de unión impresas', qty: '12', fn: 'Unen columnas y travesaños de la torre donde las caras quedan al mismo plano (ahí una escuadra no tiene dónde ir).', mount: 'Planas sobre las caras al mismo plano, 2 tornillos M6 × 12 por perfil con tuerca T (la de arriba de las columnas traseras une 3 perfiles: 6 tornillos). Las del lado izquierdo son las mismas volteadas.', herr: 'Llaves Allen.', check: 'Los tornillos entran derecho a la tuerca: si hay que forzarlos, la tuerca no está bajo el barreno.', err: '—', inst: [I('placas', 'Placas de la torre')] });
comp('tuercas', { name: 'Tuerca T de martillo + Allen M6', qty: '100 juegos', fn: 'Sujetan todo al perfil: escuadras, soportes, bandeja, base del Jetson.',
  mount: 'Entran de frente en la ranura (aun con el marco armado); al apretar el tornillo giran 90° y se traban.', herr: 'Llave Allen de 5 mm.', check: 'La tuerca se traba y el tornillo no gira en falso.', err: 'Apretar sin que la tuerca haya girado: queda de lado y se sale.',
  specs: ['Para perfil 3030, ranura de 8 mm', 'Tornillos M6 × 16 (70) y M6 × 20 (30)'],
  inst: ['bL', 'bR', 'bF', 'bB', 'tL', 'tR', 'tF', 'tB'].map(k => I('nut_' + k, `Ranura ${k[0] === 'b' ? 'inferior' : 'superior'} ${({ L: 'izquierda', R: 'derecha', F: 'del frente', B: 'de atrás' })[k[1]]}`)) });

// ---------- tracción
comp('calzas_emp', { name: 'Calzas de los soportes delanteros del empujador', qty: '2', fn: 'Bajan 19.5 mm los soportes delanteros: el travesaño del empujador lo fija la placa impresa y quedó 19.5 mm alto respecto a la cinta.', mount: 'Entre el travesaño del empujador y cada soporte: la derecha con 2 tornillos M6 × 35 (z 58 y 70; rev. 3.25, en z 18 y 40 las cabezas pegaban con el NEMA) y la izquierda con 1 (z −30), cada uno con rondana bajo la cabeza y tuerca T de martillo en la ranura de abajo del travesaño.',
  herr: 'Llaves Allen.', check: 'Las varillas del empujador quedan a 86.55 cm del piso.', err: 'Olvidarlas: la placa de empuje queda 19.5 mm alta y la uña no alcanza el travesaño del fixture.', specs: ['PETG · 19.5 mm de alto · 30 mm de ancho (el del perfil)', 'Derecha 70 mm de largo (rev. 3.25, barrenos en z 58 y 70), izquierda 36 mm', 'Barrenos Ø6.6 con boss Ø14; ventanas pasantes', 'Se imprimen acostadas, sin soportes: 3 paredes, 25 % de relleno'],
  inst: [I('calza_empF', 'Calzas')] });
comp('rodajas', { name: 'Rodaja Unicame 4" con freno', qty: '4', fn: 'Las 4 esquinas ruedan libres; las 2 ruedas motrices empujan.', mount: 'Placa de la rodaja atornillada directo bajo la esquina del marco (rev. 3.18: sin placa adaptadora).',
  herr: 'Llaves Allen y de 13 mm.', check: 'Las 4 tocan el piso, giran 360° sin tocar nada y el freno traba.', err: 'Tornillos flojos: la rodaja se tuerce al girar.', specs: ['rueda de poliuretano 100 × 31 mm · doble balero · placa 93 × 64', 'altura de montaje 10.3 cm (medida) SUPUESTA (medirla) · radio de giro ~89 mm'],
  inst: [I('cast_FL', 'Delantera izquierda'), I('cast_FR', 'Delantera derecha'), I('cast_BL', 'Trasera izquierda'), I('cast_BR', 'Trasera derecha')] });
comp('susp', { name: 'Placa pivotante de la suspensión', qty: '2', fn: 'Deja que la rueda suba y baje con el piso; el resorte la empuja contra él.', mount: 'Pieza impresa: 2 baleros 608ZZ a presión en la maza con una rondana M8 entre ellos, perno M8 × 45 con la tuerca metida por abajo en el soporte, que va al travesaño central con 1 M6. El M0601 se atornilla a la placa en la mesa (3 × M2.5 × 12 de cabeza plana avellanada, al ras: una cabeza Allen roza el resorte) antes de montarla: después ya no se alcanza el tornillo de abajo.',
  herr: 'Llaves de 13 mm, prensa.', check: 'Gira suave, sin juego.', err: 'Meter los baleros a golpes chuecos.', inst: [I('susp_L', 'Izquierda'), I('susp_R', 'Derecha')] });
comp('suspsop', { name: 'Soporte del pivote con su calza de 13 mm', short: 'Soporte del pivote', qty: '2', fn: 'Sostiene el perno de pivote de la placa pivotante bajo el travesaño central.',
  mount: 'Bajo el travesaño central, a cada lado: M6 × 30 por el hueco de abajo del soporte (cabeza adentro), calza de 13 mm y tuerca T de martillo en la ranura de abajo del travesaño (Allen larga de 5 mm). La tuerca M8 del pivote entra por la ranura que abre abajo del soporte y se sostiene con un dedo o cinta hasta que la agarra el perno.', herr: 'Llave Allen de 5 mm.', check: 'Queda derecho y no gira con la mano.', err: 'La tuerca T sin girar en la ranura: el soporte queda flojo.', specs: ['PETG impreso (prints_rev311.py), 100 % de relleno'],
  inst: [I('susp_sop_L', 'Izquierdo'), I('susp_sop_R', 'Derecho')] });
comp('susppiv', { name: 'Perno de pivote M8 × 40', short: 'Perno de pivote', qty: '2', fn: 'Eje de la placa pivotante: la rueda sube y baja alrededor de él.', mount: 'Rondana, placa (por los 2 × 608ZZ), rondana, soporte y tuerca M8 con Loctite.', herr: 'Llaves de 13 mm.', check: 'La placa gira libre y sin juego.', err: 'Apretarlo de más: frena la placa.', specs: ['M8 × 40, 2 rondanas M8, tuerca M8'],
  inst: [I('susp_piv_L', 'Izquierdo'), I('susp_piv_R', 'Derecho')] });
comp('suspguia', { name: 'Calza del resorte y tornillo guía M8 × 90', short: 'Tornillo guía', qty: '2', fn: 'Centra el resorte en la vertical de la rueda; su tuerca da la precarga.', mount: 'Calza de 13 mm bajo el larguero; tornillo M8 × 90 desde abajo hasta una tuerca T M8 en la ranura del larguero; rondanas y tuerca de precarga abajo del resorte.', herr: 'Llave de 13 mm.', check: 'La placa sube y baja libre a lo largo del tornillo.', err: 'Apretar la precarga sin el resorte puesto.', specs: ['M8 × 90, tuerca T M8, rondanas M8 (2.5 mm), tuerca M8'],
  inst: [I('susp_guia_L', 'Izquierdo'), I('susp_guia_R', 'Derecho')] });
comp('resortes', { name: 'Resorte de compresión', qty: '2', fn: 'Da ~85 N de fuerza a cada rueda: no patina al arrancar y las rodajas no se levantan.', mount: 'En el tornillo guía M8, en la vertical del eje. Se precarga 28 mm (de 75 a 47 mm) con la base en el piso.',
  herr: 'Vernier, llaves de 13 mm.', check: 'Comprimido 28 mm.', err: 'Demasiada precarga: levanta las rodajas.', specs: ['Alambre 2 mm · Ø20 · k ≈ 3 N/mm'], inst: [I('spring_L', 'Izquierdo'), I('spring_R', 'Derecho')] });
comp('m0601', { name: 'Motor-rueda M0601', qty: '2', fn: 'Las 2 ruedas motrices: cada una trae su driver y encoder; se manejan por RS485 desde el ESP32.',
  mount: 'Atornillado a su placa pivotante (M2.5). Potencia: 18 V del elevador de voltaje (pin 1 +, pin 2 −). Señal: pin 1 GND, pin 2 A, pin 3 B del bus RS485 (J3).',
  herr: 'Desarmador, tornillos M2.5.', check: 'Responde a su ID por RS485 con la rueda en el aire.', err: 'Montar 2 del mismo lado.', specs: ['Rueda Ø102 mm · 10 kg por rueda'],
  inst: [I('mot_L', 'Izquierdo · FIT1042', { note: 'ID 1 en el bus RS485. Cable de potencia: cab_18_L; señal: cab_485_L.' }), I('mot_R', 'Derecho · FIT1038', { note: 'ID 2 en el bus RS485. Cable de potencia: cab_18_R; señal: cab_485_R.' })] });
comp('cuna', { name: 'Cuna impresa de la batería', qty: '1', fn: 'Asiento de la batería sobre el marco inferior; deja libres las muescas de las columnas traseras.', mount: 'Sobre los largueros y el travesaño central.', herr: '—', check: 'La batería no se mueve.', err: '—', inst: [I('bat_cradle', 'Cuna')] });
comp('bateria', { name: 'Batería BR-1224 (12 V, 24 Ah)', qty: '1', fn: 'Energía de todo el carrito (~8.3 kg, abajo y al centro).', mount: 'Al centro, bornes hacia la bandeja. Borne + → XT60 → fusibles; borne − → tierra común (IN− del elevador).',
  herr: 'Terminales de ojillo, cinta de aislar.', check: '~12.8 V en reposo.', err: 'Tocar los 2 bornes con algo metálico: un corto de 24 Ah derrite cables.', inst: [I('bat', 'Batería')] });
comp('correa', { name: 'Correa con hebilla (o cincho de trinquete)', qty: '1', fn: 'Sujeta la batería: 8.3 kg sueltos en un frenazo rompen algo.', mount: 'Alrededor de la batería y del travesaño central, pasando por la cuna; topes impresos a los lados. Bien tensa.',
  herr: '—', check: 'La batería no se mueve aunque sacudan la base.', err: 'Dejarla floja.', specs: ['Decidido 15-oct en lugar de varilla roscada'], inst: [I('bat_hold', 'Correa y topes')] });

// ---------- torre
comp('guias', { name: 'Guía en L impresa', qty: '4', fn: 'Guían la pila tocando los postes de las 4 esquinas del fixture: hueco de 22.0 × 16.9 cm (3.5 mm adelante y atrás, 2 mm por lado). Más adentro no pueden ir: ahí sobresalen las ECU.', mount: 'Traseras: pestaña a la cara frontal de las columnas traseras. Delanteras: pestaña hasta la cara interior de las columnas delanteras (tornillo avellanado). Ala lateral de 8 mm.',
  herr: 'Llaves Allen, flexómetro.', check: 'Un fixture sube y baja a mano sin rozar.', err: 'No probar el hueco antes de apretar.',
  inst: [I('guide_BL', 'Trasera izquierda', { note: 'Llega a ~90 cm.' }), I('guide_BR', 'Trasera derecha', { note: 'Llega a ~90 cm.' }), I('guide_FL', 'Delantera izquierda', { note: 'Termina en el borde de la ventana (80.95 cm).' }), I('guide_FR', 'Delantera derecha', { note: 'Termina en el borde de la ventana (80.95 cm).' })] });
comp('brk_lo', { name: 'Soporte inferior (NEMA + KFL08)', qty: '2', fn: 'Carga el NEMA, la chumacera de abajo, la varilla y el final de carrera, todo alineado.', mount: 'A la cara trasera de la columna delantera y al poste, con tuercas T.', herr: 'Llaves Allen, M6 × 20.', check: 'No se mueve.', err: '—', inst: [I('brk_lo_L', 'Izquierdo'), I('brk_lo_R', 'Derecho')] });
comp('brk_up', { name: 'Soporte superior (KFL08)', qty: '2', fn: 'Sostiene la chumacera de arriba y la punta de la varilla. Desde la rev. 3.17c trae la pestaña del final de carrera superior (los 2 lados; solo el derecho lo lleva).', mount: 'A la columna delantera y al poste, arriba.', herr: 'Llaves Allen.', check: 'El husillo no cabecea.', err: '—', inst: [I('brk_up_L', 'Izquierdo'), I('brk_up_R', 'Derecho')] });
comp('nema_elev', { name: 'NEMA 17 del elevador (17HS4401)', qty: '2', fn: 'Gira el husillo de su lado. Los 2 reciben los mismos pasos (STEP, DIR y ENABLE compartidos), cada uno con su propio A4988 a 1.0 A.',
  mount: 'En el soporte inferior, eje hacia arriba, 4 tornillos M3 × 8. Su cable va a la bornera de su driver.', herr: 'Allen, M3 × 8.', check: '3200 pasos = 1 vuelta.', err: 'Conectar o desconectar con el driver prendido.',
  inst: [I('nema_L', 'Izquierdo', { note: 'Cable → J7 → A4988 #1. Bobina A a 1A/1B, bobina B a 2A/2B.' }), I('nema_R', 'Derecho', { note: 'Cable → J8 → A4988 #2.' })] });
comp('cople', { name: 'Cople flexible 5 → 8 mm', qty: '2', fn: 'Une el eje del NEMA (5 mm) con el husillo (8 mm) y absorbe pequeñas desalineaciones.', mount: 'Prisionero sobre la cara plana del eje del motor.', herr: 'Allen chica.', check: 'No patina.', err: 'Prisionero en la parte redonda.', inst: [I('cople_L', 'Izquierdo'), I('cople_R', 'Derecho')] });
comp('kfl', { name: 'Chumacera KFL08', qty: '4', fn: 'Sostienen los husillos.', mount: '2 por husillo, atornilladas a los soportes.', herr: 'Allen, M4/M5 × 20.', check: 'El husillo gira suave.', err: '—',
  inst: [I('kflLo_L', 'Inferior izquierda', { note: 'Con sus prisioneros apretados: carga el peso de la pila (~22 N), no el motor.' }), I('kflLo_R', 'Inferior derecha', { note: 'Prisioneros apretados: carga el peso.' }), I('kflUp_L', 'Superior izquierda', { note: 'Solo guía.' }), I('kflUp_R', 'Superior derecha', { note: 'Solo guía.' })] });
comp('husillo', { name: 'Husillo TR8 · 60 cm', qty: '2', fn: 'Suben y bajan la plataforma. Si son de 1 entrada (2 mm por vuelta) se autobloquean: sin energía, la pila no se cae.',
  mount: 'Del cople, por las 2 KFL08; la tuerca de latón va en el brazo de la plataforma. Lubricante seco de PTFE.', herr: 'Allen, lubricante.', check: 'Al recibirlo: una vuelta de la tuerca = 2 mm.', err: 'Si avanza 8 mm (4 entradas): plan B — el paro no corta el elevador y el programa baja la plataforma con batería baja; o varilla roscada M8.',
  specs: ['UNIT · avance por medir'], inst: [I('screw_L', 'Izquierdo'), I('screw_R', 'Derecho')] });
comp('varilla', { name: 'Varilla lisa 8 mm × 60 cm', qty: '2', fn: 'Guían la plataforma para que no se ladee ni gire.', mount: 'En los soportes de abajo y arriba, con 2 SC8UU cada una.', herr: 'Trapo y aceite ligero.', check: 'Los SC8UU deslizan sin juego.', err: 'Varillas sucias o secas.', inst: [I('rod_L', 'Izquierda'), I('rod_R', 'Derecha')] });
comp('sc8uu', { name: 'Rodamiento lineal SC8UU', qty: '6', fn: 'Deslizan sobre las varillas de 8 mm.', mount: 'Atornillados con M4 × 12 a los brazos de la plataforma (4) y al carro del empujador (2).', herr: 'Allen.', check: 'Sin juego.', err: '—',
  inst: [I('sc_L', 'Plataforma izquierda (×2)'), I('sc_R', 'Plataforma derecha (×2)')] });
comp('tuerca_laton', { name: 'Tuerca T8 de latón', qty: '2', fn: 'Convierte el giro del husillo en subida/bajada de la plataforma.', mount: 'En cada brazo de la plataforma, 4 tornillos M3 × 16.', herr: 'Allen.', check: 'Sin juego.', err: '—', inst: [I('nutsc_L', 'Izquierda'), I('nutsc_R', 'Derecha')] });
comp('plataforma', { name: 'Plataforma impresa 21.3 × 16.5 cm', qty: '1', fn: 'Carga la pila de fixtures: de 39.85 cm (llena, al cargar) a 82.35 cm (último, al descargar).', mount: 'Sus 2 brazos llevan la tuerca de latón y los SC8UU.', herr: '—', check: 'Recorre toda la carrera a mano sin trabarse.', err: 'Husillos secos.', inst: [I('plat', 'Plataforma')] });
comp('fc', { name: 'Final de carrera DM1 con adaptador impreso (contacto NC)', qty: '4', fn: 'Dan el cero (home) del elevador de cada lado y del empujador; el cuarto es el tope de arriba del elevador.',
  mount: 'COM → GND y NC → su GPIO (INPUT_PULLUP), por la bornera J4. NO sin conectar. Si un cable se rompe, se lee como "presionado" y el motor se detiene. Rev. 3.41: DM1 subminiatura (12.8 × 6.5 × 5.8, barrenos Ø2 a 6.5 mm) en un adaptador impreso con ranuras de ±2.5 mm, atornillado a los barrenos de la pestaña.', herr: 'Desarmador chico, 2 M2.5 × 12 y 2 M2 × 10 autorroscantes por final.', check: 'Suelto lee 0, presionado lee 1, sin cable lee 1.', err: 'Usar el contacto NO.',
  inst: [I('lsw_L', 'Elevador izquierdo', { note: 'J4 FC1 → GPIO 18. Home a 38.35 cm: el brazo pisa la palanca 0.5 mm más allá del clic.' }), I('lsw_R', 'Elevador derecho', { note: 'J4 FC2 → GPIO 19.' }),
    I('lswlev_L', 'Palanca (izq.)', { note: 'Gira sobre su bisagra cuando el brazo la pisa.' }), I('lswlev_R', 'Palanca (der.)', { note: 'Gira sobre su bisagra cuando el brazo la pisa.' }),
    I('lswlev_P', 'Palanca (home del empujador)', { note: 'La sube la rampa del travesaño del carro.' }),
    I('lswUp', 'Tope superior (derecho)', { note: 'J13 FC4 → GPIO 35 con pull-up externo de 10 kΩ. De cabeza en la pestaña del soporte superior; abre a 83.15 cm.' }), I('lswlevUp', 'Palanca (tope)', { note: 'La pisa la cara de arriba del brazo de la plataforma.' })] });

// ---------- empujador
comp('prod', { name: 'Varilla 8 mm × 30 cm (empujador)', qty: '2', fn: 'Guían el carro del empujador.', mount: 'Horizontales, del soporte delantero (travesaño del empujador) al trasero.', herr: 'Allen.', check: 'Paralelas.', err: '—', inst: [I('prod_L', 'Izquierda'), I('prod_R', 'Derecha')] });
comp('pframe', { name: 'Soportes delanteros del empujador', qty: '1 juego', fn: 'Cuelgan del travesaño del empujador: sostienen las varillas y el NEMA.', mount: 'Con tuercas T al travesaño del empujador.', herr: 'Allen.', check: 'Firmes.', err: '—', inst: [I('pframe', 'Soportes delanteros')] });
comp('pframe_r', { name: 'Soporte trasero y final de home', qty: '1', fn: 'Sostiene atrás las varillas y lleva el final de carrera de home del empujador.', mount: 'Colgado del travesaño superior trasero. Su final de carrera: J4 FC3 → GPIO 23 (NC).', herr: 'Allen.', check: 'El carro toca el final en home.', err: '—', inst: [I('pframe_r', 'Soporte trasero')] });
comp('carro', { name: 'Carro, placa 15 × 3 cm y cremallera', qty: '1', fn: 'La placa empuja la barra trasera del fixture de arriba (0.6–3.6 cm sobre la banda); la cremallera de 30 cm lo mueve 25 cm.', mount: 'Carro sobre 2 SC8UU; los 2 tramos de cremallera unidos con M3.', herr: 'Allen, M3.', check: 'Recorre 25 cm a mano.', err: 'Placa muy baja: arrastra el de abajo.', inst: [I('sled', 'Carro')] });
comp('pinion', { name: 'Piñón m1.5 · 20 dientes', qty: '1', fn: 'Mueve la cremallera: 80 mm/s.', mount: 'En el eje del NEMA, prisionero M3 sobre la cara plana; engranado con un poquito de juego.', herr: 'Allen chica.', check: 'Engrana en los 30 cm.', err: 'Muy apretado: pierde pasos.', inst: [I('pinion', 'Piñón')] });
comp('nema_emp', { name: 'NEMA 17 del empujador', qty: '1', fn: 'Mueve el piñón del empujador.', mount: 'Colgado del travesaño del empujador. Su cable va a J9 → A4988 #3 (STEP GPIO 27, DIR GPIO 14).', herr: 'Allen, M3 × 8.', check: 'Mueve el carro 25 cm.', err: 'Conectarlo con el driver prendido.', inst: [I('pnema', 'NEMA del empujador')] });
comp('servo', { name: 'Microservo MG90S (180°)', qty: '1', fn: 'Sube y baja la uña que jala el fixture desde la banda.', mount: 'En el carro. Café → GND, rojo → 5 V del XL4005, naranja → GPIO 5 (por J11). Curva floja de ~30 cm en su cable.',
  herr: 'Desarmador fino.', check: 'Se mueve a 0°, 90° y 180° sin brazo.', err: 'Alimentarlo del ESP32: se reinicia.', inst: [I('servo', 'MG90S')] });
comp('horn', { name: 'Brazo del servo', qty: '1', fn: 'Une la flecha del servo con el dedo de la uña (2 tornillos M2).', mount: 'Se aprieta después de calibrar los ángulos en la Etapa 12.', herr: 'Desarmador.', check: '—', err: 'Girarlo a mano con fuerza.', inst: [I('horn', 'Brazo')] });
comp('pin', { name: 'Uña abatible (dedo impreso de 7 mm)', qty: '1', fn: 'Gira 90° en el plano de la placa: acostada libra el fixture; colgada cae detrás del travesaño trasero (zona libre de 16 mm entre el travesaño y la ECU) y lo jala ~10 cm.', mount: 'Atornillada al brazo del MG90S (2 × M2); al frente gira en un perno M3 × 12 que pasa por la oreja del soporte. Su cara trasera queda 9.5 mm adelante de la placa. El jalón va a lo largo del eje: no carga los engranes del servo.', herr: 'Desarmador fino, Allen de 2.5 mm.', check: 'Colgada, la punta queda a ~2 cm de la quilla; acostada, a 896 mm (arriba del travesaño del fixture).', err: 'Usar el brazo del servo como eje sin el perno: el jalón dobla la flecha del servo.', inst: [I('pin', 'Uña')] });
comp('fixture', { name: 'Fixture con ECU (quilla + 2 bastidores)', qty: '6', fn: 'Lo que el carrito transporta. Piso con quilla de 16.5 cm (lo único que toca la cinta: pasa entre las pestañas de la banda) y asiento para su ECU; 2 bastidores laterales removibles (2 postes + larguero arriba): el fixture que entra se desliza sobre los largueros del de abajo y el siguiente se apila en ellos. Travesaño trasero para el empujador y la uña. v4.1: ventana bajo la ECU, chaflanes para que no se atore y pernos Ø4 para los bastidores; sin QR (YOLO reconoce la ECU). v4.2: los barrenos de los bastidores llevan 3 costillas de apriete: quedan firmes sin pegamento y se quitan a mano.', mount: 'Entran por la ventana a 81.85 cm; la pila baja 7.0 cm por cada uno. Para poner la ECU se quitan los bastidores (entran a presión en 4 pernos gracias a las costillas de la v4.2; no se pegan).', herr: '—', check: 'Los 2 bastidores puestos antes de cargarlo.', err: 'Cargarlo sin bastidores: el siguiente se va de frente sobre la ECU.',
  inst: [0, 1, 2, 3, 4, 5].map(i => I('fx' + i, `Fixture ${i + 1}`)) });

// ---------- electrónica: placa
const pinsOf = part => Object.values(PIN).filter(p => p.part === part);
comp('bandeja', { name: 'Bandeja de electrónica', qty: '1', fn: 'Lleva la placa y los módulos de potencia; se arma en la mesa y se pasa entera al carrito.', mount: 'Detrás de la batería, sobre el travesaño trasero de abajo: 2 M6 × 20 verticales (bandeja + calza-escuadra) y 2 M6 × 12 horizontales en la cara del frente del travesaño (rev. 3.37). La placa perforada entra a presión en el porta-placa; el XL4005 va con M3 y separadores. Nada de la electrónica toca el aluminio.', herr: 'Llave Allen de 5 mm, separadores M3.', check: 'Sin continuidad entre la placa y el aluminio.', err: '—', inst: [I('tray', 'Bandeja')] });
comp('perf', { name: 'Placa perforada 9 × 15 cm', qty: '1', fn: 'Placa principal: aquí va todo lo del ESP32 y sus módulos.', mount: 'Con separadores M3 sobre la bandeja. Los cables van soldados pin a pin (lista de cables).', herr: 'Cautín, lupa.', check: 'Sin puentes de soldadura.', err: '—', specs: ['Acomodo propuesto: ver Supuestos'], inst: [I('perf', 'Placa', { title: 'Placa perforada 9 × 15 cm' })] });
comp('sockets', { name: 'Tiras header hembra (zócalos)', qty: '~120 pines', fn: 'Los módulos se enchufan en ellos: un driver quemado se cambia en segundos, sin desoldar.',
  mount: 'Suelden cada tira con el módulo puesto (así quedan alineadas) y luego quítenlo. ESP32: 2 × 19 · cada A4988: 2 × 8 · MAX485: 2 × 4 · convertidor: 2 × 6 · BNO055: 2 × 5.',
  herr: 'Cautín, tiras header hembra de 40 pines (se cortan con pinza).', check: 'Cada módulo entra derecho y sin forzar.', err: 'Soldarlas sin el módulo puesto: quedan chuecas y no entra.', inst: [I('sockets', 'Zócalos', { title: 'Zócalos (tiras header hembra)', tag: 'ESP32, drivers y módulos' })] });
comp('esp32', { name: 'ESP32 DevKitC (38 pines)', qty: '1', fn: 'El cerebro de bajo nivel: mueve los 3 motores a pasos, habla con los M0601 por RS485, lee sensores y finales, y obedece al Jetson por USB (watchdog de 1 s).',
  mount: 'En sus 2 tiras de 19 pines, con el USB hacia la orilla izquierda de la placa y **de cabeza** (componentes hacia la placa), con sus 2 tiras de pines vueltas a soldar del lado de los componentes para que bajen a las tiras hembra: el acomodo de barrenos de esta placa salió en espejo respecto al DevKitC real (6-nov). Prográmenlo antes de montarlo: de cabeza no se alcanzan los botones BOOT y EN. Se alimenta por su pin 5V desde el XL4005. 3V3 alimenta la lógica de los drivers, los sensores y la IMU.',
  herr: '—', check: 'Programa un "blink" con todo conectado: si no sube, revisen que nada jale GPIO 2 ni GPIO 12.', err: 'Alimentar el servo desde su pin 5V: se reinicia.', specs: ['GPIO 34–39: solo entrada', 'No usar GPIO 6–11 (memoria)', 'GPIO 2 y 12 libres: son de arranque', 'XSHUT: GPIO 32, 33 y 15', 'GPIO 34: lectura del paro (divisor)', 'GPIO 35: final superior (pull-up 10 kΩ externo)'], pinout: true,
  inst: [I('esp32', 'ESP32', { title: 'ESP32 DevKitC', tag: 'De cabeza · USB a la izquierda' })] });
comp('a4988', { name: 'Driver A4988', short: 'A4988', qty: '3', fn: 'Cada uno mueve un NEMA 17: recibe pulsos (STEP) y sentido (DIR) del ESP32 y le da 1.0 A a las bobinas.',
  mount: 'En su zócalo de 2 × 8, con disipador. VMOT a 12 V con su 100 µF, VDD a 3.3 V, MS1–MS3 a VDD (1/16), RESET y SLEEP puenteados. Vref 0.80 V (R100) o 0.54 V (R068).',
  herr: 'Multímetro, desarmador de plástico.', check: 'Vref ajustado; 3200 pasos = 1 vuelta.', err: 'Conectar o desconectar el motor con el driver prendido: se quema.',
  inst: DRV.map(d => I(d.id, `#${d.n} · ${d.who}`, { tag: `bornera ${d.mot} · ${d.n === 3 ? 'STEP 27 · DIR 14' : 'STEP 25 · DIR 26 (compartidos)'}`,
    note: d.n === 3 ? 'Mueve el empujador. Tiene su propio STEP (GPIO 27) y DIR (GPIO 14).' : `Elevador ${d.n === 1 ? 'izquierdo' : 'derecho'}. Comparte STEP (GPIO 25), DIR (GPIO 26) y ENABLE con el otro driver del elevador: los 2 motores dan los mismos pasos.` })) });
comp('capsrv', { name: 'Capacitor 100 µF del servo (J11)', short: 'Capacitor 100 µF del servo', qty: '1', fn: 'Rev. 3.17d: amortigua los picos de corriente del MG90S para que no bajen los 5 V del ESP32. Es uno de los 3 de 100 µF que sobraron.',
  mount: 'Al final, después del cable 101: parado arriba de J11 (hacia J2), con la pata − (franja) en línea con J11 GND y la + hacia la orilla. Por abajo, cada pata doblada hasta su pin de J11 (cables 102 y 103).', herr: 'Cautín, pinzas.', check: 'Sin el servo y con 5 V: 5.0 V en J11 y sin corto entre +5V y GND.', err: 'Invertirlo: se infla o revienta.', specs: ['100 µF, 25 V o más (los comprados son de 100 V)'],
  inst: [I('cap_srv', 'Junto a J11')] });
comp('capbus', { name: 'Capacitor 1000 µF / 35 V (salida de 18 V)', short: 'Capacitor 1000 µF', qty: '1', fn: 'Rev. 3.17d: el elevador de voltaje no puede regresar energía a la batería; si los M0601 regeneran al frenar, este capacitor la absorbe y el riel de 18 V no sube hacia los 24 V máximos.',
  mount: 'En la bornera de salida del elevador de voltaje, junto con los cables de los motores: pata larga a OUT+, franja a OUT−.', herr: 'Desarmador.', check: 'Prueba de banco: frenar desde 0.35 m/s con el multímetro en MAX sobre el riel: menos de 22 V.', err: 'Invertirlo o usar uno de 25 V: revienta.', specs: ['1000 µF, 35 V o más'],
  inst: [I('cap_bus', 'Salida del elevador de voltaje')] });
comp('voltm', { name: 'Voltímetro 3030N (7–55 V)', short: 'Voltímetro', qty: '1', fn: 'Muestra el voltaje de la batería a la vista. Ya estaba comprado; desde la rev. 3.17d sí se conecta (cable C24).',
  mount: 'Rojo a XL4005 IN+ (después del KCD1, para que no gaste batería con el carrito apagado) y negro a GND. Se dibuja en la bandeja; pueden ponerlo donde se vea.', herr: 'Desarmador.', check: 'Marca lo mismo que el multímetro en la batería (±0.2 V) y se apaga con el KCD1.', err: 'Conectarlo antes del KCD1: descarga la batería con el carrito apagado.', specs: ['7–55 V, 2 o 3 hilos (si trae 3, el amarillo de medición también a IN+)'],
  inst: [I('voltm', 'Voltímetro')] });
comp('cap100', { name: 'Capacitor electrolítico 100 µF', short: 'Capacitor 100 µF', qty: '3', fn: 'Uno por A4988, entre VMOT y GND: absorbe el pico de voltaje al arrancar el motor.',
  mount: 'Parado en la orilla de atrás, entre las borneras de los motores, lo más cerca posible de su driver. Pata larga (+) a VMOT; la franja (−) a GND.', herr: 'Cautín.', check: 'La franja hacia GND.', err: 'Invertirlo: se infla o revienta.', specs: ['25 V o más'],
  inst: DRV.map(d => I('cap' + d.n, `#${d.n} · junto al A4988 #${d.n}`)) });
comp('lvl', { name: 'Convertidor de nivel 3.3 ↔ 5 V (4 canales)', qty: '1', fn: 'Baja a 3.3 V la respuesta de los motores (RO del MAX485, 5 V) antes de que llegue al GPIO 16.',
  mount: '**De cabeza** (rev. 3.29): sus 2 tiras de 6 se sueldan del lado de los componentes y se monta con la fila LV en la tira de LV. HV a 5 V, LV a 3.3 V, GND a GND. Se usa solo el canal 1 (HV1 ← RO, LV1 → GPIO 16).', herr: '—', check: 'Con el multímetro, LV1 nunca pasa de 3.3 V.', err: 'Invertir HV y LV.', inst: [I('lvl', 'Convertidor', { title: 'Convertidor de nivel', tag: 'solo el canal 1 · RO → GPIO 16' })] });
comp('max485', { name: 'Módulo MAX485 (RS485)', qty: '1', fn: 'Traduce el serial del ESP32 al bus RS485 por donde hablan los 2 motores M0601.',
  mount: '**De cabeza** (rev. 3.29): sus 2 tiras de 4 se vuelven a soldar del lado de los componentes y se monta girado sobre su eje largo, con la bornera verde en la misma punta (queda hacia la placa y no se usa). VCC 5 V, DI ← GPIO 17, DE y RE puenteados ← GPIO 4, RO → convertidor → GPIO 16. A y B a la bornera J3.', herr: '—', check: 'Cada motor contesta a su ID.', err: 'Si no contestan, inviertan A y B.', inst: [I('max485', 'MAX485', { title: 'Módulo MAX485', tag: 'DI 17 · DE/RE 4 · RO → 16' })] });
comp('bno', { name: 'IMU BNO055 + BMP280 (UNIT DevLab)', qty: '1', fn: 'Mide el giro del carrito: corrige la odometría de las ruedas (aprobada por Mario).',
  mount: 'Con 2 headers macho de 5 en sus zócalos, plana y con la flecha X hacia el frente del carrito. VCC a 3.3 V (no a 5 V: sus SDA/SCL salen al voltaje de VCC), GND, SDA y SCL al bus. El puente SB1 abierto = 0x28 (cerrado sería 0x29 y chocaría con los VL53L0X al arrancar). Los demás pines sin conectar; si no aparece en 0x28, unan PS0 y PS1 a GND. Usen el modo IMU (sin magnetómetro): los motores y la batería lo confunden.',
  herr: '—', check: 'El escáner I²C la encuentra en 0x28 (y al BMP280 en 0x76 o 0x77) y al girar el carrito 90° marca ~90°.', err: 'Montarla floja o chueca: el ángulo sale torcido.', inst: [I('bno', 'BNO055', { title: 'IMU BNO055 (UNIT)', tag: '0x28 · flecha X hacia el frente' })] });
comp('resist', { name: 'Resistencias y capacitor de 100 nF', short: '', qty: '5 + 2', fn: 'Cada una hace algo distinto: pull-up de ENABLE, divisor para medir la batería, divisor para leer el paro y pull-up del final superior.',
  mount: 'Acostadas sobre la placa, pegadas a la superficie. Las resistencias no tienen polaridad. Lean las bandas de color o mídanlas antes de soldar.', herr: 'Cautín, multímetro en ohms.', check: 'Cada una mide su valor antes de soldarla.', err: 'Confundir la de 100 kΩ con la de 10 kΩ: la medición de la batería sale mal.',
  inst: [
    I('r_en', 'R 10 kΩ · pull-up de ENABLE', { tag: 'café, negro, naranja', fn: 'Mantiene ENABLE en 1 (motores sueltos) mientras el ESP32 arranca: nada se mueve solo al encender.', mount: 'Una pata a la cadena de ENABLE (EN del A4988 #3), la otra a 3.3 V.', check: 'Mide 10 kΩ (café, negro, naranja).', err: 'Sin ella, los motores dan un jalón al encender.' }),
    I('r_div1', 'R 100 kΩ · divisor (arriba)', { tag: 'café, negro, amarillo', fn: 'Parte de arriba del divisor: de los 12 V de la rama auxiliar al punto medio.', mount: 'Una pata al +12 V AUX de J2, la otra al punto medio del divisor (con la 20 kΩ).', check: 'Mide 100 kΩ (café, negro, amarillo).', err: 'Ponerla abajo y la 20 kΩ arriba: el GPIO 39 recibe ~12 V y se quema.' }),
    I('r_div2', 'R 20 kΩ · divisor (abajo)', { tag: 'rojo, negro, naranja', fn: 'Parte de abajo del divisor: del punto medio a GND. 14.4 V → 2.4 V en el GPIO 39.', mount: 'Una pata al punto medio (que va al GPIO 39), la otra a GND.', check: 'Mide 20 kΩ (rojo, negro, naranja).', err: '—' }),
    I('c_div', 'C 100 nF · filtro del divisor', { tag: 'cerámico "104"', fn: 'Quita el ruido de la lectura de la batería.', mount: 'En paralelo con la 20 kΩ: del punto medio a GND. No tiene polaridad.', check: 'Dice "104".', err: 'Olvidarlo: la lectura sale baja y brincando.' }),
    I('r_paro1', 'R 100 kΩ · divisor del paro (arriba)', { tag: 'café, negro, amarillo', fn: 'Del VCC del relé (J13 PARO) al punto medio del divisor del paro.', mount: 'Una pata a J13 PARO, la otra al punto medio (con la 20 kΩ).', check: 'Mide 100 kΩ.', err: 'Cambiarla por la de 20 kΩ: el GPIO 34 recibe ~12 V y se quema.' }),
    I('r_paro2', 'R 20 kΩ · divisor del paro (abajo)', { tag: 'rojo, negro, naranja', fn: 'Del punto medio a GND: paro suelto → 2.0–2.4 V en el GPIO 34; apretado → 0 V.', mount: 'Una pata al punto medio (que va al GPIO 34), la otra a GND.', check: 'Mide 20 kΩ.', err: '—' }),
    I('c_paro', 'C 100 nF · filtro del paro', { tag: 'cerámico "104"', fn: 'Quita el ruido para que un pico de los motores no se lea como paro.', mount: 'En paralelo con la 20 kΩ del paro.', check: 'Dice "104".', err: '—' }),
    I('r_fc4', 'R 10 kΩ · pull-up del final superior', { tag: 'café, negro, naranja', fn: 'GPIO 35 no tiene pull-up interno: esta lo deja en 1 cuando el final se abre.', mount: 'Una pata a J13 FC4 (y al GPIO 35), la otra a 3.3 V.', check: 'Mide 10 kΩ.', err: 'Olvidarla: el pin flota y el tope "se activa" solo.' })] });
const J_NOTE = {
  J1: 'Llega del relé (NO) por el cable tc3 y regresa por tc9.', J2: 'Llega del XL4005 (tc5, tc6, tc7).', J3: 'Salen los cables RS485 a los 2 M0601.', J4: 'Llegan los 3 finales de carrera (2 hilos cada uno).',
  J5: 'Sale el bus I²C a los 4 VL53L0X.', J6: 'Salen los 3 XSHUT de los VL53L0X de obstáculos (GPIO 32, 33 y 15); el de la pila no lleva.', J7: 'Llega el cable del NEMA del elevador izquierdo.', J8: 'Llega el cable del NEMA del elevador derecho.', J9: 'Llega el cable del NEMA del empujador.',
  J11: 'Se enchufa el conector del servo (café a GND).', J13: 'Llegan el final superior (FC4 y GND4, cable C22) y el VCC del relé para leer el paro (PARO, cable C23).' };
comp('conectores', { name: 'Borneras KF301 y header del servo', qty: '11', fn: 'Todo lo que entra o sale de la placa va atornillado: se desconecta sin soldar.',
  mount: 'En las orillas, con la entrada de los cables hacia afuera. Etiqueten cada una en la placa con plumón.', herr: 'Cautín, desarmador.', check: 'Jalen suave cada cable: no se sale.', err: 'No etiquetarlas.',
  inst: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J11', 'J13'].map(j => I(j, PARTS.get(j).name, { note: J_NOTE[j] })) });
// ---------- electrónica: potencia y carrito
comp('boost', { name: 'Elevador de voltaje 400 W (12 → 18 V)', qty: '1', fn: 'Da los 18 V de las ruedas M0601.', mount: 'En la bandeja con separadores M3. IN+ ← relé NO (tc2), IN− = tierra común. OUT+/OUT− → conectores de potencia de los 2 M0601.',
  herr: 'Multímetro, desarmador.', check: '18.0 V sin carga, corriente al máximo.', err: 'Conectar los motores antes de ajustarlo.', inst: [I('boost', 'Elevador', { title: 'Elevador de voltaje 400 W', tag: 'ajustar a 18.0 V sin carga',
    mount: 'Atorníllenlo a la bandeja. Conecten solo su entrada a 12 V y, sin nada a la salida, giren el potenciómetro de voltaje hasta leer 18.0 V. El de corriente, al máximo.' })] });
comp('xl4005', { name: 'Reductor XL4005 (12 → 5 V)', qty: '1', fn: 'Da 5 V a la lógica: ESP32, MAX485 y servo.', mount: 'IN+ ← rama auxiliar (fusible 5 A y KCD1). OUT+/OUT− → J2.', herr: 'Multímetro, desarmador.', check: '5.0–5.1 V sin carga.', err: 'Conectar el ESP32 sin ajustarlo: puede salir a 12 V.',
  inst: [I('xl4005', 'XL4005', { title: 'Reductor XL4005', tag: 'ajustar a 5.0–5.1 V', mount: 'Atorníllenlo a la bandeja. Con 12 V a la entrada y nada a la salida, giren su potenciómetro (muchas vueltas) hasta leer 5.0–5.1 V. Márquenlo "5V" con cinta.' })] });
comp('relay', { name: 'Módulo relé T90 30 A', qty: '1 (2 canales, se usa 1)', fn: 'Corta la rama de motores (ruedas y drivers) cuando se aprieta el paro.', mount: 'COM ← fusible 15 A; NO → elevador y J1. La bobina se alimenta por el contacto NC del paro; IN fijo en el nivel que lo activa.',
  herr: 'Desarmador.', check: 'Paro apretado: el NO queda en 0 V.', err: 'Controlarlo con un GPIO: si el programa se cuelga, el paro no sirve.', inst: [I('relay', 'Relé', { title: 'Módulo relé T90', tag: 'COM ← 15 A · NO → motores',
    mount: 'Atorníllenlo a la bandeja. Pongan el jumper H/L para que se active con IN en alto y puenteen IN con VCC. La bobina se alimentará por el paro.' })] });
comp('xt60', { name: 'Conector XT60 (hembra + macho)', qty: '1 par', fn: 'Desconecta la batería de todo el carrito sin herramientas.', mount: 'Hembra en los cables de la batería (sus contactos quedan cubiertos); macho del lado del carrito, a los fusibles y a la tierra común.', herr: 'Cautín de 60 W o más, thermofit.', check: 'Rojo con +, negro con −. El chaflán del cuerpo solo deja conectarlo en una posición.', err: 'Poner la hembra del lado del carrito: al desconectar, los pines del macho de la batería quedan expuestos.',
  inst: [I('xt60', 'XT60', { title: 'XT60 hembra + macho', tag: 'rojo + · negro −', mount: 'Va sobre la orilla trasera de la batería; los 2 cables de 14 AWG pasan por él.' })] });
comp('fuses', { name: 'Portafusibles 15 A y 5 A', qty: '2', fn: '15 A: rama de motores. 5 A: rama auxiliar (Jetson, lógica, relé).', mount: 'Lo más cerca posible de la batería, después del XT60.', herr: 'Cautín, thermofit.', check: 'Continuidad a través de cada fusible.', err: 'Poner un fusible más grande "para que no se queme".',
  inst: [I('fuses', 'Fusibles', { title: 'Portafusibles 15 A y 5 A', tag: 'azul 15 A · café 5 A', mount: 'Atornillen los 2 portafusibles a la bandeja. El XT60 macho, del lado del carrito, alimenta la entrada de los 2.' })] });
comp('kcd1', { name: 'Interruptor KCD1', qty: '1', fn: 'Prende y apaga la lógica y el Jetson (rama auxiliar).', mount: 'En el costado de atrás, accesible desde afuera. En serie entre el fusible de 5 A y el XL4005.', herr: 'Cautín, faston.', check: 'Apagado: 0 V en J2.', err: '—',
  inst: [I('kcd1', 'KCD1', { title: 'Interruptor KCD1', tag: 'en la rama auxiliar', mount: 'Atorníllenlo en su soporte impreso al costado de atrás, donde se alcance desde afuera.' })] });
comp('estop', { name: 'Paro de emergencia LAY37 (NC)', qty: '1', fn: 'Corta la energía de la bobina del relé: se detienen ruedas, elevador y empujador aunque el programa esté colgado.', mount: 'Arriba, en una esquina de atrás. Contacto NC en serie con el VCC del relé. Del VCC del relé sale además un hilo a J13 PARO: el ESP32 lo lee por el GPIO 34 (divisor) para saber que lo apretaron.', herr: 'Desarmador.', check: 'Al apretarlo, todo se detiene, la plataforma no baja y el monitor serie dice FALLA_PARO. Al soltarlo nada se mueve hasta REARME + home.', err: 'Usar el contacto NO.',
  inst: [I('estop', 'Paro', { title: 'Paro de emergencia LAY37', tag: 'arriba, esquina de atrás', mount: 'Atornillen su soporte impreso en la esquina trasera de arriba, al alcance de la mano.' })] });
comp('vl53', { name: 'Sensor de distancia VL53L0X', short: 'VL53L0X', qty: '4', fn: 'Los 3 de abajo frenan el carrito si hay algo a menos de 40 cm; el de arriba confirma que hay un fixture en la pila.',
  mount: 'VIN 3.3 V, GND, SDA, SCL al bus (J5). Los 3 de obstáculos llevan su XSHUT a J6 (GPIO 32, 33 y 15); el de la pila no lleva XSHUT. GPIO1 sin conectar. Al arrancar se apagan los 3, al de la pila se le da 0x33 y luego se prenden uno por uno: 0x30–0x32.', herr: 'Desarmador, M2 × 8.', check: 'Mide bien a 10, 30 y 60 cm.', err: 'Cables de señal pegados a los de potencia.',
  inst: [I('vl_front', 'Frontal', { tag: 'XSHUT → GPIO 32 · 0x30', mount: 'Atornillen su soporte impreso al frente, a ~20 cm del piso, mirando hacia adelante.' }), I('vl_sideL', 'Lateral izquierdo', { tag: 'XSHUT → GPIO 33 · 0x31', mount: 'En el costado izquierdo, a ~20 cm del piso, mirando hacia afuera.' }),
    I('vl_sideR', 'Lateral derecho', { tag: 'XSHUT → GPIO 15 · 0x32', mount: 'En el costado derecho, a ~20 cm del piso, mirando hacia afuera.' }), I('vl_pile', 'De la pila', { tag: 'sin XSHUT · 0x33', mount: 'Colgado del larguero superior, mirando hacia abajo sobre la esquina trasera de un costado del fixture.' })] });
comp('jet_plate', { name: 'Base impresa del Jetson', qty: '1', fn: 'Base del Jetson arriba del carrito (rev. 3.37: impresa, ya no lleva MDF).', mount: 'Encima del travesaño superior central con 2 M6 × 12 + rondana + tuerca T, y un soporte trasero impreso en la cara de atrás del mismo travesaño (2 M6 × 12 horizontales) que se mete 30 mm bajo la base: el peso empuja el soporte contra el perfil. El Jetson va entre las paredes, contra el tope del frente, amarrado con 2 cinchos o velcro.', herr: 'Llave Allen de 5 mm, cinchos.', check: 'Empujada hacia abajo en la punta, casi no se mueve; el Jetson no se desliza.', err: 'Apretar los cinchos sobre el ventilador: tapan el aire. Páselos por las orillas del disipador.', specs: ['Base: PETG · 225 × 126 × 21 mm · 4 paredes, 30 %', 'Soporte trasero: 90 × 30 × 27 mm · 100 %'], inst: [I('jet_plate', 'Base', { title: 'Base impresa del Jetson', mount: 'Atornillen la base al travesaño superior central (primero el soporte trasero con 2 M6 × 12 en la cara de atrás, luego la base con 2 M6 × 12 en la ranura de arriba) y amarren el Jetson con 2 cinchos.' })] });
comp('jetson', { name: 'Jetson Orin Nano Super', qty: '1', fn: 'Visión (YOLO y ArUco) y navegación; manda órdenes al ESP32 por USB (Mario).', mount: 'Sobre su placa, con separadores. 12 V de la rama auxiliar por plug 5.5 × 2.5 mm (centro +). USB de datos al ESP32.', herr: 'Multímetro.', check: 'Centro del plug = + antes de conectar.', err: 'Polaridad al revés: se daña.',
  inst: [I('jetson', 'Jetson', { title: 'Jetson Orin Nano Super', tag: 'plug 5.5 × 2.5 · centro +', mount: 'Atornillen el Jetson con separadores sobre su placa. No conecten el plug hasta medir su polaridad.' })] });
comp('camera', { name: 'Cámara Logitech C920', qty: '1', fn: 'Reconoce la ECU de cada fixture (YOLO) y lee los ArUco de las estaciones.', mount: 'Su pie de clip va acostado en una repisa impresa sobre el perfil de arriba al frente (2 × M6), sujeto con 2 cinchos y, si su rosca cae en la ranura, un tornillo 1/4"-20. Por USB al Jetson.', herr: '—', check: 'Ve los 2 ArUco desde donde se detiene el carrito.', err: '—', inst: [I('camera', 'Cámara', { title: 'Cámara', tag: 'YOLO y ArUco', mount: 'Atornillen la repisa al perfil de arriba al frente, acuesten el pie de la cámara entre las paredes, contra el tope de atrás, y amárrenlo con 2 cinchos.' })] });

// ---------- estaciones y ayudas
comp('banda', { name: 'Banda transportadora (estación de carga)', qty: '1', fn: 'Entrega los fixtures al carrito por la ventana, a 83 cm. 3 tramos de 1030 mm con una sola cinta de 20.35 cm que se detiene en la inspección y corre durante la carga; extremo cerrado (2 rodillos de Ø50) hacia el carrito.', mount: 'Guías de 3 mm colgadas de los rieles (2 mm por lado de la quilla), acople atornillado abajo del extremo cerrado y ArUco.', herr: '—', check: 'El carrito queda centrado (±5 mm) y a menos de 1 cm de la tapa.', err: 'Poner un fixture sin el carrito acoplado: se cae por la punta.', inst: [I(['st_belt', 'st_stripes'], 'Banda')] });
comp('acople', { name: 'Acople a la banda (rev. 3.47)', qty: '1 juego (2 lados)', fn: 'Centra y frena el carrito en la banda: las guías en V toman la cara de afuera de los 2 postes delanteros (1.5 mm de juego por lado) y los postes pegan en 2 topes a 3 mm de la tapa.',
  mount: 'Por lado: calza impresa contra el costado del bastidor, brazo de 3030 sobrante (443 der., 370 izq.) con 2 M6 × 80 de cabeza hexagonal de adentro del canal a tuerca T, y encima la guía impresa con 4 M6 × 16 + rondana desde arriba a la ranura de arriba del brazo.',
  herr: 'Taladro con broca de 6.5 mm, llave de 10, llave Allen de 5, nivel.', check: 'Con el carrito en los topes, entre cada poste y su canal entra apenas una hoja (0.5–1 mm).', err: 'Guías apretadas contra los postes: el carrito se atora y no llega a los topes.',
  specs: ['Impreso: 2 guías de 168 cm³ (pared de 60 mm, tope de 90 mm, impresas paradas con barrenos de gota) y 2 calzas huecas de 85 cm³', 'FEA: acople normal 4 MPa, golpe a 15 cm/s 12 MPa, choque a 35 cm/s 27 MPa (PETG ~45)', 'Perfil: 3030 de 443 y de 370, sin cortar', 'Tornillería: 4 M6 × 80 cabeza hexagonal, 8 M6 × 16 Allen, 12 tuercas T de martillo, 12 rondanas'],
  inst: [I(['st_ac_calza', 'st_ac_b80'], 'Calzas y M6 × 80'), I('st_ac_brazo', 'Brazos'), I(['st_ac_guia', 'st_ac_b12'], 'Guías y M6 × 16'), I('st_dock', 'Acople (vista de estación)')] });
comp('vision', { name: 'Estación de inspección (visión) · rev. 3.48', qty: '1', fn: 'Ve el fixture detenido bajo la cámara y decide PASS/FAIL con YOLO (parts.onnx) en la Raspberry Pi 4. PASS = clase conocida del catálogo.',
  mount: 'Mástil impreso de 3 tramos 40 × 40 ensartados en una varilla roscada M8 × 60 cm, sobre una ménsula impresa atornillada con 2 M6 al canal C derecho (viendo venir las piezas). Brazo en L impreso arriba y la guarda impresa colgada de él con la C270 adentro, mirando hacia abajo a 45 cm de la cinta. Tira LED 12 V blanca dentro de la guarda. Torreta verde/roja en la punta del mástil.',
  herr: 'Taladro y broca de 6.5 mm, llave Allen de 5, llave de 13 para la tuerca M8.', check: 'En la imagen de la Pi, el fixture completo cabe con margen y no hay reflejos de las lámparas del lugar.', err: 'Entrenar con fotos tomadas sin la guarda: con la guarda la luz cambia y el YOLO falla.',
  specs: ['Cámara: Logitech C270 HD (720p, USB UVC, 55° diagonal): plug and play con OpenCV/V4L2 en la Pi', 'A 37 cm de la ECU ve ~0.34 × 0.19 m', 'Impreso: 3 tramos de mástil, ménsula, brazo en L, guarda 240 × 220 × 80 (cabe en la A1)', 'Varilla roscada M8 × 60 cm + 2 tuercas y rondanas', 'Tira LED 12 V blanca 40 cm'],
  inst: [I('st_vis_mast', 'Mástil y brazo impresos'), I('st_vis_hood', 'Guarda impresa con LEDs'), I('st_vis_cam', 'Cámara C270'), I(['st_vis_lamp', 'st_vis_lampG', 'st_vis_lampR'], 'Torreta'), I('st_vis_cone', 'Campo de visión')] });
comp('guia_final', { name: 'Guía final impresa de la banda · rev. 3.48c', qty: '2 (espejo)', fn: 'Centra la quilla a ±1 mm en los últimos 24 cm antes del rodillo, para que la ECU pase entre las columnas delanteras del carrito con ~2 mm de margen por lado.',
  mount: 'Cada pieza: tira de 6 × 3 mm, a 0.5 mm sobre la cinta (no la toca), con 2 brazos que pasan bajo el piso del fixture y se apoyan en el riel; 2 autorroscantes #8 × 1/2" por pieza en barrenos de 1/8".',
  herr: 'Taladro, broca de 1/8", desarmador.', check: 'Fixture corrido 1 cm: entra sin trabarse y sale centrado.', err: 'Garganta muy cerrada: la quilla se frena.',
  specs: ['Garganta: ±83.5 mm (quilla de 165: 1 mm por lado), 120 mm de largo', 'Entrada en V: de ±83.5 a ±94.5 en 120 mm (~5°)', 'Impreso en PETG con soportes de árbol', 'Se usa con o sin las guías bajas del resto de la banda'],
  inst: [I('st_gfin', 'Guías finales')] });
comp('scrap', { name: 'Estación de scrap · rev. 3.48', qty: '1', fn: 'Saca de la banda las piezas rechazadas: un cilindro doble efecto empuja el fixture de lado y cae a la charola, a la izquierda viendo venir las piezas.',
  mount: 'Silla impresa con 2 M6 al canal C derecho; el cilindro se fija por la nariz con su tuerca M22 × 1.5 y atrás con un cincho. La placa de empuje impresa va en el vástago (contratuerca M8) con una varilla Ø8 antigiro en un buje de la silla. Válvula 5/2 en la brida; mangueras de 4 mm. Sensor E18-D80NK en soporte impreso a 9.5 cm antes del centro. Del lado izquierdo: hueco de 32 cm en la guía baja, rampa impresa sobre el labio y la charola.',
  herr: 'Taladro, broca de 6.5 mm, llaves de 13 y 22, cortador de manguera.', check: 'La placa sale y regresa sin rozar; en 10 disparos el fixture siempre cae en la charola.', err: 'Válvula biestable: si se va la luz, el vástago se queda afuera.',
  specs: ['Cilindro ISO 6432 Ø20 × 100 doble efecto, émbolo magnético (o el que ya tienen, misma carrera)', '2 sensores reed de cilindro (retraído → LOGO!/Pi; extendido opcional)', 'Válvula 5/2 monoestable 24 V + 2 silenciadores con regulador', 'Placa de empuje 230 × 20 × 8 a 24–44 mm sobre la cinta', 'Charola representativa con hule espuma (sin MDF)'],
  inst: [I('st_rej_sup', 'Silla impresa'), I('st_rej_cyl', 'Cilindro'), I('st_rej_rod', 'Vástago y placa de empuje'), I('st_rej_valve', 'Válvula y mangueras'), I('st_rej_ir', 'Sensor de la estación'), I('st_rej_ramp', 'Rampa sobre el labio'), I('st_rej_tray', 'Charola')] });
comp('mesa_inc', { name: 'Mesa inclinada de descarga', qty: '1', fn: 'Recibe los 6 fixtures: cada uno se desliza solo hasta el tope y deja libre la entrada.',
  mount: 'Tabla de melamina de ~1.4 m × 30 cm con el borde de entrada a 83 cm (2 mm abajo de la base del fixture), bisagra en la entrada y cuña atrás para el ángulo (~12–15° melamina, ~20° MDF). Guías laterales y tope acolchado.',
  herr: 'Bisagra, cuña, hule espuma.', check: 'Un fixture puesto en la orilla se desliza solo hasta el tope.', err: 'Orilla más alta que la base del fixture: escalón.', inst: [I('st_ramp', 'Mesa inclinada')] });
comp('mesa', { name: 'Mesa de trabajo', qty: '—', fn: 'Aquí se arma y se prueba la electrónica antes de pasarla al carrito.', mount: '—', herr: '—', check: '—', err: '—', inst: [I('mesa', 'Mesa de trabajo')] });
comp('nivel', { name: 'Nivel de burbuja', qty: '1', fn: 'Revisar que postes y columnas queden verticales.', mount: '—', herr: '—', check: '—', err: '—', inst: [I('tool_level', 'Nivel')] });
comp('sobra', { name: 'Sobra de perfil', qty: '—', fn: 'Lo que queda de cada barra después de los cortes.', mount: '—', herr: '—', check: '—', err: '—', inst: [I(['waste0', 'waste1'], 'Sobras')] });

// ---------- qué piezas toca cada cable del carrito
const CAB_PARTS = { cab_bat: ['bat', 'fuses'], cab_batN: ['bat', 'boost'], cab_kcd: ['fuses', 'kcd1', 'xl4005'], cab_18_L: ['boost', 'mot_L'], cab_18_R: ['boost', 'mot_R'], cab_485_L: ['J3', 'mot_L'], cab_485_R: ['J3', 'mot_R'],
  cab_nema_L: ['nema_L', 'J7'], cab_nema_R: ['nema_R', 'J8'], cab_pnema: ['pnema', 'J9'], cab_lsw_L: ['lsw_L', 'J4'], cab_lsw_R: ['lsw_R', 'J4'], cab_lsw_P: ['pframe_r', 'J4'], cab_servo: ['servo', 'J11'],
  cab_i2c: ['vl_pile', 'J5'], cab_i2cF: ['vl_front', 'J5', 'J6'], cab_i2cL: ['vl_sideL', 'J5', 'J6'], cab_i2cR: ['vl_sideR', 'J5', 'J6'], cab_jet: ['xl4005', 'jetson'], cab_stop: ['estop', 'relay', 'xl4005'], cab_usb: ['jetson', 'esp32'], cab_lsw_U: ['lswUp', 'J13'], cab_paro: ['relay', 'J13'] };

for (const g of FAST) comp(g.id, { name: g.title, qty: `${g.items.length} tornillos`, fn: g.txt.que, mount: g.txt.porque || 'Cada tornillo entra al centro de su barreno; las tuercas T, al centro de la ranura.', herr: g.txt.herr, check: g.txt.check, err: g.txt.error, inst: [I(g.id, g.title)] });
// ---------- índices
for (const [key, c] of Object.entries(COMP)) c.inst.forEach((it, i) => it.ids.forEach(id => PART_COMP.set(id, { key, i })));
for (const inv of INV) { const p = PARTS.get(inv.id); const first = { inv_post: 'post_FL', inv_col: 'col_FL', inv_pf: 'larg_bL', inv_esc: 'esc_c', inv_nut: 'nut_bF', inv_cast: 'cast_FL', inv_mot: 'mot_L', inv_susp: 'susp_L', inv_bat: 'bat', inv_bat2: 'bat_hold',
  inv_screw: 'screw_L', inv_guide: 'guide_BL', inv_nema: 'nema_L', inv_kfl: 'kflLo_L', inv_sc: 'sc_L', inv_lsw: 'lsw_L', inv_plat: 'plat', inv_sled: 'sled', inv_pin: 'servo', inv_fx: 'fx0', inv_perf: 'perf', inv_mods: 'esp32',
  inv_boost: 'boost', inv_xl: 'xl4005', inv_relay: 'relay', inv_fuse: 'fuses', inv_stop: 'estop', inv_vl: 'vl_front', inv_jet: 'jetson', inv_cam: 'camera', inv_tray: 'tray' }[inv.id];
  if (first && PART_COMP.has(first)) PART_COMP.set(inv.id, PART_COMP.get(first)); }
const compOf = id => { const r = PART_COMP.get(id); return r ? COMP[r.key] : null; };
const instOf = id => { const r = PART_COMP.get(id); return r ? COMP[r.key].inst[r.i] : null; };
// las piezas que faltan en el catálogo se reportan en consola (para no dejar ninguna sin información)
{ const miss = [...PARTS.keys()].filter(id => !PART_COMP.has(id) && !/^w\d{3}$/.test(id) && !/^(cab_|tc)/.test(id)); if (miss.length) console.warn('Sin ficha en el catálogo:', miss.join(', ')); }

// ============================================================ HERRAMIENTAS Y AYUDAS VISUALES
addPart('tool_level', 'sta', 'Nivel de burbuja', b => {
  b.bb(D.XP + 0.016, D.XP + 0.036, 0.46, 0.78, D.ZP - 0.012, D.ZP + 0.012, 'yellow');
  b.bb(D.XP + 0.036, D.XP + 0.038, 0.60, 0.64, D.ZP - 0.006, D.ZP + 0.006, 'green');
}, { noCheck: true });
const cones = new THREE.Group(); cartRoot.add(cones);
{
  const mat = new THREE.MeshBasicMaterial({ color: 0x16a34a, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  const mk = (apex, dir, len) => {
    const r = len * Math.tan(THREE.MathUtils.degToRad(12.5));
    const g = new THREE.ConeGeometry(r, len, 24, 1, true); g.translate(0, -len / 2, 0);
    const c = new THREE.Mesh(g, mat); c.position.set(...apex);
    c.quaternion.setFromUnitVectors(V3(0, -1, 0), V3(...dir).normalize()); cones.add(c);
  };
  mk([0.2465, 0.150, 0], [1, 0, 0], 0.40);
  mk([-0.150, 0.150, 0.2016], [0, 0, 1], 0.40);
  mk([-0.150, 0.150, -0.2016], [0, 0, -1], 0.40);
  mk([0.040, 0.951, 0.078], [0, -1, 0], 0.12);
}

// ============================================================ PISTAS (por modo: cuándo entra y a dónde va cada pieza)
for (const p of PARTS.values()) { p.trk = { r: [], d: [], x: [], e: [], b: [], t: [] }; p.onlyM = {}; p.group.userData.pid = p.id; }
for (const w of WIRES) PARTS.get(w.id).grow = true;
for (const c of CABLES) PARTS.get(c.id).grow = true;
for (const p of PARTS.values()) if (p.grow) { const m = p.group.children.find(o => o.isMesh && !o.userData.proxy); p.growGeo = m && m.geometry; }
const M0 = () => ({ plat: D.LOAD0, tilt: 0, push: D.P0, pin: 0, screwX: 0, screwL: 0, spring: 1, belt: 0, cart: { x: 0, z: 0 }, fx: Array(6).fill(null), station: null, cones: false, rej: 0, vis: 0, lamp: 0 });
const cloneM = m => ({ ...m, cart: { ...m.cart }, fx: m.fx.map(f => f && { ...f }) });
function buildMode(key) {
  const { STEPS, CHAPTERS } = key === 'x' || key === 'e' ? defineExplore(key) : key === 'b' ? defineElecBoard() : key === 't' ? defineScrews() : defineSteps(key === 'd');
  let TOTAL = 0;
  STEPS.forEach((st, i) => {
    st.i = i; st.start = TOTAL; TOTAL += st.dur;
    st.add.forEach((e, k) => {
      const en = typeof e === 'string' ? { ids: [e] } : Array.isArray(e) ? { ids: e } : e;
      const t0 = st.addStart + k * st.stagger;
      en.ids.flatMap(id => [id, ...(PARTS.get(id)?.companions || [])]).forEach((id, j) => {   // las acompañantes (p. ej. la palanca de un switch) entran con su pieza
        const p = PARTS.get(id); if (!p) { console.warn('Falta la pieza', id); return; }
        const pose = !en.pose || en.pose === 'home' ? 'home' : en.pose(id);
        p.trk[key].push({ s: i, pose, t0: t0 + (en.ids.length > 6 ? j * (en.lag ?? 0.025) : 0), td: st.addDur, from: en.from ? V3(...en.from) : null });
      });
    });
    for (const id of (st.show || []).flatMap(id => [id, ...(PARTS.get(id)?.companions || [])])) { const p = PARTS.get(id); (p.onlyM[key] ||= new Set()).add(i); }
    st.focusSet = new Set(st.focus || []);
    if (st.iso) { st.iso.hiS = new Set(st.iso.hi); st.iso.keepS = new Set(st.iso.keep); st.iso.softS = new Set(st.iso.soft || []); }
    st.labelObjs = st.labels.map(l => Object.assign(makeLabel(l.t, l.s, l.cls), { spec: l }));
    st.dimObjs = st.dims.map(d => Object.assign(makeDim(d.a, d.b, d.off, d.text, { mount: d.mount, cls: d.cls, labAt: d.labAt }), { spec: d }));
    st.dimObjs.forEach(d => { d.lab.visible = false; if (d.spec.arrow) d.g.children.filter(c => c.isMesh)[0].visible = false; });
  });
  const START = [];
  let m = M0();
  for (const st of STEPS) {
    const s0 = cloneM(m);
    if (!st.keepFx) s0.fx = Array(6).fill(null);
    s0.station = null; s0.cones = false; s0.screwX = 0; s0.tilt = 0; s0.beltS = undefined; s0.rej = 0; s0.vis = 0; s0.lamp = 0;
    START.push(s0);
    const e = cloneM(s0); if (st.mech) st.mech(st.dur, e);
    m = e;
  }
  return { key, STEPS, CHAPTERS, TOTAL, START };
}
const MODES = { r: buildMode('r'), d: buildMode('d'), x: buildMode('x'), e: buildMode('e'), b: buildMode('b'), t: buildMode('t') };
let MD = MODES.r;
const curTrack = p => p.trk[MD.key];
for (const p of PARTS.values()) if (!p.explode) p.explode = defaultExplode(p);
for (const [k, key] of [['st_belt', 'belt'], ['st_stripes', 'belt'], ['st_dock', 'belt'], ['st_ramp', 'ramp'], ['st_gfin', 'belt'], ['st_vis_mast', 'belt'], ['st_vis_hood', 'belt'], ['st_vis_cam', 'belt'], ['st_vis_lamp', 'belt'], ['st_vis_lampG', 'belt'], ['st_vis_lampR', 'belt'], ['st_vis_cone', 'belt'], ['st_rej_sup', 'belt'], ['st_rej_cyl', 'belt'], ['st_rej_rod', 'belt'], ['st_rej_valve', 'belt'], ['st_rej_ir', 'belt'], ['st_rej_ramp', 'belt'], ['st_rej_tray', 'belt']]) PARTS.get(k).station = key;
function mechAt(i, t) { const st = MD.STEPS[i], m = cloneM(MD.START[i]); if (st.mech) st.mech(t, m); if (m.station === 'belt') m.belt = BND.V * (m.beltS ?? (st.tsc || 1) * (st.start + t)); return m; }

// ============================================================ MONTAJES (piezas que se mueven)
const _m = new THREE.Matrix4(), _a = new THREE.Matrix4(), _b = new THREE.Matrix4();
const T4 = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
function mountMatrix(p, m) {
  const M = new THREE.Matrix4();
  const hp = p.home;
  switch (p.mount) {
    case 'plat': {
      M.makeTranslation(0, m.plat - D.LOAD0, 0);
      if (m.tilt) M.multiply(T4(D.XC, D.LOAD0, 0)).multiply(new THREE.Matrix4().makeRotationX(m.tilt)).multiply(T4(-D.XC, -D.LOAD0, 0));
      break;
    }
    case 'push': M.makeTranslation(m.push - D.P0, 0, 0); break;
    case 'pin': case 'horn':                       // uña abatible: modelada abajo; arriba = 90° hacia +z
      M.makeTranslation(m.push - D.P0, 0, 0).multiply(T4(0, D.CLAWY, D.CLAWZ)).multiply(new THREE.Matrix4().makeRotationX(-(1 - m.pin) * Math.PI / 2)).multiply(T4(0, -D.CLAWY, -D.CLAWZ)); break;
    case 'pinion': M.multiply(T4(hp.x, hp.y, hp.z)).multiply(new THREE.Matrix4().makeRotationZ((m.push - D.P0) / 0.015)).multiply(T4(-hp.x, -hp.y, -hp.z)); break;
    case 'screw': {
      const ang = (m.plat - 0.6) * 900 + m.screwX + (hp.z < 0 ? m.screwL : 0);
      M.multiply(T4(hp.x, hp.y, hp.z)).multiply(new THREE.Matrix4().makeRotationY(ang)).multiply(T4(-hp.x, -hp.y, -hp.z));
      break;
    }
    case 'wheel': M.multiply(T4(hp.x, hp.y, hp.z)).multiply(new THREE.Matrix4().makeRotationZ(-m.cart.x / D.WR)).multiply(T4(-hp.x, -hp.y, -hp.z)); break;
    case 'spring': M.multiply(T4(hp.x, hp.y, hp.z)).multiply(new THREE.Matrix4().makeScale(1, m.spring, 1)).multiply(T4(-hp.x, -hp.y, -hp.z)); break;
    case 'sloop': dynLoop(p, m); break;
    case 'belt': M.makeTranslation(-((m.belt % 0.09) + 0.09) % 0.09, 0, 0); break;
    case 'rej': M.makeTranslation(0, 0, -(m.rej || 0) * RJ.ST); break;          // rev. 3.48: vástago y placa del pistón de scrap
    case 'vcone': case 'lampG': case 'lampR': {                                  // rev. 3.48: cono de visión y torreta (aparecen/desaparecen)
      const on = p.mount === 'vcone' ? (m.vis || 0) : (m.lamp === (p.mount === 'lampG' ? 1 : 2) ? 1 : 0), k = Math.max(1e-4, on);
      M.multiply(T4(hp.x, hp.y, hp.z)).multiply(new THREE.Matrix4().makeScale(k, k, k)).multiply(T4(-hp.x, -hp.y, -hp.z)); break;
    }
    case 'lsw': {                                  // palanca del final de carrera: gira cuando algo pisa su rueda
      const L = p.lsw; let d = 0;
      if (L.kind === 'E') d = L.y0 - (m.plat - 0.012);                         // brazo de la plataforma (cara de abajo)
      else if (L.kind === 'U') d = m.plat - L.y0;                              // final superior: lo pisa la cara de arriba del brazo
      else {                                                                   // travesaño del carro con rampa de 3 mm (punta en x = push − 0.283)
        const xe = m.push - 0.283, surf = x => x >= xe + 0.003 ? 0.8825 : x >= xe ? 0.8795 + (x - xe) : -1;   // rev. 3.18: −8.5 mm
        // ángulo mínimo para que ningún punto de la rueda quede bajo la cara del travesaño (en el plano de giro, eje ±z)
        const ok = a => { const be = -a * L.axis.z, c = Math.cos(be), sn = Math.sin(be); for (const [x, y] of L.pts) { const dx = x - L.piv.x, dy = y - L.piv.y; if (L.piv.y + dx * sn + dy * c < surf(L.piv.x + dx * c - dy * sn) + 0.0002) return false; } return true; };
        let lo = 0, hi = 0.3;
        if (!ok(0)) { for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; } d = hi * (L.arm || 0.01545); }
      }
      d = Math.min(L.dmax || 0.0045, Math.max(0, d));
      if (d > 0) M.multiply(T4(L.piv.x, L.piv.y, L.piv.z)).multiply(new THREE.Matrix4().makeRotationAxis(L.axis, -d / (L.arm || 0.01545))).multiply(T4(-L.piv.x, -L.piv.y, -L.piv.z));
      break;
    }
  }
  return M;
}
const _pos = V3(), _q = new THREE.Quaternion(), _s = V3();
function homePose(p, m, explodeAmt) {
  const M = mountMatrix(p, m).multiply(T4(p.home.x, p.home.y, p.home.z));
  const pos = V3(), q = new THREE.Quaternion(), s = V3();
  M.decompose(pos, q, s);
  if (explodeAmt > 0) pos.addScaledVector(p.explode, explodeAmt);
  return { pos, q, s };
}

// ============================================================ EVALUAR UN INSTANTE
const ui = { labels: true, dims: true, explode: false, transp: false, explodeAmt: 0, playing: false, speed: 1, T: 0, userCam: false, step: -1, pauseEach: false, insp: null };
const STEPS_ = () => MD.STEPS;
function stepAt(T) {
  const S = MD.STEPS;
  for (let i = S.length - 1; i >= 0; i--) if (T >= S[i].start) return i;
  return 0;
}
// marcas en las puntas del cable que se está poniendo
const ENDS = [0, 1].map(() => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.0021, 0.00016, 6, 40), new THREE.MeshBasicMaterial({ color: 0xff8a00, depthTest: false, transparent: true, opacity: 0.9 }));
  m.rotation.x = Math.PI / 2; m.renderOrder = 30; m.visible = false; scene.add(m); return m;
});
let MECH_OVERRIDE = null;                          // solo pruebas: fuerza un estado de los mecanismos
function applyAt(T, dt = 0) {
  const i = stepAt(T), st = MD.STEPS[i], t = Math.min(st.dur, T - st.start);
  const m = mechAt(i, t);
  if (MECH_OVERRIDE) Object.assign(m, MECH_OVERRIDE);
  cartRoot.position.set(m.cart.x, 0, m.cart.z);
  cones.visible = !!m.cones && !ui.insp;
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260), phone = isPhone();
  for (const p of PARTS.values()) evalPart(p, st, t, m, pulse);
  partsDirty = false;
  // puntas del cable actual
  ENDS.forEach((e, k) => {
    e.visible = !!st.ends && !ui.insp && t > 0.15;
    if (e.visible) { e.position.set(...st.ends[k]); const s = 1 + 0.12 * pulse; e.scale.set(s, s, s); }
  });
  // etiquetas y cotas (solo las del paso actual)
  const showL = ui.labels && !ui.insp;
  for (const s of MD.STEPS) {
    const cur = s === st;
    if (!cur && !s._vis) continue;
    s._vis = cur;
    s.labelObjs.forEach(o => {
      let w0 = o.spec.when ?? 0.8, w1 = o.spec.until ?? 1e9;
      if (o.spec.cls === 'inv' && st.ch === 0 && phone) {           // en celular, el inventario se nombra de a poco
        const k = s.labelObjs.indexOf(o), n = s.labelObjs.length, slot = (s.dur - 1.2) / n;
        w0 = 0.6 + k * slot; w1 = k === n - 1 ? 1e9 : w0 + slot * 2.2;
      }
      const on = cur && showL && t >= w0 && t < w1;
      if (!on) { o.visible = false; if (o.parent) scene.remove(o); return; }
      if (!o.parent) scene.add(o);
      if (o.spec.p) { const p = PARTS.get(o.spec.p); p.group.getWorldPosition(o.position); if (o.spec.o) o.position.add(V3(...o.spec.o)); }
      else o.position.set(...o.spec.at);
      o.visible = true;
      o.element.style.opacity = clamp01((t - w0) / 0.4);
    });
    s.dimObjs.forEach(d => {
      const on = cur && ui.dims && !ui.insp && t >= (d.spec.when ?? 0.8) && t < (d.spec.until ?? 1e9);
      d.g.visible = on; d.lab.visible = on;
      if (!on) { if (d.g.parent) { scene.remove(d.g); d.lab.element.remove(); } return; }
      if (!d.g.parent) scene.add(d.g);
      d.g.matrixAutoUpdate = false;
      d.g.matrix.copy(d.mount === 'plat' ? mountMatrix({ mount: 'plat', home: V3() }, m) : new THREE.Matrix4());
      if (d.spec.grow) {
        const g = seg(t, ...d.spec.grow), P = d.geo.attributes.position;
        const B = d.A2.clone().lerp(d.B2, Math.max(0.001, g));
        P.setXYZ(1, B.x, B.y, B.z); P.needsUpdate = true;
        d.lab.position.copy(d.A2).lerp(B, d.spec.labAt ?? 0.5); d.lab.element.style.opacity = g > 0.98 ? 1 : 0;
        d.g.children.filter(c => c.isMesh)[1].visible = g > 0.98;
      }
    });
  }
  return { i, t, m };
}
function ghostOf(p, st) {
  const I = ui.insp;
  if (I) return I.set.has(p.id) ? 0 : I.soft.has(p.id) ? 0.28 : 0.06;
  const S = st.iso;
  if (!S) return 0;
  if (S.hiS.has(p.id) || S.keepS.has(p.id)) return 0;
  if (S.softS.has(p.id)) return p.id === 'perf' ? 0.28 : 0.16;
  if (p.wire && st.wire && p.wire < st.wire.n) return 0.3;
  return 0.06;
}
function evalPart(p, st, t, m, pulse) {
  const i = st.i, trk = curTrack(p), only = p.onlyM[MD.key];
  let mode = 'hidden', pose = null, grow = 1;
  if (p.inv) {
    if (st.ch === 0 && !st.explore) {
      const e = trk[0]; const prog = (e && i === 0) ? clamp01((t - e.t0) / e.td) : 1;
      const hp = homePose(p, m, 0);
      pose = { pos: hp.pos.clone().addScaledVector(p.from, 1 - ease(prog)), q: hp.q, s: hp.s };
      mode = p.inv === st.inv ? (i === 0 && prog < 1 ? 'new' : 'focus') : 'old';
      if (prog <= 0) mode = 'hidden';
    }
  } else if (p.fixIndex !== undefined) {
    const f = m.fx[p.fixIndex];
    if (f) { pose = { pos: V3(f.x, f.y, f.z), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(f.rx || 0, 0, f.rz || 0)), s: V3(1, 1, 1) }; mode = st.focusSet.has(p.id) ? 'focus' : (st.ch < MD.CHAPTERS.length - 1 ? 'new' : 'normal'); }
  } else if (p.station) {
    if (m.station === p.station) { pose = homePose(p, m, 0); mode = 'normal'; }
  } else if (p.stAsm && m.station !== p.stAsm) {
    // rev. 3.39: pieza de una estación: oculta fuera de su escena
  } else if (only && !trk.length) {
    if (only.has(i)) { pose = homePose(p, m, 0); mode = 'normal'; }
  } else {
    let k = -1;
    for (let j = 0; j < trk.length; j++) if (trk[j].s <= i) k = j;
    if (k >= 0 && (!only || only.has(i))) {
      const e = trk[k];
      const resolve = en => en.pose === 'home' ? homePose(p, m, ui.explodeAmt) : { pos: en.pose.pos.clone(), q: en.pose.q.clone(), s: V3(1, 1, 1) };
      const target = resolve(e);
      if (e.s === i) {
        const prog = ease(clamp01((t - e.t0) / e.td));
        let from;
        if (k > 0) from = resolve(trk[k - 1]);
        else if (p.grow) { from = target; grow = clamp01((t - e.t0) / e.td); }
        else {
          const off = e.from || (e.pose === 'home' ? p.explode : V3(0, 0.3, 0));
          from = { pos: target.pos.clone().add(off), q: target.q.clone(), s: target.s.clone() };
        }
        if (k === 0 && t < e.t0) mode = 'hidden';
        else mode = 'new';
        pose = { pos: from.pos.clone().lerp(target.pos, prog), q: from.q.clone().slerp(target.q, prog), s: from.s.clone().lerp(target.s, prog) };
      } else {
        pose = target;
        mode = st.focusSet.has(p.id) ? 'focus' : (st.dimOld ? 'old' : 'normal');
      }
    }
  }
  if (st.explore && mode === 'new') mode = 'normal';
  if (mode !== 'hidden' && pose) { p.group.position.copy(pose.pos); p.group.quaternion.copy(pose.q); p.group.scale.copy(pose.s); }
  if (p.growGeo) { const n = p.growGeo.attributes.position.count; p.growGeo.setDrawRange(0, grow >= 1 ? Infinity : Math.max(3, Math.floor(n * grow / 3) * 3)); }
  const g = mode === 'hidden' ? 0 : ghostOf(p, st);
  if (mode !== 'hidden' && !g) {
    if (ui.insp) mode = ui.insp.pick === p.id ? 'pick' : (ui.insp.comp && ui.insp.comp.has(p.id)) ? 'focus' : 'normal';
    else if (st.iso && st.iso.hiS.has(p.id)) mode = 'hot';            // conserva su color real mientras aparece
  }
  p.gh = g;
  const xray = mode !== 'hidden' && (ui.insp ? (!!ui.insp.cab && ui.insp.id === p.id) || ui.insp.links.has(p.id) : !!st.iso && st.iso.hiS.has(p.id));
  setMode(p, mode, (mode === 'new' || mode === 'hot') ? Math.round(pulse * 8) / 8 : 0, g, xray);
  if (p.halo) {
    p.halo.visible = xray;
    if (xray) { const n = p.halo.geometry.attributes.position.count; p.halo.geometry.setDrawRange(0, grow >= 1 ? Infinity : Math.max(3, Math.floor(n * grow / 3) * 3)); p.halo.material.opacity = ui.insp && !ui.insp.cab ? 0.5 : 0.35 + 0.3 * pulse; }
  }
}

// ============================================================ INTERFAZ
const fmt = s => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const hex = m => '#' + new THREE.Color(MAT[m].c).getHexString();
function buildChapters() {
  $('chips').innerHTML = MD.CHAPTERS.map((c, k) => `<button class="chip" data-ch="${k}" type="button"><b>${c.n}</b><span>${c.name}</span></button>`).join('');
  $('chips').querySelectorAll('.chip').forEach(b => b.onclick = () => { const s = MD.STEPS.find(x => x.ch === +b.dataset.ch); goStep(s.i); });
  $('ticks').innerHTML = MD.STEPS.map((s, k) => `<i class="${k === 0 || MD.STEPS[k - 1].ch !== s.ch ? 'ch' : ''}" style="left:${(s.start / MD.TOTAL * 100).toFixed(3)}%"></i>`).join('');
  $('timeline').max = MD.TOTAL; $('timeline').step = 0.01;
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === MD.key));
  document.body.classList.toggle('explore', !!MD.STEPS[0].explore);
  buildCompList();
  $('modeNote').textContent = MD.key === 'x' ? 'Todo armado y quieto: clic en las piezas.' : MD.key === 'e' ? 'Solo componentes con cables y los cables, sin estructura.' : MD.key === 't' ? `${MD.STEPS.length} pasos: cada tornillo de cada sección (placas, suspensión, elevador, plataforma, empujador y sensores) con su medida y su tuerca. Se detiene al final de cada paso.` : MD.key === 'b' ? `${MD.STEPS.length} pasos: solo la placa — componentes, borneras y los ${WIRES.length} cables uno por uno. Se detiene al final de cada paso.` : MD.key === 'd' ? `${MD.STEPS.length} pasos: componentes, motores, cada tornillo y ${WIRES.length} cables uno por uno. Se detiene al final de cada paso.` : `${MD.STEPS.length} pasos: el armado completo de corrido.`;
  $('ttot').textContent = fmt(MD.TOTAL);
}
function setModeKey(key, keepChapter = true) {
  if (MODES[key] === MD) return;
  const chKey = keepChapter && ui.step >= 0 ? MD.CHAPTERS[MD.STEPS[ui.step].ch].key : null;
  for (const s of MD.STEPS) { s.labelObjs.forEach(o => { o.visible = false; scene.remove(o); }); s.dimObjs.forEach(d => { d.g.visible = false; d.lab.visible = false; scene.remove(d.g); d.lab.element.remove(); }); s._vis = false; }
  MD = MODES[key]; partsDirty = true; closeInspect();
  ui.pauseEach = key === 'd' || key === 'b' || key === 't'; $('tPause').checked = ui.pauseEach;
  if (MD.STEPS[0].explore) { ui.step = -1; ui.playing = false; ui.stopAt = null; syncPlay(); buildChapters(); goStep(0); flyTo(MD.STEPS[0].cam, false); buildIndex(); buildWireTable();
    try { localStorage.setItem('aether.mode', key); history.replaceState(null, '', '#' + ({ x: 'armado', e: 'electronica' })[key]); } catch (e) {}
    return; }
  try { localStorage.setItem('aether.mode', key); } catch (e) {}
  try { history.replaceState(null, '', key === 'd' ? '#detalle' : key === 'b' ? '#tablero' : key === 't' ? '#tornillos' : '#rapido'); } catch (e) {}
  buildChapters();
  const map = { elec: 'placa', placa: 'elec', cables: 'elec', pot: 'elec', carro: 'elec' };
  let k = chKey ? MD.CHAPTERS.findIndex(c => c.key === chKey) : 0;
  if (k < 0 && chKey) k = MD.CHAPTERS.findIndex(c => c.key === map[chKey]);
  const st = MD.STEPS.find(s => s.ch === Math.max(0, k));
  ui.step = -1; ui.playing = false; syncPlay();
  goStep(st.i);
  buildIndex(); buildWireTable();
}
function buildUI() {
  buildChapters();
  $('legend').innerHTML = Object.values(SUBS).map(s => `<li><i style="background:#${s.color.toString(16).padStart(6, '0')}"></i>${s.name}</li>`).join('');
  const codes = [['cRed', '12 V'], ['cOra', '5 V'], ['cPnk', '3.3 V'], ['cBlk', 'GND'], ['cGrn', 'STEP'], ['cBlu', 'DIR'], ['cBrn', 'ENABLE'], ['cGry', 'Bobina A'], ['cTeal', 'Bobina B'], ['cYel', 'SDA'], ['cWht', 'SCL'], ['cPur', 'RS485 lógica'], ['cLbl', 'RS485 A'], ['cLim', 'RS485 B'], ['cOli', 'XSHUT · medición'], ['cBei', 'Finales'], ['cMag', 'QTR · servo · LEDs'], ['cTin', 'Puente desnudo']];
  $('wireCodes').innerHTML = codes.map(([m, t]) => `<li><i style="background:${hex(m)}"></i>${t}</li>`).join('');
  $('supList').innerHTML = SUPUESTOS.map(([k, v]) => `<li><b>${k}.</b> ${v}</li>`).join('');
  const openDlg = id => { $(id).hidden = false; ui.playing = false; syncPlay(); };
  $('bSup').onclick = $('bSup2').onclick = () => openDlg('supDlg');
  $('bIdx').onclick = () => { openDlg('idxDlg'); buildIndex(); setTimeout(() => $('idxQ').focus(), 30); };
  $('bWt').onclick = () => { openDlg('wtDlg'); };
  document.querySelectorAll('.dlg').forEach(d => { d.onclick = e => { if (e.target === d) d.hidden = true; }; d.querySelector('.dclose').onclick = () => { d.hidden = true; }; });
  $('idxQ').oninput = () => buildIndex($('idxQ').value);
  $('bRestart').onclick = () => { $('endCard').hidden = true; seek(0, true); };
  $('bEndX').onclick = () => { ui.endX = true; $('endCard').hidden = true; };
  $('bPlay').onclick = () => {
    if (ui.T >= MD.TOTAL - 0.01) seek(0, true);
    const i = stepAt(ui.T), st = MD.STEPS[i];
    ui.stopAt = null;
    if (!ui.playing && ui.T >= st.start + st.dur - 0.02 && i < MD.STEPS.length - 1) seek(MD.STEPS[i + 1].start + 0.001, true);
    ui.playing = !ui.playing; if (ui.playing) closeInspect(); syncPlay();
  };
  $('bPrev').onclick = () => { const i = stepAt(ui.T); const t = ui.T - MD.STEPS[i].start; goStep(t > 1.2 || i === 0 ? i : i - 1); };
  $('bNext').onclick = () => { const i = stepAt(ui.T); if (i < MD.STEPS.length - 1) goStep(i + 1); else seek(MD.TOTAL, true); };
  const tlEl = $('timeline');
  tlEl.addEventListener('input', () => { ui.playing = false; ui.stopAt = null; syncPlay(); seek(+tlEl.value, false); });
  document.querySelectorAll('[data-speed]').forEach(b => b.onclick = () => { ui.speed = +b.dataset.speed; document.querySelectorAll('[data-speed]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => setModeKey(b.dataset.mode));
  const tog = (id, key) => { const el = $(id); el.checked = ui[key]; el.onchange = () => { ui[key] = el.checked; partsDirty = true; }; };
  tog('tLabels', 'labels'); tog('tDims', 'dims'); tog('tExplode', 'explode'); tog('tTransp', 'transp'); tog('tPause', 'pauseEach');
  $('sheetHead').onclick = () => { const open = document.body.classList.toggle('sheet-open'); $('sheetHead').setAttribute('aria-expanded', open); setTimeout(resize, 260); };
  $('inspClose').onclick = closeInspect;
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { if (e.code === 'Escape') e.target.closest('.dlg').hidden = true; return; }
    if (e.code === 'Space') { e.preventDefault(); $('bPlay').click(); }
    if (e.code === 'ArrowRight') $('bNext').click();
    if (e.code === 'ArrowLeft') $('bPrev').click();
    if (e.code === 'KeyI') $('bIdx').click();
    if (e.code === 'Escape') { const open = [...document.querySelectorAll('.dlg')].filter(d => !d.hidden); if (open.length) open.forEach(d => d.hidden = true); else closeInspect(); }
  });
  initPicking();
}
// ir a un paso: se reproduce ese paso completo (las piezas y el cable aparecen) y se detiene al final
function goStep(i) {
  const st = MD.STEPS[i];
  if (st.explore) { seek(st.start + st.dur - 0.001, true); return; }
  seek(st.start + 0.001, true);
  if (!ui.playing || ui.stopAt != null) { ui.playing = true; ui.stopAt = st.start + st.dur - 0.002; syncPlay(); }
}
function syncPlay() {
  $('bPlay').setAttribute('aria-label', ui.playing ? 'Pausa' : 'Reproducir');
  $('bPlay').classList.toggle('playing', ui.playing);
}
function seek(T, fly) {
  ui.T = Math.max(0, Math.min(MD.TOTAL, T));
  const i = stepAt(ui.T);
  if (i !== ui.step) { showStep(i); if (!ui.insp) flyTo(MD.STEPS[i].cam, false); ui.userCam = false; }
  const atEnd = ui.T >= MD.TOTAL - 0.005 && MD.key !== 'x';   // "Carrito armado" no es una guía: sin aviso de fin
  if (!atEnd) ui.endX = false;   // al salir del final, el aviso vuelve a salir la próxima vez
  $('endCard').hidden = !atEnd || ui.endX;
}
function showStep(i) {
  ui.step = i; const st = MD.STEPS[i];
  $('etapa').textContent = st.et;
  $('stepn').textContent = `Paso ${i + 1} de ${MD.STEPS.length}`;
  $('title').textContent = st.title;
  $('sheetTitle').textContent = `${st.et} · ${st.title}`;
  const T = st.txt;
  $('t-que').textContent = T.que; $('t-porque').textContent = T.porque;
  $('t-herr').textContent = T.herr; $('row-herr').hidden = !T.herr || T.herr === '—';
  $('t-check').textContent = T.check; $('t-error').textContent = T.error;
  document.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-current', +b.dataset.ch === st.ch ? 'step' : 'false'));
  const cur = document.querySelector('.chip[aria-current="step"]'); if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  $('vEtapa').textContent = st.et; $('vTitle').textContent = st.title;
  const w = st.wire;
  $('vWire').hidden = !w && !st.cable;
  if (w) $('vWire').innerHTML = `<i style="background:${hex(w.mat)}"></i>Cable ${w.n} de ${WIRES.length} · ${esc(w.color)} · ~${Math.max(2, Math.round(w.len / 10))} cm`;
  else if (st.cable) $('vWire').innerHTML = `<i style="background:${hex(st.cable.mat)}"></i>${esc(st.cable.gauge)} · ${esc(st.cable.color)}`;
  $('vWarn').hidden = !st.warn;
  const ai = document.querySelector('#idxList [aria-current="step"]'); if (ai) ai.removeAttribute('aria-current');
  const ni = document.querySelector(`#idxList [data-step="${i}"]`); if (ni) ni.setAttribute('aria-current', 'step');
}

// ---------- lista de componentes (modos de exploración)
function buildCompList() {
  const st = MD.STEPS[0];
  if (!st.explore) { $('compList').hidden = true; return; }
  const ids = new Set(exploreIds(st.explore));
  const groups = new Map();
  for (const [key, c] of Object.entries(COMP)) {
    const here = c.inst.filter(it => it.ids.some(id => ids.has(id)));
    if (!here.length) continue;
    const sub = PARTS.get(here[0].ids[0]).sub;
    if (!groups.has(sub)) groups.set(sub, []);
    groups.get(sub).push({ c, id: here[0].ids[0], n: here.length });
  }
  let html = '<h3 class="ih">Componentes</h3>';
  for (const [sub, list] of groups) {
    html += `<p class="clh"><i style="background:#${SUBS[sub].color.toString(16).padStart(6, '0')}"></i>${esc(SUBS[sub].name)}</p><div class="cl">`;
    html += list.map(({ c, id, n }) => `<button type="button" data-insp="${id}">${esc(c.name)}${n > 1 ? ` <small>×${n}</small>` : ''}</button>`).join('');
    html += '</div>';
  }
  const cab = CABLES.filter(c => ids.has(c.id));
  html += `<p class="clh"><i style="background:${hex('cRed')}"></i>Cables</p><div class="cl">` + cab.map(c => `<button type="button" data-insp="${c.id}">${esc(c.name)}</button>`).join('') +
    `<button type="button" data-wt="1">Los ${WIRES.length} cables de la placa (tabla)</button></div>`;
  $('compList').innerHTML = html; $('compList').hidden = false;
  $('compList').querySelectorAll('[data-insp]').forEach(b => b.onclick = () => inspect(b.dataset.insp));
  $('compList').querySelector('[data-wt]').onclick = () => $('bWt').click();
}
// ---------- índice de pasos y tabla de cables
function buildIndex(q = '') {
  q = q.trim().toLowerCase();
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const nq = norm(q);
  let html = '';
  MD.CHAPTERS.forEach((c, k) => {
    const items = MD.STEPS.filter(s => s.ch === k && (!nq || norm(s.title + ' ' + s.et + ' ' + s.txt.que).includes(nq)));
    if (!items.length) return;
    html += `<li class="ich"><b>${esc(c.n)}</b> ${esc(c.name)} <small>${items.length} paso${items.length > 1 ? 's' : ''}</small></li>`;
    for (const s of items) html += `<li><button type="button" data-step="${s.i}"${s.i === ui.step ? ' aria-current="step"' : ''}><span class="n">${s.i + 1}</span>${s.wire ? `<i style="background:${hex(s.wire.mat)}"></i>` : ''}${esc(s.title)}</button></li>`;
  });
  $('idxList').innerHTML = html || '<li class="empty">Nada coincide con la búsqueda.</li>';
  $('idxList').querySelectorAll('[data-step]').forEach(b => b.onclick = () => { $('idxDlg').hidden = true; closeInspect(); goStep(+b.dataset.step); });
}
function stepOfPart(id) { const t = curTrack(PARTS.get(id)); return t.length ? MD.STEPS[t[0].s] : null; }
function goToPart(id, inspectIt) {
  const st = MD.STEPS.find(s => (s.wire && s.wire.id === id) || (s.cable && s.cable.id === id)) || stepOfPart(id);
  if (!st) return;
  closeInspect();
  if (st.wire || st.cable) goStep(st.i); else seek(st.start + st.dur - 0.05, true);
  if (MD.key === 'r' && inspectIt) setTimeout(() => inspect(id), 60);
}
function buildWireTable() {
  const row = (n, mat, a, aw, b, bw, len, id) => `<tr data-id="${id}"><td class="n">${n}</td><td><i style="background:${hex(mat)}"></i></td><td><b>${esc(a)}</b><small>${esc(aw)}</small></td><td><b>${esc(b)}</b><small>${esc(bw)}</small></td><td class="n">${len}</td></tr>`;
  let html = '';
  for (const g of [...new Set(WIRES.map(w => w.group))]) {
    html += `<tbody><tr class="grp"><th colspan="5">${esc(g)}</th></tr>`;
    for (const w of WIRES.filter(x => x.group === g)) html += row(w.n, w.mat, PIN[w.from].name, PIN[w.from].where, PIN[w.to].name, PIN[w.to].where, w.bridge ? 'puente' : `~${Math.max(2, Math.round(w.len / 10))} cm`, w.id);
    html += '</tbody>';
  }
  html += `<tbody><tr class="grp"><th colspan="5">Potencia en la bandeja</th></tr>`;
  CABLES.filter(c => c.tray).forEach((c, k) => html += row('P' + (k + 1), c.mat, c.fromName, '', c.toName, '', c.gauge, c.id));
  html += `</tbody><tbody><tr class="grp"><th colspan="5">Cables del carrito</th></tr>`;
  CABLES.filter(c => !c.tray).forEach((c, k) => html += row('C' + (k + 1), c.mat, c.ends[0], '', c.ends[1], c.cond.map(x => x[0] + ': ' + x[1]).join(' · '), c.gauge, c.id));
  $('wtBody').innerHTML = html + '</tbody>';
  $('wtBody').querySelectorAll('tr[data-id]').forEach(tr => tr.onclick = () => { $('wtDlg').hidden = true; goToPart(tr.dataset.id, true); });
  $('wtNote').textContent = MD.key === 'd' || MD.key === 'b' ? 'Toca un renglón para ir a su paso.' : 'Toca un renglón para verlo aislado (en el modo súper explicativo, cada cable tiene su propio paso).';
}

// ============================================================ CLIC EN UNA PIEZA → FICHA
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function visibleChain(o) { for (; o; o = o.parent) if (!o.visible) return false; return true; }
function pickAt(cx, cy) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects([cartRoot, worldRoot], true);
  const found = [];
  for (const h of hits) {
    if (!visibleChain(h.object)) continue;
    let o = h.object; while (o && !o.userData.pid) o = o.parent;
    if (!o) continue;
    const p = PARTS.get(o.userData.pid); if (p && !found.includes(p)) found.push(p);
  }
  // prioridad: lo que se ve normal → lo semitransparente → lo fantasma
  return (found.find(p => !p.gh) || found.find(p => p.gh >= 0.3) || found[0] || {}).id || null;
}
function cableInfo(id) { return WIRES.find(w => w.id === id) || CABLES.find(c => c.id === id); }
function inspect(id) {
  const p = PARTS.get(id); if (!p) return;
  const cab = cableInfo(id);
  let set, soft = new Set(['perf', 'tray', 'mesa', 'sockets']);
  if (cab) {
    const ends = cab.from ? [endPart(cab.from), endPart(cab.to)] : (CAB_PARTS[id] || []);
    set = new Set([id, ...ends]);
  }
  ui.insp = { id, pick: id, set, soft, cab, links: new Set() };
  if (!cab) isoFor(ui.insp);
  ui.playing = false; ui.stopAt = null; syncPlay(); partsDirty = true;
  renderInspect();
  flyToSet(focusIds(ui.insp), true);
  document.body.classList.add('inspecting');
  if (isPhone() && !document.body.classList.contains('sheet-open')) $('sheetHead').click();
  $('panelBody').scrollTop = 0;
}
// lo que se ve al seleccionar: todas las piezas de ese tipo + los cables de la elegida + lo que está al otro lado de esos cables
function linksOf(pid) {
  const links = new Set(), ends = new Set();
  for (const cb of CABLES) { const e = cb.tray ? [endPart(cb.from), endPart(cb.to)] : (CAB_PARTS[cb.id] || []); if (e.includes(pid)) { links.add(cb.id); e.forEach(x => ends.add(x)); } }
  for (const w of WIRES) { const a = PIN[w.from].part, b = PIN[w.to].part; if (a === pid || b === pid) { links.add(w.id); ends.add(a); ends.add(b); } }
  return { links, ends };
}
function isoFor(I) {
  const c = compOf(I.id), inst = c ? c.inst.flatMap(x => x.ids) : [I.id];
  const { links, ends } = linksOf(I.pick);
  I.comp = new Set(inst); I.links = links;
  I.set = new Set([...inst, ...links, ...ends]);
}
function focusIds(I) {                // cámara: la pieza elegida, sus cables y lo que está al otro lado (no las demás iguales)
  if (I.cab) return [...I.set];
  const { links, ends } = linksOf(I.pick);
  return [I.pick, ...links, ...ends];
}
function closeInspect() {
  if (!ui.insp) return;
  ui.insp = null; partsDirty = true; $('insp').hidden = true; TAGS.forEach(t => { t.visible = false; scene.remove(t); });
  document.body.classList.remove('inspecting');
}
const TAGS = [];
function tagAt(k, title, sub, pos, right = false) {
  if (!TAGS[k]) TAGS[k] = makeLabel('', '', 'pick');
  const o = TAGS[k];
  o.element.className = 'tag3d pick' + (right ? ' right' : '');
  o.element.querySelector('b').textContent = title;
  let sm = o.element.querySelector('small');
  if (!sm) { sm = document.createElement('small'); o.element.querySelector('.tag-box').appendChild(sm); }
  sm.textContent = sub || ''; sm.hidden = !sub;
  o.position.copy(pos); o.visible = true; o.element.style.opacity = 1; if (!o.parent) scene.add(o);
}
function partPoint(id, homePos) {          // punto dado en coordenadas "home" del carrito → mundo, siguiendo la pieza
  const p = PARTS.get(id); p.group.updateWorldMatrix(true, false);
  return homePos.clone().sub(p.home).applyMatrix4(p.group.matrixWorld);
}
function partTop(id) { const b = new THREE.Box3().setFromObject(PARTS.get(id).group); const c = b.getCenter(V3()); c.y = b.max.y; return c; }
function flyToSet(ids, wide) {
  const B = new THREE.Box3();
  for (const id of ids) { const g = PARTS.get(id).group; if (visibleChain(g)) B.union(new THREE.Box3().setFromObject(g)); }
  if (B.isEmpty()) return;
  const c = B.getCenter(V3()), r = Math.max(0.03, B.getSize(V3()).length() * (wide ? 0.62 : 0.7));
  const dir = camera.position.clone().sub(controls.target).normalize();
  Object.assign(camTween, { active: true, t: 0 });
  camTween.p0.copy(camera.position); camTween.t0.copy(controls.target);
  camTween.t1.copy(c); camTween.p1.copy(c).addScaledVector(dir, fitDistance(r));
}
function pinRows(part) {
  const pins = pinsOf(part);
  if (!pins.length) return '';
  const rows = pins.map(pn => {
    const ws = WIRES.filter(w => w.from === pn.key || w.to === pn.key);
    const cs = CABLES.filter(c => c.tray && (c.from === pn.key || c.to === pn.key));
    const links = ws.map(w => { const o = PIN[w.from === pn.key ? w.to : w.from]; return `<button type="button" class="wl" data-go="${w.id}"><i style="background:${hex(w.mat)}"></i>${esc(o.name)}<small>cable ${w.n}</small></button>`; })
      .concat(cs.map(c => `<button type="button" class="wl" data-go="${c.id}"><i style="background:${hex(c.mat)}"></i>${esc(c.from === pn.key ? c.toName : c.fromName)}<small>${esc(c.gauge)}</small></button>`));
    return `<tr><th>${esc(pn.name.replace(/^.* · /, ''))}</th><td>${links.join('') || '<span class="free">libre</span>'}</td></tr>`;
  });
  return `<table class="pins"><tbody>${rows.join('')}</tbody></table>`;
}
function espPinout() {
  const use = key => { const ws = WIRES.filter(w => w.from === key || w.to === key); if (!ws.length) return ''; const w = ws[0]; return PIN[w.from === key ? w.to : w.from].name.replace(/ · /, ' '); };
  let html = '<div class="pinout"><div class="ph">Fila del lado de los A4988</div><div class="ph">Fila del lado del MAX485</div>';
  for (let k = 0; k < 19; k++) {
    const lk = ESP_L[k] === 'GND' ? 'E.GNDL' : 'E.' + ESP_L[k], rk = ESP_R[k] === 'GND' ? (k === 0 ? 'E.GND1' : 'E.GND2') : 'E.' + ESP_R[k];
    const cell = (key, n) => { const u = use(key); return `<div class="pc${u ? ' used' : ''}"><b>${esc(gpioName(n))}</b><small>${esc(u || '—')}</small></div>`; };
    html += cell(lk, ESP_L[k]) + cell(rk, ESP_R[k]);
  }
  return html + '<div class="pfoot">Arriba: extremo de la antena · abajo: el USB</div></div>';
}
function renderInspect() {
  const I = ui.insp, box = $('insp');
  box.hidden = false;
  TAGS.forEach(t => { t.visible = false; scene.remove(t); });
  if (I.cab) {
    const c = I.cab, isW = !!c.n;
    const A = isW ? PIN[c.from] : null, B = isW ? PIN[c.to] : null;
    $('inspKind').textContent = isW ? `Cable ${c.n} de ${WIRES.length} · placa` : (c.tray ? 'Cable de potencia · bandeja' : 'Cable del carrito');
    $('inspName').textContent = isW ? c.short : c.name;
    $('inspQty').textContent = isW ? (c.bridge ? 'puente' : `~${Math.max(2, Math.round(c.len / 10))} cm`) : c.gauge;
    let html = `<dl class="idl"><div><dt>Color</dt><dd><i class="sw" style="background:${hex(c.mat)}"></i>${esc(c.color || '—')}${isW && !c.bridge ? ' · cable 22 AWG' : ''}</dd></div>`;
    if (isW) html += `<div><dt>Sale de</dt><dd><b>${esc(A.name)}</b><br><small>${esc(A.where)}</small></dd></div><div><dt>Llega a</dt><dd><b>${esc(B.name)}</b><br><small>${esc(B.where)}</small></dd></div><div><dt>Grupo</dt><dd>${esc(c.group)}</dd></div>`;
    else if (c.tray) html += `<div><dt>De</dt><dd>${esc(c.fromName)}</dd></div><div><dt>A</dt><dd>${esc(c.toName)}</dd></div>`;
    else html += `<div><dt>De</dt><dd>${esc(c.ends[0])}</dd></div><div><dt>A</dt><dd>${esc(c.ends[1])}</dd></div><div><dt>Hilo por hilo</dt><dd><ul class="cond">${c.cond.map(([k, v]) => `<li><b>${esc(k)}</b> ${esc(v)}</li>`).join('')}</ul></dd></div>`;
    html += `<div><dt>Para qué</dt><dd>${esc(c.why)}</dd></div></dl>`;
    if (!MD.STEPS[0].explore) html += `<button type="button" class="linkbtn" data-goto="${c.id || ''}">${MD.key === 'd' || MD.key === 'b' ? 'Ir a su paso' : 'Ir al paso donde se pone'}</button>`;
    $('inspBody').innerHTML = html;
    if (isW) { tagAt(0, A.name, A.where, partPoint(c.id, A.pos)); tagAt(1, B.name, B.where, partPoint(c.id, B.pos), true); }
  } else {
    const c = compOf(I.id) || { name: PARTS.get(I.id).name, qty: '', fn: '', mount: '', specs: [], inst: [{ ids: [I.id], name: PARTS.get(I.id).name }] };
    const multi = c.inst.length > 1;
    $('inspKind').textContent = SUBS[PARTS.get(I.id).sub].name;
    $('inspName').textContent = c.name;
    $('inspQty').textContent = c.qty ? '× ' + c.qty : '';
    let html = `<dl class="idl"><div><dt>Para qué sirve</dt><dd>${esc(c.fn)}</dd></div><div><dt>Cómo se monta y se conecta</dt><dd>${esc(c.mount)}</dd></div>`;
    if (c.specs && c.specs.length) html += `<div><dt>Datos</dt><dd>${c.specs.map(esc).join(' · ')}</dd></div>`;
    if (c.check && c.check !== '—') html += `<div class="box ok"><dt>Comprobación</dt><dd>${esc(c.check)}</dd></div>`;
    if (c.err && c.err !== '—') html += `<div class="box warn"><dt>Error común</dt><dd>${esc(c.err)}</dd></div>`;
    html += '</dl>';
    if (c.pinout) html += `<h3 class="ih">Pinout y qué va en cada pin</h3>${espPinout()}`;
    if (multi) html += `<h3 class="ih">Cada una por separado (${c.inst.length})</h3>`;
    c.inst.forEach((it, k) => {
      const id0 = it.ids[0], open = !multi || it.ids.includes(I.pick);
      const rows = pinRows(id0);
      let body = [it.fn && multi ? `<p><b>Para qué:</b> ${esc(it.fn)}</p>` : '', it.mount && multi ? `<p><b>Conexión:</b> ${esc(it.mount)}</p>` : '', it.tag && multi ? `<p class="tg">${esc(it.tag)}</p>` : '', it.note ? `<p>${esc(it.note)}</p>` : '',
        it.check && multi ? `<p><b>Comprobación:</b> ${esc(it.check)}</p>` : '', rows ? `<p class="ph2">Pin por pin</p>${rows}` : '', J_NOTE[id0] && !it.note ? `<p>${esc(J_NOTE[id0])}</p>` : ''].join('');
      const cabs = CABLES.filter(cb => (CAB_PARTS[cb.id] || []).includes(id0) || (cb.tray && (endPart(cb.from) === id0 || endPart(cb.to) === id0)));
      const nw = WIRES.filter(w => PIN[w.from].part === id0 || PIN[w.to].part === id0).length;
      const cabHtml = cabs.length ? `<p class="ph2">Cables conectados (${cabs.length})</p>` + cabs.map(cb => `<button type="button" class="wl" data-go="${cb.id}"><i style="background:${hex(cb.mat)}"></i>${esc(cb.name)}<small>${esc(cb.gauge)}</small></button>`).join('') : '';
      const noCab = !cabs.length && !nw && !rows && (PARTS.get(id0).sub === 'elec' || EXPLORE_EXTRA.includes(id0)) ? '<p class="free">Sin cables conectados directamente.</p>' : '';
      body += cabHtml + noCab;
      html += `<section class="inst${it.ids.includes(I.pick) ? ' cur' : ''}" data-inst="${k}">` + (multi ? `<button type="button" class="ihead" data-pick="${id0}"><span class="num">${k + 1}</span>${esc(it.name)}</button>` : '') + (open || body.length < 400 ? `<div class="ibody">${body}</div>` : `<div class="ibody" hidden>${body}</div>`) + '</section>';
      if (multi || c.inst.length === 1) { const g = PARTS.get(id0).group; if (visibleChain(g)) tagAt(k, multi ? `${k + 1} · ${it.name}` : c.name, multi ? (it.tag || '') : '', partTop(id0)); }
    });
    const st = stepOfPart(I.id);
    if (st && !st.explore) html += `<button type="button" class="linkbtn" data-goto="${I.id}">Ir al paso donde se monta (${st.i + 1})</button>`;
    $('inspBody').innerHTML = html;
  }
  $('inspBody').querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    I.pick = b.dataset.pick; isoFor(I); partsDirty = true;
    $('inspBody').querySelectorAll('.inst').forEach(s => { const cur = s.querySelector('[data-pick]') === b; s.classList.toggle('cur', cur); const bd = s.querySelector('.ibody'); if (cur) bd.hidden = false; });
    flyToSet(focusIds(I), true);
  });
  $('inspBody').querySelectorAll('[data-go]').forEach(b => b.onclick = () => { if (MD.key === 'd' || MD.key === 'b') goToPart(b.dataset.go); else inspect(b.dataset.go); });
  $('inspBody').querySelectorAll('[data-goto]').forEach(b => b.onclick = () => goToPart(b.dataset.goto));
}
let tipT = 0;
function initPicking() {
  const el = renderer.domElement;
  let down = null;
  el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  el.addEventListener('pointerup', e => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
    if (moved > 6 || dt > 500 || e.button !== 0) return;
    const id = pickAt(e.clientX, e.clientY);
    if (id) inspect(id); else closeInspect();
  });
  el.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || down) { $('tip').hidden = true; return; }
    const now = performance.now(); if (now - tipT < 70) return; tipT = now;
    const id = pickAt(e.clientX, e.clientY);
    el.style.cursor = id ? 'pointer' : '';
    if (!id) { $('tip').hidden = true; return; }
    const c = compOf(id), it = instOf(id), cab = cableInfo(id);
    $('tip').textContent = cab ? (cab.short ? `Cable ${cab.n}: ${cab.short}` : cab.name) : c ? (c.inst.length > 1 ? `${c.name} · ${it.name}` : (it.title || c.name)) : PARTS.get(id).name;
    const r = viewEl.getBoundingClientRect();
    $('tip').style.left = (e.clientX - r.left + 14) + 'px'; $('tip').style.top = (e.clientY - r.top + 12) + 'px';
    $('tip').hidden = false;
  });
  el.addEventListener('pointerleave', () => { $('tip').hidden = true; });
}

// ============================================================ BUCLE
function resize() {
  const w = viewEl.clientWidth, h = viewEl.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false); labelRenderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewEl);
const clock = new THREE.Clock();
let uiTick = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (ui.playing) {
    const i0 = stepAt(ui.T), st0 = MD.STEPS[i0], end = st0.start + st0.dur - 0.002;
    if (ui.stopAt != null && (ui.stopAt < st0.start - 0.01 || ui.stopAt > end + 0.01)) ui.stopAt = null;   // se saltó a otro paso
    let T = ui.T + dt * ui.speed;
    if ((ui.pauseEach && T >= end && ui.T < end) || (ui.stopAt != null && T >= ui.stopAt)) { T = Math.min(T, ui.stopAt ?? end, end); ui.playing = false; ui.stopAt = null; syncPlay(); }
    seek(T, false);
    if (ui.T >= MD.TOTAL) { ui.playing = false; syncPlay(); }
  }
  ui.explodeAmt += ((ui.explode ? 1 : 0) - ui.explodeAmt) * Math.min(1, dt * 6);
  if (Math.abs(ui.explodeAmt - (ui.explode ? 1 : 0)) < 0.002) ui.explodeAmt = ui.explode ? 1 : 0;
  const { i, t } = applyAt(ui.T, dt);
  if (camTween.active) {
    camTween.t += dt / camTween.dur; const k = ease(clamp01(camTween.t));
    camera.position.lerpVectors(camTween.p0, camTween.p1, k); controls.target.lerpVectors(camTween.t0, camTween.t1, k);
    if (camTween.t >= 1) camTween.active = false;
  }
  controls.update();
  grid.visible = camera.position.y > 0;   // desde abajo no estorba la cuadrícula
  if ((uiTick = (uiTick + 1) % 4) === 0) {
    $('timeline').value = ui.T;
    $('tcur').textContent = fmt(ui.T);
    $('progbar').style.width = (ui.T / MD.TOTAL * 100).toFixed(2) + '%';
    $('vStepBar').style.width = (clamp01(t / MD.STEPS[i].dur) * 100).toFixed(1) + '%';
    if (ui.insp && ui.insp.cab && ui.insp.cab.n) { /* las etiquetas de las puntas ya están puestas */ }
  }
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ============================================================ REVISIÓN DE CHOQUES (consola: __aether.checkGeometry())
// Compara las cajas de cada primitiva en su posición final; ignora pares que encajan a propósito (nest).
const PF_SET = new Set(PF.map(f => f.id));
function nests(p, q) {
  const ok = (a, b) => a.nest.some(n => n === '*' || n === b.id || (n === '*pf' && PF_SET.has(b.id)) || (n === 'fx*' && b.fixIndex !== undefined));
  return ok(p, q) || ok(q, p);
}
function checkGeometry(m = M0(), tol = 0.0004) {
  const items = [];
  for (const p of PARTS.values()) {
    if (p.noCheck || p.world || p.inv || !p.prims || p.station) continue;
    let M;
    if (p.fixIndex !== undefined) { const f = m.fx[p.fixIndex]; if (!f) continue; M = T4(f.x, f.y, f.z).multiply(new THREE.Matrix4().makeRotationZ(f.rz || 0)); }
    else M = mountMatrix(p, m);
    for (const b of p.prims) { const bx = b.clone().applyMatrix4(M); bx.expandByScalar(-tol); if (!bx.isEmpty()) items.push({ p, bx }); }
  }
  const hits = new Map();
  for (let a = 0; a < items.length; a++) for (let c = a + 1; c < items.length; c++) {
    const A = items[a], B = items[c];
    if (A.p === B.p || !A.bx.intersectsBox(B.bx) || nests(A.p, B.p)) continue;
    const I = A.bx.clone().intersect(B.bx), s = I.getSize(V3());
    const key = [A.p.id, B.p.id].sort().join(' × ');
    const v = s.x * s.y * s.z * 1e9;
    if (!hits.has(key) || hits.get(key).mm3 < v) hits.set(key, { mm3: v, at: I.getCenter(V3()).toArray().map(n => +n.toFixed(3)), size: s.toArray().map(n => +(n * 1000).toFixed(1)) });
  }
  return [...hits.entries()].map(([k, v]) => ({ pair: k, ...v })).sort((a, b) => b.mm3 - a.mm3);
}

// ============================================================ ARRANQUE
readTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTheme);
new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
{
  let k = 'r';
  try { k = localStorage.getItem('aether.mode') === 'd' ? 'd' : 'r'; } catch (e) {}
  if (/detalle|explicativo/.test(location.hash)) k = 'd';
  if (/rapido/.test(location.hash)) k = 'r';
  if (/armado/.test(location.hash)) k = 'x';
  if (/electronica/.test(location.hash)) k = 'e';
  if (/tablero/.test(location.hash)) k = 'b';
  if (/tornillo/.test(location.hash)) k = 't';
  try { const m = localStorage.getItem('aether.mode'); if (!location.hash && MODES[m]) k = m; } catch (e) {}
  MD = MODES[k]; ui.pauseEach = k === 'd' || k === 'b' || k === 't';
}
buildUI();
buildIndex(); buildWireTable();
resize();
if (MD.STEPS[0].explore) seek(MD.STEPS[0].dur - 0.001, false); else seek(0, false);
flyTo(MD.STEPS[0].cam, true);
syncPlay();
document.body.classList.add('ready');
requestAnimationFrame(frame);

// ============================================================ LUMINA (dashboard): lo que la guía no trae
const LIMPIO = document.documentElement.classList.contains('limpio');
const marca = (id, v) => { const el = $(id); if (el) el.checked = v; };
function showAssembled() {
  setModeKey('x');                                   // "Carrito armado": un solo paso, el carrito terminado
  ui.playing = false; ui.explode = false; ui.transp = false; ui.labels = false; ui.dims = false;
  ['tExplode', 'tTransp', 'tLabels', 'tDims'].forEach((id) => marca(id, false));
  partsDirty = true;
  ui.userCam = false;
  const c = MD.STEPS[0].cam;
  flyTo(LIMPIO ? { ...c, r: c.r * 0.72 } : c, false);       // en la proyección el carrito llena más la pantalla
  $('vEtapa').textContent = 'Lumina';
  $('vTitle').textContent = 'Así estoy armada';
}
// Capítulo "Funcionamiento" (12 pasos animados): las diapositivas piden un paso por postMessage y se reproduce completo.
const OPMODE = new URLSearchParams(location.search).get('op') === '1';
if (OPMODE) document.documentElement.classList.add('op');
function showOp(k) {
  if (MD.key !== 'r') setModeKey('r', false);
  const ops = MD.STEPS.filter((s) => MD.CHAPTERS[s.ch].key === 'op');
  const st = ops[Math.max(0, Math.min(ops.length - 1, k))];
  ['tLabels', 'tDims', 'tExplode', 'tTransp'].forEach((id) => marca(id, false));
  ui.labels = false; ui.dims = false; ui.explode = false; ui.transp = false; ui.endX = true; partsDirty = true;
  ui.stopAt = null; ui.userCam = false;
  goStep(st.i);
}
addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.type === 'aether-op') showOp(e.data.step | 0); });
let revealTimers = [];
function revealInterior() {
  revealTimers.forEach(clearTimeout);
  showAssembled();
  flyTo(MD.STEPS[0].cam, false);                       // desarmado ocupa más: se aleja la cámara
  $('vEtapa').textContent = 'Interior';
  $('vTitle').textContent = 'La estructura se vuelve transparente';
  revealTimers = [
    setTimeout(() => { ui.transp = true; marca('tTransp', true); partsDirty = true; }, 900),
    setTimeout(() => { ui.explode = true; marca('tExplode', true); partsDirty = true; $('vTitle').textContent = 'Capa por capa'; }, 3300),
  ];
}

window.__aether = { showAssembled, revealInterior, get STEPS() { return MD.STEPS; }, mountMatrix, setMech: o => { MECH_OVERRIDE = o; }, MODES, setModeKey, PARTS, D, PIN, WIRES, CABLES, COMP, applyAt, seek, ui, TOTAL: () => MD.TOTAL, mechAt, homePose, camera, controls, renderer, scene, cartRoot, checkGeometry, M0, pileSet, inspect, closeInspect, finishCam: () => { if (camTween.active) { camTween.t = 1; camera.position.copy(camTween.p1); controls.target.copy(camTween.t1); camTween.active = false; } } };


// ?limpio=1: sin cotas ni etiquetas, el piso se pierde en la oscuridad y arranca en el carrito armado.
if (LIMPIO) { ui.labels = false; ui.dims = false; scene.fog.near = OPMODE ? 14 : 2.5; scene.fog.far = OPMODE ? 40 : 6; }
if (OPMODE) showOp(0);
else if (LIMPIO || new URLSearchParams(location.search).get('pose') === 'armada') showAssembled();
