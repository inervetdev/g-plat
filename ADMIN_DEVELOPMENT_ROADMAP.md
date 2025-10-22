# G-PLAT 관리자 웹 서비스 개발 로드맵
**Design 2 (Clean Light Theme) 기반 개발 계획**

---

## 📋 문서 정보
- **버전**: 1.0
- **작성일**: 2025년 10월 19일
- **선정 디자인**: Design 2 - Clean Light Theme
- **예상 개발 기간**: 4개월 (16주)
- **참고 문서**: [ADMIN_SERVICE_SPECIFICATION.md](ADMIN_SERVICE_SPECIFICATION.md)

---

## 🎯 Phase 0: 프로젝트 셋업 (1주)

### Week 0: 개발 환경 구축

#### 1. 프로젝트 생성
```bash
# 관리자 앱 프로젝트 생성
cd mobile-business-card
mkdir admin-app
cd admin-app

# Vite + React 19 + TypeScript 프로젝트 생성
npm create vite@latest . -- --template react-ts

# 의존성 설치
npm install
```

#### 2. 필수 패키지 설치
```bash
# UI 라이브러리
npm install tailwindcss postcss autoprefixer
npm install @tailwindcss/forms @tailwindcss/typography
npm install lucide-react # 아이콘
npm install clsx tailwind-merge class-variance-authority

# shadcn/ui 초기화
npx shadcn-ui@latest init

# 라우팅
npm install react-router-dom

# 상태 관리
npm install zustand

# 데이터 페칭
npm install @tanstack/react-query

# 폼 관리
npm install react-hook-form zod @hookform/resolvers

# 테이블
npm install @tanstack/react-table

# 차트
npm install recharts

# 날짜
npm install date-fns

# Supabase
npm install @supabase/supabase-js

# 개발 도구
npm install -D @types/node
```

#### 3. Tailwind CSS 설정
```bash
# tailwind.config.js 생성
npx tailwindcss init -p
```

**tailwind.config.js** (Design 2 색상 적용):
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          500: '#8b5cf6', // Purple
          600: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Apple SD Gothic Neo', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

#### 4. 프로젝트 구조 생성
```bash
mkdir -p src/{components,pages,lib,hooks,types,stores}
mkdir -p src/components/{ui,layout,dashboard,users,cards}
mkdir -p src/pages/{auth,dashboard,users,cards,qr,reports,settings}
```

#### 5. Supabase 클라이언트 설정
**src/lib/supabase.ts**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**.env.local**:
```env
VITE_SUPABASE_URL=https://anwwjowwrxdygqyhhckr.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 6. React Query 설정
**src/lib/react-query.ts**:
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      refetchOnWindowFocus: false,
    },
  },
})
```

#### 7. Git 설정
```bash
# .gitignore 업데이트
echo "admin-app/node_modules" >> .gitignore
echo "admin-app/.env.local" >> .gitignore
echo "admin-app/dist" >> .gitignore

# Git 커밋
git add admin-app/
git commit -m "feat: Initialize admin web service project (Clean Light Theme)"
```

---

## 🏗️ Phase 1: 기본 관리자 시스템 (4주)

### Week 1: 레이아웃 및 인증

#### Day 1-2: 기본 레이아웃 구축
- [ ] **Header 컴포넌트** (`src/components/layout/Header.tsx`)
  - 로고, 검색바, 알림, 프로필 드롭다운
  - Design 2의 상단 헤더 구조 그대로 구현

- [ ] **Sidebar 컴포넌트** (`src/components/layout/Sidebar.tsx`)
  - 네비게이션 메뉴 (Main Menu, 운영, 시스템)
  - Active 상태 표시
  - 카운트 배지 (신고 8건 등)

- [ ] **Layout 컴포넌트** (`src/components/layout/Layout.tsx`)
  - Header + Sidebar + Main Content 조합
  - 반응형 처리 (모바일: 햄버거 메뉴)

