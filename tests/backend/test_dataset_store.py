"""Conteo del dataset de piezas y la regla de publicar pesos."""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "edge" / "perception"))

import dataset_store
import train_parts
from model_weights import resolve_yolo_weights


def _touch(path: Path, mtime: float, text: str = "") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    os_utime = __import__("os").utime
    os_utime(path, (mtime, mtime))


def test_snapshot_vacio(tmp_path):
    data = dataset_store.snapshot(tmp_path)
    assert data["totals"] == {"pieces": 0, "images": 0, "labeled": 0, "unlabeled": 0}
    assert data["classes"] == []
    assert data["recent"] == []


def test_snapshot_cuenta_fotos_por_pieza(tmp_path):
    (tmp_path / "classes.txt").write_text("tornillo_m6\nbracket_a\n", encoding="utf-8")
    _touch(tmp_path / "images" / "train" / "a.jpg", 1_700_000_000)
    _touch(tmp_path / "labels" / "train" / "a.txt", 1_700_000_000, "0 0.5 0.5 0.2 0.2\n")
    _touch(tmp_path / "images" / "train" / "b.jpg", 1_700_000_100)
    _touch(
        tmp_path / "labels" / "train" / "b.txt",
        1_700_000_100,
        "0 0.2 0.2 0.1 0.1\n1 0.8 0.8 0.1 0.1\n",
    )
    _touch(tmp_path / "images" / "val" / "c.png", 1_700_000_200)
    _touch(tmp_path / "labels" / "val" / "c.txt", 1_700_000_200, "1 0.5 0.5 0.3 0.3\n")
    _touch(tmp_path / "images" / "train" / "suelta.jpg", 1_700_000_300)

    data = dataset_store.snapshot(tmp_path)
    by_name = {row["name"]: row for row in data["classes"]}

    assert data["totals"] == {"pieces": 2, "images": 4, "labeled": 3, "unlabeled": 1}
    assert by_name["tornillo_m6"]["train"] == 2
    assert by_name["tornillo_m6"]["val"] == 0
    assert by_name["tornillo_m6"]["total"] == 2
    assert by_name["bracket_a"]["train"] == 1
    assert by_name["bracket_a"]["val"] == 1
    assert by_name["bracket_a"]["total"] == 2
    assert data["recent"][0]["file"] == "suelta.jpg"
    assert data["recent"][0]["piece"] is None
    assert data["recent"][1]["piece"] == "bracket_a"


def test_snapshot_acepta_etiqueta_con_bom(tmp_path):
    (tmp_path / "classes.txt").write_text("tornillo_m6\n", encoding="utf-8")
    _touch(tmp_path / "images" / "train" / "a.jpg", 1_700_000_000)
    label = tmp_path / "labels" / "train" / "a.txt"
    label.parent.mkdir(parents=True, exist_ok=True)
    label.write_bytes("\ufeff0 0.5 0.5 0.2 0.2\n".encode("utf-8"))

    data = dataset_store.snapshot(tmp_path)

    assert data["totals"]["labeled"] == 1
    assert data["classes"][0]["total"] == 1
    assert data["recent"][0]["piece"] == "tornillo_m6"


def test_add_class_rechaza_nombre_invalido_y_duplicado(tmp_path):
    with pytest.raises(ValueError):
        dataset_store.add_class("Tornillo M6", tmp_path)
    created = dataset_store.add_class("tornillo_m6", tmp_path)
    assert created["classes"][0]["name"] == "tornillo_m6"
    assert (tmp_path / "images" / "train").is_dir()
    assert (tmp_path / "labels" / "val").is_dir()
    with pytest.raises(FileExistsError):
        dataset_store.add_class("tornillo_m6", tmp_path)


def test_resolve_yolo_weights(tmp_path, monkeypatch):
    missing = tmp_path / "parts.pt"
    monkeypatch.setattr(dataset_store, "default_weights_file", lambda: missing)
    monkeypatch.delenv("YOLO_WEIGHTS", raising=False)
    assert dataset_store.resolve_yolo_weights() == "yolov8n.pt"

    missing.write_bytes(b"pt")
    assert dataset_store.resolve_yolo_weights() == str(missing)

    monkeypatch.setenv("YOLO_WEIGHTS", "otro.pt")
    assert dataset_store.resolve_yolo_weights() == "otro.pt"


