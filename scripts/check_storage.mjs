import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
  const { data, error } = await supabase
    .storage
    .from('system-audio')
    .list();

  if (error) {
    console.error('Error listing storage:', error);
    return;
  }

  console.log('Files in system-audio:', data.map(f => f.name));
}

checkStorage();
