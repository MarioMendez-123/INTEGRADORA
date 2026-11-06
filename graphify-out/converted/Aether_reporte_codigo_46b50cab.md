<!-- converted from Aether_reporte_codigo.docx -->

Aether. Reporte del código
8 de octubre de 2026. Cada bloque gris es código del repositorio, con archivo y líneas. El único bloque que no está en el repositorio es el de la sección 8: es la regla de pieza real, todavía sin programar.
Carpeta: C:\Users\mende\Downloads\INTEGRADORAAHORASI. Repositorio: MarioMendez-123/INTEGRADORA. Rama: feature/robot-lumina-camera-sharing.
# 1. Contenido
- Sección 2. Dónde vive el código y qué ruta hace cada cosa.
- Sección 3. Inventario: la detección cruda y el número que ve el tablero.
- Sección 4. Percepción: YOLO, código de barras y ArUco.
- Sección 5. Visión de línea: lo único que corre hoy es presencia.
- Sección 6. Dataset: clases, etiqueta, reparto y entrenamiento.
- Sección 7. Tablero, celda y Lumina.
- Sección 8. Parámetros de verificación de pieza real, y el algoritmo que falta.
- Sección 9. Lo que el repositorio todavía no hace.
# 2. Dónde está el código
Las carpetas del proyecto son backend (la API, entrada en backend/main.py), edge (percepción e inventario, pensado para el Jetson), dashboard (pantallas), lumina-agent (voz), contracts (el protocolo en documento), tests y docs (decisiones 0001 a 0010). firmware y hardware no tienen programa de control. .claude, .agents, backend/.venv y node_modules son herramientas y librerías, no el proyecto.
Estas son las rutas que declara backend/main.py. La tabla resume para qué sirve cada una.
| Método | Ruta | Para qué |
| --- | --- | --- |
| GET | /health | El servicio responde. |
| GET | /inventory | Inventario declarado. |
| GET | /inventory/history | Historial de entradas. |
| PATCH | /inventory/{identifier}/retire | Retira una entrada a mano. |
| POST | /inventory/auto-refresh/start | Arranca el refresco automático. |
| POST | /inventory/auto-refresh/stop | Lo detiene. |
| GET | /inventory/auto-refresh/status | Dice si el refresco está corriendo. |
| GET | /perception/stream | Video de la cámara de percepción. |
| GET | /perception/recent-detections | Últimas detecciones. |
| GET | /line/vision/stream | Video de la cámara de la línea. |
| GET | /line/cell/status | Estado simulado de la celda. |
| POST | /line/cell/session | Abre una sesión de celda. |
| GET | /line/cell/session | Lee esa sesión. |
| DELETE | /line/cell/session | La cierra. |
| POST | /line/cell/run | Corre la simulación de la celda. |
| POST | /line/cell/alarms/ack | Reconoce una alarma. |
| POST | /line/cell/alarms/clear | Limpia alarmas. |
| GET POST | /dataset, /dataset/classes, /dataset/samples | Lee el dataset, registra una clase, guarda una foto. |
| POST | /robot/ask | Pregunta a Lumina. |
| GET POST | /robot/call, /robot/contacts, /robot/calendar, /robot/tts | Llamada, contactos, calendario y voz. |
| WS | /show/ws | Canal del show en vivo. |

# 3. Inventario
Una Observation es una sola detección, en crudo. El archivo define los campos y no calcula inventario.
| edge/inventory_engine/observations/observation.py, líneas 15 y 35 a 40. Se omite el docstring. @dataclass class Observation: timestamp: str detected_class: str code_data: str \| None code_read: bool confidence: float location_marker_id: int \| None |
| --- |

Esas detecciones se juntan en una DeclaredEntry. Este archivo no trae estado de cobertura. PARTIAL, COMPLETE e INVALID dependen de la navegación, y ese módulo no existe.
| edge/inventory_engine/declared_inventory/declared_entry.py, líneas 15 y 38 a 45. Se omite el docstring. @dataclass class DeclaredEntry: identifier: str detected_class: str total_observations: int code_read_count: int avg_confidence: float first_seen: str last_seen: str location_counts: dict[str, int] |
| --- |

