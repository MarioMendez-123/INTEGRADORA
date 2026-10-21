# AETHER — video de presentación en vivo (Remotion)

Video de ~4:25 que acompaña en vivo la presentación de Aether. Lumina (el robot,
`dashboard/robot.js`) habla; el expositor habla; este video pone la narrativa
visual, la música y los efectos. **El video no genera voz.**

Todo tiempo de sincronización sale de la medición de Lumina (Fase 0), no de estimaciones.

## Estructura

| carpeta | qué hay |
|---|---|
| `timeline.json` | **Fuente de verdad**: cada cue con su disparador real (evento de Lumina o clicker), su tiempo en el MP4 (mediana medida) y de dónde sale ese número. Se regenera con `npm run timeline`. |
| `phase0/` | Medición de Lumina: `measure-lumina.mjs`, `analyze.mjs`, **`lumina_timing.json`**, `REPORT.md`, `recognition-test.html` (prueba de reconocimiento con la voz real), mp3 reales capturados. |
| `src/` → escenas | `src/scenes/*.tsx`: una escena por acto (Eye = la apertura que atraviesa todo el video). `src/Stage.tsx` las compone. |
| `audio/` | `engine.js` (partitura y síntesis en Web Audio: camas, golpes por cue, efectos, tabla de fader), voz real de Lumina en sus medianas y las mezclas. Es la carpeta pública de Remotion. |
| `music/` | Música **sin ducking**, con ducking, `stems/` (pad, bass, pulse, piano, perc, tex) y `live/` (camas en bucle por sección + golpes por cue). |
| `sfx/` | Efectos completos y `live/` por cue. |
| `player/` | Reproductor en vivo (entregable B): `controller.mjs` (sincronía, watchdog, clicker), `audio-live.mjs`, `sim.mjs` (Lumina simulada con la distribución medida), `main.tsx`. |
| `video/` | MP4 de ensayo y de escenario. |
| `assets/` | `demo_overlay.png` (marco de la demo 1440×810 con interior transparente). |
| `render/` | Fotogramas de revisión y verificación (`render/verificacion/`). |

## Comandos

```bash
npm i
npm run dev            # Remotion Studio
npm run timeline       # timeline.json desde phase0/lumina_timing.json
npm run music          # toda la música/efectos/mezclas (~20 min en esta laptop)
npm run render         # MP4 de ensayo + escenario + overlay de la demo
npm run test           # pruebas del controlador de sincronía
npm run show           # compila y sirve el reproductor en http://localhost:5055/player/
node scripts/levels.mjs      # niveles voz/música, clímax, silencio final
node scripts/sync-test.mjs   # sincronía por perfil de red y casos difíciles
node scripts/e2e-real.mjs [host:puerto] [--voz-local]   # corrida REAL robot.js + relevo + video (~1,144 caracteres de ElevenLabs; --voz-local = 0)
```

## Montaje en el escenario (equipos distintos)

1. **Laptop del backend**: `uvicorn main:app --host 0.0.0.0 --port 8000` (en `backend/`).
   Permitir Python en el firewall de Windows (red privada).
2. **Pantalla del robot**: abrir `http://<IP-backend>:8000/robot.html`, en primer plano y
   pantalla completa (si la pestaña queda en segundo plano, Chrome frena sus temporizadores).
3. **Equipo del video**: `npm run show` y abrir
   `http://localhost:5055/player/?backend=<IP-backend>:8000`. Clicker o clic una vez
   para armar (audio). Queda en negro hasta que Lumina se enciende.
   Sin Lumina: `http://localhost:5055/player/?clicker=1` — el mismo video, el mando
   arranca el guion y avanza las pausas humanas (espera de «Lumina» y cierre).

Canal: `robot.js` publica sus eventos reales (`wake`, `script-start`,
`line-request/start/end`, `await-lumina`, `heard-lumina`, `camera-on`) por
WebSocket al backend (`/show/ws`), que los reenvía al reproductor. Se eligió
WebSocket porque son equipos distintos (BroadcastChannel solo sirve dentro del
mismo navegador); el relevo mide 4 ms de mediana en la misma máquina.

### Clicker del expositor (en el equipo del video)
- `→` / `AvPág` / `Espacio` / `Enter`: **también arma el video** (no hace falta el mouse).
  Durante la espera de "Lumina" manda a Lumina el respaldo de "Lumina" (si el
  reconocimiento no la entendió); en el cierre avanza: *But we don't want it to end there* → **SEE** → **UNDERSTAND** →
  **DECIDE** → *not to do more* → *do it better* → *This is Aether.*
- Modo solo clicker: `/player/?clicker=1` — diapositivas con el mando, sin
  robot. `→` / `AvPág` avanza; `←` / `RePág` retrocede (si ya pasaste la demo,
  salta a la cámara). En la diapositiva de cámara pide el MJPEG real
  (`GET /perception/stream`); no deja seguir hasta que el stream llega (EN VIVO)
  o falla (SIN CÁMARA), y entonces el siguiente clicker confirma. `?feed=0`
  apaga el feed.
- `H` hold / resume del watchdog · `E` panel de ensayo · `F` pantalla completa.

### API mínima (consola del reproductor)
`__aether.api.cue(id)`, `.hold()`, `.resume()`, `.clicker()`; registro en `__aether.log`.

### Modo ensayo (`?ensayo=1` o tecla `E`)
Simula a Lumina con la distribución medida del perfil elegido, más un retraso
añadido (0–5 s), eventos perdidos y la duración del expositor. No necesita red.
