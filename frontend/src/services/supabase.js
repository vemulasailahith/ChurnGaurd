import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

/**
 * Checks if a real, valid Supabase configuration is present.
 */
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('your-project-id') &&
  !rawKey.includes('your-supabase-anon-key') &&
  !rawKey.includes('your-anon-key') &&
  (rawUrl.startsWith('https://') || rawUrl.startsWith('http://'))
);

const effectiveUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const effectiveKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

/**
 * Singleton Supabase Client for ChurnGuard
 */
export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export default supabase;
