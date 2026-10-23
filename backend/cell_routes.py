"""Rutas HTTP de la celda de manufactura (/line/cell/*).

Las comparten backend/main.py (laptop) y backend/celda_agent.py (Raspberry Pi 4):
las dos montan este router, así que celda.html habla igual con cualquiera.
Esto solo expone el estado y los mandos de la celda; la lógica vive en
cell_line.py (pulsos) y cell_hmi.py (alarmas y sesión).
"""

from fastapi import APIRouter, Cookie, HTTPException, Response
from pydantic import BaseModel

import cell_hmi
from cell_line import celda

router = APIRouter()


class CellRunBody(BaseModel):
    on: bool


class CellLoginBody(BaseModel):
    user: str
    password: str


def _cell_payload() -> dict:
    snap = celda.snapshot()
    snap["alarms"] = cell_hmi.observe(snap)
    return snap


def _cell_who(token: str | None) -> dict:
    who = cell_hmi.read_token(token)
    if not who:
        raise HTTPException(status_code=401, detail="hace falta iniciar sesión en la celda")
    return who


@router.get("/line/cell/status")
def line_cell_status():
    return _cell_payload()


@router.post("/line/cell/session")
def line_cell_login(body: CellLoginBody, response: Response):
    token = cell_hmi.login(body.user, body.password)
    if not token:
        raise HTTPException(status_code=401, detail="cuenta rechazada")
    response.set_cookie("celda_session", token, httponly=True, samesite="lax", path="/")
    return cell_hmi.read_token(token)


@router.get("/line/cell/session")
def line_cell_session(celda_session: str | None = Cookie(default=None)):
    return _cell_who(celda_session)


@router.delete("/line/cell/session")
def line_cell_logout(response: Response):
    response.delete_cookie("celda_session", path="/")
    return {"ok": True}


@router.post("/line/cell/run")
def line_cell_run(body: CellRunBody, celda_session: str | None = Cookie(default=None)):
    _cell_who(celda_session)
    celda.set_running(body.on)
    return _cell_payload()


@router.post("/line/cell/alarms/ack")
def line_cell_ack(celda_session: str | None = Cookie(default=None)):
    _cell_who(celda_session)
    return {"alarms": cell_hmi.ack()}


@router.post("/line/cell/alarms/clear")
def line_cell_clear(celda_session: str | None = Cookie(default=None)):
    who = _cell_who(celda_session)
    if not cell_hmi.can_clear(who["role"]):
        raise HTTPException(status_code=403, detail="solo ingeniería borra el histórico")
    return {"alarms": cell_hmi.clear()}
