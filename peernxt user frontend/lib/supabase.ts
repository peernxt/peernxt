import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const hasPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('your-project.supabase.co');
const hasPlaceholderKey = !supabaseAnonKey || supabaseAnonKey.includes('your-supabase-anon-key');

export const isSupabaseConfigured = !hasPlaceholderUrl && !hasPlaceholderKey;

if (!isSupabaseConfigured) {
  // Keep a clear runtime message for missing local env setup.
  // The app can still render login UI and show this failure on auth action.
  console.warn('Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

