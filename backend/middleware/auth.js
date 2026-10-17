/**
 * Authentication and Role-based Access Control Middleware
 */

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required. Please log in.' });
};

const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: ${roles.join(', ')}`
      });
    }

    return next();
  };
};

const isAdmin = hasRole('admin');

module.exports = {
  isAuthenticated,
  hasRole,
  isAdmin
};
