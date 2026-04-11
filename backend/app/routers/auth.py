from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import database, models, auth

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # TEMP: generate a simple reset token
    reset_token = auth.create_access_token(data={"user_id": user.id, "purpose": "reset"})

    # Later you would email this token instead of returning it
    return {
        "message": "Reset code generated successfully",
        "reset_token": reset_token
    }


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(database.get_db)
):
    try:
        data = auth.verify_access_token(payload.token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if data.get("purpose") != "reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user_id = data.get("user_id")
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = auth.hash_password(payload.new_password)
    db.commit()

    return {"message": "Password reset successfully"}