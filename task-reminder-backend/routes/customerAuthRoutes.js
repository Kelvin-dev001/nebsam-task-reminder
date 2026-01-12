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
    // 07xxxxxxxx -> +2547xxxxxxxx
    return '+254' + p.slice(1);
  }

  if (p.startsWith('254')) {
    // 2547xxxxxxxx -> +2547xxxxxxxx
    return '+' + p;
  }

  if (p[0] === '7' && p.length === 9) {
    // 7xxxxxxxx -> +2547xxxxxxxx
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
 * STEP 1: Customer signup - start
 * POST /customer-auth/signup
 * body: { phone, name }
 */
router.post('/signup', async (req, res) => {
  try {
    let { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    phone = normalizePhone(phone);
    console.log('[CUSTOMER SIGNUP] normalized phone:', phone);

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
      console.log('[CUSTOMER SIGNUP] created new customer user with id:', user._id);
    } else if (user.role !== 'customer') {
      return res
        .status(400)
        .json({ error: 'This phone is already used by a staff account' });
    } else {
      console.log('[CUSTOMER SIGNUP] reusing existing customer user id:', user._id);
    }

    const otp = generateOtp();
    await setOtp(user, otp);
    await user.save();
    console.log('[CUSTOMER SIGNUP] OTP generated for user', user._id, 'expires at', user.otpExpiresAt);

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
    console.log('[CUSTOMER VERIFY SIGNUP] normalized phone:', phone);

    const user = await User.findOne({ phone, role: 'customer' });
    if (!user) {
      console.error('[CUSTOMER VERIFY SIGNUP] user not found for phone:', phone);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      console.error('[CUSTOMER VERIFY SIGNUP] no otpHash/otpExpiresAt for user', user._id);
      return res
        .status(400)
        .json({ error: 'No OTP found. Please start signup again.' });
    }
    if (user.otpExpiresAt < new Date()) {
      console.error('[CUSTOMER VERIFY SIGNUP] OTP expired for user', user._id);
      return res
        .status(400)
        .json({ error: 'OTP has expired. Please request a new one.' });
    }

    const ok = await bcrypt.compare(otp, user.otpHash);
    console.log('[CUSTOMER VERIFY SIGNUP] compare result for user', user._id, ':', ok);

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
    let { phone, password } = req.body;
    if (!phone || !password) {
      return res
        .status(400)
        .json({ error: 'phone and password are required' });
    }

    phone = normalizePhone(phone);
    console.log('[CUSTOMER LOGIN] normalized phone:', phone);

    const user = await User.findOne({ phone, role: 'customer' });
    if (!user) {
      console.error('[CUSTOMER LOGIN] user not found for phone:', phone);
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.isPhoneVerified) {
      return res.status(400).json({ error: 'Phone is not verified' });
    }

    const ok = await bcrypt.compare(password, user.password);
    console.log('[CUSTOMER LOGIN] password compare for user', user._id, ':', ok);

    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const otp = generateOtp();
    await setOtp(user, otp);
    await user.save();
    console.log('[CUSTOMER LOGIN] OTP generated for user', user._id, 'expires at', user.otpExpiresAt);

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
    let { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'phone and otp are required' });
    }

    phone = normalizePhone(phone);
    console.log('[CUSTOMER VERIFY LOGIN] normalized phone:', phone);

    const user = await User.findOne({ phone, role: 'customer' });
    if (!user) {
      console.error('[CUSTOMER VERIFY LOGIN] user not found for phone:', phone);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(
      '[CUSTOMER VERIFY LOGIN] user',
      user._id,
      'has otpHash?',
      !!user.otpHash,
      'expires:',
      user.otpExpiresAt,
      'attempts:',
      user.otpAttempts
    );

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
    console.log('[CUSTOMER VERIFY LOGIN] compare result for user', user._id, ':', ok);

    if (!ok) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('[CUSTOMER VERIFY LOGIN] JWT_SECRET is missing in environment');
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
    console.error('Customer verify-login error:', err);
    res.status(500).json({ error: 'Failed to verify login' });
  }
});

module.exports = router;