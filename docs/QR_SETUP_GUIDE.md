# QR 코드 기능 설정 가이드

## 📋 Supabase 데이터베이스 설정

### 1단계: SQL 스키마 적용

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr
   - 로그인

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New Query" 버튼 클릭

3. **SQL 실행**
   - 아래 파일의 전체 내용을 복사하여 SQL Editor에 붙여넣기:
     - `supabase_qr_schema.sql` 또는
     - `react-app/supabase/migrations/20250130_create_qr_tables.sql`
   - "Run" 버튼 클릭

4. **실행 확인**
   - 성공 메시지 확인
   - "Table Editor"에서 새로운 테이블 확인:
     - `qr_codes`
     - `qr_scans`

## 🔍 테이블 구조 확인

### qr_codes 테이블
- QR 코드 마스터 정보 저장
- 단축 URL, 대상 URL, 캠페인 정보 포함
- 동적 QR 코드 지원 (target_rules)

### qr_scans 테이블
- 스캔 추적 정보 저장
- 방문자 정보, 디바이스, 위치 등

### qr_code_analytics 뷰
- 집계된 통계 정보
- 총 스캔, 고유 방문자, 디바이스별 통계

## ✅ RLS 정책 확인

다음 정책들이 자동으로 적용됨:
- 사용자는 본인의 QR 코드만 관리 가능
- 누구나 활성 QR 코드를 스캔 가능
- 스캔 기록은 익명으로 저장

## 🚀 기능 테스트

1. **앱에서 테스트**
   ```
   http://localhost:5173/dashboard
   ```

2. **QR 코드 생성**
   - 대시보드에서 명함 카드의 "QR" 버튼 클릭
   - QR 코드 생성 및 다운로드

3. **통계 확인**
   - QR 코드 스캔 후 통계 페이지에서 확인

## 🔧 문제 해결

### 테이블이 생성되지 않는 경우
1. SQL Editor에서 에러 메시지 확인
2. `business_cards` 테이블이 먼저 존재하는지 확인
3. 필요시 외래 키 제약 조건 수정

### RLS 정책 오류
1. Authentication > Policies 메뉴에서 확인
2. 중복된 정책 이름이 있는지 확인
3. 필요시 기존 정책 삭제 후 재생성

## 📊 다음 단계

1. **Edge Function 생성** (선택사항)
   - QR 리다이렉트 처리
   - 스캔 통계 자동 수집

2. **고급 기능 추가**
   - QR 코드 만료 기능
   - A/B 테스팅
   - 지역별 라우팅

## 📝 참고 사항

- QR 코드는 클라이언트에서 생성 (qrcode.js)
- 단축 URL은 6자리 랜덤 문자열
- 통계는 실시간으로 업데이트
- 동적 QR은 target_rules JSON으로 조건 설정