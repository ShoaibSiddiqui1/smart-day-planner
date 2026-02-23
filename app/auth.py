"""
This module provides cryptographic tools for securing user password
"""
from passlib.context import CryptContext

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