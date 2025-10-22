# 관리자 앱 Vercel 배포 가이드
**admin.g-plat.com으로 배포하기**

---

## 📋 배포 개요

- **사용자 앱**: g-plat.com (기존 배포됨)
- **관리자 앱**: admin.g-plat.com (신규 배포)

---

## 🎯 방법 1: Monorepo 구조로 배포 (권장)

현재 프로젝트가 이미 Monorepo 구조로 되어 있으므로, 동일한 GitHub 저장소에서 별도 Vercel 프로젝트로 배포합니다.

### Step 1: admin-app에 vercel.json 생성

```bash
cd admin-app
```

`admin-app/vercel.json` 파일 생성:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: GitHub에 커밋 & 푸시

```bash
# 루트 디렉토리에서
git add admin-app/
git add ADMIN_*
git commit -m "feat: Add admin web service with dashboard UI"
git push origin main
```

### Step 3: Vercel에서 새 프로젝트 생성

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **"Add New..." → Project** 클릭
3. **Import Git Repository**:
   - 동일한 저장소 (`inervetdev/g-plat`) 선택
4. **Configure Project**:
   - **Project Name**: `g-plat-admin`
   - **Framework Preset**: Vite
   - **Root Directory**: `admin-app` ⚠️ **중요!**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 4: Environment Variables 설정

Vercel 프로젝트 설정에서 다음 환경 변수 추가:

```env
VITE_SUPABASE_URL=https://anwwjowwrxdygqyhhckr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODg0OTUsImV4cCI6MjA3NDU2NDQ5NX0.uKtcf8jpHuY6JYb2i3bKhmCayvecc4Ezf6go5Luh5gs
VITE_APP_NAME=G-PLAT Admin
VITE_APP_URL=https://admin.g-plat.com
```

### Step 5: 커스텀 도메인 설정

1. **Vercel 프로젝트 → Settings → Domains**
2. **Add Domain** 클릭
3. `admin.g-plat.com` 입력
4. **Add** 클릭

#### DNS 설정 (도메인 제공업체)

Vercel이 자동으로 DNS 레코드 제공:

**Option A: CNAME 레코드** (권장)
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

**Option B: A 레코드**
```
Type: A
Name: admin
Value: 76.76.21.21 (Vercel IP)
```

### Step 6: 배포 확인

1. DNS 전파 대기 (최대 48시간, 보통 5-10분)
2. https://admin.g-plat.com 접속 확인
3. 로그인 테스트: admin@g-plat.com / admin1234!

---

## 🎯 방법 2: 동일 Vercel 프로젝트 내 라우팅 (대안)

기존 사용자 앱 프로젝트에서 `/admin` 경로로 관리자 앱을 제공하는 방법입니다.

### 단점:
- ❌ 빌드 시간 증가
- ❌ 배포 실패 시 사용자 앱도 영향
- ❌ 독립적인 스케일링 불가능

**권장하지 않음** - 관리자와 사용자 앱은 분리하는 것이 Best Practice

---

## 🔐 보안 설정 (중요!)

### 1. Vercel 프로젝트 접근 제한

**Vercel → Project Settings → Deployment Protection**:
- ✅ Enable Password Protection for Preview Deployments
- ✅ Enable IP Allowlist (선택사항)

### 2. Supabase RLS 정책 확인

관리자 앱은 `admin_users` 테이블의 RLS 정책으로 보호됩니다:
```sql
-- 이미 적용됨
CREATE POLICY "Only admins can access"
ON admin_users FOR SELECT
USING (auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true));
```

### 3. 환경 변수 보안

- ✅ Service Role Key는 **절대 클라이언트에 노출하지 않음**
- ✅ Anon Key만 VITE_ 접두사로 노출
- ✅ 민감한 API 키는 Vercel Environment Variables에만 저장

---

## 📊 배포 후 확인 사항

### ✅ 체크리스트

- [ ] https://admin.g-plat.com 접속 확인
- [ ] SSL 인증서 자동 발급 확인 (Vercel이 자동 처리)
- [ ] 로그인 테스트 (admin@g-plat.com)
- [ ] 대시보드 페이지 렌더링 확인
- [ ] Supabase 연결 확인
- [ ] 통계 데이터 로드 확인
- [ ] HMR 및 빌드 에러 없음

---

## 🚀 배포 명령어 요약

```bash
# 1. admin-app에 vercel.json 추가 (위 내용)
# 2. Git 커밋 & 푸시
git add admin-app/
git add ADMIN_*.md
git commit -m "feat: Add admin web service"
git push origin main

# 3. Vercel 대시보드에서:
#    - New Project 생성
#    - Root Directory: admin-app
#    - 환경 변수 설정
#    - 도메인 추가: admin.g-plat.com

# 4. DNS 설정 (도메인 제공업체)
#    CNAME admin → cname.vercel-dns.com
```

---

## 🔄 CI/CD 자동 배포

Vercel은 GitHub과 연동되어 자동 배포됩니다:

- **main 브랜치 푸시** → 프로덕션 배포 (admin.g-plat.com)
- **다른 브랜치 푸시** → 프리뷰 배포 (임시 URL)
- **Pull Request** → 자동 프리뷰 생성

---

## 🐛 트러블슈팅

### 문제 1: "Module not found" 에러

**원인**: Root Directory 설정 오류

**해결**:
1. Vercel → Project Settings → General
2. Root Directory: `admin-app` 확인
3. Redeploy

### 문제 2: 환경 변수가 로드되지 않음

**원인**: VITE_ 접두사 누락

**해결**:
- 모든 환경 변수는 `VITE_`로 시작해야 함
- Vercel에서 환경 변수 수정 후 Redeploy

### 문제 3: CSS가 로드되지 않음

**원인**: Tailwind CSS 설정 오류

**해결**:
```bash
cd admin-app
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
npm run build
```

### 문제 4: 라우팅이 작동하지 않음 (404)

**원인**: SPA 라우팅 설정 누락

**해결**: `admin-app/vercel.json`에 rewrites 추가 (위 참조)

---

## 📚 참고 문서

- [Vercel Monorepo 배포](https://vercel.com/docs/concepts/monorepos)
- [Vite 프로젝트 배포](https://vitejs.dev/guide/static-deploy.html#vercel)
- [커스텀 도메인 설정](https://vercel.com/docs/concepts/projects/domains)
- [환경 변수 관리](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎯 최종 결과

```
사용자 앱:   https://g-plat.com (react-app/)
관리자 앱:   https://admin.g-plat.com (admin-app/)

GitHub Repo: https://github.com/inervetdev/g-plat
Vercel Projects:
  - g-plat (사용자 앱)
  - g-plat-admin (관리자 앱)
```

---

**문서 작성일**: 2025-10-22
**작성자**: G-PLAT Development Team
