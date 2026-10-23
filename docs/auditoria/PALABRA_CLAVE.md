# «Lumina» con Vosk: por qué no se detecta, qué se midió y qué se decidió

Rama `jetson-agente`. Etiquetas: **COMPROBADO** = salida real leída en la laptop de Mario o prueba que pasa; **NO COMPROBADO** =
supuesto o falta el hardware/voz/ruido real. **Toda cifra de reconocimiento de este documento sale de VOZ SINTÉTICA de Windows
(una sola voz, «Microsoft Sabina Desktop») con ruido SIMULADO, no de la voz de Mario ni del ruido de la universidad.** Sirve para
ver tendencias y para decidir qué reglas escribir; la prueba que decide es V12 (sección 8).

## 1. Dónde está la palabra de activación y cómo se compara — COMPROBADO (código)

- Definida **una sola vez**: `dashboard/robot.js:2206`, `const LUMINA_PATTERN = /\b(lumina|ilumina|luminia|lumia)\b/i;`.
- Se usa sobre el texto **completo** que llega a `handleVoiceCommand` (el texto del servicio de voz pasa antes por `queueVoiceFragment`, que
  junta fragmentos con una espera de 600 ms, 2 s si es una llamada). Es una **coincidencia exacta de palabra completa**: sin acentos,
  sin aproximación fonética, en cualquier parte de la frase.
- Dónde manda: en la pantalla de espera (`mode === "boot"`) una frase sin esa palabra se **ignora** (`robot.js:2302`); el guion espera
  «Lumina» del expositor (`resolveLuminaWait`, `robot.js:2334`); y los comandos de iniciar, detener, expresión, llamada y presentación
  exigen la palabra **y** su palabra clave (`robot.js:1961`, `1978`, `2006`, `2222`, `2226`, `2249`). En conversación normal una frase
  sin «Lumina» igual se manda a Ollama como pregunta.
- Las tres variantes extra (`ilumina`, `luminia`, `lumia`) se añadieron a mano al ver en consola lo que **Chrome** escribía («lumia.»).

## 2. Causa — COMPROBADO (con el modelo real `C:\aether-voz\vosk-model-small-es-0.42`)

Un reconocedor solo puede escribir palabras de su vocabulario. Se preguntó al modelo con `Model.vosk_model_find_word`:

| Palabra | ¿Está en el vocabulario? | | Palabra | ¿Está? |
|---|---|---|---|---|
| **lumina** | **NO** | | nómina | sí |
| **lumia**, **luminia** | **NO** | | mina | sí |
| ilumina | sí | | lumínica | sí |
| luminoso | sí | | lámina | sí |
| lubina | sí (la escribe Vosk) | | aether | no |

**Este modelo no puede escribir «lumina»**, diga lo que diga la persona; escribe la palabra de su vocabulario que más suena parecida.
Por eso `LUMINA_PATTERN` nunca coincide: en la corrida limpia con voz sintética la regla exacta activó **0 de 30** frases.

Lo que Vosk escribió en lugar de «Lumina» (primera palabra de la frase):
- **En la prueba real de Mario:** «nómina», «luz mina», «lumínica», «luminoso», «mina».
- **Voz sintética en silencio** (30 frases con 3 velocidades): «lubina» (16 veces), «lo mina» (9) y «mina» (2); en la frase «Hola Lumina» → «hola lo mina».
- Con ruido aparecen además «la nómina», «la luna», «luminaria», «niña», «elimina»…

## 3. Las tres opciones, con evidencia

### (a) Aceptar variantes — IMPLEMENTADO (`backend/voice/wake.py`)

Regla: si la frase **empieza** (o empieza tras «hola»/«oye») con algo que suena a «Lumina», esa palabra se reescribe como «lumina» **antes de mandar el
texto a las páginas**; `robot.js` no cambia. Solo mira las dos primeras palabras. Acepta: una lista corta de formas observadas
(`nómina`, `mina`, `lumínica`, `luminoso/a`), palabras que empiezan con «lu», tienen 5 letras o más y están a UNA letra de «lumina»
(`lubina`, `lumia`), y dos palabras sueltas que empiezan con `lu/luz/lo/lus` y pegadas están a ≤ 2 letras («luz mina», «lo mina»).
**No** acepta «la mina», «una mina», «lámina», «lucía», «luna», «camina», «termina», «elimina», ni la forma fuera del inicio.

