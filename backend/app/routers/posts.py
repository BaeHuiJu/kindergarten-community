from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.post("/", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
    author = db.query(models.User).filter(models.User.id == post.author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    db_post = models.Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.get("/", response_model=List[schemas.PostWithAuthor])
def get_posts(
    skip: int = 0,
    limit: int = 20,
    category: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Post).options(joinedload(models.Post.author))

    if category:
        query = query.filter(models.Post.category == category)

    posts = query.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts


@router.get("/{post_id}", response_model=schemas.PostWithAuthor)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).options(joinedload(models.Post.author)).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=schemas.Post)
def update_post(post_id: int, post_update: schemas.PostUpdate, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    update_data = post_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}


@router.get("/category/{category}", response_model=List[schemas.PostWithAuthor])
def get_posts_by_category(category: str, db: Session = Depends(get_db)):
    posts = db.query(models.Post).options(
        joinedload(models.Post.author)
    ).filter(models.Post.category == category).order_by(models.Post.created_at.desc()).all()
    return posts


@router.get("/search/{keyword}", response_model=List[schemas.PostWithAuthor])
def search_posts(keyword: str, db: Session = Depends(get_db)):
    posts = db.query(models.Post).options(
        joinedload(models.Post.author)
    ).filter(
        (models.Post.title.contains(keyword)) |
        (models.Post.content.contains(keyword))
    ).order_by(models.Post.created_at.desc()).all()
    return posts