#### Day 3-5: 관리자 인증 시스템
- [ ] **admin_users 테이블 생성**
  ```sql
  -- Supabase SQL Editor에서 실행
  CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'marketing_admin', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- RLS 정책
  ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Admin users can view all admin_users"
    ON admin_users FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'content_admin', 'marketing_admin', 'viewer'));
  ```

- [ ] **로그인 페이지** (`src/pages/auth/LoginPage.tsx`)
  - 이메일/비밀번호 폼
  - Supabase Auth 연동
  - 에러 처리

- [ ] **AuthContext 생성** (`src/contexts/AuthContext.tsx`)
  - 로그인/로그아웃 상태 관리
  - Role 기반 권한 체크

- [ ] **Protected Route 구현** (`src/components/ProtectedRoute.tsx`)
  - 미인증 시 로그인 페이지로 리다이렉트
  - Role 체크 기능

#### Day 6-7: 라우팅 설정
- [ ] **라우터 설정** (`src/App.tsx`)
  ```typescript
  import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            {/* ... 기타 라우트 */}
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
  ```

---

### Week 2: 대시보드 UI 구현

#### Day 1-2: 통계 카드 컴포넌트
- [ ] **StatCard 컴포넌트** (`src/components/dashboard/StatCard.tsx`)
  - 4개 통계 카드 (사용자, 활성 사용자, 명함, 매출)
  - 그라디언트 아이콘
  - 증감률 표시 (화살표 + 퍼센트)
  - Hover 애니메이션

#### Day 3-4: 차트 컴포넌트
- [ ] **SignupTrendChart** (`src/components/dashboard/SignupTrendChart.tsx`)
  - Recharts의 LineChart 사용
  - SVG 경로 그라디언트
  - 일간/주간/월간 필터

- [ ] **SubscriptionChart** (`src/components/dashboard/SubscriptionChart.tsx`)
  - 프로그레스 바 형태
  - FREE/PREMIUM/BUSINESS 비율

#### Day 5-7: 대시보드 페이지 조립
- [ ] **DashboardPage** (`src/pages/dashboard/DashboardPage.tsx`)
  - Quick Actions (인사말, 기간 선택, 리포트 다운로드)
  - 4개 통계 카드 그리드
  - 차트 2개 (2:1 비율)
  - 최근 가입자 테이블
  - 대기 중인 신고 카드

- [ ] **API 연동 (React Query)**
  - 실시간 통계 데이터 페칭
  - 자동 리프레시 (30초마다)

---

### Week 3: 사용자 관리 (1/2)

#### Day 1-3: 사용자 목록 페이지
- [ ] **UsersPage** (`src/pages/users/UsersPage.tsx`)
  - 검색 바 (이름, 이메일, 전화번호)
  - 필터 (구독 등급, 상태, 가입일)
  - 정렬 (가입일, 최근 활동일, 명함 수)

- [ ] **UsersTable** (`src/components/users/UsersTable.tsx`)
  - React Table v8 사용
  - 페이지네이션 (50개씩)
  - 컬럼: 프로필 사진, 이름, 이메일, 구독 등급, 최근 활동일, 명함 수, 상태, 액션
  - 일괄 선택 (체크박스)

- [ ] **사용자 API Hooks** (`src/hooks/useUsers.ts`)
  ```typescript
  export function useUsers(filters: UserFilters) {
    return useQuery({
      queryKey: ['users', filters],
      queryFn: () => fetchUsers(filters),
    })
  }
  ```

#### Day 4-5: 필터 및 검색
- [ ] **UserFilters 컴포넌트** (`src/components/users/UserFilters.tsx`)
  - 드롭다운 필터
  - 날짜 범위 선택
  - 필터 초기화 버튼

- [ ] **SearchBar 컴포넌트** (`src/components/ui/SearchBar.tsx`)
  - Debounce 적용 (500ms)
  - 실시간 검색

#### Day 6-7: 일괄 작업
- [ ] **BulkActions 컴포넌트** (`src/components/users/BulkActions.tsx`)
  - 일괄 이메일 발송
  - 일괄 구독 등급 변경
  - 일괄 비활성화

