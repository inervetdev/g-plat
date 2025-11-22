# 배포 체크리스트 - 2025-11-22

## 구현된 기능
1. ✅ 사용자 명함 생성 시 프로필 사진 업로드
2. ✅ 명함 생성 필수 항목 설정 (이름, 연락처, 이메일, 커스텀URL)
3. ✅ 관리자 신규 사용자 추가
4. ✅ 관리자 사용자 삭제 (사유 입력)

---

## 🔧 1단계: 데이터베이스 마이그레이션

### ⚠️ 중요: 반드시 먼저 실행!

프로덕션 배포 전에 Supabase Dashboard에서 SQL을 실행해야 합니다.

### 실행 방법:
1. Supabase Dashboard 로그인: https://supabase.com/dashboard
2. 프로젝트 선택: `g-plat` (anwwjowwrxdygqyhhckr)
3. 좌측 메뉴 **SQL Editor** 클릭
4. **New Query** 클릭
5. 아래 SQL 복사 & 붙여넣기
6. **Run** 버튼 클릭

### SQL 마이그레이션:
```sql
-- Add user deletion tracking columns
-- This migration adds columns to track user deletion for admin audit purposes

-- 1. Add deletion tracking columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 2. Add index for querying deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at)
WHERE deleted_at IS NOT NULL;

-- 3. Add index for status queries (active, suspended, deleted)
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 4. Add comment for documentation
COMMENT ON COLUMN public.users.deleted_at IS 'Timestamp when user was deleted by admin';
COMMENT ON COLUMN public.users.deletion_reason IS 'Admin-provided reason for user deletion';
```

### 검증:
```sql
-- 마이그레이션 성공 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('deleted_at', 'deletion_reason');

-- 결과 예상:
-- column_name        | data_type
-- -------------------+------------------------
-- deleted_at         | timestamp with time zone
-- deletion_reason    | text
```

---

## 🧪 2단계: 로컬 테스트 (배포 전)

### React 사용자 앱 테스트

```bash
cd react-app
npm run dev
```

**테스트 항목:**
- [ ] 프로필 사진 업로드 UI 표시
- [ ] 이미지 미리보기 동작
- [ ] 5MB 파일 크기 제한 동작
- [ ] 이미지 파일 타입 검증 동작
- [ ] 필수 항목 (이름, 연락처, 이메일, 커스텀URL) 검증
- [ ] 명함 생성 성공 with 이미지

### Admin 앱 테스트

```bash
cd admin-app
npm run dev
```

**테스트 항목:**
- [ ] "신규 사용자 추가" 버튼 표시
- [ ] 사용자 생성 모달 열기
- [ ] 비밀번호 자동 생성 동작
- [ ] 사용자 생성 성공
- [ ] "사용자 삭제" 버튼 표시 (상세 페이지)
- [ ] 삭제 모달 열기
- [ ] 삭제 사유 및 이메일 확인 필수 검증
- [ ] 사용자 삭제 성공

---

## 🚀 3단계: 프로덕션 배포

### React 사용자 앱 배포

```bash
cd react-app

# 빌드 에러 확인
npm run build

# Vercel 배포 (자동 배포 설정된 경우 skip)
git add .
git commit -m "feat: Add profile image upload and admin user management

- Add profile image/company logo upload in card creation
- Add required field validation (name, phone, email, custom_url)
- Add admin user creation modal with password auto-generation
- Add admin user deletion modal with reason tracking
- Add DB migration for user deletion tracking columns"

git push origin main
```

### Admin 앱 배포

```bash
cd admin-app

# 빌드 에러 확인
npm run build

# Git 커밋 (React 앱과 함께 커밋되었다면 skip)
```

---

## 🔍 4단계: 프로덕션 검증

### 사용자 앱 (https://g-plat.vercel.app)

**테스트 케이스:**
1. 로그인
2. 명함 생성 페이지 이동
3. 프로필 사진 업로드 테스트
4. 필수 항목 누락 시 검증 메시지 확인
5. 명함 생성 with 이미지 성공 확인

### Admin 앱

**테스트 케이스:**
1. 관리자 로그인
2. 사용자 목록 페이지 이동
3. 신규 사용자 추가 테스트
4. 사용자 상세 페이지 이동
5. 사용자 삭제 테스트 (테스트 계정 사용)

### 데이터베이스 검증

```sql
-- 1. 프로필 이미지 URL 저장 확인
SELECT id, name, profile_image_url, company_logo_url
FROM business_cards
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Storage 업로드 확인
SELECT name, bucket_id, owner, created_at
FROM storage.objects
WHERE bucket_id = 'card-attachments'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. 사용자 생성 확인
SELECT id, email, name, subscription_tier, created_at
FROM users
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 4. 사용자 삭제 추적 확인
SELECT id, email, name, status, deleted_at, deletion_reason
FROM users
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 5;
```

---

## 📝 배포 후 작업

### 문서 업데이트
- [ ] README.md 업데이트 (새로운 기능 설명)
- [ ] CHANGELOG.md 추가
- [ ] API 문서 업데이트 (필요 시)

### 모니터링
- [ ] Vercel 배포 로그 확인
- [ ] Sentry 에러 모니터링 (설정 시)
- [ ] Supabase 로그 확인

### 팀 공유
- [ ] 배포 완료 알림
- [ ] 새로운 기능 사용 가이드 공유
- [ ] 테스트 환경 계정 정보 공유

---

## 🐛 롤백 절차 (문제 발생 시)

### Vercel 롤백
1. Vercel Dashboard → Deployments
2. 이전 안정 버전 선택
3. "Promote to Production" 클릭

### 데이터베이스 롤백 (마이그레이션)
```sql
-- 인덱스 삭제
DROP INDEX IF EXISTS public.idx_users_deleted_at;
DROP INDEX IF EXISTS public.idx_users_status;

-- 컬럼 삭제 (주의: 데이터 손실!)
ALTER TABLE public.users
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deletion_reason;
```

**⚠️ 경고:** 컬럼 삭제 시 `deleted_at`, `deletion_reason` 데이터가 영구 삭제됩니다!

---

## 📞 문제 발생 시 연락처

- 개발자: [담당자 이름]
- Supabase Dashboard: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Issues: https://github.com/inervetdev/g-plat/issues

---

## ✅ 최종 체크리스트

### 배포 전
- [ ] 마이그레이션 SQL 실행 완료
- [ ] 마이그레이션 검증 쿼리 실행
- [ ] 로컬 테스트 완료 (React 앱)
- [ ] 로컬 테스트 완료 (Admin 앱)
- [ ] TypeScript 빌드 에러 없음
- [ ] Git commit & push 완료

### 배포 중
- [ ] Vercel 배포 성공
- [ ] 배포 로그 확인

### 배포 후
- [ ] 프로덕션 사용자 앱 테스트 완료
- [ ] 프로덕션 Admin 앱 테스트 완료
- [ ] 데이터베이스 검증 쿼리 실행
- [ ] Storage 업로드 확인
- [ ] 문서 업데이트 완료
- [ ] 팀 공유 완료

---

**배포 날짜:** 2025-11-22
**배포자:** [이름]
**버전:** v2.5 (User Management Features)
