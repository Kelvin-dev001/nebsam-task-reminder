const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function signUser(user) {
  return jwt.sign(
    { _id: user._id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// --- USER/ADMIN/SUPERUSER LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
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
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Old password incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.requiresPasswordChange = false;
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Password change failed' });
  }
});

// --- SUPERUSER: CREATE USER WITH ROLE ---
router.post('/super/create-user', isAuthenticated, isSuperuser, async (req, res) => {
  const { name, email, role = 'user' } = req.body;
  if (!['user', 'admin', 'superuser'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const username = email.split('@')[0];
    const tempPassword = Math.random().toString(36).slice(-10);

    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      role,
      requiresPasswordChange: true
    });

    // TODO: send tempPassword via email using a mailer service (recommended)
    res.status(201).json({
      message: 'User created',
      credentials: { email: user.email, username: user.username, tempPassword, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// --- LOGOUT (stateless JWT) ---
router.post('/logout', (req, res) => {
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