# Capítulo 14: Visión en el borde

*Cómo una cámara se convierte en datos: detectar con YOLO, leer códigos, ubicarse con ArUco, entrenar el modelo de las piezas y por qué conviene no detectar más rápido de lo útil.*

## Una prueba en la que nada se detectó

En la prueba de humo del agente de percepción en una laptop (cámara web, YOLO en CPU, 10 segundos), todo salió bien: **30.0 FPS** de cámara y de entrega, 300 cuadros recibidos, inferencia de 47 ms. Pero la bitácora anota algo que un lector apresurado se salta: **la cámara no vio ningún objeto, así que se generaron 0 observaciones**. El envío de datos se probó con **dobles** (versiones falsas), no con detecciones reales. Esa franqueza resume la mentalidad del capítulo: *funcionar no es lo mismo que detectar*, y las cifras de velocidad dicen poco si la cámara apunta a una pared.

## Por qué la inteligencia vive en el robot y no en la nube

**Visión en el borde** (*edge*) significa procesar las imágenes **en el mismo equipo que tiene la cámara**, no mandarlas a un servidor lejano. Las razones, en el contexto de Aether:

- **Ancho de banda:** un video a 30 cuadros por segundo satura una red WiFi; los datos que salen del análisis son unos cientos de bytes (capítulo 1).
- **Latencia:** el robot debe frenar y decidir en milisegundos, sin esperar a internet.
- **Autonomía:** el sistema funciona aunque no haya conexión (el proyecto lo define como principio: *"el robot funciona standalone"*).
- **Privacidad:** el video no sale del equipo.

## De la luz a los píxeles

Una cámara digital entrega una **imagen** como una cuadrícula de **píxeles**, cada uno con tres números (rojo, verde y azul, de 0 a 255). Un cuadro de 640 × 480 son 307 200 píxeles y casi un millón de números. La cámara USB del robot entrega varios cuadros por segundo (**FPS**, capítulo 6). **OpenCV** es la librería de visión que lee la cámara, recorta, dibuja y convierte imágenes; el proyecto la usa en el Jetson desde el sistema (versión 4.8.0, **VERIFICADO**) y no desde `pip`.

## Detectar con YOLO: una pasada, muchos objetos

**YOLO** (*You Only Look Once*, "solo miras una vez") es un tipo de red neuronal que, dada una imagen, devuelve **una lista de objetos**: una **caja** (rectángulo), una **clase** ("persona", "silla", "computadora2") y una **confianza** (de 0 a 1). Se llama así porque analiza la imagen completa **de una sola pasada**, en vez de recorrerla por pedazos, lo que lo hace lo bastante rápido para video. Aether usa `ultralytics`, la librería de la versión **YOLOv8**, con el modelo pequeño `yolov8n.pt` (6.5 MB, se descarga solo la primera vez y no se sube a Git).

El flujo completo de una observación, que es el corazón de la percepción (`backend/perception_pipeline.py`, clase `PerceptionEngine`), se resume así:

1. Se busca un **marcador ArUco** en todo el cuadro y se anota su identificador, si hay.
2. YOLO detecta objetos y entrega sus cajas.
3. Dentro de **cada caja** se recorta la imagen y, con la librería `pyzbar`, se intenta **leer un código de barras o QR**.
4. Se arma un registro (una **Observation**) por detección: hora (UTC), clase, código leído (si hubo), si se leyó, confianza y el ArUco visible.
5. Se **dibuja** la caja y la etiqueta sobre la imagen para el video.

Una regla de diseño importante (**Decisión 1**): **ninguna detección se descarta por no tener código legible**. Detectar y contar es independiente de identificar. Y una advertencia de terminología (principio 4.2): **"conteo visible detectado" no es "conteo real de inventario"**; el sistema cuenta lo que ve, no lo que existe.

## Formatos de modelo: .pt, ONNX y por qué importa

Un modelo entrenado se guarda en un archivo. Dos formatos aparecen en Aether:

| Formato | Qué es | Dónde se usa |
|---|---|---|
| **`.pt`** | Formato de **PyTorch** (la librería de redes neuronales); necesita `torch` y `ultralytics` para correr | Laptop y Jetson (`yolov8n.pt` y `parts.pt`) |
| **ONNX** (`.onnx`) | Formato **neutral** de modelos; lo puede leer OpenCV (`cv2.dnn`) sin `torch` | La Raspberry Pi 4 (`parts.onnx`) |

La Pi no tiene `torch`, así que el modelo de piezas se **exporta** a ONNX en la laptop y se copia (capítulo 8). Una verificación real: el modelo ONNX juzgó **igual que el original en 19 de 19 fotos**, con un IoU medio de 0.994 (el **IoU**, *Intersection over Union*, mide cuánto coinciden dos cajas: 1.0 es idéntica). Una validación al arrancar (`line_model.py`) comprueba que el modelo trae las clases de `classes.txt` y, si no, se niega a iniciar con un mensaje que pide volver a exportar.

## El límite de frecuencia: no detectar más rápido de lo útil

Aunque la cámara entregue 30 cuadros por segundo, **no hace falta correr YOLO 30 veces por segundo**: consume CPU o GPU y casi no aporta. El agente separa las dos cosas con dos piezas (`perception_pipeline.py`):

