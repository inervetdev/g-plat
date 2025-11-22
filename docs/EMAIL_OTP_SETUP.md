# 이메일 OTP 인증 시스템 설정 가이드

## 개요

이 문서는 회원가입 및 패스워드 찾기에 사용되는 이메일 OTP 인증 시스템의 설정 방법을 안내합니다.

**구현 완료 상태**: ✅ 코드 구현 완료, ⏳ 이메일 설정 확인 필요

---

## 로컬 개발 환경 설정

### 1. Inbucket 이메일 테스팅 서버

로컬 개발 시 실제 이메일이 전송되지 않고, Inbucket 웹 인터페이스에서 확인할 수 있습니다.

**현재 설정** (`react-app/supabase/config.toml`):
```toml
[inbucket]
enabled = true
port = 54324
```

**사용 방법**:
1. Supabase 로컬 서버 시작:
   ```bash
   cd react-app
   npx supabase start
   ```

2. Inbucket 웹 인터페이스 접속:
   ```
   http://127.0.0.1:54324
   ```

3. OTP 이메일 확인:
   - 회원가입 또는 패스워드 찾기 시도
   - Inbucket 인터페이스에서 발송된 이메일 확인
   - 6자리 OTP 코드 확인

### 2. OTP 설정

**현재 설정** (`config.toml` [auth.email]):
```toml
[auth.email]
enable_signup = true              # 이메일 회원가입 허용
enable_confirmations = false      # 이메일 링크 확인 비활성화 (OTP 사용)
otp_length = 6                    # 6자리 OTP
otp_expiry = 3600                 # 1시간 유효
max_frequency = "1s"              # 이메일 재전송 최소 간격
```

### 3. Rate Limit (로컬)

**현재 설정**:
```toml
[auth.rate_limit]
email_sent = 2                    # 시간당 2개 이메일 제한 (테스트용)
token_verifications = 30          # 5분당 OTP 검증 30회
```

⚠️ **주의**: 로컬 환경은 시간당 2개 이메일만 전송 가능합니다. 테스트 시 제한에 걸릴 수 있습니다.

---

## 프로덕션 환경 설정

### 1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `g-plat` (anwwjowwrxdygqyhhckr)
3. **Authentication** → **Email Templates** 메뉴 이동

### 2. Email Provider 설정 확인

**경로**: Authentication → Settings → Email

#### 옵션 A: Supabase 기본 이메일 서비스 (권장 - 빠른 시작)
- **장점**: 설정 불필요, 즉시 사용 가능
- **단점**: 제한된 커스터마이징, 일일 전송 제한
- **설정**: 기본값 사용 (별도 설정 불필요)

#### 옵션 B: 커스텀 SMTP 서버 (프로덕션 권장)
- **장점**: 무제한 전송, 완전한 커스터마이징, 브랜딩
- **권장 서비스**: SendGrid, AWS SES, Mailgun
- **설정 필요**:
  ```
  SMTP Host: smtp.sendgrid.net (예시)
  SMTP Port: 587
  SMTP Username: apikey
  SMTP Password: [SendGrid API Key]
  Sender Name: 지플랫
  Sender Email: noreply@gplat.kr
  ```

### 3. Email Templates 확인 및 수정

OTP 이메일 템플릿을 한글화하고 브랜딩을 적용해야 합니다.

#### 템플릿 종류:
1. **Confirm signup** (회원가입 OTP)
2. **Magic Link** (패스워드 찾기 OTP)

#### 템플릿 수정 예시 (Confirm signup):

**Subject (제목)**:
```
지플랫 회원가입 인증 코드
```

**Body (본문)**:
```html
<h2>지플랫 회원가입을 환영합니다! 🎯</h2>

<p>아래 6자리 인증 코드를 입력하여 이메일을 인증해주세요.</p>

<div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
  {{ .Token }}
</div>

<p><strong>유효 시간:</strong> 1시간</p>

<p style="color: #666; font-size: 14px;">
  이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

<p style="color: #888; font-size: 12px;">
  지플랫 - 모바일 명함으로 시작하는 부업 플랫폼<br>
  <a href="https://gplat.kr">https://gplat.kr</a>
</p>
```

#### 템플릿 수정 예시 (Magic Link - 패스워드 찾기):

**Subject (제목)**:
```
지플랫 비밀번호 재설정 인증 코드
```

**Body (본문)**:
```html
<h2>비밀번호 재설정 요청</h2>

<p>비밀번호 재설정을 위한 6자리 인증 코드입니다.</p>

<div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
  {{ .Token }}
</div>

<p><strong>유효 시간:</strong> 1시간</p>

<p style="color: #666; font-size: 14px;">
  이 요청을 하지 않으셨다면 즉시 고객센터로 문의해주세요.
</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

<p style="color: #888; font-size: 12px;">
  지플랫 - 모바일 명함으로 시작하는 부업 플랫폼<br>
  <a href="https://gplat.kr">https://gplat.kr</a>
</p>
```

### 4. Rate Limits 설정

**경로**: Authentication → Settings → Rate Limits

**권장 설정 (프로덕션)**:
```
Email Sent Per Hour: 50-100
  → 사용자당 시간당 이메일 전송 제한

OTP Verifications Per 5 Min: 5-10
  → IP당 5분당 OTP 검증 시도 제한

Sign-in/Sign-up Per 5 Min: 10-20
  → IP당 5분당 회원가입/로그인 시도 제한
```

