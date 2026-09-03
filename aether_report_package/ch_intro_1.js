const B = require("./build.js");
const { C, h1, h2, h3, p, pRuns, bullet, Paragraph, PageBreak } = B;

const introduccion = [
  h1("INTRODUCCIÓN"),
  p("Este reporte documenta el desarrollo del proyecto integrador Aether, un sistema de manufactura automotriz que combina una unidad móvil de inspección de inventario con dos brazos robóticos industriales y un sistema de visión de verificación. El proyecto se desarrolla en el marco de la materia integradora de la Universidad Tecnológica de Chihuahua Sur, con un equipo de seis integrantes distribuidos por especialidad: programación de robots y visión computacional, diseño mecánico, programación del brazo KUKA, programación del brazo UR, mecánica y electrónica, e interfaz gráfica."),
  p("El alcance del proyecto no se limita a un robot móvil de inventario. El objetivo académico obligatorio es una línea de manufactura completa: un brazo KUKA KR6 coloca piezas automovilísticas en una banda transportadora, un brazo UR5 las ensambla mediante trayectorias pre-programadas, un sistema de visión confirma de forma binaria que el ensamble se completó correctamente y la unidad móvil Aether Inventory recoge la pieza terminada, la transporta y mantiene el control del inventario de todo el proceso."),
  p("Este documento presenta el estado real del desarrollo al momento de su redacción. Los módulos de percepción, procesamiento de inventario, backend y dashboard cuentan con implementación funcional verificada sobre hardware real. Los módulos de manipulación robótica, navegación autónoma y línea de manufactura física dependen de hardware que el equipo aún no tiene instalado, y se documentan en su estado de diseño arquitectónico, marcados explícitamente como pendientes donde corresponde."),
  p("Esta distinción entre lo construido y lo planeado se mantiene de forma consistente en todo el documento porque es un principio de trabajo del propio proyecto: no se reportan datos ni resultados que no provienen de una prueba real sobre hardware real."),
  new Paragraph({ children: [new PageBreak()] }),
];

const capitulo1 = [
  h1("CAPÍTULO 1. LA IDEA DEL PROYECTO", "1"),

  h2("1.1 Contexto"),
  p("Aether se desarrolla en un contexto de manufactura automotriz, industria con presencia significativa en Chihuahua y con una demanda constante de líneas de producción que combinen manipulación robótica, verificación de calidad y control de inventario. El proyecto integra tres frentes que normalmente se resuelven por separado: la colocación y el ensamble de piezas mediante brazos robóticos, la verificación visual de que el ensamble se completó correctamente y el seguimiento del inventario de piezas terminadas mediante una unidad móvil autónoma."),

  h2("1.2 Antecedentes del problema"),
  p("En líneas de manufactura pequeñas y en entornos académicos, la coordinación entre estaciones de trabajo suele depender de operadores humanos que trasladan piezas entre procesos, verifican visualmente el resultado de cada operación y llevan el conteo de inventario de forma manual. Esta dependencia introduce tres problemas recurrentes: tiempos muertos entre estaciones mientras se espera la intervención humana, inconsistencia en la verificación de calidad porque el criterio de inspección varía entre personas y momentos del día, y registros de inventario que no reflejan con precisión la producción real porque el conteo manual acumula errores conforme aumenta el volumen."),
  p("El proyecto responde a estos tres problemas con una solución integrada: brazos robóticos para la manipulación, un sistema de visión para la verificación de calidad y una unidad móvil autónoma para el seguimiento del inventario, comunicados entre sí sin depender de intervención humana en el flujo normal de operación."),

  h2("1.3 Objetivo del proyecto"),
  p("Desarrollar una línea de manufactura automotriz funcional que integre dos brazos robóticos industriales, un sistema de visión artificial de verificación y una unidad móvil de inventario, capaz de ejecutar el ciclo completo de colocación, ensamble, verificación y transporte de piezas terminadas sin orquestación central, y de mantener un registro trazable del inventario resultante."),

  h3("Objetivos específicos"),
  bullet("Implementar un sistema de percepción híbrido capaz de detectar y contar objetos mediante YOLO, e identificarlos de forma exacta mediante lectura de código de barras o QR cuando esté disponible."),
  bullet("Implementar un sistema de localización basado en marcadores ArUco para verificación de posición, sin depender de este sistema para la navegación del robot."),
  bullet("Programar los brazos KUKA KR6 y UR5 mediante sus lenguajes nativos de fabricante, con trayectorias pre-programadas para la tarea de ensamble."),
  bullet("Implementar un sistema de visión de línea que confirme de forma binaria si una pieza quedó correctamente ensamblada."),
  bullet("Diseñar un esquema de datos que distinga entre observaciones crudas de percepción e inventario declarado, preservando la trazabilidad histórica de cada corrida de inspección."),
  bullet("Integrar las cuatro estaciones del proceso mediante un protocolo de enlace punto a punto, sin un orquestador central que dirija el proceso."),
  bullet("Construir un backend y un dashboard que muestren el inventario declarado, su historial y su trazabilidad de forma honesta, sin presentar como tiempo real información que no lo es."),

  h3("Justificación"),
  p("La automatización de líneas de manufactura pequeñas suele encontrarse con una disyuntiva: las soluciones comerciales completas superan el presupuesto de una pequeña o mediana empresa, mientras que las soluciones parciales dejan huecos de coordinación que terminan resolviéndose con intervención manual. Aether explora una tercera vía, con alcance académico: construir cada módulo con tecnología accesible y bien documentada — Python, OpenCV, YOLO, FastAPI, MQTT y programación nativa de fabricante para los brazos — e integrar los módulos mediante un protocolo de enlace simple en vez de un orquestador central costoso."),
  p("El valor del proyecto no está únicamente en la robótica de manipulación, que es la parte más visible de una línea de manufactura, sino en la capa de datos que la acompaña: un inventario que distingue entre lo observado y lo declarado, que nunca sobrescribe silenciosamente un resultado anterior con uno parcial y que mantiene una bitácora completa de cada corrida. Esta capa de datos es la que permite que la línea de manufactura sea auditable, y es una de las contribuciones específicas del proyecto sobre un sistema de manipulación robótica convencional."),

  new Paragraph({ children: [new PageBreak()] }),
];

module.exports = { introduccion, capitulo1 };
