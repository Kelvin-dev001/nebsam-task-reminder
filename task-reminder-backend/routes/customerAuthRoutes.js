const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { sendSms } = require('../utils/sms');

const OTP_TTL_MINUTES = 10;
const OTP_LENGTH = 6;

function generateOtp() {
  return Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1)).toString();
}

function otpExpiry() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + OTP_TTL_MINUTES);
  return d;
}

// Normalize phone so DB always stores and queries +2547xxxxxxxx
function normalizePhone(phone) {
  if (!phone) return '';
  let p = phone.trim();

  if (p.startsWith('+')) return p;

  if (p.startsWith('0')) {
    return '+254' + p.slice(1);
  }

  if (p.startsWith('254')) {
    return '+' + p;
  }

  if (p[0] === '7' && p.length === 9) {
    return '+254' + p;
  }

  return p.startsWith('+') ? p : '+' + p;
}

// Basic E.164 check (after normalization)
function isE164(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

async function setOtp(user, otpPlain) {
  const hash = await bcrypt.hash(otpPlain, 10);
  user.otpHash = hash;
  user.otpExpiresAt = otpExpiry();
  user.otpAttempts = 0;
}

/**
 * STEP 1: Customer signup - start (OTP via SMS)
 * POST /customer-auth/signup
 * body: { phone, name }
 */
router.post('/signup', async (req, res) => {
  try {
    let { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    phone = normalizePhone(phone);
    if (!isE164(phone)) {
      return res
        .status(400)
        .json({ error: 'Phone must be in E.164 format, e.g. +2547XXXXXXX' });
    }

    const placeholderEmail = `${phone.replace(/\W/g, '')}@customer.nebsam.local`;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: name || phone,
        email: placeholderEmail,
        username: placeholderEmail,
        phone,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        role: 'customer',
        requiresPasswordChange: true,
        isPhoneVerified: false,
      });
    } else if (user.role !== 'customer') {
      return res
        .status(400)
        .json({ error: 'This phone is already used by a staff account' });
    }

    const otp = generateOtp();
    await setOtp(user, otp);
    await user.save();

    await sendSms(
      phone,
      `Your NEBSAM signup code is: ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`
    );

    res.json({ message: 'OTP sent for signup verification' });
  } catch (err) {
    console.error('Customer signup error:', err);
    res.status(500).json({ error: 'Failed to start signup' });
  }
});

/**
 * STEP 2: Verify phone & set password
 * POST /customer-auth/verify-signup
 * body: { phone, otp, password }
 */
router.post('/verify-signup', async (req, res) => {
  try {
    let { phone, otp, password } = req.body;
    if (!phone || !otp || !password) {
      return res
        .status(400)
        .json({ error: 'phone, otp and password are required' });
    }

    phone = normalizePhone(phone);

    const user = await User.findOne({ phone, role: 'customer' });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res
        .status(400)
        .json({ error: 'No OTP found. Please start signup again.' });
    }
    if (user.otpExpiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: 'OTP has expired. Please request a new one.' });
    }

    const ok = await bcrypt.compare(otp, user.otpHash);
    if (!ok) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    user.isPhoneVerified = true;
    user.requiresPasswordChange = false;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({
      message: 'Phone verified and password set. You can now log in.',
    });
  } catch (err) {
    console.error('Customer verify-signup error:', err);
    res.status(500).json({ error: 'Failed to verify signup' });
  }
});

/**
 * LOGIN (no OTP): phone + password => JWT cookie
 * POST /customer-auth/login
 * body: { phone, password }
 */
router.post('/login', async (req, res) => {
  try {
    let { phone, password } = req.body;
    if (!phone || !password) {
      return res
        .status(400)
        .json({ error: 'phone and password are required' });
    }

    phone = normalizePhone(phone);

    const user = await User.findOne({ phone, role: 'customer' }).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.isPhoneVerified) {
      return res.status(400).json({ error: 'Phone is not verified' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('[CUSTOMER LOGIN] JWT_SECRET is missing in environment');
      return res.status(500).json({ error: 'Server configuration error (JWT secret missing)' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .json({
        message: 'Login successful',
        user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
      });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * FORGOT PASSWORD (send OTP via SMS)
 * POST /customer-auth/forgot-password
 * body: { phone }
 */
router.post('/forgot-password', async (req, res) => {
  try {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    phone = normalizePhone(phone);

    const user = await User.findOne({ phone, role: 'customer' }).select('+otpHash +otpExpiresAt +otpAttempts');
    // Always 200 to avoid enumeration
    if (!user) return res.json({ message: 'If the account exists, an OTP has been sent.' });

    const otp = generateOtp();
    await setOtp(user, otp);
    await user.save();

    await sendSms(
      phone,
      `Your NEBSAM password reset code is: ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`
    );

    res.json({ message: 'If the account exists, an OTP has been sent.' });
  } catch (err) {
    console.error('Customer forgot-password error:', err);
    res.status(500).json({ error: 'Failed to process forgot-password' });
  }
});

/**
 * RESET PASSWORD WITH OTP
 * POST /customer-auth/reset-password
 * body: { phone, otp, newPassword }
 */
router.post('/reset-password', async (req, res) => {
  try {
    let { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ error: 'phone, otp, and newPassword are required' });
    }

    phone = normalizePhone(phone);

    const user = await User.findOne({ phone, role: 'customer' }).select('+otpHash +otpExpiresAt +otpAttempts +password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    const ok = await bcrypt.compare(otp, user.otpHash);
    if (!ok) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.requiresPasswordChange = false;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('Customer reset-password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;