const B = require("./build.js");
const {
  C, h1, h2, h3, p, pRuns, bullet, calloutPending, tableCaption,
  headerCell, Table, TableRow, TableCell, Paragraph, TextRun, WidthType, ShadingType, PageBreak,
} = B;
const commits = require("./commits_post_informe.json");

// Tabla de dos o tres columnas con el mismo estilo que ch_2.js
function table(widths, head, rows, monoFirst = false) {
  const cell = (text, w, i) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({
        text,
        font: i === 0 && monoFirst ? "IBM Plex Mono" : "IBM Plex Sans",
        bold: i === 0,
        size: 18,
        color: i === 0 ? C.violetDark : C.body,
      })],
    })],
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: head.map(headerCell) }),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(t, widths[i], i)) })),
    ],
  });
}

const estadoRows = [
  ["Agente del Jetson (cámara propia, YOLO, /stream, /status)", "Prueba de humo en laptop con webcam: 30.0 FPS de cámara y de entrega, inferencia 47 ms (última) y 56.7 ms (promedio), 0 observaciones. En el Jetson, reportado por Mario: 29.0 FPS de cámara, 29.1 de entrega, 640x480, inferencia 68.0 ms, laptop alcanzable.", "El FPS del Jetson es reportado por Mario, no repetido por Claude. Con detecciones reales, 0 observaciones en la prueba de la laptop."],
  ["Entrega idempotente de observaciones (ID por evento, cola, reintento, lotes)", "Pruebas automáticas con dobles y con servidor real; los lotes se midieron en teoría (≈12 detecciones/s antes, un POST por observación).", "No medido el efecto de los lotes en el Jetson real."],
  ["Servicio de voz de la laptop (Vosk, solo texto, WebSocket)", "Núcleo y canal probados con audio simulado y con servidor y WebSocket reales.", "Micrófono real, Vosk con voz real, español de Mario, ruido de la universidad: no comprobado."],
  ["Palabra de activación «Lumina» tolerante", "Con voz sintética de Windows: silencio 0/30 → 28–30/30; con murmullo +10 dB 2 → 11 de 30; falsos positivos 1/25 → 4/25.", "Con la voz y el ruido reales no comprobado; Whisper no medido."],
  ["Corrección de CSP en index.html (video del agente)", "Reproducido en la laptop con el servidor real; pruebas nuevas que fallan con el código anterior y pasan con el nuevo.", "Falta repetir en el navegador del Jetson (Ctrl+F5)."],
  ["Corrección de CSP media-src (audio de ElevenLabs)", "Prueba automática: encabezado y meta coinciden y blob:/data: no aparecen en script-src ni connect-src.", "En navegador real no verificado; tampoco la clave ni los créditos de ElevenLabs."],
  ["Agente de la celda para la Raspberry Pi 4 (ONNX, sin GPIO)", "Mismo juicio PASS/FAIL que parts.pt en 19/19 fotos; IoU medio 0.994, mínimo 0.983; CPU 381 % de un núcleo (pipeline anterior) contra 18 % (agente nuevo) en la laptop.", "Nada probado en la Pi real; GPIO fuera de alcance por regla."],
  ["Arranque simple (iniciar_aether.ps1, iniciar-agente.sh, ver-aether.sh)", "-SoloComprobar corrido de verdad en la laptop; detectó que backend/.env no tenía CELDA_HMI_CLAVE.", "Arranque completo y scripts del Jetson sin probar."],
  ["Suite de pruebas del backend", "264 pruebas, 262 pasan al cierre de la rama (cifra del documento de trazabilidad).", "Las 2 que fallan son de Lumina (test_robot_ask_*) y ya fallaban antes."],
  ["PyTorch de NVIDIA en el Jetson", "Reportado por Mario: torch 2.5.0a0+872d972e41.nv24.08, torch.cuda.is_available() = True, matmul 512x512 en GPU correcto.", "Solo una operación simple; no se probó con YOLO bajo carga ni durante periodos largos."],
];