---

### Week 4: 사용자 관리 (2/2)

#### Day 1-3: 사용자 상세 페이지
- [ ] **UserDetailPage** (`src/pages/users/UserDetailPage.tsx`)
  - 탭 구조: 기본 정보, 명함 목록, 부가명함, QR 코드, 활동 로그, 결제 내역

- [ ] **UserInfoTab** (`src/components/users/detail/UserInfoTab.tsx`)
  - 프로필 정보 표시
  - 인라인 편집 (이름, 이메일, 전화번호)
  - 구독 등급 변경 드롭다운
  - 계정 상태 토글
  - 관리자 메모 (텍스트 에리어)

- [ ] **UserCardsTab** (`src/components/users/detail/UserCardsTab.tsx`)
  - 사용자의 명함 목록
  - 썸네일 + 제목 + 조회수
  - 액션: 미리보기, 수정, 삭제

#### Day 4-5: 사용자 비활성화/정지
- [ ] **UserStatusModal** (`src/components/users/UserStatusModal.tsx`)
  - 비활성화 (Deactivate)
  - 정지 (Suspend) - 사유 입력 필수
  - 복구 기능

- [ ] **admin_logs 테이블 연동**
  - 모든 사용자 변경 이벤트 로깅

#### Day 6-7: 테스트 및 리팩토링
- [ ] 사용자 관리 기능 E2E 테스트
- [ ] 코드 리뷰 및 최적화
- [ ] 문서화

---

## 📦 Phase 2: 콘텐츠 관리 (4주)

### Week 5: 명함 관리 (1/2)

#### Day 1-3: 명함 목록 페이지
- [ ] **CardsPage** (`src/pages/cards/CardsPage.tsx`)
  - 그리드 뷰 / 테이블 뷰 전환 토글
  - 검색 (명함 제목, 사용자명)
  - 필터 (테마, 상태, 생성일, 조회수)

- [ ] **CardsGridView** (`src/components/cards/CardsGridView.tsx`)
  - 카드 썸네일 (프로필 이미지)
  - 호버 시 미리보기, 수정, 삭제 버튼

- [ ] **CardsTableView** (`src/components/cards/CardsTableView.tsx`)
  - React Table 사용
  - 컬럼: 썸네일, 제목, 사용자명, 테마, 조회수, QR 스캔 수, 생성일, 상태, 액션

#### Day 4-5: 명함 검색 및 필터
- [ ] **CardFilters 컴포넌트**
  - 테마 필터 (Trendy, Apple, Professional, Simple, Default)
  - 상태 필터 (활성/비활성)
  - 날짜 범위
  - 조회수 정렬

#### Day 6-7: 일괄 작업
- [ ] **일괄 활성화/비활성화**
- [ ] **일괄 테마 변경**
- [ ] **일괄 삭제 (soft delete)**

---

### Week 6: 명함 관리 (2/2)

#### Day 1-3: 명함 상세 페이지
- [ ] **CardDetailPage** (`src/pages/cards/CardDetailPage.tsx`)
  - 명함 미리보기 (실제 테마 렌더링)
  - 기본 정보 섹션
  - 통계 섹션 (조회수 차트, QR 스캔 차트)
  - 부가명함 연결 섹션
  - 첨부파일 섹션
  - 활동 로그 섹션

- [ ] **CardPreview 컴포넌트**
  - iframe 또는 컴포넌트로 렌더링
  - 모바일/데스크톱 전환

#### Day 4-5: 명함 편집
- [ ] **CardEditModal**
  - 기본 정보 수정
  - 테마 변경
  - 활성화/비활성화 토글

#### Day 6-7: 명함 통계
- [ ] **CardStatsTab**
  - 일별 조회수 차트 (Recharts LineChart)
  - QR 스캔 수 차트
  - 유입 경로 분석 (Referrer)
  - 디바이스 비율 (파이 차트)

