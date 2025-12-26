from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()

print(f"Total Users: {len(users)}")
for user in users:
    print(f"ID: {user.id}, Email: {user.email}, Role: {user.role}")
