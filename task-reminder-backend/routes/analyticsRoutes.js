const express = require('express');
const router = express.Router();
const DailyDepartmentReport = require('../models/DailyDepartmentReport');
const Department = require('../models/Department');
const Showroom = require('../models/Showroom');
const { isAuthenticated, isSuperuser } = require('../middleware/auth');

function normalizeDate(d) {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}
function startOfMonth(dt) {
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), 1, 0, 0, 0, 0));
}

const sumAll = (...paths) => ({ $add: paths.map(p => ({ $ifNull: [p, 0] })) });

// salesExpr updated to exclude removed fields
const salesExpr = sumAll(
  '$tracking.tracker1Install',
  '$tracking.tracker1Renewal',
  '$tracking.tracker2Install',
  '$tracking.tracker2Renewal',
  '$tracking.magneticInstall',
  '$tracking.magneticRenewal',
  '$tracking.offlineVehicles',

  '$speedGovernor.nebsam.officeInstall',
  '$speedGovernor.nebsam.agentInstall',
  '$speedGovernor.nebsam.officeRenewal',
  '$speedGovernor.nebsam.agentRenewal',
  '$speedGovernor.nebsam.offline',
  '$speedGovernor.nebsam.checkups',

  '$speedGovernor.mockMombasa.officeRenewal',
  '$speedGovernor.mockMombasa.agentRenewal',
  '$speedGovernor.mockMombasa.offline',
  '$speedGovernor.mockMombasa.checkups',

  '$speedGovernor.sinotrack.officeInstall',
  '$speedGovernor.sinotrack.agentInstall',
  '$speedGovernor.sinotrack.officeRenewal',
  '$speedGovernor.sinotrack.agentRenewal',
  '$speedGovernor.sinotrack.offline',
  '$speedGovernor.sinotrack.checkups',

  '$radio.officeSale',
  '$radio.agentSale',
  '$radio.officeRenewal', // agentRenewal removed

  '$fuel.officeInstall',
  '$fuel.agentInstall',
  '$fuel.officeRenewal',
  '$fuel.offline',
  '$fuel.checkups', // agentRenewal removed

  '$vehicleTelematics.officeInstall',
  '$vehicleTelematics.agentInstall',
  '$vehicleTelematics.officeRenewal',
  '$vehicleTelematics.offline',
  '$vehicleTelematics.checkups', // agentRenewal removed

  '$online.installs.bluetooth',
  '$online.installs.hybrid',
  '$online.installs.comprehensive',
  '$online.installs.hybridAlarm',
  '$online.renewals.bluetooth',
  '$online.renewals.hybrid',
  '$online.renewals.comprehensive',
  '$online.renewals.hybridAlarm'
);

