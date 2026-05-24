export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const env = import.meta.env as Record<string, string | undefined>;
  const oauthPortalUrl = env.VITE_OAUTH_PORTAL_URL;
  const appId = env.VITE_APP_ID;
  // Detect client Supabase presence at build time; if present, drive users to the internal admin login page
  const hasSupabaseClient = Boolean(
    (env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL) &&
      (env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

  // Treat legacy Manus portal hosts as invalid to avoid NXDOMAIN
  const isLegacyManusHost = (u: string | undefined) => {
    if (!u) return true;
    try {
      const parsed = new URL(u);
      const host = parsed.hostname.toLowerCase();
      return host === "portal.manus.im" || host.endsWith(".manus.im");
    } catch {
      return true;
    }
  };

  // If Supabase is configured or the portal host is invalid/legacy, route to our internal admin login
  if (hasSupabaseClient || isLegacyManusHost(oauthPortalUrl)) {
    return "/admin/login";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId ?? "");
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
