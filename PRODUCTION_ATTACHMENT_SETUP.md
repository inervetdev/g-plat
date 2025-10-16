# 프로덕션 첨부파일 기능 설정 가이드

## 문제 상황
프로덕션 환경에서 명함 첨부파일 기능과 YouTube 연동 기능이 작동하지 않습니다.
`card_attachments` 테이블과 `attachment_downloads` 테이블이 프로덕션 데이터베이스에 존재하지 않기 때문입니다.

## 해결 방법

### 1. Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (anwwjowwrxdygqyhhckr)
3. SQL Editor 탭 클릭

### 2. 다음 SQL 실행

```sql
-- 1. card_attachments 테이블 생성
CREATE TABLE IF NOT EXISTS public.card_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filename TEXT,
  file_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  attachment_type TEXT DEFAULT 'file' CHECK (attachment_type IN ('file', 'youtube')),
  youtube_url TEXT,
  youtube_display_mode TEXT DEFAULT 'modal' CHECK (youtube_display_mode IN ('modal', 'inline')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_card_attachments_business_card_id ON public.card_attachments(business_card_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_user_id ON public.card_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_display_order ON public.card_attachments(business_card_id, display_order);

-- 3. RLS 활성화
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
CREATE POLICY "Users can view all attachments"
  ON public.card_attachments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own attachments"
  ON public.card_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attachments"
  ON public.card_attachments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attachments"
  ON public.card_attachments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. attachment_downloads 테이블 생성
CREATE TABLE IF NOT EXISTS public.attachment_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID NOT NULL REFERENCES public.card_attachments(id) ON DELETE CASCADE,
  business_card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET DEFAULT inet_client_addr(),
  user_agent TEXT,
  referrer TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT
);

-- 6. attachment_downloads 인덱스
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_attachment_id ON public.attachment_downloads(attachment_id);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_business_card_id ON public.attachment_downloads(business_card_id);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_downloaded_at ON public.attachment_downloads(downloaded_at DESC);

-- 7. attachment_downloads RLS
ALTER TABLE public.attachment_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert download tracking"
  ON public.attachment_downloads
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own attachment downloads"
  ON public.attachment_downloads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.card_attachments
      WHERE card_attachments.id = attachment_downloads.attachment_id
      AND card_attachments.user_id = auth.uid()
    )
  );

-- 8. updated_at 트리거 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. updated_at 트리거
CREATE TRIGGER update_card_attachments_updated_at
  BEFORE UPDATE ON public.card_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

### 3. Storage Bucket 생성
1. Supabase Dashboard > Storage 탭
2. "New bucket" 클릭
3. 다음 설정으로 생성:
   - Name: `card-attachments`
   - Public: ✅ (체크)
   - File size limit: 52428800 (50MB)
   - Allowed mime types:
     ```
     image/jpeg,image/png,image/gif,image/webp,
     application/pdf,video/mp4,video/webm,
     application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,
     application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
     application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation
     ```

### 4. 기능 확인
1. https://g-plat.com 접속
2. 로그인
3. 명함 수정 페이지에서:
   - 첨부파일 업로드 테스트
   - YouTube URL 추가 테스트
   - 미리보기 기능 테스트

## 주요 기능

### 첨부파일 기능
- 최대 50MB 파일 업로드
- 여러 파일 동시 업로드 가능
- PDF, 이미지, 동영상, 문서 파일 지원
- 파일별 제목 설정 가능
- 미리보기 기능

### YouTube 연동 기능
- YouTube URL 직접 입력
- 자동 썸네일 추출
- 2가지 표시 모드:
  - Modal: 팝업으로 재생
  - Inline: 명함 내에서 직접 재생
- 여러 YouTube 동영상 추가 가능

## 트러블슈팅

### 문제: 파일 업로드 실패
- Storage bucket이 생성되었는지 확인
- 파일 크기가 50MB 이하인지 확인
- 허용된 파일 형식인지 확인

### 문제: YouTube 미리보기 안 됨
- YouTube URL이 올바른 형식인지 확인
- 동영상이 공개 상태인지 확인

### 문제: 테이블이 이미 존재한다는 에러
- 이미 생성된 경우 무시하고 진행

## 참고사항
- 이미 생성된 명함들은 첨부파일 기능 사용 가능
- 기존 첨부파일 데이터는 자동으로 마이그레이션됨
- TypeScript 에러는 무시 (타입 정의는 추후 업데이트)