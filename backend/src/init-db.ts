
import 'dotenv/config'
import { pool } from './db.js'

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        scheduled_at TIMESTAMPTZ,
        status VARCHAR(20) NOT NULL DEFAULT 'draft'
          CHECK (status IN ('draft', 'scheduled', 'processing', 'sent', 'failed')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL
          REFERENCES campaigns(id) ON DELETE CASCADE,
        email VARCHAR(320) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'scheduled', 'sent', 'failed')),
        sent_at TIMESTAMPTZ,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (campaign_id, email)
      );

      CREATE INDEX IF NOT EXISTS idx_campaigns_status_schedule
        ON campaigns (status, scheduled_at);

      CREATE INDEX IF NOT EXISTS idx_recipients_campaign_status
        ON recipients (campaign_id, status);

      CREATE INDEX IF NOT EXISTS idx_recipients_email
        ON recipients (email);
    `)

    console.log('Database tables created successfully!')
    console.log('Created tables: campaigns, recipients')
    console.log('Created indexes for scheduling and recipient lookups.')
  } catch (error) {
    console.error('Database setup failed:', error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

initializeDatabase()
