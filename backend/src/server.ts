
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import campaignsRouter from './campaigns.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Outbox backend is running',
  })
})

app.use('/api/campaigns', campaignsRouter)

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`)
})

