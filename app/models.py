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

# NEW: Specific fields for optimization [cite: 5, 47]
location = Column(String)  # Physical address
latitude = Column(Float, nullable=True)   # Needed for GPS/Route math
longitude = Column(Float, nullable=True)  # Needed for GPS/Route math

# NEW: Time constraints 
duration_minutes = Column(Integer, default=30) # How long the task takes
start_window = Column(DateTime, nullable=True) # Earliest start time
end_window = Column(DateTime, nullable=True)   # Latest finish time

priority = Column(Integer, default=1) # 1=Low, 5=High [cite: 6]

owner_id = Column(Integer, ForeignKey('users.id'))
owner = relationship("User", back_populates='tasks')

