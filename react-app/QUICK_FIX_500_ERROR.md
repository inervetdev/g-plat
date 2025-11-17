# 🚨 500 에러 빠른 해결 가이드

## 문제
주소 검색 시 500 에러 발생:
```
POST https://...supabase.co/functions/v1/naver-geocode 500 (Internal Server Error)
```

## 원인
네이버 API 환경 변수 미설정

## 🚀 빠른 해결 (5분)

### 1️⃣ 네이버 API 키 발급 (2분)

```
1. https://www.ncloud.com/ 접속
2. 회원가입/로그인
3. Console > AI·NAVER API > Application 등록
4. Application 이름: mobile-card
5. 서비스 선택: Maps ✅
6. Web Service URL: http://localhost:5173
7. 저장 후 Client ID, Secret 복사
```

### 2️⃣ 환경 변수 설정 (1분)

#### 로컬 개발 (Windows PowerShell)

```powershell
# react-app/supabase 폴더로 이동
cd react-app/supabase

# .env.local 파일 생성
New-Item -Path .env.local -ItemType File -Force

# 메모장으로 열기
notepad .env.local
```

**파일 내용:**
```bash
NAVER_CLIENT_ID=발급받은_클라이언트_ID
NAVER_CLIENT_SECRET=발급받은_시크릿
```

#### 프로덕션 (Supabase Dashboard)

```
1. https://supabase.com/dashboard
2. 프로젝트 선택
3. Edge Functions > naver-geocode
4. Settings > Secrets
5. 추가:
   - NAVER_CLIENT_ID = 발급받은_ID
   - NAVER_CLIENT_SECRET = 발급받은_시크릿
6. Save
```

### 3️⃣ Supabase 재시작 (1분)

```powershell
# react-app 폴더에서
cd react-app

# 중지
npx supabase stop

# 시작 (환경 변수 적용)
npx supabase start
```

### 4️⃣ 테스트 (1분)

#### 방법 1: 터미널 테스트
```powershell
node test-naver-geocode.js --local
```

#### 방법 2: 웹 테스트
```
1. npm run dev
2. 명함 생성 페이지 이동
3. "주소 검색" 버튼 클릭
4. "서울시 강남구" 검색
```

## ✅ 성공 확인

### 터미널 출력
```
✅ 성공 - 10개 결과
1. 서울특별시 강남구 테헤란로 123
2. 서울특별시 강남구 역삼동 123-45
...
```

### 브라우저 콘솔
```javascript
Environment check: {
  hasClientId: true,
  hasClientSecret: true,
  clientIdLength: 24
}
Naver API response status: 200
```

## 🔧 여전히 에러?

### 확인 사항

#### 1. 환경 변수 로드 확인
```powershell
# Supabase 로그 확인
npx supabase functions serve naver-geocode --no-verify-jwt

# 다른 터미널에서 테스트
node test-naver-geocode.js --local
```

로그에서 확인:
- ✅ `hasClientId: true` → 정상
- ❌ `hasClientId: false` → 환경 변수 미설정

#### 2. API 키 유효성 확인
```powershell
# 네이버 API 직접 테스트 (curl 필요)
curl -X GET "https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=서울시강남구" `
  -H "X-NCP-APIGW-API-KEY-ID: YOUR_CLIENT_ID" `
  -H "X-NCP-APIGW-API-KEY: YOUR_CLIENT_SECRET"
```

- ✅ 200 응답 → API 키 정상
- ❌ 401/403 → API 키 재발급 필요

#### 3. .env.local 위치 확인
```
올바른 위치:
react-app/supabase/.env.local ✅

잘못된 위치:
react-app/.env.local ❌
supabase/.env.local ❌
```

#### 4. 환경 변수 형식 확인
```bash
# ✅ 올바른 형식
NAVER_CLIENT_ID=abc123def456
NAVER_CLIENT_SECRET=xyz789ghi012

# ❌ 잘못된 형식
NAVER_CLIENT_ID = abc123def456  # 공백 있음
NAVER_CLIENT_ID="abc123def456"  # 따옴표 있음
VITE_NAVER_CLIENT_ID=abc123      # VITE_ 접두사 있음
```

## 📋 변경 내역

이번 수정으로 개선된 사항:

1. ✅ `config.toml`: `verify_jwt = false` (인증 불필요)
2. ✅ Edge Function: 상세한 에러 로깅 추가
3. ✅ 클라이언트: 구체적인 에러 메시지 표시
4. ✅ 헤더 수정: `X-NCP-APIGW-API-KEY-ID` (대문자)
5. ✅ 테스트 스크립트 추가: `test-naver-geocode.js`

## 📞 추가 도움

상세한 설정 방법은 다음 파일 참조:
- `react-app/NAVER_GEOCODE_SETUP.md` - 전체 설정 가이드
- `docs/NAVER_ADDRESS_SEARCH.md` - 기능 설명

---

**작성일**: 2025년 10월 16일  
**예상 해결 시간**: 5분

