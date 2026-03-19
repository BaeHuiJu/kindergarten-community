from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(100))
    name = Column(String(50))
    region = Column(String(100))  # 근무 지역
    kindergarten_name = Column(String(100))  # 유치원 이름
    class_name = Column(String(50))  # 담당 반
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    content = Column(Text)
    category = Column(String(50))  # 자유게시판, 교육자료, Q&A 등
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    post_id = Column(Integer, ForeignKey("posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")


class Kindergarten(Base):
    __tablename__ = "kindergartens"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    region = Column(String(100))
    address = Column(String(200))

    classes = relationship("KindergartenClass", back_populates="kindergarten")


class KindergartenClass(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))  # 햇님반, 달님반 등
    kindergarten_id = Column(Integer, ForeignKey("kindergartens.id"))

    kindergarten = relationship("Kindergarten", back_populates="classes")
    students = relationship("Student", back_populates="class_")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    age = Column(Integer)
    class_id = Column(Integer, ForeignKey("classes.id"))

    class_ = relationship("KindergartenClass", back_populates="students")
    expenses = relationship("Expense", back_populates="student", cascade="all, delete-orphan")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    category = Column(String(50))  # 교재비, 급식비, 현장학습비 등
    amount = Column(Float)
    description = Column(String(200))
    date = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="expenses")


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))  # 카테고리명
    kindergarten_id = Column(Integer, ForeignKey("kindergartens.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    kindergarten = relationship("Kindergarten")
