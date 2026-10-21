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

{{DONDE}}

Las cifras valen solo para este equipo y esta red. **No se midió en el hardware ni en la red del escenario.**

