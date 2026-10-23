"""Alarmas y sesión de la HMI de la celda.

ISA-18.2: la alarma vive en el servidor (sobrevive a recargar la página),
con prioridad, causa y acción. El enlace PLC espera 2 s antes de alarmar
(banda muerta); el indicador de la pantalla puede marcarse antes.

IEC 62443, en esta HMI y nada más: quien manda el ciclo tiene que haber
iniciado sesión. Una sola cuenta de laboratorio. No es una certificación
del sistema. El paro de emergencia no pasa por aquí.
"""

import hashlib
import hmac
import os
import secrets
import threading
import time
from datetime import datetime

_LOCK = threading.Lock()
_SECRET = secrets.token_bytes(32)
# Una sola cuenta, rol admin. La contraseña NO está en el código (el repositorio es
# público): CELDA_HMI_CLAVE. Sin ella nadie puede iniciar sesión y la celda no
# acepta mandos. Usuario: CELDA_HMI_USUARIO (por defecto "admin").
# ponytail: una cuenta; directorio real si esto sale del laboratorio.

_SPECS = {
    "plc": {
        "sev": "FALLA",
        "priority": 1,
        "cause": "El controlador no responde",
        "action": "Detener la alimentación. No dar por bueno el dato de pantalla.",
    },
    "actuacion": {
        "sev": "FALLA",
        "priority": 1,
        "cause": "Visión en FAIL y el pistón no disparó",
        "action": "Retirar esa pieza a mano y reconocer.",
    },
    "detenida": {
        "sev": "AVISO",
        "priority": 3,
        "cause": "No hay pieza, o el operador pulsó Paro",
        "action": "Si falta pieza, revisar la alimentación. Si fue Paro, usar Arranque.",
    },
}

PLC_DEADBAND_S = 2.0

_alarms: list[dict] = []
_seq = 0
_prev_state = None
_seen: set[int] = set()
_plc_down_since = None
_plc_alarm_id = None
_stop_alarm_id = None


def reset():
    global _seq, _prev_state, _plc_down_since, _plc_alarm_id, _stop_alarm_id
    with _LOCK:
        _alarms.clear()
        _seen.clear()
        _seq = 0
        _prev_state = None
        _plc_down_since = None
        _plc_alarm_id = None
        _stop_alarm_id = None


def _raise(kind, text, active, event=False):
    global _seq
    spec = _SPECS[kind]
    _seq += 1
    _alarms.insert(0, {
        "id": _seq,
        "t": datetime.now().strftime("%H:%M:%S"),
        "sev": spec["sev"],
        "priority": spec["priority"],
        "text": text,
        "cause": spec["cause"],
        "action": spec["action"],
        "active": active,
        "acked": False,
        "event": event,
    })
    del _alarms[30:]
    return _seq


def _deactivate(alarm_id):
    for alarm in _alarms:
        if alarm["id"] == alarm_id:
            alarm["active"] = False


def observe(snap, now=None):
    """Registra transiciones. La primera lectura solo arma el seguimiento."""
    global _prev_state, _plc_down_since, _plc_alarm_id, _stop_alarm_id
    now = time.monotonic() if now is None else now
    with _LOCK:
        plc_ok = bool(snap["sources"]["plc"])
        state = snap["state"]
        if _prev_state is None:
            _seen.update(ev["pieza"] for ev in snap["recent"])
            _prev_state = state
            if not plc_ok:
                _plc_down_since = now
            return [dict(a) for a in _alarms]

        if not plc_ok:
            if _plc_down_since is None:
                _plc_down_since = now
            elif _plc_alarm_id is None and now - _plc_down_since >= PLC_DEADBAND_S:
                _plc_alarm_id = _raise("plc", "Enlace PLC perdido", True)
        else:
            _plc_down_since = None
            if _plc_alarm_id is not None:
                _deactivate(_plc_alarm_id)
                _plc_alarm_id = None

        if state == "DETENIDA" and _prev_state != "DETENIDA":
            reason = snap.get("reason") or "sin motivo"
            _stop_alarm_id = _raise("detenida", f"Celda detenida · {reason}", True)
        elif state != "DETENIDA" and _stop_alarm_id is not None:
            _deactivate(_stop_alarm_id)
            _stop_alarm_id = None

        for ev in snap["recent"]:
            if ev["pieza"] in _seen:
                continue
            _seen.add(ev["pieza"])
            if ev["accion"] == "fallo_actuacion":
                _raise(
                    "actuacion",
                    f"Pieza #{ev['pieza']} FAIL sin expulsar",
                    False,
                    event=True,
                )
        _prev_state = state
        return [dict(a) for a in _alarms]


def ack():
    with _LOCK:
        for alarm in _alarms:
            alarm["acked"] = True
        return [dict(a) for a in _alarms]


def clear():
    global _plc_alarm_id, _stop_alarm_id
    with _LOCK:
        _alarms.clear()
        _plc_alarm_id = None
        _stop_alarm_id = None
        return []


def can_clear(role):
    return role == "admin"


def clave_configurada():
    return bool(os.environ.get("CELDA_HMI_CLAVE"))


def login(user, password):
    clave = os.environ.get("CELDA_HMI_CLAVE")
    if not clave:
        return None
    usuario = os.environ.get("CELDA_HMI_USUARIO", "admin")
    # Se comparan los dos aunque el usuario ya falle, para no dar pistas por tiempo.
    ok_user = hmac.compare_digest(hashlib.sha256(user.encode()).digest(), hashlib.sha256(usuario.encode()).digest())
    ok_pass = hmac.compare_digest(hashlib.sha256(password.encode()).digest(), hashlib.sha256(clave.encode()).digest())
    if not (ok_user and ok_pass):
        return None
    exp = int(time.time()) + 8 * 3600
    payload = f"{user}|admin|{exp}"
    sig = hmac.new(_SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}|{sig}"


def read_token(token):
    if not token:
        return None
    parts = token.split("|")
    if len(parts) != 4:
        return None
    user, role, exp, sig = parts
    payload = f"{user}|{role}|{exp}"
    good = hmac.new(_SECRET, payload.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(good, sig):
        return None
    try:
        if int(exp) < time.time():
            return None
    except ValueError:
        return None
    if role != "admin":
        return None
    return {"user": user, "role": role}