---

### Week 7: 관리자 제공 부가명함 & QR 관리

#### Day 1-4: 관리자 제공 부가명함 관리
**참고 문서**: [ADMIN_PROVIDED_SIDEJOBS_SPECIFICATION.md](./ADMIN_PROVIDED_SIDEJOBS_SPECIFICATION.md)

- [ ] **데이터베이스 설계 및 마이그레이션**
  - [ ] `admin_b2b_category` ENUM 타입 생성 (21개 카테고리)
    - 통신·인터넷, PG·VAN 카드결제, 가정용렌탈, 업소용렌탈, 네이버플레이스 노출, SNS광고
    - 자금렌탈, 세무기장, 정책자금, 세금환급, 주류, 보험, 홈페이지 제작
    - 언론사, 결혼정보, DB 프로그램, 꽃배달, 대리운전, 철거, 인테리어, 페인트
  - [ ] `admin_provided_sidejobs` 테이블 생성
  - [ ] `user_selected_admin_sidejobs` 테이블 생성
  - [ ] RLS 정책, 인덱스, 트리거 생성

- [ ] **TypeScript 타입 정의** (`admin-app/src/types/admin-sidejob.ts`)
  - [ ] `AdminProvidedSidejob` 인터페이스
  - [ ] `UserSelectedAdminSidejob` 인터페이스
  - [ ] `AdminB2BCategory` 타입
  - [ ] 21개 카테고리 설정 객체 (ADMIN_B2B_CATEGORY_CONFIG)

- [ ] **관리자 부가명함 관리 페이지** (`admin-app/src/pages/sidejob/AdminProvidedSideJobsPage.tsx`)
  - [ ] 카테고리별 필터 (21개 B2B 카테고리)
  - [ ] 그리드/테이블 뷰 전환
  - [ ] 검색 기능 (제목, 파트너사명)
  - [ ] 정렬 (선택 수, 생성일, 우선순위)
  - [ ] 활성화/비활성화 토글
  - [ ] 통계 카드 (총 명함 수, 활성 명함 수, 총 선택 수, 평균 선택율)

- [ ] **관리자 부가명함 생성/수정 폼** (`admin-app/src/components/sidejob/AdminSidejobFormModal.tsx`)
  - [ ] 카테고리 선택 (21개 드롭다운)
  - [ ] 제목, 설명, 이미지 업로드/URL
  - [ ] 가격, CTA 텍스트, CTA 링크
  - [ ] 배지 선택 (인기, 신규, 추천, HOT)
  - [ ] 우선순위 설정 (0-100 슬라이더)
  - [ ] 파트너사 정보 (이름, 수수료율)
  - [ ] react-hook-form + zod 유효성 검증

- [ ] **관리자 부가명함 상세 통계** (`admin-app/src/pages/sidejob/AdminSidejobDetailPage.tsx`)
  - [ ] 기본 정보 섹션
  - [ ] 선택 트렌드 차트 (일별/주별/월별 LineChart)
  - [ ] 선택한 사용자 목록 테이블 (페이지네이션)
  - [ ] 클릭 통계 (총 클릭 수, CTR)
  - [ ] 전환율 계산 (선택 → 클릭 → 전환)

#### Day 5-6: QR 코드 관리
- [ ] **QRCodesPage** (`admin-app/src/pages/qr/QRCodesPage.tsx`)
  - [ ] 테이블 형식 (React Table)
  - [ ] 컬럼: Short code, 타겟 URL, 스캔 수, 상태, 생성일
  - [ ] 필터: 상태 (활성/비활성), 날짜 범위
  - [ ] 검색: Short code, URL

- [ ] **QRCodeDetailPage** (`admin-app/src/pages/qr/QRCodeDetailPage.tsx`)
  - [ ] QR 이미지 다운로드 (PNG, 다양한 사이즈)
  - [ ] 스캔 통계 차트 (일별 스캔 수)
  - [ ] 스캔 로그 테이블 (디바이스, 브라우저, OS, IP, 시간)
  - [ ] 지역별 스캔 분석 (선택사항)

