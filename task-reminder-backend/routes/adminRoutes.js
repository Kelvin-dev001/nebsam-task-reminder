const express = require('express');
const { isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Use isAdmin for admin-only routes
router.get('/users', isAdmin, async (req, res) => {
  const users = await User.find({}, '_id name email role');
  res.json(users);
});

module.exports = router;