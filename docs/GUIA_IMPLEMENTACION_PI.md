# Guía de implementación: laptop → Jetson → Raspberry Pi 4 → celda de manufactura

Escrita el 25 de octubre de 2026 para el lunes 26. Parte de lo que dejó el viernes 23 (bitácora, sesiones 8 a 10) y de lo que dice el **código** (cuando un documento viejo y el código se contradicen, gana el código).

**Dónde está esta guía:** en tu laptop, `C:\Users\mende\Downloads\INTEGRADORAAHORASI\docs\GUIA_IMPLEMENTACION_PI.md` (aún sin commit: no está en GitHub, así que el Jetson y la Pi no la pueden leer), y como página privada con botón Copiar en cada comando: https://claude.ai/artifact/8JzkqtDmYsFmGmu28rY599 (ábrela en el celular o en una segunda pantalla mientras trabajas).

**"Onyx" = ONNX.** Es el formato en que se exporta `parts.pt` para que la Pi lo corra con OpenCV, sin `torch` ni `ultralytics` (`backend/line_model.py`).

Si algo de "abrir una ventana", "entrar por SSH" o "editar un archivo" no te queda claro, está explicado en **Lo básico** (abajo, antes del Paso previo). Convención de cada comando: `[Laptop · PowerShell]`, `[Jetson · SSH]` o `[Jetson · VNC]` (terminal dentro del escritorio, no por SSH), `[Pi 4 · SSH]`. Etiquetas: **VERIFICADO** (alguien lo corrió y se vio la salida), **NO VERIFICADO** (se supone por el código o por reglas generales), **PENDIENTE** (depende de un dato o de una persona que falta). Donde dice `<IP-…>` va la IP de ese equipo en la red del día. **Nunca pegues claves en el chat ni en el repositorio.**

---

## 0. Qué se corrió de verdad y qué no (léelo antes de empezar)

| Pieza | Estado |
|---|---|
| Agente del Jetson en el Jetson (29.0 FPS de cámara, 29.1 de entrega, inferencia ≈ 68 ms, `laptop.reachable` verdadero) | **VERIFICADO el viernes (reportado por Mario)** |
| Video del Jetson visto en Firefox dentro de la página de la laptop | **NO VERIFICADO**: el viernes la CSP lo bloqueaba; se corrigió en la laptop (sesión 8) y falta repetir con Ctrl+F5 |
| Audio de Lumina (ElevenLabs) en Firefox del Jetson | **NO VERIFICADO**: corregido `media-src` (sesión 10), falta probar |
| Voz de la laptop con micrófono real y Vosk | **NO VERIFICADO** con voz real (solo sintética). Whisper small: 15/16 activaciones medidas (reportado), pero en vivo Lumina dejó de escucharte: **sin resolver, se deja para después** |
| **Jetson con DOS modelos** (`parts.pt` identifica las 3 piezas por su clase; el YOLO general queda como detector de obstáculos) | **NUEVO (25 oct)**: escrito y probado solo con modelos falsos (302 pruebas del backend pasan). **NO VERIFICADO** en el Jetson ni con piezas reales |
| Reconocer las 3 piezas **desde cualquier ángulo** | **NO VERIFICADO y probablemente NO cumplido hoy**: el dataset tiene 19 fotos y el mAP50 de 0.995 es optimista. Ver 2.6 |
| Cualquier cosa en la Raspberry Pi 4 | **NO VERIFICADO**: nada se ha corrido en la Pi |
| ONNX con el OpenCV de la Pi (Bookworm trae 4.6; se probó con 5.0) | **NO VERIFICADO**: es el riesgo técnico nº 1 del lunes |
| GPIO, relevadores, LOGO, pistón | **NO VERIFICADO**; `gpiod` no está instalado a propósito |

**Los 5 commits del viernes (CSP, voz, lotes) ya se subieron a GitHub el 25 de oct** (`1f531be..cc3e278`). Falta subir la corrección de relevadores (`LINE_RELES_ACTIVO_BAJO`); el paso 1.1 lo cubre.

**Orden del día:** Fase 1 laptop → Fase 2 Jetson → Fase 3 verificar la cadena → Fase 4 voz (opcional, al final) → Fase 5 Pi sin cableado → Fase 6 cablear la celda → Fase 7 operación diaria y salida.
No avances de fase si la comprobación de la anterior no dio lo esperado.

### Material que debe estar en la mesa
- Laptop con cargador (suspensión de red desactivada mientras corra el servidor).
- Jetson Orin Nano con su cámara USB y su cable de red o WiFi; acceso VNC.
- Raspberry Pi 4 con **fuente oficial 5 V / 3 A**, microSD con Raspberry Pi OS **64 bits (Bookworm)**, cámara USB de la celda, cable de red. Sistema, RAM y modelo de cámara exactos: **PENDIENTE (P-18)**; anótalos en la sección 9.
- Un switch o el mismo WiFi para los tres equipos.
- Para la Fase 6: multímetro, 2 LED con resistencia (330 Ω a 1 kΩ), cables dupont, la placa de relevadores y el LOGO de la celda. Marca, modelo y si la placa es activa en alto o en bajo: **PENDIENTE (P-12)**.

---

## Lo básico, paso a paso (léelo una vez; el resto de la guía lo usa en todas partes)

**A. Abrir PowerShell en la carpeta del proyecto (laptop).**
1. Pulsa la tecla Windows, escribe `PowerShell` y pulsa Enter. Se abre una ventana con texto como `PS C:\Users\mende>`.
2. Escribe (o pega) esto y pulsa Enter: `cd C:\Users\mende\Downloads\INTEGRADORAAHORASI`. La línea debe cambiar a `PS C:\Users\mende\Downloads\INTEGRADORAAHORASI>`. **Todos los comandos `[Laptop · PowerShell]` se corren ahí**, salvo que se diga otra cosa.
3. "PowerShell de administrador" (solo para el firewall y el perfil de red): tecla Windows, escribe `PowerShell`, clic derecho en el resultado, **Ejecutar como administrador**, **Sí**. Esa ventana empieza en `C:\WINDOWS\system32`: no necesita `cd`.
4. "Otra ventana": una ventana que tiene un programa corriendo (por ejemplo el servidor) no se puede usar para nada más. Abre una nueva repitiendo el paso 1 y el paso 2.

**B. Cómo copiar y pegar los comandos.**
- Cada bloque trae al inicio una etiqueta entre corchetes, por ejemplo `[Jetson · SSH]`. **La etiqueta dice DÓNDE se corre el comando y NO forma parte del comando.** El botón **Copiar** de la página la quita solo. Si copias a mano, no la incluyas.
- Para pegar en una ventana de PowerShell (también cuando estás dentro de SSH): **clic derecho** dentro de la ventana, o Ctrl+V. Luego **Enter** para ejecutar.
- Una línea que empieza con `#` es un comentario: no hace nada.
- Si un bloque tiene varias líneas, pégalas **una por una** y espera a que termine cada una (a menos que se diga lo contrario).

**C. Entrar al Jetson o a la Pi por SSH (desde la laptop).**
1. En PowerShell (A): `ssh mario@<IP-JETSON>` (a la Pi: `ssh <usuario>@<IP-PI>`).
2. La primera vez pregunta `Are you sure you want to continue connecting (yes/no...)?`. Escribe `yes` y Enter.
3. Pide la contraseña **de ese usuario en ese equipo**. **Al escribirla no se ve nada** (ni asteriscos): es normal. Escríbela completa y Enter.
4. Sabes que entraste porque el texto de la línea cambia a algo como `mario@mario-desktop:~$`. **Desde ese momento todo lo que escribas se ejecuta en el Jetson (o la Pi), no en la laptop.** Los comandos `[Jetson · SSH]` / `[Pi 4 · SSH]` van ahí.
5. Para salir: `exit` y Enter. Vuelves a la laptop.
6. Si Windows dice que `ssh` no se reconoce: Configuración → Aplicaciones → Funciones opcionales → Agregar una característica → **Cliente OpenSSH**.
7. Errores comunes: `Connection timed out` = la IP está mal o no están en la misma red; `Permission denied` = usuario o contraseña equivocados; `REMOTE HOST IDENTIFICATION HAS CHANGED` = en esa IP ahora hay otro equipo (o reinstalaste el sistema): si estás seguro de que es tu equipo, corre `ssh-keygen -R <IP>` y vuelve a entrar.
8. `scp` (copiar archivos) también pide la contraseña cada vez que se usa.

**D. Terminal dentro de VNC (comandos `[Jetson · VNC]`).** Abre la ventana del VNC que ya usas (ves el escritorio del Jetson) y, dentro de ella, un terminal con **Ctrl+Alt+T** o desde el menú de aplicaciones → **Terminal** (el atajo **NO está verificado** en tu escritorio). Es distinto del SSH: el audio y Firefox solo funcionan desde aquí.

**E. Editar un archivo en la laptop (Bloc de notas).** Ejemplo, el archivo de claves del servidor:
1. En PowerShell (A): `notepad backend\.env`.
2. Si Windows dice que no existe y pregunta si quieres crearlo, pulsa **Sí**.
3. Se abre el Bloc de notas con ese archivo (puede estar vacío o tener líneas). Escribe o cambia las líneas **al final** del texto, sin borrar las que ya existen.
4. Guarda con **Ctrl+S** y cierra la ventana.
5. Reglas del formato: una variable por línea, `NOMBRE=valor`, **sin espacios** alrededor del `=`, **sin comillas**; una línea que empieza con `#` es un comentario. Si la variable **ya existe**, cambia esa línea en vez de agregar otra repetida.
6. Comprobar que quedó con el nombre correcto, mostrando **solo los nombres** de las variables (nunca las claves): `Get-Content backend\.env | ForEach-Object { ($_ -split '=')[0] }`.

**F. Editar un archivo en el Jetson o la Pi.** Hay dos formas; la primera es la más fácil:
- **Sin editor.** Cambiar el valor de una línea que ya existe (cambia los textos en MAYÚSCULAS): `sed -i 's|^NOMBRE=.*|NOMBRE=valor|' ~/archivo`. Agregar una línea nueva al final: `echo 'NOMBRE=valor' >> ~/archivo`. Ver el resultado: `grep NOMBRE ~/archivo`.
- **Con `nano`.** `nano ~/archivo` abre el editor. Muévete con las flechas, escribe, **Ctrl+O** y luego **Enter** para guardar, **Ctrl+X** para salir. Para pegar texto: clic derecho (o Ctrl+Shift+V).

**G. `tmux` (para que un programa siga corriendo aunque se cierre SSH).**
- Crear y entrar: `tmux new -s nombre`. Aparece una barra verde abajo: ya estás dentro.
- Salir **sin detener** lo que corre: pulsa **Ctrl+B**, suelta las dos teclas y pulsa **D**. Vuelves a tu SSH normal.
- Volver: `tmux attach -t nombre`. Ver las sesiones: `tmux ls`. Cerrar una (y lo que corre en ella): `tmux kill-session -t nombre`.
- Detener un programa que está corriendo en la ventana donde lo ves: **Ctrl+C**.

**H. La clave de la celda (`CELDA_HMI_CLAVE`).** Es la contraseña de la página `celda.html` (el usuario es `admin`). Invéntala tú: 10 o más caracteres, letras y números, **sin espacios, sin `#` y sin comillas**. Anótala en un lugar privado (no en el chat ni en el repositorio). Puedes usar la misma en la laptop y en la Pi.

---

## Paso previo — Averiguar las IP de los tres equipos (hazlo primero)

Todas las `<IP-LAPTOP>`, `<IP-JETSON>` e `<IP-PI>` de esta guía son las del **día y la red donde estés**. Cambian con la red (casa, WiFi de la universidad, cable) y, si el router las reparte solas (DHCP), hasta de un día a otro. **Tienen que ser de la misma red** o no se ven. Anótalas en la tabla del final de este paso.

