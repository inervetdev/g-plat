-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- 'user', 'card', 'sidejob', 'qr', 'report', etc
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_type, target_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

-- Add comments
COMMENT ON TABLE admin_logs IS 'Audit trail for all admin actions';
COMMENT ON COLUMN admin_logs.action IS 'Action type: created, updated, deleted, suspended, activated, etc';
COMMENT ON COLUMN admin_logs.target_type IS 'Type of resource: user, card, sidejob, qr, report, etc';
COMMENT ON COLUMN admin_logs.target_id IS 'ID of the affected resource';
COMMENT ON COLUMN admin_logs.details IS 'Additional context about the action (JSON)';

-- Enable Row Level Security
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Super admins can view all logs
CREATE POLICY "Super admins can view all logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

-- Admins can view their own logs
CREATE POLICY "Admins can view their own logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid());

-- All admins can insert logs
CREATE POLICY "Admins can insert logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Only super admins can delete logs
CREATE POLICY "Super admins can delete logs"
  ON admin_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );
