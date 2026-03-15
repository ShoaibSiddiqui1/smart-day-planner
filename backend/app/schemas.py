"""
Pydantic schemas for request validation and response serialization.
"""
from datetime import date, datetime, time
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from .models import ScheduleStatus, TaskStatus


# ---------------------------------------------------------------------------
# Auth schemas
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# User schemas
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    home_address: Optional[str] = None


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    home_address: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    home_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Task schemas
# ---------------------------------------------------------------------------

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=5)
    duration_minutes: int = Field(default=30, ge=1, le=1440)
    deadline: Optional[datetime] = None
    earliest_start: Optional[time] = None
    latest_end: Optional[time] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    duration_minutes: Optional[int] = Field(None, ge=1, le=1440)
    deadline: Optional[datetime] = None
    earliest_start: Optional[time] = None
    latest_end: Optional[time] = None
    status: Optional[TaskStatus] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None


class TaskResponse(TaskBase):
    id: int
    status: TaskStatus
    owner_id: int
    latitude: Optional[float]
    longitude: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Schedule schemas
# ---------------------------------------------------------------------------

class ScheduleItemBase(BaseModel):
    task_id: int
    position: int
    scheduled_start: datetime
    scheduled_end: datetime
    travel_time_minutes: Optional[int] = None
    travel_distance_km: Optional[float] = None


class ScheduleItemResponse(ScheduleItemBase):
    id: int
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    task: TaskResponse

    class Config:
        from_attributes = True


class ScheduleResponse(BaseModel):
    id: int
    user_id: int
    schedule_date: date
    status: ScheduleStatus
    total_duration_minutes: Optional[int]
    optimization_score: Optional[float]
    items: List[ScheduleItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
