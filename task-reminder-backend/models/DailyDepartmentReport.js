const mongoose = require('mongoose');

const govSubSchema = new mongoose.Schema({
  officeInstall: { type: Number, default: 0 },
  agentInstall: { type: Number, default: 0 },
  officeRenewal: { type: Number, default: 0 },
  agentRenewal: { type: Number, default: 0 },
  offline: { type: Number, default: 0 },
  checkups: { type: Number, default: 0 },
}, { _id: false });

const governorSchema = new mongoose.Schema({
  nebsam: { type: govSubSchema, default: () => ({}) },
  mockMombasa: { type: govSubSchema, default: () => ({}) },
  sinotrack: { type: govSubSchema, default: () => ({}) },
}, { _id: false });

const officeAgentSchema = new mongoose.Schema({
  officeInstall: { type: Number, default: 0 },
  agentInstall: { type: Number, default: 0 },
  officeRenewal: { type: Number, default: 0 },
  agentRenewal: { type: Number, default: 0 },
  offline: { type: Number, default: 0 },   // fuel, vtel
  checkups: { type: Number, default: 0 },  // fuel, vtel
}, { _id: false });

const radioSchema = new mongoose.Schema({
  officeSale: { type: Number, default: 0 },
  agentSale: { type: Number, default: 0 },
  officeRenewal: { type: Number, default: 0 },
  agentRenewal: { type: Number, default: 0 },
}, { _id: false });

const onlineSchema = new mongoose.Schema({
  installs: {
    bluetooth: { type: Number, default: 0 },
    hybrid: { type: Number, default: 0 },
    comprehensive: { type: Number, default: 0 },
    hybridAlarm: { type: Number, default: 0 },
  },
  renewals: {
    bluetooth: { type: Number, default: 0 },
    hybrid: { type: Number, default: 0 },
    comprehensive: { type: Number, default: 0 },
    hybridAlarm: { type: Number, default: 0 },
  }
}, { _id: false });

const trackingSchema = new mongoose.Schema({
  offlineVehicles: { type: Number, default: 0 },
  tracker1Install: { type: Number, default: 0 },
  tracker1Renewal: { type: Number, default: 0 },
  tracker2Install: { type: Number, default: 0 },
  tracker2Renewal: { type: Number, default: 0 },
  magneticInstall: { type: Number, default: 0 },
  magneticRenewal: { type: Number, default: 0 },
}, { _id: false });

const DailyDepartmentReportSchema = new mongoose.Schema({
  reportDate: { type: Date, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  showroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showroom', default: null },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, default: '' },

  tracking: { type: trackingSchema, default: undefined },
  speedGovernor: { type: governorSchema, default: undefined },
  radio: { type: radioSchema, default: undefined },
  fuel: { type: officeAgentSchema, default: undefined },
  vehicleTelematics: { type: officeAgentSchema, default: undefined },
  online: { type: onlineSchema, default: undefined },
}, { timestamps: true });

DailyDepartmentReportSchema.index({ reportDate: 1, departmentId: 1, showroomId: 1 }, { unique: true });

module.exports = mongoose.model('DailyDepartmentReport', DailyDepartmentReportSchema);