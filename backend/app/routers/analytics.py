from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from ..database import get_db

from ..models.user import User, AcademicRecord

from ..routers.auth import role_required

from ..mongo import activities_collection

from typing import Dict

router = APIRouter()

@router.get("/")
def get_analytics(
    db: Session = Depends(get_db), 
    current_user: User = Depends(role_required("admin"))
):
    # Total students
    total_students = db.query(User).filter(User.role == "student").count()

    # Total activities

    total_activities = activities_collection.count_documents({})

    # Department-wise activities

    department_wise = {}

    activities = list(activities_collection.find({}))

    for activity in activities:

        user = db.query(User).filter(User.id == activity["user_id"]).first()

        if user and user.department:

            department_wise[user.department] = department_wise.get(user.department, 0) + 1

    return {

        "total_students": total_students,

        "total_activities": total_activities,

        "department_wise": department_wise

    }
