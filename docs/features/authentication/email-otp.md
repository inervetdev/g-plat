---
title: "이메일 OTP 인증 구현 가이드"
category: "features"
subcategory: "authentication"
tier: 3
status: "active"
last_updated: "2025-11-22"
version: "1.0"
related_docs:
  - path: "docs/features/authentication/README.md"
    description: "인증 시스템 개요"
  - path: "docs/SUPABASE_EMAIL_AUTH_COMPARISON.md"
    description: "이메일 인증 방식 비교 (Link vs OTP)"
  - path: "docs/SUPABASE_TEMPLATE_GUIDE.md"
    description: "Supabase 템플릿 선택 가이드"
tags:
  - authentication
  - email-otp
  - supabase-auth
  - verification
dependencies:
  - "Supabase Auth"
  - "React 18"
  - "TypeScript"
---

# 이메일 OTP 인증 구현 가이드

## 개요

Supabase Auth의 Email OTP 기능을 사용하여 **이메일로 6자리 인증 코드를 발송**하고, 사용자가 코드를 입력하여 인증하는 시스템입니다.

### 적용 범위
- ✅ **회원가입**: 이메일 인증 필수
- ✅ **비밀번호 찾기**: OTP로 본인 확인 후 재설정

### 왜 Email OTP인가?

**사용자 요구사항**:
> "인증코드가 보내지고 확인 후 코드 기입을 통해 인증"

**장점**:
- ✅ 앱 내에서 완결 (리디렉션 불필요)
- ✅ 모바일 친화적 UX
- ✅ 보안성 우수 (링크 노출 위험 없음)
- ✅ Deep link 구성 불필요

**vs Email Link 방식**:
Email Link는 이메일에서 링크를 클릭하면 자동 인증되지만, 리디렉션 URL 설정이 필요하고 모바일 앱에서는 Deep link 구성이 복잡합니다.

상세 비교: [이메일 인증 방식 비교](../../SUPABASE_EMAIL_AUTH_COMPARISON.md)

---

## 전제 조건

### 필수 요구사항
- Supabase 프로젝트 생성 완료
- React 18+ 개발 환경
- `@supabase/supabase-js` 라이브러리 설치

### 환경 변수
```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Supabase Dashboard 설정

### 1. Email Provider 활성화

**경로**: `Authentication` → `Providers` → `Email`

#### 필수 설정
```yaml
Enable Email provider: ON
Confirm email: ON  # ⭐ 이메일 인증 필수 (OTP 활성화)
Secure email change: ON
```

**❌ 주의**: `Confirm email: OFF`로 설정하면 이메일이 발송되지 않습니다!

### 2. Email Templates 커스터마이징

Supabase는 2가지 OTP 템플릿을 제공합니다:

#### 템플릿 종류
| 템플릿 이름 | 용도 | 함수 |
|------------|------|------|
| **Confirm signup** | 회원가입 OTP | `auth.signUp()` |
| **Magic Link** | 비밀번호 찾기 OTP | `auth.signInWithOtp()` |

상세 선택 가이드: [템플릿 선택 가이드](../../SUPABASE_TEMPLATE_GUIDE.md)

#### 템플릿 구조
```html
Subject: 지플랫 회원가입 인증 코드

<h2>회원가입 인증 🎉</h2>
<p>안녕하세요! 지플랫에 가입해주셔서 감사합니다.</p>

<div style="font-size: 36px; font-family: monospace; color: #2563eb;">
  {{ .Token }}
</div>

