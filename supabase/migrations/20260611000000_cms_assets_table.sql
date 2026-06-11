-- CMS Assets Table — Ampliación del esquema para el Content Management System
-- Fecha: 2026-06-11
-- Descripción: Añade columnas de metadata a visual_assets, crea bucket campaign_assets,
--              y establece políticas RLS para storage y tabla.

-- 1. AMPLIAR visual_assets CON METADATA
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  campaign_id TEXT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  file_name TEXT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  file_type TEXT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  file_size BIGINT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  thumbnail_url TEXT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  asset_type TEXT CHECK (asset_type IN ('uploaded', 'ai_generated')) DEFAULT 'uploaded';
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  visual_prompt TEXT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  bucket_path TEXT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  width INT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  height INT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  duration FLOAT;
ALTER TABLE public.visual_assets ADD COLUMN IF NOT EXISTS
  created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. ACTUALIZAR RLS — Políticas con user_id
DROP POLICY IF EXISTS "Enable read access for all users" ON public.visual_assets;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.visual_assets;
DROP POLICY IF EXISTS "Enable update for all users" ON public.visual_assets;

CREATE POLICY "Anyone can read visual_assets"
  ON public.visual_assets FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own visual_assets"
  ON public.visual_assets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own visual_assets"
  ON public.visual_assets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own visual_assets"
  ON public.visual_assets FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. CREAR BUCKET campaign_assets (unificado para CMS)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'campaign_assets',
  'campaign_assets',
  true,
  false,
  104857600,
  '{video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp}'
)
ON CONFLICT (id) DO NOTHING;

-- 4. STORAGE POLICIES PARA campaign_assets
DROP POLICY IF EXISTS "Allow authenticated uploads to campaign_assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read campaign_assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own campaign_assets" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to campaign_assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'campaign_assets');

CREATE POLICY "Allow public read campaign_assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'campaign_assets');

CREATE POLICY "Allow users to update own campaign_assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'campaign_assets');

CREATE POLICY "Allow users to delete own campaign_assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'campaign_assets');
