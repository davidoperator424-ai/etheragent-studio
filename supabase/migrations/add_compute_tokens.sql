-- ============================================================================
-- ETHERAGENT STUDIO - SQL PARA COMPUTE TOKENS
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- ============================================================================

-- 1. Agregar columnas de tokens a la tabla profiles (si no existen)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS compute_tokens INTEGER DEFAULT 1500,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 1500,
ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'SOLO OPERATOR';

-- 2. Actualizar usuarios existentes con valores por defecto
UPDATE profiles 
SET compute_tokens = 1500, 
    total_tokens = 1500, 
    plan_name = 'SOLO OPERATOR'
WHERE compute_tokens IS NULL OR compute_tokens = 0;

-- 3. Crear función RPC para deducir tokens
CREATE OR REPLACE FUNCTION deduct_compute_tokens(user_id UUID, amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Obtener el balance actual
  SELECT compute_tokens INTO current_balance
  FROM profiles
  WHERE id = user_id;

  -- Verificar si tiene suficientes tokens
  IF current_balance IS NULL OR current_balance < amount THEN
    RETURN FALSE;
  END IF;

  -- Deducir los tokens
  UPDATE profiles
  SET compute_tokens = compute_tokens - amount
  WHERE id = user_id;

  RETURN TRUE;
END;
$$;

-- 4. Crear función para agregar tokens (para compras)
CREATE OR REPLACE FUNCTION add_compute_tokens(user_id UUID, amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF amount <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
  SET compute_tokens = compute_tokens + amount
  WHERE id = user_id;

  RETURN TRUE;
END;
$$;

-- 5. Crear función para inicializar perfil de usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, compute_tokens, total_tokens, plan_name)
  VALUES (
    NEW.id,
    NEW.email,
    1500,  -- Tokens iniciales para nuevos usuarios
    1500,
    'SOLO OPERATOR'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear trigger para inicializar perfiles automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que las columnas existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('compute_tokens', 'total_tokens', 'plan_name');

-- Verificar que la función RPC existe
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname = 'deduct_compute_tokens';
