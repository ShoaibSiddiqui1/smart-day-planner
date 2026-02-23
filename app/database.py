"""
Database config
This module sets up the SQLALchemy connection to the PostgreSQL database,
and creates engine, database sessions, and Base class.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

"""
Define database url
Format: postgresql: // name:passowrd @ host - database name
"""
SQLALCHEMY_DATABASE_URL = "postgresql://day_planner_admiss:coke123@localhost/smart_day_planner"


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