import express from 'express';
import { all } from '../models/database.js';

const router = express.Router();

// Get attendance for a site (today)
router.get('/site/:siteId/today', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const attendance = await all(
      `SELECT a.*, w.name, w.phone FROM attendance a
       JOIN workers w ON a.worker_id = w.id
       WHERE a.site_id = ? AND a.date = ?
       ORDER BY a.check_in_time DESC`,
      [req.params.siteId, today]
    );

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get worker's attendance history
router.get('/worker/:workerId', async (req, res) => {
  try {
    const attendance = await all(
      `SELECT * FROM attendance WHERE worker_id = ? ORDER BY date DESC LIMIT 30`,
      [req.params.workerId]
    );

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get incidents for a site
router.get('/incidents/:siteId', async (req, res) => {
  try {
    const incidents = await all(
      `SELECT * FROM incidents WHERE site_id = ? ORDER BY created_at DESC`,
      [req.params.siteId]
    );

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

export default router;