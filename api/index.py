from fastapi import FastAPI, Depends, HTTPException, status, Header
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
    kindergarten_id = Column(Integer, ForeignKey("kindergartens.id"), nullable=True)
    kindergarten_name = Column(String(200))  # 기존 호환성 유지
    class_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)


class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    content = Column(Text)
    category = Column(String(50))
    author_id = Column(Integer, ForeignKey("users.id"))
    kindergarten_id = Column(Integer, ForeignKey("kindergartens.id"), nullable=True)
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


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    kindergarten_id = Column(Integer, ForeignKey("kindergartens.id"))
    created_at = Column(DateTime, default=datetime.utcnow)


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
    kindergarten_id: Optional[int] = None
    kindergarten_name: Optional[str] = None
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
    kindergarten_id: Optional[int] = None
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
    region: Optional[str] = None
    address: Optional[str] = None
    class Config:
        from_attributes = True


class KindergartenCreate(BaseModel):
    name: str
    region: Optional[str] = None
    address: Optional[str] = None


class ClassResponse(BaseModel):
    id: int
    name: str
    kindergarten_id: int
    teacher_name: Optional[str] = None
    class Config:
        from_attributes = True


class ClassCreate(BaseModel):
    name: str
    teacher_name: Optional[str] = None


class StudentResponse(BaseModel):
    id: int
    name: str
    age: int
    class_id: int
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    class Config:
        from_attributes = True


class StudentCreate(BaseModel):
    name: str
    age: int
    class_id: int
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None


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


class ExpenseCategoryResponse(BaseModel):
    id: int
    name: str
    kindergarten_id: int
    created_at: datetime
    class Config:
        from_attributes = True


class ExpenseCategoryCreate(BaseModel):
    name: str
    kindergarten_id: int


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
    kindergarten_id: Optional[int] = None
    kindergarten_name: Optional[str] = None
    class_name: str


# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "kindergarten-community-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


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
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return user
    except:
        pass
    raise HTTPException(status_code=401, detail="Invalid credentials")


def get_optional_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Optional authentication - returns None if not authenticated"""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except:
        return None


def verify_kindergarten_access(user: User, kindergarten_id: int):
    """Verify user has access to the specified kindergarten"""
    if user.kindergarten_id != kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied: You don't have permission to access this kindergarten's data")


def get_user_class_ids(db: Session, user: User) -> List[int]:
    """Get all class IDs belonging to user's kindergarten"""
    if not user.kindergarten_id:
        return []
    classes = db.query(Class).filter(Class.kindergarten_id == user.kindergarten_id).all()
    return [c.id for c in classes]


def get_user_student_ids(db: Session, user: User) -> List[int]:
    """Get all student IDs belonging to user's kindergarten"""
    class_ids = get_user_class_ids(db, user)
    if not class_ids:
        return []
    students = db.query(Student).filter(Student.class_id.in_(class_ids)).all()
    return [s.id for s in students]


