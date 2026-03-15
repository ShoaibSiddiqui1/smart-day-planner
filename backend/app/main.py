"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import auth, users

# Create tables on startup (Alembic handles this in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",      # Expo web
        "http://localhost:3000",      # Alternative dev port
        "http://192.168.133.1:8081",  # LAN IP web
        "http://127.0.0.1:8081",      # Loopback web
        "http://localhost",           # Expo emulator
        "http://192.168.133.1",       # LAN IP (emulator)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])


@app.get("/")
def root():
    return {"message": f"{settings.APP_NAME} is running"}
