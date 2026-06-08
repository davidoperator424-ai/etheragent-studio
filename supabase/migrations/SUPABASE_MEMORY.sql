-- ═══════════════════════════════════════════════════════════════
-- ETHERAGENT OS - MEMORIA NEURONAL PERSISTENTE
-- ═══════════════════════════════════════════════════════════════
-- Ejecuta este SQL en: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'agent')),
  content text NOT NULL,
  image_url text,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Política de acceso (usuarios ven solo sus mensajes)
CREATE POLICY "Users can manage their own messages" 
  ON public.chat_messages 
  FOR ALL 
  USING (auth.uid() = user_id);

-- 4. Verificar tabla creada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_messages';
