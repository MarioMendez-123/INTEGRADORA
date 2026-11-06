# Capítulo 25: Manual para cuando todo falla

*Un método de diagnóstico y un catálogo de síntomas reales de Aether, ordenados por tipo, con la causa que tuvo cada uno y qué hacer.*

## Un método antes que una lista

Casi todas las fallas del proyecto se resolvieron con el mismo hábito, que conviene aprender antes de memorizar síntomas: **partir el problema en capas y probar cada capa por separado.** El video no aparece en la página: ¿falla la **cámara**? ¿el **agente**? ¿la **red**? ¿el **navegador**? Cada pregunta tiene un comando que la responde (capítulos 10, 11 y 16). Dos reglas más:

1. **Copiar el mensaje exacto.** *"Connection refused"*, *"timeout"* y *"No such host"* son tres fallas distintas con tres causas distintas.
2. **Cambiar una sola cosa por vez** y volver a probar. Con dos cambios a la vez, no se sabe cuál arregló o rompió.

## Fallas de arranque y de configuración

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| El servidor se detiene al arrancar con un mensaje que nombra una variable (por ejemplo `AETHER_DETECT_MAX_HZ debe ser a lo más 120`) | Variable de entorno mal escrita; es **a propósito** (capítulo 13) | Corregirla en `backend/.env` y arrancar de nuevo |
| `No module named 'sqlalchemy'` al arrancar | Se usó el Python del sistema, no el del entorno virtual | Usar `backend\.venv\Scripts\python.exe` (`[Laptop · PowerShell]`) |
| `Address already in use` / puerto 8000 u 8888 ocupado | Hay otro proceso del servidor vivo | Cerrarlo (`[Jetson · SSH]`: `ps aux | grep uvicorn`, luego `kill <PID>`); en la laptop, cerrar la otra ventana |
| `.\iniciar_aether.ps1` dice `[FALTA]` y un comando | Falta algo (clave de la celda, regla de firewall, perfil de red) | Hacer exactamente lo que dice debajo de la flecha `->` |
| El agente del Jetson se niega a arrancar diciendo "el gpiod de Python está instalado" | Regla de seguridad (capítulo 9) | **No continuar**; confirmar el cableado de la celda antes de instalarlo |
| La celda o `celda_agent` no arranca y dice que el modelo "trae N clases y classes.txt tiene M" | El `.onnx` no corresponde a las clases actuales | Volver a exportar `parts.pt` a ONNX (capítulo 8) |
| `import file mismatch` al correr todas las pruebas | Dos `test_setup.py` en carpetas distintas | Correr `tests/backend` y `tests/edge` por separado (capítulo 22) |

## Fallas de red

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| `curl` desde el Jetson a la laptop: **timeout** | El servidor no corre, el firewall lo bloquea o están en subredes distintas | `.\iniciar_aether.ps1 -SoloComprobar`; revisar el perfil de red (Privado) y la regla del puerto 8000 |
| `Connection refused` | La máquina responde pero nadie escucha | Arrancar el servidor o el agente |
| `No such host is known` con un nombre `.local` | mDNS no funciona en esa red | Usar la IP |
| SSH se corta con `Connection reset` | Dos interfaces de red activas en el Jetson (WiFi y cable) | Apagar el WiFi (`nmcli radio wifi off`) y usar `tmux` |
| Funciona unos minutos y se cae | La laptop se suspende o cambió la IP | Configurar energía "Nunca" al estar conectada; revisar la IP actual |

## Fallas de video, navegador y página

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| El video del agente no aparece pero `/stream` da 200 | **CSP** del navegador (`img-src`) bloqueó la imagen (capítulo 11) | Mirar la consola (`F12`); reiniciar el servidor con `AETHER_PERCEPTION_AGENT_URL` y recargar con `Ctrl+F5` |
| La página dice "Bloqueado por la política de seguridad (CSP)" | Mismo caso; el mensaje ya lo distingue | Igual |
| "No se pudo cargar el video… el agente no responde" | El agente no corre o su cámara no abre | Probar `.../health` del agente |
| Video a 2304 × 1536 y lentísimo | OpenCV abrió la cámara por GStreamer (capítulo 6) | Poner `*_CAMERA_BACKEND=v4l2`, `FOURCC=MJPG`, 640 × 480 |
| Pocos FPS | Poca luz (la cámara alarga la exposición) o modo de energía bajo | Más luz; medir con el modo anotado |
| Firefox del Jetson muy lento | Renderizado por software a través de VNC (no medido con HDMI) | Probar con un monitor conectado |
| Los navegadores en snap no abren | `snap-confine` falla (capítulo 9) | Usar Firefox del PPA de Mozilla; no tocar `snapd` |

