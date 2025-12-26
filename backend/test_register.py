import sys
import os

# Add the current directory to sys.path to make app modules importable
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.utils.auth import get_password_hash
from sqlalchemy.exc import IntegrityError

def test_registration():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    email = "test_debug_user@example.com"
    password = "testpassword123"
    full_name = "Debug User"
    role = "student"
    
    print(f"Attempting to register user: {email}")
    
    # Check if exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"User {email} already exists in database. ID: {existing_user.id}")
        # clean up for test
        db.delete(existing_user)
        db.commit()
        print("Deleted existing user for fresh test.")
        
    try:
        hashed_password = get_password_hash(password)
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role=role,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"SUCCESS: User created successfully. ID: {new_user.id}")
        print("Database write confirmed.")
        
    except Exception as e:
        print(f"FAILURE: Could not create user. Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_registration()
