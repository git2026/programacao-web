/* Servidor Principal - Dashboard Analítico de Transportes */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import importRoutes from './routes/importRoutes.js';

// Porta do servidor
const PORT = process.env.PORT || 5000;

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Variaveis de ambiente em falta:', missingVars.join(', '));
  console.error('Por favor, verifique o ficheiro .env');
  process.exit(1);
}

// Configuração de caminhos para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// CORS: permite qualquer origem em dev, configurável em produção
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || false 
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));

// Garantir UTF-8 em respostas JSON (apenas para rotas da API)

app.use((req, res, next) => {
  // Apenas definir JSON para rotas da API que não são sendFile
  if (req.path.startsWith('/api/') && !req.path.endsWith('.html')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});


// Aumentar limite do body parser para permitir ficheiros CSV grandes (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Página de testes da API (útil para desenvolvimento)
app.get('/api-tester.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'api-tester.html'));
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Dashboard Transportes',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      import: '/api/import',
      apiTester: '/api-tester.html'
    }
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/import', importRoutes);

// Tratamento de erro 404
app.use((req, res) => {
  // Se for uma rota da API, retornar JSON
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(404).json({ error: 'Rota não encontrada' });
  } else {
    // Para outras rotas, retornar JSON também (ou HTML se necessário)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(404).json({ error: 'Rota não encontrada' });
  }
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Garantir que sempre retornamos JSON, não HTML
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Log detalhado do erro
  if (isDevelopment) {
    console.error('Erro:', {
      mensagem: err.message,
      stack: err.stack,
      caminho: req.path,
      metodo: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  // Resposta ao cliente (com detalhes condicionais)
  const errorResponse = {
    error: isDevelopment ? err.message : 'Algo correu mal!'
  };
  
  if (isDevelopment && err.stack) {
    errorResponse.details = err.stack;
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// Verificar conexão MySQL ao iniciar
pool.query('SELECT 1')
  .then(() => console.log('[Backend] MySQL conectado'))
  .catch(err => console.error('[Backend] Erro MySQL:', err.message));

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend] Servidor em execução em http://0.0.0.0:${PORT}`);
  console.log(`[Backend] API Tester: http://localhost:${PORT}/api-tester.html`);
  console.log(`[Backend] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

server.timeout = 30 * 60 * 1000;
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} - A encerrar...`);
  server.close(() => {
    pool.end(() => process.exit(0));
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));