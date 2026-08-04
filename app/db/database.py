from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    future=True,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_postgres_columns() -> None:
    """Add Week-2 columns to existing tables (create_all does not alter)."""
    if not settings.DATABASE_URL.startswith("postgresql"):
        return
    statements = [
        "ALTER TABLE generated_components ADD COLUMN IF NOT EXISTS session_id INTEGER",
        "ALTER TABLE telemetry_logs ADD COLUMN IF NOT EXISTS scroll_speed DOUBLE PRECISION",
        "CREATE INDEX IF NOT EXISTS ix_generated_components_user_id ON generated_components (user_id)",
        "CREATE INDEX IF NOT EXISTS ix_generated_components_session_id ON generated_components (session_id)",
        "CREATE INDEX IF NOT EXISTS ix_generated_components_created_at ON generated_components (created_at)",
        "CREATE INDEX IF NOT EXISTS ix_telemetry_logs_session_id ON telemetry_logs (session_id)",
        "CREATE INDEX IF NOT EXISTS ix_telemetry_logs_created_at ON telemetry_logs (created_at)",
    ]
    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def init_db():
    from app.models import User, Session, Telemetry, GeneratedComponent  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_postgres_columns()


def check_db_connection() -> bool:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
