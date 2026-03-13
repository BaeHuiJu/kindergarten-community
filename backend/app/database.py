import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경 변수에서 DATABASE_URL 가져오기
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLite fallback (개발용)
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./kindergarten.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # PostgreSQL (Supabase)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
