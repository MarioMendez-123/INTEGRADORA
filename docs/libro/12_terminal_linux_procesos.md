# Capítulo 12: La terminal, Linux y los procesos

*Qué ventana es cuál, cómo se mantiene vivo un programa cuando se corta la conexión, qué son las variables de entorno y por qué hay cosas que el equipo se prohíbe hacer en el Jetson.*

## Tres ventanas, tres idiomas

Aether se opera desde tres tipos de ventana de texto, y confundirlas es la fuente de errores más común:

| Ventana | Sistema | Dónde se usa | Ejemplo |
|---|---|---|---|
| **PowerShell** | Windows | La laptop | `.\iniciar_aether.ps1` |
| **Git Bash** | Windows (imita a Linux) | La laptop, para comandos de Linux o de Git | `ls`, `git status` |
| **Bash** (terminal de Linux) | Ubuntu o Raspberry Pi OS | El Jetson y la Pi, normalmente por **SSH** | `bash ~/aether/scripts/jetson/iniciar-agente.sh` |

Una **terminal** (o **consola**) es una ventana donde se escriben comandos y se leen respuestas, sin ratón. Una **shell** es el intérprete que entiende esos comandos (PowerShell y Bash son dos shells distintas). Por eso, en este libro, cada comando lleva su etiqueta de máquina y ventana: un comando de Bash pegado en PowerShell no hace lo mismo. Las diferencias de sintaxis que ya causaron tropiezos en el proyecto: PowerShell usa `$env:NOMBRE = "valor"` para una variable, Bash usa `export NOMBRE=valor`; las rutas de Windows llevan `\` y las de Linux `/`; y los guiones de PowerShell (`.ps1`) exigen `.\` para ejecutarlos desde la carpeta actual.

## Moverse y mirar: cinco comandos que bastan

En Bash casi todo lo cotidiano se resuelve con cinco comandos:

```bash
pwd                       # ¿en qué carpeta estoy?
ls -la                    # qué hay aquí (con archivos ocultos)
cd ~/aether/backend       # entrar a una carpeta (~ es la carpeta personal)
cat archivo.txt           # mostrar un archivo
tail -n 20 ~/aether-agente.log   # las últimas 20 líneas de un registro
```

Estos tres suman: `grep texto archivo` (buscar texto), `curl URL` (pedir una página, como un navegador sin pantalla) y `top` (qué procesos gastan CPU).

## Qué es un proceso y por qué "prendido" no es una luz

Un **programa** es un archivo; un **proceso** es ese programa **corriendo** en este instante, con su memoria y su identificador numérico (**PID**). "El servidor está prendido" quiere decir "existe un proceso del servidor". Esto explica síntomas de Aether:

- **"Connection refused" al `curl`**: no hay ningún proceso escuchando en ese puerto.
- **Spotify avisó que el puerto 8888 estaba ocupado** (bitácora del Jetson, sesión 5): había otro `uvicorn` vivo de una prueba anterior. Dos procesos no pueden escuchar en el mismo puerto.
- **El primer intento de arrancar el servidor falló con "No module named 'sqlalchemy'"**: se usó el Python del sistema en lugar del Python del **entorno virtual** del proyecto (`backend/.venv`), que es el que tiene instaladas las librerías (capítulo 13).

Para ver y terminar procesos, `[Jetson · SSH]`: `ps aux | grep uvicorn` los lista; `kill <PID>` pide que uno termine.

## Sobrevivir a una ventana cerrada: tmux

Un programa que se inicia en una ventana de SSH **muere cuando la ventana se cierra** (o la conexión se corta). Para el Jetson y la Pi eso es inaceptable: el agente debe seguir vivo. La solución es **`tmux`**, un "multiplexor de terminales": crea una **sesión** de terminal que vive en el equipo, independiente de la conexión. Los tres comandos del proyecto, `[Jetson · SSH]`:

```bash
tmux new -s trabajo            # crear una sesión llamada "trabajo"
# (soltarla sin detener nada: Ctrl+B y luego D)
tmux attach -t trabajo         # volver a ella
tmux ls                        # listar sesiones
```

El script `iniciar-agente.sh` ya lo hace por su cuenta: crea una sesión llamada **`agente`**, arranca el agente adentro y, si ya existía, dice "El agente ya corre" y no hace nada (se puede repetir sin miedo).

## El sistema operativo y su carpeta de servicios

En Linux, los programas que deben estar siempre corriendo suelen registrarse como **servicios** de **systemd** (el gestor que arranca y vigila servicios, y los reinicia si se caen). El equipo **decidió no usar systemd todavía**: la ADR 0012 lo descarta "por ahora" porque *añade otra pieza que mantener* y `tmux` ya es el procedimiento; se anota como posible mejora cuando el agente resulte estable, y para la celda (que debe operarse sola) se reconsidera (**PENDIENTE (P-25)**, capítulo 8).

## Variables de entorno y el archivo .env

Una **variable de entorno** es un nombre con un valor que el sistema entrega a cada programa que arranca: sirve para **configurar sin tocar el código**. Aether se configura casi todo así (capítulo 13). Dos formas de definirlas:

- **Archivo `.env`** en `backend/` (en la laptop): se carga solo al arrancar y **nunca se sube a Git** (está en `.gitignore`). Ahí van, por ejemplo, las claves y las direcciones de los agentes.
- **Archivo `~/.aether-agent.env`** en el Jetson: se copia de una plantilla (`scripts/jetson/aether-agent.env.example`) y se edita. Su plantilla lo advierte: *"NO pongas secretos aquí"*.

Hay una regla de higiene que aparece en la guía del Jetson: **un valor mal escrito debe detener el programa al arrancar con un mensaje que nombre la variable** (`backend/settings.py`), en lugar de fallar misteriosamente más tarde.

## Scripts: comandos guardados en un archivo

Un **script** es un archivo con una lista de comandos. Aether tiene tres para arrancar, cada uno para su máquina:

| Script | Máquina | Qué hace |
|---|---|---|
| `iniciar_aether.ps1` | Laptop | Comprueba entorno, clave de la celda (sin mostrarla), puerto libre, perfil de red, firewall y voz; imprime las IP; arranca el servidor |
| `scripts/jetson/iniciar-agente.sh` | Jetson | Comprueba `tmux`, el entorno virtual, la cámara, que `gpiod` **no** esté y la configuración; arranca el agente en una sesión `tmux` |
| `scripts/ver-aether.sh` | Jetson (en el escritorio por VNC) | Abre Firefox en la primera laptop que responda de una lista de IP |

Sus principios son notables: **no instalan nada, no usan `sudo`, no abren puertos ni cambian el firewall**; si algo falta, dicen **qué** y **con qué comando** arreglarlo. `iniciar_aether.ps1` está escrito en **ASCII a propósito**: PowerShell 5.1 lee mal los acentos de un archivo sin marca de orden de bytes (BOM).

## Lo que se pierde al reiniciar el Jetson

Al apagar y encender el Jetson desaparecen las sesiones de `tmux`, así que **hay que volver a arrancar el agente** con `iniciar-agente.sh`. Lo que **sí persiste**: los archivos (`~/.aether-agent.env`, el repositorio en `~/aether`, los entornos virtuales), la regla de que `suspend`, `sleep` e `hibernate` quedaron enmascarados (el equipo lo configuró; el comando exacto **no se registró**) y las librerías instaladas (por ejemplo `libcusparseLt`). Qué más sobrevive al reinicio (por ejemplo el modo de energía de `nvpmodel` o el WiFi apagado con `nmcli radio wifi off`) **no está comprobado**: la bitácora no registra una prueba de reinicio, así que conviene volver a verificarlo con `sudo nvpmodel -q` después de cada encendido.

## Prohibiciones: lo que el equipo se impide en el Jetson

La sección "Precauciones" de `COMANDOS_LINUX.md` es una lista de cosas que **no** se hacen y por qué. Vale la pena leerla como ejemplo de disciplina:

- **No instalar `gpiod` de Python** (capítulo 9): los números de pin son de Raspberry Pi.
- **No correr `sudo apt upgrade`:** un hilo del foro de NVIDIA reporta errores de memoria CUDA tras actualizar en esa versión; no está comprobado en este equipo, pero el costo de equivocarse es alto. Antes de cualquier `sudo`, se simula con `-s`.
- **No tocar `snapd` ni usar `--no-sandbox`** en los navegadores.
- **No instalar `opencv-python` por pip** y mantener `numpy<2`.
- **Guardar salidas importantes** con `| tee ~/archivo.txt`.
- **Repositorio público:** nunca subir `.env`, tokens, `aether.db`, pesos de modelos (`.pt`, `.engine`), fotos del dataset, contactos ni llaves; revisar `git diff --stat` antes de cada `push`.

## Por qué las plantas no arrancan nada a mano

En una planta, nadie escribe comandos para encender un servicio: el sistema operativo arranca los servicios solo y un **supervisor** los reinicia si fallan; hay **monitoreo** que avisa si una máquina deja de responder, y los cambios pasan por un procedimiento controlado. El camino de Aether (scripts + `tmux`) es el mínimo útil para un prototipo, con la ventaja de ser explicable en una tarde; el salto a systemd, contenedores y monitoreo es la evolución natural (capítulo 26).

## Preguntas de repaso: terminal y procesos

1. ¿Qué diferencia hay entre un programa y un proceso, y qué dice `Connection refused` sobre eso?
2. ¿Por qué un programa lanzado por SSH muere si se cierra la ventana y cómo lo evita `tmux`?
3. ¿Qué se pierde, y qué se conserva, al reiniciar el Jetson?
4. ¿Por qué `backend/.env` nunca se sube a Git?
5. Dos comandos que el equipo se prohíbe en el Jetson y la razón de cada uno.
6. ¿Para qué sirve que `iniciar-agente.sh` se pueda repetir sin miedo?
