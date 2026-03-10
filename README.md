# 🔔 상식의 기준

> 증거와 구조로 '상식'을 시각화하는 시민 공론 플랫폼 / 사례로 묻고, 지지로 드러냅니다.

---

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **백엔드**: Supabase (PostgreSQL + Auth + Storage + Row Level Security)
- **폰트**: Pretendard

---

## 프로젝트 구조

```
src/
├── app/
│   ├── issues/
│   │   ├── page.tsx          # 이슈 목록
│   │   ├── new/page.tsx      # 이슈 등록 (4-step wizard)
│   │   └── [id]/page.tsx     # 이슈 상세
│   ├── ranking/page.tsx      # 추천 랭킹
│   └── admin/page.tsx        # 관리자 패널
├── components/
│   ├── issues/
│   │   ├── IssueCard.tsx
│   │   ├── IssueFilter.tsx
│   │   └── SupportButton.tsx
│   └── comments/
│       └── CommentList.tsx
├── lib/
│   ├── supabase.ts
│   └── api/issues.ts
└── types/index.ts

supabase/
└── migrations/
    └── 001_initial.sql
```

---

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. Supabase 프로젝트 설정

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 열어 Supabase 키값 입력
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. Supabase 타입 자동 생성 (선택)

```bash
npm run db:types
```

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 이슈 등록 | 4단계 폼으로 구조화된 제보 |
| 추천(지지) | 휴대폰 인증 회원 1인 1회, 이유 선택 |
| 상태 관리 | 접수됨 → 검증중 → 공론화진행 → 기관전달 → 종결 |
| 댓글 | 사실보완·법률의견 중심 통제형 댓글 |
| 관리자 | 이슈 승인/거절, 상태 변경, 첨부파일 승인 |
| 랭킹 | 주간/월간/누적 추천 TOP |
| 파일 첨부 | 판결문·처분서 등 관리자 승인 후 공개 |

---

## 설계 문서

- [회원 인증 방식 설계 문서](docs/authentication-design.md)

---

## 법적 고려사항

- 실명 공개 없음 (휴대폰 해시로만 식별)
- 개인·공무원 실명 마스킹 정책
- "사실로 단정하지 않음" 고지
- 공익 목적 의견 개진 플랫폼 명시
- 관리자 사전 검토 시스템

---

## 다음 단계 (로드맵)

- [ ] 관리자 패널 완성
- [ ] 댓글 시스템 구현
- [ ] 파일 업로드 (Supabase Storage)
- [ ] 이메일/SMS 알림
- [ ] 이슈 PDF 리포트 자동 생성
- [ ] 통계 대시보드
- [ ] 언론 제보용 요약 페이지

---

## 기여

이 프로젝트는 공익 목적으로 개발되었습니다.
