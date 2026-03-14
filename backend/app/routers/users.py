"""
User registration endpoint.
Protected profile endpoints (GET /me, PATCH /me) will be added here
once the team's JWT auth dependency is available after merging.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import auth as auth_utils, models, schemas
from ..database import get_db

router = APIRouter()


@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=auth_utils.hash_password(user_in.password),
        home_address=user_in.home_address,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
