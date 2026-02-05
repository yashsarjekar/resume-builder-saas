"""
Initialize database tables.

This script creates all database tables defined in the models.
"""

from app.database import engine, Base
from app.models import user, resume, payment

def init_database():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")

if __name__ == "__main__":
    init_database()
