# 🚀 Admin RLS 정책 적용 가이드

## 📋 현재 상황

**문제**: Admin 사용자가 다른 사용자의 명함을 수정할 때 RLS 정책 위반 에러 발생

**원인**:
1. `business_cards` 테이블 - Admin 접근 권한 없음
2. `storage.objects` 테이블 - Admin이 다른 사용자 폴더에 파일 업로드 불가

**해결책**: Admin 사용자에게 특별 권한을 부여하는 RLS 정책 적용

---

## ✅ Step 1: Supabase Dashboard 접속

1. **브라우저에서 Supabase Dashboard 열기**
   ```
   https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr
   ```

2. **로그인** (dslee@inervet.com 계정)

3. **왼쪽 메뉴에서 "SQL Editor" 클릭**

---

## ✅ Step 2: Business Cards RLS 정책 적용

### 2-1. SQL Editor에서 새 쿼리 작성

**파일 경로**: `admin-app/fix-business-cards-rls.sql`

### 2-2. 전체 SQL 복사 & 붙여넣기

```sql
-- Fix business_cards RLS policies for admin users
-- Run this in Supabase SQL Editor

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can update their own cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can view their own cards" ON public.business_cards;
DROP POLICY IF EXISTS "Users can delete their own cards" ON public.business_cards;
DROP POLICY IF EXISTS "Public cards are viewable by everyone" ON public.business_cards;

-- 1. Allow users to update their own cards + admin users can update any card
CREATE POLICY "Users can update their own cards"
ON public.business_cards
FOR UPDATE
TO authenticated
USING (
  -- Original user updating their own card
  user_id = auth.uid()
  OR
  -- Admin users can update any card
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('super_admin', 'admin')
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  -- Original user updating their own card
  user_id = auth.uid()
  OR
  -- Admin users can update any card
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('super_admin', 'admin')
    AND admin_users.is_active = true
  )
);

-- 2. Allow users to view their own cards + public cards + admin users can view all
CREATE POLICY "Users can view their own cards"
ON public.business_cards
FOR SELECT
TO authenticated
USING (
  -- Original user viewing their own cards
  user_id = auth.uid()
  OR
  -- Public cards (active and with custom_url)
  (is_active = true AND custom_url IS NOT NULL)
  OR
  -- Admin users can view all cards
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('super_admin', 'admin')
    AND admin_users.is_active = true
  )
);

-- 3. Allow users to delete their own cards + admin users can delete any card
CREATE POLICY "Users can delete their own cards"
ON public.business_cards
FOR DELETE
TO authenticated
USING (
  -- Original user deleting their own card
  user_id = auth.uid()
  OR
  -- Admin users can delete any card
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role IN ('super_admin', 'admin')
    AND admin_users.is_active = true
  )
);
```

### 2-3. RUN 버튼 클릭

✅ **성공 메시지 확인**: "Success. No rows returned"

---

## ✅ Step 3: Storage RLS 정책 적용

### 3-1. 새 SQL 쿼리 작성

**파일 경로**: `admin-app/fix-storage-rls.sql`

### 3-2. 전체 SQL 복사 & 붙여넣기

```sql
-- Fix Storage RLS policies for admin users
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can upload files for any user" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update files for any user" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete files for any user" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can read all files" ON storage.objects;

-- Also drop the old user-specific policies to recreate them with admin access
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;

-- 1. Allow users to upload their own files + admin users can upload for any user
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'card-attachments'
  AND (
    -- Original user uploading their own files
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admin users can upload files for ANY user (to any folder)
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('super_admin', 'admin')
      AND admin_users.is_active = true
    )
  )
);

-- 2. Allow users to update their own files + admin users can update any files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-attachments'
  AND (
    -- Original user updating their own files
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admin users can update any files
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('super_admin', 'admin')
      AND admin_users.is_active = true
    )
  )
);

-- 3. Allow users to delete their own files + admin users can delete any files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-attachments'
  AND (
    -- Original user deleting their own files
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admin users can delete any files
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('super_admin', 'admin')
      AND admin_users.is_active = true
    )
  )
);

-- 4. Allow users to read their own files + admin users can read all files
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'card-attachments'
  AND (
    -- Original user reading their own files
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admin users can read all files
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('super_admin', 'admin')
      AND admin_users.is_active = true
    )
  )
);
```

### 3-3. RUN 버튼 클릭

