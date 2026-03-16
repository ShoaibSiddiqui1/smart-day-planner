from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth, database

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

@app.post("/", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
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

@app.get("/", response_model=list[schemas.Task])
def get_tasks(
    db: Session = Depends(database.get_db), 
    token: str = Depends(auth.oauth2_scheme)
):
    user_id = auth.get_user_id_from_token(token)
    return db.query(models.Task).filter(models.Task.owner_id == user_id).all()