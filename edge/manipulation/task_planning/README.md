# task_planning/ — fuera de alcance del MVP

Esta carpeta existe a propósito, no está olvidada.

Por ADR 0008 (`docs/architecture/decisions/0008-integracion-manipulacion.md`),
la línea de manufactura usa trayectorias pre-programadas en el controlador
nativo de cada brazo (KRL / URScript-PolyScope), con orquestación por
handshake descentralizado (sub-decisión 8a) — no hay un planificador de tareas
propio que decida secuencias o trayectorias en tiempo de ejecución.

Si en una evolución futura se decide agregar planeación de tareas propia, esa
decisión debe registrarse como una nueva ADR y actualizar `aether_context_docs.md`
sección 9, no implementarse directamente aquí.
