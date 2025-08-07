const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assigned user
  status: { type: String, enum: ['pending', 'done'], default: 'pending' }, // Only pending/done
  deadline: { type: Date }, // New field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);