### A. IP de la laptop
```
[Laptop · PowerShell]  .\iniciar_aether.ps1 -SoloComprobar
```
Imprime las direcciones de la laptop (`http://<IP>:8000/   (Wi-Fi)`). Alternativa: `ipconfig` y la línea `Dirección IPv4` del adaptador conectado. Si hay varias, usa la de la misma red que el Jetson y la Pi (la de WiFi o la del cable que ellos usen; no las `vEthernet` ni `169.254.x.x`).

### B. IP del Jetson
1. **Desde el propio Jetson** (lo más seguro): abre un terminal en su pantalla o en la sesión VNC y corre
```
[Jetson · VNC]  hostname -I
```
Imprime una o varias IP; la que empieza igual que la de la laptop (por ejemplo `10.4.5.` o `192.168.100.`) es la tuya. Para ver cuál interfaz es cual: `ip -4 -br addr`.
2. **Si no puedes abrir su pantalla**: por el cable **USB-C** el Jetson usa una IP fija (verificado en la documentación del proyecto): Jetson `192.168.55.1` y laptop `192.168.55.100`. Entra con `ssh mario@192.168.55.1` y ahí corre `hostname -I` para conocer su IP de red.
3. **Desde la laptop, sin tocar el Jetson**: `ping mario-desktop.local` (si responde, muestra la IP). Ojo: los nombres `.local` dependen de mDNS y la red de la universidad los bloquea; si no resuelve, no es que el Jetson esté mal. Otra vía: la lista de equipos conectados del router.
4. Comprueba: `[Laptop · PowerShell]  ping <IP-JETSON>` y `ssh mario@<IP-JETSON>`.

Redes conocidas del Jetson (de `docs/guia_arranque.md`): WiFi "Mecatronica" `10.4.5.103`, casa `192.168.100.19` (`.14` la laptop), USB-C `192.168.55.1`. **En el cable de la universidad el Jetson cae en `10.4.7.x`, otra subred: no se ve con la laptop.** Mantén su WiFi apagado si usas cable (`nmcli radio wifi off`).

### C. IP de la Raspberry Pi 4
La Pi es nueva: no hay ninguna IP anotada en el proyecto.
1. **Desde la Pi** (con monitor y teclado): `hostname -I`.
2. **Sin monitor**: si en Raspberry Pi Imager le pusiste un nombre de equipo (por ejemplo `celda`), prueba `[Laptop · PowerShell]  ping celda.local`. Mismo aviso de mDNS que arriba.
3. **Lista del router** (la página de administración o la app): busca el equipo con el nombre que le pusiste o `raspberrypi`.
4. **Desde la laptop con la tabla ARP**, después de que la Pi haya arrancado y esté en la misma red:
```
[Laptop · PowerShell]  arp -a
```
Busca una MAC que empiece con `b8-27-eb`, `dc-a6-32`, `e4-5f-01`, `28-cd-c1`, `d8-3a-dd` o `2c-cf-67` (prefijos de Raspberry Pi; regla general, **no verificada con tu Pi**). La IP de esa fila es la Pi. Si la tabla sale vacía de equipos, haz primero un `ping` a otra IP de la red para poblarla.
5. Comprueba: `ping <IP-PI>` y `ssh <usuario>@<IP-PI>`.

### D. Que no cambien a media jornada
Si el router reparte IP por DHCP, pide a quien lo administre que **reserve** una IP fija para el Jetson y la Pi (por su MAC), o fíjalas tú. Si cambian, hay que actualizar: `AETHER_LAPTOP_URL` en el Jetson (`~/.aether-agent.env`) y en la Pi (`~/.celda.env`), `AETHER_PERCEPTION_AGENT_URL` en `backend\.env` de la laptop, y `~/.aether-host` del Jetson (IP de la laptop para `ver-aether.sh`), y **reiniciar** cada agente (solo leen su configuración al arrancar).

### E. Tabla del día (llénala antes de seguir)
| Equipo | IP hoy | Red / interfaz | `ping` desde la laptop |
|---|---|---|---|
| Laptop | | | — |
| Jetson | | | |
| Pi 4 | | | |

---

## Fase 1 — Laptop (Windows)

### 1.1 Subir los cambios pendientes a GitHub
Abre PowerShell en la carpeta del proyecto (Lo básico, A) y corre, **una por una**:
```
[Laptop · PowerShell]  git status --short
```
Lista los archivos con cambios sin guardar en git (`M` = modificado, `??` = nuevo). Los de `aether_report_package/...` son del informe y no importan. Los que importan para esta guía son los de `backend/`, `tests/`, `contracts/` y `docs/`.
```
[Laptop · PowerShell]  git add backend/cell_line.py backend/perception_pipeline.py backend/aether_agent.py backend/agent_contracts.py tests/backend/test_cell_line.py tests/backend/test_perception_pipeline.py tests/backend/test_aether_agent.py contracts/agents_api.md docs/variables_entorno.md docs/GUIA_IMPLEMENTACION_PI.md
[Laptop · PowerShell]  git commit -m "Jetson: parts.pt identifica las piezas por clase y el YOLO general queda como obstaculos; LINE_RELES_ACTIVO_BAJO; guia"
[Laptop · PowerShell]  git push origin jetson-agente
```
- Esperado del `commit`: un resumen con "files changed". Esperado del `push`: una línea que termina en `jetson-agente -> jetson-agente`.
- Si el `commit` dice `nothing to commit`, ya lo habías hecho: pasa al `push`.
- Si el `push` abre una ventana de GitHub para iniciar sesión: inicia sesión y vuelve a correr el `push`. Si dice `Authentication failed`, GitHub ya no acepta la contraseña normal y hace falta iniciar sesión por esa ventana o con un token (ajustes de GitHub → Developer settings).
- **Comprobar que quedó arriba:** `git status -sb` — la primera línea debe ser `## jetson-agente...origin/jetson-agente` **sin** la palabra `ahead`.
- Sin internet: `git bundle` (en `docs/auditoria/DECISION_FINAL_AGENTES.md`, paso 2).

### 1.2 Clave de la celda y direcciones en `backend\.env`
Este archivo tiene la configuración secreta del servidor de la laptop. No va a GitHub. Haz esto, en orden:
1. Elige tu clave (Lo básico, H).
2. Abre el archivo (Lo básico, E): en PowerShell, `notepad backend\.env`. Si pregunta si lo crea, **Sí**.
3. Baja al final del texto y agrega **estas dos líneas** (cambia lo que está entre `< >`, **sin dejar los `<` ni los `>`**). Ejemplo con clave `MiClave2026x` e IP `10.4.5.103`:
```
CELDA_HMI_CLAVE=MiClave2026x
AETHER_PERCEPTION_AGENT_URL=http://10.4.5.103:8001
```
   - Si el archivo **ya tiene** una de esas dos líneas, **edítala** en vez de agregar otra.
   - La IP del Jetson sale de la tabla E del **Paso previo**. Si todavía no la sabes, escribe solo la primera línea ahora y agrega la segunda cuando la tengas.
4. **Ctrl+S** y cierra el Bloc de notas.
5. Comprueba que quedaron (esto muestra solo los nombres, no la clave): `Get-Content backend\.env | ForEach-Object { ($_ -split '=')[0] }`. Debes ver `CELDA_HMI_CLAVE` y `AETHER_PERCEPTION_AGENT_URL` en la lista.
- Sin `CELDA_HMI_CLAVE`, Arranque/Paro de la celda no responden. El 22 de oct el archivo no la tenía; el siguiente paso (1.3) te lo confirma.

### 1.3 Comprobar todo sin arrancar nada
En PowerShell, en la carpeta del proyecto (Lo básico, A):
```
[Laptop · PowerShell]  .\iniciar_aether.ps1 -SoloComprobar
```
Esperado: `Todo en orden (N aviso(s))`. Cada línea `[FALTA]` trae su comando justo debajo con `->`.

| Síntoma | Causa | Qué hacer |
|---|---|---|
| `la ejecución de scripts está deshabilitada` | Política de ejecución de PowerShell. **NO VERIFICADO aquí** | `powershell -ExecutionPolicy Bypass -File .\iniciar_aether.ps1 -SoloComprobar` |
| `[FALTA] CELDA_HMI_CLAVE` | No está en `backend\.env` | paso 1.2 |
| `[FALTA] El puerto 8000 ya está en uso por: …` | Otro uvicorn o `lumina-agent` | Cierra ese proceso o usa `-Puerto 8010` (y cambia el 8000 por 8010 en todas las URLs de esta guía) |
| `[AVISO] La red '…' está como Pública` | Windows bloquea al Jetson y a la Pi | Abre **PowerShell de administrador** (Lo básico, A.3). Corre `Get-NetConnectionProfile` y copia el `InterfaceAlias` (por ejemplo `Wi-Fi`). Luego `Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private` con ese nombre |
| `[AVISO] No hay regla de firewall 'Aether 8000'` | Falta la regla | El propio aviso imprime debajo, tras `->`, el comando `New-NetFirewallRule …`. Cópialo, ábrelo en **PowerShell de administrador** (Lo básico, A.3), pégalo y Enter. Luego repite el 1.3 |
| `[FALTA] No existe backend\.venv` | Entorno de Python ausente | El comando viene impreso en pantalla |

Anota las IP que imprime la sección "Direcciones de esta laptop". Esa es `<IP-LAPTOP>`. Si hay varias, usa la de la misma red que el Jetson y la Pi.

### 1.4 Que la laptop no se duerma
Si la laptop se duerme o apaga la red, el Jetson y la Pi pierden el servidor. Con el cargador conectado:
1. **Windows 11:** Inicio → **Configuración** (engrane) → **Sistema** → **Energía y batería** → **Pantalla y suspensión**. En "Conectado: poner el equipo en suspensión después de" elige **Nunca**.
   **Windows 10:** Configuración → Sistema → **Inicio/apagado y suspensión** → en "Cuando está enchufado, suspender después de" elige **Nunca**.
2. **Tapa:** si cierras la tapa, se suspende. Abre el Panel de control → Hardware y sonido → Opciones de energía → **Elegir el comportamiento del cierre de la tapa** → "Al cerrar la tapa", columna "Conectado": **No hacer nada** → Guardar cambios. O simplemente deja la tapa abierta.
(Los nombres exactos de los menús pueden variar según tu versión de Windows: **NO verificado en tu laptop**.)

---

## Fase 2 — Jetson (dejarlo como el viernes)

### 2.1 Entrar y traer el código
```
[Laptop · PowerShell]  ssh mario@<IP-JETSON>          # o: ssh mario@mario-desktop.local (solo si resuelve en esa red)
[Jetson · SSH]         tmux new -s trabajo            # o: tmux attach -t trabajo
[Jetson · SSH]         cd ~/aether && git status --short && git fetch origin && git checkout jetson-agente && git pull && git log --oneline -1
```
Entrar por SSH es lo de **Lo básico, C**: después del primer comando el texto cambia a `mario@mario-desktop:~$` y los demás comandos se escriben ahí. El segundo comando crea una sesión `tmux` (Lo básico, G; ya estás dentro cuando ves la barra verde).
- Esperado: `git status --short` vacío; el último commit es `CSP: media-src permite blob: y data: …` o uno posterior (el de tu `push` de 1.1).
- `git status` con cambios: `git stash` y repite.
- `checkout` dice que la rama no existe: `git checkout -B jetson-agente origin/jetson-agente`.
- `git pull` dice `Already up to date` pero el commit es viejo: el `push` de 1.1 no se hizo. Vuelve a la 1.1.
- Sin internet en el Jetson: `git bundle` (ver `DECISION_FINAL_AGENTES.md`).
- **Nunca** `sudo apt upgrade` en el Jetson: se reportó un error de memoria CUDA tras actualizar (L4T 36.4.7, no comprobado aquí).

