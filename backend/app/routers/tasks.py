from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import httpx

from .. import models, schemas, auth, algorithms
from ..database import get_db

router = APIRouter(tags=["Tasks"])


# ==============================
# GEOCODING FUNCTION
# ==============================
async def geocode_location(location: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": location,
        "format": "jsonv2",
        "addressdetails": 1,
        "limit": 5,
        "countrycodes": "us",
    }
    headers = {
        "User-Agent": "smart-day-planner/1.0"
    }

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params, headers=headers, timeout=10.0)
            res.raise_for_status()
            data = res.json()

            if not data:
                return None

            best = data[0]

            return {
                "latitude": float(best["lat"]),
                "longitude": float(best["lon"]),
                "display_name": best.get("display_name"),
            }
        except Exception as e:
            print("Geocoding error:", e)
            return None 


# ==============================
# CREATE TASK
# ==============================
@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    lat, lon = None, None

    if task.location:
        geo = await geocode_location(task.location)

        if not geo:
            raise HTTPException(
                status_code=400,
                detail=f"Could not find a valid location for '{task.location}'. Please enter a more specific address or place name."
            )

        lat = geo["latitude"]
        lon = geo["longitude"]

        print("Geocoded task:", {
            "input": task.location,
            "matched": geo["display_name"],
            "lat": lat,
            "lon": lon,
        })

    new_task = models.Task(
        **task.model_dump(),
        owner_id=current_user.id,
        status="pending",
        latitude=lat,
        longitude=lon,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# ==============================
# GET USER TASKS
# ==============================
@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Task)\
        .filter(models.Task.owner_id == current_user.id)\
        .order_by(models.Task.earliest_start.asc())\
        .all()


# ==============================
# OPTIMIZE TASKS
# ==============================
@router.get("/optimize", response_model=List[schemas.TaskResponse])
async def get_optimized_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    tasks = db.query(models.Task).filter(
        models.Task.owner_id == current_user.id,
        models.Task.status == "pending"
    ).all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No pending tasks found")

    user_lat = getattr(current_user, "latitude", 40.7128)
    user_lon = getattr(current_user, "longitude", -74.0060)

    optimized_list = await algorithms.optimize_schedule_smart(
        tasks=tasks,
        start_coords=(user_lat, user_lon),
        start_time=datetime.now()
    )

    if not optimized_list:
        raise HTTPException(
            status_code=422,
            detail="Could not fit tasks into schedule"
        )

    return optimized_list


# ==============================
# DELETE TASK
# ==============================
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task_query = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    )

    task = task_query.first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.query(models.ScheduleItem).filter(
        models.ScheduleItem.task_id == task_id
    ).delete(synchronize_session=False)

    task_query.delete(synchronize_session=False)
    db.commit()

    return None


# ==============================
# UPDATE TASK
# ==============================
@router.patch("/{task_id}", response_model=schemas.TaskResponse)
async def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump(exclude_unset=True)

    if "location" in update_data and update_data["location"]:
        lat, lon = await geocode_location(update_data["location"])
        update_data["latitude"] = lat
        update_data["longitude"] = lon

    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)

    return db_task