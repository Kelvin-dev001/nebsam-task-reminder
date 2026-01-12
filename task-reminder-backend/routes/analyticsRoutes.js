// NEW: Monthly series (last N months, default 6) for CEO dashboard
router.get('/monthly-series', isAuthenticated, isSuperuser, async (req, res) => {
  const months = Math.min(Math.max(parseInt(req.query.months || '6', 10), 1), 24); // cap 24
  const now = new Date(); now.setUTCDate(1); now.setUTCHours(0,0,0,0);
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  // Build a YYYY-MM label
  const monthKey = { $dateToString: { format: "%Y-%m", date: "$reportDate" } };

  const data = await DailyDepartmentReport.aggregate([
    { $match: { reportDate: { $gte: start, $lt: end } } },
    { $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'dept' } },
    { $project: {
        month: monthKey,
        deptCode: { $arrayElemAt: ["$dept.code", 0] },

        // GOV
        nebsamOfficeInst: "$speedGovernor.nebsam.officeInstall",
        nebsamAgentInst: "$speedGovernor.nebsam.agentInstall",
        nebsamOfficeRen: "$speedGovernor.nebsam.officeRenewal",
        nebsamAgentRen: "$speedGovernor.nebsam.agentRenewal",
        nebsamOffline:   "$speedGovernor.nebsam.offline",
        nebsamCheck:     "$speedGovernor.nebsam.checkups",

        mockOfficeRen: "$speedGovernor.mockMombasa.officeRenewal",
        mockAgentRen: "$speedGovernor.mockMombasa.agentRenewal",
        mockOffline:   "$speedGovernor.mockMombasa.offline",
        mockCheck:     "$speedGovernor.mockMombasa.checkups",

        sinoOfficeInst: "$speedGovernor.sinotrack.officeInstall",
        sinoAgentInst: "$speedGovernor.sinotrack.agentInstall",
        sinoOfficeRen: "$speedGovernor.sinotrack.officeRenewal",
        sinoAgentRen: "$speedGovernor.sinotrack.agentRenewal",
        sinoOffline:   "$speedGovernor.sinotrack.offline",
        sinoCheck:     "$speedGovernor.sinotrack.checkups",

        // RADIO
        radioOfficeSale: "$radio.officeSale",
        radioAgentSale: "$radio.agentSale",
        radioOfficeRen: "$radio.officeRenewal",

        // FUEL
        fuelOfficeInst: "$fuel.officeInstall",
        fuelAgentInst: "$fuel.agentInstall",
        fuelOfficeRen: "$fuel.officeRenewal",
        fuelOffline:   "$fuel.offline",
        fuelCheck:     "$fuel.checkups",

        // VTEL
        vtelOfficeInst: "$vehicleTelematics.officeInstall",
        vtelAgentInst: "$vehicleTelematics.agentInstall",
        vtelOfficeRen: "$vehicleTelematics.officeRenewal",
        vtelOffline:   "$vehicleTelematics.offline",
        vtelCheck:     "$vehicleTelematics.checkups",

        // TRACK
        trackOff: "$tracking.offlineVehicles",
        t1Inst: "$tracking.tracker1Install",
        t1Ren:  "$tracking.tracker1Renewal",
        t2Inst: "$tracking.tracker2Install",
        t2Ren:  "$tracking.tracker2Renewal",
        magInst: "$tracking.magneticInstall",
        magRen:  "$tracking.magneticRenewal",

        // ONLINE
        onInstBt: "$online.installs.bluetooth",
        onInstHy: "$online.installs.hybrid",
        onInstCo: "$online.installs.comprehensive",
        onInstHa: "$online.installs.hybridAlarm",
        onRenBt: "$online.renewals.bluetooth",
        onRenHy: "$online.renewals.hybrid",
        onRenCo: "$online.renewals.comprehensive",
        onRenHa: "$online.renewals.hybridAlarm",
      }
    },
    { $group: {
        _id: { month: "$month", code: "$deptCode" },

        // GOV
        nebsamOfficeInst: { $sum: { $ifNull: ["$nebsamOfficeInst", 0] } },
        nebsamAgentInst:  { $sum: { $ifNull: ["$nebsamAgentInst", 0] } },
        nebsamOfficeRen:  { $sum: { $ifNull: ["$nebsamOfficeRen", 0] } },
        nebsamAgentRen:   { $sum: { $ifNull: ["$nebsamAgentRen", 0] } },
        nebsamOffline:    { $sum: { $ifNull: ["$nebsamOffline", 0] } },
        nebsamCheck:      { $sum: { $ifNull: ["$nebsamCheck", 0] } },

        mockOfficeRen: { $sum: { $ifNull: ["$mockOfficeRen", 0] } },
        mockAgentRen: { $sum: { $ifNull: ["$mockAgentRen", 0] } },
        mockOffline:  { $sum: { $ifNull: ["$mockOffline", 0] } },
        mockCheck:    { $sum: { $ifNull: ["$mockCheck", 0] } },

        sinoOfficeInst: { $sum: { $ifNull: ["$sinoOfficeInst", 0] } },
        sinoAgentInst:  { $sum: { $ifNull: ["$sinoAgentInst", 0] } },
        sinoOfficeRen:  { $sum: { $ifNull: ["$sinoOfficeRen", 0] } },
        sinoAgentRen:   { $sum: { $ifNull: ["$sinoAgentRen", 0] } },
        sinoOffline:    { $sum: { $ifNull: ["$sinoOffline", 0] } },
        sinoCheck:      { $sum: { $ifNull: ["$sinoCheck", 0] } },

        // RADIO
        radioOfficeSale: { $sum: { $ifNull: ["$radioOfficeSale", 0] } },
        radioAgentSale:  { $sum: { $ifNull: ["$radioAgentSale", 0] } },
        radioOfficeRen:  { $sum: { $ifNull: ["$radioOfficeRen", 0] } },

        // FUEL
        fuelOfficeInst: { $sum: { $ifNull: ["$fuelOfficeInst", 0] } },
        fuelAgentInst:  { $sum: { $ifNull: ["$fuelAgentInst", 0] } },
        fuelOfficeRen:  { $sum: { $ifNull: ["$fuelOfficeRen", 0] } },
        fuelOffline:    { $sum: { $ifNull: ["$fuelOffline", 0] } },
        fuelCheck:      { $sum: { $ifNull: ["$fuelCheck", 0] } },

        // VTEL
        vtelOfficeInst: { $sum: { $ifNull: ["$vtelOfficeInst", 0] } },
        vtelAgentInst:  { $sum: { $ifNull: ["$vtelAgentInst", 0] } },
        vtelOfficeRen:  { $sum: { $ifNull: ["$vtelOfficeRen", 0] } },
        vtelOffline:    { $sum: { $ifNull: ["$vtelOffline", 0] } },
        vtelCheck:      { $sum: { $ifNull: ["$vtelCheck", 0] } },

        // TRACK
        trackOff: { $sum: { $ifNull: ["$trackOff", 0] } },
        t1Inst:   { $sum: { $ifNull: ["$t1Inst", 0] } },
        t1Ren:    { $sum: { $ifNull: ["$t1Ren", 0] } },
        t2Inst:   { $sum: { $ifNull: ["$t2Inst", 0] } },
        t2Ren:    { $sum: { $ifNull: ["$t2Ren", 0] } },
        magInst:  { $sum: { $ifNull: ["$magInst", 0] } },
        magRen:   { $sum: { $ifNull: ["$magRen", 0] } },

        // ONLINE
        onInstBt: { $sum: { $ifNull: ["$onInstBt", 0] } },
        onInstHy: { $sum: { $ifNull: ["$onInstHy", 0] } },
        onInstCo: { $sum: { $ifNull: ["$onInstCo", 0] } },
        onInstHa: { $sum: { $ifNull: ["$onInstHa", 0] } },
        onRenBt:  { $sum: { $ifNull: ["$onRenBt", 0] } },
        onRenHy:  { $sum: { $ifNull: ["$onRenHy", 0] } },
        onRenCo:  { $sum: { $ifNull: ["$onRenCo", 0] } },
        onRenHa:  { $sum: { $ifNull: ["$onRenHa", 0] } },
      }
    },
    { $project: {
        month: "$_id.month",
        code: "$_id.code",
        _id: 0,

        nebsamOfficeInst: 1, nebsamAgentInst: 1, nebsamOfficeRen: 1, nebsamAgentRen: 1, nebsamOffline: 1, nebsamCheck: 1,
        mockOfficeRen: 1, mockAgentRen: 1, mockOffline: 1, mockCheck: 1,
        sinoOfficeInst: 1, sinoAgentInst: 1, sinoOfficeRen: 1, sinoAgentRen: 1, sinoOffline: 1, sinoCheck: 1,

        radioOfficeSale: 1, radioAgentSale: 1, radioOfficeRen: 1,

        fuelOfficeInst: 1, fuelAgentInst: 1, fuelOfficeRen: 1, fuelOffline: 1, fuelCheck: 1,
        vtelOfficeInst: 1, vtelAgentInst: 1, vtelOfficeRen: 1, vtelOffline: 1, vtelCheck: 1,

        trackOff: 1, t1Inst: 1, t1Ren: 1, t2Inst: 1, t2Ren: 1, magInst: 1, magRen: 1,

        onInstBt: 1, onInstHy: 1, onInstCo: 1, onInstHa: 1,
        onRenBt: 1, onRenHy: 1, onRenCo: 1, onRenHa: 1,
      }
    },
    { $sort: { month: 1 } }
  ]);

  // Normalize months list
  const monthLabels = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start);
    d.setUTCMonth(d.getUTCMonth() + i);
    monthLabels.push(d.toISOString().slice(0, 7)); // YYYY-MM
  }

  const byCode = {};
  data.forEach(d => {
    byCode[d.code] = byCode[d.code] || {};
    byCode[d.code][d.month] = d;
  });

  const fill = (codes, pick) => codes.map(code => ({
    code,
    series: monthLabels.map(m => pick(byCode[code]?.[m]) || pick(null, m, code, true))
  }));

  const resp = {
    months: monthLabels,
    gov: {
      nebsam: fill(['GOV'], (row) => ({
        officeInst: row?.nebsamOfficeInst || 0,
        agentInst: row?.nebsamAgentInst || 0,
        officeRen: row?.nebsamOfficeRen || 0,
        agentRen: row?.nebsamAgentRen || 0,
        offline:   row?.nebsamOffline   || 0,
        checkups:  row?.nebsamCheck     || 0,
      }))[0].series,
      mock: fill(['GOV'], (row) => ({
        officeRen: row?.mockOfficeRen || 0,
        agentRen: row?.mockAgentRen || 0,
        offline:  row?.mockOffline || 0,
        checkups: row?.mockCheck || 0,
      }))[0].series,
      sinotrack: fill(['GOV'], (row) => ({
        officeInst: row?.sinoOfficeInst || 0,
        agentInst: row?.sinoAgentInst || 0,
        officeRen: row?.sinoOfficeRen || 0,
        agentRen: row?.sinoAgentRen || 0,
        offline:   row?.sinoOffline   || 0,
        checkups:  row?.sinoCheck     || 0,
      }))[0].series,
    },
    radio: fill(['RADIO'], (row) => ({
      officeSale: row?.radioOfficeSale || 0,
      agentSale:  row?.radioAgentSale || 0,
      officeRen:  row?.radioOfficeRen || 0,
    }))[0]?.series || monthLabels.map(() => ({ officeSale:0, agentSale:0, officeRen:0 })),
    fuel: fill(['FUEL'], (row) => ({
      officeInst: row?.fuelOfficeInst || 0,
      agentInst: row?.fuelAgentInst || 0,
      officeRen: row?.fuelOfficeRen || 0,
      offline:   row?.fuelOffline || 0,
      checkups:  row?.fuelCheck || 0,
    }))[0]?.series || monthLabels.map(() => ({ officeInst:0,agentInst:0,officeRen:0,offline:0,checkups:0 })),
    vtel: fill(['VTEL'], (row) => ({
      officeInst: row?.vtelOfficeInst || 0,
      agentInst: row?.vtelAgentInst || 0,
      officeRen: row?.vtelOfficeRen || 0,
      offline:   row?.vtelOffline || 0,
      checkups:  row?.vtelCheck || 0,
    }))[0]?.series || monthLabels.map(() => ({ officeInst:0,agentInst:0,officeRen:0,offline:0,checkups:0 })),
    track: fill(['TRACK'], (row) => ({
      tracker1Inst: row?.t1Inst || 0,
      tracker1Ren:  row?.t1Ren  || 0,
      tracker2Inst: row?.t2Inst || 0,
      tracker2Ren:  row?.t2Ren  || 0,
      magneticInst: row?.magInst || 0,
      magneticRen:  row?.magRen  || 0,
      offline:      row?.trackOff || 0,
    }))[0]?.series || monthLabels.map(() => ({
      tracker1Inst:0,tracker1Ren:0,tracker2Inst:0,tracker2Ren:0,magneticInst:0,magneticRen:0,offline:0
    })),
    online: fill(['ONLINE'], (row) => ({
      instBt: row?.onInstBt || 0,
      instHy: row?.onInstHy || 0,
      instCo: row?.onInstCo || 0,
      instHa: row?.onInstHa || 0,
      renBt:  row?.onRenBt  || 0,
      renHy:  row?.onRenHy  || 0,
      renCo:  row?.onRenCo  || 0,
      renHa:  row?.onRenHa  || 0,
    }))[0]?.series || monthLabels.map(() => ({
      instBt:0,instHy:0,instCo:0,instHa:0,renBt:0,renHy:0,renCo:0,renHa:0
    })),
  };

  res.json(resp);
});