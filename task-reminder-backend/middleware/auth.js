// Check if the user is authenticated (JWT-based)
exports.isAuthenticated = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ message: 'Not authenticated' });
};

// Check if the user is admin (or superuser)
exports.isAdminOrSuperuser = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superuser')) {
    return next();
  }
  return res.status(403).json({ message: 'Admin or Superuser only' });
};

// Check if the user is superuser
exports.isSuperuser = (req, res, next) => {
  if (req.user && req.user.role === 'superuser') {
    return next();
  }
  return res.status(403).json({ message: 'Superuser only' });
};