✅ **성공 메시지 확인**: "Success. No rows returned"

---

## ✅ Step 4: 정책 적용 확인

### 4-1. Business Cards 정책 확인

SQL Editor에서 실행:

```sql
SELECT
    tablename,
    policyname,
    cmd as operation,
    CASE
        WHEN qual::text LIKE '%admin_users%' OR with_check::text LIKE '%admin_users%' THEN '✅ Has Admin Access'
        ELSE '❌ No Admin Access'
    END as admin_access_status
FROM pg_policies
WHERE tablename = 'business_cards'
ORDER BY cmd, policyname;
```

**예상 결과**:
```
tablename       | policyname                         | operation | admin_access_status
----------------|------------------------------------|-----------|-----------------------
business_cards  | Users can view their own cards     | SELECT    | ✅ Has Admin Access
business_cards  | Users can update their own cards   | UPDATE    | ✅ Has Admin Access
business_cards  | Users can delete their own cards   | DELETE    | ✅ Has Admin Access
```

### 4-2. Storage 정책 확인

SQL Editor에서 실행:

```sql
SELECT
    tablename,
    policyname,
    cmd as operation,
    CASE
        WHEN qual::text LIKE '%admin_users%' OR with_check::text LIKE '%admin_users%' THEN '✅ Has Admin Access'
        ELSE '❌ No Admin Access'
    END as admin_access_status
FROM pg_policies
WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%Users can%'
ORDER BY cmd, policyname;
```

**예상 결과**:
```
tablename | policyname                        | operation | admin_access_status
----------|-----------------------------------|-----------|-----------------------
objects   | Users can upload their own files  | INSERT    | ✅ Has Admin Access
objects   | Users can update their own files  | UPDATE    | ✅ Has Admin Access
objects   | Users can delete their own files  | DELETE    | ✅ Has Admin Access
objects   | Users can read their own files    | SELECT    | ✅ Has Admin Access
```

---

## ✅ Step 5: Production에서 테스트

### 5-1. Admin 앱 접속

```
https://admin.g-plat.com
```

### 5-2. 명함 수정 테스트

1. **로그인**: admin@g-plat.com으로 로그인
2. **명함 관리** 메뉴 클릭
3. **임의의 사용자 명함** 선택 (자신이 아닌 다른 사용자)
4. **수정** 버튼 클릭
5. **이미지 업로드** 또는 **필드 수정**
6. **완료** 버튼 클릭

✅ **성공 조건**:
- ❌ 이전: "new row violates row-level security policy" 에러
- ✅ 이후: 에러 없이 정상 수정됨

---

## 📝 체크리스트

- [ ] Step 1: Supabase Dashboard 접속
- [ ] Step 2: Business Cards RLS 정책 SQL 실행
- [ ] Step 3: Storage RLS 정책 SQL 실행
- [ ] Step 4-1: Business Cards 정책 확인 쿼리 실행
- [ ] Step 4-2: Storage 정책 확인 쿼리 실행
- [ ] Step 5: Production에서 명함 수정 테스트

---

## 🔍 문제 발생 시

### "policy already exists" 에러

**원인**: 이미 해당 이름의 정책이 존재
**해결**: 정상입니다! DROP POLICY IF EXISTS가 작동한 것입니다. 계속 진행하세요.

### "column admin_users.id does not exist" 에러

**원인**: admin_users 테이블 구조 문제
**해결**:
```sql
-- admin_users 테이블 구조 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'admin_users';
```

### 여전히 RLS 에러 발생

1. **브라우저 캐시 삭제** (Ctrl + Shift + R)
2. **Admin 앱 로그아웃 후 재로그인**
3. **Supabase 프로젝트 재시작** (Dashboard → Settings → General → Pause/Resume)

---

## 📚 관련 파일

- `admin-app/fix-business-cards-rls.sql` - Business Cards RLS 정책 SQL
- `admin-app/fix-storage-rls.sql` - Storage RLS 정책 SQL
- `admin-app/CREATE_ADMIN_RLS_POLICIES.sql` - 대안 방식 (is_admin() function 사용)
- `admin-app/simple-admin-storage-policy.sql` - 간소화된 Storage 정책

---

## ✅ 완료 후

모든 단계 완료 후 확인 메시지:

> "RLS 정책 적용 완료! 명함 수정 테스트 성공했어!"

그러면 다음 작업으로 진행합니다.
