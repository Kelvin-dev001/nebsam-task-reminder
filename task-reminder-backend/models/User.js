const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Email stays required/unique for staff, but we’ll allow customers to skip it by using a
    // dedicated "customer" role that can have a placeholder email if needed.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    username: { type: String, required: true, unique: true, trim: true },

    // Phone is central for OTP-based auth. Keep E.164 on frontend & backend validation.
    phone: { type: String, required: true, trim: true },

    // For existing flows, this holds the bcrypt hash.
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ['user', 'admin', 'superuser', 'customer'],
      default: 'user',
    },

    requiresPasswordChange: { type: Boolean, default: true },

    // OTP for any flow (signup, login verification, password reset)
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },

    // Phone verification state (for customers)
    isPhoneVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optional indexes for performance & uniqueness control
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);