def test_model_weights_del_edge_respeta_el_entorno(tmp_path, monkeypatch):
    monkeypatch.setattr(sys.modules["model_weights"], "WEIGHTS_FILE", tmp_path / "no.pt")
    monkeypatch.delenv("YOLO_WEIGHTS", raising=False)
    assert resolve_yolo_weights() == "yolov8n.pt"
    monkeypatch.setenv("YOLO_WEIGHTS", "forzado.pt")
    assert resolve_yolo_weights() == "forzado.pt"


def _fake_run(map50: float, payload: bytes):
    def runner(data_yaml, epochs, imgsz, batch, patience, device, runs_dir, base_weights_path="yolov8n.pt"):
        save = runs_dir / "parts"
        (save / "weights").mkdir(parents=True, exist_ok=True)
        (save / "weights" / "best.pt").write_bytes(payload)
        (save / "results.csv").write_text(
            "epoch,metrics/mAP50(B)\n1,0.10\n2," + str(map50) + "\n",
            encoding="utf-8",
        )
        return save

    return runner


def _ready_dataset(tmp_path: Path) -> None:
    (tmp_path / "classes.txt").write_text("# nota\ntornillo_m6\n", encoding="utf-8")
    (tmp_path / "images" / "train").mkdir(parents=True)
    (tmp_path / "images" / "val").mkdir(parents=True)
    (tmp_path / "images" / "train" / "a.jpg").write_bytes(b"img")
    (tmp_path / "images" / "val" / "b.jpg").write_bytes(b"img")


def test_train_publica_solo_si_el_map_sube(tmp_path):
    _ready_dataset(tmp_path)
    weights = tmp_path / "weights" / "parts.pt"
    report = tmp_path / "weights" / "parts_report.json"
    runs = tmp_path / "runs"

    first = train_parts.train_parts(
        tmp_path,
        runs_dir=runs,
        weights_path=weights,
        report_path=report,
        runner=_fake_run(0.55, b"primero"),
    )
    assert first["published"] is True
    assert weights.read_bytes() == b"primero"
    assert json.loads(report.read_text(encoding="utf-8"))["map50"] == 0.55
    assert "tornillo_m6" in (tmp_path / "data.yaml").read_text(encoding="utf-8")

    second = train_parts.train_parts(
        tmp_path,
        runs_dir=runs,
        weights_path=weights,
        report_path=report,
        runner=_fake_run(0.40, b"peor"),
    )
    assert second["published"] is False
    assert weights.read_bytes() == b"primero"

    third = train_parts.train_parts(
        tmp_path,
        runs_dir=runs,
        weights_path=weights,
        report_path=report,
        runner=_fake_run(0.70, b"mejor"),
    )
    assert third["published"] is True
    assert weights.read_bytes() == b"mejor"


def test_bandeja_se_reparte_sola(tmp_path):
    (tmp_path / "classes.txt").write_text("tornillo_m6\n", encoding="utf-8")
    stem = "pieza_fija"
    expected = dataset_store.split_for(stem)
    _touch(tmp_path / "images" / "inbox" / f"{stem}.jpg", 1_700_000_000)
    _touch(tmp_path / "labels" / "inbox" / f"{stem}.txt", 1_700_000_000, "0 0.5 0.5 0.2 0.2\n")

    data = dataset_store.snapshot(tmp_path)

    assert data["classes"][0][expected] == 1
    assert data["recent"][0]["split"] == expected


def _jpeg(color) -> str:
    import cv2
    import numpy as np

    image = np.zeros((48, 48, 3), dtype=np.uint8)
    image[:] = color
    ok, buf = cv2.imencode(".jpg", image)
    assert ok
    return __import__("base64").b64encode(buf.tobytes()).decode()


def test_save_sample_rechaza_la_misma_foto(tmp_path):
    (tmp_path / "classes.txt").write_text("tornillo_m6\n", encoding="utf-8")
    box = [{"name": "tornillo_m6", "x": 0.5, "y": 0.5, "w": 0.2, "h": 0.2}]
    first = dataset_store.save_sample(_jpeg((20, 40, 60)), box, tmp_path)
    assert first["totals"]["labeled"] == 1
    assert first["saved"]["split"] in ("train", "val")
    with pytest.raises(dataset_store.DuplicateSample):
        dataset_store.save_sample(_jpeg((20, 40, 60)), box, tmp_path)
    second = dataset_store.save_sample(_jpeg((200, 10, 10)), box, tmp_path)
    assert second["totals"]["labeled"] == 2


