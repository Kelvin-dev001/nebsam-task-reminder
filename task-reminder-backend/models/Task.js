const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who assigned
  deadline: { type: Date },
  status: { type: String, enum: ['pending', 'in-progress', 'done', 'approved'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);