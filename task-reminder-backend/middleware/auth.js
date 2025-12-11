// Auth middleware with consistent RBAC helpers
exports.isAuthenticated = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ message: 'Not authenticated' });
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin only' });
};

exports.isAdminOrSuperuser = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superuser')) {
    return next();
  }
  return res.status(403).json({ message: 'Admin or Superuser only' });
};

exports.isSuperuser = (req, res, next) => {
  if (req.user && req.user.role === 'superuser') return next();
  return res.status(403).json({ message: 'Superuser only' });
};