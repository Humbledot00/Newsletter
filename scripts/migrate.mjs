// scripts/migrate.mjs
// Run with: node -r dotenv/config scripts/migrate.mjs
import { readFileSync } from "fs"
import { neon } from "@neondatabase/serverless"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

const sql = neon(process.env.DATABASE_URL)

const migrationFile = join(__dirname, "../migrations/001_initial.sql")
const migration = readFileSync(migrationFile, "utf8")

console.log("Running migration: 001_initial.sql")
await sql(migration)
console.log("✓ Migration complete")
