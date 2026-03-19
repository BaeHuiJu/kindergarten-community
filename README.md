# 유치원 선생님 커뮤니티 MVP

유치원 선생님들을 위한 커뮤니티 플랫폼입니다.

## 기능

- **JWT 인증 시스템**: 회원가입, 로그인, 로그아웃 + JWT 토큰 기반 인증
- **게시판/댓글 CRUD**: 자유게시판, 교육자료, Q&A 카테고리별 게시글 작성/조회/수정/삭제
- **사용자 프로필**: 근무 지역, 소속 유치원, 담당 반 정보 관리
- **학생 관리**: 유치원/반/학생 직접 등록/삭제 기능
- **엑셀 업로드**: 엑셀 템플릿 다운로드 및 일괄 등록
- **유치원생별 비용 입력**: 교재비, 급식비, 현장학습비 등 비용 기록
- **비용 카테고리 관리**: 유치원별 사용자 정의 카테고리 추가/삭제
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
│   │       ├── auth.py       # 인증 (JWT)
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

### Auth (인증)
- `POST /api/auth/signup` - 회원가입 (JWT 토큰 반환)
- `POST /api/auth/login` - 로그인 (JWT 토큰 반환)
- `GET /api/auth/me` - 현재 로그인된 사용자 정보 조회
- `POST /api/auth/logout` - 로그아웃

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

### Students (학생 관리)
- `GET /api/students/kindergartens/` - 유치원 목록
- `POST /api/students/kindergartens/` - 유치원 등록
- `DELETE /api/students/kindergartens/{id}` - 유치원 삭제
- `GET /api/students/classes/` - 반 목록
- `POST /api/students/classes/` - 반 등록
- `DELETE /api/students/classes/{id}` - 반 삭제
- `GET /api/students/` - 학생 목록
- `POST /api/students/` - 학생 등록
- `DELETE /api/students/{id}` - 학생 삭제
- `GET /api/students/template/download` - 엑셀 템플릿 다운로드
- `POST /api/students/upload/excel` - 엑셀 파일로 일괄 등록

### Expenses (비용 관리)
- `POST /api/expenses/` - 비용 입력
- `GET /api/expenses/` - 비용 목록
- `DELETE /api/expenses/{id}` - 비용 삭제
- `GET /api/expenses/categories/` - 비용 카테고리 목록 (유치원 필터 가능)
- `POST /api/expenses/categories/` - 비용 카테고리 추가
- `DELETE /api/expenses/categories/{id}` - 비용 카테고리 삭제
- `GET /api/expenses/summary/student/{id}` - 학생별 집계
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

✅ 2단계 — 인증 (1일) [완료: 2026-03-19]
   백엔드: auth.py 라우터 + JWT 발급 (python-jose, bcrypt)
   - /api/auth/signup: 회원가입 + JWT 토큰 반환
   - /api/auth/login: 로그인 + JWT 토큰 반환
   - /api/auth/me: 현재 사용자 정보 조회
   - /api/auth/logout: 로그아웃
   프론트: login.html / signup.html + auth.js + auth.css
   - localStorage 기반 토큰 저장
   - 테스트 계정 버튼 (데모용)
   - 인증 필요 페이지 체크 (requireAuth)
   확인: 로그인 → JWT 저장 → /me 호출 성공 ✓

✅ 3단계 — 게시판 (1.5일) [완료: 2026-03-19]
   백엔드: posts.py + comments.py 라우터
   - /api/posts/: 게시글 CRUD (목록, 상세, 작성, 수정, 삭제)
   - /api/posts/category/{category}: 카테고리별 필터
   - /api/posts/search/{keyword}: 검색 기능
   - /api/comments/: 댓글 CRUD
   - /api/comments/post/{post_id}: 게시글별 댓글 조회
   프론트: SPA (Single Page Application) 형태로 index.html에 통합
   - board-page: 게시판 목록 (카테고리 탭: 전체/자유게시판/교육자료/Q&A)
   - post-detail-page: 게시글 상세 + 댓글
   - write-post-page: 글 작성/수정
   - components.js: postCard, postDetail, comment 컴포넌트
   확인: 목록 조회 → 상세 → 작성 → 수정 → 삭제 → 댓글 ✓

✅ 4단계 — 비용 입력 (1.5일) [완료: 2026-03-19]
   백엔드: students.py + expenses.py 라우터
   - /api/students/kindergartens/: 유치원 CRUD
   - /api/students/classes/: 반 CRUD
   - /api/students/: 학생 CRUD
   - /api/expenses/: 비용 CRUD
   - /api/expenses/student/{student_id}: 학생별 비용 조회
   프론트: SPA 형태로 index.html expenses-page에 통합
   - expense-input-tab: 비용 입력 폼 (반→학생 연동 선택)
   - expense-list: 최근 비용 내역
   확인: 유치원→반→학생 선택 → 항목 입력 → 저장 → 내역 조회 ✓

✅ 5단계 — 비용 집계 (1일) [완료: 2026-03-19]
   백엔드: expenses.py에 summary 엔드포인트 포함
   - /api/expenses/summary/class/{class_id}: 반별 집계
   - /api/expenses/summary/kindergarten/{kindergarten_id}: 유치원별 집계
   프론트: expenses-page에 탭 형태로 통합
   - student-summary-tab: 학생별 집계
   - class-summary-tab: 반별 집계
   - kg-summary-tab: 유치원별 집계
   확인: 반별 집계 / 유치원별 집계 ✓

✅ 6단계 — 프로필 (0.5일)
   백엔드: users.py PATCH 엔드포인트
   프론트: profile.html + profile.js
   확인: 내 정보 조회 → 근무지역·기관명 수정

✅ 7단계 — UI 정비 (0.5일)
   모바일 반응형 점검 (max-width: 390px 기준)
   공통 NavBar/BottomNav 동작 확인
   에러 메시지, 로딩 상태 처리

✅ 8단계 — 학생 관리 (1일) [완료: 2026-03-19]
   백엔드: students.py에 관리 기능 추가
   - /api/students/kindergartens/: 유치원 등록/삭제
   - /api/students/classes/: 반 등록/삭제
   - /api/students/: 학생 등록/삭제
   - /api/students/template/download: 엑셀 템플릿 다운로드
   - /api/students/upload/excel: 엑셀 일괄 업로드
   프론트: management-page 추가
   - kindergartens-tab: 유치원 등록/목록/삭제
   - classes-tab: 반 등록/목록/삭제
   - students-tab: 학생 등록/목록/삭제
   - Excel 업로드 모달: 템플릿 다운로드, 파일 업로드
   확인: 유치원/반/학생 등록 → 목록 조회 → 삭제 → 엑셀 업로드 ✓

✅ 9단계 — 비용 카테고리 관리 (0.5일) [완료: 2026-03-19]
   백엔드: models.py + schemas.py + expenses.py
   - ExpenseCategory 모델 추가 (유치원별 카테고리)
   - /api/expenses/categories/: 카테고리 CRUD
   프론트: expenses-page에 카테고리 관리 탭 추가
   - category-manage-tab: 카테고리 추가/목록/삭제
   - 기본 카테고리(교재비, 급식비 등) + 사용자 정의 카테고리 지원
   - 비용 입력 시 동적으로 카테고리 목록 로드
   확인: 카테고리 추가 → 목록 조회 → 비용 입력에서 선택 가능 ✓

예상 총 개발 기간: 약 8.5일 (1인 기준 MVP 완성)
