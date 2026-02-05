"""
Database initialization script
Creates all tables in the database on first run
"""
from app.database import engine, Base
from app.models import user, resume, payment  # Import all models to register them

def init_database():
    """Create all database tables"""
    print("🔧 Initializing database...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")

        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if tables:
            print(f"📋 Tables: {', '.join(tables)}")
        else:
            print("⚠️  No tables found!")

        return True
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    init_database()
