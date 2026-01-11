const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

// Public submit (no auth) or require auth as you prefer; here we allow anyone
router.post('/complaints', async (req, res) => {
  try {
    const { customerName, plateOrCompany, mobile, service, issue } = req.body;
    if (!plateOrCompany || !mobile || !service || !issue) {
      return res.status(400).json({ error: 'plateOrCompany, mobile, service, issue are required' });
    }
    const c = await Complaint.create({ customerName, plateOrCompany, mobile, service, issue });
    res.status(201).json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Superuser list
router.get('/complaints', isAuthenticated, isSuperuser, async (_req, res) => {
  try {
    const list = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;