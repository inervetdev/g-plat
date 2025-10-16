// Attachment types for business cards
export interface Attachment {
  id?: string;
  business_card_id?: string;
  user_id?: string;
  title: string;
  filename?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  display_order: number;
  attachment_type?: 'file' | 'youtube';
  youtube_url?: string;
  youtube_display_mode?: 'modal' | 'inline';
  created_at?: string;
  updated_at?: string;
}

export interface AttachmentDownload {
  id: string;
  attachment_id: string;
  business_card_id: string;
  downloaded_at: string;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
}