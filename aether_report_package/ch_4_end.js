const B = require("./build.js");
const { C, h1, h2, h3, p, pRuns, bullet, calloutPending, Paragraph, PageBreak, ExternalHyperlink, TextRun } = B;

const capitulo4 = [
  h1("CAPÍTULO 4. ENTORNO VIRTUAL / FÍSICO Y MANTENIMIENTO", "4"),

  h2("4.1 Entorno de desarrollo actual"),
  p("El proyecto se desarrolla en dos entornos virtuales de Python independientes, uno para el subsistema de borde (edge/) y otro para el backend (backend/), cada uno con sus propias dependencias de producción y de desarrollo separadas. El control de versiones se lleva en un repositorio privado de GitHub."),
  p("El modo de operación actual es un modo de demostración de escritorio: una sola laptop ejecuta tanto la cámara de percepción como la cámara de visión de línea, controladas por variables de entorno independientes (PERCEPTION_CAMERA_INDEX y LINE_VISION_CAMERA_INDEX) porque ambos procesos comparten temporalmente el mismo equipo. Esta separación deja de ser necesaria de forma natural cuando el hardware físico esté instalado y cada proceso corra en una máquina distinta, y no se considera deuda técnica."),

  h2("4.2 Entorno físico planeado"),
  calloutPending("hardware no instalado al momento de este reporte."),
  p("Cuando el Jetson Orin Nano Super esté disponible (NVIDIA Corporation, 2024), la visión del robot móvil correrá sobre ese dispositivo, mientras que la visión de línea de manufactura correrá en una computadora fija de escritorio colocada cerca de la celda física, no en un dispositivo embebido: un microcontrolador ESP32 o STM32 no cuenta con GPU y no puede ejecutar YOLO, por lo que su función se limita al control de bajo nivel."),
  p("Queda pendiente instalar PyTorch con la compilación específica de NVIDIA JetPack para el Jetson, distinta de la compilación de CPU usada actualmente en la laptop de desarrollo."),

  h2("4.3 Mantenimiento"),
  calloutPending("no aplica todavía; depende de la instalación física del hardware."),
  p("Una vez instalado el hardware, el plan de mantenimiento deberá cubrir al menos la verificación periódica de la cámara y los marcadores de referencia, la calibración de los encoders y el mantenimiento programado de los brazos KUKA y UR5 según la especificación de cada fabricante."),

  h2("4.4 Manual de seguridad"),
  p("El proyecto define un principio de seguridad desde la Decisión 6: el comando de parada de seguridad no depende de la conectividad de red, sino de un watchdog de hardware implementado en el microcontrolador de bajo nivel, de forma que una falla de comunicación nunca deje al robot sin capacidad de detenerse."),
  calloutPending("el resto del manual de seguridad — procedimientos de instalación, señalización del área de trabajo y protocolo de acceso de personal a la celda de manufactura — queda pendiente de definición hasta que el equipo cuente con los brazos robóticos y el robot móvil físicos. Documentar procedimientos de seguridad sin el hardware real presente sería una descripción especulativa que el proyecto evita de forma deliberada."),

  new Paragraph({ children: [new PageBreak()] }),
];

const conclusiones = [
  h1("CONCLUSIONES Y RECOMENDACIONES"),
  p("Al momento de este reporte, Aether tiene un flujo de datos completo y funcional que corre sobre hardware real desde la cámara hasta el dashboard: percepción híbrida con YOLO, código de barras y ArUco, un motor de inventario que separa observaciones crudas de inventario declarado, un backend en FastAPI con retiro trazable y una interfaz de \"industrial dark tech\" coherente en todo el sistema."),
  p("Esta base de software resultó más rápida de construir que la integración física de la línea de manufactura, lo cual es consistente con el orden de dependencias del proyecto: la lógica de datos no depende de hardware que aún no llega, mientras que la manipulación robótica y la navegación sí."),
  p("Los pendientes reales identificados en este reporte — programación de los brazos KUKA y UR5, navegación física del robot móvil, línea de manufactura instalada, y los umbrales de aceptación que dependen de hardware final — definen la ruta crítica restante del proyecto. Se recomienda priorizar la llegada del Jetson Orin Nano Super y de los brazos robóticos como siguiente hito, porque ambos desbloquean directamente los módulos de Navegación y de Manipulación, actualmente los dos con mayor dependencia externa."),
  p("Se recomienda también mantener el principio de trabajo que ha guiado el proyecto hasta ahora: no reportar como funcional ni como dato real nada que no provenga de una prueba verificada sobre hardware real. Este principio, aplicado en la separación entre observaciones y declarado, en los estados de cobertura pendientes y en las secciones marcadas explícitamente como pendientes en este mismo reporte, es lo que permite que el sistema sea auditable frente a un cliente o a un jurado académico."),
  new Paragraph({ children: [new PageBreak()] }),
];

function ref(runsBeforeLink, url, runsAfterLink) {
  const children = [];
  runsBeforeLink.forEach(t => children.push(new TextRun({ text: t, font: "IBM Plex Sans", size: 20, color: C.body })));
  children.push(new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text: url, font: "IBM Plex Mono", size: 18, color: C.violetDark, underline: {} })],
  }));
  return new Paragraph({
    spacing: { after: 220, line: 280 },
    indent: { left: 400, hanging: 400 },
    children,
  });
}

const referencias = [
  h1("REFERENCIAS"),
  ref(["Banks, A., Briggs, E., Borgendale, K., & Gupta, R. (Eds.). (2019). MQTT Version 5.0 (OASIS Standard). OASIS. "], "https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html", []),
  ref(["Jocher, G., Chaurasia, A., & Qiu, J. (2023). Ultralytics YOLOv8 (Version 8.0.0) [Software]. GitHub. "], "https://github.com/ultralytics/ultralytics", []),
  ref(["NVIDIA Corporation. (2024). Jetson Orin Nano Super Developer Kit [Especificaciones de producto]. "], "https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/nano-super-developer-kit/", []),
  ref(["OpenCV Team. (s.f.). Detection of ArUco markers. OpenCV Documentation. Recuperado en 2026, de "], "https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html", []),
  ref(["Ramírez, S. (s.f.). FastAPI [Software]. Recuperado en 2026, de "], "https://fastapi.tiangolo.com", []),
];

module.exports = { capitulo4, conclusiones, referencias };
