"""Pruebas del núcleo: cada una falla si el comportamiento físico o eléctrico se rompe."""
import math

from nucleo.electrico import Circuito
from nucleo.m0601 import crc8_maxim, trama
from nucleo.simulacion import Simulacion


def manejar(ident, rpm, freno=False, acc=0):
    v = rpm & 0xFFFF
    return trama(ident, 0x64, v >> 8, v, 0, 0, acc, 0xFF if freno else 0, 0)


def encendido(x=-2.0, y=0.0, th=math.pi):
    s = Simulacion()
    s.colocar(x, y, th)                              # lejos de todo, mirando hacia -x
    s.circuito.kcd1 = True
    s.paso(0.05)
    for g, n in ((4, 1),):
        s.esp32.pin_mode(g, "O", s.t)
        s.esp32.digital_write(g, n, s.t)
    s.esp32.uart2_begin(115200, 16, 17)
    return s


def mandar(s, izq, der, segundos, freno=False):
    for _ in range(int(segundos * 50)):          # 50 Hz, como pide el M0601
        s.esp32.digital_write(4, 1, s.t)
        s.esp32.uart2_write(manejar(1, izq, freno) + manejar(2, der, freno), s.t)
        s.esp32.digital_write(4, 0, s.t + 0.002)
        s.paso(0.02)
        s.esp32.uart2_read(s.t)


def test_crc_maxim():
    assert crc8_maxim(b"123456789") == 0xA1


def test_energia_como_en_la_guia():
    c = Circuito()
    assert c.estado()["v"]["xl4005"] == 0
    c.kcd1 = True
    c.evaluar()
    e = c.estado()
    assert e["v"]["xl4005"] == 5.05 and e["v"]["elevador"] == 18.0 and e["esp32_vivo"]
    assert 2.0 <= e["v"]["gpio34"] <= 2.4                # la guía pide medir 2.0–2.4 V
    c.paro_presionado = True
    c.evaluar()
    e = c.estado()
    assert e["v"]["elevador"] == 0 and e["v"]["gpio34"] == 0 and e["esp32_vivo"]


def test_conexiones_de_la_guia_321():
    c = Circuito()
    assert {"p102", "p103"} <= {x["id"] for x in c.cables}
    assert c.volt("VM.+") in (None, 0.0)                # sin KCD1, el voltímetro queda apagado
    c.kcd1 = True
    c.evaluar()
    e = c.estado()
    assert e["v"]["elevador"] == 18.0 and e["esp32_vivo"]   # los capacitores no conducen: nada cambia
    assert c.dif("C11.+", "C11.-") == 5.05 and c.dif("C18.+", "C18.-") == 18.0
    assert c.dif("VM.+", "VM.-") > 12
    c.conectar("F10.out", "BAT.-")
    assert not c.fusible_ok["F10"] and any("fusible 5 A" in a for a in c.avisos)


def test_limite_de_corriente_del_elevador():
    s = encendido()
    pico = 0.0
    for _ in range(3):
        mandar(s, 60, 60, 0.2)
        pico = max(pico, s.circuito.i_motores)
    assert pico < 6.0 and s.circuito.estado()["v"]["elevador"] == 18.0   # manejar normal no llega al límite
    s = encendido()
    s.circuito.i_cc = 0.4
    bajo = 18.0
    for _ in range(10):
        mandar(s, 60, 60, 0.1)
        bajo = min(bajo, s.circuito.estado()["v"]["elevador"])
    assert bajo < 18.0


def test_corto_quema_fusible_y_12v_quema_esp32():
    c = Circuito()
    c.kcd1 = True
    c.conectar("ELEV.OUT+", "ELEV.OUT-")                # corto a la salida: el elevador se protege
    c.conectar("F15.out", "J1.GND")                     # corto real en la rama de motores
    c.evaluar()
    assert not c.fusible_ok["F15"] and c.fusible_ok["F10"]
    c2 = Circuito()
    c2.kcd1 = True
    c2.cortar("h19")
    c2.conectar("RELE.VCC", "E.34")                    # el error que advierte la guía
    c2.evaluar()
    assert "ESP32" in c2.danos


