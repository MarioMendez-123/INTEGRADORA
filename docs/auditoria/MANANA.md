# MAÑANA — plan de prueba (1 página)

Orden: **agente del Jetson → FPS medidos → ver la cámara del Jetson en la página de la laptop → voz al final.**
`PS C:\...>` laptop · `mario@mario-desktop:~$` Jetson. Nada de esto se ha corrido aún en el Jetson.

| # | Dónde y qué | Salida esperada | Si falla |
|---|---|---|---|
| 1 | **Laptop.** Pon `CELDA_HMI_CLAVE=…` en `backend\.env` (tú, sin mostrarla). `PS C:\Users\mende\Downloads\INTEGRADORAAHORASI> .\iniciar_aether.ps1 -SoloComprobar` | `Todo en orden (N aviso(s))`; red `Private` | Cada línea roja trae su comando. Firewall: copia el `New-NetFirewallRule … -Profile Private` que imprime (PowerShell de administrador) |
| 2 | **Jetson.** Tomar la rama: `mario@mario-desktop:~$ cd ~/aether && git status --short && git fetch origin && git checkout -B jetson-agente origin/jetson-agente && git log --oneline -1` | `git status` sin líneas; `Switched to a new branch 'jetson-agente'`; el último commit empieza con `R6:` o es posterior | `git status` con cambios → `git stash` y repite. Sin internet en el Jetson → `git bundle` (ver `DECISION_FINAL_AGENTES.md`) |
| 3 | **Jetson.** `cp ~/aether/scripts/jetson/aether-agent.env.example ~/.aether-agent.env && nano ~/.aether-agent.env` → `AETHER_LAPTOP_URL=http://<IP laptop>:8000` | Archivo guardado | IP de la laptop: la imprime el paso 1 (`ipconfig`). Un nombre `.local` solo si resuelve (mira `variables_entorno.md`) |
| 4 | **Jetson.** `mario@mario-desktop:~$ bash ~/aether/scripts/jetson/iniciar-agente.sh` | `Agente en marcha (tmux 'agente'…)` y `{"status":"ok","error":null}` (la primera vez tarda: carga YOLO) | Dice qué falta con `->`. Si dice que `gpiod` está instalado: **no sigas**. Si «no contestó»: `tail -30 ~/aether-agente.log`; espera 30 s y `curl -s localhost:8001/health` |
| 5 | **Jetson. FPS.** `mario@mario-desktop:~$ python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15` (con buena luz) | Bloque «Resultado»: FPS de cámara, de entrega, recibidos, ms de inferencia, CPU/RAM. Objetivo de diseño: recibidos ≥ 29.1. **Anota los números tal cual** | Si «FPS de la cámara» ya es bajo, el límite es la luz/cámara, no el agente. `estado: error` → `error:` dice por qué |
| 6 | **Laptop.** En `backend\.env`: `AETHER_PERCEPTION_AGENT_URL=http://<IP Jetson>:8001`. `PS> .\iniciar_aether.ps1 -SinVoz`. En otra ventana: `PS> curl.exe -s http://localhost:8000/config/agents` | Servidor arriba; la config trae `"stream_url":"http://<IP Jetson>:8001/stream"` | `stream_url` en `null` → la variable no se leyó (reinicia el servidor). Puerto 8000 ocupado → el script dice qué proceso |
| 7 | **Jetson, terminal DENTRO de VNC.** `mario@mario-desktop:~$ bash ~/aether/scripts/ver-aether.sh` → en la página, «Iniciar cámara» | Firefox abre el dashboard; el video es **el del Jetson** (mueve la mano), etiqueta «EN VIVO». F12 → Red: pide `http://127.0.0.1:8001/stream` | Imagen en blanco: `curl -sI http://<IP laptop>:8000/health` debe traer `img-src … http://<IP Jetson>:8001` en `content-security-policy`; si no, revisa la variable. «ninguna laptop contestó» → IP en `~/.aether-host`. Por SSH no hay pantalla |
| 8 | **Laptop.** Pon un objeto frente a la cámara del Jetson. `PS> curl.exe -s "http://localhost:8000/perception/recent-detections?limit=3"` y `PS> curl.exe -s http://<IP Jetson>:8001/status` | Detecciones con `detected_class`; en `/status`: `laptop.sent_total` crece, `reachable: true` | `laptop.last_error` dice por qué (firewall, red, URL) |
| 9 | **Al final: voz.** `docs/guia_arranque.md` §1.4 (instalar, modelo, calibrar) y `TRAZABILIDAD.md` §2 (V5–V10) | — | `.\iniciar_aether.ps1 -SinVoz` la deja fuera |

## Volver al estado anterior (cuando quieras, o si algo sale mal)

- **Jetson:** `mario@mario-desktop:~$ bash ~/aether/scripts/jetson/detener-agente.sh && cd ~/aether && git checkout jetson-setup`
- **Laptop:** Ctrl+C en el servidor. En `backend\.env` borra (o comenta con `#`) `AETHER_PERCEPTION_AGENT_URL`. `PS> git checkout jetson-setup`.
  Arranque manual de siempre: `PS> cd backend; .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000`
- Sin la variable del agente, la rama nueva **también** se comporta como antes (cámara de la laptop). `git checkout jetson-setup` es la vuelta completa.
- En `jetson-setup` la celda vuelve a usar `admin/admin` (el código viejo); `CELDA_HMI_CLAVE` solo la lee la rama nueva.

**Comando exacto para que el Jetson tome la rama** (paso 2): `cd ~/aether && git fetch origin && git checkout -B jetson-agente origin/jetson-agente`
