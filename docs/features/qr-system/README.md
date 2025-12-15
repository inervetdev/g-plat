---
title: "QR 코드 시스템"
category: "features"
tier: 2
status: "active"
last_updated: "2025-12-05"
related_docs:
  - path: "docs/roadmap/current-phase.md"
    description: "현재 개발 단계"
  - path: "docs/architecture/database-schema.md"
    description: "데이터베이스 스키마"
tags:
  - qr-code
  - tracking
  - analytics
  - edge-function
---

# QR 코드 시스템

G-Plat의 QR 코드 생성, 리다이렉트, 스캔 추적 시스템에 대한 문서입니다.

## 개요

QR 코드 시스템은 다음 기능을 제공합니다:
- **QR 코드 자동 생성**: 명함 생성 시 자동으로 QR 코드 생성
- **단축 URL 리다이렉트**: `g-plat.com/q/{code}` → 명함 페이지
- **스캔 추적**: 디바이스, 브라우저, OS, IP 주소 기록
- **통계 분석**: 관리자 대시보드에서 스캔 분석

## 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  QR 코드 스캔   │────▶│  React App      │────▶│  Edge Function  │
│  (모바일/PC)    │     │  /q/:code       │     │  qr-redirect    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Supabase DB    │
                                               │  - qr_codes     │
                                               │  - qr_scans     │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  302 Redirect   │
                                               │  → 명함 페이지   │
                                               └─────────────────┘
```

## 데이터베이스 스키마

### qr_codes 테이블

```sql
CREATE TABLE public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    business_card_id UUID REFERENCES public.business_cards(id),
    short_code VARCHAR(10) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    target_type VARCHAR(20) DEFAULT 'static',  -- static | dynamic
    campaign VARCHAR(50),
    scan_count INTEGER DEFAULT 0,
    max_scans INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### qr_scans 테이블

```sql
CREATE TABLE public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(20),  -- mobile | tablet | desktop
    browser VARCHAR(50),      -- Chrome, Safari, Firefox 등
    os VARCHAR(50),           -- Windows, MacOS, iOS, Android 등
    country VARCHAR(2),
    city VARCHAR(100),
    referrer TEXT
);
```

## 주요 파일

### React App (react-app/)

| 파일 | 설명 |
|------|------|
| `src/pages/QRRedirectPage.tsx` | 클라이언트 사이드 리다이렉트 페이지 |
| `src/components/QRCodeGenerator.tsx` | QR 코드 생성 컴포넌트 |
| `src/lib/qr.ts` | QR 코드 유틸리티 함수 |
| `src/App.tsx` | `/q/:code` 라우트 정의 |

### Edge Function (react-app/supabase/functions/)

| 파일 | 설명 |
|------|------|
| `qr-redirect/index.ts` | QR 리다이렉트 및 스캔 추적 함수 |

### Admin App (admin-app/)

| 파일 | 설명 |
|------|------|
| `src/pages/QRCodesPage.tsx` | QR 코드 관리 페이지 |
| `src/components/qr/QrDetailModal.tsx` | QR 상세 통계 모달 |
| `src/lib/api/qr.ts` | QR 코드 API 함수 |

### 마이그레이션 (react-app/supabase/migrations/)

| 파일 | 설명 |
|------|------|
| `20250130_create_qr_tables.sql` | QR 테이블 생성 |
| `20251205000001_add_qr_scans_columns.sql` | browser, os 컬럼 추가 |

## QR 리다이렉트 흐름

### 1. 사용자가 QR 코드 스캔

사용자가 QR 코드를 스캔하면 `https://g-plat.com/q/{short_code}` URL로 이동합니다.

### 2. React App에서 Edge Function으로 리다이렉트

`QRRedirectPage.tsx`가 Edge Function URL로 클라이언트 사이드 리다이렉트를 수행합니다:

```typescript
// QRRedirectPage.tsx
useEffect(() => {
  if (code) {
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/qr-redirect/${code}`
    window.location.href = edgeFunctionUrl
  }
}, [code])
```

### 3. Edge Function에서 스캔 기록 및 리다이렉트

`qr-redirect/index.ts`가 다음을 수행합니다:
1. short_code로 QR 코드 조회
2. 스캔 정보 수집 (IP, User-Agent, 디바이스, 브라우저, OS)
3. qr_scans 테이블에 기록 저장
4. scan_count 증가
5. target_url로 302 리다이렉트

```typescript
// 스캔 기록 저장
await supabase.from('qr_scans').insert({
  qr_code_id: qrCode.id,
  ip_address: ipAddress,
  user_agent: userAgent,
  device_type: deviceType,
  browser: browser,
  os: os,
  referrer: referer,
  scanned_at: new Date().toISOString()
})

// 리다이렉트
return new Response(null, {
  status: 302,
  headers: { 'Location': targetUrl }
})
```

## QR 코드 자동 생성

### 명함 생성 시 자동 생성

`CreateCardPageOptimized.tsx`에서 명함 생성 후 자동으로 QR 코드를 생성합니다:

```typescript
import { createQRCodeForCard } from '@/lib/qr'

// 명함 생성 후
const qrCode = await createQRCodeForCard(card.id, userId)
```

### lib/qr.ts 유틸리티

```typescript
export async function createQRCodeForCard(
  cardId: string,
  userId: string
): Promise<QRCode | null> {
  const shortCode = generateShortCode()
  const targetUrl = `https://g-plat.com/card/${customUrl || cardId}`

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: userId,
      business_card_id: cardId,
      short_code: shortCode,
      target_url: targetUrl,
      target_type: 'static',
      campaign: 'business_card'
    })
    .select()
    .single()

  return data
}
```

## 관리자 대시보드 통계

### QR 코드 목록 페이지

- 전체 QR 코드 수
- 활성 QR 코드 수
- 총 스캔 수
- 오늘/이번 주 스캔 수
- 검색, 필터, 정렬 기능

### QR 상세 통계 모달

- **스캔 통계 요약**: 총 스캔, 오늘, 이번 주, 이번 달
- **일별 스캔 추이**: 최근 30일 LineChart
- **디바이스별 분포**: PieChart (mobile/tablet/desktop)
- **브라우저별 분포**: BarChart
- **국가별 분포**: 목록
- **최근 스캔 기록**: 테이블 (시간, 디바이스, 브라우저, OS, 위치)

## Edge Function 배포

```bash
cd react-app

# Edge Function 배포 (JWT 검증 비활성화)
SUPABASE_ACCESS_TOKEN="your-token" npx supabase functions deploy qr-redirect --no-verify-jwt --project-ref anwwjowwrxdygqyhhckr
```

> **Note**: `--no-verify-jwt` 플래그가 필요합니다. QR 스캔은 인증 없이 접근해야 하기 때문입니다.

## 트러블슈팅

### 스캔이 기록되지 않는 경우

1. **qr_scans 테이블 컬럼 확인**
   - `browser`, `os` 컬럼이 있는지 확인
   - 없으면 `20251205000001_add_qr_scans_columns.sql` 실행

2. **IP 주소 타입 오류**
   - Edge Function에서 IP 주소가 null일 수 있도록 처리
   - "Unknown" 문자열은 INET 타입으로 변환 불가

3. **Edge Function 배포 확인**
   - `--no-verify-jwt` 플래그로 배포되었는지 확인
   - 401 Unauthorized 오류 시 재배포 필요

### 리다이렉트가 작동하지 않는 경우

1. **Vercel 설정 확인**
   - `vercel.json`에서 `/q/` 경로가 rewrites에서 제외되었는지 확인

2. **QRRedirectPage 확인**
   - `App.tsx`에 `/q/:code` 라우트가 있는지 확인

## 관련 문서

- [데이터베이스 스키마](../../architecture/database-schema.md)
- [Supabase Edge Functions](../../infrastructure/supabase/edge-functions.md)
- [현재 개발 단계](../../roadmap/current-phase.md)
