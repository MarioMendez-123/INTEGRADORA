# Capítulo 15: La voz de Lumina

*Quién es Lumina, cómo oye y cómo habla, por qué un reconocedor de voz no pudo escribir su nombre, qué se midió y qué no, y cómo diagnosticar cuando no escucha.*

## Un reconocedor que no sabe escribir "Lumina"

El 23 de octubre de 2026 se descubrió que el asistente del proyecto no despertaba. Al decir "Lumina", el reconocedor de voz local escribía **"nómina"**, **"luz mina"**, **"lumínica"**, **"luminoso"** o **"mina"**, y el programa que esperaba la palabra exacta nunca la veía. El diagnóstico fue una consulta directa al modelo: **"lumina", "lumia" y "luminia" no están en su vocabulario**, mientras que "ilumina", "nómina", "mina", "lumínica" y "luminoso" sí. Un reconocedor solo puede escribir las palabras que conoce; el nombre propio del asistente no era una de ellas.

Es una lección general de la voz por computadora que el resto del capítulo desarrolla: **reconocer voz no es oír, es elegir entre palabras de un diccionario.**

## Cuatro piezas, una conversación

**Lumina** es el nombre del asistente de Aether: una **cara animada** en la pantalla (`robot.html`), con **voz**, **cámara** y un **modelo de lenguaje local**. Se presenta como "el robot móvil de Aether". Para que conteste una frase hay cuatro piezas, que viven en máquinas distintas:

| Pieza | Qué hace | Dónde corre |
|---|---|---|
| **Oído** | Capta el micrófono y escribe lo que se dijo | **La laptop** (servicio de voz), o el navegador con reconocimiento propio |
| **Cerebro** | Decide qué responder | **La laptop** (servidor FastAPI + **Ollama**, un programa que corre modelos de lenguaje en local) |
| **Voz** | Convierte el texto en sonido | **ElevenLabs** (un servicio en la nube) con respaldo de la voz del navegador |
| **Cara** | Muestra expresiones, subtítulos y reloj | El navegador (`robot.html`, `robot.js`) |

La exclusión mutua importa: en el Jetson, correr un **modelo de lenguaje** y la **percepción con YOLO** a la vez degradaría a ambos, porque comparten un solo cómputo; por eso `robot.html` tiene un **Modo Conversación** (la cámara y YOLO apagados) y un **Modo Cámara**, que nunca se activan juntos, y el modelo de lenguaje se queda en la **laptop**.

## El cerebro: tres capas de respuesta

Cuando llega una pregunta a `POST /robot/ask`, el servidor la resuelve en este orden:

1. **Comandos de escritorio** (`lumina_desktop.py`): abrir un programa, poner música en Spotify, guardar un archivo, calcular. Se reconocen con **patrones de texto**, **sin modelo de lenguaje**. Lo delicado (cerrar una app, guardar un archivo) **pide confirmación por voz** ("sí" o "no").
2. **Respuestas precargadas**: si la pregunta coincide con alguna típica de una presentación, se contesta al instante con una respuesta fija.
3. **Ollama** (`llama3.2:1b`, un modelo de 1 000 millones de parámetros que corre en la laptop), con un **tope duro** de 60 tokens de respuesta, **elegido probando** (con 40, una respuesta real se cortó a media palabra) y una **limpieza** posterior: se descartan listas (no sirven para decirse en voz alta) y se quitan oraciones de "meta-comentario" donde el modelo describe cómo debe responder.

Si Ollama no responde, el servidor devuelve **503** con un mensaje que explica cómo arreglarlo (`ollama serve`, `ollama pull llama3.2:1b`); **nunca inventa** una respuesta cuando el modelo real no contestó (principio de honestidad).

El **mensaje de sistema** de Lumina (su "personalidad") le exige responder **en una sola oración corta, tierna y cálida**, decir con honestidad lo que no sabe, **no fingir** capacidades que no tiene (como ver, si la cámara está apagada) y **aclarar que la línea de manufactura todavía no existe físicamente** como parte de lo que ya hace. Es una aplicación directa del principio de **honestidad de producto**.

### Llamadas telefónicas, con candado

Lumina puede "llamar" a un contacto (`POST /robot/call`, mediante un servicio externo de mensajería). Las salvaguardas del código, dignas de copiar: **solo marca números de una lista local** (`backend/contactos.json`, fuera de Git) con formato internacional válido, **nunca un número que llegue por la red** (cualquiera en la red puede llamar al endpoint), y hay un **límite de 3 llamadas por ventana de 10 minutos**. Como el servicio lee el texto una sola vez al contestar, el mensaje se repite dos veces y lleva una introducción corta.

## La voz de salida y su respaldo

`POST /robot/tts` manda el texto a **ElevenLabs** (modelo `eleven_multilingual_v2`) y devuelve un **MP3**. La clave vive solo en `backend/.env`; si falta o falla, responde 503 y el navegador **cae a `speechSynthesis`**, la voz integrada del navegador. El 23 de octubre se descubrió que el MP3 se descargaba bien pero el navegador **no lo reproducía** por la política de contenido (`media-src`); el diagnóstico está en el capítulo 11. Si la clave de ElevenLabs es válida y tiene créditos **no se verificó**.

