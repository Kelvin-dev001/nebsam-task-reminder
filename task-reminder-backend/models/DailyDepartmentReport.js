const mongoose = require('mongoose');

const trackingMetricsSchema = new mongoose.Schema({
  offlineVehicles: { type: Number, default: 0 },
  tracker1Install: { type: Number, default: 0 },
  tracker1Renewal: { type: Number, default: 0 },
  tracker2Install: { type: Number, default: 0 },
  tracker2Renewal: { type: Number, default: 0 },
  magneticInstall: { type: Number, default: 0 },
  magneticRenewal: { type: Number, default: 0 },
}, { _id: false });

const speedGovMetricsSchema = new mongoose.Schema({
  mockMombasaInstall: { type: Number, default: 0 },
  mockMombasaRenewal: { type: Number, default: 0 },
  nebsamInstall: { type: Number, default: 0 },
  nebsamRenewal: { type: Number, default: 0 },
}, { _id: false });

const radioMetricsSchema = new mongoose.Schema({
  unitSales: { type: Number, default: 0 },
  renewals: { type: Number, default: 0 },
}, { _id: false });

const fuelMetricsSchema = new mongoose.Schema({
  installations: { type: Number, default: 0 },
  renewals: { type: Number, default: 0 },
}, { _id: false });

const vtelMetricsSchema = new mongoose.Schema({
  installations: { type: Number, default: 0 },
  renewals: { type: Number, default: 0 },
}, { _id: false });

const onlineMetricsSchema = new mongoose.Schema({
  installationsByGadget: { type: Map, of: Number, default: {} }, // { "gadgetA": 3, "gadgetB": 1 }
  renewalsByGadget: { type: Map, of: Number, default: {} },
  dailyMessages: { type: Number, default: 0 },
  dailyCalls: { type: Number, default: 0 },
  dailySalesClosed: { type: Number, default: 0 },
}, { _id: false });

const dailyDepartmentReportSchema = new mongoose.Schema({
  reportDate: { type: Date, required: true }, // normalized to 00:00 UTC for the day
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  showroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showroom' }, // only for Tracking
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Metrics per department (only one populated per document depending on department)
  tracking: trackingMetricsSchema,
  speedGovernor: speedGovMetricsSchema,
  radio: radioMetricsSchema,
  fuel: fuelMetricsSchema,
  vehicleTelematics: vtelMetricsSchema,
  online: onlineMetricsSchema,

  notes: { type: String, trim: true },
  // Future-ready revenue
  revenue: {
    currency: { type: String, default: 'KES' },
    amount: { type: Number, default: 0 },
  }
}, { timestamps: true });

dailyDepartmentReportSchema.index({ reportDate: 1, departmentId: 1, showroomId: 1 }, { unique: true });

module.exports = mongoose.model('DailyDepartmentReport', dailyDepartmentReportSchema);