// scripts/migrate-pg.mjs
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

function splitSql(text) {
  return text
    .split(/;\s*(?:\r?\n|$)/g)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith("--"));
}

async function main() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL is not set. Check .env.local at project root.");
    process.exit(1);
  }

  // Neon requires SSL; pg handles it automatically from URL, but this is safe too
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const dir = path.join(process.cwd(), "db", "migrations");
  const files = (await fs.readdir(dir)).filter(f => f.endsWith(".sql")).sort();

  for (const f of files) {
    const full = path.join(dir, f);
    const text = await fs.readFile(full, "utf8");
    console.log(`Running ${f}...`);

    const fullSql = `
  CREATE SCHEMA IF NOT EXISTS public;
  SET search_path TO public;
  ${text}
`;

    try {
      await client.query("BEGIN");
      await client.query(fullSql); // run the file as one multi-statement query
      await client.query("COMMIT");
      console.log(`${f} applied.`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`Failed applying ${f}`);
      throw err;
    }
  }

  await client.end();
  console.log("Migrations complete.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
