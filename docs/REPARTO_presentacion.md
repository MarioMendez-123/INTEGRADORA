# Reparto de la presentación

Diapositivas: `dashboard/slides.js` (40 láminas). Inglés: `/slides.html?lang=en`. Español: `/slides.html?lang=es`.
Tiempo estimado total: **9:45**. Es la presentación de la pre-integradora (unos 30 minutos disponibles). La presentación final del 3 de diciembre (5 minutos) es otra, más corta.

| # | Apartado | Lámina | Expositor | Tiempo |
|---|---|---|---|---|
| 1 | Cierre | AETHER, equipo | Mario | 0:10 |
| 2 | Introducción | Una línea de manufactura pequeña que une tres trabajos que suelen ir separados | Isaac | 0:15 |
| 3 | Objetivo | Objetivo | Isaac | 0:15 |
| 4 | Resumen | El proyecto en tres pasos | Uriel | 0:15 |
| 5 | Justificación | Por qué una tercera vía | David | 0:15 |
| 6 | Comparativa | Sin nuestro sistema vs. con nuestro sistema | Emmanuel | 0:15 |
| 7 | Cronograma | Cronograma de actividades | Isaac | 0:15 |
| 8 | Costos | Lo que se ha gastado, por subsistema | David | 0:15 |
| 9 | Costos | Cotización para un usuario final | David | 0:15 |
| 10 | Flujo de trabajo | Flujo general | Mario · Emmanuel | 0:15 |
| 11 | Cómo funciona · Percepción | De imagen a información: percibir, identificar, verificar | Mario · Uriel | 0:15 |
| 12 | Cómo funciona · Inventario | Lo observado no es lo declarado | Mario | 0:15 |
| 13 | Cómo funciona · Celda | Una pieza se juzga solo tras 5 lecturas iguales | Uriel | 0:15 |
| 14 | Construcción · Etapa 1 | Primero el diseño: cada pieza en 3D | Isaac | 0:15 |
| 15 | Construcción · Etapa 2 | La celda de manufactura, armada | Emmanuel | 0:15 |
| 16 | Construcción · Etapa 3 | Neumática: el pistón de scrap | Pedro | 0:15 |
| 17 | Construcción · Etapa 4 | La visión en la Raspberry Pi | Uriel | 0:15 |
| 18 | Construcción · Etapa 5 | El carrito: estructura de aluminio y torre del elevador | David | 0:15 |
| 19 | Construcción · Etapa 6 | El carrito: ruedas motrices y suspensión | David | 0:15 |
| 20 | Pruebas | Cada parte, probada por separado | Emmanuel · Pedro | 0:15 |
| 21 | Pruebas | Pruebas automáticas, corridas en la laptop | Mario · Uriel | 0:15 |
| 22 | Pruebas | Qué falló y cómo lo resolvimos | Isaac | 0:15 |
| 23 | Mantenimiento | Cómo se mantiene el sistema | Pedro | 0:15 |
| 24 | Seguridad y normas | Detenerse nunca depende de la red | Pedro | 0:15 |
| 25 | Interfaz | Una interfaz para toda la línea | Mario | 0:15 |
| 26 | Asistente | Lumina funciona sin internet | Mario | 0:15 |
| 27 | Interconexiones | Cómo se comunican los equipos | Emmanuel · Mario | 0:15 |
| 28 | Control · ESP32 | El ESP32 obedece, la Jetson decide | Mario | 0:15 |
| 29 | Control · Jetson | Una misión, del simulador al carrito real | Mario | 0:15 |
| 30 | Control · Jetson | Programar el carrito en Python | Mario | 0:15 |
| 31 | Diagramas eléctricos | Carrito: potencia y paro de emergencia | Emmanuel | 0:15 |
| 32 | Diagramas eléctricos | Carrito: cada conexión del ESP32 | Pedro | 0:15 |
| 33 | Diagramas eléctricos | Celda: Raspberry Pi, relevadores y LOGO! | Uriel | 0:15 |
| 34 | Simulación | Un gemelo digital de todo el carrito | Uriel | 0:15 |
| 35 | Simulación | Hasta el cable: el inspector de cables | Uriel | 0:15 |
| 36 | Simulación | Lo que viaja por los cables: RS485 | Uriel | 0:15 |
| 37 | Simulación | Simulado antes de construirse | Uriel | 0:15 |
| 38 | Demostración en vivo | En vivo: inventario declarado desde el servidor | Mario | 0:15 |
| 39 | Siguientes pasos | Lo que falta para cerrar el proyecto | Isaac | 0:15 |
| 40 | Cierre | Doble clic para hablar con Lumina | El equipo | 0:05 |

Tiempo por persona (las láminas compartidas se dividen en partes iguales): Mario 2:25 · Uriel 2:15 · Isaac 1:30 · David 1:15 · Emmanuel 1:07 · Pedro 1:07 · Equipo 0:05

## Datos que hay que confirmar

Salen del informe Avance 2 y del dictado de Mario del 16 de noviembre, salvo estos, que son estimaciones mías:

- **Mano de obra:** 6 personas × 240 h × 75 MXN/h = 108,000 MXN. Las 240 h salen del documento de contexto; la tarifa es supuesta.
- **Precio al usuario final:** (26,189 + 108,000) × 1.15 ≈ 154,000 MXN. No incluye los componentes de la celda sin cotizar.
- **Mantenimiento:** propuesta razonable según el equipo; el informe no tiene un plan de mantenimiento.
- **Cronograma:** los estados son los del informe del 24 de octubre, más lo dictado el 16 de noviembre. Las barras de construcción del carrito y de pruebas integrales son estimadas.
- **Pruebas (láminas 20 a 22):** 361 de 363 pruebas del servidor pasan (corridas el 16 de noviembre en la laptop con Windows); las 2 que fallan son de las respuestas libres de Lumina y están sin revisar. Simulador: 29 de 29 en Python y 5 de 5 en JavaScript. Las tarjetas de pistón y visión (lámina 20) salen del informe Avance 2.
- **Percepción (lámina 11):** mAP50 0.995 es lo reportado en el entrenamiento; no se repitió la medición.
- **Inventario (lámina 12):** 51 productos y 430 observaciones son los datos del panel en esta laptop (datos de demostración).
- **RS485 (lámina 36):** 3,164 tramas enviadas y 3,160 contestadas son de una sola corrida del simulador, no del carrito real.
- **Fotos del carrito (láminas 18 y 19):** reales (WhatsApp del 16 de noviembre). Las capturas del simulador y del modelo 3D (rev. 3.48) las generé yo desde el software.
- **Música:** `dashboard/assets/fondo_tech.wav`, sintetizada por mí, no es una grabación. Volumen en `MUSIC_VOL` de `slides.js` (teclas + y −, M silencia).
