"""Palabra de activación tolerante (backend/voice/wake.py) y lo que la rodea en el servicio de voz.

Las formas "observadas" salen de la prueba real de Mario con vosk-model-small-es-0.42 («nómina», «luz mina»,
«lumínica», «luminoso», «mina») y de una corrida con voz sintética de Windows en silencio («lubina», «lo mina»,
«mina»). Los casos "no deben activar" son frases normales del español. Los FALSOS POSITIVOS CONOCIDOS se prueban a
propósito, para que el riesgo quede visible y no se descubra por sorpresa.
"""

import re
import sys
from pathlib import Path

import numpy as np
import pytest

BACKEND = Path(__file__).resolve().parents[2] / "backend"
sys.path.insert(0, str(BACKEND))

from voice.core import ACTIVE, EnergyVad, VoiceCore  # noqa: E402
from voice.wake import distancia, normalizar_activacion as n  # noqa: E402

# La misma expresión que dashboard/robot.js (LUMINA_PATTERN).
ROBOT_JS = re.compile(r"\b(lumina|ilumina|luminia|lumia)\b", re.IGNORECASE)


def activa(texto: str) -> bool:
    """¿robot.js activaría con lo que manda el servicio para este texto?"""
    return bool(ROBOT_JS.search(n(texto)))


@pytest.mark.parametrize(
    "oido, esperado",
    [
        ("nómina", "lumina"),                                       # observadas por Mario
        ("nómina abre el inventario", "lumina abre el inventario"),
        ("luz mina", "lumina"),
        ("luz mina inicia", "lumina inicia"),
        ("lumínica", "lumina"),
        ("luminoso inicia", "lumina inicia"),
        ("mina", "lumina"),
        ("lubina", "lumina"),                                       # voz sintética en silencio
        ("lubina inicia", "lumina inicia"),
        ("lo mina detente", "lumina detente"),
        ("lo mina", "lumina"),
        ("hola lo mina cómo estás", "hola lumina cómo estás"),      # tras un saludo
        ("Oye Lubina, ¿qué puedes hacer?", "Oye lumina, ¿qué puedes hacer?"),
        ("¿Lubina?", "¿lumina?"),                                   # puntuación y mayúsculas se respetan
        ("Mina, inicia", "lumina, inicia"),
        ("lumia detente", "lumina detente"),                        # a una letra y empieza con «lu»
        ("luminia detente", "lumina detente"),                      # robot.js ya la aceptaba; queda igual de válida
    ],
)
def test_formas_observadas_se_leen_como_lumina(oido, esperado):
    assert n(oido) == esperado
    assert activa(oido)


@pytest.mark.parametrize(
    "texto",
    [
        "lumina inicia",          # ya está bien: no se toca
        "Lumina",
        "ilumina la mesa",        # robot.js ya la acepta tal cual; aquí no se reescribe
        "",
        "   ",
        "hola",
        "abre el inventario",
        "enciende la cámara por favor",
        "¿cuántas piezas hay en el inventario?",
    ],
)
def test_lo_que_no_hay_que_reescribir_queda_igual(texto):
    assert n(texto) == texto


@pytest.mark.parametrize(
    "texto",
    [
        "la mina de carbón está cerca",       # «la mina»: artículo + sustantivo, no «lo mina»/«luz mina»
        "una mina de oro",
        "hay una mina de carbón cerca",       # «mina» en medio de la frase: solo se mira el inicio
        "necesito una lámina de acero",
        "lámina de acero",                    # a una letra de «lumina» pero no empieza con «lu»
        "esta luz ilumina la mesa",
        "lucía inicia",                       # nombre propio a dos letras
        "luna llena",                         # corta
        "la luna llena",
        "la lumbre del fuego",
        "camina hacia la mesa",               # termina en «mina» pero a dos letras de «lumina» y sin «lu»
        "termina la presentación",
        "elimina abre",
        "domina la situación",
        "por favor lubina inicia",            # la forma fuera de las dos primeras palabras
        "dime lo mina",
        "luz de la mina",                     # «luz» seguida de «de», no de «mina»
    ],
)
def test_frases_normales_no_se_reescriben(texto):
    assert n(texto) == texto


