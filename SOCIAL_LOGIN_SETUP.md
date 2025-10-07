# 소셜 로그인 설정 가이드

지플랫(G-Plat) 프로젝트에 Google, Kakao, Apple 소셜 로그인이 구현되었습니다.

## 🎯 구현 완료 사항

### 1. **AuthContext 업데이트** ✅
- `signInWithGoogle()` 함수 추가
- `signInWithKakao()` 함수 추가
- `signInWithApple()` 함수 추가
- 파일: [react-app/src/contexts/AuthContext.tsx](react-app/src/contexts/AuthContext.tsx)

### 2. **LoginForm UI 업데이트** ✅
- Google, Kakao, Apple 로그인 버튼 추가
- 소셜 로그인 핸들러 구현
- 브랜드 색상 적용 (Google: White, Kakao: Yellow, Apple: Black)
- 파일: [react-app/src/components/auth/LoginForm.tsx](react-app/src/components/auth/LoginForm.tsx)

---

## 🔧 Supabase OAuth 제공자 설정 (필수)

소셜 로그인을 활성화하려면 Supabase 대시보드에서 각 제공자를 설정해야 합니다.

### 📍 Supabase 대시보드 접속
1. https://supabase.com/dashboard 로그인
2. 프로젝트 선택 (`anwwjowwrxdygqyhhckr`)
3. **Authentication > Providers** 메뉴로 이동

---

## 1️⃣ Google OAuth 설정

### Step 1: Google Cloud Console에서 OAuth 클라이언트 생성
1. https://console.cloud.google.com 접속
2. **APIs & Services > Credentials** 이동
3. **Create Credentials > OAuth client ID** 클릭
4. Application type: **Web application** 선택
5. 이름: `G-Plat Web Client`

### Step 2: Redirect URI 설정
```
Authorized redirect URIs:
https://anwwjowwrxdygqyhhckr.supabase.co/auth/v1/callback
```

### Step 3: Supabase에 등록
1. Supabase Dashboard > Authentication > Providers > Google
2. **Enable Google Provider** 토글 ON
3. Client ID와 Client Secret 입력 (Google Console에서 복사)
4. **Save** 클릭

---

## 2️⃣ Kakao OAuth 설정

### Step 1: Kakao Developers 앱 생성
1. https://developers.kakao.com 접속
2. **내 애플리케이션 > 애플리케이션 추가하기**
3. 앱 이름: `지플랫 (G-Plat)`
4. 앱 생성 후 **REST API 키** 확인

### Step 2: Redirect URI 설정
1. **플랫폼 설정 > Web 플랫폼 등록**
2. 사이트 도메인:
   ```
   https://g-plat.com
   https://anwwjowwrxdygqyhhckr.supabase.co
   ```
3. **카카오 로그인 활성화**
4. **Redirect URI 등록**:
   ```
   https://anwwjowwrxdygqyhhckr.supabase.co/auth/v1/callback
   ```

### Step 3: 동의 항목 설정
- **필수 동의**: 닉네임, 프로필 이미지
- **선택 동의**: 이메일 (사업자 인증 필요)

### Step 4: Supabase에 등록
1. Supabase Dashboard > Authentication > Providers > Kakao
2. **Enable Kakao Provider** 토글 ON
3. **Client ID**: Kakao REST API 키 입력
4. **Client Secret**: Kakao Admin 키 입력 (보안 > 코드 > Admin 키)
5. **Save** 클릭

---

## 3️⃣ Apple OAuth 설정

### Step 1: Apple Developer 계정 설정
1. https://developer.apple.com 접속
2. **Certificates, Identifiers & Profiles** 이동
3. **Identifiers > App IDs** 생성
4. **Sign In with Apple** 체크

### Step 2: Service ID 생성
1. **Identifiers > Services IDs** 생성
2. Identifier: `com.gplat.signin` (예시)
3. **Sign In with Apple** 활성화
4. **Configure** 클릭:
   - Primary App ID: 위에서 생성한 App ID 선택
   - Domain: `g-plat.com`
   - Return URL:
     ```
     https://anwwjowwrxdygqyhhckr.supabase.co/auth/v1/callback
     ```

