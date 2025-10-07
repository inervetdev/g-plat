# CLAUDE.md (한글판)

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 필요한 가이드를 제공합니다.

## 프로젝트 개요

지플랫(G-Plat) 모바일 명함 서비스 - LinkedIn 스타일의 프로페셔널 네트워킹과 부업 포트폴리오 관리를 결합한 모바일 명함 플랫폼입니다. 한글 도메인 기반 개인 브랜딩(예: 김대리.한국)과 고객 참여를 위한 자동 콜백 시스템이 특징입니다.

## 개발 명령어

### React 앱 개발 (주요)
```bash
# React 앱 디렉토리로 이동
cd react-app

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
# 앱은 http://localhost:5173 에서 실행됩니다

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview
```

### Node.js 개발 (레거시)
```bash
# 의존성 설치
npm install

# 로컬 서버 시작 (Express)
npm start
# 또는 자동 재시작 개발 모드
npm run dev

# 서버는 http://localhost:8080 에서 실행됩니다
```

### Docker 개발
```bash
# 모든 서비스 시작 (Tomcat, MySQL, Redis, phpMyAdmin)
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f web

# 서비스 접속
# - 웹: http://localhost:8080
# - phpMyAdmin: http://localhost:8081
# - MySQL: localhost:3306
```

### 데이터베이스 접속
```bash
# MySQL 컨테이너 접속
docker exec -it gplat-db mysql -u root -pgplat2024!

# 데이터베이스 인증 정보:
# Root: root / gplat2024!
# User: gplat_user / gplat_pass
```

### Supabase 로컬 개발
```bash
# React 앱 디렉토리로 이동
cd react-app

# Supabase 로컬 서비스 시작
npx supabase start
# 서비스:
# - API: http://127.0.0.1:54321
# - Studio: http://127.0.0.1:54323
# - Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Supabase 서비스 중지
npx supabase stop

# 데이터베이스 리셋 (마이그레이션 재적용)
npx supabase db reset

# Edge Function 로컬 실행
npx supabase functions serve qr-redirect --no-verify-jwt
# Function URL: http://127.0.0.1:54321/functions/v1/qr-redirect

# Edge Function 프로덕션 배포
npx supabase functions deploy qr-redirect
```

### 테스팅
```bash
# React 앱 디렉토리로 이동
cd react-app

# Playwright E2E 테스트 실행
npx playwright test

# 특정 테스트 파일 실행
npx playwright test tests/gplat-production.spec.ts

# 테스트 리포트 보기
npx playwright show-report
```

### 공개 접속 설정
```bash
# Windows 배치 스크립트 사용 가능:
run-local.bat          # 로컬 서버 시작
start-public-access.bat # ngrok 터널 설정
setup-firewall.bat     # 방화벽 구성
setup-ngrok.ps1        # PowerShell ngrok 설정
```

## 아키텍처

### 현재 상태
프로젝트는 세 가지 병렬 구현을 가지고 있습니다:

1. **React 앱 (주요 개발)** (`react-app/`)
   - React 18 + TypeScript + Vite 개발 환경
   - Supabase 통합 (인증 및 데이터베이스)
   - 현재 활발히 개발 중
   - 구현된 기능:
     - Supabase Auth를 통한 사용자 인증
     - 명함 CRUD 작업 (커스텀 URL 포함)
     - URL 중복 체크 및 실시간 검증
     - 부업 카드 관리 시스템
     - 방문자 통계 및 분석 대시보드
     - 실시간 데이터 동기화
     - 대시보드 메트릭 표시

2. **Node.js/Express 서버** (`standalone-server.js`) - 레거시
   - 정적 HTML을 제공하는 간단한 Express 서버
   - 템플릿 변수를 치환하여 JSP 기능 시뮬레이션
   - 폐기 예정

3. **JSP/Tomcat 애플리케이션** (webapps/ROOT/) - 레거시
   - 전통적인 JSP 아키텍처
   - Docker 배포용으로 설계
   - 여러 카드 템플릿 (simple, professional, trendy, apple 테마)
   - 각 테마별 관리자 대시보드
   - 폐기 예정

### 디렉토리 구조
- `react-app/` - React 애플리케이션 (주요)
  - `src/pages/` - 페이지 컴포넌트 (Dashboard, CreateCard, EditCard, SideJobCards, Stats 등)
  - `src/components/` - 재사용 가능한 UI 컴포넌트
  - `src/lib/` - 유틸리티 및 Supabase 클라이언트
  - `src/types/` - TypeScript 타입 정의
  - `supabase/` - Supabase 설정 및 마이그레이션
    - `config.toml` - Supabase 로컬 개발 설정
    - `migrations/` - 데이터베이스 마이그레이션 파일
    - `functions/` - Edge Functions (Deno)
      - `qr-redirect/` - QR 코드 리다이렉트 및 스캔 추적 함수
  - `tests/` - Playwright E2E 테스트
  - `playwright.config.ts` - Playwright 설정
- `webapps/ROOT/` - JSP 웹 애플리케이션 (레거시)
  - `card/` - 모바일 명함 페이지 (여러 테마)
  - `admin/` - 대시보드 페이지 (일치하는 테마)
  - `WEB-INF/` - Java 웹 구성
- `supabase/functions/` - 루트 Edge Functions 디렉토리
- `sql/init.sql` - 데이터베이스 초기화 스크립트 (레거시)
- `assets/` - 정적 리소스
- 루트의 정적 HTML 프로토타입 (gplat_*.html 파일)

