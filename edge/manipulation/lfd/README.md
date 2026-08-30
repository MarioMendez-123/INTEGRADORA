# lfd/ — fuera de alcance del MVP

Esta carpeta (y sus subcarpetas `pose_estimation/`, `segmentation/`,
`demonstration_capture/`) existe a propósito, no está olvidada.

Por ADR 0008, el movimiento del UR5 se implementa mediante trayectorias
pre-programadas por waypoints en el controlador nativo del fabricante, **sin
Learning from Demonstration**. El stack originalmente candidato para esto
(MediaPipe, SAM2, Behavior Cloning, DMPs, ROS2, MoveIt, PyBullet/Gazebo) fue
evaluado y descartado — ver `aether_context_docs.md` sección 5.

Nunca describir el comportamiento del UR5 como "aprendido" en código,
comentarios, documentación o presentaciones — ver sección 4.2 del contexto
maestro.

Si en una evolución futura se retoma LfD, esa decisión debe registrarse como
una nueva ADR y actualizar `aether_context_docs.md` sección 9, no
implementarse directamente aquí.
