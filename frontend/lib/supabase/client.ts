import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://auwymskkuzjhjfskqzkw.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4WE59q1egCiEM53t_7BJLg_ECZNmpF-";

  return createBrowserClient(supabaseUrl, supabaseKey);
}
