import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import postgres from "postgres";

const rawUrl =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!rawUrl) {
  console.error(
    "[migrate] DATABASE_URL or POSTGRES_URL is not set.\n" +
      "Add it in Render Dashboard → Environment.\n" +
      "Use the POOLED connection from Supabase → Connect button → Transaction mode (port 6543)."
  );
  process.exit(1);
}

const parsed = new URL(rawUrl);
const isSupabase = parsed.hostname.includes("supabase");

console.log(
  `[migrate] connecting to: ${parsed.protocol}//${parsed.username}:***@${parsed.hostname}:${parsed.port || 5432}${parsed.pathname}`
);

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

// ── Schema repair ─────────────────────────────────────────────────────────────
// Adds missing columns to tables that may exist from a partial or old migration.
// ADD COLUMN IF NOT EXISTS is idempotent and safe to run on every invocation.
const repairStatements = [
  `ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "openId" varchar(64)`,
  `ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "loginMethod" varchar(64)`,
  `ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "avatarUrl" text`,
  `ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS "lastSignedIn" timestamp DEFAULT now()`,
];

console.log("[migrate] running schema repair ...");
for (const stmt of repairStatements) {
  try {
    await sql.unsafe(stmt);
  } catch (e: any) {
    // 42701 = duplicate_column, 42P01 = table doesn't exist yet (will be created below)
    if (!["42701", "42P01"].includes(e.code)) {
      console.warn(`  [repair warn] ${e.message.split("\n")[0]}`);
    }
  }
}

// ── Main migration ────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sqlPath = join(__dirname, "../drizzle/migrations/0000_initial.sql");
const sqlContent = readFileSync(sqlPath, "utf-8");

// Split on -->statement-breakpoint markers if present, otherwise on ";\n"
const statements = sqlContent
  .split(/-->statement-breakpoint\n?/)
  .flatMap((chunk) =>
    chunk
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))
  );

console.log(`[migrate] executing ${statements.length} statements ...`);
let applied = 0;
let skipped = 0;

for (const stmt of statements) {
  try {
    await sql.unsafe(stmt);
    applied++;
  } catch (e: any) {
    // Ignorable "already exists" codes:
    // 42P07 duplicate_table, 42710 duplicate_object (constraint/index),
    // 42701 duplicate_column, 42P16 invalid_table_definition
    if (["42P07", "42710", "42701", "42P16"].includes(e.code)) {
      skipped++;
      continue;
    }
    // Column not found when adding a constraint on a pre-existing table that
    // has a different schema. The repair step above should have fixed the known
    // cases; if we still hit this, skip the constraint and warn.
    if (e.code === "42703" && /ADD CONSTRAINT/i.test(stmt)) {
      console.warn(
        `  [warn] skipping constraint (column not found): ${e.message.split("\n")[0]}`
      );
      skipped++;
      continue;
    }
    console.error(
      `  [error] failed: ${stmt.slice(0, 100).replace(/\s+/g, " ")}`
    );
    await sql.end().catch(() => {});
    process.exit(1);
  }
}

console.log(`[migrate] done — ${applied} applied, ${skipped} skipped`);
await sql.end();
