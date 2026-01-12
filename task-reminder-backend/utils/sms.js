const axios = require('axios');

const {
  SMS_API_URL,    // e.g. https://api.onfonmedia.co.ke/v1/sms/SendBulkSMS
  SMS_CLIENT_ID,  // your Onfon client ID
  SMS_API_KEY,    // your Onfon API key
  SMS_ACCESS_KEY, // your Onfon access key/secret
  SMS_FROM,       // your sender ID/shortcode
} = process.env;

// Reuse the same MSISDN normaliser you used in authRoutes.js
function formatMsisdn(num) {
  if (!num) return '';
  let n = num.trim();
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('0')) n = '254' + n.slice(1);
  if (!n.startsWith('254')) n = '254' + n.replace(/^254/, '');
  return n;
}

exports.sendSms = async (to, message) => {
  if (!to || !message) {
    console.warn('sendSms called without to or message');
    return;
  }

  if (!SMS_API_URL || !SMS_API_KEY || !SMS_CLIENT_ID) {
    console.warn('SMS env not configured (SMS_API_URL / SMS_API_KEY / SMS_CLIENT_ID). Skipping SMS.');
    return;
  }

  const msisdn = formatMsisdn(to);

  try {
    const payload = {
      SenderId: SMS_FROM || 'NEBSAM',
      MessageParameters: [
        { Number: msisdn, Text: message }
      ],
      ApiKey: SMS_API_KEY,
      ClientId: SMS_CLIENT_ID
    };

    const headers = {
      Accesskey: SMS_ACCESS_KEY || SMS_CLIENT_ID,
      'Content-Type': 'application/json'
    };

    console.log('Sending SMS via Onfon:', { to: msisdn, textPreview: message.slice(0, 40) });

    const res = await axios.post(SMS_API_URL, payload, {
      headers,
      timeout: 10000,
    });

    console.log('Onfon SMS response:', res.data);

    // Adjust this success check to match actual Onfon docs / response
    return res.data;
  } catch (err) {
    console.error('Onfon SMS error:', err.response?.data || err.message || err);
    throw err; // Let callers optionally catch/log as well
  }
};