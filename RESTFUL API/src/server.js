const express = require('express');
const path = require('path');
const { publicLimiter, authenticatedLimiter, loginLimiter } = require('./middleware/rateLimiting');
const { authenticateToken } = require('./middleware/auth');
const { paginationMiddleware } = require('./middleware/pagination');
const { cacheMiddleware } = require('./middleware/caching');
const { productsController, loginController } = require('./controllers');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Servir ficheiro HTML estático
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Endpoint de verificação de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Exercício Endpoint de login com rate limiting estrito
app.post('/api/auth/login', loginLimiter, loginController);

// Exercício Endpoint de produtos com funcionalidades integradas
app.get(
  '/api/products',
  publicLimiter, // Rate limiting primeiro
  authenticateToken, // Autenticação opcional
  paginationMiddleware, // Validação de paginação
  cacheMiddleware, // Consulta de cache
  productsController // Lógica de negócio
);

// Endpoint protegido de exemplo (usa rate limiter autenticado)
app.get(
  '/api/protected',
  authenticateToken,
  authenticatedLimiter,
  (req, res) => {
    res.json({
      message: 'Este é um endpoint protegido',
      user: req.user
    });
  }
);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

// Handler 404 - Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  Servidor RESTful API em execucao');
  console.log('========================================');
  console.log(`\n  URL: http://localhost:${PORT}`);
  console.log(`  Interface: http://localhost:${PORT}\n`);
});

module.exports = app;