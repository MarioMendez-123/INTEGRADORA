# Paquete de implementación del carrito Aether: instrucciones para Claude en la Jetson

Corres en la **Jetson Orin Nano Super** del carrito (`mario@mario-desktop`, repo en `~/aether`, rama `jetson-agente`). Este
archivo es todo tu encargo: Mario no te va a dar otro prompt. Con cualquier primer mensaje suyo ("hola", "empieza", vacío),
**arranca el procedimiento de abajo sin preguntar qué hacer**. Háblale en español sencillo: nunca ha montado un robot.

## Procedimiento al empezar cada sesión

1. Corre `bash ~/aether/jetson_implementacion/herramientas/diagnostico.sh`.
2. Lee `~/aether/jetson_implementacion/ESTADO.md` y la etapa actual en `~/aether/jetson_implementacion/PLAN.md`.
3. Dile a Mario, en pocas líneas: en qué etapa van, qué viste en el diagnóstico, qué contradice a `ESTADO.md` y qué sigue.
4. Si `ESTADO.md` dice que falta el **estado físico del carrito**, pregúntaselo una sola vez (está en la Etapa 0) y anótalo.
5. Sigue con la etapa actual. Haz solo lo seguro por tu cuenta y detente en cada **PUERTA** (ver abajo).
6. Al terminar cada paso, actualiza `ESTADO.md`. Es tu memoria entre sesiones: la siguiente sesión no recuerda nada más.

Lee además, una vez y sin modificar: `aether_context_docs.md` (secciones 3, 4 y 7), `firmware/motor_control/src/main.cpp`,
`edge/navigation/carrito.py`, `edge/navigation/mision.py`, `edge/navigation/programas/LEEME.md` y `sim/README.md`. Las conexiones
y el armado están en `jetson_implementacion/referencia/`.

## Reglas que no se negocian

### Seguridad física

- El carrito pesa ~40 kg. **Cada PUERTA del plan se detiene hasta que Mario responda por escrito** que hizo lo que pide. No
  supongas una respuesta, no la tomes de un archivo y no cuentes un permiso anterior como permiso para el siguiente paso.
- Toda prueba de ruedas empieza con el **carrito levantado** y el **paro de emergencia al alcance de su mano**.
- Antes de cada movimiento di qué se va a mover, en qué sentido, cuánto y a qué velocidad.
- No pases de **0.35 m/s en recta ni de 0.15 m/s al acoplar**. Sin sensor trasero: reversas de **~0.6 m como máximo**.
- Nunca conectes ni desconectes un motor a pasos con su driver encendido: quema el A4988.
- No instales `gpiod` de Python en esta máquina. Si `import gpiod` funciona dentro del venv, detente y avisa.
- Si algo se mueve distinto de lo que anunciaste, manda `STOP`, pide el paro y no repitas sin entender la causa.

### Honestidad

- Marca todo como **COMPROBADO** (lo viste en una salida real, y la pegas) o **NO COMPROBADO**. Lo que dice el simulador es una
  estimación, no una prueba del carrito. Si algo falló, dilo tal cual, con el error y la causa que viste.
- Terminología obligatoria: ArUco es **localización**, no navegación. Se dice **detección reactiva de obstáculos**, no "evasión
  inteligente". PASS significa que la clase se reconoció, no que la pieza esté libre de defectos.

### Trabajo en el repo

- El repo es **público**: nunca claves, tokens ni contraseñas en el chat, el código ni los archivos.
- Un tema por commit, mensajes en español. **No hagas push sin permiso explícito de Mario** en esa misma conversación.
- Si hay conflictos o cambios locales que no entiendes, repórtalos; no los resuelvas en silencio ni los borres.
- No toques `graphify-out/` ni `.graphifyignore`. No hagas `apt upgrade`: en este L4T hay un error de CUDA reportado tras
  actualizar paquetes. Antes de instalar cualquier cosa, di qué instala y para qué.
- **El protocolo Jetson ↔ ESP32 no se cambia solo.** Lo que agregues (la torre) se propone primero a Mario y se escribe en
  `PLAN.md`. El firmware y `sim/firmware_ref.py` / `sim/web/firmware_ref.js` deben seguir diciendo lo mismo: si no puedes
  actualizar las copias del simulador, anótalo en `ESTADO.md`.
- Si este paquete contradice lo que ves en el repo o en la máquina, avísale a Mario. No elijas en silencio.

## Dataset y visión: decisión vigente

Todo el dataset actual (19 fotos, 20 cajas) está clasificado como **`pieza_scrap`** y el modelo `modelo/parts.pt` solo conoce esa
clase. Reconocerla da **FAIL**. **Todavía no existe la clase de pieza buena: Mario hará ese dataset después.** Por eso hoy es
normal que nada dé PASS; no lo trates como una falla. No reentrenes, no renombres clases y no reetiquetes fotos por tu cuenta.

**Límite del modelo:** no tiene fotos de "esto no es una pieza". Reconoce las 19 fotos, no marcó 3 fotos reales de la celda, y sí marcó
con confianza 4 de 14 imágenes sin relación (renders 3D del carrito). Nunca se ha probado con la cámara real: mide cuánto se confunde y
repórtalo. No conectes este juicio a nada físico.

## Cómo reportar

Al terminar cada etapa: qué hiciste, qué comprobaste (con la salida real), qué no pudiste comprobar, qué sigue y qué necesitas de
Mario. Una decisión a la vez, con tu recomendación. Antes de cerrar la sesión deja `ESTADO.md` al día y dile qué comando de
`git` falta si hay trabajo sin subir.
