-- EtherAgent OS - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'agency')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'growth', 'c-suite', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Avatars table (premium avatars available for purchase)
CREATE TABLE public.avatars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  avatar_hq_url TEXT,
  video_preview_en TEXT,
  video_preview_es TEXT,
  category TEXT DEFAULT 'general',
  price DECIMAL(10,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User purchases (which avatars/templates a user has purchased)
CREATE TABLE public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT CHECK (item_type IN ('avatar', 'template', 'flow')),
  purchase_price DECIMAL(10,2),
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'general',
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System flows (video generation workflows)
CREATE TABLE public.system_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User presets (saved campaign configurations)
CREATE TABLE public.presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Render jobs (video generation history)
CREATE TABLE public.render_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  avatar_id UUID REFERENCES public.avatars(id),
  script TEXT,
  platform TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  video_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Analysis history (URL analysis results)
CREATE TABLE public.analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  target_audience JSONB,
  financial_projection JSONB,
  executive_directive JSONB,
  strategic_hook TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visual assets (URLs analyzed by Nexus Brain)
CREATE TABLE public.visual_assets (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visual_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.visual_assets
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.visual_assets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.visual_assets
  FOR UPDATE USING (true);

-- Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Avatars: Everyone can read active avatars
CREATE POLICY "Anyone can view active avatars" ON public.avatars
  FOR SELECT USING (is_active = true);

-- Purchases: Users can only see their own purchases
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Templates: Everyone can read active templates
CREATE POLICY "Anyone can view active templates" ON public.templates
  FOR SELECT USING (is_active = true);

-- System flows: Everyone can read active flows
CREATE Policy "Anyone can view active flows" ON public.system_flows
  FOR SELECT USING (is_active = true);

-- Presets: Users can only see their own presets
CREATE POLICY "Users can view own presets" ON public.presets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create presets" ON public.presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets" ON public.presets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets" ON public.presets
  FOR DELETE USING (auth.uid() = user_id);

-- Render jobs: Users can only see their own jobs
CREATE POLICY "Users can view own render jobs" ON public.render_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create render jobs" ON public.render_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analysis history: Users can only see their own analysis
CREATE POLICY "Users can view own analysis" ON public.analysis_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create analysis" ON public.analysis_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presets_updated_at BEFORE UPDATE ON public.presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default avatars (sample data)
INSERT INTO public.avatars (name, description, category, price, is_premium) VALUES
  ('Executive Sarah', 'Professional female executive avatar', 'business', 49.99, true),
  ('CEO Marcus', 'Male CEO avatar for corporate content', 'business', 49.99, true),
  ('Tech Innovator', 'Modern tech entrepreneur avatar', 'tech', 79.99, true),
  ('Wellness Expert', 'Health and wellness professional avatar', 'health', 59.99, true);

-- Insert default templates (sample data)
INSERT INTO public.templates (name, description, category, price) VALUES
  ('Brand Story', 'Emotional storytelling template for brand awareness', 'marketing', 29.99),
  ('Product Launch', 'High-energy template for product announcements', 'sales', 39.99),
  ('Testimonial', 'Social proof template for customer testimonials', 'marketing', 19.99),
  ('Educational', 'Educational content template for thought leadership', 'content', 24.99);

-- Insert default system flows
INSERT INTO public.system_flows (name, description, category, price) VALUES
  ('Quick Social', '15-second optimized flow for social media', 'social', 0),
  ('Premium Cinematic', '30-second high-quality cinematic flow', 'cinematic', 99.99),
  ('Batch Producer', 'Multiple videos in one session', 'production', 149.99);

-- Campaign videos storage bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('campaign-videos', 'campaign-videos', true, false, 52428800, '{video/mp4,video/webm,video/quicktime}')
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'campaign-videos');

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'campaign-videos');
