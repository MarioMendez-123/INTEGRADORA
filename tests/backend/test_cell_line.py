"""Los dos pulsos salen de un juicio real. No hay piezas inventadas."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

from cell_line import CeldaReal


class Pines:
    def __init__(self):
        self.abiertas = True
        self.pin_piston = 8
        self.pin_banda = 9
        self.eventos = []

    def poner(self, pin, alto):
        if not self.abiertas:
            return False
        self.eventos.append((pin, alto))
        return True

    def apagar(self):
        self.poner(self.pin_piston, False)
        self.poner(self.pin_banda, False)


def esperar_instantaneo(segundos, abort):
    esperas.append(segundos)
    return not abort.is_set()


esperas = []


def celda():
    esperas.clear()
    return CeldaReal(
        salidas=Pines(),
        esperar=esperar_instantaneo,
        espera_piston=3,
        piston_encendido=1,
        piston_regreso=2,
        pulso_banda=0.5,
        estables=2,
    )


def test_pass_solo_pulsa_la_banda():
    c = celda()
    c.correr_ya("PASS")
    assert esperas == [0.5]
    assert c.salidas.eventos == [(9, True), (9, False), (8, False), (9, False)]
    snap = c.snapshot()
    assert snap["source"] == "celda"
    assert snap["counts"] == {"inspected": 1, "pass": 1, "fail": 0}
    assert snap["recent"][0]["accion"] == "pieza_aceptada"


def test_fail_pulsa_el_piston_y_despues_la_banda():
    c = celda()
    c.correr_ya("FAIL")
    assert esperas == [3, 1, 2, 0.5]
    altos = [ev for ev in c.salidas.eventos if ev[1]]
    assert altos == [(8, True), (9, True)]
    assert c.snapshot()["counts"] == {"inspected": 1, "pass": 0, "fail": 1}
    assert c.snapshot()["recent"][0]["accion"] == "scrap_expulsado"


def test_la_misma_pieza_no_dispara_dos_veces():
    c = celda()
    c.en_hilo = False
    c.ver("FAIL")
    c.ver("FAIL")
    c.ver("FAIL")
    c.ver("FAIL")
    assert c.snapshot()["counts"]["inspected"] == 1
    c.ver("SIN_PIEZA")
    c.ver("SIN_PIEZA")
    assert c._armed


def test_sin_pines_no_se_anota_como_expulsada():
    c = celda()
    c.salidas.abiertas = False
    c.correr_ya("FAIL")
    assert c.snapshot()["recent"][0]["accion"] == "fallo_actuacion"
    assert c.snapshot()["sources"]["plc"] is False
