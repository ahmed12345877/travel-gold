import "dotenv/config";
import postgres from "postgres";

const url =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!url) {
  console.error("No connection string found");
  process.exit(1);
}

const sql = postgres(url, { prepare: false });

try {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
  console.log("Connected. Tables:", tables.length);

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position`;
  console.log("users columns:", cols.map((c) => c.column_name).join(", "));

  // Simulate the customer-login upsert path with quoted camelCase identifiers
  const testOpenId = "smoketest_" + Date.now();
  await sql`
    INSERT INTO users ("openId", "name", "email", "role", "createdAt", "updatedAt", "lastSignedIn")
    VALUES (${testOpenId}, 'Smoke Test', ${testOpenId + "@example.com"}, 'user', NOW(), NOW(), NOW())
    ON CONFLICT ("openId") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = NOW()
  `;
  const row = await sql`SELECT id, "openId", role FROM users WHERE "openId" = ${testOpenId}`;
  console.log("Upsert OK ->", JSON.stringify(row[0]));

  await sql`DELETE FROM users WHERE "openId" = ${testOpenId}`;
  console.log("Cleanup OK. Customer-login DB path works.");
} catch (e) {
  console.error("SMOKE FAIL:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