## Fallas de voz y de Lumina

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| Lumina no despierta | Vosk no escribe "Lumina"; o hay ruido/murmullo | Ver el texto reconocido (`AETHER_VOICE_LOG_TEXT=1`); usar la tecla `w`; micrófono de diadema |
| La consola de voz dice `sin conexión con el servidor` | El servidor no corre o la dirección es otra | Arrancarlo; revisar `AETHER_VOICE_SERVER` |
| Lumina se contesta a sí misma | Eco | Audífonos o subir `AETHER_VOICE_ECHO_TAIL_S` |
| "ElevenLabs no disponible, uso voz del navegador" | La clave falta o la CSP (`media-src`) bloqueó el audio | Revisar `backend/.env` y la consola del navegador |
| `503` "Lumina no pudo pensar una respuesta" | Ollama no responde | `ollama serve` y `ollama pull llama3.2:1b` |
| El servicio de voz dice que falta el modelo | No está `AETHER_VOICE_MODEL` | Descargar el modelo `vosk-model-small-es` y apuntar a su carpeta |

## Fallas de la celda

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| Estado **DETENIDA** con motivo "Cámara apagada" | La visión no ha juzgado un cuadro en 2 s | Abrir la cámara de la celda; revisar `/health` de `celda_agent` |
| Alarma "Enlace PLC perdido" | `sources.plc` es `false` porque `gpiod` no está (capítulo 7) | Es **esperada** hoy; no es una falla del PLC |
| Arranque y Paro no responden | Falta `CELDA_HMI_CLAVE` (nadie inicia sesión) | Definirla en el entorno de la celda |
| Piezas contadas como `pulso_no_enviado` | `gpiod` ausente: nada se mueve a propósito | Correcto y seguro; para actuar real hay que cumplir la lista del capítulo 8 |
| Un FAIL falso | Umbral de estabilidad bajo | No bajar `LINE_ESTABLES` de 3 sin probar |
| Percepción y celda se estorban | Ambas cámaras usan `/dev/video0` | No abrirlas a la vez |

## Fallas de instalación en el Jetson

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| `torch.cuda.is_available()` es `False` | `pip` instaló el torch de PyPI (sin GPU) | Reinstalar la rueda de NVIDIA con `--force-reinstall --no-deps` |
| Aparece `Uninstalling torch` durante una instalación | Una dependencia quiere cambiar el torch | **Cancelar** con `Ctrl+C` antes de que termine |
| `unable to allocate CUDA0 buffer` | Posible efecto de actualizar paquetes de Ubuntu (reporte de un foro, **no verificado** aquí) | No usar `apt upgrade` en ese equipo |
| `ultralytics` intenta instalar `opencv-python` | Falta `YOLO_AUTOINSTALL=False` | Exportar esa variable |
| `numpy` demasiado nuevo | Conflicto con la versión que piden otras librerías | Mantener `numpy>=1.23,<2` |

## Fallas eléctricas y de hardware (las del carrito, en diseño)

Estas aparecen en la hoja de armado como "error típico" de cada etapa; ningún síntoma de esta tabla se ha reportado todavía en un carrito armado:

| Síntoma | Causa más probable | Qué hacer |
|---|---|---|
| El multímetro **pita** entre + y − con la batería desconectada | Cortocircuito | **No conectar nada**; buscar el corto |
| Un A4988 se quema | Motor conectado o desconectado con el driver encendido, VDD a 5 V o sin capacitor | Revisar la receta de la Etapa 11 |
| El ESP32 se reinicia al mover el servo | El servo se alimenta del ESP32 | Alimentarlo del XL4005 |
| El ESP32 "no se deja programar" | Un pin con trampa de arranque conectado, o cable USB de solo carga | Desconectar esas líneas; usar un cable de datos |
| Los motores-rueda no contestan por RS485 | A y B cruzados | Invertir A y B |
| Los sensores VL53L0X o el RS485 fallan "al azar" | Cables de señal junto a los de potencia | Separar y trenzar |
| Una llanta no toca el piso | Suspensión descompensada | Revisar la precarga del resorte |

## Una regla para todos los casos

Si después de revisar su tabla algo sigue fallando, la regla del equipo es: **escribir en la bitácora qué se hizo, qué se vio (con la salida pegada) y qué se supone**, y marcarlo así con las cuatro etiquetas. Una falla documentada se convierte en una fila de este manual; una falla ignorada reaparece en la demostración.

## Cómo aprende una planta de sus fallas

Los equipos de planta mantienen **procedimientos operativos** de falla (qué hacer cuando suena cada alarma), **registros** de eventos y un **ciclo de aprendizaje**: cada falla grave termina en un cambio de diseño o de procedimiento. La bitácora de Aether es la versión de laboratorio de ese ciclo.

## Para practicar: casos de diagnóstico

1. La página muestra un recuadro vacío en lugar del video del Jetson, pero `curl localhost:8001/health` responde bien. ¿Qué dos pruebas siguen, en qué orden?
2. `curl` desde el Jetson da *timeout* hacia la laptop pero el servidor corre. ¿Qué tres causas revisar?
3. Lumina no despierta y la consola de voz dice "MICRÓFONO ACTIVO". ¿Qué se mira primero?
4. La celda marca DETENIDA y "Cámara apagada" aunque el agente corre. ¿Qué verifica el estado?
5. `torch.cuda.is_available()` dio `False` tras instalar `ultralytics`. ¿Cuál es la primera hipótesis y cómo se comprueba?
6. Un A4988 se quemó. Nombrar tres causas que la hoja de armado enumera.
