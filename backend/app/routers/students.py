from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/students", tags=["students"])


@router.post("/kindergartens/", response_model=schemas.Kindergarten)
def create_kindergarten(kindergarten: schemas.KindergartenCreate, db: Session = Depends(get_db)):
    db_kindergarten = models.Kindergarten(**kindergarten.model_dump())
    db.add(db_kindergarten)
    db.commit()
    db.refresh(db_kindergarten)
    return db_kindergarten


@router.get("/kindergartens/", response_model=List[schemas.Kindergarten])
def get_kindergartens(db: Session = Depends(get_db)):
    return db.query(models.Kindergarten).all()


@router.get("/kindergartens/{kindergarten_id}", response_model=schemas.Kindergarten)
def get_kindergarten(kindergarten_id: int, db: Session = Depends(get_db)):
    kindergarten = db.query(models.Kindergarten).filter(models.Kindergarten.id == kindergarten_id).first()
    if not kindergarten:
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    return kindergarten


@router.post("/classes/", response_model=schemas.KindergartenClass)
def create_class(class_data: schemas.ClassCreate, db: Session = Depends(get_db)):
    kindergarten = db.query(models.Kindergarten).filter(
        models.Kindergarten.id == class_data.kindergarten_id
    ).first()
    if not kindergarten:
        raise HTTPException(status_code=404, detail="Kindergarten not found")

    db_class = models.KindergartenClass(**class_data.model_dump())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


@router.get("/classes/", response_model=List[schemas.KindergartenClass])
def get_classes(kindergarten_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.KindergartenClass)
    if kindergarten_id:
        query = query.filter(models.KindergartenClass.kindergarten_id == kindergarten_id)
    return query.all()


@router.get("/classes/{class_id}", response_model=schemas.KindergartenClass)
def get_class(class_id: int, db: Session = Depends(get_db)):
    class_ = db.query(models.KindergartenClass).filter(models.KindergartenClass.id == class_id).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_


@router.post("/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    class_ = db.query(models.KindergartenClass).filter(
        models.KindergartenClass.id == student.class_id
    ).first()
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")

    db_student = models.Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.get("/", response_model=List[schemas.Student])
def get_students(class_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Student)
    if class_id:
        query = query.filter(models.Student.class_id == class_id)
    return query.all()


@router.get("/{student_id}", response_model=schemas.Student)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student_update: schemas.StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
