import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const rawUrl =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!rawUrl) {
  console.error(
    "DATABASE_URL (or POSTGRES_URL) is not set.\n" +
    "Add it in Render Dashboard → Environment.\n" +
    "Use the POOLED connection from Supabase → Connect button → Transaction mode (port 6543)."
  );
  process.exit(1);
}

const parsed = new URL(rawUrl);
const isSupabase = parsed.hostname.includes("supabase");

const sql = isSupabase
  ? postgres({
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
      ssl: { rejectUnauthorized: false },
      max: 1,
    })
  : postgres(rawUrl, { max: 1 });

const db = drizzle(sql);

console.log("[migrate] applying migrations from ./drizzle/migrations ...");
await migrate(db, { migrationsFolder: "./drizzle/migrations" });
console.log("[migrate] done");
await sql.end();
