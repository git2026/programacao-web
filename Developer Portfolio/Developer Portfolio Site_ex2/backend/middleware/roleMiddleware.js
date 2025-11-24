export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação obrigatória' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: `Acesso negado. Esta operação requer cargo de ${role}` });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');

// Middleware para permitir Admin OU Editor
export const requireAdminOrEditor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticação obrigatória' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({ error: `Acesso negado. Esta operação requer cargo de admin ou editor. O seu cargo atual é: ${req.user.role}` });
  }
  
  next();
};