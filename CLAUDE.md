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
- **Week**: 13 (2025.11.25-11.29)
- **Status**: UI/UX 개선 및 버그 수정
- **Last Updated**: 2025-11-27

### 최근 완료 (2025.11.27)
- ✅ **Admin App 부가명함 관리 기능** (신규)
  - 목록/상세/편집/삭제 (그리드/테이블 뷰)
  - 검색, 카테고리, 활성 상태 필터
  - 통계 카드 (전체, 활성, 조회수, 클릭수)
  - 관리자 이미지 업로드/변경/삭제 기능
- ✅ 지도 InfoWindow 제거 (마커만 표시)
- ✅ React Compiler 관련 문구/이미지 제거 (7개 페이지)
- ✅ 랜딩페이지 로그인 상태 유지 기능 추가
- ✅ 명함 테마 SNS 섹션 추가 (6개 플랫폼)

### 진행 중
- 🔄 QR 코드 관리 모듈 (Admin App)

### 다음 단계
- ⏳ 마케팅 캠페인 관리
- ⏳ 통계 분석 대시보드
- ⏳ 결제 시스템 연동

전체 로드맵: [Phase 3 Planned](docs/roadmap/phase-3-planned.md)

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
- 🔄 QR 코드 관리 (진행 예정)
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

**마지막 업데이트**: 2025-11-26
**버전**: 2.6
