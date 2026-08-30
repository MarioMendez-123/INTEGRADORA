"""Estados formales de cobertura de una inspección.

Ver aether_context_docs.md, sección 3 (Decisión 5) y sección 4.2.

Un estado COMPLETE es una afirmación procedimental ("la ruta de inspección
terminó"), no una garantía de que se vio físicamente todo el inventario real.
Una inspección PARTIAL nunca debe usarse para sobrescribir silenciosamente el
Declared Inventory previo — eso se resuelve en la capa de inventory_engine que
consume este estado, no aquí.

Sin lógica de negocio en este archivo por ahora: solo la definición del
contrato de estados, a la espera de que se implemente inventory_engine.
"""

from enum import Enum


class CoverageState(str, Enum):
    """Cobertura declarada de una corrida de inspección."""

    PARTIAL = "PARTIAL"
    COMPLETE = "COMPLETE"
    INVALID = "INVALID"
