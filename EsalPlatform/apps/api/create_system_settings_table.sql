-- Create system_settings table for storing platform configuration
-- This replaces the dummy data in the admin portal settings

-- Drop table if exists (for development/testing)
-- DROP TABLE IF EXISTS system_settings;

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    data_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- whether this setting can be accessed by non-admin users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_category_key ON system_settings(category, key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_system_settings_updated_at ON system_settings;
CREATE TRIGGER trigger_update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

-- Insert default system settings (replacing dummy data)

-- General platform settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('general', 'platform_name', 'ESAL Platform', 'string', 'Name of the platform', true),
('general', 'platform_description', 'Innovation and Entrepreneurship Platform', 'string', 'Platform description', true),
('general', 'platform_version', '1.0.0', 'string', 'Current platform version', true),
('general', 'maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode', false),
('general', 'max_file_upload_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', false),
('general', 'timezone', 'UTC', 'string', 'Default platform timezone', true),
('general', 'language', 'en', 'string', 'Default platform language', true),
('general', 'currency', 'USD', 'string', 'Default platform currency', true);

-- Authentication settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('auth', 'email_verification_required', 'true', 'boolean', 'Require email verification for new users', false),
('auth', 'password_min_length', '8', 'number', 'Minimum password length', true),
('auth', 'password_require_uppercase', 'true', 'boolean', 'Require uppercase letters in passwords', true),
('auth', 'password_require_lowercase', 'true', 'boolean', 'Require lowercase letters in passwords', true),
('auth', 'password_require_numbers', 'true', 'boolean', 'Require numbers in passwords', true),
('auth', 'password_require_symbols', 'false', 'boolean', 'Require symbols in passwords', true),
('auth', 'session_timeout_minutes', '1440', 'number', 'Session timeout in minutes (24 hours)', false),
('auth', 'max_login_attempts', '5', 'number', 'Maximum login attempts before lockout', false),
('auth', 'lockout_duration_minutes', '30', 'number', 'Account lockout duration in minutes', false);

-- Email settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('email', 'smtp_enabled', 'true', 'boolean', 'Enable SMTP email sending', false),
('email', 'from_email', 'noreply@esalplatform.com', 'string', 'Default from email address', false),
('email', 'from_name', 'ESAL Platform', 'string', 'Default from name', false),
('email', 'welcome_email_enabled', 'true', 'boolean', 'Send welcome email to new users', false),
('email', 'notification_email_enabled', 'true', 'boolean', 'Send notification emails', false),
('email', 'password_reset_expiry_hours', '24', 'number', 'Password reset link expiry in hours', false);

-- Security settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('security', 'rate_limit_requests_per_minute', '60', 'number', 'API rate limit per minute per user', false),
('security', 'cors_allowed_origins', '["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"]', 'json', 'CORS allowed origins', false),
('security', 'jwt_expiry_hours', '24', 'number', 'JWT token expiry in hours', false),
('security', 'encryption_enabled', 'true', 'boolean', 'Enable data encryption', false),
('security', 'audit_logs_enabled', 'true', 'boolean', 'Enable audit logging', false),
('security', 'two_factor_auth_enabled', 'false', 'boolean', 'Enable two-factor authentication', false);

-- Payment settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('payment', 'paypal_enabled', 'true', 'boolean', 'Enable PayPal payments', false),
('payment', 'stripe_enabled', 'false', 'boolean', 'Enable Stripe payments', false),
('payment', 'default_currency', 'USD', 'string', 'Default payment currency', true),
('payment', 'minimum_payment_amount', '10.00', 'number', 'Minimum payment amount', true),
('payment', 'payment_processing_fee_percent', '2.9', 'number', 'Payment processing fee percentage', false),
('payment', 'refund_policy_days', '30', 'number', 'Refund policy period in days', true);

-- Feature flags
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('features', 'user_registration_enabled', 'true', 'boolean', 'Allow new user registration', true),
('features', 'investor_portal_enabled', 'true', 'boolean', 'Enable investor portal', true),
('features', 'innovator_portal_enabled', 'true', 'boolean', 'Enable innovator portal', true),
('features', 'hub_portal_enabled', 'true', 'boolean', 'Enable hub portal', true),
('features', 'ai_features_enabled', 'true', 'boolean', 'Enable AI-powered features', false),
('features', 'analytics_enabled', 'true', 'boolean', 'Enable analytics tracking', false),
('features', 'notifications_enabled', 'true', 'boolean', 'Enable notifications system', true),
('features', 'chat_enabled', 'false', 'boolean', 'Enable chat functionality', true);

-- Notification settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('notifications', 'email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', false),
('notifications', 'push_notifications_enabled', 'false', 'boolean', 'Enable push notifications', false),
('notifications', 'sms_notifications_enabled', 'false', 'boolean', 'Enable SMS notifications', false),
('notifications', 'notification_retention_days', '90', 'number', 'Keep notifications for X days', false),
('notifications', 'daily_digest_enabled', 'true', 'boolean', 'Send daily digest emails', false);

-- Content settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('content', 'content_moderation_enabled', 'true', 'boolean', 'Enable content moderation', false),
('content', 'auto_approve_content', 'false', 'boolean', 'Auto-approve user content', false),
('content', 'max_content_length', '10000', 'number', 'Maximum content length in characters', true),
('content', 'allowed_file_types', '["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"]', 'json', 'Allowed file upload types', true),
('content', 'content_backup_enabled', 'true', 'boolean', 'Enable content backup', false);

-- API settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('api', 'api_version', 'v1', 'string', 'Current API version', true),
('api', 'api_rate_limit_enabled', 'true', 'boolean', 'Enable API rate limiting', false),
('api', 'api_key_required', 'false', 'boolean', 'Require API key for requests', false),
('api', 'api_documentation_enabled', 'true', 'boolean', 'Enable API documentation', true),
('api', 'api_logging_enabled', 'true', 'boolean', 'Enable API request logging', false);

-- UI/UX settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('ui', 'theme', 'light', 'string', 'Default UI theme', true),
('ui', 'primary_color', '#3B82F6', 'string', 'Primary brand color', true),
('ui', 'secondary_color', '#10B981', 'string', 'Secondary brand color', true),
('ui', 'logo_url', '/assets/logo.png', 'string', 'Platform logo URL', true),
('ui', 'favicon_url', '/assets/favicon.ico', 'string', 'Platform favicon URL', true),
('ui', 'footer_text', '© 2025 ESAL Platform. All rights reserved.', 'string', 'Footer copyright text', true),
('ui', 'show_beta_features', 'false', 'boolean', 'Show beta features in UI', false);

-- Analytics settings
INSERT INTO system_settings (category, key, value, data_type, description, is_public) VALUES
('analytics', 'google_analytics_enabled', 'false', 'boolean', 'Enable Google Analytics', false),
('analytics', 'google_analytics_id', '', 'string', 'Google Analytics tracking ID', false),
('analytics', 'internal_analytics_enabled', 'true', 'boolean', 'Enable internal analytics', false),
('analytics', 'track_user_behavior', 'true', 'boolean', 'Track user behavior for analytics', false),
('analytics', 'data_retention_days', '365', 'number', 'Analytics data retention in days', false);

-- Create RLS (Row Level Security) policies if needed
-- ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read/write system settings
-- CREATE POLICY "Admins can manage system settings" ON system_settings
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM auth.users
--             WHERE auth.uid() = users.id
--             AND users.role = 'admin'
--         )
--     );

-- Allow public read access to public settings
-- CREATE POLICY "Public settings are readable by all" ON system_settings
--     FOR SELECT USING (is_public = true);

-- Verify the data was inserted
-- SELECT category, COUNT(*) as setting_count FROM system_settings GROUP BY category ORDER BY category;

-- Example queries to test:
-- Get all general settings: SELECT * FROM system_settings WHERE category = 'general';
-- Get a specific setting: SELECT value FROM system_settings WHERE category = 'general' AND key = 'platform_name';
-- Update a setting: UPDATE system_settings SET value = 'New Value' WHERE category = 'general' AND key = 'platform_name';