# FastAPI App
app = FastAPI(title="Kindergarten Community API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def root():
    return {"message": "Kindergarten Community API"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/migrate")
def migrate(db: Session = Depends(get_db)):
    """Run database migrations to add missing columns"""
    from sqlalchemy import text
    migrations = []

    # Check and add kindergarten_id to users table
    try:
        db.execute(text("SELECT kindergarten_id FROM users LIMIT 1"))
        db.commit()
    except Exception as e:
        db.rollback()
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN kindergarten_id INTEGER REFERENCES kindergartens(id)"))
            db.commit()
            migrations.append("Added kindergarten_id to users")
        except Exception as e2:
            db.rollback()
            migrations.append(f"users.kindergarten_id error: {str(e2)}")

    # Check and add kindergarten_id to posts table
    try:
        db.execute(text("SELECT kindergarten_id FROM posts LIMIT 1"))
        db.commit()
    except Exception as e:
        db.rollback()
        try:
            db.execute(text("ALTER TABLE posts ADD COLUMN kindergarten_id INTEGER REFERENCES kindergartens(id)"))
            db.commit()
            migrations.append("Added kindergarten_id to posts")
        except Exception as e2:
            db.rollback()
            migrations.append(f"posts.kindergarten_id error: {str(e2)}")

    # Create classes table if not exists
    try:
        db.execute(text("SELECT id FROM classes LIMIT 1"))
        db.commit()
    except Exception as e:
        db.rollback()
        try:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS classes (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    kindergarten_id INTEGER REFERENCES kindergartens(id),
                    teacher_name VARCHAR(100)
                )
            """))
            db.commit()
            migrations.append("Created classes table")
        except Exception as e2:
            db.rollback()
            migrations.append(f"classes table error: {str(e2)}")

    # Create students table if not exists
    try:
        db.execute(text("SELECT id FROM students LIMIT 1"))
        db.commit()
    except Exception as e:
        db.rollback()
        try:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS students (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    age INTEGER,
                    class_id INTEGER REFERENCES classes(id),
                    parent_name VARCHAR(100),
                    parent_phone VARCHAR(20)
                )
            """))
            db.commit()
            migrations.append("Created students table")
        except Exception as e2:
            db.rollback()
            migrations.append(f"students table error: {str(e2)}")

    # Create expenses table if not exists
    try:
        db.execute(text("SELECT id FROM expenses LIMIT 1"))
        db.commit()
    except Exception as e:
        db.rollback()
        try:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS expenses (
                    id SERIAL PRIMARY KEY,
                    student_id INTEGER REFERENCES students(id),
                    category VARCHAR(50),
                    amount FLOAT,
                    description VARCHAR(300),
                    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            db.commit()
            migrations.append("Created expenses table")
        except Exception as e2:
            db.rollback()
            migrations.append(f"expenses table error: {str(e2)}")

    # Create expense_categories table if not exists
    try:
        db.execute(text("SELECT id FROM expense_categories LIMIT 1"))
        db.commit()
    except Exception as e:
        db.rollback()
        try:
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS expense_categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    kindergarten_id INTEGER REFERENCES kindergartens(id),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            db.commit()
            migrations.append("Created expense_categories table")
        except Exception as e2:
            db.rollback()
            migrations.append(f"expense_categories table error: {str(e2)}")

    return {"status": "success", "migrations": migrations}


# ==================== AUTH ====================

@app.post("/api/auth/signup", response_model=Token)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username == req.username) | (User.email == req.email)).first():
        raise HTTPException(status_code=400, detail="User already exists")

    kindergarten_id = req.kindergarten_id
    kindergarten_name = req.kindergarten_name

    # If kindergarten_id is provided, verify it exists
    if kindergarten_id:
        kg = db.query(Kindergarten).filter(Kindergarten.id == kindergarten_id).first()
        if not kg:
            raise HTTPException(status_code=400, detail="Kindergarten not found")
        kindergarten_name = kg.name
    # If only kindergarten_name is provided, create new kindergarten
    elif kindergarten_name:
        # Check if kindergarten with same name exists
        existing_kg = db.query(Kindergarten).filter(Kindergarten.name == kindergarten_name).first()
        if existing_kg:
            kindergarten_id = existing_kg.id
        else:
            new_kg = Kindergarten(name=kindergarten_name, region=req.region)
            db.add(new_kg)
            db.commit()
            db.refresh(new_kg)
            kindergarten_id = new_kg.id

    user = User(
        username=req.username,
        email=req.email,
        password=get_password_hash(req.password),
        name=req.name,
        region=req.region,
        kindergarten_id=kindergarten_id,
        kindergarten_name=kindergarten_name,
        class_name=req.class_name
    )
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


# ==================== USERS ====================

@app.get("/api/users/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), user: User = Depends(get_optional_user)):
    # Filter by kindergarten if user is logged in
    if user and user.kindergarten_id:
        return db.query(User).filter(User.kindergarten_id == user.kindergarten_id).all()
    return db.query(User).all()


@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


class UserUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    kindergarten_name: Optional[str] = None
    class_name: Optional[str] = None


@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


# ==================== POSTS ====================

@app.get("/api/posts/", response_model=List[PostResponse])
def get_posts(category: Optional[str] = None, db: Session = Depends(get_db), user: User = Depends(get_optional_user)):
    q = db.query(Post)
    # Filter by kindergarten if user is logged in
    if user and user.kindergarten_id:
        q = q.filter((Post.kindergarten_id == user.kindergarten_id) | (Post.kindergarten_id == None))
    if category:
        q = q.filter(Post.category == category)
    return q.order_by(Post.created_at.desc()).all()


@app.get("/api/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db), user: User = Depends(get_optional_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Check access for kindergarten-specific posts
    if post.kindergarten_id and user and user.kindergarten_id != post.kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return post


@app.post("/api/posts/", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db_post = Post(
        title=post.title,
        content=post.content,
        category=post.category,
        author_id=user.id,
        kindergarten_id=user.kindergarten_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.put("/api/posts/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post: PostCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_post.title = post.title
    db_post.content = post.content
    db_post.category = post.category
    db.commit()
    db.refresh(db_post)
    return db_post


@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        if post.author_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        db.delete(post)
        db.commit()
    return {"message": "Deleted"}


# ==================== COMMENTS ====================

@app.get("/api/comments/post/{post_id}", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    return db.query(Comment).filter(Comment.post_id == post_id).all()


@app.post("/api/comments/", response_model=CommentResponse)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db_comment = Comment(
        content=comment.content,
        post_id=comment.post_id,
        author_id=user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment:
        if comment.author_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        db.delete(comment)
        db.commit()
    return {"message": "Deleted"}


# ==================== KINDERGARTENS ====================

@app.get("/api/students/kindergartens/", response_model=List[KindergartenResponse])
def get_kindergartens(db: Session = Depends(get_db)):
    """Get all kindergartens (for signup/selection)"""
    return db.query(Kindergarten).all()


@app.post("/api/students/kindergartens/", response_model=KindergartenResponse)
def create_kindergarten_via_students(kg: KindergartenCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create a new kindergarten (via /students/ path)"""
    db_kg = Kindergarten(name=kg.name, region=kg.region, address=kg.address)
    db.add(db_kg)
    db.commit()
    db.refresh(db_kg)
    return db_kg


@app.delete("/api/students/kindergartens/{kg_id}")
def delete_kindergarten(kg_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete a kindergarten"""
    kg = db.query(Kindergarten).filter(Kindergarten.id == kg_id).first()
    if not kg:
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    db.delete(kg)
    db.commit()
    return {"message": "Deleted"}


@app.get("/api/kindergartens/my", response_model=KindergartenResponse)
def get_my_kindergarten(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get current user's kindergarten"""
    if not user.kindergarten_id:
        raise HTTPException(status_code=404, detail="No kindergarten assigned")
    kg = db.query(Kindergarten).filter(Kindergarten.id == user.kindergarten_id).first()
    if not kg:
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    return kg


@app.post("/api/kindergartens/", response_model=KindergartenResponse)
def create_kindergarten(kg: KindergartenCreate, db: Session = Depends(get_db)):
    """Create a new kindergarten"""
    db_kg = Kindergarten(name=kg.name, region=kg.region, address=kg.address)
    db.add(db_kg)
    db.commit()
    db.refresh(db_kg)
    return db_kg


# ==================== CLASSES (Kindergarten-scoped) ====================

@app.get("/api/students/classes/", response_model=List[ClassResponse])
def get_classes(kindergarten_id: Optional[int] = None, db: Session = Depends(get_db), user: User = Depends(get_optional_user)):
    """Get classes - filtered by user's kindergarten when logged in"""
    q = db.query(Class)

    # If logged in, force filter by user's kindergarten
    if user and user.kindergarten_id:
        q = q.filter(Class.kindergarten_id == user.kindergarten_id)
    elif kindergarten_id:
        q = q.filter(Class.kindergarten_id == kindergarten_id)

    return q.all()


@app.post("/api/students/classes/", response_model=ClassResponse)
def create_class_via_students(cls: ClassCreate, kindergarten_id: Optional[int] = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create a new class (via /students/ path)"""
    kg_id = kindergarten_id or user.kindergarten_id
    if not kg_id:
        raise HTTPException(status_code=400, detail="Kindergarten ID required")
    db_class = Class(
        name=cls.name,
        kindergarten_id=kg_id,
        teacher_name=cls.teacher_name or user.name
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


@app.delete("/api/students/classes/{class_id}")
def delete_class_via_students(class_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete a class (via /students/ path)"""
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(cls)
    db.commit()
    return {"message": "Deleted"}


@app.get("/api/classes/my", response_model=List[ClassResponse])
def get_my_classes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get classes for current user's kindergarten"""
    if not user.kindergarten_id:
        return []
    return db.query(Class).filter(Class.kindergarten_id == user.kindergarten_id).all()


@app.post("/api/classes/", response_model=ClassResponse)
def create_class(cls: ClassCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create a new class in user's kindergarten"""
    if not user.kindergarten_id:
        raise HTTPException(status_code=400, detail="User has no kindergarten assigned")
    db_class = Class(
        name=cls.name,
        kindergarten_id=user.kindergarten_id,
        teacher_name=cls.teacher_name or user.name
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


@app.delete("/api/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete a class (only if it belongs to user's kindergarten)"""
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if cls.kindergarten_id != user.kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied")
    db.delete(cls)
    db.commit()
    return {"message": "Deleted"}


# ==================== STUDENTS (Kindergarten-scoped) ====================

@app.get("/api/students/", response_model=List[StudentResponse])
def get_students(class_id: Optional[int] = None, db: Session = Depends(get_db), user: User = Depends(get_optional_user)):
    """Get students - filtered by user's kindergarten when logged in"""
    q = db.query(Student)

    if user and user.kindergarten_id:
        # Only show students from user's kindergarten
        class_ids = get_user_class_ids(db, user)
        if not class_ids:
            return []
        q = q.filter(Student.class_id.in_(class_ids))
        if class_id and class_id in class_ids:
            q = q.filter(Student.class_id == class_id)
    elif class_id:
        q = q.filter(Student.class_id == class_id)

    return q.all()


@app.get("/api/students/my", response_model=List[StudentResponse])
def get_my_students(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get all students in user's kindergarten"""
    class_ids = get_user_class_ids(db, user)
    if not class_ids:
        return []
    return db.query(Student).filter(Student.class_id.in_(class_ids)).all()


@app.post("/api/students/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create a new student (must be in user's kindergarten's class)"""
    # Verify class belongs to user's kindergarten
    cls = db.query(Class).filter(Class.id == student.class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if cls.kindergarten_id != user.kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied: Class does not belong to your kindergarten")

    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@app.delete("/api/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete a student (only if it belongs to user's kindergarten)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Verify student belongs to user's kindergarten
    cls = db.query(Class).filter(Class.id == student.class_id).first()
    if not cls or cls.kindergarten_id != user.kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(student)
    db.commit()
    return {"message": "Deleted"}


@app.get("/api/students/template/download")
def download_template():
    """Download Excel template for student upload"""
    from fastapi.responses import Response
    # Simple CSV template (Excel compatible)
    csv_content = "name,age,class_name,parent_name,parent_phone\n김철수,5,햇님반,김부모,010-1234-5678\n이영희,6,달님반,이부모,010-8765-4321\n"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_template.csv"}
    )


@app.post("/api/students/upload/excel")
async def upload_excel(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Upload Excel/CSV file for batch student registration"""
    # Note: File upload handling in Vercel serverless is limited
    # This is a placeholder that returns instructions
    return {
        "message": "Excel upload is not supported in serverless environment. Please use the web form to add students individually.",
        "alternative": "Use POST /api/students/ to add students one by one"
    }


# ==================== EXPENSES (Kindergarten-scoped) ====================

@app.get("/api/expenses/", response_model=List[ExpenseResponse])
def get_expenses(student_id: Optional[int] = None, db: Session = Depends(get_db), user: User = Depends(get_optional_user)):
    """Get expenses - filtered by user's kindergarten when logged in"""
    q = db.query(Expense)

    if user and user.kindergarten_id:
        # Only show expenses for students in user's kindergarten
        student_ids = get_user_student_ids(db, user)
        if not student_ids:
            return []
        q = q.filter(Expense.student_id.in_(student_ids))
        if student_id and student_id in student_ids:
            q = q.filter(Expense.student_id == student_id)
    elif student_id:
        q = q.filter(Expense.student_id == student_id)

    return q.order_by(Expense.date.desc()).all()


@app.get("/api/expenses/my", response_model=List[ExpenseResponse])
def get_my_expenses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get all expenses in user's kindergarten"""
    student_ids = get_user_student_ids(db, user)
    if not student_ids:
        return []
    return db.query(Expense).filter(Expense.student_id.in_(student_ids)).order_by(Expense.date.desc()).all()


@app.post("/api/expenses/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create a new expense (student must be in user's kindergarten)"""
    # Verify student belongs to user's kindergarten
    student = db.query(Student).filter(Student.id == expense.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    cls = db.query(Class).filter(Class.id == student.class_id).first()
    if not cls or cls.kindergarten_id != user.kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied: Student does not belong to your kindergarten")

    db_expense = Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete an expense (only if it belongs to user's kindergarten)"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Verify expense belongs to user's kindergarten
    student_ids = get_user_student_ids(db, user)
    if expense.student_id not in student_ids:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(expense)
    db.commit()
    return {"message": "Deleted"}


# ==================== EXPENSE CATEGORIES ====================

@app.get("/api/expenses/categories/", response_model=List[ExpenseCategoryResponse])
def get_expense_categories(kindergarten_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get expense categories (optionally filtered by kindergarten)"""
    q = db.query(ExpenseCategory)
    if kindergarten_id:
        q = q.filter(ExpenseCategory.kindergarten_id == kindergarten_id)
    return q.all()


@app.post("/api/expenses/categories/", response_model=ExpenseCategoryResponse)
def create_expense_category(category: ExpenseCategoryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create a new expense category"""
    # Check for duplicate
    existing = db.query(ExpenseCategory).filter(
        ExpenseCategory.name == category.name,
        ExpenseCategory.kindergarten_id == category.kindergarten_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists for this kindergarten")

    db_category = ExpenseCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@app.delete("/api/expenses/categories/{category_id}")
def delete_expense_category(category_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Delete an expense category"""
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Deleted"}


# ==================== EXPENSE SUMMARIES (Kindergarten-scoped) ====================

@app.get("/api/expenses/summary/class/{class_id}")
def get_class_summary(class_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get expense summary for a class (must belong to user's kindergarten)"""
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if cls.kindergarten_id != user.kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied")

    students = db.query(Student).filter(Student.class_id == class_id).all()
    student_ids = [s.id for s in students]
    expenses = db.query(Expense).filter(Expense.student_id.in_(student_ids)).all() if student_ids else []
    by_cat = {}
    for e in expenses:
        by_cat[e.category] = by_cat.get(e.category, 0) + e.amount
    return {
        "class_id": class_id,
        "class_name": cls.name,
        "student_count": len(students),
        "total": sum(e.amount for e in expenses),
        "by_category": by_cat
    }


@app.get("/api/expenses/summary/kindergarten/{kg_id}")
def get_kg_summary(kg_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get expense summary for a kindergarten (must be user's kindergarten)"""
    if kg_id != user.kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied")

    kg = db.query(Kindergarten).filter(Kindergarten.id == kg_id).first()
    if not kg:
        raise HTTPException(status_code=404, detail="Kindergarten not found")

    classes = db.query(Class).filter(Class.kindergarten_id == kg_id).all()
    class_ids = [c.id for c in classes]
    students = db.query(Student).filter(Student.class_id.in_(class_ids)).all() if class_ids else []
    student_ids = [s.id for s in students]
    expenses = db.query(Expense).filter(Expense.student_id.in_(student_ids)).all() if student_ids else []
    by_cat = {}
    for e in expenses:
        by_cat[e.category] = by_cat.get(e.category, 0) + e.amount
    return {
        "kindergarten_id": kg_id,
        "kindergarten_name": kg.name,
        "class_count": len(classes),
        "student_count": len(students),
        "total": sum(e.amount for e in expenses),
        "by_category": by_cat
    }


@app.get("/api/expenses/summary/student/{student_id}")
def get_student_summary(student_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get expense summary for a student (must belong to user's kindergarten)"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Verify student belongs to user's kindergarten
    cls = db.query(Class).filter(Class.id == student.class_id).first()
    if not cls or cls.kindergarten_id != user.kindergarten_id:
        raise HTTPException(status_code=403, detail="Access denied")

    expenses = db.query(Expense).filter(Expense.student_id == student_id).all()
    by_cat = {}
    for e in expenses:
        by_cat[e.category] = by_cat.get(e.category, 0) + e.amount
    return {
        "student_id": student_id,
        "student_name": student.name,
        "total": sum(e.amount for e in expenses),
        "expense_count": len(expenses),
        "by_category": by_cat
    }


@app.get("/api/expenses/summary/my")
def get_my_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get expense summary for current user's kindergarten"""
    if not user.kindergarten_id:
        return {"total": 0, "by_category": {}, "class_count": 0, "student_count": 0}
    return get_kg_summary(user.kindergarten_id, db, user)
