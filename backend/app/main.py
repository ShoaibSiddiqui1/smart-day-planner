"""
FastAPI application entry point.

Routers for auth, tasks, and schedules are owned by other team members and
will be registered here once the branches are merged.
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .routers import users, tasks 
from . import models, auth, database

app = FastAPI(title="Smart Day Planner API")

# 1. CORS Middleware (Essential for your React Native app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Create tables
models.Base.metadata.create_all(bind=database.engine)

# 3. Include Routers
app.include_router(users.router)
app.include_router(tasks.router)

# 4. Global Login (Since it links Users and Auth)
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = auth.create_access_token(data={"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
def root():
    return {"message": "Smart Day Planner API is running!"}