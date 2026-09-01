"""Punto de entrada mínimo del backend.

Confirma que el servidor FastAPI arranca y responde, expone Declared
Inventory (cargado a la base de datos vía backend/scripts/load_from_edge.py)
de solo lectura, y sirve el dashboard estático (dashboard/) en la raíz —
mismo origen, sin CORS (Decisión 7, Opción B).
"""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from db.database import SessionLocal, init_db
from db.models import DeclaredEntry, DeclaredEntryHistory
from logging_config import setup_logging

DASHBOARD_DIR = Path(__file__).resolve().parent.parent / "dashboard"

# Traba simple contra clics accidentales en PATCH /inventory/{identifier}/retire
# — NO es un sistema de autenticación/autorización real: no hay usuarios, ni
# sesiones, ni roles, y la misma contraseña sirve para cualquiera que la
# tenga. Un sistema de permisos real (usuarios, roles, quién retiró qué)
# queda pendiente como decisión futura explícita, no se fabrica aquí
# (Principio 4.5, aether_context_docs.md). El valor por defecto "aether-dev"
# es solo para desarrollo local; en cualquier despliegue real esta variable
# debe configurarse por entorno (ADMIN_ACTION_PASSWORD), nunca quedarse en
# el default.
ADMIN_ACTION_PASSWORD = os.environ.get("ADMIN_ACTION_PASSWORD", "aether-dev")

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("Servidor backend iniciado.")
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/inventory")
def get_inventory(include_retired: bool = False):
    """Devuelve las filas de Declared Inventory — sin estado de cobertura
    todavía (ver docstring de edge/inventory_engine/aggregate_observations.py).

    Por defecto solo devuelve entradas con status "active": un identifier se
    marca "retired" únicamente por decisión humana explícita, vía
    PATCH /inventory/{identifier}/retire — nunca de forma automática porque
    haya dejado de aparecer en una corrida de load_from_edge.py (no hay
    forma de saber hoy si esa corrida cubrió todo el piso o solo una parte,
    ver comentario en backend/db/models/declared_entry.py). Pasa
    include_retired=true para ver también las entradas retiradas.
    """
    session = SessionLocal()
    try:
        query = session.query(DeclaredEntry)
        if not include_retired:
            query = query.filter(DeclaredEntry.status == "active")
        entries = query.all()
        return [
            {
                "identifier": entry.identifier,
                "detected_class": entry.detected_class,
                "total_observations": entry.total_observations,
                "code_read_count": entry.code_read_count,
                "avg_confidence": entry.avg_confidence,
                "first_seen": entry.first_seen,
                "last_seen": entry.last_seen,
                "location_counts": entry.location_counts,
                "status": entry.status,
            }
            for entry in entries
        ]
    finally:
        session.close()


class RetireRequest(BaseModel):
    """Cuerpo de PATCH /inventory/{identifier}/retire — ver ADMIN_ACTION_PASSWORD
    arriba sobre qué protección da (y qué no da) esta contraseña."""

    password: str


@app.patch("/inventory/{identifier}/retire")
def retire_inventory_entry(identifier: str, body: RetireRequest):
    """Marca una entrada de Declared Inventory como "retired".

    Única forma de que un identifier deje de contar como inventario activo
    en GET /inventory (corrección de diseño sobre Decisión 5): requiere esta
    llamada explícita, hecha por una persona. Nunca ocurre automáticamente
    por ausencia en una corrida de load_from_edge.py — ver el comentario en
    backend/db/models/declared_entry.py sobre por qué (Principio 4.1,
    aether_context_docs.md sección 4.1: no fabricar una garantía de
    cobertura que el sistema todavía no puede respaldar).

    Retirar es un cambio de estado, no un borrado: la fila sigue existiendo
    y sigue siendo consultable vía GET /inventory?include_retired=true — el
    historial nunca se pierde.

    Requiere ADMIN_ACTION_PASSWORD en el cuerpo de la petición (ver
    comentario junto a esa constante sobre el alcance real de esta traba).
    """
    if body.password != ADMIN_ACTION_PASSWORD:
        raise HTTPException(status_code=403, detail="Contraseña incorrecta.")

    session = SessionLocal()
    try:
        entry = session.get(DeclaredEntry, identifier)
        if entry is None:
            raise HTTPException(
                status_code=404,
                detail=f"No existe Declared Inventory con identifier '{identifier}'.",
            )
        entry.status = "retired"
        session.commit()
        return {"identifier": entry.identifier, "status": entry.status}
    finally:
        session.close()


@app.get("/inventory/history")
def get_inventory_history():
    """Devuelve la bitácora completa de inspecciones (Decisión 7): todas las
    filas de DeclaredEntryHistory, más recientes primero. Nunca se
    sobrescribe — cada corrida de load_from_edge.py agrega filas nuevas."""
    session = SessionLocal()
    try:
        rows = (
            session.query(DeclaredEntryHistory)
            .order_by(DeclaredEntryHistory.recorded_at.desc())
            .all()
        )
        return [
            {
                "id": row.id,
                "identifier": row.identifier,
                "detected_class": row.detected_class,
                "total_observations": row.total_observations,
                "code_read_count": row.code_read_count,
                "avg_confidence": row.avg_confidence,
                "first_seen": row.first_seen,
                "last_seen": row.last_seen,
                "location_counts": row.location_counts,
                "recorded_at": row.recorded_at,
            }
            for row in rows
        ]
    finally:
        session.close()


# Montado al final, después de las rutas de arriba: FastAPI/Starlette
# resuelve rutas en el orden en que se declaran, así que /health,
# /inventory e /inventory/history se emparejan primero y este mount en "/"
# solo atrapa lo que no coincidió con ninguna ruta explícita (los archivos
# de dashboard/, con index.html servido en la raíz gracias a html=True).
app.mount("/", StaticFiles(directory=DASHBOARD_DIR, html=True), name="dashboard")
