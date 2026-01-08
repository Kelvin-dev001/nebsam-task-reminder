const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., Tracking, Speed Governor, Radio Calls...
  code: { type: String, required: true, unique: true, trim: true }, // e.g., TRACK, GOV, RADIO, FUEL, VTEL, ONLINE
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);