# 🔧 Schema Fix - Complete Solution

## 발견된 문제 요약

관리자 앱 코드가 실제 프로덕션 스키마와 다른 컬럼명을 사용하고 있습니다.

### 문제 1: users.status 컬럼 없음
**에러**: `Could not find the 'status' column of 'users'`
**원인**: 프로덕션 users 테이블에 status 컬럼이 없음
**실제 스키마**: id, email, name, phone, domain_name, profile_image_url, subscription_tier

### 문제 2: qr_codes.card_id 컬럼 없음
**에러**: `column qr_codes.card_id does not exist`
**원인**: 프로덕션은 `business_card_id` 사용, 코드는 `card_id` 사용
**실제 스키마**: business_card_id UUID REFERENCES business_cards(id)

### 문제 3: visitor_stats와 business_cards 관계 없음
**에러**: `Could not find a relationship between 'visitor_stats' and 'business_cards'`
**원인**: visitor_stats는 user_id만 있고 card_id가 없음
**실제 스키마**: id, user_id, visitor_ip, user_agent, referrer, page_url, visit_date

---

## 해결 방법

### 옵션 A: 데이터베이스 수정 (권장)

프로덕션 스키마를 관리자 앱의 요구사항에 맞게 수정합니다.

#### 1. users 테이블에 status 컬럼 추가

```sql
-- Add status column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'inactive', 'suspended'));

-- Update existing users
UPDATE public.users
SET status = 'active'
WHERE status IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
```

#### 2. visitor_stats 테이블에 business_card_id 추가

```sql
-- Add business_card_id column to visitor_stats
ALTER TABLE public.visitor_stats
ADD COLUMN IF NOT EXISTS business_card_id UUID REFERENCES public.business_cards(id) ON DELETE CASCADE;

-- Create index for joins
CREATE INDEX IF NOT EXISTS idx_visitor_stats_business_card_id
ON public.visitor_stats(business_card_id);

-- Optional: Migrate existing data
-- This assumes page_url contains custom_url that can be matched
UPDATE public.visitor_stats vs
SET business_card_id = bc.id
FROM public.business_cards bc
WHERE vs.business_card_id IS NULL
  AND vs.page_url LIKE '%' || bc.custom_url || '%'
  AND vs.user_id = bc.user_id;
```

**✅ 이 방법 실행 후**: 코드 수정 필요 없음 (qr_codes 관련 제외)

---

### 옵션 B: 코드 수정 (임시 방안)

데이터베이스를 변경하지 않고 코드를 실제 스키마에 맞춥니다.

#### 수정 필요 파일:
1. `admin-app/src/lib/api/users.ts` - status 관련 로직 제거/수정
2. `admin-app/src/components/users/detail/UserQRTab.tsx` - card_id → business_card_id
3. `admin-app/src/lib/api/cards.ts` - card_id → business_card_id
4. `admin-app/src/components/users/detail/UserActivityTab.tsx` - visitor_stats 쿼리 변경

---

## 권장 실행 방법

### Step 1: Supabase Dashboard에서 SQL 실행

1. Supabase Dashboard 접속
2. SQL Editor로 이동
3. 아래 **전체 수정 SQL**을 복사하여 실행

### Step 2: 코드 수정 적용

qr_codes 관련 컬럼명만 수정 필요 (card_id → business_card_id)

---

## 🚀 전체 수정 SQL (복사해서 실행)

```sql
-- ===================================================
-- G-PLAT Admin App Schema Fix
-- 실행 일시: 2025년 10월 28일
-- ===================================================

-- 1. users 테이블에 status 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended'));

        UPDATE public.users SET status = 'active' WHERE status IS NULL;

        CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

        RAISE NOTICE '✅ users.status 컬럼 추가 완료';
    ELSE
        RAISE NOTICE 'ℹ️  users.status 컬럼이 이미 존재합니다';
    END IF;
END $$;

-- 2. visitor_stats 테이블에 business_card_id 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'visitor_stats' AND column_name = 'business_card_id'
    ) THEN
        ALTER TABLE public.visitor_stats
        ADD COLUMN business_card_id UUID REFERENCES public.business_cards(id) ON DELETE CASCADE;

        CREATE INDEX IF NOT EXISTS idx_visitor_stats_business_card_id
        ON public.visitor_stats(business_card_id);

        RAISE NOTICE '✅ visitor_stats.business_card_id 컬럼 추가 완료';
    ELSE
        RAISE NOTICE 'ℹ️  visitor_stats.business_card_id 컬럼이 이미 존재합니다';
    END IF;
END $$;

-- 3. 스키마 확인
SELECT 'users 테이블 컬럼:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('id', 'status', 'subscription_tier')
ORDER BY ordinal_position;

SELECT 'qr_codes 테이블 컬럼:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'qr_codes' AND column_name LIKE '%card%'
ORDER BY ordinal_position;

SELECT 'visitor_stats 테이블 컬럼:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'visitor_stats' AND column_name IN ('user_id', 'business_card_id')
ORDER BY ordinal_position;

-- 완료 메시지
SELECT '✅ Schema fix completed successfully!' AS result;
```

---

## 실행 후 확인사항

### ✅ 성공 메시지 확인
실행 후 아래 메시지들이 보여야 합니다:
- `✅ users.status 컬럼 추가 완료`
- `✅ visitor_stats.business_card_id 컬럼 추가 완료`
- `✅ Schema fix completed successfully!`

### ✅ 테이블 구조 확인
쿼리 결과에서 다음을 확인:
- `users` 테이블에 `status` 컬럼 존재
- `qr_codes` 테이블에 `business_card_id` 컬럼 존재 (card_id 아님)
- `visitor_stats` 테이블에 `business_card_id` 컬럼 존재

---

## 다음 단계

### 1. SQL 실행 완료 후
저에게 "SQL 실행 완료했어" 라고 알려주시면:
- qr_codes 관련 코드 수정 (card_id → business_card_id)
- 관리자 앱 재빌드 및 테스트

### 2. 문제 발생 시
- 실행 결과 스크린샷 공유
- 에러 메시지 전달
