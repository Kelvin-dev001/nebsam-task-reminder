const mongoose = require('mongoose');
const showroomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, unique: true }, // optional unique code
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true }, // should point to Tracking dept
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Showroom', showroomSchema);