-- Create the nexus_youtube_ads table
CREATE TABLE IF NOT EXISTS public.nexus_youtube_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    detected_sector TEXT,
    strategy_score INTEGER,
    campaign_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nexus_youtube_ads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own ads" 
ON public.nexus_youtube_ads FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ads" 
ON public.nexus_youtube_ads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads" 
ON public.nexus_youtube_ads FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads" 
ON public.nexus_youtube_ads FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS nexus_youtube_ads_user_id_idx ON public.nexus_youtube_ads(user_id);
