from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

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

    # 2. Run optimization
    user_lat = current_user.latitude if current_user.latitude is not None else 40.7128
    user_lon = current_user.longitude if current_user.longitude is not None else -74.0060
    start_location = (user_lat, user_lon)
    optimized_tasks = await algorithms.optimize_schedule_smart(
        tasks,
        start_location,
        datetime.now()
    )

    today = datetime.now().date()

    # 3. Look for an existing schedule for today
    existing_schedule = db.query(models.Schedule).filter(
        models.Schedule.user_id == current_user.id,
        models.Schedule.schedule_date == today
    ).first()

    if existing_schedule:
        schedule = existing_schedule

        db.query(models.ScheduleItem).filter(
            models.ScheduleItem.schedule_id == schedule.id
        ).delete(synchronize_session=False)

        schedule.status = "generated"
    else:
        schedule = models.Schedule(
            user_id=current_user.id,
            schedule_date=today,
            status="generated"
        )
        db.add(schedule)
        db.flush()

    # 4. Create new schedule items
    current_time = datetime.now()
    total_minutes = 0

    for i, task in enumerate(optimized_tasks):
        duration_minutes = task.duration_minutes or 0
        duration = timedelta(minutes=duration_minutes)
        travel_minutes = int(getattr(task, "real_travel_time", 0) or 0)

        total_minutes += duration_minutes

        arrival_time = current_time + timedelta(minutes=travel_minutes)

        scheduled_start = arrival_time
        scheduled_end = scheduled_start + duration

        db_item = models.ScheduleItem(
            schedule_id=schedule.id,
            task_id=task.id,
            position=i,
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_end,
            travel_time_minutes=travel_minutes
        )
        db.add(db_item)

        current_time = scheduled_end + timedelta(minutes=10)

    db.commit()
    db.refresh(schedule)

    return {
        "id": schedule.id,
        "user_id": schedule.user_id,
        "schedule_date": schedule.schedule_date,
        "status": schedule.status,
        "total_duration_minutes": total_minutes,
        "items": schedule.items,
        "created_at": schedule.created_at,
        "updated_at": getattr(schedule, "updated_at", schedule.created_at)
    }


@router.get("/latest", response_model=schemas.ScheduleResponse)
def get_latest_schedule(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    schedule = db.query(models.Schedule).filter(
        models.Schedule.user_id == current_user.id
    ).order_by(models.Schedule.created_at.desc()).first()

    if not schedule:
        raise HTTPException(
            status_code=404,
            detail="No schedules found for this user."
        )

    total_minutes = sum(
        (item.task.duration_minutes or 0)
        for item in schedule.items
        if item.task
    )

    return {
        "id": schedule.id,
        "user_id": schedule.user_id,
        "schedule_date": schedule.schedule_date,
        "status": schedule.status,
        "total_duration_minutes": total_minutes,
        "items": schedule.items,
        "created_at": schedule.created_at,
        "updated_at": getattr(schedule, "updated_at", schedule.created_at)
    }