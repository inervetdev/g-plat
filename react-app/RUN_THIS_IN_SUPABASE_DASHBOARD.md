# 🔧 프로덕션 데이터베이스 마이그레이션 실행 방법

## 문제
명함 수정 시 400 Bad Request 에러 발생:
- `latitude`와 `longitude` 컬럼이 프로덕션 데이터베이스에 존재하지 않음

## 해결 방법

### 1️⃣ Supabase Dashboard SQL Editor 접속
https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/sql/new

### 2️⃣ 다음 SQL을 복사해서 실행

```sql
-- Add latitude and longitude columns to business_cards table
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_business_cards_location
ON public.business_cards(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.business_cards.latitude IS '위도 (카카오 맵)';
COMMENT ON COLUMN public.business_cards.longitude IS '경도 (카카오 맵)';
```

### 3️⃣ 실행 후 확인

```sql
-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'business_cards'
AND column_name IN ('latitude', 'longitude');
```

결과가 2개 행으로 나오면 성공입니다:
- latitude | double precision | YES
- longitude | double precision | YES

### 4️⃣ 테스트
마이그레이션 완료 후 다시 명함 수정을 시도해보세요:
- https://g-plat.com/dashboard
- 명함 수정 → 저장
- ✅ "명함이 수정되었습니다" 메시지가 나타나야 함

## 참고
- 이 마이그레이션은 `IF NOT EXISTS`를 사용하므로 여러 번 실행해도 안전합니다
- 기존 데이터는 영향받지 않습니다
- 새로운 컬럼은 NULL을 허용하므로 기존 명함도 정상 작동합니다
