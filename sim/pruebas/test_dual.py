"""Modo simulación + ESP32 real a la vez (con un ESP32 "real" de mentiras por socket) y la visión simulada."""
import socket
import threading
import time

import pytest

from nucleo import mundo
from servidor import Servidor


class EspFalso:
    """Se hace pasar por el puerto serie del ESP32 real: guarda lo que le mandan."""

    def __init__(self):
        self.srv = socket.socket()
        self.srv.bind(("127.0.0.1", 0))
        self.srv.listen(1)
        self.recibido = b""
        threading.Thread(target=self._aceptar, daemon=True).start()

    @property
    def url(self):
        return f"socket://127.0.0.1:{self.srv.getsockname()[1]}"

    def _aceptar(self):
        c, _ = self.srv.accept()
        while d := c.recv(4096):
            self.recibido += d


class Cliente:
    def __init__(self):
        self.datos = b""

    def write(self, d):
        self.datos += d


def test_modo_dual_manda_las_ordenes_a_los_dos_y_los_programas_ven_el_real():
    esp = EspFalso()
    s = Servidor(None, ref=True)
    s.abrir_real(esp.url)
    s.sim.circuito.kcd1 = True
    s.sim.paso(0.2)
    prog = Cliente()
    s.usb_clientes.add(prog)
    # modo sim: la orden NO llega al real y el programa ve lo del simulado
    s._orden(b"HB" + bytes([10]))
    time.sleep(0.1)
    assert esp.recibido == b""
    s._salida_usb(b"ODO 1 0 0 0 0 0" + bytes([10]))
    assert prog.datos.startswith(b"ODO")
    prog.datos = b""
    # modo dual: llega a los dos y el programa ve lo del real, no lo del simulado
    s.cambiar_modo("dual")
    s._orden(b"DRV 1 1.0 0.3 0" + bytes([10]))
    time.sleep(0.2)
    assert esp.recibido == b"DRV 1 1.0 0.3 0" + bytes([10])
    s._salida_usb(b"ODO 9 9 9 9 9 9" + bytes([10]))
    assert prog.datos == b""
    s._entra_real(b"ODO 5 0.5 0.5 0.0 0.1 0.1" + bytes([10]) + b"PWR 12750 2140" + bytes([10]))
    assert prog.datos.startswith(b"ODO 5") and s.real_info["bat_v"] == 12.75 and s.real_info["paro_mv"] == 2140
    s._entra_real(b"ODO 6 1.0 1.0 0.0 0.1 0.1" + bytes([10]))
    assert abs(s.real_info["pose"][0] - 0.5) < 1e-6                       # 0.5 m recorridos desde que se alineó
    e = s.estado_json()
    assert e["modo"] == "dual" and e["real"]["dif_cm"] >= 0


def test_modo_dual_sin_esp32_da_un_error_claro():
    s = Servidor(None, ref=True)
    with pytest.raises(ValueError, match="--esp32"):
        s.cambiar_modo("dual")


def test_vision_persona_y_aruco():
    import math
    s = Servidor(None, ref=False)
    s.sim.colocar(-1.2, 0.0, math.pi)
    s.sim.extra.append(mundo.obstaculo_persona(-2.4, 0.0))
    v = s.sim.vision()
    assert v["obstacles"]["classes"] == ["person"] and v["obstacles"]["max_area_pct"] > 5
    s.sim.extra.clear()
    s.sim.colocar(-3.82, 0.0, math.pi / 2)               # punto de lectura de la descarga: ve el ArUco 1
    assert [a["id"] for a in s.sim.vision()["arucos"]] == [1]
    s.sim.colocar(-3.82, 1.0, math.pi / 2)               # más cerca queda por encima de la imagen
    assert s.sim.vision()["arucos"] == []
    assert s.info_cable("p28")["grupo"].startswith("Señales STEP")
