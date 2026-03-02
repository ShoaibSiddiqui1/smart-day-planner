"""
SQLAlchemy ORM models for the Smart Day Planner.

Tables:
  - users          : Authenticated user accounts
  - tasks          : User-defined tasks with time/location constraints
  - schedules      : Optimized daily schedule generated for a user
  - schedule_items : Ordered task slots within a schedule
  - refresh_tokens : JWT refresh tokens for session management
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, Float,
    ForeignKey, Integer, String, Time,
)
from sqlalchemy.orm import relationship

from .database import Base


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now():
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class TaskStatus(str, enum.Enum):
    pending   = "pending"
    completed = "completed"
    skipped   = "skipped"
    cancelled = "cancelled"


class ScheduleStatus(str, enum.Enum):
    draft     = "draft"
    active    = "active"
    completed = "completed"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    """
    Represents a registered user.
    - home_address is used as the default start/end point for route optimization.
    """
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(50), unique=True, index=True, nullable=False)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active       = Column(Boolean, default=True, nullable=False)
    home_address    = Column(String(500), nullable=True)   # starting point for routes
    created_at      = Column(DateTime(timezone=True), default=_now, nullable=False)
    updated_at      = Column(DateTime(timezone=True), default=_now, onupdate=_now, nullable=False)

    # Relationships
    tasks          = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    schedules      = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class Task(Base):
    """
    A user-defined task that can be placed in an optimized schedule.

    Time constraint fields:
      - duration_minutes : how long the task is expected to take
      - deadline         : the latest DateTime by which the task must be completed
      - earliest_start   : time-of-day before which the task cannot begin
      - latest_end       : time-of-day by which the task must finish each day

    Location fields:
      - location  : human-readable address used for route optimization
      - latitude / longitude : geocoded coordinates (populated by backend service)
    """
    __tablename__ = "tasks"

    id                  = Column(Integer, primary_key=True, index=True)
    title               = Column(String(200), index=True, nullable=False)
    description         = Column(String(1000), nullable=True)
    location            = Column(String(500), nullable=True)
    latitude            = Column(Float, nullable=True)
    longitude           = Column(Float, nullable=True)
    priority            = Column(Integer, default=1, nullable=False)   # 1 (low) – 5 (critical)
    duration_minutes    = Column(Integer, default=30, nullable=False)  # estimated task duration
    deadline            = Column(DateTime(timezone=True), nullable=True)
    earliest_start      = Column(Time, nullable=True)   # e.g. 09:00 – can't start before 9 am
    latest_end          = Column(Time, nullable=True)   # e.g. 17:00 – must end by 5 pm
    status              = Column(Enum(TaskStatus), default=TaskStatus.pending, nullable=False)
    is_recurring        = Column(Boolean, default=False, nullable=False)
    recurrence_pattern  = Column(String(50), nullable=True)  # e.g. "daily", "weekly"
    owner_id            = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at          = Column(DateTime(timezone=True), default=_now, nullable=False)
    updated_at          = Column(DateTime(timezone=True), default=_now, onupdate=_now, nullable=False)

    # Relationships
    owner          = relationship("User", back_populates="tasks")
    schedule_items = relationship("ScheduleItem", back_populates="task")


class Schedule(Base):
    """
    An optimized daily schedule generated for a user.

    - schedule_date      : the calendar day this schedule covers
    - optimization_score : 0–1 score produced by the routing algorithm
    - total_duration_minutes : sum of task durations + travel times
    """
    __tablename__ = "schedules"

    id                       = Column(Integer, primary_key=True, index=True)
    user_id                  = Column(Integer, ForeignKey("users.id"), nullable=False)
    schedule_date            = Column(Date, nullable=False, index=True)
    status                   = Column(Enum(ScheduleStatus), default=ScheduleStatus.draft, nullable=False)
    total_duration_minutes   = Column(Integer, nullable=True)
    optimization_score       = Column(Float, nullable=True)   # 0.0 – 1.0
    created_at               = Column(DateTime(timezone=True), default=_now, nullable=False)
    updated_at               = Column(DateTime(timezone=True), default=_now, onupdate=_now, nullable=False)

    # Relationships
    user  = relationship("User", back_populates="schedules")
    items = relationship("ScheduleItem", back_populates="schedule", order_by="ScheduleItem.position", cascade="all, delete-orphan")


class ScheduleItem(Base):
    """
    A single time slot within a Schedule.
    Represents one task placed at a specific time with travel info from the previous stop.
    """
    __tablename__ = "schedule_items"

    id                    = Column(Integer, primary_key=True, index=True)
    schedule_id           = Column(Integer, ForeignKey("schedules.id"), nullable=False)
    task_id               = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    position              = Column(Integer, nullable=False)          # order in the day (0-indexed)
    scheduled_start       = Column(DateTime(timezone=True), nullable=False)
    scheduled_end         = Column(DateTime(timezone=True), nullable=False)
    travel_time_minutes   = Column(Integer, nullable=True)           # travel from previous item
    travel_distance_km    = Column(Float, nullable=True)
    actual_start          = Column(DateTime(timezone=True), nullable=True)  # filled when user checks in
    actual_end            = Column(DateTime(timezone=True), nullable=True)
    created_at            = Column(DateTime(timezone=True), default=_now, nullable=False)

    # Relationships
    schedule = relationship("Schedule", back_populates="items")
    task     = relationship("Task", back_populates="schedule_items")


class RefreshToken(Base):
    """
    Stores JWT refresh tokens so they can be revoked on logout.
    """
    __tablename__ = "refresh_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    token      = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")
