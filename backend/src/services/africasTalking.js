import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

console.log('🔑 API KEY:', process.env.AT_API_KEY?.slice(0, 20))

const AT_API_KEY = process.env.AT_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME || 'sandbox';

export async function sendSMS(phone, message) {
  try {
    const body = new URLSearchParams()
    body.append('username', AT_USERNAME)
    body.append('to', phone)
    body.append('message', message)

    const response = await fetch(
      'https://api.sandbox.africastalking.com/version1/messaging',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': AT_API_KEY
        },
        body: body.toString()
      }
    )

    const text = await response.text()
    console.log('📨 AT raw response:', text)
    const data = JSON.parse(text)
    console.log(`📱 SMS sent to ${phone}:`, JSON.stringify(data))
    return data
  } catch (error) {
    console.error('❌ SMS error:', error.message)
    throw error
  }
}

export default { sendSMS }