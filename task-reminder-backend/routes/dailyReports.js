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
  'tracker1Install',
  'tracker1Renewal',
  'tracker2Install',
  'tracker2Renewal',
  'magneticInstall',
  'magneticRenewal',
];
const trackingTotalFields = ['offlineVehicles', 'expired', 'inactive'];

function hasAnyMetric(obj, fields) {
  return fields.some((f) => (obj?.[f] || 0) > 0);
}

/**
 * Create / update a daily report
 * POST /reports
 */
router.post('/reports', isAuthenticated, async (req, res) => {
  try {
    const { reportDate, departmentId, showroomId, metrics, notes } = req.body;
    const date = normalizeDate(reportDate);
    if (!reportDate || !departmentId) {
      return res
        .status(400)
        .json({ error: 'reportDate and departmentId are required' });
    }

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
          if (!showroomId) {
            return res
              .status(400)
              .json({ error: 'showroomId required for tracking installs/renewals' });
          }
          const showroom = await Showroom.findById(showroomId);
          if (!showroom) return res.status(404).json({ error: 'Showroom not found' });
          update.showroomId = showroomId;
        } else if (hasTotals) {
          // totals-only: allow global (null showroom)
          update.showroomId = showroomId || null;
        } else {
          // no metrics at all
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

/**
 * Get my reports with pagination and optional date filter
 * GET /reports/my?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&limit=10
 */
router.get('/reports/my', isAuthenticated, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * pageSize;

    const filter = { submittedBy: req.user._id };

    if (startDate || endDate) {
      filter.reportDate = {};
      if (startDate) {
        filter.reportDate.$gte = normalizeDate(startDate);
      }
      if (endDate) {
        filter.reportDate.$lte = normalizeDate(endDate);
      }
    }

    const [items, total] = await Promise.all([
      DailyDepartmentReport.find(filter)
        .sort({ reportDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('departmentId', 'name code')
        .populate('showroomId', 'name')
        .lean(),
      DailyDepartmentReport.countDocuments(filter),
    ]);

    res.json({ items, total });
  } catch (err) {
    console.error('Get my reports error', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * Cleanup seed data (sample reports)
 * DELETE /reports/cleanup-seed-data
 */
router.delete('/reports/cleanup-seed-data', isAuthenticated, async (req, res) => {
  try {
    // You can restrict this route to superuser/admin if you want.
    const result = await DailyDepartmentReport.deleteMany({ notes: /SAMPLE_DATA/ });
    res.json({ message: `Deleted ${result.deletedCount} seed reports.` });
  } catch (err) {
    console.error('Delete seed reports error', err);
    res.status(500).json({ error: 'Failed to delete seed reports' });
  }
});

module.exports = router;