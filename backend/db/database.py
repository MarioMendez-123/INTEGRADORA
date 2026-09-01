"""Conexión SQLAlchemy a la base de datos local — SQLite en desarrollo.

Ver aether_context_docs.md, sección 5 (Backend/datos/comunicación):
SQLite para desarrollo, PostgreSQL como candidato a escalar (decisión aún no
cerrada, no se instala driver por adelantado — principio 4.5).
"""

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DB_PATH = Path(__file__).resolve().parent.parent / "aether.db"

engine = create_engine(f"sqlite:///{DB_PATH}")
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Clase base declarativa de la que heredan todos los modelos."""


def init_db() -> None:
    """Crea todas las tablas registradas en Base.metadata si no existen."""
    # Import local (no al tope del módulo) para evitar un ciclo con
    # db.models, que a su vez importa Base desde aquí. Al llamar init_db()
    # los modelos ya quedan registrados en Base.metadata antes de create_all.
    import db.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