Medido (voz sintética, Vosk real, `scripts/comparar_motores.py`; 30 frases con Lumina y 25 sin ella; **falsos** = frases sin «Lumina» que activan):

| Condición | Regla EXACTA (robot.js hoy) | Regla TOLERANTE (nueva) | Falsos exacta → tolerante |
|---|---|---|---|
| Silencio | 0/30 | **28/30** (30/30 en otra generación de las mismas frases) | 1/25 → 4/25 |
| Voz a RMS 1000 (tu nivel máximo medido) | 0/30 | 28/30 | 1/25 → 4/25 |
| Voz a RMS 300 | 4/30 | 28/30 | 1/25 → 4/25 |
| Ruido **blanco** +10 dB / +5 dB / 0 dB / −5 dB | 27 / 24 / 4 / 0 | 28 / 26 / 7 / 0 | 1→4 / 1→4 / 1→2 / 0→0 |
| **Murmullo** (3 voces hablando encima) +10 / +5 / 0 / −5 dB | 2 / 2 / 0 / 1 | **11 / 7 / 3 / 2** | 2→4 / 1→3 / 0→1 / 2→2 |

Lecturas:
1. **En silencio la regla tolerante resuelve el problema** (0 → 28 de 30), con la voz sintética.
2. **El nivel de voz no es el problema**: a RMS 300 y 1000 Vosk acierta igual. No se añadió ganancia digital (sería código sin evidencia).
3. **Con ruido de conversaciones el límite deja de ser la regla**: Vosk ni siquiera escribe el nombre (escribe lo que dicen las voces de fondo),
   y ninguna lista de variantes lo arregla. El murmullo de esta prueba son tres copias de la MISMA voz sintética hablando con claridad: es el
   peor caso, **no una predicción** de tu pasillo.
4. **El costo (falsos positivos), a la vista:** las 4 frases sin «Lumina» que activan son «**nómina** inicia sesión en el sistema», «**mina**
   de oro en el norte», «**luminoso**» y «esta luz **ilumina** la mesa» (esta última ya activaba con la regla exacta). Cada una es una
   frase real que EMPIEZA con la palabra. Están como pruebas (`test_falsos_positivos_conocidos_quedan_a_la_vista`) para que el riesgo no sea una sorpresa.
   Dónde importa: en la pantalla de espera, cualquier frase que empiece así despierta la presentación; los comandos siguen exigiendo
   además su propia palabra (inicia, detente…). Se apaga con `AETHER_VOICE_WAKE_FUZZY=0`. **No tengo el porcentaje real de falsos positivos con voz
   humana y ruido real**; las 25 frases son pocas y yo las escribí.

### (b) faster-whisper — **NO MEDIDO** (y por qué)

Medirlo exige instalar `faster-whisper` (y descargar el modelo de cada tamaño) en tu laptop. Quedó acordado que las instalaciones las haces
tú, así que **no instalé nada y no tengo ninguna cifra de Whisper**. Lo que sí se sabe y lo que no:
- El motor ya está integrado como adaptador (`AETHER_VOICE_ENGINE=whisper`, `AETHER_VOICE_MODEL=tiny|base|small`). Whisper escribe las palabras letra
  por letra, así que **no tiene la limitación de vocabulario** de Vosk; eso es un hecho del diseño, no una medición del resultado.
- *Hipótesis sin medir:* es más robusto al ruido que Vosk pequeño y cuesta más CPU y latencia (decodifica la frase entera al cerrarla). Su
  `initial_prompt` («Lumina.») podría ayudar a escribir el nombre, pero con ruido o silencio Whisper puede **escribir el prompt como si lo hubiera oído**
  y eso activaría a Lumina sola. Por eso es opt-in (`AETHER_VOICE_WHISPER_PROMPT`, vacío por defecto) y hay que medirlo.
