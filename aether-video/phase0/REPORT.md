# Fase 0 — tiempos reales de Lumina

Generado 2026-09-29T08:25:15.940Z. Formato de cada celda: **mín / mediana / p95 / máx** en ms (n = muestras).

## 0.1 Cómo genera Lumina la voz (leído en dashboard/robot.js y backend/main.py)

- `speak(text)` → `POST /robot/tts` → backend → **ElevenLabs** (`eleven_multilingual_v2`, sin streaming, sin caché) → mp3 → `new Audio(url).play()`.
- Si el fetch o `play()` fallan → **speechSynthesis** del navegador (voz elegida por `pickBestSpanishVoice`; offline fue "Microsoft Raul es-MX").
- Cada frase se pide **después** de que termina la anterior + su pausa (no hay prefetch): hueco real = pausa diseñada + latencia de ElevenLabs.
- **No** reproduce `Lumina_guion_con_pausas.mp3` (ver 0.7).
- Eventos: antes de esta fase robot.js no exponía ninguno hacia afuera. Ahora publica por WebSocket (`/show/ws`): `wake`, `script-start`, `line-request`, `line-start` (el audio ya suena), `line-end`, `await-lumina`, `heard-lumina`, `camera-on`.
- Cambio de flujo aprobado: tras "¿Quieren ver cómo funciono?" el guion **espera a oír "Lumina"** (antes: temporizador de 70.3 s que podía hablar encima del expositor). Se agregó la variante "lumia" al patrón.

## 0.2–0.3 Método

Chrome real (playwright-core) con instrumentación externa (`addInitScript`, `performance.now()`) sobre fetch, `<audio>` y speechSynthesis. Perfiles con `Network.emulateNetworkConditions` (presets de DevTools). **Ojo:** esa limitación solo afecta el tramo navegador↔backend; el tramo backend↔ElevenLabs usa el internet real de esta máquina.

Corridas mínimas por decisión del usuario (créditos de ElevenLabs): 4 sin límite, 1 por perfil lento (Slow 4G, 3G, +1000 ms), 1 offline; Fast 4G y +300 ms no se midieron. La latencia no depende de la frase, así que el p95 se calcula juntando todas las frases (32 muestras por corrida). Caché fría/caliente se alternó, pero no aplica al TTS (es un POST sin caché).

## 0.5 Reconocimiento de voz: NO medido aquí

El reconocedor de Chrome (`webkitSpeechRecognition`) **ignora el micrófono falso** (`--use-file-for-fake-audio-capture`) y escucha el micrófono real del sistema: la prueba con voz sintética transcribió audio ambiental, así que se descartó y se borraron esos registros. La latencia y el acierto de "Lumina" dependen de la persona, el micrófono, la sala y la red: se miden en el escenario con `phase0/recognition-test.html` (misma configuración que robot.js). Sí se midió el tramo siguiente: desde que robot.js despacha "lumina" hasta que suena "Dígame, señor." (sección *interaction* de lumina_timing.json).

## 0.6 Dónde se midió

- **machine**: AMD Ryzen 5 4500U, 4 GB RAM (3.4 GB usables)
- **os**: Windows 11 Home Single Language build 26200
- **browser**: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/154.0.0.0 Safari/537.36
- **chrome_version**: 154.0.8037.58
- **mode**: Chrome real (no Chromium) vía playwright-core, headless, --mute-audio; backend local 127.0.0.1:8000; la limitación de red de DevTools solo afecta el tramo navegador↔backend, NO el tramo backend↔ElevenLabs (internet real de esta máquina).
- **internet**: Wi-Fi doméstico; a api.elevenlabs.io: DNS 11-79 ms, TCP 38-118 ms, TLS 83-201 ms, TTFB 141-274 ms (curl, 5 muestras, 2026-09-28)
- **stage_hardware_measured**: false

Las cifras valen solo para este equipo y esta red. **No se midió en el hardware ni en la red del escenario.**

## Resumen por perfil de red

