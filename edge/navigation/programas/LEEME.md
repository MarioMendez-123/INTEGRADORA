# Programas del carrito

Cada archivo `.py` de esta carpeta es un programa para el carrito. Se escriben con la librería `edge/navigation/carrito.py`
y corren igual en el simulador y en el carrito real.

## Cómo se corre

| Dónde | Comando |
|---|---|
| Simulador (laptop) | Pestaña **Programar** de http://localhost:8770, botón *Ejecutar* |
| Simulador, desde la terminal | `python edge/navigation/correr_programa.py edge/navigation/programas/ejemplo_recta.py --puerto socket://localhost:7701` |
| Carrito real (Jetson) | `python3 edge/navigation/correr_programa.py edge/navigation/programas/ejemplo_recta.py --puerto /dev/ttyUSB0` (necesita `pip install pyserial` en el entorno de la Jetson) |

Opcional: `--pose x,y,grados` si el carrito no empieza acoplado en la banda.

## Lo que existe dentro de un programa

Movimientos (cada uno espera a que el ESP32 avise que terminó, y levanta `ErrorCarrito` si hay una falla):
`avanzar(metros, v=0.35)`, `retroceder(metros)`, `girar(grados)`, `girar_a(grados)`, `ir_a(x, y)`, `acoplar(distancia=2.0)`,
`esperar(segundos)`.

Lectura: `distancia("frente"|"izquierda"|"derecha"|"pila")` en mm (8190 = nada a menos de 1.2 m), `bateria()`, `paro_presionado()`,
`carrito.pose()` -> (x, y, grados).

Visión (la cámara): `vision()` devuelve `{"obstaculos": {"cantidad", "clases", "area_max_pct"}, "arucos": [...], "detalle": [...]}` y
`hay_persona(area_min_pct=3)` dice si hay una persona que ocupa al menos ese porcentaje de la imagen. Lee el agente de visión
(`GET /status`): en el carrito real `http://localhost:8001/status` (agente del Jetson), en el simulador el propio simulador.
**Qué es real hoy:** el agente real publica las clases de obstáculos (YOLO general) y el porcentaje de imagen del más grande;
una cámara sola no mide distancia, el porcentaje es un indicio de cercanía. **`arucos` y `detalle` solo existen en el simulador:**
el agente real todavía solo detecta el ID del ArUco, no su posición, así que en el carrito real `arucos` llega vacío.
No escribas programas que dependan de `arucos` sin avisarme.

Otras: `decir(texto)` (Lumina), `fijar_pose(x, y, grados)`, `carrito.velocidad_maxima(v)`, `carrito.rearmar()`, `ErrorCarrito`, `math`.

Mapa: origen en el eje de las ruedas acoplado en la banda; x hacia la banda; y a la izquierda; 0° = mirando a la banda;
giros positivos = izquierda. La estación de descarga queda a 4 m de la banda y a 90° a la izquierda.

## Reglas de seguridad (para quien escriba los programas, incluida una sesión de Claude)

- No hay sensor trasero: usa `retroceder()` (avisa por voz y va a 0.10 m/s) y nunca más de ~0.6 m seguidos.
- El reflejo de 40 cm solo mira al frente. Al acoplar, el ESP32 vigila hasta ~45 cm antes de la estación.
- No pases de 0.35 m/s en recta ni de 0.15 m/s al acoplar sin medir la distancia de frenado del carrito real.
- Nada de esto está probado con el carrito real; los valores del simulador son estimados.
- No pongas claves ni contraseñas en un programa: esta carpeta se sube a GitHub.

## Trabajar con la sesión de Claude de la Jetson

Los programas viven en el repositorio. Desde la laptop: guarda en la pestaña *Programar*, haz `git add edge/navigation/programas`,
`git commit` y `git push`; en la Jetson, `git pull` y córrelo. A la inversa, un programa que escriba Claude en la Jetson aparece
en la laptop con `git pull` y en la pestaña *Programar* con *Actualizar lista*.