#### Day 7: 신고 관리
- [ ] **ReportsPage** (`admin-app/src/pages/reports/ReportsPage.tsx`)
  - [ ] 신고 목록 테이블
  - [ ] 필터: 상태 (대기 중, 검토 중, 해결됨, 기각됨)
  - [ ] 신고 유형별 분류
  - [ ] 우선순위 정렬

- [ ] **ReportDetailModal** (`admin-app/src/components/reports/ReportDetailModal.tsx`)
  - [ ] 신고 정보 (신고자, 신고 대상, 사유)
  - [ ] 신고 대상 미리보기 (명함 또는 부가명함)
  - [ ] 처리 옵션 버튼 (삭제, 비활성화, 경고, 기각)
  - [ ] 해결 노트 작성 (텍스트 에리어)
  - [ ] 처리 히스토리 표시
---

### Week 8: 통계 및 분석

#### Day 1-3: 사용자 분석
- [ ] **UserAnalyticsPage** (`src/pages/analytics/UserAnalyticsPage.tsx`)
  - 신규 가입자 추이 (일별/주별/월별 차트)
  - 가입 경로 분석 (이메일, Google, Kakao)
  - DAU, WAU, MAU 트렌드
  - 리텐션 코호트 분석

#### Day 4-5: 명함 분석
- [ ] **CardAnalyticsPage**
  - 명함 생성 추이
  - 테마별 명함 수 (바 차트)
  - 조회수 TOP 100
  - 조회수 분포 (히스토그램)

#### Day 6-7: QR 코드 분석
- [ ] **QRAnalyticsPage**
  - 스캔 추이 (일별/주별/월별)
  - 디바이스 분석 (모바일/태블릿/데스크톱)
  - 브라우저 분포
  - 지역별 스캔 (지도 시각화)

- [ ] **Export 기능**
  - CSV 다운로드
  - PDF 리포트 생성

---

## 🚀 Phase 3: 마케팅 및 자동화 (4주)

### Week 9-10: 마케팅 캠페인 (1/2)

