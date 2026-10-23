"""Servicio de voz (backend/voice/): ciclo, teclas, enlace, motores, aviso de Windows y consola.

Todo con dobles. La última prueba levanta un servidor real con el relevo /voice/ws y conecta el servicio de voz
y una "página" por WebSocket de verdad (biblioteca websockets), con audio simulado.
"""

import json
import socket
import subprocess
import sys
import threading
import time
import types
from datetime import datetime
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

import voice.engine as engine_module  # noqa: E402
from agent_contracts import VoiceStatus, VoiceTranscript, parse_voice_message  # noqa: E402
from settings import ConfigError  # noqa: E402
from voice import console, notify  # noqa: E402
from voice.audio import ListSource  # noqa: E402
from voice.core import ACTIVE, PAUSED  # noqa: E402
from voice.engine import EngineUnavailable, VoskEngine, WhisperEngine, create_engine  # noqa: E402
from voice.hublink import HubLink  # noqa: E402
from voice.service import VoiceService, VoiceSettings  # noqa: E402

BLOCK = 1600
RUIDO = (np.ones(BLOCK, dtype=np.int16) * 20).tobytes()
VOZ = (np.ones(BLOCK, dtype=np.int16) * 4000).tobytes()


def esperar(condicion, timeout=5.0):
    limite = time.monotonic() + timeout
    while time.monotonic() < limite:
        if condicion():
            return True
        time.sleep(0.01)
    return False


def ajustes(**cambios):
    base = dict(server="ws://127.0.0.1:8000/voice/ws", engine="vosk", model="m", device="", start_active=True,
                echo_tail_s=0.0, vad_threshold=500.0, log_text=False, notify=True)
    base.update(cambios)
    return VoiceSettings(**base)


class MotorFalso:
    def __init__(self):
        self.n = 0

    def accept(self, pcm):
        pass

    def finalize(self):
        self.n += 1
        return f"frase {self.n}"

    def reset(self):
        pass


class EnlaceFalso:
    connected = True
    on_speaking = None
    on_connect = None

    def __init__(self):
        self.enviado = []

    def send(self, mensaje):
        self.enviado.append(mensaje)


class Teclas:
    def __init__(self, *teclas):
        self.teclas = list(teclas)

    def poll(self):
        return self.teclas.pop(0) if self.teclas else None


class Consola:
    def __init__(self):
        self.lineas, self.mensajes = [], []

    def show(self, texto):
        self.lineas.append(texto)

    def message(self, texto):
        self.mensajes.append(texto)


def reloj_de_100_ms():
    """Cada lectura del reloj avanza 100 ms: un bloque de audio por vuelta, como con el micrófono real."""
    cuenta = [0]

    def reloj():
        cuenta[0] += 1
        return cuenta[0] * 0.1

    return reloj


def servicio(blocks, teclas=(), **cambios):
    fuente, enlace, consola, avisos = ListSource(blocks), EnlaceFalso(), Consola(), []
    s = VoiceService(
        ajustes(**cambios), MotorFalso(), fuente, enlace, console=consola, keys=Teclas(*teclas),
        notify=lambda t, x, habilitado: avisos.append((t, x, habilitado)), clock=reloj_de_100_ms(),
    )
    return s, fuente, enlace, consola, avisos


# ------------------------------------------------------------------ ciclo del servicio


def test_arranque_abre_el_microfono_avisa_y_publica_el_estado():
    s, fuente, enlace, consola, avisos = servicio([])
    s.start()
    assert fuente.started is True
    assert enlace.enviado[0]["type"] == "status" and enlace.enviado[0]["state"] == "active"
    assert avisos == [("Aether · micrófono", "ACTIVO", True)]
    assert "Solo viaja TEXTO" in consola.mensajes[0]