@pytest.mark.parametrize(
    "texto",
    [
        "nómina inicia sesión en el sistema",   # una frase REAL que empieza con «nómina»
        "mina de oro en el norte",
        "luminoso",                             # el adjetivo, dicho solo
    ],
)
def test_falsos_positivos_conocidos_quedan_a_la_vista(texto):
    """Es el costo de la tolerancia (medido con voz sintética: 4 de 25 frases sin «Lumina»; ver
    docs/auditoria/PALABRA_CLAVE.md). Si estas pruebas dejaran de activar, hay que actualizar ese documento."""
    assert activa(texto)


def test_distancia():
    assert distancia("lumina", "lumina") == 0
    assert distancia("lubina", "lumina") == 1
    assert distancia("nomina", "lumina") == 2
    assert distancia("", "abc") == 3


# ---------------------------------------------------------------- en el servicio y el núcleo

BLOCK = 1600
VOZ = (np.ones(BLOCK, dtype=np.int16) * 4000).tobytes()
RUIDO = (np.ones(BLOCK, dtype=np.int16) * 20).tobytes()


class MotorQueCierraSolo:
    """Como Vosk: devuelve texto desde accept() cuando CIERRA una frase por su detector de fin de frase."""

    def __init__(self, cierra_en=3, texto="lubina inicia", final=""):
        self.n, self.cierra_en, self.texto, self.final = 0, cierra_en, texto, final
        self.reseteado = 0

    def accept(self, pcm):
        self.n += 1
        return self.texto if self.n == self.cierra_en else None

    def finalize(self):
        return self.final

    def reset(self):
        self.reseteado += 1


def nucleo(motor):
    t = [0.0]
    emitidas = []

    def reloj():
        t[0] += 0.1
        return t[0]

    return VoiceCore(motor, EnergyVad(500), emitidas.append, clock=reloj, hangover_s=0.5, echo_tail_s=0.8), emitidas


def test_el_texto_que_el_motor_cierra_sale_de_inmediato_sin_esperar_al_silencio():
    """Con ruido constante el umbral de energía nunca baja: sin esto la frase tardaba hasta max_segment_s (20 s)."""
    core, emitidas = nucleo(MotorQueCierraSolo(cierra_en=3))
    for _ in range(2):
        core.feed(VOZ)
    assert emitidas == []
    core.feed(VOZ)  # el motor cierra la frase en este bloque
    assert emitidas == ["lubina inicia"]   # y sale ya, con la voz todavía sonando
    for _ in range(3):
        core.feed(VOZ)
    assert emitidas == ["lubina inicia"]   # y no se duplica


def test_lo_que_queda_al_cerrar_el_segmento_tambien_sale_sin_duplicar():
    core, emitidas = nucleo(MotorQueCierraSolo(cierra_en=2, texto="lubina", final="inicia"))
    for _ in range(3):
        core.feed(VOZ)
    for _ in range(8):
        core.feed(RUIDO)
    assert emitidas == ["lubina", "inicia"]  # dos fragmentos distintos; robot.js los junta (debounce de 600 ms)


def test_si_lumina_habla_el_texto_que_cierra_el_motor_se_tira():
    core, emitidas = nucleo(MotorQueCierraSolo(cierra_en=2))
    core.feed(VOZ)
    core.set_speaking(True)
    core.feed(VOZ)
    core.feed(VOZ)
    assert emitidas == []


def test_el_servicio_manda_lumina_aunque_el_motor_haya_oido_otra_cosa(monkeypatch):
    import test_voice_service as base

    s, fuente, enlace, _, _ = base.servicio([])
    s._on_transcript("lubina inicia")
    enviado = [m for m in enlace.enviado if m["type"] == "transcript"]
    assert enviado[-1]["text"] == "lumina inicia"
    assert activa(enviado[-1]["text"])


def test_con_la_tolerancia_apagada_el_texto_sale_tal_cual():
    import test_voice_service as base

    s, fuente, enlace, _, _ = base.servicio([], wake_fuzzy=False)
    s._on_transcript("lubina inicia")
    assert [m["text"] for m in enlace.enviado if m["type"] == "transcript"] == ["lubina inicia"]


