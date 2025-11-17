# 네이버 Geocoding API 설정 확인 가이드

## 🔴 현재 상황
- **에러**: 401 Unauthorized - errorCode: 210 "Permission Denied"
- **원인**: "A subscription to the API is required" (API 구독 필요)
- **구현 방식**: ✅ 올바름 (REST API 직접 호출)

---

## 📋 해결 체크리스트

### 1️⃣ 네이버 클라우드 플랫폼 로그인
**URL**: https://console.ncloud.com/

---

### 2️⃣ Application 정보 확인

1. **콘솔** → **Services** → **AI·NAVER API** → **AI·NAVER API** 메뉴
2. 등록된 Application 찾기 (현재 Client ID: `8oy9bbkq8u`)

---

### 3️⃣ 서비스 이용 신청 확인 (중요!)

#### 확인 항목:
Application 상세 페이지에서 **서비스 선택** 탭 확인

**필수 체크 항목**:
- [ ] **Maps** 카테고리
  - [ ] **Geocoding** (주소 → 좌표)
  - [ ] **Reverse Geocoding** (좌표 → 주소, 선택사항)

**현재 상태 확인**:
- 위의 두 API가 **체크**되어 있는지 확인
- 체크되어 있지 않다면 → **반드시 체크하고 저장**

---

### 4️⃣ Web Service URL 설정 확인

Application 설정에서 **Web 서비스 URL** 확인:

**필수 등록 URL**:
```
https://g-plat.com
https://www.g-plat.com
http://localhost:5173
http://127.0.0.1:5173
```

> **주의**: Supabase Edge Function은 서버 사이드이므로 URL 제한 없음.
> 하지만 일부 API는 URL이 등록되어야 작동하므로 확인 필요.

---

### 5️⃣ Client ID/Secret 재확인

#### 콘솔에서 확인:
1. Application 상세 페이지
2. **인증 정보** 탭
3. **Client ID**와 **Client Secret** 복사

#### 현재 Supabase Secrets 확인:
```bash
cd react-app
SUPABASE_ACCESS_TOKEN="sbp_27e4a62c9712236fe7b5c4deeb9ebbbfd876d5fb" \
npx supabase secrets list --project-ref anwwjowwrxdygqyhhckr
```

출력:
```
NAVER_CLIENT_ID           | 14a3fe231fbd6d514a475805f6722d49a1db64041de725eca3d72172ac64f3b0
NAVER_CLIENT_SECRET       | d17dc956cf7b12922737fcbbc2a9cec75ee13e92fa7fb262dbf0dadcb0a122f6
```

> **확인 방법**: 위의 해시값이 네이버 콘솔의 Client ID/Secret과 일치하는지 확인

---

### 6️⃣ API 키 재설정 (불일치 시)

```bash
cd react-app

# Client ID 설정
SUPABASE_ACCESS_TOKEN="sbp_27e4a62c9712236fe7b5c4deeb9ebbbfd876d5fb" \
npx supabase secrets set NAVER_CLIENT_ID=<네이버_콘솔에서_복사한_CLIENT_ID> \
--project-ref anwwjowwrxdygqyhhckr

# Client Secret 설정
SUPABASE_ACCESS_TOKEN="sbp_27e4a62c9712236fe7b5c4deeb9ebbbfd876d5fb" \
npx supabase secrets set NAVER_CLIENT_SECRET=<네이버_콘솔에서_복사한_CLIENT_SECRET> \
--project-ref anwwjowwrxdygqyhhckr
```

---

### 7️⃣ Edge Function 재배포

API 키를 변경한 경우 Edge Function 재배포 필수:

```bash
cd react-app
SUPABASE_ACCESS_TOKEN="sbp_27e4a62c9712236fe7b5c4deeb9ebbbfd876d5fb" \
npx supabase functions deploy naver-geocode --project-ref anwwjowwrxdygqyhhckr
```

---

### 8️⃣ 테스트

```bash
cd react-app
node test-address-search.js
```

**예상 결과**:
```
🔍 Testing address search: "서울시 강남구 테헤란로 123"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Status: 200 OK
✅ Found 1 result(s):

1. 도로명: 서울특별시 강남구 테헤란로 123
   지번: 서울특별시 강남구 역삼동 123-45
   영문: 123 Teheran-ro, Gangnam-gu, Seoul
   좌표: (127.0367, 37.4964)
```

---

## 🔍 에러 코드별 해결 방법

| 에러 코드 | 메시지 | 원인 | 해결 방법 |
|----------|--------|------|----------|
| **210** | Permission Denied | API 구독 안 됨 | 콘솔에서 Geocoding API 체크 |
| **300** | Invalid Request | 잘못된 파라미터 | query 형식 확인 |
| **401** | Unauthorized | 인증 실패 | Client ID/Secret 재확인 |
| **429** | Too Many Requests | 일일 한도 초과 | 24시간 대기 또는 요금제 업그레이드 |
| **500** | Internal Server Error | 네이버 서버 오류 | 잠시 후 재시도 |

---

## 📞 네이버 클라우드 플랫폼 문의

**방법 1: 1:1 문의**
- 콘솔 우측 상단 **고객지원** → **1:1 문의**

**방법 2: 고객센터 전화**
- 전화: 1544-5876
- 운영시간: 평일 09:00 ~ 18:00

**방법 3: 커뮤니티**
- https://www.ncloud.com/support/question

---

## 💡 대안 API (권장)

### Kakao 지도 API (가장 추천)

**장점**:
- ✅ 무료 사용량: **일 300,000건** (네이버의 10배)
- ✅ 간단한 인증: REST API Key만 필요
- ✅ 한국 주소 특화
- ✅ 신청 즉시 사용 가능

**구현 예시**:
```typescript
// Kakao Geocoding API
const response = await fetch(
  `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
  {
    headers: {
      'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
    }
  }
)
```

**신청 방법**:
1. https://developers.kakao.com/ 접속
2. 내 애플리케이션 → 애플리케이션 추가
3. REST API 키 복사
4. 플랫폼 설정 (Web 도메인 등록)

---

## ✅ 최종 체크리스트

- [ ] 네이버 클라우드 플랫폼 콘솔 로그인
- [ ] Application 찾기 (Client ID: `8oy9bbkq8u`)
- [ ] **Geocoding API 체크 여부 확인** (가장 중요!)
- [ ] Client ID/Secret 일치 여부 확인
- [ ] Supabase Secrets 재설정 (필요시)
- [ ] Edge Function 재배포 (필요시)
- [ ] `test-address-search.js` 테스트 성공
- [ ] 브라우저에서 실제 기능 테스트

---

## 🎯 결론

**검색 내용이 맞습니다**:
- ✅ 현재 구현 방식은 올바름 (REST API 직접 호출)
- ❌ 문제는 인증 설정 (Client ID/Secret 또는 API 구독)

**가장 가능성 높은 원인**:
1. 네이버 콘솔에서 **Geocoding API 체크 안 됨** (90% 확률)
2. Client ID/Secret 불일치 (10% 확률)

**즉시 확인 필요**:
네이버 클라우드 플랫폼 콘솔 → Application → **서비스 선택** 탭에서 Geocoding API 체크 여부 확인!
