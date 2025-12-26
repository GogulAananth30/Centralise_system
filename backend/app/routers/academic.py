from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from ..database import get_db

from ..models.user import User, AcademicRecord

from ..routers.auth import get_current_active_user, role_required

from typing import List

from ..schemas.user import AcademicRecord as AcademicRecordSchema

router = APIRouter()

@router.get("/academic-records/", response_model=List[AcademicRecordSchema])

def get_academic_records(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):

    records = db.query(AcademicRecord).filter(AcademicRecord.user_id == current_user.id).all()

    return records

@router.post("/academic-records/", response_model=AcademicRecordSchema)

def create_academic_record(record: AcademicRecordSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):

    db_record = AcademicRecord(**record.dict(), user_id=current_user.id)

    db.add(db_record)

    db.commit()

    db.refresh(db_record)

    return db_record

@router.get("/students/", response_model=List[dict])

def get_students(db: Session = Depends(get_db), current_user: User = Depends(role_required("faculty"))):
    if not current_user.department:
        # If faculty has no department set, maybe return all? or none? 
        # Safer to return none or all matching "General"
        # For now, let's assume strict matching. If faculty has no dept, they see nothing (or maybe valid logic is optional).
        # Let's assume strict department matching.
        return []

    query = db.query(User).filter(
        User.role == "student", 
        User.department == current_user.department
    )

    # 2. Filter by Year (if Faculty is assigned to a specific year)
    if current_user.year:
        query = query.filter(User.year == current_user.year)

    students = query.all()

    return [{"id": s.id, "full_name": s.full_name, "email": s.email, "department": s.department} for s in students]

@router.post("/student/{student_id}/record", response_model=AcademicRecordSchema)
def add_student_academic_record(
    student_id: int, 
    record: AcademicRecordSchema, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(role_required("faculty"))
):
    # Verify student exists
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Optional: Verify faculty department matches student department (for security)
    if current_user.department and current_user.department != student.department:
        raise HTTPException(status_code=403, detail="Faculty can only update records for their department")

    db_record = AcademicRecord(**record.dict(), user_id=student_id)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record
