# Capítulo 24: El video y la presentación en vivo

*Cómo se sincroniza un video de cuatro minutos con un robot que habla en vivo, qué se midió de su voz y qué falta medir en el escenario.*

## Un video que espera a que el robot hable

Un video de presentación normal se reproduce y listo. El de Aether tiene un problema distinto: **el robot Lumina habla en vivo** (su voz sale del servicio de ElevenLabs, con una latencia que varía) y el video debe acompañarla con imágenes, música y efectos **sin adelantarse ni quedarse atrás**. El proyecto `aether-video/` resuelve esa sincronía con un método que sirve para cualquier proyecto que mezcle un guion humano y uno automático: **primero se mide, después se diseña.**

## Qué es el entregable

`aether-video/` contiene un video de **~4:25** hecho con **Remotion** (una librería que genera video a partir de código React/TypeScript, de modo que cada escena es un componente editable) que **acompaña en vivo la presentación**: Lumina habla, el expositor habla y el video pone la narrativa visual, la música y los efectos. **El video no genera voz.** Hay dos entregables:

- **A.** Los **MP4** de ensayo (con la voz de Lumina en sus tiempos medianos, para revisar) y de escenario (sin voz). Ambos miden **265.045 s (4:25)**, 1920 × 1080, 30 cuadros por segundo, H.264 + AAC (**VERIFICADO** con `ffprobe`; el máximo pedido era 5:30).
- **B.** El **reproductor en vivo** (`player/`), que reacciona a los eventos reales de Lumina.

## Fase 0: medir la voz real

Antes de escribir una escena, se midió a Lumina. El reporte (`phase0/REPORT.md`, 29 de septiembre) explica cómo habla: `speak(text)` pide un MP3 al servidor, que lo pide a ElevenLabs (**sin streaming ni caché**); cada frase se pide **después** de que terminó la anterior más su pausa, de modo que el hueco real es *la pausa diseñada más la latencia del servicio*. Si algo falla, cae a la voz del navegador (en esa máquina, "Microsoft Raul es-MX").

**MEDIDO** (Chrome 154, laptop con procesador AMD Ryzen 5 4500U y 4 GB de RAM, WiFi doméstico, 128 frases sin límite de red, 4 corridas):

| Qué | Mediana | p95 | Máximo |
|---|---|---|---|
| Latencia pedido → audio (ElevenLabs) | **1 428 ms** | 2 696 ms | 8 988 ms |
| Hueco real − pausa diseñada | 1 438 ms | 2 643 ms | 6 213 ms |
| Inicio del guion → primer audio | 2 057 ms | 3 036 ms | 3 198 ms |
| Relevo por WebSocket robot → video (misma máquina) | **4 ms** | 38 ms | 304 ms |

(**p95** es el valor que el 95 % de las mediciones no supera: una forma más honesta de decir "casi siempre".) Con redes lentas la latencia mediana sube (**3G: 2.9 s**; **Slow 4G**: p95 de 5.2 s) y **sin internet** cae a la voz local con una latencia de unos 50 ms. **Lo que no se midió (PENDIENTE: P-31):** el reconocimiento de "Lumina" con el micrófono real (el reconocedor de Chrome ignora un micrófono falso), el hardware del escenario y la red del escenario. El propio reporte lo dice: *"Las cifras valen solo para este equipo y esta red."*

## El guion se hizo esperar al expositor

Una decisión de diseño que salió de la medición: tras la pregunta "¿Quieren ver cómo funciono?", el guion **espera a oír "Lumina"** en lugar de un temporizador de 70 segundos que **podía hablar encima del expositor**. Para ello se añadió la variante "lumia" al patrón de reconocimiento (la raíz del problema que el capítulo 15 explica con más detalle).

## El timeline: cada escena atada a un evento real

`timeline.json` es la **fuente de verdad**: cada *cue* (señal de escena) con su **disparador real** (un evento de Lumina o un clic del expositor), su tiempo y de dónde sale ese número; se regenera desde la medición con `npm run timeline`. Los eventos que el robot publica por **WebSocket** son: `wake`, `script-start`, `line-request`, `line-start`, `line-end`, `await-lumina`, `heard-lumina` y `camera-on`. Se eligió WebSocket (y no `BroadcastChannel`) porque **son equipos distintos**; el relevo del servidor (`/show/ws`) mide **4 ms de mediana** en la misma máquina.

