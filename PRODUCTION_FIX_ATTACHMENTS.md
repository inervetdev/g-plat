# 프로덕션 데이터베이스 수정 가이드

## 🚨 긴급 수정 필요

프로덕션 환경에 `card_attachments` 테이블이 없어서 소개자료와 YouTube 기능이 작동하지 않습니다.

## 해결 단계:

### 1. Supabase 대시보드 접속
1. https://supabase.com/dashboard 로 이동
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭

### 2. 다음 SQL 실행

```sql
-- Create card_attachments table for file and YouTube attachments
CREATE TABLE IF NOT EXISTS card_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_card_id UUID NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,

  -- File attachment fields
  filename TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,

  -- YouTube fields
  youtube_url TEXT,
  youtube_display_mode TEXT CHECK (youtube_display_mode IN ('modal', 'inline')),

  -- Common fields
  attachment_type TEXT NOT NULL CHECK (attachment_type IN ('file', 'youtube')),
  display_order INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_card_attachments_business_card ON card_attachments(business_card_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_user ON card_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_order ON card_attachments(business_card_id, display_order);

-- Enable RLS
ALTER TABLE card_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view card attachments" ON card_attachments;
DROP POLICY IF EXISTS "Users can create own card attachments" ON card_attachments;
DROP POLICY IF EXISTS "Users can update own card attachments" ON card_attachments;
DROP POLICY IF EXISTS "Users can delete own card attachments" ON card_attachments;

-- RLS Policies
-- Users can view attachments for any public business card
CREATE POLICY "Anyone can view card attachments"
  ON card_attachments FOR SELECT
  USING (true);

-- Users can create attachments for their own cards
CREATE POLICY "Users can create own card attachments"
  ON card_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own attachments
CREATE POLICY "Users can update own card attachments"
  ON card_attachments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own attachments
CREATE POLICY "Users can delete own card attachments"
  ON card_attachments FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE card_attachments IS 'Stores file and YouTube attachments for business cards';
```

### 3. Storage Bucket 생성 (필요한 경우)

Supabase 대시보드에서:
1. "Storage" 메뉴로 이동
2. "New Bucket" 클릭
3. 이름: `card-attachments`
4. Public bucket: ✅ 체크
5. "Create Bucket" 클릭

### 4. 확인 방법

SQL Editor에서 다음 쿼리 실행:
```sql
-- 테이블이 생성되었는지 확인
SELECT * FROM information_schema.tables
WHERE table_name = 'card_attachments';

-- 정책이 적용되었는지 확인
SELECT * FROM pg_policies
WHERE tablename = 'card_attachments';
```

## 💡 추가 정보

- 이 작업은 프로덕션 데이터베이스에 직접 영향을 미칩니다
- 작업 전 백업을 권장합니다 (Supabase는 자동 백업 제공)
- 문제 발생 시 Supabase Support에 문의하세요

## ✅ 완료 후

1. 웹사이트 새로고침
2. 명함 수정 페이지에서 소개자료 추가 테스트
3. YouTube 링크 추가 테스트
4. 저장 후 다시 열어서 데이터 유지 확인