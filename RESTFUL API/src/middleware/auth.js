const crypto = require('crypto');

// Middleware de autenticação baseado em token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    // Permitir acesso não autenticado mas marcar utilizador como null
    req.user = null;
    return next();
  }

  // Validação simples de token
  // Para demonstração, aceita qualquer token
  req.user = {
    id: crypto.createHash('md5').update(token).digest('hex').substring(0, 8),
    role: token.includes('admin') ? 'admin' : 'user',
    authenticated: true
  };

  next();
};

module.exports = {
  authenticateToken
};