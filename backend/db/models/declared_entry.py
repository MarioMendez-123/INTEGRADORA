"""Modelo SQLAlchemy DeclaredEntry — espejo de la tabla en la base de datos.

Mismos campos que edge/inventory_engine/declared_inventory/declared_entry.py
(el dataclass que produce edge/inventory_engine/aggregate_observations.py):
este modelo es el destino donde ese resultado se persiste en el backend, vía
backend/scripts/load_from_edge.py.
"""

from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class DeclaredEntry(Base):
    """Fila de Declared Inventory — resumen agregado de Observations."""

    __tablename__ = "declared_entries"

    identifier: Mapped[str] = mapped_column(primary_key=True)
    detected_class: Mapped[str]
    total_observations: Mapped[int]
    code_read_count: Mapped[int]
    avg_confidence: Mapped[float]
    first_seen: Mapped[str]
    last_seen: Mapped[str]
    # Tipo JSON de SQLAlchemy: sobre SQLite se serializa a texto
    # internamente, sin necesidad de una tabla/columna separada por
    # ubicación. Mismas claves que edge/inventory_engine/declared_inventory/
    # declared_entry.py: location_marker_id como string, o "sin_ubicacion".
    location_counts: Mapped[dict[str, int]] = mapped_column(JSON)
    # "active" o "retired". Por defecto "active" al crear un registro nuevo.
    # SOLO cambia por decisión humana explícita, vía
    # PATCH /inventory/{identifier}/retire en backend/main.py — nunca de
    # forma automática por ausencia en una corrida de load_from_edge.py.
    # Una entrada que no aparece en la corrida más reciente no implica que
    # ya no exista físicamente: no hay forma de saber hoy si esa corrida
    # cubrió todo el piso o solo una parte, porque eso depende del módulo de
    # Navegación (todavía no existe). Retirar/expirar automáticamente por
    # cobertura completa queda pendiente para cuando ese módulo exista — no
    # se fabrica esa garantía ahora (Principio 4.1, honestidad de producto:
    # aether_context_docs.md sección 4.1).
    status: Mapped[str] = mapped_column(default="active")