La clave del grupo es el texto del código de barras cuando se leyó. Si no se leyó, la clave es unidentified: más el nombre de la clase. La cantidad es cuántas observaciones cayeron en ese grupo. La confianza es el promedio. El número del tablero es ese conteo visible, no una garantía de haber visto todo el anaquel.
| edge/inventory_engine/aggregate_observations.py, líneas 40 a 44 y 61 a 83. def _group_key(observation: dict) -> str: if observation["code_data"] is not None: return observation["code_data"] return f"unidentified:{observation['detected_class']}" groups: dict[str, list[dict]] = {} for observation in observations: groups.setdefault(_group_key(observation), []).append(observation) for identifier, group in sorted(groups.items()): class_counts = Counter(o["detected_class"] for o in group) most_common_class = class_counts.most_common(1)[0][0] timestamps = sorted(o["timestamp"] for o in group) location_counts = Counter(_location_key(o) for o in group) entries.append( DeclaredEntry( identifier=identifier, detected_class=most_common_class, total_observations=len(group), code_read_count=sum(1 for o in group if o["code_read"]), avg_confidence=sum(o["confidence"] for o in group) / len(group), first_seen=timestamps[0], last_seen=timestamps[-1], location_counts=dict(location_counts), ) ) |
| --- |

# 4. Percepción
La cámara de percepción corre YOLO, intenta leer un código dentro de la caja y anota el primer ArUco del cuadro. Si el código no se lee, la detección se guarda igual. ArUco verifica posición. Si hay varios marcadores, se queda el primero. El dibujo de la caja y del texto está en las líneas 342 a 361 y no cambia el dato que se guarda.
| backend/main.py, líneas 326 a 340 y 363 a 371. Dentro de _make_perception_processor. def process(frame): aruco_corners, aruco_ids, _ = aruco_detector.detectMarkers(frame) location_marker_id = int(aruco_ids.flatten()[0]) if aruco_ids is not None else None results = model(frame, verbose=False) for box in results[0].boxes: x1, y1, x2, y2 = (int(v) for v in box.xyxy[0]) class_name = model.names[int(box.cls[0])] confidence = float(box.conf[0]) crop = frame[y1:y2, x1:x2] codes = decode(crop) if crop.size > 0 else [] data = codes[0].data.decode("utf-8") if codes else None _notify_perception_observation_sinks({ "timestamp": datetime.now(UTC).isoformat(), "detected_class": class_name, "code_data": data, "code_read": bool(codes), "confidence": confidence, "location_marker_id": location_marker_id, }) |
| --- |

El peso que carga ese modelo se elige en este orden: la variable YOLO_WEIGHTS, luego parts.pt si ya se entrenó, y si no existe, yolov8n.pt. Mientras no haya parts.pt, los nombres que salen en vivo no son computadora1, computadora2 ni computadora3.
| backend/dataset_store.py, líneas 60 a 67. La misma regla está copiada en edge/perception/model_weights.py. def resolve_yolo_weights() -> str: override = os.environ.get("YOLO_WEIGHTS") if override: return override weights = default_weights_file() if weights.is_file(): return str(weights) return FALLBACK_WEIGHTS |
| --- |

# 5. Visión de línea, hoy
La cámara de la línea no lee códigos y no busca ArUco. Si el modelo devuelve al menos una caja, escribe PIEZA DETECTADA. Si no devuelve ninguna, escribe SIN PIEZA. Ese letrero no es PASS ni FAIL, y esta función no manda la señal del pistón.
| backend/main.py, líneas 394 a 399. Dentro de _make_line_vision_processor. def process(frame): results = model(frame, verbose=False) piece_detected = len(results[0].boxes) > 0 label = "PIEZA DETECTADA" if piece_detected else "SIN PIEZA" color = (0, 200, 0) if piece_detected else (0, 140, 255) cv2.putText(frame, label, (24, 48), cv2.FONT_HERSHEY_SIMPLEX, 1.1, color, 3) |
| --- |

El comentario encima de esa función, líneas 383 a 389, dice que el PASS o FAIL de la decisión 10c todavía no está definido y que, cuando exista, se emite aquí dentro de process(). El protocolo ya reserva los campos resultado, fecha, tipo_objeto (1, 2, 3 o vacío) y confianza. Hoy tipo_objeto se queda vacío.
# 6. Dataset y entrenamiento
## 6.1 Clases registradas
El archivo de clases tiene tres nombres, en este orden. El número de la etiqueta es la posición, empezando en cero.
| edge/perception/parts/classes.txt, archivo completo. # Un nombre por línea: minúsculas, números y _. Ejemplo: tornillo_m6 computadora1 computadora2 computadora3 |
| --- |

## 6.2 Reparto, duplicados y pesos
| backend/dataset_store.py, líneas 31 a 39 y 74 a 76. FALLBACK_WEIGHTS = "yolov8n.pt" VAL_BUCKETS = 5 NEAR_DUP_MEAN = 6.0 CLASS_NAME = re.compile(r"^[a-z][a-z0-9_]{0,63}$") def split_for(stem: str) -> str: digest = hashlib.sha256(stem.encode("utf-8")).digest() return "val" if digest[0] % VAL_BUCKETS == 0 else "train" |
| --- |

