---
title: "사용자 관리 기능 테스트 계획"
category: "testing"
date: "2025-11-22"
features:
  - "프로필 이미지 업로드"
  - "필수 항목 검증"
  - "관리자 사용자 생성"
  - "관리자 사용자 삭제"
---

# 사용자 관리 기능 테스트 계획

## 개요

이 문서는 2025-11-22에 구현된 사용자 관리 관련 4가지 기능의 테스트 계획을 설명합니다.

## 구현된 기능

1. **사용자 명함 생성 시 프로필 사진 업로드**
   - 파일: `react-app/src/pages/CreateCardPageOptimized.tsx`
   - 기능: 프로필 사진 및 회사 로고 업로드

2. **명함 생성 필수 항목 설정**
   - 필수 항목: 이름, 연락처, 이메일, 커스텀 URL
   - 클라이언트 측 검증

3. **관리자 사용자 생성**
   - 파일: `admin-app/src/components/users/UserCreateModal.tsx`
   - Supabase Auth Admin API 사용

4. **관리자 사용자 삭제 (사유 입력)**
   - 파일: `admin-app/src/components/users/UserDeleteModal.tsx`
   - 삭제 사유 및 이메일 확인 필수

---

## 테스트 환경

### 로컬 테스트
```bash
# React 사용자 앱
cd react-app
npm run dev
# http://localhost:5173

# Admin 앱
cd admin-app
npm run dev
# http://localhost:5174
```

### 프로덕션 테스트
- 사용자 앱: https://g-plat.vercel.app
- 관리자 앱: TBD

---

## 1. 프로필 이미지 업로드 테스트

### 사전 조건
- [x] Supabase Storage 버킷 `card-attachments` 생성 확인
- [x] RLS 정책 적용 확인
- [x] `business_cards` 테이블에 `profile_image_url`, `company_logo_url` 컬럼 존재

### 테스트 케이스

#### TC-1.1: 프로필 사진 업로드 UI 존재 확인
**단계:**
1. 사용자로 로그인
2. 명함 생성 페이지 이동 (`/create-card`)
3. 스크롤하여 "이미지" 섹션 확인

**예상 결과:**
- ✅ "프로필 사진" 라벨 표시
- ✅ "회사 로고" 라벨 표시
- ✅ 각각의 업로드 버튼 존재

#### TC-1.2: 프로필 사진 업로드 및 미리보기
**단계:**
1. "사진 선택" 버튼 클릭
2. JPG/PNG 이미지 선택 (< 5MB)
3. 미리보기 확인

**예상 결과:**
- ✅ 미리보기 이미지 표시 (24x24, rounded-full)
- ✅ 삭제 버튼 (×) 표시
- ✅ 삭제 버튼 클릭 시 이미지 제거

#### TC-1.3: 파일 크기 검증
**단계:**
1. 5MB 이상의 이미지 선택

**예상 결과:**
- ✅ Alert: "파일 크기는 5MB 이하여야 합니다"
- ✅ 이미지 업로드 안됨

#### TC-1.4: 파일 타입 검증
**단계:**
1. 이미지가 아닌 파일 선택 (예: PDF, TXT)

**예상 결과:**
- ✅ Alert: "이미지 파일만 업로드 가능합니다"
- ✅ 파일 업로드 안됨

#### TC-1.5: 명함 생성 with 이미지
**단계:**
1. 프로필 사진 업로드
2. 회사 로고 업로드
3. 필수 항목 입력 (이름, 연락처, 이메일, 커스텀 URL)
4. "명함 생성" 버튼 클릭

**예상 결과:**
- ✅ 콘솔: "📤 Uploading profile image..."
- ✅ 콘솔: "📤 Uploading company logo..."
- ✅ 콘솔: "✅ Upload success: [URL]"
- ✅ Supabase Storage에 파일 업로드 확인
- ✅ business_cards 테이블에 URL 저장 확인

---

## 2. 필수 항목 검증 테스트

### 테스트 케이스

#### TC-2.1: 필수 항목 표시 확인
**단계:**
1. 명함 생성 페이지 이동

**예상 결과:**
- ✅ "전화번호 *" 라벨
- ✅ "이메일 *" 라벨
- ✅ "커스텀 URL *" 라벨
- ✅ 이름 필드 (기본 필수)

