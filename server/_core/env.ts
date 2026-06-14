export const ENV = {
  // VITE_APP_ID is the Manus OAuth app id (unused in the Firebase auth flow).
  // Fall back to VITE_FIREBASE_APP_ID so the signed session always carries a
  // stable, non-empty app identifier in production.
  appId: process.env.VITE_APP_ID ?? process.env.VITE_FIREBASE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  /** Admin email for direct password login (no OAuth required) */
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  /** SHA-256 hex hash of the admin password */
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
};
