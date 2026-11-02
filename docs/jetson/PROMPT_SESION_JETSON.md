# Prompt para la sesión de Claude en la Jetson

Pégalo completo al abrir Claude Code en la Jetson, dentro de `~/aether` (rama `jetson-agente`).

---

Soy Mario, único programador de Aether (proyecto integrador de mecatrónica, UTCH Sur). Esta sesión corre en la **Jetson Orin
Nano Super** (`mario@mario-desktop`), que es el cómputo del carrito. Respóndeme en español, explicando cada paso con comandos
exactos y diciéndome qué debo ver. Nunca he montado un robot: no des nada por sabido.

## Qué es esto

El carrito Aether lleva la Jetson (decide y lleva la ruta) y un ESP32 (ejecuta: motores M0601 por RS485, odometría, sensores
VL53L0X y BNO055, paro). Se hablan por USB con líneas de texto. En mi laptop hay un **simulador** (`sim/`) con el mismo
protocolo; los programas que escribimos corren igual en el simulador y aquí con el carrito real. Todo está en el repo.

## Primero, en este orden

1. `cd ~/aether && git status && git pull` (rama `jetson-agente`). Dime si hay conflictos; no los resuelvas en silencio.
2. Lee, sin modificar: `aether_context_docs.md` (secciones 3, 4 y 7: decisiones y reglas), `edge/navigation/programas/LEEME.md`,
   `edge/navigation/carrito.py`, `edge/navigation/mision.py`, `firmware/motor_control/src/main.cpp` y `sim/README.md`.
3. Dime qué entendiste en 10 líneas y qué contradice a lo que ves en esta máquina. No empieces a escribir código todavía.
4. Revisa el entorno y repórtame lo que veas (no instales nada sin avisarme qué hará):
   - `ls /dev/ttyUSB* /dev/ttyACM*` (el ESP32) y `groups` (debo estar en `dialout`; si no, dime el comando y que habrá que cerrar sesión).
   - Entorno de Python del backend (`~/aether/backend/.venv`) y si `pyserial` está (`python -c "import serial"`). Está en
     `backend/requirements-jetson.txt`; si falta, dime el `pip install pyserial` exacto.
   - Que `python3 edge/navigation/correr_programa.py --help` funcione.

## Reglas que no se negocian

- **Honestidad:** marca todo como COMPROBADO (lo viste en una salida real) o NO COMPROBADO. No digas que algo funciona sin verlo.
  Nada de lo del carrito real está probado todavía; los números del simulador son estimaciones.
- **Seguridad física:** el carrito pesa ~40 kg. Toda prueba con ruedas empieza **con el carrito levantado (ruedas en el aire)** y
  el **paro de emergencia al alcance de mi mano**. No pongas el carrito en el piso hasta que yo lo confirme por escrito.
  Antes de cada movimiento nuevo dime qué hará, qué distancia y a qué velocidad. No pases de 0.35 m/s en recta ni de 0.15 m/s al
  acoplar. No hay sensor trasero: nada de reversas largas (máximo ~0.6 m).
- **Terminología:** ArUco es localización, no "navegación". Se dice "detección reactiva de obstáculos", no "evasión inteligente".
- **Sin secretos:** nunca claves, tokens ni contraseñas en el chat, en un programa ni en el repo (el repo es público).
- **Cambios mínimos:** un tema por commit, mensajes en español. **No hagas push sin mi permiso explícito.** No toques
  `graphify-out/`, `.graphifyignore` ni archivos que no sean de esta tarea.
- **El protocolo no se cambia solo:** DRV, TRN, APR, MAN, HB, STOP, VMAX, RES, REARME y las respuestas ODO, MOT, RNG, PWR, EVT
  están descritos arriba de `main.cpp` y de `carrito.py`. MAN, MOT, PWR y el 5.º parámetro de APR son propuestas mías todavía no
  aceptadas formalmente: si ves que algo debe cambiar, proponlo y espera.
- Si algo del repo contradice lo que te digo aquí, avísame; no elijas en silencio.

## Qué quiero lograr, por etapas (una por una, esperando mi visto bueno)

1. **Solo escuchar.** Con el ESP32 conectado y el carrito levantado, abre el puerto y muéstrame las líneas `ODO`, `RNG`, `PWR`
   sin mandar ninguna orden de movimiento. Verifica: el rumbo del BNO055 cambia al girar el carrito a mano, los 3 VL53L0X
   miden, `PWR` da ~12.8 V de batería y `paro_mV` ~2100 con el paro suelto y ~0 con el paro presionado.
2. **Ruedas en el aire.** `ejemplo_recta.py` con distancias cortas (`avanzar(0.3)`), mirando que cada rueda gire al lado correcto
   (si una gira al revés, es el error de compra de los M0601 del mismo lado: dímelo, no lo "arregles" por software sin
   preguntarme) y que el paro detenga todo.
3. **Medir lo que el simulador solo estima** (pasos 3, 4 y 6 de la guía de navegación en el repo): distancia de frenado con el
   paro, diámetro real de la rueda, vía, deriva del rumbo y cuánto avanza con una orden de 1 m. Anótalo en
   `docs/jetson/BITACORA_JETSON.md` como una sesión nueva, con la salida real pegada.
4. **Carrito en el piso**, solo con mi autorización, una recta de 1 m, luego giros y la prueba del cuadrado.
5. **Programas de la misión** (banda ↔ descarga) y su acople, empezando por `edge/navigation/programas/ejemplo_ciclo.py`.

## Cómo escribir programas

Un programa es un archivo `.py` en `edge/navigation/programas/` que usa `carrito.py` (`avanzar`, `retroceder`, `girar_a`, `ir_a`,
`acoplar`, `distancia`, `decir`…). Se corre con
`python3 edge/navigation/correr_programa.py edge/navigation/programas/NOMBRE.py --puerto /dev/ttyUSB0`.
Antes de proponerme un programa, pruébalo mentalmente contra las reglas de seguridad de `LEEME.md`. Yo los voy a abrir en el
editor del simulador de mi laptop (pestaña *Programar*), así que guarda los archivos en esa carpeta y dime el nombre.

## Al terminar cada etapa

Dime en lenguaje sencillo: qué hiciste, qué comprobaste con una salida real (pégala), qué no pudiste comprobar, qué sigue y qué
necesitas de mí. Si algo falló, dilo tal cual con el error y la causa que viste (no una suposición).
