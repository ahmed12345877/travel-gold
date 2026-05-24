export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Optionally include a nextPath (relative) so the server can redirect there after login.
export const getLoginUrl = (nextPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  // Only allow simple relative paths to prevent open redirects
  const safeNext = nextPath && /^\//.test(nextPath) ? nextPath : undefined;

  const baseCallback = `${window.location.origin}/api/oauth/callback`;
  const redirectUri = safeNext
    ? `${baseCallback}?next=${encodeURIComponent(safeNext)}`
    : baseCallback;

  // The OAuth server echoes state back to us; keep it as the redirectUri only
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
