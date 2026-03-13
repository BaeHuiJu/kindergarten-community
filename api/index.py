from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import os

# Database setup
Base = declarative_base()
engine = None
SessionLocal = None

def get_engine():
    global engine, SessionLocal
    if engine is None:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            DATABASE_URL = "sqlite:///./kindergarten.db"
            engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        else:
            # Strip whitespace/newlines from URL
            DATABASE_URL = DATABASE_URL.strip()
            engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)
    return engine


# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    name = Column(String(100))
    region = Column(String(100))
    kindergarten_name = Column(String(200))
    class_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)


class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    content = Column(Text)
    category = Column(String(50))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    post_id = Column(Integer, ForeignKey("posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)


class Kindergarten(Base):
    __tablename__ = "kindergartens"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200))
    region = Column(String(100))
    address = Column(String(300))


class Class(Base):
    __tablename__ = "classes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    kindergarten_id = Column(Integer, ForeignKey("kindergartens.id"))
    teacher_name = Column(String(100))


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    age = Column(Integer)
    class_id = Column(Integer, ForeignKey("classes.id"))
    parent_name = Column(String(100))
    parent_phone = Column(String(20))


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    category = Column(String(50))
    amount = Column(Float)
    description = Column(String(300))
    date = Column(DateTime, default=datetime.utcnow)


# Dependency
def get_db():
    get_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic Schemas
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    name: str
    region: str
    kindergarten_name: str
    class_name: str
    created_at: datetime
    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    author_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str
    content: str
    category: str
    author_id: int


class CommentResponse(BaseModel):
    id: int
    content: str
    post_id: int
    author_id: int
    created_at: datetime
    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    post_id: int
    author_id: int


class KindergartenResponse(BaseModel):
    id: int
    name: str
    region: str
    address: Optional[str] = None
    class Config:
        from_attributes = True


class ClassResponse(BaseModel):
    id: int
    name: str
    kindergarten_id: int
    teacher_name: Optional[str] = None
    class Config:
        from_attributes = True


class StudentResponse(BaseModel):
    id: int
    name: str
    age: int
    class_id: int
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    class Config:
        from_attributes = True


class ExpenseResponse(BaseModel):
    id: int
    student_id: int
    category: str
    amount: float
    description: Optional[str] = None
    date: datetime
    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    student_id: int
    category: str
    amount: float
    description: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


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


# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "kindergarten-community-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except:
        return plain_password == hashed_password


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return user
    except:
        pass
    raise HTTPException(status_code=401, detail="Invalid credentials")


# FastAPI App
app = FastAPI(title="Kindergarten Community API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def root():
    return {"message": "Kindergarten Community API"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.post("/api/auth/signup", response_model=Token)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == req.username) | (User.email == req.email)).first():
        raise HTTPException(status_code=400, detail="User already exists")
    user = User(username=req.username, email=req.email, password=get_password_hash(req.password),
                name=req.name, region=req.region, kindergarten_name=req.kindergarten_name, class_name=req.class_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@app.post("/api/auth/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user


@app.get("/api/users/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/api/posts/", response_model=List[PostResponse])
def get_posts(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Post)
    if category:
        q = q.filter(Post.category == category)
    return q.order_by(Post.created_at.desc()).all()


@app.get("/api/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@app.post("/api/posts/", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    db_post = Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        db.delete(post)
        db.commit()
    return {"message": "Deleted"}


@app.get("/api/comments/post/{post_id}", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    return db.query(Comment).filter(Comment.post_id == post_id).all()


@app.post("/api/comments/", response_model=CommentResponse)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    db_comment = Comment(**comment.model_dump())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment:
        db.delete(comment)
        db.commit()
    return {"message": "Deleted"}


@app.get("/api/students/kindergartens/", response_model=List[KindergartenResponse])
def get_kindergartens(db: Session = Depends(get_db)):
    return db.query(Kindergarten).all()


@app.get("/api/students/classes/", response_model=List[ClassResponse])
def get_classes(kindergarten_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Class)
    if kindergarten_id:
        q = q.filter(Class.kindergarten_id == kindergarten_id)
    return q.all()


@app.get("/api/students/", response_model=List[StudentResponse])
def get_students(class_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Student)
    if class_id:
        q = q.filter(Student.class_id == class_id)
    return q.all()


@app.get("/api/expenses/", response_model=List[ExpenseResponse])
def get_expenses(student_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(Expense)
    if student_id:
        q = q.filter(Expense.student_id == student_id)
    return q.order_by(Expense.date.desc()).all()


@app.post("/api/expenses/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense:
        db.delete(expense)
        db.commit()
    return {"message": "Deleted"}


@app.get("/api/expenses/summary/class/{class_id}")
def get_class_summary(class_id: int, db: Session = Depends(get_db)):
    students = db.query(Student).filter(Student.class_id == class_id).all()
    expenses = db.query(Expense).filter(Expense.student_id.in_([s.id for s in students])).all()
    by_cat = {}
    for e in expenses:
        by_cat[e.category] = by_cat.get(e.category, 0) + e.amount
    return {"class_id": class_id, "total": sum(e.amount for e in expenses), "by_category": by_cat}


@app.get("/api/expenses/summary/kindergarten/{kg_id}")
def get_kg_summary(kg_id: int, db: Session = Depends(get_db)):
    classes = db.query(Class).filter(Class.kindergarten_id == kg_id).all()
    students = db.query(Student).filter(Student.class_id.in_([c.id for c in classes])).all()
    expenses = db.query(Expense).filter(Expense.student_id.in_([s.id for s in students])).all()
    by_cat = {}
    for e in expenses:
        by_cat[e.category] = by_cat.get(e.category, 0) + e.amount
    return {"kindergarten_id": kg_id, "total": sum(e.amount for e in expenses), "by_category": by_cat}
