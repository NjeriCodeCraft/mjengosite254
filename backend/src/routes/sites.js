import express from 'express';
import { get, run } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Register a new site
router.post('/register', async (req, res) => {
  const { name, location, controllerPhone, controllerName } = req.body;

  if (!name || !controllerPhone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const siteId = uuidv4();
  const ussdCode = uuidv4().slice(0, 8);

  try {
    await run(
      `INSERT INTO sites (id, name, location, controller_phone, controller_name, ussd_code)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [siteId, name, location, controllerPhone, controllerName, ussdCode]
    );

    res.json({
      success: true,
      message: 'Site registered successfully',
      siteId,
      ussdCode,
      ussdNumber: `*483*${ussdCode}#`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register site' });
  }
});

// Get site details
router.get('/:siteId', async (req, res) => {
  try {
    const site = await get('SELECT * FROM sites WHERE id = ?', [req.params.siteId]);

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

export default router;