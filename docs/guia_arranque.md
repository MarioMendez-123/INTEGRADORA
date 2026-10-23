# Guía de arranque de Aether (laptop + Jetson + voz)

> Estado: **escrita en la rama `jetson-agente`; ningún paso de esta guía se ha corrido todavía en el Jetson ni con el
> micrófono real.** Lo que sí se corrió en la laptop (pruebas automáticas y una prueba de humo del agente con la cámara
> web) está en `docs/auditoria/TRAZABILIDAD.md`. El procedimiento anterior (`URLS_Y_COMANDOS.md` sección 1 y
> `COMANDOS_LINUX.md`) **sigue siendo válido como respaldo**: esta guía solo lo junta en menos pasos.

Prompts: `PS C:\...>` laptop (PowerShell) · `mario@mario-desktop:~$` Jetson.

## 0. Resumen: lo que corre dónde

| Equipo | Qué corre | Qué mira el usuario | Qué sale por la red |
|---|---|---|---|
| Laptop | Servidor (`:8000`), base de datos, Ollama, **servicio de voz** (micrófono) | La consola de voz y, si quiere, el navegador | Páginas y JSON; texto de voz |
| Jetson | **Agente de percepción** (`:8001`): cámara, YOLO, video | Firefox con la página de la laptop (el video viene del propio Jetson) | Solo observaciones JSON hacia la laptop |
| Pi | `celda_agent` (`:8000`): cámara, visión de la celda, su `celda.html` | — | Estado y eventos de pieza (sin GPIO) |

El video **no viaja entre equipos**: cada cámara se ve en su propio equipo.

## 1. Una sola vez en la laptop

1. **Clave de la celda** (sin ella Arranque/Paro no responden). Abre `backend\.env` y agrega
   `CELDA_HMI_CLAVE=<tu clave>`. No la pegues en el chat ni en el repositorio.
2. **Firewall, solo perfil Privado** (PowerShell de administrador). Esto solo abre el 8000 a tu subred y solo cuando la
   red está marcada como Privada:
   ```
   PS C:\WINDOWS\system32> New-NetFirewallRule -DisplayName "Aether 8000 (red local)" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private -RemoteAddress LocalSubnet
   ```
   Si tu red aparece como **Pública**, cámbiala: `Set-NetConnectionProfile -InterfaceAlias "<alias>" -NetworkCategory Private`
   (`Get-NetConnectionProfile` muestra el alias). `iniciar_aether.ps1 -SoloComprobar` te dice si falta algo.
3. **Direcciones de los agentes** en `backend\.env` (las páginas las leen del servidor; sin ellas se usa la cámara de la
   laptop como antes):
   ```
   AETHER_PERCEPTION_AGENT_URL=http://10.4.5.103:8001
   ```
   (cambia la IP del Jetson según la red; la tabla de la sección 5 lista las que ya usaste).
