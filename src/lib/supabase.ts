import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Ensure you have created a `.env.local` file based on `.env.local.example`.'
  );
}

const isValidUrl = (url?: string) => {
  try {
    return url && new URL(url).protocol.startsWith('http');
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project.supabase.co';
const finalKey = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here' ? supabaseAnonKey : 'placeholder-key';

// Ensure the client is a singleton
export const supabase = createClient(finalUrl as string, finalKey);
