-- Migration: Add Google OAuth support
-- Run this against your production PostgreSQL database

-- 1. Make password_hash nullable (Google OAuth users won't have a password)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Add auth_provider column ("local", "google", "both")
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'local';

-- 3. Add google_id column with unique constraint and index
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id);
