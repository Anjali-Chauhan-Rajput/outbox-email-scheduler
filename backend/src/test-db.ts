
import 'dotenv/config'
import { testDatabaseConnection, pool } from './db.js'

async function main() {
  try {
    const result = await testDatabaseConnection()
    console.log('Database connected successfully!')
    console.log('Database server time:', result.current_time)
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

main()