<p>이 코드는 1시간 동안 유효합니다.</p>
```

**핵심 변수**: `{{ .Token }}` → 6자리 OTP 코드로 치환됨

#### 실제 템플릿 예시

<details>
<summary>📧 회원가입 OTP 템플릿 (HTML)</summary>

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">지플랫 회원가입 인증 🎉</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px 30px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          안녕하세요!<br>
          <strong>지플랫(G-Plat)</strong>에 가입해주셔서 진심으로 감사합니다.
        </p>

        <p style="color: #555; font-size: 14px; margin-bottom: 30px;">
          회원가입을 완료하려면 아래 <strong>6자리 인증 코드</strong>를 입력해주세요:
        </p>

        <!-- OTP Code Box -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <div style="font-size: 42px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            {{ .Token }}
          </div>
        </div>

        <!-- Warning -->
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            ⏰ <strong>유효 시간</strong>: 이 코드는 발송 후 <strong>1시간 동안</strong> 유효합니다.<br>
            🔐 <strong>보안</strong>: 이 코드를 타인과 공유하지 마세요.
          </p>
        </div>

        <p style="color: #777; font-size: 13px; margin-top: 30px; line-height: 1.5;">
          본인이 요청하지 않은 경우, 이 이메일을 무시하셔도 됩니다.<br>
          문의사항이 있으시면 <a href="mailto:support@g-plat.com" style="color: #667eea; text-decoration: none;">support@g-plat.com</a>로 연락주세요.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="margin: 0; color: #6c757d; font-size: 12px;">
          © 2025 G-Plat. All rights reserved.<br>
          모바일 명함으로 비즈니스를 연결하세요.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
```
</details>

<details>
<summary>📧 비밀번호 찾기 OTP 템플릿 (HTML)</summary>

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">비밀번호 재설정 요청 🔐</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px 30px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          안녕하세요,<br>
          <strong>지플랫(G-Plat)</strong> 계정의 비밀번호 재설정을 요청하셨습니다.
        </p>

        <p style="color: #555; font-size: 14px; margin-bottom: 30px;">
          본인 확인을 위해 아래 <strong>6자리 인증 코드</strong>를 입력해주세요:
        </p>

        <!-- OTP Code Box -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <div style="font-size: 42px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            {{ .Token }}
          </div>
        </div>

        <!-- Security Warning -->
        <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <p style="margin: 0; color: #721c24; font-size: 14px; font-weight: bold;">
            ⚠️ 보안 주의사항
          </p>
          <ul style="margin: 10px 0 0 20px; padding: 0; color: #721c24; font-size: 13px;">
            <li>이 코드는 1시간 동안 유효합니다.</li>
            <li>타인과 공유하지 마세요.</li>
            <li>본인이 요청하지 않았다면 즉시 비밀번호를 변경하세요.</li>
          </ul>
        </div>

        <p style="color: #777; font-size: 13px; margin-top: 30px; line-height: 1.5;">
          비밀번호 재설정을 요청하지 않으셨나요?<br>
          계정 보안을 위해 즉시 <a href="mailto:support@g-plat.com" style="color: #667eea; text-decoration: none;">support@g-plat.com</a>로 연락주세요.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="margin: 0; color: #6c757d; font-size: 12px;">
          © 2025 G-Plat. All rights reserved.<br>
          모바일 명함으로 비즈니스를 연결하세요.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
```
</details>

### 3. Rate Limits 설정 (선택)

**경로**: `Authentication` → `Rate Limits`

```yaml
Email sent per hour: 4  # 1시간 동안 동일 이메일로 최대 4회
```

이메일 스팸 방지 및 악용 차단.

---

## 구현

### 1. 회원가입 OTP 인증

#### 파일: `react-app/src/pages/NewRegisterPage.tsx`

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Step = 'form' | 'verify-otp'

export default function NewRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string>('')

  // 1단계: OTP 발송
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: undefined  // ⭐ OTP 방식 사용
        }
      })

      if (error) {
        setErrors({ general: '회원가입에 실패했습니다.' })
      } else {
        setMessage(`${email}로 인증 코드를 발송했습니다.`)
        setStep('verify-otp')
      }
    } catch (err) {
      setErrors({ general: '오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  // 2단계: OTP 검증
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'  // ⭐ 'signup' 대신 'email' 사용 (deprecated 방지)
      })

      if (error) {
        setErrors({ general: '인증 코드가 올바르지 않습니다.' })
      } else if (data.user) {
        // users 테이블에 프로필 생성
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          name
        })

        setMessage('이메일 인증이 완료되었습니다!')
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      setErrors({ general: 'OTP 검증 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  // OTP 재발송
  const handleResendOTP = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',  // ⭐ resend는 여전히 'signup' 사용
        email
      })

      if (error) {
        setErrors({ general: '재전송에 실패했습니다.' })
      } else {
        setMessage('인증 코드를 다시 전송했습니다.')
      }
    } catch (err) {
      setErrors({ general: '오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {step === 'form' ? (
        <form onSubmit={handleSendOTP}>
          {/* 회원가입 폼 */}
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          {/* OTP 입력 폼 */}
          <button type="button" onClick={handleResendOTP}>
            인증 코드 다시 받기
          </button>
        </form>
      )}
    </div>
  )
}
```

