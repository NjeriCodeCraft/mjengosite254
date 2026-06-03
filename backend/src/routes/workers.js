import express from 'express';
import { get, all, run } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Add worker to a site
router.post('/add', async (req, res) => {
  const { siteId, name, phone } = req.body;

  if (!siteId || !name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const workerId = uuidv4();

  try {
    await run(
      `INSERT INTO workers (id, site_id, name, phone) VALUES (?, ?, ?, ?)`,
      [workerId, siteId, name, phone]
    );

    res.json({
      success: true,
      message: 'Worker added successfully',
      workerId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add worker' });
  }
});

// Get all workers for a site
router.get('/site/:siteId', async (req, res) => {
  try {
    const workers = await all('SELECT * FROM workers WHERE site_id = ?', [req.params.siteId]);
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

export default router;