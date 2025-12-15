const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true, trim: true }, // <-- needed for SMS
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superuser'], default: 'user' },
  requiresPasswordChange: { type: Boolean, default: true },
  // OTP fields
  otpHash: { type: String },
  otpExpiresAt: { type: Date },
  otpAttempts: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);