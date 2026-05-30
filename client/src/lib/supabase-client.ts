import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const env = import.meta.env as Record<string, string | undefined>;
  const url = env.VITE_SUPABASE_URL || "";
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || "";

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) environment variables."
    );
  }

  return createBrowserClient(url, publishableKey);
}
