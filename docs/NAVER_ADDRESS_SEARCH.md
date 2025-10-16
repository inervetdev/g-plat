# 네이버 주소 검색 API 통합 가이드

## 개요
명함 생성/수정 페이지에 네이버 지도 API를 활용한 주소 검색 기능이 통합되었습니다.
Supabase Edge Function을 프록시로 사용하여 CORS 문제를 해결합니다.

## 구현된 파일

### 1. 컴포넌트
- **`AddressSearchModal.tsx`**: 주소 검색 모달 UI 컴포넌트
  - 검색어 입력
  - 네이버 Geocoding API 결과 표시
  - 도로명 주소, 지번 주소, 영문 주소 표시

### 2. Edge Function
- **`supabase/functions/naver-geocode/index.ts`**: 네이버 API 프록시
  - CORS 문제 해결
  - 환경 변수에서 API 키 로드
  - 검색 결과 반환

### 3. 페이지 통합
- **`CreateCardPageOptimized.tsx`**: 명함 생성 페이지
  - 주소 입력란 옆 "주소 검색" 버튼 추가
  - AddressSearchModal 통합

- **`EditCardPageOptimized.tsx`**: 명함 수정 페이지
  - FormField 컴포넌트에 주소 검색 기능 추가
  - AddressSearchModal 통합

## 설정 방법

### 1단계: 네이버 클라우드 플랫폼 가입 및 API 키 발급

1. **네이버 클라우드 플랫폼 접속**
   - https://www.ncloud.com/
   - 회원가입 및 로그인

2. **Application 등록**
   - Console > Services > AI·NAVER API > Application 등록
   - Application 이름: `gplat-mobile-card`
   - 서비스 선택: **Maps** (Geocoding 포함)
   - Web Dynamic Map 또는 Web Service URL 등록:
     ```
     http://localhost:5173
     https://your-domain.com
     https://gplat-staging.vercel.app
     ```

3. **인증 정보 확인**
   - Client ID 복사
   - Client Secret 복사

### 2단계: 환경 변수 설정

#### 로컬 개발 환경 (`.env`)
```bash
# Naver Maps API (Geocoding)
VITE_NAVER_CLIENT_ID=
VITE_NAVER_CLIENT_SECRET=
```

#### Vercel 프로덕션 환경
Vercel Dashboard > Settings > Environment Variables에 추가:
- `VITE_NAVER_CLIENT_ID`
- `VITE_NAVER_CLIENT_SECRET`

### 3단계: Edge Function 환경 변수 설정

#### Supabase 로컬 개발
`react-app/.env` 파일에 추가 (이미 완료):
```bash
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
```

#### Supabase 프로덕션
```bash
cd react-app

# 환경 변수 설정
npx supabase secrets set NAVER_CLIENT_ID=your_client_id_here
npx supabase secrets set NAVER_CLIENT_SECRET=your_client_secret_here
```

### 4단계: Edge Function 배포

#### 로컬 테스트
```bash
cd react-app

# Supabase 로컬 서비스 시작
npx supabase start

# Edge Function 로컬 실행
npx supabase functions serve naver-geocode --no-verify-jwt

# 테스트 요청
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/naver-geocode' \
  --header 'Content-Type: application/json' \
  --data '{"query":"서울시 강남구 테헤란로 123"}'
```

#### 프로덕션 배포
```bash
cd react-app

# Edge Function 배포
npx supabase functions deploy naver-geocode

# 배포 확인
npx supabase functions list
```

### 5단계: 애플리케이션 테스트

1. **명함 생성 페이지** (`/create-card`)
   - 주소 입력란 옆 "주소 검색" 버튼 클릭
   - 검색어 입력 (예: "강남구 테헤란로 123")
   - 검색 결과에서 주소 선택
   - 선택한 주소가 자동으로 입력란에 입력됨

2. **명함 수정 페이지** (`/edit-card/:id`)
   - 동일한 방식으로 주소 검색 기능 사용

## API 사용량 및 요금

