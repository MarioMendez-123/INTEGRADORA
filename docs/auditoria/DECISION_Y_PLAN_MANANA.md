# Decisión de arquitectura y plan para mañana (2026-10-23)

> **SUPERADA** por `DECISION_FINAL_AGENTES.md` y la ADR 0012: Mario rechazó dejar la cámara del Jetson para una «etapa 2». Se conserva como historia.

> BORRADOR SIN COMMIT. Esta decisión la tomé yo directamente desde la auditoría (`AUDITORIA_FASE_A_B.md`) y la tarea base (`TAREA_BASE_ARENAS.md`). **No pasó por ningún torneo `/arena`**: se canceló. Es una recomendación razonada, no un resultado de competencia. Nada de lo de abajo se ha probado en el Jetson, la Pi ni en el firewall de Windows; las etiquetas **[CÓDIGO]**, **[MEDIDO]**, **[REFERENCIA]** y **[SUPUESTO]** significan lo mismo que en la auditoría.

## 1. Decisión

**Opción A reforzada: «dejarlo como está», con arranque en un comando, red estable y guía mejor.** No se cambia la arquitectura de código mañana.

- La **laptop** sigue siendo el único servidor (`backend/main.py`, puerto 8000).
- El **Jetson** y la **Pi** muestran las páginas de la laptop en un navegador.
- El **video del Jetson** (cámara + YOLO) se puede ver localmente corriendo un segundo servidor en el Jetson (`:8001`), que ya se probó una vez [REPORTADO, SETUP_JETSON.md §8]. Es **opcional** mañana y va aparte, porque agrega una pieza.
- La **Pi no se toca mañana** [SUPUESTO S2, S11].
- **No** se agregan: MQTT, ROS 2, Tailscale, Docker, WebRTC, aplicación nativa, `systemd` ni `gpiod`.

### Por qué gana frente a las otras

Contra las restricciones de Mario (un día; el arranque solo puede simplificarse; sin piezas nuevas pesadas; honestidad):

| Opción | Cabe en un día | Arranque | Piezas nuevas | Veredicto |
|---|---|---|---|---|
| **A reforzada** (esta) | Sí: scripts y guía; sin cambios de lógica | Se simplifica (un comando por equipo) | Dos scripts pequeños | **Elegida** |
| **B. App nativa** en el Jetson | No. Hay que escribirla y no hay medición de que ahorre algo (no se encontró ninguna comparación Qt/Tauri vs navegador en Pi 4/Jetson [REFERENCIA]). La voz no se resuelve: `SpeechRecognition` es del navegador [CÓDIGO robot.js:94] y una app nativa necesitaría STT local (p. ej. faster-whisper, con instalación CUDA que hoy no existe en el Jetson [REFERENCIA hub.docker.com/r/cbinckly/speaches]) | Se complica | Una app entera | Descartada para mañana. Se revisa si Firefox con monitor HDMI sigue lento (S5) |
| **C. Agentes por equipo + reenvío** (ADR 0011) | No. Hay que escribir el agente del Jetson, el endpoint de observaciones y una dirección base configurable en las páginas | Se complica | Agentes + variables `*_AGENT_URL` | Etapa 2, separada y clara |

### Lo que esta decisión NO resuelve (honestidad)

1. **La página de la laptop no usa la cámara del Jetson.** Los streams de `main.py` abren la cámara del proceso donde corre [CÓDIGO camera_publisher.py, main.py:632, 670]. Con el servidor en la laptop, ven la cámara de la laptop.
2. **Firefox por VNC va lento** (~87 % de un núcleo, render por software [REPORTADO]). No está medido con monitor HDMI. Mañana puede seguir lento.
3. **Lumina no oye en el Jetson**: Firefox no trae `SpeechRecognition` activo [REPORTADO, CÓDIGO]. La voz sigue en la laptop con Chrome [S4]. Ante el jurado se dice así: «Lumina oye en la laptop; el Jetson muestra».
4. **La celda** (`celda.html`) servida por la laptop mostraría el estado de la celda de la LAPTOP (simulado o sin GPIO), no el de la Pi, que aún no se conecta.
5. **Si la ganadora depende de algo no medido:** depende de S5 (rendimiento de Firefox con HDMI), S7 (que el WiFi «Mecatronica» siga dejando ver laptop y Jetson) y S4 (sin micrófono en el Jetson).

