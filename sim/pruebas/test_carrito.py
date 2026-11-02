"""La librería carrito.py (edge/navigation) contra el firmware de referencia, en tiempo simulado."""
import pathlib
import sys

import pytest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "edge" / "navigation"))
import carrito as lib  # noqa: E402
from nucleo import mundo  # noqa: E402
from test_mision import preparar  # noqa: E402


def nuevo(obstaculo=None):
    sim, puerto = preparar()
    lib.time.monotonic = lambda: sim.t
    if obstaculo:
        sim.extra.append(obstaculo)
    c = lib.Carrito(puerto, decir=lambda t: None)
    c.listo()
    return sim, c


def test_recta_con_reversa_y_giro():
    sim, c = nuevo()
    c.retroceder(0.60)
    c.girar_a(180)
    c.avanzar(1.0)
    x, y, th = c.pose()
    assert abs(sim.carrito.x - -1.6) < 0.05 and abs(sim.carrito.y) < 0.03, (sim.carrito.x, sim.carrito.y)
    assert abs(x - sim.carrito.x) < 0.05 and abs(abs(th) - 180) < 3                  # la pose de la librería sigue al carrito real


def test_ir_a_y_acoplar_en_la_banda():
    sim, c = nuevo()
    c.retroceder(0.6)
    c.girar_a(180)
    c.avanzar(1.0)
    c.ir_a(-2.0, 0.0)          # 0.4 m más allá, mirando a la banda al terminar
    c.girar_a(0)
    c.acoplar(2.0)
    assert abs(sim.carrito.x) < 0.01 and abs(sim.carrito.y) < 0.01
    assert c.distancia("frente") < 8190


def test_obstaculo_frena_y_levanta_error_si_no_llega():
    sim, c = nuevo(mundo.obstaculo_caja(-1.5, 0.0))
    c.retroceder(0.6)
    c.girar_a(180)
    with pytest.raises(lib.ErrorCarrito):
        c._ejecutar("DRV {id} 2.0 0.35 180", tiempo_max=12)          # el obstáculo no se quita: no llega
    assert not sim.carrito.contactos and sim.carrito.x > -1.5 + 0.2


def test_paro_levanta_falla():
    sim, c = nuevo()
    c.retroceder(0.6)
    sim.circuito.paro_presionado = True
    sim.circuito.evaluar()
    with pytest.raises(lib.ErrorCarrito):
        c.girar_a(180)


def test_vision_en_la_libreria():
    import math
    sim, c = nuevo()
    c.fuente_vision = sim.vision
    sim.colocar(-1.2, 0.0, math.pi)
    assert not c.hay_persona()
    sim.extra.append(mundo.obstaculo_persona(-2.4, 0.0))
    assert c.hay_persona(3.0) and c.vision()["obstaculos"]["clases"] == ["person"]
    c.fuente_vision = None
    with pytest.raises(lib.ErrorCarrito):
        c.vision()
