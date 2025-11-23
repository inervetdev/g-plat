# 사용자 상태 관리 재설계 (v3.0)

## 🔄 변경 요구사항

### 기존 설계 (v2.5.5)
- **비활성**: 로그인 가능, 데이터 접근 제한
- **정지**: RLS로 데이터 접근 차단
- **삭제**: Soft delete (deleted_at), 로그인 차단

### 새로운 설계 (v3.0)
- **비활성 (inactive)**:
  - ✅ 로그인 가능
  - ❌ 생성, 수정 불가능
  - ✅ 삭제만 가능
  - ⚠️  모든 명함과 부가명함 자동 비활성화

- **정지 (suspended)**:
  - ❌ 로그인 불가능 (팝업 표시)
  - ❌ 모든 기능 차단
  - ⚠️  모든 명함과 부가명함 자동 비활성화

- **삭제 (DELETE)**:
  - ❌ Soft delete 제거
  - 💥 Hard delete (완전 삭제)
  - 🗑️  사용자 정보, 명함, 부가명함 등 모든 데이터 삭제
  - ⚠️  CASCADE로 연관 데이터 자동 삭제

## 📊 UI 변경사항

### 1. 관리자 페이지 - 사용자 목록
- 상태 필터: **활성**, **비활성**, **정지** (3가지만)
- ~~삭제대기~~ 제거

### 2. 관리자 페이지 - 사용자 상세
- **상태 변경** 버튼: 활성/비활성/정지/삭제 통합
- ~~사용자 삭제~~ 버튼 제거
- 삭제 옵션을 상태 변경 모달에 통합

### 3. 상태 변경 모달 (UserStatusModal)
- 활성화
- 비활성화
- 정지 (사유 필수)
- **삭제** (신규 추가, 이메일 확인 + 사유 필수)

## 🔧 구현 작업 목록

### Frontend 작업

#### 1. UserStatusModal.tsx 수정
- [x] 삭제 옵션 추가
- [ ] 이메일 확인 입력 필드
- [ ] 삭제 사유 필수 입력
- [ ] Hard delete API 호출

#### 2. UserDetailPage.tsx 수정
- [ ] "사용자 삭제" 버튼 제거
- [ ] UserDeleteModal import 제거

#### 3. UsersPage.tsx 수정
- [ ] "삭제대기" 필터 옵션 제거
- [ ] 목록에서 deleted_at 체크 로직 제거

#### 4. UserInfoTab.tsx 수정
- [ ] 삭제 관련 UI 제거 (상태 정보 카드)
- [ ] deleted_at 조건부 렌더링 제거

#### 5. 타입 정의 수정
- [ ] UserFilters에서 'deleted' 제거
- [ ] User 인터페이스에서 deleted_at, deletion_reason 제거 (선택)

### Backend 작업

#### 6. RLS 정책 수정
- [ ] business_cards: inactive 사용자 생성/수정 차단
- [ ] business_cards: inactive 사용자 삭제만 허용
- [ ] business_cards: 사용자 비활성화 시 모든 카드 is_active = false
- [ ] sidejob_cards: 동일 로직 적용

#### 7. Database Trigger
- [ ] users.status 변경 시 모든 카드 비활성화 트리거
- [ ] CASCADE 설정 확인 (사용자 삭제 시 관련 데이터 자동 삭제)

#### 8. API 엔드포인트
- [ ] DELETE /users/:id - Hard delete 구현
- [ ] useDeleteUser hook 수정

### 로그인 페이지 수정

#### 9. LoginPage / NewLoginPage 수정
- [ ] suspended 사용자 로그인 차단
- [ ] deleted_at 체크 로직 제거
- [ ] 정지 팝업 메시지: "계정이 정지되었습니다. 관리자에게 문의하세요."

## ⚠️  주의사항

1. **데이터 손실 위험**: Hard delete는 복구 불가
2. **CASCADE 확인 필요**: 모든 연관 테이블 확인
3. **마이그레이션 순서**:
   - RLS 정책 업데이트
   - Trigger 생성
   - Frontend 배포
   - 기존 deleted_at 데이터 정리

## 🔍 테스트 체크리스트

- [ ] 비활성 사용자: 로그인 성공, 생성/수정 차단, 삭제 가능
- [ ] 비활성 사용자: 모든 카드 자동 비활성화
- [ ] 정지 사용자: 로그인 차단, 정지 메시지 표시
- [ ] 정지 사용자: 모든 카드 자동 비활성화
- [ ] 사용자 삭제: 완전 삭제, 연관 데이터 CASCADE 삭제
- [ ] 상태 변경 모달: 삭제 옵션 정상 작동

## 📝 다음 단계

1. UserStatusModal에 삭제 옵션 추가
2. 로그인 페이지 정지 사용자 차단
3. RLS 정책 수정
4. Trigger 생성
5. 기존 UI에서 deleted_at 관련 코드 제거
