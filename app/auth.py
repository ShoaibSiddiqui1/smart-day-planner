"""
This module provides cryptographic tools for securing user password
"""
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status
from dotenv import load_dotenv

# This looks for the .env file and loads the variables
load_dotenv()

# Now we pull from the environment
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login") # tells how to get token by FastAPI
password_manager = CryptContext(schemes = ["bcrypt"], deprecated = "auto")

"""
Secure password from plain password
"""
def hash_password(password: str):
  return password_manager.hash(password)

"""
Check the login password if matches stored hashed password
"""
def verify_password(plain_password, hashed_password):
  return password_manager.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    """
    Creates a signed JWT token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_id_from_token(token: str):
    """
    Decodes the token to find the user_id
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token is missing user information"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Could not validate credentials"
        )