const decisionRows = [
  ["ADR 0010", "16 sep", "Línea de manufactura con banda, fixtures y pistón; reemplaza a la ADR 0008 (KUKA + UR5).", "Vigente; la ADR 0008 queda como registro histórico."],
  ["ADR 0011", "21 oct", "Reparto de roles entre equipos y contrato de agentes. Se escribió como borrador.", "Borrador sin decidir; las opciones se ampliaron con el problema de los navegadores del Jetson."],
  ["ADR 0012", "22 oct", "Agentes de cámara y voz local: cada cámara se procesa y muestra en su propio equipo; micrófono de la laptop; la Pi con el mismo patrón y sin GPIO.", "Propuesta implementada en la rama jetson-agente, todavía no aceptada por Mario."],
];

const capitulo5 = [
  new Paragraph({ children: [new PageBreak()] }),
  h1("CAPÍTULO 5. CAMBIOS POSTERIORES AL CORTE DEL INFORME", "5"),

  h2("5.1 Alcance, fuentes y cómo leer este capítulo"),
  p("Los capítulos 1 a 4 describen el proyecto tal como estaba el 1 y 2 de septiembre de 2026, cuando se generó la primera versión de este informe. Este capítulo registra todo lo que se implementó en el repositorio después de ese corte, hasta el 23 de octubre de 2026: 49 commits en el repositorio, más los documentos de la carpeta docs/ que los respaldan. El listado completo, commit por commit, está en el Anexo A de este capítulo."),
  p("Las fuentes son el historial de git, docs/CHANGELOG.md, la bitácora de hardware real (docs/jetson/BITACORA_JETSON.md), los documentos de docs/auditoria/ y docs/security/reporte.md. Cuando una cifra proviene de una salida leída en la laptop de desarrollo se dice así; cuando la reportó Mario desde el Jetson se marca como reportada; y lo que no se ha probado en hardware real se marca como no comprobado. No se redondeó ninguna cifra a favor del proyecto."),
  calloutPending("varias afirmaciones de los capítulos 2, 3 y 4 quedan superadas por este capítulo. En concreto, la línea ya no usa los brazos KUKA KR6 y UR5 (sección 5.2), y el capítulo 4 dice que el hardware no está instalado, cuando ahora existe un Jetson Orin Nano Super en uso con una cámara USB. Esas secciones no se reescribieron en esta versión; este capítulo prevalece."),

  h2("5.2 Línea de manufactura sin brazos robóticos (16 de septiembre)"),
  p("Mario decidió eliminar el brazo KUKA KR6 y el brazo UR5 del proyecto. La línea pasó de «KUKA coloca la pieza, UR5 la ensambla, la visión confirma y Aether Inventory recoge» a una secuencia más simple: una banda transportadora con fixtures que sostienen cada pieza, la visión de línea decide si la pieza pasa o no, y un pistón expulsa a scrap solo las que no pasan; las que pasan las recoge Aether Inventory."),
  p("La decisión se documentó como ADR 0010 (docs/architecture/decisions/0010-linea-banda-piston.md), que sustituye a la ADR 0008. El motivo registrado es que se elimina la coordinación con tiempos críticos entre tres robots industriales y se conserva el requisito académico de manipulación con hardware real. Se eliminaron las carpetas edge/manipulation/arm_control, lfd y task_planning. Un segundo commit corrigió hallazgos de la revisión de código sobre el primero (el eslogan y un valor del enum de acción)."),
  p("No cambió el robot móvil, su percepción (YOLO, ArUco, código de barras), el dashboard de inventario ni Lumina, salvo que Lumina dejó de mencionar brazos. En ese momento no había PLC, ESP32/STM32 de línea ni pistón físico: era solo plan y documentación. La cámara de Visión de línea seguía siendo una demo de presencia («PIEZA DETECTADA» / «SIN PIEZA»), pendiente de convertirse en criterio real de pasa o no pasa."),

  h2("5.3 Robot Lumina: cara, voz, cámara y rediseño (16 y 17 de septiembre)"),
  p("Se incorporó al repositorio el robot móvil Lumina con su cara, voz y cámara, junto con el changelog y la lista de pendientes de la banda y el pistón, y el video final. Dos días después se rediseñó la interfaz de Lumina (robot.html, robot.css, robot.js) con un estilo OLED de ciencia ficción, y se corrigió un error de ese rediseño: una constante prefersReducedMotion declarada dos veces en robot.js que impedía que corriera. Antes, el 2 de septiembre, ya existían la interfaz completa de Lumina (cara, voz, Ollama) con sus endpoints en el backend y la cámara compartida del backend (CameraPublisher) con actualización automática del inventario en el dashboard."),

  h2("5.4 Dashboard: cargador, vista por capas y animaciones (30 de septiembre)"),
  p("Según docs/CHANGELOG.md, se agregó un cargador global en index.html e inventory.html (loader.js y robot-model.js): un anillo con el progreso real de la carga, un robot que se desarma y se arma en bucle, y un logo que se dibuja, con un mínimo de 800 ms y un máximo de 3 s; lo que siga cargando después se muestra como skeleton. robot.html no lleva el cargador a propósito, porque su pantalla de arranque es negra hasta la activación por voz."),
  p("También se agregó la sección «Pieza por pieza» (#robot) en la portada, donde al hacer scroll la unidad móvil se desarma en cinco capas: percepción, cómputo, control, energía y tracción, cada una con el estado real de su decisión. Está rotulada en la propia página como diseño conceptual beta, no como el modelo mecánico. Se sumaron entradas animadas al hacer scroll, navegación translúcida con sección activa, cifras que ruedan hasta su valor real y una bitácora animada (motion.js), todo respetando prefers-reduced-motion."),
  p("Se corrigió un error real: line-vision.js redeclaraba constantes globales de camera-stream.js y no corría, de modo que el botón «Iniciar visión de línea» no hacía nada; ahora vive en su propio ámbito."),

  h2("5.5 Documentación de punta a punta (8 de octubre)"),
  p("Se documentó Aether completo y se dejó un dictado sin símbolos (AETHER_DICTADO.txt) pensado para que ElevenLabs lo narre sin tropezar con puntuación o caracteres especiales. El texto completo quedó en AETHER_COMPENDIO.md."),

  h2("5.6 Sitio público, dominio y seguridad (16 y 17 de octubre)"),
  p("Se trabajó el sitio público en el dominio aethermx.online. Los cambios del repositorio fueron:"),
  bullet("Se quitó la cámara en vivo del dominio público y se agregó la sección Alianzas; después se quitó también la cámara del dominio y la solicitud de demo quedó como un correo a Mario."),
  bullet("Cierre de cámara, pistón y banda cuando la petición no viene del laboratorio, para que desde internet no se pueda operar nada."),
  bullet("La regla de nginx y Cloudflare para el dominio público, y la CSP de nginx alineada con el encabezado que va en Cloudflare."),
  bullet("Se quitó de la meta CSP lo que el navegador ignora (frame-ancestors dentro de una meta, y connect-src hacia Google Fonts, que entra por style-src y font-src)."),
  bullet("«Pedir demo» abre Gmail en lugar de un enlace mailto."),
  bullet("Ajustes para iPhone: no se carga el título animado, la línea de manufactura se deja en tarjetas y se agregó una simulación de funcionamiento a 2x debajo de la portada (se quitaron las notas de pie y el aviso de desplazar)."),
  bullet("Se documentó el alta de Cloudflare, el correo y la revisión del laboratorio: docs/security/runbook-cloudflare.md y docs/security/laboratorio.md."),
  p("Lo comprobado antes de poner Cloudflare: curl -I https://aethermx.online responde Server: GitHub.com y no envía HSTS, CSP, nosniff, Referrer-Policy ni Permissions-Policy, como se esperaba; y las rutas /.env, /.git/config, /perception/stream, /line/cell/run, /robot/ask e /inventory responden 404 de GitHub, no del API."),
  calloutPending("los pasos de panel quedan pendientes y manuales, según docs/security/reporte.md: alta del dominio en Cloudflare Free y cambio de nameservers en Hostinger, SSL Full (strict), HSTS a 6 meses sin preload, Transform Rule de reporte y luego de enforce, Bot Fight Mode y regla de 50 peticiones cada 10 segundos, registros DMARC y DKIM, y la lista del laboratorio en el router. Hasta que cambien los nameservers el dominio sigue sin esos encabezados. Securityheaders.com, SSL Labs y el iframe desde otro origen no se pueden cerrar hasta entonces."),

  h2("5.7 Celda, Lumina de escritorio, carrito 3D y video (21 de octubre)"),
  p("El commit «Agrega la celda, Lumina y el carrito 3D al repo» incorporó el trabajo que vivía fuera del control de versiones: la celda de manufactura (cell_hmi.py, cell_line.py, cell_simulator.py, cell_routes.py), el almacén de datasets (dataset_store.py), Lumina de escritorio (lumina_desktop.py), la lista de permitidos del backend (allowlist.json), la plantilla institucional del informe (plantilla_utech.docx), los documentos de contexto ActFinal.md, HANDOFF_LUMINA.md y URLS_Y_COMANDOS.md, y el proyecto aether-video (video promocional hecho con Remotion, con su reproductor, escenas, pruebas del reproductor y mediciones de latencia de Lumina en aether-video/phase0). La carpeta docs/hardware reúne la guía de construcción, el datasheet de conexión de la celda y los documentos de montaje."),
  p("En la misma fecha se hicieron ajustes de compatibilidad con el Jetson: se usa timezone.utc en lugar de datetime.UTC para que el backend corra en Python 3.10, y se bajó el target-version de ruff a py310 en backend y edge."),

  h2("5.8 Primer contacto con el hardware real: el Jetson Orin Nano Super (21 de octubre)"),
  p("La bitácora de hardware real registra cinco sesiones el 21 de octubre. Quién ejecutó cada cosa está anotado en la bitácora: Claude trabajó en la laptop y Mario ejecutó los comandos en el Jetson y reportó los resultados."),
  table([1500, 7780], ["SESIÓN", "QUÉ PASÓ"], [
    ["1", "Preparar el código para Python 3.10 (solo laptop): timezone.utc y target-version de ruff."],
    ["2", "Reconocimiento del Jetson en modo lectura: sistema, versiones, RAM, disco, modos de energía; hay una cámara USB UVC y ninguna CSI; el repositorio se clonó; PyTorch no estaba instalado. Se registró el problema de desconexiones de SSH."],
    ["3", "Paquetes base y cámara; investigación de libcusparseLt para CUDA 12.6; se agregó requirements-jetson.txt y COMANDOS_LINUX.md. Se anotó como pendiente repetir FPS, exposición y calidad de imagen con buena luz y la cámara en su posición final."],
    ["4", "libcusparseLt 0.6.2.3 instalada (reportado por Mario). Hallazgo: ultralytics-thop arrastraba torch, así que se sacó de los requisitos. Bloque 2: se instalaron los requisitos y se corrigió numpy (se pide numpy>=1.23,<2). Bloque 3: PyTorch de NVIDIA funciona."],
    ["5", "El backend corre en el Jetson, en el puerto 8001 por cable. Se leyó el código de la celda para saber si ARRANQUE o PARO pueden mover algo físico y se registraron hallazgos a atender antes de conectar cableado real."],
  ]),
  tableCaption("5.1", "Sesiones de la bitácora del Jetson, 21 de octubre."),
  p("Resultado más importante: PyTorch con CUDA funciona en el Jetson (torch 2.5.0a0+872d972e41.nv24.08, torch.cuda.is_available() = True, CUDA 12.6, L4T 36.4.7), con una operación de matmul 512x512 en GPU. Es un resultado reportado y limitado: no se probó con YOLO ni bajo carga prolongada."),
  p("Hallazgo de la sesión 5: el dashboard de visión de línea transmitía a 2304x1536 porque no estaban definidas las variables de V4L2. Para corregirlo se agregaron variables opcionales de backend de captura, FOURCC, ancho y alto a la cámara (PERCEPTION_* y LINE_VISION_*), con pruebas; el siguiente paso de Mario fue reiniciar con V4L2, MJPG, 640x480. También se documentó una alarma esperada («Enlace PLC perdido», porque no hay PLC) y que la sesión admin/admin del panel de la celda existía; después esa contraseña se sacó del código y la celda pasó a pedir CELDA_HMI_CLAVE por entorno."),
  p("Problema abierto registrado: ningún navegador abría en el Jetson en ese momento. Se anotó como riesgo para Lumina y se sumaron opciones al borrador de la ADR 0011. Se agregó además docs/jetson/SETUP_JETSON.md (252 líneas) y se actualizó COMANDOS_LINUX.md con lo verificado ese día."),

  h2("5.9 Agentes de campo: ADR 0012 y bloques R0 a R6 (22 de octubre)"),
  p("Mario rechazó dejar la cámara del Jetson para una «etapa 2», así que la decisión final (docs/auditoria/DECISION_FINAL_AGENTES.md) fue procesar y mostrar cada cámara en su propio equipo. Se implementó en la rama jetson-agente, en bloques pequeños que se pueden revertir uno por uno con git revert."),
  table([1500, 7780], ["BLOQUE", "QUÉ HACE"], [
    ["Agente de la celda (Pi)", "backend/celda_agent.py: un programa aparte para la Raspberry Pi 4 que solo lleva la celda (cámara, visión, pulsos, alarmas, celda.html), sin importar main.py ni cargar Lumina ni torch. Para ello se extrajeron de main.py, sin cambiar su comportamiento, las rutas de la celda (cell_routes.py) y las opciones de cámara. El modelo corre en ONNX con cv2.dnn (line_model.py)."],
    ["R0", "ADR 0012 y contratos JSON de los agentes y del canal de voz (contracts/agents_api.md): decisión, alternativas, riesgos y modelo de amenazas."],
    ["R1 + R2", "Agente del Jetson (aether_agent.py, puerto 8001): abre su cámara, corre YOLO + códigos + ArUco, sirve el video anotado y manda a la laptop solo observaciones JSON con un ID por evento; la laptop las acepta una sola vez cada una (idempotencia). La percepción se extrajo de main.py a perception_pipeline.py. La página lee la dirección del video con GET /config/agents; si el que mira es el mismo equipo, la dirección sale como 127.0.0.1 y el video no sale de ese equipo. Guardas de red local (lan_guard.py) y CSP ampliada solo con los agentes configurados."],
    ["R3", "Servicio de voz de la laptop (backend/voice/): micrófono local, reconocimiento en español sin internet (Vosk) y envío de solo texto por WebSocket a las páginas de Lumina; aviso persistente, notificación de Windows, interruptor de privacidad y anti-eco. Sin audio en disco ni fuera de la laptop."],
    ["R4", "Arranque: iniciar_aether.ps1 (laptop), iniciar-agente.sh y detener-agente.sh (Jetson por tmux) y ver-aether.sh. El arranque manual anterior se conserva."],
    ["R5", "La celda de la Pi con el mismo patrón y sin GPIO: video propio, /status y eventos de pieza con ID hacia la laptop."],
    ["R6", "Documentación: decisión final, guía de arranque, tabla de variables de entorno, trazabilidad de requisitos, registro de riesgos y bitácora."],
  ]),
  tableCaption("5.2", "Bloques de la rama jetson-agente."),
  p("Descartado a propósito, y registrado en la decisión: TensorRT (no se puede sostener ni documentar sin medir en el Jetson), systemd, WebRTC/RTSP, MQTT, ROS 2, Docker, Tailscale y una aplicación nativa."),
  p("Cifras de la prueba del agente de la celda, medidas en la laptop con cámara web y OpenCV 5.0, no en la Pi: mismo juicio PASS/FAIL que parts.pt con ultralytics en 19/19 fotos del dataset (IoU de la caja principal: media 0.994, mínima 0.983); carga de CPU con la cámara abierta y sin nadie viendo el video: 381 % de un núcleo con el pipeline anterior de main.py (dos modelos YOLO por cuadro, unos 6 análisis por segundo) contra 18 % con el agente nuevo (2 análisis por segundo). El dataset solo tiene fotos de piezas registradas, así que el FAIL real no se midió con este modelo."),
  p("Un hallazgo que cambió el diseño: con DirectShow en Windows, cap.grab() no espera al siguiente cuadro y daba 1.5 millones de vueltas por segundo ocupando un núcleo entero; se usa read(), que sí bloquea en todos los sistemas, y solo el análisis se limita por intervalo (LINE_ANALISIS_CADA_S, 0.5 s por defecto)."),
  table([2400, 6880], ["REGISTRO DE RIESGOS", "MITIGACIÓN REGISTRADA"], [
    ["Windows suspende la red o la laptop", "Plan de energía en «Nunca»."],
    ["La red de la universidad bloquea el tráfico entre equipos", "USB-C RNDIS de respaldo; ver-aether.sh prueba varias IP."],
    ["Eco: Lumina se oye a sí misma", "Pausa mientras habla, cola de 0.8 s y audífonos."],
    ["FPS limitados por la cámara con poca luz", "/status separa FPS de cámara, de entrega e inferencia, para ver que es la cámara."],
    ["El navegador bloquea el video del agente por la CSP", "CSP ampliada solo con los agentes configurados (después se descubrió un caso más, sección 5.11)."],
    ["Un equipo de la subred inyecta observaciones o texto falsos", "Solo red local, sin autenticación: aceptado y documentado en la ADR 0012."],
    ["Un reinicio de la laptop repite una observación ya contada", "Límite conocido: los ID viven en memoria."],
  ]),
  tableCaption("5.3", "Riesgos principales del registro de la rama jetson-agente."),

  h2("5.10 Voz: palabra de activación «Lumina» (23 de octubre)"),
  p("Mario reportó que Vosk (modelo vosk-model-small-es-0.42) escribía «nómina», «luz mina», «lumínica», «luminoso» o «mina» en lugar de «Lumina». La causa se comprobó con el modelo real: «lumina», «lumia» y «luminia» no están en su vocabulario, así que no puede escribirlas, diga lo que diga la persona. Por eso la coincidencia exacta de robot.js (LUMINA_PATTERN) nunca activaba: con voz sintética limpia, 0 de 30 frases."),
  bullet("Reescritura tolerante al inicio de la frase en el servicio de voz (backend/voice/wake.py), que se apaga con AETHER_VOICE_WAKE_FUZZY=0. robot.js no cambió."),
  bullet("El texto sale cuando Vosk cierra la frase, no cuando termina el umbral de energía."),
  bullet("Tecla w en la consola de voz para despertar a Lumina a mano; variable opcional AETHER_VOICE_WHISPER_PROMPT."),
  bullet("Scripts de medición: grabar_pruebas.py, comparar_motores.py, voz_sintetica.ps1 y los experimentos de palabras alternativas."),
  bullet("Documento docs/auditoria/PALABRA_CLAVE.md con la causa, las tres opciones evaluadas y las cifras."),
  p("Resultado medido con voz sintética de Windows (una sola voz) y ruido simulado: en silencio pasó de 0/30 a 28–30/30; con murmullo a +10 dB, de 2 a 11 de 30; el costo es que los falsos positivos pasaron de 1/25 a 4/25. faster-whisper no se midió porque instalarlo lo decide Mario. Nada se midió con la voz ni el ruido reales."),
  p("Una corrección propia registrada en la bitácora: scripts/probar_voz.py imprimía siempre «memoria del proceso: 0.0 MB» en Windows porque el handle se truncaba; se corrigió y se agregó una prueba. Las cifras de memoria del script entregado antes no valen."),

  h2("5.11 Primeras pruebas reales y correcciones (23 de octubre)"),
  h3("Video del agente bloqueado por la CSP"),
  p("En la primera prueba real del agente en el Jetson, reportada por Mario, el agente funcionó (29.0 FPS de cámara, 29.1 de entrega, 640x480, inferencia 68.0 ms, laptop alcanzable, /stream con respuesta 200), pero la cámara no se mostró en la página: Firefox bloqueó la imagen por img-src. Comprobado en la laptop con el servidor real: el encabezado del servidor sí traía los orígenes del agente, pero dashboard/index.html tiene su propia etiqueta meta con la CSP, y el navegador aplica ambas políticas a la vez, ganando la más estricta. Corrección: el servidor entrega index.html con la misma lista exacta de orígenes en su meta; sin agente configurado el archivo sale idéntico. Los tres scripts de video ahora distinguen «bloqueado por la política de seguridad» de «cámara o agente no disponible» (dashboard/stream-errors.js). Las pruebas nuevas fallan con el código anterior y pasan con el nuevo."),
  h3("Direcciones por nombre de host y pruebas del JavaScript"),
  p("Si el agente se escribe como nombre (por ejemplo mario-desktop.local), agent_config.py lo compara con las IP a las que apunta (caché de 60 s) para seguir sirviendo el video por 127.0.0.1 cuando mira el mismo equipo. La resolución real depende de la red y no está verificada. Se agregaron pruebas del JavaScript del dashboard en Node con DOM simulado (tests/dashboard: puente de voz de robot.js, reconexión y los tres scripts de video: agente configurado, sin configurar, esquema peligroso y versión desconocida), la hoja docs/auditoria/MANANA.md con el plan de prueba de una página, y una línea de .gitignore para ~/.aether-agent.env."),
  h3("Observaciones en lotes"),
  p("Con detecciones continuas (alrededor de 12 por segundo) cada observación despertaba al hilo y salía en su propio POST. Ahora se juntan las del intervalo (AETHER_OUTBOX_INTERVAL_S, 1 s por defecto; 0 equivale a inmediato; un lote lleno sale sin esperar). No cambia qué se manda ni el inventario."),
  h3("Audio de Lumina bloqueado por media-src"),
  p("Firefox del Jetson bloqueó blob: (los MP3 de ElevenLabs que reproduce robot.js) y data:audio/mp3 (un MP3 mudo del reproductor empaquetado en call-screen.js). Causa comprobada leyendo el código: media-src 'self' estaba tanto en el encabezado (backend/public_guard.py) como en la meta de index.html. El fetch a /robot/tts no falló; el servidor devolvió audio y la CSP impidió reproducirlo. Corrección: media-src 'self' blob: data: en ambos sitios, sin tocar script-src, connect-src ni img-src, con una prueba nueva que lo comprueba."),

  h2("5.12 Estado de verificación"),
  table([2500, 3700, 3080], ["CAMBIO", "QUÉ SE COMPROBÓ", "QUÉ NO"], estadoRows),
  tableCaption("5.4", "Qué se comprobó y qué no, por cambio."),
  p("Verificaciones manuales que quedan en manos de Mario (docs/auditoria/TRAZABILIDAD.md, sección 2): V1 FPS del agente en el Jetson; V2 y V3 que la página muestre el video del Jetson y que las observaciones lleguen al inventario; V4 regla de firewall solo Privado; V5 a V10 micrófono, latencia del reconocedor, voz de punta a punta, aviso de Windows, icono de micrófono y eco; V11 Firefox con HDMI; V12 y V13 «Lumina» con su voz y su ruido, y Whisper contra Vosk con sus grabaciones."),

  h2("5.13 Decisiones arquitectónicas posteriores al corte"),
  table([1300, 900, 4380, 2700], ["ADR", "FECHA", "TEMA", "ESTADO"], decisionRows),
  tableCaption("5.5", "ADR agregadas después del corte del informe."),

  h2("5.14 Pendientes y riesgos abiertos"),
  bullet("Pi real: sistema operativo, Python ≥ 3.10, medir el ONNX con la versión de OpenCV de la Pi (Bookworm trae 4.6; aquí se probó con 5.0), cámara V4L2 y estado seguro de los pines con LED o multímetro antes de cualquier carga. Solo entonces, gpiod. Hoy el cableado de la celda está fuera de alcance por regla de seguridad."),
  bullet("Medir en el Jetson con buena luz y la cámara en su posición final (FPS, exposición, calidad de imagen) y decidir TensorRT con datos."),
  bullet("Falta repetir en el navegador del Jetson las correcciones de CSP (recargar con Ctrl+F5 tras reiniciar el servidor) y comprobar que la clave de ElevenLabs sea válida y tenga créditos."),
  bullet("Voz: probar con el micrófono real, la voz de Mario y el ruido de la universidad; decidir si se instala Whisper."),
  bullet("Definir CELDA_HMI_CLAVE en backend/.env: sin ella nadie inicia sesión en la celda y Arranque/Paro no responden."),
  bullet("Persistir en disco los event_id de las observaciones; autenticación de los agentes si el proyecto sale del laboratorio; systemd si el agente resulta estable."),
  bullet("Aceptación de la ADR 0012 por Mario y push de la rama jetson-agente: al corte de este informe no se había hecho push."),
  bullet("Cloudflare: los pasos manuales listados en la sección 5.6."),
  bullet("Dos pruebas de Lumina en test_main.py siguen fallando (test_robot_ask_conserva_varias_oraciones_reales_tras_filtrar y test_robot_ask_lista_numerada_tambien_se_detecta); ya fallaban antes de estos cambios y no se tocaron."),
  bullet("Actualizar los capítulos 2, 3 y 4 de este informe para que ya no describan los brazos KUKA y UR5 ni digan que no hay hardware instalado."),

  new Paragraph({ children: [new PageBreak()] }),
  h2("Anexo A. Registro completo de commits posteriores al corte"),
  p("Los 49 commits del repositorio desde la generación de este informe (7d89940, 2 de septiembre de 2026) hasta el 23 de octubre de 2026, en orden cronológico."),
  table([1100, 1300, 6880], ["COMMIT", "FECHA", "DESCRIPCIÓN"], commits.map(([h, d, s]) => [h, d, s]), true),
  tableCaption("A.1", "Historial de commits después del corte del informe."),
];

module.exports = { capitulo5 };
