from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float

from sqlalchemy.sql import func

from ..database import Base

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True)

    hashed_password = Column(String)

    full_name = Column(String)

    role = Column(String)  # student, faculty, admin

    department = Column(String, nullable=True)

    year = Column(String, nullable=True)  # for students

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AcademicRecord(Base):

    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    semester = Column(String)

    gpa = Column(Float)

    credits_earned = Column(Integer)

    total_credits = Column(Integer)