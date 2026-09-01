"""Formato de una DeclaredEntry — resumen agregado de Observations.

Ver aether_context_docs.md, sección 3 (Decisión 5) y sección 4.2: una
DeclaredEntry es la capa *declarada* que consolida Observations crudas de un
mismo identificador, distinta del dato crudo de percepción. Nótese que este
dataclass no incluye estado de cobertura (PARTIAL/COMPLETE/INVALID) — eso
depende del módulo de Navegación (aún no existe) y se agrega en un paso
posterior, no aquí.
"""

from dataclasses import dataclass


@dataclass
class DeclaredEntry:
    """Resumen agregado de todas las Observations de un mismo identificador.

    Attributes:
        identifier: El `code_data` de las Observations agrupadas si tenían
            código legible, o `"unidentified:" + detected_class` si no.
        detected_class: Clase detectada (YOLO) más frecuente entre las
            Observations de este identifier.
        total_observations: Cuántas Observations se agruparon en esta entrada.
        code_read_count: Cuántas de esas Observations tenían código legible.
        avg_confidence: Confianza promedio de YOLO entre las Observations
            agrupadas.
        first_seen: Timestamp ISO 8601 de la Observation más antigua del
            grupo.
        last_seen: Timestamp ISO 8601 de la Observation más reciente del
            grupo.
        location_counts: Cuántas Observations del grupo ocurrieron en cada
            ubicación. Las claves son el `location_marker_id` de la
            Observation convertido a string, o "sin_ubicacion" para las que
            tenían `location_marker_id` None (sin marcador ArUco visible en
            ese frame).
    """

    identifier: str
    detected_class: str
    total_observations: int
    code_read_count: int
    avg_confidence: float
    first_seen: str
    last_seen: str
    location_counts: dict[str, int]
