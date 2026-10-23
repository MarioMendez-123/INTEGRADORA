"""Variables de entorno: valores por defecto, errores claros y URLs normalizadas."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))

import settings  # noqa: E402
from settings import ConfigError  # noqa: E402


def test_int_con_defecto_y_rango(monkeypatch):
    monkeypatch.delenv("X_N", raising=False)
    assert settings.env_int("X_N", 5, minimo=1, maximo=9) == 5
    monkeypatch.setenv("X_N", "7")
    assert settings.env_int("X_N", 5, minimo=1, maximo=9) == 7
    monkeypatch.setenv("X_N", "diez")
    with pytest.raises(ConfigError, match="X_N.*entero.*diez"):
        settings.env_int("X_N", 5)
    monkeypatch.setenv("X_N", "99")
    with pytest.raises(ConfigError, match="a lo más 9"):
        settings.env_int("X_N", 5, maximo=9)


def test_bool_y_choice(monkeypatch):
    monkeypatch.setenv("X_B", "on")
    assert settings.env_bool("X_B", False) is True
    monkeypatch.setenv("X_B", "quizá")
    with pytest.raises(ConfigError, match="X_B"):
        settings.env_bool("X_B", False)
    monkeypatch.setenv("X_C", "ASYNC")
    assert settings.env_choice("X_C", "sync", ("sync", "async")) == "async"
    monkeypatch.setenv("X_C", "otro")
    with pytest.raises(ConfigError, match="uno de sync, async"):
        settings.env_choice("X_C", "sync", ("sync", "async"))


@pytest.mark.parametrize(
    "raw, esperado",
    [
        ("http://10.4.5.103:8001", "http://10.4.5.103:8001"),
        ("http://10.4.5.103:8001/", "http://10.4.5.103:8001"),
        ("https://jetson.local", "https://jetson.local"),
        ("http://[fe80::1]:8001", "http://[fe80::1]:8001"),
    ],
)
def test_url_valida_se_normaliza(monkeypatch, raw, esperado):
    monkeypatch.setenv("X_URL", raw)
    assert settings.env_url("X_URL") == esperado


@pytest.mark.parametrize(
    "raw",
    ["10.4.5.103:8001", "ftp://x", "http://u:p@host:1", "http://host:8001/ruta", "http://host:99999", "http://host?x=1"],
)
def test_url_invalida_falla_con_el_nombre_de_la_variable(monkeypatch, raw):
    monkeypatch.setenv("X_URL", raw)
    with pytest.raises(ConfigError, match="X_URL"):
        settings.env_url("X_URL")


def test_url_vacia_es_no_configurada(monkeypatch):
    monkeypatch.delenv("X_URL", raising=False)
    assert settings.env_url("X_URL") == ""


def test_cidrs(monkeypatch):
    monkeypatch.setenv("X_NETS", "10.4.5.0/24, 192.168.55.0/24")
    assert [str(n) for n in settings.env_cidrs("X_NETS")] == ["10.4.5.0/24", "192.168.55.0/24"]
    monkeypatch.setenv("X_NETS", "no-es-red")
    with pytest.raises(ConfigError, match="X_NETS.*no-es-red"):
        settings.env_cidrs("X_NETS")
