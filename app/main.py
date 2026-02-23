from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas, auth, database  # import my files

# init app
app = FastAPI(title = "Smart Day Planer API")

# create db tables
models.Base.metadata.create_all(bind = database.engine)

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