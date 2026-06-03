import express from 'express'
import { sendSMS } from '../services/africasTalking.js'

const router = express.Router()

router.post('/send', async (req, res) => {
  const { siteName, workers } = req.body

  if (!workers || workers.length === 0) {
    return res.status(400).json({ error: 'No workers provided' })
  }

  const results = []

  for (const worker of workers) {
    const message = worker.hours > 0
      ? `✅ Payment confirmed!\nSite: ${siteName}\nHours: ${worker.hours.toFixed(2)}hrs\nAmount: Ksh ${worker.amount}\nAsante! 🙏 MjengoSite`
      : `✅ Attendance recorded!\nSite: ${siteName}\nThank you ${worker.name}! MjengoSite`

    try {
      await sendSMS(worker.phone, message)
      results.push({ phone: worker.phone, status: 'sent' })
    } catch (err) {
      console.error(`SMS failed for ${worker.phone}:`, err.message)
      results.push({ phone: worker.phone, status: 'failed' })
    }
  }

  res.json({ success: true, results })
})

export default router