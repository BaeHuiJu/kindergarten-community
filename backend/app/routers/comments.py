from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/comments", tags=["comments"])


@router.post("/", response_model=schemas.Comment)
def create_comment(comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == comment.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    author = db.query(models.User).filter(models.User.id == comment.author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    db_comment = models.Comment(**comment.model_dump())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.get("/post/{post_id}", response_model=List[schemas.CommentWithAuthor])
def get_comments_by_post(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).options(
        joinedload(models.Comment.author)
    ).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.asc()).all()
    return comments


@router.get("/{comment_id}", response_model=schemas.CommentWithAuthor)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).options(
        joinedload(models.Comment.author)
    ).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.put("/{comment_id}", response_model=schemas.Comment)
def update_comment(comment_id: int, comment_update: schemas.CommentUpdate, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment.content = comment_update.content
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}
