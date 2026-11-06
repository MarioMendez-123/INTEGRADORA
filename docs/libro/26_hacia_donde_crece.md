# Capítulo 26: Hacia dónde puede crecer Aether

*Lo que está pendiente según los propios documentos, lo que no conviene hacer todavía, las tecnologías que habría que aprender y un criterio para decidir qué va primero.*

## Un proyecto se mide por lo que sabe que le falta

Un proyecto sano es capaz de listar sus huecos con la misma precisión con que lista sus logros. Este capítulo reúne los huecos que el propio repositorio declara (`docs/TODO.md`, la ADR 0012, los criterios de aceptación y la bitácora), separa los que **están bloqueados por hardware** de los que **se pueden avanzar ya**, y propone, como **opinión** (no evidencia), un orden de trabajo.

## Lo que no se puede avanzar sin hardware o decisiones

Según `docs/TODO.md` (sección "bloqueado por hardware"), y con las decisiones del 24 de octubre ya aplicadas:

- **Confirmar la interfaz real de la celda**: el equipo decidió GPIO + relevadores hacia el LOGO; faltan los **detalles físicos** (pines, placa de relevadores, modelo de LOGO), que figuran en los pendientes del libro.
- **El programa del ESP32**: la decisión es PlatformIO; el **contrato con el Jetson**, el **protocolo del motor-rueda** y el programa mismo no existen.
- **La cámara del robot (USB o CSI)**: la cámara USB ya funciona en el Jetson; si el diseño final la mantiene, falta definirlo.
- **Pruebas de temporización del pistón** contra la velocidad real de la banda: necesitan pistón, banda y piezas juntos.
- **Flasheo y comprobación de versiones del Jetson**: ya hechos (capítulo 9); queda medir con carga real.

## Lo que sí se puede avanzar ya

1. **El criterio real de PASS/FAIL por defectos** (`backend/main.py`, función `_make_line_vision_processor`). Hoy distingue piezas registradas de otras cosas, pero **no inspecciona calidad**. Se puede desarrollar y probar con la cámara que ya existe.
2. **Más datos para el modelo de piezas**: el repositorio conserva 19 fotos; un mAP50 de 0.995 con tan pocas fotos es **optimista**. Más fotos, con distintas luces y fondos, y fotos de **objetos que no son pieza** para medir el FAIL de verdad.
3. **Persistir los `event_id`** de las observaciones en disco, para que un reinicio de la laptop no repita eventos (capítulo 16).
4. **Cerrar la deuda de limpieza**: las dos pruebas fallidas de Lumina y las 243 observaciones de estilo (capítulo 22).
5. **Medir con voz y ruido reales** (verificaciones V12 y V13) y decidir si se instala Whisper (capítulo 15).
6. **Medir el agente del Jetson con buena luz y con el modo de energía anotado**, y decidir **TensorRT con datos**.
7. **La Raspberry Pi 4 real**: sistema, medir el modelo ONNX con su versión de OpenCV, cámara V4L2 y, solo al final, GPIO con LED y multímetro (capítulo 8).
8. **Autenticación de los agentes**, si el proyecto sale del laboratorio.
9. **Arranque automático** (systemd) para la celda y, cuando resulte estable, el agente del Jetson.

## Lo que se descartó a propósito

La ADR 0012 lista lo que **no** se adoptó y por qué, una lección en sí misma: **TensorRT** (no se puede sostener ni documentar sin medir en el Jetson), **systemd** (otra pieza que mantener; `tmux` es el procedimiento actual), **WebRTC y RTSP** (más complejos que MJPEG), **MQTT** como canal de los agentes (HTTP ya está probado), **ROS 2**, **Docker**, **Tailscale** y una **aplicación nativa**. Y, de la arquitectura anterior, el **aprendizaje por demostración** y los **brazos robóticos**. Un proyecto de ~240 horas no puede permitirse todo; elegir qué **no** hacer es una decisión de ingeniería.