⚠️ **보안**: Rate Limit이 너무 높으면 악용 가능, 너무 낮으면 정상 사용자 불편

### 5. OTP 설정 확인

**경로**: Authentication → Settings → Auth

다음 설정이 활성화되어 있는지 확인:
- ✅ **Enable email confirmations**: OFF (OTP 사용 시)
- ✅ **Enable email signup**: ON
- ✅ **Secure email change**: ON (권장)

---

## 테스트 체크리스트

### 로컬 환경 테스트

1. **회원가입 OTP**:
   - [ ] `npm run dev` 실행
   - [ ] `/register` 페이지 접속
   - [ ] 회원가입 양식 작성
   - [ ] Inbucket (http://127.0.0.1:54324)에서 이메일 수신 확인
   - [ ] 6자리 OTP 코드 확인 및 입력
   - [ ] 인증 성공 후 로그인 페이지로 이동 확인

2. **패스워드 찾기 OTP**:
   - [ ] `/forgot-password` 페이지 접속
   - [ ] 등록된 이메일 입력
   - [ ] Inbucket에서 OTP 이메일 수신 확인
   - [ ] OTP 입력 및 검증
   - [ ] 새 비밀번호 설정
   - [ ] 로그인 페이지로 이동 확인

3. **OTP 재전송**:
   - [ ] 인증 페이지에서 "인증 코드 다시 받기" 클릭
   - [ ] 새 OTP 이메일 수신 확인

4. **에러 처리**:
   - [ ] 잘못된 OTP 입력 시 에러 메시지 표시 확인
   - [ ] 만료된 OTP 입력 시 에러 처리 확인

### 프로덕션 환경 테스트 (배포 후)

1. **실제 이메일 수신 확인**:
   - [ ] 실제 이메일 주소로 회원가입 시도
   - [ ] 받은 편지함에서 OTP 이메일 수신 확인
   - [ ] 스팸 폴더 확인

2. **이메일 템플릿 확인**:
   - [ ] 한글 제목 정상 표시
   - [ ] 본문 포맷팅 정상 표시
   - [ ] 브랜딩 (로고, 링크) 정상 작동

3. **Rate Limit 테스트**:
   - [ ] 짧은 시간 내 여러 번 OTP 요청 시 제한 작동 확인

---

## 구현된 파일

### React 컴포넌트

1. **회원가입 OTP**:
   - `react-app/src/pages/NewRegisterPage.tsx`
   - `react-app/src/pages/RegisterPage.tsx` (legacy)

2. **패스워드 찾기 OTP**:
   - `react-app/src/pages/ForgotPasswordPage.tsx`

3. **라우팅**:
   - `react-app/src/App.tsx` (경로: `/forgot-password`)

### 주요 함수

```typescript
// 회원가입 OTP 발송
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name },
    emailRedirectTo: undefined  // OTP 방식 사용
  }
})

// OTP 검증 (회원가입)
const { data, error } = await supabase.auth.verifyOtp({
  email,
  token: otp,
  type: 'signup'
})

// 패스워드 찾기 OTP 발송
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    shouldCreateUser: false  // 기존 사용자만
  }
})

// OTP 검증 (패스워드 찾기)
const { data, error } = await supabase.auth.verifyOtp({
  email,
  token: otp,
  type: 'email'
})

// 비밀번호 재설정
const { error } = await supabase.auth.updateUser({
  password: newPassword
})

// OTP 재전송
const { error } = await supabase.auth.resend({
  type: 'signup',  // 또는 'email'
  email
})
```

---

## 문제 해결

### 이메일이 도착하지 않는 경우

1. **로컬 환경**:
   - Inbucket (http://127.0.0.1:54324) 확인
   - Supabase 로컬 서버 실행 상태 확인
   - Rate Limit 초과 여부 확인

2. **프로덕션 환경**:
   - 스팸 폴더 확인
   - Email Provider 설정 확인
   - Supabase Dashboard → Logs에서 전송 로그 확인
   - Rate Limit 초과 여부 확인

### OTP 검증 실패

1. **만료된 코드**:
   - OTP는 1시간 유효
   - "인증 코드 다시 받기" 클릭하여 새 코드 발급

2. **잘못된 코드**:
   - 6자리 숫자 정확히 입력
   - 공백 없이 입력

3. **Rate Limit**:
   - 5분 내 너무 많은 시도 시 대기
   - IP 기반 제한이므로 잠시 후 재시도

---

## 다음 단계

- [x] 코드 구현 완료
- [x] TypeScript 빌드 확인
- [ ] **Supabase Dashboard에서 Email Templates 한글화**
- [ ] **프로덕션 Rate Limits 설정**
- [ ] **로컬 환경에서 OTP 플로우 테스트**
- [ ] **프로덕션 배포 및 실제 이메일 테스트**
- [ ] SendGrid/AWS SES 등 프로덕션 SMTP 연동 (선택)

---

## 관련 문서

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email OTP Guide](https://supabase.com/docs/guides/auth/auth-email-otp)
- [Email Templates Customization](https://supabase.com/docs/guides/auth/auth-email-templates)
- [PRD 문서](../prd.md)
- [비즈니스 모델](./business/business-model.md)

---

**작성일**: 2025-11-22
**최종 수정**: 2025-11-22
**버전**: 1.0
