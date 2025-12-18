const rateLimit = require('express-rate-limit');

// Implementação de Rate Limiting
// Rate limiter para endpoints públicos: 100 pedidos por 15 minutos
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados pedidos deste IP. Tente novamente mais tarde.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiter para utilizadores autenticados: 500 pedidos por 15 minutos
const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados pedidos. Tente novamente mais tarde.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiter para endpoint de login: 10 pedidos por 10 minutos
// Reduz significativamente o risco de ataques de força bruta
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas tentativas de login. Tente novamente mais tarde.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiter dinâmico baseado no role do utilizador
const dynamicLimiter = (req, res, next) => {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: req.user?.role === 'admin' ? 1000 : 100,
    standardHeaders: true,
    legacyHeaders: false
  });
  
  return limiter(req, res, next);
};

module.exports = {
  publicLimiter,
  authenticatedLimiter,
  loginLimiter,
  dynamicLimiter
};