## ROS 2 y SLAM, sin miedo

Dos siglas que cualquier jurado pregunta:

- **ROS 2** (*Robot Operating System 2*) es un conjunto de librerías y convenciones para robots: estándares de mensajes, herramientas de navegación y simulación. Aether lo descartó por **costo de aprendizaje** para el tamaño del equipo, no por defecto técnico.
- **SLAM** (*Simultaneous Localization and Mapping*, "localización y mapeo simultáneos") es la técnica con que un robot construye un mapa mientras se ubica en él, normalmente con **lidar** o cámaras. El proyecto lo **difirió**: el robot navega por **waypoints** con **ArUco** como verificación; un SLAM completo excede el tiempo disponible y no es indispensable para el ciclo del laboratorio.

## Tecnologías que habría que aprender, por área

| Área | Tecnología | Para qué |
|---|---|---|
| Firmware | **PlatformIO**, librerías de motores a pasos, comunicación serie | El programa del ESP32 |
| Visión | **TensorRT**, entrenamiento con más datos, métricas por clase | Rendimiento y FAIL real |
| Datos | **PostgreSQL**, índices | Escalar el inventario |
| Comunicaciones | **MQTT** con un broker, tópicos de telemetría | La Opción C (estado en vivo) |
| Operación | **systemd**, **Docker**, **monitoreo** | Arranque y reproducibilidad |
| Seguridad | Autenticación, gestor de secretos, **IEC 62443** | Salir del laboratorio |
| Calidad | **Integración continua**, cobertura | Pruebas en cada cambio |
| Navegación | **Odometría con IMU**, **SLAM**, lidar | Autonomía en espacios no marcados |

## Qué pedirle a un asistente de programación

El proyecto trabaja con un asistente de IA y tiene **reglas escritas** para él (`aether_context_docs.md`, sección 7): no inventar archivos ni dependencias, no afirmar que algo funciona sin comprobarlo, no modificar varios módulos sin necesidad, explicar antes de un cambio estructural y **esperar confirmación** cuando sea arquitectónicamente significativo. Un buen encargo concreto: *"Implementa el criterio PASS/FAIL con tolerancias por pieza y escribe la prueba que falla con el código viejo"*; uno malo: *"Mejora la visión"*.

## Ejercicio de priorización (opinión)

Un criterio útil: **primero lo que reduce el mayor riesgo para la próxima demostración, después lo que lo habilita todo, después lo que embellece.** Con ese criterio, un orden razonable de las nueve tareas de arriba sería: **1)** pruebas de seguridad física y paro (lo que más daña si falla), **2)** FPS del Jetson y datos de la Pi (lo que habilita la demostración), **3)** criterio de PASS/FAIL y más fotos (lo que hace creíble la celda), **4)** firmware del ESP32 (lo que habilita al robot), y solo después autenticación, systemd y TensorRT. Es **una opinión, no una decisión**: el orden real lo fija el equipo según la fecha de la demostración.

## Cómo crecen los productos reales

Un producto como Aether se vuelve sistema comercial agregando **versiones** estables, **certificaciones** de seguridad, **un servicio en la nube opcional** para varias sedes y un **soporte** que pueda reproducir fallas con registros. El propio mensaje comercial del proyecto, *"el robot revisó el Anaquel 4 y encontró 23 unidades"*, recuerda que el valor está en la **confianza del dato**, no en la complejidad técnica.

## Preguntas de repaso: el futuro

1. Citar tres tareas que están bloqueadas por hardware y tres que no.
2. ¿Por qué un mAP50 de 0.995 con 19 fotos debe tomarse con cautela?
3. ¿Qué es SLAM y por qué se difirió?
4. ¿Por qué tiene sentido listar lo que se descartó?
5. ¿Qué criterio de prioridad se propone y qué tarea saldría primera?
6. Redactar un encargo concreto para un asistente de programación sobre el criterio PASS/FAIL.
