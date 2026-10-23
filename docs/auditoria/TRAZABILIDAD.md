# Trazabilidad, verificación manual, cambios explicados y riesgos

Rama `jetson-agente` (desde `jetson-setup`). **COMPROBADO** = hay una prueba automática que pasó o una salida real
leída en la laptop. **NO COMPROBADO** = depende de hardware que solo Mario tiene (Jetson, Pi, micrófono, luz, Firefox con
HDMI) o no se ha corrido. Suite del backend al cierre: **264 pruebas, 262 pasan**; las 2 que fallan
(`test_robot_ask_conserva_varias_oraciones_reales_tras_filtrar`, `test_robot_ask_lista_numerada_tambien_se_detecta`,
de Lumina) **ya fallaban antes** de estos cambios y no se tocaron.

## 1. Requisito → archivos → prueba/verificación → estado

| Req. | Qué | Archivos | Prueba o verificación | Estado |
|---|---|---|---|---|
| RF-01 | Agente del Jetson abre SU cámara, percepción y `/stream` | `aether_agent.py`, `agent_camera.py`, `perception_pipeline.py` | `test_aether_agent.py` (incl. de punta a punta con uvicorn real y cámara falsa), `test_agent_camera.py`, `test_perception_pipeline.py`. **Humo real en la laptop** (cámara web + YOLO CPU): 30.0 FPS recibidos | **COMPROBADO** en laptop con dobles y webcam · **NO COMPROBADO en el Jetson** |
| RF-02 | Página lee dirección base por equipo; sin agente, cámara local | `agent_config.py`, `agent_routes.py` (`/config/agents`), `public_guard.py` (CSP), `camera-stream.js`, `line-vision.js`, `robot.js` | `test_agent_routes.py` (config, sustitución por equipo, CSP solo en `img-src`), `test_main.py` (sin agente, CSP). Sintaxis JS revisada con `node`. **Verificación manual V2** | Servidor **COMPROBADO**; el **JS en un navegador real NO COMPROBADO** |
| RF-03 | Solo observaciones JSON con ID estable; laptop idempotente | `agent_contracts.py`, `observation_outbox.py`, `observation_intake.py`, `agent_routes.py`, `main.py` | `test_agent_contracts.py`, `test_observation_outbox.py`, `test_agent_routes.py`, `test_main.py` (llegan a `/perception/recent-detections`; auto-refresh con agente no abre la cámara local) | **COMPROBADO** con dobles · en el humo con webcam **no se detectó ningún objeto, 0 observaciones** (NO COMPROBADO con detecciones reales; verificación V3) |
| RF-04b | La palabra de activación «Lumina» se detecta con el reconocedor local | `voice/wake.py`, `voice/engine.py` (Vosk cierra frases), `voice/core.py`, tecla `w` en `voice/service.py`, `scripts/comparar_motores.py`, `scripts/grabar_pruebas.py` | `test_voice_wake.py` (formas observadas, frases que NO deben activar, falsos positivos conocidos a la vista, tecla `w`, cierre de frase por el motor), `test_scripts_voz.py`; mediciones en `docs/auditoria/PALABRA_CLAVE.md` | Reescritura y cierre de frase **COMPROBADOS** con Vosk real y voz SINTÉTICA; **con tu voz y tu ruido NO COMPROBADO** (V12) · Whisper **NO MEDIDO** (V13) |
| RF-04 | Servicio de voz: micrófono de la laptop → texto por WebSocket, sin páginas abiertas | `voice/` (core, engine, audio, hublink, service), `voice_hub.py`, `robot.js` (oyente) | `test_voice_core.py`, `test_voice_service.py` (incl. servidor real + WebSocket real + página simulada) | Lógica y canal **COMPROBADOS** con audio simulado · **micrófono real, Vosk real y español NO COMPROBADOS** (V5–V7) |
| RF-05 | Aviso visible: línea persistente + notificación de Windows | `voice/console.py`, `voice/notify.py` | `test_voice_service.py` (banner, texto del aviso sin inyección, fallo de PowerShell) | Lógica **COMPROBADA** · **que Windows muestre el aviso NO COMPROBADO** (V8) |
| RF-06 | Interruptor de privacidad; sin audio en disco ni fuera de la laptop | `voice/core.py`, `voice/service.py`, `voice/audio.py` | `test_voice_core.py` (revisión estática: ningún `open(`/`wave`/`soundfile`), `test_voice_service.py` (tecla `p` suelta el dispositivo; arranque apagado) | **COMPROBADO** en código y pruebas · **icono de micrófono de Windows NO COMPROBADO** (V9) |
| RF-07 | Anti-eco | `voice/core.py`, `voice_hub.py`, `robot.js` | `test_voice_core.py` (tira lo reconocido, cola de 0.8 s, carrera), `test_voice_service.py` (extremo a extremo) | Lógica **COMPROBADA** · **eco real con tus bocinas NO COMPROBADO** (V10) |
| RF-08 | Un comando en la laptop; un paso en el Jetson (por SSH si se quiere) | `iniciar_aether.ps1`, `scripts/jetson/*.sh`, `scripts/ver-aether.sh` | `test_scripts_arranque.py`; `iniciar_aether.ps1 -SoloComprobar` **corrido de verdad** en la laptop (detectó que falta `CELDA_HMI_CLAVE` en su `.env`) | Laptop **COMPROBADO** parcial (solo `-SoloComprobar`) · **arranque completo, `-Jetson` y los `.sh` en el Jetson NO COMPROBADOS** (V1, V4) |
| RF-09 | Celda de la Pi con el mismo patrón, sin GPIO | `celda_agent.py`, `agent_camera.py` (`max_fps`), `process_usage.py` | `test_celda_agent.py` (análisis periódico, eventos con ID hacia la laptop, `/status`, red local, aislamiento de imports) | **COMPROBADO** con dobles · **Pi real NO COMPROBADA**; sin GPIO por regla |
| RNF-01 | `/status` con FPS de cámara, de entrega e inferencia por separado | `agent_camera.py`, `aether_agent.py`, `scripts/probar_agente.py` | `test_agent_camera.py` (cámara 100 FPS vs entrega 10 FPS), humo real | **COMPROBADO** el medidor · **≥30 FPS en el Jetson NO COMPROBADO** (V1) |
| RNF-02 | Presupuesto de CPU/RAM definido y medible | `docs/variables_entorno.md`, `/status.resources` | Reportado en `/status`. Medido solo en la laptop | Presupuesto de **diseño**; **NO MEDIDO** en Jetson |
| RNF-03 | Resiliencia: reconexión, descarte, cola acotada, apagado ordenado | `observation_outbox.py`, `voice/hublink.py`, `aether_agent.py`, `agent_camera.py` | `test_observation_outbox.py` (reintento, cola acotada, laptop se cae y vuelve), `test_voice_service.py` (reconexión), `test_agent_camera.py` (cámara que falla, procesador que falla) | **COMPROBADO** con dobles |
| RNF-04 | Seguridad: Privado, CSP mínima, validación, solo red local, amenazas | `lan_guard.py`, `public_guard.py`, `agent_contracts.py`, ADR 0012, `docs/guia_arranque.md` | `test_agent_routes.py` (403 fuera de red, 413, 422, Origin ajeno, tope de conexiones, `/voice` y `/config` cerrados al público) | **COMPROBADO** en pruebas · la **regla de firewall Privado NO COMPROBADA** (V4) |
| RNF-05 | Sin audio en logs | `voice/service.py` (solo longitud por defecto) | `test_voice_core.py` (estático), `test_voice_service.py` | **COMPROBADO** |
| RNF-06 | Mantenible por una persona | módulos pequeños de una responsabilidad | Revisión | Juicio, no medible |
| RNF-07 | Observabilidad | `/health`, `/status`, `backend/logs/voice.log`, errores con causa | Pruebas de `/status` y de errores | **COMPROBADO** |
| RNF-08 | Compatibilidad y flags | todo se activa por variable; defectos seguros | `test_main.py` (modo sin agente), suite completa | **COMPROBADO** |

