"""
backend/database.py
Enterprise PostgreSQL + PostGIS database connection manager for DRISHTI-AI.
Exclusively connects to PostgreSQL with robust connection pooling and health checks.
"""

import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

logger = logging.getLogger("drishti.database")

# Declarative Base for ORM models
Base = declarative_base()

# Resolve and normalize DATABASE_URL
raw_database_url = settings.DATABASE_URL
if raw_database_url.startswith("postgres://"):
    raw_database_url = raw_database_url.replace("postgres://", "postgresql://", 1)

active_database_url = raw_database_url


def _create_postgres_engine(url: str):
    """Create SQLAlchemy engine with enterprise PostgreSQL connection pooling."""
    return create_engine(
        url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )


# Initialize PostgreSQL engine and verify connection
try:
    engine = _create_postgres_engine(active_database_url)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    safe_db_host = active_database_url.split("@")[-1] if "@" in active_database_url else "configured host"
    print(f"[Database] Successfully connected to PostgreSQL at {safe_db_host}")
    logger.info(f"Connected to PostgreSQL database ({safe_db_host})")
except Exception as err:
    logger.critical(f"[Database Critical] Failed to connect to PostgreSQL: {err}")
    print(
        f"\n❌ [CRITICAL DATABASE ERROR] Could not connect to PostgreSQL at {active_database_url.split('@')[-1] if '@' in active_database_url else active_database_url}!\n"
        f"   Error: {err}\n"
        f"   Please verify your DATABASE_URL in .env matches your active PostgreSQL / Supabase credentials.\n"
    )
    raise RuntimeError(f"DRISHTI-AI requires an active PostgreSQL database: {err}") from err

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency yielding an active database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_info() -> dict:
    """Return runtime database dialect and host connection parameters."""
    return {
        "dialect": engine.dialect.name,
        "is_fallback": False,
        "database": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url),
        "status": "connected"
    }