**핵심 포인트**:
1. `emailRedirectTo: undefined` → OTP 방식 활성화
2. `type: 'email'` → Supabase 권장 (deprecated 방지)
3. OTP 검증 성공 후 → users 테이블에 프로필 생성

### 2. 비밀번호 찾기 OTP 인증

#### 파일: `react-app/src/pages/ForgotPasswordPage.tsx`

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Step = 'email' | 'verify-otp' | 'reset-password'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string>('')

  // 1단계: OTP 발송
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false  // ⭐ 기존 사용자만
        }
      })

      if (error) {
        setErrors({ general: 'OTP 발송에 실패했습니다.' })
      } else {
        setMessage(`${email}로 인증 코드를 발송했습니다.`)
        setStep('verify-otp')
      }
    } catch (err) {
      setErrors({ general: '오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  // 2단계: OTP 검증
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'  // ⭐ 비밀번호 찾기도 'email' 사용
      })

      if (error) {
        setErrors({ general: '인증 코드가 올바르지 않습니다.' })
      } else if (data.user) {
        setMessage('인증되었습니다. 새 비밀번호를 입력하세요.')
        setStep('reset-password')
      }
    } catch (err) {
      setErrors({ general: 'OTP 검증 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  // 3단계: 비밀번호 재설정
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setErrors({ general: '비밀번호 변경에 실패했습니다.' })
      } else {
        setMessage('비밀번호가 변경되었습니다!')
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      setErrors({ general: '오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {step === 'email' && <form onSubmit={handleSendOTP}>...</form>}
      {step === 'verify-otp' && <form onSubmit={handleVerifyOTP}>...</form>}
      {step === 'reset-password' && <form onSubmit={handleResetPassword}>...</form>}
    </div>
  )
}
```

**핵심 포인트**:
1. `signInWithOtp()` + `shouldCreateUser: false` → 기존 사용자만
2. OTP 검증 성공 후 → `updateUser()`로 비밀번호 변경
3. 3단계 흐름: 이메일 → OTP → 비밀번호

---

## API 레퍼런스

### supabase.auth.signUp()

**용도**: 회원가입 + OTP 발송

```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string,
  options?: {
    data?: object,              // 사용자 메타데이터
    emailRedirectTo?: string    // undefined = OTP 방식
  }
})
```

**emailRedirectTo 설정**:
- `undefined`: OTP 방식 (6자리 코드 발송)
- `"https://..."`: Link 방식 (확인 링크 발송)

### supabase.auth.verifyOtp()

**용도**: OTP 코드 검증

```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email: string,
  token: string,  // 6자리 OTP
  type: 'email' | 'sms' | 'recovery' | ...
})
```

**type 옵션**:
- `'email'`: 이메일 OTP (signup, password reset 모두)
- `'sms'`: 휴대폰 SMS OTP
- `'recovery'`: 계정 복구 (deprecated, 'email' 사용 권장)
- ~~`'signup'`~~: Deprecated! `'email'` 사용
- ~~`'magiclink'`~~: Deprecated! `'email'` 사용

### supabase.auth.signInWithOtp()

**용도**: 비밀번호 없이 OTP로 로그인 (비밀번호 찾기에 사용)

```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  email: string,
  options?: {
    shouldCreateUser?: boolean  // 기존 사용자만: false
  }
})
```

### supabase.auth.resend()

**용도**: OTP 재발송

```typescript
const { data, error } = await supabase.auth.resend({
  type: 'signup' | 'email_change',
  email: string
})
```

**주의**: `resend()`는 여전히 `type: 'signup'` 사용 (verifyOtp와 다름)

### supabase.auth.updateUser()

**용도**: 사용자 정보 업데이트 (비밀번호 변경 등)

```typescript
const { data, error } = await supabase.auth.updateUser({
  password?: string,
  email?: string,
  data?: object
})
```

---

## 테스트

### 로컬 개발 환경

#### 1. Production Supabase 사용
```bash
# react-app/.env
VITE_SUPABASE_URL=https://anwwjowwrxdygqyhhckr.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-key
```

실제 이메일로 OTP 수신 가능.

#### 2. Local Supabase (선택)
```bash
cd react-app
npx supabase start

