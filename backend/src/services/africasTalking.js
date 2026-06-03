import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AT_API_KEY = process.env.AT_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME || 'sandbox';
const AT_BASE_URL = 'https://api.sandbox.africastalking.com';

// Send SMS via Africa's Talking REST API
export async function sendSMS(phone, message) {
  try {
    const response = await axios.post(
      `${AT_BASE_URL}/version1/messaging`,
      {
        username: AT_USERNAME,
        message: message,
        recipients: [phone]
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': AT_API_KEY
        }
      }
    );

    console.log(`📱 SMS sent to ${phone}`);
    return response.data;
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    throw error;
  }
}

// Make voice call via Africa's Talking REST API
export async function makeVoiceCall(phone, message) {
  try {
    const response = await axios.post(
      `${AT_BASE_URL}/version1/voice/call`,
      {
        username: AT_USERNAME,
        recipients: [phone]
      },
      {
        headers: {
          'Accept': 'application/json',
          'apiKey': AT_API_KEY
        }
      }
    );

    console.log(`📞 Voice call to ${phone}`);
    return response.data;
  } catch (error) {
    console.error('❌ Voice call error:', error.message);
    throw error;
  }
}

export default {
  sendSMS,
  makeVoiceCall
};