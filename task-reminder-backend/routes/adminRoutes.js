const express = require('express');
const { isAdminOrSuperuser, isSuperuser } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

// List users (admin or superuser)
router.get('/users', isAdminOrSuperuser, async (_req, res) => {
  const users = await User.find({}, '_id name email role requiresPasswordChange username');
  res.json(users);
});

// Create users — superuser only
router.post('/users', isSuperuser, async (req, res) => {
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

// Update user (name/role/email) — superuser only
router.patch('/users/:id', isSuperuser, async (req, res) => {
  const { name, email, role } = req.body;
  if (role && !['user', 'admin', 'superuser'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, select: '_id name email role requiresPasswordChange username' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user — superuser only
router.delete('/users/:id', isSuperuser, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;