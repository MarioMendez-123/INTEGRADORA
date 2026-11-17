# Coordinación entre el Claude de la laptop y el de la Jetson

No hay conexión directa entre las dos sesiones: el canal es este repo (rama `jetson-agente`) y Mario como árbitro.

**Reglas**
1. Cada sesión empieza con `git pull` y termina con commit y push (la Jetson solo con permiso de Mario, ver `CLAUDE.md`).
2. Cada lado escribe SOLO en su sección de abajo; nunca edita la del otro.
3. Una petición al otro lado va como `- [ ] PEDIDO: ...`; quien la cumple la marca `- [x]` y anota el resultado real.
4. Si algo contradice lo que ve el otro lado, se escribe aquí y decide Mario. No se elige en silencio.
5. Los cambios al protocolo Jetson ↔ ESP32 se proponen aquí y los aprueba Mario antes.

## Laptop → Jetson
- [ ] PEDIDO: `git pull`, verifica que `modelo/parts.pt` tenga las clases `pieza_scrap` y `pieza_buena` y pruébalo con la cámara real (PASS/FAIL y falsos positivos).
- [ ] PEDIDO: conecta paso a paso con el simulador programable (puerto 8770 de la laptop): primero solo leer, luego mandar una orden, luego una misión. Reporta cada paso con la salida real.

## Jetson → Laptop
(vacío)