### 2.2 Comprobar que el entorno sigue como el viernes (solo lectura)
```
[Jetson · SSH]  cd ~/aether/backend && source .venv/bin/activate && export YOLO_AUTOINSTALL=False
[Jetson · SSH]  python -c "import torch; print(torch.__version__, torch.cuda.is_available())"
[Jetson · SSH]  python -c "import gpiod" ; echo "salida: $?"
[Jetson · SSH]  deactivate
```
- Esperado: `torch` con sufijo `nv` y `True`; el `import gpiod` **debe fallar** con `ModuleNotFoundError` (salida distinta de 0).
- Si `torch.cuda.is_available()` da `False` o `torch` no trae `nv`: **para**, no uses pip; avísame.
- Si `import gpiod` funciona: **no arranques el agente** (el script se niega, regla de seguridad).

### 2.3 Configuración del agente
El agente lee su configuración de un archivo del Jetson, `~/.aether-agent.env`. Dentro de SSH en el Jetson (Lo básico, C):
1. ¿Existe? `ls ~/.aether-agent.env`. Si dice `No such file`, créalo de la plantilla: `cp ~/aether/scripts/jetson/aether-agent.env.example ~/.aether-agent.env`.
2. Mira la línea actual: `grep AETHER_LAPTOP_URL ~/.aether-agent.env`.
3. Cámbiala por la IP de la laptop de **hoy** (tabla E del Paso previo), sin `< >`. Ejemplo con la IP `10.4.5.52` (copia el comando y cambia solo la IP):
```
[Jetson · SSH]  sed -i 's|^AETHER_LAPTOP_URL=.*|AETHER_LAPTOP_URL=http://10.4.5.52:8000|' ~/.aether-agent.env
[Jetson · SSH]  grep AETHER_LAPTOP_URL ~/.aether-agent.env
```
El segundo comando debe mostrar tu IP. (Si prefieres un editor: `nano ~/.aether-agent.env`, Lo básico, F.)
Una variable por línea, sin comillas ni espacios junto al `=`.

Comprueba la ruta de red **antes** de arrancar el agente (el servidor de la laptop tiene que estar corriendo para que conteste: si todavía no lo arrancas, haz este paso después de 3.1):
```
[Jetson · SSH]  curl -s -m 3 http://10.4.5.52:8000/health
```
(con la IP de tu laptop). Debe responder algo con `"status"`. Si no contesta: firewall o perfil de red de la laptop (1.3), o la IP está mal (en la laptop, `ipconfig`).

### 2.3b Poner en el Jetson el modelo de piezas y tu dataset (cambio nuevo)

**Qué cambió.** Ahora el agente del Jetson, si encuentra `parts.pt`, corre **dos modelos** en cada análisis:
- **`parts.pt` = piezas.** Reconoce `computadora1`, `computadora2` y `computadora3` **por su clase**, sin código QR ni de barras. Estas son las únicas detecciones que se mandan al inventario de la laptop (`code_read: false`).
- **YOLO general (`yolov8n.pt`) = obstáculos.** Se dibuja en naranja como `OBSTACULO <clase>` y se resume en `GET /status` → `obstacles` (cuántos, de qué clase y `max_area_pct`, lo que ocupa el más grande en el cuadro). **No va al inventario** y **no sustituye a los sensores**: una cámara sola no mide distancia. Hoy nada consume ese resumen: no hay navegación en el código (`edge/navigation/` está vacío).
- Sin `parts.pt` en el Jetson, el agente funciona como el viernes (un solo modelo) y el log dice `piezas=NO`.

**Qué se copia al Jetson.** Todo desde la laptop, con el Jetson encendido y en la misma red.

1. `parts.pt` (los pesos entrenados; git los ignora):
```
[Jetson · SSH]         mkdir -p ~/aether/edge/perception/weights
[Laptop · PowerShell]  scp edge\perception\weights\parts.pt mario@<IP-JETSON>:~/aether/edge/perception/weights/
[Laptop · PowerShell]  Get-FileHash edge\perception\weights\parts.pt -Algorithm SHA256
[Jetson · SSH]         sha256sum ~/aether/edge/perception/weights/parts.pt
```
(Los dos SHA-256 deben ser iguales.) Opcional: también `parts_report.json`, que solo es informativo.
2. **Tu dataset** (fotos y etiquetas; `images/` y `labels/` están en `.gitignore`, así que `git pull` no los toca ni los borra). Empaquétalo y cópialo:
```
[Laptop · PowerShell]  tar -czf $env:TEMP\parts_dataset.tar.gz -C edge\perception\parts images labels data.yaml lists
[Laptop · PowerShell]  scp $env:TEMP\parts_dataset.tar.gz mario@<IP-JETSON>:~/
[Jetson · SSH]         mkdir -p ~/aether/edge/perception/parts && tar -xzf ~/parts_dataset.tar.gz -C ~/aether/edge/perception/parts && rm ~/parts_dataset.tar.gz
[Jetson · SSH]         find ~/aether/edge/perception/parts/images -type f | wc -l ; cat ~/aether/edge/perception/parts/classes.txt
```
Esperado: el número de fotos que tienes en la laptop (hoy 19) y las tres clases. `classes.txt` llega por `git pull`; si lo cambiaste en la laptop, súbelo a git primero (2.1).
   - `tar: Cannot open` en la laptop: `tar` viene con Windows 10/11; si falta, comprime la carpeta con el Explorador y usa `unzip`.
   - El dataset en el Jetson **no lo usa el agente** para detectar (solo `parts.pt`). Sirve para tenerlo ahí, revisarlo o reentrenar allí (2.6).
3. Comprobación **sin arrancar nada** de que el Jetson ve los pesos y las clases:
```
[Jetson · SSH]  cd ~/aether/backend && source .venv/bin/activate && python -c "from dataset_store import pesos_piezas, pesos_entorno, read_class_names; print(pesos_piezas(), pesos_entorno(), read_class_names())"; deactivate
```
Esperado: la ruta de `parts.pt`, `yolov8n.pt` y `['computadora1', 'computadora2', 'computadora3']`. Si la primera es `None`, el archivo no está en `~/aether/edge/perception/weights/`.
4. Variables opcionales (no hace falta tocar nada: ya traen su valor de arranque). Solo si quieres cambiar una, agrega la línea al final de `~/.aether-agent.env` (la última línea de una variable es la que vale):
```
[Jetson · SSH]  echo 'AETHER_PIECE_CONF=0.6' >> ~/.aether-agent.env
```
Las tres variables: `AETHER_PIECES` (1 = usar `parts.pt`; `0` vuelve al comportamiento del viernes), `AETHER_PIECE_CONF` (confianza mínima para aceptar una pieza; defecto 0.5, de arranque, no medida) y `AETHER_OBSTACLE_CONF` (confianza mínima para contar un obstáculo; defecto 0.4, no medida).
Con la GPU (Orin Nano) dos modelos YOLO por análisis costarán más milisegundos que el viernes (68 ms con uno). Cuánto: **sin medir**. El video no se frena (la detección va aparte y limitada a `AETHER_DETECT_MAX_HZ`=10 por segundo). Mídelo en 2.5.

### 2.4 Arrancar el agente
```
[Jetson · SSH]  bash ~/aether/scripts/jetson/iniciar-agente.sh
```
Esperado: `Agente en marcha (tmux 'agente'; log en ~/aether-agente.log).` y `{"status":"ok","error":null}`. La primera vez tarda (carga YOLO); el script espera hasta 40 s.

| Mensaje | Causa | Qué hacer |
|---|---|---|
| `tmux no esta instalado` | — | `sudo apt install tmux` |
| `no existe …/backend/.venv/bin/python` | Entorno sin armar | `docs/jetson/SETUP_JETSON.md`, sección 6 |
| `no hay camara en /dev/video0` | USB flojo | `v4l2-ctl --list-devices`; vuelve a conectar la cámara |
| `el gpiod de Python esta instalado` | **Regla de seguridad** | No sigas. Avísame |
| `falta ~/.aether-agent.env` | — | paso 2.3 |
| `el agente no contesto en 8001` | Falló al cargar | `tail -30 ~/aether-agente.log`; espera 30 s y `curl -s localhost:8001/health` |
| `El agente ya corre (tmux 'agente')` | Quedó del viernes | Es normal. Pero si cambiaste el `.env`, `bash ~/aether/scripts/jetson/detener-agente.sh` y arranca otra vez (el `.env` solo se lee al arrancar) |
| El log dice `piezas=NO (sin parts.pt…)` | El Jetson no tiene `parts.pt` o `AETHER_PIECES=0` | Paso 2.3b; el agente funciona, pero sin identificar piezas |
| `FileNotFoundError` / error de ultralytics al cargar `parts.pt` | Archivo cortado o de otra versión | Compara el SHA-256 (2.3b) y vuelve a copiarlo |
| `/health` dice `"status":"error"` | La cámara no abrió | `"error"` dice por qué; `v4l2-ctl --list-devices`; que ningún otro programa use `/dev/video0` |

### 2.5 Medir (para comparar con el viernes)
```
[Jetson · SSH]  python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15
```
Con buena luz. Anota los números **tal cual**. Viernes: cámara 29.0, entrega 29.1, inferencia ≈ 68 ms. Si "FPS de la cámara" ya es bajo, el límite es la luz o la cámara, no el agente. Código de salida 1 = no respondió o no entregó cuadros.

Con dos modelos, compara con el viernes (29.0 / 29.1 FPS y ≈ 68 ms). Si la inferencia sube mucho, baja `AETHER_DETECT_MAX_HZ` (por ejemplo a 5). En `curl -s localhost:8001/status` debe verse `"model": "parts.pt + yolov8n.pt"` y un bloque `"obstacles"`.

### 2.6 Que las 3 piezas se reconozcan desde cualquier ángulo (lo que SÍ hay que hacer)

**Verdad incómoda:** ningún archivo que se copie hace que el modelo reconozca una pieza desde cualquier ángulo. Eso lo decide **qué fotos viste al entrenar**. Hoy el dataset tiene **19 fotos**; el mAP50 de 0.995 se midió sobre ese mismo universo chico y es optimista. Un modelo así puede acertar de frente y fallar de lado, de arriba o con otra luz. Hasta que esto se mida, la capacidad "desde cualquier ángulo" es **NO VERIFICADA**.

**Protocolo recomendado para ampliar el dataset** (es una recomendación, no una medición):
1. **Giro completo:** cada pieza sobre la mesa o un plato giratorio, una foto cada 15° a 30° de giro (los 360°).
2. **Tres alturas de cámara:** desde arriba, a 45° y a ras de la mesa, repitiendo el giro.
3. **Distancias:** cerca, a la distancia a la que el robot la va a ver y lejos.
4. **Luz y fondo:** al menos dos luces distintas (la del laboratorio, una más tenue) y los fondos reales: el fixture, el anaquel y el piso por donde pasa el robot.
5. **Parcialmente tapada** (parte de la pieza fuera del cuadro o detrás de otra) y **dos piezas juntas**.
6. **Fotos de fondo sin ninguna pieza** (anaquel vacío, fixture vacío, personas, sillas): enseñan al modelo a **no** inventar piezas. Es lo que hoy falta también para medir el FAIL de la celda.
7. **Toma las fotos con la cámara del Jetson** (640x480, la misma que usará el robot), no con el celular. La cámara real es la que importa.
8. **Cuántas:** Ultralytics recomienda del orden de **1500 imágenes por clase** para producción. Para 3 piezas rígidas en un entorno controlado puede bastar mucho menos, pero **cuánto** solo se sabe midiendo (paso 10). Empieza con 100 a 200 por clase.
9. Etiqueta en formato YOLO como has hecho hasta ahora (un `.txt` por foto) y deja que `train_parts.py` las reparta (4 de cada 5 a entrenamiento).
10. **Mide con fotos que el modelo nunca vio:** guarda aparte (no en `inbox`) fotos de **ángulos y luces nuevos**. Después de entrenar, comprueba cuántas acierta. Prueba en vivo: pon cada pieza frente a la cámara del Jetson, gírala despacio 360° y mira la etiqueta verde en la página: debe mantenerse la clase correcta con confianza alta. Anota qué ángulos fallan y toma más fotos de esos.
11. **Si dos piezas se parecen** (las tres son ECU), revisa en `edge/perception/runs/` la matriz de confusión: ahí se ve qué piezas se confunden. Distinguirlas puede requerir ángulos donde se vea el rasgo que las diferencia.

