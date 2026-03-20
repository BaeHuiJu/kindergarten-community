# 유치원 커뮤니티 색상 가이드

따뜻하고 아이들에게 친근한 유치원 테마 색상 팔레트입니다.

---

## 색상 팔레트 (Color Palette)

### 주요 색상 (Primary Colors)

| 이름 | CSS 변수 | HEX 코드 | 용도 |
|------|----------|----------|------|
| 카라멜 브라운 | `--primary` | `#C4915E` | 메인 버튼, 헤더, 강조 요소 |
| 진한 브라운 | `--primary-dark` | `#A67C52` | 그라데이션, 호버 효과 |
| 연한 브라운 | `--primary-light` | `#D4A574` | 보조 강조 |
| 중간 브라운 | `--secondary` | `#8B7355` | 보조 텍스트, 아이콘 |

### 액센트 색상 (Accent Colors)

| 이름 | CSS 변수 | HEX 코드 | 용도 |
|------|----------|----------|------|
| 연한 노랑 (모카신) | `--accent` | `#FFE4B5` | 카테고리 태그, 강조 배경 |
| 아주 연한 크림 | `--accent-light` | `#FFF5E6` | 섹션 배경 |

### 배경 색상 (Background Colors)

| 이름 | CSS 변수 | HEX 코드 | 용도 |
|------|----------|----------|------|
| 아이보리 | `--background` | `#FFFAF5` | 페이지 배경 |
| 크림 | `--background-card` | `#FFF8F0` | 카드, 폼 배경 |

### 텍스트 색상 (Text Colors)

| 이름 | CSS 변수 | HEX 코드 | 용도 |
|------|----------|----------|------|
| 진한 브라운 | `--text-primary` | `#5D4E37` | 제목, 본문 텍스트 |
| 중간 브라운 | `--text-secondary` | `#8B7355` | 부제목, 설명 텍스트 |

### 테두리 색상 (Border Colors)

| 이름 | CSS 변수 | HEX 코드 | 용도 |
|------|----------|----------|------|
| 베이지 | `--border` | `#E8DDD4` | 입력창, 카드 테두리 |
| 연한 베이지 | `--border-light` | `#F0E6DC` | 구분선, 연한 테두리 |

### 상태 색상 (Status Colors)

| 이름 | CSS 변수 | HEX 코드 | 용도 |
|------|----------|----------|------|
| 자연 초록 | `--success` | `#7CB342` | 성공 메시지 |
| 성공 배경 | `--success-bg` | `#F1F8E9` | 성공 알림 배경 |
| 부드러운 빨강 | `--danger` | `#E57373` | 삭제 버튼 |
| 진한 빨강 | `--danger-dark` | `#D32F2F` | 삭제 버튼 호버 |

### 기타 색상 (Other Colors)

| 이름 | CSS 변수 | HEX 코드 | 용도 |
|------|----------|----------|------|
| 다크 브라운 | `--footer-bg` | `#5D4037` | 푸터 배경 |

---

## 색상 미리보기

```
Primary Gradient:  ████████  #C4915E → #A67C52
Accent:            ████████  #FFE4B5 (연한 노랑)
Background:        ████████  #FFFAF5 (아이보리)
Card Background:   ████████  #FFF8F0 (크림)
Text Primary:      ████████  #5D4E37 (진한 브라운)
Text Secondary:    ████████  #8B7355 (중간 브라운)
Border:            ████████  #E8DDD4 (베이지)
Success:           ████████  #7CB342 (자연 초록)
Danger:            ████████  #E57373 (부드러운 빨강)
Footer:            ████████  #5D4037 (다크 브라운)
```

---

## 사용 예시

### CSS에서 변수 사용

```css
.my-element {
    background-color: var(--primary);
    color: var(--text-primary);
    border: 1px solid var(--border);
}

.my-button {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
}
```

### 그라데이션

```css
/* 헤더, 버튼용 그라데이션 */
background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
```

---

## 디자인 원칙

1. **따뜻함**: 브라운과 베이지 계열로 따뜻하고 편안한 느낌
2. **부드러움**: 모든 색상이 부드러운 톤으로 눈의 피로 감소
3. **자연스러움**: 자연에서 영감을 받은 흙, 나무, 햇살의 색상
4. **접근성**: 텍스트와 배경 간 충분한 대비 유지

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-03-20 | 초기 색상 테마 적용 (보라색 → 따뜻한 브라운 계열) |
