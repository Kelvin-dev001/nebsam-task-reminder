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

// Basic E.164 check
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
 * STEP 1: Customer signup - start
 * POST /customer-auth/signup
 * body: { phone, name }
 */
router.post('/signup', async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });
    if (!isE164(phone)) {
      return res
        .status(400)
        .json({ error: 'Phone must be in E.164 format, e.g. +2547xxxxxxx' });
    }

    // Ensure a unique email for customers – you can generate a placeholder
    const placeholderEmail = `${phone.replace(/\W/g, '')}@customer.nebsam.local`;

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: name || phone,
        email: placeholderEmail,      // satisfies required+unique
        username: placeholderEmail,   // or some other unique username
        phone,
        password: await bcrypt.hash(Math.random().toString(36), 10), // temp random
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
    const { phone, otp, password } = req.body;
    if (!phone || !otp || !password) {
      return res
        .status(400)
        .json({ error: 'phone, otp and password are required' });
    }

    const user = await User.findOne({ phone, role: 'customer' });
    if (!user) return res.status(404).json({ error: 'User not found' });

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
 * STEP 3: Login with phone+password: send login OTP (2FA)
 * POST /customer-auth/login
 * body: { phone, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res
        .status(400)
        .json({ error: 'phone and password are required' });
    }

    const user = await User.findOne({ phone, role: 'customer' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isPhoneVerified) {
      return res.status(400).json({ error: 'Phone is not verified' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const otp = generateOtp();
    await setOtp(user, otp);
    await user.save();

    await sendSms(
      phone,
      `Your NEBSAM login code is: ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`
    );

    res.json({ message: 'Login OTP sent', requiresOtp: true });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ error: 'Failed to start login' });
  }
});

/**
 * STEP 4: Verify login OTP and set auth cookie (JWT)
 * POST /customer-auth/verify-login
 * body: { phone, otp }
 */
router.post('/verify-login', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'phone and otp are required' });
    }

    const user = await User.findOne({ phone, role: 'customer' });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.otpHash || !user.otpExpiresAt) {
      return res
        .status(400)
        .json({ error: 'No login OTP found. Please login again.' });
    }
    if (user.otpExpiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: 'OTP has expired. Please login again.' });
    }

    const ok = await bcrypt.compare(otp, user.otpHash);
    if (!ok) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    // Issue JWT and set in cookie. attachUser middleware should read it.
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
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
    console.error('Customer verify-login error:', err);
    res.status(500).json({ error: 'Failed to verify login' });
  }
});

module.exports = router;