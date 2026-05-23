import { createClient as createServerClient, type SupabaseClient } from "@supabase/supabase-js";

type ServerSupabaseConfig = {
  url: string;
  serviceKey: string;
};

function loadServerConfig(): ServerSupabaseConfig | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

let serverClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (serverClient) return serverClient;
  const cfg = loadServerConfig();
  if (!cfg) return null;
  serverClient = createServerClient(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}