#### Day 1-3: 캠페인 목록
- [ ] **campaigns 테이블 생성**
  ```sql
  CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
    target_segment JSONB,
    message_template TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] **CampaignsPage** (`src/pages/campaigns/CampaignsPage.tsx`)
  - 캠페인 목록 테이블
  - 상태별 필터
  - 성과 지표 표시 (발송 수, 오픈율, 클릭률)

#### Day 4-7: 캠페인 생성 (Step 1-2)
- [ ] **CampaignCreatePage** - Step 1: 캠페인 정보
  - 캠페인명 입력
  - 타입 선택 (이메일/SMS)
  - 목적 선택

- [ ] **CampaignCreatePage** - Step 2: 타겟 세그먼트
  - 조건 빌더 (쿼리 빌더 UI)
  - 구독 등급 선택
  - 최근 활동일 선택
  - 가입일 범위
  - 실시간 사용자 수 계산
  - 샘플 사용자 10명 미리보기

---

### Week 11: 마케팅 캠페인 (2/2)

#### Day 1-3: 캠페인 생성 (Step 3-4)
- [ ] **Step 3: 메시지 작성**
  - 이메일 템플릿 선택 (5개 기본 제공)
  - 제목 입력
  - 본문 (리치 텍스트 에디터)
  - 변수 삽입 (`{{name}}`, `{{email}}`, `{{company}}`)
  - 버튼 (CTA) 삽입
  - 미리보기

- [ ] **Step 4: 발송 설정**
  - 즉시 발송 vs 예약 발송
  - 날짜/시간 선택
  - 테스트 발송 (관리자 이메일로)

#### Day 4-5: 캠페인 생성 (Step 5)
- [ ] **Step 5: 검토 및 발송**
  - 모든 설정 요약
  - 예상 발송 수
  - 최종 확인 후 발송 또는 저장

#### Day 6-7: SendGrid 연동
- [ ] **SendGrid Edge Function** (`supabase/functions/send-email-campaign/index.ts`)
  ```typescript
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

  serve(async (req) => {
    const { campaign_id, recipients } = await req.json()

    // SendGrid API 호출
    // ...
  })
  ```

- [ ] **Supabase Secrets 설정**
  ```bash
  npx supabase secrets set SENDGRID_API_KEY=your-api-key
  ```

---

### Week 12: SMS 자동화 & 시스템 설정

#### Day 1-3: SMS 콜백 관리
- [ ] **CallbackLogsPage** (`src/pages/callback/CallbackLogsPage.tsx`)
  - 콜백 로그 테이블
  - 필터: 상태 (PENDING, SENT, FAILED), 날짜
  - 통계: 일별 발송량, 성공률

- [ ] **CallbackStatsPage**
  - 일별 발송량 차트
  - 성공률 (성공 vs 실패 파이 차트)
  - 실패 사유 분석

#### Day 4-5: 시스템 설정
- [ ] **SettingsPage** (`src/pages/settings/SettingsPage.tsx`)
  - 탭 구조: 일반 설정, 회원가입 설정, 구독 설정, API 키 관리

- [ ] **GeneralSettingsTab**
  - 서비스 이름, 로고
  - 기본 언어, 타임존

- [ ] **APIKeysTab**
  - SendGrid API Key 입력
  - Twilio/Aligo 설정
  - 연결 테스트 버튼

#### Day 6-7: 관리자 계정 관리
- [ ] **AdminUsersPage** (`src/pages/settings/AdminUsersPage.tsx`)
  - 관리자 목록 (super_admin만 접근)
  - 추가, 수정, 비활성화

- [ ] **AddAdminModal**
  - 이메일, 이름, 역할 선택
  - 초기 비밀번호 자동 생성 (이메일 발송)

---

### Week 13: 감사 로그 & 테스트

#### Day 1-3: 감사 로그
- [ ] **admin_logs 테이블 생성 (완료)**
  ```sql
  CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES admin_users(id),
    action TEXT NOT NULL,
    target_table TEXT,
    target_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_user_id, created_at DESC);
  CREATE INDEX idx_admin_logs_action ON admin_logs(action, created_at DESC);
  ```

- [ ] **AuditLogsPage** (`src/pages/logs/AuditLogsPage.tsx`)
  - 로그 목록 (페이지네이션 100개)
  - 검색: 관리자명, 액션
  - 필터: 날짜 범위, 대상 테이블
  - Export: CSV 다운로드

- [ ] **AuditLogDetailModal**
  - 전체 변경 내역 (JSON diff)
  - 관리자 정보
  - 시간, IP, User-Agent

#### Day 4-7: E2E 테스트
- [ ] Playwright 테스트 작성
  - 로그인 플로우
  - 사용자 관리 CRUD
  - 명함 관리 CRUD
  - 캠페인 생성 플로우
  - 필터 및 검색

- [ ] 통합 테스트
  - API 연동 테스트
  - Edge Function 테스트

---

## 🎨 Phase 4: 고급 기능 (4주)

### Week 14: 결제 관리

#### Day 1-3: 결제 내역 조회
- [ ] **payments 테이블 생성**
  ```sql
  CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    subscription_tier TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KRW',
    payment_method TEXT,
    payment_provider TEXT,
    payment_provider_id TEXT,
    status TEXT DEFAULT 'pending',
    billing_period_start DATE,
    billing_period_end DATE,
    refund_amount DECIMAL(10,2),
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] **PaymentsPage** (`src/pages/payments/PaymentsPage.tsx`)
  - 결제 내역 테이블
  - 필터: 상태, 구독 등급, 날짜
  - 통계: 월별 매출, 환불율

#### Day 4-5: 환불 처리
- [ ] **RefundModal**
  - 환불 사유 입력
  - 환불 금액 계산
  - Stripe/Toss API 연동

