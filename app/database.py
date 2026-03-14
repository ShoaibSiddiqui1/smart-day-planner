"""
Database config
This module sets up the SQLALchemy connection to the PostgreSQL database,
and creates engine, database sessions, and Base class.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

SQLALCHEMY_DATABASE_URL = settings.database_url



"""
Create engine (a connection to database)
"""
engine = create_engine(SQLALCHEMY_DATABASE_URL)

"""
Create data sessions to handle works
"""
sessions = sessionmaker(autocommit = False, autoflush = False, bind = engine)

"""
Create the Base class for modules 
"""
Base = declarative_base()


"""
Create a new db session for each request and close it once it finishes
"""
def get_database():
  db = sessions()
  try:
    yield db
  finally:
    db.close()