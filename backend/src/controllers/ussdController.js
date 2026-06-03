import { get, run } from '../models/database.js';
import { v4 as uuidv4 } from 'uuid';
import { sendSMS } from '../services/africasTalking.js';

const sessions = {};

export async function handleUSSD(req, res) {
  const { phoneNumber, text, sessionId } = req.body;

  console.log(`📲 USSD from ${phoneNumber}: "${text}"`);

  // Split cumulative text and get latest input
  const parts = text.split('*');
  const currentInput = parts[parts.length - 1].trim();
  const level = parts.length; // 1="", 2="1", 3="1*name", etc.

  let response = '';

  try {
    // Level 1: First dial - show main menu
    if (text === '') {
      response = 'CON Welcome to MjengoSite 👷\n1. Check in\n2. Report incident\n3. Check out\n4. My hours';
    }

    // ─── CHECK IN FLOW ───
    else if (text === '1') {
      response = 'CON Enter your name:';
    }
    else if (parts[0] === '1' && level === 2) {
      // Got name
      response = 'CON Enter site name:';
    }
    else if (parts[0] === '1' && level === 3) {
      // Got site name
      response = 'CON Enter foreman name:';
    }
    else if (parts[0] === '1' && level === 4) {
      // Got foreman name - perform check-in
      const workerName = parts[1].trim();
      const siteName = parts[2].trim();
      const foremanName = parts[3].trim();

      const site = await get(
        'SELECT * FROM sites WHERE name = ? AND controller_name = ?',
        [siteName, foremanName]
      );

      if (!site) {
        response = `END ❌ Site not found.\nSite: ${siteName}\nForeman: ${foremanName}\nContact supervisor.`;
      } else {
        let worker = await get(
          'SELECT * FROM workers WHERE phone = ? AND site_id = ?',
          [phoneNumber, site.id]
        );

        if (!worker) {
          const workerId = uuidv4();
          await run(
            `INSERT INTO workers (id, site_id, name, phone, created_at) VALUES (?, ?, ?, ?, ?)`,
            [workerId, site.id, workerName, phoneNumber, new Date().toISOString()]
          );
          worker = { id: workerId, name: workerName };
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        await run(
          `INSERT INTO attendance (id, worker_id, site_id, check_in_time, date) VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), worker.id, site.id, now.toISOString(), now.toISOString().split('T')[0]]
        );

        try {
          await sendSMS(phoneNumber, `✅ Checked in at ${timeStr}\n${siteName} Site\nWelcome ${workerName}! 🤝 MjengoSite`);
        } catch (err) {
          console.log('⚠️ SMS not sent but check-in recorded');
        }

        response = `END ✅ Checked in!\nSite: ${siteName}\nTime: ${timeStr}\nKazi nzuri! 💪`;
      }
    }

    // ─── REPORT INCIDENT FLOW ───
    else if (text === '2') {
      response = 'CON Report type:\n1. Accident\n2. General\n3. Tool';
    }
    else if (parts[0] === '2' && level === 2) {
      response = 'CON Describe the incident:';
    }
    else if (parts[0] === '2' && level === 3) {
      const typeMap = { '1': 'accident', '2': 'general', '3': 'tool' };
      const incidentType = typeMap[parts[1]] || 'general';
      const description = parts[2].trim();

      const worker = await get('SELECT * FROM workers WHERE phone = ?', [phoneNumber]);
      const siteId = worker?.site_id || 'UNKNOWN';

      await run(
        `INSERT INTO incidents (id, worker_id, site_id, incident_type, description) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), worker?.id || null, siteId, incidentType, description]
      );

      try {
        await sendSMS(phoneNumber, `🚨 Incident reported: ${description}\nSupervisor notified. MjengoSite`);
      } catch (err) {
        console.log('⚠️ Alert SMS not sent but incident recorded');
      }

      response = 'END ✅ Incident reported!\nSupervisor notified.';
    }

    // ─── CHECK OUT FLOW ───
    else if (text === '3') {
      response = 'CON Enter your name to check out:';
    }
    else if (parts[0] === '3' && level === 2) {
      const attendance = await get(
        `SELECT a.* FROM attendance a
         JOIN workers w ON a.worker_id = w.id
         WHERE w.phone = ? AND a.check_out_time IS NULL
         ORDER BY a.check_in_time DESC LIMIT 1`,
        [phoneNumber]
      );

      if (!attendance) {
        response = 'END ❌ No check-in found.\nPlease check in first.';
      } else {
        const now = new Date();
        const hoursWorked = ((now - new Date(attendance.check_in_time)) / (1000 * 60 * 60)).toFixed(2);

        await run(
          `UPDATE attendance SET check_out_time = ?, hours_worked = ? WHERE id = ?`,
          [now.toISOString(), hoursWorked, attendance.id]
        );

        try {
          await sendSMS(phoneNumber, `✅ Checked out!\nHours: ${hoursWorked}\nAsante sana! 🙏 MjengoSite`);
        } catch (err) {
          console.log('⚠️ Checkout SMS not sent but recorded');
        }

        response = `END ✅ Checked out!\nHours: ${hoursWorked}\nAsante! 🙏`;
      }
    }

    // ─── MY HOURS ───
    else if (text === '4') {
      const result = await get(
        `SELECT SUM(hours_worked) as total FROM attendance
         WHERE worker_id IN (SELECT id FROM workers WHERE phone = ?)
         AND hours_worked IS NOT NULL`,
        [phoneNumber]
      );
      response = `END 📊 Total hours: ${(result?.total || 0).toFixed(2)} hrs`;
    }

    // Fallback
    else {
      response = 'CON Welcome to MjengoSite 👷\n1. Check in\n2. Report incident\n3. Check out\n4. My hours';
    }

    res.type('text/plain').send(response);

  } catch (error) {
    console.error('❌ USSD Error:', error);
    res.type('text/plain').send('END ❌ System error. Please try again.');
  }
}