### 네이버 Maps API 사용량
- **무료 할당량**: 월 100,000건 (2025년 1월 기준)
- **초과 요금**: 건당 ₩0.5 (약 $0.0004)
- **사용량 확인**: 네이버 클라우드 플랫폼 Console > 사용량 대시보드

### 비용 추정
- 월 1,000건 검색: 무료
- 월 10,000건 검색: 무료
- 월 150,000건 검색: (150,000 - 100,000) × ₩0.5 = ₩25,000

## 보안 고려사항

1. **API 키 관리**
   - `.env` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않음
   - 프로덕션 환경에서는 Vercel/Supabase 환경 변수 사용
   - API 키는 주기적으로 로테이션 (3-6개월마다)

2. **CORS 보안**
   - Edge Function을 프록시로 사용하여 API 키 노출 방지
   - 프론트엔드에서 직접 API 호출하지 않음

3. **Rate Limiting**
   - 네이버 API는 기본적으로 Rate Limiting 적용
   - 추가 Rate Limiting은 Edge Function 레벨에서 구현 가능 (향후 필요 시)

## 문제 해결

### 1. CORS 오류 발생
```
Access to fetch at 'https://naveropenapi.apigw.ntruss.com/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**해결**: Edge Function을 사용하세요. `AddressSearchModal.tsx`는 이미 Edge Function을 통해 API를 호출하도록 구현되어 있습니다.

### 2. "Query parameter is required" 오류
```json
{"error":"Query parameter is required"}
```
**해결**: 검색어를 입력했는지 확인하세요.

### 3. "Naver API credentials not configured" 오류
```json
{"error":"Naver API credentials not configured"}
```
**해결**: Edge Function 환경 변수가 설정되지 않았습니다.
```bash
npx supabase secrets set NAVER_CLIENT_ID=your_id
npx supabase secrets set NAVER_CLIENT_SECRET=your_secret
```

### 4. Edge Function 배포 실패
```bash
npx supabase functions deploy naver-geocode
```
**오류**: `Error: Function deployment failed`

**해결**:
- Supabase 프로젝트가 연결되어 있는지 확인: `npx supabase status`
- Supabase CLI가 최신 버전인지 확인: `npm install -g supabase`

## API 응답 예시

### 성공 응답
```json
{
  "status": "OK",
  "meta": {
    "totalCount": 1,
    "page": 1,
    "count": 1
  },
  "addresses": [
    {
      "roadAddress": "서울특별시 강남구 테헤란로 123",
      "jibunAddress": "서울특별시 강남구 역삼동 123-45",
      "englishAddress": "123, Teheran-ro, Gangnam-gu, Seoul",
      "x": "127.0361234",
      "y": "37.5011234",
      "distance": 0.0
    }
  ]
}
```

### 검색 결과 없음
```json
{
  "status": "OK",
  "meta": {
    "totalCount": 0,
    "page": 1,
    "count": 0
  },
  "addresses": []
}
```

## 향후 개선 사항

1. **우편번호 추가**
   - 네이버 API 응답에서 우편번호 정보 추출
   - business_cards 테이블에 postal_code 컬럼 추가

2. **좌표 정보 활용**
   - 위도(y), 경도(x) 정보 저장
   - 지도 표시 기능 추가 (명함 페이지에 Google Maps 또는 네이버 지도 임베드)

3. **검색 기록 캐싱**
   - 자주 검색하는 주소는 Supabase에 캐시
   - API 호출 횟수 절감

4. **자동완성 기능**
   - 사용자가 입력하는 중에 실시간 검색 결과 표시
   - Debouncing으로 API 호출 최적화

## 관련 문서

- [네이버 클라우드 플랫폼 Maps API](https://api.ncloud-docs.com/docs/ai-naver-mapsgeocoding-geocode)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

## 업데이트 이력

- **2025.10.16**: 네이버 주소 검색 기능 초기 구현
  - AddressSearchModal 컴포넌트 생성
  - Supabase Edge Function (naver-geocode) 생성
  - CreateCardPageOptimized 및 EditCardPageOptimized 통합
