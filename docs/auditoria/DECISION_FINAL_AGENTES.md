# Decisión final: cámaras en su equipo, micrófono de la laptop y arranque simple

**Esto reemplaza a `DECISION_Y_PLAN_MANANA.md`** («dejarlo como está, reforzado»), que Mario rechazó: dejar la cámara
del Jetson para una «etapa 2» no cumplía el objetivo. Estado: **propuesta implementada en la rama `jetson-agente`, sin
push, no aceptada todavía por Mario, y sin probar en el Jetson, la Pi ni con el micrófono real.** El razonamiento
completo, las alternativas descartadas y el modelo de amenazas están en
`docs/architecture/decisions/0012-agentes-de-camara-y-voz-local.md`.

## Qué se decidió

1. **Cada cámara se procesa y se muestra en su propio equipo.** Un agente en el Jetson (`backend/aether_agent.py`,
   puerto 8001) abre la cámara del Jetson, corre YOLO + códigos + ArUco y sirve el video anotado. A la laptop solo
   llegan observaciones en JSON con un identificador por evento. La laptop sigue siendo el servidor y la página se sigue
   abriendo en el Jetson.
2. **La página lee la dirección del video del servidor** (`GET /config/agents`). Si el que mira es el mismo equipo del
   agente, la dirección sale como `127.0.0.1` y el video no sale de ese equipo. Sin agente configurado, todo como antes.
3. **El micrófono de Lumina es el de la laptop**, con un proceso aparte (`python -m voice.service`) que reconoce español
   localmente y manda **solo texto** por WebSocket a las páginas de Lumina que no tienen reconocimiento propio (Firefox
   en el Jetson). No necesita ninguna página abierta. Aviso persistente, notificación de Windows, interruptor y anti-eco.
4. **Arranque más corto**: `iniciar_aether.ps1` (laptop) y `iniciar-agente.sh` / `ver-aether.sh` (Jetson). El arranque
   manual anterior se conserva.
5. **La Pi sigue el mismo patrón, sin GPIO**: sirve su propio video y `celda.html`, expone `/status` y manda eventos de
   pieza con ID a la laptop, que solo los anota.

**Descartado a propósito:** TensorRT (no se puede sostener ni documentar sin medir en el Jetson), `systemd` (otra pieza
que mantener; `tmux` ya es el procedimiento), WebRTC/RTSP, MQTT, ROS 2, Docker, Tailscale, aplicación nativa.

## Qué NO se pudo comprobar (y por qué)

- **Nada se corrió en el Jetson ni en la Pi.** No tengo acceso a ellos.
- **FPS en el Jetson:** el objetivo de ≥ 30 FPS es de **diseño**. En la laptop (cámara web + YOLO en CPU) se midieron
  30.0 FPS de cámara, de entrega y recibidos; eso no dice nada del Jetson, y esa prueba no detectó ningún objeto.
- **El micrófono, Vosk y el español de Mario:** el núcleo de voz está probado con audio simulado y con un servidor y un
  WebSocket reales, pero no con el micrófono ni con el reconocedor real (no están instalados: se instalan con un
  comando que tú corres, `docs/guia_arranque.md` §1.4). `scripts/probar_voz.py` mide latencia, CPU y errores.
- **Firefox en el Jetson** mostrando el video, y **la regla de firewall solo Privado**: sin probar.
- **Que Windows muestre la notificación** y que el icono de micrófono se apague al pausar.

## Hallazgo de esta sesión

`iniciar_aether.ps1 -SoloComprobar` corrió de verdad en esta laptop y detectó que **`backend\.env` no tiene
`CELDA_HMI_CLAVE`**: sin ella nadie inicia sesión en la celda y Arranque/Paro no responden. (Consecuencia de sacar la
contraseña `admin/admin` del código.) El script nunca imprime valores del `.env`.

## Plan de prueba para mañana (orden recomendado)

1. **Laptop — comprobar:** `PS C:\...\INTEGRADORAAHORASI> .\iniciar_aether.ps1 -SoloComprobar`. Resuelve lo que marque en
   rojo (clave de la celda, firewall Privado). Esperado al final: `Todo en orden`.
2. **Llevar el código al Jetson.** El Jetson no puede hacer `git pull` hasta que hagas `push` (no lo he hecho). Dos vías:
   - Con push (te lo pido cuando revises): `mario@mario-desktop:~$ cd ~/aether && git fetch origin && git checkout jetson-agente`.
   - Sin push: lleva solo lo que GitHub todavía no tiene (los commits locales). `PS> git bundle create ..\jetson-agente.bundle origin/jetson-setup..jetson-agente`,
     `PS> scp ..\jetson-agente.bundle jetson-uni:~/`; en el Jetson primero ponlo al día con GitHub
     (`cd ~/aether && git fetch origin && git checkout jetson-setup && git pull`) y luego `git pull ~/jetson-agente.bundle jetson-agente`.
     **Sin probar**: si `git` se queja de commits que faltan, es mejor hacer el `push` que forzar nada.
3. **Jetson — configurar y arrancar el agente:** `cp ~/aether/scripts/jetson/aether-agent.env.example ~/.aether-agent.env`,
   edita `AETHER_LAPTOP_URL`, luego `bash ~/aether/scripts/jetson/iniciar-agente.sh`. Esperado: `{"status":"ok","error":null}`.
   Si dice que `gpiod` está instalado, **no sigas** (regla de seguridad).
4. **Medir (V1):** `python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15`. Anota los números
   tal cual (FPS de cámara, de entrega, ms de inferencia, CPU/RAM del agente). Si el FPS de cámara ya es bajo, es la luz.
5. **Laptop — apuntar al Jetson:** en `backend\.env`, `AETHER_PERCEPTION_AGENT_URL=http://<IP Jetson>:8001`; arranca
   `.\iniciar_aether.ps1`. **Jetson (VNC):** `bash ~/aether/scripts/ver-aether.sh` y «Iniciar cámara» (V2, V3).
6. **Voz (cuando quieras):** instalar y calibrar (`docs/guia_arranque.md` §1.4), medir (V5–V6) y probar de punta a punta
   (V7–V10). Los criterios y qué hacer si falla están en `docs/auditoria/TRAZABILIDAD.md`, sección 2.

## Qué queda para después

Medir en el Jetson y decidir TensorRT con datos; `systemd` si el agente resulta estable; persistir los `event_id` en
disco; **la Pi real** (SO, Python ≥ 3.10, medir el ONNX, estado seguro de los pines con LED/multímetro antes de cualquier
carga, y solo entonces `gpiod`); autenticación de los agentes si el proyecto sale del laboratorio.
