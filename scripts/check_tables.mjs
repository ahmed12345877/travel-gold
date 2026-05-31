import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL, { prepare: false })
const rows =
  await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
console.log("Tables (" + rows.length + "):")
rows.forEach((r) => console.log(" - " + r.table_name))
await sql.end()
