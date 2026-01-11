const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  customerName: { type: String, default: '' },
  plateOrCompany: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  service: { type: String, required: true }, // department code or name
  issue: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);