Una de cada cinco fotos de la bandeja va a validación. El resto va a entrenamiento. La misma foto no cambia de lado, porque el reparto sale del nombre. Una foto nueva se rechaza si, reducida a 32 por 32 pixeles en gris, su diferencia media contra alguna de las últimas 40 queda por debajo de 6.0. Eso está en _too_similar, líneas 277 a 286.
## 6.3 Cómo se escribe la etiqueta
La pantalla no guarda una foto sin rectángulo. El nombre tiene que existir en classes.txt. La caja va en coordenadas de 0 a 1. La línea que se escribe es índice, centro x, centro y, ancho y alto.
| backend/dataset_store.py, líneas 296 a 314. if not boxes: raise ValueError("marca al menos una caja sobre la pieza") for box in boxes: name = str(box.get("name", "")).strip() if name not in names: raise ValueError(f"'{name}' no está registrada") x, y, w, h = (float(box[key]) for key in ("x", "y", "w", "h")) if not (0 <= x <= 1 and 0 <= y <= 1 and 0 < w <= 1 and 0 < h <= 1): raise ValueError("la caja tiene que quedar dentro de la foto") lines.append(f"{names.index(name)} {x:.6f} {y:.6f} {w:.6f} {h:.6f}") |
| --- |

## 6.4 Entrenamiento
train_parts.py exige clases y al menos una foto. Congela las primeras 10 capas y ajusta la cabeza. El peso nuevo reemplaza a parts.pt solo si el mAP50 sube. Si no sube, se conserva el anterior.
| edge/perception/train_parts.py. Congelado, publicación y valores por defecto. FREEZE_LAYERS = 10 if previous is not None and map50 <= float(previous["map50"]): return False def base_weights(weights_path: Path) -> str: if weights_path.is_file(): return str(weights_path) return "yolov8n.pt" def train_parts( parts_dir: Path = PARTS_DIR, *, epochs: int = 80, imgsz: int = 640, batch: int = 8, patience: int = 15, device: str = "cpu", runs_dir: Path = RUNS_DIR, weights_path: Path = WEIGHTS_FILE, report_path: Path = REPORT_FILE, runner=None, ) -> dict: model.train( data=str(data_yaml), epochs=epochs, imgsz=imgsz, batch=batch, patience=patience, device=device, project=str(runs_dir), name="parts", exist_ok=True, freeze=FREEZE_LAYERS, cache=True, ) |
| --- |

FREEZE_LAYERS está en la línea 39. El rechazo del peso que no supera el mAP50 anterior está en las líneas 131 a 133. base_weights está en las líneas 147 a 150. Los defaults de train_parts están en las líneas 175 a 182. model.train está en las líneas 159 a 171.
# 7. Tablero, celda y Lumina
El tablero muestra el inventario, su historial, las dos cámaras, la celda, la captura del dataset y la pantalla del robot. La celda puede simular una corrida y levantar una alarma si una pieza marcada FAIL no fue expulsada. Esa simulación no es el pistón de la banda.
Lumina recibe una pregunta en POST /robot/ask y devuelve una respuesta. También vive sola en lumina-agent/lumina.py y lumina-agent/server.py. No decide el inventario ni el PASS de la línea.
# 8. Parámetros de verificación de pieza real
Esto cierra el pendiente de la decisión 10c: qué hace que una detección sea una de las tres piezas, y qué resultado PASS o FAIL le corresponde. El dataset ya tiene los tres nombres. El algoritmo no está en backend/main.py. Los números 0.50 y 0.10 son de arranque. Se reemplazan con la primera corrida que tenga fotos de las tres piezas y fotos de cosas que no son esas piezas. No son una medición de laboratorio.
## 8.1 Las tres respuestas
- SIN PIEZA. El modelo no devolvió ninguna caja en el corte interno de 0.25. No hay evento. El pistón no se mueve.
- PIEZA REAL. El peso activo es parts.pt, la clase está en classes.txt, la confianza llega a 0.50 y la segunda clase queda al menos 0.10 abajo. Resultado PASS. tipo_objeto 1, 2 o 3. El pistón no se mueve.
- NO ES PIEZA REAL. Había cajas y ninguna pasó el filtro, o dos clases reales quedaron a menos de 0.10. Resultado FAIL. tipo_objeto vacío. Cuando el actuador exista, ese FAIL dispara el pistón.
PASS aquí significa que la detección es una de las tres piezas registradas. Una pieza rota, incompleta o mal puesta no se distingue con estas fotos. classes.txt no tiene etiquetas de defecto.
## 8.2 Tabla de arranque
| Parámetro | Valor de arranque | Qué decide |
| --- | --- | --- |
| Clases reales | computadora1, computadora2, computadora3 | Solo estos nombres pueden ser pieza real. |
| Tipo de objeto | 1, 2 y 3 según el orden del archivo | Campo del evento. Hoy el programa lo deja vacío. |
| Peso exigido | edge/perception/weights/parts.pt | Con yolov8n.pt no se emite PASS ni FAIL. |
| Corte interno | 0.25 | Conserva cajas débiles para rechazarlas. |
| Confianza mínima | 0.50 | Por debajo, no es pieza real. |
| Margen | 0.10 | Si dos clases quedan más cerca que esto, no se elige. |
| Cuadro vacío | SIN PIEZA | Sin evento. Pistón quieto. |
| Caja que no pasa | NO ES PIEZA REAL, FAIL | Hay objeto y no es una de las tres. |
| Clase clara | PIEZA REAL, PASS | Una clase sobre 0.50, separada de la siguiente. |

