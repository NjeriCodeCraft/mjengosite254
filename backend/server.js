import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializeDatabase } from './src/models/database.js';
import ussdRoutes from './src/routes/ussd.js';
import siteRoutes from './src/routes/sites.js';
import workerRoutes from './src/routes/workers.js';
import attendanceRoutes from './src/routes/attendance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
initializeDatabase();

// Routes
app.use('/api/ussd', ussdRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MjengoSite Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MjengoSite Backend running on http://localhost:${PORT}`);
  console.log(`📱 USSD webhook ready at http://localhost:${PORT}/api/ussd/incoming`);
});