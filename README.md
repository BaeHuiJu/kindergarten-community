# 유치원 선생님 커뮤니티 MVP

유치원 선생님들을 위한 커뮤니티 플랫폼입니다.

## 기능

- **게시판/댓글 CRUD**: 자유게시판, 교육자료, Q&A 카테고리별 게시글 작성/조회/수정/삭제
- **사용자 프로필**: 근무 지역, 소속 유치원, 담당 반 정보 관리
- **유치원생별 비용 입력**: 교재비, 급식비, 현장학습비 등 비용 기록
- **반별/유치원별 집계**: 카테고리별 비용 현황 조회
- **더미 데이터**: 테스트용 샘플 데이터 포함

## 기술 스택

### Backend
- Python 3.9+
- FastAPI
- SQLAlchemy (SQLite)
- Pydantic

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

## 프로젝트 구조

```
kindergarten-community/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI 앱 진입점
│   │   ├── models.py        # SQLAlchemy 모델
│   │   ├── database.py      # DB 연결 설정
│   │   ├── schemas.py       # Pydantic 스키마
│   │   └── routers/         # API 라우터
│   │       ├── users.py
│   │       ├── posts.py
│   │       ├── comments.py
│   │       ├── students.py
│   │       └── expenses.py
│   ├── requirements.txt
│   └── seed_data.py         # 더미 데이터 생성
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js           # API 호출 함수
│       ├── components.js    # UI 컴포넌트
│       └── app.js           # 메인 앱 로직
└── README.md
```

## 실행 방법

### 1. 필수 요구사항

- Python 3.9 이상
- pip (Python 패키지 관리자)

### 2. Backend 설정 및 실행

```bash
# 프로젝트 디렉토리로 이동
cd kindergarten-community/backend

# 가상환경 생성 (권장)
python -m venv venv

# 가상환경 활성화
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# 더미 데이터 생성
python seed_data.py

# 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 실행되면 다음 주소에서 API 문서를 확인할 수 있습니다:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Frontend 실행

Backend 서버를 실행한 상태에서, 새 터미널을 열고:

```bash
# frontend 폴더로 이동
cd kindergarten-community/frontend

# 간단한 HTTP 서버 실행 (Python 이용)
python -m http.server 3000
```

브라우저에서 http://localhost:3000 접속

> **참고**: 프론트엔드는 정적 파일이므로 브라우저에서 `index.html`을 직접 열어도 되지만,
> CORS 문제 방지를 위해 HTTP 서버를 사용하는 것을 권장합니다.

## 사용 방법

1. 브라우저에서 http://localhost:3000 접속
2. 우측 상단의 **사용자 선택** 드롭다운에서 사용자 선택
3. 각 메뉴에서 기능 사용:
   - **홈**: 통계 및 최근 게시글 확인
   - **게시판**: 게시글 작성/조회/수정/삭제, 댓글 작성
   - **비용 관리**: 학생별 비용 입력, 반별/유치원별 집계 조회
   - **프로필**: 선택한 사용자 정보 확인

## API 엔드포인트

### Users
- `GET /api/users/` - 전체 사용자 조회
- `POST /api/users/` - 사용자 생성
- `GET /api/users/{id}` - 특정 사용자 조회
- `PUT /api/users/{id}` - 사용자 수정
- `DELETE /api/users/{id}` - 사용자 삭제

### Posts
- `GET /api/posts/` - 게시글 목록 (카테고리 필터 가능)
- `POST /api/posts/` - 게시글 작성
- `GET /api/posts/{id}` - 게시글 상세
- `PUT /api/posts/{id}` - 게시글 수정
- `DELETE /api/posts/{id}` - 게시글 삭제

### Comments
- `GET /api/comments/post/{post_id}` - 게시글 댓글 조회
- `POST /api/comments/` - 댓글 작성
- `DELETE /api/comments/{id}` - 댓글 삭제

### Students & Expenses
- `GET /api/students/kindergartens/` - 유치원 목록
- `GET /api/students/classes/` - 반 목록
- `GET /api/students/` - 학생 목록
- `POST /api/expenses/` - 비용 입력
- `GET /api/expenses/summary/class/{id}` - 반별 집계
- `GET /api/expenses/summary/kindergarten/{id}` - 유치원별 집계

## 더미 데이터

`seed_data.py` 실행 시 생성되는 데이터:

- **사용자**: 5명의 유치원 선생님
- **게시글**: 8개의 샘플 게시글
- **댓글**: 14개의 샘플 댓글
- **유치원**: 3개 (햇살유치원, 꿈나무유치원, 사랑유치원)
- **반**: 6개 (햇님반, 달님반, 별님반 등)
- **학생**: 각 반당 5-8명
- **비용**: 학생당 2-4개의 비용 항목

## 라이선스

MIT License

# 개발 시작순서
✅ 1단계 — 환경 세팅 (0.5일)
   backend/  → pip install, main.py CORS 설정, 서버 실행 확인
   frontend/ → 폴더 구조 생성, Live Server 실행 확인
   api.js   → BASE_URL, apiFetch 기본 함수 작성

✅ 2단계 — 인증 (1일)
   백엔드: auth.py 라우터 + JWT 발급 + users.json 더미
   프론트: login.html / signup.html + auth.js
   확인: 로그인 → JWT 저장 → /me 호출 성공

✅ 3단계 — 게시판 (1.5일)
   백엔드: posts.py + comments.py 라우터 + 더미 JSON
   프론트: board.html + post-detail.html + post-write.html
   확인: 목록 조회 → 상세 → 작성 → 댓글 → 좋아요

✅ 4단계 — 비용 입력 (1.5일)
   백엔드: cost.py 라우터 + 더미 JSON (kindergartens~cost_records)
   프론트: cost-input.html + cost-records.html
   확인: 유치원→반→학생 선택 → 항목 입력 → 저장 → 내역 조회

✅ 5단계 — 비용 집계 (1일)
   백엔드: cost_service.py 집계 로직 + /summary 엔드포인트
   프론트: cost-summary.html + cost-summary.js
   확인: 반별 집계 탭 / 유치원별 집계 탭 / 기간 필터

✅ 6단계 — 프로필 (0.5일)
   백엔드: users.py PATCH 엔드포인트
   프론트: profile.html + profile.js
   확인: 내 정보 조회 → 근무지역·기관명 수정

✅ 7단계 — UI 정비 (0.5일)
   모바일 반응형 점검 (max-width: 390px 기준)
   공통 NavBar/BottomNav 동작 확인
   에러 메시지, 로딩 상태 처리

예상 총 개발 기간: 약 7일 (1인 기준 MVP 완성)
