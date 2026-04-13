import { neon } from '@neondatabase/serverless'

// Strictly use POSTGRES_URL for Neon connection
const connectionString = process.env.POSTGRES_URL

// Export connection status for debugging
export const dbConfigured = !!connectionString

// Create SQL client - will throw at runtime if not configured
export const sql = connectionString 
  ? neon(connectionString)
  : (() => {
      // Return a mock function that throws a clear error
      const notConfigured = () => {
        throw new Error("POSTGRES_URL environment variable is not set")
      }
      return notConfigured as ReturnType<typeof neon>
    })()
