const fs = require("fs");
const path = require("path");
const B = require("./build.js");
const {
  C, A, h1, h2, h3, p, pRuns, bullet, figure, calloutPending, tableCaption,
  codeBlock, codeCaption,
  headerCell, Table, TableRow, TableCell, WidthType, Paragraph, PageBreak,
} = B;

const FOLDER_TREE = fs.readFileSync(path.join(__dirname, "_generated_tree.txt"), "utf-8").replace(/\n$/, "");

const epRows = [
  ["GET", "/health", "Verificación de estado del servicio.", '{"status": "ok"}'],
  ["GET", "/inventory", "Inventario declarado; filtra status=\"active\" por defecto (include_retired=true para ver todo).", "Lista de DeclaredEntry"],
  ["PATCH", "/inventory/{identifier}/retire", "Cambia el estado a \"retired\". Nunca borra la fila. Requiere password contra ADMIN_ACTION_PASSWORD.", "200 / 403 / 404"],
  ["GET", "/inventory/history", "Bitácora completa, ordenada por fecha de registro descendente.", "Lista de history rows"],
];

function endpointTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1000, 3200, 4200, 1900],
    rows: [
      new TableRow({ tableHeader: true, children: [headerCell("MÉTODO"), headerCell("RUTA"), headerCell("DESCRIPCIÓN"), headerCell("RESPUESTA")] }),
      ...epRows.map(([m, r, d, resp]) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({ margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: m, font: "IBM Plex Mono", bold: true, size: 18, color: C.violetDark })] })] }),
          new TableCell({ margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: r, font: "IBM Plex Mono", size: 17, color: C.ink })] })] }),
          new TableCell({ margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: d, font: "IBM Plex Sans", size: 18, color: C.body })] })] }),
          new TableCell({ margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ children: [new B.TextRun({ text: resp, font: "IBM Plex Mono", size: 16, color: C.muted })] })] }),
        ],
      })),
    ],
  });
}

const CODE_PERCEPCION = `aruco_corners, aruco_ids, _ = aruco_detector.detectMarkers(frame)
location_marker_id = int(aruco_ids.flatten()[0]) if aruco_ids is not None else None
if aruco_ids is not None:
    cv2.aruco.drawDetectedMarkers(frame, aruco_corners, aruco_ids)

results = model(frame, verbose=False)

for box in results[0].boxes:
    x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
    class_name = model.names[int(box.cls[0])]
    confidence = float(box.conf[0])

    # Recorte de la caja delimitadora: pyzbar solo busca código
    # dentro de la región de este objeto, no en el frame entero.
    crop = frame[y1:y2, x1:x2]
    codes = decode(crop) if crop.size > 0 else []
    data = codes[0].data.decode("utf-8") if codes else None

    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
    # ... cv2.putText de clase y código (omitido aquí, ver archivo real) ...

    observations.append(
        Observation(
            timestamp=datetime.now(UTC).isoformat(),
            detected_class=class_name,
            code_data=data,
            code_read=bool(codes),
            confidence=confidence,
            location_marker_id=location_marker_id,
        )
    )`;

const CODE_INVENTORY = `def aggregate(observations: list[dict]) -> list[DeclaredEntry]:
    """Agrupa Observations crudas en DeclaredEntry — función pura.

    No lee ni escribe archivos: recibe una lista de Observations (como
    dicts, con las mismas claves que produce edge/perception/test_combined.py)
    y regresa la lista de DeclaredEntry resultante, ordenada por identifier.
    """
    groups: dict[str, list[dict]] = {}
    for observation in observations:
        groups.setdefault(_group_key(observation), []).append(observation)

    entries = []
    for identifier, group in sorted(groups.items()):
        class_counts = Counter(o["detected_class"] for o in group)
        most_common_class = class_counts.most_common(1)[0][0]
        timestamps = sorted(o["timestamp"] for o in group)
        location_counts = Counter(_location_key(o) for o in group)

        entries.append(
            DeclaredEntry(
                identifier=identifier,
                detected_class=most_common_class,
                total_observations=len(group),
                code_read_count=sum(1 for o in group if o["code_read"]),
                avg_confidence=sum(o["confidence"] for o in group) / len(group),
                first_seen=timestamps[0],
                last_seen=timestamps[-1],
                location_counts=dict(location_counts),
            )
        )

    return entries`;

