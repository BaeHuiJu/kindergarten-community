from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.post("/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == expense.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db_expense = models.Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.get("/", response_model=List[schemas.Expense])
def get_expenses(student_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Expense)
    if student_id:
        query = query.filter(models.Expense.student_id == student_id)
    return query.order_by(models.Expense.date.desc()).all()


@router.get("/{expense_id}", response_model=schemas.Expense)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=schemas.Expense)
def update_expense(expense_id: int, expense_update: schemas.ExpenseUpdate, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)

    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


@router.get("/student/{student_id}", response_model=List[schemas.Expense])
def get_expenses_by_student(student_id: int, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).filter(
        models.Expense.student_id == student_id
    ).order_by(models.Expense.date.desc()).all()
    return expenses


@router.get("/summary/class/{class_id}", response_model=schemas.ClassExpenseSummary)
def get_class_expense_summary(class_id: int, db: Session = Depends(get_db)):
    class_ = db.query(models.KindergartenClass).filter(
        models.KindergartenClass.id == class_id
    ).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")

    students = db.query(models.Student).filter(models.Student.class_id == class_id).all()
    student_ids = [s.id for s in students]

    total_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.student_id.in_(student_ids)
    ).scalar() or 0

    category_expenses = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount)
    ).filter(
        models.Expense.student_id.in_(student_ids)
    ).group_by(models.Expense.category).all()

    expenses_by_category = {cat: amount for cat, amount in category_expenses}

    return schemas.ClassExpenseSummary(
        class_id=class_id,
        class_name=class_.name,
        total_students=len(students),
        total_expenses=total_expenses,
        expenses_by_category=expenses_by_category
    )


@router.get("/summary/kindergarten/{kindergarten_id}", response_model=schemas.KindergartenExpenseSummary)
def get_kindergarten_expense_summary(kindergarten_id: int, db: Session = Depends(get_db)):
    kindergarten = db.query(models.Kindergarten).filter(
        models.Kindergarten.id == kindergarten_id
    ).first()
    if not kindergarten:
        raise HTTPException(status_code=404, detail="Kindergarten not found")

    classes = db.query(models.KindergartenClass).filter(
        models.KindergartenClass.kindergarten_id == kindergarten_id
    ).all()
    class_ids = [c.id for c in classes]

    students = db.query(models.Student).filter(
        models.Student.class_id.in_(class_ids)
    ).all()
    student_ids = [s.id for s in students]

    total_expenses = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.student_id.in_(student_ids)
    ).scalar() or 0

    category_expenses = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount)
    ).filter(
        models.Expense.student_id.in_(student_ids)
    ).group_by(models.Expense.category).all()

    expenses_by_category = {cat: amount for cat, amount in category_expenses}

    return schemas.KindergartenExpenseSummary(
        kindergarten_id=kindergarten_id,
        kindergarten_name=kindergarten.name,
        total_classes=len(classes),
        total_students=len(students),
        total_expenses=total_expenses,
        expenses_by_category=expenses_by_category
    )
