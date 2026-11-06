# Capítulo 27: Lo que enseñan las empresas reales

*Cuatro historias de robots de almacén y de tienda, qué las hizo funcionar o fracasar y qué le dicen a un proyecto como Aether.*

> **Nota de método.** Los datos de este capítulo son **conocimiento general** sobre hechos públicos (no se verificaron durante la escritura del libro, que no tuvo acceso a fuentes externas). Las cifras son **aproximadas**: conviene confirmarlas en la fuente original antes de citarlas ante un jurado. Lo que aquí vale es la lección, no el número.

## Por qué mirar a otras empresas

Un jurado casi siempre pregunta: *"¿esto ya existe? ¿por qué sería distinto?"* Responder bien exige conocer dos o tres casos reales y poder decir **qué hicieron, qué les funcionó y qué les falló**, sin exagerar la comparación. Aether es un prototipo universitario; las empresas de abajo son compañías con cientos de ingenieros. La comparación honesta no es de tamaño, sino de **decisiones**.

## Amazon y Kiva: comprar la idea

Hacia 2012, **Amazon adquirió Kiva Systems** (una empresa de robots que llevaban **estantes completos** hasta el operario, en vez de que el operario caminara hasta el estante) por una suma del orden de varios cientos de millones de dólares. La lección: el valor no estaba en un robot "inteligente", sino en **rediseñar el proceso** para que el robot hiciera lo que mejor sabe (transportar) y el humano lo que mejor sabe (tomar piezas). Un paralelo con Aether: el carrito **no manipula**; transporta fixtures, y la inspección la hace una cámara fija. El proyecto aprendió algo parecido al **abandonar los brazos robóticos**: simplificar el proceso redujo el riesgo.

## Walmart y los robots de anaquel que se terminaron

Hacia 2020, **Walmart puso fin a un programa de robots que escaneaban los estantes** de sus tiendas (con la empresa Bossa Nova), tras años de pruebas. Las razones públicas más repetidas: el robot detectaba faltantes, pero **la tienda no los resolvía más rápido** y había alternativas más baratas (cámaras fijas, empleados con dispositivos). La lección para Aether, que es un robot de inventario: **detectar no es resolver.** Un dato de inventario solo vale si alguien lo usa. De ahí la insistencia del proyecto en un **inventario declarado con historial y confianza**, y no en un conteo "mágico".

## Simbe: el que sí escaló

**Simbe Robotics** sigue operando con un robot de inventario para tiendas. A diferencia de otros, su producto se vende como **un servicio de datos** (cuánto hay, dónde y qué falta) integrado a la operación de la tienda, no como un robot. La lección: lo que escala es la **utilidad del dato**, no el movimiento del robot. Aether lo anticipa con su mensaje comercial: *"el robot revisó el Anaquel 4 y encontró 23 unidades del producto X"*.

## Zebra y Fetch Robotics: el almacén se consolida

En 2021 **Zebra Technologies** (empresa de códigos de barras, impresoras y escáneres) compró **Fetch Robotics**, fabricante de **AMR** (robots móviles autónomos) para almacén, por una cifra de unos cientos de millones de dólares. La lección: los **códigos y lectores** y los **robots** se juntan porque resuelven el mismo problema (saber dónde está cada cosa). Aether, con su **enfoque híbrido** (detección + código de barras/QR), ya está en esa intersección.

## Qué dicen las historias juntas

| Lección | Cómo se refleja en Aether |
|---|---|
| El valor está en **rediseñar el proceso**, no en el robot | Se abandonó el brazo por banda + pistón y se separó transporte de inspección |
| **Detectar no es resolver** | Inventario declarado con historial, estados de cobertura y retiro explícito |
| Lo que escala es **el dato confiable** | Observaciones con confianza, `event_id`, bitácora auditable |
| Los **códigos** y los **robots** convergen | YOLO + QR + ArUco en un solo pipeline |
| La **seguridad** pesa tanto como la inteligencia | Paro físico en el diseño, nada se mueve sin `gpiod`, honestidad sobre lo no certificado |
| Muchos fracasos son de **expectativa** | Principio de honestidad de producto y etiquetas de certeza |

## Qué podría preguntar un jurado

Algunas preguntas probables y la clase de respuesta honesta que el proyecto puede dar:

1. **"¿Qué lo hace distinto de un robot comercial?"** — No pretende serlo: es un prototipo que demuestra integración completa con hardware real y un método de trabajo honesto; su diferenciador es la **trazabilidad y la confianza del dato**.
2. **"¿Qué parte funciona de verdad?"** — La percepción, el inventario, el panel y Lumina en laptop, y el agente en el Jetson (29 FPS medidos); la celda y el carrito están por probar en hardware real.
3. **"¿Cómo garantizan la seguridad?"** — Con un paro físico de contacto normalmente cerrado que corta la potencia independientemente del software; hoy es diseño del robot, y el paro de la celda **está pendiente**.
4. **"¿Qué pasa si falla la red?"** — La celda decide y actúa sola; los agentes acumulan datos en una cola acotada y los entregan cuando vuelve.
5. **"¿Cuánto acierta la visión?"** — Un mAP50 de 0.995 con pocas fotos; el criterio de calidad por defectos no existe todavía.

El Apéndice B desarrolla estas respuestas con las afirmaciones permitidas y las prohibidas.

## Preguntas de repaso: casos reales

1. ¿Qué rediseñó Kiva en el proceso de un almacén y qué paralelo tiene con el carrito de Aether?
2. ¿Por qué se terminó el programa de robots de anaquel de Walmart y qué enseña a un robot de inventario?
3. ¿Qué diferencia hay entre vender un robot y vender un servicio de datos?
4. ¿Por qué se juntan los fabricantes de lectores de códigos y los de robots móviles?
5. Dar dos preguntas de jurado y la respuesta honesta a cada una.
