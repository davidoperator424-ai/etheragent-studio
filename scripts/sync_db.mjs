import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const records = [
  { 
    id: 'ch_welcome', 
    agent_id: 'marcus', 
    script_text: 'Sistemas en línea, CEO. Soy Marcus.', 
    audio_url: 'https://njhifpbnrbbhbmwgedtz.supabase.co/storage/v1/object/public/system-audio/ch_welcome.mp3',
    updated_at: new Date().toISOString()
  },
  { 
    id: 'sl_welcome', 
    agent_id: 'valeria', 
    script_text: 'Iniciando Social Lab. Soy Valeria.', 
    audio_url: 'https://njhifpbnrbbhbmwgedtz.supabase.co/storage/v1/object/public/system-audio/tr_social.mp3',
    updated_at: new Date().toISOString()
  },
  { 
    id: 'ooh_welcome', 
    agent_id: 'viktor', 
    script_text: 'Sistemas espaciales activados.', 
    audio_url: 'https://njhifpbnrbbhbmwgedtz.supabase.co/storage/v1/object/public/system-audio/tr_ooh.mp3',
    updated_at: new Date().toISOString()
  },
  { 
    id: 'cl_welcome', 
    agent_id: 'kaelen', 
    script_text: 'Laboratorio Comercial en línea.', 
    audio_url: 'https://njhifpbnrbbhbmwgedtz.supabase.co/storage/v1/object/public/system-audio/tr_commercial.mp3',
    updated_at: new Date().toISOString()
  }
];

async function syncDb() {
  console.log('🦅 INICIANDO SYNC DE BASE DE DATOS (UPSERT)...');
  
  for (const record of records) {
    console.log(`📦 Sincronizando: ${record.id}...`);
    const { error } = await supabase
      .from('system_scripts')
      .upsert(record, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Error sincronizando ${record.id}:`, error.message);
    } else {
      console.log(`✅ ${record.id} sincronizado.`);
    }
  }

  console.log('🔥 SYNC COMPLETADO.');
}

syncDb();
