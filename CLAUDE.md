# G-Plat AI 개발 가이드

지플랫(G-Plat) 모바일 명함 서비스 - LinkedIn-style professional networking + side business portfolio management. Korean domain-based personal branding (e.g., 김대리.한국) with automated callback systems.

---

## 개발 환경 설정

### React App (Primary)
```bash
cd react-app
npm install
npm run dev  # http://localhost:5173
npm run build
```

### Admin App
```bash
cd admin-app
npm install
npm run dev  # http://localhost:5174
npm run build
```

### Supabase Local (선택)
```bash
cd react-app
npx supabase start  # API: http://127.0.0.1:54321
npx supabase stop
```

상세: [React App Development](docs/services/react-app/DEVELOPMENT.md)

---

## 아키텍처 개요

**현재 스택**: React 18 + TypeScript + Vite + Supabase

### 주요 앱
1. **react-app/** - 사용자 앱 (프로덕션 배포 완료)
   - React 18 + TypeScript + Vite
   - Supabase (Auth, Database, Storage, Realtime)
   - Vercel 배포: https://g-plat.com

2. **admin-app/** - 관리자 앱 (Phase 3 개발 중)
   - React 19 + Vite 7 + TypeScript
   - Supabase 연동
   - Vercel 배포: https://admin.g-plat.com

3. **Legacy** - Node.js/Express, JSP/Tomcat (deprecated)

### 디렉토리 구조
```
react-app/
├── src/
│   ├── pages/      # Dashboard, CreateCard, EditCard, etc.
│   ├── components/ # UI components
│   ├── lib/        # Utilities, Supabase client
│   └── types/      # TypeScript definitions
├── supabase/
│   ├── migrations/ # DB migration files
│   └── functions/  # Edge Functions (Deno)
└── tests/          # Playwright E2E tests

admin-app/
├── src/
│   ├── pages/      # Dashboard, Cards, Users, etc.
│   └── components/
└── ...

docs/              # 📚 문서 시스템 (계층적 구조)
└── INDEX.md       # 전체 문서 인덱스
```

상세: [Architecture Overview](docs/architecture/overview.md)

---

## 현재 개발 상태

### Phase & Week
- **Phase**: 3 (고급 기능 및 확장)
- **Week**: 18 (2025.12.16)
- **Status**: 신고관리 시스템 구현 완료
- **Last Updated**: 2025-12-16

### 최근 완료 (2025.12.16)
- ✅ **신고관리 시스템 구현**
  - DB 마이그레이션: user_reports, report_action_logs 테이블
  - Admin App: 신고 목록/상세/처리 기능
  - React App: 신고 버튼 및 모달 (명함 하단)
  - 신고 유형: 스팸, 부적절, 사기, 저작권, 개인정보, 기타
  - 처리 조치: 콘텐츠 삭제/비활성화, 사용자 경고/정지/차단
- ✅ **RLS 정책 수정 (INSERT/SELECT)**
  - INSERT 정책: `TO anon, authenticated` 추가
  - SELECT 정책: 신고자 조회 허용 (INSERT 후 ID 반환용)
  - GRANT 문 추가: anon, authenticated 역할에 권한 부여
- ✅ **Admin Reports API 수정**
  - auth.users 직접 조인 불가 문제 해결
  - reporter, target_owner 조인 제거
- ⚠️ **이메일 알림 미구현**
  - notify_reporter 필드는 저장만 됨
  - 실제 이메일 발송 기능은 향후 구현 예정

### 이전 완료 (2025.12.14)
- ✅ **Resend SMTP 이메일 설정 완료**
  - 도메인: sign.g-plat.com (Verified)
  - Supabase SMTP 설정 (smtp.resend.com:465)
  - 회원가입 이메일 인증 정상 작동
  - 발신자: noreply@sign.g-plat.com
- ✅ **사용자 삭제 시 auth.users 동시 삭제**
  - Edge Function 생성 (delete-auth-user)
  - 삭제된 사용자 재로그인 방지
  - Soft delete + Auth 삭제 동시 처리
- ✅ **Admin 지도 미리보기 로딩 수정**
  - Kakao Maps SDK 로딩 상태 관리 개선
  - window.kakaoMapsReady 플래그 추가
  - 로딩 화면 무한 표시 문제 해결

### 이전 완료 (2025.12.11)
- ✅ **관리자 명함 생성 기능 개선**
  - users 테이블에서 직접 검색 (명함 없는 신규 회원도 검색 가능)
  - 이름 + 이메일 동시 검색 지원
- ✅ **명함 삭제 기능 추가**
  - Soft delete 방식 구현 (is_active = false)
- ✅ **구독 등급 시스템 구현**
  - 3단계 등급: FREE, PREMIUM, BUSINESS

### 이전 완료 (2025.12.05)
- ✅ **QR 스캔 추적 시스템 완성**
  - Edge Function IP 주소 처리 수정 (INET 타입 호환)
  - qr_scans 테이블 컬럼 추가 (browser, os)
  - 스캔 기록 정상 저장 확인
  - 관리자 대시보드 통계 연동 완료
- ✅ **QR 코드 URL 표시 개선**
  - Supabase URL 대신 g-plat.com/q/ 경로 표시
  - QRCodeGenerator.tsx 수정

### 이전 완료 (2025.12.04)
- ✅ **QR 코드 자동 생성 기능**
  - 명함 생성 시 QR 코드 자동 생성
  - 기존 명함에 QR 코드 자동 생성 (19개 생성)
  - lib/qr.ts: QR 코드 유틸리티 함수
- ✅ **QR 코드 공유 기능 활성화**
  - Web Share API 구현
  - QR 이미지 + URL 공유
- ✅ **QR 리다이렉트 시스템 수정**
  - QRRedirectPage.tsx: 클라이언트 사이드 리다이렉트 구현
  - /q/ 경로 리다이렉트 정상화
- ✅ **Admin QR 관리 개선**
  - TypeScript 타입 정의 수정
  - RLS 정책 추가
  - 활성/비활성 토글 기능 구현

### 다음 단계
- ⏳ 콜백 자동화 시스템 (SMS 통합)
- ⏳ 마케팅 캠페인 관리
- ⏳ 결제 시스템 연동

전체 로드맵: [Current Phase](docs/roadmap/current-phase.md)

---

## 기술 스택

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Zustand (상태 관리)
- React Router v6
- Recharts (차트)

### Backend
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Edge Functions (Deno runtime)
- RLS (Row Level Security)

### 인프라
- Vercel (프로덕션 배포)
- GitHub (https://github.com/inervetdev/g-plat)
- Playwright (E2E 테스트)

상세: [Tech Stack](docs/architecture/tech-stack.md)

---

## 데이터베이스

**주요 테이블**:
- `business_cards` - 명함 정보
- `sidejob_cards` - 부가명함 (카테고리 시스템)
- `card_attachments` - 첨부파일, YouTube
- `qr_codes`, `qr_scans` - QR 추적
- `admin_users` - 관리자 계정

**Storage Buckets**: `card-attachments`, `sidejob-cards`

상세: [Database Schema](docs/architecture/database-schema.md)

---

## 핵심 기능

### 사용자 앱 (react-app)
- ✅ 인증 (이메일 OTP, Google OAuth UI)
- ✅ 명함 CRUD, 커스텀 URL
- ✅ 부가명함 (카테고리, 드래그 앤 드롭)
- ✅ QR 코드 생성 및 추적
- ✅ 프로필 이미지, 첨부파일
- ✅ Naver Maps 주소 검색
- ✅ 방문자 통계, 실시간 분석

### 관리자 앱 (admin-app)
- ✅ 대시보드 (통계, 차트)
- ✅ 명함 관리 (목록, 상세, 편집)
- ✅ 부가명함 관리 (목록, 편집, 이미지 업로드)
- ✅ 제휴 부가명함 관리 (템플릿)
- ✅ QR 코드 관리 (목록, 통계, 스캔 추적)
- ✅ 신고 관리 (목록, 상세, 처리 조치)
- ⏳ 마케팅 캠페인, 통계 분석 (예정)

상세: [React App Features](docs/services/react-app/FEATURES.md)

---

## 문서 인덱스

### 📘 필수 문서
- [전체 문서 인덱스](docs/INDEX.md) ⭐
- [문서 작성 표준안](DOCUMENTATION_STANDARD.md)
- [PRD (제품 요구사항)](prd.md)

### 🏗️ 아키텍처
- [개요](docs/architecture/overview.md)
- [데이터베이스 스키마](docs/architecture/database-schema.md)
- [기술 스택](docs/architecture/tech-stack.md)

### 📦 서비스
- [React App](docs/services/react-app/README.md)
- [Admin App](docs/services/admin-app/README.md)

### 🔧 기능
- [인증](docs/features/authentication/README.md)
  - [이메일 OTP](docs/features/authentication/email-otp.md) ⭐
- [명함 관리](docs/features/business-cards/README.md)
  - [테마 표준 규격](docs/features/business-cards/THEME_STANDARD.md) ⭐
- [부가명함](docs/features/sidejob-cards/README.md)
- [QR 시스템](docs/features/qr-system/README.md)
- [첨부파일](docs/features/attachments/)
- [지도/주소](docs/features/maps/)

### 🚀 인프라
- [Supabase](docs/infrastructure/supabase/README.md)
- [Vercel](docs/infrastructure/vercel/deployment.md)
- [보안](docs/infrastructure/security/checklist.md)

### 📚 변경 이력
- [2025년 11월](docs/history/changelog/2025-11.md)
- [v2.4 프로필 이미지](docs/history/versions/v2.4-profile-images.md)

---

## Supabase MCP

Claude Code는 MCP를 통해 프로덕션 DB에 직접 접근 가능합니다.

- **Project**: g-plat (`anwwjowwrxdygqyhhckr`)
- **Database**: PostgreSQL (AWS ap-northeast-2)

상세: [Supabase MCP Setup](docs/infrastructure/supabase/mcp-setup.md)

⚠️ **주의**: MCP는 RLS를 우회하므로 데이터 수정 시 주의

---

**마지막 업데이트**: 2025-12-16
**버전**: 3.0