def test_una_frase_sale_como_mensaje_valido_con_solo_texto():
    s, fuente, enlace, _, _ = servicio([VOZ] * 3 + [RUIDO] * 10)
    s.start()
    s._wall = lambda: datetime(2026, 10, 23, 15, 0, 0)
    for _ in range(13):
        s.step()
    textos = [m for m in enlace.enviado if m["type"] == "transcript"]
    assert [t["text"] for t in textos] == ["frase 1"]
    VoiceTranscript.model_validate(textos[0])  # cumple el contrato
    assert set(textos[0]) == {"v", "type", "text", "t"}  # nada de audio ni campos extra


def test_tecla_p_pausa_suelta_el_microfono_y_reanuda():
    s, fuente, enlace, consola, avisos = servicio([RUIDO] * 5, teclas=[None, "p", None, "p"])
    s.start()
    s.step()
    assert fuente.started is True
    s.step()  # tecla p -> pausa
    assert s.core.state == PAUSED and fuente.started is False  # el dispositivo se soltó de verdad
    assert enlace.enviado[-1]["state"] == "paused"
    assert "PAUSADO" in consola.lineas[-1]
    s.step()
    s.step()  # tecla p -> reanuda
    assert s.core.state == ACTIVE and fuente.started is True and fuente.start_count == 2
    assert [a[1] for a in avisos] == ["ACTIVO", "PAUSADO", "ACTIVO"]
    assert "ACTIVO" in consola.lineas[-1]


def test_tecla_q_sale_y_al_parar_avisa_apagado():
    s, fuente, enlace, consola, avisos = servicio([], teclas=["q"])
    s.start()
    assert s.step() is False
    s.stop()
    assert fuente.started is False and enlace.enviado[-1]["state"] == "off"
    assert avisos[-1][1] == "APAGADO" and "APAGADO" in consola.mensajes[-1]


def test_arrancar_apagado_por_configuracion_no_abre_el_microfono():
    s, fuente, enlace, _, avisos = servicio([VOZ] * 5, start_active=False)
    s.start()
    assert fuente.started is False and fuente.start_count == 0
    assert enlace.enviado[0]["state"] == "paused" and avisos[0][1] == "PAUSADO"
    for _ in range(3):
        s.step()
    assert [m for m in enlace.enviado if m["type"] == "transcript"] == []


def test_anti_eco_via_el_enlace():
    s, fuente, enlace, consola, _ = servicio([VOZ] * 3 + [RUIDO] * 10)
    s.start()
    enlace.on_speaking(True)  # la página avisa que Lumina habla
    for _ in range(13):
        s.step()
    assert [m for m in enlace.enviado if m["type"] == "transcript"] == []
    assert "Lumina habla" in consola.lineas[-1]


def test_la_notificacion_se_puede_apagar_por_configuracion():
    s, _, _, _, avisos = servicio([], notify=False)
    s.start()
    assert avisos == [("Aether · micrófono", "ACTIVO", False)]


def test_banner_de_consola():
    texto = console.render_status("active", datetime(2026, 10, 23, 15, 4, 5), "sin conexión")
    assert "MICRÓFONO ACTIVO" in texto and "15:04:05" in texto and "[p]" in texto and "sin conexión" in texto
    assert "PAUSADO" in console.render_status("paused", datetime.now())
    assert "APAGADO" in console.render_status("off", datetime.now())
    assert "No se guarda" not in console.render_header("vosk", "ws://x", datetime.now())  # el texto exacto va en el encabezado
    assert "Solo viaja TEXTO" in console.render_header("vosk", "ws://x", datetime.now())


def test_linea_de_estado_no_repite_lo_mismo():
    class Flujo:
        def __init__(self):
            self.escrito = []

        def write(self, t):
            self.escrito.append(t)

        def flush(self):
            pass

    flujo = Flujo()
    linea = console.StatusLine(flujo)
    linea.show("a")
    linea.show("a")
    linea.show("b")
    assert len(flujo.escrito) == 2


# ------------------------------------------------------------------ configuración