## El clicker y el modo ensayo

El expositor controla el video con un **clicker** (un mando de diapositivas): `→` o `AvPág` avanza, `←` retrocede, la tecla `F` pone pantalla completa, `H` retiene o reanuda el **watchdog** (el temporizador de seguridad que evita que el video se quede esperando a un evento que nunca llega) y `E` abre el **panel de ensayo**. El **modo ensayo** (`?ensayo=1`) simula a Lumina con la distribución de tiempos **medida** de cada perfil de red, con retrasos añadidos, eventos perdidos y la duración del expositor; no necesita red. Existe además un modo **solo clicker** (`?clicker=1`) que reproduce el mismo video sin robot, y en la diapositiva de cámara pide el MJPEG real (`GET /perception/stream`) y **no deja seguir hasta confirmar EN VIVO o SIN CÁMARA**.

## Resultados verificados (en la misma laptop)

Una corrida real de extremo a extremo (con `robot.js` real, voz real de ElevenLabs, el servidor real y el reproductor real, en contextos separados de Chrome) dio, **MEDIDO**:

| Qué | Resultado |
|---|---|
| Sincronía de 32 frases (error entre el cue y el inicio de la voz) | mediana **+3 ms**, p95 **75 ms**, máx. **91 ms** (cumple ±250 / ±500 ms) |
| Relevo robot → video | mediana 2 ms, p95 6 ms |
| Watchdog, duplicados, errores de JavaScript | 0 / 0 / 0 |

Con la voz local de respaldo, la mediana fue +56 ms y el p95, 71 ms. **Nada de esto se midió en el hardware ni en la red del escenario.** Un primer intento con ElevenLabs se quedó a medias porque la máquina se congeló por falta de memoria: una nota de honestidad que el propio documento de verificación conserva.

## Música y efectos generados por código

La música, las camas por sección, los golpes por cue y los efectos se **sintetizan con Web Audio** (`audio/engine.js`, la partitura y la síntesis) y se renderizan con scripts (`npm run music`, unos 20 minutos en esa laptop). Hay medidores de **niveles** de voz y música (`scripts/levels.mjs`) para comprobar que la música no tape la voz (el efecto *ducking*, que baja la música cuando alguien habla). El texto en pantalla del video está en **español** (decisión del equipo).

## Montaje en el escenario

Tres equipos: la **laptop del servidor** (`uvicorn main:app --host 0.0.0.0 --port 8000`), la **pantalla del robot** (`http://<IP>:8000/robot.html`, en primer plano y pantalla completa porque un navegador congela los temporizadores de una pestaña en segundo plano) y el **equipo del video** (`npm run show`, en `http://localhost:5055/player/?backend=<IP>:8000`). Un clic o tecla "arma" el audio (política de *autoplay*, capítulo 11).

## También el informe y los dictados

El mismo espíritu de "generar desde código" se aplicó a otros entregables: el **informe integrador** (un documento de Word generado desde archivos fuente en `aether_report_package/`), el **dictado sin símbolos para ElevenLabs** (`AETHER_DICTADO.txt`) y el **compendio** del proyecto (`AETHER_COMPENDIO.md`), que explica también cómo se prepara el texto para que una voz sintética lo lea sin tropezar.

## Cómo se hacen las presentaciones técnicas serias

En conferencias y ferias se ensaya con **cronometraje**, se prepara un **plan B** sin red (aquí: el modo solo clicker y la voz local), y se mide el **retraso de extremo a extremo** de lo que depende de internet. Aether sigue el mismo plan con un ingrediente poco común: las cifras de latencia están **medidas y publicadas** con sus límites.

## Preguntas de repaso: la presentación

1. ¿Por qué el video no genera la voz?
2. ¿Qué mide el p95 y por qué se reporta junto a la mediana?
3. ¿Qué problema evita el cambio de "temporizador de 70 s" a "esperar a oír Lumina"?
4. ¿Por qué se usa WebSocket y no `BroadcastChannel` entre la pantalla del robot y el video?
5. ¿Qué hace el watchdog del reproductor?
6. ¿Qué dos cosas **no** se midieron y deben medirse antes de la presentación real?
