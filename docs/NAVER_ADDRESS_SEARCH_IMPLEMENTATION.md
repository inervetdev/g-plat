---
title: "Naver Maps Address Search Implementation"
category: "features"
subcategory: "maps"
tier: 3
status: "active"
last_updated: "2025-10-17"
related_docs:
  - path: "docs/NAVER_ADDRESS_SEARCH.md"
    description: "네이버 주소 검색 API 통합 가이드"
  - path: "react-app/src/components/AddressSearchModal.tsx"
    description: "주소 검색 모달 컴포넌트"
tags:
  - naver-maps
  - javascript-api
  - client-side
  - geocoding
---

# Naver Maps Address Search Implementation

## Overview

G-Plat 모바일 명함 서비스에 Naver Maps JavaScript API를 활용한 주소 검색 기능이 구현되었습니다.

**구현 완료일**: 2025년 10월 17일
**커밋**: [6127d56](https://github.com/inervetdev/g-plat/commit/6127d56)

## Technical Approach

### Initial Attempt: Naver Cloud Platform VPC Maps API (Server-side)

처음에는 Naver Cloud Platform의 VPC Maps Geocoding API를 사용하려 했습니다:

- **방식**: Supabase Edge Function을 프록시로 사용
- **인증**: Client ID + Client Secret (X-NCP-APIGW-API-KEY-ID, X-NCP-APIGW-API-KEY)
- **문제점**:
  - `error 210: A subscription to the API is required` 지속 발생
  - 구독이 활성화되어 있음에도 애플리케이션 연결 문제
  - 2개의 다른 애플리케이션으로 시도했지만 동일한 에러
  - 복잡한 구독 시스템과 연결 설정

### Final Solution: Naver Maps JavaScript API (Client-side)

결국 Naver Maps JavaScript API로 전환하여 문제 해결:

- **방식**: 브라우저에서 직접 API 호출
- **인증**: Client ID만 필요 (8oy9bbkq8u)
- **장점**:
  - 구독 복잡도 제거
  - Edge Function 의존성 제거
  - CORS 및 인증 문제 해결
  - 더 빠른 응답 시간
  - 간단한 설정과 사용법

## Implementation Details

### 1. Naver Maps SDK Integration

**파일**: [react-app/index.html](../react-app/index.html#L9)

```html
<!-- Naver Maps JavaScript API with Geocoder -->
<script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=8oy9bbkq8u&submodules=geocoder"></script>
```

### 2. AddressSearchModal Component

**파일**: [react-app/src/components/AddressSearchModal.tsx](../react-app/src/components/AddressSearchModal.tsx)

#### Global Type Declaration

```typescript
declare global {
  interface Window {
    naver: any
  }
}
```

#### Key Features

1. **실시간 주소 검색**
   - 도로명 주소
   - 지번 주소
   - 건물명

2. **검색 결과 표시**
   - 도로명 주소 우선 표시
   - 지번 주소 부가 표시
   - 영문 주소 표시

3. **사용자 인터랙션**
   - Enter 키 검색 지원
   - 검색 중 로딩 상태
   - 에러 메시지 표시
   - 결과 클릭으로 선택

#### Core Implementation

```typescript
const searchAddress = async () => {
  if (!searchQuery.trim()) {
    setError('검색어를 입력해주세요')
    return
  }

  setLoading(true)
  setError('')
  setResults([])

  try {
    // Check if Naver Maps API is loaded
    if (!window.naver || !window.naver.maps || !window.naver.maps.Service) {
      throw new Error('네이버 지도 API를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
    }

    // Promise wrapper for callback-based API
    const geocodeResult = await new Promise<any>((resolve, reject) => {
      window.naver.maps.Service.geocode(
        {
          query: searchQuery,
        },
        (status: any, response: any) => {
          if (status === window.naver.maps.Service.Status.OK) {
            resolve(response)
          } else if (status === window.naver.maps.Service.Status.ZERO_RESULT) {
            resolve({ v2: { addresses: [] } })
          } else {
            reject(new Error('주소 검색에 실패했습니다'))
          }
        }
      )
    })

    const addresses = geocodeResult.v2?.addresses || []

    if (addresses && addresses.length > 0) {
      setResults(addresses)
    } else {
      setError('검색 결과가 없습니다. 다른 키워드로 시도해보세요.')
    }
  } catch (err) {
    console.error('Address search error:', err)
    const errorMessage = err instanceof Error ? err.message : '주소 검색 중 오류가 발생했습니다'
    setError(errorMessage)
  } finally {
    setLoading(false)
  }
}
```

### 3. Response Structure

Naver Maps Geocoding API 응답 형식:

```typescript
interface AddressResult {
  roadAddress: string      // 도로명 주소
  jibunAddress: string     // 지번 주소
  englishAddress: string   // 영문 주소
  x: string               // longitude (경도)
  y: string               // latitude (위도)
}
```

## API Configuration

### Naver Cloud Platform Application

- **애플리케이션 이름**: gplat-geocoding-v2
- **Client ID**: 8oy9bbkq8u
- **Client Secret**: SyJKwMI4mhcvfzXuxZy8L9OPB0e876HFWKOZoirG (사용 안 함)
- **Web 서비스 URL**:
  - http://localhost:5173 (로컬 개발)
  - https://g-plat.com (프로덕션)
  - https://anwwjowwrxdygqyhhckr.supabase.co (Supabase)

### Environment Variables

**파일**: [react-app/.env](../react-app/.env)

```bash
# Naver Maps API (Geocoding) - gplat-geocoding-v2
VITE_NAVER_CLIENT_ID=8oy9bbkq8u
VITE_NAVER_CLIENT_SECRET=SyJKwMI4mhcvfzXuxZy8L9OPB0e876HFWKOZoirG

# Note: Client Secret is not used for JavaScript API
# Only Client ID is needed in the script tag
```

## Usage Example

```typescript
import { AddressSearchModal } from '@/components/AddressSearchModal'

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState('')

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address)
    // Do something with the selected address
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        주소 검색
      </button>

      <AddressSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddressSelect}
      />
    </>
  )
}
```

## Testing

### Local Development

1. Start dev server:
   ```bash
   cd react-app
   npm run dev
   ```

2. Open http://localhost:5173
3. Navigate to profile edit page
4. Click "주소 검색" button
5. Search for an address (e.g., "강남구 테헤란로 123")
6. Verify search results appear
7. Click a result to select it

### Production Testing

1. Visit https://g-plat.com
2. Log in to your account
3. Go to profile settings
4. Test address search functionality

## Troubleshooting

### API가 로드되지 않음

**증상**: "네이버 지도 API를 불러오는 중입니다" 에러

**해결**:
1. index.html에 스크립트 태그가 있는지 확인
2. Client ID가 올바른지 확인
3. 네트워크 연결 확인
4. 브라우저 콘솔에서 `window.naver` 확인

### 검색 결과가 없음

**증상**: "검색 결과가 없습니다" 메시지

**해결**:
1. 더 구체적인 주소로 검색 (예: "서울시 강남구 테헤란로 123")
2. 도로명 주소나 지번 주소로 시도
3. 건물명으로 검색

### CORS 에러

**증상**: 브라우저 콘솔에 CORS 에러

**해결**:
1. Naver Cloud Platform 설정 확인
2. Web 서비스 URL에 도메인 추가되어 있는지 확인
3. JavaScript API는 CORS 문제가 없어야 함 (브라우저에서 직접 호출)

## Documentation References

- [Naver Maps JavaScript API 공식 문서](https://navermaps.github.io/maps.js.ncp/docs/)
- [Geocoder 튜토리얼](https://navermaps.github.io/maps.js.ncp/docs/tutorial-Geocoder-Geocoding.html)
- [API 레퍼런스](https://navermaps.github.io/maps.js.ncp/docs/naver.maps.Service.html)

## Future Enhancements

### Phase 3 개선사항

1. **지도 시각화**
   - 선택한 주소를 지도에 마커로 표시
   - 지도 중심을 선택 주소로 이동

2. **최근 검색 기록**
   - localStorage에 최근 검색 주소 저장
   - 빠른 재선택 기능

3. **좌표 저장**
   - 주소와 함께 경도/위도 저장
   - 거리 기반 검색 기능 준비

4. **주소 자동완성**
   - 타이핑하는 동안 실시간 제안
   - Debounce 적용으로 API 호출 최적화

## Performance Considerations

- **API 호출 최적화**: 사용자가 검색 버튼을 클릭할 때만 API 호출
- **로딩 상태**: 검색 중 사용자에게 명확한 피드백 제공
- **에러 처리**: 모든 에러 케이스에 대한 사용자 친화적 메시지
- **Promise 래핑**: 콜백 기반 API를 Promise로 래핑하여 async/await 사용

## Security

- **Client ID만 노출**: Client Secret은 사용하지 않음
- **도메인 제한**: Naver Cloud Platform에서 허용된 도메인만 API 사용 가능
- **RLS 정책**: 사용자는 자신의 주소 정보만 수정 가능 (Supabase RLS)

## Related Files

- [index.html](../react-app/index.html) - Naver Maps SDK 로드
- [AddressSearchModal.tsx](../react-app/src/components/AddressSearchModal.tsx) - 주소 검색 모달 컴포넌트
- [.env](../react-app/.env) - 환경 변수 (Client ID)
- [PRD.md](../PRD.md) - 제품 요구사항 문서
- [CLAUDE.md](../CLAUDE.md) - Claude Code 가이드

---

**Last Updated**: 2025년 10월 17일
**Version**: 1.0
**Status**: ✅ Production Ready