def test_tecla_w_despierta_sin_hablar_y_solo_con_el_microfono_activo():
    import test_voice_service as base

    s, fuente, enlace, consola, _ = base.servicio([], teclas=["w", "p", "w"])
    s.start()
    s.step()  # w con el micrófono activo
    textos = [m["text"] for m in enlace.enviado if m["type"] == "transcript"]
    assert textos == ["lumina"]
    s.step()  # p: pausa
    s.step()  # w en pausa: no manda nada
    assert [m["text"] for m in enlace.enviado if m["type"] == "transcript"] == ["lumina"]


def test_la_ayuda_de_la_consola_menciona_la_tecla_w():
    from voice import console
    from datetime import datetime

    assert "[w]" in console.render_status("active", datetime.now())


def test_la_configuracion_nueva(monkeypatch):
    from voice.service import VoiceSettings

    monkeypatch.setenv("AETHER_VOICE_MODEL", "x")
    monkeypatch.delenv("AETHER_VOICE_WAKE_FUZZY", raising=False)
    monkeypatch.delenv("AETHER_VOICE_WHISPER_PROMPT", raising=False)
    s = VoiceSettings.from_env()
    assert s.wake_fuzzy is True and s.whisper_prompt == ""
    monkeypatch.setenv("AETHER_VOICE_WAKE_FUZZY", "off")
    monkeypatch.setenv("AETHER_VOICE_WHISPER_PROMPT", "Lumina.")
    s = VoiceSettings.from_env()
    assert s.wake_fuzzy is False and s.whisper_prompt == "Lumina."
    monkeypatch.setenv("AETHER_VOICE_WAKE_FUZZY", "tal vez")
    from settings import ConfigError

    with pytest.raises(ConfigError, match="AETHER_VOICE_WAKE_FUZZY"):
        VoiceSettings.from_env()


def test_vosk_devuelve_el_texto_cuando_su_detector_cierra_la_frase(monkeypatch, tmp_path):
    import json
    import types

    from voice.engine import VoskEngine

    class Reconocedor:
        def __init__(self, modelo, rate):
            self.cierra = [False, True, False]

        def AcceptWaveform(self, pcm):
            return self.cierra.pop(0)

        def Result(self):
            return json.dumps({"text": "  lubina inicia "})

        def FinalResult(self):
            return json.dumps({"text": ""})

        def Reset(self):
            pass

    falso = types.SimpleNamespace(SetLogLevel=lambda n: None, Model=lambda ruta: "m", KaldiRecognizer=Reconocedor)
    monkeypatch.setitem(sys.modules, "vosk", falso)
    motor = VoskEngine(str(tmp_path))
    assert motor.accept(b"\0") is None
    assert motor.accept(b"\0") == "lubina inicia"
    assert motor.accept(b"\0") is None


def test_whisper_acepta_un_prompt_opcional(monkeypatch):
    import types

    from voice.engine import WhisperEngine

    visto = {}

    class Modelo:
        def __init__(self, nombre, device, compute_type):
            pass

        def transcribe(self, audio, **kw):
            visto.update(kw)
            return [types.SimpleNamespace(text=" lumina ")], None

    monkeypatch.setitem(sys.modules, "faster_whisper", types.SimpleNamespace(WhisperModel=Modelo))
    motor = WhisperEngine("base", initial_prompt="Lumina.")
    motor.accept(b"\x00\x10" * 1600)
    assert motor.finalize() == "lumina" and visto["initial_prompt"] == "Lumina."
    motor2 = WhisperEngine("base")
    motor2.accept(b"\x00\x10" * 1600)
    motor2.finalize()
    assert visto["initial_prompt"] is None   # sin el opt-in no se manda prompt


def test_rss_mb_detecta_un_aumento_real_de_memoria():
    """Regresión: en Windows devolvía 0.0 siempre (el handle del proceso se truncaba a 32 bits)."""
    sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
    import probar_voz

    antes = probar_voz.rss_mb()
    assert antes is not None and antes > 1
    bloque = np.ones(40_000_000, dtype=np.uint8) + 1
    despues = probar_voz.rss_mb()
    assert despues - antes > 25, (antes, despues)
    del bloque
