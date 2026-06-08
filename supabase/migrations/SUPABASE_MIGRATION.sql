-- ═══════════════════════════════════════════════════════════════
-- ETHERAGENT OS - MIGRATION DE MONETIZACIÓN
-- ═══════════════════════════════════════════════════════════════
-- Ejecuta este SQL en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Agregar columnas de monetización a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_name text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS compute_tokens integer DEFAULT 3;

-- 2. Verificar columnas creadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('plan_name', 'compute_tokens');

-- 3. Para usuarios existentes, setear tokens iniciales (opcional)
-- UPDATE profiles SET compute_tokens = 3 WHERE compute_tokens IS NULL;
-- UPDATE profiles SET plan_name = 'free' WHERE plan_name IS NULL;
