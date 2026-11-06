# Capítulo 10: Redes desde cero

*Direcciones IP, puertos, nombres, firewall y SSH: lo que hay que entender para que tres computadoras se hablen y para saber dónde buscar cuando no lo hacen.*

## Un timeout que parecía un misterio

El 21 de octubre de 2026, desde el Jetson, el primer intento de saludar al servidor de la laptop (`curl http://192.168.100.14:8000/health`) terminó en **timeout**: esperó y nadie contestó. Había tres sospechosos clásicos (el firewall de Windows, una subred distinta, una dirección equivocada), pero la causa resultó simple: **el servidor no estaba corriendo en la laptop**. Al arrancarlo, el mismo comando devolvió `{"status":"ok"}`. La lección es general: **una computadora no tiene "un" lugar fijo; tiene la dirección que la red le presta**, y antes de culpar a la red conviene comprobar que el otro extremo realmente escucha.

La bitácora de hardware del equipo guarda las direcciones de los días de trabajo, y sirven como ejemplo real:

| Situación | Laptop | Jetson | Observación (bitácora) |
|---|---|---|---|
| WiFi de la universidad (misma subred privada) | dirección privada | dirección privada | Funcionó con una regla de firewall |
| Cable de red en la universidad | — | cae en **otra subred** privada | Laptop y Jetson **no se ven**; se usa el WiFi o el USB-C |
| Cable USB-C entre laptop y Jetson (RNDIS) | `192.168.55.100` | `192.168.55.1` | Respaldo confiable; ocupa el cable |
| Casa | `192.168.100.14` (WiFi) | `192.168.100.19` (cable) | Funcionó sin regla nueva |

(Las direcciones exactas de la red de la universidad **no se publican en este libro**: el equipo decidió sacarlas del repositorio y guardarlas en un archivo local del Jetson. Las de la casa y del cable USB-C sí están documentadas por decisión del equipo; son direcciones privadas, no accesibles desde internet.)

## La IP: la dirección de la casa

Una **IP** (*Internet Protocol*, "protocolo de internet") es la **dirección de una computadora en una red**, escrita como cuatro números entre 0 y 255 separados por puntos (`192.168.100.14`). Existen rangos reservados para redes **privadas** (las de una casa, una oficina o un laboratorio) que no son alcanzables desde internet: `10.x.x.x`, `172.16–31.x.x` y `192.168.x.x`. Todas las direcciones del cuadro anterior son privadas.

Una **subred** es un grupo de direcciones que "se ven" directamente. Se describe con una **máscara** o con la notación **CIDR**: `192.168.100.0/24` significa "las direcciones que empiezan con `192.168.100.` (256 posibles)". Dos computadoras en subredes distintas **no se ven sin un enrutador que las conecte**. Es exactamente lo que le pasó al Jetson por cable en la universidad: cayó en otra subred y quedó "al otro lado de la pared".

Aether usa esta idea de forma explícita en su seguridad: `backend/lan_guard.py` acepta peticiones de los agentes y de la voz **solo desde la red local**, definida por la variable `AETHER_LAN_CIDRS` (por defecto, los rangos privados y la propia máquina).

## El puerto: la puerta dentro de la casa

Una computadora ejecuta muchos programas a la vez y todos usan la misma dirección. Para saber a quién se dirige un mensaje existe el **puerto**: un número del 0 al 65535, como el número de departamento dentro de un edificio. Un programa que "escucha" en un puerto es un **servidor**; quien se conecta a él es el **cliente**.

Los puertos de Aether (**VERIFICADO** en `docs/guia_arranque.md` y en el código):

| Puerto | Equipo | Qué escucha |
|---|---|---|
| **8000** | Laptop | El servidor central de Aether (panel, API, Lumina) |
| **8000** | Raspberry Pi 4 | El agente de la celda (`celda.html`) |
| **8001** | Jetson | El agente de percepción |
| **11434** | Laptop | Ollama, el modelo de lenguaje local de Lumina |
| **5055** | Laptop | El reproductor del video de presentación (`npm run show`) |
| **8888** | Laptop (solo `127.0.0.1`) | La devolución de llamada (*callback*) de Spotify |

