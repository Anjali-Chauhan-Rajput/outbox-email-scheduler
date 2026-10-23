
import { Router } from 'express'
import { pool } from './db.js'

const router = Router()

const allowedStatuses = [
  'draft',
  'scheduled',
  'processing',
  'sent',
  'failed',
] as const

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         name,
         subject,
         body,
         scheduled_at,
         status,
         created_at,
         updated_at
       FROM campaigns
       ORDER BY created_at DESC`,
    )

    res.json({ campaigns: result.rows })
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    res.status(500).json({ error: 'Failed to fetch campaigns' })
  }
})

router.post('/', async (req, res) => {
  const { name, subject, body, scheduledAt } = req.body ?? {}

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof subject !== 'string' ||
    !subject.trim() ||
    typeof body !== 'string' ||
    !body.trim()
  ) {
    res.status(400).json({
      error: 'Name, subject, and body are required.',
    })
    return
  }

  let scheduledDate: Date | null = null

  if (scheduledAt !== undefined && scheduledAt !== null && scheduledAt !== '') {
    scheduledDate = new Date(scheduledAt)

    if (Number.isNaN(scheduledDate.getTime())) {
      res.status(400).json({ error: 'Invalid scheduledAt date.' })
      return
    }

    if (scheduledDate.getTime() <= Date.now()) {
      res.status(400).json({ error: 'Scheduled time must be in the future.' })
      return
    }
  }

  const status = scheduledDate ? 'scheduled' : 'draft'

  try {
    const result = await pool.query(
      `INSERT INTO campaigns (name, subject, body, scheduled_at, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, subject, body, scheduled_at, status, created_at, updated_at`,
      [
        name.trim(),
        subject.trim(),
        body.trim(),
        scheduledDate,
        status,
      ],
    )

    res.status(201).json({ campaign: result.rows[0] })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    res.status(500).json({ error: 'Failed to create campaign' })
  }
})

router.get('/:id', async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, subject, body, scheduled_at, status, created_at, updated_at
     FROM campaigns
     WHERE id = $1`,
    [req.params.id],
  ).catch((error) => {
    console.error('Failed to fetch campaign:', error)
    return null
  })

  if (!result) {
    res.status(500).json({ error: 'Failed to fetch campaign' })
    return
  }

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Campaign not found' })
    return
  }

  res.json({ campaign: result.rows[0] })
})

router.get('/:id/recipients', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `SELECT id, campaign_id, email, status, sent_at, error_message, created_at
       FROM recipients
       WHERE campaign_id = $1
       ORDER BY created_at DESC`,
      [id],
    )

    res.json({ recipients: result.rows })
  } catch (error) {
    console.error('Failed to fetch recipients:', error)
    res.status(500).json({ error: 'Failed to fetch recipients' })
  }
})

router.post('/:id/recipients', async (req, res) => {
  const { id } = req.params
  const { emails } = req.body ?? {}

  if (!Array.isArray(emails) || emails.length === 0) {
    res.status(400).json({
      error: 'Please provide a non-empty emails array.',
    })
    return
  }

  const normalizedEmails = [
    ...new Set(
      emails
        .filter((email): email is string => typeof email === 'string')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    ),
  ]

  if (normalizedEmails.length === 0) {
    res.status(400).json({
      error: 'Please provide at least one valid email address.',
    })
    return
  }

  try {
    const campaign = await pool.query(
      'SELECT id FROM campaigns WHERE id = $1',
      [id],
    )

    if (campaign.rows.length === 0) {
      res.status(404).json({ error: 'Campaign not found' })
      return
    }

    const insertedRecipients = []

    for (const email of normalizedEmails) {
      const result = await pool.query(
        `INSERT INTO recipients (campaign_id, email, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (campaign_id, email) DO NOTHING
         RETURNING id, campaign_id, email, status, created_at`,
        [id, email],
      )

      if (result.rows.length > 0) {
        insertedRecipients.push(result.rows[0])
      }
    }

    res.status(201).json({
      message: 'Recipients processed successfully.',
      added: insertedRecipients.length,
      recipients: insertedRecipients,
    })
  } catch (error) {
    console.error('Failed to add recipients:', error)
    res.status(500).json({ error: 'Failed to add recipients' })
  }
})

export default router
