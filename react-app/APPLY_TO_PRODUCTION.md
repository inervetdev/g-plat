# 프로덕션 데이터베이스 마이그레이션 가이드

## 🎯 목적
로컬에서 테스트된 **부가명함 카테고리 시스템** 및 **Storage 버킷**을 프로덕션 Supabase에 적용합니다.

---

## ✅ 사전 확인

### 로컬 환경 상태
- ✅ `sidejob-cards` 스토리지 버킷 생성됨
- ✅ sidejob_cards 테이블에 category 컬럼 추가됨
- ✅ 4개 인덱스 생성됨
- ✅ 4개 RLS 정책 생성됨

### 프로덕션 적용 필요 사항
1. **데이터베이스 스키마** (2개 마이그레이션)
   - ✅ Category system columns & indexes
   - ✅ Storage bucket & RLS policies

2. **확인할 것**:
   - 기존 sidejob_cards 데이터는 유지됨 (ADD COLUMN IF NOT EXISTS 사용)
   - 기존 기능에 영향 없음

---

## 📋 적용 방법

### 방법 1: Supabase SQL Editor (권장)

1. **Supabase Dashboard 접속**
   - URL: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/sql

2. **SQL 스크립트 복사**
   - 파일 열기: `apply_new_migrations_only.sql`
   - 전체 내용 복사

3. **SQL Editor에서 실행**
   - "New query" 클릭
   - 복사한 SQL 붙여넣기
   - "Run" 버튼 클릭 (또는 Ctrl+Enter)

4. **결과 확인**
   - 에러 없이 실행되어야 함
   - 각 단계마다 "NOTICE" 또는 "SUCCESS" 메시지 표시
   - 마지막 Verification 쿼리 결과 확인:
     - 5개 컬럼 (category_primary, category_secondary, tags, badge, expiry_date)
     - 4개 인덱스 (idx_sidejob_category, idx_sidejob_badge, idx_sidejob_expiry, idx_sidejob_tags)
     - 1개 버킷 (sidejob-cards)
     - 4개 정책 (INSERT, UPDATE, DELETE, SELECT)

### 방법 2: Supabase CLI (수동 확인 필요)

**주의**: 기존 마이그레이션과 충돌하므로 권장하지 않음. SQL Editor 사용을 권장합니다.

---

## 🔍 적용 후 검증

### 1. 데이터베이스 검증

**SQL Editor에서 실행**:
```sql
-- 1. Category 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sidejob_cards'
  AND column_name IN ('category_primary', 'category_secondary', 'tags', 'badge', 'expiry_date')
ORDER BY ordinal_position;
-- 예상 결과: 5 rows

-- 2. 인덱스 확인
SELECT indexname FROM pg_indexes
WHERE tablename = 'sidejob_cards'
  AND (indexname LIKE '%category%' OR indexname LIKE '%badge%' OR indexname LIKE '%expiry%' OR indexname LIKE '%tag%');
-- 예상 결과: 4 rows

-- 3. Storage 버킷 확인
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'sidejob-cards';
-- 예상 결과: 1 row (sidejob-cards, public=true, size_limit=5242880)

-- 4. Storage 정책 확인
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%sidejob%'
ORDER BY policyname;
-- 예상 결과: 4 rows
```

### 2. 애플리케이션 테스트

**프로덕션 URL에서 테스트**:
1. ✅ 로그인
2. ✅ 부가명함 관리 페이지 접속
3. ✅ 새 부가명함 추가
   - 카테고리 선택 (Primary → Secondary)
   - 이미지 업로드 (5MB 이하)
   - 제목, 설명, CTA 링크 입력
   - 배지, 가격, 유효기간 설정 (선택)
4. ✅ 부가명함 생성 성공 확인
5. ✅ 대시보드에서 명함 미리보기 - 부가명함 표시 확인
6. ✅ 실제 명함 페이지 (/card/:id) - 부가명함 표시 확인
7. ✅ 이미지 클릭 → CTA 링크로 이동 확인

---

## 🐛 문제 해결

### 에러 1: "type category_primary_type already exists"
**원인**: ENUM 타입이 이미 생성됨
**해결**: 정상 동작. NOTICE 메시지이며 무시해도 됨.

### 에러 2: "column already exists"
**원인**: 컬럼이 이미 추가됨
**해결**: 정상 동작. IF NOT EXISTS를 사용하므로 안전함.

### 에러 3: "policy already exists"
**원인**: RLS 정책이 이미 생성됨
**해결**: DROP POLICY IF EXISTS로 먼저 삭제하므로 안전함.

### 에러 4: "bucket already exists"
**원인**: 버킷이 이미 생성됨
**해결**: ON CONFLICT DO UPDATE로 업데이트하므로 안전함.

### 에러 5: 이미지 업로드 실패 "Bucket not found"
**원인**: 프로덕션에 버킷이 생성되지 않음
**해결**:
1. Supabase Dashboard → Storage → Buckets 확인
2. `sidejob-cards` 버킷이 없으면 SQL 스크립트 재실행
3. 또는 Dashboard에서 수동 생성:
   - Name: sidejob-cards
   - Public: Yes
   - Size limit: 5MB
   - MIME types: image/jpeg, image/png, image/webp, image/gif

---

## 📊 적용 체크리스트

- [ ] **1단계**: SQL 스크립트 복사
- [ ] **2단계**: Supabase SQL Editor에서 실행
- [ ] **3단계**: 에러 없이 완료 확인
- [ ] **4단계**: Verification 쿼리 결과 확인
  - [ ] 5개 컬럼 추가됨
  - [ ] 4개 인덱스 생성됨
  - [ ] 1개 버킷 생성됨
  - [ ] 4개 정책 생성됨
- [ ] **5단계**: 프로덕션에서 기능 테스트
  - [ ] 카테고리 선택 작동
  - [ ] 이미지 업로드 작동
  - [ ] 명함 페이지에서 부가명함 표시
  - [ ] 이미지 클릭 시 링크 이동
- [ ] **6단계**: 모니터링 시작
  - [ ] Error logs 확인
  - [ ] Storage 사용량 확인
  - [ ] 사용자 피드백 수집

---

## 🎉 완료!

모든 단계를 완료하면 프로덕션에서 부가명함 카테고리 시스템을 사용할 수 있습니다.

**다음 단계**:
1. Git 커밋 & 푸시 (코드 배포)
2. Vercel 자동 배포 대기
3. 사용자 테스트 진행
4. 피드백 수집 및 개선
