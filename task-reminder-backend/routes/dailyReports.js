const express = require('express');
const router = express.Router();
const DailyDepartmentReport = require('../models/DailyDepartmentReport');
const Department = require('../models/Department');
const Showroom = require('../models/Showroom');
const { isAuthenticated } = require('../middleware/auth');

function normalizeDate(d) {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}

// Helpers to detect tracking metric types
const trackingInstallFields = [
  'tracker1Install', 'tracker1Renewal',
  'tracker2Install', 'tracker2Renewal',
  'magneticInstall', 'magneticRenewal',
];
const trackingTotalFields = ['offlineVehicles', 'expired', 'inactive'];

function hasAnyMetric(obj, fields) {
  return fields.some(f => (obj?.[f] || 0) > 0);
}

router.post('/reports', isAuthenticated, async (req, res) => {
  try {
    const { reportDate, departmentId, showroomId, metrics, notes } = req.body;
    const date = normalizeDate(reportDate);
    if (!reportDate || !departmentId) return res.status(400).json({ error: 'reportDate and departmentId are required' });

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ error: 'Department not found' });

    const update = {
      reportDate: date,
      departmentId,
      showroomId: showroomId || null,
      submittedBy: req.user._id,
      notes: notes || '',
      tracking: undefined,
      speedGovernor: undefined,
      radio: undefined,
      fuel: undefined,
      vehicleTelematics: undefined,
      online: undefined,
    };

    switch (dept.code) {
      case 'TRACK': {
        const m = metrics || {};
        const hasInstalls = hasAnyMetric(m, trackingInstallFields);
        const hasTotals = hasAnyMetric(m, trackingTotalFields);

        if (hasInstalls) {
          if (!showroomId) return res.status(400).json({ error: 'showroomId required for tracking installs/renewals' });
          const showroom = await Showroom.findById(showroomId);
          if (!showroom) return res.status(404).json({ error: 'Showroom not found' });
          update.showroomId = showroomId;
        } else {
          // totals-only: allow global (null showroom)
          update.showroomId = showroomId || null;
        }

        update.tracking = m || {};
        break;
      }
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
      { reportDate: date, departmentId, showroomId: update.showroomId || null },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(result);
  } catch (err) {
    console.error('Upsert report error', err);
    res.status(500).json({ error: err.message || 'Failed to upsert report' });
  }
});

module.exports = router;