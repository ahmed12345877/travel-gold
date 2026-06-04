import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Prefer Supabase's pooled connection (IPv4, reachable from serverless/sandbox).
// Fall back to the direct/non-pooling URLs if the pooler isn't configured.
const rawUrl =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!rawUrl) {
  throw new Error(
    "DATABASE_URL (or POSTGRES_URL) is not set.\n" +
    "Add it in Render Dashboard → Environment.\n" +
    "Use the POOLED connection from Supabase → Connect button → Transaction mode (port 6543).\n" +
    "Format: postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres"
  );
}

// Ensure SSL for Supabase hosts (required; direct connection is often IPv6-only on Render).
// If the URL already includes sslmode, leave it unchanged.
function ensureSsl(url: string): string {
  if (!url.includes("supabase")) return url;
  if (url.includes("sslmode=") || url.includes("ssl=")) return url;
  return url + (url.includes("?") ? "&" : "?") + "sslmode=require";
}

const connectionString = ensureSsl(rawUrl);

const masked = rawUrl.replace(/:([^:@]+)@/, ":***@");
console.log("[drizzle] connecting to:", masked);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
