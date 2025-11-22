# Supabase 이메일 OTP 설정 - 실제 발송 가이드

## 중요 안내

⚠️ **Supabase Auth 설정은 MCP나 CLI로 변경할 수 없습니다.**
✅ **Dashboard에서 직접 설정해야 합니다.**

Supabase는 기본적으로 **자체 이메일 발송 서비스**를 제공하며, **별도 SMTP 설정 없이** 실제 사용자 이메일로 OTP를 발송할 수 있습니다.

---

## 1단계: Supabase Dashboard 접속

### 1-1. 프로젝트 접속
1. https://supabase.com/dashboard 접속
2. 로그인
3. 프로젝트 선택: **g-plat** (anwwjowwrxdygqyhhckr)

---

## 2단계: Email Auth 활성화 확인

### 2-1. Auth 설정 확인
**경로**: `Authentication` → `Providers` → `Email`

확인할 설정:
- ✅ **Enable Email provider**: ON (이메일 인증 활성화)
- ✅ **Confirm email**: OFF (OTP 방식 사용 시 비활성화)
- ✅ **Secure email change**: ON (이메일 변경 시 추가 보안)

### 2-2. 설정 변경 (필요 시)

**Confirm email을 OFF로 변경**:
- 기본값은 이메일 링크 확인 방식
- OTP 방식 사용 시 반드시 **OFF**로 설정
- OFF 설정 시 `auth.signUp()`에서 OTP가 자동 발송됨

```javascript
// Confirm email = OFF일 때
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: undefined  // OTP 자동 발송
  }
})
```

**설정 저장**:
- 하단 `Save` 버튼 클릭

---

## 3단계: Email Templates 한글화 (필수)

### 3-1. Email Templates 접속
**경로**: `Authentication` → `Email Templates`

### 3-2. Confirm signup 템플릿 수정

**1. 템플릿 선택**: `Confirm signup`

**2. Subject (제목) 변경**:
```
지플랫 회원가입 인증 코드
```

**3. Message Body (본문) 변경**:

```html
<h2 style="color: #4F46E5;">지플랫 회원가입을 환영합니다! 🎯</h2>

<p style="font-size: 16px; color: #374151;">
  아래 <strong>6자리 인증 코드</strong>를 입력하여 이메일을 인증해주세요.
</p>

<div style="
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  text-align: center;
  border-radius: 12px;
  margin: 30px 0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
">
  <div style="
    background-color: white;
    display: inline-block;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 36px;
    font-weight: bold;
    letter-spacing: 8px;
    color: #1F2937;
    font-family: 'Courier New', monospace;
  ">
    {{ .Token }}
  </div>
</div>

<div style="
  background-color: #FEF3C7;
  border-left: 4px solid #F59E0B;
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
">
  <p style="margin: 0; color: #92400E; font-size: 14px;">
    ⏰ <strong>유효 시간:</strong> 1시간 (3600초)
  </p>
</div>

<p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
  이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.<br>
  계정은 생성되지 않습니다.
</p>

<hr style="margin: 40px 0; border: none; border-top: 1px solid #E5E7EB;">

<div style="text-align: center; color: #9CA3AF; font-size: 12px;">
  <p style="margin: 10px 0;">
    <strong style="color: #4F46E5;">지플랫 (G-Plat)</strong><br>
    모바일 명함으로 시작하는 부업 플랫폼
  </p>
  <p style="margin: 10px 0;">
    <a href="https://gplat.kr" style="color: #4F46E5; text-decoration: none;">https://gplat.kr</a>
  </p>
  <p style="margin: 10px 0; color: #D1D5DB;">
    이 이메일은 발신 전용입니다. 답장하지 마세요.
  </p>
</div>
```

**4. Save 버튼 클릭**

### 3-3. Magic Link 템플릿 수정 (패스워드 찾기)

**1. 템플릿 선택**: `Magic Link`

**2. Subject (제목) 변경**:
```
지플랫 비밀번호 재설정 인증 코드
```

**3. Message Body (본문) 변경**:

```html
<h2 style="color: #DC2626;">비밀번호 재설정 요청 🔐</h2>

<p style="font-size: 16px; color: #374151;">
  계정의 비밀번호를 재설정하기 위한 <strong>6자리 인증 코드</strong>입니다.
</p>

<div style="
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 30px;
  text-align: center;
  border-radius: 12px;
  margin: 30px 0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
">
  <div style="
    background-color: white;
    display: inline-block;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 36px;
    font-weight: bold;
    letter-spacing: 8px;
    color: #1F2937;
    font-family: 'Courier New', monospace;
  ">
    {{ .Token }}
  </div>
</div>

<div style="
  background-color: #FEF3C7;
  border-left: 4px solid #F59E0B;
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
">
  <p style="margin: 0; color: #92400E; font-size: 14px;">
    ⏰ <strong>유효 시간:</strong> 1시간 (3600초)
  </p>
</div>

<div style="
  background-color: #FEE2E2;
  border-left: 4px solid #DC2626;
  padding: 15px;
  margin: 20px 0;
  border-radius: 4px;
">
  <p style="margin: 0; color: #991B1B; font-size: 14px;">
    ⚠️ <strong>보안 경고:</strong><br>
    이 요청을 하지 않으셨다면 즉시 고객센터로 문의하거나<br>
    비밀번호를 변경해주세요.
  </p>
</div>

<p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
  이 이메일을 요청하지 않으셨다면 계정 보안을 확인해주세요.
</p>

<hr style="margin: 40px 0; border: none; border-top: 1px solid #E5E7EB;">

<div style="text-align: center; color: #9CA3AF; font-size: 12px;">
  <p style="margin: 10px 0;">
    <strong style="color: #DC2626;">지플랫 (G-Plat)</strong><br>
    모바일 명함으로 시작하는 부업 플랫폼
  </p>
  <p style="margin: 10px 0;">
    <a href="https://gplat.kr" style="color: #DC2626; text-decoration: none;">https://gplat.kr</a>
  </p>
  <p style="margin: 10px 0; color: #D1D5DB;">
    이 이메일은 발신 전용입니다. 답장하지 마세요.
  </p>
</div>
```

**4. Save 버튼 클릭**

---

## 4단계: Rate Limits 설정

### 4-1. Rate Limits 접속
**경로**: `Authentication` → `Rate Limits`

### 4-2. 권장 설정 (프로덕션)

```
Email Sent Per Hour: 50
  → 사용자당 시간당 이메일 전송 제한
  → 기본값 2에서 50으로 증가 권장

OTP Verifications Per 5 Min: 10
  → IP당 5분당 OTP 검증 시도 제한
  → 기본값 30에서 10으로 감소 권장 (보안)

Sign-in/Sign-up Requests Per 5 Min: 20
  → IP당 5분당 회원가입/로그인 시도 제한
  → 기본값 30에서 20으로 조정 권장
```

**설정 이유**:
- 너무 높으면 악용 가능 (스팸, 봇 공격)
- 너무 낮으면 정상 사용자 불편
- 50/10/20은 일반적인 프로덕션 권장 값

**설정 저장**: `Save` 버튼 클릭

---

## 5단계: 이메일 발송 테스트

### 5-1. 프로덕션 환경 변수 활성화

`.env` 파일에서 프로덕션 환경 변수 활성화:

```bash
# react-app/.env 파일 수정
# VITE_SUPABASE_URL=http://127.0.0.1:54321  # 주석 처리
# VITE_SUPABASE_ANON_KEY=eyJhbGci...  # 주석 처리

# 프로덕션 활성화
VITE_SUPABASE_URL=https://anwwjowwrxdygqyhhckr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2ODA4ODksImV4cCI6MjA0MzI1Njg4OX0.7x3uKMZJzP9vQGXPHJrYCW_VXkVJQFP8_6g_4pJTzh4
```

### 5-2. 개발 서버 재시작

```bash
cd react-app
npm run dev
```

### 5-3. 실제 이메일로 테스트

**회원가입 테스트**:
1. http://localhost:5173/register 접속
2. **실제 이메일 주소** 입력 (예: your-email@gmail.com)
3. 비밀번호 및 이름 입력
4. "인증 코드 받기" 클릭
5. **실제 메일함 확인** (받은편지함 + 스팸함)
6. 6자리 OTP 코드 확인 및 입력
7. 인증 완료 확인

**패스워드 찾기 테스트**:
1. http://localhost:5173/forgot-password 접속
2. 등록된 이메일 입력
3. OTP 이메일 수신 확인
4. 코드 입력 및 비밀번호 재설정

