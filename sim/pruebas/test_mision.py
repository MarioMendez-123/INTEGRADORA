"""La misión de la Jetson (edge/navigation/mision.py) contra el firmware de referencia, en tiempo simulado."""
import math
import pathlib
import sys

import pytest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "edge" / "navigation"))
import mision  # noqa: E402
from firmware_ref import FirmwareRef  # noqa: E402
from nucleo import mundo  # noqa: E402
from nucleo.simulacion import Simulacion  # noqa: E402


class PuertoSim:
    """Hace de puerto serie: avanza el simulador mientras la misión espera."""

    def __init__(self, sim):
        self.sim, self.buf = sim, b""
        self.fw = FirmwareRef(sim, self._salir)
        sim.gancho = self.fw.paso
        self.salida = b""

    def _salir(self, datos):
        self.salida += datos

    def escribir(self, datos):
        self.sim.esp32.usb_rx += datos

    def lineas(self):
        self.sim.paso(0.02)
        datos, self.salida = self.salida, b""
        self.buf += datos
        *lineas, self.buf = self.buf.split(b"\n")
        return [x.decode().strip() for x in lineas if x.strip()]


def preparar():
    sim = Simulacion()
    sim.circuito.kcd1 = True
    sim.colocar(0.0, 0.0, 0.0)
    mision.time.monotonic = lambda: sim.t          # las esperas de la misión corren en tiempo simulado
    return sim, PuertoSim(sim)


def test_ida_y_vuelta_acoplan_en_las_dos_estaciones():
    sim, puerto = preparar()
    log = []
    m = mision.Mision(puerto, [0, 0, 0], log.append)
    m.cargar(mision.ruta_ida(0) + mision.ruta_vuelta())
    assert m.correr(limite_s=200) and "misión terminada" in log
    c = sim.carrito
    assert abs(c.x) < 0.01 and abs(c.y) < 0.01, (c.x, c.y)
    assert sum("retroceder" in x for x in log) == 2          # Lumina avisa antes de cada reversa


def test_caja_detras_da_atascado_y_abandona():
    sim, puerto = preparar()
    sim.extra.append(mundo.obstaculo_caja(-0.95, 0.0))
    log = []
    m = mision.Mision(puerto, [0, 0, 0], log.append)
    m.cargar(mision.ruta_ida(0))
    assert not m.correr(limite_s=60)
    assert any("atascado" in x for x in log)


def test_caja_en_la_recta_frena_sin_chocar_y_pide_ayuda():
    sim, puerto = preparar()
    sim.extra.append(mundo.obstaculo_caja(-2.4, 0.0))
    log = []
    m = mision.Mision(puerto, [0, 0, 0], log.append)
    m.cargar(mision.ruta_ida(0))
    m.siguiente()
    t0 = sim.t
    while sim.t - t0 < 60:
        for ln in puerto.lineas():
            m.recibir(ln)
        m.paso_tiempo()
    assert any("espero a que se quite" in x for x in log) and any("Necesito ayuda" in x for x in log)
    assert not sim.carrito.contactos and sim.carrito.x > -2.0 - 0.1