### 핵심 기술
- **프론트엔드 (현재)**: React 18 + TypeScript + Vite + Tailwind CSS
- **백엔드 (현재)**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **상태 관리**: Zustand를 통한 전역 상태 관리
- **UI 라이브러리**: shadcn/ui 컴포넌트
- **차트**: Recharts를 통한 분석 시각화
- **QR 코드**: qrcode.js 생성 라이브러리
- **Edge Functions**: Supabase의 Deno 런타임
- **테스팅**: Playwright E2E 테스트
- **CLI 도구**: Supabase CLI, Playwright CLI
- **프론트엔드 (레거시)**: 임베디드 JavaScript가 포함된 JSP 페이지
- **백엔드 (레거시)**: 개발용 Node.js/Express, 프로덕션용 Tomcat
- **데이터베이스 (레거시)**: Redis 캐시를 포함한 MySQL 8.0

## 중요 컨텍스트

### 비즈니스 모델
- **Freemium SaaS**: 기본 무료 티어, 프리미엄 (월 9,900원), 비즈니스 (월 29,900원)
- **부업 통합**: 사용자가 여러 부업을 위한 "명함 카드"를 추가 가능
- **자동 콜백**: 통화 후 자동으로 명함 링크가 포함된 SMS 전송
- **한글 도메인**: 각 사용자는 개인화된 .한국 도메인 획득

### 개발 우선순위 (PRD 기준)
1. 핵심 기능을 갖춘 MVP 완성
2. 사용자 온보딩 최적화 (3분 내 설정)
3. 한글 도메인 시스템 구현
4. 콜백 자동화 시스템
5. 실시간 분석 대시보드

### 현재 개발 상태
- **활발한 개발**: React 앱 with Supabase 통합 - **✅ 프로덕션 배포 완료**
- **배포 상태**:
  - ✅ Vercel 프로덕션 배포 (커스텀 도메인 연결 완료)
  - ✅ GitHub 저장소: https://github.com/inervetdev/g-plat
  - ✅ 환경 변수 설정 완료 (Supabase, 앱 설정)
  - ✅ 주요 기능 테스트 완료 (회원가입, 로그인, 명함 생성)
  - ✅ TypeScript 빌드 에러 해결
  - ✅ 모바일 반응형 UI 검증 완료
- **완료된 기능 (Phase 1 & 2)**:
  - ✅ 사용자 인증 (Supabase Auth)
  - ✅ 커스텀 URL과 함께 명함 CRUD
  - ✅ URL 중복 체크 및 실시간 검증
  - ✅ 부업 카드 관리 (CRUD, 순서 변경, 드래그 앤 드롭)
  - ✅ 부업 카드와 명함 연결 (다대다 지원)
  - ✅ 명함 + 부업 카드 통합 미리보기
  - ✅ 부업 카드 이미지 Supabase Storage 업로드
  - ✅ Storage RLS 정책으로 안전한 파일 업로드
  - ✅ 대시보드 카드 미리보기 모달 (통합 뷰)
  - ✅ 방문자 통계 대시보드 (Recharts)
  - ✅ 실시간 데이터 동기화
  - ✅ 보안을 위한 RLS 정책
  - ✅ 동적 메트릭이 있는 대시보드
  - ✅ QR 코드 생성 및 추적 (전체 구현)
  - ✅ QR 코드 리다이렉트 Edge Function (스캔 추적 포함)
  - ✅ 디바이스/브라우저/OS 감지
  - ✅ 스캔 분석 (referrer, IP, user-agent 추적)
  - ✅ 다양한 카드 테마 (Trendy, Apple, Professional, Simple, Default)
  - ✅ 테마 미리보기 모달 (실시간 프리뷰)
  - ✅ 차트와 방문자 추적이 있는 분석 대시보드
  - ✅ 프로필 이미지 및 회사 로고 업로드
  - ✅ Supabase 로컬 개발 환경
  - ✅ QR 시스템을 위한 데이터베이스 마이그레이션
  - ✅ Playwright E2E 테스트 설정
  - ✅ Supabase MCP 통합
  - ✅ 소셜 로그인 UI (Google, Kakao, Apple) - OAuth 설정 대기
- **대기 중인 기능 (Phase 3)**:
  - ⏳ 콜백 자동화 시스템
  - ⏳ SMS 자동화 (Twilio/Aligo 통합)
  - ⏳ 결제 통합 (프리미엄/비즈니스 티어)
  - ⏳ 한국 도메인 (.한국) 시스템 구현
  - ⏳ 추가 프리미엄 카드 템플릿
  - ⏳ 팀 협업 기능
  - ⏳ 고급 CRM 기능
- **기술 전략**: React로 빠른 MVP 개발 진행, 사용자 피드백과 확장 필요성에 따라 Next.js 마이그레이션 검토

### 다음 단계
1. **Phase 3 개발**:
   - 콜백 자동화 시스템
   - Twilio/Aligo SMS 통합
   - 결제 시스템 통합 (Stripe/토스페이먼츠)
   - 한국 도메인 (.한국) 등록 시스템
2. **성능 최적화**:
   - 이미지 최적화 및 지연 로딩
   - 코드 스플리팅 및 번들 크기 감소
   - 캐싱 전략 구현
3. **분석 기능 향상**:
   - 전환 퍼널 추적
   - A/B 테스팅 프레임워크
   - 사용자 행동 히트맵

## 데이터베이스 스키마
MySQL 데이터베이스 (`gplat`)는 사용자, 명함, 부업 카드, 분석 및 콜백 관리를 위한 테이블을 포함합니다. 스키마 초기화는 `sql/init.sql`에 있습니다.

## 보안 고려사항
- Supabase Auth를 통한 인증 계획
- README.md의 현재 데모 인증 정보는 교체 필요
- 데이터베이스 비밀번호가 docker-compose.yml에 하드코딩됨
- 아직 시크릿 관리 시스템이 없음