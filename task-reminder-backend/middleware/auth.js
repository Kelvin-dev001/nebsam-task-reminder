// Check if the user is authenticated (JWT-based)
exports.isAuthenticated = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ message: 'Not authenticated' });
};

// Check if the user is admin (JWT-based)
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin only' });
};