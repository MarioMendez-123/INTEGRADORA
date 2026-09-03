"""Prueba MANUAL Y CONTROLADA de tasa de detección YOLO y tasa de lectura de
código de barras/QR — no es una prueba de pytest, no se ejecuta como parte
de la suite automática.

Mide dos de los cinco umbrales pendientes de `docs/architecture/decisions/
criterios_aceptacion.md` (sección 1, Percepción): son comportamiento de
software puro (qué tan bien detecta YOLO, qué tan bien lee pyzbar), no
dependen de qué tan rápido sea el hardware que los corre — el resultado
medido en esta laptop de desarrollo sigue siendo válido en el Jetson. Los
otros tres umbrales pendientes (error de ArUco, error de odometría, FPS en
tiempo real) sí dependen del hardware final y NO se miden aquí.

Cómo se usa: abre la cámara por defecto del sistema (índice 0). Le muestras
a la cámara, uno por uno, cada objeto de tu set de prueba fijo (ej. 20
productos conocidos), y por cada uno presionas una tecla para confirmar y
registrar el resultado del frame actual:

- ESPACIO — confirma el objeto actual como "sin código de barras/QR
  esperado" (solo cuenta para la tasa de detección YOLO).
- B — confirma el objeto actual como "con código de barras/QR esperado"
  (cuenta para la tasa de detección YOLO Y para la tasa de lectura de
  código, sobre el código detectado en ESE frame).
- Q — termina la sesión e imprime el resumen final.

"Con código esperado" es una afirmación tuya (ground truth), no algo que el
script pueda inferir solo viendo el frame — por eso son dos teclas
distintas, no una sola. La detección de YOLO y la lectura de código se
evalúan en el instante exacto en que confirmas cada objeto (misma caja de
mayor confianza que YOLO reporte en ese frame), no acumuladas a lo largo del
tiempo que el objeto estuvo en cuadro.

Al terminar (tecla Q), imprime/loggea:
- Tasa de detección YOLO: detectados / total de objetos probados.
- Tasa de lectura de código: leídos / objetos marcados "con código
  esperado" (nunca sobre el total — un objeto sin código no puede
  "leerse", incluirlo en el denominador inflaría artificialmente la tasa
  hacia abajo).

Además vuelca el registro crudo por objeto a detection_rate_output.json —
archivo de salida de prueba local, no se sube al repositorio (ver
.gitignore), útil para revisar después cuáles objetos fallaron.
"""

import json
import logging
import sys
from pathlib import Path

import cv2
from pyzbar.pyzbar import decode
from ultralytics import YOLO

# Permite importar edge/logging_config.py sin importar desde dónde se corra
# este script (directamente o dentro de edge/).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from logging_config import setup_logging

CAMERA_INDEX = 0
MODEL_NAME = "yolov8n.pt"
WINDOW_NAME = "Aether — tasa de detección (ESPACIO/B confirma, Q termina)"
OUTPUT_PATH = Path(__file__).resolve().parent / "detection_rate_output.json"


def _detect_current_frame(model, frame):
    """Corre YOLO sobre el frame actual y, si detectó algo, intenta leer un
    código dentro de la caja de mayor confianza — mismo patrón de recorte
    que test_combined.py, pero para un solo objeto a la vez. Si YOLO no
    detectó nada, intenta leer un código sobre el frame completo como
    respaldo (igual que test_barcode.py en solitario).

    Devuelve (yolo_detected, code_read, annotated_frame) — el frame ya
    trae la caja dibujada, para que quede claro en video qué se evaluó.
    """
    annotated = frame.copy()
    results = model(frame, verbose=False)
    boxes = results[0].boxes

    yolo_detected = len(boxes) > 0
    codes = []

    if yolo_detected:
        best_box = max(boxes, key=lambda b: float(b.conf[0]))
        x1, y1, x2, y2 = (int(v) for v in best_box.xyxy[0])
        crop = frame[y1:y2, x1:x2]
        codes = decode(crop) if crop.size > 0 else []
        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)
    else:
        codes = decode(frame)

    return yolo_detected, bool(codes), annotated


def _draw_overlay(frame, object_index, yolo_detected, code_read):
    cv2.putText(
        frame,
        f"Objeto {object_index + 1}",
        (16, 32),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
    )
    cv2.putText(
        frame,
        f"YOLO: {'SI' if yolo_detected else 'NO'}   Codigo leido: {'SI' if code_read else 'NO'}",
        (16, 62),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0) if yolo_detected else (0, 140, 255),
        2,
    )
    cv2.putText(
        frame,
        "ESPACIO = confirmar (sin codigo) | B = confirmar (con codigo) | Q = terminar",
        (16, frame.shape[0] - 16),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        1,
    )


def main() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)

    model = YOLO(MODEL_NAME)
    logger.info("Modelo YOLO '%s' cargado correctamente.", MODEL_NAME)

    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        logger.error(
            "No se pudo abrir la cámara (índice %d). Verifica que esté "
            "conectada y no esté en uso por otra aplicación.",
            CAMERA_INDEX,
        )
        return

    logger.info("Cámara (índice %d) abierta correctamente.", CAMERA_INDEX)
    logger.info(
        "Muestra cada objeto a la cámara y presiona ESPACIO (sin código) o "
        "B (con código) para confirmarlo. Presiona Q para terminar y ver el "
        "resumen."
    )

    records: list[dict] = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.error("No se pudo leer un frame de la cámara.")
                break

            yolo_detected, code_read, annotated = _detect_current_frame(model, frame)
            _draw_overlay(annotated, len(records), yolo_detected, code_read)
            cv2.imshow(WINDOW_NAME, annotated)

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                logger.info("Tecla 'q' presionada, terminando sesión.")
                break

            if key == ord(" ") or key == ord("b"):
                has_barcode = key == ord("b")
                records.append(
                    {
                        "object_index": len(records),
                        "yolo_detected": yolo_detected,
                        "has_barcode": has_barcode,
                        "code_read": code_read if has_barcode else None,
                    }
                )
                logger.info(
                    "Objeto %d confirmado — YOLO: %s, código esperado: %s%s",
                    len(records),
                    "sí" if yolo_detected else "no",
                    "sí" if has_barcode else "no",
                    f", leído: {'sí' if code_read else 'no'}" if has_barcode else "",
                )
    finally:
        cap.release()
        cv2.destroyAllWindows()

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    total = len(records)
    if total == 0:
        logger.info("No se confirmó ningún objeto — sin datos para calcular tasas.")
        return

    detected_count = sum(1 for r in records if r["yolo_detected"])
    detection_rate = detected_count / total * 100

    with_barcode = [r for r in records if r["has_barcode"]]
    read_count = sum(1 for r in with_barcode if r["code_read"])

    logger.info("===== RESUMEN =====")
    logger.info("Objetos probados: %d", total)
    logger.info("Tasa de detección YOLO: %d/%d (%.1f%%)", detected_count, total, detection_rate)
    if with_barcode:
        read_rate = read_count / len(with_barcode) * 100
        logger.info(
            "Tasa de lectura de código: %d/%d (%.1f%%) — sobre objetos marcados "
            "con código esperado, no sobre el total",
            read_count,
            len(with_barcode),
            read_rate,
        )
    else:
        logger.info(
            "Ningún objeto se marcó con código de barras/QR esperado (tecla B) "
            "— sin datos para la tasa de lectura de código."
        )
    logger.info("Registro crudo guardado en %s", OUTPUT_PATH)


if __name__ == "__main__":
    main()
