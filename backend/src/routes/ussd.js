import express from 'express';
import { handleUSSD } from '../controllers/ussdController.js';

const router = express.Router();

// Africa's Talking sends USSD requests to this endpoint
router.post('/incoming', handleUSSD);

// Health check for USSD service
router.get('/health', (req, res) => {
  res.json({ status: 'USSD service is running' });
});

export default router;