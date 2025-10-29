# 스키마 에러 수정 가이드

## 🚨 발견된 문제들

### 1. users 테이블 - status 컬럼 없음
```
Error: Could not find the 'status' column of 'users'
```

### 2. qr_codes 테이블 - card_id 컬럼 없음
```
Error: column qr_codes.card_id does not exist
```

### 3. visitor_stats - business_cards 관계 없음
```
Error: Could not find a relationship between 'visitor_stats' and 'business_cards'
```

---

## 📋 확인 방법

### Supabase Dashboard에서 확인:
1. **Table Editor** 클릭
2. 각 테이블 선택해서 컬럼 확인

### SQL Editor에서 확인:
`check_schema.sql` 파일의 SQL 실행

---

## 🔧 수정 방안

### 방안 A: 컬럼 추가 (권장)

users 테이블에 status 컬럼이 없다면 추가:

```sql
-- users 테이블에 status 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'inactive', 'suspended'));

-- 기존 데이터 업데이트 (모두 active로)
UPDATE users SET status = 'active' WHERE status IS NULL;
```

qr_codes 테이블 확인:
- 실제 컬럼명이 `business_card_id`일 가능성 있음
- 또는 `card_id`가 없어서 추가 필요

```sql
-- qr_codes 테이블의 실제 컬럼 확인
SELECT column_name FROM information_schema.columns
WHERE table_name = 'qr_codes';

-- 만약 card_id가 없다면 추가
ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS card_id UUID REFERENCES business_cards(id) ON DELETE CASCADE;
```

visitor_stats 관계:
```sql
-- visitor_stats와 business_cards 관계 확인
SELECT column_name FROM information_schema.columns
WHERE table_name = 'visitor_stats' AND column_name LIKE '%card%';

-- Foreign key 추가 (만약 없다면)
ALTER TABLE visitor_stats
ADD CONSTRAINT fk_visitor_stats_card
FOREIGN KEY (card_id) REFERENCES business_cards(id) ON DELETE CASCADE;
```

---

## ✅ 실행 순서

1. **Supabase Dashboard → SQL Editor** 열기
2. 아래 SQL을 **순서대로** 실행:

```sql
-- 1. users 테이블에 status 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'inactive', 'suspended'));

UPDATE users SET status = 'active' WHERE status IS NULL;

-- 2. qr_codes 컬럼 확인 (먼저 실행)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'qr_codes'
ORDER BY ordinal_position;

-- 3. visitor_stats 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'visitor_stats'
ORDER BY ordinal_position;
```

3. **결과를 보고** 실제 컬럼명 확인
4. 저에게 결과 알려주시면 코드 수정하겠습니다

---

## 🔄 대안: 코드 수정

만약 데이터베이스 스키마를 변경하고 싶지 않다면, 코드를 실제 컬럼명에 맞춰 수정할 수 있습니다.

예시:
- `status` → 실제 컬럼명 (예: `account_status`)
- `card_id` → 실제 컬럼명 (예: `business_card_id`)

실제 컬럼명을 알려주시면 코드를 수정하겠습니다!

---

## 📞 다음 단계

실행하신 후 다음 중 하나를 알려주세요:

**A.** "status 컬럼 추가 완료했어"
**B.** "실제 컬럼명은 [xxx]야" (그러면 코드 수정)
**C.** "SQL 실행 결과: [결과 붙여넣기]"
