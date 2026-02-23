'''
This module defines Pydantic models (data transfer objs) for the app
Handles data validation for incoming requests && formats outgoing API responses

Core functionalities for this module
- user registration and response validation
- task data structure with priority and location validation
- conversion between SQLALchemy models and JOSON thro (from_attributes)
'''
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

#---------------------user-----------------------------------
'''
Shared proprities for users
'''
class UserBase(BaseModel):
  username: str
  email:EmailStr


'''
Min length for user password must be at least 8 digits
'''
class UserCreate(UserBase):
  password: str = Field(..., min_length = 8)


'''
Data from frontend
'''
class UserResponse(UserBase):
  id: int
  is_active: bool
  class Config:
        from_attributes = True


#-----------------------task---------------------------------

'''
properties for tasks
'''
class TaskBase(BaseModel):
  title: str
  description: Optional[str] = None
  location: str # will be the address used in the algor later
  priority: int = Field(default = 1, ge = 1, le = 5) # prio from 1 to 5. (5 lvls)


'''
For creating a task
'''
class TaskCreate(TaskBase):
  pass



'''
Data returning to frontend
'''
class Task(TaskBase):
  id: int
  owner_id: int
  class Config:
    from_attributes = True