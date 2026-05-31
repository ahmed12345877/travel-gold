import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Prefer Supabase's pooled connection (IPv4, reachable from serverless/sandbox).
// Fall back to the direct/non-pooling URLs if the pooler isn't configured.
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error("POSTGRES_URL or DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
