---
title: "상품 신청 시스템"
category: "features"
tier: 2
status: "active"
last_updated: "2026-01-09"
related_docs:
  - path: "docs/features/sidejob-cards/README.md"
    description: "부가명함 시스템"
  - path: "docs/history/changelog/2026-01.md"
    description: "2026년 1월 변경 이력"
tags:
  - product-applications
  - affiliate
  - referral
---

# 상품 신청 시스템

제휴 서비스 명함/부가명함 상품에 대한 가입/구매 신청 기능.
추천인(명함 소유자) 트래킹 + 동적 폼 필드 + 관리자 워크플로우.

---

## 개요

### 주요 기능
1. **상품 신청 페이지**: 사용자가 제휴 상품을 신청할 수 있는 폼
2. **추천인 트래킹**: 명함 URL을 통해 추천인 정보 자동 기록
3. **동적 폼 필드**: 관리자가 상품별로 필요한 입력 필드 정의
4. **신청 관리**: 관리자가 신청 내역 조회, 상태 변경, 처리

### 워크플로우
```
[사용자] 명함 조회 → 제휴 상품 "신청하기" 클릭
       ↓
[신청 페이지] 기본 정보 + 동적 필드 입력 → 제출
       ↓
[DB] product_applications 테이블에 저장
       ↓
[관리자] 신청 목록 확인 → 담당자 배정 → 처리 완료
       ↓
[추천인] 보상 지급 (수수료/포인트)
```

---

## 데이터베이스

### product_applications 테이블

```sql
CREATE TABLE public.product_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 신청 대상
    template_id UUID REFERENCES public.admin_sidejob_templates(id),
    instance_id UUID REFERENCES public.admin_sidejob_instances(id),

    -- 추천인 트래킹
    referrer_user_id UUID REFERENCES auth.users(id),
    referrer_card_id UUID REFERENCES public.business_cards(id),
    referrer_card_url VARCHAR(255),

    -- 신청자 정보
    applicant_user_id UUID REFERENCES auth.users(id),
    applicant_name VARCHAR(100) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,

    -- 동적 폼 데이터
    form_data JSONB NOT NULL DEFAULT '{}',

    -- 상태 관리
    status VARCHAR(20) DEFAULT 'pending',

    -- 담당자 배정
    assigned_to UUID REFERENCES public.admin_users(id),
    assigned_at TIMESTAMPTZ,

    -- 처리 정보
    processed_at TIMESTAMPTZ,
    processing_note TEXT,

    -- 추천인 보상
    referrer_reward_type VARCHAR(20),
    referrer_reward_amount DECIMAL(10,2) DEFAULT 0,
    referrer_reward_status VARCHAR(20) DEFAULT 'pending',

    -- 방문자 정보
    visitor_ip INET,
    user_agent TEXT,
    device_type VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 상태(status) 워크플로우

| 상태 | 설명 |
|------|------|
| `pending` | 신청 접수됨, 처리 대기 |
| `assigned` | 담당자 배정됨 |
| `processing` | 처리 중 |
| `completed` | 처리 완료 |
| `cancelled` | 취소됨 |
| `rejected` | 거절됨 |

---

## 폼 스키마 (form_schema)

관리자가 상품별로 추가 입력 필드를 정의할 수 있습니다.

### 스키마 구조

```typescript
interface FormFieldSchema {
  name: string;           // 필드 ID (예: business_type)
  label: string;          // 표시 라벨 (예: 사업자 유형)
  type: FormFieldType;    // text, number, email, phone, select, checkbox, textarea, date
  required: boolean;      // 필수 여부
  placeholder?: string;   // 입력 안내 텍스트
  helpText?: string;      // 필드 아래 도움말
  options?: FormFieldOption[];  // select 타입용 옵션
  defaultValue?: string | number | boolean;  // 기본값
}

