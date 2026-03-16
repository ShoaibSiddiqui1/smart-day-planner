from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth, database, algorithms
from datetime import datetime
from ..database import get_db
from typing import List

router = APIRouter(
    tags=["Tasks"]
)

@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    user_id = auth.get_user_id_from_token(token)
    new_task = models.Task(**task.model_dump(), owner_id=user_id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/", response_model=list[schemas.TaskResponse])
def get_tasks(
    db: Session = Depends(database.get_db), 
    token: str = Depends(auth.oauth2_scheme)
):
    user_id = auth.get_user_id_from_token(token)
    # FIX 2: Added .order_by so tasks appear in a logical time sequence
    return db.query(models.Task)\
             .filter(models.Task.owner_id == user_id)\
             .order_by(models.Task.earliest_start.asc())\
             .all()

@router.get("/optimize", response_model=list[schemas.TaskResponse])
async def get_optimized_tasks(
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    user_id = auth.get_user_id_from_token(token)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    tasks = db.query(models.Task).filter(
        models.Task.owner_id == user_id,
        models.Task.status == "pending"
    ).all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No pending tasks found to optimize")

    # FIX 1: Use User's home coordinates if available, otherwise default to NYC
    # Note: Ensure you added latitude/longitude to your User model in models.py!
    user_lat = getattr(user, 'latitude', 40.7128) 
    user_lon = getattr(user, 'longitude', -74.0060)
    
    # If the user only has a string address, you'd eventually use a Geocoding API here.
    start_coords = (user_lat, user_lon)
    start_time = datetime.utcnow()

    optimized_list = await algorithms.optimize_schedule_smart(
        tasks=tasks,
        start_coords=start_coords,
        start_time=start_time
    )

    # FIX 3: Raise an error if the windows are so tight that NO tasks could be scheduled
    if not optimized_list:
        raise HTTPException(
            status_code=422, 
            detail="Could not fit any tasks into a valid schedule. Check your time windows."
        )

    return optimized_list

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    # 1. Identify the user from the token
    user_id = auth.get_user_id_from_token(token)
    
    # 2. Find the task that belongs to THIS user
    task_query = db.query(models.Task).filter(
        models.Task.id == task_id, 
        models.Task.owner_id == user_id
    )
    
    task = task_query.first()

    # 3. Handle errors if the task doesn't exist or doesn't belong to the user
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )

    # 4. Delete and commit
    task_query.delete(synchronize_session=False)
    db.commit()
    
    # 204 No Content doesn't return data, just confirms success
    return None

@router.patch("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskCreate, # Or create a TaskUpdate schema with optional fields
    db: Session = Depends(database.get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    user_id = auth.get_user_id_from_token(token)
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == user_id).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.TaskResponse])
def get_my_tasks(
    db: Session = Depends(get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    # 1. Get the current user's ID from the token
    user_id = auth.get_user_id_from_token(token)
    
    # 2. Query only tasks where owner_id matches
    tasks = db.query(models.Task).filter(models.Task.owner_id == user_id).all()
    
    return tasks