## El oído: del micrófono al texto

El micrófono de Lumina **es el de la laptop**, atendido por un proceso aparte: `python -m voice.service` (carpeta `backend/voice/`). La ruta de una frase:

1. **`audio.py`**: captura el micrófono con `sounddevice` (audio **PCM**, 16 kHz, mono, 16 bits).
2. **`core.py`**: un **VAD** (*Voice Activity Detector*, "detector de actividad de voz") de **energía** decide si hay voz: mide el volumen (RMS) y lo compara con un **umbral** (`AETHER_VOICE_VAD_THRESHOLD`, 500 por defecto). Guarda solo un anillo corto en memoria para no cortar el principio de la frase.
3. **`engine.py`**: el reconocedor, un adaptador intercambiable: **Vosk** (por defecto, ligero, 100 % local) o **Whisper** (más preciso y pesado, opcional).
4. **`wake.py`**: si la frase **empieza** con algo que suena a "Lumina", se reescribe como "lumina" (ver abajo).
5. **`hublink.py`**: manda **solo el texto** por WebSocket al servidor (`/voice/ws`), que lo reenvía a las páginas de Lumina que no tienen reconocimiento propio (por ejemplo Firefox en el Jetson).

Reglas de privacidad del servicio, **VERIFICADAS por pruebas automáticas**: **el audio nunca se guarda en disco, no se escribe en los registros y no sale del proceso**; hay un **aviso persistente** en la ventana (`● MICRÓFONO ACTIVO · 15:04:05`) y una **notificación de Windows** al activar, pausar y apagar; la tecla **`p` pausa y suelta el micrófono** (el icono de micrófono de Windows se apaga); `q` sale; `w` despierta a Lumina sin hablar.

**Anti-eco:** cuando Lumina habla, la página avisa al servicio (`speaking`) y este ignora el audio hasta **0.8 s después** (`AETHER_VOICE_ECHO_TAIL_S`), para que Lumina no se oiga a sí misma.

## La palabra de activación y su problema de vocabulario

La solución a "nómina" está en `backend/voice/wake.py`: **si la frase empieza** (o empieza tras "hola"/"oye") con una forma que suena a "Lumina", esa palabra se reescribe como "lumina" **antes de mandar el texto**, y el código de la página no cambia. Acepta una lista corta de formas observadas ("nómina", "mina", "lumínica", "luminoso/a"), palabras que empiezan con "lu", tienen 5 letras o más y están a **una letra** de "lumina" (según la **distancia de Levenshtein**, que cuenta cuántas letras hay que cambiar, quitar o poner), y pares como "luz mina" o "lo mina". **No** acepta "la mina", "una mina", "lámina", "lucía", "luna", "camina" ni "elimina".

**MEDIDO** con **voz sintética de Windows** (una sola voz, ruido simulado), 30 frases con "Lumina" y 25 sin ella:

| Condición | Regla exacta (antes) | Regla tolerante (ahora) | Falsos positivos |
|---|---|---|---|
| Silencio | 0/30 | **28–30/30** | 1/25 → 4/25 |
| Ruido blanco +10 dB | 27/30 | 28/30 | 1/25 → 4/25 |
| **Murmullo** (3 voces) +10 dB | 2/30 | **11/30** | 2/25 → 4/25 |

Tres lecciones: en silencio la regla **resuelve** el problema; el **nivel de voz no era el problema** (a RMS 300 y 1000 Vosk acierta igual); y con **conversaciones de fondo** el límite deja de ser la regla (Vosk escribe lo que dicen las voces de fondo y ninguna lista de variantes lo arregla). El costo: frases reales que **empiezan** con "nómina…" o "mina…" activarán a Lumina; los falsos positivos conocidos quedan **a la vista como pruebas**. Se apaga con `AETHER_VOICE_WAKE_FUZZY=0`.

Se probaron **10 palabras alternativas**; las que sí están en el vocabulario ("atenea", "aurora") se reconocen mejor en silencio pero **con murmullo se degradan igual**, así que **no se cambió el nombre**. Y Vosk cierra la frase por su propio detector de silencio (antes, con ruido constante, una frase tardaba hasta 20 s): latencia desde que termina la voz, **mediana 0.07 s en silencio** y **0.48 s con ruido blanco a +5 dB** (**MEDIDO**).

## Vosk contra Whisper: lo medido y lo no medido

| Dato | Vosk (modelo pequeño `vosk-model-small-es-0.42`) | Whisper |
|---|---|---|
| Carga del modelo | 1.0–1.6 s | **No medido** |
| Memoria añadida | 165 MB (silencio) a 288 MB (ruido) | **No medido** |
| Factor de tiempo real | 0.06–0.28 (más de 3 veces más rápido que el audio) | **No medido** |
| Latencia al cerrar la frase (p95) | ~25–30 ms (silencio), hasta ~200 ms (ruido) | **No medido** |
| CPU | 6 % de un núcleo (silencio), hasta 22 % (ruido) | **No medido** |

