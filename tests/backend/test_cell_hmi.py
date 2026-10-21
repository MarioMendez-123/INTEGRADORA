"""Banda muerta del enlace PLC y el permiso de borrar alarmas."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

import cell_hmi


def snap(state="OPERANDO", plc=True, recent=None, reason=None):
    return {
        "state": state,
        "reason": reason,
        "sources": {"vision_linea": True, "plc": plc},
        "recent": recent or [],
    }


def setup_function():
    cell_hmi.reset()


def test_el_enlace_perdido_espera_la_banda_muerta():
    cell_hmi.observe(snap(state="SIN_CONEXION", plc=False), now=0)
    assert cell_hmi.observe(snap(state="SIN_CONEXION", plc=False), now=1.9) == []
    alarms = cell_hmi.observe(snap(state="SIN_CONEXION", plc=False), now=2)
    assert len(alarms) == 1
    assert alarms[0]["priority"] == 1
    assert alarms[0]["active"] is True
    back = cell_hmi.observe(snap(), now=3)
    assert back[0]["active"] is False


def test_la_primera_lectura_no_dispara_lo_que_ya_estaba():
    piece = {"pieza": 39, "accion": "fallo_actuacion", "resultado": "FAIL"}
    assert cell_hmi.observe(snap(recent=[piece]), now=0) == []
    fresh = {"pieza": 78, "accion": "fallo_actuacion", "resultado": "FAIL"}
    alarms = cell_hmi.observe(snap(recent=[fresh, piece]), now=1)
    assert [a["text"] for a in alarms] == ["Pieza #78 FAIL sin expulsar"]
    assert alarms[0]["event"] is True


def test_solo_admin_entra_y_borra_el_historico():
    assert cell_hmi.can_clear("operador") is False
    assert cell_hmi.can_clear("admin") is True
    assert cell_hmi.login("admin", "no") is None
    assert cell_hmi.login("operador", "celda-op") is None
    token = cell_hmi.login("admin", "admin")
    assert cell_hmi.read_token(token)["role"] == "admin"
