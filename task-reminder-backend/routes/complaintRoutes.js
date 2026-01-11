const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Task = require('../models/Task');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');
const { sendSms } = require('../utils/sms');

const complaintsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

const isPhoneValid = (p) => {
  if (!p) return false;
  const trimmed = p.trim();
  return /^(\+?[1-9]\d{7,14})$/.test(trimmed); // E.164-ish, length 8-15
};

// Public submit -> POST /complaints
router.post('/', complaintsLimiter, async (req, res) => {
  try {
    const { customerName, plateOrCompany, mobile, service, issue } = req.body;
    if (!plateOrCompany || !mobile || !service || !issue) {
      return res.status(400).json({ error: 'plateOrCompany, mobile, service, issue are required' });
    }
    if (!isPhoneValid(mobile)) {
      return res.status(400).json({ error: 'Invalid phone format (use E.164, e.g., +15551234567)' });
    }
    const c = await Complaint.create({ customerName, plateOrCompany, mobile: mobile.trim(), service, issue });
    await sendSms(mobile.trim(), 'Thank you for your feedback. Your complaint has been received and is being processed. We will update you once it is sorted.');
    res.status(201).json(c);
  } catch (err) {
    console.error('Complaint submit error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// Superuser list -> GET /complaints
router.get('/', isAuthenticated, isSuperuser, async (_req, res) => {
  try {
    const list = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('Complaint list error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// Superuser assign -> POST /complaints/:id/assign
router.post('/:id/assign', isAuthenticated, isSuperuser, async (req, res) => {
  try {
    const { title, description, department, assignedTo, deadline, status = 'pending' } = req.body;
    if (!department || !assignedTo) {
      return res.status(400).json({ error: 'department and assignedTo are required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const task = await Task.create({
      title: title || `Complaint: ${complaint.plateOrCompany}`,
      description: description || complaint.issue,
      department,
      assignedTo,
      assignedBy: req.user._id,
      deadline,
      status,
      complaintId: complaint._id
    });

    complaint.status = 'assigned';
    complaint.assignedTask = task._id;
    await complaint.save();

    res.json({ complaint, task });
  } catch (err) {
    console.error('Assign complaint error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;