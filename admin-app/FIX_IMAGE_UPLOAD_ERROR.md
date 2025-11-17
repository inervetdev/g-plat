# 🚨 프로필 이미지 업로드 에러 수정 가이드

## 📋 에러 내용

```
Could not find the 'profile_image_url' column of 'business_cards' in the schema cache
```

**원인**: `business_cards` 테이블에 이미지 URL을 저장할 컬럼이 없음

---

## ✅ 해결 방법

### Step 1: Supabase Dashboard 접속

```
https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr
```

### Step 2: SQL Editor 열기

왼쪽 메뉴 → **SQL Editor** 클릭

### Step 3: 아래 SQL 실행

**파일**: `admin-app/add_image_columns.sql`

```sql
-- Add profile_image_url and company_logo_url columns to business_cards table
-- Run this in Supabase SQL Editor

-- Add profile_image_url column
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add company_logo_url column
ALTER TABLE public.business_cards
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.business_cards.profile_image_url IS 'URL to user profile image stored in Supabase Storage';
COMMENT ON COLUMN public.business_cards.company_logo_url IS 'URL to company logo image stored in Supabase Storage';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'business_cards'
  AND column_name IN ('profile_image_url', 'company_logo_url');

SELECT '✅ Image URL columns added successfully to business_cards table!' AS result;
```

### Step 4: 실행 결과 확인

**예상 결과**:
```
column_name          | data_type | is_nullable
---------------------|-----------|------------
profile_image_url    | text      | YES
company_logo_url     | text      | YES

result
--------------------------------------------------
✅ Image URL columns added successfully to business_cards table!
```

---

## 🔄 Step 5: Supabase 스키마 캐시 새로고침 (선택사항)

만약 여전히 에러가 발생한다면, Supabase가 스키마를 다시 로드하도록 해야 합니다:

### 방법 1: 프로젝트 일시 정지 후 재시작
1. Supabase Dashboard → **Settings** → **General**
2. **Pause project** 버튼 클릭
3. 1분 대기
4. **Resume project** 버튼 클릭

### 방법 2: SQL로 스키마 캐시 새로고침
```sql
NOTIFY pgrst, 'reload schema';
```

---

## 🧪 Step 6: 테스트

1. **https://admin.g-plat.com** 새로고침
2. **명함 관리** → 명함 선택 → **수정**
3. **프로필 이미지 업로드**
4. **완료** 버튼 클릭

✅ **성공**: "명함이 성공적으로 수정되었습니다" 메시지
❌ **실패**: 여전히 에러 발생 시 → Step 5 실행

---

## 📝 참고: react-app에도 동일한 컬럼 필요

사용자 앱(react-app)에서도 프로필 이미지를 표시하려면 동일한 컬럼이 필요합니다.

위 SQL은 `business_cards` 테이블 자체를 수정하므로, **한 번만 실행하면 admin-app과 react-app 모두에 적용**됩니다.

---

## 🔍 문제 발생 시 디버깅

### 현재 스키마 확인
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'business_cards'
ORDER BY ordinal_position;
```

### 기존 데이터 확인
```sql
SELECT id, name, profile_image_url, company_logo_url
FROM public.business_cards
LIMIT 5;
```

---

## ✅ 완료 체크리스트

- [ ] Step 1: Supabase Dashboard 접속
- [ ] Step 2: SQL Editor 열기
- [ ] Step 3: add_image_columns.sql 실행
- [ ] Step 4: 실행 결과 확인 (2개 컬럼 표시)
- [ ] Step 5: (필요시) 스키마 캐시 새로고침
- [ ] Step 6: admin-app에서 이미지 업로드 테스트

---

## 📞 완료 후

테스트 성공하면 알려주세요:
> "이미지 업로드 테스트 완료!"

그러면 다음 작업으로 진행하겠습니다.
