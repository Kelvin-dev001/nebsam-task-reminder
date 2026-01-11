const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Task = require('../models/Task');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');
const { sendSms } = require('../utils/sms');

// Public submit -> POST /complaints
router.post('/', async (req, res) => {
  try {
    const { customerName, plateOrCompany, mobile, service, issue } = req.body;
    if (!plateOrCompany || !mobile || !service || !issue) {
      return res.status(400).json({ error: 'plateOrCompany, mobile, service, issue are required' });
    }
    const c = await Complaint.create({ customerName, plateOrCompany, mobile, service, issue });
    await sendSms(mobile, 'Thank you for your feedback. Your complaint has been received and is being processed. We will update you once it is sorted.');
    res.status(201).json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Superuser list -> GET /complaints
router.get('/', isAuthenticated, isSuperuser, async (_req, res) => {
  try {
    const list = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Superuser assign -> POST /complaints/:id/assign
router.post('/:id/assign', isAuthenticated, isSuperuser, async (req, res) => {
  try {
    const { title, description, department, assignedTo, deadline, status = 'pending' } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const task = await Task.create({
      title: title || `Complaint: ${complaint.plateOrCompany}`,
      description: description || complaint.issue,
      department,
      assignedTo,
      deadline,
      status,
      complaintId: complaint._id
    });

    complaint.status = 'assigned';
    complaint.assignedTask = task._id;
    await complaint.save();

    res.json({ complaint, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;