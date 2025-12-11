const express = require('express');
const { isAdminOrSuperuser, isSuperuser } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

// List users (admin or superuser)
router.get('/users', isAdminOrSuperuser, async (req, res) => {
  const users = await User.find({}, '_id name email role requiresPasswordChange username');
  res.json(users);
});

// Superuser creates user (optional duplicate of /auth/super/create-user)
router.post('/users', isAdminOrSuperuser, async (req, res) => {
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

    res.status(201).json({
      message: 'User created',
      credentials: { email: user.email, username: user.username, tempPassword, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;