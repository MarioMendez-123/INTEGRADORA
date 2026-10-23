"""Detector de piezas para la Raspberry Pi 4: parts.pt exportado a ONNX y
corrido con cv2.dnn. La Pi no lleva torch ni ultralytics.

Exportar en la laptop (el imgsz de aquí debe ser el mismo que LINE_IMGSZ):
    yolo export model=parts.pt format=onnx imgsz=320 opset=12 simplify=True
"""

import cv2
import numpy as np


class DetectorOnnx:
    """Llamar con un frame BGR devuelve [(nombre, confianza, (x1, y1, x2, y2))]."""

    def __init__(self, ruta, nombres, imgsz=320, corte=0.25, iou=0.45):
        self.nombres = list(nombres)
        self.imgsz = imgsz
        self.corte = corte
        self.iou = iou
        self.net = cv2.dnn.readNetFromONNX(str(ruta))
        # El primer forward es lento: se paga aquí, no con la primera pieza.
        # Además comprueba que el modelo tiene las clases de classes.txt.
        columnas = self._forward(np.zeros((imgsz, imgsz, 3), np.uint8)).shape[1]
        if columnas - 4 != len(self.nombres):
            raise ValueError(
                f"{ruta} trae {columnas - 4} clases y classes.txt tiene {len(self.nombres)}. "
                "Hay que volver a exportar parts.pt."
            )

    def _forward(self, lienzo):
        self.net.setInput(cv2.dnn.blobFromImage(lienzo, 1 / 255, swapRB=True))
        return self.net.forward()[0].T  # (cajas candidatas, 4 + clases)

    def __call__(self, frame):
        alto, ancho = frame.shape[:2]
        r = self.imgsz / max(alto, ancho)
        nuevo_ancho, nuevo_alto = round(ancho * r), round(alto * r)
        izq, arriba = (self.imgsz - nuevo_ancho) // 2, (self.imgsz - nuevo_alto) // 2
        lienzo = np.full((self.imgsz, self.imgsz, 3), 114, np.uint8)  # mismo relleno que ultralytics
        lienzo[arriba : arriba + nuevo_alto, izq : izq + nuevo_ancho] = cv2.resize(frame, (nuevo_ancho, nuevo_alto))

        salida = self._forward(lienzo)
        puntajes = salida[:, 4:]
        confianza = puntajes.max(axis=1)
        buenas = confianza >= self.corte
        if not buenas.any():
            return []
        salida, puntajes, confianza = salida[buenas], puntajes[buenas], confianza[buenas]

        cx, cy, w, h = salida[:, 0], salida[:, 1], salida[:, 2], salida[:, 3]
        x = (cx - w / 2 - izq) / r
        y = (cy - h / 2 - arriba) / r
        cajas = np.stack([x, y, w / r, h / r], axis=1)
        # ponytail: NMS sin separar por clase; las piezas son excluyentes entre sí.
        elegidas = cv2.dnn.NMSBoxes(cajas.tolist(), confianza.tolist(), self.corte, self.iou)
        resultado = []
        for i in np.asarray(elegidas).flatten():
            bx, by, bw, bh = cajas[i]
            caja = (
                max(0, int(bx)),
                max(0, int(by)),
                min(ancho, int(bx + bw)),
                min(alto, int(by + bh)),
            )
            resultado.append((self.nombres[int(puntajes[i].argmax())], float(confianza[i]), caja))
        return resultado
