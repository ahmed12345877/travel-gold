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

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

// Expose the URL so consumers can safely query public GoTrue settings
export const SUPABASE_URL = url;

// Lightweight helper to preflight-auth configuration from GoTrue settings endpoint
// This endpoint is public on Supabase and safe for client usage.
export type SupabaseAuthSettings = {
  external?: Record<string, { enabled?: boolean } | undefined>;
  email?: { enabled?: boolean; enable_signup?: boolean };
};

export async function fetchSupabaseAuthSettings(): Promise<SupabaseAuthSettings | null> {
  if (!SUPABASE_URL) return null;
  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/settings`, {
      // Avoid caching to reflect dashboard changes quickly
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as SupabaseAuthSettings;
    return json ?? null;
  } catch {
    return null;
  }
}