// DAILY
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
            { $group: { _id: '$reportDate', reports: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          byDept: [{ $group: { _id: '$departmentId', reports: { $sum: 1 } } }],
          total: [{ $group: { _id: null, reports: { $sum: 1 } } }],
        },
      },
    ]);
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TRENDS + KPI
router.get('/trends', isAuthenticated, isSuperuser, async (req, res) => {
  const { departmentId, showroomId } = req.query;
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const curStart = startOfMonth(now);
  const prevStart = new Date(
    Date.UTC(curStart.getUTCFullYear(), curStart.getUTCMonth() - 1, 1, 0, 0, 0, 0)
  );

  const baseMatch = {};
  if (departmentId) baseMatch.departmentId = departmentId;
  if (showroomId) baseMatch.showroomId = showroomId;

  const sumWindow = async (start, end) => {
    const data = await DailyDepartmentReport.aggregate([
      { $match: { ...baseMatch, reportDate: { $gte: start, $lt: end } } },
      { $project: { reportDate: 1, sales: salesExpr } },
      { $group: { _id: null, total: { $sum: '$sales' } } },
    ]);
    return data[0]?.total || 0;
  };

  const thisMonthSales = await sumWindow(curStart, new Date());
  const lastMonthSales = await sumWindow(prevStart, curStart);

  // keep a recent series (last 45 days) for charts – still returned, though you removed the chart
  const seriesStart = new Date(now);
  seriesStart.setUTCDate(seriesStart.getUTCDate() - 45);
  const series = await DailyDepartmentReport.aggregate([
    { $match: { ...baseMatch, reportDate: { $gte: seriesStart, $lte: now } } },
    { $project: { reportDate: 1, sales: salesExpr } },
    { $group: { _id: '$reportDate', sales: { $sum: '$sales' } } },
    { $sort: { _id: 1 } },
  ]);

  const pctVsLastMonth = lastMonthSales
    ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100
    : null;

  // NEW: KPI aggregation for current month only
  const kpiAgg = await DailyDepartmentReport.aggregate([
    { $match: { ...baseMatch, reportDate: { $gte: curStart, $lt: now } } },
    {
      $group: {
        _id: null,

        // Speed governor installs & renewals
        govInstalls: {
          $sum: {
            $add: [
              { $ifNull: ['$speedGovernor.nebsam.officeInstall', 0] },
              { $ifNull: ['$speedGovernor.nebsam.agentInstall', 0] },
              { $ifNull: ['$speedGovernor.sinotrack.officeInstall', 0] },
              { $ifNull: ['$speedGovernor.sinotrack.agentInstall', 0] },
            ],
          },
        },
        govRenewals: {
          $sum: {
            $add: [
              { $ifNull: ['$speedGovernor.nebsam.officeRenewal', 0] },
              { $ifNull: ['$speedGovernor.nebsam.agentRenewal', 0] },
              { $ifNull: ['$speedGovernor.mockMombasa.officeRenewal', 0] },
              { $ifNull: ['$speedGovernor.mockMombasa.agentRenewal', 0] },
              { $ifNull: ['$speedGovernor.sinotrack.officeRenewal', 0] },
              { $ifNull: ['$speedGovernor.sinotrack.agentRenewal', 0] },
            ],
          },
        },

        // Fuel
        fuelInstalls: {
          $sum: {
            $add: [
              { $ifNull: ['$fuel.officeInstall', 0] },
              { $ifNull: ['$fuel.agentInstall', 0] },
            ],
          },
        },
        fuelOffline: { $sum: { $ifNull: ['$fuel.offline', 0] } },

        // Radio
        radioSales: {
          $sum: {
            $add: [
              { $ifNull: ['$radio.officeSale', 0] },
              { $ifNull: ['$radio.agentSale', 0] },
            ],
          },
        },
        radioRenewals: { $sum: { $ifNull: ['$radio.officeRenewal', 0] } },

        // Tracking (all trackers)
        trackingInstalls: {
          $sum: {
            $add: [
              { $ifNull: ['$tracking.tracker1Install', 0] },
              { $ifNull: ['$tracking.tracker2Install', 0] },
              { $ifNull: ['$tracking.magneticInstall', 0] },
            ],
          },
        },

        // Online
        onlineInstalls: {
          $sum: {
            $add: [
              { $ifNull: ['$online.installs.bluetooth', 0] },
              { $ifNull: ['$online.installs.hybrid', 0] },
              { $ifNull: ['$online.installs.comprehensive', 0] },
              { $ifNull: ['$online.installs.hybridAlarm', 0] },
            ],
          },
        },
        onlineRenewals: {
          $sum: {
            $add: [
              { $ifNull: ['$online.renewals.bluetooth', 0] },
              { $ifNull: ['$online.renewals.hybrid', 0] },
              { $ifNull: ['$online.renewals.comprehensive', 0] },
              { $ifNull: ['$online.renewals.hybridAlarm', 0] },
            ],
          },
        },
      },
    },
  ]);

  // Tracking leading showroom (this month)
  const showroomAgg = await DailyDepartmentReport.aggregate([
    {
      $match: {
        reportDate: { $gte: curStart, $lt: now },
        tracking: { $exists: true },
      },
    },
    {
      $group: {
        _id: '$showroomId',
        installs: {
          $sum: {
            $add: [
              { $ifNull: ['$tracking.tracker1Install', 0] },
              { $ifNull: ['$tracking.tracker2Install', 0] },
              { $ifNull: ['$tracking.magneticInstall', 0] },
            ],
          },
        },
      },
    },
    { $sort: { installs: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'showrooms',
        localField: '_id',
        foreignField: '_id',
        as: 'showroom',
      },
    },
    {
      $project: {
        _id: 0,
        installs: 1,
        showroomName: { $arrayElemAt: ['$showroom.name', 0] },
      },
    },
  ]);

  const k = kpiAgg[0] || {};
  const leader = showroomAgg[0] || null;

  res.json({
    thisMonthSales,
    lastMonthSales,
    pctVsLastMonth,
    series,
    kpi: {
      govInstalls: k.govInstalls || 0,
      govRenewals: k.govRenewals || 0,
      fuelInstalls: k.fuelInstalls || 0,
      fuelOffline: k.fuelOffline || 0,
      radioSales: k.radioSales || 0,
      radioRenewals: k.radioRenewals || 0,
      trackingInstalls: k.trackingInstalls || 0,
      trackingTopShowroom: leader?.showroomName || '—',
      trackingTopShowroomInstalls: leader?.installs || 0,
      onlineInstalls: k.onlineInstalls || 0,
      onlineRenewals: k.onlineRenewals || 0,
    },
  });
});

