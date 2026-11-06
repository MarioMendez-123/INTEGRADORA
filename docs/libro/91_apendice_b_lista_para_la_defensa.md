# Apéndice B: Lista para la defensa

*Qué se puede afirmar con respaldo, qué hay que matizar, qué conviene no decir y qué revisar antes de presentar. Cada línea remite al capítulo donde está su evidencia.*

## Se puede afirmar (está comprobado)

- **El código de percepción híbrida corre y está probado**: YOLO + lectura de códigos + ArUco, con pruebas automáticas (capítulo 14). La suite del servidor dio **345 pruebas aprobadas y 2 fallidas** el 24 de octubre (las dos fallidas son de Lumina y ya fallaban antes) (capítulo 22).
- **El agente de percepción corrió en el Jetson real**: **29.0 FPS** de cámara y **29.1** de entrega a 640 × 480, inferencia de **68 ms**, reportado por Mario el 23 de octubre (capítulo 9).
- **PyTorch con GPU funciona en el Jetson** (`torch.cuda.is_available() = True`, CUDA 12.6) (capítulo 9).
- **El inventario separa observaciones crudas de inventario declarado**, con historial que nunca se sobrescribe y retiro por decisión humana, no automático (capítulo 17).
- **La entrega de datos es idempotente y resistente a fallas de red** (identificador por evento, cola acotada, reintento con espera creciente) (capítulo 16).
- **El audio de voz nunca se guarda ni sale de la laptop**, y una prueba lo verifica leyendo el código (capítulo 15).
- **Ningún botón de la pantalla de la celda puede mover un pin** mientras `gpiod` no esté instalado; el equipo lo comprobó leyendo el código (capítulo 7).
- **El dominio público es estático y no expone el backend** (las rutas del laboratorio responden 404 allí) (capítulo 20).
- **La contraseña de la celda no está en el código** (viene de `CELDA_HMI_CLAVE`) (capítulo 21).
- **Hay un método**: decisiones por escrito (12 ADR), bitácora con salidas reales, matriz de trazabilidad y etiquetas de certeza (capítulo 23).
- **La línea cambió de brazos a banda + pistón por una decisión documentada** (ADR 0010, 16 de septiembre) (capítulo 1).

## Hay que matizarlo

| No decir así | Decir así | Capítulo |
|---|---|---|
| "El robot navega solo" | "El robot está **diseñado** para navegar por waypoints; el firmware del ESP32 todavía no existe" | 3, 5 |
| "La celda inspecciona la calidad" | "La celda distingue piezas registradas de objetos que no lo son; **no inspecciona defectos todavía**" | 7 |
| "El modelo acierta el 99.5 %" | "El mAP50 es 0.995 con **pocas fotos**; no se probó con objetos que no son pieza" | 7, 14 |
| "La voz de Lumina funciona en cualquier ruido" | "La palabra de activación se midió con **voz sintética**; con murmullo acierta mucho menos; con voz real **no se ha medido**" | 15 |
| "La celda ya está probada en la Raspberry" | "Está **construida y probada en laptop**; la Pi real falta" | 7, 8 |
| "El carrito está armado" | "Existe un **diseño detallado** (hoja de armado rev. 3.8); no hay evidencia de que esté armado" | 3 |
| "Tiene paro de emergencia" | "El robot tiene un **diseño** de paro con contacto NC que corta la potencia; el de la celda **no está documentado**" | 4, 7 |
| "MQTT conecta todo" | "MQTT está **decidido para telemetría** pero **sin implementar**; hoy se usa HTTP y WebSocket" | 18 |
| "La seguridad está resuelta" | "Hay capas de software y reglas físicas; los agentes **no tienen autenticación** (riesgo aceptado de laboratorio); Cloudflare está pendiente" | 20, 21 |
| "Los datos son en tiempo real" | "Es una **captura continua de esta cámara**, no inventario en tiempo real de todo el piso" | 17 |

## Evitar decirlo

- **"Conteo real de inventario"**: solo existe "conteo visible detectado".
- **"El sistema aprendió la tarea"** o "learning" para el pistón: es lógica programada de punto fijo (principio 4.2).
- **"Evasión inteligente de obstáculos"**: es detección reactiva.
- **"ArUco es el sistema de navegación"**: es verificación de posición.
- **"Cobertura completa = vimos todo"**: `COMPLETE` significa que el procedimiento terminó.
- **"Es un producto certificado"**: es un prototipo de laboratorio.
- Cualquier cifra de rendimiento **sin decir en qué equipo y en qué modo** se midió.
- Cualquier afirmación sobre los motores, el peso o la batería **sin decir que es estimación**, mientras sigan **PENDIENTES**.

## Preguntas probables y respuestas con respaldo

1. **¿Qué lo hace distinto?** La trazabilidad y la honestidad del dato; la arquitectura de "datos chicos" con agentes independientes; el método documentado.
2. **¿Qué pasa si falla la red?** La celda decide y actúa sola; los agentes acumulan datos y los entregan al volver.
3. **¿Qué pasa si se cuelga el Jetson con el robot en movimiento?** El diseño: el watchdog del ESP32 detiene las ruedas en 1 s, y el paro físico corta la potencia sin software. **Ambos son diseño, no probado.**
4. **¿Por qué banda y pistón y no brazos?** Reduce el riesgo de integración física con el mismo requisito de hardware real (ADR 0010).
5. **¿Qué falta?** Lo listado en la sección de pendientes del final del libro, con su responsable.

## Antes de presentar

1. Correr `iniciar_aether.ps1 -SoloComprobar` (`[Laptop · PowerShell]`) y revisar que todo esté en verde.
2. Medir los **FPS del agente** con `probar_agente.py` anotando el modo de energía (`sudo nvpmodel -q`).
3. **Probar la voz con el micrófono y el ruido del lugar** (grabar y comparar) y tener la tecla `w` lista.
4. **Confirmar la clave de ElevenLabs** (válida y con créditos) y tener el plan B de la voz del navegador.
5. **Medir el video en el hardware y la red del escenario**: lo medido hoy fue en una laptop.
6. **Rotar** cualquier secreto que se haya pegado en un chat.
7. Si la celda va a mover algo: **lista de la sección "Antes de energizar"** del capítulo 8, **paro físico** cableado y a la mano.
8. Revisar `git status` y `git diff --stat`: nada de claves, tokens ni bases de datos.
9. Ensayar una caída: apagar el WiFi de la laptop y ver que la celda sigue.
10. Llevar la **hoja de pendientes** del final del libro: es la prueba de que el equipo sabe lo que falta.
