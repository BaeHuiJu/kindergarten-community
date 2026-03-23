# 베베클럽 MVP

유치원 선생님들을 위한 커뮤니티 플랫폼입니다.

**배포 URL:** https://kindergarten-community.vercel.app

## 주요 기능

### 인증 시스템
- JWT 토큰 기반 회원가입/로그인
- 비로그인 사용자 로그인 페이지 자동 리다이렉트
- 테스트 계정 제공 (test_user1 / test123)

### 게시판
- 카테고리별 게시글 (자유게시판, 교육자료, Q&A)
- 게시글 작성/조회/수정/삭제
- 댓글 작성/삭제

### 학생 관리
- 유치원/반/학생 등록 및 삭제
- 엑셀 템플릿 다운로드
- 엑셀 파일 일괄 업로드

### 비용 관리
- 학생별 비용 입력 (교재비, 급식비, 현장학습비 등)
- 유치원별 사용자 정의 카테고리 관리
- 학생별/반별/유치원별 비용 집계
- 엑셀 다운로드 기능

### 프로필
- 내 정보 조회 및 수정
- 소속 유치원/담당 반 변경
- 토스 스타일 UI

### UI/UX
- 따뜻한 유치원 테마 색상 (브라운/베이지/크림)
- 모바일 반응형 디자인 (480px, 768px 브레이크포인트)
- 터치 친화적 인터페이스

## 기술 스택

### Backend
- Python 3.9+
- FastAPI
- SQLAlchemy + PostgreSQL (Vercel Postgres)
- JWT 인증 (python-jose, bcrypt)

### Frontend
- HTML5 / CSS3
- Vanilla JavaScript (SPA 구조)
- SheetJS (엑셀 처리)

### 배포
- Vercel (Serverless Functions + Static Hosting)
- Vercel Postgres

## 프로젝트 구조

```
kindergarten-community/
├── api/
│   └── index.py              # FastAPI 앱 (Vercel Serverless)
├── frontend/
│   ├── index.html            # 메인 SPA
│   ├── login.html            # 로그인 페이지
│   ├── signup.html           # 회원가입 페이지
│   ├── css/
│   │   ├── style.css         # 메인 스타일 (반응형 포함)
│   │   └── auth.css          # 인증 페이지 스타일
│   └── js/
│       ├── api.js            # API 호출 함수
│       ├── auth.js           # 인증 관련 함수
│       ├── components.js     # UI 컴포넌트
│       └── app.js            # 메인 앱 로직
├── docs/
│   └── COLOR_GUIDE.md        # 색상 가이드 문서
├── vercel.json               # Vercel 배포 설정
└── README.md
```

## 로컬 개발 환경

### 1. 필수 요구사항
- Python 3.9 이상
- pip (Python 패키지 관리자)

### 2. 백엔드 실행

```bash
cd kindergarten-community

# 가상환경 생성 및 활성화
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 패키지 설치
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose bcrypt python-multipart openpyxl

# 서버 실행 (로컬)
uvicorn api.index:app --reload --port 8888
```

### 3. 프론트엔드 실행

```bash
cd frontend
python -m http.server 3000
```

브라우저에서 http://localhost:3000 접속

## API 엔드포인트

### Auth (인증)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/login | 로그인 |
| GET | /api/auth/me | 현재 사용자 조회 |

### Users
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/users/ | 사용자 목록 (all=true: 전체) |
| GET | /api/users/{id} | 사용자 상세 |
| PUT | /api/users/{id} | 사용자 수정 |

### Posts
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/posts/ | 게시글 목록 |
| POST | /api/posts/ | 게시글 작성 |
| GET | /api/posts/{id} | 게시글 상세 |
| PUT | /api/posts/{id} | 게시글 수정 |
| DELETE | /api/posts/{id} | 게시글 삭제 |

### Comments
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/comments/post/{post_id} | 댓글 조회 |
| POST | /api/comments/ | 댓글 작성 |
| DELETE | /api/comments/{id} | 댓글 삭제 |

### Students (학생 관리)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/students/kindergartens/ | 유치원 목록 |
| POST | /api/students/kindergartens/ | 유치원 등록 |
| DELETE | /api/students/kindergartens/{id} | 유치원 삭제 |
| GET | /api/students/classes/ | 반 목록 |
| POST | /api/students/classes/ | 반 등록 |
| DELETE | /api/students/classes/{id} | 반 삭제 |
| GET | /api/students/ | 학생 목록 |
| POST | /api/students/ | 학생 등록 |
| DELETE | /api/students/{id} | 학생 삭제 |
| GET | /api/students/template/download | 엑셀 템플릿 |
| POST | /api/students/upload/excel | 엑셀 업로드 |

### Expenses (비용 관리)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/expenses/ | 비용 목록 |
| POST | /api/expenses/ | 비용 입력 |
| DELETE | /api/expenses/{id} | 비용 삭제 |
| GET | /api/expenses/categories/ | 카테고리 목록 |
| POST | /api/expenses/categories/ | 카테고리 추가 |
| DELETE | /api/expenses/categories/{id} | 카테고리 삭제 |
| GET | /api/expenses/summary/student/{id} | 학생별 집계 |
| GET | /api/expenses/summary/class/{id} | 반별 집계 |
| GET | /api/expenses/summary/kindergarten/{id} | 유치원별 집계 |

## 색상 테마

따뜻한 유치원 컨셉의 색상 팔레트를 사용합니다.

| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | 카라멜 브라운 | #C4915E |
| Primary Dark | 진한 브라운 | #A67C52 |
| Accent | 연한 노랑 | #FFE4B5 |
| Background | 아이보리 | #FFFAF5 |
| Text | 진한 브라운 | #5D4E37 |

자세한 내용은 [COLOR_GUIDE.md](docs/COLOR_GUIDE.md) 참조

## 테스트 계정

| 아이디 | 비밀번호 | 비고 |
|--------|----------|------|
| test_user1 | test123 | 테스트용 |

---

# 개발 완료 현황

| 단계 | 기능 | 상태 | 완료일 |
|------|------|------|--------|
| 1단계 | 환경 세팅 | ✅ 완료 | 2026-03-19 |
| 2단계 | JWT 인증 | ✅ 완료 | 2026-03-19 |
| 3단계 | 게시판/댓글 | ✅ 완료 | 2026-03-19 |
| 4단계 | 비용 입력 | ✅ 완료 | 2026-03-19 |
| 5단계 | 비용 집계 | ✅ 완료 | 2026-03-19 |
| 6단계 | 프로필 | ✅ 완료 | 2026-03-20 |
| 7단계 | UI 정비 (반응형) | ✅ 완료 | 2026-03-23 |
| 8단계 | 학생 관리 | ✅ 완료 | 2026-03-19 |
| 9단계 | 비용 카테고리 | ✅ 완료 | 2026-03-19 |

### 추가 구현 사항 (2026-03-20 ~ 2026-03-23)
- ✅ Vercel 배포 (Serverless + Postgres)
- ✅ 엑셀 다운로드 기능 (비용 내역, 집계)
- ✅ API 캐싱 최적화
- ✅ 따뜻한 유치원 테마 색상 적용
- ✅ 토스 스타일 프로필 UI
- ✅ 모바일 반응형 디자인
- ✅ 로그인 필수 리다이렉트

## 라이선스

MIT License