// SUBMISSION STATUS
router.get('/submission-status', isAuthenticated, isSuperuser, async (req, res) => {
  const { date } = req.query;
  const day = new Date(date || new Date());
  day.setUTCHours(0, 0, 0, 0);

  const [deptCount, trackingShowrooms] = await Promise.all([
    Department.countDocuments({}),
    Showroom.countDocuments({ isActive: true }),
  ]);

  const expected = deptCount - 1 + trackingShowrooms; // Tracking counted per showroom
  const reports = await DailyDepartmentReport.countDocuments({ reportDate: day });

  res.json({
    date: day,
    expected,
    submitted: reports,
    completion: expected ? reports / expected : 0,
  });
});

// MONTHLY (existing, unchanged)
router.get('/monthly', isAuthenticated, isSuperuser, async (_req, res) => {
  try {
    const today = new Date();
    const curStart = startOfMonth(today);
    const prevStart = new Date(
      Date.UTC(curStart.getUTCFullYear(), curStart.getUTCMonth() - 1, 1, 0, 0, 0, 0)
    );

    const projectActivity = {
      reportDate: 1,
      deptCode: { $arrayElemAt: ['$dept.code', 0] },
      trackingInstalls: sumAll(
        '$tracking.tracker1Install',
        '$tracking.tracker2Install',
        '$tracking.magneticInstall'
      ),
      trackingRenewals: sumAll(
        '$tracking.tracker1Renewal',
        '$tracking.tracker2Renewal',
        '$tracking.magneticRenewal'
      ),
      trackingOffline: { $ifNull: ['$tracking.offlineVehicles', 0] },
      govInstalls: sumAll(
        '$speedGovernor.nebsam.officeInstall',
        '$speedGovernor.nebsam.agentInstall',
        '$speedGovernor.sinotrack.officeInstall',
        '$speedGovernor.sinotrack.agentInstall'
      ),
      govRenewals: sumAll(
        '$speedGovernor.nebsam.officeRenewal',
        '$speedGovernor.nebsam.agentRenewal',
        '$speedGovernor.mockMombasa.officeRenewal',
        '$speedGovernor.mockMombasa.agentRenewal',
        '$speedGovernor.sinotrack.officeRenewal',
        '$speedGovernor.sinotrack.agentRenewal'
      ),
      govOffline: sumAll(
        '$speedGovernor.nebsam.offline',
        '$speedGovernor.mockMombasa.offline',
        '$speedGovernor.sinotrack.offline'
      ),
      govCheckups: sumAll(
        '$speedGovernor.nebsam.checkups',
        '$speedGovernor.mockMombasa.checkups',
        '$speedGovernor.sinotrack.checkups'
      ),
      radioSales: sumAll('$radio.officeSale', '$radio.agentSale'),
      radioRenewals: sumAll('$radio.officeRenewal'),
      fuelInstalls: sumAll('$fuel.officeInstall', '$fuel.agentInstall'),
      fuelRenewals: sumAll('$fuel.officeRenewal'),
      fuelOffline: { $ifNull: ['$fuel.offline', 0] },
      fuelCheckups: { $ifNull: ['$fuel.checkups', 0] },
      vtelInstalls: sumAll(
        '$vehicleTelematics.officeInstall',
        '$vehicleTelematics.agentInstall'
      ),
      vtelRenewals: sumAll('$vehicleTelematics.officeRenewal'),
      vtelOffline: { $ifNull: ['$vehicleTelematics.offline', 0] },
      vtelCheckups: { $ifNull: ['$vehicleTelematics.checkups', 0] },
      onlineInstalls: sumAll(
        '$online.installs.bluetooth',
        '$online.installs.hybrid',
        '$online.installs.comprehensive',
        '$online.installs.hybridAlarm'
      ),
      onlineRenewals: sumAll(
        '$online.renewals.bluetooth',
        '$online.renewals.hybrid',
        '$online.renewals.comprehensive',
        '$online.renewals.hybridAlarm'
      ),
    };

    const aggRange = async (start, end) => {
      const data = await DailyDepartmentReport.aggregate([
        { $match: { reportDate: { $gte: start, $lt: end } } },
        {
          $lookup: {
            from: 'departments',
            localField: 'departmentId',
            foreignField: '_id',
            as: 'dept',
          },
        },
        { $project: projectActivity },
        {
          $group: {
            _id: '$deptCode',
            trackingInstalls: { $sum: '$trackingInstalls' },
            trackingRenewals: { $sum: '$trackingRenewals' },
            trackingOffline: { $sum: '$trackingOffline' },

            govInstalls: { $sum: '$govInstalls' },
            govRenewals: { $sum: '$govRenewals' },
            govOffline: { $sum: '$govOffline' },
            govCheckups: { $sum: '$govCheckups' },

            radioSales: { $sum: '$radioSales' },
            radioRenewals: { $sum: '$radioRenewals' },

            fuelInstalls: { $sum: '$fuelInstalls' },
            fuelRenewals: { $sum: '$fuelRenewals' },
            fuelOffline: { $sum: '$fuelOffline' },
            fuelCheckups: { $sum: '$fuelCheckups' },

            vtelInstalls: { $sum: '$vtelInstalls' },
            vtelRenewals: { $sum: '$vtelRenewals' },
            vtelOffline: { $sum: '$vtelOffline' },
            vtelCheckups: { $sum: '$vtelCheckups' },

            onlineInstalls: { $sum: '$onlineInstalls' },
            onlineRenewals: { $sum: '$onlineRenewals' },
          },
        },
      ]);
      const map = {};
      data.forEach((d) => {
        map[d._id || 'UNKNOWN'] = d;
      });
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
        },
      };
    };

    const current = await aggRange(curStart, today);
    const previous = await aggRange(prevStart, curStart);

    res.json({ current, previous });
  } catch (err) {
    console.error('Monthly rollup error', err);
    res
      .status(500)
      .json({ error: err.message || 'Failed to compute monthly rollup' });
  }
});

