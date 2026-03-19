from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


# User Schemas
class UserBase(BaseModel):
    username: str
    email: str
    name: str
    region: str
    kindergarten_name: str
    class_name: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    kindergarten_name: Optional[str] = None
    class_name: Optional[str] = None


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Post Schemas
class PostBase(BaseModel):
    title: str
    content: str
    category: str


class PostCreate(PostBase):
    author_id: int


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None


class Post(PostBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostWithAuthor(Post):
    author: User


# Comment Schemas
class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    post_id: int
    author_id: int


class CommentUpdate(BaseModel):
    content: str


class Comment(CommentBase):
    id: int
    post_id: int
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CommentWithAuthor(Comment):
    author: User


# Kindergarten Schemas
class KindergartenBase(BaseModel):
    name: str
    region: str
    address: str


class KindergartenCreate(KindergartenBase):
    pass


class Kindergarten(KindergartenBase):
    id: int

    class Config:
        from_attributes = True


# Class Schemas
class ClassBase(BaseModel):
    name: str
    kindergarten_id: int


class ClassCreate(ClassBase):
    pass


class KindergartenClass(ClassBase):
    id: int

    class Config:
        from_attributes = True


# Student Schemas
class StudentBase(BaseModel):
    name: str
    age: int
    class_id: int


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    class_id: Optional[int] = None


class Student(StudentBase):
    id: int

    class Config:
        from_attributes = True


# Expense Schemas
class ExpenseBase(BaseModel):
    student_id: int
    category: str
    amount: float
    description: str


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None


class Expense(ExpenseBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True


# ExpenseCategory Schemas
class ExpenseCategoryBase(BaseModel):
    name: str
    kindergarten_id: int


class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass


class ExpenseCategory(ExpenseCategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Summary Schemas
class ClassExpenseSummary(BaseModel):
    class_id: int
    class_name: str
    total_students: int
    total_expenses: float
    expenses_by_category: dict


class KindergartenExpenseSummary(BaseModel):
    kindergarten_id: int
    kindergarten_name: str
    total_classes: int
    total_students: int
    total_expenses: float
    expenses_by_category: dict
