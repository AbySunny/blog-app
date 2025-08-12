// scripts/migrate.mjs
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

dotenv.config({ path: ".env.local" });
dotenv.config();

function splitSql(text) {
  // naive but fine here: split on semicolons at line ends
  return text
    .split(/;\s*(?:\r?\n|$)/g)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith("--"));
}

async function runStatements(sql, statements) {
  for (const stmt of statements) {
    const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
    try {
      console.log("->", preview + ";");
      await sql.unsafe(stmt + ";");
    } catch (err) {
      const isExt = /create\s+extension/i.test(stmt);
      if (isExt) {
        console.warn("   (extension step ignored):", err.message || err);
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL is not set. Check .env.local at project root.");
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  await sql.unsafe("SET search_path TO public;");
  const dir = path.join(process.cwd(), "db", "migrations");
  const files = (await fs.readdir(dir)).filter(f => f.endsWith(".sql")).sort();

  for (const f of files) {
    const full = path.join(dir, f);
    const text = await fs.readFile(full, "utf8");
    console.log(`Running ${f}...`);
    const statements = splitSql(text);
    await runStatements(sql, statements);
  }

  console.log("Migrations complete.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