const CODE_BACKEND = `@app.patch("/inventory/{identifier}/retire")
def retire_inventory_entry(identifier: str, body: RetireRequest):
    """Marca una entrada de Declared Inventory como "retired".

    [...] Requiere esta llamada explícita, hecha por una persona. Nunca
    ocurre automáticamente por ausencia en una corrida de load_from_edge.py.

    Retirar es un cambio de estado, no un borrado: la fila sigue existiendo
    y sigue siendo consultable vía GET /inventory?include_retired=true — el
    historial nunca se pierde.
    """
    if body.password != ADMIN_ACTION_PASSWORD:
        raise HTTPException(status_code=403, detail="Contraseña incorrecta.")

    session = SessionLocal()
    try:
        entry = session.get(DeclaredEntry, identifier)
        if entry is None:
            raise HTTPException(
                status_code=404,
                detail=f"No existe Declared Inventory con identifier '{identifier}'.",
            )
        entry.status = "retired"
        session.commit()
        return {"identifier": entry.identifier, "status": entry.status}
    finally:
        session.close()`;

const CODE_DASHBOARD = `function renderDelta(current, previousRun) {
  // previousRun: null si no hay corrida anterior (nada que comparar); Map
  // (identifier -> fila) de la corrida anterior en caso contrario — puede
  // no incluir este identifier si es nuevo en esta corrida.
  if (previousRun === null) return "";

  const previousRow = previousRun.get(current.identifier);
  if (!previousRow) return '<span class="delta delta--new">nuevo</span>';

  const diff = current.total_observations - previousRow.total_observations;
  if (diff === 0) return '<span class="delta delta--flat">sin cambio</span>';
  const sign = diff > 0 ? "+" : "";
  return \`<span class="delta delta--changed">\${sign}\${diff}</span>\`;
}`;

const CODE_LINEA = `def _mjpeg_line_vision_frames(cap, model):
    """Generador MJPEG de confirmación binaria — mucho más simple que
    _mjpeg_frames: no lee código de barras ni ArUco, solo dice si hay o no
    algún objeto detectado en el frame ("PIEZA DETECTADA" / "SIN PIEZA")."""
    import cv2

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame, verbose=False)
            piece_detected = len(results[0].boxes) > 0
            label = "PIEZA DETECTADA" if piece_detected else "SIN PIEZA"
            color = (0, 200, 0) if piece_detected else (0, 140, 255)  # BGR

            cv2.putText(frame, label, (24, 48), cv2.FONT_HERSHEY_SIMPLEX, 1.1, color, 3)

            ok, buffer = cv2.imencode(".jpg", frame)
            if not ok:
                continue
            yield (b"--frame\\r\\nContent-Type: image/jpeg\\r\\n\\r\\n" + buffer.tobytes() + b"\\r\\n")
    finally:
        cap.release()`;