#### Day 6-7: 결제 통계
- [ ] **PaymentStatsPage**
  - 월별 매출 차트
  - 구독 등급별 매출 비율
  - 신규 구독자 수
  - 해지율 (Churn Rate)
  - LTV 추정

---

### Week 15: 한글 도메인 관리

#### Day 1-3: 도메인 신청 목록
- [ ] **korean_domains 테이블 생성**
  ```sql
  CREATE TABLE korean_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    domain_name TEXT UNIQUE NOT NULL,
    punycode TEXT,
    status TEXT DEFAULT 'pending',
    gabia_domain_id TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] **DomainsPage** (`src/pages/domains/DomainsPage.tsx`)
  - 도메인 신청 목록
  - 필터: 상태 (pending, approved, active, expired)

#### Day 4-5: 도메인 승인/거부
- [ ] **DomainApprovalModal**
  - 도메인명 확인
  - 승인 버튼
  - 거부 버튼 (사유 입력)

#### Day 6-7: 가비아 API 연동
- [ ] **Gabia Domain API 연동**
  - 도메인 등록 자동화
  - DNS 설정 자동화

---

### Week 16: 최종 테스트 & 배포

#### Day 1-3: 전체 통합 테스트
- [ ] 모든 기능 E2E 테스트
- [ ] 성능 테스트 (로딩 시간, API 응답 속도)
- [ ] 접근성 테스트 (WCAG 2.1 Level AA)
- [ ] 보안 테스트

#### Day 4-5: Vercel 배포 설정
```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 배포 (admin.g-plat.com)
cd admin-app
vercel --prod
```

- [ ] **vercel.json 설정**
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite",
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ],
    "env": {
      "VITE_SUPABASE_URL": "@supabase-url",
      "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  }
  ```

- [ ] **환경 변수 설정** (Vercel Dashboard)
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

#### Day 6-7: 문서화 & 핸드오버
- [ ] **관리자 매뉴얼 작성**
  - 로그인 방법
  - 각 기능 사용법
  - 문제 해결 가이드

- [ ] **개발자 문서 작성**
  - 프로젝트 구조 설명
  - 컴포넌트 가이드
  - API 문서
  - 배포 가이드

- [ ] **Git 커밋 및 푸시**
  ```bash
  git add .
  git commit -m "feat: Complete admin web service v1.0"
  git push origin main
  ```

---

## 📊 개발 진행 체크리스트

### Phase 0: 프로젝트 셋업
- [ ] Vite + React 19 + TypeScript 프로젝트 생성
- [ ] Tailwind CSS 설정 (Design 2 색상)
- [ ] Supabase 클라이언트 설정
- [ ] React Query 설정
- [ ] 프로젝트 구조 생성
- [ ] Git 설정

### Phase 1: 기본 관리자 시스템 (Week 1-4)
- [ ] Week 1: 레이아웃 (Header, Sidebar, Layout) + 인증 (로그인, admin_users 테이블)
- [ ] Week 2: 대시보드 (통계 카드, 차트, 대시보드 페이지)
- [ ] Week 3: 사용자 관리 1/2 (목록, 필터, 일괄 작업)
- [ ] Week 4: 사용자 관리 2/2 (상세 페이지, 비활성화/정지)

### Phase 2: 콘텐츠 관리 (Week 5-8)
- [ ] Week 5: 명함 관리 1/2 (목록, 그리드/테이블 뷰, 필터)
- [ ] Week 6: 명함 관리 2/2 (상세 페이지, 편집, 통계)
- [ ] Week 7: 부가명함 & QR 관리 & 신고 관리
- [ ] Week 8: 통계 및 분석 (사용자, 명함, QR 분석)

### Phase 3: 마케팅 및 자동화 (Week 9-13)
- [ ] Week 9-10: 마케팅 캠페인 1/2 (목록, 생성 Step 1-2)
- [ ] Week 11: 마케팅 캠페인 2/2 (Step 3-5, SendGrid 연동)
- [ ] Week 12: SMS 자동화 & 시스템 설정 & 관리자 계정
- [ ] Week 13: 감사 로그 & E2E 테스트