## 2. Verificaciones manuales (las corres tú; nada de esto está medido)

Prompts: `PS C:\...>` laptop · `mario@mario-desktop:~$` Jetson.

| # | Qué | Comando | Salida esperada / criterio | Si falla |
|---|---|---|---|---|
| V1 | Agente del Jetson y FPS | `mario@mario-desktop:~$ bash ~/aether/scripts/jetson/iniciar-agente.sh` y luego `python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15` | `{"status":"ok"}`; `VEREDICTO` con `FPS recibidos ≥ 29.1`; `FPS de la cámara` cercano a 30; `inferencia` en ms; `recursos` | Mira `FPS de la cámara`: si ya es bajo, la cámara con poca luz es el límite. Log: `~/aether-agente.log` |
| V2 | La página muestra la cámara del JETSON | En la laptop, en `backend\.env`: `AETHER_PERCEPTION_AGENT_URL=http://<IP Jetson>:8001`; reinicia el servidor. En el Jetson (VNC): `bash ~/aether/scripts/ver-aether.sh` y pulsa «Iniciar cámara» | Se ve el video del Jetson (mueve la mano); **no** el de la laptop | F12 → Red: si la imagen se bloquea, mira la CSP en la respuesta de `/health`: debe incluir `http://<IP Jetson>:8001` en `img-src` |
| V3 | Las observaciones llegan al inventario | Con un objeto frente a la cámara: `PS> curl.exe -s "http://localhost:8000/perception/recent-detections?limit=3"` y `curl.exe -s http://<IP Jetson>:8001/status` | Aparecen detecciones con `detected_class`; en `/status`: `laptop.sent_total` crece, `reachable: true` | `laptop.last_error` dice por qué (red, firewall, URL) |
| V4 | Firewall solo Privado + red | `PS> .\iniciar_aether.ps1 -SoloComprobar` y, desde el Jetson, `curl -s -m 3 http://<IP laptop>:8000/health` | `Red '...': Private`, regla encontrada; `{"status":"ok"}` | Sección 5 de `docs/guia_arranque.md` |
| V5 | Calibrar el micrófono | `PS> backend\.venv\Scripts\python.exe scripts\probar_voz.py --mic 8` | Umbral sugerido; la voz se separa del ruido | Acerca el micrófono; `AETHER_VOICE_DEVICE` |
| V6 | Latencia y consumo del reconocedor | `PS> backend\.venv\Scripts\python.exe scripts\probar_voz.py --wav frase.wav --esperado "abre el inventario"` | `latencia al cerrar frase`, CPU, memoria y `WER`. Si el WER es alto, prueba `AETHER_VOICE_ENGINE=whisper` | — |
| V7 | Voz de punta a punta | `PS> .\iniciar_aether.ps1`; en el Jetson abre `robot.html`; di «Lumina, ¿qué puedes hacer?» | El punto de voz de la página se pone «escuchando» y Lumina responde | Consola de voz: `sin conexión con el servidor`; `backend\logs\voice.log` |
| V8 | Aviso | Pulsa `p` en la consola de voz | La línea cambia a `‖ MICRÓFONO PAUSADO` y aparece una notificación de Windows | Si no ves la notificación, revisa «Concentración» de Windows |
| V9 | El interruptor suelta el micrófono | Con la voz activa, mira el icono de micrófono de la barra de Windows; pulsa `p` | El icono desaparece al pausar; vuelve al reanudar | — |
| V10 | Eco | Con bocinas (sin audífonos), haz que Lumina hable una frase larga | La consola dice `Lumina habla: no escucho`; no se manda esa voz como pregunta nueva | Sube `AETHER_VOICE_ECHO_TAIL_S` o usa audífonos |
| V11 | Firefox con HDMI | Con monitor conectado, abre la página con el video | Fluido, sin saltos notorios | Mide con `top`; reporta |
| V12 | «Lumina» con TU voz y TU ruido (la prueba que decide) | `PS> backend\.venv\Scripts\python.exe scripts\grabar_pruebas.py --carpeta pruebas_voz --rondas 2` y luego `PS> $env:AETHER_VOICE_MODEL='C:ether-vozosk-model-small-es-0.42'; backend\.venv\Scripts\python.exe scripts\comparar_motores.py --carpeta pruebas_voz --motores vosk` | Para Vosk: `activa (regla tolerante)` cerca de todas las frases `wake_*` y `FALSOS (tolerante)` bajos. Si en tu ruido baja de ~70 %, mira V13 y la tecla `w` | Mira «lo que escribió»: si no se parece a «Lumina», es el reconocimiento (ruido), no la regla |
| V13 | Whisper contra Vosk, con TUS grabaciones (instalar es decisión tuya) | `PS> backend\.venv\Scripts\python.exe -m pip install faster-whisper` y `PS> ... comparar_motores.py --carpeta pruebas_voz --motores vosk whisper:tiny whisper:base whisper:small` (opcional `--prompt "Lumina."`) | Una tabla por motor con carga, memoria, factor de tiempo real, latencia al cerrar, CPU y activaciones. Whisper descarga su modelo la primera vez | Un motor que no esté instalado se salta y lo dice |

