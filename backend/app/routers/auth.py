"""
Authentication endpoints:
  POST /auth/login            – validate credentials, return JWT
  GET  /auth/me               – return the currently authenticated user (protected)
  POST /auth/forgot-password  – generate a reset token and email it to the user
  POST /auth/reset-password   – validate the token and set a new password
"""
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import create_access_token, get_current_user, hash_password, verify_password
from ..config import settings
from ..database import get_db
from ..email_utils import send_password_reset_email

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user by email + password.
    Returns a Bearer JWT on success; raises 401 on any failure.
    Intentionally gives a generic error message to prevent user enumeration.
    """
    user = (
        db.query(models.User)
        .filter(models.User.email == credentials.email)
        .first()
    )

    # Use verify_password even when user is None to prevent timing attacks
    dummy_hash = "$2b$12$KIXeATmsuYei.zA5BhLtJuabc123fakehashabcdefghijklmno"  # never matches
    stored_hash = user.hashed_password if user else dummy_hash

    if not verify_password(credentials.password, stored_hash) or user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
        )

    access_token = create_access_token(user.id)
    return schemas.Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user


@router.post("/forgot-password", response_model=schemas.MessageResponse)
def forgot_password(
    body: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a short-lived reset token and email it to the user.
    Always returns a generic success message to prevent user enumeration.
    """
    user = db.query(models.User).filter(models.User.email == body.email).first()

    if user and user.is_active:
        # Invalidate any existing unused tokens for this user
        db.query(models.PasswordResetToken).filter(
            models.PasswordResetToken.user_id == user.id,
            models.PasswordResetToken.is_used == False,  # noqa: E712
        ).update({"is_used": True})

        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES
        )
        db.add(models.PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at,
        ))
        db.commit()

        send_password_reset_email(user.email, token)

    return schemas.MessageResponse(
        message="If that email is registered, a reset code has been sent."
    )


@router.post("/reset-password", response_model=schemas.MessageResponse)
def reset_password(
    body: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Validate the reset token and update the user's password.
    """
    reset_record = (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.token == body.token,
            models.PasswordResetToken.is_used == False,  # noqa: E712
        )
        .first()
    )

    if reset_record is None or reset_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    user = db.query(models.User).filter(models.User.id == reset_record.user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    user.hashed_password = hash_password(body.new_password)
    reset_record.is_used = True
    db.commit()

    return schemas.MessageResponse(message="Password updated successfully.")
