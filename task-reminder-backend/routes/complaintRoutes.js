const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Task = require('../models/Task');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');
const { sendSms } = require('../utils/sms');

// Fully protected: all complaint submissions require authentication
// and are linked to the logged-in user.

// Authenticated submit -> POST /complaints
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { customerName, plateOrCompany, mobile, service, issue } = req.body;

    if (!plateOrCompany || !mobile || !service || !issue) {
      return res.status(400).json({
        error: 'plateOrCompany, mobile, service and issue are required',
      });
    }

    const complaint = await Complaint.create({
      customerName: customerName || req.user.name || '',
      plateOrCompany,
      mobile,
      service,
      issue,
      status: 'new',
      userId: req.user._id, // link to logged-in customer/user
    });

    // SMS on complaint creation
    try {
      await sendSms(
        mobile,
        'Thank you for your feedback. Your complaint has been received and is being processed. We will update you once it is sorted.'
      );
    } catch (smsErr) {
      console.error(
        'Complaint create SMS error:',
        smsErr.response?.data || smsErr.message || smsErr
      );
      // do not fail the request because of SMS
    }

    res.status(201).json(complaint);
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
    const {
      title,
      description,
      department,
      assignedTo,
      deadline,
      status = 'pending',
    } = req.body;
    if (!department || !assignedTo) {
      return res
        .status(400)
        .json({ error: 'department and assignedTo are required' });
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
      complaintId: complaint._id,
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

// Superuser resolve -> POST /complaints/:id/resolve
router.post('/:id/resolve', isAuthenticated, isSuperuser, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.status = 'resolved';
    await complaint.save();

    // SMS on complaint resolution
    if (complaint.mobile) {
      try {
        await sendSms(
          complaint.mobile,
          'Your NEBSAM complaint has been resolved. Thank you for your patience.'
        );
      } catch (smsErr) {
        console.error(
          'Complaint resolve SMS error:',
          smsErr.response?.data || smsErr.message || smsErr
        );
        // do not fail the request because of SMS
      }
    }

    res.json({ complaint });
  } catch (err) {
    console.error('Resolve complaint error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;