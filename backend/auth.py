"""
JWT Authentication
"""
import os
import bcrypt
import jwt
from fastapi import HTTPException

SECRET = os.getenv("JWT_SECRET", "travel_assistant_secret_2024")
ALGO = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(data: dict) -> str:
    return jwt.encode(data.copy(), SECRET, algorithm=ALGO)


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
