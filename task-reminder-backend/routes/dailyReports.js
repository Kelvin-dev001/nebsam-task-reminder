const express = require('express');
const router = express.Router();
const DailyDepartmentReport = require('../models/DailyDepartmentReport');
const Department = require('../models/Department');
const Showroom = require('../models/Showroom');
const { isAuthenticated } = require('../middleware/auth');

function normalizeDate(d) {
  const dt = new Date(d);
  dt.setUTCHours(0,0,0,0);
  return dt;
}

router.post('/reports', isAuthenticated, async (req, res) => {
  try {
    const { reportDate, departmentId, showroomId, metrics, notes, revenue } = req.body;
    const date = normalizeDate(reportDate);
    // Basic validation
    if (!reportDate || !departmentId) return res.status(400).json({ error: 'reportDate and departmentId are required' });

    // Ensure department exists
    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ error: 'Department not found' });

    // If Tracking, showroom is required and must belong to Tracking
    if (dept.code === 'TRACK') {
      if (!showroomId) return res.status(400).json({ error: 'showroomId required for Tracking' });
      const showroom = await Showroom.findById(showroomId);
      if (!showroom) return res.status(404).json({ error: 'Showroom not found' });
    }

    // Build update doc per department code
    const update = {
      reportDate: date,
      departmentId,
      showroomId: showroomId || null,
      submittedBy: req.user._id,
      notes: notes || '',
      revenue: revenue || { currency: 'KES', amount: 0 },
      tracking: undefined,
      speedGovernor: undefined,
      radio: undefined,
      fuel: undefined,
      vehicleTelematics: undefined,
      online: undefined,
    };
    switch (dept.code) {
      case 'TRACK':
        update.tracking = metrics || {};
        break;
      case 'GOV':
        update.speedGovernor = metrics || {};
        break;
      case 'RADIO':
        update.radio = metrics || {};
        break;
      case 'FUEL':
        update.fuel = metrics || {};
        break;
      case 'VTEL':
        update.vehicleTelematics = metrics || {};
        break;
      case 'ONLINE':
        update.online = metrics || {};
        break;
      default:
        return res.status(400).json({ error: 'Unsupported department code' });
    }

    const result = await DailyDepartmentReport.findOneAndUpdate(
      { reportDate: date, departmentId, showroomId: showroomId || null },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(result);
  } catch (err) {
    console.error('Upsert report error', err);
    res.status(500).json({ error: err.message || 'Failed to upsert report' });
  }
});