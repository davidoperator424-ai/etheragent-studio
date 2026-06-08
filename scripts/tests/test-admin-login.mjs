import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njhifpbnrbbhbmwgedtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qaGlmcGJucmJiaGJtd2dlZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDQwMjYsImV4cCI6MjA4NzcyMDAyNn0.-r5bypDefol53O9wd-Bc8EGCpXirlnaSXpvSdbroczw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = 'davicho4522@gmail.com';
const password = 'Ferrary861';

async function testLogin() {
  console.log('🔍 Probando conexión directa con Supabase...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Error de Login:', error.message);
      return;
    }

    console.log('✅ LOGIN EXITOSO!');
    console.log('User ID:', data.user.id);
  } catch (err) {
    console.error('❌ Error atrapado:', err);
  }
}

testLogin();