- **Lo medido de Vosk en tu laptop** (para tener contra qué comparar): carga del modelo 1.0–1.6 s; memoria añadida 165 MB (silencio) a 288 MB (ruido a 0 dB); factor de
  tiempo real 0.06–0.28 (10 veces más rápido que el audio o mejor); latencia al cerrar la frase, p95, ~25–30 ms en silencio y hasta ~200 ms con ruido;
  CPU 6 % de un núcleo en silencio y hasta 22 % con ruido (algunas tandas se midieron mientras corrían otras pruebas, así que lo alto del rango puede estar inflado).
- **Cómo medir Whisper con TU voz** (V13, abajo): `scripts/grabar_pruebas.py` + `scripts/comparar_motores.py --motores vosk whisper:tiny whisper:base whisper:small`.
  Imprime carga, memoria, factor de tiempo real, latencia, CPU y activaciones de cada motor sobre el mismo audio.

### (c) Otra palabra de activación — medido, **no recomendado**

Se probaron 10 palabras (3 velocidades cada una, «\<palabra\>, inicia»), contando cuántas veces fue la **primera palabra** reconocida
(`scripts/experimentos/vosk_palabras_alternativas.py`, reproducible):

| Palabra | Silencio | Voz a RMS 300 | Murmullo +10 dB | Murmullo 0 dB | Blanco +5 dB | Total |
|---|---|---|---|---|---|---|
| atenea | 3/3 | 3/3 | 1/3 | 1/3 | 3/3 | 11/15 |
| aurora | 3/3 | 3/3 | 1/3 | 0/3 | 3/3 | 10/15 |
| estrella | 3/3 | 3/3 | 0/3 | 0/3 | 3/3 | 9/15 |
| sirena | 3/3 | 3/3 | 2/3 | 0/3 | 0/3 | 8/15 |
| asistente | 3/3 | 3/3 | 0/3 | 0/3 | 2/3 | 8/15 |
| cosmos, orión | 3/3 | 2/3 | 0/3 | 0/3 | 1/3 | 6/15 |
| robot | 3/3 | **0/3** | 0/3 | 0/3 | 0/3 | 3/15 |
| nébula, helios | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/15 (no están en el vocabulario) |

Conclusión: una palabra que **sí** está en el vocabulario se reconoce bien en silencio (3/3), pero **con murmullo se degrada igual que «Lumina»**:
cambiar de nombre no arregla el ruido. Y cambiaría la identidad del asistente en la interfaz, el guion, `robot.js` y los documentos. Con solo 3 muestras
por celda y una voz sintética, esto es una tendencia, no una tabla de precisión. **No se cambió la palabra.**

## 4. Lo que se implementó (sin romper el arranque de un solo comando)

| Cambio | Archivo | Por qué |
|---|---|---|
| Reescribe lo que suena a «Lumina» al inicio de la frase | `backend/voice/wake.py`, `voice/service.py` | Vosk no tiene la palabra (sección 2). Se apaga con `AETHER_VOICE_WAKE_FUZZY=0` |
| Vosk cierra la frase por **su** detector de fin de frase y el texto sale al momento | `voice/engine.py` (`accept` devuelve el texto), `voice/core.py` | Con ruido constante el umbral de energía nunca baja y la frase tardaba hasta 20 s en salir. Medido de punta a punta con Vosk real: latencia desde que termina la voz, **mediana 0.07 s en silencio** y **0.48 s con ruido blanco a +5 dB** |
| Tecla `w` en la ventana de voz = despertar a Lumina sin hablar | `voice/service.py`, `voice/console.py` | Con ruido, a veces ninguna regla basta: es la salida de emergencia, manda la palabra como texto, solo con el micrófono activo |
| `AETHER_VOICE_WHISPER_PROMPT` opcional | `voice/engine.py` | Para medir el prompt de Whisper sin dejarlo activado por defecto |
| `grabar_pruebas.py`, `comparar_motores.py`, `voz_sintetica.ps1` | `scripts/` | Medir con TUS grabaciones y reproducir estas cifras. `pruebas_voz/` está en `.gitignore` (el servicio nunca guarda audio; ese script sí, a propósito y solo donde le digas) |
| Corrección de un error mío | `scripts/probar_voz.py` | Reportaba **0.0 MB** de memoria en Windows siempre (el handle del proceso se truncaba a 32 bits). Corregido y probado contra una reserva real de 48 MB |

