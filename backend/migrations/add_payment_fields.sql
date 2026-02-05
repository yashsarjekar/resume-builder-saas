-- Migration: Add new fields to payments table for Razorpay integration
-- Created: 2026-02-04

-- Add currency column
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'INR' NOT NULL;

-- Add plan column (starter/pro)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS plan VARCHAR(50);

-- Add duration_months column
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS duration_months INTEGER;

-- Add updated_at column
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Migrate existing data if any
-- Set default values for existing records
UPDATE payments
SET
    currency = 'INR',
    plan = LOWER(subscription_type),
    duration_months = 1,
    updated_at = created_at
WHERE currency IS NULL;

-- Make plan and duration_months NOT NULL after migration
ALTER TABLE payments
ALTER COLUMN plan SET NOT NULL;

ALTER TABLE payments
ALTER COLUMN duration_months SET NOT NULL;

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
