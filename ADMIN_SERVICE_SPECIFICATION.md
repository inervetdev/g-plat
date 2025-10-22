# G-PLAT 관리자 웹 서비스 상세 기획서
**Admin Service Specification Document**

---

## 문서 정보
- **버전**: 1.0
- **작성일**: 2025년 10월 19일
- **대상**: 관리자 웹 서비스 개발 팀
- **상태**: 초안
- **다음 검토일**: 2025년 11월

---

## 목차
1. [개요](#1-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [인증 및 권한 관리](#3-인증-및-권한-관리)
4. [핵심 기능 상세](#4-핵심-기능-상세)
5. [향후 개발 영역](#5-향후-개발-영역)
6. [기술 스택](#6-기술-스택)
7. [보안 요구사항](#7-보안-요구사항)
8. [개발 로드맵](#8-개발-로드맵)

---

## 1. 개요

### 1.1 서비스 목적
G-PLAT 관리자 웹 서비스는 플랫폼 운영진이 사용자, 콘텐츠, 시스템을 효율적으로 관리하고 모니터링할 수 있는 통합 관리 대시보드입니다.

### 1.2 핵심 가치
- **실시간 모니터링**: 플랫폼 핵심 지표 실시간 추적
- **효율적 운영**: 반복 작업 자동화 및 일괄 처리
- **데이터 기반 의사결정**: 심층 분석 및 리포트 제공
- **보안 강화**: 관리자 전용 인증 및 감사 로그

### 1.3 사용자 페르소나

#### Primary: 슈퍼 관리자 (CTO/운영 총괄)
- **역할**: 전체 시스템 관리 및 의사결정
- **필요 기능**: 모든 데이터 접근, 사용자 권한 관리, 시스템 설정
- **사용 시나리오**: 주간 성과 리포트 확인, 이상 징후 감지, 긴급 대응

#### Secondary: 콘텐츠 관리자 (CS/운영팀)
- **역할**: 사용자 지원, 콘텐츠 검토, 신고 처리
- **필요 기능**: 사용자 관리, 명함 검토/삭제, 통계 조회
- **사용 시나리오**: 신고 명함 검토, 사용자 문의 대응, 일일 통계 확인

#### Tertiary: 마케팅 관리자 (Growth/마케팅팀)
- **역할**: 캠페인 관리, 전환율 분석, 프로모션 실행
- **필요 기능**: 사용자 세그먼트 분석, 캠페인 생성, 이메일 발송
- **사용 시나리오**: 신규 프로모션 기획, A/B 테스트 실행, ROI 분석

---

## 2. 시스템 아키텍처

### 2.1 전체 시스템 구조

```
┌───────────────────────────────────────────────────────────┐
│                 Admin Web Application                      │
│              (React 19 + TypeScript + Vite)                │
│                     (admin.g-plat.com)                     │
└────────────────────────┬──────────────────────────────────┘
                         │
                         │ Admin JWT Token (Role-based)
                         │
┌────────────────────────▼──────────────────────────────────┐
│                    Supabase Backend                        │
│                                                            │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │  Admin Auth     │  │  Admin RLS      │                │
│  │  (Separate)     │  │  Policies       │                │
│  └─────────────────┘  └─────────────────┘                │
│                                                            │
│  ┌──────────────────────────────────────┐                │
│  │   Production Database (READ/WRITE)   │                │
│  │   - users, business_cards            │                │
│  │   - sidejob_cards, qr_codes          │                │
│  │   - visitor_stats, payments          │                │
│  │   - admin_logs (NEW)                 │                │
│  └──────────────────────────────────────┘                │
│                                                            │
│  ┌──────────────────────────────────────┐                │
│  │     Admin Edge Functions (Deno)      │                │
│  │   - Bulk operations                  │                │
│  │   - Report generation                │                │
│  │   - SMS/Email automation             │                │
│  └──────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              External Services                            │
│  - Twilio (SMS) │ Aligo (SMS) │ SendGrid (Email)         │
│  - Slack (Alerts) │ Google Analytics │ Sentry            │
└──────────────────────────────────────────────────────────┘
```

### 2.2 데이터베이스 구조 (신규 테이블)

#### **admin_users** (관리자 계정)
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'super_admin', 'content_admin', 'marketing_admin'
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### **admin_logs** (감사 로그)
```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL, -- 'user_update', 'card_delete', 'payment_refund'
  target_table TEXT, -- 'users', 'business_cards', 'payments'
  target_id UUID,
  old_data JSONB, -- 변경 전 데이터
  new_data JSONB, -- 변경 후 데이터
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_user_id, created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action, created_at DESC);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_table, target_id);
```

#### **platform_metrics** (플랫폼 통계 집계)
```sql
CREATE TABLE platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0, -- 7일 내 활동
  new_signups INTEGER DEFAULT 0,
  total_cards INTEGER DEFAULT 0,
  active_cards INTEGER DEFAULT 0,
  total_qr_scans INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  premium_users INTEGER DEFAULT 0,
  business_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 유니크 제약 (날짜별 1개 레코드)
CREATE UNIQUE INDEX idx_platform_metrics_date ON platform_metrics(metric_date);
```

#### **user_reports** (신고 접수)
```sql
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_user_id UUID REFERENCES users(id), -- 신고자
  target_type TEXT NOT NULL, -- 'business_card', 'sidejob_card', 'user'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL, -- '스팸', '부적절한 콘텐츠', '사기'
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'rejected'
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_reports_status ON user_reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON user_reports(target_type, target_id);
```

#### **campaigns** (마케팅 캠페인)
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'email', 'sms', 'push'
  target_segment JSONB, -- 타겟 사용자 조건 (subscription_tier, last_active 등)
  message_template TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'running', 'completed', 'cancelled'
  scheduled_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### **payments** (결제 내역) - Phase 3
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  subscription_tier TEXT NOT NULL, -- 'premium', 'business'
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KRW',
  payment_method TEXT, -- 'card', 'bank_transfer', 'toss'
  payment_provider TEXT, -- 'stripe', 'toss_payments'
  payment_provider_id TEXT, -- 외부 결제 ID
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  billing_period_start DATE,
  billing_period_end DATE,
  refund_amount DECIMAL(10,2),
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status, created_at DESC);
```

### 2.3 기존 테이블 활용
관리자 서비스는 기존 프로덕션 데이터베이스의 모든 테이블을 **읽기 및 제한적 쓰기** 권한으로 접근합니다:

- **users, user_profiles**: 사용자 정보 조회/수정/비활성화
- **business_cards, card_attachments**: 명함 조회/수정/삭제/검토
- **sidejob_cards**: 부가명함 조회/수정/삭제
- **qr_codes, qr_scans**: QR 통계 조회/분석
- **visitor_stats**: 트래픽 분석
- **callback_logs**: SMS 발송 내역 조회

---

## 3. 인증 및 권한 관리

### 3.1 관리자 인증 시스템

#### 3.1.1 별도 인증 체계
- **사용자 앱 (g-plat.com)**: Supabase Auth (일반 사용자)
- **관리자 앱 (admin.g-plat.com)**: Supabase Auth (별도 admin_users 테이블)

#### 3.1.2 인증 흐름
```
1. 관리자 로그인 (admin.g-plat.com/login)
   - 이메일/비밀번호 (초기에는 수동 등록)
   - 2FA (Two-Factor Authentication) 필수

2. JWT 토큰 발급
   - Role 정보 포함 (super_admin, content_admin, marketing_admin)
   - 짧은 만료 시간 (1시간)
   - Refresh token (7일)

3. 모든 API 요청에 JWT 포함
   - Authorization: Bearer {token}
   - RLS 정책에서 admin_role() 함수로 검증
```

#### 3.1.3 2단계 인증 (2FA)
- **필수 대상**: 모든 관리자 (특히 super_admin)
- **방식**: TOTP (Time-based One-Time Password)
- **앱**: Google Authenticator, Authy 등
- **백업 코드**: 10개 제공 (일회용)

### 3.2 역할 기반 접근 제어 (RBAC)

#### 3.2.1 역할 정의

| 역할 | 권한 범위 | 주요 기능 |
|------|----------|----------|
| **super_admin** | 전체 시스템 | 모든 데이터 CRUD, 관리자 계정 관리, 시스템 설정 |
| **content_admin** | 콘텐츠 관리 | 사용자/명함 조회·수정·삭제, 신고 처리, 통계 조회 |
| **marketing_admin** | 마케팅 | 사용자 통계, 캠페인 생성·실행, 세그먼트 분석 |
| **viewer** | 읽기 전용 | 대시보드 조회, 통계 조회 (수정 불가) |

#### 3.2.2 RLS 정책 예시
```sql
-- 예시: business_cards 테이블 관리자 접근
CREATE POLICY "admin_full_access_cards"
ON business_cards
FOR ALL
TO authenticated
USING (
  auth.jwt()->>'role' IN ('super_admin', 'content_admin')
);

-- 예시: payments 테이블 (super_admin만 접근)
CREATE POLICY "super_admin_payments"
ON payments
FOR ALL
TO authenticated
USING (
  auth.jwt()->>'role' = 'super_admin'
);
```

### 3.3 IP 화이트리스트 (선택적)
- **목적**: 추가 보안 계층
- **방식**: Supabase Edge Function에서 IP 검증
- **대상**: 프로덕션 환경 관리자 액세스
- **허용 IP 목록**: 관리자 사무실 IP, VPN IP 등

---

## 4. 핵심 기능 상세

### 4.1 대시보드 (Dashboard)

#### 4.1.1 메인 대시보드
**목적**: 플랫폼 전체 현황 한눈에 파악

**핵심 지표 카드** (4개, 상단 배치)
1. **총 가입자 수**
   - 전체 사용자 수
   - 전일 대비 증감 (+/- %)
   - 클릭 시 상세 사용자 목록 페이지로 이동

2. **활성 사용자 (7일)**
   - 최근 7일 내 로그인/활동 사용자
   - DAU (Daily Active Users) 트렌드 차트
   - 전주 대비 증감률

3. **총 명함 수**
   - 활성 명함 vs 비활성 명함
   - 테마별 분포 (Trendy, Apple, Professional 등)
   - 클릭 시 명함 관리 페이지로 이동

4. **이번 달 매출** (Phase 3)
   - 구독 매출 (Premium + Business)
   - 전월 대비 증감률
   - 클릭 시 매출 상세 페이지로 이동

**실시간 차트** (중앙 배치)
1. **일별 신규 가입자 추이** (30일)
   - 라인 차트 (Recharts)
   - 이메일 가입 vs 소셜 로그인 분리 표시

2. **명함 조회수 TOP 10**
   - 바 차트 (가로)
   - 명함 제목, 조회수, 사용자명 표시

3. **QR 스캔 통계** (7일)
   - 일별 스캔 수 (라인 차트)
   - 디바이스 비율 (파이 차트: 모바일/태블릿/데스크톱)

**최근 활동 로그** (하단)
- 테이블 형식
- 최근 50개 활동 표시
- 컬럼: 시간, 관리자, 액션, 대상, 상태
- 실시간 업데이트 (Supabase Realtime)

#### 4.1.2 필터 및 기간 선택
- **기간 선택**: 오늘, 어제, 최근 7일, 최근 30일, 최근 90일, 커스텀
- **새로고침**: 자동 (30초마다) / 수동
- **Export**: CSV, PDF 다운로드

---

### 4.2 사용자 관리 (User Management)

#### 4.2.1 사용자 목록
**레이아웃**: 테이블 형식 (페이지네이션 50개)

**컬럼**:
- 프로필 사진 (썸네일)
- 이름
- 이메일
- 가입일
- 구독 등급 (FREE/PREMIUM/BUSINESS 배지)
- 최근 활동일
- 명함 수
- 상태 (활성/비활성/정지)
- 액션 (상세보기, 수정, 비활성화)

**검색 및 필터**:
- **검색**: 이름, 이메일, 전화번호
- **필터**:
  - 구독 등급: 전체, FREE, PREMIUM, BUSINESS
  - 상태: 전체, 활성, 비활성, 정지
  - 가입일: 날짜 범위 선택
  - 최근 활동: 최근 7일, 30일, 90일, 비활성 사용자
- **정렬**: 가입일, 최근 활동일, 명함 수, 이름

**일괄 작업**:
- 다중 선택 (체크박스)
- 일괄 이메일 발송
- 일괄 구독 등급 변경 (프로모션용)
- 일괄 계정 비활성화 (스패머 처리)

#### 4.2.2 사용자 상세 페이지
**탭 구성**:

**1) 기본 정보**
- 프로필 사진, 이름, 이메일, 전화번호
- 가입일, 최근 활동일, 로그인 횟수
- 구독 등급 (드롭다운 변경 가능)
- 계정 상태 (토글: 활성/비활성)
- **관리자 메모**: 텍스트 에리어 (내부용)

**2) 명함 목록**
- 사용자가 생성한 모든 명함 (활성/비활성 포함)
- 각 명함: 썸네일, 제목, 테마, 조회수, 생성일
- 액션: 미리보기, 수정, 삭제

**3) 부가명함 목록**
- 사용자의 부가명함 전체
- 카테고리, 제목, 클릭수, 상태
- 액션: 미리보기, 수정, 삭제

**4) QR 코드 목록**
- 사용자가 생성한 QR 코드
- Short code, 타겟 URL, 스캔 수, 생성일
- 액션: QR 이미지 다운로드, 통계 보기

**5) 활동 로그**
- 최근 100개 활동 (페이지네이션)
- 로그인, 명함 생성/수정, QR 스캔 등
- 테이블: 시간, 액션, IP, 디바이스

**6) 결제 내역** (Phase 3)
- 모든 결제 내역
- 날짜, 구독 등급, 금액, 결제 수단, 상태
- 환불 처리 버튼 (super_admin만)

**액션 버튼**:
- 사용자에게 이메일 발송
- 구독 등급 변경
- 계정 비활성화/정지
- 데이터 export (GDPR 대응)

#### 4.2.3 사용자 비활성화/정지
**비활성화** (Deactivate):
- 사용자 요청 또는 관리자 판단
- 로그인 불가, 명함은 비공개 처리
- 복구 가능

**정지** (Suspend):
- 규정 위반 (스팸, 사기, 부적절한 콘텐츠)
- 로그인 불가, 모든 명함 비공개
- 정지 사유 기록 필수
- 복구 시 관리자 승인 필요

---

### 4.3 명함 관리 (Card Management)

#### 4.3.1 명함 목록
**레이아웃**: 그리드 뷰 (썸네일) + 테이블 뷰 전환 가능

**그리드 뷰**:
- 명함 썸네일 (프로필 이미지)
- 제목, 사용자명
- 조회수, 생성일
- 상태 배지 (활성/비활성)
- 호버 시 미리보기, 수정, 삭제 버튼

**테이블 뷰 컬럼**:
- 썸네일, 제목, 사용자명, 테마, 조회수, QR 스캔 수, 생성일, 상태, 액션

**검색 및 필터**:
- **검색**: 명함 제목, 사용자 이름/이메일
- **필터**:
  - 테마: 전체, Trendy, Apple, Professional, Simple, Default
  - 상태: 전체, 활성, 비활성
  - 생성일: 날짜 범위
  - 조회수: 낮은순/높은순
  - 부가명함 포함 여부
- **정렬**: 생성일, 조회수, 최근 수정일

**일괄 작업**:
- 일괄 활성화/비활성화
- 일괄 테마 변경
- 일괄 삭제 (주의)

#### 4.3.2 명함 상세 페이지
**섹션 구성**:

**1) 명함 미리보기**
- 실제 명함 렌더링 (선택한 테마 적용)
- 반응형 프레임 (모바일/데스크톱 전환)
- 새 탭에서 열기 버튼

**2) 기본 정보**
- 제목, 사용자명, 회사, 직급
- 연락처 (전화, 이메일, 주소)
- SNS 링크 (LinkedIn, Instagram 등)
- 커스텀 URL
- 테마 (드롭다운 변경 가능)

**3) 통계**
- 총 조회수 (일별 차트)
- QR 스캔 수 (일별 차트)
- 유입 경로 (Referrer 분석)
- 디바이스 비율 (파이 차트)

**4) 부가명함 연결**
- 연결된 부가명함 목록
- 썸네일, 제목, 카테고리, 클릭수
- 추가/제거 가능

**5) 첨부파일**
- 파일 목록 (PDF, 이미지, YouTube)
- 다운로드, 미리보기, 삭제

**6) 활동 로그**
- 명함 생성, 수정, 조회 이벤트
- 관리자 액션 (수정, 삭제 등)

**액션 버튼**:
- 수정 (관리자 전용 편집 모드)
- 활성화/비활성화 토글
- 삭제 (soft delete: is_deleted=true)
- QR 코드 다운로드
- 명함 export (PDF)

#### 4.3.3 신고된 명함 처리
**신고 목록 탭**:
- 필터: 대기 중, 검토 중, 해결됨, 기각됨
- 테이블: 신고자, 신고 대상 명함, 신고 사유, 신고일, 상태

**신고 상세 페이지**:
- 신고 사유 및 설명
- 신고 대상 명함 미리보기
- 액션:
  - 명함 비활성화
  - 사용자 경고 이메일 발송
  - 사용자 계정 정지
  - 신고 기각 (부적절한 신고)
- 해결 노트 작성 (관리자 코멘트)

---

### 4.4 부가명함 관리 (SideJob Cards Management)

#### 4.4.1 부가명함 목록
**레이아웃**: 그리드 뷰 (이미지 중심)

**카드 정보**:
- 이미지 썸네일
- 제목, 사용자명
- 카테고리 배지 (Primary + Secondary)
- 가격, 배지 (HOT, NEW, SALE)
- 클릭수, 상태

**검색 및 필터**:
- **검색**: 제목, 사용자명
- **필터**:
  - Primary 카테고리: 쇼핑/판매, 교육/콘텐츠, 서비스/예약 등
  - Secondary 카테고리: 세부 카테고리
  - 배지: HOT, NEW, SALE
  - 상태: 활성/비활성
  - 유효기간: 진행 중, 만료 임박, 만료됨
- **정렬**: 생성일, 클릭수, 유효기간

#### 4.4.2 부가명함 상세 페이지
**섹션 구성**:
- 이미지 미리보기
- 제목, 설명, 가격
- 카테고리, 배지, 유효기간
- CTA 텍스트 및 링크
- 연결된 명함 목록
- 통계 (조회수, 클릭수, 전환율)

**액션 버튼**:
- 수정
- 활성화/비활성화
- 삭제

---

### 4.5 QR 코드 관리 (QR Code Management)

#### 4.5.1 QR 코드 목록
**테이블 뷰**:
- Short code
- 타겟 URL
- 캠페인명
- 총 스캔 수
- 고유 방문자 수
- 생성일, 만료일
- 상태 (활성/만료/비활성)

**검색 및 필터**:
- Short code, 캠페인명 검색
- 필터: 상태, 만료 여부, 생성일
- 정렬: 스캔 수, 생성일

#### 4.5.2 QR 코드 상세 페이지
**섹션 구성**:

**1) QR 코드 이미지**
- PNG 다운로드
- 다양한 사이즈 (128x128, 256x256, 512x512)

**2) 스캔 통계**
- 총 스캔 수 (일별 차트)
- 고유 방문자 수
- 디바이스 비율 (모바일/태블릿/데스크톱)
- 브라우저 분포
- 국가별 분포 (지도 시각화)

**3) 스캔 로그**
- 최근 100개 스캔 이벤트
- 테이블: 시간, 디바이스, 브라우저, OS, IP, Referrer

**4) 설정**
- 타겟 URL 변경
- 캠페인명 수정
- 최대 스캔 수 설정
- 만료일 설정
- 활성화/비활성화 토글

---

### 4.6 통계 및 분석 (Analytics)

#### 4.6.1 사용자 분석
**섹션**:
1. **신규 가입자 추이**
   - 일별/주별/월별 차트
   - 가입 경로 분석 (이메일, Google, Kakao 등)

2. **활성 사용자 분석**
   - DAU, WAU, MAU 트렌드
   - 리텐션 코호트 분석 (7일, 30일 리텐션)

3. **구독 등급 분포**
   - FREE vs PREMIUM vs BUSINESS (파이 차트)
   - 구독 전환율 (Funnel 차트)

4. **지역별 분포**
   - 시/도별 사용자 수 (지도 시각화)

#### 4.6.2 명함 분석
**섹션**:
1. **명함 생성 추이**
   - 일별/주별/월별 차트
   - 평균 명함 수 per 사용자

2. **테마 선호도**
   - 테마별 명함 수 (바 차트)
   - 테마별 평균 조회수

3. **조회수 분석**
   - TOP 100 명함 (조회수 기준)
   - 조회수 분포 (히스토그램)

#### 4.6.3 QR 코드 분석
**섹션**:
1. **스캔 추이**
   - 일별/주별/월별 스캔 수 (라인 차트)

2. **디바이스 분석**
   - 모바일 vs 태블릿 vs 데스크톱 (파이 차트)
   - 브라우저 분포

3. **지역별 스캔**
   - 국가별, 도시별 스캔 수

#### 4.6.4 매출 분석 (Phase 3)
**섹션**:
1. **월별 매출**
   - 월별 매출 추이 (바 차트)
   - 구독 등급별 매출 비율

2. **구독 지표**
   - 신규 구독자 수
   - 해지율 (Churn Rate)
   - LTV (Lifetime Value) 추정

3. **환불 분석**
   - 환불 건수, 환불 금액
   - 환불 사유 분석

---

### 4.7 마케팅 캠페인 (Marketing Campaigns)

#### 4.7.1 캠페인 목록
**테이블 뷰**:
- 캠페인명
- 타입 (이메일/SMS/푸시)
- 타겟 세그먼트 (사용자 수)
- 상태 (Draft/Scheduled/Running/Completed)
- 발송 수, 오픈율, 클릭률
- 생성일, 예약일

**액션**:
- 새 캠페인 생성
- 수정, 복제, 삭제

#### 4.7.2 캠페인 생성 페이지
**단계별 마법사 (Wizard)**:

**Step 1: 캠페인 정보**
- 캠페인명
- 캠페인 타입 (이메일/SMS/푸시)
- 목적 (프로모션, 공지사항, 재참여 유도 등)

**Step 2: 타겟 세그먼트 선택**
- **조건 빌더** (쿼리 빌더 UI):
  - 구독 등급: FREE, PREMIUM, BUSINESS
  - 최근 활동일: 7일 이내, 30일 이내, 90일 이내, 비활성 사용자
  - 가입일: 날짜 범위
  - 명함 수: 0개, 1개, 2개 이상
  - 지역: 특정 시/도
- **실시간 사용자 수 계산**
- **미리보기**: 조건에 맞는 샘플 사용자 10명 표시

**Step 3: 메시지 작성**
- **템플릿 선택**: 기본 템플릿 5개 제공
- **제목** (이메일용)
- **본문**: 리치 텍스트 에디터
  - 변수 삽입: `{{name}}`, `{{email}}`, `{{company}}`
  - 버튼 삽입 (CTA)
- **SMS 메시지**: 최대 90자 (LMS는 2000자)
- **미리보기**: 실제 렌더링 화면

**Step 4: 발송 설정**
- **즉시 발송** vs **예약 발송** (날짜/시간 선택)
- **테스트 발송**: 관리자 이메일로 샘플 전송

**Step 5: 검토 및 발송**
- 모든 설정 요약
- 예상 발송 수
- 최종 확인 후 발송 또는 저장

#### 4.7.3 캠페인 상세 페이지
**섹션**:
1. **기본 정보**: 캠페인명, 타입, 타겟 조건, 발송일
2. **성과 지표**:
   - 발송 수
   - 오픈율 (이메일)
   - 클릭률 (CTR)
   - 전환율 (목표 액션 완료)
3. **수신자 목록**: 발송 대상 사용자 리스트
4. **오픈/클릭 로그**: 이벤트 타임라인

**액션**:
- 캠페인 일시정지/재개
- 캠페인 종료
- 캠페인 복제

---

### 4.8 콜백 자동화 관리 (Callback Automation) - Phase 3

#### 4.8.1 콜백 로그 목록
**테이블 뷰**:
- 사용자명, 수신자 전화번호
- 메시지 내용 (요약)
- 발송 상태 (PENDING/SENT/FAILED)
- 발송 시간
- 에러 메시지 (실패 시)

**검색 및 필터**:
- 사용자명, 전화번호 검색
- 상태 필터
- 날짜 범위

#### 4.8.2 콜백 통계
**섹션**:
1. **일별 발송량**: 라인 차트
2. **성공률**: 성공 vs 실패 (파이 차트)
3. **실패 사유 분석**: 번호 오류, API 에러 등
4. **TOP 사용자**: 콜백 발송 많이 사용하는 사용자

---

### 4.9 시스템 설정 (System Settings)

#### 4.9.1 플랫폼 설정
**섹션**:
1. **일반 설정**
   - 서비스 이름, 로고
   - 기본 언어
   - 기본 타임존

2. **회원가입 설정**
   - 소셜 로그인 활성화/비활성화 (Google, Kakao, Apple)
   - 이메일 인증 필수 여부
   - 기본 구독 등급

3. **구독 설정** (Phase 3)
   - 구독 등급별 요금
   - 구독 혜택 설정
   - 무료 체험 기간

4. **제한 설정**
   - FREE: 명함 1개, 부가명함 3개, QR 스캔 제한 없음
   - PREMIUM: 명함 3개, 부가명함 무제한
   - BUSINESS: 명함 10개, 부가명함 무제한, 팀 기능

#### 4.9.2 API 키 관리
**외부 서비스 연동**:
- **SMS API**: Twilio, Aligo
  - API Key, Secret 입력
  - 연결 테스트 버튼
- **Email API**: SendGrid, AWS SES
- **결제 API**: Stripe, Toss Payments
- **Monitoring**: Sentry, Google Analytics

#### 4.9.3 관리자 계정 관리 (super_admin만)
**관리자 목록**:
- 이름, 이메일, 역할, 최근 로그인
- 추가, 수정, 비활성화

**새 관리자 추가**:
- 이메일, 이름, 역할 선택
- 초기 비밀번호 자동 생성 (이메일 발송)
- 2FA 설정 안내

---

### 4.10 감사 로그 (Audit Logs)

#### 4.10.1 로그 목록
**테이블 뷰** (페이지네이션 100개):
- 시간
- 관리자명
- 액션 (user_update, card_delete, payment_refund 등)
- 대상 (테이블명, ID)
- 변경 내역 (old_data vs new_data)
- IP 주소

**검색 및 필터**:
- 관리자명, 액션 검색
- 날짜 범위
- 대상 테이블

**Export**:
- CSV 다운로드 (보안 감사용)

#### 4.10.2 로그 상세 페이지
- 전체 변경 내역 (JSON diff)
- 관리자 정보
- 시간, IP, User-Agent

---

### 4.11 신고 관리 (Report Management)

#### 4.11.1 신고 목록
**테이블 뷰**:
- 신고 대상 (명함/부가명함/사용자)
- 신고자
- 신고 사유 (스팸, 부적절한 콘텐츠, 사기 등)
- 상태 (Pending/Reviewing/Resolved/Rejected)
- 신고일
- 담당자

**필터**:
- 상태, 신고 사유, 날짜 범위

#### 4.11.2 신고 처리 페이지
**섹션**:
1. **신고 정보**: 신고자, 사유, 설명
2. **신고 대상 미리보기**: 명함 렌더링 또는 부가명함 이미지
3. **처리 옵션**:
   - 콘텐츠 삭제
   - 콘텐츠 비활성화
   - 사용자에게 경고
   - 사용자 계정 정지
   - 신고 기각 (부적절한 신고)
4. **해결 노트**: 관리자 코멘트 작성

**액션**:
- 처리 완료 버튼
- 신고자에게 이메일 알림 (선택)

---

## 5. 향후 개발 영역

### 5.1 Phase 3: 고급 기능 (3개월 후)

#### 5.1.1 결제 및 구독 관리
**기능**:
- **결제 내역 조회**: 모든 결제 트랜잭션 조회
- **환불 처리**: 관리자 승인 환불 (Stripe/Toss API 연동)
- **구독 변경**: 관리자가 수동으로 구독 등급 변경 (프로모션용)
- **결제 실패 알림**: 결제 실패 사용자 자동 알림
- **인보이스 관리**: 세금계산서 발행 및 관리

**필요 테이블**:
- `payments` (위에서 정의)
- `invoices` (세금계산서)
- `refunds` (환불 내역)

#### 5.1.2 한글 도메인 (.한국) 관리
**기능**:
- **도메인 신청 목록**: 사용자가 신청한 도메인 조회
- **도메인 승인/거부**: 관리자 검토 후 승인
- **가비아 API 연동**: 자동 도메인 등록 및 DNS 설정
- **도메인 만료 알림**: 갱신 필요 도메인 관리

**필요 테이블**:
```sql
CREATE TABLE korean_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  domain_name TEXT UNIQUE NOT NULL, -- e.g., "김대리.한국"
  punycode TEXT, -- ASCII 인코딩 도메인
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'active', 'expired'
  gabia_domain_id TEXT, -- 가비아 도메인 ID
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5.1.3 콜백 SMS 자동화
**기능**:
- **SMS 템플릿 관리**: 관리자가 기본 템플릿 생성/수정
- **발송량 모니터링**: 일별/월별 SMS 발송량 추적
- **비용 추적**: SMS 발송 비용 계산 (Twilio/Aligo)
- **블랙리스트 관리**: 수신 거부 번호 관리

**필요 테이블**:
- `callback_logs` (이미 존재)
- `sms_templates` (템플릿)
- `sms_blacklist` (수신 거부)

#### 5.1.4 고급 CRM 기능
**기능**:
- **고객 세그먼트 저장**: 자주 사용하는 타겟 조건 저장
- **자동화 워크플로우**: 트리거 기반 이메일/SMS 자동 발송
  - 예: 신규 가입 7일 후 자동 이메일
  - 예: 명함 조회수 100회 달성 시 축하 메시지
- **리드 스코어링**: 사용자 활동 기반 점수 계산

**필요 테이블**:
```sql
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  conditions JSONB NOT NULL, -- 세그먼트 조건
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE automation_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'signup', 'card_created', 'view_count'
  trigger_conditions JSONB,
  action_type TEXT NOT NULL, -- 'email', 'sms'
  action_template_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 5.2 Phase 4: AI 및 고급 분석 (6개월 후)

#### 5.2.1 AI 기반 콘텐츠 검토
**기능**:
- 명함/부가명함 이미지 자동 스캔 (부적절한 콘텐츠 감지)
- 텍스트 스팸 필터링 (제목, 설명)
- 의심스러운 활동 패턴 감지 (봇 탐지)

**기술**:
- Google Cloud Vision API (이미지 분석)
- OpenAI Moderation API (텍스트 분석)

#### 5.2.2 예측 분석 (Predictive Analytics)
**기능**:
- 이탈 가능성 예측 (Churn Prediction)
- 구독 전환 가능성 (Conversion Prediction)
- LTV (Lifetime Value) 예측

**기술**:
- Python + Scikit-learn
- Supabase Edge Function (ML 모델 호스팅)

#### 5.2.3 A/B 테스트 플랫폼
**기능**:
- 이메일 캠페인 A/B 테스트
- 랜딩 페이지 A/B 테스트
- 구독 요금제 A/B 테스트

**필요 테이블**:
```sql
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  variant_a JSONB,
  variant_b JSONB,
  traffic_split INTEGER DEFAULT 50, -- 50% A, 50% B
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  winner TEXT, -- 'A', 'B', or NULL
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 5.3 Phase 5: 팀 협업 및 다중 관리자 (9개월 후)

#### 5.3.1 팀 관리
**기능**:
- Business 구독 사용자의 팀 관리
- 팀원 초대 및 권한 부여
- 팀 내 명함 공유

**필요 테이블**:
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_user_id UUID REFERENCES users(id),
  subscription_tier TEXT DEFAULT 'business',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL, -- 'owner', 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5.3.2 관리자 협업 기능
**기능**:
- 신고 건 할당 시스템 (담당자 지정)
- 관리자 간 메모/코멘트 공유
- 작업 대기열 (Task Queue)

---

## 6. 기술 스택

### 6.1 Frontend

#### 6.1.1 프레임워크
- **React 19**: React Compiler 1.0 활용 (자동 메모이제이션)
- **TypeScript 5.8**: 타입 안정성
- **Vite 7**: 빠른 빌드 및 HMR

#### 6.1.2 UI 라이브러리
- **Tailwind CSS 3**: 유틸리티 퍼스트 스타일링
- **shadcn/ui**: 재사용 가능한 컴포넌트
- **Recharts**: 차트 및 데이터 시각화
- **React Table v8**: 고급 테이블 기능 (정렬, 필터, 페이지네이션)
- **React Hook Form**: 폼 관리
- **Zod**: 스키마 검증

#### 6.1.3 상태 관리
- **Zustand**: 전역 상태 관리
- **React Query (TanStack Query)**: 서버 상태 관리 및 캐싱

#### 6.1.4 라우팅
- **React Router v7**: 클라이언트 사이드 라우팅

### 6.2 Backend

#### 6.2.1 Supabase 서비스
- **Database**: PostgreSQL (프로덕션 DB 공유)
- **Auth**: JWT 기반 관리자 인증 (별도 admin_users)
- **Realtime**: 실시간 대시보드 업데이트
- **Edge Functions**: 일괄 작업, 리포트 생성, SMS/이메일 발송
- **Storage**: 이미지, PDF 파일 저장 (기존 buckets 공유)

#### 6.2.2 Edge Functions (신규)
- **admin-bulk-operations**: 일괄 사용자 업데이트, 일괄 이메일 발송
- **admin-report-generator**: CSV/PDF 리포트 생성
- **admin-sms-sender**: Twilio/Aligo SMS 발송
- **admin-email-sender**: SendGrid 이메일 발송

### 6.3 인프라

#### 6.3.1 호스팅
- **Vercel**: 별도 프로젝트로 배포 (admin.g-plat.com)
- **DNS**: Cloudflare (admin 서브도메인 설정)

#### 6.3.2 모니터링
- **Sentry**: 에러 추적 (관리자 앱 전용 프로젝트)
- **Google Analytics**: 관리자 활동 추적 (선택적)
- **Supabase Logs**: Edge Function 로그 모니터링

### 6.4 외부 서비스

#### 6.4.1 SMS
- **Twilio**: 국제 SMS
- **Aligo**: 국내 SMS (더 저렴한 요금)

#### 6.4.2 Email
- **SendGrid**: 트랜잭션 이메일 및 마케팅 캠페인 이메일 (주 서비스)
  - Phase 1-2: Free 플랜 (일 100개)
  - Phase 3: Essentials 플랜 ($15/월, 월 50,000 이메일)
- **Supabase Auth**: 회원가입 인증 이메일 (내장 기능)

#### 6.4.3 결제 (Phase 3)
- **Stripe**: 국제 결제
- **Toss Payments**: 국내 결제

#### 6.4.4 알림
- **Slack Webhook**: 긴급 알림 (시스템 장애, 급증 트래픽 등)

---

## 7. 보안 요구사항

### 7.1 인증 보안

#### 7.1.1 2단계 인증 (2FA)
- **필수**: 모든 관리자 계정
- **방식**: TOTP (Google Authenticator)
- **백업 코드**: 10개 제공

#### 7.1.2 세션 관리
- **JWT 만료 시간**: 1시간
- **Refresh Token 만료**: 7일
- **자동 로그아웃**: 30분 비활성 시

#### 7.1.3 비밀번호 정책
- **최소 길이**: 12자
- **복잡도**: 대문자, 소문자, 숫자, 특수문자 포함
- **주기적 변경**: 90일마다 권장

### 7.2 데이터 접근 제어

#### 7.2.1 RLS 정책
- 모든 테이블에 관리자 전용 RLS 정책 적용
- `auth.jwt()->>'role'`로 역할 검증

#### 7.2.2 민감 데이터 마스킹
- **전화번호**: 뒤 4자리만 표시 (010-****-1234)
- **이메일**: 앞 3자만 표시 (abc***@example.com)
- **IP 주소**: 마지막 옥텟 마스킹 (192.168.1.***)

### 7.3 감사 로그

#### 7.3.1 로그 기록 대상
- 모든 데이터 변경 (INSERT, UPDATE, DELETE)
- 사용자 계정 변경 (비활성화, 구독 변경)
- 결제 환불 처리
- 민감 데이터 조회 (사용자 상세 페이지)

#### 7.3.2 로그 저장
- `admin_logs` 테이블에 영구 저장
- 변경 전/후 데이터 JSON 저장
- 최소 3년 보관 (법적 요구사항)

### 7.4 네트워크 보안

#### 7.4.1 HTTPS 필수
- 모든 요청 HTTPS 강제 (Vercel 자동 적용)
- HSTS (HTTP Strict Transport Security) 헤더

#### 7.4.2 CORS 설정
- 관리자 도메인만 허용 (admin.g-plat.com)
- OPTIONS preflight 요청 처리

#### 7.4.3 Rate Limiting
- Edge Function에 Rate Limiting 적용
- IP당 분당 100 요청 제한

---

## 8. 개발 로드맵

### 8.1 Phase 1: 기본 관리자 시스템 (1개월)

#### Week 1-2: 프로젝트 셋업
- [ ] React 19 + Vite 프로젝트 생성
- [ ] Supabase 연동 (별도 admin_users 인증)
- [ ] 관리자 로그인 페이지 구현
- [ ] 2FA 인증 구현 (TOTP)
- [ ] 기본 레이아웃 (사이드바, 헤더)

#### Week 3: 대시보드
- [ ] 메인 대시보드 UI 구현
- [ ] 핵심 지표 카드 (사용자 수, 명함 수, 활성 사용자)
- [ ] 일별 신규 가입자 차트 (Recharts)
- [ ] 실시간 활동 로그 (Supabase Realtime)

#### Week 4: 사용자 관리
- [ ] 사용자 목록 페이지 (React Table)
- [ ] 검색 및 필터 기능
- [ ] 사용자 상세 페이지 (탭 구조)
- [ ] 사용자 비활성화/정지 기능

---

### 8.2 Phase 2: 콘텐츠 관리 (1개월)

#### Week 5: 명함 관리
- [ ] 명함 목록 페이지 (그리드 뷰 + 테이블 뷰)
- [ ] 명함 검색 및 필터
- [ ] 명함 상세 페이지 (미리보기 포함)
- [ ] 명함 수정/삭제 기능

#### Week 6: 부가명함 및 QR 관리
- [ ] 부가명함 목록 및 상세 페이지
- [ ] QR 코드 목록 및 통계
- [ ] QR 스캔 로그 조회

#### Week 7: 신고 관리
- [ ] 신고 목록 페이지
- [ ] 신고 처리 워크플로우
- [ ] 신고 해결 및 알림

#### Week 8: 통계 및 분석
- [ ] 사용자 분석 페이지
- [ ] 명함 분석 페이지
- [ ] QR 코드 분석 페이지
- [ ] Export 기능 (CSV/PDF)

---

### 8.3 Phase 3: 마케팅 및 자동화 (1개월)

#### Week 9: 마케팅 캠페인
- [ ] 캠페인 목록 페이지
- [ ] 캠페인 생성 마법사 (5단계)
- [ ] 타겟 세그먼트 빌더
- [ ] 이메일 템플릿 에디터

#### Week 10: SMS 자동화
- [ ] 콜백 로그 조회 페이지
- [ ] SMS 템플릿 관리
- [ ] SMS 블랙리스트 관리

#### Week 11: 시스템 설정
- [ ] 플랫폼 설정 페이지
- [ ] API 키 관리
- [ ] 관리자 계정 관리

#### Week 12: 감사 로그 및 배포
- [ ] 감사 로그 페이지
- [ ] 로그 검색 및 필터
- [ ] Vercel 프로덕션 배포
- [ ] 관리자 매뉴얼 작성

---

### 8.4 Phase 4: 결제 및 고급 기능 (Phase 3와 병행)

#### Week 13-14: 결제 관리
- [ ] 결제 내역 조회
- [ ] 환불 처리 기능
- [ ] 인보이스 관리
- [ ] 구독 통계

#### Week 15-16: 한글 도메인 관리
- [ ] 도메인 신청 목록
- [ ] 가비아 API 연동
- [ ] 도메인 승인/거부 워크플로우

---

## 9. 추가 고려사항

### 9.1 성능 최적화

#### 9.1.1 프론트엔드
- **Code Splitting**: React.lazy로 페이지별 지연 로딩
- **React Compiler 2.0**: 자동 메모이제이션
- **Virtual Scrolling**: 긴 리스트 최적화 (React Virtual)
- **이미지 최적화**: WebP 포맷, Lazy loading

#### 9.1.2 백엔드
- **Database Indexing**: 모든 쿼리 최적화 (위에서 정의한 인덱스)
- **Connection Pooling**: Supabase Pooler 사용
- **Caching**: React Query 클라이언트 캐싱 (초기), Redis (Phase 4)
- **Edge Function Cold Start**: 주기적 warm-up

### 9.5 이메일 서비스 전략

#### 9.5.1 서비스 역할 분리
- **Supabase Auth (내장)**:
  - 회원가입 인증 이메일
  - 비밀번호 재설정 이메일
  - 설정: Supabase Dashboard에서 템플릿 관리

- **SendGrid**:
  - 관리자 알림 (신고 접수, 시스템 알림)
  - 마케팅 캠페인 (Phase 3)
  - 사용자 커뮤니케이션 (공지사항, 이벤트)

#### 9.5.2 구현 가이드
```typescript
// 1) Supabase Auth 이메일 (자동 발송)
// supabase/config.toml에서 템플릿 설정

[auth.email]
enable_signup = true
enable_confirmations = true

// 2) SendGrid 관리자 알림
// supabase/functions/send-admin-alert/index.ts
const sendAdminAlert = async (type: string, data: any) => {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: 'admin@g-plat.com' }] }],
      from: { email: 'noreply@g-plat.com' },
      subject: `[G-PLAT Admin] ${type}`,
      content: [{ type: 'text/plain', value: JSON.stringify(data) }],
    }),
  });
};
```

#### 9.5.3 비용 최적화
| 단계 | Supabase Auth | SendGrid | 월 총 비용 |
|------|--------------|----------|-----------|
| Phase 1-2 | 포함 (무료) | Free (일 100개) | $0 |
| Phase 3 | 포함 (무료) | Essentials ($15) | $15 |
| Scale-up | 포함 (무료) | Pro ($60+) | $60+ |

### 9.2 접근성 (Accessibility)

- **WCAG 2.1 Level AA 준수**
- **키보드 네비게이션**: 모든 기능 키보드로 접근 가능
- **스크린 리더 지원**: ARIA 레이블 적용
- **색상 대비**: 4.5:1 이상

### 9.3 다국어 지원 (i18n)

- **초기**: 한국어만 지원
- **Phase 4**: 영어 추가 (react-i18next)

### 9.4 모바일 대응

- **초기**: 데스크톱 우선
- **Phase 4**: 모바일 반응형 UI 개선

---

## 10. 예상 비용

### 10.1 인프라 비용 (월)

| 항목 | 비용 | 비고 |
|------|------|------|
| Vercel (Admin) | $20 | Pro 플랜 (기존 사용자 앱과 별도) |
| Supabase | $0 | 기존 Pro 플랜 공유 (추가 비용 없음) |
| SendGrid | $0-15 | Free (Phase 1-2) → Essentials (Phase 3) |
| Twilio/Aligo | 변동 | 사용량 기반 (SMS 발송량에 따름) |
| Sentry | $26 | Team 플랜 (관리자 앱 전용) |
| **총계** | **$46-61/월** | SMS 제외 |

### 10.2 개발 비용 (예상)

| Phase | 기간 | 개발자 | 예상 비용 |
|-------|------|--------|----------|
| Phase 1 | 1개월 | 풀스택 1명 | ₩5,000,000 |
| Phase 2 | 1개월 | 풀스택 1명 | ₩5,000,000 |
| Phase 3 | 1개월 | 풀스택 1명 + 디자이너 0.5명 | ₩7,000,000 |
| Phase 4 | 1개월 | 풀스택 1명 | ₩5,000,000 |
| **총계** | **4개월** | - | **₩22,000,000** |

---

## 11. 리스크 및 대응방안

### 11.1 기술적 리스크

| 리스크 | 영향도 | 발생가능성 | 대응방안 |
|--------|--------|------------|----------|
| Supabase RLS 복잡도 | 중간 | 중간 | 철저한 테스트, 단순화된 정책 설계 |
| 대용량 데이터 처리 | 높음 | 낮음 | Pagination, Background jobs (Edge Functions) |
| 관리자 인증 보안 | 매우 높음 | 낮음 | 2FA 필수, IP 화이트리스트, 감사 로그 |

### 11.2 운영 리스크

| 리스크 | 영향도 | 발생가능성 | 대응방안 |
|--------|--------|------------|----------|
| 관리자 계정 탈취 | 매우 높음 | 낮음 | 2FA, 이상 로그인 감지, 자동 알림 |
| 실수로 데이터 삭제 | 높음 | 중간 | Soft delete, 휴지통 기능, 삭제 확인 모달 |
| 관리자 권한 남용 | 중간 | 낮음 | 감사 로그, 정기적 리뷰 |

---

## 12. 체크리스트

### 12.1 개발 전 준비사항
- [ ] Figma 디자인 시안 작성
- [ ] 관리자 계정 역할 정의 확정
- [ ] Supabase admin_users 테이블 스키마 리뷰
- [ ] 2FA 라이브러리 선택 (Speakeasy.js 등)
- [ ] admin.g-plat.com DNS 설정

### 12.2 Phase 1 완료 체크리스트
- [ ] 관리자 로그인 및 2FA 동작
- [ ] 대시보드 핵심 지표 표시
- [ ] 사용자 목록 및 검색 기능 동작
- [ ] 사용자 상세 페이지 접근 가능
- [ ] Vercel 프로덕션 배포 완료
- [ ] Sentry 에러 추적 활성화

### 12.3 Phase 2 완료 체크리스트
- [ ] 명함 목록 및 미리보기 동작
- [ ] 부가명함 관리 기능 동작
- [ ] QR 코드 통계 조회 가능
- [ ] 신고 처리 워크플로우 동작
- [ ] 통계 페이지 차트 렌더링
- [ ] CSV/PDF Export 기능 동작

### 12.4 Phase 3 완료 체크리스트
- [ ] 마케팅 캠페인 생성 및 발송 동작
- [ ] 타겟 세그먼트 빌더 동작
- [ ] SMS 발송 기능 동작 (Twilio/Aligo)
- [ ] 시스템 설정 변경 가능
- [ ] 감사 로그 기록 및 조회 가능
- [ ] 관리자 계정 추가/삭제 가능

---

## 13. 결론

G-PLAT 관리자 웹 서비스는 플랫폼 운영의 핵심 도구로, 사용자 관리, 콘텐츠 검토, 마케팅 캠페인, 시스템 모니터링을 통합한 종합 관리 대시보드입니다.

### 핵심 가치
1. **실시간 모니터링**: 플랫폼 상태를 실시간으로 파악
2. **효율적 운영**: 반복 작업 자동화 및 일괄 처리로 운영 비용 절감
3. **데이터 기반 의사결정**: 심층 분석 및 리포트로 전략 수립 지원
4. **보안 강화**: 2FA, RLS, 감사 로그로 관리자 액세스 보호

### 다음 단계
1. **디자인 시안 작성**: Figma에서 UI/UX 프로토타입 제작
2. **데이터베이스 마이그레이션**: admin_users, admin_logs 등 신규 테이블 생성
3. **Phase 1 개발 착수**: 기본 관리자 시스템 구현 시작

---

**문서 버전**: 1.1
**작성일**: 2025년 10월 19일
**최종 수정일**: 2025년 10월 19일
**다음 검토일**: 2025년 11월
**작성자**: Claude (AI Assistant)
**검토자**: G-PLAT 개발팀

---

## 변경 이력
- **v1.1 (2025.10.19)**: 이메일 서비스 전략 확정
  - Supabase Auth: 회원가입 인증 이메일 (내장)
  - SendGrid: 관리자 알림 + 마케팅 캠페인
  - React Compiler 버전 수정 (2.0 → 1.0)
  - 비용 최적화 ($86 → $46-61/월)
- **v1.0 (2025.10.19)**: 초안 작성