## 3. Cada cambio, en lenguaje simple (qué, por qué, cómo se prueba, cómo se revierte)

Todo está en commits pequeños de la rama `jetson-agente`; **revertir** un bloque es `git revert <commit>` (no hay `push`).

| Bloque (commit) | Qué hace | Por qué existe | Cómo se prueba | Cómo se revierte |
|---|---|---|---|---|
| Agente de la celda (Pi) | Un programa aparte para la Pi que solo lleva la celda | Que la Pi no cargue Lumina ni torch | `test_celda_agent.py`, `test_line_model.py` | `git revert 5cbb66f` |
| R0: ADR 0012 y contratos | Documentos: decisión, alternativas, riesgos y los JSON exactos | Que el diseño sea revisable antes del código | Lectura | `git revert 7088811` |
| R1+R2: agente del Jetson y entrega de observaciones | El Jetson abre su cámara, detecta, sirve el video y manda a la laptop solo datos con ID. La laptop los acepta una sola vez cada uno. Las páginas leen la dirección del video del servidor | El video no debe viajar por WiFi; la laptop sigue siendo el servidor | `test_aether_agent.py` y los demás de R1/R2; humo con webcam | Quita `AETHER_PERCEPTION_AGENT_URL` (todo vuelve a como era) o `git revert 3db4547` |
| R3: servicio de voz | Un proceso aparte en la laptop con el micrófono; reconoce en español sin internet y manda solo texto a Lumina | Lumina no oye en Firefox; el micrófono debe ser el de la laptop sin abrir una página | `test_voice_core.py`, `test_voice_service.py` | No lo arranques (`-SinVoz`), o `git revert e948528` |
| R4: arranque | `iniciar_aether.ps1`, `iniciar-agente.sh`, `ver-aether.sh` | Menos pasos y errores claros | `test_scripts_arranque.py`; `-SoloComprobar` real | Los scripts son nuevos: bórralos; el arranque manual sigue igual |
| R5: celda de la Pi | La Pi sirve su video, tiene `/status` y manda eventos de pieza con ID | Mismo patrón que el Jetson; sin tocar GPIO | `test_celda_agent.py` | `git revert 0b1cc0c` |
| R6: documentación | Esta carpeta, la guía de arranque, la tabla de variables, bitácora | Que un tercero lo reproduzca | Lectura | `git revert` del commit de docs |

