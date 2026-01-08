const express = require('express');
const router = express.Router();
const DailyDepartmentReport = require('../models/DailyDepartmentReport');
const Department = require('../models/Department');
const Showroom = require('../models/Showroom');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

function normalizeDate(d) { const dt = new Date(d); dt.setUTCHours(0,0,0,0); return dt; }

// Daily rollup
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
              tracking: { $sum: "$tracking.offlineVehicles" },
              revenue: { $sum: "$revenue.amount" },
              count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
          ],
          byDept: [
            { $group: {
              _id: "$departmentId",
              revenue: { $sum: "$revenue.amount" },
              reports: { $sum: 1 }
            }}
          ],
          total: [
            { $group: { _id: null, revenue: { $sum: "$revenue.amount" }, reports: { $sum: 1 } } }
          ]
        }
      }
    ]);
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trends (today/yesterday/last-week) and series
router.get('/trends', isAuthenticated, isSuperuser, async (req, res) => {
  const { departmentId, showroomId } = req.query;
  const today = new Date(); today.setUTCHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setUTCDate(today.getUTCDate() - 1);
  const lastWeekStart = new Date(today); lastWeekStart.setUTCDate(today.getUTCDate() - 7);

  const baseMatch = {};
  if (departmentId) baseMatch.departmentId = departmentId;
  if (showroomId) baseMatch.showroomId = showroomId;

  const projectSales = {
    reportDate: 1,
    sales: {
      $add: [
        { $ifNull: ["$tracking.tracker1Install", 0] },
        { $ifNull: ["$tracking.tracker1Renewal", 0] },
        { $ifNull: ["$tracking.tracker2Install", 0] },
        { $ifNull: ["$tracking.tracker2Renewal", 0] },
        { $ifNull: ["$tracking.magneticInstall", 0] },
        { $ifNull: ["$tracking.magneticRenewal", 0] },
        { $ifNull: ["$speedGovernor.mockMombasaInstall", 0] },
        { $ifNull: ["$speedGovernor.mockMombasaRenewal", 0] },
        { $ifNull: ["$speedGovernor.nebsamInstall", 0] },
        { $ifNull: ["$speedGovernor.nebsamRenewal", 0] },
        { $ifNull: ["$radio.unitSales", 0] },
        { $ifNull: ["$radio.renewals", 0] },
        { $ifNull: ["$fuel.installations", 0] },
        { $ifNull: ["$fuel.renewals", 0] },
        { $ifNull: ["$vehicleTelematics.installations", 0] },
        { $ifNull: ["$vehicleTelematics.renewals", 0] },
        { $ifNull: ["$online.dailySalesClosed", 0] },
      ]
    }
  };

  const agg = await DailyDepartmentReport.aggregate([
    { $match: { ...baseMatch, reportDate: { $gte: lastWeekStart, $lte: today } } },
    { $project: projectSales },
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

// Submission status (submitted vs expected)
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