**Entrenar:** como siempre, en la laptop (`python train_parts.py` desde `edge`; solo publica `parts.pt` si el mAP50 sube). Ojo: el script **congela las primeras 10 capas** y ajusta solo la cabeza; con muchas fotos de ángulos nuevos puede quedarse corto y habría que descongelar más capas (cambio en `FREEZE_LAYERS`, **no probado**). El Jetson tiene GPU: `python train_parts.py --device 0` allí sería mucho más rápido que la CPU de la laptop, pero **no se ha probado** que `ultralytics` entrene bien en ese Jetson (ahí solo se probó inferir). Para empezar, entrena en la laptop.

**Cada vez que reentrenes**, repite el paso 1 de 2.3b (copiar `parts.pt`), y si agregaste fotos, el paso 2 (borra el dataset viejo del Jetson antes de copiar el nuevo para no mezclar versiones: `rm -rf ~/aether/edge/perception/parts/images ~/aether/edge/perception/parts/labels` y vuelve a extraer). Reinicia el agente (`bash ~/aether/scripts/jetson/detener-agente.sh` y `iniciar-agente.sh`): el modelo solo se lee al arrancar. Para volver al modelo anterior guarda antes `cp parts.pt parts.pt.bak`.

---

## Fase 3 — La cadena laptop ↔ Jetson

### 3.1 Servidor de la laptop
```
[Laptop · PowerShell]  .\iniciar_aether.ps1 -SinVoz
```
(La voz va en la Fase 4.) Esa ventana **queda ocupada** con el servidor: no la cierres y no escribas en ella (Ctrl+C lo detiene). Abre una **segunda ventana de PowerShell** (Lo básico, A, incluido el `cd`) y en ella corre:
```
[Laptop · PowerShell]  curl.exe -s http://localhost:8000/config/agents
```
Esperado: `"stream_url":"http://<IP-JETSON>:8001/stream"`. Si sale `null`: la variable no se leyó; revisa `backend\.env` y reinicia el servidor.

### 3.2 Ver el video del Jetson en la página (esto es lo que falló el viernes)

**Antes, el audio por HDMI** (reportado el viernes: el sonido del Jetson solo salió después de este comando, y **se pierde al reiniciar el Jetson**, así que hay que repetirlo cada vez que se reinicie). Va en un terminal **dentro de la sesión VNC**, con el audio HDMI conectado:
```
[Jetson · VNC]  pactl set-default-sink alsa_output.platform-3510000.hda.hdmi-stereo
[Jetson · VNC]  pactl get-default-sink
```
Esperado: el segundo comando imprime `alsa_output.platform-3510000.hda.hdmi-stereo`. Si `pactl` dice que ese sink no existe, lista los que hay con `pactl list short sinks` y usa el nombre que termine en `hdmi-stereo`. Si `pactl` no puede conectarse al servidor de audio, no estás en el terminal de la sesión VNC (por SSH no funciona). **NO VERIFICADO hoy**; es lo que se hizo el viernes.

Luego la página de **Lumina** (`robot.html`), igual que el viernes:
```
[Jetson · VNC]  bash ~/aether/scripts/ver-aether.sh robot.html
```
(Sin el argumento `robot.html` no sé qué página abre; para el dashboard principal es el mismo comando sin argumento.) (Por SSH no hay pantalla.) Firefox abre la página de la laptop. **Recarga con Ctrl+F5** para saltarte la caché de la política vieja, pulsa "Iniciar cámara" y mueve la mano.
- Esperado: el video es el del Jetson, etiqueta "EN VIVO"; en F12 → Red, la petición va a `http://127.0.0.1:8001/stream`.
- Imagen en blanco: `curl -sI http://<IP-LAPTOP>:8000/health` desde el Jetson debe traer `img-src … http://<IP-JETSON>:8001` en `content-security-policy`. Si no está, la variable no llegó. Si está y aun así no carga, F12 → Consola: ahora el mensaje distingue "bloqueado por la política de seguridad" de "cámara o agente no disponible".
- `ninguna laptop contestó`: el Jetson no sabe cuál es la IP de la laptop. Dile cuál (en el terminal de VNC): `echo "<IP-LAPTOP>" > ~/.aether-host` (con la IP de hoy, sin `< >`) y repite `ver-aether.sh robot.html`.

### 3.3 Observaciones llegando a la laptop
Pon **una de las 3 piezas** (y, aparte, tu mano o una botella como "obstáculo") frente a la cámara del Jetson.
```
[Laptop · PowerShell]  curl.exe -s "http://localhost:8000/perception/recent-detections?limit=3"
[Laptop · PowerShell]  curl.exe -s http://<IP-JETSON>:8001/status
```
Esperado: detecciones con `detected_class` = `computadora1`, `computadora2` o `computadora3` (con `code_read: false`: la identidad es la clase). **Los obstáculos NO deben aparecer ahí**: se ven en naranja en el video y en `/status` → `obstacles`. En `/status`, `laptop.sent_total` crece y `laptop.reachable` es `true`. `laptop.last_error` explica el fallo (firewall, URL, red). Las observaciones se juntan en lotes de 1 s (`AETHER_OUTBOX_INTERVAL_S`): un retraso de hasta 1 s es normal.

**Fin de Fase 3: Jetson y laptop quedaron como el viernes.** No se ha usado voz ni la Pi.

---

## Fase 4 — Voz (opcional; hazla al final del día o después de la Fase 6)

**Plan para el lunes: arranca con Vosk y deja la tecla `w` como respaldo. Whisper queda para después.** Lo que se sabe: Whisper small midió 15/16 activaciones (reportado), pero su prueba en vivo quedó sin resolver: Lumina dejó de escucharte. Hasta resolverlo, no lo uses.

**Antes de arrancar, comprueba que `AETHER_VOICE_ENGINE` NO esté definida en la ventana de PowerShell** (una variable de la ventana le gana al `backend\.env`: el servicio de voz carga el `.env` sin sobrescribir lo que ya existe en el entorno, **VERIFICADO** en `backend/voice/service.py`). Si queda de una prueba con Whisper, el servicio arrancaría con Whisper aunque el `.env` diga otra cosa:
```
[Laptop · PowerShell]  echo "motor: [$env:AETHER_VOICE_ENGINE]"
[Laptop · PowerShell]  Remove-Item Env:AETHER_VOICE_ENGINE -ErrorAction SilentlyContinue
```
Esperado: `motor: []` (vacío). El motor por defecto es `vosk`. Abre una ventana de PowerShell nueva si dudas. Revisa también que el `.env` no tenga una línea `AETHER_VOICE_ENGINE=whisper` ni `AETHER_VOICE_WHISPER_PROMPT=`; en la ventana de voz el motor aparece al arrancar.

Referencia completa: `docs/guia_arranque.md` §1.4 y §4.
1. `[Laptop · PowerShell]  backend\.venv\Scripts\python.exe -m pip install -r backend\requirements-voice.txt` (instala `sounddevice` y `vosk`; requiere internet, no administrador).
2. El modelo de voz en español. (a) En el navegador abre **alphacephei.com/vosk/models** y descarga `vosk-model-small-es-0.42` (es un `.zip`). (b) Clic derecho sobre el `.zip` → **Extraer todo...** → elige una carpeta corta, por ejemplo `C:\vosk` → Extraer. (c) Abre la carpeta que resultó y entra hasta ver adentro las carpetas `am`, `conf`, `graph` (si ves otra carpeta con el mismo nombre dentro, entra a esa: **la ruta que importa es la que contiene `am`, `conf` y `graph`**). (d) Copia esa ruta de la barra del Explorador. (e) Agrégala a `backend\.env` (Lo básico, E) con una línea como esta (cambia la ruta por la tuya):
```
AETHER_VOICE_MODEL=C:\vosk\vosk-model-small-es-0.42
```
3. Calibra el micrófono. En PowerShell, en la carpeta del proyecto: `backend\.venv\Scripts\python.exe scripts\probar_voz.py --mic 8` (el `8` son 8 segundos: **4 s en silencio y 4 s hablando normal**, sigue lo que te indique en pantalla). Al final te sugiere una línea `AETHER_VOICE_VAD_THRESHOLD=<número>`: agrégala a `backend\.env` (Lo básico, E).
4. Reinicia con `.\iniciar_aether.ps1` (sin `-SinVoz`). La voz abre su propia ventana: `● MICRÓFONO ACTIVO`; `p` pausa y suelta el micrófono, `q` sale, **`w` despierta a Lumina sin hablar**.
5. Si no oye "Lumina": usa `w` (es el respaldo del lunes). Con ruido, el problema es el reconocimiento, no la palabra; un micrófono de diadema ayuda más que cualquier ajuste (`docs/auditoria/PALABRA_CLAVE.md`).
6. Audio de Lumina en el Jetson: Ctrl+F5 en `robot.html`; antes de culpar a la CSP, comprueba que `ELEVENLABS_API_KEY` esté en `backend\.env` y tenga créditos (**NO VERIFICADO**).

| Síntoma | Qué hacer |
|---|---|
| `Voz desactivada: faltan los paquetes vosk y sounddevice` | Paso 1 |
| `Voz desactivada: falta AETHER_VOICE_MODEL` | Paso 2 |
| El micrófono equivocado | `backend\.venv\Scripts\python.exe -m sounddevice` lista los dispositivos; `AETHER_VOICE_DEVICE=<número>` |
| No hay notificación de Windows | `AETHER_VOICE_NOTIFY=1`; revisa "No molestar" de Windows (**NO VERIFICADO**) |

---

## Fase 5 — Raspberry Pi 4: el software, SIN tocar ningún cable de la celda

Meta de esta fase: ver el video de la celda y que la Pi mande eventos a la laptop, **sin `gpiod`**. En ese modo ningún pin se mueve (`cell_line.py` no finge: la pieza queda como `pulso_no_enviado` o `fallo_actuacion`). Es la prueba más segura que existe.

### 5.0 Tu caso: la Pi ya tiene la instalación anterior (la guía con `main.py`, `.venv` y PyTorch)

**Cómo sé qué tiene tu Pi:** no la veo; lo deduzco de la guía vieja que me pegaste (Thonny, `~/INTEGRADORA`, rama `feature/hardening-cloudflare`). Si seguiste esa guía al pie de la letra, tu Pi tiene esto. **Los comandos del Paso 1 confirman o corrigen cada punto antes de que cambies algo.**

| Qué tiene la Pi (según la guía vieja) | Dónde | ¿Estorba a la instalación nueva? |
|---|---|---|
| Repositorio completo, rama `feature/hardening-cloudflare` | `~/INTEGRADORA` | **No.** La nueva va en otra carpeta, `~/aether`. Se queda como vuelta atrás |
| Entorno de Python con `fastapi`, `opencv-python`, `ultralytics` y `torch` (varios GB) | `~/INTEGRADORA/backend/.venv` | **No estorba**: está aislado dentro de esa carpeta. Solo ocupa espacio |
| `parts.pt` copiado a mano | `~/INTEGRADORA/edge/perception/weights/parts.pt` | No. La Pi nueva ya no lo usa: necesita `parts.onnx` (5.4) |
| Servidor completo arrancado a mano con `uvicorn main:app` en el puerto 8000 (con `AETHER_PUBLIC_MODE=local`) | Una terminal abierta | **SÍ estorba**: ocupa el puerto 8000 y la cámara. Hay que detenerlo |
| `python3-libgpiod` y/o `pip install gpiod` (el paso 3 de la guía vieja, **opcional**) | Sistema / dentro de `.venv` | **Depende y es de seguridad: Paso 3** |
| `git`, `python3-venv`, `python3-pip` | Sistema | No. La guía nueva los pide y ya están |
| Thonny apuntando al `.venv` de `~/INTEGRADORA` | Thonny | No. Déjalo; solo se usa para leer código |

