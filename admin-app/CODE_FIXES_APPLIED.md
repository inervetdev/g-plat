# ✅ Code Fixes Applied

## 수정 완료 파일 목록

관리자 앱 코드를 실제 프로덕션 스키마에 맞춰 수정했습니다.

### 1. UserQRTab.tsx
**파일**: `admin-app/src/components/users/detail/UserQRTab.tsx`
**변경사항**: qr_codes 테이블 쿼리 수정
```typescript
// Before (❌ 에러 발생)
.in('card_id', cardIds)

// After (✅ 정상 동작)
.in('business_card_id', cardIds)
```
**라인**: 36

---

### 2. UserActivityTab.tsx
**파일**: `admin-app/src/components/users/detail/UserActivityTab.tsx`
**변경사항**: visitor_stats 테이블 쿼리 수정
```typescript
// Before (❌ 에러 발생)
.in('card_id', cardIds)
.order('visited_at', { ascending: false })

// After (✅ 정상 동작)
.in('business_card_id', cardIds)
.order('created_at', { ascending: false })
```
**라인**: 34-35

**추가 수정**: 타임스탬프 표시 필드명 수정
```typescript
// Before (❌ visited_at 존재하지 않음)
new Date(activity.visited_at)

// After (✅ created_at 사용)
new Date(activity.created_at)
```
**라인**: 139, 145

---

### 3. cards.ts (API)
**파일**: `admin-app/src/lib/api/cards.ts`
**변경사항**: fetchCards 함수 내 stats 쿼리 수정

#### 3-1. visitor_stats 쿼리
```typescript
// Before
.eq('card_id', card.id)

// After
.eq('business_card_id', card.id)
```
**라인**: 115

#### 3-2. qr_codes 쿼리
```typescript
// Before
.eq('card_id', card.id)

// After
.eq('business_card_id', card.id)
```
**라인**: 121

#### 3-3. sidejob_cards 쿼리 (중요!)
```typescript
// Before (❌ sidejob_cards에 card_id 컬럼 없음)
.eq('card_id', card.id)

// After (✅ user_id 기준으로 조회)
.eq('user_id', card.user_id)
```
**라인**: 137
**이유**: sidejob_cards는 특정 명함이 아닌 사용자에 연결됨

---

### 4. users.ts (API)
**파일**: `admin-app/src/lib/api/users.ts`
**변경사항**: fetchUserCards 함수 내 stats 쿼리 수정

#### 4-1. sidejob_cards 쿼리
```typescript
// Before
.eq('card_id', card.id)

// After
.eq('user_id', card.user_id)
```
**라인**: 202

#### 4-2. visitor_stats 쿼리
```typescript
// Before
.eq('card_id', card.id)

// After
.eq('business_card_id', card.id)
```
**라인**: 208

---

## 핵심 발견사항

### 1. qr_codes 테이블
- ❌ `card_id` 컬럼 없음
- ✅ `business_card_id` 컬럼 사용

### 2. visitor_stats 테이블
- ❌ `card_id` 컬럼 없음 (원래 user_id만 있음)
- ✅ **SQL 실행 후**: `business_card_id` 컬럼 추가됨
- ❌ `visited_at` 컬럼 없음
- ✅ `created_at` 컬럼 사용

### 3. sidejob_cards 테이블
- ❌ `card_id` 컬럼 없음
- ✅ `user_id` 컬럼 사용 (사용자 레벨에서 관리됨)
- **설계 의도**: 사이드잡은 특정 명함이 아닌 사용자 전체에 연결

### 4. users 테이블
- ❌ `status` 컬럼 없음 (원래 없었음)
- ✅ **SQL 실행 후**: `status` 컬럼 추가됨

---

## 다음 단계

### Step 1: SQL 실행 (필수!)
**파일**: `admin-app/APPLY_SCHEMA_FIX.sql`

Supabase Dashboard → SQL Editor에서 실행해야 함:
1. `users.status` 컬럼 추가
2. `visitor_stats.business_card_id` 컬럼 추가

### Step 2: 관리자 앱 재빌드
```bash
cd admin-app
npm run build
```

### Step 3: 프로덕션 테스트
1. 사용자 관리 페이지 → 상태 변경 테스트
2. 사용자 상세 → QR 코드 탭 확인
3. 사용자 상세 → 활동 로그 탭 확인
4. 명함 관리 페이지 → 통계 확인

---

## 체크리스트

- [x] UserQRTab.tsx 수정 완료
- [x] UserActivityTab.tsx 수정 완료
- [x] cards.ts API 수정 완료
- [x] users.ts API 수정 완료
- [ ] APPLY_SCHEMA_FIX.sql 실행 (사용자 액션 필요)
- [ ] 앱 재빌드
- [ ] 프로덕션 테스트

---

## 에러 해결 매핑

| 에러 메시지 | 원인 | 해결 방법 |
|-----------|-----|---------|
| `Could not find the 'status' column` | users 테이블에 status 컬럼 없음 | SQL로 status 컬럼 추가 |
| `column qr_codes.card_id does not exist` | 실제 컬럼명은 business_card_id | 코드에서 card_id → business_card_id 변경 |
| `Could not find a relationship between 'visitor_stats' and 'business_cards'` | visitor_stats에 business_card_id 없음 | SQL로 business_card_id 컬럼 추가 |

---

## 참고사항

- 모든 코드 수정은 **즉시 적용 가능**
- SQL 실행 없이도 일부 기능은 동작함 (QR, visitor_stats 제외)
- **SQL 실행 후 완전한 기능 복구**
