const axios = require('axios');

const {
  SMS_API_URL,    // e.g. https://api.onfonmedia.com/v1/sms/submit
  SMS_CLIENT_ID,  // your Onfon client ID
  SMS_API_KEY,    // your Onfon API key
  SMS_ACCESS_KEY, // your Onfon access key/secret
  SMS_FROM,       // your sender ID/shortcode
} = process.env;

exports.sendSms = async (to, message) => {
  if (!to || !message) return;
  try {
    // Adjust field names to match Onfon’s spec if different
    const payload = {
      client_id: SMS_CLIENT_ID,
      api_key: SMS_API_KEY,
      access_key: SMS_ACCESS_KEY,
      from: SMS_FROM,
      to,
      text: message,
    };

    // If Onfon needs form-encoded instead of JSON:
    // const qs = require('qs');
    // const res = await axios.post(SMS_API_URL, qs.stringify(payload), {
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   timeout: 10000,
    // });

    const res = await axios.post(SMS_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    // Adjust success check to the exact response Onfon returns
    if (res.data?.status && res.data.status.toLowerCase() !== 'success') {
      console.error('Onfon SMS not sent:', res.data);
    }
    return res.data;
  } catch (err) {
    console.error('Onfon SMS error:', err.response?.data || err.message);
  }
};