## 2. Corrección a la corrección 6 de Mario (verificada en el código)

La idea de que `<img src="http://jetson:8001/stream">` dentro de una página servida por la laptop carga directo del Jetson **sin CORS es cierta para el navegador**, pero con el código de hoy **la política de seguridad (CSP) lo bloquea**: `backend/public_guard.py` agrega `img-src 'self' data: blob:` y `connect-src 'self' ...` a TODAS las respuestas (líneas 45-56; se aplica en `security_headers` y `send_guarded`, líneas ~147-232) [CÓDIGO]. Para usar esa vía hace falta ampliar `img-src` con la IP del Jetson (por ejemplo con una variable de entorno) y que `dashboard/line-vision.js` (línea 29) y `camera-stream.js` acepten una dirección base. Los `fetch` además necesitarían CORS y `connect-src`. Es un cambio **pequeño**, pero es **código y va a la etapa 2**. No se probó en un navegador.

## 3. Supuestos que mueven la decisión (lista completa en `TAREA_BASE_ARENAS.md`, S1-S13)

| Supuesto | Si es falso, cambia |
|---|---|
| S1 cableado no confirmado → GPIO inactivo | Con GPIO directo confirmado, la Pi podría activar salidas tras una prueba sin carga. Con PLC/Modbus no se usarían los pulsos GPIO |
| S3 la Pi no tiene pantalla | Con pantalla propia, la Pi necesita navegador/kiosko propio y se mide la RAM |
| S4 sin micrófono en el Jetson | Con micrófono: puente de micrófono por el WebSocket `/show/ws` o STT local |
| S5 sin garantía de monitor HDMI | Con HDMI fluido, Firefox basta y la app nativa pierde sentido; sin HDMI y lento, ver el Jetson desde la laptop |
| S7 el WiFi «Mecatronica» es la ruta fiable | Si se bloquea, usar USB-C RNDIS (`192.168.55.x`) |
| S10 no hay agente del Jetson | Si existiera uno funcional, la etapa 2 cuesta menos |

## 4. Plan para mañana (con prompts, salida esperada y qué hacer si falla)

Prompts: `PS C:\...>` laptop (PowerShell) · `mario@mario-desktop:~$` Jetson · la Pi no entra mañana.

**Paso 0 — clave de la celda (laptop, antes de arrancar).** Desde esta semana la contraseña de la HMI de la celda ya no está en el código: sin `CELDA_HMI_CLAVE` nadie puede iniciar sesión y Arranque/Paro no responden [CÓDIGO cell_hmi.py]. `backend/.env` se carga solo y está fuera de git [CÓDIGO main.py:53-55].
```
PS C:\Users\mende\Downloads\INTEGRADORAAHORASI> notepad backend\.env
```
Agrega una línea `CELDA_HMI_CLAVE=<tu clave>` (no la pegues en el chat ni en el repo) y guarda. Si no lo haces, la página de la celda carga pero el login falla.

**Paso 1 — red de la laptop.**
```
PS C:\...> Get-NetConnectionProfile | Format-Table Name,InterfaceAlias,NetworkCategory
PS C:\...> ipconfig | Select-String IPv4
```
Esperado: la conexión WiFi aparece como `Private` y la IPv4 es `10.4.5.52` (universidad) o `192.168.100.14` (casa) [MEDIDO ayer]. Si dice `Public`, en PowerShell **de administrador**: `Set-NetConnectionProfile -InterfaceAlias "<el alias que salió>" -NetworkCategory Private`. Si la IP es otra, apúntala: es la que va en los pasos de abajo.

