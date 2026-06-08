-- Migration: Add plan_name and compute_tokens to profiles
-- Run this in Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_name text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS compute_tokens integer DEFAULT 3;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('plan_name', 'compute_tokens');
