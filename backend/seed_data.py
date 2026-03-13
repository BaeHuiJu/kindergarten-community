"""
더미 데이터 생성 스크립트
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import User, Post, Comment, Kindergarten, KindergartenClass, Student, Expense
from datetime import datetime, timedelta
import random

# 테이블 생성
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def clear_data():
    """기존 데이터 삭제"""
    db.query(Expense).delete()
    db.query(Student).delete()
    db.query(KindergartenClass).delete()
    db.query(Kindergarten).delete()
    db.query(Comment).delete()
    db.query(Post).delete()
    db.query(User).delete()
    db.commit()

def create_users():
    """사용자 더미 데이터 생성"""
    users_data = [
        {
            "username": "kim_teacher",
            "email": "kim@kindergarten.com",
            "password": "password123",
            "name": "김민지",
            "region": "서울시 강남구",
            "kindergarten_name": "햇살유치원",
            "class_name": "햇님반"
        },
        {
            "username": "lee_teacher",
            "email": "lee@kindergarten.com",
            "password": "password123",
            "name": "이수연",
            "region": "서울시 서초구",
            "kindergarten_name": "햇살유치원",
            "class_name": "달님반"
        },
        {
            "username": "park_teacher",
            "email": "park@kindergarten.com",
            "password": "password123",
            "name": "박지영",
            "region": "경기도 성남시",
            "kindergarten_name": "꿈나무유치원",
            "class_name": "별님반"
        },
        {
            "username": "choi_teacher",
            "email": "choi@kindergarten.com",
            "password": "password123",
            "name": "최예린",
            "region": "경기도 용인시",
            "kindergarten_name": "꿈나무유치원",
            "class_name": "구름반"
        },
        {
            "username": "jung_teacher",
            "email": "jung@kindergarten.com",
            "password": "password123",
            "name": "정하은",
            "region": "인천시 남동구",
            "kindergarten_name": "사랑유치원",
            "class_name": "무지개반"
        }
    ]

    users = []
    for data in users_data:
        user = User(**data)
        db.add(user)
        users.append(user)

    db.commit()
    for user in users:
        db.refresh(user)

    print(f"[OK] {len(users)}명의 사용자가 생성되었습니다.")
    return users

def create_posts(users):
    """게시글 더미 데이터 생성"""
    posts_data = [
        {
            "title": "새학기 적응 프로그램 공유합니다",
            "content": "안녕하세요! 새학기에 아이들이 빠르게 적응할 수 있도록 진행한 프로그램을 공유합니다.\n\n1. 이름표 만들기 활동\n2. 친구 소개 게임\n3. 교실 탐험 놀이\n\n다들 어떤 활동을 하시나요?",
            "category": "교육자료",
            "author_id": 1
        },
        {
            "title": "간식 알러지 관리 어떻게 하시나요?",
            "content": "저희 반에 땅콩 알러지가 있는 아이가 있는데, 간식 시간 관리가 너무 어렵네요. 다른 선생님들은 어떻게 관리하시는지 궁금합니다.",
            "category": "Q&A",
            "author_id": 2
        },
        {
            "title": "오늘 현장학습 너무 좋았어요!",
            "content": "오늘 아이들과 함께 근처 공원으로 봄 소풍을 다녀왔어요. 날씨도 좋고 아이들도 너무 즐거워했습니다. 사진은 못 올리지만 마음으로 공유해요~",
            "category": "자유게시판",
            "author_id": 3
        },
        {
            "title": "미술 활동 재료 추천해주세요",
            "content": "다음 주에 봄 주제 미술 활동을 계획 중인데, 좋은 재료 추천 부탁드려요. 예산은 반당 5만원 정도입니다.",
            "category": "Q&A",
            "author_id": 4
        },
        {
            "title": "동요 율동 영상 공유",
            "content": "아이들이 정말 좋아하는 동요 율동을 정리해봤어요.\n\n1. 곰 세 마리\n2. 머리 어깨 무릎 발\n3. 상어가족\n4. 아기상어\n\n유튜브에서 찾아보시면 좋은 영상 많아요!",
            "category": "교육자료",
            "author_id": 5
        },
        {
            "title": "학부모 상담 팁 있으신가요?",
            "content": "다음 주부터 학부모 상담 기간인데, 처음이라 너무 떨려요. 경력 있으신 선생님들 팁 좀 부탁드려요!",
            "category": "Q&A",
            "author_id": 1
        },
        {
            "title": "점심시간 편식 지도 방법",
            "content": "편식이 심한 아이가 있어서 고민이에요. 억지로 먹이기도 그렇고... 좋은 방법 있으면 공유해주세요.",
            "category": "자유게시판",
            "author_id": 2
        },
        {
            "title": "교사 연수 후기",
            "content": "지난 주말에 참가한 유아교육 연수가 정말 유익했어요. 놀이중심 교육과정에 대한 새로운 시각을 얻었습니다. 관심 있으시면 연수 정보 공유해드릴게요!",
            "category": "자유게시판",
            "author_id": 3
        }
    ]

    posts = []
    for i, data in enumerate(posts_data):
        post = Post(
            **data,
            created_at=datetime.utcnow() - timedelta(days=len(posts_data)-i)
        )
        db.add(post)
        posts.append(post)

    db.commit()
    for post in posts:
        db.refresh(post)

    print(f"[OK] {len(posts)}개의 게시글이 생성되었습니다.")
    return posts

def create_comments(users, posts):
    """댓글 더미 데이터 생성"""
    comments_data = [
        {"content": "좋은 자료 감사합니다! 저도 써봐야겠어요~", "post_id": 1, "author_id": 2},
        {"content": "저희 반은 이름표 스티커 꾸미기를 했는데 반응이 좋았어요!", "post_id": 1, "author_id": 3},
        {"content": "저희 원에서는 알러지 아이 전용 간식함을 따로 준비해요.", "post_id": 2, "author_id": 4},
        {"content": "학부모님께 매일 간식 메뉴를 미리 공유하는 것도 좋은 방법이에요.", "post_id": 2, "author_id": 5},
        {"content": "봄 소풍 좋죠! 저희도 다음 주에 갈 예정이에요.", "post_id": 3, "author_id": 1},
        {"content": "저는 다이소에서 재료 많이 사요. 가성비 좋아요!", "post_id": 4, "author_id": 2},
        {"content": "색종이 접기 세트 추천해요. 아이들이 좋아해요.", "post_id": 4, "author_id": 1},
        {"content": "상어가족은 진리죠 ㅎㅎ", "post_id": 5, "author_id": 3},
        {"content": "첫 상담은 아이의 장점 위주로 말씀드리면 좋아요!", "post_id": 6, "author_id": 4},
        {"content": "미리 상담 내용을 정리해가시면 덜 떨려요~", "post_id": 6, "author_id": 5},
        {"content": "저도 이 문제로 고민 많아요...", "post_id": 7, "author_id": 3},
        {"content": "칭찬 스티커 제도가 효과 있었어요!", "post_id": 7, "author_id": 4},
        {"content": "연수 정보 공유해주세요!", "post_id": 8, "author_id": 1},
        {"content": "저도 관심있어요~", "post_id": 8, "author_id": 2},
    ]

    comments = []
    for data in comments_data:
        comment = Comment(**data)
        db.add(comment)
        comments.append(comment)

    db.commit()
    print(f"[OK] {len(comments)}개의 댓글이 생성되었습니다.")
    return comments

def create_kindergartens():
    """유치원 더미 데이터 생성"""
    kindergartens_data = [
        {"name": "햇살유치원", "region": "서울시 강남구", "address": "서울시 강남구 역삼동 123-45"},
        {"name": "꿈나무유치원", "region": "경기도 성남시", "address": "경기도 성남시 분당구 정자동 456-78"},
        {"name": "사랑유치원", "region": "인천시 남동구", "address": "인천시 남동구 구월동 789-12"},
    ]

    kindergartens = []
    for data in kindergartens_data:
        kg = Kindergarten(**data)
        db.add(kg)
        kindergartens.append(kg)

    db.commit()
    for kg in kindergartens:
        db.refresh(kg)

    print(f"[OK] {len(kindergartens)}개의 유치원이 생성되었습니다.")
    return kindergartens

def create_classes(kindergartens):
    """반 더미 데이터 생성"""
    classes_data = [
        {"name": "햇님반", "kindergarten_id": 1},
        {"name": "달님반", "kindergarten_id": 1},
        {"name": "별님반", "kindergarten_id": 2},
        {"name": "구름반", "kindergarten_id": 2},
        {"name": "무지개반", "kindergarten_id": 3},
        {"name": "새싹반", "kindergarten_id": 3},
    ]

    classes = []
    for data in classes_data:
        cls = KindergartenClass(**data)
        db.add(cls)
        classes.append(cls)

    db.commit()
    for cls in classes:
        db.refresh(cls)

    print(f"[OK] {len(classes)}개의 반이 생성되었습니다.")
    return classes

def create_students(classes):
    """학생 더미 데이터 생성"""
    first_names = ["민준", "서윤", "도윤", "하윤", "시우", "지우", "서준", "지유", "예준", "하은",
                   "주원", "수아", "지호", "다은", "현우", "예은", "준우", "수빈", "유준", "소율"]

    students = []
    for cls in classes:
        # 각 반에 5-8명의 학생 생성
        num_students = random.randint(5, 8)
        selected_names = random.sample(first_names, num_students)

        for name in selected_names:
            student = Student(
                name=name,
                age=random.randint(4, 7),
                class_id=cls.id
            )
            db.add(student)
            students.append(student)

    db.commit()
    for student in students:
        db.refresh(student)

    print(f"[OK] {len(students)}명의 학생이 생성되었습니다.")
    return students

def create_expenses(students):
    """비용 더미 데이터 생성"""
    expense_categories = [
        ("교재비", 15000, 30000),
        ("급식비", 50000, 80000),
        ("현장학습비", 10000, 30000),
        ("특별활동비", 20000, 50000),
        ("준비물비", 5000, 15000),
    ]

    expenses = []
    for student in students:
        # 각 학생에 대해 2-4개의 비용 항목 생성
        num_expenses = random.randint(2, 4)
        selected_categories = random.sample(expense_categories, num_expenses)

        for category, min_amount, max_amount in selected_categories:
            expense = Expense(
                student_id=student.id,
                category=category,
                amount=random.randint(min_amount // 1000, max_amount // 1000) * 1000,
                description=f"{student.name} 학생 {category}",
                date=datetime.utcnow() - timedelta(days=random.randint(0, 30))
            )
            db.add(expense)
            expenses.append(expense)

    db.commit()
    print(f"[OK] {len(expenses)}개의 비용 항목이 생성되었습니다.")
    return expenses

def main():
    print("\n=== 더미 데이터 생성 시작 ===\n")

    # 기존 데이터 삭제
    clear_data()
    print("[OK] 기존 데이터가 삭제되었습니다.\n")

    # 데이터 생성
    users = create_users()
    posts = create_posts(users)
    comments = create_comments(users, posts)
    kindergartens = create_kindergartens()
    classes = create_classes(kindergartens)
    students = create_students(classes)
    expenses = create_expenses(students)

    print("\n=== 더미 데이터 생성 완료 ===\n")

if __name__ == "__main__":
    main()
