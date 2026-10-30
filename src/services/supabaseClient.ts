import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL ||
  'https://gfnuqcpbrniwrfuwiorf.supabase.co';

const supabaseKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_6kUSQNyzeGXf94KcKqpFbA_jOdcZr69';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  url: string;
  error?: string;
}> {
  try {
    // Attempt a light ping or schema query
    const { error } = await supabase.from('pilot_areas').select('id').limit(1);
    // If the table doesn't exist yet in Supabase or returns an error, the project URL is still reachable
    return {
      connected: !error || !error.message.includes('fetch'),
      url: supabaseUrl,
      error: error?.message
    };
  } catch (err: any) {
    return {
      connected: false,
      url: supabaseUrl,
      error: err.message
    };
  }
}
