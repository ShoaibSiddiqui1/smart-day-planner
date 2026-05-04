import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import database, models, auth
from ..config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def _send_reset_email(to_email: str, reset_token: str) -> None:
    """Send password reset email via SMTP. Logs a warning if email is not configured."""
    if not settings.smtp_user or not settings.smtp_password or not settings.email_from:
        logger.warning(
            "Email not configured (set SMTP_USER, SMTP_PASSWORD, EMAIL_FROM in .env). "
            "Reset token for %s: %s", to_email, reset_token
        )
        return

    subject = "Smart Day Planner — Password Reset"
    body = (
        f"Hi,\n\n"
        f"We received a request to reset your password.\n\n"
        f"Use this token in the app to set a new password:\n\n"
        f"  {reset_token}\n\n"
        f"This token expires in {settings.access_token_expire_minutes} minutes.\n\n"
        f"If you did not request this, you can safely ignore this email.\n\n"
        f"— Smart Day Planner"
    )

    msg = MIMEMultipart()
    msg["From"] = settings.email_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.email_from, to_email, msg.as_string())
        logger.info("Password reset email sent to %s", to_email)
    except Exception as exc:
        logger.error("Failed to send reset email to %s: %s", to_email, exc)
        raise HTTPException(
            status_code=503,
            detail="Could not send reset email. Please try again later."
        )


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    # Return the same message whether or not the email exists (prevents user enumeration)
    if not user:
        return {"message": "If that email is registered you will receive a reset link shortly."}

    reset_token = auth.create_access_token(data={"user_id": user.id, "purpose": "reset"})
    _send_reset_email(user.email, reset_token)

    return {"message": "If that email is registered you will receive a reset link shortly."}


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
