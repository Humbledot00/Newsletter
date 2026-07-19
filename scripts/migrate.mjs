// scripts/migrate.mjs
// Run with: node -r dotenv/config scripts/migrate.mjs
import dotenv from "dotenv"
import { readFileSync, readdirSync } from "fs"
import { neon } from "@neondatabase/serverless"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: join(__dirname, "../.env.local") })
dotenv.config({ path: join(__dirname, "../.env") })

const sql = neon(process.env.DATABASE_URL)
const migrationsDir = join(__dirname, "../migrations")

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()

function splitSqlStatements(sqlContent) {
  const statements = []
  let current = ""
  let inSingleQuote = false
  let inDoubleQuote = false
  let inDollarQuote = false
  let dollarTag = ""

  for (let i = 0; i < sqlContent.length; i += 1) {
    const char = sqlContent[i]
    const nextChars = sqlContent.slice(i)

    if (inDollarQuote) {
      if (nextChars.startsWith(dollarTag)) {
        current += dollarTag
        i += dollarTag.length - 1
        inDollarQuote = false
        dollarTag = ""
        continue
      }
    } else if (inSingleQuote) {
      if (char === "'" && sqlContent[i - 1] !== "\\") {
        inSingleQuote = false
      }
    } else if (inDoubleQuote) {
      if (char === '"' && sqlContent[i - 1] !== "\\") {
        inDoubleQuote = false
      }
    } else {
      const dollarMatch = nextChars.match(/^\$[A-Za-z0-9_]*\$/)
      if (dollarMatch) {
        inDollarQuote = true
        dollarTag = dollarMatch[0]
        current += dollarTag
        i += dollarTag.length - 1
        continue
      }
      if (char === "'") {
        inSingleQuote = true
      } else if (char === '"') {
        inDoubleQuote = true
      } else if (char === ";") {
        const statement = current.trim()
        if (statement) {
          statements.push(statement)
        }
        current = ""
        continue
      }
    }

    current += char
  }

  const finalStatement = current.trim()
  if (finalStatement) {
    statements.push(finalStatement)
  }

  return statements
}

for (const fileName of migrationFiles) {
  const migrationFile = join(migrationsDir, fileName)
  const migration = readFileSync(migrationFile, "utf8")
  console.log(`Running migration: ${fileName}`)

  const statements = splitSqlStatements(migration)

  for (const statement of statements) {
    await sql(statement)
  }
}

console.log("✓ Migrations complete")
