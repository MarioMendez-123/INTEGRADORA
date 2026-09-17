# Pendientes

Lista de trabajo real, no aspiracional — cada punto dice si necesita hardware
que todavía no tenemos, o si se puede avanzar ya en software puro. Se
actualiza cuando cambie el estado de algo aquí, no se reescribe desde cero.

## Banda + pistón (línea de manufactura) — post ADR 0010 (2026-09-16)

### 🟢 No bloqueado — se puede avanzar ya, sin hardware nuevo

- [ ] **Implementar el criterio real de PASS/FAIL en Visión de línea**
      (`backend/main.py::_make_line_vision_processor`). Hoy solo hace
      detección de presencia ("PIEZA DETECTADA"/"SIN PIEZA"); falta decidir
      y programar qué hace que una pieza "pase" o "no pase" la inspección.
      Se puede desarrollar y probar con la cámara/demo que ya existe.
- [ ] **Clasificador de tipo de objeto (1/2/3)** para el campo `tipo_objeto`
      de `contracts/line_handshake_protocol.md`. No depende del PLC, del
      ESP32/STM32 ni del pistón — es puramente el modelo de visión. **Ojo:**
      sí depende de tener las 3 piezas reales (o fotos de ellas) a la mano
      para entrenar/probar el clasificador — eso no es "hardware de
      actuación" pero tampoco es cero-dependencias físicas. Si ya tienen las
      3 piezas, esto se puede empezar ya.

### 🔴 Bloqueado por hardware — no se puede avanzar hasta tener el equipo físico

- [ ] **Decidir tipo de cámara para la Percepción del robot móvil (USB vs.
      CSI)** — condiciona si `edge/perception/*.py` necesita cambiar
      `cv2.VideoCapture(0)` por un pipeline GStreamer. No se puede confirmar
      sin la cámara física en mano.
- [ ] **Confirmar si el actuador final de la línea es un PLC o un
      ESP32/STM32** (ADR 0010, sub-decisión 10b) — bloquea todo lo demás de
      esta sección.
- [ ] **Confirmar la interfaz de E/S real** que expone ese PLC/MCU (Modbus,
      serial, digital simple) y si hace falta hardware adicional (relé,
      módulo de E/S) no cotizado.
- [ ] **Implementar `edge/manipulation/line_actuation/plc_backend/` o
      `.../mcu_backend/`** (el que corresponda) — depende del punto anterior;
      por diseño, no se fabrica código de ninguno de los dos antes de tener
      esa decisión confirmada.
- [ ] **Definir el tópico MQTT y el payload final** del Evento A/B de
      `contracts/line_handshake_protocol.md` — el contrato ya tiene el
      formato de los eventos, pero el nombre de tópico real depende de la
      interfaz de E/S que se confirme arriba (no se fabrica antes, por
      principio del propio proyecto).
- [ ] **Confirmar si el software necesita controlar arranque/paro de la
      banda**, o si la banda corre continua e independiente del software.
- [ ] **Pruebas de timing del pistón** respecto a la velocidad real de la
      banda (¿el pulso dura lo suficiente para expulsar la pieza sin
      atascarse ni golpear la siguiente?) — necesita el pistón, la banda y
      las piezas reales corriendo juntos.

## Jetson Orin Nano Super (percepción del robot móvil)

### 🔴 Bloqueado por hardware

- [ ] Flasheo de JetPack y verificación de qué versión de Python/PyTorch/
      OpenCV corresponde — no se puede confirmar sin el Jetson físico.
- [ ] Verificar que `edge/perception/*.py` corre igual en el Jetson que en
      la máquina de desarrollo (misma lógica, pero PyTorch/OpenCV son
      builds distintas ahí).
