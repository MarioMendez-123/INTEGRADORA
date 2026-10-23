"""Memoria y CPU del propio proceso, sin dependencias (para /status de los agentes)."""

import os
import time

from agent_contracts import ResourceStatus


def process_usage(previous: dict) -> ResourceStatus:
    """RSS (de /proc, solo Linux) y CPU del proceso desde la última vez que se preguntó (100 % = un núcleo).
    `previous` es un dict que el llamador conserva entre llamadas."""
    rss = None
    try:
        with open("/proc/self/statm", encoding="ascii") as handle:
            rss = round(int(handle.read().split()[1]) * os.sysconf("SC_PAGE_SIZE") / 1_048_576, 1)
    except (OSError, ValueError, AttributeError, IndexError):
        pass
    now, cpu = time.monotonic(), sum(os.times()[:2])
    cpu_pct = None
    if previous.get("wall") is not None and now > previous["wall"]:
        cpu_pct = round(100.0 * (cpu - previous["cpu"]) / (now - previous["wall"]), 1)
    previous["wall"], previous["cpu"] = now, cpu
    return ResourceStatus(rss_mb=rss, cpu_pct=cpu_pct)
