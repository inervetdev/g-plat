# 구독 등급 시스템 (Subscription Tier System)

G-Plat의 3단계 구독 등급 시스템 - 무료/유료/프리미엄 플랜별 기능 제한 및 업그레이드 유도

---

## 📋 개요

G-Plat은 Freemium 비즈니스 모델을 채택하여 무료 사용자에게는 기본 기능을, 유료 사용자에게는 고급 기능을 제공합니다.

### 등급 구조

| 등급 | DB Enum | 명함 제한 | 부가명함 제한 | 콜백 | 통계 |
|------|---------|----------|--------------|------|------|
| **무료** | `FREE` | 3개 | 5개 | ❌ 미제공 | 기본만 |
| **유료** | `PREMIUM` | 10개 | 30개 | ✅ 제공 | 전체 |
| **프리미엄** | `BUSINESS` | 무제한 | 무제한 | ✅ 제공 | 전체 + 특화 |

---

## 🎯 기능 제한 상세

### 무료 플랜 (FREE)

**제공되는 기능**:
- ✅ 명함 3개 생성
- ✅ 부가명함 5개 생성
- ✅ 기본 통계 (총 조회수, 오늘, 이번주, 이번달, 고유 방문자)
- ✅ QR 코드 생성 및 공유
- ✅ 프로필 이미지, 첨부파일 업로드

**제한되는 기능**:
- ❌ 콜백 시스템 미제공
- ❌ 고급 통계 (디바이스별, 브라우저, 유입경로, 일별 트렌드 등)
- ❌ 다운로드 통계
- ❌ QR 상세 통계

### 유료 플랜 (PREMIUM)

**제공되는 기능**:
- ✅ 명함 10개 생성
- ✅ 부가명함 30개 생성
- ✅ 모든 통계 제공
- ✅ 콜백 시스템 제공

### 프리미엄 플랜 (BUSINESS)

**제공되는 기능**:
- ✅ 무제한 명함 생성
- ✅ 무제한 부가명함 생성
- ✅ 모든 통계 + 특화 분석
- ✅ 무제한 콜백
- ✅ 추후 특화 서비스 (환급금 계산기, AI 상담사, TM 서비스)

---

## 🏗️ 아키텍처

### 3-Layer 접근 방식

```
┌─────────────────────────────────────────┐
│ 1. Frontend (UX Layer)                  │
│    - 명함 생성 전 제한 체크              │
│    - 업그레이드 프롬프트 표시             │
│    - 통계 페이지 블러 처리               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. API/Business Logic                  │
│    - Zustand store에 등급 정보 저장      │
│    - RPC 함수로 제한 조회                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. Database (Enforcement Layer)         │
│    - TRIGGER로 INSERT 차단              │
│    - FUNCTION으로 등급별 제한 계산       │
└─────────────────────────────────────────┘
```

**원칙**:
- **Frontend**: 사용자 경험 (친절한 안내, 업그레이드 유도)
- **Database**: 최종 방어선 (데이터 무결성 보장)
- 두 레이어 모두 동일한 제한 적용

---

## 📂 주요 파일

### 데이터베이스

**`react-app/supabase/migrations/20251212000001_subscription_tier_limits.sql`**
- `users.grandfathered` 컬럼 추가
- `check_card_limit_by_tier()` 함수
- `check_sidejob_limit_by_tier()` 함수
- `get_user_tier_limits()` RPC 함수
- `tier_limit_violations` 로깅 테이블
- INSERT 트리거 (비활성화 상태)

### 프론트엔드 라이브러리

**`react-app/src/lib/subscription.ts`**
- 등급별 제한 상수 정의
- API 호출 함수
- 제한 체크 유틸리티 함수

**`react-app/src/stores/subscriptionStore.ts`**
- Zustand 기반 상태 관리
- 5분 캐싱 전략
- 로그인 시 자동 fetch, 로그아웃 시 reset

### UI 컴포넌트

**`react-app/src/components/UpgradePrompt.tsx`**
- 업그레이드 CTA 컴포넌트
- 등급별 기능 비교 표시
- "업그레이드하기" 버튼 (결제 연동 TODO)

**`react-app/src/components/TierLimitBadge.tsx`**
- 사용량 배지 표시 (X/Y)
- 색상 코드: 파란색(<80%), 노란색(80-99%), 빨간색(100%)
- 무제한 플랜은 "∞" 표시
- Grandfathered 사용자 특별 표시

**`react-app/src/components/RestrictedStatsOverlay.tsx`**
- 통계 제한 오버레이
- 흐린 배경 + 업그레이드 프롬프트
- FREE 사용자 고급 통계 페이지에 적용

### 페이지 통합

