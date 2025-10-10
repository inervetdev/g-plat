# 🚨 긴급 수정: Schema Cache 에러

**에러**: "Could not find the 'cta_link' column of 'sidejob_cards' in the schema cache"
**위치**: 프로덕션 - 부가명함 수정 페이지
**원인**: 데이터베이스 마이그레이션 누락 또는 스키마 캐시 미갱신

---

## 🔍 문제 분석

### 가능한 원인
1. **마이그레이션 누락**: `002_rename_cta_url_to_cta_link.sql`이 프로덕션에 적용되지 않음
2. **스키마 캐시**: Supabase가 새 스키마를 캐시에 로드하지 않음
3. **컬럼명 불일치**: 데이터베이스는 `cta_url`, 코드는 `cta_link` 사용

---

## ✅ 즉시 해결 방법

### 방법 1: Supabase SQL Editor에서 실행 (권장)

1. **SQL Editor 접속**
   - https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/sql

2. **컬럼 확인**
   ```sql
   -- 어떤 컬럼이 있는지 확인
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'sidejob_cards'
     AND column_name IN ('cta_url', 'cta_link');
   ```

3. **결과에 따라 조치**

   **Case A: cta_url만 있는 경우** (컬럼명 변경 필요)
   ```sql
   ALTER TABLE public.sidejob_cards
   RENAME COLUMN cta_url TO cta_link;
   ```

   **Case B: cta_link가 있는 경우** (스키마 캐시 갱신 필요)
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

   **Case C: 둘 다 없는 경우** (컬럼 추가 필요)
   ```sql
   ALTER TABLE public.sidejob_cards
   ADD COLUMN cta_link TEXT;
   ```

### 방법 2: Supabase Dashboard 재시작

1. **Settings → Database**
2. **"Restart database"** 또는 **"Reload schema"** 버튼 클릭
3. 잠시 대기 (30초~1분)
4. 다시 테스트

---

## 🔍 전체 진단 스크립트

```sql
-- 실행: fix_schema_cache.sql

-- 1. 현재 sidejob_cards 테이블의 모든 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
ORDER BY ordinal_position;

-- 2. cta 관련 컬럼만 확인
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name LIKE 'cta%';

-- 3. 최근 적용된 마이그레이션 확인
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

---

## 📊 예상 결과

### 정상 상태 (cta_link 있음)
```
column_name | data_type
------------|----------
cta_link    | text
cta_text    | text
```

### 문제 상태 (cta_url만 있음)
```
column_name | data_type
------------|----------
cta_url     | text  ← 이게 문제!
cta_text    | text
```

---

## 🔄 해결 후 검증

### 1. SQL로 확인
```sql
-- cta_link 컬럼이 존재하는지 확인
SELECT COUNT(*)
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name = 'cta_link';
-- 결과: 1 (있음) / 0 (없음)
```

### 2. 애플리케이션에서 테스트
- [ ] 부가명함 수정 페이지 접속
- [ ] 기존 부가명함 수정
- [ ] CTA 링크 수정
- [ ] 저장 성공 확인
- [ ] 에러 메시지 없음

---

## 🎯 근본 원인 및 장기 해결

### 원인 분석
프로덕션 마이그레이션 시 `002_rename_cta_url_to_cta_link.sql`이 **건너뛰어짐** 또는 **이미 적용된 것으로 오인**되었을 가능성

### 장기 해결책
1. **마이그레이션 이력 확인**
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations
   WHERE version LIKE '%002%rename%';
   ```

2. **수동 마이그레이션 적용**
   - `002_rename_cta_url_to_cta_link.sql` 내용을 직접 실행

3. **향후 방지책**
   - 프로덕션 배포 전 스키마 검증 스크립트 실행
   - CI/CD 파이프라인에 스키마 검증 추가

---

## ⚡ Quick Fix (30초 안에)

```sql
-- SQL Editor에서 바로 실행:

-- 1. 컬럼명 변경 (cta_url → cta_link)
ALTER TABLE public.sidejob_cards
RENAME COLUMN cta_url TO cta_link;

-- 2. 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

-- 3. 확인
SELECT column_name FROM information_schema.columns
WHERE table_name = 'sidejob_cards' AND column_name = 'cta_link';
```

**예상 결과**: 에러 해결, 부가명함 수정 정상 작동

---

## 📝 체크리스트

- [ ] SQL Editor에서 컬럼 확인
- [ ] cta_url → cta_link 변경 (필요시)
- [ ] 스키마 캐시 갱신
- [ ] 프로덕션에서 부가명함 수정 테스트
- [ ] 에러 로그 확인
- [ ] 다른 기능 정상 작동 확인

---

**긴급도**: 🔴 High (프로덕션 기능 장애)
**예상 수정 시간**: 5분 이내
**영향 범위**: 부가명함 수정 기능만 (다른 기능 정상)
