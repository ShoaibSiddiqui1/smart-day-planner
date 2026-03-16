from app.database import engine, Base
from app import models

def reset_database():
    print("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("🏗️  Recreating tables with new Schedule models...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database is fresh and updated!")

if __name__ == "__main__":
    reset_database()