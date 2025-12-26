from pydantic import BaseModel, EmailStr

from typing import Optional

from datetime import datetime

class UserBase(BaseModel):

    email: EmailStr

    full_name: str

    role: str

    department: Optional[str] = None

    year: Optional[str] = None

class UserCreate(UserBase):

    password: str

class User(UserBase):

    id: int

    is_active: bool

    created_at: datetime

    class Config:

        from_attributes = True

class Token(BaseModel):

    access_token: str

    token_type: str

class TokenData(BaseModel):

    email: Optional[str] = None

    role: Optional[str] = None

class AcademicRecord(BaseModel):
    semester: str
    gpa: float
    credits_earned: int
    total_credits: int

    class Config:
        from_attributes = True
