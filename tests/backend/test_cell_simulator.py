"""Pruebas del estado simulado de la celda (backend/cell_simulator.py)."""

import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

import cell_simulator as sim

START = datetime(2026, 9, 30, 12, 0, tzinfo=UTC)


def snap(elapsed):
    return sim.snapshot(elapsed, START, START + timedelta(seconds=elapsed))


def test_paro_del_operador_congela_conteo_y_estado():
    live = snap(10)
    held = sim.snapshot(10, START, START, held=True)
    assert live["running"] is True and live["state"] == "OPERANDO"
    assert held["running"] is False
    assert held["state"] == "DETENIDA"
    assert held["reason"] == "Paro solicitado por el operador"
    assert held["counts"] == live["counts"]


def test_guion_recorre_los_tres_estados_y_siempre_se_declara_simulado():
    assert snap(10)["state"] == "OPERANDO"
    assert snap(50)["state"] == "DETENIDA"
    assert snap(50)["reason"] == "Sin pieza en la banda"
    sin_conexion = snap(105)
    assert sin_conexion["state"] == "SIN_CONEXION"
    assert sin_conexion["sources"] == {"vision_linea": True, "plc": False}
    assert snap(sim.CYCLE_S + 10)["state"] == "OPERANDO"  # el guion se repite
    assert all(snap(t)["source"] == "simulado" for t in range(0, 400, 7))


def test_no_se_producen_piezas_con_la_banda_detenida_o_sin_conexion():
    assert snap(48)["counts"] == snap(61.9)["counts"]
    assert snap(100)["counts"] == snap(109.9)["counts"]
    assert snap(70)["counts"]["inspected"] > snap(61.9)["counts"]["inspected"]


def test_conteos_y_eventos_recientes_son_coherentes():
    for elapsed in (0, 3, 4, 47, 200, 1000, 5000):
        s = snap(elapsed)
        counts = s["counts"]
        fails = sum(sim._fails(p) for p in range(1, counts["inspected"] + 1))
        assert counts == {
            "inspected": counts["inspected"],
            "pass": counts["inspected"] - fails,
            "fail": fails,
        }
        pieces = [e["pieza"] for e in s["recent"]]
        assert pieces == sorted(pieces, reverse=True)[: sim.RECENT_LIMIT]
        assert pieces == list(
            range(counts["inspected"], counts["inspected"] - len(pieces), -1)
        )
        for event in s["recent"]:
            # vocabulario del handshake: una pieza PASS nunca se expulsa y un
            # FAIL nunca se reporta como aceptado
            if event["resultado"] == "PASS":
                assert event["accion"] == "pieza_aceptada"
            else:
                assert event["accion"] in ("scrap_expulsado", "fallo_actuacion")
            # cada pieza sale en un momento con la banda en marcha
            at = (datetime.fromisoformat(event["timestamp"]) - START).total_seconds()
            t = at % sim.CYCLE_S
            assert (
                any(start <= t <= end for start, end in sim.OPERATING_SPANS) or t == 0
            )
            assert at <= elapsed
