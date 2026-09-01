> **SUPERADO — registro histórico, no arquitectura vigente.**
> Este documento fue reemplazado por `aether_context_docs.md` (raíz del
> repo), que lo dice explícitamente en su sección 2: la arquitectura aquí
> descrita trataba a Aether Inventory como un producto de solo inspección,
> sin el brazo robótico ni la línea de manufactura, que hoy son alcance
> obligatorio. Se conserva únicamente como registro de cómo empezó el
> proyecto — para arquitectura y decisiones actuales, usar
> `aether_context_docs.md`.

AETHER INVENTORY — AI CONTEXT
1. IDENTIDAD DEL PROYECTO

Nombre del proyecto: Aether Inventory

Tipo: Proyecto integrador de ingeniería / startup de robótica.

Concepto: Unidad móvil inteligente para automatización de inventarios mediante navegación, percepción computacional, identificación de productos, conteo y generación automática de información de inventario.

Estado: Proyecto en fase inicial de definición y arquitectura.

Fecha de inicio: 2026-07-30

2. VISIÓN DEL PRODUCTO

Aether Inventory busca desarrollar una plataforma móvil capaz de recorrer un entorno físico de manera autónoma o semi-autónoma, percibir su entorno, identificar productos o elementos relevantes y convertir esa percepción en información estructurada de inventario.

El objetivo no es construir únicamente un robot móvil.

El objetivo es construir un producto de automatización de inventarios que combine:

robótica móvil
visión artificial
inteligencia artificial
navegación
procesamiento en el borde (Edge Computing)
gestión de datos
generación de inventarios
visualización mediante software
3. PROBLEMA

Los inventarios realizados manualmente pueden requerir tiempo, personal y procesos repetitivos.

El sistema busca explorar una alternativa en la que una unidad móvil recorra las instalaciones, capture información visual y genere automáticamente información útil para el inventario.

4. OBJETIVO PRINCIPAL

Desarrollar un MVP funcional de una unidad móvil capaz de:

desplazarse por un entorno controlado;
recorrer rutas previamente definidas;
percibir su entorno;
detectar objetos mediante visión artificial;
identificar y/o clasificar productos;
contar elementos cuando las condiciones lo permitan;
asociar detecciones con una ubicación;
almacenar los resultados;
generar información estructurada de inventario;
mostrar los resultados mediante una interfaz de software.
5. ENTORNO INICIAL DEL MVP

El primer prototipo será desarrollado y probado en el laboratorio de la universidad.

El entorno inicial será controlado.

La primera versión no necesita resolver inmediatamente el problema general de navegación en cualquier almacén del mundo.

Se prioriza una solución funcional, demostrable y escalable.

6. FILOSOFÍA DE DESARROLLO

El proyecto se desarrollará mediante aprendizaje práctico.

No se pretende aprender todas las tecnologías antes de comenzar.

Cada tecnología se estudiará cuando sea necesaria para implementar un módulo concreto del proyecto.

Principio:

APRENDER → IMPLEMENTAR → PROBAR → INTEGRAR → DOCUMENTAR

7. TECNOLOGÍAS PREVISTAS

Estas tecnologías son candidatas iniciales y NO deben considerarse definitivas hasta validar la arquitectura:

Software
Python
OpenCV
YOLO
NumPy
PyTorch o framework compatible con los modelos seleccionados
Base de datos
Backend/API
Dashboard
Git
GitHub
Robótica
control de motores
encoders
IMU
sensores de distancia
navegación
waypoints
odometría
comunicación robot-computadora
Inteligencia artificial
detección de objetos
clasificación
tracking
procesamiento de imágenes
entrenamiento de modelos cuando sea necesario
análisis de datos
8. ARQUITECTURA CONCEPTUAL INICIAL

La arquitectura conceptual inicial es:

ROBOT ↓ SENSORES ↓ EDGE COMPUTER ↓ PERCEPCIÓN ↓ NAVEGACIÓN + VISIÓN ↓ INVENTORY ENGINE ↓ BACKEND ↓ DATABASE ↓ DASHBOARD

9. PRINCIPIO IMPORTANTE

No se debe implementar toda la arquitectura simultáneamente.

El sistema será desarrollado por módulos independientes.

Cada módulo debe poder probarse antes de integrarse con los demás.

10. MVP

El MVP debe priorizar:

funcionamiento real
estabilidad
demostrabilidad
arquitectura limpia
posibilidad de escalar

No se debe sacrificar el funcionamiento del MVP por intentar implementar características avanzadas demasiado pronto.

11. CARACTERÍSTICAS FUTURAS

Posibles características futuras:

navegación autónoma avanzada
SLAM
múltiples robots
operación en múltiples instalaciones
análisis histórico
predicción de demanda
integración con sistemas empresariales
procesamiento en la nube
identificación avanzada de productos
generación automática de reportes
optimización de rutas
12. REGLAS PARA CLAUDE

Claude debe actuar como:

arquitecto de software
asistente de programación
tutor técnico
revisor de código
apoyo para depuración

Claude NO debe:

inventar archivos existentes;
asumir que una dependencia está instalada;
modificar múltiples módulos sin necesidad;
crear arquitectura innecesariamente compleja;
introducir tecnologías únicamente porque sean populares;
ocultar errores;
afirmar que algo funciona sin haberlo comprobado.
13. REGLA DE CAMBIOS

Antes de realizar cambios estructurales importantes:

explicar qué se quiere cambiar;
explicar por qué;
identificar los archivos afectados;
explicar posibles consecuencias;
esperar confirmación cuando el cambio sea arquitectónicamente significativo.
14. ESTADO ACTUAL

Proyecto recién iniciado.

No existe todavía una estructura de código definitiva.

No existe todavía un repositorio Git configurado.

No existe todavía un MVP funcional.

Próximo objetivo:

Definir la arquitectura inicial y preparar el entorno de desarrollo.