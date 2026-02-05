"""
Database configuration and session management.

This module sets up the SQLAlchemy engine, session maker, and base class
for all database models.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please create a .env file with DATABASE_URL."
    )

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=10,  # Number of connections to keep open
    max_overflow=20,  # Max connections beyond pool_size
    echo=False,  # Set to True for SQL query logging (development only)
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI.

    Yields:
        Session: SQLAlchemy database session

    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database by creating all tables.

    This should be called once during application startup
    or handled by Alembic migrations in production.
    """
    from app.models import user, resume, payment  # Import all models
    Base.metadata.create_all(bind=engine)


def close_db() -> None:
    """
    Close database engine and dispose of connection pool.

    This should be called during application shutdown.
    """
    engine.dispose()
