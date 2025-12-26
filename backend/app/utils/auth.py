from datetime import datetime, timedelta

from typing import Optional

from jose import JWTError, jwt

from passlib.context import CryptContext

from ..config import settings

from ..schemas.user import TokenData

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password, hashed_password):

    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):

    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):

    to_encode = data.copy()

    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

    return encoded_jwt

def verify_token(token: str):

    try:

        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])

        email: str = payload.get("sub")

        role: str = payload.get("role")

        if email is None:

            return None

        return TokenData(email=email, role=role)

    except JWTError:

        return None
