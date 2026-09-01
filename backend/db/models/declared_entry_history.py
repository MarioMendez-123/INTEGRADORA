"""Modelo SQLAlchemy DeclaredEntryHistory — bitácora de inspecciones.

Ver aether_context_docs.md, sección 3 (Decisión 7): el dashboard requiere
historial y trazabilidad por ubicación, no solo el estado actual. A
diferencia de DeclaredEntry (una fila por identifier, se actualiza en cada
carga), esta tabla nunca se actualiza ni se sobrescribe — solo se le agregan
filas nuevas, una por cada entrada por cada corrida de
backend/scripts/load_from_edge.py, para conservar el historial completo.
"""

from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class DeclaredEntryHistory(Base):
    """Fila de bitácora: snapshot de una DeclaredEntry en una corrida dada.

    `recorded_at` es el momento de ESTA corrida de carga — no confundir con
    `first_seen`/`last_seen`, que vienen de las Observations agregadas y no
    cambian entre corridas si edge/ no generó datos nuevos.
    """

    __tablename__ = "declared_entry_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    identifier: Mapped[str]
    detected_class: Mapped[str]
    total_observations: Mapped[int]
    code_read_count: Mapped[int]
    avg_confidence: Mapped[float]
    first_seen: Mapped[str]
    last_seen: Mapped[str]
    location_counts: Mapped[dict[str, int]] = mapped_column(JSON)
    recorded_at: Mapped[str]
