const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Onfon SMS env vars
const SMS_API_URL = process.env.SMS_API_URL || 'https://api.onfonmedia.co.ke/v1/sms/SendBulkSMS';
const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_CLIENT_ID = process.env.SMS_CLIENT_ID;
const SMS_ACCESS_KEY = process.env.SMS_ACCESS_KEY;
const SMS_FROM = process.env.SMS_FROM || 'NEBSAM';

// Ensure MSISDN format 254XXXXXXXXX
function formatMsisdn(num) {
  if (!num) return '';
  let n = num.trim();
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('0')) n = '254' + n.slice(1);
  if (!n.startsWith('254')) n = '254' + n.replace(/^254/, '');
  return n;
}

async function sendOtpSms({ to, code }) {
  if (!SMS_API_URL || !SMS_API_KEY || !SMS_CLIENT_ID) {
    console.warn('SMS not configured; skipping OTP send.');
    return;
  }
  const msisdn = formatMsisdn(to);
  const payload = {
    SenderId: SMS_FROM || 'NEBSAM',
    MessageParameters: [
      { Number: msisdn, Text: `Your NEBSAM OTP is ${code}. Expires in 15 minutes.` }
    ],
    ApiKey: SMS_API_KEY,
    ClientId: SMS_CLIENT_ID
  };
  const headers = {
    Accesskey: SMS_ACCESS_KEY || SMS_CLIENT_ID,
    'Content-Type': 'application/json'
  };
  await axios.post(SMS_API_URL, payload, { headers });
}

function signUser(user) {
  return jwt.sign(
    { _id: user._id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// --- USER/ADMIN/SUPERUSER LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // password field can be the OTP
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signUser(user);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        requiresPasswordChange: user.requiresPasswordChange
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- CHANGE PASSWORD (authenticated) ---
router.post('/change-password', isAuthenticated, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old password and new password are required' });
  }

  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          password: hashed,
          requiresPasswordChange: false,
          otpHash: undefined,
          otpExpiresAt: undefined,
          otpAttempts: 0
        }
      },
      { runValidators: false }
    );

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: err.message || 'Password change failed' });
  }
});

// --- SUPERUSER: CREATE USER WITH ROLE + SMS OTP ---
router.post('/super/create-user', isAuthenticated, isSuperuser, async (req, res) => {
  const { name, email, phone, role = 'user' } = req.body;
  if (!['user', 'admin', 'superuser'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (!phone) {
    return res.status(400).json({ error: 'Phone is required for SMS OTP' });
  }
  try {
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const username = email.split('@')[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await User.create({
      name,
      email,
      phone,
      username,
      password: hashedOtp, // OTP is the temp password
      role,
      requiresPasswordChange: true,
      otpHash: hashedOtp,
      otpExpiresAt: expires,
      otpAttempts: 0
    });

    // Best effort SMS
    try {
      await sendOtpSms({ to: phone, code: otp });
    } catch (smsErr) {
      console.error('Failed to send OTP SMS:', smsErr?.response?.data || smsErr.message || smsErr);
    }

    res.status(201).json({
      message: 'User created; OTP sent via SMS (if configured)',
      credentials: { email: user.email, username: user.username, role: user.role },
      otpSent: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// --- FORGOT PASSWORD (send OTP via SMS) ---
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username is required' });

  try {
    const user = await User.findOne({ $or: [{ email: username }, { username }] });
    // Always return 200 even if not found, to avoid user enumeration
    if (!user) return res.json({ message: 'If the account exists, an OTP has been sent.' });

    if (!user.phone) {
      return res.status(400).json({ error: 'No phone number on file for this account.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await User.updateOne(
      { _id: user._id },
      { $set: { otpHash: hashedOtp, otpExpiresAt: expires, otpAttempts: 0 } }
    );

    try {
      await sendOtpSms({ to: user.phone, code: otp });
    } catch (smsErr) {
      console.error('Failed to send OTP SMS:', smsErr?.response?.data || smsErr.message || smsErr);
    }

    res.json({ message: 'If the account exists, an OTP has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process forgot-password' });
  }
});

// --- RESET PASSWORD WITH OTP ---
router.post('/reset-password', async (req, res) => {
  const { username, otp, newPassword } = req.body;
  if (!username || !otp || !newPassword) {
    return res.status(400).json({ error: 'username, otp, and newPassword are required' });
  }

  try {
    const user = await User.findOne({ $or: [{ email: username }, { username }] }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid OTP or expired' });

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(401).json({ error: 'Invalid OTP or expired' });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(401).json({ error: 'OTP expired' });
    }

    const attempts = user.otpAttempts || 0;
    if (attempts >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Request a new OTP.' });
    }

    const ok = await bcrypt.compare(otp, user.otpHash);
    if (!ok) {
      await User.updateOne({ _id: user._id }, { $inc: { otpAttempts: 1 } });
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashed,
          requiresPasswordChange: false,
        },
        $unset: {
          otpHash: '',
          otpExpiresAt: '',
          otpAttempts: ''
        }
      },
      { runValidators: false }
    );

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// --- LOGOUT (stateless JWT) ---
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out (client must delete token)' });
});

// --- SESSION CHECK ---
router.get('/session', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ user: null });
  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ user: null });
  }
});

module.exports = router;