# ✅ 관리자 앱 모든 에러 수정 완료

**날짜**: 2025년 10월 29일
**작업 시간**: 약 2시간
**수정된 에러**: 총 7개

---

## 📋 발견된 문제 목록

### 1. users.status 컬럼 없음
**에러**: `Could not find the 'status' column of 'users'`
**원인**: 프로덕션 users 테이블에 status 컬럼이 존재하지 않음

### 2. qr_codes.card_id 컬럼 없음
**에러**: `column qr_codes.card_id does not exist`
**원인**: 실제 컬럼명은 `business_card_id`

### 3. visitor_stats와 business_cards 관계 없음
**에러**: `Could not find a relationship between 'visitor_stats' and 'business_cards'`
**원인**: visitor_stats에 business_card_id 컬럼이 없었음

### 4. business_cards와 users 관계 없음
**에러**: `Could not find a relationship between 'business_cards' and 'users'`
**원인**: business_cards가 auth.users를 참조, public.users 참조 필요

### 5. subscription_tier enum 값 불일치
**에러**: `invalid input value for enum subscription_tier: "free"`
**원인**: 소문자(`free`, `premium`, `business`) 사용, 대문자 필요(`FREE`, `PREMIUM`, `BUSINESS`)

### 6. 사용자 상태 변경 안됨
**증상**: 상태 변경 버튼 클릭해도 적용 안됨
**원인**: RLS 정책 없음 - 관리자가 users 테이블 수정 권한 없음

### 7. 명함 상태 변경 안됨
**증상**: 명함 활성화/비활성화 안됨
**원인**: RLS 정책 없음 - 관리자가 business_cards 테이블 수정 권한 없음

---

## 🔧 해결 방법 및 실행한 SQL

### SQL 1: APPLY_SCHEMA_FIX.sql
**목적**: 기본 스키마 수정

```sql
-- 1. users 테이블에 status 컬럼 추가
ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active';

-- 2. visitor_stats에 business_card_id 컬럼 추가
ALTER TABLE public.visitor_stats ADD COLUMN business_card_id UUID
  REFERENCES public.business_cards(id) ON DELETE CASCADE;
```

**결과**: ✅ Schema fix completed successfully!

---

### SQL 2: FIX_FOREIGN_KEY.sql
**목적**: business_cards → users 외래키 재설정

```sql
-- 기존 auth.users 참조 제거
ALTER TABLE public.business_cards DROP CONSTRAINT business_cards_user_id_fkey;

-- public.users 참조 추가
ALTER TABLE public.business_cards ADD CONSTRAINT business_cards_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
```

**결과**: ✅ Foreign key fix completed!

---

### SQL 3: RELOAD_SCHEMA_CACHE.sql
**목적**: Supabase PostgREST 스키마 캐시 리로드

```sql
NOTIFY pgrst, 'reload schema';
```

**결과**: ✅ Schema cache reload requested!

---

### SQL 4: CREATE_ADMIN_RLS_POLICIES.sql
**목적**: 관리자 RLS 정책 추가 (핵심!)

```sql
-- 헬퍼 함수: 관리자 확인
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- users 테이블 정책
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT
  TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE
  TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete users" ON public.users FOR DELETE
  TO authenticated USING (public.is_admin());

-- business_cards 테이블 정책 (동일)
-- sidejob_cards 테이블 정책 (동일)
```

**결과**: ✅ Admin RLS policies created successfully!

---

## 💻 수정한 코드 파일

### 1. 컬럼명 수정 (card_id → business_card_id)

**파일**: `admin-app/src/components/users/detail/UserQRTab.tsx`
```typescript
// Before
.in('card_id', cardIds)

// After
.in('business_card_id', cardIds)
```

**파일**: `admin-app/src/components/users/detail/UserActivityTab.tsx`
```typescript
// Before
.in('card_id', cardIds)
.order('visited_at', { ascending: false })

// After
.in('business_card_id', cardIds)
.order('created_at', { ascending: false })
```

**파일**: `admin-app/src/lib/api/cards.ts`
```typescript
// visitor_stats, qr_codes 쿼리 수정
.eq('business_card_id', card.id)

// sidejob_cards는 user_id 사용
.eq('user_id', card.user_id)
```

**파일**: `admin-app/src/lib/api/users.ts`
```typescript
// 동일하게 business_card_id로 수정
.eq('business_card_id', card.id)
```

---

### 2. Enum 값 대문자로 변경

**파일**: `admin-app/src/types/admin.ts`
```typescript
// Before
subscription_tier: 'free' | 'premium' | 'business'

// After
subscription_tier: 'FREE' | 'PREMIUM' | 'BUSINESS'
```