const capitulo3 = [
  h1("CAPÍTULO 3. EJECUCIÓN DEL TRABAJO", "3"),

  h2("3.1 Enfoque de ejecución"),
  p("Un proyecto integrador de mecatrónica no es solo software: Aether tiene un frente físico (diseño mecánico y CAD, diagramas eléctricos, planos técnicos, ensamblaje y montaje de la celda de manufactura), un frente de software (percepción, inventario, backend, dashboard) y, entre ambos, el cómputo de borde que corre ese software sobre el hardware del robot móvil. A la fecha de este reporte el frente de software tiene implementación real y verificable sobre hardware de desarrollo; el frente físico depende de taller, CAD y hardware que el equipo todavía no ha documentado formalmente, y el cómputo de borde tiene su especificación decidida (Decisión 4) pero no el dispositivo físico en mano. Cada frente se documenta a continuación por separado, con su alcance real — sea ese alcance mucho o solo un párrafo y un pendiente."),

  h2("3.2 Diseño mecánico y CAD"),
  calloutPending("el diseño mecánico y los modelos CAD del robot móvil Aether Inventory y de los soportes/fijaciones de la celda de manufactura todavía no se han documentado formalmente en el repositorio — rol asignado a Isaac dentro del equipo. No hay archivos CAD, renders ni especificación mecánica que reportar como reales todavía."),

  h2("3.3 Diagramas eléctricos"),
  calloutPending("los diagramas eléctricos del robot móvil (distribución de alimentación, cableado de motores y sensores) y de la celda de manufactura todavía no se han documentado formalmente — rol asignado a David dentro del equipo. hardware/wiring/ existe en el repositorio como espacio reservado (ver estructura de carpetas, 3.10) pero sigue vacío."),

  h2("3.4 Diagramas neumáticos"),
  p("No aplica todavía. Ninguna decisión cerrada del proyecto (Tabla 1, Capítulo 2) especifica un actuador neumático: el KUKA KR6 y el UR5 son brazos eléctricos programados por su controlador nativo (KRL / URScript-PolyScope, sub-decisión 8b), y el tipo de efector final (gripper) que montará cada uno todavía no está decidido ni documentado en hardware/bom/ ni en ningún ADR. Si en una evolución futura el equipo decide un gripper neumático para alguno de los dos brazos, esa decisión debe documentarse primero como una actualización explícita (aether_context_docs.md, sección 9) antes de que exista un diagrama neumático que reportar aquí — no se fabrica un diagrama de un sistema que el proyecto no ha decidido tener (Principio 4.5)."),

  h2("3.5 Planos técnicos y diseño 3D"),
  calloutPending("los planos técnicos acotados y los modelos 3D del robot móvil y de la celda de manufactura dependen del diseño mecánico y CAD (3.2), que todavía no existe formalmente. No hay planos que reportar como reales todavía."),

  h2("3.6 Ensamblaje y construcción del robot móvil Aether Inventory"),
  calloutPending("el ensamblaje físico del robot móvil depende del chasis, los motores, los encoders y el diseño mecánico (3.2), ninguno de los cuales está todavía en manos del equipo. Hoy Aether Inventory existe solo como el software de percepción e inventario (secciones 3.11 y 3.14), corriendo en modo demo sobre una laptop, no como una unidad móvil física construida."),

  h2("3.7 Montaje de la celda de manufactura completa"),
  calloutPending("el montaje físico de las cuatro estaciones de la línea de manufactura (KUKA KR6, UR5, visión de línea y Aether Inventory, ver ADR 0008) depende de la llegada de ambos brazos robóticos y del robot móvil ya ensamblado (3.6), ninguno de los cuales está instalado físicamente todavía. El protocolo de enlace entre estaciones ya está decidido y su parte de software — sin la celda física detrás — se documenta por separado en 3.17."),

  h2("3.8 Cómputo de borde — Jetson Orin Nano Super"),
  p("La Decisión 4 (Tabla 1, Capítulo 2) especifica el NVIDIA Jetson Orin Nano Super 8GB (67 TOPS, GPU Ampere) como cómputo de borde principal — el dispositivo que, montado en el robot móvil, ejecutará el pipeline de percepción (YOLO + código de barras/QR + ArUco) en producción real. Contingencia ya decidida si el Jetson no está disponible a tiempo: Raspberry Pi 5 + AI HAT+ (26 TOPS). Ninguno de los dos está en manos del equipo al momento de este reporte; por eso el pipeline de percepción corre hoy en modo demo sobre la CPU de una laptop de desarrollo (ver 3.11), no sobre el hardware de borde real."),
  p("El control de bajo nivel (motores, PWM por hardware, watchdog de seguridad) es un cómputo distinto y no corre en el Jetson: un ESP32 o STM32 no tiene GPU y no puede ejecutar YOLO (Decisión 4), por lo que su función se limita a esa capa de bajo nivel — ver la distinción entre firmware/ y edge/ en la estructura de carpetas (3.10)."),
  bullet("Instalar NVIDIA JetPack sobre el Jetson, con su propia build de PyTorch/OpenCV — distinta a la build de CPU que usa hoy la laptop de desarrollo (edge/README.md ya advierte que no se debe asumir compatibilidad sin verificarla)."),
  bullet("Migrar el pipeline de percepción (edge/perception/) del modo demo de escritorio al Jetson montado físicamente en el robot móvil."),
  bullet("Retirar PERCEPTION_CAMERA_INDEX y LINE_VISION_CAMERA_INDEX de backend/main.py — hoy existen solo porque Percepción y Visión de línea comparten la única cámara de la laptop de desarrollo (ver 3.10 y 3.16); con el Jetson en el robot móvil y una PC de escritorio dedicada a Visión de línea (ADR 0008c), cada proceso tendría su propia máquina real y dejaría de necesitar diferenciarse por índice de cámara."),
  bullet("Verificar que el pipeline combinado (YOLO + pyzbar + ArUco) corra a una tasa de fotogramas aceptable sobre la GPU Ampere del Jetson, en vez de la CPU actual."),
  calloutPending("lo anterior es un plan, no un hecho: el Jetson Orin Nano Super (o su contingencia) todavía no está en manos del equipo, y ninguno de los cuatro puntos de arriba se ha ejecutado todavía."),

  h2("3.9 Arquitectura general de software"),
  p("La arquitectura del sistema se organiza como una tubería lineal desde el robot hasta el dashboard (Figura 1). Cada etapa se probó de forma independiente antes de integrarse con la siguiente, siguiendo el principio de desarrollo por módulos del proyecto: ningún módulo se integra con el siguiente sin haberse probado primero de forma aislada."),
  ...figure(A("diagram_architecture.png"), 560, 216, "1", "Arquitectura general del sistema Aether, de sensores a dashboard."),

  h2("3.10 Estructura de carpetas"),
  p("El repositorio es un monorepo diseñado, desde el día uno, para que el módulo de manipulación (línea de manufactura) tenga espacio de primera clase sin forzar su implementación temprana: las carpetas de manipulación, firmware y hardware existen aunque su hardware real todavía no llega, y varias siguen intencionalmente vacías — una carpeta vacía con un README explicando por qué no es lo mismo que una carpeta olvidada. El árbol de la Figura de abajo se generó recorriendo el repositorio real al momento de este reporte (excluyendo entornos virtuales, cachés y archivos __init__.py repetitivos, para que quepa en una página), no se escribió a mano."),
  codeBlock(FOLDER_TREE),
  codeCaption("1", "Árbol real del repositorio (raíz, y subcarpetas de edge/ y backend/), generado al momento de este reporte."),

  h3("backend/ y edge/ — por qué tienen entornos virtuales separados"),
  p("edge/ y backend/ cada uno declara su propio .venv/ y su propio requirements.txt (edge/README.md, backend/README.md) porque corren en hardware distinto en producción real: edge/ es el software que eventualmente corre en el Jetson Orin Nano Super montado en el robot móvil (Decisión 4, 3.8), con builds de PyTorch/OpenCV empaquetadas por NVIDIA JetPack; backend/ corre en un servidor o laptop convencional. Mezclar sus dependencias en un solo entorno arriesgaría asumir que un wheel compilado para esta laptop de desarrollo (CPU, Windows) sirve igual en el Jetson (ARM64, CUDA) sin haberlo verificado — exactamente el tipo de suposición no verificada que el proyecto evita (Principio 4.5). Por eso edge/requirements.txt instala torch aparte, apuntando al índice CPU oficial, con una nota explícita de no reusar ese mismo procedimiento en el Jetson sin comprobarlo."),
  p("Dentro de edge/, la carpeta perception/ es la única con lógica real hoy: los scripts test_camera.py, test_yolo.py, test_barcode.py y test_aruco.py verifican cada pieza del pipeline de forma aislada, test_combined.py es el pipeline combinado real (Código 2, sección 3.11), test_detection_rate.py mide tasa de detección, y generate_aruco_markers.py generó los PNG reales en aruco_markers/ que usa el equipo para las pruebas de localización. inventory_engine/ también es real (Código 3, sección 3.14). El resto de edge/ — comms/, navigation/, manipulation/ — son paquetes de Python ya andamiados (con su .gitkeep o su README) pero sin lógica todavía, a la espera de hardware: comms/mqtt_client/ y comms/safety_independent_stop/ esperan el microcontrolador de bajo nivel; navigation/waypoints/, odometry/ y obstacle_detection/ esperan el chasis, los motores y los encoders del robot móvil."),
  p("Dentro de edge/manipulation/, arm_control/kuka_kr6/ y arm_control/ur5/ están deliberadamente vacías salvo su README: por la sub-decisión 8b de ADR 0008, la trayectoria de cada brazo se programa directamente en su controlador nativo (KRL / URScript-PolyScope) y nunca vive en este repositorio — lo único que vivirá aquí es el disparo externo simple (I/O digital o puente MQTT→I/O) una vez que el equipo confirme qué interfaz de E/S exponen los brazos reales. task_planning/ y lfd/ (con sus subcarpetas pose_estimation/, segmentation/ y demonstration_capture/) llevan cada una un README.md que explica que quedaron fuera de alcance del MVP por ADR 0008 — sin planeador de tareas propio ni Learning from Demonstration — y que reabrir esa decisión requeriría una ADR nueva, no una implementación directa ahí."),

  h3("firmware/ y hardware/ — vacías a propósito, no basura sin limpiar"),
  p("firmware/motor_control/, firmware/pwm_drivers/ y firmware/safety_watchdog/ solo contienen un .gitkeep: son el espacio reservado para el código del ESP32 o STM32 (Decisión 4) que hoy el equipo todavía no tiene instalado — control de bajo nivel, PWM por hardware y el watchdog de seguridad independiente de red (Decisión 6). De la misma forma, hardware/bom/ y hardware/wiring/ esperan el bill of materials y los diagramas de cableado reales (3.3), que solo tienen sentido una vez comprado el hardware. Ambas carpetas existen ya en el repositorio, en vez de crearse el día que llegue el hardware, siguiendo el mismo principio que manipulation/: reservar el espacio desde el diseño de Fase 0 sin fabricar contenido que todavía no existe."),

  h3("scripts/ (raíz) vs. backend/scripts/"),
  p("scripts/ en la raíz del repositorio está reservada para utilidades que cruzan todo el monorepo — setup, despliegue, tareas que tocarían edge/, backend/ y dashboard/ a la vez — y hoy solo tiene un .gitkeep porque esa necesidad todavía no existe. backend/scripts/load_from_edge.py es distinta a propósito: es un script que solo le concierne a backend/, porque solo toca su base de datos (lee edge/inventory_engine/declared_inventory_output.json y hace upsert en aether.db, más una fila nueva en la bitácora — ver Código 3 y 3.14). No subir load_from_edge.py a la raíz evita sugerir que es una utilidad general del proyecto cuando en realidad es específica del backend."),

  h3("tests/ — por qué manipulation/ está vacía"),
  p("tests/backend/ y tests/edge/ ya tienen pruebas reales (test_main.py con siete pruebas sobre los cuatro endpoints reales del backend, y test_aggregate_observations.py sobre la función aggregate() del Inventory Engine). tests/manipulation/ sigue con solo un .gitkeep, no por descuido, sino porque todavía no hay ninguna lógica de manipulación que probar: por ADR 0008, lo único que eventualmente vivirá en edge/manipulation/ es el disparo I/O hacia cada brazo y el listener MQTT de line_events_listener/, ninguno de los cuales existe todavía. La carpeta de pruebas se reservó desde el diseño de la estructura (aether_context_docs.md, sección 6) para que, cuando esa lógica exista, ya tenga un lugar designado — la misma filosofía de \"espacio reservado desde el día uno\" que aplica a edge/manipulation/ en general."),

  h2("3.11 Percepción"),
  p("El módulo de percepción implementa la Decisión 1 del proyecto: un enfoque híbrido que combina YOLO para la detección y el conteo de objetos con lectura de código de barras o QR para la identidad exacta del producto. El script test_combined.py ejecuta, sobre cada fotograma, tres pasos en orden: detección de marcadores ArUco sobre el fotograma completo, detección de objetos mediante YOLO y, dentro de cada caja delimitadora detectada, un intento de lectura de código mediante pyzbar, acotado a esa región para que el código quede asociado al objeto correcto."),
  p("Cada detección se dibuja con su caja y su clase, tenga o no un código legible asociado, porque la Decisión 1 establece que ninguna detección se descarta. Cada detección genera un registro Observation, sin deduplicar entre fotogramas, con los campos: marca de tiempo, clase detectada, dato del código si se leyó, bandera de lectura, confianza de YOLO e identificador del marcador ArUco visible en ese fotograma. En una corrida de prueba real, el pipeline generó 712 Observations en pocos minutos de operación manual."),
  p("El Código 2 muestra el núcleo real del bucle de detección: por cada caja de YOLO se recorta la región, pyzbar intenta leer un código dentro de ese recorte, y el resultado — con o sin código — se empaqueta como una Observation junto con el marcador ArUco visible en ese mismo fotograma."),
  codeBlock(CODE_PERCEPCION),
  codeCaption("2", "edge/perception/test_combined.py, líneas 104-173 (abreviado) — bucle real de detección combinada."),
  calloutPending("el volumen de Observations crudas no tiene todavía una política de retención ni muestreo; suficiente para verificación puntual, pendiente de definir antes de operación continua real."),
  calloutPending("figura pendiente — un frame real de test_combined.py (o de la captura equivalente sin interfaz gráfica) mostrando YOLO + ArUco + lectura de código a la vez. Se agregará como Figura numerada, con figure(), en cuanto el equipo capture esa evidencia con la cámara física conectada — ver README_CLAUDE_CODE.md sobre cómo agregarla sin dejar este aviso junto a la evidencia real."),

  h2("3.12 Localización"),
  p("Los marcadores ArUco se usan exclusivamente como capa de verificación de posición (Decisión 2), nunca como sistema de navegación. El primer marcador detectado en cada fotograma se asigna como location_marker_id de todas las Observations generadas en ese fotograma."),
  p("Durante las pruebas del módulo se identificó una limitación real del enfoque: con el marcador mostrado en pantalla de celular y reflejo de luz sobre la imagen, el detector reportó identificadores incorrectos pero válidos dentro del diccionario en lugar de fallar de forma explícita, comportamiento esperado de la corrección de errores integrada en ArUco. Esta limitación se documenta como pendiente de mitigación una vez que se definan la iluminación y la ubicación física de los marcadores reales."),

  h2("3.13 Navegación"),
  calloutPending("depende del chasis, los motores y los encoders físicos del robot móvil, que el equipo aún no tiene instalados."),
  p("La Decisión 3 del proyecto establece navegación por waypoints con odometría por encoders y detección reactiva de obstáculos, sin evasión inteligente ni replanificación de rutas. El contrato de estados de cobertura (PARTIAL, COMPLETE, INVALID) que depende de este módulo ya está definido en coverage_states.py, sin usarse todavía — se dejó pendiente a propósito en vez de fabricar esa lógica sin una base de navegación real."),

  h2("3.14 Inventory Engine"),
  p("El módulo de inventario separa dos capas de datos siguiendo la Decisión 5 del proyecto: Observations, el registro crudo de cada detección individual, y Declared Inventory, el resumen procesado que agrupa observaciones en entradas de inventario. La función aggregate() recibe una lista de Observations y agrupa por código de producto exacto cuando existe, o por el prefijo unidentified: seguido de la clase detectada cuando no hay código legible."),
  p("Por cada grupo calcula la clase más frecuente, el total de observaciones, cuántas tenían código legible, la confianza promedio, el rango temporal de primera y última detección y el conteo de observaciones por ubicación. En una corrida real de prueba, 712 Observations se agruparon en 19 entradas de DeclaredEntry. Seis pruebas automatizadas verifican esta función: agrupación por código, prefijo unidentified:, promedio de confianza, orden correcto de primera y última detección con datos desordenados, conteo de lecturas de código y agrupación por ubicación."),
  p("El Código 3 es la función completa tal como vive en el repositorio: pura, sin efectos secundarios (no lee ni escribe archivos), lo que es precisamente lo que permite probarla con las seis pruebas automatizadas mencionadas arriba sin necesitar cámara ni archivos de por medio."),
  codeBlock(CODE_INVENTORY),
  codeCaption("3", "edge/inventory_engine/aggregate_observations.py, función aggregate() completa."),
  p("Una regla explícita del esquema evita que una inspección parcial sobrescriba silenciosamente un inventario declarado previo: el estado de cobertura de cada corrida queda pendiente de implementación hasta que el módulo de Navegación pueda reportar cobertura real."),

  h2("3.15 Backend y comunicaciones"),
  p("El backend, construido en FastAPI (Ramírez, s.f.), expone cuatro rutas reales, resumidas en la Tabla 5."),
  endpointTable(),
  tableCaption("5", "Endpoints reales del backend (FastAPI)."),
  p("La ruta de retiro (Código 4) es la única operación de escritura que expone el backend, y es también la que mejor ilustra el Principio 4.1 del proyecto (no fabricar una garantía de cobertura que el sistema todavía no puede respaldar): retirar una entrada nunca ocurre de forma automática por ausencia en una corrida de carga, solo por esta llamada explícita, hecha por una persona — y ni siquiera entonces borra la fila, solo cambia su estado."),
  codeBlock(CODE_BACKEND),
  codeCaption("4", "backend/main.py, función retire_inventory_entry() — la única escritura real que expone el backend."),
  p("La ruta de retiro está protegida con una contraseña de entorno que el propio proyecto documenta explícitamente como traba anti-clics-accidentales y no como autenticación real, sin usuarios, sesiones ni roles. La comunicación de telemetría del robot está definida para MQTT (Banks et al., 2019) y la del dashboard para REST (Decisión 6), con el comando de parada de seguridad diseñado para ser independiente de la conectividad de red, resuelto por un watchdog de hardware en el microcontrolador."),

  h2("3.16 Dashboard"),
  p("El dashboard se construyó sin frameworks ni herramientas de compilación, con HTML, CSS y JavaScript servidos como archivos estáticos por el propio backend. Sigue una identidad visual definida como \"industrial dark tech\": fondo casi negro, tipografía condensada reservada para títulos de sección, tipografía de cuerpo separada del resto de la interfaz y tipografía monoespaciada reservada para anotación técnica y cifras."),
  p("El color se usa con significado fijo: acento azul-violeta para lo navegable, verde únicamente para lo verificado con hardware real y ámbar para lo pendiente o lo que requiere atención. Las Figuras 3 y 4 muestran la portada real corriendo en esta máquina: el hero con la llamada a acción hacia el sistema, y la franja de módulos con el contador de Declared Inventory obtenido en vivo de GET /inventory — el pie de página de la propia portada aclara que ningún número ahí está escrito a mano (dashboard/portada.js)."),
  ...figure(A("dashboard_hero_real.png"), 560, 223, "3", "Portada real del dashboard (index.html), corrida local del 1 de septiembre de 2026."),
  ...figure(A("dashboard_modules_real.png"), 560, 223, "4", "Franja de módulos de la portada, con \"25 entradas activas\" obtenido en vivo de GET /inventory."),
  calloutPending("figura pendiente — la sección Percepción de la portada (#percepcion) con el stream MJPEG activo mostrando una detección real (caja de YOLO + clase, y el código leído si lo hay). Se agregará como Figura numerada en cuanto se capture con la cámara física conectada."),
  p("El Código 5 es la lógica real detrás de un detalle honesto de la bitácora (Figura 6): cada corrida muestra cuánto cambió cada identifier contra la corrida anterior — \"nuevo\", \"sin cambio\" o un delta con signo — calculado siempre a partir de lo que ya devolvió la API, nunca de un valor asumido en el cliente."),
  codeBlock(CODE_DASHBOARD),
  codeCaption("5", "dashboard/app.js, función renderDelta() — delta real entre corridas de la bitácora."),
  p("La página de inventario (Figura 5) muestra el inventario declarado con sus chips de ubicación y una operación de retiro protegida por contraseña que nunca borra el registro subyacente; el panel de bitácora (Figura 6) agrupa el historial por corrida, con la corrida más reciente expandida por defecto."),
  ...figure(A("inventory_table_real.png"), 560, 223, "5", "Tabla de Declared Inventory (inventory.html) con datos reales de una corrida de test_combined.py."),
  ...figure(A("inventory_history_real.png"), 560, 223, "6", "Panel de bitácora de inspecciones, corrida del 31 de agosto de 2026 expandida."),

  h2("3.17 Línea de manufactura (protocolo y software)"),
  p("El montaje físico de las cuatro estaciones de la línea de manufactura se documenta en 3.7 y todavía no existe; esta sección cubre únicamente el protocolo y el software de enlace entre estaciones, que sí está decidido y parcialmente implementado como demo. La Decisión 8 del proyecto define la integración de las cuatro estaciones mediante un enlace punto a punto entre estaciones (Figura 8), sin orquestador central: el KUKA KR6 coloca la pieza en la banda, el UR5 la ensambla, la visión de línea confirma el resultado de forma binaria y Aether Inventory recoge la pieza terminada. Un listener MQTT registra cada evento como Observation, sin dirigir ninguna parte del proceso."),
  ...figure(A("diagram_manufacturing_line.png"), 560, 160, "8", "Línea de manufactura — enlace punto a punto entre estaciones."),
  p("El control de cada brazo usa programación nativa de fabricante — KRL para el KUKA, URScript o PolyScope para el UR5 — con disparo externo simple por entrada y salida digital o por un puente MQTT hacia I/O."),
  p("De las cuatro estaciones, hoy solo Visión tiene una demo real, reutilizando el mismo stack de percepción ya establecido (YOLO) — consistente con la propia sub-decisión 8c, que exige no introducir una tecnología de visión nueva solo para esta estación. El Código 6 es esa confirmación binaria completa: sin código de barras ni ArUco, solo \"PIEZA DETECTADA\" o \"SIN PIEZA\" según si YOLO reportó al menos una caja en el fotograma."),
  codeBlock(CODE_LINEA),
  codeCaption("6", "backend/main.py, función _mjpeg_line_vision_frames() — confirmación binaria real de la estación de Visión."),
  p("La Figura 9 muestra la sección de Línea de manufactura de la portada tal como está hoy: honesta sobre las tres estaciones que dependen de hardware que el equipo todavía no tiene (KUKA KR6, UR5, Aether Inventory, cada una marcada \"Pendiente de hardware\"), y la estación de Visión mostrando su estado real — inactiva hasta que alguien presiona \"Iniciar visión de línea\", sin simular que las otras tres ya funcionan."),
  ...figure(A("dashboard_manufacturing_line_real.png"), 560, 223, "9", "Sección Línea de manufactura de la portada — tres estaciones pendientes de hardware, Visión con su estado real."),
  calloutPending("la programación de los brazos KUKA y UR5, así como la instalación física de la línea de manufactura (3.7), dependen del hardware real de los brazos, que el equipo aún no tiene disponible. La interfaz de entrada y salida que exponen físicamente el KUKA KR6 y el UR5 para el disparo del enlace queda como investigación técnica pendiente, no como decisión de arquitectura abierta."),

  h2("3.18 Alcance futuro del proyecto"),
  p("Esta sección prioriza lo que falta de ambos frentes por dependencia real — qué hardware o insumo desbloquea qué módulo — no por capítulo ni por rol. No repite el entorno de desarrollo ni el mantenimiento (Capítulo 4) ni el resumen narrativo de Conclusiones: es la ruta de ejecución hacia adelante."),
  bullet("Diseño mecánico y CAD, diagramas eléctricos y planos técnicos (3.2, 3.3, 3.5) — primer eslabón de la cadena física: sin estos insumos no se puede cotizar, fabricar ni ensamblar nada físico todavía."),
  bullet("Bill of materials y diagramas de cableado reales (hardware/bom/, hardware/wiring/) — dependen directamente del paso anterior."),
  bullet("Llegada del Jetson Orin Nano Super, o su contingencia Raspberry Pi 5 + AI HAT+ (3.8) — desbloquea migrar Percepción fuera de la demo de escritorio y libera la cámara que hoy comparten Percepción y Visión de línea (3.10, 3.16)."),
  bullet("Llegada del chasis, los motores y los encoders del robot móvil — desbloquea Navegación (3.13) y, con ella, el estado de cobertura (PARTIAL/COMPLETE/INVALID) todavía pendiente en Inventory Engine (3.14)."),
  bullet("Llegada del microcontrolador ESP32/STM32 y su firmware — desbloquea el watchdog de seguridad independiente de red (Decisión 6) y el control de bajo nivel del robot móvil."),
  bullet("Llegada de los brazos KUKA KR6 y UR5 — desbloquea el ensamblaje del robot móvil ya con chasis (3.6), el montaje físico completo de la celda (3.7) y la programación real en KRL/URScript."),
  bullet("Confirmar la interfaz de E/S real que exponen los brazos (investigación técnica, ADR 0008) — desbloquea el puente MQTT→I/O real de line_events_listener/ y, con eso, el handshake físico completo de la línea de manufactura (3.17)."),

  new Paragraph({ children: [new PageBreak()] }),
];

module.exports = { capitulo3 };