**Respuesta directa: ¿hay que borrar cosas? No, nada todavía.** Se detiene el servidor viejo, se instala lo nuevo **al lado** y solo cuando el nuevo ya funcione se borra el entorno viejo para recuperar espacio. Mientras tanto `~/INTEGRADORA` es tu vuelta atrás.

**Paso 1: Mirar qué hay (solo lectura).**
```
[Pi 4 · SSH]  uname -m ; python3 --version ; cat /etc/os-release | head -3 ; df -h / ; free -h
[Pi 4 · SSH]  ls ~ ; git -C ~/INTEGRADORA branch --show-current ; git -C ~/INTEGRADORA status --short
[Pi 4 · SSH]  tmux ls ; ps aux | grep -E "uvicorn|thonny" | grep -v grep ; ss -ltnp | grep :8000
[Pi 4 · SSH]  systemctl list-unit-files | grep -iE "aether|celda|uvicorn|integradora" ; crontab -l ; grep -n "AETHER\|LINE_" ~/.bashrc ~/.profile 2>/dev/null
[Pi 4 · SSH]  dpkg -l | grep -iE "libgpiod|python3-opencv|python3-numpy" ; ~/INTEGRADORA/backend/.venv/bin/python -m pip list 2>/dev/null | grep -iE "^(torch|ultralytics|opencv|gpiod)"
[Pi 4 · SSH]  du -sh ~/INTEGRADORA ~/INTEGRADORA/backend/.venv
```
Cómo leerlo:
- `uname -m` = `aarch64` y Python ≥ 3.10: bien. Si es `armv7l` o Python 3.9: reflashea con Raspberry Pi OS de 64 bits (Bookworm). Con la guía vieja ya corría `ultralytics`, así que probablemente es 64 bits, pero no lo asumas.
- `git status --short` con líneas: tienes cambios locales en la Pi; respáldalos (Paso 2).
- `ss -ltnp | grep :8000` con salida: el servidor viejo sigue vivo (Paso 2).
- `dpkg -l` muestra `libgpiod`/`python3-libgpiod` o el `pip list` muestra `gpiod`: **lee el Paso 3 antes de arrancar nada**.
- `du -sh`: cuánto ocupa lo viejo y cuánto espacio recuperarás luego.

**Paso 2: Detener el servidor viejo y respaldar.**
1. Ve a la terminal donde corre el servidor y pulsa `Ctrl+C`. Si no recuerdas dónde está: `ps aux | grep uvicorn` y `kill <PID>` con el PID que salga. Comprueba: `ss -ltnp | grep :8000` no debe imprimir nada.
2. Si el paso 1 mostró un servicio o `cron` con el nombre de tu proyecto: `sudo systemctl disable --now <nombre-exacto>` o quita la línea con `crontab -e`. (La guía vieja no pedía autoarranque, así que lo normal es que no haya nada.)
3. Respalda lo que no es repetible (el `.venv` no hace falta):
```
[Pi 4 · SSH]           cd ~ && tar -czf respaldo-pi-anterior.tar.gz --exclude=".venv" --exclude="__pycache__" INTEGRADORA
[Laptop · PowerShell]  scp <usuario>@<IP-PI>:~/respaldo-pi-anterior.tar.gz .
```
Incluye el `backend/.env` (puede tener claves: **es secreto**, no lo subas a ningún lado), cualquier cambio local y la base de datos si la hubo. `parts.pt` y el dataset ya los tienes en la laptop.

**Paso 3: Seguridad con los pines.** La guía vieja decía que `python3-libgpiod` y `pip install gpiod` eran **opcionales** ("solo si vas a disparar pistón y banda desde la Pi"). Hay tres casos; el Paso 1 te dice en cuál estás:
- **No está instalado**: bien. Nada se moverá hasta la Fase 6. Salta al Paso 4.
- **`python3-libgpiod` (apt) sí está instalado**: es del sistema y el entorno nuevo (`--system-site-packages`) lo verá. El agente nuevo **moverá GPIO 8 y 9 en cuanto juzgue una pieza**, y las fases 5.7 y 5.8 suponen que no mueve nada. Quítalo mientras haces la Fase 5: `sudo apt remove python3-libgpiod` (revisa con `dpkg -l | grep libgpiod` que no quede otra cosa que lo necesite) y vuélvelo a instalar en 6.3, después de medir con LED. Si prefieres dejarlo, haz toda la Fase 5 con **el aire del pistón cerrado y los relevadores desconectados** de la banda y del pistón.
- **Solo `gpiod` de pip dentro del `.venv` viejo**: no afecta al entorno nuevo. No hay que hacer nada.
- Con la Pi vieja, ¿llegaste a conectar los relevadores y a mover el pistón? Si sí, **es la prueba más valiosa que tienes**: anota qué placa era y si el relevador encendía con el pin en alto o en bajo (decide `LINE_RELES_ACTIVO_BAJO`, 6.2) y qué tiempos usaste.

**Paso 4: Instalar lo nuevo al lado.** Sigue 5.1 a 5.8 tal cual (clon en `~/aether`, entorno `~/celda-venv`, `parts.onnx`, `~/.celda.env`). Diferencias con lo que ya conocías:
- **La dirección de la página no cambia:** `http://<IP-PI>:8000/celda.html`, y el video sigue en `/line/vision/stream`. Pero ya **no existe `/perception/stream`** (inventario) en la Pi: el inventario es del Jetson.
- **Ya no se arranca `main:app`** sino `celda_agent:app` (la celda sola, sin Lumina, base de datos, `torch` ni `ultralytics`).
- **La contraseña de la HMI cambió:** antes la cuenta de laboratorio era fija (`admin`/`admin`); ahora la clave sale de `CELDA_HMI_CLAVE` en `~/.celda.env` y sin ella **nadie** inicia sesión.
- **`AETHER_PUBLIC_MODE=local` ya no hace falta** en la Pi (el agente nuevo solo acepta red local por su cuenta). Si lo exportaste en `~/.bashrc`, no estorba.
- **`LINE_VISION_CAMERA_INDEX=1`** (si tu cámara no es la 0) **sí sigue valiendo**; ponlo en `~/.celda.env`.
- **La Pi ya no usa `parts.pt`** sino `parts.onnx`, que se exporta en la laptop (5.4). El `parts.pt` viejo de la Pi puede quedarse hasta el Paso 5.
- OpenCV: el nuevo usa el de `apt` (`python3-opencv`), no el de pip. El `opencv-python` del `.venv` viejo no se mezcla porque está en otro entorno.

**Paso 5: Borrar lo viejo, SOLO cuando el nuevo ya funcione** (5.8 salió bien: video, juicio de una pieza y evento en la laptop):
1. `rm -rf ~/INTEGRADORA/backend/.venv` (recupera los GB de `torch`). Es lo único que de verdad pesa.
2. Cuando también la Fase 6 esté probada y no quieras volver atrás: `rm -rf ~/INTEGRADORA` (ya tienes el respaldo del Paso 2). Antes comprueba que `~/aether` tiene lo que necesitas.
3. `python3 -m pip cache purge` si usaste pip del sistema.

**Vuelta atrás a la instalación vieja:** `tmux kill-session -t celda` (para el agente nuevo) y arranca el servidor viejo como lo hacías (`cd ~/INTEGRADORA/backend && source .venv/bin/activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000`). Mientras no hayas hecho el Paso 5, sigue intacto.

### 5.1 Preparar la Pi
**Si tu Pi ya funciona (es tu caso: ya tiene sistema operativo y puedes entrar por SSH), salta los puntos 1 y 2** y haz solo el 3 y el 4.
1. *(Solo si hay que reinstalar el sistema; reglas generales de Raspberry Pi, NO verificadas con tu Pi.)* En la laptop descarga e instala **Raspberry Pi Imager** (raspberrypi.com/software). Ábrelo → **Elegir dispositivo**: Raspberry Pi 4 → **Elegir sistema operativo**: *Raspberry Pi OS (64-bit)* → **Elegir almacenamiento**: la microSD en la laptop → **Siguiente** → cuando pregunte si quieres personalizar, **Editar ajustes**: nombre del equipo (por ejemplo `celda`), usuario y contraseña (anótalos), la red WiFi si no usarás cable, y en la pestaña de servicios activa **SSH** con contraseña → Guardar → **Sí** → escribir. Al terminar, pon la microSD en la Pi.
2. Conecta la cámara USB y el cable de red, y enciende con la fuente oficial. Espera 2 o 3 minutos la primera vez.
3. Con la IP de la Pi (Paso previo, C): en PowerShell `ping <IP-PI>` (debe responder) y luego `ssh <usuario>@<IP-PI>` (Lo básico, C).
4. Anota `<usuario>` y `<IP-PI>` en la sección 9 (no están en el repo).

### 5.2 Revisar la Pi (solo lectura)
```
[Pi 4 · SSH]  cat /etc/os-release | head -3
[Pi 4 · SSH]  uname -m && python3 --version && free -h
[Pi 4 · SSH]  vcgencmd get_throttled && vcgencmd measure_temp
```
- Esperado: `aarch64`, Python ≥ 3.10 (Bookworm trae 3.11), `throttled=0x0`.
- `throttled` distinto de `0x0` = bajo voltaje o temperatura: cambia la fuente o el cable **antes** de seguir (la Pi se comporta raro con poca energía).
- Python < 3.10: el agente no arranca (usa sintaxis de 3.10). Reinstala con Bookworm.

### 5.3 Instalar (una vez)
```
[Pi 4 · SSH]  sudo apt update
[Pi 4 · SSH]  sudo apt install -y git tmux python3-venv python3-opencv python3-numpy v4l-utils
[Pi 4 · SSH]  python3 -c "import cv2; print(cv2.__version__)"
```
Esperado: `4.6.x`. Anótalo; es la versión en riesgo (ver 5.6).

**Orden exacto de la instalación en la Pi (corrige a `COMANDOS_LINUX.md` §7, que tiene dos errores):**
- *Error 1, la rama:* clonar sin indicar rama baja `main`, que **no** tiene `celda_agent.py` (**VERIFICADO** con `git ls-tree origin/main`). Hay que clonar la rama `jetson-agente` (ya está subida a GitHub).
- *Error 2, el orden:* la receta vieja copia el modelo con `scp` a `~/aether` y después clona en esa misma carpeta; `git clone` se niega si la carpeta ya existe con contenido. Por eso aquí **primero se clona (pasos 1 a 3) y el modelo se copia después (sección 5.4)**.

Pasos, todos `[Pi 4 · SSH]` salvo que se indique:
1. Clonar solo la rama de la celda, sin bajar todo el historial ni los archivos pesados:
```
git clone --depth 1 --branch jetson-agente --filter=blob:none --sparse https://github.com/MarioMendez-123/INTEGRADORA.git ~/aether
```
2. Pedir solo las carpetas que la Pi necesita (`backend`, `dashboard` y las clases del modelo):
```
cd ~/aether && git sparse-checkout set backend dashboard edge/perception/parts
```
3. Comprobar que llegaron los archivos clave (los tres deben listarse sin error):
```
ls ~/aether/backend/celda_agent.py ~/aether/backend/line_model.py ~/aether/edge/perception/parts/classes.txt
```
4. Crear el entorno de Python que **ve** los paquetes de `apt` (así usa el OpenCV de la Pi):
```
python3 -m venv --system-site-packages ~/celda-venv
```
5. Instalar lo único que pide pip (`fastapi` y `uvicorn`):
```
~/celda-venv/bin/pip install -r ~/aether/backend/requirements-pi.txt
```
6. Comprobar lo instalado y lo prohibido (comandos más abajo, "Comprobación de lo prohibido").
7. **Después**, copiar el modelo `parts.onnx` desde la laptop (sección 5.4).

