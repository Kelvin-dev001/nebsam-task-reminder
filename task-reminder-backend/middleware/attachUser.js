const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = async function attachUser(req, res, next) {
  // If already set, continue
  if (req.user) return next();

  // Check Authorization header for JWT
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      // Optionally, fetch fresh user from DB
      const user = await User.findById(decoded._id);
      if (user) req.user = user;
    } catch (err) {
      // Invalid token, ignore and proceed
    }
  }
  next();
};