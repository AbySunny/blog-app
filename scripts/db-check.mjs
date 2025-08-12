// scripts/db-check.mjs
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import path from "node:path";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const meta = await sql`
    SELECT
      current_database() AS db,
      current_user AS user,
      current_setting('search_path') as search_path
  `;
  console.log("Connection:", meta[0]);

  // try creating a tiny marker in public schema
  await sql.unsafe("CREATE TABLE IF NOT EXISTS public.__marker(id int PRIMARY KEY);");
  console.log("Created/confirmed public.__marker");

  const exists = await sql`
    SELECT
      to_regclass('public.users')   AS users,
      to_regclass('public.posts')   AS posts,
      to_regclass('public.post_likes')  AS post_likes,
      to_regclass('public.post_shares') AS post_shares,
      to_regclass('public.follows') AS follows,
      to_regclass('public.__marker') AS marker
  `;
  console.log("Tables:", exists[0]);

  const all = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log("Public tables:", all.map(r => r.table_name));
}
main().catch(e => { console.error(e); process.exit(1); });
