-- Migration: Add billing_duration column to users table
-- This stores the billing cycle (1, 3, 6, or 12 months) for subscription limits scaling
-- Run this migration on your database

-- PostgreSQL syntax
ALTER TABLE users
ADD COLUMN IF NOT EXISTS billing_duration INTEGER NOT NULL DEFAULT 1;

-- Add a comment for documentation
COMMENT ON COLUMN users.billing_duration IS 'Billing cycle in months (1=monthly, 3=quarterly, 6=half-yearly, 12=yearly)';
