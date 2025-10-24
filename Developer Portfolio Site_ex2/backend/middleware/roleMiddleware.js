export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação obrigatória' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: `Acesso negado. Cargo de ${role} obrigatório` });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');