# Inbucket (로컬 이메일 서버)
# http://127.0.0.1:54324
```

로컬에서 Inbucket으로 이메일 확인 가능 (실제 발송 안 됨).

### 테스트 스크립트

#### 회원가입 OTP 테스트
```bash
cd react-app
node test-email-otp.mjs
```

**파일**: `react-app/test-email-otp.mjs`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
  options: {
    data: { name: '테스트 사용자' },
    emailRedirectTo: undefined
  }
})

console.log('Data:', data)
console.log('Error:', error)
```

### 수동 테스트 체크리스트

#### 회원가입 플로우
- [ ] 이메일/비밀번호 입력 후 "인증 코드 받기" 클릭
- [ ] 이메일 수신 확인 (받은편지함 + 스팸함)
- [ ] 이메일 제목: "지플랫 회원가입 인증 코드"
- [ ] 이메일 본문: 6자리 코드 표시
- [ ] OTP 입력 후 "인증 완료" 클릭
- [ ] 성공 메시지: "이메일 인증이 완료되었습니다!"
- [ ] 로그인 페이지로 자동 이동
- [ ] 로그인 성공 확인

#### 비밀번호 찾기 플로우
- [ ] 이메일 입력 후 "인증 코드 받기" 클릭
- [ ] 이메일 수신 확인
- [ ] 이메일 제목: "지플랫 비밀번호 재설정 인증 코드"
- [ ] OTP 입력 후 "인증 완료" 클릭
- [ ] 새 비밀번호 입력 화면 표시
- [ ] 비밀번호 변경 성공
- [ ] 로그인 페이지로 이동
- [ ] 새 비밀번호로 로그인 성공

#### 재발송 기능
- [ ] "인증 코드 다시 받기" 클릭
- [ ] 새 OTP 이메일 수신
- [ ] 새 코드로 인증 성공

#### 오류 처리
- [ ] 잘못된 OTP 입력 시 에러 메시지
- [ ] OTP 유효기간 만료 시 (1시간 후) 에러
- [ ] Rate limit 초과 시 (1시간 4회) 에러
- [ ] 네트워크 오류 시 적절한 메시지

---

## 트러블슈팅

### 이메일이 발송되지 않음

**증상**: OTP 요청 후 이메일이 도착하지 않음

**원인 1**: Confirm email 설정 OFF
```yaml
# Dashboard → Email Provider
Confirm email: OFF  # ❌ 이메일 발송 안 됨
```
**해결**: `Confirm email: ON`으로 변경

**원인 2**: 이메일 템플릿 미구성
**해결**: Confirm signup / Magic Link 템플릿 설정

**원인 3**: Rate limit 초과
**해결**: 1시간 후 재시도 또는 Dashboard에서 limit 조정

**원인 4**: 스팸 폴더
**해결**: 스팸함 확인

### "signup type is deprecated" 경고

**증상**: Console에 deprecated 경고
```typescript
verifyOtp({ type: 'signup' })  // ⚠️ Deprecated
```

**해결**:
```typescript
verifyOtp({ type: 'email' })  // ✅ 권장
```