4. **Voz** (opcional, solo si vas a usar el micrófono de la laptop):
   ```
   PS C:\...\INTEGRADORAAHORASI> backend\.venv\Scripts\python.exe -m pip install -r backend\requirements-voice.txt
   ```
   Instala `sounddevice` y `vosk` (**requiere internet; no requiere administrador**). Descarga además el modelo en español
   (`vosk-model-small-es`, de https://alphacephei.com/vosk/models; el tamaño exacto no está verificado, es de decenas de MB),
   descomprímelo y agrega a `backend\.env`: `AETHER_VOICE_MODEL=C:\ruta\a\vosk-model-small-es-...`.
   Calibra el umbral con tu micrófono (4 s en silencio, 4 s hablando):
   ```
   PS C:\...\INTEGRADORAAHORASI> backend\.venv\Scripts\python.exe scripts\probar_voz.py --mic 8
   ```
   Te sugiere `AETHER_VOICE_VAD_THRESHOLD=<número>`; agrégalo a `backend\.env`.
5. **Energía**: mientras corra el servidor, que Windows no suspenda la red (Configuración → Sistema → Energía → «Nunca»
   en suspensión al estar conectado). Si la laptop se duerme, el Jetson pierde al servidor.

## 2. Arranque diario en la laptop (un comando)

```
PS C:\...\INTEGRADORAAHORASI> .\iniciar_aether.ps1
```
Hace las comprobaciones (venv, clave sin mostrarla, puerto libre, perfil de red, firewall, voz), imprime las IP de la
laptop y arranca el servidor en esa ventana. Si el servicio de voz está listo, lo abre **en su propia ventana**, donde se
ve el estado del micrófono (`● MICRÓFONO ACTIVO · 15:04:05`) y se controla con `p` (pausar/reanudar) y `q` (salir).
Opciones: `-SoloComprobar` (no arranca nada), `-SinVoz`, `-Jetson` (arranca también el agente por SSH, host `jetson-uni`).

Respaldo manual (el de siempre): `cd backend; .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000`.

## 3. En el Jetson

Una vez: copiar la configuración y editar la IP de la laptop.
```
mario@mario-desktop:~$ cd ~/aether && git pull
mario@mario-desktop:~$ cp ~/aether/scripts/jetson/aether-agent.env.example ~/.aether-agent.env
mario@mario-desktop:~$ nano ~/.aether-agent.env        # AETHER_LAPTOP_URL=http://<IP de la laptop>:8000
```
Cada vez (o desde la laptop con `-Jetson`):
```
mario@mario-desktop:~$ bash ~/aether/scripts/jetson/iniciar-agente.sh
```
Salida esperada: `Agente en marcha (tmux 'agente'...)` y `{"status":"ok","error":null}`. Si falla dice qué falta (cámara,
entorno, `gpiod` instalado, archivo de configuración). Para medirlo:
```
mario@mario-desktop:~$ python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15
```
Para ver la página (dentro de un terminal de la sesión **VNC**, no por SSH):
```
mario@mario-desktop:~$ bash ~/aether/scripts/ver-aether.sh robot.html
```
Prueba la lista de IP de `~/.aether-host` (o las tres conocidas), y abre Firefox en la primera laptop que contesta.

## 4. Voz: cómo funciona y cómo apagarla

- El micrófono de la laptop lo abre **solo** el servicio de voz (no una página). Reconoce en español **localmente** y manda
  **solo texto** a las páginas de Lumina que lo escuchan (las que no tienen reconocimiento propio, como Firefox en el
  Jetson). El audio no se guarda en disco, no sale de la laptop y no aparece en los logs.
- **Aviso:** línea de estado persistente en su ventana + notificación de Windows al activar, pausar y apagar.
- **Apagar sin reiniciar todo:** tecla `p` (pausa y **suelta** el micrófono: el icono de micrófono de Windows se apaga) o
  `q`; o arrancar con `AETHER_VOICE_START=off`.
- **Anti-eco:** mientras Lumina habla, la página avisa y el servicio ignora el audio hasta 0.8 s después.
- Una página con reconocimiento propio (Chrome) lo sigue usando como siempre. Para forzar el micrófono de la laptop en
  ella: `robot.html?voz=servicio`. Un solo origen de voz por página.

## 5. Redes (si algo no conecta)

| Situación | Qué hacer |
|---|---|
| WiFi «Mecatronica»: laptop `10.4.5.52`, Jetson `10.4.5.103` | Funcionó antes con regla de firewall en perfil Privado |
| Cable en la universidad: el Jetson cae en `10.4.7.x` (otra subred) | No se ven; usa el WiFi o el USB-C |
| USB-C (RNDIS): laptop `192.168.55.100`, Jetson `192.168.55.1` | Respaldo confiable, ocupa el cable |
| Casa: `192.168.100.x` (laptop `.14`, Jetson `.19`) | Funcionó sin regla nueva |

Diagnóstico en orden: `iniciar_aether.ps1 -SoloComprobar` (laptop) → `curl -s -m 3 http://<IP laptop>:8000/health` (Jetson)
→ `curl -s -m 3 http://localhost:8001/health` (Jetson) → `python3 ~/aether/scripts/probar_agente.py http://localhost:8001`.

## 6. Qué NO hace esta guía

No toca GPIO, no instala `gpiod`, no cambia el cableado ni la seguridad de la celda. La Pi se prepara con el mismo patrón
pero **no se activa** hasta que tu equipo confirme el cableado (ver `docs/auditoria/DECISION_FINAL_AGENTES.md`).
