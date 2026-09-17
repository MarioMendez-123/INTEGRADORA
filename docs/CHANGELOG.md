# Changelog

Registro de cambios de arquitectura relevantes para todo el equipo — no es un
changelog de cada commit, solo de decisiones que afectan a más de una persona
o requieren que alguien "se entere" antes de seguir trabajando.

## 2026-09-16 — La línea de manufactura ya no usa brazos robóticos (KUKA/UR5)

**Commits:** `a486eff`, `9b15e2e` — rama `feature/robot-lumina-camera-sharing`.

### Qué cambió

Mario decidió eliminar el brazo KUKA KR6 y el brazo UR5 del proyecto. La
línea de manufactura ahora es más simple:

```
Banda transportadora (con fixtures que sostienen cada pieza)
        ↓
Visión de línea decide: ¿la pieza pasa la inspección o no?
        ↓ (solo si NO pasa)
Un pistón la expulsa de la banda (scrap)
        ↓ (si sí pasa)
Aether Inventory la recoge
```

Antes era: KUKA coloca la pieza → UR5 la ensambla → visión confirma → Aether
Inventory recoge. Ese modelo con dos robots ya no existe en el proyecto.

### Por qué

Simplifica bastante la parte física del proyecto (ya no hay que coordinar
tres robots industriales con timing crítico entre ellos) y sigue cumpliendo
el mismo requisito académico: manipulación con hardware real, no una
simulación.

### Qué deben tener en cuenta si hacen `git pull` de esta rama

- Si alguien ya tenía código o notas propias dentro de
  `edge/manipulation/arm_control/`, `edge/manipulation/lfd/` o
  `edge/manipulation/task_planning/`: **esas carpetas ya no existen**, se
  eliminaron. Si tenías algo ahí sin subir a Git, avisa antes de que se
  pierda con el pull.
- Si estabas leyendo la ADR 0008 (`docs/architecture/decisions/0008-...md`)
  como la arquitectura vigente: ya no lo es. Sigue en el repo como registro
  histórico, pero la decisión vigente ahora es la **ADR 0010**
  (`docs/architecture/decisions/0010-linea-banda-piston.md`).
- Si estabas por escribir algo que mencione "KUKA" o "UR5" en el dashboard,
  el chatbot de Lumina, o los criterios de aceptación: ya no aplica, usa
  "banda", "fixtures" y "pistón" en su lugar.
- **Nada de esto es hardware real todavía.** Es solo el plan/documentación —
  seguimos sin PLC, sin ESP32/STM32 de línea, y sin pistón físico. Ver
  `docs/TODO.md` para saber exactamente qué falta y qué de eso ya se puede
  avanzar sin esperar el hardware.

### Qué NO cambió

- El robot móvil (Aether Inventory), su percepción (YOLO, ArUco, código de
  barras) y el dashboard de inventario — nada de eso se tocó.
- Lumina (la cara/voz del robot móvil) sigue igual, solo se corrigió lo que
  decía sobre la línea de manufactura para que ya no mencione brazos.
- La cámara de Visión de línea sigue siendo una demo de presencia
  ("PIEZA DETECTADA" / "SIN PIEZA") — eso tampoco cambió hoy, sigue
  pendiente de convertirse en un criterio real de pasa/no pasa (ver
  `docs/TODO.md`).
