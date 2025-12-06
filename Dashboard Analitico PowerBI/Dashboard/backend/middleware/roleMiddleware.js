/*Middleware de Autorização por Roles para todas as rotas protegidas da API*/

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

// Atalho para admin (acesso total)
export const requireAdmin = requireRole('admin');

// Permitir admin ou editor (acesso total ou importação de dados)
export const requireAdminOrEditor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticação obrigatória' });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({ error: `Acesso negado. Esta operação requer cargo de admin ou editor. O seu cargo atual é: ${req.user.role}` });
  }
  next();
};

// Middleware flexível: aceita array de cargos permitidos
export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação obrigatória' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Acesso negado. Esta operação requer cargo de: ${allowedRoles.join(' ou ')}` 
      });
    }
    next();
  };
};