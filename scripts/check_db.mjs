import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    const { data, error } = await supabase
      .from('system_scripts')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching system_scripts:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Columns in system_scripts:', Object.keys(data[0]));
    } else {
      console.log('No data in system_scripts, cannot determine columns this way.');
      // Try to get schema via RPC or just assume from upload script
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkColumns();
