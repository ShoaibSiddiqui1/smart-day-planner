from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Import your local modules
from .. import auth as auth_utils, models, schemas, algorithms
from ..database import get_db

router = APIRouter()

@router.post("/generate", response_model=schemas.ScheduleResponse)
async def create_schedule(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    # 1. Fetch pending tasks
    tasks = db.query(models.Task).filter(
        models.Task.owner_id == current_user.id,
        models.Task.status == "pending"
    ).all()

    if not tasks:
        raise HTTPException(status_code=400, detail="No pending tasks found")

    # 2. Run the Algorithm
    start_location = (40.7128, -74.0060) 
    optimized_tasks = await algorithms.optimize_schedule_smart(tasks, start_location, datetime.now())

    # 3. Create the Schedule Record in DB
    new_schedule = models.Schedule(
        user_id=current_user.id,
        schedule_date=datetime.now().date()
    )
    db.add(new_schedule)
    db.flush() 

    # 4. Create the individual Items
    current_time = datetime.now()
    schedule_items = []
    total_minutes = 0  # ✅ Initialize the counter here

    for i, task in enumerate(optimized_tasks):
        duration_minutes = task.duration_minutes or 0
        duration = timedelta(minutes=duration_minutes)
        total_minutes += duration_minutes # ✅ Add to total
        
        db_item = models.ScheduleItem(
            schedule_id=new_schedule.id,
            task_id=task.id,
            position=i,
            scheduled_start=current_time,
            scheduled_end=current_time + duration
        )
        db.add(db_item)
        schedule_items.append(db_item)
        
        # Advance clock for next task (plus 10m buffer)
        current_time += duration + timedelta(minutes=10)

    db.commit()
    db.refresh(new_schedule)

    # 5. Return the response
    return {
        "id": new_schedule.id,
        "user_id": new_schedule.user_id,
        "schedule_date": new_schedule.schedule_date,
        "status": new_schedule.status,
        "total_duration_minutes": total_minutes, 
        "items": schedule_items,
        "created_at": new_schedule.created_at,
        "updated_at": getattr(new_schedule, 'updated_at', new_schedule.created_at)
    }

@router.get("/latest", response_model=schemas.ScheduleResponse)
def get_latest_schedule(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    # Fetch the most recent schedule created by this user
    schedule = db.query(models.Schedule).filter(
        models.Schedule.user_id == current_user.id
    ).order_by(models.Schedule.created_at.desc()).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="No schedules found for this user.")

    # We need to calculate total_duration_minutes for the response
    total_minutes = sum(item.task.duration_minutes for item in schedule.items)

    return {
        "id": schedule.id,
        "user_id": schedule.user_id,
        "schedule_date": schedule.schedule_date,
        "status": schedule.status,
        "total_duration_minutes": total_minutes,
        "items": schedule.items,
        "created_at": schedule.created_at,
        "updated_at": getattr(schedule, 'updated_at', schedule.created_at)
    }