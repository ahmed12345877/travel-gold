import "dotenv/config";
import { defineConfig } from "drizzle-kit";

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

const parsed = new URL(rawUrl);
const isSupabase = parsed.hostname.includes("supabase");

const masked = rawUrl.replace(/:([^:@]+)@/, ":***@");
console.log("[drizzle] connecting to:", masked);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  tablesFilter: [
    "users",
    "bookings",
    "reviews",
    "offers",
    "contact_messages",
    "file_uploads",
    "gallery_items",
    "gallery_videos",
    "ai_subscriptions",
    "ai_credits",
    "ai_usage",
    "ai_transactions",
    "blog_posts",
    "marketing_content",
    "marketing_calendar",
    "marketing_templates",
    "destinations",
    "site_settings",
  ],
  dbCredentials: isSupabase
    ? {
        host: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : 5432,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, ""),
        ssl: { rejectUnauthorized: false },
      }
    : {
        url: rawUrl,
      },
});