### Step 3: Private Key 생성
1. **Keys** 메뉴에서 새 키 생성
2. **Sign In with Apple** 체크
3. Primary App ID 선택
4. **Download** 클릭 (`.p8` 파일 저장)
5. Key ID 기록

### Step 4: Supabase에 등록
1. Supabase Dashboard > Authentication > Providers > Apple
2. **Enable Apple Provider** 토글 ON
3. **Services ID**: Service ID 입력
4. **Team ID**: Apple Developer Team ID 입력
5. **Key ID**: 위에서 기록한 Key ID 입력
6. **Private Key**: `.p8` 파일 내용 복사 붙여넣기
7. **Save** 클릭

---

## 🧪 로컬 테스트

### 1. Supabase 로컬 환경 시작
```bash
cd react-app
npx supabase start
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 로그인 페이지 접속
```
http://localhost:5173/login
```

### 4. 소셜 로그인 버튼 테스트
- Google, Kakao, Apple 버튼 클릭
- OAuth 인증 플로우 확인
- 대시보드 리다이렉트 확인

---

## 🚀 프로덕션 배포

### 환경 변수 확인
Vercel 환경 변수가 올바르게 설정되어 있는지 확인:
```
VITE_SUPABASE_URL=https://anwwjowwrxdygqyhhckr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Redirect URI 추가 확인
각 OAuth 제공자 설정에서 프로덕션 도메인 추가:
```
https://g-plat.com/dashboard
```

---

## 🔍 트러블슈팅

### Google 로그인 실패
- **Error: redirect_uri_mismatch**
  - Solution: Google Cloud Console에서 정확한 Redirect URI 등록 확인

### Kakao 로그인 실패
- **Error: invalid redirect_uri**
  - Solution: Kakao Developers에서 플랫폼 도메인과 Redirect URI 확인
- **Error: consent_required**
  - Solution: 동의 항목 설정 확인 (이메일은 사업자 인증 필요)

### Apple 로그인 실패
- **Error: invalid_client**
  - Solution: Service ID, Team ID, Key ID, Private Key 재확인
- **Error: invalid_request**
  - Solution: Return URL과 Domain 설정 확인

---

## 📊 사용자 데이터 처리

### 소셜 로그인 후 사용자 프로필 생성
소셜 로그인 성공 시 자동으로 `users` 테이블에 사용자 정보가 저장됩니다.

현재 [AuthContext.tsx](react-app/src/contexts/AuthContext.tsx)의 `signUp` 함수에서 이메일/비밀번호 회원가입 시 프로필을 생성하지만, **소셜 로그인 시에는 별도 처리가 필요할 수 있습니다.**

### 권장 사항: Database Trigger 설정
Supabase에서 새 사용자 생성 시 자동으로 프로필 생성:

```sql
-- Supabase SQL Editor에서 실행
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );

  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ 체크리스트

프로덕션 배포 전 확인 사항:

- [ ] Google OAuth 클라이언트 생성 및 Supabase 등록
- [ ] Kakao Developers 앱 생성 및 Supabase 등록
- [ ] Apple Service ID 생성 및 Supabase 등록
- [ ] 모든 제공자의 Redirect URI 확인 (로컬 + 프로덕션)
- [ ] Database Trigger 설정 (선택)
- [ ] 로컬 환경에서 소셜 로그인 테스트
- [ ] 프로덕션 환경에서 소셜 로그인 테스트
- [ ] 사용자 프로필 자동 생성 확인
- [ ] 에러 핸들링 및 로깅 설정

---

## 📚 참고 문서

- [Supabase Auth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Login API](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)

---

## 🆘 지원

문제가 발생하면 다음을 확인하세요:
1. Supabase Dashboard > Logs
2. Browser DevTools Console
3. OAuth 제공자 대시보드의 에러 로그