#### TC-2.2: 이름 누락 검증
**단계:**
1. 이름 미입력
2. "명함 생성" 클릭

**예상 결과:**
- ✅ Alert: "이름을 입력해주세요."
- ✅ 폼 제출 안됨

#### TC-2.3: 연락처 누락 검증
**단계:**
1. 이름 입력, 연락처 미입력
2. "명함 생성" 클릭

**예상 결과:**
- ✅ Alert: "연락처를 입력해주세요."

#### TC-2.4: 이메일 누락 검증
**단계:**
1. 이름, 연락처 입력, 이메일 미입력
2. "명함 생성" 클릭

**예상 결과:**
- ✅ Alert: "이메일을 입력해주세요."

#### TC-2.5: 커스텀 URL 누락 검증
**단계:**
1. 이름, 연락처, 이메일 입력, 커스텀 URL 미입력
2. "명함 생성" 클릭

**예상 결과:**
- ✅ Alert: "커스텀 URL을 입력해주세요."

#### TC-2.6: 모든 필수 항목 입력 후 성공
**단계:**
1. 이름, 연락처, 이메일, 커스텀 URL 모두 입력
2. "명함 생성" 클릭

**예상 결과:**
- ✅ 명함 생성 성공
- ✅ 대시보드로 리디렉션

---

## 3. 관리자 사용자 생성 테스트

### 사전 조건
- [x] 관리자 계정으로 로그인
- [x] `UserCreateModal` 컴포넌트 존재
- [x] Supabase Auth Admin API 권한 확인

### 테스트 케이스

#### TC-3.1: 신규 사용자 추가 버튼 존재
**단계:**
1. 관리자로 로그인
2. `/users` 페이지 이동

**예상 결과:**
- ✅ "신규 사용자 추가" 버튼 표시 (녹색)

#### TC-3.2: 모달 열기
**단계:**
1. "신규 사용자 추가" 버튼 클릭

**예상 결과:**
- ✅ "신규 사용자 생성" 모달 표시
- ✅ 이메일, 이름, 비밀번호 입력 필드
- ✅ 구독 등급 선택 (FREE, PREMIUM, BUSINESS)
- ✅ "자동 생성" 버튼 (비밀번호)

#### TC-3.3: 비밀번호 자동 생성
**단계:**
1. 모달 열기
2. "자동 생성" 버튼 클릭

**예상 결과:**
- ✅ 비밀번호 필드에 12자 랜덤 문자열 입력됨

#### TC-3.4: 사용자 생성 성공
**단계:**
1. 이메일: test@example.com
2. 이름: 테스트 사용자
3. 비밀번호: (자동 생성 또는 수동 입력)
4. 구독 등급: FREE
5. "생성" 버튼 클릭

**예상 결과:**
- ✅ 콘솔: 사용자 생성 로그
- ✅ Alert: "사용자가 성공적으로 생성되었습니다."
- ✅ 이메일 및 비밀번호 표시
- ✅ users 테이블에 레코드 추가
- ✅ user_profiles 테이블에 레코드 추가
- ✅ auth.users에 사용자 추가
- ✅ email_confirmed = true
- ✅ 사용자 목록 새로고침

#### TC-3.5: 중복 이메일 에러
**단계:**
1. 이미 존재하는 이메일로 사용자 생성 시도

**예상 결과:**
- ✅ 에러 메시지 표시
- ✅ 사용자 생성 안됨

#### TC-3.6: 롤백 테스트 (프로필 생성 실패)
**단계:**
1. 사용자 생성 중 user_profiles 삽입 실패 시뮬레이션 (수동 테스트)

**예상 결과:**
- ✅ auth.users에서 사용자 삭제됨 (롤백)
- ✅ 에러 메시지 표시

---

## 4. 관리자 사용자 삭제 테스트

### 사전 조건
- [x] `users` 테이블에 `deleted_at`, `deletion_reason` 컬럼 추가
- [x] 마이그레이션 적용: `20251122000000_add_user_deletion_tracking.sql`
- [x] `UserDeleteModal` 컴포넌트 존재

### 테스트 케이스

#### TC-4.1: 사용자 삭제 버튼 존재
**단계:**
1. 관리자로 로그인
2. 사용자 상세 페이지 이동 (`/users/:userId`)

