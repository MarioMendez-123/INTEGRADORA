"""Scripts de medición de voz (scripts/comparar_motores.py, grabar_pruebas.py, probar_voz.py, voz_sintetica.*).

No miden nada real: comprueban que corren, que sus cuentas son correctas con un motor falso y que los archivos de apoyo
son válidos. (Una versión de comparar_motores.py llegó a tener un error de sintaxis que ninguna prueba veía.)
"""

import importlib.util
import json
import sys
import wave
from pathlib import Path

import numpy as np
import pytest

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "backend"))
sys.path.insert(0, str(RAIZ / "scripts"))


def cargar(nombre):
    spec = importlib.util.spec_from_file_location(nombre, RAIZ / "scripts" / f"{nombre}.py")
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def escribir_wav(ruta, muestras):
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
        w.writeframes(np.asarray(muestras, dtype=np.int16).tobytes())


class MotorQueOyeLubina:
    name = "falso"

    def __init__(self):
        self.n = 0

    def accept(self, pcm):
        self.n += 1

    def finalize(self):
        self.n = 0
        return "lubina inicia"


class MotorQueOyeMina:
    name = "falso2"

    def accept(self, pcm):
        return None

    def finalize(self):
        return "mina de oro en el norte"


@pytest.fixture()
def carpeta(tmp_path):
    t = np.arange(16000)
    tono = (3000 * np.sin(2 * np.pi * 220 * t / 16000)).astype(np.int16)
    escribir_wav(tmp_path / "wake_00.wav", tono)
    escribir_wav(tmp_path / "wake_01.wav", tono)
    escribir_wav(tmp_path / "nowake_00.wav", tono)
    return tmp_path


def test_comparar_motores_cuenta_activaciones_y_falsos_con_la_regla_exacta_y_la_tolerante(carpeta, monkeypatch, capsys):
    comparar = cargar("comparar_motores")
    monkeypatch.setattr(comparar, "motor", lambda nombre, prompt: MotorQueOyeLubina())
    monkeypatch.setattr(sys, "argv", ["comparar_motores", "--carpeta", str(carpeta), "--motores", "falso"])
    assert comparar.main() == 0
    salida = capsys.readouterr().out
    assert "activa (regla exacta)  : 0/2" in salida          # robot.js no entiende «lubina»
    assert "activa (regla tolerante): 2/2" in salida         # voice/wake.py sí
    assert "FALSOS (exacta)        : 0/1" in salida
    assert "FALSOS (tolerante)     : 1/1" in salida          # y el costo: «lubina» en una frase que no debía activar
    assert "factor de tiempo real" in salida and "latencia al cerrar" in salida and "CPU" in salida


def test_comparar_motores_con_varios_niveles_de_ruido_y_motor_ausente(carpeta, monkeypatch, capsys):
    comparar = cargar("comparar_motores")
    from voice.engine import EngineUnavailable

    def motor(nombre, prompt):
        if nombre == "whisper:base":
            raise EngineUnavailable("Falta el paquete 'faster-whisper'.")
        return MotorQueOyeMina()

    monkeypatch.setattr(comparar, "motor", motor)
    monkeypatch.setattr(sys, "argv", ["comparar_motores", "--carpeta", str(carpeta), "--motores", "vosk", "whisper:base",
                                      "--snr", "10", "-5", "--ruido", "blanco"])
    assert comparar.main() == 0
    salida = capsys.readouterr().out
    assert salida.count("################") == 4 and "ruido blanco a +10 dB" in salida and "ruido blanco a -5 dB" in salida
    assert "SE SALTA" in salida and "faster-whisper" in salida   # un motor no instalado no tumba la comparación


def test_el_ruido_simulado_respeta_la_relacion_pedida():
    comparar = cargar("comparar_motores")
    rng = np.random.default_rng(1)
    voz = (3000 * np.sin(2 * np.pi * 220 * np.arange(32000) / 16000)).astype(np.float64)
    clips = {"wake_00": voz, "otro_1": voz * 0.5, "otro_2": voz * 0.7, "otro_3": voz * 0.9}
    for tipo in ("murmullo", "blanco"):
        mezcla = comparar.con_ruido(clips, "wake_00", 10, rng, tipo)
        ruido = mezcla - voz
        snr = 20 * np.log10(np.sqrt(np.mean(voz**2)) / np.sqrt(np.mean(ruido**2)))
        assert snr == pytest.approx(10, abs=0.5), (tipo, snr)


def test_comparar_motores_rechaza_wav_con_otro_formato(tmp_path):
    comparar = cargar("comparar_motores")
    with wave.open(str(tmp_path / "malo.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(44100)
        w.writeframes(b"\0" * 400)
    with pytest.raises(ValueError, match="mono, 16000 Hz"):
        comparar.leer(tmp_path / "malo.wav")


def test_grabar_pruebas_importa_y_guarda_wav_validos(tmp_path):
    grabar = cargar("grabar_pruebas")
    grabar.guardar(tmp_path / "x.wav", b"\x01\x00" * 160)
    with wave.open(str(tmp_path / "x.wav"), "rb") as w:
        assert (w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()) == (16000, 1, 2, 160)
    assert any(f.startswith("Lumina") for f in grabar.FRASES_WAKE) and not any("umina" in f for f in grabar.FRASES_NOWAKE)


def test_frases_de_la_voz_sintetica_son_validas():
    datos = json.loads((RAIZ / "scripts" / "voz_sintetica_frases.json").read_text(encoding="utf-8"))
    assert len(datos["wake"]) >= 5 and len(datos["nowake"]) >= 10
    assert all(f.split(",")[0].split()[-1].lower().startswith("lumina") for f in datos["wake"])
    assert (RAIZ / "scripts" / "voz_sintetica.ps1").read_bytes().isascii()  # PowerShell 5.1 lee mal los acentos sin BOM


def test_las_grabaciones_de_prueba_nunca_se_versionan():
    ignorado = (RAIZ / ".gitignore").read_text(encoding="utf-8")
    assert "pruebas_voz/" in ignorado and "pruebas_voz_sintetica/" in ignorado