---

## 추가 설정 (선택 사항)

### SMTP 서버 연동 (고급)

Supabase 기본 이메일 서비스 대신 자체 SMTP를 사용하려면:

**경로**: `Project Settings` → `Auth` → `SMTP Settings`

**권장 서비스**:
- **SendGrid**: 무료 플랜 100통/일
- **AWS SES**: 저렴한 비용, 높은 신뢰도
- **Mailgun**: 쉬운 설정, 좋은 전송률

**SendGrid 설정 예시**:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [SendGrid API Key]
Sender Name: 지플랫
Sender Email: noreply@gplat.kr
```

⚠️ **주의**:
- SMTP 연동 시 도메인 인증 필요 (SPF, DKIM 설정)
- 초기에는 Supabase 기본 서비스 사용 권장

---

## 문제 해결

### 이메일이 도착하지 않는 경우

1. **스팸 폴더 확인**
   - Gmail: "스팸함" 또는 "프로모션" 탭
   - Naver: "스팸메일함"

2. **Supabase Dashboard 로그 확인**
   - `Authentication` → `Logs`
   - 이메일 발송 성공/실패 여부 확인

3. **Rate Limit 확인**
   - Dashboard → Rate Limits 페이지
   - 제한 초과 시 대기 또는 한도 증가

4. **Email Provider 설정 확인**
   - `Authentication` → `Providers` → `Email`
   - "Enable Email provider" ON 확인

### OTP 검증 실패

1. **만료된 코드**
   - OTP는 1시간(3600초) 유효
   - "인증 코드 다시 받기" 클릭

2. **잘못된 코드**
   - 6자리 숫자 정확히 입력
   - 공백 없이 입력

3. **Confirm email 설정 확인**
   - `Authentication` → `Providers` → `Email`
   - "Confirm email" 반드시 **OFF**

---

## 설정 완료 체크리스트

회원가입 및 패스워드 찾기 OTP를 실제 이메일로 발송하기 위한 체크리스트:

- [ ] **Email Provider 활성화**
  - Authentication → Providers → Email
  - "Enable Email provider": ON
  - "Confirm email": OFF
  - Save 클릭

- [ ] **Email Templates 한글화**
  - Confirm signup 템플릿 수정
  - Magic Link 템플릿 수정
  - 제목 및 본문 한글 적용
  - Save 클릭

- [ ] **Rate Limits 설정**
  - Email Sent Per Hour: 50
  - OTP Verifications: 10
  - Sign-in/Sign-up: 20
  - Save 클릭

- [ ] **프로덕션 환경 변수 활성화**
  - .env 파일에서 프로덕션 URL 활성화
  - 로컬 URL 주석 처리

- [ ] **실제 이메일 테스트**
  - 회원가입 OTP 테스트
  - 패스워드 찾기 OTP 테스트
  - 스팸 폴더 확인
  - 한글 템플릿 표시 확인

---

## Supabase 기본 이메일 서비스 특징

### 장점
✅ **즉시 사용 가능**: SMTP 설정 불필요
✅ **안정적인 발송**: Supabase 인프라 사용
✅ **무료**: 별도 비용 없음
✅ **간편한 관리**: Dashboard에서 템플릿 관리

### 제한 사항
⚠️ **일일 전송 한도**: 프로젝트당 제한 있음 (정확한 한도는 Dashboard 확인)
⚠️ **브랜딩**: "Sent via Supabase" 표시 가능
⚠️ **커스터마이징**: SMTP보다 제한적

### 권장 사항
- **초기 단계**: Supabase 기본 서비스 사용
- **성장 단계**: SendGrid/AWS SES 연동 고려
- **대규모**: 자체 SMTP 서버 구축

---

## 관련 문서

- [Email OTP 설정 가이드](./EMAIL_OTP_SETUP.md)
- [Supabase Email Auth 공식 문서](https://supabase.com/docs/guides/auth/auth-email)
- [Email Templates 가이드](https://supabase.com/docs/guides/auth/auth-email-templates)
- [PRD 문서](../prd.md)

---

**작성일**: 2025-11-22
**버전**: 1.0
**프로젝트**: g-plat (anwwjowwrxdygqyhhckr)
