import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExisting() {
  const ids = ['ch_welcome', 'sl_welcome', 'ooh_welcome', 'cl_welcome'];
  const { data, error } = await supabase
    .from('system_scripts')
    .select('*')
    .in('id', ids);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Existing records:', JSON.stringify(data, null, 2));
}

checkExisting();
