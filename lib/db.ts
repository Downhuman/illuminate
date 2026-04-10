import { neon } from '@neondatabase/serverless'

// Use POSTGRES_URL as primary, with DATABASE_URL as fallback
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error("[db] No database connection string found. Please set POSTGRES_URL or DATABASE_URL.")
}

export const sql = neon(connectionString!)
