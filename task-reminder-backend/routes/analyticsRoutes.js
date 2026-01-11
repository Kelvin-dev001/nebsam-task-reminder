const express = require('express');
const router = express.Router();
const DailyDepartmentReport = require('../models/DailyDepartmentReport');
const Department = require('../models/Department');
const Showroom = require('../models/Showroom');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

function normalizeDate(d) { const dt = new Date(d); dt.setUTCHours(0,0,0,0); return dt; }

// Helper to sum all numeric leaf fields in a subdocument
const sumAll = (...paths) => ({
  $add: paths.map(p => ({ $ifNull: [p, 0] }))
});

// Daily rollup (no revenue)
router.get('/daily', isAuthenticated, isSuperuser, async (req, res) => {
  const { startDate, endDate, departmentId, showroomId } = req.query;
  const match = {};
  if (startDate) match.reportDate = { $gte: normalizeDate(startDate) };
  if (endDate) match.reportDate = { ...(match.reportDate || {}), $lte: normalizeDate(endDate) };
  if (departmentId) match.departmentId = departmentId;
  if (showroomId) match.showroomId = showroomId;

  try {
    const data = await DailyDepartmentReport.aggregate([
      { $match: match },
      {
        $facet: {
          byDate: [
            { $group: {
              _id: "$reportDate",
              reports: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
          ],
          byDept: [
            { $group: {
              _id: "$departmentId",
              reports: { $sum: 1 }
            }}
          ],
          total: [
            { $group: { _id: null, reports: { $sum: 1 } } }
          ]
        }
      }
    ]);
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trends (this sums all relevant numeric fields as "sales" proxy)
router.get('/trends', isAuthenticated, isSuperuser, async (req, res) => {
  const { departmentId, showroomId } = req.query;
  const today = new Date(); today.setUTCHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setUTCDate(today.getUTCDate() - 1);
  const lastWeekStart = new Date(today); lastWeekStart.setUTCDate(today.getUTCDate() - 7);

  const baseMatch = {};
  if (departmentId) baseMatch.departmentId = departmentId;
  if (showroomId) baseMatch.showroomId = showroomId;

  const salesExpr = sumAll(
    // Tracking
    "$tracking.tracker1Install", "$tracking.tracker1Renewal",
    "$tracking.tracker2Install", "$tracking.tracker2Renewal",
    "$tracking.magneticInstall", "$tracking.magneticRenewal",
    "$tracking.offlineVehicles",
    // Governors (office/agent installs/renewals + offline + checkups)
    "$speedGovernor.nebsam.officeInstall", "$speedGovernor.nebsam.agentInstall",
    "$speedGovernor.nebsam.officeRenewal", "$speedGovernor.nebsam.agentRenewal",
    "$speedGovernor.nebsam.offline", "$speedGovernor.nebsam.checkups",
    "$speedGovernor.mockMombasa.officeInstall", "$speedGovernor.mockMombasa.agentInstall",
    "$speedGovernor.mockMombasa.officeRenewal", "$speedGovernor.mockMombasa.agentRenewal",
    "$speedGovernor.mockMombasa.offline", "$speedGovernor.mockMombasa.checkups",
    "$speedGovernor.sinotrack.officeInstall", "$speedGovernor.sinotrack.agentInstall",
    "$speedGovernor.sinotrack.officeRenewal", "$speedGovernor.sinotrack.agentRenewal",
    "$speedGovernor.sinotrack.offline", "$speedGovernor.sinotrack.checkups",
    // Radio
    "$radio.officeSale", "$radio.agentSale",
    "$radio.officeRenewal", "$radio.agentRenewal",
    // Fuel
    "$fuel.officeInstall", "$fuel.agentInstall",
    "$fuel.officeRenewal", "$fuel.agentRenewal",
    "$fuel.offline", "$fuel.checkups",
    // Vehicle Telematics
    "$vehicleTelematics.officeInstall", "$vehicleTelematics.agentInstall",
    "$vehicleTelematics.officeRenewal", "$vehicleTelematics.agentRenewal",
    "$vehicleTelematics.offline", "$vehicleTelematics.checkups",
    // Online installs/renewals
    "$online.installs.bluetooth", "$online.installs.hybrid",
    "$online.installs.comprehensive", "$online.installs.hybridAlarm",
    "$online.renewals.bluetooth", "$online.renewals.hybrid",
    "$online.renewals.comprehensive", "$online.renewals.hybridAlarm"
  );

  const agg = await DailyDepartmentReport.aggregate([
    { $match: { ...baseMatch, reportDate: { $gte: lastWeekStart, $lte: today } } },
    { $project: { reportDate: 1, sales: salesExpr } },
    { $group: { _id: "$reportDate", sales: { $sum: "$sales" } } },
    { $sort: { _id: 1 } }
  ]);

  const map = new Map(agg.map(a => [a._id.toISOString(), a.sales]));
  const todaySales = map.get(today.toISOString()) || 0;
  const yestSales = map.get(yesterday.toISOString()) || 0;

  const lastWeekSeries = agg.filter(a => a._id >= lastWeekStart && a._id < today).map(a => a.sales);
  const lastWeekAvg = lastWeekSeries.length ? (lastWeekSeries.reduce((s,x)=>s+x,0) / lastWeekSeries.length) : 0;

  const pctVsYesterday = yestSales ? ((todaySales - yestSales) / yestSales) * 100 : null;
  const pctVsLastWeek = lastWeekAvg ? ((todaySales - lastWeekAvg) / lastWeekAvg) * 100 : null;

  res.json({
    todaySales,
    yesterdaySales: yestSales,
    pctVsYesterday,
    pctVsLastWeek,
    series: agg // {_id: date, sales}
  });
});

// Submission status (unchanged)
router.get('/submission-status', isAuthenticated, isSuperuser, async (req, res) => {
  const { date } = req.query;
  const day = new Date(date || new Date()); day.setUTCHours(0,0,0,0);

  const [deptCount, trackingShowrooms] = await Promise.all([
    Department.countDocuments({}),
    Showroom.countDocuments({ isActive: true })
  ]);

  const expected = deptCount - 1 + trackingShowrooms; // Tracking counted per showroom
  const reports = await DailyDepartmentReport.countDocuments({ reportDate: day });

  res.json({ date: day, expected, submitted: reports, completion: expected ? reports / expected : 0 });
});

module.exports = router;