- **DashboardPageOptimized.tsx**: 등급 배지, 사용량 진행바
- **CreateCardPageOptimized.tsx**: 명함 생성 제한 체크
- **SideJobCardsPageOptimized.tsx**: 부가명함 생성 제한 체크
- **StatsPageOptimized.tsx**: 통계 접근 제한

---

## 🔧 데이터베이스 구조

### 컬럼 추가

```sql
-- users 테이블에 grandfathered 컬럼 추가
ALTER TABLE public.users
ADD COLUMN grandfathered BOOLEAN DEFAULT FALSE;
```

### RPC 함수

```sql
CREATE OR REPLACE FUNCTION get_user_tier_limits(p_user_id UUID)
RETURNS TABLE(
    tier subscription_tier,
    max_cards INTEGER,
    max_sidejobs INTEGER,
    has_callbacks BOOLEAN,
    has_advanced_stats BOOLEAN,
    cards_used INTEGER,
    sidejobs_used INTEGER,
    grandfathered BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.subscription_tier,
        CASE u.subscription_tier
            WHEN 'FREE' THEN 3
            WHEN 'PREMIUM' THEN 10
            WHEN 'BUSINESS' THEN 999999
        END AS max_cards,
        CASE u.subscription_tier
            WHEN 'FREE' THEN 5
            WHEN 'PREMIUM' THEN 30
            WHEN 'BUSINESS' THEN 999999
        END AS max_sidejobs,
        (u.subscription_tier != 'FREE') AS has_callbacks,
        (u.subscription_tier != 'FREE') AS has_advanced_stats,
        (SELECT COUNT(*)::INTEGER FROM business_cards WHERE user_id = p_user_id AND is_active = true),
        (SELECT COUNT(*)::INTEGER FROM sidejob_cards WHERE user_id = p_user_id AND is_active = true),
        COALESCE(u.grandfathered, false)
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 트리거 (비활성화 상태)

```sql
-- 명함 생성 제한 트리거 (활성화 시)
CREATE TRIGGER enforce_card_limit_trigger
  BEFORE INSERT ON public.business_cards
  FOR EACH ROW
  EXECUTE FUNCTION check_card_limit_by_tier();

-- 부가명함 생성 제한 트리거 (활성화 시)
CREATE TRIGGER enforce_sidejob_limit_trigger
  BEFORE INSERT ON public.sidejob_cards
  FOR EACH ROW
  EXECUTE FUNCTION check_sidejob_limit_by_tier();
```

**⚠️ 주의**: 트리거는 프론트엔드 배포 후 안정화되면 활성화 예정

---

## 💻 사용법

### 1. 등급 정보 조회

```typescript
import { useSubscriptionStore } from '../stores/subscriptionStore'

function MyComponent() {
  const { limits, loading, error } = useSubscriptionStore()

  if (loading) return <div>로딩 중...</div>
  if (!limits) return <div>등급 정보를 불러올 수 없습니다</div>

  return (
    <div>
      <p>현재 등급: {limits.tier}</p>
      <p>명함: {limits.cardsUsed} / {limits.maxCards}</p>
      <p>부가명함: {limits.sidejobsUsed} / {limits.maxSidejobs}</p>
    </div>
  )
}
```

### 2. 생성 가능 여부 체크

```typescript
import { canCreateCard, canCreateSidejob } from '../lib/subscription'

const { limits } = useSubscriptionStore()

if (!canCreateCard(limits)) {
  return <UpgradePrompt currentTier={limits.tier} feature="cards" />
}

if (!canCreateSidejob(limits)) {
  return <UpgradePrompt currentTier={limits.tier} feature="sidejobs" />
}
```

### 3. 통계 접근 제한

```typescript
import { RestrictedStatsOverlay } from '../components/RestrictedStatsOverlay'

const { limits } = useSubscriptionStore()
const hasAdvancedStats = limits?.hasAdvancedStats ?? false

{hasAdvancedStats ? (
  <AdvancedStatsCharts />
) : (
  <RestrictedStatsOverlay currentTier={limits?.tier || 'FREE'} />
)}
```

### 4. 등급 배지 표시

```typescript
import { TierLimitBadge, TierLimitBadgeWithProgress } from '../components/TierLimitBadge'

// 간단한 배지
<TierLimitBadge limits={limits} type="cards" />

// 진행바 포함
<TierLimitBadgeWithProgress limits={limits} type="sidejobs" />
```

---

## 🧪 테스트

### 단위 테스트

```bash
# 등급 로직 테스트
npm run test subscription.test.ts
```

### E2E 테스트 (Playwright)

```bash
# FREE 사용자 제한 체크
npx playwright test tests/subscription/free-tier-limits.spec.ts

