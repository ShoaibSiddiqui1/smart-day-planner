"""
FastAPI application entry point.

Routers for auth, tasks, and schedules are owned by other team members and
will be registered here once the branches are merged.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .routers import users

# Create all tables on startup (Alembic handles this in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

# CORS – allow the React Native app to reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["Users"])

# TODO: register auth, tasks, and schedules routers after team merge


@app.get("/")
def root():
    return {"message": f"{settings.APP_NAME} is running"}
