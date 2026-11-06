"""La revisión de `escuchar.py` (Etapa 3 del paquete de la Jetson) y los archivos que el paquete promete."""
import importlib.util
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parents[2]
PAQUETE = RAIZ / "jetson_implementacion"
_spec = importlib.util.spec_from_file_location("escuchar", PAQUETE / "herramientas" / "escuchar.py")
escuchar = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(escuchar)

SANO = ["ESP32 listo: sensores ok, IMU ok", "ODO 100 0.0 0.0 12.50 0 0", "MOT 0 0 1", "RNG 500 800 900 150", "PWR 12800 2150"]


def test_lecturas_sanas_no_avisan():
    assert escuchar.revisar(SANO) == []


def test_paro_presionado_es_un_dato_no_una_falla():
    assert escuchar.revisar(SANO[:-1] + ["PWR 12800 0"]) == []


def test_cada_falla_da_su_aviso():
    assert any("ODO" in a for a in escuchar.revisar(SANO[:1]))
    assert any("CON FALLA" in a for a in escuchar.revisar(["ESP32 listo: sensores CON FALLA, IMU ok"] + SANO[1:]))
    assert any("nan" in a for a in escuchar.revisar([SANO[0], "ODO 100 0 0 nan 0 0"] + SANO[2:]))
    assert any("frontal" in a for a in escuchar.revisar(SANO[:3] + ["RNG 8190 800 900 150", SANO[4]]))
    assert any("Batería" in a for a in escuchar.revisar(SANO[:4] + ["PWR 10500 2150"]))
    assert any("dudosa" in a for a in escuchar.revisar(SANO[:4] + ["PWR 12800 1200"]))


def test_el_paquete_trae_lo_que_promete():
    for rel in ("CLAUDE.md", "PLAN.md", "ESTADO.md", "LEEME_MARIO.md", "empezar.sh", "modelo/parts.pt", "modelo/parts_report.json",
                "referencia/conexiones_3.21.md", "referencia/guia_armado_3.21.md", "herramientas/diagnostico.sh", "herramientas/instalar_modelo.sh"):
        assert (PAQUETE / rel).is_file(), rel
    claude = (PAQUETE / "CLAUDE.md").read_text(encoding="utf-8")
    assert "pieza_scrap" in claude and "PUERTA" in claude