- Si el repositorio fuera privado, el `clone` pide credenciales: usa un token en el momento (nunca lo escribas en un archivo del repo).
- `Remote branch jetson-agente not found`: el `push` de 1.1 no se hizo.
- `externally-managed-environment`: estás usando el `pip` del sistema; usa **siempre** `~/celda-venv/bin/pip`.
- `pip` no encuentra red: `ping -c 2 pypi.org`; la Pi necesita internet solo para este paso.
- **Comprobación de lo prohibido** (la Pi no debe tener `torch`, `ultralytics` ni `opencv-python` de pip):
```
[Pi 4 · SSH]  ~/celda-venv/bin/pip list 2>/dev/null | grep -iE "^(torch|ultralytics|opencv)" ; echo "grep salió con: $?"
[Pi 4 · SSH]  ~/celda-venv/bin/python -c "import cv2, numpy, fastapi, pydantic, uvicorn; print('imports ok', cv2.__version__)"
```
Esperado: `grep` no imprime nada (salida 1) e `imports ok 4.6.x`. Si aparece `opencv-python`: `~/celda-venv/bin/pip uninstall opencv-python` (se come al OpenCV de apt).

### 5.4 Exportar el modelo ONNX y copiarlo
`parts.onnx` **no está en git** (carpeta `weights/` ignorada). Ya existe en la laptop: `edge\perception\weights\parts.onnx`, 12 114 081 bytes, del 22 de octubre. Solo reexporta si reentrenaste `parts.pt` después.
```
[Laptop · PowerShell]  # solo si hay que reexportar:
edge\.venv\Scripts\python.exe -m pip install onnx
$env:YOLO_AUTOINSTALL = "False"
edge\.venv\Scripts\python.exe -c "from ultralytics import YOLO; YOLO('edge/perception/weights/parts.pt').export(format='onnx', imgsz=320, opset=12)"
```
Copia (la carpeta destino la crea el `mkdir`):
```
[Laptop · PowerShell]  ssh <usuario>@<IP-PI> "mkdir -p ~/aether/edge/perception/weights"
[Laptop · PowerShell]  scp edge\perception\weights\parts.onnx <usuario>@<IP-PI>:~/aether/edge/perception/weights/
[Laptop · PowerShell]  Get-FileHash edge\perception\weights\parts.onnx -Algorithm SHA256
[Pi 4 · SSH]           sha256sum ~/aether/edge/perception/weights/parts.onnx
```
Los dos SHA-256 deben ser idénticos (ignora mayúsculas). Distintos = la copia se cortó: repite el `scp`.
`imgsz=320` debe coincidir con `LINE_IMGSZ` (320 por defecto).

### 5.4b Tu dataset de YOLO: qué va a la Pi y qué va al Jetson

| Qué | Dónde vive | ¿Va a la Pi? | ¿Va al Jetson? |
|---|---|---|---|
| **Fotos y etiquetas** (`edge/perception/parts/images`, `labels`; hoy 19 fotos, 1.8 MB) | La laptop. Git las ignora a propósito (repositorio público) | **No necesita** las fotos (la Pi solo juzga) | **Sí, por tu decisión del 25 oct**: se copian con `tar` y `scp` (2.3b, paso 2). El agente no las usa para detectar; sirven para tenerlas ahí y reentrenar |
| **`classes.txt`** | En git | Sí, llega solo con el `sparse-checkout` de 5.3 | Sí, llega con el `git pull` |
| **`parts.pt`** (pesos entrenados) | La laptop (`edge/perception/weights/`, ignorado por git) | No (la Pi no tiene `torch`) | **Sí** (2.3b, paso 1): lo usa el agente para identificar las 3 piezas |
| **`parts.onnx`** (el mismo modelo exportado) | La laptop | **Sí** (5.4) | No |

Si además quieres tener las fotos en la Pi, se copian igual que al Jetson (2.3b, paso 2, cambiando la IP y el usuario y quitando `data.yaml`/`lists` si no existen); la Pi **no las usa**.

**Qué necesita cada equipo para identificar piezas:** el Jetson, `parts.pt`; la Pi, `parts.onnx`. Los dos con `classes.txt` iguales y en el mismo orden con que se entrenó. La Pi lo comprueba al arrancar y se detiene con `ValueError: … trae N clases y classes.txt tiene M` si no coinciden; el Jetson solo advierte si la clase no está (revisa que `read_class_names()` de 2.3b dé las mismas tres).

### 5.4c Reentrenar y volver a subirlo (cuando entrenes más)
Todo el entrenamiento se hace **en la laptop**; la Pi y el Jetson solo reciben el resultado (Pi: `parts.onnx`; Jetson: `parts.pt`, ver 2.6).

1. Agrega las fotos nuevas a `edge\perception\parts\images\inbox` (y sus etiquetas, como hayas venido haciendo). Entrena: en PowerShell, en la carpeta del proyecto:
```
[Laptop · PowerShell]  cd edge\perception
[Laptop · PowerShell]  ..\.venv\Scripts\python.exe train_parts.py
[Laptop · PowerShell]  cd ..\..
```
   (opciones: `--epochs 80 --device cpu`). El script reparte las fotos solo (4 de cada 5 a entrenamiento) y **publica `weights\parts.pt` únicamente si el mAP50 supera al anterior**. Si no mejora, `parts.pt` queda igual y no hay nada que subir. Tarda: en CPU puede ser desde varios minutos hasta horas según las fotos (**sin medir**).
2. `[Laptop · PowerShell]` Reexporta a ONNX (siempre `imgsz=320`, `opset=12`; el `imgsz` debe coincidir con `LINE_IMGSZ`):
```
$env:YOLO_AUTOINSTALL = "False"
edge\.venv\Scripts\python.exe -c "from ultralytics import YOLO; YOLO('edge/perception/weights/parts.pt').export(format='onnx', imgsz=320, opset=12)"
```
3. **Si agregaste o cambiaste CLASES** (otra pieza, otro orden): edita `edge\perception\parts\classes.txt`, haz commit y push de ese archivo (es lo único del dataset que va a git) y en la Pi `[Pi 4 · SSH] cd ~/aether && git pull`. Si solo agregaste fotos de las mismas 3 clases, este paso no hace falta.
4. **"Borrar y volver a subir" en la Pi:** guarda el modelo viejo por si el nuevo falla, copia el nuevo y reinicia.
```
[Pi 4 · SSH]           mv ~/aether/edge/perception/weights/parts.onnx ~/aether/edge/perception/weights/parts.onnx.bak
[Laptop · PowerShell]  scp edge\perception\weights\parts.onnx <usuario>@<IP-PI>:~/aether/edge/perception/weights/
[Laptop · PowerShell]  Get-FileHash edge\perception\weights\parts.onnx -Algorithm SHA256
[Pi 4 · SSH]           sha256sum ~/aether/edge/perception/weights/parts.onnx
```
   (los dos SHA-256 deben ser iguales). Si ya no lo necesitas: `rm ~/aether/edge/perception/weights/parts.onnx.bak`. `scp` sobrescribe, así que el `mv` es solo tu respaldo.
5. `[Pi 4 · SSH]` Repite la prueba aislada de **5.6** (carga y milisegundos) **antes** de reiniciar el servidor. Luego reinicia el agente: `tmux kill-session -t celda` y arráncalo como en 5.7. El modelo solo se lee al arrancar.
6. **Volver al modelo anterior** si el nuevo juzga peor: `mv parts.onnx.bak parts.onnx` en la Pi y reinicia el agente.
7. **Jetson:** copia también `parts.pt` nuevo y reinicia su agente (2.3b y 2.6).
8. **Nunca** subas a GitHub fotos, `parts.pt` ni `parts.onnx` (repositorio público; `git diff --stat` antes de cada push).

Lo que **no** está medido: el FAIL real con objetos que no son pieza, porque el dataset actual solo tiene piezas registradas. Si reentrenas, incluye fotos de objetos que no son tus 3 computadoras como ejemplos de fondo; sin eso, el FAIL de la celda sigue sin medirse (capítulo 7 del libro).

### 5.5 Configuración de la Pi
El agente de la celda **no lee archivos `.env`**: solo variables de entorno del proceso. Se crea un archivo con ellas y se carga al arrancar (5.7). Dentro de SSH en la Pi (Lo básico, C):
1. Abre el editor: `nano ~/.celda.env` (Lo básico, F).
2. Pega este bloque (clic derecho) y **cambia las dos líneas con `< >`**: la clave (Lo básico, H) y la IP de la laptop (Paso previo), sin dejar `<` ni `>`:
```
CELDA_HMI_CLAVE=<tu clave>
AETHER_LAPTOP_URL=http://<IP-LAPTOP>:8000
AETHER_AGENT_ID=pi
LINE_ANALISIS_CADA_S=0.5
LINE_ESTABLES=5
LINE_CV_THREADS=3
LINE_IMGSZ=320
```
3. Guarda con **Ctrl+O**, **Enter**; sal con **Ctrl+X**.
4. Protege el archivo (solo tú puedes leerlo): `chmod 600 ~/.celda.env`
5. Comprueba que están todas, mostrando solo los nombres: `cut -d= -f1 ~/.celda.env`
- Si tu cámara no es la 0 (5.7), agrega `LINE_VISION_CAMERA_INDEX=1` con `echo 'LINE_VISION_CAMERA_INDEX=1' >> ~/.celda.env`. Si tu placa de relevadores enciende con el pin en bajo (Fase 6), `echo 'LINE_RELES_ACTIVO_BAJO=1' >> ~/.celda.env`.
- Un valor mal escrito detiene el arranque con un mensaje que nombra la variable (`Configuración inválida: …`).
- Sin `AETHER_LAPTOP_URL` la Pi funciona pero no manda eventos.
- Sin `CELDA_HMI_CLAVE` el log avisa y nadie podrá iniciar sesión.
- **No pongas `LINE_ESTABLES` por debajo de 3**: un FAIL falso dispararía el pistón.

### 5.6 Probar el modelo solo (aísla el riesgo de OpenCV 4.6)
Antes del servidor, comprueba que `cv2.dnn` lee el ONNX y mide un análisis:
```
[Pi 4 · SSH]  cd ~/aether/backend && ~/celda-venv/bin/python - <<'EOF'
import time, numpy as np
from line_model import DetectorOnnx
from dataset_store import default_weights_file, read_class_names
d = DetectorOnnx(str(default_weights_file().with_suffix(".onnx")), read_class_names(), imgsz=320)
f = np.zeros((480, 640, 3), np.uint8)
t = time.time()
for _ in range(10): d(f)
print("modelo cargado; ms por análisis:", round((time.time() - t) * 100, 1))
EOF
```
- Esperado: `modelo cargado; ms por análisis: <número>`. Anótalo (es la primera medida del ONNX en una Pi; hoy no existe ninguna). Si es mayor que ~400 ms, el cuadro `LINE_ANALISIS_CADA_S=0.5` no alcanza y la Pi se atrasa: sube a `1.0` (máximo permitido; el estado "Cámara apagada" salta si pasan 2 s sin análisis).
- `cv2.error … readNetFromONNX` / `Unsupported/unknown operator` / `Failed to parse ONNX`: **OpenCV 4.6 no lee ese ONNX** (el riesgo conocido). No improvises: avísame con el texto completo. Las salidas son reexportar con otro `opset` o cambiar a `onnxruntime`, que requiere un cambio de código que **no existe** hoy y que no se debe hacer a ciegas en la Pi.
- `ValueError: … trae N clases y classes.txt tiene 3`: el modelo no corresponde a las clases; vuelve a exportar `parts.pt` (5.4).
- `FileNotFoundError` / `No such file`: el `.onnx` no está en `~/aether/edge/perception/weights/` (5.4).

