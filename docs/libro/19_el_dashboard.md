# Capítulo 19: El panel de Aether

*La cara web del proyecto: sus páginas, su sistema de diseño, su cargador, su pantalla de la celda y las reglas de honestidad que se aplican hasta en los colores.*

## Un panel que prefiere decir "pendiente" a mentir

Entre los detalles más finos del panel de Aether está un color. El sistema de diseño define un **ámbar** (`#FFC14D`) cuyo uso se restringe, por escrito, a cuatro casos: *"sin identificar, pendiente de hardware, retirar producto, errores de formulario. Nunca decorativo."* Y las tarjetas de módulos **pendientes de hardware** nunca llevan las esquinas de mira que identifican lo activo: llevan un **borde punteado ámbar**. Con eso, un visitante distingue **de un vistazo** lo que funciona de lo que todavía es plan, sin leer una palabra. Es el principio de honestidad de producto llevado al diseño.

## Las páginas

El panel (`dashboard/`) es un conjunto de páginas HTML servidas por el mismo servidor (capítulo 11). Qué hace cada una:

| Página | Qué muestra | Notas |
|---|---|---|
| **Portada** (`index.html`) | Titular, simulación "De la banda a la mesa", la vista **"Pieza por pieza"** del robot, percepción en vivo, **módulos del sistema** (con su estado), línea de manufactura, arquitectura y alianzas | Se abre con un **cargador** y un campo animado de nodos 3D |
| **Inventario** (`inventory.html`) | La tabla del inventario declarado, el historial de inspecciones, el control de auto-refresh y el diálogo de retirar | Muestra el estado de cobertura **con su explicación visible** |
| **Celda** (`celda.html`) | Video de la cámara de línea, estado, contadores, últimas piezas, alarmas y Arranque/Paro | La sirve la Pi en la celda real |
| **Lumina** (`robot.html`) | La cara, subtítulos, cámara y llamadas | Sin cargador a propósito: arranca negra hasta la voz |
| **Dataset** (`dataset.html`) | Subir fotos, dibujar cajas, ver conteos y el modelo activo | Alimenta el entrenamiento (capítulo 14) |
| **Armado** (`armado.html`) | La hoja de armado 3D del carrito | Capítulo 3 |
| **Holo** (`holo.html`) | Vista holográfica del carrito | Elemento de presentación |

La portada además documenta, en una sección del propio sitio, algo que el equipo decidió no ocultar: el **diseño conceptual** del robot ("Pieza por pieza") está rotulado en la página **como diseño beta, no como el modelo mecánico**, y cada una de sus cinco capas (percepción, cómputo, control, energía, tracción) lleva **el estado real de su decisión**.

## El sistema de diseño

Un **sistema de diseño** es un conjunto de reglas que se repiten en todas las páginas para que se vean coherentes. El de Aether (`.interface-design/system.md`) tiene un concepto: **"industrial systems"**, casi negro absoluto con un solo acento. Sus piezas:

| Elemento | Valor | Para qué |
|---|---|---|
| Fondo | `#03060F` (casi negro) | Base de todo |
| Acento interactivo | `#2EE6FF` (cian) | Todo lo clicable |
| Positivo | `#3DFFC2` (verde) | "Funcionando"; nunca decorativo |
| Atención | `#FFC14D` (ámbar) | Solo los cuatro casos de arriba |
| Radios | 4 px y 8 px | Botones y paneles |
| Espaciado | 4/8/12/16/24/32/48 px | Una escala fija |

**Tres tipografías con roles fijos:** *Big Shoulders Display* solo para títulos grandes, *IBM Plex Sans* para el cuerpo y *IBM Plex Mono* **solo** para anotación técnica (cifras, etiquetas, tags de tabla). La "firma visual" son las **esquinas de mira** (*reticle*): las cuatro esquinas que YOLO dibuja alrededor de una detección, reutilizadas para marcar lo activo.

## El cargador y las animaciones (30 de septiembre)