def test_configuracion_por_defecto_exige_el_modelo(monkeypatch):
    for n in ("AETHER_VOICE_SERVER", "AETHER_VOICE_ENGINE", "AETHER_VOICE_MODEL", "AETHER_VOICE_START"):
        monkeypatch.delenv(n, raising=False)
    with pytest.raises(ConfigError, match="AETHER_VOICE_MODEL"):
        VoiceSettings.from_env()
    monkeypatch.setenv("AETHER_VOICE_MODEL", "C:/modelos/vosk-es")
    s = VoiceSettings.from_env()
    assert s.engine == "vosk" and s.start_active is True and s.log_text is False and s.notify is True
    assert s.echo_tail_s == 0.8 and s.vad_threshold == 500.0


@pytest.mark.parametrize(
    "nombre, valor",
    [("AETHER_VOICE_SERVER", "http://127.0.0.1:8000"), ("AETHER_VOICE_ENGINE", "google"),
     ("AETHER_VOICE_START", "tal vez"), ("AETHER_VOICE_VAD_THRESHOLD", "0"), ("AETHER_VOICE_ECHO_TAIL_S", "-1")],
)
def test_configuracion_invalida_nombra_la_variable(monkeypatch, nombre, valor):
    monkeypatch.setenv("AETHER_VOICE_MODEL", "x")
    monkeypatch.setenv(nombre, valor)
    with pytest.raises(ConfigError, match=nombre):
        VoiceSettings.from_env()


# ------------------------------------------------------------------ motores


def test_vosk_sin_paquete_o_sin_modelo_dice_que_hacer(monkeypatch, tmp_path):
    monkeypatch.setitem(sys.modules, "vosk", None)  # simula "no instalado"
    with pytest.raises(EngineUnavailable, match="requirements-voice"):
        VoskEngine(str(tmp_path))
    falso = types.SimpleNamespace(SetLogLevel=lambda n: None)
    monkeypatch.setitem(sys.modules, "vosk", falso)
    with pytest.raises(EngineUnavailable, match="vosk-model-small-es"):
        VoskEngine(str(tmp_path / "no-existe"))


def test_vosk_adaptador_con_biblioteca_falsa(monkeypatch, tmp_path):
    class Reconocedor:
        def __init__(self, modelo, rate):
            self.rate, self.audio, self.reseteado = rate, 0, 0

        def AcceptWaveform(self, pcm):
            self.audio += len(pcm)

        def FinalResult(self):
            return json.dumps({"text": "  hola lumina "})

        def Reset(self):
            self.reseteado += 1

    falso = types.SimpleNamespace(SetLogLevel=lambda n: None, Model=lambda ruta: "modelo", KaldiRecognizer=Reconocedor)
    monkeypatch.setitem(sys.modules, "vosk", falso)
    motor = create_engine("vosk", str(tmp_path))
    motor.accept(b"\x00" * 3200)
    assert motor.finalize() == "hola lumina"
    motor.reset()
    assert motor._recognizer.reseteado == 1 and motor._recognizer.rate == engine_module.SAMPLE_RATE


def test_whisper_adaptador_con_biblioteca_falsa(monkeypatch):
    visto = {}

    class Modelo:
        def __init__(self, nombre, device, compute_type):
            visto["args"] = (nombre, device, compute_type)

        def transcribe(self, audio, **kw):
            visto["kw"], visto["muestras"] = kw, len(audio)
            return [types.SimpleNamespace(text=" hola "), types.SimpleNamespace(text="mundo ")], None

    monkeypatch.setitem(sys.modules, "faster_whisper", types.SimpleNamespace(WhisperModel=Modelo))
    motor = WhisperEngine("base")
    motor.accept(b"\x00\x10" * 1600)
    assert motor.finalize() == "hola mundo"
    assert visto["args"] == ("base", "cpu", "int8") and visto["kw"]["language"] == "es" and visto["muestras"] == 1600
    assert motor.finalize() == ""  # el audio no se conserva después de usarlo


def test_motor_desconocido():
    with pytest.raises(EngineUnavailable, match="google"):
        create_engine("google", "")


# ------------------------------------------------------------------ enlace


