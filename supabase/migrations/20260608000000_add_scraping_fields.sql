-- Migration: Add scraping and brand context fields to campaigns table
-- Date: 2026-06-08

ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS brand_context JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS scraping_status TEXT DEFAULT 'idle' CHECK (scraping_status IN ('idle', 'scraping', 'processing', 'completed', 'failed'));

-- Update existing rows if necessary
UPDATE public.campaigns SET scraping_status = 'completed' WHERE scraping_status IS NULL AND status = 'completed';