**Paso 2 — firewall (una sola vez; PowerShell de administrador).**
```
PS C:\WINDOWS\system32> New-NetFirewallRule -DisplayName "Aether 8000 (red local)" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Any -RemoteAddress LocalSubnet
```
Esperado: imprime la regla con `Enabled : True` y `Action : Allow`. Abre el puerto 8000 para cualquier perfil pero solo a equipos de la misma subred. Es un compromiso: más práctico que depender del perfil Privado, menos estricto que hoy. Si dice «Acceso denegado», abre PowerShell como administrador. Esta regla **no se ha probado**.

**Paso 3 — arrancar el servidor (laptop).**
```
PS C:\Users\mende\Downloads\INTEGRADORAAHORASI\backend> .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```
Esperado en el log: `Servidor backend iniciado.` y `Uvicorn running on http://0.0.0.0:8000`. En otra ventana: `curl.exe -s http://localhost:8000/health` → `{"status":"ok"}`. Si el puerto está ocupado, puede ser `lumina-agent` (también usa el 8000): ciérralo.

**Paso 4 — ¿el Jetson ve a la laptop?** Entra por SSH desde la laptop (`ssh jetson-uni`, o `ssh mario@<IP del Jetson>`):
```
mario@mario-desktop:~$ ip -4 -br addr
mario@mario-desktop:~$ curl -s -m 3 http://10.4.5.52:8000/health
```
Esperado: una IP `10.4.5.x` en la interfaz WiFi y `{"status":"ok"}`. Si da timeout: (a) si el Jetson está en `10.4.7.x` (cable), está en otra subred: usa el WiFi (`nmcli radio wifi on`, y apaga el cable si vuelven los cortes de SSH); (b) respaldo: USB-C RNDIS. La laptop tendría `192.168.55.100`: `curl -s -m 3 http://192.168.55.100:8000/health`; (c) si sigue sin responder, es el firewall o el perfil: repite los pasos 1 y 2.

**Paso 5 — mostrar las interfaces en el Jetson.** Desde el terminal DENTRO de la sesión VNC (no por SSH, porque `DISPLAY` va vacío por SSH [REPORTADO]):
```
mario@mario-desktop:~$ firefox http://10.4.5.52:8000/
```
Esperado: el dashboard carga (lento por VNC). `robot.html` muestra la cara pero no oye. Si prefieres pantalla completa: `firefox --kiosk http://10.4.5.52:8000/robot.html` (opción de Firefox, **sin probar aquí**). Si abrir Firefox falla con error de pantalla, es porque el terminal no es el de VNC.

**Paso 6 — OPCIONAL, solo si sobra tiempo: video del Jetson en el propio Jetson.** Ya se probó una vez [REPORTADO]. Arranca el backend del Jetson en `tmux` (para que un corte de SSH no lo mate):
```
mario@mario-desktop:~$ tmux new -s trabajo        # o: tmux attach -t trabajo
mario@mario-desktop:~$ cd ~/aether/backend && source .venv/bin/activate && export YOLO_AUTOINSTALL=False
mario@mario-desktop:~$ python -c "import gpiod"
```
Esperado en la última: `ModuleNotFoundError: No module named 'gpiod'`. **Si imprime algo, NO sigas.** Después:
```
mario@mario-desktop:~$ PERCEPTION_CAMERA_BACKEND=v4l2 PERCEPTION_CAMERA_FOURCC=MJPG PERCEPTION_CAMERA_WIDTH=640 PERCEPTION_CAMERA_HEIGHT=480 python -m uvicorn main:app --host 0.0.0.0 --port 8001
```
En otra terminal de VNC: `firefox http://localhost:8001/perception/stream`. Esperado: video de la cámara USB con cajas de YOLO. FPS **no medido**; la cámara debe tener buena luz. Posibles problemas: Spotify avisa que el 8888 está ocupado (se ignora); el Jetson va en `76e975c` y la rama remota está más adelante [REPORTADO SETUP_JETSON.md §10]: `cd ~/aether && git pull` antes si falta algo; no abras Percepción y Visión de línea a la vez (misma cámara).

