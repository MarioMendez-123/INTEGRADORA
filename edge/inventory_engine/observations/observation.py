"""Formato de una Observation — registro crudo de percepción.

Ver aether_context_docs.md, sección 3 (Decisión 5) y sección 4.2: una
Observation es el dato *crudo* que produce la capa de percepción en cada
instante, distinto del Declared Inventory (procesado/consolidado). No se
sobrescribe silenciosamente nada aquí — este módulo solo define el contrato
de datos, sin lógica de negocio, a la espera de que se implemente el resto
de inventory_engine.
"""

from dataclasses import dataclass


@dataclass
class Observation:
    """Un registro crudo de una sola detección de percepción en un instante.

    Attributes:
        timestamp: Momento de la detección, en formato ISO 8601.
        detected_class: Clase detectada por YOLO (p. ej. "bottle", "box").
        code_data: Texto decodificado del código de barras/QR leído dentro
            de la caja delimitadora, o None si no se pudo leer ninguno.
        code_read: True si se logró leer un código dentro de la caja:
            explícito y redundante con `code_data is not None` a propósito,
            para que el consumidor de la Observation no tenga que inferir
            el caso "sin código" comparando contra None.
        confidence: Confianza de la detección de YOLO, entre 0.0 y 1.0.
        location_marker_id: ID del marcador ArUco visible en el frame en el
            momento de esta detección (Decisión 2: verificación de
            posición, NUNCA navegación), o None si no había ningún marcador
            visible. Si hay más de un marcador visible en el mismo frame,
            se usa el primero detectado — sin lógica de prioridad todavía.
    """

    timestamp: str
    detected_class: str
    code_data: str | None
    code_read: bool
    confidence: float
    location_marker_id: int | None