Una dirección completa se escribe `http://192.168.100.14:8000`: protocolo, IP y puerto.

## localhost: hablar consigo mismo

La dirección `127.0.0.1` (o el nombre `localhost`) significa "esta misma computadora". Un programa que escucha en `127.0.0.1` **solo acepta conexiones de su propia máquina**; uno que escucha en `0.0.0.0` acepta conexiones de **cualquier** interfaz de red. La diferencia es de seguridad: el agente del Jetson y el de la Pi escuchan en `0.0.0.0` (para que la laptop los alcance) y por eso llevan un guardia de red local; el callback de Spotify solo en `127.0.0.1` porque nadie más debe usarlo.

Este truco tiene un uso fino en Aether: cuando la página se abre en el mismo Jetson, el servidor le entrega la dirección del video como `127.0.0.1:8001`, para que el video **no salga** de ese equipo (capítulo 1).

## Nombres en lugar de números: DNS y mDNS

Memorizar `192.168.100.19` es incómodo; por eso existen los **nombres**. El **DNS** (*Domain Name System*) es el directorio telefónico de internet: traduce `aethermx.online` a una IP. En una red local pequeña se usa **mDNS** (*multicast DNS*): cada equipo anuncia su propio nombre terminado en `.local` (como `mario-desktop.local`) a toda la red por **multidifusión**, sin servidor central.

Aether admite nombres de host en las variables de dirección (`AETHER_PERCEPTION_AGENT_URL=http://mario-desktop.local:8001`), pero con una advertencia que el propio proyecto vivió: **muchas redes de universidad bloquean mDNS** y, de hecho, ya hubo cortes con `.local`. La documentación lo dice sin rodeos: *"que el nombre se resuelva depende de la red y no está verificado"*. La regla práctica: **se prueba primero**, `[Laptop · PowerShell]`:

```powershell
[System.Net.Dns]::GetHostAddresses('mario-desktop.local')
```

Si responde "No such host is known", se usa la IP. Un detalle de implementación: el servidor recuerda 60 segundos lo que resuelve un nombre (también si falló) para no hacer esperar a cada petición.

## TCP: una llamada que no se corta sin avisar

El protocolo que casi todo Aether usa para hablar es **TCP** (*Transmission Control Protocol*): establece una "llamada" entre dos programas, numera los mensajes, reenvía los que se pierden y avisa si la llamada se cortó. Sobre TCP viajan **HTTP** (la web; capítulo 11) y **SSH** (la terminal remota). Su hermano **UDP** manda mensajes sin llamada ni confirmación; es más rápido y menos fiable. Aether no usa UDP de forma explícita.

## El firewall: el portero de Windows

El **firewall** (cortafuegos) es el portero de cada computadora: decide qué conexiones entrantes deja pasar. El de Windows, por defecto, **no deja entrar** conexiones desde otras máquinas al puerto 8000. Por eso, la primera vez que el Jetson quiso hablar con el servidor de la laptop, falló por **timeout** (esperó y nadie contestó).

La solución del proyecto es **una regla mínima y segura**: abrir el puerto 8000 **solo** para la subred local y **solo** cuando la red está marcada como **Privada** (Windows distingue redes Privadas de Públicas, y no conviene abrir nada en una pública). El comando, `[Laptop · PowerShell, como administrador]`:

```powershell
New-NetFirewallRule -DisplayName "Aether 8000 (red local)" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private -RemoteAddress LocalSubnet
```

Si la red aparece como **Pública**, se cambia: `Set-NetConnectionProfile -InterfaceAlias "<alias>" -NetworkCategory Private` (el alias sale de `Get-NetConnectionProfile`). El script `iniciar_aether.ps1 -SoloComprobar` revisa si falta la regla. **La regla de firewall en Privado no se ha comprobado de punta a punta** con el Jetson después del cambio de red: **NO VERIFICADO**.

## SSH: manejar el Jetson desde la laptop