| perfil | corridas | motor de voz | inicio guion → 1er audio | latencia por frase (pedido→audio, todas) | hueco real − pausa diseñada | total 1er audio → fin última frase | re-buffer |
|---|---|---|---|---|---|---|---|
| 3g | 1 | ElevenLabs (/robot/tts) | 2508 / 2508 / 2508 / 2508 | 2421 / 2870 / 4222 / 7302 (n=32) | 2441 / 2895 / 4247 / 7423 | 267608 / 267608 / 267608 / 267608 | 0 |
| lat1000 | 1 | ElevenLabs (/robot/tts) | 1458 / 1458 / 1458 / 1458 | 1034 / 1321 / 2190 / 2389 (n=32) | 1041 / 1347 / 2058 / 2278 | 214360 / 214360 / 214360 / 214360 | 1 |
| none | 4 | ElevenLabs (/robot/tts) | 1229 / 2057 / 3036 / 3198 | 1007 / 1428 / 2696 / 8988 (n=128) | 1009 / 1438 / 2643 / 6213 | 153098 / 210995 / 238612 / 242946 | 3 |
| offline | 1 | speechSynthesis · Microsoft Raul - Spanish (Mexico) (es-MX) | 1665 / 1665 / 1665 / 1665 | 32 / 50 / 871 / 1665 (n=32) | 34 / 54 / 193 / 685 | — | 0 |
| slow4g | 1 | ElevenLabs (/robot/tts) | 6663 / 6663 / 6663 / 6663 | 1149 / 1860 / 5242 / 6663 (n=32) | 1153 / 1852 / 4094 / 6159 | 237174 / 237174 / 237174 / 237174 | 1 |

## Por frase — perfil sin límite (4 corridas)

| # | frase | pausa diseñada | hueco real antes (mediana) | duración (mín/med/máx) | latencia (med) |
|---|---|---|---|---|---|
| 1 | Buenas tardes. | 0 | — | 1113 / 1196 / 1461 | 2057 |
| 2 | Mi nombre es Aether. | 0 | 1177 | 1449 / 1532 / 1582 | 1165 |
| 3 | Soy un sistema autónomo de inventario. | 0 | 1306 | 2179 / 2322 / 2377 | 1305 |
| 4 | Yo observo. | 0 | 1254 | 1002 / 1044 / 1081 | 1253 |
| 5 | Eso es lo primero que hago. | 0 | 1430 | 1729 / 1834 / 1874 | 1421 |
| 6 | Una imagen aparece. | 800 | 1406 | 1320 / 1382 / 1431 | 1378 |
| 7 | Encuentro algo. | 800 | 2112 | 1155 / 1160 / 1224 | 1282 |
| 8 | Intento identificarlo. | 1300 | 1976 | 1555 / 1581 / 1641 | 1167 |
| 9 | Pero encontrar algo no significa entenderlo. | 0 | 2813 | 2455 / 2479 / 2520 | 1503 |
| 10 | Una cámara puede detectar un objeto. | 0 | 1321 | 2177 / 2221 / 2299 | 1319 |
| 11 | Pero detectar no significa saber qué es. | 1200 | 1381 | 2380 / 2415 / 2488 | 1379 |
| 12 | Y saber qué es no significa necesariamente saber dónde está. | 1300 | 2743 | 3835 / 3894 / 4005 | 1533 |
| 13 | Mucho menos significa saber si esa información es confiable. | 2000 | 2907 | 3398 / 3429 / 3493 | 1597 |
| 14 | Por eso, mi proceso no termina cuando encuentro algo. | 0 | 3640 | 3040 / 3108 / 3124 | 1618 |
| 15 | Percibir. | 500 | 1276 | 950 / 1051 / 1130 | 1249 |
| 16 | Identificar. | 500 | 1697 | 1227 / 1273 / 1311 | 1191 |
| 17 | Verificar. | 500 | 1823 | 967 / 1039 / 1047 | 1314 |
| 18 | Localizar. | 500 | 1828 | 1076 / 1087 / 1136 | 1255 |
| 19 | Registrar. | 1000 | 1875 | 1021 / 1031 / 1056 | 1356 |
| 20 | Ese es el proceso que permite transformar una imagen en información. | 1500 | 2599 | 4007 / 4124 / 4249 | 1562 |
| 21 | Para hacerlo, necesito diferentes sistemas trabajando juntos. | 1200 | 3311 | 3682 / 3691 / 3707 | 1803 |
| 22 | Un sistema de percepción, para observar mi entorno. | 1000 | 2645 | 2947 / 3072 / 3285 | 1435 |
| 23 | Un sistema de computación, para procesar e interpretar lo que observo. | 1000 | 2940 | 4031 / 4129 / 4230 | 1935 |
| 24 | Un sistema de comunicación, para convertir esa información en datos útiles. | 1000 | 2944 | 4165 / 4408 / 4460 | 1938 |
| 25 | Y un sistema de movilidad, para llevar esa capacidad de percepción hasta donde sea necesaria. | 1500 | 2854 | 4838 / 4968 / 5231 | 1846 |
| 26 | No soy solamente una cámara. | 900 | 2861 | 1687 / 1693 / 1734 | 1353 |
| 27 | No soy solamente un robot. | 1200 | 2292 | 1596 / 1688 / 1740 | 1389 |
| 28 | Soy la integración de estos sistemas para resolver un problema. | 1500 | 2652 | 3316 / 3375 / 3431 | 1439 |
| 29 | ¿Quieren ver cómo funciono? | 58000 | 3091 | 1511 / 1598 / 1745 | 1504 |
| 30 | Dígame, señor. | 4000 | — | 1093 / 1179 / 2126 | 2066 |
| 31 | En un momento. | 800 | 5265 | 1033 / 1076 / 1087 | 1252 |
| 32 | Esto es lo que soy capaz de ver ahora mismo. | 30000 | 2247 | 2671 / 2721 / 2814 | 1442 |

