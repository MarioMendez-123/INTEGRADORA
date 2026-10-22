"""Entrena el detector de piezas.

Si ya existe weights/parts.pt, continúa desde ahí y deja congelado el
tronco de la red (las primeras 10 capas): en CPU solo se ajusta la cabeza,
que es lo que distingue las piezas nuevas. La primera vez parte de
yolov8n.pt con el mismo congelado. Publica el peso nuevo solo si el mAP50
supera al anterior.

Las fotos de images/inbox se reparten solas: 4 de cada 5 a entrenamiento
y 1 a validación, con la misma regla que backend/dataset_store.split_for.

Uso, desde edge/perception, con el entorno de edge/ activo:

    python train_parts.py
    python train_parts.py --epochs 80 --device cpu
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

PERCEPTION_DIR = Path(__file__).resolve().parent
PARTS_DIR = PERCEPTION_DIR / "parts"
WEIGHTS_FILE = PERCEPTION_DIR / "weights" / "parts.pt"
REPORT_FILE = PERCEPTION_DIR / "weights" / "parts_report.json"
RUNS_DIR = PERCEPTION_DIR / "runs"
MAP50_COLUMN = "metrics/mAP50(B)"

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
VAL_BUCKETS = 5
FREEZE_LAYERS = 10


def split_for(stem: str) -> str:
    digest = hashlib.sha256(stem.encode("utf-8")).digest()
    return "val" if digest[0] % VAL_BUCKETS == 0 else "train"


class DatasetError(Exception):
    """El dataset no está listo para entrenar."""


def read_class_names(classes_file: Path) -> list[str]:
    if not classes_file.is_file():
        return []
    names: list[str] = []
    for line in classes_file.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        names.append(line)
    return names


def collect_samples(parts_dir: Path) -> tuple[list[Path], list[Path]]:
    train: list[Path] = []
    val: list[Path] = []
    for folder, bucket in (("train", train), ("val", val)):
        directory = parts_dir / "images" / folder
        if not directory.is_dir():
            continue
        for path in sorted(directory.iterdir()):
            if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES:
                bucket.append(path)
    inbox = parts_dir / "images" / "inbox"
    if inbox.is_dir():
        for path in sorted(inbox.iterdir()):
            if not path.is_file() or path.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            (val if split_for(path.stem) == "val" else train).append(path)
    if not train and val:
        train.append(val[0])
    if not val and train:
        val.append(train[0])
    return train, val


def write_data_yaml(parts_dir: Path, names: list[str], train: list[Path], val: list[Path]) -> Path:
    lists = parts_dir / "lists"
    lists.mkdir(parents=True, exist_ok=True)
    (lists / "train.txt").write_text("".join(f"{path.resolve().as_posix()}\n" for path in train), encoding="utf-8")
    (lists / "val.txt").write_text("".join(f"{path.resolve().as_posix()}\n" for path in val), encoding="utf-8")
    lines = [
        f"path: {parts_dir.resolve().as_posix()}",
        "train: lists/train.txt",
        "val: lists/val.txt",
        "names:",
    ]
    lines.extend(f"  {index}: {name}" for index, name in enumerate(names))
    path = parts_dir / "data.yaml"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def map50_from_results_csv(csv_path: Path) -> float:
    with csv_path.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if not rows or MAP50_COLUMN not in rows[0]:
        raise DatasetError(f"{csv_path} no trae la columna {MAP50_COLUMN}")
    return max(float(row[MAP50_COLUMN]) for row in rows)


def read_report(report_path: Path) -> dict | None:
    if not report_path.is_file():
        return None
    try:
        data = json.loads(report_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict) or "map50" not in data:
        return None
    return data


def publish_if_better(
    best_pt: Path,
    map50: float,
    names: list[str],
    weights_path: Path = WEIGHTS_FILE,
    report_path: Path = REPORT_FILE,
) -> bool:
    """Copia best.pt a parts.pt solo cuando el mAP50 sube."""
    previous = read_report(report_path)
    if previous is not None and map50 <= float(previous["map50"]):
        return False
    if not best_pt.is_file():
        raise DatasetError(f"no está el checkpoint {best_pt}")
    weights_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(best_pt, weights_path)
    report = {
        "classes": names,
        "map50": map50,
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return True


def base_weights(weights_path: Path) -> str:
    if weights_path.is_file():
        return str(weights_path)
    return "yolov8n.pt"


def run_ultralytics_train(
    data_yaml, epochs, imgsz, batch, patience, device, runs_dir, base_weights_path
) -> Path:
    from ultralytics import YOLO

    model = YOLO(base_weights_path)
    model.train(
        data=str(data_yaml),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        patience=patience,
        device=device,
        project=str(runs_dir),
        name="parts",
        exist_ok=True,
        freeze=FREEZE_LAYERS,
        cache=True,
    )
    return Path(model.trainer.save_dir)


def train_parts(
    parts_dir: Path = PARTS_DIR,
    *,
    epochs: int = 80,
    imgsz: int = 640,
    batch: int = 8,
    patience: int = 15,
    device: str = "cpu",
    runs_dir: Path = RUNS_DIR,
    weights_path: Path = WEIGHTS_FILE,
    report_path: Path = REPORT_FILE,
    runner=None,
) -> dict:
    names = read_class_names(parts_dir / "classes.txt")
    if not names:
        raise DatasetError("classes.txt no tiene piezas. Regístralas en /dataset.html.")
    train, val = collect_samples(parts_dir)
    if not train or not val:
        raise DatasetError("hace falta al menos una foto etiquetada. Márcala en /dataset.html.")
    data_yaml = write_data_yaml(parts_dir, names, train, val)
    starting = base_weights(weights_path)
    save_dir = (runner or run_ultralytics_train)(
        data_yaml, epochs, imgsz, batch, patience, device, runs_dir, starting
    )
    map50 = map50_from_results_csv(save_dir / "results.csv")
    published = publish_if_better(
        save_dir / "weights" / "best.pt",
        map50,
        names,
        weights_path,
        report_path,
    )
    return {"published": published, "map50": map50, "weights": str(weights_path), "base": starting}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--patience", type=int, default=15)
    parser.add_argument("--device", default=os.environ.get("YOLO_DEVICE", "cpu"))
    args = parser.parse_args(argv)
    try:
        result = train_parts(
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            patience=args.patience,
            device=args.device,
        )
    except DatasetError as exc:
        print(exc, file=sys.stderr)
        return 1
    if result["published"]:
        print(f"Publicado {result['weights']} (mAP50 {result['map50']:.4f}). Reinicia el backend para usarlo.")
    else:
        print(
            f"mAP50 {result['map50']:.4f} no supera al modelo ya publicado. parts.pt se queda como está."
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
