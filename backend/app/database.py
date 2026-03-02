"""
Database configuration.
Sets up the SQLAlchemy engine, session factory, and declarative Base.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    # Connection pool settings for production stability
    pool_pre_ping=True,       # Test connections before use
    pool_size=10,             # Number of persistent connections
    max_overflow=20,          # Extra connections allowed under load
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
