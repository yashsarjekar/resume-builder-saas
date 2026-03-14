-- Migration: Add coupon system and drip email campaign tables

-- 1. Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0 NOT NULL,
    valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    applicable_plans VARCHAR(20) DEFAULT 'both' NOT NULL,
    region VARCHAR(10) DEFAULT 'both' NOT NULL,
    is_drip_coupon BOOLEAN DEFAULT FALSE NOT NULL,
    drip_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE DEFAULT NULL,
    drip_step INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_drip_user ON coupons(drip_user_id) WHERE drip_user_id IS NOT NULL;

-- 2. Drip email log table
CREATE TABLE IF NOT EXISTS drip_email_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drip_step INTEGER NOT NULL,
    coupon_code VARCHAR(50) DEFAULT NULL,
    sent_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, drip_step)
);

CREATE INDEX IF NOT EXISTS idx_drip_log_user ON drip_email_log(user_id);

-- 3. Add coupon fields to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) DEFAULT NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS original_amount FLOAT DEFAULT NULL;
