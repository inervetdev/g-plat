---
title: "인증 시스템 개요"
category: "features"
subcategory: "authentication"
tier: 3
status: "active"
last_updated: "2025-11-22"
version: "1.0"
related_docs:
  - path: "docs/features/authentication/email-otp.md"
    description: "이메일 OTP 인증 가이드"
  - path: "docs/features/authentication/social-login.md"
    description: "소셜 로그인 구현 (예정)"
  - path: "docs/infrastructure/supabase/README.md"
    description: "Supabase 인증 설정"
tags:
  - authentication
  - supabase-auth
  - security
---

# 인증 시스템 개요

## 목적

G-Plat의 사용자 인증 및 권한 관리 시스템. Supabase Auth를 기반으로 안전하고 확장 가능한 인증을 제공합니다.

## 지원하는 인증 방식

### ✅ 구현 완료

#### 1. 이메일 OTP 인증 (Email OTP)
- **회원가입**: 이메일로 6자리 OTP 발송 → 코드 입력 인증
- **비밀번호 찾기**: 이메일 OTP로 본인 확인 → 비밀번호 재설정
- **특징**: 앱 내 완결형, 리디렉션 불필요
- **상세**: [이메일 OTP 가이드](./email-otp.md)

#### 2. 소셜 로그인 UI (OAuth)
- **Google**: UI 구현 완료 (OAuth 설정 예정)
- **Kakao**: UI 구현 완료 (OAuth 설정 예정)
- **Apple**: UI 구임 완료 (OAuth 설정 예정)
- **상태**: Phase 3에서 OAuth 구성 예정

### ⏳ 계획 중

#### 3. 휴대폰 SMS OTP (Phone OTP)
- **방식**: Supabase Auth + Twilio/MessageBird
- **용도**: 휴대폰 번호 인증
- **계획**: Phase 3 - 콜백 자동화 시스템과 연계

## 아키텍처

### Supabase Auth 기반

```
사용자 앱 (React)
    ↓
Supabase Auth API
    ↓
PostgreSQL (auth.users)
    ↓
RLS 정책 적용
```

### 인증 흐름

#### 이메일 OTP 회원가입
```
1. 사용자: 이메일/비밀번호/이름 입력
2. Frontend: supabase.auth.signUp() 호출
3. Supabase: OTP 이메일 발송
4. 사용자: 6자리 코드 입력
5. Frontend: supabase.auth.verifyOtp() 호출
6. Supabase: 이메일 인증 완료
7. Frontend: users 테이블에 프로필 생성
8. 완료: 로그인 페이지로 이동
```

#### 비밀번호 찾기
```
1. 사용자: 이메일 입력
2. Frontend: supabase.auth.signInWithOtp() 호출
3. Supabase: OTP 이메일 발송
4. 사용자: 6자리 코드 입력
5. Frontend: supabase.auth.verifyOtp() 호출
6. 사용자: 새 비밀번호 입력
7. Frontend: supabase.auth.updateUser() 호출
8. 완료: 로그인 페이지로 이동
```

## 구현 파일

### Frontend 페이지
- **회원가입**: `react-app/src/pages/NewRegisterPage.tsx`
- **로그인**: `react-app/src/pages/NewLoginPage.tsx`
- **비밀번호 찾기**: `react-app/src/pages/ForgotPasswordPage.tsx`

### Supabase 설정
- **Dashboard**: Authentication → Providers → Email
- **Email Templates**: Confirm signup, Magic Link

### 데이터베이스
- **auth.users**: Supabase 기본 사용자 테이블
- **public.users**: 앱 사용자 프로필 (name 등)
- **public.user_profiles**: 사용자 설정

## 보안 기능

### ✅ 적용된 보안
- **RLS (Row Level Security)**: 모든 테이블에 적용
- **JWT 토큰**: Supabase Auth 자동 관리
- **이메일 인증**: 회원가입 시 필수
- **비밀번호 정책**: 최소 6자 이상
- **OTP 유효기간**: 1시간 (Supabase 기본)
- **Rate Limiting**: Supabase 자동 적용

### ⏳ 추가 예정
- **2FA (Two-Factor Authentication)**: Phase 3
- **세션 관리**: 자동 로그아웃, 다중 디바이스 관리
- **감사 로그**: 로그인 이력 추적

## Supabase Dashboard 설정

### Email Provider 설정
1. **Confirm email**: ON (이메일 인증 필수)
2. **Secure email change**: ON (이메일 변경 시 재인증)
3. **Enable email OTP**: 자동 활성화 (Confirm email ON 시)

### Email Templates 커스터마이징
- **Confirm signup**: 회원가입 OTP 이메일
- **Magic Link**: 비밀번호 찾기 OTP 이메일
- **템플릿 변수**: `{{ .Token }}` (6자리 OTP 코드)

상세 설정: [이메일 OTP 가이드](./email-otp.md)

## API 사용 예시

### 회원가입
```typescript
// 1. OTP 발송
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: { name: '홍길동' },
    emailRedirectTo: undefined  // OTP 방식
  }
})

// 2. OTP 검증
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'email'  // 'signup' 대신 'email' 사용 (deprecated 방지)
})
```

### 로그인
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### 로그아웃
```typescript
const { error } = await supabase.auth.signOut()
```

### 비밀번호 재설정
```typescript
// 1. OTP 발송
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: { shouldCreateUser: false }
})

// 2. OTP 검증
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'email'
})

// 3. 새 비밀번호 설정
const { error } = await supabase.auth.updateUser({
  password: 'newpassword123'
})
```

## 트러블슈팅

### 이메일이 발송되지 않음
**증상**: OTP 이메일이 도착하지 않음
**원인**: Confirm email 설정 OFF 또는 이메일 템플릿 미구성
**해결**: [이메일 OTP 가이드](./email-otp.md#supabase-dashboard-설정) 참조

### "signup type is deprecated" 경고
**증상**: verifyOtp()에서 deprecated 경고
**원인**: `type: 'signup'` 사용
**해결**: `type: 'email'` 사용 (Supabase 권장)

### 이메일 인증 없이 로그인 가능
**증상**: OTP 검증 없이도 로그인됨
**원인**: Confirm email 설정 OFF
**해결**: Dashboard → Email Provider → Confirm email: ON

### OTP 코드가 맞는데 인증 실패
**증상**: 올바른 코드 입력해도 에러
**원인**: 1시간 유효기간 만료 또는 이미 사용됨
**해결**: 재발송 버튼 클릭하여 새 OTP 받기

## 관련 문서

### 📋 상세 가이드
- [이메일 OTP 인증](./email-otp.md) - 구현 가이드 및 설정

### 🔗 참고 문서 (docs 루트)
- [이메일 인증 방식 비교](../../SUPABASE_EMAIL_AUTH_COMPARISON.md) - Link vs OTP
- [템플릿 선택 가이드](../../SUPABASE_TEMPLATE_GUIDE.md) - Dashboard 템플릿 설정

### 🏗️ 인프라
- [Supabase 설정](../../infrastructure/supabase/README.md)
- [보안 체크리스트](../../infrastructure/security/checklist.md) (예정)

### 📚 외부 참고자료
- [Supabase Auth 공식 문서](https://supabase.com/docs/guides/auth)
- [Email OTP 가이드](https://supabase.com/docs/guides/auth/auth-email-otp)
- [verifyOtp API](https://supabase.com/docs/reference/javascript/auth-verifyotp)

---

**버전**: 1.0
**작성일**: 2025-11-22
**프로젝트**: G-Plat Mobile Business Card
