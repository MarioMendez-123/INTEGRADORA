# Verificación — AETHER (video en vivo)

Equipo de todas las pruebas: AMD Ryzen 5 4500U, 4 GB RAM, Windows 11, Chrome 154, Wi-Fi doméstico.
**Nada de esto se midió en el hardware ni en la red del escenario.**

## 1. Fase 0 — Lumina medida

`phase0/lumina_timing.json` y `phase0/REPORT.md`. Resumen (sin límite de red, 4 corridas, 128 frases):

| | mediana | p95 | máx |
|---|---|---|---|
| latencia pedido → audio (ElevenLabs) | 1,428 ms | 2,696 ms | 8,988 ms |
| hueco real − pausa diseñada | 1,438 ms | 2,643 ms | 6,213 ms |
| inicio guion → 1er audio | 2,057 ms | 3,036 ms | 3,198 ms |
| 1er audio → fin de "¿Quieren ver cómo funciono?" | 132.4 s | 145.1 s | 146.8 s |
| relevo WebSocket robot → video (misma máquina) | 4 ms | 38 ms | 304 ms |
| silencio al inicio del mp3 (voz tras `playing`) | 55 ms | 101 ms | 102 ms |

Slow 4G p95 5.2 s · 3G mediana 2.9 s / máx 7.3 s · offline: cae a la voz local "Microsoft Raul", latencia 50 ms.
Reconocimiento de "Lumina" (0.5): **no medido** (ver REPORT.md); herramienta lista en `phase0/recognition-test.html`.

## 2–3. Fotogramas clave y render completo

- 35 fotogramas clave revisados antes del render (`render/stills/sheet-*.png`). Errores encontrados y corregidos: elementos rellenos dibujándose antes de su cue (ruedas del esquema del robot tapaban la revelación), punto "en vivo" antes de la cámara, texto "COMUNICACIÓN" saliéndose del módulo.
- `video/aether_ensayo.mp4` (voz real de Lumina en sus medianas + frases + timecode) y `video/aether_escenario.mp4` (sin voz).

## 4. Duración (ffprobe)

Ambos: **265.045 s (4:25)**, 1920×1080, 30 fps, 7,950 frames, H.264 + AAC 48 kHz estéreo. Máximo del brief: 5:30. ✔

## 5a. Corrida REAL de extremo a extremo (Lumina real)

`scripts/e2e-real.mjs` → `render/verificacion/e2e_real.json`. `robot.html` con `robot.js` real y la voz real de ElevenLabs, backend real (relevo `/show/ws`) y el reproductor real, en contextos separados de Chrome **en la misma laptop** (no en dos equipos). Error medido contra el instante en que empieza a sonar cada mp3 real (evento `playing` + su silencio inicial medido).

| | resultado |
|---|---|
| sincronía (32 frases) | mediana **+3 ms** · p95 **75 ms** · máx **91 ms** — cumple ±250/±500 ✔ |
| relevo robot → video | mediana 2 ms · p95 6 ms · máx 32 ms (101 eventos) |
| clicker → Lumina confirma "Lumina" | 20 ms; clicker → suena "Dígame, señor." 1,808 ms (latencia de ElevenLabs) |
| watchdog / duplicados / errores JS | 0 / 0 / 0 |
| cierre por clicker | C1, SEE, UNDERSTAND, DECIDE, C3, C4, C5, silencio y tarjeta, en orden ✔ |

La misma corrida con la voz local de respaldo de Lumina (sin créditos) dio mediana +56 ms, p95 71 ms (`e2e_real_voz_local.json`). Un primer intento con ElevenLabs se quedó a medias: la máquina se congeló por falta de RAM y Lumina nunca recibió el respaldo del clicker. Las dos mitades se probaron por separado y funcionaban, y la corrida repetida pasó completa.

## 5–6. Sincronía por perfil de red y casos difíciles (distribución medida)

Reproductor real en Chrome; eventos de Lumina simulados con la distribución **medida** de cada perfil (`player/sim.mjs`); error = frame del cue en pantalla − inicio de la voz (incluye el relevo y el silencio inicial medidos). Objetivo: |error| ≤ 250 ms mediana, ≤ 500 ms p95.

| escenario | mediana | p95 |error| | máx |error| | watchdog | cues fuera de ±500 ms |
|---|---|---|---|---|---|
| sin límite (semilla 1) | -8 ms | 48 ms | 52 ms | 0 | ninguno |
| sin límite (semilla 7) | -9 ms | 51 ms | 53 ms | 0 | ninguno |
| Slow 4G | -7 ms | 52 ms | 172 ms | 0 | ninguno |
| 3G | -9 ms | 61 ms | 77 ms | 0 | ninguno |
| +1000 ms | -9 ms | 48 ms | 54 ms | 0 | ninguno |
| offline (voz local) | -13 ms | 51 ms | 54 ms | 0 | ninguno |
| voz muy tardía (+3 s por frase) | -9 ms | 50 ms | 52 ms | 0 | ninguno |
| 10 % de eventos perdidos | -10 ms | 2566 ms | 3346 ms | 2 | L14 (catch-up, +3118 ms), L15 (catch-up, +1121 ms), L28 (catch-up, +3346 ms), L30 (catch-up, +2114 ms) |
| red local caída a los 90 s + clicker | -43 ms | 1644 ms | 1833 ms | 24 | L22 (watchdog, +609 ms), L26 (watchdog, +573 ms), L30 (watchdog, -1819 ms), L31 (watchdog, -1833 ms), L32 (watchdog, -1500 ms) |
| expositor de 150 s + cierre por clicker | -8 ms | 53 ms | 55 ms | 0 | ninguno |

