const express = require('express');
const router = express.Router();
const Showroom = require('../models/Showroom');
const { isAuthenticated, isAdminOrSuperuser } = require('../middleware/auth');

// List active showrooms (tracking)
router.get('/list', isAuthenticated, async (_req, res) => {
  try {
    const showrooms = await Showroom.find({ isActive: true }).sort({ name: 1 });
    res.json(showrooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;