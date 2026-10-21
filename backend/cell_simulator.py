"""Estado SIMULADO de la celda de manufactura (banda + visión + pistón).

Simulado a propósito, a pedido de Mario (2026-09-30): el estado real vendrá
del segundo sistema de visión (Visión de línea, ADR 0010 sub-decisión 10c)
y del PLC, pero ninguno está conectado todavía. Mientras tanto, este módulo
da a dashboard/celda.html el mismo contrato que usará la fuente real
(`GET /line/cell/status`, ver contracts/rest_api.md), marcado siempre con
`"source": "simulado"` — la interfaz lo muestra como simulación, nunca como
datos de la celda.

Cuando se conecten Visión de línea y PLC, se reemplaza SOLO este módulo por
el que lea las fuentes reales; la página no cambia. No hay aquí nada
específico de PLC (protocolo, tópicos, pines): eso sigue pendiente de
hardware en mano (contracts/line_handshake_protocol.md, "Lo pendiente").

El guion es determinista (una línea de tiempo fija que se repite), no
aleatorio: dos pestañas abiertas ven lo mismo, y se puede probar. Los
eventos por pieza usan el vocabulario del handshake de la línea: Evento A
(`resultado` PASS/FAIL de Visión) y Evento B (`accion` del actuador).
"""

from datetime import datetime, timedelta

PIECE_EVERY_S = 4  # una pieza frente a la cámara cada 4 s mientras la banda corre
RECENT_LIMIT = 8

# (inicio_s, fin_s, estado, motivo, visión conectada, PLC conectado)
TIMELINE = [
    (0, 48, "OPERANDO", None, True, True),
    (48, 62, "DETENIDA", "Sin pieza en la banda", True, True),
    (62, 100, "OPERANDO", None, True, True),
    (100, 110, "SIN_CONEXION", "El PLC no responde", True, False),
    (110, 150, "OPERANDO", None, True, True),
    (150, 164, "DETENIDA", "Paro solicitado por el operador", True, True),
]
CYCLE_S = TIMELINE[-1][1]
OPERATING_SPANS = [(start, end) for start, end, state, *_ in TIMELINE if state == "OPERANDO"]
OPERATING_PER_CYCLE = sum(end - start for start, end in OPERATING_SPANS)


def _fails(piece: int) -> bool:
    return piece % 9 == 0 or piece % 13 == 0


def _piece_event(piece: int, at: datetime) -> dict:
    fails = _fails(piece)
    if not fails:
        action = "pieza_aceptada"
    elif piece % 39 == 0:
        # Visión decidió FAIL pero el pistón no disparó: se reporta como
        # tal, nunca como pieza aceptada (ver Evento B del handshake).
        action = "fallo_actuacion"
    else:
        action = "scrap_expulsado"
    return {
        "pieza": piece,
        "resultado": "FAIL" if fails else "PASS",
        "accion": action,
        "timestamp": at.isoformat(),
    }


def operating_seconds(elapsed_s: float) -> float:
    """Segundos con la banda en marcha desde el arranque del guion."""
    cycles, t = divmod(elapsed_s, CYCLE_S)
    partial = sum(min(max(t - start, 0), end - start) for start, end in OPERATING_SPANS)
    return cycles * OPERATING_PER_CYCLE + partial


def _time_at_operating(seconds: int) -> float:
    """Momento del guion en que los segundos en marcha acumulados llegan a `seconds`."""
    cycles, rem = divmod(seconds, OPERATING_PER_CYCLE)
    if rem == 0 and cycles:
        cycles, rem = cycles - 1, OPERATING_PER_CYCLE
    for start, end in OPERATING_SPANS:
        if rem <= end - start:
            return cycles * CYCLE_S + start + rem
        rem -= end - start
    raise AssertionError("inalcanzable: rem nunca excede OPERATING_PER_CYCLE")


def snapshot(elapsed_s: float, started_at: datetime, now: datetime, held: bool = False) -> dict:
    t = elapsed_s % CYCLE_S
    _, _, state, reason, vision_ok, plc_ok = next(
        span for span in TIMELINE if span[0] <= t < span[1]
    )

    produced = int(operating_seconds(elapsed_s) // PIECE_EVERY_S)
    failed = produced // 9 + produced // 13 - produced // 117  # múltiplos de 9 o de 13
    recent = [
        _piece_event(
            piece, started_at + timedelta(seconds=_time_at_operating(piece * PIECE_EVERY_S))
        )
        for piece in range(produced, max(produced - RECENT_LIMIT, 0), -1)
    ]
    return {
        "source": "simulado",
        "running": not held,
        "state": "DETENIDA" if held else state,
        "reason": "Paro solicitado por el operador" if held else reason,
        "sources": {"vision_linea": vision_ok, "plc": plc_ok},
        "counts": {"inspected": produced, "pass": produced - failed, "fail": failed},
        "recent": recent,
        "updated_at": now.isoformat(),
    }