- **El video** se entrega a su ritmo, con **las últimas cajas conocidas** dibujadas encima.
- **`AsyncDetector`** corre YOLO en **otro hilo**, siempre sobre **el cuadro más reciente**; si sigue ocupado, **descarta** el cuadro nuevo (no los acumula), y su frecuencia máxima se limita con `AETHER_DETECT_MAX_HZ` (por defecto **10 por segundo**; es un **valor de diseño, no medido**).

Resultado en el Jetson (**MEDIDO**, reportado): 29.0 FPS de cámara y 29.1 de entrega con una inferencia de **68.0 ms** de promedio, y en la prueba de laptop 47 ms. Conviene recordar que el modo `sync` (analizar cada cuadro) era el comportamiento histórico de la laptop y sigue disponible.

## Lo que se ve en pantalla y lo que se calcula

Dos cosas distintas, que a veces se confunden:

- **Lo que se ve**: el video con cajas y etiquetas.
- **Lo que se calcula y se manda**: observaciones en JSON (capítulo 16).

Por ejemplo, el letrero de la cámara de la celda dice `PIEZA REAL · computadora2 · PASS` o `NO ES PIEZA REAL · FAIL` o `SIN PIEZA`: esa es la **vista**; lo que decide al pistón son cinco juicios iguales seguidos (capítulo 7).

## El modelo de las piezas: entrenar con pocas fotos

Para la celda, el equipo entrenó un modelo propio, `parts.pt`, que reconoce **tres piezas registradas** (`computadora1`, `computadora2`, `computadora3`, las ECU). El flujo:

1. En la página `dataset.html` (capítulo 19) se **suben fotos** y se **dibujan cajas** sobre cada pieza, con su clase. El servidor las guarda en `edge/perception/parts/` (`POST /dataset/samples`); rechaza fotos casi idénticas a una ya guardada (para no inflar el dataset con duplicados).
2. Las fotos se reparten **4 de cada 5 a entrenamiento y 1 a validación**, con una regla fija calculada a partir del nombre de la foto (para que la misma foto no cambie de conjunto entre ejecuciones).
3. `edge/perception/train_parts.py` entrena. Si ya existe un `parts.pt`, **continúa desde ahí** y **congela las primeras 10 capas** de la red: en CPU solo se ajusta la "cabeza", que es lo que distingue las piezas nuevas. **Publica el peso nuevo solo si su mAP50 supera al anterior.**
4. Se escribe `parts_report.json` con el resultado.

El **mAP50** de la última corrida registrada es **0.995** (entrenamiento del 15 de octubre de 2026). Es una nota muy alta, y por eso conviene dudar de ella: con unas decenas de fotos de tres piezas, el modelo "se aprende" el conjunto. El repositorio conserva 19 fotos en la bandeja de entrada y **no se probó con objetos que no sean pieza**: el FAIL real **no está medido**. Los pesos (`.pt`, `.onnx`) y las fotos **no se suben a Git** (están en `.gitignore`).

## Errores típicos de visión y cómo leerlos

| Síntoma | Causa probable | Dónde se vio en el proyecto |
|---|---|---|
| 0 observaciones aunque corre | La cámara no ve ningún objeto conocido | Prueba de humo del agente en laptop |
| Video a 2304 × 1536 y lento | OpenCV abrió la cámara por GStreamer en vez de V4L2 | Backend de prueba en el Jetson |
| FPS bajos | Poca luz: la cámara alarga la exposición | Pruebas del 21 de octubre |
| ArUco con un identificador "válido pero equivocado" | Reflejo de luz sobre el marcador | Informe integrador (hallazgo del módulo de percepción) |
| Dos cámaras, un solo dispositivo | Percepción y visión de línea usan ambas `/dev/video0` por defecto | Bitácora, sesión 5: no deben abrirse a la vez |
| FAIL falso que dispara el pistón | Umbral de estabilidad demasiado bajo | Documentación: no bajar `LINE_ESTABLES` de 3 sin probar |

## Cuánto acierta: lo que falta medir

Los **criterios de aceptación** del proyecto (`docs/architecture/decisions/criterios_aceptacion.md`) dejan **pendientes** los umbrales numéricos de percepción: la tasa mínima de detección de YOLO y de lectura de código, el error de posición por ArUco y los FPS mínimos. Existe un script manual (`edge/perception/test_detection_rate.py`) para medir la tasa de detección con un conjunto fijo de objetos conocidos; **no se ha corrido y registrado un resultado**. Qué umbral se exigirá lo define el equipo con datos reales: **PENDIENTE (P-22)**.

## Quién lo hace en grande

En la industria, la visión por computadora de planta corre en **cámaras inteligentes** o computadoras industriales junto a la línea, con iluminación **controlada** (el factor que más mejora la fiabilidad), modelos optimizados con **TensorRT** o equivalentes y conjuntos de datos de **miles** de ejemplos con defectos reales. Lo que Aether hace con tres piezas y unas decenas de fotos es la versión de laboratorio de ese flujo: datos → entrenar → exportar → desplegar → medir.

## Preguntas de repaso: visión

1. ¿Qué devuelve YOLO sobre una imagen y por qué se dice que "mira una sola vez"?
2. ¿Por qué ninguna detección se descarta por no tener código legible?
3. ¿Por qué la Raspberry Pi usa un modelo ONNX y no el `.pt`?
4. ¿Qué hace `AsyncDetector` cuando llega un cuadro y el detector sigue ocupado, y por qué?
5. ¿Qué significa un mAP50 de 0.995 con un dataset chico y qué prueba falta?
6. Citar dos causas de bajos FPS que **no** son defectos del modelo.
