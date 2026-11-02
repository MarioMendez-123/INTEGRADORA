"""El canal de pines (puerto 7700) con los mismos mensajes que manda lib/sim_hal del firmware."""
import math

from nucleo.m0601 import crc8_maxim, trama
from servidor import Servidor


def test_firmware_por_el_canal_de_pines_mueve_la_rueda():
    s = Servidor(None)
    s.sim.colocar(-2.0, 0.0, math.pi)
    s.accion({"accion": "kcd1", "valor": True})
    s.sim.paso(0.05)
    h = s.atender_hal
    assert h(["HOLA", "nativo"]) == "OK"
    h(["PM", "4", "O"])
    h(["DW", "4", "0"])
    h(["U2", "115200", "16", "17"])
    rpm_leidas = []
    for _ in range(100):                                 # 2 s a 50 Hz, como el programa del paso 7
        t = trama(1, 0x64, 0, 30, 0, 0, 0, 0, 0)
        h(["DW", "4", "1"])
        h(["U2W", t.hex()])
        s.sim.paso(0.001)                                # flush(): 10 bytes a 115200 ≈ 0.9 ms
        h(["DW", "4", "0"])
        s.sim.paso(0.019)
        r = h(["U2R?"])
        if r != "-":
            b = bytes.fromhex(r)
            assert crc8_maxim(b[:9]) == b[9] and b[0] == 1
            rpm_leidas.append(int.from_bytes(b[4:6], "big", signed=True))
    assert len(rpm_leidas) > 90 and abs(rpm_leidas[-1] - 30) <= 2
    assert abs(s.sim.motor_izq.omega * 60 / (2 * math.pi) - 30) < 2


def test_paro_y_usb():
    s = Servidor(None)
    s.accion({"accion": "kcd1", "valor": True})
    s.sim.paso(0.05)
    assert 2000 < int(s.atender_hal(["AR?", "34"])) < 2400
    s.accion({"accion": "paro", "valor": True})
    assert int(s.atender_hal(["AR?", "34"])) < 100
    s.atender_hal(["U0W", b"hola\n".hex()])
    assert "hola" in s.monitor
    s.accion({"accion": "usb_enviar", "texto": "HB"})
    assert bytes.fromhex(s.atender_hal(["U0R?"])) == b"HB\n"