## 4. Registro de riesgos

| Riesgo | Probab. | Impacto | Mitigación |
|---|---|---|---|
| Windows suspende la red o la laptop | Media | Alto | Plan de energía en «Nunca» (guía §1.5) |
| La red de la universidad bloquea el tráfico entre equipos | Media | Alto | USB-C RNDIS de respaldo; `ver-aether.sh` prueba varias IP |
| Eco: Lumina se oye a sí misma | Media | Medio | Pausa por `speaking` + cola; audífonos; V10 |
| El reconocedor consume demasiada CPU en la laptop | Baja/Media | Medio | Motor ligero por defecto; V6 mide antes de confiar |
| Vosk reconoce mal el español de Mario | Media | Medio | Cambiar a `whisper`; adaptador intercambiable |
| FPS limitados por la cámara con poca luz | Alta | Medio | `/status` los separa: se ve que es la cámara |
| Firefox lento en el Jetson | Media | Medio | V11 con HDMI; el diseño no depende de ello |
| El navegador bloquea el video del agente por la CSP | Baja | Alto | CSP ampliada solo con los agentes configurados; diagnóstico en V2 |
| Un equipo de la subred inyecta observaciones o texto falsos | Baja | Medio | Solo red local, sin autenticación (aceptado y documentado en ADR 0012) |
| Un reinicio de la laptop repite una observación ya contada | Media | Bajo | Límite conocido (IDs en memoria); documentado |
| El eventual `gpiod`/cableado de la celda | — | Alto | **Fuera de alcance**: no se instala ni se activa |
