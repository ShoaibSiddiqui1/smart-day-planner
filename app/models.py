"""
Database models module
It defines the SQLAIchemy ORM models for the Smart Day Planner
Includes user accounts and their associated tasks
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base ## this will come from DB connection files

class User(Base):
  """
  This respresents a user in the system
  Attributes:
        -username(string): unique identifier for login
        -emails(string): unique email address
        -hashed_password(string): the bcrypt hashed password for security requirements
        -tasks(list): relationship to task model

  """
  __tablename__ = "users"
  id = Column(Integer, primary_key = True, index = True)
  username = Column(String, unique = True, index = True, nullable = False)
  email = Column(String, unique=True, index=True, nullable=False)
  hashed_password = Column(String, nullable=False)
  is_active = Column(Boolean, default = True)

  tasks = relationship('Task', back_populates = 'owner')

class Task(Base):
  """
  This represents a planned task for a specific user
  Attributes:
        -title(string): name of task
        -location(string): physical address for route optimzation
        -priority(string): importance lvl
        -owner_id(int): foreign key linking to user

  """
  __tablename__ = "tasks"
  title = Column(String, index = True)
  id = Column(Integer, primary_key=True, index=True)
  description = Column(String)
  location = Column(String)
  priority = Column(Integer, default = 1)
  owner_id = Column(Integer, ForeignKey('users.id'))
  owner = relationship("User", back_populates = 'tasks')

