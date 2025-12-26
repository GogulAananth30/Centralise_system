from pydantic import BaseModel

from typing import List, Optional

from datetime import datetime

class ActivityBase(BaseModel):

    category: str

    title: str

    description: str

    duration: str

    skills_gained: List[str]

    proof_url: Optional[str] = None

class ActivityCreate(ActivityBase):

    pass

class Activity(ActivityBase):

    id: str

    user_id: int

    status: str

    created_at: datetime

    approved_at: Optional[datetime] = None

    faculty_id: Optional[int] = None