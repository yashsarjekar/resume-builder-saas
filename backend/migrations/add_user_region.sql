-- Add region column to users table for region-based subscription limits
-- "IN" = India (lower limits, lower price)
-- "INTL" = International (higher limits, higher price)

ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(10) DEFAULT 'IN' NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);
