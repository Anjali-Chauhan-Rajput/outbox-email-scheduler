
import 'dotenv/config'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Check your backend .env file.')
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
})

export async function testDatabaseConnection() {
  const result = await pool.query('SELECT NOW() AS current_time')
  return result.rows[0]
}