## 0.7 — referencia vs. voz real

**Difieren: Lumina no reproduce el mp3 de referencia; genera cada frase con ElevenLabs en el momento** (cada corrida produce audio distinto). El formato de la referencia (24 kHz / 48 kbps mono) coincide con el de Microsoft Edge TTS, pero su origen no está registrado en el repo. Referencia:stream|codec_name=mp3|sample_rate=24000|channels=1|bit_rate=48000, total 250128 ms. Voz real capturada: stream|codec_name=mp3|sample_rate=44100|channels=1|bit_rate=128000.

| # | frase | voz en referencia (ms) | voz real mediana (ms) | diferencia |
|---|---|---|---|---|
| 1 | Buenas tardes. | 814 | 1071 | 257 |
| 2 | Mi nombre es Aether. | 1061 | 1437 | 376 |
| 3 | Soy un sistema autónomo de inventario. | 1996 | 2325 | 329 |
| 4 | Yo observo. | 753 | 1019 | 266 |
| 5 | Eso es lo primero que hago. | 1414 | 1802 | 388 |
| 6 | Una imagen aparece. | 1166 | 1330 | 164 |
| 7 | Encuentro algo. | 846 | 1087 | 241 |
| 8 | Intento identificarlo. | 1293 | 1566 | 273 |
| 9 | Pero encontrar algo no significa entenderlo. | 2304 | 2407 | 103 |
| 10 | Una cámara puede detectar un objeto. | 1963 | 2112 | 149 |
| 11 | Pero detectar no significa saber qué es. | 2289 | 2301 | 12 |
| 12 | Y saber qué es no significa necesariamente saber dónde está. | 3355 | 3944 | 589 |
| 13 | Mucho menos significa saber si esa información es confiable. | 3225 | 3313 | 88 |
| 14 | Por eso, mi proceso no termina cuando encuentro algo. | 2998 | 3006 | 8 |
| 15 | Percibir. | 541 | 990 | 449 |
| 16 | Identificar. | 830 | 1203 | 373 |
| 17 | Verificar. | 679 | 1019 | 340 |
| 18 | Localizar. | 661 | 1015 | 354 |
| 19 | Registrar. | 693 | 1019 | 326 |
| 20 | Ese es el proceso que permite transformar una imagen en información. | 3715 | 4014 | 299 |
| 21 | Para hacerlo, necesito diferentes sistemas trabajando juntos. | 3681 | 3569 | -112 |
| 22 | Un sistema de percepción, para observar mi entorno. | 2872 | 3102 | 230 |
| 23 | Un sistema de computación, para procesar e interpretar lo que observo. | 3743 | 4125 | 382 |
| 24 | Un sistema de comunicación, para convertir esa información en datos útiles. | 4331 | 4304 | -27 |
| 25 | Y un sistema de movilidad, para llevar esa capacidad de percepción hasta donde sea necesaria. | 5123 | 4907 | -216 |
| 26 | No soy solamente una cámara. | 1632 | 1672 | 40 |
| 27 | No soy solamente un robot. | 1586 | 1672 | 86 |
| 28 | Soy la integración de estos sistemas para resolver un problema. | 3249 | 3291 | 42 |
| 29 | ¿Quieren ver cómo funciono? | 1350 | 1389 | 39 |
| 30 | Dígame, señor. | 1242 | 1097 | -145 |
| 31 | En un momento. | 756 | 957 | 201 |
| 32 | Esto es lo que soy capaz de ver ahora mismo. | 2198 | 2691 | 493 |
