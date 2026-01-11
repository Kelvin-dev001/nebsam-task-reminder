const express = require('express');
const router = express.Router();
const DailyDepartmentReport = require('../models/DailyDepartmentReport');
const Department = require('../models/Department');
const Showroom = require('../models/Showroom');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

function normalizeDate(d) { const dt = new Date(d); dt.setUTCHours(0,0,0,0); return dt; }
function startOfMonth(dt) { return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), 1, 0, 0, 0, 0)); }

const sumAll = (...paths) => ({ $add: paths.map(p => ({ $ifNull: [p, 0] })) });

const projectActivity = {
  reportDate: 1,
  deptCode: { $arrayElemAt: ["$dept.code", 0] },
  // Tracking
  trackingInstalls: sumAll("$tracking.tracker1Install", "$tracking.tracker2Install", "$tracking.magneticInstall"),
  trackingRenewals: sumAll("$tracking.tracker1Renewal", "$tracking.tracker2Renewal", "$tracking.magneticRenewal"),
  trackingOffline: { $ifNull: ["$tracking.offlineVehicles", 0] },
  // Governors
  govInstalls: sumAll(
    "$speedGovernor.nebsam.officeInstall", "$speedGovernor.nebsam.agentInstall",
    "$speedGovernor.mockMombasa.officeInstall", "$speedGovernor.mockMombasa.agentInstall",
    "$speedGovernor.sinotrack.officeInstall", "$speedGovernor.sinotrack.agentInstall"
  ),
  govRenewals: sumAll(
    "$speedGovernor.nebsam.officeRenewal", "$speedGovernor.nebsam.agentRenewal",
    "$speedGovernor.mockMombasa.officeRenewal", "$speedGovernor.mockMombasa.agentRenewal",
    "$speedGovernor.sinotrack.officeRenewal", "$speedGovernor.sinotrack.agentRenewal"
  ),
  govOffline: sumAll(
    "$speedGovernor.nebsam.offline", "$speedGovernor.mockMombasa.offline", "$speedGovernor.sinotrack.offline"
  ),
  govCheckups: sumAll(
    "$speedGovernor.nebsam.checkups", "$speedGovernor.mockMombasa.checkups", "$speedGovernor.sinotrack.checkups"
  ),
  // Radio
  radioSales: sumAll("$radio.officeSale", "$radio.agentSale"),
  radioRenewals: sumAll("$radio.officeRenewal", "$radio.agentRenewal"),
  // Fuel
  fuelInstalls: sumAll("$fuel.officeInstall", "$fuel.agentInstall"),
  fuelRenewals: sumAll("$fuel.officeRenewal", "$fuel.agentRenewal"),
  fuelOffline: { $ifNull: ["$fuel.offline", 0] },
  fuelCheckups: { $ifNull: ["$fuel.checkups", 0] },
  // Vehicle Telematics
  vtelInstalls: sumAll("$vehicleTelematics.officeInstall", "$vehicleTelematics.agentInstall"),
  vtelRenewals: sumAll("$vehicleTelematics.officeRenewal", "$vehicleTelematics.agentRenewal"),
  vtelOffline: { $ifNull: ["$vehicleTelematics.offline", 0] },
  vtelCheckups: { $ifNull: ["$vehicleTelematics.checkups", 0] },
  // Online
  onlineInstalls: sumAll(
    "$online.installs.bluetooth", "$online.installs.hybrid",
    "$online.installs.comprehensive", "$online.installs.hybridAlarm"
  ),
  onlineRenewals: sumAll(
    "$online.renewals.bluetooth", "$online.renewals.hybrid",
    "$online.renewals.comprehensive", "$online.renewals.hybridAlarm"
  ),
};

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
            { $group: { _id: "$reportDate", reports: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          byDept: [
            { $group: { _id: "$departmentId", reports: { $sum: 1 } } }
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

// Trends (activity proxy)
router.get('/trends', isAuthenticated, isSuperuser, async (req, res) => {
  const { departmentId, showroomId } = req.query;
  const today = new Date(); today.setUTCHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setUTCDate(today.getUTCDate() - 1);
  const lastWeekStart = new Date(today); lastWeekStart.setUTCDate(today.getUTCDate() - 7);

  const baseMatch = {};
  if (departmentId) baseMatch.departmentId = departmentId;
  if (showroomId) baseMatch.showroomId = showroomId;

  const salesExpr = sumAll(
    "$tracking.tracker1Install", "$tracking.tracker1Renewal",
    "$tracking.tracker2Install", "$tracking.tracker2Renewal",
    "$tracking.magneticInstall", "$tracking.magneticRenewal",
    "$tracking.offlineVehicles",
    "$speedGovernor.nebsam.officeInstall", "$speedGovernor.nebsam.agentInstall",
    "$speedGovernor.nebsam.officeRenewal", "$speedGovernor.nebsam.agentRenewal",
    "$speedGovernor.nebsam.offline", "$speedGovernor.nebsam.checkups",
    "$speedGovernor.mockMombasa.officeInstall", "$speedGovernor.mockMombasa.agentInstall",
    "$speedGovernor.mockMombasa.officeRenewal", "$speedGovernor.mockMombasa.agentRenewal",
    "$speedGovernor.mockMombasa.offline", "$speedGovernor.mockMombasa.checkups",
    "$speedGovernor.sinotrack.officeInstall", "$speedGovernor.sinotrack.agentInstall",
    "$speedGovernor.sinotrack.officeRenewal", "$speedGovernor.sinotrack.agentRenewal",
    "$speedGovernor.sinotrack.offline", "$speedGovernor.sinotrack.checkups",
    "$radio.officeSale", "$radio.agentSale", "$radio.officeRenewal", "$radio.agentRenewal",
    "$fuel.officeInstall", "$fuel.agentInstall", "$fuel.officeRenewal", "$fuel.agentRenewal", "$fuel.offline", "$fuel.checkups",
    "$vehicleTelematics.officeInstall", "$vehicleTelematics.agentInstall",
    "$vehicleTelematics.officeRenewal", "$vehicleTelematics.agentRenewal",
    "$vehicleTelematics.offline", "$vehicleTelematics.checkups",
    "$online.installs.bluetooth", "$online.installs.hybrid", "$online.installs.comprehensive", "$online.installs.hybridAlarm",
    "$online.renewals.bluetooth", "$online.renewals.hybrid", "$online.renewals.comprehensive", "$online.renewals.hybridAlarm"
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

// Submission status
router.get('/submission-status', isAuthenticated, isSuperuser, async (req, res) => {
  const { date } = req.query;
  const day = new Date(date || new Date()); day.setUTCHours(0,0,0,0);

  const [deptCount, trackingShowrooms] = await Promise.all([
    Department.countDocuments({}),
    Showroom.countDocuments({ isActive: true })
  ]);

  const expected = deptCount - 1 + trackingShowrooms;
  const reports = await DailyDepartmentReport.countDocuments({ reportDate: day });

  res.json({ date: day, expected, submitted: reports, completion: expected ? reports / expected : 0 });
});

// Monthly rollup for boss dashboard
router.get('/monthly', isAuthenticated, isSuperuser, async (_req, res) => {
  try {
    const today = new Date();
    const curStart = startOfMonth(today);
    const prevStart = new Date(Date.UTC(curStart.getUTCFullYear(), curStart.getUTCMonth() - 1, 1, 0, 0, 0, 0));

    const aggRange = async (start, end) => {
      const data = await DailyDepartmentReport.aggregate([
        { $match: { reportDate: { $gte: start, $lt: end } } },
        { $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'dept' } },
        { $project: projectActivity },
        { $group: {
            _id: "$deptCode",
            trackingInstalls: { $sum: "$trackingInstalls" },
            trackingRenewals: { $sum: "$trackingRenewals" },
            trackingOffline: { $sum: "$trackingOffline" },

            govInstalls: { $sum: "$govInstalls" },
            govRenewals: { $sum: "$govRenewals" },
            govOffline: { $sum: "$govOffline" },
            govCheckups: { $sum: "$govCheckups" },

            radioSales: { $sum: "$radioSales" },
            radioRenewals: { $sum: "$radioRenewals" },

            fuelInstalls: { $sum: "$fuelInstalls" },
            fuelRenewals: { $sum: "$fuelRenewals" },
            fuelOffline: { $sum: "$fuelOffline" },
            fuelCheckups: { $sum: "$fuelCheckups" },

            vtelInstalls: { $sum: "$vtelInstalls" },
            vtelRenewals: { $sum: "$vtelRenewals" },
            vtelOffline: { $sum: "$vtelOffline" },
            vtelCheckups: { $sum: "$vtelCheckups" },

            onlineInstalls: { $sum: "$onlineInstalls" },
            onlineRenewals: { $sum: "$onlineRenewals" },
          }
        }
      ]);
      // Map by code for quick access
      const map = {};
      data.forEach(d => { map[d._id || 'UNKNOWN'] = d; });
      const get = (code, field, def = 0) => map[code]?.[field] ?? def;
      return {
        tracking: {
          installs: get('TRACK', 'trackingInstalls'),
          renewals: get('TRACK', 'trackingRenewals'),
          offline: get('TRACK', 'trackingOffline'),
        },
        gov: {
          installs: get('GOV', 'govInstalls'),
          renewals: get('GOV', 'govRenewals'),
          offline: get('GOV', 'govOffline'),
          checkups: get('GOV', 'govCheckups'),
        },
        radio: {
          sales: get('RADIO', 'radioSales'),
          renewals: get('RADIO', 'radioRenewals'),
        },
        fuel: {
          installs: get('FUEL', 'fuelInstalls'),
          renewals: get('FUEL', 'fuelRenewals'),
          offline: get('FUEL', 'fuelOffline'),
          checkups: get('FUEL', 'fuelCheckups'),
        },
        vtel: {
          installs: get('VTEL', 'vtelInstalls'),
          renewals: get('VTEL', 'vtelRenewals'),
          offline: get('VTEL', 'vtelOffline'),
          checkups: get('VTEL', 'vtelCheckups'),
        },
        online: {
          installs: get('ONLINE', 'onlineInstalls'),
          renewals: get('ONLINE', 'onlineRenewals'),
        }
      };
    };

    const current = await aggRange(curStart, today);
    const previous = await aggRange(prevStart, curStart);

    res.json({ current, previous });
  } catch (err) {
    console.error('Monthly rollup error', err);
    res.status(500).json({ error: err.message || 'Failed to compute monthly rollup' });
  }
});

module.exports = router;