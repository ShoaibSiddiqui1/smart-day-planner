from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth, database
from fastapi.middleware.cors import CORSMiddleware
from . import algorithms
from datetime import datetime, timedelta

# Import the initialized settings from schemas
from .config import settings
# init app
app = FastAPI(title = "Smart Day Planer API")

# 1. Define who can talk to your API
origins = [
    "http://localhost",
    "http://localhost:3000", # Common for React
    "http://localhost:8000", # Common for FastAPI/docs
    "*", # The "Wildcard" - allows anyone (good for testing, risky for production)
]

# 2. Add the Middleware "Guard"
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, DELETE, etc.
    allow_headers=["*"], # Allows Authorization headers
)

# create db tables
models.Base.metadata.create_all(bind = database.engine)

@app.get("/")
def root():
    return {"message": "Smart Day Planner API is running!"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_database)):
    # Manual check for empty fields (FastAPI OAuth2 doesn't do this by default)
    if not form_data.username or not form_data.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
  
    access_token = auth.create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model = schemas.UserResponse, status_code = status.HTTP_201_CREATED)
def create_user (user: schemas.UserCreate, db: Session = Depends(database.get_database)):

# check if the user already exist
  db_user = db.query(models.User).filter(models.User.email == user.email).first()
  if db_user:
    raise HTTPException(status_code = 400, detail = "Email already registered")

# Hash the password

  hashed_pwd = auth.hash_password(user.password)

# Create module instances
  new_user = models.User(
    username = user.username,
    email = user.email,
    hashed_password = hashed_pwd
  )


# Save the user in the db
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return new_user

@app.post("/tasks", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
def create_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(database.get_database),
    token: str = Depends(auth.oauth2_scheme) # This protects the route
):
    # 1. Decode the token to find out who the user is
    user_id = auth.get_user_id_from_token(token)
    
    #  2. Create the task linked to that user
    new_task = models.Task(**task.model_dump(), owner_id=user_id)
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.get("/tasks", response_model=list[schemas.Task])
def get_tasks(
    db: Session = Depends(database.get_database), 
    token: str = Depends(auth.oauth2_scheme)
):
    # 1. Decode the token to get the user's ID
    user_id = auth.get_user_id_from_token(token)
    
    # 2. Filter the database so they ONLY see their own tasks
    tasks = db.query(models.Task).filter(models.Task.owner_id == user_id).all()
    
    return tasks

@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int, 
    db: Session = Depends(database.get_database), 
    token: str = Depends(auth.oauth2_scheme)
):
    user_id = auth.get_user_id_from_token(token)
    
    # Find the task that matches the ID AND the owner
    task_query = db.query(models.Task).filter(
        models.Task.id == task_id, 
        models.Task.owner_id == user_id
    )
    task = task_query.first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Task not found or you don't have permission to delete it"
        )

    task_query.delete(synchronize_session=False)
    db.commit()
    
    return None # 204 No Content doesn't return a body


@app.patch("/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int, 
    task_update: schemas.TaskUpdate, 
    db: Session = Depends(database.get_database), 
    token: str = Depends(auth.oauth2_scheme)
):
    user_id = auth.get_user_id_from_token(token)
    
    # 1. Locate the task
    task_query = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == user_id)
    db_task = task_query.first()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 2. Extract the data sent in the request (excluding unset fields)
    update_data = task_update.model_dump(exclude_unset=True)

    # 3. Apply changes and save
    task_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(db_task)
    
    return db_task


@app.get("/tasks/optimized", response_model=list[schemas.Task])
async def get_optimized_tasks( # Added async here
    lat: float, 
    lon: float, 
    db: Session = Depends(database.get_database), 
    token: str = Depends(auth.oauth2_scheme)
):
    user_id = auth.get_user_id_from_token(token)
    tasks = db.query(models.Task).filter(models.Task.owner_id == user_id).all()
    
    if not tasks:
        return []

    start_coords = (lat, lon)
    start_time = datetime.now()

    # FIX: Call the new async function name with 'await'
    optimized_list = await algorithms.optimize_schedule_smart(tasks, start_coords, start_time)
    
    return optimized_list
