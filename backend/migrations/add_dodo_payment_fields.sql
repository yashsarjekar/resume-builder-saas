-- Migration: Add Dodo Payments support fields
-- Created: 2026-02-20

-- Add payment_gateway column to identify which gateway processed the payment
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(20) DEFAULT 'razorpay' NOT NULL;

-- Add dodo_session_id column for Dodo checkout sessions
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS dodo_session_id VARCHAR(255);

-- Add dodo_payment_id column for Dodo payment confirmation
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS dodo_payment_id VARCHAR(255);

-- Create index for faster Dodo session lookups
CREATE INDEX IF NOT EXISTS idx_payments_dodo_session ON payments(dodo_session_id);

-- Create index for payment gateway filtering
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments(payment_gateway);
