const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  customerName: { type: String, default: '' },
  plateOrCompany: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  service: { type: String, required: true }, // department code or name
  issue: { type: String, required: true },
  status: { type: String, enum: ['new', 'assigned', 'resolved'], default: 'new' },
  assignedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);