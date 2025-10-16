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
CREATE INDEX idx_card_attachments_business_card ON card_attachments(business_card_id);
CREATE INDEX idx_card_attachments_user ON card_attachments(user_id);
CREATE INDEX idx_card_attachments_order ON card_attachments(business_card_id, display_order);

-- Enable RLS
ALTER TABLE card_attachments ENABLE ROW LEVEL SECURITY;

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