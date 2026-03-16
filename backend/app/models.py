"""
Database models module
It defines the SQLAIchemy ORM models for the Smart Day Planner
Includes user accounts and their associated tasks
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime
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
  home_address = Column(String, nullable=True)

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

  id = Column(Integer, primary_key=True, index=True)
  title = Column(String, index=True)
  description = Column(String)
  
  # Coordinates for your optimization algorithm [cite: 2026-02-23]
  location = Column(String)
  latitude = Column(Float, nullable=True)
  longitude = Column(Float, nullable=True)
  
  # Timing logic for the scheduler [cite: 2026-02-09]
  duration_minutes = Column(Integer, default=30)
  start_window = Column(DateTime, nullable=True)
  end_window = Column(DateTime, nullable=True)
  
  priority = Column(Integer, default=1)

  status = Column(String, default="pending")

  completed = Column(Boolean, default=False)
  
  owner_id = Column(Integer, ForeignKey('users.id'))
  owner = relationship("User", back_populates='tasks')