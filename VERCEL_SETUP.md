# Vercel 배포 설정 가이드

## 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

### 설정 방법
1. Vercel 프로젝트 페이지로 이동
2. **Settings** → **Environment Variables** 클릭
3. 아래 환경 변수들을 추가

### 필수 환경 변수

#### Supabase 설정
```
VITE_SUPABASE_URL=your_supabase_project_url
```

```
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ **보안**: 실제 값은 Supabase Dashboard → Project Settings → API에서 확인하세요.

#### 애플리케이션 설정
```
VITE_APP_NAME=G-Plat Mobile Business Card
```

```
VITE_APP_URL=https://your-vercel-domain.vercel.app
```
(배포 후 실제 Vercel URL로 변경)

## 환경별 설정

모든 환경 변수에 대해 다음을 선택:
- ✅ Production
- ✅ Preview
- ✅ Development

## 재배포

환경 변수 설정 후:
1. **Deployments** 탭으로 이동
2. 최신 배포에서 **⋯** 클릭
3. **Redeploy** 선택
4. ✅ "Use existing Build Cache" 체크 해제
5. **Redeploy** 버튼 클릭

## 확인

재배포 완료 후 다음을 확인:
- ✅ 메인 페이지 로드
- ✅ 로그인 페이지 접근
- ✅ 회원가입 페이지 접근
- ✅ Supabase 연결 정상 동작

## 문제 해결

### "Missing Supabase environment variables" 에러
- Vercel 환경 변수가 올바르게 설정되었는지 확인
- 환경 변수 이름이 `VITE_` 접두사로 시작하는지 확인
- 재배포 시 빌드 캐시를 사용하지 않도록 설정

### 로그 확인
Vercel 대시보드:
1. **Deployments** → 해당 배포 클릭
2. **Runtime Logs** 또는 **Build Logs** 확인
