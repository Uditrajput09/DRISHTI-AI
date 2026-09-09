import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from backend.config import settings

logger = logging.getLogger("drishti.database")

# Base model
Base = declarative_base()

# Resolve and normalize DATABASE_URL
raw_database_url = settings.DATABASE_URL
if raw_database_url.startswith("postgres://"):
    raw_database_url = raw_database_url.replace("postgres://", "postgresql://", 1)

active_database_url = raw_database_url
is_fallback = False


def _create_db_engine(url: str):
    """Create SQLAlchemy engine with appropriate connection parameters."""
    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            echo=False
        )
    else:
        return create_engine(
            url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False
        )


# Attempt initial engine creation and connection verification
try:
    engine = _create_db_engine(active_database_url)
    if not active_database_url.startswith("sqlite"):
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"[Database] Successfully connected to PostgreSQL at {active_database_url.split('@')[-1]}")
except Exception as err:
    logger.warning(
        f"[Database Warning] PostgreSQL initialization failed ({err}). "
        f"Falling back to local SQLite database as specified in AGENTS.md."
    )
    print(
        f"[Database Warning] PostgreSQL connection failed ({err}). "
        f"Falling back to local SQLite database (sqlite:///./drishti_landslide.db) as per AGENTS.md guardrail."
    )
    active_database_url = "sqlite:///./drishti_landslide.db"
    engine = _create_db_engine(active_database_url)
    is_fallback = True

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency for yielding database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_info() -> dict:
    """Return runtime database dialect, host/file information, and fallback status."""
    return {
        "dialect": engine.dialect.name,
        "is_fallback": is_fallback,
        "database": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url),
        "status": "connected"
    }