**수정된 파일 목록**:
- `src/types/admin.ts` - 타입 정의
- `src/lib/api/users.ts` - API 쿼리
- `src/pages/users/UsersPage.tsx` - 필터 옵션
- `src/components/users/detail/UserInfoTab.tsx` - 폼 값
- `src/pages/users/UserDetailPage.tsx` - 표시 값

---

### 3. 디버깅 로그 추가

**파일**: `admin-app/src/lib/api/users.ts`
```typescript
export async function updateUserStatus(...) {
  console.log('🔄 Updating user status:', { userId, status, reason })

  const { data, error } = await supabase
    .from('users')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()  // ← .select() 추가로 결과 확인

  console.log('📊 Update result:', { data, error })

  if (error) {
    console.error('❌ Error updating user status:', error)
    throw error
  }

  console.log('✅ User status updated successfully:', data)
}
```

---

## 📊 테스트 결과

### ✅ 테스트 1: 명함 관리
- **Before**: `Could not find a relationship` 에러
- **After**: 명함 목록 정상 표시 ✅

### ✅ 테스트 2: QR 코드 탭
- **Before**: `column qr_codes.card_id does not exist` 에러
- **After**: QR 코드 목록 정상 표시 ✅

### ✅ 테스트 3: 활동 로그 탭
- **Before**: `Could not find a relationship` 에러
- **After**: 활동 내역 정상 표시 ✅

### ✅ 테스트 4: 구독 등급 필터
- **Before**: `invalid input value for enum: "free"` 에러
- **After**: 필터 정상 작동 ✅

### ✅ 테스트 5: 사용자 상태 변경
- **Before**: `📊 Update result: {data: Array(0)}` - 권한 없음
- **After**: `📊 Update result: {data: Array(1)}` - 정상 업데이트 ✅

### ✅ 테스트 6: 명함 상태 변경
- **Before**: 상태 변경 안됨
- **After**: 정상 작동 ✅

---

## 🎯 핵심 해결책 요약

### 1. 스키마 수정 (3개 SQL)
- `users.status` 컬럼 추가
- `visitor_stats.business_card_id` 컬럼 추가
- `business_cards → users` 외래키 재설정

### 2. 코드 수정 (6개 파일)
- 컬럼명 통일: `card_id` → `business_card_id`
- Enum 값 통일: 소문자 → 대문자

### 3. RLS 정책 추가 (핵심!)
- `is_admin()` 헬퍼 함수
- 3개 테이블에 각 3개 정책 (SELECT, UPDATE, DELETE)
- 관리자의 모든 데이터 접근/수정 권한 부여

---

## 📝 생성된 문서 파일

관리자 앱 디렉토리에 생성된 문서들:

1. **SCHEMA_FIX_COMPLETE.md** - 스키마 에러 전체 가이드
2. **APPLY_SCHEMA_FIX.sql** - 기본 스키마 수정 SQL
3. **CODE_FIXES_APPLIED.md** - 코드 수정 상세 내역
4. **FIX_FOREIGN_KEY.sql** - 외래키 수정 SQL
5. **RELOAD_SCHEMA_CACHE.sql** - 스키마 캐시 리로드 SQL
6. **CREATE_ADMIN_RLS_POLICIES.sql** - RLS 정책 추가 SQL ⭐
7. **CHECK_RLS_POLICIES.sql** - RLS 정책 확인용
8. **READY_TO_EXECUTE.md** - 실행 가이드
9. **ALL_FIXES_SUMMARY.md** - 이 문서

---

## ✅ 최종 상태

### 모든 기능 정상 작동:
- ✅ 사용자 관리 (목록, 상세, 상태 변경)
- ✅ 명함 관리 (목록, 상태 변경)
- ✅ QR 코드 관리
- ✅ 활동 로그 조회
- ✅ 구독 등급 필터링
- ✅ 통계 대시보드

### 다음 작업 (Week 5 계속):
- Day 4-7: 명함 상세 페이지
- Week 6: QR 코드 관리
- Week 7: 관리자 제공 사이드잡
- Week 8: 리포트 관리

---

## 🎓 배운 교훈

1. **Supabase RLS는 기본적으로 모든 것을 차단함**
   - 정책 없으면 아무것도 수정 불가
   - `data: []` = 권한 문제 신호

2. **외래키는 관계 인식의 핵심**
   - auth.users vs public.users 차이 중요
   - PostgREST는 직접 참조만 인식

3. **Enum 값은 대소문자 구분**
   - PostgreSQL enum은 정확히 일치해야 함
   - TypeScript 타입도 동일하게 맞춰야 함

4. **디버깅은 `.select()` 추가가 핵심**
   - 업데이트 결과를 반환받아 확인
   - `data: []` vs `data: [...]`로 성공 여부 판단

---

## 🚀 성공!

모든 에러가 해결되었고, 관리자 앱이 정상 작동합니다! 🎉
