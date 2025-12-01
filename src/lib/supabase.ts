import { createClient } from '@supabase/supabase-js';

// Menggunakan environment variables dari WebContainer/Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Anon Key hilang. Pastikan .env dikonfigurasi.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