Según `docs/CHANGELOG.md`, el 30 de septiembre se agregó un **cargador global** en la portada y el inventario: un anillo con el **progreso real** de la carga (no un reloj de adorno), un robot que se desarma y se arma en bucle y un logo que se dibuja, con un mínimo de 800 ms y un máximo de 3 s; lo que siga cargando después se ve como **skeleton** (un esqueleto gris que ocupa el lugar del contenido). También se añadieron entradas animadas al hacer scroll, navegación translúcida, cifras que ruedan hasta su valor real y una bitácora animada, todo respetando la preferencia del sistema operativo `prefers-reduced-motion` (que pide menos animación a quien la configuró). Para que el anillo refleje datos reales, toda carga inicial se envuelve en `AetherLoader.track(promesa)`.

Un error corregido ese día es instructivo: `line-vision.js` **redeclaraba constantes globales** de `camera-stream.js`, lo que impedía que corriera, y el botón "Iniciar visión de línea" **no hacía nada**. La solución fue aislar el código de cada archivo en su propio ámbito (una función que se ejecuta de inmediato). Con muchos archivos JavaScript en una misma página, ese es el tipo de choque que ocurre.

## La pantalla de la celda

`celda.js` cumple las normas de interfaz industrial en pequeño. Su comentario inicial lo dice: **ISA-101** (color solo ante condición anormal; si no hay controlador, los conteos se pintan como no válidos; Arranque y Paro piden confirmación), **ISA-18.2** (las alarmas vienen del servidor y sobreviven a recargar la página) e **IEC 62443** (solo esta pantalla: el mando exige sesión; "Ingeniería" es quien puede borrar el histórico). Pide `GET /line/cell/status` **cada segundo** y traduce las acciones a frases humanas:

| Acción técnica | Texto que ve el operador |
|---|---|
| `pieza_aceptada` | "Sigue en la banda" |
| `scrap_expulsado` | "Expulsada por el pistón" |
| `fallo_actuacion` | "El pistón no disparó" |
| `pulso_no_enviado` | "El pulso no salió" |

Un detalle de honestidad: la hoja de conexión señalaba que la marca `SIM` de la pantalla estaba escrita fija en el HTML y no se apagaba sola cuando llegaran datos reales; por eso debía quitarse en el mismo cambio en que el origen dejara de ser simulado. El alcance de esta pantalla, que diseña **Emmanuel** (HMI/GUI), sigue **PENDIENTE (P-17)**.

## Lumina en pantalla: la cara con expresiones

`robot.js` (unas 2 600 líneas, el archivo más grande del panel) implementa la cara de Lumina, un sistema de **expresiones**, los subtítulos, el reconocimiento de voz del navegador (cuando existe), los modos Conversación y Cámara, el guion de la presentación, las llamadas y el oyente del servicio de voz. Su rediseño del 17 de septiembre (estilo OLED de ciencia ficción) incluyó un error corregido el mismo día: una constante declarada dos veces que impedía que corriera.

## Ejercicio de lectura de un panel

Para entender cualquier página nueva del panel, el recorrido recomendado es: (1) abrir la página en el navegador; (2) pulsar `F12` y mirar la pestaña **Red** para ver qué direcciones pide; (3) buscar esa dirección en `backend/main.py`; (4) abrir el `.js` de la página y buscar la función que pinta ese dato. Con ese método se entiende en minutos qué parte del servidor alimenta cada elemento.

## Cómo se hacen paneles de planta de verdad

Los paneles de supervisión reales siguen normas como **ISA-101** (cómo diseñar pantallas de operador) y **ISA-18.2** (cómo administrar alarmas) para que un operador reaccione bien a las 3 de la mañana: poco color, jerarquía clara y alarmas priorizadas. Aether adopta la idea de **color solo ante condición anormal** en la celda y añade una pantalla pública más "comercial" en la portada, donde la estética pesa más.

## Preguntas de repaso: el panel

1. ¿Para qué casos se permite el color ámbar y por qué?
2. ¿Qué diferencia visual hay entre una tarjeta de módulo activo y una pendiente de hardware?
3. ¿Qué problema causó el bug de `line-vision.js` y cómo se evitó?
4. ¿Por qué `robot.html` no lleva cargador?
5. ¿Qué tres normas inspiran la pantalla de la celda y qué aporta cada una?
6. ¿Qué cuatro pasos se siguen para entender una página nueva?