interface FormFieldOption {
  value: string;
  label: string;
}
```

### 프리셋 필드

FormSchemaEditor에서 제공하는 자주 사용하는 필드:

| 필드 ID | 라벨 | 타입 | 옵션 |
|---------|------|------|------|
| `business_type` | 사업자 유형 | select | 개인사업자, 법인사업자, 프리랜서 |
| `company_name` | 회사명/상호 | text | - |
| `business_number` | 사업자등록번호 | text | - |
| `monthly_sales` | 월 매출 | select | 1천만원 미만 ~ 1억원 이상 |
| `employee_count` | 직원 수 | select | 1명 ~ 10명 이상 |
| `address` | 사업장 주소 | text | - |
| `inquiry_content` | 문의 내용 | textarea | - |
| `preferred_contact_time` | 희망 연락 시간 | select | 오전, 오후, 저녁, 언제든지 |

---

## React App

### 라우팅

```tsx
// react-app/src/App.tsx
<Route path="/apply/:templateId" element={<ProductApplicationPage />} />
<Route path="/apply/:templateId/:referrerUrl" element={<ProductApplicationPage />} />
```

### 주요 파일

| 파일 | 설명 |
|------|------|
| `src/types/application.ts` | 타입 정의 |
| `src/lib/applications.ts` | API 함수 (fetch, submit, checkDuplicate) |
| `src/components/application/DynamicFormField.tsx` | 동적 폼 필드 렌더링 |
| `src/pages/ProductApplicationPage.tsx` | 신청 페이지 |

### 신청 페이지 구조

```
ProductApplicationPage
├── 상품 정보 헤더 (이미지, 제목, 설명, 가격)
├── 기본 정보 섹션 (항상 표시)
│   ├── 이름 *
│   ├── 연락처 *
│   └── 이메일 *
├── 추가 정보 섹션 (form_schema 기반)
│   └── DynamicFormField × N
├── 개인정보 동의 체크박스 *
└── 제출 버튼
```

### API 함수

```typescript
// 템플릿 정보 조회 (form_schema 포함)
fetchTemplateForApplication(templateId: string): Promise<ApplicationTemplate | null>

// 신청 제출
submitApplication(data: ApplicationSubmitData): Promise<{ id?: string; message?: string }>

// 중복 신청 확인
checkDuplicateApplication(templateId: string, email: string, periodDays: number): Promise<boolean>
```

---

## Admin App

### 신청 폼 설정

**파일**: `admin-app/src/components/sidejobs/TemplateEditModal.tsx`

관리자가 템플릿 수정 시 "신청 폼 설정" 섹션에서:

1. **신청 기능 활성화** 토글
2. **추천인 보상 설정**
   - 보상 유형: 없음 / 수수료 / 포인트
   - 보상 금액
3. **중복 신청 체크**
   - 활성화 여부
   - 기간 (일 단위)
4. **폼 스키마 편집기** (FormSchemaEditor)
   - 필드 추가/수정/삭제
   - 빠른 추가 (프리셋)
   - 필드 순서 변경

### FormSchemaEditor

**파일**: `admin-app/src/components/sidejobs/FormSchemaEditor.tsx`

**기능**:
- **빠른 추가**: 프리셋 필드 8종 제공
- **필드 추가**: 타입 기반 시퀀스 ID 자동 생성 (`text_1`, `select_1`)
- **필드 편집**: ID, 라벨, 타입, 필수여부, 플레이스홀더, 도움말
- **옵션 관리**: select 타입용 옵션 추가/수정/삭제
- **순서 변경**: 위/아래 이동 버튼

---

## 사용자 화면 연동

### AdminSidejobCards

**파일**: `react-app/src/components/AdminSidejobCards.tsx`

제휴 부가명함 카드에서 `application_enabled`가 true인 경우 "신청하기" 버튼 표시.

```tsx
{card.application_enabled && (
  <button
    onClick={onApplyClick}
    className="px-2 py-1 text-xs sm:text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg"
  >
    신청하기
  </button>
)}
```

### 클릭 동작 분리

| 영역 | 동작 |
|------|------|
| 카드 전체 | CTA 링크 (새 탭으로 열기) |
| 이미지 | 팝업 뷰어 |
| 신청하기 버튼 | `/apply/{templateId}/{cardUrl}` 이동 |

---

## 추천인 트래킹

### URL 구조

```
/apply/{templateId}/{referrerUrl}
```

- `templateId`: 상품 템플릿 UUID
- `referrerUrl`: 명함의 custom_url 또는 business_card ID

### 저장 데이터

```sql
referrer_card_url = 'hong-gildong'  -- custom_url
referrer_card_id = (SELECT id FROM business_cards WHERE custom_url = 'hong-gildong')
referrer_user_id = (SELECT user_id FROM business_cards WHERE custom_url = 'hong-gildong')
```

---

## 다음 단계 (TODO)

### Admin App - 신청 관리 페이지
- [ ] 신청 목록 페이지 (`/applications`)
- [ ] 필터: 상태, 템플릿, 담당자, 날짜
- [ ] 신청 상세 모달 (신청자 정보, 폼 데이터, 처리 이력)
- [ ] 담당자 배정 기능
- [ ] 상태 변경 기능
- [ ] 처리 완료 + 보상 설정

### React App - 신청 내역
- [ ] 내 신청 내역 조회
- [ ] 신청 상태 확인

### 알림 시스템
- [ ] 신청 접수 시 관리자 알림
- [ ] 상태 변경 시 신청자 알림
- [ ] 추천인 보상 지급 알림
