// Supabase has been removed. This file exports null stubs so any remaining
// import sites compile without errors while being fully inert at runtime.
export const supabase = null;
export const SUPABASE_URL = "";
export type SupabaseAuthSettings = Record<string, never>;
export async function fetchSupabaseAuthSettings(): Promise<null> {
  return null;
}