## 5. Cambios mínimos de código/scripts propuestos (NO hechos; piden tu aprobación)

Para el plan de mañana (opcionales; el plan funciona también a mano):
1. **`iniciar_aether.ps1`** (nuevo, en la raíz): entra a `backend/`, imprime las IPv4 de la laptop y las URLs para el Jetson, y arranca `uvicorn` con `--host 0.0.0.0 --port 8000`. Por qué: arranque en un solo comando.
2. **`scripts/ver-aether.sh`** (nuevo; se copia al Jetson): lee una lista de IPs candidatas de `~/.aether-host` (por ejemplo `10.4.5.52`, `192.168.100.14`, `192.168.55.100`), prueba `curl -m 2 /health` en cada una y abre Firefox en la primera que responde. Por qué: la red cambia entre la universidad, la casa y USB, y un tercero no conoce tus IPs.
3. **`backend/.env`**: línea `CELDA_HMI_CLAVE=...` (no se versiona).
4. **`COMANDOS_LINUX.md` y `URLS_Y_COMANDOS.md`**: una sección «Arranque en 5 pasos» con lo de arriba y quitar «celda: estado simulado».

Etapa 2 (DESPUÉS, no mañana):
5. `backend/public_guard.py`: `img-src` ampliable por variable de entorno (p. ej. `AETHER_IMG_EXTRA`).
6. `dashboard/line-vision.js` y `camera-stream.js`: dirección base del stream configurable.
7. Un agente mínimo del Jetson (solo cámara + YOLO, sin Lumina) reutilizando `CameraPublisher`, con endpoint de observaciones hacia la laptop.
8. `systemd` en el Jetson y la Pi para arranque automático y reinicio.

## 6. Lo diferido para la Pi, en este orden

1. Que tu equipo confirme el cableado (GPIO directo + LOGO, o PLC/Modbus). Sin esto: sin `gpiod`, sin GPIO, sin cargas.
2. Configurar la Pi: SO, versión de Python (≥ 3.10), RAM, SSH, cámara V4L2 MJPG 640x480.
3. Medir en la Pi: OpenCV 4.6 lee el ONNX, tiempo por análisis y CPU con y sin pieza, FPS.
4. Probar que `celda_agent.py` sirve su propia `celda.html` y su video localmente, y que la laptop solo consulta JSON (`/line/cell/status`).
5. Estado seguro de los relevadores: medir con LED o multímetro el nivel de los pines 8 y 9 al arrancar la Pi y al matar el proceso (`kill -9`) **antes** de conectar una carga. El paro de emergencia en hardware cableado, independiente de la Pi y de la red [REFERENCIA, fuentes secundarias].
6. Solo entonces `gpiod` y pulsos reales; la decisión FAIL vive en la Pi; el rechazo debería confirmarse con un sensor (IR2).
7. Ajustar `LINE_ANALISIS_CADA_S` y `LINE_ESTABLES` con la velocidad real de la banda.

## 7. Riesgos y lo que no se puede afirmar

- Nada de este plan se ha ejecutado. Los comandos de firewall, `nmcli` y `firefox --kiosk` son estándar pero **sin probar en estos equipos**.
- La regla `-Profile Any -RemoteAddress LocalSubnet` abre el 8000 a toda la subred en cualquier perfil. En la red de la universidad eso incluye a otros dispositivos de esa subred (el backend no tiene usuarios; `PublicGuard` solo filtra por IP). Si prefieres no abrirlo así, usa perfil Privado y regla solo para Privado, y el USB-C RNDIS como respaldo.
- Sin `CELDA_HMI_CLAVE` la celda no acepta Arranque/Paro.
- La decisión no pasó por un torneo; si quieres una segunda opinión formal, la `--quick` de 16 agentes sigue disponible (4-8 millones de tokens, estimación).
