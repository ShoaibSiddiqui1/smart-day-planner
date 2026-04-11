"""
User registration endpoint.
Protected profile endpoints (GET /me, PATCH /me) will be added here
once the team's JWT auth dependency is available after merging.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import auth as auth_utils, models, schemas
from ..database import get_db
from ..routers.tasks import geocode_location
router = APIRouter()


@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(models.User).filter(models.User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    lat, lon = None, None

    if user_in.home_address:
        geo = await geocode_location(user_in.home_address)

        if not geo:
            raise HTTPException(
                status_code=400,
                detail=f"Could not find a valid home address for '{user_in.home_address}'."
            )

        lat = geo["latitude"]
        lon = geo["longitude"]

    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=auth_utils.hash_password(user_in.password),
        home_address=user_in.home_address,
        latitude=lat,
        longitude=lon
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    return current_user


@router.patch("/me", response_model=schemas.UserResponse)
async def update_user_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    update_data = user_update.model_dump(exclude_unset=True)

    if "home_address" in update_data and update_data["home_address"]:
        geo = await geocode_location(update_data["home_address"])

        if not geo:
            raise HTTPException(
                status_code=400,
                detail=f"Could not find a valid home address for '{update_data['home_address']}'."
            )

        update_data["latitude"] = geo["latitude"]
        update_data["longitude"] = geo["longitude"]

    if "latitude" in update_data:
        lat = update_data["latitude"]
        if lat is not None and (lat < -90 or lat > 90):
            raise HTTPException(status_code=400, detail="Invalid latitude")

    if "longitude" in update_data:
        lon = update_data["longitude"]
        if lon is not None and (lon < -180 or lon > 180):
            raise HTTPException(status_code=400, detail="Invalid longitude")

    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    return current_user
