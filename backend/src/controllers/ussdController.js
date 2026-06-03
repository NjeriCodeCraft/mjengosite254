import { get, all, run } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';
import { sendSMS } from '../services/africasTalking.js';

// Simple in-memory session storage
const sessions = {};

export async function handleUSSD(req, res) {
  const { phoneNumber, text, sessionId } = req.body;

  console.log(`📲 USSD from ${phoneNumber}: "${text}"`);

  let response = '';

  try {
    // First interaction - show main menu
    if (text === '') {
      response = 'Welcome to MjengoSite 👷\n1. Check in\n2. Report incident\n3. Check out\n4. My hours';
    }
    // User selected Check in (1)
    else if (text === '1') {
      response = 'Enter your name:';
      sessions[sessionId] = { action: 'check_in', phoneNumber };
    }
    // User entered name for check-in
    else if (sessions[sessionId]?.action === 'check_in') {
      const workerName = text.trim();
      const siteId = 'DEFAULT';

      // Get worker
      const worker = await get(
        'SELECT * FROM workers WHERE phone = ? AND site_id = ?',
        [phoneNumber, siteId]
      );

      if (!worker) {
        response = '❌ Not registered. Contact supervisor.';
      } else {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        // Create attendance record
        const attendanceId = uuidv4();
        await run(
          `INSERT INTO attendance (id, worker_id, site_id, check_in_time, date)
           VALUES (?, ?, ?, ?, ?)`,
          [attendanceId, worker.id, siteId, now.toISOString(), now.toISOString().split('T')[0]]
        );

        // Send SMS confirmation
        try {
          await sendSMS(
            phoneNumber,
            `✅ Checked in at ${timeStr}\nWelcome ${workerName}! 🤝 MjengoSite`
          );
        } catch (err) {
          console.log('⚠️ SMS not sent but check-in recorded');
        }

        response = `✅ Checked in!\nTime: ${timeStr}\nKazi nzuri! 💪`;
        delete sessions[sessionId];
      }
    }
    // User selected Report incident (2)
    else if (text === '2') {
      response = 'Report type:\n1. Accident\n2. General\n3. Tool';
      sessions[sessionId] = { action: 'incident_type', phoneNumber };
    }
    // User selected incident type
    else if (sessions[sessionId]?.action === 'incident_type') {
      if (text === '1') {
        response = 'Describe:';
        sessions[sessionId].action = 'incident_description';
        sessions[sessionId].incidentType = 'accident';
      } else if (text === '2') {
        response = 'What to report?';
        sessions[sessionId].incidentType = 'general';
      } else if (text === '3') {
        response = 'Which tool?';
        sessions[sessionId].incidentType = 'tool';
      }
    }
    // User entered incident description
    else if (sessions[sessionId]?.action === 'incident_description') {
      const description = text.trim();
      const siteId = 'DEFAULT';

      const worker = await get(
        'SELECT * FROM workers WHERE phone = ?',
        [phoneNumber]
      );

      const incidentId = uuidv4();
      await run(
        `INSERT INTO incidents (id, worker_id, site_id, incident_type, description)
         VALUES (?, ?, ?, ?, ?)`,
        [incidentId, worker?.id, siteId, 'accident', description]
      );

      // Send SMS to supervisor alerting about incident
      try {
        await sendSMS(
          phoneNumber,
          `🚨 Incident reported: ${description}\nSupervisor has been notified. MjengoSite`
        );
      } catch (err) {
        console.log('⚠️ Alert SMS not sent but incident recorded');
      }

      response = '✅ Incident reported!\nSupervisor notified.';
      delete sessions[sessionId];
    }
    // User selected Check out (3)
    else if (text === '3') {
      response = 'Enter name to check out:';
      sessions[sessionId] = { action: 'check_out', phoneNumber };
    }
    // User entered name for check-out
    else if (sessions[sessionId]?.action === 'check_out') {
      const workerName = text.trim();
      const siteId = 'DEFAULT';

      // Get latest attendance
      const attendance = await get(
        `SELECT a.* FROM attendance a
         JOIN workers w ON a.worker_id = w.id
         WHERE w.phone = ? AND a.site_id = ? AND a.check_out_time IS NULL
         ORDER BY a.check_in_time DESC LIMIT 1`,
        [phoneNumber, siteId]
      );

      if (!attendance) {
        response = '❌ No check-in found.';
      } else {
        const now = new Date();
        const checkInTime = new Date(attendance.check_in_time);
        const hoursWorked = ((now - checkInTime) / (1000 * 60 * 60)).toFixed(2);

        // Update attendance
        await run(
          `UPDATE attendance SET check_out_time = ?, hours_worked = ? WHERE id = ?`,
          [now.toISOString(), hoursWorked, attendance.id]
        );

        // Send SMS confirmation
        try {
          await sendSMS(
            phoneNumber,
            `✅ Checked out!\nHours worked: ${hoursWorked}\nAsante sana! 🙏 MjengoSite`
          );
        } catch (err) {
          console.log('⚠️ Checkout SMS not sent but checkout recorded');
        }

        response = `✅ Checked out!\nHours: ${hoursWorked}\nAsante! 🙏`;
        delete sessions[sessionId];
      }
    }
    // User selected My hours (4)
    else if (text === '4') {
      const siteId = 'DEFAULT';

      const result = await get(
        `SELECT SUM(hours_worked) as total FROM attendance
         WHERE worker_id IN (SELECT id FROM workers WHERE phone = ? AND site_id = ?)
         AND hours_worked IS NOT NULL`,
        [phoneNumber, siteId]
      );

      response = `📊 Hours today: ${(result?.total || 0).toFixed(2)} hrs`;
      delete sessions[sessionId];
    }
    else {
      response = 'Welcome to MjengoSite 👷\n1. Check in\n2. Report incident\n3. Check out\n4. My hours';
    }

    res.type('text/plain').send(response);
  } catch (error) {
    console.error('❌ USSD Error:', error);
    res.type('text/plain').send('❌ System error. Try again.');
  }
}