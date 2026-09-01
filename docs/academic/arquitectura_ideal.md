> **SUPERADO — registro histórico, no arquitectura vigente.**
> Este documento describe el stack de Learning from Demonstration (LfD) —
> MediaPipe, SAM2, Behavior Cloning, DMPs, ROS2, PyBullet/Gazebo — que
> `docs/architecture/decisions/0008-integracion-manipulacion.md` evaluó y
> descartó formalmente: el UR5 se controla con trayectorias pre-programadas
> por el fabricante (URScript/PolyScope), sin LfD. Se conserva únicamente
> como registro de la idea original ("hipotética", como dice su propio
> título) — para la arquitectura de manipulación vigente, usar ADR 0008.

Aether Robotics
Arquitectura Ideal (Hipotética) del Proyecto
Visión

Desarrollar un sistema de Learning from Demonstration (LfD) que permita que un robot colaborativo aprenda nuevas tareas observando a un operador humano, comprendiendo el entorno, identificando objetos, razonando sobre la tarea y optimizando automáticamente su ejecución.

Flujo completo
Operador realiza una tarea de ensamblaje.
Sistema captura:
Video RGB.
Profundidad.
Esqueleto corporal.
Manos.
Voz.
MediaPipe estima el esqueleto y manos.
YOLO/SAM2 segmentan y reconocen objetos.
OpenCV calibra cámara y robot.
Se sincronizan trayectorias, contexto y objetos.
El módulo Learning from Demonstration transforma la demostración en acciones reutilizables.
Un motor de IA generaliza la tarea para pequeñas variaciones.
Un planificador genera trayectorias seguras.
El robot ejecuta la tarea.
Sensores verifican éxito o error.
El sistema aprende de nuevas demostraciones y mejora continuamente.
Dashboard registra métricas, tiempos, errores e historial.
Módulos
Visión Artificial
Percepción 3D
Seguimiento corporal
Reconocimiento de manos
Reconocimiento de objetos
Planeación
Learning from Demonstration
Motor de IA
Comunicación industrial
Dashboard
Base de datos
Seguridad funcional
Tecnologías
Python
OpenCV
MediaPipe
YOLO
SAM2
PyTorch
NumPy
FastAPI
PostgreSQL
MQTT
ROS2 (opcional)
Docker
Git
Hardware ideal
Robot colaborativo (UR5, Dobot, KUKA)
Cámara RGB
Cámara de profundidad
Jetson Orin / Mini PC
PC de entrenamiento
Red Ethernet industrial
PLC (si la integración industrial lo requiere)
IA del proyecto
Pose Estimation
Object Detection
Semantic Segmentation
Learning from Demonstration
Behavior Cloning
Trajectory Optimization
Anomaly Detection
Predictive Analytics
Características ideales
Aprende nuevas tareas en minutos.
No requiere programar trayectorias manualmente.
Se adapta a cambios pequeños.
Genera documentación automática.
Guarda versiones de habilidades.
Explica decisiones al operador.
Interfaz intuitiva para operadores sin conocimientos de robótica.
Escalabilidad
Manufactura flexible
Ensamble colaborativo
Industria 5.0
Automatización de PyMEs
Capacitación industrial
Laboratorios
Universidades
Meta final

Crear una plataforma comercial capaz de reducir significativamente el tiempo de programación de robots colaborativos mediante IA, visión artificial y aprendizaje por demostración.