### Phase 4: 고급 기능 (Week 14-16)
- [ ] Week 14: 결제 관리 (내역 조회, 환불 처리, 통계)
- [ ] Week 15: 한글 도메인 관리 (신청 목록, 승인/거부, 가비아 API)
- [ ] Week 16: 최종 테스트 & Vercel 배포 & 문서화

---

## 🔧 개발 도구 및 라이브러리

### 필수 패키지
```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3",
    "@supabase/supabase-js": "^2.58.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "zustand": "^5.0.8",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@hookform/resolvers": "^3.0.0",
    "recharts": "^3.2.1",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.544.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7",
    "typescript": "~5.8.3",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "@playwright/test": "^1.55.1",
    "babel-plugin-react-compiler": "^1.0.0"
  }
}
```

### shadcn/ui 컴포넌트 (필요 시 설치)
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add calendar
```

---

## 📈 예상 일정 및 리소스

### 개발 리소스
- **풀스택 개발자**: 1명 (4개월 풀타임)
- **디자이너**: 0.5명 (Phase 1-2 동안)
- **QA 엔지니어**: 0.5명 (Phase 3-4 동안)

### 마일스톤
| Phase | 기간 | 산출물 | 검증 기준 |
|-------|------|--------|----------|
| Phase 0 | 1주 | 프로젝트 셋업 | 로컬 개발 환경 구동 |
| Phase 1 | 4주 | 기본 관리자 시스템 | 로그인 + 대시보드 + 사용자 관리 동작 |
| Phase 2 | 4주 | 콘텐츠 관리 | 명함/부가명함/QR 관리 + 통계 |
| Phase 3 | 4주 | 마케팅 & 자동화 | 캠페인 생성 + 이메일 발송 + 감사 로그 |
| Phase 4 | 4주 | 고급 기능 + 배포 | 결제/도메인 + Vercel 배포 |

---

## 🚨 리스크 관리

### 기술적 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| Supabase RLS 복잡도 | 중간 | 충분한 테스트, 단순화된 정책 |
| SendGrid 연동 실패 | 중간 | 테스트 계정으로 사전 검증 |
| 대용량 데이터 처리 | 낮음 | Pagination, Background jobs |

### 일정 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| 예상보다 긴 개발 시간 | 높음 | MVP 기능 먼저 완료, 고급 기능은 Phase 4로 연기 |
| 디자인 변경 요청 | 중간 | Design 2 확정 후 변경 금지 |

---

## 📝 다음 단계

### 즉시 착수 가능한 작업
1. **프로젝트 생성** (30분)
   ```bash
   cd mobile-business-card
   mkdir admin-app
   cd admin-app
   npm create vite@latest . -- --template react-ts
   ```

2. **패키지 설치** (10분)
   ```bash
   npm install
   npm install tailwindcss postcss autoprefixer
   npm install @supabase/supabase-js react-router-dom zustand
   ```

3. **Tailwind 설정** (15분)
   - `tailwind.config.js` 생성
   - Design 2 색상 적용

4. **첫 커밋** (5분)
   ```bash
   git add admin-app/
   git commit -m "feat: Initialize admin web service (Clean Light Theme)"
   git push origin main
   ```

### 첫 주 목표
- ✅ 프로젝트 셋업 완료
- ✅ 기본 레이아웃 (Header + Sidebar) 구현
- ✅ 로그인 페이지 구현
- ✅ 라우팅 설정 완료

---

**문서 버전**: 1.0
**작성일**: 2025년 10월 19일
**다음 검토일**: Phase 1 완료 후
**작성자**: G-PLAT 개발팀
**참고 문서**: [ADMIN_SERVICE_SPECIFICATION.md](ADMIN_SERVICE_SPECIFICATION.md), [admin-design-2-clean-light.html](admin-design-2-clean-light.html)
