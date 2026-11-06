"""Cuando cambian las clases, el modelo viejo no se usa de base ni bloquea la publicación del nuevo."""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "edge" / "perception"))
import train_parts as tp  # noqa: E402


def preparar(tmp_path):
    pesos, reporte, best = tmp_path / "parts.pt", tmp_path / "rep.json", tmp_path / "best.pt"
    pesos.write_bytes(b"viejo")
    best.write_bytes(b"nuevo")
    reporte.write_text(json.dumps({"classes": ["pieza_scrap"], "map50": 0.9}), encoding="utf-8")
    return pesos, reporte, best


def test_base_segun_las_clases(tmp_path):
    pesos, reporte, _ = preparar(tmp_path)
    assert tp.base_weights(pesos, ["pieza_scrap"], reporte) == str(pesos)
    assert tp.base_weights(pesos, ["pieza_scrap", "pieza_buena"], reporte) == "yolov8n.pt"


def test_publicar_con_otras_clases_aunque_baje_el_map(tmp_path):
    pesos, reporte, best = preparar(tmp_path)
    assert not tp.publish_if_better(best, 0.5, ["pieza_scrap"], pesos, reporte)
    assert pesos.read_bytes() == b"viejo"
    assert tp.publish_if_better(best, 0.5, ["pieza_scrap", "pieza_buena"], pesos, reporte)
    assert pesos.read_bytes() == b"nuevo"
