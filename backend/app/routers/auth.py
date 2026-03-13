from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import bcrypt
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional
from .. import models, schemas
from ..database import get_db

# JWT 설정
SECRET_KEY = "kindergarten-community-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24시간

# OAuth2 설정
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["auth"])


# Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: schemas.User


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    name: str
    region: str
    kindergarten_name: str
    class_name: str


# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # bcrypt는 72바이트 제한이 있음
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def get_password_hash(password: str) -> str:
    # bcrypt는 72바이트 제한이 있음
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# Routes
@router.post("/signup", response_model=Token)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    # 중복 체크
    existing_user = db.query(models.User).filter(
        (models.User.username == request.username) |
        (models.User.email == request.email)
    ).first()

    if existing_user:
        if existing_user.username == request.username:
            raise HTTPException(status_code=400, detail="Username already exists")
        raise HTTPException(status_code=400, detail="Email already exists")

    # 새 사용자 생성
    hashed_password = get_password_hash(request.password)
    db_user = models.User(
        username=request.username,
        email=request.email,
        password=hashed_password,
        name=request.name,
        region=request.region,
        kindergarten_name=request.kindergarten_name,
        class_name=request.class_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=schemas.User.model_validate(db_user)
    )


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # 사용자 찾기
    user = db.query(models.User).filter(models.User.username == request.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # 비밀번호 확인 (해시된 비밀번호 또는 평문 비밀번호 모두 지원 - 더미 데이터용)
    password_valid = False
    try:
        password_valid = verify_password(request.password, user.password)
    except Exception:
        # 해시되지 않은 평문 비밀번호인 경우 (더미 데이터)
        password_valid = (request.password == user.password)

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=schemas.User.model_validate(user)
    )


@router.get("/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout():
    # JWT는 서버에서 무효화할 수 없으므로, 클라이언트에서 토큰을 삭제하도록 안내
    return {"message": "Logged out successfully. Please remove the token from client."}