// MONTHLY-SERIES (CEO dashboard) – unchanged from your latest version
router.get('/monthly-series', isAuthenticated, isSuperuser, async (req, res) => {
  const months = Math.min(Math.max(parseInt(req.query.months || '6', 10), 1), 24);
  const now = new Date();
  now.setUTCDate(1);
  now.setUTCHours(0, 0, 0, 0);
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1, 0, 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  );

  const monthKey = { $dateToString: { format: '%Y-%m', date: '$reportDate' } };

  const data = await DailyDepartmentReport.aggregate([
    { $match: { reportDate: { $gte: start, $lt: end } } },
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'dept',
      },
    },
    {
      $project: {
        month: monthKey,
        deptCode: { $arrayElemAt: ['$dept.code', 0] },
        // GOV
        nebsamOfficeInst: '$speedGovernor.nebsam.officeInstall',
        nebsamAgentInst: '$speedGovernor.nebsam.agentInstall',
        nebsamOfficeRen: '$speedGovernor.nebsam.officeRenewal',
        nebsamAgentRen: '$speedGovernor.nebsam.agentRenewal',
        nebsamOffline: '$speedGovernor.nebsam.offline',
        nebsamCheck: '$speedGovernor.nebsam.checkups',

        mockOfficeRen: '$speedGovernor.mockMombasa.officeRenewal',
        mockAgentRen: '$speedGovernor.mockMombasa.agentRenewal',
        mockOffline: '$speedGovernor.mockMombasa.offline',
        mockCheck: '$speedGovernor.mockMombasa.checkups',

        sinoOfficeInst: '$speedGovernor.sinotrack.officeInstall',
        sinoAgentInst: '$speedGovernor.sinotrack.agentInstall',
        sinoOfficeRen: '$speedGovernor.sinotrack.officeRenewal',
        sinoAgentRen: '$speedGovernor.sinotrack.agentRenewal',
        sinoOffline: '$speedGovernor.sinotrack.offline',
        sinoCheck: '$speedGovernor.sinotrack.checkups',

        // RADIO
        radioOfficeSale: '$radio.officeSale',
        radioAgentSale: '$radio.agentSale',
        radioOfficeRen: '$radio.officeRenewal',

        // FUEL
        fuelOfficeInst: '$fuel.officeInstall',
        fuelAgentInst: '$fuel.agentInstall',
        fuelOfficeRen: '$fuel.officeRenewal',
        fuelOffline: '$fuel.offline',
        fuelCheck: '$fuel.checkups',

        // VTEL
        vtelOfficeInst: '$vehicleTelematics.officeInstall',
        vtelAgentInst: '$vehicleTelematics.agentInstall',
        vtelOfficeRen: '$vehicleTelematics.officeRenewal',
        vtelOffline: '$vehicleTelematics.offline',
        vtelCheck: '$vehicleTelematics.checkups',

        // TRACK
        trackOff: '$tracking.offlineVehicles',
        t1Inst: '$tracking.tracker1Install',
        t1Ren: '$tracking.tracker1Renewal',
        t2Inst: '$tracking.tracker2Install',
        t2Ren: '$tracking.tracker2Renewal',
        magInst: '$tracking.magneticInstall',
        magRen: '$tracking.magneticRenewal',

        // ONLINE
        onInstBt: '$online.installs.bluetooth',
        onInstHy: '$online.installs.hybrid',
        onInstCo: '$online.installs.comprehensive',
        onInstHa: '$online.installs.hybridAlarm',
        onRenBt: '$online.renewals.bluetooth',
        onRenHy: '$online.renewals.hybrid',
        onRenCo: '$online.renewals.comprehensive',
        onRenHa: '$online.renewals.hybridAlarm',
      },
    },
    {
      $group: {
        _id: { month: '$month', code: '$deptCode' },

        // GOV
        nebsamOfficeInst: { $sum: { $ifNull: ['$nebsamOfficeInst', 0] } },
        nebsamAgentInst: { $sum: { $ifNull: ['$nebsamAgentInst', 0] } },
        nebsamOfficeRen: { $sum: { $ifNull: ['$nebsamOfficeRen', 0] } },
        nebsamAgentRen: { $sum: { $ifNull: ['$nebsamAgentRen', 0] } },
        nebsamOffline: { $sum: { $ifNull: ['$nebsamOffline', 0] } },
        nebsamCheck: { $sum: { $ifNull: ['$nebsamCheck', 0] } },

        mockOfficeRen: { $sum: { $ifNull: ['$mockOfficeRen', 0] } },
        mockAgentRen: { $sum: { $ifNull: ['$mockAgentRen', 0] } },
        mockOffline: { $sum: { $ifNull: ['$mockOffline', 0] } },
        mockCheck: { $sum: { $ifNull: ['$mockCheck', 0] } },

        sinoOfficeInst: { $sum: { $ifNull: ['$sinoOfficeInst', 0] } },
        sinoAgentInst: { $sum: { $ifNull: ['$sinoAgentInst', 0] } },
        sinoOfficeRen: { $sum: { $ifNull: ['$sinoOfficeRen', 0] } },
        sinoAgentRen: { $sum: { $ifNull: ['$sinoAgentRen', 0] } },
        sinoOffline: { $sum: { $ifNull: ['$sinoOffline', 0] } },
        sinoCheck: { $sum: { $ifNull: ['$sinoCheck', 0] } },

        // RADIO
        radioOfficeSale: { $sum: { $ifNull: ['$radioOfficeSale', 0] } },
        radioAgentSale: { $sum: { $ifNull: ['$radioAgentSale', 0] } },
        radioOfficeRen: { $sum: { $ifNull: ['$radioOfficeRen', 0] } },

        // FUEL
        fuelOfficeInst: { $sum: { $ifNull: ['$fuelOfficeInst', 0] } },
        fuelAgentInst: { $sum: { $ifNull: ['$fuelAgentInst', 0] } },
        fuelOfficeRen: { $sum: { $ifNull: ['$fuelOfficeRen', 0] } },
        fuelOffline: { $sum: { $ifNull: ['$fuelOffline', 0] } },
        fuelCheck: { $sum: { $ifNull: ['$fuelCheck', 0] } },

        // VTEL
        vtelOfficeInst: { $sum: { $ifNull: ['$vtelOfficeInst', 0] } },
        vtelAgentInst: { $sum: { $ifNull: ['$vtelAgentInst', 0] } },
        vtelOfficeRen: { $sum: { $ifNull: ['$vtelOfficeRen', 0] } },
        vtelOffline: { $sum: { $ifNull: ['$vtelOffline', 0] } },
        vtelCheck: { $sum: { $ifNull: ['$vtelCheck', 0] } },

        // TRACK
        trackOff: { $sum: { $ifNull: ['$trackOff', 0] } },
        t1Inst: { $sum: { $ifNull: ['$t1Inst', 0] } },
        t1Ren: { $sum: { $ifNull: ['$t1Ren', 0] } },
        t2Inst: { $sum: { $ifNull: ['$t2Inst', 0] } },
        t2Ren: { $sum: { $ifNull: ['$t2Ren', 0] } },
        magInst: { $sum: { $ifNull: ['$magInst', 0] } },
        magRen: { $sum: { $ifNull: ['$magRen', 0] } },

        // ONLINE
        onInstBt: { $sum: { $ifNull: ['$onInstBt', 0] } },
        onInstHy: { $sum: { $ifNull: ['$onInstHy', 0] } },
        onInstCo: { $sum: { $ifNull: ['$onInstCo', 0] } },
        onInstHa: { $sum: { $ifNull: ['$onInstHa', 0] } },
        onRenBt: { $sum: { $ifNull: ['$onRenBt', 0] } },
        onRenHy: { $sum: { $ifNull: ['$onRenHy', 0] } },
        onRenCo: { $sum: { $ifNull: ['$onRenCo', 0] } },
        onRenHa: { $sum: { $ifNull: ['$onRenHa', 0] } },
      },
    },
    {
      $project: {
        month: '$_id.month',
        code: '$_id.code',
        _id: 0,

        nebsamOfficeInst: 1,
        nebsamAgentInst: 1,
        nebsamOfficeRen: 1,
        nebsamAgentRen: 1,
        nebsamOffline: 1,
        nebsamCheck: 1,
        mockOfficeRen: 1,
        mockAgentRen: 1,
        mockOffline: 1,
        mockCheck: 1,
        sinoOfficeInst: 1,
        sinoAgentInst: 1,
        sinoOfficeRen: 1,
        sinoAgentRen: 1,
        sinoOffline: 1,
        sinoCheck: 1,

        radioOfficeSale: 1,
        radioAgentSale: 1,
        radioOfficeRen: 1,

        fuelOfficeInst: 1,
        fuelAgentInst: 1,
        fuelOfficeRen: 1,
        fuelOffline: 1,
        fuelCheck: 1,
        vtelOfficeInst: 1,
        vtelAgentInst: 1,
        vtelOfficeRen: 1,
        vtelOffline: 1,
        vtelCheck: 1,

        trackOff: 1,
        t1Inst: 1,
        t1Ren: 1,
        t2Inst: 1,
        t2Ren: 1,
        magInst: 1,
        magRen: 1,

        onInstBt: 1,
        onInstHy: 1,
        onInstCo: 1,
        onInstHa: 1,
        onRenBt: 1,
        onRenHy: 1,
        onRenCo: 1,
        onRenHa: 1,
      },
    },
    { $sort: { month: 1 } },
  ]);

  const monthLabels = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start);
    d.setUTCMonth(d.getUTCMonth() + i);
    monthLabels.push(d.toISOString().slice(0, 7));
  }

  const byCode = {};
  data.forEach((d) => {
    byCode[d.code] = byCode[d.code] || {};
    byCode[d.code][d.month] = d;
  });

  const fill = (codes, pick) =>
    codes.map((code) => ({
      code,
      series: monthLabels.map((m) => pick(byCode[code]?.[m]) || pick(null)),
    }));

  const resp = {
    months: monthLabels,
    gov: {
      nebsam: fill(['GOV'], (row) => ({
        officeInst: row?.nebsamOfficeInst || 0,
        agentInst: row?.nebsamAgentInst || 0,
        officeRen: row?.nebsamOfficeRen || 0,
        agentRen: row?.nebsamAgentRen || 0,
        offline: row?.nebsamOffline || 0,
        checkups: row?.nebsamCheck || 0,
      }))[0].series,
      mock: fill(['GOV'], (row) => ({
        officeRen: row?.mockOfficeRen || 0,
        agentRen: row?.mockAgentRen || 0,
        offline: row?.mockOffline || 0,
        checkups: row?.mockCheck || 0,
      }))[0].series,
      sinotrack: fill(['GOV'], (row) => ({
        officeInst: row?.sinoOfficeInst || 0,
        agentInst: row?.sinoAgentInst || 0,
        officeRen: row?.sinoOfficeRen || 0,
        agentRen: row?.sinoAgentRen || 0,
        offline: row?.sinoOffline || 0,
        checkups: row?.sinoCheck || 0,
      }))[0].series,
    },
    radio:
      fill(['RADIO'], (row) => ({
        officeSale: row?.radioOfficeSale || 0,
        agentSale: row?.radioAgentSale || 0,
        officeRen: row?.radioOfficeRen || 0,
      }))[0]?.series ||
      monthLabels.map(() => ({
        officeSale: 0,
        agentSale: 0,
        officeRen: 0,
      })),
    fuel:
      fill(['FUEL'], (row) => ({
        officeInst: row?.fuelOfficeInst || 0,
        agentInst: row?.fuelAgentInst || 0,
        officeRen: row?.fuelOfficeRen || 0,
        offline: row?.fuelOffline || 0,
        checkups: row?.fuelCheck || 0,
      }))[0]?.series ||
      monthLabels.map(() => ({
        officeInst: 0,
        agentInst: 0,
        officeRen: 0,
        offline: 0,
        checkups: 0,
      })),
    vtel:
      fill(['VTEL'], (row) => ({
        officeInst: row?.vtelOfficeInst || 0,
        agentInst: row?.vtelAgentInst || 0,
        officeRen: row?.vtelOfficeRen || 0,
        offline: row?.vtelOffline || 0,
        checkups: row?.vtelCheck || 0,
      }))[0]?.series ||
      monthLabels.map(() => ({
        officeInst: 0,
        agentInst: 0,
        officeRen: 0,
        offline: 0,
        checkups: 0,
      })),
    track:
      fill(['TRACK'], (row) => ({
        tracker1Inst: row?.t1Inst || 0,
        tracker1Ren: row?.t1Ren || 0,
        tracker2Inst: row?.t2Inst || 0,
        tracker2Ren: row?.t2Ren || 0,
        magneticInst: row?.magInst || 0,
        magneticRen: row?.magRen || 0,
        offline: row?.trackOff || 0,
      }))[0]?.series ||
      monthLabels.map(() => ({
        tracker1Inst: 0,
        tracker1Ren: 0,
        tracker2Inst: 0,
        tracker2Ren: 0,
        magneticInst: 0,
        magneticRen: 0,
        offline: 0,
      })),
    online:
      fill(['ONLINE'], (row) => ({
        instBt: row?.onInstBt || 0,
        instHy: row?.onInstHy || 0,
        instCo: row?.onInstCo || 0,
        instHa: row?.onInstHa || 0,
        renBt: row?.onRenBt || 0,
        renHy: row?.onRenHy || 0,
        renCo: row?.onRenCo || 0,
        renHa: row?.onRenHa || 0,
      }))[0]?.series ||
      monthLabels.map(() => ({
        instBt: 0,
        instHy: 0,
        instCo: 0,
        instHa: 0,
        renBt: 0,
        renHy: 0,
        renCo: 0,
        renHa: 0,
      })),
  };

  res.json(resp);
});

module.exports = router;