(Cifras medidas en la laptop; algunas tandas corrieron junto a otras pruebas, así que lo alto del rango puede estar inflado.) **Whisper no se midió porque instalarlo es decisión del equipo**; su ventaja de diseño es que escribe letra por letra y **no tiene límite de vocabulario**, pero con ruido o silencio puede **escribir el texto de orientación (prompt) como si lo hubiera oído**, por eso ese ajuste (`AETHER_VOICE_WHISPER_PROMPT`) es opcional y vacío por defecto.

**Nada se ha medido con la voz ni el ruido reales del equipo** (verificación V12 pendiente): **PENDIENTE (P-27)**. Esto incluye el porcentaje real de falsos positivos con habla humana, que las 25 frases sintéticas no estiman.

## El ruido: por qué el VAD no basta

El ruido de un laboratorio (en la medición del equipo: voz máxima ~1000, picos de ruido ~3000) puede superar a la voz. Un **umbral de energía no puede separarlas**, por eso se confía el cierre de frase al detector acústico de Vosk. Lo que más ayuda es **físico**: un **micrófono de diadema** o muy cerca de la boca sube la voz respecto del ruido de golpe; y la tecla `w` o el control remoto del expositor (`/show/ws`, mensaje `wake`) son vías que no dependen de entender la voz.

## Audio en el Jetson: por qué no sonaba

Dos cosas distintas: **voz de entrada** y **voz de salida**. La entrada no funciona en Firefox del Jetson porque `robot.html` usa `SpeechRecognition` del navegador (no activo en Firefox): por eso existe el servicio de voz de la laptop, que manda texto. La salida falló por la CSP (capítulo 11). Si el Jetson tendrá micrófono y bocina propios: **PENDIENTE (P-20)**.

## Las variables que controlan la voz

| Variable | Defecto | Qué cambia |
|---|---|---|
| `AETHER_VOICE_MODEL` | — (obligatoria con Vosk) | Carpeta del modelo en español |
| `AETHER_VOICE_ENGINE` | `vosk` | `whisper` exige instalar `faster-whisper` |
| `AETHER_VOICE_DEVICE` | micrófono por defecto | Qué micrófono usar |
| `AETHER_VOICE_START` | `on` | `off` arranca pausado, sin abrir el micrófono |
| `AETHER_VOICE_VAD_THRESHOLD` | `500` | Umbral de energía, se calibra con `scripts/probar_voz.py --mic 8` |
| `AETHER_VOICE_ECHO_TAIL_S` | `0.8` | Silencio tras hablar Lumina |
| `AETHER_VOICE_NOTIFY` | `1` | Notificación de Windows |
| `AETHER_VOICE_WAKE_FUZZY` | `1` | La regla tolerante de "Lumina" |

Para calibrar el micrófono (4 s en silencio y 4 s hablando), `[Laptop · PowerShell]`, desde la raíz del proyecto:

```powershell
backend\.venv\Scripts\python.exe scripts\probar_voz.py --mic 8
```

El script sugiere un valor para `AETHER_VOICE_VAD_THRESHOLD`. (Una corrección propia registrada: la versión anterior mostraba siempre "memoria del proceso: 0.0 MB" en Windows por un manejador truncado; se arregló y se probó.)

## Si Lumina no escucha: diagnóstico en orden

1. **¿Corre el servidor?** `[Laptop · PowerShell]`: `.\iniciar_aether.ps1 -SoloComprobar`.
2. **¿Está el servicio de voz con "MICRÓFONO ACTIVO"?** En su ventana. Si dice pausado, `p`.
3. **¿Conecta con el servidor?** La consola dice `sin conexión con el servidor` si no; revisar `backend\logs\voice.log`.
4. **¿La página recibe?** El punto de voz de `robot.html` se pone "escuchando" cuando conecta.
5. **¿Qué escribió el reconocedor?** Con `AETHER_VOICE_LOG_TEXT=1` el texto queda en `backend/logs/voice.log` (el audio, nunca). Si lo escrito no se parece a "Lumina", es reconocimiento (ruido), no la regla.
6. **Eco:** si usa bocinas, probar audífonos o subir `AETHER_VOICE_ECHO_TAIL_S`.

## Asistentes de voz en el mundo real

Los asistentes comerciales usan una **palabra de activación** detectada por un modelo pequeño y siempre atento ("wake word"), un reconocedor de voz mucho mayor en la nube o en el dispositivo, y respuestas generadas por un modelo de lenguaje grande. Aether replica la arquitectura con piezas de laboratorio, y deja claro lo que no tiene: un detector de activación dedicado, medidas con voces reales y un micrófono con cancelación de ruido.

## Retos de voz para repasar

1. ¿Por qué un reconocedor no puede escribir una palabra que no está en su vocabulario?
2. ¿Qué hace `wake.py` y qué riesgo introduce?
3. ¿Por qué el audio nunca se guarda y cómo lo comprueban las pruebas?
4. ¿Qué tres capas de respuesta tiene Lumina y en qué orden se consultan?
5. ¿Qué medidas de Vosk existen y cuáles de Whisper?
6. Si Lumina no despierta con ruido de fondo, ¿qué dos salidas existen que no dependen de entender la voz?
