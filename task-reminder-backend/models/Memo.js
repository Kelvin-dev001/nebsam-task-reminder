const mongoose = require('mongoose');

const memoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Per-user read state
  seenBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seenAt: { type: Date, default: Date.now }
  }],
  // Optional: scope audience (future)
  // audience: { type: String, enum: ['all', 'role:user', 'role:admin', 'dept:<id>'], default: 'all' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Memo', memoSchema);