class WsFalso:
    def __init__(self, entrantes=()):
        self.entrantes, self.enviados, self.cerrado = list(entrantes), [], False

    def send(self, raw):
        self.enviados.append(json.loads(raw))

    def recv(self, timeout=None):
        if self.entrantes:
            return self.entrantes.pop(0)
        time.sleep(timeout or 0.01)
        raise TimeoutError

    def close(self):
        self.cerrado = True


def test_enlace_conecta_envia_y_entrega_speaking():
    ws = WsFalso(['{"v":1,"type":"speaking","value":true}', "basura", '{"v":1,"type":"speaking","value":"si"}'])
    visto, conectado = [], []
    enlace = HubLink("ws://x", on_speaking=visto.append, on_connect=lambda: conectado.append(1), connect=lambda url: ws)
    enlace.send({"v": 1, "type": "status", "state": "active"})
    enlace.start()
    try:
        assert esperar(lambda: ws.enviados and visto == [True])
    finally:
        enlace.stop()
    assert conectado and ws.enviados[0]["state"] == "active" and ws.cerrado


def test_enlace_reconecta_con_espera_y_tira_lo_viejo():
    intentos = []

    def conectar(url):
        intentos.append(url)
        if len(intentos) == 1:
            raise ConnectionRefusedError("servidor apagado")
        return WsFalso()

    ahora = [0.0]
    enlace = HubLink("ws://x", connect=conectar, max_age_s=10.0, clock=lambda: ahora[0])
    enlace.send({"viejo": True})
    ahora[0] = 50.0  # pasó mucho tiempo con el servidor caído
    enlace.send({"nuevo": True})
    enlace.start()
    try:
        assert esperar(lambda: enlace.connected, timeout=6)
        assert esperar(lambda: enlace.sent_total == 1)
    finally:
        enlace.stop()
    assert len(intentos) == 2 and enlace.dropped_total == 1


# ------------------------------------------------------------------ aviso de Windows


def test_notificacion_de_windows_no_mete_el_texto_en_el_script(monkeypatch):
    llamadas = []
    monkeypatch.setattr(notify.sys, "platform", "win32")
    monkeypatch.setattr(subprocess, "Popen", lambda args, **kw: llamadas.append((args, kw)))
    texto = "ACTIVO'; Remove-Item C:\\ -Recurse #"
    assert notify.notify_windows("Aether", texto) is True
    args, kw = llamadas[0]
    assert texto not in " ".join(args)  # el texto viaja por el entorno, no por la línea de comandos
    assert kw["env"]["AETHER_NOTIFY_TEXT"] == texto[:200] and "-NoProfile" in args


def test_notificacion_apagada_o_fuera_de_windows_no_hace_nada(monkeypatch):
    llamadas = []
    monkeypatch.setattr(subprocess, "Popen", lambda *a, **k: llamadas.append(1))
    monkeypatch.setattr(notify.sys, "platform", "win32")
    assert notify.notify_windows("a", "b", enabled=False) is False
    monkeypatch.setattr(notify.sys, "platform", "linux")
    assert notify.notify_windows("a", "b") is False and llamadas == []


def test_notificacion_si_powershell_falla_solo_se_registra(monkeypatch):
    monkeypatch.setattr(notify.sys, "platform", "win32")

    def falla(*a, **k):
        raise FileNotFoundError("powershell.exe")

    monkeypatch.setattr(subprocess, "Popen", falla)
    assert notify.notify_windows("a", "b") is False


# ------------------------------------------------------------------ de punta a punta con servidor y WebSocket reales


