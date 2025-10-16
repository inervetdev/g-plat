-- Performance optimization indexes for G-PLAT database
-- Created: 2025-12-17
-- Purpose: Improve query performance for frequently accessed data

-- ============================================
-- Business Cards Table Indexes
-- ============================================

-- Index for user's cards lookup (frequently used in dashboard)
CREATE INDEX IF NOT EXISTS idx_business_cards_user_id_active
ON business_cards(user_id, is_active)
WHERE is_active = true;

-- Index for custom URL lookups (used in card sharing)
CREATE INDEX IF NOT EXISTS idx_business_cards_custom_url
ON business_cards(custom_url)
WHERE custom_url IS NOT NULL;

-- Index for primary card lookup
CREATE INDEX IF NOT EXISTS idx_business_cards_user_primary
ON business_cards(user_id, is_primary)
WHERE is_primary = true;

-- Composite index for card listing with sorting
CREATE INDEX IF NOT EXISTS idx_business_cards_user_created
ON business_cards(user_id, created_at DESC);

-- ============================================
-- Sidejob Cards Table Indexes
-- ============================================

-- Index for user's sidejob cards
CREATE INDEX IF NOT EXISTS idx_sidejob_cards_user_active
ON sidejob_cards(user_id, is_active, display_order)
WHERE is_active = true;

-- Index for business card association
CREATE INDEX IF NOT EXISTS idx_sidejob_cards_business_card
ON sidejob_cards(business_card_id, is_active)
WHERE business_card_id IS NOT NULL;

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_sidejob_cards_category
ON sidejob_cards(category_primary, category_secondary)
WHERE is_active = true;

-- Index for view/click tracking
CREATE INDEX IF NOT EXISTS idx_sidejob_cards_stats
ON sidejob_cards(user_id, view_count DESC, click_count DESC);

-- ============================================
-- Visitor Stats Table Indexes
-- ============================================

-- Index for visitor analytics queries
CREATE INDEX IF NOT EXISTS idx_visitor_stats_user_created
ON visitor_stats(user_id, created_at DESC);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_visitor_stats_created_date
ON visitor_stats(created_at::date, user_id);

-- Index for unique visitor counting
CREATE INDEX IF NOT EXISTS idx_visitor_stats_user_ip
ON visitor_stats(user_id, visitor_ip)
WHERE visitor_ip IS NOT NULL;

-- Index for referrer analysis
CREATE INDEX IF NOT EXISTS idx_visitor_stats_referrer
ON visitor_stats(user_id, referrer)
WHERE referrer IS NOT NULL;

-- ============================================
-- QR Codes Table Indexes
-- ============================================

-- Index for QR code lookup by short code
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code
ON qr_codes(short_code)
WHERE is_active = true;

-- Index for user's QR codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_business_card
ON qr_codes(business_card_id, is_active)
WHERE is_active = true;

-- Index for QR code analytics
CREATE INDEX IF NOT EXISTS idx_qr_codes_created
ON qr_codes(business_card_id, created_at DESC);

-- ============================================
-- QR Scans Table Indexes
-- ============================================

-- Index for scan analytics
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code_time
ON qr_scans(qr_code_id, scanned_at DESC);

-- Index for device type analysis
CREATE INDEX IF NOT EXISTS idx_qr_scans_device
ON qr_scans(qr_code_id, device_type)
WHERE device_type IS NOT NULL;

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_qr_scans_date
ON qr_scans(scanned_at::date, qr_code_id);

-- ============================================
-- Card Attachments Table Indexes
-- ============================================

-- Index for attachment lookup
CREATE INDEX IF NOT EXISTS idx_card_attachments_business_card
ON card_attachments(business_card_id, display_order);

-- Index for attachment type filtering
CREATE INDEX IF NOT EXISTS idx_card_attachments_type
ON card_attachments(business_card_id, attachment_type);

-- ============================================
-- Attachment Downloads Table Indexes
-- ============================================

-- Index for download analytics
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_user_date
ON attachment_downloads(user_id, downloaded_at DESC);

-- Index for attachment statistics
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_attachment
ON attachment_downloads(attachment_id, downloaded_at DESC);

-- ============================================
-- Users Table Indexes
-- ============================================

-- Index for email lookup (authentication)
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- Index for subscription tier filtering
CREATE INDEX IF NOT EXISTS idx_users_subscription
ON users(subscription_tier)
WHERE subscription_tier != 'free';

-- ============================================
-- User Profiles Table Indexes
-- ============================================

-- Index for profile lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_user
ON user_profiles(user_id);

-- ============================================
-- Partial Indexes for Common Queries
-- ============================================

-- Active cards with attachments
CREATE INDEX IF NOT EXISTS idx_business_cards_with_attachments
ON business_cards(user_id, id)
WHERE is_active = true
AND (attachment_url IS NOT NULL OR attachment_title IS NOT NULL);

-- Recent visitor stats (last 30 days)
CREATE INDEX IF NOT EXISTS idx_visitor_stats_recent
ON visitor_stats(user_id, created_at DESC)
WHERE created_at > CURRENT_DATE - INTERVAL '30 days';

-- Active sidejob cards with high engagement
CREATE INDEX IF NOT EXISTS idx_sidejob_cards_popular
ON sidejob_cards(user_id, (view_count + click_count) DESC)
WHERE is_active = true AND (view_count > 10 OR click_count > 5);

-- ============================================
-- Function-based Indexes for Computed Values
-- ============================================

-- Index for date-based grouping in analytics
CREATE INDEX IF NOT EXISTS idx_visitor_stats_date_trunc
ON visitor_stats(user_id, date_trunc('day', created_at));

-- Index for domain extraction from referrers
CREATE INDEX IF NOT EXISTS idx_visitor_stats_referrer_domain
ON visitor_stats(
    user_id,
    substring(referrer from '(?:.*://)?(?:www\.)?([^/?]+)')
)
WHERE referrer IS NOT NULL;

-- ============================================
-- Analyze Tables for Query Planner
-- ============================================

-- Update table statistics for better query planning
ANALYZE business_cards;
ANALYZE sidejob_cards;
ANALYZE visitor_stats;
ANALYZE qr_codes;
ANALYZE qr_scans;
ANALYZE card_attachments;
ANALYZE attachment_downloads;
ANALYZE users;
ANALYZE user_profiles;

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON INDEX idx_business_cards_user_id_active IS 'Optimize dashboard card listing queries';
COMMENT ON INDEX idx_business_cards_custom_url IS 'Speed up card sharing URL lookups';
COMMENT ON INDEX idx_visitor_stats_user_created IS 'Improve visitor analytics performance';
COMMENT ON INDEX idx_sidejob_cards_user_active IS 'Optimize sidejob card queries';
COMMENT ON INDEX idx_qr_codes_short_code IS 'Fast QR code resolution';
COMMENT ON INDEX idx_visitor_stats_recent IS 'Optimize recent visitor queries (30 days)';
COMMENT ON INDEX idx_sidejob_cards_popular IS 'Quick access to high-engagement cards';