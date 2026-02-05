-- Migration: Add razorpay_customer_id to users table
-- Created: 2026-02-04
-- Purpose: Support recurring subscriptions with Razorpay

-- Add razorpay_customer_id column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(255) NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_razorpay_customer_id
ON users(razorpay_customer_id);
