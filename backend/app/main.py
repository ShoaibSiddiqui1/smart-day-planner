"""
FastAPI application entry point.

Registers routers for users, tasks, schedules, and auth.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .routers import users, tasks, schedules, auth as auth_router
from . import models, auth, database

app = FastAPI(title="Smart Day Planner API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# Register routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
app.include_router(auth_router.router, tags=["auth"])

# Global login endpoint
@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    print("LOGIN ENDPOINT HIT")

    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = auth.create_access_token(data={"user_id": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@app.get("/")
def root():
    return {"message": "Smart Day Planner API is running!"}