### 5.7 Arrancar la celda
```
[Pi 4 · SSH]  tmux new -s celda
[Pi 4 · tmux] cd ~/aether/backend && set -a && . ~/.celda.env && set +a && ~/celda-venv/bin/python -m uvicorn celda_agent:app --host 0.0.0.0 --port 8000 2>&1 | tee -a ~/celda.log
```
Después del primer comando ya estás **dentro de tmux** (barra verde abajo, Lo básico, G): pega ahí la segunda línea. Cuando veas el mensaje `Celda lista…`, suelta la sesión pulsando **Ctrl+B**, soltando, y luego **D**: el programa sigue corriendo. Vuelves con `tmux attach -t celda`.
Esperado en el log, una línea como: `Celda lista: un análisis cada 0.50 s, video a 10 FPS, modelo parts.onnx, sin GPIO: los pulsos NO se envían, laptop http://<IP-LAPTOP>:8000`.
Para probarlo, ya fuera de tmux (o en una **segunda ventana de PowerShell** con otro `ssh <usuario>@<IP-PI>`):
```
[Pi 4 · SSH]  curl -s localhost:8000/health
[Pi 4 · SSH]  curl -s localhost:8000/status
[Pi 4 · SSH]  top -b -n 1 | head -15
```
Esperado: `{"status":"ok","error":null}`; en `/status`, `camera.open: true`, `inference.ms_avg` con número, y en `top` el CPU de `python` (cifra nueva: no existe medida previa en la Pi; la de la laptop fue 18 %).

| Síntoma | Causa | Qué hacer |
|---|---|---|
| `Configuración inválida: …` | Variable mal escrita | El mensaje nombra cuál (5.5) |
| `Address already in use` | Ya hay un uvicorn en 8000 | `tmux ls`; `tmux kill-session -t celda`, o `ss -ltnp | grep 8000` |
| `/health` → `"status":"error"` | La cámara no abrió | `"error"` dice por qué. `v4l2-ctl --list-devices`; prueba otro puerto USB; `LINE_VISION_CAMERA_INDEX=1` si la cámara quedó en otro índice |
| Se ve `/dev/video0` pero no entrega cuadros | Formato o backend | Valores por defecto: `v4l2`, `MJPG`, 640x480. Si la cámara no hace MJPG: `LINE_VISION_CAMERA_FOURCC=YUYV` (**NO VERIFICADO**) |
| El log dice "La cámara de la celda dejó de entregar frames; reintentando." | Cable USB flojo o poca energía | El agente la reabre solo cada 5 s; revisa `vcgencmd get_throttled` |
| `/status` → `state: starting` mucho rato | El primer análisis tarda | Espera 30 s; si sigue, `tail -50 ~/celda.log` |
| Se cierra al cerrar SSH | No estaba en `tmux` | Arráncalo dentro de `tmux` |
| `Killed` / memoria | RAM de la Pi | `free -h`; cierra otros programas; avísame con la RAM de tu Pi |

### 5.8 Ver la celda y mandar la primera pieza (sin cableado)
1. En el navegador de la laptop: `http://<IP-PI>:8000/celda.html` (la página la sirve **la propia Pi**, no la laptop). Pulsa "Iniciar cámara": se ve el video de la celda con el letrero (`SIN PIEZA`, `PIEZA REAL · … · PASS` o `NO ES PIEZA REAL · FAIL`).
2. La página `celda.html` muestra un formulario **"Inicia sesión para ver y mandar la celda"** con **Usuario** y **Contraseña**. Usuario: `admin` (salvo que hayas puesto `CELDA_HMI_USUARIO` en `~/.celda.env`). Contraseña: la `CELDA_HMI_CLAVE` que pusiste en `~/.celda.env` **de la Pi**. Sin sesión, Arranque/Paro dan error 401.
3. Pon una pieza registrada (computadora1, 2 o 3) frente a la cámara. Después de ~5 análisis iguales (≈ 2.5 s + lo que dure cada análisis) sale el juicio.
4. En ese modo (sin GPIO) la pieza se anota como **`pulso_no_enviado`** (PASS) o **`fallo_actuacion`** (FAIL), y la pantalla muestra la alarma **"Enlace PLC perdido"**. **Eso es lo esperado**, no un fallo: `sources.plc` no significa que haya un PLC, solo `¿se abrió el chip GPIO?`.
5. Una pieza dispara una sola vez: hasta ver `SIN PIEZA` no se vuelve a armar. Retira la pieza para probar la siguiente.
6. Confirma que el evento llegó a la laptop:
```
[Laptop · PowerShell]  curl.exe -s "http://localhost:8000/line/cell/events/recent?limit=5"
[Pi 4 · SSH]           curl -s localhost:8000/status
```
Esperado: en la laptop, el evento con `event_id` que empieza por `pi-`; en la Pi, `laptop.sent_total` ≥ 1 y `reachable: true`. Si `last_error` no está vacío: firewall o IP de la laptop.
7. Prueba "la celda opera sola": detén el servidor de la laptop (Ctrl+C). La Pi debe seguir juzgando y la página de la Pi debe seguir funcionando; `laptop.reachable` pasa a `false` y las observaciones quedan en cola local (máx. 1000) hasta que la laptop vuelva.
8. Cierra la sesión con el botón de la HMI o `DELETE /line/cell/session`.

Medidas para anotar (no existen hoy): ms por análisis, CPU % de `python` en `top`, temperatura (`vcgencmd measure_temp`) después de 5 minutos, FPS reales (`python3 ~/aether/scripts/probar_agente.py http://localhost:8000 --segundos 15` funciona con el agente de celda; el objetivo de 30 FPS es del Jetson, el de la Pi es `AETHER_CELL_STREAM_FPS` = 10).

**Fin de la Fase 5.** Si algo de esto falló, no pases a cablear: el software de la celda no está listo.

---

## Fase 6 — Conectar la celda de manufactura a la Pi (la parte con riesgo físico)

> **Hardware real (decisión de Mario, 24 oct):** la Pi enciende **dos relevadores** con GPIO. **GPIO 8** (físico 24) → relevador del **pistón**. **GPIO 9** (físico 21) → relevador cuyo contacto va a la entrada **I4 del LOGO**, que mueve la banda y **ignora su infrarrojo 5 s** al ver I4. El plan con PLC y Modbus (`datasheet-conexion-celda.md`) es documentación vieja. **Qué placa de relevadores, qué LOGO, qué electroválvula y qué fuente son datos que ningún documento confirma: PENDIENTE (P-12, P-14, P-16).** Esta fase no los inventa: tiene campos para llenar y condiciones de parada.
>
> Los números de pin físico (24 y 21) y los pines de tierra son la **regla general** del conector de 40 pines; confírmalos en pinout.xyz con tu modelo antes de cablear.

### Regla general de la fase
Cada etapa termina en **una medida** (voltaje, LED, clic). Si la medida no es la esperada, **detente**, no pases a la siguiente y no "pruebes a ver". No hay paro de emergencia físico documentado (P-16): **no conectes aire ni la electroválvula real hasta tener uno cableado** o una persona con la mano en el corte de energía/aire.

### 6.0 Datos que debes tener antes (llena la sección 9)
Marca/modelo de la placa de relevadores y si es **activa en alto o en bajo**; si tiene optoacoplador; de dónde se alimenta su bobina (5 V de la Pi o fuente aparte); marca y modelo del LOGO y su tensión de entradas (12 o 24 V); tipo y tensión de la electroválvula; presión de aire; quién tiene el corte de emergencia.
**Quienes saben esto: David (electrónica/relevadores/paro), Pedro (pistón), Uriel (Pi–LOGO).**

### 6.1 Estado de los pines al encender (SIN carga conectada)
Con la Pi **apagada y sin nada conectado a los pines**:
1. Encuentra los pines en la Pi: el conector de 40 pines tiene dos filas. Para no equivocarte, usa el diagrama de **pinout.xyz** (en el navegador, con los números **físicos** que usa esta guía) o, en la Pi, el comando `pinout` si está instalado. Ubica **físico 24** (GPIO 8), **físico 21** (GPIO 9) y una tierra (**físico 25**, junto al 24, o **físico 20**, junto al 21).
2. Multímetro: selector en **V con una línea recta** (voltaje de corriente continua, DC), rango de 20 V; el cable **negro** en el borne **COM** y el **rojo** en el borne **VΩ**. Toca con la punta negra la tierra y con la roja el pin; lee el número. Hazlo con cuidado de no tocar dos pines vecinos a la vez.
3. Enciende la Pi. Mide el **físico 24** y luego el **físico 21**: **mientras arranca** (los primeros segundos) y **con el sistema ya iniciado, antes de arrancar el agente**.
4. Regla general (**NO medida en tu Pi**): GPIO 0-8 arrancan en alto por *pull-up*, GPIO 9-27 en bajo. Esperado: GPIO 8 ≈ 3.3 V y GPIO 9 ≈ 0 V.
5. Anota ambas medidas en la sección 9.

Mide también con el **agente andando y sin `gpiod`** (Fase 5): ahí el programa no toca ningún pin, así que deben seguir igual que en el punto 1.

### 6.2 La lógica de la placa (decide cómo se configura)
`cell_line.py` tiene ahora la variable **`LINE_RELES_ACTIVO_BAJO`** (corregido el 25 de oct; probado con un `gpiod` falso, **NO probado en la Pi**):
- **Placa activa en alto** (el relevador enciende con el pin en alto): déjala sin definir (o `0`).
- **Placa activa en bajo** (muy comunes y baratas; enciende con el pin en bajo): pon `LINE_RELES_ACTIVO_BAJO=1` en `~/.celda.env`. Así el programa deja el pin en alto cuando "apaga" y lo baja solo durante el pulso. Sin esta variable, una placa activa en bajo quedaría **encendida siempre** y se apagaría en cada pulso.
- Cómo saber cuál es: **la ficha de la placa**, o con el LED/multímetro del 6.4 viendo si el relevador hace clic con el pin en alto o en bajo. Si no sabes, no conectes el pistón.

**Lo que el código NO puede arreglar** (es del chip, regla general, no medida en tu Pi): GPIO 8 arranca **en alto** por *pull-up* entre que se enciende la Pi y se inicia el programa, y al cerrar el agente el kernel suelta los pines a ese mismo estado. Con una placa **activa en alto** eso enciende el relevador del pistón al encender la Pi o al cerrar el agente. Con una placa **activa en bajo** es al revés: el pull-up de GPIO 8 ya lo deja apagado, que es lo seguro, pero GPIO 9 (arranca en bajo) la encendería. Las salidas: mídelas en 6.1 y 6.4 (incluido "después de parar el agente"); si alguna enciende sola, se resuelve en hardware con David (resistencia que mantenga la entrada de la placa en el estado apagado) o cambiando de pin con `LINE_GPIO_PISTON` / `LINE_GPIO_BANDA`.

**Si el relevador del pistón enciende solo al arrancar o al cerrar y no hay solución de hardware: STOP.** No conectes el pistón.

### 6.3 Instalar `gpiod` (solo ahora, y solo si 6.1 y 6.2 están resueltos)
```
[Pi 4 · SSH]  tmux kill-session -t celda          # detén el agente
[Pi 4 · SSH]  sudo apt install -y python3-libgpiod
[Pi 4 · SSH]  sudo usermod -aG gpio $USER && exit  # cierra sesión y vuelve a entrar para que cuente el grupo
[Pi 4 · SSH]  groups | tr ' ' '\n' | grep -x gpio && ls -l /dev/gpiochip0
[Pi 4 · SSH]  ~/celda-venv/bin/python -c "import gpiod; print('gpiod ok', getattr(gpiod,'__version__','v1'))"
```
- Esperado: `gpio` en tus grupos, `/dev/gpiochip0` existe y `gpiod ok`. Bookworm trae `libgpiod` 1.x; `cell_line.py` soporta la API de las dos versiones (**VERIFICADO leyendo el código; NO VERIFICADO en la Pi**).
- Solo la Pi 4: el chip es `gpiochip0`. En el **Jetson nunca** se instala `gpiod` (otras líneas del SoC; el script del Jetson se niega).
- `Permission denied` al abrir: falta el grupo `gpio` o no cerraste sesión.
- Un `gpiod ok` **sin** carga conectada todavía no mueve nada: el agente solo mueve pines cuando decide una pieza.