**예상 결과:**
- ✅ "사용자 삭제" 버튼 표시 (빨간색)

#### TC-4.2: 모달 열기 및 경고 메시지
**단계:**
1. "사용자 삭제" 버튼 클릭

**예상 결과:**
- ✅ "사용자 삭제" 모달 표시
- ✅ 경고 아이콘 및 "이 작업은 되돌릴 수 없습니다" 메시지
- ✅ 주의사항 목록:
  - 사용자 계정 영구 삭제
  - 모든 명함 삭제
  - 부가명함 삭제
  - QR 코드 및 통계 데이터 삭제
  - 복구 불가

#### TC-4.3: 삭제 대상 사용자 정보 표시
**단계:**
1. 모달 열기

**예상 결과:**
- ✅ 사용자 이름 표시
- ✅ 사용자 이메일 표시
- ✅ 구독 등급 표시
- ✅ 가입일 표시

#### TC-4.4: 삭제 사유 입력 검증
**단계:**
1. 모달 열기
2. 삭제 사유 미입력
3. 이메일 확인 입력
4. "영구 삭제" 버튼 상태 확인

**예상 결과:**
- ✅ 버튼 비활성화 (disabled)

#### TC-4.5: 이메일 확인 검증
**단계:**
1. 삭제 사유 입력
2. 잘못된 이메일 입력
3. "영구 삭제" 버튼 상태 확인

**예상 결과:**
- ✅ 버튼 비활성화

#### TC-4.6: 이메일 불일치 에러
**단계:**
1. 삭제 사유: "테스트 사유"
2. 이메일: "wrong@email.com" (실제 이메일과 다름)
3. "영구 삭제" 클릭

**예상 결과:**
- ✅ 에러 메시지: "이메일 주소가 일치하지 않습니다"
- ✅ 삭제 진행 안됨

#### TC-4.7: 사용자 삭제 성공
**단계:**
1. 삭제 사유: "규정 위반"
2. 이메일: (정확한 사용자 이메일)
3. "영구 삭제" 클릭

**예상 결과:**
- ✅ 로딩 표시 ("삭제 중...")
- ✅ users 테이블 업데이트:
  - `status = 'deleted'`
  - `deleted_at = [현재 시각]`
  - `deletion_reason = '규정 위반'`
- ✅ auth.users에서 사용자 삭제
- ✅ Alert: "사용자가 성공적으로 삭제되었습니다."
- ✅ `/users` 페이지로 리디렉션

#### TC-4.8: Auth 삭제 실패 시 롤백
**단계:**
1. 사용자 삭제 시도
2. Auth 삭제 단계에서 실패 시뮬레이션

**예상 결과:**
- ✅ users 테이블 롤백:
  - `status = [원래 상태]`
  - `deleted_at = null`
  - `deletion_reason = null`
- ✅ 에러 메시지 표시

---

## 데이터베이스 검증 쿼리

### 프로필 이미지 업로드 확인
```sql
SELECT id, name, profile_image_url, company_logo_url
FROM business_cards
WHERE user_id = '[USER_ID]'
ORDER BY created_at DESC
LIMIT 1;
```

### Supabase Storage 확인
```sql
SELECT name, bucket_id, owner, created_at
FROM storage.objects
WHERE bucket_id = 'card-attachments'
  AND owner = '[USER_ID]'
ORDER BY created_at DESC;
```

### 사용자 생성 확인
```sql
-- users 테이블
SELECT id, email, name, subscription_tier, created_at
FROM users
WHERE email = 'test@example.com';

-- user_profiles 테이블
SELECT user_id, created_at
FROM user_profiles
WHERE user_id = '[USER_ID]';

-- auth.users (Supabase Dashboard에서 확인)
```

### 사용자 삭제 확인
```sql
-- users 테이블 상태 확인
SELECT id, email, name, status, deleted_at, deletion_reason
FROM users
WHERE id = '[USER_ID]';

-- Auth에서 삭제 확인 (Dashboard)
-- auth.users에서 해당 사용자 검색 -> 존재하지 않아야 함
```

---

## 자동화 테스트 실행

