# QR Redirect Edge Function 배포 가이드

## 1. Supabase CLI 설치 (이미 설치되어 있다면 생략)
```bash
npm install -g supabase
```

## 2. Supabase 프로젝트 연결
```bash
supabase login
supabase link --project-ref anwwjowwrxdygqyhhckr
```

## 3. Edge Function 배포
```bash
# functions 디렉토리로 이동
cd supabase/functions

# Edge Function 배포
supabase functions deploy qr-redirect

# 또는 모든 함수 배포
supabase functions deploy
```

## 4. 환경 변수 설정
Supabase Dashboard에서:
1. Project Settings > Edge Functions
2. 다음 환경 변수가 자동으로 설정되어 있는지 확인:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

## 5. Function URL 확인
배포 후 Function URL이 생성됩니다:
```
https://anwwjowwrxdygqyhhckr.supabase.co/functions/v1/qr-redirect/{short_code}
```

## 6. QR 코드 생성 시 URL 업데이트
QRCodeGenerator.tsx에서 생성되는 QR 코드의 URL을:
```typescript
const qrUrl = `https://anwwjowwrxdygqyhhckr.supabase.co/functions/v1/qr-redirect/${shortCode}`
```

## 테스트 방법
1. QR 코드를 생성
2. QR 코드를 스캔
3. qr_scans 테이블에 스캔 기록이 저장되는지 확인
4. 대상 URL로 리다이렉트되는지 확인

## 주의사항
- Edge Function은 Deno 런타임을 사용합니다
- 로컬 테스트를 원한다면: `supabase functions serve qr-redirect`
- 로그 확인: `supabase functions logs qr-redirect`