El arranque sigue siendo `.\iniciar_aether.ps1`: ninguna variable nueva es obligatoria.

## 5. Sobre tu ruido (voz máxima ~1000, picos de ruido ~3000)

- Con el ruido por encima de tu voz, **un umbral de energía no puede separarlas**; por eso las frases ahora las cierra el detector acústico de Vosk y no el
  umbral. El umbral (`AETHER_VOICE_VAD_THRESHOLD`, 500 por defecto) solo decide cuándo empezar a alimentar al reconocedor.
- Lo que más ayuda es **físico**, y ninguna regla lo sustituye: micrófono de diadema o muy cerca de la boca (sube la voz respecto al ruido de golpe),
  y quitar el «procesamiento de audio» de Windows si el micrófono lo tiene, o activarlo si cancela ruido (probar ambos: depende del equipo).
- La tecla `w` y, para la presentación, el clicker del expositor (`/show/ws`, mensaje `wake`) son las vías que no dependen de entender la voz.

## 6. Qué quedó verificado y qué no

**COMPROBADO**
- Dónde y cómo se compara la palabra (código, líneas citadas).
- Que «lumina», «lumia» y «luminia» no están en el vocabulario del modelo y que «ilumina», «nómina», «mina», «lumínica», «luminoso» sí (consulta al modelo real).
- 0/30 con la regla exacta y 28–30/30 con la tolerante en silencio, y el resto de la tabla de la sección 3(a), con Vosk real y voz sintética.
- La tubería completa (voz sintética → núcleo de voz real → Vosk real → reescritura → regla de `robot.js`): 30/30 en silencio, 24/30 con ruido blanco +5 dB, 2/30 con murmullo +10 dB.
- 346 pruebas del backend (344 pasan; fallan las 2 de Lumina de siempre): formas observadas, frases que no deben activar, falsos positivos conocidos, tecla `w`,
  cierre de frase por el motor, el adaptador de Whisper con prompt, los scripts de medición y la corrección de la memoria.

**NO COMPROBADO**
- **Nada con tu voz ni tu ruido real.** Falta V12 (grabar y comparar en el lugar).
- **Whisper entero** (CPU, latencia, memoria, precisión, efecto del prompt): no se instaló, no se midió.
- El porcentaje real de falsos positivos de la regla tolerante con habla humana: 25 frases escritas por mí con una voz sintética no lo estiman.
- Que `robot.js` en un navegador real reciba «lumina inicia» y active la pantalla de espera (la regla se probó por separado y el canal de voz con Node y un DOM simulado).
- Que con voces y ruidos distintos aparezcan formas nuevas («niña», «elimina»…) que esta regla no cubre; la lista de formas se amplía con lo que registre V12.

## 7. Cómo probarlo con tu voz (en este orden)

```
PS C:\...\INTEGRADORAAHORASI> backend\.venv\Scripts\python.exe scripts\grabar_pruebas.py --carpeta pruebas_voz --rondas 2
PS C:\...\INTEGRADORAAHORASI> $env:AETHER_VOICE_MODEL='C:\aether-voz\vosk-model-small-es-0.42'; backend\.venv\Scripts\python.exe scripts\comparar_motores.py --carpeta pruebas_voz --motores vosk
```
Hazlo **en el lugar y con la distancia de verdad** (~4 minutos). Mira «lo que escribió»: si se parece a «Lumina» y la regla tolerante activa casi siempre, estás bien;
si escribe cosas ajenas, es ruido y toca diadema o Whisper. Para Whisper (tú decides instalar; usa internet para bajar el modelo la primera vez):
```
PS C:\...\INTEGRADORAAHORASI> backend\.venv\Scripts\python.exe -m pip install faster-whisper
PS C:\...\INTEGRADORAAHORASI> backend\.venv\Scripts\python.exe scripts\comparar_motores.py --carpeta pruebas_voz --motores vosk whisper:tiny whisper:base whisper:small
PS C:\...\INTEGRADORAAHORASI> backend\.venv\Scripts\python.exe scripts\comparar_motores.py --carpeta pruebas_voz --motores whisper:base --prompt "Lumina."
```
Compara las tablas. Borra `pruebas_voz\` al terminar: son grabaciones de tu voz.
