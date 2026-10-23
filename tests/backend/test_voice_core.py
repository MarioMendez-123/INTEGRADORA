"""Núcleo del servicio de voz (backend/voice/core.py): segmentación, pausa, anti-eco y privacidad.

Sin micrófono ni reconocedor real: motor y reloj son dobles.
"""

import re
import sys
from pathlib import Path

import numpy as np
import pytest

BACKEND = Path(__file__).resolve().parents[2] / "backend"
sys.path.insert(0, str(BACKEND))

from voice.core import ACTIVE, OFF, PAUSED, EnergyVad, VoiceCore  # noqa: E402

BLOCK = 1600  # 100 ms a 16 kHz
RUIDO = (np.ones(BLOCK, dtype=np.int16) * 20).tobytes()      # silencio de cuarto
VOZ = (np.ones(BLOCK, dtype=np.int16) * 4000).tobytes()      # voz fuerte


class Reloj:
    def __init__(self):
        self.t = 100.0

    def __call__(self):
        return self.t

    def avanza(self, s):
        self.t += s


class MotorFalso:
    def __init__(self, texto="abre el inventario"):
        self.texto = texto
        self.recibido = []
        self.finalizado = 0
        self.reseteado = 0

    def accept(self, pcm):
        self.recibido.append(pcm)

    def finalize(self):
        self.finalizado += 1
        out, self.recibido = self.texto, []
        return out

    def reset(self):
        self.reseteado += 1
        self.recibido = []


def nucleo(**kw):
    reloj, motor, textos, estados = Reloj(), MotorFalso(), [], []
    core = VoiceCore(
        motor, EnergyVad(500), textos.append, estados.append, clock=reloj,
        hangover_s=0.5, pre_roll_s=0.3, echo_tail_s=0.8, **kw,
    )

    def bloque(pcm, dt=0.1):
        reloj.avanza(dt)
        core.feed(pcm)

    return core, motor, textos, estados, reloj, bloque


def test_energy_vad():
    assert EnergyVad.rms(b"") == 0.0
    assert EnergyVad(500).is_voice(VOZ) and not EnergyVad(500).is_voice(RUIDO)
    assert EnergyVad.rms(VOZ) == pytest.approx(4000, rel=0.01)


def test_la_frase_se_cierra_tras_el_silencio_y_se_envia_una_vez():
    core, motor, textos, _, _, bloque = nucleo()
    for _ in range(5):
        bloque(RUIDO)
    assert textos == [] and motor.recibido == []  # el silencio no llega al reconocedor
    for _ in range(4):
        bloque(VOZ)
    assert textos == []  # sigue hablando: no se cierra
    for _ in range(4):
        bloque(RUIDO)
    assert textos == []  # 0.4 s de silencio < 0.5 s de espera: todavía puede seguir la frase
    for _ in range(2):
        bloque(RUIDO)
    assert textos == ["abre el inventario"] and motor.finalizado == 1
    for _ in range(10):
        bloque(RUIDO)
    assert textos == ["abre el inventario"]  # no repite


def test_el_pre_roll_conserva_el_comienzo_de_la_frase():
    core, motor, _, _, _, bloque = nucleo()
    for _ in range(6):
        bloque(RUIDO)
    bloque(VOZ)
    # 0.3 s de pre-roll = 3 bloques de silencio + el de voz
    assert len(motor.recibido) == 4 and motor.recibido[-1] == VOZ


def test_segmento_demasiado_largo_se_cierra_solo():
    core, motor, textos, _, _, bloque = nucleo(max_segment_s=1.0)
    for _ in range(15):
        bloque(VOZ)
    assert textos and motor.finalizado >= 1


def test_anti_eco_lo_que_se_oye_mientras_lumina_habla_se_tira():
    core, motor, textos, _, _, bloque = nucleo()
    for _ in range(3):
        bloque(VOZ)
    core.set_speaking(True)  # Lumina empieza a hablar con una frase a medias
    assert motor.reseteado == 1 and core.discarded_segments == 1
    for _ in range(20):
        bloque(VOZ)  # su propia voz por las bocinas
        bloque(RUIDO)
    assert textos == [] and motor.recibido == []


def test_anti_eco_cola_despues_de_que_termina():
    core, motor, textos, _, reloj, bloque = nucleo()
    core.set_speaking(True)
    core.set_speaking(False)
    for _ in range(5):  # 0.5 s < cola de 0.8 s: todavía se ignora
        bloque(VOZ)
    assert motor.recibido == []
    reloj.avanza(1.0)
    for _ in range(3):
        bloque(VOZ)
    for _ in range(6):
        bloque(RUIDO)
    assert textos == ["abre el inventario"]


def test_si_lumina_empieza_a_hablar_mientras_se_decodifica_el_texto_se_tira():
    core, motor, textos, _, _, bloque = nucleo()
    original = motor.finalize

    def finalize_y_lumina_habla():
        core.speaking = True  # carrera: Lumina arrancó justo mientras se decodificaba
        return original()

    motor.finalize = finalize_y_lumina_habla
    for _ in range(3):
        bloque(VOZ)
    for _ in range(6):
        bloque(RUIDO)
    assert textos == [] and core.discarded_segments == 1


def test_pausa_ignora_el_audio_y_avisa_los_cambios_de_estado():
    core, motor, textos, estados, _, bloque = nucleo()
    core.set_state(PAUSED)
    for _ in range(10):
        bloque(VOZ)
    assert motor.recibido == [] and textos == [] and estados == [PAUSED]
    core.set_state(PAUSED)  # sin cambio: no repite aviso
    core.set_state(ACTIVE)
    assert estados == [PAUSED, ACTIVE]
    for _ in range(2):
        bloque(VOZ)
    for _ in range(6):
        bloque(RUIDO)
    assert textos == ["abre el inventario"]


def test_pausar_a_mitad_de_frase_la_descarta():
    core, motor, textos, _, _, bloque = nucleo()
    for _ in range(3):
        bloque(VOZ)
    core.set_state(PAUSED)
    core.set_state(ACTIVE)
    for _ in range(8):
        bloque(RUIDO)
    assert textos == [] and motor.reseteado == 1


def test_estado_inicial_pausado_no_escucha():
    reloj, motor, textos = Reloj(), MotorFalso(), []
    core = VoiceCore(motor, EnergyVad(500), textos.append, clock=reloj, initial_state=PAUSED)
    for _ in range(5):
        reloj.avanza(0.1)
        core.feed(VOZ)
    assert motor.recibido == [] and core.state == PAUSED and OFF == "off"


def test_privacidad_el_paquete_de_voz_no_escribe_audio_a_disco():
    """Revisión estática: ningún módulo que toca audio abre archivos, guarda wav ni usa soundfile."""
    for nombre in ("core.py", "audio.py", "engine.py", "hublink.py"):
        codigo = (BACKEND / "voice" / nombre).read_text(encoding="utf-8")
        sin_comentarios = re.sub(r'"""[\s\S]*?"""', "", codigo)
        sin_comentarios = re.sub(r"#.*", "", sin_comentarios)
        for prohibido in (r"\bopen\(", r"\bwave\b", r"soundfile", r"tofile", r"write_bytes", r"\.write\("):
            assert not re.search(prohibido, sin_comentarios), f"{nombre} contiene {prohibido}"
