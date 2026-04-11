"""
Database models module
It defines the SQLAIchemy ORM models for the Smart Day Planner
Includes user accounts and their associated tasks
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base ## this will come from DB connection files
import enum
from datetime import datetime

class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"   
    CANCELLED = "cancelled"

class ScheduleStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

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

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    profile_picture = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    home_address = Column(String, nullable=True)


    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship('Task', back_populates='owner')

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

    # Optimization & Timing
    location = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    duration_minutes = Column(Integer, default=30)
    earliest_start = Column(DateTime, nullable=True)
    latest_end = Column(DateTime, nullable=True)

    priority = Column(Integer, default=1)

    # Use the Enum value for the default
    status = Column(String, default=TaskStatus.PENDING.value) 

    # Audit Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner_id = Column(Integer, ForeignKey('users.id'))
    owner = relationship("User", back_populates='tasks')

    # Add to backend/app/models.py

class Schedule(Base):
    __tablename__ = "schedules"
    __table_args__ = (
        UniqueConstraint("user_id", "schedule_date", name="uq_user_schedule_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    schedule_date = Column(Date, default=lambda: datetime.utcnow().date())
    status = Column(String, default="generated")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship(
        "ScheduleItem",
        back_populates="schedule",
        cascade="all, delete-orphan"
    )

class ScheduleItem(Base):
    __tablename__ = "schedule_items"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id"))
    task_id = Column(Integer, ForeignKey("tasks.id"))
    position = Column(Integer)
    scheduled_start = Column(DateTime)
    scheduled_end = Column(DateTime)
    travel_time_minutes = Column(Integer, default=0)

    schedule = relationship("Schedule", back_populates="items")
    task = relationship("Task")