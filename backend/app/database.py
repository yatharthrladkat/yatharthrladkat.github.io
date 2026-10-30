import logging
from typing import Generator, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.config import settings

logger = logging.getLogger(__name__)

# Configure SQLAlchemy engine based on target database dialect
connect_args = {}
if settings.effective_database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.effective_database_url,
    connect_args=connect_args,
    pool_pre_ping=True,  # Automatically detect stale connections
    future=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields an independent database session per request
    and guarantees proper cleanup upon completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> Dict[str, Any]:
    """
    Safely tests database connectivity with a lightweight ping query.
    Never exposes passwords or sensitive credentials in error traces.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "dialect": engine.dialect.name,
            "error": None
        }
    except Exception as exc:
        logger.warning(f"Database health check failed: {exc}")
        return {
            "status": "disconnected",
            "dialect": engine.dialect.name,
            "error": "Database connectivity check failed"
        }
