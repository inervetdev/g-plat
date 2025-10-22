# 관리자 제공 부가 명함 기능 상세 기획서
**Admin-Provided Sidejob Cards Feature Specification**

---

## 📋 목차
1. [기능 개요](#1-기능-개요)
2. [비즈니스 요구사항](#2-비즈니스-요구사항)
3. [사용자 스토리](#3-사용자-스토리)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [UI/UX 설계](#5-uiux-설계)
6. [API 명세](#6-api-명세)
7. [개발 로드맵](#7-개발-로드맵)
8. [성공 지표](#8-성공-지표)

---

## 1. 기능 개요

### 1.1 개요
관리자가 미리 생성한 부가 명함 템플릿을 사용자가 선택하여 자신의 명함에 추가할 수 있는 "부가 명함 마켓플레이스" 기능입니다. 사용자는 직접 생성한 부가 명함 외에도 관리자가 큐레이션한 전문 B2B 서비스를 손쉽게 추가하여 수익원을 확대할 수 있습니다.

### 1.2 핵심 가치
- **사용자**: 검증된 고품질 부가 명함을 클릭 한 번으로 추가
- **관리자**: 파트너사 제휴를 통한 수수료 수익 창출
- **파트너사**: G-PLAT 전체 사용자 네트워크를 통한 마케팅 효과

### 1.3 주요 특징
- 21개 전문 B2B 카테고리 지원
- 사용자 직접 생성 부가 명함과 분리된 관리
- 카테고리별 필터링 및 검색 기능
- 실시간 선택/해제 기능
- 통계 및 성과 추적

---

## 2. 비즈니스 요구사항

### 2.1 배경
현재 사용자는 부가 명함을 직접 생성해야 하는 번거로움이 있습니다. 많은 사용자들이 동일한 B2B 서비스(통신, 렌탈, 보험 등)를 판매하고 있어, 관리자가 표준화된 고품질 명함을 제공하면 사용자 경험이 크게 개선됩니다.

### 2.2 목표
1. **사용자 편의성**: 부가 명함 추가 시간을 10분 → 10초로 단축
2. **수익 다각화**: 파트너사 중개 수수료로 플랫폼 수익 증대
3. **사용자 활성화**: 부가 명함 평균 개수 3개 → 5개 이상 증가
4. **품질 향상**: 검증된 디자인과 카피로 전환율 20% 향상

### 2.3 타겟 사용자
- **Primary**: 부업을 시작하고 싶지만 어떤 상품을 팔아야 할지 모르는 초보 사용자
- **Secondary**: 기존 부업 외 추가 수익원을 찾는 중급 사용자
- **Tertiary**: 다양한 포트폴리오로 수익을 극대화하려는 전문 사용자

---

## 3. 사용자 스토리

### 3.1 관리자 (Admin)
```
AS AN admin user
I WANT TO create and manage admin-provided sidejob cards
SO THAT I can offer curated B2B services to all users

- 관리자 앱에서 새로운 부가 명함 템플릿 생성
- 21개 카테고리 중 하나를 선택
- 제목, 설명, 이미지, CTA, 링크 입력
- 활성화/비활성화 토글로 노출 제어
- 카테고리별로 필터링하여 관리
- 사용자 선택 통계 확인 (선택 수, 클릭 수, 전환율)
```

### 3.2 일반 사용자 (User)
```
AS A regular user
I WANT TO browse and select admin-provided sidejob cards
SO THAT I can quickly add professional services to my card

- 부가 명함 페이지에서 "관리자 제공 명함 추가" 버튼 클릭
- 21개 카테고리로 필터링된 명함 목록 확인
- 원하는 명함을 선택하여 내 명함에 추가
- 추가된 관리자 명함은 내가 만든 명함 아래에 표시
- 언제든지 선택 해제 가능
- 선택한 명함의 클릭 통계 확인
```

### 3.3 명함 방문자 (Visitor)
```
AS A card visitor
I WANT TO see both user-created and admin-provided sidejobs
SO THAT I can explore all available services

- 사용자 명함 방문 시 모든 부가 명함 확인
- "사용자 직접 등록" 섹션과 "제휴 서비스" 섹션 구분
- 관리자 제공 명함도 동일하게 클릭 가능
- 클릭 시 파트너사 랜딩 페이지로 이동
```

---

## 4. 데이터베이스 설계

### 4.1 테이블 구조

#### 4.1.1 `admin_provided_sidejobs` (관리자 제공 부가 명함 템플릿)
```sql
CREATE TABLE IF NOT EXISTS public.admin_provided_sidejobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 기본 정보
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,

    -- 카테고리 (21개 B2B 전문 카테고리)
    category admin_b2b_category NOT NULL,

    -- CTA
    cta_text TEXT NOT NULL DEFAULT '자세히 보기',
    cta_link TEXT NOT NULL,

    -- 가격 정보
    price TEXT,

    -- 메타데이터
    badge VARCHAR(20),              -- 예: "인기", "신규", "추천"
    display_priority INT DEFAULT 0, -- 정렬 순서 (높을수록 상단)
    is_active BOOLEAN DEFAULT TRUE,

    -- 파트너 정보
    partner_name TEXT,              -- 파트너사 이름
    partner_commission_rate DECIMAL(5,2), -- 수수료율 (예: 10.50%)

    -- 통계
    total_selections INT DEFAULT 0, -- 총 선택 횟수
    total_views INT DEFAULT 0,      -- 총 조회 횟수
    total_clicks INT DEFAULT 0,     -- 총 클릭 횟수

    -- 생성 정보
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.2 `user_selected_admin_sidejobs` (사용자가 선택한 관리자 명함)
```sql
CREATE TABLE IF NOT EXISTS public.user_selected_admin_sidejobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 연결 정보
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_card_id UUID REFERENCES business_cards(id) ON DELETE CASCADE,
    admin_sidejob_id UUID NOT NULL REFERENCES admin_provided_sidejobs(id) ON DELETE CASCADE,

    -- 정렬 순서
    display_order INT DEFAULT 0,

    -- 개인화 (옵션)
    custom_cta_text TEXT,           -- 사용자가 CTA 텍스트를 커스터마이징 가능
    custom_price TEXT,              -- 사용자가 가격 정보를 커스터마이징 가능

    -- 통계
    view_count INT DEFAULT 0,
    click_count INT DEFAULT 0,

    -- 선택 정보
    selected_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 중복 방지 제약
    UNIQUE(user_id, business_card_id, admin_sidejob_id)
);
```

### 4.2 새로운 ENUM 타입

#### 4.2.1 `admin_b2b_category` (21개 B2B 전문 카테고리)
```sql
CREATE TYPE admin_b2b_category AS ENUM (
    'telecom_internet',       -- 통신·인터넷
    'pg_van_payment',         -- PG·VAN 카드결제 서비스
    'home_rental',            -- 가정용렌탈
    'business_rental',        -- 업소용렌탈
    'naver_place_seo',        -- 네이버플레이스 노출
    'sns_advertising',        -- SNS광고
    'capital_rental',         -- 자금렌탈
    'tax_accounting',         -- 세무기장
    'policy_funds',           -- 정책자금
    'tax_refund',             -- 세금환급
    'liquor',                 -- 주류
    'insurance',              -- 보험
    'website_development',    -- 홈페이지 제작
    'press_media',            -- 언론사
    'marriage_agency',        -- 결혼정보
    'db_program',             -- DB 프로그램
    'flower_delivery',        -- 꽃배달
    'designated_driver',      -- 대리운전
    'demolition',             -- 철거
    'interior',               -- 인테리어
    'paint'                   -- 페인트
);
```

### 4.3 인덱스

```sql
-- 카테고리별 필터링을 위한 인덱스
CREATE INDEX idx_admin_sidejobs_category
ON admin_provided_sidejobs(category)
WHERE is_active = TRUE;

-- 우선순위 정렬을 위한 인덱스
CREATE INDEX idx_admin_sidejobs_priority
ON admin_provided_sidejobs(display_priority DESC, created_at DESC)
WHERE is_active = TRUE;

-- 사용자별 선택 조회를 위한 인덱스
CREATE INDEX idx_user_selected_admin_sidejobs_user
ON user_selected_admin_sidejobs(user_id, business_card_id);

-- 통계 조회를 위한 인덱스
CREATE INDEX idx_user_selected_admin_sidejobs_sidejob
ON user_selected_admin_sidejobs(admin_sidejob_id);
```

### 4.4 Row Level Security (RLS) 정책

#### 4.4.1 `admin_provided_sidejobs` 테이블
```sql
-- 모든 사용자가 활성화된 관리자 명함을 조회 가능
CREATE POLICY "Anyone can view active admin sidejobs"
ON admin_provided_sidejobs FOR SELECT
USING (is_active = TRUE OR auth.uid() IN (SELECT id FROM admin_users));

-- 관리자만 생성 가능
CREATE POLICY "Only admins can insert admin sidejobs"
ON admin_provided_sidejobs FOR INSERT
WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- 관리자만 수정 가능
CREATE POLICY "Only admins can update admin sidejobs"
ON admin_provided_sidejobs FOR UPDATE
USING (auth.uid() IN (SELECT id FROM admin_users));

-- 관리자만 삭제 가능
CREATE POLICY "Only admins can delete admin sidejobs"
ON admin_provided_sidejobs FOR DELETE
USING (auth.uid() IN (SELECT id FROM admin_users));
```

#### 4.4.2 `user_selected_admin_sidejobs` 테이블
```sql
-- 사용자는 자신의 선택만 조회 가능
CREATE POLICY "Users can view their own selections"
ON user_selected_admin_sidejobs FOR SELECT
USING (auth.uid() = user_id);

-- 사용자는 자신의 명함에만 추가 가능
CREATE POLICY "Users can insert own selections"
ON user_selected_admin_sidejobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 선택만 수정 가능
CREATE POLICY "Users can update own selections"
ON user_selected_admin_sidejobs FOR UPDATE
USING (auth.uid() = user_id);

-- 사용자는 자신의 선택만 삭제 가능
CREATE POLICY "Users can delete own selections"
ON user_selected_admin_sidejobs FOR DELETE
USING (auth.uid() = user_id);
```

### 4.5 트리거 (Triggers)

#### 4.5.1 선택 횟수 자동 증가
```sql
CREATE OR REPLACE FUNCTION increment_admin_sidejob_selection_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE admin_provided_sidejobs
    SET total_selections = total_selections + 1
    WHERE id = NEW.admin_sidejob_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_admin_sidejob_selected
AFTER INSERT ON user_selected_admin_sidejobs
FOR EACH ROW
EXECUTE FUNCTION increment_admin_sidejob_selection_count();
```

#### 4.5.2 선택 해제 시 횟수 감소
```sql
CREATE OR REPLACE FUNCTION decrement_admin_sidejob_selection_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE admin_provided_sidejobs
    SET total_selections = total_selections - 1
    WHERE id = OLD.admin_sidejob_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_admin_sidejob_deselected
AFTER DELETE ON user_selected_admin_sidejobs
FOR EACH ROW
EXECUTE FUNCTION decrement_admin_sidejob_selection_count();
```

---

## 5. UI/UX 설계

### 5.1 관리자 앱 - 관리자 명함 관리 페이지

#### 5.1.1 페이지 구조
```
┌─────────────────────────────────────────────────────────┐
│ 📊 관리자 제공 부가 명함 관리                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [+ 새 부가 명함 생성]              [카테고리 필터 ▼]     │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🌐 통신·인터넷                      활성화 [ON] │   │
│ │ KT 인터넷 가입 - 월 29,900원                     │   │
│ │ 선택 수: 145 | 클릭: 892 | 전환율: 12.3%        │   │
│ │ [수정] [통계]                                   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 💳 PG·VAN 카드결제                 활성화 [ON] │   │
│ │ 나이스페이 가맹점 모집 - 수수료 1.5%            │   │
│ │ 선택 수: 89 | 클릭: 423 | 전환율: 8.1%         │   │
│ │ [수정] [통계]                                   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 5.1.2 생성/수정 폼
```
┌─────────────────────────────────────────────────────────┐
│ 관리자 부가 명함 생성                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 카테고리 *                                               │
│ [통신·인터넷 ▼]                                         │
│                                                         │
│ 제목 *                                                   │
│ [KT 인터넷 가입 - 월 29,900원                  ]        │
│                                                         │
│ 설명                                                     │
│ [초고속 인터넷 100Mbps 기본 제공, 가입비 무료    ]        │
│                                                         │
│ 이미지 URL                                               │
│ [https://cdn.example.com/kt-internet.jpg      ]        │
│ [이미지 업로드]                                         │
│                                                         │
│ 가격                                                     │
│ [월 29,900원                                   ]        │
│                                                         │
│ CTA 텍스트 *                                             │
│ [가입 신청하기                                  ]        │
│                                                         │
│ CTA 링크 *                                               │
│ [https://partner.kt.com/signup?ref=gplat      ]        │
│                                                         │
│ 배지 (선택)                                              │
│ [인기 ▼]  옵션: 없음, 인기, 신규, 추천, HOT             │
│                                                         │
│ 우선순위 (0-100, 높을수록 상단)                          │
│ [50                                            ]        │
│                                                         │
│ 파트너사 이름                                            │
│ [KT                                            ]        │
│                                                         │
│ 수수료율 (%)                                             │
│ [15.0                                          ]        │
│                                                         │
│ 활성화                                                   │
│ [✓] 즉시 사용자에게 노출                                │
│                                                         │
│               [취소]        [저장]                       │
└─────────────────────────────────────────────────────────┘
```

### 5.2 사용자 앱 - 부가 명함 페이지 (통합 뷰)

#### 5.2.1 페이지 구조
```
┌─────────────────────────────────────────────────────────┐
│ 부가 명함 관리                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 내가 만든 부가 명함 (3)                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│ [+ 새 부가 명함 만들기]                                  │
│                                                         │
│ ┌──────────────────────┐                               │
│ │ [이미지]             │ 🛒 쇼핑/판매 · 식품·건강       │
│ │                      │ 유기농 채소 정기배송           │
│ │                      │ 월 39,000원                    │
│ │                      │ [상품 보러가기]                │
│ └──────────────────────┘ [수정] [삭제] [↑↓]            │
│                                                         │
│ ... (사용자 직접 생성 카드 2개 더)                       │
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 제휴 서비스 (2)               [+ 서비스 추가하기]        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│ ┌──────────────────────┐                               │
│ │ [KT 로고]            │ 🌐 통신·인터넷                │
│ │                      │ KT 인터넷 가입 - 월 29,900원   │
│ │                      │ 초고속 100Mbps 기본 제공       │
│ │                      │ [가입 신청하기]                │
│ └──────────────────────┘ [제거] [↑↓]                   │
│                                                         │
│ ┌──────────────────────┐                               │
│ │ [보험 아이콘]        │ 🛡️ 보험                       │
│ │                      │ DB손해보험 다이렉트 자동차보험  │
│ │                      │ 최대 30% 할인                  │
│ │                      │ [견적 받기]                    │
│ └──────────────────────┘ [제거] [↑↓]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 5.2.2 관리자 명함 추가 모달
```
┌─────────────────────────────────────────────────────────┐
│ 제휴 서비스 추가                               [닫기 X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 카테고리:  [전체 ▼] [통신·인터넷] [렌탈] [보험] ...     │
│                                                         │
│ 검색: [서비스 검색...                          ] [🔍]  │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🌐 통신·인터넷                                   │   │
│ │ ┌────────────────┐                             │   │
│ │ │ [KT 로고]      │ KT 인터넷 가입                │   │
│ │ │                │ 월 29,900원                   │   │
│ │ │                │ 선택: 145명                   │   │
│ │ └────────────────┘ [추가하기]                   │   │
│ │                                                 │   │
│ │ ┌────────────────┐                             │   │
│ │ │ [LG U+ 로고]   │ LG U+ 인터넷 가입             │   │
│ │ │                │ 월 27,500원                   │   │
│ │ │                │ 선택: 98명                    │   │
│ │ └────────────────┘ [추가하기]                   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 💳 PG·VAN 카드결제                               │   │
│ │ ┌────────────────┐                             │   │
│ │ │ [나이스페이]   │ 나이스페이 가맹점 모집        │   │
│ │ │                │ 수수료 1.5%                   │   │
│ │ │                │ 선택: 89명                    │   │
│ │ └────────────────┘ [추가하기]                   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│                               [1] 2 3 ... 8 [다음]     │
└─────────────────────────────────────────────────────────┘
```

### 5.3 사용자 앱 - 명함 뷰 페이지 (통합 표시)

```
┌─────────────────────────────────────────────────────────┐
│                    [프로필 사진]                         │
│                    김대리 (32세)                         │
│                    마케팅 매니저                         │
│                    ㈜테크컴퍼니                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📞 010-1234-5678                                        │
│ ✉️  kim.daeri@techcompany.com                          │
│ 🏢 서울시 강남구 테헤란로 123                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 부가 서비스                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 내가 제공하는 서비스                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│ ┌──────────────────────┐                               │
│ │ [채소 사진]          │ 🛒 유기농 채소 정기배송        │
│ │                      │ 월 39,000원                    │
│ │                      │ [상품 보러가기] →              │
│ └──────────────────────┘                               │
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 추천 제휴 서비스                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│ ┌──────────────────────┐                               │
│ │ [KT 로고]            │ 🌐 KT 인터넷 가입              │
│ │                      │ 월 29,900원                    │
│ │                      │ [가입 신청하기] →              │
│ └──────────────────────┘                               │
│                                                         │
│ ┌──────────────────────┐                               │
│ │ [보험 아이콘]        │ 🛡️ DB손해보험 자동차보험      │
│ │                      │ 최대 30% 할인                  │
│ │                      │ [견적 받기] →                  │
│ └──────────────────────┘                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. API 명세

### 6.1 관리자 API

#### 6.1.1 관리자 명함 목록 조회
```typescript
GET /api/admin/sidejobs
Query Parameters:
  - category?: admin_b2b_category
  - is_active?: boolean
  - sort_by?: 'created_at' | 'total_selections' | 'display_priority'
  - order?: 'asc' | 'desc'
  - page?: number
  - limit?: number

Response:
{
  data: AdminProvidedSidejob[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### 6.1.2 관리자 명함 생성
```typescript
POST /api/admin/sidejobs
Body:
{
  title: string,
  description?: string,
  image_url?: string,
  category: admin_b2b_category,
  cta_text: string,
  cta_link: string,
  price?: string,
  badge?: string,
  display_priority?: number,
  is_active?: boolean,
  partner_name?: string,
  partner_commission_rate?: number
}

Response:
{
  data: AdminProvidedSidejob,
  message: "관리자 부가 명함이 생성되었습니다."
}
```

#### 6.1.3 관리자 명함 수정
```typescript
PUT /api/admin/sidejobs/:id
Body: (same as POST, all fields optional)

Response:
{
  data: AdminProvidedSidejob,
  message: "관리자 부가 명함이 수정되었습니다."
}
```

#### 6.1.4 관리자 명함 삭제
```typescript
DELETE /api/admin/sidejobs/:id

Response:
{
  message: "관리자 부가 명함이 삭제되었습니다."
}
```

#### 6.1.5 관리자 명함 통계 조회
```typescript
GET /api/admin/sidejobs/:id/stats

Response:
{
  data: {
    admin_sidejob: AdminProvidedSidejob,
    total_selections: number,
    total_views: number,
    total_clicks: number,
    conversion_rate: number,
    selected_users: User[],
    selection_trend: { date: string, count: number }[]
  }
}
```

### 6.2 사용자 API

#### 6.2.1 활성화된 관리자 명함 목록 조회
```typescript
GET /api/sidejobs/admin-provided
Query Parameters:
  - category?: admin_b2b_category
  - search?: string
  - page?: number
  - limit?: number

Response:
{
  data: AdminProvidedSidejob[],
  pagination: { page, limit, total, totalPages }
}
```

#### 6.2.2 관리자 명함 선택 (추가)
```typescript
POST /api/sidejobs/admin-provided/:id/select
Body:
{
  business_card_id?: UUID,
  custom_cta_text?: string,
  custom_price?: string
}

Response:
{
  data: UserSelectedAdminSidejob,
  message: "제휴 서비스가 추가되었습니다."
}
```

#### 6.2.3 관리자 명함 선택 해제 (제거)
```typescript
DELETE /api/sidejobs/admin-provided/:id/deselect
Query Parameters:
  - business_card_id?: UUID

Response:
{
  message: "제휴 서비스가 제거되었습니다."
}
```

#### 6.2.4 내가 선택한 관리자 명함 목록 조회
```typescript
GET /api/sidejobs/my-selected-admin-sidejobs
Query Parameters:
  - business_card_id?: UUID

Response:
{
  data: UserSelectedAdminSidejob[]
}
```

#### 6.2.5 선택한 관리자 명함 순서 변경
```typescript
PUT /api/sidejobs/my-selected-admin-sidejobs/reorder
Body:
{
  business_card_id?: UUID,
  orders: { id: UUID, display_order: number }[]
}

Response:
{
  message: "순서가 변경되었습니다."
}
```

### 6.3 공개 API (명함 뷰)

#### 6.3.1 특정 사용자의 부가 명함 전체 조회 (통합)
```typescript
GET /api/cards/:cardId/sidejobs

Response:
{
  user_created: SideJobCardWithCategory[],
  admin_provided: (UserSelectedAdminSidejob & AdminProvidedSidejob)[]
}
```

---

## 7. 개발 로드맵

### Phase 1: 데이터베이스 & 백엔드 (1주)
**목표**: 데이터 구조 확립 및 API 구현

- [ ] 데이터베이스 마이그레이션 파일 작성
  - [ ] `admin_b2b_category` ENUM 타입 생성
  - [ ] `admin_provided_sidejobs` 테이블 생성
  - [ ] `user_selected_admin_sidejobs` 테이블 생성
  - [ ] 인덱스 생성
  - [ ] RLS 정책 설정
  - [ ] 트리거 함수 생성
- [ ] TypeScript 타입 정의 작성
  - [ ] `types/admin-sidejob.ts` 생성
  - [ ] 카테고리 설정 객체 생성
- [ ] Supabase 쿼리 함수 작성
  - [ ] 관리자 명함 CRUD
  - [ ] 사용자 선택/해제 함수
  - [ ] 통계 조회 함수

**완료 조건**:
- [ ] 로컬 Supabase에서 마이그레이션 성공
- [ ] 프로덕션 Supabase에 마이그레이션 적용
- [ ] 모든 API 함수 단위 테스트 통과

---

### Phase 2: 관리자 앱 개발 (1.5주)
**목표**: 관리자가 부가 명함을 생성/관리할 수 있는 인터페이스 구현

- [ ] 관리자 명함 관리 페이지 (`admin-app/src/pages/sidejobs/AdminSideJobsPage.tsx`)
  - [ ] 목록 조회 (카테고리 필터, 검색, 정렬)
  - [ ] 생성/수정 폼 모달
  - [ ] 활성화/비활성화 토글
  - [ ] 삭제 확인 모달
  - [ ] 통계 대시보드 (선택 수, 클릭 수, 전환율)
- [ ] 카테고리별 필터 컴포넌트
- [ ] 이미지 업로드 컴포넌트 (Supabase Storage 연동)
- [ ] 폼 유효성 검증 (react-hook-form + zod)

**완료 조건**:
- [ ] 관리자가 21개 카테고리로 명함 생성 가능
- [ ] 생성된 명함이 실시간으로 목록에 반영
- [ ] 통계 대시보드에서 사용자 선택 현황 확인 가능

---

### Phase 3: 사용자 앱 개발 (1.5주)
**목표**: 사용자가 관리자 명함을 선택하고 자신의 명함에 추가

- [ ] 부가 명함 페이지 통합 리팩토링
  - [ ] "내가 만든 부가 명함" 섹션
  - [ ] "제휴 서비스" 섹션 추가
  - [ ] 드래그 앤 드롭으로 순서 변경 (두 섹션 간 이동 불가)
- [ ] 관리자 명함 추가 모달 (`components/AdminSidejobSelectionModal.tsx`)
  - [ ] 카테고리 필터
  - [ ] 검색 기능
  - [ ] 페이지네이션
  - [ ] "추가하기" 버튼
- [ ] 명함 뷰 페이지 통합
  - [ ] 사용자 직접 생성 섹션
  - [ ] 제휴 서비스 섹션 (관리자 제공)
  - [ ] 각 카드 클릭 시 통계 기록 (view_count, click_count)
- [ ] 선택 해제 기능 (제거 버튼)

**완료 조건**:
- [ ] 사용자가 관리자 명함을 검색하고 추가 가능
- [ ] 추가된 명함이 명함 뷰 페이지에 "제휴 서비스"로 표시
- [ ] 방문자가 클릭 시 CTA 링크로 이동하고 통계 기록

---

### Phase 4: 통계 및 최적화 (1주)
**목표**: 성과 추적 및 사용자 경험 개선

- [ ] 관리자 통계 대시보드 고도화
  - [ ] 카테고리별 인기도 차트
  - [ ] 시간대별 선택 트렌드
  - [ ] 사용자당 평균 선택 수
  - [ ] 전환율 TOP 10 명함
- [ ] 사용자 추천 알고리즘
  - [ ] 사용자 프로필 기반 추천
  - [ ] 인기 순 자동 정렬
- [ ] 성능 최적화
  - [ ] 이미지 lazy loading
  - [ ] 목록 무한 스크롤
  - [ ] 캐싱 전략 (React Query)
- [ ] E2E 테스트 작성 (Playwright)

**완료 조건**:
- [ ] 관리자가 인사이트를 얻을 수 있는 통계 확인
- [ ] 페이지 로딩 속도 2초 이내
- [ ] 모든 주요 시나리오 E2E 테스트 통과

---

### 마일스톤 요약

| Phase | 기간 | 주요 결과물 | 책임자 |
|-------|------|------------|--------|
| Phase 1 | 1주 | DB 스키마, API, 타입 정의 | Backend Dev |
| Phase 2 | 1.5주 | 관리자 앱 명함 관리 페이지 | Admin Frontend Dev |
| Phase 3 | 1.5주 | 사용자 앱 선택/표시 기능 | User Frontend Dev |
| Phase 4 | 1주 | 통계, 최적화, 테스트 | Full Stack Dev |
| **Total** | **5주** | **완전한 관리자 제공 부가 명함 시스템** | **Team** |

---

## 8. 성공 지표

### 8.1 정량적 지표 (KPI)

| 지표 | 현재 | 목표 (1개월) | 목표 (3개월) |
|------|------|--------------|--------------|
| 사용자당 평균 부가 명함 수 | 3개 | 5개 | 7개 |
| 관리자 명함 선택율 | - | 30% | 50% |
| 관리자 명함 클릭률 (CTR) | - | 8% | 12% |
| 전환율 (클릭 → 가입/구매) | - | 5% | 10% |
| 월 파트너 수수료 수익 | ₩0 | ₩500만 | ₩2,000만 |

### 8.2 정성적 지표

- **사용자 만족도**: 설문조사 4.0/5.0 이상
- **관리자 피드백**: "명함 생성이 10분 → 10초로 단축되었다"
- **파트너사 만족도**: "G-PLAT을 통한 리드 품질이 우수하다"

### 8.3 기술 지표

- **페이지 로딩 속도**: 2초 이내
- **API 응답 시간**: 500ms 이내
- **데이터베이스 쿼리 성능**: N+1 쿼리 없음, 인덱스 활용률 90% 이상
- **테스트 커버리지**: 80% 이상

---

## 9. 부록

### 9.1 21개 B2B 카테고리 상세 설명

| 카테고리 | ENUM 값 | 설명 | 예시 파트너 |
|---------|---------|------|------------|
| 통신·인터넷 | `telecom_internet` | 인터넷, TV, 휴대폰 가입 | KT, LG U+, SK텔레콤 |
| PG·VAN 카드결제 | `pg_van_payment` | 가맹점 모집, 결제 시스템 | 나이스페이, KG이니시스 |
| 가정용렌탈 | `home_rental` | 정수기, 공기청정기, 비데 | 코웨이, 청호나이스 |
| 업소용렌탈 | `business_rental` | 커피머신, 정수기, 사무기기 | 네스프레소, 한국후지제록스 |
| 네이버플레이스 노출 | `naver_place_seo` | 네이버 지도 상위 노출 | 스마트플레이스 대행사 |
| SNS광고 | `sns_advertising` | 인스타그램, 페이스북 광고 | 메타광고 대행사 |
| 자금렌탈 | `capital_rental` | 사업자금, 운전자금 대출 | 캐피탈사 |
| 세무기장 | `tax_accounting` | 세무 대리, 기장 서비스 | 세무법인 |
| 정책자금 | `policy_funds` | 정부 지원금, 창업 자금 | 중소기업진흥공단 |
| 세금환급 | `tax_refund` | 종합소득세, 부가세 환급 | 세무사 |
| 주류 | `liquor` | 소주, 맥주, 와인 도매 | 하이트진로, 롯데칠성 |
| 보험 | `insurance` | 자동차, 실손, 연금 보험 | DB손해보험, 삼성생명 |
| 홈페이지 제작 | `website_development` | 반응형 웹, 쇼핑몰 제작 | 웹 에이전시 |
| 언론사 | `press_media` | 보도자료 배포, 홍보 | 뉴스와이어 |
| 결혼정보 | `marriage_agency` | 결혼 중개, 매칭 서비스 | 듀오, 가연 |
| DB 프로그램 | `db_program` | 고객관리, 영업관리 프로그램 | CRM 소프트웨어 |
| 꽃배달 | `flower_delivery` | 축하화환, 꽃바구니 배송 | 플라워365 |
| 대리운전 | `designated_driver` | 대리운전 호출 서비스 | 카카오대리 |
| 철거 | `demolition` | 건물 철거, 폐기물 처리 | 철거 전문 업체 |
| 인테리어 | `interior` | 주거, 상업 공간 인테리어 | 오늘의집 |
| 페인트 | `paint` | 도장, 페인트 시공 | 페인트 업체 |

### 9.2 카테고리별 기본 CTA 텍스트

```typescript
const ADMIN_B2B_CTA_DEFAULTS: Record<admin_b2b_category, string> = {
  telecom_internet: '가입 신청하기',
  pg_van_payment: '가맹점 신청',
  home_rental: '렌탈 신청하기',
  business_rental: '견적 요청하기',
  naver_place_seo: '상담 신청하기',
  sns_advertising: '광고 문의하기',
  capital_rental: '대출 신청하기',
  tax_accounting: '세무 상담하기',
  policy_funds: '지원금 신청',
  tax_refund: '환급 받기',
  liquor: '주문하기',
  insurance: '보험 가입하기',
  website_development: '제작 의뢰하기',
  press_media: '보도자료 배포',
  marriage_agency: '매칭 신청하기',
  db_program: '무료 체험하기',
  flower_delivery: '꽃 주문하기',
  designated_driver: '대리 호출하기',
  demolition: '견적 요청하기',
  interior: '시공 문의하기',
  paint: '시공 문의하기'
}
```

### 9.3 향후 확장 계획

#### 9.3.1 개인화 추천 시스템 (Phase 5)
- 사용자의 직업, 위치, 관심사를 기반으로 관리자 명함 추천
- 머신러닝 기반 협업 필터링 (Collaborative Filtering)

#### 9.3.2 파트너 대시보드 (Phase 6)
- 파트너사가 직접 로그인하여 자신의 명함 성과 확인
- A/B 테스트 기능 (여러 버전의 명함 테스트)

#### 9.3.3 인센티브 시스템 (Phase 7)
- 사용자가 관리자 명함을 추가하면 포인트 지급
- 전환 발생 시 추가 리워드 (수수료의 일부 분배)

#### 9.3.4 모바일 앱 최적화 (Phase 8)
- 네이티브 앱에서 푸시 알림으로 신규 관리자 명함 안내
- 위치 기반 추천 (GPS 연동)

---

## 10. 참고 문서

- [PRD v1.14 - 부가 명함 로드맵](./prd.md)
- [Admin Development Roadmap](./ADMIN_DEVELOPMENT_ROADMAP.md)
- [Supabase DB Schema](./react-app/supabase/migrations/001_initial_schema.sql)
- [SideJob Card Types](./react-app/src/types/sidejob.ts)

---

**문서 버전**: v1.0
**작성일**: 2025-10-22
**작성자**: G-PLAT Development Team
**승인자**: Product Manager

---

**변경 이력**

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| v1.0 | 2025-10-22 | 초안 작성 | Claude Code |