def test_rueda_gira_con_tramas_y_queda_suelta_sin_ellas():
    s = encendido()
    mandar(s, 60, 60, 2.0)
    v_esperada = 60 * 2 * math.pi / 60 * 0.051
    assert abs(s.carrito.v - v_esperada) < 0.02, s.carrito.v
    assert s.motor_izq.tramas_ok > 90 and s.esp32.contador["rx_ok"] > 90
    s.paso(0.5)                                        # dejan de llegar tramas: rueda libre
    assert s.motor_izq.par == 0 and s.carrito.v > 0.05  # sigue rodando, frenada solo por la fricción


def test_freno_detiene_y_rueda_libre_no():
    a, b = encendido(), encendido()
    mandar(a, 60, 60, 2.0)
    mandar(b, 60, 60, 2.0)
    xa, xb = a.carrito.x, b.carrito.x
    mandar(a, 0, 0, 1.0, freno=True)
    b.paso(1.0)
    assert abs(a.carrito.x - xa) < abs(b.carrito.x - xb)
    assert abs(a.carrito.v) < 0.01


def test_a_y_b_cruzados_no_hay_comunicacion():
    s = encendido()
    for cid in ("h24", "h26"):
        s.circuito.cortar(cid)
    s.circuito.conectar("J3.A", "ML.B")
    s.circuito.conectar("J3.B", "ML.A")
    mandar(s, 60, 60, 1.0)
    assert s.motor_izq.tramas_ok == 0 and abs(s.carrito.v) < 0.001


def test_de_siempre_en_alto_pierde_las_respuestas():
    s = encendido()
    for _ in range(50):
        s.esp32.uart2_write(manejar(1, 30) + manejar(2, 30), s.t)
        s.paso(0.02)
    s.esp32.uart2_read(s.t)
    assert s.esp32.contador["rx_ok"] == 0 and s.esp32.contador["rx_perdidas"] > 0
    assert s.motor_izq.tramas_ok > 40                    # el motor sí recibe: solo se pierden las respuestas


def test_vl53_misma_direccion_y_xshut():
    s = encendido()
    e = s.esp32
    assert not e.vl_init(0x29)                          # los 4 en 0x29: choque en el bus
    for g in (32, 33, 15):                              # apaga los 3 de obstáculos
        e.pin_mode(g, "O", s.t)
        e.digital_write(g, 0, s.t)
    assert e.vl_init(0x29) and e.vl_set_address(0x29, 0x33)
    for i, g in enumerate((32, 33, 15)):               # enciende uno por uno y cambia su dirección
        e.digital_write(g, 1, s.t)
        assert e.vl_init(0x29) and e.vl_set_address(0x29, 0x30 + i)
    assert {e.vl_init(a) for a in (0x30, 0x31, 0x32, 0x33)} == {True}
    assert e.vl_read(0x30) == 8190                      # nada enfrente a menos de 1.2 m


def test_acople_en_guias_en_v_centra_el_carrito():
    s = encendido(-0.60, 0.035, 0.0)                   # 3.5 cm de error lateral
    mandar(s, 10, 10, 14.0)                             # ~5.3 cm/s hacia la banda
    assert s.carrito.x > 0 - 0.002 and abs(s.carrito.y) < 0.003, (s.carrito.x, s.carrito.y)
    assert any("tope" in c for c in s.carrito.contactos)


def test_frontal_ve_un_obstaculo():
    from nucleo import mundo
    s = encendido()
    s.extra.append(mundo.obstaculo_persona(-2.8, 0.0))
    d = s.sensores.distancia_mm("VL0")
    assert 440 < d < 530, d                             # 0.8 − 0.167 (sensor) − 0.15 (persona) = 0.483 m
