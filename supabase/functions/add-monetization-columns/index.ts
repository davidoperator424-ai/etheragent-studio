import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  try {
    // Add columns to profiles table
    await supabase.rpc('exec_sql', { 
      query: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_name text DEFAULT 'free';" 
    })
    
    await supabase.rpc('exec_sql', { 
      query: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS compute_tokens integer DEFAULT 3;" 
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Columns added to profiles' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