def test_punta_a_punta_servicio_servidor_y_pagina():
    """Servicio de voz (audio simulado) -> HubLink real -> /voice/ws real -> página (cliente websockets).
    Después la página avisa speaking y el servicio deja de reconocer."""
    import uvicorn
    from fastapi import FastAPI
    from websockets.sync.client import connect

    from agent_routes import create_router

    router, _ = create_router(lambda observation: None)
    app = FastAPI()
    app.include_router(router)
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        puerto = s.getsockname()[1]
    servidor = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", port=puerto, log_level="warning"))
    hilo = threading.Thread(target=servidor.run, daemon=True)
    hilo.start()
    try:
        assert esperar(lambda: servidor.started, timeout=10)
        base = f"ws://127.0.0.1:{puerto}/voice/ws"
        with connect(f"{base}?role=listener", open_timeout=3) as pagina:
            _escenario_extremo_a_extremo(base, pagina)
    finally:
        servidor.should_exit = True
        hilo.join(timeout=10)


def _escenario_extremo_a_extremo(base, pagina):
    fuente = ListSource([VOZ] * 3 + [RUIDO] * 10)
    enlace = HubLink(f"{base}?role=service")
    svc = VoiceService(ajustes(), MotorFalso(), fuente, enlace, console=Consola(), keys=Teclas(),
                       notify=lambda *a: None, clock=reloj_de_100_ms())
    enlace.start()
    try:
        assert esperar(lambda: enlace.connected)
        svc.start()
        recibidos = []
        for _ in range(13):
            svc.step()
        limite = time.monotonic() + 5
        while time.monotonic() < limite and not any(m["type"] == "transcript" for m in recibidos):
            try:
                recibidos.append(json.loads(pagina.recv(timeout=0.5)))
            except TimeoutError:
                pass
        estado = [parse_voice_message(json.dumps(m), "service") for m in recibidos if m["type"] in {"status", "transcript"}]
        assert any(isinstance(m, VoiceStatus) and m.state == "active" for m in estado)
        texto = [m for m in estado if isinstance(m, VoiceTranscript)]
        assert texto and texto[0].text == "frase 1"

        pagina.send(json.dumps({"v": 1, "type": "speaking", "value": True}))
        assert esperar(lambda: svc.core.speaking is True)
        pagina.send(json.dumps({"v": 1, "type": "speaking", "value": False}))
        assert esperar(lambda: svc.core.speaking is False)
    finally:
        enlace.stop()


# ------------------------------------------------------------------ script de medición (lo corre Mario)


def _cargar_script(nombre):
    import importlib.util

    ruta = Path(__file__).resolve().parents[2] / "scripts" / nombre
    spec = importlib.util.spec_from_file_location(nombre[:-3], ruta)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def test_probar_voz_wer_y_medicion_con_wav(tmp_path, monkeypatch, capsys):
    import wave

    probar = _cargar_script("probar_voz.py")
    assert probar.palabras_erradas("abre el inventario", "abre el inventario") == 0
    assert probar.palabras_erradas("abre el inventario", "abre inventario") == pytest.approx(1 / 3)
    assert probar.palabras_erradas("hola", "") == 1.0

    wav_ruta = tmp_path / "frase.wav"
    with wave.open(str(wav_ruta), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        wav.writeframes(VOZ * 10)  # 1 s
    motor = MotorFalso()
    motor.name = "falso"
    monkeypatch.setattr(probar, "create_engine", lambda nombre, modelo: motor)
    assert probar.medir_wav(str(wav_ruta), "frase 1") == 0
    salida = capsys.readouterr().out
    assert "audio                    : 1.0 s" in salida and "'frase 1'" in salida and "WER" in salida and "0 %" in salida

    mal = tmp_path / "estereo.wav"
    with wave.open(str(mal), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(44100)
        wav.writeframes(b"\x00" * 400)
    assert probar.medir_wav(str(mal), None) == 2
    assert "mono, 16000 Hz" in capsys.readouterr().out


def test_sin_pyzbar_el_motor_sigue_funcionando(monkeypatch):
    import perception_pipeline

    monkeypatch.setitem(sys.modules, "pyzbar", None)
    monkeypatch.setitem(sys.modules, "pyzbar.pyzbar", None)
    motor = perception_pipeline.engine_for(object())
    assert motor._decode(np.zeros((4, 4, 3), dtype=np.uint8)) == []
