from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, users, posts, comments, students, expenses

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="유치원 선생님 커뮤니티 API",
    description="유치원 선생님들을 위한 커뮤니티 플랫폼 MVP",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(students.router)
app.include_router(expenses.router)


@app.get("/")
def root():
    return {
        "message": "유치원 선생님 커뮤니티 API에 오신 것을 환영합니다!",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
