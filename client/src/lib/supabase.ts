import { createClient } from "@supabase/supabase-js";

// Read both Vercel's NEXT_PUBLIC_ and Vite's VITE_ conventions at build time.
// Also supports VITE_SUPABASE_PUBLISHABLE_KEY (newer Supabase naming for the anon/public key).
const env = import.meta.env as Record<string, string | undefined>;
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabase = url && anonKey
  ? createClient(url, anonKey)
  : null;
