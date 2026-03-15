"""
Email utility for sending password reset emails via SMTP.
Uses Python's built-in smtplib — no extra packages required.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from .config import settings


def send_password_reset_email(to_email: str, reset_token: str) -> None:
    """
    Send a password reset email containing the reset token.
    Silently skips sending if SMTP credentials are not configured.
    """
    if not settings.SMTP_USERNAME or not settings.EMAIL_FROM:
        # SMTP not configured — in development, log the token instead.
        print(f"[DEV] Password reset token for {to_email}: {reset_token}")
        return

    subject = "Smart Day Planner – Password Reset"
    body = f"""Hi,

You requested a password reset for your Smart Day Planner account.

Use the code below in the app to reset your password. It expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.

Reset Code: {reset_token}

If you did not request this, you can safely ignore this email.

— The Smart Day Planner Team
"""

    msg = MIMEMultipart()
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
