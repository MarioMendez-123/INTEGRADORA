# Prólogo: cómo leer este libro

*Para quién es, qué cuenta, cómo está escrito y cómo distinguir lo que se comprobó de lo que se supone.*

## Un libro para alguien que llega de afuera

Este libro explica **Aether**, un proyecto integrador de ingeniería mecatrónica desarrollado por un equipo de seis personas en Chihuahua, México: un **robot móvil de transporte** y una **celda de manufactura** que inspecciona piezas, con un sistema de software que une todo. Está escrito para una persona que **no conoce al equipo ni lo que se hizo**: un profesor que evaluará el proyecto, alguien que tendrá que retomarlo, o un futuro integrante que llega el primer día. No se da por sabido ningún nombre, ninguna pieza ni ninguna sigla.

La promesa del libro es modesta y práctica: al terminarlo, quien lo lea puede **explicar con sus palabras por qué cada pieza está donde está**, **arrancar y apagar el sistema en el orden correcto**, **diagnosticar las fallas típicas** y **defender el proyecto sin afirmar nada que no esté comprobado**. No es un curso general de electrónica, redes o Python: la teoría aparece solo cuando hace falta para entender algo que ocurre en Aether, con ejemplos y errores reales del proyecto.

## Una verdad incómoda

Aether junta, en un solo sistema, materias que normalmente se estudian por separado: electricidad y mecánica, microcontroladores, redes de computadoras, sistemas operativos, desarrollo web, visión por computadora e inteligencia artificial. Por eso, cuando algo falla, parece magia negra. No lo es: casi todo lo que ocurrió en los meses de trabajo se explica con un puñado de ideas que se aprenden en una tarde. Los capítulos están escritos para dar esas ideas **en el momento en que se necesitan**.

## Una promesa sobre las siglas

En computación y en electrónica se usan muchas siglas y la mayoría de los libros las sueltan como si todos las supieran. Aquí **cada sigla y cada término técnico se explica la primera vez que aparece**, con su nombre completo (casi siempre en inglés, porque así se escribieron) y una frase que dice qué es en la vida real. Al final del libro hay un **glosario unificado** con todas, por si alguna se olvida.

Cinco palabras que se usan en todo el libro y conviene tener claras desde ya:

| Palabra | Qué significa aquí |
|---|---|
| **Programa** | Un conjunto de instrucciones guardado en un archivo que todavía no está haciendo nada |
| **Proceso** | Un programa que ya está corriendo |
| **Servidor** | Un programa que se queda esperando a que otro le pida algo |
| **Cliente** | El programa que pide |
| **Red** | Los cables o el WiFi por los que dos computadoras se mandan mensajes |

## Cuatro etiquetas de certeza

Este libro separa lo que sabe de lo que supone. Cada afirmación importante lleva una de estas marcas:

- **VERIFICADO:** se leyó en el código, se comprobó con una prueba automática o se vio en una salida real pegada por el equipo.
- **MEDIDO:** es una cifra obtenida con una prueba o un instrumento; el texto dice dónde y con qué.
- **NO VERIFICADO:** se supone, o viene de un documento que nadie comprobó.
- **PENDIENTE:** falta un dato que solo el equipo puede dar. Lleva un código (con la forma **P-xx**) que remite a la lista del final del libro.

Cuando algo es una regla general de ingeniería (no una medición de Aether), el texto lo dice con las palabras *regla general* o *conocimiento general*.

**Regla de resolución de contradicciones.** La documentación del repositorio envejece más rápido que el código. Cuando un documento contradice al código, **gana el código**; cuando la guía de construcción del 9 de octubre de 2026 contradice a la bitácora de hardware del Jetson del 21 de octubre, **gana la bitácora**. Las decisiones firmes que el equipo comunicó el 24 de octubre prevalecen sobre cualquier documento previo.

## Cómo está organizado

| Parte | Capítulos | De qué trata |
|---|---|---|
| **A. Panorama** | 1 | Qué es Aether, quién hace qué, cómo encajan las piezas |
| **B. El cuerpo físico** | 2 a 9 | Electricidad, mecánica, alimentación y paro de emergencia, motores y ESP32, sensores, la celda de manufactura, la Raspberry Pi y el Jetson |
| **C. El software** | 10 a 21 | Redes, web, terminal y Linux, Python y FastAPI, visión, voz, sistemas distribuidos, inventario, comunicaciones de la línea, el dashboard, el sitio público y la seguridad |
| **D. Ingeniería y entrega** | 22 a 27 | Pruebas, Git y documentación, el video de presentación, el manual para cuando todo falla, el crecimiento futuro y los casos de la industria |
| **Apéndices** | A, B, glosario, pendientes | Hoja de arranque y apagado, lista para la defensa, glosario unificado y lista de pendientes |

Cada capítulo empieza con una historia o un hallazgo real del proyecto, explica el concepto desde cero, dice en qué archivo o comando se encuentra y qué síntomas da cuando falla, y termina con preguntas de repaso. Los subtítulos cambian de un capítulo a otro porque cada uno trata cosas distintas.

## Cómo se escribieron los comandos

Todo comando indica **en qué máquina y en qué ventana** se ejecuta, entre corchetes, por ejemplo `[Laptop · PowerShell]` o `[Jetson · SSH]`. Los comandos de Linux (Jetson y Raspberry Pi) se escriben en una terminal Bash; los de la laptop (que usa Windows) se escriben en PowerShell. **Nunca aparecen claves ni contraseñas**: el repositorio es público y el libro también debe poder serlo. Donde hace falta una clave se nombra la variable de entorno que la guarda, no su valor.

## Si solo hay un día

Leer completos los capítulos 1, 2 (primera mitad), 7 y 25, y el Apéndice A. Con eso se puede arrancar el sistema, entender la celda y diagnosticar lo básico. El Apéndice B sirve para preparar una defensa ante un jurado.

## Una nota sobre el estado del proyecto

El libro está escrito en octubre de 2026 y describe el proyecto **tal como estaba el 24 de octubre**. Las partes de software funcionan y están probadas en laptop; varias partes de hardware (el carrito, la celda en la Raspberry Pi, el micrófono real) **todavía no se han probado en el equipo físico**, y el libro lo dice cada vez. Esa franqueza es parte del método del proyecto: *no vender lo que no se ha comprobado*.