**SSH** (*Secure Shell*) abre una **terminal remota cifrada**: se escribe en la laptop y los comandos corren en el Jetson. Es la herramienta diaria con el Jetson y la Pi. Ejemplo (`<usuario>` y la IP o nombre son los de ese equipo), `[Laptop · PowerShell]`:

```powershell
ssh mario@192.168.100.19
```

Tres lecciones reales de la bitácora:

1. **Dos interfaces en la misma red rompen SSH.** Con WiFi y cable activos a la vez, el Jetson tenía dos IP (`.18` y `.19`) y las sesiones se cortaban con `Connection reset`; se apagó el WiFi (`nmcli radio wifi off`). La causa exacta no está diagnosticada (**P-26**).
2. **Un corte de SSH mata lo que corría dentro.** Por eso lo largo se ejecuta dentro de **`tmux`** (capítulo 12).
3. **SSH sin contraseña** (con llaves y un archivo `~/.ssh/config`) quedó pendiente (**P-26**). El script `iniciar_aether.ps1 -Jetson` ya lo da por hecho, con un nombre de host `jetson-uni`.

Y una limitación de **VNC** (un escritorio remoto): la sesión de VNC del Jetson no copia ni pega bien ni detecta las mayúsculas, por eso los comandos se mandan por SSH y VNC solo sirve para *mirar* el escritorio.

## Cuatro preguntas para ubicar cualquier falla de red

El equipo documentó un orden de diagnóstico, de lo más cercano a lo más lejano. Funciona para casi cualquier "no conecta":

1. **¿Corre el servidor?** `[Laptop · PowerShell]`: `.\iniciar_aether.ps1 -SoloComprobar` (revisa entorno, clave de la celda, puerto, perfil de red y firewall sin arrancar nada).
2. **¿Se ve desde otra máquina?** `[Jetson · SSH]`: `curl -s -m 3 http://<IP laptop>:8000/health`. Debe responder `{"status":"ok"}`. Si da *timeout*: firewall, subred o el servidor no corre.
3. **¿Corre el agente local?** `[Jetson · SSH]`: `curl -s -m 3 http://localhost:8001/health`.
4. **¿Qué mide el agente?** `[Jetson · SSH]`: `python3 ~/aether/scripts/probar_agente.py http://localhost:8001 --segundos 15`.

**Síntomas típicos y qué significan:**

| Síntoma | Causa más probable |
|---|---|
| `timeout` al `curl` hacia la laptop | Firewall o subred distinta |
| `Connection refused` | La máquina responde pero **nadie escucha** en ese puerto: el servidor no está corriendo |
| `No such host is known` | El nombre `.local` no se resuelve: usar la IP |
| Funciona unos minutos y se corta | Suspensión de la laptop o dos IP en el Jetson |

Una causa que parece de red y no lo es: **Windows suspende la red o la laptop**. La guía pide configurar *Energía → Nunca suspender cuando esté conectado*; si la laptop se duerme, el Jetson pierde al servidor.

## Una red en una empresa con cientos de equipos

En una planta real, las redes se segmentan en **VLAN** (redes virtuales separadas por un conmutador): una para oficinas, otra para las máquinas, otra para las cámaras. Las IP se asignan de forma fija o por reservas del servidor **DHCP**, y la seguridad usa **firewalls de planta** y listas de dispositivos permitidos. El principio que Aether ya aplica en pequeño es el mismo: **mínimos permisos, red local separada, nada de abrir puertos "para probar".**

## Preguntas de repaso: la red del laboratorio

1. ¿Por qué el Jetson por cable y la laptop por WiFi no se veían en la universidad pero sí en la casa?
2. ¿Qué diferencia hay entre escuchar en `127.0.0.1` y en `0.0.0.0`?
3. ¿Por qué `curl` da `timeout` en un caso y `Connection refused` en otro, y qué dice cada uno?
4. ¿Qué hace la regla de firewall del proyecto y por qué es "Privado" y no "Público"?
5. ¿Para qué se usa `tmux` junto con SSH?
6. ¿Por qué un nombre `.local` puede fallar en una red de universidad?