### Playwright E2E 테스트
```bash
cd react-app

# 모든 테스트 실행
npx playwright test tests/user-management.spec.ts

# 특정 테스트만 실행
npx playwright test tests/user-management.spec.ts -g "profile image"

# UI 모드로 실행
npx playwright test tests/user-management.spec.ts --ui
```

**참고:** 현재 E2E 테스트는 환경 변수 설정 필요:
- `RUN_USER_TESTS=true` - 사용자 앱 테스트
- `RUN_ADMIN_TESTS=true` - 관리자 앱 테스트
- `RUN_INTEGRATION_TESTS=true` - 통합 테스트

---

## 프로덕션 배포 전 체크리스트

### 데이터베이스
- [ ] 마이그레이션 적용: `20251122000000_add_user_deletion_tracking.sql`
- [ ] `users.deleted_at` 컬럼 존재 확인
- [ ] `users.deletion_reason` 컬럼 존재 확인
- [ ] 인덱스 생성 확인: `idx_users_deleted_at`, `idx_users_status`

### Storage
- [ ] `card-attachments` 버킷 존재
- [ ] RLS 정책 적용 확인
- [ ] 파일 크기 제한: 10MB (코드에서 5MB로 제한)

### 코드 검증
- [ ] TypeScript 빌드 에러 없음
- [ ] React 사용자 앱 빌드 성공
- [ ] Admin 앱 빌드 성공
- [ ] 환경 변수 설정 (Vercel)

### 기능 테스트 (로컬)
- [ ] 프로필 이미지 업로드 성공
- [ ] 필수 항목 검증 동작
- [ ] 관리자 사용자 생성 성공
- [ ] 관리자 사용자 삭제 성공

---

## 테스트 결과 기록

| TC ID | 테스트 케이스 | 상태 | 테스터 | 날짜 | 비고 |
|-------|--------------|------|--------|------|------|
| TC-1.1 | 프로필 사진 UI | ⏳ | - | - | - |
| TC-1.2 | 이미지 미리보기 | ⏳ | - | - | - |
| TC-1.3 | 파일 크기 검증 | ⏳ | - | - | - |
| TC-1.4 | 파일 타입 검증 | ⏳ | - | - | - |
| TC-1.5 | 명함 생성 with 이미지 | ⏳ | - | - | - |
| TC-2.1 | 필수 항목 표시 | ⏳ | - | - | - |
| TC-2.2 | 이름 누락 검증 | ⏳ | - | - | - |
| TC-2.3 | 연락처 누락 검증 | ⏳ | - | - | - |
| TC-2.4 | 이메일 누락 검증 | ⏳ | - | - | - |
| TC-2.5 | 커스텀 URL 누락 | ⏳ | - | - | - |
| TC-2.6 | 모든 필수 항목 입력 | ⏳ | - | - | - |
| TC-3.1 | 사용자 추가 버튼 | ⏳ | - | - | - |
| TC-3.2 | 모달 열기 | ⏳ | - | - | - |
| TC-3.3 | 비밀번호 자동 생성 | ⏳ | - | - | - |
| TC-3.4 | 사용자 생성 성공 | ⏳ | - | - | - |
| TC-3.5 | 중복 이메일 에러 | ⏳ | - | - | - |
| TC-3.6 | 롤백 테스트 | ⏳ | - | - | - |
| TC-4.1 | 삭제 버튼 존재 | ⏳ | - | - | - |
| TC-4.2 | 모달 및 경고 | ⏳ | - | - | - |
| TC-4.3 | 사용자 정보 표시 | ⏳ | - | - | - |
| TC-4.4 | 삭제 사유 검증 | ⏳ | - | - | - |
| TC-4.5 | 이메일 확인 검증 | ⏳ | - | - | - |
| TC-4.6 | 이메일 불일치 에러 | ⏳ | - | - | - |
| TC-4.7 | 사용자 삭제 성공 | ⏳ | - | - | - |
| TC-4.8 | Auth 삭제 롤백 | ⏳ | - | - | - |

**상태:**
- ⏳ 대기
- ✅ 성공
- ❌ 실패
- ⚠️ 일부 성공

---

## 알려진 이슈

없음 (초기 릴리스)

---

## 참고 문서

- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
- [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [Playwright Testing](https://playwright.dev/)