Error negativo = el efecto aparece antes de la primera sílaba; la voz empieza 55 ms después del evento `playing` y el relevo mide 4 ms (medianas de la Fase 0), por eso la mediana queda en −3…−14 ms sin necesidad de adelanto (`?lead=0`).

- **Perfiles de red medidos y voz muy tardía**: todos dentro del objetivo; cero disparos en falso del watchdog (espera la latencia máxima medida cuando Lumina ya pidió la frase, y se estira si Lumina viene lenta).
- **Eventos perdidos**: nunca se atora; los cues cuyo `line-start` se perdió se recuperan al llegar el fin de esa frase (tarde por lo que dura la frase). En TCP/WebSocket solo pasa durante una reconexión.
- **Red local caída**: el latido se corta, el video sigue en piloto automático al ritmo mediano medido y retrofechado; desfase máximo 1.8 s (antes de estas correcciones: 41 s). El clicker en la espera de "Lumina" avanza el video solo a los 2.5 s. Sin red no hay forma de ir más ajustado: el video ya no sabe cuándo habla Lumina.
- **Expositor largo**: el video espera sin avanzar (ambiente en bucle) y el cierre por clicker dispara los 7 cues en orden, más silencio y tarjeta.
- Corridas descartadas: una corrida congeló la página de prueba varios minutos (RAM libre ~0.3 GB); se repitió el escenario. Historial en `render/verificacion/sincronia_v1…v3.json`.
- Bugs encontrados por estas pruebas y corregidos: watchdog adelantando cues en picos reales de ElevenLabs; piloto automático que se atrasaba 9–41 s; pausa previa tomada con desfase de índice (L32 quedaba 52 s tarde en piloto automático).


## 7. Fotogramas del archivo final y niveles de audio

Fotogramas extraídos de `video/aether_escenario.mp4` (`render/final/sheet-escenario.png`): sin capa de ensayo, negro real en el silencio, tarjeta final. Niveles (`render/verificacion/niveles.json`):

| | valor |
|---|---|
| voz sobre música+efectos, por frase | mín **+9.5 dB** (L14) · mediana **+13.4 dB** · máx +21.2 dB (música ≈ 15–33 % de amplitud) |
| música: despertar / bajo el expositor / demo | −30.0 / −34.8 / −25.6 dBFS RMS |
| clímax 1 / clímax final vs. inicio | **+13.4 dB / +16.2 dB** |
| silencio antes de la tarjeta | pico −80.8 dBFS (silencio real) |
| fin del archivo (fundido) | pico −46.8 dBFS |
| loudness integrada | escenario −26.4 LUFS · ensayo −21.3 LUFS · música sin ducking −24.6 LUFS (picos ≤ −1.4 dBTP) |

Ducking del MP4: sidechain real desde la voz (seguidor de envolvente, −11 dB). En vivo la voz sale del robot, así que el reproductor atenúa con los eventos `line-start`/`line-end` (no hay señal de audio de la voz en ese equipo).

## 8. Texto en pantalla

Único texto que puede aparecer: AETHER · PERCIBIR, IDENTIFICAR, VERIFICAR, LOCALIZAR, REGISTRAR · PERCEPCIÓN, COMPUTACIÓN, COMUNICACIÓN, MOVILIDAD · SEE, UNDERSTAND, DECIDE · "Sistema autónomo de inventario" (tarjeta) · etiquetas "visualización conceptual" y "esquema ilustrativo". **Ninguna cifra** (auditado en el código de las escenas). SEE→UNDERSTAND→DECIDE va en letra de trazo abierto, nodos punteados y etiqueta de visualización conceptual (evolución buscada, no capacidad actual). IMAGEN → PERCEPCIÓN → DATOS → INFORMACIÓN se muestra solo con gráficos: esas palabras no están en la lista cerrada del brief. La demo no simula detecciones: su interior queda vacío (MP4) o muestra el feed real (reproductor).

## 9. Lo que NO pude verificar

- **Escuchar** la música, los efectos o la mezcla: solo medí niveles. Hay que oírla.
- **Ver el video en movimiento**: solo revisé fotogramas.
- **Reconocimiento de "Lumina"** con voz humana, micrófono y sala reales (latencia y acierto).
- El **hardware y la red del escenario** (pantalla del robot, equipo del video, Wi-Fi del lugar, proyector, bocinas).
- **Latencia del proyector** y de la salida de audio del robot (se suman al error de sincronía; no medibles aquí).
- La corrida real de extremo a extremo se hizo en **una sola laptop**: falta repetirla con la pantalla del robot y el equipo del video separados, sobre la red del lugar.
- El **feed real de la cámara** dentro del marco de la demo (se bloqueó en las pruebas porque cámara + YOLO no caben en 4 GB junto con lo demás).
- Fast 4G y +300 ms no se midieron (decisión de créditos); quedan acotados por sin límite y +1000 ms.
