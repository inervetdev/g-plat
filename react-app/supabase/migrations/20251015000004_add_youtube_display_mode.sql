-- Add youtube_display_mode column to card_attachments table
-- 'modal' = 미리보기 버튼 클릭 시 모달에서만 보기 (기본값)
-- 'inline' = 명함 화면에 직접 embedded iframe으로 표시
ALTER TABLE public.card_attachments
ADD COLUMN IF NOT EXISTS youtube_display_mode TEXT DEFAULT 'modal' CHECK (youtube_display_mode IN ('modal', 'inline'));

-- Update existing YouTube records to use modal mode
UPDATE public.card_attachments
SET youtube_display_mode = 'modal'
WHERE attachment_type = 'youtube' AND youtube_display_mode IS NULL;