# PREMIUM 사용자 권한 체크
npx playwright test tests/subscription/premium-tier-access.spec.ts

# Grandfathered 사용자 예외 처리
npx playwright test tests/subscription/grandfathered-users.spec.ts
```

### 수동 테스트 체크리스트

- [ ] FREE 사용자: 3개 명함 생성 → 4번째 차단 확인
- [ ] FREE 사용자: 통계 페이지 블러 오버레이 확인
- [ ] PREMIUM 사용자: 10개 명함 생성 가능 확인
- [ ] BUSINESS 사용자: 무제한 생성 확인
- [ ] Grandfathered 사용자: 제한 무시 확인
- [ ] 업그레이드 프롬프트 UI/UX 검증
- [ ] 관리자 앱에서 등급 변경 → 즉시 반영 확인

---

## 🔒 기존 사용자 보호 (Grandfathering)

기존 사용자 중 새로운 제한을 초과하는 경우 자동으로 `grandfathered` 플래그가 설정됩니다.

**특징**:
- 기존 명함/부가명함 유지 가능
- 새로운 생성만 제한
- UI에 "⭐ 얼리어답터 특별 혜택" 배지 표시
- 관리자 앱에서 grandfathered 상태 확인 가능

**마이그레이션 자동 처리**:
```sql
-- 기존 사용자 중 제한 초과자 자동 grandfathered 설정
UPDATE public.users u
SET grandfathered = TRUE
WHERE (
  (SELECT COUNT(*) FROM business_cards WHERE user_id = u.id AND is_active = true) > 3
  OR
  (SELECT COUNT(*) FROM sidejob_cards WHERE user_id = u.id AND is_active = true) > 5
);
```

---

## 🚀 배포 전략

### 1단계: 프론트엔드 배포 (트리거 비활성화)

- 사용자는 UI에서 제한을 볼 수 있지만 강제되지 않음
- 1주일 모니터링 및 사용자 피드백 수집

### 2단계: 데이터베이스 트리거 활성화

```sql
-- 트리거 활성화 (안정화 후)
CREATE TRIGGER enforce_card_limit_trigger ...
CREATE TRIGGER enforce_sidejob_limit_trigger ...
```

### 롤백 계획

```sql
-- 트리거 제거
DROP TRIGGER IF EXISTS enforce_card_limit_trigger ON public.business_cards;
DROP TRIGGER IF EXISTS enforce_sidejob_limit_trigger ON public.sidejob_cards;
```

---

## 📊 성공 지표

1. **전환율**: FREE → PREMIUM 전환율 목표 5%
2. **이탈률**: 제한 도입 후 사용자 이탈률 <3%
3. **사용량**: 평균 명함 생성 개수 추적
4. **피드백**: 구독 관련 고객 지원 티켓 비율

---

## 🔐 보안

1. **RLS 정책**: 기존 정책 유지 (사용자는 본인 데이터만 접근)
2. **RPC 함수**: `SECURITY DEFINER`로 정의, `authenticated` 롤에만 권한 부여
3. **트리거 우회 방지**: 데이터베이스 레벨 강제이므로 API로 우회 불가

---

## 🎨 사용자 경험 원칙

### 점진적 공개 (Progressive Disclosure)

- 1/3 카드: 알림 없음
- 2/3 카드: "1개 더 만들 수 있어요" 힌트
- 3/3 카드: 업그레이드 프롬프트

### 명확한 가치 제안

업그레이드 시 얻는 이점을 명확히 표시:
- ✅ 더 많은 명함 (3개 → 10개 또는 무제한)
- ✅ 상세 통계 (디바이스, 유입 경로, 트렌드 분석)
- ✅ 콜백 기능 (자동 고객 관리)

### 기존 사용자 존중

- Grandfathered 사용자 특별 배지
- 제한 도입 1주일 전 공지 이메일

---

## 📅 향후 계획 (Phase 2)

### 결제 시스템 연동 (Toss Payments)
- 결제 페이지 구현
- 웹훅 핸들러 (구독 상태 동기화)
- 자동 등급 업그레이드/다운그레이드

### 14일 무료 체험
- `users.trial_ends_at` 컬럼 추가
- 체험 종료 시 자동 다운그레이드

### 콜백 시스템 제한
- 콜백 기능 구현 시 등급별 제한 적용

### 프리미엄 특화 서비스
- 환급금 계산기
- AI 상담사
- TM 서비스

---

## 📞 문의

- **이슈 제기**: [GitHub Issues](https://github.com/inervetdev/g-plat/issues)
- **Slack**: #g-plat-dev

**마지막 업데이트**: 2025-12-11
