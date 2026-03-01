function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasRole = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to access this resource'
      });
    }
    next();
  };
}

module.exports = requireRole;