[Supabase 공식 문서](https://supabase.com/docs/reference/javascript/auth-verifyotp)

### 이메일 인증 없이 로그인 가능

**증상**: OTP 검증 없이도 로그인됨

**원인**: Confirm email 설정 OFF

**해결**:
```yaml
Confirm email: ON  # ✅ 이메일 인증 필수
```

### OTP 코드가 맞는데 인증 실패

**증상**: 올바른 코드 입력해도 에러

**원인 1**: 유효기간 만료 (1시간)
**해결**: "인증 코드 다시 받기"로 새 OTP 받기

**원인 2**: 코드 이미 사용됨
**해결**: 재발송 후 새 코드 사용

**원인 3**: 이메일 주소 불일치
**해결**: OTP 발송 시 입력한 이메일과 검증 시 이메일 동일한지 확인

### SMTP 설정 오류

**증상**: "Failed to send email" 에러

**원인**: Custom SMTP 사용 시 설정 오류

**해결**:
1. Dashboard → Project Settings → Auth → SMTP Settings
2. SMTP 정보 확인 (호스트, 포트, 인증)
3. 또는 Supabase 기본 이메일 서비스 사용 (권장)

---

## 보안 고려사항

### ✅ 적용된 보안
1. **OTP 유효기간**: 1시간 (Supabase 기본)
2. **Rate Limiting**: 1시간 동안 동일 이메일로 4회 제한
3. **단일 사용**: OTP는 한 번만 사용 가능
4. **HTTPS 전송**: TLS 암호화
5. **JWT 토큰**: 인증 성공 후 자동 발급

### ⚠️ 주의사항
- OTP 이메일을 타인과 공유하지 않도록 사용자 안내
- 비밀번호 재설정 시 보안 질문 추가 고려 (Phase 3)
- 로그인 이력 추적 시스템 구축 예정

### 🔐 추가 보안 강화 (예정)
- **2FA (Two-Factor Authentication)**: Phase 3
- **IP 기반 Rate Limiting**: 악의적 공격 차단
- **이메일 인증 로그**: 감사 추적
- **의심 활동 탐지**: 비정상적인 OTP 요청 모니터링

---

## 배포

### Vercel 환경 변수 설정

**경로**: Vercel Dashboard → Project Settings → Environment Variables

```bash
VITE_SUPABASE_URL=https://anwwjowwrxdygqyhhckr.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Git 커밋 & 자동 배포

```bash
git add .
git commit -m "feat: Implement email OTP authentication"
git push origin main
```

Vercel이 자동으로 빌드 및 배포.

### 배포 후 확인

1. ✅ 회원가입 페이지 접속
2. ✅ 테스트 이메일로 OTP 발송
3. ✅ 이메일 수신 확인
4. ✅ OTP 인증 성공
5. ✅ 비밀번호 찾기 테스트

---

## 관련 문서

### 📖 상위 문서
- [인증 시스템 개요](./README.md)

### 📋 참고 문서
- [이메일 인증 방식 비교](../../SUPABASE_EMAIL_AUTH_COMPARISON.md) - Link vs OTP
- [템플릿 선택 가이드](../../SUPABASE_TEMPLATE_GUIDE.md) - Dashboard 템플릿 설정

### 🏗️ 인프라
- [Supabase 설정](../../infrastructure/supabase/README.md) (예정)
- [Vercel 배포](../../infrastructure/vercel/deployment.md) (예정)

### 📚 외부 참고자료
- [Supabase Auth 공식 문서](https://supabase.com/docs/guides/auth)
- [Email OTP 가이드](https://supabase.com/docs/guides/auth/auth-email-otp)
- [verifyOtp API 레퍼런스](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Email Templates 커스터마이징](https://supabase.com/docs/guides/auth/auth-smtp)

---

**버전**: 1.0
**작성일**: 2025-11-22
**구현 완료**: ✅ Production deployed (commits: 7ddbf76, c579190)
**프로젝트**: G-Plat Mobile Business Card
