-- Migration: Change payments.amount from INTEGER to FLOAT
-- This allows storing exact payment amounts with decimal precision
-- Run this migration on your database

-- PostgreSQL syntax
ALTER TABLE payments
ALTER COLUMN amount TYPE DOUBLE PRECISION USING amount::DOUBLE PRECISION;

-- Note: Existing integer values will be preserved as floats (e.g., 1299 -> 1299.0)