### 6.4 LED primero (sin relevador, sin carga)
1. Pi apagada. LED + resistencia de 330 Ω a 1 kΩ entre **físico 24 (GPIO 8)** y tierra; otro igual entre **físico 21 (GPIO 9)** y tierra. (Polaridad: pata larga del LED hacia el pin.)
2. Enciende la Pi **sin arrancar el agente**: anota qué LED prende. **El LED del pistón NO debe prender fijo y el de la banda tampoco** al encender. Si prende el de GPIO 8 (pull-up): es lo del 6.2; resuélvelo antes de seguir.
3. Arranca el agente (5.7, ahora con `gpiod`). El log debe cambiar a **`GPIO abiertos`** en vez de `sin GPIO`. Con eso, `sources.plc` = `true` y la alarma de "Enlace PLC perdido" desaparece. Ambos LED deben estar **apagados**.
4. Pon una pieza **falsa** (algo que no sea computadora1/2/3) frente a la cámara. Tras ~5 análisis iguales: espera **3 s**, el LED del pistón se enciende **1 s**, se apaga, espera **2 s**, el LED de la banda se enciende **0.5 s**. Anota los tiempos con cronómetro (los de `LINE_PISTON_*` y `LINE_BANDA_ON_S` son de diseño, no medidos).
5. Con una pieza **real**: solo el LED de la banda, 0.5 s, al terminar el análisis.
6. **Paro:** en la HMI, pulsa Paro con un ciclo en curso: ambos LED deben apagarse al instante (`set_running(False)` aborta y apaga).
7. **Después de parar el agente** (`tmux kill-session -t celda`): mide qué hacen los LED. Si el de GPIO 8 se enciende, es el problema del 6.2 al cerrar. Anótalo.
8. Alarma "visión en FAIL y el pistón no disparó": debe aparecer solo si el FAIL ocurre y el pistón no actúa; no debe aparecer en el paso 4.

Condición para seguir: todo lo anterior ocurre en el orden y los tiempos esperados y ningún LED prende "solo".

### 6.5 Placa de relevadores, sin carga
1. Pi apagada. Alimenta la **placa** como indique su ficha (VCC/GND de la placa; el 5 V de la Pi solo si la placa y la corriente de su bobina lo permiten: dato de David). Conecta **IN1 ← físico 24 (GPIO 8)** y **IN2 ← físico 21 (GPIO 9)** (el orden IN1/IN2 es una suposición: **confirma con tu placa**). Une el GND de la placa con una tierra de la Pi.
2. Enciende la Pi, sin agente: **ningún relevador debe hacer clic**. Si hace clic: es la lógica de 6.2; para y resuélvelo.
3. Arranca el agente y repite la pieza falsa del 6.4: se oye un clic del relevador 1 (1 s), otro del relevador 2 (0.5 s).
4. Con el multímetro en **continuidad**, sin tensión en los contactos, comprueba que el contacto (COM-NO) cierra solo durante el pulso.

### 6.6 LOGO (banda): contacto a I4, sin pistón
**Datos que faltan (P-12):** modelo del LOGO y su tensión de entradas; y a qué lado va el contacto. El esquema habitual de un LOGO! de CC es: el relevador actúa como **interruptor seco** entre el positivo de la alimentación del LOGO y su entrada **I4**; al cerrarse, I4 ve su tensión nominal. Confírmalo con Uriel/David y con la ficha del modelo antes de cablear.
1. LOGO energizado por su fuente, **banda sin carga** y sin pieza.
2. Contacto del relevador 2 (COM-NO) entre el positivo de la fuente del LOGO y **I4**; tierras del LOGO y de la Pi **no se unen** si la placa tiene optoacoplador (el contacto ya aísla).
3. Con una pieza real: el LED de I4 del LOGO se enciende 0.5 s; la banda avanza; el LOGO ignora su infrarrojo 5 s.
4. Calibra `LINE_BANDA_ON_S` (0.5 s por defecto) hasta que el avance sea el deseado, sin que el LOGO cuente dos veces la misma pieza.

### 6.7 Pistón: primero sin aire, luego con aire bajo y sin pieza
Solo con paro de emergencia físico listo (P-16) y con Pedro presente (P-14).
1. **Electroválvula con su diodo de protección** (*flyback*) en paralelo con la bobina si es de CC. Contacto del relevador 1 en serie con la bobina y su fuente. Sin aire conectado.
2. Pieza falsa: debe oírse el clic de la válvula 1 s. Mide la tensión en la bobina durante el pulso (la de su etiqueta).
3. **Aire a presión baja, sin pieza** en la banda: el émbolo sale 1 s y regresa. Ajusta `LINE_PISTON_ON_S` y `LINE_PISTON_REGRESO_S` hasta que salga y vuelva completo.
4. Ahora con pieza real falsa (ECU que no es computadora1/2/3): el pistón debe sacarla de la banda. Cronometra desde que la pieza pasa frente a la cámara hasta que llega frente al pistón y ajusta `LINE_PISTON_ESPERA_S` (3 s de diseño).
5. Con pieza registrada (PASS): el pistón **no** debe moverse.
6. Prueba de fallo: desconecta el cable de red de la Pi (la laptop se cae): la celda debe seguir juzgando y actuando. Desconecta la cámara: el estado pasa a `DETENIDA` ("Cámara apagada") y no actúa.

Los valores calibrados van a `~/.celda.env` (por ejemplo `LINE_PISTON_ESPERA_S=…`, `LINE_PISTON_ON_S=…`, `LINE_PISTON_REGRESO_S=…`, `LINE_BANDA_ON_S=…`); reinicia el agente para que los lea.

### 6.8 Lo que NO es esta celda (para no decirlo mal ante nadie)
- **PASS no significa "sin defectos"**: significa "es una de las 3 piezas registradas". No hay inspección de calidad (P-24).
- El **modelo** tiene mAP50 0.995 sobre un dataset diminuto (19 fotos); el FAIL real con objetos que no son pieza **no está medido**.
- El **Paro** de la pantalla no es un paro de emergencia.
- Los pines GPIO 8/9 son BCM de la Pi 4; no se trasladan al Jetson.

---

## Fase 7 — Operación diaria, salida y vuelta atrás

### Arranque de cada día (en este orden)
1. `[Laptop · PowerShell]  .\iniciar_aether.ps1 -SoloComprobar` y luego `.\iniciar_aether.ps1` (`-SinVoz` si no usas micrófono). Se puede añadir `-Jetson -JetsonHost mario@<IP-JETSON>` para que arranque también el agente del Jetson por SSH. **No uses el alias `jetson-uni`**: su valor por defecto en el script apunta a una IP vieja (10.4.7.105) de `~/.ssh/config`; pasa siempre el host con `-JetsonHost`.
2. `[Jetson · SSH]  bash ~/aether/scripts/jetson/iniciar-agente.sh` (si no usaste `-Jetson`).
3. `[Pi 4 · SSH]  tmux attach -t celda` (o créala como en 5.7).
4. Audio: `[Jetson · VNC]  pactl set-default-sink alsa_output.platform-3510000.hda.hdmi-stereo` (se pierde al reiniciar). Ver: `[Jetson · VNC]  bash ~/aether/scripts/ver-aether.sh robot.html`; celda: `http://<IP-PI>:8000/celda.html`.

### Apagar
1. `[Pi 4 · tmux]  Ctrl+C` (apaga relevadores) y `tmux kill-session -t celda`. Verifica con la mano/multímetro que nada quedó energizado **antes** de cortar el aire.
2. `[Jetson · SSH]  bash ~/aether/scripts/jetson/detener-agente.sh`.
3. Laptop: `Ctrl+C` en el servidor (y `q` en la ventana de voz).
4. Pi: `sudo shutdown -h now` y espera a que apague el LED verde antes de quitar la fuente.

### Volver al estado anterior
- **Jetson, solo desactivar el modelo de piezas** (volver al comportamiento del viernes sin cambiar de rama): pon `AETHER_PIECES=0` en `~/.aether-agent.env` y reinicia el agente.
- **Jetson, volver al código viejo:** `bash ~/aether/scripts/jetson/detener-agente.sh && cd ~/aether && git checkout jetson-setup`.
- **Laptop:** Ctrl+C; en `backend\.env` borra o comenta con `#` `AETHER_PERCEPTION_AGENT_URL`; `git checkout jetson-setup`. Arranque manual de siempre: `cd backend; .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000`. En `jetson-setup` la celda vuelve a usar `admin/admin` (el código viejo).
- **Pi, volver a modo seguro (sin GPIO):** `sudo apt remove python3-libgpiod` y reinicia el agente: vuelve a "sin GPIO: los pulsos NO se envían".

---

## 8. Redes (si algo no conecta)

| Situación | Direcciones conocidas |
|---|---|
| WiFi "Mecatronica" | laptop `10.4.5.52`, Jetson `10.4.5.103` (funcionó con regla de firewall Privado) |
| Cable en la universidad | el Jetson cae en `10.4.7.x` (otra subred): no se ven; usa el WiFi o el USB-C |
| USB-C (RNDIS) | laptop `192.168.55.100`, Jetson `192.168.55.1` (respaldo fiable) |
| Casa | `192.168.100.x` (laptop `.14`, Jetson `.19`) |
| **Pi 4** | **ninguna conocida: anótala en la sección 9** |

Los tres equipos tienen que estar en la **misma red** (misma subred; `AETHER_LAN_CIDRS` por defecto acepta cualquier rango privado). Diagnóstico en orden: `.\iniciar_aether.ps1 -SoloComprobar` → `curl -s -m 3 http://<IP-LAPTOP>:8000/health` (desde Jetson y Pi) → `curl -s -m 3 http://localhost:8001/health` (Jetson) → `curl -s localhost:8000/health` (Pi). Cuidado: los nombres `.local` dependen de mDNS y la red de la universidad los bloquea; **usa IP**. Mantén el WiFi del Jetson apagado si usas cable (`nmcli radio wifi off`): con los dos hubo cortes de SSH sin causa diagnosticada.

### Tabla rápida de errores transversales
| Síntoma | Primera cosa que revisar |
|---|---|
| `403 Solo red local` | La IP que consulta no está en `AETHER_LAN_CIDRS`; la guía de redes |
| `401 hace falta iniciar sesión` al pulsar Arranque/Paro | Iniciar sesión en la HMI; ¿existe `CELDA_HMI_CLAVE` en el entorno de **esa** máquina? |
| Cambié el `.env` y no pasa nada | Reinicia: laptop (`backend\.env`), Jetson (`~/.aether-agent.env`) y Pi (`~/.celda.env`) solo se leen al arrancar |
| Video en blanco en la laptop o el Jetson | CSP: Ctrl+F5; luego F12 → Consola |
| La Pi dice "Cámara apagada" | Pasaron 2 s sin análisis: `LINE_ANALISIS_CADA_S` demasiado alto para lo que tarda el modelo, o la cámara se cayó |
| Mucha CPU en la Pi | Sube `LINE_ANALISIS_CADA_S` a `1.0` o baja `AETHER_CELL_STREAM_FPS`; deja `LINE_CV_THREADS=3` |

---

## 9. Datos que debes llenar durante el día (PENDIENTES)

| Dato | Valor |
|---|---|
| IP de la laptop / Jetson / Pi hoy | |
| Usuario de la Pi | |
| Versión de Python / OpenCV / RAM / modelo de cámara en la Pi (P-18) | |
| `ms` por análisis ONNX en la Pi (5.6) | |
| CPU % y temperatura de la Pi tras 5 min (5.7) | |
| GPIO 8 y GPIO 9 al encender, medidos (6.1) | |
| Placa de relevadores: marca, activa en alto/bajo, alimentación de la bobina (P-12) | |
| LOGO: modelo y tensión de entradas (P-12) | |
| Electroválvula: tipo, tensión, presión (P-14) | |
| Paro de emergencia físico y quién lo tiene (P-16) | |
| Tiempos calibrados: espera, pistón, regreso, banda (P-14/P-15) | |
| FPS del Jetson hoy (cámara / entrega / ms), con `parts.pt` + YOLO general | |
| ¿Se reconoce cada pieza girándola 360° frente a la cámara del Jetson? Ángulos que fallan | |
| Fotos en el dataset por clase, antes y después de ampliarlo | |
