export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. ${role} role required` });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');

