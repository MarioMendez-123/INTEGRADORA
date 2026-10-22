"""Dataset de piezas para el fine-tuning de YOLO.

Lee y escribe la carpeta `edge/perception/parts/` (clases, fotos y
etiquetas) y el reporte de `edge/perception/weights/`. El backend no
importa módulos de edge/: solo mira esos archivos, que es el contrato
que consume también `edge/perception/train_parts.py`.

La misma regla de pesos está copiada en `edge/perception/model_weights.py`
(procesos distintos en producción). Si cambia una, cambia la otra:

- `YOLO_WEIGHTS` en el entorno gana siempre.
- Si existe `weights/parts.pt`, se usa.
- Si no, `yolov8n.pt`.
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PARTS_DIR = REPO_ROOT / "edge" / "perception" / "parts"
WEIGHTS_FILE = REPO_ROOT / "edge" / "perception" / "weights" / "parts.pt"
REPORT_FILE = REPO_ROOT / "edge" / "perception" / "weights" / "parts_report.json"
FALLBACK_WEIGHTS = "yolov8n.pt"

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
SPLITS = ("train", "val")
FOLDERS = ("train", "val", "inbox")
# Una de cada cinco fotos de la bandeja va a validación. El reparto sale del
# nombre, así que la misma foto no cambia de conjunto entre consultas.
VAL_BUCKETS = 5
NEAR_DUP_MEAN = 6.0
CLASS_NAME = re.compile(r"^[a-z][a-z0-9_]{0,63}$")
RECENT_LIMIT = 12

CLASS_NAME_ERROR = (
    "el nombre va en minúsculas, sin espacios: letras, números y _. Ejemplo: tornillo_m6"
)

# Arranque, no medido. Se ajusta con una corrida que tenga las tres piezas y fotos que no lo son.
CORTE_INTERNO = 0.25
CONFIANZA_MINIMA = 0.50
MARGEN_AMBIGUEDAD = 0.10


def parts_root() -> Path:
    return PARTS_DIR


def default_weights_file() -> Path:
    return WEIGHTS_FILE


def report_file() -> Path:
    return REPORT_FILE


def resolve_yolo_weights() -> str:
    override = os.environ.get("YOLO_WEIGHTS")
    if override:
        return override
    weights = default_weights_file()
    if weights.is_file():
        return str(weights)
    return FALLBACK_WEIGHTS


def pesos_entorno() -> str:
    """Detector general. Nunca es parts.pt: esas clases tapan persona, silla y el resto."""
    override = os.environ.get("YOLO_WEIGHTS")
    trained = default_weights_file()
    if override:
        try:
            es_piezas = trained.is_file() and Path(override).resolve() == trained.resolve()
        except OSError:
            es_piezas = False
        if not es_piezas:
            return override
    return FALLBACK_WEIGHTS


def pesos_piezas() -> str | None:
    """parts.pt si ya se entrenó. None deja la línea en presencia, sin inventar un PASS."""
    trained = default_weights_file()
    return str(trained) if trained.is_file() else None


class DuplicateSample(Exception):
    """La foto es casi igual a una que ya está en el dataset."""


def split_for(stem: str) -> str:
    digest = hashlib.sha256(stem.encode("utf-8")).digest()
    return "val" if digest[0] % VAL_BUCKETS == 0 else "train"


def read_class_names(classes_file: Path | None = None) -> list[str]:
    path = classes_file if classes_file is not None else parts_root() / "classes.txt"
    if not path.is_file():
        return []
    names: list[str] = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        names.append(line)
    return names


def clasificar_pieza(detecciones, clases, *, peso_es_parts):
    """Identidad de una pieza registrada. None si el peso activo no es parts.pt.

    detecciones son pares (nombre, confianza) que ya pasaron el corte interno.
    PASS significa que el nombre está en clases, no que la pieza esté libre de defectos.
    tipo_objeto es la posición en clases, empezando en 1.
    """
    if not peso_es_parts:
        return None
    if not detecciones:
        return {"respuesta": "SIN PIEZA"}

    por_clase = {}
    for nombre, confianza in detecciones:
        if nombre not in clases or confianza < CONFIANZA_MINIMA:
            continue
        anterior = por_clase.get(nombre)
        if anterior is None or confianza > anterior:
            por_clase[nombre] = confianza
    if not por_clase:
        return {"respuesta": "NO ES PIEZA REAL", "resultado": "FAIL", "tipo_objeto": None}

    ordenadas = sorted(por_clase.items(), key=lambda item: item[1], reverse=True)
    nombre, confianza = ordenadas[0]
    if len(ordenadas) > 1 and ordenadas[0][1] - ordenadas[1][1] < MARGEN_AMBIGUEDAD:
        return {"respuesta": "NO ES PIEZA REAL", "resultado": "FAIL", "tipo_objeto": None}
    return {
        "respuesta": "PIEZA REAL",
        "resultado": "PASS",
        "tipo_objeto": clases.index(nombre) + 1,
        "confianza": confianza,
        "nombre": nombre,
    }


def _class_indices(label_path: Path) -> set[int]:
    if not label_path.is_file():
        return set()
    found: set[int] = set()
    for line in label_path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line:
            continue
        token = line.split()[0]
        try:
            found.add(int(token))
        except ValueError:
            continue
    return found


def _images_in(split_dir: Path) -> list[Path]:
    if not split_dir.is_dir():
        return []
    return sorted(
        path
        for path in split_dir.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
    )


def _iso(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp, timezone.utc).isoformat()


def _read_report() -> dict | None:
    path = report_file()
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict) or "map50" not in data:
        return None
    return data


def _model_status() -> dict:
    weights = resolve_yolo_weights()
    parts = default_weights_file()
    report = _read_report()
    using_trained = parts.is_file() and Path(weights).resolve() == parts.resolve()
    return {
        "active": Path(weights).name,
        "map50": report.get("map50") if using_trained and report else None,
        "trained_at": report.get("trained_at") if using_trained and report else None,
    }


def _iter_samples(root: Path):
    for folder in ("train", "val"):
        for image in _images_in(root / "images" / folder):
            yield folder, image, root / "labels" / folder / f"{image.stem}.txt"
    for image in _images_in(root / "images" / "inbox"):
        yield split_for(image.stem), image, root / "labels" / "inbox" / f"{image.stem}.txt"


def snapshot(root: Path | None = None) -> dict:
    """Conteo real de la carpeta del dataset. No crea archivos."""
    root = root or parts_root()
    names = read_class_names(root / "classes.txt")
    per_class: dict[int, dict] = {}
    for index, name in enumerate(names):
        per_class[index] = {
            "name": name,
            "registered": True,
            "train": 0,
            "val": 0,
            "total": 0,
            "last_added": None,
            "last_mtime": None,
        }

    images_total = 0
    labeled_total = 0
    recent: list[dict] = []

    for split, image, label_path in _iter_samples(root):
        images_total += 1
        indices = _class_indices(label_path)
        labeled = bool(indices)
        if labeled:
            labeled_total += 1
        mtime = image.stat().st_mtime
        piece_names: list[str] = []
        for index in sorted(indices):
            if index not in per_class:
                per_class[index] = {
                    "name": f"clase_{index}",
                    "registered": False,
                    "train": 0,
                    "val": 0,
                    "total": 0,
                    "last_added": None,
                    "last_mtime": None,
                }
            row = per_class[index]
            row[split] += 1
            row["total"] += 1
            if row["last_mtime"] is None or mtime > row["last_mtime"]:
                row["last_mtime"] = mtime
                row["last_added"] = _iso(mtime)
            piece_names.append(row["name"])
        recent.append(
            {
                "file": image.name,
                "piece": ", ".join(piece_names) if piece_names else None,
                "split": split,
                "added_at": _iso(mtime),
                "mtime": mtime,
            }
        )

    labeled_denom = labeled_total or 1
    classes = []
    for index in sorted(per_class):
        row = per_class[index]
        classes.append(
            {
                "name": row["name"],
                "registered": row["registered"],
                "train": row["train"],
                "val": row["val"],
                "total": row["total"],
                "share": (row["total"] / labeled_denom) if labeled_total else 0.0,
                "last_added": row["last_added"],
            }
        )

    recent.sort(key=lambda item: item["mtime"], reverse=True)
    for item in recent:
        del item["mtime"]

    return {
        "classes": classes,
        "totals": {
            "pieces": len(names),
            "images": images_total,
            "labeled": labeled_total,
            "unlabeled": images_total - labeled_total,
        },
        "recent": recent[:RECENT_LIMIT],
        "model": _model_status(),
    }


def add_class(name: str, root: Path | None = None) -> dict:
    """Añade un nombre a classes.txt y asegura las carpetas de fotos."""
    cleaned = name.strip()
    if not CLASS_NAME.fullmatch(cleaned):
        raise ValueError(CLASS_NAME_ERROR)
    root = root or parts_root()
    root.mkdir(parents=True, exist_ok=True)
    for folder in FOLDERS:
        (root / "images" / folder).mkdir(parents=True, exist_ok=True)
        (root / "labels" / folder).mkdir(parents=True, exist_ok=True)
    classes_file = root / "classes.txt"
    existing = read_class_names(classes_file)
    if cleaned in existing:
        raise FileExistsError(cleaned)
    if classes_file.is_file() and classes_file.stat().st_size > 0:
        text = classes_file.read_text(encoding="utf-8")
        prefix = "" if text.endswith("\n") else "\n"
        classes_file.write_text(text + prefix + cleaned + "\n", encoding="utf-8")
    else:
        classes_file.write_text(cleaned + "\n", encoding="utf-8")
    return snapshot(root)


def _thumb(image_bytes: bytes):
    import cv2
    import numpy as np

    decoded = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    if decoded is None:
        raise ValueError("la imagen no se pudo leer")
    return cv2.resize(decoded, (32, 32), interpolation=cv2.INTER_AREA)


def _too_similar(image_bytes: bytes, root: Path) -> bool:
    thumb = _thumb(image_bytes)
    import cv2
    import numpy as np

    samples = sorted(_iter_samples(root), key=lambda item: item[1].stat().st_mtime, reverse=True)
    for _split, image, _label in samples[:40]:
        existing = _thumb(image.read_bytes())
        if float(np.mean(cv2.absdiff(thumb, existing))) < NEAR_DUP_MEAN:
            return True
    return False


def save_sample(image_base64: str, boxes: list[dict], root: Path | None = None) -> dict:
    """Guarda una foto etiquetada en la bandeja. El conjunto (train/val) lo decide el nombre."""
    root = root or parts_root()
    names = read_class_names(root / "classes.txt")
    if not names:
        raise ValueError("registra una pieza antes de guardar fotos")
    if not boxes:
        raise ValueError("marca al menos una caja sobre la pieza")
    payload = image_base64.split(",", 1)[-1].strip()
    try:
        image_bytes = base64.b64decode(payload, validate=True)
    except Exception as exc:
        raise ValueError("la imagen no viene en base64") from exc
    if _too_similar(image_bytes, root):
        raise DuplicateSample("esa foto es casi igual a una que ya está en el dataset")

    lines = []
    for box in boxes:
        name = str(box.get("name", "")).strip()
        if name not in names:
            raise ValueError(f"'{name}' no está registrada")
        x, y, w, h = (float(box[key]) for key in ("x", "y", "w", "h"))
        if not (0 <= x <= 1 and 0 <= y <= 1 and 0 < w <= 1 and 0 < h <= 1):
            raise ValueError("la caja tiene que quedar dentro de la foto")
        lines.append(f"{names.index(name)} {x:.6f} {y:.6f} {w:.6f} {h:.6f}")

    for folder in ("images", "labels"):
        (root / folder / "inbox").mkdir(parents=True, exist_ok=True)
    stem = f"{int(time.time() * 1000)}"
    (root / "images" / "inbox" / f"{stem}.jpg").write_bytes(image_bytes)
    (root / "labels" / "inbox" / f"{stem}.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    result = snapshot(root)
    result["saved"] = {"file": f"{stem}.jpg", "split": split_for(stem)}
    return result
