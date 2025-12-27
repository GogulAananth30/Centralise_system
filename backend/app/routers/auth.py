from fastapi import APIRouter, Depends, HTTPException, status

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from ..database import get_db

from ..models.user import User

from ..schemas.user import UserCreate, User as UserSchema, Token, TokenData

from ..utils.auth import verify_password, get_password_hash, create_access_token, verify_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):

    credentials_exception = HTTPException(

        status_code=status.HTTP_401_UNAUTHORIZED,

        detail="Could not validate credentials",

        headers={"WWW-Authenticate": "Bearer"},

    )

    token_data = verify_token(token)

    if token_data is None:

        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.email).first()

    if user is None:

        raise credentials_exception

    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):

    if not current_user.is_active:

        raise HTTPException(status_code=400, detail="Inactive user")

    return current_user

def role_required(required_role: str):

    def role_checker(current_user: User = Depends(get_current_active_user)):

        if current_user.role != required_role:

            raise HTTPException(status_code=403, detail="Not enough permissions")

        return current_user

    return role_checker

@router.post("/register", response_model=UserSchema)

def register(user: UserCreate, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if db_user:

        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)

    db_user = User(

        email=user.email,

        hashed_password=hashed_password,

        full_name=user.full_name,

        role=user.role,

        department=user.department,

        year=user.year

    )

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user

@router.post("/token", response_model=Token)

def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):

        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

from ..schemas.user import UserUpdate

@router.put("/profile", response_model=UserSchema)
def update_profile(
    profile_update: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
