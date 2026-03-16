"""
Pydantic schemas for request validation and response serialization.
"""
from datetime import date, datetime, time
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from .models import ScheduleStatus, TaskStatus

# --- User schemas ---
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

# --- Task schemas ---
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=5)
    duration_minutes: int = Field(default=30, ge=1, le=1440)
    # Fixed typo: changed 'datatime' to 'datetime'
    earliest_start: Optional[datetime] = None 
    latest_end: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    duration_minutes: Optional[int] = Field(None, ge=1, le=1440)
    # Match TaskBase: change 'time' to 'datetime'
    earliest_start: Optional[datetime] = None 
    latest_end: Optional[datetime] = None
    status: Optional[TaskStatus] = None

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

# --- Auth schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None



class ScheduleItemBase(BaseModel):
    task_id: int
    position: int
    scheduled_start: datetime
    scheduled_end: datetime
    travel_time_minutes: Optional[int] = None

class ScheduleItemResponse(ScheduleItemBase):
    id: int
    task: TaskResponse # This nests the full task info inside the schedule item

    class Config:
        from_attributes = True

class ScheduleResponse(BaseModel):
    id: int
    user_id: int
    schedule_date: date
    status: str
    total_duration_minutes: Optional[int] = 0
    items: List[ScheduleItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True