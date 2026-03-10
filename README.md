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

## 🔐 제보자 인증 구현 체크리스트

> 현재 인증 방식: `localStorage` 기반 디바이스 UUID 토큰 (`submitter_token`)
> 아래 단계별로 순차 구현하여 신뢰도를 높인다.

### 현재 구조의 한계

| 문제 | 내용 |
|------|------|
| 기기 분실 | 브라우저 데이터 삭제 시 내 제보 영구 조회 불가 |
| 다기기 조회 불가 | 모바일로 제보 후 PC에서 조회 불가 |
| 무단 접근 가능 | 토큰 값 노출 시 타인 제보 열람 가능 |
| 중복 제보 방지 불가 | 새 탭·기기마다 신규 토큰 생성됨 |
| 법적 책임 추적 불가 | 허위 제보 시 개인 특정 수단 없음 |

---

### 1단계 — 이메일 OTP 로그인 (즉시 적용 권장)

> Supabase Auth 내장 기능 활용, 추가 비용 없음

**구현 흐름**
```
제보/내 제보 클릭 → 이메일 입력 → 6자리 OTP 발송 → 인증 → 세션 유지
submitter_token(UUID) → user_id(Supabase Auth)로 마이그레이션
```

**구현 체크리스트**
- [ ] Supabase Dashboard → Authentication → Email OTP 활성화
- [ ] `app/auth/` 라우트 생성 (로그인 페이지 또는 모달)
- [ ] `supabase.auth.signInWithOtp({ email })` 호출 구현
- [ ] OTP 입력 UI 컴포넌트 작성 (`AuthModal.tsx`)
- [ ] 세션 확인 미들웨어 또는 클라이언트 훅 (`useAuth`) 작성
- [ ] `issues` 테이블 `submitter_token` 컬럼 → `user_id` (uuid, FK) 병행 운영
- [ ] `/api/my-issues` API: `token` 파라미터 → `user_id` 우선 조회로 변경
- [ ] `MyPageDrawer`: 비로그인 시 이메일 입력 유도 UI 추가
- [ ] 기존 디바이스 토큰 제보 이력 마이그레이션 안내 문구 추가
- [ ] 로그아웃 기능 구현

**관련 파일**
```
components/AuthModal.tsx          # 신규 생성
app/api/my-issues/route.ts        # user_id 조회 추가
components/MyPageDrawer.tsx       # 로그인 상태 분기 처리
app/page.tsx                      # 제보 폼 user_id 연동
```

---

### 2단계 — 소셜 로그인 (카카오 · 네이버 · Google)

> 실명 계정 기반 신뢰도 향상, Supabase OAuth 연동

**구현 흐름**
```
소셜 로그인 버튼 클릭 → OAuth 인증 → Supabase user 생성 → 제보 연결
```

**구현 체크리스트**
- [ ] 카카오 개발자센터 앱 등록 및 REST API 키 발급
  - https://developers.kakao.com
  - Redirect URI: `https://[supabase-project].supabase.co/auth/v1/callback`
- [ ] 네이버 개발자센터 앱 등록 및 Client ID/Secret 발급
  - https://developers.naver.com
- [ ] Google Cloud Console OAuth 2.0 클라이언트 생성
- [ ] Supabase Dashboard → Authentication → Providers 에서 각 제공자 활성화 및 키 입력
- [ ] `supabase.auth.signInWithOAuth({ provider: 'kakao' })` 구현
- [ ] `AuthModal.tsx`에 소셜 로그인 버튼 추가 (카카오 노란색, 네이버 초록색, Google 흰색)
- [ ] 소셜 로그인 후 리다이렉트 처리 (`app/auth/callback/route.ts`)
- [ ] 로그인 제공자별 아이콘 및 브랜드 가이드라인 준수 확인
- [ ] 신규 소셜 계정 최초 로그인 시 프로필 설정 플로우 (닉네임 등) 추가 여부 결정

**관련 파일**
```
app/auth/callback/route.ts        # 신규 생성 (OAuth 콜백 처리)
components/AuthModal.tsx          # 소셜 버튼 추가
.env.local                        # KAKAO_CLIENT_ID 등 키 추가
```

---

### 3단계 — SMS 휴대폰 인증 (최고 신뢰도)

> 한국 법적 본인확인 기준, 1인 1계정 강제

**SMS 제공자 비교**

| 제공자 | 건당 비용 | 특징 |
|--------|-----------|------|
| NHN Cloud SMS | ₩8~15 | 국내 최저가, 알림톡 연동 가능 |
| Twilio (Supabase 기본) | ₩70~100 | 글로벌, 설정 간단 |
| NICE 본인확인 | 월정액 | 주민번호 해시 검증, 법적 효력 |

**구현 흐름**
```
전화번호 입력 → SMS 인증번호 발송(6자리) → 입력 확인 → user 생성/로그인
```

**구현 체크리스트**
- [ ] SMS 제공자 선택 및 계정 생성 (NHN Cloud 권장)
- [ ] Supabase Dashboard → Authentication → Phone Provider 설정
  - Twilio 사용 시: Account SID, Auth Token, 발신번호 입력
  - 커스텀 SMS 사용 시: `supabase.functions` 엣지 함수로 NHN Cloud API 연동
- [ ] 전화번호 입력 UI 컴포넌트 작성 (국가코드 +82 기본값)
- [ ] `supabase.auth.signInWithOtp({ phone: '+821012345678' })` 구현
- [ ] SMS OTP 인증 입력 UI 작성
- [ ] 인증 완료 후 "인증된 제보자" 뱃지 DB 필드 추가 (`is_verified: boolean`)
- [ ] 이슈 카드에 인증 제보자 뱃지 표시
- [ ] 전화번호 중복 가입 방지 로직 확인 (Supabase 기본 처리)
- [ ] 법적 요청 대응 절차 문서화 (수사기관 영장 시 정보 제공 범위 정의)

**관련 파일**
```
supabase/functions/send-sms/      # 신규 생성 (NHN Cloud 연동 시)
components/AuthModal.tsx          # 전화번호 입력 탭 추가
supabase/migrations/add_verified.sql  # is_verified 컬럼 추가
```

---

### 프라이버시 보호 원칙 (인증 전 단계 공통)

- **내부 식별**: 이메일·전화번호를 직접 표시하지 않고 `user_id` (UUID)로만 저장
- **제보자 표시**: "인증된 제보자 ✓" 뱃지만 공개, 개인정보 미노출
- **데이터 보관**: 이메일·전화번호는 Supabase Auth 테이블에만 저장, 이슈 테이블에는 `user_id`만 연결
- **법적 접근**: 수사기관의 정식 영장 발부 시에만 연락처 정보 제공 (운영정책 별도 고지)
- **탈퇴 처리**: 계정 삭제 시 `user_id` → `null` 처리, 제보 내용은 익명화 후 유지 여부 결정

---

### 단계별 구현 우선순위 요약

```
[즉시]  1단계 이메일 OTP  →  기기 독립 로그인, 내 제보 다기기 조회
[1개월] 2단계 소셜 로그인  →  카카오/네이버 실명 계정 연동, UX 향상
[필요시] 3단계 SMS 인증   →  고신뢰 뱃지, 법적 추적 가능성 확보
```

---

## 기여

이 프로젝트는 공익 목적으로 개발되었습니다.