## 8.3 Nombre, etiqueta y tipo
| Nombre en classes.txt | Número en la etiqueta | tipo_objeto |
| --- | --- | --- |
| computadora1 | 0 | 1 |
| computadora2 | 1 | 2 |
| computadora3 | 2 | 3 |

## 8.4 El algoritmo, escrito para programarlo
El bloque siguiente no está en el repositorio. Usa los mismos nombres que el código de la sección 5, para reemplazar el letrero de presencia cuando parts.pt ya exista. Hasta ese cambio, la pantalla sigue diciendo PIEZA DETECTADA o SIN PIEZA.
| Especificación. No está en el repositorio. Va dentro de process() en backend/main.py. CLASES = ["computadora1", "computadora2", "computadora3"] CORTE_INTERNO = 0.25 CONFIANZA_MINIMA = 0.50 MARGEN_AMBIGUEDAD = 0.10 def clasificar_pieza(model, frame, peso_es_parts): if not peso_es_parts: return None results = model(frame, verbose=False, conf=CORTE_INTERNO) boxes = results[0].boxes if len(boxes) == 0: return {"respuesta": "SIN PIEZA"} por_clase = {} for box in boxes: nombre = model.names[int(box.cls[0])] confianza = float(box.conf[0]) if nombre not in CLASES or confianza < CONFIANZA_MINIMA: continue anterior = por_clase.get(nombre) if anterior is None or confianza > anterior: por_clase[nombre] = confianza if not por_clase: return { "respuesta": "NO ES PIEZA REAL", "resultado": "FAIL", "tipo_objeto": None, } ordenadas = sorted(por_clase.items(), key=lambda item: item[1], reverse=True) nombre, confianza = ordenadas[0] if len(ordenadas) > 1 and ordenadas[0][1] - ordenadas[1][1] < MARGEN_AMBIGUEDAD: return { "respuesta": "NO ES PIEZA REAL", "resultado": "FAIL", "tipo_objeto": None, } return { "respuesta": "PIEZA REAL", "resultado": "PASS", "tipo_objeto": CLASES.index(nombre) + 1, "confianza": confianza, } |
| --- |

## 8.5 Cómo etiquetar mientras se llena el dataset
- Cada foto de una pieza lleva un rectángulo sobre la pieza y el nombre computadora1, computadora2 o computadora3.
- No se agrega una clase no_real, basura, fondo o mano. El fondo no es un objeto. Una cuarta clase no tiene tipo de objeto: el protocolo solo tiene 1, 2 y 3.
- No se inserta un nombre en medio de classes.txt. El tipo es la posición del archivo.
- Las fotos de mesa vacía, mano u otro objeto no se suben por la pantalla del dataset. Esa pantalla exige un rectángulo, y el entrenamiento las vería como pieza. Se guardan fuera de edge/perception/parts/images.
- Una foto casi igual a una de las últimas cuarenta se rechaza. Conviene variar el encuadre.
## 8.6 Cifras que siguen vacías
El documento de criterios de aceptación deja sin número la tasa de detección, la tasa de lectura de código, el error de ArUco en centímetros, el error de odometría y el tiempo por cuadro. Esos salen de una corrida medida. Este reporte no los llena.
# 9. Lo que todavía no hace el repositorio
- No clasifica la pieza de la línea. La sección 5 es el código que corre. La sección 8.4 es la regla que falta programar.
- No dispara el pistón ni controla la banda. El PLC o el ESP32 no está elegido.
- No asigna PARTIAL, COMPLETE ni INVALID.
- No navega por waypoints y no tiene firmware de motores ni watchdog.
- No tiene el nombre del tema MQTT.
Un letrero de PASS puesto sobre la detección de presencia de la sección 5 sería una inspección falsa. PASS solo puede salir de la regla de la sección 8, y solo cuando el peso activo sea parts.pt.