def test_train_continua_desde_parts_y_acepta_una_sola_foto(tmp_path):
    (tmp_path / "classes.txt").write_text("tornillo_m6\n", encoding="utf-8")
    inbox = tmp_path / "images" / "inbox"
    inbox.mkdir(parents=True)
    (inbox / "solo.jpg").write_bytes(b"img")
    weights = tmp_path / "weights" / "parts.pt"
    weights.parent.mkdir()
    weights.write_bytes(b"previo")
    seen = {}

    def runner(data_yaml, epochs, imgsz, batch, patience, device, runs_dir, base_weights_path):
        seen["base"] = base_weights_path
        return _fake_run(0.9, b"nuevo")(data_yaml, epochs, imgsz, batch, patience, device, runs_dir)

    result = train_parts.train_parts(
        tmp_path,
        runs_dir=tmp_path / "runs",
        weights_path=weights,
        report_path=tmp_path / "weights" / "parts_report.json",
        runner=runner,
    )

    assert seen["base"] == str(weights)
    assert result["base"] == str(weights)
    listed = (tmp_path / "lists" / "train.txt").read_text(encoding="utf-8")
    assert "solo.jpg" in listed
    assert "solo.jpg" in (tmp_path / "lists" / "val.txt").read_text(encoding="utf-8")


def test_train_exige_fotos_en_los_dos_conjuntos(tmp_path):
    (tmp_path / "classes.txt").write_text("tornillo_m6\n", encoding="utf-8")
    with pytest.raises(train_parts.DatasetError):
        train_parts.train_parts(tmp_path, runner=_fake_run(0.5, b"x"))


CLASES = ["computadora1", "computadora2", "computadora3"]


def test_pesos_entorno_no_usa_parts(tmp_path, monkeypatch):
    missing = tmp_path / "parts.pt"
    monkeypatch.setattr(dataset_store, "default_weights_file", lambda: missing)
    monkeypatch.delenv("YOLO_WEIGHTS", raising=False)
    assert dataset_store.pesos_entorno() == "yolov8n.pt"
    assert dataset_store.pesos_piezas() is None

    missing.write_bytes(b"pt")
    assert dataset_store.pesos_entorno() == "yolov8n.pt"
    assert dataset_store.pesos_piezas() == str(missing)

    monkeypatch.setenv("YOLO_WEIGHTS", "otro.pt")
    assert dataset_store.pesos_entorno() == "otro.pt"
    monkeypatch.setenv("YOLO_WEIGHTS", str(missing))
    assert dataset_store.pesos_entorno() == "yolov8n.pt"


def test_clasificar_sin_peso_entrenado():
    assert dataset_store.clasificar_pieza([("computadora1", 0.9)], CLASES, peso_es_parts=False) is None


def test_clasificar_sin_pieza():
    assert dataset_store.clasificar_pieza([], CLASES, peso_es_parts=True)["respuesta"] == "SIN PIEZA"


def test_clasificar_fail_por_confianza():
    decision = dataset_store.clasificar_pieza([("computadora1", 0.49)], CLASES, peso_es_parts=True)
    assert decision["respuesta"] == "NO ES PIEZA REAL"
    assert decision["resultado"] == "FAIL"
    assert decision["tipo_objeto"] is None


def test_clasificar_fail_por_clase_ajena():
    decision = dataset_store.clasificar_pieza([("person", 0.95)], CLASES, peso_es_parts=True)
    assert decision["resultado"] == "FAIL"
    assert decision["tipo_objeto"] is None


def test_clasificar_pass_con_margen():
    decision = dataset_store.clasificar_pieza(
        [("computadora2", 0.50), ("computadora1", 0.40)],
        CLASES,
        peso_es_parts=True,
    )
    assert decision["resultado"] == "PASS"
    assert decision["respuesta"] == "PIEZA REAL"
    assert decision["nombre"] == "computadora2"
    assert decision["tipo_objeto"] == 2
    assert decision["confianza"] == 0.50


def test_clasificar_fail_por_empate():
    decision = dataset_store.clasificar_pieza(
        [("computadora1", 0.80), ("computadora2", 0.71)],
        CLASES,
        peso_es_parts=True,
    )
    assert decision["resultado"] == "FAIL"
    assert decision["tipo_objeto"] is None
